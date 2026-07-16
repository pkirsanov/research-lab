// Regression: specs/_bugs/BUG-001-central-provider-credential-security
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../rldata.js', import.meta.url), 'utf8');

const CONTROLLED_POLICY = `
    controlled: Object.freeze({
      id: "controlled",
      label: "Controlled test provider",
      note: "Test-only same-document policy",
      enrollmentUrl: "https://controlled.invalid/enroll",
      browserOriginAuthorization: "verified",
      authorizationEvidence: Object.freeze(["test-only-policy"]),
      authTransport: "header",
      authHeaderName: "X-Controlled-Test",
      requestOrigins: Object.freeze(["https://controlled.invalid"]),
      operations: Object.freeze({ ping: Object.freeze({ id: "ping" }) }),
      eligibleDocuments: Object.freeze(["index.html"]),
      cspProfile: "credential-capable-v1"
    }),`;

function createStorage() {
  const values = new Map();
  return {
    clear() { values.clear(); },
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    key(index) { return Array.from(values.keys())[index] ?? null; },
    get length() { return values.size; },
    removeItem(key) { values.delete(String(key)); },
    setItem(key, value) { values.set(String(key), String(value)); },
    snapshot() { return Object.fromEntries(values); }
  };
}

function loadRldata({ pathname = '/index.html', controlled = false } = {}) {
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const root = {
    addEventListener() {},
    dispatchEvent() {},
    location: { pathname, protocol: 'https:' }
  };
  const runtimeSource = controlled
    ? source.replace('var PROVIDER_POLICIES = Object.freeze({', 'var PROVIDER_POLICIES = Object.freeze({' + CONTROLLED_POLICY)
    : source;
  if (controlled) assert.notEqual(runtimeSource, source, 'controlled policy injection must alter only the test-evaluated source');
  const api = Function(
    'globalThis',
    'window',
    'localStorage',
    'sessionStorage',
    'fetch',
    'location',
    'document',
    `${runtimeSource}\nreturn globalThis.RLDATA;`
  )(root, root, localStorage, sessionStorage, undefined, root.location, undefined);
  return { api, localStorage, sessionStorage };
}

test('SCN-BUG001-001 current-document runtime has no serialized store or raw credential API', () => {
  const credential = 'controlled-test-value';
  const { api, localStorage, sessionStorage } = loadRldata();
  const forbiddenApi = [
    'key',
    'keys',
    'hasKey',
    'setKey',
    'clearAllKeys',
    'buildProviderRequest',
    'providerFetch',
    'migrateLegacyCredentials'
  ];

  for (const name of forbiddenApi) assert.equal(typeof api[name], 'undefined', `${name} must not be public`);
  for (const name of ['providerPolicies', 'credentialStatus', 'authorizeCredential', 'useCredential', 'clearCredential', 'clearAllCredentials']) {
    assert.equal(typeof api[name], 'function', `${name} must be owned by the shared capability`);
  }

  const policies = api.providerPolicies();
  assert.equal(Object.isFrozen(policies), true);
  assert.equal(policies.length > 0, true);
  assert.equal(policies.every((policy) => Object.isFrozen(policy) && policy.state === 'disabled'), true);

  const status = api.credentialStatus('finnhub');
  assert.equal(Object.isFrozen(status), true);
  assert.deepEqual(status, {
    ok: true,
    providerId: 'finnhub',
    state: 'disabled',
    lifetime: 'current-document-memory',
    reasonCode: 'PROVIDER_DISABLED'
  });

  const rejected = api.authorizeCredential('finnhub', credential);
  assert.equal(Object.isFrozen(rejected), true);
  assert.deepEqual(rejected, {
    ok: false,
    providerId: 'finnhub',
    state: 'disabled',
    reasonCode: 'PROVIDER_DISABLED'
  });
  assert.equal(JSON.stringify(rejected).includes(credential), false);
  assert.deepEqual(localStorage.snapshot(), {});
  assert.deepEqual(sessionStorage.snapshot(), {});

  for (const identifier of ['CREDENTIAL_STORE_KEY', 'storageSurface', 'readCredentialEnvelope', 'writeCredentialEnvelope', 'getKey']) {
    assert.equal(source.includes(identifier), false, `${identifier} must be removed from production source`);
  }
});

test('SCN-BUG001-005 unknown and prototype-shaped providers preserve runtime and prototypes', async () => {
  const credential = 'controlled-test-value';
  const { api, localStorage, sessionStorage } = loadRldata({ controlled: true });
  const policyBefore = JSON.stringify(api.providerPolicies());
  const objectPrototypeBefore = Object.getOwnPropertyNames(Object.prototype).sort();
  const functionPrototypeBefore = Object.getOwnPropertyNames(Function.prototype).sort();

  const configured = api.authorizeCredential('controlled', credential);
  assert.equal(configured.ok, true);
  assert.equal(api.credentialStatus('controlled').state, 'configured');

  const rogueIds = ['unknown', '', 'toString', 'constructor', '__proto__'];
  for (const providerId of rogueIds) {
    for (const result of [
      api.credentialStatus(providerId),
      api.authorizeCredential(providerId, credential),
      api.clearCredential(providerId),
      await api.useCredential(providerId, 'ping', {})
    ]) {
      assert.equal(Object.isFrozen(result), true);
      assert.equal(result.ok, false);
      assert.equal(result.reasonCode, 'UNKNOWN_PROVIDER');
      assert.equal(JSON.stringify(result).includes(credential), false);
    }
  }

  for (const operationId of rogueIds) {
    const result = await api.useCredential('controlled', operationId, {});
    assert.equal(Object.isFrozen(result), true);
    assert.equal(result.ok, false);
    assert.equal(result.reasonCode, 'UNKNOWN_OPERATION');
  }

  assert.equal(api.credentialStatus('controlled').state, 'configured');
  assert.equal(JSON.stringify(api.providerPolicies()), policyBefore);
  assert.deepEqual(localStorage.snapshot(), {});
  assert.deepEqual(sessionStorage.snapshot(), {});
  assert.deepEqual(Object.getOwnPropertyNames(Object.prototype).sort(), objectPrototypeBefore);
  assert.deepEqual(Object.getOwnPropertyNames(Function.prototype).sort(), functionPrototypeBefore);
});