import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { ROOT, createStorage, fixture } from './portfolio-survival.support.mjs';

const require = createRequire(import.meta.url);
const NOW = '2026-07-15T14:00:00.000Z';
const MODULE_PATH = resolve(ROOT, 'rlportfolio.js');
const POLICY_PATH = resolve(ROOT, 'portfolio-survival-allocation.config.json');

function loadRuntime() {
  assert.equal(existsSync(MODULE_PATH), true, 'RLPORTFOLIO production module must exist');
  assert.equal(existsSync(POLICY_PATH), true, 'mandatory portfolio policy must exist');
  const api = require('../rlportfolio.js');
  const policy = JSON.parse(readFileSync(POLICY_PATH, 'utf8'));
  assert.equal(api.validatePolicy(policy).ok, true);
  return { api, policy };
}

function candidateFromCsv(api, policy, workspace, name, now = NOW) {
  const preview = api.validateImport('csv', fixture('valid-portfolio.csv'), workspace, policy);
  assert.equal(preview.ok, true);
  const resolved = api.resolveDuplicates(preview.value, 'merge');
  assert.equal(resolved.ok, true);
  return api.buildWorkspaceCandidate(resolved.value, workspace, { name, now }, policy);
}

// The storage keys the policy declares, read from the policy that declares them rather
// than written out as a literal list, so adding a key is a deliberate policy change and
// not invisible test drift. The two `.probe` keys are deliberately NOT declared: probeStorage
// removes its probe on both its success and its failure path, so a surviving probe key is
// itself a leak these assertions must catch rather than tolerate.
function declaredStorageKeys(policy) {
  return {
    local: [
      policy.storage.pointerKey,
      ...policy.storage.slotKeys,
      policy.storage.quarantineKey,
      policy.storage.returnContextKey
    ].slice().sort(),
    session: [policy.storage.sessionKey].slice().sort()
  };
}

// Names every stored key the policy does not declare. A prefix test cannot do this: a new
// key under the declared namespace still matches the prefix, so only the declared SET can
// detect one. Keys are returned, never values, so a failure names the leaked key without
// printing stored holding or mandate content.
function undeclaredKeys(storage, declared) {
  return Object.keys(storage.snapshot()).filter((key) => !declared.includes(key)).sort();
}

test('real-format import previews commits reloads and exports one local revision', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  const candidate = candidateFromCsv(api, policy, opened.value.workspace, 'Long horizon research');
  assert.equal(candidate.ok, true);
  const committed = store.commitWorkspace(candidate.value, opened.value.workspace.generation, NOW);
  assert.equal(committed.ok, true);
  const reloaded = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T14:01:00.000Z');
  assert.equal(reloaded.ok, true);
  assert.equal(reloaded.value.workspace.currentPortfolioId, committed.value.workspace.currentPortfolioId);
  assert.equal(reloaded.value.workspace.portfolioRevisions.length, 1);
  assert.equal(reloaded.value.workspace.portfolioRevisions[0].holdings.length, 2);
  assert.equal(reloaded.value.storageState.lastVerifiedWrite, true);
  const previewExport = api.exportPreview({ portfolio: reloaded.value.workspace.portfolioRevisions[0] });
  const privateExport = api.exportPrivate({ portfolio: reloaded.value.workspace.portfolioRevisions[0] });
  assert.equal(previewExport.value.personalValuesIncluded, false);
  assert.equal(privateExport.value.warning, 'Private local export - review the destination before saving');
  assert.equal(privateExport.value.mimeType, 'application/json');
});

test('secret-bearing import is redacted and cannot mutate any storage namespace', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const first = store.commitWorkspace(candidateFromCsv(api, policy, store.openWorkspace(NOW).value.workspace, 'Current portfolio').value, 0, NOW);
  assert.equal(first.ok, true);
  const before = JSON.stringify(localStorage.snapshot());
  const sentinel = 'SCOPE01-FUNCTIONAL-PRIVATE-' + Date.now();
  const invalid = api.validateImport('csv', fixture('invalid-secret-portfolio.csv').replaceAll('__PRIVATE_SENTINEL__', sentinel), first.value.workspace, policy);
  assert.equal(invalid.ok, true);
  assert.equal(invalid.value.canConfirm, false);
  assert.equal(invalid.value.errors.some((error) => error.code === 'P008-IMPORT-SECRET'), true);
  assert.equal(JSON.stringify(invalid.value.errors).includes(sentinel), false);
  assert.equal(JSON.stringify(localStorage.snapshot()), before);
  assert.equal(JSON.stringify(sessionStorage.snapshot()).includes(sentinel), false);
  assert.equal(store.openWorkspace(NOW).value.workspace.currentPortfolioId, first.value.workspace.currentPortfolioId);
});

test('atomic write failures preserve the active pointer and retain a validated candidate only in memory', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage: createStorage() }, policy);
  const first = store.commitWorkspace(candidateFromCsv(api, policy, store.openWorkspace(NOW).value.workspace, 'First revision').value, 0, NOW);
  assert.equal(first.ok, true);
  const pointerBefore = localStorage.getItem('rlPortfolioWorkspaceV1.pointer');
  localStorage.failSet('rlPortfolioWorkspaceV1.pointer');
  const second = candidateFromCsv(api, policy, first.value.workspace, 'Second revision', '2026-07-15T14:02:00.000Z');
  const result = store.commitWorkspace(second.value, 1, '2026-07-15T14:02:00.000Z');
  assert.equal(result.ok, false);
  assert.equal(result.error.reason, 'pointer-write-failed');
  assert.equal(localStorage.getItem('rlPortfolioWorkspaceV1.pointer'), pointerBefore);
  assert.equal(store.openWorkspace(NOW).value.workspace.currentPortfolioId, first.value.workspace.currentPortfolioId);
  assert.equal(store.currentMemoryWorkspace().currentPortfolioId, second.value.currentPortfolioId);
  assert.equal(JSON.stringify(result.error).includes('Second revision'), false);
});

test('session and memory commits state truthfully and preserve the last valid candidate after rejection', () => {
  const { api, policy } = loadRuntime();
  const blockedDurable = createStorage({ failSet: ['rlPortfolioWorkspaceV1.probe'] });
  const sessionStorage = createStorage();
  const sessionStore = api.createPortfolioStore({ localStorage: blockedDurable, sessionStorage }, policy);
  const sessionOpen = sessionStore.openWorkspace(NOW);
  const sessionCommit = sessionStore.commitWorkspace(candidateFromCsv(api, policy, sessionOpen.value.workspace, 'Session revision').value, 0, NOW);
  assert.equal(sessionCommit.ok, true);
  assert.equal(sessionCommit.value.storageState.mode, 'session');
  assert.equal(sessionCommit.value.storageState.savedDurably, false);
  const sessionReload = api.createPortfolioStore({ localStorage: blockedDurable, sessionStorage }, policy).openWorkspace(NOW);
  assert.equal(sessionReload.value.workspace.currentPortfolioId, sessionCommit.value.workspace.currentPortfolioId);
  const blockedSession = createStorage({ failSet: ['rlPortfolioWorkspaceSessionV1.probe'] });
  const memoryStore = api.createPortfolioStore({ localStorage: blockedDurable, sessionStorage: blockedSession }, policy);
  const memoryOpen = memoryStore.openWorkspace(NOW);
  const memoryCommit = memoryStore.commitWorkspace(candidateFromCsv(api, policy, memoryOpen.value.workspace, 'Memory revision').value, 0, NOW);
  assert.equal(memoryCommit.ok, true);
  assert.equal(memoryCommit.value.storageState.mode, 'memory');
  const invalid = api.validateImport('csv', fixture('invalid-secret-portfolio.csv'), memoryCommit.value.workspace, policy);
  assert.equal(invalid.value.canConfirm, false);
  assert.equal(memoryStore.currentMemoryWorkspace().currentPortfolioId, memoryCommit.value.workspace.currentPortfolioId);
});

test('hostile manual labels remain inert data and namespace writes stay closed', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage: createStorage() }, policy);
  const preview = api.validateImport('json', fixture('manual-alternative.json'), null, policy);
  assert.equal(preview.ok, true);
  const candidate = api.buildWorkspaceCandidate(preview.value, store.openWorkspace(NOW).value.workspace, { name: 'Manual sleeve', now: NOW }, policy);
  const committed = store.commitWorkspace(candidate.value, 0, NOW);
  assert.equal(committed.ok, true);
  assert.equal(committed.value.workspace.portfolioRevisions[0].holdings[0].label, 'Private credit sleeve <script>not executable</script>');
  assert.equal(committed.value.workspace.portfolioRevisions[0].holdings[0].lifecycleState, 'manual');

  // The durable image is compared against the policy-declared key SET, not a name prefix.
  // A prefix test is inert against the failure that matters here: a key added under the
  // declared namespace still matches the prefix, so a new write is indistinguishable from
  // a declared one. The declared set is derived from the policy so a future key must be
  // declared there first.
  const declaredKeys = declaredStorageKeys(policy);
  assert.deepEqual(
    undeclaredKeys(localStorage, declaredKeys.local),
    [],
    'a commit must write no durable key outside the policy-declared set'
  );
  assert.equal(
    Object.keys(localStorage.snapshot()).includes(policy.storage.pointerKey),
    true,
    'an empty durable image would satisfy the declared-set check vacuously'
  );
  assert.equal(localStorage.getItem('rlData'), null);
  assert.equal(localStorage.getItem('rlApiKeys'), null);
});

function mandateFixture(name) {
  return JSON.parse(fixture(name));
}

// Commits a portfolio then an explicit mandate over the same durable storage, so a
// later reload reads real bytes rather than the in-process candidate object.
function seedMandateWorkspace(api, policy, localStorage, sessionStorage) {
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  const portfolio = store.commitWorkspace(
    candidateFromCsv(api, policy, opened.value.workspace, 'Mandate round trip portfolio').value,
    opened.value.workspace.generation,
    NOW
  );
  assert.equal(portfolio.ok, true);
  const draft = api.validateMandateDraft(mandateFixture('mandate-explicit.json'), portfolio.value.workspace, { now: NOW }, policy);
  assert.equal(draft.ok, true);
  assert.equal(draft.value.canConfirm, true);
  const candidate = api.buildMandateCandidate(draft.value, portfolio.value.workspace, { now: NOW }, policy);
  assert.equal(candidate.ok, true);
  const committed = store.commitWorkspace(candidate.value, portfolio.value.workspace.generation, NOW);
  assert.equal(committed.ok, true);
  return { store, portfolio: portfolio.value, committed: committed.value };
}

