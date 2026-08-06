import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadProductionApi } from './tool-experience.support.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const require = createRequire(import.meta.url);
const RLFX = require(resolve(ROOT, 'rlfx.js'));
const vehicleUniverse = JSON.parse(readFileSync(resolve(ROOT, 'fx-vehicle-universe.json'), 'utf8'));
const currencyDecisionSeed = JSON.parse(readFileSync(resolve(ROOT, 'tests/fixtures/fx-regime/commonjs-determinism-input.json'), 'utf8'));
const TOOL_ID = 'fx-regime-relative-value-lab';
const SERIALIZABLE_KEYS = [
  'contractVersion', 'toolId', 'revision', 'parameterValues',
  'ownerDecisionId', 'evidenceIdentity', 'evidenceCutoff'
];

function enumParameter(parameterId, options) {
  return {
    parameterId,
    label: parameterId,
    kind: 'enum',
    unit: 'classification',
    domain: {
      options: options.map((value) => ({ value, label: value }))
    },
    defaultValue: options[options.length - 1],
    defaultSource: 'registry',
    interpretation: `${parameterId} is an explicit owner control.`,
    affectsOutputPaths: ['$.ownerDecisionId'],
    disabledWhen: [],
    identityBearing: true
  };
}

function parameterDefinitions() {
  return [
    enumParameter('objective', ['foreign-currency-strength', 'dollar-strength']),
    enumParameter('subjectId', ['EUR', 'JPY']),
    enumParameter('cohort', ['G10', 'liquid-EM']),
    enumParameter('horizon', ['tactical', 'swing', 'structural']),
    enumParameter('pairMode', ['explicit', 'auto']),
    enumParameter('base', ['EUR', 'JPY']),
    enumParameter('quote', ['JPY', 'USD']),
    enumParameter('vehicleClass', ['unlevered-single-currency', 'tactical-daily-reset']),
    enumParameter('dailyResetPermission', ['exclude', 'permit-tactical']),
    enumParameter('liquidityPolicyId', ['vehicle-liquidity-research-minimum-v1', 'vehicle-liquidity-review-only-v2']),
    enumParameter('costPolicyId', ['vehicle-cost-research-maximum-v1', 'vehicle-cost-review-only-v2']),
    enumParameter('evidenceLens', ['balanced', 'trend']),
    enumParameter('dollarComparison', ['Broad', 'AFE'])
  ];
}

function initialParameterValues() {
  return {
    objective: 'foreign-currency-strength',
    subjectId: 'EUR',
    cohort: 'G10',
    horizon: 'tactical',
    pairMode: 'explicit',
    base: 'EUR',
    quote: 'JPY',
    vehicleClass: 'unlevered-single-currency',
    dailyResetPermission: 'exclude',
    liquidityPolicyId: 'vehicle-liquidity-research-minimum-v1',
    costPolicyId: 'vehicle-cost-research-maximum-v1',
    evidenceLens: 'balanced',
    dollarComparison: 'Broad'
  };
}

function computeOwner(parameterValues) {
  const seed = structuredClone(currencyDecisionSeed);
  seed.controls = {
    cohort: parameterValues.cohort,
    horizon: parameterValues.horizon,
    pairMode: parameterValues.pairMode,
    base: parameterValues.base,
    quote: parameterValues.quote,
    evidenceLens: parameterValues.evidenceLens,
    dollarComparison: parameterValues.dollarComparison
  };
  const currencyDecision = RLFX.computeCurrencyDecision(seed);
  const vehicleObservations = vehicleUniverse.observations.map((observation) => {
    return RLFX.normalizeVehicleObservation(observation, {
      universe: vehicleUniverse,
      decisionTime: seed.decisionTime,
      payloadKind: 'normalized-structural-fact'
    });
  });
  return RLFX.computeFxOwnerDecision({
    decisionTime: seed.decisionTime,
    currencyDecision,
    vehicleUniverse,
    vehicleObservations,
    trackingReads: [],
    controls: structuredClone(parameterValues),
    fitPolicyId: vehicleUniverse.policies.fitPolicyId,
    trackingPolicyId: vehicleUniverse.policies.trackingPolicyId
  });
}

