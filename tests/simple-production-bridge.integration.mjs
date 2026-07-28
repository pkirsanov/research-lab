/*
 * TP-15-02 — Scope 15 production Simple-view bridge INTEGRATION loop.
 *
 * SCN-012-038 / SCN-012-040. Scope 15 wires real tool pages into the production Simple view by
 * registering a page-owned owner-state provider (`globalThis.__rlOwnerStateProvider[toolId]`) that
 * the shared production bridge (`RLEXPERIENCE.renderSimpleBridge`) consumes. TP-15-01
 * (simple-production-bridge.unit.mjs) proves the BRIDGE DECISION on one adapter. This suite proves
 * the WIRED-TOOL SET end-to-end:
 *
 *   registry-derived wired set → owner state → REAL runtime.prepare → ready projection painted into
 *   a REAL panel host → the Simple facts EQUAL the owner/Power-path values.
 *
 * REGISTRY-DERIVED, NEVER A HARD-CODED TOOL LIST. The loop membership is computed from two
 * production sources of truth:
 *   1. `simple-models.json` — the Simple model registry (toolId → definitionId/adapterId/adapterModule);
 *   2. the production tool PAGES themselves — a tool is "wired" iff `<toolId>.html` registers
 *      `globalThis.__rlOwnerStateProvider["<toolId>"]`.
 * A tool wired in a FUTURE batch is therefore picked up automatically. The suite FAILS LOUD (never
 * silently skips) if a newly-wired tool has no owner-state builder or no owner-parity extractor
 * here, so coverage can never silently lag the wiring.
 *
 * The per-tool EXPECTATION is also registry-derived, not hard-coded: a definition whose declared
 * `limitations` state that the adapter must return unavailable (the proven-incomplete
 * technical-five-gate owner model) is asserted to degrade HONESTLY; every other wired definition is
 * asserted to reach a REAL ready projection.
 *
 * NODE, NO BROWSER, NO INTERCEPTION. The REAL production adapter UMD modules are required and
 * registered into the REAL production runtime (rlexperience.js); owner states are built NODE-SIDE
 * from the REAL production module reducers and the REAL same-origin bar snapshots the owning pages
 * themselves read (data/bars/*.json) — no formula is copied and no owner RESULT is fabricated.
 * Owner-parity is proven by calling the module's own EXPORTED owner summary function (the single
 * source the Power path renders from) on the SAME owner state and the SAME parameter values, so a
 * drift between the Simple read and the Power read fails this suite.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { loadProductionApi, readJson } from './tool-experience.support.mjs';

const require = createRequire(import.meta.url);
const ROOT = new URL('../', import.meta.url);

const COMPUTED_AT = '2026-07-25T20:02:00.000Z';

/* ═══════════════════════ production sources of truth ═══════════════════════ */

function loadModule(relativePath) {
  const path = require.resolve(new URL(relativePath, ROOT).pathname);
  delete require.cache[path];
  return require(path);
}

function readPage(relativePath) {
  const url = new URL(relativePath, ROOT);
  return existsSync(url) ? readFileSync(url, 'utf8') : null;
}

/* A tool is WIRED iff its production page registers the owner-state provider the shared bridge
   reads. This is derived from the deployed page source — the same fact rlapp.js keys its
   provider-gated ownerModes on — so a tool wired in a future batch joins this loop automatically. */
function pageRegistersProvider(toolId) {
  const source = readPage(`${toolId}.html`);
  if (!source) return false;
  return source.includes(`__rlOwnerStateProvider["${toolId}"]`)
    || source.includes(`__rlOwnerStateProvider['${toolId}']`);
}

/* Whether the tool's OWN production page loads its adapter module <script>. This is the exact fact
   the deployed bridge keys on: installSimpleProjectionBridge (rlexperience.js) hands
   renderSimpleBridge `globalThis[ADAPTER_MODULE_BINDINGS[adapterModule].global]`, and that UMD
   global exists on a page ONLY if that page loaded the module. No shared shell script injects an
   adapter module (rlapp.js / rlnav.js / rlviews.js reference none of the adapter module paths), so
   the page's own <script src> tag is the whole truth. Derived from the deployed page — never a
   hard-coded tool-name list, so a tool that starts (or stops) loading its module is reclassified
   automatically. */
function pageLoadsAdapterModule(toolId, adapterModule) {
  const source = readPage(`${toolId}.html`);
  if (!source || !adapterModule) return false;
  return source.includes(`src="${adapterModule}"`) || source.includes(`src='${adapterModule}'`);
}

/* The registry-declared expectation for a definition: a model whose own declared limitations say the
   adapter must return unavailable (proven-incomplete owner model) may never publish a signal. */
