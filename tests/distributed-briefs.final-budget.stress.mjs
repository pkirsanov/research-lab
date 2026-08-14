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
import { createRequire } from 'node:module';
import test from 'node:test';

import { singleSourceScenario, conflictScenario, mergedScenario } from './fixtures/feature-002/final/final-fixture-builder.mjs';
import {
  RESEARCH_AGENDA_CONTRACTS,
  resolveResearchAgendaPolicy,
  runResearchSidePool,
  validateResearchAgendaAcquisitionUsage
} from '../scripts/research-agenda-generation.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

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
  const authorPolicy = { timeoutSeconds: 900, attempts: 1, concurrency: 1, maxInputBytes: 524288, maxOutputBytes: 524288 };
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
  const pool = await runResearchSidePool({ topics: selectedTopics, generationId, policy: authorPolicy, authorFn });
  assert.equal(pool.ok, true);
  assert.equal(pool.value.telemetry.calls, 2);
  assert.equal(pool.value.telemetry.attempts, 2, 'one attempt per selected topic');
  assert.equal(pool.value.telemetry.peakConcurrency, 1);
  assert.equal(peak, 1, 'independent observation confirms serial authoring');
  assert.equal(pool.value.telemetry.timeoutSeconds, 900);

  const inputRefusal = await runResearchSidePool({
    topics: selectedTopics.slice(0, 1),
    generationId,
    policy: { ...authorPolicy, maxInputBytes: 1 },
    authorFn
  });
  assert.equal(inputRefusal.ok, true);
  assert.equal(inputRefusal.value.failuresByTopicId[selectedTopics[0].topic.topicId], 'author-input-over-budget');
  assert.equal(inputRefusal.value.telemetry.calls, 0);

  const outputRefusal = await runResearchSidePool({
    topics: selectedTopics.slice(0, 1),
    generationId,
    policy: { ...authorPolicy, maxOutputBytes: 1 },
    authorFn
  });
  assert.equal(outputRefusal.ok, true);
  assert.equal(outputRefusal.value.failuresByTopicId[selectedTopics[0].topic.topicId], 'author-output-over-budget');

  const timeout = Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' });
  const timeoutRefusal = await runResearchSidePool({
    topics: selectedTopics.slice(0, 1),
    generationId,
    policy: authorPolicy,
    authorFn: async () => new Promise(() => {}),
    timer: { withTimeout: async (_promise, milliseconds) => { assert.equal(milliseconds, 900000); throw timeout; } }
  });
  assert.equal(timeoutRefusal.ok, true);
  assert.equal(timeoutRefusal.value.failuresByTopicId[selectedTopics[0].topic.topicId], 'author-timeout');
});
