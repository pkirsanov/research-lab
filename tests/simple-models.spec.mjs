import { expect, test } from './playwright-runtime.mjs';
import { readJson, startStaticServer } from './tool-experience.support.mjs';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: SCN-012-034 missing owner adapter stays unavailable without defaults fetch or fabricated result', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(`${site.baseUrl}/technical-analysis-decision-lab.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await page.waitForTimeout(150);
  requests.length = 0;

  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await page.getByRole('tab', { name: 'Simple', exact: true }).click();
  const panel = page.locator('[data-rlexperience-panel="simple"][data-rlexperience-simple-state="unavailable"]');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('heading')).toHaveText('Simple model unavailable');
  await expect(panel).toContainText('Owner model adapter required');
  await expect(panel).toContainText('simple-adapter/technical-five-gate/v1');
  await expect(panel).toContainText('No model result is available');
  await expect(panel).toContainText('No provider request, storage mutation, author call, publication, formula substitution, or behavioral default was used.');
  await expect(panel.locator('[data-simple-numeric-value]')).toHaveCount(0);
  await expect(panel.locator('input, select, textarea, button')).toHaveCount(0);
  await expect(panel).not.toContainText(/neutral|average|prior result/i);
  expect(requests).toEqual([]);

  const state = await page.evaluate(() => ({
    bodyFocused: document.body.classList.contains('rlv-focused'),
    adapterId: document.querySelector('[data-rlexperience-panel="simple"]')?.getAttribute('data-rlexperience-adapter'),
    runtimeSourceHasToolBranch: globalThis.RLEXPERIENCE.runtimeDiagnostic().value.toolIdBranchCount,
    registeredAdapters: globalThis.RLEXPERIENCE.runtimeDiagnostic().value.registeredAdapterCount
  }));
  expect(state).toEqual({
    bodyFocused: true,
    adapterId: 'simple-adapter/technical-five-gate/v1',
    runtimeSourceHasToolBranch: 0,
    registeredAdapters: 0
  });
});

