/*
 * TP-15-01 — Scope 15 production Simple-view bridge unit contract.
 *
 * SCN-012-038 / SCN-012-042 / (bridge invariant of SCN-012-039): the production
 * bridge `RLEXPERIENCE.renderSimpleBridge` is the provider-gated render path that
 * replaces the dead-code stub. It:
 *   • renders the REAL registered adapter projection ("ready") when a wired
 *     owner-state provider supplies a real owner snapshot and the adapter module
 *     is present (SCN-012-038);
 *   • renders an honest "unavailable" projection — naming the missing owner
 *     capability, inventing no signal, no fabricated numeric — when no provider /
 *     owner state is available, or when the owner evidence does not permit a run
 *     (SCN-012-042 truthful degradation);
 *   • NEVER mutates `body.rlv-focused` — `applyVisual` (rlviews.js) is the sole
 *     owner of that class; the stub's `classList.add("rlv-focused")` (the BUG-003
 *     cause) is gone (bridge invariant of SCN-012-039).
 *
 * NODE, NO BROWSER. The REAL production adapter module (RLMARKETSTRUCTURE) is
 * required and registered into the REAL production runtime (RLEXPERIENCE); the
 * REAL owner reducer builds the owner snapshot; the bridge renders into a minimal
 * DOM host. There is NO fetch, NO interception — the owner data is a deterministic
 * frozen fixture built from the REAL module reducer (owner parity is proven
 * exhaustively by TP-05-01/TP-05-02; this surface proves the shell BRIDGE decision).
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { loadProductionApi, readJson } from './tool-experience.support.mjs';

const require = createRequire(import.meta.url);

const ADAPTER_MODULE = 'rlexperience-adapters/market-structure.js';
const REGISTER_FN = 'registerMarketStructureAdapters';
const ADAPTER_ID = 'simple-adapter/market-breadth/v1';
const TOOL_ID = 'market-heatmap-lab';

function loadMarketStructure() {
  const path = require.resolve('../rlexperience-adapters/market-structure.js');
  delete require.cache[path];
  return require(path);
}

function breadthDefinition() {
  return readJson('simple-models.json').definitions.find((definition) => definition.toolId === TOOL_ID);
}

/* Ascending OHLCV rows whose 1d/1w/1m window %-returns equal the requested values
   under market-structure WINDOW_BARS (1/5/21). Base 100 across 22 bars. */
function barsFor(r1d, r1w, r1m) {
  const rows = [];
  const close = 100;
  for (let i = 0; i < 22; i += 1) rows.push({ t: i, c: close, v: 1000 });
  rows[21].c = close * (1 + r1d / 100);
  rows[21 - 5].c = rows[21].c / (1 + r1w / 100);
  rows[21 - 21].c = rows[21].c / (1 + r1m / 100);
  return rows;
}

/* A real owner snapshot built by the REAL module reducer (no formula copy). */
function realOwnerState() {
  const ms = loadMarketStructure();
  const constituents = [
    { ticker: 'AAA', sector: 'Tech', industry: 'Semis', weight: 0.10, rows: barsFor(2.0, 5.0, 4.0) },
    { ticker: 'BBB', sector: 'Tech', industry: 'Semis', weight: 0.40, rows: barsFor(-1.0, -3.0, -2.0) },
    { ticker: 'III', sector: 'Tech', industry: 'Semis', weight: 0.05, rows: barsFor(12.0, 1.0, 3.0) },
    { ticker: 'CCC', sector: 'Fin', industry: 'Banks', weight: 0.05, rows: barsFor(1.0, -2.0, 2.0) }
  ];
  return ms.reduceOwnerState({
    asOf: '2026-07-23T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    constituents,
    barsReader: (ticker) => (constituents.find((entry) => entry.ticker === ticker) || {}).rows || null
  });
}

/* An owner snapshot whose price windows are entirely absent (a not-yet-hydrated
   page): the module reducer produces null returns, and the byte-locked core
   refuses a run (E012-SIMPLE-INPUT). The bridge must degrade to honest unavailable. */
