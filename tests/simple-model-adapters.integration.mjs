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
/* Trend-dynamics owner state: the committed SPY closes the page itself consumes, so the trend read
   is exercised against real observations rather than a synthetic ramp that could pass a slope test
   nothing real would. */
function trendOwnerState() {
  const rows = readJson('data/bars/SPY.json').rows.slice(-180);
  return {
    contractVersion: 'trend-owner-state/v1',
    toolId: 'trend-dynamics-cycle-lab',
    symbol: 'SPY',
    asOf: '2026-08-14',
    observations: rows.map((row) => ({ observedAt: new Date(row.t).toISOString(), value: row.c }))
  };
}

/* FX vehicle owner state: the committed vehicle registry with one frozen owner disposition per
   member, which is the shape the page's vehicle-fit decision publishes. Every member is carried so
   the adapter is proved to pass the WHOLE registry through rather than only the selected one. */
function fxVehicleOwnerState() {
  const vehicles = readJson('fx-vehicle-universe.json').vehicles;
  const evaluations = vehicles.map((vehicle) => ({
    vehicleId: vehicle.vehicleId,
    ticker: vehicle.ticker,
    state: 'Eligible',
    reasonCodes: []
  }));
  return {
    contractVersion: 'fx-owner-state/v1',
    toolId: 'fx-regime-relative-value-lab',
    state: 'ready',
    evidenceCutoff: '2026-08-14',
    vehicleFit: {
      state: 'Eligible',
      selected: { vehicleId: evaluations[0].vehicleId },
      evaluations
    }
  };
}

