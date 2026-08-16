/*
 * tests/distributed-briefs.final-budget.stress.mjs — Feature 002 Scope 08 (SCN-002-025).
 *
 * Scope 08 promises the final aggregator will "enforce the explicit final input/output/run budgets
 * WITHOUT truncating participant, recommendation terms, conflicts, provenance, or required context".
 * The functional suite proves that promise at exactly ONE overflow point (a single `maxInputTokens: 12`
 * refusal). One point cannot prove a boundary holds — a compactor that quietly sheds a source envelope,
 * a group, or a conflict at some intermediate budget would still pass that single check.
 *
 * This suite sweeps the budget across the whole accept/refuse boundary for every scenario shape
 * (single-source, conflicting, merged) in both authoring windows, and asserts the invariants that make
 * the promise real:
 *
 *   1. MONOTONE  — a budget increase never turns an accepted input into a refused one.
 *   2. NO SILENT LOSS — at EVERY accepted budget, all mandatory material is byte-identical to the
 *      unconstrained result. Only `optionalFacts` may shed. Truncating a participant, source envelope,
 *      group or conflict to squeeze under a cap is exactly the failure mode this asserts against.
 *   3. HONEST REFUSAL — below the boundary the compactor REFUSES with the single documented contract
 *      error (`B002-BUDGET` / `final-mandatory-material-exceeds-cap`) rather than degrading.
 *   4. DETERMINISM UNDER REPETITION — repeated compaction of identical inputs is byte-stable, so no
 *      state leaks across runs in the 4x/day pipeline.
 *
 * Anti-tautology: each combination MUST exercise both sides of the boundary. If a future budget change
 * made the sweep all-accept or all-refuse the assertions would become vacuous, so that is asserted too.
 */
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { singleSourceScenario, conflictScenario, mergedScenario } from './fixtures/feature-002/final/final-fixture-builder.mjs';
import {
  RESEARCH_AGENDA_CONTRACTS,
  resolveResearchAgendaPolicy,
  runResearchSidePool,
  validateResearchAgendaAcquisitionUsage
} from '../scripts/research-agenda-generation.mjs';
import * as RESEARCH_AGENDA_RUNTIME from '../scripts/research-agenda-generation.mjs';
import { bindResearchAgendaAcquisition, prepareResearchAgendaRuntime } from '../scripts/research-agenda-refresh.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const RLAGENDA = require('../rlagenda.js');
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

/* Every field of the compacted final input that carries participant, provenance, recommendation,
   conflict or required-context material. None of these may shed to fit a budget. */
const MANDATORY_FIELDS = [
  'contractVersion',
  'runHeader',
  'registry',
  'marketSessionEvidenceRef',
  'sourceEnvelopes',
  'groups',
  'lowNoiseResults',
  'lifecycle',
  'actionThresholds'
];

const SHEDDABLE_FIELD = 'optionalFacts';

const SWEEP_START = 200;
const SWEEP_END = 9000;
const SWEEP_STEP = 20;
const REPEAT_COUNT = 200;

const SCENARIOS = [
  ['single-source', singleSourceScenario],
  ['conflict', conflictScenario],
  ['merged', mergedScenario]
];
const WINDOWS = ['morning', 'after-hours'];

function compact(scenario, budgetOverrides) {
  return RLCONTRACTS.compactFinalAuthorInput(
    scenario.registry,
    scenario.reads,
    scenario.briefs,
    scenario.groups,
    scenario.runContext,
    { ...scenario.finalBudget, ...budgetOverrides }
  );
}

test('Final budget boundary refuses honestly and never truncates mandatory material under sweep', () => {
  let totalCompactions = 0;

  for (const window of WINDOWS) {
    for (const [shape, makeScenario] of SCENARIOS) {
      const label = `${shape}/${window}`;
      const scenario = makeScenario(window);

      const unconstrained = compact(scenario, {});
      assert.equal(unconstrained.ok, true, `${label}: unconstrained compaction must succeed`);
      const full = unconstrained.value.finalInput;

      let accepted = 0;
      let refused = 0;
      let sawAcceptance = false;

      for (let maxInputTokens = SWEEP_START; maxInputTokens <= SWEEP_END; maxInputTokens += SWEEP_STEP) {
        const result = compact(scenario, { maxInputTokens });
        totalCompactions += 1;

        if (!result.ok) {
          refused += 1;

          // 1. MONOTONE: once a budget accepts, no larger budget may refuse.
          assert.equal(
            sawAcceptance,
            false,
            `${label}: budget ${maxInputTokens} refused after a smaller budget was accepted (non-monotone)`
          );

          // 3. HONEST REFUSAL: exactly the documented contract error, never a variant or a silent degrade.
          assert.equal(result.error.code, 'B002-BUDGET', `${label}: budget ${maxInputTokens} refusal code`);
          assert.equal(
            result.error.reason,
            'final-mandatory-material-exceeds-cap',
            `${label}: budget ${maxInputTokens} refusal reason`
          );
          continue;
        }

        accepted += 1;
        sawAcceptance = true;
        const finalInput = result.value.finalInput;

        // 2. NO SILENT LOSS: mandatory material is byte-identical to the unconstrained result.
        for (const field of MANDATORY_FIELDS) {
          assert.deepEqual(
            finalInput[field],
            full[field],
            `${label}: budget ${maxInputTokens} truncated mandatory field '${field}'`
          );
        }

        // ...and nothing outside the single sheddable field is allowed to differ at all.
        const drifted = Object.keys(full).filter(
          (key) => JSON.stringify(finalInput[key]) !== JSON.stringify(full[key])
        );
        assert.deepEqual(
          drifted.filter((key) => key !== SHEDDABLE_FIELD),
          [],
          `${label}: budget ${maxInputTokens} altered fields outside '${SHEDDABLE_FIELD}'`
        );
      }

      // Anti-tautology: the sweep must straddle the boundary, or the assertions above prove nothing.
      assert.ok(accepted > 0, `${label}: sweep never accepted — assertions would be vacuous`);
      assert.ok(refused > 0, `${label}: sweep never refused — boundary was not exercised`);
    }
  }

  assert.ok(totalCompactions > 2000, `sweep must be a real load, got ${totalCompactions} compactions`);
});

test('Repeated final compaction of identical inputs is byte-stable', () => {
  for (const window of WINDOWS) {
    for (const [shape, makeScenario] of SCENARIOS) {
      const label = `${shape}/${window}`;
      const scenario = makeScenario(window);

      const reference = JSON.stringify(compact(scenario, {}).value.finalInput);

      for (let iteration = 0; iteration < REPEAT_COUNT; iteration += 1) {
        const repeated = compact(scenario, {});
        assert.equal(repeated.ok, true, `${label}: repeat ${iteration} must succeed`);
        assert.equal(
          JSON.stringify(repeated.value.finalInput),
          reference,
          `${label}: repeat ${iteration} drifted from the first compaction`
        );
      }
    }
  }
});