function unhydratedOwnerState() {
  const ms = loadMarketStructure();
  const constituents = [
    { ticker: 'AAA', sector: 'Tech', industry: 'Semis', weight: 0.10 },
    { ticker: 'BBB', sector: 'Fin', industry: 'Banks', weight: 0.40 }
  ];
  return ms.reduceOwnerState({
    asOf: '2026-07-23T20:00:00.000Z',
    source: 'unhydrated cache snapshot',
    constituents,
    barsReader: () => null
  });
}

/* ── minimal DOM host + a body whose classList records every mutation ── */
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
    }
  };
}

function makeHarness() {
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
  const panel = makeElement('section', documentRef);
  // Expose a fake global document so a re-introduced body mutation would be observable.
  globalThis.document = documentRef;
  return { documentRef, panel, bodyClassOps };
}

function baseOptions(overrides) {
  const api = loadProductionApi();
  const config = readJson('tool-experience.config.json');
  const definition = breadthDefinition();
  const moduleObject = loadMarketStructure();
  return Object.assign({
    toolId: TOOL_ID,
    toolExperience: { kind: 'ordinary', simpleModelDefinitionId: definition.definitionId, simpleAdapterId: ADAPTER_ID, simpleAdapterModule: ADAPTER_MODULE },
    definition,
    ownerState: realOwnerState(),
    moduleObject,
    registerFnName: REGISTER_FN,
    adapterId: ADAPTER_ID,
    api,
    config,
    computedAt: '2026-07-25T20:02:00.000Z'
  }, overrides || {});
}

test('renderSimpleBridge is exposed on the production API', () => {
  const api = loadProductionApi();
  assert.equal(typeof api.renderSimpleBridge, 'function', 'RLEXPERIENCE.renderSimpleBridge must be a public method');
});

test('provider present + real owner state → renders the REAL market-breadth adapter (ready), never mutates rlv-focused', async () => {
  const harness = makeHarness();
  const api = loadProductionApi();
  const options = baseOptions({ panel: harness.panel, api });
  const projection = await api.renderSimpleBridge(options);

  assert.equal(projection.state, 'ready', 'wired owner state must produce a ready projection');
  assert.equal(projection.adapterId, ADAPTER_ID, 'the ready projection must carry the real adapter id');
  assert.equal(harness.panel.getAttribute('data-rlexperience-simple-state'), 'ready');
  assert.equal(harness.panel.getAttribute('data-rlexperience-adapter'), ADAPTER_ID);
  // a real numeric breadth read is painted (not a placeholder)
  assert.notEqual(projection.numericValue, null, 'the real adapter read carries a numeric value');
  assert.ok(harness.panel.findByAttribute('data-simple-numeric-value'), 'a numeric value node is rendered');
  // BUG-003 invariant: the bridge NEVER touches body.rlv-focused.
  assert.deepEqual(harness.bodyClassOps, [], 'the bridge must not mutate body.classList');
});

test('no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused', async () => {
  const harness = makeHarness();
  const api = loadProductionApi();
  const projection = await api.renderSimpleBridge(baseOptions({ panel: harness.panel, api, ownerState: null }));

  assert.equal(projection.state, 'unavailable', 'absent provider owner state must degrade to honest unavailable');
  assert.equal(harness.panel.getAttribute('data-rlexperience-simple-state'), 'unavailable');
  assert.equal(projection.numericValue, null, 'unavailable must publish a null numeric (no fabricated signal)');
  // Names the missing owner capability; invents no neutral/average/prior signal.
  assert.match(projection.message, /owner model adapter required/i);
  assert.doesNotMatch(String(projection.message), /neutral|average|prior result/i);
  assert.deepEqual(harness.bodyClassOps, [], 'the bridge must not mutate body.classList on the unavailable path');
});

test('owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused', async () => {
  const harness = makeHarness();
  const api = loadProductionApi();
  const projection = await api.renderSimpleBridge(baseOptions({ panel: harness.panel, api, ownerState: unhydratedOwnerState() }));

  assert.equal(projection.state, 'unavailable', 'unhydrated owner evidence must degrade to honest unavailable, not a fabricated ready');
  assert.equal(projection.numericValue, null);
  assert.deepEqual(harness.bodyClassOps, [], 'the bridge must not mutate body.classList on the failed-run path');
});

