#!/usr/bin/env node
/*
 * fetch-bars.mjs — same-origin daily-bar snapshots for the bar-driven tools
 * (Market Heatmap, ETF Momentum, Sector, Swing, Intraday, the brief roll-ups).
 *
 * Runs in Node (no browser CORS), so it reads Yahoo daily bars DIRECTLY and
 * writes compact JSON to data/bars/<TICKER>.json. GitHub Pages then serves those
 * from the site's OWN origin, so the browser (rldata.js ensureBars) reads them
 * with NO proxy — reliable on Pages, where the public CORS proxies are flaky/blocked.
 *
 * The universe is the UNION of the committed universe files (sector map,
 * watchlist, brief track, core index/factor ETFs) so one pull feeds every tool.
 * This is the sole Yahoo-history owner; option snapshots attach these canonical
 * rows. Committed date+window keys make the cache reusable across machines.
 *
 * Ad-hoc runs are best-effort. Complete scheduled runs exit nonzero unless the
 * current-window index passes the strict completed-session validator.
 *
 * PRICE BASIS (BUG-012, decided 2026-08-19 — Option B of design.md section 2).
 * A row's `o`, `h`, `l` and `c` are ALL raw quotes, on one basis. The adjusted (total-return) close
 * is carried beside them in its own field, `ac`. It used to be `c` that carried the adjusted value
 * while its three siblings stayed raw, so after any dividend the close sat below the raw low and the
 * row described a session that never happened. Two properties follow from Option B and are the
 * reason it was chosen: a published historical row stops changing when a later dividend lands, and
 * a consumer that needs adjustment and reads `c` computes a visibly different number rather than
 * silently drifting.
 *
 * The invariant is enforced when the row is written, at two granularities. A VENDOR row that fails
 * it is quarantined on its own: that session is left out, recorded in `quarantinedSessions` and
 * `quarantinedRows` with the relation that failed and the prices Yahoo published, and the symbol's
 * other rows are written normally. Refusing the whole symbol instead — which this script did until
 * BUG-012 scope 1 — let one bad bar hold 517 good ones hostage forever, because the retry fails
 * identically every time. A row this script CONSTRUCTED and then failed the invariant is a
 * different thing, our defect rather than the vendor's, and still aborts the symbol outright.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { assertCoherentBar, isCoherentBar, partitionCoherentBars } from './validate-bars-coherence.mjs';

const OUT_DIR = 'data/bars';

/* One-time corpus repair (BUG-012 INV-012B-3). Fixing the writer alone leaves the 71,714 rows that
 * were already written on the mixed basis in place, so the read-time validator keeps refusing them.
 * The raw close is NOT recoverable arithmetically — `adjustmentFactor` is a single scalar for the
 * latest adjustment while Yahoo's factor varies by date, and it is not even persisted — so the only
 * sound repair is to re-fetch through the corrected writer. The range widens because a file retains
 * the last 520 rows and a 2y pull returns roughly 500: every retained row must come back fresh, or
 * the stale ones survive the merge and the file stays incoherent. */
const REPAIR_COHERENCE = process.argv.includes('--repair-coherence');
const RANGE = REPAIR_COHERENCE ? '5y' : '2y';
const FETCH_CONCURRENCY = positiveInteger(process.env.BAR_FETCH_CONCURRENCY, 8);
const FETCH_TIMEOUT_MS = positiveInteger(process.env.BAR_FETCH_TIMEOUT_MS, 20000);
const FETCH_ATTEMPTS = positiveInteger(process.env.BAR_FETCH_ATTEMPTS, 3);
const FETCH_RETRY_BASE_MS = positiveInteger(process.env.BAR_FETCH_RETRY_BASE_MS, 500);
const CACHE_WINDOW = process.env.BRIEF_WINDOW || null;
const CACHE_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());
const MISSING_ONLY = process.argv.includes('--missing-only');
const COMPLETE_RUN = process.env.BRIEF_REQUIRE_COMPLETE_RUN === '1';
const XNYS_CALENDAR = 'data/calendars/xnys/calendar.json';

/* Basket/theme ids that live in the universe files for grouping/labeling, plus
 * delisted names — NONE are tradeable Yahoo tickers, so never fetch them (they
 * only produce 404 noise and dead-proxy fallbacks in the browser tools). */
const NON_TICKERS = new Set(['AIINFRA', 'BANKS', 'HOMEBUILD', 'MAG7', 'MEMORY', 'NUCLEAR', 'SEMIS', 'SOFTWARE', 'HES']);

