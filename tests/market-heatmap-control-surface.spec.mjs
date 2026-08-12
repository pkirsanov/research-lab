/*
 * BUG-004 — Market Heatmap control surface, live-stack persistent regression.
 *
 * Three separately-failing discriminators, each with its own persistent title:
 *
 *   SCN-B004-A  A DIRECT Simple cold-open requalifies from honest "unavailable"
 *               to "ready" by itself once the page's own owner hydration lands.
 *               NO mode control is ever clicked.
 *   SCN-B004-B  That ready panel exposes one working control per REGISTRY-declared
 *               model input, and actuating all five recomputes production over the
 *               owner state already loaded (no new data request).
 *   SCN-B004-C  A DIRECT Power open shows the native treemap levers #winSeg,
 *               #sizeSeg and #grpSeg alongside the full treemap and the Power
 *               diagnostics, each keyboard-operable, each visibly changing the
 *               output it owns AND repainting the treemap it steers.
 *
 * WHY THIS FILE EXISTS AT ALL — the anti-masking rule.
 * The pre-existing TP-15-03/TP-15-04 heatmap coverage clicks Power and then
 * Simple before it asserts readiness. That click IS the only refresh the bridge
 * understood, so it manufactured the very signal whose absence is BUG-004 finding
 * F-BUG004-A. Nothing in this file may click a view control before the readiness
 * assertion, and `assertNoModeToggle` proves it did not: an observer installed
 * before page script records EVERY rlviews:change, and any mode other than the
 * booted "simple" fails the test. A future edit that reintroduces a toggle to
 * "make it pass" therefore fails instead.
 *
 * REAL STACK, ZERO INTERCEPTION. Real page, real static server, the page's own
 * hydration from its committed data/bars snapshots. There is NO page.route /
 * context.route / intercept / msw / nock anywhere. `page.addInitScript` and
 * `page.on('request')` are OBSERVERS: they record, they never supply a response.
 *
 * NON-VACUOUS BY CONSTRUCTION. Before requiring the panel to be ready, the test
 * runs the PRODUCTION runtime in-page on the page's live owner state and requires
 * that production itself says "ready". Only then is a panel still showing
 * "unavailable" attributable to the bridge. If the owner evidence were genuinely
 * insufficient the probe reports that instead, so honest unavailability can never
 * be misread as the bug — and the bug can never be excused as honest.
 *
 * RED before the fix:
 *   • SCN-B004-A — production says ready, the panel stays "unavailable" forever.
 *   • SCN-B004-C — body.power hides `.simple-only`, the parent of all three
 *     lever groups, so every `toBeVisible()` fails.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer as startDefaultStaticServer } from './tool-experience.support.mjs';

const TOOL_ID = 'market-heatmap-lab';
const ADAPTER_ID = 'simple-adapter/market-breadth/v1';
const ACTIVE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = resolve(process.env.BUG004_IMMUTABLE_ROOT || ACTIVE_ROOT);
const HISTORICAL_CONTROLS_RED = process.env.BUG004_HISTORICAL_CONTROLS_RED === '1'
  && SOURCE_ROOT !== ACTIVE_ROOT;
/* The native treemap levers, with the output each one owns. Grouping owns the
   sector-breadth panel; window and size own the constituents table. */
const NATIVE_LEVERS = Object.freeze([
  { id: 'winSeg', attribute: 'data-w', ownedOutput: '#tbody', label: 'Color window' },
  { id: 'sizeSeg', attribute: 'data-s', ownedOutput: '#tbody', label: 'Tile size metric' },
  { id: 'grpSeg', attribute: 'data-g', ownedOutput: '#breadth', label: 'Grouping' }
]);

let site;
test.beforeAll(async () => {
  if (SOURCE_ROOT === ACTIVE_ROOT) {
    site = await startDefaultStaticServer();
    return;
  }
  const supportUrl = pathToFileURL(resolve(SOURCE_ROOT, 'tests/provider-credentials.support.mjs')).href;
  const baselineSupport = await import(`${supportUrl}?bug004=${encodeURIComponent(SOURCE_ROOT)}`);
  site = await baselineSupport.startStaticServer();
});
test.afterAll(async () => { if (site) await site.close(); });

/* REGISTRY-DERIVED, never a hand-written parameter list: a registry change joins
   this expectation automatically and a dropped control fails loud. */
function declaredParameters() {
  const registry = JSON.parse(readFileSync(resolve(SOURCE_ROOT, 'simple-models.json'), 'utf8'));
  const definition = registry.definitions
    .find((candidate) => candidate && candidate.toolId === TOOL_ID);
  if (!definition) throw new Error(`no simple-models.json definition for ${TOOL_ID}`);
  return definition.parameterDefinitions || [];
}

