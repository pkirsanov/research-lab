import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { ROOT, createStorage, fixture } from './portfolio-survival.support.mjs';

const require = createRequire(import.meta.url);
const MODULE_PATH = resolve(ROOT, 'rlportfolio.js');
const POLICY_PATH = resolve(ROOT, 'portfolio-survival-allocation.config.json');
const NOW = '2026-07-15T14:00:00.000Z';
const NEXT_DAY = '2026-07-16T10:00:00.000Z';
const AFTER_CLEAR = '2026-07-20T08:00:00.000Z';
const RESULT_IDENTITY = `sha256:${'ab12'.repeat(16)}`;
const SUBJECT_ALPHA = 'brief-subject-alpha';
const SUBJECT_BETA = 'brief-subject-beta';
const BENIGN_EXTRA_FIELD = 'alphaBetaGamma';

function loadRuntime() {
  assert.equal(existsSync(MODULE_PATH), true, 'RLPORTFOLIO production module must exist');
  assert.equal(existsSync(POLICY_PATH), true, 'mandatory portfolio policy must exist');
  const api = require('../rlportfolio.js');
  const policy = JSON.parse(readFileSync(POLICY_PATH, 'utf8'));
  assert.equal(api.validatePolicy(policy).ok, true);
  return { api, policy };
}

function behaviorDraft(overrides = {}) {
  return {
    category: 'ticker-research-completed',
    completionConditionId: 'risk-panel-reviewed',
    domain: 'equity-research',
    horizon: 'medium-term',
    resultIdentity: RESULT_IDENTITY,
    sourceSurface: 'risk-xray',
    subjectId: SUBJECT_ALPHA,
    subjectKind: 'ticker',
    ...overrides
  };
}

function portfolioCandidate(api, policy, workspace, name, now = NOW) {
  const preview = api.validateImport('csv', fixture('valid-portfolio.csv'), workspace, policy);
  assert.equal(preview.ok, true);
  const resolved = api.resolveDuplicates(preview.value, 'merge');
  assert.equal(resolved.ok, true);
  const candidate = api.buildWorkspaceCandidate(resolved.value, workspace, { name, now }, policy);
  assert.equal(candidate.ok, true);
  return candidate.value;
}

function mandateCandidate(api, policy, workspace, now = NOW) {
  const draft = api.validateMandateDraft(JSON.parse(fixture('mandate-explicit.json')), workspace, { now }, policy);
  assert.equal(draft.ok, true);
  assert.equal(draft.value.canConfirm, true);
  const candidate = api.buildMandateCandidate(draft.value, workspace, { now }, policy);
  assert.equal(candidate.ok, true);
  return candidate.value;
}

// In-memory portfolio + mandate workspace, the state every relevance consumer reads from.
function researchWorkspace(api, policy) {
  const empty = api.createEmptyWorkspace(policy, NOW);
  assert.equal(empty.ok, true);
  return mandateCandidate(api, policy, portfolioCandidate(api, policy, empty.value, 'Brief relevance portfolio'));
}

function appendEvent(api, policy, workspace, overrides, now = NOW) {
  const result = api.buildBehaviorCandidate(behaviorDraft(overrides), workspace, { now }, policy);
  assert.equal(result.ok, true, `behavior candidate must build: ${JSON.stringify(result.error || {})}`);
  assert.equal(result.value.accepted, true, 'the fixture must append genuinely new evidence, not collapse into a duplicate');
  return result.value.workspace;
}

function projection(api, policy, workspace) {
  const result = api.projectRouteStates(workspace, policy);
  assert.equal(result.ok, true, `route projection must succeed: ${JSON.stringify(result.error || {})}`);
  return result.value;
}

test('only an eligible completion becomes behavior evidence and no excluded source can create or grow one', () => {
  const { api, policy } = loadRuntime();
  const tokens = policy.behavior.forbiddenEventFields;
  assert.equal(tokens.length > 0, true, 'an empty exclusion list would make the per-token attempts vacuous');

  // Start from evidence that already exists. "The count did not change" is a real statement
  // about a populated store here; against an empty one it would hold for any implementation,
  // including one that silently dropped every append.
  const populated = appendEvent(api, policy, researchWorkspace(api, policy), {});
  assert.equal(populated.behaviorEvents.length, 1);
  const survivor = JSON.stringify(populated.behaviorEvents[0]);

  let refused = 0;
  tokens.forEach((token) => {
    const attempt = api.buildBehaviorCandidate({ ...behaviorDraft({ subjectId: SUBJECT_BETA }), [token]: 1 }, populated, { now: NEXT_DAY }, policy);
    assert.equal(attempt.ok, false, `${token} must never create behavior evidence`);
    assert.equal(attempt.error.reason, 'forbidden-behavior-source', `${token} must be refused as an excluded source, not as a generic shape error`);
    assert.equal(populated.behaviorEvents.length, 1, `${token} must not have grown the stored evidence`);
    assert.equal(JSON.stringify(populated.behaviorEvents[0]), survivor, `${token} must not have altered the evidence already held`);
    refused += 1;
  });
  assert.equal(refused, tokens.length, 'every declared token must have been exercised, not merely iterated over');

  // Control: the same one-extra-field shape carrying a name the policy does not exclude fails
  // for a different reason. Without it the refusals above could be caused by the extra field
  // alone and would hold for a name that is not an excluded source at all.
  assert.equal(
    tokens.some((token) => BENIGN_EXTRA_FIELD.toLowerCase().replace(/[^a-z0-9]/g, '').includes(token)),
    false,
    'the control field name must not itself contain a declared token'
  );
  const control = api.buildBehaviorCandidate({ ...behaviorDraft({ subjectId: SUBJECT_BETA }), [BENIGN_EXTRA_FIELD]: 1 }, populated, { now: NEXT_DAY }, policy);
  assert.equal(control.ok, false);
  assert.equal(control.error.reason, 'unknown-field', 'an unexcluded extra name is a shape error, so the refusals above are caused by the token');

  // A clean append on the same workspace still succeeds, so the refusals are caused by the
  // excluded source rather than by the workspace having become unappendable.
  const accepted = api.buildBehaviorCandidate(behaviorDraft({ subjectId: SUBJECT_BETA }), populated, { now: NEXT_DAY }, policy);
  assert.equal(accepted.ok, true);
  assert.equal(accepted.value.accepted, true);
  assert.equal(accepted.value.workspace.behaviorEvents.length, 2);
});

