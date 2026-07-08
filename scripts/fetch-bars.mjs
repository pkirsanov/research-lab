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
 * For names that already have a fresh option snapshot (data/options/<SYM>.json)
 * with bundled bars, those bars are reused (no redundant fetch).
 *
 * Best-effort: a failing ticker is skipped; the process always exits 0.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';

const OUT_DIR = 'data/bars';
const OPT_DIR = 'data/options';
const RANGE = '1y';
const REQ_GAP_MS = 200;

/* Basket/theme ids that live in the universe files for grouping/labeling, plus
 * delisted names — NONE are tradeable Yahoo tickers, so never fetch them (they
 * only produce 404 noise and dead-proxy fallbacks in the browser tools). */
const NON_TICKERS = new Set(['AIINFRA', 'BANKS', 'HOMEBUILD', 'MAG7', 'MEMORY', 'NUCLEAR', 'SEMIS', 'SOFTWARE', 'HES']);

function readJSON(f, fallback) { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return fallback; } }

/* union of the tickers the bar tools need, from the committed universe files. */
function universe() {
  const set = new Set();
  const add = (t) => { if (typeof t === 'string') { const s = t.trim().toUpperCase(); if (s && !s.startsWith('^')) set.add(s); } };
  const su = readJSON('sector-universe.json', {});
  (su.entries || []).forEach((e) => add(e.ticker || e.id));
  Object.values(su.sectorMap || {}).forEach((s) => (s.constituents || []).forEach((c) => add(c.ticker)));
  (readJSON('watchlist.json', {}).items || []).forEach((it) => add(it.ticker));
  const cfg = readJSON('market-brief.config.json', {});
  const tr = cfg.track || {};
  [].concat(tr.indexes || [], tr.sectors || [], cfg.benchmarks || []).forEach(add);
  ['SPY', 'QQQ', 'IWM', 'DIA', 'RSP', 'SPMO', 'VGT', 'MTUM'].forEach(add);
  const eu = readJSON('etf-universe.json', {});
  (eu.entries || eu.etfs || []).forEach((e) => add(typeof e === 'string' ? e : (e && (e.ticker || e.id))));
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
/* reuse bars already bundled in a fresh option snapshot, to avoid a redundant Yahoo call. */
function barsFromOption(sym) {
  const f = OPT_DIR + '/' + sym + '.json';
  if (!existsSync(f)) return null;
  const j = readJSON(f, null);
  return (j && Array.isArray(j.bars) && j.bars.length) ? j.bars : null;
}
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const syms = universe();
  mkdirSync(OUT_DIR, { recursive: true });
  const idx = [];
  for (const sym of syms) {
    try {
      let bars = barsFromOption(sym), src = 'option-snapshot';
      if (!bars) {
        bars = trimBars(await getJSON('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=' + RANGE + '&includeAdjustedClose=true'));
        src = 'yahoo';
        await sleep(REQ_GAP_MS);
      }
      if (!bars) { console.log('skip ' + sym + ' (no bars)'); continue; }
      writeFileSync(OUT_DIR + '/' + sym + '.json', JSON.stringify({ sym, interval: '1d', asof: new Date(bars[bars.length - 1].t).toISOString().slice(0, 10), fetched: new Date().toISOString(), src, rows: bars }));
      idx.push({ sym, n: bars.length, last: bars[bars.length - 1].c });
      console.log('ok   ' + sym + '  bars=' + bars.length + '  last=' + bars[bars.length - 1].c + '  (' + src + ')');
    } catch (err) { console.log('FAIL ' + sym + ': ' + ((err && err.message) || err)); }
  }
  writeFileSync(OUT_DIR + '/index.json', JSON.stringify({ updated: new Date().toISOString(), count: idx.length, tickers: idx }));
  console.log('\nwrote ' + idx.length + '/' + syms.length + ' bar snapshots to ' + OUT_DIR);
}
main().catch((e) => { console.error('fatal:', e); process.exit(0); });
