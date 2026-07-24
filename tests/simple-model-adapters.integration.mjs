import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { clone, loadProductionApi, readJson } from './tool-experience.support.mjs';

/*
 * TP-05-02 — Registry-derived adapter integration loop.
 *
 * This suite registers ALL EIGHT Scope-05 market-structure/options Simple adapters into ONE
 * production runtime through BOTH production factories (market-structure.js + options.js), then
 * exercises every registered adapter end-to-end: a real owner-fixture prepare, a per-declared-
 * parameter recompute that proves the sensitivity effect (or a proved flat region for the honest
 * proven-unavailable technical adapter), and an owner-fact comparison. The set of adapters the
 * loop drives is derived from the model REGISTRY (definitions whose adapterModule is one of the
 * two Scope-05 modules) — never a hard-coded adapter-ID list — and a valid-definition-added
 * mutation and a missing-definition mutation exercise the SAME production registration loop to
 * prove registry-driven membership.
 */

const require = createRequire(import.meta.url);

function loadMarketStructure() {
  const path = require.resolve('../rlexperience-adapters/market-structure.js');
  delete require.cache[path];
  return require(path);
}

function loadOptions() {
  const path = require.resolve('../rlexperience-adapters/options.js');
  delete require.cache[path];
  return require(path);
}