function makeDescriptors(ms, opts, rlvol) {
  return {
    'trend-dynamics-cycle-lab': {
      ownerState: () => trendOwnerState(),
      base: (definition) => defaultValues(definition),
      expectFlat: false,
      ownerFact: ({ summary, owner }) => {
        assert.equal(summary.state, 'ready', 'the trend summary reaches ready on the committed SPY series');
        assert.ok(summary.trend && summary.strength && summary.turn, 'the trend summary carries trend, strength and turn');
        // The read windows by its own echoed lookback, so the expected count is derived from that
        // rather than assumed to be every frozen observation.
        assert.equal(summary.observationCount, Math.min(owner.observations.length, summary.params.lookback),
          'the counted observations are exactly the echoed lookback window over the frozen series');
      },
      // The definition declares no parameters, so there is no lever to exercise and none is invented.
      cases: () => [
        ['lookback', 63],
        ['smoothing', 9],
        ['strength-threshold', 3],
        ['confirmation-delay', 5]
      ]
    },
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

test('TP-05-02 market structure and options adapters: registry-derived loop runs all nine at owner-parity with real parameter effects', async () => {
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
  assert.equal(registeredAdapterIds.length, 9, 'all nine Scope-05 adapters registered into one runtime');
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
  assert.equal(registeredAdapterIds.length, 8, 'exactly eight adapters register when one definition is missing');
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
  assert.equal(registeredAdapterIds.length, 9, 'adding a valid definition grows the registered set back to nine');
  assert.equal(results['simple-adapter/options-surface/v1'] && results['simple-adapter/options-surface/v1'].ok, true, 'the added adapter registers successfully');

  // The added adapter is not just registered — it executes a real ready owner run.
  const descriptor = makeDescriptors(ms, opts, rlvol)['options-structure-lab'];
  await exerciseAdapter(runtime, api, surface, descriptor);
});

/*
 * TP-06-02 — Scope 06 macro/rotation/fundamental registry-derived loop + Scope 05 stability.
 *
 * The eight Scope-06 definitions (adapterModule = macro-rotation.js or fundamental-models.js) land
 * incrementally. This suite registers whatever Scope-06 adapters are DELIVERED through the
 * production factories, drives each one end-to-end (owner-parity prepare + a per-declared-parameter
 * recompute proving the sensitivity effect from the registry's own affectsOutputPaths), and proves
 * the Scope-05 adapter set + a real Scope-05 owner-run fingerprint are UNCHANGED when the Scope-06
 * adapters share the runtime. Membership is registry-derived (definitions whose adapterModule is a
 * Scope-06 module), never a hard-coded adapter-ID list. Delivered so far: sector-rotation-transition.
 */

function loadMacroRotation() {
  const path = require.resolve('../rlexperience-adapters/macro-rotation.js');
  delete require.cache[path];
  return require(path);
}

function loadCausalEvaluator() {
  const path = require.resolve('../rlcausal.js');
  delete require.cache[path];
  require(path);
  return globalThis.RLCausal;
}

/* The causal owner freezes one real rlcausal evaluation per posture and overlay it offers, so the
   adapter selects among owner results rather than recomputing. The fixture is built the same way. */
function causalOwnerFixture() {
  const causal = loadCausalEvaluator();
  const config = readJson('causal-rotation.config.json');
  const observationSet = readJson('causal-rotation-observations.json');
  const asOf = '2026-07-12T22:00:00Z';
  const evaluations = {};
  for (const posture of Object.keys(config.sensitivityPolicies)) {
    for (const riskOverlay of ['none', 'tightened']) {
      const result = causal.evaluateAll({ config, observationSet, asOf, posture, riskOverlay });
      evaluations[posture + '|' + riskOverlay] = { candidates: (result.candidates || []).map(clone) };
    }
  }
  return { asOf, evaluatorVersion: config.evaluatorVersion, evaluations };
}

function loadFundamentalModels() {
  const path = require.resolve('../rlexperience-adapters/fundamental-models.js');
  delete require.cache[path];
  return require(path);
}

const SCOPE6_MODULES = ['rlexperience-adapters/macro-rotation.js', 'rlexperience-adapters/fundamental-models.js'];

function scope6Definitions() {
  return readJson('simple-models.json').definitions
    .filter((definition) => SCOPE6_MODULES.includes(definition.adapterModule))
    .map(clone);
}

/* Register the DELIVERED Scope-06 adapters through their production factories. A tool whose owner
   seam is not yet extracted is simply absent (the factory returns only implemented adapters), so
   the registered set equals the module's supportedAdapterIds — the honest delivered set. */
function registerScope6(runtime, api, mr, fm, definitions) {
  // Register both delivered Scope-06 modules; each factory registers only the adapters it implements
  // (a tool whose owner seam is not yet extracted is honestly absent), so the union equals the
  // combined supportedAdapterIds — the honest delivered set across macro-rotation + fundamental-models.
  return Object.assign(
    {},
    mr.registerMacroRotationAdapters(runtime, api, definitions),
    fm.registerFundamentalModelsAdapters(runtime, api, definitions)
  );
}

/* sector-rotation owner fixture (verbatim from the unit suite): distinct trend/wobble per sector so
   the RRG readout moves with the lookbacks, distinct SPY-vs-RSP series so the benchmark moves
   relative strength, distinct breadth/risk/accel so each rank weight moves the rank, distinct etf
   fit/mom so the ETF-fit weight moves the vehicle. */
function sectorRsSeries(slope, wobble, tilt) {
  const out = [];
  for (let i = 0; i < 200; i += 1) {
    const trend = 1 + slope * (i / 200);
    const wob = wobble * Math.sin(i / 9);
    out.push(Math.round((trend + wob + tilt) * 1e6) / 1e6);
  }
  return out;
}

function sectorOwnerFixture() {
  return {
    contractVersion: 'sector-rotation-owner-state/v1',
    toolId: 'sector-research-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    benchmarks: ['SPY', 'RSP'],
    sectors: [
      { id: 'XLK', label: 'Technology', rs: { SPY: sectorRsSeries(0.42, 0.05, 0.00), RSP: sectorRsSeries(0.30, 0.06, 0.04) }, x3: 0.08, breadthPct50: 0.70, riskScore: 1, etf: { ticker: 'XLK', fit: 0.82, mom: 0.61 } },
      { id: 'XLE', label: 'Energy', rs: { SPY: sectorRsSeries(-0.28, 0.07, 0.00), RSP: sectorRsSeries(-0.20, 0.05, 0.05) }, x3: -0.05, breadthPct50: 0.30, riskScore: 4, etf: { ticker: 'XLE', fit: 0.44, mom: 0.58 } },
      { id: 'XLV', label: 'Health Care', rs: { SPY: sectorRsSeries(0.10, 0.09, 0.00), RSP: sectorRsSeries(0.16, 0.04, 0.03) }, x3: 0.02, breadthPct50: 0.52, riskScore: 2, etf: { ticker: 'XLV', fit: 0.63, mom: 0.49 } }
    ]
  };
}

/* country-rotation owner fixture (verbatim from the unit suite): distinct rel21/rel63/rel126 so each
   horizon weight moves the momentum blend, distinct non-zero fxScore so the FX weight moves the
   queue, distinct vol so the volatility penalty moves the queue, distinct daily row shapes so the
   single-sourced pairwise correlation differs (diversification weight moves the queue), and
   local-close ages straddling the max-age band so the local-close control flips a country's
   freshness. */
function countryRows(seed, drift, wobble) {
  const rows = [];
  const base = Date.UTC(2026, 3, 1);
  let close = 100;
  for (let i = 0; i < 90; i += 1) {
    close = close * (1 + drift + wobble * Math.sin((i + seed) / 5));
    rows.push({ t: base + i * 864e5, c: Math.round(close * 1e4) / 1e4 });
  }
  return rows;
}

function countryOwnerFixture() {
  return {
    contractVersion: 'country-rotation-owner-state/v1',
    toolId: 'global-rotation-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    benchmark: 'ACWI',
    countries: [
      { id: 'EWY', label: 'South Korea', rel21: 6, rel63: 3, rel126: 1, fxScore: 0.5, vol: 0.25, drawdown: 0.12, trendScore: 0.4, localCloseAgeHours: 2, rows: countryRows(0, 0.004, 0.010) },
      { id: 'EWG', label: 'Germany', rel21: -2, rel63: 4, rel126: 8, fxScore: -0.3, vol: 0.35, drawdown: 0.22, trendScore: 0.1, localCloseAgeHours: 12, rows: countryRows(7, -0.002, 0.014) },
      { id: 'EWZ', label: 'Brazil', rel21: 1, rel63: -1, rel126: 2, fxScore: 0.1, vol: 0.15, drawdown: 0.30, trendScore: -0.2, localCloseAgeHours: 30, rows: countryRows(3, 0.001, 0.020) }
    ]
  };
}

/* real-asset-driver owner fixture (verbatim from the unit suite): the selected asset carries a
   distinct owner score / volatility / drawdown so the volatility-penalty moves summary.score and the
   drawdown-limit moves summary.riskState, the universe driver deltas are non-zero and mid-range so the
   USD / rate / risk shocks each move summary.driverState, and the frozen commodity-breadth returns
   straddle zero so the single-sourced realBreadthPct moves summary.confirmation with the threshold. */
function realAssetOwnerFixture() {
  return {
    contractVersion: 'real-asset-driver-owner-state/v1',
    toolId: 'real-assets-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    benchmark: 'DBC',
    selected: 'GLD',
    drivers: { uup63: -3, tlt63: 5, tip63: 7, qqq63: 8, xle63: 4, xli63: 3, dbc63: 2, gld63: 6, btc63: 12, goldSilverRatio63: -4 },
    breadthReturns: [8, -3, 5, -1, 6, -2],
    assets: [
      { id: 'GLD', label: 'Gold', model: 'gold', trendScore: 70, volatility: 16, drawdown: 8, ownerScore: 68, riskPenalty: 3 },
      { id: 'BTC-USD', label: 'Bitcoin', model: 'bitcoin', trendScore: 62, volatility: 48, drawdown: 22, ownerScore: 55, riskPenalty: 9 },
      { id: 'DBC', label: 'Broad commodities', model: 'broad', trendScore: 54, volatility: 22, drawdown: 12, ownerScore: 50, riskPenalty: 5 }
    ]
  };
}

/* fixed-income-sleeve owner fixture (verbatim from the unit suite): distinct rate/spread durations
   and convexity per sleeve so the same scenario yields a distinct total per sleeve (the ranking moves
   with horizon/rate-shock/spread-shock/carry/convexity), a spread-bearing IG/HY sleeve so the spread
   shock moves the spread outcomes, and a frozen non-zero real-yield/breakeven change with a mid-range
   credit confirmation so the inflation/real-yield/confirmation controls move the regime. The base
   carries a non-zero rate/spread shock so the convexity term binds. */
function bondSleeveOwnerFixture() {
  return {
    contractVersion: 'fixed-income-sleeve-owner-state/v1',
    toolId: 'bond-regime-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    regime: { realYieldChangeBp: 14, breakevenChangeBp: -9, creditConfirmation: 0.55 },
    sleeves: [
      { id: 'long-treasury', label: 'Long Treasury', rateDuration: 17, spreadDuration: 0, convexity: 3.2, rateShockKind: 'nominal', spreadShockKind: 'none', carry: 4.2 },
      { id: 'investment-grade-corporate', label: 'IG Corporate', rateDuration: 7, spreadDuration: 6.5, convexity: 0.8, rateShockKind: 'nominal', spreadShockKind: 'ig', carry: 5.4 },
      { id: 'high-yield-corporate', label: 'HY Corporate', rateDuration: 3.5, spreadDuration: 4, convexity: 0.4, rateShockKind: 'nominal', spreadShockKind: 'hy', carry: 7.8 },
      { id: 'tips', label: 'TIPS', rateDuration: 7.5, spreadDuration: 0, convexity: 0.6, rateShockKind: 'real-derived', spreadShockKind: 'none', carry: 3.1 }
    ]
  };
}

/* etf-ranking owner fixture (verbatim from the unit suite): distinct trailing returns per horizon key
   so the horizon control moves the momentum and hence the ranking, distinct annVol/maxDD so the risk
   component differs (risk-penalty moves the ranking), distinct cagr so the benchmark excess differs, two
   frozen benchmarks with distinct window CAGRs (benchmark moves the relative performance), and spread of
   scores so both the weighting scheme and the constituent cap move the basket. */
function etfOwnerFixture() {
  return {
    contractVersion: 'etf-ranking-owner-state/v1',
    toolId: 'etf-momentum-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    benchmarks: {
      SPY: { cagr: 0.10, trailing: { '1M': 0.01, '3M': 0.03, '6M': 0.06, '1Y': 0.10 } },
      QQQ: { cagr: 0.14, trailing: { '1M': 0.02, '3M': 0.05, '6M': 0.09, '1Y': 0.15 } }
    },
    funds: [
      { ticker: 'MTUM', name: 'iShares MSCI USA Momentum', trailing: { '1M': 0.02, '3M': 0.06, '6M': 0.14, 'YTD': 0.11, '1Y': 0.22, '3Y': 0.09, '5Y': 0.11 }, annVol: 0.18, maxDD: -0.12, sharpe: 1.1, cagr: 0.20, aum: 28456 },
      { ticker: 'XMMO', name: 'Invesco S&P MidCap Momentum', trailing: { '1M': 0.05, '3M': 0.10, '6M': 0.08, 'YTD': 0.07, '1Y': 0.10, '3Y': 0.06, '5Y': 0.09 }, annVol: 0.26, maxDD: -0.22, sharpe: 0.6, cagr: 0.12, aum: 7801 },
      { ticker: 'VFMO', name: 'Vanguard U.S. Momentum', trailing: { '1M': -0.01, '3M': 0.02, '6M': 0.05, 'YTD': 0.04, '1Y': 0.16, '3Y': 0.07, '5Y': 0.10 }, annVol: 0.14, maxDD: -0.08, sharpe: 1.3, cagr: 0.15, aum: 1935 }
    ]
  };
}

/* ai-capex-portfolio owner fixture (verbatim from the unit suite): distinct per-horizon {er, sd} per
   asset so horizon moves the distribution band, a selectedTheme so theme-weight moves the beneficiary
   distribution, distinct non-zero crowding so the crowding penalty moves the distribution mean, a
   within-theme/cross-theme correlation pair so the correlation ceiling moves the portfolio sigma, and
   an er/sd spread that separates the objective weightings so the objective moves the portfolio. */
function aiCapexOwnerFixture() {
  return {
    contractVersion: 'ai-capex-portfolio-owner-state/v1',
    toolId: 'ai-capex-strategy-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    selectedTheme: 'Memory & Storage',
    correlation: { intra: 0.72, inter: 0.40 },
    horizons: ['1m', '3m', '6m', '1y'],
    assets: [
      { id: 'MU', ticker: 'MU', theme: 'Memory & Storage', tier: 'A', crowding: 0.03, byHorizon: { '1m': { er: 0.06, sd: 0.16 }, '3m': { er: 0.14, sd: 0.28 }, '6m': { er: 0.22, sd: 0.39 }, '1y': { er: 0.34, sd: 0.55 } } },
      { id: 'STX', ticker: 'STX', theme: 'Memory & Storage', tier: 'A', crowding: 0.02, byHorizon: { '1m': { er: 0.05, sd: 0.14 }, '3m': { er: 0.11, sd: 0.24 }, '6m': { er: 0.17, sd: 0.34 }, '1y': { er: 0.26, sd: 0.48 } } },
      { id: 'ETN', ticker: 'ETN', theme: 'Grid & Electrical', tier: 'A', crowding: 0.04, byHorizon: { '1m': { er: 0.03, sd: 0.10 }, '3m': { er: 0.07, sd: 0.18 }, '6m': { er: 0.12, sd: 0.26 }, '1y': { er: 0.20, sd: 0.32 } } },
      { id: 'GEV', ticker: 'GEV', theme: 'Grid & Electrical', tier: 'A', crowding: 0.06, byHorizon: { '1m': { er: 0.02, sd: 0.12 }, '3m': { er: 0.06, sd: 0.20 }, '6m': { er: 0.13, sd: 0.30 }, '1y': { er: 0.22, sd: 0.45 } } },
      { id: 'CEG', ticker: 'CEG', theme: 'Power Gen & Nuclear', tier: 'A', crowding: 0.05, byHorizon: { '1m': { er: 0.02, sd: 0.13 }, '3m': { er: 0.05, sd: 0.22 }, '6m': { er: 0.11, sd: 0.33 }, '1y': { er: 0.19, sd: 0.44 } } },
      { id: 'OKLO', ticker: 'OKLO', theme: 'Power Gen & Nuclear', tier: 'S', crowding: 0.14, byHorizon: { '1m': { er: 0.05, sd: 0.40 }, '3m': { er: 0.14, sd: 0.68 }, '6m': { er: 0.30, sd: 0.95 }, '1y': { er: 0.55, sd: 1.30 } } }
    ]
  };
}

/* company-scenario-bridge owner fixture (verbatim from the unit suite): a complete frozen reported base
   (so the baseline scenario is ready), lineage clocks 30 whole days before asOf (so lineage-cutoff flips
   within→stale), one required + one optional evidence gap (so evidence-gap-policy flips preserve→refuse),
   and distinct statement/model cutoffs + revisions (so accepted-state flips the source-qualified anchor). */
function companyOwnerFixture() {
  return {
    contractVersion: 'company-scenario-owner-state/v1',
    toolId: 'company-fundamentals-lab',
    companyId: 'company-fundamentals-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'accepted publication snapshot',
    reported: {
      revenue: { value: 200000, unit: 'USD-millions', state: 'reported' },
      operatingMargin: { value: 0.4, unit: 'ratio', state: 'reported' },
      revenueGrowth: { value: 0.1, unit: 'ratio', state: 'reported' },
      capexIntensity: { value: 0.2, unit: 'ratio', state: 'reported' },
      valuationMultiple: { value: 20, unit: 'x', state: 'reported' }
    },
    lineage: {
      revision: 4,
      owner: 'accepted-publication',
      scenarioRevisionId: 'scn-rev-7',
      createdAt: '2026-06-24T20:00:00.000Z',
      statementCutoff: '2026-06-20T00:00:00.000Z',
      modelCutoff: '2026-07-01T00:00:00.000Z'
    },
    gaps: [
      { evidenceClass: 'segment-detail', concept: 'SegmentRevenue', state: 'unavailable', required: true },
      { evidenceClass: 'guidance', concept: 'ForwardGuidance', state: 'unavailable', required: false }
    ]
  };
}

/* msft-margin-eps owner fixture (verbatim from the unit suite): a FROZEN static-model snapshot whose
   `bridge` carries the decimal FY26 facts + FY27 growth/margin levers the owner page already computes,
   the frozen `depreciationBase` (FY26 D&A) the depreciation-growth + capex-phase levers scale into the
   FY27 incremental depreciation step, and the two owner-computed Q4 FY26 OM `anchors` the earnings-anchor
   lever selects between. The adapter recomputes only from these frozen owner facts through the
   SINGLE-SOURCE FY26->FY27 bridge (RLFUNDAMENTALS.msftAnnualBridge). */
function msftOwnerFixture() {
  return {
    contractVersion: 'msft-margin-eps-owner-state/v1',
    toolId: 'msft-july-print-model',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'static model snapshot',
    bridge: {
      revFY26: 330, om26: 0.46,
      vol: 0.10, prc: 0.05, churn: 0.02, fx: -0.01,
      pm: 0.95, vm: 0.65, cm: 0.75, opexI: 0.12,
      dDep: 20,
      oi: 2, tax: 0.20, sh: 7.5, pe: 30
    },
    depreciationBase: 40,
    anchors: { consensus: 0.46, seasonality: 0.44 }
  };
}

function makeScope6Descriptors(mr, fm) {
  return {
    'causal-rotation-lab': {
      ownerState: () => causalOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        const key = base.posture + '|' + base.riskOverlay;
        const candidates = owner.evaluations[key].candidates;
        assert.equal(summary.candidateCount, candidates.length, 'the candidate count is the owner evaluation, not a recount');
        const top = candidates.length ? candidates[0] : null;
        assert.equal(summary.stage, top ? top.stage : null, 'the stage passes through from the frozen owner evaluation');
        assert.equal(summary.candidate, top ? top.candidateId : null, 'the reported candidate is the owner-ranked leader');
        assert.equal(summary.planEligible, top ? top.planEligible === true : false, 'plan eligibility is the owner disposition');
      },
      // Measured on the committed observation set: all five candidates sit at `watch`, a stage every
      // posture's visibleStages admits, and none clears the overlay's extra-cluster bar. Both levers are
      // therefore PROVED flat regions here rather than unwired — a different evidence set would move them.
      expectFlatParameters: true,
      cases: () => [
        ['posture', 'confirmation'],
        ['riskOverlay', 'tightened']
      ]
    },
    'fx-regime-relative-value-lab': {
      ownerState: () => fxVehicleOwnerState(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner }) => {
        assert.equal(summary.evaluationCount, owner.vehicleFit.evaluations.length, 'every registry vehicle is carried through, not just the selected one');
        assert.equal(summary.selectedVehicleId, owner.vehicleFit.selected.vehicleId, 'the owner selection passes through unchanged');
        assert.equal(summary.eligibleCount, owner.vehicleFit.evaluations.filter((entry) => entry.state === 'Eligible').length, 'the eligible count is the owner disposition, not a recount');
      },
      // Every lever is exercised; each one is a PROVED flat region because the owner decision is frozen.
      expectFlatParameters: true,
      cases: () => [
        ['horizon', 'tactical'],
        ['vehicle-class', 'broad-dollar-basket'],
        ['daily-reset', 'permit-tactical']
      ]
    },
    'sector-research-lab': {
      ownerState: () => sectorOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        owner.sectors.forEach((sector) => {
          const kernel = mr.rrgReadout(sector.rs.SPY, base['short-lookback'], base['long-lookback']);
          const view = summary.transition.sectors.find((entry) => entry.id === sector.id);
          assert.equal(view.quad, kernel.quad, `${sector.id} quad is single-sourced from rrgReadout`);
          assert.equal(view.rsRatio, Math.round(kernel.rsRatio * 1e4) / 1e4, `${sector.id} rsRatio parity vs the module primitive`);
        });
      },
      cases: () => [
        ['short-lookback', 42],
        ['long-lookback', 63],
        ['acceleration-weight', 0.6],
        ['breadth-weight', 0.6],
        ['risk-weight', 0.6],
        ['benchmark', 'RSP'],
        ['etf-fit-weight', 0.6]
      ]
    },
    'global-rotation-lab': {
      ownerState: () => countryOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        const weights = { short: base['short-horizon-weight'], medium: base['medium-horizon-weight'], long: base['long-horizon-weight'] };
        owner.countries.forEach((country) => {
          const entry = summary.queue.find((q) => q.id === country.id);
          const momentum = mr.countryHorizonMomentum(country.rel21, country.rel63, country.rel126, weights);
          assert.equal(entry.momentum, Math.round(momentum * 1e6) / 1e6, `${country.id} momentum is single-sourced from countryHorizonMomentum`);
        });
      },
      cases: () => [
        ['short-horizon-weight', 0.5],
        ['medium-horizon-weight', 0.6],
        ['long-horizon-weight', 0.5],
        ['fx-weight', 0.5],
        ['local-close-max-age', 6],
        ['volatility-penalty', 0.5],
        ['diversification-weight', 0.5]
      ]
    },
    'real-assets-lab': {
      ownerState: () => realAssetOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner }) => {
        // Owner parity: the confirmation breadth equals the single-sourced module breadth primitive
        // run directly on the frozen commodity-breadth returns (single source, no re-implementation).
        assert.equal(summary.confirmation.breadth, Math.round(mr.realBreadthPct(owner.breadthReturns) * 1e4) / 1e4, 'confirmation breadth is single-sourced from realBreadthPct');
      },
      cases: () => [
        ['usd-shock', 6],
        ['rate-shock', 120],
        ['risk-appetite', 0.6],
        ['volatility-penalty', 0.6],
        ['drawdown-limit', 6],
        ['breadth-threshold', 50]
      ]
    },
    'bond-regime-lab': {
      ownerState: () => bondSleeveOwnerFixture(),
      base: (definition) => ({ ...defaultValues(definition), 'rate-shock': 40, 'spread-shock': 20 }),
      ownerFact: ({ summary, owner, base }) => {
        // Owner parity: each sleeve outcome total is the single-sourced sleeve decomposition run
        // directly on the frozen sleeve characteristics under the base scenario (single source).
        owner.sleeves.forEach((sleeve) => {
          const spreadShockBp = sleeve.spreadShockKind === 'none' ? null : base['spread-shock'];
          const parity = mr.sleeveTotalReturn(base.carry, sleeve.rateDuration, sleeve.spreadDuration, base.convexity, base.horizon / 30, base['rate-shock'], spreadShockBp);
          const outcome = summary.outcomes.find((entry) => entry.id === sleeve.id);
          assert.equal(outcome.total, Math.round(parity.total * 1e6) / 1e6, `${sleeve.id} total is single-sourced from sleeveTotalReturn`);
        });
      },
      cases: () => [
        ['horizon', 180],
        ['rate-shock', 120],
        ['spread-shock', 90],
        ['carry', 6],
        ['convexity', 9],
        ['inflation-shock', 60],
        ['real-yield-shock', 60],
        ['confirmation-threshold', 0.4]
      ]
    },
    'etf-momentum-lab': {
      ownerState: () => etfOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        // Owner parity: each ranking entry's momentum equals the single-sourced module momentum primitive
        // run directly on the frozen fund trailing returns at the default horizon (single source).
        const horizonKey = { '1m': '1M', '3m': '3M', '6m': '6M', '12m': '1Y' }[base.horizon];
        owner.funds.forEach((fund) => {
          const entry = summary.ranking.find((row) => row.ticker === fund.ticker);
          const momentum = mr.etfMomentumSignal(fund, horizonKey);
          assert.equal(entry.momentum, Math.round(momentum * 1e6) / 1e6, `${fund.ticker} momentum is single-sourced from etfMomentumSignal`);
        });
      },
      cases: () => [
        ['horizon', '12m'],
        ['momentum-weight', 0.9],
        ['risk-penalty', 0.6],
        ['benchmark', 'QQQ'],
        ['weighting', 'equal'],
        ['max-constituent-weight', 0.5]
      ]
    },
    'ai-capex-strategy-lab': {
      ownerState: () => aiCapexOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        // Owner parity: the distribution band + CVaR are the single-sourced RLFUNDAMENTALS primitives
        // run directly on the portfolio's crowding/risk-adjusted mu/sigma (single source, no re-impl).
        const port = fm.computeAiCapexPortfolio(owner, base);
        const band = fm.bandStats(port.muAdj, port.sdAdj, port.target);
        assert.equal(summary.distribution.median, Math.round(band.med * 1e6) / 1e6, 'distribution median is single-sourced from bandStats');
        assert.equal(summary.distribution.cvar, Math.round(fm.cvarOf(port.muAdj, port.sdAdj, 0.05) * 1e6) / 1e6, 'distribution CVaR is single-sourced from cvarOf');
      },
      cases: () => [
        ['horizon', '1y'],
        ['theme-weight', 0.9],
        ['crowding-penalty', 0.8],
        ['risk-damper', 0.8],
        ['correlation-ceiling', 0.4],
        ['objective', 'return']
      ]
    },
    'company-fundamentals-lab': {
      ownerState: () => companyOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        // Owner parity: the bounded scenario / lineage age / gap ledger are the single-sourced
        // RLFUNDAMENTALS primitives run directly on the frozen owner facts (single source, no re-impl).
        assert.deepEqual(summary.scenario, fm.projectCompanyScenario(owner.reported, { growth: base['growth-assumption'], marginChange: base['margin-change'], gapPolicy: 'preserve' }), 'bounded scenario is single-sourced from projectCompanyScenario');
        assert.deepEqual(summary.lineage, fm.companyScenarioLineage(owner.lineage, owner.asOf, base['lineage-cutoff']), 'lineage age is single-sourced from companyScenarioLineage');
        assert.deepEqual(summary.gaps, fm.companyGapLedger(owner.gaps, 'preserve'), 'gap ledger is single-sourced from companyGapLedger');
        assert.equal(summary.scenario.revenue, 220000, 'the parity scenario reproduces the owner revenue node (200000 * 1.10)');
      },
      cases: () => [
        ['accepted-state', 'scenario'],
        ['growth-assumption', 25],
        ['margin-change', 5],
        ['evidence-gap-policy', 'refuse'],
        ['lineage-cutoff', 10]
      ]
    },
    'msft-july-print-model': {
      ownerState: () => msftOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        // Owner parity: the margin/EPS/valuation summary is the SINGLE-SOURCE bridge
        // (RLFUNDAMENTALS.msftAnnualBridge) run on the default-param scenario inputs
        // (computeMsftBridgeInputs) — not a re-implementation.
        const inputs = fm.computeMsftBridgeInputs(owner, base);
        const bridge = fm.msftAnnualBridge(inputs);
        assert.equal(summary.margin.om27, Math.round(bridge.OM27 * 1e6) / 1e6, 'margin OM27 is single-sourced from msftAnnualBridge');
        assert.equal(summary.margin.oi27, Math.round(bridge.OI27 * 1e6) / 1e6, 'margin OI27 is single-sourced from msftAnnualBridge');
        assert.equal(summary.eps.eps27, Math.round(bridge.EPS27 * 1e6) / 1e6, 'EPS27 is single-sourced from msftAnnualBridge');
        assert.equal(summary.valuation.impliedPrice, Math.round(bridge.implied * 1e6) / 1e6, 'implied price is single-sourced from msftAnnualBridge');
      },
      cases: () => [
        ['depreciation-growth', 40],
        ['mix-shift', 8],
        ['fx-impact', 5],
        ['memory-cost-impact', 6],
        ['capex-phase', 'early'],
        ['earnings-anchor', 'seasonality'],
        ['valuation-multiple', 50]
      ]
    }
  };
}