test('explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const { portfolio, committed } = seedMandateWorkspace(api, policy, localStorage, sessionStorage);

  // The mandate commit must add a revision without touching the portfolio identity.
  assert.equal(committed.workspace.currentPortfolioId, portfolio.workspace.currentPortfolioId);
  assert.deepEqual(committed.workspace.portfolioRevisions, portfolio.workspace.portfolioRevisions);
  assert.equal(committed.workspace.generation, portfolio.workspace.generation + 1);
  assert.equal(committed.storageState.mode, 'durable');
  assert.equal(committed.storageState.lastVerifiedWrite, true);

  // The mandate id must be present in the durable bytes, so the reload below cannot
  // be satisfied by an in-process candidate object.
  const durableBytes = JSON.stringify(localStorage.snapshot());
  assert.equal(durableBytes.includes(committed.workspace.currentMandateId), true, 'mandate id must reach durable storage');
  assert.equal(JSON.stringify(sessionStorage.snapshot()).includes(committed.workspace.currentMandateId), false);

  const reloaded = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T14:05:00.000Z');
  assert.equal(reloaded.ok, true);
  const durable = reloaded.value.workspace;
  assert.equal(durable.currentMandateId, committed.workspace.currentMandateId);
  assert.match(durable.currentMandateId, /^sha256:[a-f0-9]{64}$/);
  assert.equal(durable.mandateRevisions.length, 1);
  assert.deepEqual(durable.mandateRevisions, committed.workspace.mandateRevisions);
  assert.equal(api.validateMandateRevision(durable.mandateRevisions[0], policy).ok, true);
  assert.equal(api.validateWorkspace(durable, policy).ok, true);

  // Portfolio generation semantics survive the mandate write.
  assert.equal(durable.currentPortfolioId, portfolio.workspace.currentPortfolioId);
  assert.equal(durable.portfolioRevisions.length, 1);
  assert.deepEqual(durable.portfolioRevisions, portfolio.workspace.portfolioRevisions);
  assert.equal(durable.generation, committed.workspace.generation);

  // A stale generation must still be rejected after the mandate write.
  const reloadedStore = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const stale = reloadedStore.openWorkspace('2026-07-15T14:06:00.000Z');
  const revisedDraft = api.validateMandateDraft(
    { ...mandateFixture('mandate-explicit.json'), objectiveLabel: 'Second explicit objective' },
    stale.value.workspace,
    { now: '2026-07-15T14:06:00.000Z' },
    policy
  );
  const revisedCandidate = api.buildMandateCandidate(revisedDraft.value, stale.value.workspace, { now: '2026-07-15T14:06:00.000Z' }, policy);
  assert.equal(revisedCandidate.ok, true);

  // A rejected write must leave the prior mandate EXACTLY intact. An unchanged pointer
  // is not enough: a half-applied commit can land a slot write and still leave the
  // pointer alone, so the whole durable image is compared byte-for-byte. Booleans are
  // asserted rather than the images themselves so a failure names the defect instead of
  // printing stored mandate content.
  const durableBytesBeforeRejection = JSON.stringify(localStorage.snapshot());
  const conflicted = reloadedStore.commitWorkspace(revisedCandidate.value, durable.generation - 1, '2026-07-15T14:06:00.000Z');
  assert.equal(conflicted.ok, false);
  assert.equal(conflicted.error.reason, 'generation-conflict');
  assert.equal(
    JSON.stringify(localStorage.snapshot()) === durableBytesBeforeRejection,
    true,
    'a rejected mandate write must not change one durable byte'
  );
  assert.equal(
    JSON.stringify(localStorage.snapshot()).includes(revisedCandidate.value.currentMandateId),
    false,
    'the rejected mandate id must never reach durable storage'
  );
  const afterRejection = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T14:07:00.000Z').value.workspace;
  assert.equal(afterRejection.currentMandateId, committed.workspace.currentMandateId);
  assert.equal(afterRejection.generation, durable.generation);
  assert.deepEqual(afterRejection.mandateRevisions, durable.mandateRevisions, 'the prior mandate revision set must survive a rejected write unchanged');
  assert.deepEqual(afterRejection.portfolioRevisions, portfolio.workspace.portfolioRevisions);

  const accepted = reloadedStore.commitWorkspace(revisedCandidate.value, durable.generation, '2026-07-15T14:06:00.000Z');
  assert.equal(accepted.ok, true);
  const superseded = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T14:08:00.000Z').value.workspace;
  assert.equal(superseded.mandateRevisions.length, 2);
  assert.equal(superseded.mandateRevisions[1].supersedes, committed.workspace.currentMandateId);
  assert.equal(superseded.currentMandateId, superseded.mandateRevisions[1].mandateId);
  assert.equal(superseded.currentPortfolioId, portfolio.workspace.currentPortfolioId);
  assert.deepEqual(superseded.portfolioRevisions, portfolio.workspace.portfolioRevisions);
});

test('one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const { committed } = seedMandateWorkspace(api, policy, localStorage, sessionStorage);

  const durable = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T14:05:00.000Z').value.workspace;
  const mandate = durable.mandateRevisions[0];
  const projected = api.projectRouteStates(durable, policy);
  assert.equal(projected.ok, true);
  assert.deepEqual(projected.value.routes.map((route) => route.route), ['allocation', 'path-lab', 'risk-xray']);
  assert.equal(projected.value.currentMandateId, committed.workspace.currentMandateId);

  // The consumer list is taken from the policy that declares it, so a consumer the
  // projection silently drops or invents fails here instead of going unnoticed. The
  // count guard keeps "across every consumer" from degrading into a single-consumer
  // claim if the declaration ever shrinks to one.
  const declaredConsumers = policy.mandate.descriptiveRouteStates.slice().sort();
  assert.deepEqual(
    projected.value.routes.map((route) => route.route).sort(),
    declaredConsumers,
    'every policy-declared consumer must appear in the projection exactly once'
  );
  assert.equal(declaredConsumers.length > 1, true, 'a one-consumer projection cannot carry an across-every-consumer claim');

  // Every consumer receives the identical reloaded constraint set, not a per-route copy.
  projected.value.routes.forEach((route) => {
    assert.deepEqual(route.constraints, mandate.constraints, `${route.route} must carry the reloaded constraints unchanged`);
    assert.deepEqual(route.cashNeeds, mandate.cashNeeds, `${route.route} must carry the reloaded cash needs unchanged`);
    assert.deepEqual(route.horizon, mandate.horizon, `${route.route} must carry the reloaded horizon unchanged`);
    assert.equal(route.constraints.every((entry) => entry.inputAuthority === 'user'), true);
    assert.equal(route.cashNeeds.every((entry) => entry.inputAuthority === 'user'), true);
    assert.equal(
      route.mandateDependent.every((entry) => entry.available === true && entry.citedMandateId === durable.currentMandateId),
      true
    );
  });
  const serialisedConstraints = projected.value.routes.map((route) => JSON.stringify(route.constraints));
  assert.equal(new Set(serialisedConstraints).size, 1, 'all consumers must share one constraint set');

  // Absent fields stay absent through the storage round trip.
  ['survivalDefinition', 'rebalancePolicy', 'costPolicy', 'expectedReturnPolicy'].forEach((field) => {
    assert.equal(mandate[field], null, `${field} must stay null after reload`);
  });
  projected.value.routes.forEach((route) => {
    assert.equal(Object.values(route.inferredValues).every((entry) => entry === null), true);
  });
  assert.equal(projected.value.behaviorContribution, 'none');
  assert.equal(projected.value.settingsContribution, 'none');

  // A conflicting draft against the reloaded workspace stays infeasible with nothing relaxed.
  const conflicting = api.validateMandateDraft(mandateFixture('mandate-conflicting.json'), durable, { now: NOW }, policy);
  assert.equal(conflicting.ok, true);
  assert.equal(conflicting.value.canConfirm, false);
  assert.equal(conflicting.value.mandate.constraints.length, conflicting.value.declaredConstraints);
  assert.equal(conflicting.value.mandate.cashNeeds.length, conflicting.value.declaredCashNeeds);
  assert.deepEqual(conflicting.value.mandate.cashNeeds.map((entry) => entry.date), ['2029-03-31', '2027-09-30', '2034-01-31']);
  assert.deepEqual(
    conflicting.value.mandate.constraints.map((entry) => `${entry.kind}:${entry.minimum}:${entry.maximum}`),
    ['minimum-exposure:0.4:null', 'maximum-exposure:null:0.2']
  );
  assert.equal(api.buildMandateCandidate(conflicting.value, durable, { now: NOW }, policy).ok, false);

  const afterConflict = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T14:09:00.000Z').value.workspace;
  assert.equal(afterConflict.currentMandateId, committed.workspace.currentMandateId);
  assert.equal(afterConflict.mandateRevisions.length, 1);
  assert.deepEqual(afterConflict.mandateRevisions[0].constraints, mandate.constraints);
  assert.equal(afterConflict.currentPortfolioId, committed.workspace.currentPortfolioId);

  // With a superseding revision committed there are now two constraint sets in storage,
  // so "one unchanged set across every consumer" stops being trivially true: a consumer
  // reading by array position instead of currentMandateId now shows a superseded set.
  const supersedingStore = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const supersedingBase = supersedingStore.openWorkspace('2026-07-15T14:10:00.000Z').value.workspace;
  const supersedingSource = mandateFixture('mandate-explicit.json');
  supersedingSource.constraints[0].maximum = 0.2;
  const supersedingDraft = api.validateMandateDraft(supersedingSource, supersedingBase, { now: '2026-07-15T14:10:00.000Z' }, policy);
  assert.equal(supersedingDraft.value.canConfirm, true);
  const supersedingCandidate = api.buildMandateCandidate(supersedingDraft.value, supersedingBase, { now: '2026-07-15T14:10:00.000Z' }, policy);
  assert.equal(supersedingCandidate.ok, true);
  assert.equal(supersedingStore.commitWorkspace(supersedingCandidate.value, supersedingBase.generation, '2026-07-15T14:10:00.000Z').ok, true);

  const superseded = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T14:11:00.000Z').value.workspace;
  assert.equal(superseded.mandateRevisions.length, 2);
  const currentMandate = superseded.mandateRevisions.filter((entry) => entry.mandateId === superseded.currentMandateId);
  assert.equal(currentMandate.length, 1, 'exactly one stored revision may answer to currentMandateId');
  const supersededMandate = superseded.mandateRevisions.filter((entry) => entry.mandateId !== superseded.currentMandateId)[0];
  assert.notDeepEqual(currentMandate[0].constraints, supersededMandate.constraints, 'the two stored revisions must differ or this proves nothing');

  const supersededProjection = api.projectRouteStates(superseded, policy);
  assert.equal(supersededProjection.ok, true);
  assert.deepEqual(
    supersededProjection.value.routes.map((route) => route.route).sort(),
    declaredConsumers,
    'every policy-declared consumer must still appear after a superseding revision'
  );

  // Each consumer's own view is substituted back into the stored revision and revalidated.
  // The production validator recomputes the semantic and identity fingerprints, so drift in
  // any consumer's horizon, constraints, or cash needs fails identity here rather than
  // passing a shape-only comparison.
  const consumerIdentities = supersededProjection.value.routes.map((route) => {
    const reconstructed = { ...currentMandate[0], horizon: route.horizon, constraints: route.constraints, cashNeeds: route.cashNeeds };
    const revalidated = api.validateMandateRevision(reconstructed, policy);
    assert.equal(revalidated.ok, true, `${route.route} must reproduce the current stored mandate identity`);
    return `${revalidated.value.semanticFingerprint}|${revalidated.value.mandateId}`;
  });
  assert.equal(new Set(consumerIdentities).size, 1, 'every consumer must observe exactly one constraint-set identity');
  assert.equal(consumerIdentities[0], `${currentMandate[0].semanticFingerprint}|${currentMandate[0].mandateId}`, 'consumers must observe the current revision, not a superseded one');
  assert.equal(supersededProjection.value.citedMandateFingerprint, currentMandate[0].semanticFingerprint);
  assert.equal(
    supersededProjection.value.routes.every((route) => route.mandateDependent.every((entry) => entry.citedMandateId === superseded.currentMandateId)),
    true,
    'every mandate-dependent state must cite the current revision'
  );
});

const MANDATE_POLICY_FIELDS = Object.freeze(['costPolicy', 'expectedReturnPolicy', 'rebalancePolicy', 'survivalDefinition']);

// A draft whose text a relaxing or inventing implementation cannot satisfy by accident:
// one constraint per policy-declared kind, each on its own subject so the conflict
// detector has nothing to pair, and the hard/research split alternates so neither
// classification can be the implementation's single hard-coded answer.
function draftOverEveryDeclaredConstraintKind(policy, base) {
  return {
    ...base,
    constraints: policy.mandate.constraintTypes.map((kind, index) => ({
      kind,
      subject: `DECLARED-SUBJECT-${index}`,
      constraintKind: index % 2 === 0 ? 'hard' : 'research',
      unit: 'portfolio-fraction',
      minimum: kind === 'exclusion' ? null : 0.05,
      maximum: null
    }))
  };
}

function draftErrorReasons(api, policy, raw, now = NOW) {
  const result = api.validateMandateDraft(raw, null, { now }, policy);
  assert.equal(result.ok, true, 'a shape-level rejection must still return a preview so the user sees every error');
  return { canConfirm: result.value.canConfirm, reasons: result.value.errors.map((error) => error.reason), fields: result.value.errors.map((error) => error.field), conflicts: result.value.conflicts.map((entry) => entry.reason) };
}

