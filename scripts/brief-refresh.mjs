#!/usr/bin/env node
/*
 * Actionable Market Brief — Tier A (deterministic data refresh).
 *
 * Runs HEADLESS (evo-x2 knb-managed timer, or macOS launchd) at the four daily
 * windows. Fetches VIX + CNN Fear&Greed + daily bars for the tracked universe and
 * watchlist, computes the deterministic signals (regime, per-name momentum, per-sector
 * 1m/3m momentum + tool-aligned RRG state) PLUS the structural frame (§6c) — long-horizon
 * 126/252-day momentum, 20/50/200-day MA structure, and 52-week-range position — and
 * APPENDS one snapshot to brief-history.jsonl —
 * the change-detection memory the agent (Tier B) and the tool read. It does NOT author
 * the narrative/recommendations/probabilities — that is the Copilot agent's job.
 *
 * From Node there is no CORS, so it fetches providers directly. Network failures are a
 * SOFT fail (log + exit 0) so a cron run never wedges. Educational only — not advice.
 *
 * Usage:  node scripts/brief-refresh.mjs [--window pre-market|morning|pre-close|after-hours]
 */
import { readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const cfg = JSON.parse(read('market-brief.config.json'));
const wl = JSON.parse(read('watchlist.json'));

/* ── window: --window flag, else derive from ET clock ── */
function argWindow() {
  const i = process.argv.indexOf('--window');
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  let m;
  try { const s = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false }); const p = s.split(':'); m = (+p[0]) * 60 + (+p[1]); } catch { m = 12 * 60; }
  if (m >= 17 * 60) return 'after-hours';
  if (m >= 15 * 60) return 'pre-close';
  if (m >= 11 * 60) return 'morning';
  return 'pre-market';
}

/* ── pure signal helpers (mirror rlbrief.js / rldata.js) ── */
const momentumPct = (rows, lb) => (rows && rows.length > lb && rows[rows.length - 1].c && rows[rows.length - 1 - lb].c) ? (rows[rows.length - 1].c / rows[rows.length - 1 - lb].c - 1) * 100 : null;
const round = (x, d = 2) => (Number.isFinite(x) ? +x.toFixed(d) : null);
/* ── structural helpers (§6c larger-picture frame) ── */
function sma(rows, n) { if (!rows || rows.length < n || n <= 0) return null; let s = 0; for (let i = rows.length - n; i < rows.length; i++) s += rows[i].c; return s / n; }
function maDistPct(rows, n) { const m = sma(rows, n), c = rows && rows.length ? rows[rows.length - 1].c : null; return (Number.isFinite(m) && Number.isFinite(c) && m) ? round((c / m - 1) * 100, 2) : null; }
function maStack(rows) { const a = sma(rows, 20), b = sma(rows, 50), c = sma(rows, 200); if (![a, b, c].every(Number.isFinite)) return 'n/a'; if (a > b && b > c) return 'bull-stack'; if (a < b && b < c) return 'bear-stack'; return 'tangled'; }
function pctFrom52wHigh(rows) { if (!rows || !rows.length) return null; const w = rows.slice(-252); let hi = -Infinity; for (const r of w) if (r.c > hi) hi = r.c; const c = rows[rows.length - 1].c; return (Number.isFinite(hi) && hi) ? round((c / hi - 1) * 100, 2) : null; }
/* the structural block for a series: long-horizon momentum + MA structure + 52w-range position */
function structural(rows) { return { mom126: round(momentumPct(rows, 126)), mom252: round(momentumPct(rows, 252)), ma50Dist: maDistPct(rows, 50), ma200Dist: maDistPct(rows, 200), maStack: maStack(rows), pctFrom52wHigh: pctFrom52wHigh(rows) }; }
function macroRegime(fg, vix) {
  const s = fg && Number.isFinite(fg.score) ? fg.score : null;
  if (s == null && vix == null) return { risk: 0, band: 'Unknown' };
  if (s == null) return { risk: vix >= 26 ? -1 : vix <= 15 ? 1 : 0, band: `VIX ${vix.toFixed(1)}` };
  let band, risk;
  if (s >= 76) { band = 'Extreme greed'; risk = 1; }
  else if (s >= 56) { band = 'Greed / risk-on'; risk = 1; }
  else if (s > 44) { band = 'Neutral'; risk = 0; }
  else if (s > 24) { band = 'Fear / risk-off'; risk = -1; }
  else { band = 'Extreme fear'; risk = -1; }
  if (vix != null && vix >= 30 && risk >= 0) risk = 0;
  return { risk, band };
}
/* ── tool-aligned RRG (mirrors sector-research-lab.html computeEntry EXACTLY) ──
   The brief's sector-rotation recs MUST match the rotation tool's verdict. The tool does
   NOT rank by raw 1-month RS *level*; it computes an RS-Ratio / RS-Momentum RRG from
   rolling z-scores and a 2-week momentum *acceleration*, then labels each entry
   Leading / Weakening ↓ / Lagging / Improving ↑ plus the early-turn sub-states
   Basing ↑ (lagging but accelerating) and Peaking ⚠ (leading but rolling over), and
   splits a mechanical Rotate-INTO / Rotate-OUT read. We replicate that here so every
   snapshot hands the author the SAME numbers the tool renders — closing the metric-lens
   gap by construction. Keep these defaults in lockstep with the tool
   (state.rsLook=63, state.momSpan=10, accel span=10). See notes/market-brief.md §6b. */