function registryDeclaresUnavailable(definition) {
  const limitations = Array.isArray(definition.limitations) ? definition.limitations : [];
  return limitations.some((limitation) => /must return unavailable/i.test(String(limitation)));
}

/* The module's registrar, derived from the module's OWN exports — never a hard-coded name map. */
function resolveRegistrar(moduleObject) {
  const names = Object.keys(moduleObject).filter((key) => /^register[A-Za-z]*Adapters$/.test(key) && typeof moduleObject[key] === 'function');
  assert.equal(names.length, 1, `exactly one register*Adapters export expected, saw ${JSON.stringify(names)}`);
  return names[0];
}

/* Registry-default parameter values. A parameter the registry declares `evidence-derived` carries a
   null default ON PURPOSE ("no value is substituted") — in production the owning page supplies it
   from source-qualified evidence. To exercise the run path here we sample the parameter's OWN
   DECLARED DOMAIN (the smallest strictly-positive in-domain step), so the value is registry-derived
   rather than an invented literal, and it stays valid for any future evidence-derived parameter.
   This supplies an INPUT only: no owner RESULT is substituted, and every assertion below still
   compares the Simple output against the owner function's own output on this same input. */
function domainSample(parameter) {
  const domain = parameter.domain || {};
  if (Array.isArray(domain.options) && domain.options.length) return domain.options[0].value;
  if (Number.isFinite(domain.min)) {
    const step = Number.isFinite(domain.step) && domain.step > 0 ? domain.step : 1;
    return domain.min > 0 ? domain.min : Math.round((domain.min + step) * 1e6) / 1e6;
  }
  throw new Error(`cannot derive an in-domain sample for parameter ${parameter.parameterId}`);
}

function registryDefaults(definition) {
  const values = {};
  for (const parameter of definition.parameterDefinitions || []) {
    values[parameter.parameterId] = (parameter.defaultSource === 'evidence-derived' && parameter.defaultValue === null)
      ? domainSample(parameter)
      : parameter.defaultValue;
  }
  return values;
}

function registrySeed(definition) {
  return (definition.seedPolicy && definition.seedPolicy.required) ? definition.seedPolicy.defaultSeed : null;
}

function frozenClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/* ═══════════════════════ REAL owner states (real modules + real snapshots) ═══════════════════════ */

/* The REAL same-origin daily snapshot the owning pages read (swing-structure-lab hydrates
   state.full from exactly this file). Real observed market rows — never fabricated values. */
function realDailyRows(symbol) {
  const url = new URL(`data/bars/${symbol}.json`, ROOT);
  assert.equal(existsSync(url), true, `real daily snapshot required: data/bars/${symbol}.json`);
  const snapshot = JSON.parse(readFileSync(url, 'utf8'));
  const rows = Array.isArray(snapshot.rows) ? snapshot.rows : [];
  assert.ok(rows.length >= 250, `data/bars/${symbol}.json must carry a full daily window (saw ${rows.length} rows)`);
  return rows;
}

/* market-breadth owner state — built by the REAL module reducer (ms.reduceOwnerState) over REAL
   same-origin daily snapshots, exactly as market-heatmap-lab.html's provider does. */
function breadthOwnerState() {
  const ms = loadModule('rlexperience-adapters/market-structure.js');
  const members = [
    { ticker: 'AAPL', sector: 'Tech', industry: 'Hardware', weight: 0.25 },
    { ticker: 'MSFT', sector: 'Tech', industry: 'Software', weight: 0.25 },
    { ticker: 'NVDA', sector: 'Tech', industry: 'Semis', weight: 0.20 },
    { ticker: 'JPM', sector: 'Fin', industry: 'Banks', weight: 0.15 },
    { ticker: 'XOM', sector: 'Energy', industry: 'Integrated', weight: 0.15 }
  ].filter((member) => existsSync(new URL(`data/bars/${member.ticker}.json`, ROOT)));
  assert.ok(members.length >= 3, 'at least three real constituent snapshots are required for a breadth owner state');
  const rowsByTicker = new Map(members.map((member) => [member.ticker, realDailyRows(member.ticker)]));
  return ms.reduceOwnerState({
    asOf: '2026-07-25T20:00:00.000Z',
    source: 'same-origin daily snapshot (data/bars)',
    constituents: members,
    barsReader: (ticker) => rowsByTicker.get(ticker) || null
  });
}

/* swing-transition owner state — the SAME shape swing-structure-lab.html's provider publishes
   (contractVersion + full daily rows + macro), carrying the REAL same-origin daily rows the page
   itself hydrates into state.full. */
function swingOwnerState() {
  const full = realDailyRows('SPY');
  return {
    contractVersion: 'swing-transition-owner-state/v1',
    toolId: 'swing-structure-lab',
    symbol: 'SPY',
    asOf: new Date(full[full.length - 1].t).toISOString(),
    source: 'same-origin daily snapshot (data/bars)',
    full,
    macro: { fg: { score: 70, band: 'Greed' }, vix: 15.5 }
  };
}

