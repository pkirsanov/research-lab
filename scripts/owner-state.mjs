/*
 * scripts/owner-state.mjs — build a tool's OWNER STATE from committed same-origin data.
 *
 * Why this exists: Tier-A (the deterministic, no-LLM brief refresh) could only reach 5 of 23 tools,
 * because the remaining reads had no server-side path from committed data into the owning tool's own
 * model. Every one of those models is already exported from rlexperience-adapters/*.js — what was
 * missing was the INPUT. This module supplies exactly that, and nothing else.
 *
 * Hard rule: these builders assemble owner INPUTS from real observations only. They never compute an
 * owner RESULT — that stays inside the owning adapter — and they never fabricate a missing input.
 * A builder with insufficient evidence returns null so the caller can degrade honestly.
 */
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);

export function loadAdapter(root, relativePath) {
  return require(path.join(path.resolve(root), relativePath));
}

function readJson(root, relativePath) {
  const abs = path.join(path.resolve(root), relativePath);
  if (!existsSync(abs)) return null;
  try { return JSON.parse(readFileSync(abs, 'utf8')); } catch { return null; }
}

/** Committed daily bars for one symbol, or null. `minRows` guards models that need a full window. */
export function dailyBars(root, symbol, minRows = 250) {
  const snapshot = readJson(root, `data/bars/${symbol}.json`);
  const rows = snapshot && Array.isArray(snapshot.rows) ? snapshot.rows : null;
  if (!rows || rows.length < minRows) return null;
  return rows;
}

/** Committed EOD option snapshot for one symbol, or null. Schema: {sym, spot, asof, o:[{e,t,k,iv,oi,v,b,a,l}]}. */
export function optionSnapshot(root, symbol) {
  const snapshot = readJson(root, `data/options/${symbol}.json`);
  if (!snapshot || !Array.isArray(snapshot.o) || !snapshot.o.length) return null;
  if (!Number.isFinite(snapshot.spot) || snapshot.spot <= 0) return null;
  return snapshot;
}

/**
 * The snapshot's OWN observation instant. Reading the clock off the observation rather than
 * Date.now() keeps every DTE — and therefore every downstream greek — anchored to the data the
 * owning page reads, so a Tier-A read and a browser read of the same snapshot agree.
 */
