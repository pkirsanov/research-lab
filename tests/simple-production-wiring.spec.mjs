/*
 * TP-15-03 — Scope 15 production Simple-view wiring, live-stack regression.
 *
 * SCN-012-038 / SCN-012-039 / SCN-012-040 (market-heatmap-lab, INCREMENT 1): open
 * the REAL tool page, let the page auto-hydrate its shared cache, switch to the
 * REAL "Simple" owner mode, and prove the PRODUCTION BRIDGE (no manual injection)
 * resolves the tool's registered adapter, obtains the page's REAL owner state via
 * the uniform provider seam, runs the production runtime, and renders a VISIBLE,
 * ready adapter projection into [data-rlexperience-panel="simple"] — with the real
 * adapter id and a real numeric breadth read. Power shows the native page content
 * with the adapter panel hidden.
 *
 * REAL-STACK, ZERO INTERCEPTION. This test navigates to the real page (the shared
 * four-view shell mounts #rlviews via rlapp.js + rlnav.js), waits for the page's
 * own RLDATA hydration from committed data/bars snapshots, and asserts the
 * production bridge's rendered panel. There is NO page.route / context.route /
 * intercept / msw / nock — the owner data is the page's real cached owner state,
 * never an intercepted response.
 *
 * RED before Scope 15: under the dead-code stub the panel stays
 * data-rlexperience-simple-state="unavailable" with no adapter id, so the
 * "ready" + adapter-id assertions fail. GREEN after: the real bridge + provider +
 * ownerModes render the real adapter.
 */
import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from './playwright-runtime.mjs';
import { readJson, startStaticServer } from './tool-experience.support.mjs';

const HYDRATION_TICKER = 'MSFT';
const ADAPTER_ID = 'simple-adapter/market-breadth/v1';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

