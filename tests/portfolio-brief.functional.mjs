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
const GENERIC_EVIDENCE_IDENTITY = `sha256:${'cd34'.repeat(16)}`;
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
    genericEvidenceIdentity: GENERIC_EVIDENCE_IDENTITY,
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

/* ---------- Scope 05 TP-05-01: four-window direct-scope brief composition ----------
   Three failures are being prevented, and each one looks harmless in isolation.
   (1) Using an observation later than the window's cutoff makes an earlier brief secretly
       clairvoyant, which destroys the ability to audit what was knowable when.
   (2) Merging the four qualification lanes lets an INFERRED interest be read as a HELD
       position, or a held position be read as proof of preference — the authority error
       FR-057 forbids in both directions.
   (3) Filling an empty inferred lane below the behavior floor manufactures the appearance
       of personalisation from too little history. */

const BRIEF_MODULE_PATH = resolve(ROOT, 'rlportfoliobrief.js');
const MARKET_BRIEF_CONFIG = resolve(ROOT, 'market-brief.config.json');

function loadBrief() {
  assert.equal(existsSync(BRIEF_MODULE_PATH), true, 'RLPORTFOLIOBRIEF production module must exist');
  const brief = require('../rlportfoliobrief.js');
  const portfolio = require('../rlportfolio.js');
  const policy = JSON.parse(readFileSync(POLICY_PATH, 'utf8'));
  // Windows are READ from the generic public config; the local composer never declares its own.
  const windows = JSON.parse(readFileSync(MARKET_BRIEF_CONFIG, 'utf8')).windows;
  return { brief, policy, portfolio, windows };
}

const BRIEF_DAY = '2026-07-15';
function ev(id, subjectId, subjectKind, observedAt, materiality, domain) {
  return { id, subjectId, subjectKind, observedAt, materiality, domain: domain || 'equity-research' };
}

// MSFT is held, BND is on the public watchlist, ZZTOP was explicitly researched, and
// 'semiconductors' is a domain reachable only by inference.
function briefInput(overrides = {}) {
  const { brief, policy, windows } = overrides.loaded || loadBrief();
  return Object.assign({
    windows,
    windowId: 'morning',
    publishedAt: `${BRIEF_DAY}T15:05:00.000Z`,
    composedAt: `${BRIEF_DAY}T15:40:00.000Z`,
    holdings: [{ symbol: 'MSFT' }],
    watchlist: ['BND'],
    completions: [
      { subjectId: 'ZZTOP', subjectKind: 'ticker', domain: 'semiconductors', completedAt: `${BRIEF_DAY}T12:00:00.000Z` },
      { subjectId: 'QQQX', subjectKind: 'ticker', domain: 'semiconductors', completedAt: '2026-07-14T12:00:00.000Z' }
    ],
    evidence: [
      ev('e-msft', 'MSFT', 'ticker', `${BRIEF_DAY}T14:30:00.000Z`, 0.9),
      ev('e-bnd', 'BND', 'ticker', `${BRIEF_DAY}T14:00:00.000Z`, 0.5),
      ev('e-zztop', 'ZZTOP', 'ticker', `${BRIEF_DAY}T13:00:00.000Z`, 0.7),
      ev('e-semi', 'semiconductors', 'domain', `${BRIEF_DAY}T13:30:00.000Z`, 0.6)
    ],
    policy
  }, overrides.input || {});
}

test('SCN-008-006 TP-05-01: each window is identified from the generic config and no later observation enters an earlier cutoff', () => {
  const loaded = loadBrief();
  const ids = loaded.windows.map((w) => w.id);
  assert.deepEqual(ids, ['pre-market', 'morning', 'pre-close', 'after-hours'],
    'the composer must consume the four generic windows rather than declaring its own');

  for (const id of ids) {
    const composed = loaded.brief.composeBrief(briefInput({ loaded, input: { windowId: id } }));
    assert.equal(composed.ok, true, `window ${id} must compose: ${JSON.stringify(composed.error || {})}`);
    assert.equal(composed.value.window.id, id, 'the brief names the window it used');
    assert.ok(composed.value.window.etTime, `window ${id} reports its exact ET time`);

    // Three clocks, three distinct fields. Collapsing any pair is what makes a brief unauditable.
    const times = composed.value.times;
    assert.ok(times.evidenceCutoffAt, 'the evidence cutoff is stated');
    assert.equal(times.publishedAt, `${BRIEF_DAY}T15:05:00.000Z`, 'generic publication time is preserved verbatim');
    assert.equal(times.composedAt, `${BRIEF_DAY}T15:40:00.000Z`, 'local composition time is distinct from publication time');
    assert.notEqual(times.evidenceCutoffAt, times.composedAt, 'cutoff and composition time must not be the same clock');
  }

  // An observation AFTER the cutoff must be excluded and counted, never quietly used.
  const cutoffProbe = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      windowId: 'pre-market',
      evidence: [
        ev('e-early', 'MSFT', 'ticker', `${BRIEF_DAY}T10:00:00.000Z`, 0.9),
        ev('e-late', 'MSFT', 'ticker', `${BRIEF_DAY}T19:00:00.000Z`, 0.99)
      ]
    }
  }));
  assert.equal(cutoffProbe.ok, true);
  const usedIds = cutoffProbe.value.lanes.held.flatMap((item) => item.evidenceIds);
  assert.ok(!usedIds.includes('e-late'), 'an observation later than the cutoff must not reach an earlier window');
  assert.equal(cutoffProbe.value.states.excludedAfterCutoff, 1, 'the exclusion is counted rather than silent');
});

test('SCN-008-007 TP-05-01: the four qualification lanes stay separate and a subject is never duplicated across them', () => {
  const loaded = loadBrief();
  const composed = loaded.brief.composeBrief(briefInput({ loaded }));
  assert.equal(composed.ok, true, JSON.stringify(composed.error || {}));
  const lanes = composed.value.lanes;

  assert.deepEqual(lanes.held.map((i) => i.subjectId), ['MSFT']);
  assert.deepEqual(lanes.watchlist.map((i) => i.subjectId), ['BND']);
  assert.deepEqual(lanes.completedResearch.map((i) => i.subjectId), ['ZZTOP']);
  assert.deepEqual(lanes.inferredRelevance.map((i) => i.subjectId), ['semiconductors']);

  assert.equal(lanes.held[0].scopeSource, 'direct-holding');
  assert.equal(lanes.watchlist[0].scopeSource, 'direct-watchlist');
  assert.equal(lanes.completedResearch[0].scopeSource, 'direct-completed-research');
  assert.equal(lanes.inferredRelevance[0].scopeSource, 'behavior-derived',
    'an inferred item must state that it is behaviour-derived, never presented as a direct holding');

  // No inferred subject may appear as held, in either direction.
  const heldIds = new Set(lanes.held.map((i) => i.subjectId));
  for (const item of lanes.inferredRelevance) {
    assert.ok(!heldIds.has(item.subjectId), 'an inferred subject must never be rendered in the Held lane');
  }
  assert.equal(lanes.held[0].impliesPreference, false,
    'a held position is a fact of ownership, not evidence of interest or risk preference');

  // De-duplication by identity: a subject qualifying twice appears ONCE, in the higher-authority
  // lane, and says where else it qualified rather than being listed twice.
  const dual = loaded.brief.composeBrief(briefInput({
    loaded,
    input: { watchlist: ['BND', 'MSFT'] }
  }));
  assert.equal(dual.ok, true);
  assert.deepEqual(dual.value.lanes.held.map((i) => i.subjectId), ['MSFT']);
  assert.ok(!dual.value.lanes.watchlist.some((i) => i.subjectId === 'MSFT'),
    'a held subject must not be duplicated into the watchlist lane');
  assert.deepEqual(dual.value.lanes.held[0].alsoQualifiesVia, ['watchlist'],
    'the second qualification is disclosed rather than dropped or duplicated');
});

