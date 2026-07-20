// Regression: specs/_bugs/BUG-002-two-tier-provider-access (supersedes BUG-001)
import assert from 'node:assert/strict';
import test from 'node:test';
import { createStorage, loadRldata } from './provider-credentials.support.mjs';

test('SCN-BUG002-002 local keys persist across lifecycle signals (Tier-2 is durable, not memory-only)', () => {
  const key = 'functional-local-sentinel';
  for (const type of ['hashchange', 'popstate', 'pagehide', 'beforeunload']) {
    const realm = loadRldata();
    assert.equal(realm.api.setKey('finnhub', key).ok, true);
    assert.equal(realm.api.providerStatus('finnhub').state, 'configured');
    realm.dispatchLifecycle(type, { persisted: true });
    // New contract: navigation/lifecycle does NOT clear the local key (opposite of BUG-001).
    assert.equal(realm.api.providerStatus('finnhub').state, 'configured', `${type} must not clear the persisted local key`);
    assert.deepEqual(realm.sessionStorage.snapshot(), {}, 'no key ever touches sessionStorage');
  }
});

test('SCN-BUG002-002b same browser shares keys across pages; separate browsers stay isolated', () => {
  const key = 'shared-across-pages';
  const localStorage = createStorage();
  const sessionStorage = createStorage();

  // Same browser (shared localStorage): a key set on one page is visible on another.
  const pageOne = loadRldata({ localStorage, sessionStorage, pathname: '/index.html' });
  assert.equal(pageOne.api.setKey('twelvedata', key).ok, true);
  const pageTwo = loadRldata({ localStorage, sessionStorage, pathname: '/sector-research-lab.html' });
  assert.equal(pageTwo.api.providerStatus('twelvedata').state, 'configured', 'a key set on one page is visible on another page of the same browser');

  // Separate browser (separate localStorage): user B never sees user A's key.
  const otherBrowser = loadRldata({ localStorage: createStorage(), sessionStorage: createStorage() });
  assert.equal(otherBrowser.api.providerStatus('twelvedata').state, 'unconfigured', 'a separate browser does not see another browser key');
  assert.equal(JSON.stringify(otherBrowser.api.providerAccess()).includes(key), false, 'a separate browser never receives the key value');

  // clearKey removes it for this browser only.
  assert.equal(pageOne.api.clearKey('twelvedata').ok, true);
  const pageThree = loadRldata({ localStorage, sessionStorage });
  assert.equal(pageThree.api.providerStatus('twelvedata').state, 'unconfigured', 'clearKey removes the key for this browser');
  assert.deepEqual(sessionStorage.snapshot(), {}, 'keys never touch sessionStorage');
});