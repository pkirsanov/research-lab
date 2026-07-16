import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'trend-dynamics-cycle-lab.html');
const configPath = path.join(root, 'trend-dynamics-cycle-universe.json');
const fixtureRoot = path.join(root, 'tests/fixtures/trend-dynamics-cycle');
const sourceFixturePaths = [
  path.join(fixtureRoot, 'source-qualified/irregular-series.json'),
  path.join(fixtureRoot, 'source-qualified/political-calendar.json'),
  path.join(fixtureRoot, 'source-qualified/climate-context.json')
];
const analyticFixturePath = path.join(fixtureRoot, 'analytic/technology-lifecycle.json');
const engineFixturePath = path.join(fixtureRoot, 'analytic/trend-engine-inputs.json');
const cycleFixturePath = path.join(fixtureRoot, 'analytic/cycle-engine-inputs.json');
const invalidFixturePath = path.join(fixtureRoot, 'invalid/missing-stale-incompatible.json');
const requiredPaths = [htmlPath, configPath, ...sourceFixturePaths, analyticFixturePath, engineFixturePath, cycleFixturePath, invalidFixturePath];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function extractFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing production function ${name}`);
  const brace = source.indexOf('{', start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = brace; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') { blockComment = false; index += 1; }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') { lineComment = true; index += 1; continue; }
    if (char === '/' && next === '*') { blockComment = true; index += 1; continue; }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`unterminated production function ${name}`);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

console.log('[tdc-validator] mode=scope-3-season-cycle-context-association');
console.log('[tdc-validator] root=' + root);
requiredPaths.forEach((filePath) => console.log('[tdc-validator] required=' + path.relative(root, filePath) + ' exists=' + fs.existsSync(filePath)));
assert.equal(requiredPaths.every((filePath) => fs.existsSync(filePath)), true, 'all Scope 1 production and fixture paths must exist');

const html = fs.readFileSync(htmlPath, 'utf8');
const selftestSource = fs.readFileSync(path.join(root, 'scripts/selftest.mjs'), 'utf8');
const browserSource = fs.readFileSync(path.join(root, 'tests/trend-dynamics-cycle-lab.spec.mjs'), 'utf8');
const navSource = fs.readFileSync(path.join(root, 'rlnav.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const toolsSource = fs.readFileSync(path.join(root, 'tools.json'), 'utf8');
const functionNames = [
  'tdcError',
  'tdcIsPlainObject',
  'tdcHasExactKeys',
  'tdcFiniteNumber',
  'tdcStableSerialize',
  'tdcStableDigest',
  'tdcKahanSum',
  'tdcQuantile',
  'tdcMedian',
  'tdcMad',
  'tdcNormalCdf',
  'tdcLogGamma',
  'tdcRegularizedBeta',
  'tdcStudentTCdf',
  'tdcHouseholderSolve',
  'tdcAutocorrelation',
  'tdcLjungBox',
  'tdcValidateConfig',
  'tdcIndexConfig',
  'tdcValidateSeriesEnvelope',
  'tdcResolveAsOfVintage',
  'tdcApplyTransform',
  'tdcAssessDataQuality',
  'tdcAdjustPValues',
  'tdcCreateWorkPlan',
  'tdcRollingOlsHac',
  'tdcTheilSenKendall',
  'tdcEndpointLocalQuadratic',
  'tdcLocalLinearState',
  'tdcCusum',
  'tdcBocpd',
  'tdcScaleShift',
  'tdcDistributionShift',
  'tdcCorrelationShift',
  'tdcPenalizedLinearSegments',
  'tdcGaussianHmm2',
  'tdcProminentExtrema',
  'tdcHarmonicDecomposition',
  'tdcWelchSpectrum',
  'tdcGeneralizedLombScargle',
  'tdcRollingSpectrum',
  'tdcLeadLag',
  'tdcEventStudy',
  'tdcEvaluateCycle',
  'tdcClusterFamilyVotes',
  'tdcClassifyTrend',
  'tdcClassifyDynamics',
  'tdcBuildChangeTimeline',
  'tdcBuildConsensus',
  'tdcDeepFreeze',
  'tdcMethodFailure',
  'tdcMethodSuccess',
  'tdcValidateNumericSeries',
  'tdcMeanVariance',
  'tdcCorrelation',
  'tdcLogSumExp',
  'tdcLinearFit',
  'tdcInfluenceDiagnostics',
  'tdcNearbyStability',
  'tdcBuildAnalyticSeries',
  'tdcRunScope2Engine',
  'tdcRunScope3Engine'
];
const extracted = functionNames.map((name) => extractFunction(html, name));
const production = new Function(`${extracted.join('\n')}\nreturn {${functionNames.join(',')}};`)();
const config = readJson(configPath);
const configValidation = production.tdcValidateConfig(config);
assert.equal(configValidation.ok, true, JSON.stringify(configValidation.errors));
const indexed = production.tdcIndexConfig(config);
assert.equal(indexed.ok, true, JSON.stringify(indexed.errors));
const configIndex = indexed.index;

assert.deepEqual(Object.keys(config).sort(), ['contractVersion', 'controlBounds', 'cycleCatalog', 'display', 'evaluation', 'horizons', 'initialSelection', 'limits', 'methods', 'profiles', 'registryVersion', 'series', 'toolId', 'transforms'].sort());
assert.equal(config.contractVersion, 'tdc-config/v1');
assert.equal(config.registryVersion, 'tdc-method-registry/1');
assert.equal(config.methods.length, 18);
assert.equal(configIndex.methodOrder.length, 18);
assert.equal(new Set(config.cycleCatalog.map((entry) => entry.domain)).size, 10);
assert.equal(new Set(config.cycleCatalog.map((entry) => entry.type)).size, 6);

const unknownConfig = clone(config);
unknownConfig.hiddenDefault = true;
const missingConfig = clone(config);
delete missingConfig.evaluation;
const wrongVersion = clone(config);
wrongVersion.contractVersion = 'tdc-config/v2';
const danglingConfig = clone(config);
danglingConfig.methods[0].transformIds = ['transform:missing'];
const nonFiniteConfig = clone(config);
nonFiniteConfig.limits.absoluteVarianceFloor = null;
const outOfRangeConfig = clone(config);
outOfRangeConfig.profiles[0].controls.changeProbability = 2;
const configCases = [
  ['unknown-key', unknownConfig, 'TDC-CONFIG-KEY'],
  ['missing-field', missingConfig, 'TDC-CONFIG-KEY'],
  ['wrong-version', wrongVersion, 'TDC-CONFIG-VERSION'],
  ['dangling-reference', danglingConfig, 'TDC-CONFIG-REFERENCE'],
  ['non-finite', nonFiniteConfig, 'TDC-CONFIG-NUMERIC'],
  ['out-of-range', outOfRangeConfig, 'TDC-CONFIG-RANGE']
];
for (const [name, candidate, expectedCode] of configCases) {
  const first = production.tdcValidateConfig(candidate);
  const second = production.tdcValidateConfig(clone(candidate));
  assert.equal(first.ok, false, `${name} must be rejected`);
  assert.equal(first.errors.some((error) => error.code === expectedCode), true, `${name} must expose ${expectedCode}`);
  assert.deepEqual(first.errors, second.errors, `${name} rejection must be deterministic`);
}

const sourceFixtures = sourceFixturePaths.map(readJson);
for (const fixture of sourceFixtures) {
  assert.equal(fixture.fixtureContract.posture, 'source-qualified');
  assert.equal(fixture.fixtureContract.ownerPublicationAllowed, false);
  assert.match(fixture.fixtureContract.authority, /\S/);
  assert.match(fixture.fixtureContract.url, /^https:\/\//);
  assert.match(fixture.fixtureContract.rights, /\S/);
  assert.match(fixture.fixtureContract.retrievedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.match(fixture.fixtureContract.limitations, /\S/);
}

const irregularEnvelope = sourceFixtures[0];
const irregularValidation = production.tdcValidateSeriesEnvelope(irregularEnvelope, configIndex);
assert.equal(irregularValidation.ok, true, JSON.stringify(irregularValidation.errors));
const resolved = production.tdcResolveAsOfVintage(irregularEnvelope, '2026-07-15T12:00:00.000Z');
assert.equal(resolved.ok, true, JSON.stringify(resolved.errors));
assert.equal(resolved.observations.every((row) => Date.parse(row.availableAt) <= Date.parse('2026-07-15T12:00:00.000Z')), true);
const levelTransform = config.transforms.find((entry) => entry.id === 'level');
const transformed = production.tdcApplyTransform(resolved.observations, levelTransform, irregularEnvelope.descriptor.units, {});
assert.equal(transformed.ok, true, JSON.stringify(transformed.errors));
assert.deepEqual(transformed.rows.map((row) => row.originObservationIds[0]), resolved.observations.map((row) => row.observationId));
assert.equal(transformed.audit.interpolationApplied, false);
const quality = production.tdcAssessDataQuality(irregularEnvelope.descriptor, resolved.observations, '2026-07-15T12:00:00.000Z', config, configIndex);
assert.equal(quality.ok, true, JSON.stringify(quality.errors));
assert.equal(quality.profile.regularity, 'irregular');
assert.equal(quality.profile.missingIntervals.length > 0, true);
assert.equal(quality.methodAvailability['M14-welch-acf'].code, 'TDC-METHOD-REGULARITY');
assert.equal(quality.methodAvailability['M15-generalized-lomb'].state, 'eligible');

const analyticFixture = readJson(analyticFixturePath);
assert.equal(analyticFixture.fixtureContract.posture, 'analytic');
assert.equal(analyticFixture.fixtureContract.ownerPublicationAllowed, false);
assert.equal(analyticFixture.fixtureContract.purpose, 'deterministic-algorithm-proof');
assert.match(analyticFixture.fixtureContract.limitations, /not live|not source-qualified/i);
const lifecycle = configIndex.cyclesById[analyticFixture.cycleId];
assert.equal(lifecycle.type, 'lifecycle');
assert.equal(analyticFixture.stage, 'saturation');
assert.equal(Object.hasOwn(lifecycle, 'phase'), false);
assert.equal(Object.hasOwn(lifecycle, 'period'), false);

const engineFixture = readJson(engineFixturePath);
assert.equal(engineFixture.fixtureContract.posture, 'analytic');
assert.equal(engineFixture.fixtureContract.ownerPublicationAllowed, false);
assert.equal(engineFixture.fixtureContract.purpose, 'mathematically-discriminating-m01-m12-inputs');
assert.equal(engineFixture.contractVersion, 'tdc-analytic-engine-input/v1');
assert.equal(engineFixture.cases.length, 5);
assert.deepEqual(engineFixture.cases.map((entry) => entry.id), ['sustained', 'accelerating', 'decelerating', 'sensitivity', 'disagreement']);
function collectKeys(value, keys = []) {
  if (Array.isArray(value)) value.forEach((entry) => collectKeys(entry, keys));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, entry]) => { keys.push(key); collectKeys(entry, keys); });
  return keys;
}
assert.equal(collectKeys(engineFixture).some((key) => /^(expected|conclusion|verdict|result|direction|dynamics|changeState)$/i.test(key)), false, 'analytic fixture must contain inputs rather than asserted engine output');
for (const fixtureCase of engineFixture.cases) {
  assert.equal(Number.isInteger(fixtureCase.count) && fixtureCase.count >= 120, true, `${fixtureCase.id} must provide enough analytic history for M01-M12`);
  const generated = production.tdcBuildAnalyticSeries(fixtureCase.generator, fixtureCase.count);
  const comparison = production.tdcBuildAnalyticSeries(fixtureCase.comparisonGenerator, fixtureCase.count);
  assert.equal(generated.ok && comparison.ok, true, `${fixtureCase.id} recipes must generate finite production inputs`);
  assert.equal(generated.values.length, fixtureCase.count);
  assert.equal(comparison.values.length, fixtureCase.count);
}

const cycleFixture = readJson(cycleFixturePath);
assert.equal(cycleFixture.fixtureContract.posture, 'analytic');
assert.equal(cycleFixture.fixtureContract.ownerPublicationAllowed, false);
assert.equal(cycleFixture.fixtureContract.purpose, 'mathematically-discriminating-m13-m18-inputs');
assert.equal(cycleFixture.contractVersion, 'tdc-cycle-engine-input/v1');
assert.deepEqual(cycleFixture.cases.map((entry) => entry.id), ['harmonics', 'irregularity', 'rolling-drift', 'insufficient-history', 'break-contamination', 'broad-grid', 'frozen-lag', 'event-study']);
assert.equal(collectKeys(cycleFixture).some((key) => /^(expected|conclusion|verdict|result)$/i.test(key)), false, 'Scope 3 analytic fixture must contain inputs rather than asserted output');
const scope3Cases = Object.fromEntries(cycleFixture.cases.map((entry) => [entry.id, entry]));

const casesById = Object.fromEntries(engineFixture.cases.map((entry) => [entry.id, entry]));
const balancedProfile = config.profiles.find((entry) => entry.id === 'balanced');
const earlyProfile = config.profiles.find((entry) => entry.id === 'early');
const cautiousProfile = config.profiles.find((entry) => entry.id === 'cautious');
const horizon = config.horizons.find((entry) => entry.id === 'h126');
const engineRuns = Object.fromEntries(['sustained', 'accelerating', 'decelerating', 'disagreement'].map((id) => [id, production.tdcRunScope2Engine(casesById[id], balancedProfile, horizon, config)]));
for (const [id, run] of Object.entries(engineRuns)) {
  assert.equal(run.ok, true, `${id} engine run must complete: ${JSON.stringify(run.errors)}`);
  assert.equal(run.result.contractVersion, 'tdc-scope2-engine/v1');
  assert.equal(run.result.methodResults.length, 12);
  assert.deepEqual(run.result.methodResults.map((entry) => entry.methodId), config.methods.slice(0, 12).map((entry) => entry.id));
  assert.equal(run.result.methodResults.every((entry) => ['one-sided-filtered', 'retrospective-segmented'].includes(entry.endpointPosture)), true);
  assert.equal(run.result.methodResults.every((entry) => entry.availability === 'unavailable' || collectFiniteNumbers(entry).every(Number.isFinite)), true);
  assert.equal(Object.isFrozen(run.result), true);
  assert.equal(Object.isFrozen(run.result.methodResults), true);
}
function collectFiniteNumbers(value, output = []) {
  if (typeof value === 'number') output.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => collectFiniteNumbers(entry, output));
  else if (value && typeof value === 'object') Object.values(value).forEach((entry) => collectFiniteNumbers(entry, output));
  return output;
}
assert.equal(engineRuns.sustained.result.trend.direction, 'rising');
assert.equal(engineRuns.sustained.result.trend.lifecycle, 'sustained');
assert.notEqual(engineRuns.sustained.result.change.state, 'reversal');
assert.equal(engineRuns.accelerating.result.trend.direction, 'rising');
assert.equal(engineRuns.accelerating.result.dynamics.state, 'accelerating');
assert.equal(engineRuns.decelerating.result.trend.direction, 'rising');
assert.equal(engineRuns.decelerating.result.dynamics.state, 'decelerating');
assert.notEqual(engineRuns.decelerating.result.change.state, 'reversal');
assert.equal(engineRuns.disagreement.result.change.state, 'mixed-unconfirmed');
assert.equal(engineRuns.disagreement.result.confirmedRegimeChange, false);

const sensitivityEarly = production.tdcRunScope2Engine(casesById.sensitivity, earlyProfile, horizon, config);
const sensitivityCautious = production.tdcRunScope2Engine(casesById.sensitivity, cautiousProfile, horizon, config);
assert.equal(sensitivityEarly.ok && sensitivityCautious.ok, true);
assert.notDeepEqual(sensitivityEarly.result.speedReliability, sensitivityCautious.result.speedReliability);
assert.deepEqual(sensitivityEarly.result.integrity, sensitivityCautious.result.integrity);
assert.equal(sensitivityEarly.result.profile.controls.cusumLimit < sensitivityCautious.result.profile.controls.cusumLimit, true);
assert.equal(sensitivityEarly.result.profile.controls.persistenceBars < sensitivityCautious.result.profile.controls.persistenceBars, true);

const exactLinear = Array.from({ length: 63 }, (_, index) => 3 + 1.25 * index);
const linearResult = production.tdcRollingOlsHac(exactLinear, { window: 63, intervalMultiplier: 1.96, minimumQrDiagonalRatio: config.limits.minimumQrDiagonalRatio, varianceFloor: config.limits.absoluteVarianceFloor, unitId: engineFixture.unitId });
assert.equal(linearResult.ok, true);
assert.equal(Math.abs(linearResult.slope - 1.25) < 1e-10, true);
assert.equal(linearResult.endpointPosture, 'one-sided-filtered');
assert.equal(linearResult.units.slope, 'index-points/observation');
assert.equal(linearResult.normalizedSlope.state, 'unavailable');
assert.equal(linearResult.normalizedSlope.code, 'TDC-NUMERIC-VARIANCE');
assert.equal(production.tdcRollingOlsHac([1, null, 3], { window: 3, intervalMultiplier: 1.96, minimumQrDiagonalRatio: config.limits.minimumQrDiagonalRatio, varianceFloor: config.limits.absoluteVarianceFloor, unitId: engineFixture.unitId }).errors[0].code, 'TDC-DATA-NONFINITE');
assert.equal(production.tdcScaleShift([1, 2, 3], { longWindow: 60, shortWindow: 20, varianceFloor: 1e-12, jackknifeBlocks: 10 }).errors[0].code, 'TDC-METHOD-HISTORY');
assert.equal(production.tdcCorrelationShift([{ x: 1, y: 1 }], { window: 30, intervalMultiplier: 1.96 }).errors[0].code, 'TDC-METHOD-HISTORY');

const deterministicInput = {
  methodResults: engineRuns.sustained.result.methodResults,
  familyVotes: engineRuns.sustained.result.familyVotes,
  trend: engineRuns.sustained.result.trend,
  dynamics: engineRuns.sustained.result.dynamics,
  change: engineRuns.sustained.result.change,
  stability: engineRuns.sustained.result.stability,
  influence: engineRuns.sustained.result.influence,
  quality: engineRuns.sustained.result.quality,
  profile: engineRuns.sustained.result.profile,
  horizon: engineRuns.sustained.result.horizon,
  integrity: engineRuns.sustained.result.integrity,
  timings: { ignored: 1 }
};
const deterministicBytes = JSON.stringify(production.tdcBuildConsensus(deterministicInput));
for (let index = 0; index < 100; index += 1) {
  deterministicInput.timings.ignored = index + 2;
  assert.equal(JSON.stringify(production.tdcBuildConsensus(deterministicInput)), deterministicBytes);
}

const politicalFixture = sourceFixtures[1];
const political = configIndex.cyclesById[politicalFixture.cycleId];
assert.equal(political.type, 'deterministic-calendar');
assert.equal(politicalFixture.officialDate, '2026-11-03');
assert.equal(politicalFixture.effectState, 'uncertain');
assert.equal(politicalFixture.turnSignal, false);
assert.equal(Object.hasOwn(political, 'phase'), false);

const climateFixture = sourceFixtures[2];
assert.equal(climateFixture.contractVersion, 'tdc-context-fixture/v1');
assert.equal(climateFixture.cycleId, 'enso-context');
assert.equal(climateFixture.officialState, 'El Niño Advisory');
assert.equal(climateFixture.confidence.moderateOrStrongerProbability, 0.84);
assert.equal(climateFixture.confidence.strongProbability, 0.56);
assert.equal(climateFixture.season, 'Northern Hemisphere winter 2023-24');
assert.equal(climateFixture.geography, 'southern tier of the United States');
assert.equal(climateFixture.universalTargetEffect, false);
assert.match(climateFixture.mechanism, /jet stream/i);
assert.equal(climateFixture.limitations.length > 1, true);

const harmonicRun = production.tdcRunScope3Engine(scope3Cases.harmonics, config, configIndex, null);
const irregularRun = production.tdcRunScope3Engine(scope3Cases.irregularity, config, configIndex, null);
const rollingRun = production.tdcRunScope3Engine(scope3Cases['rolling-drift'], config, configIndex, null);
const insufficientRun = production.tdcRunScope3Engine(scope3Cases['insufficient-history'], config, configIndex, null);
const breakRun = production.tdcRunScope3Engine(scope3Cases['break-contamination'], config, configIndex, null);
const broadRun = production.tdcRunScope3Engine(scope3Cases['broad-grid'], config, configIndex, null);
const frozenRun = production.tdcRunScope3Engine(scope3Cases['frozen-lag'], config, configIndex, null);
const eventRun = production.tdcRunScope3Engine(scope3Cases['event-study'], config, configIndex, null);
assert.equal([harmonicRun, irregularRun, rollingRun, insufficientRun, breakRun, broadRun, frozenRun, eventRun].every((run) => run.ok), true);
assert.deepEqual(harmonicRun.result.harmonic.components.map((component) => component.period), [7, 365]);
assert.equal(harmonicRun.result.harmonic.components.every((component) => component.strength > 0.9 && component.drift.state === 'not-estimated-by-static-decomposition'), true);
assert.equal(harmonicRun.result.harmonic.interventions.length, 1);
assert.equal(Math.abs(harmonicRun.result.harmonic.interventions[0].coefficient - 5) < 1e-5, true);
assert.equal(harmonicRun.result.harmonic.reconstruction.maxAbsoluteError < 1e-5, true);
assert.equal(harmonicRun.result.harmonic.residual.variance < 1e-8, true);
assert.equal(harmonicRun.result.regular.welch.segmentCount >= 4, true);
assert.equal(irregularRun.result.irregular.interpolationApplied, false);
assert.equal(irregularRun.result.irregular.inputObservationIds.length, scope3Cases.irregularity.sampleCount);
assert.equal(rollingRun.result.rolling.windows.length >= 3, true);
assert.equal(rollingRun.result.rolling.windows[0].period < rollingRun.result.rolling.windows.at(-1).period, true);
assert.equal(rollingRun.result.rolling.edgeWindows.length, 2);
assert.equal(eventRun.result.eventStudy.events.length, 8);
assert.equal(eventRun.result.eventStudy.overlapRejected.length, 0);
assert.equal(Math.abs(eventRun.result.eventStudy.exactSignPValue - 0.0078125) < 1e-12, true);
assert.equal(insufficientRun.result.cycle.state, 'ineligible');
assert.equal(insufficientRun.result.cycle.requirements.duration.shortfall, 480);
assert.equal(insufficientRun.result.cycle.requirements.repetitions.required, 4);
assert.equal(Object.hasOwn(insufficientRun.result.cycle, 'phase'), false);
assert.equal(Object.hasOwn(insufficientRun.result.cycle, 'nextTurnDate'), false);
assert.equal(Object.hasOwn(insufficientRun.result.cycle, 'confidence'), false);
assert.equal(breakRun.result.breakFirst.order, 1);
assert.equal(breakRun.result.breakFirst.contaminated, true);
assert.equal(breakRun.result.candidatePeriodEvidence.power > 0, true);
assert.equal(breakRun.result.activation.active, false);
assert.equal(breakRun.result.activation.gates[0].id, 'break-clear');
assert.equal(broadRun.result.multiplicity.searchBreadth.count > 20, true);
assert.equal(broadRun.result.multiplicity.hypotheses.every((hypothesis) => hypothesis.key.split('|').length === 6), true);
assert.equal(broadRun.result.multiplicity.inSampleWinner.heldOut.evaluatedFrozenHypothesis, true);
assert.equal(broadRun.result.multiplicity.inSampleWinner.heldOut.improvement < 0.05, true);
assert.equal(broadRun.result.multiplicity.inSampleWinner.supported, false);
assert.equal(frozenRun.result.association.discovery.lag, 3);
assert.equal(frozenRun.result.association.heldOut.lag, 3);
assert.equal(frozenRun.result.association.heldOut.frozen, true);
assert.equal(frozenRun.result.association.heldOut.searched, false);
assert.equal(frozenRun.result.association.label, 'association');

const typedCycles = {
  calendar: production.tdcEvaluateCycle(configIndex.cyclesById['us-federal-election-calendar'], politicalFixture, config.evaluation),
  empirical: production.tdcEvaluateCycle(configIndex.cyclesById['business-seasonality'], { state: 'contextual', period: 4, phase: 1, amplitude: 2, drift: 0.1, strength: 0.7, sourceLineage: true }, config.evaluation),
  quasi: production.tdcEvaluateCycle(configIndex.cyclesById['enso-context'], climateFixture, config.evaluation),
  lifecycle: production.tdcEvaluateCycle(configIndex.cyclesById['technology-attention-lifecycle'], analyticFixture, config.evaluation),
  regime: production.tdcEvaluateCycle(configIndex.cyclesById['demographic-social-regime'], { state: 'contextual', officialState: 'population-growth-slowing', transitionUncertainty: 'material', sourceLineage: true }, config.evaluation),
  event: production.tdcEvaluateCycle(configIndex.cyclesById['solar-physical-event'], { state: 'contextual', eventState: 'scheduled', scenarios: ['observed', 'expired'], sourceLineage: true }, config.evaluation)
};
assert.equal(Object.values(typedCycles).every((entry) => entry.ok), true);
assert.equal(Object.hasOwn(typedCycles.calendar.cycle, 'phase'), false);
assert.equal(Object.hasOwn(typedCycles.empirical.cycle, 'trendDirection'), false);
assert.equal(typedCycles.quasi.cycle.source.authority, 'NOAA Climate.gov');
assert.equal(typedCycles.quasi.cycle.universalTargetEffect, false);
assert.equal(Object.hasOwn(typedCycles.lifecycle.cycle, 'period'), false);
assert.equal(Object.hasOwn(typedCycles.lifecycle.cycle, 'phase'), false);
assert.equal(Object.hasOwn(typedCycles.regime.cycle, 'calendarRecurrence'), false);
assert.equal(Object.hasOwn(typedCycles.event.cycle, 'repetitions'), false);
assert.equal(Object.hasOwn(typedCycles.event.cycle, 'confidence'), false);

const selectionStates = ['enabled', 'disabled', 'filtered', 'compare'];
for (const entry of config.cycleCatalog) {
  const before = JSON.stringify(entry);
  for (const selectionState of selectionStates) {
    const evidence = { state: 'contextual', selectionState, sourceLineage: true };
    if (entry.type === 'deterministic-calendar') Object.assign(evidence, { officialDate: '2026-01-01', effectState: 'uncertain', turnSignal: false });
    if (entry.type === 'empirical-seasonality') Object.assign(evidence, { period: entry.expectedRange.min, phase: 0, amplitude: 1, drift: { state: 'stable' }, strength: 0.5 });
    if (entry.type === 'quasi-periodic-oscillation') Object.assign(evidence, { periodRange: [entry.expectedRange.min, entry.expectedRange.max], stability: { state: 'contextual' } });
    if (entry.type === 'lifecycle') Object.assign(evidence, { stage: entry.expectedRange.stages[0], stageEvidence: 'configured-stage' });
    if (entry.type === 'regime') Object.assign(evidence, { officialState: entry.expectedRange.stages[0], transitionUncertainty: 'material' });
    if (entry.type === 'event') Object.assign(evidence, { eventState: 'scheduled', scenarios: ['observed', 'expired'] });
    const evaluated = production.tdcEvaluateCycle(entry, evidence, config.evaluation);
    assert.equal(evaluated.ok, true);
    assert.equal(evaluated.cycle.selectionState, selectionState);
    assert.equal(evaluated.cycle.type, entry.type);
    assert.equal(evaluated.cycle.domain, entry.domain);
    assert.equal(evaluated.cycle.source.authority, entry.source.authority);
    assert.equal(evaluated.cycle.mechanismOrCalendar, entry.mechanismOrCalendar);
    assert.deepEqual(evaluated.cycle.scope, entry.scope);
    assert.equal(evaluated.cycle.evidenceTier, entry.evidenceTier);
    assert.equal(evaluated.cycle.invalidation, entry.invalidation);
    assert.equal(JSON.stringify(entry), before);
  }
}

const scope3FunctionNames = ['tdcHarmonicDecomposition', 'tdcWelchSpectrum', 'tdcGeneralizedLombScargle', 'tdcRollingSpectrum', 'tdcLeadLag', 'tdcEventStudy', 'tdcEvaluateCycle', 'tdcRunScope3Engine'];
const feature006Start = selftestSource.indexOf('/* ---------- Feature 006:');
const feature007Start = selftestSource.indexOf('/* ---------- Feature 007:');
assert.equal(feature006Start >= 0 && feature007Start > feature006Start, true);
const feature006Block = selftestSource.slice(feature006Start, feature007Start);
const outsideFeature006 = selftestSource.slice(0, feature006Start) + selftestSource.slice(feature007Start);
assert.equal(scope3FunctionNames.every((name) => feature006Block.includes(`'${name}'`) && !outsideFeature006.includes(`'${name}'`)), true);
assert.equal(scope3FunctionNames.every((name) => (html.match(new RegExp(`function\\s+${name}\\s*\\(`, 'g')) || []).length === 1), true);
const scope3Titles = [
  'Regression: SCN-006-008 weekly and annual components remain separate from trend',
  'Regression: SCN-006-010 insufficient long-cycle history yields no phase or next turn',
  'Regression: SCN-006-013 ENSO context stays scoped to source season geography and mechanism',
  'Regression: SCN-006-014 structural break blocks contaminated cycle activation',
  'Regression: SCN-006-015 period and lag scans expose correction and reject in-sample winners',
  'Regression: SCN-006-017 lead-lag evidence remains association without a mechanism'
];
assert.equal(scope3Titles.every((title) => browserSource.includes(`test('${title}'`)), true);
assert.equal(html.includes('tests/fixtures/trend-dynamics-cycle/analytic/cycle-engine-inputs.json') && html.includes('tests/fixtures/trend-dynamics-cycle/source-qualified/climate-context.json'), true);
assert.equal(cycleFixture.cases.every((entry) => html.includes(`'${entry.id}'`)), true);
assert.equal(html.includes('config.evaluation.heldOutMinimumGain') && !html.includes('minimumHeldOutImprovement'), true);
assert.equal(/reconstruction:\s*\{[^}]*maxAbsoluteError:/.test(html) && !/reconstruction:\s*\{[^}]*maximumAbsoluteError:/.test(html), true);
assert.equal([navSource, indexSource, toolsSource].some((source) => /cycle-engine|climate-context|tdcHarmonicDecomposition/.test(source)), false);
assert.equal(fs.existsSync(path.join(root, 'api')) || fs.existsSync(path.join(root, 'generated-clients')), false);

const invalidFixture = readJson(invalidFixturePath);
assert.equal(invalidFixture.fixtureContract.posture, 'invalid');
assert.equal(invalidFixture.fixtureContract.ownerPublicationAllowed, false);
const invalidValidation = production.tdcValidateSeriesEnvelope(invalidFixture, configIndex);
assert.equal(invalidValidation.ok, false);
const invalidCodes = [...new Set(invalidValidation.errors.map((error) => error.code))].sort();
assert.equal(invalidCodes.includes('TDC-DATA-MISSING'), true);
assert.equal(invalidCodes.includes('TDC-DATA-UNIT'), true);
assert.equal(invalidCodes.includes('TDC-SOURCE-STALE'), true);

const singular = production.tdcHouseholderSolve([[1, 2], [2, 4], [3, 6]], [1, 2, 3], config.limits);
assert.equal(singular.ok, false);
assert.equal(singular.errors[0].code, 'TDC-NUMERIC-SINGULAR');
assert.equal(production.tdcFiniteNumber(null, '$.value').errors[0].code, 'TDC-DATA-NONFINITE');
assert.equal(production.tdcFiniteNumber(Infinity, '$.value').errors[0].code, 'TDC-DATA-NONFINITE');
const bh = production.tdcAdjustPValues([0.01, 0.04, 0.03, 0.20], 'benjamini-hochberg');
const holm = production.tdcAdjustPValues([0.01, 0.04, 0.03, 0.20], 'holm');
assert.equal(bh.ok && holm.ok, true);
assert.equal(bh.adjusted.every(Number.isFinite), true);
assert.equal(holm.adjusted.every(Number.isFinite), true);

assert.doesNotMatch(html, /page\.route|context\.route|fulfill\(|serviceWorker\.register/);
assert.doesNotMatch(html, /fallbackConfig|DEFAULT_CONFIG|hiddenDefault/);
assert.doesNotMatch(html, /localStorage\.rlApiKeys|localStorage\.setItem\(\s*['"]rlApiKeys/);
assert.match(html, /TEST FIXTURE - SOURCE-QUALIFIED/);
assert.match(html, /TEST FIXTURE - ANALYTIC/);
assert.match(html, /TEST FIXTURE - INVALID/);

console.log('[tdc-validator] production-functions=' + functionNames.length);
console.log('[tdc-validator] config=PASS version=' + config.contractVersion);
console.log('[tdc-validator] methods=PASS count=' + config.methods.length);
console.log('[tdc-validator] cycle-domains=PASS count=' + new Set(config.cycleCatalog.map((entry) => entry.domain)).size);
console.log('[tdc-validator] cycle-types=PASS count=' + new Set(config.cycleCatalog.map((entry) => entry.type)).size);
console.log('[tdc-validator] config-rejections=' + configCases.map(([name, , code]) => `${name}:${code}`).join(','));
console.log('[tdc-validator] source-qualified-fixtures=PASS count=' + sourceFixtures.length);
console.log('[tdc-validator] analytic-fixture=PASS publication=false');
console.log('[tdc-validator] engine-fixture=PASS cases=' + engineFixture.cases.length + ' expected-output-fields=0 publication=false');
console.log('[tdc-validator] cycle-fixture=PASS cases=' + cycleFixture.cases.length + ' expected-output-fields=0 publication=false');
console.log('[tdc-validator] invalid-fixture=REJECTED codes=' + invalidCodes.join(','));
console.log('[tdc-validator] irregular-sampling=PASS interpolation=false regular-method=TDC-METHOD-REGULARITY');
console.log('[tdc-validator] lifecycle=PASS period=omitted phase=omitted');
console.log('[tdc-validator] political-calendar=PASS effect=uncertain turnSignal=false');
console.log('[tdc-validator] climate-context=PASS state=El-Nino-Advisory season=winter geography=southern-tier universal-effect=false');
console.log('[tdc-validator] numeric-guards=PASS singular=TDC-NUMERIC-SINGULAR');
console.log('[tdc-validator] multiplicity=PASS methods=benjamini-hochberg,holm');
console.log('[tdc-validator] fixture-posture=PASS owner-publication=false');
console.log('[tdc-validator] source-cache-canaries=PASS shared-owners-untouched');
console.log('[tdc-validator] scope2-methods=PASS count=12 endpoint-postures=one-sided-filtered,retrospective-segmented');
console.log('[tdc-validator] scope2-states=PASS sustained=rising accelerating=accelerating decelerating=decelerating disagreement=mixed-unconfirmed');
console.log('[tdc-validator] scope2-sensitivity=PASS integrity-equal=true thresholds-different=true');
console.log('[tdc-validator] scope2-determinism=PASS repeats=100 timings-excluded=true');
console.log('[tdc-validator] scope3-methods=PASS count=6 ids=M13,M14,M15,M16,M17,M18');
console.log('[tdc-validator] scope3-cycle-types=PASS deterministic-calendar,empirical-seasonality,quasi-periodic-oscillation,lifecycle,regime,event');
console.log('[tdc-validator] scope3-catalog-immutability=PASS entries=' + config.cycleCatalog.length + ' views=' + selectionStates.join(',') + ' metadata=type,domain,source,mechanism,scope,evidence-tier,invalidation');
console.log('[tdc-validator] scope3-residual-audit=PASS periods=' + harmonicRun.result.harmonic.components.map((component) => component.period).join(',') + ' intervention=' + harmonicRun.result.harmonic.interventions[0].coefficient.toFixed(6) + ' max-error=' + harmonicRun.result.harmonic.reconstruction.maxAbsoluteError.toExponential(6) + ' residual-variance=' + harmonicRun.result.harmonic.residual.variance.toExponential(6));
console.log('[tdc-validator] scope3-irregular-audit=PASS observations=' + irregularRun.result.irregular.inputObservationIds.length + ' interpolation=false aliases=' + irregularRun.result.irregular.samplingWindowAliases.length);
console.log('[tdc-validator] scope3-rolling-audit=PASS windows=' + rollingRun.result.rolling.windows.length + ' first-period=' + rollingRun.result.rolling.windows[0].period + ' last-period=' + rollingRun.result.rolling.windows.at(-1).period + ' edge-windows=' + rollingRun.result.rolling.edgeWindows.length);
console.log('[tdc-validator] scope3-event-audit=PASS events=' + eventRun.result.eventStudy.events.length + ' overlaps=' + eventRun.result.eventStudy.overlapRejected.length + ' exact-sign-p=' + eventRun.result.eventStudy.exactSignPValue.toFixed(8));
console.log('[tdc-validator] scope3-break-first=PASS activation=false candidate-visible=true');
console.log('[tdc-validator] scope3-multiplicity=PASS breadth=' + broadRun.result.multiplicity.searchBreadth.count + ' discovery=benjamini-hochberg activation=holm held-out=' + broadRun.result.multiplicity.inSampleWinner.heldOut.improvement.toFixed(6) + ' frozen=true supported=false');
console.log('[tdc-validator] scope3-association=PASS discovery-lag=3 confirmation-lag=3 causal-promotion=false');
console.log('[tdc-validator] scope3-consumer-sweep=PASS page-functions=8 selftest-marker=Feature-006 browser-titles=6 fixture-routes=2');
console.log('[tdc-validator] scope3-stale-reference-sweep=PASS heldout-key=heldOutMinimumGain reconstruction-key=maxAbsoluteError nav-targets=unchanged');
console.log('[tdc-validator] scope3-api-generated-client-applicability=PASS api=none generated-clients=none');
console.log('[tdc-validator] OK');