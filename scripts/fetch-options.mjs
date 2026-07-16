#!/usr/bin/env node
/*
 * fetch-options.mjs — build same-origin option-chain snapshots for the
 * Options Structure Lab.
 *
 * Runs SERVER-SIDE in CI (GitHub Actions), where the browser CORS restriction
 * does not apply, so it can read CBOE's free delayed-quotes feed directly and
 * attach the canonical rows from data/bars/. It trims each chain and writes compact
 * JSON into data/options/<TICKER>.json. The Pages deploy then serves those files
 * from the site's OWN origin (pkirsanov.github.io/research-lab/data/options/...),
 * so the browser reads them with no CORS and no external proxy — immune to any
 * DNS filtering of public proxy services.
 *
 * Best-effort by design: a failing ticker is skipped and the process still
 * exits 0 so a data hiccup never blocks the site deploy.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const OUT_DIR = 'data/options';
const BARS_DIR = 'data/bars';
const UNIVERSE = 'options-structure-universe.json';
const MAX_EXP = 10;        // keep the nearest N future expiries (tool caps nExp at 10)
const STRIKE_PCT = 0.35;   // keep strikes within +/- this fraction of spot
const FETCH_CONCURRENCY = positiveInteger(process.env.OPTION_FETCH_CONCURRENCY, 4);
const CACHE_WINDOW = process.env.BRIEF_WINDOW || null;
const CACHE_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());
const LIVE_BASE = 'https://pkirsanov.github.io/research-lab/data/options/'; // currently-deployed snapshots (last-good fallback)

// CBOE index symbols take a leading underscore (_SPX, _VIX, ...).
const CBOE_INDEX = new Set(['SPX', 'VIX', 'NDX', 'RUT', 'XSP', 'DJX', 'OEX', 'MRUT', 'VIXW']);

function isIndex(id, alt) {
  return CBOE_INDEX.has(id) || !!(alt && alt.yahoo && alt.yahoo.startsWith('^'));
}
function cboeSymbol(id, alt) { return (isIndex(id, alt) ? '_' : '') + id; }
function yahooSymbol(id, alt) { return (alt && alt.yahoo) ? alt.yahoo : id; }
function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function readJSON(path, fallback) { try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; } }

// Bars have one owner: fetch-bars.mjs. Every tool, including options, consumes
// the same canonical ticker history rather than issuing another Yahoo request.
function canonicalBars(id, alt) {
  const snapshot = readJSON(BARS_DIR + '/' + yahooSymbol(id, alt) + '.json', null);
  return (snapshot && Array.isArray(snapshot.rows) && snapshot.rows.length) ? snapshot.rows : null;
}

async function getJSON(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (research-lab options snapshot)' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

// currently-deployed snapshot for a ticker, used as a last-good fallback so a
// transient upstream failure never wipes the live site's option data.
async function lastGood(id) {
  try {
    const r = await fetch(LIVE_BASE + encodeURIComponent(id) + '.json', { headers: { 'User-Agent': 'research-lab last-good snapshot' } });
    if (!r.ok) return null;
    const j = await r.json();
    return (j && Array.isArray(j.o) && j.o.length) ? j : null;
  } catch { return null; }
}

// Carry the currently-deployed snapshot forward when a fresh fetch fails, so the
// live site never loses a ticker's option data to a transient upstream hiccup.
// Writes the last-good record (its own spot/asof/o/bars) + an index row and
// returns true; returns false only when no last-good snapshot exists.
async function carryForward(id) {
  const rec = await lastGood(id);
  if (!rec) return null;
  writeFileSync(OUT_DIR + '/' + id + '.json', JSON.stringify(rec));
  const exps = new Set(rec.o.map(x => x.e)).size;                          // distinct expiries → fresh-path index shape
  console.log('kept ' + id + ' (last-good, no fresh chain)  contracts=' + rec.o.length);
  return { sym: id, spot: rec.spot, asof: rec.asof, exps, n: rec.o.length, bars: Array.isArray(rec.bars) ? rec.bars.length : 0, carried: true };
}

// CBOE delayed_quotes → compact {spot, asof, exps, o:[{e,t,k,iv,oi,v,b,a,l}]}
function trimCBOE(j) {
  const d = j && j.data;
  if (!d || !Array.isArray(d.options) || !d.options.length) return null;
  const spot = (d.current_price != null ? d.current_price : d.close);
  const now = Date.now() / 1000;
  const rows = [];
  const expSet = new Set();
  for (const r of d.options) {
    const m = (r.option || '').match(/(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/); // OCC tail: YYMMDD C/P strike*1000
    if (!m) continue;
    const ep = Math.floor(Date.parse('20' + m[1] + '-' + m[2] + '-' + m[3] + 'T20:00:00Z') / 1000);
    if (!isFinite(ep) || ep < now - 86400) continue;                        // drop expired
    const k = (+m[5]) / 1000;
    if (!isFinite(k) || (spot > 0 && Math.abs(k - spot) > spot * STRIKE_PCT)) continue; // trim wings
    rows.push({ ep, t: m[4], k, r });
    expSet.add(ep);
  }
  const exps = [...expSet].sort((a, b) => a - b).slice(0, MAX_EXP);
  const keep = new Set(exps);
  const o = rows.filter(x => keep.has(x.ep)).map(x => ({
    e: x.ep, t: x.t, k: x.k,
    iv: +x.r.iv || 0, oi: +x.r.open_interest || 0, v: +x.r.volume || 0,
    b: +x.r.bid || 0, a: +x.r.ask || 0, l: +x.r.last_trade_price || 0
  }));
  return { spot: (isFinite(spot) ? spot : null), asof: d.last_trade_time || null, exps, o };
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
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runWorker));
  return results;
}

async function refreshEntry(entry) {
  const id = entry.id;
  const existingPath = OUT_DIR + '/' + id + '.json';
  const existing = readJSON(existingPath, null);
  if (CACHE_WINDOW && existing && existing.refreshDate === CACHE_DATE && existing.refreshWindow === CACHE_WINDOW && Array.isArray(existing.o) && existing.o.length) {
    const exps = new Set(existing.o.map((contract) => contract.e)).size;
    console.log('reuse ' + id + '  contracts=' + existing.o.length + ' (git cache ' + CACHE_DATE + '/' + CACHE_WINDOW + ')');
    return { sym: id, spot: existing.spot, asof: existing.asof, exps, n: existing.o.length, bars: Array.isArray(existing.bars) ? existing.bars.length : 0, cached: true };
  }
  try {
    const chain = trimCBOE(await getJSON('https://cdn.cboe.com/api/global/delayed_quotes/options/' + cboeSymbol(id, entry.alt) + '.json'));
    if (!chain || !chain.o.length) {
      const carried = await carryForward(id);
      if (!carried) console.log('skip ' + id + ' (no chain, no last-good)');
      return carried;
    }

    const bars = canonicalBars(id, entry.alt);
    const rec = { sym: id, spot: chain.spot, asof: chain.asof, fetched: new Date().toISOString(), refreshDate: CACHE_DATE, refreshWindow: CACHE_WINDOW, o: chain.o };
    if (bars) rec.bars = bars;
    writeFileSync(OUT_DIR + '/' + id + '.json', JSON.stringify(rec));
    console.log('ok   ' + id + '  spot=' + chain.spot + '  exps=' + chain.exps.length + '  contracts=' + chain.o.length + (bars ? ('  bars=' + bars.length + ' (canonical)') : '  (no canonical bars)'));
    return { sym: id, spot: chain.spot, asof: chain.asof, exps: chain.exps.length, n: chain.o.length, bars: bars ? bars.length : 0 };
  } catch (err) {
    const carried = await carryForward(id);
    if (!carried) console.log('FAIL ' + id + ': ' + ((err && err.message) || err));
    return carried;
  }
}

async function main() {
  const uni = JSON.parse(readFileSync(UNIVERSE, 'utf8'));
  const entries = (uni.entries || []).filter(e => e && e.id);
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('refreshing ' + entries.length + ' option chains with concurrency=' + FETCH_CONCURRENCY + '; canonical bars are reused');
  const index = (await mapConcurrent(entries, FETCH_CONCURRENCY, refreshEntry)).filter(Boolean);

  writeFileSync(OUT_DIR + '/index.json', JSON.stringify({ updated: new Date().toISOString(), count: index.length, tickers: index }));
  console.log('\nwrote ' + index.length + '/' + entries.length + ' tickers to ' + OUT_DIR);
}

main().catch(e => { console.error('fatal:', e); process.exit(0); }); // never fail the site deploy
