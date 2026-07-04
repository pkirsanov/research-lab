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

/* ---------- summary ---------- */
console.log('\n' + '='.repeat(48));
console.log('Research-Lab self-test: ' + passes + ' passed, ' + failures + ' failed');
console.log('='.repeat(48));
process.exit(failures ? 1 : 0);
