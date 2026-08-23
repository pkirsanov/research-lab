import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const RLPA = require('../rlportfolioanalytics.js');

const intervalPolicy = Object.freeze({
  contractVersion: 'BlockBootstrapPolicy/v1',
  confidence: 0.90,
  blockLength: 2,
  drawCount: 96,
  seed: 23049
});

function scenarioSpecification() {
  return {
    contractVersion: 'ScenarioSpecification/v1',
    workspaceIdentity: 'workspace:scope-23-functional',
    portfolioRevisionId: 'portfolio:scope-23-functional',
    mandateRevisionId: 'mandate:scope-23-functional',
    allocationCandidateId: 'allocation:scope-23-functional',
    evidenceSet: {
      returnFingerprint: 'sha256:scope-23-functional', sourceIds: ['TARGET', 'PROXY'],
      cutoffAt: '2026-06-30T00:00:00.000Z', firstDate: '2026-01-05', lastDate: '2026-06-30',
      frequency: 'daily', currency: 'USD', eligibleDateFingerprint: 'sha256:scope-23-functional-dates'
    },
    method: {
      family: 'stationary-bootstrap',
      blockPolicy: { family: 'politis-romano-geometric', meanBlockSessions: 2, wrapPolicy: 'cyclic' },
      regimePolicy: {
        state: 'not-requested', stateDefinitions: [], transitionMatrix: [], fittingSample: null,
        minimumSamplePolicy: null, fitDiagnostics: null, uncertainty: null
      },
      fatTailPolicy: { state: 'not-requested', innovationFamily: null, tailParameters: null },
      calibrationIdentity: 'calibration:scope-23-functional',
      availability: { state: 'calibrated', reason: null }
    },
    seed: 20260821,
    horizon: { startDate: '2026-07-01', endDate: '2026-07-08', stepFrequency: 'business-day', stepCount: 5 },
    pathCount: 4,
    chunkSize: 2,
    parameterPolicy: {
      drawCount: 1,
      ranges: [{ parameter: 'drift', low: 0, high: 0 }],
      distributions: [{ parameter: 'drift', family: 'deterministic-stratified', parameters: {} }],
      gridIdentity: 'grid:scope-23-functional'
    },
    rebalancePolicy: { family: 'buy-and-hold', frequency: null },
    costPolicy: { currency: 'USD', recurringFraction: 0.001, timing: 'end-of-step' },
    contributions: [], withdrawals: [], cashNeeds: [],
    survivalDefinition: {
      state: 'available', floorValue: 700, condition: 'minimum-wealth-through-horizon',
      cashNeedPolicy: 'fund-in-declared-order', currency: 'USD', startingValue: 1000
    },
    constraintsFingerprint: 'sha256:scope-23-functional-constraints',
    uncertaintyPolicy: {
      intervalMethod: 'empirical-quantile', quantiles: [0.05, 0.5, 0.95], separatePathAndParameter: true
    },
    policyFingerprint: 'sha256:scope-23-functional-policy'
  };
}

function sample(input) {
  return RLPA.buildDependenceSample({
    contractVersion: 'DependenceSample/v1',
    sourceFingerprints: ['sha256:functional-target', 'sha256:functional-proxy'],
    selectionRule: 'frozen functional fixture', cutoff: '2026-06-30', searchedVariantCount: 1,
    pair: { anchor: 'TARGET', dependent: 'PROXY' },
    ...input
  });
}

