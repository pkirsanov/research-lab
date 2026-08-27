import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const RLPA = require('../rlportfolioanalytics.js');

function specification(overrides = {}) {
  const value = {
    contractVersion: 'ScenarioSpecification/v1',
    workspaceIdentity: 'workspace:functional',
    portfolioRevisionId: 'portfolio:functional',
    mandateRevisionId: 'mandate:functional',
    allocationCandidateId: 'allocation:functional',
    evidenceSet: {
      returnFingerprint: 'sha256:functional', sourceIds: ['AAA', 'BBB'],
      cutoffAt: '2026-02-01T00:00:00.000Z', firstDate: '2025-01-02', lastDate: '2026-01-30',
      frequency: 'daily', currency: 'USD', eligibleDateFingerprint: 'sha256:functional-dates'
    },
    method: {
      family: 'stationary-bootstrap',
      blockPolicy: { family: 'politis-romano-geometric', meanBlockSessions: 3, wrapPolicy: 'cyclic' },
      regimePolicy: {
        state: 'not-requested', stateDefinitions: [], transitionMatrix: [], fittingSample: null,
        minimumSamplePolicy: null, fitDiagnostics: null, uncertainty: null
      },
      fatTailPolicy: { state: 'not-requested', innovationFamily: null, tailParameters: null },
      calibrationIdentity: 'calibration:functional',
      availability: { state: 'calibrated', reason: null }
    },
    seed: 20260821,
    horizon: { startDate: '2026-02-02', endDate: '2026-02-06', stepFrequency: 'business-day', stepCount: 4 },
    pathCount: 7,
    chunkSize: 2,
    parameterPolicy: {
      drawCount: 3,
      ranges: [{ parameter: 'drift', low: -0.001, high: 0.001 }],
      distributions: [{ parameter: 'drift', family: 'deterministic-stratified', parameters: {} }],
      gridIdentity: 'grid:functional'
    },
    rebalancePolicy: { family: 'buy-and-hold', frequency: null },
    costPolicy: { currency: 'USD', recurringFraction: 0.005, timing: 'end-of-step' },
    contributions: [{
      localId: 'contribution-a', amount: 50, currency: 'USD', date: '2026-02-03',
      timing: 'start-of-step', label: 'Contribution A'
    }],
    withdrawals: [{
      localId: 'withdrawal-a', amount: 25, currency: 'USD', date: '2026-02-04',
      timing: 'end-of-step', label: 'Withdrawal A'
    }],
    cashNeeds: [{
      localId: 'need-a', amount: 75, currency: 'USD', date: '2026-02-04',
      timing: 'end-of-step', label: 'Need A', priority: 1, treatment: 'eligible-capital'
    }],
    survivalDefinition: {
      state: 'available', floorValue: 700, condition: 'minimum-wealth-through-horizon',
      cashNeedPolicy: 'fund-in-declared-order', currency: 'USD', startingValue: 1000
    },
    constraintsFingerprint: 'sha256:functional-constraints',
    uncertaintyPolicy: {
      intervalMethod: 'empirical-quantile', quantiles: [0.05, 0.5, 0.95],
      separatePathAndParameter: true
    },
    policyFingerprint: 'sha256:functional-policy'
  };
  return Object.assign(value, overrides);
}

const SAMPLE = [0.01, -0.02, 0.015, -0.005, 0.02, -0.01];

test('BUG-008 token mapping: mismatched scenario identity is superseded directly', () => {
  const current = specification({ pathCount: 4, chunkSize: 2 });
  current.parameterPolicy.drawCount = 1;
  const controller = RLPA.createScenarioComputeController({
    workspaceIdentity: current.workspaceIdentity,
    lastValidViewModel: null
  });
  const issued = controller.issue(current, {
    tokenId: 'bug-008-mismatched-identity',
    issuedAt: '2026-08-21T00:00:00.000Z'
  });
  const mismatched = {
    ...controller.token(issued.tokenId),
    scenarioIdentity: 'scenario:stale-direct-token'
  };

  const result = RLPA.runScenarioChunk(current, mismatched, { workIndex: 0 }, {
    sampleReturns: SAMPLE,
    maximumWorkUnits: 4
  });

  assert.equal(result.state, 'error');
  assert.equal(result.error.code, 'P008-COMPUTE-SUPERSEDED');
});

test('BUG-008 cash-need mapping: declared date resolves to the first eligible session', () => {
  const result = RLPA.scheduleCashFlows([{
    amount: 75,
    currency: 'USD',
    date: '2026-02-04',
    kind: 'withdrawal',
    label: 'Need A',
    timing: 'end-of-step'
  }], ['2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05', '2026-02-06']);

  assert.equal(result.state, 'ok');
  assert.equal(result.scheduled.length, 1);
  assert.deepEqual({
    declaredDate: result.scheduled[0].declaredDate,
    modeledDate: result.scheduled[0].modeledDate,
    session: result.scheduled[0].session
  }, {
    declaredDate: '2026-02-04',
    modeledDate: '2026-02-04',
    session: 2
  });
});

