/*
 * tests/distributed-briefs.final.e2e.mjs — Feature 002 Scope 08 (SCN-002-025 / SCN-002-027).
 *
 * Scenario-specific persistent E2E regressions for window-aware final aggregation. They drive the full
 * production barrier → compaction → author → validate path (runFinalAuthor) with the production-shaped
 * final author, and assert:
 *  - each scheduled window (pre-market / morning / pre-close / after-hours) authors a complete final whose
 *    window contract uses only cutoff-relevant evidence — pre-market names no prior thesis, morning names
 *    only a same-date earlier-cutoff pre-market thesis, pre-close never names an official close, and
 *    after-hours retains the current date's official regular close separately (SCN-002-025);
 *  - an unsupported unusual observation remains bounded educational context with ZERO action-slot impact,
 *    and promoting it into an action is rejected (SCN-002-027).
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { runFinalAuthor } from '../scripts/brief-refresh.mjs';
import {
  buildResearchAgendaRead,
  buildResearchAgendaTransaction,
  composeResearchAgendaCandidate,
  computeResearchAgendaOutputs,
  validateResearchAgendaRead
} from '../scripts/research-agenda-generation.mjs';
import { singleSourceScenario, windowContext, buildFinalFromInput, makeHash } from './fixtures/feature-002/final/final-fixture-builder.mjs';
import { envelopeFinalAuthorFn } from './fixtures/feature-002/final/final-fixture-builder.mjs';
import {
  createBriefRefreshFixture,
  readPublicationState,
  runBriefRefreshFixture,
  runFixtureValidator
} from './brief-refresh-atomicity.support.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const RLAGENDA = require('../rlagenda.js');

const readAgendaText = (relativePath) => readFileSync(new URL('../' + relativePath, import.meta.url), 'utf8');
const readAgendaJson = (relativePath) => JSON.parse(readAgendaText(relativePath));

test('Regression: SCN-002-025 pre-market morning pre-close and after-hours use only cutoff-relevant owner evidence', async () => {
  const finals = {};
  for (const window of ['pre-market', 'morning', 'pre-close', 'after-hours']) {
    const scenario = singleSourceScenario(window);
    const result = await runFinalAuthor({ ...scenario, authorFn: envelopeFinalAuthorFn('valid') });
    assert.equal(result.ok, true, `${window}: ${result.ok ? '' : JSON.stringify(result.refusal)}`);
    assert.equal(result.final.windowContext.window, window);
    assert.equal(result.final.coverage.length, 3);
    finals[window] = result.final;
  }

  // pre-market: no prior thesis, no official close labeled.
  assert.equal(finals['pre-market'].windowContext.priorWindowThesisRef, null);
  assert.equal(finals['pre-market'].windowContext.officialCloseAnchorRef, null);
  // morning: only a SAME-DATE pre-market thesis at an EARLIER cutoff.
  const morningPrior = finals['morning'].windowContext.priorWindowThesisRef;
  assert.equal(morningPrior.window, 'pre-market');
  assert.equal(morningPrior.tradingDate, finals['morning'].windowContext.tradingDate);
  assert.ok(Date.parse(morningPrior.cutoffAt) < Date.parse(finals['morning'].windowContext.cutoffAt));
  // pre-close: never names an official close before the calendar close.
  assert.equal(finals['pre-close'].windowContext.officialCloseAnchorRef, null);
  // after-hours: retains the current date's official regular close separately.
  assert.ok(finals['after-hours'].windowContext.officialCloseAnchorRef && typeof finals['after-hours'].windowContext.officialCloseAnchorRef.fingerprint === 'string');

  // The window contract REJECTS post-cutoff / mislabeled evidence for every window.
  const base = singleSourceScenario('morning');
  const reject = (window, overrides) => RLCONTRACTS.compactFinalAuthorInput(base.registry, base.reads, base.briefs, base.groups, { ...base.runContext, windowContext: windowContext(window, overrides) }, base.finalBudget);
  assert.equal(reject('morning', { priorWindowThesisRef: null, priorWindowThesisState: null }).error.reason, 'window-prior-thesis-insufficient-undeclared');
  assert.equal(reject('morning', { priorWindowThesisRef: { window: 'pre-market', tradingDate: '2026-07-14', cutoffAt: '2026-07-14T16:00:00.000Z' } }).error.reason, 'window-prior-thesis-cutoff-not-earlier');
  assert.equal(reject('pre-close', { officialCloseAnchorRef: { fingerprint: makeHash('premature-close') } }).error.reason, 'window-official-close-forbidden');
  assert.equal(reject('after-hours', { officialCloseAnchorRef: null }).error.reason, 'window-official-close-required');
  assert.equal(reject('pre-market', { priorWindowThesisRef: { window: 'pre-market', tradingDate: '2026-07-14', cutoffAt: '2026-07-14T10:00:00.000Z' } }).error.reason, 'window-prior-thesis-not-allowed');

  // A morning final whose predecessor thesis is absent but declared insufficient still validates.
  const insufficient = singleSourceScenario('morning', { windowOverrides: { priorWindowThesisRef: null, priorWindowThesisState: 'insufficient' } });
  const insufficientResult = await runFinalAuthor({ ...insufficient, authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(insufficientResult.ok, true, insufficientResult.ok ? '' : JSON.stringify(insufficientResult.refusal));
  assert.equal(insufficientResult.final.windowContext.priorWindowThesisState, 'insufficient');
});

test('Regression: SCN-002-027 unsupported unusual evidence remains educational context with zero action-slot impact', async () => {
  const unusual = { observationRef: 'obs-nvda-unusual', destination: 'context', suppressionReason: 'no-eligible-owner-interpretation', subjects: ['NVDA'] };

  // Baseline WITHOUT the unusual observation.
  const baseline = singleSourceScenario('after-hours');
  const baselineResult = await runFinalAuthor({ ...baseline, authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(baselineResult.ok, true, baselineResult.ok ? '' : JSON.stringify(baselineResult.refusal));

  // WITH the unusual observation: it becomes bounded context; actions and confidence are UNCHANGED.
  const withUnusual = singleSourceScenario('after-hours', { lowNoiseResults: [unusual] });
  const withResult = await runFinalAuthor({ ...withUnusual, authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(withResult.ok, true, withResult.ok ? '' : JSON.stringify(withResult.refusal));
  assert.equal(withResult.final.attention.length, 1);
  assert.equal(withResult.final.attention[0].destination, 'context');
  assert.equal(withResult.final.attention[0].observationRef, 'obs-nvda-unusual');
  // Zero action-slot impact: same action count and same merged confidence as the baseline.
  assert.equal(withResult.final.actions.length, baselineResult.final.actions.length);
  assert.deepEqual(withResult.final.actions.map((action) => action.mergedConfidenceScore), baselineResult.final.actions.map((action) => action.mergedConfidenceScore));
  // The unusual subject never appears in an action.
  assert.equal(withResult.final.actions.some((action) => action.subjects.includes('NVDA')), false);

  // RED regression: promoting the unusual observation into an action slot is rejected by the validator.
  const compact = RLCONTRACTS.compactFinalAuthorInput(withUnusual.registry, withUnusual.reads, withUnusual.briefs, withUnusual.groups, withUnusual.runContext, withUnusual.finalBudget);
  const runInputs = { registry: withUnusual.registry, reads: withUnusual.reads, briefs: withUnusual.briefs, marketSessionEvidenceRef: withUnusual.runContext.marketSessionEvidenceRef, actionThresholds: withUnusual.runContext.actionThresholds };
  const promoted = buildFinalFromInput(compact.value.finalInput, { mode: 'promote-unusual' });
  assert.equal(RLCONTRACTS.validateFinalBrief(promoted, runInputs, withUnusual.groups).error.reason, 'final-attention-consumes-action');
});

test('SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models', () => {
  const originalFetch = globalThis.fetch;
  let networkCalls = 0;
  globalThis.fetch = async () => {
    networkCalls += 1;
    throw new Error('network is forbidden in the offline agenda model E2E');
  };

  try {
    const registry = readAgendaJson('research-agenda.json');
    const definitionsByTopicId = Object.fromEntries(registry.topics.map((topic) => [topic.topicId, readAgendaJson(topic.definitionRef)]));
    const historyText = readAgendaText('research/agenda/history.jsonl');
    const cutoff = '2026-08-13T12:00:00.000Z';
    const plan = RLAGENDA.planGeneration(registry, historyText, { definitionsByTopicId, triggerObservations: [] }, cutoff);
    assert.equal(plan.ok, true, JSON.stringify(plan));
    assert.equal(plan.accountedTopicCount, registry.topics.length);
    assert.equal(plan.selected[0].topicId, 'geopolitical-supply-shock');
    assert.equal(plan.selected[0].reason, 'mode-required');

    const definition = definitionsByTopicId['geopolitical-supply-shock'];
    const calibration = readAgendaJson(definition.calibrationRef);
    const evidence = readAgendaJson('tests/fixtures/research-agenda/valid-evidence-record.json');
    const evidenceWeight = RLAGENDA.computeEvidenceWeight(evidence, definition.evidencePolicy, cutoff);
    assert.equal(evidenceWeight.ok, true);
    assert.ok(evidenceWeight.weight > 0);
    const scenarioModel = RLAGENDA.updateEscalationProbabilities(
      definition.scenarioTree,
      [{ targetId: evidence.modelImpacts[0].targetId, weightedImpact: evidenceWeight.boundedImpact }],
      { maxAbsoluteImpact: definition.evidencePolicy.impactCaps.direct }
    );
    assert.equal(scenarioModel.ok, true);

    const chokepointState = {
      hormuz: {
        physicalPassFraction: { low: 0.35, base: 0.5, high: 0.65 },
        insuredPassFraction: { low: 0.3, base: 0.45, high: 0.6 },
        delayDays: { low: 5, base: 10, high: 18 }
      },
      'bab-el-mandeb': {
        physicalPassFraction: { low: 0.55, base: 0.7, high: 0.85 },
        insuredPassFraction: { low: 0.45, base: 0.6, high: 0.75 },
        delayDays: { low: 4, base: 8, high: 14 }
      },
      'red-sea': {
        physicalPassFraction: { low: 0.65, base: 0.8, high: 0.9 },
        insuredPassFraction: { low: 0.55, base: 0.7, high: 0.85 },
        delayDays: { low: 3, base: 6, high: 12 }
      }
    };
    const scenarioIds = Object.keys(scenarioModel.probabilities);
    const flowByScenario = Object.fromEntries(scenarioIds.map((scenarioId) => [
      scenarioId,
      RLAGENDA.computeFlowState(definition.flowNetwork, chokepointState, scenarioId)
    ]));
    assert.equal(Object.values(flowByScenario).every((flow) => flow.ok), true);

    const barIds = [...new Set([
      ...definition.transmissionModels.map((model) => model.barId),
      ...definition.proxyDefinitions.map((proxy) => proxy.ticker)
    ])];
    const barBytesBefore = Object.fromEntries(barIds.map((barId) => [barId, readAgendaText(`data/bars/${barId}.json`)]));
    const currentBars = Object.fromEntries(barIds.map((barId) => [barId, JSON.parse(barBytesBefore[barId])]));
    const inventoryGapByChannel = Object.fromEntries(definition.transmissionModels.map((model) => [
      model.channelId,
      { low: 0.02, base: 0.06, high: 0.12 }
    ]));
    const commodityModel = RLAGENDA.computeCommodityShockRanges(
      scenarioModel.probabilities,
      { byScenario: flowByScenario, inventoryGapByChannel },
      definition.transmissionModels,
      currentBars,
      { inventoryPolicyResponseOffset: 0, demandOffset: 0 }
    );
    assert.equal(commodityModel.ok, true, JSON.stringify(commodityModel.channels.filter((row) => row.state !== 'available')));
    const channelRanges = Object.fromEntries(commodityModel.channels.map((row) => [row.channelId, row.range]));
    const proxyModel = RLAGENDA.computeEquityProxyRanges(
      channelRanges,
      definition.proxyDefinitions,
      calibration.events,
      currentBars
    );
    assert.equal(proxyModel.ok, true, JSON.stringify(proxyModel.proxies.filter((row) => row.state !== 'available')));

    const reviewId = `review-${'c'.repeat(64)}`;
    const review = {
      reviewId,
      attemptedAt: cutoff,
      modelOutputs: {
        scenarioProbability: scenarioModel.probabilities,
        physicalFlow: flowByScenario,
        channelRanges,
        proxyRanges: Object.fromEntries(proxyModel.proxies.map((row) => [row.proxyId, row.range]))
      },
      annotations: [{ annotationId: 'current-evidence', label: evidence.evidenceRole }]
    };
    const chartModel = RLAGENDA.buildAgendaChartSeries([review], definition.chartDefinitions);
    assert.equal(chartModel.ok, true);
    assert.equal(chartModel.charts.length, definition.chartDefinitions.length);
    assert.equal(chartModel.charts.every((chart) => RLAGENDA.canonicalizeAgenda(chart.series) === RLAGENDA.canonicalizeAgenda(chart.tableRows)), true);

    const rootNodes = definition.scenarioTree.nodes.filter((node) => node.parentId === null);
    const currentDirectionScore = rootNodes.reduce((sum, node) => sum + scenarioModel.probabilities[node.scenarioId].unconditional * node.directionValue, 0);
    const currentOutput = Object.freeze({
      probabilities: Object.fromEntries(rootNodes.map((node) => [node.scenarioId, scenarioModel.probabilities[node.scenarioId].unconditional])),
      evidenceIds: [evidence.evidenceId],
      conflictIds: evidence.conflicts.evidenceIds,
      directionScore: currentDirectionScore,
      dominantScenarioId: rootNodes.slice().sort((left, right) => scenarioModel.probabilities[right.scenarioId].unconditional - scenarioModel.probabilities[left.scenarioId].unconditional)[0].scenarioId,
      declaredQuestion: registry.topics[0].declaredQuestion,
      evidenceCoverage: 1
    });
    const currentBytes = RLAGENDA.canonicalizeAgenda(currentOutput);
    const comparison = RLAGENDA.compareScenarioOutputs(currentOutput, {
      probabilities: { 'staged-reopening': 0.1, 'managed-coercion': 0.1, escalation: 0.8 },
      evidenceIds: ['historical-evidence'],
      conflictIds: [],
      directionScore: 0.8,
      dominantScenarioId: 'escalation',
      declaredQuestion: registry.topics[0].declaredQuestion
    });
    assert.equal(comparison.ok, true);
    assert.equal(RLAGENDA.canonicalizeAgenda(currentOutput), currentBytes, 'comparison cannot mutate or smooth current output');

    const repeatedScenario = RLAGENDA.updateEscalationProbabilities(
      definition.scenarioTree,
      [{ targetId: evidence.modelImpacts[0].targetId, weightedImpact: evidenceWeight.boundedImpact }],
      { maxAbsoluteImpact: definition.evidencePolicy.impactCaps.direct }
    );
    const repeatedCommodity = RLAGENDA.computeCommodityShockRanges(
      repeatedScenario.probabilities,
      { byScenario: flowByScenario, inventoryGapByChannel },
      definition.transmissionModels,
      currentBars,
      { inventoryPolicyResponseOffset: 0, demandOffset: 0 }
    );
    assert.equal(RLAGENDA.canonicalizeAgenda(repeatedScenario), RLAGENDA.canonicalizeAgenda(scenarioModel));
    assert.equal(RLAGENDA.canonicalizeAgenda(repeatedCommodity), RLAGENDA.canonicalizeAgenda(commodityModel));
    assert.equal(networkCalls, 0, 'offline plan and models make no network request');
    for (const barId of barIds) assert.equal(readAgendaText(`data/bars/${barId}.json`), barBytesBefore[barId], `${barId} bytes remain unchanged`);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Regression: current deterministic outputs feed one integrated change assessment after exact model input validation', () => {
  const registry = readAgendaJson('research-agenda.json');
  const topic = registry.topics.find((row) => row.topicId === 'geopolitical-supply-shock');
  const definition = readAgendaJson(topic.definitionRef);
  const calibration = readAgendaJson(definition.calibrationRef);
  const evidence = readAgendaJson('tests/fixtures/research-agenda/valid-evidence-record.json');
  const fixture = readAgendaJson('tests/fixtures/research-agenda/reversal-ui.json');
  const cutoff = '2026-08-13T12:00:00.000Z';
  const barIds = [...new Set([
    ...definition.transmissionModels.map((model) => model.barId),
    ...definition.proxyDefinitions.map((proxy) => proxy.ticker)
  ])];
  const currentBars = Object.fromEntries(barIds.map((barId) => [barId, readAgendaJson(`data/bars/${barId}.json`)]));
  const situation = {
    evidenceRecords: [evidence],
    modelInputs: {
      chokepointState: fixture.chokepointState,
      inventoryGapByChannel: fixture.inventoryGapByChannel,
      levers: fixture.levers
    }
  };
  const run = (predecessorOutput) => computeResearchAgendaOutputs({
    definition,
    calibration,
    situation,
    currentBars,
    generationCutoff: cutoff,
    declaredQuestion: topic.declaredQuestion,
    predecessorOutput
  });
  const currentBytes = (result) => {
    const { changeAssessment, ...current } = result.value;
    return RLAGENDA.canonicalizeAgenda(current);
  };

  const initial = run(null);
  assert.equal(initial.ok, true, JSON.stringify(initial));
  assert.equal(initial.value.publishedInputs.contractVersion, 'research-model-input/v1');
  assert.deepEqual(Object.keys(initial.value.publishedInputs.levers).sort(), [
    'babElMandebPhysicalPassFraction', 'demandOffset', 'hormuzPhysicalPassFraction',
    'inventoryPolicyResponseOffset', 'reroutedShare'
  ]);
  assert.equal(initial.value.changeAssessment.direction, 'insufficient-evidence');
  assert.equal(initial.value.changeAssessment.predecessorAvailable, false);

  const opposite = {
    probabilities: { 'staged-reopening': 0.9, 'managed-coercion': 0.05, escalation: 0.05 },
    evidenceIds: ['historical-opposite-evidence'],
    conflictIds: [],
    directionScore: -1,
    dominantScenarioId: 'staged-reopening',
    declaredQuestionSha256: RLAGENDA.sha256Text(topic.declaredQuestion)
  };
  const compared = run(opposite);
  assert.equal(compared.ok, true, JSON.stringify(compared));
  assert.equal(currentBytes(compared), currentBytes(initial), 'predecessor data cannot change current deterministic output bytes');
  assert.equal(compared.value.changeAssessment.predecessorAvailable, true);
  assert.notEqual(RLAGENDA.canonicalizeAgenda(compared.value.changeAssessment), RLAGENDA.canonicalizeAgenda(initial.value.changeAssessment));
  assert.deepEqual(Object.keys(compared.value.changeAssessment).sort(), [
    'addedEvidenceIds', 'causalExplanation', 'conflictEvidenceIds', 'currentDirectionScore',
    'currentDominantScenarioId', 'direction', 'predecessorAvailable', 'predecessorDirectionScore',
    'predecessorDominantScenarioId', 'probabilityDeltas', 'questionUnchanged', 'removedEvidenceIds'
  ]);
  assert.deepEqual(Object.keys(compared.value.changeAssessment.causalExplanation).sort(), [
    'evidence', 'invalidationIds', 'triggerIds'
  ]);
  assert.deepEqual(Object.keys(compared.value.changeAssessment.causalExplanation.evidence[0]).sort(), [
    'causalPath', 'conflictEvidenceIds', 'evidenceId', 'firedRefuters', 'modelImpacts'
  ]);
  assert.deepEqual(compared.value.changeAssessment.causalExplanation.evidence[0], {
    evidenceId: evidence.evidenceId,
    causalPath: evidence.causalPath,
    modelImpacts: evidence.modelImpacts,
    firedRefuters: [],
    conflictEvidenceIds: []
  });
  assert.deepEqual(compared.value.changeAssessment.causalExplanation.triggerIds, ['insured-capacity-tightens']);
  assert.deepEqual(compared.value.changeAssessment.causalExplanation.invalidationIds, ['insurance-normalizes']);
  assert.equal(compared.value.changeAssessment.currentDirectionScore, initial.value.directionScore);
  assert.equal(compared.value.changeAssessment.predecessorDirectionScore, opposite.directionScore);
  assert.equal(compared.value.changeAssessment.currentDominantScenarioId, initial.value.dominantScenarioId);
  assert.equal(compared.value.changeAssessment.predecessorDominantScenarioId, opposite.dominantScenarioId);
  assert.deepEqual(compared.value.changeAssessment.addedEvidenceIds, [evidence.evidenceId]);
  assert.deepEqual(compared.value.changeAssessment.removedEvidenceIds, ['historical-opposite-evidence']);
  assert.equal(Object.keys(compared.value.changeAssessment.probabilityDeltas).length, 3);

  const extreme = {
    ...opposite,
    probabilities: { 'staged-reopening': 0, 'managed-coercion': 0, escalation: 1 },
    evidenceIds: ['historical-extreme-evidence'],
    directionScore: 1,
    dominantScenarioId: 'escalation'
  };
  const extremeCompared = run(extreme);
  assert.equal(extremeCompared.ok, true, JSON.stringify(extremeCompared));
  assert.equal(currentBytes(extremeCompared), currentBytes(initial), 'extreme predecessor data cannot change current deterministic output bytes');
  assert.equal(extremeCompared.value.changeAssessment.predecessorDirectionScore, extreme.directionScore);
  assert.equal(extremeCompared.value.changeAssessment.predecessorDominantScenarioId, extreme.dominantScenarioId);

  const changedQuestion = run({
    ...opposite,
    declaredQuestionSha256: RLAGENDA.sha256Text('A changed operator question')
  });
  assert.equal(changedQuestion.ok, false, JSON.stringify(changedQuestion));
  assert.equal(changedQuestion.error.code, 'E019-AGENDA-CHANGE-ASSESSMENT');
  assert.equal(changedQuestion.error.reason, 'RLAGENDA-MODEL-INVALID');
  assert.equal('value' in changedQuestion, false, 'question drift refuses before an assessment value is published');
  assert.equal(Object.isFrozen(changedQuestion), true);
});

test('Regression: publication refuses each missing review dossier or compact read member and keeps full state only in the dossier graph', () => {
  const REVIEW_FIELDS = [
    'contractVersion', 'reviewId', 'generationId', 'topicId', 'attemptedAt', 'validationState', 'historicalOnly',
    'mode', 'selectionReason', 'completePass', 'outcome', 'reason', 'newestEvidenceAgeHours', 'changeAssessment',
    'sectionStates', 'evidenceIds', 'modelSnapshotRef', 'chartState', 'triggerStates', 'invalidationStates',
    'dossierRef', 'predecessorDossierRef'
  ];
  const DOSSIER_FIELDS = [
    'contractVersion', 'dossierId', 'topicId', 'generationId', 'reviewId', 'mode', 'selectionReason',
    'historicalOnly', 'validationState', 'observedThrough', 'outcome', 'changeAssessment',
    'declaredQuestionSha256', 'sectionStates', 'findings', 'evidenceRecords', 'sourceLedger', 'modelInputs',
    'modelOutputs', 'chartStates', 'triggerStates', 'invalidationStates', 'predecessorDossierRef', 'supersedesDossierRef'
  ];
  const READ_FIELDS = ['contractVersion', 'generationId', 'asOf', 'topics', 'readFingerprint'];
  const READ_TOPIC_FIELDS = [
    'topicId', 'mode', 'state', 'reason', 'selectionReason', 'reviewId', 'dossierId', 'outcome',
    'changeAssessment', 'newestEvidenceAgeHours', 'modelState', 'chartState',
    'predecessorDossierId', 'supersedesDossierId'
  ];
  const clone = (value) => structuredClone(value);
  const exactKeys = (value, fields) => assert.deepEqual(Object.keys(value).sort(), fields.slice().sort());
  const refreshCandidateFingerprint = (candidate) => {
    const { candidateFingerprint: ignored, ...body } = candidate;
    candidate.candidateFingerprint = RLAGENDA.agendaDigest(body);
  };
  const refreshReadFingerprint = (read) => {
    if (!Object.hasOwn(read, 'readFingerprint')) return;
    const body = clone(read);
    delete body.readFingerprint;
    read.readFingerprint = RLAGENDA.agendaDigest(body);
  };

  const registry = readAgendaJson('research-agenda.json');
  const topic = registry.topics.find((row) => row.topicId === 'geopolitical-supply-shock');
  const definitionsByTopicId = Object.fromEntries(registry.topics.map((row) => [row.topicId, readAgendaJson(row.definitionRef)]));
  const definition = definitionsByTopicId[topic.topicId];
  const calibration = readAgendaJson(definition.calibrationRef);
  const evidence = readAgendaJson('tests/fixtures/research-agenda/valid-evidence-record.json');
  const modelFixture = readAgendaJson('tests/fixtures/research-agenda/reversal-ui.json');
  const generationCutoff = '2026-08-13T12:00:00.000Z';
  const historyText = readAgendaText('research/agenda/history.jsonl');
  const plan = RLAGENDA.planGeneration(registry, historyText, { definitionsByTopicId, triggerObservations: [] }, generationCutoff);
  assert.equal(plan.ok, true, JSON.stringify(plan));
  const generation = RLAGENDA.deriveGenerationId({
    snapshotDigest: 'sha256:' + '9'.repeat(64),
    registryDigest: RLAGENDA.agendaDigest(registry),
    briefWindow: { start: generationCutoff, end: generationCutoff },
    generationCutoff
  });
  assert.equal(generation.ok, true, JSON.stringify(generation));
  const barIds = [...new Set([
    ...definition.transmissionModels.map((model) => model.barId),
    ...definition.proxyDefinitions.map((proxy) => proxy.ticker)
  ])];
  const currentBars = Object.fromEntries(barIds.map((barId) => [barId, readAgendaJson(`data/bars/${barId}.json`)]));
  const situation = {
    contractVersion: 'research-situation/v1',
    generationId: generation.id,
    topicId: topic.topicId,
    authoredAt: generationCutoff,
    completePass: true,
    evidenceRecords: [evidence],
    sectionInterpretations: definition.analyticalSections.map((section) => ({
      sectionId: section.sectionId,
      status: 'changed',
      interpretation: `Validated ${section.sectionId}`,
      gaps: []
    })),
    findings: [],
    sourceLedger: [],
    newEvidenceIds: [evidence.evidenceId],
    modelInputs: {
      chokepointState: modelFixture.chokepointState,
      inventoryGapByChannel: modelFixture.inventoryGapByChannel,
      levers: modelFixture.levers
    }
  };
  const outputs = computeResearchAgendaOutputs({
    definition,
    calibration,
    situation,
    currentBars,
    generationCutoff,
    declaredQuestion: topic.declaredQuestion,
    predecessorOutput: null
  });
  assert.equal(outputs.ok, true, JSON.stringify(outputs));
  const candidate = composeResearchAgendaCandidate({
    registry,
    plan,
    definitionsByTopicId,
    generationId: generation.id,
    generationCutoff,
    situationsByTopicId: { [topic.topicId]: situation },
    deterministicOutputsByTopicId: { [topic.topicId]: outputs.value }
  });
  assert.equal(candidate.ok, true, JSON.stringify(candidate));

  const transactionInputs = {
    payload: readAgendaJson('market-brief.payload.json'),
    historyText,
    registry,
    existingRecordsByPath: {},
    pageInputs: {
      config: readAgendaJson('market-brief.config.json'),
      snapshot: readAgendaJson('market-brief.snapshot.json'),
      tools: readAgendaJson('tools.json')
    }
  };
  const transaction = buildResearchAgendaTransaction({ candidate: candidate.value, ...transactionInputs });
  assert.equal(transaction.ok, true, JSON.stringify(transaction));
  assert.equal(RLAGENDA.validateCurrentPointer(transaction.value.current, transaction.value.recordsByPath).ok, true);

  const review = candidate.value.reviews.find((row) => row.topicId === topic.topicId);
  const dossier = candidate.value.dossiers.find((row) => row.topicId === topic.topicId);
  assert.ok(review && dossier, 'the valid graph contains one active review and its substantive dossier');
  exactKeys(review, REVIEW_FIELDS);
  exactKeys(dossier, DOSSIER_FIELDS);
  assert.equal(RLAGENDA.validateActiveReview(review, transaction.value.recordsByPath).ok, true);
  assert.equal(RLAGENDA.validateActiveDossier(dossier).ok, true);

  const predecessorBody = clone(dossier);
  delete predecessorBody.dossierId;
  predecessorBody.selectionReason = 'adversarial-predecessor-fixture';
  const predecessorIdentity = RLAGENDA.deriveDossierId(predecessorBody);
  assert.equal(predecessorIdentity.ok, true, JSON.stringify(predecessorIdentity));
  const predecessor = { ...predecessorBody, dossierId: predecessorIdentity.id };
  assert.equal(RLAGENDA.validateActiveDossier(predecessor).ok, true);
  const predecessorPath = `research/agenda/dossiers/${predecessor.topicId}/${predecessor.dossierId}.json`;
  const predecessorRef = RLAGENDA.buildArtifactRef(predecessorPath, predecessor);
  assert.equal(predecessorRef.ok, true, JSON.stringify(predecessorRef));
  const linkedReview = { ...clone(review), predecessorDossierRef: predecessorRef.ref };
  const linkedRecords = { ...transaction.value.recordsByPath, [predecessorPath]: predecessor };
  assert.equal(RLAGENDA.validateActiveReview(linkedReview, linkedRecords).ok, true);

  const missingPredecessorRecords = { ...linkedRecords };
  delete missingPredecessorRecords[predecessorPath];
  const missingPredecessor = RLAGENDA.validateActiveReview(linkedReview, missingPredecessorRecords);
  assert.equal(missingPredecessor.ok, false, 'an omitted referenced predecessor must refuse');
  assert.equal(missingPredecessor.code, 'RLAGENDA-CONTRACT-SHAPE');
  assert.equal(missingPredecessor.field, null);

  const tamperedPredecessorBody = clone(predecessor);
  delete tamperedPredecessorBody.dossierId;
  tamperedPredecessorBody.selectionReason = 'tampered-predecessor-fixture';
  const tamperedPredecessorIdentity = RLAGENDA.deriveDossierId(tamperedPredecessorBody);
  assert.equal(tamperedPredecessorIdentity.ok, true, JSON.stringify(tamperedPredecessorIdentity));
  const tamperedPredecessor = { ...tamperedPredecessorBody, dossierId: tamperedPredecessorIdentity.id };
  assert.equal(RLAGENDA.validateActiveDossier(tamperedPredecessor).ok, true);
  const tamperedPredecessorResult = RLAGENDA.validateActiveReview(
    linkedReview,
    { ...linkedRecords, [predecessorPath]: tamperedPredecessor }
  );
  assert.equal(tamperedPredecessorResult.ok, false, 'a tampered referenced predecessor must refuse');
  assert.equal(tamperedPredecessorResult.code, 'RLAGENDA-CURRENT-INVALID');
  assert.equal(tamperedPredecessorResult.field, 'predecessorDossierRef');

  assert.equal(review.changeAssessment, outputs.value.changeAssessment.direction);
  assert.deepEqual(Object.keys(review.modelSnapshotRef).sort(), [
    'chartSeriesSha256', 'dossierRef', 'modelInputsSha256', 'modelOutputsSha256'
  ]);
  const resolvedDossier = transaction.value.recordsByPath[review.modelSnapshotRef.dossierRef.path];
  assert.equal(resolvedDossier.dossierId, dossier.dossierId);
  assert.equal(review.modelSnapshotRef.dossierRef.sha256, RLAGENDA.agendaDigest(resolvedDossier));
  assert.equal(review.modelSnapshotRef.modelInputsSha256, RLAGENDA.agendaDigest(resolvedDossier.modelInputs));
  assert.equal(review.modelSnapshotRef.modelOutputsSha256, RLAGENDA.agendaDigest(resolvedDossier.modelOutputs));
  assert.equal(review.modelSnapshotRef.chartSeriesSha256, RLAGENDA.agendaDigest(resolvedDossier.chartStates));
  assert.ok(resolvedDossier.chartStates.length > 0);
  assert.equal(resolvedDossier.chartStates.length, definition.chartDefinitions.length);
  resolvedDossier.chartStates.forEach((chart) => exactKeys(chart, ['chartId', 'state', 'series', 'annotations']));
  resolvedDossier.triggerStates.forEach((row) => exactKeys(row, ['triggerId', 'state', 'observedAt', 'evidenceRefs']));
  resolvedDossier.invalidationStates.forEach((row) => exactKeys(row, ['invalidationId', 'state', 'observedAt', 'evidenceRefs']));
  assert.deepEqual(resolvedDossier.chartStates.map((row) => row.chartId), definition.chartDefinitions.map((row) => row.chartId));
  assert.deepEqual(resolvedDossier.triggerStates.map((row) => row.triggerId), definition.triggers.map((row) => row.triggerId));
  assert.deepEqual(resolvedDossier.invalidationStates.map((row) => row.invalidationId), definition.invalidations.map((row) => row.invalidationId));
  for (const forbidden of ['modelInputs', 'modelOutputs', 'chartStates', 'evidenceRecords', 'sourceLedger', 'findings']) {
    assert.equal(Object.hasOwn(review, forbidden), false, `review cannot embed dossier field ${forbidden}`);
  }

  for (const field of REVIEW_FIELDS) {
    const changed = clone(candidate.value);
    delete changed.reviews.find((row) => row.topicId === topic.topicId)[field];
    refreshCandidateFingerprint(changed);
    const refused = buildResearchAgendaTransaction({ candidate: changed, ...transactionInputs });
    assert.equal(refused.ok, false, `missing review.${field} must refuse`);
    assert.equal(refused.error.reason, 'review-shape-invalid', `missing review.${field}`);
    assert.equal(refused.error.field, field, `missing review.${field}`);
  }
  {
    const changed = clone(candidate.value);
    changed.reviews.find((row) => row.topicId === topic.topicId).unknownReviewMember = true;
    refreshCandidateFingerprint(changed);
    const refused = buildResearchAgendaTransaction({ candidate: changed, ...transactionInputs });
    assert.equal(refused.ok, false);
    assert.equal(refused.error.reason, 'review-shape-invalid');
    assert.equal(refused.error.field, 'unknownReviewMember');
  }
  for (const field of DOSSIER_FIELDS) {
    const changed = clone(candidate.value);
    delete changed.dossiers.find((row) => row.topicId === topic.topicId)[field];
    refreshCandidateFingerprint(changed);
    const refused = buildResearchAgendaTransaction({ candidate: changed, ...transactionInputs });
    assert.equal(refused.ok, false, `missing dossier.${field} must refuse`);
    assert.equal(refused.error.reason, 'dossier-shape-invalid', `missing dossier.${field}`);
    assert.equal(refused.error.field, field, `missing dossier.${field}`);
  }
  {
    const changed = clone(candidate.value);
    changed.dossiers.find((row) => row.topicId === topic.topicId).unknownDossierMember = true;
    refreshCandidateFingerprint(changed);
    const refused = buildResearchAgendaTransaction({ candidate: changed, ...transactionInputs });
    assert.equal(refused.ok, false);
    assert.equal(refused.error.reason, 'dossier-shape-invalid');
    assert.equal(refused.error.field, 'unknownDossierMember');
  }

  const read = buildResearchAgendaRead(candidate.value);
  assert.equal(read.ok, true, JSON.stringify(read));
  exactKeys(read.value, READ_FIELDS);
  read.value.topics.forEach((row) => exactKeys(row, READ_TOPIC_FIELDS));
  const activeRead = read.value.topics.find((row) => row.topicId === topic.topicId);
  assert.equal(activeRead.mode, 'every-generation');
  assert.equal(activeRead.changeAssessment, outputs.value.changeAssessment.direction);
  assert.equal(activeRead.modelState, 'available');
  assert.equal(activeRead.chartState, 'available');
  const fullStateKeys = new Set(['modelInputs', 'modelOutputs', 'scenarioProbabilities', 'commodityRanges', 'proxyRanges', 'chartStates', 'series', 'annotations', 'triggerStates', 'invalidationStates']);
  const visitRead = (value) => {
    if (Array.isArray(value)) return value.forEach(visitRead);
    if (!value || typeof value !== 'object') return;
    for (const [key, nested] of Object.entries(value)) {
      assert.equal(fullStateKeys.has(key), false, `compact read cannot contain ${key}`);
      visitRead(nested);
    }
  };
  visitRead(read.value);
  for (const field of READ_FIELDS) {
    const changed = clone(read.value);
    delete changed[field];
    refreshReadFingerprint(changed);
    const refused = validateResearchAgendaRead(changed, registry);
    assert.equal(refused.ok, false, `missing read.${field} must refuse`);
    assert.equal(refused.error.field, field, `missing read.${field}`);
  }
  {
    const changed = clone(read.value);
    changed.unknownReadMember = true;
    refreshReadFingerprint(changed);
    const refused = validateResearchAgendaRead(changed, registry);
    assert.equal(refused.ok, false);
    assert.equal(refused.error.field, 'unknownReadMember');
  }
  for (const field of READ_TOPIC_FIELDS) {
    const changed = clone(read.value);
    delete changed.topics[0][field];
    refreshReadFingerprint(changed);
    const refused = validateResearchAgendaRead(changed, registry);
    assert.equal(refused.ok, false, `missing read.topics[0].${field} must refuse`);
    assert.equal(refused.error.field, field, `missing read.topics[0].${field}`);
  }
  {
    const changed = clone(read.value);
    changed.topics[0].unknownTopicMember = true;
    refreshReadFingerprint(changed);
    const refused = validateResearchAgendaRead(changed, registry);
    assert.equal(refused.ok, false);
    assert.equal(refused.error.field, 'unknownTopicMember');
  }

  const publishedRead = transaction.value.payload.researchAgenda;
  const toolRead = transaction.value.payload.toolReads['research-agenda-lab'].metrics.agendaRead;
  const pageRead = JSON.parse(transaction.value.mutableFiles['market-brief.page.json']).researchAgenda;
  assert.deepEqual(publishedRead, read.value);
  assert.deepEqual(toolRead, read.value);
  assert.deepEqual(pageRead, read.value);
  assert.equal(pageRead.topics.find((row) => row.topicId === topic.topicId).mode, 'every-generation');
  assert.equal(pageRead.topics.find((row) => row.topicId === topic.topicId).changeAssessment, outputs.value.changeAssessment.direction);
});

test('SCN-019-004 newly committed topic receives its first current review or named outcome', () => {
  const baseRegistry = readAgendaJson('research-agenda.json');
  const baseDefinition = readAgendaJson('research/agenda/topics/defense-earnings-acceleration.definition.json');
  const topic = {
    ...baseRegistry.topics[0],
    topicId: 'new-public-research-topic',
    title: 'New public research topic',
    declaredQuestion: 'What changed in this newly declared public research topic?',
    reviewPolicy: { mode: 'every-generation', freshnessWindowHours: 24 },
    definitionRef: 'research/agenda/topics/new-public-research-topic.definition.json'
  };
  const definition = {
    ...baseDefinition,
    topicId: topic.topicId,
    declaredQuestionSha256: RLAGENDA.sha256Text(topic.declaredQuestion)
  };
  const registry = { ...baseRegistry, topics: [topic] };
  const cutoff = '2026-08-13T12:00:00.000Z';
  const plan = RLAGENDA.planGeneration(
    registry,
    '',
    { definitionsByTopicId: { [topic.topicId]: definition }, triggerObservations: [] },
    cutoff
  );
  assert.equal(plan.ok, true, JSON.stringify(plan));
  assert.equal(plan.selected.length, 1);
  assert.equal(plan.selected[0].topicId, topic.topicId);
  assert.equal(plan.selected[0].reason, 'mode-required');
  const generation = RLAGENDA.deriveGenerationId({
    snapshotDigest: 'sha256:' + '7'.repeat(64),
    registryDigest: RLAGENDA.agendaDigest(registry),
    briefWindow: { start: cutoff, end: cutoff },
    generationCutoff: cutoff
  });
  const candidate = composeResearchAgendaCandidate({
    registry,
    plan,
    definitionsByTopicId: { [topic.topicId]: definition },
    generationId: generation.id,
    generationCutoff: cutoff,
    failuresByTopicId: { [topic.topicId]: 'research-lane-unavailable' }
  });
  assert.equal(candidate.ok, true, JSON.stringify(candidate));
  assert.equal(candidate.value.classifications.length, 1);
  assert.equal(candidate.value.classifications[0].topicId, topic.topicId);
  assert.equal(candidate.value.classifications[0].state, 'unavailable');
  assert.ok(candidate.value.classifications[0].reviewId);
  assert.equal(candidate.value.reviews[0].outcome, 'unavailable');
  assert.equal(candidate.value.reviews[0].reason, 'research-lane-unavailable');
  assert.deepEqual(candidate.value.reviews[0].evidenceIds, []);
  assert.deepEqual(candidate.value.dossiers, []);
});

test('SCN-019-012 real generation publishes one atomic agenda and brief payload transaction', (context) => {
  const fixture = createBriefRefreshFixture({ narrativeMode: 'success', agendaAssets: true });
  context.after(() => fixture.cleanup());
  const baselineHistory = readFileSync(resolve(fixture.repoRoot, 'research/agenda/history.jsonl'));
  const result = runBriefRefreshFixture(fixture);
  const publication = readPublicationState(fixture);
  const validator = runFixtureValidator(fixture);

  assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.equal(publication.payloadDate, fixture.candidateDate);
  assert.equal(publication.snapshotDate, fixture.candidateDate);
  const current = JSON.parse(readFileSync(resolve(fixture.repoRoot, 'research/agenda/current.json'), 'utf8'));
  assert.equal(publication.payload.researchAgenda.generationId, current.generationRef.generationId);
  assert.equal(publication.payload.researchAgenda.topics.length, 3);
  assert.equal(publication.payload.researchAgenda.topics.find((row) => row.topicId === 'geopolitical-supply-shock').outcome, 'unavailable');
  assert.ok(!readFileSync(resolve(fixture.repoRoot, 'research/agenda/history.jsonl')).equals(baselineHistory));
  assert.ok(publication.lastCommitPaths.includes('research/agenda/current.json'));
  assert.ok(publication.lastCommitPaths.includes('market-brief.payload.json'));
  assert.equal(validator.status, 0, validator.stderr);
});