/* Drive one Scope-06 adapter through the shared runtime: prepare with its owner fixture, assert
   owner parity, and recompute EVERY declared parameter proving the declared sensitivity effect. The
   declared output path is read from the DEFINITION's affectsOutputPaths (registry-derived). */
async function exerciseScope6Adapter(runtime, api, definition, descriptor) {
  const owner = descriptor.ownerState();
  const base = descriptor.base(definition);
  // Seeded-resampling definitions (e.g. ai-capex) require an explicit integer seed matching the seed
  // parameter; deterministic definitions (randomnessClass "none") require a null seed.
  const seedArg = (definition.seedPolicy && definition.seedPolicy.required) ? base.seed : null;
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: seedArg,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready', `${definition.toolId} prepare state`);
  const summary = prepared.current.output.values.summary;
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, `${definition.toolId} evidence identity is bound`);
  descriptor.ownerFact({ summary, owner, base, prepared });

  const declaredParams = definition.parameterDefinitions
    .filter((parameter) => parameter.parameterId !== 'seed')
    .map((parameter) => parameter.parameterId);
  const cases = descriptor.cases(owner, base);
  const coveredParams = cases.map(([parameterId]) => parameterId).sort();
  assert.deepEqual(coveredParams, declaredParams.slice().sort(), `${definition.toolId} exercises every declared parameter`);

  for (const [parameterId, value] of cases) {
    const paramDef = definition.parameterDefinitions.find((parameter) => parameter.parameterId === parameterId);
    const declaredPaths = paramDef.affectsOutputPaths;
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: seedArg,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `${definition.toolId} changed ${parameterId}`);
    assert.equal(run.sensitivity.seedChanged, false, `${definition.toolId} ${parameterId} is a structural sensitivity, not a seed change`);
    assert.equal(run.sensitivity.sharedRandomness.baselinePathIdentity, run.sensitivity.sharedRandomness.currentPathIdentity, `${definition.toolId} ${parameterId} preserves the runtime-owned randomness path identity`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `${definition.toolId} sensitivity effect present for ${parameterId}`);
    /* A frozen-owner adapter proves a FLAT region instead of moving output: the projection cannot
       change because the owner decision is settled. Demanding movement there would force a real
       adapter to fake an effect, so the flat case is asserted as flat WITH its proof. */
    if (descriptor.expectFlatParameters) {
      assert.equal(effect.outputChanged, false, `${definition.toolId} ${parameterId} is a proved flat region (owner decision frozen)`);
      assert.notEqual(effect.flatRegionProof, null, `${definition.toolId} ${parameterId} carries a proved flat region`);
    } else {
      assert.equal(effect.outputChanged, true, `${definition.toolId} ${parameterId} moves ${declaredPaths.join(',')}`);
    }
    assert.deepEqual(effect.resultPaths, declaredPaths, `${definition.toolId} ${parameterId} resultPaths == definition.affectsOutputPaths`);
    await runtime.recompute({ parameterValues: { ...base }, seed: seedArg, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:30.000Z' });
  }
}

