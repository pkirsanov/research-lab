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
  var CALENDAR_DAYS_PER_YEAR = 365.2425;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var RISK_METRIC_FAMILIES = Object.freeze([
    "descriptive-concentration",
    "return-cagr-drawdown",
    "daily-covariance-asset-risk",
    "capm-proxy-factor",
    "paths-allocation"
  ]);

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
    if (opts.allowPartialWeight === true) {
      if (!(wsum > 0) || wsum > 1 + 1e-9) return alignFailure("weights-invalid", cutoff);
    } else if (Math.abs(wsum - 1) > 1e-9) {
      return alignFailure("weights-invalid", cutoff);
    }

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

    var commonSet = new Set(common);
    var excludedDates = [];
    union.forEach(function (d) { if (!commonSet.has(d)) excludedDates.push(d); });
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
      weightSum: wsum,
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
      weightSum: 0,
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
    var firstDate = aligned.commonDates[0];
    var lastDate = aligned.commonDates[aligned.commonDates.length - 1];
    var elapsedDays = (Date.parse(lastDate + "T00:00:00.000Z") - Date.parse(firstDate + "T00:00:00.000Z")) / 86400000;
    if (!(elapsedDays > 0)) return { state: "elapsed-time-invalid", firstDate: firstDate, lastDate: lastDate };
    var years = elapsedDays / CALENDAR_DAYS_PER_YEAR;

    var arithmetic = RLMETRICS.annualizedArithmetic(returns, ppy);
    var compounded = RLMETRICS.cagr(idx[0], idx[idx.length - 1], years);
    var drag = RLMETRICS.volatilityDrag(returns, ppy);
    var vol = RLMETRICS.annualizedVol(returns, ppy);
    var dragApprox = RLMETRICS.volatilityDragApprox(vol);

    return {
      state: "ok",
      periodsPerYear: ppy,
      sampleSize: returns.length,
      elapsedDays: elapsedDays,
      years: years,
      firstDate: firstDate,
      lastDate: lastDate,
      cutoff: aligned.cutoff,
      arithmeticAnnualized: arithmetic,
      compoundedCagr: compounded,
      volatilityAnnualized: vol,
      dragObserved: drag,
      dragApprox: dragApprox,
      dragApproxIsConditional: true,
      dragApproxAssumptions: "Holds under continuous compounding of a log-normal process; a finite discrete sample is not that, so this cross-checks the observed drag rather than replacing it.",
      cagrAnnualizationPolicy: "exact-elapsed-calendar-days/365.2425",
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

  function holdingIdentity(holding, index) {
    if (holding && typeof holding.holdingId === "string" && holding.holdingId) return holding.holdingId;
    if (holding && typeof holding.id === "string" && holding.id) return holding.id;
    if (holding && typeof holding.symbol === "string" && holding.symbol) return holding.symbol;
    return "holding-" + String(index + 1);
  }

  function holdingInputClass(holding) {
    var declared = holding && holding.inputClass;
    if (declared === "listed-explicit-weight" || declared === "listed-quantity-value" ||
        declared === "cash" || declared === "manual-dated-series" ||
        declared === "manual-no-series" || declared === "unresolved-unsupported") return declared;
    if (!holding) return "unresolved-unsupported";
    if (holding.assetType === "cash") return "cash";
    if (holding.assetType === "manual-alternative") {
      return holding.manualSeries && Array.isArray(holding.manualSeries.rows)
        ? "manual-dated-series"
        : "manual-no-series";
    }
    if (holding.assetType === "unresolved" || holding.assetType === "unsupported") return "unresolved-unsupported";
    if (isNum(holding.weight) || isNum(holding.explicitWeight)) return "listed-explicit-weight";
    if (isNum(holding.derivedValue) || isNum(holding.localValue) || isNum(holding.quantity)) return "listed-quantity-value";
    return "unresolved-unsupported";
  }

  function declaredHoldingWeight(holding) {
    if (holding && isNum(holding.weight) && holding.weight >= 0) return holding.weight;
    if (holding && isNum(holding.explicitWeight) && holding.explicitWeight >= 0) return holding.explicitWeight;
    return null;
  }

  function holdingValue(holding) {
    if (holding && isNum(holding.derivedValue) && holding.derivedValue > 0) return holding.derivedValue;
    if (holding && isNum(holding.localValue) && holding.localValue > 0) return holding.localValue;
    return null;
  }

  function deriveRiskWeights(holdings) {
    if (!Array.isArray(holdings) || !holdings.length) {
      return { state: "no-holdings", holdingWeights: {}, symbolWeights: {}, records: [], knownWeight: 0, unknownIds: [] };
    }
    var records = [], explicitTotal = 0, valueTotal = 0, valueRecords = [], unknown = [];
    for (var i = 0; i < holdings.length; i += 1) {
      var holding = holdings[i];
      var id = holdingIdentity(holding, i);
      var weight = declaredHoldingWeight(holding);
      var value = holdingValue(holding);
      var record = { id: id, holding: holding, inputClass: holdingInputClass(holding), weight: weight, value: value };
      records.push(record);
      if (weight !== null) explicitTotal += weight;
      else if (value !== null) { valueTotal += value; valueRecords.push(record); }
      else unknown.push(id);
    }
    if (explicitTotal > 1 + 1e-9) {
      return { state: "weights-invalid", holdingWeights: {}, symbolWeights: {}, records: records, knownWeight: 0, unknownIds: unknown.sort() };
    }
    var remainder = Math.max(0, 1 - explicitTotal);
    for (var j = 0; j < valueRecords.length; j += 1) {
      valueRecords[j].weight = valueTotal > 0 ? remainder * valueRecords[j].value / valueTotal : null;
    }
    var holdingWeights = {}, symbolWeights = {}, knownWeight = 0;
    for (var k = 0; k < records.length; k += 1) {
      var item = records[k];
      if (!isNum(item.weight)) continue;
      holdingWeights[item.id] = item.weight;
      knownWeight += item.weight;
      if (item.holding && typeof item.holding.symbol === "string" && item.holding.symbol) {
        symbolWeights[item.holding.symbol] = (symbolWeights[item.holding.symbol] || 0) + item.weight;
      }
    }
    return {
      state: unknown.length || Math.abs(knownWeight - 1) > 1e-9 ? "partial" : "ok",
      holdingWeights: holdingWeights,
      symbolWeights: symbolWeights,
      records: records,
      knownWeight: knownWeight,
      unknownIds: unknown.sort()
    };
  }

  function usableSeries(rows, cutoff) {
    if (!Array.isArray(rows)) return false;
    var count = 0;
    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      if (row && isDate(row.date) && (!cutoff || row.date <= cutoff) && isNum(row.close) && row.close > 0) count += 1;
    }
    return count >= 2;
  }

  function evidenceIdsFor(record, frequency, cutoff) {
    var holding = record.holding || {};
    var ids = Array.isArray(holding.evidenceIds) ? holding.evidenceIds.slice() : [];
    if (holding.manualSeries && Array.isArray(holding.manualSeries.evidenceIds)) ids = ids.concat(holding.manualSeries.evidenceIds);
    if (holding.cashTreatment && Array.isArray(holding.cashTreatment.evidenceIds)) ids = ids.concat(holding.cashTreatment.evidenceIds);
    if (!ids.length && frequency === "daily" && holding.symbol) ids.push("series:" + holding.symbol + ":" + (cutoff || "unbounded"));
    return Array.from(new Set(ids)).sort();
  }

  function eligibilityRow(record, family, state, frequency, reasons, cutoff) {
    var weight = isNum(record.weight) ? record.weight : 0;
    var included = state === "eligible" || state === "eligible-compatible-frequency";
    return {
      contractVersion: "AssetMetricEligibility/v1",
      holdingId: record.id,
      symbol: record.holding && record.holding.symbol ? record.holding.symbol : null,
      inputClass: record.inputClass,
      metricFamily: family,
      state: state,
      frequency: frequency || null,
      evidenceIds: evidenceIdsFor(record, frequency, cutoff),
      includedWeight: included ? weight : 0,
      excludedWeight: included ? 0 : weight,
      reasons: reasons.slice()
    };
  }

  function buildRiskEligibility(weightResult, series, cutoff) {
    var rows = [];
    for (var i = 0; i < weightResult.records.length; i += 1) {
      var record = weightResult.records[i];
      var holding = record.holding || {};
      var hasWeight = isNum(record.weight);
      var daily = hasWeight && usableSeries((series || {})[holding.symbol], cutoff);
      var inputClass = record.inputClass;
      var supported = inputClass !== "unresolved-unsupported";
      var descriptiveState = hasWeight && supported ? "eligible" : "unavailable";
      rows.push(eligibilityRow(record, RISK_METRIC_FAMILIES[0], descriptiveState, null,
        descriptiveState === "eligible" ? [] : [hasWeight ? "unsupported-input-class" : "weight-unavailable"], cutoff));

      var returnState = "unavailable", returnFrequency = null, returnReasons = [];
      if (inputClass === "listed-explicit-weight" || inputClass === "listed-quantity-value") {
        returnFrequency = "daily";
        if (daily) returnState = "eligible";
        else returnReasons.push("return-series-unavailable");
      } else if (inputClass === "cash") {
        returnFrequency = holding.cashTreatment && holding.cashTreatment.frequency || null;
        if (holding.cashTreatment && returnFrequency === "daily" && daily) returnState = "eligible";
        else returnReasons.push(holding.cashTreatment ? "cash-series-unavailable" : "cash-treatment-required");
      } else if (inputClass === "manual-dated-series") {
        returnFrequency = holding.manualSeries && holding.manualSeries.frequency || null;
        if (returnFrequency && holding.manualSeries && usableSeries(holding.manualSeries.rows, cutoff)) returnState = "eligible-compatible-frequency";
        else returnReasons.push("manual-series-unavailable");
      } else if (inputClass === "manual-no-series") {
        returnReasons.push("dated-series-required");
      } else {
        returnReasons.push("unsupported-input-class");
      }
      if (!hasWeight) { returnState = "unavailable"; returnReasons = ["weight-unavailable"]; }
      rows.push(eligibilityRow(record, RISK_METRIC_FAMILIES[1], returnState, returnFrequency, returnReasons, cutoff));

      var covarianceEligible = returnState === "eligible" && returnFrequency === "daily";
      rows.push(eligibilityRow(record, RISK_METRIC_FAMILIES[2], covarianceEligible ? "eligible" : "unavailable",
        covarianceEligible ? "daily" : returnFrequency,
        covarianceEligible ? [] : [returnState === "eligible-compatible-frequency" ? "frequency-incompatible-with-daily-matrix" : (returnReasons[0] || "daily-return-required")], cutoff));

      var modelEligible = covarianceEligible && (inputClass === "listed-explicit-weight" || inputClass === "listed-quantity-value");
      rows.push(eligibilityRow(record, RISK_METRIC_FAMILIES[3], modelEligible ? "eligible" : "unavailable",
        modelEligible ? "daily" : returnFrequency,
        modelEligible ? [] : [inputClass === "cash" ? "explicit-factor-treatment-required" : (returnState === "eligible-compatible-frequency" ? "compatible-proxy-required" : (returnReasons[0] || "listed-return-series-required"))], cutoff));

      var pathEligible = covarianceEligible ||
        (inputClass === "manual-no-series" && Array.isArray(holding.scenarioRanges) && holding.scenarioRanges.length > 0) ||
        (inputClass === "manual-dated-series" && Array.isArray(holding.scenarioRanges) && holding.scenarioRanges.length > 0);
      rows.push(eligibilityRow(record, RISK_METRIC_FAMILIES[4], pathEligible ? "eligible" : "unavailable",
        covarianceEligible ? "daily" : returnFrequency,
        pathEligible ? [] : [inputClass.indexOf("manual-") === 0 ? "scenario-range-required" : (returnReasons[0] || "dependent-evidence-unavailable")], cutoff));
    }
    return rows;
  }

  function familyEligibility(eligibility, family) {
    return eligibility.filter(function (entry) { return entry.metricFamily === family; });
  }

  function uniqueSorted(values) { return Array.from(new Set(values)).sort(); }

  function metricResult(metricId, family, eligibility, includedEntries, state, frequency, aligned, cutoff) {
    var familyRows = familyEligibility(eligibility, family);
    var includedIds = uniqueSorted(includedEntries.map(function (entry) { return entry.holdingId; }));
    var includedSet = new Set(includedIds);
    var excludedIds = uniqueSorted(familyRows.filter(function (entry) { return !includedSet.has(entry.holdingId); })
      .map(function (entry) { return entry.holdingId; }));
    var coveredWeight = includedEntries.reduce(function (sum, entry) { return sum + entry.includedWeight; }, 0);
    if (coveredWeight > 1 && coveredWeight < 1 + 1e-9) coveredWeight = 1;
    return {
      contractVersion: "RiskMetricResult/v1",
      metricId: metricId,
      metricFamily: family,
      eligibility: familyRows,
      includedIds: includedIds,
      excludedIds: excludedIds,
      coveredWeight: coveredWeight,
      uncoveredWeight: Math.max(0, 1 - coveredWeight),
      frequency: frequency || null,
      firstDate: aligned && aligned.state === "ok" ? aligned.commonDates[0] : null,
      lastDate: aligned && aligned.state === "ok" ? aligned.commonDates[aligned.commonDates.length - 1] : null,
      cutoff: cutoff || null,
      state: state
    };
  }

  var COMPATIBLE_PERIODS_PER_YEAR = Object.freeze({
    weekly: 52,
    monthly: 12,
    quarterly: 4,
    annual: 1
  });

  function compatibleFrequencyRiskResults(weightResult, eligibility, cutoff) {
    var returnRows = familyEligibility(eligibility, RISK_METRIC_FAMILIES[1]).filter(function (entry) {
      return entry.state === "eligible-compatible-frequency";
    });
    var recordsById = {};
    weightResult.records.forEach(function (record) { recordsById[record.id] = record; });
    return returnRows.map(function (entry) {
      var record = recordsById[entry.holdingId];
      var manualSeries = record && record.holding && record.holding.manualSeries;
      var periodsPerYear = COMPATIBLE_PERIODS_PER_YEAR[entry.frequency];
      var seriesId = "manual:" + entry.holdingId;
      var aligned = alignFailure("compatible-frequency-unavailable", cutoff);
      if (manualSeries && Array.isArray(manualSeries.rows) && periodsPerYear) {
        var series = {};
        var weights = {};
        series[seriesId] = manualSeries.rows;
        weights[seriesId] = 1;
        aligned = alignPortfolioReturns({ series: series, weights: weights, cutoff: cutoff });
      }
      var metrics = computeReturnMetrics(aligned, { periodsPerYear: periodsPerYear });
      var drawdown = computeDrawdown(aligned);
      var resultState = aligned.state === "ok"
        ? (entry.includedWeight < 1 - 1e-9 ? "partial" : "ok")
        : "unavailable";
      return {
        contractVersion: "CompatibleFrequencyRiskResult/v1",
        holdingId: entry.holdingId,
        symbol: entry.symbol,
        holdingWeight: entry.includedWeight,
        frequency: entry.frequency,
        periodsPerYear: periodsPerYear || null,
        evidenceIds: entry.evidenceIds.slice(),
        alignment: aligned,
        metrics: metrics,
        drawdown: drawdown,
        metricResult: metricResult("compatible-return:" + entry.holdingId,
          RISK_METRIC_FAMILIES[1], eligibility, aligned.state === "ok" ? [entry] : [],
          resultState, entry.frequency, aligned, cutoff)
      };
    }).sort(function (left, right) { return left.holdingId < right.holdingId ? -1 : 1; });
  }

  function preserveLastValid(failure, lastValid) {
    if (!lastValid || lastValid.available !== true) return failure;
    var preserved = Object.assign({}, lastValid);
    preserved.state = "preserved-last-valid";
    preserved.lastValidState = lastValid.state;
    preserved.candidateFailure = failure;
    return preserved;
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
    var weightResult = deriveRiskWeights(opts.holdings);
    if (weightResult.state === "no-holdings" || weightResult.state === "weights-invalid") {
      return preserveLastValid({ state: weightResult.state, available: false, points: [], rows: [], cutoff: opts.cutoff || null }, opts.lastValid);
    }
    var eligibility = buildRiskEligibility(weightResult, opts.series, opts.cutoff);
    var compatibleFrequencyResults = compatibleFrequencyRiskResults(weightResult, eligibility, opts.cutoff);
    var returnEligibility = familyEligibility(eligibility, RISK_METRIC_FAMILIES[1]);
    var dailyReturnEntries = returnEligibility.filter(function (entry) {
      return entry.state === "eligible" && entry.frequency === "daily";
    });
    var dailySymbols = uniqueSorted(dailyReturnEntries.map(function (entry) { return entry.symbol; }).filter(Boolean));
    var dailyWeights = {}, dailySeries = {};
    for (var de = 0; de < dailyReturnEntries.length; de += 1) {
      var dailyEntry = dailyReturnEntries[de];
      dailyWeights[dailyEntry.symbol] = (dailyWeights[dailyEntry.symbol] || 0) + dailyEntry.includedWeight;
    }
    for (var ds = 0; ds < dailySymbols.length; ds += 1) dailySeries[dailySymbols[ds]] = (opts.series || {})[dailySymbols[ds]];

    var aligned = dailySymbols.length ? alignPortfolioReturns({
      series: dailySeries,
      weights: dailyWeights,
      cutoff: opts.cutoff,
      allowPartialWeight: true
    }) : alignFailure("no-eligible-series", opts.cutoff);

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
        minimumObservations: opts.minimumCapmObservations,
        benchmarkSymbol: opts.benchmarkSymbol,
        sourceSymbols: opts.benchmarkSymbol ? [opts.benchmarkSymbol] : [],
        frequency: "daily",
        firstDate: aligned.commonDates[0],
        lastDate: aligned.commonDates[aligned.commonDates.length - 1]
      });
    }

    var factors = { state: "factors-unavailable" };
    if (opts.factorReturns && Object.keys(opts.factorReturns).length) {
      factors = fitFactors(aligned.returns, opts.factorReturns, {
        periodsPerYear: opts.periodsPerYear,
        factorsVersion: opts.proxyFactorsVersion,
        factorSourceSymbols: opts.factorSourceSymbols,
        frequency: "daily",
        firstDate: aligned.commonDates[0],
        lastDate: aligned.commonDates[aligned.commonDates.length - 1]
      });
    }

    var covariance = { state: "not-computed" };
    var contributions = { state: "not-computed" };
    if (aligned.returns.length >= 2) {
      covariance = computeCovariance(aligned.perSymbolReturns, {
        shrinkageLambda: opts.shrinkageLambda,
        firstDate: aligned.commonDates[0],
        lastDate: aligned.commonDates[aligned.commonDates.length - 1]
      });
      if (covariance.state === "ok" && covariance.conditionedPositiveDefinite) {
        // Contributions run on the CONDITIONED matrix, and the projection carries which one was
        // used so a reader is never left guessing whether a shrinkage assumption is baked in.
        contributions = riskContributions(covariance.symbols, dailyWeights, covariance.conditioned, {
          reconciliationTolerance: opts.reconciliationTolerance
        });
        contributions.model = "asset-covariance";
        contributions.basis = "conditioned";
        contributions.shrinkageLambda = covariance.shrinkageLambda;
      }
    }

    var returnSplit = aligned.state === "ok"
      ? returnContributions(aligned.symbols, dailyWeights, aligned.perSymbolReturns, { reconciliationTolerance: opts.reconciliationTolerance })
      : { state: "not-computed" };
    if (returnSplit.state === "ok") returnSplit.model = "realized-return";
    var factorContributions = factors && factors.factorVarianceContributions
      ? Object.assign({ model: "proxy-factor-variance" }, factors.factorVarianceContributions)
      : { state: factors.state === "ok" ? "not-computed" : factors.state };

    // Canvas points and table rows come from the SAME wealth index in the SAME order.
    var points = aligned.state === "ok" ? aligned.commonDates.map(function (date, i) {
      return {
        pointId: "rx-" + date.replace(/-/g, ""),
        date: date,
        wealth: aligned.wealthIndex[i],
        drawdownAt: (aligned.wealthIndex[i] / runningPeakAt(aligned.wealthIndex, i)) - 1
      };
    }) : [];

    var descriptiveEntries = familyEligibility(eligibility, RISK_METRIC_FAMILIES[0]).filter(function (entry) { return entry.state === "eligible"; });
    var modelEntries = familyEligibility(eligibility, RISK_METRIC_FAMILIES[3]).filter(function (entry) { return entry.state === "eligible"; });
    var dailyCoverage = dailyReturnEntries.reduce(function (sum, entry) { return sum + entry.includedWeight; }, 0);
    var partial = weightResult.state === "partial" || dailyCoverage < 1 - 1e-9 || eligibility.some(function (entry) { return entry.state === "unavailable"; });
    var available = aligned.state === "ok" || descriptiveEntries.length > 0;
    var projectionState = available ? (partial ? "partial" : "ok") : aligned.state;
    var returnsState = metrics.state === "ok" ? (dailyCoverage < 1 - 1e-9 ? "partial" : "ok") : "unavailable";
    var covarianceState = covariance.state === "ok" ? (dailyCoverage < 1 - 1e-9 ? "partial" : "ok") : "unavailable";
    var capmState = capm.state === "ok" ? (dailyCoverage < 1 - 1e-9 ? "partial" : "ok") : capm.state;
    var factorsState = factors.state === "ok" ? (dailyCoverage < 1 - 1e-9 ? "partial" : "ok") : factors.state;
    var assetContributionState = contributions.state === "ok" ? (dailyCoverage < 1 - 1e-9 ? "partial" : "ok") : "unavailable";
    var factorContributionState = factorContributions.state === "ok" ? (dailyCoverage < 1 - 1e-9 ? "partial" : "ok") : factorContributions.state;
    var returnContributionState = returnSplit.state === "ok" ? (dailyCoverage < 1 - 1e-9 ? "partial" : "ok") : "unavailable";
    var descriptiveCoverage = descriptiveEntries.reduce(function (sum, entry) { return sum + entry.includedWeight; }, 0);
    var metricResults = {
      descriptive: metricResult("descriptive", RISK_METRIC_FAMILIES[0], eligibility, descriptiveEntries,
        descriptiveEntries.length ? (descriptiveCoverage < 1 - 1e-9 ? "partial" : "ok") : "unavailable", "mixed", null, opts.cutoff),
      returns: metricResult("returns", RISK_METRIC_FAMILIES[1], eligibility, dailyReturnEntries, returnsState, "daily", aligned, opts.cutoff),
      drawdown: metricResult("drawdown", RISK_METRIC_FAMILIES[1], eligibility, dailyReturnEntries, returnsState, "daily", aligned, opts.cutoff),
      covariance: metricResult("covariance", RISK_METRIC_FAMILIES[2], eligibility, dailyReturnEntries, covarianceState, "daily", aligned, opts.cutoff),
      capm: metricResult("capm", RISK_METRIC_FAMILIES[3], eligibility, capm.state === "ok" ? modelEntries : [], capmState, "daily", aligned, opts.cutoff),
      factors: metricResult("factors", RISK_METRIC_FAMILIES[3], eligibility, factors.state === "ok" ? modelEntries : [], factorsState, "daily", aligned, opts.cutoff),
      assetContributions: metricResult("assetContributions", RISK_METRIC_FAMILIES[2], eligibility, contributions.state === "ok" ? dailyReturnEntries : [], assetContributionState, "daily", aligned, opts.cutoff),
      factorContributions: metricResult("factorContributions", RISK_METRIC_FAMILIES[3], eligibility, factorContributions.state === "ok" ? modelEntries : [], factorContributionState, "daily", aligned, opts.cutoff),
      returnContributions: metricResult("returnContributions", RISK_METRIC_FAMILIES[1], eligibility, returnSplit.state === "ok" ? dailyReturnEntries : [], returnContributionState, "daily", aligned, opts.cutoff)
    };
    if (!available) {
      return preserveLastValid({
        contractVersion: "RiskDiagnosticSet/v1", state: projectionState, available: false,
        eligibility: eligibility, metricResults: metricResults,
        compatibleFrequencyResults: compatibleFrequencyResults,
        points: [], rows: [], cutoff: opts.cutoff || null
      }, opts.lastValid);
    }

    return {
      contractVersion: "RiskDiagnosticSet/v1",
      state: projectionState,
      available: available,
      identity: analyticsIdentity({
        weights: weightResult.symbolWeights,
        cutoff: opts.cutoff,
        periodsPerYear: opts.periodsPerYear
      }),
      cutoff: aligned.cutoff,
      symbols: aligned.state === "ok" ? aligned.symbols : Object.keys(weightResult.symbolWeights).sort(),
      weights: weightResult.symbolWeights,
      alignment: aligned.alignment,
      eligibility: eligibility,
      metricResults: metricResults,
      compatibleFrequencyResults: compatibleFrequencyResults,
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
      factorContributions: factorContributions,
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
    var weightResult = deriveRiskWeights(holdings);
    if (weightResult.state === "no-holdings" || weightResult.state === "weights-invalid") {
      return { state: weightResult.state, lens: lens, buckets: [], missing: [] };
    }

    var totals = {}, missing = [], coveredWeight = 0, includedIds = [], i, key;
    for (i = 0; i < weightResult.records.length; i += 1) {
      var record = weightResult.records[i];
      var holding = record.holding || {};
      var weight = isNum(record.weight) ? record.weight : 0;
      var exposure = holding[lens];
      var displayId = holding.symbol || record.id;
      if (typeof exposure === "string" && exposure.trim()) {
        key = exposure.trim();
        totals[key] = (totals[key] || 0) + weight;
        coveredWeight += weight;
        includedIds.push(record.id);
        continue;
      }
      if (exposure && typeof exposure === "object" && !Array.isArray(exposure)) {
        var exposureKeys = Object.keys(exposure).sort();
        var exposureTotal = 0, valid = exposureKeys.length > 0;
        for (var e = 0; e < exposureKeys.length; e += 1) {
          var fraction = exposure[exposureKeys[e]];
          if (!isNum(fraction) || fraction < 0) { valid = false; break; }
          exposureTotal += fraction;
        }
        if (valid && exposureTotal <= 1 + 1e-9) {
          for (var x = 0; x < exposureKeys.length; x += 1) {
            totals[exposureKeys[x]] = (totals[exposureKeys[x]] || 0) + weight * exposure[exposureKeys[x]];
          }
          coveredWeight += weight * Math.min(1, exposureTotal);
          includedIds.push(record.id);
          if (exposureTotal < 1 - 1e-9) missing.push(displayId);
          continue;
        }
      }
      missing.push(displayId);
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
      uncoveredWeight: Math.max(0, 1 - coveredWeight),
      includedIds: uniqueSorted(includedIds),
      excludedIds: uniqueSorted(weightResult.records.filter(function (record) {
        return includedIds.indexOf(record.id) === -1;
      }).map(function (record) { return record.id; })),
      missing: uniqueSorted(missing),
      // Coverage is stated so a lens explaining a third of the book cannot read like a full picture.
      coverageState: missing.length === 0 && coveredWeight >= 1 - 1e-9 ? "complete" : (coveredWeight > 0 ? "partial" : "none")
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
      benchmarkSymbol: opts.benchmarkSymbol || null,
      sourceSymbols: Array.isArray(opts.sourceSymbols) ? opts.sourceSymbols.slice() : [],
      frequency: opts.frequency || null,
      firstDate: opts.firstDate || null,
      lastDate: opts.lastDate || null,
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
      configuredMinimum: minimum,
      uncertainty: {
        betaStandardError: betaStdError,
        sampleState: n >= minimum ? "meets-minimum" : "below-configured-minimum",
        configuredMinimum: minimum,
        fitState: rSquared === null ? "unavailable" : (rSquared < 0.3 ? "low-explanatory-power" : "explained")
      }
    };
  }

  function mean(values) {
    var total = 0;
    for (var i = 0; i < values.length; i += 1) total += values[i];
    return total / values.length;
  }

  /* ------------------------------------------------------- Scope 08 covariance */

  function matrixFingerprint(matrix) {
    var text = matrix.map(function (row) {
      return row.map(function (value) { return isNum(value) ? value.toPrecision(15) : String(value); }).join(",");
    }).join(";");
    var hash = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return "covariance:" + (hash >>> 0).toString(16).padStart(8, "0");
  }

  function symmetricEigenvalues(matrix) {
    var n = Array.isArray(matrix) ? matrix.length : 0;
    if (!n) return null;
    var a = [], i, j;
    for (i = 0; i < n; i += 1) {
      if (!Array.isArray(matrix[i]) || matrix[i].length !== n || !matrix[i].every(isNum)) return null;
      a.push(matrix[i].slice());
    }
    if (n === 1) return [a[0][0]];
    var scale = 0;
    for (i = 0; i < n; i += 1) for (j = 0; j < n; j += 1) scale = Math.max(scale, Math.abs(a[i][j]));
    var tolerance = Math.max(Number.EPSILON, scale * 1e-12);
    for (var iteration = 0; iteration < 100 * n * n; iteration += 1) {
      var p = 0, q = 1, largest = Math.abs(a[p][q]);
      for (i = 0; i < n; i += 1) {
        for (j = i + 1; j < n; j += 1) {
          if (Math.abs(a[i][j]) > largest) { largest = Math.abs(a[i][j]); p = i; q = j; }
        }
      }
      if (largest <= tolerance) break;
      var angle = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]);
      var cosine = Math.cos(angle), sine = Math.sin(angle);
      var app = a[p][p], aqq = a[q][q], apq = a[p][q];
      for (i = 0; i < n; i += 1) {
        if (i === p || i === q) continue;
        var aip = a[i][p], aiq = a[i][q];
        a[i][p] = a[p][i] = cosine * aip - sine * aiq;
        a[i][q] = a[q][i] = sine * aip + cosine * aiq;
      }
      a[p][p] = cosine * cosine * app - 2 * sine * cosine * apq + sine * sine * aqq;
      a[q][q] = sine * sine * app + 2 * sine * cosine * apq + cosine * cosine * aqq;
      a[p][q] = a[q][p] = 0;
    }
    return a.map(function (row, index) { return row[index]; }).sort(function (left, right) { return left - right; });
  }

  function covarianceDiagnostics(matrix, observationCount, firstDate, lastDate) {
    var eigenvalues = symmetricEigenvalues(matrix);
    if (!eigenvalues) {
      return {
        observationCount: observationCount,
        firstDate: firstDate || null,
        lastDate: lastDate || null,
        minimumEigenvalue: null,
        choleskyState: "invalid",
        rank: 0,
        conditionEstimate: null,
        fingerprint: null,
        state: "invalid"
      };
    }
    var maximumMagnitude = eigenvalues.reduce(function (largest, value) { return Math.max(largest, Math.abs(value)); }, 0);
    var tolerance = Math.max(Number.EPSILON, maximumMagnitude * 1e-10);
    var rank = eigenvalues.filter(function (value) { return Math.abs(value) > tolerance; }).length;
    var positive = eigenvalues.filter(function (value) { return value > tolerance; });
    var positiveDefinite = isPositiveDefinite(matrix);
    return {
      observationCount: observationCount,
      firstDate: firstDate || null,
      lastDate: lastDate || null,
      minimumEigenvalue: eigenvalues[0],
      choleskyState: positiveDefinite ? "positive-definite" : "failed",
      rank: rank,
      conditionEstimate: rank === matrix.length && positive.length
        ? maximumMagnitude / Math.min.apply(null, positive)
        : null,
      fingerprint: matrixFingerprint(matrix),
      state: positiveDefinite ? "positive-definite" : (rank < matrix.length ? "singular" : "non-positive-definite")
    };
  }

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

    var rawDiagnostics = covarianceDiagnostics(raw, n, opts.firstDate, opts.lastDate);
    var conditionedDiagnostics = covarianceDiagnostics(conditioned, n, opts.firstDate, opts.lastDate);

    return {
      state: "ok",
      symbols: symbols,
      sampleSize: n,
      raw: raw,
      conditioned: conditioned,
      shrinkageLambda: lambda,
      rawPositiveDefinite: rawDiagnostics.choleskyState === "positive-definite",
      conditionedPositiveDefinite: conditionedDiagnostics.choleskyState === "positive-definite",
      lambdaWasAutoRaised: false,
      rawDiagnostics: rawDiagnostics,
      conditionedDiagnostics: conditionedDiagnostics,
      conditioning: {
        method: lambda === 0 ? "none" : "diagonal-shrinkage",
        lambda: lambda,
        lambdaWasAutoRaised: false,
        parentRawFingerprint: rawDiagnostics.fingerprint,
        resultDiagnostics: conditionedDiagnostics
      }
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

    var designDiagnostics = covarianceDiagnostics(XtX, n, opts.firstDate, opts.lastDate);
    var sourceSymbols = {}, missingSourceFactors = [];
    for (i = 0; i < ids.length; i += 1) {
      var declaredSources = opts.factorSourceSymbols && opts.factorSourceSymbols[ids[i]];
      sourceSymbols[ids[i]] = Array.isArray(declaredSources) ? declaredSources.slice() : [];
      if (!sourceSymbols[ids[i]].length) missingSourceFactors.push(ids[i]);
    }

    if (!isPositiveDefinite(XtX)) {
      return {
        state: "rank-deficient", available: available, unavailable: unavailable, sampleSize: n,
        definitionVersion: opts.factorsVersion || null,
        factorsVersion: opts.factorsVersion || null,
        sourceSymbols: sourceSymbols,
        missingSourceFactors: missingSourceFactors,
        rank: designDiagnostics.rank,
        conditionEstimate: designDiagnostics.conditionEstimate,
        conditionState: designDiagnostics.state
      };
    }

    var beta = solveSymmetric(XtX, Xty);
    if (!beta) {
      return {
        state: "rank-deficient", available: available, unavailable: unavailable, sampleSize: n,
        definitionVersion: opts.factorsVersion || null,
        factorsVersion: opts.factorsVersion || null,
        sourceSymbols: sourceSymbols,
        missingSourceFactors: missingSourceFactors,
        rank: designDiagnostics.rank,
        conditionEstimate: designDiagnostics.conditionEstimate,
        conditionState: designDiagnostics.state
      };
    }

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
    var factorInput = {};
    for (i = 0; i < available.length; i += 1) factorInput[available[i]] = factorSeries[available[i]];
    var factorCovarianceResult = computeCovariance(factorInput, {
      shrinkageLambda: 0,
      firstDate: opts.firstDate,
      lastDate: opts.lastDate
    });
    var factorCovariance = factorCovarianceResult.state === "ok" ? factorCovarianceResult.raw : null;
    var factorContribution = [], factorVariance = null, contributionSum = null;
    if (factorCovariance) {
      var exposureVector = available.map(function (id) { return exposures[id]; });
      var covarianceTimesExposure = matrixVector(factorCovariance, exposureVector);
      factorContribution = exposureVector.map(function (exposure, index) { return exposure * covarianceTimesExposure[index]; });
      contributionSum = factorContribution.reduce(function (sum, value) { return sum + value; }, 0);
      factorVariance = contributionSum;
    }
    var residualVariance = n > p ? ssResidual / (n - p) : null;
    var factorTolerance = 1e-12;
    var factorVarianceContributions = factorCovariance ? {
      state: "ok",
      factors: available.slice(),
      contribution: factorContribution,
      contributionSum: contributionSum,
      factorVariance: factorVariance,
      reconciliationResidual: Math.abs(contributionSum - factorVariance),
      reconciliationTolerance: factorTolerance,
      reconciled: Math.abs(contributionSum - factorVariance) <= factorTolerance
    } : { state: factorCovarianceResult.state };

    return {
      state: "ok",
      definitionVersion: opts.factorsVersion || null,
      factorsVersion: opts.factorsVersion || null,
      // Named a proxy in the payload itself so a consumer cannot quietly promote it to a real factor.
      basis: "declared-proxy-spreads",
      sampleSize: n,
      parameters: p,
      frequency: opts.frequency || null,
      firstDate: opts.firstDate || null,
      lastDate: opts.lastDate || null,
      available: available,
      unavailable: unavailable,
      sourceSymbols: sourceSymbols,
      missingSourceFactors: missingSourceFactors,
      sourceState: missingSourceFactors.length ? "partial" : "complete",
      rank: designDiagnostics.rank,
      conditionEstimate: designDiagnostics.conditionEstimate,
      conditionState: designDiagnostics.state,
      interceptAnnualized: beta[0] * ppy,
      exposures: exposures,
      coefficients: exposures,
      factorCovariance: factorCovariance,
      factorCovarianceDiagnostics: factorCovarianceResult.rawDiagnostics || null,
      factorVarianceContributions: factorVarianceContributions,
      residualVariance: residualVariance,
      totalModelVariance: factorVariance === null || residualVariance === null ? null : factorVariance + residualVariance,
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
    var weights = deriveRiskWeights(holdings);
    var coveredIds = [], missingIds = [], coveredWeight = 0;
    for (var r = 0; r < weights.records.length; r += 1) {
      var record = weights.records[r];
      var lookThrough = record.holding && record.holding.lookThrough;
      var keys = lookThrough && typeof lookThrough === "object" && !Array.isArray(lookThrough)
        ? Object.keys(lookThrough)
        : [];
      var total = 0, valid = keys.length > 0;
      for (var k = 0; k < keys.length; k += 1) {
        if (!isNum(lookThrough[keys[k]]) || lookThrough[keys[k]] < 0) { valid = false; break; }
        total += lookThrough[keys[k]];
      }
      if (valid && total <= 1 + 1e-9) {
        coveredIds.push(record.id);
        coveredWeight += (isNum(record.weight) ? record.weight : 0) * Math.min(1, total);
        if (total < 1 - 1e-9) missingIds.push(record.id);
      } else {
        missingIds.push(record.id);
      }
    }
    var lookThroughState = coveredIds.length
      ? (missingIds.length || coveredWeight < 1 - 1e-9 ? "partial" : "complete")
      : (lookThroughSource ? "available" : "no-configured-source");
    return {
      state: "ok",
      marketBased: marketBased.sort(),
      excludedFromMarketAnalytics: excluded.sort(function (a, b) { return a.symbol < b.symbol ? -1 : 1; }),
      // Absent by design in this deployment: no constituent source is configured, and inventing one
      // from a vehicle's own ticker would be a fabricated decomposition.
      lookThrough: {
        state: lookThroughState,
        source: lookThroughSource || (coveredIds.length ? "holding-declared" : null),
        covered: uniqueSorted(coveredIds),
        coveredIds: uniqueSorted(coveredIds),
        missingIds: uniqueSorted(missingIds),
        coveredWeight: coveredWeight,
        uncoveredWeight: Math.max(0, 1 - coveredWeight),
        reason: coveredIds.length
          ? "Holding-declared constituent weights cover " + (coveredWeight * 100).toFixed(2) + "% of portfolio weight; every uncovered holding remains named."
          : (lookThroughSource
            ? "Constituent data is available for the declared source."
            : "No constituent source is configured, so overlapping exposure inside pooled vehicles cannot be measured. It is not assumed absent.")
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
    "contractVersion", "workspaceIdentity", "portfolioRevisionId", "mandateRevisionId",
    "allocationCandidateId", "evidenceSet", "method", "seed", "horizon", "pathCount",
    "chunkSize", "parameterPolicy", "rebalancePolicy", "costPolicy", "contributions",
    "withdrawals", "cashNeeds", "survivalDefinition", "constraintsFingerprint",
    "uncertaintyPolicy", "policyFingerprint"
  ];
  var SCENARIO_EVIDENCE_KEYS = [
    "returnFingerprint", "sourceIds", "cutoffAt", "firstDate", "lastDate", "frequency",
    "currency", "eligibleDateFingerprint"
  ];
  var SCENARIO_METHOD_KEYS = [
    "family", "blockPolicy", "regimePolicy", "fatTailPolicy", "calibrationIdentity", "availability"
  ];
  var SCENARIO_BLOCK_KEYS = ["family", "meanBlockSessions", "wrapPolicy"];
  var SCENARIO_REGIME_KEYS = [
    "state", "stateDefinitions", "transitionMatrix", "fittingSample", "minimumSamplePolicy",
    "fitDiagnostics", "uncertainty"
  ];
  var SCENARIO_FAT_TAIL_KEYS = ["state", "innovationFamily", "tailParameters"];
  var SCENARIO_AVAILABILITY_KEYS = ["state", "reason"];
  var SCENARIO_HORIZON_KEYS = ["startDate", "endDate", "stepFrequency", "stepCount"];
  var SCENARIO_PARAMETER_POLICY_KEYS = ["drawCount", "ranges", "distributions", "gridIdentity"];
  var SCENARIO_PARAMETER_RANGE_KEYS = ["parameter", "low", "high"];
  var SCENARIO_PARAMETER_DISTRIBUTION_KEYS = ["parameter", "family", "parameters"];
  var SCENARIO_REBALANCE_KEYS = ["family", "frequency"];
  var SCENARIO_COST_KEYS = ["currency", "recurringFraction", "timing"];
  var SCENARIO_FLOW_KEYS = ["localId", "amount", "currency", "date", "timing", "label"];
  var SCENARIO_CASH_NEED_KEYS = SCENARIO_FLOW_KEYS.concat(["priority", "treatment"]);
  var SCENARIO_SURVIVAL_KEYS = [
    "state", "floorValue", "condition", "cashNeedPolicy", "currency", "startingValue"
  ];
  var SCENARIO_UNCERTAINTY_KEYS = ["intervalMethod", "quantiles", "separatePathAndParameter"];

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function hasExactKeys(value, keys) {
    return isPlainObject(value) && Object.keys(value).sort().join("|") === keys.slice().sort().join("|");
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
  }

  function isIsoDate(value) {
    return isNonEmptyString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  function isNullableString(value) {
    return value === null || isNonEmptyString(value);
  }

  function isNullableObject(value) {
    return value === null || isPlainObject(value);
  }

  function validateScenarioFlowRecords(records, keys, requireCashNeedFields) {
    if (!Array.isArray(records)) return false;
    var seen = {};
    for (var i = 0; i < records.length; i += 1) {
      var record = records[i];
      if (!hasExactKeys(record, keys)) return false;
      if (!isNonEmptyString(record.localId) || seen[record.localId]) return false;
      seen[record.localId] = true;
      if (!isNum(record.amount) || record.amount <= 0 || !isNonEmptyString(record.currency)) return false;
      if (!isIsoDate(record.date) || !isNonEmptyString(record.label)) return false;
      if (record.timing !== "start-of-step" && record.timing !== "end-of-step") return false;
      if (requireCashNeedFields && (!Number.isInteger(record.priority) || record.priority < 1 ||
        !isNonEmptyString(record.treatment))) return false;
    }
    return true;
  }

  /**
   * ScenarioSpecification/v1 — every field that changes a result must be present and explicit.
   *
   * Exact-key validation, not a superset check: a field the caller thought mattered but the engine
   * ignores would make two different-looking scenarios produce one identity, which is the silent
   * collision the identity exists to prevent.
   */
  function validateScenarioSpecification(spec) {
    if (!isPlainObject(spec)) return { ok: false, reason: "spec-invalid" };
    if (!hasExactKeys(spec, SCENARIO_KEYS)) return { ok: false, reason: "spec-keys-exact" };
    if (spec.contractVersion !== "ScenarioSpecification/v1") return { ok: false, reason: "contract-version" };
    if (![spec.workspaceIdentity, spec.portfolioRevisionId, spec.mandateRevisionId,
      spec.allocationCandidateId, spec.constraintsFingerprint, spec.policyFingerprint].every(isNonEmptyString)) {
      return { ok: false, reason: "identity-authority" };
    }
    if (!hasExactKeys(spec.evidenceSet, SCENARIO_EVIDENCE_KEYS)) return { ok: false, reason: "spec-keys-exact" };
    if (!isNonEmptyString(spec.evidenceSet.returnFingerprint) ||
      !Array.isArray(spec.evidenceSet.sourceIds) || spec.evidenceSet.sourceIds.length === 0 ||
      !spec.evidenceSet.sourceIds.every(isNonEmptyString) || !isNonEmptyString(spec.evidenceSet.cutoffAt) ||
      !isIsoDate(spec.evidenceSet.firstDate) || !isIsoDate(spec.evidenceSet.lastDate) ||
      !isNonEmptyString(spec.evidenceSet.frequency) || !isNonEmptyString(spec.evidenceSet.currency) ||
      !isNonEmptyString(spec.evidenceSet.eligibleDateFingerprint)) {
      return { ok: false, reason: "evidence-set" };
    }
    if (!isPlainObject(spec.method)) return { ok: false, reason: "method" };
    if (!hasExactKeys(spec.method, SCENARIO_METHOD_KEYS) ||
      !hasExactKeys(spec.method.blockPolicy, SCENARIO_BLOCK_KEYS) ||
      !hasExactKeys(spec.method.regimePolicy, SCENARIO_REGIME_KEYS) ||
      !hasExactKeys(spec.method.fatTailPolicy, SCENARIO_FAT_TAIL_KEYS) ||
      !hasExactKeys(spec.method.availability, SCENARIO_AVAILABILITY_KEYS)) {
      return { ok: false, reason: "spec-keys-exact" };
    }
    if (["stationary-bootstrap", "iid-comparison", "regime-fat-tail"].indexOf(spec.method.family) === -1) {
      return { ok: false, reason: "method" };
    }
    if (!isNonEmptyString(spec.method.blockPolicy.family) ||
      !isNum(spec.method.blockPolicy.meanBlockSessions) || spec.method.blockPolicy.meanBlockSessions < 1 ||
      ["cyclic", "no-wrap"].indexOf(spec.method.blockPolicy.wrapPolicy) === -1) {
      return { ok: false, reason: "mean-block" };
    }
    if (["not-requested", "unavailable", "calibrated"].indexOf(spec.method.regimePolicy.state) === -1 ||
      !Array.isArray(spec.method.regimePolicy.stateDefinitions) ||
      !Array.isArray(spec.method.regimePolicy.transitionMatrix) ||
      !isNullableString(spec.method.regimePolicy.fittingSample) ||
      !isNullableString(spec.method.regimePolicy.minimumSamplePolicy) ||
      !isNullableObject(spec.method.regimePolicy.fitDiagnostics) ||
      !isNullableObject(spec.method.regimePolicy.uncertainty)) {
      return { ok: false, reason: "regime-policy" };
    }
    if (["not-requested", "unavailable", "calibrated"].indexOf(spec.method.fatTailPolicy.state) === -1 ||
      !isNullableString(spec.method.fatTailPolicy.innovationFamily) ||
      !isNullableObject(spec.method.fatTailPolicy.tailParameters)) {
      return { ok: false, reason: "fat-tail-policy" };
    }
    if (!isNonEmptyString(spec.method.calibrationIdentity) ||
      ["calibrated", "unavailable"].indexOf(spec.method.availability.state) === -1 ||
      !isNullableString(spec.method.availability.reason)) {
      return { ok: false, reason: "method-availability" };
    }
    if (!Number.isInteger(spec.seed) || spec.seed < 0) return { ok: false, reason: "seed" };
    if (!hasExactKeys(spec.horizon, SCENARIO_HORIZON_KEYS)) return { ok: false, reason: "spec-keys-exact" };
    if (!isIsoDate(spec.horizon.startDate) || !isIsoDate(spec.horizon.endDate) ||
      spec.horizon.endDate < spec.horizon.startDate || !isNonEmptyString(spec.horizon.stepFrequency) ||
      !Number.isInteger(spec.horizon.stepCount) || spec.horizon.stepCount < 1) {
      return { ok: false, reason: "horizon" };
    }
    if (!Number.isInteger(spec.pathCount) || spec.pathCount < 1) return { ok: false, reason: "path-count" };
    if (!Number.isInteger(spec.chunkSize) || spec.chunkSize < 1) return { ok: false, reason: "chunk-size" };
    if (!hasExactKeys(spec.parameterPolicy, SCENARIO_PARAMETER_POLICY_KEYS)) return { ok: false, reason: "spec-keys-exact" };
    if (!Number.isInteger(spec.parameterPolicy.drawCount) || spec.parameterPolicy.drawCount < 1 ||
      !Array.isArray(spec.parameterPolicy.ranges) || spec.parameterPolicy.ranges.length === 0 ||
      !Array.isArray(spec.parameterPolicy.distributions) || spec.parameterPolicy.distributions.length === 0 ||
      !isNonEmptyString(spec.parameterPolicy.gridIdentity)) {
      return { ok: false, reason: "parameter-policy" };
    }
    for (var r = 0; r < spec.parameterPolicy.ranges.length; r += 1) {
      var range = spec.parameterPolicy.ranges[r];
      if (!hasExactKeys(range, SCENARIO_PARAMETER_RANGE_KEYS)) return { ok: false, reason: "spec-keys-exact" };
      if (!isNonEmptyString(range.parameter) || !isNum(range.low) || !isNum(range.high) || range.high < range.low) {
        return { ok: false, reason: "drift-range" };
      }
    }
    for (var d = 0; d < spec.parameterPolicy.distributions.length; d += 1) {
      var distribution = spec.parameterPolicy.distributions[d];
      if (!hasExactKeys(distribution, SCENARIO_PARAMETER_DISTRIBUTION_KEYS)) {
        return { ok: false, reason: "spec-keys-exact" };
      }
      if (!isNonEmptyString(distribution.parameter) || !isNonEmptyString(distribution.family) ||
        !isPlainObject(distribution.parameters)) return { ok: false, reason: "parameter-distribution" };
    }
    if (!hasExactKeys(spec.rebalancePolicy, SCENARIO_REBALANCE_KEYS)) return { ok: false, reason: "spec-keys-exact" };
    if (!isNonEmptyString(spec.rebalancePolicy.family) || !isNullableString(spec.rebalancePolicy.frequency)) {
      return { ok: false, reason: "rebalance-policy" };
    }
    if (!hasExactKeys(spec.costPolicy, SCENARIO_COST_KEYS)) return { ok: false, reason: "spec-keys-exact" };
    if (!isNonEmptyString(spec.costPolicy.currency) || !isNum(spec.costPolicy.recurringFraction) ||
      spec.costPolicy.recurringFraction < 0 ||
      ["start-of-step", "end-of-step"].indexOf(spec.costPolicy.timing) === -1) {
      return { ok: false, reason: "cost-policy" };
    }
    if (!Array.isArray(spec.contributions) || !Array.isArray(spec.withdrawals) || !Array.isArray(spec.cashNeeds)) {
      return { ok: false, reason: "flow-policy" };
    }
    var flowGroups = [
      { records: spec.contributions, keys: SCENARIO_FLOW_KEYS },
      { records: spec.withdrawals, keys: SCENARIO_FLOW_KEYS },
      { records: spec.cashNeeds, keys: SCENARIO_CASH_NEED_KEYS }
    ];
    for (var fg = 0; fg < flowGroups.length; fg += 1) {
      for (var fr = 0; fr < flowGroups[fg].records.length; fr += 1) {
        if (!hasExactKeys(flowGroups[fg].records[fr], flowGroups[fg].keys)) {
          return { ok: false, reason: "spec-keys-exact" };
        }
      }
    }
    if (!validateScenarioFlowRecords(spec.contributions, SCENARIO_FLOW_KEYS, false) ||
      !validateScenarioFlowRecords(spec.withdrawals, SCENARIO_FLOW_KEYS, false) ||
      !validateScenarioFlowRecords(spec.cashNeeds, SCENARIO_CASH_NEED_KEYS, true)) {
      return { ok: false, reason: "flow-policy" };
    }
    if (!hasExactKeys(spec.survivalDefinition, SCENARIO_SURVIVAL_KEYS)) {
      return { ok: false, reason: "spec-keys-exact" };
    }
    if (["available", "unavailable"].indexOf(spec.survivalDefinition.state) === -1 ||
      !isNum(spec.survivalDefinition.floorValue) || spec.survivalDefinition.floorValue < 0 ||
      !isNonEmptyString(spec.survivalDefinition.condition) ||
      !isNonEmptyString(spec.survivalDefinition.cashNeedPolicy) ||
      !isNonEmptyString(spec.survivalDefinition.currency) ||
      !isNum(spec.survivalDefinition.startingValue) || spec.survivalDefinition.startingValue <= 0) {
      return { ok: false, reason: "starting-value" };
    }
    if (!hasExactKeys(spec.uncertaintyPolicy, SCENARIO_UNCERTAINTY_KEYS)) {
      return { ok: false, reason: "spec-keys-exact" };
    }
    if (!isNonEmptyString(spec.uncertaintyPolicy.intervalMethod) ||
      !Array.isArray(spec.uncertaintyPolicy.quantiles) || spec.uncertaintyPolicy.quantiles.length !== 3 ||
      !spec.uncertaintyPolicy.quantiles.every(function (value) { return isNum(value) && value >= 0 && value <= 1; }) ||
      spec.uncertaintyPolicy.quantiles[0] > spec.uncertaintyPolicy.quantiles[1] ||
      spec.uncertaintyPolicy.quantiles[1] > spec.uncertaintyPolicy.quantiles[2] ||
      typeof spec.uncertaintyPolicy.separatePathAndParameter !== "boolean") {
      return { ok: false, reason: "uncertainty-policy" };
    }
    return { ok: true };
  }

  function canonicalScenarioValue(value) {
    if (Array.isArray(value)) return "[" + value.map(canonicalScenarioValue).join(",") + "]";
    if (isPlainObject(value)) {
      return "{" + Object.keys(value).sort().map(function (key) {
        return JSON.stringify(key) + ":" + canonicalScenarioValue(value[key]);
      }).join(",") + "}";
    }
    return JSON.stringify(value);
  }

  /** Stable identity over every field that changes the result. */
  function scenarioIdentity(spec) {
    var check = validateScenarioSpecification(spec);
    if (!check.ok) return null;
    return SCENARIO_KEYS.map(function (key) {
      return key + "=" + canonicalScenarioValue(spec[key]);
    }).join("|") +
      "|meanBlockSessions=" + spec.method.blockPolicy.meanBlockSessions +
      "|horizonSessions=" + spec.horizon.stepCount;
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

  function scenarioMethodState(spec) {
    var check = validateScenarioSpecification(spec);
    if (!check.ok) return null;
    return {
      family: spec.method.family,
      state: spec.method.availability.state,
      reason: spec.method.availability.reason,
      calibrationIdentity: spec.method.calibrationIdentity
    };
  }

  function scenarioComputeFailure(code, details) {
    var error = { contractVersion: "PortfolioError/v1", code: code };
    Object.keys(details || {}).forEach(function (key) { error[key] = details[key]; });
    return { state: "error", error: error };
  }

  function scenarioBudget(spec, options) {
    var requested = spec.pathCount * spec.parameterPolicy.drawCount;
    var budget = requested;
    if (options && Number.isInteger(options.maximumWorkUnits)) budget = options.maximumWorkUnits;
    else if (options && Number.isInteger(options.maximumPaths)) budget = options.maximumPaths;
    if (budget < requested) {
      return scenarioComputeFailure("P008-COMPUTE-BUDGET", {
        requestedWorkUnits: requested,
        budgetWorkUnits: budget
      });
    }
    return { state: "ok", requestedWorkUnits: requested, budgetWorkUnits: budget };
  }

  function scenarioParameterRange(spec, parameter) {
    for (var i = 0; i < spec.parameterPolicy.ranges.length; i += 1) {
      if (spec.parameterPolicy.ranges[i].parameter === parameter) return spec.parameterPolicy.ranges[i];
    }
    return null;
  }

  function scenarioParameterValues(spec) {
    var range = scenarioParameterRange(spec, "drift");
    return range ? parameterGrid(range, spec.parameterPolicy.drawCount) : null;
  }

  function scenarioSessionDates(spec) {
    var dates = [spec.horizon.startDate];
    var cursor = new Date(spec.horizon.startDate + "T00:00:00.000Z");
    while (dates.length <= spec.horizon.stepCount) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      if (spec.horizon.stepFrequency === "business-day") {
        var day = cursor.getUTCDay();
        if (day === 0 || day === 6) continue;
      }
      dates.push(cursor.toISOString().slice(0, 10));
    }
    return dates;
  }

  function scenarioPathSeed(spec, pathIndex) {
    return (spec.seed ^ Math.imul(pathIndex + 1, 0x9e3779b1)) >>> 0;
  }

  function scenarioPathIndices(spec, sampleSize, pathIndex) {
    var random = mulberry32(scenarioPathSeed(spec, pathIndex));
    if (spec.method.family === "iid-comparison") {
      return iidIndices(sampleSize, spec.horizon.stepCount, random);
    }
    return stationaryBootstrapIndices(
      sampleSize,
      spec.horizon.stepCount,
      spec.method.blockPolicy.meanBlockSessions,
      random
    );
  }

  function scenarioBasePath(spec, sampleReturns, pathIndex, drift) {
    var indices = scenarioPathIndices(spec, sampleReturns.length, pathIndex);
    var values = [spec.survivalDefinition.startingValue];
    for (var i = 0; i < indices.length; i += 1) {
      values.push(values[values.length - 1] * (1 + sampleReturns[indices[i]] + drift));
    }
    return { indices: indices, values: values };
  }

  function firstScenarioSessionOnOrAfter(date, sessionDates) {
    for (var i = 0; i < sessionDates.length; i += 1) {
      if (sessionDates[i] >= date) return i;
    }
    return -1;
  }

  function scenarioScheduledEvents(spec, sessionDates) {
    var scheduled = [];
    var rejected = [];
    var add = function (records, kind) {
      records.forEach(function (record) {
        var session = firstScenarioSessionOnOrAfter(record.date, sessionDates);
        if (session < 0) {
          rejected.push({ localId: record.localId, reason: "out-of-horizon", declaredDate: record.date });
          return;
        }
        scheduled.push({
          kind: kind,
          localId: record.localId,
          amount: record.amount,
          currency: record.currency,
          declaredDate: record.date,
          modeledDate: sessionDates[session],
          session: session,
          timing: record.timing,
          label: record.label,
          priority: kind === "cash-need" ? record.priority : null,
          treatment: kind === "cash-need" ? record.treatment : null
        });
      });
    };
    add(spec.contributions, "contribution");
    add(spec.withdrawals, "withdrawal");
    add(spec.cashNeeds, "cash-need");
    return { scheduled: scheduled, rejected: rejected };
  }

  function scenarioEventRank(event) {
    return { cost: 0, contribution: 1, withdrawal: 2, "cash-need": 3 }[event.kind];
  }

  function sortScenarioEvents(events) {
    return events.slice().sort(function (a, b) {
      var rank = scenarioEventRank(a) - scenarioEventRank(b);
      if (rank !== 0) return rank;
      return a.localId < b.localId ? -1 : (a.localId > b.localId ? 1 : 0);
    });
  }

  function scenarioCostEvent(spec, session, modeledDate) {
    return {
      kind: "cost",
      localId: "recurring-cost",
      amount: null,
      currency: spec.costPolicy.currency,
      declaredDate: modeledDate,
      modeledDate: modeledDate,
      session: session,
      timing: spec.costPolicy.timing,
      label: "Recurring cost",
      priority: null,
      treatment: "recurring-fraction"
    };
  }

  function scenarioMetrics(values, events, survivalDefinition) {
    var peak = values[0];
    var maximumDrawdown = 0;
    var timeUnderWater = 0;
    var underwater = false;
    var recovery = null;
    var firstFloorBreach = null;
    for (var i = 0; i < values.length; i += 1) {
      if (values[i] > peak) {
        peak = values[i];
        if (underwater && recovery === null) recovery = i;
        underwater = false;
      } else if (values[i] < peak) {
        underwater = true;
        timeUnderWater += 1;
        maximumDrawdown = Math.max(maximumDrawdown, (peak - values[i]) / peak);
      }
      if (firstFloorBreach === null && values[i] < survivalDefinition.floorValue) firstFloorBreach = i;
    }
    var cashNeedEvents = events.filter(function (event) { return event.kind === "cash-need"; });
    var firstCollision = null;
    cashNeedEvents.forEach(function (event) {
      if (firstCollision === null && event.duringDrawdown) firstCollision = event.session;
    });
    var fundedFraction = cashNeedEvents.length
      ? mean(cashNeedEvents.map(function (event) { return event.fundedFraction; }))
      : 1;
    return {
      terminalWealth: values[values.length - 1],
      maximumDrawdown: maximumDrawdown,
      timeUnderWater: timeUnderWater,
      recovery: recovery,
      firstFloorBreach: firstFloorBreach,
      cashNeedFundedFraction: fundedFraction,
      firstCollision: firstCollision,
      infeasibility: cashNeedEvents.some(function (event) { return event.fundedFraction < 1; })
    };
  }

  function applyScenarioFlows(spec, baseValues, sessionDates) {
    if (!Array.isArray(baseValues) || baseValues.length !== spec.horizon.stepCount + 1 ||
      !baseValues.every(isNum)) return { state: "path-invalid" };
    var schedule = scenarioScheduledEvents(spec, sessionDates);
    var capital = baseValues[0];
    var peak = capital;
    var values = [];
    var events = [];
    var applyEvents = function (candidates) {
      sortScenarioEvents(candidates).forEach(function (event) {
        var before = capital;
        var requested = event.kind === "cost"
          ? Math.max(capital, 0) * spec.costPolicy.recurringFraction
          : event.amount;
        var applied = requested;
        if (event.kind === "contribution") capital += applied;
        else {
          applied = Math.min(requested, Math.max(capital, 0));
          capital -= applied;
        }
        var fundedFraction = requested === 0 ? 1 : applied / requested;
        events.push({
          kind: event.kind,
          localId: event.localId,
          label: event.label,
          timing: event.timing,
          session: event.session,
          declaredDate: event.declaredDate,
          modeledDate: event.modeledDate,
          requestedAmount: requested,
          appliedAmount: applied,
          capitalBefore: before,
          capitalAfter: capital,
          fundedFraction: fundedFraction,
          duringDrawdown: before < peak,
          priority: event.priority,
          treatment: event.treatment
        });
        if (capital > peak) peak = capital;
      });
    };
    for (var session = 0; session < baseValues.length; session += 1) {
      var scheduled = schedule.scheduled.filter(function (event) { return event.session === session; });
      var starts = scheduled.filter(function (event) { return event.timing === "start-of-step"; });
      var ends = scheduled.filter(function (event) { return event.timing === "end-of-step"; });
      if (session > 0 && spec.costPolicy.recurringFraction > 0 && spec.costPolicy.timing === "start-of-step") {
        starts.push(scenarioCostEvent(spec, session, sessionDates[session]));
      }
      applyEvents(starts);
      if (session > 0) {
        var growth = baseValues[session - 1] === 0 ? 0 : baseValues[session] / baseValues[session - 1] - 1;
        capital *= 1 + growth;
        if (capital > peak) peak = capital;
      }
      if (session > 0 && spec.costPolicy.recurringFraction > 0 && spec.costPolicy.timing === "end-of-step") {
        ends.push(scenarioCostEvent(spec, session, sessionDates[session]));
      }
      applyEvents(ends);
      values.push(capital);
    }
    return {
      state: "ok",
      values: values,
      events: events,
      cashNeedOutcomes: events.filter(function (event) { return event.kind === "cash-need"; }),
      rejectedEvents: schedule.rejected,
      metrics: scenarioMetrics(values, events, spec.survivalDefinition)
    };
  }

  function scenarioRandomPathId(spec, pathIndex) {
    return "random-path:" + stableRecordFingerprint({
      evidence: spec.evidenceSet.returnFingerprint,
      seed: spec.seed,
      block: spec.method.blockPolicy,
      horizon: spec.horizon,
      pathIndex: pathIndex
    });
  }

  function buildScenarioWorkItem(spec, sampleReturns, parameterValues, parameterIndex, pathIndex) {
    var drift = parameterValues[parameterIndex];
    var base = scenarioBasePath(spec, sampleReturns, pathIndex, drift);
    var applied = applyScenarioFlows(spec, base.values, scenarioSessionDates(spec));
    return {
      parameterIndex: parameterIndex,
      pathIndex: pathIndex,
      pathId: scenarioRandomPathId(spec, pathIndex),
      parameterValues: { drift: drift },
      baseIndices: base.indices,
      baseValues: base.values,
      state: applied.state,
      values: applied.values,
      events: applied.events,
      cashNeedOutcomes: applied.cashNeedOutcomes,
      rejectedEvents: applied.rejectedEvents,
      metrics: applied.metrics
    };
  }

  function tokenFailure(token) {
    if (token.state === "cancel-requested" || token.state === "cancelled") {
      return scenarioComputeFailure("P008-COMPUTE-CANCELLED", { tokenId: token.tokenId });
    }
    if (token.state === "superseded") {
      return scenarioComputeFailure("P008-COMPUTE-SUPERSEDED", { tokenId: token.tokenId });
    }
    return null;
  }

  function runScenarioChunk(spec, token, cursor, context) {
    var check = validateScenarioSpecification(spec);
    if (!check.ok) return { state: "spec-invalid", reason: check.reason };
    if (!token || token.contractVersion !== "ComputeToken/v1") return scenarioComputeFailure("P008-INTERNAL", { reason: "token-invalid" });
    var identity = scenarioIdentity(spec);
    if (token.workspaceIdentity !== spec.workspaceIdentity || token.scenarioIdentity !== identity) {
      return scenarioComputeFailure("P008-COMPUTE-SUPERSEDED", { tokenId: token.tokenId });
    }
    var terminal = tokenFailure(token);
    if (terminal) return terminal;
    var budget = scenarioBudget(spec, context || {});
    if (budget.state !== "ok") return budget;
    if (!context || !Array.isArray(context.sampleReturns) || context.sampleReturns.length < 2) {
      return { state: "insufficient-sample" };
    }
    if (!context.sampleReturns.every(isNum)) return { state: "non-finite-input" };
    var start = cursor && Number.isInteger(cursor.workIndex) ? cursor.workIndex : 0;
    if (start < 0 || start > budget.requestedWorkUnits) return scenarioComputeFailure("P008-INTERNAL", { reason: "cursor-invalid" });
    var end = Math.min(start + spec.chunkSize, budget.requestedWorkUnits);
    var parameterValues = scenarioParameterValues(spec);
    if (!parameterValues) return { state: "spec-invalid", reason: "parameter-policy" };
    var work = [];
    for (var workIndex = start; workIndex < end; workIndex += 1) {
      var parameterIndex = Math.floor(workIndex / spec.pathCount);
      var pathIndex = workIndex % spec.pathCount;
      work.push(buildScenarioWorkItem(spec, context.sampleReturns, parameterValues, parameterIndex, pathIndex));
    }
    return {
      state: "ok",
      tokenId: token.tokenId,
      scenarioIdentity: identity,
      work: work,
      nextCursor: end < budget.requestedWorkUnits ? { workIndex: end } : null,
      completed: end === budget.requestedWorkUnits,
      completedWorkUnits: end,
      requestedWorkUnits: budget.requestedWorkUnits
    };
  }

  function distributionRecord(values, intervalMethod) {
    var finite = values.map(function (value) { return typeof value === "boolean" ? (value ? 1 : 0) : value; })
      .filter(isNum).sort(function (a, b) { return a - b; });
    return {
      state: finite.length === 0 ? "unavailable" : (finite.length === values.length ? "ok" : "partial"),
      count: values.length,
      finiteCount: finite.length,
      quantiles: {
        p05: percentile(finite, 0.05),
        p50: percentile(finite, 0.5),
        p95: percentile(finite, 0.95)
      },
      minimum: finite.length ? finite[0] : null,
      maximum: finite.length ? finite[finite.length - 1] : null,
      intervalMethod: intervalMethod
    };
  }

  function sequenceExamples(records) {
    if (!records.length) return [];
    var ordered = records.slice().sort(function (a, b) { return a.metrics.terminalWealth - b.metrics.terminalWealth; });
    var choices = [
      { role: "lower-terminal-example", record: ordered[0] },
      { role: "median-terminal-example", record: ordered[Math.floor((ordered.length - 1) / 2)] },
      { role: "upper-terminal-example", record: ordered[ordered.length - 1] }
    ];
    var seen = {};
    return choices.filter(function (choice) {
      var id = choice.record.pathId;
      if (seen[id]) return false;
      seen[id] = true;
      return true;
    }).map(function (choice) {
      return {
        role: choice.role,
        pathId: choice.record.pathId,
        terminalWealth: choice.record.metrics.terminalWealth,
        values: choice.record.values.slice()
      };
    });
  }

  function distributionSource(records, spec) {
    var intervalMethod = spec.uncertaintyPolicy.intervalMethod;
    var wealthByHorizon = [];
    for (var session = 0; session <= spec.horizon.stepCount; session += 1) {
      wealthByHorizon.push(distributionRecord(records.map(function (record) { return record.values[session]; }), intervalMethod));
    }
    var outcome = function (key) {
      return distributionRecord(records.map(function (record) { return record.metrics[key]; }), intervalMethod);
    };
    return {
      state: records.length ? "ok" : "unavailable",
      count: records.length,
      finiteCount: records.filter(function (record) { return isNum(record.metrics.terminalWealth); }).length,
      intervalMethod: intervalMethod,
      outcomes: {
        wealthByHorizon: wealthByHorizon,
        terminalWealth: outcome("terminalWealth"),
        maximumDrawdown: outcome("maximumDrawdown"),
        timeUnderWater: outcome("timeUnderWater"),
        recovery: outcome("recovery"),
        firstFloorBreach: outcome("firstFloorBreach"),
        cashNeedFundedFraction: outcome("cashNeedFundedFraction"),
        firstCollision: outcome("firstCollision"),
        infeasibility: outcome("infeasibility"),
        sequenceExamples: sequenceExamples(records)
      }
    };
  }

  function parameterMarginalRecords(work, spec) {
    var records = [];
    for (var parameterIndex = 0; parameterIndex < spec.parameterPolicy.drawCount; parameterIndex += 1) {
      var group = work.filter(function (item) { return item.parameterIndex === parameterIndex; });
      var values = [];
      for (var session = 0; session <= spec.horizon.stepCount; session += 1) {
        var atSession = group.map(function (item) { return item.values[session]; }).sort(function (a, b) { return a - b; });
        values.push(percentile(atSession, 0.5));
      }
      var metric = function (key) {
        var entries = group.map(function (item) {
          return typeof item.metrics[key] === "boolean" ? (item.metrics[key] ? 1 : 0) : item.metrics[key];
        }).filter(isNum).sort(function (a, b) { return a - b; });
        return percentile(entries, 0.5);
      };
      records.push({
        pathId: "parameter-marginal:" + parameterIndex,
        values: values,
        metrics: {
          terminalWealth: metric("terminalWealth"),
          maximumDrawdown: metric("maximumDrawdown"),
          timeUnderWater: metric("timeUnderWater"),
          recovery: metric("recovery"),
          firstFloorBreach: metric("firstFloorBreach"),
          cashNeedFundedFraction: metric("cashNeedFundedFraction"),
          firstCollision: metric("firstCollision"),
          infeasibility: metric("infeasibility")
        }
      });
    }
    return records;
  }

  function buildScenarioDistributionSet(spec, identity, conditional, parameterMarginal, combined) {
    return {
      contractVersion: "ScenarioDistributionSet/v1",
      scenarioIdentity: identity,
      conditionalPath: distributionSource(conditional, spec),
      parameterMarginal: distributionSource(parameterMarginal, spec),
      combined: distributionSource(combined, spec)
    };
  }

  function validateDistributionRecord(record) {
    return hasExactKeys(record, ["state", "count", "finiteCount", "quantiles", "minimum", "maximum", "intervalMethod"]) &&
      hasExactKeys(record.quantiles, ["p05", "p50", "p95"]);
  }

  function validateDistributionSource(source, spec) {
    if (!hasExactKeys(source, ["state", "count", "finiteCount", "intervalMethod", "outcomes"])) return false;
    var outcomeKeys = [
      "wealthByHorizon", "terminalWealth", "maximumDrawdown", "timeUnderWater", "recovery",
      "firstFloorBreach", "cashNeedFundedFraction", "firstCollision", "infeasibility", "sequenceExamples"
    ];
    if (!hasExactKeys(source.outcomes, outcomeKeys) ||
      !Array.isArray(source.outcomes.wealthByHorizon) ||
      source.outcomes.wealthByHorizon.length !== spec.horizon.stepCount + 1 ||
      !source.outcomes.wealthByHorizon.every(validateDistributionRecord) ||
      !Array.isArray(source.outcomes.sequenceExamples)) return false;
    return outcomeKeys.filter(function (key) {
      return key !== "wealthByHorizon" && key !== "sequenceExamples";
    }).every(function (key) { return validateDistributionRecord(source.outcomes[key]); });
  }

  function validateScenarioDistributionSet(set, spec) {
    if (!hasExactKeys(set, ["contractVersion", "scenarioIdentity", "conditionalPath", "parameterMarginal", "combined"])) {
      return { ok: false, reason: "distribution-keys-exact" };
    }
    if (set.contractVersion !== "ScenarioDistributionSet/v1") return { ok: false, reason: "distribution-contract-version" };
    if (set.scenarioIdentity !== scenarioIdentity(spec)) return { ok: false, reason: "distribution-identity" };
    if (!validateDistributionSource(set.conditionalPath, spec) ||
      !validateDistributionSource(set.parameterMarginal, spec) ||
      !validateDistributionSource(set.combined, spec)) return { ok: false, reason: "distribution-shape" };
    if (set.conditionalPath.count !== spec.pathCount ||
      set.parameterMarginal.count !== spec.parameterPolicy.drawCount ||
      set.combined.count !== spec.pathCount * spec.parameterPolicy.drawCount) {
      return { ok: false, reason: "distribution-count" };
    }
    return { ok: true };
  }

  function fanBandsFromPaths(paths, stepCount) {
    var bands = [];
    for (var session = 0; session <= stepCount; session += 1) {
      var values = paths.map(function (path) { return path.values[session]; }).sort(function (a, b) { return a - b; });
      bands.push({
        session: session,
        p05: percentile(values, 0.05),
        p50: percentile(values, 0.5),
        p95: percentile(values, 0.95)
      });
    }
    return bands;
  }

  function assembleScenarioResult(spec, work) {
    var identity = scenarioIdentity(spec);
    var centralParameterIndex = Math.floor((spec.parameterPolicy.drawCount - 1) / 2);
    var conditional = work.filter(function (item) { return item.parameterIndex === centralParameterIndex; })
      .sort(function (a, b) { return a.pathIndex - b.pathIndex; });
    var parameterMarginal = parameterMarginalRecords(work, spec);
    var distributionSet = buildScenarioDistributionSet(spec, identity, conditional, parameterMarginal, work);
    var terminal = conditional.map(function (path) { return path.metrics.terminalWealth; }).sort(function (a, b) { return a - b; });
    var parameterTerminals = parameterMarginal.map(function (path) { return path.metrics.terminalWealth; }).sort(function (a, b) { return a - b; });
    var combinedTerminals = work.map(function (path) { return path.metrics.terminalWealth; }).sort(function (a, b) { return a - b; });
    var survivalDefinition = spec.survivalDefinition.state === "available" ? {
      floorValue: spec.survivalDefinition.floorValue,
      horizonSessions: spec.horizon.stepCount,
      currency: spec.survivalDefinition.currency,
      startingValue: spec.survivalDefinition.startingValue
    } : null;
    var survival = computeSurvival(survivalDefinition, conditional.map(function (path) { return path.values; }));
    var method = scenarioMethodState(spec);
    var driftRange = scenarioParameterRange(spec, "drift");
    return {
      state: "ok",
      identity: identity,
      scenarioSpecification: cloneData(spec),
      method: spec.method.family,
      methodAvailability: method,
      methodNote: spec.method.family === "iid-comparison"
        ? "IID resampling is an independence simplification: it discards the serial dependence that produces clustered drawdowns."
        : "Stationary bootstrap with geometric blocks and cyclic wrap, preserving short-run dependence.",
      meanBlockSessions: spec.method.blockPolicy.meanBlockSessions,
      horizonSessions: spec.horizon.stepCount,
      startingValue: spec.survivalDefinition.startingValue,
      pathCount: spec.pathCount,
      parameterDrawCount: spec.parameterPolicy.drawCount,
      workUnitCount: work.length,
      commonRandomStreams: true,
      paths: conditional,
      fanBands: fanBandsFromPaths(conditional, spec.horizon.stepCount),
      survival: survival,
      distributionSet: distributionSet,
      pathRandomness: {
        label: "Path randomness at the central assumption",
        drift: scenarioParameterValues(spec)[centralParameterIndex],
        p05: percentile(terminal, 0.05),
        p50: percentile(terminal, 0.5),
        p95: percentile(terminal, 0.95)
      },
      parameterUncertainty: {
        label: "Across-parameter dispersion of the median outcome",
        gridLow: driftRange.low,
        gridHigh: driftRange.high,
        medianLow: parameterTerminals[0],
        medianHigh: parameterTerminals[parameterTerminals.length - 1],
        failureRateLow: distributionSet.parameterMarginal.outcomes.infeasibility.minimum,
        failureRateHigh: distributionSet.parameterMarginal.outcomes.infeasibility.maximum
      },
      combined: {
        label: "Combined path and parameter distribution",
        p05: percentile(combinedTerminals, 0.05),
        p50: percentile(combinedTerminals, 0.5),
        p95: percentile(combinedTerminals, 0.95)
      },
      influence: {
        assumption: "drift",
        rangeLow: driftRange.low,
        rangeHigh: driftRange.high,
        medianSpread: parameterTerminals[parameterTerminals.length - 1] - parameterTerminals[0]
      },
      representativePathIsExample: true,
      noExpectedPathClaim: "No path here is the expected future. The fan is a distribution of resampled histories, not a forecast."
    };
  }

  function validateScenarioResult(result, spec) {
    if (!result || result.state !== "ok" || !isNonEmptyString(result.identity)) return { ok: false, reason: "result-identity" };
    if (result.identity !== scenarioIdentity(spec)) return { ok: false, reason: "result-identity" };
    if (!Array.isArray(result.paths) || result.paths.length !== spec.pathCount) return { ok: false, reason: "result-path-count" };
    for (var i = 0; i < result.paths.length; i += 1) {
      if (!Array.isArray(result.paths[i].values) || result.paths[i].values.length !== spec.horizon.stepCount + 1) {
        return { ok: false, reason: "result-horizon" };
      }
    }
    if (!result.survival) return { ok: false, reason: "result-survival" };
    if (spec.survivalDefinition.state === "available") {
      if (result.survival.state !== "ok" || result.survival.pathCount !== spec.pathCount) {
        return { ok: false, reason: "result-survival-path-count" };
      }
    } else if (result.survival.state !== "unavailable" ||
      Object.prototype.hasOwnProperty.call(result.survival, "survivalProbability")) {
      return { ok: false, reason: "result-survival-unavailable" };
    }
    var distributionCheck = validateScenarioDistributionSet(result.distributionSet, spec);
    if (!distributionCheck.ok) return distributionCheck;
    return { ok: true };
  }

  function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createScenarioComputeController(options) {
    var workspaceIdentity = options && options.workspaceIdentity;
    var lastValidViewModel = options && options.lastValidViewModel ? cloneData(options.lastValidViewModel) : null;
    var tokens = {};
    var activeTokenId = null;
    var nextOrdinal = 1;
    var issue = function (spec, details) {
      if (activeTokenId && tokens[activeTokenId] &&
        ["issued", "running", "cancel-requested"].indexOf(tokens[activeTokenId].state) !== -1) {
        tokens[activeTokenId].state = "superseded";
      }
      var token = {
        contractVersion: "ComputeToken/v1",
        tokenId: details.tokenId,
        ordinal: nextOrdinal,
        workspaceIdentity: workspaceIdentity,
        scenarioIdentity: scenarioIdentity(spec),
        issuedAt: details.issuedAt,
        state: "issued"
      };
      nextOrdinal += 1;
      tokens[token.tokenId] = token;
      activeTokenId = token.tokenId;
      return cloneData(token);
    };
    return {
      issue: issue,
      start: function (tokenId) {
        if (tokens[tokenId] && tokens[tokenId].state === "issued") tokens[tokenId].state = "running";
        return tokens[tokenId] ? cloneData(tokens[tokenId]) : null;
      },
      requestCancel: function (tokenId) {
        if (tokens[tokenId] && ["issued", "running"].indexOf(tokens[tokenId].state) !== -1) {
          tokens[tokenId].state = "cancel-requested";
        }
        return tokens[tokenId] ? cloneData(tokens[tokenId]) : null;
      },
      token: function (tokenId) { return tokens[tokenId] ? cloneData(tokens[tokenId]) : null; },
      settle: function (failure) {
        var tokenId = failure && failure.error && failure.error.tokenId;
        if (!tokens[tokenId]) return null;
        if (failure.error.code === "P008-COMPUTE-CANCELLED") tokens[tokenId].state = "cancelled";
        else if (failure.error.code === "P008-COMPUTE-SUPERSEDED") tokens[tokenId].state = "superseded";
        else tokens[tokenId].state = "failed";
        return cloneData(tokens[tokenId]);
      },
      publish: function (tokenId, result) {
        var token = tokens[tokenId];
        if (!token || tokenId !== activeTokenId || token.state === "superseded" ||
          token.scenarioIdentity !== result.scenarioIdentity && token.scenarioIdentity !== result.identity) {
          return scenarioComputeFailure("P008-COMPUTE-SUPERSEDED", { tokenId: tokenId });
        }
        var resultCheck = validateScenarioResult(result, result.scenarioSpecification);
        if (!resultCheck.ok) {
          token.state = "failed";
          return scenarioComputeFailure("P008-INTERNAL", { tokenId: tokenId, reason: resultCheck.reason });
        }
        token.state = "completed";
        lastValidViewModel = { scenarioIdentity: result.identity, result: cloneData(result) };
        return { state: "ok", token: cloneData(token), lastValidViewModel: cloneData(lastValidViewModel) };
      },
      snapshot: function () {
        return {
          activeTokenId: activeTokenId,
          activeToken: activeTokenId && tokens[activeTokenId] ? cloneData(tokens[activeTokenId]) : null,
          lastValidViewModel: lastValidViewModel ? cloneData(lastValidViewModel) : null
        };
      }
    };
  }

  function runCompleteScenario(spec, sampleReturns, options) {
    var check = validateScenarioSpecification(spec);
    if (!check.ok) return { state: "spec-invalid", reason: check.reason };
    if (!Array.isArray(sampleReturns) || sampleReturns.length < 2) return { state: "insufficient-sample" };
    if (!sampleReturns.every(isNum)) return { state: "non-finite-input" };
    var method = scenarioMethodState(spec);
    if (method.state !== "calibrated") return { state: "method-unavailable", methodAvailability: method };
    var budget = scenarioBudget(spec, options || {});
    if (budget.state !== "ok") return budget;
    var identity = scenarioIdentity(spec);
    var token = {
      contractVersion: "ComputeToken/v1",
      tokenId: "synchronous:" + identity,
      ordinal: 0,
      workspaceIdentity: spec.workspaceIdentity,
      scenarioIdentity: identity,
      issuedAt: "synchronous",
      state: "running"
    };
    var cursor = { workIndex: 0 };
    var work = [];
    do {
      var chunk = runScenarioChunk(spec, token, cursor, {
        sampleReturns: sampleReturns,
        maximumWorkUnits: budget.budgetWorkUnits
      });
      if (chunk.state !== "ok") return chunk;
      work = work.concat(chunk.work);
      cursor = chunk.nextCursor;
    } while (cursor);
    return assembleScenarioResult(spec, work);
  }

  async function runScenarioJob(spec, sampleReturns, options) {
    var controller = options && options.controller;
    var tokenId = options && options.tokenId;
    if (!controller || !isNonEmptyString(tokenId)) return scenarioComputeFailure("P008-INTERNAL", { reason: "controller-required" });
    var token = controller.start(tokenId);
    if (!token) return scenarioComputeFailure("P008-INTERNAL", { reason: "token-unknown" });
    var cursor = { workIndex: 0 };
    var work = [];
    do {
      token = controller.token(tokenId);
      var chunk = runScenarioChunk(spec, token, cursor, {
        sampleReturns: sampleReturns,
        maximumWorkUnits: options.maximumWorkUnits
      });
      if (chunk.state !== "ok") {
        controller.settle(chunk);
        return chunk;
      }
      work = work.concat(chunk.work);
      if (typeof options.onChunk === "function") await options.onChunk(chunk);
      token = controller.token(tokenId);
      var settled = tokenFailure(token);
      if (settled) {
        controller.settle(settled);
        return settled;
      }
      cursor = chunk.nextCursor;
      if (cursor) await new Promise(function (resolve) { setTimeout(resolve, 0); });
    } while (cursor);
    var result = assembleScenarioResult(spec, work);
    var publication = controller.publish(tokenId, result);
    if (publication.state !== "ok") {
      controller.settle(publication);
      return publication;
    }
    return result;
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
    if (input && input.contractVersion === "ForbesRigobonRequest/v1") {
      return qualifiedForbesRigobonAdjustment(input);
    }
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
     Scope 23 - complete dependence, appraisal, and hedge contracts
     --------------------------------------------------------------------- */

  var DEPENDENCE_SAMPLE_INPUT_KEYS = [
    "a", "b", "contractVersion", "cutoff", "definitionKind", "memberDates",
    "pair", "sampleId", "searchedVariantCount", "selectionRule", "sourceFingerprints"
  ];
  var DEPENDENCE_SAMPLE_KEYS = [
    "a", "b", "contractVersion", "cutoff", "definitionKind", "firstDate", "lastDate",
    "memberDateFingerprint", "memberDates", "observationCount", "pair", "sampleId",
    "searchedVariantCount", "selectionRule", "sourceFingerprints", "state"
  ];
  var HEDGE_COST_INPUT_KEYS = [
    "carryFraction", "commissionFraction", "financingFraction", "liquidityFraction",
    "rebalanceCostFraction", "slippageFraction", "spreadFraction", "turnoverFraction"
  ];
  var HEDGE_COST_OUTPUT_KEYS = [
    "carry", "commission", "financing", "liquidity", "rebalance", "slippage", "spread", "turnover"
  ];

  function scope23ExactKeys(value, keys) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    var actual = Object.keys(value).sort();
    var expected = keys.slice().sort();
    if (actual.length !== expected.length) return false;
    for (var i = 0; i < expected.length; i += 1) {
      if (actual[i] !== expected[i]) return false;
    }
    return true;
  }

  function scope23Date(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    var parsed = new Date(value + "T00:00:00.000Z");
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }

  function stableRecordFingerprint(value) {
    var text = JSON.stringify(value);
    var hash = 14695981039346656037n;
    var prime = 1099511628211n;
    for (var i = 0; i < text.length; i += 1) {
      hash ^= BigInt(text.charCodeAt(i));
      hash = BigInt.asUintN(64, hash * prime);
    }
    return "fnv1a64:" + hash.toString(16).padStart(16, "0");
  }

  function scope23Unavailable(reason, details) {
    var out = { state: "unavailable", reason: reason };
    Object.keys(details || {}).forEach(function (key) { out[key] = details[key]; });
    return out;
  }

  function buildDependenceSample(input) {
    if (!scope23ExactKeys(input, DEPENDENCE_SAMPLE_INPUT_KEYS)) {
      return scope23Unavailable("dependence-sample-shape-invalid");
    }
    if (input.contractVersion !== "DependenceSample/v1") {
      return scope23Unavailable("dependence-sample-version-invalid");
    }
    if (typeof input.sampleId !== "string" || !input.sampleId ||
        typeof input.definitionKind !== "string" || !input.definitionKind ||
        typeof input.selectionRule !== "string" || !input.selectionRule ||
        !scope23Date(input.cutoff)) {
      return scope23Unavailable("dependence-sample-identity-invalid");
    }
    if (!Array.isArray(input.memberDates) || input.memberDates.length < 2 ||
        !input.memberDates.every(scope23Date) ||
        input.memberDates.some(function (date, index) {
          return index > 0 && date <= input.memberDates[index - 1];
        })) {
      return scope23Unavailable("member-dates-invalid");
    }
    if (!Array.isArray(input.a) || !Array.isArray(input.b) ||
        input.a.length !== input.memberDates.length || input.b.length !== input.memberDates.length ||
        !input.a.every(isNum) || !input.b.every(isNum)) {
      return scope23Unavailable("aligned-returns-invalid");
    }
    if (!Array.isArray(input.sourceFingerprints) || input.sourceFingerprints.length !== 2 ||
        !input.sourceFingerprints.every(function (value) { return typeof value === "string" && Boolean(value); }) ||
        !scope23ExactKeys(input.pair, ["anchor", "dependent"]) ||
        typeof input.pair.anchor !== "string" || !input.pair.anchor ||
        typeof input.pair.dependent !== "string" || !input.pair.dependent ||
        input.pair.anchor === input.pair.dependent ||
        !Number.isInteger(input.searchedVariantCount) || input.searchedVariantCount < 1) {
      return scope23Unavailable("dependence-sample-provenance-invalid");
    }
    return {
      contractVersion: "DependenceSample/v1",
      state: "ok",
      sampleId: input.sampleId,
      definitionKind: input.definitionKind,
      memberDateFingerprint: stableRecordFingerprint(input.memberDates),
      sourceFingerprints: input.sourceFingerprints.slice(),
      firstDate: input.memberDates[0],
      lastDate: input.memberDates[input.memberDates.length - 1],
      observationCount: input.memberDates.length,
      selectionRule: input.selectionRule,
      cutoff: input.cutoff,
      searchedVariantCount: input.searchedVariantCount,
      pair: { anchor: input.pair.anchor, dependent: input.pair.dependent },
      memberDates: input.memberDates.slice(),
      a: input.a.slice(),
      b: input.b.slice()
    };
  }

  function validDependenceSample(sample) {
    return scope23ExactKeys(sample, DEPENDENCE_SAMPLE_KEYS) &&
      sample.contractVersion === "DependenceSample/v1" && sample.state === "ok" &&
      typeof sample.sampleId === "string" && Boolean(sample.sampleId) &&
      typeof sample.definitionKind === "string" && Boolean(sample.definitionKind) &&
      Array.isArray(sample.memberDates) && sample.memberDates.length >= 2 &&
      sample.memberDates.every(scope23Date) &&
      sample.memberDates.every(function (date, index) { return index === 0 || date > sample.memberDates[index - 1]; }) &&
      sample.memberDateFingerprint === stableRecordFingerprint(sample.memberDates) &&
      sample.firstDate === sample.memberDates[0] && sample.lastDate === sample.memberDates[sample.memberDates.length - 1] &&
      sample.observationCount === sample.memberDates.length &&
      Array.isArray(sample.a) && Array.isArray(sample.b) &&
      sample.a.length === sample.memberDates.length && sample.b.length === sample.memberDates.length &&
      sample.a.every(isNum) && sample.b.every(isNum) &&
      Array.isArray(sample.sourceFingerprints) && sample.sourceFingerprints.length === 2 &&
      sample.sourceFingerprints.every(function (value) { return typeof value === "string" && Boolean(value); }) &&
      scope23ExactKeys(sample.pair, ["anchor", "dependent"]) &&
      typeof sample.selectionRule === "string" && Boolean(sample.selectionRule) &&
      scope23Date(sample.cutoff) && Number.isInteger(sample.searchedVariantCount) && sample.searchedVariantCount >= 1;
  }

  function scope23SamplesDisjoint(first, second) {
    var members = {};
    first.memberDates.forEach(function (date) { members[date] = true; });
    return !second.memberDates.some(function (date) { return members[date]; });
  }

  function scope23SamePair(first, second) {
    return first.pair.anchor === second.pair.anchor && first.pair.dependent === second.pair.dependent &&
      first.sourceFingerprints[0] === second.sourceFingerprints[0] &&
      first.sourceFingerprints[1] === second.sourceFingerprints[1];
  }

  function validBlockBootstrapPolicy(policy) {
    return scope23ExactKeys(policy, ["blockLength", "confidence", "contractVersion", "drawCount", "seed"]) &&
      policy.contractVersion === "BlockBootstrapPolicy/v1" &&
      isNum(policy.confidence) && policy.confidence > 0 && policy.confidence < 1 &&
      Number.isInteger(policy.blockLength) && policy.blockLength >= 1 &&
      Number.isInteger(policy.drawCount) && policy.drawCount >= 2 &&
      Number.isInteger(policy.seed) && policy.seed >= 0;
  }

  function scope23BootstrapIndices(length, policy, draw) {
    var random = mulberry32((policy.seed + Math.imul(draw + 1, 2654435761)) >>> 0);
    var indices = [];
    while (indices.length < length) {
      var start = Math.floor(random() * length);
      for (var offset = 0; offset < policy.blockLength && indices.length < length; offset += 1) {
        indices.push((start + offset) % length);
      }
    }
    return indices;
  }

  function scope23Quantile(values, probability) {
    if (!values.length) return null;
    var sorted = values.slice().sort(function (a, b) { return a - b; });
    var position = probability * (sorted.length - 1);
    var low = Math.floor(position), high = Math.ceil(position);
    return sorted[low] + (sorted[high] - sorted[low]) * (position - low);
  }

  function scope23BootstrapInterval(estimate, sample, policy, estimator) {
    if (!validBlockBootstrapPolicy(policy)) return scope23Unavailable("bootstrap-policy-invalid");
    var draws = [];
    for (var draw = 0; draw < policy.drawCount; draw += 1) {
      var indices = scope23BootstrapIndices(sample.observationCount, policy, draw);
      var a = indices.map(function (index) { return sample.a[index]; });
      var b = indices.map(function (index) { return sample.b[index]; });
      var value = estimator(a, b);
      if (isNum(value)) draws.push(value);
    }
    if (draws.length < 2) return scope23Unavailable("bootstrap-degenerate");
    var deviations = draws.map(function (value) { return Math.abs(value - estimate); });
    var radius = scope23Quantile(deviations, policy.confidence);
    return {
      contractVersion: "BlockBootstrapInterval/v1",
      method: "moving-block-bootstrap-symmetric",
      confidence: policy.confidence,
      blockPolicy: { family: "fixed-moving-block", blockLength: policy.blockLength, wrapPolicy: "cyclic" },
      drawCount: policy.drawCount,
      seed: policy.seed,
      usableDrawCount: draws.length,
      low: estimate - radius,
      high: estimate + radius
    };
  }

  function scope23DependenceEstimate(sample, intervalPolicy) {
    var correlation = pearson(sample.a, sample.b);
    var anchorVariance = sampleVariance(sample.a);
    var dependentVariance = sampleVariance(sample.b);
    if (correlation === null || anchorVariance === null || dependentVariance === null) {
      return scope23Unavailable("dependence-estimate-degenerate", { sampleId: sample.sampleId });
    }
    var interval = scope23BootstrapInterval(correlation, sample, intervalPolicy, pearson);
    if (interval.state === "unavailable") return interval;
    return {
      contractVersion: "DependenceEstimate/v1",
      state: "ok",
      sampleId: sample.sampleId,
      memberDateFingerprint: sample.memberDateFingerprint,
      correlation: correlation,
      anchorVariance: anchorVariance,
      dependentVariance: dependentVariance,
      observationCount: sample.observationCount,
      interval: interval
    };
  }

  function computeStressDependence(request) {
    if (!request || request.contractVersion !== "StressDependenceRequest/v1") {
      return scope23Unavailable("stress-dependence-request-invalid");
    }
    if (!validDependenceSample(request.normal) || !validDependenceSample(request.stress)) {
      return scope23Unavailable("dependence-sample-contract-required");
    }
    if (request.normal.sampleId === request.stress.sampleId) return scope23Unavailable("samples-not-distinct");
    if (!scope23SamplesDisjoint(request.normal, request.stress)) return scope23Unavailable("samples-not-disjoint");
    if (!scope23SamePair(request.normal, request.stress)) return scope23Unavailable("sample-pair-mismatch");
    if (!Number.isInteger(request.minimumObservations) || request.minimumObservations < 2) {
      return scope23Unavailable("minimum-observations-invalid");
    }
    if (request.normal.observationCount < request.minimumObservations ||
        request.stress.observationCount < request.minimumObservations) {
      return scope23Unavailable("minimum-observations-not-met");
    }
    if (!validBlockBootstrapPolicy(request.intervalPolicy)) return scope23Unavailable("bootstrap-policy-invalid");
    var normal = scope23DependenceEstimate(request.normal, request.intervalPolicy);
    var stress = scope23DependenceEstimate(request.stress, request.intervalPolicy);
    if (normal.state !== "ok" || stress.state !== "ok") return scope23Unavailable("dependence-estimate-unavailable");
    return {
      contractVersion: "DependenceEvidenceSet/v1",
      state: "ok",
      pair: { anchor: request.normal.pair.anchor, dependent: request.normal.pair.dependent },
      normal: normal,
      stress: stress,
      rawCorrelationChange: stress.correlation - normal.correlation,
      varianceRatio: normal.anchorVariance === 0 ? null : stress.anchorVariance / normal.anchorVariance,
      selectionBias: {
        normalSelectionRule: request.normal.selectionRule,
        stressSelectionRule: request.stress.selectionRule,
        searchedVariantCount: request.normal.searchedVariantCount + request.stress.searchedVariantCount
      },
      conclusion: {
        prescription: null,
        invalidationConditions: ["sample-membership-changed", "source-fingerprint-changed", "cutoff-changed"],
        boundary: "The raw difference is a finite-sample diagnostic, not an automatic contagion verdict."
      }
    };
  }

  function qualifiedForbesRigobonAdjustment(input) {
    var tranquil = input.tranquilSample, turbulent = input.turbulentSample;
    if (tranquil && turbulent && Array.isArray(tranquil.memberDates) && Array.isArray(turbulent.memberDates) &&
        !scope23SamplesDisjoint(tranquil, turbulent)) {
      return scope23Unavailable("samples-not-disjoint");
    }
    if (!validDependenceSample(tranquil) || !validDependenceSample(turbulent)) {
      return scope23Unavailable("dependence-sample-contract-required");
    }
    if (!scope23SamePair(tranquil, turbulent)) return scope23Unavailable("sample-pair-mismatch");
    if (!Number.isInteger(input.minimumObservations) || input.minimumObservations < 2) {
      return scope23Unavailable("minimum-observations-invalid");
    }
    if (tranquil.observationCount < input.minimumObservations || turbulent.observationCount < input.minimumObservations) {
      return scope23Unavailable("minimum-observations-not-met");
    }
    var orientation;
    if (input.anchorSeries === tranquil.pair.anchor) {
      orientation = { anchor: tranquil.pair.anchor, dependent: tranquil.pair.dependent };
    } else if (input.anchorSeries === tranquil.pair.dependent) {
      orientation = { anchor: tranquil.pair.dependent, dependent: tranquil.pair.anchor };
    } else {
      return scope23Unavailable("anchor-series-not-in-pair");
    }
    if (!validBlockBootstrapPolicy(input.intervalPolicy)) return scope23Unavailable("bootstrap-policy-invalid");
    var anchorIndex = input.anchorSeries === tranquil.pair.anchor ? "a" : "b";
    var dependentIndex = anchorIndex === "a" ? "b" : "a";
    var tranquilVariance = sampleVariance(tranquil[anchorIndex]);
    var turbulentVariance = sampleVariance(turbulent[anchorIndex]);
    var raw = pearson(turbulent[anchorIndex], turbulent[dependentIndex]);
    if (tranquilVariance === null || tranquilVariance <= 0 || turbulentVariance === null || turbulentVariance <= tranquilVariance || raw === null) {
      return scope23Unavailable(turbulentVariance !== null && tranquilVariance !== null && turbulentVariance <= tranquilVariance
        ? "turbulent-anchor-variance-not-higher" : "adjustment-input-degenerate");
    }
    var delta = turbulentVariance / tranquilVariance - 1;
    var adjusted = raw / Math.sqrt(1 + delta * (1 - raw * raw));
    var interval = scope23BootstrapInterval(adjusted, turbulent, input.intervalPolicy, function (a, b) {
      var orientedA = anchorIndex === "a" ? a : b;
      var orientedB = anchorIndex === "a" ? b : a;
      var rho = pearson(orientedA, orientedB);
      if (rho === null) return null;
      return rho / Math.sqrt(1 + delta * (1 - rho * rho));
    });
    if (interval.state === "unavailable") return interval;
    return {
      contractVersion: "ForbesRigobonAdjustment/v1",
      state: "ok",
      anchorOrientation: orientation,
      tranquilSampleId: tranquil.sampleId,
      turbulentSampleId: turbulent.sampleId,
      rawStressCorrelation: raw,
      tranquilAnchorVariance: tranquilVariance,
      turbulentAnchorVariance: turbulentVariance,
      delta: delta,
      adjustedEstimate: adjusted,
      interval: interval,
      caveat: "The adjustment addresses one heteroskedasticity mechanism. It does not prove contagion and does not disprove contagion.",
      invalidationConditions: ["anchor-orientation-changed", "sample-membership-changed", "variance-assumption-failed"]
    };
  }

  function scope23SetIntersection(first, second) {
    var right = {};
    second.forEach(function (value) { right[value] = true; });
    return first.filter(function (value) { return right[value]; });
  }

  function scope23SetUnion(first, second) {
    var seen = {}, out = [];
    first.concat(second).forEach(function (value) {
      if (!seen[value]) { seen[value] = true; out.push(value); }
    });
    return out;
  }

  function scope23DrawdownDates(returns, dates, threshold) {
    var wealth = 1, peak = 1, out = [];
    for (var i = 0; i < returns.length; i += 1) {
      wealth *= 1 + returns[i];
      if (wealth > peak) peak = wealth;
      if (peak > 0 && (peak - wealth) / peak >= threshold) out.push(dates[i]);
    }
    return out;
  }

  function scope23RecoveryDates(returns, dates, drawdownThreshold, recoveryThreshold) {
    var wealth = 1, peak = 1, recoveryPeak = null, active = false, out = [];
    for (var i = 0; i < returns.length; i += 1) {
      wealth *= 1 + returns[i];
      if (!active && wealth > peak) peak = wealth;
      var drawdown = peak > 0 ? (peak - wealth) / peak : 0;
      if (!active && drawdown >= drawdownThreshold) {
        active = true;
        recoveryPeak = peak;
      }
      if (active) {
        out.push(dates[i]);
        if (wealth >= recoveryPeak * (1 - recoveryThreshold)) {
          active = false;
          peak = wealth;
          recoveryPeak = null;
        }
      }
    }
    return out;
  }

  function scope23OverlapEstimate(first, second) {
    var union = scope23SetUnion(first, second);
    return union.length ? scope23SetIntersection(first, second).length / union.length : 0;
  }

  function computeDependenceOverlaps(request) {
    if (!request || request.contractVersion !== "DependenceOverlapRequest/v1" || !validDependenceSample(request.sample)) {
      return scope23Unavailable("dependence-overlap-request-invalid");
    }
    if (!isNum(request.quantile) || request.quantile <= 0 || request.quantile >= 0.5 ||
        !Number.isInteger(request.minimumJointEvents) || request.minimumJointEvents < 1 ||
        !isNum(request.downsideThreshold) || !isNum(request.drawdownThreshold) || request.drawdownThreshold <= 0 ||
        !isNum(request.recoveryThreshold) || request.recoveryThreshold < 0 ||
        !validBlockBootstrapPolicy(request.intervalPolicy)) {
      return scope23Unavailable("dependence-overlap-policy-invalid");
    }
    var sample = request.sample;
    var sortedA = sample.a.slice().sort(function (a, b) { return a - b; });
    var sortedB = sample.b.slice().sort(function (a, b) { return a - b; });
    var thresholdA = scope23Quantile(sortedA, request.quantile);
    var thresholdB = scope23Quantile(sortedB, request.quantile);
    var tailDatesA = [], tailDatesB = [], downsideA = [], downsideB = [];
    sample.memberDates.forEach(function (date, index) {
      if (sample.a[index] <= thresholdA) tailDatesA.push(date);
      if (sample.b[index] <= thresholdB) tailDatesB.push(date);
      if (sample.a[index] < request.downsideThreshold) downsideA.push(date);
      if (sample.b[index] < request.downsideThreshold) downsideB.push(date);
    });
    var jointTail = scope23SetIntersection(tailDatesA, tailDatesB);
    if (jointTail.length < request.minimumJointEvents) {
      return scope23Unavailable("thin-tail-sample", {
        jointEventCount: jointTail.length,
        minimumJointEvents: request.minimumJointEvents
      });
    }
    var tailEstimate = tailDatesA.length ? jointTail.length / tailDatesA.length : null;
    var tailInterval = scope23BootstrapInterval(tailEstimate, sample, request.intervalPolicy, function (a, b) {
      var localA = a.slice().sort(function (x, y) { return x - y; });
      var localB = b.slice().sort(function (x, y) { return x - y; });
      var cutA = scope23Quantile(localA, request.quantile);
      var cutB = scope23Quantile(localB, request.quantile);
      var marginal = 0, joint = 0;
      for (var i = 0; i < a.length; i += 1) {
        if (a[i] <= cutA) marginal += 1;
        if (a[i] <= cutA && b[i] <= cutB) joint += 1;
      }
      return marginal ? joint / marginal : null;
    });
    var drawdownA = scope23DrawdownDates(sample.a, sample.memberDates, request.drawdownThreshold);
    var drawdownB = scope23DrawdownDates(sample.b, sample.memberDates, request.drawdownThreshold);
    var recoveryA = scope23RecoveryDates(sample.a, sample.memberDates, request.drawdownThreshold, request.recoveryThreshold);
    var recoveryB = scope23RecoveryDates(sample.b, sample.memberDates, request.drawdownThreshold, request.recoveryThreshold);
    function overlapContract(version, first, second, policy) {
      var intersection = scope23SetIntersection(first, second);
      var union = scope23SetUnion(first, second);
      var estimate = union.length ? intersection.length / union.length : 0;
      var interval = scope23BootstrapInterval(estimate, sample, request.intervalPolicy, function (a, b) {
        var dates = sample.memberDates;
        var one, two;
        if (version === "DownsideOverlap/v1") {
          one = dates.filter(function (_date, index) { return a[index] < request.downsideThreshold; });
          two = dates.filter(function (_date, index) { return b[index] < request.downsideThreshold; });
        } else if (version === "DrawdownOverlap/v1") {
          one = scope23DrawdownDates(a, dates, request.drawdownThreshold);
          two = scope23DrawdownDates(b, dates, request.drawdownThreshold);
        } else {
          one = scope23RecoveryDates(a, dates, request.drawdownThreshold, request.recoveryThreshold);
          two = scope23RecoveryDates(b, dates, request.drawdownThreshold, request.recoveryThreshold);
        }
        return scope23OverlapEstimate(one, two);
      });
      return {
        contractVersion: version,
        state: "ok",
        sampleId: sample.sampleId,
        policy: policy,
        firstDates: first.slice(),
        secondDates: second.slice(),
        intersectionDates: intersection,
        unionCount: union.length,
        estimate: estimate,
        interval: interval
      };
    }
    var downside = overlapContract("DownsideOverlap/v1", downsideA, downsideB,
      { returnThreshold: request.downsideThreshold });
    downside.sharedDates = downside.intersectionDates.slice();
    return {
      contractVersion: "DependenceOverlapSet/v1",
      state: "ok",
      sampleId: sample.sampleId,
      tail: {
        contractVersion: "EmpiricalTailDependence/v1",
        state: "ok",
        sampleId: sample.sampleId,
        thresholdPolicy: { family: "empirical-rank", quantile: request.quantile },
        thresholds: { anchor: thresholdA, dependent: thresholdB },
        jointEventCount: jointTail.length,
        denominator: tailDatesA.length,
        estimate: tailEstimate,
        interval: tailInterval
      },
      downside: downside,
      drawdown: overlapContract("DrawdownOverlap/v1", drawdownA, drawdownB,
        { drawdownThreshold: request.drawdownThreshold }),
      recovery: overlapContract("RecoveryOverlap/v1", recoveryA, recoveryB,
        { recoveryThreshold: request.recoveryThreshold, unrecoveredEpisodeEnd: sample.cutoff })
    };
  }

  function computeAppraisalSensitivity(request) {
    if (!request || request.contractVersion !== "AppraisalSensitivityRequest/v1") {
      return scope23Unavailable("appraisal-request-invalid");
    }
    var missing = [];
    ["assetId", "valuationFrequency", "lastValuation", "evidenceCutoff", "sourceMethod", "liquidity"].forEach(function (key) {
      if (typeof request[key] !== "string" || !request[key]) missing.push(key);
    });
    if (!scope23Date(request.lastValuation)) missing.push("lastValuation");
    if (!scope23Date(request.evidenceCutoff)) missing.push("evidenceCutoff");
    if (!scope23ExactKeys(request.costs, ["insuranceFraction", "storageFraction", "transactionFraction"]) ||
        !Object.keys(request.costs || {}).every(function (key) { return isNum(request.costs[key]) && request.costs[key] >= 0; })) {
      missing.push("costs");
    }
    if (!Array.isArray(request.economicDrivers) || !request.economicDrivers.length ||
        !request.economicDrivers.every(function (value) { return typeof value === "string" && Boolean(value); })) {
      missing.push("economicDrivers");
    }
    if (!Array.isArray(request.idiosyncraticRisks) || !request.idiosyncraticRisks.length ||
        !request.idiosyncraticRisks.every(function (value) { return typeof value === "string" && Boolean(value); })) {
      missing.push("idiosyncraticRisks");
    }
    if (!validDependenceSample(request.observedSample)) missing.push("observedSample");
    if (!isNum(request.smoothingEstimate) || request.smoothingEstimate <= 0 || request.smoothingEstimate >= 1) {
      missing.push("smoothingEstimate");
    }
    if (!Array.isArray(request.rhoGrid) || !request.rhoGrid.length ||
        !request.rhoGrid.every(function (rho) { return isNum(rho) && rho > 0 && rho < 1; })) {
      missing.push("rhoGrid");
    }
    if (!Number.isInteger(request.minimumObservations) || request.minimumObservations < 2 ||
        (validDependenceSample(request.observedSample) && request.observedSample.observationCount < request.minimumObservations)) {
      missing.push("minimumObservations");
    }
    if (missing.length) return scope23Unavailable("appraisal-evidence-incomplete", { missing: missing });
    var cutoff = new Date(request.evidenceCutoff + "T00:00:00.000Z");
    var last = new Date(request.lastValuation + "T00:00:00.000Z");
    if (last > cutoff) return scope23Unavailable("last-valuation-after-cutoff");
    var observedVolatility = Math.sqrt(sampleVariance(request.observedSample.a));
    var observedDependence = pearson(request.observedSample.a, request.observedSample.b);
    var grid = request.rhoGrid.map(function (rho) {
      var desmoothed = desmoothReturns(request.observedSample.a, rho);
      if (desmoothed.state !== "ok") return { state: "unavailable", rho: rho, reason: desmoothed.reason };
      var sample = buildDependenceSample({
        contractVersion: "DependenceSample/v1",
        sampleId: request.observedSample.sampleId + "|desmoothed-rho=" + rho,
        definitionKind: "appraisal-desmoothed-sensitivity",
        memberDates: request.observedSample.memberDates.slice(1),
        sourceFingerprints: request.observedSample.sourceFingerprints.slice(),
        selectionRule: "explicit de-smoothing sensitivity rho=" + rho,
        cutoff: request.observedSample.cutoff,
        searchedVariantCount: request.observedSample.searchedVariantCount,
        pair: { anchor: request.observedSample.pair.anchor, dependent: request.observedSample.pair.dependent },
        a: desmoothed.desmoothed,
        b: request.observedSample.b.slice(1)
      });
      return {
        state: sample.state,
        rho: rho,
        sample: sample,
        volatility: sample.state === "ok" ? Math.sqrt(sampleVariance(sample.a)) : null,
        dependence: sample.state === "ok" ? pearson(sample.a, sample.b) : null
      };
    });
    if (grid.some(function (row) { return row.state !== "ok"; })) {
      return scope23Unavailable("appraisal-grid-unavailable", { grid: grid });
    }
    return {
      contractVersion: "AppraisalSensitivity/v1",
      state: "ok",
      assetId: request.assetId,
      valuationFrequency: request.valuationFrequency,
      lastValuation: request.lastValuation,
      evidenceCutoff: request.evidenceCutoff,
      valuationAgeDays: Math.round((cutoff.getTime() - last.getTime()) / 86400000),
      sourceMethod: request.sourceMethod,
      liquidity: request.liquidity,
      costs: {
        transactionFraction: request.costs.transactionFraction,
        storageFraction: request.costs.storageFraction,
        insuranceFraction: request.costs.insuranceFraction
      },
      economicDrivers: request.economicDrivers.slice(),
      idiosyncraticRisks: request.idiosyncraticRisks.slice(),
      observedReturnIdentity: {
        sampleId: request.observedSample.sampleId,
        memberDateFingerprint: request.observedSample.memberDateFingerprint
      },
      smoothingEstimate: request.smoothingEstimate,
      observed: {
        sample: request.observedSample,
        volatility: observedVolatility,
        dependence: observedDependence
      },
      grid: grid,
      strongConclusionState: "qualified",
      prescribedDiversifier: null,
      invalidationConditions: ["valuation-updated", "liquidity-changed", "cost-evidence-changed", "rho-grid-changed"]
    };
  }

  function scope23Ols(sample) {
    var x = sample.b, y = sample.a;
    var meanX = mean(x), meanY = mean(y), sxx = 0, sxy = 0;
    for (var i = 0; i < x.length; i += 1) {
      sxx += (x[i] - meanX) * (x[i] - meanX);
      sxy += (x[i] - meanX) * (y[i] - meanY);
    }
    if (sxx <= 0) return null;
    var beta = sxy / sxx;
    var alpha = meanY - beta * meanX;
    var residuals = y.map(function (value, index) { return value - alpha - beta * x[index]; });
    var sse = residuals.reduce(function (total, value) { return total + value * value; }, 0);
    var sst = y.reduce(function (total, value) { return total + (value - meanY) * (value - meanY); }, 0);
    return {
      alpha: alpha,
      beta: beta,
      residuals: residuals,
      residualVariance: sse / (x.length - 2),
      residualCorrelation: pearson(residuals, x),
      rSquared: sst === 0 ? null : 1 - sse / sst,
      sse: sse,
      sxx: sxx
    };
  }

  function fitHedgeRegression(request) {
    if (!request || request.contractVersion !== "HedgeRegressionRequest/v1" || !validDependenceSample(request.sample)) {
      return scope23Unavailable("hedge-regression-request-invalid");
    }
    if (request.sample.definitionKind !== "aligned-excess-returns") {
      return scope23Unavailable("excess-return-sample-required");
    }
    if (!Number.isInteger(request.minimumObservations) || request.minimumObservations < 3 ||
        request.sample.observationCount < request.minimumObservations) {
      return scope23Unavailable("minimum-observations-not-met");
    }
    if (!validBlockBootstrapPolicy(request.intervalPolicy)) return scope23Unavailable("bootstrap-policy-invalid");
    var fit = scope23Ols(request.sample);
    if (!fit || !isNum(fit.residualVariance)) return scope23Unavailable("hedge-regression-degenerate");
    var coefficientInterval = scope23BootstrapInterval(fit.beta, request.sample, request.intervalPolicy, function (a, b) {
      var derived = {
        a: a, b: b,
        observationCount: a.length
      };
      var local = scope23Ols(derived);
      return local ? local.beta : null;
    });
    if (coefficientInterval.state === "unavailable") return coefficientInterval;
    return {
      contractVersion: "HedgeRegression/v1",
      state: "ok",
      alpha: fit.alpha,
      beta: fit.beta,
      betaDiagnostic: { value: fit.beta, prescribedRatio: null, diagnosticOnly: true },
      coefficientInterval: coefficientInterval,
      residualVariance: fit.residualVariance,
      residualCorrelation: fit.residualCorrelation === null ? 0 : fit.residualCorrelation,
      fit: { rSquared: fit.rSquared, residualSumSquares: fit.sse, proxyCenteredSumSquares: fit.sxx },
      sample: request.sample,
      dateBounds: { firstDate: request.sample.firstDate, lastDate: request.sample.lastDate },
      sourceIdentities: request.sample.sourceFingerprints.slice(),
      invalidationConditions: ["aligned-member-dates-changed", "target-source-changed", "proxy-source-changed"]
    };
  }

  function scope23Effectiveness(sample, beta, ratio) {
    var residual = sample.a.map(function (value, index) { return value - ratio * beta * sample.b[index]; });
    var unhedgedVariance = sampleVariance(sample.a);
    var residualVariance = sampleVariance(residual);
    return {
      state: unhedgedVariance === null || residualVariance === null ? "unavailable" : "ok",
      sampleId: sample.sampleId,
      memberDateFingerprint: sample.memberDateFingerprint,
      unhedgedVariance: unhedgedVariance,
      residualVariance: residualVariance,
      grossVarianceReduction: unhedgedVariance === null || residualVariance === null
        ? null : unhedgedVariance - residualVariance
    };
  }

  function scope23PathEffectiveness(input, beta, ratio) {
    if (!input.scenarioSpecification || input.scenarioSpecification.contractVersion !== "ScenarioSpecification/v1" ||
        !input.scenarioResult || input.scenarioResult.state !== "ok" ||
        !Array.isArray(input.scenarioResult.paths) || !input.scenarioResult.paths.length ||
        !validDependenceSample(input.alignedPathSample)) {
      return scope23Unavailable("common-path-evidence-required");
    }
    var validation = validateScenarioSpecification(input.scenarioSpecification);
    if (!validation.ok) return scope23Unavailable("scenario-specification-invalid");
    var identity = scenarioIdentity(input.scenarioSpecification);
    if (input.scenarioResult.identity !== identity) return scope23Unavailable("scenario-identity-mismatch");
    var target = [], residual = [], pathIds = [], seen = {};
    input.scenarioResult.paths.forEach(function (path) {
      if (!path || typeof path.pathId !== "string" || !Array.isArray(path.baseIndices)) return;
      if (!seen[path.pathId]) { seen[path.pathId] = true; pathIds.push(path.pathId); }
      path.baseIndices.forEach(function (index) {
        var local = index % input.alignedPathSample.observationCount;
        var targetReturn = input.alignedPathSample.a[local];
        var proxyReturn = input.alignedPathSample.b[local];
        target.push(targetReturn);
        residual.push(targetReturn - ratio * beta * proxyReturn);
      });
    });
    if (target.length < 2 || pathIds.length !== input.scenarioSpecification.pathCount) {
      return scope23Unavailable("common-path-records-incomplete");
    }
    var unhedgedVariance = sampleVariance(target), residualVariance = sampleVariance(residual);
    return {
      state: "ok",
      scenarioIdentity: identity,
      pathIds: pathIds,
      unhedgedVariance: unhedgedVariance,
      residualVariance: residualVariance,
      grossVarianceReduction: unhedgedVariance - residualVariance
    };
  }

  function scope23CostResult(variant, exposureValue) {
    var missing = HEDGE_COST_INPUT_KEYS.filter(function (key) {
      return !variant || !variant.costs || !isNum(variant.costs[key]) || variant.costs[key] < 0;
    });
    var provided = variant && scope23ExactKeys(variant.costs, HEDGE_COST_INPUT_KEYS) && !missing.length &&
      HEDGE_COST_INPUT_KEYS.every(function (key) { return isNum(variant.costs[key]) && variant.costs[key] >= 0; });
    var costs = {};
    HEDGE_COST_OUTPUT_KEYS.forEach(function (key) { costs[key] = null; });
    if (!provided) return { complete: false, costs: costs, totalCost: null, missing: missing };
    var notional = exposureValue * variant.hedgeRatio;
    costs.carry = notional * variant.costs.carryFraction * variant.horizonYears;
    costs.commission = notional * variant.costs.commissionFraction;
    costs.spread = notional * variant.costs.spreadFraction;
    costs.slippage = notional * variant.costs.slippageFraction;
    costs.turnover = notional * variant.costs.turnoverFraction *
      (variant.costs.commissionFraction + variant.costs.spreadFraction + variant.costs.slippageFraction);
    costs.rebalance = notional * variant.costs.rebalanceCostFraction * variant.horizonYears;
    costs.liquidity = notional * variant.costs.liquidityFraction;
    costs.financing = notional * variant.costs.financingFraction * variant.horizonYears;
    return {
      complete: true,
      costs: costs,
      totalCost: HEDGE_COST_OUTPUT_KEYS.reduce(function (total, key) { return total + costs[key]; }, 0),
      missing: []
    };
  }

  function computeHedgeComparison(input) {
    if (!input || !input.regression || input.regression.contractVersion !== "HedgeRegression/v1" ||
        input.regression.state !== "ok") {
      return scope23Unavailable("hedge-regression-required");
    }
    if (input.contractVersion !== "HedgeComparisonRequest/v1" ||
        !input.exposure || typeof input.exposure.exposureId !== "string" || !input.exposure.exposureId ||
        typeof input.exposure.targetSymbol !== "string" || !input.exposure.targetSymbol ||
        !isNum(input.exposure.targetExposureValue) || input.exposure.targetExposureValue <= 0 ||
        !validDependenceSample(input.normalSample) || !validDependenceSample(input.stressSample) ||
        !Array.isArray(input.variants) || !input.variants.length) {
      return scope23Unavailable("hedge-comparison-input-invalid");
    }
    var scenarioProbe = scope23PathEffectiveness(input, input.regression.beta, 0);
    var scenarioBasis = scenarioProbe.state === "ok" ? {
      scenarioSpecificationContractVersion: "ScenarioSpecification/v1",
      scenarioIdentity: scenarioProbe.scenarioIdentity,
      pathIds: scenarioProbe.pathIds.slice()
    } : {
      scenarioSpecificationContractVersion: input.scenarioSpecification && input.scenarioSpecification.contractVersion === "ScenarioSpecification/v1"
        ? "ScenarioSpecification/v1" : null,
      scenarioIdentity: null,
      pathIds: []
    };
    var anyPartial = scenarioProbe.state !== "ok";
    var variants = input.variants.map(function (variant) {
      if (!variant || typeof variant.variantId !== "string" || !variant.variantId ||
          !isNum(variant.hedgeRatio) || variant.hedgeRatio < 0 || variant.hedgeRatio > 1 ||
          !isNum(variant.horizonYears) || variant.horizonYears <= 0) {
        anyPartial = true;
        return scope23Unavailable("hedge-variant-invalid");
      }
      var cost = scope23CostResult(variant, input.exposure.targetExposureValue);
      var normal = scope23Effectiveness(input.normalSample, input.regression.beta, variant.hedgeRatio);
      var stress = scope23Effectiveness(input.stressSample, input.regression.beta, variant.hedgeRatio);
      var commonPath = scope23PathEffectiveness(input, input.regression.beta, variant.hedgeRatio);
      if (!cost.complete || normal.state !== "ok" || stress.state !== "ok" || commonPath.state !== "ok") anyPartial = true;
      var residualExposure = input.exposure.targetExposureValue * (1 - variant.hedgeRatio * input.regression.beta);
      var grossRiskEffect = normal.grossVarianceReduction === null
        ? null : normal.grossVarianceReduction * input.exposure.targetExposureValue * variant.horizonYears;
      return {
        contractVersion: "HedgeVariant/v1",
        state: normal.state === "ok" && stress.state === "ok" ? (cost.complete ? "ok" : "gross-only") : "unavailable",
        variantId: variant.variantId,
        hedgeRatio: variant.hedgeRatio,
        horizonYears: variant.horizonYears,
        residualVariance: input.regression.residualVariance,
        residualExposure: residualExposure,
        costs: cost.costs,
        missing: cost.missing,
        totalCost: cost.totalCost,
        grossRiskEffect: grossRiskEffect,
        netState: cost.complete && grossRiskEffect !== null ? "available" : "unavailable",
        netModeledOutcome: cost.complete && grossRiskEffect !== null ? grossRiskEffect - cost.totalCost : null,
        effectiveness: { normal: normal, stress: stress, commonPath: commonPath },
        prescribed: false,
        executable: false
      };
    });
    return {
      contractVersion: "HedgeComparison/v1",
      state: anyPartial ? "partial" : "ok",
      exposure: {
        exposureId: input.exposure.exposureId,
        targetSymbol: input.exposure.targetSymbol,
        targetExposureValue: input.exposure.targetExposureValue
      },
      regression: input.regression,
      normalSampleId: input.normalSample.sampleId,
      stressSampleId: input.stressSample.sampleId,
      scenarioBasis: scenarioBasis,
      variants: variants,
      prescribedRatio: null,
      executable: false,
      claimBoundary: "No ratio is prescribed or recommended. Every ratio and horizon is an explicit research variant; no contract is selected and nothing is executed.",
      invalidationConditions: ["regression-sample-changed", "cost-input-changed", "scenario-or-path-identity-changed"]
    };
  }

  function validateDiversificationProjection(value) {
    if (!value || value.contractVersion !== "DiversificationProjection/v1" ||
        (value.state !== "ok" && value.state !== "partial")) {
      return { ok: false, reason: "diversification-projection-invalid" };
    }
    if (!value.dependence || value.dependence.contractVersion !== "DependenceEvidenceSet/v1" ||
        !value.dependence.adjustment || value.dependence.adjustment.contractVersion !== "ForbesRigobonAdjustment/v1") {
      return { ok: false, reason: "dependence-adjustment-required" };
    }
    if (!value.overlaps || !value.overlaps.tail || value.overlaps.tail.contractVersion !== "EmpiricalTailDependence/v1" ||
        !value.overlaps.downside || value.overlaps.downside.contractVersion !== "DownsideOverlap/v1" ||
        !value.overlaps.drawdown || value.overlaps.drawdown.contractVersion !== "DrawdownOverlap/v1" ||
        !value.overlaps.recovery || value.overlaps.recovery.contractVersion !== "RecoveryOverlap/v1") {
      return { ok: false, reason: "distinct-overlap-contracts-required" };
    }
    if (!value.appraisal || value.appraisal.contractVersion !== "AppraisalSensitivity/v1" ||
        !value.hedge || value.hedge.contractVersion !== "HedgeComparison/v1") {
      return { ok: false, reason: "appraisal-and-hedge-contracts-required" };
    }
    var ratios = value.hedge.variants.map(function (variant) { return variant.hedgeRatio; });
    if (ratios.some(function (ratio, index) { return ratios.indexOf(ratio) !== index; })) {
      return { ok: false, reason: "explicit-variant-ratios-not-distinct" };
    }
    for (var i = 0; i < value.hedge.variants.length; i += 1) {
      var variant = value.hedge.variants[i];
      if (!scope23ExactKeys(variant.costs, HEDGE_COST_OUTPUT_KEYS) ||
          (variant.netState === "available" && HEDGE_COST_OUTPUT_KEYS.some(function (key) { return !isNum(variant.costs[key]); }))) {
        return { ok: false, reason: "complete-cost-components-required" };
      }
    }
    return { ok: true, reason: null };
  }

  function scope23ProjectionRefusal(reason, lastValid) {
    return {
      contractVersion: "DiversificationProjectionRefusal/v1",
      state: "unavailable",
      reason: reason,
      published: false,
      lastValidProjection: lastValid && validateDiversificationProjection(lastValid).ok
        ? JSON.parse(JSON.stringify(lastValid)) : null
    };
  }

  function computeDiversificationProjection(request) {
    if (!request || request.contractVersion !== "DiversificationProjectionRequest/v1") {
      return scope23ProjectionRefusal("diversification-request-invalid", request && request.lastValidProjection);
    }
    if (!validDependenceSample(request.normalSample) || !validDependenceSample(request.stressSample) ||
        !validDependenceSample(request.tailSample)) {
      return scope23ProjectionRefusal("dependence-sample-contract-required", request.lastValidProjection);
    }
    if (request.normalSample.sampleId === request.stressSample.sampleId) {
      return scope23ProjectionRefusal("samples-not-distinct", request.lastValidProjection);
    }
    var dependence = computeStressDependence({
      contractVersion: "StressDependenceRequest/v1",
      normal: request.normalSample,
      stress: request.stressSample,
      minimumObservations: request.minimumObservations,
      intervalPolicy: request.intervalPolicy
    });
    if (dependence.state !== "ok") return scope23ProjectionRefusal(dependence.reason, request.lastValidProjection);
    var adjustment = qualifiedForbesRigobonAdjustment({
      contractVersion: "ForbesRigobonRequest/v1",
      tranquilSample: request.normalSample,
      turbulentSample: request.stressSample,
      anchorSeries: request.normalSample.pair.anchor,
      minimumObservations: request.minimumObservations,
      intervalPolicy: request.intervalPolicy
    });
    if (adjustment.state !== "ok") return scope23ProjectionRefusal(adjustment.reason, request.lastValidProjection);
    dependence.adjustment = adjustment;
    var overlapPolicy = request.overlapPolicy || {};
    var overlaps = computeDependenceOverlaps({
      contractVersion: "DependenceOverlapRequest/v1",
      sample: request.tailSample,
      quantile: overlapPolicy.quantile,
      minimumJointEvents: overlapPolicy.minimumJointEvents,
      downsideThreshold: overlapPolicy.downsideThreshold,
      drawdownThreshold: overlapPolicy.drawdownThreshold,
      recoveryThreshold: overlapPolicy.recoveryThreshold,
      intervalPolicy: request.intervalPolicy
    });
    if (overlaps.state !== "ok") return scope23ProjectionRefusal(overlaps.reason, request.lastValidProjection);
    var appraisal = computeAppraisalSensitivity(request.appraisal);
    var hedge;
    if (request.precomputedHedgeComparison) {
      hedge = request.precomputedHedgeComparison;
    } else {
      var hedgeRequest = request.hedge || {};
      var regression = fitHedgeRegression(hedgeRequest.regressionRequest);
      hedge = regression.state === "ok" ? computeHedgeComparison({
        contractVersion: "HedgeComparisonRequest/v1",
        exposure: hedgeRequest.exposure,
        regression: regression,
        normalSample: request.normalSample,
        stressSample: request.stressSample,
        scenarioSpecification: hedgeRequest.scenarioSpecification,
        scenarioResult: hedgeRequest.scenarioResult,
        alignedPathSample: hedgeRequest.alignedPathSample,
        variants: hedgeRequest.variants
      }) : regression;
    }
    var partial = appraisal.state !== "ok" || hedge.state !== "ok";
    var projection = {
      contractVersion: "DiversificationProjection/v1",
      state: partial ? "partial" : "ok",
      published: true,
      dependence: dependence,
      overlaps: overlaps,
      appraisal: appraisal,
      hedge: hedge,
      conclusion: {
        state: partial ? "qualified-partial" : "qualified",
        prescription: null,
        invalidationConditions: [
          "dependence-sample-or-cutoff-changed", "appraisal-quality-or-rho-grid-changed",
          "hedge-regression-cost-or-common-path-changed"
        ]
      }
    };
    return projection;
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

  /* Matrix helpers for the Black-Litterman posterior. Kept local and small: the
     posterior needs one inverse and a handful of products, and pulling in a
     general linear-algebra layer for that would be more code to trust. */
  function matrixInverse(A) {
    var n = A.length;
    var identity = [];
    for (var i = 0; i < n; i += 1) {
      identity.push([]);
      for (var j = 0; j < n; j += 1) identity[i].push(i === j ? 1 : 0);
    }
    var columns = [];
    for (var c = 0; c < n; c += 1) {
      var rhs = identity.map(function (row) { return row[c]; });
      var solved = solveSymmetric(A, rhs);
      if (!solved || solved.length !== n || !solved.every(isNum)) return null;
      columns.push(solved);
    }
    var inverse = [];
    for (var r = 0; r < n; r += 1) {
      inverse.push([]);
      for (var k = 0; k < n; k += 1) inverse[r].push(columns[k][r]);
    }
    return inverse;
  }

  function matrixMultiply(A, B) {
    var rows = A.length, inner = B.length, cols = B[0].length;
    var out = [];
    for (var i = 0; i < rows; i += 1) {
      out.push([]);
      for (var j = 0; j < cols; j += 1) {
        var sum = 0;
        for (var k = 0; k < inner; k += 1) sum += A[i][k] * B[k][j];
        out[i].push(sum);
      }
    }
    return out;
  }

  function matrixTranspose(A) {
    var out = [];
    for (var j = 0; j < A[0].length; j += 1) {
      out.push([]);
      for (var i = 0; i < A.length; i += 1) out[j].push(A[i][j]);
    }
    return out;
  }

  function matrixVector(A, v) {
    return A.map(function (row) {
      var sum = 0;
      for (var i = 0; i < v.length; i += 1) sum += row[i] * v[i];
      return sum;
    });
  }

  function matrixScale(A, s) {
    return A.map(function (row) { return row.map(function (v) { return v * s; }); });
  }

  function matrixAdd(A, B) {
    return A.map(function (row, i) { return row.map(function (v, j) { return v + B[i][j]; }); });
  }

  /**
   * Exact Black-Litterman posterior.
   *
   * Every stage is returned SEPARATELY — implied equilibrium `pi`, the view
   * structure `P`/`q`/`Omega`, and the posterior mean and covariance — because
   * a single blended expected-return vector hides which part of the answer came
   * from the market and which came from the user. A reader who cannot separate
   * those two cannot tell whether they are looking at a consensus or at their
   * own opinion reflected back.
   */
  function blackLittermanPosterior(request) {
    if (!request || typeof request !== "object") return { state: "unavailable", reason: "request-invalid" };
    var symbols = request.symbols;
    var sigma = request.covariance;
    if (!Array.isArray(symbols) || symbols.length < 2) return { state: "unavailable", reason: "insufficient-universe" };
    if (!Array.isArray(sigma) || sigma.length !== symbols.length) return { state: "unavailable", reason: "covariance-required" };
    if (!Array.isArray(request.benchmarkWeights) || request.benchmarkWeights.length !== symbols.length ||
        !request.benchmarkWeights.every(isNum)) {
      return { state: "unavailable", reason: "benchmark-weights-required" };
    }
    if (!isNum(request.riskAversion) || request.riskAversion <= 0) return { state: "unavailable", reason: "risk-aversion-required" };
    if (!isNum(request.tau) || request.tau <= 0) return { state: "unavailable", reason: "tau-required" };

    var n = symbols.length;
    // Implied equilibrium excess returns: pi = delta * Sigma * w_benchmark.
    var pi = matrixVector(sigma, request.benchmarkWeights).map(function (v) { return v * request.riskAversion; });

    var views = Array.isArray(request.views) ? request.views : [];
    var admitted = [];
    for (var v = 0; v < views.length; v += 1) {
      var view = views[v];
      if (!view || typeof view !== "object") continue;
      if (view.source !== "user-stated") continue;
      var index = symbols.indexOf(view.subject);
      if (index === -1) continue;
      if (!isNum(view.expectedReturn) || !isNum(view.confidence) || view.confidence <= 0 || view.confidence > 1) continue;
      admitted.push({ index: index, subject: view.subject, expectedReturn: view.expectedReturn, confidence: view.confidence });
    }

    if (!admitted.length) {
      return {
        state: "equilibrium-only",
        symbols: symbols.slice(),
        impliedEquilibriumReturns: pi,
        viewMatrix: [],
        viewReturns: [],
        viewUncertainty: [],
        tau: request.tau,
        posteriorMean: pi.slice(),
        posteriorCovariance: null,
        behaviorContribution: "none",
        note: "No view was stated, so the posterior IS the implied equilibrium. Nothing was added " +
          "and nothing was inferred; the market's own view is shown unaltered."
      };
    }

    // P picks the asset each view speaks about; q carries its stated return.
    var P = admitted.map(function (row) {
      var line = [];
      for (var j = 0; j < n; j += 1) line.push(j === row.index ? 1 : 0);
      return line;
    });
    var q = admitted.map(function (row) { return row.expectedReturn; });

    /* Omega is DIAGONAL and derived from the stated confidence: a fully
       confident view gets small variance, a tentative one large. The confidence
       is the user's, so the uncertainty attached to their view is theirs too. */
    var tauSigma = matrixScale(sigma, request.tau);
    var Omega = [];
    for (var a = 0; a < admitted.length; a += 1) {
      Omega.push([]);
      for (var b = 0; b < admitted.length; b += 1) Omega[a].push(0);
      var base = tauSigma[admitted[a].index][admitted[a].index];
      Omega[a][a] = base * (1 / admitted[a].confidence);
    }

    var tauSigmaInverse = matrixInverse(tauSigma);
    var omegaInverse = matrixInverse(Omega);
    if (!tauSigmaInverse || !omegaInverse) return { state: "unavailable", reason: "matrix-not-invertible" };

    var Pt = matrixTranspose(P);
    var middle = matrixAdd(tauSigmaInverse, matrixMultiply(matrixMultiply(Pt, omegaInverse), P));
    var posteriorCovariance = matrixInverse(middle);
    if (!posteriorCovariance) return { state: "unavailable", reason: "posterior-not-invertible" };

    var rhs = matrixVector(tauSigmaInverse, pi);
    var viewTerm = matrixVector(matrixMultiply(Pt, omegaInverse), q);
    for (var r = 0; r < n; r += 1) rhs[r] += viewTerm[r];
    var posteriorMean = matrixVector(posteriorCovariance, rhs);

    return {
      state: "ok",
      symbols: symbols.slice(),
      impliedEquilibriumReturns: pi,
      viewMatrix: P,
      viewReturns: q,
      viewUncertainty: Omega,
      tau: request.tau,
      admittedViews: admitted.map(function (row) {
        return { subject: row.subject, expectedReturn: row.expectedReturn, confidence: row.confidence, source: "user-stated" };
      }),
      posteriorMean: posteriorMean,
      posteriorCovariance: posteriorCovariance,
      behaviorContribution: "none",
      note: "The posterior blends the implied equilibrium with " + admitted.length + " view you stated. " +
        "Equilibrium, view and posterior are reported separately so you can see which part of the " +
        "answer is the market's and which is yours."
    };
  }

  /* ---------------------------------------------------------------------
     Scope 14 - allocation sensitivity and explicit Black-Litterman
     --------------------------------------------------------------------- */

  /**
   * Recompute an allocation across DECLARED perturbations and report the range.
   *
   * A single point-weight vector from an optimiser is the most confident-looking
   * and least reliable output in portfolio analysis: minimum-variance and
   * mean-variance weights move violently under small covariance changes. This
   * reports the RANGE each weight takes across the perturbation set, and labels
   * a holding unstable when its range exceeds the declared threshold.
   *
   * Precision follows the range: a weight whose band spans 30 points is printed
   * to fewer decimals than one that barely moves, because the extra digits would
   * be false precision.
   */
  function allocationSensitivity(request) {
    if (!request || typeof request !== "object") return { state: "unavailable", reason: "request-invalid" };
    var symbols = request.symbols;
    var covariance = request.covariance;
    if (!Array.isArray(symbols) || symbols.length < 2) return { state: "unavailable", reason: "insufficient-universe" };
    if (!Array.isArray(covariance) || covariance.length !== symbols.length) {
      return { state: "unavailable", reason: "covariance-required" };
    }
    if (!Array.isArray(request.perturbations) || !request.perturbations.length) {
      return { state: "unavailable", reason: "perturbations-required" };
    }
    if (!isNum(request.unstableRangeThreshold) || request.unstableRangeThreshold <= 0) {
      return { state: "unavailable", reason: "unstable-threshold-required" };
    }
    if (!request.perturbations.every(isNum)) return { state: "unavailable", reason: "perturbations-non-finite" };

    var n = symbols.length;
    var trials = [];
    var failed = 0;
    for (var p = 0; p < request.perturbations.length; p += 1) {
      var scale = 1 + request.perturbations[p];
      if (scale <= 0) { failed += 1; continue; }
      /* Perturb the OFF-DIAGONALS only. Scaling the whole matrix would leave
         minimum-variance weights unchanged (they are scale-invariant), so the
         sensitivity would look reassuringly flat while proving nothing. */
      var perturbed = [];
      for (var i = 0; i < n; i += 1) {
        perturbed.push([]);
        for (var j = 0; j < n; j += 1) {
          perturbed[i].push(i === j ? covariance[i][j] : covariance[i][j] * scale);
        }
      }
      var solved = solveSymmetric(perturbed, symbols.map(function () { return 1; }));
      if (!solved || solved.length !== n || !solved.every(isNum)) { failed += 1; continue; }
      var total = 0;
      for (var k = 0; k < n; k += 1) total += solved[k];
      if (!(Math.abs(total) > 0)) { failed += 1; continue; }
      trials.push({ perturbation: request.perturbations[p], weights: solved.map(function (v) { return v / total; }) });
    }

    if (!trials.length) {
      return {
        state: "unavailable",
        reason: "no-valid-trial",
        validTrials: 0,
        failedTrials: failed,
        note: "Every declared perturbation failed to solve, so there is no range to report. " +
          "A point weight is NOT shown in its place."
      };
    }

    var ranges = [];
    for (var s = 0; s < n; s += 1) {
      var values = trials.map(function (trial) { return trial.weights[s]; });
      var low = Math.min.apply(null, values);
      var high = Math.max.apply(null, values);
      var span = high - low;
      ranges.push({
        symbol: symbols[s],
        low: low,
        high: high,
        span: span,
        unstable: span > request.unstableRangeThreshold,
        /* False precision is the failure mode here. A weight whose band spans
           more than a point is printed to whole percents; a tight one earns its
           decimals. */
        decimals: span > 0.01 ? 0 : (span > 0.001 ? 1 : 2)
      });
    }

    var turnover = 0;
    if (Array.isArray(request.currentWeights) && request.currentWeights.length === n) {
      for (var t = 0; t < n; t += 1) {
        turnover += Math.abs(ranges[t].high - request.currentWeights[t]);
      }
      turnover = turnover / 2;
    }

    var unstable = ranges.filter(function (row) { return row.unstable; });

    /* Reversal conditions: pairs whose weight ORDER flips somewhere inside the
       declared perturbation set. A range alone can hide this — two holdings can
       both move a little and still swap places, which changes the conclusion a
       reader would draw far more than the numbers suggest. */
    var reversals = [];
    for (var x = 0; x < n; x += 1) {
      for (var y = x + 1; y < n; y += 1) {
        var firstSign = null;
        for (var tr = 0; tr < trials.length; tr += 1) {
          var diff = trials[tr].weights[x] - trials[tr].weights[y];
          var sign = diff > 0 ? 1 : (diff < 0 ? -1 : 0);
          if (sign === 0) continue;
          if (firstSign === null) { firstSign = sign; continue; }
          if (sign !== firstSign) {
            reversals.push({
              higher: symbols[firstSign > 0 ? x : y],
              lower: symbols[firstSign > 0 ? y : x],
              reversesAtPerturbation: trials[tr].perturbation,
              statement: symbols[x] + " and " + symbols[y] + " swap order at a covariance perturbation of " +
                trials[tr].perturbation + ". Which one carries more weight is not a stable conclusion " +
                "across the declared set."
            });
            break;
          }
        }
      }
    }

    return {
      state: "ok",
      validTrials: trials.length,
      failedTrials: failed,
      declaredPerturbations: request.perturbations.slice(),
      unstableRangeThreshold: request.unstableRangeThreshold,
      ranges: ranges,
      reversalConditions: reversals,
      unstableSymbols: unstable.map(function (row) { return row.symbol; }),
      pointVectorTrustworthy: unstable.length === 0,
      worstCaseTurnover: turnover,
      claimBoundary: unstable.length
        ? unstable.length + " holding" + (unstable.length === 1 ? "" : "s") + " move" +
          (unstable.length === 1 ? "s" : "") + " more than the declared stability threshold across these " +
          trials.length + " perturbations. The point-weight vector is UNSTABLE: reporting it to two " +
          "decimals would be false precision about an answer that moves when the inputs barely do."
        : "No holding exceeds the declared stability threshold across these " + trials.length +
          " perturbations. The point-weight vector is stable ON THIS PERTURBATION SET, which is not " +
          "the same as being correct."
    };
  }

  /**
   * Black-Litterman views, with an explicit provenance boundary.
   *
   * A view is admitted ONLY when the user stated it. Behaviour history — what
   * the user read, searched, or lingered on — is deliberately accepted as an
   * argument and deliberately ignored, so the exclusion is testable rather than
   * merely absent. An inferred view would put words in the user's mouth and
   * then optimise against them.
   */
  function blackLittermanViews(request) {
    if (!request || typeof request !== "object") return { state: "unavailable", reason: "request-invalid" };
    var stated = Array.isArray(request.statedViews) ? request.statedViews : [];
    var behavior = Array.isArray(request.behaviorSignals) ? request.behaviorSignals : [];

    var admitted = [];
    var rejected = [];
    for (var i = 0; i < stated.length; i += 1) {
      var view = stated[i];
      if (!view || typeof view !== "object") { rejected.push({ index: i, reason: "view-invalid" }); continue; }
      if (typeof view.subject !== "string" || !view.subject) { rejected.push({ index: i, reason: "subject-required" }); continue; }
      if (!isNum(view.expectedReturn)) { rejected.push({ index: i, reason: "expected-return-required" }); continue; }
      if (!isNum(view.confidence) || view.confidence <= 0 || view.confidence > 1) {
        rejected.push({ index: i, reason: "confidence-required" });
        continue;
      }
      if (view.source !== "user-stated") { rejected.push({ index: i, reason: "source-must-be-user-stated" }); continue; }
      admitted.push({
        subject: view.subject,
        expectedReturn: view.expectedReturn,
        confidence: view.confidence,
        source: "user-stated"
      });
    }

    return {
      state: admitted.length ? "ok" : "equilibrium-only",
      admittedViews: admitted,
      rejectedViews: rejected,
      behaviorSignalsSeen: behavior.length,
      behaviorDerivedViews: 0,
      behaviorContribution: "none",
      exclusionStatement: behavior.length
        ? behavior.length + " behaviour signal" + (behavior.length === 1 ? "" : "s") +
          " were present and contributed NO view, no return adjustment, and no confidence. " +
          "What you read is not what you believe, and optimising against an inferred view would " +
          "put words in your mouth and then act on them."
        : "No behaviour signal was present. Views come only from what you stated.",
      equilibriumOnly: admitted.length === 0,
      note: admitted.length
        ? "The candidate blends " + admitted.length + " view you stated with the equilibrium prior."
        : "No view was stated, so the candidate remains equilibrium-only rather than being given a " +
          "direction it was never told."
    };
  }

  /* ---------------------------------------------------------------------
     Scope 15 - walk-forward dossier and claim boundaries
     --------------------------------------------------------------------- */

  /**
   * Split a return sample into walk-forward folds and evaluate each separately.
   *
   * In-sample, walk-forward and cost-adjusted results are returned as THREE
   * separate figures. Collapsing them into one "backtest return" is how a rule
   * that was fitted to its own history comes to look like a discovery: the
   * in-sample number is the one the rule was chosen to maximise, so it is the
   * one that means least.
   */
  function walkForwardDossier(request) {
    if (!request || typeof request !== "object") return { state: "unavailable", reason: "request-invalid" };
    var returns = request.returns;
    if (!Array.isArray(returns) || returns.length < 4 || !returns.every(isNum)) {
      return { state: "unavailable", reason: "insufficient-sample" };
    }
    if (!Number.isInteger(request.folds) || request.folds < 2) return { state: "unavailable", reason: "folds-required" };
    if (!isNum(request.perRebalanceCostFraction) || request.perRebalanceCostFraction < 0) {
      return { state: "unavailable", reason: "cost-required" };
    }
    if (!Number.isInteger(request.rebalancesPerFold) || request.rebalancesPerFold < 0) {
      return { state: "unavailable", reason: "rebalance-count-required" };
    }
    if (!Number.isInteger(request.trialsSearched) || request.trialsSearched < 1) {
      return { state: "unavailable", reason: "trial-count-required" };
    }
    if (request.folds > Math.floor(returns.length / 2)) {
      return { state: "unavailable", reason: "folds-exceed-sample" };
    }

    var totalReturn = function (slice) {
      var wealth = 1;
      for (var i = 0; i < slice.length; i += 1) wealth = wealth * (1 + slice[i]);
      return wealth - 1;
    };

    var inSample = totalReturn(returns);

    /* Walk-forward: each fold is evaluated on the segment AFTER the one used to
       fit it. The first segment is training only and never scored, which is the
       whole point - scoring it would put the fitted window back into the result. */
    var foldSize = Math.floor(returns.length / request.folds);
    var outOfSample = [];
    for (var f = 1; f < request.folds; f += 1) {
      var start = f * foldSize;
      var end = f === request.folds - 1 ? returns.length : start + foldSize;
      outOfSample.push(totalReturn(returns.slice(start, end)));
    }
    var walkForwardWealth = 1;
    for (var w = 0; w < outOfSample.length; w += 1) walkForwardWealth *= (1 + outOfSample[w]);
    var walkForward = walkForwardWealth - 1;

    var totalCost = request.perRebalanceCostFraction * request.rebalancesPerFold * outOfSample.length;
    var costAdjusted = walkForward - totalCost;

    /* A multiple-testing correction on the reported significance. Searching many
       rules and reporting the best one without saying how many were searched is
       the single most common way a backtest overstates itself. */
    var snoopingNote = request.trialsSearched > 1
      ? request.trialsSearched + " candidate rules were searched. The best of " + request.trialsSearched +
        " will look good by chance alone, so the reported edge must be discounted for that search."
      : "One rule was evaluated, so no selection was made across candidates. That does not remove " +
        "the risk that the rule itself was chosen after looking at this history.";

    return {
      state: "ok",
      inSampleReturn: inSample,
      walkForwardReturn: walkForward,
      costAdjustedReturn: costAdjusted,
      totalCostFraction: totalCost,
      folds: request.folds,
      scoredFolds: outOfSample.length,
      perFoldReturns: outOfSample,
      trialsSearched: request.trialsSearched,
      dataSnoopingNote: snoopingNote,
      limitations: [
        "Selection bias: this rule was chosen while its own history was visible.",
        "Survivorship: the universe contains only securities that still exist and still report.",
        "Regime dependence: the sample covers one set of market conditions, not all of them.",
        "Cost model: costs are the flat per-rebalance fraction you stated, not realised fills."
      ],
      /* The refusal that defines this scope. No arrangement of historical
         numbers licenses a claim about the future. */
      provesFutureSuperiority: false,
      claimBoundary: "In-sample, walk-forward and cost-adjusted results are shown separately because " +
        "they answer different questions. None of them is evidence that this rule will outperform in " +
        "future. A historical result is a description of what happened, not a prediction, and this " +
        "dossier makes no claim of future superiority."
    };
  }

  var EFFICIENCY_FORMS = ["weak", "semi-strong", "strong"];

  /**
   * Scope a market-efficiency finding to the exact proposition that was tested.
   *
   * "The market is inefficient" is not a testable sentence. A test uses one
   * information set over one sample, so its conclusion binds one form over that
   * sample and nothing else. The generalisation is the error this guards.
   */
  function marketEfficiencyClaim(request) {
    if (!request || typeof request !== "object") return { state: "unavailable", reason: "request-invalid" };
    var missing = [];
    if (EFFICIENCY_FORMS.indexOf(request.form) === -1) missing.push("form");
    if (typeof request.informationSet !== "string" || !request.informationSet) missing.push("informationSet");
    if (typeof request.sample !== "string" || !request.sample) missing.push("sample");
    if (typeof request.test !== "string" || !request.test) missing.push("test");
    if (!isNum(request.costAdjustedEdge)) missing.push("costAdjustedEdge");
    if (missing.length) {
      return {
        state: "unavailable",
        reason: "incomplete-claim-evidence",
        missing: missing,
        note: "A market-efficiency conclusion needs the form tested, the information set, the sample, " +
          "the test, and a cost-adjusted edge. Without all five there is no proposition to report on."
      };
    }

    var untested = EFFICIENCY_FORMS.filter(function (form) { return form !== request.form; });
    return {
      state: "ok",
      form: request.form,
      informationSet: request.informationSet,
      sample: request.sample,
      test: request.test,
      costAdjustedEdge: request.costAdjustedEdge,
      untestedForms: untested,
      alternativeExplanations: [
        "Compensation for a risk the test does not model.",
        "A cost, liquidity or capacity limit that removes the edge in practice.",
        "Data snooping across the candidates that were searched.",
        "A regime present in this sample and absent from others."
      ],
      allFormsRefuted: false,
      claimBoundary: "This result speaks to the " + request.form + " form over " + request.sample +
        " using " + request.informationSet + ", and to nothing else. The " + untested.join(" and ") +
        " form" + (untested.length === 1 ? " is" : "s are") + " untested here. A cost-adjusted edge on " +
        "one sample is not evidence that markets are inefficient in general, and this product does not " +
        "claim that all market-efficiency hypotheses are false."
    };
  }

  /**
   * Research inputs for a replacement comparison — and an explicit refusal.
   *
   * "Substantially identical" is a legal and tax determination. No correlation
   * number adjudicates it, and a tool that printed a threshold would be handing
   * the user a conclusion it has no standing to reach, in a domain where being
   * wrong has consequences with a tax authority rather than a portfolio.
   */
  function replacementComparison(request) {
    if (!request || typeof request !== "object") return { state: "unavailable", reason: "request-invalid" };
    if (typeof request.subject !== "string" || !request.subject) return { state: "unavailable", reason: "subject-required" };
    if (typeof request.candidate !== "string" || !request.candidate) return { state: "unavailable", reason: "candidate-required" };

    var facts = [];
    if (isNum(request.correlation)) {
      facts.push({ kind: "correlation", value: request.correlation, label: "Historical return correlation" });
    }
    if (isNum(request.holdingsOverlapFraction)) {
      facts.push({ kind: "holdings-overlap", value: request.holdingsOverlapFraction, label: "Holdings overlap" });
    }
    if (typeof request.subjectIssuer === "string" && typeof request.candidateIssuer === "string") {
      facts.push({
        kind: "issuer",
        value: request.subjectIssuer === request.candidateIssuer ? 1 : 0,
        label: "Same issuer: " + (request.subjectIssuer === request.candidateIssuer ? "yes" : "no")
      });
    }
    if (typeof request.subjectIndex === "string" && typeof request.candidateIndex === "string") {
      facts.push({
        kind: "index",
        value: request.subjectIndex === request.candidateIndex ? 1 : 0,
        label: "Same tracked index: " + (request.subjectIndex === request.candidateIndex ? "yes" : "no")
      });
    }
    if (isNum(request.trackingDifferenceAnnual)) {
      facts.push({ kind: "tracking", value: request.trackingDifferenceAnnual, label: "Annual tracking difference" });
    }

    return {
      state: facts.length ? "ok" : "no-evidence",
      subject: request.subject,
      candidate: request.candidate,
      researchInputs: facts,
      /* All three null and false BY CONTRACT. A future change that computes a
         verdict has to delete these fields, which the tests notice. */
      substantiallyIdentical: null,
      notSubstantiallyIdentical: null,
      identityThreshold: null,
      adjudicated: false,
      claimBoundary: "These are research inputs, not a determination. Whether two securities are " +
        "substantially identical is a legal and tax question decided by tax authorities and your own " +
        "adviser on the specific facts. No correlation, overlap, issuer or tracking number decides it, " +
        "and this product applies no threshold and reaches no conclusion either way."
    };
  }

  return {
    TRADING_DAYS: TRADING_DAYS,
    CALENDAR_DAYS_PER_YEAR: CALENDAR_DAYS_PER_YEAR,
    RISK_METRIC_FAMILIES: RISK_METRIC_FAMILIES,
    alignPortfolioReturns: alignPortfolioReturns,
    computeReturnMetrics: computeReturnMetrics,
    computeDrawdown: computeDrawdown,
    deriveWeights: deriveWeights,
    deriveRiskWeights: deriveRiskWeights,
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
    scenarioMethodState: scenarioMethodState,
    runScenarioChunk: runScenarioChunk,
    runScenarioJob: runScenarioJob,
    createScenarioComputeController: createScenarioComputeController,
    applyScenarioFlows: applyScenarioFlows,
    validateScenarioDistributionSet: validateScenarioDistributionSet,
    validateScenarioResult: validateScenarioResult,
    runScenario: runCompleteScenario,
    validateCashFlow: validateCashFlow,
    scheduleCashFlows: scheduleCashFlows,
    applyCashFlows: applyCashFlows,
    computeSurvival: computeSurvival,
    compareStressDependence: compareStressDependence,
    buildDependenceSample: buildDependenceSample,
    computeStressDependence: computeStressDependence,
    forbesRigobonAdjustment: forbesRigobonAdjustment,
    lowerTailDependence: lowerTailDependence,
    computeDependenceOverlaps: computeDependenceOverlaps,
    alternativeAssetQuality: alternativeAssetQuality,
    desmoothReturns: desmoothReturns,
    computeAppraisalSensitivity: computeAppraisalSensitivity,
    fitHedgeRegression: fitHedgeRegression,
    computeHedgeVariant: computeHedgeVariant,
    compareHedgeVariants: compareHedgeVariants,
    computeHedgeComparison: computeHedgeComparison,
    validateDiversificationProjection: validateDiversificationProjection,
    computeDiversificationProjection: computeDiversificationProjection,
    ALLOCATION_METHODS: ALLOCATION_METHODS,
    evaluateFeasibility: evaluateFeasibility,
    compareAllocationMethods: compareAllocationMethods,
    allocationSensitivity: allocationSensitivity,
    blackLittermanViews: blackLittermanViews,
    blackLittermanPosterior: blackLittermanPosterior,
    walkForwardDossier: walkForwardDossier,
    marketEfficiencyClaim: marketEfficiencyClaim,
    replacementComparison: replacementComparison,
    analyticsIdentity: analyticsIdentity
  };
});
