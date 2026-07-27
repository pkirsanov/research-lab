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
 * Best-effort: a failing ticker is skipped; the process always exits 0.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';

const OUT_DIR = 'data/bars';
const RANGE = '2y';
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
    const rawClose = q.close ? q.close[i] : null;
    const c = (adj && adj[i] != null) ? adj[i] : rawClose;
    if (!Number.isFinite(c)) continue;
    if (Number.isFinite(rawClose) && rawClose !== 0 && adj && Number.isFinite(adj[i])) adjustmentFactor = adj[i] / rawClose;
    out.push({ t: ts[i] * 1000, o: q.open ? q.open[i] : c, h: q.high ? q.high[i] : c, l: q.low ? q.low[i] : c, c, v: (q.volume ? q.volume[i] : 0) || 0 });
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
  if (count === 0) return { state: 'zero-observed', sourceBars: 0 };
  if (count < Math.floor(expectedBars * 0.8) || firstObserved > start + 15 * 60 * 1000 || lastObserved < end - 15 * 60 * 1000 || ![open, high, low, close].every(Number.isFinite)) return { state: 'incomplete', sourceBars: count };
  return { state: 'observed', row: { t: start, o: open, h: high, l: low, c: close * adjustmentFactor, v: volume, sourceBars: count } };
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