const RS_LOOK = 63, MOM_SPAN = 10, ACCEL_SPAN = 10;
const _mean = (a) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; };
const _stdev = (a) => { if (a.length < 2) return 0; const m = _mean(a); let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - m; s += d * d; } return Math.sqrt(s / (a.length - 1)); };
const _dstr = (ms) => new Date(ms).toISOString().slice(0, 10);
/* rolling z-score re-centered at 100 over a trailing L-window (tool's rollZ100) */
function rollZ100(a, L) {
  const out = new Array(a.length), minN = Math.max(8, Math.floor(L * 0.5));
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i])) { out[i] = NaN; continue; }
    const vals = []; for (let j = i; j >= 0 && vals.length < L; j--) { if (Number.isFinite(a[j])) vals.push(a[j]); }
    if (vals.length < minN) { out[i] = NaN; continue; }
    const m = _mean(vals), sd = _stdev(vals); out[i] = sd ? 100 + (a[i] - m) / sd : 100;
  }
  return out;
}
/* intersect a name series with the benchmark by day-string → aligned adj-close arrays */
function alignRs(rows, benchRows) {
  const mb = {}; for (const r of benchRows) mb[_dstr(r.t)] = r.c;
  const a = [], b = [];
  for (const r of rows) { const bc = mb[_dstr(r.t)]; if (bc != null) { a.push(r.c); b.push(bc); } }
  return { a, b };
}
/* tool stateLabel(quad, accel): the 6-state label incl. early-turn Basing/Peaking */
function rrgLabel(quad, accel) {
  if (quad === 'L') return accel < -0.15 ? 'Peaking ⚠' : 'Leading';
  if (quad === 'W') return 'Weakening ↓';
  if (quad === 'A') return accel > 0.15 ? 'Basing ↑' : 'Lagging';
  if (quad === 'I') return 'Improving ↑';
  return 'n/a';
}
/* tool rotationSuggestions() rule: INTO (accumulate) / OUT (distribute) / neutral */
function rotationTag(quad, accel, label) {
  if (quad === 'I' || label === 'Basing ↑' || (quad === 'L' && accel > 0.2)) return 'into';
  if (label === 'Peaking ⚠' || quad === 'W') return 'out';
  return 'neutral';
}
const RRG_NULL = { rsRatio: null, rsMom: null, quad: null, accel: null, rrgState: 'n/a', rotation: 'neutral' };
function rrgFull(rows, benchRows) {
  if (!rows || !benchRows) return RRG_NULL;
  const al = alignRs(rows, benchRows);
  if (al.a.length < 30) return RRG_NULL;
  const rs = al.a.map((v, i) => (al.b[i] ? v / al.b[i] : NaN));
  const rsRatioArr = rollZ100(rs, RS_LOOK);
  const rom = rsRatioArr.map((v, i) => (i >= MOM_SPAN && Number.isFinite(v) && Number.isFinite(rsRatioArr[i - MOM_SPAN])) ? v - rsRatioArr[i - MOM_SPAN] : NaN);
  const rsMomArr = rollZ100(rom, RS_LOOK);
  let last = -1; for (let i = rsRatioArr.length - 1; i >= 0; i--) { if (Number.isFinite(rsRatioArr[i]) && Number.isFinite(rsMomArr[i])) { last = i; break; } }
  if (last < 0) return RRG_NULL;
  const rsRatio = rsRatioArr[last], rsMom = rsMomArr[last];
  const quad = rsRatio >= 100 ? (rsMom >= 100 ? 'L' : 'W') : (rsMom >= 100 ? 'I' : 'A');
  const j = last - ACCEL_SPAN;
  const accel = (j >= 0 && Number.isFinite(rsMomArr[j]) && Number.isFinite(rsMomArr[last])) ? rsMomArr[last] - rsMomArr[j] : 0;
  const label = rrgLabel(quad, accel);
  return { rsRatio: round(rsRatio, 2), rsMom: round(rsMom, 2), quad, accel: round(accel, 2), rrgState: label, rotation: rotationTag(quad, accel, label) };
}