test('SCN-008-010 TP-05-01: below the behavior floor the inferred lane is empty and the shortfall is named', () => {
  const loaded = loadBrief();
  const floor = loaded.policy.behavior;

  // One completion on one date — below both minimums.
  const thin = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      completions: [{ subjectId: 'ZZTOP', subjectKind: 'ticker', domain: 'semiconductors', completedAt: `${BRIEF_DAY}T12:00:00.000Z` }]
    }
  }));
  assert.equal(thin.ok, true, JSON.stringify(thin.error || {}));
  assert.deepEqual(thin.value.lanes.inferredRelevance, [],
    'below the floor the inferred lane must be empty rather than filled with speculation');
  assert.equal(thin.value.states.behaviorHistory, 'insufficient-history');
  assert.equal(thin.value.states.behaviorFloor.distinctCompletions, 1);
  assert.equal(thin.value.states.behaviorFloor.requiredCompletions, floor.minimumDistinctCompletions);
  assert.equal(thin.value.states.behaviorFloor.distinctUtcDates, 1);
  assert.equal(thin.value.states.behaviorFloor.requiredUtcDates, floor.minimumDistinctUtcDates);

  // Direct value must survive the shortfall untouched — an empty inferred lane is not an empty brief.
  assert.deepEqual(thin.value.lanes.held.map((i) => i.subjectId), ['MSFT']);
  assert.deepEqual(thin.value.lanes.completedResearch.map((i) => i.subjectId), ['ZZTOP']);

  // At the floor the lane populates, which proves the empty result above was the floor and not a
  // composer that simply never emits inferred items.
  const atFloor = loaded.brief.composeBrief(briefInput({ loaded }));
  assert.equal(atFloor.value.states.behaviorHistory, 'sufficient-history');
  assert.equal(atFloor.value.lanes.inferredRelevance.length, 1);

  // No-material-change is a real state, not an error.
  const quiet = loaded.brief.composeBrief(briefInput({ loaded, input: { evidence: [] } }));
  assert.equal(quiet.ok, true);
  assert.equal(quiet.value.states.materialChange, 'no-material-change');
  assert.equal(quiet.value.states.itemCount, 0);
});

test('SCN-008-010 TP-05-01: unrelated completions cannot jointly clear an inferred domain floor', () => {
  const loaded = loadBrief();
  const composed = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      completions: [
        { subjectId: 'BND', subjectKind: 'ticker', domain: 'bonds', completedAt: '2026-07-14T12:00:00.000Z' },
        { subjectId: 'MSFT', subjectKind: 'ticker', domain: 'equities', completedAt: '2026-07-15T12:00:00.000Z' }
      ],
      evidence: [
        ev('e-bonds', 'bonds', 'domain', `${BRIEF_DAY}T13:00:00.000Z`, 0.6),
        ev('e-equities', 'equities', 'domain', `${BRIEF_DAY}T13:00:00.000Z`, 0.6)
      ]
    }
  }));

  assert.equal(composed.ok, true, JSON.stringify(composed.error || {}));
  assert.equal(composed.value.states.behaviorFloor.satisfied, true,
    'the aggregate history must genuinely clear its floor for this adversary to discriminate');
  assert.deepEqual(composed.value.lanes.inferredRelevance, [],
    'each inferred domain must clear the evidence floor from its own supporting completions');
  assert.deepEqual(composed.value.noAction
    .filter((item) => item.lane === 'inferredRelevance')
    .map((item) => item.subjectId), ['bonds', 'equities'],
    'under-supported inferred domains stay accounted for rather than disappearing');
});

test('SCN-008-007 TP-05-01: the visible queue is bounded by policy and ordered by materiality', () => {
  const loaded = loadBrief();
  const caps = loaded.policy.queue;
  const manyHoldings = ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG'].map((symbol) => ({ symbol }));
  const manyEvidence = manyHoldings.map((h, index) =>
    ev(`e-${h.symbol}`, h.symbol, 'ticker', `${BRIEF_DAY}T13:00:00.000Z`, (index + 1) / 10));

  const composed = loaded.brief.composeBrief(briefInput({
    loaded,
    input: { holdings: manyHoldings, watchlist: [], evidence: manyEvidence }
  }));
  assert.equal(composed.ok, true, JSON.stringify(composed.error || {}));
  assert.equal(composed.value.lanes.held.length, caps.directActionCap,
    'the direct queue is bounded by the declared cap rather than growing without limit');
  // Highest materiality first, so the cap keeps what matters most instead of an arbitrary slice.
  assert.deepEqual(composed.value.lanes.held.map((i) => i.subjectId), ['GGG', 'FFF', 'EEE', 'DDD', 'CCC']);
  assert.equal(composed.value.states.suppressedByCap, manyHoldings.length - caps.directActionCap,
    'items dropped by the cap are counted, so a bounded queue is not a silent one');
});

test('FR-064 a scoped subject with no surviving evidence is explained rather than dropped', () => {
  const loaded = loadBrief();

  /* CCC is held but has NO evidence record at all; DDD has evidence stamped AFTER the cutoff.
   * Before this behaviour existed both simply vanished from the brief, which is the exact
   * failure FR-064 names: the reader cannot tell "nothing to do" from "we do not know". */
  const composed = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      holdings: [{ symbol: 'MSFT' }, { symbol: 'CCC' }, { symbol: 'DDD' }],
      evidence: [
        ev('e-msft', 'MSFT', 'ticker', `${BRIEF_DAY}T14:30:00.000Z`, 0.9),
        ev('e-ddd', 'DDD', 'ticker', `${BRIEF_DAY}T23:59:00.000Z`, 0.9)
      ]
    }
  }));
  assert.equal(composed.ok, true);

  const reasons = Object.fromEntries(composed.value.noAction.map((e) => [e.subjectId, e.reason]));
  assert.equal(reasons.CCC, 'evidence-unavailable',
    'a subject with no observation at all is reported as unavailable, not omitted');
  assert.equal(reasons.DDD, 'evidence-after-cutoff',
    'a subject whose only evidence post-dates the cutoff is distinguished from one never observed');

  // Neither may leak into a lane: being explained is not the same as being actionable.
  const held = composed.value.lanes.held.map((i) => i.subjectId);
  assert.equal(held.includes('CCC'), false);
  assert.equal(held.includes('DDD'), false);

  // Every no-action entry still declares the scope that put it in view.
  for (const entry of composed.value.noAction) {
    assert.ok(entry.scopeSource, `${entry.subjectId} must declare how it entered scope`);
  }
  assert.equal(composed.value.states.noActionCount, composed.value.noAction.length);
});

test('FR-064 subjects trimmed by the visible cap are accounted for, not silently discarded', () => {
  const loaded = loadBrief();
  const caps = loaded.policy.queue;
  const overflow = caps.directActionCap + 2;
  const holdings = [];
  const evidence = [];
  for (let index = 0; index < overflow; index += 1) {
    const symbol = `S${String(index).padStart(2, '0')}`;
    holdings.push({ symbol });
    evidence.push(ev(`e-${symbol}`, symbol, 'ticker', `${BRIEF_DAY}T14:00:00.000Z`, index / 100));
  }

  const composed = loaded.brief.composeBrief(briefInput({ loaded, input: { holdings, evidence, watchlist: [], completions: [] } }));
  assert.equal(composed.ok, true);

  const trimmed = composed.value.noAction.filter((e) => e.reason === 'below-visible-queue-cap');
  assert.equal(trimmed.length, overflow - caps.directActionCap,
    'every item the cap removed is explained, so the bound is visible rather than hidden');

  // The two lowest-materiality symbols are the ones trimmed.
  assert.deepEqual(trimmed.map((e) => e.subjectId).sort(), ['S00', 'S01']);
});

test('FR-060 and FR-061 each item routes to its owning tool or names the gap', () => {
  const loaded = loadBrief();
  const owner = { toolId: 'risk-xray', href: 'risk-xray.html' };

  const composed = loaded.brief.composeBrief(briefInput({ loaded, input: { owners: { MSFT: owner } } }));
  assert.equal(composed.ok, true);

  const msft = composed.value.lanes.held.find((i) => i.subjectId === 'MSFT');
  assert.deepEqual(msft.owner, owner, 'the brief links to the owning tool instead of restating it');
  assert.equal(msft.unownedCapability, false);

  // BND has no owner. That gap is NAMED, which is different from inventing a specialist result.
  const bnd = composed.value.lanes.watchlist.find((i) => i.subjectId === 'BND');
  assert.equal(bnd.owner, null);
  assert.equal(bnd.unownedCapability, true,
    'an unowned subject is reported as a capability gap rather than given a fabricated result');
});

test('FR-067 the brief identity binds revision window cutoff policy and action set', () => {
  const loaded = loadBrief();
  const base = loaded.brief.composeBrief(briefInput({ loaded, input: { portfolioRevisionId: 'rev-1' } }));
  assert.equal(base.ok, true);

  const identity = base.value.identity;
  assert.equal(identity.portfolioRevisionId, 'rev-1');
  assert.equal(identity.windowId, 'morning');
  assert.equal(identity.evidenceCutoffAt, base.value.times.evidenceCutoffAt);
  assert.equal(identity.composedAt, base.value.times.composedAt);
  assert.equal(identity.behaviorPolicyVersion, loaded.policy.contractVersion,
    'the policy version in force is part of what the brief IS, not incidental metadata');

  /* The load-bearing property: two briefs that differ ONLY in their resulting action set must not
   * share an identity. Without the action signature they would, and a changed brief could be
   * mistaken for the same one. */
  const fewer = loaded.brief.composeBrief(briefInput({
    loaded,
    input: { portfolioRevisionId: 'rev-1', holdings: [], watchlist: [], completions: [] }
  }));
  assert.equal(fewer.ok, true);
  assert.notEqual(fewer.value.identity.actionSignature, identity.actionSignature,
    'a different action set yields a different identity');

  // Same inputs must reproduce the same signature, or the identity would be useless for comparison.
  const repeat = loaded.brief.composeBrief(briefInput({ loaded, input: { portfolioRevisionId: 'rev-1' } }));
  assert.equal(repeat.value.identity.actionSignature, identity.actionSignature);
});

