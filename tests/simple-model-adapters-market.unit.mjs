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

/* The owner page source, read once, so the single-source tests below can assert the
   page delegates its breadth/outlier compute to the module (RLMARKETSTRUCTURE) and
   carries no inline formula copy. */
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
  assert.deepEqual(ms.supportedAdapterIds, ['simple-adapter/market-breadth/v1', 'simple-adapter/conditional-volatility/v1', 'simple-adapter/session-auction/v1', 'simple-adapter/swing-transition/v1', 'simple-adapter/technical-five-gate/v1']);
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

test('TP-05-01 market-structure owner breadth functions pin the single-source formula (Number.isFinite parity with the delegating page)', () => {
  const ms = loadMarketStructure();

  // pctOverWindow: window % return. A null endpoint yields null (never a global-isFinite
  // coerced 0), matching the page's `function isFinite(x){return Number.isFinite(x);}` shim.
  assert.equal(ms.pctOverWindow([{ c: 100 }, { c: 110 }], 1), (110 / 100 - 1) * 100, 'pctOverWindow 1-back = +10%');
  assert.equal(ms.pctOverWindow([{ c: 100 }, { c: 101 }, { c: 103 }, { c: 99 }, { c: 105 }, { c: 110 }], 5), (110 / 100 - 1) * 100, 'pctOverWindow 5-back');
  assert.equal(ms.pctOverWindow([{ c: 100 }], 1), null, 'pctOverWindow needs >=2 rows');
  assert.equal(ms.pctOverWindow([{ c: 100 }, { c: null }], 1), null, 'pctOverWindow rejects a null last close (Number.isFinite, not coercing global isFinite)');
  assert.equal(ms.pctOverWindow([{ c: 100 }, { c: null }, { c: 121 }], 1), null, 'pctOverWindow rejects a null base close');

  // meanSampleSd: mean + sample stdev; null members are rejected (Number.isFinite), so
  // [2, null, 4] reduces to [2, 4] => mean 3 (NOT a coerced [2, 0, 4] => mean 2).
  assert.deepEqual(ms.meanSampleSd([2, 4, 6]), { mean: 4, sd: 2 }, 'meanSampleSd finite');
  assert.deepEqual(ms.meanSampleSd([2, null, 4]), { mean: 3, sd: Math.sqrt(2) }, 'meanSampleSd rejects null (parity with page Number.isFinite shim)');
  assert.deepEqual(ms.meanSampleSd([]), { mean: 0, sd: 0 }, 'meanSampleSd empty');
  assert.deepEqual(ms.meanSampleSd([5]), { mean: 5, sd: 0 }, 'meanSampleSd single => sd 0');

  // breadthReadCells: unavailable (pct === null) cells are EXCLUDED from total, so a
  // universe with a null constituent is not wrongly inflated (global isFinite(null) === true).
  const withNull = [{ ticker: 'A', pct: 2 }, { ticker: 'B', pct: null }, { ticker: 'C', pct: -1 }];
  assert.deepEqual(
    ms.breadthReadCells(withNull),
    { green: 1, total: 2, leader: withNull[0], laggard: withNull[2], bias: 'mixed', frac: 0.5 },
    'breadthReadCells excludes null cells from total (parity with page)'
  );
  assert.equal(ms.breadthReadCells([{ pct: 1 }, { pct: 1 }, { pct: 1 }]).bias, 'risk-on', 'breadthReadCells all-green => risk-on');
  assert.equal(ms.breadthReadCells([]).bias, 'n/a', 'breadthReadCells empty => n/a');
});

