import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { clone, readJson } from './tool-experience.support.mjs';

/*
 * TP-08-03 — Journey storage / privacy functional test (tests/journey-storage.functional.mjs).
 *
 * Proves the verified-slot local session store (Feature 012 Scope 08) through the REAL
 * production rljourney runtime store API driven over the REAL production journeyStoragePolicy
 * from tool-experience.config.json. NO browser, NO request interception — an injected in-memory
 * provider stands in for the per-origin store; capability-disabled storage is a provider that
 * THROWS on write (a browser CAPABILITY refusal), never an intercepted network response.
 *
 * Covers SCN-012-009 (durable resume: a saved valid session restores prior context, completed
 * steps, evidence, and next-required step; a visit/creation alone is never a completed step),
 * verified pointer/slotA/slotB round-trip, corruption falling back to the REAL last-valid session
 * (not a fixture echo), future-version records left untouched, the maxSessionBytes limit,
 * session-only mode with safe export, forbidden-field privacy (runtime roots AND the config
 * policy layer), clear-only deletion, and zero mutation of unrelated storage keys.
 */

const require = createRequire(import.meta.url);
const RLJOURNEY_URL = new URL('../rljourney.js', import.meta.url);

function loadJourneyApi() {
  assert.equal(existsSync(RLJOURNEY_URL), true, 'production runtime missing: rljourney.js');
  const path = RLJOURNEY_URL.pathname;
  delete require.cache[require.resolve(path)];
  return require(path);
}