test('FR-041 the local action-history cutoff is a fourth clock and is actually enforced', () => {
  const loaded = loadBrief();
  const maxAgeDays = loaded.policy.behavior.maximumEvidenceAgeDays;
  assert.ok(Number.isFinite(maxAgeDays), 'the policy must declare an evidence age limit');

  const base = loaded.brief.composeBrief(briefInput({ loaded }));
  assert.equal(base.ok, true);

  const times = base.value.times;
  // Four DISTINCT clocks. Collapsing any pair would let one question answer another.
  const distinct = new Set([times.evidenceCutoffAt, times.publishedAt, times.composedAt, times.actionHistoryCutoffAt]);
  assert.equal(distinct.size, 4, 'evidence cutoff, publication, composition and action-history cutoff stay separate');

  const expected = new Date(Date.parse(times.composedAt) - maxAgeDays * 86400000).toISOString();
  assert.equal(times.actionHistoryCutoffAt, expected,
    'the action-history cutoff is derived from declared policy, not chosen locally');

  /* The enforcement, which is the point. A completion older than the limit must stop counting.
   * Before this, `maximumEvidenceAgeDays` was declared and ignored, so activity from years ago
   * kept clearing the behaviour floor forever. */
  const ancient = '2019-01-01T12:00:00.000Z';
  const stale = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      completions: [
        { subjectId: 'ZZTOP', subjectKind: 'ticker', domain: 'semiconductors', completedAt: ancient },
        { subjectId: 'QQQX', subjectKind: 'ticker', domain: 'semiconductors', completedAt: ancient }
      ]
    }
  }));
  assert.equal(stale.ok, true);
  assert.equal(stale.value.states.excludedStaleCompletions, 2,
    'completions past the age limit are excluded and counted, not silently kept');
  assert.equal(stale.value.states.behaviorHistory, 'insufficient-history',
    'expired activity cannot clear the behaviour floor');
  assert.deepEqual(stale.value.lanes.completedResearch, [],
    'an expired completion cannot qualify a subject');
});

test('FR-057 a repeat over the same evidence is not reported as independent confirmation', () => {
  const loaded = loadBrief();

  const first = loaded.brief.composeBrief(briefInput({ loaded, input: { windowId: 'morning' } }));
  assert.equal(first.ok, true);
  const msftFirst = first.value.lanes.held.find((i) => i.subjectId === 'MSFT');
  assert.equal(msftFirst.confirmationBasis, 'no-prior-window',
    'with nothing to compare against, the brief says so rather than implying novelty');

  // Same evidence seen again in a later window: a repeat, NOT a second independent signal.
  const repeated = loaded.brief.composeBrief(briefInput({
    loaded,
    input: { windowId: 'pre-close', priorEvidenceIds: { MSFT: msftFirst.evidenceIds } }
  }));
  assert.equal(repeated.ok, true);
  assert.equal(repeated.value.lanes.held.find((i) => i.subjectId === 'MSFT').confirmationBasis,
    'same-evidence-as-prior-window',
    'the same underlying evidence must not masquerade as confirmation');

  // Genuinely new evidence is distinguished from a repeat.
  const advanced = loaded.brief.composeBrief(briefInput({
    loaded,
    input: { windowId: 'pre-close', priorEvidenceIds: { MSFT: ['some-older-id'] } }
  }));
  assert.equal(advanced.value.lanes.held.find((i) => i.subjectId === 'MSFT').confirmationBasis,
    'new-evidence-since-prior-window');
});

test('FR-059 a general-interest item states it is not a known holding and ranks below direct work', () => {
  const loaded = loadBrief();
  const composed = loaded.brief.composeBrief(briefInput({ loaded }));
  assert.equal(composed.ok, true);

  const held = composed.value.lanes.held;
  assert.ok(held.length, 'the fixture must produce at least one direct holding');
  for (const item of held) {
    assert.equal(item.notAKnownHolding, false, 'a held item is a known holding');
  }

  // Every non-held lane declares the negative EXPLICITLY rather than leaving it to lane position.
  for (const lane of ['watchlist', 'completedResearch', 'inferredRelevance']) {
    for (const item of composed.value.lanes[lane]) {
      assert.equal(item.notAKnownHolding, true,
        `${item.subjectId} in ${lane} must state it is not a known holding`);
    }
  }

  // Lane order is the visible ranking reason: direct portfolio work is never displaced by inferred.
  assert.equal(loaded.brief.laneOrder[0], 'held');
  assert.equal(loaded.brief.laneOrder[loaded.brief.laneOrder.length - 1], 'inferredRelevance');
});

test('FR-050 partial or stale evidence keeps its state and cannot support an action as if fresh', () => {
  const loaded = loadBrief();

  const withStates = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      holdings: [{ symbol: 'MSFT' }, { symbol: 'AAA' }, { symbol: 'BBB' }],
      watchlist: [],
      completions: [],
      evidence: [
        { ...ev('e-msft', 'MSFT', 'ticker', `${BRIEF_DAY}T14:30:00.000Z`, 0.9), coverageState: 'complete' },
        { ...ev('e-aaa', 'AAA', 'ticker', `${BRIEF_DAY}T14:00:00.000Z`, 0.8), coverageState: 'partial' },
        { ...ev('e-bbb', 'BBB', 'ticker', `${BRIEF_DAY}T14:00:00.000Z`, 0.7), coverageState: 'stale' }
      ]
    }
  }));
  assert.equal(withStates.ok, true);

  const held = Object.fromEntries(withStates.value.lanes.held.map((i) => [i.subjectId, i]));

  // Degraded evidence is RETAINED — hiding it would be its own distortion — but declares itself.
  assert.equal(held.AAA.evidenceState, 'partial');
  assert.equal(held.BBB.evidenceState, 'stale');
  assert.equal(held.MSFT.evidenceState, 'complete');

  // Only complete coverage may back a current action as fresh.
  assert.equal(held.MSFT.supportsCurrentActionAsFresh, true);
  assert.equal(held.AAA.supportsCurrentActionAsFresh, false,
    'partial coverage must not present as fresh');
  assert.equal(held.BBB.supportsCurrentActionAsFresh, false,
    'stale coverage must not present as fresh');

  /* The WORST state across a subject's records wins. One good day inside a mostly-absent series
   * must not launder the whole subject into looking fresh. */
  const mixed = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      holdings: [{ symbol: 'MIX' }],
      watchlist: [],
      completions: [],
      evidence: [
        { ...ev('e-mix-1', 'MIX', 'ticker', `${BRIEF_DAY}T13:00:00.000Z`, 0.4), coverageState: 'complete' },
        { ...ev('e-mix-2', 'MIX', 'ticker', `${BRIEF_DAY}T14:00:00.000Z`, 0.5), coverageState: 'stale' }
      ]
    }
  }));
  assert.equal(mixed.value.lanes.held.find((i) => i.subjectId === 'MIX').evidenceState, 'stale',
    'the most degraded state across a subject wins, so one fresh record cannot mask the rest');

  // An unmeasured subject must not read as verified-fresh either.
  const unmeasured = loaded.brief.composeBrief(briefInput({
    loaded,
    input: { holdings: [{ symbol: 'MSFT' }], watchlist: [], completions: [] }
  }));
  const plain = unmeasured.value.lanes.held.find((i) => i.subjectId === 'MSFT');
  assert.equal(plain.evidenceState, 'unmeasured');
  assert.equal(plain.supportsCurrentActionAsFresh, false,
    '"we did not check" must never present as "we checked and it is fine"');
});