test('TP-22-02 chunk controller cancellation and supersession preserve the last valid result', async () => {
  const initial = specification({ pathCount: 4, chunkSize: 2 });
  initial.parameterPolicy.drawCount = 1;
  const controller = RLPA.createScenarioComputeController({
    workspaceIdentity: initial.workspaceIdentity,
    lastValidViewModel: null
  });
  const completedToken = controller.issue(initial, {
    tokenId: 'functional-complete', issuedAt: '2026-08-21T00:00:00.000Z'
  });
  const completed = await RLPA.runScenarioJob(initial, SAMPLE, {
    controller, tokenId: completedToken.tokenId, maximumWorkUnits: 4
  });
  assert.equal(completed.state, 'ok');
  assert.equal(controller.snapshot().lastValidViewModel.scenarioIdentity, completed.identity);
  const lastValid = JSON.parse(JSON.stringify(controller.snapshot().lastValidViewModel));

  const cancelling = specification({ pathCount: 7, chunkSize: 2, seed: initial.seed + 1 });
  cancelling.parameterPolicy.drawCount = 1;
  const cancellingToken = controller.issue(cancelling, {
    tokenId: 'functional-cancel', issuedAt: '2026-08-21T00:00:01.000Z'
  });
  const cancelled = await RLPA.runScenarioJob(cancelling, SAMPLE, {
    controller,
    tokenId: cancellingToken.tokenId,
    maximumWorkUnits: 7,
    onChunk(chunk) {
      if (chunk.nextCursor.workIndex === cancelling.chunkSize) controller.requestCancel(cancellingToken.tokenId);
    }
  });
  assert.equal(cancelled.state, 'error');
  assert.equal(cancelled.error.code, 'P008-COMPUTE-CANCELLED');
  assert.deepEqual(controller.snapshot().lastValidViewModel, lastValid);

  const stale = specification({ pathCount: 7, chunkSize: 2, seed: initial.seed + 2 });
  stale.parameterPolicy.drawCount = 1;
  const staleToken = controller.issue(stale, {
    tokenId: 'functional-stale', issuedAt: '2026-08-21T00:00:02.000Z'
  });
  const replacement = specification({ pathCount: 7, chunkSize: 2, seed: initial.seed + 3 });
  replacement.parameterPolicy.drawCount = 1;
  const superseded = await RLPA.runScenarioJob(stale, SAMPLE, {
    controller,
    tokenId: staleToken.tokenId,
    maximumWorkUnits: 7,
    onChunk(chunk) {
      if (chunk.nextCursor.workIndex === stale.chunkSize) {
        controller.issue(replacement, {
          tokenId: 'functional-current', issuedAt: '2026-08-21T00:00:03.000Z'
        });
      }
    }
  });
  assert.equal(superseded.state, 'error');
  assert.equal(superseded.error.code, 'P008-COMPUTE-SUPERSEDED');
  assert.deepEqual(controller.snapshot().lastValidViewModel, lastValid);
});

test('TP-22-02 complete multi-path flow and distribution records survive a public JSON round trip', async () => {
  const current = specification();
  const controller = RLPA.createScenarioComputeController({
    workspaceIdentity: current.workspaceIdentity,
    lastValidViewModel: null
  });
  const token = controller.issue(current, {
    tokenId: 'functional-round-trip', issuedAt: '2026-08-21T00:00:04.000Z'
  });
  const result = await RLPA.runScenarioJob(current, SAMPLE, {
    controller, tokenId: token.tokenId, maximumWorkUnits: 21
  });
  assert.equal(result.state, 'ok');
  assert.equal(result.paths.length, 7);
  assert.equal(result.paths.every((path) => path.events.some((event) => event.kind === 'cash-need')), true);
  assert.equal(result.survival.pathCount, 7);
  assert.equal(result.distributionSet.conditionalPath.count, 7);
  assert.equal(result.distributionSet.parameterMarginal.count, 3);
  assert.equal(result.distributionSet.combined.count, 21);

  const roundTripped = JSON.parse(JSON.stringify(result));
  assert.equal(RLPA.validateScenarioResult(roundTripped, current).ok, true);
  assert.equal(RLPA.validateScenarioDistributionSet(roundTripped.distributionSet, current).ok, true);
  assert.deepEqual(roundTripped, result);
  assert.equal(controller.snapshot().lastValidViewModel.scenarioIdentity, result.identity);
  assert.equal(controller.snapshot().lastValidViewModel.result.distributionSet.scenarioIdentity, result.identity);
});