async function openHydratedHeatmap(page) {
  await page.goto(`${site.baseUrl}/market-heatmap-lab.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  // Wait for the page's own shared-cache hydration (committed data/bars snapshot) so
  // the owner-state provider returns a real snapshot — no fetch is triggered by the test.
  await page.waitForFunction(
    (ticker) => !!(window.RLDATA && typeof RLDATA.bars === 'function' && (RLDATA.bars(ticker, '1d') || []).length > 0),
    HYDRATION_TICKER,
    { timeout: 20000 }
  );
}

test('Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow', async ({ page }) => {
  await openHydratedHeatmap(page);

  // Real owner-mode flow: toggle to Power then Simple so rlviews:change→simple fires AFTER hydration.
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await page.getByRole('tab', { name: 'Simple', exact: true }).click();

  const panel = page.locator('[data-rlexperience-panel="simple"]');

  // The production bridge (async prepare) renders the REAL adapter — poll for the ready state.
  await page.waitForFunction(
    () => {
      const node = document.querySelector('[data-rlexperience-panel="simple"]');
      return !!node && node.getAttribute('data-rlexperience-simple-state') === 'ready';
    },
    null,
    { timeout: 15000 }
  );

  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('data-rlexperience-simple-state', 'ready');
  await expect(panel).toHaveAttribute('data-rlexperience-adapter', ADAPTER_ID);
  // A real numeric breadth read is painted (proves the real adapter, not a placeholder).
  await expect(panel.locator('[data-simple-numeric-value]')).toBeVisible();
  const numericText = (await panel.locator('[data-simple-numeric-value]').textContent()) || '';
  expect(numericText.trim().length).toBeGreaterThan(0);
  // Model B (ownerModes ["power"]): Simple hides native content — applyVisual owns rlv-focused.
  await expect(page.locator('body')).toHaveClass(/rlv-focused/);

  // Power: the adapter panel is hidden and native content is shown (rlv-focused OFF) — nothing deleted.
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await expect(panel).toBeHidden();
  await expect(page.locator('body')).not.toHaveClass(/rlv-focused/);
});

/* ═══════════ TP-15-03 (second half) — the STEERABLE CONTROLS + RECOMPUTE ═══════════
 *
 * TP-15-03: "E2E evidence proves market-heatmap Simple renders the real adapter panel and
 * a control recomputes." The test above proves the first half (the real adapter panel).
 * This proves the second half, which spec.md makes non-optional:
 *   • L477 — parameterDefinitions carry "at least two meaningful user-steerable parameters";
 *   • L491 — "A static verdict with decorative sliders does not satisfy the contract";
 *   • L492 — "Every control must change a real model input and recompute production logic".
 *
 * REGISTRY-DERIVED, NEVER A HARD-CODED PARAMETER LIST. The set of controls that must exist
 * is read from the PAGE'S OWN registry definition (`__rlviewsRegistration.simpleModels`),
 * so a registry change joins this assertion automatically and a dropped control fails loud.
 * The value actuated is read from the CONTROL'S OWN declared domain (its min/max/step,
 * which the bridge copies straight out of the parameter definition) — no literal target.
 *
 * NON-VACUOUS BY CONSTRUCTION. `breadth-threshold` is `identityBearing` and its declared
 * output path is `summary.leadership`, which the market-breadth adapter renders into the
 * owner summary; moving the lever off its default therefore MUST move the rendered
 * projection. The test asserts the before/after rendered message actually DIFFERS — an
 * unchanged render is a failure, never a pass — and then goes further: it re-runs the
 * PRODUCTION path in-page on the page's live owner state at the SAME actuated value and
 * requires the panel to equal that projection field for field. That is what distinguishes
 * "recomputed production logic" from "relabelled a static verdict"; no formula is restated
 * here and no expected value is hard-coded.
 *
 * REAL-STACK, ZERO INTERCEPTION. Real page, real hydration, real shell Simple view, real
 * keyboard actuation of the real rendered <input type="range">. The "no refetch" proof uses
 * a request LISTENER (`page.on('request')`) — an observer, never `page.route`/`intercept`.
 *
 * RED before the control work: the bridge rendered no control at all, so the
 * `data-rlexperience-control-input` locators find nothing and this fails at the first
 * control assertion. RED if a control is rendered but does not re-prepare: the actuation
 * lands, the panel never repaints, and the before/after difference assertion fails. */

/* Read what the panel currently shows. `authoredText` drops the rltkr.js decorator's own
   injected affordance the same way the TP-15-04 reader does, so the comparison is against
   the adapter's authored text. The controls' own note paragraph is excluded so `message`
   stays the projection's message paragraph. */
async function readHeatmapProjection(page) {
  return page.evaluate(() => {
    const host = document.querySelector('[data-rlexperience-panel="simple"]');
    if (!host) return { fatal: 'no [data-rlexperience-panel="simple"] host on the page' };
    const authoredText = (node) => {
      if (!node) return null;
      const clone = node.cloneNode(true);
      for (const decoration of clone.querySelectorAll('button.rltkr-context')) decoration.remove();
      return clone.textContent;
    };
    const paragraphs = Array.from(host.querySelectorAll('p')).filter((node) => !node.hasAttribute('data-rlexperience-controls-note'));
    return {
      state: host.getAttribute('data-rlexperience-simple-state'),
      adapter: host.getAttribute('data-rlexperience-adapter'),
      heading: authoredText(host.querySelector('h2')),
      message: paragraphs.length ? authoredText(paragraphs[0]) : null,
      numeric: authoredText(host.querySelector('[data-simple-numeric-value]'))
    };
  });
}

/* Re-run the PRODUCTION path in-page, on the page's live owner state read through the
   production provider seam, at an explicit parameter setting. Renders nothing, so the panel
   under assertion is never disturbed. Same technique as the TP-15-04 owner-parity reader:
   the expectation is computed by production code, never restated or hard-coded here. */
async function heatmapProductionProjection(page, toolId, overrides) {
  return page.evaluate(async ({ id, changed }) => {
    const providers = globalThis.__rlOwnerStateProvider;
    if (!providers || typeof providers[id] !== 'function') return { ok: false, reason: `no owner-state provider for ${id}` };
    const ownerState = providers[id]();
    if (!ownerState) return { ok: false, reason: 'provider yielded no owner state' };
    const registration = globalThis.__rlviewsRegistration;
    const definition = (registration.simpleModels.definitions || []).find((candidate) => candidate && candidate.toolId === id);
    const api = globalThis.RLEXPERIENCE;
    if (!definition || !api || !registration.config) return { ok: false, reason: 'the page exposes no production definition/api/config' };
    const moduleObject = globalThis.RLMARKETSTRUCTURE;
    if (!moduleObject || typeof moduleObject.registerMarketStructureAdapters !== 'function') return { ok: false, reason: 'the page did not load the declared adapter module' };
    try {
      const runtime = api.createSimpleRuntime(registration.config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }).value;
      moduleObject.registerMarketStructureAdapters(runtime, api, [definition], { rlvol: globalThis.RLVOL });
      const parameterValues = {};
      for (const parameter of definition.parameterDefinitions) parameterValues[parameter.parameterId] = parameter.defaultValue;
      for (const key of Object.keys(changed)) parameterValues[key] = changed[key];
      const prepared = await runtime.prepare({
        definitionId: definition.definitionId,
        ownerContext: { ownerState },
        parameterValues,
        seed: definition.seedPolicy && definition.seedPolicy.required ? definition.seedPolicy.defaultSeed : null,
        scenarioIds: ['baseline'],
        computedAt: new Date().toISOString()
      });
      if (!prepared || !prepared.ok) return { ok: false, reason: 'prepare-rejected' };
      const projection = runtime.snapshot().value.projection;
      return {
        ok: true,
        state: projection.state,
        adapter: projection.adapterId,
        heading: projection.heading,
        message: projection.message,
        // Exactly how renderSimpleProjectionInternal paints the numeric line: the FIGURE plus a
        // readable unit. The label is the heading now, so it is not repeated here.
        numeric: projection.state === 'ready' && projection.numericValue !== null
          ? (function () {
            const magnitude = Math.abs(projection.numericValue);
            const digits = magnitude >= 100 ? 0 : (magnitude >= 1 ? 2 : 4);
            const figure = Number.isFinite(projection.numericValue) ? projection.numericValue.toFixed(digits) : '';
            const unitText = projection.unit ? String(projection.unit).replace(/-/g, ' ') : '';
            return (figure || projection.valueText) + (unitText ? ' ' + unitText : '');
          })()
          : null
      };
    } catch (error) {
      return { ok: false, reason: `threw: ${error && error.message}` };
    }
  }, { id: toolId, changed: overrides });
}

const projectionMatches = (rendered, produced) => produced.ok
  && rendered.state === produced.state
  && rendered.adapter === produced.adapter
  && rendered.heading === produced.heading
  && rendered.message === produced.message
  && rendered.numeric === produced.numeric;

test('TP-15-03 market-heatmap Simple renders real steerable controls and actuating one recomputes the production projection with no refetch', async ({ page }) => {
  /* Real hydration of 135 constituents plus a bounded owner-state convergence retry (see
     below) cannot fit the default 30s budget. The budget bounds the run; it relaxes no
     assertion. */
  test.setTimeout(600000);

  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  await openHydratedHeatmap(page);
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await page.getByRole('tab', { name: 'Simple', exact: true }).click();

  const panel = page.locator('[data-rlexperience-panel="simple"]');
  await page.waitForFunction(
    () => {
      const node = document.querySelector('[data-rlexperience-panel="simple"]');
      return !!node && node.getAttribute('data-rlexperience-simple-state') === 'ready';
    },
    null,
    { timeout: 30000 }
  );

  /* ── 1. EVERY declared parameter is a REAL, labelled control ───────────────────────
     The expected set comes from the page's own registry definition, so this can never
     drift into a hard-coded list and a silently dropped control fails here. */
  const declared = await page.evaluate(() => {
    const definitions = globalThis.__rlviewsRegistration.simpleModels.definitions;
    const definition = definitions.find((candidate) => candidate && candidate.toolId === 'market-heatmap-lab');
    return definition.parameterDefinitions.map((parameter) => ({
      parameterId: parameter.parameterId,
      label: parameter.label,
      kind: parameter.kind,
      domain: parameter.domain,
      defaultValue: parameter.defaultValue
    }));
  });
  // spec.md L477: at least two meaningful user-steerable parameters.
  expect(declared.length).toBeGreaterThanOrEqual(2);
  await expect(panel.locator('[data-rlexperience-controls="parameters"]')).toHaveCount(1);
  await expect(panel.locator('[data-rlexperience-control-input]')).toHaveCount(declared.length);
  for (const parameter of declared) {
    const control = panel.locator(`[data-rlexperience-control-input="${parameter.parameterId}"]`);
    await expect(control, `${parameter.parameterId}: a real control must be rendered`).toHaveCount(1);
    // Accessible name comes from the declared label (a <label for> the control owns).
    await expect(panel.getByLabel(parameter.label, { exact: true }), `${parameter.parameterId}: accessible name`).toHaveCount(1);
    // Enum/boolean parameters get a choice control, numeric ones a numeric control.
    const tag = await control.evaluate((node) => node.tagName.toLowerCase());
    expect(tag, `${parameter.parameterId}: control kind`).toBe(['enum', 'boolean'].includes(parameter.kind) ? 'select' : 'input');
  }

  /* ── 2. THE LEVER CARRIES ITS DECLARED DOMAIN and starts at the declared default, so
     first paint is exactly the pre-control render. No bound is invented by the bridge and
     no target literal is typed into this test. */
  const threshold = panel.locator('[data-rlexperience-control-input="breadth-threshold"]');
  const declaredThreshold = declared.find((parameter) => parameter.parameterId === 'breadth-threshold');
  const lever = await threshold.evaluate((node) => ({ type: node.type, min: node.min, max: node.max, step: node.step, value: node.value }));
  expect(lever.type, 'a numeric parameter renders a numeric lever').toBe('range');
  expect({ min: Number(lever.min), max: Number(lever.max), step: Number(lever.step) }, 'the lever carries the declared domain').toEqual({
    min: declaredThreshold.domain.min,
    max: declaredThreshold.domain.max,
    step: declaredThreshold.domain.step
  });
  expect(Number(lever.value), 'first paint starts the lever at the declared default').toBe(declaredThreshold.defaultValue);
  const target = Number(lever.max);
  expect(target, 'the actuated value must differ from the default, or nothing is being steered').not.toBe(declaredThreshold.defaultValue);

  /* ── 3. WAIT FOR THE PAGE'S TERMINAL HYDRATION CONTRACT. market-heatmap-lab owns
     completion through body[data-heatmap-hydration="ready"], so owner-state sampling
     starts only after that declared boundary. Request timing does not define hydration. */
  await awaitDeclaredHydrationBoundary(page, 'data-heatmap-hydration');

  /* ── 4. THE PARAMETER IS A REAL MODEL INPUT (spec.md L492), proved DRIFT-FREE: both
     production runs happen inside ONE evaluate on ONE owner-state read, so the only
     difference between them is the parameter value. A decorative control would produce two
     identical projections here and fail. */
  const differential = await page.evaluate(async ({ id, changedId, changedValue }) => {
    const ownerState = globalThis.__rlOwnerStateProvider[id]();
    if (!ownerState) return { ok: false, reason: 'provider yielded no owner state' };
    const registration = globalThis.__rlviewsRegistration;
    const definition = registration.simpleModels.definitions.find((candidate) => candidate && candidate.toolId === id);
    const api = globalThis.RLEXPERIENCE;
    const runAt = async (overrides) => {
      const runtime = api.createSimpleRuntime(registration.config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }).value;
      globalThis.RLMARKETSTRUCTURE.registerMarketStructureAdapters(runtime, api, [definition], { rlvol: globalThis.RLVOL });
      const parameterValues = {};
      for (const parameter of definition.parameterDefinitions) parameterValues[parameter.parameterId] = parameter.defaultValue;
      for (const key of Object.keys(overrides)) parameterValues[key] = overrides[key];
      const prepared = await runtime.prepare({
        definitionId: definition.definitionId,
        ownerContext: { ownerState },
        parameterValues,
        seed: definition.seedPolicy && definition.seedPolicy.required ? definition.seedPolicy.defaultSeed : null,
        scenarioIds: ['baseline'],
        computedAt: new Date().toISOString()
      });
      if (!prepared || !prepared.ok) return null;
      return runtime.snapshot().value.projection.message;
    };
    return { ok: true, atDefault: await runAt({}), atTarget: await runAt({ [changedId]: changedValue }) };
  }, { id: 'market-heatmap-lab', changedId: 'breadth-threshold', changedValue: target });
  expect(differential.ok, `production differential failed (${differential.reason})`).toBe(true);
  expect(differential.atDefault, 'production at the declared default must produce a result').not.toBeNull();
  expect(differential.atTarget, 'production at the actuated value must produce a result').not.toBeNull();
  expect(differential.atTarget, 'the parameter must be a real model input, not a decorative lever').not.toBe(differential.atDefault);

  /* ── 4. OWNER PARITY, settled the way TP-15-04 settles it: each attempt REPAINTS at the
     setting under test and then re-runs production, so both observations come from the
     same settled moment. Non-convergence is a FAILURE, never a skip: the final (still
     mismatched) observation is what gets asserted, so the real diff is reported. */
  const observeBridgeWrites = () => page.evaluate(() => {
    const node = document.querySelector('[data-rlexperience-panel="simple"]');
    if (globalThis.__rlTp1503Observer) globalThis.__rlTp1503Observer.disconnect();
    globalThis.__rlTp1503Writes = 0;
    globalThis.__rlTp1503Observer = new MutationObserver(() => { globalThis.__rlTp1503Writes += 1; });
    globalThis.__rlTp1503Observer.observe(node, { attributes: true, attributeFilter: ['data-rlexperience-simple-state'] });
  });
  const awaitBridgeWrite = (seen) => page.waitForFunction((n) => globalThis.__rlTp1503Writes > n, seen, { timeout: 30000 });
  const bridgeWrites = () => page.evaluate(() => globalThis.__rlTp1503Writes);

  // Repaint at the declared defaults through the real owner-mode flow.
  const repaintAtDefaults = async () => {
    await page.getByRole('tab', { name: 'Power', exact: true }).click();
    await observeBridgeWrites();
    await page.getByRole('tab', { name: 'Simple', exact: true }).click();
    await awaitBridgeWrite(0);
  };
  // Repaint, then ACTUATE the real lever with real keyboard input (End → declared max).
  const repaintAtTarget = async () => {
    await repaintAtDefaults();
    const seen = await bridgeWrites();
    await threshold.focus();
    await page.keyboard.press('End');
    await awaitBridgeWrite(seen);
    await expect(threshold, 'the lever really moved to the declared maximum').toHaveValue(String(target));
  };

  const settleParity = async (overrides, label, repaint) => {
    const deadline = Date.now() + 120000;
    let rendered = null;
    let produced = null;
    while (Date.now() < deadline) {
      await repaint();
      rendered = await readHeatmapProjection(page);
      produced = await heatmapProductionProjection(page, 'market-heatmap-lab', overrides);
      if (projectionMatches(rendered, produced)) break;
      await page.waitForTimeout(500);
    }
    expect(produced.ok, `${label}: production re-run on the page's live owner state failed (${produced.reason})`).toBe(true);
    expect(rendered.state, `${label}: state`).toBe(produced.state);
    expect(rendered.adapter, `${label}: adapter id`).toBe(produced.adapter);
    expect(rendered.heading, `${label}: heading`).toBe(produced.heading);
    expect(rendered.message, `${label}: message`).toBe(produced.message);
    expect(rendered.numeric, `${label}: numeric line`).toBe(produced.numeric);
    return rendered;
  };

  // FIRST PAINT IS UNCHANGED: the panel equals production at the DECLARED DEFAULTS.
  const before = await settleParity({}, 'first paint at declared defaults', repaintAtDefaults);
  expect(before.state).toBe('ready');
  expect(before.adapter).toBe(ADAPTER_ID);

  /* AND THE ACTUATED PANEL EQUALS PRODUCTION AT THE ACTUATED VALUE. This is the assertion
     that separates "recomputed production logic" from "relabelled a static verdict": a
     panel that did not re-prepare still shows the default-threshold projection and cannot
     equal production at the declared maximum. */
  const after = await settleParity({ 'breadth-threshold': target }, `recompute at breadth-threshold=${target}`, repaintAtTarget);
  expect(after.state, 'the recompute must land on a real model result, not a degradation').toBe('ready');
  expect(after.adapter, 'the recompute stays on the same real adapter').toBe(ADAPTER_ID);
  // NON-VACUOUS: the value the user reads really changed. An unchanged render fails here.
  expect(after.message, 'moving a real model input must change the rendered projection').not.toBe(before.message);

  /* ── 5. NO REFETCH. Reconfirm the page-owned terminal hydration boundary (idempotent
     once body[data-heatmap-hydration="ready"]), then zero the request ledger immediately
     before actuating the lever (Home → declared minimum, a real in-domain change that
     forces a real recompute). Requests are recorded by a LISTENER — never
     `page.route`/`intercept`. */
  await awaitDeclaredHydrationBoundary(page, 'data-heatmap-hydration');

  const seenBeforeRecompute = await bridgeWrites();
  await threshold.focus();
  requests.length = 0;
  await page.keyboard.press('Home');
  await awaitBridgeWrite(seenBeforeRecompute);
  const recomputeRequests = requests.slice();

  await expect(threshold, 'the lever moved to the declared minimum').toHaveValue(String(declaredThreshold.domain.min));
  const atMinimum = await readHeatmapProjection(page);
  expect(atMinimum.state, 'the second recompute is also a real model result').toBe('ready');
  expect(atMinimum.message, 'the second actuation must change the rendered projection again').not.toBe(after.message);
  expect(recomputeRequests, 'the recompute must issue no new request').toEqual([]);
});

