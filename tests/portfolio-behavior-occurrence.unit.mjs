/*
 * BUG-004 regression: `buildBehaviorCandidate` de-duplicates on OCCURRENCE identity while
 * relevance projection de-duplicates on SEMANTIC identity.
 *
 * `edbbddf0d fix(008): a repeat completion must not bank a second event` compared content
 * identity scoped to the New York civil day, which collapses two genuinely distinct occurrences
 * of one semantic completion into a single stored row. The authoritative BUG-004 design and the
 * parent Feature 008 design ratify the opposite storage contract: occurrence time is excluded
 * from SEMANTIC de-duplication but retained per occurrence, so a later same-day report is an
 * independently auditable occurrence sharing one `eventIdentity`.
 *
 * Every accepted-path assertion here is ADVERSARIAL: it is red under `edbbddf0d`'s predicate and
 * green under the shipped one. `reinstating the superseded predicate` proves that sensitivity
 * against an in-memory mutation rather than asserting it, and the refusal assertions pin the
 * other half of the contract so this file cannot be read as "de-duplication was removed".
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { ROOT } from './portfolio-survival.support.mjs';

const require = createRequire(import.meta.url);
const MODULE_PATH = resolve(ROOT, 'rlportfolio.js');
const BRIEF_PATH = resolve(ROOT, 'rlportfoliobrief.js');
const CONTRACTS_PATH = resolve(ROOT, 'rlcontracts.js');
const POLICY_PATH = resolve(ROOT, 'portfolio-survival-allocation.config.json');

const RESULT_IDENTITY = `sha256:${'ab12'.repeat(16)}`;
const GENERIC_EVIDENCE_IDENTITY = `sha256:${'cd34'.repeat(16)}`;
const SUBJECT_ALPHA = 'subject-alpha';
const SUBJECT_BETA = 'subject-beta';
const SUBJECT_GAMMA = 'subject-gamma';
const COMPARISON_DOMAIN = 'comparison-research';
/* 05:05 and 17:45 America/New_York on 2026-07-15. Both instants are asserted onto one civil date
   below, because a fixture that straddled midnight would be green under BOTH predicates. */
const EARLIER = '2026-07-15T09:05:00.000Z';
const SAME_DAY_LATER = '2026-07-15T21:45:00.000Z';
const NEXT_DAY = '2026-07-16T10:00:00.000Z';
const THIRD_DAY = '2026-07-17T10:00:00.000Z';
const RANKED_AT = '2026-07-20T08:00:00.000Z';
/* 191 days before RANKED_AT, so far outside the declared 56-day evidence window that no rounding
   argument can put it back inside. */
const BEYOND_EVIDENCE_WINDOW = '2026-01-10T10:00:00.000Z';

/* The exact predicate `edbbddf0d` installed and the shipped predicate that supersedes it. */
const SHIPPED_PREDICATE = [
  '    var duplicate = candidate.behaviorEvents.some(function (entry) {',
  '      return entry.eventId === eventResult.value.eventId;',
  '    });'
].join('\n');
const SUPERSEDED_PREDICATE = [
  '    var duplicate = candidate.behaviorEvents.some(function (entry) {',
  '      return entry.dedupeKey === eventResult.value.dedupeKey &&',
  '        entry.occurrence.newYorkCivilDate === eventResult.value.occurrence.newYorkCivilDate;',
  '    });'
].join('\n');

/* The relevance half of the repair, expressed as source text. Semantic collapse retains the
   EARLIEST occurrence of an identity, so whether the evidence-age window is applied before or
   after that collapse decides whether a stale first occurrence can delete an identity that also
   has fresh in-window evidence. Both mutants below keep the age limit enforced; they differ from
   the shipped module only in WHERE it is enforced, so neither is a strawman. */
const SHIPPED_AGE_PREFILTER =
  '      if (eligibleAgeMs < 0 || eligibleAgeMs / 86400000 > behaviorPolicy.maximumEvidenceAgeDays) continue;';