test('TP-06-02 macro rotation and fundamental adapters: registry-derived loop runs the delivered Scope-06 set at owner-parity with real parameter effects', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const fm = loadFundamentalModels();

  const definitions = scope6Definitions();
  assert.equal(definitions.length, 10, 'all ten Scope-06 definitions are declared in the registry');

  const runtime = makeRuntime(api, definitions);
  const results = registerScope6(runtime, api, mr, fm, definitions);

  // Registry-derived membership: the registered Scope-06 set is EXACTLY the combined delivered
  // supportedAdapterIds (a tool whose owner seam is not yet extracted is honestly absent).
  const registeredAdapterIds = Object.keys(results).sort();
  const deliveredAdapterIds = [...mr.supportedAdapterIds, ...fm.supportedAdapterIds].slice().sort();
  assert.deepEqual(registeredAdapterIds, deliveredAdapterIds, 'registered Scope-06 adapters == macro-rotation + fundamental-models supportedAdapterIds (delivered set)');
  for (const adapterId of registeredAdapterIds) {
    assert.equal(results[adapterId].ok, true, `${adapterId} registered: ${JSON.stringify(results[adapterId].error || {})}`);
  }

  const descriptors = makeScope6Descriptors(mr, fm);
  for (const definition of definitions) {
    if (!registeredAdapterIds.includes(definition.adapterId)) continue; // not yet delivered
    const descriptor = descriptors[definition.toolId];
    assert.ok(descriptor, `descriptor present for delivered Scope-06 member ${definition.toolId}`);
    await exerciseScope6Adapter(runtime, api, definition, descriptor);
  }
});

test('TP-06-02 macro rotation and fundamental adapters: Scope 05 adapter set and a real Scope 05 owner-run fingerprint are unchanged when Scope 06 shares the runtime', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const opts = loadOptions();
  const rlvol = loadRlvol();
  const mr = loadMacroRotation();
  const fm = loadFundamentalModels();

  // Scope 05 supportedAdapterIds are byte-unchanged (no Scope-06 edit leaked into the Scope-05 modules).
  assert.deepEqual(ms.supportedAdapterIds.slice().sort(), ['simple-adapter/conditional-volatility/v1', 'simple-adapter/market-breadth/v1', 'simple-adapter/session-auction/v1', 'simple-adapter/swing-transition/v1', 'simple-adapter/technical-five-gate/v1', 'simple-adapter/trend-confirmation/v1'], 'market-structure supportedAdapterIds unchanged (6)');
  assert.deepEqual(opts.supportedAdapterIds.slice().sort(), ['simple-adapter/dealer-gamma-playbook/v1', 'simple-adapter/options-anomaly/v1', 'simple-adapter/options-surface/v1'], 'options supportedAdapterIds unchanged (3)');

  const breadthDefinition = clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'market-heatmap-lab'));
  const sectorDefinition = clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'sector-research-lab'));

  async function breadthFingerprint(runtime) {
    const prepared = requireValue(await runtime.prepare({
      definitionId: breadthDefinition.definitionId,
      ownerContext: { ownerState: breadthOwnerState(ms) },
      parameterValues: defaultValues(breadthDefinition),
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:04:00.000Z'
    }));
    return api.fingerprint(prepared.current.output.values.summary);
  }

  // Scope 05 breadth alone.
  const runtimeAlone = makeRuntime(api, [breadthDefinition]);
  ms.registerMarketStructureAdapters(runtimeAlone, api, [breadthDefinition], { rlvol });
  const fingerprintAlone = await breadthFingerprint(runtimeAlone);

  // Scope 05 breadth + Scope 06 sector-rotation in ONE shared runtime.
  const runtimeShared = makeRuntime(api, [breadthDefinition, sectorDefinition]);
  ms.registerMarketStructureAdapters(runtimeShared, api, [breadthDefinition], { rlvol });
  const sharedResults = registerScope6(runtimeShared, api, mr, fm, [sectorDefinition]);
  assert.equal(sharedResults['simple-adapter/sector-rotation-transition/v1'].ok, true, 'sector-rotation registers alongside Scope 05 in one runtime');
  const fingerprintShared = await breadthFingerprint(runtimeShared);

  // The Scope 05 breadth owner run is byte-identical whether or not Scope 06 shares the runtime.
  assert.equal(fingerprintShared, fingerprintAlone, 'Scope 05 breadth owner-run fingerprint is unchanged when Scope 06 shares the runtime');
});

/*
 * TP-07-02 — strategy/property/method + in-Brief Center registry-derived loop and complete-registry coverage.
 *
 * Every definition owned by strategy-research.js, property-research.js, or market-action.js registers through
 * its production factory, then this
 * suite drives every one end-to-end through the SAME generic registry-derived exerciser the Scope-05/06 blocks
 * use (exerciseScope6Adapter): an owner-fixture prepare, an owner-parity single-source check, and a
 * per-declared-parameter recompute proving the sensitivity effect from the registry's own affectsOutputPaths.
 * Membership is registry-derived (definitions whose adapterModule is a Scope-07 module), never a hard-coded
 * adapter-ID list. A dedicated SCN-012-036 completeness test then registers every production module in ONE
 * runtime and proves every ordinary registry tool resolves exactly one registered owner adapter + the one Center
 * model resolves, with zero generic fallback / tool-id branch / authority. Owner fixtures preserve the proven
 * frozen owner facts and include later definitions that entered these modules through the live registry.
 */

