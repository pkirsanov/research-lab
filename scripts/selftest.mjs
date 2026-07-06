#!/usr/bin/env node
/*
 * Research-Lab math self-test.
 *
 * Extracts the pure numeric helpers straight out of the tool HTML files
 * (balanced-brace matching — no eval of the whole DOM-bound script) and
 * asserts their mathematical invariants. This codifies the ad-hoc checks
 * we otherwise run by hand every time the strategy math changes, so a
 * regression in a greek, a tail-risk measure, or a Sharpe deflation is
 * caught before it ships.
 *
 * Usage:  node scripts/selftest.mjs
 * Exit:   0 = all invariants hold, 1 = at least one failed.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');

/* Extract `function <name>(...) { ... }` by balancing braces from the first `{`.
   Safe for the pure-math helpers here (none embed `{`/`}` inside string literals). */
function extractFn(src, name) {
  const sig = new RegExp('function\\s+' + name + '\\s*\\(');
  const m = sig.exec(src);
  if (!m) throw new Error('function not found: ' + name);
  let i = src.indexOf('{', m.index);
  if (i < 0) throw new Error('no body for: ' + name);
  let depth = 0, start = i;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(m.index, i);
}

/* Build a sandbox that exposes the named functions after evaluating a preamble. */
function build(fnSources, exportNames, preamble = '') {
  const body = preamble + '\n' + fnSources.join('\n') + '\nreturn {' + exportNames.join(',') + '};';
  // eslint-disable-next-line no-new-func
  return Function(body)();
}

let failures = 0, passes = 0;
function assert(cond, msg) {
  if (cond) { passes++; console.log('  \u2713 ' + msg); }
  else { failures++; console.log('  \u2717 FAIL: ' + msg); }
}
function approx(a, b, tol) { return Math.abs(a - b) <= tol; }
function group(name) { console.log('\n' + name); }

/* ---------- ETF: Sharpe deflation + shock models ---------- */
try {
  group('etf-momentum-lab.html \u2014 Deflated/Probabilistic Sharpe + MC shocks');
  const src = read('etf-momentum-lab.html');
  const names = ['mean', 'gauss', 'studentT', 'normCdf', 'invNorm', 'moments', 'deflatedSharpe'];
  const env = build(names.map((n) => extractFn(src, n)), names, 'var ANN=252;');

  assert(approx(env.normCdf(0), 0.5, 1e-3), 'normCdf(0) = 0.5');
  assert(approx(env.normCdf(1.6448536), 0.95, 2e-3), 'normCdf(1.6449) = 0.95');
  assert(env.normCdf(-3) < env.normCdf(0) && env.normCdf(0) < env.normCdf(3), 'normCdf is monotone increasing');
  assert(approx(env.normCdf(env.invNorm(0.9)), 0.9, 2e-3), 'invNorm/normCdf round-trip at 0.9');
  assert(approx(env.normCdf(env.invNorm(0.05)), 0.05, 2e-3), 'invNorm/normCdf round-trip at 0.05');

  // scaled Student-t(5): unit variance, fat tails
  const nu = 5, sc = Math.sqrt((nu - 2) / nu);
  let n = 200000, s = 0, s2 = 0, k4 = 0;
  for (let i = 0; i < n; i++) { const x = env.studentT(nu) * sc; s += x; s2 += x * x; k4 += x * x * x * x; }
  const mu = s / n, varr = s2 / n - mu * mu, kurt = (k4 / n) / (varr * varr);
  assert(approx(varr, 1, 0.06), 'scaled Student-t(5) variance ~ 1 (preserves target sigma), got ' + varr.toFixed(3));
  assert(kurt > 4, 'scaled Student-t(5) kurtosis > 3 (fat tails), got ' + kurt.toFixed(2));

  // deflatedSharpe: strong uptrend => high DSR; flat/noisy => low DSR; DSR <= PSR always
  const up = [], flat = [];
  let lvl = 100;
  for (let i = 0; i < 320; i++) { lvl *= (1 + 0.0009 + 0.006 * Math.sin(i * 1.3)); up.push(lvl); flat.push(100 * (1 + 0.02 * Math.sin(i * 0.7))); }
  const dUp = env.deflatedSharpe(up, 24), dFlat = env.deflatedSharpe(flat, 24);
  assert(dUp && dUp.psr >= 0 && dUp.psr <= 1 && dUp.dsr >= 0 && dUp.dsr <= 1, 'DSR/PSR are probabilities in [0,1]');
  assert(dUp.dsr <= dUp.psr + 1e-9, 'Deflated Sharpe <= Probabilistic Sharpe (deflation only lowers it)');
  assert(dUp.dsr > 0.7, 'strong-uptrend equity => high DSR (' + (dUp.dsr * 100).toFixed(0) + '%)');
  assert(dFlat.dsr < 0.6, 'flat/noisy equity => low DSR (' + (dFlat.dsr * 100).toFixed(0) + '%)');
} catch (e) { failures++; console.log('  \u2717 FAIL (etf group threw): ' + e.message); }