/* session-auction owner state — intraday session bars have NO same-origin snapshot in this repo
   (that is precisely why intraday-tape-lab.html's provider truthfully returns null on an unhydrated
   page), so the sessions are generated deterministically here. These are owner INPUT bars, never an
   owner RESULT: every asserted number below is compared against the owner function's own output. */
function sessionBarsForDay(dayIndex, base) {
  const bars = [];
  const startT = Date.UTC(2026, 6, 20 + dayIndex, 13, 30, 0);
  let c = base;
  for (let i = 0; i < 40; i += 1) {
    const o = c;
    const delta = 0.03 + ((i % 3) - 1) * 0.06;
    c = Math.round((o + delta) * 1e6) / 1e6;
    const pad = i === 0 ? 0.02 : (i === 3 ? 0.35 : 0.10);
    const h = Math.round((Math.max(o, c) + pad) * 1e6) / 1e6;
    const l = Math.round((Math.min(o, c) - pad) * 1e6) / 1e6;
    bars.push({ t: startT + i * 5 * 60000, o, h, l, c, v: 500 + (i % 5) * 120 });
  }
  return bars;
}
function sessionOwnerState() {
  const bases = [97.2, 97.8, 98.1, 98.6, 99.0, 100.0];
  const sessions = bases.map((base, index) => ({ key: `2026-07-${20 + index}`, bars: sessionBarsForDay(index, base) }));
  const today = sessions[sessions.length - 1].bars;
  const prior = sessions[sessions.length - 2].bars;
  const gap = Math.round(((today[0].o - prior[prior.length - 1].c) / prior[prior.length - 1].c) * 1e6) / 1e6;
  return {
    contractVersion: 'session-auction-owner-state/v1',
    toolId: 'intraday-tape-lab',
    symbol: 'SPY',
    asOf: new Date(today[today.length - 1].t).toISOString(),
    ivMin: 5,
    source: 'generated session snapshot (no same-origin intraday cache exists)',
    gap,
    gamma: { callWall: 100.6, putWall: 99.4, flip: 100.0 },
    sessions
  };
}

/* technical-five-gate owner state — the foundation-receipt-only shape
   technical-analysis-decision-lab.html publishes. Its registry limitations declare the adapter must
   return unavailable rather than reinterpret this receipt as a signal. */
function technicalOwnerState() {
  return {
    contractVersion: 'technical-foundation-owner-state/v1',
    toolId: 'technical-analysis-decision-lab',
    symbol: 'SPY',
    asOf: '2026-07-25T20:00:00.000Z',
    source: 'same-origin foundation receipt',
    foundationReceipt: {
      present: true,
      name: 'Weekly close integrity',
      session: 'XNYS venue-local weekly boundary',
      primary: 'Primary 1w closed plus provisional',
      ownerReadPublished: false
    }
  };
}

/* Owner-state builders keyed by the REGISTRY adapter id. A wired tool with no entry FAILS LOUD. */
const OWNER_STATES = {
  'simple-adapter/market-breadth/v1': breadthOwnerState,
  'simple-adapter/session-auction/v1': sessionOwnerState,
  'simple-adapter/swing-transition/v1': swingOwnerState,
  'simple-adapter/technical-five-gate/v1': technicalOwnerState
};

/* ═══════════════════════ owner-parity extractors (the Power-path single source) ═══════════════════════
   Each extractor calls the adapter module's OWN EXPORTED owner summary function — the single source
   the owning page's Power view renders from — on the SAME owner state and the SAME parameter values
   the Simple run used, and returns the facts the Simple projection is expected to publish. No
   formula is reimplemented here: a divergence between Simple and Power fails the assertion. */