// Propagation is compared on the declared entry's OWN field set, never a hand-listed subset.
// A subset stops covering any field the contract later adds, and it had already stopped
// covering constraintKind: the declared hard/research authority travelled into the candidate
// with no assertion looking at it there, so a commit-time rewrite of every hard constraint
// into a research one passed both suites green.
function declaredFieldRows(entries, label) {
  assert.equal(entries.length > 0, true, `${label}: an empty declared set cannot prove propagation`);
  const fields = Object.keys(entries[0]).slice().sort();
  assert.equal(fields.length > 0, true, `${label}: a declared entry with no fields cannot prove propagation`);
  entries.forEach((entry, index) => {
    assert.deepEqual(Object.keys(entry).slice().sort(), fields, `${label}[${index}]: every declared entry must share one field set or the comparison is not exhaustive`);
  });
  return { fields, rows: entries.map((entry) => fields.map((field) => entry[field])) };
}

test('FR-011 to FR-016: declared purpose units authority dates amounts currencies priorities and treatment reach the candidate unchanged and an infeasible draft fails loudly with nothing relaxed', () => {
  const { api, policy } = loadRuntime();
  const declared = mandateFixture('mandate-explicit.json');
  const draft = api.validateMandateDraft(declared, null, { now: NOW }, policy);
  assert.equal(draft.ok, true);
  assert.equal(draft.value.canConfirm, true);

  // FR-011 purpose: the objective is an explicit user input, and a draft without one is refused.
  assert.equal(draft.value.mandate.objectiveLabel, declared.objectiveLabel, 'FR-011 the declared purpose must survive verbatim');
  assert.equal(draftErrorReasons(api, policy, { ...declared, objectiveLabel: '' }).reasons.includes('objective-label-required'), true, 'FR-011 a purposeless mandate must be refused');

  // FR-011 units: horizon and constraint units come from the declared vocabulary, and a
  // unit outside it is refused rather than coerced to the nearest accepted value.
  assert.equal(policy.mandate.horizonUnits.includes(draft.value.mandate.horizon.unit), true, 'FR-011 the horizon unit must be a declared unit');
  assert.equal(draft.value.mandate.horizon.unit, declared.horizon.unit);
  assert.equal(draft.value.mandate.constraints.every((entry, index) => entry.unit === declared.constraints[index].unit), true, 'FR-011 each constraint unit must survive verbatim');
  assert.equal(draftErrorReasons(api, policy, { ...declared, horizon: { endDate: declared.horizon.endDate, unit: 'trading-day' } }).reasons.includes('horizon-invalid'), true, 'FR-011 an undeclared horizon unit must be refused');
  assert.equal(draftErrorReasons(api, policy, { ...declared, constraints: [{ ...declared.constraints[0], unit: 'basis-points' }] }).reasons.includes('constraint-unit-invalid'), true, 'FR-011 an undeclared constraint unit must be refused');

  // FR-011 hard versus research authority: both classifications are exercised, so an
  // implementation that collapses every constraint into one class fails here. The expected
  // counts are computed from the input, never asserted as literals.
  const everyKind = draftOverEveryDeclaredConstraintKind(policy, declared);
  const classified = api.validateMandateDraft(everyKind, null, { now: NOW }, policy);
  assert.equal(classified.ok, true);
  assert.deepEqual(classified.value.errors, [], 'FR-014 every policy-declared constraint kind must be an accepted explicit user entry');
  assert.deepEqual(classified.value.conflicts, []);
  assert.equal(classified.value.canConfirm, true);
  const declaredHard = everyKind.constraints.filter((entry) => entry.constraintKind === 'hard').length;
  const declaredResearch = everyKind.constraints.filter((entry) => entry.constraintKind === 'research').length;
  assert.equal(declaredHard > 0 && declaredResearch > 0, true, 'a single-classification draft cannot carry a hard-versus-research claim');
  assert.equal(classified.value.summary.hardConstraints, declaredHard, 'FR-011 hard constraints must be counted as declared');
  assert.equal(classified.value.summary.researchConstraints, declaredResearch, 'FR-011 research constraints must be counted as declared');
  assert.equal(classified.value.mandate.constraints.every((entry, index) => entry.constraintKind === everyKind.constraints[index].constraintKind), true, 'FR-011 each declared authority must survive verbatim');
  assert.deepEqual(classified.value.mandate.constraints.map((entry) => entry.kind), policy.mandate.constraintTypes, 'FR-014 every declared constraint kind must reach the mandate in declared order');
  assert.equal(draftErrorReasons(api, policy, { ...declared, constraints: [{ ...declared.constraints[0], constraintKind: 'inferred' }] }).reasons.includes('constraint-authority-invalid'), true, 'FR-011 an inferred constraint authority must be refused');

  // FR-012 the five required cash-need parts plus treatment policy. Each part is proved twice:
  // the declared value survives verbatim, and an invalid value for that same part is refused.
  const need = declared.cashNeeds[0];
  const produced = draft.value.mandate.cashNeeds[0];
  assert.equal(produced.date, need.date, 'FR-012 the declared date must survive verbatim');
  assert.equal(produced.amount, need.amount, 'FR-012 the declared amount must survive verbatim');
  assert.equal(produced.currency, need.currency, 'FR-012 the declared currency must survive verbatim');
  assert.equal(produced.priority, need.priority, 'FR-012 the declared priority must survive verbatim');
  assert.equal(produced.unit, need.unit, 'FR-012 the declared unit must survive verbatim');
  assert.equal(produced.treatmentTiming, need.treatmentTiming, 'FR-012 the declared treatment policy must survive verbatim');
  assert.equal(draftErrorReasons(api, policy, { ...declared, cashNeeds: [{ ...need, date: '2031-06-31' }] }).reasons.includes('cash-need-date-invalid'), true, 'FR-012 an impossible calendar date must be refused');
  assert.equal(draftErrorReasons(api, policy, { ...declared, cashNeeds: [{ ...need, amount: 0 }] }).reasons.includes('cash-need-amount-invalid'), true, 'FR-012 a non-positive amount must be refused');
  assert.equal(draftErrorReasons(api, policy, { ...declared, cashNeeds: [{ ...need, currency: 'dollars' }] }).reasons.includes('cash-need-currency-invalid'), true, 'FR-012 a malformed currency must be refused');
  assert.equal(draftErrorReasons(api, policy, { ...declared, cashNeeds: [{ ...need, priority: 0 }] }).reasons.includes('cash-need-priority-invalid'), true, 'FR-012 a non-positive priority must be refused');
  assert.equal(draftErrorReasons(api, policy, { ...declared, cashNeeds: [{ ...need, treatmentTiming: 'whenever' }] }).reasons.includes('cash-need-timing-invalid'), true, 'FR-012 an undeclared treatment policy must be refused');

  // FR-012 the three date faults the requirement names: past, out of horizon, out of declared order.
  assert.equal(draftErrorReasons(api, policy, { ...declared, cashNeeds: [{ ...need, date: '2026-01-31' }] }).conflicts.includes('cash-need-date-past'), true, 'FR-012 a past dated need must be identified');
  assert.equal(draftErrorReasons(api, policy, { ...declared, cashNeeds: [{ ...need, date: '2099-01-31' }] }).conflicts.includes('cash-need-after-horizon'), true, 'FR-012 a need beyond the horizon must be identified');
  assert.equal(
    draftErrorReasons(api, policy, { ...declared, cashNeeds: [{ ...need, date: '2033-06-30' }, { ...need, date: '2031-06-30', priority: 2 }] }).conflicts.includes('cash-need-declared-order-invalid'),
    true,
    'FR-012 needs declared out of chronological order must be identified'
  );

  // FR-013 absence is a state, not a default. Every optional policy field the user left out
  // stays null, and null is proved distinct from the zero-shaped values a fallback would use.
  assert.deepEqual(draft.value.absentFields.slice().sort(), MANDATE_POLICY_FIELDS.slice().sort(), 'FR-013 every omitted policy field must be reported absent');
  MANDATE_POLICY_FIELDS.forEach((field) => {
    assert.strictEqual(draft.value.mandate[field], null, `FR-013 ${field} must stay null`);
    assert.notStrictEqual(draft.value.mandate[field], 0);
    assert.notStrictEqual(draft.value.mandate[field], '');
  });

  // FR-014 nothing is inferred from holdings. A real portfolio is committed, then a mandate
  // that declares no constraints and no cash needs at all; the holdings' own symbols must not
  // appear anywhere in what the consumers receive.
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  const portfolio = store.commitWorkspace(candidateFromCsv(api, policy, opened.value.workspace, 'Holdings must not become constraints').value, opened.value.workspace.generation, NOW);
  assert.equal(portfolio.ok, true);
  const heldSubjects = portfolio.value.workspace.portfolioRevisions[0].holdings.map((holding) => holding.symbol).filter(Boolean);
  assert.equal(heldSubjects.length > 0, true, 'a portfolio with no holdings cannot prove that holdings are not inferred from');
  const bareDraft = api.validateMandateDraft({ ...declared, constraints: [], cashNeeds: [] }, portfolio.value.workspace, { now: NOW }, policy);
  assert.equal(bareDraft.value.canConfirm, true);
  const bareCandidate = api.buildMandateCandidate(bareDraft.value, portfolio.value.workspace, { now: NOW }, policy);
  assert.equal(bareCandidate.ok, true);
  const bareMandate = bareCandidate.value.mandateRevisions[0];
  assert.deepEqual(bareMandate.constraints, [], 'FR-014 holdings must not become constraints');
  assert.deepEqual(bareMandate.cashNeeds, [], 'FR-014 holdings must not become cash needs');
  const bareProjection = api.projectRouteStates(bareCandidate.value, policy);
  assert.equal(bareProjection.ok, true);
  const projectedInputs = JSON.stringify(bareProjection.value.routes.map((route) => ({ constraints: route.constraints, cashNeeds: route.cashNeeds })));
  heldSubjects.forEach((subject) => {
    assert.equal(projectedInputs.includes(subject), false, `FR-014 the held instrument ${subject} must not appear as an inferred constraint subject`);
  });

  // FR-015 the declared constraint set travels into the candidate unchanged.
  const candidate = api.buildMandateCandidate(draft.value, portfolio.value.workspace, { now: NOW }, policy);
  assert.equal(candidate.ok, true);
  const carried = candidate.value.mandateRevisions[candidate.value.mandateRevisions.length - 1];
  const declaredConstraintShape = declaredFieldRows(declared.constraints, 'FR-015 constraints');
  assert.equal(declaredConstraintShape.fields.includes('constraintKind'), true, 'FR-015 the constraint comparison must cover the declared hard/research authority');
  assert.deepEqual(
    carried.constraints.map((entry) => declaredConstraintShape.fields.map((field) => entry[field])),
    declaredConstraintShape.rows,
    'FR-015 every declared constraint field must reach the candidate unchanged and in declared order'
  );
  const declaredCashNeedShape = declaredFieldRows(declared.cashNeeds, 'FR-015 cash needs');
  assert.deepEqual(
    carried.cashNeeds.map((entry) => declaredCashNeedShape.fields.map((field) => entry[field])),
    declaredCashNeedShape.rows,
    'FR-015 every declared cash need field must reach the candidate unchanged and in declared order'
  );

  // FR-016 both halves. LOUD: the conflict is enumerated with reasons and typed errors and the
  // build refuses with an explicit code, so infeasibility can never be a quiet success. NOT
  // RELAXED: every declared bound, subject, unit, date, amount, currency, priority and treatment
  // is compared against the DECLARED SOURCE, so an implementation that widened a bound, dropped
  // a constraint or resequenced a need to manufacture feasibility fails this comparison.
  const conflictingSource = mandateFixture('mandate-conflicting.json');
  const infeasible = api.validateMandateDraft(conflictingSource, portfolio.value.workspace, { now: NOW }, policy);
  assert.equal(infeasible.ok, true);
  assert.equal(infeasible.value.canConfirm, false, 'FR-016 an infeasible mandate must not be confirmable');
  assert.equal(infeasible.value.conflicts.length > 0, true, 'FR-016 infeasibility must be loud: at least one enumerated conflict');
  assert.equal(infeasible.value.summary.conflicts, infeasible.value.conflicts.length);
  assert.equal(
    infeasible.value.conflicts.every((entry) => typeof entry.reason === 'string' && entry.reason.length > 0 && entry.error.contractVersion === 'PortfolioError/v1' && typeof entry.error.code === 'string' && entry.error.valueEchoed === false),
    true,
    'FR-016 every conflict must carry a stated reason and a typed value-safe error'
  );
  const refusedBuild = api.buildMandateCandidate(infeasible.value, portfolio.value.workspace, { now: NOW }, policy);
  assert.equal(refusedBuild.ok, false, 'FR-016 an infeasible mandate must be refused, not quietly committed');
  assert.equal(typeof refusedBuild.error.code === 'string' && refusedBuild.error.code.length > 0, true, 'FR-016 the refusal must name a code');
  assert.equal(infeasible.value.declaredConstraints, conflictingSource.constraints.length);
  assert.equal(infeasible.value.declaredCashNeeds, conflictingSource.cashNeeds.length);
  assert.deepEqual(
    infeasible.value.mandate.constraints.map((entry) => [entry.kind, entry.subject, entry.unit, entry.minimum, entry.maximum]),
    conflictingSource.constraints.map((entry) => [entry.kind, entry.subject, entry.unit, entry.minimum, entry.maximum]),
    'FR-016 no declared constraint may be relaxed, reordered or deleted to manufacture feasibility'
  );
  assert.deepEqual(
    infeasible.value.mandate.cashNeeds.map((entry) => [entry.date, entry.amount, entry.currency, entry.priority, entry.unit, entry.treatmentTiming]),
    conflictingSource.cashNeeds.map((entry) => [entry.date, entry.amount, entry.currency, entry.priority, entry.unit, entry.treatmentTiming]),
    'FR-016 no declared cash need may be relaxed, reordered or deleted to manufacture feasibility'
  );
  // The declared source must actually be infeasible, or "nothing was relaxed" proves nothing.
  const declaredSubjects = conflictingSource.constraints.map((entry) => entry.subject);
  assert.equal(new Set(declaredSubjects).size < declaredSubjects.length, true, 'the conflict fixture must declare a genuinely competing constraint pair');
});