test('TP-05-01 market-heatmap-lab.html single-sources the breadth formula from market-structure.js with no inline copy', () => {
  assert.match(OWNER_PAGE, /rlexperience-adapters\/market-structure\.js/, 'heatmap page loads market-structure.js');
  assert.match(OWNER_PAGE, /RLMARKETSTRUCTURE\.pctOverWindow\s*\(/, 'heatmap page delegates pctOver to the module');
  assert.match(OWNER_PAGE, /RLMARKETSTRUCTURE\.meanSampleSd\s*\(/, 'heatmap page delegates meanSd to the module');
  assert.match(OWNER_PAGE, /RLMARKETSTRUCTURE\.breadthReadCells\s*\(/, 'heatmap page delegates breadthRead to the module');
  assert.match(OWNER_PAGE, /WIN_BARS\s*=\s*RLMARKETSTRUCTURE\.WINDOW_BARS/, 'heatmap page single-sources WIN_BARS from the module');
  // The single owner source lives in market-structure.js; the page must not carry a second inline copy.
  assert.equal(/last\.c \/ base\.c - 1\) \* 100/.test(OWNER_PAGE), false, 'heatmap page has no inline pctOver formula');
  assert.equal(/Math\.sqrt\(s \/ \(n - 1\)\)/.test(OWNER_PAGE), false, 'heatmap page has no inline meanSd formula');
  assert.equal(/frac > 0\.6 \? "risk-on"/.test(OWNER_PAGE), false, 'heatmap page has no inline breadthRead formula');
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

/* ═══════════ technical-five-gate (owner seam = technical-analysis-decision-lab.html) ═══════════
   technical-analysis-decision-lab.html is a Scope-01 FOUNDATION-RECEIPT VALIDATOR: it validates
   reusable source/session/bar/identity contracts and EXPLICITLY publishes no analytic result
   ("No signal, neutral, setup, or probability is published by Scope 01"; window.__TAD_DIAGNOSTICS__
   carries ownerReadPublished:false). There is therefore NO owner five-gate MODEL to extract that
   turns context/location/confirmation/validation gate scores and entry/stop/cost into a setup state
   and expectancy. The adapter is the HONEST boundary: the foundation receipt IS present (evidence
   state ready), but the five-gate model is absent, so compute returns explicit UNAVAILABLE naming
   the missing owner capability rather than reinterpreting the foundation receipt as a signal.
   Because the model is absent, every enabled parameter sits in a PROVED FLAT REGION (the unavailable
   output is parameter-invariant) — not a missing effect. The `entry` parameter is evidence-derived
   (defaultValue null), so the test supplies an EXPLICIT user entry to reach the graceful-unavailable
   render through compute WITHOUT inventing an owner signal. No page rewire exists: there is no owner
   formula to single-source until the owner five-gate model is implemented. */

function technicalDefinition() {
  return clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'technical-analysis-decision-lab'));
}

/* A frozen foundation-receipt owner snapshot mirroring the page's published receipt: the source,
   session, bar, and identity contracts are present (ready), but ownerReadPublished is false — the
   page asserts no signal/setup/probability. No owner five-gate model exists in this snapshot. */
function technicalOwnerState() {
  return {
    contractVersion: 'technical-foundation-owner-state/v1',
    toolId: 'technical-analysis-decision-lab',
    symbol: 'SPY',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot',
    foundationReceipt: {
      present: true,
      name: 'Weekly close integrity',
      session: 'XNYS venue-local weekly boundary',
      primary: 'Primary 1w closed plus provisional',
      ownerReadPublished: false
    }
  };
}

/* Defaults with an EXPLICIT user entry: `entry` is evidence-derived (defaultValue null) and the
   owner publishes no signal, so a user-assumption entry is supplied to reach compute — never an
   invented owner-derived entry. */
function technicalDefaults(definition) {
  return { ...defaultValues(definition), entry: 100 };
}

test('TP-05-01 technical-five-gate adapter registers and returns explicit unavailable naming the missing owner five-gate model', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = technicalDefinition();
  const runtime = runtimeFor(api, definition);
  const results = ms.registerMarketStructureAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/technical-five-gate/v1'].ok, true, JSON.stringify(results['simple-adapter/technical-five-gate/v1'] && results['simple-adapter/technical-five-gate/v1'].error || {}));

  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: technicalOwnerState() },
    parameterValues: technicalDefaults(definition),
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  // The foundation evidence IS ready, but the model output is explicit unavailable.
  assert.equal(prepared.state, 'unavailable', 'five-gate output is honestly unavailable');
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.state, 'unavailable');
  assert.match(summary.missingOwnerCapability, /five-gate/i, 'names the missing owner five-gate model');
  assert.match(summary.missingOwnerCapability, /technical-analysis-decision-lab/, 'names the owner page');
  assert.equal(summary.foundationReceipt.present, true, 'the foundation receipt IS present/ready');
  assert.equal(summary.setupState.state, 'unavailable');
  assert.equal(summary.evidenceState.state, 'unavailable');
  assert.equal(summary.gates.context.state, 'unavailable');
  assert.equal(summary.gates.validation.state, 'unavailable');
  assert.equal(summary.expectancy.state, 'unavailable');
  // No invented owner signal: provenance is unavailable-only, and no observed-fact class is claimed.
  assert.deepEqual(prepared.current.output.provenance.classes, ['unavailable']);
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity);
  // The owner projection also surfaces the unavailable state honestly (no numeric signal).
  const projection = requireValue(runtime.project());
  assert.equal(projection.state, 'unavailable');
  assert.equal(projection.numericValue, null, 'no numeric signal is published');
});

test('TP-05-01 technical-five-gate keeps every gate/setup/expectancy path in a proved flat region until the owner model exists', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = technicalDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition]);
  const base = technicalDefaults(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: technicalOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });

  const cases = [
    ['timeframe', 'intraday', 'summary.setupState'],
    ['data-tier', 'observed', 'summary.evidenceState'],
    ['context-threshold', 0.7, 'summary.gates.context'],
    ['location-threshold', 0.7, 'summary.gates.location'],
    ['confirmation-threshold', 0.7, 'summary.gates.confirmation'],
    ['validation-threshold', 0.7, 'summary.gates.validation'],
    ['entry', 105, 'summary.expectancy'],
    ['stop-distance', 6, 'summary.expectancy'],
    ['cost', 20, 'summary.expectancy'],
    ['family-requirement', 4, 'summary.setupState']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-24T20:03:00.000Z'
    }));
    assert.equal(run.state, 'unavailable', `${parameterId} keeps the model unavailable`);
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, false, `${parameterId} produces no output change (model absent)`);
    assert.notEqual(effect.flatRegionProof, null, `${parameterId} carries a proved flat region`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-24T20:03:30.000Z' });
  }
});

test('TP-05-01 technical-five-gate compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = technicalDefinition();
  const runtimeA = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtimeA, api, [definition]);
  const base = technicalDefaults(definition);
  const first = requireValue(await runtimeA.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: technicalOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  const runtimeB = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtimeB, api, [definition]);
  const second = requireValue(await runtimeB.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: technicalOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:09:00.000Z'
  }));
  assert.equal(first.computeIdentity, second.computeIdentity);
  assert.equal(api.fingerprint(first.current.output), api.fingerprint(second.current.output));
});

test('TP-05-01 technical-five-gate adapter performs zero fetch provider storage author or publication calls', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const definition = technicalDefinition();
  const runtime = runtimeFor(api, definition);
  ms.registerMarketStructureAdapters(runtime, api, [definition]);
  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  const calls = { fetch: 0, storage: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  try {
    const base = technicalDefaults(definition);
    const run = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: technicalOwnerState() },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-24T20:02:00.000Z'
    }));
    assert.equal(run.state, 'unavailable');
    await runtime.recompute({ parameterValues: { ...base, 'context-threshold': 0.7 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-24T20:03:00.000Z' });
  } finally {
    globalThis.fetch = sentinels.fetch;
    globalThis.localStorage = sentinels.localStorage;
    globalThis.sessionStorage = sentinels.sessionStorage;
  }
  assert.equal(calls.fetch, 0);
  assert.equal(calls.storage, 0);
});

