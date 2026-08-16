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

  /* This page declares data-owns-route: Feature 007 gave it a real native Simple decision cockpit,
     so the shell now stands down here rather than painting its own Simple panel over/next to it.
     Previously it painted anyway, and the reader was shown two Simple answers at once — an
     "…there is no result to show" placeholder sitting directly above a rendered five-gate decision
     read. The RULE this regression exists to enforce is unchanged and is still enforced below:
     a missing owner model must never fetch a default and never fabricate a result. What changed is
     WHERE the honest answer comes from — the page's own read, not a shell placeholder. */
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await page.getByRole('tab', { name: 'Simple', exact: true }).click();

  const panel = page.locator('[data-rlexperience-panel="simple"]');
  await expect(panel).toBeHidden();
  // The shell declined silently: it claimed no adapter and published no state on this page. The
  // attributes are ABSENT rather than empty — the bridge is the only writer and it never ran.
  expect(await panel.getAttribute('data-rlexperience-adapter')).toBeNull();
  expect(await panel.getAttribute('data-rlexperience-simple-state')).toBeNull();

  // Adversarial: the exact contradiction that shipped must not be renderable again. The shell's
  // placeholder copy must be absent from everything the reader can see while the page's own read is
  // on screen. If the bridge ever repaints here, this fails — asserting only `toBeHidden()` would
  // not, because a repaint also re-shows it.
  const visibleText = await page.evaluate(() => document.body.innerText);
  expect(visibleText).not.toContain("This tool's own model is not loaded, so there is no result to show.");
  expect(visibleText).toContain('DECISION READ');

  // Nothing was fetched and nothing was fabricated — the original intent of SCN-012-034.
  expect(requests).toEqual([]);
  await expect(page.locator('[data-simple-numeric-value]')).toHaveCount(0);

  const state = await page.evaluate(() => ({
    bodyFocused: document.body.classList.contains('rlv-focused'),
    runtimeSourceHasToolBranch: globalThis.RLEXPERIENCE.runtimeDiagnostic().value.toolIdBranchCount,
    registeredAdapters: globalThis.RLEXPERIENCE.runtimeDiagnostic().value.registeredAdapterCount
  }));
  expect(state).toEqual({
    // An owns-route page renders every view itself, so the shell never focuses over it.
    bodyFocused: false,
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
  /* Preservation is proven on the PROJECTION above (lastValidIdentity / projectionIdentity).
     The reader is never shown the run digest: provenance belongs in Power (D13). */
  expect(result.hostText).not.toContain('Last valid model run preserved');
  expect(result.hostText).not.toMatch(/sha256:/);
  expect(result.hostText).not.toMatch(/neutral|average|prior unlabeled/i);
  expect(result.numericNodes).toBe(0);
});

test('Regression: technical-analysis-decision-lab native detail is reachable in BOTH modes (one Simple answer, nothing deleted)', async ({ page }) => {
  await page.goto(`${site.baseUrl}/technical-analysis-decision-lab.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();

  /* "Nothing deleted" is the durable half of this regression and it still holds — but the shape it
     holds in has changed, because Feature 007 gave this page a real native Simple decision cockpit.
     The page therefore declares data-owns-route and renders BOTH views itself; the shell no longer
     focuses over it, and no longer paints a competing Simple panel beside it. */
  await page.getByRole('tab', { name: 'Simple', exact: true }).click();
  await expect(page.locator('body')).not.toHaveClass(/rlv-focused/);
  await expect(page.locator('[data-rlexperience-panel="simple"]')).toBeHidden();
  // Simple shows the page's OWN decision read — one answer, from the page that owns it.
  await expect(page.locator('#simpleCockpit')).toBeVisible();

  // Power: the native evidence detail is reachable, and Simple's panel stays stood down.
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await expect(page.locator('body')).not.toHaveClass(/rlv-focused/);
  await expect(page.locator('[data-rlexperience-panel="simple"]')).toBeHidden();
  await expect(page.locator('#stateHeading')).toBeVisible();
  await expect(page.locator('#profileSelect')).toBeVisible();

  /* Adversarial: exactly ONE control may claim to switch this page's view. Before this fix the page
     carried its own role="tablist" whose tabs were also named "Simple" and "Power", so the shared
     shell's tabs and the page's tabs collided — a screen reader announced two "Power" tabs, and
     every shared harness that resolves a tab by name broke on the ambiguity. Counting the roles is
     what makes that regression detectable; asserting visibility alone would not see it. */
  const tabCounts = await page.evaluate(() => {
    const named = (name) => Array.from(document.querySelectorAll('[role="tab"]'))
      .filter((node) => (node.textContent || '').trim() === name).length;
    return { simple: named('Simple'), power: named('Power'), modeSegRole: document.getElementById('modeSeg')?.getAttribute('role') };
  });
  expect(tabCounts).toEqual({ simple: 1, power: 1, modeSegRole: 'group' });
});