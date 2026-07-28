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

/* Slice a delimiter-balanced span out of a page source, starting at `from` and balancing from the
   `open` delimiter at `openIndex` to its matching `close`. */
function sliceBalanced(source, from, openIndex, open, close) {
  assert.ok(openIndex >= 0, 'no balanced body found in the page source');
  let depth = 0;
  let index = openIndex;
  for (; index < source.length; index++) {
    if (source[index] === open) depth += 1;
    else if (source[index] === close) { depth -= 1; if (depth === 0) { index += 1; break; } }
  }
  assert.equal(depth, 0, 'unbalanced body in the page source');
  return source.slice(from, index);
}

/* Extract ONE top-level binding — a `function name(...) {...}` declaration or a
   `var name = {…}/[…]/'…';` object/array/string literal — VERBATIM from a deployed page's source.

   Used ONLY to RUN a page's OWN code here, never to copy or restate it: when a page's owner model
   has no module export and the page publishes no harvested owner read, running the deployed source
   is the only way to reach the owner's real values without reimplementing an owner formula (which
   this suite forbids). Same technique scripts/selftest.mjs already uses to test this repo's pages
   (e.g. ai-capex's alignReturns/ledoitWolf) against their deployed source. */
function extractPageBinding(source, name) {
  const fnMatch = new RegExp(`function\\s+${name}\\s*\\(`).exec(source);
  if (fnMatch) return sliceBalanced(source, fnMatch.index, source.indexOf('{', fnMatch.index), '{', '}');
  const varMatch = new RegExp(`(?:^|\\n)\\s*var\\s+${name}\\s*=\\s*`).exec(source);
  assert.ok(varMatch, `binding not found in the deployed page source: ${name}`);
  const valueStart = varMatch.index + varMatch[0].length;
  const open = source[valueStart];
  if (open === '"' || open === '\'') {
    const close = source.indexOf(open, valueStart + 1);
    assert.ok(close > valueStart, `${name}: unterminated string-literal binding`);
    assert.equal(source.slice(valueStart + 1, close).includes('\\'), false, `${name}: only plain string literals are extracted`);
    return `var ${name} = ${source.slice(valueStart, close + 1)};`;
  }
  assert.ok(open === '{' || open === '[', `${name}: only object/array/string literal bindings are extracted`);
  return `var ${name} = ${sliceBalanced(source, valueStart, valueStart, open, open === '{' ? '}' : ']')};`;
}

/* Take ONE whole source LINE verbatim out of a deployed page, located by a literal marker. Used for
   the page statements that a single-binding extractor cannot express — a declaration and its
   initialization fused into one line — so they are still RUN as the page's own code rather than
   restated here. The marker must be unique in the page. */