/* ═══════════ options-anomaly (owner seam = options-flow-feed-lab.html) ═══════════
   The options-flow owner formula (vol/OI, premium notional, DTE, unusual score, chain
   parse/score, and the call/put tape read) is extracted VERBATIM into the single owner
   source rlexperience-adapters/options.js. This Simple adapter calls the SAME owner
   primitives — one formula source, consumed by both the owning page's Power path and
   Simple — proven at byte/semantic parity against the page's live inline functions.
   The adapter consumes the SAME-ORIGIN data/options projection the page hands it and
   creates no second chain producer (SCN-012-016). */

function loadOptions() {
  const path = require.resolve('../rlexperience-adapters/options.js');
  delete require.cache[path];
  return require(path);
}

const OPTIONS_FLOW_PAGE = readFileSync(new URL('../options-flow-feed-lab.html', import.meta.url), 'utf8');

function optionsAnomalyDefinition() {
  return clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'options-flow-feed-lab'));
}

const ANOMALY_NOW_MS = Date.UTC(2026, 6, 24, 20, 0, 0);
function expiryEpochForDte(dte) { return Math.round((ANOMALY_NOW_MS + dte * 86400000) / 1000); }

/* Synthetic frozen owner options snapshot (the same-origin data/options projection the
   page hands the adapter) engineered so every declared parameter provably moves its
   declared output path (real steerable effects, never a fabricated feed):
   - premiums span the 250k default so premium-threshold changes summary.contracts,
   - contracts sit at DTE 7/21/45 so expiry-window changes summary.contracts,
   - vol/OI spans 0.6..12 and IV spans 0.45..1.0 so the two unusualness thresholds
     change summary.unusualness,
   - a call/put premium mix so aggregation changes summary.callPutLean. */
function anomalyOwnerState() {
  return {
    contractVersion: 'options-owner-state/v1',
    toolId: 'options-flow-feed-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot data/options',
    nowMs: ANOMALY_NOW_MS,
    chains: [{
      ticker: 'SPY',
      spot: 100,
      expiry: expiryEpochForDte(7),
      rows: [
        { type: 'C', strike: 105, volume: 1000, oi: 200, iv: 0.80, mid: 6.0, expiry: expiryEpochForDte(7) },
        { type: 'C', strike: 110, volume: 800, oi: 400, iv: 0.50, mid: 4.0, expiry: expiryEpochForDte(21) },
        { type: 'P', strike: 95, volume: 300, oi: 500, iv: 0.45, mid: 3.0, expiry: expiryEpochForDte(7) },
        { type: 'P', strike: 90, volume: 1200, oi: 100, iv: 1.00, mid: 5.0, expiry: expiryEpochForDte(21) },
        { type: 'C', strike: 120, volume: 600, oi: 300, iv: 0.60, mid: 5.0, expiry: expiryEpochForDte(45) }
      ]
    }]
  };
}

function anomalyDefaults(definition) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
}

test('TP-05-01 options module exposes the delivered options adapters with no forbidden authority', () => {
  const opts = loadOptions();
  assert.deepEqual(opts.supportedAdapterIds, ['simple-adapter/options-anomaly/v1', 'simple-adapter/dealer-gamma-playbook/v1', 'simple-adapter/options-surface/v1']);
  const raw = readFileSync(new URL('../rlexperience-adapters/options.js', import.meta.url), 'utf8');
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
    /rlexperience-adapters\/(market-structure|macro-rotation|fundamental-models|strategy-research|property-research|market-action)/
  ];
  for (const pattern of forbidden) {
    assert.equal(pattern.test(source), false, `options.js must not contain ${pattern}`);
  }
});