const FILTER_AFTER_COLLAPSE_PREFILTER = '      if (eligibleAgeMs < 0) continue;';
const SHIPPED_ACCUMULATION = [
  '      var ageDays = ageMs / 86400000;',
  '      bucket.completionIdentities[occurrence.eventIdentity] = true;'
].join('\n');
const FILTER_AFTER_COLLAPSE_ACCUMULATION = [
  '      var ageDays = ageMs / 86400000;',
  '      if (ageDays > behaviorPolicy.maximumEvidenceAgeDays) return;',
  '      bucket.completionIdentities[occurrence.eventIdentity] = true;'
].join('\n');

function loadContracts() {
  delete require.cache[require.resolve('../rlportfoliobrief.js')];
  delete require.cache[require.resolve('../rlportfolio.js')];
  return {
    api: require('../rlportfolio.js'),
    brief: require('../rlportfoliobrief.js'),
    policy: JSON.parse(readFileSync(POLICY_PATH, 'utf8'))
  };
}

/* Evaluates module SOURCE TEXT in a throwaway browser-shaped root, which is how this repo proves
   predicate sensitivity without editing and restoring shipped production source. */
function loadFromSource(source) {
  const browserRoot = {};
  Function('globalThis', 'window', 'module', 'exports', 'require',
    `${readFileSync(CONTRACTS_PATH, 'utf8')}\nreturn globalThis.RLCONTRACTS;`)(browserRoot, browserRoot, undefined, undefined, undefined);
  Function('globalThis', 'window', 'module', 'exports', 'require',
    `${source}\nreturn globalThis.RLPORTFOLIO;`)(browserRoot, browserRoot, undefined, undefined, undefined);
  return browserRoot.RLPORTFOLIO;
}

/* The same technique extended one module further, because the relevance half of BUG-004 lives in
   the brief. Storage source is always the shipped text here: these rows perturb the projection
   only, so a failure cannot be blamed on a second simultaneous mutation. */
