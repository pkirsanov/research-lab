// Regression: specs/_bugs/BUG-002-two-tier-provider-access (supersedes BUG-001)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { LEGACY_LOCAL_NAMES, LEGACY_SESSION_NAMES } from './provider-credentials.support.mjs';

const source = readFileSync(new URL('../rldata.js', import.meta.url), 'utf8');

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

function loadRldata({ pathname = '/index.html', localStorage: suppliedLocalStorage = null, sessionStorage: suppliedSessionStorage = null } = {}) {
  const localStorage = suppliedLocalStorage || createStorage();
  const sessionStorage = suppliedSessionStorage || createStorage();
  const requests = [];
  const fetchStub = (...args) => {
    requests.push(args);
    return Promise.reject(new Error('no network in unit test'));
  };
  const root = {
    addEventListener() {},
    dispatchEvent() {},
    location: { pathname, protocol: 'https:' }
  };
  const api = Function(
    'globalThis',
    'window',
    'localStorage',
    'sessionStorage',
    'fetch',
    'location',
    'document',
    `${source}\nreturn globalThis.RLDATA;`
  )(root, root, localStorage, sessionStorage, fetchStub, root.location, undefined);
  return { api, localStorage, requests, sessionStorage };
}

test('SCN-BUG002-001 providers start unconfigured; two-tier API present; local key configures then clears', () => {
  const { api, localStorage, sessionStorage } = loadRldata();
  // The BUG-001 lockdown API is gone; the two-tier API is present.
  for (const name of ['credentialStatus', 'authorizeCredential', 'useCredential', 'clearCredential', 'clearAllCredentials']) {
    assert.equal(typeof api[name], 'undefined', `${name} (BUG-001 API) must be removed`);
  }
  for (const name of ['providerFetch', 'providerAccess', 'providerStatus', 'providerPolicies', 'setKey', 'clearKey', 'setProxyBaseUrl', 'clearAllProviderConfig', 'recheckProxy', 'setForceLocal']) {
    assert.equal(typeof api[name], 'function', `${name} must be exposed by the two-tier data layer`);
  }

  // Fresh browser: every provider is unconfigured (not disabled), keyed.
  const policies = api.providerPolicies();
  assert.equal(Object.isFrozen(policies), true);
  assert.equal(policies.length, 4);
  assert.equal(policies.every((p) => Object.isFrozen(p) && p.state === 'unconfigured' && p.keyed === true), true);

  // A local key configures a provider (Tier-2), stored ONLY in rlProviderConfig of this browser.
  const key = 'unit-local-sentinel';
  const set = api.setKey('finnhub', key);
  assert.equal(set.ok, true);
  assert.equal(api.providerStatus('finnhub').state, 'configured');
  assert.equal(api.providerStatus('finnhub').localConfigured, true);
  const stored = JSON.parse(localStorage.getItem('rlProviderConfig'));
  assert.equal(stored.keys.finnhub, key, 'the local key persists only in rlProviderConfig');
  assert.deepEqual(sessionStorage.snapshot(), {}, 'no key touches sessionStorage');

  // The key value is never exposed by status/access surfaces.
  assert.equal(JSON.stringify(api.providerAccess()).includes(key), false, 'providerAccess never returns the key value');
  assert.equal(JSON.stringify(api.providerStatus('finnhub')).includes(key), false, 'providerStatus never returns the key value');

  // Clear resets everything.
  assert.equal(api.clearAllProviderConfig().ok, true);
  assert.equal(api.providerStatus('finnhub').state, 'unconfigured');

  // The removed BUG-001 internals are gone from production source.
  for (const identifier of ['_credentialRuntime', 'PROVIDER_POLICIES', 'providerEligible', 'installCredentialLifecycle']) {
    assert.equal(source.includes(identifier), false, `${identifier} must be removed from production source`);
  }
});

