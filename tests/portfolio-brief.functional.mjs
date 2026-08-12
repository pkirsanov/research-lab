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
  const policy = JSON.parse(readFileSync(POLICY_PATH, 'utf8'));
  // Windows are READ from the generic public config; the local composer never declares its own.
  const windows = JSON.parse(readFileSync(MARKET_BRIEF_CONFIG, 'utf8')).windows;
  return { brief, policy, windows };
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
