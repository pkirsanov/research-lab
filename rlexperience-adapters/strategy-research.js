/*
 * rlexperience-adapters/strategy-research.js
 * ------------------------------------------------------------------------
 * Feature 012 Scope 07 — Strategy Simple adapters.
 *
 * This module is the SINGLE OWNER SOURCE for the strategy Simple model formulas
 * it extracts. The owning tool pages consume the exact same exported pure owner
 * functions in their Power path (see strategy-self-improvement-lab.html and
 * smart-money-flow-lab.html), and the registered Simple adapters call the same
 * functions — so Simple and Power share one formula and no formula is copied
 * inline (owner-parity, the F-05-SS-OPTIONS single-source lesson).
 *
 * Adapters are PURE COMPUTE over already-captured, frozen owner state. They
 * NEVER fetch, providerFetch, read local credentials, call an LLM, a public
 * publisher, or a private store; they never mutate owner state; and they never
 * import another domain adapter module. Data acquisition (RLDATA cache reads /
 * scenario loading) stays in the owning page; the page hands the adapter an
 * already-loaded, frozen owner snapshot through captureEvidence.
 *
 * Stochastic strategy simulation is DETERMINISTIC under an explicit integer
 * seed: the seeded synthetic path comes only from the single-sourced mulberry32
 * PRNG, so the same seed always yields the same path (SCN-012-002). No
 * Date.now(), Math.random(), or hidden reseed participates. The Scope 04 core
 * supplies the common-random-number orchestration (same seed baseline+current =>
 * common-random-numbers mode; seed change => path-separated) and enforces
 * per-compute-identity determinism; this module supplies the owner's seeded
 * process and keeps parameter sensitivity separate from path randomness.
 *
 * Registration is by the exact declared adapter IDs from simple-models.json.
 * A tool whose owner seam is not yet extracted is simply absent from the
 * returned adapter set, so the shared runtime renders the Scope 04 explicit
 * "unavailable" truth state for it — never an invented signal or default.
 *
 * Ships as a UMD dual module: Node (module.exports) for tests, and browser
 * global RLSTRATEGY for the owning pages.
 */