test('SCN-BUG002-004 fail-closed transport and prototype-safe unknown providers', async () => {
  const { api, localStorage, requests } = loadRldata();
  const objectPrototypeBefore = Object.getOwnPropertyNames(Object.prototype).sort();
  const functionPrototypeBefore = Object.getOwnPropertyNames(Function.prototype).sort();

  // No proxy + no local key -> providerFetch rejects fail-closed (no request, no fallback).
  await assert.rejects(api.providerFetch('twelvedata', 'time_series?symbol=SPY'), /PROVIDER_KEY_MISSING/);
  const configBefore = localStorage.snapshot();

  // Unknown and prototype-shaped provider identifiers reject without mutation.
  for (const rogue of ['unknown', '', 'toString', 'constructor', '__proto__', 'prototype']) {
    await assert.rejects(api.providerFetch(rogue, 'x'), /unknown provider/);
    assert.equal(api.providerStatus(rogue).reasonCode, 'UNKNOWN_PROVIDER');
    assert.equal(api.setKey(rogue, 'x').reasonCode, 'UNKNOWN_PROVIDER');
    assert.equal(api.clearKey(rogue).reasonCode, 'UNKNOWN_PROVIDER');
  }

  assert.deepEqual(Object.getOwnPropertyNames(Object.prototype).sort(), objectPrototypeBefore);
  assert.deepEqual(Object.getOwnPropertyNames(Function.prototype).sort(), functionPrototypeBefore);
  assert.deepEqual(localStorage.snapshot(), configBefore, 'unknown providers must not mutate provider configuration');
  assert.deepEqual(requests, [], 'missing, unknown, and prototype-shaped providers must fail before transport access');
});

test('SCN-BUG001-004 legacy registry excludes BUG-002 provider configuration', () => {
  const { api, localStorage, sessionStorage } = loadRldata();
  const currentProviderConfig = '{"v":1,"proxyBaseUrl":"https://proxy.current.invalid","keys":{"finnhub":"current-key"}}';
  const currentDataCache = '{"v":1,"bars":{"SPY":{"1d":{"at":1,"rows":[]}}}}';

  localStorage.setItem('rlProviderConfig', currentProviderConfig);
  localStorage.setItem('rlData', currentDataCache);
  localStorage.setItem('unknownCredentialContainer', 'unknown-local-value');
  sessionStorage.setItem('unknownSessionCredentialContainer', 'unknown-session-value');
  LEGACY_LOCAL_NAMES.forEach((name) => localStorage.setItem(name, `legacy-local-${name}`));
  LEGACY_SESSION_NAMES.forEach((name) => sessionStorage.setItem(name, `legacy-session-${name}`));

  assert.equal(typeof api.detectLegacyCredentialContainers, 'function');
  assert.equal(typeof api.eraseLegacyCredentialContainers, 'function');
  assert.deepEqual(api.detectLegacyCredentialContainers(), {
    status: 'detected',
    detected: true,
    providerIds: ['alphavantage', 'finnhub', 'shared', 'twelvedata'],
    locationClasses: ['legacy-central-config', 'legacy-scalar-key', 'legacy-session-config', 'legacy-tool-state'],
    containerCount: LEGACY_LOCAL_NAMES.length + LEGACY_SESSION_NAMES.length,
    unavailableStorageClasses: []
  });

  const result = api.eraseLegacyCredentialContainers();
  assert.deepEqual(result, {
    ok: true,
    status: 'complete',
    removedContainerCount: LEGACY_LOCAL_NAMES.length + LEGACY_SESSION_NAMES.length,
    remainingProviderIds: [],
    remainingLocationClasses: [],
    remainingContainerCount: 0,
    code: null
  });
  LEGACY_LOCAL_NAMES.forEach((name) => assert.equal(localStorage.getItem(name), null, `${name} must be erased by exact name`));
  LEGACY_SESSION_NAMES.forEach((name) => assert.equal(sessionStorage.getItem(name), null, `${name} must be erased by exact name`));
  assert.equal(localStorage.getItem('rlProviderConfig'), currentProviderConfig, 'BUG-002 provider configuration must remain byte-for-byte unchanged');
  assert.equal(localStorage.getItem('rlData'), currentDataCache, 'non-secret rlData must remain byte-for-byte unchanged');
  assert.equal(localStorage.getItem('unknownCredentialContainer'), 'unknown-local-value', 'unknown local containers must not be selected');
  assert.equal(sessionStorage.getItem('unknownSessionCredentialContainer'), 'unknown-session-value', 'unknown session containers must not be selected');
});

test('SCN-BUG001-004 inaccessible legacy storage never becomes a false clear result', () => {
  const inaccessible = {
    get length() { throw new Error('SecurityError: storage unavailable'); },
    key() { throw new Error('SecurityError: storage unavailable'); },
    getItem() { throw new Error('SecurityError: storage unavailable'); },
    setItem() { throw new Error('SecurityError: storage unavailable'); },
    removeItem() { throw new Error('SecurityError: storage unavailable'); }
  };
  const { api } = loadRldata({ localStorage: inaccessible, sessionStorage: inaccessible });
  assert.deepEqual(api.detectLegacyCredentialContainers(), {
    status: 'unavailable',
    detected: false,
    providerIds: [],
    locationClasses: [],
    containerCount: 0,
    unavailableStorageClasses: ['localStorage', 'sessionStorage']
  });
});