function loadRlvol() {
  const path = require.resolve('../rlvol.js');
  delete require.cache[path];
  return require(path);
}

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code || ''} ${result.error.fieldPath || result.error.reason || ''}`);
  return result.value;
}

function defaultValues(definition) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
}

/* The two Scope-05 adapter modules. Registry membership (the definitions that name one of these
   modules) — NOT a literal adapter-ID list — selects the adapters this loop drives. */
const SCOPE5_MODULES = ['rlexperience-adapters/market-structure.js', 'rlexperience-adapters/options.js'];

function scope5Definitions() {
  return readJson('simple-models.json').definitions
    .filter((definition) => SCOPE5_MODULES.includes(definition.adapterModule))
    .map(clone);
}

function makeRuntime(api, definitions) {
  const config = readJson('tool-experience.config.json');
  const models = { contractVersion: 'simple-model-registry/v1', definitions };
  return requireValue(api.createSimpleRuntime(config, models));
}

/* Register the FULL definition set through BOTH production factories. Each factory registers only
   the adapters for the tool IDs it owns (byToolId), so the union is the registry-derived set. */
function registerAll(runtime, api, ms, opts, rlvol, definitions) {
  const msResults = ms.registerMarketStructureAdapters(runtime, api, definitions, { rlvol });
  const optResults = opts.registerOptionsAdapters(runtime, api, definitions);
  return { ...msResults, ...optResults };
}

/* ═══════════════════════ per-tool owner fixtures (verbatim from the unit suite) ═══════════════════════ */

/* market-breadth (owner seam = market-heatmap-lab.html) */
function barsFor(r1d, r1w, r1m) {
  const rows = [];
  const close = 100;
  for (let i = 0; i < 22; i += 1) rows.push({ t: i, c: close, v: 1000 });
  rows[21].c = close * (1 + r1d / 100);
  rows[21 - 5].c = rows[21].c / (1 + r1w / 100);
  rows[21 - 21].c = rows[21].c / (1 + r1m / 100);
  return rows;
}

function breadthOwnerState(ms) {
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
  return ms.reduceOwnerState({
    asOf: '2026-07-23T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    constituents,
    barsReader: (ticker) => (constituents.find((entry) => entry.ticker === ticker) || {}).rows || null
  });
}

/* conditional-volatility (owner seam = rlvol.js) */
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

/* session-auction (owner seam = intraday-tape-lab.html) */
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

/* swing-transition (owner seam = swing-structure-lab.html) */
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

/* technical-five-gate (owner seam = technical-analysis-decision-lab.html) — proven-unavailable */
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

/* options-anomaly (owner seam = options-flow-feed-lab.html) */
const ANOMALY_NOW_MS = Date.UTC(2026, 6, 24, 20, 0, 0);
function expiryEpochForDte(dte) { return Math.round((ANOMALY_NOW_MS + dte * 86400000) / 1000); }
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

/* dealer-gamma-playbook (owner seam = gamma-trading-lab.html) */
const GAMMA_NOW_MS = Date.UTC(2026, 6, 24, 20, 0, 0);
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

/* options-surface (owner seam = options-structure-lab.html) */
const SURFACE_NOW_MS = Date.UTC(2026, 6, 24, 20, 0, 0);
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

/* ═══════════════════════ per-tool exercise descriptors ═══════════════════════
   Keyed by toolId. Each descriptor provides the owner fixture, the base parameters, whether the
   adapter is the honest proven-unavailable one (expectFlat), an owner-fact comparison, and the
   [parameterId, value] cases that cover EVERY enabled declared parameter. Owner-relative case
   values (session control-threshold, swing thresholds) are computed against the real owner
   primitives so each change is a genuine state flip, never a tautological echo of the raw value. */
function makeDescriptors(ms, opts, rlvol) {
  return {
    'market-heatmap-lab': {
      ownerState: () => breadthOwnerState(ms),
      base: (definition) => defaultValues(definition),
      expectFlat: false,
      ownerFact: ({ summary }) => {
        assert.ok(summary.leadership && summary.groups && summary.breadth && summary.outliers, 'breadth summary carries every owner path');
      },
      cases: () => [
        ['window', '1w'],
        ['grouping', 'industry'],
        ['size-metric', 'equal'],
        ['breadth-threshold', 30],
        ['outlier-sigma', 1]
      ]
    },
    'volatility-sizing-lab': {
      ownerState: () => volOwnerState(),
      base: (definition) => defaultValues(definition),
      expectFlat: false,
      ownerFact: ({ summary, owner, base }) => {
        const direct = rlvol.buildVolDecisionRead(ms.buildVolatilityInput(owner, base));
        assert.equal(summary.forecast.annualizedDecimal, direct.forecast.value, 'vol forecast is single-sourced from rlvol.buildVolDecisionRead');
        assert.equal(summary.regime.band, direct.regime.band, 'vol regime band parity vs rlvol');
      },
      cases: () => [
        ['estimator', 'garch'],
        ['window', 30],
        ['target-volatility', 25],
        ['multiplier-cap', 0.3],
        ['volatility-floor', 40],
        ['notional', 250000],
        ['horizon', 63]
      ]
    },
    'intraday-tape-lab': {
      ownerState: () => sessionOwnerState(),
      base: (definition) => defaultValues(definition),
      expectFlat: false,
      ownerFact: ({ summary, owner, base }) => {
        const todayBars = owner.sessions[owner.sessions.length - 1].bars;
        const ownerType = ms.sessionType(ms.computeSession(todayBars, base['opening-range'], owner.ivMin));
        assert.equal(summary.sessionType.ownerType, ownerType.type, 'session-type is single-sourced from ms.sessionType/computeSession');
      },
      cases: (owner, base) => {
        const todayBars = owner.sessions[owner.sessions.length - 1].bars;
        const score = ms.controlRead(ms.computeSession(todayBars, base['opening-range'], owner.ivMin), owner.gap).score;
        const ctlChange = score < base['control-threshold']
          ? Math.max(0, Math.round((score - 0.1) / 0.05) * 0.05)
          : Math.min(1, Math.round((score + 0.1) / 0.05) * 0.05);
        return [
          ['opening-range', 5],
          ['vwap-band', 2],
          ['profile-window', 1],
          ['control-threshold', ctlChange],
          ['gamma-context', 'exclude']
        ];
      }
    },
    'swing-structure-lab': {
      ownerState: () => swingOwnerState(),
      base: (definition) => defaultValues(definition),
      expectFlat: false,
      ownerFact: ({ summary, owner, base }) => {
        const full = owner.full;
        const ma = { m20: ms.smaArr(full, base['fast-ma']), m50: ms.smaArr(full, base['medium-ma']), m200: ms.smaArr(full, base['slow-ma']) };
        assert.equal(summary.swingState.label, ms.alignment(full, ma).label, 'swing state is single-sourced from ms.alignment/smaArr');
      },
      cases: (owner, base) => {
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
        return [
          ['fast-ma', 10],
          ['medium-ma', 30],
          ['slow-ma', 150],
          ['breakout-tolerance', breakoutChange],
          ['volume-confirmation', volChange],
          ['obv-confirmation', false],
          ['pattern-threshold', patternChange],
          ['regime-window', 20]
        ];
      }
    },
    'technical-analysis-decision-lab': {
      ownerState: () => technicalOwnerState(),
      base: (definition) => ({ ...defaultValues(definition), entry: 100 }),
      expectFlat: true,
      ownerFact: ({ summary, prepared }) => {
        assert.equal(summary.state, 'unavailable', 'five-gate output is honestly unavailable');
        assert.match(summary.missingOwnerCapability, /five-gate/i, 'names the missing owner five-gate model');
        assert.deepEqual(prepared.current.output.provenance.classes, ['unavailable'], 'no observed-fact class is claimed');
      },
      cases: () => [
        ['timeframe', 'intraday'],
        ['data-tier', 'observed'],
        ['context-threshold', 0.7],
        ['location-threshold', 0.7],
        ['confirmation-threshold', 0.7],
        ['validation-threshold', 0.7],
        ['entry', 105],
        ['stop-distance', 6],
        ['cost', 20],
        ['family-requirement', 4]
      ]
    },
    'options-flow-feed-lab': {
      ownerState: () => anomalyOwnerState(),
      base: (definition) => defaultValues(definition),
      expectFlat: false,
      ownerFact: ({ summary, owner }) => {
        const top = summary.contracts.top[0];
        const ownerRow = owner.chains[0].rows.find((row) => row.type === top.type && row.strike === top.strike);
        assert.ok(ownerRow, 'top anomaly contract maps to an owner row');
        assert.equal(top.premium, opts.premiumNotional(ownerRow.volume, ownerRow.mid), 'top contract premium is single-sourced from opts.premiumNotional');
      },
      cases: () => [
        ['expiry-window', 10],
        ['volume-open-interest-threshold', 3],
        ['premium-threshold', 500000],
        ['implied-volatility-threshold', 70],
        ['call-put-aggregation', 'net-premium']
      ]
    },
    'gamma-trading-lab': {
      ownerState: () => gammaOwnerState(),
      base: (definition) => defaultValues(definition),
      expectFlat: false,
      ownerFact: ({ summary, owner }) => {
        assert.equal(summary.gammaState.regime, opts.gammaEnv(owner.snap, 1), 'gamma regime is single-sourced from opts.gammaEnv (customer-long default)');
      },
      cases: () => [
        ['spot-path', 'uptrend'],
        ['time-to-expiry', 20],
        ['dealer-sign', 'customer-short'],
        ['ovi-threshold', 50],
        ['aggressiveness', 'high'],
        ['horizon', 'swing']
      ]
    },
    'options-structure-lab': {
      ownerState: () => surfaceOwnerState(),
      base: (definition) => defaultValues(definition),
      expectFlat: false,
      ownerFact: ({ summary }) => {
        assert.equal(summary.surface.chainsUsed, 2, 'default expiry builds the surface from the two in-horizon chains');
        assert.equal(summary.walls.callWall, 100, 'default gamma-weighted call wall is the ATM strike');
        const emExpected = Math.round(100 * 0.45 * Math.sqrt(6 / 365) * 1e4) / 1e4;
        assert.equal(summary.expectedMove.em, emExpected, 'front expected move is single-sourced from the owner bsm inputs');
      },
      cases: () => [
        ['expiry', 10],
        ['risk-free-rate', 9.0],
        ['time-decay', 10],
        ['spot-shock', 5],
        ['open-interest-weighting', 'raw'],
        ['iv-shock', 10],
        ['sign-convention', 'customer-short']
      ]
    }
  };
}

/* Drive one adapter through the SHARED runtime: prepare with its owner fixture, compare owner
   facts, and recompute each declared parameter proving the declared sensitivity effect (or a
   proved flat region for the honest proven-unavailable adapter). The declared output path is read
   from the DEFINITION's affectsOutputPaths — registry-derived, never hard-coded here. */
async function exerciseAdapter(runtime, api, definition, descriptor) {
  const owner = descriptor.ownerState();
  const base = descriptor.base(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  assert.equal(prepared.state, descriptor.expectFlat ? 'unavailable' : 'ready', `${definition.toolId} prepare state`);
  const summary = prepared.current.output.values.summary;
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, `${definition.toolId} evidence identity is bound`);
  descriptor.ownerFact({ summary, owner, base, prepared });

  const declaredParams = definition.parameterDefinitions
    .filter((parameter) => parameter.parameterId !== 'seed')
    .map((parameter) => parameter.parameterId);
  const cases = descriptor.cases(owner, base);
  const coveredParams = cases.map(([parameterId]) => parameterId).sort();
  // Every enabled declared parameter is exercised (no cherry-picking a convenient subset).
  assert.deepEqual(coveredParams, declaredParams.slice().sort(), `${definition.toolId} exercises every declared parameter`);

  for (const [parameterId, value] of cases) {
    const paramDef = definition.parameterDefinitions.find((parameter) => parameter.parameterId === parameterId);
    const declaredPaths = paramDef.affectsOutputPaths;
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `${definition.toolId} changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `${definition.toolId} sensitivity effect present for ${parameterId}`);
    if (descriptor.expectFlat) {
      assert.equal(effect.outputChanged, false, `${definition.toolId} ${parameterId} is a proved flat region (owner model absent)`);
      assert.notEqual(effect.flatRegionProof, null, `${definition.toolId} ${parameterId} carries a proved flat region`);
    } else {
      assert.equal(effect.outputChanged, true, `${definition.toolId} ${parameterId} moves ${declaredPaths.join(',')}`);
    }
    // The effect's paths are the DEFINITION's declared affectsOutputPaths (registry-derived).
    assert.deepEqual(effect.resultPaths, declaredPaths, `${definition.toolId} ${parameterId} resultPaths == definition.affectsOutputPaths`);
    await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:30.000Z' });
  }
}