/* ═════════════════════════ TP-15-04 — the wired-tool SWEEP ═════════════════════════
 *
 * TP-15-04: "E2E evidence proves each wired ordinary tool shows a ready adapter panel in
 * Simple with an owner-parity fact."
 *
 * TP-15-03 above proves ONE tool (market-heatmap-lab) end-to-end. TP-15-02
 * (simple-production-bridge.integration.mjs) proves the WIRED SET node-side against each
 * module's own exported owner summary. TP-15-04 is the missing third leg: the whole wired
 * set driven through a REAL BROWSER on its REAL page, asserting the panel each tool
 * actually paints.
 *
 * REGISTRY-DERIVED, NEVER A HARD-CODED TOOL LIST. Membership is computed exactly the way
 * the node harness computes it, from two production sources of truth:
 *   1. `simple-models.json` — the Simple model registry (toolId → definitionId/adapterId);
 *   2. the production tool PAGES — a tool is "wired" iff `<toolId>.html` registers
 *      `globalThis.__rlOwnerStateProvider["<toolId>"]`, which is the exact fact the
 *      deployed bridge (rlexperience.js installSimpleProjectionBridge) keys on.
 * A tool wired in a future batch therefore joins this sweep automatically, and a tool that
 * stops rendering ready fails loud instead of being silently dropped.
 *
 * REAL-STACK, ZERO INTERCEPTION. Every tool is opened on the real static site and left to
 * hydrate its OWN shared cache from committed same-origin snapshots. There is no
 * page.route / context.route / intercept / msw / nock anywhere in this file — the owner
 * data is each page's real cached owner state.
 *
 * THE OWNER-PARITY FACT. For every tool that must reach ready, the sweep reads the page's
 * live owner state through the PRODUCTION PROVIDER SEAM (`__rlOwnerStateProvider[toolId]`,
 * the same call the bridge makes) and re-runs the PRODUCTION path on it — the page's own
 * `RLEXPERIENCE.createSimpleRuntime`, the page's own registry definition and config off
 * `__rlviewsRegistration`, and the page's own adapter UMD module. The projection that
 * produces must EQUAL, field for field, what the panel actually rendered: adapter id,
 * heading, message and the numeric line. No formula is restated here and no expected value
 * is hard-coded — the expectation is computed by production code from the page's live
 * owner state. A panel showing a placeholder, a stale render, another tool's adapter, or a
 * value that is not this owner state's value fails.
 *
 * AND IT IS NOT A TAUTOLOGY. The same production path is also run with the owner state
 * REMOVED (ownerState: null). That control must NOT reach ready — proving the rendered
 * panel is a function of real owner data rather than a constant the adapter would paint
 * regardless.
 *
 * THE EXPECTATION IS DERIVED, NOT ASSUMED. Whether a tool must reach ready is computed
 * from two production facts, never from a list of exceptions:
 *   • the registry's own declared limitations — a definition whose limitations say the
 *     adapter "must return unavailable" (the proven-incomplete technical-five-gate owner
 *     model, technical-analysis-decision-lab) may never publish a signal, exactly the
 *     discriminator the node harness uses; and
 *   • whether the page's own provider actually yields owner state — a wired page whose
 *     owner evidence is not hydratable from the committed snapshots (intraday-tape-lab has
 *     no committed intraday session bars) lands on the bridge's honest-unavailable branch.
 * Both cases are asserted as honest degradation, never skipped and never forced to ready.
 * If either fact changes — the registry lifts the limitation, or the page starts hydrating
 * its owner evidence — this sweep immediately REQUIRES the ready projection instead.
 */