function readJSON(f, fallback) { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return fallback; } }
function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function sessionDateFromMs(value) {
  return Number.isFinite(value) ? new Date(value).toISOString().slice(0, 10) : null;
}
function isSessionBoundSymbol(sym) {
  return !sym.endsWith('-USD') && !sym.endsWith('=X');
}
function resolveExpectedSession() {
  const overrideDate = process.env.BAR_EXPECTED_SESSION_DATE || null;
  const overrideStart = process.env.BAR_EXPECTED_SESSION_START_UTC || null;
  const overrideEnd = process.env.BAR_EXPECTED_SESSION_END_UTC || null;
  if (overrideDate && overrideStart && overrideEnd) {
    return { tradingDate: overrideDate, dateState: 'regular', regular: { startUtc: overrideStart, endUtc: overrideEnd } };
  }
  const calendar = readJSON(XNYS_CALENDAR, null);
  const rows = calendar && Array.isArray(calendar.rows) ? calendar.rows : [];
  const now = Date.now();
  const eligible = rows.filter((row) =>
    (row.dateState === 'regular' || row.dateState === 'early-close')
    && row.regular
    && Number.isFinite(Date.parse(row.regular.endUtc))
    && Date.parse(row.regular.endUtc) <= now
    && (!overrideDate || row.tradingDate === overrideDate)
  );
  return eligible.length ? eligible[eligible.length - 1] : null;
}

const EXPECTED_SESSION = resolveExpectedSession();
const EXPECTED_SESSION_DATE = EXPECTED_SESSION && EXPECTED_SESSION.tradingDate;

/* union of the tickers the bar tools need, from the committed universe files. */
function universe() {
  const set = new Set();
  const add = (t) => { if (typeof t === 'string') { const s = t.trim().toUpperCase(); if (s) set.add(s); } };
  const su = readJSON('sector-universe.json', {});
  (su.entries || []).forEach((e) => { add(e.ticker || e.id); add(e.etf); (e.members || []).forEach(add); });
  Object.values(su.sectorMap || {}).forEach((s) => (s.constituents || []).forEach((c) => add(c.ticker)));
  (readJSON('watchlist.json', {}).items || []).forEach((it) => add(it.ticker));
  const cfg = readJSON('market-brief.config.json', {});
  const tr = cfg.track || {};
  [].concat(tr.indexes || [], tr.sectors || [], cfg.benchmarks || []).forEach(add);
  (tr.groups || []).forEach((group) => { add(group && group.etf); (group && group.members || []).forEach(add); });
  ['SPY', 'QQQ', 'IWM', 'DIA', 'RSP', 'SPMO', 'VGT', 'MTUM'].forEach(add);
  const eu = readJSON('etf-universe.json', {});
  (eu.entries || eu.etfs || []).forEach((e) => add(typeof e === 'string' ? e : (e && (e.ticker || e.id))));
  const fu = readJSON('fx-regime-universe.json', {});
  (fu.currencies || []).forEach((currency) => add(currency && currency.usdLeg && currency.usdLeg.symbol));
  (fu.broadDollarSeries || []).forEach((series) => add(series && series.symbol));
  (fu.directPairs || []).forEach((pair) => add(pair && pair.symbol));
  const gu = readJSON('global-rotation-universe.json', {});
  (gu.entries || []).forEach((e) => { add(e && e.ticker); add(e && e.currencyProxy); });
  (gu.benchmarks || []).forEach((e) => add(typeof e === 'string' ? e : (e && e.ticker)));
  const ru = readJSON('real-assets-universe.json', {});
  (ru.entries || []).forEach((e) => add(e && (e.symbol || e.ticker)));
  (ru.benchmarks || []).forEach(add);
  const bu = readJSON('bond-regime-universe.json', {});
  (bu.instruments || []).forEach((instrument) => add(instrument && instrument.ticker));
  const ou = readJSON('options-structure-universe.json', {});
  (ou.entries || []).forEach((entry) => add(entry && entry.alt && entry.alt.yahoo ? entry.alt.yahoo : entry && entry.id));
  return [...set].filter((s) => !NON_TICKERS.has(s)).sort();
}

/* The coherence invariant is a property of the CORPUS, not of the tracked universe. Three files —
   symbols dropped from the universe files since they were last written — sit under data/bars with
   incoherent rows and no route back into `universe()`, so a repair scoped to the universe alone
   could never reach zero and the guard would stay red against work that was in fact finished.
   Repairing what is on disk keeps the repair's reach and the guard's reach the same set. */