const OWNER_PARITY = {
  'simple-adapter/market-breadth/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeBreadthSummary(frozenClone(ownerState), parameterValues);
    return {
      ownerFunction: 'computeBreadthSummary',
      numericValue: summary.breadth.pct,
      valueText: summary.leadership.state === 'broad' ? 'Broad leadership' : 'Narrow leadership',
      summaryContains: [String(summary.breadth.pct), String(summary.leadership.threshold)]
    };
  },
  'simple-adapter/session-auction/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeSessionAuctionSummary(frozenClone(ownerState), parameterValues);
    const ready = summary.state === 'ready';
    return {
      ownerFunction: 'computeSessionAuctionSummary',
      numericValue: ready && Number.isFinite(summary.levels.vwap) ? summary.levels.vwap : null,
      valueText: ready ? summary.sessionType.ownerType : 'Session evidence unavailable',
      summaryContains: ready ? [summary.sessionType.ownerType, summary.control.label] : []
    };
  },
  'simple-adapter/swing-transition/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeSwingTransitionSummary(frozenClone(ownerState), parameterValues);
    const ready = summary.state === 'ready';
    return {
      ownerFunction: 'computeSwingTransitionSummary',
      numericValue: ready && Number.isFinite(summary.swingState.fast) ? summary.swingState.fast : null,
      valueText: ready ? summary.swingState.label : 'Swing evidence unavailable',
      summaryContains: ready ? [summary.swingState.label, summary.pattern.ownerPattern, summary.regime.band] : []
    };
  },
  'simple-adapter/technical-five-gate/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeTechnicalFiveGateSummary(frozenClone(ownerState), parameterValues);
    // The proven-incomplete owner model publishes NO signal: parity here means "Simple publishes the
    // same absence Power does", so the expected numeric is null on both sides.
    return {
      ownerFunction: 'computeTechnicalFiveGateSummary',
      numericValue: null,
      valueText: null,
      summaryContains: [],
      ownerPublishesNoRead: summary.state !== 'ready'
    };
  }
};

/* ═══════════════════════ minimal DOM host (same shape as TP-15-01) ═══════════════════════ */

function makeElement(tagName, ownerDocument) {
  return {
    tagName,
    ownerDocument,
    textContent: '',
    className: '',
    hidden: true,
    _attrs: Object.create(null),
    _children: [],
    setAttribute(name, value) { this._attrs[name] = String(value); },
    getAttribute(name) { return Object.prototype.hasOwnProperty.call(this._attrs, name) ? this._attrs[name] : null; },
    appendChild(child) { this._children.push(child); return child; },
    findByAttribute(name) {
      for (const child of this._children) if (Object.prototype.hasOwnProperty.call(child._attrs, name)) return child;
      return null;
    },
    renderedText() { return this._children.map((child) => child.textContent).join(' '); }
  };
}

function makePanel() {
  const bodyClassOps = [];
  const documentRef = {
    createElement: (tag) => makeElement(tag, documentRef),
    body: {
      classList: {
        add: (name) => bodyClassOps.push(['add', name]),
        remove: (name) => bodyClassOps.push(['remove', name]),
        toggle: (name, force) => bodyClassOps.push(['toggle', name, force])
      }
    }
  };
  globalThis.document = documentRef;
  return { panel: makeElement('section', documentRef), bodyClassOps };
}

/* ═══════════════════════ the registry-derived wired set ═══════════════════════ */

function wiredTools() {
  const registry = readJson('simple-models.json');
  return registry.definitions
    .filter((definition) => pageRegistersProvider(definition.toolId))
    .map((definition) => ({
      toolId: definition.toolId,
      definition,
      adapterId: definition.adapterId,
      adapterModule: definition.adapterModule,
      declaredUnavailable: registryDeclaresUnavailable(definition),
      pageLoadsModule: pageLoadsAdapterModule(definition.toolId, definition.adapterModule)
    }));
}

/* Drive ONE wired tool through the REAL production runtime and paint the REAL panel. */
async function driveWiredTool(entry, ownerStateOverride) {
  const api = loadProductionApi();
  const config = readJson('tool-experience.config.json');
  const moduleObject = loadModule(entry.adapterModule);
  const registrar = resolveRegistrar(moduleObject);
  const parameterValues = registryDefaults(entry.definition);
  const ownerState = ownerStateOverride === undefined ? OWNER_STATES[entry.adapterId]() : ownerStateOverride;

  const { panel, bodyClassOps } = makePanel();
  const runtime = api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [entry.definition] }).value;
  const registered = moduleObject[registrar](runtime, api, [entry.definition], { rlvol: loadModule('rlvol.js') });

  const prepared = await runtime.prepare({
    definitionId: entry.definition.definitionId,
    ownerContext: { ownerState },
    parameterValues,
    seed: registrySeed(entry.definition),
    scenarioIds: ['baseline'],
    computedAt: COMPUTED_AT
  });

  let projection = null;
  if (prepared.ok) {
    projection = runtime.snapshot().value.projection;
    api.renderSimpleProjection(panel, projection);
  }

  return { api, config, moduleObject, registrar, parameterValues, ownerState, panel, bodyClassOps, registered, prepared, projection };
}

/* ═══════════════════════ tests ═══════════════════════ */

