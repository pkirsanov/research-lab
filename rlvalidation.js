(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module && module.exports) module.exports = api;
  root.RLVALID = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var freezeResult = function (value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { freezeResult(value[key]); });
    return Object.freeze(value);
  };
  var fail = function (code, observed, required) {
    return freezeResult({ ok: false, errors: [{ code: code, observed: observed, required: required }] });
  };
  var finite = function (value) { return typeof value === "number" && Number.isFinite(value); };
  var clampProbability = function (value) { return Math.max(0, Math.min(1, value)); };
  var normalCdf = function (x) {
    var t = 1 / (1 + 0.2316419 * Math.abs(x));
    var density = 0.3989422804014327 * Math.exp(-x * x / 2);
    var tail = density * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x >= 0 ? 1 - tail : tail;
  };
  var inverseNormal = function (probability) {
    if (probability <= 0) return -38;
    if (probability >= 1) return 38;
    var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    var b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    var c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    var d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    var lower = 0.02425, upper = 1 - lower, q, r;
    if (probability < lower) {
      q = Math.sqrt(-2 * Math.log(probability));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (probability <= upper) {
      q = probability - 0.5; r = q * q;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    }
    q = Math.sqrt(-2 * Math.log(1 - probability));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  };

  function rlvBuildPurgedFolds(observationCount, foldCount, trainRatio, purgeBars, embargoBars) {
    if (!Number.isInteger(observationCount) || observationCount < 1) return fail("RLV-FOLD-COUNT", observationCount, "positive integer observation count");
    if (!Number.isInteger(foldCount) || foldCount < 2 || foldCount > observationCount) return fail("RLV-FOLD-FOLDS", foldCount, "integer folds between 2 and observation count");
    if (!finite(trainRatio) || trainRatio <= 0 || trainRatio >= 1) return fail("RLV-FOLD-RATIO", trainRatio, "finite ratio between zero and one");
    if (!Number.isInteger(purgeBars) || purgeBars < 0 || !Number.isInteger(embargoBars) || embargoBars < 0) return fail("RLV-FOLD-GAP", [purgeBars, embargoBars], "non-negative integer purge and embargo bars");
    var foldLength = Math.floor(observationCount / foldCount), folds = [], index;
    for (index = 0; index < foldCount; index++) {
      var foldStart = index * foldLength;
      var foldEnd = index === foldCount - 1 ? observationCount : foldStart + foldLength;
      var split = foldStart + Math.floor((foldEnd - foldStart) * trainRatio);
      var trainEnd = Math.max(foldStart, split - purgeBars);
      var testStart = Math.min(foldEnd, split + embargoBars);
      if (trainEnd <= foldStart || testStart >= foldEnd) return fail("RLV-FOLD-EMPTY", index, "every fold must retain non-empty train and test ranges");
      folds.push(freezeResult({ fold: index + 1, foldStart: foldStart, foldEnd: foldEnd, trainStart: foldStart, trainEnd: trainEnd, testStart: testStart, testEnd: foldEnd, purgeBars: purgeBars, embargoBars: embargoBars }));
    }
    return freezeResult({ ok: true, observationCount: observationCount, foldCount: foldCount, trainRatio: trainRatio, purgeBars: purgeBars, embargoBars: embargoBars, folds: folds });
  }

  function rlvAdjustBenjaminiHochberg(pValues) {
    if (!Array.isArray(pValues) || !pValues.length || pValues.some(function (value) { return !finite(value) || value < 0 || value > 1; })) return fail("RLV-BH-PVALUES", pValues, "non-empty finite probabilities");
    var ranked = pValues.map(function (value, index) { return { value: value, index: index }; }).sort(function (left, right) { return left.value - right.value || left.index - right.index; });
    var adjustedRanked = new Array(ranked.length), running = 1, index;
    for (index = ranked.length - 1; index >= 0; index--) {
      running = Math.min(running, ranked[index].value * ranked.length / (index + 1));
      adjustedRanked[index] = clampProbability(running);
    }
    var adjusted = new Array(ranked.length);
    ranked.forEach(function (entry, rank) { adjusted[entry.index] = adjustedRanked[rank]; });
    return freezeResult({ ok: true, method: "benjamini-hochberg", adjusted: adjusted });
  }

  function rlvAdjustHolm(pValues) {
    if (!Array.isArray(pValues) || !pValues.length || pValues.some(function (value) { return !finite(value) || value < 0 || value > 1; })) return fail("RLV-HOLM-PVALUES", pValues, "non-empty finite probabilities");
    var ranked = pValues.map(function (value, index) { return { value: value, index: index }; }).sort(function (left, right) { return left.value - right.value || left.index - right.index; });
    var adjusted = new Array(ranked.length), running = 0;
    ranked.forEach(function (entry, rank) {
      running = Math.max(running, (ranked.length - rank) * entry.value);
      adjusted[entry.index] = clampProbability(running);
    });
    return freezeResult({ ok: true, method: "holm", adjusted: adjusted });
  }

  function rlvDeflatedSharpe(equityCurve, trialCount, annualization) {
    if (!Array.isArray(equityCurve) || equityCurve.length < 20 || equityCurve.some(function (value) { return !finite(value) || value <= 0; })) return fail("RLV-DSR-CURVE", equityCurve && equityCurve.length, "at least 20 finite positive equity observations");
    if (!Number.isInteger(trialCount) || trialCount < 1) return fail("RLV-DSR-TRIALS", trialCount, "positive integer trial count");
    if (!finite(annualization) || annualization <= 0) return fail("RLV-DSR-ANNUALIZATION", annualization, "positive finite annualization");
    var returns = [], index;
    for (index = 1; index < equityCurve.length; index++) returns.push(equityCurve[index] / equityCurve[index - 1] - 1);
    if (returns.length < 8) return fail("RLV-DSR-RETURNS", returns.length, "at least eight returns");
    var mean = returns.reduce(function (sum, value) { return sum + value; }, 0) / returns.length;
    var m2 = 0, m3 = 0, m4 = 0;
    returns.forEach(function (value) { var delta = value - mean; m2 += delta * delta; m3 += delta * delta * delta; m4 += delta * delta * delta * delta; });
    m2 /= returns.length; m3 /= returns.length; m4 /= returns.length;
    var standardDeviation = Math.sqrt(m2);
    if (standardDeviation === 0) standardDeviation = 1e-12;
    var sharpe = mean / standardDeviation;
    var skew = m3 / Math.pow(standardDeviation, 3);
    var kurtosis = m4 / (m2 * m2);
    var denominator = Math.sqrt(Math.max(1e-9, 1 - skew * sharpe + ((kurtosis - 1) / 4) * sharpe * sharpe));
    var probability = function (threshold) { return normalCdf(((sharpe - threshold) * Math.sqrt(Math.max(1, returns.length - 1))) / denominator); };
    var standardError = denominator / Math.sqrt(Math.max(1, returns.length - 1));
    var eulerMascheroni = 0.5772156649;
    var expectedMaximum = (1 - eulerMascheroni) * inverseNormal(1 - 1 / trialCount) + eulerMascheroni * inverseNormal(1 - 1 / (trialCount * Math.E));
    var adjustedThreshold = standardError * expectedMaximum;
    return freezeResult({ ok: true, psr: probability(0), dsr: probability(adjustedThreshold), srAnn: sharpe * Math.sqrt(annualization), nTrials: trialCount, n: returns.length });
  }

  function rlvWilsonInterval(wins, total, zScore) {
    if (!Number.isInteger(wins) || !Number.isInteger(total) || wins < 0 || total < 1 || wins > total) return fail("RLV-WILSON-COUNTS", [wins, total], "integer counts with zero through total wins");
    if (!finite(zScore) || zScore <= 0) return fail("RLV-WILSON-Z", zScore, "positive finite z score");
    var proportion = wins / total;
    var denominator = 1 + zScore * zScore / total;
    var center = (proportion + zScore * zScore / (2 * total)) / denominator;
    var margin = zScore * Math.sqrt((proportion * (1 - proportion) + zScore * zScore / (4 * total)) / total) / denominator;
    return freezeResult({ ok: true, proportion: proportion, lower: clampProbability(center - margin), upper: clampProbability(center + margin), wins: wins, total: total, zScore: zScore });
  }

  function rlvQuantiles(values, probabilities) {
    if (!Array.isArray(values) || !values.length || values.some(function (value) { return !finite(value); })) return fail("RLV-QUANTILE-VALUES", values, "non-empty finite values");
    if (!Array.isArray(probabilities) || !probabilities.length || probabilities.some(function (value) { return !finite(value) || value < 0 || value > 1; })) return fail("RLV-QUANTILE-PROBABILITIES", probabilities, "finite probabilities from zero through one");
    var sorted = values.slice().sort(function (left, right) { return left - right; });
    var quantiles = probabilities.map(function (probability) {
      var position = (sorted.length - 1) * probability;
      var lower = Math.floor(position), upper = Math.ceil(position);
      return lower === upper ? sorted[lower] : sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
    });
    return freezeResult({ ok: true, probabilities: probabilities.slice(), values: quantiles });
  }

  function rlvSummarizeOutcomes(outcomes) {
    if (!Array.isArray(outcomes) || !outcomes.length || outcomes.some(function (value) { return !finite(value); })) return fail("RLV-OUTCOME-VALUES", outcomes, "non-empty finite outcome values");
    var wins = outcomes.filter(function (value) { return value > 0; });
    var losses = outcomes.filter(function (value) { return value < 0; });
    var unresolved = outcomes.length - wins.length - losses.length;
    var sum = function (values) { return values.reduce(function (total, value) { return total + value; }, 0); };
    var quantileResult = rlvQuantiles(outcomes, [0.25, 0.5, 0.75]);
    return freezeResult({
      ok: true,
      count: outcomes.length,
      wins: wins.length,
      losses: losses.length,
      unresolved: unresolved,
      winRate: wins.length / outcomes.length,
      averageWin: wins.length ? sum(wins) / wins.length : null,
      averageLoss: losses.length ? sum(losses) / losses.length : null,
      mean: sum(outcomes) / outcomes.length,
      quantiles: quantileResult.values
    });
  }

  return Object.freeze({
    rlvBuildPurgedFolds: rlvBuildPurgedFolds,
    rlvAdjustBenjaminiHochberg: rlvAdjustBenjaminiHochberg,
    rlvAdjustHolm: rlvAdjustHolm,
    rlvDeflatedSharpe: rlvDeflatedSharpe,
    rlvWilsonInterval: rlvWilsonInterval,
    rlvQuantiles: rlvQuantiles,
    rlvSummarizeOutcomes: rlvSummarizeOutcomes
  });
});