function repairUniverse() {
  const set = new Set(universe());
  for (const name of readdirSync(OUT_DIR)) {
    if (!name.endsWith('.json') || name === 'index.json') continue;
    set.add(name.slice(0, -'.json'.length));
  }
  return [...set].sort();
}

async function getJSON(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (research-lab bars snapshot)' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
      });
      if (r.ok) return r.json();
      lastError = new Error('HTTP ' + r.status);
      if (r.status !== 429 && (r.status < 500 || r.status >= 600)) throw lastError;
    } catch (error) {
      lastError = error;
    }
    if (attempt < FETCH_ATTEMPTS) await new Promise((resolveDelay) => setTimeout(resolveDelay, FETCH_RETRY_BASE_MS * attempt));
  }
  throw lastError || new Error('request failed');
}
function eventFallsOn(events, eventKind, tradingDate) {
  for (const event of Object.values(events && events[eventKind] || {})) {
    if (sessionDateFromMs(Number(event && event.date) * 1000) === tradingDate) return true;
  }
  return false;
}
function dailySessionState(j, tradingDate) {
  const result = j && j.chart && j.chart.result && j.chart.result[0];
  const timestamps = result && Array.isArray(result.timestamp) ? result.timestamp : [];
  const quote = result && result.indicators && Array.isArray(result.indicators.quote) ? result.indicators.quote[0] || {} : {};
  for (let index = 0; index < timestamps.length; index++) {
    if (sessionDateFromMs(timestamps[index] * 1000) !== tradingDate) continue;
    return quote.close && Number.isFinite(quote.close[index]) ? 'observed' : 'declared-null';
  }
  return 'absent';
}
function trimBars(j, cutoffDate) {
  const r = j && j.chart && j.chart.result && j.chart.result[0];
  if (!r || !r.timestamp) return null;
  const ts = r.timestamp, q = (r.indicators && r.indicators.quote && r.indicators.quote[0]) || {};
  const adj = (r.indicators.adjclose && r.indicators.adjclose[0] && r.indicators.adjclose[0].adjclose) || null;
  const out = [];
  let adjustmentFactor = 1;
  for (let i = 0; i < ts.length; i++) {
    const rowDate = sessionDateFromMs(ts[i] * 1000);
    if (cutoffDate && rowDate > cutoffDate) continue;
    const hasRawQuotes = !!q.close;
    const rawClose = hasRawQuotes ? q.close[i] : null;
    const adjClose = adj && Number.isFinite(adj[i]) ? adj[i] : null;
    /* c comes from the raw series like its three siblings. When the vendor supplies no raw quote
       series at all, the adjusted close is the only close there is and o/h/l fall back to it, so the
       row is still quoted wholly on one basis. When the raw series EXISTS but this session's close is
       null the row is skipped rather than back-filled from `adj`: that substitution is precisely what
       put an adjusted close beside a raw low. The pipeline already treats a null raw close as a
       non-observation — `dailySessionState` reports it as `declared-null` and the intraday
       reconstruction path handles it. */
    const c = Number.isFinite(rawClose) ? rawClose : (hasRawQuotes ? null : adjClose);
    if (!Number.isFinite(c)) continue;
    if (Number.isFinite(rawClose) && rawClose !== 0 && Number.isFinite(adjClose)) adjustmentFactor = adjClose / rawClose;
    const row = { t: ts[i] * 1000, o: q.open ? q.open[i] : c, h: q.high ? q.high[i] : c, l: q.low ? q.low[i] : c, c, v: (q.volume ? q.volume[i] : 0) || 0 };
    /* `ac` is written whenever the vendor supplies it, including on the majority of sessions where it
       equals `c`. Writing it only when it differs would make its ABSENCE carry meaning, and a
       consumer reading `row.ac` would get undefined on an unadjusted session unless it knew an
       unwritten fallback rule — the same shape of implicit contract that caused this bug. */
    if (Number.isFinite(adjClose)) row.ac = adjClose;
    out.push(row);
  }
  return out.length ? { rows: out, adjustmentFactor, events: r.events || {}, meta: r.meta || {} } : null;
}
function mergeRows(existingRows, freshRows, cutoffDate) {
  const byTimestamp = new Map();
  for (const row of Array.isArray(existingRows) ? existingRows : []) {
    if (row && Number.isFinite(row.t) && (!cutoffDate || sessionDateFromMs(row.t) <= cutoffDate)) byTimestamp.set(row.t, row);
  }
  for (const row of Array.isArray(freshRows) ? freshRows : []) {
    if (row && Number.isFinite(row.t) && (!cutoffDate || sessionDateFromMs(row.t) <= cutoffDate)) byTimestamp.set(row.t, row);
  }
  return [...byTimestamp.values()].sort((a, b) => a.t - b.t).slice(-520);
}
function reconstructSession(j, session, adjustmentFactor) {
  const result = j && j.chart && j.chart.result && j.chart.result[0];
  if (!result || !Array.isArray(result.timestamp) || !result.indicators || !Array.isArray(result.indicators.quote)) return { state: 'unavailable' };
  const start = Date.parse(session.regular.startUtc), end = Date.parse(session.regular.endUtc);
  const periods = Array.isArray(result.meta && result.meta.tradingPeriods) ? result.meta.tradingPeriods.flat() : [];
  if (!periods.some((period) => period && period.start * 1000 <= start && period.end * 1000 >= end)) return { state: 'unavailable' };
  const q = result.indicators.quote[0] || {};
  let open = null, high = null, low = null, close = null, volume = 0, count = 0, firstObserved = null, lastObserved = null;
  const expectedBars = Math.ceil((end - start) / (5 * 60 * 1000));
  for (let i = 0; i < result.timestamp.length; i++) {
    const timestamp = result.timestamp[i] * 1000;
    if (timestamp < start || timestamp >= end) continue;
    const rowClose = q.close && q.close[i];
    if (!Number.isFinite(rowClose)) continue;
    const rowOpen = q.open && Number.isFinite(q.open[i]) ? q.open[i] : rowClose;
    const rowHigh = q.high && Number.isFinite(q.high[i]) ? q.high[i] : Math.max(rowOpen, rowClose);
    const rowLow = q.low && Number.isFinite(q.low[i]) ? q.low[i] : Math.min(rowOpen, rowClose);
    if (open === null) open = rowOpen;
    if (firstObserved === null) firstObserved = timestamp;
    lastObserved = timestamp;
    high = high === null ? rowHigh : Math.max(high, rowHigh);
    low = low === null ? rowLow : Math.min(low, rowLow);
    close = rowClose;
    if (q.volume && Number.isFinite(q.volume[i])) volume += q.volume[i];
    count += 1;
  }
  if (count === 0) return { state: 'zero-observed', sourceBars: 0, expectedBars };
  if (![open, high, low, close].every(Number.isFinite)) return { state: 'unavailable', sourceBars: count, expectedBars };
  const completeCoverage = count >= Math.floor(expectedBars * 0.8) && firstObserved <= start + 15 * 60 * 1000 && lastObserved >= end - 15 * 60 * 1000;
  const state = completeCoverage ? 'observed' : 'thin-observed';
  return {
    state,
    /* Same basis rule as trimBars: o, h, l and c are the raw intraday prices and the adjustment is
       carried in `ac`. Applying the factor to `close` alone here reproduced the defect on every
       reconstructed session — the three siblings beside it were never scaled. */
    row: {
      t: start, o: open, h: high, l: low, c: close, ac: close * adjustmentFactor, v: volume,
      sourceBars: count, sourceExpectedBars: expectedBars, sourceCoverage: count / expectedBars,
      sourceFirstObservedAt: new Date(firstObserved).toISOString(), sourceLastObservedAt: new Date(lastObserved).toISOString(),
      sourceState: state
    }
  };
}
async function mapConcurrent(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index]);
    }
  }
  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, runWorker));
  return results;
}