test('TP-05-02 market structure and options adapters: registry-derived loop runs all eight at owner-parity with real parameter effects', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const opts = loadOptions();
  const rlvol = loadRlvol();

  const definitions = scope5Definitions();
  const runtime = makeRuntime(api, definitions);
  const results = registerAll(runtime, api, ms, opts, rlvol, definitions);

  // Registry membership: the registered adapter set is EXACTLY the set derived from the
  // definitions' adapterIds — not a hard-coded literal list — and every registration succeeded.
  const derivedAdapterIds = definitions.map((definition) => definition.adapterId).sort();
  const registeredAdapterIds = Object.keys(results).sort();
  assert.deepEqual(registeredAdapterIds, derivedAdapterIds, 'registered adapters == registry-derived adapter set');
  assert.equal(registeredAdapterIds.length, 8, 'all eight Scope-05 adapters registered into one runtime');
  for (const adapterId of registeredAdapterIds) {
    assert.equal(results[adapterId].ok, true, `${adapterId} registered: ${JSON.stringify(results[adapterId].error || {})}`);
  }

  const descriptors = makeDescriptors(ms, opts, rlvol);
  // Iterate the REGISTRY (definitions) — the loop's membership is registry-derived.
  for (const definition of definitions) {
    const descriptor = descriptors[definition.toolId];
    assert.ok(descriptor, `descriptor present for registry member ${definition.toolId}`);
    await exerciseAdapter(runtime, api, definition, descriptor);
  }
});

