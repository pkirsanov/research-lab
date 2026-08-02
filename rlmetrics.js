/*
 * rlmetrics.js — the ONE definition of the shared risk/return metrics.
 *
 * Why this exists: the same asset used to yield two different Sharpe ratios depending on which file
 * computed it. scripts/brief-refresh.mjs and etf-momentum-lab.html divided EXCESS CAGR by volatility
 * (a geometric Sharpe); other call sites annualised the MEAN of period returns (the arithmetic
 * Sharpe of Sharpe 1966/1994). Both are defensible; both being called "sharpe" is not. A number the
 * brief publishes must not depend on which file produced it.
 *
 * The default is ARITHMETIC. `sharpe` is an alias of `sharpeArithmetic`. A caller that genuinely
 * wants the geometric form must say `sharpeGeometric` and label it at the point of use, so the
 * convention is always visible rather than inferred.
 *
 * Volatility drag — the gap between the arithmetic mean return and the compounded (geometric) return
 * that volatility opens up — is exposed as a first-class metric. Four tools depend on it implicitly
 * and none displayed it.
 *
 * UMD (module.exports + global attach), never ESM: these tools must keep working from file://, and
 * ES modules are CORS-gated there.
 *
 * Every function is NULL-SAFE in the honest direction: insufficient or invalid input returns null,
 * never 0. A zero Sharpe and an unknown Sharpe are different claims.
 *
 * rlexperience-adapters/strategy-research.js consumes this module through the same UMD dependency
 * pattern used by the shared foundations. It owns strategy reductions, not a second metric formula.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) { module.exports = api; return; }
  if (typeof globalThis === "undefined") throw new Error("RLMETRICS_BROWSER_GLOBAL_UNAVAILABLE");
  globalThis.RLMETRICS = api;
})(function () {
  "use strict";

  /* Trading periods per year for daily bars. The same constant every consumer used inline. */
  var TRADING_DAYS = 252;

  function isNum(value) { return typeof value === "number" && isFinite(value); }

  function finiteSeries(values) {
    if (!values || typeof values.length !== "number") return null;
    var out = [], i;
    for (i = 0; i < values.length; i++) if (isNum(values[i])) out.push(values[i]);
    return out;
  }

  /** Simple mean of period returns. null when there is nothing to average. */
  function arithmeticMean(returns) {
    var r = finiteSeries(returns);
    if (!r || !r.length) return null;
    var sum = 0, i;
    for (i = 0; i < r.length; i++) sum += r[i];
    return sum / r.length;
  }

  /** Population standard deviation of period returns. Needs at least two observations. */
  function stdev(returns) {
    var r = finiteSeries(returns);
    if (!r || r.length < 2) return null;
    var mean = arithmeticMean(r), acc = 0, i;
    for (i = 0; i < r.length; i++) { var d = r[i] - mean; acc += d * d; }
    return Math.sqrt(acc / r.length);
  }

  /** Annualised volatility: sd of period returns scaled by sqrt(periods per year). */
  function annualizedVol(returns, periodsPerYear) {
    var sd = stdev(returns);
    var ppy = isNum(periodsPerYear) && periodsPerYear > 0 ? periodsPerYear : TRADING_DAYS;
    return sd === null ? null : sd * Math.sqrt(ppy);
  }

  /** Annualised ARITHMETIC return: mean period return scaled by periods per year. */
  function annualizedArithmetic(returns, periodsPerYear) {
    var mean = arithmeticMean(returns);
    var ppy = isNum(periodsPerYear) && periodsPerYear > 0 ? periodsPerYear : TRADING_DAYS;
    return mean === null ? null : mean * ppy;
  }

  /** Compound annual growth rate from endpoints. Needs a positive base and a positive span. */
  function cagr(first, last, years) {
    if (!isNum(first) || !isNum(last) || !isNum(years)) return null;
    if (first <= 0 || last <= 0 || years <= 0) return null;
    return Math.pow(last / first, 1 / years) - 1;
  }

  /**
   * THE DEFAULT. Arithmetic Sharpe (Sharpe 1966/1994): annualised excess mean return divided by
   * annualised volatility. `riskFreeAnnual` is a decimal rate (0.045 = 4.5%).
   */
  function sharpeArithmetic(returns, periodsPerYear, riskFreeAnnual) {
    var ppy = isNum(periodsPerYear) && periodsPerYear > 0 ? periodsPerYear : TRADING_DAYS;
    var annReturn = annualizedArithmetic(returns, ppy);
    var vol = annualizedVol(returns, ppy);
    var rf = isNum(riskFreeAnnual) ? riskFreeAnnual : 0;
    if (annReturn === null || vol === null || !(vol > 0)) return null;
    return (annReturn - rf) / vol;
  }

  /**
   * Geometric Sharpe: excess COMPOUNDED return divided by annualised volatility. Lower than the
   * arithmetic form by roughly the volatility drag, and NOT interchangeable with it — a caller
   * choosing this must label it, because the two answer different questions.
   */
  function sharpeGeometric(cagrValue, annualVol, riskFreeAnnual) {
    var rf = isNum(riskFreeAnnual) ? riskFreeAnnual : 0;
    if (!isNum(cagrValue) || !isNum(annualVol) || !(annualVol > 0)) return null;
    return (cagrValue - rf) / annualVol;
  }

  /** Per-period GEOMETRIC mean return: the constant rate that compounds to the same total. */
  function geometricMean(returns) {
    var r = finiteSeries(returns);
    if (!r || !r.length) return null;
    var logSum = 0, i;
    for (i = 0; i < r.length; i++) {
      if (!(1 + r[i] > 0)) return null; // a total loss has no finite geometric mean
      logSum += Math.log(1 + r[i]);
    }
    return Math.exp(logSum / r.length) - 1;
  }

  /** Annualised GEOMETRIC return: the per-period geometric mean compounded over a year. */
  function annualizedGeometric(returns, periodsPerYear) {
    var g = geometricMean(returns);
    var ppy = isNum(periodsPerYear) && periodsPerYear > 0 ? periodsPerYear : TRADING_DAYS;
    return g === null ? null : Math.pow(1 + g, ppy) - 1;
  }

  /**
   * Volatility drag: what compounding costs relative to the arithmetic average.
   *
   * It MUST be computed from PER-PERIOD quantities and then scaled. Subtracting an endpoint CAGR
   * from an arithmetic mean scaled by periods-per-year mixes two different annualisation
   * conventions and can produce a NEGATIVE drag, which is impossible: by AM-GM the arithmetic mean
   * is never below the geometric mean. (Measured on the committed VGT window, the mixed form gives
   * -1.05% where the correct value is +2.96%, against a sigma^2/2 estimate of 2.95%.)
   */
  function volatilityDrag(returns, periodsPerYear) {
    var mean = arithmeticMean(returns);
    var g = geometricMean(returns);
    var ppy = isNum(periodsPerYear) && periodsPerYear > 0 ? periodsPerYear : TRADING_DAYS;
    if (mean === null || g === null) return null;
    return (mean - g) * ppy;
  }

  /** The textbook estimate of the same quantity, sigma^2 / 2, for cross-checking. */
  function volatilityDragApprox(annualVol) {
    return isNum(annualVol) ? (annualVol * annualVol) / 2 : null;
  }

  /**
   * Full-Kelly fraction for a continuous-return approximation: annualised excess return divided by
   * variance. Educational sizing arithmetic only — never a recommendation.
   */
  function kellyFraction(excessAnnualReturn, annualVol) {
    if (!isNum(excessAnnualReturn) || !isNum(annualVol) || !(annualVol > 0)) return null;
    return excessAnnualReturn / (annualVol * annualVol);
  }

  /** Period returns from a close series (array of numbers or of {c} rows). */
  function returnsFromCloses(rows) {
    if (!rows || !rows.length) return [];
    var out = [], i, prev = null;
    for (i = 0; i < rows.length; i++) {
      var close = typeof rows[i] === "number" ? rows[i] : (rows[i] && rows[i].c);
      if (!isNum(close) || close <= 0) { prev = null; continue; }
      if (prev !== null) out.push(close / prev - 1);
      prev = close;
    }
    return out;
  }

  return {
    TRADING_DAYS: TRADING_DAYS,
    arithmeticMean: arithmeticMean,
    geometricMean: geometricMean,
    stdev: stdev,
    annualizedVol: annualizedVol,
    annualizedArithmetic: annualizedArithmetic,
    annualizedGeometric: annualizedGeometric,
    cagr: cagr,
    sharpe: sharpeArithmetic,
    sharpeArithmetic: sharpeArithmetic,
    sharpeGeometric: sharpeGeometric,
    volatilityDrag: volatilityDrag,
    volatilityDragApprox: volatilityDragApprox,
    kellyFraction: kellyFraction,
    returnsFromCloses: returnsFromCloses
  };
});
