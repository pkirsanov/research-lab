/*
 * TP-05-04 … TP-05-11 — persistent per-tool system-Chrome Simple regressions.
 *
 * SCN-012-001 (each named market-structure/options tool): open the REAL tool page, open Simple,
 * change TWO meaningful controls, and prove the OWNER-produced Simple output path CHANGES with a
 * user-visible DOM/text difference — and that the Simple decision read is distinct from the Power
 * dashboard. For the technical tool whose owner five-gate model is proven-incomplete, the Simple
 * output stays HONESTLY unavailable (names the missing owner capability, invents no signal) and is
 * a proved flat region under every control.
 *
 * REAL-STACK, ZERO INTERCEPTION. Each test navigates to the real tool page (the shared four-view
 * shell mounts #rlviews via rlapp.js+rlnav.js), injects the REAL production adapter module
 * (rlexperience-adapters/market-structure.js or options.js — the same UMD file the owning pages
 * load, exposing RLMARKETSTRUCTURE / RLOPTIONS), registers the REAL adapter into a REAL production
 * runtime (globalThis.RLEXPERIENCE), prepares on a frozen owner snapshot, recomputes with two
 * changed controls, and renders the REAL projection into the REAL [data-rlexperience-panel="simple"]
 * host through the production renderSimpleProjection. There is NO page.route / context.route /
 * intercept / msw / nock anywhere — the owner data is a deterministic frozen owner fixture (the
 * same owner shape the owning page produces and the TP-05-02 integration loop drives), never an
 * intercepted network response. Owner-parity is proven exhaustively by TP-05-01/TP-05-02; this
 * surface proves the real page renders the real adapter's distinct, parameter-sensitive Simple read.
 *
 * Owner fixtures + owner-relative control values are built NODE-SIDE from the REAL production
 * modules (no formula is copied); only plain owner DATA + two changed control values cross into the
 * browser, where the REAL production adapter performs the compute and the REAL renderer paints it.
 */
import { createRequire } from 'node:module';
import { expect, test } from './playwright-runtime.mjs';
import { readJson, startStaticServer } from './tool-experience.support.mjs';

const require = createRequire(import.meta.url);
const ms = require('../rlexperience-adapters/market-structure.js');
const opts = require('../rlexperience-adapters/options.js');
const rlvol = require('../rlvol.js');

const config = readJson('tool-experience.config.json');
const definitions = readJson('simple-models.json').definitions;