function loadStackFromSource(briefSource) {
  const browserRoot = {};
  for (const path of [CONTRACTS_PATH, MODULE_PATH]) {
    Function('globalThis', 'window', 'module', 'exports', 'require',
      readFileSync(path, 'utf8'))(browserRoot, browserRoot, undefined, undefined, undefined);
  }
  Function('globalThis', 'window', 'module', 'exports', 'require',
    briefSource)(browserRoot, browserRoot, undefined, undefined, undefined);
  return { api: browserRoot.RLPORTFOLIO, brief: browserRoot.RLPORTFOLIOBRIEF };
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

function emptyWorkspace(api, policy) {
  const empty = api.createEmptyWorkspace(policy, EARLIER);
  assert.equal(empty.ok, true, 'an empty workspace must be constructible');
  return empty.value;
}

function append(api, policy, workspace, now, overrides = {}) {
  const result = api.buildBehaviorCandidate(behaviorDraft(overrides), workspace, { now }, policy);
  assert.equal(result.ok, true, `behavior candidate must build: ${JSON.stringify(result.error || {})}`);
  return result.value;
}

test('BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity', () => {
  const { api, policy } = loadContracts();
  const first = append(api, policy, emptyWorkspace(api, policy), EARLIER);
  assert.equal(first.accepted, true);
  const later = append(api, policy, first.workspace, SAME_DAY_LATER);

  // Vacuity guard: the two instants must genuinely share a New York civil date, or the superseded
  // predicate would have accepted the second report too and nothing below would be adversarial.
  assert.equal(first.event.occurrence.newYorkCivilDate, '2026-07-15');
  assert.equal(later.event.occurrence.newYorkCivilDate, first.event.occurrence.newYorkCivilDate,
    'both reports must fall on one civil day for this to exercise the superseded predicate at all');
  assert.notEqual(later.event.occurredAt, first.event.occurredAt);

  assert.equal(later.accepted, true, 'a later occurrence of the same completion must be admitted');
  assert.equal(later.reason, null);
  assert.equal(later.event.eventIdentity, first.event.eventIdentity,
    'the later report keeps the same semantic identity');
  assert.equal(later.event.dedupeKey, first.event.dedupeKey,
    'semantic de-duplication still sees one completion, which is what rankers collapse on');
  assert.notEqual(later.event.occurrence.occurrenceId, first.event.occurrence.occurrenceId,
    'the later report remains an independently auditable occurrence');
  assert.equal(later.event.eventId, later.event.occurrence.occurrenceId,
    'the stored row id IS the occurrence id, which is the key the workspace requires to be unique');
  assert.equal(later.workspace.behaviorEvents.length, 2,
    'a later occurrence grows occurrence evidence without pretending to be a new semantic completion');
  assert.equal(api.validateWorkspace(later.workspace, policy).ok, true,
    'two occurrences of one completion must satisfy the workspace duplicate-event-id invariant');

  // A different civil date was never in dispute; it is the control proving acceptance above is not
  // simply "this builder accepts everything".
  const nextDay = append(api, policy, later.workspace, NEXT_DAY);
  assert.equal(nextDay.accepted, true);
  assert.equal(nextDay.event.eventIdentity, first.event.eventIdentity);
  assert.equal(nextDay.workspace.behaviorEvents.length, 3);
});

test('BUG-004: an exact occurrence repeat is still refused as a duplicate', () => {
  const { api, policy } = loadContracts();
  const first = append(api, policy, emptyWorkspace(api, policy), EARLIER);
  const populated = append(api, policy, first.workspace, SAME_DAY_LATER).workspace;
  assert.equal(populated.behaviorEvents.length, 2);

  // Replaying the FIRST occurrence's own timestamp reproduces its occurrence id exactly.
  const exactRepeat = append(api, policy, populated, EARLIER);
  assert.equal(exactRepeat.accepted, false, 'a byte-identical occurrence must not be banked twice');
  assert.equal(exactRepeat.reason, 'duplicate-completion');
  assert.equal(exactRepeat.event.eventId, first.event.eventId,
    'the refusal is driven by an identical occurrence id, not by an unrelated failure');
  assert.equal(exactRepeat.workspace.behaviorEvents.length, 2,
    'a byte-identical occurrence cannot inflate the store');

  // The second stored occurrence is equally protected, so the refusal is a rule over the whole
  // store rather than an accident of matching only the head row.
  const repeatOfLater = append(api, policy, populated, SAME_DAY_LATER);
  assert.equal(repeatOfLater.accepted, false);
  assert.equal(repeatOfLater.reason, 'duplicate-completion');
  assert.equal(repeatOfLater.workspace.behaviorEvents.length, 2);
});

test('BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn', () => {
  const { api, brief, policy } = loadContracts();
  const first = append(api, policy, emptyWorkspace(api, policy), EARLIER);
  const baseline = append(api, policy, first.workspace, NEXT_DAY, { subjectId: SUBJECT_BETA });
  const repeated = append(api, policy, first.workspace, SAME_DAY_LATER);
  const augmented = append(api, policy, repeated.workspace, NEXT_DAY, { subjectId: SUBJECT_BETA });
  const distinctControl = append(api, policy, baseline.workspace, THIRD_DAY, { subjectId: SUBJECT_GAMMA });

  assert.equal(baseline.workspace.behaviorEvents.length, 2);
  assert.equal(augmented.workspace.behaviorEvents.length, 3,
    'the augmented stream must retain one extra audit occurrence before invariance is compared');
  assert.equal(distinctControl.workspace.behaviorEvents.length, 3);

  const derive = (workspace) => {
    const portfolioResult = api.deriveInterestSignals(workspace, RANKED_AT, policy);
    assert.equal(portfolioResult.ok, true, JSON.stringify(portfolioResult.error || {}));
    const portfolioSignal = portfolioResult.value.find((signal) => signal.domain === 'equity-research');
    assert.ok(portfolioSignal, 'the portfolio projection must emit the equity-research signal');

    const dedupeResult = brief.dedupeBehaviorEvents({
      behaviorCutoffAt: RANKED_AT,
      events: workspace.behaviorEvents,
      policy
    });
    assert.equal(dedupeResult.ok, true, JSON.stringify(dedupeResult.error || {}));
    const interestResult = brief.deriveInterestSignals({
      behaviorCutoffAt: RANKED_AT,
      events: workspace.behaviorEvents,
      policy
    });
    assert.equal(interestResult.ok, true, JSON.stringify(interestResult.error || {}));
    const briefSignal = interestResult.value.interestSignals.find((signal) => signal.domain === 'equity-research');
    assert.ok(briefSignal, 'the brief projection must emit the equity-research signal');
    return { briefSignal, dedupeResult, interestResult, portfolioSignal };
  };

  const baselineDerived = derive(baseline.workspace);
  const augmentedDerived = derive(augmented.workspace);
  const controlDerived = derive(distinctControl.workspace);
  assert.equal(baselineDerived.portfolioSignal.floorSatisfied, true,
    'the baseline is already eligible, so the repeat is tested against a real candidate-producing result');

  /* Put a stable peer halfway between the baseline and augmented scores. Under the required
     semantic collapse baseline and augmented are equal; under occurrence accumulation the repeat
     crosses this peer and changes the final order. A third semantic completion must still cross
     it after the repair, which is the non-inert control below. */
  const comparisonScore = (baselineDerived.briefSignal.score + augmentedDerived.briefSignal.score) / 2;
  const rankPolicy = JSON.parse(JSON.stringify(policy));
  rankPolicy.queue.visibleActionCap = 2;
  const genericWindow = {
    contractVersion: 'GenericEvidenceWindow/v1',
    composedAt: RANKED_AT,
    cutoffAt: RANKED_AT,
    genericEvidenceIdentity: GENERIC_EVIDENCE_IDENTITY,
    reasons: [],
    state: 'current'
  };

  const rank = (derived) => {
    const candidates = brief.buildActionCandidates({
      directSubjects: [],
      genericWindow,
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
          materiality: comparisonScore,
          subjectId: COMPARISON_DOMAIN
        }
      ]
    }, rankPolicy);
    assert.equal(candidates.ok, true, JSON.stringify(candidates.error || {}));
    const ranked = brief.rankResearchActions({
      actions: candidates.value.actions,
      behaviorCutoffAt: RANKED_AT,
      genericWindowIdentity: GENERIC_EVIDENCE_IDENTITY,
      interestResult: derived.interestResult.value,
      policy: rankPolicy
    });
    assert.equal(ranked.ok, true, JSON.stringify(ranked.error || {}));
    return { candidates: candidates.value, ranked: ranked.value };
  };

  const projection = (derived, ranked) => ({
    candidateActionIdentities: ranked.candidates.actions
      .map((action) => `${action.subjectId}:${action.actionId}`)
      .sort(),
    evidenceScore: derived.portfolioSignal.evidenceScore,
    finalRankedOrder: ranked.ranked.rankedActions.map((action) => action.subjectId),
    floorEligibility: {
      distinctCompletionIdentities: derived.briefSignal.floor.distinctCompletionIdentities,
      distinctNewYorkCivilDates: derived.briefSignal.floor.distinctNewYorkCivilDates,
      floorSatisfied: derived.portfolioSignal.floorSatisfied,
      relevanceBand: derived.portfolioSignal.relevanceBand
    },
    rankIdentity: ranked.ranked.rankingFingerprint,
    semanticEvidenceContribution: derived.dedupeResult.value.semanticEvents
      .map((event) => event.eventIdentity)
      .sort(),
    signalIdentity: {
      brief: derived.briefSignal.signalId,
      portfolio: derived.portfolioSignal.signalId
    },
    supportingSemanticIdentities: derived.portfolioSignal.supportingEventIds,
    semanticScore: derived.briefSignal.score
  });

  const baselineProjection = projection(baselineDerived, rank(baselineDerived));
  const augmentedProjection = projection(augmentedDerived, rank(augmentedDerived));
  const controlProjection = projection(controlDerived, rank(controlDerived));

  assert.notDeepEqual(controlProjection.semanticEvidenceContribution,
    baselineProjection.semanticEvidenceContribution,
    'a genuinely distinct completion must add a semantic contribution');
  assert.notEqual(controlProjection.evidenceScore, baselineProjection.evidenceScore,
    'a genuinely distinct completion on a third date must move evidence score');
  assert.notDeepEqual(controlProjection.finalRankedOrder, baselineProjection.finalRankedOrder,
    'the distinct completion control must move the eligible ranked result, or order invariance is inert');

  assert.deepEqual(augmentedProjection, baselineProjection,
    'a stored same-semantic same-day occurrence may grow audit history but must not change semantic evidence, score, eligibility, signal identity, action identity, rank identity, or final order');
});