test('route recomposition is invariant to behavior evidence and states that behavior contributes none', () => {
  const { api, policy } = loadRuntime();
  const base = researchWorkspace(api, policy);
  const populated = appendEvent(api, policy, appendEvent(api, policy, base, {}), { subjectId: SUBJECT_BETA });

  // The two workspaces provably differ, so an identical projection is a real invariance
  // rather than a comparison of one workspace against itself.
  assert.equal(base.behaviorEvents.length, 0);
  assert.equal(populated.behaviorEvents.length, 2);
  assert.notEqual(base.semanticFingerprint, populated.semanticFingerprint, 'appending evidence must change workspace identity');

  const baseRoutes = projection(api, policy, base);
  const populatedRoutes = projection(api, policy, populated);
  assert.deepEqual(populatedRoutes, baseRoutes, 'no route state, horizon, constraint, or cash need may move because behavior evidence exists');
  assert.equal(populatedRoutes.behaviorContribution, 'none');
  assert.equal(populatedRoutes.settingsContribution, 'none');
  assert.equal(populatedRoutes.citedMandateFingerprint, baseRoutes.citedMandateFingerprint);
  assert.equal(populatedRoutes.routes.length > 0, true, 'an empty route list would make the invariance above vacuous');
  assert.equal(JSON.stringify(populatedRoutes).includes(SUBJECT_ALPHA), false, 'no subject under research may reach the recomposition output');
  assert.equal(JSON.stringify(populated).includes(SUBJECT_ALPHA), true, 'the subject is genuinely stored, so its absence from the projection is meaningful');

  // Control: the projector is not a constant function. Removing the mandate changes the
  // output, so "identical across behavior states" is a property of behavior specifically.
  const withoutMandate = projection(api, policy, portfolioCandidate(api, policy, api.createEmptyWorkspace(policy, NOW).value, 'Brief relevance portfolio'));
  assert.notDeepEqual(withoutMandate, baseRoutes, 'the projection must be able to differ, or invariance proves nothing');
  assert.equal(withoutMandate.routes[0].mandateDependent.every((entry) => entry.available === false), true);
  assert.equal(withoutMandate.routes[0].mandateDependent.length > 0, true, 'an empty dependent list would make the sweep above vacuous');
});