function loadStrategyResearch() {
  const path = require.resolve('../rlexperience-adapters/strategy-research.js');
  delete require.cache[path];
  return require(path);
}

function loadPropertyResearch() {
  const path = require.resolve('../rlexperience-adapters/property-research.js');
  delete require.cache[path];
  return require(path);
}

function loadMarketAction() {
  const path = require.resolve('../rlexperience-adapters/market-action.js');
  delete require.cache[path];
  return require(path);
}

function loadRentalEngine() {
  const path = require.resolve('../rlrental.js');
  delete require.cache[path];
  return require(path);
}

function loadPortfolioResearch() {
  const path = require.resolve('../rlexperience-adapters/portfolio-research.js');
  delete require.cache[path];
  return require(path);
}

function loadResearchAgenda() {
  const path = require.resolve('../rlexperience-adapters/research-agenda.js');
  delete require.cache[path];
  return require(path);
}

function loadAgendaEngine() {
  const path = require.resolve('../rlagenda.js');
  delete require.cache[path];
  return require(path);
}

const STRATEGY_PROPERTY_ACTION_MODULES = ['rlexperience-adapters/strategy-research.js', 'rlexperience-adapters/property-research.js', 'rlexperience-adapters/market-action.js'];

function strategyPropertyActionDefinitions() {
  return readJson('simple-models.json').definitions
    .filter((definition) => STRATEGY_PROPERTY_ACTION_MODULES.includes(definition.adapterModule))
    .map(clone);
}

/* Register the Scope-07 adapters through their production factories. property-research needs the injected
   rlrental owner engine (deps.rental) for its two str-scenario adapters; each factory self-filters by its own
   tool IDs, so the union equals the combined supportedAdapterIds — the delivered Scope-07 set (6 ordinary + Center). */
function registerScope7(runtime, api, sr, pr, ma, rental, definitions) {
  return Object.assign(
    {},
    sr.registerStrategyResearchAdapters(runtime, api, definitions),
    pr.registerPropertyResearchAdapters(runtime, api, definitions, { rental }),
    ma.registerMarketActionAdapters(runtime, api, definitions)
  );
}

/* ═══════════════════════ per-tool owner fixtures (verbatim from the Scope-07 unit suite) ═══════════════════════ */

/* strategy-evolution (owner seam = strategy-self-improvement-lab.html): a multi-regime boom-bust-recovery path;
   the SEEDED path comes only from the single-sourced module genSeries/mulberry32. */
function strategyOwnerFixture() {
  return {
    contractVersion: 'strategy-evolution-owner-state/v1',
    toolId: 'strategy-self-improvement-lab',
    asOf: '2026-07-26T20:00:00.000Z',
    source: 'test-owner synthetic seeded scenario',
    scenario: { id: 'boom-bust-recovery', label: 'Boom -> bust -> recovery' },
    years: 8,
    regimes: [
      { frac: 0.4, muAnnual: 0.17, sigAnnual: 0.14 },
      { frac: 0.2, muAnnual: -0.38, sigAnnual: 0.42 },
      { frac: 0.4, muAnnual: 0.13, sigAnnual: 0.18 }
    ],
    startLevers: { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 },
    leverRanges: {
      fast: { min: 5, max: 60, step: 5 },
      slow: { min: 50, max: 250, step: 10 },
      momLookback: { min: 20, max: 250, step: 10 },
      volTarget: { min: 0.05, max: 0.35, step: 0.025 },
      stopDd: { min: 0.05, max: 0.40, step: 0.025 },
      maxLeverage: { min: 0.5, max: 3.0, step: 0.25 }
    },
    goal: { targetCagr: 0.12, sharpeFloor: 1.0, maxDdCeiling: 0.20, minTimeInMarket: 0.25 },
    walkForward: { folds: 5, trainRatio: 0.6, acceptMargin: 0.05, oosGapTolerance: 0.8 }
  };
}

/* disclosure-decay (owner seam = smart-money-flow-lab.html): five clusters straddling the gates; reference "today"
   2026-07-05. */
function disclosureOwnerFixture() {
  return {
    contractVersion: 'disclosure-decay-owner-state/v1',
    toolId: 'smart-money-flow-lab',
    asOf: '2026-07-05',
    today: '2026-07-05',
    source: 'test-owner illustrative filing set',
    sourceClass: 'model-estimate',
    disclosures: [
      { ticker: 'AAA', filer: 'Dir A1 (Form 4)', type: 'insider', side: 'buy', usd: 2100000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'AAA', filer: 'Off A2 (Form 4)', type: 'insider', side: 'buy', usd: 950000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'AAA', filer: 'Off A3 (Form 4)', type: 'insider', side: 'buy', usd: 640000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'BBB', filer: 'Sen B1 (STOCK Act)', type: 'congress', side: 'buy', usd: 250000, txn: '2026-04-30', disclosed: '2026-06-29' },
      { ticker: 'BBB', filer: 'Rep B2 (STOCK Act)', type: 'congress', side: 'buy', usd: 120000, txn: '2026-04-30', disclosed: '2026-06-29' },
      { ticker: 'BBB', filer: 'Rep B3 (STOCK Act)', type: 'congress', side: 'buy', usd: 90000, txn: '2026-04-30', disclosed: '2026-06-29' },
      { ticker: 'CCC', filer: 'Off C1 (Form 4)', type: 'insider', side: 'sell', usd: 5200000, txn: '2026-06-28', disclosed: '2026-07-01' },
      { ticker: 'CCC', filer: 'Off C2 (Form 4)', type: 'insider', side: 'sell', usd: 1800000, txn: '2026-06-28', disclosed: '2026-07-01' },
      { ticker: 'CCC', filer: 'Dir C3 (Form 4)', type: 'insider', side: 'sell', usd: 900000, txn: '2026-06-28', disclosed: '2026-07-01' },
      { ticker: 'DDD', filer: 'Rep D1 (STOCK Act)', type: 'congress', side: 'buy', usd: 175000, txn: '2026-05-20', disclosed: '2026-06-29' },
      { ticker: 'DDD', filer: 'Sen D2 (STOCK Act)', type: 'congress', side: 'buy', usd: 130000, txn: '2026-05-20', disclosed: '2026-06-29' },
      { ticker: 'EEE', filer: 'Fund E1 (13F)', type: 'institution', side: 'buy', usd: 42000000, txn: '2026-05-10', disclosed: '2026-06-29' }
    ]
  };
}

/* walk-forward-validation (owner seam = strategy-validation-lab.html): closes pre-generated deterministically via
   the single-sourced module genSeries (a seeded generation done here, in the fixture — the ADAPTER is non-seeded
   and only consumes the frozen closes). Registry universe holds 2/3; watchlist holds 1/3. */
function walkForwardValidationOwnerFixture(sr) {
  const closesFor = (seed, regimes) => Array.from(sr.genSeries(seed, 5, regimes).px);
  const up = [{ frac: 1, muAnnual: 0.22, sigAnnual: 0.10 }];
  const whip = [{ frac: 1, muAnnual: -0.20, sigAnnual: 0.35 }];
  const down = [{ frac: 1, muAnnual: -0.18, sigAnnual: 0.30 }];
  const flat = [{ frac: 1, muAnnual: 0.0, sigAnnual: 0.42 }];
  return {
    contractVersion: 'walk-forward-validation-owner-state/v1',
    toolId: 'strategy-validation-lab',
    asOf: '2026-07-26',
    source: 'test-owner synthetic multi-instrument universe',
    sourceClass: 'model-estimate',
    trainRatio: 0.6,
    startLevers: { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 },
    goal: { targetCagr: -1, sharpeFloor: 0.5, maxDdCeiling: 0.99, minTimeInMarket: 0.0 },
    universes: {
      registry: [
        { symbol: 'REG-STRONG', closes: closesFor(111, up), sourceClass: 'model-estimate' },
        { symbol: 'REG-STEADY', closes: closesFor(444, up), sourceClass: 'model-estimate' },
        { symbol: 'REG-WHIP', closes: closesFor(606, whip), sourceClass: 'model-estimate' }
      ],
      'current-watchlist': [
        { symbol: 'WL-EDGE', closes: closesFor(808, flat), sourceClass: 'model-estimate' },
        { symbol: 'WL-CLEAN', closes: closesFor(555, up), sourceClass: 'model-estimate' },
        { symbol: 'WL-DOWN', closes: closesFor(303, down), sourceClass: 'model-estimate' }
      ]
    }
  };
}

/* str-scenario/palm-springs (owner seam = rlrental.js): the place-based cash flow is computed ONLY by
   RLRENTAL.computeRentalResult; full-economics required set includes the UNDISCLOSED property tax + capital
   reserve so the owner engine returns INCOMPLETE (a null bottom line). */
function palmOwnerFixture() {
  return {
    contractVersion: 'str-scenario-owner-state/v1',
    toolId: 'palm-springs-rental-market-lab',
    asOf: '2026-07-26',
    source: 'test-owner synthetic place scenario',
    marketId: 'palm-springs-ca',
    formulaVersion: 'place-based-rental-market-formula/v2',
    forecastYear: 2026,
    requiredFixedRiskCostFieldIds: ['insurance'],
    fullRequiredFixedRiskCostFieldIds: ['insurance', 'property-tax', 'capital-reserve'],
    missingEconomics: ['property-tax', 'capital-reserve', 'resale-basis'],
    loanTermYears: 30,
    leverageRatio: 0.7,
    downPaymentRatio: 0.3,
    baseFixedInsuranceUsd: null,
    segments: {
      'whole-market': { segmentId: 'whole-market', pairKey: 'palm-springs-ca::whole-market', unitId: 'ps-whole', baseOccupancy: 0.6, availableNights: 340, purchasePriceUsd: 1250000, baseAdrUsd: 600 },
      'large-luxury': { segmentId: 'large-luxury-5plus', pairKey: 'palm-springs-ca::large-luxury-5plus', unitId: 'ps-lux', baseOccupancy: 0.55, availableNights: 300, purchasePriceUsd: 3500000, baseAdrUsd: 1200 }
    }
  };
}