// Vocabulary that would turn research output into advice, execution, a guarantee, a legal or
// tax determination, or a suitability verdict. NFR-022 is violated by any of it appearing in
// what a consumer receives.
const ADVICE_VOCABULARY = Object.freeze([
  'recommend', 'advice', 'advise', 'suitab', 'guarantee', 'assured', 'place an order',
  'execute the trade', 'you should buy', 'you should sell', 'tax determination', 'legal opinion'
]);

function adviceVocabularyHits(text) {
  const haystack = String(text).toLowerCase();
  return ADVICE_VOCABULARY.filter((term) => haystack.includes(term));
}

test('NFR-003 NFR-005 NFR-007 NFR-012 NFR-022: provenance missing-state integrity atomic revisions latest-complete publication and the research boundary all hold on the mandate surface', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const { committed } = seedMandateWorkspace(api, policy, localStorage, sessionStorage);
  const durable = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T15:00:00.000Z').value.workspace;
  const mandate = durable.mandateRevisions[0];
  const projection = api.projectRouteStates(durable, policy);
  assert.equal(projection.ok, true);

  // NFR-003 provenance: every stored input names the authority that produced it, and the
  // projection cites the exact revision it read rather than an unattributed value.
  assert.equal(mandate.inputAuthority, policy.mandate.inputAuthority, 'NFR-003 the mandate must name its input authority');
  // The two authority claims below are universally quantified, and `[].every()` is true, so a
  // revision that stored NO constraint or cash need satisfies both of them — and every other
  // authority assertion in this suite — while carrying not one attributed input. The quantifier
  // is therefore bounded by the declaration that produced the revision, read from that
  // declaration rather than typed as a count, so a dropped input fails here instead of passing
  // as an empty universe.
  const authoritySource = mandateFixture('mandate-explicit.json');
  assert.equal(
    authoritySource.constraints.length > 0 && authoritySource.cashNeeds.length > 0,
    true,
    'a declaration carrying no constraint or cash need cannot support an authority claim'
  );
  assert.equal(mandate.constraints.length, authoritySource.constraints.length, 'NFR-003 every declared constraint must be stored to carry an authority');
  assert.equal(mandate.cashNeeds.length, authoritySource.cashNeeds.length, 'NFR-003 every declared cash need must be stored to carry an authority');
  assert.equal(mandate.constraints.every((entry) => entry.inputAuthority === policy.mandate.inputAuthority), true, 'NFR-003 every constraint must name its input authority');
  assert.equal(mandate.cashNeeds.every((entry) => entry.inputAuthority === policy.mandate.inputAuthority), true, 'NFR-003 every cash need must name its input authority');
  assert.equal(projection.value.currentMandateId, mandate.mandateId, 'NFR-003 the projection must cite the revision it read');
  assert.equal(projection.value.citedMandateFingerprint, mandate.semanticFingerprint);
  assert.equal(projection.value.behaviorContribution, 'none');
  assert.equal(projection.value.settingsContribution, 'none');

  // NFR-003 assumptions: what the mandate does NOT assume is enumerated, not left implicit.
  const nullPolicyFields = MANDATE_POLICY_FIELDS.filter((field) => mandate[field] === null);
  assert.equal(nullPolicyFields.length > 0, true, 'a mandate with no omitted policy field cannot carry a stated-assumptions claim');
  const absentDraft = api.validateMandateDraft(mandateFixture('mandate-explicit.json'), durable, { now: NOW }, policy);
  assert.deepEqual(absentDraft.value.absentFields.slice().sort(), nullPolicyFields.slice().sort(), 'NFR-003 every unstated assumption must be reported, not silently supplied');

  // NFR-003 uncertainty: an infeasible draft states each reason rather than a bare boolean.
  const conflicting = api.validateMandateDraft(mandateFixture('mandate-conflicting.json'), durable, { now: NOW }, policy);
  assert.equal(conflicting.value.conflicts.length > 0, true);
  assert.equal(conflicting.value.conflicts.every((entry) => typeof entry.reason === 'string' && entry.reason.length > 0), true, 'NFR-003 every conflict must state a reason');

  // NFR-003 invalidation: withdrawing the mandate makes each dependent state explicitly
  // unavailable with a stated cause, and the portfolio it did not depend on survives.
  const cleared = api.buildMandateClearCandidate(durable, '2026-07-15T15:01:00.000Z', policy);
  assert.equal(cleared.ok, true);
  const clearedProjection = api.projectRouteStates(cleared.value, policy);
  assert.equal(clearedProjection.ok, true);
  assert.equal(
    clearedProjection.value.routes.every((route) => route.mandateDependent.every((entry) => entry.available === false && entry.reason === 'mandate-absent' && entry.citedMandateId === null)),
    true,
    'NFR-003 invalidation must be stated per dependent state, not implied by a blank'
  );
  assert.equal(clearedProjection.value.routes.every((route) => route.descriptive.available === true && route.descriptive.citedPortfolioId === durable.currentPortfolioId), true);

  // NFR-005 missing never becomes zero, empty, false or observed by fallback. Quantified over
  // the fields the USER DECLARED absent, read from the declaration itself. Filtering by
  // `mandate[field] === null` and then asserting null cannot fail: a field that acquired a
  // fallback drops out of the filter, so such a check never examines the failure it names.
  const declaredAbsentSource = mandateFixture('mandate-explicit.json');
  const declaredAbsentFields = MANDATE_POLICY_FIELDS.filter((field) => declaredAbsentSource[field] === null);
  assert.equal(declaredAbsentFields.length > 0, true, 'a declaration that omits no policy field cannot carry a missing-state claim');
  declaredAbsentFields.forEach((field) => {
    assert.strictEqual(mandate[field], null, `NFR-005 ${field} was declared absent and must remain missing`);
    [0, '', false, 'observed', 'default'].forEach((fallback) => {
      assert.notStrictEqual(mandate[field], fallback, `NFR-005 ${field} must not fall back to ${JSON.stringify(fallback)}`);
    });
  });
  // A present mandate still invents none of the never-inferred values.
  policy.mandate.neverInferredFields.forEach((field) => {
    projection.value.routes.forEach((route) => {
      assert.strictEqual(route.inferredValues[field], null, `NFR-005 ${field} must stay absent even when a mandate exists`);
      assert.notStrictEqual(route.inferredValues[field], 0);
    });
  });
  // NFR-005 misaligned: a need denominated outside the valuation currency is surfaced as a
  // conflict and keeps its declared currency; it is never silently converted to look aligned.
  const misalignedSource = mandateFixture('mandate-conflicting.json');
  const misaligned = conflicting.value.mandate.cashNeeds.filter((entry) => entry.currency !== conflicting.value.mandate.valuationCurrency);
  assert.equal(misaligned.length > 0, true, 'the conflict fixture must declare a currency-misaligned need');
  assert.equal(conflicting.value.conflicts.some((entry) => entry.reason === 'cash-need-currency-unavailable'), true, 'NFR-005 a misaligned currency must be surfaced');
  assert.deepEqual(
    conflicting.value.mandate.cashNeeds.map((entry) => entry.currency),
    misalignedSource.cashNeeds.map((entry) => entry.currency),
    'NFR-005 a misaligned currency must stay distinct, never rewritten to the valuation currency'
  );

  // NFR-007 the durable image after a COMMITTED mandate must be exactly the policy-declared
  // key set. This is asserted on the commit path deliberately: commitWorkspace revalidates the
  // candidate and returns before commitDurable, so a write placed inside commitDurable is only
  // ever observable after a commit that succeeds, never inside a before/after byte window that
  // brackets a refusal. Two commits have run, so the expected image is the pointer plus both
  // slots, both names taken from the policy rather than typed as literals.
  const declaredKeys = declaredStorageKeys(policy);
  assert.deepEqual(
    Object.keys(localStorage.snapshot()).sort(),
    [policy.storage.pointerKey, ...policy.storage.slotKeys].sort(),
    'a committed mandate must leave exactly the declared pointer and slot keys'
  );
  assert.deepEqual(
    undeclaredKeys(localStorage, declaredKeys.local),
    [],
    'a committed mandate must leave no durable key outside the policy-declared set'
  );
  assert.deepEqual(
    undeclaredKeys(sessionStorage, declaredKeys.session),
    [],
    'a committed mandate must leave no session key outside the policy-declared set'
  );

  // NFR-007 an invalid configuration and an invalid import both leave the last valid portfolio
  // and the last valid result identity untouched, proved on the durable bytes.
  const bytesBefore = JSON.stringify(localStorage.snapshot());
  assert.equal(api.buildMandateCandidate(conflicting.value, durable, { now: NOW }, policy).ok, false, 'NFR-007 an invalid mandate configuration must be refused');
  const invalidImport = api.validateImport('csv', fixture('invalid-secret-portfolio.csv'), durable, policy);
  assert.equal(invalidImport.value.canConfirm, false, 'NFR-007 an invalid import must be refused');
  assert.equal(JSON.stringify(localStorage.snapshot()) === bytesBefore, true, 'NFR-007 a refused configuration or import must not change one durable byte');
  const afterInvalid = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T15:02:00.000Z').value.workspace;
  assert.equal(afterInvalid.currentPortfolioId, durable.currentPortfolioId, 'NFR-007 the last valid portfolio identity must survive');
  assert.equal(afterInvalid.currentMandateId, durable.currentMandateId);
  assert.equal(api.projectRouteStates(afterInvalid, policy).value.citedMandateFingerprint, mandate.semanticFingerprint, 'NFR-007 the last valid result identity must survive');

  // NFR-007 durability, exercised through the store. validateMandateDraft, buildMandateCandidate
  // and validateImport are pure and hold no storage handle, so a refusal routed only through them
  // cannot move a durable byte no matter how the implementation regresses. The store is the only
  // surface that can write, so the refused write is attempted there: a candidate whose mandate no
  // longer carries user authority must be rejected before the pointer is republished.
  const refusedStore = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const refusedBase = refusedStore.openWorkspace('2026-07-15T15:02:30.000Z').value.workspace;
  const bytesBeforeRefusedCommit = JSON.stringify(localStorage.snapshot());
  const corruptedCandidate = JSON.parse(JSON.stringify(refusedBase));
  corruptedCandidate.mandateRevisions[0].inputAuthority = 'inferred';
  const refusedCommit = refusedStore.commitWorkspace(corruptedCandidate, refusedBase.generation, '2026-07-15T15:02:30.000Z');
  assert.equal(refusedCommit.ok, false, 'NFR-007 a durable commit of an invalid candidate must be refused');
  assert.equal(JSON.stringify(localStorage.snapshot()) === bytesBeforeRefusedCommit, true, 'NFR-007 a refused durable commit must not change one durable byte');
  const afterRefusedCommit = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T15:02:45.000Z').value.workspace;
  assert.equal(afterRefusedCommit.currentMandateId, durable.currentMandateId, 'NFR-007 the last valid mandate identity must survive a refused durable commit');
  assert.equal(afterRefusedCommit.mandateRevisions.every((entry) => entry.inputAuthority === policy.mandate.inputAuthority), true, 'NFR-007 no stored revision may lose user authority through a refused commit');
  assert.deepEqual(
    undeclaredKeys(localStorage, declaredKeys.local),
    [],
    'NFR-007 a refused durable commit must leave no undeclared key behind as residue'
  );

  // NFR-007 residue on a refusal that REACHES the write. The refusal above is rejected by
  // commitWorkspace's own revalidation, which returns before it dispatches to commitDurable, so
  // it never enters the write sequence and cannot observe anything a started write left behind:
  // against that refusal alone the residue assertion holds no matter what commitDurable does.
  // The refusal below is therefore built to reach it. The candidate is valid, so the commit
  // enters commitDurable, writes and re-reads the inactive slot, and is refused only at the
  // pointer publish -- which is why the reason is asserted, since `pointer-write-failed` is
  // reachable only after the slot write has already succeeded. Residue written before that point
  // outlives the refusal, so this is the arrangement in which the claim is falsifiable.
  const residueLocal = createStorage();
  const residueSession = createStorage();
  seedMandateWorkspace(api, policy, residueLocal, residueSession);
  const residueStore = api.createPortfolioStore({ localStorage: residueLocal, sessionStorage: residueSession }, policy);
  const residueBase = residueStore.openWorkspace('2026-07-15T15:02:50.000Z').value.workspace;
  const residueDraft = api.validateMandateDraft(
    { ...mandateFixture('mandate-explicit.json'), objectiveLabel: 'Reaching refusal objective' },
    residueBase, { now: '2026-07-15T15:02:50.000Z' }, policy
  );
  const residueCandidate = api.buildMandateCandidate(residueDraft.value, residueBase, { now: '2026-07-15T15:02:50.000Z' }, policy);
  assert.equal(residueCandidate.ok, true, 'the reaching refusal needs a candidate that passes commit-time validation');
  const residueKeysBefore = Object.keys(residueLocal.snapshot()).sort();
  residueLocal.failSet(policy.storage.pointerKey);
  const residueRefusal = residueStore.commitWorkspace(residueCandidate.value, residueBase.generation, '2026-07-15T15:02:50.000Z');
  assert.equal(residueRefusal.ok, false, 'NFR-007 the reaching commit must be refused');
  assert.equal(residueRefusal.error.reason, 'pointer-write-failed', 'NFR-007 the refusal must land at the pointer publish, past the slot write, or it proves nothing about residue');
  assert.deepEqual(
    undeclaredKeys(residueLocal, declaredKeys.local),
    [],
    'NFR-007 a refusal that reached the write path must leave no undeclared key behind as residue'
  );
  assert.deepEqual(Object.keys(residueLocal.snapshot()).sort(), residueKeysBefore, 'NFR-007 a refusal that reached the write path must add no durable key at all');
  const afterResidue = api.createPortfolioStore({ localStorage: residueLocal, sessionStorage: residueSession }, policy).openWorkspace('2026-07-15T15:02:55.000Z').value.workspace;
  assert.equal(afterResidue.currentMandateId, residueBase.currentMandateId, 'NFR-007 the last valid mandate identity must survive a refusal that reached the write path');

  // NFR-012 two edits are prepared against one base. The first to commit wins; the second is a
  // stale intermediate and must never publish. Rebasing it then makes it the latest complete
  // identity, so "latest complete" is proved by a change of winner, not by a single edit.
  const raceStore = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const base = raceStore.openWorkspace('2026-07-15T15:03:00.000Z').value.workspace;
  const editSource = mandateFixture('mandate-explicit.json');
  const first = api.buildMandateCandidate(
    api.validateMandateDraft({ ...editSource, objectiveLabel: 'First concurrent objective' }, base, { now: '2026-07-15T15:03:00.000Z' }, policy).value,
    base, { now: '2026-07-15T15:03:00.000Z' }, policy
  );
  const stale = api.buildMandateCandidate(
    api.validateMandateDraft({ ...editSource, objectiveLabel: 'Second concurrent objective' }, base, { now: '2026-07-15T15:03:01.000Z' }, policy).value,
    base, { now: '2026-07-15T15:03:01.000Z' }, policy
  );
  assert.equal(first.ok, true);
  assert.equal(stale.ok, true);
  assert.notStrictEqual(first.value.currentMandateId, stale.value.currentMandateId, 'two identical edits cannot demonstrate a race');
  assert.equal(raceStore.commitWorkspace(first.value, base.generation, '2026-07-15T15:03:00.000Z').ok, true);
  const rejected = raceStore.commitWorkspace(stale.value, base.generation, '2026-07-15T15:03:01.000Z');
  assert.equal(rejected.ok, false, 'NFR-012 a stale edit must not publish');
  assert.equal(rejected.error.reason, 'generation-conflict');
  assert.equal(JSON.stringify(localStorage.snapshot()).includes(stale.value.currentMandateId), false, 'NFR-012 an intermediate identity must never reach durable storage');
  const afterRace = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T15:04:00.000Z').value.workspace;
  assert.equal(afterRace.currentMandateId, first.value.currentMandateId, 'NFR-012 the completed edit must be current');
  assert.equal(afterRace.mandateRevisions.filter((entry) => entry.mandateId === afterRace.currentMandateId).length, 1, 'NFR-012 exactly one stored revision may answer to currentMandateId');
  assert.equal(api.projectRouteStates(afterRace, policy).value.currentMandateId, first.value.currentMandateId);
  const rebased = api.buildMandateCandidate(
    api.validateMandateDraft({ ...editSource, objectiveLabel: 'Second concurrent objective' }, afterRace, { now: '2026-07-15T15:05:00.000Z' }, policy).value,
    afterRace, { now: '2026-07-15T15:05:00.000Z' }, policy
  );
  assert.equal(rebased.ok, true);
  const rebasedStore = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const rebasedBase = rebasedStore.openWorkspace('2026-07-15T15:05:00.000Z').value.workspace;
  assert.equal(rebasedStore.commitWorkspace(rebased.value, rebasedBase.generation, '2026-07-15T15:05:00.000Z').ok, true);
  const latest = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T15:06:00.000Z').value.workspace;
  assert.equal(latest.currentMandateId, rebased.value.currentMandateId, 'NFR-012 the latest complete identity must become current');
  assert.notStrictEqual(latest.currentMandateId, first.value.currentMandateId, 'the winner must actually have changed');
  assert.equal(api.projectRouteStates(latest, policy).value.currentMandateId, latest.currentMandateId, 'NFR-012 consumers must read the latest complete identity');
  // "Latest COMPLETE" is a claim about the published image, not only about which identity won.
  // Every assertion above reads currentMandateId, so an image that published the correct winner
  // while silently discarding the revisions it superseded satisfies all of them. Completeness is
  // therefore asserted on the image itself: it must still carry every identity a commit returned.
  const completedMandateIds = [committed.workspace.currentMandateId, first.value.currentMandateId, rebased.value.currentMandateId];
  assert.equal(new Set(completedMandateIds).size, completedMandateIds.length, 'the completed identities must be distinct for a completeness claim to mean anything');
  const publishedMandateIds = latest.mandateRevisions.map((entry) => entry.mandateId);
  completedMandateIds.forEach((mandateId) => {
    assert.equal(publishedMandateIds.includes(mandateId), true, 'NFR-012 the published image must retain every completed revision, not only the latest identity');
  });
  assert.equal(publishedMandateIds.includes(stale.value.currentMandateId), false, 'NFR-012 the published image must carry no identity that never completed');

  // NFR-022 the outputs a consumer receives stay research. The scan is proved capable of
  // detecting a violation before it is used to claim there is none.
  assert.equal(ADVICE_VOCABULARY.length > 0, true);
  assert.equal(adviceVocabularyHits('This tool would recommend a suitable trade').length > 0, true, 'the research-boundary scan must be able to detect advice language');
  assert.deepEqual(adviceVocabularyHits(JSON.stringify(api.projectRouteStates(latest, policy).value)), [], 'NFR-022 the route projection must contain no advice, execution, guarantee or suitability language');
  assert.deepEqual(adviceVocabularyHits(JSON.stringify(absentDraft.value)), [], 'NFR-022 the mandate preview must contain no advice, execution, guarantee or suitability language');
  assert.deepEqual(adviceVocabularyHits(JSON.stringify(conflicting.value)), [], 'NFR-022 an infeasibility explanation must not become advice');
  // The stored contract is closed, so no recommendation-shaped field can be introduced alongside it.
  assert.equal(api.validateMandateRevision({ ...mandate, recommendedAction: 'buy' }, policy).error.reason, 'unknown-field', 'NFR-022 a recommendation field has no slot in the mandate contract');
});

