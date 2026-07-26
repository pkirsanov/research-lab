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
 *   2. Location suitability (waterfront-polo-lab). The owner geo + market-
 *      filter primitives are extracted here as the single source and the page
 *      delegates to them. (Added in a later batch.)
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

  /* ═══════════ registration ═══════════
     Build every implemented property adapter for the supplied definitions. The place-based str-scenario
     adapters require the shared owner rental engine (deps.rental = RLRENTAL); when it is absent they are
     simply omitted, so the shared runtime renders the explicit unavailable state for those tools. */

  var STR_SCENARIO_TOOL_IDS = ["palm-springs-rental-market-lab", "ocean-shores-rental-market-lab"];

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
    supportedAdapterIds: ["simple-adapter/str-scenario/palm-springs/v1", "simple-adapter/str-scenario/ocean-shores/v1"],
    computeStrScenarioSummary: computeStrScenarioSummary,
    createPropertyResearchAdapters: createPropertyResearchAdapters,
    registerPropertyResearchAdapters: registerPropertyResearchAdapters
  };
});