function ownerResult(request, owner) {
  return {
    contractVersion: 'tool-control-owner-result/v1',
    toolId: request.toolId,
    parameterValues: structuredClone(request.parameterValues),
    ownerDecisionId: owner.ownerDecisionId,
    evidenceIdentity: owner.evidenceIdentity,
    evidenceCutoff: owner.evidenceCutoff
  };
}

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code} ${result.error.fieldPath}`);
  return result.value;
}

async function expectInputFailure(promise, fieldPath) {
  await assert.rejects(promise, (error) => {
    assert.equal(error.contractVersion, 'experience-error/v1');
    assert.equal(error.code, 'E012-SIMPLE-INPUT');
    assert.equal(error.fieldPath, fieldPath);
    assert.equal(error.valueEchoed, false);
    return true;
  });
}

function bindingHarness(api, commitHandler) {
  const values = initialParameterValues();
  const initialOwner = computeOwner(values);
  const notifications = [];
  const binding = requireValue(api.createToolControlBinding({
    initialState: {
      contractVersion: 'tool-control-binding/v1',
      toolId: TOOL_ID,
      revision: 0,
      parameterValues: values,
      ownerDecisionId: initialOwner.ownerDecisionId,
      evidenceIdentity: initialOwner.evidenceIdentity,
      evidenceCutoff: initialOwner.evidenceCutoff
    },
    parameterDefinitions: parameterDefinitions(),
    commitHandler,
    notifySubscribers(snapshot) {
      notifications.push(snapshot);
    }
  }));
  return { binding, initialOwner, notifications };
}

test('RLFX owner decision and ToolControlBinding preserve one objective vehicle state and evidence identity', async () => {
  const api = loadProductionApi();
  assert.equal(typeof api.createToolControlBinding, 'function');
  assert.equal(typeof api.projectToolControlBinding, 'function');

  const owners = new Map();
  let handlerCalls = 0;
  const harness = bindingHarness(api, (request) => {
    handlerCalls += 1;
    assert.equal(Object.isFrozen(request), true);
    assert.equal(Object.isFrozen(request.parameterValues), true);
    const owner = computeOwner(request.parameterValues);
    owners.set(owner.ownerDecisionId, owner);
    return ownerResult(request, owner);
  });
  owners.set(harness.initialOwner.ownerDecisionId, harness.initialOwner);
  const simpleConsumer = harness.binding;
  const powerConsumer = harness.binding;

  assert.equal(simpleConsumer, powerConsumer);
  assert.equal(simpleConsumer.snapshot().parameterValues.horizon, 'tactical');
  assert.equal(parameterDefinitions().find((definition) => definition.parameterId === 'horizon').defaultValue, 'structural');

  const committed = await powerConsumer.commit({
    parameterId: 'horizon',
    value: 'swing',
    expectedRevision: 0
  });
  const live = simpleConsumer.snapshot();
  const owner = owners.get(live.ownerDecisionId);

  assert.equal(handlerCalls, 1);
  assert.equal(harness.notifications.length, 1);
  assert.equal(committed.revision, 1);
  assert.equal(live.revision, 1);
  assert.equal(live.parameterValues.horizon, 'swing');
  assert.equal(live.parameterValues.objective, harness.initialOwner.controls.objective);
  assert.equal(owner.controls.objective, harness.initialOwner.controls.objective);
  assert.equal(owner.vehicleFit.state, harness.initialOwner.vehicleFit.state);
  assert.equal(live.ownerDecisionId, owner.ownerDecisionId);
  assert.equal(live.evidenceIdentity, owner.evidenceIdentity);
  assert.equal(live.evidenceCutoff, owner.evidenceCutoff);
  assert.notEqual(live.ownerDecisionId, harness.initialOwner.ownerDecisionId);
  assert.notEqual(live.evidenceIdentity, harness.initialOwner.evidenceIdentity);
  assert.deepEqual(harness.notifications[0], live);
});

test('ToolControlBinding fails closed on stale undeclared invalid handler and owner mismatch commits', async () => {
  const api = loadProductionApi();
  let handlerCalls = 0;
  const acceptedHandler = (request) => {
    handlerCalls += 1;
    return ownerResult(request, computeOwner(request.parameterValues));
  };
  const harness = bindingHarness(api, acceptedHandler);
  const before = api.canonicalize(harness.binding.snapshot());

  await expectInputFailure(harness.binding.commit({ parameterId: 'horizon', value: 'swing', expectedRevision: 4 }), '$.change.expectedRevision');
  await expectInputFailure(harness.binding.commit({ parameterId: 'not-declared', value: 'swing', expectedRevision: 0 }), '$.change.parameterId');
  await expectInputFailure(harness.binding.commit({ parameterId: 'horizon', value: 'intraday', expectedRevision: 0 }), '$.change.value');
  await expectInputFailure(harness.binding.commit({ parameterId: 'horizon', value: 7, expectedRevision: 0 }), '$.change.value');
  assert.equal(handlerCalls, 0);
  assert.equal(api.canonicalize(harness.binding.snapshot()), before);

  const rejected = bindingHarness(api, async () => {
    throw new Error('handler details must not cross the binding boundary');
  });
  const rejectedBefore = api.canonicalize(rejected.binding.snapshot());
  await expectInputFailure(rejected.binding.commit({ parameterId: 'horizon', value: 'swing', expectedRevision: 0 }), '$.commitHandler');
  assert.equal(api.canonicalize(rejected.binding.snapshot()), rejectedBefore);

  const mismatched = bindingHarness(api, (request) => ({
    ...ownerResult(request, computeOwner(request.parameterValues)),
    toolId: 'another-tool'
  }));
  const mismatchBefore = api.canonicalize(mismatched.binding.snapshot());
  await expectInputFailure(mismatched.binding.commit({ parameterId: 'horizon', value: 'swing', expectedRevision: 0 }), '$.ownerResult.toolId');
  assert.equal(api.canonicalize(mismatched.binding.snapshot()), mismatchBefore);
  assert.equal(mismatched.notifications.length, 0);

  const mismatchedParameters = bindingHarness(api, (request) => {
    const result = ownerResult(request, computeOwner(request.parameterValues));
    result.parameterValues.horizon = 'structural';
    return result;
  });
  const parameterMismatchBefore = api.canonicalize(mismatchedParameters.binding.snapshot());
  await expectInputFailure(mismatchedParameters.binding.commit({ parameterId: 'horizon', value: 'swing', expectedRevision: 0 }), '$.ownerResult.parameterValues');
  assert.equal(api.canonicalize(mismatchedParameters.binding.snapshot()), parameterMismatchBefore);
  assert.equal(mismatchedParameters.notifications.length, 0);
});

test('ToolControlBinding discards an older async completion after a newer revision commits', async () => {
  const api = loadProductionApi();
  const pending = [];
  let handlerCalls = 0;
  const harness = bindingHarness(api, (request) => {
    handlerCalls += 1;
    return new Promise((resolvePromise) => {
      pending.push({ request, resolvePromise });
    });
  });

  const older = harness.binding.commit({ parameterId: 'horizon', value: 'swing', expectedRevision: 0 });
  const newer = harness.binding.commit({ parameterId: 'horizon', value: 'structural', expectedRevision: 0 });
  assert.equal(handlerCalls, 2);

  const newerOwner = computeOwner(pending[1].request.parameterValues);
  pending[1].resolvePromise(ownerResult(pending[1].request, newerOwner));
  const newerSnapshot = await newer;
  assert.equal(newerSnapshot.revision, 1);
  assert.equal(newerSnapshot.parameterValues.horizon, 'structural');

  const olderOwner = computeOwner(pending[0].request.parameterValues);
  pending[0].resolvePromise(ownerResult(pending[0].request, olderOwner));
  await expectInputFailure(older, '$.change.expectedRevision');
  assert.equal(harness.binding.snapshot().parameterValues.horizon, 'structural');
  assert.equal(harness.binding.snapshot().ownerDecisionId, newerOwner.ownerDecisionId);
  assert.equal(harness.notifications.length, 1);
});

test('ToolControlBinding snapshots and Brief Journey projections are deeply immutable read-only values', () => {
  const api = loadProductionApi();
  const harness = bindingHarness(api, (request) => ownerResult(request, computeOwner(request.parameterValues)));
  const snapshot = harness.binding.snapshot();
  const brief = requireValue(api.projectToolControlBinding(harness.binding));
  const journey = requireValue(api.projectToolControlBinding(harness.binding));

  assert.deepEqual(Object.keys(harness.binding), SERIALIZABLE_KEYS);
  assert.deepEqual(Object.keys(snapshot), SERIALIZABLE_KEYS);
  assert.deepEqual(Object.keys(brief), SERIALIZABLE_KEYS);
  assert.deepEqual(Object.keys(journey), SERIALIZABLE_KEYS);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.parameterValues), true);
  assert.equal(Object.isFrozen(brief), true);
  assert.equal(Object.isFrozen(brief.parameterValues), true);
  assert.equal('commit' in brief, false);
  assert.equal('snapshot' in brief, false);
  assert.equal('commit' in journey, false);
  assert.equal('snapshot' in journey, false);
  assert.notEqual(brief, journey);
  assert.notEqual(brief.parameterValues, journey.parameterValues);
  assert.throws(() => { snapshot.parameterValues.horizon = 'swing'; }, TypeError);
  assert.throws(() => { brief.parameterValues.horizon = 'swing'; }, TypeError);
  assert.equal(harness.binding.snapshot().parameterValues.horizon, 'tactical');
});