test('BUG-004: stored occurrence growth is bounded by the declared behaviour-event cap', () => {
  const { api, policy } = loadContracts();
  const capped = { ...policy, behavior: { ...policy.behavior, maxBehaviorEvents: 2 } };
  assert.equal(api.validatePolicy(capped).ok, true, 'a lower cap must still be a valid policy');

  const first = append(api, capped, emptyWorkspace(api, capped), EARLIER);
  const atCap = append(api, capped, first.workspace, SAME_DAY_LATER);
  assert.equal(atCap.workspace.behaviorEvents.length, 2);

  const overCap = api.buildBehaviorCandidate(behaviorDraft(), atCap.workspace, { now: NEXT_DAY }, capped);
  assert.equal(overCap.ok, false, 'growth past the declared cap is refused, not silently absorbed');
  assert.equal(overCap.error.code, 'P008-SCHEMA-CORRUPT');
  assert.equal(overCap.error.reason, 'behavior-event-cap-exceeded');
  assert.equal(overCap.error.recoverable, true);
  assert.equal(atCap.workspace.behaviorEvents.length, 2,
    'the refusal leaves the store untouched rather than evicting an earlier occurrence');

  /* At the cap an exact repeat is still a duplicate, not a cap error: the duplicate check runs
     first, so a replayed report never reads as capacity exhaustion. */
  const repeatAtCap = api.buildBehaviorCandidate(behaviorDraft(), atCap.workspace, { now: EARLIER }, capped);
  assert.equal(repeatAtCap.ok, true);
  assert.equal(repeatAtCap.value.accepted, false);
  assert.equal(repeatAtCap.value.reason, 'duplicate-completion');
});

