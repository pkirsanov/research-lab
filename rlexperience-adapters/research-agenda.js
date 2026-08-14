/* Research Agenda Simple adapter. All model calculations delegate to rlagenda.js. */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") throw new Error("RLRESEARCHAGENDA_BROWSER_GLOBAL_UNAVAILABLE");
  globalThis.RLRESEARCHAGENDA = api;
})(function () {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function parameterMap(input) {
    var values = Object.create(null);
    input.parameters.forEach(function (parameter) { values[parameter.parameterId] = parameter.value; });
    return values;
  }

  function scenarioLabel(node) {
    return String(node.title || node.scenarioId || "unavailable").replace(/[-_]+/g, " ").replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
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

  function leverState(parameters) {
    return {
      hormuzPhysicalPassFraction: parameters["hormuz-pass"],
      babElMandebPhysicalPassFraction: parameters["bab-el-mandeb-pass"],
      reroutedShare: parameters["rerouted-share"],
      inventoryPolicyResponseOffset: parameters["policy-response-offset"],
      demandOffset: parameters["demand-offset"]
    };
  }

  function summaryPath(summary, path) {
    if (path === "summary.posture") return summary.posture;
    if (path === "summary.scenarios") return summary.scenarios;
    if (path === "summary.transmission") return summary.transmission;
    return null;
  }

  function computeSummary(agenda, ownerState, parameters) {
    var computed = agenda.computeAgendaViewState(ownerState.definition, ownerState.review, leverState(parameters));
    if (!computed.ok || !computed.value.modelAvailable) return null;
    var model = computed.value.modelOutputs;
    var roots = ownerState.definition.scenarioTree.nodes.filter(function (node) { return node.parentId === null; });
    var scenarios = roots.map(function (node) {
      var probability = model.scenarioProbability[node.scenarioId];
      return {
        scenarioId: node.scenarioId,
        label: scenarioLabel(node),
        probability: probability ? probability.unconditional : null
      };
    });
    scenarios.sort(function (left, right) { return (right.probability || 0) - (left.probability || 0); });
    var channels = Object.keys(model.channelRanges).map(function (channelId) {
      return { channelId: channelId, range: clone(model.channelRanges[channelId]) };
    });
    return {
      contractVersion: "research-agenda-simple-summary/v1",
      posture: scenarios.length ? scenarios[0].label : "Unavailable",
      scenarios: scenarios,
      transmission: channels,
      parity: computed.value.parity,
      changedLeverIds: computed.value.changedLeverIds.slice()
    };
  }

  function buildEvidence(api, definition, ownerState) {
    var agenda = ownerState.agenda;
    var baseline = agenda.computeAgendaViewState(ownerState.definition, ownerState.review, null);
    var ready = baseline.ok && baseline.value.modelAvailable;
    var cutoff = ownerState.review.attemptedAt;
    var snapshot = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: definition.toolId,
      state: ready ? "ready" : "unavailable",
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:research-agenda:" + ownerState.review.reviewId,
        semanticFingerprint: api.fingerprint({ definition: ownerState.definition, review: ownerState.review }),
        sourceClass: ready ? "model-estimate" : "unavailable",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: ready ? "published-generation" : "unavailable",
        dataTier: "immutable agenda review",
        valueState: ready ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Lever changes are local user assumptions over the immutable published inputs."
      ],
      limitations: [
        "An unavailable current review cannot borrow probabilities, ranges, or posture from a historical dossier."
      ],
      invalidationConditions: [
        "A later current pointer, review, topic definition, or published model input supersedes this frozen owner evidence."
      ],
      evidenceIdentity: null
    };
    snapshot.evidenceIdentity = evidenceIdentity(api, snapshot);
    return snapshot;
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
        state: summary.parity === "matched" ? "canonical-match" : "user-assumption",
        reason: "The adapter delegates to the same canonical agenda view-state function as the owning page."
      },
      provenance: { classes: ["model-estimate", "user-assumption"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: "bounded",
        rangeOrBand: summary.transmission,
        reason: "Ranges preserve the published interval inputs and declared model bounds."
      },
      assumptions: ["Changed controls are user assumptions and do not alter evidence or the published review."],
      limitations: ["This is public research, not investment advice, an action, or a routing decision."],
      invalidationConditions: ["The current review or its published inputs change."],
      computedAt: input.evidenceCutoff,
      modelIdentity: {
        definitionId: input.definitionId,
        modelId: input.modelId,
        modelVersion: input.modelVersion,
        definitionFingerprint: input.definitionFingerprint,
        inputIdentity: input.inputIdentity,
        evidenceIdentity: input.evidenceIdentity,
        seed: input.seed
      },
      performance: { elapsedMs: 0, budgetMs: 250, cooperativeChunkMaxMs: null, yieldCount: 0 }
    };
  }

  function createAdapter(api, definition, agenda) {
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
        if (!ownerContext || !ownerContext.definition || !ownerContext.review) {
          return { ok: false, error: { reason: "agenda owner context required" } };
        }
        var ownerState = { agenda: agenda, definition: clone(ownerContext.definition), review: clone(ownerContext.review) };
        var evidence = buildEvidence(api, definition, ownerState);
        ownerByIdentity.set(evidence.evidenceIdentity, ownerState);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) return { ok: false, error: { reason: "frozen agenda owner state unavailable" } };
        var summary = computeSummary(agenda, ownerState, parameterMap(input));
        if (!summary) return { ok: false, error: { reason: "current agenda model unavailable" } };
        return { ok: true, value: buildOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) return { ok: false, error: { reason: "frozen agenda owner state unavailable" } };
        var baselineParameters = parameterMap(baselineInput);
        var currentParameters = parameterMap(currentInput);
        var baselineSummary = computeSummary(agenda, ownerState, baselineParameters);
        var currentSummary = computeSummary(agenda, ownerState, currentParameters);
        if (!baselineSummary || !currentSummary) return { ok: false, error: { reason: "agenda sensitivity unavailable" } };
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
            direction: currentParameters[parameterId] > baselineParameters[parameterId] ? "higher" : "lower",
            magnitude: Math.abs(currentParameters[parameterId] - baselineParameters[parameterId]) || 1,
            nonlinear: true,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The bounded canonical model yields the same declared output on this interval."
            }
          });
        });
        return { ok: true, value: { contractVersion: "simple-sensitivity/v1", sharedRandomness: sharedRandomness, seedChanged: false, effects: effects } };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: summary.posture,
            numericValue: summary.scenarios.length ? summary.scenarios[0].probability : null,
            unit: "probability",
            summary: summary.posture + " is the highest-probability published scenario; " + summary.changedLeverIds.length + " assumptions differ from published inputs.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  function createResearchAgendaAdapters(api, definitions, deps) {
    var agenda = deps && deps.agenda;
    if (!agenda && typeof globalThis !== "undefined") agenda = globalThis.RLAGENDA;
    if (!api || typeof api.normalizeSimpleInput !== "function") throw new Error("RLRESEARCHAGENDA_REQUIRES_RLEXPERIENCE_API");
    if (!agenda || typeof agenda.computeAgendaViewState !== "function") throw new Error("RLRESEARCHAGENDA_REQUIRES_RLAGENDA");
    var adapters = Object.create(null);
    (definitions || []).forEach(function (definition) {
      if (definition.toolId === "research-agenda-lab") adapters[definition.adapterId] = createAdapter(api, definition, agenda);
    });
    return adapters;
  }

  function registerResearchAgendaAdapters(runtime, api, definitions, deps) {
    var adapters = createResearchAgendaAdapters(api, definitions, deps);
    var results = Object.create(null);
    Object.keys(adapters).forEach(function (adapterId) { results[adapterId] = runtime.registerAdapter(adapters[adapterId]); });
    return results;
  }

  return {
    contractVersion: "research-agenda-adapters/v1",
    module: "rlexperience-adapters/research-agenda.js",
    supportedAdapterIds: ["simple-adapter/research-agenda-posture/v1"],
    createResearchAgendaAdapters: createResearchAgendaAdapters,
    registerResearchAgendaAdapters: registerResearchAgendaAdapters
  };
});