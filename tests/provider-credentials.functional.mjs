// Regression: specs/_bugs/BUG-001-central-provider-credential-security
import assert from 'node:assert/strict';
import test from 'node:test';
import { createStorage, loadRldata } from './provider-credentials.support.mjs';

test('SCN-BUG001-002 every lifecycle signal clears current-document memory', async () => {
  const credential = 'controlled-test-value';
  const lifecycleSignals = [
    ['hashchange', {}],
    ['popstate', {}],
    ['pagehide', { persisted: true }],
    ['beforeunload', {}]
  ];

  for (const [type, detail] of lifecycleSignals) {
    const realm = loadRldata({ controlled: true });
    assert.equal(realm.api.authorizeCredential('controlled', credential).ok, true);
    assert.equal(realm.api.credentialStatus('controlled').state, 'configured');
    realm.dispatchLifecycle(type, detail);
    assert.equal(realm.api.credentialStatus('controlled').state, 'unconfigured');
    assert.deepEqual(realm.localStorage.snapshot(), {});
    assert.deepEqual(realm.sessionStorage.snapshot(), {});
  }

  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const firstRealm = loadRldata({ controlled: true, localStorage, sessionStorage });
  assert.equal(firstRealm.api.authorizeCredential('controlled', credential).ok, true);
  const secondRealm = loadRldata({ controlled: true, localStorage, sessionStorage });
  assert.equal(secondRealm.api.credentialStatus('controlled').state, 'unconfigured');
  assert.deepEqual(localStorage.snapshot(), {});
  assert.deepEqual(sessionStorage.snapshot(), {});

  assert.equal(firstRealm.api.clearCredential('controlled').ok, true);
  assert.equal(firstRealm.api.credentialStatus('controlled').state, 'unconfigured');
  assert.equal(firstRealm.api.authorizeCredential('controlled', credential).ok, true);
  const cleared = await firstRealm.api.clearAllCredentials();
  assert.equal(cleared.ok, true);
  assert.equal(cleared.runtimeState, 'unconfigured');
  assert.equal(JSON.stringify(cleared).includes(credential), false);
});