function constituentSymbols() {
  const universe = JSON.parse(readFileSync(resolve(SOURCE_ROOT, 'sector-universe.json'), 'utf8'));
  const constituents = new Set();
  for (const sectorId of Object.keys(universe.sectorMap || {})) {
    for (const member of universe.sectorMap[sectorId].constituents || []) constituents.add(member.ticker);
  }
  if (!constituents.size) throw new Error('sector-universe.json exposes no constituents — this test would be vacuous');
  return [...constituents];
}

/* UNIVERSE-DERIVED, never a hand-written ticker list: the symbols the "sectors"
   grouping needs that the "constituents" grouping does not. Because the page boots
   in "constituents", these are exactly the symbols a grouping-scoped hydration
   would have to acquire on the switch — so requiring them to be cached at boot is
   the direct test of "the lever recomputes over evidence already loaded".
   Restricted to symbols with a committed snapshot, mirroring the page's own
   groupMembers() AVAIL filter, so the expectation can never demand a 404. */
function sectorsOnlySymbols() {
  const universe = JSON.parse(readFileSync(resolve(SOURCE_ROOT, 'sector-universe.json'), 'utf8'));
  const available = new Set(
    JSON.parse(readFileSync(resolve(SOURCE_ROOT, 'data/bars/index.json'), 'utf8')).tickers.map((entry) => entry.sym)
  );
  const constituents = new Set(constituentSymbols());
  const sectorsOnly = new Set();
  for (const entry of universe.entries || []) {
    if (!entry || entry.on === false) continue;
    const symbols = entry.type === 'group'
      ? (entry.members || []).filter((member) => available.has(member))
      : (entry.ticker ? [entry.ticker] : []);
    for (const symbol of symbols) if (!constituents.has(symbol) && available.has(symbol)) sectorsOnly.add(symbol);
  }
  if (!sectorsOnly.size) throw new Error('sector-universe.json exposes no sectors-only symbol — this test would be vacuous');
  return [...sectorsOnly];
}

/* Observers only. `__bug004Modes` records every shell view transition so the
   no-toggle claim is PROVEN rather than merely intended. */
async function installObservers(page) {
  await page.addInitScript(() => {
    globalThis.__bug004Modes = [];
    globalThis.addEventListener('rlviews:change', (event) => {
      globalThis.__bug004Modes.push(event && event.detail ? event.detail.mode : null);
    });
  });
}

async function assertNoModeToggle(page) {
  const modes = await page.evaluate(() => globalThis.__bug004Modes || []);
  // The shell's own boot transition into the default view is not a toggle; anything else is.
  expect(modes, 'the shell must have booted into a view').not.toHaveLength(0);
  expect(
    modes.filter((mode) => mode !== 'simple'),
    `the cold-open path must never leave Simple — observed transitions: ${JSON.stringify(modes)}`
  ).toHaveLength(0);
}

/* Observer only. Records every distinct value of the page's own hydration marker.
   `fetchDelta()` sets it to "loading" SYNCHRONOUSLY before it issues anything, so a
   second "loading" is a timing-independent proof that acquisition was started —
   it cannot be missed by a request listener that samples too early. */
async function installHydrationObserver(page) {
  await page.addInitScript(() => {
    globalThis.__bug004Hydration = [];
    const record = () => {
      const value = document.body.getAttribute('data-heatmap-hydration');
      if (value === null) return;
      const seen = globalThis.__bug004Hydration;
      if (!seen.length || seen[seen.length - 1] !== value) seen.push(value);
    };
    const start = () => {
      record();
      new MutationObserver(record).observe(document.body, { attributes: true, attributeFilter: ['data-heatmap-hydration'] });
    };
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
  });
}

/* A BUDGET, NEVER AN ORACLE. Boot hydration now covers the UNION of both groupings,
  beyond the constituents-only boot, and RLDATA rewrites the whole
   cache after every accepted symbol, so per-symbol cost climbs as the cache grows. A
  measured cold open reached the constituent set at 105s but the full union only at 218s, and flipped
   the marker to "ready" at 228s: past the previous 240s budget once browser start-up and a
   loaded host are added. Every symbol resolves from a committed same-origin snapshot and
   the observed marker sequence was exactly ["loading","ready"], so this is arrival latency,
   not a stall. Raising the bound only extends how long we WAIT — never reaching "ready"
   still fails. */
const OWNER_HYDRATION_TIMEOUT_MS = 480000;

/* The page's own end-of-hydration signal. `boot()` marks "loading" and the final
   fetchDelta() marks "ready" — this is the exact transition after which the owner
   provider holds the fully hydrated universe. On expiry it reports what the page actually
   settled on, so a stuck marker (a product hang) can never be misread as a slow host. */