test('missing adapter module → honest unavailable (no crash), never mutates rlv-focused', async () => {
  const harness = makeHarness();
  const api = loadProductionApi();
  const projection = await api.renderSimpleBridge(baseOptions({ panel: harness.panel, api, moduleObject: null, registerFnName: null }));

  assert.equal(projection.state, 'unavailable', 'absent adapter module must degrade to honest unavailable');
  assert.deepEqual(harness.bodyClassOps, [], 'the bridge must not mutate body.classList when the module is absent');
});

/* ────────────────────────────────────────────────────────────────────────────
   The Simple refresh coordinator's invalidation contract.

   `invalidateSimpleGeneration` documents that "an in-flight run may no longer
   commit, and nothing queued survives leaving the view". The generation bump
   delivers the first half: an in-flight run captured a claim, so bumping the
   counter makes its `mayPaint()` false. It cannot deliver the second half —
   `startSimpleRun` mints a FRESH claim when it begins, so a run that has not
   started yet is untouched by the bump.

   The scenario below is the faithful one, not a contrived DOM state. `rlviews`
   `selectMode` deliberately does NOT short-circuit a same-mode transition when
   the source is "popstate", and `apply()` re-dispatches `rlviews:change` while
   `applyVisual` leaves `data-rlview` on the mode it already had. So Back/Forward
   landing on the same Simple view is a real invalidation whose view attribute is
   unchanged — the one case `resolveSimpleContext`'s re-validation cannot catch.

   REAL PRODUCTION COORDINATOR, no interception: the real rlexperience.js
   installs its listener on a real EventTarget, the real registered adapter runs
   over the real reducer's owner snapshot. Only the DOM host is minimal.
   ──────────────────────────────────────────────────────────────────────────── */

function makeCoordinatorHarness() {
  const saved = {
    document: globalThis.document,
    addEventListener: globalThis.addEventListener,
    dispatchEvent: globalThis.dispatchEvent,
    registration: globalThis.__rlviewsRegistration,
    providers: globalThis.__rlOwnerStateProvider,
    marketStructure: globalThis.RLMARKETSTRUCTURE,
    experience: globalThis.RLEXPERIENCE
  };

  const bus = new EventTarget();
  globalThis.addEventListener = bus.addEventListener.bind(bus);
  globalThis.dispatchEvent = bus.dispatchEvent.bind(bus);

  const bodyClassOps = [];
  const documentRef = { createElement: (tag) => makeElement(tag, documentRef) };
  const panel = makeElement('section', documentRef);
  documentRef.body = makeElement('body', documentRef);
  documentRef.body.classList = {
    add: (name) => bodyClassOps.push(['add', name]),
    remove: (name) => bodyClassOps.push(['remove', name]),
    toggle: (name, force) => bodyClassOps.push(['toggle', name, force])
  };
  documentRef.body.setAttribute('data-rlview', 'simple');
  documentRef.querySelector = (selector) => (selector === '[data-rlexperience-panel="simple"]' ? panel : null);
  globalThis.document = documentRef;

  const definition = breadthDefinition();
  globalThis.RLMARKETSTRUCTURE = loadMarketStructure();

  // Re-required AFTER the bus exists, so the production coordinator binds to it.
  const api = loadProductionApi();
  globalThis.RLEXPERIENCE = api;

  globalThis.__rlviewsRegistration = {
    shell: { toolId: TOOL_ID },
    registry: {
      tools: [{
        id: TOOL_ID,
        experience: { kind: 'ordinary', simpleAdapterId: ADAPTER_ID, simpleAdapterModule: ADAPTER_MODULE, simpleModelDefinitionId: definition.definitionId }
      }]
    },
    simpleModels: { definitions: [definition] },
    config: readJson('tool-experience.config.json')
  };
  globalThis.__rlOwnerStateProvider = { [TOOL_ID]: () => realOwnerState() };

  return {
    api,
    panel,
    bodyClassOps,
    /* rlviews `apply()`: `applyVisual` writes data-rlview FIRST, then dispatches. A
       same-mode popstate re-entry therefore dispatches with the attribute unchanged. */
    viewChange(mode) {
      documentRef.body.setAttribute('data-rlview', mode);
      globalThis.dispatchEvent(new CustomEvent('rlviews:change', { detail: { mode, previousMode: 'simple', baseMode: mode, toolId: TOOL_ID } }));
    },
    restore() {
      globalThis.document = saved.document;
      globalThis.__rlviewsRegistration = saved.registration;
      globalThis.__rlOwnerStateProvider = saved.providers;
      globalThis.RLMARKETSTRUCTURE = saved.marketStructure;
      globalThis.RLEXPERIENCE = saved.experience;
      if (saved.addEventListener === undefined) delete globalThis.addEventListener; else globalThis.addEventListener = saved.addEventListener;
      if (saved.dispatchEvent === undefined) delete globalThis.dispatchEvent; else globalThis.dispatchEvent = saved.dispatchEvent;
    }
  };
}