test('BUG-004: reinstating the superseded content+civil-day predicate turns the accepted-occurrence assertion red', () => {
  const { policy } = loadContracts();
  const source = readFileSync(MODULE_PATH, 'utf8');

  // A mutation that silently matched nothing would make the whole demonstration vacuous.
  assert.equal(source.split(SHIPPED_PREDICATE).length - 1, 1,
    'the shipped occurrence-identity predicate must appear exactly once for the mutation to be meaningful');
  assert.equal(source.includes(SUPERSEDED_PREDICATE), false,
    'the shipped tree must not already carry the superseded predicate');
  const mutatedSource = source.replace(SHIPPED_PREDICATE, SUPERSEDED_PREDICATE);
  assert.equal(mutatedSource.includes(SUPERSEDED_PREDICATE), true, 'the mutation must have applied');
  assert.notEqual(mutatedSource, source);

  const shipped = loadFromSource(source);
  const superseded = loadFromSource(mutatedSource);

  const seed = (api) => {
    const empty = api.createEmptyWorkspace(policy, EARLIER);
    assert.equal(empty.ok, true);
    const first = api.buildBehaviorCandidate(behaviorDraft(), empty.value, { now: EARLIER }, policy);
    assert.equal(first.ok, true);
    assert.equal(first.value.accepted, true, 'the first occurrence is admitted under either predicate');
    return first.value.workspace;
  };

  const shippedLater = shipped.buildBehaviorCandidate(behaviorDraft(), seed(shipped), { now: SAME_DAY_LATER }, policy);
  const supersededLater = superseded.buildBehaviorCandidate(behaviorDraft(), seed(superseded), { now: SAME_DAY_LATER }, policy);
  assert.equal(shippedLater.value.accepted, true);
  assert.equal(shippedLater.value.workspace.behaviorEvents.length, 2);
  assert.equal(supersededLater.value.accepted, false,
    'under the superseded predicate the later same-day occurrence is refused — this is the regression being pinned');
  assert.equal(supersededLater.value.reason, 'duplicate-completion');
  assert.equal(supersededLater.value.workspace.behaviorEvents.length, 1,
    'the superseded predicate discards the occurrence, which is the evidence loss BUG-004 repairs');

  /* The two predicates must differ ONLY on the later occurrence. Both still refuse an exact
     repeat, so the change is a narrowing of the duplicate rule rather than its removal. */
  const shippedRepeat = shipped.buildBehaviorCandidate(behaviorDraft(), seed(shipped), { now: EARLIER }, policy);
  const supersededRepeat = superseded.buildBehaviorCandidate(behaviorDraft(), seed(superseded), { now: EARLIER }, policy);
  assert.equal(shippedRepeat.value.accepted, false);
  assert.equal(shippedRepeat.value.reason, 'duplicate-completion');
  assert.equal(supersededRepeat.value.accepted, false);
  assert.equal(supersededRepeat.value.reason, 'duplicate-completion');
});