test('TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list)', () => {
  const registry = readJson('simple-models.json');
  const wired = wiredTools();

  assert.ok(wired.length > 0, 'at least one tool must be wired into the production Simple view');
  // Every wired tool is a real registry definition carrying the adapter wiring the loop needs.
  for (const entry of wired) {
    assert.equal(typeof entry.definition.definitionId, 'string');
    assert.equal(typeof entry.adapterId, 'string');
    assert.equal(typeof entry.adapterModule, 'string');
    assert.equal(existsSync(new URL(entry.adapterModule, ROOT)), true, `${entry.toolId} declares a real adapter module`);
    // Coverage can never silently lag the wiring: a newly-wired tool with no owner state or no
    // owner-parity extractor FAILS here instead of being skipped.
    assert.equal(typeof OWNER_STATES[entry.adapterId], 'function', `newly wired tool ${entry.toolId} needs an owner-state builder in TP-15-02`);
    assert.equal(typeof OWNER_PARITY[entry.adapterId], 'function', `newly wired tool ${entry.toolId} needs an owner-parity extractor in TP-15-02`);
  }
  // Membership really is page-derived: a registry tool whose page registers no provider is excluded.
  const unwired = registry.definitions.filter((definition) => !pageRegistersProvider(definition.toolId));
  assert.ok(unwired.length > 0, 'this batch has not wired every tool, so the derivation must exclude some');
  for (const definition of unwired) {
    assert.equal(wired.some((entry) => entry.toolId === definition.toolId), false, `${definition.toolId} has no provider and must not be in the wired loop`);
  }
  console.log(`[TP-15-02] wired (${wired.length}): ${wired.map((entry) => entry.toolId).join(', ')}`);
  console.log(`[TP-15-02] not wired (${unwired.length}): ${unwired.map((definition) => definition.toolId).join(', ')}`);
});

test('TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel', async () => {
  const wired = wiredTools();
  for (const entry of wired) {
    const run = await driveWiredTool(entry);

    assert.ok(Object.keys(run.registered || {}).length > 0, `${entry.toolId}: the production registrar registered no adapter`);
    assert.equal(run.prepared.ok, true, `${entry.toolId}: runtime.prepare must complete on a real owner state (${JSON.stringify(run.prepared.error || null)})`);
    assert.ok(run.projection, `${entry.toolId}: a projection must be produced`);

    // The REAL projection was painted into the REAL panel host by the production renderer.
    assert.equal(run.panel.getAttribute('data-rlexperience-simple-state'), run.projection.state, `${entry.toolId}: panel state attribute`);
    assert.equal(run.panel.getAttribute('data-rlexperience-adapter'), entry.adapterId, `${entry.toolId}: panel carries the registry adapter id`);
    assert.equal(run.panel.hidden, false, `${entry.toolId}: the painted panel is visible`);

    // The registry's OWN declared limitations decide the expected truth state.
    if (entry.declaredUnavailable) {
      assert.equal(run.projection.state, 'unavailable', `${entry.toolId}: registry declares this model must return unavailable`);
      assert.equal(run.projection.numericValue, null, `${entry.toolId}: a declared-unavailable model publishes no numeric`);
      assert.equal(run.panel.findByAttribute('data-simple-numeric-value'), null, `${entry.toolId}: no numeric node is painted`);
      assert.doesNotMatch(String(run.panel.renderedText()), /neutral|average|prior result/i, `${entry.toolId}: no invented signal`);
    } else {
      assert.equal(run.projection.state, 'ready', `${entry.toolId}: a wired tool on a real owner state must reach a ready projection`);
      assert.notEqual(run.projection.numericValue, null, `${entry.toolId}: a ready projection publishes a real numeric`);
      assert.ok(Number.isFinite(run.projection.numericValue), `${entry.toolId}: the published numeric is finite`);
      const numericNode = run.panel.findByAttribute('data-simple-numeric-value');
      assert.ok(numericNode, `${entry.toolId}: the ready projection paints a numeric node into the panel`);
      assert.ok(String(numericNode.textContent).includes(run.projection.valueText), `${entry.toolId}: the painted numeric node carries the owner value text`);
    }

    // BUG-003 invariant preserved on the integration path too.
    assert.deepEqual(run.bodyClassOps, [], `${entry.toolId}: the Simple render must never mutate body.classList`);
  }
});