function defFor(toolId) {
  const definition = definitions.find((candidate) => candidate.toolId === toolId);
  if (!definition) throw new Error(`missing simple-models.json definition for ${toolId}`);
  return definition;
}
function defaults(definition) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
}
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/* ═══════════════════════ owner fixtures (owner shape produced by the owning pages) ═══════════════════════ */

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
function breadthOwnerState() {
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
  const policy = plain(readJson('tests/fixtures/volatility-sizing/commonjs-determinism-input.json').policy);
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

/* Owner-relative swing control values (computed against the REAL owner primitives so each change is
   a genuine state flip, never a tautological echo of the raw value). */
function swingChanges() {
  const owner = swingOwnerState();
  const base = defaults(defFor('swing-structure-lab'));
  const baseSummary = ms.computeSwingTransitionSummary(owner, base);
  const evid = baseSummary.pattern.evidenceScore;
  const patternChange = evid >= base['pattern-threshold']
    ? Math.min(1, Math.round((evid + 0.15) / 0.05) * 0.05)
    : Math.max(0, Math.round((evid - 0.15) / 0.05) * 0.05);
  return [['pattern-threshold', patternChange], ['regime-window', 20]];
}

/* ═══════════════════════ per-tool descriptor table ═══════════════════════ */
const TOOLS = {
  'market-heatmap-lab': {
    title: 'Regression: market heatmap Simple breadth controls recompute owner leadership sensitivity',
    html: 'market-heatmap-lab.html',
    moduleGlobal: 'RLMARKETSTRUCTURE',
    moduleFile: 'rlexperience-adapters/market-structure.js',
    owner: () => breadthOwnerState(),
    changes: () => [['size-metric', 'equal'], ['breadth-threshold', 30]],
    adapterId: 'simple-adapter/market-breadth/v1',
    expectFlat: false
  },
  'intraday-tape-lab': {
    title: 'Regression: intraday tape Simple auction controls recompute from truthful snapshot evidence',
    html: 'intraday-tape-lab.html',
    moduleGlobal: 'RLMARKETSTRUCTURE',
    moduleFile: 'rlexperience-adapters/market-structure.js',
    owner: () => sessionOwnerState(),
    changes: () => [['opening-range', 5], ['gamma-context', 'exclude']],
    adapterId: 'simple-adapter/session-auction/v1',
    expectFlat: false
  },
  'swing-structure-lab': {
    title: 'Regression: swing structure Simple thresholds recompute owner transition state',
    html: 'swing-structure-lab.html',
    moduleGlobal: 'RLMARKETSTRUCTURE',
    moduleFile: 'rlexperience-adapters/market-structure.js',
    owner: () => swingOwnerState(),
    changes: () => swingChanges(),
    adapterId: 'simple-adapter/swing-transition/v1',
    expectFlat: false
  },
  'volatility-sizing-lab': {
    title: 'Regression: volatility sizing Simple controls recompute owner forecast regime and throttle',
    html: 'volatility-sizing-lab.html',
    moduleGlobal: 'RLMARKETSTRUCTURE',
    moduleFile: 'rlexperience-adapters/market-structure.js',
    owner: () => volOwnerState(),
    changes: () => [['estimator', 'garch'], ['target-volatility', 25]],
    adapterId: 'simple-adapter/conditional-volatility/v1',
    expectFlat: false
  },
  'technical-analysis-decision-lab': {
    title: 'Regression: technical decision Simple five-gate controls recompute or stay honestly unavailable',
    html: 'technical-analysis-decision-lab.html',
    moduleGlobal: 'RLMARKETSTRUCTURE',
    moduleFile: 'rlexperience-adapters/market-structure.js',
    owner: () => technicalOwnerState(),
    base: (definition) => ({ ...defaults(definition), entry: 100 }),
    changes: () => [['context-threshold', 0.7], ['location-threshold', 0.7]],
    adapterId: 'simple-adapter/technical-five-gate/v1',
    expectFlat: true
  },
  'options-flow-feed-lab': {
    title: 'Regression: options flow Simple anomaly controls recompute without trade-side inference or new chain owner',
    html: 'options-flow-feed-lab.html',
    moduleGlobal: 'RLOPTIONS',
    moduleFile: 'rlexperience-adapters/options.js',
    owner: () => anomalyOwnerState(),
    changes: () => [['volume-open-interest-threshold', 3], ['premium-threshold', 500000]],
    adapterId: 'simple-adapter/options-anomaly/v1',
    expectFlat: false
  },
  'options-structure-lab': {
    title: 'Regression: options structure Simple shocks recompute owner walls flip move and skew from same-origin evidence',
    html: 'options-structure-lab.html',
    moduleGlobal: 'RLOPTIONS',
    moduleFile: 'rlexperience-adapters/options.js',
    owner: () => surfaceOwnerState(),
    changes: () => [['sign-convention', 'customer-short'], ['spot-shock', 5]],
    adapterId: 'simple-adapter/options-surface/v1',
    expectFlat: false
  },
  'gamma-trading-lab': {
    title: 'Regression: gamma trading Simple controls recompute owner playbook from existing options owner',
    html: 'gamma-trading-lab.html',
    moduleGlobal: 'RLOPTIONS',
    moduleFile: 'rlexperience-adapters/options.js',
    owner: () => gammaOwnerState(),
    changes: () => [['dealer-sign', 'customer-short'], ['aggressiveness', 'high']],
    adapterId: 'simple-adapter/dealer-gamma-playbook/v1',
    expectFlat: false
  }
};

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* Drive one tool through the real stack and return the two rendered Simple projections + owner-run
   facts. The REAL production adapter is injected and registered into a REAL production runtime, the
   REAL owner snapshot drives prepare + a two-control recompute, and the REAL renderer paints both
   projections into the REAL Simple panel host. Owner data is a frozen fixture (never intercepted). */
async function driveSimple(page, toolId) {
  const descriptor = TOOLS[toolId];
  const definition = defFor(toolId);
  const owner = plain(descriptor.owner());
  const base = plain(descriptor.base ? descriptor.base(definition) : defaults(definition));
  const changes = descriptor.changes();

  await page.goto(`${site.baseUrl}/${descriptor.html}`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();

  // Open Simple through the real shell — the deployed default renders the "owner adapter required"
  // placeholder (no adapter is wired into the shell UI yet), proving we start from the real page.
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await page.getByRole('tab', { name: 'Simple', exact: true }).click();
  const placeholderState = await page.locator('[data-rlexperience-panel="simple"]').getAttribute('data-rlexperience-simple-state');

  // Inject the REAL production adapter UMD module (the same file the owning pages load).
  await page.addScriptTag({ path: descriptor.moduleFile });

  const result = await page.evaluate(async ({ config, definition, owner, base, changes, moduleGlobal, expectFlat }) => {
    const api = globalThis.RLEXPERIENCE;
    const mod = globalThis[moduleGlobal];
    if (!api || !mod) return { fatal: `missing globals api=${!!api} mod=${!!mod}` };
    const runtime = api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }).value;
    const deps = { rlvol: globalThis.RLVOL };
    const registered = moduleGlobal === 'RLMARKETSTRUCTURE'
      ? mod.registerMarketStructureAdapters(runtime, api, [definition], deps)
      : mod.registerOptionsAdapters(runtime, api, [definition], deps);
    const host = document.querySelector('[data-rlexperience-panel="simple"]');
    const power = document.querySelector('[data-rlexperience-panel="power"]');
    const powerText = power ? power.textContent : '';

    const numericText = () => {
      const node = host.querySelector('[data-simple-numeric-value]');
      return node ? node.textContent : null;
    };
    const capture = () => ({
      state: host.getAttribute('data-rlexperience-simple-state'),
      adapter: host.getAttribute('data-rlexperience-adapter'),
      heading: host.querySelector('h2') ? host.querySelector('h2').textContent : null,
      numeric: numericText(),
      text: host.textContent
    });

    const prepared = await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: owner },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    });
    if (!prepared.ok) return { fatal: 'prepare failed', error: prepared.error, registered: Object.keys(registered || {}) };
    api.renderSimpleProjection(host, runtime.snapshot().value.projection);
    const baseline = capture();

    const changedValues = Object.assign({}, base);
    for (const [key, value] of changes) changedValues[key] = value;
    const run = await runtime.recompute({
      parameterValues: changedValues,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:03:00.000Z'
    });
    if (!run.ok) return { fatal: 'recompute failed', error: run.error };
    api.renderSimpleProjection(host, runtime.snapshot().value.projection);
    const changed = capture();

    return {
      registered: Object.keys(registered || {}),
      preparedState: prepared.value.state,
      changedParameters: run.value.changedParameters,
      baseline,
      changed,
      powerText,
      expectFlat
    };
  }, { config, definition, owner, base, changes, moduleGlobal: descriptor.moduleGlobal, expectFlat: !!descriptor.expectFlat });

  return { descriptor, definition, changes, placeholderState, result };
}

