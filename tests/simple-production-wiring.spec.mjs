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

function wiredTools() {
  const registry = readJson('simple-models.json');
  return registry.definitions
    .filter((definition) => pageRegistersProvider(definition.toolId))
    .map((definition) => ({
      toolId: definition.toolId,
      adapterId: definition.adapterId,
      declaredUnavailable: registryDeclaresUnavailable(definition)
    }));
}

/* Open one wired tool's REAL page and give its owner evidence a fair chance to hydrate.

   A provider that yields owner state is definitive the moment it does, so the wait ends
   early. A provider that yields nothing is only accepted as the settled answer AFTER the
   full hydration window has elapsed, so a slow page can never be misread as "no owner
   evidence". Returns whether the provider yielded owner state. */
async function openAndAwaitOwnerEvidence(page, toolId) {
  await page.goto(`${site.baseUrl}/${toolId}.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await page.waitForFunction(
    (id) => !!(globalThis.__rlOwnerStateProvider && typeof globalThis.__rlOwnerStateProvider[id] === 'function'),
    toolId,
    { timeout: 30000 }
  );
  const yieldsOwnerState = () => page.evaluate((id) => {
    try { return !!globalThis.__rlOwnerStateProvider[id](); } catch { return false; }
  }, toolId);

  const deadline = Date.now() + 25000;
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
          // Exactly how renderSimpleProjectionInternal paints the numeric line.
          numeric: projection.state === 'ready' && projection.numericValue !== null
            ? projection.valueText + (projection.unit ? ' ' + projection.unit : '')
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

  const results = [];
  for (const entry of wired) {
    const providerYieldsOwnerState = await openAndAwaitOwnerEvidence(page, entry.toolId);
    const { observed, attempts } = await driveUntilOwnerParity(page, entry.toolId, entry.adapterId);
    expect(observed.fatal, `${entry.toolId}: ${observed.fatal}`).toBeUndefined();
    expect(observed.ownerStatePresent, `${entry.toolId}: the settled provider read and the in-page provider read must agree`).toBe(providerYieldsOwnerState);

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

    results.push({ toolId: entry.toolId, outcome: 'ready', numeric: observed.rendered.numeric, attempts });
  }

  // Non-vacuity guards: the sweep really covered the derived set, and really saw ready panels.
  expect(results.length, 'every wired tool must be swept').toBe(wired.length);
  expect(results.filter((row) => row.outcome === 'ready').length, 'the sweep must observe real ready adapter panels').toBeGreaterThan(0);
  console.log(`TP-15-04 swept ${results.length} wired tools: ${results.map((row) => `${row.toolId}=${row.outcome}(x${row.attempts})`).join(' ')}`);
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