(function (factory) {
  "use strict";
  var root = (typeof globalThis !== "undefined") ? globalThis :
    ((typeof window !== "undefined") ? window : {});
  var metrics = root.RLMETRICS;
  if (!metrics && typeof module === "object" && module && module.exports && typeof require === "function") {
    metrics = require("../rlmetrics.js");
  }
  if (!metrics) throw new Error("RLMETRICS must be loaded before RLSTRATEGY");
  var api = Object.freeze(factory(metrics));
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLSTRATEGY_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLSTRATEGY = api;
})(function (RLMETRICS) {
  "use strict";

  /* Owner backtest constants — byte-identical to strategy-self-improvement-lab.html
     (VOL_WIN = 20, ANN = 252). Single-sourcing these here keeps the extracted seeded
     evaluation engine identical to the delegating page. */
  var VOL_WIN = 20, ANN = RLMETRICS.TRADING_DAYS;

  /* ═══════════ seeded-path owner primitives (single source; consumed by Power + Simple) ═══════════
     These mirror the strategy-self-improvement-lab.html owner helpers EXACTLY. The page delegates
     to them so the page carries no inline PRNG / path / backtest / walk-forward formula copy. */

  /* mulberry32: the owner deterministic PRNG. Byte-identical to the page's mulberry32. Given the
     same 32-bit seed it always yields the same stream — the reproducibility (SCN-012-002) core. */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* gauss: Box-Muller standard-normal draw from a [0,1) rng. Byte-identical to the page's gauss. */
  function gauss(rng) {
    var u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* genSeries: the owner seeded synthetic price path from regime (mu, sigma) fractions. A geometric
     path driven only by mulberry32(seed) + gauss, with prefix sums for O(1) rolling means/vols.
     Byte-identical to the page's genSeries; the same seed always yields the same path. */
  function genSeries(seed, years, regimes) {
    var days = Math.max(400, Math.round(years * ANN));
    var rng = mulberry32(seed >>> 0);
    var bounds = [], acc = 0, tot = 0, i;
    for (i = 0; i < regimes.length; i++) tot += regimes[i].frac;
    for (i = 0; i < regimes.length; i++) { acc += regimes[i].frac / tot; bounds.push(Math.round(acc * days)); }
    var px = new Float64Array(days + 1); px[0] = 100;
    var seg = 0;
    for (i = 0; i < days; i++) {
      while (seg < regimes.length - 1 && i >= bounds[seg]) seg++;
      var muA = regimes[seg].muAnnual, sgA = regimes[seg].sigAnnual;
      var mu = muA / ANN, sg = sgA / Math.sqrt(ANN);
      var r = (mu - 0.5 * sg * sg) + sg * gauss(rng);
      px[i + 1] = px[i] * Math.exp(r);
    }
    var fwd = new Float64Array(days), past = new Float64Array(days + 1);
    for (i = 0; i < days; i++) fwd[i] = px[i + 1] / px[i] - 1;
    for (i = 1; i <= days; i++) past[i] = px[i] / px[i - 1] - 1;
    var pPx = new Float64Array(days + 2), pR = new Float64Array(days + 2), pR2 = new Float64Array(days + 2);
    for (i = 0; i <= days; i++) { pPx[i + 1] = pPx[i] + px[i]; }
    for (i = 0; i <= days; i++) { pR[i + 1] = pR[i] + past[i]; pR2[i + 1] = pR2[i] + past[i] * past[i]; }
    return { days: days, px: px, fwd: fwd, past: past, pPx: pPx, pR: pR, pR2: pR2 };
  }

  /* sma: rolling mean of px[i-w+1 .. i]; valid i>=w-1. Byte-identical to the page's sma. */
  function sma(S, w, i) {
    if (i < w - 1) return NaN;
    return (S.pPx[i + 1] - S.pPx[i + 1 - w]) / w;
  }

  /* realizedVol: annualised std of past returns over the trailing VOL_WIN ending at i. Byte-identical
     to the page's realizedVol. */
  function realizedVol(S, i) {
    if (i < VOL_WIN) return NaN;
    var n = VOL_WIN, a = i - VOL_WIN + 1, b = i + 1;
    var s = S.pR[b] - S.pR[a], s2 = S.pR2[b] - S.pR2[a];
    var varr = Math.max(0, s2 / n - (s / n) * (s / n));
    return Math.sqrt(varr) * Math.sqrt(ANN);
  }

  /* backtest: the owner mechanical rule over [start,end) of the forward-return index — trend (fast>slow)
     AND positive momentum, vol-targeted exposure capped at maxLeverage, with a trailing draw-down stop.
     Byte-identical to the page's backtest. */
  function backtest(S, L, start, end) {
    var eq = 1, stopped = false, peakEq = 1;
    var curve = [], stratR = [], expo = [];
    var warm = Math.max(L.slow, L.momLookback, VOL_WIN) + 1;
    var s = Math.max(start, warm), e = Math.min(end, S.days);
    for (var i = s; i < e; i++) {
      var f = sma(S, Math.round(L.fast), i), sl = sma(S, Math.round(L.slow), i);
      var mom = (i >= L.momLookback) ? (S.px[i] / S.px[i - Math.round(L.momLookback)] - 1) : NaN;
      var rv = realizedVol(S, i);
      var longOK = (f > sl) && (mom > 0);
      if (!longOK) { stopped = false; peakEq = eq; }
      var want = 0;
      if (longOK && !stopped) {
        var target = (rv > 1e-6) ? (L.volTarget / rv) : L.maxLeverage;
        want = Math.max(0, Math.min(L.maxLeverage, target));
      }
      if (want > 0) {
        if (eq > peakEq) peakEq = eq;
        if (eq < peakEq * (1 - L.stopDd)) { stopped = true; want = 0; }
      }
      var pnl = want * S.fwd[i];
      eq *= (1 + pnl);
      curve.push(eq); stratR.push(pnl); expo.push(want);
    }
    return { curve: curve, r: stratR, expo: expo, start: s, end: e };
  }

  /* metrics: CAGR / annualised vol / Sharpe / max draw-down / time-in-market / hit-rate over a backtest.
     Shared annualisation and arithmetic Sharpe delegate to rlmetrics.js; the strategy-specific
     draw-down, exposure, and hit-rate reductions remain here. */
  function metrics(bt) {
    var r = bt.r, n = r.length;
    if (n < 5) return { cagr: 0, vol: 0, sharpe: 0, maxDd: 0, tim: 0, hit: 0, n: n };
    var i;
    var eq = bt.curve[n - 1] || 1;
    var cagr = eq > 0 ? Math.pow(eq, ANN / n) - 1 : -1;
    var canonicalVol = RLMETRICS.annualizedVol(r, ANN);
    var canonicalSharpe = RLMETRICS.sharpeArithmetic(r, ANN, 0);
    var vol = canonicalVol === null ? 0 : canonicalVol;
    var sharpe = canonicalSharpe === null ? 0 : canonicalSharpe;
    var peak = -Infinity, maxDd = 0;
    for (i = 0; i < n; i++) { if (bt.curve[i] > peak) peak = bt.curve[i]; var dd = 1 - bt.curve[i] / peak; if (dd > maxDd) maxDd = dd; }
    var inMkt = 0, up = 0;
    for (i = 0; i < n; i++) { if (bt.expo[i] > 0) { inMkt++; if (r[i] > 0) up++; } }
    return { cagr: cagr, vol: vol, sharpe: sharpe, maxDd: maxDd, tim: inMkt / n, hit: inMkt ? up / inMkt : 0, n: n };
  }

  /* walkForward: per-fold in-sample / out-of-sample split with concatenated OOS metrics. The headline
     OOS Sharpe is the mean per-fold OOS Sharpe (more robust than the stitched path). Byte-identical to
     the page's walkForward. */
  function walkForward(S, L, folds, trainRatio) {
    var warm = Math.max(L.slow, L.momLookback, VOL_WIN) + 1;
    var lo = warm, hi = S.days, span = hi - lo;
    var out = { folds: [], meanIs: 0, meanOos: 0, oos: null };
    if (span < folds * 60) return out;
    var flen = Math.floor(span / folds);
    var oosConcat = { curve: [], r: [], expo: [] }, eqAcc = 1;
    var sumIs = 0, sumOos = 0, k;
    for (k = 0; k < folds; k++) {
      var fs = lo + k * flen, fe = (k === folds - 1) ? hi : fs + flen;
      var isEnd = fs + Math.floor((fe - fs) * trainRatio);
      var isBt = backtest(S, L, fs, isEnd), oosBt = backtest(S, L, isEnd, fe);
      var isM = metrics(isBt), oosM = metrics(oosBt);
      sumIs += isM.sharpe; sumOos += oosM.sharpe;
      out.folds.push({ is: isM.sharpe, oos: oosM.sharpe });
      for (var j = 0; j < oosBt.r.length; j++) { eqAcc *= (1 + oosBt.r[j]); oosConcat.curve.push(eqAcc); oosConcat.r.push(oosBt.r[j]); oosConcat.expo.push(oosBt.expo[j]); }
    }
    out.meanIs = sumIs / folds; out.meanOos = sumOos / folds;
    out.oos = metrics({ curve: oosConcat.curve, r: oosConcat.r, expo: oosConcat.expo });
    out.oos.sharpe = out.meanOos;
    return out;
  }

  /* ═══════════ real-data walk-forward owner primitives (single source; consumed by Power + Simple) ═══════════
     These mirror the strategy-validation-lab.html owner helpers EXACTLY. The owning page delegates to them so it
     carries no inline real-data walk-forward formula copy (owner-parity). They reuse the sma / realizedVol /
     backtest / metrics engine already single-sourced above. The page's Bailey-Lopez de Prado deflated Sharpe is
     NOT extracted here — it stays RLVALID-owned (Feature 007) on the page; this module never re-implements it. */

  /* seriesFromCloses: adapt a real closes[] array into the same engine S struct the seeded genSeries produces,
     so backtest / walkForwardEmbargo / metrics run unchanged on REAL prices. Rejects < 120 bars (no stub series).
     Byte-identical to the page's seriesFromCloses. */
  function seriesFromCloses(closes) {
    var days = closes.length - 1, i;
    if (days < 120) return null;
    var px = new Float64Array(days + 1);
    for (i = 0; i <= days; i++) px[i] = closes[i];
    var fwd = new Float64Array(days), past = new Float64Array(days + 1);
    for (i = 0; i < days; i++) fwd[i] = px[i + 1] / px[i] - 1;
    for (i = 1; i <= days; i++) past[i] = px[i] / px[i - 1] - 1;
    var pPx = new Float64Array(days + 2), pR = new Float64Array(days + 2), pR2 = new Float64Array(days + 2);
    for (i = 0; i <= days; i++) pPx[i + 1] = pPx[i] + px[i];
    for (i = 0; i <= days; i++) { pR[i + 1] = pR[i] + past[i]; pR2[i + 1] = pR2[i] + past[i] * past[i]; }
    return { days: days, px: px, fwd: fwd, past: past, pPx: pPx, pR: pR, pR2: pR2 };
  }

  /* buyHoldCurve: the benchmark buy-and-hold equity curve over [start,end). Byte-identical to the page's
     buyHoldCurve. */
  function buyHoldCurve(S, start, end) {
    var eq = 1, out = [];
    for (var i = start; i < end; i++) { eq *= (1 + S.fwd[i]); out.push(eq); }
    return out;
  }

  /* walkForwardEmbargo: the owner walk-forward engine WITH a data-leakage EMBARGO — OOS scoring starts `embargo`
     days after the train cut so the rule warm-up window cannot reach back into in-sample. Reuses the single-
     sourced backtest / metrics / buyHoldCurve. Byte-identical to the page's walkForward (embargo variant); its
     return shape { folds, meanIs, meanOos, oos, oosCurve, bhCurve, usable } is unchanged. Distinct from the
     no-embargo walkForward above (span < folds * 80 guard, per-fold embargo purge, usable count). */
  function walkForwardEmbargo(S, L, folds, trainRatio, embargo) {
    embargo = embargo || 0;
    var warm = Math.max(L.slow, L.momLookback, VOL_WIN) + 1;
    var lo = warm, hi = S.days, span = hi - lo;
    var out = { folds: [], meanIs: 0, meanOos: 0, oos: null, oosCurve: [], bhCurve: [], usable: 0 };
    if (span < folds * 80) return out;
    var flen = Math.floor(span / folds);
    var oosConcat = { curve: [], r: [], expo: [] }, eqAcc = 1, bhAcc = 1;
    var sumIs = 0, sumOos = 0, used = 0, k;
    for (k = 0; k < folds; k++) {
      var fs = lo + k * flen, fe = (k === folds - 1) ? hi : fs + flen;
      var isEnd = fs + Math.floor((fe - fs) * trainRatio);
      var oosStart = Math.min(isEnd + embargo, fe);
      if (fe - oosStart < 30) { out.folds.push({ is: NaN, oos: NaN }); continue; }
      var isBt = backtest(S, L, fs, isEnd), oosBt = backtest(S, L, oosStart, fe);
      var isM = metrics(isBt), oosM = metrics(oosBt);
      sumIs += isM.sharpe; sumOos += oosM.sharpe; used++;
      out.folds.push({ is: isM.sharpe, oos: oosM.sharpe });
      var bh = buyHoldCurve(S, oosStart, fe);
      for (var j = 0; j < oosBt.r.length; j++) {
        eqAcc *= (1 + oosBt.r[j]); oosConcat.curve.push(eqAcc); oosConcat.r.push(oosBt.r[j]); oosConcat.expo.push(oosBt.expo[j]);
      }
      for (var b = 0; b < bh.length; b++) { bhAcc *= (bh[b] / (b ? bh[b - 1] : 1)); out.bhCurve.push(bhAcc); }
    }
    out.usable = used;
    if (!used) return out;
    out.meanIs = sumIs / used; out.meanOos = sumOos / used;
    out.oos = metrics({ curve: oosConcat.curve, r: oosConcat.r, expo: oosConcat.expo });
    out.oos.sharpe = out.meanOos;
    out.oosCurve = oosConcat.curve;
    return out;
  }

  /* scorePass: judge OOS metrics against the four owner goal targets. Byte-identical to the page's scorePass. */
  function scorePass(m, g) {
    return { cagr: m.cagr >= g.targetCagr, sharpe: m.sharpe >= g.sharpeFloor, maxDd: m.maxDd <= g.maxDdCeiling, tim: m.tim >= g.minTimeInMarket };
  }

  /* allPass: the OOS result holds only when all four goal targets pass. Byte-identical to the page's allPass. */
  function allPass(p) { return p.cagr && p.sharpe && p.maxDd && p.tim; }

  /* ═══════════ shared numeric helpers ═══════════ */

  function isFiniteNumber(value) { return typeof value === "number" && isFinite(value); }

  function roundTo(value, digits) {
    if (!isFiniteNumber(value)) return null;
    var factor = Math.pow(10, digits);
    return Math.round(value * factor) / factor;
  }

  /* ═══════════ strategy-evolution Simple model (owner seam = strategy-self-improvement-lab.html) ═══════════
     The adapter's Simple question: under an explicit numeric GOAL, ONE allowed VARIABLE, a search BUDGET,
     an OVERFIT penalty, a path SEED, an acceptance THRESHOLD, and a walk-forward FOLD count, run a bounded
     seeded one-variable search over the owner scenario and report the accepted/rejected change. It REUSES
     the single-sourced owner seeded path + walk-forward engine (no re-implementation) — the seeded path is
     the reproducibility core (SCN-012-002). The bounded search / penalty / acceptance is the adapter's own
     Simple question, distinct from the page's Power improveOnce ledger. */

  /* The Simple "variable" enum maps to exactly one owner lever key. Only these four levers are exposed as
     the single allowed Simple search variable; the rest of the rule stays at the owner baseline. */
  var VARIABLE_TO_LEVER = {
    "trend-window": "fast",
    "momentum-window": "momLookback",
    "vol-target": "volTarget",
    "trailing-stop": "stopDd"
  };

  /* The Simple "goal" enum maps to the owner OOS metric that is optimized. drawdown is minimized (lower is
     better); cagr and sharpe are maximized. */
  function goalMetric(goal, oos) {
    if (goal === "cagr") return isFiniteNumber(oos.cagr) ? oos.cagr : null;
    if (goal === "drawdown") return isFiniteNumber(oos.maxDd) ? oos.maxDd : null;
    return isFiniteNumber(oos.sharpe) ? oos.sharpe : null; // sharpe (default)
  }

  function goalMaximizes(goal) { return goal !== "drawdown"; }

  /* Enumerate the candidate values of one owner lever across its range (min..max by step), ordered by
     nearness to the baseline value and capped at the search budget. This is the adapter's own bounded
     search plan — a distinct Simple question, not a copy of the page's improveOnce sweep. */
  function candidateValues(range, baseValue, budget) {
    if (!range || !isFiniteNumber(range.min) || !isFiniteNumber(range.max) || !isFiniteNumber(range.step) || range.step <= 0) return [];
    var all = [];
    for (var v = range.min; v <= range.max + range.step * 1e-9; v += range.step) {
      var value = Math.round(v * 1e9) / 1e9;
      if (Math.abs(value - baseValue) < range.step * 1e-6) continue; // exclude the baseline itself
      all.push(value);
    }
    all.sort(function (a, b) {
      var da = Math.abs(a - baseValue), db = Math.abs(b - baseValue);
      if (da !== db) return da - db;
      return a - b;
    });
    var cap = Math.max(0, Math.min(all.length, Math.floor(budget)));
    return all.slice(0, cap).sort(function (a, b) { return a - b; });
  }

  /* Run the bounded seeded one-variable search + acceptance rule over one frozen owner scenario under the
     current Simple parameters. Every path derives from the single-sourced owner seeded evaluation engine;
     nothing is fabricated and no missing evidence becomes a default. */
  function computeStrategyEvolutionSummary(ownerState, params) {
    var goal = params.goal;
    var variable = params.variable;
    var budget = params["search-budget"];
    var overfitPenalty = params["overfit-penalty"];
    var seed = params.seed;
    var acceptanceThreshold = params["acceptance-threshold"];
    var folds = params["walk-forward-folds"];

    var years = isFiniteNumber(ownerState.years) ? ownerState.years : 8;
    var regimes = Array.isArray(ownerState.regimes) ? ownerState.regimes : [];
    var startLevers = (ownerState.startLevers && typeof ownerState.startLevers === "object") ? ownerState.startLevers : {};
    var leverRanges = (ownerState.leverRanges && typeof ownerState.leverRanges === "object") ? ownerState.leverRanges : {};
    var trainRatio = (ownerState.walkForward && isFiniteNumber(ownerState.walkForward.trainRatio)) ? ownerState.walkForward.trainRatio : 0.6;

    var leverKey = VARIABLE_TO_LEVER[variable] || "fast";
    var baseLever = isFiniteNumber(startLevers[leverKey]) ? startLevers[leverKey] : null;
    var range = leverRanges[leverKey] || null;

    // Single-sourced seeded path — the reproducibility core. The Simple seed drives the owner path.
    var series = genSeries(seed, years, regimes);

    // Baseline OOS via the single-sourced owner walk-forward engine.
    var baseWf = walkForward(series, startLevers, folds, trainRatio);
    var baseOos = baseWf.oos || { cagr: 0, sharpe: 0, maxDd: 0, tim: 0 };
    var baseScore = goalMetric(goal, baseOos);

    // Bounded seeded search over the ONE selected lever.
    var maximizes = goalMaximizes(goal);
    var sweptValues = (baseLever == null) ? [] : candidateValues(range, baseLever, budget);
    var evaluated = [];
    var best = null;
    sweptValues.forEach(function (value) {
      var levers = cloneLevers(startLevers);
      levers[leverKey] = value;
      var wf = walkForward(series, levers, folds, trainRatio);
      var oos = wf.oos || { cagr: 0, sharpe: 0, maxDd: 0, tim: 0 };
      var score = goalMetric(goal, oos);
      var isMean = wf.meanIs;
      var oosMean = wf.meanOos;
      evaluated.push({ value: value, score: roundTo(score, 6), oosSharpe: roundTo(oosMean, 6), gap: roundTo(isMean - oosMean, 6) });
      if (score == null) return;
      var better = best == null || (maximizes ? score > best.score : score < best.score);
      if (better) {
        best = { leverKey: leverKey, from: baseLever, to: value, score: score, oosSharpe: oosMean, isSharpe: isMean, gap: isMean - oosMean, oos: oos };
      }
    });

    // Overfit penalty: an explicit multiple-testing discount that scales with the search breadth actually
    // spent (trials / budget) and the user's overfit-penalty weight, subtracted from the raw goal delta.
    var trials = evaluated.length;
    var breadth = budget > 0 ? Math.min(1, trials / budget) : 0;
    var rawDelta = (best == null || baseScore == null) ? null : (maximizes ? best.score - baseScore : baseScore - best.score);
    var penalty = overfitPenalty * breadth;
    var penalizedDelta = rawDelta == null ? null : rawDelta - penalty * Math.abs(rawDelta);
    var accepted = penalizedDelta != null && penalizedDelta >= acceptanceThreshold;

    return {
      goal: goal,
      variable: variable,
      leverKey: leverKey,
      searchBudget: budget,
      overfitPenalty: overfitPenalty,
      seed: seed,
      acceptanceThreshold: acceptanceThreshold,
      walkForwardFolds: folds,
      trainRatio: trainRatio,
      path: {
        seed: seed,
        days: series.days,
        pathIdentity: pathIdentity(series),
        terminalMultiple: roundTo(series.px[series.days] / series.px[0], 6),
        meanDailyReturn: roundTo(meanForward(series), 8)
      },
      goalScore: {
        goal: goal,
        maximizes: maximizes,
        baseline: roundTo(baseScore, 6),
        best: best == null ? null : roundTo(best.score, 6),
        unit: goal === "drawdown" ? "max-drawdown" : (goal === "cagr" ? "cagr" : "sharpe")
      },
      candidate: best == null ? { leverKey: leverKey, from: baseLever, to: null, score: null, oosSharpe: null, gap: null } : {
        leverKey: best.leverKey,
        from: roundTo(best.from, 6),
        to: roundTo(best.to, 6),
        score: roundTo(best.score, 6),
        oosSharpe: roundTo(best.oosSharpe, 6),
        gap: roundTo(best.gap, 6)
      },
      search: {
        budget: budget,
        trials: trials,
        sweptValues: sweptValues.map(function (value) { return roundTo(value, 6); }),
        evaluated: evaluated
      },
      outOfSample: {
        folds: folds,
        trainRatio: trainRatio,
        perFold: baseWf.folds.map(function (fold) { return { is: roundTo(fold.is, 6), oos: roundTo(fold.oos, 6) }; }),
        meanIs: roundTo(baseWf.meanIs, 6),
        meanOos: roundTo(baseWf.meanOos, 6),
        gap: roundTo(baseWf.meanIs - baseWf.meanOos, 6)
      },
      acceptance: {
        accepted: accepted,
        rawDelta: roundTo(rawDelta, 6),
        overfitPenalty: overfitPenalty,
        penalty: roundTo(penalty, 6),
        penalizedDelta: roundTo(penalizedDelta, 6),
        threshold: acceptanceThreshold,
        reason: best == null
          ? "No candidate improved the selected goal under the frozen owner scenario."
          : (accepted
            ? "The best single-variable change clears the acceptance threshold after the overfit discount."
            : "The best single-variable change does not clear the acceptance threshold after the overfit discount.")
      }
    };
  }

  /* cloneLevers: a plain shallow copy of the owner lever object (numeric fields only). */
  function cloneLevers(levers) {
    var out = {};
    Object.keys(levers).forEach(function (key) { out[key] = levers[key]; });
    return out;
  }

  /* pathIdentity: a stable digest of the seeded path's terminal + interior samples — proves reproducibility
     (same seed => same digest) without carrying the full Float64Array. */
  function pathIdentity(series) {
    var days = series.days;
    var samples = [series.px[0], series.px[Math.floor(days * 0.25)], series.px[Math.floor(days * 0.5)], series.px[Math.floor(days * 0.75)], series.px[days]];
    return samples.map(function (value) { return Math.round(value * 1e6) / 1e6; }).join(":");
  }

  function meanForward(series) {
    var days = series.days, sum = 0, i;
    for (i = 0; i < days; i++) sum += series.fwd[i];
    return days ? sum / days : 0;
  }

  /* ═══════════ Simple adapter contract wiring ═══════════ */

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function fingerprintOf(api, value) {
    return api.fingerprint(value);
  }

  /* Compute the Scope 04 simple-evidence-identity/v1 fingerprint for an evidence snapshot, matching
     rlexperience.js simpleEvidenceIdentity EXACTLY. Shared framework infrastructure, not a formula. */
  function evidenceIdentityOf(api, evidence) {
    return fingerprintOf(api, {
      contractVersion: "simple-evidence-identity/v1",
      toolId: evidence.toolId,
      state: evidence.state,
      evidenceCutoff: evidence.evidenceCutoff,
      evidenceRefs: evidence.evidenceRefs.map(function (reference) {
        return {
          requirementId: reference.requirementId,
          evidenceRef: reference.evidenceRef,
          semanticFingerprint: reference.semanticFingerprint,
          sourceClass: reference.sourceClass,
          valueState: reference.valueState
        };
      }),
      parameterValues: evidence.parameterValues,
      assumptions: evidence.assumptions,
      limitations: evidence.limitations,
      invalidationConditions: evidence.invalidationConditions
    });
  }

  function paramMap(input) {
    var values = Object.create(null);
    input.parameters.forEach(function (parameter) { values[parameter.parameterId] = parameter.value; });
    return values;
  }

  function ownerStateFingerprint(api, ownerState) {
    return fingerprintOf(api, ownerState);
  }

  /* ═══════════ strategy-evolution adapter ═══════════ */

  function strategyEvolutionEvidenceState(ownerState) {
    var hasRegimes = ownerState && Array.isArray(ownerState.regimes) && ownerState.regimes.length > 0;
    var hasLevers = ownerState && ownerState.startLevers && typeof ownerState.startLevers === "object" && isFiniteNumber(ownerState.startLevers.fast);
    var hasRanges = ownerState && ownerState.leverRanges && typeof ownerState.leverRanges === "object";
    return (hasRegimes && hasLevers && hasRanges) ? "ready" : "unavailable";
  }

  function buildStrategyEvolutionEvidence(api, ownerState) {
    var state = strategyEvolutionEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "strategy-self-improvement-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:strategy-self-improvement-lab:seeded-scenario:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "simulation",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "synthetic seeded scenario"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "The price path is a synthetic seeded simulation with no connection to any real asset."
      ],
      limitations: [
        "Walk-forward out-of-sample scoring and the overfit discount reduce but never eliminate overfitting; the synthetic path omits real costs, slippage, capacity, and regime change."
      ],
      invalidationConditions: [
        "The frozen owner scenario regimes, levers, ranges, or walk-forward configuration change."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function strategyEvolutionOutput(input, summary) {
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: {
        state: "walk-forward-out-of-sample",
        reason: "Every score is walk-forward out-of-sample over the frozen seeded owner scenario across " + summary.walkForwardFolds + " folds."
      },
      provenance: { classes: ["simulation", "model-estimate"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: summary.candidate.to == null ? "wide" : "bounded",
        rangeOrBand: summary.acceptance.accepted ? ("Accept " + summary.leverKey + " -> " + summary.candidate.to) : "No accepted change",
        reason: "The seeded path is fully reproducible; the search, penalty, and acceptance use the exact frozen owner scenario and the selected seed."
      },
      assumptions: [
        "Only one variable is allowed to change per search; the rest of the owner rule stays at its baseline."
      ],
      limitations: [
        "The path is synthetic and reproducible but has no connection to any real asset; the model describes the process, not a tradable edge."
      ],
      invalidationConditions: [
        "The frozen owner scenario changes, or the seed changes (which selects a distinct reproducible path)."
      ],
      flatRegionProofs: []
    };
  }

  /* affectsOutputPaths for the strategy-evolution parameters. Mirrors simple-models.json exactly. */
  var STRATEGY_EVOLUTION_OUTPUT_PATHS = {
    "goal": ["summary.goalScore"],
    "variable": ["summary.candidate"],
    "search-budget": ["summary.search"],
    "overfit-penalty": ["summary.acceptance"],
    "seed": ["summary.path"],
    "acceptance-threshold": ["summary.acceptance"],
    "walk-forward-folds": ["summary.outOfSample"]
  };

  function strategyEvolutionSummaryPath(summary, path) {
    if (path === "summary.goalScore") return summary.goalScore;
    if (path === "summary.candidate") return summary.candidate;
    if (path === "summary.search") return summary.search;
    if (path === "summary.acceptance") return summary.acceptance;
    if (path === "summary.path") return summary.path;
    if (path === "summary.outOfSample") return summary.outOfSample;
    return null;
  }

  function createStrategyEvolutionAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.regimes)) {
          return { ok: false, error: { reason: "strategy scenario owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildStrategyEvolutionEvidence(api, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        var summary = computeStrategyEvolutionSummary(ownerState, paramMap(input));
        return { ok: true, value: strategyEvolutionOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeStrategyEvolutionSummary(ownerState, baselineValues);
        var currentSummary = computeStrategyEvolutionSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return; // seed is path-separated, not a common-random sensitivity effect
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = STRATEGY_EVOLUTION_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, strategyEvolutionSummaryPath(baselineSummary, path)) !== fingerprintOf(api, strategyEvolutionSummaryPath(currentSummary, path));
          });
          effects.push({
            parameterId: parameterId,
            oldValue: baselineValues[parameterId],
            newValue: currentValues[parameterId],
            direction: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (currentValues[parameterId] > baselineValues[parameterId] ? "higher" : "lower")
              : "changed",
            magnitude: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (Math.abs(currentValues[parameterId] - baselineValues[parameterId]) || 1)
              : 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The frozen owner scenario yields an identical value on these paths for this parameter change under common random numbers."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: baselineInput.seed !== currentInput.seed,
            effects: effects
          }
        };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        var accepted = summary.acceptance.accepted;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: accepted ? ("Accept " + summary.leverKey + " " + summary.candidate.from + " -> " + summary.candidate.to) : "No accepted change",
            numericValue: summary.acceptance.penalizedDelta,
            unit: "goal-delta",
            summary: accepted
              ? ("Changing " + summary.leverKey + " to " + summary.candidate.to + " clears the acceptance threshold on the selected " + summary.goal + " goal after the overfit discount.")
              : ("No single-variable change clears the acceptance threshold on the selected " + summary.goal + " goal after the overfit discount."),
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ disclosure-lag owner primitives (single source; consumed by Power + Simple) ═══════════
     These mirror the smart-money-flow-lab.html owner helpers EXACTLY. The owning page delegates to them so it
     carries no inline disclosure-decay / consensus formula copy (owner-parity). */

  /* alphaDecay: information-edge decay — the fraction of naive edge retained at ageDays given halfLifeDays.
     alphaDecay(0,H)=1; alphaDecay(H,H)=0.5; strictly decreasing in age; always in (0,1]. Byte-identical to
     the page's alphaDecay. */
  function alphaDecay(ageDays, halfLifeDays) {
    if (halfLifeDays <= 0) return ageDays <= 0 ? 1 : 0;
    return Math.pow(2, -Math.max(0, ageDays) / halfLifeDays);
  }

  /* dayGap: whole days between two ISO dates (clamped at 0). NaN-safe -> 0. Byte-identical to the page's
     dayGap. Date.parse is a deterministic string parse (it reads the given ISO strings, never the wall clock). */
  function dayGap(fromISO, toISO) {
    var a = Date.parse(fromISO), b = Date.parse(toISO);
    if (isNaN(a) || isNaN(b)) return 0;
    return Math.max(0, (b - a) / 86400000);
  }

  /* consensusScore: the naive consensus/conviction score. Monotonic up in distinct filers and |netUsd|, down
     in recencyDays (through alphaDecay). Byte-identical to the page's consensusScore. */
  function consensusScore(nFilers, netUsd, recencyDays, halfLifeDays) {
    var breadth = Math.log2(1 + Math.max(0, nFilers));
    var size = Math.log10(1 + Math.abs(netUsd) / 1e5);
    var fresh = alphaDecay(recencyDays, halfLifeDays);
    return breadth * (1 + size) * fresh;
  }

  /* realisticEdgeFraction: the fraction of naive edge that survives the disclosure lag (== decay at the lag).
     Byte-identical to the page's realisticEdgeFraction. */
  function realisticEdgeFraction(disclosureLagDays, halfLifeDays) {
    return alphaDecay(disclosureLagDays, halfLifeDays);
  }

  /* ═══════════ disclosure-decay Simple model (owner seam = smart-money-flow-lab.html) ═══════════
     The Simple question: over a FROZEN owner disclosure set, recompute the SURVIVING conviction under a
     selected SOURCE MIX, a disclosure-lag HALF-LIFE, a CLUSTER MINIMUM, a directional CONSENSUS threshold,
     and a DECAY FLOOR. It REUSES the single-sourced owner alphaDecay / consensusScore / realisticEdgeFraction
     / dayGap (no re-implementation) — the disclosure-lag decay is the owner seam. The cluster gate, the net
     directional consensus, and the decay floor are the adapter's own bounded Simple question, distinct from
     the page's Power records / clocks / breadth / decay-audit. It is NOT seeded: it is a pure deterministic
     function of the frozen filing set. */

  /* sourceTypeFilter: the Simple "source-mix" enum maps to which owner filer types are included. 'blended'
     includes every type; the option 'institutional' maps to the owner type 'institution'. */
  function sourceTypeFilter(sourceMix) {
    if (sourceMix === "insider") return function (type) { return type === "insider"; };
    if (sourceMix === "congress") return function (type) { return type === "congress"; };
    if (sourceMix === "institutional") return function (type) { return type === "institution"; };
    return function () { return true; };
  }

  /* disclosureClusters: group the source-filtered disclosures into per-ticker owner consensus clusters exactly
     as the owner aggregate() does — distinct filers, net signed $, average disclosure lag (via dayGap), and the
     freshest disclosure age — then score naive conviction (consensusScore) and retained edge
     (realisticEdgeFraction). Every numeric comes from the single-sourced owner functions; nothing is fabricated. */
  function disclosureClusters(disclosures, includeType, halfLife, today) {
    var byTicker = Object.create(null);
    disclosures.forEach(function (d) {
      if (!includeType(d.type)) return;
      var g = byTicker[d.ticker] || (byTicker[d.ticker] = { ticker: d.ticker, filers: Object.create(null), net: 0, lags: [], recent: Infinity });
      var signed = (d.side === "sell" ? -1 : 1) * d.usd;
      g.net += signed;
      g.filers[d.filer] = 1;
      var lag = dayGap(d.txn, d.disclosed);
      var age = dayGap(d.disclosed, today);
      g.lags.push(lag);
      if (age < g.recent) g.recent = age;
    });
    return Object.keys(byTicker).map(function (tk) {
      var g = byTicker[tk];
      var nFilers = Object.keys(g.filers).length;
      var avgLag = g.lags.reduce(function (a, b) { return a + b; }, 0) / (g.lags.length || 1);
      var recency = g.recent === Infinity ? 0 : g.recent;
      var naive = consensusScore(nFilers, g.net, recency, halfLife);
      var retained = realisticEdgeFraction(avgLag, halfLife);
      return { ticker: tk, nFilers: nFilers, net: g.net, avgLag: avgLag, recency: recency, naive: naive, retained: retained, direction: g.net >= 0 ? "buy" : "sell" };
    }).sort(function (a, b) { return b.naive - a.naive; });
  }

  /* Recompute the surviving-conviction summary over one frozen owner disclosure set under the current Simple
     parameters. Pure, deterministic, and derived only from the single-sourced owner functions. */
  function computeDisclosureDecaySummary(ownerState, params) {
    var sourceMix = params["source-mix"];
    var halfLife = params["lag-half-life"];
    var clusterMin = params["cluster-minimum"];
    var consensusThreshold = params["consensus-threshold"];
    var decayFloor = params["decay-floor"];

    var today = String(ownerState.today || ownerState.asOf || "");
    var disclosures = Array.isArray(ownerState.disclosures) ? ownerState.disclosures : [];
    var includeType = sourceTypeFilter(sourceMix);

    var clusters = disclosureClusters(disclosures, includeType, halfLife, today);

    // decay floor: the minimum surviving fraction after lag decay. When the natural retained fraction is below
    // the floor, the floor lifts it; otherwise the natural retained fraction stands (no zero-fill, no cap up).
    var perTicker = clusters.map(function (c) {
      var retainedFloored = Math.max(c.retained, decayFloor);
      return {
        ticker: c.ticker,
        nFilers: c.nFilers,
        net: roundTo(c.net, 2),
        avgLag: roundTo(c.avgLag, 4),
        direction: c.direction,
        naive: roundTo(c.naive, 6),
        retained: roundTo(c.retained, 6),
        retainedFloored: roundTo(retainedFloored, 6),
        realistic: roundTo(c.naive * c.retained, 6),
        decayed: roundTo(c.naive * retainedFloored, 6),
        floored: retainedFloored > c.retained,
        qualifiesCluster: c.nFilers >= clusterMin
      };
    });

    var totalNaive = 0, totalRealistic = 0, totalDecayed = 0;
    perTicker.forEach(function (c) { totalNaive += c.naive; totalRealistic += c.realistic; totalDecayed += c.decayed; });

    var qualified = perTicker.filter(function (c) { return c.qualifiesCluster; });
    var dropped = perTicker.filter(function (c) { return !c.qualifiesCluster; });
    var buyClusters = qualified.filter(function (c) { return c.direction === "buy"; });
    var consensusFraction = qualified.length ? buyClusters.length / qualified.length : 0;
    var passes = qualified.length > 0 && consensusFraction >= consensusThreshold;

    return {
      sourceMix: sourceMix,
      lagHalfLife: halfLife,
      clusterMinimum: clusterMin,
      consensusThreshold: consensusThreshold,
      decayFloor: decayFloor,
      today: today,
      universe: { totalDisclosures: disclosures.filter(function (d) { return includeType(d.type); }).length, totalClusters: perTicker.length },
      conviction: {
        sourceMix: sourceMix,
        totalNaive: roundTo(totalNaive, 6),
        perTicker: perTicker.map(function (c) { return { ticker: c.ticker, nFilers: c.nFilers, direction: c.direction, naive: c.naive }; })
      },
      decayedConviction: {
        lagHalfLife: halfLife,
        decayFloor: decayFloor,
        totalRealistic: roundTo(totalRealistic, 6),
        totalDecayed: roundTo(totalDecayed, 6),
        perTicker: perTicker.map(function (c) { return { ticker: c.ticker, retained: c.retained, retainedFloored: c.retainedFloored, decayed: c.decayed, floored: c.floored }; })
      },
      cluster: {
        clusterMinimum: clusterMin,
        qualifiedCount: qualified.length,
        qualifiedTickers: qualified.map(function (c) { return c.ticker; }),
        droppedTickers: dropped.map(function (c) { return c.ticker; })
      },
      consensus: {
        consensusThreshold: consensusThreshold,
        qualifiedClusters: qualified.length,
        buyClusters: buyClusters.length,
        consensusFraction: roundTo(consensusFraction, 6),
        passes: passes,
        band: passes ? "consensus" : "divided"
      }
    };
  }

  /* affectsOutputPaths for the disclosure-decay parameters. Mirrors simple-models.json exactly. */
  var DISCLOSURE_DECAY_OUTPUT_PATHS = {
    "source-mix": ["summary.conviction"],
    "lag-half-life": ["summary.decayedConviction"],
    "cluster-minimum": ["summary.cluster"],
    "consensus-threshold": ["summary.consensus"],
    "decay-floor": ["summary.decayedConviction"]
  };

  function disclosureDecaySummaryPath(summary, path) {
    if (path === "summary.conviction") return summary.conviction;
    if (path === "summary.decayedConviction") return summary.decayedConviction;
    if (path === "summary.cluster") return summary.cluster;
    if (path === "summary.consensus") return summary.consensus;
    return null;
  }

  /* ═══════════ disclosure-decay adapter ═══════════ */

  function disclosureDecayEvidenceState(ownerState) {
    var hasDisclosures = ownerState && Array.isArray(ownerState.disclosures) && ownerState.disclosures.length > 0;
    var stamp = ownerState && (ownerState.today || ownerState.asOf);
    var hasToday = typeof stamp === "string" && stamp.length >= 8;
    return (hasDisclosures && hasToday) ? "ready" : "unavailable";
  }

  function buildDisclosureDecayEvidence(api, ownerState) {
    var state = disclosureDecayEvidenceState(ownerState);
    var cutoff = String(ownerState.today || ownerState.asOf || "unavailable");
    var sourceClass = String(ownerState.sourceClass || "model-estimate");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "smart-money-flow-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:smart-money-flow-lab:disclosure-set:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: sourceClass,
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "disclosed filing set"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Every conviction number is computed only from the frozen disclosed filing set; no price, return, or forward outcome is used."
      ],
      limitations: [
        "Disclosure-lag decay estimates how much of the naive edge is already public by the time it is disclosed; it cannot recover an edge that has fully decayed, and the sample filing set is illustrative unless real filings were supplied."
      ],
      invalidationConditions: [
        "The frozen disclosed filing set, any disclosure/transaction date, or the reference date changes."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function disclosureDecayOutput(input, summary) {
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: {
        state: "owner-evidence-relative",
        reason: "Surviving conviction is measured relative to the frozen owner disclosure set; there is no external price calibration."
      },
      provenance: { classes: ["model-estimate", "observed-fact"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: summary.consensus.passes ? "bounded" : "wide",
        rangeOrBand: summary.consensus.band + " (" + summary.consensus.buyClusters + "/" + summary.consensus.qualifiedClusters + " qualified clusters buy-directional)",
        reason: "The disclosure-lag decay and cluster gate are deterministic over the frozen filing set; conviction that has already decayed below the floor is reported as surviving at the floor, never recovered above it."
      },
      assumptions: [
        "Directional consensus is measured over clusters meeting the minimum-filer gate; single disclosures below the gate are excluded, not zero-filled."
      ],
      limitations: [
        "Filing-lag decay is a public-information haircut, not a forward return; surviving conviction is a research signal, not a trade recommendation."
      ],
      invalidationConditions: [
        "The frozen filing set changes, or a disclosure/transaction date changes a computed lag or age."
      ],
      flatRegionProofs: []
    };
  }

  function createDisclosureDecayAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.disclosures)) {
          return { ok: false, error: { reason: "disclosure owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildDisclosureDecayEvidence(api, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        var summary = computeDisclosureDecaySummary(ownerState, paramMap(input));
        return { ok: true, value: disclosureDecayOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeDisclosureDecaySummary(ownerState, baselineValues);
        var currentSummary = computeDisclosureDecaySummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = DISCLOSURE_DECAY_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, disclosureDecaySummaryPath(baselineSummary, path)) !== fingerprintOf(api, disclosureDecaySummaryPath(currentSummary, path));
          });
          effects.push({
            parameterId: parameterId,
            oldValue: baselineValues[parameterId],
            newValue: currentValues[parameterId],
            direction: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (currentValues[parameterId] > baselineValues[parameterId] ? "higher" : "lower")
              : "changed",
            magnitude: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (Math.abs(currentValues[parameterId] - baselineValues[parameterId]) || 1)
              : 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The frozen owner disclosure set yields an identical value on these paths for this parameter change."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: baselineInput.seed !== currentInput.seed,
            effects: effects
          }
        };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        var top = summary.conviction.perTicker[0] || null;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: summary.consensus.passes
              ? ("Consensus (" + summary.consensus.buyClusters + "/" + summary.consensus.qualifiedClusters + " clusters buy)")
              : ("Divided (" + summary.consensus.buyClusters + "/" + summary.consensus.qualifiedClusters + " clusters buy)"),
            numericValue: summary.decayedConviction.totalDecayed,
            unit: "surviving-conviction",
            summary: top
              ? ("Top surviving cluster is " + top.ticker + " (" + top.direction + ", " + top.nFilers + " filers); " + summary.consensus.qualifiedClusters + " clusters clear the " + summary.clusterMinimum + "-filer gate at a " + summary.lagHalfLife + "-day lag half-life.")
              : ("No cluster clears the " + summary.clusterMinimum + "-filer gate under the selected source mix."),
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ walk-forward-validation Simple model (owner seam = strategy-validation-lab.html) ═══════════
     The Simple question: over a FROZEN owner universe of real (or clearly-labelled synthetic) instrument closes,
     recompute the walk-forward OUT-OF-SAMPLE evidence for one mechanical RULE across a chosen UNIVERSE, under a
     FOLD count, an EMBARGO, an explicit round-trip COST, a variant TRIAL-COUNT, and a held-instrument ROBUSTNESS
     threshold. It REUSES the single-sourced owner seriesFromCloses / walkForwardEmbargo / scorePass / allPass
     engine (no re-implementation) — the fold/embargo walk-forward is the owner seam. The rule-lever preset, the
     explicit cost drag, the cross-instrument robustness gate, and the trial-count deflation are the adapter's own
     bounded Simple question, distinct from the Power page's fold ledger, cross-instrument hold, and full
     Bailey-Lopez de Prado deflated Sharpe (which the page keeps via the Feature-007 RLVALID owner). It is NOT
     seeded: it is a pure deterministic function of the frozen instrument closes. */

  /* The Simple cost model maps an explicit per-round-trip basis-point cost to an annual drag by assuming an
     average holding period. HOLD_DAYS is a documented modeling assumption (≈ one trading month); it is the ONLY
     constant the cost drag adds on top of the owner OOS metrics, and it never changes the gross owner formula. */
  var HOLD_DAYS = 20;

  /* The Simple "rule" enum maps to a deterministic lever preset over the owner base levers. 'trend' is the owner
     baseline verbatim (identity); the others isolate one mechanism through a fixed, transparent override. The SAME
     single-sourced backtest / walk-forward engine runs on the resulting levers — the preset is the adapter's own
     Simple question, not a formula copy. */
  var RULE_LEVER_OVERRIDE = {
    "trend": function (L) { return cloneLevers(L); },
    "momentum": function (L) { var o = cloneLevers(L); o.momLookback = Math.max(20, Math.round(L.momLookback * 0.5)); return o; },
    "vol-target": function (L) { var o = cloneLevers(L); o.volTarget = L.volTarget * 0.6; return o; },
    "trailing-stop": function (L) { var o = cloneLevers(L); o.stopDd = L.stopDd * 0.5; return o; }
  };

  function ruleOverrideDescription(rule) {
    if (rule === "momentum") return "momentum lookback halved";
    if (rule === "vol-target") return "volatility target tightened to 60%";
    if (rule === "trailing-stop") return "trailing stop tightened to 50%";
    return "owner baseline trend + momentum composite (identity)";
  }

  function applyRuleOverride(baseLevers, rule) {
    var fn = RULE_LEVER_OVERRIDE[rule] || RULE_LEVER_OVERRIDE.trend;
    return fn(baseLevers);
  }

  /* Recompute the walk-forward-validation summary over one frozen owner universe under the current Simple
     parameters. Pure, deterministic, and derived only from the single-sourced owner functions. */
  function computeWalkForwardValidationSummary(ownerState, params) {
    var rule = params.rule;
    var universeKey = params.universe;
    var folds = params.folds;
    var embargo = params.embargo;
    var costBps = params.cost;
    var trialCount = params["trial-count"];
    var robustnessThreshold = params["robustness-threshold"];

    var trainRatio = isFiniteNumber(ownerState.trainRatio) ? ownerState.trainRatio : 0.6;
    var goal = (ownerState.goal && typeof ownerState.goal === "object") ? ownerState.goal : {};
    var baseLevers = (ownerState.startLevers && typeof ownerState.startLevers === "object") ? ownerState.startLevers : {};
    var appliedLevers = applyRuleOverride(baseLevers, rule);

    var universes = (ownerState.universes && typeof ownerState.universes === "object") ? ownerState.universes : {};
    var selected = Array.isArray(universes[universeKey]) ? universes[universeKey] : [];

    // Per-instrument walk-forward OOS across the selected universe (robustness). The first instrument that yields
    // usable OOS is the validation focus. A too-short instrument is reported no-data, never zero-filled.
    var perInstrument = [], held = 0, withData = 0, focus = null;
    selected.forEach(function (instrument) {
      var symbol = String((instrument && instrument.symbol) || "");
      var closes = (instrument && Array.isArray(instrument.closes)) ? instrument.closes : [];
      var S = seriesFromCloses(closes);
      var wf = S ? walkForwardEmbargo(S, appliedLevers, folds, trainRatio, embargo) : null;
      if (!S || !wf || !wf.oos) {
        perInstrument.push({ symbol: symbol, withData: false, held: false, oosSharpe: null, oosCagr: null, oosMaxDd: null });
        return;
      }
      withData++;
      var pass = scorePass(wf.oos, goal), isHeld = allPass(pass);
      if (isHeld) held++;
      if (!focus) focus = { symbol: symbol, wf: wf };
      perInstrument.push({
        symbol: symbol,
        withData: true,
        held: isHeld,
        oosSharpe: roundTo(wf.oos.sharpe, 6),
        oosCagr: roundTo(wf.oos.cagr, 6),
        oosMaxDd: roundTo(wf.oos.maxDd, 6)
      });
    });
    var heldFraction = withData ? held / withData : 0;
    var robust = withData > 0 && heldFraction >= robustnessThreshold;

    var validation, outOfSample, deflatedEvidence;
    if (focus) {
      var oos = focus.wf.oos;
      var annualRoundTrips = HOLD_DAYS > 0 ? (ANN * (isFiniteNumber(oos.tim) ? oos.tim : 0)) / HOLD_DAYS : 0;
      var costDragAnnual = (costBps / 1e4) * annualRoundTrips;
      var netCagr = isFiniteNumber(oos.cagr) ? oos.cagr - costDragAnnual : null;
      var netSharpe = isFiniteNumber(oos.sharpe) ? oos.sharpe - costDragAnnual / Math.max(oos.vol, 1e-6) : null;
      validation = {
        rule: rule,
        leverOverride: ruleOverrideDescription(rule),
        appliedLevers: cloneLevers(appliedLevers),
        focusSymbol: focus.symbol,
        costBps: costBps,
        holdDaysAssumption: HOLD_DAYS,
        annualRoundTrips: roundTo(annualRoundTrips, 4),
        costDragAnnual: roundTo(costDragAnnual, 6),
        gross: {
          cagr: roundTo(oos.cagr, 6), sharpe: roundTo(oos.sharpe, 6), vol: roundTo(oos.vol, 6),
          maxDd: roundTo(oos.maxDd, 6), tim: roundTo(oos.tim, 6)
        },
        net: { cagr: roundTo(netCagr, 6), sharpe: roundTo(netSharpe, 6) }
      };
      outOfSample = {
        folds: folds,
        embargo: embargo,
        trainRatio: trainRatio,
        usable: focus.wf.usable,
        focusSymbol: focus.symbol,
        perFold: focus.wf.folds.map(function (fold) { return { is: roundTo(fold.is, 6), oos: roundTo(fold.oos, 6) }; }),
        meanIs: roundTo(focus.wf.meanIs, 6),
        meanOos: roundTo(focus.wf.meanOos, 6),
        gap: roundTo(focus.wf.meanIs - focus.wf.meanOos, 6)
      };
      var grossSharpe = isFiniteNumber(oos.sharpe) ? oos.sharpe : 0;
      var trials = Math.max(1, Math.floor(trialCount));
      var breadth = Math.log2(1 + trials);
      var discount = breadth / (breadth + 4);
      var deflated = grossSharpe * (1 - discount);
      deflatedEvidence = {
        trialCount: trials,
        grossSharpe: roundTo(grossSharpe, 6),
        discount: roundTo(discount, 6),
        deflatedSharpe: roundTo(deflated, 6),
        survivesDeflation: deflated > 0,
        method: "Simple trial-count multiple-testing discount over the focus OOS Sharpe; the Power page reports the full Bailey-Lopez de Prado deflated Sharpe (RLVALID)."
      };
    } else {
      validation = {
        rule: rule, leverOverride: ruleOverrideDescription(rule), appliedLevers: cloneLevers(appliedLevers),
        focusSymbol: null, costBps: costBps, holdDaysAssumption: HOLD_DAYS, annualRoundTrips: null,
        costDragAnnual: null, gross: null, net: null
      };
      outOfSample = {
        folds: folds, embargo: embargo, trainRatio: trainRatio, usable: 0, focusSymbol: null,
        perFold: [], meanIs: null, meanOos: null, gap: null
      };
      deflatedEvidence = {
        trialCount: Math.max(1, Math.floor(trialCount)), grossSharpe: null, discount: null, deflatedSharpe: null,
        survivesDeflation: false,
        method: "No focus instrument in the selected universe yields usable out-of-sample data."
      };
    }

    return {
      rule: rule,
      universe: universeKey,
      folds: folds,
      embargo: embargo,
      cost: costBps,
      trialCount: Math.max(1, Math.floor(trialCount)),
      robustnessThreshold: robustnessThreshold,
      validation: validation,
      robustness: {
        universe: universeKey,
        robustnessThreshold: robustnessThreshold,
        instrumentCount: selected.length,
        withData: withData,
        held: held,
        heldFraction: roundTo(heldFraction, 6),
        robust: robust,
        band: withData ? (heldFraction >= 0.67 ? "robust" : heldFraction >= 0.34 ? "mixed" : "fragile") : "no-data",
        perInstrument: perInstrument
      },
      outOfSample: outOfSample,
      deflatedEvidence: deflatedEvidence
    };
  }

  /* affectsOutputPaths for the walk-forward-validation parameters. Mirrors simple-models.json exactly. */
  var WALK_FORWARD_VALIDATION_OUTPUT_PATHS = {
    "rule": ["summary.validation"],
    "universe": ["summary.robustness"],
    "folds": ["summary.outOfSample"],
    "embargo": ["summary.outOfSample"],
    "cost": ["summary.validation"],
    "trial-count": ["summary.deflatedEvidence"],
    "robustness-threshold": ["summary.robustness"]
  };

  function walkForwardValidationSummaryPath(summary, path) {
    if (path === "summary.validation") return summary.validation;
    if (path === "summary.robustness") return summary.robustness;
    if (path === "summary.outOfSample") return summary.outOfSample;
    if (path === "summary.deflatedEvidence") return summary.deflatedEvidence;
    return null;
  }

  /* ═══════════ walk-forward-validation adapter ═══════════ */

  function walkForwardValidationUniverseHasData(universes) {
    var keys = Object.keys(universes || {});
    for (var k = 0; k < keys.length; k++) {
      var list = universes[keys[k]];
      if (!Array.isArray(list)) continue;
      for (var i = 0; i < list.length; i++) {
        var closes = list[i] && list[i].closes;
        if (Array.isArray(closes) && closes.length > 120) return true;
      }
    }
    return false;
  }

  function walkForwardValidationEvidenceState(ownerState) {
    var hasUniverse = ownerState && ownerState.universes && typeof ownerState.universes === "object" && walkForwardValidationUniverseHasData(ownerState.universes);
    var hasGoal = ownerState && ownerState.goal && typeof ownerState.goal === "object" && isFiniteNumber(ownerState.goal.minTimeInMarket);
    var hasLevers = ownerState && ownerState.startLevers && typeof ownerState.startLevers === "object" && isFiniteNumber(ownerState.startLevers.fast);
    var stamp = ownerState && ownerState.asOf;
    var hasStamp = typeof stamp === "string" && stamp.length >= 8;
    return (hasUniverse && hasGoal && hasLevers && hasStamp) ? "ready" : "unavailable";
  }

  function buildWalkForwardValidationEvidence(api, ownerState) {
    var state = walkForwardValidationEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var sourceClass = String(ownerState.sourceClass || "model-estimate");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "strategy-validation-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:strategy-validation-lab:universe:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: sourceClass,
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "instrument closes universe"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Every out-of-sample number is a walk-forward result over the frozen instrument closes; the trailing embargo purges the rule warm-up window from in-sample.",
        "The explicit round-trip cost is applied as a post-hoc annual drag assuming an average holding period of " + HOLD_DAYS + " trading days; it never changes the gross owner formula."
      ],
      limitations: [
        "Walk-forward out-of-sample scoring and the trial-count deflation reduce but never eliminate overfitting; synthetic instrument closes are clearly labelled and are not a tradable edge.",
        "The Simple surviving Sharpe is a bounded trial-count discount; the full Bailey-Lopez de Prado deflated Sharpe remains the Power page's owner statistic."
      ],
      invalidationConditions: [
        "The frozen universe instruments/closes, base levers, goal targets, or walk-forward configuration change."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function walkForwardValidationOutput(input, summary) {
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: {
        state: "walk-forward-out-of-sample",
        reason: "Every headline number is a walk-forward out-of-sample result over the frozen owner universe across " + summary.folds + " folds with a " + summary.embargo + "-day embargo."
      },
      provenance: { classes: ["observed-fact", "model-estimate"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: summary.robustness.robust ? "bounded" : "wide",
        rangeOrBand: summary.robustness.band + " (" + summary.robustness.held + "/" + summary.robustness.withData + " instruments hold the goal)",
        reason: "The fold/embargo walk-forward and the cross-instrument robustness gate are deterministic over the frozen universe; the surviving Sharpe is discounted for the number of variants tried."
      },
      assumptions: [
        "One mechanical rule is validated at a time; the rule preset changes the owner levers, never the owner engine."
      ],
      limitations: [
        "Out-of-sample robustness is measured over the supplied universe only; a rule that holds here can still fail on unseen instruments or under live costs."
      ],
      invalidationConditions: [
        "The frozen universe, base levers, goal, or walk-forward configuration changes."
      ],
      flatRegionProofs: []
    };
  }

  function createWalkForwardValidationAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !ownerState.universes || typeof ownerState.universes !== "object") {
          return { ok: false, error: { reason: "walk-forward validation universe owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildWalkForwardValidationEvidence(api, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        var summary = computeWalkForwardValidationSummary(ownerState, paramMap(input));
        return { ok: true, value: walkForwardValidationOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeWalkForwardValidationSummary(ownerState, baselineValues);
        var currentSummary = computeWalkForwardValidationSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = WALK_FORWARD_VALIDATION_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, walkForwardValidationSummaryPath(baselineSummary, path)) !== fingerprintOf(api, walkForwardValidationSummaryPath(currentSummary, path));
          });
          effects.push({
            parameterId: parameterId,
            oldValue: baselineValues[parameterId],
            newValue: currentValues[parameterId],
            direction: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (currentValues[parameterId] > baselineValues[parameterId] ? "higher" : "lower")
              : "changed",
            magnitude: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (Math.abs(currentValues[parameterId] - baselineValues[parameterId]) || 1)
              : 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The frozen owner universe yields an identical value on these paths for this parameter change."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: baselineInput.seed !== currentInput.seed,
            effects: effects
          }
        };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        var v = summary.validation;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: summary.robustness.robust
              ? ("Robust (" + summary.robustness.held + "/" + summary.robustness.withData + " hold)")
              : ("Fragile (" + summary.robustness.held + "/" + summary.robustness.withData + " hold)"),
            numericValue: (v && v.net) ? v.net.sharpe : null,
            unit: "net-oos-sharpe",
            summary: (v && v.focusSymbol)
              ? ("The " + summary.rule + " rule on " + v.focusSymbol + " nets a " + (v.net ? v.net.sharpe : "—") + " OOS Sharpe after a " + summary.cost + "bp round-trip cost; " + summary.robustness.held + "/" + summary.robustness.withData + " " + summary.universe + " instruments hold the goal.")
              : ("No instrument in the " + summary.universe + " universe yields usable out-of-sample data."),
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ horizon-ladder adapter ═══════════
     The gate is the model. A rate is published only when the cell has reached its minimum resolved
     sample; otherwise the summary carries an explicit withheld reason and no number. The probability
     it does report is arithmetic from the declared target distance, never a measured hit rate. */

  var HORIZON_LADDER_OUTPUT_PATHS = {
    "direction": ["summary.cellId", "summary.gate"],
    "horizon": ["summary.cellId", "summary.gate"],
    "resolution-rule": ["summary.probability"],
    "target-sigma": ["summary.probability", "summary.risk"],
    "invalidation-sigma": ["summary.risk"]
  };

  function horizonLadderSummaryPath(summary, path) {
    if (path === "summary.cellId") return summary.cellId;
    if (path === "summary.gate") return summary.gate;
    if (path === "summary.probability") return summary.probability;
    if (path === "summary.risk") return summary.risk;
    return null;
  }

  function horizonLadderNormSf(z) {
    var sign = z < 0 ? -1 : 1;
    var x = Math.abs(z) / Math.SQRT2;
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 - sign * y);
  }

  function horizonLadderProbability(k, rule) {
    if (rule === "touch") return k <= 0 ? 1 : Math.min(1, 2 * horizonLadderNormSf(k));
    if (rule === "terminal") return horizonLadderNormSf(k);
    return null;
  }

  function computeHorizonLadderSummary(ownerState, values) {
    var direction = String(values["direction"] || "long");
    var horizon = String(values["horizon"] || "h1m");
    var rule = String(values["resolution-rule"] || "terminal");
    var k = isFiniteNumber(values["target-sigma"]) ? values["target-sigma"] : 0.75;
    var m = isFiniteNumber(values["invalidation-sigma"]) ? values["invalidation-sigma"] : 0.5;
    var minimum = (ownerState.policy && isFiniteNumber(ownerState.policy.minResolvedSample)) ? ownerState.policy.minResolvedSample : 20;
    var cellId = direction + ":" + horizon;
    var resolved = (ownerState.cells && isFiniteNumber(ownerState.cells[cellId])) ? ownerState.cells[cellId] : 0;
    var published = resolved >= minimum;
    var declaredRate = (ownerState.rates && isFiniteNumber(ownerState.rates[cellId])) ? ownerState.rates[cellId] : null;
    var probability = horizonLadderProbability(k, rule);
    var stopTouch = horizonLadderProbability(m, "touch");
    return {
      cellId: cellId,
      gate: {
        published: published,
        reason: published ? null : "ledger-insufficient-sample",
        ledgerResolved: resolved,
        ledgerMinimum: minimum,
        remaining: Math.max(0, minimum - resolved)
      },
      probability: {
        rule: rule,
        targetSigma: k,
        modelProbability: probability,
        measuredRate: published ? declaredRate : null,
        measuredRateState: published
          ? (declaredRate === null ? "earned-but-unpopulated" : "published")
          : "withheld"
      },
      risk: {
        invalidationSigma: m,
        stopTouchProbability: stopTouch,
        rewardToRisk: m > 0 ? k / m : null,
        expectedValueSigma: (probability === null) ? null : (probability * k - (1 - probability) * m)
      }
    };
  }

  function horizonLadderEvidenceState(ownerState) {
    var hasCells = ownerState && ownerState.cells && typeof ownerState.cells === "object" && Object.keys(ownerState.cells).length === 12;
    var hasPolicy = ownerState && ownerState.policy && isFiniteNumber(ownerState.policy.minResolvedSample);
    var stamp = ownerState && ownerState.asOf;
    var hasStamp = typeof stamp === "string" && stamp.length >= 8;
    return (hasCells && hasPolicy && hasStamp) ? "ready" : "unavailable";
  }

  function buildHorizonLadderEvidence(api, ownerState) {
    var state = horizonLadderEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var sourceClass = String(ownerState.sourceClass || "observed-fact");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "horizon-ladder-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:horizon-ladder-lab:cells:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: sourceClass,
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "scored recommendation ledger"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Target and invalidation distances are expressed in horizon sigma, so the probability is a property of the distance and the resolution rule rather than of the instrument.",
        "Drift is declared zero; any non-zero drift would be a forecast and is not applied."
      ],
      limitations: [
        "A published probability requires the cell to reach its minimum resolved sample. No long or short claim has resolved yet, so every cell withholds.",
        "The model probability is arithmetic from the declared distance and is never a measured hit rate."
      ],
      invalidationConditions: [
        "The resolved-outcome count for any long or short cell changes, or the minimum resolved sample is revised."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function horizonLadderOutput(input, summary) {
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: {
        state: summary.gate.published ? "cell-earned" : "cell-withheld",
        reason: summary.gate.published
          ? ("The " + summary.cellId + " cell has " + summary.gate.ledgerResolved + " resolved outcomes, at or above the " + summary.gate.ledgerMinimum + " minimum.")
          : ("The " + summary.cellId + " cell has " + summary.gate.ledgerResolved + " resolved outcomes and needs " + summary.gate.ledgerMinimum + "; " + summary.gate.remaining + " more must resolve before any rate is shown.")
      },
      provenance: { classes: ["observed-fact", "model-estimate"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: summary.gate.published ? "bounded" : "unavailable",
        rangeOrBand: summary.gate.published
          ? (summary.gate.ledgerResolved + " resolved outcomes")
          : ("withheld pending " + summary.gate.remaining + " further resolutions"),
        reason: "Uncertainty follows the resolved sample for the cell, not the arithmetic of the target distance."
      },
      assumptions: [
        "One cell is evaluated at a time; direction and horizon together select the cell whose sample governs publication."
      ],
      limitations: [
        "Reward-to-risk alone is not a ranking key. A high ratio can carry negative expected value at its own probability."
      ],
      invalidationConditions: [
        "The resolved-outcome count for the selected cell changes."
      ],
      flatRegionProofs: []
    };
  }

  function createHorizonLadderAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !ownerState.cells || typeof ownerState.cells !== "object") {
          return { ok: false, error: { reason: "horizon ladder cell owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildHorizonLadderEvidence(api, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        return { ok: true, value: horizonLadderOutput(input, computeHorizonLadderSummary(ownerState, paramMap(input))) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeHorizonLadderSummary(ownerState, baselineValues);
        var currentSummary = computeHorizonLadderSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = HORIZON_LADDER_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, horizonLadderSummaryPath(baselineSummary, path)) !== fingerprintOf(api, horizonLadderSummaryPath(currentSummary, path));
          });
          effects.push({
            parameterId: parameterId,
            oldValue: baselineValues[parameterId],
            newValue: currentValues[parameterId],
            direction: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (currentValues[parameterId] > baselineValues[parameterId] ? "higher" : "lower")
              : "changed",
            magnitude: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (Math.abs(currentValues[parameterId] - baselineValues[parameterId]) || 1)
              : 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "Every long and short cell is withheld at zero resolved outcomes, so the gate verdict is identical across this parameter change."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: baselineInput.seed !== currentInput.seed,
            effects: effects
          }
        };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: summary.gate.published
              ? ("Published on " + summary.gate.ledgerResolved + " resolved outcomes")
              : ("Withheld — " + summary.gate.ledgerResolved + "/" + summary.gate.ledgerMinimum + " resolved"),
            numericValue: summary.gate.published ? summary.gate.ledgerResolved : null,
            unit: "resolved-outcomes",
            summary: summary.gate.published
              ? ("The " + summary.cellId + " cell has earned a rate; the target at " + summary.probability.targetSigma + " sigma resolves under the " + summary.probability.rule + " rule.")
              : ("The " + summary.cellId + " cell withholds its rate: " + summary.gate.remaining + " more outcomes must resolve. The " + summary.probability.rule + " probability shown for a " + summary.probability.targetSigma + " sigma target is arithmetic, not a measured hit rate."),
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ registration ═══════════
     Build every implemented strategy adapter for the supplied definitions. A tool whose owner seam is not
     yet extracted is simply absent, so the shared runtime renders the explicit unavailable state for it. */
  function createStrategyResearchAdapters(api, definitions, deps) {
    if (!api || typeof api.fingerprint !== "function" || typeof api.normalizeSimpleInput !== "function") {
      throw new Error("RLSTRATEGY_REQUIRES_RLEXPERIENCE_API");
    }
    var byToolId = Object.create(null);
    (definitions || []).forEach(function (definition) { byToolId[definition.toolId] = definition; });
    var adapters = Object.create(null);
    var ownerByIdentity = new Map();
    if (byToolId["strategy-self-improvement-lab"]) {
      var evolutionDefinition = byToolId["strategy-self-improvement-lab"];
      adapters[evolutionDefinition.adapterId] = createStrategyEvolutionAdapter(api, evolutionDefinition, ownerByIdentity);
    }
    if (byToolId["smart-money-flow-lab"]) {
      var disclosureDefinition = byToolId["smart-money-flow-lab"];
      adapters[disclosureDefinition.adapterId] = createDisclosureDecayAdapter(api, disclosureDefinition, ownerByIdentity);
    }
    if (byToolId["strategy-validation-lab"]) {
      var validationDefinition = byToolId["strategy-validation-lab"];
      adapters[validationDefinition.adapterId] = createWalkForwardValidationAdapter(api, validationDefinition, ownerByIdentity);
    }
    if (byToolId["horizon-ladder-lab"]) {
      var horizonLadderDefinition = byToolId["horizon-ladder-lab"];
      adapters[horizonLadderDefinition.adapterId] = createHorizonLadderAdapter(api, horizonLadderDefinition, ownerByIdentity);
    }
    return adapters;
  }

  /* Register every implemented strategy adapter with a live shared runtime. Returns the per-adapter
     registration result so the caller can surface honest registration failures. */
  function registerStrategyResearchAdapters(runtime, api, definitions, deps) {
    var adapters = createStrategyResearchAdapters(api, definitions, deps);
    var results = Object.create(null);
    Object.keys(adapters).forEach(function (adapterId) {
      results[adapterId] = runtime.registerAdapter(adapters[adapterId]);
    });
    return results;
  }

  return {
    contractVersion: "strategy-research-adapters/v1",
    module: "rlexperience-adapters/strategy-research.js",
    supportedAdapterIds: ["simple-adapter/strategy-evolution/v1", "simple-adapter/disclosure-decay/v1", "simple-adapter/walk-forward-validation/v1", "simple-adapter/horizon-ladder/v1"],
    mulberry32: mulberry32,
    gauss: gauss,
    genSeries: genSeries,
    sma: sma,
    realizedVol: realizedVol,
    backtest: backtest,
    metrics: metrics,
    walkForward: walkForward,
    candidateValues: candidateValues,
    computeStrategyEvolutionSummary: computeStrategyEvolutionSummary,
    alphaDecay: alphaDecay,
    dayGap: dayGap,
    consensusScore: consensusScore,
    realisticEdgeFraction: realisticEdgeFraction,
    computeDisclosureDecaySummary: computeDisclosureDecaySummary,
    seriesFromCloses: seriesFromCloses,
    buyHoldCurve: buyHoldCurve,
    walkForwardEmbargo: walkForwardEmbargo,
    scorePass: scorePass,
    allPass: allPass,
    computeWalkForwardValidationSummary: computeWalkForwardValidationSummary,
    horizonLadderNormSf: horizonLadderNormSf,
    horizonLadderProbability: horizonLadderProbability,
    computeHorizonLadderSummary: computeHorizonLadderSummary,
    createStrategyResearchAdapters: createStrategyResearchAdapters,
    registerStrategyResearchAdapters: registerStrategyResearchAdapters
  };
});
