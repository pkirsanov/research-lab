/*
 * tests/distributed-briefs.authorship.integration.mjs — Feature 002 Scope 06 (SCN-002-004/005).
 *
 * Integration coverage for the production shared author pool: freeze the live 22-source registry into
 * ToolModelRead outcomes, then drive runToolAuthorPool over every source with a production-shaped author
 * transport. The pool must resolve one validated brief outcome per source ID with AT MOST four concurrent
 * author processes (independently counted), one call per source, and zero retries or omissions.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import test from 'node:test';

import { freezeToolReads, runToolAuthorPool } from '../scripts/brief-refresh.mjs';
import {
  composeResearchAgendaCandidate,
  computeResearchAgendaOutputs,
  RESEARCH_AGENDA_CONTRACTS,
  runResearchSidePool,
  runResearchSidePoolAlongsideCritical
} from '../scripts/research-agenda-generation.mjs';
import { profileBudgets, runBudget, authorIdentity, noRecommendationTransport } from './fixtures/feature-002/authorship/brief-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const RLAGENDA = require('../rlagenda.js');

function readRegistry() {
  return JSON.parse(require('node:fs').readFileSync(new URL('../tools.json', import.meta.url), 'utf8'));
}

function registryConfig() {
  return {
    profiles: {
      'live-market': { freshnessPolicy: 'daily-market-bars-v1', recommendationPolicy: 'market-action-v1', budgetPolicy: 'live-market-v1' },
      'static-model': { freshnessPolicy: 'static-model-asof-v1', recommendationPolicy: 'model-conclusion-v1', budgetPolicy: 'static-model-v1' },
      'local-model': { freshnessPolicy: 'committed-projection-v1', recommendationPolicy: 'operational-next-step-v1', budgetPolicy: 'local-model-v1' },
      'off-theme': { freshnessPolicy: 'off-theme-not-applicable-v1', recommendationPolicy: 'domain-next-step-v1', budgetPolicy: 'off-theme-v1' },
      'final-aggregator': { freshnessPolicy: 'final-aggregation-v1', recommendationPolicy: 'final-synthesis-v1', budgetPolicy: 'final-aggregator-v1' }
    }
  };
}

function evidenceBundle() {
  const h = (seed) => `sha256:${createHash('sha256').update(seed).digest('hex')}`;
  return {
    contractVersion: 'market-session-evidence/v1', cutoffAt: '2026-07-14T12:40:00.000Z', fingerprint: h('bundle-int'),
    sessionAggregateRefs: [{ evidenceType: 'session-aggregate', fingerprint: h('agg-int') }],
    volumeBaselineRefs: [{ evidenceType: 'comparable-volume-baseline', fingerprint: h('base-int') }],
    releasedReportRefs: [{ evidenceType: 'released-report-evidence', fingerprint: h('rep-int') }],
    eventReactionRefs: [{ evidenceType: 'event-market-reaction', fingerprint: h('rx-int') }]
  };
}

test('production pool resolves every registry source outcome with at most four active author processes', async () => {
  const registry = readRegistry();
  const expectedSourceCount = registry.tools.filter((tool) => tool?.briefing?.role === 'source').length;
  const config = registryConfig();
  const budgets = profileBudgets();
  const frozen = freezeToolReads(registry, { evidence: evidenceBundle(), registryConfig: config }, { symbol: 'SPY' });
  assert.equal(frozen.sourceCount, expectedSourceCount);
  assert.equal(Object.keys(frozen.reads).length, expectedSourceCount);

  const reads = frozen.orderedSourceToolIds.map((toolId) => {
    const read = frozen.reads[toolId];
    return { toolId, read, profile: read.profile, profileBudget: budgets[read.profile] };
  });

  // Independently observe live author concurrency; a small delay lets the four-worker pool overlap.
  let active = 0;
  let observedPeak = 0;
  const rawTransport = noRecommendationTransport();
  const authorFn = async (request) => {
    active += 1;
    observedPeak = Math.max(observedPeak, active);
    await new Promise((resolve) => setTimeout(resolve, 6));
    const raw = await rawTransport(JSON.stringify(request));
    active -= 1;
    return { ok: true, envelope: JSON.parse(raw) };
  };

  const pool = await runToolAuthorPool({
    reads,
    identity: authorIdentity(),
    runBudget: runBudget(expectedSourceCount),
    workers: 4,
    maxRetries: 2,
    authorFn
  });

  assert.equal(pool.ok, true, pool.ok ? '' : JSON.stringify(pool.refusal));
  // Exactly one validated outcome per source ID — no omission and no invented participant.
  assert.deepEqual(Object.keys(pool.outcomes).sort(), frozen.orderedSourceToolIds.slice().sort());
  assert.equal(Object.keys(pool.outcomes).length, expectedSourceCount);
  for (const toolId of frozen.orderedSourceToolIds) {
    const outcome = pool.outcomes[toolId];
    assert.equal(outcome.outcome, 'newly-authored');
    assert.equal(outcome.attempts, 1);
    // Each returned brief independently re-validates through the pure ToolBrief validator against its read.
    assert.equal(RLCONTRACTS.validateToolBrief(outcome.brief, frozen.reads[toolId], frozen.reads[toolId].profile).ok, true);
  }

  // Concurrency never exceeds four (independent observation AND pool telemetry), and it genuinely overlaps.
  assert.ok(observedPeak <= 4, `observed peak concurrency ${observedPeak} must not exceed 4`);
  assert.ok(observedPeak >= 2, `observed peak concurrency ${observedPeak} must show real overlap`);
  assert.ok(pool.telemetry.peakConcurrency <= 4);
  assert.equal(pool.telemetry.calls, expectedSourceCount);
  assert.equal(pool.telemetry.retries, 0);
});

function agendaFixture() {
  const fs = require('node:fs');
  const registry = JSON.parse(fs.readFileSync(new URL('../research-agenda.json', import.meta.url), 'utf8'));
  const topic = registry.topics[0];
  const definition = JSON.parse(fs.readFileSync(new URL('../' + topic.definitionRef, import.meta.url), 'utf8'));
  const evidence = JSON.parse(fs.readFileSync(new URL('./fixtures/research-agenda/valid-evidence-record.json', import.meta.url), 'utf8'));
  const modelFixture = JSON.parse(fs.readFileSync(new URL('./fixtures/research-agenda/reversal-ui.json', import.meta.url), 'utf8'));
  const calibration = JSON.parse(fs.readFileSync(new URL('../' + definition.calibrationRef, import.meta.url), 'utf8'));
  const barIds = [...new Set([
    ...definition.transmissionModels.map((model) => model.barId),
    ...definition.proxyDefinitions.map((proxy) => proxy.ticker)
  ])];
  const currentBars = Object.fromEntries(barIds.map((barId) => [
    barId,
    JSON.parse(fs.readFileSync(new URL(`../data/bars/${barId}.json`, import.meta.url), 'utf8'))
  ]));
  const generationId = `generation-${'e'.repeat(64)}`;
  const plan = {
    ok: true,
    refusals: [],
    selected: [{ topicId: topic.topicId, mode: topic.reviewPolicy.mode, reason: 'mode-required', sectionIds: definition.analyticalSections.map((section) => section.sectionId) }],
    classifications: [{ topicId: topic.topicId, lifecycleState: 'active', mode: topic.reviewPolicy.mode, status: 'selected', reason: 'mode-required' }]
  };
  const policy = RLAGENDA.resolveAgendaPolicy(registry.reviewPolicy);
  return {
    registry: { ...registry, topics: [topic] }, topic, definition, evidence, modelFixture, calibration,
    currentBars, generationId, plan, policy: policy.value, policyDigest: policy.digest
  };
}

function quietSituation(fixture) {
  return {
    contractVersion: RESEARCH_AGENDA_CONTRACTS.situation,
    generationId: fixture.generationId,
    topicId: fixture.topic.topicId,
    authoredAt: '2026-08-13T12:00:00.000Z',
    completePass: true,
    evidenceRecords: [],
    sectionInterpretations: fixture.definition.analyticalSections.map((section) => ({
      sectionId: section.sectionId,
      status: 'unchanged',
      interpretation: 'No new evidence changed this section.',
      gaps: []
    })),
    findings: [],
    sourceLedger: [],
    newEvidenceIds: [],
    modelInputs: { chokepointState: {}, inventoryGapByChannel: {}, levers: {} }
  };
}

function producePriorDossier(fixture) {
  const generationId = `generation-${'d'.repeat(64)}`;
  const generationCutoff = '2026-08-13T12:00:00.000Z';
  const situation = {
    contractVersion: RESEARCH_AGENDA_CONTRACTS.situation,
    generationId,
    topicId: fixture.topic.topicId,
    authoredAt: generationCutoff,
    completePass: true,
    evidenceRecords: [fixture.evidence],
    sectionInterpretations: fixture.definition.analyticalSections.map((section) => ({
      sectionId: section.sectionId,
      status: 'changed',
      interpretation: 'Current evidence changed this section.',
      gaps: []
    })),
    findings: [],
    sourceLedger: [fixture.evidence.source],
    newEvidenceIds: [fixture.evidence.evidenceId],
    modelInputs: {
      chokepointState: fixture.modelFixture.chokepointState,
      inventoryGapByChannel: fixture.modelFixture.inventoryGapByChannel,
      levers: fixture.modelFixture.levers
    }
  };
  const outputs = computeResearchAgendaOutputs({
    definition: fixture.definition,
    calibration: fixture.calibration,
    situation,
    currentBars: fixture.currentBars,
    generationCutoff,
    declaredQuestion: fixture.topic.declaredQuestion,
    predecessorOutput: null
  });
  assert.equal(outputs.ok, true, JSON.stringify(outputs));
  const candidate = composeResearchAgendaCandidate({
    registry: fixture.registry,
    plan: fixture.plan,
    definitionsByTopicId: { [fixture.topic.topicId]: fixture.definition },
    generationId,
    generationCutoff,
    situationsByTopicId: { [fixture.topic.topicId]: situation },
    deterministicOutputsByTopicId: { [fixture.topic.topicId]: outputs.value }
  });
  assert.equal(candidate.ok, true, JSON.stringify(candidate));
  assert.equal(candidate.value.dossiers.length, 1, 'substantive pass must produce one prior dossier');
  return candidate.value.dossiers[0];
}

test('SCN-019-013 quiet complete pass writes an unchanged review and reuses the substantive dossier', async () => {
  const fixture = agendaFixture();
  const pool = await runResearchSidePool({
    topics: [{ topic: fixture.topic, definition: fixture.definition, acquisition: null, committedEvidence: [] }],
    generationId: fixture.generationId,
    policy: fixture.policy,
    policyDigest: fixture.policyDigest,
    authorFn: async () => quietSituation(fixture)
  });
  assert.equal(pool.ok, true);
  assert.equal(pool.value.telemetry.calls, 1);
  assert.equal(pool.value.telemetry.attempts, 1);
  assert.equal(pool.value.telemetry.peakConcurrency, 1);

  const prior = producePriorDossier(fixture);
  const priorValidation = RLAGENDA.validateActiveDossier(prior, fixture.definition);
  assert.equal(priorValidation.ok, true, JSON.stringify(priorValidation));
  for (const member of Object.keys(prior)) {
    const incompletePrior = structuredClone(prior);
    delete incompletePrior[member];
    const incompleteValidation = RLAGENDA.validateActiveDossier(incompletePrior, fixture.definition);
    assert.equal(incompleteValidation.ok, false, `${member} must remain required by the active dossier contract`);
    assert.equal(incompleteValidation.code, 'RLAGENDA-CONTRACT-MISSING-MEMBER');
    assert.equal(incompleteValidation.field, member);
  }
  const priorPath = `research/agenda/dossiers/${prior.topicId}/${prior.dossierId}.json`;
  const priorRef = RLAGENDA.buildArtifactRef(priorPath, prior);
  assert.equal(priorRef.ok, true, JSON.stringify(priorRef));
  const candidate = composeResearchAgendaCandidate({
    registry: fixture.registry,
    plan: fixture.plan,
    definitionsByTopicId: { [fixture.topic.topicId]: fixture.definition },
    generationId: fixture.generationId,
    generationCutoff: '2026-08-13T12:00:00.000Z',
    situationsByTopicId: pool.value.situationsByTopicId,
    failuresByTopicId: pool.value.failuresByTopicId,
    priorDossiersByTopicId: { [fixture.topic.topicId]: prior }
  });
  assert.equal(candidate.ok, true, JSON.stringify(candidate));
  const review = candidate.value.reviews[0];
  assert.equal(review.outcome, 'unchanged');
  assert.notEqual(review.reviewId, prior.reviewId, 'quiet pass must write a new immutable review');
  assert.equal(candidate.value.classifications[0].dossierId, prior.dossierId);
  assert.deepEqual(review.dossierRef, priorRef.ref);
  assert.deepEqual(review.predecessorDossierRef, priorRef.ref);
  assert.deepEqual(review.modelSnapshotRef.dossierRef, priorRef.ref);
  assert.equal(review.dossierRef.sha256, RLAGENDA.agendaDigest(prior));
  assert.equal(review.modelSnapshotRef.modelInputsSha256, RLAGENDA.agendaDigest(prior.modelInputs));
  assert.equal(review.modelSnapshotRef.modelOutputsSha256, RLAGENDA.agendaDigest(prior.modelOutputs));
  assert.equal(review.modelSnapshotRef.chartSeriesSha256, RLAGENDA.agendaDigest(prior.chartStates));
  const reviewValidation = RLAGENDA.validateActiveReview(review, { [priorRef.ref.path]: prior });
  assert.equal(reviewValidation.ok, true, JSON.stringify(reviewValidation));
  assert.equal(candidate.value.dossiers.length, 0, 'quiet pass must not invent a dossier');
  assert.deepEqual(pool.value.situationsByTopicId[fixture.topic.topicId].findings, []);
  assert.deepEqual(review.evidenceIds, []);
  assert.deepEqual(review.sectionStates, pool.value.situationsByTopicId[fixture.topic.topicId].sectionInterpretations);
  assert.equal(review.sectionStates.every((section) => section.status === 'unchanged'), true);
});

test('SCN-019-015 failed research lane publishes named unavailable without a partial finding', async () => {
  const fixture = agendaFixture();
  const pool = await runResearchSidePool({
    topics: [{ topic: fixture.topic, definition: fixture.definition, acquisition: null, committedEvidence: [] }],
    generationId: fixture.generationId,
    policy: fixture.policy,
    policyDigest: fixture.policyDigest,
    authorFn: async () => ({ malformed: true })
  });
  assert.equal(pool.ok, true);
  assert.equal(pool.value.failuresByTopicId[fixture.topic.topicId], 'situation-shape-invalid');
  const candidate = composeResearchAgendaCandidate({
    registry: fixture.registry,
    plan: fixture.plan,
    definitionsByTopicId: { [fixture.topic.topicId]: fixture.definition },
    generationId: fixture.generationId,
    generationCutoff: '2026-08-13T12:00:00.000Z',
    situationsByTopicId: pool.value.situationsByTopicId,
    failuresByTopicId: pool.value.failuresByTopicId
  });
  assert.equal(candidate.ok, true);
  assert.equal(candidate.value.reviews[0].outcome, 'unavailable');
  assert.equal(candidate.value.reviews[0].reason, 'situation-shape-invalid');
  assert.deepEqual(candidate.value.reviews[0].evidenceIds, []);
  assert.deepEqual(candidate.value.dossiers, []);
});

test('Regression: research lane timeout leaves every critical lane output byte-identical', async () => {
  const fixture = agendaFixture();
  const criticalBaseline = {
    core: { nextSession: 'unchanged-core' },
    signals: { attention: ['unchanged-signals'] },
    groups: { groups: ['unchanged-groups'] },
    coverage: { toolCoverage: ['unchanged-coverage'] }
  };
  const baselineBytes = JSON.stringify(criticalBaseline);
  const timeout = Object.assign(new Error('timed out'), { code: 'ETIMEDOUT' });
  const coordinated = await runResearchSidePoolAlongsideCritical({
    criticalRun: async () => JSON.parse(baselineBytes),
    researchRequest: {
      topics: [{ topic: fixture.topic, definition: fixture.definition, acquisition: null, committedEvidence: [] }],
      generationId: fixture.generationId,
      policy: fixture.policy,
      policyDigest: fixture.policyDigest,
      authorFn: async () => new Promise(() => {}),
      timer: { withTimeout: async () => { throw timeout; } }
    }
  });
  assert.equal(coordinated.ok, true);
  assert.equal(JSON.stringify(coordinated.value.criticalResults), baselineBytes);
  assert.equal(coordinated.value.researchResult.ok, true);
  assert.equal(coordinated.value.researchResult.value.failuresByTopicId[fixture.topic.topicId], 'author-timeout');
  assert.equal(coordinated.value.researchResult.value.telemetry.timeoutSeconds, 900);
  assert.equal(coordinated.value.researchResult.value.telemetry.attempts, 1);
});
