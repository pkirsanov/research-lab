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
import { readFileSync } from 'node:fs';
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

/* ────────────────────────────────────────────────────────────────────────────
   TP-15-01's two remaining declared halves: `ownerModes` resolution, and no
   forbidden authority.

   DEFENCE IN DEPTH, NOT DUPLICATION. The TP-15-07 selftest canaries prove these
   same two facts at the DEPLOYED-SOURCE level — across every shipped page and
   every wired tool, in the fast broad gate. The two tests below prove them at the
   UNIT/API level: the gate expression is executed here against the production view
   vocabulary, and the authority contract is read off a runtime this file builds
   and registers through the PUBLIC API — the surface a caller actually gets. A
   regression that breaks only one of those levels is still caught.

   NOTHING BELOW RESTATES A CONSTANT. The gate is rlapp.js's OWN ternary, sliced
   verbatim out of the deployed source and EXECUTED; the mode vocabulary is read
   from the production experience config; the authority flags are the runtime's
   OWN diagnostic. Flip the gate or grant a flag in production and these fail.
   ──────────────────────────────────────────────────────────────────────────── */

/* rlapp.js's OWN ownerModes ternary, extracted verbatim and compiled — never a copy. */
function productionOwnerModesResolver() {
  const appSrc = readFileSync(new URL('../rlapp.js', import.meta.url), 'utf8');
  const start = appSrc.indexOf('ownerModes: resolved.value.kind');
  assert.ok(start >= 0, 'rlapp.js must still declare the ownerModes gate this contract is derived from');
  const expression = appSrc.slice(start + 'ownerModes:'.length, appSrc.indexOf('\n        };', start)).trim();
  assert.ok(expression.length > 0, 'the ownerModes expression must be extractable from rlapp.js');
  assert.match(expression, /__rlOwnerStateProvider/, 'the extracted expression must be the real provider-gated rule, not unrelated source');
  return { expression, resolve: Function('resolved', 'root', 'toolId', 'return (' + expression + ');') };
}

/* The mode vocabulary, read from the production experience config: the generic
   ordinary view set is the one bound to no particular tool; the brief-only set is
   the one bound to a named registry tool. */
function productionViewSets() {
  const config = readJson('tool-experience.config.json');
  const sets = Object.keys(config.viewSets).map((viewSetId) => config.viewSets[viewSetId]);
  const ordinary = sets.find((viewSet) => viewSet.registryToolId === null);
  const briefOnly = sets.find((viewSet) => typeof viewSet.registryToolId === 'string' && viewSet.registryToolId.length > 0);
  assert.ok(ordinary, 'the production config must declare a generic ordinary view set (registryToolId null)');
  assert.ok(briefOnly, 'the production config must declare a tool-bound brief-only view set');
  return { ordinary, briefOnly };
}

test('ownerModes resolution: provider wiring hands Simple to the adapter panel and never regresses an unwired tool', () => {
  const { expression, resolve } = productionOwnerModesResolver();
  const { ordinary, briefOnly } = productionViewSets();
  assert.ok(expression.includes(JSON.stringify(ordinary.kind)), `the extracted gate must branch on the config-declared ordinary kind "${ordinary.kind}"`);

  // The uniform owner-state provider seam a wired page installs; an unwired page has no such root.
  const wiredRoot = { __rlOwnerStateProvider: { [TOOL_ID]: () => realOwnerState() } };
  const briefToolId = briefOnly.registryToolId;

  const wired = resolve({ value: { kind: ordinary.kind } }, wiredRoot, TOOL_ID);
  const unwired = resolve({ value: { kind: ordinary.kind } }, {}, TOOL_ID);
  const brief = resolve({ value: { kind: briefOnly.kind } }, { __rlOwnerStateProvider: { [briefToolId]: () => null } }, briefToolId);

  // No invented mode: every resolved mode is a view id its own view set declares.
  for (const mode of [...wired, ...unwired]) assert.ok(ordinary.viewIds.includes(mode), `ordinary ownerModes may only contain declared ordinary view ids (saw "${mode}")`);
  for (const mode of brief) assert.ok(briefOnly.viewIds.includes(mode), `brief-only ownerModes may only contain declared brief view ids (saw "${mode}")`);

  // The contract, derived rather than restated: wiring removes exactly the ordinary
  // set's default view (the tool's native Simple) so the shell adapter panel takes it
  // over, and changes nothing else. An unwired tool keeps it — the no-regression half.
  assert.ok(unwired.includes(ordinary.defaultViewId), `an unwired ordinary tool must keep its native "${ordinary.defaultViewId}" view — losing it is the Model B regression this gate exists to prevent`);
  assert.ok(!wired.includes(ordinary.defaultViewId), `a provider-wired ordinary tool must hand "${ordinary.defaultViewId}" to the adapter panel`);
  assert.deepEqual(wired, unwired.filter((mode) => mode !== ordinary.defaultViewId), 'wiring must remove exactly the default view and nothing else');
  assert.deepEqual(brief, [briefOnly.defaultViewId], 'a brief-only tool resolves to its view set\u2019s default view alone');

  // The concrete shapes TP-15-01 declares, checked against the production ternary's
  // EXECUTED output above — the values come from running rlapp.js, not from a copy.
  assert.deepEqual(wired, ['power'], 'a provider-wired ordinary tool resolves to ["power"]');
  assert.deepEqual(unwired, ['simple', 'power'], 'an unwired ordinary tool resolves to ["simple","power"]');
  assert.deepEqual(brief, ['brief'], 'a brief-only tool resolves to ["brief"]');
});