async function awaitOwnerHydration(page) {
  const reached = await page
    .waitForFunction(
      () => document.body.getAttribute('data-heatmap-hydration') === 'ready',
      null,
      { timeout: OWNER_HYDRATION_TIMEOUT_MS }
    )
    .then(() => true)
    .catch(() => false);
  if (reached) return;
  const observed = await page.evaluate(() => ({
    hydration: document.body.getAttribute('data-heatmap-hydration'),
    status: (document.getElementById('status') || {}).textContent || null,
    view: document.body.getAttribute('data-rlview')
  }));
  throw new Error(
    `owner hydration never reached "ready" within ${OWNER_HYDRATION_TIMEOUT_MS}ms. Observed ${JSON.stringify(observed)}. ` +
    'A marker stuck on "loading" with a non-advancing symbol count is a product hang, not a slow host.'
  );
}

/* Pixel fingerprint of the PAINTED treemap. This is what makes "the lever steers the map"
   an assertion rather than an assumption: `drawTreemap()` owns this canvas, and reading it
   back with getImageData proves the actuation reached the rendered output instead of only
   moving a button's selected class. Same-origin canvas, plain read — nothing is stubbed. */
async function treemapFingerprint(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('#tm');
    if (!canvas || typeof canvas.getContext !== 'function' || !canvas.width || !canvas.height) return null;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let hash = 0x811c9dc5;
    for (let index = 0; index < data.length; index += 1) hash = Math.imul(hash ^ data[index], 0x01000193);
    return `${canvas.width}x${canvas.height}:${(hash >>> 0).toString(16)}`;
  });
}

/* Run the PRODUCTION path in-page on the page's live owner state, exactly the way
   the bridge does — same provider seam, same registry definition, same runtime,
   same defaults. It renders nothing, so the panel under assertion is untouched.
   No formula is restated and no expected value is hard-coded here. */
async function productionResultForLiveOwnerState(page, toolId, parameterValues, options = {}) {
  return page.evaluate(async ({ id, requestedValues, renderSimplePanel }) => {
    const providers = globalThis.__rlOwnerStateProvider;
    if (!providers || typeof providers[id] !== 'function') return { fatal: `no owner-state provider registered for ${id}` };
    let ownerState = null;
    try { ownerState = providers[id](); } catch (error) { return { fatal: `owner-state provider threw: ${error && error.message}` }; }
    if (!ownerState) return { fatal: `owner-state provider for ${id} yielded nothing` };

    const registration = globalThis.__rlviewsRegistration;
    const definitions = registration && registration.simpleModels && registration.simpleModels.definitions;
    if (!Array.isArray(definitions)) return { fatal: 'the page exposes no production simple-model registration' };
    const definition = definitions.find((candidate) => candidate && candidate.toolId === id);
    if (!definition) return { fatal: `no registry definition for ${id}` };
    const api = globalThis.RLEXPERIENCE;
    const config = registration.config;
    if (!api || !config) return { fatal: 'the page exposes no production experience api/config' };

    /* The adapter module the PAGE loaded, discovered from the module's OWN declared
       supportedAdapterIds — never a hard-coded global-name map. */
    const moduleNames = [];
    for (const name of Object.getOwnPropertyNames(globalThis)) {
      let candidate;
      try { candidate = globalThis[name]; } catch { continue; }
      if (!candidate || typeof candidate !== 'object') continue;
      if (!Array.isArray(candidate.supportedAdapterIds)) continue;
      if (candidate.supportedAdapterIds.indexOf(definition.adapterId) >= 0) moduleNames.push(name);
    }
    if (moduleNames.length !== 1) return { fatal: `expected exactly one loaded adapter module for ${definition.adapterId}, saw ${JSON.stringify(moduleNames)}` };
    const moduleObject = globalThis[moduleNames[0]];
    const registrars = Object.keys(moduleObject).filter((key) => /^register[A-Za-z]*Adapters$/.test(key) && typeof moduleObject[key] === 'function');
    if (registrars.length !== 1) return { fatal: `expected exactly one register*Adapters export, saw ${JSON.stringify(registrars)}` };

    try {
      /* Immutable-baseline reproduction only. Invoke the PAGE'S OWN low-level
         production bridge after its real hydration so 31ea9942 can reach the
         missing-control assertion without manufacturing a mode transition. */
      if (renderSimplePanel) {
        const panel = document.querySelector('[data-rlexperience-panel="simple"]');
        const tools = registration.registry && registration.registry.tools;
        const tool = Array.isArray(tools) ? tools.find((candidate) => candidate && candidate.id === id) : null;
        if (!panel) return { fatal: 'the page exposes no Simple panel' };
        if (!tool || !tool.experience) return { fatal: `the page exposes no production experience for ${id}` };
        const projection = await api.renderSimpleBridge({
          panel,
          toolId: id,
          toolExperience: tool.experience,
          definition,
          ownerState,
          moduleObject,
          registerFnName: registrars[0],
          adapterId: definition.adapterId,
          api,
          config,
          computedAt: new Date().toISOString()
        });
        if (!projection) return { ok: false, reason: 'bridge-render-returned-null' };
        return { ok: true, state: projection.state, adapter: projection.adapterId };
      }

      const created = api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] });
      if (!created || !created.ok) return { ok: false, reason: 'runtime-create-failed' };
      const runtime = created.value;
      moduleObject[registrars[0]](runtime, api, [definition], { rlvol: globalThis.RLVOL });
      const values = {};
      for (const parameter of definition.parameterDefinitions || []) {
        values[parameter.parameterId] = requestedValues && Object.prototype.hasOwnProperty.call(requestedValues, parameter.parameterId)
          ? requestedValues[parameter.parameterId]
          : parameter.defaultValue;
      }
      const prepared = await runtime.prepare({
        definitionId: definition.definitionId,
        ownerContext: { ownerState },
        parameterValues: values,
        seed: definition.seedPolicy && definition.seedPolicy.required ? definition.seedPolicy.defaultSeed : null,
        scenarioIds: ['baseline'],
        computedAt: new Date().toISOString()
      });
      if (!prepared || !prepared.ok) return { ok: false, reason: 'prepare-rejected' };
      const settled = runtime.snapshot().value;
      const projection = settled.projection;
      const summary = settled.current && settled.current.output && settled.current.output.values
        ? settled.current.output.values.summary
        : null;
      return {
        ok: true,
        state: projection.state,
        adapter: projection.adapterId,
        heading: projection.heading,
        message: projection.message,
        /* The panel renders the READER form of the value line. valueText + unit is the machine
           contract; readableValueText is what the reader sees, and it is what render-parity must
           be checked against. Comparing against the raw pair asserted that the panel prints a
           unit slug at a human. */
        numeric: projection.state === 'ready' && projection.numericValue !== null
          ? (projection.readableValueText || projection.valueText + (projection.unit ? ` ${projection.unit}` : ''))
          : null,
        summaryFingerprint: summary ? api.fingerprint(summary) : null,
        pricedCount: summary ? summary.pricedCount : null,
        coverageCount: summary ? summary.coverageCount : null
      };
    } catch (error) {
      return { ok: false, reason: `threw: ${error && error.message}` };
    }
  }, {
    id: toolId,
    requestedValues: parameterValues || null,
    renderSimplePanel: options.renderSimplePanel === true
  });
}