test('TP-15-02 owner parity: every wired tool\'s Simple facts EQUAL the owner/Power-path values', async () => {
  const wired = wiredTools();
  for (const entry of wired) {
    const run = await driveWiredTool(entry);
    assert.equal(run.prepared.ok, true, `${entry.toolId}: prepare must succeed before parity can be judged`);

    // The SAME owner function the Power view renders from, on the SAME owner state and the SAME
    // parameter values — the single source. No formula is reimplemented in this suite.
    const owner = OWNER_PARITY[entry.adapterId](run.moduleObject, run.ownerState, run.parameterValues);
    assert.equal(typeof run.moduleObject[owner.ownerFunction], 'function', `${entry.toolId}: ${owner.ownerFunction} must be a real module export`);

    assert.equal(
      run.projection.numericValue,
      owner.numericValue,
      `${entry.toolId}: Simple numeric must EQUAL the owner ${owner.ownerFunction} value (Simple=${run.projection.numericValue} owner=${owner.numericValue})`
    );

    if (entry.declaredUnavailable) {
      // Parity for a proven-incomplete model = Simple publishes the same ABSENCE the owner does.
      assert.equal(owner.ownerPublishesNoRead, true, `${entry.toolId}: the owner function itself publishes no read`);
      assert.equal(run.projection.numericValue, null);
      continue;
    }

    assert.equal(run.projection.valueText, owner.valueText, `${entry.toolId}: Simple value text must EQUAL the owner-derived label`);
    for (const fragment of owner.summaryContains) {
      assert.ok(
        String(run.projection.summary || run.projection.message || '').includes(String(fragment)),
        `${entry.toolId}: the Simple summary must carry the owner-computed fragment ${JSON.stringify(fragment)}`
      );
    }
    // The painted panel — not just the projection object — carries the owner value.
    assert.ok(String(run.panel.renderedText()).includes(owner.valueText), `${entry.toolId}: the painted panel shows the owner value text`);
  }
});

/* The shared core's GENERIC unavailable label, and the production bridge's OWN module-guard reason
   (rlexperience.js renderSimpleBridgeInternal → honestUnavailable). The reason string is the
   DISCRIMINATOR between the bridge's two honest-unavailable branches — "the adapter module is not
   on this page" versus "the owner evidence does not permit a run" — so asserting it proves the
   module-absent tool really took the production branch instead of merely landing on the same text
   by coincidence. The generic label is additionally cross-checked below against live core output
   rather than trusted as a literal. */
const GENERIC_UNAVAILABLE_VALUE_TEXT = 'Unavailable';
const MODULE_ABSENT_REASON = 'No wired owner-state provider or adapter module is available for this tool.';