test('TP-05-02 market structure and options adapters: a missing definition removes exactly that adapter from the production registry loop', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const opts = loadOptions();
  const rlvol = loadRlvol();

  // Missing-definition mutation: drop options-surface from the registry input and prove the SAME
  // production registration loop registers one fewer adapter and that adapter is absent.
  const full = scope5Definitions();
  const missing = full.filter((definition) => definition.toolId !== 'options-structure-lab');
  const runtime = makeRuntime(api, missing);
  const results = registerAll(runtime, api, ms, opts, rlvol, missing);
  const registeredAdapterIds = Object.keys(results).sort();
  assert.equal(registeredAdapterIds.length, 7, 'exactly seven adapters register when one definition is missing');
  assert.equal(registeredAdapterIds.includes('simple-adapter/options-surface/v1'), false, 'the missing tool has no registered adapter');
  assert.deepEqual(registeredAdapterIds, missing.map((definition) => definition.adapterId).sort(), 'registered set shrinks with the registry');
});

test('TP-05-02 market structure and options adapters: adding a valid definition registers exactly that adapter through the production loop', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const opts = loadOptions();
  const rlvol = loadRlvol();

  // Valid-definition-added mutation: start from the seven-subset, ADD back the valid
  // options-surface definition, and prove the SAME production loop now registers it (the set
  // grows to eight and the added adapter is present and functional).
  const full = scope5Definitions();
  const surface = full.find((definition) => definition.toolId === 'options-structure-lab');
  const sevenSubset = full.filter((definition) => definition.toolId !== 'options-structure-lab');
  const augmented = sevenSubset.concat([surface]);
  const runtime = makeRuntime(api, augmented);
  const results = registerAll(runtime, api, ms, opts, rlvol, augmented);
  const registeredAdapterIds = Object.keys(results).sort();
  assert.equal(registeredAdapterIds.length, 8, 'adding a valid definition grows the registered set back to eight');
  assert.equal(results['simple-adapter/options-surface/v1'] && results['simple-adapter/options-surface/v1'].ok, true, 'the added adapter registers successfully');

  // The added adapter is not just registered — it executes a real ready owner run.
  const descriptor = makeDescriptors(ms, opts, rlvol)['options-structure-lab'];
  await exerciseAdapter(runtime, api, surface, descriptor);
});