const ROOT = new URL('../', import.meta.url);

function readRepoFile(relativePath) {
  const url = new URL(relativePath, ROOT);
  return existsSync(url) ? readFileSync(url, 'utf8') : null;
}

/* A tool is WIRED iff its production page registers the owner-state provider the shared
   bridge reads — derived from the deployed page source, never a hard-coded name list. */
function pageRegistersProvider(toolId) {
  const source = readRepoFile(`${toolId}.html`);
  if (!source) return false;
  return source.includes(`__rlOwnerStateProvider["${toolId}"]`)
    || source.includes(`__rlOwnerStateProvider['${toolId}']`);
}

/* The registry's OWN declared expectation: a model whose declared limitations say the
   adapter must return unavailable may never publish a signal. */
function registryDeclaresUnavailable(definition) {
  const limitations = Array.isArray(definition.limitations) ? definition.limitations : [];
  return limitations.some((limitation) => /must return unavailable/i.test(String(limitation)));
}

/* SCN-012-041 membership: a page owns a NATIVE Simple (or Power) surface iff its DEPLOYED
   source declares that element — the same page-source derivation pageRegistersProvider
   uses, never a hard-coded tool list. A page that gains or loses #simpleView / #powerView
   joins or leaves the native-demotion assertion automatically. */
function pageDeclaresElementId(toolId, elementId) {
  const source = readRepoFile(`${toolId}.html`);
  return !!source && new RegExp(`id="${elementId}"`).test(source);
}

function wiredTools() {
  const registry = readJson('simple-models.json');
  return registry.definitions
    .filter((definition) => pageRegistersProvider(definition.toolId))
    .map((definition) => ({
      toolId: definition.toolId,
      adapterId: definition.adapterId,
      declaredUnavailable: registryDeclaresUnavailable(definition),
      nativeSimpleView: pageDeclaresElementId(definition.toolId, 'simpleView'),
      nativePowerView: pageDeclaresElementId(definition.toolId, 'powerView')
    }));
}

/* Heatmap hydration measured 204–216s normally and 306s under load. This 600s
   budget bounds waiting only; the terminal marker predicate still decides readiness. */
async function awaitDeclaredHydrationBoundary(page, attributeName) {
  const declaredState = await page.locator('body').getAttribute(attributeName);
  if (declaredState === null) return;
  await page.waitForFunction(
    (name) => document.body.getAttribute(name) === 'ready',
    attributeName,
    { timeout: 600000 }
  );
}