test('behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);

  const seededPortfolio = store.commitWorkspace(portfolioCandidate(api, policy, opened.value.workspace, 'Brief clear portfolio'), opened.value.workspace.generation, NOW);
  assert.equal(seededPortfolio.ok, true);
  const seeded = store.commitWorkspace(mandateCandidate(api, policy, seededPortfolio.value.workspace), seededPortfolio.value.workspace.generation, NOW);
  assert.equal(seeded.ok, true);
  const baselineRoutes = projection(api, policy, seeded.value.workspace);
  const baselinePortfolioId = seeded.value.workspace.currentPortfolioId;
  const baselineMandateId = seeded.value.workspace.currentMandateId;

  const withEvidence = appendEvent(api, policy, appendEvent(api, policy, seeded.value.workspace, {}), { subjectId: SUBJECT_BETA });
  const committedEvidence = store.commitWorkspace(withEvidence, seeded.value.workspace.generation, NOW);
  assert.equal(committedEvidence.ok, true);

  // ASSERT NON-EMPTY, read back out of committed bytes rather than off the candidate object.
  // Without this the post-clear emptiness below would be satisfied by a store that never
  // persisted the evidence, and by a clear that does nothing at all.
  const reloadedPopulated = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace(NEXT_DAY);
  assert.equal(reloadedPopulated.ok, true);
  assert.equal(reloadedPopulated.value.workspace.behaviorEvents.length, 2, 'the evidence must genuinely be on disk before the clear is meaningful');
  assert.deepEqual(reloadedPopulated.value.workspace.behaviorEvents.map((entry) => entry.subjectId).sort(), [SUBJECT_ALPHA, SUBJECT_BETA]);

  const cleared = api.buildBehaviorClearCandidate(reloadedPopulated.value.workspace, AFTER_CLEAR, policy);
  assert.equal(cleared.ok, true);
  assert.equal(cleared.value.clearedEventCount, 2, 'the reported cleared count must match the proven committed population');
  const committedClear = store.commitWorkspace(cleared.value.workspace, reloadedPopulated.value.workspace.generation, AFTER_CLEAR);
  assert.equal(committedClear.ok, true);

  const recomposed = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace(AFTER_CLEAR);
  assert.equal(recomposed.ok, true);
  assert.equal(recomposed.value.workspace.behaviorEvents.length, 0, 'the next read after a clear carries no behavior evidence');
  assert.equal(recomposed.value.workspace.interestSignals.length, 0);
  assert.deepEqual(projection(api, policy, recomposed.value.workspace), baselineRoutes, 'recomposition after the clear must equal the pre-evidence baseline exactly');
  assert.equal(recomposed.value.workspace.currentPortfolioId, baselinePortfolioId, 'holdings survive a behavior clear');
  assert.equal(recomposed.value.workspace.currentMandateId, baselineMandateId, 'the mandate and its cash needs survive a behavior clear');
  assert.deepEqual(recomposed.value.workspace.portfolioRevisions, seeded.value.workspace.portfolioRevisions);
  assert.deepEqual(recomposed.value.workspace.mandateRevisions, seeded.value.workspace.mandateRevisions);
  assert.equal(JSON.stringify(recomposed.value.workspace).includes(SUBJECT_ALPHA), false, 'the active workspace retains no cleared subject');
});

test('dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference', () => {
  const { api, policy } = loadRuntime();
  const closingCommands = ['dismiss', 'invalidate'];
  assert.equal(closingCommands.every((command) => policy.behavior.outcomeCommands.includes(command)), true, 'the commands under test must be declared');
  const outcomeFields = ['actionId', 'command', 'contractVersion', 'occurredAt', 'outcomeId', 'reason', 'state'];

  let recorded = 0;
  closingCommands.forEach((command) => {
    const outcome = api.reduceActionOutcome(RESULT_IDENTITY, command, 'owner-decision', NOW, policy);
    assert.equal(outcome.ok, true, `${command} is declared and must reduce`);

    // The closed field set IS the "no negative preference" claim. A later `preferenceDelta`,
    // `weight`, or `score` field added to the outcome fails here rather than passing a
    // sweep that only looks for names it already knows about.
    assert.deepEqual(Object.keys(outcome.value).sort(), outcomeFields, `${command} must record exactly the closed outcome fields`);
    assert.equal(outcome.value.reason, 'owner-decision', 'a reason is a safe token, never free text or a rating');
    assert.equal(api.validateActionOutcome(outcome.value, policy).ok, true);

    // An outcome is not evidence. If a closing command ever became a behavior event it would
    // turn a dismissal into a ranking input, which is exactly what SCN-008-012 forbids.
    const asEvent = api.validateBehaviorEvent(outcome.value, policy);
    assert.equal(asEvent.ok, false, `${command} must never validate as behavior evidence`);
    assert.equal(asEvent.error.reason, 'unknown-field');
    recorded += 1;
  });
  assert.equal(recorded, closingCommands.length, 'every closing command must have been exercised, not merely iterated over');

  // Control: the same call shape with a declared command that does not close an action still
  // succeeds, so the refusals above are about the outcome contract and not a dead reducer.
  assert.equal(api.reduceActionOutcome(RESULT_IDENTITY, 'complete', 'owner-decision', NOW, policy).ok, true);
  assert.equal(api.reduceActionOutcome(RESULT_IDENTITY, 'downrank', 'owner-decision', NOW, policy).error.reason, 'unknown-outcome-command', 'no command exists that could express a negative preference');

  const dismissed = api.reduceActionOutcome(RESULT_IDENTITY, 'dismiss', 'owner-decision', NOW, policy).value;
  assert.equal(api.validateActionOutcome({ ...dismissed, preference: -1 }, policy).error.reason, 'forbidden-behavior-source', 'a negative preference is refused by name, not silently stored');
  assert.equal(api.validateActionOutcome({ ...dismissed, [BENIGN_EXTRA_FIELD]: 1 }, policy).error.reason, 'unknown-field', 'so the refusal above is caused by the excluded name rather than by the extra field');

  // A closing command changes nothing a relevance consumer reads.
  const populated = appendEvent(api, policy, researchWorkspace(api, policy), {});
  assert.equal(populated.behaviorEvents.length, 1, 'the invariance below must be measured against real evidence');
  assert.deepEqual(projection(api, policy, populated).behaviorContribution, 'none');
  assert.equal(populated.actionOutcomes.length, 0, 'no closing command has written itself into the workspace as a side effect');
});