test('SCN-008-008 TP-06-01: every item explains why it appears with the full FR-045 disclosure', () => {
  const loaded = loadBrief();

  /* Three distinct completions on two distinct dates in one domain, so the behaviour floor is
   * cleared and the inferred lane is genuinely populated. Without that the disclosure below
   * would be asserted against an empty lane and prove nothing. */
  const day = BRIEF_DAY;
  const composed = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      completions: [
        { subjectId: 'ZZTOP', subjectKind: 'ticker', domain: 'semiconductors', category: 'ticker-research-completed', horizon: 'medium-term', completedAt: `${day}T12:00:00.000Z` },
        { subjectId: 'QQQX', subjectKind: 'ticker', domain: 'semiconductors', category: 'risk-analysis-completed', horizon: 'medium-term', completedAt: '2026-07-14T12:00:00.000Z' }
      ],
      owners: { MSFT: { toolId: 'risk-xray', href: 'risk-xray.html' } }
    }
  }));
  assert.equal(composed.ok, true);

  const inferred = composed.value.lanes.inferredRelevance;
  assert.ok(inferred.length, 'the inferred lane must be populated for this disclosure to mean anything');

  const REQUIRED = ['whyShown', 'evidenceEventCategories', 'relevanceConfidence', 'horizon',
    'recency', 'evidenceState', 'triggerCondition', 'completionCondition',
    'invalidationCondition', 'deepLink', 'researchVerb'];

  for (const lane of loaded.brief.laneOrder) {
    for (const item of composed.value.lanes[lane]) {
      for (const field of REQUIRED) {
        assert.ok(field in item.explanation,
          `${item.subjectId} (${lane}) must disclose ${field}`);
      }
      // FR-046: relevance confidence is on its own scale and cannot read as a success probability.
      assert.equal(item.explanation.confidenceKind, 'relevance-only');
      // FR-052/FR-053: only research verbs, never an order verb.
      assert.ok(loaded.brief.researchVerbs.includes(item.explanation.researchVerb),
        `${item.subjectId} uses research verb "${item.explanation.researchVerb}"`);
      // FR-054: an action that cannot end becomes a permanent prompt across repeated windows.
      assert.ok(item.explanation.completionCondition);
      assert.ok(item.explanation.invalidationCondition);
    }
  }

  // A behaviour-derived item names the deliberate completions behind it, not passive activity.
  const domainItem = inferred[0];
  assert.match(domainItem.explanation.whyShown, /explicitly completed research action/);
  assert.ok(loaded.brief.relevanceConfidenceScale.includes(domainItem.explanation.relevanceConfidence),
    'relevance confidence uses the declared relevance vocabulary');
  assert.ok(domainItem.explanation.evidenceEventCategories.length,
    'the supporting event categories are named rather than summarised away');

  // Direct-scope items are explicitly marked as not carrying a relevance score at all.
  const msft = composed.value.lanes.held.find((i) => i.subjectId === 'MSFT');
  assert.equal(msft.explanation.relevanceConfidence, 'not-applicable-direct-scope',
    'a holding is in scope by ownership, so a relevance score would be a fabricated inference');
  assert.equal(msft.explanation.deepLink, 'risk-xray.html');
});

test('SCN-008-008 TP-06-01: recency decays on the declared half-life and expires past the age limit', () => {
  const loaded = loadBrief();
  const behavior = loaded.policy.behavior;

  const recent = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      completions: [
        { subjectId: 'ZZTOP', subjectKind: 'ticker', domain: 'semiconductors', category: 'ticker-research-completed', completedAt: `${BRIEF_DAY}T12:00:00.000Z` },
        { subjectId: 'QQQX', subjectKind: 'ticker', domain: 'semiconductors', category: 'ticker-research-completed', completedAt: '2026-07-14T12:00:00.000Z' }
      ]
    }
  }));
  const fresh = recent.value.lanes.inferredRelevance[0];
  assert.equal(fresh.explanation.recency.state, 'current');
  assert.ok(fresh.explanation.recency.weight > 0.9,
    'a same-day completion carries nearly full weight under the declared half-life');

  /* Weight must FALL with age rather than staying flat. A decay field that never decays is
   * decoration, and would let a months-old interest present exactly like a fresh one. */
  const halfLifeAgo = new Date(Date.parse(`${BRIEF_DAY}T15:40:00.000Z`) - behavior.halfLifeDays * 86400000).toISOString();
  // BOTH completions must be at least a half-life old, or the NEWEST would be the other one and
  // the weight measured below would not be the half-life case at all.
  const dayBefore = new Date(Date.parse(halfLifeAgo) - 86400000).toISOString();
  const older = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      completions: [
        { subjectId: 'ZZTOP', subjectKind: 'ticker', domain: 'semiconductors', category: 'ticker-research-completed', completedAt: halfLifeAgo },
        { subjectId: 'QQQX', subjectKind: 'ticker', domain: 'semiconductors', category: 'ticker-research-completed', completedAt: dayBefore }
      ]
    }
  }));
  const aged = older.value.lanes.inferredRelevance[0];
  assert.ok(aged.explanation.recency.weight < fresh.explanation.recency.weight,
    'weight must fall with age, otherwise the decay field is decoration');
  assert.ok(Math.abs(aged.explanation.recency.weight - 0.5) < 0.05,
    'at exactly one half-life the weight is about one half');
  /* The boundary is INCLUSIVE: at exactly `recentSupportDays` the support is still current, and
   * only past it does it decay. Asserting the exact boundary rather than a comfortable distance
   * from it is what makes an off-by-one in either direction detectable. */
  assert.equal(aged.explanation.recency.state, 'current',
    'at exactly recentSupportDays the support is still current');

  const pastRecent = new Date(Date.parse(`${BRIEF_DAY}T15:40:00.000Z`) - (behavior.recentSupportDays + 1) * 86400000).toISOString();
  const decaying = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      completions: [
        { subjectId: 'ZZTOP', subjectKind: 'ticker', domain: 'semiconductors', category: 'ticker-research-completed', completedAt: pastRecent },
        { subjectId: 'QQQX', subjectKind: 'ticker', domain: 'semiconductors', category: 'ticker-research-completed', completedAt: new Date(Date.parse(pastRecent) - 86400000).toISOString() }
      ]
    }
  }));
  assert.equal(decaying.value.lanes.inferredRelevance[0].explanation.recency.state, 'decaying',
    'one day past the recent-support boundary the support is reported as decaying');
});

test('SCN-008-009 TP-06-01: settings and passive activity never become inferred interests', () => {
  const loaded = loadBrief();

  /* The load-bearing property is structural: only entries present in `completions` — which the
   * privacy layer populates from EXPLICIT completion commands — can support an interest. Passing
   * setting-shaped and passive-shaped records proves they cannot manufacture a lane entry. */
  const composed = loaded.brief.composeBrief(briefInput({
    loaded,
    input: {
      holdings: [],
      watchlist: [],
      completions: [],
      evidence: [
        ev('e-setting', 'displayMode', 'ticker', `${BRIEF_DAY}T14:00:00.000Z`, 0.9),
        ev('e-passive', 'scrollDepth', 'ticker', `${BRIEF_DAY}T14:00:00.000Z`, 0.9)
      ]
    }
  }));
  assert.equal(composed.ok, true);

  // Evidence alone cannot qualify a subject; qualification comes from holdings, watchlist, or an
  // explicit completion. Nothing was in any of those, so every lane is empty.
  for (const lane of loaded.brief.laneOrder) {
    assert.deepEqual(composed.value.lanes[lane], [],
      `${lane} must stay empty when nothing was explicitly completed`);
  }
  assert.equal(composed.value.states.behaviorHistory, 'insufficient-history');
  assert.equal(composed.value.states.materialChange, 'no-material-change');
});

test('SCN-008-034 TP-06-01: no authored action carries an order verb or a size instruction', () => {
  const loaded = loadBrief();
  const composed = loaded.brief.composeBrief(briefInput({ loaded }));
  assert.equal(composed.ok, true);

  /* Screened as a closed ALLOW list on the verb plus a deny scan over the whole rendered payload.
   * The allow list is what actually holds the line; the deny scan catches an order instruction
   * smuggled into free text, which the verb check alone would miss. */
  const BANNED = /\b(buy|sell|short|order|trade size|position size|rebalance|allocate now|execute|suitab)/i;
  const payload = JSON.stringify(composed.value);
  assert.equal(BANNED.test(payload), false,
    'no order verb, size instruction, or suitability claim may appear anywhere in the brief payload');

  for (const lane of loaded.brief.laneOrder) {
    for (const item of composed.value.lanes[lane]) {
      assert.ok(loaded.brief.researchVerbs.includes(item.explanation.researchVerb));
      assert.equal(item.impliesPreference, false,
        'holding something is not evidence of preferring it');
    }
  }
});

/* ---------- Scope 18 TP-18-01/04: canonical behavior identity and rank ---------- */