/* Record-only accessors over the global authority surfaces a browser bridge could
   reach. They never block — the assertion is that the production path touches none. */
function trapGlobalAuthority(names, touches) {
  const saved = names.map((name) => ({ name, descriptor: Object.getOwnPropertyDescriptor(globalThis, name) }));
  const untrappable = saved.filter((entry) => entry.descriptor && entry.descriptor.configurable === false).map((entry) => entry.name);
  // Asserted BEFORE anything is installed, so a failure here cannot leave globals trapped.
  assert.deepEqual(untrappable, [], `every declared authority surface must be observable (untrappable: ${untrappable.join(', ')})`);
  for (const entry of saved) {
    const original = entry.descriptor && Object.prototype.hasOwnProperty.call(entry.descriptor, 'value') ? entry.descriptor.value : undefined;
    Object.defineProperty(globalThis, entry.name, {
      configurable: true,
      get() { touches.push(entry.name); return original; },
      set() { touches.push(entry.name + ' (write)'); }
    });
  }
  return () => {
    for (const entry of saved) {
      delete globalThis[entry.name];
      if (entry.descriptor) Object.defineProperty(globalThis, entry.name, entry.descriptor);
    }
  };
}

test('no forbidden authority: the runtime declares none, and running the real bridge touches no network, provider, storage or cookie surface', async () => {
  const api = loadProductionApi();
  const config = readJson('tool-experience.config.json');
  const definition = breadthDefinition();

  /* Declared half — the runtime's OWN diagnostic, read after a REAL adapter
     registration through the public API (the same runtime+registrar pair the
     bridge builds internally). */
  const created = api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] });
  assert.equal(created.ok, true, 'the production runtime must be constructible through the public API');
  const runtime = created.value;
  const registered = loadMarketStructure()[REGISTER_FN](runtime, api, [definition], { rlvol: globalThis.RLVOL });
  assert.equal(registered && registered[ADAPTER_ID] && registered[ADAPTER_ID].ok, true, 'the real registrar must register the declared adapter id before the authority contract is read');
  assert.equal(runtime.diagnostic().value.registeredAdapterCount, 1, 'the diagnostic must be read from a runtime that actually has the adapter registered');

  const authority = runtime.diagnostic().value.authority;
  const flags = Object.keys(authority || {});
  assert.ok(flags.length > 0, 'the runtime must publish a non-empty authority contract — an empty one would pass "all false" vacuously');
  for (const domain of ['network', 'provider', 'storage']) {
    assert.ok(flags.includes(domain), `the authority contract must still declare a "${domain}" flag — deleting it would let "all false" pass vacuously`);
  }
  assert.deepEqual(
    flags.filter((flag) => authority[flag] !== false),
    [],
    'the runtime must own no authority after adapter registration (every declared flag must be false)'
  );

  /* Behavioural half — the declaration must be true of the executed path. Covers the
     cookie surface the diagnostic has no flag for, and catches an authority grant a
     source-token scan would miss. */
  const touches = [];
  const harness = makeHarness();
  Object.defineProperty(harness.documentRef, 'cookie', {
    configurable: true,
    get() { touches.push('document.cookie'); return ''; },
    set() { touches.push('document.cookie (write)'); }
  });
  const restoreGlobals = trapGlobalAuthority(['fetch', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'indexedDB', 'RLDATA'], touches);
  let projection = null;
  try {
    projection = await api.renderSimpleBridge(baseOptions({ panel: harness.panel, api }));
  } finally {
    restoreGlobals();
  }

  assert.equal(projection.state, 'ready', 'the authority check must observe the full ready path, not an early unavailable return');
  assert.deepEqual(touches, [], `the production bridge must perform local compute only (touched: ${touches.join(', ') || 'none'})`);
  assert.deepEqual(harness.bodyClassOps, [], 'the bridge must not mutate body.classList while under authority observation');
});

