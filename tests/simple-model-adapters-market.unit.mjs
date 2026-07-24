import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { clone, loadProductionApi, readJson } from './tool-experience.support.mjs';

const require = createRequire(import.meta.url);

function loadMarketStructure() {
  const path = require.resolve('../rlexperience-adapters/market-structure.js');
  delete require.cache[path];
  return require(path);
}

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code || ''} ${result.error.fieldPath || result.error.reason || ''}`);
  return result.value;
}

function breadthDefinition() {
  return clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'market-heatmap-lab'));
}

function runtimeFor(api, definition) {
  const config = readJson('tool-experience.config.json');
  const models = { contractVersion: 'simple-model-registry/v1', definitions: [definition] };
  return requireValue(api.createSimpleRuntime(config, models));
}

/* Extract a top-level `function NAME(...) { ... }` body from the owner page source.
   Mirrors the "selftest-extractable" contract in market-heatmap-lab.html and lets the
   parity test compare the module's extracted owner functions to the page's live
   inline formula on canonical inputs (owner byte/semantic parity). */
function extractPageFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `owner function ${name} not found in market-heatmap-lab.html`);
  let index = source.indexOf('{', start);
  assert.notEqual(index, -1, `owner function ${name} has no body`);
  let depth = 0;
  let end = -1;
  for (let i = index; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  assert.notEqual(end, -1, `owner function ${name} body is unbalanced`);
  const signatureAndBody = source.slice(start + `function `.length, end);
  // eslint-disable-next-line no-new-func
  return new Function(`return function ${signatureAndBody};`)();
}

const OWNER_PAGE = readFileSync(new URL('../market-heatmap-lab.html', import.meta.url), 'utf8');

/* Synthetic owner snapshot engineered so every declared parameter provably moves
   its declared output path (real steerable effects), never a fabricated feed. */
function ownerFixture() {
  const constituents = [
    { ticker: 'AAA', sector: 'Tech', industry: 'Semis', weight: 0.10, rows: barsFor(2.0, 5.0, 4.0) },
    { ticker: 'BBB', sector: 'Tech', industry: 'Semis', weight: 0.40, rows: barsFor(-1.0, -3.0, -2.0) },
    { ticker: 'III', sector: 'Tech', industry: 'Semis', weight: 0.05, rows: barsFor(12.0, 1.0, 3.0) },
    { ticker: 'CCC', sector: 'Tech', industry: 'Software', weight: 0.10, rows: barsFor(0.5, -1.0, 1.0) },
    { ticker: 'DDD', sector: 'Tech', industry: 'Software', weight: 0.20, rows: barsFor(-0.5, 2.0, -1.0) },
    { ticker: 'EEE', sector: 'Fin', industry: 'Banks', weight: 0.05, rows: barsFor(1.0, -2.0, 2.0) },
    { ticker: 'FFF', sector: 'Fin', industry: 'Banks', weight: 0.05, rows: barsFor(-2.0, 1.0, -1.0) },
    { ticker: 'GGG', sector: 'Fin', industry: 'Insurance', weight: 0.05, rows: barsFor(0.2, 0.3, 0.1) }
  ];
  const ms = loadMarketStructure();
  return ms.reduceOwnerState({
    asOf: '2026-07-23T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    constituents,
    barsReader: (ticker) => (constituents.find((entry) => entry.ticker === ticker) || {}).rows || null
  });
}

/* Build ascending OHLCV rows whose 1d/1w/1m window % returns equal the requested
   values under market-structure WINDOW_BARS (1/5/21). Base 100 across 22 bars,
   endpoints set so pctOverWindow reproduces r1d, r1w, r1m exactly. */
function barsFor(r1d, r1w, r1m) {
  const rows = [];
  const close = 100;
  for (let i = 0; i < 22; i += 1) rows.push({ t: i, c: close, v: 1000 });
  rows[21].c = close * (1 + r1d / 100);
  rows[21 - 5].c = rows[21].c / (1 + r1w / 100);
  rows[21 - 21].c = rows[21].c / (1 + r1m / 100);
  return rows;
}

function defaultValues(definition) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
}

test('TP-05-01 market-structure module exposes the delivered market-structure adapters with no forbidden authority', () => {
  const ms = loadMarketStructure();
  assert.deepEqual(ms.supportedAdapterIds, ['simple-adapter/market-breadth/v1', 'simple-adapter/conditional-volatility/v1', 'simple-adapter/session-auction/v1', 'simple-adapter/swing-transition/v1']);
  const raw = readFileSync(new URL('../rlexperience-adapters/market-structure.js', import.meta.url), 'utf8');
  // Strip comments so the scan targets real authority CALLS, not the doc prose that
  // names the forbidden capabilities it deliberately avoids.
  const source = raw
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const forbidden = [
    /\bfetch\s*\(/,
    /\bproviderFetch\s*\(/,
    /\bRLDATA\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bXMLHttpRequest\b/,
    /\bimport\s*\(/,
    /rlexperience-adapters\/(options|macro-rotation|fundamental-models|strategy-research|property-research|market-action)/
  ];
  for (const pattern of forbidden) {
    assert.equal(pattern.test(source), false, `market-structure.js must not contain ${pattern}`);
  }
});

test('TP-05-01 owner functions are byte/semantic parity with the market-heatmap-lab.html inline formula', () => {
  const ms = loadMarketStructure();
  const pagePctOver = extractPageFunction(OWNER_PAGE, 'pctOver');
  const pageMeanSd = extractPageFunction(OWNER_PAGE, 'meanSd');
  const pageBreadthRead = extractPageFunction(OWNER_PAGE, 'breadthRead');

  const barBatches = [
    [{ c: 100 }, { c: 101 }, { c: 103 }, { c: 99 }, { c: 105 }, { c: 110 }],
    [{ c: 50 }, { c: 55 }],
    [{ c: 0 }, { c: 10 }],
    [{ c: 100 }],
    []
  ];
  for (const rows of barBatches) {
    for (const win of [1, 5, 21]) {
      assert.equal(
        ms.pctOverWindow(rows, win),
        pagePctOver(rows, win),
        `pctOverWindow parity win=${win}`
      );
    }
  }

  const numberBatches = [[1, 2, 3, 4], [5], [], [2.5, 2.5, 2.5], [-3, 7, 11, -1]];
  for (const xs of numberBatches) {
    assert.deepEqual(ms.meanSampleSd(xs), pageMeanSd(xs), 'meanSampleSd parity');
  }

  const cellBatches = [
    [{ ticker: 'A', pct: 1 }, { ticker: 'B', pct: -2 }, { ticker: 'C', pct: 0.5 }],
    [{ ticker: 'A', pct: -1 }, { ticker: 'B', pct: -2 }],
    [{ ticker: 'A', pct: 3 }, { ticker: 'B', pct: 4 }],
    []
  ];
  for (const cells of cellBatches) {
    assert.deepEqual(ms.breadthReadCells(cells), pageBreadthRead(cells), 'breadthReadCells parity');
  }
});

test('TP-05-01 market-breadth adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = breadthDefinition();
  const runtime = runtimeFor(api, definition);
  const results = ms.registerMarketStructureAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/market-breadth/v1'].ok, true, JSON.stringify(results['simple-adapter/market-breadth/v1'].error || {}));

  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: ownerFixture() },
    parameterValues: defaultValues(definition),
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready');
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.breadth.pct, 35);
  assert.equal(summary.leadership.state, 'narrow');
  assert.equal(summary.leadership.margin, -25);
  assert.deepEqual(summary.groups.map((group) => group.group), ['Fin', 'Tech']);
  assert.deepEqual(summary.outliers, []);
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity);
});

test('TP-05-01 each enabled market-breadth parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = breadthDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: ownerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  });

  const cases = [
    ['window', '1w', 'summary.leadership'],
    ['grouping', 'industry', 'summary.groups'],
    ['size-metric', 'equal', 'summary.breadth'],
    ['breadth-threshold', 30, 'summary.leadership'],
    ['outlier-sigma', 1, 'summary.outliers']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-23T20:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, true, `${parameterId} must change ${path}`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    // Restore baseline for the next isolated one-at-a-time change.
    await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-23T20:03:30.000Z' });
  }
});

test('TP-05-01 market-breadth compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = breadthDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  const first = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: ownerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  }));
  const runtime2 = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime2, api, [definition]);
  const second = requireValue(await runtime2.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: ownerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:09:00.000Z'
  }));
  assert.equal(first.computeIdentity, second.computeIdentity);
  assert.equal(api.fingerprint(first.current.output), api.fingerprint(second.current.output));
});

test('TP-05-01 market-breadth adapter performs zero fetch provider storage author or publication calls', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = breadthDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition]);
  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  const calls = { fetch: 0, storage: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  try {
    const base = defaultValues(definition);
    const run = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: ownerFixture() },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-23T20:02:00.000Z'
    }));
    assert.equal(run.state, 'ready');
    await runtime.recompute({ parameterValues: { ...base, 'breadth-threshold': 30 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-23T20:03:00.000Z' });
  } finally {
    globalThis.fetch = sentinels.fetch;
    globalThis.localStorage = sentinels.localStorage;
    globalThis.sessionStorage = sentinels.sessionStorage;
  }
  assert.equal(calls.fetch, 0);
  assert.equal(calls.storage, 0);
});

/* ═══════════ conditional-volatility (owner seam = rlvol.js) ═══════════
   The volatility owner formula (EWMA/GARCH estimator, regime percentile band,
   capped-and-floored sizing multiplier) already lives ONLY in rlvol.js, and
   volatility-sizing-lab.html already consumes RLVOL.buildVolDecisionRead in its
   Power path. So the conditional-volatility Simple adapter is single-sourced by
   construction: it consumes the SAME rlvol formula through dependency injection
   (never a fetch, never a re-implemented formula, never an owner-page edit). */

function loadRlvol() {
  const path = require.resolve('../rlvol.js');
  delete require.cache[path];
  return require(path);
}

function volDefinition() {
  return clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'volatility-sizing-lab'));
}

/* Deterministic heteroskedastic closes: a calm early regime then a volatile late
   regime, long enough that the optional GARCH optimizer converges to a value that
   differs from EWMA, a ready decision is produced, and the regime-window parameter
   genuinely changes the realized-vol history it scores. Never a fabricated feed. */
function volCloses() {
  let state = 987654321;
  const rand = () => { state = (1103515245 * state + 12345) & 0x7fffffff; return (state + 1) / 0x80000000; };
  const closes = [];
  let close = 100;
  for (let i = 0; i < 300; i += 1) {
    const sd = i < 180 ? 0.004 : 0.024;
    const u1 = rand();
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    close *= Math.exp(sd * z);
    closes.push(Math.round(close * 1e6) / 1e6);
  }
  return closes;
}

function volOwnerState() {
  const policy = clone(readJson('tests/fixtures/volatility-sizing/commonjs-determinism-input.json').policy);
  const closes = volCloses();
  const rows = closes.map((close, index) => ({ t: Date.UTC(2025, 0, 1) + index * 86400000, c: close }));
  const decisionTime = '2026-07-23T20:00:00.000Z';
  return {
    contractVersion: 'volatility-owner-state/v1',
    toolId: 'volatility-sizing-lab',
    asOf: '2026-07-23',
    decisionTime,
    configVersion: 'test-vol-owner-v1',
    historyRange: '5y',
    source: { id: 'pages-snapshot', url: null },
    asset: {
      symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', cohort: 'equity-index', management: 'free-float',
      defaultTargetVol: 0.15, regimeWindowObs: 120, minForecastObs: 60, reviewWindowHours: 168, limitations: []
    },
    policy,
    bars: { rows, observedAsOf: '2026-07-23', retrievedAt: decisionTime, source: { id: 'pages-snapshot', url: null } }
  };
}

test('TP-05-01 conditional-volatility adapter registers and is single-sourced from rlvol.buildVolDecisionRead', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const rlvol = loadRlvol();
  const definition = volDefinition();
  const runtime = runtimeFor(api, definition);
  const results = ms.registerMarketStructureAdapters(runtime, api, [definition], { rlvol });
  assert.equal(results['simple-adapter/conditional-volatility/v1'].ok, true, JSON.stringify(results['simple-adapter/conditional-volatility/v1'].error || {}));

  const owner = volOwnerState();
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: defaultValues(definition),
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready');
  const summary = prepared.current.output.values.summary;

  // Owner parity: the adapter must reflect the EXACT owner facts rlvol produces for
  // the same reconstructed input — one formula source (rlvol.js), consumed by both
  // the vol page's Power path and this Simple adapter.
  const direct = rlvol.buildVolDecisionRead(ms.buildVolatilityInput(owner, defaultValues(definition)));
  assert.equal(direct.state, 'ready');
  assert.equal(summary.forecast.annualizedDecimal, direct.forecast.value, 'forecast value parity');
  assert.equal(summary.forecast.estimator, direct.diagnostics.estimatorResolved, 'estimator parity');
  assert.equal(summary.regime.band, direct.regime.band, 'regime band parity');
  assert.equal(summary.regime.windowObservations, direct.regime.windowRef.observations, 'regime window parity');
  assert.equal(summary.throttle.multiplier, direct.sizing.multiplier, 'sizing multiplier parity');
  assert.equal(summary.throttle.capMultiplier, direct.sizing.cap, 'sizing cap parity');
  assert.equal(summary.cashExample.conditionalExposure, direct.sizing.workedExample.conditionalExposure, 'cash example parity');
  assert.equal(summary.forecast.termPoints.length, direct.term.points.length, 'term horizon parity');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity);
});

test('TP-05-01 each enabled conditional-volatility parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const rlvol = loadRlvol();
  const definition = volDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition], { rlvol });
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: volOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  });

  const cases = [
    ['estimator', 'garch', 'summary.forecast'],
    ['window', 30, 'summary.regime'],
    ['target-volatility', 25, 'summary.throttle'],
    ['multiplier-cap', 0.3, 'summary.throttle'],
    ['volatility-floor', 40, 'summary.throttle'],
    ['notional', 250000, 'summary.cashExample'],
    ['horizon', 63, 'summary.forecast']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-23T20:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, true, `${parameterId} must change ${path}`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-23T20:03:30.000Z' });
  }
});

test('TP-05-01 conditional-volatility compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const rlvol = loadRlvol();
  const definition = volDefinition();
  const runtimeA = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtimeA, api, [definition], { rlvol });
  const base = defaultValues(definition);
  const first = requireValue(await runtimeA.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: volOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:02:00.000Z'
  }));
  const runtimeB = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtimeB, api, [definition], { rlvol });
  const second = requireValue(await runtimeB.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: volOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-23T20:09:00.000Z'
  }));
  assert.equal(first.computeIdentity, second.computeIdentity);
  assert.equal(api.fingerprint(first.current.output), api.fingerprint(second.current.output));
});

test('TP-05-01 conditional-volatility adapter performs zero fetch provider storage author or publication calls', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const rlvol = loadRlvol();
  const definition = volDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition], { rlvol });
  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  const calls = { fetch: 0, storage: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  try {
    const base = defaultValues(definition);
    const run = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: volOwnerState() },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-23T20:02:00.000Z'
    }));
    assert.equal(run.state, 'ready');
    await runtime.recompute({ parameterValues: { ...base, 'target-volatility': 20 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-23T20:03:00.000Z' });
  } finally {
    globalThis.fetch = sentinels.fetch;
    globalThis.localStorage = sentinels.localStorage;
    globalThis.sessionStorage = sentinels.sessionStorage;
  }
  assert.equal(calls.fetch, 0);
  assert.equal(calls.storage, 0);
});

test('TP-05-01 volatility-sizing-lab.html single-sources the vol formula from rlvol.js with no inline copy', () => {
  const page = readFileSync(new URL('../volatility-sizing-lab.html', import.meta.url), 'utf8');
  assert.match(page, /RLVOL\.buildVolDecisionRead\s*\(/, 'vol page consumes rlvol.buildVolDecisionRead');
  // The owner vol formula lives ONLY in rlvol.js; the page must not reimplement it inline.
  for (const inlineFormula of [/function\s+ewmaVar\s*\(/, /function\s+garch11Fit\s*\(/, /function\s+sizingMultiplier\s*\(/, /function\s+regimeBand\s*\(/]) {
    assert.equal(inlineFormula.test(page), false, `vol page must not reimplement ${inlineFormula}`);
  }
});

/* ═══════════ session-auction (owner seam = intraday-tape-lab.html) ═══════════
   The intraday session formula (VWAP + sigma bands, session volume profile POC/VAH/VAL,
   opening range, session-type + algo/retail control read) is extracted VERBATIM into
   market-structure.js as the single owner source. The owning page now delegates
   computeSession/sessionType/controlRead to RLMARKETSTRUCTURE (single source), and this
   Simple adapter calls the SAME functions — one formula, no inline copy. */

function sessionDefinition() {
  return clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'intraday-tape-lab'));
}

/* Deterministic 5-minute session: gentle up-drift with a cyclical wiggle (so VWAP has real
   dispersion and a few crosses). Bar 0 is deliberately tight and bar 3 deliberately tall so a
   short (1-bar) opening range differs from a 30-min (6-bar) opening range — a genuine
   opening-range effect, never a fabricated feed. */
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
    const v = 500 + (i % 5) * 120;
    bars.push({ t: startT + i * 5 * 60000, o, h, l, c, v });
  }
  return bars;
}

/* Five prior sessions trade in a LOWER price band than today, so a composite volume profile
   over N=5 sessions has a genuinely different POC/VAH/VAL than the single (N=1) today session
   — a real profile-window effect. */
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
    asOf: '2026-07-25T20:00:00.000Z',
    ivMin: 5,
    source: 'pages-snapshot',
    gap,
    gamma: { callWall: 100.6, putWall: 99.4, flip: 100.0 },
    sessions
  };
}

test('TP-05-01 session-auction adapter registers and reflects intraday-tape-lab owner facts (single-sourced computeSession/sessionType/controlRead)', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = sessionDefinition();
  const runtime = runtimeFor(api, definition);
  const results = ms.registerMarketStructureAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/session-auction/v1'].ok, true, JSON.stringify(results['simple-adapter/session-auction/v1'] && results['simple-adapter/session-auction/v1'].error || {}));

  const owner = sessionOwnerState();
  const todayBars = owner.sessions[owner.sessions.length - 1].bars;
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready');
  const summary = prepared.current.output.values.summary;

  // Owner parity: the adapter reflects the EXACT owner facts the single-sourced owner functions
  // produce for the same frozen bars — one formula source (market-structure.js), consumed by both
  // the intraday page's Power path and this Simple adapter.
  const t = ms.computeSession(todayBars, base['opening-range'], owner.ivMin);
  const ownerType = ms.sessionType(t);
  const ownerControl = ms.controlRead(t, owner.gap);
  assert.equal(summary.sessionType.ownerType, ownerType.type, 'session-type parity');
  assert.equal(summary.sessionType.orHigh, t.orHi, 'opening-range high parity');
  assert.equal(summary.sessionType.orLow, t.orLo, 'opening-range low parity');
  assert.equal(summary.levels.vwap, t.vwap, 'vwap parity');
  assert.equal(summary.levels.sd, t.sd, 'sigma parity');
  assert.equal(summary.levels.sessionPoc, t.poc, 'session POC parity');
  assert.equal(summary.levels.sessionVah, t.vah, 'session VAH parity');
  assert.equal(summary.levels.sessionVal, t.val, 'session VAL parity');
  assert.equal(summary.control.score, ownerControl.score, 'control score parity');
  assert.equal(summary.control.label, ownerControl.label, 'control label parity');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity);
});

test('TP-05-01 each enabled session-auction parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = sessionDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition]);
  const owner = sessionOwnerState();
  const todayBars = owner.sessions[owner.sessions.length - 1].bars;
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  });

  // Pick a control-threshold on the opposite side of the actual owner control score so the
  // control-state genuinely flips (never a tautological echo of the raw threshold).
  const score = ms.controlRead(ms.computeSession(todayBars, base['opening-range'], owner.ivMin), owner.gap).score;
  const ctlChange = score < base['control-threshold']
    ? Math.max(0, Math.round((score - 0.1) / 0.05) * 0.05)
    : Math.min(1, Math.round((score + 0.1) / 0.05) * 0.05);

  const cases = [
    ['opening-range', 5, 'summary.sessionType'],
    ['vwap-band', 2, 'summary.levels'],
    ['profile-window', 1, 'summary.levels'],
    ['control-threshold', ctlChange, 'summary.control'],
    ['gamma-context', 'exclude', 'summary.sessionType']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, true, `${parameterId} must change ${path}`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:30.000Z' });
  }
});

test('TP-05-01 session-auction compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = sessionDefinition();
  const runtimeA = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtimeA, api, [definition]);
  const base = defaultValues(definition);
  const first = requireValue(await runtimeA.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: sessionOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  const runtimeB = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtimeB, api, [definition]);
  const second = requireValue(await runtimeB.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: sessionOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:09:00.000Z'
  }));
  assert.equal(first.computeIdentity, second.computeIdentity);
  assert.equal(api.fingerprint(first.current.output), api.fingerprint(second.current.output));
});

test('TP-05-01 session-auction adapter performs zero fetch provider storage author or publication calls', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = sessionDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition]);
  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  const calls = { fetch: 0, storage: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  try {
    const base = defaultValues(definition);
    const run = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: sessionOwnerState() },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    }));
    assert.equal(run.state, 'ready');
    await runtime.recompute({ parameterValues: { ...base, 'vwap-band': 2 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:00.000Z' });
  } finally {
    globalThis.fetch = sentinels.fetch;
    globalThis.localStorage = sentinels.localStorage;
    globalThis.sessionStorage = sentinels.sessionStorage;
  }
  assert.equal(calls.fetch, 0);
  assert.equal(calls.storage, 0);
});

test('TP-05-01 intraday-tape-lab.html single-sources the session formula from market-structure.js with no inline copy', () => {
  const page = readFileSync(new URL('../intraday-tape-lab.html', import.meta.url), 'utf8');
  assert.match(page, /rlexperience-adapters\/market-structure\.js/, 'intraday page loads market-structure.js');
  assert.match(page, /RLMARKETSTRUCTURE\.computeSession\s*\(/, 'intraday page delegates computeSession to the module');
  assert.match(page, /RLMARKETSTRUCTURE\.sessionType\s*\(/, 'intraday page delegates sessionType to the module');
  assert.match(page, /RLMARKETSTRUCTURE\.controlRead\s*\(/, 'intraday page delegates controlRead to the module');
  // The single owner source lives in market-structure.js; the page must not carry a second inline copy.
  assert.equal(/cumPV2 \+= b\.v \* tp \* tp/.test(page), false, 'intraday page has no inline computeSession VWAP formula');
  assert.equal(/held above VWAP, closing near the highs/.test(page), false, 'intraday page has no inline sessionType formula');
  assert.equal(/low VWAP adherence . retail/.test(page), false, 'intraday page has no inline controlRead formula');
});

/* ═══════════ swing-transition (owner seam = swing-structure-lab.html) ═══════════
   The swing owner formula (MA stack smaArr, MA-alignment swing state, structural
   pattern via pivots, OBV/accumulation, and the macro regime band) is extracted
   VERBATIM into market-structure.js as the single owner source. The owning page now
   delegates smaArr/alignment/pivots/structure/accumDist/regimeBand to RLMARKETSTRUCTURE
   (single source), and this Simple adapter calls the SAME functions — one formula, no
   inline copy. Every declared parameter steers a derived owner path through real owner
   compute; echoed raw params live under summary.params only, never inside a declared path. */

function swingDefinition() {
  return clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'swing-structure-lab'));
}

/* Deterministic daily closes engineered so every declared parameter provably moves its
   declared owner path (real steerable effects, never a fabricated feed):
   - a 100->120 uptrend over ~230 bars builds a genuine 20/50/200 MA stack (fast/medium/slow-ma),
   - a late 20-bar pullback from the 120 peak makes the 63-day regime window net-up while the
     20-day window is net-down, so regime-window genuinely flips the macro regime band,
   - a small local pivot high inside the pullback sits just under the last close, so the last
     close's extension above the most recent owner pivot high is a small % (breakout-tolerance flip),
   - late volume expansion makes recent relative volume clear a moderate ratio (volume-confirmation),
   - OBV slopes down through the pullback while the MA read is range, so OBV diverges from trend
     (obv-confirmation toggles the confirmation gate). */
function swingFull() {
  const rows = [];
  const N = 250;
  const pullback = [120, 119.4, 118.8, 118.2, 117.6, 117.0, 116.6, 116.3, 116.1, 116.0, 116.2, 116.6, 117.0, 116.7, 116.4, 116.6, 117.0, 117.4, 117.6, 117.8, 118.0];
  for (let i = 0; i < N; i += 1) {
    let c;
    if (i <= 229) c = Math.round((100 + (i / 229) * 20) * 1e6) / 1e6;
    else c = pullback[i - 229];
    const o = i === 0 ? c : rows[i - 1].c;
    const h = Math.round((Math.max(o, c) + 0.2) * 1e6) / 1e6;
    const l = Math.round((Math.min(o, c) - 0.2) * 1e6) / 1e6;
    const v = 1000 + (i > 229 ? 600 : 0) + (i % 5) * 20;
    rows.push({ t: Date.UTC(2025, 0, 1) + i * 86400000, o, h, l, c, v });
  }
  return rows;
}

function swingOwnerState() {
  return {
    contractVersion: 'swing-transition-owner-state/v1',
    toolId: 'swing-structure-lab',
    symbol: 'DEMO',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot',
    full: swingFull(),
    macro: { fg: { score: 70, band: 'Greed' }, vix: 15.5 }
  };
}

/* Single-source: the swing owner formula (smaArr / alignment / pivots / structure / accumDist /
   regimeBand) lives ONLY in market-structure.js. The owning page delegates to RLMARKETSTRUCTURE and
   must carry no inline copy of the formula. (The byte/semantic parity of the extraction is pinned by
   the "Feature 012 Scope 05 swing-transition" canary group in scripts/selftest.mjs, which fingerprints
   the single-sourced owner functions against golden canonical values.) */
test('TP-05-01 swing-structure-lab.html single-sources the swing formula from market-structure.js with no inline copy', () => {
  const page = SWING_PAGE_REWIRED();
  assert.match(page, /rlexperience-adapters\/market-structure\.js/, 'swing page loads market-structure.js');
  assert.match(page, /RLMARKETSTRUCTURE\.smaArr\s*\(/, 'swing page delegates smaArr to the module');
  assert.match(page, /RLMARKETSTRUCTURE\.alignment\s*\(/, 'swing page delegates alignment to the module');
  assert.match(page, /RLMARKETSTRUCTURE\.pivots\s*\(/, 'swing page delegates pivots to the module');
  assert.match(page, /RLMARKETSTRUCTURE\.structure\s*\(/, 'swing page delegates structure to the module');
  assert.match(page, /RLMARKETSTRUCTURE\.accumDist\s*\(/, 'swing page delegates accumDist to the module');
  assert.match(page, /RLMARKETSTRUCTURE\.regimeBand\s*\(/, 'swing page delegates regimeBand to the module');
  // The single owner source lives in market-structure.js; the page must not carry a second inline copy.
  assert.equal(/s -= bars\[i - n\]\.c/.test(page), false, 'swing page has no inline smaArr formula');
  assert.equal(/p > a && a > b && b > c/.test(page), false, 'swing page has no inline alignment formula');
  assert.equal(/obvSeries\.push\(obv\)/.test(page), false, 'swing page has no inline accumDist formula');
  assert.equal(/extreme greed without an intact uptrend/.test(page), false, 'swing page has no inline regimeBand formula');
  assert.equal(/', neckline ' \+ usd\(trough\)/.test(page), false, 'swing page has no inline structure formula');
});

/* Read the swing page fresh so the single-source assertion reflects the on-disk delegation state. */
function SWING_PAGE_REWIRED() {
  return readFileSync(new URL('../swing-structure-lab.html', import.meta.url), 'utf8');
}

test('TP-05-01 swing-transition adapter registers and reflects swing-structure-lab owner facts (single-sourced smaArr/alignment/structure/accumDist/regimeBand)', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = swingDefinition();
  const runtime = runtimeFor(api, definition);
  const results = ms.registerMarketStructureAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/swing-transition/v1'].ok, true, JSON.stringify(results['simple-adapter/swing-transition/v1'] && results['simple-adapter/swing-transition/v1'].error || {}));

  const owner = swingOwnerState();
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready');
  const summary = prepared.current.output.values.summary;

  // Owner parity: the adapter reflects the EXACT owner facts the single-sourced owner functions
  // produce for the same frozen bars — one formula source (market-structure.js), consumed by both
  // the swing page's Power path and this Simple adapter.
  const full = owner.full;
  const ma = { m20: ms.smaArr(full, base['fast-ma']), m50: ms.smaArr(full, base['medium-ma']), m200: ms.smaArr(full, base['slow-ma']) };
  const align = ms.alignment(full, ma);
  const struct = ms.structure(full, ma, align);
  const ad = ms.accumDist(full);
  assert.equal(summary.swingState.label, align.label, 'swing-state label parity');
  assert.equal(summary.swingState.trend, align.trend, 'swing-state trend parity');
  assert.equal(summary.pattern.ownerPattern, struct.pattern, 'structure pattern parity');
  assert.equal(summary.pattern.ownerStage, struct.stage, 'structure stage parity');
  assert.equal(summary.confirmation.obvLabel, ad.label, 'accum/distribution label parity');
  assert.equal(summary.confirmation.obvScore, ad.score, 'accum/distribution score parity');
  const regime = ms.regimeBand(owner.macro.fg, summary.regime.trend, owner.macro.vix);
  assert.equal(summary.regime.band, regime.band, 'regime band parity');
  assert.equal(summary.regime.note, regime.note, 'regime note parity');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity);
});

test('TP-05-01 each enabled swing-transition parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = swingDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition]);
  const owner = swingOwnerState();
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });

  // Compute the baseline owner facts so each numeric change is chosen on the opposite side of the
  // real owner threshold (a genuine state flip, never a tautological echo of the raw parameter).
  const baseSummary = ms.computeSwingTransitionSummary(owner, base);
  const ext = baseSummary.transition.extensionPct;
  const breakoutChange = ext >= base['breakout-tolerance']
    ? Math.min(10, Math.round((ext + 0.5) / 0.25) * 0.25)
    : Math.max(0, Math.round((ext - 0.5) / 0.25) * 0.25);
  const relVol = baseSummary.confirmation.relVolume;
  const volChange = relVol >= base['volume-confirmation']
    ? Math.min(3, Math.round((relVol + 0.3) / 0.1) * 0.1)
    : Math.max(0.5, Math.round((relVol - 0.3) / 0.1) * 0.1);
  const evid = baseSummary.pattern.evidenceScore;
  const patternChange = evid >= base['pattern-threshold']
    ? Math.min(1, Math.round((evid + 0.15) / 0.05) * 0.05)
    : Math.max(0, Math.round((evid - 0.15) / 0.05) * 0.05);

  const cases = [
    ['fast-ma', 10, 'summary.swingState'],
    ['medium-ma', 30, 'summary.swingState'],
    ['slow-ma', 150, 'summary.swingState'],
    ['breakout-tolerance', breakoutChange, 'summary.transition'],
    ['volume-confirmation', volChange, 'summary.confirmation'],
    ['obv-confirmation', false, 'summary.confirmation'],
    ['pattern-threshold', patternChange, 'summary.pattern'],
    ['regime-window', 20, 'summary.regime']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-24T20:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, true, `${parameterId} must change ${path}`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-24T20:03:30.000Z' });
  }
});

test('TP-05-01 swing-transition compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = swingDefinition();
  const runtimeA = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtimeA, api, [definition]);
  const base = defaultValues(definition);
  const first = requireValue(await runtimeA.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: swingOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  const runtimeB = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtimeB, api, [definition]);
  const second = requireValue(await runtimeB.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: swingOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:09:00.000Z'
  }));
  assert.equal(first.computeIdentity, second.computeIdentity);
  assert.equal(api.fingerprint(first.current.output), api.fingerprint(second.current.output));
});

test('TP-05-01 swing-transition adapter performs zero fetch provider storage author or publication calls', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = swingDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition]);
  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  const calls = { fetch: 0, storage: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  try {
    const base = defaultValues(definition);
    const run = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: swingOwnerState() },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-24T20:02:00.000Z'
    }));
    assert.equal(run.state, 'ready');
    await runtime.recompute({ parameterValues: { ...base, 'regime-window': 20 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-24T20:03:00.000Z' });
  } finally {
    globalThis.fetch = sentinels.fetch;
    globalThis.localStorage = sentinels.localStorage;
    globalThis.sessionStorage = sentinels.sessionStorage;
  }
  assert.equal(calls.fetch, 0);
  assert.equal(calls.storage, 0);
});