async function readSimpleControlValues(page) {
  return page.evaluate((id) => {
    const definitions = globalThis.__rlviewsRegistration.simpleModels.definitions;
    const definition = definitions.find((candidate) => candidate && candidate.toolId === id);
    const values = {};
    for (const parameter of definition.parameterDefinitions) {
      const node = document.querySelector(`[data-rlexperience-control-input="${parameter.parameterId}"]`);
      if (!node) throw new Error(`missing control ${parameter.parameterId}`);
      if (parameter.kind === 'enum' || parameter.kind === 'boolean') {
        const option = parameter.domain.options.find((candidate) => String(candidate.value) === String(node.value));
        if (!option) throw new Error(`control ${parameter.parameterId} has undeclared value ${node.value}`);
        values[parameter.parameterId] = option.value;
      } else {
        values[parameter.parameterId] = Number(node.value);
      }
    }
    return values;
  }, TOOL_ID);
}

async function readRenderedSimpleProjection(page) {
  return page.evaluate(() => {
    const host = document.querySelector('[data-rlexperience-panel="simple"]');
    if (!host) return { fatal: 'missing Simple panel' };
    const authoredText = (node) => {
      if (!node) return null;
      const clone = node.cloneNode(true);
      for (const decoration of clone.querySelectorAll('button.rltkr-context')) decoration.remove();
      return clone.textContent;
    };
    const paragraphs = Array.from(host.querySelectorAll('p'))
      .filter((node) => !node.hasAttribute('data-rlexperience-controls-note'));
    return {
      state: host.getAttribute('data-rlexperience-simple-state'),
      adapter: host.getAttribute('data-rlexperience-adapter'),
      heading: authoredText(host.querySelector('h2')),
      message: paragraphs.length ? authoredText(paragraphs[0]) : null,
      numeric: authoredText(host.querySelector('[data-simple-numeric-value]'))
    };
  });
}

function projectionMatches(rendered, produced) {
  return produced.ok
    && rendered.state === produced.state
    && rendered.adapter === produced.adapter
    && rendered.heading === produced.heading
    && rendered.message === produced.message
    && rendered.numeric === produced.numeric;
}

async function actuateSimpleControlWithKeyboard(page, panel, parameter) {
  const control = panel.getByLabel(parameter.label, { exact: true });
  const current = await control.inputValue();
  let target;
  let key;
  if (parameter.kind === 'enum' || parameter.kind === 'boolean') {
    const values = parameter.domain.options.map((option) => String(option.value));
    target = values[values.length - 1] !== current ? values[values.length - 1] : values[0];
    key = target === values[0] ? 'Home' : 'End';
  } else {
    target = String(Number(current) !== parameter.domain.max ? parameter.domain.max : parameter.domain.min);
    key = Number(target) === parameter.domain.min ? 'Home' : 'End';
  }
  expect(target, `${parameter.parameterId}: target must differ from the current value`).not.toBe(current);
  await control.focus();
  await expect(control).toBeFocused();
  await control.press(key);
  await expect.poll(
    () => panel.getByLabel(parameter.label, { exact: true }).inputValue(),
    { timeout: 30000, message: `${parameter.parameterId}: keyboard actuation must reach ${target}` }
  ).toBe(target);
  return target;
}

