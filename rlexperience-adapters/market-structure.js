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
     behaviour to the market-heatmap-lab.html `pctOver` owner function. The owning
     page's `isFinite` is a `function isFinite(x){return Number.isFinite(x);}` shim,
     so this single source uses `Number.isFinite` (NOT the global coercing `isFinite`,
     which treats `null` as finite) to stay byte-identical to the delegating page. */
  function pctOverWindow(rows, win) {
    if (!Array.isArray(rows) || rows.length < 2) return null;
    var last = rows[rows.length - 1];
    if (!last || !Number.isFinite(last.c)) return null;
    var i = rows.length - 1 - win;
    if (i < 0) i = 0;
    var base = rows[i];
    if (!base || !Number.isFinite(base.c) || base.c === 0) return null;
    return (last.c / base.c - 1) * 100;
  }

  /* mean + sample stdev of a numeric array; sd=0 when <2 points. Byte-identical
     behaviour to the market-heatmap-lab.html `meanSd` owner function, whose
     `isFinite` is a `Number.isFinite` shim — so the null-rejecting `Number.isFinite`
     is used here for exact parity with the delegating page (global `isFinite(null)`
     is `true`, which would silently keep a null-return constituent in the sample). */
  function meanSampleSd(xs) {
    var v = (xs || []).filter(function (x) { return Number.isFinite(x); });
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
     market-heatmap-lab.html `breadthRead` owner function, whose `isFinite` is a
     `Number.isFinite` shim — so unavailable (`pct === null`) cells are excluded
     from the total exactly as the delegating page does (global `isFinite(null)` is
     `true`, which would wrongly inflate `total` and skew the risk-on/off bias). */
  function breadthReadCells(cells) {
    var green = 0, tot = 0, leader = null, laggard = null, i, c;
    for (i = 0; i < (cells || []).length; i++) {
      c = cells[i];
      if (!c || !Number.isFinite(c.pct)) continue;
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

  /* ═══════════ intraday session-auction owner functions (single owner source) ═══════════
     Extracted VERBATIM (modulo indentation) from intraday-tape-lab.html. The owning page's
     Power path now delegates to RLMARKETSTRUCTURE.computeSession / adherence / controlRead /
     sessionType (single source), and the session-auction Simple adapter calls the same
     functions — ONE formula, no inline copy. The tiny page helpers clamp/isNum/pct are copied
     byte-for-byte so the extracted bodies are unchanged. */

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function isNum(x) { return typeof x === 'number' && isFinite(x); }
  function pct(x, d) { if (!isNum(x)) return '—'; return (x >= 0 ? '+' : '') + (x * 100).toFixed(d == null ? 1 : d) + '%'; }
  /* Copied byte-for-byte from swing-structure-lab.html so the extracted swing owner
     functions (structure) keep unchanged formatting bodies. */
  function usd(x, d) { if (!isNum(x)) return '—'; return '$' + (+x).toFixed(d == null ? 2 : d); }

  function computeSession(bars, orMin, ivMin) {
    if (!bars || !bars.length) return null;
    var cumPV = 0, cumV = 0, cumPV2 = 0, series = [], lo = 1e18, hi = -1e18;
    var open = bars[0].o, cumUp = 0, cumDown = 0, cvd = 0;
    bars.forEach(function (b) {
      var tp = (b.h + b.l + b.c) / 3; cumPV += tp * b.v; cumV += b.v; cumPV2 += b.v * tp * tp;
      var vwap = cumV ? cumPV / cumV : tp; var varr = cumV ? Math.max(0, cumPV2 / cumV - vwap * vwap) : 0; var sd = Math.sqrt(varr);
      cvd += (b.c >= b.o ? 1 : -1) * b.v;
      series.push({ t: b.t, c: b.c, o: b.o, h: b.h, l: b.l, v: b.v, vwap: vwap, sd: sd, cvd: cvd });
      lo = Math.min(lo, b.l); hi = Math.max(hi, b.h);
      if (b.c >= b.o) cumUp += b.v; else cumDown += b.v;
    });
    var last = series[series.length - 1], vwap = last.vwap, sd = last.sd;
    /* volume profile */
    var nb = 44, step = (hi - lo) / nb || 1, buckets = [];
    for (var i = 0; i < nb; i++) buckets.push({ up: 0, down: 0, mid: lo + (i + 0.5) * step });
    bars.forEach(function (b) { var tp = (b.h + b.l + b.c) / 3; var bi = clamp(Math.floor((tp - lo) / step), 0, nb - 1); if (b.c >= b.o) buckets[bi].up += b.v; else buckets[bi].down += b.v; });
    var tot = 0, pocI = 0, pocV = -1; buckets.forEach(function (bk, i) { var t = bk.up + bk.down; tot += t; if (t > pocV) { pocV = t; pocI = i; } });
    /* 70% value area expand around POC */
    var incl = pocV, loI = pocI, hiI = pocI, target = tot * 0.7;
    while (incl < target && (loI > 0 || hiI < nb - 1)) {
      var below = loI > 0 ? (buckets[loI - 1].up + buckets[loI - 1].down) : -1;
      var above = hiI < nb - 1 ? (buckets[hiI + 1].up + buckets[hiI + 1].down) : -1;
      if (above >= below) { hiI++; incl += Math.max(0, above); } else { loI--; incl += Math.max(0, below); }
    }
    var poc = buckets[pocI].mid, vah = buckets[hiI].mid + step / 2, val = buckets[loI].mid - step / 2;
    /* opening range */
    var orBars = Math.max(1, Math.round(orMin / (ivMin || 5)));
    var orHi = -1e18, orLo = 1e18; for (var k = 0; k < Math.min(orBars, bars.length); k++) { orHi = Math.max(orHi, bars[k].h); orLo = Math.min(orLo, bars[k].l); }
    /* stats */
    var above = 0, cross = 0, prevSign = 0, dsum = 0, dabs = 0;
    series.forEach(function (p) {
      if (p.c > p.vwap) above++;
      var sgn = p.c >= p.vwap ? 1 : -1; if (prevSign && sgn !== prevSign) cross++; prevSign = sgn;
      var dv = (p.c >= p.o ? 1 : -1) * p.v; dsum += dv; dabs += Math.abs(dv);
    });
    var n = series.length;
    return {
      bars: series, vwap: vwap, sd: sd, lo: lo, hi: hi, open: open, last: last.c,
      netChg: (last.c - open) / open, range: (hi - lo) / open, aboveFrac: above / n, crosses: cross, n: n,
      closeLoc: (last.c - lo) / ((hi - lo) || 1), adherence: adherence(series), deltaSkew: dabs ? dsum / dabs : 0,
      buckets: buckets, poc: poc, vah: vah, val: val, step: step, cumUp: cumUp, cumDown: cumDown,
      orHi: orHi, orLo: orLo, orMin: orMin
    };
  }
  function adherence(series) { var in1 = 0; series.forEach(function (p) { if (Math.abs(p.c - p.vwap) <= (p.sd || 1e9)) in1++; }); return in1 / series.length; }

  function controlRead(t, gap) {
    /* 0 = algo-orderly, 1 = retail-emotional */
    var score = 0.5;
    score += (0.55 - t.adherence) * 0.8;            /* low VWAP adherence → retail */
    score += clamp((t.range - 0.02) / 0.05, -0.3, 0.5) * 0.5; /* wide range → retail */
    if (isNum(gap)) score += clamp((Math.abs(gap) - 0.008) / 0.03, -0.2, 0.5) * 0.4; /* big gap → retail */
    score += clamp((t.crosses / Math.max(1, t.n) - 0.12) / 0.2, -0.25, 0.35) * 0.3; /* chop → retail */
    score = clamp(score, 0, 1);
    var label = score < 0.4 ? 'Algo-controlled' : score > 0.6 ? 'Retail-driven' : 'Mixed';
    var antic = score < 0.4
      ? 'Orderly, VWAP-anchored tape → fade extensions back toward VWAP; breakouts need volume expansion to stick.'
      : score > 0.6
        ? 'Emotional tape → expect flush-and-reclaim and chase-then-fail; respect volume shelves and size down.'
        : 'No clear controller → trade the level, not the story; wait for VWAP/POC acceptance.';
    var ev = [];
    ev.push('VWAP adherence ' + (t.adherence * 100).toFixed(0) + '%');
    ev.push('range ' + (t.range * 100).toFixed(1) + '%');
    if (isNum(gap)) ev.push('gap ' + pct(gap));
    ev.push('VWAP crosses ' + t.crosses);
    return { score: score, label: label, antic: antic, ev: ev };
  }
  function sessionType(t) {
    var type, conf, why;
    var chop = t.crosses / Math.max(1, t.n);
    if (t.aboveFrac > 0.68 && t.netChg > 0.003 && t.closeLoc > 0.6) { type = 'Trend day · up'; conf = 'strong'; why = 'held above VWAP, closing near the highs'; }
    else if (t.aboveFrac < 0.32 && t.netChg < -0.003 && t.closeLoc < 0.4) { type = 'Trend day · down'; conf = 'strong'; why = 'held below VWAP, closing near the lows'; }
    else if (chop > 0.14 && Math.abs(t.netChg) < 0.005) { type = 'Range day'; conf = 'mixed'; why = 'repeated VWAP crosses, little net change'; }
    else if ((t.aboveFrac > 0.5) !== (t.netChg > 0)) { type = 'Reversal risk'; conf = 'mixed'; why = 'late-session move against the VWAP bias'; }
    else { type = 'Mixed / developing'; conf = 'lean'; why = 'no dominant structure yet'; }
    return { type: type, conf: conf, why: why };
  }

  /* ═══════════ session-auction Simple model (owner seam = intraday-tape-lab.html) ═══════════
     Declared output paths (each enabled parameter moves exactly one derived path — echoed raw
     params live under summary.params, never inside a declared path, so no effect is tautological):
       opening-range     -> summary.sessionType   (opening-range length reshapes the OR levels + session read)
       vwap-band         -> summary.levels         (VWAP dispersion band for location evidence)
       profile-window    -> summary.levels         (composite volume profile over N sessions)
       control-threshold -> summary.control        (evidence threshold for the control classification)
       gamma-context     -> summary.sessionType    (same-cutoff gamma walls participate or not) */

  var SESSION_OUTPUT_PATHS = {
    "opening-range": ["summary.sessionType"],
    "vwap-band": ["summary.levels"],
    "profile-window": ["summary.levels"],
    "control-threshold": ["summary.control"],
    "gamma-context": ["summary.sessionType"]
  };

  function concatLastSessions(sessions, count) {
    var start = Math.max(0, sessions.length - count);
    var bars = [];
    for (var i = start; i < sessions.length; i++) {
      var sb = (sessions[i] && Array.isArray(sessions[i].bars)) ? sessions[i].bars : [];
      for (var j = 0; j < sb.length; j++) bars.push(sb[j]);
    }
    return bars;
  }

  function openingRangeStatus(t) {
    if (!t || !isFiniteNumber(t.last) || !isFiniteNumber(t.orHi) || !isFiniteNumber(t.orLo)) return "unavailable";
    if (t.last > t.orHi) return "breakout-up";
    if (t.last < t.orLo) return "breakdown";
    return "inside";
  }

  function sessionGammaTag(t, gamma) {
    if (!gamma || !t || !isFiniteNumber(t.last)) return null;
    var cw = isFiniteNumber(gamma.callWall) ? gamma.callWall : null;
    var pw = isFiniteNumber(gamma.putWall) ? gamma.putWall : null;
    if (cw !== null && t.last > cw) return "above-call-wall";
    if (pw !== null && t.last < pw) return "below-put-wall";
    if (cw !== null && pw !== null) return "between-walls";
    return "wall-context";
  }

  function sessionTodayBars(ownerState) {
    var sessions = Array.isArray(ownerState.sessions) ? ownerState.sessions : [];
    var today = sessions.length ? sessions[sessions.length - 1] : null;
    return (today && Array.isArray(today.bars)) ? today.bars : [];
  }

  /* Compute the full session-auction summary from frozen owner state through the single-source
     owner functions computeSession/sessionType/controlRead. Owner facts (ownerType, vwap, sd,
     session POC/VAH/VAL, control score/label) are reflected UNROUNDED so owner-parity is exact. */
  function computeSessionAuctionSummary(ownerState, params) {
    var sessions = Array.isArray(ownerState.sessions) ? ownerState.sessions : [];
    var ivMin = isFiniteNumber(ownerState.ivMin) ? ownerState.ivMin : 5;
    var openingRange = params["opening-range"];
    var vwapBand = params["vwap-band"];
    var profileWindow = params["profile-window"];
    var controlThreshold = params["control-threshold"];
    var gammaContext = params["gamma-context"];
    var gap = isFiniteNumber(ownerState.gap) ? ownerState.gap : null;
    var echoedParams = {
      openingRange: openingRange, vwapBand: vwapBand, profileWindow: profileWindow,
      controlThreshold: controlThreshold, gammaContext: gammaContext
    };

    var t = computeSession(sessionTodayBars(ownerState), openingRange, ivMin);
    if (!t) {
      return {
        state: "unavailable",
        sessionCount: sessions.length,
        params: echoedParams,
        sessionType: { state: "unavailable" },
        levels: { state: "unavailable" },
        control: { state: "unavailable" }
      };
    }

    var owner = sessionType(t);
    var orStatus = openingRangeStatus(t);
    var gammaTag = gammaContext === "include" ? sessionGammaTag(t, ownerState.gamma) : null;
    var sessionTypeSummary = {
      state: "ready",
      ownerType: owner.type,
      ownerConf: owner.conf,
      ownerWhy: owner.why,
      orHigh: t.orHi,
      orLow: t.orLo,
      openingRangeStatus: orStatus,
      gammaTag: gammaTag,
      composite: owner.type + " · OR " + orStatus + (gammaTag ? " · " + gammaTag : "")
    };

    var composite = computeSession(concatLastSessions(sessions, profileWindow), openingRange, ivMin);
    var levelsSummary = {
      state: "ready",
      vwap: t.vwap,
      sd: t.sd,
      bandUpper: t.vwap + vwapBand * t.sd,
      bandLower: t.vwap - vwapBand * t.sd,
      sessionPoc: t.poc,
      sessionVah: t.vah,
      sessionVal: t.val,
      compositePoc: composite ? composite.poc : null,
      compositeVah: composite ? composite.vah : null,
      compositeVal: composite ? composite.val : null
    };

    var ctl = controlRead(t, gap);
    var controlSummary = {
      state: ctl.score >= controlThreshold ? "retail-evidence-clears" : "below-threshold",
      score: ctl.score,
      label: ctl.label,
      evidence: ctl.ev
    };

    return {
      state: "ready",
      sessionCount: sessions.length,
      asOf: ownerState.asOf,
      params: echoedParams,
      sessionType: sessionTypeSummary,
      levels: levelsSummary,
      control: controlSummary
    };
  }

  function sessionEvidenceState(ownerState) {
    var bars = sessionTodayBars(ownerState);
    var valid = 0;
    for (var i = 0; i < bars.length; i++) {
      var b = bars[i];
      if (b && isFiniteNumber(b.o) && isFiniteNumber(b.h) && isFiniteNumber(b.l) && isFiniteNumber(b.c) && isFiniteNumber(b.v)) valid++;
    }
    return valid >= 3 ? "ready" : "unavailable";
  }

  function buildSessionEvidence(api, ownerState) {
    var state = sessionEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var symbol = ownerState.symbol ? String(ownerState.symbol) : "session";
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "intraday-tape-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:intraday-tape-lab:" + symbol + ":" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "shared cache snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Session auction uses only the frozen owner session bars currently captured."
      ],
      limitations: [
        "The session-auction model describes the captured session profile and is not a trade recommendation."
      ],
      invalidationConditions: [
        "The frozen owner sessions change or a later observation replaces the current session."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function sessionSummaryPath(summary, path) {
    if (path === "summary.sessionType") return summary.sessionType;
    if (path === "summary.levels") return summary.levels;
    if (path === "summary.control") return summary.control;
    return null;
  }

  function sessionOutput(input, summary) {
    var scenarioValues = { summary: summary };
    var ready = summary.state === "ready";
    return {
      contractVersion: "simple-model-output/v1",
      state: summary.state,
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: summary.state, values: scenarioValues };
      }),
      calibration: {
        state: "owner-evidence-relative",
        reason: "Session type, levels, and control derive from the frozen owner session bars through the intraday-tape-lab session formula."
      },
      provenance: { classes: ["observed-fact", "model-estimate"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: ready ? "bounded" : "wide",
        rangeOrBand: ready
          ? (summary.sessionType.ownerType + "; control " + summary.control.label)
          : "Owner session evidence is unavailable for this session.",
        reason: "Session-auction reads are descriptive owner evidence and carry no directional or execution claim."
      },
      assumptions: [
        "The session-auction model derives from the frozen owner session bars only."
      ],
      limitations: [
        "The session-auction model is descriptive and does not infer a trade or execute a position."
      ],
      invalidationConditions: [
        "The frozen owner session bars change or a later observation replaces the current session."
      ],
      flatRegionProofs: []
    };
  }

  function createSessionAuctionAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) { return { ok: true, value: candidate }; },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.sessions)) {
          return { ok: false, error: { reason: "session owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildSessionEvidence(api, frozen);
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
        var summary = computeSessionAuctionSummary(ownerState, paramMap(input));
        return { ok: true, value: sessionOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeSessionAuctionSummary(ownerState, baselineValues);
        var currentSummary = computeSessionAuctionSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = SESSION_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, sessionSummaryPath(baselineSummary, path)) !== fingerprintOf(api, sessionSummaryPath(currentSummary, path));
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
              reason: "The frozen owner session yields an identical value on these paths for this parameter change."
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
        var ready = summary.state === "ready";
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: ready ? summary.sessionType.ownerType : "Session evidence unavailable",
            numericValue: ready && isFiniteNumber(summary.levels.vwap) ? summary.levels.vwap : null,
            unit: "price",
            summary: ready
              ? summary.sessionType.ownerType + " with " + summary.control.label + " control; VWAP " + (isFiniteNumber(summary.levels.vwap) ? summary.levels.vwap.toFixed(2) : "n/a") + "."
              : "The owner session decision is unavailable for the current session.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ swing-structure owner functions (single owner source) ═══════════
     Extracted VERBATIM (modulo indentation) from swing-structure-lab.html. The owning page's
     Power path now delegates to RLMARKETSTRUCTURE.smaArr / alignment / pivots / structure /
     accumDist / regimeBand (single source), and the swing-transition Simple adapter calls the
     same functions — ONE formula, no inline copy. The tiny page helpers clamp/isNum/usd already
     live in this module (copied byte-for-byte) so the extracted bodies are unchanged. */

  function smaArr(bars, n) { var out = [], s = 0; for (var i = 0; i < bars.length; i++) { s += bars[i].c; if (i >= n) s -= bars[i - n].c; out.push(i >= n - 1 ? s / n : null); } return out; }

  function alignment(full, ma) {
    var i = full.length - 1, p = full[i].c, a = ma.m20[i], b = ma.m50[i], c = ma.m200[i];
    if (a == null || b == null || c == null) return { label: 'insufficient history', trend: 'range', cls: '' };
    if (p > a && a > b && b > c) return { label: 'Bull-stacked (20>50>200)', trend: 'up', cls: 'live' };
    if (p < a && a < b && b < c) return { label: 'Bear-stacked (20<50<200)', trend: 'down', cls: 'bad' };
    return { label: 'Tangled MAs', trend: 'range', cls: 'warn' };
  }

  function pivots(view, k) {
    var hs = [], ls = []; k = k || 3;
    for (var i = k; i < view.length - k; i++) {
      var isH = true, isL = true;
      for (var j = 1; j <= k; j++) { if (view[i].h < view[i - j].h || view[i].h < view[i + j].h) isH = false; if (view[i].l > view[i - j].l || view[i].l > view[i + j].l) isL = false; }
      if (isH) hs.push({ i: i, p: view[i].h }); if (isL) ls.push({ i: i, p: view[i].l });
    }
    return { hs: hs, ls: ls };
  }

  function structure(view, ma, align) {
    var pv = pivots(view, 3), last = view[view.length - 1].c;
    var pattern = 'Trend / continuation', stage = 'confirmed', target = null, invalid = null, why = '';
    var hh = pv.hs.slice(-2), ll = pv.ls.slice(-2);
    if (hh.length === 2 && Math.abs(hh[0].p - hh[1].p) / hh[0].p < 0.02 && last < hh[1].p) {
      var trough = Math.min.apply(null, view.slice(hh[0].i, hh[1].i + 1).map(function (b) { return b.l; }));
      pattern = 'Double top'; stage = last < trough ? 'confirmed' : 'forming'; target = trough - (hh[1].p - trough); invalid = hh[1].p; why = 'two highs near ' + usd(hh[1].p) + ', neckline ' + usd(trough);
    } else if (ll.length === 2 && Math.abs(ll[0].p - ll[1].p) / ll[0].p < 0.02 && last > ll[1].p) {
      var peak = Math.max.apply(null, view.slice(ll[0].i, ll[1].i + 1).map(function (b) { return b.h; }));
      pattern = 'Double bottom'; stage = last > peak ? 'confirmed' : 'forming'; target = peak + (peak - ll[1].p); invalid = ll[1].p; why = 'two lows near ' + usd(ll[1].p) + ', neckline ' + usd(peak);
    } else if (align.trend === 'range') {
      var hi = Math.max.apply(null, view.map(function (b) { return b.h; })), lo = Math.min.apply(null, view.map(function (b) { return b.l; }));
      pattern = 'Range'; why = 'bounded ' + usd(lo) + '–' + usd(hi); invalid = null;
    } else { pattern = align.trend === 'up' ? 'Uptrend (HH/HL)' : align.trend === 'down' ? 'Downtrend (LH/LL)' : 'Sideways'; why = 'higher/lower swing structure'; }
    return { pattern: pattern, stage: stage, target: target, invalid: invalid, why: why, pivots: pv };
  }

  function accumDist(full) {
    var n = full.length, look = Math.min(40, n - 1);
    var obv = 0, obvSeries = []; for (var i = 1; i < n; i++) { obv += (full[i].c >= full[i - 1].c ? 1 : -1) * full[i].v; obvSeries.push(obv); }
    var slope = obvSeries.length > look ? (obvSeries[obvSeries.length - 1] - obvSeries[obvSeries.length - 1 - look]) : 0;
    var up = 0, dn = 0, effAbs = 0, volSum = 0; for (var k = n - look; k < n; k++) { if (k < 1) continue; if (full[k].c >= full[k].o) up += full[k].v; else dn += full[k].v; effAbs += Math.abs(full[k].c / full[k - 1].c - 1); volSum += full[k].v; }
    var udBal = (up + dn) ? (up - dn) / (up + dn) : 0;
    var eff = volSum ? effAbs / (volSum / look / 1e6 || 1) : 0; /* rough effort-vs-result proxy */
    var score = clamp(0.5 + (slope > 0 ? 0.2 : -0.2) + udBal * 0.3, 0, 1);
    var label = score > 0.6 ? 'Accumulation' : score < 0.4 ? 'Distribution' : 'Neutral / balanced';
    var ev = ['OBV ' + (slope > 0 ? 'rising' : 'falling'), 'up/down vol ' + (udBal >= 0 ? '+' : '') + (udBal * 100).toFixed(0) + '%'];
    return { score: score, label: label, ev: ev };
  }

  function regimeBand(fg, trend, vix) {
    if (!fg) return { band: 'Unknown', cls: '', note: 'macro gauge unavailable' };
    var s = fg.score;
    if (s >= 56) { if (s >= 76 && trend !== 'up') return { band: 'Distribution / topping', cls: 'warn', note: 'extreme greed without an intact uptrend' }; return trend === 'up' ? { band: 'Risk-on trend', cls: 'live', note: 'greed + intact uptrend' } : { band: 'Greed (late)', cls: 'warn', note: 'greed but trend not aligned' }; }
    if (s <= 44) { if (s <= 24 && trend !== 'down') return { band: 'Accumulation / basing', cls: 'live', note: 'extreme fear with structure stabilizing' }; return trend === 'down' ? { band: 'Risk-off / fear', cls: 'bad', note: 'fear + intact downtrend' } : { band: 'Fear (early)', cls: 'warn', note: 'fear but trend not aligned' }; }
    return { band: 'Neutral / mixed', cls: '', note: 'no dominant regime' };
  }

  /* ═══════════ swing-transition Simple model (owner seam = swing-structure-lab.html) ═══════════
     Declared output paths (each enabled parameter moves exactly one derived path — echoed raw
     params live under summary.params, never inside a declared path, so no effect is tautological):
       fast-ma / medium-ma / slow-ma -> summary.swingState  (the MA-stack levels + owner alignment read)
       breakout-tolerance            -> summary.transition   (extension above the most recent owner pivot high)
       volume-confirmation           -> summary.confirmation (recent relative-volume gate)
       obv-confirmation              -> summary.confirmation (whether OBV agreement is required)
       pattern-threshold             -> summary.pattern      (owner structural-pattern evidence gate)
       regime-window                 -> summary.regime       (trailing return -> owner regime band) */

  var SWING_OUTPUT_PATHS = {
    "fast-ma": ["summary.swingState"],
    "medium-ma": ["summary.swingState"],
    "slow-ma": ["summary.swingState"],
    "breakout-tolerance": ["summary.transition"],
    "volume-confirmation": ["summary.confirmation"],
    "obv-confirmation": ["summary.confirmation"],
    "pattern-threshold": ["summary.pattern"],
    "regime-window": ["summary.regime"]
  };

  /* Recent relative volume: mean of the last 5 bar volumes over the mean of the prior 20. Derived
     from the frozen owner bars only; drives the volume-confirmation gate. */
  function swingRelativeVolume(full) {
    var n = full.length;
    if (n < 6) return null;
    var recentN = Math.min(5, n), priorN = Math.min(20, n - recentN);
    if (priorN < 1) return null;
    var rSum = 0, i;
    for (i = n - recentN; i < n; i++) rSum += isFiniteNumber(full[i].v) ? full[i].v : 0;
    var pSum = 0;
    for (i = n - recentN - priorN; i < n - recentN; i++) pSum += isFiniteNumber(full[i].v) ? full[i].v : 0;
    var priorMean = pSum / priorN;
    if (!(priorMean > 0)) return null;
    return (rSum / recentN) / priorMean;
  }

  /* Trailing close-to-close return over the regime window from the frozen owner bars. */
  function swingWindowReturn(full, win) {
    var n = full.length;
    if (n < 2) return 0;
    var last = full[n - 1].c;
    var backIdx = n - 1 - win;
    if (backIdx < 0) backIdx = 0;
    var base = full[backIdx].c;
    if (!(isFiniteNumber(base) && base !== 0) || !isFiniteNumber(last)) return 0;
    return last / base - 1;
  }

  /* Structural-pattern evidence score in [0,1] derived from the owner structure read (pattern +
     stage). No raw parameter is echoed; the pattern-threshold gate compares against this. */
  function swingPatternEvidence(struct) {
    var p = struct && struct.pattern ? struct.pattern : "";
    var confirmed = struct && struct.stage === "confirmed";
    if (/Double top|Double bottom/.test(p)) return confirmed ? 0.9 : 0.6;
    if (/Uptrend|Downtrend/.test(p)) return 0.7;
    if (/Trend \/ continuation/.test(p)) return 0.75;
    if (/Range/.test(p)) return 0.3;
    return 0.5;
  }

  /* Compute the full swing-transition summary from frozen owner state through the single-source
     owner functions smaArr/alignment/structure/accumDist/regimeBand. Owner facts (alignment label,
     MA levels, structure pattern/stage, accum/distribution score/label, regime band) are reflected
     directly so owner-parity is exact. */
  function computeSwingTransitionSummary(ownerState, params) {
    var full = (ownerState && Array.isArray(ownerState.full)) ? ownerState.full : [];
    var fastMa = params["fast-ma"], mediumMa = params["medium-ma"], slowMa = params["slow-ma"];
    var breakoutTol = params["breakout-tolerance"];
    var volConf = params["volume-confirmation"];
    var obvConf = params["obv-confirmation"];
    var patternThr = params["pattern-threshold"];
    var regimeWin = params["regime-window"];
    var echoedParams = {
      fastMa: fastMa, mediumMa: mediumMa, slowMa: slowMa, breakoutTol: breakoutTol,
      volConf: volConf, obvConf: obvConf, patternThr: patternThr, regimeWin: regimeWin
    };

    if (full.length < 2) {
      return {
        state: "unavailable",
        barCount: full.length,
        params: echoedParams,
        swingState: { state: "unavailable" },
        transition: { state: "unavailable" },
        confirmation: { state: "unavailable" },
        pattern: { state: "unavailable" },
        regime: { state: "unavailable" }
      };
    }

    var lastIdx = full.length - 1;
    var last = full[lastIdx].c;

    /* MA stack -> owner alignment (fast/medium/slow-ma steer the horizons). */
    var ma = { m20: smaArr(full, fastMa), m50: smaArr(full, mediumMa), m200: smaArr(full, slowMa) };
    var align = alignment(full, ma);
    var swingState = {
      state: "ready",
      label: align.label,
      trend: align.trend,
      fast: roundTo(ma.m20[lastIdx], 4),
      medium: roundTo(ma.m50[lastIdx], 4),
      slow: roundTo(ma.m200[lastIdx], 4)
    };

    /* Owner structural pattern -> pattern-threshold gate. */
    var struct = structure(full, ma, align);
    var evidenceScore = swingPatternEvidence(struct);
    var pattern = {
      state: evidenceScore >= patternThr ? "pattern-qualified" : "below-threshold",
      ownerPattern: struct.pattern,
      ownerStage: struct.stage,
      evidenceScore: evidenceScore,
      ownerWhy: struct.why
    };

    /* Transition: extension of the last close above/below the most recent owner pivot gated by
       breakout-tolerance. */
    var pv = struct.pivots || pivots(full, 3);
    var recentHigh = pv.hs.length ? pv.hs[pv.hs.length - 1].p : null;
    var recentLow = pv.ls.length ? pv.ls[pv.ls.length - 1].p : null;
    var extUp = (isFiniteNumber(recentHigh) && recentHigh > 0) ? (last - recentHigh) / recentHigh * 100 : null;
    var extDown = (isFiniteNumber(recentLow) && recentLow > 0) ? (recentLow - last) / recentLow * 100 : null;
    var transitionState;
    if (isFiniteNumber(extUp) && extUp >= breakoutTol) transitionState = "breakout-up-confirmed";
    else if (isFiniteNumber(extDown) && extDown >= breakoutTol) transitionState = "breakdown-confirmed";
    else transitionState = "within-tolerance";
    var transition = {
      state: transitionState,
      extensionPct: roundTo(isFiniteNumber(extUp) ? extUp : 0, 4),
      pivotHigh: roundTo(recentHigh, 4),
      pivotLow: roundTo(recentLow, 4)
    };

    /* Confirmation: OBV/accumulation agreement + recent relative-volume gate. */
    var ad = accumDist(full);
    var relVolume = swingRelativeVolume(full);
    var obvDir = ad.score > 0.6 ? 1 : ad.score < 0.4 ? -1 : 0;
    var trendDir = align.trend === "up" ? 1 : align.trend === "down" ? -1 : 0;
    var obvAgrees = obvDir !== 0 && obvDir === trendDir;
    var volumeClears = isFiniteNumber(relVolume) && relVolume >= volConf;
    var obvOk = !obvConf || obvAgrees;
    var confirmation = {
      state: (volumeClears && obvOk) ? "confirmed" : "not-confirmed",
      volumeState: volumeClears ? "volume-clears" : "volume-short",
      obvState: obvConf ? (obvAgrees ? "obv-required-and-agrees" : "obv-required-but-diverges") : "obv-not-required",
      obvLabel: ad.label,
      obvScore: ad.score,
      relVolume: roundTo(relVolume, 4),
      obvAgrees: obvAgrees
    };

    /* Regime: trailing return over the regime window -> owner regime band. */
    var regimeReturn = swingWindowReturn(full, regimeWin);
    var regimeTrend = regimeReturn > 0.005 ? "up" : regimeReturn < -0.005 ? "down" : "range";
    var fg = ownerState.macro && ownerState.macro.fg;
    var vix = ownerState.macro && ownerState.macro.vix;
    var band = regimeBand(fg, regimeTrend, vix);
    var regime = {
      state: fg ? "ready" : "unavailable",
      band: band.band,
      note: band.note,
      trend: regimeTrend,
      windowReturnPct: roundTo(regimeReturn * 100, 4),
      windowObservations: Math.min(regimeWin, full.length - 1)
    };

    return {
      state: "ready",
      barCount: full.length,
      asOf: ownerState.asOf,
      params: echoedParams,
      swingState: swingState,
      transition: transition,
      confirmation: confirmation,
      pattern: pattern,
      regime: regime
    };
  }

  function swingEvidenceState(ownerState) {
    var full = (ownerState && Array.isArray(ownerState.full)) ? ownerState.full : [];
    var valid = 0;
    for (var i = 0; i < full.length; i++) {
      var b = full[i];
      if (b && isFiniteNumber(b.o) && isFiniteNumber(b.h) && isFiniteNumber(b.l) && isFiniteNumber(b.c) && isFiniteNumber(b.v)) valid++;
    }
    return valid >= 2 ? "ready" : "unavailable";
  }

  function buildSwingEvidence(api, ownerState) {
    var state = swingEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var symbol = ownerState.symbol ? String(ownerState.symbol) : "swing";
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "swing-structure-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:swing-structure-lab:" + symbol + ":" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "shared cache snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Swing transition uses only the frozen owner daily bars currently captured."
      ],
      limitations: [
        "The swing-transition model describes the captured structure and is not a trade recommendation."
      ],
      invalidationConditions: [
        "The frozen owner bars change or a later observation replaces the current window."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function swingSummaryPath(summary, path) {
    if (path === "summary.swingState") return summary.swingState;
    if (path === "summary.transition") return summary.transition;
    if (path === "summary.confirmation") return summary.confirmation;
    if (path === "summary.pattern") return summary.pattern;
    if (path === "summary.regime") return summary.regime;
    return null;
  }

  function swingOutput(input, summary) {
    var scenarioValues = { summary: summary };
    var ready = summary.state === "ready";
    return {
      contractVersion: "simple-model-output/v1",
      state: summary.state,
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: summary.state, values: scenarioValues };
      }),
      calibration: {
        state: "owner-evidence-relative",
        reason: "Swing state, transition, confirmation, pattern, and regime derive from the frozen owner daily bars through the swing-structure-lab owner formula."
      },
      provenance: { classes: ["observed-fact", "model-estimate"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: ready ? "bounded" : "wide",
        rangeOrBand: ready
          ? (summary.swingState.label + "; " + summary.pattern.ownerPattern + "; regime " + summary.regime.band)
          : "Owner swing evidence is unavailable for this window.",
        reason: "Swing-transition reads are descriptive owner evidence and carry no directional or execution claim."
      },
      assumptions: [
        "The swing-transition model derives from the frozen owner daily bars only."
      ],
      limitations: [
        "The swing-transition model is descriptive and does not infer a trade or execute a position."
      ],
      invalidationConditions: [
        "The frozen owner daily bars change or a later observation replaces the current window."
      ],
      flatRegionProofs: []
    };
  }

  function createSwingTransitionAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) { return { ok: true, value: candidate }; },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.full)) {
          return { ok: false, error: { reason: "swing owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildSwingEvidence(api, frozen);
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
        var summary = computeSwingTransitionSummary(ownerState, paramMap(input));
        return { ok: true, value: swingOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeSwingTransitionSummary(ownerState, baselineValues);
        var currentSummary = computeSwingTransitionSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = SWING_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, swingSummaryPath(baselineSummary, path)) !== fingerprintOf(api, swingSummaryPath(currentSummary, path));
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
              reason: "The frozen owner bars yield an identical value on these paths for this parameter change."
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
        var ready = summary.state === "ready";
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: ready ? summary.swingState.label : "Swing evidence unavailable",
            numericValue: ready && isFiniteNumber(summary.swingState.fast) ? summary.swingState.fast : null,
            unit: "price",
            summary: ready
              ? summary.swingState.label + " with " + summary.pattern.ownerPattern + " structure in a " + summary.regime.band + " regime."
              : "The owner swing decision is unavailable for the current window.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ technical-five-gate Simple model (owner seam = technical-analysis-decision-lab.html) ═══════════
     technical-analysis-decision-lab.html is a Scope-01 FOUNDATION-RECEIPT VALIDATOR. It validates the
     reusable source/session/bar/identity contracts and EXPLICITLY publishes NO analytic result — its own
     diagnostics carry ownerReadPublished:false and its receipts state "No signal, neutral, setup, or
     probability is published by Scope 01." There is therefore NO owner five-gate MODEL to extract that
     would turn the context/location/confirmation/validation gate scores and entry/stop/cost into a setup
     state and expectancy. This adapter is the HONEST owner boundary: the foundation receipt IS present
     (evidence state ready), but the five-gate model is absent, so compute returns explicit UNAVAILABLE
     naming the missing owner capability rather than reinterpreting the foundation receipt as a signal.
     Because the model is absent, every declared parameter sits in a PROVED FLAT REGION — the unavailable
     output is parameter-invariant, a modeled flat region, not a missing effect.

     Declared output paths (each parameter references a declared path; every path is param-invariant until
     the owner five-gate model exists, so each change is a proved flat region):
       timeframe / family-requirement                              -> summary.setupState
       data-tier                                                   -> summary.evidenceState
       context/location/confirmation/validation-threshold          -> summary.gates.<gate>
       entry / stop-distance / cost                                -> summary.expectancy

     This adapter performs NO page rewire: there is no owner formula to single-source until the owner
     five-gate model is implemented. If/when the owner model lands, this compute is replaced with the
     extracted single-source owner functions and the flat regions become real steerable effects. */

  var TECHNICAL_OWNER_PAGE = "technical-analysis-decision-lab.html";
  var TECHNICAL_MISSING_CAPABILITY = "The owner five-gate model (context/location/confirmation/validation gate scoring plus setup-state and expectancy) is not implemented in " + TECHNICAL_OWNER_PAGE + ", a Scope-01 foundation-receipt validator that publishes no analytic result (ownerReadPublished:false).";

  var TECHNICAL_OUTPUT_PATHS = {
    "timeframe": ["summary.setupState"],
    "data-tier": ["summary.evidenceState"],
    "context-threshold": ["summary.gates.context"],
    "location-threshold": ["summary.gates.location"],
    "confirmation-threshold": ["summary.gates.confirmation"],
    "validation-threshold": ["summary.gates.validation"],
    "entry": ["summary.expectancy"],
    "stop-distance": ["summary.expectancy"],
    "cost": ["summary.expectancy"],
    "family-requirement": ["summary.setupState"]
  };

  function technicalFoundationPresent(ownerState) {
    return !!(ownerState && ownerState.foundationReceipt && ownerState.foundationReceipt.present === true);
  }

  /* The foundation receipt (source/session/bar/identity contracts) IS present => ready. This does NOT
     assert an analytic result; the analytic five-gate MODEL is absent (handled in compute). */
  function technicalEvidenceState(ownerState) {
    return technicalFoundationPresent(ownerState) ? "ready" : "unavailable";
  }

  /* Always-unavailable summary: the owner five-gate model is absent, so every declared path is an
     explicit unavailable object that does NOT depend on the parameters (a proved flat region). The
     echoed raw params live only under summary.params, never inside a declared path. */
  function computeTechnicalFiveGateSummary(ownerState, params) {
    var unavailable = function (reason) { return { state: "unavailable", reason: reason }; };
    var gateReason = "No owner gate score is published; the five-gate model is not implemented.";
    return {
      state: "unavailable",
      missingOwnerCapability: TECHNICAL_MISSING_CAPABILITY,
      foundationReceipt: {
        present: technicalFoundationPresent(ownerState),
        ownerReadPublished: !!(ownerState && ownerState.foundationReceipt && ownerState.foundationReceipt.ownerReadPublished === true)
      },
      setupState: unavailable("No owner setup state is published; the five-gate model is not implemented."),
      evidenceState: unavailable("The foundation receipt is present, but no source-qualified analytic evidence tier is published."),
      gates: {
        context: unavailable(gateReason),
        location: unavailable(gateReason),
        confirmation: unavailable(gateReason),
        validation: unavailable(gateReason)
      },
      expectancy: unavailable("No owner expectancy is published; entry/stop/cost cannot be scored without the five-gate model."),
      params: {
        timeframe: params.timeframe,
        dataTier: params["data-tier"],
        contextThreshold: params["context-threshold"],
        locationThreshold: params["location-threshold"],
        confirmationThreshold: params["confirmation-threshold"],
        validationThreshold: params["validation-threshold"],
        entry: isFiniteNumber(params.entry) ? params.entry : null,
        stopDistance: params["stop-distance"],
        cost: params.cost,
        familyRequirement: params["family-requirement"]
      }
    };
  }

  function buildTechnicalEvidence(api, ownerState) {
    var state = technicalEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var symbol = ownerState.symbol ? String(ownerState.symbol) : "technical";
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "technical-analysis-decision-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:technical-analysis-decision-lab:" + symbol + ":" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "shared cache snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Only the frozen foundation-receipt contracts (source/session/bar/identity) are present; no owner analytic model is captured."
      ],
      limitations: [
        "The owner page publishes no signal, setup, or expectancy; the five-gate model is not implemented."
      ],
      invalidationConditions: [
        "The owner page implements the five-gate model, or the frozen foundation receipt changes."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function technicalSummaryPath(summary, path) {
    if (path === "summary.setupState") return summary.setupState;
    if (path === "summary.evidenceState") return summary.evidenceState;
    if (path === "summary.gates.context") return summary.gates.context;
    if (path === "summary.gates.location") return summary.gates.location;
    if (path === "summary.gates.confirmation") return summary.gates.confirmation;
    if (path === "summary.gates.validation") return summary.gates.validation;
    if (path === "summary.expectancy") return summary.expectancy;
    return null;
  }

  function technicalOutput(input, summary) {
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "unavailable",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "unavailable", values: scenarioValues };
      }),
      calibration: {
        state: "owner-evidence-relative",
        reason: "The foundation receipt is present, but the owner five-gate model that would produce a calibrated setup state and expectancy is not implemented."
      },
      provenance: { classes: ["unavailable"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: "unavailable",
        rangeOrBand: "No owner setup state or expectancy is available; the five-gate model is not implemented.",
        reason: "The Scope-01 owner page publishes no analytic result, so no signal is reinterpreted from the foundation receipt."
      },
      assumptions: [
        "The foundation receipt (source/session/bar/identity contracts) is present, but no owner analytic model exists."
      ],
      limitations: [
        "Until the owner five-gate model is implemented, the adapter returns explicit unavailable rather than an invented signal."
      ],
      invalidationConditions: [
        "The owner page implements the five-gate model, or the frozen foundation receipt changes."
      ],
      flatRegionProofs: []
    };
  }

  function createTechnicalFiveGateAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) { return { ok: true, value: candidate }; },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !ownerState.foundationReceipt) {
          return { ok: false, error: { reason: "technical foundation-receipt owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildTechnicalEvidence(api, frozen);
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
        var summary = computeTechnicalFiveGateSummary(ownerState, paramMap(input));
        return { ok: true, value: technicalOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeTechnicalFiveGateSummary(ownerState, baselineValues);
        var currentSummary = computeTechnicalFiveGateSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = TECHNICAL_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, technicalSummaryPath(baselineSummary, path)) !== fingerprintOf(api, technicalSummaryPath(currentSummary, path));
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
              reason: "The owner five-gate model is not implemented, so this parameter cannot move the (unavailable) setup/gate/expectancy path — a proved flat region until the owner model exists."
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
            valueText: "Five-gate model unavailable",
            numericValue: null,
            unit: "state",
            summary: summary.missingOwnerCapability,
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
    if (byToolId["intraday-tape-lab"]) {
      var sessionDefinition = byToolId["intraday-tape-lab"];
      adapters[sessionDefinition.adapterId] = createSessionAuctionAdapter(api, sessionDefinition, ownerByIdentity);
    }
    if (byToolId["swing-structure-lab"]) {
      var swingDefinition = byToolId["swing-structure-lab"];
      adapters[swingDefinition.adapterId] = createSwingTransitionAdapter(api, swingDefinition, ownerByIdentity);
    }
    if (byToolId["technical-analysis-decision-lab"]) {
      var fiveGateDefinition = byToolId["technical-analysis-decision-lab"];
      adapters[fiveGateDefinition.adapterId] = createTechnicalFiveGateAdapter(api, fiveGateDefinition, ownerByIdentity);
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
    supportedAdapterIds: ["simple-adapter/market-breadth/v1", "simple-adapter/conditional-volatility/v1", "simple-adapter/session-auction/v1", "simple-adapter/swing-transition/v1", "simple-adapter/technical-five-gate/v1"],
    WINDOW_BARS: WINDOW_BARS,
    pctOverWindow: pctOverWindow,
    meanSampleSd: meanSampleSd,
    breadthReadCells: breadthReadCells,
    computeBreadthSummary: computeBreadthSummary,
    reduceOwnerState: reduceOwnerState,
    buildVolatilityInput: buildVolatilityInput,
    computeVolatilitySummary: computeVolatilitySummary,
    computeSession: computeSession,
    adherence: adherence,
    controlRead: controlRead,
    sessionType: sessionType,
    computeSessionAuctionSummary: computeSessionAuctionSummary,
    smaArr: smaArr,
    alignment: alignment,
    pivots: pivots,
    structure: structure,
    accumDist: accumDist,
    regimeBand: regimeBand,
    computeSwingTransitionSummary: computeSwingTransitionSummary,
    computeTechnicalFiveGateSummary: computeTechnicalFiveGateSummary,
    createMarketStructureAdapters: createMarketStructureAdapters,
    registerMarketStructureAdapters: registerMarketStructureAdapters
  };
});