/* Reconstruct the EXACT owner OPERATING context + assumptions property-research.js derives for one Palm Springs
   segment + parameter set, so the loop can call RLRENTAL.computeRentalResult directly and prove owner-parity. */
function palmOwnerRun(rental, owner, params, requiredKey, demandDelta) {
  const key = params.segment === 'large-luxury' ? 'large-luxury' : 'whole-market';
  const preset = owner.segments[key];
  const ctx = {
    marketId: owner.marketId, segmentId: preset.segmentId, pairKey: preset.pairKey, unitId: preset.unitId,
    scenarioId: 'baseline', formulaVersion: owner.formulaVersion, baseOccupancy: preset.baseOccupancy,
    baseAdrUsd: preset.baseAdrUsd, availableNights: preset.availableNights,
    requiredFixedRiskCostFieldIds: owner[requiredKey], bounds: {}
  };
  const assumptions = {
    contractVersion: 'place-based-rental-market-user-assumptions/v2', marketId: owner.marketId,
    segmentId: preset.segmentId, pairKey: preset.pairKey, unitId: preset.unitId, scenarioId: 'baseline',
    forecastYear: owner.forecastYear, demandDelta: demandDelta, supplyDelta: 0, adrShock: 0,
    downtime: { method: 'explicit-disjoint-days', items: [] }, purchasePriceUsd: preset.purchasePriceUsd,
    leverageRatio: owner.leverageRatio, downPaymentRatio: owner.downPaymentRatio,
    annualMortgageRate: params['financing-rate'] / 100, loanTermYears: owner.loanTermYears,
    variableOperatingExpenseRatio: params['operating-cost'] / 100,
    fixedRiskCosts: [{ costFieldId: 'insurance', annualUsd: params.insurance }],
    baseOccupancy: params.occupancy / 100, baseAdrUsd: params.adr, availableNights: preset.availableNights
  };
  return rental.computeRentalResult(ctx, assumptions);
}

/* str-scenario/ocean-shores (owner seam = rlrental.js): the SECOND place-based scenario; no explicit `insurance`
   Simple input (the disclosed insurance cost is the frozen owner baseFixedInsuranceUsd). */
function oceanOwnerFixture() {
  return {
    contractVersion: 'str-scenario-owner-state/v1',
    toolId: 'ocean-shores-rental-market-lab',
    asOf: '2026-07-26',
    source: 'test-owner synthetic seasonal place scenario',
    marketId: 'ocean-shores-wa',
    formulaVersion: 'place-based-rental-market-formula/v2',
    forecastYear: 2026,
    requiredFixedRiskCostFieldIds: ['insurance'],
    fullRequiredFixedRiskCostFieldIds: ['insurance', 'property-tax', 'capital-reserve'],
    missingEconomics: ['property-tax', 'capital-reserve', 'resale-basis'],
    loanTermYears: 30,
    leverageRatio: 0.7,
    downPaymentRatio: 0.3,
    baseFixedInsuranceUsd: 28000,
    segments: {
      'whole-market': { segmentId: 'whole-market', pairKey: 'ocean-shores-wa::whole-market', unitId: 'os-whole', baseOccupancy: 0.5, availableNights: 300, purchasePriceUsd: 480000, baseAdrUsd: 320 },
      'large-luxury': { segmentId: 'large-luxury-5plus', pairKey: 'ocean-shores-wa::large-luxury-5plus', unitId: 'os-lux', baseOccupancy: 0.45, availableNights: 260, purchasePriceUsd: 1150000, baseAdrUsd: 900 }
    }
  };
}

/* Reconstruct the EXACT owner OPERATING context + assumptions for one Ocean Shores segment + parameter set (the
   disclosed insurance cost is the frozen owner baseFixedInsuranceUsd), so the loop can prove owner-parity. */
function oceanOwnerRun(rental, owner, params, requiredKey, demandDelta) {
  const key = params.segment === 'large-luxury' ? 'large-luxury' : 'whole-market';
  const preset = owner.segments[key];
  const ctx = {
    marketId: owner.marketId, segmentId: preset.segmentId, pairKey: preset.pairKey, unitId: preset.unitId,
    scenarioId: 'baseline', formulaVersion: owner.formulaVersion, baseOccupancy: preset.baseOccupancy,
    baseAdrUsd: preset.baseAdrUsd, availableNights: preset.availableNights,
    requiredFixedRiskCostFieldIds: owner[requiredKey], bounds: {}
  };
  const assumptions = {
    contractVersion: 'place-based-rental-market-user-assumptions/v2', marketId: owner.marketId,
    segmentId: preset.segmentId, pairKey: preset.pairKey, unitId: preset.unitId, scenarioId: 'baseline',
    forecastYear: owner.forecastYear, demandDelta: demandDelta, supplyDelta: 0, adrShock: 0,
    downtime: { method: 'explicit-disjoint-days', items: [] }, purchasePriceUsd: preset.purchasePriceUsd,
    leverageRatio: owner.leverageRatio, downPaymentRatio: owner.downPaymentRatio,
    annualMortgageRate: params['financing-rate'] / 100, loanTermYears: owner.loanTermYears,
    variableOperatingExpenseRatio: params['operating-cost'] / 100,
    fixedRiskCosts: [{ costFieldId: 'insurance', annualUsd: owner.baseFixedInsuranceUsd }],
    baseOccupancy: params.occupancy / 100, baseAdrUsd: params.adr, availableNights: preset.availableNights
  };
  return rental.computeRentalResult(ctx, assumptions);
}

/* location-suitability (owner seam = waterfront-polo-lab.html geo primitives): the great-circle / drive-time /
   nearest-club / market-filter primitives are the SINGLE SOURCE in property-research.js (RLPROPERTY). */
function locationOwnerFixture() {
  return {
    contractVersion: 'location-suitability-owner-state/v1',
    toolId: 'waterfront-polo-lab',
    asOf: '2026-07-26',
    source: 'test-owner synthetic location universe',
    driveModel: { defaultMinutes: 40, avgSpeedMph: 38, roadFactor: 1.25 },
    mastersClubs: [
      { id: 'club-r', name: 'Reported club', lat: 28.50, lon: -81.40, confidence: 'reported' },
      { id: 'club-s', name: 'Seed club', lat: 30.00, lon: -82.00, confidence: 'seed' }
    ],
    markets: [
      { id: 'm-a', name: 'Alpha Lake', lat: 28.55, lon: -81.45, water: 'lake', medK: 1200, ppsf: 400, insBand: 2, flood: 1, surge: 1, land: 3, budgetFit: 'strong', q: 'measured' },
      { id: 'm-b', name: 'Bravo Lake (far)', lat: 28.85, lon: -81.75, water: 'lake', medK: 1000, ppsf: 350, insBand: 5, flood: 3, surge: 3, land: 2, budgetFit: 'good', q: 'estimated' },
      { id: 'm-c', name: 'Charlie Lake (pricey)', lat: 28.60, lon: -81.55, water: 'lake', medK: 1400, ppsf: 800, insBand: 3, flood: 1, surge: 1, land: 3, budgetFit: 'good', q: 'measured' },
      { id: 'm-d', name: 'Delta River', lat: 28.45, lon: -81.30, water: 'river', medK: 1100, ppsf: 300, insBand: 2, flood: 1, surge: 0, land: 4, budgetFit: 'strong', q: 'measured' },
      { id: 'm-e', name: 'Echo Lake (over budget)', lat: 28.52, lon: -81.42, water: 'lake', medK: 1800, ppsf: 500, insBand: 1, flood: 1, surge: 0, land: 3, budgetFit: 'over', q: 'measured' },
      { id: 'm-f', name: 'Foxtrot Lake (seed club)', lat: 29.95, lon: -82.05, water: 'lake', medK: 1300, ppsf: 400, insBand: 2, flood: 1, surge: 1, land: 3, budgetFit: 'strong', q: 'measured' }
    ]
  };
}

/* Reconstruct one market's nearest-club drive DIRECTLY through the module's single-source owner primitives, so the
   loop can prove the adapter summary's geo values equal a direct RLPROPERTY.nearestClub + driveMinutesApprox run. */
function locationOwnerNearest(pr, owner, marketId) {
  const market = owner.markets.find((m) => m.id === marketId);
  const nearest = pr.nearestClub(market.lat, market.lon, owner.mastersClubs);
  const driveMin = pr.driveMinutesApprox(nearest.mi, owner.driveModel.avgSpeedMph, owner.driveModel.roadFactor);
  const club = owner.mastersClubs[nearest.idx];
  return {
    nearestClubId: club.id,
    nearestClubConfidence: club.confidence,
    nearestClubMi: Math.round(nearest.mi * 1e4) / 1e4,
    driveMin: Math.round(driveMin * 1e4) / 1e4
  };
}

/* market-action-triage (owner seam = rlbrief.js window/action-gating, single-sourced into market-action.js): the
   in-Brief Center triage. The 07:30 window holds a non-persistent gated action (XLK), a persistent gated action
   (SPY: a 3-read decline), and a watch-only idea (MAGS); two catalysts (near CPI, far FOMC). asOf 2026-07-26T11:30Z. */