async function assertVisibleSensitivity(page, toolId) {
  const { descriptor, changes, placeholderState, result } = await driveSimple(page, toolId);
  expect(result.fatal, JSON.stringify(result)).toBeUndefined();

  // Two meaningful controls were changed and the production runtime detected exactly those changes.
  const changedIds = changes.map(([id]) => id);
  expect(changedIds.length).toBeGreaterThanOrEqual(2);
  expect(result.changedParameters.slice().sort()).toEqual(changedIds.slice().sort());

  // The rendered projection is the REAL adapter's output on the real page (not a Power dashboard).
  expect(result.registered).toContain(descriptor.adapterId);
  expect(result.baseline.adapter).toBe(descriptor.adapterId);
  expect(result.changed.adapter).toBe(descriptor.adapterId);
  // We started from the real deployed shell placeholder before driving the real adapter.
  expect(placeholderState).toBe('unavailable');

  if (descriptor.expectFlat) {
    // Proven-INCOMPLETE owner model (technical-five-gate): the Simple read stays HONESTLY
    // unavailable — it names the missing owner capability, publishes numeric null, and invents no
    // signal — and the DECISION is a proved flat region under the two control changes.
    //
    // The authoritative contract is SIGNAL-flat, NOT strict byte-flat (spec/design citations):
    //   • design.md L572 — "return explicit unavailable rather than use the current foundation
    //     receipt AS A SIGNAL": the prohibition is on reusing the receipt as a SIGNAL, not on
    //     showing honest run provenance.
    //   • design.md "Performance And Artifact Budgets" — "Standard Simple recompute … Preserve
    //     last valid run while updating": the render legitimately preserves + updates the last
    //     valid run identity.
    //   • design.md E012-SIMPLE-INPUT — "Last valid run preserved; no new identity" applies ONLY to
    //     MISSING / stale-disallowed / non-finite / OUT-OF-DOMAIN input (spec.md: "Model parameter
    //     outside domain … unchanged last valid run"). Here BOTH control sets are VALID in-domain,
    //     so the byte-locked Scope-04 core (rlexperience.js compute-identity) legitimately mints a
    //     NEW input-identity — honest provenance, never a signal.
    //   • design.md E012-SIMPLE-NO-EFFECT rejects an UNPROVEN flat region; this flat region is
    //     PROVEN (the adapter emits a flatRegionProof per control), so it is legitimate.
    //   • scope.md Core Delivery Item #1 — "every enabled parameter affects declared production
    //     output OR proves a modeled flat region" (the flat region is the SIGNAL, not the provenance).
    // The ONLY substring that varies between baseline and changed is the honest
    // "Last valid model run preserved: sha256:<64hex>" run-identity token, produced by the
    // byte-locked core (rlexperience.js:1286). Asserting the whole panel textContent is byte-
    // identical would OVER-SPECIFY that honest provenance as if it were signal, so invariance is
    // proven over the DECISION with the run-identity token normalized out, plus a separate proof
    // that the token — and ONLY the token — moved because the valid input changed.
    expect(result.preparedState).toBe('unavailable');
    expect(result.baseline.state).toBe('unavailable');
    expect(result.changed.state).toBe('unavailable');
    expect(result.baseline.heading).toBe('Simple model unavailable');
    expect(result.changed.heading).toBe('Simple model unavailable');
    expect(result.baseline.text).toMatch(/five-gate/i);
    expect(result.changed.text).toMatch(/five-gate/i);
    expect(result.baseline.text).toMatch(/unavailable/i);
    expect(result.changed.text).toMatch(/unavailable/i);
    expect(result.baseline.numeric).toBeNull();
    expect(result.changed.numeric).toBeNull();
    // No INVENTED signal (a neutral / average / prior result presented as an owner read) on EITHER
    // render. Honestly NAMING the absent owner capability ("setup-state and expectancy … not
    // implemented") is the correct behavior and is not a fabricated signal.
    expect(result.baseline.text).not.toMatch(/neutral|average|prior result/i);
    expect(result.changed.text).not.toMatch(/neutral|average|prior result/i);
    // The honest-unavailable render carries exactly ONE run-identity provenance token on each side.
    const runIdentityRe = /sha256:[0-9a-f]{64}/g;
    const baselineIds = result.baseline.text.match(runIdentityRe) || [];
    const changedIds = result.changed.text.match(runIdentityRe) || [];
    expect(baselineIds).toHaveLength(1);
    expect(changedIds).toHaveLength(1);
    // SIGNAL-INVARIANCE (proved flat region): with the run-identity provenance token normalized
    // out, the honest-unavailable DECISION is byte-identical — no signal, number, neutral verdict,
    // or fabricated result leaks in when the two controls change.
    const stripRunIdentity = (text) => text.replace(runIdentityRe, 'sha256:<run-identity>');
    expect(stripRunIdentity(result.changed.text)).toBe(stripRunIdentity(result.baseline.text));
    // HONEST PROVENANCE: the ONLY thing that moved is the input-derived run identity, because the
    // two control sets are different VALID in-domain inputs. This proves the variance is provenance,
    // never a signal.
    expect(changedIds[0]).not.toBe(baselineIds[0]);
    return;
  }

  // Ready owner run: the Simple decision read renders a value node and a decision-first heading.
  expect(result.preparedState).toBe('ready');
  expect(result.baseline.state).toBe('ready');
  expect(result.changed.state).toBe('ready');
  expect(result.baseline.heading).toBe('Simple model result');
  expect(result.baseline.numeric).not.toBeNull();
  // VISIBLE parameter sensitivity: the owner-produced Simple output text CHANGES when the two
  // controls change — a user-visible DOM/text difference, not existence-only.
  expect(result.changed.text).not.toBe(result.baseline.text);
  // Simple is distinct from the Power dashboard content on the same page.
  expect(result.baseline.text).not.toBe(result.powerText);
  expect(result.baseline.text).toContain('Simple model result');
}

test(TOOLS['market-heatmap-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'market-heatmap-lab'); });
test(TOOLS['intraday-tape-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'intraday-tape-lab'); });
test(TOOLS['swing-structure-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'swing-structure-lab'); });
test(TOOLS['volatility-sizing-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'volatility-sizing-lab'); });
test(TOOLS['technical-analysis-decision-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'technical-analysis-decision-lab'); });
test(TOOLS['options-flow-feed-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'options-flow-feed-lab'); });
test(TOOLS['options-structure-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'options-structure-lab'); });
test(TOOLS['gamma-trading-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'gamma-trading-lab'); });