/* Wait for the panel to reach `ready` WITHOUT touching the page. A timeout here is
   the defect, so the failure message carries what the panel actually settled on. */
async function awaitPanelReadyUntouched(page, timeout) {
  const settled = await page
    .waitForFunction(
      () => {
        const node = document.querySelector('[data-rlexperience-panel="simple"]');
        return node && node.getAttribute('data-rlexperience-simple-state') === 'ready' ? true : null;
      },
      null,
      { timeout }
    )
    .then(() => true)
    .catch(() => false);
  if (settled) return;
  const observed = await page.evaluate(() => {
    const node = document.querySelector('[data-rlexperience-panel="simple"]');
    return {
      state: node ? node.getAttribute('data-rlexperience-simple-state') : '(no panel)',
      adapter: node ? node.getAttribute('data-rlexperience-adapter') : null,
      view: document.body.getAttribute('data-rlview'),
      hydration: document.body.getAttribute('data-heatmap-hydration')
    };
  });
  throw new Error(
    `SCN-B004-A: the Simple panel never requalified on its own. Observed ${JSON.stringify(observed)}. ` +
    'Production accepted the same live owner state, so the panel is stale, not honestly unavailable.'
  );
}

test('BUG-004 SCN-B004-A: direct Simple cold-open requalifies after owner hydration without a mode change', async ({ page }) => {
  /* One full 161-symbol union hydration plus an in-page production re-run; the default
     30s budget cannot express that. Generous on purpose — it bounds the run, it
     never relaxes an assertion. */
  test.setTimeout(900000);

  await installObservers(page);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto(`${site.baseUrl}/${TOOL_ID}.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();

  // Cold open lands in Simple and STAYS there: nothing below clicks a view control.
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'simple');
  await expect(page.locator('body')).toHaveClass(/rlv-focused/);

  const panel = page.locator('[data-rlexperience-panel="simple"]');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('data-rlexperience-simple-state', 'unavailable');

  await awaitOwnerHydration(page);

  /* NON-VACUITY GATE. Production must accept this live owner state before the
     panel is required to be ready; otherwise "unavailable" would be the honest
     answer and this test would be asserting a falsehood. */
  const verdict = await productionResultForLiveOwnerState(page, TOOL_ID, null);
  expect(verdict.fatal, `owner probe failed: ${verdict.fatal}`).toBeUndefined();
  expect(
    verdict.ok,
    `production could not run on the hydrated owner state (${verdict.reason}) — cold-open readiness is not assertable`
  ).toBe(true);
  expect(verdict.state, 'production must accept the hydrated owner state for this assertion to be meaningful').toBe('ready');
  expect(verdict.adapter).toBe(ADAPTER_ID);
  const expectedConstituentCount = constituentSymbols().length;
  expect(verdict.pricedCount, 'terminal hydration must price the complete constituent owner set').toBe(expectedConstituentCount);
  expect(verdict.coverageCount, 'the owner snapshot must retain all declared constituents').toBe(expectedConstituentCount);

  // THE DISCRIMINATOR: no click, no reload, no synthetic event — the panel must catch up on its own.
  await awaitPanelReadyUntouched(page, 60000);

  await expect(panel).toHaveAttribute('data-rlexperience-simple-state', 'ready');
  await expect(panel).toHaveAttribute('data-rlexperience-adapter', ADAPTER_ID);
  await expect(panel.locator('[data-simple-numeric-value]')).toBeVisible();

  // Still Simple, and provably never toggled.
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'simple');
  await assertNoModeToggle(page);
});

test('BUG-004 SCN-B004-B: ready Simple applies all five registry controls with owner parity and zero post-hydration requests', async ({ page }) => {
  test.setTimeout(900000);

  await installObservers(page);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto(`${site.baseUrl}/${TOOL_ID}.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'simple');
  await awaitOwnerHydration(page);

  const panel = page.locator('[data-rlexperience-panel="simple"]');
  if (HISTORICAL_CONTROLS_RED) {
    const historical = await productionResultForLiveOwnerState(
      page,
      TOOL_ID,
      null,
      { renderSimplePanel: true }
    );
    expect(historical.fatal, `historical production bridge failed: ${historical.fatal}`).toBeUndefined();
    expect(historical.ok, `historical production bridge did not render (${historical.reason})`).toBe(true);
    expect(historical.state, 'historical production bridge must reach ready before control assertions').toBe('ready');
    expect(historical.adapter).toBe(ADAPTER_ID);
  }
  await awaitPanelReadyUntouched(page, 60000);
  await expect(panel).toHaveAttribute('data-rlexperience-adapter', ADAPTER_ID);
  await assertNoModeToggle(page);

  const declared = declaredParameters();
  expect(declared.map((parameter) => parameter.parameterId)).toEqual([
    'window',
    'grouping',
    'size-metric',
    'breadth-threshold',
    'outlier-sigma'
  ]);
  await expect(panel.locator('[data-rlexperience-controls="parameters"]')).toHaveCount(1);
  await expect(panel.locator('[data-rlexperience-control-input]')).toHaveCount(declared.length);
  for (const parameter of declared) {
    const control = panel.getByLabel(parameter.label, { exact: true });
    await expect(control, `${parameter.parameterId}: registry-declared accessible name`).toBeVisible();
    if (parameter.kind === 'enum' || parameter.kind === 'boolean') {
      expect(await control.locator('option').evaluateAll((nodes) => nodes.map((node) => node.value))).toEqual(
        parameter.domain.options.map((option) => String(option.value))
      );
    } else {
      expect(await control.evaluate((node) => ({ min: Number(node.min), max: Number(node.max), step: Number(node.step) }))).toEqual({
        min: parameter.domain.min,
        max: parameter.domain.max,
        step: parameter.domain.step
      });
    }
  }

  requests.length = 0;
  let previousValues = await readSimpleControlValues(page);
  let previousProduction = await productionResultForLiveOwnerState(page, TOOL_ID, previousValues);
  expect(previousProduction.ok, `initial production parity failed (${previousProduction.reason})`).toBe(true);
  expect(projectionMatches(await readRenderedSimpleProjection(page), previousProduction)).toBe(true);

  for (const parameter of declared) {
    const target = await actuateSimpleControlWithKeyboard(page, panel, parameter);
    const nextValues = await readSimpleControlValues(page);
    expect(String(nextValues[parameter.parameterId]), `${parameter.parameterId}: model input changed`).toBe(target);
    const nextProduction = await productionResultForLiveOwnerState(page, TOOL_ID, nextValues);
    expect(nextProduction.ok, `${parameter.parameterId}: production recompute failed (${nextProduction.reason})`).toBe(true);
    expect(
      nextProduction.summaryFingerprint,
      `${parameter.parameterId}: the declared output must change, not merely the control label`
    ).not.toBe(previousProduction.summaryFingerprint);
    await expect.poll(
      async () => projectionMatches(await readRenderedSimpleProjection(page), nextProduction),
      { timeout: 30000, message: `${parameter.parameterId}: rendered panel must equal production over the same inputs` }
    ).toBe(true);
    expect(requests, `${parameter.parameterId}: Simple recompute must issue no request`).toHaveLength(0);
    previousValues = nextValues;
    previousProduction = nextProduction;
  }

  await assertNoModeToggle(page);
});

