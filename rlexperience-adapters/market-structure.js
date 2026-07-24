/*
 * rlexperience-adapters/market-structure.js
 * ------------------------------------------------------------------------
 * Feature 012 Scope 05 — Market-Structure Simple adapters.
 *
 * This module is the SINGLE OWNER SOURCE for the market-structure Simple
 * model formulas. The owning tool pages consume the exact same exported pure
 * owner functions in their Power path (see market-heatmap-lab.html), and the
 * registered Simple adapters call the same functions — so Simple and Power
 * share one formula and no formula is copied inline (owner-parity).
 *
 * Adapters are PURE COMPUTE over already-captured, frozen owner state. They
 * NEVER fetch, providerFetch, read local credentials, call an LLM, a public
 * publisher, or a private store; they never mutate owner state; and they never
 * import another domain adapter module. Data acquisition (RLDATA cache reads)
 * stays in the owning page; the page hands the adapter an already-loaded,
 * frozen owner snapshot through captureEvidence.
 *
 * Registration is by the exact declared adapter IDs from simple-models.json.
 * A tool whose owner seam is not yet extracted is simply absent from the
 * returned adapter set, so the shared runtime renders the Scope 04 explicit
 * "unavailable" truth state for it — never an invented signal or default.
 *
 * Ships as a UMD dual module: Node (module.exports) for tests, and browser
 * global RLMARKETSTRUCTURE for the owning pages.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLMARKETSTRUCTURE_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLMARKETSTRUCTURE = api;
})(function () {
  "use strict";

  /* ═══════════ pure owner functions (single source; consumed by Power + Simple) ═══════════ */

  /* Bars back per return window. Mirrors market-heatmap-lab.html WIN_BARS. */
  var WINDOW_BARS = { "1d": 1, "1w": 5, "1m": 21 };

  /* % change over a window from ascending OHLCV rows carrying `.c`. Byte-identical
     behaviour to the market-heatmap-lab.html `pctOver` owner function. */
  function pctOverWindow(rows, win) {
    if (!Array.isArray(rows) || rows.length < 2) return null;
    var last = rows[rows.length - 1];
    if (!last || !isFinite(last.c)) return null;
    var i = rows.length - 1 - win;
    if (i < 0) i = 0;
    var base = rows[i];
    if (!base || !isFinite(base.c) || base.c === 0) return null;
    return (last.c / base.c - 1) * 100;
  }

  /* mean + sample stdev of a numeric array; sd=0 when <2 points. Byte-identical
     behaviour to the market-heatmap-lab.html `meanSd` owner function. */
  function meanSampleSd(xs) {
    var v = (xs || []).filter(function (x) { return isFinite(x); });
    var n = v.length, i, m = 0;
    if (!n) return { mean: 0, sd: 0 };
    for (i = 0; i < n; i++) m += v[i];
    m /= n;
    if (n < 2) return { mean: m, sd: 0 };
    var s = 0;
    for (i = 0; i < n; i++) { var d = v[i] - m; s += d * d; }
    return { mean: m, sd: Math.sqrt(s / (n - 1)) };
  }

  /* one-line breadth read from cells [{pct,...}]. Byte-identical behaviour to the
     market-heatmap-lab.html `breadthRead` owner function. */
  function breadthReadCells(cells) {
    var green = 0, tot = 0, leader = null, laggard = null, i, c;
    for (i = 0; i < (cells || []).length; i++) {
      c = cells[i];
      if (!c || !isFinite(c.pct)) continue;
      tot++;
      if (c.pct > 0) green++;
      if (!leader || c.pct > leader.pct) leader = c;
      if (!laggard || c.pct < laggard.pct) laggard = c;
    }
    var frac = tot ? green / tot : 0;
    var bias = !tot ? "n/a" : (frac > 0.6 ? "risk-on" : (frac < 0.4 ? "risk-off" : "mixed"));
    return { green: green, total: tot, leader: leader, laggard: laggard, bias: bias, frac: frac };
  }

  /* ═══════════ market-breadth Simple model (owner formula) ═══════════
     Given already-captured owner constituents, compute the steerable breadth
     model whose declared output paths are exactly:
       window            -> summary.leadership
       grouping          -> summary.groups
       size-metric       -> summary.breadth
       breadth-threshold -> summary.leadership
       outlier-sigma     -> summary.outliers
     Every value derives from the pure owner functions above; nothing is
     fabricated or defaulted. */

  function isFiniteNumber(value) { return typeof value === "number" && isFinite(value); }

  function constituentReturn(constituent, window) {
    var returns = constituent && constituent.returns;
    if (!returns || !Object.prototype.hasOwnProperty.call(returns, window)) return null;
    var value = returns[window];
    return isFiniteNumber(value) ? value : null;
  }

  function constituentWeight(constituent, sizeMetric) {
    if (sizeMetric === "equal") return 1;
    if (sizeMetric === "dollar-volume") {
      var dv = constituent && constituent.dollarVol;
      return isFiniteNumber(dv) && dv > 0 ? dv : 0.0001;
    }
    // index-weight
    var weight = constituent && constituent.weight;
    return isFiniteNumber(weight) && weight > 0 ? weight : 0.01;
  }

  function groupKeyOf(constituent, grouping) {
    if (grouping === "industry") return String(constituent && constituent.industry || "unavailable");
    return String(constituent && constituent.sector || "unavailable");
  }

  function roundTo(value, digits) {
    if (!isFiniteNumber(value)) return null;
    var factor = Math.pow(10, digits);
    return Math.round(value * factor) / factor;
  }

  /* Compute the full breadth model output.values.summary from frozen owner state. */
  function computeBreadthSummary(ownerState, params) {
    var window = params.window;
    var grouping = params.grouping;
    var sizeMetric = params["size-metric"];
    var breadthThreshold = params["breadth-threshold"];
    var outlierSigma = params["outlier-sigma"];

    var constituents = (ownerState && Array.isArray(ownerState.constituents)) ? ownerState.constituents : [];

    // Per-constituent window return + weight + group.
    var scored = constituents.map(function (constituent) {
      return {
        ticker: String(constituent.ticker),
        group: groupKeyOf(constituent, grouping),
        ret: constituentReturn(constituent, window),
        weight: constituentWeight(constituent, sizeMetric)
      };
    });
    var priced = scored.filter(function (row) { return isFiniteNumber(row.ret); });

    // Weighted breadth over the whole tape (size-metric + window sensitive).
    var totalWeight = 0, positiveWeight = 0, i;
    for (i = 0; i < priced.length; i++) {
      totalWeight += priced[i].weight;
      if (priced[i].ret > 0) positiveWeight += priced[i].weight;
    }
    var breadthPct = totalWeight > 0 ? (positiveWeight / totalWeight) * 100 : 0;

    // Leadership state (breadth-threshold + window sensitive).
    var margin = breadthPct - breadthThreshold;
    var leadershipState = margin >= 0 ? "broad" : "narrow";

    // Per-group breadth (grouping sensitive).
    var groupIndex = Object.create(null);
    var groupOrder = [];
    for (i = 0; i < priced.length; i++) {
      var key = priced[i].group;
      if (!groupIndex[key]) { groupIndex[key] = { group: key, weight: 0, positive: 0, count: 0 }; groupOrder.push(key); }
      groupIndex[key].weight += priced[i].weight;
      groupIndex[key].count += 1;
      if (priced[i].ret > 0) groupIndex[key].positive += priced[i].weight;
    }
    var groups = groupOrder.sort().map(function (key) {
      var record = groupIndex[key];
      return {
        group: key,
        count: record.count,
        breadthPct: roundTo(record.weight > 0 ? (record.positive / record.weight) * 100 : 0, 2)
      };
    });

    // Within-group z-score outliers (outlier-sigma + grouping/window sensitive).
    var byGroup = Object.create(null);
    for (i = 0; i < priced.length; i++) {
      (byGroup[priced[i].group] = byGroup[priced[i].group] || []).push(priced[i]);
    }
    var outliers = [];
    Object.keys(byGroup).forEach(function (key) {
      var members = byGroup[key];
      var stats = meanSampleSd(members.map(function (m) { return m.ret; }));
      members.forEach(function (member) {
        var z = stats.sd > 0 ? (member.ret - stats.mean) / stats.sd : 0;
        if (Math.abs(z) >= outlierSigma) {
          outliers.push({ ticker: member.ticker, group: key, ret: roundTo(member.ret, 2), z: roundTo(z, 3) });
        }
      });
    });
    outliers.sort(function (a, b) {
      var d = Math.abs(b.z) - Math.abs(a.z);
      if (d !== 0) return d;
      return a.ticker < b.ticker ? -1 : (a.ticker > b.ticker ? 1 : 0);
    });

    return {
      window: window,
      grouping: grouping,
      sizeMetric: sizeMetric,
      breadthThreshold: breadthThreshold,
      outlierSigma: outlierSigma,
      pricedCount: priced.length,
      coverageCount: constituents.length,
      breadth: {
        pct: roundTo(breadthPct, 2),
        positiveWeight: roundTo(positiveWeight, 6),
        totalWeight: roundTo(totalWeight, 6),
        count: priced.length
      },
      leadership: {
        state: leadershipState,
        breadthPct: roundTo(breadthPct, 2),
        threshold: breadthThreshold,
        margin: roundTo(margin, 2)
      },
      groups: groups,
      outliers: outliers
    };
  }

  /* ═══════════ owner-state capture reducer (browser page helper) ═══════════
     Reduce an already-loaded RLDATA cache (via a bars(ticker, "1d") reader) plus
     a universe of constituents into the frozen owner snapshot the adapter
     consumes. This performs NO fetch — it only reads whatever the caller passes
     from the shared cache. Kept here so both the page and tests build owner
     state the same way. */
  function reduceOwnerState(options) {
    var constituents = (options && Array.isArray(options.constituents)) ? options.constituents : [];
    var barsReader = options && typeof options.barsReader === "function" ? options.barsReader : null;
    var reduced = constituents.map(function (entry) {
      var rows = barsReader ? barsReader(entry.ticker) : (entry.rows || null);
      var returns = {
        "1d": pctOverWindow(rows, WINDOW_BARS["1d"]),
        "1w": pctOverWindow(rows, WINDOW_BARS["1w"]),
        "1m": pctOverWindow(rows, WINDOW_BARS["1m"])
      };
      var lastRow = Array.isArray(rows) && rows.length ? rows[rows.length - 1] : null;
      var dollarVol = (lastRow && isFiniteNumber(lastRow.c) && isFiniteNumber(lastRow.v)) ? lastRow.c * lastRow.v : 0;
      return {
        ticker: String(entry.ticker),
        sector: String(entry.sector || "unavailable"),
        industry: String(entry.industry || entry.sector || "unavailable"),
        weight: isFiniteNumber(entry.weight) && entry.weight > 0 ? entry.weight : 0.01,
        dollarVol: dollarVol,
        returns: returns
      };
    });
    return {
      contractVersion: "market-structure-owner-state/v1",
      toolId: "market-heatmap-lab",
      asOf: String(options && options.asOf || "unavailable"),
      source: String(options && options.source || "shared cache snapshot"),
      constituents: reduced
    };
  }

  /* ═══════════ Simple adapter contract wiring ═══════════ */

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function fingerprintOf(api, value) {
    var result = api.fingerprint(value);
    // api.fingerprint returns the raw "sha256:..." string.
    return result;
  }

  /* Compute the Scope 04 simple-evidence-identity/v1 fingerprint for an evidence
     snapshot, matching rlexperience.js simpleEvidenceIdentity EXACTLY. This is
     shared framework infrastructure, not an owner formula. */
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

  /* Build a valid simple-evidence-snapshot/v1 from a frozen owner snapshot. */
  function buildBreadthEvidence(api, ownerState) {
    var priced = (ownerState.constituents || []).filter(function (constituent) {
      return isFiniteNumber(constituentReturn(constituent, "1d")) ||
        isFiniteNumber(constituentReturn(constituent, "1w")) ||
        isFiniteNumber(constituentReturn(constituent, "1m"));
    });
    var state = priced.length > 0 ? "ready" : "unavailable";
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "market-heatmap-lab",
      state: state,
      evidenceCutoff: ownerState.asOf,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:market-heatmap-lab:breadth:" + ownerState.asOf,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: ownerState.asOf,
        retrievedOrPublishedAt: ownerState.asOf,
        freshness: "cache-current-for-render",
        dataTier: ownerState.source,
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Breadth uses only the constituents currently present in the frozen owner snapshot."
      ],
      limitations: [
        "The breadth model describes the selected historical window and does not establish persistence or a recommendation."
      ],
      invalidationConditions: [
        "The owner snapshot changes, gains or loses constituents, or a later observation replaces the current window."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function breadthOutput(input, summary) {
    var provenanceClasses = summary.pricedCount < summary.coverageCount
      ? ["observed-fact", "model-estimate"]
      : ["observed-fact"];
    var calibrationReason = summary.pricedCount + " of " + summary.coverageCount +
      " constituents carry a complete owner return window.";
    var uncertaintyState = summary.pricedCount >= 2 ? "bounded" : "wide";
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: calibrationReason },
      provenance: { classes: provenanceClasses, evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: uncertaintyState,
        rangeOrBand: "Breadth " + summary.breadth.pct + "% (" + summary.leadership.state + " leadership)",
        reason: "Breadth and outliers use the exact frozen owner returns currently captured."
      },
      assumptions: [
        "Constituents without a complete window return are excluded from breadth."
      ],
      limitations: [
        "The breadth model describes the selected historical window and does not establish persistence or a recommendation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes or a later observation replaces the current window."
      ],
      flatRegionProofs: []
    };
  }

  /* affectsOutputPaths for the market-breadth parameters. Used to prove the
     declared output path actually moves (or a modeled flat region is proved). */
  var BREADTH_OUTPUT_PATHS = {
    "window": ["summary.leadership"],
    "grouping": ["summary.groups"],
    "size-metric": ["summary.breadth"],
    "breadth-threshold": ["summary.leadership"],
    "outlier-sigma": ["summary.outliers"]
  };

  function summaryPath(summary, path) {
    if (path === "summary.leadership") return summary.leadership;
    if (path === "summary.groups") return summary.groups;
    if (path === "summary.breadth") return summary.breadth;
    if (path === "summary.outliers") return summary.outliers;
    return null;
  }

  function createMarketBreadthAdapter(api, definition, ownerByIdentity) {
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
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.constituents)) {
          return { ok: false, error: { reason: "owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildBreadthEvidence(api, frozen);
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
        var summary = computeBreadthSummary(ownerState, paramMap(input));
        return { ok: true, value: breadthOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeBreadthSummary(ownerState, baselineValues);
        var currentSummary = computeBreadthSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = BREADTH_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, summaryPath(baselineSummary, path)) !== fingerprintOf(api, summaryPath(currentSummary, path));
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
              reason: "The frozen owner snapshot yields an identical value on these paths for this parameter change."
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
            valueText: summary.leadership.state === "broad" ? "Broad leadership" : "Narrow leadership",
            numericValue: summary.breadth.pct,
            unit: "percent",
            summary: summary.leadership.state === "broad"
              ? "Breadth " + summary.breadth.pct + "% clears the " + summary.leadership.threshold + "% threshold: broad leadership."
              : "Breadth " + summary.breadth.pct + "% is below the " + summary.leadership.threshold + "% threshold: narrow leadership.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ conditional-volatility Simple model (owner seam = rlvol.js) ═══════════
     The owning volatility formula (EWMA/GARCH estimator, regime percentile band,
     capped-and-floored sizing throttle) already lives ONLY in rlvol.js, and
     volatility-sizing-lab.html already consumes RLVOL.buildVolDecisionRead in its
     Power path. This adapter is therefore single-sourced by construction: it
     consumes the SAME rlvol formula through dependency injection (deps.rlvol),
     never re-implements a formula, never fetches, and requires no owner-page edit.

     Declared output paths (each enabled parameter moves exactly one):
       estimator          -> summary.forecast
       window             -> summary.regime
       target-volatility  -> summary.throttle
       multiplier-cap     -> summary.throttle
       volatility-floor   -> summary.throttle
       notional           -> summary.cashExample
       horizon            -> summary.forecast   */

  var VOLATILITY_OUTPUT_PATHS = {
    "estimator": ["summary.forecast"],
    "window": ["summary.regime"],
    "target-volatility": ["summary.throttle"],
    "multiplier-cap": ["summary.throttle"],
    "volatility-floor": ["summary.throttle"],
    "notional": ["summary.cashExample"],
    "horizon": ["summary.forecast"]
  };

  function volEstimatorControl(value) { return value === "garch" ? "garch11" : "ewma"; }

  function volNumber(value) { return isFiniteNumber(value) ? value : null; }

  /* Reconstruct the exact rlvol.buildVolDecisionRead input from frozen owner state
     plus the current Simple parameter values. WHICH bars/asset/policy are used is
     owner-owned and frozen; the Simple parameters only steer the declared controls
     and the sizing cap/floor policy. Percent-unit parameters convert to the decimal
     units rlvol expects. This is the single mapping both the parity test and the
     adapter consume; it copies no formula. */
  function buildVolatilityInput(ownerState, params) {
    var asset = {};
    Object.keys(ownerState.asset).forEach(function (key) { asset[key] = ownerState.asset[key]; });
    asset.regimeWindowObs = params.window;
    var policy = JSON.parse(JSON.stringify(ownerState.policy));
    policy.sizing = policy.sizing && typeof policy.sizing === "object" ? policy.sizing : {};
    policy.sizing.cap = params["multiplier-cap"];
    policy.sizing.forecastVolFloor = params["volatility-floor"] / 100;
    return {
      decisionTime: ownerState.decisionTime,
      configVersion: ownerState.configVersion,
      controls: {
        asset: ownerState.asset.symbol,
        estimator: volEstimatorControl(params.estimator),
        termLengthDays: params.horizon,
        targetVol: params["target-volatility"] / 100,
        notional: params.notional,
        historyRange: ownerState.historyRange
      },
      asset: asset,
      policy: policy,
      bars: {
        rows: ownerState.bars.rows,
        observedAsOf: ownerState.bars.observedAsOf,
        retrievedAt: ownerState.bars.retrievedAt,
        source: ownerState.bars.source
      }
    };
  }

  /* Compute the conditional-volatility summary by delegating to the single owner
     formula rlvol.buildVolDecisionRead and projecting the exact owner facts into the
     declared Simple output paths. rlvol is injected (never imported/global here). */
  function computeVolatilitySummary(rlvol, ownerState, params) {
    var decision = rlvol.buildVolDecisionRead(buildVolatilityInput(ownerState, params));
    var forecast = decision.forecast || {};
    var forecastValue = volNumber(forecast.value);
    var term = (decision.term && Array.isArray(decision.term.points)) ? decision.term.points : [];
    var persistence = decision.persistence || {};
    var regime = decision.regime || {};
    var sizing = decision.sizing || {};
    var controls = decision.controls || {};
    var worked = sizing.workedExample || null;
    return {
      decisionState: decision.state,
      forecast: {
        state: forecastValue !== null ? "ready" : "unavailable",
        estimator: (decision.diagnostics && decision.diagnostics.estimatorResolved) || controls.estimator || null,
        annualizedDecimal: forecastValue,
        annualizedPct: forecastValue !== null ? roundTo(forecastValue * 100, 4) : null,
        horizonDays: isFiniteNumber(controls.termLengthDays) ? controls.termLengthDays : params.horizon,
        termLength: term.length,
        termPoints: term.map(function (point) {
          return { horizonDays: point.horizonDays, volPct: roundTo(point.vol * 100, 4) };
        }),
        persistence: volNumber(persistence.persistence),
        halfLifeDays: volNumber(persistence.halfLifeDays)
      },
      regime: {
        state: regime.state || "unavailable",
        band: (typeof regime.band === "string") ? regime.band : null,
        percentile: volNumber(regime.percentile) !== null ? roundTo(regime.percentile, 3) : null,
        windowObservations: (regime.windowRef && isFiniteNumber(regime.windowRef.observations)) ? regime.windowRef.observations : null,
        managedSuppressed: regime.managedSuppressed === true
      },
      throttle: {
        state: sizing.state || "unavailable",
        multiplier: volNumber(sizing.multiplier),
        targetVolDecimal: volNumber(controls.targetVol),
        targetVolPct: isFiniteNumber(controls.targetVol) ? roundTo(controls.targetVol * 100, 4) : null,
        capMultiplier: volNumber(sizing.cap),
        floorDecimal: volNumber(sizing.forecastVolFloor),
        floorPct: volNumber(sizing.forecastVolFloor) !== null ? roundTo(sizing.forecastVolFloor * 100, 4) : null,
        forecastVolDecimal: forecastValue
      },
      cashExample: {
        notional: isFiniteNumber(controls.notional) ? controls.notional : params.notional,
        conditionalExposure: worked ? volNumber(worked.conditionalExposure) : null
      }
    };
  }

  function volatilityEvidenceState(ownerState) {
    var rows = (ownerState.bars && Array.isArray(ownerState.bars.rows)) ? ownerState.bars.rows : [];
    var validCloses = 0;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i] && isFiniteNumber(rows[i].c) && rows[i].c > 0) validCloses++;
    }
    var minObs = (ownerState.asset && isFiniteNumber(ownerState.asset.minForecastObs)) ? ownerState.asset.minForecastObs : 0;
    return (validCloses >= 2 && (validCloses - 1) >= minObs) ? "ready" : "unavailable";
  }

  function buildVolatilityEvidence(api, ownerState) {
    var state = volatilityEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || (ownerState.bars && ownerState.bars.observedAsOf) || "unavailable");
    var symbol = ownerState.asset && ownerState.asset.symbol ? String(ownerState.asset.symbol) : "unknown";
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "volatility-sizing-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:volatility-sizing-lab:" + symbol + ":" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: String((ownerState.bars && ownerState.bars.observedAsOf) || cutoff),
        retrievedOrPublishedAt: String((ownerState.bars && ownerState.bars.retrievedAt) || cutoff),
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source && ownerState.source.id ? ownerState.source.id : "shared cache snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Conditional volatility uses only the frozen owner bar window currently captured."
      ],
      limitations: [
        "The conditional-volatility model is magnitude-only and does not infer direction or execute a position."
      ],
      invalidationConditions: [
        "The frozen owner bars change or a later observation replaces the current window."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function volatilityOutput(input, summary) {
    var outputState = summary.decisionState;
    var scenarioValues = { summary: summary };
    var readyForecast = summary.forecast.state === "ready";
    var bandText = summary.regime.band || "unavailable";
    return {
      contractVersion: "simple-model-output/v1",
      state: outputState,
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: outputState, values: scenarioValues };
      }),
      calibration: {
        state: "owner-evidence-relative",
        reason: "Forecast, regime, and sizing derive from the frozen owner return window through the rlvol.js decision formula."
      },
      provenance: { classes: ["observed-fact", "model-estimate"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: (readyForecast && !summary.regime.managedSuppressed) ? "bounded" : "wide",
        rangeOrBand: readyForecast
          ? ("Forecast " + summary.forecast.annualizedPct + "% annualized; regime " + bandText)
          : "Owner volatility evidence is unavailable for this window.",
        reason: "Magnitude-only conditional volatility; the throttle is capped and floored and carries no directional or execution claim."
      },
      assumptions: [
        "The conditional-volatility model is magnitude-only and derives from the frozen owner return window."
      ],
      limitations: [
        "The declaration is magnitude-only and cannot infer direction or execute a position."
      ],
      invalidationConditions: [
        "The frozen owner bars change, a later observation replaces the current window, or the estimator/regime policy changes."
      ],
      flatRegionProofs: []
    };
  }

  function volatilitySummaryPath(summary, path) {
    if (path === "summary.forecast") return summary.forecast;
    if (path === "summary.regime") return summary.regime;
    if (path === "summary.throttle") return summary.throttle;
    if (path === "summary.cashExample") return summary.cashExample;
    return null;
  }

  function createConditionalVolatilityAdapter(api, definition, ownerByIdentity, rlvol) {
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
        if (!ownerState || typeof ownerState !== "object" || !ownerState.bars ||
          !Array.isArray(ownerState.bars.rows) || !ownerState.asset || !ownerState.policy) {
          return { ok: false, error: { reason: "volatility owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildVolatilityEvidence(api, frozen);
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
        var summary = computeVolatilitySummary(rlvol, ownerState, paramMap(input));
        return { ok: true, value: volatilityOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeVolatilitySummary(rlvol, ownerState, baselineValues);
        var currentSummary = computeVolatilitySummary(rlvol, ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = VOLATILITY_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, volatilitySummaryPath(baselineSummary, path)) !== fingerprintOf(api, volatilitySummaryPath(currentSummary, path));
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
              reason: "The frozen owner decision yields an identical value on these paths for this parameter change."
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
        var ready = summary.forecast.state === "ready";
        var multiplierText = summary.throttle.multiplier !== null ? "×" + summary.throttle.multiplier.toFixed(2) : "withheld";
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: ready
              ? "Forecast " + summary.forecast.annualizedPct + "% (" + (summary.regime.band || "regime unavailable") + ")"
              : "Volatility evidence unavailable",
            numericValue: ready ? summary.forecast.annualizedDecimal : null,
            unit: "annualized-decimal",
            summary: ready
              ? "Forecast volatility " + summary.forecast.annualizedPct + "% with a " + multiplierText +
                " capped sizing throttle in a " + (summary.regime.band || "unavailable") + " regime."
              : "The owner volatility decision is unavailable for the current window.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* Factory: returns the market-structure Simple adapters that are implemented
     at genuine owner-parity, keyed by their exact declared adapter ID. Tools
     whose owner seam is not yet extracted are intentionally absent so the shared
     runtime renders the explicit unavailable state for them. Adapters whose owner
     seam is an injected foundation module (conditional-volatility -> rlvol.js) are
     only produced when that dependency is supplied. */
  function createMarketStructureAdapters(api, definitions, deps) {
    if (!api || typeof api.fingerprint !== "function" || typeof api.normalizeSimpleInput !== "function") {
      throw new Error("RLMARKETSTRUCTURE_REQUIRES_RLEXPERIENCE_API");
    }
    var byToolId = Object.create(null);
    (definitions || []).forEach(function (definition) { byToolId[definition.toolId] = definition; });
    var adapters = Object.create(null);
    var ownerByIdentity = new Map();
    if (byToolId["market-heatmap-lab"]) {
      var breadthDefinition = byToolId["market-heatmap-lab"];
      adapters[breadthDefinition.adapterId] = createMarketBreadthAdapter(api, breadthDefinition, ownerByIdentity);
    }
    var rlvol = deps && deps.rlvol;
    if (byToolId["volatility-sizing-lab"] && rlvol && typeof rlvol.buildVolDecisionRead === "function") {
      var volDefinition = byToolId["volatility-sizing-lab"];
      adapters[volDefinition.adapterId] = createConditionalVolatilityAdapter(api, volDefinition, ownerByIdentity, rlvol);
    }
    return adapters;
  }

  /* Register every implemented market-structure adapter with a live shared
     runtime. Returns the per-adapter registration result so the caller can
     surface honest registration failures. */
  function registerMarketStructureAdapters(runtime, api, definitions, deps) {
    var adapters = createMarketStructureAdapters(api, definitions, deps);
    var results = Object.create(null);
    Object.keys(adapters).forEach(function (adapterId) {
      results[adapterId] = runtime.registerAdapter(adapters[adapterId]);
    });
    return results;
  }

  return {
    contractVersion: "market-structure-adapters/v1",
    module: "rlexperience-adapters/market-structure.js",
    supportedAdapterIds: ["simple-adapter/market-breadth/v1", "simple-adapter/conditional-volatility/v1"],
    WINDOW_BARS: WINDOW_BARS,
    pctOverWindow: pctOverWindow,
    meanSampleSd: meanSampleSd,
    breadthReadCells: breadthReadCells,
    computeBreadthSummary: computeBreadthSummary,
    reduceOwnerState: reduceOwnerState,
    buildVolatilityInput: buildVolatilityInput,
    computeVolatilitySummary: computeVolatilitySummary,
    createMarketStructureAdapters: createMarketStructureAdapters,
    registerMarketStructureAdapters: registerMarketStructureAdapters
  };
});
