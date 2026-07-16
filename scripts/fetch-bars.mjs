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
const CACHE_WINDOW = process.env.BRIEF_WINDOW || null;
const CACHE_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());
const MISSING_ONLY = process.argv.includes('--missing-only');

/* Basket/theme ids that live in the universe files for grouping/labeling, plus
 * delisted names — NONE are tradeable Yahoo tickers, so never fetch them (they
 * only produce 404 noise and dead-proxy fallbacks in the browser tools). */
const NON_TICKERS = new Set(['AIINFRA', 'BANKS', 'HOMEBUILD', 'MAG7', 'MEMORY', 'NUCLEAR', 'SEMIS', 'SOFTWARE', 'HES']);

function readJSON(f, fallback) { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return fallback; } }
function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/* union of the tickers the bar tools need, from the committed universe files. */
function universe() {
  const set = new Set();
  const add = (t) => { if (typeof t === 'string') { const s = t.trim().toUpperCase(); if (s && !s.startsWith('^')) set.add(s); } };
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
  return [...set].filter((s) => !NON_TICKERS.has(s)).sort();
}

async function getJSON(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (research-lab bars snapshot)' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
function trimBars(j) {
  const r = j && j.chart && j.chart.result && j.chart.result[0];
  if (!r || !r.timestamp) return null;
  const ts = r.timestamp, q = (r.indicators && r.indicators.quote && r.indicators.quote[0]) || {};
  const adj = (r.indicators.adjclose && r.indicators.adjclose[0] && r.indicators.adjclose[0].adjclose) || null;
  const out = [];
  for (let i = 0; i < ts.length; i++) {
    const c = (adj && adj[i] != null) ? adj[i] : (q.close ? q.close[i] : null);
    if (c == null) continue;
    out.push({ t: ts[i] * 1000, o: q.open ? q.open[i] : c, h: q.high ? q.high[i] : c, l: q.low ? q.low[i] : c, c, v: (q.volume ? q.volume[i] : 0) || 0 });
  }
  return out.length ? out : null;
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
  if (CACHE_WINDOW && existing && existing.refreshDate === CACHE_DATE && existing.refreshWindow === CACHE_WINDOW && Array.isArray(existingRows) && existingRows.length) {
    console.log('reuse ' + sym + '  bars=' + existingRows.length + ' (git cache ' + CACHE_DATE + '/' + CACHE_WINDOW + ')');
    return { sym, n: existingRows.length, last: existingRows[existingRows.length - 1].c, cached: true };
  }
  if (MISSING_ONLY && existsSync(existingFile)) {
    if (Array.isArray(existingRows) && existingRows.length) {
      console.log('keep ' + sym + '  bars=' + existingRows.length);
      return { sym, n: existingRows.length, last: existingRows[existingRows.length - 1].c };
    }
  }

  try {
    const bars = trimBars(await getJSON('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=' + RANGE + '&includeAdjustedClose=true'));
    if (!bars) { console.log('skip ' + sym + ' (no bars)'); return null; }
    writeFileSync(existingFile, JSON.stringify({ sym, interval: '1d', range: RANGE, asof: new Date(bars[bars.length - 1].t).toISOString().slice(0, 10), fetched: new Date().toISOString(), refreshDate: CACHE_DATE, refreshWindow: CACHE_WINDOW, src: 'yahoo', rows: bars }));
    console.log('ok   ' + sym + '  bars=' + bars.length + '  last=' + bars[bars.length - 1].c + '  (yahoo)');
    return { sym, n: bars.length, last: bars[bars.length - 1].c };
  } catch (err) {
    if (Array.isArray(existingRows) && existingRows.length) {
      console.log('kept ' + sym + '  bars=' + existingRows.length + ' (last-good; ' + ((err && err.message) || err) + ')');
      return { sym, n: existingRows.length, last: existingRows[existingRows.length - 1].c, carried: true };
    }
    console.log('FAIL ' + sym + ': ' + ((err && err.message) || err));
    return null;
  }
}

async function main() {
  const syms = universe();
  mkdirSync(OUT_DIR, { recursive: true });
  console.log('refreshing ' + syms.length + ' canonical ticker histories with concurrency=' + FETCH_CONCURRENCY);
  const idx = (await mapConcurrent(syms, FETCH_CONCURRENCY, refreshSymbol)).filter(Boolean);
  writeFileSync(OUT_DIR + '/index.json', JSON.stringify({ updated: new Date().toISOString(), count: idx.length, tickers: idx }));
  console.log('\nwrote ' + idx.length + '/' + syms.length + ' bar snapshots to ' + OUT_DIR);
}
main().catch((e) => { console.error('fatal:', e); process.exit(0); });