// The six state kinds the scope's negative claim names, plus the portfolio-value side of
// FR-017. Every one must be the target of at least one attempt that is shown to be refused.
const PROTECTED_TARGETS = Object.freeze(['mandate', 'cash need', 'expected return', 'floor', 'objective', 'constraint', 'portfolio value']);

test('FR-017 FR-022 FR-033: behavior settings and market-fact relabelling attempts are refused and change no mandate cash need expected return floor objective or constraint state', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const { committed } = seedMandateWorkspace(api, policy, localStorage, sessionStorage);
  const durable = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T16:00:00.000Z').value.workspace;
  const mandate = durable.mandateRevisions[0];
  const holding = durable.portfolioRevisions[0].holdings[0];
  const declared = mandateFixture('mandate-explicit.json');
  const noise = mandateFixture('mandate-behavior-noise.json');

  // Control. If refusal were blanket rather than selective, every attempt below would be
  // refused for reasons that have nothing to do with authority, and the test would prove
  // nothing. A clean user-entered draft must still be accepted against this same workspace.
  const control = api.validateMandateDraft(declared, durable, { now: NOW }, policy);
  assert.equal(control.ok, true, 'refusal must be selective: a clean user-entered draft is still accepted');
  assert.equal(control.value.canConfirm, true);
  assert.equal(api.validateMandateRevision(mandate, policy).ok, true, 'the untampered stored revision must validate');
  assert.equal(api.validateHoldingEntry(holding, policy).ok, true, 'the untampered stored holding must validate');

  // Each entry is an ATTEMPT to make behavior, settings or a relabel produce or change state.
  // "State did not change" alone cannot distinguish a refusal from a field that was silently
  // dropped, so every attempt records the refusal production actually returned.
  const attempts = [];

  // FR-022 and FR-033: a behavior, interest, outcome or settings payload offered as mandate
  // input is refused outright, naming the offending source.
  policy.mandate.forbiddenInputSources.forEach((source) => {
    attempts.push({
      requirement: source === 'settings' ? 'FR-033' : 'FR-022',
      target: 'mandate',
      what: `${source} offered as mandate input`,
      run: () => api.validateMandateDraft({ ...declared, [source]: noise[source] ?? [] }, durable, { now: NOW }, policy),
      refused: (result) => result.ok === false && result.error.code === 'P008-MANDATE-AUTHORITY' && result.error.reason === 'forbidden-input-source' && result.error.field === source
    });
  });

  // FR-033 names shock magnitude, risk controls and display mode specifically. They are read
  // from the negative fixture's own settings block, so the list cannot drift away from it.
  Object.keys(noise.settings).forEach((field) => {
    attempts.push({
      requirement: 'FR-033',
      target: 'mandate',
      what: `settings field ${field} smuggled in as a mandate field`,
      run: () => api.validateMandateDraft({ ...declared, [field]: noise.settings[field] }, durable, { now: NOW }, policy),
      refused: (result) => result.ok === true && result.value.canConfirm === false && result.value.errors.some((error) => error.reason === 'unknown-field' && error.field === field)
    });
  });

  // The values the product must never infer have no draft slot at all, so an attempt to supply
  // one is refused rather than absorbed. The target mapping comes from the requirement text.
  const NEVER_INFERRED_TARGET = Object.freeze({ expectedReturn: 'expected return', survivalFloor: 'floor', liquidityNeed: 'cash need', riskTolerance: 'mandate' });
  policy.mandate.neverInferredFields.filter((field) => field !== 'horizon').forEach((field) => {
    attempts.push({
      requirement: 'FR-033',
      target: NEVER_INFERRED_TARGET[field],
      what: `${field} supplied as a mandate field`,
      run: () => api.validateMandateDraft({ ...declared, [field]: 0.5 }, durable, { now: NOW }, policy),
      refused: (result) => result.ok === true && result.value.canConfirm === false && result.value.errors.some((error) => error.reason === 'unknown-field' && error.field === field)
    });
  });

  attempts.push({
    requirement: 'FR-022',
    target: 'constraint',
    what: 'a constraint declared as inferred rather than user-entered',
    run: () => api.validateMandateDraft({ ...declared, constraints: [{ ...declared.constraints[0], constraintKind: 'inferred' }] }, durable, { now: NOW }, policy),
    refused: (result) => result.ok === true && result.value.canConfirm === false && result.value.errors.some((error) => error.reason === 'constraint-authority-invalid')
  });
  attempts.push({
    requirement: 'FR-022',
    target: 'constraint',
    what: 'a behavior provenance tag attached to a declared constraint',
    run: () => api.validateMandateDraft({ ...declared, constraints: [{ ...declared.constraints[0], derivedFrom: 'behavior' }] }, durable, { now: NOW }, policy),
    refused: (result) => result.ok === true && result.value.canConfirm === false && result.value.errors.some((error) => error.reason === 'unknown-field' && error.field === 'constraints[0].derivedFrom')
  });
  attempts.push({
    requirement: 'FR-022',
    target: 'cash need',
    what: 'a behavior provenance tag attached to a declared cash need',
    run: () => api.validateMandateDraft({ ...declared, cashNeeds: [{ ...declared.cashNeeds[0], derivedFrom: 'behavior' }] }, durable, { now: NOW }, policy),
    refused: (result) => result.ok === true && result.value.canConfirm === false && result.value.errors.some((error) => error.reason === 'unknown-field' && error.field === 'cashNeeds[0].derivedFrom')
  });

  // Modifying state that already exists, not just creating it. Each rewrite is applied to the
  // stored revision and pushed back through the production validator.
  attempts.push({
    requirement: 'FR-017',
    target: 'mandate',
    what: 'the stored mandate relabelled as an observed fact',
    run: () => api.validateMandateRevision({ ...mandate, inputAuthority: 'observed' }, policy),
    refused: (result) => result.ok === false && result.error.reason === 'mandate-invalid'
  });
  attempts.push({
    requirement: 'FR-022',
    target: 'constraint',
    what: 'a stored constraint relabelled as behavior-derived',
    run: () => api.validateMandateRevision({ ...mandate, constraints: [{ ...mandate.constraints[0], inputAuthority: 'behavior' }, ...mandate.constraints.slice(1)] }, policy),
    refused: (result) => result.ok === false && result.error.reason === 'constraint-invalid'
  });
  attempts.push({
    requirement: 'FR-017',
    target: 'cash need',
    what: 'a stored cash need relabelled as an observed fact',
    run: () => api.validateMandateRevision({ ...mandate, cashNeeds: [{ ...mandate.cashNeeds[0], inputAuthority: 'observed' }, ...mandate.cashNeeds.slice(1)] }, policy),
    refused: (result) => result.ok === false && result.error.reason === 'cash-need-invalid'
  });
  attempts.push({
    requirement: 'FR-022',
    target: 'objective',
    what: 'the stored objective rewritten from behavior',
    run: () => api.validateMandateRevision({ ...mandate, objectiveLabel: 'Objective rewritten from behavior evidence' }, policy),
    refused: (result) => result.ok === false && result.error.reason === 'mandate-identity-mismatch'
  });
  attempts.push({
    requirement: 'FR-033',
    target: 'expected return',
    what: 'a stored expected-return policy rewritten from settings',
    run: () => api.validateMandateRevision({ ...mandate, expectedReturnPolicy: 'Expected return supplied by display settings' }, policy),
    refused: (result) => result.ok === false && result.error.reason === 'mandate-identity-mismatch'
  });
  attempts.push({
    requirement: 'FR-033',
    target: 'floor',
    what: 'a survival floor grafted onto the stored mandate',
    run: () => api.validateMandateRevision({ ...mandate, survivalFloor: 0.5 }, policy),
    refused: (result) => result.ok === false && result.error.reason === 'unknown-field'
  });
  attempts.push({
    requirement: 'FR-017',
    target: 'portfolio value',
    what: 'a user-entered holding relabelled as a market observation',
    run: () => api.validateHoldingEntry({ ...holding, provenanceClass: 'market-observed' }, policy),
    refused: (result) => result.ok === false && result.error.reason === 'holding-invalid'
  });

  const bytesBefore = JSON.stringify(localStorage.snapshot());
  const outcomes = attempts.map((attempt) => ({ ...attempt, result: attempt.run() }));
  outcomes.forEach((attempt) => {
    assert.equal(attempt.refused(attempt.result), true, `${attempt.requirement}: ${attempt.what} must be refused, not absorbed`);
  });

  // Coverage is asserted, not assumed: every named state kind and every named requirement has
  // at least one refused attempt, so a target losing its only attempt fails here.
  assert.equal(outcomes.length >= PROTECTED_TARGETS.length, true);
  PROTECTED_TARGETS.forEach((target) => {
    assert.equal(outcomes.some((attempt) => attempt.target === target), true, `${target} state must have a refused attempt behind it`);
  });
  ['FR-017', 'FR-022', 'FR-033'].forEach((requirement) => {
    assert.equal(outcomes.some((attempt) => attempt.requirement === requirement), true, `${requirement} must have a refused attempt behind it`);
  });

  // No attempt may have moved stored state, and none may have leaked its payload into an error.
  assert.equal(JSON.stringify(localStorage.snapshot()) === bytesBefore, true, 'no refused attempt may change one durable byte');
  const serialisedErrors = JSON.stringify(outcomes.map((attempt) => attempt.result.error ?? attempt.result.value?.errors ?? null));
  Object.values(noise.settings).forEach((value) => {
    assert.equal(serialisedErrors.includes(String(value)), false, 'a refusal must not echo the rejected value');
  });

  const after = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T16:01:00.000Z').value.workspace;
  assert.equal(after.currentMandateId, committed.workspace.currentMandateId, 'the current mandate identity must be unchanged');
  assert.equal(after.currentPortfolioId, committed.workspace.currentPortfolioId, 'the current portfolio identity must be unchanged');
  assert.equal(after.mandateRevisions.length, durable.mandateRevisions.length, 'no attempt may create a revision');
  assert.equal(after.mandateRevisions[0].semanticFingerprint, mandate.semanticFingerprint, 'no attempt may change the stored mandate content');
  assert.deepEqual(after.mandateRevisions[0].constraints, mandate.constraints, 'no attempt may change a stored constraint');
  assert.deepEqual(after.mandateRevisions[0].cashNeeds, mandate.cashNeeds, 'no attempt may change a stored cash need');
  MANDATE_POLICY_FIELDS.forEach((field) => {
    assert.strictEqual(after.mandateRevisions[0][field], mandate[field], `no attempt may change ${field}`);
  });

  const projection = api.projectRouteStates(after, policy);
  assert.equal(projection.ok, true);
  assert.equal(projection.value.behaviorContribution, 'none', 'FR-022 behavior must contribute nothing after every attempt');
  assert.equal(projection.value.settingsContribution, 'none', 'FR-033 settings must contribute nothing after every attempt');
  assert.equal(projection.value.citedMandateFingerprint, mandate.semanticFingerprint);
  projection.value.routes.forEach((route) => {
    policy.mandate.neverInferredFields.forEach((field) => {
      assert.strictEqual(route.inferredValues[field], null, `${field} must remain absent after every attempt`);
    });
    assert.equal(route.constraints.every((entry) => entry.inputAuthority === policy.mandate.inputAuthority), true, 'FR-017 every projected constraint must still be labelled a user entry');
    assert.equal(route.cashNeeds.every((entry) => entry.inputAuthority === policy.mandate.inputAuthority), true, 'FR-017 every projected cash need must still be labelled a user entry');
  });
  assert.equal(after.portfolioRevisions[0].holdings.every((entry) => entry.provenanceClass === 'user-entered-holding'), true, 'FR-017 every stored holding must still be labelled user-entered, never market-observed');
});