/* Resolve to the promise's value, or to the HUNG sentinel if it never settles.
   A dropped (never-resolved) slot is a hang, and a hang must fail loudly rather
   than time the suite out with no explanation. */
const HUNG = Symbol('never settled');
function settledValue(promise, ms) {
  let timer = null;
  return Promise.race([
    promise,
    new Promise((resolve) => { timer = setTimeout(() => resolve(HUNG), ms); })
  ]).finally(() => clearTimeout(timer));
}

test('a queued Simple run does not survive an invalidation, and its promise settles', async () => {
  const harness = makeCoordinatorHarness();
  try {
    // Queued, not yet started: `requestSimpleRefresh` defers the run by a microtask.
    const queued = harness.api.requestSimpleRefresh({ toolId: TOOL_ID });

    // Same synchronous turn: a same-mode popstate re-entry invalidates before the run begins.
    harness.viewChange('simple');

    // A caller asking AFTER the invalidation must not be handed the invalidated work.
    const afterInvalidation = harness.api.requestSimpleRefresh({ toolId: TOOL_ID });
    assert.notEqual(
      queued,
      afterInvalidation,
      'the invalidated queued run must not be reused: a request made after the invalidation must receive fresh work'
    );

    const queuedValue = await settledValue(queued, 2000);
    assert.notEqual(queuedValue, HUNG, 'the cancelled queued run must resolve, never be dropped — its awaiters must settle');
    assert.equal(
      queuedValue,
      null,
      'the queued run was invalidated before it started, so it must resolve null rather than land a result'
    );

    // Non-weakening: cancelling the stale slot must not cost the re-entry its repaint.
    const fresh = await settledValue(afterInvalidation, 5000);
    assert.notEqual(fresh, HUNG, 'the post-invalidation request must settle');
    assert.equal(fresh && fresh.state, 'ready', 'the re-entry into Simple must still paint the real adapter projection');
    assert.equal(harness.panel.getAttribute('data-rlexperience-simple-state'), 'ready');
    assert.deepEqual(harness.bodyClassOps, [], 'the coordinator must not mutate body.classList');
  } finally {
    harness.restore();
  }
});

test('leaving Simple altogether also settles the queued run without painting', async () => {
  const harness = makeCoordinatorHarness();
  try {
    const queued = harness.api.requestSimpleRefresh({ toolId: TOOL_ID });
    harness.viewChange('power');

    const queuedValue = await settledValue(queued, 2000);
    assert.notEqual(queuedValue, HUNG, 'the queued run must settle when the view is left');
    assert.equal(queuedValue, null, 'nothing queued may land after leaving the view');
    assert.equal(harness.panel.getAttribute('data-rlexperience-simple-state'), null, 'no projection may be painted after leaving Simple');
    assert.deepEqual(harness.bodyClassOps, [], 'the coordinator must not mutate body.classList');
  } finally {
    harness.restore();
  }
});