/* ---------- AI-Capex: CVaR tail-risk ---------- */
try {
  group('ai-capex-strategy-lab.html \u2014 CVaR expected shortfall');
  const src = read('ai-capex-strategy-lab.html');
  const names = ['invNorm', 'cvarOf'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const a = env.cvarOf(0.15, 0.30, 0.05), b = env.cvarOf(0.10, 0.50, 0.05), c = env.cvarOf(0.03, 0.20, 0.05);
  assert(a < 0 && b < 0 && c < 0, 'CVaR(5%) returns are negative (losses)');
  assert(a > -1 && b > -1 && c > -1, 'CVaR bounded at -100%');
  assert(b < a, 'higher vol => deeper CVaR tail (sigma .5 worse than .3)');
} catch (e) { failures++; console.log('  \u2717 FAIL (ai-capex group threw): ' + e.message); }

/* ---------- Gamma: second-order greeks ---------- */
try {
  group('gamma-trading-lab.html \u2014 vanna / charm greeks');
  const src = read('gamma-trading-lab.html');
  const names = ['bsmVanna', 'bsmCharm'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const T = 7 / 365;
  assert(isFinite(env.bsmVanna(100, 105, T, 0.045, 0, 0.35)), 'bsmVanna finite for a normal contract');
  assert(isFinite(env.bsmCharm(100, 100, T, 0.045, 0, 0.35)), 'bsmCharm finite at the money');
  assert(env.bsmVanna(100, 105, 0, 0.045, 0, 0.35) === 0, 'bsmVanna guards T=0 => 0');
  assert(env.bsmCharm(100, 105, 0, 0.045, 0, 0.35) === 0, 'bsmCharm guards T=0 => 0');
  assert(env.bsmVanna(100, 105, T, 0.045, 0, 0) === 0, 'bsmVanna guards sigma=0 => 0');
} catch (e) { failures++; console.log('  \u2717 FAIL (gamma group threw): ' + e.message); }

/* ---------- Options: rolling percentile / z ---------- */
try {
  group('options-structure-lab.html \u2014 percentile / z-score');
  const src = read('options-structure-lab.html');
  const names = ['pctRankZ'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  assert(env.pctRankZ(5, [1, 2, 3]) === null || env.pctRankZ(5, [1, 2]) === null, 'pctRankZ needs >= 3 samples');
  const r = env.pctRankZ(3, [1, 2, 3, 4, 5]);
  assert(r && r.pct >= 0 && r.pct <= 100, 'percentile in [0,100]');
  assert(env.pctRankZ(6, [1, 2, 3, 4, 5]).pct === 100, 'value above all history => 100th pct');
  assert(env.pctRankZ(0, [1, 2, 3, 4, 5]).pct === 0, 'value below all history => 0th pct');
} catch (e) { failures++; console.log('  \u2717 FAIL (options group threw): ' + e.message); }

/* ---------- rlg.js: shared macro-regime classifier ---------- */
try {
  group('rlg.js \u2014 shared macro-regime classifier');
  const src = read('rlg.js');
  const env = build([extractFn(src, 'macroRegime')], ['macroRegime']);
  assert(env.macroRegime({ fg: { score: 80 }, vix: 14 }).risk === 1, 'extreme greed => risk +1');
  assert(env.macroRegime({ fg: { score: 10 }, vix: 35 }).risk === -1, 'extreme fear => risk -1');
  assert(env.macroRegime({ fg: { score: 50 }, vix: 18 }).risk === 0, 'neutral F&G => risk 0');
  const hot = env.macroRegime({ fg: { score: 65 }, vix: 32 });
  assert(hot.risk === 1 && hot.cls === 'warn', 'risk-on with VIX>=30 keeps risk +1 but flags warn');
  assert(env.macroRegime({}).band === 'Unknown', 'no macro data => Unknown');
  assert(env.macroRegime({ vix: 28 }).risk === -1, 'VIX-only fallback: 28 => risk -1');
} catch (e) { failures++; console.log('  \u2717 FAIL (rlg group threw): ' + e.message); }

/* ---------- Options: realized-vol cone ---------- */
try {
  group('options-structure-lab.html \u2014 realized-vol cone');
  const src = read('options-structure-lab.html');
  const names = ['realizedVol', 'rvCone'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const bars = [];
  for (let i = 0; i < 120; i++) bars.push({ c: 100 * (1 + 0.001 * i) * (1 + 0.02 * Math.sin(i * 0.6)) });
  const rc = env.rvCone(bars);
  assert(rc && rc.term && rc.term[20] > 0 && isFinite(rc.term[20]), 'RV20 is positive & finite');
  assert(rc.cone && rc.cone.min <= rc.cone.med && rc.cone.med <= rc.cone.max, 'RV cone ordered min <= med <= max');
  assert(env.rvCone([{ c: 1 }, { c: 2 }]) === null, 'rvCone needs >= 40 bars');
} catch (e) { failures++; console.log('  \u2717 FAIL (options rv group threw): ' + e.message); }

/* ---------- Swing: weekly multi-timeframe trend ---------- */
try {
  group('swing-structure-lab.html \u2014 weekly multi-timeframe trend');
  const src = read('swing-structure-lab.html');
  const names = ['resampleWeekly', 'mtfTrend'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const base = Date.UTC(2025, 0, 1), up = [], dn = [];
  for (let i = 0; i < 220; i++) { const t = base + i * 864e5; up.push({ t, o: 100, h: 101, l: 99, c: 100 * Math.pow(1.002, i), v: 1 }); dn.push({ t, o: 100, h: 101, l: 99, c: 100 * Math.pow(0.998, i), v: 1 }); }
  assert(env.mtfTrend(up).trend === 'up', 'rising daily bars => weekly trend up');
  assert(env.mtfTrend(dn).trend === 'down', 'falling daily bars => weekly trend down');
  assert(env.mtfTrend([{ t: base, o: 1, h: 1, l: 1, c: 1, v: 1 }]) === null, 'mtfTrend needs >= 12 weeks');
} catch (e) { failures++; console.log('  \u2717 FAIL (swing mtf group threw): ' + e.message); }

/* ---------- Intraday: profile tags (single prints / poor highs) ---------- */
try {
  group('intraday-tape-lab.html \u2014 profile tags (single prints / poor high-low)');
  const src = read('intraday-tape-lab.html');
  const names = ['profileTags'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const buckets = [];
  for (let i = 0; i < 10; i++) buckets.push({ mid: 100 + i, up: 100, down: 100 });
  buckets[0] = { mid: 100, up: 5, down: 5 };     // thin low => poor low false
  buckets[3] = { mid: 103, up: 5, down: 5 };     // thin single-print shelf (neighbors heavier)
  buckets[5] = { mid: 105, up: 500, down: 500 }; // POC
  buckets[9] = { mid: 109, up: 400, down: 400 }; // heavy high => poor high
  const pt = env.profileTags({ buckets, hi: 110, lo: 100 });
  assert(pt && pt.poorHigh === true, 'heavy volume at the high => poor high');
  assert(pt.poorLow === false, 'thin volume at the low => not a poor low');
  assert(pt.singles.length >= 1 && pt.singles.indexOf(103) >= 0, 'thin middle bucket => single print at 103');
  assert(env.profileTags({ buckets: [] }) === null, 'profileTags needs >= 5 buckets');
} catch (e) { failures++; console.log('  \u2717 FAIL (intraday profile group threw): ' + e.message); }

/* ---------- Intraday + Swing: volume-profile shape (D/P/B/thin) ---------- */
try {
  group('intraday + swing \u2014 volume-profile shape (D/P/B/thin)');
  const srcI = read('intraday-tape-lab.html');
  const envI = build([extractFn(srcI, 'profileShape')], ['profileShape']);
  const mk = (pocIdx, pocV, base) => { const b = []; for (let i = 0; i < 11; i++) b.push({ mid: 100 + i, up: base / 2, down: base / 2 }); b[pocIdx] = { mid: 100 + pocIdx, up: pocV / 2, down: pocV / 2 }; return b; };
  // D-shape: POC mid, wide value area (not thin), unimodal
  assert(envI.profileShape({ buckets: mk(5, 1000, 100), vah: 108, val: 102, hi: 110, lo: 100 }).shape === 'D', 'POC mid + wide value area => D-shape');
  // P-shape: POC in the upper third
  assert(envI.profileShape({ buckets: mk(8, 1000, 100), vah: 110, val: 104, hi: 110, lo: 100 }).shape === 'P', 'POC high => P-shape');
  // thin/trend: value area tiny vs range
  assert(envI.profileShape({ buckets: mk(5, 1000, 100), vah: 105.6, val: 104.4, hi: 110, lo: 100 }).shape === 'thin', 'narrow value area vs range => thin/trend');
  // B-shape: two distributions
  const bB = mk(2, 1000, 40); bB[9] = { mid: 109, up: 300, down: 300 };
  assert(envI.profileShape({ buckets: bB, vah: 104, val: 100, hi: 110, lo: 100 }).shape === 'B', 'two distributions => B-shape');
  assert(envI.profileShape({ buckets: [] }) === null, 'profileShape needs >= 6 buckets');
  const srcS = read('swing-structure-lab.html');
  const envS = build([extractFn(srcS, 'profileShape')], ['profileShape']);
  assert(envS.profileShape({ buckets: mk(5, 1000, 100), vah: 108, val: 102, hi: 110, lo: 100 }).shape === 'D', 'swing profileShape classifies a balanced profile as D');
} catch (e) { failures++; console.log('  \u2717 FAIL (profile-shape group threw): ' + e.message); }

/* ---------- MSFT: risk-neutral scenario odds ---------- */
try {
  group('msft-july-print-model.html \u2014 risk-neutral scenario odds');
  const src = read('msft-july-print-model.html');
  const names = ['normCdfM', 'rnProbs'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const rn = env.rnProbs(370, 0.25, 267, 377, 540);
  assert(rn && approx(rn.bear + rn.base + rn.bull, 1, 1e-9), 'risk-neutral odds sum to 1');
  assert(rn.bear >= 0 && rn.base >= 0 && rn.bull >= 0, 'all odds non-negative');
  assert(rn.bull < rn.base, 'far-OTM bull target less likely than the base');
  assert(env.rnProbs(370, 0.25, 400, 377, 540) === null, 'non-monotone scenarios => null');
  assert(env.rnProbs(370, 0, 267, 377, 540) === null, 'zero vol => null');
} catch (e) { failures++; console.log('  \u2717 FAIL (msft rn group threw): ' + e.message); }

/* ---------- AI-Capex: shrinkage covariance ---------- */
try {
  group('ai-capex-strategy-lab.html \u2014 shrinkage covariance (empirical correlation)');
  const src = read('ai-capex-strategy-lab.html');
  const names = ['alignReturns', 'ledoitWolf'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const A = [100], B = [100], C = [100];
  for (let i = 1; i < 140; i++) { const s = Math.sin(i * 0.5) * 0.02; A.push(A[i - 1] * (1 + s + 0.001)); B.push(B[i - 1] * (1 + s * 0.95 + 0.0012)); C.push(C[i - 1] * (1 + Math.cos(i * 0.9) * 0.02 + 0.001)); }
  const al = env.alignReturns({ A, B, C }, ['A', 'B', 'C']);
  assert(al && al.tks.length === 3 && al.X.length >= 100, 'alignReturns builds 3 aligned return columns');
  const lw = env.ledoitWolf(al.X, al.tks);
  assert(lw && lw.corr['A|A'] === 1, 'diagonal correlation = 1');
  assert(lw.corr['A|B'] === lw.corr['B|A'], 'correlation matrix is symmetric');
  assert(lw.corr['A|B'] > lw.corr['A|C'], 'co-moving A,B more correlated than A,C');
  assert(lw.corr['A|B'] <= 0.99 && lw.corr['A|B'] >= -0.99, 'off-diagonal clamped to [-0.99, 0.99]');
  assert(lw.shrink > 0 && lw.shrink < 1, 'shrinkage intensity in (0,1)');
  assert(env.ledoitWolf([[1, 2]], ['A', 'B']) === null, 'ledoitWolf needs >= 20 observations');
} catch (e) { failures++; console.log('  \u2717 FAIL (ai-capex cov group threw): ' + e.message); }

/* ---------- Swing: per-signal edge backtest ---------- */
try {
  group('swing-structure-lab.html \u2014 per-signal edge backtest');
  const src = read('swing-structure-lab.html');
  const env = build([extractFn(src, 'signalEdge')], ['signalEdge']);
  // synthetic regime that lives on BOTH sides of the 200-day within the backtest window (i>=210):
  // uptrend to seed the 200-day, then a downtrend (price below), then an uptrend (price above)
  const closes = [];
  for (let i = 0; i < 260; i++) closes.push(100 * Math.pow(1.004, i));
  let base = closes[closes.length - 1];
  for (let i = 0; i < 120; i++) closes.push(base * Math.pow(0.985, i + 1));
  base = closes[closes.length - 1];
  for (let i = 0; i < 140; i++) closes.push(base * Math.pow(1.012, i + 1));
  const sma = (L, idx) => { if (idx < L - 1) return null; let s = 0; for (let j = idx - L + 1; j <= idx; j++) s += closes[j]; return s / L; };
  const full = [], ma = { m20: [], m50: [], m200: [] };
  for (let i = 0; i < closes.length; i++) { full.push({ c: closes[i] }); ma.m20.push(sma(20, i)); ma.m50.push(sma(50, i)); ma.m200.push(sma(200, i)); }
  const se = env.signalEdge(full, ma, 21);
  assert(se && se.groups['Vs 200-day'], 'signalEdge produces a Vs 200-day group');
  const v = {}; se.groups['Vs 200-day'].forEach((r) => { v[r.st] = r; });
  assert(v.Above && v.Below, 'both Above and Below 200-day states are sampled');
  assert(v.Above.hit > v.Below.hit, 'Above-200-day beats Below on forward hit-rate (edge recovered)');
  assert(v.Above.median > v.Below.median, 'Above-200-day forward median > Below');
  assert(env.signalEdge([{ c: 1 }], { m20: [], m50: [], m200: [] }, 21) === null, 'signalEdge needs >= 260 bars');
} catch (e) { failures++; console.log('  \u2717 FAIL (swing edge group threw): ' + e.message); }

/* ---------- Smart Money: disclosure-lag edge decay + consensus ---------- */
try {
  group('smart-money-flow-lab.html \u2014 disclosure-lag edge decay + consensus');
  const src = read('smart-money-flow-lab.html');
  const names = ['alphaDecay', 'dayGap', 'consensusScore', 'realisticEdgeFraction'];
  const env = build(names.map((n) => extractFn(src, n)), names);

  assert(env.alphaDecay(0, 15) === 1, 'alphaDecay(0,H) = 1 (no age, full edge)');
  assert(approx(env.alphaDecay(15, 15), 0.5, 1e-9), 'alphaDecay(H,H) = 0.5 (one half-life)');
  assert(approx(env.alphaDecay(45, 15), 0.125, 1e-9), 'alphaDecay(3H,H) = 12.5% (45d @ 15d half-life)');
  assert(env.alphaDecay(30, 15) < env.alphaDecay(10, 15), 'alphaDecay strictly decreasing in age');
  assert(env.alphaDecay(200, 15) > 0 && env.alphaDecay(0, 15) <= 1, 'alphaDecay stays in (0,1]');

  assert(env.dayGap('2026-05-20', '2026-06-28') === 39, 'dayGap counts whole days (STOCK-Act lag)');
  assert(env.dayGap('2026-06-28', '2026-05-20') === 0, 'dayGap clamps a reversed range to 0');
  assert(env.dayGap('not-a-date', '2026-06-28') === 0, 'dayGap is NaN-safe -> 0');

  assert(env.consensusScore(3, 1e6, 2, 15) > env.consensusScore(1, 1e6, 2, 15), 'consensus rises with distinct filers');
  assert(env.consensusScore(2, 5e6, 2, 15) > env.consensusScore(2, 1e5, 2, 15), 'consensus rises with net $');
  assert(env.consensusScore(2, 1e6, 40, 15) < env.consensusScore(2, 1e6, 2, 15), 'consensus falls as the cluster ages');

  assert(approx(env.realisticEdgeFraction(2, 15), env.alphaDecay(2, 15), 1e-12), 'realistic edge == decay at the disclosure lag');
  assert(env.realisticEdgeFraction(45, 15) < env.realisticEdgeFraction(2, 15), 'a 45-day 13F echo retains far less than a 2-day Form 4');
} catch (e) { failures++; console.log('  \u2717 FAIL (smart-money group threw): ' + e.message); }

/* ---------- Waterfront × Masters Water-Polo screener: geo + filter ---------- */
try {
  group('waterfront-polo-lab.html \u2014 geo distance, drive-time & market filter');
  const src = read('waterfront-polo-lab.html');
  const names = ['haversineMi', 'driveMinutesApprox', 'nearestClub', 'marketPasses'];
  const env = build(names.map((n) => extractFn(src, n)), names);

  // haversine: identity, symmetry, known city pair (Orlando <-> Tampa ~ 77-85 mi)
  assert(env.haversineMi(28.54, -81.38, 28.54, -81.38) === 0, 'haversineMi(p,p) = 0');
  assert(approx(env.haversineMi(28.54, -81.38, 27.95, -82.46), env.haversineMi(27.95, -82.46, 28.54, -81.38), 1e-9), 'haversineMi symmetric');
  const orlTpa = env.haversineMi(28.54, -81.38, 27.95, -82.46);
  assert(orlTpa > 60 && orlTpa < 95, 'Orlando<->Tampa great-circle ~77-85 mi, got ' + orlTpa.toFixed(1));

  // drive-time: 0 at 0, monotone, 38 mi @ 38 mph @ rf 1.0 = 60 min
  assert(env.driveMinutesApprox(0, 38, 1.25) === 0, 'driveMinutesApprox(0,...) = 0');
  assert(approx(env.driveMinutesApprox(38, 38, 1.0), 60, 1e-6), '38 mi @ 38 mph, rf 1.0 => 60 min');
  assert(env.driveMinutesApprox(50, 38, 1.25) > env.driveMinutesApprox(10, 38, 1.25), 'drive-time monotone in distance');
  assert(env.driveMinutesApprox(-5, 38, 1.25) === null && env.driveMinutesApprox(10, 0, 1.25) === null, 'guards bad input => null');

  // nearestClub: picks the closest of the set
  const clubs = [{ lat: 28.5, lon: -81.4 }, { lat: 27.9, lon: -82.5 }, { lat: 30.3, lon: -81.7 }];
  assert(env.nearestClub(28.55, -81.38, clubs).idx === 0, 'nearestClub picks the co-located Orlando club');
  assert(env.nearestClub(30.2, -81.65, clubs).idx === 2, 'nearestClub picks Jacksonville for a NE point');

  // marketPasses: budget-fit rank, drive-time gate, water/flood/surge/land/ins filters
  const base = { driveMin: 25, budgetFit: 'strong', water: 'lake', flood: 1, surge: 0, land: 3, insBand: 1 };
  const fAll = { withinOnly: true, minutes: 40, minFit: 'good', water: { lake: true, river: true, intracoastal: true, canalBay: true, ocean: true }, maxFlood: 4, maxSurge: 4, minLand: 1, maxIns: 3 };
  assert(env.marketPasses(base, fAll) === true, 'a strong, in-ring, low-risk lake market passes');
  assert(env.marketPasses(Object.assign({}, base, { driveMin: 55 }), fAll) === false, 'out-of-ring drive-time fails when withinOnly');
  assert(env.marketPasses(Object.assign({}, base, { budgetFit: 'over' }), fAll) === false, 'over-budget fails minFit >= good');
  assert(env.marketPasses(Object.assign({}, base, { budgetFit: 'partial' }), fAll) === false, 'partial (rank 1) fails minFit good (rank 2)');
  assert(env.marketPasses(base, Object.assign({}, fAll, { water: { lake: false, river: true, intracoastal: true, canalBay: true, ocean: true } })) === false, 'excluded water type fails');
  assert(env.marketPasses(Object.assign({}, base, { surge: 4 }), Object.assign({}, fAll, { maxSurge: 2 })) === false, 'high-surge market fails a low max-surge cap');
  assert(env.marketPasses(Object.assign({}, base, { land: 1 }), Object.assign({}, fAll, { minLand: 3 })) === false, 'low-land market fails a high land floor');
} catch (e) { failures++; console.log('  \u2717 FAIL (waterfront-polo group threw): ' + e.message); }

/* ---------- Strategy Validation: real-data walk-forward engine + robustness ---------- */
try {
  group('strategy-validation-lab.html \u2014 real-data walk-forward OOS + Deflated Sharpe');
  const src = read('strategy-validation-lab.html');
  const names = ['mulberry32', 'gaussR', 'genDemoSeries', 'seriesFromCloses', 'sma', 'realizedVol', 'backtest', 'buyHoldCurve', 'metrics', 'walkForward', 'scorePass', 'allPass', 'meanA', 'moments', 'normCdf', 'invNorm', 'deflatedSharpe'];
  const env = build(names.map((n) => extractFn(src, n)), names, 'var ANN=252, VOL_WIN=20;');

  // seriesFromCloses: REAL bars -> the same engine struct the synthetic lab uses
  const ramp = []; for (let i = 0; i < 200; i++) ramp.push(100 * Math.pow(1.001, i));
  const Sr = env.seriesFromCloses(ramp);
  assert(Sr && Sr.days === 199, 'seriesFromCloses: days = closes.length - 1');
  assert(approx(Sr.fwd[0], 0.001, 1e-9), 'seriesFromCloses: forward return matches the bar ratio');
  assert(Sr.pPx[1] === ramp[0] && approx(Sr.pPx[2], ramp[0] + ramp[1], 1e-6), 'seriesFromCloses: price prefix-sum is correct');
  assert(env.seriesFromCloses([1, 2, 3]) === null, 'seriesFromCloses rejects < 120 bars (no stub series)');

  // metrics on a known positive-drift path
  const rr = [0.01, 0.02, 0.01, 0.02, 0.01, 0.02, 0.01, 0.02], curve = []; let eq = 1;
  for (let i = 0; i < rr.length; i++) { eq *= (1 + rr[i]); curve.push(eq); }
  const mm = env.metrics({ curve, r: rr, expo: rr.map(() => 1) });
  assert(mm.cagr > 0 && mm.sharpe > 0, 'metrics: positive-drift path => positive CAGR & Sharpe');
  assert(approx(mm.tim, 1, 1e-9), 'metrics: fully-invested path => time-in-market = 1');

  // walk-forward on a DETERMINISTIC strong-bull synthetic (seed-reproducible)
  const L = { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 };
  const bull = env.genDemoSeries(12345, 8, [{ frac: 1, muAnnual: 0.18, sigAnnual: 0.11 }]);
  const Sb = env.seriesFromCloses(bull);
  const wf = env.walkForward(Sb, L, 4, 0.6, 5);
  assert(wf.oos !== null && isFinite(wf.oos.sharpe), 'walkForward: produces a finite out-of-sample Sharpe');
  assert(wf.usable > 0 && wf.oosCurve.length > 20, 'walkForward: stitches usable OOS folds');
  assert(wf.oos.tim > 0 && wf.folds.length === 4, 'walkForward: long-biased rule takes OOS exposure; one record per fold');

  // embargo PURGES leakage — a massive embargo can never leave MORE usable OOS
  const wfBig = env.walkForward(Sb, L, 4, 0.6, 100000);
  assert(wfBig.usable <= wf.usable, 'walkForward: larger embargo never increases usable OOS (purge, not peek)');

  // goal scorecard (judged OOS)
  const goal = { targetCagr: 0.08, sharpeFloor: 0.7, maxDdCeiling: 0.30, minTimeInMarket: 0.25 };
  assert(env.allPass(env.scorePass({ cagr: 0.2, sharpe: 1.5, maxDd: 0.1, tim: 0.5 }, goal)) === true, 'scorePass/allPass: a clearly-good OOS result passes all four targets');
  assert(env.allPass(env.scorePass({ cagr: 0.02, sharpe: 0.3, maxDd: 0.5, tim: 0.1 }, goal)) === false, 'scorePass/allPass: a weak OOS result fails');

  // Deflated Sharpe on the REAL stitched OOS equity curve
  const d = env.deflatedSharpe(wf.oosCurve, 8);
  assert(d && d.dsr >= 0 && d.dsr <= 1 && d.psr >= 0 && d.psr <= 1, 'deflatedSharpe: DSR/PSR are probabilities in [0,1]');
  assert(d.dsr <= d.psr + 1e-9, 'deflatedSharpe: an 8-trial discount only lowers Sharpe confidence');
  assert(approx(env.normCdf(env.invNorm(0.9)), 0.9, 2e-3), 'lifted stats: invNorm/normCdf round-trip holds');
} catch (e) { failures++; console.log('  \u2717 FAIL (strategy-validation group threw): ' + e.message); }

/* ---------- Sector lab: ETF-selector risk / liquidity / drawdown helpers ---------- */
try {
  group('sector-research-lab.html \u2014 ETF-selector metrics (drawdown, dollar ADV, Sharpe-like, tracking error / beta / info ratio)');
  const src = read('sector-research-lab.html');
  const names = ['maxDD', 'advDollar', 'annualize', 'sharpeLike', 'mean', 'variance', 'stdev', 'covar', 'activeStats'];
  const env = build(names.map((n) => extractFn(src, n)), names, 'var ANN=252;');

  // maxDD: peak-to-trough fraction in [0,1]
  assert(env.maxDD([1, 2, 3, 4, 5]) === 0, 'maxDD: a monotonically rising path has zero drawdown');
  assert(approx(env.maxDD([100, 50]), 0.5, 1e-12), 'maxDD: halving from the peak = 0.50');
  assert(approx(env.maxDD([100, 120, 60, 90]), 0.5, 1e-12), 'maxDD: worst peak(120)->trough(60) = 0.50, not the later partial recovery');
  assert(env.maxDD([100]) === null, 'maxDD: a <2-point series is null');

  // advDollar: average price x volume over the last k bars (liquidity proxy)
  assert(approx(env.advDollar([10, 10, 10], [100, 100, 100], 21), 1000, 1e-9), 'advDollar: constant $10 x 100sh = $1,000/day');
  assert(approx(env.advDollar([10, 20], [100, 100], 1), 2000, 1e-9), 'advDollar: k=1 uses only the last bar ($20 x 100)');
  assert(env.advDollar([10, 10], null, 21) === null, 'advDollar: no volume series -> null');

  // annualize + sharpeLike: risk-adjusted momentum
  assert(approx(env.annualize(0.10, 365), 0.10, 1e-9), 'annualize: +10% over exactly 1y is 10%/yr');
  assert(env.annualize(0.10, 182) > 0.19, 'annualize: +10% in ~6mo compounds to >19%/yr');
  const shHi = env.sharpeLike(0.20, 182, 0.20, 0.04);
  const shLo = env.sharpeLike(0.05, 182, 0.20, 0.04);
  assert(shHi > shLo, 'sharpeLike: same vol, higher return -> higher score');
  assert(env.sharpeLike(0.20, 182, 0.10, 0.04) > shHi, 'sharpeLike: same return, lower vol -> higher score');
  assert(env.sharpeLike(0.20, 182, 0, 0.04) === null, 'sharpeLike: zero vol -> null (no divide-by-zero)');

  // activeStats: tracking error / beta / information ratio of a candidate ETF vs its sector SPDR (aligned daily returns)
  const bmk = []; for (let i = 0; i < 60; i++) bmk.push(0.01 * Math.sin(i * 0.5));
  assert(env.activeStats([1, 2, 3], [1, 2, 3]) === null, 'activeStats: <20 aligned points -> null');
  const same = env.activeStats(bmk, bmk);
  assert(same && approx(same.te, 0, 1e-9), 'activeStats: identical series -> zero tracking error');
  assert(same && approx(same.beta, 1, 1e-9), 'activeStats: identical series -> beta 1.00');
  assert(same && same.ir === null, 'activeStats: identical series -> info ratio null (no drift, TE=0)');
  const amp = bmk.map((x) => 1.5 * x);
  const st = env.activeStats(amp, bmk);
  assert(st && approx(st.beta, 1.5, 1e-9), 'activeStats: a = 1.5x the sector -> beta 1.50 (amplifies the move)');
  assert(st && st.te > 0, 'activeStats: an amplified fund has positive tracking error (drifts from the sector)');
  const drift = bmk.map((x, i) => x + 0.001 + 0.003 * Math.sin(i * 0.9));
  const dr = env.activeStats(drift, bmk);
  assert(dr && dr.ir > 0, 'activeStats: a fund with positive mean active return -> positive information ratio');
  assert(dr && dr.te > 0, 'activeStats: a drifting fund has positive tracking error');
} catch (e) { failures++; console.log('  \u2717 FAIL (sector-lab group threw): ' + e.message); }

/* ---------- sector-research-lab: Simple-mode two-clock timing + steerable verdict ---------- */
try {
  group('sector-research-lab.html \u2014 Simple cockpit: entryTiming (two clocks) + rotationVerdict (steerable)');
  const src = read('sector-research-lab.html');
  const names = ['entryTiming', 'rotationVerdict'];
  const env = build(names.map((n) => extractFn(src, n)), names);

  // entryTiming — the rotation clock (early / mid / late)
  const early = env.entryTiming(101, -0.03, 55, 0.02, 0.4, 1);   // accel>0, behind 6M, calm price
  assert(early.clock === 'early' && early.action === 'go', 'entryTiming: accelerating former-laggard, calm price -> early / GO');
  const peaking = env.entryTiming(105, 0.09, 60, 0.05, -0.5, 1); // leading but decelerating
  assert(peaking.clock === 'late' && peaking.action === 'catalyst', 'entryTiming: leading + decelerating -> late / CATALYST (do not chase)');
  assert(env.entryTiming(99, 0.01, 50, 0, 0, 1).clock === 'mid', 'entryTiming: flat momentum -> mid-move');

  // entryTiming — the price clock (aggressiveness shifts overbought tolerance)
  const ob = env.entryTiming(101, -0.03, 74, 0.02, 0.4, 1);      // early but RSI>70
  assert(ob.price === 'overbought' && ob.action === 'scale', 'entryTiming: early but overbought -> SCALE IN (normal)');
  assert(env.entryTiming(101, -0.03, 74, 0.02, 0.4, 2).action === 'go', 'entryTiming: same overbought early name -> GO when aggressive');
  assert(env.entryTiming(101, -0.03, 74, 0.02, 0.4, 0).action === 'wait', 'entryTiming: same overbought early name -> WAIT when cautious');

  // rotationVerdict — ranking, actions, headline (models the live XLV-accelerating vs XLF-decelerating split)
  const rows = [
    { id: 'XLV', etf: 'XLV', side: 'into', accel: 1.0, rsRatio: 101, x1: 0.03, x3: 0.11, x6: -0.03, rsi: 72, stretch: 0.06, stateT: 'Improving \u2191', defensive: true },
    { id: 'XLF', etf: 'XLF', side: 'into', accel: -1.1, rsRatio: 103, x1: 0.02, x3: 0.12, x6: -0.07, rsi: 73, stretch: 0.04, stateT: 'Leading', defensive: false },
    { id: 'XLK', etf: 'XLK', side: 'out', accel: -0.6, rsRatio: 108, x3: 0.13, stateT: 'Peaking \u26a0' }
  ];
  const v = env.rotationVerdict(rows, { horizon: '1-4wk', style: 'balanced', aggr: 1 });
  assert(v.into.length === 2 && v.out.length === 1, 'rotationVerdict: splits rows by side (2 into, 1 out)');
  assert(v.into[0].id === 'XLV', 'rotationVerdict (1-4wk): the accelerating name (XLV) outranks the decelerating one (XLF)');
  assert(v.into.find((o) => o.id === 'XLF').action === 'catalyst', 'rotationVerdict: XLF (leading but decelerating) reads CATALYST, not a fresh buy');
  assert(v.out[0].id === 'XLK' && /trim|profit|rolling/i.test(v.out[0].why), 'rotationVerdict: XLK is the trim, flagged as rolling over');
  assert(/XLV/.test(v.headline) && /trim/i.test(v.headline), 'rotationVerdict: headline names the top INTO and the trim');
  assert(env.rotationVerdict([], {}).into.length === 0, 'rotationVerdict: empty rows -> empty verdict (no throw)');
} catch (e) { failures++; console.log('  \u2717 FAIL (sector Simple-cockpit group threw): ' + e.message); }

/* ---------- summary ---------- */
console.log('\n' + '='.repeat(48));
console.log('Research-Lab self-test: ' + passes + ' passed, ' + failures + ' failed');
console.log('='.repeat(48));
process.exit(failures ? 1 : 0);