test('TP-05-01 options-anomaly owner primitives are single-sourced in options.js (RLOPTIONS) and the page delegates with no inline formula copy', () => {
  const opts = loadOptions();

  // Golden-pin the single-source owner primitives (options.js === RLOPTIONS). The owning page's
  // Power path and the Simple adapter both consume these exact functions, so pinning the module
  // here pins the one formula both sides share. (Values match the scripts/selftest.mjs options canary.)
  assert.equal(opts.volOI(20, 10), 2, 'volOI 20/10 = 2');
  assert.equal(opts.volOI(5, 0), Infinity, 'volOI vol>0, OI 0 => Infinity (brand-new positioning)');
  assert.equal(opts.volOI(0, 0), 0, 'volOI 0/0 = 0');
  assert.equal(opts.volOI(3, 2), 1.5, 'volOI 3/2 = 1.5');
  assert.equal(opts.premiumNotional(10, 2.5), 2500, 'premiumNotional 10x2.5x100 = 2500');
  assert.equal(opts.premiumNotional(0, 2), 0, 'premiumNotional guards zero volume');
  assert.equal(opts.premiumNotional(10, 0), 0, 'premiumNotional guards zero mid');
  assert.equal(opts.premiumNotional(500, 2.1), 105000, 'premiumNotional 500x2.1x100 = 105000');
  assert.equal(opts.dteFrom(7 * 86400, 0), 7, 'dteFrom 7 days out from epoch 0 = 7');
  assert.equal(opts.dteFrom(NaN, 0), null, 'dteFrom bad expiry => null');

  // unusualScore stays in [0,100] and ranks a high vol/OI + high-premium + high-IV strike above a quiet one.
  const ctx = { maxVol: 1200, maxPrem: 600000 };
  const hot = opts.unusualScore({ volume: 1000, oi: 200, iv: 0.8, premium: 600000 }, ctx);
  const quiet = opts.unusualScore({ volume: 300, oi: 500, iv: 0.45, premium: 90000 }, ctx);
  assert.ok(hot >= 0 && hot <= 100 && quiet >= 0 && quiet <= 100, 'unusualScore in [0,100]');
  assert.ok(hot > quiet, 'unusualScore ranks the unusual strike above the quiet one');

  // parseYahooChain + scoreChain + tapeRead over one representative chain.
  const chainJson = { optionChain: { result: [{ quote: { regularMarketPrice: 100 }, options: [{ expirationDate: 1000000, calls: [{ strike: 100, volume: 500, openInterest: 100, impliedVolatility: 0.4, bid: 2, ask: 2.2, lastPrice: 2.1 }], puts: [{ strike: 95, volume: 50, openInterest: 200, impliedVolatility: 0.5, bid: 1, ask: 1.2, lastPrice: 1.1 }] }] }] } };
  const parsed = opts.parseYahooChain(clone(chainJson));
  assert.ok(parsed && parsed.spot === 100 && parsed.rows.length === 2, 'parseYahooChain: spot + call + put row');
  assert.equal(parsed.rows.find((r) => r.type === 'C').mid, 2.1, 'parseYahooChain: call mid = (bid+ask)/2');
  assert.equal(opts.parseYahooChain({}), null, 'parseYahooChain malformed => null');
  const scored = opts.scoreChain(opts.parseYahooChain(clone(chainJson)), 'TEST', 0);
  const scoredCall = scored.find((r) => r.type === 'C');
  assert.equal(scoredCall.premium, 500 * 2.1 * 100, 'scoreChain: call premium = vol x mid x 100');
  assert.equal(scoredCall.ticker, 'TEST', 'scoreChain tags the ticker');
  assert.ok(scored.every((r) => r.score >= 0 && r.score <= 100), 'scoreChain: all unusual scores in [0,100]');
  const tape = opts.tapeRead(scored);
  assert.ok(tape.frac > 0.6 && /call-heavy/.test(tape.lean), 'tapeRead: call-dominant premium => call-heavy lean');
  assert.equal(opts.tapeRead([]).lean, 'n/a', 'tapeRead: no rows => n/a');

  // Single-source wiring: the owning page loads options.js, delegates each owner primitive to
  // RLOPTIONS.*, and carries no inline copy of the owner formula (the formula lives only in options.js).
  assert.match(OPTIONS_FLOW_PAGE, /rlexperience-adapters\/options\.js/, 'options-flow page loads the options module');
  for (const fn of ['volOI', 'premiumNotional', 'dteFrom', 'unusualScore', 'parseYahooChain', 'scoreChain', 'tapeRead']) {
    assert.match(OPTIONS_FLOW_PAGE, new RegExp('RLOPTIONS\\.' + fn + '\\s*\\('), `options-flow page delegates ${fn} to RLOPTIONS`);
  }
  assert.equal(/return vol \/ oi;/.test(OPTIONS_FLOW_PAGE), false, 'options-flow page has no inline volOI formula');
  assert.equal(/vol \* mid \* 100/.test(OPTIONS_FLOW_PAGE), false, 'options-flow page has no inline premiumNotional formula');
  assert.equal(/0\.4 \* voS \+ 0\.3 \* vS/.test(OPTIONS_FLOW_PAGE), false, 'options-flow page has no inline unusualScore formula');
  assert.equal(/frac > 0\.6 \? "call-heavy/.test(OPTIONS_FLOW_PAGE), false, 'options-flow page has no inline tapeRead formula');
});

test('TP-05-01 options-anomaly adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = optionsAnomalyDefinition();
  const runtime = runtimeFor(api, definition);
  const results = opts.registerOptionsAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/options-anomaly/v1'].ok, true, JSON.stringify(results['simple-adapter/options-anomaly/v1'] && results['simple-adapter/options-anomaly/v1'].error || {}));

  const owner = anomalyOwnerState();
  const base = anomalyDefaults(definition);
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

  // Owner parity: the adapter reflects the EXACT owner facts the single-sourced owner
  // primitives produce for the same frozen chain — one formula source (options.js / RLOPTIONS),
  // consumed by both the owning page's Power path and this Simple adapter.
  const top = summary.contracts.top[0];
  const ownerRow = owner.chains[0].rows.find((r) => r.type === top.type && r.strike === top.strike);
  assert.ok(ownerRow, 'top contract maps to an owner row');
  assert.equal(top.premium, opts.premiumNotional(ownerRow.volume, ownerRow.mid), 'top contract premium parity vs single-source premiumNotional');
  assert.equal(top.dte, opts.dteFrom(ownerRow.expiry, ANOMALY_NOW_MS), 'top contract DTE parity vs single-source dteFrom');
  // Default window 30 + premium 250k flags Call105, Call110, Put90 (Call120 is DTE 45, out).
  assert.equal(summary.contracts.count, 3, 'three in-window contracts clear the default premium threshold');
  assert.equal(summary.unusualness.consideredCount, 4, 'four in-window contracts are considered for unusualness');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity);
});

test('TP-05-01 each enabled options-anomaly parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = optionsAnomalyDefinition();
  const runtime = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtime, api, [definition]);
  const base = anomalyDefaults(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: anomalyOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  });

  const cases = [
    ['expiry-window', 10, 'summary.contracts'],
    ['volume-open-interest-threshold', 3, 'summary.unusualness'],
    ['premium-threshold', 500000, 'summary.contracts'],
    ['implied-volatility-threshold', 70, 'summary.unusualness'],
    ['call-put-aggregation', 'net-premium', 'summary.callPutLean']
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

test('TP-05-01 options-anomaly compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = optionsAnomalyDefinition();
  const runtimeA = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtimeA, api, [definition]);
  const base = anomalyDefaults(definition);
  const first = requireValue(await runtimeA.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: anomalyOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  const runtimeB = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtimeB, api, [definition]);
  const second = requireValue(await runtimeB.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: anomalyOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:09:00.000Z'
  }));
  assert.equal(first.computeIdentity, second.computeIdentity);
  assert.equal(api.fingerprint(first.current.output), api.fingerprint(second.current.output));
});