test('rolling a mandate back restores the pre-mandate portfolio state by identity, not by resemblance', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  const seeded = store.commitWorkspace(
    candidateFromCsv(api, policy, opened.value.workspace, 'Rollback exactness portfolio').value,
    opened.value.workspace.generation,
    NOW
  );
  assert.equal(seeded.ok, true);

  // The baseline is read back through a fresh store, so "pre-change state" means the
  // persisted bytes rather than the object the commit happened to hand back.
  const preLoad = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T16:30:00.000Z');
  assert.equal(preLoad.ok, true);
  const pre = preLoad.value.workspace;
  assert.strictEqual(pre.currentMandateId, null, 'the pre-change baseline must genuinely carry no mandate');
  assert.equal(pre.portfolioRevisions.length > 0, true, 'an empty revision set would make every unchanged claim vacuous');
  const prePortfolioId = pre.currentPortfolioId;
  const preRevisionBytes = JSON.stringify(pre.portfolioRevisions);

  // Commit a real mandate, so the rollback has something to undo. Rolling back a no-op
  // would satisfy an equality check while proving nothing.
  const draft = api.validateMandateDraft(mandateFixture('mandate-explicit.json'), pre, { now: '2026-07-15T16:31:00.000Z' }, policy);
  assert.equal(draft.ok, true);
  assert.equal(draft.value.canConfirm, true);
  const mandateCandidate = api.buildMandateCandidate(draft.value, pre, { now: '2026-07-15T16:31:00.000Z' }, policy);
  assert.equal(mandateCandidate.ok, true);
  const withMandate = store.commitWorkspace(mandateCandidate.value, pre.generation, '2026-07-15T16:31:00.000Z');
  assert.equal(withMandate.ok, true);
  assert.notStrictEqual(withMandate.value.workspace.currentMandateId, null, 'the change being rolled back must actually have happened');
  assert.notStrictEqual(
    JSON.stringify(withMandate.value.workspace),
    JSON.stringify(pre),
    'the mandate commit must move the workspace off its baseline, or the rollback assertion is trivially true'
  );

  const cleared = api.buildMandateClearCandidate(withMandate.value.workspace, '2026-07-15T16:32:00.000Z', policy);
  assert.equal(cleared.ok, true);
  const rolledBack = store.commitWorkspace(cleared.value, withMandate.value.workspace.generation, '2026-07-15T16:32:00.000Z');
  assert.equal(rolledBack.ok, true);

  const postLoad = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T16:33:00.000Z');
  assert.equal(postLoad.ok, true);
  const post = postLoad.value.workspace;

  assert.strictEqual(post.currentMandateId, null, 'the rollback must actually clear the mandate pointer');
  assert.strictEqual(post.currentPortfolioId, prePortfolioId, 'the current portfolio identity must be the same string, not an equivalent rebuild');
  assert.strictEqual(JSON.stringify(post.portfolioRevisions), preRevisionBytes, 'every stored portfolio revision must survive the rollback byte-for-byte');
  assert.strictEqual(post.portfolioRevisions.length, pre.portfolioRevisions.length, 'the rollback must neither drop nor add a portfolio revision');
  pre.portfolioRevisions.forEach((before, index) => {
    const restored = post.portfolioRevisions[index];
    assert.strictEqual(restored.portfolioId, before.portfolioId, `portfolio revision ${index} must keep its identity across the rollback`);
    assert.strictEqual(restored.semanticFingerprint, before.semanticFingerprint, `portfolio revision ${index} must keep its semantic fingerprint across the rollback`);
    assert.strictEqual(JSON.stringify(restored), JSON.stringify(before), `portfolio revision ${index} must not be rewritten by a mandate rollback`);
  });

  const projection = api.projectRouteStates(post, policy);
  assert.equal(projection.ok, true);
  assert.equal(
    projection.value.routes.every((route) => route.descriptive.citedPortfolioId === prePortfolioId),
    true,
    'every descriptive route must still cite the pre-change portfolio identity after the rollback'
  );
});