function extractPageLine(source, marker) {
  const index = source.indexOf(marker);
  assert.ok(index >= 0, `statement not found in the deployed page source: ${marker}`);
  assert.equal(source.indexOf(marker, index + 1), -1, `ambiguous page statement marker: ${marker}`);
  const start = source.lastIndexOf('\n', index) + 1;
  const end = source.indexOf('\n', index);
  return source.slice(start, end < 0 ? source.length : end);
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

/* ─────────────── the REAL same-origin option snapshot (data/options/<SYM>.json) ───────────────
   All three option tools read exactly this store: options-flow-feed-lab.html
   (pagesUrl → parsePagesChain), options-structure-lab.html (fetchChainPages → parsePagesChain) and
   gamma-trading-lab.html (fetchGammaPages → parsePagesFront). Real observed contracts — never
   fabricated values. Snapshot column schema: {sym, spot, asof, o:[{e,t,k,iv,oi,v,b,a,l}]}. */
function realOptionSnapshot(symbol) {
  const url = new URL(`data/options/${symbol}.json`, ROOT);
  assert.equal(existsSync(url), true, `real option snapshot required: data/options/${symbol}.json`);
  const snapshot = JSON.parse(readFileSync(url, 'utf8'));
  assert.ok(Array.isArray(snapshot.o) && snapshot.o.length > 0, `data/options/${symbol}.json must carry option contracts`);
  assert.ok(Number.isFinite(snapshot.spot) && snapshot.spot > 0, `data/options/${symbol}.json must carry a real spot`);
  return snapshot;
}

/* The snapshot's OWN observation time, used as the frozen owner clock. Reading nowMs off the
   snapshot (never Date.now()) keeps every DTE — and therefore every fixture below — deterministic
   and anchored on the same observation the owning page reads. */
function snapshotClockMs(snapshot) {
  const observed = String(snapshot.asof || snapshot.fetched || '');
  const stamped = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(observed) ? observed : `${observed}Z`;
  const parsed = Date.parse(stamped);
  assert.ok(Number.isFinite(parsed), `the option snapshot must carry a parseable observation time (saw ${JSON.stringify(observed)})`);
  return parsed;
}

/* Snapshot contracts grouped by their own expiry epoch, ascending. Pure grouping — no owner math. */
function optionRowsByExpiry(snapshot) {
  const byExpiry = new Map();
  for (const row of snapshot.o) {
    if (!Number.isFinite(row.e)) continue;
    if (!byExpiry.has(row.e)) byExpiry.set(row.e, []);
    byExpiry.get(row.e).push(row);
  }
  const expiries = [...byExpiry.keys()].sort((a, b) => a - b);
  assert.ok(expiries.length > 0, 'the option snapshot must carry at least one expiry');
  return { byExpiry, expiries };
}

/* Re-key ONE expiry's snapshot columns into the Yahoo v7 envelope the adapter module's OWN exported
   parseYahooChain reads. This is a COLUMN RENAME of the snapshot's own fields (k→strike, v→volume,
   oi→openInterest, iv→impliedVolatility, b→bid, a→ask, l→lastPrice) and nothing else: the row
   projection AND the bid/ask→mid rule stay inside RLOPTIONS.parseYahooChain, so no owner formula is
   reimplemented in this suite. */
function yahooEnvelopeForExpiry(spot, expiryEpoch, rows) {
  const calls = [];
  const puts = [];
  for (const row of rows) {
    const contract = {
      strike: row.k, volume: row.v, openInterest: row.oi,
      impliedVolatility: row.iv, bid: row.b, ask: row.a, lastPrice: row.l
    };
    (row.t === 'C' ? calls : puts).push(contract);
  }
  return { optionChain: { result: [{ quote: { regularMarketPrice: spot }, options: [{ expirationDate: expiryEpoch, calls, puts }] }] } };
}

/* The registry definition behind an adapter id — used so a fixture that needs another model's
   owner primitives runs them on that model's OWN registry-declared defaults, never on invented
   parameter literals. */
function definitionForAdapter(adapterId) {
  const definition = readJson('simple-models.json').definitions.find((candidate) => candidate.adapterId === adapterId);
  assert.ok(definition, `the registry must declare a definition for ${adapterId}`);
  return definition;
}

/* options-anomaly owner state — the SAME shape options-flow-feed-lab.html's provider publishes
   (contractVersion + per-ticker {ticker, spot, expiry, rows}), carrying the REAL same-origin option
   contracts the page itself reads. Every contract row is decoded by the MODULE's OWN exported
   parseYahooChain, so even the bid/ask→mid rule is single-sourced from the adapter module rather
   than reimplemented here. The page's provider publishes every cached ticker; this fixture
   publishes every ticker the same-origin store actually holds for the sampled set. */
const ANOMALY_SYMBOLS = ['SPY', 'QQQ'];
function anomalyOwnerState() {
  const optionsModule = loadModule('rlexperience-adapters/options.js');
  const symbols = ANOMALY_SYMBOLS.filter((symbol) => existsSync(new URL(`data/options/${symbol}.json`, ROOT)));
  assert.ok(symbols.length >= 1, 'at least one real option snapshot is required for an anomaly owner state');
  let clockMs = null;
  const chains = symbols.map((symbol) => {
    const snapshot = realOptionSnapshot(symbol);
    const nowMs = snapshotClockMs(snapshot);
    if (clockMs === null || nowMs > clockMs) clockMs = nowMs;
    const { byExpiry, expiries } = optionRowsByExpiry(snapshot);
    let rows = [];
    for (const expiry of expiries) {
      const parsed = optionsModule.parseYahooChain(yahooEnvelopeForExpiry(snapshot.spot, expiry, byExpiry.get(expiry)));
      assert.ok(parsed && parsed.rows.length > 0, `${symbol}: the module parser must decode expiry ${expiry}`);
      rows = rows.concat(parsed.rows);
    }
    return { ticker: snapshot.sym || symbol, spot: snapshot.spot, expiry: expiries[0], rows };
  });
  return {
    contractVersion: 'options-owner-state/v1',
    toolId: 'options-flow-feed-lab',
    asOf: new Date(clockMs).toISOString(),
    source: 'same-origin options snapshot (data/options)',
    nowMs: clockMs,
    chains
  };
}

/* options-surface owner state — the SAME shape options-structure-lab.html's provider publishes
   (contractVersion + spot/div/zoom/minOI + per-expiry {dte, calls, puts}). Contracts are decoded
   straight off the REAL same-origin snapshot columns (a rename, not a formula) and the per-chain
   DTE comes from the MODULE's OWN exported dteFrom — the exact primitive the page's provider calls.
   The expiry count and the zoom / minOI / div envelope mirror the page's own state defaults
   (options-structure-lab.html: nExp 3, zoom 18, minOI 0, div 0.0). */
const SURFACE_EXPIRY_COUNT = 3;
const SURFACE_ZOOM_PCT = 18;
const SURFACE_MIN_OI = 0;
const SURFACE_DIV = 0;
function surfaceOwnerState() {
  const optionsModule = loadModule('rlexperience-adapters/options.js');
  const snapshot = realOptionSnapshot('SPY');
  const nowMs = snapshotClockMs(snapshot);
  const { byExpiry, expiries } = optionRowsByExpiry(snapshot);
  const chains = expiries.slice(0, SURFACE_EXPIRY_COUNT).map((expiry) => {
    const calls = [];
    const puts = [];
    for (const row of byExpiry.get(expiry)) {
      const impliedVolatility = Number(row.iv);
      const contract = {
        strike: Number(row.k),
        openInterest: Number(row.oi) || 0,
        volume: Number(row.v) || 0,
        impliedVolatility: Number.isFinite(impliedVolatility) && impliedVolatility > 0 ? impliedVolatility : null,
        bid: Number(row.b),
        ask: Number(row.a),
        lastPrice: Number(row.l) || 0
      };
      (row.t === 'P' ? puts : calls).push(contract);
    }
    return { dte: optionsModule.dteFrom(expiry, nowMs), calls, puts };
  });
  assert.ok(chains.length > 0, 'a surface owner state needs at least one real expiry chain');
  return {
    contractVersion: 'options-surface-owner-state/v1',
    toolId: 'options-structure-lab',
    asOf: new Date(nowMs).toISOString(),
    source: 'same-origin options snapshot (data/options)',
    nowMs,
    spot: snapshot.spot,
    div: SURFACE_DIV,
    zoom: SURFACE_ZOOM_PCT,
    minOI: SURFACE_MIN_OI,
    chains
  };
}

/* dealer-gamma-playbook owner state — the SAME shape gamma-trading-lab.html's provider publishes
   (contractVersion + ticker + {snap, hist}).
   PROVENANCE, STATED PLAINLY: the page's gamma `snap` is produced by its OWN closure-coupled
   computeGamma, which — unlike market-structure.js's reduceOwnerState — has NO module export and
   carries its own inline greeks. Reimplementing it here would COPY an owner formula, which this
   suite forbids. So instead of hand-typing a net-GEX, the gamma-structure INPUT is sourced from the
   MODULE's OWN options-surface owner primitives run on the SAME REAL same-origin chain, at that
   model's OWN registry-declared defaults:
     • netGEX -> summary.surface.netGammaExposure (the module's unsigned net gamma exposure; the
       playbook applies its own dealer sign on top, so an already-signed value must not be used),
     • flip   -> summary.gammaFlip.flipLevel (the module's own gamma-flip zero-crossing, which the
       module documents as mirroring the page's computeGammaFlip semantics and which is
       sign-invariant),
     • walls  -> summary.walls.callWall / putWall (the module's own OI-weighted walls),
     • spot   -> the snapshot's OWN observed spot.
   These are module-COMPUTED owner INPUTS to the playbook, not hand-written numbers, and they are
   deliberately NOT claimed to be byte-identical to the deployed page's computeGamma output. That is
   correct for this model: the playbook adapter's own contract is that it CONSUMES a frozen snapshot
   and "recomputes nothing from a raw chain", so the snapshot is input, and every asserted playbook
   value below still comes only from computeGammaPlaybookSummary.
   HONEST ABSENCE: maxPain and the OVI trio (ovi/oviQty/oviSig) plus the rolling `hist` are
   page-owned reductions with no module producer and no same-origin history store, so they are left
   absent rather than invented. The playbook consequently reports summary.oviState as honestly
   unavailable while the top-level read stays ready — real degradation, not a fabricated signal. */
function gammaOwnerState() {
  const optionsModule = loadModule('rlexperience-adapters/options.js');
  const ownerChain = surfaceOwnerState();
  const surfaceDefinition = definitionForAdapter('simple-adapter/options-surface/v1');
  const surfaceSummary = optionsModule.computeSurfaceSummary(frozenClone(ownerChain), registryDefaults(surfaceDefinition));
  assert.equal(surfaceSummary.surface.state, 'ready', 'the real same-origin chain must yield a ready surface before it can seed a gamma snapshot');
  return {
    contractVersion: 'options-gamma-owner-state/v1',
    toolId: 'gamma-trading-lab',
    ticker: 'SPY',
    asOf: ownerChain.asOf,
    source: ownerChain.source,
    nowMs: ownerChain.nowMs,
    snap: {
      spot: ownerChain.spot,
      netGEX: surfaceSummary.surface.netGammaExposure,
      flip: surfaceSummary.gammaFlip.flipLevel,
      callWall: surfaceSummary.walls.callWall,
      putWall: surfaceSummary.walls.putWall,
      atmIV: surfaceSummary.expectedMove.atmIV,
      maxPain: null
    },
    hist: []
  };
}

/* sector-rotation-transition owner state — the SAME shape sector-research-lab.html's provider
   publishes (contractVersion + benchmarks + per-sector {id, label, rs, x3, breadthPct50, riskScore,
   etf}).
   PRODUCTION-DERIVED, NEVER A HAND-TYPED LIST. The sector rows, their labels/tickers and the
   benchmark all come from the page's OWN universe file (sector-universe.json — the exact file the
   page's boot() fetches and applyUniverse() loads), and every relative-strength series is built from
   the REAL same-origin daily snapshots the page hydrates through RLDATA (data/bars/<SYM>.json).
   The series is the owner INPUT the page's computeEntry() assembles — a calendar-date alignment of
   two observed close series and their ratio — never an owner RESULT: the rolling-z RRG kernel, the
   transition classifier, the rank and the leaders all stay inside the module, and every value
   asserted below still comes from computeSectorRotationSummary.
   HONEST ABSENCE, stated plainly: x3 (trailing excess return) and riskScore (the risk-flag count)
   are page-owned reductions with NO module producer, so reproducing them here would copy an owner
   formula — they are left absent rather than invented. breadthPct50 is absent because the page
   itself publishes breadth only for its synthetic GROUP rows (breadthOf returns null for a
   single-ticker GICS sector), so absence is the faithful production value. The module tolerates all
   three by contract — a row without breadth contributes 0 to its rank, and the "confirmed" tempo the
   summary uses never reads x3 — and none of them feeds the numeric or the value text asserted below.
   The per-row vehicle carries the sector's own tradeable ticker with no fit/mom (the page scores ETF
   fit only within the operator-selected sector's candidate list), exactly as the page's provider
   publishes it, so the module honestly reports vehicle.ticker null. */
function sectorOwnerState() {
  const universe = readJson('sector-universe.json');
  const benchmark = String(universe.defaultBenchmark || '');
  assert.ok(benchmark, 'the production sector universe must declare a default benchmark');
  const benchmarkCloseByDay = new Map();
  for (const row of realDailyRows(benchmark)) {
    if (Number.isFinite(row.c) && row.c > 0) benchmarkCloseByDay.set(new Date(row.t).toISOString().slice(0, 10), row.c);
  }
  const rows = (universe.entries || []).filter((entry) => entry.group === 'GICS Sectors' && entry.on && entry.ticker
    && existsSync(new URL(`data/bars/${entry.ticker}.json`, ROOT)));
  assert.ok(rows.length >= 3, 'at least three real GICS sector snapshots are required for a sector owner state');
  let lastObserved = 0;
  const sectors = [];
  for (const entry of rows) {
    const rs = [];
    for (const row of realDailyRows(entry.ticker)) {
      const benchmarkClose = benchmarkCloseByDay.get(new Date(row.t).toISOString().slice(0, 10));
      if (!Number.isFinite(row.c) || !Number.isFinite(benchmarkClose)) continue;
      rs.push(row.c / benchmarkClose);
      if (row.t > lastObserved) lastObserved = row.t;
    }
    assert.ok(rs.length >= 8, `${entry.ticker}: the real snapshot must align a priced relative-strength window`);
    sectors.push({
      id: entry.id,
      label: entry.label,
      rs: { [benchmark]: rs },
      x3: null,
      breadthPct50: null,
      riskScore: null,
      etf: { ticker: entry.ticker }
    });
  }
  return {
    contractVersion: 'sector-rotation-owner-state/v1',
    toolId: 'sector-research-lab',
    asOf: new Date(lastObserved).toISOString(),
    source: 'same-origin daily snapshot (data/bars)',
    benchmarks: [benchmark],
    sectors
  };
}

/* The observed trailing percentage change of a close series over N sessions. This is an OBSERVATION
   REDUCTION of two real closes on one series — the same class as the sector fixture's aligned
   close/benchmark ratio — and it supplies an owner INPUT only. Every owner RESULT below still comes
   from the module. */
function observedTrailingPct(rows, sessions) {
  if (!Array.isArray(rows) || rows.length < sessions + 1) return null;
  const last = rows[rows.length - 1];
  const first = rows[rows.length - 1 - sessions];
  if (!last || !first || !Number.isFinite(last.c) || !Number.isFinite(first.c) || first.c <= 0) return null;
  return (last.c / first.c - 1) * 100;
}

/* The horizons the country-rotation contract itself declares, one per owner-state field
   (rel21 / rel63 / rel126). Contract-derived, never an invented sampling choice. */
const COUNTRY_HORIZONS = [21, 63, 126];

/* country-rotation owner state — the SAME shape global-rotation-lab.html's provider publishes
   (contractVersion + benchmark + per-country {id, label, rel21, rel63, rel126, fxScore, vol,
   drawdown, trendScore, rows}).
   PRODUCTION-DERIVED, NEVER A HAND-TYPED LIST. The country rows, their tickers/labels and the
   benchmark all come from the page's OWN universe file (global-rotation-universe.json — the exact
   file the page's loadUniverse() fetches), and every close series is the REAL same-origin daily
   snapshot the page hydrates through RLDATA (data/bars/<SYM>.json).
   The relative-momentum triple is the owner INPUT the page's buildModelRows() assembles — a
   benchmark-relative trailing observation of two observed close series over the contract's OWN
   declared horizons — never an owner RESULT: the horizon weighting and 8/14/22 scaling, the FX and
   volatility and diversification blend, the 0..100 score mapping, the queue ordering and the
   freshness classification all stay inside the module, and every value asserted below still comes
   from computeCountryRotationSummary. The per-country close series is handed over verbatim so the
   diversification term runs on the MODULE's OWN exported globalPairCorrelation.
   HONEST ABSENCE, stated plainly: fxScore, vol, drawdown and trendScore are page-owned reductions
   (globalFxConfirm / globalAnnualVol / globalMaxDrawdown / globalTrendState) with NO module
   producer, so reproducing them here would copy an owner formula — they are left absent rather than
   invented, exactly as the sector fixture leaves x3 and riskScore absent. localCloseAgeHours is
   absent because NO producer exists anywhere: the page carries only indicative prose sessions and a
   US-listed ETF bar date, which its own caveat states is not a synchronized local-market
   observation. The module tolerates all five by contract — a missing FX or volatility term is simply
   not applied, and a missing local-close age is reported as honestly "unavailable" freshness rather
   than defaulted fresh — and none of them is required for the numeric asserted below, which comes
   from the module's own queue. */
function countryOwnerState() {
  const universe = readJson('global-rotation-universe.json');
  const benchmark = String(universe.defaultBenchmark || '');
  assert.ok(benchmark, 'the production global-rotation universe must declare a default benchmark');
  const benchmarkRows = realDailyRows(benchmark).filter((row) => Number.isFinite(row.c) && row.c > 0);
  assert.ok(benchmarkRows.length > COUNTRY_HORIZONS[COUNTRY_HORIZONS.length - 1],
    `${benchmark}: the real benchmark snapshot must cover the longest declared horizon`);
  const entries = (universe.entries || []).filter((entry) => entry.kind === 'country' && entry.ticker
    && existsSync(new URL(`data/bars/${entry.ticker}.json`, ROOT)));
  assert.ok(entries.length >= 3, 'at least three real country snapshots are required for a country owner state');

  let lastObserved = 0;
  const countries = [];
  for (const entry of entries) {
    const rows = realDailyRows(entry.ticker)
      .filter((row) => Number.isFinite(row.t) && Number.isFinite(row.c) && row.c > 0)
      .map((row) => ({ t: row.t, c: row.c }));
    assert.ok(rows.length > COUNTRY_HORIZONS[COUNTRY_HORIZONS.length - 1],
      `${entry.ticker}: the real snapshot must cover the longest declared horizon`);
    if (rows[rows.length - 1].t > lastObserved) lastObserved = rows[rows.length - 1].t;
    const country = {
      id: entry.ticker,
      label: entry.country,
      fxScore: null,
      vol: null,
      drawdown: null,
      trendScore: null,
      rows
    };
    for (const horizon of COUNTRY_HORIZONS) {
      const own = observedTrailingPct(rows, horizon);
      const control = observedTrailingPct(benchmarkRows, horizon);
      country[`rel${horizon}`] = (Number.isFinite(own) && Number.isFinite(control)) ? own - control : null;
    }
    countries.push(country);
  }
  return {
    contractVersion: 'country-rotation-owner-state/v1',
    toolId: 'global-rotation-lab',
    asOf: new Date(lastObserved).toISOString(),
    source: 'same-origin daily snapshot (data/bars)',
    benchmark,
    countries
  };
}

/* The 63-session horizon the real-asset-driver owner contract itself declares in its OWN driver
   field names (uup63 / tlt63 / tip63 / qqq63 / xle63 / xli63). Contract-derived, never an invented
   sampling choice. */
const REAL_ASSET_DRIVER_SESSIONS = 63;

/* The committed production artifact into which the deployed pages' RLDATA.putToolRead output is
   harvested. Used ONLY as a source of an OWNER'S OWN PUBLISHED RESULT — never as a substitute for a
   module computation. */
function publishedToolRead(toolId) {
  const snapshot = readJson('market-brief.snapshot.json');
  const reads = (snapshot && snapshot.toolReads) || {};
  const read = reads[toolId];
  assert.ok(read && read.metrics, `market-brief.snapshot.json must carry a published owner read for ${toolId}`);
  return read;
}

/* real-asset-driver owner state — the SAME shape real-assets-lab.html's provider publishes
   (contractVersion + benchmark + selected + drivers + per-asset {id, label, model, trendScore,
   volatility, drawdown, ownerScore, riskPenalty}).

   PROVENANCE, STATED PLAINLY: the per-asset owner score, realized volatility, max drawdown and risk
   penalty are produced by real-assets-lab.html's OWN closure-local model chain (calculateModel ->
   goldModelScore / silverModelScore / bitcoinModelScore / cryptoModelScore / commodityModelScore,
   plus realAnnualVol and realMaxDrawdown) which — unlike market-structure.js's reduceOwnerState —
   has NO module export; the real-asset adapter documents that it deliberately does NOT delegate
   those page model formulas. Reimplementing any of them here would COPY an owner formula, which this
   suite forbids. So instead of hand-typing a score, they are read from the OWNER'S OWN PUBLISHED
   READ: market-brief.snapshot.json's toolReads['real-assets-lab'], the committed production artifact
   into which the deployed page's RLDATA.putToolRead("real-assets-lab", ...) output is harvested.
   Every ownerScore / volatility / drawdown / riskPenalty below is therefore the page's own published
   result — not a test reproduction of it — and the asset ids, models and the selected leader are the
   page's own published choices. The per-asset labels and the benchmark come from the page's OWN
   universe file (real-assets-universe.json — the exact file the page's loadUniverse() fetches).

   The driver deltas are OBSERVATION REDUCTIONS of the REAL same-origin daily snapshots the page
   hydrates through RLDATA (data/bars/<SYM>.json) over the horizon the contract's own field names
   declare — the same class as the country fixture's rel21/rel63/rel126 — and the driver MEMBERSHIP
   comes from the universe file's own `role: 'driver'` entries, keyed mechanically as
   `<symbol lowercased>63` rather than through a hand-written key map. They are owner INPUTS only:
   the bounded tilt scaling, the composite driver blend, the scenario state, the volatility/drawdown
   stress overlay, the drawdown risk state and the breadth confirmation all stay inside the module,
   and every value asserted below still comes from computeRealAssetDriverSummary.

   HONEST ABSENCE, stated plainly: trendScore is absent because the published read carries only
   realTrendState's LABEL ("Uptrend" / "Mixed" / "Downtrend"), not its numeric 0..100 score, and
   deriving that number here would copy the page's horizon-weighting formula. breadthReturns is
   absent because the commodity-family membership behind it is a selection rule that lives inline in
   the page (breadthReturns()'s families map) with no module producer and no universe field, so
   reproducing it would copy an owner selection — and the ONE breadth reduction that IS module-owned
   (realBreadthPct) needs that page-owned list as its input. The module tolerates both by contract:
   computeRealAssetDriverSummary never reads trendScore, and a missing breadth list is reported as an
   honestly "unavailable" confirmation rather than a defaulted-confirmed one. Neither feeds the
   numeric asserted below, which comes from the module's own scenario score. */
function realAssetOwnerState() {
  const universe = readJson('real-assets-universe.json');
  const benchmark = String(universe.defaultBenchmark || '');
  assert.ok(benchmark, 'the production real-assets universe must declare a default benchmark');
  const entries = Array.isArray(universe.entries) ? universe.entries : [];
  const labelBySymbol = new Map(entries.map((entry) => [entry.symbol, entry.label]));

  const drivers = {};
  const driverSymbols = entries
    .filter((entry) => entry.role === 'driver' && entry.symbol && existsSync(new URL(`data/bars/${entry.symbol}.json`, ROOT)))
    .map((entry) => entry.symbol);
  assert.ok(driverSymbols.length >= 3, 'at least three real driver snapshots are required for a real-asset owner state');
  for (const symbol of driverSymbols) {
    const rows = realDailyRows(symbol).filter((row) => Number.isFinite(row.t) && Number.isFinite(row.c) && row.c > 0);
    assert.ok(rows.length > REAL_ASSET_DRIVER_SESSIONS,
      `${symbol}: the real snapshot must cover the declared driver horizon`);
    drivers[`${symbol.toLowerCase()}${REAL_ASSET_DRIVER_SESSIONS}`] = observedTrailingPct(rows, REAL_ASSET_DRIVER_SESSIONS);
  }

  const read = publishedToolRead('real-assets-lab');
  const metrics = read.metrics;
  const published = [];
  const seen = new Set();
  for (const row of [].concat(Array.isArray(metrics.ranked) ? metrics.ranked : [], Object.values(metrics.specific || {}))) {
    if (!row || !row.ticker || seen.has(row.ticker)) continue;
    seen.add(row.ticker);
    published.push(row);
  }
  assert.ok(published.length >= 3, 'the published real-assets owner read must carry at least three assets');

  const assets = published.map((row) => ({
    id: String(row.ticker),
    label: labelBySymbol.has(row.ticker) ? labelBySymbol.get(row.ticker) : String(row.ticker),
    model: String(row.model),
    trendScore: null,
    volatility: Number.isFinite(row.vol) ? row.vol : null,
    drawdown: Number.isFinite(row.maxDrawdown) ? row.maxDrawdown : null,
    ownerScore: Number.isFinite(row.score) ? row.score : null,
    riskPenalty: Number.isFinite(row.riskPenalty) ? row.riskPenalty : null
  }));
  assert.ok(assets.some((asset) => Number.isFinite(asset.ownerScore)),
    'the published real-assets owner read must price at least one asset');

  const selected = String((metrics.leader && metrics.leader.ticker) || assets[0].id);
  assert.ok(assets.some((asset) => asset.id === selected && Number.isFinite(asset.ownerScore)),
    'the published owner leader must itself be a priced asset');

  return {
    contractVersion: 'real-asset-driver-owner-state/v1',
    toolId: 'real-assets-lab',
    asOf: String(read.asOf),
    source: 'published owner read (market-brief.snapshot.json toolReads) + same-origin daily snapshot (data/bars)',
    benchmark,
    selected,
    drivers,
    assets
  };
}

/* The calendar-day lookback etf-momentum-lab.html's OWN computeMetrics declares for each trailing
   key it publishes — trail(30) -> '1M', trail(91) -> '3M', trail(182) -> '6M', trail(365) -> '1Y'.
   Page-declared, never an invented sampling choice, and restricted to exactly the four keys the
   etf-ranking adapter reads (etfHorizonKey maps its own 1m/3m/6m/12m horizon enum onto them). */
const ETF_TRAILING_WINDOW_DAYS = { '1M': 30, '3M': 91, '6M': 182, '1Y': 365 };
const ETF_DAY_MS = 86400000;

/* The observed trailing fraction of a close series over one CALENDAR-day lookback: the last close
   divided by the last close at-or-before (lastObservation - days), minus one. This is an OBSERVATION
   REDUCTION of two real closes on one series — the same class as observedTrailingPct above and as
   the sector fixture's aligned close/benchmark ratio — and it supplies an owner INPUT only. Every
   owner RESULT below still comes from the module. Returns null (never a fill) when the snapshot does
   not reach back far enough. */
function observedTrailingFraction(rows, calendarDays) {
  const priced = rows.filter((row) => Number.isFinite(row.t) && Number.isFinite(row.c) && row.c > 0);
  if (priced.length < 2) return null;
  const last = priced[priced.length - 1];
  const target = last.t - calendarDays * ETF_DAY_MS;
  let base = null;
  for (const row of priced) {
    if (row.t > target) break;
    base = row;
  }
  return base ? (last.c / base.c - 1) : null;
}

/* etf-ranking owner state — the SAME shape etf-momentum-lab.html's provider publishes
   (contractVersion + benchmarks map + per-fund {ticker, name, trailing, annVol, maxDD, sharpe,
   cagr, aum}).

   PRODUCTION-DERIVED, NEVER A HAND-TYPED LIST. The fund rows, their tickers/names/AUM come from the
   page's OWN universe file (etf-universe.json — the exact file the page's boot() fetches and
   applyUniverse() loads), restricted to the `on: true` sleeve the page's own included() ranks by
   default, and every trailing return is built from the REAL same-origin daily snapshots the page
   hydrates through RLDATA (data/bars/<TICKER>.json). The benchmark MEMBERSHIP is the registry's OWN
   declared `benchmark` parameter domain rather than a hand-written list, so a registry change is
   picked up automatically.

   The trailing ladder is the owner INPUT the page's computeMetrics assembles — a calendar-day
   two-close ratio off the full observed series — never an owner RESULT: the horizon momentum, the
   composite ranking score, the risk load, the benchmark-relative excess and the capped basket all
   stay inside the module, and every value asserted below still comes from computeEtfRankingSummary.

   HONEST ABSENCE, stated plainly: annVol, maxDD, sharpe and cagr (fund AND benchmark) are page-owned
   computeMetrics reductions — realized volatility, the running-peak drawdown, the risk-free-adjusted
   Sharpe and the window-annualized CAGR — with NO module producer, so reproducing them here would
   COPY an owner formula, which this suite forbids. They are left absent rather than invented,
   exactly as the sector fixture leaves x3/riskScore and the country fixture leaves
   fxScore/vol/drawdown/trendScore absent. Substituting another model's estimator (rlvol.js's
   realizedVol) would publish a DIFFERENT number than the owner's and is therefore equally
   forbidden. The module tolerates all four by contract — its own etfRiskComponent documents that a
   missing owner metric "contributes zero (it is simply absent), never a fabricated fill", and a
   missing CAGR reports the benchmark-relative excess as honestly null instead of a fabricated
   excess — and none of them feeds the numeric asserted below, which comes from the module's own
   ranking score. The deployed page's provider DOES publish all four live from METRICS; only this
   fixture, which cannot reproduce them without copying the formula, leaves them null. */
function etfOwnerState() {
  const universe = readJson('etf-universe.json');
  const definition = definitionForAdapter('simple-adapter/etf-ranking/v1');
  const benchmarkParameter = (definition.parameterDefinitions || []).find((parameter) => parameter.parameterId === 'benchmark');
  assert.ok(benchmarkParameter && Array.isArray(benchmarkParameter.domain.options),
    'the registry must declare the etf-ranking benchmark domain');

  const entries = (universe.etfs || []).filter((entry) => entry.on && entry.ticker
    && existsSync(new URL(`data/bars/${entry.ticker}.json`, ROOT)));
  assert.ok(entries.length >= 3, 'at least three real momentum-fund snapshots are required for an etf owner state');

  let lastObserved = 0;
  let priced = 0;
  const funds = [];
  for (const entry of entries) {
    const rows = realDailyRows(entry.ticker);
    const observed = rows.filter((row) => Number.isFinite(row.t) && Number.isFinite(row.c) && row.c > 0);
    assert.ok(observed.length > 0, `${entry.ticker}: the real snapshot must carry priced closes`);
    if (observed[observed.length - 1].t > lastObserved) lastObserved = observed[observed.length - 1].t;
    const trailing = {};
    for (const [key, days] of Object.entries(ETF_TRAILING_WINDOW_DAYS)) trailing[key] = observedTrailingFraction(rows, days);
    if (Object.values(trailing).some((value) => Number.isFinite(value))) priced += 1;
    funds.push({
      ticker: entry.ticker,
      name: entry.name,
      trailing,
      annVol: null,
      maxDD: null,
      sharpe: null,
      cagr: null,
      aum: Number.isFinite(entry.aum) ? entry.aum : null
    });
  }
  assert.ok(priced >= 2, 'at least two real funds must price a trailing return before a ranking can be judged');

  const benchmarks = {};
  for (const option of benchmarkParameter.domain.options) {
    const ticker = String(option.value);
    if (!existsSync(new URL(`data/bars/${ticker}.json`, ROOT))) continue;
    const rows = realDailyRows(ticker);
    const trailing = {};
    for (const [key, days] of Object.entries(ETF_TRAILING_WINDOW_DAYS)) trailing[key] = observedTrailingFraction(rows, days);
    benchmarks[ticker] = { cagr: null, trailing };
  }
  assert.ok(Object.keys(benchmarks).length > 0, 'at least one registry-declared benchmark must carry a real snapshot');

  return {
    contractVersion: 'etf-ranking-owner-state/v1',
    toolId: 'etf-momentum-lab',
    asOf: new Date(lastObserved).toISOString(),
    source: 'same-origin daily snapshot (data/bars)',
    benchmarks,
    funds
  };
}

/* The ai-capex-strategy-lab bindings this fixture RUNS, in the page's own declaration order (the
   `var` literals initialize in sequence; the function declarations hoist). This is the transitive
   closure of the page's OWN provider — nothing here is a test reimplementation. */
const AI_CAPEX_PAGE_BINDINGS = Object.freeze([
  'HORIZONS', 'TRIG_FRAC', 'SCEN', 'REGIME_PERSIST', 'RESOURCE_RUNWAY',
  'CROWDING', 'UNIVERSE_AS_OF', 'UNIVERSE_SOURCE', 'state',
  'clamp', 'runwayFor', 'assetHorizon', 'included', 'normalizeWeights', 'applyPreset',
  'acValidUniverseAsset', 'acApplyUniverse', 'aiCapexOwnerState'
]);

/* ai-capex-portfolio owner state — literally the object ai-capex-strategy-lab.html's OWN registered
   provider publishes, produced by RUNNING that page's OWN deployed code.

   WHY THIS FIXTURE RUNS THE PAGE INSTEAD OF READING AN ARTIFACT. The ai-capex owner contract carries
   per-asset per-horizon expected-return/volatility facts. Those are produced by the page's OWN
   closure-local `assetHorizon` chain (the scenario table SCEN, the horizon regime-persistence fade
   REGIME_PERSIST, the trigger-timing fraction TRIG_FRAC and the per-theme resource-runway tilt
   RESOURCE_RUNWAY), which has NO module export — the fundamental-models adapter deliberately
   CONSUMES those facts as frozen owner inputs rather than deriving them. Unlike real-assets-lab
   there is also no harvested owner read to fall back on: market-brief.snapshot.json carries no
   ai-capex entry, and the brief's own published ai-capex read is `coverage-only`/`not-applicable`
   with `metrics: null` ("No deterministic Tier-A adapter"). And unlike the etf fixture's absent
   annVol/maxDD, the per-horizon er/sd CANNOT be left null: the module's own `aiCapexEvidenceState`
   reports `unavailable` when no asset prices at any horizon, so an all-null owner state would prove
   nothing about a ready projection. Hand-typing er/sd values would fabricate an owner result, and
   reimplementing `assetHorizon` here would COPY an owner formula — both forbidden by this suite.

   So the page's own bindings are extracted VERBATIM from the deployed source and executed, exactly
   as scripts/selftest.mjs already executes this same page's `alignReturns`/`ledoitWolf`. The boot
   order is the page's own: `applyPreset('balanced')` — the default sleeve the page's init applies
   when no snapshot/localStorage state is restored — followed by `acApplyUniverse()` on the REAL
   ai-capex-universe.json the page's init fetches, which is what refreshes the per-asset facts,
   merges the crowding overrides and replaces the declared as-of with the file's OWN `asOf`. The
   owner state is then whatever the page's OWN `aiCapexOwnerState()` returns. Every value is
   therefore the page's own live value, computed by the page's own code on the page's own committed
   universe — not a test reproduction of it, and not a hand-written projection.

   DETERMINISTIC BY CONSTRUCTION: both inputs are committed static files (the deployed page and
   ai-capex-universe.json) and the page's default state is fixed (scenario `base`, theme filter
   `All`, intra/inter theme correlation 0.72/0.40). No clock, no network, no snapshot recency.

   THE SIMULATION SEED IS NOT AN OWNER FACT and is deliberately absent from the owner state on both
   sides: `simple-models.json` declares it as a registry parameter (seedPolicy.required = true,
   defaultSeed 20260722, defaultSource "registry"), so the deployed bridge pins it from the
   definition (rlexperience.js `installSimpleProjectionBridge`) and this suite pins the identical
   value through `registrySeed(definition)`. ai-capex is the first wired tool with a stochastic seed
   policy, and that shared registry pin is what makes its seeded distribution sample reproducible. */
function aiCapexOwnerState() {
  const source = readPage('ai-capex-strategy-lab.html');
  assert.ok(source, 'the deployed ai-capex-strategy-lab.html source is required to run its own owner provider');

  const declarations = AI_CAPEX_PAGE_BINDINGS.map((name) => extractPageBinding(source, name));
  // Two page statements fuse a declaration with its initialization on one line, so they are taken
  // whole rather than as bindings: the ASSETS id/inclusion stamp that `included()` filters on, and
  // the ticker index `applyPreset()` writes through.
  const assetsLiteral = extractPageBinding(source, 'ASSETS');
  const assetsStamp = extractPageLine(source, 'ASSETS.forEach(function (a, i) { a.id = i;');
  const presetsLiteral = extractPageBinding(source, 'PRESETS');
  const tickerIndex = extractPageLine(source, 'var byTk = {};');

  const page = Function([
    declarations.join('\n'),
    assetsLiteral,
    assetsStamp,
    presetsLiteral,
    tickerIndex,
    'return { applyPreset: applyPreset, acApplyUniverse: acApplyUniverse, aiCapexOwnerState: aiCapexOwnerState, state: state };'
  ].join('\n'))();

  // The page's OWN boot order (its init IIFE): the default preset first, then the universe file.
  page.applyPreset('balanced');
  const universe = readJson('ai-capex-universe.json');
  assert.equal(page.acApplyUniverse(universe), true, 'the page must accept its own committed ai-capex-universe.json');

  const ownerState = page.aiCapexOwnerState();
  assert.ok(ownerState, 'the page provider must publish an owner state for its own default sleeve');
  assert.equal(ownerState.contractVersion, 'ai-capex-portfolio-owner-state/v1');
  assert.equal(ownerState.toolId, 'ai-capex-strategy-lab');
  assert.equal(ownerState.asOf, universe.asOf, 'the published as-of must be the universe file\'s OWN declared asOf');
  assert.ok(ownerState.assets.length >= 3, 'the default sleeve must carry at least three assets');
  const pricedAtDefault = ownerState.assets.filter((asset) => {
    const horizon = asset.byHorizon[registryDefaults(definitionForAdapter('simple-adapter/ai-capex-portfolio/v1')).horizon];
    return horizon && Number.isFinite(horizon.er) && Number.isFinite(horizon.sd);
  });
  assert.ok(pricedAtDefault.length >= 2,
    'at least two assets must price at the registry-default horizon before a portfolio can be judged');
  return ownerState;
}

/* Owner-state builders keyed by the REGISTRY adapter id. A wired tool with no entry FAILS LOUD. */
const OWNER_STATES = {
  'simple-adapter/market-breadth/v1': breadthOwnerState,
  'simple-adapter/session-auction/v1': sessionOwnerState,
  'simple-adapter/swing-transition/v1': swingOwnerState,
  'simple-adapter/technical-five-gate/v1': technicalOwnerState,
  'simple-adapter/options-anomaly/v1': anomalyOwnerState,
  'simple-adapter/options-surface/v1': surfaceOwnerState,
  'simple-adapter/dealer-gamma-playbook/v1': gammaOwnerState,
  'simple-adapter/sector-rotation-transition/v1': sectorOwnerState,
  'simple-adapter/country-rotation/v1': countryOwnerState,
  'simple-adapter/real-asset-driver/v1': realAssetOwnerState,
  'simple-adapter/etf-ranking/v1': etfOwnerState,
  'simple-adapter/ai-capex-portfolio/v1': aiCapexOwnerState
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
  },
  'simple-adapter/options-anomaly/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeAnomalySummary(frozenClone(ownerState), parameterValues);
    const ready = summary.unusualness.state === 'ready';
    return {
      ownerFunction: 'computeAnomalySummary',
      numericValue: ready ? summary.unusualness.clearedCount : null,
      valueText: `${summary.unusualness.clearedCount} unusual contracts`,
      summaryContains: ready
        ? [String(summary.unusualness.clearedCount), String(summary.unusualness.consideredCount), summary.callPutLean.lean]
        : []
    };
  },
  'simple-adapter/options-surface/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeSurfaceSummary(frozenClone(ownerState), parameterValues);
    const ready = summary.surface.state === 'ready';
    return {
      ownerFunction: 'computeSurfaceSummary',
      numericValue: ready ? summary.gammaFlip.signedNetGEX : null,
      valueText: `${summary.gammaFlip.regime} gamma`,
      summaryContains: ready
        ? [
          summary.gammaFlip.regime,
          summary.walls.callWall === null ? '-' : String(summary.walls.callWall),
          summary.walls.putWall === null ? '-' : String(summary.walls.putWall),
          summary.expectedMove.em === null ? '-' : String(summary.expectedMove.em)
        ]
        : []
    };
  },
  'simple-adapter/dealer-gamma-playbook/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeGammaPlaybookSummary(frozenClone(ownerState), parameterValues);
    const ready = summary.gammaState.state === 'ready';
    return {
      ownerFunction: 'computeGammaPlaybookSummary',
      numericValue: ready ? summary.gammaState.signedNetGEX : null,
      valueText: `${summary.playbook.gammaRegime} gamma`,
      summaryContains: ready
        ? [summary.playbook.gammaRegime, summary.playbook.scenario, summary.playbook.conviction, summary.playbook.hold]
        : []
    };
  },
  'simple-adapter/sector-rotation-transition/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeSectorRotationSummary(frozenClone(ownerState), parameterValues);
    const into = summary.transition.top.into;
    const out = summary.transition.top.out;
    const leader = summary.relativeStrength.leaders.length ? summary.relativeStrength.leaders[0] : null;
    return {
      ownerFunction: 'computeSectorRotationSummary',
      numericValue: leader ? leader.rsRatio : null,
      valueText: into ? `Rotate toward ${into}` : (out ? `${out} weakening` : 'No confirmed rotation'),
      /* The owner-computed transition ids, taken straight off the summary object. Whichever of the
         two the owner confirms appears verbatim in the Simple summary line, so a Simple read that
         named a different sector than the owner transition fails here. */
      summaryContains: [into, out].filter(Boolean)
    };
  },
  'simple-adapter/country-rotation/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeCountryRotationSummary(frozenClone(ownerState), parameterValues);
    const leader = summary.queue.length ? summary.queue[0] : null;
    return {
      ownerFunction: 'computeCountryRotationSummary',
      numericValue: leader ? leader.score : null,
      valueText: leader ? `Rotate toward ${leader.id}` : 'No confirmed country rotation',
      /* The owner-computed queue leader and the benchmark it was priced against, taken straight off
         the summary object. A Simple read that named a different country — or claimed a benchmark
         the owner did not price against — fails here. */
      summaryContains: leader ? [leader.id, summary.benchmark] : []
    };
  },
  'simple-adapter/real-asset-driver/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeRealAssetDriverSummary(frozenClone(ownerState), parameterValues);
    return {
      ownerFunction: 'computeRealAssetDriverSummary',
      numericValue: summary.score,
      valueText: `${summary.selected} drivers ${summary.driverState.state}`,
      /* The owner-computed selected asset, its driver-scenario state, the breadth-confirmation state
         and the benchmark it was priced against, taken straight off the summary object. A Simple read
         that named a different asset, claimed a different driver or confirmation state, or claimed a
         benchmark the owner did not price against fails here. */
      summaryContains: [summary.selected, summary.driverState.state, summary.confirmation.state, summary.benchmark]
    };
  },
  'simple-adapter/etf-ranking/v1': (moduleObject, ownerState, parameterValues) => {
    const summary = moduleObject.computeEtfRankingSummary(frozenClone(ownerState), parameterValues);
    const leader = summary.ranking.length ? summary.ranking[0] : null;
    return {
      ownerFunction: 'computeEtfRankingSummary',
      numericValue: leader && leader.score != null ? leader.score : null,
      valueText: leader ? `${leader.ticker} leads the ranking` : 'No priced fund',
      /* The owner-computed ranking leader and the benchmark it was priced against, taken straight
         off the summary object. A Simple read that named a different fund — or claimed a benchmark
         the owner did not price against — fails here. */
      summaryContains: leader ? [leader.ticker, summary.benchmark] : []
    };
  },
  'simple-adapter/ai-capex-portfolio/v1': (moduleObject, ownerState, parameterValues) => {
    /* `parameterValues` carries the registry-pinned seed (seedPolicy.defaultSeed), so the module's
       seeded distribution sample is reproduced on exactly the path the Simple run took. */
    const summary = moduleObject.computeAiCapexSummary(frozenClone(ownerState), parameterValues);
    const lead = summary.beneficiaries.length ? summary.beneficiaries[0] : null;
    return {
      ownerFunction: 'computeAiCapexSummary',
      numericValue: summary.distribution.median,
      valueText: summary.distribution.median == null ? 'No priced portfolio' : `Median return ${summary.distribution.median}`,
      /* The owner-computed leading beneficiary theme, plus the objective and horizon the owner
         actually priced under, taken straight off the summary object. A Simple read that led with a
         different theme — or claimed an objective/horizon the owner did not run — fails here. */
      summaryContains: lead ? [lead.theme, summary.objective, summary.horizon] : []
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