/* Symbols whose write was refused outright because a row this script CONSTRUCTED came out
 * incoherent. Collected rather than counted so the run summary can name what failed, and so main()
 * can fail the run after the index is written. */
const coherenceRejections = [];

/* Sessions refused individually because the VENDOR's own raw bar for them is incoherent. Kept apart
 * from the list above because the two mean different things and warrant different outcomes: a
 * constructed row that fails the invariant is our defect and fails the run, while a vendor row that
 * fails it is an upstream data-quality fact this script can only report. Failing the run on the
 * second would fail it every day — Yahoo's FX series carries dozens of such bars going back years —
 * and a red that is always red is one nobody reads. So these are LOUD but not fatal: named per
 * symbol in the run summary, counted in index.json, and recorded in each symbol's own file. */
const coherenceQuarantines = [];

async function refreshSymbol(sym) {
  const existingFile = OUT_DIR + '/' + sym + '.json';
  const existing = readJSON(existingFile, null), existingRows = existing && existing.rows;
  const sessionBound = isSessionBoundSymbol(sym);
  const enforceSession = sessionBound && !!EXPECTED_SESSION_DATE;
  const existingZeroObserved = enforceSession && existing && existing.sessionState === 'zero-observed' && existing.expectedSessionDate === EXPECTED_SESSION_DATE && Array.isArray(existing.zeroObservedSessions) && existing.zeroObservedSessions.includes(EXPECTED_SESSION_DATE);
  const existingThinObserved = enforceSession && existing && existing.sessionState === 'thin-observed' && existing.asof === EXPECTED_SESSION_DATE && Array.isArray(existing.thinObservedSessions) && existing.thinObservedSessions.includes(EXPECTED_SESSION_DATE);
  const sessionCurrent = !enforceSession || (existing && existing.asof === EXPECTED_SESSION_DATE) || existingZeroObserved || existingThinObserved;
  const sameWindow = CACHE_WINDOW && existing && existing.refreshDate === CACHE_DATE && existing.refreshWindow === CACHE_WINDOW;
  const sameCompletedSession = enforceSession && ((existing && existing.asof === EXPECTED_SESSION_DATE) || existingZeroObserved || existingThinObserved);
  /* A repair run must re-fetch. Both short-circuits below exist to avoid redundant vendor calls when
     the file already holds the session being asked for, and both would skip every already-current
     file — which is exactly the set that needs rewriting on the corrected basis. */
  if (!REPAIR_COHERENCE && existing && Array.isArray(existingRows) && existingRows.length && sessionCurrent && (sameWindow || sameCompletedSession)) {
    const reuseReason = sameWindow ? CACHE_DATE + '/' + CACHE_WINDOW : 'completed session ' + EXPECTED_SESSION_DATE;
    console.log('reuse ' + sym + '  bars=' + existingRows.length + ' (git cache ' + reuseReason + ')');
    const cachedSessionState = existingZeroObserved ? 'zero-observed' : existingThinObserved ? 'thin-observed' : 'observed';
    return { sym, n: existingRows.length, last: existingRows[existingRows.length - 1].c, asof: existing.asof, sessionDate: enforceSession ? EXPECTED_SESSION_DATE : existing.asof, sessionState: cachedSessionState, zeroObserved: existingZeroObserved, thinObserved: existingThinObserved, quarantined: Array.isArray(existing.quarantinedSessions) && existing.quarantinedSessions.length > 0, cached: true, sessionCached: !sameWindow && sameCompletedSession, reconstructed: Array.isArray(existing.reconstructedSessions) && existing.reconstructedSessions.length > 0 };
  }
  if (!REPAIR_COHERENCE && MISSING_ONLY && existsSync(existingFile)) {
    if (Array.isArray(existingRows) && existingRows.length) {
      console.log('keep ' + sym + '  bars=' + existingRows.length);
      return { sym, n: existingRows.length, last: existingRows[existingRows.length - 1].c, asof: existing.asof };
    }
  }

  try {
    const daily = await getJSON('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=' + RANGE + '&includeAdjustedClose=true&events=div%2Csplits');
    const parsed = trimBars(daily, enforceSession ? EXPECTED_SESSION_DATE : null);
    if (!parsed) throw new Error('no daily bars');
    /* In a repair run an existing row written on the old mixed basis must not survive the merge. A
       row whose timestamp the widened pull returns is replaced anyway; one it does not return is
       unrepairable — its raw close no longer exists anywhere — so it is dropped and COUNTED. A
       silent drop here would be this bug wearing a different hat, which is why the count is printed
       per symbol and never folded into a success line. */
    const mergeBase = REPAIR_COHERENCE ? (Array.isArray(existingRows) ? existingRows.filter(isCoherentBar) : []) : existingRows;
    const droppedUnrepairable = REPAIR_COHERENCE && Array.isArray(existingRows) ? existingRows.length - mergeBase.length : 0;
    /* Quarantine is applied HERE, on the merged vendor rows, rather than at the write below. Later
       would be too late to stay honest: `asof`, the session-enforcement branch and every derived
       session list are computed from `bars`, so refusing a row after they are built would leave the
       record naming a session the file no longer contains. Refusing first means everything
       downstream describes only rows that were actually kept. */
    const vendorBars = partitionCoherentBars(mergeRows(mergeBase, parsed.rows, enforceSession ? EXPECTED_SESSION_DATE : null));
    if (!vendorBars.coherent.length) throw new Error('every merged bar is incoherent (' + vendorBars.quarantined.length + ' quarantined), so there is nothing trustworthy to write');
    let bars = vendorBars.coherent, reconstructed = false, zeroObserved = false, sessionState = 'observed';
    let asof = sessionDateFromMs(bars[bars.length - 1].t);
    /* The expected session's own bar being the incoherent one is the common case, because a bar is
       least settled on the day it closes. It is NOT grounds to abort the symbol, and it is not
       grounds to reach for the intraday reconstruction below either: that path exists to recover a
       session the daily feed declared NULL, whereas here the feed declared a bar and we refused it.
       Substituting a differently-sourced bar for one we rejected would publish a session we do not
       actually trust. The session is recorded as quarantined and left absent instead. */
    const quarantinedExpectedSession = enforceSession && vendorBars.quarantined.some((entry) => entry.session === EXPECTED_SESSION_DATE);
    if (quarantinedExpectedSession) sessionState = 'quarantined';
    if (enforceSession && asof !== EXPECTED_SESSION_DATE && !quarantinedExpectedSession) {
      if (!EXPECTED_SESSION) throw new Error('expected XNYS session unavailable');
      if (eventFallsOn(parsed.events, 'splits', EXPECTED_SESSION_DATE)) throw new Error('split blocks intraday reconstruction for ' + EXPECTED_SESSION_DATE);
      const intraday = await getJSON('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=5m&range=5d&includePrePost=false&events=div%2Csplits');
      const reconstructionFactor = eventFallsOn(parsed.events, 'dividends', EXPECTED_SESSION_DATE) ? 1 : parsed.adjustmentFactor;
      const repair = reconstructSession(intraday, EXPECTED_SESSION, reconstructionFactor);
      const dailyState = dailySessionState(daily, EXPECTED_SESSION_DATE);
      if ((repair.state === 'observed' || repair.state === 'thin-observed') && dailyState === 'declared-null') {
        bars = mergeRows(bars.filter((row) => sessionDateFromMs(row.t) !== EXPECTED_SESSION_DATE), [repair.row], EXPECTED_SESSION_DATE);
        reconstructed = true;
        asof = EXPECTED_SESSION_DATE;
        sessionState = repair.state;
      } else if (repair.state === 'zero-observed' && dailyState === 'declared-null') {
        zeroObserved = true;
        sessionState = 'zero-observed';
      } else {
        throw new Error('completed session ' + EXPECTED_SESSION_DATE + ' unavailable from daily and intraday feeds (' + repair.state + ')');
      }
    }
    if (enforceSession && asof !== EXPECTED_SESSION_DATE && !zeroObserved && !quarantinedExpectedSession) throw new Error('latest completed session is ' + asof + ', expected ' + EXPECTED_SESSION_DATE);
    const reconstructedSessions = [...new Set(bars.filter((row) => Number.isInteger(row.sourceBars) && row.sourceBars > 0).map((row) => sessionDateFromMs(row.t)))];
    const thinObservedSessions = [...new Set(bars.filter((row) => row.sourceState === 'thin-observed').map((row) => sessionDateFromMs(row.t)))];
    const freshDates = new Set(bars.map((row) => sessionDateFromMs(row.t)));
    const zeroObservedSessions = [...new Set([...(Array.isArray(existing && existing.zeroObservedSessions) ? existing.zeroObservedSessions : []), ...(zeroObserved ? [EXPECTED_SESSION_DATE] : [])])].filter((date) => !freshDates.has(date));
    /* The quarantine record, deliberately shaped like its three siblings above rather than as a
       parallel invention: `quarantinedSessions` is a list of session dates, so a consumer that
       already walks reconstructed/thin/zero sessions to decide how to render a session walks this
       one the same way. `quarantinedRows` carries what a bare date cannot — the relation that failed
       and the four prices the vendor published — because the whole point is that a reader who finds
       a gap can see it was REFUSED rather than merely missing. Both are derived from one list so
       they cannot drift into disagreeing about which sessions were quarantined.

       Prior entries carry forward, because a session refused last run and not returned at all this
       run is still absent for the same reason and its explanation should not evaporate. Two filters
       bound that: a session that comes back coherent drops out (it is in `freshDates`), and one that
       has aged out of the retained window drops out too, so the list cannot grow without limit.

       The floor is the earliest session the file DESCRIBES, not the earliest it retains. Those
       differ exactly when the oldest rows are the refused ones: `bars[0]` then moves later, and a
       floor taken from it would discard the entries this run just created, quarantining a leading
       session and forgetting it in the same breath. EA is that shape on disk — its first row and
       its first violation are the same 2024-07-25 session. */
    const retainedFrom = [sessionDateFromMs(bars[0].t), ...vendorBars.quarantined.map((entry) => entry.session)]
      .filter(Boolean).sort()[0];
    const quarantinedByTimestamp = new Map();
    for (const entry of [...(Array.isArray(existing && existing.quarantinedRows) ? existing.quarantinedRows : []), ...vendorBars.quarantined]) {
      if (entry && entry.session && Number.isFinite(entry.t)) quarantinedByTimestamp.set(entry.t, entry);
    }
    const quarantinedRows = [...quarantinedByTimestamp.values()]
      .filter((entry) => !freshDates.has(entry.session) && entry.session >= retainedFrom)
      .sort((a, b) => a.t - b.t);
    const quarantinedSessions = [...new Set(quarantinedRows.map((entry) => entry.session))];
    if (quarantinedRows.length) coherenceQuarantines.push({ sym, count: quarantinedRows.length, sessions: quarantinedSessions, first: quarantinedRows[0] });
    const record = { sym, interval: '1d', range: RANGE, asof, fetched: new Date().toISOString(), refreshDate: CACHE_DATE, refreshWindow: CACHE_WINDOW, expectedSessionDate: enforceSession ? EXPECTED_SESSION_DATE : null, sessionState, src: reconstructedSessions.length ? 'yahoo-daily+intraday-repair' : zeroObserved ? 'yahoo-zero-observed-session' : 'yahoo', reconstructedSessions, thinObservedSessions, zeroObservedSessions, quarantinedSessions, quarantinedRows, rows: bars };
    /* The write-time half of the BUG-012 guard, and now a narrower claim than it once made. Vendor
       rows were already refused individually above, so a row that reaches here and fails is one this
       script CONSTRUCTED — the intraday reconstruction is the only other writer of a bar. That is
       our defect rather than an upstream fact, so it aborts the symbol outright instead of being
       filed as quarantined vendor noise: the file is not written, the catch below keeps the
       last-good copy and logs why, and main() fails the run afterwards so a scheduled complete run
       exits nonzero rather than reporting a clean pass over a skipped file. */
    try {
      for (const row of record.rows) assertCoherentBar(row, sym);
    } catch (guardError) {
      coherenceRejections.push({ sym, detail: guardError.message });
      throw guardError;
    }
    writeFileSync(existingFile, JSON.stringify(record));
    console.log('ok   ' + sym + '  bars=' + bars.length + '  asof=' + asof + '  session=' + (enforceSession ? EXPECTED_SESSION_DATE : asof) + '/' + record.sessionState + '  last=' + bars[bars.length - 1].c + (droppedUnrepairable ? '  (dropped ' + droppedUnrepairable + ' unrepairable row(s))' : '') + (quarantinedRows.length ? '  (quarantined ' + quarantinedRows.length + ' incoherent vendor row(s): ' + quarantinedSessions.join(', ') + ')' : '') + (reconstructed ? '  (yahoo intraday repair)' : zeroObserved ? '  (yahoo zero observed trades)' : '  (yahoo)'));
    return { sym, n: bars.length, last: bars[bars.length - 1].c, asof, sessionDate: enforceSession ? EXPECTED_SESSION_DATE : asof, sessionState, zeroObserved, thinObserved: sessionState === 'thin-observed', quarantined: quarantinedRows.length > 0, quarantinedCount: quarantinedRows.length, reconstructed: reconstructedSessions.length > 0, repairedThisRun: reconstructed, droppedUnrepairable };
  } catch (err) {
    if (Array.isArray(existingRows) && existingRows.length) {
      console.log('kept ' + sym + '  bars=' + existingRows.length + ' (last-good; ' + ((err && err.message) || err) + ')');
      return { sym, n: existingRows.length, last: existingRows[existingRows.length - 1].c, asof: existing.asof || sessionDateFromMs(existingRows[existingRows.length - 1].t), carried: true };
    }
    console.log('FAIL ' + sym + ': ' + ((err && err.message) || err));
    return null;
  }
}

