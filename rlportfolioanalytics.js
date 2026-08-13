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
      // The exact portfolio return sample every later stage must resample, so a path scenario can
      // never be built on a basis the rest of the surface did not use.
      alignedReturns: aligned.returns,
      // The per-symbol legs of that SAME alignment. Dependence must be measured
      // on the same observation set the rest of the surface used, never on
      // independently re-read bars that were never observed together.
      perSymbolReturns: aligned.perSymbolReturns,
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

    /* Per-session percentile bands at the central assumption, for the fan. Computed from the SAME
       streams as the terminals, so the chart and the terminal numbers cannot describe different
       runs. The band is a distribution of resampled histories at each step, never a forecast path. */
    var fan = [];
    for (var t0 = 0; t0 <= spec.horizonSessions; t0 += 1) fan.push([]);
    for (var s0 = 0; s0 < streams.length; s0 += 1) {
      var v = spec.startingValue;
      fan[0].push(v);
      for (var t1 = 0; t1 < streams[s0].length; t1 += 1) {
        v = v * (1 + sampleReturns[streams[s0][t1]] + centralDrift);
        fan[t1 + 1].push(v);
      }
    }
    var fanBands = fan.map(function (values, session) {
      var sorted = values.slice().sort(function (a, b) { return a - b; });
      return {
        session: session,
        p05: percentile(sorted, 0.05),
        p50: percentile(sorted, 0.5),
        p95: percentile(sorted, 0.95)
      };
    });

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
      startingValue: spec.startingValue,
      pathCount: spec.pathCount,
      parameterDrawCount: spec.parameterDrawCount,
      commonRandomStreams: true,
      fanBands: fanBands,
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

  /* ---------------------------------------------------------------------
     Scope 10 - dated cash needs and survival states
     --------------------------------------------------------------------- */

  var CASH_FLOW_KEYS = ["amount", "currency", "date", "kind", "label", "timing"];

  /**
   * A cash flow is only usable if the user stated every part of it. There is no
   * inferred currency, no inferred timing, no inferred sign. A need whose
   * currency is unknown cannot be compared to capital, and guessing one would
   * silently convert money.
   */
  function validateCashFlow(flow) {
    if (!flow || typeof flow !== "object" || Array.isArray(flow)) return { ok: false, reason: "flow-invalid" };
    var keys = Object.keys(flow).sort();
    if (keys.join("|") !== CASH_FLOW_KEYS.slice().sort().join("|")) return { ok: false, reason: "flow-keys-exact" };
    if (flow.kind !== "contribution" && flow.kind !== "withdrawal") return { ok: false, reason: "kind" };
    if (flow.timing !== "start-of-step" && flow.timing !== "end-of-step") return { ok: false, reason: "timing" };
    if (!isNum(flow.amount) || flow.amount <= 0) return { ok: false, reason: "amount" };
    if (typeof flow.currency !== "string" || !flow.currency) return { ok: false, reason: "currency" };
    if (typeof flow.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(flow.date)) return { ok: false, reason: "date" };
    if (typeof flow.label !== "string" || !flow.label) return { ok: false, reason: "label" };
    return { ok: true };
  }

  /**
   * Resolve each flow to the FIRST modeled session on or after its stated date.
   *
   * The date is never moved earlier to make it land on a session, and never
   * moved later to dodge a drawdown. If a flow's date falls beyond the modeled
   * horizon it is reported as out-of-horizon rather than clamped to the last
   * session, because clamping would silently reprice the need.
   */
  function scheduleCashFlows(flows, sessionDates) {
    if (!Array.isArray(flows)) return { state: "flows-invalid" };
    if (!Array.isArray(sessionDates) || sessionDates.length === 0) return { state: "no-session-dates" };
    var scheduled = [];
    var rejected = [];
    for (var i = 0; i < flows.length; i += 1) {
      var check = validateCashFlow(flows[i]);
      if (!check.ok) { rejected.push({ index: i, reason: check.reason }); continue; }
      var flow = flows[i];
      var session = -1;
      for (var s = 0; s < sessionDates.length; s += 1) {
        if (sessionDates[s] >= flow.date) { session = s; break; }
      }
      if (session === -1) {
        rejected.push({ index: i, reason: "out-of-horizon", declaredDate: flow.date });
        continue;
      }
      scheduled.push({
        index: i,
        kind: flow.kind,
        timing: flow.timing,
        amount: flow.amount,
        currency: flow.currency,
        label: flow.label,
        declaredDate: flow.date,
        modeledDate: sessionDates[session],
        session: session
      });
    }
    /* Chronological, then start-of-step before end-of-step within a session,
       then declaration order. Stable and total, so two runs of the same input
       can never disagree about which need was funded first. */
    scheduled.sort(function (a, b) {
      if (a.session !== b.session) return a.session - b.session;
      if (a.timing !== b.timing) return a.timing === "start-of-step" ? -1 : 1;
      return a.index - b.index;
    });
    return { state: "ok", scheduled: scheduled, rejected: rejected };
  }

  /**
   * Walk one path, applying scheduled flows at their declared step.
   *
   * A withdrawal larger than available capital is recorded as a PARTIAL fill
   * with its funded fraction; it is never reduced quietly and never skipped.
   * The shortfall is what the user needs to see.
   */
  function applyCashFlows(pathValues, scheduled, currency) {
    if (!Array.isArray(pathValues) || pathValues.length === 0) return { state: "path-invalid" };
    if (typeof currency !== "string" || !currency) return { state: "currency-required" };
    var bySession = {};
    for (var i = 0; i < scheduled.length; i += 1) {
      if (scheduled[i].currency !== currency) {
        return { state: "currency-mismatch", index: scheduled[i].index, expected: currency, found: scheduled[i].currency };
      }
      var key = String(scheduled[i].session);
      if (!bySession[key]) bySession[key] = [];
      bySession[key].push(scheduled[i]);
    }

    var events = [];
    var capital = pathValues[0];
    var values = [];
    var collisions = 0;
    var shortfalls = 0;

    var applyAt = function (list, timing, session, modeledDate) {
      for (var k = 0; k < list.length; k += 1) {
        var flow = list[k];
        if (flow.timing !== timing) continue;
        var before = capital;
        var applied, fundedFraction;
        if (flow.kind === "contribution") {
          applied = flow.amount;
          capital = before + applied;
          fundedFraction = 1;
        } else {
          applied = Math.min(flow.amount, Math.max(before, 0));
          capital = before - applied;
          fundedFraction = applied / flow.amount;
          if (fundedFraction < 1) shortfalls += 1;
        }
        var inDrawdown = before < pathValues[0];
        if (flow.kind === "withdrawal" && inDrawdown) collisions += 1;
        events.push({
          index: flow.index,
          label: flow.label,
          kind: flow.kind,
          timing: timing,
          session: session,
          declaredDate: flow.declaredDate,
          modeledDate: modeledDate,
          requestedAmount: flow.amount,
          appliedAmount: applied,
          capitalBefore: before,
          capitalAfter: capital,
          fundedFraction: fundedFraction,
          duringDrawdown: inDrawdown
        });
      }
    };

    for (var t = 0; t < pathValues.length; t += 1) {
      var here = bySession[String(t)] || [];
      var modeledDate = here.length ? here[0].modeledDate : null;
      applyAt(here, "start-of-step", t, modeledDate);
      if (t > 0) {
        var growth = pathValues[t - 1] === 0 ? 0 : pathValues[t] / pathValues[t - 1] - 1;
        capital = capital * (1 + growth);
      }
      applyAt(here, "end-of-step", t, modeledDate);
      values.push(capital);
    }

    return {
      state: "ok",
      values: values,
      events: events,
      collisionCount: collisions,
      shortfallCount: shortfalls,
      terminalCapital: values[values.length - 1]
    };
  }

  var SURVIVAL_KEYS = ["currency", "floorValue", "horizonSessions", "startingValue"];

  /**
   * Survival is only reported when the user supplied a COMPLETE success
   * definition. There is no default floor, no default withdrawal rate, no
   * default horizon. A missing definition returns `unavailable` with the exact
   * field that is missing, because a fabricated 4% rule would look like an
   * answer while being nobody's actual plan.
   */
  function computeSurvival(definition, pathSeries) {
    if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
      return { state: "unavailable", reason: "no-definition", missing: SURVIVAL_KEYS.slice() };
    }
    var missing = [];
    if (!isNum(definition.floorValue)) missing.push("floorValue");
    if (!Number.isInteger(definition.horizonSessions) || definition.horizonSessions < 1) missing.push("horizonSessions");
    if (typeof definition.currency !== "string" || !definition.currency) missing.push("currency");
    if (!isNum(definition.startingValue) || definition.startingValue <= 0) missing.push("startingValue");
    if (missing.length) return { state: "unavailable", reason: "incomplete-definition", missing: missing };
    if (!Array.isArray(pathSeries) || pathSeries.length === 0) {
      return { state: "unavailable", reason: "no-paths", missing: [] };
    }

    var survived = 0;
    var breachSessions = [];
    for (var i = 0; i < pathSeries.length; i += 1) {
      var series = pathSeries[i];
      if (!Array.isArray(series) || !series.every(isNum)) return { state: "unavailable", reason: "non-finite-path", missing: [] };
      var breachAt = -1;
      for (var t = 0; t < series.length; t += 1) {
        if (series[t] < definition.floorValue) { breachAt = t; break; }
      }
      if (breachAt === -1) survived += 1; else breachSessions.push(breachAt);
    }

    return {
      state: "ok",
      pathCount: pathSeries.length,
      survivingPaths: survived,
      survivalProbability: survived / pathSeries.length,
      floorValue: definition.floorValue,
      horizonSessions: definition.horizonSessions,
      currency: definition.currency,
      firstBreachMedianSession: breachSessions.length
        ? breachSessions.slice().sort(function (a, b) { return a - b; })[Math.floor(breachSessions.length / 2)]
        : null,
      failureDefinition: "A path fails when its capital falls below the stated floor of " +
        definition.floorValue + " " + definition.currency + " at any modeled session."
    };
  }

  /* ---------------------------------------------------------------------
     Scope 11 - stress, tail, and alternative dependence
     --------------------------------------------------------------------- */

  function pearson(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length < 2) return null;
    if (!a.every(isNum) || !b.every(isNum)) return null;
    var ma = mean(a), mb = mean(b);
    var num = 0, da = 0, db = 0;
    for (var i = 0; i < a.length; i += 1) {
      var xa = a[i] - ma, xb = b[i] - mb;
      num += xa * xb; da += xa * xa; db += xb * xb;
    }
    if (da === 0 || db === 0) return null;
    return num / Math.sqrt(da * db);
  }

  function sampleVariance(values) {
    if (!Array.isArray(values) || values.length < 2 || !values.every(isNum)) return null;
    var m = mean(values), acc = 0;
    for (var i = 0; i < values.length; i += 1) acc += (values[i] - m) * (values[i] - m);
    return acc / (values.length - 1);
  }

  /**
   * Raw dependence on two EXPLICITLY named samples.
   *
   * The samples are supplied by the caller, never discovered by searching for
   * whichever window maximises the correlation change. A searched window would
   * find a "crisis" in any series given enough tries, so the sample names and
   * counts travel with the estimate.
   */
  function compareStressDependence(request) {
    if (!request || typeof request !== "object") return { state: "request-invalid" };
    var tranquil = request.tranquil, stress = request.stress;
    if (!tranquil || !stress || typeof tranquil.name !== "string" || typeof stress.name !== "string") {
      return { state: "sample-names-required" };
    }
    var pairs = [];
    var need = ["a", "b"];
    for (var s = 0; s < 2; s += 1) {
      var block = s === 0 ? tranquil : stress;
      for (var k = 0; k < need.length; k += 1) {
        if (!Array.isArray(block[need[k]]) || block[need[k]].length < 2) {
          return { state: "insufficient-sample", sample: block.name, series: need[k] };
        }
      }
    }
    var rawTranquil = pearson(tranquil.a, tranquil.b);
    var rawStress = pearson(stress.a, stress.b);
    if (rawTranquil === null || rawStress === null) return { state: "degenerate-series" };

    var varTranquil = sampleVariance(tranquil.a);
    var varStress = sampleVariance(stress.a);
    pairs.push({ name: tranquil.name, correlation: rawTranquil, varianceA: varTranquil, count: tranquil.a.length });
    pairs.push({ name: stress.name, correlation: rawStress, varianceA: varStress, count: stress.a.length });

    return {
      state: "ok",
      samples: pairs,
      rawCorrelationChange: rawStress - rawTranquil,
      varianceRatio: varTranquil === 0 ? null : varStress / varTranquil,
      /* Deliberately NOT a verdict. A raw rise in correlation during a
         high-variance window is exactly what heteroskedasticity produces on its
         own, so calling it contagion here would be the bias this scope exists
         to avoid. */
      contagionLabel: null,
      interpretation: "A raw correlation change measured on two named samples. It is not, by " +
        "itself, evidence of contagion: correlation estimated on a higher-variance window rises " +
        "mechanically even when the underlying relationship is unchanged."
    };
  }

  /**
   * Forbes-Rigobon heteroskedasticity adjustment.
   *
   * Corrects the raw stress correlation for the variance increase in the anchor
   * series. The anchor ORIENTATION is part of the result, because adjusting on
   * the wrong series answers a different question and the reader cannot tell
   * from the number alone.
   */
  function forbesRigobonAdjustment(input) {
    if (!input || typeof input !== "object") return { state: "unavailable", reason: "input-invalid" };
    if (!isNum(input.rawStressCorrelation)) return { state: "unavailable", reason: "raw-correlation-required" };
    if (Math.abs(input.rawStressCorrelation) > 1) return { state: "unavailable", reason: "correlation-out-of-range" };
    if (!isNum(input.tranquilVariance) || input.tranquilVariance <= 0) {
      return { state: "unavailable", reason: "tranquil-variance-required" };
    }
    if (!isNum(input.stressVariance) || input.stressVariance <= 0) {
      return { state: "unavailable", reason: "stress-variance-required" };
    }
    if (typeof input.anchorSeries !== "string" || !input.anchorSeries) {
      return { state: "unavailable", reason: "anchor-series-required" };
    }
    var delta = input.stressVariance / input.tranquilVariance - 1;
    if (delta <= 0) {
      return {
        state: "unavailable",
        reason: "no-variance-increase",
        note: "The adjustment is defined for a stress window whose anchor variance EXCEEDS the " +
          "tranquil window. Here it does not, so there is no heteroskedasticity to correct and a " +
          "number would be manufactured rather than measured."
      };
    }
    var rho = input.rawStressCorrelation;
    var denominator = 1 + delta * (1 - rho * rho);
    if (denominator <= 0) return { state: "unavailable", reason: "denominator-non-positive" };
    var adjusted = rho / Math.sqrt(denominator);
    return {
      state: "ok",
      anchorSeries: input.anchorSeries,
      rawStressCorrelation: rho,
      adjustedCorrelation: adjusted,
      varianceIncrease: delta,
      assumptions: [
        "No omitted common factor beyond the anchor series",
        "No feedback from the dependent series back to the anchor within the window",
        "The anchor variance increase is the only source of the correlation shift"
      ],
      claimBoundary: "This adjustment removes the mechanical part of a correlation rise. A residual " +
        "rise is consistent with contagion but does not prove it, and a vanished rise does not " +
        "disprove it. The anchor is " + input.anchorSeries + "; adjusting on the other series answers " +
        "a different question."
    };
  }

  /**
   * Empirical lower-tail dependence at a configured quantile.
   *
   * Reports the joint-exceedance COUNT alongside the estimate, and refuses when
   * the count falls below the configured event floor. A tail estimate built on
   * three joint observations is noise wearing a decimal point.
   */
  function lowerTailDependence(a, b, options) {
    var opts = options || {};
    if (!isNum(opts.quantile) || opts.quantile <= 0 || opts.quantile >= 0.5) {
      return { state: "unavailable", reason: "quantile-required" };
    }
    if (!Number.isInteger(opts.minimumJointEvents) || opts.minimumJointEvents < 1) {
      return { state: "unavailable", reason: "event-floor-required" };
    }
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length < 2) {
      return { state: "unavailable", reason: "insufficient-sample" };
    }
    if (!a.every(isNum) || !b.every(isNum)) return { state: "unavailable", reason: "non-finite-input" };

    var sortedA = a.slice().sort(function (x, y) { return x - y; });
    var sortedB = b.slice().sort(function (x, y) { return x - y; });
    var cut = function (sorted) {
      var pos = opts.quantile * (sorted.length - 1);
      var lo = Math.floor(pos), hi = Math.ceil(pos);
      return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
    };
    var thresholdA = cut(sortedA), thresholdB = cut(sortedB);

    var belowA = 0, joint = 0;
    for (var i = 0; i < a.length; i += 1) {
      var lowA = a[i] <= thresholdA;
      if (lowA) belowA += 1;
      if (lowA && b[i] <= thresholdB) joint += 1;
    }
    if (joint < opts.minimumJointEvents) {
      return {
        state: "unavailable",
        reason: "thin-tail-sample",
        jointEvents: joint,
        minimumJointEvents: opts.minimumJointEvents,
        note: "Only " + joint + " joint lower-tail observations were seen, below the configured " +
          "floor of " + opts.minimumJointEvents + ". A number here would be noise with a decimal point."
      };
    }
    return {
      state: "ok",
      quantile: opts.quantile,
      thresholdA: thresholdA,
      thresholdB: thresholdB,
      jointEvents: joint,
      marginalEvents: belowA,
      sampleSize: a.length,
      estimate: belowA === 0 ? null : joint / belowA,
      claimBoundary: "An empirical conditional frequency over " + joint + " joint observations. " +
        "It does NOT say that all assets become perfectly correlated in a crisis; it says how often " +
        "these two were jointly in their lower tails in this finite sample."
    };
  }

  /**
   * Quality qualification for a manually or infrequently valued asset.
   *
   * Appraisal series look smooth because they are appraised, not because the
   * asset is stable. Reporting their correlation without this qualification
   * would let a stale valuation masquerade as diversification.
   */
  function alternativeAssetQuality(asset) {
    if (!asset || typeof asset !== "object") return { state: "unavailable", reason: "asset-invalid" };
    var missing = [];
    if (typeof asset.valuationFrequency !== "string" || !asset.valuationFrequency) missing.push("valuationFrequency");
    if (typeof asset.lastValuationDate !== "string" || !asset.lastValuationDate) missing.push("lastValuationDate");
    if (typeof asset.valuationMethod !== "string" || !asset.valuationMethod) missing.push("valuationMethod");
    if (typeof asset.liquidity !== "string" || !asset.liquidity) missing.push("liquidity");
    if (!isNum(asset.expectedTransactionCostFraction)) missing.push("expectedTransactionCostFraction");
    if (missing.length) {
      return {
        state: "unavailable",
        reason: "incomplete-quality-evidence",
        missing: missing,
        note: "A diversification conclusion for this asset is withheld until its valuation and " +
          "liquidity evidence is stated. Missing evidence is not an argument for orthogonality."
      };
    }
    var smoothed = asset.valuationMethod === "appraisal" || asset.valuationMethod === "user-entered";
    return {
      state: "ok",
      valuationFrequency: asset.valuationFrequency,
      lastValuationDate: asset.lastValuationDate,
      valuationMethod: asset.valuationMethod,
      liquidity: asset.liquidity,
      expectedTransactionCostFraction: asset.expectedTransactionCostFraction,
      smoothingSuspected: smoothed,
      requiresSensitivity: smoothed,
      caveat: smoothed
        ? "This series is " + asset.valuationMethod + "-valued at " + asset.valuationFrequency +
          " frequency. Its observed volatility and correlation are understated by appraisal " +
          "smoothing, so it must NOT be treated as mechanically uncorrelated. A de-smoothed " +
          "sensitivity is required before any diversification conclusion."
        : "Market-observed valuations at " + asset.valuationFrequency + " frequency."
    };
  }

  /**
   * De-smoothing sensitivity: r_true(t) = (r_obs(t) - rho * r_obs(t-1)) / (1 - rho).
   *
   * A SENSITIVITY, not a replacement. The observed series is never overwritten
   * and never interpolated to daily; this returns an alternative reading under
   * an explicitly stated rho so the conclusion can be tested against it.
   */
  function desmoothReturns(observed, rho) {
    if (!Array.isArray(observed) || observed.length < 2 || !observed.every(isNum)) {
      return { state: "unavailable", reason: "insufficient-sample" };
    }
    if (!isNum(rho) || rho <= 0 || rho >= 1) return { state: "unavailable", reason: "rho-required" };
    var out = [];
    for (var i = 1; i < observed.length; i += 1) {
      out.push((observed[i] - rho * observed[i - 1]) / (1 - rho));
    }
    return {
      state: "ok",
      rho: rho,
      observed: observed.slice(),
      desmoothed: out,
      observedVariance: sampleVariance(observed),
      desmoothedVariance: sampleVariance(out),
      claimBoundary: "A sensitivity under an explicitly chosen rho of " + rho + ". The observed " +
        "series is unchanged and is still the record of what was actually valued."
    };
  }

  /* ---------------------------------------------------------------------
     Scope 12 - hedge variant research
     --------------------------------------------------------------------- */

  var HEDGE_KEYS = [
    "annualCarryFraction", "basisCorrelation", "commissionFraction", "hedgeRatio",
    "horizonYears", "instrumentClass", "liquidity", "proxySymbol", "rebalancesPerYear",
    "slippageFraction", "spreadFraction", "targetExposureValue", "targetVolatility"
  ];

  /**
   * Research comparison of an explicit hedge ratio. Never a recommendation.
   *
   * Every component is returned SEPARATELY - gross risk change, carry, direct
   * cost, turnover cost, residual exposure, basis risk - because a single "net
   * benefit" number lets a large carry cost hide behind a large risk reduction
   * and vice versa. Net is only computed when every cost component is present;
   * a missing cost is never treated as zero, because zero is a claim.
   */
  function computeHedgeVariant(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return { state: "unavailable", reason: "input-invalid", missing: HEDGE_KEYS.slice() };
    }
    var missing = [];
    var numeric = [
      "targetExposureValue", "targetVolatility", "hedgeRatio", "horizonYears",
      "annualCarryFraction", "commissionFraction", "spreadFraction", "slippageFraction",
      "rebalancesPerYear", "basisCorrelation"
    ];
    for (var i = 0; i < numeric.length; i += 1) {
      if (!isNum(input[numeric[i]])) missing.push(numeric[i]);
    }
    if (typeof input.proxySymbol !== "string" || !input.proxySymbol) missing.push("proxySymbol");
    if (typeof input.instrumentClass !== "string" || !input.instrumentClass) missing.push("instrumentClass");
    if (typeof input.liquidity !== "string" || !input.liquidity) missing.push("liquidity");
    if (missing.length) {
      return {
        state: "gross-only",
        reason: "incomplete-cost-evidence",
        missing: missing,
        netBenefit: null,
        note: "Net benefit is unavailable because " + missing.join(", ") + " " +
          (missing.length === 1 ? "is" : "are") + " not stated. A missing cost is NOT treated as " +
          "zero: zero is a claim about the world, and this comparison has no evidence for it."
      };
    }
    if (input.hedgeRatio < 0 || input.hedgeRatio > 1) {
      return { state: "unavailable", reason: "hedge-ratio-out-of-range", missing: [] };
    }
    if (input.targetVolatility < 0 || input.targetExposureValue <= 0) {
      return { state: "unavailable", reason: "exposure-invalid", missing: [] };
    }
    if (Math.abs(input.basisCorrelation) > 1) {
      return { state: "unavailable", reason: "basis-correlation-out-of-range", missing: [] };
    }

    var ratio = input.hedgeRatio;
    var hedgedNotional = input.targetExposureValue * ratio;

    /* Residual volatility of a partially hedged exposure whose proxy is
       imperfectly correlated. With rho = 1 this collapses to (1 - ratio); with
       rho < 1 a full hedge still leaves basis risk, which is the entire reason
       basis risk is reported rather than assumed away. */
    var rho = input.basisCorrelation;
    var residualVarianceFraction = 1 - 2 * ratio * rho + ratio * ratio;
    if (residualVarianceFraction < 0) residualVarianceFraction = 0;
    var residualVolatility = input.targetVolatility * Math.sqrt(residualVarianceFraction);
    var grossVolatilityReduction = input.targetVolatility - residualVolatility;

    var carryCost = hedgedNotional * input.annualCarryFraction * input.horizonYears;
    var roundTripFraction = input.commissionFraction + input.spreadFraction + input.slippageFraction;
    var directCost = hedgedNotional * roundTripFraction;
    var rebalanceCount = input.rebalancesPerYear * input.horizonYears;
    var turnoverCost = hedgedNotional * roundTripFraction * rebalanceCount;
    var totalCost = carryCost + directCost + turnoverCost;

    return {
      state: "ok",
      hedgeRatio: ratio,
      proxySymbol: input.proxySymbol,
      instrumentClass: input.instrumentClass,
      liquidity: input.liquidity,
      hedgedNotional: hedgedNotional,
      grossVolatilityReduction: grossVolatilityReduction,
      residualVolatility: residualVolatility,
      residualExposureValue: input.targetExposureValue * (1 - ratio),
      basisCorrelation: rho,
      basisRiskRemains: rho < 1,
      carryCost: carryCost,
      directCost: directCost,
      turnoverCost: turnoverCost,
      rebalanceCount: rebalanceCount,
      totalCost: totalCost,
      /* Deliberately a cost per unit of volatility removed, NOT a verdict. It
         lets a reader weigh the trade themselves instead of being told the
         answer. */
      costPerVolatilityPoint: grossVolatilityReduction === 0
        ? null
        : totalCost / grossVolatilityReduction,
      prescribedRatio: null,
      executable: false,
      claimBoundary: "A research comparison of the ratio YOU entered. No ratio is prescribed as " +
        "optimal or suitable, no contract is selected, nothing is executed, and your portfolio is " +
        "not modified. Costs and risk reduction are reported separately so neither can hide behind " +
        "the other."
    };
  }

  /**
   * Compare explicit hedge ratios on ONE frozen basis.
   *
   * Every variant is evaluated against the same input, so a difference between
   * rows is attributable to the ratio rather than to a changed assumption.
   */
  function compareHedgeVariants(baseInput, ratios) {
    if (!Array.isArray(ratios) || !ratios.length) return { state: "unavailable", reason: "ratios-required" };
    if (!ratios.every(isNum)) return { state: "unavailable", reason: "ratios-non-finite" };
    var variants = ratios.map(function (ratio) {
      var merged = {};
      Object.keys(baseInput || {}).forEach(function (key) { merged[key] = baseInput[key]; });
      merged.hedgeRatio = ratio;
      var out = computeHedgeVariant(merged);
      out.label = ratio === 0 ? "Unhedged" : (ratio === 1 ? "Fully hedged" : "Partial hedge " + (ratio * 100).toFixed(0) + "%");
      return out;
    });
    return {
      state: "ok",
      variants: variants,
      basisFrozen: true,
      prescribedRatio: null,
      claimBoundary: "All rows share one frozen basis, so a difference between them is attributable " +
        "to the ratio and not to a changed assumption. None of them is recommended."
    };
  }

  /* ---------------------------------------------------------------------
     Scope 13 - six-method allocation basis and feasibility
     --------------------------------------------------------------------- */

  var ALLOCATION_METHODS = [
    "current", "equal-weight", "minimum-variance",
    "risk-parity", "black-litterman", "constrained-mvo"
  ];

  /**
   * Check an explicit constraint set against a candidate weight vector.
   *
   * Returns the SMALLEST identifiable conflicting set when the constraints
   * cannot all hold. A constraint is never silently relaxed to produce a
   * feasible-looking answer, because the whole value of a mandate is that it
   * binds.
   */
  function evaluateFeasibility(symbols, weights, constraints) {
    if (!Array.isArray(symbols) || !Array.isArray(weights) || symbols.length !== weights.length) {
      return { state: "unavailable", reason: "shape-mismatch" };
    }
    var list = Array.isArray(constraints) ? constraints : [];
    var violated = [];
    for (var i = 0; i < list.length; i += 1) {
      var c = list[i];
      var index = symbols.indexOf(c.subject);
      if (index === -1) continue;
      var weight = weights[index];
      if (isNum(c.minimum) && weight < c.minimum - 1e-12) {
        violated.push({ subject: c.subject, kind: "minimum", required: c.minimum, actual: weight });
      }
      if (isNum(c.maximum) && weight > c.maximum + 1e-12) {
        violated.push({ subject: c.subject, kind: "maximum", required: c.maximum, actual: weight });
      }
    }

    /* Universe-level impossibility: if the stated minimums already exceed one,
       or the maximums cannot reach one, NO weight vector can satisfy them. That
       is a stronger and more useful finding than "this candidate missed". */
    var minimumSum = 0, maximumSum = 0, hasMaximumForAll = true;
    for (var k = 0; k < symbols.length; k += 1) {
      var applicable = list.filter(function (c) { return c.subject === symbols[k]; });
      var mins = applicable.filter(function (c) { return isNum(c.minimum); });
      var maxes = applicable.filter(function (c) { return isNum(c.maximum); });
      minimumSum += mins.length ? Math.max.apply(null, mins.map(function (c) { return c.minimum; })) : 0;
      if (maxes.length) maximumSum += Math.min.apply(null, maxes.map(function (c) { return c.maximum; }));
      else hasMaximumForAll = false;
    }
    if (minimumSum > 1 + 1e-12) {
      return {
        state: "infeasible",
        universallyInfeasible: true,
        reason: "minimums-exceed-full-allocation",
        conflictingSet: list.filter(function (c) { return isNum(c.minimum) && c.minimum > 0; }),
        explanation: "The stated minimums sum to " + minimumSum.toFixed(4) + ", which is more than the " +
          "whole portfolio. No weight vector can satisfy them, so this is not a solver failure. " +
          "No constraint has been relaxed and the current portfolio is unchanged."
      };
    }
    if (hasMaximumForAll && maximumSum < 1 - 1e-12) {
      return {
        state: "infeasible",
        universallyInfeasible: true,
        reason: "maximums-cannot-fill-allocation",
        conflictingSet: list.filter(function (c) { return isNum(c.maximum); }),
        explanation: "The stated maximums sum to " + maximumSum.toFixed(4) + ", so the eligible universe " +
          "cannot be fully allocated. No constraint has been relaxed and the current portfolio is unchanged."
      };
    }
    if (violated.length) {
      return {
        state: "infeasible",
        universallyInfeasible: false,
        reason: "candidate-violates-constraints",
        conflictingSet: violated,
        explanation: "This candidate violates " + violated.length + " stated constraint" +
          (violated.length === 1 ? "" : "s") + ". It is reported as infeasible rather than adjusted, " +
          "because silently relaxing a mandate would make the mandate meaningless."
      };
    }
    return { state: "feasible", universallyInfeasible: false, conflictingSet: [] };
  }

  function normalizeWeights(raw) {
    var total = 0;
    for (var i = 0; i < raw.length; i += 1) total += raw[i];
    if (total <= 0) return null;
    return raw.map(function (v) { return v / total; });
  }

  /**
   * Build the six allocation candidates on ONE frozen basis.
   *
   * Every candidate reads the same universe, the same covariance, and the same
   * constraints, so a difference between them is attributable to the METHOD and
   * not to a changed input. No candidate is labelled best or recommended: the
   * comparison reports the trade-offs and leaves the judgement where it belongs.
   */
  function compareAllocationMethods(request) {
    if (!request || typeof request !== "object") return { state: "unavailable", reason: "request-invalid" };
    var symbols = request.symbols;
    var covariance = request.covariance;
    if (!Array.isArray(symbols) || symbols.length < 2) return { state: "unavailable", reason: "insufficient-universe" };
    if (!Array.isArray(covariance) || covariance.length !== symbols.length) {
      return { state: "unavailable", reason: "covariance-required" };
    }
    if (!Array.isArray(request.currentWeights) || request.currentWeights.length !== symbols.length) {
      return { state: "unavailable", reason: "current-weights-required" };
    }
    var n = symbols.length;
    var variances = [];
    for (var i = 0; i < n; i += 1) {
      if (!Array.isArray(covariance[i]) || covariance[i].length !== n) {
        return { state: "unavailable", reason: "covariance-not-square" };
      }
      if (!isNum(covariance[i][i]) || covariance[i][i] <= 0) {
        return { state: "unavailable", reason: "non-positive-variance" };
      }
      variances.push(covariance[i][i]);
    }

    var candidates = [];

    candidates.push({
      method: "current",
      label: "Current portfolio",
      weights: request.currentWeights.slice(),
      assumptions: ["Your holdings exactly as they are. No model, no estimate."]
    });

    candidates.push({
      method: "equal-weight",
      label: "Equal weight",
      weights: symbols.map(function () { return 1 / n; }),
      assumptions: [
        "Assumes nothing about return, risk, or correlation.",
        "Its strength is that it cannot be wrong about an estimate it never makes."
      ]
    });

    /* Minimum variance WITHOUT the off-diagonals is inverse-variance weighting,
       which is a different method. The full solve needs the inverse covariance;
       when it is unavailable this reports so rather than substituting the
       diagonal approximation under the same name. */
    var minVarWeights = null;
    var inverseRow = solveSymmetric(covariance, symbols.map(function () { return 1; }));
    if (inverseRow && inverseRow.length === n && inverseRow.every(isNum)) {
      minVarWeights = normalizeWeights(inverseRow);
      if (minVarWeights && !minVarWeights.every(isNum)) minVarWeights = null;
    }
    if (minVarWeights) {
      candidates.push({
        method: "minimum-variance",
        label: "Minimum variance",
        weights: minVarWeights,
        assumptions: [
          "Uses the full covariance matrix including correlations.",
          "Makes no return forecast at all, so it optimises risk only.",
          "Highly sensitive to covariance estimation error, which is why the sensitivity read matters."
        ]
      });
    } else {
      candidates.push({
        method: "minimum-variance",
        label: "Minimum variance",
        weights: null,
        state: "unavailable",
        reason: "covariance-not-invertible",
        assumptions: ["The covariance matrix could not be inverted, so no minimum-variance solution exists " +
          "for this universe. Inverse-variance weighting is NOT substituted here: it is a different method " +
          "and reporting it under this name would misstate what was solved."]
      });
    }

    var inverseVol = variances.map(function (v) { return 1 / Math.sqrt(v); });
    candidates.push({
      method: "risk-parity",
      label: "Risk parity (inverse volatility)",
      weights: normalizeWeights(inverseVol),
      assumptions: [
        "Inverse-volatility weighting, the naive form of risk parity.",
        "It equalises standalone volatility contribution, NOT correlation-adjusted risk contribution."
      ]
    });

    if (Array.isArray(request.views) && request.views.length && isNum(request.viewConfidence)) {
      var equilibrium = normalizeWeights(inverseVol);
      var blended = equilibrium.map(function (w, index) {
        var view = request.views[index];
        return isNum(view) ? w * (1 - request.viewConfidence) + view * request.viewConfidence : w;
      });
      candidates.push({
        method: "black-litterman",
        label: "Black-Litterman",
        weights: normalizeWeights(blended),
        assumptions: [
          "Blends YOUR stated views with an equilibrium prior at the confidence you stated.",
          "Both the views and the confidence are your inputs; neither is inferred."
        ]
      });
    } else {
      candidates.push({
        method: "black-litterman",
        label: "Black-Litterman",
        weights: null,
        state: "unavailable",
        reason: "views-and-confidence-required",
        assumptions: ["Black-Litterman requires explicit views AND an explicit confidence. Neither is " +
          "inferred from your holdings or behaviour, because a view you did not state is not your view."]
      });
    }

    if (Array.isArray(request.expectedReturns) && request.expectedReturns.length === n && request.expectedReturns.every(isNum)) {
      var mvoRaw = solveSymmetric(covariance, request.expectedReturns);
      var mvoWeights = mvoRaw && mvoRaw.length === n && mvoRaw.every(isNum)
        ? normalizeWeights(mvoRaw.map(function (v) { return Math.max(v, 0); }))
        : null;
      candidates.push({
        method: "constrained-mvo",
        label: "Constrained mean-variance",
        weights: mvoWeights,
        state: mvoWeights ? undefined : "unavailable",
        reason: mvoWeights ? undefined : "no-non-negative-solution",
        assumptions: [
          "Uses YOUR stated expected returns. Mean-variance output is famously sensitive to them.",
          "Long-only: negative solutions are clipped to zero before renormalising, which is a stated " +
            "simplification rather than a true constrained solve."
        ]
      });
    } else {
      candidates.push({
        method: "constrained-mvo",
        label: "Constrained mean-variance",
        weights: null,
        state: "unavailable",
        reason: "expected-returns-required",
        assumptions: ["Mean-variance optimisation requires expected returns you stated. They are never " +
          "estimated from past returns here, because a historical mean is a poor forecast and using one " +
          "silently would hide that choice inside the result."]
      });
    }

    candidates.forEach(function (candidate) {
      if (!candidate.weights) {
        candidate.feasibility = { state: "unavailable", reason: candidate.reason };
        candidate.portfolioVolatility = null;
        return;
      }
      candidate.feasibility = evaluateFeasibility(symbols, candidate.weights, request.constraints);
      var variance = 0;
      for (var a = 0; a < n; a += 1) {
        for (var b = 0; b < n; b += 1) {
          variance += candidate.weights[a] * candidate.weights[b] * covariance[a][b];
        }
      }
      candidate.portfolioVolatility = Math.sqrt(Math.max(variance, 0));
    });

    return {
      state: "ok",
      symbols: symbols.slice(),
      candidates: candidates,
      basisFrozen: true,
      recommendedMethod: null,
      bestMethod: null,
      claimBoundary: "Every candidate reads the same universe, the same covariance, and the same " +
        "constraints, so a difference between them is attributable to the METHOD and not to a changed " +
        "input. None is labelled best or recommended: the candidate with the lowest modeled volatility " +
        "is not thereby the right one for you, and an in-sample lead is the weakest kind of evidence."
    };
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
    validateCashFlow: validateCashFlow,
    scheduleCashFlows: scheduleCashFlows,
    applyCashFlows: applyCashFlows,
    computeSurvival: computeSurvival,
    compareStressDependence: compareStressDependence,
    forbesRigobonAdjustment: forbesRigobonAdjustment,
    lowerTailDependence: lowerTailDependence,
    alternativeAssetQuality: alternativeAssetQuality,
    desmoothReturns: desmoothReturns,
    computeHedgeVariant: computeHedgeVariant,
    compareHedgeVariants: compareHedgeVariants,
    ALLOCATION_METHODS: ALLOCATION_METHODS,
    evaluateFeasibility: evaluateFeasibility,
    compareAllocationMethods: compareAllocationMethods,
    analyticsIdentity: analyticsIdentity
  };
});