function request() {
  const normal = sample({
    sampleId: 'functional:normal', definitionKind: 'named-date-set',
    memberDates: ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09', '2026-01-12'],
    a: [0.010, -0.004, 0.008, -0.006, 0.012, -0.005],
    b: [0.006, -0.003, 0.004, -0.002, 0.007, -0.004]
  });
  const stress = sample({
    sampleId: 'functional:stress', definitionKind: 'frozen-anchor-downside',
    memberDates: ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-09'],
    a: [-0.060, -0.030, 0.025, -0.050, 0.035, -0.040],
    b: [-0.040, -0.018, 0.012, -0.032, 0.018, -0.028]
  });
  const tail = sample({
    sampleId: 'functional:tail', definitionKind: 'empirical-rank-tail',
    memberDates: normal.memberDates.concat(stress.memberDates),
    a: normal.a.concat(stress.a), b: normal.b.concat(stress.b)
  });
  const regressionDates = ['2026-04-01', '2026-04-02', '2026-04-03', '2026-04-06', '2026-04-07', '2026-04-08'];
  const proxy = [-0.03, -0.02, -0.01, 0.01, 0.02, 0.03];
  const residual = [0.001, -0.001, 0, 0, -0.001, 0.001];
  const target = proxy.map((value, index) => 0.002 + 1.5 * value + residual[index]);
  const regressionSample = sample({
    sampleId: 'functional:regression', definitionKind: 'aligned-excess-returns',
    memberDates: regressionDates, a: target, b: proxy
  });
  const appraisalSample = sample({
    sampleId: 'functional:appraisal', definitionKind: 'appraisal-observed',
    memberDates: ['2025-03-31', '2025-06-30', '2025-09-30', '2025-12-31', '2026-03-31', '2026-06-30'],
    a: [0.020, 0.021, 0.019, 0.022, 0.018, 0.020],
    b: [0.010, -0.008, 0.012, -0.010, 0.009, -0.006]
  });
  const specification = scenarioSpecification();
  const scenarioResult = RLPA.runScenario(specification, regressionSample.a, { maximumWorkUnits: 4 });
  return {
    contractVersion: 'DiversificationProjectionRequest/v1',
    normalSample: normal, stressSample: stress, tailSample: tail,
    minimumObservations: 6,
    intervalPolicy,
    overlapPolicy: { quantile: 0.25, minimumJointEvents: 2, downsideThreshold: 0, drawdownThreshold: 0.03, recoveryThreshold: 0 },
    appraisal: {
      contractVersion: 'AppraisalSensitivityRequest/v1', assetId: 'ALT-CREDIT',
      valuationFrequency: 'quarterly', lastValuation: '2026-06-30', evidenceCutoff: '2026-08-21',
      sourceMethod: 'manager-appraisal', liquidity: 'quarterly-window',
      costs: { transactionFraction: 0.06, storageFraction: 0.002, insuranceFraction: 0.001 },
      economicDrivers: ['credit-spreads'], idiosyncraticRisks: ['manager-valuation'],
      observedSample: appraisalSample, smoothingEstimate: 0.4, rhoGrid: [0.2, 0.4, 0.6],
      minimumObservations: 6
    },
    hedge: {
      regressionRequest: {
        contractVersion: 'HedgeRegressionRequest/v1', sample: regressionSample,
        minimumObservations: 6, intervalPolicy
      },
      exposure: { exposureId: 'portfolio:functional', targetSymbol: 'TARGET', targetExposureValue: 100000 },
      scenarioSpecification: specification, scenarioResult, alignedPathSample: regressionSample,
      variants: [{
        variantId: 'functional:half', hedgeRatio: 0.5, horizonYears: 1,
        costs: { carryFraction: 0.01, commissionFraction: 0.001, spreadFraction: 0.0005,
          slippageFraction: 0.0005, turnoverFraction: 0.2, rebalanceCostFraction: 0.0002,
          liquidityFraction: 0.001, financingFraction: 0.003 }
      }]
    }
  };
}

test('TP-23-02 complete diversification projection survives JSON round trip with exact contracts', () => {
  const projection = RLPA.computeDiversificationProjection(request());
  assert.equal(projection.contractVersion, 'DiversificationProjection/v1');
  assert.equal(projection.state, 'ok');
  assert.equal(projection.published, true);
  assert.equal(projection.dependence.contractVersion, 'DependenceEvidenceSet/v1');
  assert.equal(projection.dependence.adjustment.contractVersion, 'ForbesRigobonAdjustment/v1');
  assert.equal(projection.overlaps.tail.contractVersion, 'EmpiricalTailDependence/v1');
  assert.equal(projection.overlaps.downside.contractVersion, 'DownsideOverlap/v1');
  assert.equal(projection.overlaps.drawdown.contractVersion, 'DrawdownOverlap/v1');
  assert.equal(projection.overlaps.recovery.contractVersion, 'RecoveryOverlap/v1');
  assert.equal(projection.appraisal.contractVersion, 'AppraisalSensitivity/v1');
  assert.equal(projection.hedge.contractVersion, 'HedgeComparison/v1');
  assert.equal(projection.hedge.regression.contractVersion, 'HedgeRegression/v1');
  assert.deepEqual(projection.hedge.scenarioBasis.pathIds, projection.hedge.variants[0].effectiveness.commonPath.pathIds);

  const roundTrip = JSON.parse(JSON.stringify(projection));
  assert.deepEqual(roundTrip, projection);
  assert.equal(RLPA.validateDiversificationProjection(roundTrip).ok, true);
});

test('TP-23-02 reduced or incomplete recompute refuses publication and preserves the last valid projection', () => {
  const completeRequest = request();
  const lastValid = RLPA.computeDiversificationProjection(completeRequest);
  const invalidRequest = request();
  invalidRequest.stressSample = invalidRequest.normalSample;
  invalidRequest.lastValidProjection = lastValid;

  const refused = RLPA.computeDiversificationProjection(invalidRequest);
  assert.equal(refused.state, 'unavailable');
  assert.equal(refused.reason, 'samples-not-distinct');
  assert.equal(refused.published, false);
  assert.deepEqual(refused.lastValidProjection, lastValid);
  assert.equal(RLPA.validateDiversificationProjection(refused.lastValidProjection).ok, true);

  const incompleteCost = request();
  delete incompleteCost.hedge.variants[0].costs.liquidityFraction;
  incompleteCost.lastValidProjection = lastValid;
  const partial = RLPA.computeDiversificationProjection(incompleteCost);
  assert.equal(partial.state, 'partial');
  assert.equal(partial.published, true);
  assert.equal(partial.hedge.variants[0].netState, 'unavailable');
  assert.equal(partial.hedge.variants[0].netModeledOutcome, null);
  assert.equal(partial.hedge.variants[0].costs.liquidity, null);
});