async function refreshSymbol(sym) {
  const existingFile = OUT_DIR + '/' + sym + '.json';
  const existing = readJSON(existingFile, null), existingRows = existing && existing.rows;
  const sessionBound = isSessionBoundSymbol(sym);
  const enforceSession = sessionBound && !!EXPECTED_SESSION_DATE;
  const existingZeroObserved = enforceSession && existing && existing.sessionState === 'zero-observed' && existing.expectedSessionDate === EXPECTED_SESSION_DATE && Array.isArray(existing.zeroObservedSessions) && existing.zeroObservedSessions.includes(EXPECTED_SESSION_DATE);
  const sessionCurrent = !enforceSession || (existing && existing.asof === EXPECTED_SESSION_DATE) || existingZeroObserved;
  const sameWindow = CACHE_WINDOW && existing && existing.refreshDate === CACHE_DATE && existing.refreshWindow === CACHE_WINDOW;
  const sameCompletedSession = enforceSession && ((existing && existing.asof === EXPECTED_SESSION_DATE) || existingZeroObserved);
  if (existing && Array.isArray(existingRows) && existingRows.length && sessionCurrent && (sameWindow || sameCompletedSession)) {
    const reuseReason = sameWindow ? CACHE_DATE + '/' + CACHE_WINDOW : 'completed session ' + EXPECTED_SESSION_DATE;
    console.log('reuse ' + sym + '  bars=' + existingRows.length + ' (git cache ' + reuseReason + ')');
    return { sym, n: existingRows.length, last: existingRows[existingRows.length - 1].c, asof: existing.asof, sessionDate: enforceSession ? EXPECTED_SESSION_DATE : existing.asof, sessionState: existingZeroObserved ? 'zero-observed' : 'observed', zeroObserved: existingZeroObserved, cached: true, sessionCached: !sameWindow && sameCompletedSession, reconstructed: Array.isArray(existing.reconstructedSessions) && existing.reconstructedSessions.length > 0 };
  }
  if (MISSING_ONLY && existsSync(existingFile)) {
    if (Array.isArray(existingRows) && existingRows.length) {
      console.log('keep ' + sym + '  bars=' + existingRows.length);
      return { sym, n: existingRows.length, last: existingRows[existingRows.length - 1].c, asof: existing.asof };
    }
  }

  try {
    const daily = await getJSON('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=' + RANGE + '&includeAdjustedClose=true&events=div%2Csplits');
    const parsed = trimBars(daily, enforceSession ? EXPECTED_SESSION_DATE : null);
    if (!parsed) throw new Error('no daily bars');
    let bars = mergeRows(existingRows, parsed.rows, enforceSession ? EXPECTED_SESSION_DATE : null), reconstructed = false, zeroObserved = false;
    let asof = sessionDateFromMs(bars[bars.length - 1].t);
    if (enforceSession && asof !== EXPECTED_SESSION_DATE) {
      if (!EXPECTED_SESSION) throw new Error('expected XNYS session unavailable');
      if (eventFallsOn(parsed.events, 'splits', EXPECTED_SESSION_DATE)) throw new Error('split blocks intraday reconstruction for ' + EXPECTED_SESSION_DATE);
      const intraday = await getJSON('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=5m&range=5d&includePrePost=false&events=div%2Csplits');
      const reconstructionFactor = eventFallsOn(parsed.events, 'dividends', EXPECTED_SESSION_DATE) ? 1 : parsed.adjustmentFactor;
      const repair = reconstructSession(intraday, EXPECTED_SESSION, reconstructionFactor);
      if (repair.state === 'observed') {
        bars = mergeRows(bars.filter((row) => sessionDateFromMs(row.t) !== EXPECTED_SESSION_DATE), [repair.row], EXPECTED_SESSION_DATE);
        reconstructed = true;
        asof = EXPECTED_SESSION_DATE;
      } else if (repair.state === 'zero-observed' && dailySessionState(daily, EXPECTED_SESSION_DATE) === 'declared-null') {
        zeroObserved = true;
      } else {
        throw new Error('completed session ' + EXPECTED_SESSION_DATE + ' unavailable from daily and intraday feeds (' + repair.state + ')');
      }
    }
    if (enforceSession && asof !== EXPECTED_SESSION_DATE && !zeroObserved) throw new Error('latest completed session is ' + asof + ', expected ' + EXPECTED_SESSION_DATE);
    const reconstructedSessions = [...new Set(bars.filter((row) => Number.isInteger(row.sourceBars) && row.sourceBars > 0).map((row) => sessionDateFromMs(row.t)))];
    const freshDates = new Set(bars.map((row) => sessionDateFromMs(row.t)));
    const zeroObservedSessions = [...new Set([...(Array.isArray(existing && existing.zeroObservedSessions) ? existing.zeroObservedSessions : []), ...(zeroObserved ? [EXPECTED_SESSION_DATE] : [])])].filter((date) => !freshDates.has(date));
    const record = { sym, interval: '1d', range: RANGE, asof, fetched: new Date().toISOString(), refreshDate: CACHE_DATE, refreshWindow: CACHE_WINDOW, expectedSessionDate: enforceSession ? EXPECTED_SESSION_DATE : null, sessionState: zeroObserved ? 'zero-observed' : 'observed', src: reconstructedSessions.length ? 'yahoo-daily+intraday-repair' : zeroObserved ? 'yahoo-zero-observed-session' : 'yahoo', reconstructedSessions, zeroObservedSessions, rows: bars };
    writeFileSync(existingFile, JSON.stringify(record));
    console.log('ok   ' + sym + '  bars=' + bars.length + '  asof=' + asof + '  session=' + (enforceSession ? EXPECTED_SESSION_DATE : asof) + '/' + record.sessionState + '  last=' + bars[bars.length - 1].c + (reconstructed ? '  (yahoo intraday repair)' : zeroObserved ? '  (yahoo zero observed trades)' : '  (yahoo)'));
    return { sym, n: bars.length, last: bars[bars.length - 1].c, asof, sessionDate: enforceSession ? EXPECTED_SESSION_DATE : asof, sessionState: record.sessionState, zeroObserved, reconstructed: reconstructedSessions.length > 0, repairedThisRun: reconstructed };
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
  const syms = universe();
  mkdirSync(OUT_DIR, { recursive: true });
  console.log('refreshing ' + syms.length + ' canonical ticker histories with concurrency=' + FETCH_CONCURRENCY);
  const idx = (await mapConcurrent(syms, FETCH_CONCURRENCY, refreshSymbol)).filter(Boolean);
  const returned = new Set(idx.map((row) => row.sym));
  const missing = syms.filter((sym) => !returned.has(sym));
  const carriedCount = idx.filter((row) => row.carried).length;
  const reconstructedCount = idx.filter((row) => row.reconstructed).length;
  const sessionReuseCount = idx.filter((row) => row.sessionCached).length;
  const zeroObservedCount = idx.filter((row) => row.zeroObserved).length;
  writeFileSync(OUT_DIR + '/index.json', JSON.stringify({
    updated: new Date().toISOString(), refreshDate: CACHE_DATE, refreshWindow: CACHE_WINDOW,
    expectedSessionDate: EXPECTED_SESSION_DATE,
    expected: syms.length, count: idx.length, freshCount: idx.length - carriedCount,
    carriedCount, reconstructedCount, sessionReuseCount, zeroObservedCount, missing, tickers: idx
  }));
  console.log('\nwrote ' + idx.length + '/' + syms.length + ' bar snapshots to ' + OUT_DIR);
}
main().catch((e) => { console.error('fatal:', e); process.exit(COMPLETE_RUN ? 1 : 0); });