test('Regression: Simple core preserves last valid run across invalid stale missing and non-finite input', async ({ page }) => {
  const config = readJson('tool-experience.config.json');
  const definition = readJson('simple-models.json').definitions.find((candidate) => candidate.toolId === 'market-heatmap-lab');
  await page.goto(`${site.baseUrl}/market-heatmap-lab.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();

  const result = await page.evaluate(async ({ config, definition }) => {
    const api = globalThis.RLEXPERIENCE;
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const values = Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
    const evidenceFor = (state, refs, parameterValues = {}) => {
      const evidence = {
        contractVersion: 'simple-evidence-snapshot/v1',
        toolId: definition.toolId,
        state,
        evidenceCutoff: '2026-07-23T20:00:00.000Z',
        evidenceRefs: refs,
        parameterValues,
        assumptions: ['Browser contract evidence is complete.'],
        limitations: ['Browser contract adapter is test-only.'],
        invalidationConditions: ['Owner evidence identity changes.']
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
    };
    const ref = {
      requirementId: 'owner-evidence',
      evidenceRef: 'owner:market-heatmap-lab:current',
      semanticFingerprint: api.fingerprint({ owner: definition.toolId, rows: [1, 2, 3] }),
      sourceClass: 'observed-fact',
      observedAsOf: '2026-07-23T20:00:00.000Z',
      retrievedOrPublishedAt: '2026-07-23T20:01:00.000Z',
      freshness: 'fresh',
      dataTier: 'browser-contract',
      valueState: 'ready'
    };
    const readyEvidence = evidenceFor('ready', [ref]);
    const runtime = api.createSimpleRuntime(config, {
      contractVersion: 'simple-model-registry/v1',
      definitions: [definition]
    }).value;
    const adapter = {
      contractVersion: 'simple-model-adapter/v1',
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition(candidate) { return { ok: true, value: candidate }; },
      captureEvidence(ownerContext) { return { ok: true, value: ownerContext.evidence }; },
      normalizeInputs(candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute(input) {
        const parameters = Object.fromEntries(input.parameters.map((parameter) => [parameter.parameterId, parameter.value]));
        const score = parameters['breadth-threshold'];
        return {
          ok: true,
          value: {
            contractVersion: 'simple-model-output/v1',
            state: 'ready',
            values: { summary: { score } },
            scenarios: input.scenarios.map((scenario) => ({ scenarioId: scenario.scenarioId, state: 'ready', values: { summary: { score } } })),
            calibration: { state: 'qualified', reason: 'Browser contract calibration.' },
            provenance: { classes: ['observed-fact', 'user-assumption', 'model-estimate'], evidenceIdentity: input.evidenceIdentity },
            uncertainty: { state: 'bounded', rangeOrBand: 'Browser contract band', reason: 'Browser contract uncertainty.' },
            assumptions: ['Browser contract assumption.'],
            limitations: ['Browser contract limitation.'],
            invalidationConditions: ['Owner evidence identity changes.'],
            flatRegionProofs: []
          }
        };
      },
      compareSensitivity(baselineInput, currentInput, sharedRandomness) {
        const baseline = Object.fromEntries(baselineInput.parameters.map((parameter) => [parameter.parameterId, parameter.value]));
        const current = Object.fromEntries(currentInput.parameters.map((parameter) => [parameter.parameterId, parameter.value]));
        return {
          ok: true,
          value: {
            contractVersion: 'simple-sensitivity/v1',
            sharedRandomness,
            seedChanged: false,
            effects: Object.keys(current).filter((key) => current[key] !== baseline[key]).map((parameterId) => ({
              parameterId,
              oldValue: baseline[parameterId],
              newValue: current[parameterId],
              direction: 'higher',
              magnitude: 1,
              nonlinear: false,
              resultPaths: definition.parameterDefinitions.find((parameter) => parameter.parameterId === parameterId).affectsOutputPaths,
              outputChanged: true,
              flatRegionProof: null
            }))
          }
        };
      },
      projectOwnerEvidence(output) {
        return {
          ok: true,
          value: {
            contractVersion: 'owner-evidence-projection/v1',
            state: output.state,
            valueText: `${output.values.summary.score} percent`,
            numericValue: output.values.summary.score,
            unit: 'percent',
            summary: 'Browser contract owner projection.',
            sourceRefs: ['owner-evidence']
          }
        };
      }
    };
    runtime.registerAdapter(adapter);
    const prepared = await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { evidence: readyEvidence },
      parameterValues: values,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-23T20:02:00.000Z'
    });
    const validIdentity = prepared.value.computeIdentity;
    const states = [];
    const captureAttempt = (attempt) => {
      const snapshot = runtime.snapshot().value;
      states.push({
        ok: attempt.ok,
        code: attempt.error?.code,
        state: snapshot.projection.state,
        lastValidIdentity: snapshot.lastValidRun.computeIdentity,
        projectionIdentity: snapshot.projection.lastValidComputeIdentity,
        numericValue: snapshot.projection.numericValue
      });
    };
    captureAttempt(await runtime.recompute({
      parameterValues: { ...values, 'breadth-threshold': Number.NaN },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-23T20:03:00.000Z'
    }));
    captureAttempt(await runtime.refreshEvidence({
      ownerContext: { evidence: evidenceFor('stale', [{ ...ref, freshness: 'stale', valueState: 'stale' }]) },
      parameterValues: values,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-23T20:04:00.000Z'
    }));
    captureAttempt(await runtime.refreshEvidence({
      ownerContext: { evidence: evidenceFor('unavailable', []) },
      parameterValues: values,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-23T20:05:00.000Z'
    }));
    const nonFinite = evidenceFor('ready', [ref], {});
    nonFinite.parameterValues.entry = Number.POSITIVE_INFINITY;
    captureAttempt(await runtime.refreshEvidence({
      ownerContext: { evidence: nonFinite },
      parameterValues: values,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-23T20:06:00.000Z'
    }));
    const host = document.querySelector('[data-rlexperience-panel="simple"]');
    api.renderSimpleProjection(host, runtime.snapshot().value.projection);
    return {
      validIdentity,
      states,
      hostState: host.getAttribute('data-rlexperience-simple-state'),
      hostText: host.textContent,
      numericNodes: host.querySelectorAll('[data-simple-numeric-value]').length
    };
  }, { config, definition });

  expect(result.states.map((state) => state.state)).toEqual(['rejected', 'stale', 'unavailable', 'rejected']);
  expect(result.states.every((state) => state.ok === false && state.code === 'E012-SIMPLE-INPUT')).toBe(true);
  expect(result.states.every((state) => state.lastValidIdentity === result.validIdentity)).toBe(true);
  expect(result.states.every((state) => state.projectionIdentity === result.validIdentity)).toBe(true);
  expect(result.states.every((state) => state.numericValue === null)).toBe(true);
  expect(result.hostState).toBe('rejected');
  expect(result.hostText).toContain('Last valid model run preserved');
  expect(result.hostText).not.toMatch(/neutral|average|prior unlabeled/i);
  expect(result.numericNodes).toBe(0);
});