test('TP-05-01 options-anomaly adapter performs zero fetch provider storage author or publication calls', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = optionsAnomalyDefinition();
  const runtime = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtime, api, [definition]);
  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  const calls = { fetch: 0, storage: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  try {
    const base = anomalyDefaults(definition);
    const run = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: anomalyOwnerState() },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    }));
    assert.equal(run.state, 'ready');
    await runtime.recompute({ parameterValues: { ...base, 'expiry-window': 10 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:00.000Z' });
  } finally {
    globalThis.fetch = sentinels.fetch;
    globalThis.localStorage = sentinels.localStorage;
    globalThis.sessionStorage = sentinels.sessionStorage;
  }
  assert.equal(calls.fetch, 0);
  assert.equal(calls.storage, 0);
});

/* ═══════════ dealer-gamma-playbook (owner seam = gamma-trading-lab.html) ═══════════
   The gamma owner primitives (percentileOf, oviPercentile, the OPEX clock opexInfo +
   thirdFriday/nextMonthly/nextQuarterly, and the sign-parameterized gammaEnv form of the
   page envOf) are extracted VERBATIM into the single owner source options.js and proven at
   byte/semantic parity against the page's live inline functions (envOf compared under both
   dealer-sign conventions). The adapter consumes the FROZEN gamma snapshot + history the
   page already produced (computeGamma) — it recomputes no chain and creates no new producer. */

const GAMMA_PAGE = readFileSync(new URL('../gamma-trading-lab.html', import.meta.url), 'utf8');
const GAMMA_NOW_MS = Date.UTC(2026, 6, 24, 20, 0, 0);

function gammaPlaybookDefinition() {
  return clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'gamma-trading-lab'));
}

/* Synthetic frozen owner gamma snapshot + rolling history engineered so every declared
   parameter provably moves its declared output path:
   - flip is null so the dealer-sign convention drives the netGEX regime sign (gammaState),
   - netGEX is negative so customer-long -> negative, customer-short -> positive,
   - oviQty sits at the 67th history percentile so ovi-threshold flips summary.oviState,
   - spot-path/aggressiveness/horizon steer distinct derived playbook fields,
   - time-to-expiry crosses the 14/30-day OPEX phase policy for summary.expirationState. */
function gammaOwnerState() {
  return {
    contractVersion: 'options-gamma-owner-state/v1',
    toolId: 'gamma-trading-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot data/options',
    nowMs: GAMMA_NOW_MS,
    ticker: 'SPY',
    snap: {
      spot: 100, netGEX: -5000, callWall: 105, putWall: 95, flip: null,
      maxPain: 100, atmIV: 0.45, ovi: 0.30, oviQty: 400, oviSig: 55, pcOI: 1.1, pcVol: 0.9
    },
    hist: [{ oviQty: 100 }, { oviQty: 200 }, { oviQty: 300 }, { oviQty: 400 }, { oviQty: 500 }, { oviQty: 600 }]
  };
}

function gammaDefaults(definition) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
}