// ---------------------------------------------------------------------------
// TP-03-03: category-by-category verified deletion, preservation, and
// partial-failure truth against raw namespaced state.
// ---------------------------------------------------------------------------

// Real shared cache-first market assets, not test-only names: these are the generic public
// caches every tool on the site reuses, so wiping them is a real product regression.
const GENERIC_PUBLIC_CACHES = Object.freeze({ rlData: '{"bars":{}}', optSnaps: '{"SPY":{}}' });
const CLEAR_RESULT_IDENTITY = `sha256:${'ab12'.repeat(16)}`;
const CLEAR_SUBJECT = 'subject-clear-alpha';
const LATER_CLEAR = '2026-07-15T15:00:00.000Z';
const AFTER_CLEAR = '2026-07-15T15:01:00.000Z';

// Keys split by the adapter that actually holds them. This differs deliberately from
// `declaredStorageKeys` above, which builds one conservative allowlist for leak scans and
// puts the return context on the local side. A per-step fault has to fault the key on the
// adapter the runtime removes it from, so this derivation follows the runtime's split.
function declaredKeysByAdapter(policy) {
  return {
    local: [policy.storage.pointerKey, ...policy.storage.slotKeys, policy.storage.quarantineKey].slice().sort(),
    session: [policy.storage.sessionKey, policy.storage.returnContextKey].slice().sort()
  };
}

// The clear operations a category declares it is removed by, read off `clearedBy` rather
// than written out here, so a category added later is classified by its own declaration
// instead of silently dropping out of the matrix.
function clearTokens(category) {
  return category.clearedBy.split('-and-').slice().sort();
}

function categoriesByName(inventory) {
  const byName = new Map();
  inventory.categories.forEach((entry) => byName.set(entry.category, entry));
  return byName;
}

/*
 * Per-category verdict for one clear operation, expressed against the raw before/after
 * inventories. Returns a violation list rather than asserting, so the identical checker can
 * be pointed at a deliberately wrong clear to prove it is capable of reporting one.
 *
 * A category the operation declares it removes must reach zero. Every other category must
 * come back at its exact prior count -- not merely "still present", because a clear that
 * dropped one of three mandate revisions would still be present.
 */
function categoryViolations(before, after, operationToken) {
  const afterByName = categoriesByName(after);
  const violations = [];
  before.categories.forEach((entry) => {
    const observed = afterByName.get(entry.category);
    if (!observed) {
      violations.push(`${entry.category}: absent from the post-clear inventory`);
      return;
    }
    if (clearTokens(entry).includes(operationToken)) {
      if (observed.recordCount !== 0 || observed.present !== false) {
        violations.push(`${entry.category}: declared cleared by ${operationToken} but ${observed.recordCount} record(s) survive`);
      }
      return;
    }
    if (observed.recordCount !== entry.recordCount || observed.present !== entry.present) {
      violations.push(`${entry.category}: not cleared by ${operationToken} but went ${entry.recordCount} -> ${observed.recordCount}`);
    }
  });
  return violations.sort();
}

/*
 * Violations for the all-personal clear, which is not symmetric with the behavior clear.
 * It reports `verifiedEmpty` over every declared storage key, so no personal category may
 * survive it regardless of which operation that category's `clearedBy` names. Preservation
 * under this operation is about the generic public caches, which are not personal
 * categories and are asserted against the raw namespace instead.
 */
function allPersonalViolations(before, after) {
  const afterByName = categoriesByName(after);
  const violations = [];
  before.categories.forEach((entry) => {
    const observed = afterByName.get(entry.category);
    if (!observed) {
      violations.push(`${entry.category}: absent from the post-clear inventory`);
      return;
    }
    if (observed.recordCount !== 0 || observed.present !== false) {
      violations.push(`${entry.category}: ${observed.recordCount} record(s) survive a verified-empty all-personal clear`);
    }
  });
  return violations.sort();
}

/*
 * Commits holdings, an explicit mandate carrying a dated cash need, and one eligible
 * behavior completion over real storage, then stocks the three declared keys a durable
 * commit does not itself create. Every populatable inventory category ends up non-empty,
 * which is what makes the emptiness assertions afterwards non-vacuous.
 */
function seedEveryPopulatableCategory(api, policy, localStorage, sessionStorage) {
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);

  const portfolio = store.commitWorkspace(
    candidateFromCsv(api, policy, opened.value.workspace, 'Category clear portfolio').value,
    opened.value.workspace.generation,
    NOW
  );
  assert.equal(portfolio.ok, true, `portfolio commit must succeed: ${JSON.stringify(portfolio.error || {})}`);

  const draft = api.validateMandateDraft(mandateFixture('mandate-explicit.json'), portfolio.value.workspace, { now: NOW }, policy);
  assert.equal(draft.ok, true);
  const mandate = store.commitWorkspace(
    api.buildMandateCandidate(draft.value, portfolio.value.workspace, { now: NOW }, policy).value,
    portfolio.value.workspace.generation,
    NOW
  );
  assert.equal(mandate.ok, true, `mandate commit must succeed: ${JSON.stringify(mandate.error || {})}`);

  const behavior = api.buildBehaviorCandidate({
    category: 'ticker-research-completed',
    completionConditionId: 'risk-panel-reviewed',
    domain: 'equity-research',
    horizon: 'medium-term',
    resultIdentity: CLEAR_RESULT_IDENTITY,
    sourceSurface: 'risk-xray',
    subjectId: CLEAR_SUBJECT,
    subjectKind: 'ticker'
  }, mandate.value.workspace, { now: NOW }, policy);
  assert.equal(behavior.ok, true, `behavior candidate must build: ${JSON.stringify(behavior.error || {})}`);
  const committed = store.commitWorkspace(behavior.value.workspace, mandate.value.workspace.generation, NOW);
  assert.equal(committed.ok, true, `behavior commit must succeed: ${JSON.stringify(committed.error || {})}`);

  localStorage.setItem(policy.storage.quarantineKey, 'quarantine-sentinel');
  sessionStorage.setItem(policy.storage.sessionKey, 'session-fallback-sentinel');
  sessionStorage.setItem(policy.storage.returnContextKey, 'return-context-sentinel');

  return { store, workspace: committed.value.workspace };
}