const SECOND_RESULT_IDENTITY = `sha256:${'ef56'.repeat(16)}`;
const SECOND_EVIDENCE_IDENTITY = `sha256:${'7890'.repeat(16)}`;
const BEHAVIOR_CUTOFF = '2026-07-15T15:40:00.000Z';

function canonicalBehaviorRecord(policy, overrides = {}) {
  return {
    category: 'ticker-research-completed',
    completionConditionId: 'risk-panel-reviewed',
    domain: 'equity-research',
    genericEvidenceIdentity: GENERIC_EVIDENCE_IDENTITY,
    horizon: 'medium-term',
    occurredAt: '2026-07-15T03:30:00.000Z',
    policyVersion: policy.behavior.contractVersion,
    resultIdentity: RESULT_IDENTITY,
    sourceSurface: 'risk-xray',
    subjectId: SUBJECT_ALPHA,
    subjectKind: 'ticker',
    ...overrides
  };
}

function canonicalAction(overrides = {}) {
  return {
    actionId: 'action-inferred-alpha',
    datedUrgency: 'none',
    directAuthority: 'inferred-relevance',
    evidenceState: 'current',
    explicitExposure: 'none',
    integrity: 'verified',
    lane: 'inferredRelevance',
    relevanceScore: 0.75,
    subject: SUBJECT_ALPHA,
    subjectId: SUBJECT_ALPHA,
    triggerState: 'active',
    ...overrides
  };
}

test('SCN-008-044 behavior identity civil time distinct floors and global ranking are canonical', () => {
  const loaded = loadBrief();
  const base = canonicalBehaviorRecord(loaded.policy);
  const identityVariants = [
    canonicalBehaviorRecord(loaded.policy, { category: 'risk-analysis-completed' }),
    canonicalBehaviorRecord(loaded.policy, { subjectKind: 'domain' }),
    canonicalBehaviorRecord(loaded.policy, { subjectId: SUBJECT_BETA }),
    canonicalBehaviorRecord(loaded.policy, { domain: 'fixed-income-research' }),
    canonicalBehaviorRecord(loaded.policy, { horizon: 'long-term' }),
    canonicalBehaviorRecord(loaded.policy, { sourceSurface: 'path-lab' }),
    canonicalBehaviorRecord(loaded.policy, { resultIdentity: SECOND_RESULT_IDENTITY }),
    canonicalBehaviorRecord(loaded.policy, { genericEvidenceIdentity: SECOND_EVIDENCE_IDENTITY }),
    canonicalBehaviorRecord(loaded.policy, { completionConditionId: 'path-review-complete' }),
    canonicalBehaviorRecord(loaded.policy, { policyVersion: 'portfolio-behavior-policy/v2' })
  ];
  const sameSemanticLaterOccurrence = canonicalBehaviorRecord(loaded.policy, {
    occurredAt: '2026-07-15T04:30:00.000Z'
  });

  const deduped = loaded.brief.dedupeBehaviorEvents({
    behaviorCutoffAt: BEHAVIOR_CUTOFF,
    events: [base, sameSemanticLaterOccurrence, ...identityVariants],
    policy: loaded.policy
  });
  assert.equal(deduped.ok, true, JSON.stringify(deduped.error || {}));
  assert.equal(deduped.value.semanticEvents.length, 11,
    'only the equal ten-field semantic identity collapses; every required identity dimension remains distinct');
  assert.equal(deduped.value.occurrences.length, 12,
    'semantic collapse must retain both occurrence records rather than erasing their civil dates');
  assert.equal(deduped.value.semanticEvents[0].eventIdentity.startsWith('sha256:'), true);
  assert.deepEqual(
    deduped.value.occurrences.slice(0, 2).map((entry) => entry.newYorkCivilDate),
    ['2026-07-14', '2026-07-15'],
    'America/New_York, not a UTC slice, owns the civil-date boundary'
  );
  assert.equal(deduped.value.occurrences[0].contractVersion, 'BehaviorOccurrence/v1');

  const stored = loaded.portfolio.buildBehaviorEvent(
    {
      category: base.category,
      completionConditionId: base.completionConditionId,
      domain: base.domain,
      genericEvidenceIdentity: base.genericEvidenceIdentity,
      horizon: base.horizon,
      resultIdentity: base.resultIdentity,
      sourceSurface: base.sourceSurface,
      subjectId: base.subjectId,
      subjectKind: base.subjectKind
    },
    { now: base.occurredAt },
    loaded.policy
  );
  assert.equal(stored.ok, true, JSON.stringify(stored.error || {}));
  assert.equal(stored.value.eventIdentity, deduped.value.semanticEvents[0].eventIdentity,
    'storage and brief de-duplication must use the same semantic identity');
  assert.deepEqual(stored.value.occurrence, deduped.value.occurrences[0]);

  const eligibleSecondIdentity = canonicalBehaviorRecord(loaded.policy, {
    genericEvidenceIdentity: SECOND_EVIDENCE_IDENTITY,
    occurredAt: '2026-07-15T04:30:00.000Z',
    resultIdentity: SECOND_RESULT_IDENTITY,
    subjectId: SUBJECT_BETA
  });
  const future = canonicalBehaviorRecord(loaded.policy, {
    genericEvidenceIdentity: `sha256:${'1357'.repeat(16)}`,
    occurredAt: '2026-07-15T16:00:00.000Z',
    resultIdentity: `sha256:${'2468'.repeat(16)}`,
    subjectId: 'brief-subject-future'
  });
  const interests = loaded.brief.deriveInterestSignals({
    behaviorCutoffAt: BEHAVIOR_CUTOFF,
    events: [base, sameSemanticLaterOccurrence, eligibleSecondIdentity, future],
    policy: loaded.policy
  });
  assert.equal(interests.ok, true, JSON.stringify(interests.error || {}));
  assert.equal(interests.value.eligibleOccurrences.length, 3);
  assert.equal(interests.value.quarantinedOccurrences.length, 1);
  assert.equal(interests.value.quarantinedOccurrences[0].error.code, 'P008-BEHAVIOR-TIME');
  assert.equal(interests.value.quarantinedOccurrences[0].occurrence.occurrenceId.startsWith('sha256:'), true);
  assert.equal(interests.value.interestSignals[0].floor.distinctCompletionIdentities, 2);
  assert.equal(interests.value.interestSignals[0].floor.distinctNewYorkCivilDates, 2);
  assert.equal(interests.value.interestSignals[0].floor.satisfied, true);
  assert.equal(interests.value.interestSignals[0].supportingOccurrenceIds.includes(
    interests.value.quarantinedOccurrences[0].occurrence.occurrenceId), false,
  'a future occurrence is recorded for audit but contributes no score or floor support');

  const thin = loaded.brief.deriveInterestSignals({
    behaviorCutoffAt: BEHAVIOR_CUTOFF,
    events: [base, { ...base }, { ...base }],
    policy: loaded.policy
  });
  assert.equal(thin.ok, true);
  assert.equal(thin.value.interestSignals[0].floor.rawOccurrenceCount, 3,
    'the adversarial raw count is present so the distinct-count assertion is not vacuous');
  assert.equal(thin.value.interestSignals[0].floor.distinctCompletionIdentities, 1);
  assert.equal(thin.value.interestSignals[0].floor.distinctNewYorkCivilDates, 1);
  assert.equal(thin.value.interestSignals[0].floor.satisfied, false,
    'repeated rows can satisfy neither the completion-identity floor nor the civil-date floor');

  const rankPolicy = JSON.parse(JSON.stringify(loaded.policy));
  rankPolicy.queue.visibleActionCap = 3;
  const actions = [
    canonicalAction(),
    canonicalAction({ actionId: 'action-held-zeta', directAuthority: 'held', explicitExposure: 'held', lane: 'held', relevanceScore: 0.05, subject: 'ZZZ', subjectId: 'ZZZ' }),
    canonicalAction({ actionId: 'action-watch-beta', directAuthority: 'watchlist', lane: 'watchlist', relevanceScore: 0.95, subject: 'BBB', subjectId: 'BBB' }),
    canonicalAction({ actionId: 'action-held-alpha', directAuthority: 'held', explicitExposure: 'held', lane: 'held', relevanceScore: 0.05, subject: 'AAA', subjectId: 'AAA' }),
    canonicalAction({ actionId: 'action-completed-gamma', directAuthority: 'completed-research', lane: 'completedResearch', relevanceScore: 0.9, subject: 'CCC', subjectId: 'CCC' })
  ];
  const ranked = loaded.brief.rankResearchActions({
    actions,
    behaviorCutoffAt: BEHAVIOR_CUTOFF,
    genericWindowIdentity: `sha256:${'aaaa'.repeat(16)}`,
    interestResult: interests.value,
    policy: rankPolicy
  });
  assert.equal(ranked.ok, true, JSON.stringify(ranked.error || {}));
  assert.equal(ranked.value.contractVersion, 'BehaviorRankResult/v1');
  assert.equal(ranked.value.visibleActionCap, 3);
  assert.deepEqual(ranked.value.rankedActions.map((entry) => entry.actionId),
    ['action-held-alpha', 'action-held-zeta', 'action-watch-beta'],
  'one global sort keeps direct authority ahead of relevance and resolves equal tuples by subject');
  assert.deepEqual(ranked.value.suppressedActions.map((entry) => entry.actionId),
    ['action-completed-gamma', 'action-inferred-alpha']);
  assert.equal(ranked.value.suppressedActions.every((entry) => entry.suppressionReason === 'below-global-cap'), true);
  assert.equal(ranked.value.rankedActions.every((entry) => entry.rankReason.tieBreakers.length > 0), true,
    'every visible row exposes deterministic tuple and tie reasoning');
  assert.equal(Object.isFrozen(ranked.value), true);
  assert.equal(Object.isFrozen(ranked.value.rankedActions), true);
  assert.equal(Object.isFrozen(ranked.value.rankedActions[0].rankReason), true);

  const repeatedRank = loaded.brief.rankResearchActions({
    actions: actions.slice().reverse(),
    behaviorCutoffAt: BEHAVIOR_CUTOFF,
    genericWindowIdentity: `sha256:${'aaaa'.repeat(16)}`,
    interestResult: interests.value,
    policy: rankPolicy
  });
  assert.equal(repeatedRank.value.rankingFingerprint, ranked.value.rankingFingerprint,
    'input order cannot alter the canonical ranking fingerprint');

  const composed = loaded.brief.composePortfolioBrief({
    ...briefInput({ loaded }),
    behaviorRankResult: ranked.value
  });
  assert.equal(composed.ok, true, JSON.stringify(composed.error || {}));
  assert.strictEqual(composed.value.behaviorRankResult, ranked.value,
    'composition consumes the immutable result object rather than independently sorting');
  assert.deepEqual(composed.value.rankedActions.map((entry) => entry.actionId),
    ranked.value.rankedActions.map((entry) => entry.actionId));
  const why = ranked.value.rankedActions.map((entry) => loaded.brief.whyShown(ranked.value, entry.actionId));
  assert.equal(why.every((entry) => entry.ok), true);
  assert.deepEqual(why.map((entry) => entry.value.actionId), ranked.value.rankedActions.map((entry) => entry.actionId));
  assert.deepEqual(why.map((entry) => entry.value.rankReason), ranked.value.rankedActions.map((entry) => entry.rankReason));
});

