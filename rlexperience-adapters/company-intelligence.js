/* Company Intelligence Simple adapter. It projects acknowledged publication bytes and computes no company metric. */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") throw new Error("RLCOMPANYEXPERIENCE_BROWSER_GLOBAL_UNAVAILABLE");
  globalThis.RLCOMPANYEXPERIENCE = api;
})(function () {
  "use strict";

  var TOOL_ID = "company-intelligence-lab";
  var HORIZON_ORDER = ["immediate", "event", "swing", "structural"];
  var QUALITY_ORDER = { absent: 0, thin: 1, narrow: 2, broad: 3 };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function parameterMap(input) {
    var values = Object.create(null);
    input.parameters.forEach(function (parameter) { values[parameter.parameterId] = parameter.value; });
    return values;
  }

  function evidenceIdentity(api, evidence) {
    return api.fingerprint({
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

  function validProjection(projection) {
    return !!(projection && projection.contractVersion === "company-publication-projection/v1" &&
      projection.pair && projection.pair.authority === "acknowledged" &&
      projection.pair.subjectId === "company:msft" && projection.pair.ticker === "MSFT" &&
      projection.pair.version && Array.isArray(projection.pair.version.horizons) &&
      projection.pair.version.horizons.length === 4 && Array.isArray(projection.versions));
  }

  function buildEvidence(api, definition, projection) {
    var ready = validProjection(projection);
    var pair = ready ? projection.pair : null;
    var cutoff = pair ? pair.evidenceCutoff : "unavailable";
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: definition.toolId,
      state: ready ? "ready" : "unavailable",
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: pair ? "owner:company-intelligence:" + pair.generationId : "owner:company-intelligence:unavailable",
        semanticFingerprint: api.fingerprint(ready ? projection : { state: "unavailable" }),
        sourceClass: ready ? "observed-fact" : "unavailable",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: pair ? pair.composedAt : null,
        freshness: pair ? pair.state : "unavailable",
        dataTier: "acknowledged coupled publication",
        valueState: ready ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [],
      limitations: [
        "The adapter projects an acknowledged company-and-brief pair and never recomputes an owner metric."
      ],
      invalidationConditions: [
        "A later coupled selector or a failed integrity check supersedes this frozen projection."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentity(api, evidence);
    return evidence;
  }

  function selectedVersion(projection, selection) {
    var current = projection.pair.version;
    if (selection === "current") return current;
    if (!current.priorVersionId) return null;
    for (var index = 0; index < projection.versions.length; index += 1) {
      if (projection.versions[index].versionId === current.priorVersionId) return projection.versions[index];
    }
    return null;
  }

  function orderedHorizons(version, order) {
    var source = Array.isArray(version.horizons) ? version.horizons : version.horizonSummaries;
    var rows = source.map(function (horizon) { return clone(horizon); });
    rows.sort(function (left, right) {
      if (order === "evidence-gaps-first") {
        var quality = (QUALITY_ORDER[left.evidenceQuality] ?? -1) - (QUALITY_ORDER[right.evidenceQuality] ?? -1);
        if (quality !== 0) return quality;
      }
      return HORIZON_ORDER.indexOf(left.horizonId) - HORIZON_ORDER.indexOf(right.horizonId);
    });
    return rows;
  }

  function summaryFor(projection, parameters) {
    var version = selectedVersion(projection, parameters["version-view"]);
    if (!version) return null;
    var coverage = version.coverageAccount && version.coverageAccount.totals
      ? version.coverageAccount.totals
      : version.coverageTotals;
    var isCurrent = version.versionId === projection.pair.versionId;
    return {
      contractVersion: "company-multi-horizon-simple-summary/v1",
      generationId: typeof version.generationId === "string" ? version.generationId : null,
      subjectId: version.subjectId,
      version: {
        versionId: version.versionId,
        priorVersionId: version.priorVersionId,
        conclusionChange: version.conclusionChange || null,
        contentFingerprint: version.contentFingerprint,
        evidenceCutoff: version.evidenceCutoff || null,
        composedAt: version.composedAt
      },
      coverage: clone(coverage),
      horizons: orderedHorizons(version, parameters["horizon-order"]),
      combinedDirection: null,
      matchingBrief: isCurrent ? clone(projection.pair.brief) : null
    };
  }

  function summaryPath(summary, path) {
    if (path === "summary.version") return summary.version;
    if (path === "summary.horizons") return summary.horizons;
    return null;
  }

  function buildOutput(input, summary) {
    var values = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: values,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: values };
      }),
      calibration: {
        state: "owner-evidence-relative",
        reason: "Every value is projected from the validated acknowledged company owner read."
      },
      provenance: { classes: ["observed-fact"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: "explicit",
        rangeOrBand: "Four isolated horizon states; no combined direction.",
        reason: "Missing and stale evidence remains inside its owning horizon and coverage row."
      },
      assumptions: [],
      limitations: [
        "The projection is educational context only and grants no recommendation, order, sizing, approval, routing, or execution authority."
      ],
      invalidationConditions: [
        "A later coupled selector or an integrity mismatch supersedes this projection."
      ],
      flatRegionProofs: []
    };
  }

  function createAdapter(api, definition) {
    var ownerByIdentity = new Map();
    var outputPaths = Object.create(null);
    definition.parameterDefinitions.forEach(function (parameter) {
      outputPaths[parameter.parameterId] = parameter.affectsOutputPaths.slice();
    });
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) { return { ok: true, value: candidate }; },
      captureEvidence: function (ownerContext) {
        var projection = ownerContext && ownerContext.ownerState && ownerContext.ownerState.publication;
        if (!validProjection(projection)) {
          return { ok: false, error: { reason: "acknowledged company publication projection required" } };
        }
        var frozen = clone(projection);
        var evidence = buildEvidence(api, definition, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var projection = ownerByIdentity.get(input.evidenceIdentity);
        if (!projection) return { ok: false, error: { reason: "frozen company publication is unavailable" } };
        var summary = summaryFor(projection, parameterMap(input));
        if (!summary) return { ok: false, error: { reason: "the selected acknowledged predecessor is unavailable" } };
        return { ok: true, value: buildOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var projection = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!projection) return { ok: false, error: { reason: "frozen company publication is unavailable" } };
        var baselineParameters = parameterMap(baselineInput);
        var currentParameters = parameterMap(currentInput);
        var baselineSummary = summaryFor(projection, baselineParameters);
        var currentSummary = summaryFor(projection, currentParameters);
        if (!baselineSummary || !currentSummary) {
          return { ok: false, error: { reason: "the selected acknowledged version is unavailable for sensitivity" } };
        }
        var effects = [];
        Object.keys(currentParameters).forEach(function (parameterId) {
          if (baselineParameters[parameterId] === currentParameters[parameterId]) return;
          var paths = outputPaths[parameterId] || [];
          var changed = paths.some(function (path) {
            return api.fingerprint(summaryPath(baselineSummary, path)) !== api.fingerprint(summaryPath(currentSummary, path));
          });
          effects.push({
            parameterId: parameterId,
            oldValue: baselineParameters[parameterId],
            newValue: currentParameters[parameterId],
            direction: "changed",
            magnitude: 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The selected acknowledged records produce the same declared projection."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: false,
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
            valueText: summary.version.versionId,
            numericValue: null,
            unit: "acknowledged-version",
            summary: "Four peer horizons from " + summary.version.versionId + " in generation " + summary.generationId + ".",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  function createCompanyIntelligenceAdapters(api, definitions) {
    if (!api || typeof api.normalizeSimpleInput !== "function" || typeof api.fingerprint !== "function") {
      throw new Error("RLCOMPANYEXPERIENCE_REQUIRES_RLEXPERIENCE_API");
    }
    var adapters = Object.create(null);
    (definitions || []).forEach(function (definition) {
      if (definition.toolId === TOOL_ID) adapters[definition.adapterId] = createAdapter(api, definition);
    });
    return adapters;
  }

  function registerCompanyIntelligenceAdapters(runtime, api, definitions) {
    var adapters = createCompanyIntelligenceAdapters(api, definitions);
    var results = Object.create(null);
    Object.keys(adapters).forEach(function (adapterId) {
      results[adapterId] = runtime.registerAdapter(adapters[adapterId]);
    });
    return results;
  }

  return {
    contractVersion: "company-intelligence-adapters/v1",
    module: "rlexperience-adapters/company-intelligence.js",
    supportedAdapterIds: ["simple-adapter/company-multi-horizon/v1"],
    computeCompanyPublicationSummary: summaryFor,
    createCompanyIntelligenceAdapters: createCompanyIntelligenceAdapters,
    registerCompanyIntelligenceAdapters: registerCompanyIntelligenceAdapters
  };
});