/* Open one wired tool's REAL page and give its owner evidence a fair chance to hydrate.

   A page that declares a terminal hydration marker is sampled only after that marker is
   ready. Pages without the marker retain the provider-driven wait: yielded owner state ends
   the wait early, while no owner state is accepted only after the full hydration window.
   Returns whether the provider yielded owner state.

   EVERY wait here carries an EXPLICIT budget, sized for a loaded machine rather than an
   idle one. A budget bounds how long the sweep waits; it never decides an outcome. The
   shell wait in particular cannot be masked by a longer budget: rlviews.js is entirely
   synchronous (no async/await/Promise/setTimeout/rAF anywhere in the module) and
   buildControl() sets data-rlexperience-shell="ready" on the element BEFORE appending it,
   so #rlviews never exists in an unready state — the selector matches the instant the
   shell is built, or never. Waiting longer only tolerates a slow script start under CPU
   contention; a genuine init failure still fails, just later. */
async function openAndAwaitOwnerEvidence(page, toolId) {
  await page.goto(`${site.baseUrl}/${toolId}.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 30000 });
  await page.waitForFunction(
    (id) => !!(globalThis.__rlOwnerStateProvider && typeof globalThis.__rlOwnerStateProvider[id] === 'function'),
    toolId,
    { timeout: 30000 }
  );
  await awaitDeclaredHydrationBoundary(page, 'data-heatmap-hydration');
  const yieldsOwnerState = () => page.evaluate((id) => {
    try { return !!globalThis.__rlOwnerStateProvider[id](); } catch { return false; }
  }, toolId);

  const deadline = Date.now() + 60000;
  let present = await yieldsOwnerState();
  while (!present && Date.now() < deadline) {
    await page.waitForTimeout(500);
    present = await yieldsOwnerState();
  }
  return present;
}

/* Drive the real owner-mode flow and wait for the BRIDGE'S OWN write.

   The production bridge paints ASYNCHRONOUSLY (installSimpleProjectionBridge handles
   rlviews:change synchronously but renders inside a promise continuation, and prepare's
   cooperative yield crosses a real task boundary). The sole writer of
   data-rlexperience-simple-state is renderSimpleProjectionInternal, which runs only in
   that continuation, so an immediate getAttribute samples the PREVIOUS (boot-time) render
   — a real race already observed on options-flow-feed-lab.

   This wait is VALUE-AGNOSTIC: it observes that the bridge wrote the attribute, never what
   it wrote, so it cannot mask a wrong state. MutationObserver reports same-value writes
   too, so it settles on an 'unavailable' → 'unavailable' render as well. */
async function driveSimpleAndAwaitBridge(page) {
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await page.evaluate(() => {
    const node = document.querySelector('[data-rlexperience-panel="simple"]');
    globalThis.__rlTp1504BridgeWrote = false;
    new MutationObserver(() => { globalThis.__rlTp1504BridgeWrote = true; })
      .observe(node, { attributes: true, attributeFilter: ['data-rlexperience-simple-state'] });
  });
  await page.getByRole('tab', { name: 'Simple', exact: true }).click();
  await page.waitForFunction(() => globalThis.__rlTp1504BridgeWrote === true, null, { timeout: 30000 });
}

/* ─────────── SCN-012-041 — "Native Simple is demoted to Power, nothing deleted" ───────────
 *
 * Measure how much of the page's NATIVE top-level surface is actually rendering.
 *
 * The native/shell split is NOT invented here — it is read straight out of the PRODUCTION
 * RULE. rlviews.js injects
 *   body.rlv-focused>*:not(#rlviews):not(#rlnav)…{display:none!important}
 * into <style id="rlviews-css">, and the selector after that child combinator IS the
 * shell's own definition of "native". Reading it means a shell element added to (or
 * removed from) the exclusion list moves this measurement with it, and no tool, wrapper or
 * shell id is ever named by this test.
 *
 * "Rendering" is the geometric fact: a display:none child (directly or through the focus
 * rule) has no client rects. visibility:hidden is excluded too, so a page cannot satisfy
 * the Power half with an invisible box. */
async function readNativeTopLevelSurface(page) {
  return page.evaluate(() => {
    const styleNode = document.getElementById('rlviews-css');
    const css = styleNode ? styleNode.textContent || '' : '';
    const marker = 'body.rlv-focused>';
    const start = css.indexOf(marker);
    if (start < 0) return { fatal: 'the production rlviews stylesheet declares no body.rlv-focused focus rule' };
    const brace = css.indexOf('{', start);
    if (brace < 0) return { fatal: 'the production body.rlv-focused rule has no declaration block' };
    const nativeSelector = css.slice(start + marker.length, brace).trim();
    let native = 0;
    let visible = 0;
    for (const child of Array.from(document.body.children)) {
      if (!child.matches(nativeSelector)) continue;
      native += 1;
      if (child.getClientRects().length > 0 && getComputedStyle(child).visibility !== 'hidden') visible += 1;
    }
    return { nativeSelector, native, visible, view: document.body.getAttribute('data-rlview') };
  });
}

/* Assert SCN-012-041 on ONE derived native-#simpleView tool, in the tool's real page, in
 * the real shell flow. Called while the shell is already in Simple (driveUntilOwnerParity
 * leaves it there), and it leaves the page in Power — the next tool re-navigates.
 *
 * The scenario, verbatim:
 *   When the view is "simple"  → the adapter panel is visible and the native #simpleView
 *                                content is not visible
 *   When the view is "power"   → the native #powerView / #modeSeg content is visible and
 *                                the adapter panel is hidden
 * plus the DoD's "nothing deleted" clause: #simpleView stays ATTACHED, merely not visible.
 *
 * #modeSeg is deliberately NOT asserted visible: the shell's own stylesheet declares
 * "#modeSeg,#simpleTab,#powerTab{display:none!important}" unconditionally, so the legacy
 * control is never visible once the shell mounts — it is driven, not shown. The scenario's
 * "native #powerView / #modeSeg content" is therefore measured as (a) #powerView on the
 * pages that declare one, and (b) the generic native-top-level surface for every page,
 * which is exactly what the focus rule governs.
 *
 * The Power switch settles on the OBSERVABLE data-rlview attribute — no timer, no
 * network-quiet heuristic. applyVisual writes data-rlview, toggles rlv-focused and hides
 * the panels synchronously, and drives the page's own legacy control in the same task, so
 * observing data-rlview="power" from outside means that whole task already completed. */
async function assertNativeSimpleDemotion(page, entry) {
  const simpleView = page.locator('#simpleView');
  const panel = page.locator('[data-rlexperience-panel="simple"]');

  // Precondition: the Simple half is only meaningful while the shell really is in Simple.
  expect(
    await page.locator('body').getAttribute('data-rlview'),
    `${entry.toolId}: SCN-012-041 Simple half must be measured with the shell in Simple`
  ).toBe('simple');

  // NOTHING DELETED: the native Simple surface is still attached — it is demoted, not removed.
  await expect(simpleView, `${entry.toolId}: SCN-012-041 native #simpleView must stay ATTACHED in Simple (nothing deleted)`).toHaveCount(1);
  await expect(simpleView, `${entry.toolId}: SCN-012-041 native #simpleView must NOT be visible in Simple`).toBeHidden();
  await expect(panel, `${entry.toolId}: SCN-012-041 the adapter panel is the Simple surface`).toBeVisible();

  const inSimple = await readNativeTopLevelSurface(page);
  expect(inSimple.fatal, `${entry.toolId}: ${inSimple.fatal}`).toBeUndefined();
  // Non-vacuity: a page with no native top-level surface could not fail the next assertion.
  expect(inSimple.native, `${entry.toolId}: the page must own native top-level content for the demotion to mean anything`).toBeGreaterThan(0);
  expect(inSimple.visible, `${entry.toolId}: SCN-012-041 no native top-level content may render in Simple (shell rule selector: ${inSimple.nativeSelector})`).toBe(0);

  // ── and when the view is "power" ──
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await page.waitForFunction(() => document.body.getAttribute('data-rlview') === 'power', null, { timeout: 30000 });

  await expect(panel, `${entry.toolId}: SCN-012-041 the adapter panel must be HIDDEN in Power`).toBeHidden();
  await expect(page.locator('body'), `${entry.toolId}: SCN-012-041 Power must release the shell focus class`).not.toHaveClass(/rlv-focused/);
  if (entry.nativePowerView) {
    await expect(page.locator('#powerView'), `${entry.toolId}: SCN-012-041 the native #powerView must be VISIBLE in Power`).toBeVisible();
  }

  const inPower = await readNativeTopLevelSurface(page);
  expect(inPower.fatal, `${entry.toolId}: ${inPower.fatal}`).toBeUndefined();
  expect(inPower.visible, `${entry.toolId}: SCN-012-041 native content must be VISIBLE in Power (0 of ${inPower.native} native top-level children rendered)`).toBeGreaterThan(0);

  return {
    toolId: entry.toolId,
    nativeTopLevel: inSimple.native,
    visibleInSimple: inSimple.visible,
    visibleInPower: inPower.visible,
    powerView: entry.nativePowerView
  };
}

/* Read what the panel RENDERED, then compute the owner-parity expectation with PRODUCTION
   CODE from the page's live owner state. Runs entirely in the page and renders nothing, so
   the panel under assertion is never disturbed. */
async function readPanelAndOwnerParity(page, toolId, adapterId) {
  return page.evaluate(async ({ id, declaredAdapterId }) => {
    const host = document.querySelector('[data-rlexperience-panel="simple"]');
    if (!host) return { fatal: 'no [data-rlexperience-panel="simple"] host on the page' };

    /* The text the ADAPTER authored. rlticker.js decorates every ticker in the live DOM
       AFTER the panel renders, wrapping it in a link and appending its own
       `<button class="rltkr-context">?</button>` tooltip affordance — real production
       behaviour (the universal ticker-tooltip rule), which makes a raw textContent read
       "Rotation favors XLB? as XLK? rolls over". Exactly those decorator-owned nodes are
       removed, identified by the decorator's OWN class, so the comparison is against the
       adapter's authored text and nothing else is altered: a "?" the adapter itself
       emitted still fails, and a decorator that started injecting something else fails. */
    const authoredText = (node) => {
      if (!node) return null;
      const clone = node.cloneNode(true);
      for (const decoration of clone.querySelectorAll('button.rltkr-context')) decoration.remove();
      return clone.textContent;
    };

    // WHAT THE PANEL SHOWS — read first, before anything else touches the page.
    const numericNode = host.querySelector('[data-simple-numeric-value]');
    const headingNode = host.querySelector('h2');
    const paragraphs = Array.from(host.querySelectorAll('p'));
    const rendered = {
      state: host.getAttribute('data-rlexperience-simple-state'),
      adapter: host.getAttribute('data-rlexperience-adapter'),
      heading: authoredText(headingNode),
      message: paragraphs.length ? authoredText(paragraphs[0]) : null,
      numeric: authoredText(numericNode)
    };

    // THE PRODUCTION PROVIDER SEAM — the exact call the bridge makes.
    const providers = globalThis.__rlOwnerStateProvider;
    if (!providers || typeof providers[id] !== 'function') return { fatal: `no owner-state provider registered for ${id}`, rendered };
    let ownerState = null;
    try { ownerState = providers[id](); } catch (error) { return { fatal: `owner-state provider threw: ${error && error.message}`, rendered }; }
    const ownerStatePresent = !!ownerState;
    if (!ownerStatePresent) return { rendered, ownerStatePresent };

    // THE PAGE'S OWN registry definition + config, off the production registration.
    const registration = globalThis.__rlviewsRegistration;
    const definitions = registration && registration.simpleModels && registration.simpleModels.definitions;
    if (!Array.isArray(definitions)) return { fatal: 'the page exposes no production simple-model registration', rendered, ownerStatePresent };
    const definition = definitions.find((candidate) => candidate && candidate.toolId === id);
    if (!definition) return { fatal: `no registry definition for ${id}`, rendered, ownerStatePresent };
    const api = globalThis.RLEXPERIENCE;
    const config = registration.config;
    if (!api || !config) return { fatal: 'the page exposes no production experience api/config', rendered, ownerStatePresent };

    /* The adapter module the PAGE loaded, discovered from the module's OWN declared
       supportedAdapterIds — never a hard-coded global-name map. A page may legitimately omit
       it: the bridge then takes its honest module-guard branch. That is reported, not
       treated as a crash, and the caller asserts the registry justifies it. */
    const moduleNames = [];
    for (const name of Object.getOwnPropertyNames(globalThis)) {
      let candidate;
      try { candidate = globalThis[name]; } catch { continue; }
      if (!candidate || typeof candidate !== 'object') continue;
      if (!Array.isArray(candidate.supportedAdapterIds)) continue;
      if (candidate.supportedAdapterIds.indexOf(definition.adapterId) >= 0) moduleNames.push(name);
    }
    if (moduleNames.length === 0) return { rendered, ownerStatePresent, adapterModuleLoaded: false };
    if (moduleNames.length > 1) return { fatal: `ambiguous adapter modules declaring ${definition.adapterId}: ${JSON.stringify(moduleNames)}`, rendered, ownerStatePresent };
    const moduleObject = globalThis[moduleNames[0]];
    const registrars = Object.keys(moduleObject).filter((key) => /^register[A-Za-z]*Adapters$/.test(key) && typeof moduleObject[key] === 'function');
    if (registrars.length !== 1) return { fatal: `expected exactly one register*Adapters export, saw ${JSON.stringify(registrars)}`, rendered, ownerStatePresent };

    /* Run the PRODUCTION path on a given owner state. Inputs are read straight off the
       registry definition the same way the bridge reads them; nothing is invented and no
       owner result is substituted. Renders nothing. */
    async function runProduction(ownerStateForRun) {
      try {
        const created = api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] });
        if (!created || !created.ok) return { ok: false, reason: 'runtime-create-failed' };
        const runtime = created.value;
        moduleObject[registrars[0]](runtime, api, [definition], { rlvol: globalThis.RLVOL });
        const parameterValues = {};
        for (const parameter of definition.parameterDefinitions || []) parameterValues[parameter.parameterId] = parameter.defaultValue;
        const seed = definition.seedPolicy && definition.seedPolicy.required ? definition.seedPolicy.defaultSeed : null;
        const prepared = await runtime.prepare({
          definitionId: definition.definitionId,
          ownerContext: { ownerState: ownerStateForRun },
          parameterValues,
          seed,
          scenarioIds: ['baseline'],
          computedAt: new Date().toISOString()
        });
        if (!prepared || !prepared.ok) return { ok: false, reason: 'prepare-rejected' };
        const projection = runtime.snapshot().value.projection;
        return {
          ok: true,
          state: projection.state,
          adapter: projection.adapterId,
          heading: projection.heading,
          message: projection.message,
          // Exactly how renderSimpleProjectionInternal paints the numeric line: the FIGURE plus a
          // readable unit. The label is the heading now, so it is not repeated here.
          numeric: projection.state === 'ready' && projection.numericValue !== null
            ? (function () {
              const magnitude = Math.abs(projection.numericValue);
              const digits = magnitude >= 100 ? 0 : (magnitude >= 1 ? 2 : 4);
              const figure = Number.isFinite(projection.numericValue) ? projection.numericValue.toFixed(digits) : '';
              const unitText = projection.unit ? String(projection.unit).replace(/-/g, ' ') : '';
              return (figure || projection.valueText) + (unitText ? ' ' + unitText : '');
            })()
            : null
        };
      } catch (error) {
        return { ok: false, reason: `threw: ${error && error.message}` };
      }
    }

    const ownerParity = await runProduction(ownerState);
    // Control: the SAME production path with the owner state removed must not reach ready.
    const withoutOwnerState = await runProduction(null);

    return { rendered, ownerStatePresent, adapterModuleLoaded: true, declaredAdapterId, ownerParity, withoutOwnerState };
  }, { id: toolId, declaredAdapterId: adapterId });
}