test('Adversarial: behavior identity and temporal guards prevent false relevance', () => {
  const loaded = loadBrief();
  const base = canonicalBehaviorRecord(loaded.policy);
  const distinct = canonicalBehaviorRecord(loaded.policy, {
    genericEvidenceIdentity: SECOND_EVIDENCE_IDENTITY,
    resultIdentity: SECOND_RESULT_IDENTITY
  });
  const events = [base, distinct];
  const canonical = loaded.brief.dedupeBehaviorEvents({
    behaviorCutoffAt: BEHAVIOR_CUTOFF,
    events,
    policy: loaded.policy
  });
  assert.equal(canonical.ok, true);

  const reducedIdentity = (entry) => [
    entry.category, entry.subjectId, entry.domain, entry.completionConditionId,
    entry.occurredAt.slice(0, 10)
  ].join('|');
  assert.equal(new Set(events.map(reducedIdentity)).size, 1,
    'the shipped reduced key really would collapse the adversarial result/evidence pair');
  assert.equal(canonical.value.semanticEvents.length, 2,
    'the canonical key must make the reduced-identity alternative fail');

  const future = canonicalBehaviorRecord(loaded.policy, {
    occurredAt: '2026-07-15T16:40:00.000Z',
    resultIdentity: `sha256:${'1111'.repeat(16)}`,
    genericEvidenceIdentity: `sha256:${'2222'.repeat(16)}`
  });
  const naiveFutureAgeDays = (Date.parse(BEHAVIOR_CUTOFF) - Date.parse(future.occurredAt)) / 86400000;
  const naiveFutureWeight = Math.pow(0.5, naiveFutureAgeDays / loaded.policy.behavior.halfLifeDays);
  assert.equal(naiveFutureWeight > 1, true,
    'the old exponential formula genuinely rewards a future timestamp, so the guard is load-bearing');
  const guarded = loaded.brief.deriveInterestSignals({
    behaviorCutoffAt: BEHAVIOR_CUTOFF,
    events: [base, distinct, future],
    policy: loaded.policy
  });
  assert.equal(guarded.ok, true);
  assert.equal(guarded.value.quarantinedOccurrences.length, 1);
  assert.equal(guarded.value.quarantinedOccurrences[0].error.code, 'P008-BEHAVIOR-TIME');
  assert.equal(guarded.value.interestSignals[0].score <= 2, true,
    'future weight cannot enter the score after quarantine');

  const repeated = loaded.brief.deriveInterestSignals({
    behaviorCutoffAt: BEHAVIOR_CUTOFF,
    events: [base, { ...base }, { ...base }],
    policy: loaded.policy
  });
  assert.equal(repeated.ok, true);
  assert.equal(repeated.value.interestSignals[0].floor.rawOccurrenceCount >= loaded.policy.behavior.minimumDistinctCompletions, true,
    'the old raw-count alternative genuinely reaches the numeric floor');
  assert.equal(repeated.value.interestSignals[0].floor.satisfied, false,
    'distinct semantic identities and New York dates make the raw-count alternative fail');
});

/* ---------- Scope 20 TP-20-01/04: complete generic evidence and API ---------- */

const HASH_A = `sha256:${'a1'.repeat(32)}`;
const HASH_B = `sha256:${'b2'.repeat(32)}`;
const HASH_C = `sha256:${'c3'.repeat(32)}`;
const HASH_D = `sha256:${'d4'.repeat(32)}`;

function genericWindow(overrides = {}) {
  const tradingDate = overrides.windowTradingDate || '2026-03-09';
  const cutoffAt = overrides.cutoffAt || '2026-03-09T11:30:00.000Z';
  return {
    contractVersion: 'GenericEvidenceWindow/v1',
    windowId: 'pre-market',
    timezone: 'America/New_York',
    windowTradingDate: tradingDate,
    scheduledCivilTime: '07:30',
    cutoffAt,
    snapshotRef: {
      state: 'current', contentSha256: HASH_A, window: 'pre-market', asOf: cutoffAt,
      generatedAt: cutoffAt, nextSessionDate: tradingDate, dataFreshnessSha256: HASH_B
    },
    payloadRef: {
      state: 'current', contentSha256: HASH_B, asOf: cutoffAt,
      attentionIds: ['attention-1'], recommendationIds: ['recommendation-1'],
      deepLinkIds: ['tool.html'], lifecycleIds: ['lifecycle-1']
    },
    historyRefs: [
      { lineIdentity: HASH_C, window: 'pre-market', observedAt: cutoffAt,
        evidenceFingerprint: HASH_D, sourceToken: 'brief-history-recent', contentSha256: HASH_C },
      { lineIdentity: HASH_C, window: 'pre-market', observedAt: cutoffAt,
        evidenceFingerprint: HASH_D, sourceToken: 'brief-history-recent', contentSha256: HASH_C }
    ],
    watchlistRef: { state: 'current', contentSha256: HASH_D, orderedTickerFingerprint: HASH_A },
    ownerReadRefs: [{
      sourceContract: 'tool-model-read/v1', toolId: 'technical-analysis-decision-lab', role: 'owner',
      profile: 'technical', availability: 'current', adapterId: 'market-structure', modelVersion: 'v1',
      deepLink: 'technical-analysis-decision-lab.html#power', evidenceCutoff: cutoffAt,
      evidenceFingerprints: [HASH_A], interpretationFingerprints: [HASH_B],
      actionEligibilityEffect: 'eligible', contentSha256: HASH_D
    }],
    publisherIdentity: null,
    genericEvidenceIdentity: null,
    retrievedAt: cutoffAt,
    composedAt: '2026-03-09T11:40:00.000Z',
    state: 'current',
    reasons: [],
    ...overrides
  };
}

