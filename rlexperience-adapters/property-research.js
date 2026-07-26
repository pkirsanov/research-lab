/*
 * rlexperience-adapters/property-research.js
 * ------------------------------------------------------------------------
 * Feature 012 Scope 07 — Property / place-based Simple adapters.
 *
 * This module registers the property Simple adapters that reuse ACTUAL owner
 * logic. There are two owner-seam styles here:
 *
 *   1. Place-based rental scenarios (str-scenario/palm-springs, str-scenario/
 *      ocean-shores). The shared place-based rental engine rlrental.js
 *      (RLRENTAL) is the SINGLE OWNER SOURCE of the cash-flow formula. Its
 *      pure owner function computeRentalResult(context, assumptions) is already
 *      exposed on the RLRENTAL public API and is the exact function the owning
 *      rental pages consume through mountRoute -> completeRender. The str-
 *      scenario Simple adapters consume the SAME computeRentalResult (no copy,
 *      no re-derivation), so Simple and the owner page share one formula
 *      (owner-parity). rlrental.js is passed in as an injected dependency
 *      (deps.rental); this module never imports it, never fetches, and never
 *      re-implements its equations.
 *
 *   2. Location suitability (waterfront-polo-lab). The owner geo distance +
 *      drive-time + nearest-club + market-filter primitives (haversineMi /
 *      driveMinutesApprox / nearestClub / marketPasses) are the single source
 *      here; the owning page delegates to them (RLPROPERTY.*), and the
 *      location-suitability/v1 Simple adapter consumes the same primitives.
 *
 * Adapters are PURE COMPUTE over already-captured, frozen owner state. They
 * NEVER fetch, providerFetch, read local credentials, call an LLM, a public
 * publisher, or a private store; they never mutate owner state; and they never
 * import another domain adapter module. Data acquisition (RLDATA cache reads /
 * payload loading) stays in the owning page; the page hands the adapter an
 * already-loaded, frozen owner snapshot through captureEvidence.
 *
 * Deterministic: the place-based scenario is a pure function of the frozen
 * owner place state + the Simple parameters; no Date.now(), Math.random(), or
 * hidden reseed participates. Missing property economics are PRESERVED as an
 * explicit unavailable state (the owner engine's INCOMPLETE economics result),
 * never zero-filled.
 *
 * Registration is by the exact declared adapter IDs from simple-models.json.
 * A tool whose owner seam is not yet extracted is simply absent from the
 * returned adapter set, so the shared runtime renders the Scope 04 explicit
 * "unavailable" truth state for it — never an invented signal or default.
 *
 * Ships as a UMD dual module: Node (module.exports) for tests, and browser
 * global RLPROPERTY for the owning pages.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLPROPERTY_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLPROPERTY = api;
})(function () {
  "use strict";

  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function roundTo(value, places) {
    if (!isFiniteNumber(value)) return value;
    var factor = Math.pow(10, places);
    return Math.round(value * factor) / factor;
  }

  /* ═══════════ Simple adapter contract wiring (framework infra, not a formula) ═══════════ */

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

  /* affectsOutputPaths read directly from the definition — cannot drift from simple-models.json. */
  function outputPathsFromDefinition(definition) {
    var map = Object.create(null);
    definition.parameterDefinitions.forEach(function (parameter) {
      map[parameter.parameterId] = Array.isArray(parameter.affectsOutputPaths) ? parameter.affectsOutputPaths.slice() : [];
    });
    return map;
  }

  /* ═══════════ str-scenario place-based Simple model (owner seam = rlrental.js computeRentalResult) ═══════════
     Recompute a place-based short-term-rental acquisition scenario for one frozen owner market/segment set
     under an explicit ADR, occupancy, financing rate, operating-cost ratio, insurance, regulatory stress, and
     horizon. The cash-flow itself is computed ONLY by the single-sourced owner engine
     rental.computeRentalResult (the exact function the owning rental page consumes via mountRoute) — this module
     never re-derives revenue, cost, debt-service, or cash flow. Two owner runs are taken:
       - operating: required fixed costs = the disclosed set (insurance) -> COMPLETE -> a real operating
         pre-tax cash flow that every cash-flow parameter genuinely moves;
       - full: required fixed costs additionally include the UNDISCLOSED property economics (property tax,
         capital reserve) that this market does not disclose -> the owner engine returns INCOMPLETE with a NULL
         bottom line and a missingCostFieldIds list. That gap is surfaced verbatim and NEVER zero-filled. */

  function strSegmentPreset(ownerState, segmentParam) {
    var key = segmentParam === "large-luxury" ? "large-luxury" : "whole-market";
    var preset = ownerState.segments && ownerState.segments[key];
    return preset || null;
  }

  /* Build the strict rlrental owner assumptions object (EXACTLY the owner ASSUMPTION_KEYS) from the frozen
     place segment + the Simple parameters. adr/occupancy are supplied as the owner base inputs (adrShock and
     demandDelta stay at 0 for the base case) so the Simple parameter is the literal owner assumption. */
  function strAssumptions(ownerState, preset, params, demandDelta, extraVariableExpense) {
    var insuranceUsd = isFiniteNumber(params.insurance) ? params.insurance : ownerState.baseFixedInsuranceUsd;
    return {
      contractVersion: "place-based-rental-market-user-assumptions/v2",
      marketId: ownerState.marketId,
      segmentId: preset.segmentId,
      pairKey: preset.pairKey,
      unitId: preset.unitId,
      scenarioId: "baseline",
      forecastYear: ownerState.forecastYear,
      demandDelta: demandDelta,
      supplyDelta: 0,
      adrShock: 0,
      downtime: { method: "explicit-disjoint-days", items: [] },
      purchasePriceUsd: preset.purchasePriceUsd,
      leverageRatio: ownerState.leverageRatio,
      downPaymentRatio: ownerState.downPaymentRatio,
      annualMortgageRate: params["financing-rate"] / 100,
      loanTermYears: ownerState.loanTermYears,
      variableOperatingExpenseRatio: params["operating-cost"] / 100 + (extraVariableExpense || 0),
      fixedRiskCosts: [{ costFieldId: "insurance", annualUsd: insuranceUsd }],
      baseOccupancy: params.occupancy / 100,
      baseAdrUsd: params.adr,
      availableNights: preset.availableNights
    };
  }

  function strContext(ownerState, preset, requiredFixedRiskCostFieldIds) {
    return {
      marketId: ownerState.marketId,
      segmentId: preset.segmentId,
      pairKey: preset.pairKey,
      unitId: preset.unitId,
      scenarioId: "baseline",
      formulaVersion: ownerState.formulaVersion,
      baseOccupancy: preset.baseOccupancy,
      baseAdrUsd: preset.baseAdrUsd,
      availableNights: preset.availableNights,
      requiredFixedRiskCostFieldIds: requiredFixedRiskCostFieldIds,
      bounds: {}
    };
  }

  function computeStrScenarioSummary(ownerState, params, rental) {
    if (!rental || typeof rental.computeRentalResult !== "function") {
      throw new Error("RLPROPERTY_REQUIRES_RLRENTAL");
    }
    var preset = strSegmentPreset(ownerState, params.segment);
    if (!preset) throw new Error("RLPROPERTY_STR_SEGMENT_UNAVAILABLE");
    var horizon = Math.max(1, Math.round(params.horizon));

    // Operating owner run: disclosed required costs only -> COMPLETE -> real owner pre-tax cash flow.
    var operatingCtx = strContext(ownerState, preset, ownerState.requiredFixedRiskCostFieldIds);
    var baseAssumptions = strAssumptions(ownerState, preset, params, 0, 0);
    var operating = rental.computeRentalResult(operatingCtx, baseAssumptions);
    if (!operating.ok || !operating.result) {
      throw new Error("RLPROPERTY_STR_OWNER_OPERATING_FAILED:" + ((operating.errors && operating.errors[0] && operating.errors[0].code) || "UNKNOWN"));
    }
    var op = operating.result;

    // Full owner run: additionally require the UNDISCLOSED property economics -> INCOMPLETE -> the honest gap.
    var fullCtx = strContext(ownerState, preset, ownerState.fullRequiredFixedRiskCostFieldIds);
    var full = rental.computeRentalResult(fullCtx, baseAssumptions);
    var fullResult = full.ok ? full.result : { economicsState: "INCOMPLETE", preTaxCashFlowUsd: null, missingCostFieldIds: ownerState.fullRequiredFixedRiskCostFieldIds.slice() };

    // Stress owner run: bounded regulatory demand haircut (occupancy reduction via demandDelta) plus, where the
    // place declares it, a storm/insurance stress added as an extra variable operating-expense share of revenue.
    var regulationStress = isFiniteNumber(params["regulation-stress"]) ? Math.min(1, Math.max(0, params["regulation-stress"])) : 0;
    var stormStressPct = isFiniteNumber(params["storm-insurance-stress"]) ? params["storm-insurance-stress"] : null;
    var stressExtraVariable = stormStressPct != null ? stormStressPct / 100 : 0;
    var stressAssumptions = strAssumptions(ownerState, preset, params, -regulationStress, stressExtraVariable);
    var stressed = rental.computeRentalResult(operatingCtx, stressAssumptions);
    var st = stressed.ok ? stressed.result : null;

    var cashFlow = {
      segment: params.segment,
      adrUsd: params.adr,
      occupancyPct: params.occupancy,
      horizonYears: horizon,
      adjustedOccupancy: roundTo(op.adjustedOccupancy, 6),
      adjustedAdrUsd: roundTo(op.adjustedAdrUsd, 2),
      adjustedRevparUsd: roundTo(op.adjustedRevparUsd, 4),
      effectiveAvailableNights: op.effectiveAvailableNights,
      grossRevenueUsd: roundTo(op.grossRevenueUsd, 2),
      grossYield: roundTo(op.grossYield, 6),
      variableOperatingCostUsd: roundTo(op.variableOperatingCostUsd, 2),
      fixedRiskCostUsd: roundTo(op.fixedRiskCostUsd, 2),
      annualDebtServiceUsd: roundTo(op.annualDebtServiceUsd, 2),
      annualOperatingPreTaxCashFlowUsd: roundTo(op.preTaxCashFlowUsd, 2),
      cumulativeOperatingPreTaxCashFlowUsd: roundTo(op.preTaxCashFlowUsd * horizon, 2),
      // Honest gap — the owner engine's INCOMPLETE full-economics result, surfaced verbatim, never zero-filled.
      fullEconomicsState: fullResult.economicsState,
      fullPreTaxCashFlowUsd: fullResult.preTaxCashFlowUsd,
      missingCostFieldIds: Array.isArray(fullResult.missingCostFieldIds) ? fullResult.missingCostFieldIds.slice() : [],
      missingEconomics: Array.isArray(ownerState.missingEconomics) ? ownerState.missingEconomics.slice() : []
    };

    var stress = {
      regulationStress: regulationStress,
      stormInsuranceStressPct: stormStressPct,
      stressedAdjustedOccupancy: st ? roundTo(st.adjustedOccupancy, 6) : null,
      stressedGrossRevenueUsd: st ? roundTo(st.grossRevenueUsd, 2) : null,
      stressedVariableOperatingCostUsd: st ? roundTo(st.variableOperatingCostUsd, 2) : null,
      stressedAnnualOperatingPreTaxCashFlowUsd: st ? roundTo(st.preTaxCashFlowUsd, 2) : null,
      revenueHaircutUsd: st ? roundTo(op.grossRevenueUsd - st.grossRevenueUsd, 2) : null,
      cashFlowHaircutUsd: st ? roundTo(op.preTaxCashFlowUsd - st.preTaxCashFlowUsd, 2) : null
    };

    return {
      contractVersion: "str-scenario-summary/v1",
      marketId: ownerState.marketId,
      segment: params.segment,
      cashFlow: cashFlow,
      stress: stress
    };
  }

  function strScenarioEvidenceState(ownerState) {
    var hasSegments = ownerState && ownerState.segments && typeof ownerState.segments === "object" && ownerState.segments["whole-market"];
    var hasMarket = ownerState && typeof ownerState.marketId === "string";
    var hasRequired = ownerState && Array.isArray(ownerState.requiredFixedRiskCostFieldIds) && Array.isArray(ownerState.fullRequiredFixedRiskCostFieldIds);
    return (hasSegments && hasMarket && hasRequired) ? "ready" : "unavailable";
  }

  function buildStrScenarioEvidence(api, definition, ownerState) {
    var state = strScenarioEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: definition.toolId,
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:" + definition.toolId + ":place-scenario:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "model-estimate",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "source-qualified place scenario"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "The place-based cash flow is computed only by the shared owner rental engine (computeRentalResult); the Simple layer sets the explicit ADR, occupancy, financing, cost, insurance, and stress inputs."
      ],
      limitations: [
        "Missing property economics — undisclosed property tax and capital reserve — remain unavailable: the full-economics owner result is INCOMPLETE and its bottom line is null rather than zero-filled."
      ],
      invalidationConditions: [
        "The frozen owner market/segment set, required-cost profile, or formula version changes."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function strScenarioOutput(input, summary) {
    var scenarioValues = { summary: summary };
    var incomplete = summary.cashFlow.fullEconomicsState !== "COMPLETE";
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: {
        state: "source-qualified-scenario",
        reason: "Every cash-flow number is the shared owner rental engine's result over the explicit assumptions; undisclosed property economics stay unavailable."
      },
      provenance: { classes: ["model-estimate", "user-assumption"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: incomplete ? "wide" : "bounded",
        rangeOrBand: incomplete
          ? ("Operating pre-tax cash flow computed; full economics incomplete (" + summary.cashFlow.missingCostFieldIds.join(", ") + ")")
          : ("Operating pre-tax cash flow " + summary.cashFlow.annualOperatingPreTaxCashFlowUsd),
        reason: "The operating result is deterministic over the frozen owner place state; the full bottom line is unavailable while property tax and capital reserve are undisclosed."
      },
      assumptions: [
        "ADR, occupancy, financing rate, operating-cost ratio, and insurance are explicit user assumptions passed to the owner engine; they are not observed facts for this property."
      ],
      limitations: [
        "The undisclosed property economics remain unavailable — the full pre-tax cash flow is null, never zero-filled."
      ],
      invalidationConditions: [
        "The frozen owner market/segment set or the required-cost profile changes."
      ],
      flatRegionProofs: []
    };
  }

  function strScenarioSummaryPath(summary, path) {
    if (path === "summary.cashFlow") return summary.cashFlow;
    if (path === "summary.stress") return summary.stress;
    return null;
  }

  function createStrScenarioAdapter(api, definition, ownerByIdentity, rental) {
    var outputPaths = outputPathsFromDefinition(definition);
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
        if (!ownerState || typeof ownerState !== "object" || !ownerState.segments) {
          return { ok: false, error: { reason: "place-based owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildStrScenarioEvidence(api, definition, frozen);
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
        var summary = computeStrScenarioSummary(ownerState, paramMap(input), rental);
        return { ok: true, value: strScenarioOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeStrScenarioSummary(ownerState, baselineValues, rental);
        var currentSummary = computeStrScenarioSummary(ownerState, currentValues, rental);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = outputPaths[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, strScenarioSummaryPath(baselineSummary, path)) !== fingerprintOf(api, strScenarioSummaryPath(currentSummary, path));
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
              reason: "The frozen owner place state yields an identical value on these paths for this parameter change."
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
        var cf = summary.cashFlow;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: (cf.annualOperatingPreTaxCashFlowUsd >= 0 ? "+" : "") + cf.annualOperatingPreTaxCashFlowUsd + " / yr operating",
            numericValue: cf.annualOperatingPreTaxCashFlowUsd,
            unit: "usd-per-year",
            summary: "The " + summary.segment + " " + summary.marketId + " scenario nets " + cf.annualOperatingPreTaxCashFlowUsd + " operating pre-tax cash flow per year on $" + cf.grossRevenueUsd + " gross revenue; full economics stay incomplete (" + cf.missingCostFieldIds.join(", ") + ").",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ location-suitability owner primitives (owner seam = waterfront-polo-lab.html) ═══════════
     The geo distance + drive-time + nearest-club + market-filter primitives are the SINGLE SOURCE for the
     Waterfront × Masters water-polo screener. They are logic-identical to the functions the owning page used
     inline; the page now delegates to these (RLPROPERTY.*), and the location-suitability/v1 Simple adapter
     consumes the SAME primitives (owner-parity). Pure math only — no fetch, no clock, no randomness. */

  /* Great-circle distance in statute miles between two lat/lon points. */
  function haversineMi(aLat, aLon, bLat, bLon) {
    var R = 3958.7613; // Earth radius, miles
    var toRad = Math.PI / 180;
    var dLat = (bLat - aLat) * toRad, dLon = (bLon - aLon) * toRad;
    var s1 = Math.sin(dLat / 2), s2 = Math.sin(dLon / 2);
    var h = s1 * s1 + Math.cos(aLat * toRad) * Math.cos(bLat * toRad) * s2 * s2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  /* Approximate driving minutes for a straight-line distance, inflated by a road factor. */
  function driveMinutesApprox(miles, avgSpeedMph, roadFactor) {
    if (!(miles >= 0) || !(avgSpeedMph > 0)) return null;
    var rf = (roadFactor > 0) ? roadFactor : 1;
    return miles * rf / avgSpeedMph * 60;
  }

  /* Nearest club (by great-circle miles) to a point. clubs: [{lat,lon,...}]. Returns {idx, mi} or null. */
  function nearestClub(lat, lon, clubs) {
    if (!clubs || !clubs.length) return null;
    var best = -1, bestMi = Infinity;
    for (var i = 0; i < clubs.length; i++) {
      var mi = haversineMi(lat, lon, clubs[i].lat, clubs[i].lon);
      if (mi < bestMi) { bestMi = mi; best = i; }
    }
    return { idx: best, mi: bestMi };
  }

  /* Does a market (with a precomputed m.driveMin) pass the filter object f? Pure — no globals. */
  function marketPasses(m, f) {
    if (!m || !f) return false;
    var fitRank = { strong: 3, good: 2, partial: 1, over: 0 };
    if (f.withinOnly && (m.driveMin == null || m.driveMin > f.minutes)) return false;
    var mr = fitRank[m.budgetFit]; if (mr == null) mr = 0;
    var need = fitRank[f.minFit]; if (need == null) need = 0;
    if (mr < need) return false;
    if (f.water && f.water[m.water] === false) return false;
    if (isFinite(f.maxFlood) && m.flood > f.maxFlood) return false;
    if (isFinite(f.maxSurge) && m.surge > f.maxSurge) return false;
    if (isFinite(f.minLand) && m.land < f.minLand) return false;
    if (isFinite(f.maxIns) && m.insBand > f.maxIns) return false;
    return true;
  }

  /* ═══════════ location-suitability Simple model (owner seam = the four primitives above) ═══════════
     Recompute the Waterfront × Masters water-polo market shortlist over one frozen owner universe (drive model,
     Masters clubs, candidate markets) under steerable budget, minimum home size, water type, and maximum travel
     time; partition the universe by an insurance-risk ceiling; and partition it by required flood + club
     evidence. Every geo distance / drive time / nearest-club / market-filter decision comes ONLY from the four
     single-sourced owner primitives; budget + size are genuine owner-fact derivations (median price m.medK,
     price-per-sqft m.ppsf), never re-implemented geometry. Unverified club seeds + estimated hazard data are
     PRESERVED as an explicit verification gap, never silently promoted to verified. */

  function normalizeWaterType(waterType) {
    // Simple enum values: lake / river / intracoastal / canal. The owner market.water uses "canalBay" for canal.
    return waterType === "canal" ? "canalBay" : waterType;
  }

  function computeLocationSuitabilitySummary(ownerState, params) {
    var drive = ownerState.driveModel || {};
    var avgSpeed = isFiniteNumber(drive.avgSpeedMph) ? drive.avgSpeedMph : 38;
    var roadFactor = isFiniteNumber(drive.roadFactor) ? drive.roadFactor : 1.25;
    var clubs = Array.isArray(ownerState.mastersClubs) ? ownerState.mastersClubs : [];
    var markets = Array.isArray(ownerState.markets) ? ownerState.markets : [];

    var budget = params.budget;
    var minimumSize = params["minimum-size"];
    var waterType = normalizeWaterType(params["water-type"]);
    var travelLimit = params["travel-limit"];
    var insuranceCeiling = params["insurance-risk-ceiling"];
    var floodRequired = params["flood-verification"] === true;
    var clubRequired = params["club-verification"] === true;

    // Annotate every market with its nearest-club drive time via the single-sourced owner primitives.
    var annotated = markets.map(function (m) {
      var nearest = nearestClub(m.lat, m.lon, clubs);
      var driveMin = nearest ? driveMinutesApprox(nearest.mi, avgSpeed, roadFactor) : null;
      var club = nearest ? clubs[nearest.idx] : null;
      var impliedSqft = (isFiniteNumber(m.medK) && isFiniteNumber(m.ppsf) && m.ppsf > 0) ? (m.medK * 1000) / m.ppsf : null;
      var affordableSqft = (isFiniteNumber(budget) && isFiniteNumber(m.ppsf) && m.ppsf > 0) ? budget / m.ppsf : null;
      return {
        id: m.id, name: m.name, water: m.water, medK: m.medK, ppsf: m.ppsf,
        insBand: m.insBand, flood: m.flood, surge: m.surge, land: m.land, budgetFit: m.budgetFit,
        dataQuality: m.q,
        nearestClubId: club ? club.id : null,
        nearestClubConfidence: club ? club.confidence : null,
        nearestClubMi: nearest ? roundTo(nearest.mi, 4) : null,
        driveMin: driveMin == null ? null : roundTo(driveMin, 4),
        impliedMedianSqft: impliedSqft == null ? null : Math.round(impliedSqft),
        affordableSqft: affordableSqft == null ? null : Math.round(affordableSqft)
      };
    });

    // Shortlist filter — reuse the owner marketPasses for the water + travel gates; add the steered budget + size
    // owner-fact gates (median price m.medK, implied size m.medK/m.ppsf). insurance / flood / land stay permissive
    // here (they are separate declared paths), so budget/size/water/travel are the only shortlist levers.
    var filter = {
      withinOnly: true, minutes: travelLimit, minFit: "over", minLand: 0,
      maxIns: Infinity, maxFlood: Infinity, maxSurge: Infinity,
      water: { lake: false, river: false, intracoastal: false, canalBay: false, ocean: false }
    };
    filter.water[waterType] = true;

    var shortlist = annotated.filter(function (m) {
      if (!marketPasses(m, filter)) return false;
      var budgetOk = isFiniteNumber(m.medK) && (m.medK * 1000 <= budget);
      // Size gate: at this market's price-per-sqft, does the steered budget buy at least the minimum home size?
      // (budget-independent median-implied size stays informational; the gate is the affordable size.)
      var sizeOk = isFiniteNumber(m.affordableSqft) && (m.affordableSqft >= minimumSize);
      return budgetOk && sizeOk;
    }).sort(function (a, b) {
      var da = a.driveMin == null ? Infinity : a.driveMin;
      var db = b.driveMin == null ? Infinity : b.driveMin;
      if (da !== db) return da - db;
      return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
    });

    // Risk partition over the whole universe by the insurance-risk ceiling (m.insBand ≤ ceiling).
    var withinCeiling = [], overCeiling = [];
    annotated.forEach(function (m) {
      (isFiniteNumber(m.insBand) && m.insBand <= insuranceCeiling ? withinCeiling : overCeiling).push(m.id);
    });

    // Verification partition over the whole universe: flood evidence = measured hazard data; club evidence = a
    // "reported" (not "seed") nearest club. Unverified seeds / estimated hazards are preserved as unverified.
    var verified = [], unverified = [];
    annotated.forEach(function (m) {
      var floodOk = !floodRequired || m.dataQuality === "measured";
      var clubOk = !clubRequired || m.nearestClubConfidence === "reported";
      (floodOk && clubOk ? verified : unverified).push(m.id);
    });

    return {
      contractVersion: "location-suitability-summary/v1",
      universeMarketCount: markets.length,
      shortlist: {
        budget: budget, minimumSize: minimumSize, waterType: params["water-type"], travelLimit: travelLimit,
        count: shortlist.length,
        marketIds: shortlist.map(function (m) { return m.id; }),
        markets: shortlist
      },
      risk: {
        insuranceRiskCeiling: insuranceCeiling,
        withinCeilingCount: withinCeiling.length, overCeilingCount: overCeiling.length,
        withinCeilingIds: withinCeiling, overCeilingIds: overCeiling
      },
      verification: {
        floodRequired: floodRequired, clubRequired: clubRequired,
        verifiedCount: verified.length, unverifiedCount: unverified.length,
        verifiedIds: verified, unverifiedIds: unverified
      }
    };
  }

  function locationSuitabilityEvidenceState(ownerState) {
    var hasMarkets = ownerState && Array.isArray(ownerState.markets) && ownerState.markets.length > 0;
    var hasClubs = ownerState && Array.isArray(ownerState.mastersClubs) && ownerState.mastersClubs.length > 0;
    var hasDrive = ownerState && ownerState.driveModel && typeof ownerState.driveModel === "object";
    return (hasMarkets && hasClubs && hasDrive) ? "ready" : "unavailable";
  }

  function buildLocationSuitabilityEvidence(api, definition, ownerState) {
    var state = locationSuitabilityEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: definition.toolId,
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:" + definition.toolId + ":location-universe:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "model-estimate",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "source-qualified location universe"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Market rankings come only from the shared owner geo / drive-time / nearest-club / market-filter primitives; budget and minimum size are steered assumptions compared against the owner median-price and price-per-sqft facts."
      ],
      limitations: [
        "Masters-club seeds and estimated hazard rows remain unverified: they are preserved as an explicit verification gap and never promoted to verified. The drive time is a straight-line approximation, not a routed isochrone."
      ],
      invalidationConditions: [
        "The frozen owner universe (drive model, Masters clubs, or candidate markets) changes."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function locationSuitabilityOutput(input, summary) {
    var values = { summary: summary };
    var noneShortlisted = summary.shortlist.count === 0;
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: values,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: values };
      }),
      calibration: {
        state: "source-qualified-scenario",
        reason: "Every shortlist / risk / verification decision is the shared owner geo + filter primitives over the explicit steered constraints; unverified club seeds and estimated hazards stay unverified."
      },
      provenance: { classes: ["model-estimate", "user-assumption"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: noneShortlisted ? "wide" : "bounded",
        rangeOrBand: noneShortlisted
          ? "No market satisfies the current budget / size / water / travel constraints"
          : (summary.shortlist.count + " market(s) satisfy the constraints; nearest is " + (summary.shortlist.markets[0] ? summary.shortlist.markets[0].id : "none")),
        reason: "The shortlist is deterministic over the frozen owner universe; the straight-line drive time is an approximation and the club seeds require verification."
      },
      assumptions: [
        "Budget, minimum home size, water type, and maximum travel time are explicit user constraints, not observed facts; the drive time is a road-factor-inflated great-circle estimate."
      ],
      limitations: [
        "Unverified Masters-club seeds and estimated hazard rows are preserved as unverified — never promoted to verified or dropped silently."
      ],
      invalidationConditions: [
        "The frozen owner universe changes, or a club seed is verified."
      ],
      flatRegionProofs: []
    };
  }

  function locationSummaryPath(summary, path) {
    if (path === "summary.shortlist") return summary.shortlist;
    if (path === "summary.risk") return summary.risk;
    if (path === "summary.verification") return summary.verification;
    return null;
  }

  function createLocationSuitabilityAdapter(api, definition, ownerByIdentity) {
    var outputPaths = outputPathsFromDefinition(definition);
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
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.markets)) {
          return { ok: false, error: { reason: "location owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildLocationSuitabilityEvidence(api, definition, frozen);
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
        var summary = computeLocationSuitabilitySummary(ownerState, paramMap(input));
        return { ok: true, value: locationSuitabilityOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeLocationSuitabilitySummary(ownerState, baselineValues);
        var currentSummary = computeLocationSuitabilitySummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = outputPaths[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, locationSummaryPath(baselineSummary, path)) !== fingerprintOf(api, locationSummaryPath(currentSummary, path));
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
              reason: "The frozen owner universe yields an identical value on these paths for this constraint change."
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
        var sl = summary.shortlist;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: sl.count + " market(s) fit",
            numericValue: sl.count,
            unit: "markets",
            summary: sl.count + " of " + summary.universeMarketCount + " candidate markets fit the budget/size/water/travel brief" + (sl.markets[0] ? " (nearest: " + sl.markets[0].id + ", ~" + sl.markets[0].driveMin + " min)" : "") + "; " + summary.verification.unverifiedCount + " market(s) still need verification.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ registration ═══════════
     Build every implemented property adapter for the supplied definitions. The place-based str-scenario
     adapters require the shared owner rental engine (deps.rental = RLRENTAL); when it is absent they are
     simply omitted, so the shared runtime renders the explicit unavailable state for those tools. The
     location-suitability adapter needs no rental dependency — it computes purely from the frozen geo universe. */

  var STR_SCENARIO_TOOL_IDS = ["palm-springs-rental-market-lab", "ocean-shores-rental-market-lab"];
  var LOCATION_SUITABILITY_TOOL_IDS = ["waterfront-polo-lab"];

  function createPropertyResearchAdapters(api, definitions, deps) {
    if (!api || typeof api.fingerprint !== "function" || typeof api.normalizeSimpleInput !== "function") {
      throw new Error("RLPROPERTY_REQUIRES_RLEXPERIENCE_API");
    }
    var rental = deps && deps.rental;
    var byToolId = Object.create(null);
    (definitions || []).forEach(function (definition) { byToolId[definition.toolId] = definition; });
    var adapters = Object.create(null);
    var ownerByIdentity = new Map();
    if (rental && typeof rental.computeRentalResult === "function") {
      STR_SCENARIO_TOOL_IDS.forEach(function (toolId) {
        if (byToolId[toolId]) {
          var definition = byToolId[toolId];
          adapters[definition.adapterId] = createStrScenarioAdapter(api, definition, ownerByIdentity, rental);
        }
      });
    }
    LOCATION_SUITABILITY_TOOL_IDS.forEach(function (toolId) {
      if (byToolId[toolId]) {
        var locationDefinition = byToolId[toolId];
        adapters[locationDefinition.adapterId] = createLocationSuitabilityAdapter(api, locationDefinition, ownerByIdentity);
      }
    });
    return adapters;
  }

  /* Register every implemented property adapter with a live shared runtime. Returns the per-adapter
     registration result so the caller can surface honest registration failures. */
  function registerPropertyResearchAdapters(runtime, api, definitions, deps) {
    var adapters = createPropertyResearchAdapters(api, definitions, deps);
    var results = Object.create(null);
    Object.keys(adapters).forEach(function (adapterId) {
      results[adapterId] = runtime.registerAdapter(adapters[adapterId]);
    });
    return results;
  }

  return {
    contractVersion: "property-research-adapters/v1",
    module: "rlexperience-adapters/property-research.js",
    supportedAdapterIds: ["simple-adapter/str-scenario/palm-springs/v1", "simple-adapter/str-scenario/ocean-shores/v1", "simple-adapter/location-suitability/v1"],
    computeStrScenarioSummary: computeStrScenarioSummary,
    computeLocationSuitabilitySummary: computeLocationSuitabilitySummary,
    haversineMi: haversineMi,
    driveMinutesApprox: driveMinutesApprox,
    nearestClub: nearestClub,
    marketPasses: marketPasses,
    createPropertyResearchAdapters: createPropertyResearchAdapters,
    registerPropertyResearchAdapters: registerPropertyResearchAdapters
  };
});