function marketActionOwnerFixture() {
  const asOf = '2026-07-26T11:30:00.000Z';
  const base = Date.parse(asOf);
  const at = (days) => new Date(base + days * 864e5).toISOString();
  return {
    contractVersion: 'market-action-triage-owner-state/v1',
    toolId: 'market-brief',
    asOf,
    source: 'test-owner synthetic brief windows',
    windows: {
      '07:30': {
        label: '07:30 ET', asOf,
        recommendations: [
          { key: 'XLK', subject: 'XLK', action: 'add', trigger: 'hold breakout', invalidation: 'lose breakout', structuralAnchor: 'above 50d', confidence: 82, horizon: 'swing' },
          { key: 'SPY', subject: 'SPY', action: 'hedge', trigger: 'before CPI', invalidation: 'reclaim 200d', structuralAnchor: 'below 50d', confidence: 72, horizon: 'swing' },
          { key: 'MAGS', subject: 'MAGS', action: 'watch', trigger: 'breadth improves', invalidation: 'breadth rolls', structuralAnchor: 'at 50d', confidence: 70, horizon: 'tactical' }
        ],
        attention: [
          { title: 'Confirmed break', what: 'XLK cleared its base', structuralAnchor: '50d', confidence: 66 },
          { title: 'Watchlist only', what: 'MAGS breadth watch', structuralAnchor: '200d', confidence: 74 }
        ],
        seriesByKey: { XLK: [-0.2, -0.5, -0.3], SPY: [-0.2, -0.5, -0.9] },
        events: [{ when: at(3), event: 'CPI' }, { when: at(14), event: 'FOMC' }]
      },
      '11:00': {
        label: '11:00 ET', asOf,
        recommendations: [
          { key: 'XLK', subject: 'XLK', action: 'add', trigger: 'hold breakout', invalidation: 'lose breakout', structuralAnchor: 'above 50d', confidence: 80, horizon: 'swing' }
        ],
        attention: [{ title: 'Confirmed break', what: 'XLK holds', structuralAnchor: '50d', confidence: 64 }],
        seriesByKey: { XLK: [-0.2, -0.5, -0.9] },
        events: [{ when: at(3), event: 'CPI' }]
      },
      '15:00': { label: '15:00 ET', asOf, recommendations: [], attention: [], seriesByKey: {}, events: [] },
      '17:00': { label: '17:00 ET', asOf, recommendations: [], attention: [], seriesByKey: {}, events: [] }
    }
  };
}

function horizonLadderOwnerFixture() {
  const config = readJson('horizon-ladder-universe.json');
  return {
    contractVersion: 'horizon-ladder-owner-state/v1',
    toolId: 'horizon-ladder-lab',
    asOf: config.ledgerSnapshot.asOf,
    source: config.ledgerSnapshot.source,
    sourceClass: 'observed-fact',
    policy: { minResolvedSample: config.policy.minResolvedSample },
    cells: clone(config.ledgerSnapshot.cells),
    rates: clone(config.ledgerSnapshot.rates)
  };
}

/* Registry-derived descriptors for the seven Scope-07 members. Each ownerFact is a genuine single-source
   owner-parity assertion; each cases entry moves one declared parameter (values proven in the unit suite). The
   generic exerciseScope6Adapter reads the declared output path from the DEFINITION's affectsOutputPaths. */
function makeScope7Descriptors(sr, pr, ma, rental) {
  return {
    'strategy-self-improvement-lab': {
      ownerState: () => strategyOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        const series = sr.genSeries(base.seed, owner.years, owner.regimes);
        const baseWf = sr.walkForward(series, owner.startLevers, base['walk-forward-folds'], owner.walkForward.trainRatio);
        assert.equal(summary.outOfSample.meanOos, Math.round(baseWf.meanOos * 1e6) / 1e6, 'strategy baseline meanOos is single-sourced from RLSTRATEGY.walkForward');
        const samples = [series.px[0], series.px[Math.floor(series.days * 0.25)], series.px[Math.floor(series.days * 0.5)], series.px[Math.floor(series.days * 0.75)], series.px[series.days]];
        assert.equal(summary.path.pathIdentity, samples.map((v) => Math.round(v * 1e6) / 1e6).join(':'), 'strategy path identity is single-sourced from RLSTRATEGY.genSeries');
      },
      cases: () => [
        ['goal', 'cagr'],
        ['variable', 'vol-target'],
        ['search-budget', 6],
        ['overfit-penalty', 0.6],
        ['acceptance-threshold', 0.9],
        ['walk-forward-folds', 8]
      ]
    },
    'smart-money-flow-lab': {
      ownerState: () => disclosureOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, base }) => {
        const bbb = summary.conviction.perTicker.find((c) => c.ticker === 'BBB');
        assert.ok(bbb, 'BBB is a conviction cluster');
        assert.equal(bbb.naive, Math.round(sr.consensusScore(3, 250000 + 120000 + 90000, 6, base['lag-half-life']) * 1e6) / 1e6, 'BBB naive conviction is single-sourced from RLSTRATEGY.consensusScore');
        const bbbDecay = summary.decayedConviction.perTicker.find((c) => c.ticker === 'BBB');
        assert.equal(bbbDecay.retained, Math.round(sr.realisticEdgeFraction(60, base['lag-half-life']) * 1e6) / 1e6, 'BBB retained edge is single-sourced from RLSTRATEGY.realisticEdgeFraction');
      },
      cases: () => [
        ['source-mix', 'insider'],
        ['lag-half-life', 90],
        ['cluster-minimum', 2],
        ['consensus-threshold', 0.7],
        ['decay-floor', 0.5]
      ]
    },
    'strategy-validation-lab': {
      ownerState: () => walkForwardValidationOwnerFixture(sr),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        const focusCloses = owner.universes.registry[0].closes;
        const directWf = sr.walkForwardEmbargo(sr.seriesFromCloses(focusCloses), owner.startLevers, base.folds, owner.trainRatio, base.embargo);
        assert.equal(summary.validation.gross.sharpe, Math.round(directWf.oos.sharpe * 1e6) / 1e6, 'focus gross OOS Sharpe is single-sourced from RLSTRATEGY.walkForwardEmbargo');
        assert.equal(summary.robustness.heldFraction, Math.round((2 / 3) * 1e6) / 1e6, 'registry heldFraction is the genuine 2/3');
      },
      cases: () => [
        ['rule', 'momentum'],
        ['universe', 'current-watchlist'],
        ['folds', 8],
        ['embargo', 20],
        ['cost', 60],
        ['trial-count', 300],
        ['robustness-threshold', 0.9]
      ]
    },
    'palm-springs-rental-market-lab': {
      ownerState: () => palmOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        const opDirect = palmOwnerRun(rental, owner, base, 'requiredFixedRiskCostFieldIds', 0);
        assert.equal(opDirect.ok, true, 'the direct Palm Springs owner run is valid');
        assert.equal(summary.cashFlow.grossRevenueUsd, Math.round(opDirect.result.grossRevenueUsd * 100) / 100, 'Palm Springs gross revenue is single-sourced from RLRENTAL.computeRentalResult');
        assert.equal(summary.cashFlow.annualOperatingPreTaxCashFlowUsd, Math.round(opDirect.result.preTaxCashFlowUsd * 100) / 100, 'Palm Springs operating cash flow is single-sourced from the owner engine');
        assert.equal(summary.cashFlow.fullPreTaxCashFlowUsd, null, 'the full bottom line stays null while property economics are undisclosed (no zero-fill)');
      },
      cases: () => [
        ['segment', 'whole-market'],
        ['adr', 1500],
        ['occupancy', 72],
        ['financing-rate', 9],
        ['operating-cost', 45],
        ['insurance', 35000],
        ['regulation-stress', 0.5],
        ['horizon', 8]
      ]
    },
    'ocean-shores-rental-market-lab': {
      ownerState: () => oceanOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        const opDirect = oceanOwnerRun(rental, owner, base, 'requiredFixedRiskCostFieldIds', 0);
        assert.equal(opDirect.ok, true, 'the direct Ocean Shores owner run is valid');
        assert.equal(summary.cashFlow.grossRevenueUsd, Math.round(opDirect.result.grossRevenueUsd * 100) / 100, 'Ocean Shores gross revenue is single-sourced from RLRENTAL.computeRentalResult');
        assert.equal(summary.cashFlow.fixedRiskCostUsd, Math.round(opDirect.result.fixedRiskCostUsd * 100) / 100, 'the disclosed insurance cost is single-sourced from the frozen owner baseFixedInsuranceUsd');
        assert.equal(summary.cashFlow.fullPreTaxCashFlowUsd, null, 'the full bottom line stays null while property economics are undisclosed (no zero-fill)');
      },
      cases: () => [
        ['segment', 'whole-market'],
        ['adr', 1400],
        ['occupancy', 70],
        ['financing-rate', 9],
        ['operating-cost', 48],
        ['storm-insurance-stress', 12],
        ['regulation-stress', 0.5],
        ['horizon', 8]
      ]
    },
    'waterfront-polo-lab': {
      ownerState: () => locationOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner }) => {
        const directA = locationOwnerNearest(pr, owner, 'm-a');
        const rowA = summary.shortlist.markets.find((m) => m.id === 'm-a');
        assert.ok(rowA, 'm-a is present in the shortlist');
        assert.equal(rowA.nearestClubMi, directA.nearestClubMi, 'nearest-club distance is single-sourced from RLPROPERTY.nearestClub (owner-parity)');
        assert.equal(rowA.driveMin, directA.driveMin, 'drive time is single-sourced from RLPROPERTY.driveMinutesApprox (owner-parity)');
        assert.equal(rowA.nearestClubConfidence, 'reported', 'the shortlisted market carries its owner-universe club confidence');
      },
      cases: () => [
        ['budget', 2500000],
        ['minimum-size', 1500],
        ['water-type', 'river'],
        ['travel-limit', 70],
        ['insurance-risk-ceiling', 5],
        ['flood-verification', false],
        ['club-verification', false]
      ]
    },
    'market-brief': {
      ownerState: () => marketActionOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        const win = owner.windows['07:30'];
        const floor = 0.65 * 100;
        const gated = ma.nextSessionActions(win.recommendations, 5, floor);
        const persistent = gated.filter((a) => ma.isPersistentSignal(win.seriesByKey[a.key] || win.seriesByKey[a.subject] || [], 2));
        assert.equal(summary.actionState.gatedActionCount, gated.length, 'gated action count is single-sourced from RLMARKETACTION.nextSessionActions');
        assert.equal(summary.actionState.persistentActionCount, persistent.length, 'persistent action count is single-sourced from RLMARKETACTION.isPersistentSignal');
        const cats = ma.nearTermEvents(win.events, win.asOf, base['catalyst-horizon']);
        assert.equal(summary.catalysts.count, cats.length, 'catalyst count is single-sourced from RLMARKETACTION.nearTermEvents');
        assert.equal(summary.horizon.cappedActionConfidence, ma.capConfidence(82, 'swing', 55), 'capped action confidence is single-sourced from RLMARKETACTION.capConfidence');
      },
      cases: () => [
        ['window', '11:00'],
        ['horizon', 1],
        ['evidence-threshold', 0.95],
        ['catalyst-horizon', 30],
        ['risk-posture', 'defensive']
      ]
    },
    'horizon-ladder-lab': {
      ownerState: () => horizonLadderOwnerFixture(),
      base: (definition) => defaultValues(definition),
      ownerFact: ({ summary, owner, base }) => {
        assert.deepEqual(summary, sr.computeHorizonLadderSummary(owner, base), 'horizon-ladder summary is single-sourced from RLSTRATEGY.computeHorizonLadderSummary');
        assert.equal(summary.gate.published, false, 'the live zero-resolution cell withholds its measured rate');
        assert.equal(summary.probability.measuredRate, null, 'withheld means no measured rate is fabricated');
      },
      cases: () => [
        ['direction', 'short'],
        ['horizon', 'h1y'],
        ['resolution-rule', 'touch'],
        ['target-sigma', 1.25],
        ['invalidation-sigma', 1]
      ]
    }
  };
}