test('TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent)', async () => {
  const wired = wiredTools();
  const config = readJson('tool-experience.config.json');
  let strictParityTools = 0;
  const moduleAbsentTools = [];

  for (const entry of wired) {
    const direct = await driveWiredTool(entry);
    assert.equal(direct.prepared.ok, true, `${entry.toolId}: the explicit runtime path must prepare before the bridge can be compared`);
    const { panel, bodyClassOps } = makePanel();
    const api = loadProductionApi();

    /* PRODUCTION FIDELITY. installSimpleProjectionBridge (rlexperience.js) resolves the module as
       `globalThis[ADAPTER_MODULE_BINDINGS[adapterModule].global]`: present iff the tool's own page
       loaded the adapter module <script>, and NULL when it did not. Handing the module to a tool
       whose page never loads it would exercise a path production never takes for that tool, so the
       module input here is derived from the deployed page exactly as production derives it. */
    const bridged = await api.renderSimpleBridge({
      panel,
      toolId: entry.toolId,
      toolExperience: { kind: 'ordinary', simpleModelDefinitionId: entry.definition.definitionId, simpleAdapterId: entry.adapterId, simpleAdapterModule: entry.adapterModule },
      definition: entry.definition,
      ownerState: direct.ownerState,
      moduleObject: entry.pageLoadsModule ? direct.moduleObject : null,
      registerFnName: direct.registrar,
      adapterId: entry.adapterId,
      api,
      config,
      computedAt: COMPUTED_AT
    });

    // Panel identity + the BUG-003 invariant hold on EVERY wired tool, module-backed or not.
    assert.equal(bridged.adapterId, entry.adapterId, `${entry.toolId}: the bridge publishes the registry adapter id`);
    assert.equal(panel.getAttribute('data-rlexperience-simple-state'), bridged.state, `${entry.toolId}: bridge painted the panel state`);
    assert.equal(panel.getAttribute('data-rlexperience-adapter'), entry.adapterId, `${entry.toolId}: the painted panel carries the registry adapter id`);
    assert.deepEqual(bodyClassOps, [], `${entry.toolId}: the bridge must never mutate body.classList`);

    if (entry.pageLoadsModule) {
      /* STRICT PARITY — unrelaxed. A tool whose page really does load the adapter module must land
         on EXACTLY the projection the explicit runtime path reaches: same state, same adapter id,
         same numeric, same value text. */
      strictParityTools += 1;
      assert.equal(bridged.state, direct.projection.state, `${entry.toolId}: bridge state matches the explicit runtime path`);
      assert.equal(bridged.adapterId, direct.projection.adapterId, `${entry.toolId}: bridge adapter id matches`);
      assert.equal(bridged.numericValue, direct.projection.numericValue, `${entry.toolId}: bridge numeric matches`);
      assert.equal(bridged.valueText, direct.projection.valueText, `${entry.toolId}: bridge value text matches`);
      continue;
    }

    /* ─────────── ADAPTER MODULE DELIBERATELY ABSENT ───────────
       technical-analysis-decision-lab is a Scope-01 FOUNDATION-RECEIPT VALIDATOR that publishes no
       owner-model read, so its page intentionally does NOT load
       rlexperience-adapters/market-structure.js (RLMARKETSTRUCTURE) — see the page's own Scope 15
       provider comment. That absence is a LOCKED contract: tests/simple-models.spec.mjs
       SCN-012-034 ("missing owner adapter stays unavailable without defaults fetch or fabricated
       result") asserts `registeredAdapters: 0` on the live page, so loading the module here — or
       on that page — to make the messages match would BREAK the lock and fabricate a capability the
       product deliberately does not ship.

       Strict MESSAGE parity is therefore not the contract for this tool; the contract is that the
       production bridge degrades to the shared core's honest GENERIC unavailable while still
       naming the right adapter and inventing nothing. That is asserted strictly below. */
    moduleAbsentTools.push(entry.toolId);

    /* The exemption is REGISTRY-GATED, never a tool-name list: a wired tool may skip strict message
       parity ONLY when its own declared limitations say the adapter must return unavailable. A
       future module-less tool that is not registry-declared-unavailable fails loud right here. */
    assert.equal(entry.declaredUnavailable, true, `${entry.toolId}: a wired tool whose page omits the adapter module must be registry-declared unavailable`);

    // 1. The bridge took its MODULE-GUARD branch — not the "evidence does not permit a run" branch.
    assert.equal(bridged.state, 'unavailable', `${entry.toolId}: the module-absent production path is unavailable`);
    assert.equal(
      String(bridged.uncertainty && bridged.uncertainty.reason),
      MODULE_ABSENT_REASON,
      `${entry.toolId}: the bridge must degrade because the adapter module is absent from the page`
    );

    // 2. It renders the shared core's honest GENERIC unavailable. The expected label is
    //    cross-checked against live core output (the same honestUnavailable path a null owner state
    //    takes) so a future relabel of the core cannot silently drift past this assertion.
    const { panel: genericPanel } = makePanel();
    const genericProjection = await api.renderSimpleBridge({
      panel: genericPanel,
      toolId: entry.toolId,
      toolExperience: { kind: 'ordinary', simpleModelDefinitionId: entry.definition.definitionId, simpleAdapterId: entry.adapterId, simpleAdapterModule: entry.adapterModule },
      definition: entry.definition,
      ownerState: null,
      moduleObject: direct.moduleObject,
      registerFnName: direct.registrar,
      adapterId: entry.adapterId,
      api,
      config,
      computedAt: COMPUTED_AT
    });
    assert.equal(genericProjection.valueText, GENERIC_UNAVAILABLE_VALUE_TEXT, `${entry.toolId}: the shared core's generic unavailable label`);
    assert.equal(bridged.valueText, GENERIC_UNAVAILABLE_VALUE_TEXT, `${entry.toolId}: the module-absent bridge renders the honest generic unavailable`);

    // 3. The panel still carries the correct registry adapter id, and the message names it. The
    //    expected id is read straight off the registry definition (the source of truth) rather than
    //    the derived entry field, so the panel is cross-checked against the registry itself.
    assert.equal(panel.getAttribute('data-rlexperience-adapter'), entry.definition.adapterId, `${entry.toolId}: the honest panel still carries the registry adapter id`);
    assert.match(String(bridged.message), /owner model adapter required/i, `${entry.toolId}: the missing owner capability is named`);
    assert.ok(String(bridged.message).includes(entry.adapterId), `${entry.toolId}: the named capability is the registry adapter id`);

    // 4. NO invented signal: no numeric on the projection, no numeric node painted, no fabricated verdict.
    assert.equal(bridged.numericValue, null, `${entry.toolId}: no fabricated numeric on the module-absent path`);
    assert.equal(panel.findByAttribute('data-simple-numeric-value'), null, `${entry.toolId}: no numeric node is painted`);
    assert.doesNotMatch(String(panel.renderedText()), /neutral|average|prior result/i, `${entry.toolId}: no invented signal`);

    /* 5. BOTH paths are honest-unavailable and publish the same ABSENCE; they differ ONLY in message
          specificity, because the explicit-runtime path registers the adapter itself and therefore
          reaches the adapter's OWN richer honest-unavailable text, while production has no module
          to author one. If the adapter ever stopped being more specific than the generic core
          label, this fires and forces the contract to be re-read. */
    assert.equal(direct.projection.state, 'unavailable', `${entry.toolId}: the module-backed explicit path is also honest-unavailable`);
    assert.equal(direct.projection.numericValue, null, `${entry.toolId}: the explicit path invents no numeric either`);
    assert.equal(typeof direct.projection.valueText, 'string', `${entry.toolId}: the adapter authors its own unavailable text`);
    assert.ok(direct.projection.valueText.length > 0, `${entry.toolId}: the adapter's unavailable text is non-empty`);
    assert.notEqual(
      direct.projection.valueText,
      GENERIC_UNAVAILABLE_VALUE_TEXT,
      `${entry.toolId}: with the module present the adapter publishes its OWN richer honest-unavailable, which is exactly why production (module absent) shows the generic label instead`
    );
  }

  // The strict branch can never become vacuous: at least one genuinely module-backed wired tool
  // must have been compared under full parity.
  assert.ok(strictParityTools > 0, 'at least one module-backed wired tool must exercise the strict parity branch');
  console.log(`[TP-15-02] strict parity (module loaded by the page): ${strictParityTools} of ${wired.length}`);
  console.log(`[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): ${moduleAbsentTools.length ? moduleAbsentTools.join(', ') : 'none'}`);
});

