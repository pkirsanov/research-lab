/*
 * rlportfolioanalytics.js — exact-date return alignment and cutoff-bounded drawdown for Feature 008
 * Scope 07 (Risk X-Ray).
 *
 * WHAT THIS OWNS, AND WHAT IT DELIBERATELY DOES NOT.
 *
 * It owns two things the repo has nowhere else: (1) aligning several per-symbol observation series
 * onto ONE exact common date basis under a declared evidence cutoff, and (2) drawdown / recovery /
 * unrecovered state measured against that basis.
 *
 * It does NOT own return math. `annualizedArithmetic`, `cagr`, `volatilityDrag` and
 * `volatilityDragApprox` already have exactly one definition in rlmetrics.js, and Product Principle
 * P18 requires reusing the owning implementation rather than defining a metric twice. A second
 * Sharpe is precisely the bug rlmetrics.js was created to end. This module therefore DELEGATES and
 * re-exports nothing it did not compute.
 *
 * THE ALIGNMENT RULE IS THE POINT OF THE MODULE.
 *
 * A portfolio return series is only meaningful if every constituent contributed on the SAME date.
 * The tempting shortcuts each produce a number that looks fine and is false:
 *   - forward-fill invents an observation the source never published;
 *   - interpolation invents one that never existed at all;
 *   - missing-as-zero asserts "this asset was flat that day", which is a measurement, not a gap;
 *   - a calendar guess substitutes our opinion of trading days for the source's own record.
 * So alignment is an exact set intersection of observation dates, and every date that fails to
 * intersect is REPORTED (in `alignment.excluded`) rather than silently dropped. A caller can see
 * what was lost. Nothing is fabricated to fill it.
 *
 * THE CUTOFF IS A HARD FENCE, NOT A FILTER PREFERENCE.
 *
 * Observations strictly after `cutoff` are excluded before anything is computed. This is what stops
 * a drawdown from "recovering" on evidence the claim never had. Recovery after the cutoff is not
 * reported as recovery; it is reported as `unrecovered`, because at the cutoff that is what was
 * true. A recovery duration is never extrapolated.
 *
 * NULL IS THE HONEST ANSWER. Every function returns null (or a state-bearing object) on insufficient
 * or invalid input, never 0. A zero drawdown and an unknown drawdown are different claims.
 *
 * UMD (module.exports + global attach), never ESM: these tools must keep working from file://, where
 * ES modules are CORS-gated.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory(
    (typeof module === "object" && module && module.exports)
      ? require("./rlmetrics.js")
      : (typeof globalThis === "object" ? globalThis.RLMETRICS : null)
  ));
  if (typeof module === "object" && module && module.exports) { module.exports = api; return; }
  if (typeof globalThis === "object") { globalThis.RLPORTFOLIOANALYTICS = api; }
})(function (RLMETRICS) {
  "use strict";

  var TRADING_DAYS = 252;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  function isNum(x) { return typeof x === "number" && Number.isFinite(x); }
  function isDate(x) { return typeof x === "string" && DATE_RE.test(x); }

  /* ------------------------------------------------------------------ alignment */

  /**
   * Align per-symbol observation series onto one exact common date basis, then weight them into a
   * single portfolio return series.
   *
   * `series` is { SYMBOL: [{ date: "YYYY-MM-DD", close: <number> }, ...] }. `weights` is
   * { SYMBOL: <number> }. `cutoff` is an inclusive "YYYY-MM-DD" fence. Every clock, cutoff, policy
   * and identity is an argument — this module reads no ambient clock and no global config.
   *
   * Returns a state-bearing object. `state` is one of:
   *   "ok"                  — a usable aligned sample exists
   *   "no-symbols"          — nothing was supplied
   *   "weights-invalid"     — a weight is absent, non-finite, or the set does not sum to 1
   *   "no-common-dates"     — the symbols never observed the same date under the cutoff
   *   "insufficient-sample" — fewer than two common dates, so no return can be formed
   */
  function alignPortfolioReturns(input) {
    var opts = input || {};
    var series = opts.series || {};
    var weights = opts.weights || {};
    var cutoff = opts.cutoff;
    var symbols = Object.keys(series);

    if (!symbols.length) return alignFailure("no-symbols", cutoff);
    if (cutoff !== undefined && cutoff !== null && !isDate(cutoff)) return alignFailure("cutoff-invalid", cutoff);

    var wsum = 0, i, s;
    for (i = 0; i < symbols.length; i += 1) {
      s = symbols[i];
      if (!isNum(weights[s]) || weights[s] < 0) return alignFailure("weights-invalid", cutoff);
      wsum += weights[s];
    }
    // A weight set that does not sum to 1 is not "close enough" — it silently rescales every
    // downstream return. Tolerance is float-noise only, not a business allowance.
    if (Math.abs(wsum - 1) > 1e-9) return alignFailure("weights-invalid", cutoff);

    // Per symbol: cutoff-bounded, de-duplicated, positive closes only. A non-positive close cannot
    // produce a simple return and is a source defect, not a zero.
    var maps = {}, excludedBySymbol = {};
    for (i = 0; i < symbols.length; i += 1) {
      s = symbols[i];
      var rows = Array.isArray(series[s]) ? series[s] : [];
      var m = new Map(), dropped = [];
      for (var r = 0; r < rows.length; r += 1) {
        var row = rows[r];
        if (!row || !isDate(row.date)) { dropped.push({ date: row && row.date, reason: "date-invalid" }); continue; }
        if (cutoff && row.date > cutoff) { dropped.push({ date: row.date, reason: "after-cutoff" }); continue; }
        if (!isNum(row.close) || row.close <= 0) { dropped.push({ date: row.date, reason: "close-invalid" }); continue; }
        m.set(row.date, row.close);
      }
      maps[s] = m;
      if (dropped.length) excludedBySymbol[s] = dropped;
    }

    // Exact intersection. No forward-fill, no interpolation, no missing-as-zero, no calendar guess.
    var first = maps[symbols[0]];
    var common = [];
    var union = new Set();
    for (i = 0; i < symbols.length; i += 1) { maps[symbols[i]].forEach(function (_v, k) { union.add(k); }); }
    first.forEach(function (_v, date) {
      for (var j = 1; j < symbols.length; j += 1) { if (!maps[symbols[j]].has(date)) return; }
      common.push(date);
    });
    common.sort();

    var excludedDates = [];
    union.forEach(function (d) { if (common.indexOf(d) === -1) excludedDates.push(d); });
    excludedDates.sort();

    if (!common.length) return alignFailure("no-common-dates", cutoff, excludedDates, excludedBySymbol);
    if (common.length < 2) return alignFailure("insufficient-sample", cutoff, excludedDates, excludedBySymbol);

    // Weighted simple returns on the common basis. The portfolio return for a period is the
    // weight-weighted sum of constituent simple returns over the SAME two dates.
    var returns = [], dates = [], index = [1], wealth = 1;
    for (i = 1; i < common.length; i += 1) {
      var rp = 0;
      for (var k = 0; k < symbols.length; k += 1) {
        var sym = symbols[k];
        var prev = maps[sym].get(common[i - 1]);
        var cur = maps[sym].get(common[i]);
        rp += weights[sym] * ((cur / prev) - 1);
      }
      returns.push(rp);
      dates.push(common[i]);
      wealth = wealth * (1 + rp);
      index.push(wealth);
    }

    return {
      state: "ok",
      symbols: symbols.slice().sort(),
      cutoff: cutoff === undefined ? null : cutoff,
      basis: "exact-common-date-intersection",
      commonDates: common,
      returns: returns,
      returnDates: dates,
      wealthIndex: index,
      alignment: {
        observedUnion: union.size,
        common: common.length,
        excluded: excludedDates,
        excludedBySymbol: excludedBySymbol
      }
    };
  }

  function alignFailure(state, cutoff, excludedDates, excludedBySymbol) {
    return {
      state: state,
      symbols: [],
      cutoff: cutoff === undefined ? null : (cutoff === null ? null : cutoff),
      basis: "exact-common-date-intersection",
      commonDates: [],
      returns: [],
      returnDates: [],
      wealthIndex: [],
      alignment: {
        observedUnion: 0,
        common: 0,
        excluded: excludedDates || [],
        excludedBySymbol: excludedBySymbol || {}
      }
    };
  }

  /* ------------------------------------------------------------- return metrics */

  /**
   * Return statistics for an aligned sample. Arithmetic mean, compounded CAGR and the OBSERVED drag
   * between them are reported SEPARATELY and are never collapsed into one "return".
   *
   * The approximation g ~= mu - sigma^2/2 is reported as `dragApprox` and is explicitly labelled
   * conditional: it holds under continuous compounding of a log-normal process, which a finite
   * sample of discrete rebalanced returns is not. It is offered to CROSS-CHECK the observed drag,
   * never to replace it — and this module states no conclusion that lower volatility produces
   * higher wealth, because over a finite realised sample that is simply not always true.
   *
   * All four quantities delegate to rlmetrics.js, the single owner of these definitions.
   */
  function computeReturnMetrics(aligned, options) {
    if (!aligned || aligned.state !== "ok") return { state: (aligned && aligned.state) || "no-sample" };
    if (!RLMETRICS) return { state: "metrics-unavailable" };
    var opts = options || {};
    var ppy = isNum(opts.periodsPerYear) && opts.periodsPerYear > 0 ? opts.periodsPerYear : TRADING_DAYS;

    var returns = aligned.returns;
    var idx = aligned.wealthIndex;
    var years = returns.length / ppy;

    var arithmetic = RLMETRICS.annualizedArithmetic(returns, ppy);
    var compounded = RLMETRICS.cagr(idx[0], idx[idx.length - 1], years);
    var drag = RLMETRICS.volatilityDrag(returns, ppy);
    var vol = RLMETRICS.annualizedVol(returns, ppy);
    var dragApprox = RLMETRICS.volatilityDragApprox(vol);

    return {
      state: "ok",
      periodsPerYear: ppy,
      sampleSize: returns.length,
      years: years,
      firstDate: aligned.commonDates[0],
      lastDate: aligned.commonDates[aligned.commonDates.length - 1],
      cutoff: aligned.cutoff,
      arithmeticAnnualized: arithmetic,
      compoundedCagr: compounded,
      volatilityAnnualized: vol,
      dragObserved: drag,
      dragApprox: dragApprox,
      dragApproxIsConditional: true,
      dragApproxAssumptions: "Holds under continuous compounding of a log-normal process; a finite discrete sample is not that, so this cross-checks the observed drag rather than replacing it.",
      // A sample this short cannot support an annualized claim without saying so out loud.
      annualizationState: returns.length >= ppy ? "supported-by-sample" : "extrapolated-from-short-sample"
    };
  }

  /* ------------------------------------------------------------------ drawdown */

  /**
   * Exact drawdown against the aligned wealth index, bounded by the same cutoff.
   *
   * `recoveryState` is "recovered" only when an observation AT OR BEFORE the cutoff regained the
   * prior peak. Otherwise it is "unrecovered", and `recoveryDate` / `recoveryPeriods` stay null.
   * No future recovery is projected, and no duration is fabricated for one that has not happened.
   */
  function computeDrawdown(aligned) {
    if (!aligned || aligned.state !== "ok") return { state: (aligned && aligned.state) || "no-sample" };

    var idx = aligned.wealthIndex;
    var dates = aligned.commonDates;
    var peak = idx[0], peakDate = dates[0], peakAt = 0;
    var maxDd = 0, maxPeakDate = dates[0], maxTroughDate = dates[0], maxTroughAt = 0, maxPeakAt = 0;

    for (var i = 1; i < idx.length; i += 1) {
      if (idx[i] > peak) { peak = idx[i]; peakDate = dates[i]; peakAt = i; }
      var dd = (idx[i] / peak) - 1;
      if (dd < maxDd) { maxDd = dd; maxPeakDate = peakDate; maxTroughDate = dates[i]; maxTroughAt = i; maxPeakAt = peakAt; }
    }

    // Recovery is searched only within the sample, which is already cutoff-bounded.
    //
    // The comparison carries a RELATIVE float-noise tolerance rather than testing exact equality.
    // A wealth index is built by chained multiplication, so a path that mathematically regains its
    // peak exactly (100 -> 120 -> 90 -> 120) lands on 1.1999999999999997, and a strict `>=` would
    // report a completed recovery as unrecovered. The tolerance is float noise only (1e-12
    // relative), not a business allowance: a genuine near-miss is orders of magnitude larger and
    // still reports `unrecovered`.
    var recoveryDate = null, recoveryPeriods = null, recoveryState = "unrecovered";
    var peakValue = idx[maxPeakAt];
    var regainFloor = peakValue * (1 - 1e-12);
    for (var j = maxTroughAt + 1; j < idx.length; j += 1) {
      if (idx[j] >= regainFloor) { recoveryDate = dates[j]; recoveryPeriods = j - maxTroughAt; recoveryState = "recovered"; break; }
    }

    var runningPeak = idx[0];
    for (var k = 1; k < idx.length; k += 1) { if (idx[k] > runningPeak) runningPeak = idx[k]; }
    var current = (idx[idx.length - 1] / runningPeak) - 1;

    // Time under water is measured to the cutoff when unrecovered, and it is labelled as such by
    // `recoveryState` rather than presented as a completed duration.
    var underWaterEnd = recoveryState === "recovered" ? (dates.indexOf(recoveryDate)) : (idx.length - 1);

    return {
      state: "ok",
      cutoff: aligned.cutoff,
      maxDrawdown: maxDd,
      peakDate: maxDd < 0 ? maxPeakDate : null,
      troughDate: maxDd < 0 ? maxTroughDate : null,
      currentDrawdown: current,
      currentIsAtPeak: Math.abs(current) <= 1e-12,
      recoveryState: maxDd < 0 ? recoveryState : "no-drawdown",
      recoveryDate: recoveryDate,
      recoveryPeriods: recoveryPeriods,
      timeUnderWaterPeriods: maxDd < 0 ? (underWaterEnd - maxPeakAt) : 0,
      timeUnderWaterIsOpen: maxDd < 0 && recoveryState === "unrecovered",
      asOf: dates[dates.length - 1]
    };
  }

  /* ------------------------------------------------------------------ identity */

  /**
   * A deterministic identity over the exact inputs that produced a result. Two runs over the same
   * frozen observations under the same cutoff and weights MUST produce the same identity; changing
   * any one of them MUST change it. This is what lets the UI prove a parameter change created a
   * CHILD identity rather than silently refetching frozen observations.
   */
  function analyticsIdentity(input) {
    var opts = input || {};
    var symbols = Object.keys(opts.weights || {}).sort();
    var parts = symbols.map(function (s) { return s + ":" + opts.weights[s]; });
    return [
      "basis=exact-common-date-intersection",
      "cutoff=" + (opts.cutoff || "none"),
      "ppy=" + (isNum(opts.periodsPerYear) ? opts.periodsPerYear : TRADING_DAYS),
      "weights=" + parts.join(",")
    ].join("|");
  }

  return {
    TRADING_DAYS: TRADING_DAYS,
    alignPortfolioReturns: alignPortfolioReturns,
    computeReturnMetrics: computeReturnMetrics,
    computeDrawdown: computeDrawdown,
    analyticsIdentity: analyticsIdentity
  };
});
