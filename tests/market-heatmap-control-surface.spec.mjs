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
 *               #sizeSeg and #grpSeg, each keyboard-operable and each visibly
 *               changing the output it owns.
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

/* The page's own end-of-hydration signal. `boot()` marks "loading" and the final
   fetchDelta() marks "ready" — this is the exact transition after which the owner
   provider holds the fully hydrated universe. */
async function awaitOwnerHydration(page) {
  await page.waitForFunction(
    () => document.body.getAttribute('data-heatmap-hydration') === 'ready',
    null,
    { timeout: 240000 }
  );
}

/* Run the PRODUCTION path in-page on the page's live owner state, exactly the way
   the bridge does — same provider seam, same registry definition, same runtime,
   same defaults. It renders nothing, so the panel under assertion is untouched.
   No formula is restated and no expected value is hard-coded here. */
async function productionResultForLiveOwnerState(page, toolId, parameterValues) {
  return page.evaluate(async ({ id, requestedValues }) => {
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
        numeric: projection.state === 'ready' && projection.numericValue !== null
          ? projection.valueText + (projection.unit ? ` ${projection.unit}` : '')
          : null,
        summaryFingerprint: summary ? api.fingerprint(summary) : null,
        pricedCount: summary ? summary.pricedCount : null,
        coverageCount: summary ? summary.coverageCount : null
      };
    } catch (error) {
      return { ok: false, reason: `threw: ${error && error.message}` };
    }
  }, { id: toolId, requestedValues: parameterValues || null });
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
  await page.keyboard.press(key);
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
  /* One full 135-symbol hydration plus an in-page production re-run; the default
     30s budget cannot express that. Generous on purpose — it bounds the run, it
     never relaxes an assertion. */
  test.setTimeout(600000);

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
  expect(verdict.pricedCount, 'terminal hydration must price the complete constituent owner set').toBe(135);
  expect(verdict.coverageCount, 'the owner snapshot must retain all declared constituents').toBe(135);

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
  test.setTimeout(600000);

  await installObservers(page);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto(`${site.baseUrl}/${TOOL_ID}.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'simple');
  await awaitOwnerHydration(page);

  const panel = page.locator('[data-rlexperience-panel="simple"]');
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
  test.setTimeout(600000);

  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  // Direct Power, via the shell's own route hash — not a click-through from Simple.
  await page.goto(`${site.baseUrl}/${TOOL_ID}.html#power`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'power');
  await expect(page.locator('body')).not.toHaveClass(/rlv-focused/);

  await awaitOwnerHydration(page);

  const mapPanel = page.locator('#simpleWrap > .panel').filter({ has: page.locator('#tm') });
  await expect(mapPanel).toHaveCount(1);
  await expect(page.locator('#heatmap-table-panel')).toBeVisible();
  await expect(page.locator('#tbl')).toBeVisible();
  for (const lever of NATIVE_LEVERS) {
    await expect(
      mapPanel.locator(`#${lever.id}`),
      `the single native lever #${lever.id} ("${lever.label}") must be visible inside Map`
    ).toBeVisible();
  }

  requests.length = 0;
  for (const lever of NATIVE_LEVERS) {
    const group = page.locator(`#${lever.id}`);
    const buttons = group.locator('button');
    const count = await buttons.count();
    expect(count, `#${lever.id} must offer more than one setting to be steerable`).toBeGreaterThan(1);

    const selectedBefore = await group.locator('button.on').getAttribute(lever.attribute);
    /* `button:not(.on)`, NOT `filter({hasNot})`: the selected marker is a class on the
       button ITSELF, and hasNot only excludes elements with a matching DESCENDANT — it
       would hand back the already-selected button and the actuation would be a no-op. */
    const target = group.locator('button:not(.on)').first();
    const targetValue = await target.getAttribute(lever.attribute);
    expect(targetValue, `#${lever.id} must offer a setting other than the current one`).not.toBe(selectedBefore);

    const ownedBefore = await page.locator(lever.ownedOutput).textContent();

    // Keyboard operation, not a synthetic click: focus the real button and press Enter.
    await target.focus();
    await expect(target).toBeFocused();
    await page.keyboard.press('Enter');

    // The selected state moved to the actuated setting...
    await expect
      .poll(async () => group.locator('button.on').getAttribute(lever.attribute), { timeout: 20000 })
      .toBe(targetValue);
    // ...and the output this lever owns visibly changed.
    await expect
      .poll(async () => (await page.locator(lever.ownedOutput).textContent()) !== ownedBefore, { timeout: 30000 })
      .toBe(true);
    expect(requests, `#${lever.id} must recompute from the boot-hydrated union without acquisition`).toHaveLength(0);
  }
});