async function main() {
  if (COMPLETE_RUN && !EXPECTED_SESSION_DATE) throw new Error('cannot resolve the latest completed XNYS session');
  mkdirSync(OUT_DIR, { recursive: true });
  const syms = REPAIR_COHERENCE ? repairUniverse() : universe();
  console.log('refreshing ' + syms.length + ' canonical ticker histories with concurrency=' + FETCH_CONCURRENCY + (REPAIR_COHERENCE ? '  (coherence repair: range=' + RANGE + ', cache reuse bypassed, corpus files included)' : ''));
  const idx = (await mapConcurrent(syms, FETCH_CONCURRENCY, refreshSymbol)).filter(Boolean);
  const returned = new Set(idx.map((row) => row.sym));
  const missing = syms.filter((sym) => !returned.has(sym));
  const carriedCount = idx.filter((row) => row.carried).length;
  const reconstructedCount = idx.filter((row) => row.reconstructed).length;
  const sessionReuseCount = idx.filter((row) => row.sessionCached).length;
  const zeroObservedCount = idx.filter((row) => row.zeroObserved).length;
  const thinObservedCount = idx.filter((row) => row.thinObserved).length;
  const droppedUnrepairableCount = idx.reduce((total, row) => total + (row.droppedUnrepairable || 0), 0);
  const quarantinedRowCount = coherenceQuarantines.reduce((total, entry) => total + entry.count, 0);
  writeFileSync(OUT_DIR + '/index.json', JSON.stringify({
    updated: new Date().toISOString(), refreshDate: CACHE_DATE, refreshWindow: CACHE_WINDOW,
    expectedSessionDate: EXPECTED_SESSION_DATE,
    expected: syms.length, count: idx.length, freshCount: idx.length - carriedCount,
    carriedCount, reconstructedCount, sessionReuseCount, zeroObservedCount, thinObservedCount,
    quarantinedCount: idx.filter((row) => row.quarantined).length, quarantinedRowCount,
    quarantinedSymbols: coherenceQuarantines.map((entry) => entry.sym).sort(),
    coherenceRejectedCount: coherenceRejections.length,
    coherenceRejectedSymbols: coherenceRejections.map((entry) => entry.sym),
    droppedUnrepairableCount, missing, tickers: idx
  }));
  console.log('\nwrote ' + idx.length + '/' + syms.length + ' bar snapshots to ' + OUT_DIR);
  if (droppedUnrepairableCount) console.log('dropped ' + droppedUnrepairableCount + ' unrepairable row(s) whose raw close the vendor no longer returns');
  /* Named per symbol rather than totalled, because the total alone would say "the vendor is
     imperfect" while the list says WHICH sessions a consumer will not find and why. This is the
     record that keeps the per-row refusal from being a silent drop. */
  if (coherenceQuarantines.length) {
    console.log('quarantined ' + quarantinedRowCount + ' incoherent vendor row(s) across ' + coherenceQuarantines.length + ' symbol(s) \u2014 refused individually, kept out of the corpus, recorded in each file\u2019s quarantinedRows:');
    for (const entry of coherenceQuarantines.sort((a, b) => b.count - a.count || a.sym.localeCompare(b.sym))) {
      console.log('  QUARANTINED ' + entry.sym + '  rows=' + entry.count + '  sessions=' + entry.sessions.join(', ') + '  e.g. ' + entry.first.session + ': ' + entry.first.detail);
    }
  }
  /* Thrown AFTER the index is written so the run's own record of what happened survives the failure,
     and thrown at all so a refused symbol cannot pass as a quiet gap in an otherwise clean summary.
     Only OUR defects reach here — an incoherent vendor row is quarantined above and does not fail
     the run, because that would make the run fail every day on chronic upstream noise and a red that
     is always red gets ignored. main()'s catch maps this to exit 1 for a scheduled complete run and
     exit 0 for an ad-hoc one, which is this script's existing best-effort contract rather than a new
     exception to it. */
  if (coherenceRejections.length) {
    for (const entry of coherenceRejections) console.log('REFUSED ' + entry.sym + ': ' + entry.detail);
    throw new Error(coherenceRejections.length + ' symbol(s) refused for incoherent bars: ' + coherenceRejections.map((entry) => entry.sym).join(', '));
  }
}
main().catch((e) => { console.error('fatal:', e); process.exit(COMPLETE_RUN ? 1 : 0); });