test('Agenda acquisition and authoring remain within explicit topic byte concurrency and timeout budgets', async () => {
  const fs = require('node:fs');
  const registry = JSON.parse(fs.readFileSync(new URL('../research-agenda.json', import.meta.url), 'utf8'));
  const config = JSON.parse(fs.readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));
  const agendaPolicy = RLAGENDA.resolveAgendaPolicy(registry.reviewPolicy);
  assert.equal(agendaPolicy.ok, true);
  const policyResult = resolveResearchAgendaPolicy(config);
  assert.equal(policyResult.ok, true);
  const webPolicy = policyResult.value;
  assert.equal(webPolicy.maxQueries, 12);
  assert.equal(webPolicy.maxCandidateUrls, 48);
  assert.equal(webPolicy.totalAcquisitionMs, 90000);
  assert.equal(webPolicy.maxConcurrentFetches, 4);
  assert.equal(registry.reviewPolicy.maxConcurrentTopicAcquisitions, 2);
  const usage = {
    queryCount: webPolicy.maxQueries,
    candidateUrlCount: webPolicy.maxCandidateUrls,
    retainedOriginCount: webPolicy.maxRetainedOrigins,
    retainedExcerptCount: webPolicy.maxRetainedExcerpts,
    maxExcerptBytes: webPolicy.maxExcerptBytes,
    maxResponseBytesPerUrl: webPolicy.maxResponseBytesPerUrl,
    bundleBytes: webPolicy.maxBundleBytes,
    maxRequestMs: webPolicy.perRequestTimeoutMs,
    totalAcquisitionMs: webPolicy.totalAcquisitionMs,
    peakConcurrentFetches: webPolicy.maxConcurrentFetches
  };
  assert.equal(validateResearchAgendaAcquisitionUsage(usage, webPolicy).ok, true);

  const selectedTopics = registry.topics.slice(0, 2).map((topic) => ({
    topic,
    definition: JSON.parse(fs.readFileSync(new URL('../' + topic.definitionRef, import.meta.url), 'utf8')),
    acquisition: null,
    committedEvidence: []
  }));
  const generationId = `generation-${'8'.repeat(64)}`;
  const authorPolicy = agendaPolicy.value.researchAuthoring;
  let active = 0;
  let peak = 0;
  const authorFn = async (request) => {
    active += 1;
    peak = Math.max(peak, active);
    await Promise.resolve();
    active -= 1;
    return {
      contractVersion: RESEARCH_AGENDA_CONTRACTS.situation,
      generationId,
      topicId: request.topicId,
      authoredAt: '2026-08-13T12:00:00.000Z',
      completePass: true,
      evidenceRecords: [],
      sectionInterpretations: request.definition.analyticalSections.map((section) => ({ sectionId: section.sectionId, status: 'unchanged', interpretation: 'No new evidence.', gaps: [] })),
      findings: [],
      sourceLedger: [],
      newEvidenceIds: [],
      modelInputs: { chokepointState: {}, inventoryGapByChannel: {}, levers: {} }
    };
  };
  const pool = await runResearchSidePool({
    topics: selectedTopics,
    generationId,
    policy: agendaPolicy.value,
    policyDigest: agendaPolicy.digest,
    authorFn
  });
  assert.equal(pool.ok, true);
  assert.equal(pool.value.telemetry.calls, 2);
  assert.equal(pool.value.telemetry.attempts, 2, 'one attempt per selected topic');
  assert.equal(pool.value.telemetry.peakConcurrency, 1);
  assert.equal(peak, 1, 'independent observation confirms serial authoring');
  assert.equal(pool.value.telemetry.timeoutSeconds, 900);

  const inputAgendaPolicy = RLAGENDA.resolveAgendaPolicy({
    ...agendaPolicy.value,
    researchAuthoring: { ...authorPolicy, maxInputBytes: 1 }
  });
  const inputRefusal = await runResearchSidePool({
    topics: selectedTopics.slice(0, 1),
    generationId,
    policy: inputAgendaPolicy.value,
    policyDigest: inputAgendaPolicy.digest,
    authorFn
  });
  assert.equal(inputRefusal.ok, true);
  assert.equal(inputRefusal.value.failuresByTopicId[selectedTopics[0].topic.topicId], 'author-input-over-budget');
  assert.equal(inputRefusal.value.telemetry.calls, 0);

  const outputAgendaPolicy = RLAGENDA.resolveAgendaPolicy({
    ...agendaPolicy.value,
    researchAuthoring: { ...authorPolicy, maxOutputBytes: 1 }
  });
  const outputRefusal = await runResearchSidePool({
    topics: selectedTopics.slice(0, 1),
    generationId,
    policy: outputAgendaPolicy.value,
    policyDigest: outputAgendaPolicy.digest,
    authorFn
  });
  assert.equal(outputRefusal.ok, true);
  assert.equal(outputRefusal.value.failuresByTopicId[selectedTopics[0].topic.topicId], 'author-output-over-budget');

  const timeout = Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' });
  const timeoutRefusal = await runResearchSidePool({
    topics: selectedTopics.slice(0, 1),
    generationId,
    policy: agendaPolicy.value,
    policyDigest: agendaPolicy.digest,
    authorFn: async () => new Promise(() => {}),
    timer: { withTimeout: async (_promise, milliseconds) => { assert.equal(milliseconds, 900000); throw timeout; } }
  });
  assert.equal(timeoutRefusal.ok, true);
  assert.equal(timeoutRefusal.value.failuresByTopicId[selectedTopics[0].topic.topicId], 'author-timeout');
});

test('Regression: every registry policy member drives runtime behavior and author and acquisition capacity plus one refuses before work', () => {
  const registry = JSON.parse(readFileSync(resolve(REPO_ROOT, 'research-agenda.json'), 'utf8'));
  const config = JSON.parse(readFileSync(resolve(REPO_ROOT, 'market-brief.config.json'), 'utf8'));
  const payload = JSON.parse(readFileSync(resolve(REPO_ROOT, 'market-brief.payload.json'), 'utf8'));
  const snapshot = JSON.parse(readFileSync(resolve(REPO_ROOT, 'market-brief.snapshot.json'), 'utf8'));
  const preparation = prepareResearchAgendaRuntime({ root: REPO_ROOT, config, payload, snapshot });

  assert.deepEqual(preparation.agendaPolicy, registry.reviewPolicy);
  assert.equal(Object.isFrozen(preparation.agendaPolicy), true);
  assert.equal(Object.isFrozen(preparation.agendaPolicy.researchAuthoring), true);
  assert.equal(preparation.policyDigest, RLAGENDA.agendaDigest(registry.reviewPolicy));
  assert.equal(preparation.authorInput.policy, preparation.agendaPolicy.researchAuthoring);
  assert.equal(preparation.authorInput.policyDigest, preparation.policyDigest);
  assert.equal(preparation.acquisitionInput.policy, preparation.agendaPolicy);
  assert.equal(preparation.acquisitionInput.policyDigest, preparation.policyDigest);

  const authorPolicy = preparation.agendaPolicy.researchAuthoring;
  const authorAtLimit = RESEARCH_AGENDA_RUNTIME.validateResearchAuthorUsage(
    { attemptsForTopic: authorPolicy.attempts, activeConcurrency: authorPolicy.concurrency },
    preparation.agendaPolicy,
    preparation.policyDigest
  );
  const authorAttemptsPlusOne = RESEARCH_AGENDA_RUNTIME.validateResearchAuthorUsage(
    { attemptsForTopic: authorPolicy.attempts + 1, activeConcurrency: 1 },
    preparation.agendaPolicy,
    preparation.policyDigest
  );
  const authorConcurrencyPlusOne = RESEARCH_AGENDA_RUNTIME.validateResearchAuthorUsage(
    { attemptsForTopic: 1, activeConcurrency: authorPolicy.concurrency + 1 },
    preparation.agendaPolicy,
    preparation.policyDigest
  );
  const acquisitionAtLimit = RESEARCH_AGENDA_RUNTIME.validateResearchTopicAcquisitionUsage(
    { activeConcurrency: preparation.agendaPolicy.maxConcurrentTopicAcquisitions },
    preparation.agendaPolicy,
    preparation.policyDigest
  );
  const acquisitionPlusOne = RESEARCH_AGENDA_RUNTIME.validateResearchTopicAcquisitionUsage(
    { activeConcurrency: preparation.agendaPolicy.maxConcurrentTopicAcquisitions + 1 },
    preparation.agendaPolicy,
    preparation.policyDigest
  );

  assert.equal(authorAtLimit.ok, true);
  assert.equal(authorAttemptsPlusOne.error.reason, 'author-attempts-over-cap');
  assert.equal(authorConcurrencyPlusOne.error.reason, 'author-concurrency-over-cap');
  assert.equal(acquisitionAtLimit.ok, true);
  assert.equal(acquisitionPlusOne.error.reason, 'topic-acquisition-concurrency-over-cap');
});