test('SCN-008-046 complete generic evidence validates all five inputs and resolves DST by New York civil time', () => {
  const { brief, policy } = loadBrief();
  const required = [
    'validateGenericWindow', 'dedupeBehaviorEvents', 'deriveInterestSignals', 'buildActionCandidates',
    'rankResearchActions', 'composePortfolioBrief', 'whyShown', 'reduceResearchActionLifecycle'
  ];
  assert.deepEqual(required.filter((name) => typeof brief[name] !== 'function'), [],
    'browser/CommonJS boundary exposes all eight designed functions');
  assert.equal(Object.isFrozen(brief), true);

  const spring = brief.validateGenericWindow(genericWindow(), policy, { now: '2026-03-09T11:40:00.000Z' });
  assert.equal(spring.ok, true, JSON.stringify(spring.error || {}));
  assert.equal(spring.value.cutoffAt, '2026-03-09T11:30:00.000Z', '07:30 after spring transition is EDT');
  assert.equal(spring.value.selectedHistoryRefs.length, 1,
    'repeated history with one evidence fingerprint contributes once');
  assert.equal(spring.value.publisherIdentity.startsWith('sha256:'), true);
  assert.equal(spring.value.genericEvidenceIdentity.startsWith('sha256:'), true);
  assert.equal(spring.value.ownerReadRefs[0].toolId, 'technical-analysis-decision-lab');

  const fallInput = genericWindow({
    windowTradingDate: '2026-11-02', cutoffAt: '2026-11-02T12:30:00.000Z',
    retrievedAt: '2026-11-02T12:30:00.000Z', composedAt: '2026-11-02T12:40:00.000Z',
    snapshotRef: { ...genericWindow().snapshotRef, asOf: '2026-11-02T12:30:00.000Z', generatedAt: '2026-11-02T12:30:00.000Z', nextSessionDate: '2026-11-02' },
    payloadRef: { ...genericWindow().payloadRef, asOf: '2026-11-02T12:30:00.000Z' },
    historyRefs: [{ ...genericWindow().historyRefs[0], observedAt: '2026-11-02T12:30:00.000Z' }],
    ownerReadRefs: [{ ...genericWindow().ownerReadRefs[0], evidenceCutoff: '2026-11-02T12:30:00.000Z' }]
  });
  const fall = brief.validateGenericWindow(fallInput, policy, { now: '2026-11-02T12:40:00.000Z' });
  assert.equal(fall.ok, true, JSON.stringify(fall.error || {}));
  assert.equal(fall.value.cutoffAt, '2026-11-02T12:30:00.000Z', '07:30 after fall transition is EST');
  assert.notEqual(fall.value.cutoffAt.slice(11, 16), spring.value.cutoffAt.slice(11, 16),
    'a fixed UTC-4 offset cannot satisfy both transition sides');
});

test('SCN-008-046 action candidates enforce generic freshness and one lifecycle reducer', () => {
  const { brief, policy } = loadBrief();
  const current = brief.validateGenericWindow(genericWindow(), policy, { now: '2026-03-09T11:40:00.000Z' });
  assert.equal(current.ok, true);
  const built = brief.buildActionCandidates({
    genericWindow: current.value,
    directSubjects: [{ subjectId: 'MSFT', lane: 'held', materiality: 0.5, evidenceState: 'current' }],
    inferredSubjects: [{ subjectId: 'semiconductors', lane: 'inferredRelevance', materiality: 0.9, evidenceState: 'current' }]
  }, policy);
  assert.equal(built.ok, true, JSON.stringify(built.error || {}));
  assert.equal(built.value.actions.length, 2);
  assert.equal(built.value.actions.every((entry) => entry.researchVerb === 'review' || entry.researchVerb === 'inspect'), true);

  const staleInput = genericWindow({
    state: 'stale', reasons: ['snapshot-stale'],
    snapshotRef: { ...genericWindow().snapshotRef, state: 'stale' },
    payloadRef: { ...genericWindow().payloadRef, state: 'stale' }
  });
  const stale = brief.validateGenericWindow(staleInput, policy, { now: '2026-03-09T11:40:00.000Z' });
  assert.equal(stale.ok, true);
  const staleBuilt = brief.buildActionCandidates({
    genericWindow: stale.value,
    directSubjects: [{ subjectId: 'MSFT', lane: 'held', materiality: 0.5, evidenceState: 'stale' }],
    inferredSubjects: []
  }, policy);
  assert.equal(staleBuilt.ok, true);
  assert.equal(['refresh', 'revisit-thesis'].includes(staleBuilt.value.actions[0].researchVerb), true);
  assert.equal(staleBuilt.value.actions[0].staleCondition.length > 0, true);
  assert.equal(staleBuilt.value.actions[0].evidenceAgeHours >= 0, true);

  const lifecycle = brief.reduceResearchActionLifecycle(staleBuilt.value.actions, {
    actionId: staleBuilt.value.actions[0].actionId, command: 'complete', reason: 'owner-review'
  }, '2026-03-09T12:00:00.000Z');
  assert.equal(lifecycle.ok, true, JSON.stringify(lifecycle.error || {}));
  assert.equal(lifecycle.value.actions[0].lifecycleState, 'completed');
  assert.equal(lifecycle.value.actions[0].completedAt, '2026-03-09T12:00:00.000Z');
  assert.equal(Object.isFrozen(lifecycle.value), true);
});

test('SCN-008-046 every public boundary emits a closed value-safe PortfolioError', () => {
  const { brief, policy } = loadBrief();
  const invalid = genericWindow({ portfolioId: 'PRIVATE-PORTFOLIO' });
  const result = brief.validateGenericWindow(invalid, policy, { now: '2026-03-09T11:40:00.000Z' });
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.error).sort(),
    ['code', 'contractVersion', 'field', 'reason', 'recoverable', 'row', 'valueEchoed']);
  assert.equal(result.error.contractVersion, 'PortfolioError/v1');
  assert.equal(result.error.code, 'P008-BRIEF-INPUT');
  assert.equal(result.error.valueEchoed, false);
  assert.equal(JSON.stringify(result.error).includes('PRIVATE-PORTFOLIO'), false);
});

test('Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract', () => {
  const { brief, policy } = loadBrief();
  const required = [
    'validateGenericWindow', 'dedupeBehaviorEvents', 'deriveInterestSignals', 'buildActionCandidates',
    'rankResearchActions', 'composePortfolioBrief', 'whyShown', 'reduceResearchActionLifecycle'
  ];
  assert.equal(required.length, 8);
  assert.equal(required.every((name) => typeof brief[name] === 'function'), true,
    'removing any designed export fails the closed API assertion');

  const springFixedOffset = new Date(Date.parse('2026-03-09T07:30:00.000Z') + 240 * 60000).toISOString();
  const fallFixedOffset = new Date(Date.parse('2026-11-02T07:30:00.000Z') + 240 * 60000).toISOString();
  assert.equal(springFixedOffset, '2026-03-09T11:30:00.000Z');
  assert.equal(fallFixedOffset, '2026-11-02T11:30:00.000Z');
  assert.notEqual(fallFixedOffset, '2026-11-02T12:30:00.000Z',
    'the old fixed-offset implementation genuinely fails the fall transition');

  const stale = brief.validateGenericWindow(genericWindow({
    state: 'stale', reasons: ['snapshot-stale'],
    snapshotRef: { ...genericWindow().snapshotRef, state: 'stale' }
  }), policy, { now: '2026-03-09T11:40:00.000Z' });
  const staleActions = brief.buildActionCandidates({
    genericWindow: stale.value,
    directSubjects: [{ subjectId: 'MSFT', lane: 'held', materiality: 1, evidenceState: 'stale' }],
    inferredSubjects: []
  }, policy);
  assert.equal(staleActions.value.actions[0].researchVerb === 'review', false,
    'the old unconditional Review verb cannot pass stale policy');
  assert.equal(['refresh', 'revisit-thesis'].includes(staleActions.value.actions[0].researchVerb), true);
});

/* ---------- BUG-004 TP-B004-003: the PROJECTION half of the occurrence contract ----------
 *
 * `tests/portfolio-behavior-occurrence.unit.mjs` pins STORAGE: a later same-civil-day completion is
 * a distinct, independently auditable occurrence rather than a duplicate. That repair is only safe
 * if the relevance projection then collapses those occurrences back to ONE semantic completion
 * before it accumulates score. Without the collapse, retaining the occurrence silently buys
 * relevance: the defect that motivated this bug moved `evidenceScore` 1.6062 -> 2.4094 on a repeat
 * that carried no new information, and that inflation crossed a peer and reordered the queue.
 *
 * The projection lives in TWO modules and both must collapse, which is why the boundary for this
 * fix covers both. `rlportfolio.js::deriveInterestSignals` produces `evidenceScore`;
 * `rlportfoliobrief.js::deriveInterestSignals` produces the brief score that becomes ranking
 * materiality. Reverting either one alone is enough to turn this test red — proven by injecting
 * each reduction separately through `tests/portfolio-defect-injector.cjs`, which substitutes source
 * in memory and never writes the shipped tree.
 *
 * The comparison peer is calibrated from the run's OWN two scores rather than hardcoded. Under the
 * required collapse the two scores are equal, so the peer ties with both and order is stable; under
 * per-occurrence accumulation the peer necessarily sits strictly between them and the order flips.
 * A hardcoded peer would have to be chosen for one tree or the other and could not discriminate.
 */

