#!/usr/bin/env node
/*
 * fetch-options.mjs — build same-origin option-chain snapshots for the
 * Options Structure Lab.
 *
 * Runs SERVER-SIDE in CI (GitHub Actions), where the browser CORS restriction
 * does not apply, so it can read CBOE's free delayed-quotes feed + Yahoo daily
 * bars directly. It trims each chain to what the tool needs and writes compact
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
const UNIVERSE = 'options-structure-universe.json';
const MAX_EXP = 10;        // keep the nearest N future expiries (tool caps nExp at 10)
const STRIKE_PCT = 0.35;   // keep strikes within +/- this fraction of spot
const BAR_RANGE = '1y';    // daily price history for the momentum / volume-profile panels
const REQ_GAP_MS = 250;    // politeness delay between upstream requests
const LIVE_BASE = 'https://pkirsanov.github.io/research-lab/data/options/'; // currently-deployed snapshots (last-good fallback)

// CBOE index symbols take a leading underscore (_SPX, _VIX, ...).
const CBOE_INDEX = new Set(['SPX', 'VIX', 'NDX', 'RUT', 'XSP', 'DJX', 'OEX', 'MRUT', 'VIXW']);

function isIndex(id, alt) {
  return CBOE_INDEX.has(id) || !!(alt && alt.yahoo && alt.yahoo.startsWith('^'));
}
function cboeSymbol(id, alt) { return (isIndex(id, alt) ? '_' : '') + id; }
function yahooSymbol(id, alt) { return (alt && alt.yahoo) ? alt.yahoo : id; }

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
async function carryForward(id, index) {
  const rec = await lastGood(id);
  if (!rec) return false;
  writeFileSync(OUT_DIR + '/' + id + '.json', JSON.stringify(rec));
  const exps = new Set(rec.o.map(x => x.e)).size;                          // distinct expiries → fresh-path index shape
  index.push({ sym: id, spot: rec.spot, asof: rec.asof, exps, n: rec.o.length, bars: Array.isArray(rec.bars) ? rec.bars.length : 0, carried: true });
  console.log('kept ' + id + ' (last-good, no fresh chain)  contracts=' + rec.o.length);
  return true;
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

// Yahoo v8 chart → compact daily bars [{t,o,h,l,c,v}]
function trimBars(j) {
  const r = j && j.chart && j.chart.result && j.chart.result[0];
  if (!r || !r.timestamp) return null;
  const ts = r.timestamp;
  const q = (r.indicators && r.indicators.quote && r.indicators.quote[0]) || {};
  const adj = (r.indicators.adjclose && r.indicators.adjclose[0] && r.indicators.adjclose[0].adjclose) || null;
  const out = [];
  for (let i = 0; i < ts.length; i++) {
    const c = (adj && adj[i] != null) ? adj[i] : (q.close ? q.close[i] : null);
    if (c == null) continue;
    out.push({ t: ts[i] * 1000, o: q.open ? q.open[i] : c, h: q.high ? q.high[i] : c, l: q.low ? q.low[i] : c, c, v: (q.volume ? q.volume[i] : 0) || 0 });
  }
  return out.length ? out : null;
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function main() {
  const uni = JSON.parse(readFileSync(UNIVERSE, 'utf8'));
  const entries = (uni.entries || []).filter(e => e && e.id);
  mkdirSync(OUT_DIR, { recursive: true });

  const index = [];
  for (const e of entries) {
    const id = e.id;
    try {
      const chain = trimCBOE(await getJSON('https://cdn.cboe.com/api/global/delayed_quotes/options/' + cboeSymbol(id, e.alt) + '.json'));
      if (!chain || !chain.o.length) {
        if (!(await carryForward(id, index))) console.log('skip ' + id + ' (no chain, no last-good)');
        await sleep(REQ_GAP_MS);
        continue;
      }

      let bars = null; // best-effort daily history (server-side Yahoo — no CORS in CI)
      try {
        bars = trimBars(await getJSON('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(yahooSymbol(id, e.alt)) + '?interval=1d&range=' + BAR_RANGE + '&includeAdjustedClose=true'));
      } catch (_) { /* bars are optional */ }

      const rec = { sym: id, spot: chain.spot, asof: chain.asof, fetched: new Date().toISOString(), o: chain.o };
      if (bars) rec.bars = bars;
      writeFileSync(OUT_DIR + '/' + id + '.json', JSON.stringify(rec));
      index.push({ sym: id, spot: chain.spot, asof: chain.asof, exps: chain.exps.length, n: chain.o.length, bars: bars ? bars.length : 0 });
      console.log('ok   ' + id + '  spot=' + chain.spot + '  exps=' + chain.exps.length + '  contracts=' + chain.o.length + (bars ? ('  bars=' + bars.length) : '  (no bars)'));
    } catch (err) {
      if (!(await carryForward(id, index))) console.log('FAIL ' + id + ': ' + ((err && err.message) || err));
    }
    await sleep(REQ_GAP_MS);
  }

  writeFileSync(OUT_DIR + '/index.json', JSON.stringify({ updated: new Date().toISOString(), count: index.length, tickers: index }));
  console.log('\nwrote ' + index.length + '/' + entries.length + ' tickers to ' + OUT_DIR);
}

main().catch(e => { console.error('fatal:', e); process.exit(0); }); // never fail the site deploy