test('TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal)', async () => {
  const wired = wiredTools();
  for (const entry of wired) {
    // This is exactly the deployed intraday-tape-lab situation on an unhydrated page: the provider
    // is registered but truthfully returns null, so the bridge must publish an honest absence.
    const { panel, bodyClassOps } = makePanel();
    const api = loadProductionApi();
    const moduleObject = loadModule(entry.adapterModule);
    const projection = await api.renderSimpleBridge({
      panel,
      toolId: entry.toolId,
      toolExperience: { kind: 'ordinary', simpleModelDefinitionId: entry.definition.definitionId, simpleAdapterId: entry.adapterId, simpleAdapterModule: entry.adapterModule },
      definition: entry.definition,
      ownerState: null,
      moduleObject,
      registerFnName: resolveRegistrar(moduleObject),
      adapterId: entry.adapterId,
      api,
      config: readJson('tool-experience.config.json'),
      computedAt: COMPUTED_AT
    });

    assert.equal(projection.state, 'unavailable', `${entry.toolId}: a null owner state must degrade to honest unavailable`);
    assert.equal(projection.numericValue, null, `${entry.toolId}: no fabricated numeric on the unavailable path`);
    assert.match(String(projection.message), /owner model adapter required/i, `${entry.toolId}: the missing owner capability is named`);
    assert.ok(String(projection.message).includes(entry.adapterId), `${entry.toolId}: the named capability is the registry adapter id`);
    assert.doesNotMatch(String(projection.message), /neutral|average|prior result/i, `${entry.toolId}: no invented signal`);
    assert.equal(panel.getAttribute('data-rlexperience-simple-state'), 'unavailable', `${entry.toolId}: the honest state is painted`);
    assert.equal(panel.findByAttribute('data-simple-numeric-value'), null, `${entry.toolId}: no numeric node is painted`);
    assert.deepEqual(bodyClassOps, [], `${entry.toolId}: the unavailable path must never mutate body.classList`);
  }
});

test('TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read', async () => {
  const ms = loadModule('rlexperience-adapters/market-structure.js');
  // A real reducer run over constituents whose price windows are entirely absent — a page that has
  // not hydrated. The byte-locked core must refuse the run; the bridge must stay honest.
  const unhydrated = ms.reduceOwnerState({
    asOf: '2026-07-25T20:00:00.000Z',
    source: 'unhydrated cache snapshot',
    constituents: [
      { ticker: 'AAPL', sector: 'Tech', industry: 'Hardware', weight: 0.5 },
      { ticker: 'MSFT', sector: 'Tech', industry: 'Software', weight: 0.5 }
    ],
    barsReader: () => null
  });

  const entry = wiredTools().find((candidate) => candidate.adapterId === 'simple-adapter/market-breadth/v1');
  assert.ok(entry, 'market-breadth must be part of the wired set for this degradation check');

  const { panel, bodyClassOps } = makePanel();
  const api = loadProductionApi();
  const projection = await api.renderSimpleBridge({
    panel,
    toolId: entry.toolId,
    toolExperience: { kind: 'ordinary', simpleModelDefinitionId: entry.definition.definitionId, simpleAdapterId: entry.adapterId, simpleAdapterModule: entry.adapterModule },
    definition: entry.definition,
    ownerState: unhydrated,
    moduleObject: ms,
    registerFnName: resolveRegistrar(ms),
    adapterId: entry.adapterId,
    api,
    config: readJson('tool-experience.config.json'),
    computedAt: COMPUTED_AT
  });

  assert.equal(projection.state, 'unavailable', 'unhydrated owner evidence must not produce a fabricated ready read');
  assert.equal(projection.numericValue, null);
  assert.equal(panel.getAttribute('data-rlexperience-simple-state'), 'unavailable');
  assert.deepEqual(bodyClassOps, [], 'the failed-run path must never mutate body.classList');
});