/* 10:30 and 17:45 America/New_York on 2026-07-15. Both instants are asserted onto one civil date
   below, because a fixture that straddled midnight would be green under per-occurrence scoring too. */
const B004_EARLIER = '2026-07-15T14:30:00.000Z';
const B004_SAME_DAY_LATER = '2026-07-15T21:45:00.000Z';
const B004_THIRD_DAY = '2026-07-17T10:00:00.000Z';
const B004_RANKED_AT = '2026-07-20T08:00:00.000Z';
const B004_SUBJECT_GAMMA = 'brief-subject-gamma';
const B004_PEER_DOMAIN = 'comparison-research';

test('Regression: BUG-004 same-semantic occurrences cannot inflate relevance', () => {
  const { api, policy } = loadRuntime();
  const { brief } = loadBrief();
  const base = researchWorkspace(api, policy);

  const first = appendEvent(api, policy, base, {}, B004_EARLIER);
  const baseline = appendEvent(api, policy, first, { subjectId: SUBJECT_BETA }, NEXT_DAY);
  const augmented = appendEvent(api, policy,
    appendEvent(api, policy, first, {}, B004_SAME_DAY_LATER),
    { subjectId: SUBJECT_BETA }, NEXT_DAY);
  const control = appendEvent(api, policy, baseline, { subjectId: B004_SUBJECT_GAMMA }, B004_THIRD_DAY);

  /* Vacuity guards. If the repeat were on another civil date, or were refused as a duplicate, or
     carried the same occurrence id, then "nothing moved" would be true of an implementation that
     simply threw the occurrence away — which is the OPPOSITE defect this bug also forbids. */
  const [alphaFirst, , alphaRepeat] = [
    baseline.behaviorEvents[0],
    baseline.behaviorEvents[1],
    augmented.behaviorEvents[1]
  ];
  assert.equal(alphaFirst.occurrence.newYorkCivilDate, '2026-07-15');
  assert.equal(alphaRepeat.occurrence.newYorkCivilDate, alphaFirst.occurrence.newYorkCivilDate,
    'the repeat must land on the same New York civil date, or per-occurrence scoring is not exercised');
  assert.equal(alphaRepeat.eventIdentity, alphaFirst.eventIdentity,
    'the repeat must share one semantic identity, or it is a genuinely new completion');
  assert.notEqual(alphaRepeat.occurrence.occurrenceId, alphaFirst.occurrence.occurrenceId,
    'the repeat must remain an independently auditable occurrence');
  assert.equal(baseline.behaviorEvents.length, 2);
  assert.equal(augmented.behaviorEvents.length, 3,
    'the augmented stream must genuinely retain one extra audit occurrence before invariance is compared');
  assert.equal(control.behaviorEvents.length, 3);

  const derive = (workspace) => {
    const portfolioResult = api.deriveInterestSignals(workspace, B004_RANKED_AT, policy);
    assert.equal(portfolioResult.ok, true, JSON.stringify(portfolioResult.error || {}));
    const portfolioSignal = portfolioResult.value.find((signal) => signal.domain === 'equity-research');
    assert.ok(portfolioSignal, 'the portfolio projection must emit the equity-research signal');

    const interestResult = brief.deriveInterestSignals({
      behaviorCutoffAt: B004_RANKED_AT,
      events: workspace.behaviorEvents,
      policy
    });
    assert.equal(interestResult.ok, true, JSON.stringify(interestResult.error || {}));
    const briefSignal = interestResult.value.interestSignals.find((signal) => signal.domain === 'equity-research');
    assert.ok(briefSignal, 'the brief projection must emit the equity-research signal');
    return { briefSignal, interestResult, portfolioSignal };
  };

  const baselineDerived = derive(baseline);
  const augmentedDerived = derive(augmented);
  const controlDerived = derive(control);
  assert.equal(baselineDerived.portfolioSignal.floorSatisfied, true,
    'the baseline must already clear the floor, so the repeat is measured against a real ranked result');

  const peerMateriality = (baselineDerived.briefSignal.score + augmentedDerived.briefSignal.score) / 2;
  const rankPolicy = JSON.parse(JSON.stringify(policy));
  rankPolicy.queue.visibleActionCap = 2;
  const window = {
    contractVersion: 'GenericEvidenceWindow/v1',
    composedAt: B004_RANKED_AT,
    cutoffAt: B004_RANKED_AT,
    genericEvidenceIdentity: GENERIC_EVIDENCE_IDENTITY,
    reasons: [],
    state: 'current'
  };

  const rankedOrder = (derived) => {
    const candidates = brief.buildActionCandidates({
      directSubjects: [],
      genericWindow: window,
      inferredSubjects: [
        {
          evidenceState: 'current',
          lane: 'inferredRelevance',
          materiality: derived.briefSignal.score,
          subjectId: derived.briefSignal.subjectId
        },
        {
          evidenceState: 'current',
          lane: 'inferredRelevance',
          materiality: peerMateriality,
          subjectId: B004_PEER_DOMAIN
        }
      ]
    }, rankPolicy);
    assert.equal(candidates.ok, true, JSON.stringify(candidates.error || {}));
    const ranked = brief.rankResearchActions({
      actions: candidates.value.actions,
      behaviorCutoffAt: B004_RANKED_AT,
      genericWindowIdentity: GENERIC_EVIDENCE_IDENTITY,
      interestResult: derived.interestResult.value,
      policy: rankPolicy
    });
    assert.equal(ranked.ok, true, JSON.stringify(ranked.error || {}));
    assert.equal(ranked.value.rankedActions.length, 2,
      'both inferred subjects must be visible, or the order comparison below is vacuous');
    return ranked.value.rankedActions.map((action) => action.subjectId);
  };

  const baselineOrder = rankedOrder(baselineDerived);
  const augmentedOrder = rankedOrder(augmentedDerived);
  const controlOrder = rankedOrder(controlDerived);

  /* NON-INERT CONTROLS. A genuinely distinct third completion on a third date must move BOTH
     quantities. Without these, "equal" below would also hold for a projection that had stopped
     reading behavior evidence at all. */
  assert.notEqual(controlDerived.portfolioSignal.evidenceScore, baselineDerived.portfolioSignal.evidenceScore,
    'a genuinely distinct completion must move evidence score, or the score invariance is inert');
  assert.notDeepEqual(controlOrder, baselineOrder,
    'a genuinely distinct completion must move the ranked order, or the order invariance is inert');

  /* THE TWO REGRESSION ASSERTIONS. Each is stated separately so a failure names the quantity that
     moved rather than reporting one opaque projection mismatch. */
  assert.equal(augmentedDerived.portfolioSignal.evidenceScore, baselineDerived.portfolioSignal.evidenceScore,
    'a same-semantic same-civil-day repeat must not change evidenceScore');
  assert.deepEqual(augmentedOrder, baselineOrder,
    'a same-semantic same-civil-day repeat must not change finalRankedOrder');

  /* The rest of the declared projection surface, so the repeat cannot buy floor state, band, or
     supporting identity either. */
  assert.equal(augmentedDerived.briefSignal.score, baselineDerived.briefSignal.score);
  assert.equal(augmentedDerived.portfolioSignal.floorSatisfied, baselineDerived.portfolioSignal.floorSatisfied);
  assert.equal(augmentedDerived.portfolioSignal.relevanceBand, baselineDerived.portfolioSignal.relevanceBand);
  assert.deepEqual(augmentedDerived.portfolioSignal.supportingEventIds, baselineDerived.portfolioSignal.supportingEventIds);
  assert.equal(augmentedDerived.briefSignal.floor.distinctCompletionIdentities,
    baselineDerived.briefSignal.floor.distinctCompletionIdentities);
  assert.equal(augmentedDerived.briefSignal.floor.distinctNewYorkCivilDates,
    baselineDerived.briefSignal.floor.distinctNewYorkCivilDates);

  /* Audit cardinality is the half that must GROW. Asserting it here keeps "nothing changed" from
     being satisfiable by a projection that silently discarded the retained occurrence. */
  assert.equal(augmentedDerived.interestResult.value.eligibleOccurrences.length,
    baselineDerived.interestResult.value.eligibleOccurrences.length + 1,
    'the repeat must still be visible to audit even though it buys no relevance');
});