/* ── fetchers (direct — Node has no CORS) ── */
async function yahooRows(sym, range = '2y', interval = '1d') {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${range}&interval=${interval}&includeAdjustedClose=true`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) throw new Error('http ' + r.status);
    const j = await r.json();
    const res = j.chart.result[0], t = res.timestamp || [], q = res.indicators.quote[0];
    const adj = res.indicators.adjclose?.[0]?.adjclose;
    const rows = [];
    for (let i = 0; i < t.length; i++) { const c = adj ? adj[i] : q.close[i]; if (c == null) continue; rows.push({ t: t[i] * 1000, c }); }
    return rows;
  } catch (e) { return null; }
}
/* memoized fetch — group members overlap the watchlist + sector ETFs (e.g. MSFT, NVDA),
   so dedupe by symbol+range+interval to stay within Yahoo's rate limit. */
const _rowsMemo = new Map();
async function yahooRowsMemo(sym, range = '2y', interval = '1d') {
  const key = sym + '|' + range + '|' + interval;
  if (_rowsMemo.has(key)) return _rowsMemo.get(key);
  const rows = await yahooRows(sym, range, interval);
  _rowsMemo.set(key, rows);
  return rows;
}
async function fearGreed() {
  try {
    const r = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) throw new Error('http ' + r.status);
    const j = await r.json();
    return { score: Math.round(j.fear_and_greed.score), band: j.fear_and_greed.rating };
  } catch (e) { return null; }
}

async function main() {
  const window = argWindow();
  try { const dow = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short' }); if (dow === 'Sat' || dow === 'Sun') { console.log(`[brief-refresh] ${dow} \u2014 market closed, skipping run`); return; } } catch { }
  const [vixRows, fg] = await Promise.all([yahooRows('^VIX', '1mo'), fearGreed()]);
  const vix = vixRows && vixRows.length ? round(vixRows[vixRows.length - 1].c, 2) : null;
  const reg = macroRegime(fg, vix);

  const bench = await yahooRowsMemo('SPY');
  const benchMom1m = momentumPct(bench, 21), benchMom3m = momentumPct(bench, 63), benchMom6m = momentumPct(bench, 126);
  const benchStruct = structural(bench);

  const sectors = {};
  for (const s of (cfg.track?.sectors || [])) {
    const rows = await yahooRowsMemo(s); if (!rows) continue;
    const m1 = momentumPct(rows, 21), m3 = momentumPct(rows, 63);
    const st = structural(rows);
    const rrg = rrgFull(rows, bench);
    sectors[s] = { rsMom1m: round(m1 - benchMom1m, 2), rsMom3m: round(m3 - benchMom3m, 2), rsMom6m: round(momentumPct(rows, 126) - benchMom6m, 2), rsRatio: rrg.rsRatio, rsMom: rrg.rsMom, quad: rrg.quad, accel: rrg.accel, rrgState: rrg.rrgState, rotation: rrg.rotation, maStack: st.maStack, ma200Dist: st.ma200Dist };
  }
  const names = {};
  for (const it of (wl.items || [])) {
    const rows = await yahooRowsMemo(it.ticker); if (!rows) continue;
    names[it.ticker] = { px: round(rows[rows.length - 1].c, 2), mom5: round(momentumPct(rows, 5)), mom21: round(momentumPct(rows, 21)), mom63: round(momentumPct(rows, 63)), ...structural(rows) };
  }

  // thematic groups (Mag 7 → MAGS, semis → SOXX): the group ETF proxy read (sector-style RS/RRG/MA-stack)
  // + each member (name-style momentum + structural) + breadth (how many members are individually bull-stacked).
  // The agent (Tier B) elevates the NOTABLE members from this deterministic slice per run (§7a).
  const groups = [];
  for (const g of (cfg.track?.groups || [])) {
    let read = null;
    if (g.etf) {
      const er = await yahooRowsMemo(g.etf);
      if (er && er.length) {
        const m1 = momentumPct(er, 21), m3 = momentumPct(er, 63);
        const st = structural(er);
        const rrg = rrgFull(er, bench);
        read = { etf: g.etf, px: round(er[er.length - 1].c, 2), rsMom1m: round(m1 - benchMom1m, 2), rsMom3m: round(m3 - benchMom3m, 2), rsMom6m: round(momentumPct(er, 126) - benchMom6m, 2), rsRatio: rrg.rsRatio, rsMom: rrg.rsMom, quad: rrg.quad, accel: rrg.accel, rrgState: rrg.rrgState, rotation: rrg.rotation, maStack: st.maStack, ma200Dist: st.ma200Dist };
      }
    }
    const members = {};
    let nTot = 0, bull = 0, a50 = 0, a200 = 0, up = 0;
    for (const t of (g.members || [])) {
      const rows = await yahooRowsMemo(t); if (!rows) continue;
      const st = structural(rows);
      const mem = { px: round(rows[rows.length - 1].c, 2), mom5: round(momentumPct(rows, 5)), mom21: round(momentumPct(rows, 21)), mom63: round(momentumPct(rows, 63)), ...st };
      members[t] = mem; nTot++;
      if (st.maStack === 'bull-stack') bull++;
      if (Number.isFinite(st.ma50Dist) && st.ma50Dist > 0) a50++;
      if (Number.isFinite(st.ma200Dist) && st.ma200Dist > 0) a200++;
      if (Number.isFinite(mem.mom21) && mem.mom21 > 0) up++;
    }
    groups.push({ id: g.id, label: g.label, etf: g.etf || null, deepLink: g.deepLink || null, read, breadth: { n: nTot, bullStacked: bull, above50: a50, above200: a200, upMom: up, label: nTot ? `${bull}/${nTot} bull-stacked` : 'n/a' }, members });
  }

  const snap = {
    ts: new Date().toISOString(), window,
    regimeScore: reg.risk, regimeBand: reg.band, vix, fearGreed: fg ? fg.score : null,
    bench: { px: bench && bench.length ? round(bench[bench.length - 1].c, 2) : null, ...benchStruct },
    sectors, names, groups, source: 'brief-refresh.mjs'
  };
  appendFileSync(join(ROOT, 'brief-history.jsonl'), JSON.stringify(snap) + '\n');

  // deterministic slice the browser cockpit reads (market-brief.html overlays it as the "Computed (Tier-A)" line)
  // asOf = the window this refresh anchors to; generatedAt = the actual wall-clock this refresh ran (both are the run time for Tier-A).
  const snapshot = { asOf: snap.ts, generatedAt: snap.ts, window, regime: { band: reg.band, score: reg.risk, vix, fearGreed: fg ? fg.score : null }, bench: snap.bench, names, sectors, groups };
  writeFileSync(join(ROOT, 'market-brief.snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');

  console.log(`[brief-refresh] window=${window} regime=${reg.band}(${reg.risk}) VIX=${vix ?? '—'} F&G=${fg ? fg.score + '/' + fg.band : '—'}`);
  console.log(`  structural: SPY ${benchStruct.maStack} · 200d ${benchStruct.ma200Dist ?? '—'}% · 52w-high ${benchStruct.pctFrom52wHigh ?? '—'}% · mom126 ${benchStruct.mom126 ?? '—'}% mom252 ${benchStruct.mom252 ?? '—'}%`);
  console.log(`  sectors: ${Object.entries(sectors).map(([k, v]) => `${k} ${v.rrgState}${Number.isFinite(v.accel) ? ' a' + (v.accel >= 0 ? '+' : '') + v.accel : ''}${v.rotation && v.rotation !== 'neutral' ? '→' + v.rotation.toUpperCase() : ''}`).join(' · ') || '—'}`);
  console.log(`  names:   ${Object.entries(names).map(([k, v]) => `${k} ${v.px} mom21=${v.mom21}% 200d=${v.ma200Dist ?? '—'}% ${v.maStack}`).join(' · ') || '—'}`);
  console.log(`  groups:  ${groups.map(g => `${g.label} ${g.read ? g.read.rrgState + ' (' + g.read.rsMom1m + '%)' : '—'} ${g.breadth.label}`).join(' · ') || '—'}`);
  console.log(`  wrote market-brief.snapshot.json + appended 1 brief-history.jsonl row. Commit these + run Tier B (agent) for the narrative.`);
}

main().catch((e) => { console.error('[brief-refresh] soft-fail:', e.message); process.exit(0); });
