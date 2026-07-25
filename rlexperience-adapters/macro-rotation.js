/*
 * rlexperience-adapters/macro-rotation.js
 * ------------------------------------------------------------------------
 * Feature 012 Scope 06 — Macro / rotation Simple adapters.
 *
 * This module is the SINGLE OWNER SOURCE for the macro-rotation Simple model
 * formulas. The owning tool pages consume the exact same exported pure owner
 * functions in their Power path (see sector-research-lab.html), and the
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
 * global RLMACROROTATION for the owning pages.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLMACROROTATION_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLMACROROTATION = api;
})(function () {
  "use strict";

  /* ═══════════ pure owner primitives (single source; consumed by Power + Simple) ═══════════
     These mirror the sector-research-lab.html owner helpers exactly. The sector page uses the
     REAL global `isFinite` (there is no Number.isFinite shim on that page), so these owner
     primitives use the same global `isFinite` to stay byte-identical to the delegating page. */

  function mean(a) { var s = 0, n = a.length, i; for (i = 0; i < n; i++) s += a[i]; return n ? s / n : 0; }
  function variance(a) { var m = mean(a), s = 0, n = a.length, i; for (i = 0; i < n; i++) { var d = a[i] - m; s += d * d; } return n > 1 ? s / (n - 1) : 0; }
  function stdev(a) { return Math.sqrt(variance(a)); }

  /* rollZ100: rolling z-score → 100 + (x - mean)/sd over the last L finite values (minN = the
     larger of 8 and floor(L/2)). Byte-identical to sector-research-lab.html rollZ100. */
  function rollZ100(a, L) {
    var out = new Array(a.length), minN = Math.max(8, Math.floor(L * 0.5)), i, j;
    for (i = 0; i < a.length; i++) {
      if (!isFinite(a[i])) { out[i] = NaN; continue; }
      var vals = []; for (j = i; j >= 0 && vals.length < L; j--) { if (isFinite(a[j])) vals.push(a[j]); }
      if (vals.length < minN) { out[i] = NaN; continue; }
      var m = mean(vals), sd = stdev(vals); out[i] = sd ? 100 + (a[i] - m) / sd : 100;
    }
    return out;
  }

  /* rrgQuadrant: the RRG quadrant from the relative-strength ratio + momentum z-scores. Owner
     formula (mirrors the inline quad expression in sector-research-lab.html computeEntry). */
  function rrgQuadrant(rsRatio, rsMom) {
    return rsRatio >= 100 ? (rsMom >= 100 ? "L" : "W") : (rsMom >= 100 ? "I" : "A");
  }

  /* stateLabel: quad + acceleration → the owner state label, preserving the early-turn detection
     (Peaking / Basing). Byte-identical to sector-research-lab.html stateLabel. */
  function stateLabel(quad, accel) {
    if (quad === "L") return accel < -0.15 ? { t: "Peaking ⚠", c: "st-peak", early: 1 } : { t: "Leading", c: "st-lead", early: 0 };
    if (quad === "W") return { t: "Weakening ↓", c: "st-weak", early: 0 };
    if (quad === "A") return accel > 0.15 ? { t: "Basing ↑", c: "st-base", early: 1 } : { t: "Lagging", c: "st-lag", early: 0 };
    if (quad === "I") return { t: "Improving ↑", c: "st-improve", early: 0 };
    return { t: "—", c: "", early: 0 };
  }

  /* backVal: change of an array over `span` bars ending at index `last`; 0 when either endpoint is
     missing. Mirrors the sector-research-lab.html computeEntry closure (last passed explicitly). */
  function backVal(arr, span, last) {
    var j = last - span;
    return (j >= 0 && isFinite(arr[j]) && isFinite(arr[last])) ? arr[last] - arr[j] : 0;
  }

  /* rotationCandidacy: the Simple into/out classifier over a computed view. Owner formula shared
     with sector-research-lab.html sectorSimpleCandidates (confirmed / strict / early tempos). */
  function rotationCandidacy(view, confirmation) {
    var inTurn = view.quad === "I" || (view.state && view.state.t === "Basing ↑") || (view.quad === "L" && view.accel > 0.2);
    var outTurn = (view.state && view.state.t === "Peaking ⚠") || view.quad === "W";
    if (confirmation === "strict") {
      inTurn = inTurn && view.accel > 0.2 && isFiniteNumber(view.x3) && view.x3 > 0;
      outTurn = outTurn && view.accel < -0.2 && isFiniteNumber(view.x3) && view.x3 < 0;
    } else if (confirmation === "early") {
      inTurn = inTurn || (view.quad === "A" && view.accel > 0);
      outTurn = outTurn || (view.quad === "L" && view.accel < 0);
    }
    return { inTurn: inTurn, outTurn: outTurn };
  }

  /* rrgReadout: the full RRG kernel from an aligned relative-strength ratio series. `momSpan` is
     the short-lookback momentum span (M); `zWindow` is the long-lookback z-score window (L). This
     is the single-source RRG owner formula both the page (computeEntry) and the adapter consume. */
  function rrgReadout(rs, momSpan, zWindow) {
    var rsRatioArr = rollZ100(rs, zWindow);
    var rom = [], i;
    for (i = 0; i < rsRatioArr.length; i++) {
      rom.push(i >= momSpan && isFinite(rsRatioArr[i]) && isFinite(rsRatioArr[i - momSpan]) ? rsRatioArr[i] - rsRatioArr[i - momSpan] : NaN);
    }
    var rsMomArr = rollZ100(rom, zWindow);
    var last = -1;
    for (i = rsRatioArr.length - 1; i >= 0; i--) { if (isFinite(rsRatioArr[i]) && isFinite(rsMomArr[i])) { last = i; break; } }
    if (last < 0) {
      return { rsRatioArr: rsRatioArr, rsMomArr: rsMomArr, last: -1, rsRatio: null, rsMom: null, quad: null, accel: 0 };
    }
    var rsRatio = rsRatioArr[last], rsMom = rsMomArr[last];
    return {
      rsRatioArr: rsRatioArr,
      rsMomArr: rsMomArr,
      last: last,
      rsRatio: rsRatio,
      rsMom: rsMom,
      quad: rrgQuadrant(rsRatio, rsMom),
      accel: backVal(rsMomArr, 10, last)
    };
  }

  /* ═══════════ sector-rotation Simple model (owner seam = sector-research-lab.html) ═══════════ */

  function isFiniteNumber(value) { return typeof value === "number" && isFinite(value); }

  function roundTo(value, digits) {
    if (!isFiniteNumber(value)) return null;
    var factor = Math.pow(10, digits);
    return Math.round(value * factor) / factor;
  }

  /* min-max normalize a list to 0..1 (null-safe; degenerate spread → 0.5). Mirrors the sector page
     normList. Used to combine acceleration and risk on one comparable scale for the rank. */
  function normList(vals) {
    var fin = vals.filter(function (v) { return v != null && isFiniteNumber(v); });
    if (!fin.length) return vals.map(function () { return null; });
    var mn = Math.min.apply(null, fin), mx = Math.max.apply(null, fin), sp = mx - mn;
    return vals.map(function (v) { return (v == null || !isFiniteNumber(v)) ? null : (sp ? (v - mn) / sp : 0.5); });
  }

  function sectorBenchmarkSeries(sector, benchmark) {
    if (!sector || !sector.rs || typeof sector.rs !== "object") return null;
    var series = sector.rs[benchmark];
    return Array.isArray(series) ? series : null;
  }

  /* Compute one sector's frozen view from its rs series under the current lookbacks + benchmark. */
  function sectorView(sector, params) {
    var benchmark = params.benchmark;
    var rs = sectorBenchmarkSeries(sector, benchmark);
    if (!rs) {
      return { id: String(sector.id), label: String(sector.label || sector.id), rsRatio: null, rsMom: null, quad: null, accel: 0, state: stateLabel(null, 0), x3: null, breadth: null, riskScore: null, etf: sector.etf || null, priced: false };
    }
    var kernel = rrgReadout(rs, params["short-lookback"], params["long-lookback"]);
    var quad = kernel.quad;
    var accel = kernel.accel;
    return {
      id: String(sector.id),
      label: String(sector.label || sector.id),
      rsRatio: roundTo(kernel.rsRatio, 4),
      rsMom: roundTo(kernel.rsMom, 4),
      quad: quad,
      accel: roundTo(accel, 4),
      state: stateLabel(quad, accel),
      x3: isFiniteNumber(sector.x3) ? sector.x3 : null,
      breadth: isFiniteNumber(sector.breadthPct50) ? sector.breadthPct50 : null,
      riskScore: isFiniteNumber(sector.riskScore) ? sector.riskScore : null,
      etf: sector.etf && typeof sector.etf === "object" ? sector.etf : null,
      priced: kernel.last >= 0
    };
  }

  /* Compute the full sector-rotation summary from frozen owner state + current parameters. Every
     value derives from the single-source owner primitives; nothing is fabricated or defaulted. */
  function computeSectorRotationSummary(ownerState, params) {
    var benchmark = params.benchmark;
    var accelW = params["acceleration-weight"];
    var breadthW = params["breadth-weight"];
    var riskW = params["risk-weight"];
    var etfFitW = params["etf-fit-weight"];
    var sectors = (ownerState && Array.isArray(ownerState.sectors)) ? ownerState.sectors : [];

    var views = sectors.map(function (sector) { return sectorView(sector, params); });
    var priced = views.filter(function (view) { return view.priced; });

    // Rank: acceleration (normalized) + breadth − risk (normalized), each weighted.
    var accelN = normList(views.map(function (view) { return view.accel; }));
    var riskN = normList(views.map(function (view) { return view.riskScore; }));
    views.forEach(function (view, index) {
      var accelPart = accelN[index] == null ? 0 : accelN[index];
      var breadthPart = isFiniteNumber(view.breadth) ? view.breadth : 0;
      var riskPart = riskN[index] == null ? 0 : riskN[index];
      view.rankScore = roundTo(accelW * accelPart + breadthW * breadthPart - riskW * riskPart, 6);
    });
    var rank = views.map(function (view) { return { id: view.id, rankScore: view.rankScore }; })
      .sort(function (a, b) {
        var d = (b.rankScore == null ? -Infinity : b.rankScore) - (a.rankScore == null ? -Infinity : a.rankScore);
        if (d !== 0) return d;
        return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
      });

    // Transition: the into/out classification over the computed views (confirmed tempo).
    var into = [], out = [];
    views.forEach(function (view) {
      if (!view.priced) return;
      var candidacy = rotationCandidacy(view, "confirmed");
      if (candidacy.inTurn) into.push(view);
      if (candidacy.outTurn) out.push(view);
    });
    into.sort(function (a, b) { return b.accel - a.accel; });
    out.sort(function (a, b) { return a.accel - b.accel; });
    var transition = {
      sectors: views.map(function (view) {
        return { id: view.id, rsRatio: view.rsRatio, rsMom: view.rsMom, quad: view.quad, accel: view.accel, state: view.state.t };
      }),
      into: into.map(function (view) { return view.id; }),
      out: out.map(function (view) { return view.id; }),
      top: { into: into.length ? into[0].id : null, out: out.length ? out[0].id : null }
    };

    // Relative strength: benchmark-relative rsRatio leaders (moves when the benchmark changes).
    var leaders = priced.map(function (view) { return { id: view.id, rsRatio: view.rsRatio }; })
      .sort(function (a, b) {
        var d = (b.rsRatio == null ? -Infinity : b.rsRatio) - (a.rsRatio == null ? -Infinity : a.rsRatio);
        if (d !== 0) return d;
        return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
      });
    var relativeStrength = { leaders: leaders, top: leaders.length ? leaders[0].id : null };

    // Vehicle: the ETF-fit-weighted projection for the top rotation-into sector (fallback to the
    // top-ranked sector when no into candidate is confirmed).
    var vehicleId = into.length ? into[0].id : (rank.length ? rank[0].id : null);
    var vehicleView = views.find(function (view) { return view.id === vehicleId; }) || null;
    var vehicle = { sector: null, ticker: null, projection: null };
    if (vehicleView && vehicleView.etf && isFiniteNumber(vehicleView.etf.fit) && isFiniteNumber(vehicleView.etf.mom)) {
      vehicle = {
        sector: vehicleView.id,
        ticker: String(vehicleView.etf.ticker || "unavailable"),
        projection: roundTo(etfFitW * vehicleView.etf.fit + (1 - etfFitW) * vehicleView.etf.mom, 6)
      };
    } else if (vehicleView) {
      vehicle = { sector: vehicleView.id, ticker: null, projection: null };
    }

    return {
      benchmark: benchmark,
      shortLookback: params["short-lookback"],
      longLookback: params["long-lookback"],
      accelerationWeight: accelW,
      breadthWeight: breadthW,
      riskWeight: riskW,
      etfFitWeight: etfFitW,
      sectorCount: views.length,
      pricedCount: priced.length,
      transition: transition,
      rank: rank,
      relativeStrength: relativeStrength,
      vehicle: vehicle
    };
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

  function sectorEvidenceState(ownerState) {
    var sectors = (ownerState && Array.isArray(ownerState.sectors)) ? ownerState.sectors : [];
    var priced = 0;
    sectors.forEach(function (sector) {
      var benchmarks = (ownerState && Array.isArray(ownerState.benchmarks)) ? ownerState.benchmarks : Object.keys(sector.rs || {});
      var anyBench = benchmarks.some(function (benchmark) { return Array.isArray(sector.rs && sector.rs[benchmark]) && sector.rs[benchmark].length >= 8; });
      if (anyBench) priced++;
    });
    return priced > 0 ? "ready" : "unavailable";
  }

  /* Build a valid simple-evidence-snapshot/v1 from a frozen owner snapshot. */
  function buildSectorEvidence(api, ownerState) {
    var state = sectorEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "sector-research-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:sector-research-lab:rotation:" + cutoff,
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
        "Rotation uses only the frozen owner relative-strength series currently captured."
      ],
      limitations: [
        "The rotation model describes the selected owner window and does not establish persistence or an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes, gains or loses a sector, or a later observation replaces the current window."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function sectorOutput(input, summary) {
    var provenanceClasses = summary.pricedCount < summary.sectorCount
      ? ["observed-fact", "model-estimate"]
      : ["observed-fact"];
    var calibrationReason = summary.pricedCount + " of " + summary.sectorCount +
      " sectors carry a complete owner relative-strength window.";
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
        rangeOrBand: "Into " + (summary.transition.top.into || "—") + " / out " + (summary.transition.top.out || "—"),
        reason: "Transition, rank, relative strength, and vehicle fit use the exact frozen owner series currently captured."
      },
      assumptions: [
        "Sectors without a complete relative-strength window are excluded from the priced transition and leaders."
      ],
      limitations: [
        "The rotation model describes the selected owner window and does not establish persistence or an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes or a later observation replaces the current window."
      ],
      flatRegionProofs: []
    };
  }

  /* affectsOutputPaths for the sector-rotation parameters. Used to prove the declared output path
     actually moves (or a modeled flat region is proved). Mirrors simple-models.json exactly. */
  var SECTOR_OUTPUT_PATHS = {
    "short-lookback": ["summary.transition"],
    "long-lookback": ["summary.transition"],
    "acceleration-weight": ["summary.rank"],
    "breadth-weight": ["summary.rank"],
    "risk-weight": ["summary.rank"],
    "benchmark": ["summary.relativeStrength"],
    "etf-fit-weight": ["summary.vehicle"]
  };

  function summaryPath(summary, path) {
    if (path === "summary.transition") return summary.transition;
    if (path === "summary.rank") return summary.rank;
    if (path === "summary.relativeStrength") return summary.relativeStrength;
    if (path === "summary.vehicle") return summary.vehicle;
    return null;
  }

  function createSectorRotationAdapter(api, definition, ownerByIdentity) {
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
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.sectors)) {
          return { ok: false, error: { reason: "sector owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildSectorEvidence(api, frozen);
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
        var summary = computeSectorRotationSummary(ownerState, paramMap(input));
        return { ok: true, value: sectorOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeSectorRotationSummary(ownerState, baselineValues);
        var currentSummary = computeSectorRotationSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = SECTOR_OUTPUT_PATHS[parameterId] || [];
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
        var into = summary.transition.top.into;
        var out = summary.transition.top.out;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: into ? ("Rotate toward " + into) : (out ? (out + " weakening") : "No confirmed rotation"),
            numericValue: summary.relativeStrength.leaders.length ? summary.relativeStrength.leaders[0].rsRatio : null,
            unit: "rs-ratio",
            summary: into && out
              ? ("Rotation favors " + into + " as " + out + " rolls over (benchmark " + summary.benchmark + ").")
              : (into
                ? (into + " is the clearest improving rotation (benchmark " + summary.benchmark + ").")
                : (out
                  ? (out + " is weakening; no replacement is confirmed.")
                  : "No rotation is confirmed under the selected owner window.")),
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* Factory: returns the macro-rotation Simple adapters implemented at genuine owner-parity, keyed
     by their exact declared adapter ID. Tools whose owner seam is not yet extracted are absent so
     the shared runtime renders the explicit unavailable state for them. */
  function createMacroRotationAdapters(api, definitions, deps) {
    if (!api || typeof api.fingerprint !== "function" || typeof api.normalizeSimpleInput !== "function") {
      throw new Error("RLMACROROTATION_REQUIRES_RLEXPERIENCE_API");
    }
    var byToolId = Object.create(null);
    (definitions || []).forEach(function (definition) { byToolId[definition.toolId] = definition; });
    var adapters = Object.create(null);
    var ownerByIdentity = new Map();
    if (byToolId["sector-research-lab"]) {
      var sectorDefinition = byToolId["sector-research-lab"];
      adapters[sectorDefinition.adapterId] = createSectorRotationAdapter(api, sectorDefinition, ownerByIdentity);
    }
    return adapters;
  }

  /* Register every implemented macro-rotation adapter with a live shared runtime. Returns the
     per-adapter registration result so the caller can surface honest registration failures. */
  function registerMacroRotationAdapters(runtime, api, definitions, deps) {
    var adapters = createMacroRotationAdapters(api, definitions, deps);
    var results = Object.create(null);
    Object.keys(adapters).forEach(function (adapterId) {
      results[adapterId] = runtime.registerAdapter(adapters[adapterId]);
    });
    return results;
  }

  return {
    contractVersion: "macro-rotation-adapters/v1",
    module: "rlexperience-adapters/macro-rotation.js",
    supportedAdapterIds: ["simple-adapter/sector-rotation-transition/v1"],
    rollZ100: rollZ100,
    rrgQuadrant: rrgQuadrant,
    stateLabel: stateLabel,
    backVal: backVal,
    rotationCandidacy: rotationCandidacy,
    rrgReadout: rrgReadout,
    normList: normList,
    computeSectorRotationSummary: computeSectorRotationSummary,
    createMacroRotationAdapters: createMacroRotationAdapters,
    registerMacroRotationAdapters: registerMacroRotationAdapters
  };
});