test('TP-07-02 strategy/property/method + Center adapters: registry-derived loop runs all seven Scope-07 (six ordinary + in-Brief Center) at owner-parity with real parameter effects', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const pr = loadPropertyResearch();
  const ma = loadMarketAction();
  const rental = loadRentalEngine();

  const definitions = strategyPropertyActionDefinitions();
  const deliveredAdapterIds = [...sr.supportedAdapterIds, ...pr.supportedAdapterIds, ...ma.supportedAdapterIds].slice().sort();
  assert.ok(definitions.length > 0, 'the strategy/property/action definition set must not be empty');
  assert.deepEqual(definitions.map((definition) => definition.adapterId).sort(), deliveredAdapterIds, 'the registry definitions exactly match the three production modules supportedAdapterIds');

  const runtime = makeRuntime(api, definitions);
  const results = registerScope7(runtime, api, sr, pr, ma, rental, definitions);

  // Registry-derived membership: the registered set is EXACTLY the combined delivered supportedAdapterIds.
  const registeredAdapterIds = Object.keys(results).sort();
  assert.deepEqual(registeredAdapterIds, deliveredAdapterIds, 'registered adapters == strategy-research + property-research + market-action supportedAdapterIds');
  for (const adapterId of registeredAdapterIds) {
    assert.equal(results[adapterId].ok, true, `${adapterId} registered: ${JSON.stringify(results[adapterId].error || {})}`);
  }

  const descriptors = makeScope7Descriptors(sr, pr, ma, rental);
  for (const definition of definitions) {
    const descriptor = descriptors[definition.toolId];
    assert.ok(descriptor, `descriptor present for Scope-07 member ${definition.toolId}`);
    await exerciseScope6Adapter(runtime, api, definition, descriptor);
  }
});

test('TP-07-02 SCN-012-036 completeness: all 22 ordinary adapters plus the in-Brief Center triage register in ONE runtime and every ordinary registry tool resolves exactly one owner adapter with no generic fallback', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const opts = loadOptions();
  const rlvol = loadRlvol();
  const mr = loadMacroRotation();
  const fm = loadFundamentalModels();
  const sr = loadStrategyResearch();
  const pr = loadPropertyResearch();
  const ma = loadMarketAction();
  const rental = loadRentalEngine();
  const pfr = loadPortfolioResearch();
  const ra = loadResearchAgenda();

  // Register every ordinary owner adapter (Scope 05/06/07 plus later modules) and the one in-Brief Center model into ONE runtime over
  // the FULL model registry. Each factory self-filters by its own tool IDs, so the union is the complete inventory.
  const definitions = readJson('simple-models.json').definitions.map(clone);
  const runtime = makeRuntime(api, definitions);
  const results = Object.assign(
    {},
    ms.registerMarketStructureAdapters(runtime, api, definitions, { rlvol }),
    opts.registerOptionsAdapters(runtime, api, definitions),
    mr.registerMacroRotationAdapters(runtime, api, definitions),
    fm.registerFundamentalModelsAdapters(runtime, api, definitions),
    sr.registerStrategyResearchAdapters(runtime, api, definitions),
    pr.registerPropertyResearchAdapters(runtime, api, definitions, { rental }),
    ma.registerMarketActionAdapters(runtime, api, definitions),
    pfr.registerPortfolioResearchAdapters(runtime, api, definitions),
    ra.registerResearchAgendaAdapters(runtime, api, definitions, { agenda: loadAgendaEngine() })
  );
  for (const [adapterId, result] of Object.entries(results)) {
    assert.equal(result.ok, true, `${adapterId} registered: ${JSON.stringify(result.error || {})}`);
  }

  const registry = readJson('tools.json');
  const ordinaryToolIds = registry.tools.filter((tool) => tool.experience.kind === 'ordinary').map((tool) => tool.id);
  const centerToolIds = registry.tools.filter((tool) => tool.experience.kind === 'market-action-center').map((tool) => tool.id);
  assert.equal(centerToolIds.length, 1, 'the registry declares exactly one in-Brief Center model');
  assert.deepEqual(
    definitions.filter((definition) => ordinaryToolIds.includes(definition.toolId)).map((definition) => definition.toolId).sort(),
    ordinaryToolIds.slice().sort(),
    'every ordinary registry tool has exactly one simple-model definition'
  );

  // Every ordinary registry tool resolves EXACTLY one registered owner adapter (adapterStatus.registered = true).
  for (const toolId of ordinaryToolIds) {
    const definition = definitions.find((candidate) => candidate.toolId === toolId);
    const status = requireValue(runtime.adapterStatus(definition.definitionId));
    assert.equal(status.registered, true, `${toolId} resolves a registered owner adapter (no generic fallback)`);
  }
  const centerDefinition = definitions.find((candidate) => candidate.toolId === centerToolIds[0]);
  assert.equal(requireValue(runtime.adapterStatus(centerDefinition.definitionId)).registered, true, 'the in-Brief Center triage model resolves a registered owner adapter');

  // Zero generic fallback: the runtime registered exactly one owner adapter per ordinary tool plus Center,
  // owns no tool-id branch, and owns no forbidden authority.
  const diagnostic = requireValue(runtime.diagnostic());
  assert.equal(diagnostic.registeredAdapterCount, ordinaryToolIds.length + centerToolIds.length, 'exactly one adapter per ordinary tool plus Center is registered (no extras, no generic fallback)');
  assert.equal(diagnostic.toolIdBranchCount, 0, 'the shared runtime owns no tool-id branch');
  assert.equal(Object.values(diagnostic.authority).every((owned) => owned === false), true, 'the shared runtime owns no forbidden authority');
});

test('TP-07-02 Scope 05 and Scope 06 adapter sets and a real Scope-05 owner-run fingerprint are unchanged when Scope 07 shares the runtime', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const rlvol = loadRlvol();
  const mr = loadMacroRotation();
  const fm = loadFundamentalModels();
  const sr = loadStrategyResearch();
  const pr = loadPropertyResearch();
  const ma = loadMarketAction();
  const rental = loadRentalEngine();

  // Each production module's supportedAdapterIds must exactly match its current registry definitions.
  const allDefinitions = readJson('simple-models.json').definitions;
  const expectedAdaptersFor = (adapterModule) => allDefinitions
    .filter((definition) => definition.adapterModule === adapterModule)
    .map((definition) => definition.adapterId)
    .sort();
  assert.deepEqual(sr.supportedAdapterIds.slice().sort(), expectedAdaptersFor('rlexperience-adapters/strategy-research.js'), 'strategy-research supportedAdapterIds match the registry');
  assert.deepEqual(pr.supportedAdapterIds.slice().sort(), expectedAdaptersFor('rlexperience-adapters/property-research.js'), 'property-research supportedAdapterIds match the registry');
  assert.deepEqual(ma.supportedAdapterIds.slice().sort(), expectedAdaptersFor('rlexperience-adapters/market-action.js'), 'market-action supportedAdapterIds match the registry');

  const breadthDefinition = clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'market-heatmap-lab'));
  const sectorDefinition = clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'sector-research-lab'));
  const strategyDefinition = clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === 'strategy-self-improvement-lab'));

  async function breadthFingerprint(runtime) {
    const prepared = requireValue(await runtime.prepare({
      definitionId: breadthDefinition.definitionId,
      ownerContext: { ownerState: breadthOwnerState(ms) },
      parameterValues: defaultValues(breadthDefinition),
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-27T20:04:00.000Z'
    }));
    return api.fingerprint(prepared.current.output.values.summary);
  }

  // Scope 05 breadth alone.
  const runtimeAlone = makeRuntime(api, [breadthDefinition]);
  ms.registerMarketStructureAdapters(runtimeAlone, api, [breadthDefinition], { rlvol });
  const fingerprintAlone = await breadthFingerprint(runtimeAlone);

  // Scope 05 breadth + Scope 06 sector-rotation + Scope 07 strategy-evolution in ONE shared runtime.
  const runtimeShared = makeRuntime(api, [breadthDefinition, sectorDefinition, strategyDefinition]);
  ms.registerMarketStructureAdapters(runtimeShared, api, [breadthDefinition], { rlvol });
  registerScope6(runtimeShared, api, mr, fm, [sectorDefinition]);
  const scope7Results = registerScope7(runtimeShared, api, sr, pr, ma, rental, [strategyDefinition]);
  assert.equal(scope7Results['simple-adapter/strategy-evolution/v1'].ok, true, 'strategy-evolution registers alongside Scope 05/06 in one runtime');
  const fingerprintShared = await breadthFingerprint(runtimeShared);

  // The Scope 05 breadth owner run is byte-identical whether or not Scope 06 + Scope 07 share the runtime.
  assert.equal(fingerprintShared, fingerprintAlone, 'Scope 05 breadth owner-run fingerprint is unchanged when Scope 06 + Scope 07 share the runtime');
});