/* Whether the panel's rendered facts EQUAL the projection production code produced from the
   page's live owner state. This is the owner-parity fact itself, expressed once. */
function ownerParityHolds(observed) {
  const parity = observed.ownerParity;
  const rendered = observed.rendered;
  return !!parity && parity.ok
    && parity.state === rendered.state
    && parity.adapter === rendered.adapter
    && parity.heading === rendered.heading
    && parity.message === rendered.message
    && parity.numeric === rendered.numeric;
}

/* Drive the real owner-mode flow and read the panel, retrying until the comparison is a
   VALID one — that is, until the model outcome held still across the render and the read.

   WHY A RETRY AND NOT A "WAIT FOR THE OWNER STATE TO SETTLE": measured on these real pages,
   a byte-stable owner state is UNATTAINABLE BY DESIGN. Every provider rebuilds its owner
   state per call and stamps it with the wall clock — back-to-back reads of
   options-flow-feed-lab / options-structure-lab / gamma-trading-lab differ in `nowMs`
   alone, and market-heatmap-lab differs in `asOf` plus its 135 progressively-hydrating
   `constituents` (still moving at t=120s). A fingerprint-equality gate on the raw owner
   state therefore never converges, and excluding "clock fields" would mean this test
   deciding which owner fields are material — which it must not do.

   So the sweep synchronizes on the OBSERVABLE OUTCOME instead: repaint, re-run production
   on a fresh owner read, and only assert once the two agree. That tolerates a transient
   mid-hydration disagreement and NOTHING ELSE — a panel showing a placeholder, a stale
   render, the wrong adapter, or a value this owner state does not produce disagrees on
   every attempt and fails. Non-convergence is a failure, never a skip: the final (still
   mismatched) observation is what the caller asserts on, so the real diff is reported. */