export function snapshotClockMs(snapshot) {
  const observed = String(snapshot.asof || snapshot.fetched || '');
  const stamped = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(observed) ? observed : `${observed}Z`;
  const parsed = Date.parse(stamped);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionRowsByExpiry(snapshot) {
  const byExpiry = new Map();
  for (const row of snapshot.o) {
    if (!Number.isFinite(row.e)) continue;
    if (!byExpiry.has(row.e)) byExpiry.set(row.e, []);
    byExpiry.get(row.e).push(row);
  }
  return { byExpiry, expiries: [...byExpiry.keys()].sort((a, b) => a - b) };
}

/** Registry-declared defaults for one Simple model — never invented parameter literals. */
export function registryDefaults(root, adapterId) {
  const registry = readJson(root, 'simple-models.json');
  const definition = (registry && registry.definitions || []).find((entry) => entry.adapterId === adapterId);
  if (!definition) return null;
  const values = {};
  for (const parameter of definition.parameterDefinitions || []) {
    let value = parameter.defaultValue;
    if (parameter.defaultSource === 'evidence-derived' && value === null) {
      const domain = parameter.domain || {};
      if (Array.isArray(domain.options) && domain.options.length) value = domain.options[0].value;
      else if (Number.isFinite(domain.min)) {
        const step = Number.isFinite(domain.step) && domain.step > 0 ? domain.step : 1;
        value = domain.min > 0 ? domain.min : Math.round((domain.min + step) * 1e6) / 1e6;
      }
    }
    values[parameter.parameterId] = value;
  }
  return values;
}

/* ── options-structure-lab: the surface the page's provider publishes ───────────────────────────── */

const SURFACE_EXPIRY_COUNT = 3;
const SURFACE_ZOOM_PCT = 18;
const SURFACE_MIN_OI = 0;
const SURFACE_DIV = 0;

export function surfaceOwnerState(root, symbol = 'SPY') {
  const options = loadAdapter(root, 'rlexperience-adapters/options.js');
  const snapshot = optionSnapshot(root, symbol);
  if (!snapshot) return null;
  const nowMs = snapshotClockMs(snapshot);
  if (nowMs === null) return null;
  const { byExpiry, expiries } = optionRowsByExpiry(snapshot);
  if (!expiries.length) return null;

  const chains = expiries.slice(0, SURFACE_EXPIRY_COUNT).map((expiry) => {
    const calls = [];
    const puts = [];
    for (const row of byExpiry.get(expiry)) {
      const iv = Number(row.iv);
      const contract = {
        strike: Number(row.k),
        openInterest: Number(row.oi) || 0,
        volume: Number(row.v) || 0,
        impliedVolatility: Number.isFinite(iv) && iv > 0 ? iv : null,
        bid: Number(row.b), ask: Number(row.a), lastPrice: Number(row.l) || 0
      };
      (row.t === 'P' ? puts : calls).push(contract);
    }
    return { dte: options.dteFrom(expiry, nowMs), calls, puts };
  });

  return {
    contractVersion: 'options-surface-owner-state/v1',
    toolId: 'options-structure-lab',
    symbol: snapshot.sym || symbol,
    asOf: new Date(nowMs).toISOString(),
    source: 'same-origin options snapshot (data/options)',
    nowMs,
    spot: snapshot.spot,
    div: SURFACE_DIV, zoom: SURFACE_ZOOM_PCT, minOI: SURFACE_MIN_OI,
    chains
  };
}

/* ── gamma-trading-lab: the frozen gamma snapshot the playbook consumes ─────────────────────────── */

/**
 * The page's own `snap` comes from a closure-coupled computeGamma with no module export, so the
 * gamma-structure INPUT is sourced from the MODULE's own surface primitives run on the SAME chain at
 * that model's own registry defaults. netGEX is taken UNSIGNED (the playbook applies its own dealer
 * sign on top). maxPain and the OVI trio are page-owned reductions with no module producer and no
 * same-origin history store, so they stay absent — the playbook then reports its OVI state honestly
 * unavailable rather than showing an invented percentile.
 */
export function gammaOwnerState(root, symbol = 'SPY') {
  const options = loadAdapter(root, 'rlexperience-adapters/options.js');
  const chain = surfaceOwnerState(root, symbol);
  if (!chain) return null;
  const defaults = registryDefaults(root, 'simple-adapter/options-surface/v1');
  if (!defaults) return null;
  const surface = options.computeSurfaceSummary(JSON.parse(JSON.stringify(chain)), defaults);
  if (!surface || surface.surface.state !== 'ready') return null;

  return {
    contractVersion: 'options-gamma-owner-state/v1',
    toolId: 'gamma-trading-lab',
    ticker: chain.symbol,
    asOf: chain.asOf,
    source: chain.source,
    nowMs: chain.nowMs,
    snap: {
      spot: chain.spot,
      netGEX: surface.surface.netGammaExposure,
      flip: surface.gammaFlip.flipLevel,
      callWall: surface.walls.callWall,
      putWall: surface.walls.putWall,
      atmIV: surface.expectedMove.atmIV,
      maxPain: null
    },
    hist: []
  };
}

/* ── swing-structure-lab: the daily window the page hydrates into state.full ────────────────────── */

export function swingOwnerState(root, symbol = 'SPY', macro = null) {
  const full = dailyBars(root, symbol);
  if (!full) return null;
  return {
    contractVersion: 'swing-transition-owner-state/v1',
    toolId: 'swing-structure-lab',
    symbol,
    asOf: new Date(full[full.length - 1].t).toISOString(),
    source: 'same-origin daily snapshot (data/bars)',
    full,
    // The regime read is the run's OWN observed macro. Absent it, the model degrades on its own
    // terms rather than being handed a neutral placeholder.
    macro: macro || { fg: null, vix: null }
  };
}

/* ── market-heatmap-lab: constituent breadth over the page's own universe ───────────────────────── */

/**
 * Constituents come from sector-universe.json — the exact file the page's boot() fetches — so the
 * breadth read is over the page's OWN universe, not a hand-picked sample. Only members with a
 * committed bar snapshot participate; the count is published so a thin read is visible as thin.
 */
export function breadthOwnerState(root, options = {}) {
  const ms = loadAdapter(root, 'rlexperience-adapters/market-structure.js');
  const universe = readJson(root, 'sector-universe.json');
  if (!universe || !universe.sectorMap) return null;

  const constituents = [];
  const rowsByTicker = new Map();
  for (const [sectorEtf, entry] of Object.entries(universe.sectorMap)) {
    const sector = (entry && entry.label) || sectorEtf;
    for (const member of (entry && entry.constituents) || []) {
      if (!member || !member.ticker || rowsByTicker.has(member.ticker)) continue;
      const rows = dailyBars(root, member.ticker, 60);
      if (!rows) continue;
      rowsByTicker.set(member.ticker, rows);
      constituents.push({
        ticker: member.ticker, sector, industry: member.name || sector,
        weight: Number.isFinite(member.weight) ? member.weight : null
      });
    }
  }
  if (constituents.length < 20) return null;

  return ms.reduceOwnerState({
    asOf: options.asOf || new Date().toISOString(),
    source: 'same-origin daily snapshots over sector-universe.json',
    constituents,
    barsReader: (ticker) => rowsByTicker.get(ticker) || null
  });
}

/* ── volatility-sizing-lab: the page's booted universe plus its cache-first bar window ──────────── */

export function volatilityOwnerState(root, options = {}) {
  const rlvol = loadAdapter(root, 'rlvol.js');
  const universe = readJson(root, 'volatility-sizing-universe.json');
  if (!universe) return null;
  const validation = rlvol.validateUniverse(universe);
  if (!validation || validation.ok !== true) return null;
  const config = validation.value;
  const asset = (config.assets || [])[0];
  if (!asset) return null;
  const bars = dailyBars(root, asset.symbol);
  if (!bars) return null;

  const rows = bars.map((row) => ({ t: row.t, c: row.c }));
  const observedAsOf = new Date(rows[rows.length - 1].t).toISOString().slice(0, 10);
  const decisionTime = options.decisionTime || new Date(rows[rows.length - 1].t).toISOString();
  const source = { id: 'pages-snapshot', url: null };
  return {
    asOf: observedAsOf,
    decisionTime,
    configVersion: config.version,
    historyRange: config.policy.history.defaultRange,
    asset,
    policy: config.policy,
    bars: { rows, observedAsOf, retrievedAt: decisionTime, source },
    source
  };
}

/* ── intraday-tape-lab: session bars ───────────────────────────────────────────────────────────────
   There is NO same-origin intraday snapshot in this repo — data/bars carries daily bars only. The
   session-auction model needs real intraday OHLCV, so the caller must supply it (Tier-A fetches it
   live, which Node can do without CORS). Handed nothing, this returns null and the tool degrades to
   an honest unavailable rather than to generated bars, which would be a fabricated read. */

export function sessionOwnerState(root, options = {}) {
  const sessions = Array.isArray(options.sessions) ? options.sessions.filter((s) => s && Array.isArray(s.bars) && s.bars.length >= 10) : [];
  if (sessions.length < 2) return null;
  const today = sessions[sessions.length - 1].bars;
  const prior = sessions[sessions.length - 2].bars;
  const priorClose = prior[prior.length - 1].c;
  const gap = Number.isFinite(priorClose) && priorClose > 0
    ? Math.round(((today[0].o - priorClose) / priorClose) * 1e6) / 1e6
    : null;
  return {
    contractVersion: 'session-auction-owner-state/v1',
    toolId: 'intraday-tape-lab',
    symbol: options.symbol || 'SPY',
    asOf: new Date(today[today.length - 1].t).toISOString(),
    ivMin: options.ivMin || 5,
    source: options.source || 'live intraday bars (no same-origin intraday cache exists)',
    gap,
    gamma: options.gamma || { callWall: null, putWall: null, flip: null },
    sessions
  };
}
