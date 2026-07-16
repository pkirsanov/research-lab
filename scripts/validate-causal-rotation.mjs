#!/usr/bin/env node

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const INVALID_FIXTURE_DIR = join(ROOT, 'tests', 'fixtures', 'causal-rotation', 'invalid');
const RECORDED_FIXTURE_DIR = join(ROOT, 'tests', 'fixtures', 'causal-rotation', 'recorded');

runInThisContext(readFileSync(join(ROOT, 'rlcausal.js'), 'utf8'), { filename: join(ROOT, 'rlcausal.js') });
const api = globalThis.RLCausal;

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(ROOT, relativePath), 'utf8'));
}

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function findById(records, id) {
  return records.find((record) => record.id === id);
}

let failures = 0;
let passes = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passes++;
    console.log('  PASS ' + name + (detail ? ' - ' + detail : ''));
  } else {
    failures++;
    console.error('  FAIL ' + name + (detail ? ' - ' + detail : ''));
  }
}

function firstCode(result, expectedCode) {
  return (result?.errors || []).some((entry) => entry.code === expectedCode);
}

function fixtureCode(fixture, config, observationSet) {
  if (fixture.case === 'later-evidence') {
    const hypothesis = findById(observationSet.hypotheses, fixture.hypothesisId);
    const result = api.eligibleEvidence(hypothesis, fixture.evaluateAt, observationSet);
    return result.excluded.find((entry) => entry.observationId === fixture.observationId)?.code || null;
  }

  if (fixture.case === 'stale-valuation') {
    const observation = copy(findById(observationSet.observations, fixture.baseObservationId));
    observation.evidenceClass = fixture.overrideEvidenceClass;
    observation.freshness.expiresAt = fixture.expiresAt;
    const result = api.eligibleEvidence({ observationIds: [observation.id] }, fixture.evaluateAt, { observations: [observation] });
    return result.excluded[0]?.code || null;
  }

  if (fixture.case === 'incomplete-source') {
    const changed = copy(observationSet);
    const observation = findById(changed.observations, fixture.baseObservationId);
    delete observation.source.publisher;
    observation.contentDigest = api.digestRecord(observation);
    const result = api.validateObservationSet(changed, config);
    return result.errors.find((entry) => entry.code === fixture.expectedCode)?.code || null;
  }

  if (fixture.case === 'dependency-cycle') {
    const first = copy(findById(observationSet.observations, fixture.observationIds[0]));
    const second = copy(findById(observationSet.observations, fixture.observationIds[1]));
    first.dependencyIds = [second.id];
    second.dependencyIds = [first.id];
    const result = api.clusterEvidence([first, second]);
    return result.errors.find((entry) => entry.code === fixture.expectedCode)?.code || null;
  }

  if (fixture.case === 'conflicting-identity') {
    const original = copy(findById(observationSet.observations, fixture.baseObservationId));
    const conflicting = copy(original);
    conflicting.assertion = fixture.changedAssertion;
    conflicting.contentDigest = api.digestRecord(conflicting);
    const result = api.mergeSources([original], [conflicting]);
    return result.errors.find((entry) => entry.code === fixture.expectedCode)?.code || null;
  }

  if (fixture.case === 'seasonality-only-action') {
    const changed = copy(observationSet);
    const sourceObservation = copy(changed.observations[0]);
    sourceObservation.id = 'obs:fixture-seasonality-context';
    sourceObservation.assertion = 'Structural seasonality fixture with no asserted return or market outcome.';
    sourceObservation.classification = 'contextual-prior';
    sourceObservation.evidenceClass = 'seasonality';
    sourceObservation.clock = 'fundamental';
    sourceObservation.originKey = 'origin:fixture-seasonality-context';
    sourceObservation.dependencyIds = [];
    sourceObservation.blockingFor = [];
    sourceObservation.contentDigest = api.digestRecord(sourceObservation);
    const hypothesis = copy(findById(changed.hypotheses, 'hyp:ai-infrastructure-demand'));
    hypothesis.id = 'hyp:fixture-seasonality-only';
    hypothesis.observationIds = [sourceObservation.id];
    hypothesis.requiredEvidenceClasses = ['seasonality'];
    hypothesis.unavailableEvidence = [];
    const result = api.evaluateCandidate({
      config,
      observationSet: { ...changed, observations: [sourceObservation] },
      hypothesis,
      exposureId: 'exp:semiconductors',
      timingRead: null,
      posture: 'discovery',
      riskOverlay: 'none',
      asOf: fixture.evaluateAt
    });
    return !result.planEligible && !result.postureEligible && result.integrityCodes?.includes(fixture.expectedCode) ? fixture.expectedCode : null;
  }

  if (fixture.case === 'stale-timing' || fixture.case === 'unknown-timing-version') {
    const hypothesis = findById(observationSet.hypotheses, 'hyp:ai-infrastructure-demand');
    const result = api.evaluateCandidate({
      config,
      observationSet,
      hypothesis,
      exposureId: fixture.timingRead.exposureId,
      timingRead: fixture.timingRead,
      posture: 'confirmation',
      riskOverlay: 'none',
      asOf: fixture.evaluateAt
    });
    return !result.planEligible && result.clocks?.marketConfirmation?.code === fixture.expectedCode ? fixture.expectedCode : null;
  }

  return null;
}

