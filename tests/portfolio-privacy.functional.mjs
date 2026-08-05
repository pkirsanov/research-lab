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
  assert.equal(Object.keys(localStorage.snapshot()).every((key) => /^rlPortfolio/.test(key)), true);
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