test('BUG-004 SCN-B004-C: direct Power applies native treemap controls with zero post-hydration requests', async ({ page }) => {
  test.setTimeout(900000);

  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  // Direct Power, via the shell's own route hash — not a click-through from Simple.
  await page.goto(`${site.baseUrl}/${TOOL_ID}.html#power`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'power');
  await expect(page.locator('body')).not.toHaveClass(/rlv-focused/);

  await awaitOwnerHydration(page);

  /* THE AUTHORED CONTRACT, NOT THE MARKUP SHAPE. bug.md Expected Behavior #3 is "Power
     exposes the native heatmap controls #winSeg, #sizeSeg, and #grpSeg ALONGSIDE the full
     treemap and diagnostics". "Alongside" is co-presence in the Power view; neither spec.md
     nor design.md states any containment requirement. Asserting a shared DOM ancestor would
     test nesting instead — and would contradict the shipped fix, which deliberately keeps
     the levers OUT of the `.simple-only` block precisely so Power can drop the Simple
     verdict copy while keeping the levers (see the markup comment in market-heatmap-lab.html).
     So the requirement is asserted as: every lever visible (that IS finding F-BUG004-C —
     Power hid all three), the full treemap visible in the same view, the Power diagnostics
     visible, and — in the loop below — every lever provably steering the rendered output. */
  await expect(page.locator('#tm'), 'the full treemap must be visible alongside the levers').toBeVisible();
  await expect(page.locator('#heatmap-table-panel')).toBeVisible();
  await expect(page.locator('#tbl')).toBeVisible();
  for (const lever of NATIVE_LEVERS) {
    const group = page.locator(`#${lever.id}`);
    await expect(group, `#${lever.id} ("${lever.label}") must exist exactly once`).toHaveCount(1);
    await expect(
      group,
      `the native lever #${lever.id} ("${lever.label}") must be visible in Power — F-BUG004-C hid all three`
    ).toBeVisible();
  }

  requests.length = 0;
  for (const lever of NATIVE_LEVERS) {
    const group = page.locator(`#${lever.id}`);
    const buttons = group.locator('button');
    const count = await buttons.count();
    expect(count, `#${lever.id} must offer more than one setting to be steerable`).toBeGreaterThan(1);

    const selectedBefore = await group.locator('button.on').getAttribute(lever.attribute);
    const semanticBefore = await buttons.evaluateAll((nodes) => nodes.map((node) => ({
      value: node.getAttribute([...node.attributes].find((attribute) => attribute.name.startsWith('data-'))?.name || ''),
      pressed: node.getAttribute('aria-pressed'),
      selected: node.classList.contains('on')
    })));
    expect(
      semanticBefore.filter((entry) => entry.pressed === 'true'),
      `#${lever.id}: exactly one button must expose aria-pressed="true" before actuation`
    ).toHaveLength(1);
    expect(
      semanticBefore.filter((entry) => entry.pressed === 'false'),
      `#${lever.id}: every alternative must expose aria-pressed="false" before actuation`
    ).toHaveLength(count - 1);
    expect(
      semanticBefore.filter((entry) => entry.pressed !== 'true' && entry.pressed !== 'false'),
      `#${lever.id}: aria-pressed must be explicit on every native button`
    ).toEqual([]);
    expect(
      await group.locator('button[aria-pressed="true"]').getAttribute(lever.attribute),
      `#${lever.id}: semantic selection must agree with the existing .on selection`
    ).toBe(selectedBefore);
    /* `button:not(.on)`, NOT `filter({hasNot})`: the selected marker is a class on the
       button ITSELF, and hasNot only excludes elements with a matching DESCENDANT — it
       would hand back the already-selected button and the actuation would be a no-op. */
    const targetIndex = semanticBefore.findIndex((entry) => !entry.selected);
    expect(targetIndex, `#${lever.id}: target must belong to its native button group`).toBeGreaterThanOrEqual(0);
    const target = buttons.nth(targetIndex);
    const targetValue = await target.getAttribute(lever.attribute);
    expect(targetValue, `#${lever.id} must offer a setting other than the current one`).not.toBe(selectedBefore);
    await expect(target, `#${lever.id}: an alternative must be semantically unselected before actuation`).toHaveAttribute('aria-pressed', 'false');

    const ownedBefore = await page.locator(lever.ownedOutput).textContent();
    const treemapBefore = await treemapFingerprint(page);
    expect(treemapBefore, `#${lever.id}: the treemap must already be painted before actuation`).not.toBeNull();

    // Enter the target through keyboard modality so :focus-visible is meaningful.
    const adjacentIndex = targetIndex === 0 ? 1 : targetIndex - 1;
    const adjacent = buttons.nth(adjacentIndex);
    await adjacent.focus();
    await expect(adjacent).toBeFocused();
    await page.keyboard.press(targetIndex === 0 ? 'Shift+Tab' : 'Tab');
    await expect(target).toBeFocused();
    await page.keyboard.press('Enter');

    // The selected state moved to the actuated setting...
    await expect
      .poll(async () => group.locator('button.on').getAttribute(lever.attribute), { timeout: 20000 })
      .toBe(targetValue);
    await expect
      .poll(async () => group.locator('button[aria-pressed="true"]').getAttribute(lever.attribute), {
        timeout: 20000,
        message: `#${lever.id}: keyboard Enter must move aria-pressed="true" to the target`
      })
      .toBe(targetValue);
    const semanticAfter = await buttons.evaluateAll((nodes) => nodes.map((node) => ({
      pressed: node.getAttribute('aria-pressed'),
      selected: node.classList.contains('on')
    })));
    expect(
      semanticAfter.filter((entry) => entry.pressed === 'true' && entry.selected),
      `#${lever.id}: exactly one target must own both semantic and visual selection after Enter`
    ).toHaveLength(1);
    expect(
      semanticAfter.filter((entry) => entry.pressed === 'false' && !entry.selected),
      `#${lever.id}: every former/alternative button must be aria-pressed="false" after Enter`
    ).toHaveLength(count - 1);
    const focusRing = await target.evaluate((node) => {
      const style = getComputedStyle(node);
      const color = style.outlineColor;
      const rgba = color.match(/^rgba?\([^)]*,\s*([0-9.]+)\)$/i);
      return {
        matchesFocusVisible: node.matches(':focus-visible'),
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
        outlineColor: color,
        transparent: color === 'transparent' || (rgba ? Number(rgba[1]) === 0 : false)
      };
    });
    expect(focusRing.matchesFocusVisible, `#${lever.id}: keyboard target must match :focus-visible`).toBe(true);
    expect(focusRing.outlineStyle, `#${lever.id}: focus-visible outline style must be painted`).not.toBe('none');
    expect(focusRing.outlineWidth, `#${lever.id}: focus-visible outline must be at least 2 CSS pixels`).toBeGreaterThanOrEqual(2);
    expect(focusRing.transparent, `#${lever.id}: focus-visible outline color ${focusRing.outlineColor} must be non-transparent`).toBe(false);
    // ...the output this lever owns visibly changed...
    await expect
      .poll(async () => (await page.locator(lever.ownedOutput).textContent()) !== ownedBefore, { timeout: 30000 })
      .toBe(true);
    /* ...and the TREEMAP ITSELF repainted differently. This is the assertion that makes
       "the levers steer the map" real: without it a lever could pass by changing only a
       side panel while the map it owns stayed frozen. */
    await expect
      .poll(async () => (await treemapFingerprint(page)) !== treemapBefore, {
        timeout: 30000,
        message: `#${lever.id} ("${lever.label}") must repaint the treemap it steers, not just its own label`
      })
      .toBe(true);
    expect(requests, `#${lever.id} must recompute from the boot-hydrated union without acquisition`).toHaveLength(0);
  }
});

