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
    //
    // Per-symbol returns are emitted alongside so covariance and risk contributions run on the
    // IDENTICAL aligned basis. Letting a caller re-derive them would permit a second, subtly
    // different alignment, and a covariance built on one basis while weights come from another is
    // wrong in a way no assertion downstream would catch.
    var returns = [], dates = [], index = [1], wealth = 1, perSymbol = {};
    for (i = 0; i < symbols.length; i += 1) perSymbol[symbols[i]] = [];
    for (i = 1; i < common.length; i += 1) {
      var rp = 0;
      for (var k = 0; k < symbols.length; k += 1) {
        var sym = symbols[k];
        var prev = maps[sym].get(common[i - 1]);
        var cur = maps[sym].get(common[i]);
        var ri = (cur / prev) - 1;
        perSymbol[sym].push(ri);
        rp += weights[sym] * ri;
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
      perSymbolReturns: perSymbol,
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
      perSymbolReturns: {},
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

  /* ------------------------------------------------------------------ weights */

  /**
   * Normalized portfolio weights from validated holdings.
   *
   * `derivedValue` is the one field every input basis (weight, quantity-price, local-value) already
   * resolves to in rlportfolio.js, so reading it here reuses that normalization instead of
   * re-deriving a second, divergent notion of position size.
   *
   * A holding without a usable `derivedValue` makes the whole weight set refuse. Dropping it would
   * silently re-weight every remaining position, which is a different portfolio than the one the
   * user imported.
   */
  function deriveWeights(holdings) {
    if (!Array.isArray(holdings) || !holdings.length) return { state: "no-holdings", weights: {} };
    var totals = {}, total = 0, i, h;
    for (i = 0; i < holdings.length; i += 1) {
      h = holdings[i];
      if (!h || typeof h.symbol !== "string" || !h.symbol) return { state: "holding-invalid", weights: {} };
      if (!isNum(h.derivedValue) || h.derivedValue <= 0) return { state: "value-unavailable", weights: {}, symbol: h.symbol };
      totals[h.symbol] = (totals[h.symbol] || 0) + h.derivedValue;
      total += h.derivedValue;
    }
    if (!(total > 0)) return { state: "value-unavailable", weights: {} };
    var weights = {}, keys = Object.keys(totals);
    for (i = 0; i < keys.length; i += 1) weights[keys[i]] = totals[keys[i]] / total;
    return { state: "ok", weights: weights, symbols: keys.sort(), totalValue: total };
  }

  /* --------------------------------------------------------------- projection */

  /**
   * ONE immutable result behind every Risk X-Ray surface.
   *
   * Simple copy, Power copy, canvas points, and the accessible table are all projected from this
   * single object, so a pixel and a table cell cannot disagree: there is no second computation for
   * them to drift apart from.
   */
  function riskXRayProjection(input) {
    var opts = input || {};
    var weightResult = deriveWeights(opts.holdings);
    if (weightResult.state !== "ok") {
      return { state: weightResult.state, available: false, symbol: weightResult.symbol || null, points: [], rows: [] };
    }

    var aligned = alignPortfolioReturns({
      series: opts.series,
      weights: weightResult.weights,
      cutoff: opts.cutoff
    });
    if (aligned.state !== "ok") {
      return { state: aligned.state, available: false, points: [], rows: [], cutoff: opts.cutoff || null };
    }

    var metrics = computeReturnMetrics(aligned, { periodsPerYear: opts.periodsPerYear });
    var drawdown = computeDrawdown(aligned);

    // Scope 08 diagnostics. Each is OPTIONAL and independently unavailable: a missing benchmark
    // must not suppress concentration, and an unmeasurable covariance must not suppress CAPM.
    var lenses = Array.isArray(opts.concentrationLenses) ? opts.concentrationLenses : [];
    var concentration = lenses.map(function (lens) { return computeConcentration(opts.holdings, lens); });

    var capm = { state: "benchmark-unavailable" };
    if (Array.isArray(opts.benchmarkReturns) && opts.benchmarkReturns.length === aligned.returns.length) {
      capm = fitCapm(aligned.returns, opts.benchmarkReturns, {
        periodsPerYear: opts.periodsPerYear,
        riskFreeAnnual: opts.riskFreeAnnual,
        minimumObservations: opts.minimumCapmObservations
      });
    }

    var factors = { state: "factors-unavailable" };
    if (opts.factorReturns && Object.keys(opts.factorReturns).length) {
      factors = fitFactors(aligned.returns, opts.factorReturns, {
        periodsPerYear: opts.periodsPerYear,
        factorsVersion: opts.proxyFactorsVersion
      });
    }

    var covariance = { state: "not-computed" };
    var contributions = { state: "not-computed" };
    if (aligned.returns.length >= 2) {
      covariance = computeCovariance(aligned.perSymbolReturns, { shrinkageLambda: opts.shrinkageLambda });
      if (covariance.state === "ok") {
        // Contributions run on the CONDITIONED matrix, and the projection carries which one was
        // used so a reader is never left guessing whether a shrinkage assumption is baked in.
        contributions = riskContributions(covariance.symbols, weightResult.weights, covariance.conditioned, {
          reconciliationTolerance: opts.reconciliationTolerance
        });
        contributions.basis = "conditioned";
        contributions.shrinkageLambda = covariance.shrinkageLambda;
      }
    }

    var returnSplit = returnContributions(weightResult.symbols, weightResult.weights, aligned.perSymbolReturns, {
      reconciliationTolerance: opts.reconciliationTolerance
    });

    // Canvas points and table rows come from the SAME wealth index in the SAME order.
    var points = aligned.commonDates.map(function (date, i) {
      return {
        pointId: "rx-" + date.replace(/-/g, ""),
        date: date,
        wealth: aligned.wealthIndex[i],
        drawdownAt: (aligned.wealthIndex[i] / runningPeakAt(aligned.wealthIndex, i)) - 1
      };
    });

    return {
      state: "ok",
      available: true,
      identity: analyticsIdentity({
        weights: weightResult.weights,
        cutoff: opts.cutoff,
        periodsPerYear: opts.periodsPerYear
      }),
      cutoff: aligned.cutoff,
      symbols: weightResult.symbols,
      weights: weightResult.weights,
      alignment: aligned.alignment,
      metrics: metrics,
      drawdown: drawdown,
      concentration: concentration,
      capm: capm,
      factors: factors,
      benchmarkSymbol: opts.benchmarkSymbol || null,
      covariance: covariance,
      contributions: contributions,
      returnContributions: returnSplit,
      assetTreatment: assetTreatment(opts.holdings, opts.lookThroughSource),
      points: points,
      rows: points
    };
  }

  function runningPeakAt(index, i) {
    var peak = index[0];
    for (var k = 1; k <= i; k += 1) { if (index[k] > peak) peak = index[k]; }
    return peak;
  }

  /* ----------------------------------------------------- Scope 08 concentration */

  /**
   * Concentration by one exposure lens.
   *
   * A holding whose lens field is absent is reported in `missing`, never folded into an "Other"
   * bucket, assigned zero, or given the average. Those three shortcuts all produce a complete-looking
   * distribution from incomplete data, which is worse than a visible gap: the reader cannot tell that
   * anything is missing. `coveredWeight` states exactly how much of the portfolio the lens explains.
   */
  function computeConcentration(holdings, lens) {
    if (!Array.isArray(holdings) || !holdings.length) return { state: "no-holdings", lens: lens, buckets: [], missing: [] };
    if (typeof lens !== "string" || !lens) return { state: "lens-invalid", lens: lens, buckets: [], missing: [] };
    var weightResult = deriveWeights(holdings);
    if (weightResult.state !== "ok") return { state: weightResult.state, lens: lens, buckets: [], missing: [] };

    var totals = {}, missing = [], coveredWeight = 0, i, h, key, w;
    var bySymbol = {};
    for (i = 0; i < holdings.length; i += 1) {
      h = holdings[i];
      if (bySymbol[h.symbol]) continue;
      bySymbol[h.symbol] = true;
      key = h[lens];
      w = weightResult.weights[h.symbol];
      if (typeof key !== "string" || !key.trim()) { missing.push(h.symbol); continue; }
      key = key.trim();
      totals[key] = (totals[key] || 0) + w;
      coveredWeight += w;
    }

    var buckets = Object.keys(totals).sort().map(function (name) {
      return { key: name, weight: totals[name] };
    }).sort(function (a, b) { return b.weight - a.weight; });

    return {
      state: "ok",
      lens: lens,
      buckets: buckets,
      largest: buckets.length ? buckets[0] : null,
      coveredWeight: coveredWeight,
      missing: missing.sort(),
      // Coverage is stated so a lens explaining a third of the book cannot read like a full picture.
      coverageState: missing.length === 0 ? "complete" : (coveredWeight > 0 ? "partial" : "none")
    };
  }

  /* ------------------------------------------------------------- Scope 08 CAPM */

  /**
   * OLS fit of portfolio excess return on benchmark excess return.
   *
   * Beta, R-squared, correlation and residual risk are reported SEPARATELY and none is allowed to
   * stand in for another. A low R-squared does not make beta wrong, and a beta near zero does not
   * make total risk low — it makes the BENCHMARK a poor explanation of this portfolio, which is a
   * statement about the model rather than about the risk.
   */
  function fitCapm(portfolioReturns, benchmarkReturns, options) {
    var opts = options || {};
    if (!Array.isArray(portfolioReturns) || !Array.isArray(benchmarkReturns)) return { state: "input-invalid" };
    if (portfolioReturns.length !== benchmarkReturns.length) return { state: "length-mismatch" };
    var n = portfolioReturns.length;
    var minimum = isNum(opts.minimumObservations) ? opts.minimumObservations : 0;
    if (n < 2) return { state: "insufficient-sample", sampleSize: n };

    var ppy = isNum(opts.periodsPerYear) && opts.periodsPerYear > 0 ? opts.periodsPerYear : TRADING_DAYS;
    var rfPeriod = isNum(opts.riskFreeAnnual) ? opts.riskFreeAnnual / ppy : 0;

    var xs = [], ys = [], i;
    for (i = 0; i < n; i += 1) {
      if (!isNum(portfolioReturns[i]) || !isNum(benchmarkReturns[i])) return { state: "non-finite-input" };
      ys.push(portfolioReturns[i] - rfPeriod);
      xs.push(benchmarkReturns[i] - rfPeriod);
    }

    var mx = mean(xs), my = mean(ys);
    var sxx = 0, sxy = 0, syy = 0;
    for (i = 0; i < n; i += 1) {
      sxx += (xs[i] - mx) * (xs[i] - mx);
      sxy += (xs[i] - mx) * (ys[i] - my);
      syy += (ys[i] - my) * (ys[i] - my);
    }
    // A benchmark that never moved cannot explain anything, and dividing by its variance would
    // manufacture an infinite beta from a degenerate sample.
    if (sxx <= 0) return { state: "benchmark-degenerate", sampleSize: n };

    var beta = sxy / sxx;
    var alphaPeriod = my - beta * mx;
    var rSquared = syy > 0 ? (sxy * sxy) / (sxx * syy) : null;
    var correlation = syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;

    var ssResidual = 0;
    for (i = 0; i < n; i += 1) {
      var predicted = alphaPeriod + beta * xs[i];
      ssResidual += (ys[i] - predicted) * (ys[i] - predicted);
    }
    var residualVariance = n > 2 ? ssResidual / (n - 2) : null;
    var residualRisk = residualVariance === null ? null : Math.sqrt(residualVariance * ppy);
    var betaStdError = residualVariance === null ? null : Math.sqrt(residualVariance / sxx);

    return {
      state: "ok",
      sampleSize: n,
      periodsPerYear: ppy,
      beta: beta,
      alphaAnnualized: alphaPeriod * ppy,
      rSquared: rSquared,
      correlation: correlation,
      residualRiskAnnualized: residualRisk,
      betaStandardError: betaStdError,
      // Explanatory power is reported as its own state so a low-fit beta is never read as a precise one.
      fitState: rSquared === null ? "unavailable" : (rSquared < 0.3 ? "low-explanatory-power" : "explained"),
      sampleState: n >= minimum ? "meets-minimum" : "below-configured-minimum",
      configuredMinimum: minimum
    };
  }

  function mean(values) {
    var total = 0;
    for (var i = 0; i < values.length; i += 1) total += values[i];
    return total / values.length;
  }

  /* ------------------------------------------------------- Scope 08 covariance */

  /**
   * Raw sample covariance and, separately, a fixed-lambda diagonally shrunk matrix.
   *
   * The two are returned as DISTINCT results rather than one "best" matrix. Lambda is supplied by
   * config and is never raised automatically to rescue a singular sample: silently increasing
   * shrinkage until a matrix inverts would report a conditioned answer as though it were the
   * observed one, hiding the very degeneracy the diagnostics exist to surface.
   */
  function computeCovariance(returnsBySymbol, options) {
    var opts = options || {};
    var symbols = Object.keys(returnsBySymbol || {}).sort();
    if (!symbols.length) return { state: "no-symbols" };
    var n = returnsBySymbol[symbols[0]].length, i, j, k;
    for (i = 0; i < symbols.length; i += 1) {
      if (!Array.isArray(returnsBySymbol[symbols[i]]) || returnsBySymbol[symbols[i]].length !== n) {
        return { state: "length-mismatch" };
      }
    }
    if (n < 2) return { state: "insufficient-sample", sampleSize: n };

    var means = {};
    for (i = 0; i < symbols.length; i += 1) means[symbols[i]] = mean(returnsBySymbol[symbols[i]]);

    var raw = [];
    for (i = 0; i < symbols.length; i += 1) {
      raw.push([]);
      for (j = 0; j < symbols.length; j += 1) {
        var acc = 0;
        for (k = 0; k < n; k += 1) {
          acc += (returnsBySymbol[symbols[i]][k] - means[symbols[i]]) *
            (returnsBySymbol[symbols[j]][k] - means[symbols[j]]);
        }
        raw[i].push(acc / (n - 1));
      }
    }

    var lambda = isNum(opts.shrinkageLambda) ? opts.shrinkageLambda : 0;
    if (lambda < 0 || lambda > 1) return { state: "lambda-invalid", lambda: lambda };
    var conditioned = [];
    for (i = 0; i < symbols.length; i += 1) {
      conditioned.push([]);
      for (j = 0; j < symbols.length; j += 1) {
        // Diagonal shrinkage: off-diagonals are pulled toward zero, variances are preserved.
        conditioned[i].push(i === j ? raw[i][j] : raw[i][j] * (1 - lambda));
      }
    }

    return {
      state: "ok",
      symbols: symbols,
      sampleSize: n,
      raw: raw,
      conditioned: conditioned,
      shrinkageLambda: lambda,
      rawPositiveDefinite: isPositiveDefinite(raw),
      conditionedPositiveDefinite: isPositiveDefinite(conditioned),
      lambdaWasAutoRaised: false
    };
  }

  /**
   * Cholesky attempt. Success is the definition of positive-definite used here.
   *
   * The pivot test is RELATIVE to the matrix scale rather than a comparison against exact zero. A
   * genuinely singular matrix — two perfectly collinear series, say — produces a final pivot of
   * `4v - 4v`, which in floating point lands a hair above zero rather than on it. Testing `> 0`
   * would call that matrix positive-definite and hand a caller an inverse built on noise, which is
   * precisely the degeneracy these diagnostics exist to surface.
   */
  function isPositiveDefinite(matrix) {
    var size = matrix.length, L = [], i, j, k, scale = 0;
    for (i = 0; i < size; i += 1) { if (Math.abs(matrix[i][i]) > scale) scale = Math.abs(matrix[i][i]); }
    var epsilon = scale * 1e-12;
    for (i = 0; i < size; i += 1) { L.push(new Array(size).fill(0)); }
    for (i = 0; i < size; i += 1) {
      for (j = 0; j <= i; j += 1) {
        var sum = matrix[i][j];
        for (k = 0; k < j; k += 1) sum -= L[i][k] * L[j][k];
        if (i === j) {
          if (!(sum > epsilon)) return false;
          L[i][j] = Math.sqrt(sum);
        } else {
          L[i][j] = sum / L[j][j];
        }
      }
    }
    return true;
  }

  /* ------------------------------------------------ Scope 08 risk contribution */

  /**
   * Marginal and total risk contribution.
   *
   * Risk contributions sum to total portfolio risk by construction (Euler decomposition), so the
   * reconciliation check is a genuine test of the arithmetic rather than a formality — if it fails,
   * something is wrong and the result says so instead of presenting figures that do not add up.
   *
   * A negative contribution is REPORTED, not clamped: a genuine hedge reduces portfolio risk, and
   * flooring it at zero would erase the single most useful thing the decomposition can show.
   */
  function riskContributions(symbols, weights, covariance, options) {
    var opts = options || {};
    if (!Array.isArray(symbols) || !symbols.length) return { state: "no-symbols" };
    if (!Array.isArray(covariance) || covariance.length !== symbols.length) return { state: "covariance-shape-invalid" };
    var w = [], i, j;
    for (i = 0; i < symbols.length; i += 1) {
      if (!isNum(weights[symbols[i]])) return { state: "weights-invalid" };
      w.push(weights[symbols[i]]);
    }

    var variance = 0;
    for (i = 0; i < w.length; i += 1) {
      for (j = 0; j < w.length; j += 1) variance += w[i] * covariance[i][j] * w[j];
    }
    if (!(variance > 0)) return { state: "zero-variance" };
    var sigma = Math.sqrt(variance);

    var marginal = [], contribution = [], total = 0;
    for (i = 0; i < w.length; i += 1) {
      var cov = 0;
      for (j = 0; j < w.length; j += 1) cov += covariance[i][j] * w[j];
      var mrc = cov / sigma;
      marginal.push(mrc);
      contribution.push(w[i] * mrc);
      total += w[i] * mrc;
    }

    var tolerance = isNum(opts.reconciliationTolerance) ? opts.reconciliationTolerance : 1e-8;
    var residual = Math.abs(total - sigma);

    return {
      state: "ok",
      symbols: symbols.slice(),
      portfolioRisk: sigma,
      marginal: marginal,
      contribution: contribution,
      contributionShare: contribution.map(function (c) { return c / sigma; }),
      contributionSum: total,
      reconciliationResidual: residual,
      reconciliationTolerance: tolerance,
      reconciled: residual <= tolerance,
      negativeContributors: symbols.filter(function (_s, index) { return contribution[index] < 0; })
    };
  }

  /* ---------------------------------------------------- Scope 08 factor model */

  /**
   * Multivariate OLS of portfolio excess return on DECLARED proxy factors, with intercept.
   *
   * Factors are supplied as already-built return series keyed by the config-declared factor id. No
   * factor is ever inferred from a label, a ticker name, or a sector string: a factor exists only
   * because `analytics.proxyFactors` declared it as an explicit long-short spread of real tickers,
   * and a leg with no observations makes that factor `unavailable` rather than silently dropped.
   *
   * These are PROXIES, not academic factor returns, and the result says so. Calling `IWM - SPY` a
   * size factor is a modelling convenience; treating it as the Fama-French SMB would be a claim the
   * data does not support.
   */
  function fitFactors(portfolioReturns, factorSeries, options) {
    var opts = options || {};
    if (!Array.isArray(portfolioReturns)) return { state: "input-invalid" };
    var ids = Object.keys(factorSeries || {}).sort();
    if (!ids.length) return { state: "no-factors" };

    var n = portfolioReturns.length, i, j, k;
    var available = [], unavailable = [];
    for (i = 0; i < ids.length; i += 1) {
      var s = factorSeries[ids[i]];
      if (!Array.isArray(s) || s.length !== n || !s.every(isNum)) { unavailable.push(ids[i]); continue; }
      available.push(ids[i]);
    }
    if (!available.length) return { state: "no-usable-factors", unavailable: unavailable };

    var p = available.length + 1;
    if (n < p + 1) return { state: "insufficient-sample", sampleSize: n, parameters: p, unavailable: unavailable };

    // Design matrix with intercept in column 0.
    var X = [], y = [];
    for (i = 0; i < n; i += 1) {
      if (!isNum(portfolioReturns[i])) return { state: "non-finite-input" };
      var row = [1];
      for (j = 0; j < available.length; j += 1) row.push(factorSeries[available[j]][i]);
      X.push(row);
      y.push(portfolioReturns[i]);
    }

    // Normal equations. XtX is symmetric positive-semidefinite; a rank-deficient design (two
    // collinear factors) makes it singular, and that REFUSES rather than returning a pseudo-fit.
    var XtX = [], Xty = [];
    for (i = 0; i < p; i += 1) {
      XtX.push(new Array(p).fill(0));
      Xty.push(0);
    }
    for (k = 0; k < n; k += 1) {
      for (i = 0; i < p; i += 1) {
        Xty[i] += X[k][i] * y[k];
        for (j = 0; j < p; j += 1) XtX[i][j] += X[k][i] * X[k][j];
      }
    }

    if (!isPositiveDefinite(XtX)) {
      return { state: "rank-deficient", available: available, unavailable: unavailable, sampleSize: n };
    }

    var beta = solveSymmetric(XtX, Xty);
    if (!beta) return { state: "rank-deficient", available: available, unavailable: unavailable, sampleSize: n };

    var ssResidual = 0, ssTotal = 0, my = mean(y);
    for (k = 0; k < n; k += 1) {
      var predicted = 0;
      for (i = 0; i < p; i += 1) predicted += beta[i] * X[k][i];
      ssResidual += (y[k] - predicted) * (y[k] - predicted);
      ssTotal += (y[k] - my) * (y[k] - my);
    }

    var ppy = isNum(opts.periodsPerYear) && opts.periodsPerYear > 0 ? opts.periodsPerYear : TRADING_DAYS;
    var exposures = {};
    for (i = 0; i < available.length; i += 1) exposures[available[i]] = beta[i + 1];

    var rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : null;
    var adjusted = (ssTotal > 0 && n > p) ? 1 - ((1 - rSquared) * (n - 1)) / (n - p) : null;

    return {
      state: "ok",
      factorsVersion: opts.factorsVersion || null,
      // Named a proxy in the payload itself so a consumer cannot quietly promote it to a real factor.
      basis: "declared-proxy-spreads",
      sampleSize: n,
      parameters: p,
      available: available,
      unavailable: unavailable,
      interceptAnnualized: beta[0] * ppy,
      exposures: exposures,
      rSquared: rSquared,
      adjustedRSquared: adjusted,
      residualRiskAnnualized: n > p ? Math.sqrt((ssResidual / (n - p)) * ppy) : null,
      fitState: rSquared === null ? "unavailable" : (rSquared < 0.3 ? "low-explanatory-power" : "explained")
    };
  }

  /**
   * Return contribution: each holding's share of the portfolio's realised return.
   *
   * This is a DIFFERENT quantity from risk contribution and is reported separately because the two
   * routinely disagree. A hedge can contribute negative risk and positive return; a large calm
   * position can dominate return while contributing little risk. Presenting one as though it
   * answered the other is the conflation FR-082 exists to prevent.
   *
   * Contributions are computed on the same aligned per-symbol returns, so they share the return
   * basis with everything else on the surface.
   */
  function returnContributions(symbols, weights, perSymbolReturns, options) {
    var opts = options || {};
    if (!Array.isArray(symbols) || !symbols.length) return { state: "no-symbols" };
    var totals = {}, total = 0, i, s;
    for (i = 0; i < symbols.length; i += 1) {
      s = symbols[i];
      var series = perSymbolReturns ? perSymbolReturns[s] : null;
      if (!Array.isArray(series) || !series.length) return { state: "returns-unavailable", symbol: s };
      if (!isNum(weights[s])) return { state: "weights-invalid", symbol: s };
      // Arithmetic sum of period returns: the additive basis that makes contributions sum to the
      // portfolio's own arithmetic total. A compounded split does not decompose additively.
      var sum = 0;
      for (var k = 0; k < series.length; k += 1) {
        if (!isNum(series[k])) return { state: "non-finite-input", symbol: s };
        sum += series[k];
      }
      totals[s] = weights[s] * sum;
      total += totals[s];
    }

    var tolerance = isNum(opts.reconciliationTolerance) ? opts.reconciliationTolerance : 1e-8;
    var contribution = symbols.map(function (symbol) { return totals[symbol]; });
    return {
      state: "ok",
      basis: "arithmetic-sum-of-period-returns",
      symbols: symbols.slice(),
      contribution: contribution,
      contributionSum: total,
      // Share is undefined when the portfolio went nowhere: dividing by ~0 would manufacture
      // enormous shares from a flat book.
      contributionShare: Math.abs(total) > tolerance
        ? contribution.map(function (c) { return c / total; })
        : null,
      shareState: Math.abs(total) > tolerance ? "available" : "portfolio-return-near-zero",
      negativeContributors: symbols.filter(function (_s, index) { return contribution[index] < 0; })
    };
  }

  /**
   * How each holding is treated by the market-based analytics on this surface, and what the
   * look-through lens can say.
   *
   * Two honesty problems live here. A `manual-alternative` holding has no market series, so it
   * cannot participate in return, covariance, or beta — and silently omitting it would leave a
   * reader believing the diagnostics describe their whole book. And look-through requires
   * constituent data for pooled vehicles, which this deployment holds no source for; reporting an
   * ETF's own ticker as its "underlying" would be a fabricated decomposition.
   *
   * Both are therefore reported as NAMED states rather than omissions.
   */
  function assetTreatment(holdings, lookThroughSource) {
    if (!Array.isArray(holdings) || !holdings.length) return { state: "no-holdings" };
    var marketBased = [], excluded = [], seen = {};
    for (var i = 0; i < holdings.length; i += 1) {
      var h = holdings[i];
      if (!h || typeof h.symbol !== "string" || seen[h.symbol]) continue;
      seen[h.symbol] = true;
      if (h.assetType === "listed") marketBased.push(h.symbol);
      else excluded.push({ symbol: h.symbol, assetType: h.assetType || "unknown" });
    }
    return {
      state: "ok",
      marketBased: marketBased.sort(),
      excludedFromMarketAnalytics: excluded.sort(function (a, b) { return a.symbol < b.symbol ? -1 : 1; }),
      // Absent by design in this deployment: no constituent source is configured, and inventing one
      // from a vehicle's own ticker would be a fabricated decomposition.
      lookThrough: {
        state: lookThroughSource ? "available" : "no-configured-source",
        source: lookThroughSource || null,
        covered: [],
        reason: lookThroughSource
          ? "Constituent data is available for the declared source."
          : "No constituent source is configured, so overlapping exposure inside pooled vehicles cannot be measured. It is not assumed absent."
      }
    };
  }

  /* ------------------------------------------------- Scope 09 dependent paths */

  /**
   * mulberry32 — a small, exactly-specified PRNG.
   *
   * `Math.random` is prohibited on this surface and an ambient clock is prohibited as a seed. A path
   * result that cannot be reproduced from its recorded identity is not evidence about a portfolio;
   * it is one sample nobody can check. Every draw here traces to the integer seed in the scenario.
   */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Stationary bootstrap (Politis-Romano) index sequence.
   *
   * Blocks have geometrically distributed lengths with mean `meanBlock` and wrap CYCLICALLY at the
   * end of the sample. The cyclic wrap is what keeps every observation equally likely to be drawn;
   * truncating instead would quietly under-sample the tail of the history, biasing every path toward
   * the early part of the record.
   *
   * Preserving blocks rather than drawing IID is the whole point: returns are dependent, and an IID
   * resample destroys the volatility clustering that drives drawdown risk.
   */
  function stationaryBootstrapIndices(sampleSize, drawCount, meanBlock, random) {
    if (!isNum(sampleSize) || sampleSize < 1) return null;
    if (!isNum(drawCount) || drawCount < 1) return null;
    if (!isNum(meanBlock) || meanBlock < 1) return null;
    var p = 1 / meanBlock;
    var indices = [], current = Math.floor(random() * sampleSize) % sampleSize;
    for (var i = 0; i < drawCount; i += 1) {
      indices.push(current);
      if (random() < p) current = Math.floor(random() * sampleSize) % sampleSize;
      else current = (current + 1) % sampleSize;
    }
    return indices;
  }

  /**
   * Deterministic stratified parameter grid over a declared drift range.
   *
   * Stratified rather than randomly drawn: with a modest draw count a random sample leaves visible
   * gaps and reorders between runs, so two identical scenarios could report different uncertainty
   * bands. `drawCount === 1` returns the centre, which is the honest degenerate case.
   */
  function parameterGrid(range, drawCount) {
    if (!range || !isNum(range.low) || !isNum(range.high)) return null;
    if (!isNum(drawCount) || drawCount < 1) return null;
    if (range.high < range.low) return null;
    if (drawCount === 1) return [(range.low + range.high) / 2];
    var grid = [];
    for (var i = 0; i < drawCount; i += 1) {
      grid.push(range.low + ((range.high - range.low) * i) / (drawCount - 1));
    }
    return grid;
  }

  var SCENARIO_KEYS = [
    "contractVersion", "returnFingerprint", "method", "seed", "meanBlockSessions",
    "horizonSessions", "pathCount", "parameterDrawCount", "driftRange", "startingValue"
  ];

  /**
   * ScenarioSpecification/v1 — every field that changes a result must be present and explicit.
   *
   * Exact-key validation, not a superset check: a field the caller thought mattered but the engine
   * ignores would make two different-looking scenarios produce one identity, which is the silent
   * collision the identity exists to prevent.
   */
  function validateScenarioSpecification(spec) {
    if (!spec || typeof spec !== "object" || Array.isArray(spec)) return { ok: false, reason: "spec-invalid" };
    var keys = Object.keys(spec).sort();
    if (keys.join("|") !== SCENARIO_KEYS.slice().sort().join("|")) return { ok: false, reason: "spec-keys-exact" };
    if (spec.contractVersion !== "ScenarioSpecification/v1") return { ok: false, reason: "contract-version" };
    if (typeof spec.returnFingerprint !== "string" || !spec.returnFingerprint) return { ok: false, reason: "return-fingerprint" };
    if (spec.method !== "stationary-bootstrap" && spec.method !== "iid") return { ok: false, reason: "method" };
    if (!Number.isInteger(spec.seed) || spec.seed < 0) return { ok: false, reason: "seed" };
    if (!isNum(spec.meanBlockSessions) || spec.meanBlockSessions < 1) return { ok: false, reason: "mean-block" };
    if (!Number.isInteger(spec.horizonSessions) || spec.horizonSessions < 1) return { ok: false, reason: "horizon" };
    if (!Number.isInteger(spec.pathCount) || spec.pathCount < 1) return { ok: false, reason: "path-count" };
    if (!Number.isInteger(spec.parameterDrawCount) || spec.parameterDrawCount < 1) return { ok: false, reason: "parameter-draws" };
    if (!spec.driftRange || !isNum(spec.driftRange.low) || !isNum(spec.driftRange.high)) return { ok: false, reason: "drift-range" };
    if (spec.driftRange.high < spec.driftRange.low) return { ok: false, reason: "drift-range" };
    if (!isNum(spec.startingValue) || spec.startingValue <= 0) return { ok: false, reason: "starting-value" };
    return { ok: true };
  }

  /** Stable identity over every field that changes the result. */
  function scenarioIdentity(spec) {
    var check = validateScenarioSpecification(spec);
    if (!check.ok) return null;
    return SCENARIO_KEYS.map(function (key) {
      var value = spec[key];
      if (key === "driftRange") return "driftRange=" + value.low + ":" + value.high;
      return key + "=" + value;
    }).join("|");
  }

  function percentile(sorted, q) {
    if (!sorted.length) return null;
    var pos = (sorted.length - 1) * q;
    var lo = Math.floor(pos), hi = Math.ceil(pos);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  /**
   * Run a dependent-path scenario.
   *
   * Path randomness and parameter uncertainty are reported SEPARATELY and then combined, never
   * collapsed into one band. They answer different questions: "how much does this portfolio bounce
   * around under one assumption" is not "how much does the answer move when the assumption is
   * wrong", and a single blended band lets a reader mistake assumption risk for market risk.
   *
   * Common random numbers: every parameter node reuses the SAME bootstrap index streams, so a
   * difference between nodes is attributable to the parameter rather than to resampling noise.
   */
  function runScenario(spec, sampleReturns, options) {
    var check = validateScenarioSpecification(spec);
    if (!check.ok) return { state: "spec-invalid", reason: check.reason };
    if (!Array.isArray(sampleReturns) || sampleReturns.length < 2) return { state: "insufficient-sample" };
    if (!sampleReturns.every(isNum)) return { state: "non-finite-input" };
    var opts = options || {};
    var budget = isNum(opts.maximumPaths) ? opts.maximumPaths : 20000;
    if (spec.pathCount * spec.parameterDrawCount > budget) {
      return { state: "budget-exceeded", requested: spec.pathCount * spec.parameterDrawCount, budget: budget };
    }

    var identity = scenarioIdentity(spec);
    var grid = parameterGrid(spec.driftRange, spec.parameterDrawCount);
    var centralDrift = (spec.driftRange.low + spec.driftRange.high) / 2;

    // Base index streams drawn ONCE and reused at every parameter node (common random numbers).
    var random = mulberry32(spec.seed);
    var streams = [];
    for (var p = 0; p < spec.pathCount; p += 1) {
      streams.push(spec.method === "iid"
        ? iidIndices(sampleReturns.length, spec.horizonSessions, random)
        : stationaryBootstrapIndices(sampleReturns.length, spec.horizonSessions, spec.meanBlockSessions, random));
    }

    var terminalsAt = function (drift) {
      var out = [];
      for (var s = 0; s < streams.length; s += 1) {
        var value = spec.startingValue;
        for (var t = 0; t < streams[s].length; t += 1) {
          value = value * (1 + sampleReturns[streams[s][t]] + drift);
        }
        out.push(value);
      }
      return out;
    };

    var central = terminalsAt(centralDrift).slice().sort(function (a, b) { return a - b; });
    var nodeMedians = [], nodeFailureRates = [], combined = [];
    var floor = isNum(opts.survivalFloor) ? opts.survivalFloor : null;
    for (var g = 0; g < grid.length; g += 1) {
      var node = terminalsAt(grid[g]);
      combined = combined.concat(node);
      var sortedNode = node.slice().sort(function (a, b) { return a - b; });
      nodeMedians.push(percentile(sortedNode, 0.5));
      if (floor !== null) {
        nodeFailureRates.push(node.filter(function (v) { return v < floor; }).length / node.length);
      }
    }
    combined.sort(function (a, b) { return a - b; });
    var sortedMedians = nodeMedians.slice().sort(function (a, b) { return a - b; });

    return {
      state: "ok",
      identity: identity,
      method: spec.method,
      // An IID run is a declared SIMPLIFICATION, not an equivalent alternative: it discards the
      // dependence that produces clustered drawdowns.
      methodNote: spec.method === "iid"
        ? "IID resampling is an independence simplification: it discards the serial dependence that produces clustered drawdowns."
        : "Stationary bootstrap with geometric blocks and cyclic wrap, preserving short-run dependence.",
      meanBlockSessions: spec.meanBlockSessions,
      horizonSessions: spec.horizonSessions,
      pathCount: spec.pathCount,
      parameterDrawCount: spec.parameterDrawCount,
      commonRandomStreams: true,
      pathRandomness: {
        label: "Path randomness at the central assumption",
        drift: centralDrift,
        p05: percentile(central, 0.05),
        p50: percentile(central, 0.5),
        p95: percentile(central, 0.95)
      },
      parameterUncertainty: {
        label: "Across-parameter dispersion of the median outcome",
        gridLow: grid[0],
        gridHigh: grid[grid.length - 1],
        medianLow: sortedMedians[0],
        medianHigh: sortedMedians[sortedMedians.length - 1],
        failureRateLow: nodeFailureRates.length ? Math.min.apply(null, nodeFailureRates) : null,
        failureRateHigh: nodeFailureRates.length ? Math.max.apply(null, nodeFailureRates) : null
      },
      combined: {
        label: "Combined path and parameter distribution",
        p05: percentile(combined, 0.05),
        p50: percentile(combined, 0.5),
        p95: percentile(combined, 0.95)
      },
      // The single most influential assumption, stated rather than left for the reader to infer.
      influence: {
        assumption: "drift",
        rangeLow: grid[0],
        rangeHigh: grid[grid.length - 1],
        medianSpread: sortedMedians[sortedMedians.length - 1] - sortedMedians[0]
      },
      representativePathIsExample: true,
      noExpectedPathClaim: "No path here is the expected future. The fan is a distribution of resampled histories, not a forecast."
    };
  }

  function iidIndices(sampleSize, drawCount, random) {
    var out = [];
    for (var i = 0; i < drawCount; i += 1) out.push(Math.floor(random() * sampleSize) % sampleSize);
    return out;
  }

  /** Gaussian elimination with partial pivoting. Returns null when the system is not solvable. */
  function solveSymmetric(A, b) {
    var n = b.length, i, j, k;
    var M = A.map(function (row, index) { return row.slice().concat([b[index]]); });
    var scale = 0;
    for (i = 0; i < n; i += 1) { if (Math.abs(A[i][i]) > scale) scale = Math.abs(A[i][i]); }
    var epsilon = scale * 1e-12;
    for (i = 0; i < n; i += 1) {
      var pivot = i;
      for (k = i + 1; k < n; k += 1) { if (Math.abs(M[k][i]) > Math.abs(M[pivot][i])) pivot = k; }
      if (Math.abs(M[pivot][i]) <= epsilon) return null;
      var tmp = M[i]; M[i] = M[pivot]; M[pivot] = tmp;
      for (k = i + 1; k < n; k += 1) {
        var factor = M[k][i] / M[i][i];
        for (j = i; j <= n; j += 1) M[k][j] -= factor * M[i][j];
      }
    }
    var x = new Array(n).fill(0);
    for (i = n - 1; i >= 0; i -= 1) {
      var sum = M[i][n];
      for (j = i + 1; j < n; j += 1) sum -= M[i][j] * x[j];
      x[i] = sum / M[i][i];
    }
    return x;
  }

  return {
    TRADING_DAYS: TRADING_DAYS,
    alignPortfolioReturns: alignPortfolioReturns,
    computeReturnMetrics: computeReturnMetrics,
    computeDrawdown: computeDrawdown,
    deriveWeights: deriveWeights,
    riskXRayProjection: riskXRayProjection,
    computeConcentration: computeConcentration,
    fitCapm: fitCapm,
    fitFactors: fitFactors,
    computeCovariance: computeCovariance,
    riskContributions: riskContributions,
    returnContributions: returnContributions,
    assetTreatment: assetTreatment,
    mulberry32: mulberry32,
    stationaryBootstrapIndices: stationaryBootstrapIndices,
    parameterGrid: parameterGrid,
    validateScenarioSpecification: validateScenarioSpecification,
    scenarioIdentity: scenarioIdentity,
    runScenario: runScenario,
    analyticsIdentity: analyticsIdentity
  };
});