test('TP-05-01 dealer-gamma-playbook owner primitives are single-sourced in options.js (RLOPTIONS) and the page delegates with no inline formula copy', () => {
  const opts = loadOptions();
  const snap = gammaOwnerState().snap;
  const hist = gammaOwnerState().hist;

  // gammaEnv golden pin under BOTH dealer-sign conventions: with flip absent the regime is the
  // sign-adjusted net-GEX sign; when both spot and flip are present spot-vs-flip wins (sign ignored).
  assert.equal(opts.gammaEnv(snap, 1), 'negative', 'gammaEnv customer-long: negative netGEX, flip absent => negative');
  assert.equal(opts.gammaEnv(snap, -1), 'positive', 'gammaEnv customer-short: sign flips negative netGEX => positive');
  const snapFlip = { spot: 100, netGEX: -5000, flip: 98 };
  assert.equal(opts.gammaEnv(snapFlip, 1), 'positive', 'gammaEnv spot>=flip => positive (customer-long)');
  assert.equal(opts.gammaEnv(snapFlip, -1), 'positive', 'gammaEnv spot>=flip => positive (sign ignored when flip present)');
  assert.equal(opts.gammaEnv(null, 1), 'unknown', 'gammaEnv null snap => unknown');

  // percentileOf + oviPercentile golden pins.
  assert.equal(opts.percentileOf([100, 200, 300, 400], 250), 50, 'percentileOf: 2 of 4 at/below 250 => 50');
  assert.equal(opts.percentileOf([100, 200, 300, 400, 500, 600], 400), 67, 'percentileOf: 4 of 6 at/below 400 => 67');
  assert.equal(opts.percentileOf([1], 5), 100, 'percentileOf: sole member at/below => 100');
  assert.equal(opts.percentileOf([], 5), null, 'percentileOf: empty history => null');
  assert.equal(opts.oviPercentile(hist, snap), 67, 'oviPercentile: 400 at the 67th percentile of the 100..600 history');
  assert.equal(opts.oviPercentile([{ oviQty: 1 }, { oviQty: 2 }], snap), null, 'oviPercentile: < 3 days of history => null');

  // OPEX clock golden pin at the frozen reference date (2026-07-24): monthly 28d, quarterly 56d,
  // nearest 28d => shakeout window.
  const opex = opts.opexInfo(new Date(GAMMA_NOW_MS));
  assert.equal(opex.dMon, 28, 'opexInfo monthly days to third-Friday');
  assert.equal(opex.dQtr, 56, 'opexInfo quarterly days to third-Friday');
  assert.equal(opex.dNear, 28, 'opexInfo nearest = min(monthly, quarterly)');
  assert.equal(opex.phase, 'shakeout', 'opexInfo phase (14 < dNear <= 30) => shakeout');

  // Single-source wiring: the owning page loads options.js, delegates the gamma owner primitives to
  // RLOPTIONS.*, and carries no inline copy of the owner formula.
  assert.match(GAMMA_PAGE, /rlexperience-adapters\/options\.js/, 'gamma page loads the options module');
  assert.match(GAMMA_PAGE, /RLOPTIONS\.gammaEnv\s*\(/, 'gamma page delegates envOf to RLOPTIONS.gammaEnv');
  assert.match(GAMMA_PAGE, /RLOPTIONS\.percentileOf\s*\(/, 'gamma page delegates percentileOf to RLOPTIONS');
  assert.match(GAMMA_PAGE, /RLOPTIONS\.oviPercentile\s*\(/, 'gamma page delegates oviPercentile to RLOPTIONS');
  assert.match(GAMMA_PAGE, /RLOPTIONS\.opexInfo\s*\(/, 'gamma page delegates opexInfo to RLOPTIONS');
  assert.equal(/snap\.spot >= snap\.flip \? "positive"/.test(GAMMA_PAGE), false, 'gamma page has no inline gammaEnv regime formula');
  assert.equal(/below \/ n \* 100/.test(GAMMA_PAGE), false, 'gamma page has no inline percentileOf formula');
});

test('TP-05-01 dealer-gamma-playbook adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = gammaPlaybookDefinition();
  const runtime = runtimeFor(api, definition);
  const results = opts.registerOptionsAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/dealer-gamma-playbook/v1'].ok, true, JSON.stringify(results['simple-adapter/dealer-gamma-playbook/v1'] && results['simple-adapter/dealer-gamma-playbook/v1'].error || {}));

  const owner = gammaOwnerState();
  const base = gammaDefaults(definition);
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

  // Owner parity: the adapter's regime/OVI/OPEX facts equal the single-source owner primitives
  // (options.js / RLOPTIONS) — one formula, consumed by both the page Power path and this adapter.
  assert.equal(summary.gammaState.regime, opts.gammaEnv(owner.snap, 1), 'gammaState regime parity vs single-source gammaEnv (customer-long default)');
  assert.equal(summary.gammaState.regime, 'negative', 'default customer-long + negative netGEX + flip absent -> negative regime');
  assert.equal(summary.oviState.percentile, opts.oviPercentile(owner.hist, owner.snap), 'oviState percentile parity vs single-source oviPercentile');
  assert.equal(summary.expirationState.calendar.monthlyDays, opts.opexInfo(new Date(GAMMA_NOW_MS)).dMon, 'expiration calendar monthlyDays parity vs single-source opexInfo');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity);
});

test('TP-05-01 each enabled dealer-gamma-playbook parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = gammaPlaybookDefinition();
  const runtime = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtime, api, [definition]);
  const base = gammaDefaults(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: gammaOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  });

  const cases = [
    ['spot-path', 'uptrend', 'summary.playbook'],
    ['time-to-expiry', 20, 'summary.expirationState'],
    ['dealer-sign', 'customer-short', 'summary.gammaState'],
    ['ovi-threshold', 50, 'summary.oviState'],
    ['aggressiveness', 'high', 'summary.playbook'],
    ['horizon', 'swing', 'summary.playbook']
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

test('TP-05-01 dealer-gamma-playbook compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = gammaPlaybookDefinition();
  const runtimeA = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtimeA, api, [definition]);
  const base = gammaDefaults(definition);
  const first = requireValue(await runtimeA.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: gammaOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  const runtimeB = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtimeB, api, [definition]);
  const second = requireValue(await runtimeB.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: gammaOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:09:00.000Z'
  }));
  assert.equal(first.computeIdentity, second.computeIdentity);
  assert.equal(api.fingerprint(first.current.output), api.fingerprint(second.current.output));
});

test('TP-05-01 dealer-gamma-playbook adapter performs zero fetch provider storage author or publication calls', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = gammaPlaybookDefinition();
  const runtime = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtime, api, [definition]);
  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  const calls = { fetch: 0, storage: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  try {
    const base = gammaDefaults(definition);
    const run = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: gammaOwnerState() },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    }));
    assert.equal(run.state, 'ready');
    await runtime.recompute({ parameterValues: { ...base, 'dealer-sign': 'customer-short' }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:00.000Z' });
  } finally {
    globalThis.fetch = sentinels.fetch;
    globalThis.localStorage = sentinels.localStorage;
    globalThis.sessionStorage = sentinels.sessionStorage;
  }
  assert.equal(calls.fetch, 0);
  assert.equal(calls.storage, 0);
});

/* ═══════════ options-surface (owner seam = options-structure-lab.html) ═══════════
   The options-structure owner greeks engine (nPDF/nCDF/bsm) is extracted VERBATIM into the
   single owner source options.js and proven at byte/semantic parity against the page's live
   inline functions across a greeks grid. The adapter re-derives the shocked surface (per-strike
   GEX, walls, gamma flip, expected move) over the FROZEN same-origin chain using those
   parity-proven primitives. The page's higher-level aggregation (computeAll/computeGammaFlip/
   maxPain/computeSkew) is CLOSURE-COUPLED to `state`, so its single-source page rewire is a
   KNOWN deferred item (recorded in report.md, like market-heatmap) — the adapter copies no
   closure-coupled page code and mutates no owner state, and creates no new chain producer. */

const OPTIONS_STRUCTURE_PAGE = readFileSync(new URL('../options-structure-lab.html', import.meta.url), 'utf8');
const SURFACE_NOW_MS = Date.UTC(2026, 6, 24, 20, 0, 0);

function optionsSurfaceDefinition() {
  return clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'options-structure-lab'));
}