function validateRecordedSources() {
  const review = readJson('tests/fixtures/causal-rotation/recorded/source-review.json');
  check('recorded source review rejects transcript authority', review.transcriptClaimsUsed === false);
  check('recorded source review makes no market-success claim', review.marketEvidenceClaimed === false);
  check('recorded source review contains four independently reviewed primary pages', review.sources.length === 4);
  check('recorded sources use named publishers and stable https citations', review.sources.every((source) => source.publisher && /^https:\/\//.test(source.url)));
}

function validateAntiHindsight(config, observationSet, asOf) {
  const hypothesis = findById(observationSet.hypotheses, 'hyp:ai-infrastructure-demand');
  const initialCandidate = api.evaluateCandidate({ config, observationSet, hypothesis, exposureId: 'exp:semiconductors', timingRead: null, posture: 'discovery', riskOverlay: 'none', asOf });
  const decision = api.freezeDecision(initialCandidate, {
    contractVersion: config.contracts.decisionRecord,
    decisionId: 'dec:validator-anti-hindsight',
    decisionAt: asOf,
    configVersion: config.version,
    evaluatorVersion: config.evaluatorVersion,
    timingRead: null
  });
  const frozenBefore = api.canonicalize(decision);
  const laterObservation = copy(findById(observationSet.observations, 'obs:nvidia-q1-fy27-revenue'));
  laterObservation.id = 'obs:validator-later-fact';
  laterObservation.availableAt = '2026-07-13T00:00:00Z';
  laterObservation.verifiedAt = '2026-07-13T00:00:00Z';
  laterObservation.contentDigest = api.digestRecord(laterObservation);
  const laterSet = copy(observationSet);
  laterSet.observations.push(laterObservation);
  const laterHypothesis = copy(hypothesis);
  laterHypothesis.observationIds.push(laterObservation.id);
  const reevaluated = api.evaluateCandidate({ config, observationSet: laterSet, hypothesis: laterHypothesis, exposureId: 'exp:semiconductors', timingRead: null, posture: 'discovery', riskOverlay: 'none', asOf });
  check('later evidence is excluded with CR-TIME-INELIGIBLE', reevaluated.excludedEvidence.some((entry) => entry.observationId === laterObservation.id && entry.code === 'CR-TIME-INELIGIBLE'));
  check('frozen decision bytes remain unchanged after later evidence', api.canonicalize(decision) === frozenBefore);
  check('frozen decision retains its original candidate digest', decision.candidateDigest === initialCandidate.candidateDigest);
  const outcome = api.evaluateOutcome(decision, {
    contractVersion: config.contracts.ledgerEvent,
    observedAt: '2026-07-13T00:05:00Z',
    invalidationConditionIds: ['cond:ai-guidance-cut'],
    confirmationConditionIds: [],
    sourceObservationIds: [laterObservation.id],
    evaluatorVersion: config.evaluatorVersion
  });
  check('later facts may classify a falsified outcome', outcome.state === 'falsified');
  check('outcome classification still leaves frozen decision bytes unchanged', api.canonicalize(decision) === frozenBefore);
}

function validateClustering(observationSet) {
  const linked = observationSet.observations.filter((observation) => observation.originKey === 'origin:nvidia-q1-fy27-release');
  const result = api.clusterEvidence(linked);
  check('same-release NVIDIA facts and outlook form one evidence cluster', result.ok && result.clusters.length === 1);
  check('one source origin produces one causal reason key', result.clusters[0]?.originKeys.length === 1);
  check('cluster retains every linked observation without counting each independently', result.clusters[0]?.observationIds.length === linked.length);
}

function validateSensitivity(config, observationSet, asOf) {
  const hypothesis = findById(observationSet.hypotheses, 'hyp:ai-infrastructure-demand');
  const staleTiming = readJson('tests/fixtures/causal-rotation/invalid/stale-timing.json').timingRead;
  const candidates = ['discovery', 'balanced', 'confirmation'].map((posture) => api.evaluateCandidate({ config, observationSet, hypothesis, exposureId: 'exp:semiconductors', timingRead: staleTiming, posture, riskOverlay: 'none', asOf }));
  check('every posture preserves unavailable sector valuation', candidates.every((candidate) => candidate.missingRequiredEvidenceClasses.includes('valuation') && candidate.unavailableEvidence.some((entry) => entry.evidenceClass === 'valuation')));
  check('every posture preserves stale owner timing as non-neutral', candidates.every((candidate) => candidate.clocks.marketConfirmation.state === 'stale' && candidate.clocks.marketConfirmation.code === 'CR-TIMING-UNAVAILABLE'));
  check('no posture makes stale timing plan-eligible', candidates.every((candidate) => candidate.planEligible === false));
  const explanation = api.explainSensitivity(candidates[0], 'confirmation', 'discovery', config);
  check('sensitivity explanation names changed market and visibility gates', explanation.ok && explanation.changed.minimumMarketState.from === 'confirming' && explanation.changed.minimumMarketState.to === 'unavailable');
  check('sensitivity explanation preserves all integrity gates', explanation.invariantGates.length === config.sensitivityPolicies.discovery.invariantGates.length);
}

function validateDeterminism(config, observationSet, asOf) {
  const input = { config, observationSet, timingReads: [], posture: 'discovery', riskOverlay: 'none', asOf, generatedAt: asOf };
  const inputBefore = api.canonicalize(input);
  const first = api.evaluateAll(input);
  const second = api.evaluateAll(input);
  check('same inputs produce byte-equivalent normalized snapshots', api.canonicalize(first) === api.canonicalize(second));
  check('evaluator calls do not mutate config observations or input arrays', api.canonicalize(input) === inputBefore);
  check('committed corpus includes cause-emerging and contradicted states', first.candidates.some((candidate) => candidate.stage === 'cause-emerging') && first.candidates.some((candidate) => candidate.stage === 'contradicted'));
  check('committed corpus produces no plan-eligible candidate without owner timing', first.candidates.every((candidate) => candidate.planEligible === false));
  check('compact projection contains no buy or sell instruction', !/\b(buy|sell)\b/i.test(first.toolRead.read));
  return first;
}

function main() {
  console.log('[causal-contract] validating production foundation and committed records');
  check('RLCausal API is frozen', !!api && Object.isFrozen(api));
  check('SHA-256 implementation passes the abc reference vector', api.sha256Hex('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

  const config = readJson('causal-rotation.config.json');
  const observationSet = readJson('causal-rotation-observations.json');
  const ledgerText = readFileSync(join(ROOT, 'causal-rotation-ledger.jsonl'), 'utf8');
  const asOf = '2026-07-12T22:00:00Z';

  const configResult = api.validateConfig(config);
  check('CausalConfig/v1 is valid with no implicit policy defaults', configResult.ok, configResult.errors.map((entry) => entry.path).join(', '));
  const observationResult = api.validateObservationSet(observationSet, config);
  check('committed observation set is source-complete and digest-valid', observationResult.ok, observationResult.errors.map((entry) => entry.code + ':' + entry.path).join(', '));
  check('all observation availability times are conservative', observationSet.observations.every((observation) => Date.parse(observation.availableAt) >= Date.parse(observation.publishedAt) && Date.parse(observation.availableAt) >= Date.parse(observation.verifiedAt)));
  check('unsupported valuation and revision categories remain explicitly unavailable', observationSet.hypotheses.some((hypothesis) => hypothesis.unavailableEvidence?.some((entry) => entry.evidenceClass === 'valuation')) && observationSet.hypotheses.some((hypothesis) => hypothesis.unavailableEvidence?.some((entry) => entry.evidenceClass === 'revision')));

  const ledgerResult = api.parseLedger(ledgerText, config);
  check('initial append-only ledger parses without hidden or malformed events', ledgerResult.ok && ledgerResult.events.length === 0);

  validateRecordedSources();
  validateClustering(observationSet);
  validateSensitivity(config, observationSet, asOf);
  validateAntiHindsight(config, observationSet, asOf);
  const snapshot = validateDeterminism(config, observationSet, asOf);

  console.log('[causal-contract] running rejection-only fixtures');
  const fixtureFiles = readdirSync(INVALID_FIXTURE_DIR).filter((file) => file.endsWith('.json')).sort();
  fixtureFiles.forEach((file) => {
    const fixture = JSON.parse(readFileSync(join(INVALID_FIXTURE_DIR, file), 'utf8'));
    const actualCode = fixtureCode(fixture, config, observationSet);
    check('fixture ' + fixture.case + ' fails closed for ' + fixture.expectedCode, actualCode === fixture.expectedCode, 'actual=' + (actualCode || 'none'));
  });

  check('recorded fixture directory contains only provenance and explicit-unavailable timing', readdirSync(RECORDED_FIXTURE_DIR).sort().join(',') === 'source-review.json,timing-unavailable.json');
  check('snapshot diagnostics remain bounded and structured', snapshot.health.rejectedRecordCount === 0 && api.diagnostics().evaluations > 0);

  console.log('[causal-contract] ------------------------------------------------');
  console.log('[causal-contract] checks passed: ' + passes);
  console.log('[causal-contract] checks failed: ' + failures);
  console.log('[causal-contract] candidates: ' + snapshot.candidates.length);
  console.log('[causal-contract] source observations: ' + observationSet.observations.length);
  console.log('[causal-contract] adversarial fixtures: ' + fixtureFiles.length);
  console.log('[causal-contract] result: ' + (failures ? 'FAIL' : 'PASS'));
  process.exit(failures ? 1 : 0);
}

if (resolve(process.argv[1]) === SCRIPT_PATH) main();