test('Regression: acquisition and author scheduling consume the same changed frozen registry policy and telemetry rejects observed policy plus one before work', async (context) => {
  const root = mkdtempSync(resolve(tmpdir(), 'research-agenda-policy-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  cpSync(resolve(REPO_ROOT, 'research'), resolve(root, 'research'), { recursive: true });
  cpSync(resolve(REPO_ROOT, 'data'), resolve(root, 'data'), { recursive: true });
  cpSync(resolve(REPO_ROOT, 'rlexperience-adapters'), resolve(root, 'rlexperience-adapters'), { recursive: true });
  cpSync(resolve(REPO_ROOT, 'notes'), resolve(root, 'notes'), { recursive: true });
  for (const relativePath of ['tools.json', 'rlagenda.js', 'research-agenda-lab.html']) {
    cpSync(resolve(REPO_ROOT, relativePath), resolve(root, relativePath));
  }

  const committedRegistry = JSON.parse(readFileSync(resolve(REPO_ROOT, 'research-agenda.json'), 'utf8'));
  const registry = JSON.parse(JSON.stringify(committedRegistry));
  registry.reviewPolicy.maxConcurrentTopicAcquisitions = 1;
  registry.reviewPolicy.maxActiveEveryGenerationTopics = 2;
  registry.reviewPolicy.cadenceTopicReviewBudget = 2;
  registry.reviewPolicy.researchAuthoring = {
    timeoutSeconds: 7,
    attempts: 2,
    concurrency: 2,
    maxInputBytes: 600000,
    maxOutputBytes: 700000
  };
  writeFileSync(resolve(root, 'research-agenda.json'), JSON.stringify(registry) + '\n');

  const runtimeInputs = {
    snapshot: JSON.parse(readFileSync(resolve(REPO_ROOT, 'market-brief.snapshot.json'), 'utf8')),
    config: JSON.parse(readFileSync(resolve(REPO_ROOT, 'market-brief.config.json'), 'utf8')),
    payload: JSON.parse(readFileSync(resolve(REPO_ROOT, 'market-brief.payload.json'), 'utf8'))
  };
  const preparation = prepareResearchAgendaRuntime({ root, ...runtimeInputs });
  assert.deepEqual(
    preparation.authorInput.policy,
    registry.reviewPolicy.researchAuthoring,
    'runtime preparation must carry the validated registry author policy without a literal replacement'
  );
  assert.equal(Object.isFrozen(preparation.agendaPolicy), true);
  assert.equal(Object.isFrozen(preparation.agendaPolicy.cadenceSelectionOrder), true);
  assert.equal(Object.isFrozen(preparation.agendaPolicy.researchAuthoring), true);
  assert.equal(Object.isFrozen(preparation.authorInput.policy), true);
  assert.equal(preparation.policyDigest, RLAGENDA.agendaDigest(registry.reviewPolicy));
  assert.equal(preparation.authorInput.policyDigest, preparation.policyDigest);
  assert.equal(preparation.authorInput.policy, preparation.agendaPolicy.researchAuthoring);
  assert.equal(preparation.acquisitionInput.policy, preparation.agendaPolicy);
  assert.equal(preparation.acquisitionInput.policyDigest, preparation.policyDigest);
  assert.equal(preparation.retryCacheIdentity, RLAGENDA.agendaDigest({
    generationId: preparation.generationId,
    inputFingerprint: preparation.inputFingerprint,
    policyDigest: preparation.policyDigest
  }));

  const requiredReviewPolicyFields = [
    'maxActiveEveryGenerationTopics',
    'cadenceTopicReviewBudget',
    'cadenceSelectionOrder',
    'maxConcurrentTopicAcquisitions',
    'researchAuthoring'
  ];
  const requiredAuthorPolicyFields = ['timeoutSeconds', 'attempts', 'concurrency', 'maxInputBytes', 'maxOutputBytes'];
  for (const field of requiredReviewPolicyFields) {
    const missing = JSON.parse(JSON.stringify(committedRegistry));
    delete missing.reviewPolicy[field];
    const result = RLAGENDA.validateAgenda(missing);
    assert.equal(result.ok, false, `missing reviewPolicy.${field} must refuse`);
    assert.equal(result.status, 'invalid');
    writeFileSync(resolve(root, 'research-agenda.json'), JSON.stringify(missing) + '\n');
    assert.throws(() => prepareResearchAgendaRuntime({ root, ...runtimeInputs }), /registry policy failed/);
  }
  for (const field of requiredAuthorPolicyFields) {
    const missing = JSON.parse(JSON.stringify(committedRegistry));
    delete missing.reviewPolicy.researchAuthoring[field];
    const result = RLAGENDA.validateAgenda(missing);
    assert.equal(result.ok, false, `missing researchAuthoring.${field} must refuse`);
    assert.equal(result.status, 'invalid');
    writeFileSync(resolve(root, 'research-agenda.json'), JSON.stringify(missing) + '\n');
    assert.throws(() => prepareResearchAgendaRuntime({ root, ...runtimeInputs }), /registry policy failed/);
  }
  const invalidPolicyCandidates = [
    ...['maxActiveEveryGenerationTopics', 'cadenceTopicReviewBudget', 'maxConcurrentTopicAcquisitions'].map((field) => {
      const candidate = JSON.parse(JSON.stringify(committedRegistry));
      candidate.reviewPolicy[field] = 0;
      return candidate;
    }),
    ...requiredAuthorPolicyFields.map((field) => {
      const candidate = JSON.parse(JSON.stringify(committedRegistry));
      candidate.reviewPolicy.researchAuthoring[field] = 0;
      return candidate;
    })
  ];
  for (const invalid of invalidPolicyCandidates) {
    assert.equal(RLAGENDA.validateAgenda(invalid).ok, false);
    writeFileSync(resolve(root, 'research-agenda.json'), JSON.stringify(invalid) + '\n');
    assert.throws(() => prepareResearchAgendaRuntime({ root, ...runtimeInputs }), /registry policy failed/);
  }
  const unknownReviewPolicy = JSON.parse(JSON.stringify(committedRegistry));
  unknownReviewPolicy.reviewPolicy.defaultConcurrency = 1;
  const unknownAuthorPolicy = JSON.parse(JSON.stringify(committedRegistry));
  unknownAuthorPolicy.reviewPolicy.researchAuthoring.defaultTimeoutSeconds = 900;
  assert.equal(RLAGENDA.validateAgenda(unknownReviewPolicy).ok, false);
  assert.equal(RLAGENDA.validateAgenda(unknownAuthorPolicy).ok, false);
  writeFileSync(resolve(root, 'research-agenda.json'), JSON.stringify(unknownReviewPolicy) + '\n');
  assert.throws(() => prepareResearchAgendaRuntime({ root, ...runtimeInputs }), /registry policy failed/);
  writeFileSync(resolve(root, 'research-agenda.json'), JSON.stringify(unknownAuthorPolicy) + '\n');
  assert.throws(() => prepareResearchAgendaRuntime({ root, ...runtimeInputs }), /registry policy failed/);
  writeFileSync(resolve(root, 'research-agenda.json'), JSON.stringify(registry) + '\n');

  const twoMandatory = JSON.parse(JSON.stringify(registry));
  twoMandatory.topics[1].reviewPolicy = { mode: 'every-generation', freshnessWindowHours: 24 };
  assert.equal(RLAGENDA.validateAgenda(twoMandatory).ok, true);
  twoMandatory.reviewPolicy.maxActiveEveryGenerationTopics = 1;
  assert.equal(RLAGENDA.validateAgenda(twoMandatory).refusals[0].code, 'RLAGENDA-CAPACITY-EVERY-GENERATION');

  const definitionsByTopicId = Object.fromEntries(committedRegistry.topics.map((topic) => [
    topic.topicId,
    JSON.parse(readFileSync(resolve(root, topic.definitionRef), 'utf8'))
  ]));
  const allCadence = JSON.parse(JSON.stringify(registry));
  allCadence.topics[0].reviewPolicy = { mode: 'cadence', cadenceDays: 1, freshnessWindowDays: 30 };
  const cadenceBudgetOne = JSON.parse(JSON.stringify(allCadence));
  cadenceBudgetOne.reviewPolicy.cadenceTopicReviewBudget = 1;
  const cadencePlanOne = RLAGENDA.planGeneration(
    cadenceBudgetOne,
    '',
    { definitionsByTopicId, triggerObservations: [] },
    '2026-08-13T12:00:00.000Z'
  );
  const cadencePlanTwo = RLAGENDA.planGeneration(
    allCadence,
    '',
    { definitionsByTopicId, triggerObservations: [] },
    '2026-08-13T12:00:00.000Z'
  );
  assert.equal(cadencePlanOne.ok, true);
  assert.equal(cadencePlanOne.selectedCadenceCount, 1);
  assert.equal(cadencePlanTwo.ok, true);
  assert.equal(cadencePlanTwo.selectedCadenceCount, 2);
  const changedCadenceOrder = JSON.parse(JSON.stringify(registry));
  changedCadenceOrder.reviewPolicy.cadenceSelectionOrder = [...changedCadenceOrder.reviewPolicy.cadenceSelectionOrder].reverse();
  assert.equal(RLAGENDA.validateAgenda(changedCadenceOrder).ok, false);

  const topics = registry.topics.slice(0, 2).map((topic) => ({
    topic,
    definition: JSON.parse(readFileSync(resolve(root, topic.definitionRef), 'utf8')),
    acquisition: null,
    committedEvidence: []
  }));
  const attemptsByTopicId = {};
  const observedTimeouts = [];
  let authorCalls = 0;
  let activeAuthors = 0;
  let peakAuthors = 0;
  const situationFor = (request) => ({
    contractVersion: RESEARCH_AGENDA_CONTRACTS.situation,
    generationId: preparation.generationId,
    topicId: request.topicId,
    authoredAt: '2026-08-13T12:00:00.000Z',
    completePass: true,
    evidenceRecords: [],
    sectionInterpretations: request.definition.analyticalSections.map((section) => ({
      sectionId: section.sectionId,
      status: 'unchanged',
      interpretation: 'No new evidence.',
      gaps: []
    })),
    findings: [],
    sourceLedger: [],
    newEvidenceIds: [],
    modelInputs: { chokepointState: {}, inventoryGapByChannel: {}, levers: {} }
  });
  const authorFn = async (request) => {
    authorCalls += 1;
    attemptsByTopicId[request.topicId] = (attemptsByTopicId[request.topicId] || 0) + 1;
    activeAuthors += 1;
    peakAuthors = Math.max(peakAuthors, activeAuthors);
    await new Promise((resolveAttempt) => setImmediate(resolveAttempt));
    activeAuthors -= 1;
    if (attemptsByTopicId[request.topicId] === 1) throw new Error('retryable author failure');
    return situationFor(request);
  };
  const authorPool = await runResearchSidePool({
    topics,
    generationId: preparation.generationId,
    policy: preparation.agendaPolicy,
    policyDigest: preparation.policyDigest,
    authorFn,
    timer: {
      withTimeout: async (invocation, milliseconds) => {
        observedTimeouts.push(milliseconds);
        return invocation;
      }
    }
  });
  assert.equal(authorPool.ok, true);
  assert.deepEqual(attemptsByTopicId, Object.fromEntries(topics.map((entry) => [entry.topic.topicId, 2])));
  assert.equal(peakAuthors, 2);
  assert.deepEqual([...new Set(observedTimeouts)], [7000]);
  assert.equal(authorPool.value.telemetry.attempts, 4);
  assert.equal(authorPool.value.telemetry.peakConcurrency, 2);
  assert.equal(authorPool.value.telemetry.timeoutSeconds, preparation.authorInput.policy.timeoutSeconds);
  assert.equal(authorPool.value.telemetry.maxAttemptsPerTopic, preparation.authorInput.policy.attempts);
  assert.equal(authorPool.value.telemetry.concurrency, preparation.authorInput.policy.concurrency);
  assert.equal(authorPool.value.telemetry.maxInputBytes, preparation.authorInput.policy.maxInputBytes);
  assert.equal(authorPool.value.telemetry.maxOutputBytes, preparation.authorInput.policy.maxOutputBytes);
  assert.equal(authorPool.value.telemetry.policyDigest, preparation.policyDigest);
  assert.ok(authorPool.value.telemetry.maxObservedInputBytes > 1);
  assert.ok(authorPool.value.telemetry.maxObservedOutputBytes > 1);
  assert.equal(typeof RESEARCH_AGENDA_RUNTIME.validateResearchAuthorUsage, 'function');
  const authorCallsBeforeAttemptsRefusal = authorCalls;
  const attemptsPlusOne = RESEARCH_AGENDA_RUNTIME.validateResearchAuthorUsage(
    { attemptsForTopic: preparation.authorInput.policy.attempts + 1, activeConcurrency: 1 },
    preparation.agendaPolicy,
    preparation.policyDigest
  );
  assert.equal(authorCalls, authorCallsBeforeAttemptsRefusal, 'author attempts plus one must refuse before author work');
  const authorCallsBeforeConcurrencyRefusal = authorCalls;
  const authorsPlusOne = RESEARCH_AGENDA_RUNTIME.validateResearchAuthorUsage(
    { attemptsForTopic: 1, activeConcurrency: preparation.authorInput.policy.concurrency + 1 },
    preparation.agendaPolicy,
    preparation.policyDigest
  );
  assert.equal(attemptsPlusOne.ok, false);
  assert.equal(attemptsPlusOne.error.reason, 'author-attempts-over-cap');
  assert.equal(authorsPlusOne.ok, false);
  assert.equal(authorsPlusOne.error.reason, 'author-concurrency-over-cap');
  assert.equal(authorCalls, authorCallsBeforeConcurrencyRefusal, 'author concurrency plus one must refuse before author work');

  const exactInputLimit = authorPool.value.telemetry.maxObservedInputBytes - 1;
  const inputPolicy = RLAGENDA.resolveAgendaPolicy({
    ...preparation.agendaPolicy,
    researchAuthoring: { ...preparation.authorInput.policy, attempts: 1, concurrency: 1, maxInputBytes: exactInputLimit }
  });
  let inputCapCalls = 0;
  const inputCapPool = await runResearchSidePool({
    topics: topics.slice(0, 1),
    generationId: preparation.generationId,
    policy: inputPolicy.value,
    policyDigest: inputPolicy.digest,
    authorFn: async () => { inputCapCalls += 1; return {}; }
  });
  assert.equal(inputCapPool.ok, true);
  assert.equal(inputCapCalls, 0);
  assert.equal(inputCapPool.value.telemetry.calls, 0);
  assert.equal(inputCapPool.value.failuresByTopicId[topics[0].topic.topicId], 'author-input-over-budget');
  assert.equal(inputCapPool.value.telemetry.maxInputBytes, exactInputLimit);
  assert.equal(inputCapPool.value.telemetry.maxObservedInputBytes, exactInputLimit + 1);
  assert.deepEqual(inputCapPool.value.situationsByTopicId, {});

  const exactOutputLimit = authorPool.value.telemetry.maxObservedOutputBytes - 1;
  const outputPolicy = RLAGENDA.resolveAgendaPolicy({
    ...preparation.agendaPolicy,
    researchAuthoring: { ...preparation.authorInput.policy, attempts: 1, concurrency: 1, maxOutputBytes: exactOutputLimit }
  });
  let outputCapCalls = 0;
  const outputCapPool = await runResearchSidePool({
    topics: topics.slice(0, 1),
    generationId: preparation.generationId,
    policy: outputPolicy.value,
    policyDigest: outputPolicy.digest,
    authorFn: async (request) => { outputCapCalls += 1; return situationFor(request); }
  });
  assert.equal(outputCapPool.ok, true);
  assert.equal(outputCapCalls, 1);
  assert.equal(outputCapPool.value.telemetry.calls, 1);
  assert.equal(outputCapPool.value.failuresByTopicId[topics[0].topic.topicId], 'author-output-over-budget');
  assert.equal(outputCapPool.value.telemetry.maxOutputBytes, exactOutputLimit);
  assert.equal(outputCapPool.value.telemetry.maxObservedOutputBytes, exactOutputLimit + 1);
  assert.deepEqual(outputCapPool.value.situationsByTopicId, {});

  assert.equal(typeof RESEARCH_AGENDA_RUNTIME.runResearchTopicAcquisitionPool, 'function');
  assert.equal(typeof RESEARCH_AGENDA_RUNTIME.validateResearchTopicAcquisitionUsage, 'function');
  let activeAcquisitions = 0;
  let peakAcquisitions = 0;
  let acquisitionCalls = 0;
  const acquisitionPool = await RESEARCH_AGENDA_RUNTIME.runResearchTopicAcquisitionPool({
    topics: topics.map((entry) => ({ topicId: entry.topic.topicId })),
    policy: preparation.agendaPolicy,
    policyDigest: preparation.policyDigest,
    acquireFn: async ({ topicId }) => {
      acquisitionCalls += 1;
      activeAcquisitions += 1;
      peakAcquisitions = Math.max(peakAcquisitions, activeAcquisitions);
      await new Promise((resolveAcquisition) => setImmediate(resolveAcquisition));
      activeAcquisitions -= 1;
      return { ok: true, value: { topicId } };
    }
  });
  assert.equal(acquisitionPool.ok, true);
  assert.equal(acquisitionCalls, 2);
  assert.equal(peakAcquisitions, 1);
  assert.equal(acquisitionPool.value.telemetry.peakConcurrency, 1);
  assert.equal(acquisitionPool.value.telemetry.concurrency, preparation.agendaPolicy.maxConcurrentTopicAcquisitions);
  assert.equal(acquisitionPool.value.telemetry.policyDigest, preparation.policyDigest);
  const committedPolicy = RLAGENDA.resolveAgendaPolicy(committedRegistry.reviewPolicy);
  let activeCommittedAcquisitions = 0;
  let peakCommittedAcquisitions = 0;
  const committedAcquisitionPool = await RESEARCH_AGENDA_RUNTIME.runResearchTopicAcquisitionPool({
    topics: topics.map((entry) => ({ topicId: entry.topic.topicId })),
    policy: committedPolicy.value,
    policyDigest: committedPolicy.digest,
    acquireFn: async ({ topicId }) => {
      activeCommittedAcquisitions += 1;
      peakCommittedAcquisitions = Math.max(peakCommittedAcquisitions, activeCommittedAcquisitions);
      await new Promise((resolveAcquisition) => setImmediate(resolveAcquisition));
      activeCommittedAcquisitions -= 1;
      return { ok: true, value: { topicId } };
    }
  });
  assert.equal(committedAcquisitionPool.ok, true);
  assert.equal(peakCommittedAcquisitions, 2);
  assert.equal(committedAcquisitionPool.value.telemetry.peakConcurrency, 2);
  const acquisitionCallsBeforeRefusal = acquisitionCalls;
  const acquisitionPlusOne = RESEARCH_AGENDA_RUNTIME.validateResearchTopicAcquisitionUsage(
    { activeConcurrency: preparation.agendaPolicy.maxConcurrentTopicAcquisitions + 1 },
    preparation.agendaPolicy,
    preparation.policyDigest
  );
  assert.equal(acquisitionPlusOne.ok, false);
  assert.equal(acquisitionPlusOne.error.reason, 'topic-acquisition-concurrency-over-cap');
  assert.equal(acquisitionCalls, acquisitionCallsBeforeRefusal, 'capacity plus one must refuse before acquisition work');

  const emptySearchFragment = {
    contractVersion: 'research-acquisition-search/v1',
    generationId: preparation.generationId,
    queries: preparation.queryPlan.queries.map((query) => ({ queryId: query.queryId, candidates: [] }))
  };
  const bound = await bindResearchAgendaAcquisition({
    preparation,
    searchFragment: emptySearchFragment,
    fetchImpl: async () => { throw new Error('empty candidate sets must perform no fetch'); }
  });
  assert.equal(bound.ok, true);
  assert.equal(bound.value.acquisitionResult.value.telemetry.concurrency, 1);
  assert.equal(bound.value.acquisitionResult.value.telemetry.policyDigest, preparation.policyDigest);
  assert.equal(bound.value.acquisitionResult.value.telemetry.maxConcurrentFetchesPerTopic, preparation.policy.maxConcurrentFetches);
  let invalidFragmentFetches = 0;
  for (const invalidFragment of [
    { ...emptySearchFragment, generationId: 'wrong-generation' },
    { ...emptySearchFragment, queries: {} }
  ]) {
    const invalidBound = await bindResearchAgendaAcquisition({
      preparation,
      searchFragment: invalidFragment,
      fetchImpl: async () => { invalidFragmentFetches += 1; throw new Error('invalid global fragment must refuse before fetch'); }
    });
    assert.equal(invalidBound.ok, true);
    assert.equal(Object.keys(invalidBound.value.acquisitionFailuresByTopicId).length > 0, true);
    assert.equal(Object.values(invalidBound.value.acquisitionFailuresByTopicId).every((reason) => reason === 'search-fragment-invalid'), true);
  }
  assert.equal(invalidFragmentFetches, 0);

  writeFileSync(resolve(root, 'research-agenda.json'), JSON.stringify(committedRegistry) + '\n');
  const committedPreparation = prepareResearchAgendaRuntime({ root, ...runtimeInputs });
  assert.notEqual(committedPreparation.policyDigest, preparation.policyDigest);
  assert.notEqual(committedPreparation.retryCacheIdentity, preparation.retryCacheIdentity);
  const narrativeParallelSource = readFileSync(resolve(REPO_ROOT, 'scripts/brief-narrative-parallel.mjs'), 'utf8');
  assert.equal(/await runResearchSidePool\(\{/.test(narrativeParallelSource), true,
    'the live research author path must execute through the registry-bounded side pool');
  assert.equal(/research acquisition telemetry calls=/.test(narrativeParallelSource), true);
  assert.equal(/research author telemetry calls=/.test(narrativeParallelSource), true);
});

test('Regression: every Feature 019 artifact family accepts exactly 262144 bytes and refuses 262145 before publication', (context) => {
  const config = JSON.parse(readFileSync(resolve(REPO_ROOT, 'market-brief.config.json'), 'utf8'));
  const policy = RESEARCH_AGENDA_RUNTIME.resolveFeature019ArtifactBudgetPolicy(config);
  assert.equal(policy.ok, true);
  assert.equal(policy.value.maxNormalizedObservationBytes, 262144);
  assert.ok(Array.isArray(RESEARCH_AGENDA_RUNTIME.FEATURE_019_ARTIFACT_FAMILIES));
  assert.equal(new Set(RESEARCH_AGENDA_RUNTIME.FEATURE_019_ARTIFACT_FAMILIES).size, RESEARCH_AGENDA_RUNTIME.FEATURE_019_ARTIFACT_FAMILIES.length);

  for (const family of RESEARCH_AGENDA_RUNTIME.FEATURE_019_ARTIFACT_FAMILIES) {
    const path = `boundary/${family}`;
    const exactBytes = 'x'.repeat(policy.value.maxNormalizedObservationBytes);
    const exact = RESEARCH_AGENDA_RUNTIME.validateFeature019ArtifactBytes({
      policy: policy.value,
      family,
      path,
      bytes: exactBytes
    });
    assert.equal(exact.ok, true, `${family}: exact cap must pass`);
    assert.equal(exact.value.bytes, exactBytes, `${family}: exact cap bytes must be preserved`);

    const overflow = RESEARCH_AGENDA_RUNTIME.validateFeature019ArtifactBytes({
      policy: policy.value,
      family,
      path,
      bytes: exactBytes + 'x'
    });
    assert.equal(overflow.ok, false, `${family}: cap plus one must refuse`);
    assert.equal(overflow.error.code, 'E019-ARTIFACT-BUDGET');
    assert.equal(overflow.error.family, family);
    assert.equal(overflow.error.path, path);
    assert.equal(overflow.error.observedBytes, 262145);
    assert.equal(overflow.error.limitBytes, 262144);
  }

  const multibyteOverflow = 'é'.repeat(131072) + 'x';
  assert.equal(multibyteOverflow.length, 131073, 'JS character count remains below the byte cap');
  assert.equal(Buffer.byteLength(multibyteOverflow, 'utf8'), 262145);
  const multibyteRefusal = RESEARCH_AGENDA_RUNTIME.validateFeature019ArtifactBytes({
    policy: policy.value,
    family: RESEARCH_AGENDA_RUNTIME.FEATURE_019_ARTIFACT_FAMILIES[0],
    path: 'boundary/multibyte',
    bytes: multibyteOverflow
  });
  assert.equal(multibyteRefusal.ok, false);
  assert.equal(multibyteRefusal.error.observedBytes, 262145);

  const unknownFamily = RESEARCH_AGENDA_RUNTIME.validateFeature019ArtifactBytes({
    policy: policy.value,
    family: 'not-a-feature-019-family',
    path: 'boundary/unknown',
    bytes: ''
  });
  assert.equal(unknownFamily.ok, false);
  assert.equal(unknownFamily.error.code, 'E019-ARTIFACT-BUDGET');
  assert.equal(unknownFamily.error.reason, 'artifact-family-unknown');

  const missingPolicy = structuredClone(config);
  delete missingPolicy['artifact-budget/v1'];
  assert.equal(RESEARCH_AGENDA_RUNTIME.resolveFeature019ArtifactBudgetPolicy(missingPolicy).error.reason, 'artifact-budget-policy-missing');
  for (const field of Object.keys(policy.value)) {
    const candidateConfig = structuredClone(config);
    delete candidateConfig['artifact-budget/v1'][field];
    const refused = RESEARCH_AGENDA_RUNTIME.resolveFeature019ArtifactBudgetPolicy(candidateConfig);
    assert.equal(refused.ok, false, `missing policy field ${field} must refuse`);
    assert.equal(refused.error.reason, 'artifact-budget-policy-invalid');
  }
  const unknownPolicyField = structuredClone(config);
  unknownPolicyField['artifact-budget/v1'].defaultArtifactBytes = 262144;
  assert.equal(RESEARCH_AGENDA_RUNTIME.resolveFeature019ArtifactBudgetPolicy(unknownPolicyField).error.reason, 'artifact-budget-policy-invalid');
  for (const [field, value] of [
    ['contractVersion', 'artifact-budget/v2'],
    ['policyId', 'artifact-budget/default'],
    ['maxBarsPerSymbolTradingDate', 0],
    ['maxSymbolsPerRun', 0],
    ['maxNormalizedObservationBytes', 0],
    ['rawBodyRetention', 'retain']
  ]) {
    const candidateConfig = structuredClone(config);
    candidateConfig['artifact-budget/v1'][field] = value;
    const refused = RESEARCH_AGENDA_RUNTIME.resolveFeature019ArtifactBudgetPolicy(candidateConfig);
    assert.equal(refused.ok, false, `invalid policy field ${field} must refuse`);
    assert.equal(refused.error.field, field);
  }

  const makeRuntimeRoot = () => {
    const root = mkdtempSync(resolve(tmpdir(), 'research-agenda-artifact-budget-'));
    context.after(() => rmSync(root, { recursive: true, force: true }));
    for (const directory of ['research', 'data', 'rlexperience-adapters', 'notes']) {
      cpSync(resolve(REPO_ROOT, directory), resolve(root, directory), { recursive: true });
    }
    for (const relativePath of ['research-agenda.json', 'tools.json', 'rlagenda.js', 'research-agenda-lab.html']) {
      cpSync(resolve(REPO_ROOT, relativePath), resolve(root, relativePath));
    }
    return root;
  };
  const runtimeRoot = makeRuntimeRoot();
  const snapshot = JSON.parse(readFileSync(resolve(REPO_ROOT, 'market-brief.snapshot.json'), 'utf8'));
  const payload = JSON.parse(readFileSync(resolve(REPO_ROOT, 'market-brief.payload.json'), 'utf8'));
  const tools = JSON.parse(readFileSync(resolve(REPO_ROOT, 'tools.json'), 'utf8'));
  const runtimeInputs = { snapshot, config, payload };
  const captureRefusal = (operation) => {
    try {
      operation();
    } catch (error) {
      return error;
    }
    assert.fail('operation must refuse');
  };

  const originalModuleBytes = readFileSync(resolve(runtimeRoot, 'rlagenda.js'), 'utf8');
  const exactStaticBytes = 's'.repeat(policy.value.maxNormalizedObservationBytes);
  writeFileSync(resolve(runtimeRoot, 'rlagenda.js'), exactStaticBytes);
  const exactStaticPreparation = prepareResearchAgendaRuntime({ root: runtimeRoot, ...runtimeInputs });
  assert.equal(readFileSync(resolve(runtimeRoot, 'rlagenda.js'), 'utf8'), exactStaticBytes, 'exact static bytes remain unchanged');
  assert.ok(exactStaticPreparation.artifactBudgetChecks.some((check) =>
    check.family === 'umd-module' && check.path === 'rlagenda.js' && check.observedBytes === 262144));
  writeFileSync(resolve(runtimeRoot, 'rlagenda.js'), exactStaticBytes + 's');
  const staticRefusal = captureRefusal(() => prepareResearchAgendaRuntime({ root: runtimeRoot, ...runtimeInputs }));
  assert.equal(staticRefusal.code, 'E019-ARTIFACT-BUDGET');
  assert.equal(staticRefusal.family, 'umd-module');
  assert.equal(staticRefusal.path, 'rlagenda.js');
  assert.equal(staticRefusal.observedBytes, 262145);
  assert.equal(staticRefusal.limitBytes, 262144);
  writeFileSync(resolve(runtimeRoot, 'rlagenda.js'), originalModuleBytes);

  const definitionPath = 'research/agenda/topics/geopolitical-supply-shock.definition.json';
  const originalDefinitionBytes = readFileSync(resolve(runtimeRoot, definitionPath), 'utf8');
  const symbolOverflowDefinition = JSON.parse(originalDefinitionBytes);
  const proxyTemplate = symbolOverflowDefinition.proxyDefinitions[0];
  symbolOverflowDefinition.proxyDefinitions.push(...Array.from({ length: 49 }, (_, index) => ({
    ...structuredClone(proxyTemplate),
    proxyId: `tp0417-${String(index).padStart(2, '0')}`,
    ticker: `TP0417${String(index).padStart(2, '0')}`
  })));
  writeFileSync(resolve(runtimeRoot, definitionPath), JSON.stringify(symbolOverflowDefinition, null, 2) + '\n');
  const symbolRefusal = captureRefusal(() => prepareResearchAgendaRuntime({ root: runtimeRoot, ...runtimeInputs }));
  assert.equal(symbolRefusal.code, 'E019-ARTIFACT-BUDGET');
  assert.equal(symbolRefusal.reason, 'model-input-symbols-over-cap');
  assert.equal(symbolRefusal.observedSymbols > 48, true);
  assert.equal(symbolRefusal.limitSymbols, 48);
  writeFileSync(resolve(runtimeRoot, definitionPath), originalDefinitionBytes);

  const barPath = 'data/bars/BNO.json';
  const originalBarBytes = readFileSync(resolve(runtimeRoot, barPath), 'utf8');
  const barOverflow = JSON.parse(originalBarBytes);
  barOverflow.rows = Array.from({ length: 201 }, () => ({ ...barOverflow.rows[0] }));
  writeFileSync(resolve(runtimeRoot, barPath), JSON.stringify(barOverflow) + '\n');
  const barRefusal = captureRefusal(() => prepareResearchAgendaRuntime({ root: runtimeRoot, ...runtimeInputs }));
  assert.equal(barRefusal.code, 'E019-ARTIFACT-BUDGET');
  assert.equal(barRefusal.reason, 'bar-rows-per-symbol-trading-date-over-cap');
  assert.equal(barRefusal.path, barPath);
  assert.equal(barRefusal.observedRows, 201);
  assert.equal(barRefusal.limitRows, 200);
  writeFileSync(resolve(runtimeRoot, barPath), originalBarBytes);

  const transactionSnapshot = structuredClone(snapshot);
  transactionSnapshot.generatedAt = '2026-08-15T12:00:00.000Z';
  const preparation = prepareResearchAgendaRuntime({ root: runtimeRoot, snapshot: transactionSnapshot, config, payload });
  assert.equal(preparation.modelInputBudget.observedSymbols <= 48, true);
  assert.equal(preparation.modelInputBudget.maxRowsPerSymbolTradingDate <= 200, true);
  const selected = preparation.plan.selected.find((row) => row.topicId === 'geopolitical-supply-shock');
  assert.ok(selected, 'the every-generation topic must be selected');
  const topic = preparation.registry.topics.find((row) => row.topicId === selected.topicId);
  assert.ok(topic, 'TP-04-17 requires the selected topic contract');
  const definition = preparation.definitionsByTopicId[selected.topicId];
  const evidence = JSON.parse(readFileSync(resolve(REPO_ROOT, 'tests/fixtures/research-agenda/valid-evidence-record.json'), 'utf8'));
  evidence.observedAt = '2026-08-15T10:00:00.000Z';
  evidence.availableAt = '2026-08-15T10:30:00.000Z';
  const modelFixture = JSON.parse(readFileSync(resolve(REPO_ROOT, 'tests/fixtures/research-agenda/reversal-ui.json'), 'utf8'));
  const situation = {
    contractVersion: RESEARCH_AGENDA_CONTRACTS.situation,
    generationId: preparation.generationId,
    topicId: selected.topicId,
    authoredAt: preparation.cutoffAt,
    completePass: true,
    evidenceRecords: [evidence],
    sectionInterpretations: definition.analyticalSections.map((section) => ({
      sectionId: section.sectionId,
      status: 'changed',
      interpretation: 'TP-04-17 validates the prepublication artifact boundary.',
      gaps: []
    })),
    findings: [{
      findingId: 'tp-04-17-budget-finding',
      observedAt: evidence.observedAt,
      claim: evidence.claim,
      publicSubjects: [
        { kind: 'channel', value: topic.scopeBoundary.channels[0] },
        { kind: 'public-ticker', value: definition.proxyDefinitions[0].ticker }
      ],
      horizon: 'swing',
      source: { sourceIds: [evidence.source.sourceId] },
      statedConfidence: evidence.confidence,
      provenanceClass: evidence.provenanceClass,
      evidenceRole: evidence.evidenceRole,
      evidenceRefs: [evidence.evidenceId],
      triggerRefs: [definition.triggers[0].triggerId],
      invalidationRefs: [definition.invalidations[0].invalidationId],
      causalPath: evidence.causalPath,
      refutedBy: evidence.refutedBy,
      limitations: ['Artifact boundary fixture.']
    }],
    sourceLedger: [evidence.source],
    newEvidenceIds: [evidence.evidenceId],
    modelInputs: {
      chokepointState: modelFixture.chokepointState,
      inventoryGapByChannel: modelFixture.inventoryGapByChannel,
      levers: modelFixture.levers
    }
  };
  const missingPublicSubjectsSituation = structuredClone(situation);
  delete missingPublicSubjectsSituation.findings[0].publicSubjects;
  const missingPublicSubjectsRefusal = RESEARCH_AGENDA_RUNTIME.validateResearchSituation(missingPublicSubjectsSituation, {
    generationId: preparation.generationId,
    topic,
    definition
  });
  assert.equal(missingPublicSubjectsRefusal.ok, false, 'TP-04-17 missing publicSubjects refuses before the valid fixture proceeds');
  assert.deepEqual(missingPublicSubjectsRefusal.error, {
    code: 'RLAGENDA-CONTRACT-MISSING-MEMBER',
    reason: 'finding-shape-invalid',
    field: 'publicSubjects',
    topicId: selected.topicId
  });
  const validatedSituation = RESEARCH_AGENDA_RUNTIME.validateResearchSituation(situation, {
    generationId: preparation.generationId,
    topic,
    definition
  });
  assert.equal(validatedSituation.ok, true, JSON.stringify(validatedSituation));
  const deterministicOutputs = RESEARCH_AGENDA_RUNTIME.computeResearchAgendaOutputs({
    definition,
    calibration: preparation.calibrationsByTopicId[selected.topicId],
    situation: validatedSituation.value,
    currentBars: preparation.currentBarsByTopicId[selected.topicId],
    generationCutoff: preparation.cutoffAt,
    declaredQuestion: topic.declaredQuestion,
    predecessorOutput: null
  });
  assert.equal(deterministicOutputs.ok, true, JSON.stringify(deterministicOutputs));
  const candidate = RESEARCH_AGENDA_RUNTIME.composeResearchAgendaCandidate({
    registry: preparation.registry,
    plan: preparation.plan,
    definitionsByTopicId: preparation.definitionsByTopicId,
    generationId: preparation.generationId,
    generationCutoff: preparation.cutoffAt,
    situationsByTopicId: { [selected.topicId]: validatedSituation.value },
    failuresByTopicId: Object.fromEntries(preparation.plan.selected.filter((row) => row.topicId !== selected.topicId)
      .map((row) => [row.topicId, 'tp-04-17-unavailable'])),
    deterministicOutputsByTopicId: { [selected.topicId]: deterministicOutputs.value },
    priorDossiersByTopicId: preparation.priorDossiersByTopicId
  });
  assert.equal(candidate.ok, true, JSON.stringify(candidate));
  const pageInputs = { config, snapshot: transactionSnapshot, tools };
  const transactionInputs = {
    candidate: candidate.value,
    payload,
    historyText: '',
    registry: preparation.registry,
    existingRecordsByPath: preparation.existingRecordsByPath,
    pageInputs
  };
  const transaction = RESEARCH_AGENDA_RUNTIME.buildResearchAgendaTransaction(transactionInputs);
  assert.equal(transaction.ok, true, JSON.stringify(transaction));
  assert.equal(transaction.value.artifactBudget.policyId, 'artifact-budget/v1');
  assert.equal(transaction.value.artifactBudget.limitBytes, 262144);
  for (const path of [...transaction.value.immutableOrder, ...transaction.value.mutableOrder]) {
    const record = transaction.value.recordsByPath[path] || null;
    const family = RESEARCH_AGENDA_RUNTIME.feature019ArtifactFamilyForCandidate(path, record);
    assert.ok(family, `transaction path ${path} must map to the closed family owner`);
    assert.ok(transaction.value.artifactBudget.checks.some((check) =>
      check.path === path && check.family === family && check.observedBytes === Buffer.byteLength(
        transaction.value.immutableFiles[path] ?? transaction.value.mutableFiles[path], 'utf8'
      )), `transaction path ${path} must use its real written bytes`);
  }
  for (const [path, family] of [
    ['market-brief.payload.json#researchAgenda', 'research-agenda-read'],
    ['market-brief.payload.json#toolReads.research-agenda-lab', 'tool-read']
  ]) {
    assert.ok(transaction.value.artifactBudget.checks.some((check) =>
      check.path === path && check.family === family && check.serialization === 'canonical'));
  }
  assert.ok(transaction.value.artifactBudget.checks.some((check) => check.family === 'lifecycle'),
    'an empty input ledger produces and checks real lifecycle candidates');

  const refreshCandidateFingerprint = (value) => {
    const body = structuredClone(value);
    delete body.candidateFingerprint;
    value.candidateFingerprint = RLAGENDA.agendaDigest(body);
  };
  const baselineHistoryBytes = readFileSync(resolve(runtimeRoot, 'research/agenda/history.jsonl'), 'utf8');
  const assertNoPromotion = (result, expectedFamily, inputBefore, inputAfter) => {
    let ioCalls = 0;
    if (result.ok) {
      RESEARCH_AGENDA_RUNTIME.promoteResearchAgendaTransaction(result.value, new Proxy({}, {
        get() { ioCalls += 1; return () => false; }
      }));
    }
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'E019-ARTIFACT-BUDGET', JSON.stringify(result));
    assert.equal(result.error.family, expectedFamily);
    assert.equal(result.error.observedBytes > result.error.limitBytes, true);
    assert.equal(ioCalls, 0, `${expectedFamily}: promoter I/O must remain unreachable`);
    assert.equal(inputAfter(), inputBefore, `${expectedFamily}: refusal must not mutate its input`);
    assert.equal(readFileSync(resolve(runtimeRoot, 'research/agenda/history.jsonl'), 'utf8'), baselineHistoryBytes,
      `${expectedFamily}: refusal must not alter prior history`);
  };

  const dossierOverflowCandidate = structuredClone(candidate.value);
  const oversizedDossier = dossierOverflowCandidate.dossiers[0];
  oversizedDossier.findings[0].limitations = ['d'.repeat(262145)];
  const oversizedDossierBody = structuredClone(oversizedDossier);
  delete oversizedDossierBody.dossierId;
  oversizedDossier.dossierId = RLAGENDA.deriveDossierId(oversizedDossierBody).id;
  dossierOverflowCandidate.classifications.find((classification) =>
    classification.topicId === oversizedDossier.topicId).dossierId = oversizedDossier.dossierId;
  const oversizedDossierPath = `research/agenda/dossiers/${oversizedDossier.topicId}/${oversizedDossier.dossierId}.json`;
  const oversizedDossierRef = RLAGENDA.buildArtifactRef(oversizedDossierPath, oversizedDossier).ref;
  const oversizedReview = dossierOverflowCandidate.reviews.find((review) => review.topicId === oversizedDossier.topicId);
  oversizedReview.dossierRef = oversizedDossierRef;
  oversizedReview.modelSnapshotRef.dossierRef = oversizedDossierRef;
  refreshCandidateFingerprint(dossierOverflowCandidate);
  const dossierBefore = JSON.stringify(dossierOverflowCandidate);
  const dossierRefusal = RESEARCH_AGENDA_RUNTIME.buildResearchAgendaTransaction({
    ...transactionInputs,
    candidate: dossierOverflowCandidate
  });
  assertNoPromotion(dossierRefusal, 'dossier', dossierBefore, () => JSON.stringify(dossierOverflowCandidate));

  const historyOverflow = 'h'.repeat(262145);
  const historyRefusal = RESEARCH_AGENDA_RUNTIME.buildResearchAgendaTransaction({
    ...transactionInputs,
    historyText: historyOverflow
  });
  assertNoPromotion(historyRefusal, 'history-ledger', historyOverflow, () => historyOverflow);

  const payloadOverflow = structuredClone(payload);
  payloadOverflow.tp0417Padding = 'p'.repeat(262145);
  const payloadBefore = JSON.stringify(payloadOverflow);
  const payloadRefusal = RESEARCH_AGENDA_RUNTIME.buildResearchAgendaTransaction({
    ...transactionInputs,
    payload: payloadOverflow
  });
  assertNoPromotion(payloadRefusal, 'payload', payloadBefore, () => JSON.stringify(payloadOverflow));

  const pageOverflowInputs = structuredClone(pageInputs);
  pageOverflowInputs.config.track.tp0417Padding = 'g'.repeat(262145);
  const pageBefore = JSON.stringify(pageOverflowInputs);
  const pageRefusal = RESEARCH_AGENDA_RUNTIME.buildResearchAgendaTransaction({
    ...transactionInputs,
    pageInputs: pageOverflowInputs
  });
  assertNoPromotion(pageRefusal, 'page-candidate', pageBefore, () => JSON.stringify(pageOverflowInputs));

  const oversizedRead = structuredClone(transaction.value.payload.researchAgenda);
  oversizedRead.topics[0].reason = 'r'.repeat(262145);
  const readBody = structuredClone(oversizedRead);
  delete readBody.readFingerprint;
  oversizedRead.readFingerprint = RLAGENDA.agendaDigest(readBody);
  const readRefusal = RESEARCH_AGENDA_RUNTIME.validateFeature019CanonicalArtifact({
    policy: policy.value,
    family: 'research-agenda-read',
    path: 'market-brief.payload.json#researchAgenda',
    value: oversizedRead
  });
  assert.equal(readRefusal.ok, false);
  assert.equal(readRefusal.error.family, 'research-agenda-read');
  const toolRead = RLAGENDA.buildAgendaToolRead(transaction.value.payload.researchAgenda, preparation.registry);
  assert.equal(toolRead.ok, true);
  const oversizedToolRead = structuredClone(toolRead.value);
  oversizedToolRead.read = 't'.repeat(262145);
  const toolReadRefusal = RESEARCH_AGENDA_RUNTIME.validateFeature019CanonicalArtifact({
    policy: policy.value,
    family: 'tool-read',
    path: 'market-brief.payload.json#toolReads.research-agenda-lab',
    value: oversizedToolRead
  });
  assert.equal(toolReadRefusal.ok, false);
  assert.equal(toolReadRefusal.error.family, 'tool-read');
  assert.equal(readFileSync(resolve(runtimeRoot, 'research/agenda/history.jsonl'), 'utf8'), baselineHistoryBytes);
});
