import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clone,
  loadProductionApi,
  readJson,
  readProductionSource
} from './tool-experience.support.mjs';

const TRUTH_STATES = Object.freeze([
  'ready',
  'partial',
  'stale',
  'unavailable',
  'disputed',
  'rejected'
]);

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code} ${result.error.fieldPath}`);
  return result.value;
}

function definitionFor(toolId) {
  const definition = readJson('simple-models.json').definitions.find((candidate) => candidate.toolId === toolId);
  assert.notEqual(definition, undefined, `${toolId} definition must exist`);
  return clone(definition);
}

function parameterValues(definition, overrides = {}) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [
    parameter.parameterId,
    Object.hasOwn(overrides, parameter.parameterId) ? overrides[parameter.parameterId] : parameter.defaultValue
  ]));
}

function makeEvidence(api, definition, overrides = {}) {
  const source = {
    contractVersion: 'simple-evidence-snapshot/v1',
    toolId: definition.toolId,
    state: 'ready',
    evidenceCutoff: '2026-07-23T20:00:00.000Z',
    evidenceRefs: [{
      requirementId: 'owner-evidence',
      evidenceRef: `owner:${definition.toolId}:current`,
      semanticFingerprint: api.fingerprint({ owner: definition.toolId, rows: [1, 2, 3] }),
      sourceClass: 'observed-fact',
      observedAsOf: '2026-07-23T20:00:00.000Z',
      retrievedOrPublishedAt: '2026-07-23T20:01:00.000Z',
      freshness: 'fresh',
      dataTier: 'test-owner',
      valueState: 'ready'
    }],
    parameterValues: {},
    assumptions: ['Owner observations are complete at the declared cutoff.'],
    limitations: ['Contract fixture supplies no domain conclusion.'],
    invalidationConditions: ['Owner evidence identity changes.'],
    ...overrides
  };
  source.evidenceIdentity = api.fingerprint({
    contractVersion: 'simple-evidence-identity/v1',
    toolId: source.toolId,
    state: source.state,
    evidenceCutoff: source.evidenceCutoff,
    evidenceRefs: source.evidenceRefs.map(({ requirementId, evidenceRef, semanticFingerprint, sourceClass, valueState }) => ({
      requirementId,
      evidenceRef,
      semanticFingerprint,
      sourceClass,
      valueState
    })),
    parameterValues: source.parameterValues,
    assumptions: source.assumptions,
    limitations: source.limitations,
    invalidationConditions: source.invalidationConditions
  });
  return source;
}

function makeAdapter(api, definition) {
  return {
    contractVersion: 'simple-model-adapter/v1',
    adapterId: definition.adapterId,
    supportedDefinitionIds: [definition.definitionId],
    validateDefinition(candidate) {
      return { ok: true, value: candidate };
    },
    captureEvidence(ownerContext) {
      return { ok: true, value: ownerContext.evidence };
    },
    normalizeInputs(candidate, evidence, values, seed, scenarios) {
      return api.normalizeSimpleInput(candidate, evidence, values, seed, scenarios);
    },
    compute(input) {
      const score = input.parameters
        .filter((parameter) => parameter.parameterId !== 'seed' && typeof parameter.value === 'number')
        .reduce((total, parameter) => total + parameter.value, 0);
      return {
        ok: true,
        value: {
          contractVersion: 'simple-model-output/v1',
          state: 'ready',
          values: { summary: { score, path: input.seed } },
          scenarios: input.scenarios.map((scenario) => ({ scenarioId: scenario.scenarioId, state: 'ready', values: { summary: { score, path: input.seed } } })),
          calibration: { state: 'qualified', reason: 'Contract-test calibration.' },
          provenance: {
            classes: definition.provenancePolicy.allowedClasses.filter((sourceClass) => sourceClass !== 'unavailable'),
            evidenceIdentity: input.evidenceIdentity
          },
          uncertainty: { state: 'bounded', rangeOrBand: 'Declared contract range', reason: 'Contract-test uncertainty.' },
          assumptions: ['Threshold is interpreted only by the test adapter.'],
          limitations: ['No owner formula is shipped by Scope 04.'],
          invalidationConditions: ['Evidence identity changes.'],
          flatRegionProofs: []
        }
      };
    },
    compareSensitivity(baselineInput, currentInput, sharedRandomness) {
      const baseline = Object.fromEntries(baselineInput.parameters.map((parameter) => [parameter.parameterId, parameter.value]));
      const current = Object.fromEntries(currentInput.parameters.map((parameter) => [parameter.parameterId, parameter.value]));
      const effects = Object.keys(current).filter((parameterId) => baseline[parameterId] !== current[parameterId]).map((parameterId) => ({
        parameterId,
        oldValue: baseline[parameterId],
        newValue: current[parameterId],
        direction: 'changed',
        magnitude: 1,
        nonlinear: false,
        resultPaths: definition.parameterDefinitions.find((parameter) => parameter.parameterId === parameterId).affectsOutputPaths,
        outputChanged: true,
        flatRegionProof: null
      }));
      return {
        ok: true,
        value: {
          contractVersion: 'simple-sensitivity/v1',
          sharedRandomness,
          seedChanged: baselineInput.seed !== currentInput.seed,
          effects
        }
      };
    },
    projectOwnerEvidence(output) {
      return {
        ok: true,
        value: {
          contractVersion: 'owner-evidence-projection/v1',
          state: output.state,
          valueText: `${output.values.summary.score} score`,
          numericValue: output.values.summary.score,
          unit: 'score',
          summary: 'Contract-test owner projection.',
          sourceRefs: ['owner-evidence']
        }
      };
    }
  };
}

test('TP-04-01 validates explicit runtime budgets definitions defaults seeds and closed truth states', () => {
  const api = loadProductionApi();
  const config = readJson('tool-experience.config.json');
  const models = readJson('simple-models.json');
  const runtime = requireValue(api.createSimpleRuntime(config, models));

  assert.equal(config.performanceBudgets.contractVersion, 'experience-performance-policy/v2');
  assert.equal(config.performanceBudgets.standardSimpleMaxMs, 100);
  assert.equal(config.performanceBudgets.heavySimpleMaxMs, 1000);
  assert.equal(config.performanceBudgets.cooperativeChunkMaxMs, 16);
  assert.deepEqual(api.SIMPLE_TRUTH_STATES, TRUTH_STATES);
  assert.equal(requireValue(runtime.snapshot()).state, 'unavailable');

  const invalid = clone(config);
  delete invalid.performanceBudgets.cooperativeChunkMaxMs;
  assert.equal(api.createSimpleRuntime(invalid, models).ok, false);
  assert.equal(api.createSimpleRuntime(invalid, models).error.code, 'E012-REGISTRY');
});

test('TP-04-01 normalizes explicit parameters evidence scenarios and seed into a deeply frozen input', () => {
  const api = loadProductionApi();
  const definition = definitionFor('strategy-self-improvement-lab');
  const evidence = makeEvidence(api, definition);
  const values = parameterValues(definition);
  const normalized = requireValue(api.normalizeSimpleInput(
    definition,
    evidence,
    values,
    definition.seedPolicy.defaultSeed,
    ['baseline']
  ));

  assert.equal(normalized.contractVersion, 'normalized-simple-input/v1');
  assert.equal(normalized.toolId, definition.toolId);
  assert.equal(normalized.seed, 20260722);
  assert.deepEqual(normalized.scenarios.map((scenario) => scenario.scenarioId), ['baseline']);
  assert.deepEqual(normalized.parameters.map((parameter) => parameter.parameterId), definition.parameterDefinitions.map((parameter) => parameter.parameterId));
  assert.equal(normalized.parameters.find((parameter) => parameter.parameterId === 'seed').sourceClass, 'user-assumption');
  assert.equal(normalized.policyFingerprints.length, 5);
  assert.match(normalized.inputFingerprint, /^sha256:/);
  assert.equal(Object.isFrozen(normalized), true);
  assert.equal(Object.isFrozen(normalized.parameters), true);
  assert.equal(Object.isFrozen(normalized.evidenceRefs), true);
});

test('TP-04-01 rejects unknown missing non-finite off-step out-of-domain and mismatched seed input', () => {
  const api = loadProductionApi();
  const definition = definitionFor('strategy-self-improvement-lab');
  const evidence = makeEvidence(api, definition);
  const values = parameterValues(definition);

  const mutations = [
    { field: '$.parameterValues.unknown', values: { ...values, unknown: 1 }, seed: 20260722 },
    { field: '$.parameterValues.goal', values: Object.fromEntries(Object.entries(values).filter(([key]) => key !== 'goal')), seed: 20260722 },
    { field: '$.parameterValues.search-budget', values: { ...values, 'search-budget': Number.NaN }, seed: 20260722 },
    { field: '$.parameterValues.overfit-penalty', values: { ...values, 'overfit-penalty': 0.27 }, seed: 20260722 },
    { field: '$.parameterValues.walk-forward-folds', values: { ...values, 'walk-forward-folds': 21 }, seed: 20260722 },
    { field: '$.seed', values, seed: 20260723 }
  ];

  for (const mutation of mutations) {
    const result = api.normalizeSimpleInput(definition, evidence, mutation.values, mutation.seed, ['baseline']);
    assert.equal(result.ok, false, mutation.field);
    assert.equal(result.error.code, 'E012-SIMPLE-INPUT', mutation.field);
    assert.equal(result.error.fieldPath, mutation.field);
    assert.equal(result.error.valueEchoed, false);
  }
});

test('TP-04-01 compute identity excludes occurrence retrieval view and storage time while retaining semantics cutoff seed and scenario', () => {
  const api = loadProductionApi();
  const definition = definitionFor('strategy-self-improvement-lab');
  const values = parameterValues(definition);
  const firstEvidence = makeEvidence(api, definition);
  const secondEvidence = clone(firstEvidence);
  secondEvidence.evidenceRefs[0].retrievedOrPublishedAt = '2026-07-23T20:09:00.000Z';
  const first = requireValue(api.normalizeSimpleInput(definition, firstEvidence, values, 20260722, ['baseline']));
  const second = requireValue(api.normalizeSimpleInput(definition, secondEvidence, values, 20260722, ['baseline']));

  assert.equal(first.inputFingerprint, second.inputFingerprint);
  assert.equal(requireValue(api.computeSimpleIdentity(first)), requireValue(api.computeSimpleIdentity(second)));

  const changedSeed = requireValue(api.normalizeSimpleInput(definition, firstEvidence, { ...values, seed: 20260723 }, 20260723, ['baseline']));
  assert.notEqual(requireValue(api.computeSimpleIdentity(first)), requireValue(api.computeSimpleIdentity(changedSeed)));
});

test('TP-04-01 adapter registration is exact and rejects duplicate undeclared incomplete and cross-definition registration', () => {
  const api = loadProductionApi();
  const config = readJson('tool-experience.config.json');
  const models = readJson('simple-models.json');
  const definition = definitionFor('market-heatmap-lab');
  const runtime = requireValue(api.createSimpleRuntime(config, models));
  const adapter = makeAdapter(api, definition);

  assert.equal(runtime.registerAdapter(adapter).ok, true);
  assert.equal(requireValue(runtime.adapterStatus(definition.definitionId)).registered, true);
  assert.equal(runtime.registerAdapter(adapter).error.code, 'E012-REGISTRY');

  const undeclared = { ...adapter, adapterId: 'simple-adapter/not-declared/v1' };
  assert.equal(runtime.registerAdapter(undeclared).error.code, 'E012-REGISTRY');

  const incomplete = { ...adapter };
  delete incomplete.compute;
  assert.equal(requireValue(api.createSimpleRuntime(config, models)).registerAdapter(incomplete).error.code, 'E012-REGISTRY');

  const wrongDefinition = { ...adapter, supportedDefinitionIds: ['simple-model/not-declared/v1'] };
  assert.equal(requireValue(api.createSimpleRuntime(config, models)).registerAdapter(wrongDefinition).error.code, 'E012-REGISTRY');
});

test('TP-04-01 orchestrates common-random sensitivity and keeps seed changes outside parameter effects', async () => {
  const api = loadProductionApi();
  const config = readJson('tool-experience.config.json');
  const models = readJson('simple-models.json');
  const definition = definitionFor('strategy-self-improvement-lab');
  const runtime = requireValue(api.createSimpleRuntime(config, models));
  assert.equal(runtime.registerAdapter(makeAdapter(api, definition)).ok, true);
  const evidence = makeEvidence(api, definition);
  const baselineValues = parameterValues(definition);

  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { evidence },
    parameterValues: baselineValues,
    seed: 20260722,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  }));
  const changed = requireValue(await runtime.recompute({
    parameterValues: { ...baselineValues, 'search-budget': 60 },
    seed: 20260722,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:03:00.000Z'
  }));
  assert.equal(changed.baseline.computeIdentity, prepared.current.computeIdentity);
  assert.equal(changed.sensitivity.seedChanged, false);
  assert.equal(changed.sensitivity.sharedRandomness.seed, 20260722);
  assert.deepEqual(changed.changedParameters, ['search-budget']);

  const pathRun = requireValue(await runtime.recompute({
    parameterValues: { ...baselineValues, seed: 20260723 },
    seed: 20260723,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:04:00.000Z'
  }));
  assert.equal(pathRun.sensitivity.seedChanged, true);
  assert.deepEqual(pathRun.changedParameters, []);
  assert.notEqual(pathRun.current.computeIdentity, prepared.current.computeIdentity);
});

test('TP-04-01 projects exact truth states without fabricating unavailable numeric values', () => {
  const api = loadProductionApi();
  for (const state of TRUTH_STATES) {
    const projection = requireValue(api.projectSimpleState(state, {
      toolId: 'market-heatmap-lab',
      definitionId: 'simple-model/market-breadth/v1',
      adapterId: 'simple-adapter/market-breadth/v1',
      message: `${state} contract state`,
      requiredEvidence: ['owner-evidence'],
      observedEvidence: state === 'unavailable' ? [] : ['owner-evidence'],
      lastValidRun: null,
      evidenceCutoff: null,
      limitations: ['No owner model is supplied by the core.'],
      uncertainty: { state, reason: `${state} reason` },
      deepLinks: { power: 'market-heatmap-lab.html#power', journey: 'market-heatmap-lab.html#journey' }
    }));
    assert.equal(projection.state, state);
    assert.equal(projection.noExecution, true);
    assert.equal(Object.isFrozen(projection), true);
    if (state !== 'ready') {
      assert.equal(projection.numericValue, null);
      assert.equal(projection.valueText, state === 'unavailable' ? 'Unavailable' : state[0].toUpperCase() + state.slice(1));
    }
  }
});

test('TP-04-01 exports only closed safe errors and contains no tool-ID or forbidden authority branch', () => {
  const api = loadProductionApi();
  const invalid = api.projectSimpleState('invented', {});
  assert.equal(invalid.ok, false);
  assert.equal(invalid.error.code, 'E012-SIMPLE-INPUT');
  assert.equal(invalid.error.valueEchoed, false);
  assert.deepEqual(Object.keys(invalid.error).sort(), [
    'code',
    'contractId',
    'contractVersion',
    'dependencyGateId',
    'fieldPath',
    'phase',
    'reason',
    'recoverable',
    'toolId',
    'valueEchoed'
  ]);

  const source = readProductionSource();
  for (const definition of readJson('simple-models.json').definitions) {
    assert.equal(source.includes(`"${definition.toolId}"`), false, `runtime must not branch on ${definition.toolId}`);
  }
  for (const forbidden of ['fetch(', 'providerFetch(', 'localStorage.', 'sessionStorage.', '.setItem(', 'XMLHttpRequest', 'WebSocket', 'author(', 'publish(']) {
    assert.equal(source.includes(forbidden), false, `runtime must not own ${forbidden}`);
  }
});