test('BUG-004 SCN-B004-D: boot hydrates the union of both groupings, so the grouping lever acquires nothing', async ({ page }) => {
  /* Grouping is one of the five declared Simple levers, and BUG-004 Expected Behavior #4
     says a lever "changes real production computation over already-loaded owner data.
     Lever changes do not refetch data." The page booted in "constituents", so if
     hydration were scoped to the CURRENT grouping the switch to "sectors" would have to
     acquire every sectors-only symbol. This test asserts the union directly (the symbols
     are cached before the lever is touched) AND that actuating the lever acquires nothing. */
  test.setTimeout(900000);

  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await installHydrationObserver(page);

  // Power: the native grouping lever is operable here, exactly as SCN-B004-C establishes.
  await page.goto(`${site.baseUrl}/${TOOL_ID}.html#power`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'power');
  await awaitOwnerHydration(page);
  await page.waitForLoadState('networkidle');

  const grouping = page.locator('#grpSeg');
  const bootedGrouping = await grouping.locator('button.on').getAttribute('data-g');
  expect(bootedGrouping, 'the page must boot into a concrete grouping').not.toBeNull();

  /* THE UNION DISCRIMINATOR. Read through the page's OWN cache accessor — no fetch, no
     interception — and require a cached bar series for every symbol only the OTHER
     grouping needs. A grouping-scoped hydration leaves these null. */
  const sectorsOnly = sectorsOnlySymbols();
  const uncached = await page.evaluate((symbols) => {
    if (!globalThis.RLDATA || typeof RLDATA.bars !== 'function') return { fatal: 'the page exposes no RLDATA.bars cache accessor' };
    return { missing: symbols.filter((symbol) => !(RLDATA.bars(symbol, '1d') || []).length) };
  }, sectorsOnly);
  expect(uncached.fatal, `cache probe failed: ${uncached.fatal}`).toBeUndefined();
  expect(
    uncached.missing,
    `boot hydrated only the "${bootedGrouping}" grouping. Switching grouping would have to acquire ` +
    `${uncached.missing ? uncached.missing.length : '?'} of ${sectorsOnly.length} sectors-only symbols ` +
    `(${JSON.stringify(uncached.missing)}), so the grouping lever is not a pure recompute.`
  ).toEqual([]);

  const hydrationBefore = await page.evaluate(() => globalThis.__bug004Hydration.slice());
  expect(hydrationBefore[hydrationBefore.length - 1], 'boot hydration must have settled before the lever is touched').toBe('ready');

  const breadthBefore = await page.locator('#breadth').textContent();
  requests.length = 0;

  // Keyboard operation of the real lever — no synthetic click, no injected event.
  const target = grouping.locator('button:not(.on)').first();
  const targetValue = await target.getAttribute('data-g');
  expect(targetValue, '#grpSeg must offer a grouping other than the booted one').not.toBe(bootedGrouping);
  await target.focus();
  await expect(target).toBeFocused();
  await page.keyboard.press('Enter');

  await expect
    .poll(async () => grouping.locator('button.on').getAttribute('data-g'), { timeout: 20000 })
    .toBe(targetValue);
  // The declared output actually recomputed — this is a real model change, not a label swap.
  await expect
    .poll(async () => (await page.locator('#breadth').textContent()) !== breadthBefore, { timeout: 30000 })
    .toBe(true);

  /* Settle any request the actuation could have issued so the count below cannot pass by
     sampling too early; `networkidle` waits for the network to go quiet, it intercepts nothing. */
  await page.waitForLoadState('networkidle');

  expect(
    await page.evaluate(() => globalThis.__bug004Hydration.slice()),
    'the grouping lever must not re-enter hydration — a second "loading" is an acquisition'
  ).toEqual(hydrationBefore);
  expect(
    requests,
    `the grouping lever must issue no request; observed ${requests.length}: ${JSON.stringify(requests.slice(0, 8))}`
  ).toHaveLength(0);
});