/* Synthetic frozen owner options-structure snapshot (the same-origin data/options projection
   the page hands the adapter) engineered so every declared parameter provably moves its
   declared output path (real steerable effects, never a fabricated feed):
   - three expiries at DTE 7/21/45 so `expiry` (default 30 -> 2 chains, 10 -> 1) changes the
     built surface; the greeks feed depends on `risk-free-rate` (bsm r) and `time-decay` (T),
   - a call-OI ladder where the ATM (strike 100) carries the highest gamma·OI but strike 120
     carries the highest RAW OI, so `open-interest-weighting` (gamma vs raw) picks a different
     call wall, and shifting the scenario spot (`spot-shock` 0 -> +5) relocates the wall off 100,
   - a front-expiry ATM IV so `iv-shock` moves the ±1σ expected move,
   - a signed net-GEX so `sign-convention` flips the signed net-GEX and the regime. */
function surfaceOwnerState() {
  return {
    contractVersion: 'options-surface-owner-state/v1',
    toolId: 'options-structure-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot data/options',
    nowMs: SURFACE_NOW_MS,
    spot: 100,
    div: 0,
    zoom: 40,
    minOI: 0,
    chains: [
      {
        dte: 7,
        calls: [
          { strike: 100, openInterest: 3000, volume: 500, impliedVolatility: 0.45, bid: 3.0, ask: 3.2, lastPrice: 3.1 },
          { strike: 105, openInterest: 2000, volume: 400, impliedVolatility: 0.44, bid: 1.6, ask: 1.8, lastPrice: 1.7 },
          { strike: 110, openInterest: 1500, volume: 300, impliedVolatility: 0.46, bid: 0.8, ask: 1.0, lastPrice: 0.9 },
          { strike: 120, openInterest: 3500, volume: 200, impliedVolatility: 0.50, bid: 0.3, ask: 0.4, lastPrice: 0.35 }
        ],
        puts: [
          { strike: 100, openInterest: 2500, volume: 450, impliedVolatility: 0.46, bid: 3.0, ask: 3.2, lastPrice: 3.1 },
          { strike: 95, openInterest: 2000, volume: 350, impliedVolatility: 0.48, bid: 1.5, ask: 1.7, lastPrice: 1.6 },
          { strike: 90, openInterest: 3000, volume: 250, impliedVolatility: 0.52, bid: 0.7, ask: 0.9, lastPrice: 0.8 }
        ]
      },
      {
        dte: 21,
        calls: [
          { strike: 105, openInterest: 1800, volume: 300, impliedVolatility: 0.42, bid: 3.2, ask: 3.4, lastPrice: 3.3 },
          { strike: 110, openInterest: 1200, volume: 200, impliedVolatility: 0.43, bid: 1.9, ask: 2.1, lastPrice: 2.0 }
        ],
        puts: [
          { strike: 95, openInterest: 1600, volume: 260, impliedVolatility: 0.47, bid: 3.1, ask: 3.3, lastPrice: 3.2 },
          { strike: 90, openInterest: 2200, volume: 180, impliedVolatility: 0.50, bid: 1.6, ask: 1.8, lastPrice: 1.7 }
        ]
      },
      {
        dte: 45,
        calls: [{ strike: 110, openInterest: 900, volume: 120, impliedVolatility: 0.41, bid: 3.5, ask: 3.7, lastPrice: 3.6 }],
        puts: [{ strike: 90, openInterest: 1100, volume: 100, impliedVolatility: 0.49, bid: 2.5, ask: 2.7, lastPrice: 2.6 }]
      }
    ]
  };
}

function surfaceDefaults(definition) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
}