const RJ = loadJourneyApi();

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code} ${result.error.fieldPath} ${result.error.reason}`);
  return result.value;
}

function requireError(result, code) {
  assert.equal(result.ok, false, 'expected a refusal');
  assert.equal(RJ.REFUSAL_CODES.includes(result.error.code), true, `refusal code ${result.error.code} must be closed`);
  if (code) assert.equal(result.error.code, code, `${result.error.fieldPath} ${result.error.reason}`);
  return result.error;
}

function storagePolicy() {
  const policy = readJson('tool-experience.config.json').journeyStoragePolicy;
  assert.equal(policy.pointerKey, 'rlJourneySessionsV1.pointer', 'production pointer key');
  assert.deepEqual(policy.slotKeys, ['rlJourneySessionsV1.slotA', 'rlJourneySessionsV1.slotB'], 'production slot keys');
  return policy;
}

function compiledBreadth() {
  const compiledRegistry = requireValue(RJ.compileRegistry(readJson('journeys.json')));
  const compiled = compiledRegistry.definitions['journey/market-heatmap-lab/breadth/v1'];
  assert.ok(compiled, 'real breadth definition compiles');
  return compiled;
}

/* A real production session: create then (optionally) complete its single evidence step with
   recorded owner evidence — the SAME production code path a resumed session is rebuilt from. */
function buildSession(compiled, { complete, context, sessionId } = {}) {
  const stepId = compiled.order[0];
  let session = requireValue(RJ.createSession(compiled, {
    sessionId: sessionId || 'session/test/breadth-1',
    createdAt: '2026-07-26T10:00:00.000Z',
    context: context || { evidenceIdentity: 'sha256:owner-breadth-aaa' }
  }));
  if (complete) {
    session = requireValue(RJ.completeStep(session, stepId, {
      input: { acknowledgedEvidenceIds: ['breadth-1', 'concentration-1'] },
      evidence: [{ slot: 'owner-evidence', ref: 'owner:heatmap-2026-07-26', provenance: 'owner-evidence' }],
      conclusion: { branch: 'broad', note: 'leadership is broad' },
      completedAt: '2026-07-26T10:05:00.000Z'
    }));
  }
  return requireValue(RJ.serializeSession(session));
}

/* Map-backed provider standing in for the browser per-origin store. */
function makeProvider(seed) {
  const map = new Map(Object.entries(seed || {}));
  return {
    map,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)); },
    removeItem: (key) => { map.delete(key); }
  };
}

/* A provider whose writes THROW — a browser that has DISABLED local storage (capability), which is
   categorically different from request interception. */
function makeDisabledProvider() {
  return {
    getItem: () => { throw new Error('SecurityError: storage is disabled'); },
    setItem: () => { throw new Error('SecurityError: storage is disabled'); },
    removeItem: () => { throw new Error('SecurityError: storage is disabled'); }
  };
}

/* A provider that silently TRUNCATES writes — exercises the verified re-read contract. */
function makeLossyProvider() {
  const map = new Map();
  return {
    map,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value).slice(0, 8)); },
    removeItem: (key) => { map.delete(key); }
  };
}

test('TP-08-03 SCN-012-009 verified round-trip restores prior context, completed step, evidence, and next-required step', () => {
  const policy = storagePolicy();
  const compiled = compiledBreadth();
  const stepId = compiled.order[0];
  const record = buildSession(compiled, { complete: true });

  const provider = makeProvider({ 'rlProviderConfig': '{"proxy":null}' });
  const saved = requireValue(RJ.store.saveSession(provider, policy, record));
  assert.equal(saved.slot, 'A', 'first write lands in the inactive slot A');
  // Exactly the pointer + one slot are written; the unrelated key is untouched.
  assert.equal(provider.map.has(policy.pointerKey), true, 'pointer written');
  assert.equal(provider.map.has(policy.slotKeys[0]), true, 'slot A written');
  assert.equal(provider.map.has(policy.slotKeys[1]), false, 'slot B not written on the first save');
  assert.equal(provider.map.get('rlProviderConfig'), '{"proxy":null}', 'unrelated key untouched');

  const loaded = requireValue(RJ.store.loadSession(provider, policy));
  assert.equal(loaded.corrupt, false);
  const restored = requireValue(RJ.store.exportSession(provider, policy));
  assert.ok(restored.record, 'a durable record is present');

  // Restore through the production runtime and prove prior state is reproduced.
  const rebuilt = requireValue(RJ.restoreSession(compiled, loaded.record));
  assert.equal(rebuilt.context.evidenceIdentity, 'sha256:owner-breadth-aaa', 'prior context restored');
  assert.equal(rebuilt.steps[stepId].status, 'complete', 'completed step restored');
  assert.equal(rebuilt.steps[stepId].evidence.length, 1, 'recorded evidence restored');
  assert.equal(rebuilt.steps[stepId].evidence[0].slot, 'owner-evidence', 'evidence slot restored');
  assert.deepEqual(rebuilt.steps[stepId].conclusion, { branch: 'broad', note: 'leadership is broad' }, 'branch conclusion restored');
  assert.equal(rebuilt.nextRequiredStepId, null, 'no next step required after the single step completed');
  assert.equal(rebuilt.sessionFingerprint, record.sessionFingerprint, 'restored session fingerprint equals the saved production session');
});

test('TP-08-03 SCN-012-009 a visit or creation alone is never a completed step after persistence', () => {
  const policy = storagePolicy();
  const compiled = compiledBreadth();
  const stepId = compiled.order[0];
  // A session that was merely opened (no evidence recorded) — a visit, not a completion.
  const visited = buildSession(compiled, { complete: false });
  assert.equal(visited.steps[stepId].status, 'pending', 'an opened step starts pending');

  const provider = makeProvider();
  requireValue(RJ.store.saveSession(provider, policy, visited));
  const loaded = requireValue(RJ.store.loadSession(provider, policy));
  const rebuilt = requireValue(RJ.restoreSession(compiled, loaded.record));
  assert.notEqual(rebuilt.steps[stepId].status, 'complete', 'a visit is never restored as complete');
  assert.equal(rebuilt.steps[stepId].evidence.length, 0, 'no evidence was recorded');
  assert.equal(rebuilt.nextRequiredStepId, stepId, 'the visited step is still the next required step');
});

test('TP-08-03 corruption falls back to the REAL last-valid session, never a fixture echo', () => {
  const policy = storagePolicy();
  const compiled = compiledBreadth();
  const provider = makeProvider();

  // session1 (completed) then session2 (a DIFFERENT opened session) — both produced by production code.
  const session1 = buildSession(compiled, { complete: true, sessionId: 'session/lastvalid/1', context: { evidenceIdentity: 'sha256:owner-breadth-aaa' } });
  const session2 = buildSession(compiled, { complete: false, sessionId: 'session/lastvalid/2', context: { evidenceIdentity: 'sha256:owner-breadth-bbb', publicTargetId: 'pub-2' } });
  const saved1 = requireValue(RJ.store.saveSession(provider, policy, session1));
  const saved2 = requireValue(RJ.store.saveSession(provider, policy, session2));
  assert.equal(saved1.slot, 'A');
  assert.equal(saved2.slot, 'B', 'the second verified write uses the other slot');

  // Corrupt the ACTIVE slot B; the previous good session1 still lives in slot A.
  provider.map.set(policy.slotKeys[1], 'not-json {{{');
  const loaded = requireValue(RJ.store.loadSession(provider, policy));
  assert.equal(loaded.corrupt, true, 'the active slot was corrupt');
  assert.equal(loaded.slot, 'A', 'the store recovered the last-valid slot A');
  // The recovered record is the REAL production session1 (compared by its production fingerprint).
  assert.equal(loaded.record.sessionFingerprint, session1.sessionFingerprint, 'recovered the real last-valid session1, not a fixture');
  assert.notEqual(loaded.record.sessionFingerprint, session2.sessionFingerprint, 'did not silently return the corrupt session2');
  const rebuilt = requireValue(RJ.restoreSession(compiled, loaded.record));
  assert.equal(rebuilt.steps[compiled.order[0]].status, 'complete', 'the last-valid session1 was the completed one');
});

test('TP-08-03 future-version and unknown records are left untouched (never downgraded)', () => {
  const policy = storagePolicy();
  const compiled = compiledBreadth();
  const record = buildSession(compiled, { complete: true });

  // Save rejects a newer-version record outright.
  const future = clone(record);
  future.contractVersion = 'journey-session/v2';
  requireError(RJ.store.saveSession(makeProvider(), policy, future), 'RLJOURNEY-STORE');

  // A newer-version blob already in a slot is ignored on load and left byte-identical.
  const provider = makeProvider();
  const futurePayload = JSON.stringify(future);
  provider.map.set(policy.slotKeys[0], futurePayload);
  provider.map.set(policy.pointerKey, JSON.stringify({ active: 'A', fingerprint: 'sha256:whatever', bytes: futurePayload.length, updatedAt: null }));
  const loaded = requireValue(RJ.store.loadSession(provider, policy));
  assert.equal(loaded.record, null, 'a newer-version slot is not loaded as a current session');
  assert.equal(provider.map.get(policy.slotKeys[0]), futurePayload, 'the newer-version blob is left byte-identical (never downgraded or deleted)');
});

test('TP-08-03 verified write refuses a lossy (truncating) provider and preserves the last-valid session', () => {
  const policy = storagePolicy();
  const compiled = compiledBreadth();
  const record = buildSession(compiled, { complete: true });

  // First save into a GOOD provider (last-valid), then a lossy write must be refused, not accepted.
  const good = makeProvider();
  requireValue(RJ.store.saveSession(good, policy, record));

  const lossy = makeLossyProvider();
  requireError(RJ.store.saveSession(lossy, policy, record), 'RLJOURNEY-STORE');

  // On the good provider the last-valid session is still fully loadable.
  const loaded = requireValue(RJ.store.loadSession(good, policy));
  assert.equal(loaded.corrupt, false);
  assert.equal(loaded.record.sessionFingerprint, record.sessionFingerprint, 'last-valid session preserved');
});

test('TP-08-03 enforces the maxSessionBytes limit', () => {
  const policy = storagePolicy();
  const compiled = compiledBreadth();
  const record = buildSession(compiled, { complete: true });
  const tightPolicy = { ...policy, maxSessionBytes: 10 };
  requireError(RJ.store.saveSession(makeProvider(), tightPolicy, record), 'RLJOURNEY-STORE');
  // The real policy budget accepts the same session.
  requireValue(RJ.store.saveSession(makeProvider(), policy, record));
});

test('TP-08-03 session-only mode: disabled storage reports session-only, refuses durable save, and safe export still works', () => {
  const policy = storagePolicy();
  const compiled = compiledBreadth();
  const record = buildSession(compiled, { complete: true });
  const disabled = makeDisabledProvider();

  const capability = requireValue(RJ.store.capability(disabled, policy));
  assert.equal(capability.durable, false, 'disabled storage is not durable');
  assert.equal(capability.mode, 'session-only', 'session-only mode is reported');
  assert.equal(capability.reason, 'storage-unavailable');

  // A durable save is refused — no reload/durable claim is possible.
  requireError(RJ.store.saveSession(disabled, policy, record), 'RLJOURNEY-STORE');

  // Safe export of the live in-memory session remains available with NO provider.
  const exported = requireValue(RJ.store.exportRecord(policy, record));
  assert.equal(typeof exported.json, 'string');
  assert.equal(JSON.parse(exported.json).sessionFingerprint, record.sessionFingerprint, 'safe export carries the live session');
});

test('TP-08-03 a durable provider reports durable and probes leave no residue', () => {
  const policy = storagePolicy();
  const provider = makeProvider();
  const capability = requireValue(RJ.store.capability(provider, policy));
  assert.equal(capability.durable, true, 'a working provider is durable');
  assert.equal(capability.mode, 'durable');
  assert.equal(provider.map.size, 0, 'the capability probe removed its own key (no residue)');
});

test('TP-08-03 the store rejects sensitive fields via both the runtime roots and the config policy layer', () => {
  const policy = storagePolicy();
  const compiled = compiledBreadth();
  const record = buildSession(compiled, { complete: true });

  // Runtime privacy root ("position").
  const withPosition = clone(record);
  withPosition.position = { qty: 100 };
  requireError(RJ.store.saveSession(makeProvider(), policy, withPosition), 'RLJOURNEY-PRIVACY');

  // Config-only forbidden name ("privateTicker") — proves the store's config policy layer adds
  // coverage beyond the runtime roots (privateTicker is not a runtime FORBIDDEN_FIELD_ROOT).
  assert.equal(policy.forbiddenFieldNames.includes('privateTicker'), true, 'config forbids privateTicker');
  const withPrivateTicker = clone(record);
  withPrivateTicker.privateTicker = 'AAPL';
  requireError(RJ.store.saveSession(makeProvider(), policy, withPrivateTicker), 'RLJOURNEY-PRIVACY');
  // And the config layer also rejects it on the direct safe-export path.
  requireError(RJ.store.exportRecord(policy, withPrivateTicker), 'RLJOURNEY-PRIVACY');
});

test('TP-08-03 clear is the only deletion path and leaves unrelated keys intact', () => {
  const policy = storagePolicy();
  const compiled = compiledBreadth();
  const record = buildSession(compiled, { complete: true });
  const provider = makeProvider({
    rlProviderConfig: '{"proxy":"x"}',
    rlData: '{"resources":[]}',
    rlExperienceModeV1: 'power'
  });
  const before = new Map(provider.map);

  requireValue(RJ.store.saveSession(provider, policy, record));
  assert.equal(provider.map.has(policy.pointerKey), true);
  assert.equal(provider.map.has(policy.slotKeys[0]), true);

  requireValue(RJ.store.clearStore(provider, policy));
  assert.equal(provider.map.has(policy.pointerKey), false, 'pointer cleared');
  assert.equal(provider.map.has(policy.slotKeys[0]), false, 'slot A cleared');
  assert.equal(provider.map.has(policy.slotKeys[1]), false, 'slot B cleared');
  assert.equal(requireValue(RJ.store.loadSession(provider, policy)).record, null, 'nothing loads after clear');

  // Every unrelated key survives with its original byte value.
  for (const key of before.keys()) {
    assert.equal(provider.map.get(key), before.get(key), `unrelated key ${key} is byte-identical`);
  }
});

test('TP-08-03 save / load / export never mutate unrelated storage keys', () => {
  const policy = storagePolicy();
  const compiled = compiledBreadth();
  const record = buildSession(compiled, { complete: true });
  const unrelated = {
    rlProviderConfig: '{"proxy":"x"}',
    rlData: '{"resources":[{"resource":"SPY"}]}',
    rlExperienceModeV1: 'simple',
    someOtherAppKey: 'untouched-value'
  };
  const provider = makeProvider(unrelated);

  requireValue(RJ.store.saveSession(provider, policy, record));
  requireValue(RJ.store.loadSession(provider, policy));
  requireValue(RJ.store.exportSession(provider, policy));

  for (const [key, value] of Object.entries(unrelated)) {
    assert.equal(provider.map.get(key), value, `unrelated key ${key} was never mutated`);
  }
});
