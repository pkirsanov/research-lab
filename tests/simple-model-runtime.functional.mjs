import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import test from 'node:test';
import {
  clone,
  loadProductionApi,
  readJson
} from './tool-experience.support.mjs';

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code} ${result.error.fieldPath}`);
  return result.value;
}

function definitionFor(toolId) {
  return clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === toolId));
}

function valuesFor(definition, overrides = {}) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [
    parameter.parameterId,
    Object.hasOwn(overrides, parameter.parameterId) ? overrides[parameter.parameterId] : parameter.defaultValue
  ]));
}

function makeEvidence(api, definition, overrides = {}) {
  const evidence = {
    contractVersion: 'simple-evidence-snapshot/v1',
    toolId: definition.toolId,
    state: 'ready',
    evidenceCutoff: '2026-07-23T20:00:00.000Z',
    evidenceRefs: [{
      requirementId: 'owner-evidence',
      evidenceRef: `owner:${definition.toolId}:current`,
      semanticFingerprint: api.fingerprint({ owner: definition.toolId, observations: [3, 5, 8] }),
      sourceClass: 'observed-fact',
      observedAsOf: '2026-07-23T20:00:00.000Z',
      retrievedOrPublishedAt: '2026-07-23T20:01:00.000Z',
      freshness: 'fresh',
      dataTier: 'test-owner',
      valueState: 'ready'
    }],
    parameterValues: {},
    assumptions: ['Contract-test owner evidence is complete.'],
    limitations: ['Contract-test adapters are not shipped owner adapters.'],
    invalidationConditions: ['Owner evidence identity changes.'],
    ...overrides
  };
  evidence.evidenceIdentity = api.fingerprint({
    contractVersion: 'simple-evidence-identity/v1',
    toolId: evidence.toolId,
    state: evidence.state,
    evidenceCutoff: evidence.evidenceCutoff,
    evidenceRefs: evidence.evidenceRefs.map(({ requirementId, evidenceRef, semanticFingerprint, sourceClass, valueState }) => ({
      requirementId,
      evidenceRef,
      semanticFingerprint,
      sourceClass,
      valueState
    })),
    parameterValues: evidence.parameterValues,
    assumptions: evidence.assumptions,
    limitations: evidence.limitations,
    invalidationConditions: evidence.invalidationConditions
  });
  return evidence;
}

function outputFor(input, score, provenanceClasses, flatRegionProofs = []) {
  return {
    contractVersion: 'simple-model-output/v1',
    state: 'ready',
    values: { summary: { score, path: input.seed } },
    scenarios: input.scenarios.map((scenario) => ({ scenarioId: scenario.scenarioId, state: 'ready', values: { summary: { score, path: input.seed } } })),
    calibration: { state: 'qualified', reason: 'Contract-test calibration.' },
    provenance: { classes: provenanceClasses, evidenceIdentity: input.evidenceIdentity },
    uncertainty: { state: 'bounded', rangeOrBand: 'Contract-test band', reason: 'Contract-test uncertainty.' },
    assumptions: ['Only contract-test arithmetic is used.'],
    limitations: ['No shipped owner formula is represented.'],
    invalidationConditions: ['Evidence identity changes.'],
    flatRegionProofs
  };
}

function makeAdapter(api, definition, options = {}) {
  const ledger = options.ledger || { captures: 0, computes: 0, normalizations: 0, projections: 0, sensitivities: 0 };
  const deferred = options.deferred || new Map();
  const scoreParameterId = definition.parameterDefinitions.find((parameter) =>
    parameter.parameterId !== 'seed' && (parameter.kind === 'number' || parameter.kind === 'integer')
  ).parameterId;
  return {
    ledger,
    adapter: {
      contractVersion: 'simple-model-adapter/v1',
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition(candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence(ownerContext) {
        ledger.captures += 1;
        return { ok: true, value: ownerContext.evidence };
      },
      normalizeInputs(candidate, evidence, parameterValues, seed, scenarioIds) {
        ledger.normalizations += 1;
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      async compute(input, control) {
        ledger.computes += 1;
        const values = Object.fromEntries(input.parameters.map((parameter) => [parameter.parameterId, parameter.value]));
        if (options.cooperativeSteps) {
          for (let index = 0; index < options.cooperativeSteps; index += 1) {
            control.checkpoint();
            await control.yield();
          }
        }
        if (deferred.has(values[scoreParameterId])) await deferred.get(values[scoreParameterId]).promise;
        control.checkpoint();
        const score = options.constantScore ?? values[scoreParameterId];
        return {
          ok: true,
          value: outputFor(
            input,
            score,
            definition.provenancePolicy.allowedClasses.filter((sourceClass) => sourceClass !== 'unavailable')
          )
        };
      },
      compareSensitivity(baselineInput, currentInput, sharedRandomness) {
        ledger.sensitivities += 1;
        const baseline = Object.fromEntries(baselineInput.parameters.map((parameter) => [parameter.parameterId, parameter.value]));
        const current = Object.fromEntries(currentInput.parameters.map((parameter) => [parameter.parameterId, parameter.value]));
        const effects = Object.keys(current).filter((parameterId) => parameterId !== 'seed' && baseline[parameterId] !== current[parameterId]).map((parameterId) => ({
          parameterId,
          oldValue: baseline[parameterId],
          newValue: current[parameterId],
          direction: current[parameterId] > baseline[parameterId] ? 'higher' : 'lower',
          magnitude: Math.abs(Number(current[parameterId]) - Number(baseline[parameterId])) || 1,
          nonlinear: false,
          resultPaths: definition.parameterDefinitions.find((parameter) => parameter.parameterId === parameterId).affectsOutputPaths,
          outputChanged: options.constantScore === undefined,
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
        ledger.projections += 1;
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
    }
  };
}

function deferred() {
  let resolve;
  const promise = new Promise((complete) => { resolve = complete; });
  return { promise, resolve };
}

function runtimeFor(api, definition) {
  const config = readJson('tool-experience.config.json');
  const models = { contractVersion: 'simple-model-registry/v1', definitions: [definition] };
  return requireValue(api.createSimpleRuntime(config, models));
}

test('TP-04-02 baseline current reset and changed parameters remain immutable', async () => {
  const api = loadProductionApi();
  const definition = definitionFor('market-heatmap-lab');
  const runtime = runtimeFor(api, definition);
  const { adapter, ledger } = makeAdapter(api, definition);
  assert.equal(runtime.registerAdapter(adapter).ok, true);
  const evidence = makeEvidence(api, definition);
  const baselineValues = valuesFor(definition);

  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { evidence },
    parameterValues: baselineValues,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  }));
  const baselineIdentity = prepared.baseline.computeIdentity;
  assert.equal(prepared.current.computeIdentity, baselineIdentity);
  assert.deepEqual(prepared.changedParameters, []);
  assert.equal(Object.isFrozen(prepared), true);
  assert.equal(Object.isFrozen(prepared.baseline), true);

  const changed = requireValue(await runtime.recompute({
    parameterValues: { ...baselineValues, 'breadth-threshold': 65 },
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:03:00.000Z'
  }));
  assert.equal(changed.baseline.computeIdentity, baselineIdentity);
  assert.notEqual(changed.current.computeIdentity, baselineIdentity);
  assert.deepEqual(changed.changedParameters, ['breadth-threshold']);
  assert.equal(changed.current.output.values.summary.score, 65);
  assert.equal(prepared.current.output.values.summary.score, 60);

  const reset = requireValue(runtime.resetBaseline({ computedAt: '2026-07-23T20:04:00.000Z' }));
  assert.equal(reset.baseline.computeIdentity, changed.current.computeIdentity);
  assert.equal(reset.current.computeIdentity, changed.current.computeIdentity);
  assert.deepEqual(reset.changedParameters, []);
  assert.deepEqual(ledger, { captures: 1, computes: 2, normalizations: 2, projections: 2, sensitivities: 1 });
});

test('TP-04-02 changed parameter with no output effect is rejected and preserves the last valid run', async () => {
  const api = loadProductionApi();
  const definition = definitionFor('market-heatmap-lab');
  const runtime = runtimeFor(api, definition);
  const { adapter } = makeAdapter(api, definition, { constantScore: 7 });
  assert.equal(runtime.registerAdapter(adapter).ok, true);
  const baselineValues = valuesFor(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { evidence: makeEvidence(api, definition) },
    parameterValues: baselineValues,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  }));

  const rejected = await runtime.recompute({
    parameterValues: { ...baselineValues, 'breadth-threshold': 65 },
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:03:00.000Z'
  });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.error.code, 'E012-SIMPLE-NO-EFFECT');
  const snapshot = requireValue(runtime.snapshot());
  assert.equal(snapshot.lastValidRun.computeIdentity, prepared.computeIdentity);
  assert.equal(snapshot.projection.state, 'rejected');
  assert.equal(snapshot.projection.lastValidComputeIdentity, prepared.computeIdentity);
});

test('TP-04-02 seed changes create a distinct path run while common-random parameter sensitivity keeps one seed', async () => {
  const api = loadProductionApi();
  const definition = definitionFor('strategy-self-improvement-lab');
  const runtime = runtimeFor(api, definition);
  const { adapter } = makeAdapter(api, definition);
  assert.equal(runtime.registerAdapter(adapter).ok, true);
  const baselineValues = valuesFor(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { evidence: makeEvidence(api, definition) },
    parameterValues: baselineValues,
    seed: 20260722,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  }));
  const parameterRun = requireValue(await runtime.recompute({
    parameterValues: { ...baselineValues, 'search-budget': 60 },
    seed: 20260722,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:03:00.000Z'
  }));
  assert.equal(parameterRun.sensitivity.sharedRandomness.seed, 20260722);
  assert.equal(parameterRun.sensitivity.seedChanged, false);
  assert.deepEqual(parameterRun.changedParameters, ['search-budget']);

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

test('TP-04-02 stale completion and invalid stale missing or non-finite evidence preserve last valid truth', async () => {
  const api = loadProductionApi();
  const definition = definitionFor('market-heatmap-lab');
  const runtime = runtimeFor(api, definition);
  const slow = deferred();
  const deferredByThreshold = new Map([[65, slow]]);
  const { adapter } = makeAdapter(api, definition, { deferred: deferredByThreshold });
  assert.equal(runtime.registerAdapter(adapter).ok, true);
  const baselineValues = valuesFor(definition);
  const evidence = makeEvidence(api, definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { evidence },
    parameterValues: baselineValues,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  }));

  const older = runtime.recompute({
    parameterValues: { ...baselineValues, 'breadth-threshold': 65 },
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:03:00.000Z'
  });
  const newer = requireValue(await runtime.recompute({
    parameterValues: { ...baselineValues, 'breadth-threshold': 70 },
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:04:00.000Z'
  }));
  slow.resolve();
  const staleCompletion = await older;
  assert.equal(staleCompletion.ok, false);
  assert.equal(staleCompletion.error.code, 'E012-SIMPLE-INPUT');
  assert.equal(requireValue(runtime.snapshot()).lastValidRun.computeIdentity, newer.computeIdentity);

  const cases = [
    ['rejected', { ...baselineValues, 'breadth-threshold': Number.NaN }, evidence],
    ['stale', baselineValues, makeEvidence(api, definition, { state: 'stale', evidenceRefs: [{ ...evidence.evidenceRefs[0], freshness: 'stale', valueState: 'stale' }] })],
    ['unavailable', baselineValues, makeEvidence(api, definition, { state: 'unavailable', evidenceRefs: [] })],
    ['rejected', baselineValues, (() => {
      const candidate = makeEvidence(api, definition);
      candidate.parameterValues.entry = Number.POSITIVE_INFINITY;
      return candidate;
    })()]
  ];
  for (const [expectedState, parameterValues, candidateEvidence] of cases) {
    const result = candidateEvidence === evidence
      ? await runtime.recompute({ parameterValues, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-23T20:05:00.000Z' })
      : await runtime.refreshEvidence({ ownerContext: { evidence: candidateEvidence }, parameterValues, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-23T20:05:00.000Z' });
    assert.equal(result.ok, false, expectedState);
    const snapshot = requireValue(runtime.snapshot());
    assert.equal(snapshot.projection.state, expectedState);
    assert.equal(snapshot.lastValidRun.computeIdentity, newer.computeIdentity);
    assert.equal(snapshot.projection.lastValidComputeIdentity, newer.computeIdentity);
  }
  assert.notEqual(prepared.computeIdentity, newer.computeIdentity);
});

test('Simple runtime performance and cancellation', async () => {
  const api = loadProductionApi();
  const definition = definitionFor('market-heatmap-lab');
  const runtime = runtimeFor(api, definition);
  const { adapter } = makeAdapter(api, definition, { cooperativeSteps: 40 });
  assert.equal(runtime.registerAdapter(adapter).ok, true);
  const baselineValues = valuesFor(definition);
  const startedAt = performance.now();
  const pending = runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { evidence: makeEvidence(api, definition) },
    parameterValues: baselineValues,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  });
  await new Promise((resolve) => setTimeout(resolve, 1));
  const cancelled = requireValue(runtime.cancel());
  const result = await pending;
  assert.equal(cancelled.cancelled, true);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'E012-SIMPLE-INPUT');
  assert.equal(requireValue(runtime.snapshot()).lastValidRun, null);
  assert.equal(requireValue(runtime.diagnostic()).cooperativeChunkMaxMs, 16);
  assert.equal(requireValue(runtime.diagnostic()).yieldCount > 0, true);
  assert.equal(performance.now() - startedAt < readJson('tool-experience.config.json').performanceBudgets.heavySimpleMaxMs, true);
});

test('TP-04-02 runtime performs zero fetch storage author publication or provider calls', async () => {
  const api = loadProductionApi();
  const definition = definitionFor('market-heatmap-lab');
  const runtime = runtimeFor(api, definition);
  const { adapter } = makeAdapter(api, definition);
  assert.equal(runtime.registerAdapter(adapter).ok, true);
  const sentinels = {
    fetch: globalThis.fetch,
    localStorage: globalThis.localStorage,
    sessionStorage: globalThis.sessionStorage
  };
  const calls = { fetch: 0, storage: 0, author: 0, publish: 0, provider: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  try {
    const run = await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { evidence: makeEvidence(api, definition) },
      parameterValues: valuesFor(definition),
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-23T20:02:00.000Z'
    });
    assert.equal(run.ok, true);
    assert.deepEqual(calls, { fetch: 0, storage: 0, author: 0, publish: 0, provider: 0 });
  } finally {
    if (sentinels.fetch === undefined) delete globalThis.fetch; else globalThis.fetch = sentinels.fetch;
    if (sentinels.localStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = sentinels.localStorage;
    if (sentinels.sessionStorage === undefined) delete globalThis.sessionStorage; else globalThis.sessionStorage = sentinels.sessionStorage;
  }
});