test('TP-05-01 options-surface owner primitives are single-sourced in options.js (RLOPTIONS) and the page delegates with no inline formula copy', () => {
  const opts = loadOptions();

  // nPDF golden pin + symmetry; nCDF ~0.5 at 0 and complementary symmetry nCDF(-x)+nCDF(x)=1.
  assert.equal(opts.nPDF(0), 0.3989422804014327, 'nPDF(0) = 1/sqrt(2*pi)');
  for (const x of [0.4160, 1.2, 2.7]) {
    assert.equal(opts.nPDF(-x), opts.nPDF(x), `nPDF is even at x=${x}`);
    assert.ok(Math.abs(opts.nCDF(-x) + opts.nCDF(x) - 1) < 1e-9, `nCDF complementary symmetry at x=${x}`);
    assert.ok(opts.nCDF(x) > opts.nCDF(x - 0.5), `nCDF is increasing near x=${x}`);
  }
  assert.ok(Math.abs(opts.nCDF(0) - 0.5) < 1e-6, 'nCDF(0) ~= 0.5');

  // bsm greeks over an ATM/ITM/OTM x call/put grid: a valid contract yields finite greeks with the
  // correct delta sign and positive gamma; a degenerate input (T=0 / sig=0 / S=0) yields NaN.
  const call = opts.bsm(100, 100, 6 / 365, 0.045, 0, 0.45, true);
  const put = opts.bsm(100, 100, 6 / 365, 0.045, 0, 0.45, false);
  assert.ok(call.gamma > 0 && Number.isFinite(call.gamma), 'bsm ATM call gamma > 0');
  assert.ok(call.delta > 0 && call.delta < 1, 'bsm ATM call delta in (0,1)');
  assert.ok(put.delta < 0 && put.delta > -1, 'bsm ATM put delta in (-1,0)');
  assert.ok(Math.abs((call.delta - put.delta) - 1) < 1e-9, 'bsm ATM call/put delta obey put-call parity (e^{-qT}=1 for q=0)');
  for (const otm of [opts.bsm(100, 120, 20 / 365, 0.09, 0, 0.50, true), opts.bsm(100, 90, 20 / 365, 0.045, 0, 0.52, false)]) {
    assert.ok(Number.isFinite(otm.delta) && otm.gamma > 0, 'bsm OTM greeks are finite with positive gamma');
  }
  for (const degenerate of [opts.bsm(100, 100, 0, 0.045, 0, 0.45, true), opts.bsm(100, 100, 6 / 365, 0.045, 0, 0, true), opts.bsm(0, 100, 6 / 365, 0.045, 0, 0.45, true)]) {
    assert.ok(Number.isNaN(degenerate.gamma) && Number.isNaN(degenerate.delta), 'bsm degenerate input => NaN greeks');
  }

  // Single-source wiring: the owning page loads options.js, delegates the greeks engine to
  // RLOPTIONS.*, and carries no inline copy of the owner formula.
  assert.match(OPTIONS_STRUCTURE_PAGE, /rlexperience-adapters\/options\.js/, 'options-structure page loads the options module');
  assert.match(OPTIONS_STRUCTURE_PAGE, /RLOPTIONS\.nPDF\s*\(/, 'options-structure page delegates nPDF to RLOPTIONS');
  assert.match(OPTIONS_STRUCTURE_PAGE, /RLOPTIONS\.nCDF\s*\(/, 'options-structure page delegates nCDF to RLOPTIONS');
  assert.match(OPTIONS_STRUCTURE_PAGE, /RLOPTIONS\.bsm\s*\(/, 'options-structure page delegates bsm to RLOPTIONS');
  assert.equal(/0\.3989422804014327/.test(OPTIONS_STRUCTURE_PAGE), false, 'options-structure page has no inline nPDF constant');
  assert.equal(/0\.2316419/.test(OPTIONS_STRUCTURE_PAGE), false, 'options-structure page has no inline nCDF polynomial');
  assert.equal(/Math\.log\(S \/ K\)/.test(OPTIONS_STRUCTURE_PAGE), false, 'options-structure page has no inline bsm d1 formula');
});

test('TP-05-01 options-surface adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = optionsSurfaceDefinition();
  const runtime = runtimeFor(api, definition);
  const results = opts.registerOptionsAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/options-surface/v1'].ok, true, JSON.stringify(results['simple-adapter/options-surface/v1'] && results['simple-adapter/options-surface/v1'].error || {}));

  const owner = surfaceOwnerState();
  const base = surfaceDefaults(definition);
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

  // Owner parity: the surface reflects the EXACT greeks the single-source owner bsm produces for
  // the same frozen chain — one greeks engine (options.js / RLOPTIONS), consumed by the page Power
  // path and this adapter.
  // Default expiry 30 -> only the DTE 7 and DTE 21 chains build the surface.
  assert.equal(summary.surface.chainsUsed, 2, 'two in-horizon chains build the surface at default expiry');
  const strike100 = summary.surface.strikes.find((row) => row.strike === 100);
  assert.ok(strike100, 'strike 100 is on the surface');
  // Strike 100 only appears in the DTE 7 chain (T = (7 - timeDecay=1)/365 = 6/365).
  const g100 = opts.bsm(100, 100, 6 / 365, 0.045, 0, 0.45, true).gamma;
  assert.equal(strike100.callGammaOI, Math.round(g100 * 3000 * 1e8) / 1e8, 'strike-100 callGammaOI parity vs single-source bsm x OI');
  // Front-expiry expected move uses the ATM IV × √T at the shocked (here un-shocked) IV.
  const emExpected = Math.round(100 * 0.45 * Math.sqrt(6 / 365) * 1e4) / 1e4;
  assert.equal(summary.expectedMove.em, emExpected, 'front expected move parity vs spot × atmIV × √T');
  assert.equal(summary.expectedMove.frontDte, 7, 'front expiry is the DTE 7 chain');
  // Default gamma weighting picks the ATM strike as the call wall (highest gamma·OI).
  assert.equal(summary.walls.callWall, 100, 'default gamma-weighted call wall is the ATM strike');
  assert.equal(summary.gammaFlip.state, 'ready', 'gamma flip regime is resolved');
  assert.equal(typeof summary.gammaFlip.signedNetGEX, 'number', 'signed net-GEX is numeric');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity);
});

test('TP-05-01 each enabled options-surface parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = optionsSurfaceDefinition();
  const runtime = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtime, api, [definition]);
  const base = surfaceDefaults(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: surfaceOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  });

  const cases = [
    ['expiry', 10, 'summary.surface'],
    ['risk-free-rate', 9.0, 'summary.surface'],
    ['time-decay', 10, 'summary.surface'],
    ['spot-shock', 5, 'summary.walls'],
    ['open-interest-weighting', 'raw', 'summary.walls'],
    ['iv-shock', 10, 'summary.expectedMove'],
    ['sign-convention', 'customer-short', 'summary.gammaFlip']
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

test('TP-05-01 options-surface compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = optionsSurfaceDefinition();
  const runtimeA = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtimeA, api, [definition]);
  const base = surfaceDefaults(definition);
  const first = requireValue(await runtimeA.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: surfaceOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  const runtimeB = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtimeB, api, [definition]);
  const second = requireValue(await runtimeB.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: surfaceOwnerState() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:09:00.000Z'
  }));
  assert.equal(first.computeIdentity, second.computeIdentity);
  assert.equal(api.fingerprint(first.current.output), api.fingerprint(second.current.output));
});

test('TP-05-01 options-surface adapter performs zero fetch provider storage author or publication calls', async () => {
  const api = loadProductionApi();
  const opts = loadOptions();
  const definition = optionsSurfaceDefinition();
  const runtime = runtimeFor(api, definition);
  opts.registerOptionsAdapters(runtime, api, [definition]);
  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  const calls = { fetch: 0, storage: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  try {
    const base = surfaceDefaults(definition);
    const run = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: surfaceOwnerState() },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    }));
    assert.equal(run.state, 'ready');
    await runtime.recompute({ parameterValues: { ...base, 'spot-shock': 5 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:00.000Z' });
  } finally {
    globalThis.fetch = sentinels.fetch;
    globalThis.localStorage = sentinels.localStorage;
    globalThis.sessionStorage = sentinels.sessionStorage;
  }
  assert.equal(calls.fetch, 0);
  assert.equal(calls.storage, 0);
});

