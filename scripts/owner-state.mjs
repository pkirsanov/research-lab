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

/* ── options-flow-feed-lab: the chain set the page's own provider publishes ─────────────────────── */

/**
 * The tickers the flow feed actually scans, read from the owning page's own UNIVERSE declaration.
 * Restating that list here would let the brief report a tape the tool itself never shows.
 */
export function optionsFlowUniverse(root) {
  const abs = path.join(path.resolve(root), 'options-flow-feed-lab.html');
  if (!existsSync(abs)) return null;
  const match = /var\s+UNIVERSE\s*=\s*(\[[^\]]*\])\s*;/.exec(readFileSync(abs, 'utf8'));
  if (!match) return null;
  try {
    const symbols = JSON.parse(match[1]);
    return Array.isArray(symbols) && symbols.length ? symbols : null;
  } catch { return null; }
}

/**
 * The page publishes `options-owner-state/v1` from its own localStorage chain cache, which does not
 * exist in Node. The SAME shape is rebuilt here from the same-origin snapshots that cache is filled
 * from (data/options/<SYM>.json), projected by the page's OWN parsePagesChain.
 *
 * That parser is INJECTED rather than re-extracted: the tool-source loader already lives with the
 * caller, so this module creates neither a second chain projection nor a third function extractor.
 * Missing it is a wiring fault, not missing evidence, so it throws instead of reading as an absence.
 *
 * nowMs is anchored on the newest snapshot observation rather than Date.now(), the same rule the
 * other option builders follow: every days-to-expiry the model derives is then measured against the
 * data actually being read, so a server read and a browser read of the same snapshots agree.
 */
export function optionsFlowOwnerState(root, options = {}) {
  const parseChain = options.parseChain;
  if (typeof parseChain !== 'function') {
    throw new TypeError('optionsFlowOwnerState requires the owning page\u2019s own parsePagesChain');
  }
  const universe = Array.isArray(options.universe) ? options.universe : optionsFlowUniverse(root);
  if (!universe || !universe.length) return null;

  const chains = [];
  let latestMs = null;
  for (const ticker of universe) {
    const snapshot = optionSnapshot(root, ticker);
    if (!snapshot) continue;
    const observedMs = snapshotClockMs(snapshot);
    if (observedMs === null) continue;
    const parsed = parseChain(snapshot);
    if (!parsed || !Array.isArray(parsed.rows) || !parsed.rows.length) continue;
    if (latestMs === null || observedMs > latestMs) latestMs = observedMs;
    chains.push({ ticker, spot: parsed.spot, expiry: parsed.expiry, rows: parsed.rows });
  }
  if (!chains.length) return null;

  return {
    contractVersion: 'options-owner-state/v1',
    toolId: 'options-flow-feed-lab',
    asOf: new Date(latestMs).toISOString(),
    source: 'same-origin options snapshot (data/options)',
    nowMs: latestMs,
    chains
  };
}

/* ── ai-capex-strategy-lab: the sleeve the page's own provider publishes ────────────────────────── */

/**
 * The committed supplier universe the page fetches at init, or null. Its OWN `asOf` is what the
 * owner state publishes once the page applies it, so the brief never stamps a cutoff of its own.
 */
export function aiCapexUniverse(root) {
  return readJson(root, 'ai-capex-universe.json');
}

/**
 * The page publishes `ai-capex-portfolio-owner-state/v1` from its OWN live sleeve — the applied
 * preset, this page's scenario/regime/trigger/runway tables, and the universe actually in memory.
 * None of that exists in Node, so the page's own functions are INJECTED and driven here exactly as
 * the page's init drives them: apply the committed universe, then apply the page's own default
 * preset. Not one formula is restated — every expected return, horizon volatility, crowding haircut
 * and as-of below is produced by the owning page's own code.
 *
 * Ordering note: the page applies the preset first and the fetched universe second, because its
 * `byTk` map is already built at load. In Node the map is built by `acApplyUniverse` itself (the
 * page's own rebuild line), so the universe is applied first. The two orders agree: the universe
 * step only edits assumptions on existing tickers and appends new ones with `inc:false`, and the
 * preset names only tickers the page's own static asset list already carries.
 *
 * Missing page functions are a wiring fault, not missing evidence, so this throws rather than
 * reading as an honest absence. A universe the page's OWN validator rejects, an empty sleeve, or a
 * sleeve it can price at no horizon all return null so the caller can degrade with a named reason.
 */
export function aiCapexOwnerState(root, options = {}) {
  const page = options.page;
  const required = ['acApplyUniverse', 'applyPreset', 'aiCapexOwnerState'];
  if (!page || required.some((name) => typeof page[name] !== 'function')) {
    throw new TypeError(`aiCapexOwnerState requires the owning page\u2019s own ${required.join(', ')}`);
  }
  const universe = options.universe !== undefined ? options.universe : aiCapexUniverse(root);
  if (!page.acApplyUniverse(universe)) return null;
  // 'balanced' is the page's OWN default sleeve — what its init applies when no saved snapshot
  // exists, which is always the case in Node.
  page.applyPreset(options.preset || 'balanced');
  return page.aiCapexOwnerState();
}

/* ── bond-regime-lab: the observed snapshot the page's own view model consumes ──────────────────── */

/** The committed model configuration the page fetches at init: instruments, pairs, sleeves, policy. */
export function bondRegimeConfig(root) {
  return readJson(root, 'bond-regime-universe.json');
}

