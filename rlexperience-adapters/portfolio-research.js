/*
 * rlexperience-adapters/portfolio-research.js
 * ------------------------------------------------------------------------
 * Feature 008 — the Portfolio Survival Simple adapter.
 *
 * This module is its own file rather than part of strategy-research.js for a
 * reason worth stating: Scope-07 membership in Feature 012 is derived from
 * adapterModule, so a Feature 008 tool declaring that module would silently
 * enrol itself in another feature's adapter suite and its per-tool fixture
 * contract. Owning a module keeps the boundary honest in both directions.
 *
 * The adapter is also the quietest in the repository, by design. Every other
 * Simple adapter publishes a result. This one exists so a REGISTERED tool whose
 * every result is personal can still take part in the shared runtime without
 * publishing any of it: the survival figure is real and is rendered locally,
 * while what leaves the device is the permanently-unavailable privacy-boundary
 * read.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLPORTFOLIORESEARCH_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLPORTFOLIORESEARCH = api;
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

  /* Deterministic by contract: the same workspace and parameters must produce the
     same survival figure, or two readings of one portfolio would disagree. */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a += 0x6D2B79F5;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function paramMap(input) {
    var values = {};
    ((input && input.parameterValues) || []).forEach(function (entry) {
      values[entry.parameterId] = entry.value;
    });
    return values;
  }

  function evidenceState(ownerState) {
    var hasReturns = ownerState && Array.isArray(ownerState.returns) && ownerState.returns.length >= 24;
    var hasMandate = ownerState && ownerState.mandate && typeof ownerState.mandate === "object"
      && isFiniteNumber(ownerState.mandate.horizonYears);
    var stamp = ownerState && ownerState.asOf;
    return (hasReturns && hasMandate && typeof stamp === "string" && stamp.length >= 8) ? "ready" : "unavailable";
  }

  function buildEvidence(api, ownerState) {
    var state = evidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "portfolio-survival-allocation-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:portfolio-survival-allocation-lab:workspace:" + cutoff,
        semanticFingerprint: api.fingerprint(ownerState),
        sourceClass: String(ownerState.sourceClass || "user-assumption"),
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: "local portfolio workspace",
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Every input is local and unverified by this tool; a wrong holding produces a confidently wrong survival figure."
      ]
    };
    evidence.evidenceIdentity = api.fingerprint(evidence);
    return evidence;
  }

  /* Survival as a FREQUENCY over resampled history, not a forecast. A path fails
     the first time the balance cannot meet that year's withdrawal. */
  function computePortfolioSurvivalSummary(ownerState, params) {
    var returns = (ownerState && ownerState.returns) || [];
    var horizon = isFiniteNumber(params.horizonYears) ? Math.round(params.horizonYears) : 10;
    var draw = isFiniteNumber(params.annualWithdrawalFraction) ? params.annualWithdrawalFraction : 0.04;
    var trials = 400;
    var rand = mulberry32(20260814);
    var survived = 0;
    var shortfallYears = [];
    for (var t = 0; t < trials; t += 1) {
      var balance = 1;
      var failedAt = null;
      for (var y = 0; y < horizon; y += 1) {
        balance *= (1 + returns[Math.floor(rand() * returns.length)]);
        balance -= draw;
        if (balance <= 0) { failedAt = y + 1; break; }
      }
      if (failedAt === null) survived += 1; else shortfallYears.push(failedAt);
    }
    shortfallYears.sort(function (a, b) { return a - b; });
    return {
      trials: trials,
      horizonYears: horizon,
      annualWithdrawalFraction: draw,
      survivalProbability: survived / trials,
      shortfallYear: shortfallYears.length ? shortfallYears[Math.floor(shortfallYears.length / 2)] : null,
      sampleSize: returns.length
    };
  }

  function output(input, summary) {
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: {
        state: "owner-evidence-relative",
        reason: "Survival is a resampling frequency over " + summary.sampleSize +
          " held observations relative to the owner's own workspace; no out-of-sample check backs it."
      },
      provenance: { classes: ["user-assumption", "model-estimate"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: "wide",
        rangeOrBand: summary.trials + " resampled paths over a " + summary.horizonYears + "-year horizon",
        reason: "Resampling reuses the held sample, so it cannot represent a regime the sample never contained."
      },
      assumptions: [
        "The withdrawal is a constant annual fraction; a real schedule with dated needs is modelled in the owning tool."
      ],
      limitations: [
        "A modelled frequency over past returns is not a probability that the future will behave like the past.",
        "This model publishes nothing: its shared-cache read is permanently unavailable, so no personal result reaches the public brief."
      ],
      invalidationConditions: [
        "The held portfolio revision, mandate horizon, or withdrawal fraction changes."
      ],
      flatRegionProofs: []
    };
  }

  function createPortfolioSurvivalAdapter(api, definition, ownerByIdentity) {
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
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.returns)) {
          return { ok: false, error: { reason: "local portfolio return series owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildEvidence(api, frozen);
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
        return { ok: true, value: output(input, computePortfolioSurvivalSummary(ownerState, paramMap(input))) };
      },
      compareSensitivity: function (baselineInput, currentInput) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        var baseline = computePortfolioSurvivalSummary(ownerState, paramMap(baselineInput));
        var current = computePortfolioSurvivalSummary(ownerState, paramMap(currentInput));
        return {
          ok: true,
          value: {
            contractVersion: "simple-model-sensitivity/v1",
            changed: baseline.survivalProbability !== current.survivalProbability
              || baseline.shortfallYear !== current.shortfallYear,
            baseline: baseline,
            current: current
          }
        };
      },
      projectOwnerEvidence: function (ownerContext) {
        return this.captureEvidence(ownerContext);
      }
    };
  }

  function createPortfolioResearchAdapters(api, definitions) {
    if (!api || typeof api.fingerprint !== "function" || typeof api.normalizeSimpleInput !== "function") {
      throw new Error("RLPORTFOLIORESEARCH_REQUIRES_RLEXPERIENCE_API");
    }
    var byToolId = Object.create(null);
    (definitions || []).forEach(function (definition) { byToolId[definition.toolId] = definition; });
    var adapters = Object.create(null);
    var ownerByIdentity = new Map();
    if (byToolId["portfolio-survival-allocation-lab"]) {
      var definition = byToolId["portfolio-survival-allocation-lab"];
      adapters[definition.adapterId] = createPortfolioSurvivalAdapter(api, definition, ownerByIdentity);
    }
    return adapters;
  }

  function registerPortfolioResearchAdapters(runtime, api, definitions) {
    var adapters = createPortfolioResearchAdapters(api, definitions);
    var results = Object.create(null);
    Object.keys(adapters).forEach(function (adapterId) {
      results[adapterId] = runtime.registerAdapter(adapters[adapterId]);
    });
    return results;
  }

  return {
    contractVersion: "portfolio-research-adapters/v1",
    module: "rlexperience-adapters/portfolio-research.js",
    supportedAdapterIds: ["simple-adapter/portfolio-survival/v1"],
    mulberry32: mulberry32,
    computePortfolioSurvivalSummary: computePortfolioSurvivalSummary,
    createPortfolioResearchAdapters: createPortfolioResearchAdapters,
    registerPortfolioResearchAdapters: registerPortfolioResearchAdapters
  };
});