test('each declared privacy category is deleted by the clear that names it and survives the clear that does not, one category at a time', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage({ initial: { ...GENERIC_PUBLIC_CACHES } });
  const sessionStorage = createStorage();
  const { store, workspace } = seedEveryPopulatableCategory(api, policy, localStorage, sessionStorage);

  const beforeResult = api.privacyInventory(workspace, { localStorage, sessionStorage }, policy);
  assert.equal(beforeResult.ok, true, `inventory must project: ${JSON.stringify(beforeResult.error || {})}`);
  const before = beforeResult.value;

  // The category list and the operations that clear it are both read off the runtime's own
  // declaration. A literal list here would stop covering any category a later scope adds.
  const tokenUniverse = Array.from(new Set(before.categories.flatMap(clearTokens))).sort();
  assert.deepEqual(tokenUniverse, ['all-personal', 'behavior'], 'a new clearedBy token would leave its categories unclassified by the matrix below');

  const populated = before.categories.filter((entry) => entry.present).map((entry) => entry.category).sort();
  const notRepresentable = before.categories.filter((entry) => !entry.present).map((entry) => entry.category).sort();
  assert.deepEqual(
    populated,
    ['behavior-events', 'cash-needs', 'mandate-revisions', 'portfolio-revisions', 'quarantine', 'session-fallback'],
    'six declared categories must genuinely hold records before any clear, or every emptiness assertion below is vacuous'
  );
  // Pinned, not counted. These two sections have no write path through the builders this
  // scope exports, so asserting their emptiness proves nothing and no clear can be OBSERVED
  // to empty them -- which is why the declared-vs-observed check below ranges over `populated`
  // only. Naming them exactly means a later scope that adds a write path turns this red, and
  // moves them into that check, instead of quietly over-reporting.
  assert.deepEqual(
    notRepresentable,
    ['action-outcomes', 'interest-signals'],
    'exactly two declared categories cannot be populated at this scope, so they are excluded from the proven set rather than counted'
  );
  assert.equal(
    populated.some((name) => clearTokens(categoriesByName(before).get(name)).includes('behavior')),
    true,
    'at least one populated category must be behavior-cleared, or the behavior arm clears nothing'
  );
  assert.equal(
    populated.some((name) => !clearTokens(categoriesByName(before).get(name)).includes('behavior')),
    true,
    'at least one populated category must survive the behavior clear, or the preservation half is vacuous'
  );

  // Byte-identical clones taken before either clear, so the two operations are compared on
  // the same starting state rather than on whatever the first one left behind.
  const bluntLocal = createStorage({ initial: localStorage.snapshot() });
  const bluntSession = createStorage({ initial: sessionStorage.snapshot() });

  // --- Operation 1: the behavior clear -------------------------------------------------
  const behaviorClear = api.buildBehaviorClearCandidate(workspace, LATER_CLEAR, policy);
  assert.equal(behaviorClear.ok, true, `behavior clear must build: ${JSON.stringify(behaviorClear.error || {})}`);
  assert.equal(behaviorClear.value.clearedEventCount, before.categories.find((entry) => entry.category === 'behavior-events').recordCount, 'the reported cleared count must match the population the inventory proved');
  const behaviorCommitted = store.commitWorkspace(behaviorClear.value.workspace, workspace.generation, LATER_CLEAR);
  assert.equal(behaviorCommitted.ok, true, `behavior clear must commit: ${JSON.stringify(behaviorCommitted.error || {})}`);

  // Re-read from the persisted bytes, so "cleared" means the namespace no longer holds it
  // rather than the in-process candidate object having dropped it.
  const afterBehaviorLoad = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace(AFTER_CLEAR);
  assert.equal(afterBehaviorLoad.ok, true, `a behavior-cleared namespace must still open: ${JSON.stringify(afterBehaviorLoad.error || {})}`);
  const afterBehavior = api.privacyInventory(afterBehaviorLoad.value.workspace, { localStorage, sessionStorage }, policy).value;

  assert.deepEqual(categoryViolations(before, afterBehavior, 'behavior'), [], 'the behavior clear must empty exactly the categories that declare it and leave every other category at its exact prior count');
  assert.equal(JSON.stringify(afterBehaviorLoad.value.workspace).includes(CLEAR_SUBJECT), false, 'no cleared subject may reappear through the reopened workspace');
  assert.equal(JSON.stringify(workspace).includes(CLEAR_SUBJECT), true, 'the subject was genuinely stored, so its absence above is meaningful');
  assert.deepEqual(
    Object.fromEntries(Object.entries(localStorage.snapshot()).filter(([key]) => key in GENERIC_PUBLIC_CACHES)),
    GENERIC_PUBLIC_CACHES,
    'the shared public caches must survive a behavior clear byte-identical, not re-serialized'
  );

  // --- Operation 2: the all-personal clear, on the untouched clone ---------------------
  const bluntCleared = api.clearFoundationStorage({ localStorage: bluntLocal, sessionStorage: bluntSession });
  assert.equal(bluntCleared.ok, true, `the all-personal clear must succeed: ${JSON.stringify(bluntCleared.error || {})}`);
  assert.equal(bluntCleared.value.verifiedEmpty, true);
  const afterAllLoad = api.createPortfolioStore({ localStorage: bluntLocal, sessionStorage: bluntSession }, policy).openWorkspace(AFTER_CLEAR);
  assert.equal(afterAllLoad.ok, true, `an all-personal-cleared namespace must still open: ${JSON.stringify(afterAllLoad.error || {})}`);
  const afterAll = api.privacyInventory(afterAllLoad.value.workspace, { localStorage: bluntLocal, sessionStorage: bluntSession }, policy).value;

  assert.deepEqual(allPersonalViolations(before, afterAll), [], 'a verified-empty all-personal clear must leave no personal category holding a record');
  assert.deepEqual(bluntLocal.snapshot(), GENERIC_PUBLIC_CACHES, 'exactly the generic public caches may survive an all-personal clear, byte-identical');
  assert.deepEqual(bluntSession.snapshot(), {}, 'no declared session key may survive an all-personal clear');

  // `clearedBy` declares EVERY operation that empties a category. Both sides of this check are
  // MEASURED: the declaration comes off the runtime, the expectation off the two clears that
  // just ran. Neither is written out here, so a label that under-declares (names the behavior
  // clear while the all-personal clear also empties it) or over-declares goes red instead of
  // being kept in step with the runtime by hand.
  const observedClearTokens = (name) => {
    const emptied = [];
    if (categoriesByName(afterBehavior).get(name).recordCount === 0) emptied.push('behavior');
    if (categoriesByName(afterAll).get(name).recordCount === 0) emptied.push('all-personal');
    return emptied.sort();
  };
  const declaredVsObserved = (declaredFor) => populated
    .map((name) => ({ category: name, declared: declaredFor(name), observed: observedClearTokens(name) }))
    .filter((row) => row.declared.join() !== row.observed.join());

  assert.deepEqual(
    declaredVsObserved((name) => clearTokens(categoriesByName(before).get(name))),
    [],
    'every populated category must declare exactly the clear operations observed to empty it'
  );

  // Red-ability, reconstructing the exact defect this check exists to catch: restore the former
  // behavior-events label, which named only the narrow clear while the all-personal clear was
  // observed above to empty it too. The comparator must name that row and only that row, or the
  // green result above is inert and an under-declaring privacy label would ship unnoticed.
  assert.deepEqual(
    declaredVsObserved((name) => (name === 'behavior-events' ? ['behavior'] : clearTokens(categoriesByName(before).get(name))))
      .map((row) => row.category),
    ['behavior-events'],
    'the comparator must name a category whose label under-declares, or the declared-vs-observed check is inert'
  );

  // --- The per-category matrix both operations produce ---------------------------------
  // Each populatable category is now proven on both axes: emptied by the operation that
  // removes it, and intact at its exact count under the operation that does not.
  const verifiedEmpty = bluntCleared.value.verifiedEmpty === true && bluntCleared.value.remainingPersonalKeys.length === 0;
  const matrix = populated.map((name) => ({
    category: name,
    behaviorClear: categoriesByName(afterBehavior).get(name).recordCount === 0 ? 'deleted' : 'preserved',
    allPersonalClear: categoriesByName(afterAll).get(name).recordCount === 0 ? 'deleted' : 'preserved'
  }));
  const declaredMatrix = populated.map((name) => ({
    category: name,
    behaviorClear: clearTokens(categoriesByName(before).get(name)).includes('behavior') ? 'deleted' : 'preserved',
    allPersonalClear: verifiedEmpty ? 'deleted' : 'preserved'
  }));
  assert.deepEqual(matrix, declaredMatrix, 'every populatable category must behave exactly as its clearedBy declaration and the all-personal verified-empty contract say');
  assert.equal(matrix.filter((row) => row.behaviorClear === 'preserved').length, 5, 'five categories must be observed surviving the behavior clear, or "category-by-category" collapses to one whole-store wipe');

  // --- Red-ability: the same checker against the blunt whole-store alternative ----------
  // The all-personal clear is a real, executed operation that empties everything. Pointing
  // the behavior-arm checker at it must report violations naming each preserved category.
  // If it reported none, the preservation half above would be inert and a blunt wipe would
  // pass as a correct per-category delete.
  const bluntViolations = categoryViolations(before, afterAll, 'behavior');
  assert.equal(bluntViolations.length, 5, `a whole-store wipe must violate the behavior contract for all five preserved categories, got: ${JSON.stringify(bluntViolations)}`);
  assert.deepEqual(
    bluntViolations.map((entry) => entry.split(':')[0]).sort(),
    ['cash-needs', 'mandate-revisions', 'portfolio-revisions', 'quarantine', 'session-fallback'],
    'the checker must name every category a blunt wipe destroyed, so the behavior arm passing above is a real distinction'
  );
});

/*
 * Delegating adapter whose `removeItem` silently does nothing for one key. This is the
 * failure a throwing fault cannot model: a clear that skips a step without erroring. Used
 * only to prove the per-step checker below reports it.
 */
function withSkippedRemoval(storage, skippedKey) {
  return {
    clear: () => storage.clear(),
    getItem: (key) => storage.getItem(key),
    key: (index) => storage.key(index),
    get length() { return storage.length; },
    removeItem: (key) => { if (String(key) !== skippedKey) storage.removeItem(key); },
    setItem: (key, value) => storage.setItem(key, value),
    snapshot: () => storage.snapshot()
  };
}

/*
 * Violations for one faulted clear step, read from the raw namespaces afterwards. Returns a
 * list rather than asserting so the identical checker can be aimed at a clear that skips an
 * extra step, proving it is capable of reporting one.
 */
function stepViolations(policy, adapters, declared, faultedKey, sentinels) {
  const violations = [];
  const read = (key) => (declared.local.includes(key) ? adapters.localStorage : adapters.sessionStorage).getItem(key);
  if (read(faultedKey) !== sentinels[faultedKey]) {
    violations.push(`${faultedKey}: faulted key must keep its exact bytes, saw ${JSON.stringify(read(faultedKey))}`);
  }
  declared.local.concat(declared.session).forEach((key) => {
    if (key === faultedKey) return;
    if (read(key) !== null) violations.push(`${key}: unfaulted step did not delete`);
  });
  Object.entries(GENERIC_PUBLIC_CACHES).forEach(([key, value]) => {
    if (adapters.localStorage.getItem(key) !== value) violations.push(`${key}: generic public cache was not preserved byte-identical`);
  });
  return violations.sort();
}

test('every declared clear step is faulted on its own, the other steps still delete, and the retained bytes refuse a success result', () => {
  const { api, policy } = loadRuntime();
  const declared = declaredKeysByAdapter(policy);
  const declaredCount = declared.local.length + declared.session.length;
  assert.equal(declaredCount > 0, true, 'an empty declared set would make the loop below iterate zero times and prove nothing');
  assert.equal(new Set(declared.local.concat(declared.session)).size, declaredCount, 'a duplicate key would let one survivor hide behind another');

  function seedRawNamespace() {
    const localStorage = createStorage({ initial: { ...GENERIC_PUBLIC_CACHES } });
    const sessionStorage = createStorage();
    const sentinels = {};
    declared.local.forEach((key, index) => { sentinels[key] = `local-sentinel-${index}`; localStorage.setItem(key, sentinels[key]); });
    declared.session.forEach((key, index) => { sentinels[key] = `session-sentinel-${index}`; sessionStorage.setItem(key, sentinels[key]); });
    return { adapters: { localStorage, sessionStorage }, sentinels };
  }

  const faultedSteps = [];
  declared.local.concat(declared.session).forEach((faultedKey) => {
    const onLocal = declared.local.includes(faultedKey);
    const { adapters, sentinels } = seedRawNamespace();

    // Non-vacuity: every declared step must have something to delete before it is faulted.
    declared.local.concat(declared.session).forEach((key) => {
      const stored = (declared.local.includes(key) ? adapters.localStorage : adapters.sessionStorage).getItem(key);
      assert.equal(stored, sentinels[key], `${key} must hold its sentinel before the clear, or its deletion proves nothing`);
    });

    (onLocal ? adapters.localStorage : adapters.sessionStorage).failRemove(faultedKey);
    const cleared = api.clearFoundationStorage(adapters);

    assert.equal(cleared.ok, false, `${faultedKey}: a clear that could not delete every declared key must not report success`);
    assert.equal(cleared.error.code, 'P008-STORE-WRITE', `${faultedKey}: the partial failure must be named as a storage write failure`);
    assert.equal(cleared.error.reason, 'foundation-clear-incomplete', `${faultedKey}: the refusal must state the clear was incomplete`);
    assert.equal(cleared.error.recoverable, true, `${faultedKey}: an incomplete clear is retryable, so the caller can be told to try again`);
    assert.equal(cleared.error.valueEchoed, false, `${faultedKey}: the refusal must not echo the retained personal bytes it is refusing over`);
    assert.equal(Object.prototype.hasOwnProperty.call(cleared, 'value'), false, `${faultedKey}: a refusal must carry no success payload`);

    assert.deepEqual(stepViolations(policy, adapters, declared, faultedKey, sentinels), [], `${faultedKey}: the faulted step must retain its exact bytes while every other step still deletes and the public caches survive`);

    // Category truth against the raw namespace: exactly the faulted key is still personal.
    const residual = api.foundationPrivacyInventory(adapters);
    assert.equal(residual.ok, true);
    assert.equal(residual.value.personalKeyCount, 1, `${faultedKey}: exactly one declared key may remain, so a bail-on-first-error clear is refused here`);
    assert.deepEqual(residual.value.presentKeys, [{ key: faultedKey, storage: onLocal ? 'local' : 'session' }], `${faultedKey}: the surviving personal key must be the faulted one and nothing else`);

    faultedSteps.push(faultedKey);
  });

  assert.deepEqual(faultedSteps.slice().sort(), declared.local.concat(declared.session).sort(), 'every declared clear step must have been faulted on its own, not a subset');
  assert.equal(faultedSteps.length, declaredCount);

  // Control: with no fault the same seeded namespace clears completely, so the refusals
  // above are caused by the injected fault rather than by a clear that never works.
  const clean = seedRawNamespace();
  const cleanCleared = api.clearFoundationStorage(clean.adapters);
  assert.equal(cleanCleared.ok, true, `an unfaulted clear must succeed: ${JSON.stringify(cleanCleared.error || {})}`);
  assert.equal(cleanCleared.value.verifiedEmpty, true);
  assert.equal(cleanCleared.value.clearedKeyCount, declaredCount, 'the clear must report covering every declared step');
  assert.deepEqual(cleanCleared.value.remainingPersonalKeys, []);
  assert.deepEqual(clean.adapters.localStorage.snapshot(), GENERIC_PUBLIC_CACHES, 'exactly the generic public caches may survive an unfaulted clear');
  assert.deepEqual(clean.adapters.sessionStorage.snapshot(), {});

  // Red-ability: one step throws and a second step is silently skipped by a wrapped adapter.
  // The per-step checker must name the skipped key. If it did not, "every other step still
  // deletes" would be inert and a clear that quietly skipped a key would pass.
  const faulted = declared.local[0];
  const skipped = declared.local[1];
  const red = seedRawNamespace();
  red.adapters.localStorage.failRemove(faulted);
  const wrappedAdapters = { localStorage: withSkippedRemoval(red.adapters.localStorage, skipped), sessionStorage: red.adapters.sessionStorage };
  const redCleared = api.clearFoundationStorage(wrappedAdapters);
  assert.equal(redCleared.ok, false, 'a clear that skipped a step must still refuse');
  const redViolations = stepViolations(policy, red.adapters, declared, faulted, red.sentinels);
  assert.deepEqual(redViolations, [`${skipped}: unfaulted step did not delete`], `the per-step checker must name the silently skipped key, got: ${JSON.stringify(redViolations)}`);
});