/* Storing every occurrence (the rows above) creates a boundary that storing one never had: an
   identity can now hold occurrences on BOTH sides of the evidence-age window. Semantic collapse
   keeps the earliest occurrence, so if the window were applied after the collapse the stale first
   occurrence would win the collapse and then be discarded, deleting an identity that has fresh
   in-window evidence and silently dropping its domain below the relevance floor. That is the
   opposite failure to inflation and equally invisible, which is why it is pinned here. */
test('BUG-004: the evidence-age window is applied before semantic collapse, so a stale first occurrence cannot erase a fresh repeat', () => {
  const { policy } = loadContracts();
  const briefSource = readFileSync(BRIEF_PATH, 'utf8');

  assert.equal(briefSource.split(SHIPPED_AGE_PREFILTER).length - 1, 1,
    'the pre-collapse age filter must appear exactly once for the mutation below to be meaningful');
  assert.equal(briefSource.split(SHIPPED_ACCUMULATION).length - 1, 1,
    'the post-collapse accumulation must appear exactly once');
  const reorderedSource = briefSource
    .replace(SHIPPED_AGE_PREFILTER, FILTER_AFTER_COLLAPSE_PREFILTER)
    .replace(SHIPPED_ACCUMULATION, FILTER_AFTER_COLLAPSE_ACCUMULATION);
  assert.notEqual(reorderedSource, briefSource, 'the reordering mutation must have applied');
  assert.equal(reorderedSource.includes('behaviorPolicy.maximumEvidenceAgeDays'), true,
    'the mutant must still enforce the age limit — only its position moves, or this proves nothing');

  /* alpha straddles the window, beta is entirely inside it, gamma is entirely outside it. gamma is
     the control that keeps the age limit load-bearing: deleting the filter instead of moving it
     would admit gamma and push the identity count to three. */
  const seedStraddle = (api) => {
    const empty = api.createEmptyWorkspace(policy, BEYOND_EVIDENCE_WINDOW);
    assert.equal(empty.ok, true, JSON.stringify(empty.error || {}));
    const marks = {};
    let workspace = empty.value;
    for (const [name, now, overrides] of [
      ['alphaStale', BEYOND_EVIDENCE_WINDOW, {}],
      ['alphaFresh', EARLIER, {}],
      ['betaFresh', NEXT_DAY, { subjectId: SUBJECT_BETA }],
      ['gammaStale', BEYOND_EVIDENCE_WINDOW, { subjectId: SUBJECT_GAMMA }]
    ]) {
      const result = api.buildBehaviorCandidate(behaviorDraft(overrides), workspace, { now }, policy);
      assert.equal(result.ok, true, `${name}: ${JSON.stringify(result.error || {})}`);
      assert.equal(result.value.accepted, true, `${name} must reach storage before projection is judged`);
      marks[name] = result.value.event;
      workspace = result.value.workspace;
    }
    return { events: workspace.behaviorEvents, marks };
  };

  const signalFor = (stack, events) => {
    const derived = stack.brief.deriveInterestSignals({ behaviorCutoffAt: RANKED_AT, events, policy });
    assert.equal(derived.ok, true, JSON.stringify(derived.error || {}));
    const signal = derived.value.interestSignals.find((entry) => entry.domain === 'equity-research');
    assert.ok(signal, 'the projection must emit the equity-research signal');
    return signal;
  };

  const shipped = loadStackFromSource(briefSource);
  const reordered = loadStackFromSource(reorderedSource);
  const shippedSeed = seedStraddle(shipped.api);
  const reorderedSeed = seedStraddle(reordered.api);

  // Vacuity guards: the straddle must actually exist in storage before invariants mean anything.
  assert.equal(shippedSeed.events.length, 4, 'storage must retain all four occurrences');
  assert.equal(shippedSeed.marks.alphaStale.eventIdentity, shippedSeed.marks.alphaFresh.eventIdentity,
    'alpha must be ONE semantic identity, or nothing is collapsed and the ordering cannot matter');
  assert.notEqual(shippedSeed.marks.alphaStale.occurrence.occurrenceId,
    shippedSeed.marks.alphaFresh.occurrence.occurrenceId);
  assert.ok(Date.parse(RANKED_AT) - Date.parse(BEYOND_EVIDENCE_WINDOW) >
    policy.behavior.maximumEvidenceAgeDays * 86400000,
    'the stale instant must be outside the declared window');
  assert.ok(Date.parse(RANKED_AT) - Date.parse(EARLIER) <
    policy.behavior.maximumEvidenceAgeDays * 86400000,
    'the fresh instant must be inside the declared window');

  const shippedSignal = signalFor(shipped, shippedSeed.events);
  assert.equal(shippedSignal.floor.distinctCompletionIdentities, 2,
    'alpha survives through its fresh occurrence and beta stands alone; gamma is expired, so three would mean the age limit stopped biting');
  assert.equal(shippedSignal.floor.distinctNewYorkCivilDates, 2);
  assert.equal(shippedSignal.floor.satisfied, true,
    'a stale first occurrence must not push a domain with fresh evidence below the relevance floor');
  assert.deepEqual(shippedSignal.supportingOccurrenceIds.slice().sort(),
    [shippedSeed.marks.alphaFresh.occurrence.occurrenceId,
      shippedSeed.marks.betaFresh.occurrence.occurrenceId].sort(),
    'the occurrence that represents alpha must be the fresh one, and no expired occurrence may support the signal');

  const reorderedSignal = signalFor(reordered, reorderedSeed.events);
  assert.equal(reorderedSignal.floor.distinctCompletionIdentities, 1,
    'filtering after the collapse loses alpha entirely — this is the regression being pinned');
  assert.equal(reorderedSignal.floor.satisfied, false,
    'and it drops the domain below the floor, which suppresses the inferred lane');
  assert.equal(reorderedSignal.supportingOccurrenceIds.includes(
    reorderedSeed.marks.alphaFresh.occurrence.occurrenceId), false,
    'alpha\'s fresh occurrence is discarded even though it is inside the window');
  assert.notEqual(reorderedSignal.score, shippedSignal.score,
    'the ordering must be observable in the score, or the two branches are indistinguishable');
});