async function driveUntilOwnerParity(page, toolId, adapterId) {
  const deadline = Date.now() + 180000;
  let attempts = 0;
  let observed = null;
  while (Date.now() < deadline) {
    attempts += 1;
    await driveSimpleAndAwaitBridge(page);
    observed = await readPanelAndOwnerParity(page, toolId, adapterId);
    // A fatal, or a path with nothing to converge (no owner evidence / no adapter module),
    // is asserted immediately.
    if (observed.fatal || !observed.ownerStatePresent || observed.adapterModuleLoaded === false) break;
    if (ownerParityHolds(observed)) break;
    await page.waitForTimeout(500);
  }
  return { observed, attempts };
}

test('TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact', async ({ page }) => {
  /* 19 real pages, each hydrated from its own committed snapshots and driven through the
     real owner-mode flow. A measured probe of this exact sweep took 2.6 minutes; the
     per-tool owner-parity and control runs add two more production prepares per page, so
     the default 30s test timeout cannot express this work. The budget is generous on
     purpose — it bounds the run, it never relaxes an assertion. */
  test.setTimeout(900000);

  const wired = wiredTools();
  // Non-vacuity: an empty or truncated derivation must fail here, not pass silently.
  expect(wired.length).toBeGreaterThan(0);

  /* SCN-012-041 membership, derived from the DEPLOYED PAGES by the same page-source rule
     that derives wiring — never a hard-coded list, and never a count assumed by this test.
     Printed so the number is evidence produced by the run rather than an assertion of the
     author's. #powerView membership is derived the same way and is not assumed to be the
     same set. */
  const nativeSimpleTools = wired.filter((entry) => entry.nativeSimpleView);
  const nativePowerTools = nativeSimpleTools.filter((entry) => entry.nativePowerView);
  expect(nativeSimpleTools.length, 'SCN-012-041 must actually cover native #simpleView tools').toBeGreaterThan(0);
  console.log(`TP-15-04/SCN-012-041 derived native #simpleView tools: ${nativeSimpleTools.length} of ${wired.length} wired (${nativePowerTools.length} also declare #powerView) — ${nativeSimpleTools.map((entry) => `${entry.toolId}${entry.nativePowerView ? '+#powerView' : ''}`).join(' ')}`);

  const nativeDemotion = [];
  const results = [];
  for (const entry of wired) {
    const settledOwnerEvidence = await openAndAwaitOwnerEvidence(page, entry.toolId);
    const { observed, attempts } = await driveUntilOwnerParity(page, entry.toolId, entry.adapterId);
    expect(observed.fatal, `${entry.toolId}: ${observed.fatal}`).toBeUndefined();

    /* THE TWO PROVIDER READS MUST AGREE — ASYMMETRICALLY, and the asymmetry is a property of
       the system, not a relaxation of the check. Hydration is MONOTONIC: owner state, once a
       provider yields it, does not vanish — every provider rebuilds it per call from data
       already hydrated into the page. So of two reads taken at different instants, only ONE
       direction of disagreement can occur without a defect:
         • settled TRUE  → observed FALSE is a REGRESSION. Owner evidence the page HAD is
           gone: the provider broke, or the panel lost its owner evidence. Monotonicity says
           this cannot happen benignly, so it is asserted AT FULL STRENGTH and fails loudly.
         • settled FALSE → observed TRUE is a PREMATURE NEGATIVE. openAndAwaitOwnerEvidence
           gives up after one bounded window; driveUntilOwnerParity then retries and sees
           state that window could not. The LATER POSITIVE is the definitive read.
       Only the premature-negative direction is absorbed, and it is absorbed by RE-DERIVING
       the expectation from the definitive read — mustBeReady and every downstream assertion
       below then run at full strength against it, so a tool whose evidence arrived late is
       held to the READY projection rather than excused into honest-degradation. Nothing is
       skipped, nothing is weakened, and no observation is discarded. */
    const providerYieldsOwnerState = settledOwnerEvidence
      ? true                                 // a positive settled read is definitive — a later negative is a regression
      : observed.ownerStatePresent === true; // premature negative — the later definitive read supersedes it
    expect(observed.ownerStatePresent, `${entry.toolId}: the settled provider read and the in-page provider read must agree (settled=${settledOwnerEvidence}, observed=${observed.ownerStatePresent}; a later positive supersedes a premature negative, a later negative is a regression)`).toBe(providerYieldsOwnerState);

    /* DERIVED expectation — the registry's declared limitation and the page's own provider,
       never a list of exceptions. */
    const mustBeReady = !entry.declaredUnavailable && providerYieldsOwnerState;

    // The panel always names the adapter the REGISTRY declares for this tool.
    expect(observed.rendered.adapter, `${entry.toolId}: rendered adapter id`).toBe(entry.adapterId);

    if (!mustBeReady) {
      // Honest degradation — asserted, never skipped and never forced to ready.
      expect(observed.rendered.state, `${entry.toolId}: must degrade honestly (declaredUnavailable=${entry.declaredUnavailable}, providerYieldsOwnerState=${providerYieldsOwnerState})`).toBe('unavailable');
      expect(observed.rendered.numeric, `${entry.toolId}: an unavailable panel must publish no signal`).toBeNull();
      /* A wired page that omits its adapter module lands on the bridge's honest module-guard
         branch. That is only legitimate for a registry-declared-unavailable model — otherwise
         a tool that silently stopped loading its module would be excused here. */
      if (observed.adapterModuleLoaded === false) {
        expect(entry.declaredUnavailable, `${entry.toolId}: a wired tool whose page omits the adapter module must be registry-declared unavailable`).toBe(true);
      }
      // SCN-012-041 is a shell-visibility contract, independent of whether the adapter
      // reached ready — an honestly-unavailable tool must still demote its native Simple.
      if (entry.nativeSimpleView) nativeDemotion.push(await assertNativeSimpleDemotion(page, entry));
      results.push({ toolId: entry.toolId, outcome: 'unavailable', attempts });
      continue;
    }

    // A READY adapter panel is visible with the real adapter's own projection.
    expect(observed.adapterModuleLoaded, `${entry.toolId}: a tool that must reach ready has to load its declared adapter module`).toBe(true);
    expect(observed.rendered.state, `${entry.toolId}: wired tool must reach a ready adapter panel`).toBe('ready');
    await expect(page.locator('[data-rlexperience-panel="simple"]')).toBeVisible();

    /* THE OWNER-PARITY FACT: what the panel shows equals what the production adapter
       produces from THIS page's live owner state, read through the production provider
       seam. Not a hard-coded literal, not a restated formula. Asserted field by field so a
       failure names the field that drifted. */
    const parity = observed.ownerParity;
    expect(parity.ok, `${entry.toolId}: production re-run on the page's live owner state failed (${parity.reason})`).toBe(true);
    expect(parity.state, `${entry.toolId}: owner-parity state`).toBe(observed.rendered.state);
    expect(parity.adapter, `${entry.toolId}: owner-parity adapter id`).toBe(observed.rendered.adapter);
    expect(parity.heading, `${entry.toolId}: owner-parity heading`).toBe(observed.rendered.heading);
    expect(parity.message, `${entry.toolId}: owner-parity message`).toBe(observed.rendered.message);
    expect(parity.numeric, `${entry.toolId}: owner-parity numeric read`).toBe(observed.rendered.numeric);

    /* NOT A TAUTOLOGY: strip the owner state and the same production path must lose the
       ready projection — so the panel above is real owner data, not a constant. */
    const control = observed.withoutOwnerState;
    expect(control.ok && control.state === 'ready', `${entry.toolId}: the ready panel must depend on real owner state, but the adapter still reached ready with no owner state`).toBe(false);

    // SCN-012-041 — native Simple demoted to Power, nothing deleted.
    if (entry.nativeSimpleView) nativeDemotion.push(await assertNativeSimpleDemotion(page, entry));

    results.push({ toolId: entry.toolId, outcome: 'ready', numeric: observed.rendered.numeric, attempts });
  }

  // Non-vacuity guards: the sweep really covered the derived set, and really saw ready panels.
  expect(results.length, 'every wired tool must be swept').toBe(wired.length);
  expect(results.filter((row) => row.outcome === 'ready').length, 'the sweep must observe real ready adapter panels').toBeGreaterThan(0);
  // Every derived native-#simpleView tool was really exercised — a silently skipped one fails here.
  expect(nativeDemotion.length, 'every derived native #simpleView tool must be checked for SCN-012-041').toBe(nativeSimpleTools.length);
  console.log(`TP-15-04 swept ${results.length} wired tools: ${results.map((row) => `${row.toolId}=${row.outcome}(x${row.attempts})`).join(' ')}`);
  console.log(`TP-15-04/SCN-012-041 native demotion verified on ${nativeDemotion.length} tools: ${nativeDemotion.map((row) => `${row.toolId}[simple ${row.visibleInSimple}/${row.nativeTopLevel} native visible -> power ${row.visibleInPower}/${row.nativeTopLevel}${row.powerView ? ' +#powerView visible' : ''}]`).join(' ')}`);
});

test('TP-15-04 the swept set is derived from the production registry + pages, and the honest-degradation cases are registry/provider derived', () => {
  const registry = readJson('simple-models.json');
  const wired = wiredTools();

  // Non-vacuity: the derivation must actually select tools, and must select them from the registry.
  expect(wired.length).toBeGreaterThan(0);
  for (const entry of wired) {
    expect(registry.definitions.some((definition) => definition.toolId === entry.toolId && definition.adapterId === entry.adapterId)).toBe(true);
  }

  // Membership really is page-derived: a registry tool whose page registers no provider is excluded.
  const unwired = registry.definitions.filter((definition) => !pageRegistersProvider(definition.toolId));
  expect(unwired.length, 'this batch has not wired every registry tool, so the derivation must exclude some').toBeGreaterThan(0);
  for (const definition of unwired) {
    expect(wired.some((entry) => entry.toolId === definition.toolId)).toBe(false);
  }

  /* The one registry-gated exception is discovered from the registry's own declared
     limitations — it is not named by this test's control flow. */
  const declaredUnavailable = wired.filter((entry) => entry.declaredUnavailable);
  expect(declaredUnavailable.length, 'the declared-unavailable set must come from the registry limitations, and must not be empty or unbounded').toBe(1);
});