/**
 * A curve family the page could not observe. The shape is the page's own `loadTreasuryCurves`
 * unavailable branch, carrying the source id and rights the committed configuration declares for
 * that family so the absence is attributable rather than anonymous.
 *
 * `retrievedAt` stays null on purpose: nothing was retrieved. Stamping the run's clock here would
 * read as a fetch that happened and returned nothing, which is a different fact.
 */
export function unavailableCurveFamily(policy, errorCode) {
  return {
    state: 'unavailable', rows: [], observedAt: null, retrievedAt: null,
    sourceId: policy ? policy.id : null, sourceUrl: null,
    rights: policy ? policy.rights : null, persistence: 'none', errorCode
  };
}

/**
 * The committed official curve artifact, or `null` when it is absent or
 * unparsable. Assembles an INPUT only — no classification and no freshness
 * verdict, both of which belong to the caller.
 */
export function officialCurveArtifact(root) {
  const target = path.join(root, 'data', 'curves', 'us-treasury', 'curve.json');
  if (!existsSync(target)) return null;
  try {
    return JSON.parse(readFileSync(target, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * The page holds `runtime.observedSnapshot` — `{bars, barMeta, treasuryChanges, confirmations,
 * nominalCurve, realCurve}` — filled by `readCachedBars` out of the RLDATA browser cache and by
 * `loadTreasuryCurves` out of a live Treasury fetch. Neither exists in Node, so the SAME shape is
 * rebuilt here from the committed same-origin bar snapshots the browser cache is filled from.
 *
 * This assembles INPUTS only. Not one classification, ratio, curve or scenario term is computed
 * here; the caller hands this straight to the page's own `computeBondLabViewModel`.
 *
 * Honest absences, each carried rather than filled:
 *   • nominalCurve / realCurve — the page reads these live from home.treasury.gov and persists them
 *     to browser cache only. No Treasury observation is committed to this repo, so both families are
 *     published `unavailable` under their configured source ids. The model's own curve, impulse and
 *     inflation classifiers then return "Unavailable" of their own accord.
 *   • confirmations — the OAS and financial-conditions families are declared
 *     `user-observation-or-unavailable` with `persistence: memory-only`, so there is nothing on disk
 *     to read and the list is empty.
 *   • treasuryChanges — left empty; `computeBondLabViewModel` derives it itself when nominal rows
 *     are present, and inventing a rate change here would be exactly the reimplementation this
 *     module refuses.
 *
 * `options.nominalCurve`, `options.realCurve` and `options.confirmations` let a caller supply
 * evidence the repo does not commit, so the indeterminacy above can be proven to be COMPUTED from
 * absent evidence rather than hard-coded.
 *
 * Returns null when the configuration is unreadable or no instrument has committed bars.
 */
export function bondRegimeOwnerState(root, options = {}) {
  const config = options.config !== undefined ? options.config : bondRegimeConfig(root);
  if (!config || !Array.isArray(config.instruments) || !config.instruments.length) return null;

  const maxAgeHours = config.barPolicy && Number.isFinite(config.barPolicy.maxAgeHours) ? config.barPolicy.maxAgeHours : null;
  const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
  const bars = {}, barMeta = {};
  let latestObservedAt = null;

  for (const instrument of config.instruments) {
    const ticker = instrument.ticker;
    const snapshot = readJson(root, `data/bars/${ticker}.json`);
    const rows = snapshot && Array.isArray(snapshot.rows) ? snapshot.rows : [];
    const fetchedMs = snapshot ? Date.parse(String(snapshot.fetched || snapshot.asof || '')) : NaN;
    const observedAt = rows.length ? new Date(rows[rows.length - 1].t).toISOString().slice(0, 10) : null;
    if (rows.length) bars[ticker] = rows.slice();
    barMeta[ticker] = {
      // The configuration declares the adjustment each instrument's price series must carry; the
      // page's own ratio builder refuses a pair whose two legs disagree, so this is passed through
      // verbatim rather than assumed.
      adjustment: instrument.priceAdjustmentExpected,
      freshness: !rows.length ? 'missing'
        : (maxAgeHours === null || (Number.isFinite(fetchedMs) && nowMs - fetchedMs <= maxAgeHours * 3600e3) ? 'fresh' : 'stale'),
      observedAt,
      retrievedAt: Number.isFinite(fetchedMs) ? new Date(fetchedMs).toISOString() : null,
      sourceId: snapshot ? snapshot.src || null : null,
      rights: 'unverified',
      persistence: 'same-origin-snapshot',
      errorCode: rows.length ? null : 'BRL-BARS-UNAVAILABLE'
    };
    if (observedAt && (latestObservedAt === null || observedAt > latestObservedAt)) latestObservedAt = observedAt;
  }
  if (!Object.keys(bars).length) return null;

  const policies = config.sourcePolicies || {};
  return {
    contractVersion: 'bond-regime-observed-snapshot/v1',
    toolId: 'bond-regime-lab',
    asOf: latestObservedAt,
    source: 'bond-regime-universe.json model configuration + same-origin daily bar snapshots (data/bars)',
    bars,
    barMeta,
    treasuryChanges: {},
    confirmations: Array.isArray(options.confirmations) ? options.confirmations : [],
    nominalCurve: options.nominalCurve !== undefined ? options.nominalCurve : unavailableCurveFamily(policies.nominalCurve, 'BRL-CURVE-NOMINAL-UNAVAILABLE'),
    realCurve: options.realCurve !== undefined ? options.realCurve : unavailableCurveFamily(policies.realCurve, 'BRL-OPTIONAL-UNAVAILABLE')
  };
}
