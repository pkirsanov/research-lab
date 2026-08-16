(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
  else root.RLAGENDA = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var AGENDA_VERSION = "research-agenda/v1";
  var TOPIC_VERSION = "research-topic-definition/v1";
  var EVIDENCE_VERSION = "research-evidence-record/v1";
  var SOURCE_VERSION = "research-source/v1";
  var CALIBRATION_VERSION = "research-calibration/v1";
  var EVIDENCE_POLICY_VERSION = "research-evidence-quality-policy/v1";
  var GENERATION_VERSION = "research-generation/v1";
  var REVIEW_VERSION = "research-review/v1";
  var DOSSIER_VERSION = "research-dossier/v1";
  var HISTORY_EVENT_VERSION = "research-history-event/v1";
  var CURRENT_VERSION = "research-agenda-current/v1";
  var PLAN_VERSION = "research-generation-plan/v1";
  var READ_VERSION = "research-agenda-read/v1";
  var REFINEMENT_VERSION = "research-refinement-proposal/v1";
  var FINDING_SEAM_VERSION = "research-finding-reference-seam/v1";
  var VIEW_STATE_VERSION = "research-agenda-view-state/v1";
  var TOOL_READ_VERSION = "research-agenda-tool-read/v1";
  var MODEL_INPUT_VERSION = "research-model-input/v1";
  var ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  var IMMUTABLE_ID_PATTERN = /^(?:generation|review|dossier|source|event)-[a-f0-9]{64}$/;
  var HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
  var VERSION_PATTERN = /^v[1-9][0-9]*\.[0-9]+\.[0-9]+$/;
  var REVIEW_MODES = Object.freeze(["every-generation", "cadence"]);
  var LIFECYCLE_STATES = Object.freeze(["active", "paused", "retired"]);
  var EVIDENCE_ROLES = Object.freeze(["direct", "indirect", "model-inference"]);
  var PROVENANCE_CLASSES = Object.freeze(["observed-fact", "user-assumption", "model-estimate", "unavailable"]);
  var CONFIDENCE_GRADES = Object.freeze(["low", "moderate", "high"]);
  var CORROBORATION_STATES = Object.freeze(["corroborated", "uncorroborated", "conflicted"]);
  var FRESHNESS_STATES = Object.freeze(["current", "stale", "later-than-cutoff"]);
  var EVIDENCE_DIRECTIONS = Object.freeze(["increase", "decrease"]);
  var SECTION_KINDS = Object.freeze([
    "actor-analysis", "scenario-analysis", "flow-analysis", "transmission-analysis",
    "proxy-analysis", "trigger-analysis", "source-ledger", "change-assessment",
    "earnings-analysis", "capacity-analysis", "commodity-analysis", "catalyst-analysis",
    "range-analysis", "invalidation-analysis"
  ]);
  var MODEL_FUNCTION_IDS = Object.freeze([
    "computeEvidenceWeight", "updateEscalationProbabilities", "computeFlowState",
    "computeCommodityShockRanges", "computeEquityProxyRanges", "compareScenarioOutputs",
    "classifyChangeDirection", "buildAgendaChartSeries"
  ]);
  var CHART_KINDS = Object.freeze(["line", "range-band", "stacked-range", "probability-tree"]);
  var TRIGGER_KINDS = Object.freeze(["threshold", "state-change", "elapsed-cadence", "source-observation"]);
  var HISTORY_EVENT_TYPES = Object.freeze(["generation", "review", "lifecycle", "correction", "historical-seed"]);
  var CURRENT_TOPIC_STATES = Object.freeze(["reviewed", "unavailable", "paused", "retired", "deferred", "not-due", "refused"]);
  var PLAN_TOPIC_STATES = Object.freeze(["selected", "not-due", "paused", "retired", "deferred", "refused"]);
  var TRIGGER_OPERATORS = Object.freeze(["equals", "at-least", "below", "above", "changed"]);
  var REVIEW_OUTCOMES = Object.freeze(["updated", "unchanged", "stale", "unavailable"]);
  var CHANGE_ASSESSMENTS = Object.freeze(["strengthened", "weakened", "reversed", "unchanged", "insufficient-evidence"]);
  var AVAILABILITY_STATES = Object.freeze(["available", "unavailable"]);
  var OBSERVATION_STATES = Object.freeze(["fired", "not-fired"]);
  var REFUSAL_CODES = Object.freeze([
    "RLAGENDA-CONTRACT-ABSENT", "RLAGENDA-CONTRACT-UNREADABLE", "RLAGENDA-CONTRACT-SHAPE",
    "RLAGENDA-CONTRACT-UNKNOWN-MEMBER", "RLAGENDA-CONTRACT-MISSING-MEMBER",
    "RLAGENDA-ID-INVALID", "RLAGENDA-ID-DUPLICATE", "RLAGENDA-QUESTION-INVALID",
    "RLAGENDA-QUESTION-DIGEST", "RLAGENDA-BOUNDARY-INVALID", "RLAGENDA-MODE-MISSING",
    "RLAGENDA-MODE-UNKNOWN", "RLAGENDA-MODE-SHAPE", "RLAGENDA-CADENCE-INVALID",
    "RLAGENDA-FRESHNESS-INVALID", "RLAGENDA-CAPACITY-INVALID",
    "RLAGENDA-CAPACITY-EVERY-GENERATION", "RLAGENDA-LIFECYCLE-INVALID",
    "RLAGENDA-SECTION-INVALID", "RLAGENDA-SOURCE-INVALID", "RLAGENDA-EVIDENCE-SHAPE",
    "RLAGENDA-EVIDENCE-VOCABULARY", "RLAGENDA-EVIDENCE-PRIVATE",
    "RLAGENDA-EVIDENCE-IMPACT", "RLAGENDA-MODEL-INVALID", "RLAGENDA-FLOW-INVALID",
    "RLAGENDA-CALIBRATION-INVALID", "RLAGENDA-IDENTITY-INVALID",
    "RLAGENDA-IMMUTABLE-OVERWRITE", "RLAGENDA-HISTORY-INVALID",
    "RLAGENDA-CORRECTION-INVALID", "RLAGENDA-CURRENT-INVALID",
    "RLAGENDA-CURRENT-HISTORICAL", "RLAGENDA-PLAN-INVALID",
    "RLAGENDA-REFINEMENT-INVALID", "RLAGENDA-REFINEMENT-OUTSIDE-BOUNDARY",
    "RLAGENDA-REFINEMENT-QUESTION-DRIFT", "RLAGENDA-REFINEMENT-BOUNDARY-DRIFT",
    "RLAGENDA-PUBLIC-PRIVATE", "RLAGENDA-PUBLIC-SUBJECT"
  ]);
  var AGENDA_FIELDS = Object.freeze(["contractVersion", "reviewPolicy", "topics"]);
  var REVIEW_POLICY_FIELDS = Object.freeze([
    "maxActiveEveryGenerationTopics", "cadenceTopicReviewBudget", "cadenceSelectionOrder",
    "maxConcurrentTopicAcquisitions", "researchAuthoring"
  ]);
  var AUTHORING_FIELDS = Object.freeze(["timeoutSeconds", "attempts", "concurrency", "maxInputBytes", "maxOutputBytes"]);
  var TOPIC_FIELDS = Object.freeze([
    "topicId", "title", "declaredQuestion", "scopeBoundary", "lifecycleState", "reviewPolicy", "definitionRef"
  ]);
  var BOUNDARY_FIELDS = Object.freeze(["geographies", "channels", "horizons", "publicOnly"]);
  var DEFINITION_FIELDS = Object.freeze([
    "contractVersion", "topicId", "definitionVersion", "declaredQuestionSha256", "analyticalSections",
    "evidencePolicy", "sourceRequirements", "triggers", "invalidations", "chartDefinitions",
    "modelFunctionIds", "actors", "scenarioTree", "flowNetwork", "transmissionModels",
    "proxyDefinitions", "calibrationRef"
  ]);
  var DEFINITION_REQUIRED_FIELDS = Object.freeze([
    "contractVersion", "topicId", "definitionVersion", "declaredQuestionSha256", "analyticalSections",
    "evidencePolicy", "sourceRequirements", "triggers", "invalidations", "chartDefinitions", "modelFunctionIds"
  ]);
  var SECTION_FIELDS = Object.freeze(["sectionId", "title", "kind", "required"]);
  var EVIDENCE_POLICY_FIELDS = Object.freeze([
    "contractVersion", "confidenceWeights", "provenanceWeights", "roleWeights",
    "corroborationWeights", "freshnessWeights", "impactCaps"
  ]);
  var SOURCE_REQUIREMENT_FIELDS = Object.freeze([
    "requirementId", "sourceClasses", "queryTemplate", "freshnessHours", "requiredClaimCoverage"
  ]);
  var TRIGGER_FIELDS = Object.freeze(["triggerId", "kind", "description", "targetIds", "condition"]);
  var INVALIDATION_FIELDS = Object.freeze(["invalidationId", "kind", "description", "targetIds", "condition"]);
  var CHART_FIELDS = Object.freeze(["chartId", "title", "kind", "unit", "valuePath"]);
  var EVIDENCE_FIELDS = Object.freeze([
    "contractVersion", "evidenceId", "observedAt", "availableAt", "source", "provenanceClass",
    "evidenceRole", "claim", "actorIds", "channelIds", "claimIds", "confidence", "corroboration",
    "conflicts", "causalPath", "freshness", "modelImpacts", "refutedBy", "modelFunctionId",
    "inputEvidenceIds", "generatedOutputField", "firedRefuters"
  ]);
  var EVIDENCE_REQUIRED_FIELDS = Object.freeze([
    "contractVersion", "evidenceId", "observedAt", "availableAt", "source", "provenanceClass",
    "evidenceRole", "claim", "actorIds", "channelIds", "claimIds", "confidence", "corroboration",
    "conflicts", "causalPath", "freshness", "modelImpacts", "refutedBy"
  ]);
  var SOURCE_FIELDS = Object.freeze([
    "sourceId", "canonicalUrl", "publisher", "sourceClass", "independentOriginGroup", "contentSha256"
  ]);
  var CONFIDENCE_FIELDS = Object.freeze(["grade", "basis"]);
  var CORROBORATION_FIELDS = Object.freeze(["state", "supportingEvidenceIds", "independentOriginCount"]);
  var CONFLICT_FIELDS = Object.freeze(["state", "evidenceIds", "effect"]);
  var FRESHNESS_FIELDS = Object.freeze(["state", "ageHours", "policyRef"]);
  var IMPACT_FIELDS = Object.freeze(["targetKind", "targetId", "direction", "rawMagnitude", "causalPathRef", "rationale"]);
  var CALIBRATION_FIELDS = Object.freeze(["contractVersion", "topicId", "calibrationVersion", "events"]);
  var CALIBRATION_EVENT_FIELDS = Object.freeze([
    "eventId", "eventVersion", "eventTime", "cutoffTime", "sourceRefs", "scenarioId",
    "affectedChannelIds", "preWindow", "postWindow", "barFiles", "benchmark", "proxyReturns",
    "maximumAdverseExcursion", "maximumFavorableExcursion", "confounds", "limitations"
  ]);
  var GENERATION_IDENTITY_FIELDS = Object.freeze(["snapshotDigest", "registryDigest", "briefWindow", "generationCutoff"]);
  var REVIEW_IDENTITY_FIELDS = Object.freeze(["generationId", "topicId", "definitionDigest", "calibrationDigest", "evidenceBundleDigest"]);
  var SOURCE_IDENTITY_FIELDS = Object.freeze(["canonicalUrl", "observedAt", "contentSha256"]);
  var BRIEF_WINDOW_FIELDS = Object.freeze(["start", "end"]);
  var HISTORY_EVENT_BODY_FIELDS = Object.freeze([
    "contractVersion", "eventType", "occurredAt", "topicId", "generationId",
    "reviewId", "dossierId", "correctsEventId", "supersedesEventId", "artifactRef"
  ]);
  var LIFECYCLE_EVENT_BODY_FIELDS = Object.freeze(HISTORY_EVENT_BODY_FIELDS.concat([
    "fromState", "toState", "registryTopicSha256"
  ]));
  var ARTIFACT_REF_FIELDS = Object.freeze(["path", "sha256", "contractVersion", "generationId", "topicId", "historicalOnly"]);
  var MODEL_SNAPSHOT_REF_FIELDS = Object.freeze(["dossierRef", "modelInputsSha256", "modelOutputsSha256", "chartSeriesSha256"]);
  var ACTIVE_REVIEW_FIELDS = Object.freeze([
    "contractVersion", "reviewId", "generationId", "topicId", "attemptedAt", "validationState", "historicalOnly",
    "mode", "selectionReason", "completePass", "outcome", "reason", "newestEvidenceAgeHours", "changeAssessment",
    "sectionStates", "evidenceIds", "modelSnapshotRef", "chartState", "triggerStates", "invalidationStates",
    "dossierRef", "predecessorDossierRef"
  ]);
  var ACTIVE_DOSSIER_FIELDS = Object.freeze([
    "contractVersion", "dossierId", "topicId", "generationId", "reviewId", "mode", "selectionReason",
    "historicalOnly", "validationState", "observedThrough", "outcome", "changeAssessment",
    "declaredQuestionSha256", "sectionStates", "findings", "evidenceRecords", "sourceLedger", "modelInputs",
    "modelOutputs", "chartStates", "triggerStates", "invalidationStates", "predecessorDossierRef", "supersedesDossierRef"
  ]);
  var DOSSIER_CHART_STATE_FIELDS = Object.freeze(["chartId", "state", "series", "annotations"]);
  var DOSSIER_TRIGGER_STATE_FIELDS = Object.freeze(["triggerId", "state", "observedAt", "evidenceRefs"]);
  var DOSSIER_INVALIDATION_STATE_FIELDS = Object.freeze(["invalidationId", "state", "observedAt", "evidenceRefs"]);
  var CURRENT_FIELDS = Object.freeze(["contractVersion", "updatedAt", "generationRef", "topicRefs"]);
  var CURRENT_TOPIC_FIELDS = Object.freeze(["topicId", "state", "reviewRef", "dossierRef"]);
  var READ_FIELDS = Object.freeze(["contractVersion", "generationId", "asOf", "topics", "readFingerprint"]);
  var READ_TOPIC_FIELDS = Object.freeze([
    "topicId", "mode", "state", "reason", "selectionReason", "reviewId", "dossierId", "outcome",
    "changeAssessment", "newestEvidenceAgeHours", "modelState", "chartState",
    "predecessorDossierId", "supersedesDossierId"
  ]);
  var PLAN_EVIDENCE_FIELDS = Object.freeze(["definitionsByTopicId", "triggerObservations"]);
  var TRIGGER_OBSERVATION_FIELDS = Object.freeze(["topicId", "triggerId", "observedAt", "values"]);
  var REFINEMENT_FIELDS = Object.freeze(["contractVersion", "topicId", "declaredQuestion", "scopeBoundary", "subjects"]);
  var REFINEMENT_SUBJECT_FIELDS = Object.freeze(["kind", "value"]);
  var REFINEMENT_SUBJECT_KINDS = Object.freeze(["geography", "channel", "horizon", "public-ticker", "public-market-object"]);
  var PUBLISHED_FINDING_FIELDS = Object.freeze([
    "findingId", "observedAt", "claim", "publicSubjects", "horizon", "source",
    "statedConfidence", "provenanceClass", "evidenceRole", "evidenceRefs",
    "triggerRefs", "invalidationRefs", "causalPath", "refutedBy", "limitations"
  ]);
  var FINDING_SOURCE_FIELDS = Object.freeze(["sourceIds"]);
  var FINDING_CONFIDENCE_FIELDS = Object.freeze(["grade", "basis"]);
  var FINDING_PUBLIC_SUBJECT_FIELDS = Object.freeze(["kind", "value"]);
  var FINDING_HORIZONS = Object.freeze(["structural", "swing", "tactical"]);
  var FINDING_SEAM_FIELDS = Object.freeze(["contractVersion", "topicId", "dossierId", "definitionVersion", "declaredQuestionSha256", "findings"]);
  var FINDING_REFERENCE_FIELDS = Object.freeze([
    "findingId", "observedAt", "claim", "publicSubjects", "horizon", "statedConfidence",
    "provenanceClass", "evidenceRole", "evidenceRefs", "sourceRefs", "triggerRefs",
    "invalidationRefs", "topicId", "dossierId"
  ]);
  var VIEW_LEVER_FIELDS = Object.freeze([
    "hormuzPhysicalPassFraction", "babElMandebPhysicalPassFraction", "reroutedShare",
    "inventoryPolicyResponseOffset", "demandOffset"
  ]);
  var MODEL_INPUT_FIELDS = Object.freeze([
    "contractVersion", "chokepointState", "inventoryGapByChannel", "levers",
    "currentBars", "calibrationEvents", "evidenceImpacts"
  ]);
  var CHOKEPOINT_STATE_FIELDS = Object.freeze(["physicalPassFraction", "insuredPassFraction", "delayDays"]);
  var INTERVAL_FIELDS = Object.freeze(["low", "base", "high"]);
  var CURRENT_BAR_FIELDS = Object.freeze(["sym", "asof", "latest"]);
  var CURRENT_BAR_ROW_FIELDS = Object.freeze(["t", "o", "h", "l", "c", "v"]);
  var MODEL_IMPACT_FIELDS = Object.freeze(["targetId", "weightedImpact"]);
  var COMMODITY_LEVER_FIELDS = Object.freeze(["inventoryPolicyResponseOffset", "demandOffset"]);
  var CHANGE_ASSESSMENT_THRESHOLDS = Object.freeze({
    minimumEvidenceCoverage: 0.5,
    materialDelta: 0.1,
    reversalThreshold: 0.1
  });
  var PRIVATE_FIELD_PATTERN = /^(position|positions|quantity|quantities|sharecount|shares|costbasis|pnl|profitloss)$/i;
  var PUBLIC_PRIVATE_FIELD_TOKENS = Object.freeze([
    "position", "positions", "size", "quantity", "quantities", "costbasis",
    "profitandloss", "pnl", "account", "accountid", "mandate", "token",
    "key", "apikey", "password", "secret"
  ]);
  var CADENCE_ORDER = Object.freeze(["trigger-fired-first", "oldest-last-review", "declaration-order", "topic-id"]);
  var CONTRACT_SHAPES = Object.freeze({
    agenda: Object.freeze(AGENDA_FIELDS.slice()),
    reviewPolicy: Object.freeze(REVIEW_POLICY_FIELDS.slice()),
    topic: Object.freeze(TOPIC_FIELDS.slice()),
    topicDefinition: Object.freeze(DEFINITION_FIELDS.slice()),
    evidenceRecord: Object.freeze(EVIDENCE_FIELDS.slice()),
    calibration: Object.freeze(CALIBRATION_FIELDS.slice())
  });

  function isPlainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== "[object Object]") return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
  }

  function isFiniteNumber(value) {
    return typeof value === "number" && isFinite(value);
  }

  function isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim() === value && value.length > 0;
  }

  function isStringList(value, allowEmpty) {
    if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) return false;
    for (var index = 0; index < value.length; index += 1) {
      if (!isNonEmptyString(value[index])) return false;
    }
    return true;
  }

  function isUniqueStringList(value, allowEmpty) {
    if (!isStringList(value, allowEmpty)) return false;
    var seen = Object.create(null);
    for (var index = 0; index < value.length; index += 1) {
      if (seen[value[index]]) return false;
      seen[value[index]] = true;
    }
    return true;
  }

  function includesValue(list, value) {
    return list.indexOf(value) !== -1;
  }

  function exactShape(value, allowedFields, requiredFields) {
    if (!isPlainObject(value)) return { code: "RLAGENDA-CONTRACT-SHAPE", field: null };
    var allowed = Object.create(null);
    var index;
    for (index = 0; index < allowedFields.length; index += 1) allowed[allowedFields[index]] = true;
    var keys = Object.keys(value);
    for (index = 0; index < keys.length; index += 1) {
      if (!allowed[keys[index]]) return { code: "RLAGENDA-CONTRACT-UNKNOWN-MEMBER", field: keys[index] };
    }
    for (index = 0; index < requiredFields.length; index += 1) {
      if (!hasOwn(value, requiredFields[index])) return { code: "RLAGENDA-CONTRACT-MISSING-MEMBER", field: requiredFields[index] };
    }
    return null;
  }

  function refusal(code, reason, field, topicId) {
    return Object.freeze({
      code: code,
      reason: reason,
      field: field || null,
      topicId: topicId || null
    });
  }

  function agendaResult(status, declaredCount, accepted, refusals) {
    return Object.freeze({
      ok: status === "available",
      status: status,
      declaredCount: declaredCount,
      accepted: Object.freeze(accepted.slice()),
      refusals: Object.freeze(refusals.slice())
    });
  }

  function utf8Bytes(text) {
    var bytes = [];
    var index;
    for (index = 0; index < text.length; index += 1) {
      var codePoint = text.charCodeAt(index);
      if (codePoint >= 0xD800 && codePoint <= 0xDBFF && index + 1 < text.length) {
        var low = text.charCodeAt(index + 1);
        if (low >= 0xDC00 && low <= 0xDFFF) {
          codePoint = ((codePoint - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
          index += 1;
        }
      }
      if (codePoint < 0x80) bytes.push(codePoint);
      else if (codePoint < 0x800) {
        bytes.push(0xC0 | (codePoint >> 6), 0x80 | (codePoint & 0x3F));
      } else if (codePoint < 0x10000) {
        bytes.push(0xE0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3F), 0x80 | (codePoint & 0x3F));
      } else {
        bytes.push(0xF0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3F),
          0x80 | ((codePoint >> 6) & 0x3F), 0x80 | (codePoint & 0x3F));
      }
    }
    return bytes;
  }

  function rotateRight(value, count) {
    return (value >>> count) | (value << (32 - count));
  }

  function sha256Text(text) {
    var constants = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    var hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var bytes = utf8Bytes(String(text));
    var bitLength = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    var high = Math.floor(bitLength / 0x100000000);
    var low = bitLength >>> 0;
    bytes.push((high >>> 24) & 255, (high >>> 16) & 255, (high >>> 8) & 255, high & 255,
      (low >>> 24) & 255, (low >>> 16) & 255, (low >>> 8) & 255, low & 255);
    for (var offset = 0; offset < bytes.length; offset += 64) {
      var words = new Array(64);
      var wordIndex;
      for (wordIndex = 0; wordIndex < 16; wordIndex += 1) {
        var byteIndex = offset + (wordIndex * 4);
        words[wordIndex] = ((bytes[byteIndex] << 24) | (bytes[byteIndex + 1] << 16) |
          (bytes[byteIndex + 2] << 8) | bytes[byteIndex + 3]) | 0;
      }
      for (wordIndex = 16; wordIndex < 64; wordIndex += 1) {
        var prior15 = words[wordIndex - 15];
        var prior2 = words[wordIndex - 2];
        var sigma0 = rotateRight(prior15, 7) ^ rotateRight(prior15, 18) ^ (prior15 >>> 3);
        var sigma1 = rotateRight(prior2, 17) ^ rotateRight(prior2, 19) ^ (prior2 >>> 10);
        words[wordIndex] = (words[wordIndex - 16] + sigma0 + words[wordIndex - 7] + sigma1) | 0;
      }
      var a = hash[0]; var b = hash[1]; var c = hash[2]; var d = hash[3];
      var e = hash[4]; var f = hash[5]; var g = hash[6]; var h = hash[7];
      for (wordIndex = 0; wordIndex < 64; wordIndex += 1) {
        var bigSigma1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
        var choose = (e & f) ^ ((~e) & g);
        var temp1 = (h + bigSigma1 + choose + constants[wordIndex] + words[wordIndex]) | 0;
        var bigSigma0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
        var majority = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (bigSigma0 + majority) | 0;
        h = g; g = f; f = e; e = (d + temp1) | 0;
        d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }
      hash[0] = (hash[0] + a) | 0; hash[1] = (hash[1] + b) | 0;
      hash[2] = (hash[2] + c) | 0; hash[3] = (hash[3] + d) | 0;
      hash[4] = (hash[4] + e) | 0; hash[5] = (hash[5] + f) | 0;
      hash[6] = (hash[6] + g) | 0; hash[7] = (hash[7] + h) | 0;
    }
    var output = "";
    for (var hashIndex = 0; hashIndex < hash.length; hashIndex += 1) output += (hash[hashIndex] >>> 0).toString(16).padStart(8, "0");
    return "sha256:" + output;
  }

  function canonicalizeAgenda(value) {
    if (value === null) return "null";
    if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
    if (typeof value === "number") {
      if (!isFiniteNumber(value)) throw new Error("non-finite agenda number");
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) return "[" + value.map(canonicalizeAgenda).join(",") + "]";
    if (isPlainObject(value)) {
      return "{" + Object.keys(value).sort().map(function (key) {
        return JSON.stringify(key) + ":" + canonicalizeAgenda(value[key]);
      }).join(",") + "}";
    }
    throw new Error("unsupported agenda value");
  }

  function freezeAgenda(value) {
    if (!value || (typeof value !== "object")) return value;
    Object.keys(value).forEach(function (key) { freezeAgenda(value[key]); });
    return Object.freeze(value);
  }

  function isDeepFrozenAgenda(value) {
    if (!value || typeof value !== "object") return true;
    if (!Object.isFrozen(value)) return false;
    return Object.keys(value).every(function (key) { return isDeepFrozenAgenda(value[key]); });
  }

  function cloneAgenda(value) {
    return JSON.parse(canonicalizeAgenda(value));
  }

  function agendaDigest(value) {
    return sha256Text(canonicalizeAgenda(value));
  }

  function isCanonicalInstant(value) {
    return isNonEmptyString(value) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && isFinite(Date.parse(value));
  }

  function identityFailure(field) {
    return Object.freeze({ ok: false, code: "RLAGENDA-IDENTITY-INVALID", field: field });
  }

  function identitySuccess(kind, digest) {
    return Object.freeze({ ok: true, kind: kind, id: kind + "-" + digest.slice(7), digest: digest });
  }

  function deriveGenerationId(input) {
    var shape = exactShape(input, GENERATION_IDENTITY_FIELDS, GENERATION_IDENTITY_FIELDS);
    if (shape) return identityFailure(shape.field || "generation");
    if (!HASH_PATTERN.test(input.snapshotDigest) || !HASH_PATTERN.test(input.registryDigest)) return identityFailure("digest");
    var windowShape = exactShape(input.briefWindow, BRIEF_WINDOW_FIELDS, BRIEF_WINDOW_FIELDS);
    if (windowShape || !isCanonicalInstant(input.briefWindow.start) || !isCanonicalInstant(input.briefWindow.end) ||
      Date.parse(input.briefWindow.start) > Date.parse(input.briefWindow.end) || !isCanonicalInstant(input.generationCutoff)) return identityFailure("briefWindow");
    try { return identitySuccess("generation", agendaDigest(input)); } catch (error) { return identityFailure("generation"); }
  }

  function deriveReviewId(input) {
    var shape = exactShape(input, REVIEW_IDENTITY_FIELDS, REVIEW_IDENTITY_FIELDS);
    if (shape) return identityFailure(shape.field || "review");
    if (!IMMUTABLE_ID_PATTERN.test(input.generationId) || !ID_PATTERN.test(input.topicId) ||
        !HASH_PATTERN.test(input.definitionDigest) || !HASH_PATTERN.test(input.calibrationDigest) ||
        !HASH_PATTERN.test(input.evidenceBundleDigest)) return identityFailure("review");
    try { return identitySuccess("review", agendaDigest(input)); } catch (error) { return identityFailure("review"); }
  }

  function deriveDossierId(body) {
    if (!isPlainObject(body) || hasOwn(body, "dossierId")) return identityFailure("dossier");
    try { return identitySuccess("dossier", agendaDigest(body)); } catch (error) { return identityFailure("dossier"); }
  }

  function deriveSourceId(input) {
    var shape = exactShape(input, SOURCE_IDENTITY_FIELDS, SOURCE_IDENTITY_FIELDS);
    if (shape) return identityFailure(shape.field || "source");
    if (!isCanonicalInstant(input.observedAt) || !HASH_PATTERN.test(input.contentSha256)) return identityFailure("source");
    try {
      var parsed = new URL(input.canonicalUrl);
      if (parsed.protocol !== "https:") return identityFailure("canonicalUrl");
      return identitySuccess("source", agendaDigest(input));
    } catch (error) { return identityFailure("canonicalUrl"); }
  }

  function validImmutablePath(path) {
    return isNonEmptyString(path) && path.indexOf("\\") === -1 && path.indexOf("..") === -1 &&
      /^research\/agenda\/(?:generations|reviews|dossiers|sources|calibrations)\/[A-Za-z0-9._/-]+\.json$/.test(path);
  }

  function immutablePathForRecord(value) {
    if (!isPlainObject(value)) return null;
    if (value.contractVersion === GENERATION_VERSION && IMMUTABLE_ID_PATTERN.test(value.generationId || "")) {
      return "research/agenda/generations/" + value.generationId + ".json";
    }
    if (value.contractVersion === REVIEW_VERSION && ID_PATTERN.test(value.topicId || "") && IMMUTABLE_ID_PATTERN.test(value.generationId || "")) {
      return "research/agenda/reviews/" + value.topicId + "/" + value.generationId + ".json";
    }
    if (value.contractVersion === DOSSIER_VERSION && ID_PATTERN.test(value.topicId || "")) {
      if (value.historicalOnly === true && /^historical-\d{4}-\d{2}-\d{2}-v[1-9][0-9]*$/.test(value.dossierId || "") && value.generationId === null && value.reviewId === null) {
        return "research/agenda/dossiers/" + value.topicId + "/" + value.dossierId + ".json";
      }
      if (value.historicalOnly === false && IMMUTABLE_ID_PATTERN.test(value.dossierId || "") && IMMUTABLE_ID_PATTERN.test(value.generationId || "") && IMMUTABLE_ID_PATTERN.test(value.reviewId || "")) {
        return "research/agenda/dossiers/" + value.topicId + "/" + value.dossierId + ".json";
      }
    }
    if (value.contractVersion === SOURCE_VERSION && IMMUTABLE_ID_PATTERN.test(value.sourceId || "")) {
      return "research/agenda/sources/" + value.sourceId + ".json";
    }
    if (value.contractVersion === CALIBRATION_VERSION && ID_PATTERN.test(value.topicId || "") && VERSION_PATTERN.test(value.calibrationVersion || "")) {
      return "research/agenda/calibrations/" + value.topicId + "/" + value.calibrationVersion + ".json";
    }
    return null;
  }

  function predecessorDossierExists(value, existingByPath) {
    if (value.contractVersion !== DOSSIER_VERSION || value.historicalOnly === true) return true;
    var predecessorRef = value.supersedesDossierRef;
    if (predecessorRef === null) {
      return !Object.keys(existingByPath).some(function (path) {
        var existing = existingByPath[path];
        return isPlainObject(existing) && existing.contractVersion === DOSSIER_VERSION &&
          existing.topicId === value.topicId && existing.historicalOnly !== true;
      });
    }
    var refShape = exactShape(predecessorRef, ARTIFACT_REF_FIELDS, ARTIFACT_REF_FIELDS);
    if (refShape || predecessorRef.contractVersion !== DOSSIER_VERSION || predecessorRef.topicId !== value.topicId ||
        predecessorRef.historicalOnly || !hasOwn(existingByPath, predecessorRef.path)) return false;
    var existing = existingByPath[predecessorRef.path];
    return isPlainObject(existing) && existing.contractVersion === DOSSIER_VERSION && existing.topicId === value.topicId &&
      existing.historicalOnly === false && predecessorRef.sha256 === agendaDigest(existing);
  }

  function prepareImmutableCreate(path, value, existingByPath) {
    if (!validImmutablePath(path) || !isPlainObject(value) || !isPlainObject(existingByPath)) {
      return Object.freeze({ ok: false, code: "RLAGENDA-IDENTITY-INVALID", path: path || null });
    }
    var candidateDigest;
    try { candidateDigest = agendaDigest(value); } catch (error) {
      return Object.freeze({ ok: false, code: "RLAGENDA-IDENTITY-INVALID", path: path });
    }
    if (hasOwn(existingByPath, path)) {
      var existingDigest = null;
      try { existingDigest = agendaDigest(existingByPath[path]); } catch (error) { existingDigest = null; }
      return Object.freeze({
        ok: false,
        code: "RLAGENDA-IMMUTABLE-OVERWRITE",
        path: path,
        existingDigest: existingDigest,
        candidateDigest: candidateDigest
      });
    }
    if (immutablePathForRecord(value) !== path || !predecessorDossierExists(value, existingByPath)) {
      return Object.freeze({ ok: false, code: "RLAGENDA-IDENTITY-INVALID", path: path });
    }
    return freezeAgenda({ ok: true, path: path, sha256: candidateDigest, value: cloneAgenda(value) });
  }

  function classifyTopicLifecycle(topic, historyRefs) {
    if (!isPlainObject(topic) || !ID_PATTERN.test(topic.topicId || "") || !includesValue(LIFECYCLE_STATES, topic.lifecycleState) || !Array.isArray(historyRefs)) {
      return Object.freeze({ ok: false, code: "RLAGENDA-LIFECYCLE-INVALID" });
    }
    var state = topic.lifecycleState;
    return freezeAgenda({
      ok: true,
      topicId: topic.topicId,
      lifecycleState: state,
      shouldResearch: state === "active",
      outcome: state === "active" ? null : state,
      historyRefs: cloneAgenda(historyRefs)
    });
  }

  function deriveHistoryEventId(eventBody) {
    var bodyFields = eventBody && eventBody.eventType === "lifecycle" ? LIFECYCLE_EVENT_BODY_FIELDS : HISTORY_EVENT_BODY_FIELDS;
    var shape = exactShape(eventBody, bodyFields, bodyFields);
    if (shape) return identityFailure(shape.field || "historyEvent");
    try { return identitySuccess("event", agendaDigest(eventBody)); } catch (error) { return identityFailure("historyEvent"); }
  }

  function buildHistoryEvent(eventBody) {
    var identity = deriveHistoryEventId(eventBody);
    if (!identity.ok || eventBody.contractVersion !== HISTORY_EVENT_VERSION || !includesValue(HISTORY_EVENT_TYPES, eventBody.eventType) ||
      !isCanonicalInstant(eventBody.occurredAt) || (eventBody.eventType === "generation" ? eventBody.topicId !== null : !ID_PATTERN.test(eventBody.topicId || ""))) {
      return Object.freeze({ ok: false, code: "RLAGENDA-HISTORY-INVALID" });
    }
    if (eventBody.eventType === "correction" && !ID_PATTERN.test(eventBody.correctsEventId || "")) {
      return Object.freeze({ ok: false, code: "RLAGENDA-CORRECTION-INVALID" });
    }
    if (eventBody.eventType !== "correction" && eventBody.correctsEventId !== null) {
      return Object.freeze({ ok: false, code: "RLAGENDA-CORRECTION-INVALID" });
    }
    if (eventBody.eventType === "lifecycle" &&
      !((eventBody.fromState === null || includesValue(LIFECYCLE_STATES, eventBody.fromState)) &&
        includesValue(LIFECYCLE_STATES, eventBody.toState) && eventBody.fromState !== eventBody.toState &&
        /^generation-[a-f0-9]{64}$/.test(eventBody.generationId || "") &&
        eventBody.reviewId === null && eventBody.dossierId === null && eventBody.artifactRef === null &&
        HASH_PATTERN.test(eventBody.registryTopicSha256 || "") &&
        ((eventBody.fromState === null && eventBody.supersedesEventId === null) ||
          (eventBody.fromState !== null && IMMUTABLE_ID_PATTERN.test(eventBody.supersedesEventId || ""))))) {
      return Object.freeze({ ok: false, code: "RLAGENDA-LIFECYCLE-INVALID" });
    }
    if (eventBody.supersedesEventId !== null && !IMMUTABLE_ID_PATTERN.test(eventBody.supersedesEventId || "")) {
      return Object.freeze({ ok: false, code: "RLAGENDA-HISTORY-INVALID" });
    }
    if (eventBody.artifactRef !== null) {
      var refShape = exactShape(eventBody.artifactRef, ARTIFACT_REF_FIELDS, ARTIFACT_REF_FIELDS);
      if (refShape || !validImmutablePath(eventBody.artifactRef.path) || !HASH_PATTERN.test(eventBody.artifactRef.sha256)) {
        return Object.freeze({ ok: false, code: "RLAGENDA-HISTORY-INVALID" });
      }
    }
    var event = cloneAgenda(eventBody);
    event.eventId = identity.id;
    return freezeAgenda({ ok: true, event: event });
  }

  function parseHistoryText(text) {
    if (typeof text !== "string" || (text.length > 0 && !text.endsWith("\n"))) return { ok: false, code: "RLAGENDA-HISTORY-INVALID" };
    var lines = text.split("\n").filter(function (line) { return line.length > 0; });
    var events = [];
    var seen = Object.create(null);
    for (var index = 0; index < lines.length; index += 1) {
      try {
        var event = JSON.parse(lines[index]);
        var bodyFields = event && event.eventType === "lifecycle" ? LIFECYCLE_EVENT_BODY_FIELDS : HISTORY_EVENT_BODY_FIELDS;
        var eventFields = ["eventId"].concat(bodyFields);
        var shape = exactShape(event, eventFields, eventFields);
        if (shape || canonicalizeAgenda(event) !== lines[index]) return { ok: false, code: "RLAGENDA-HISTORY-INVALID" };
        var body = cloneAgenda(event); delete body.eventId;
        var built = buildHistoryEvent(body);
        if (!built.ok || built.event.eventId !== event.eventId || seen[event.eventId]) return { ok: false, code: built.code || "RLAGENDA-HISTORY-INVALID" };
        if (event.correctsEventId !== null && !seen[event.correctsEventId]) return { ok: false, code: "RLAGENDA-CORRECTION-INVALID" };
        if (event.supersedesEventId !== null && !seen[event.supersedesEventId]) return { ok: false, code: "RLAGENDA-HISTORY-INVALID" };
        seen[event.eventId] = true;
        events.push(event);
      } catch (error) { return { ok: false, code: "RLAGENDA-HISTORY-INVALID" }; }
    }
    return { ok: true, events: events };
  }

  function appendHistoryEvents(existingText, newEvents) {
    var prior = parseHistoryText(existingText);
    if (!prior.ok || !Array.isArray(newEvents) || newEvents.length === 0) return Object.freeze({ ok: false, code: "RLAGENDA-HISTORY-INVALID" });
    var seen = Object.create(null);
    prior.events.forEach(function (event) { seen[event.eventId] = true; });
    var appended = [];
    for (var index = 0; index < newEvents.length; index += 1) {
      var event = newEvents[index];
      var bodyFields = event && event.eventType === "lifecycle" ? LIFECYCLE_EVENT_BODY_FIELDS : HISTORY_EVENT_BODY_FIELDS;
      var eventFields = ["eventId"].concat(bodyFields);
      var shape = exactShape(event, eventFields, eventFields);
      if (shape || seen[event.eventId]) return Object.freeze({ ok: false, code: "RLAGENDA-HISTORY-INVALID" });
      var body = cloneAgenda(event); delete body.eventId;
      var built = buildHistoryEvent(body);
      if (!built.ok || built.event.eventId !== event.eventId) return Object.freeze({ ok: false, code: built.code || "RLAGENDA-HISTORY-INVALID" });
      if (event.eventType === "correction" && !seen[event.correctsEventId]) return Object.freeze({ ok: false, code: "RLAGENDA-CORRECTION-INVALID" });
      if (event.supersedesEventId !== null && !seen[event.supersedesEventId]) return Object.freeze({ ok: false, code: "RLAGENDA-HISTORY-INVALID" });
      seen[event.eventId] = true;
      appended.push(cloneAgenda(event));
    }
    var suffix = appended.map(canonicalizeAgenda).join("\n") + "\n";
    return freezeAgenda({
      ok: true,
      priorPrefixSha256: sha256Text(existingText),
      candidateText: existingText + suffix,
      appendedEventIds: appended.map(function (event) { return event.eventId; })
    });
  }

  function planLifecycleEvents(registry, historyText, generationId, occurredAt) {
    if (!isPlainObject(registry) || !Array.isArray(registry.topics) ||
      !/^generation-[a-f0-9]{64}$/.test(generationId || "") || !isCanonicalInstant(occurredAt)) {
      return Object.freeze({ ok: false, code: "RLAGENDA-LIFECYCLE-INVALID" });
    }
    var prior = parseHistoryText(historyText);
    if (!prior.ok) return Object.freeze({ ok: false, code: prior.code });
    var latestByTopicId = Object.create(null);
    prior.events.forEach(function (event) {
      if (event.eventType === "lifecycle") latestByTopicId[event.topicId] = event;
    });
    var seenTopics = Object.create(null);
    var events = [];
    for (var index = 0; index < registry.topics.length; index += 1) {
      var topic = registry.topics[index];
      if (!isPlainObject(topic) || !ID_PATTERN.test(topic.topicId || "") || seenTopics[topic.topicId] ||
        !includesValue(LIFECYCLE_STATES, topic.lifecycleState)) {
        return Object.freeze({ ok: false, code: "RLAGENDA-LIFECYCLE-INVALID" });
      }
      seenTopics[topic.topicId] = true;
      var previous = latestByTopicId[topic.topicId] || null;
      var fromState = previous ? previous.toState : null;
      if (fromState === topic.lifecycleState) continue;
      var built = buildHistoryEvent({
        contractVersion: HISTORY_EVENT_VERSION,
        eventType: "lifecycle",
        occurredAt: occurredAt,
        topicId: topic.topicId,
        generationId: generationId,
        reviewId: null,
        dossierId: null,
        correctsEventId: null,
        supersedesEventId: previous ? previous.eventId : null,
        artifactRef: null,
        fromState: fromState,
        toState: topic.lifecycleState,
        registryTopicSha256: agendaDigest(topic)
      });
      if (!built.ok) return Object.freeze({ ok: false, code: built.code });
      events.push(built.event);
    }
    return freezeAgenda({ ok: true, events: events });
  }

  function buildArtifactRef(path, record) {
    if (!validImmutablePath(path) || !isPlainObject(record) || !isNonEmptyString(record.contractVersion)) {
      return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID" });
    }
    return freezeAgenda({
      ok: true,
      ref: {
        path: path,
        sha256: agendaDigest(record),
        contractVersion: record.contractVersion,
        generationId: hasOwn(record, "generationId") ? record.generationId : null,
        topicId: hasOwn(record, "topicId") ? record.topicId : null,
        historicalOnly: record.historicalOnly === true
      }
    });
  }

  function validateDossierArtifactRef(ref, topicId, allowNull) {
    if (ref === null) return allowNull ? null : { code: "RLAGENDA-CONTRACT-SHAPE", field: "dossierRef" };
    var shape = exactShape(ref, ARTIFACT_REF_FIELDS, ARTIFACT_REF_FIELDS);
    if (shape) return shape;
    if (!validImmutablePath(ref.path) || ref.contractVersion !== DOSSIER_VERSION || ref.topicId !== topicId ||
        ref.historicalOnly !== false || !HASH_PATTERN.test(ref.sha256) || !IMMUTABLE_ID_PATTERN.test(ref.generationId || "")) {
      return { code: "RLAGENDA-CONTRACT-SHAPE", field: "dossierRef" };
    }
    return null;
  }

  function dossierIdFromRef(ref) {
    if (ref === null) return null;
    var filename = ref.path.slice(ref.path.lastIndexOf("/") + 1);
    return filename.slice(0, -".json".length);
  }

  function validateActiveDossier(dossier, definition) {
    var shape = exactShape(dossier, ACTIVE_DOSSIER_FIELDS, ACTIVE_DOSSIER_FIELDS);
    if (shape) return freezeAgenda({ ok: false, code: shape.code, field: shape.field });
    if (dossier.contractVersion !== DOSSIER_VERSION || dossier.historicalOnly !== false || dossier.validationState !== "validated" ||
        !IMMUTABLE_ID_PATTERN.test(dossier.dossierId || "") || !ID_PATTERN.test(dossier.topicId || "") ||
        !IMMUTABLE_ID_PATTERN.test(dossier.generationId || "") || !IMMUTABLE_ID_PATTERN.test(dossier.reviewId || "") ||
        !includesValue(REVIEW_MODES, dossier.mode) || !isNonEmptyString(dossier.selectionReason) ||
        !isCanonicalInstant(dossier.observedThrough) || dossier.outcome !== "updated" ||
        !includesValue(CHANGE_ASSESSMENTS, dossier.changeAssessment) || !HASH_PATTERN.test(dossier.declaredQuestionSha256 || "") ||
        !Array.isArray(dossier.sectionStates) || !Array.isArray(dossier.findings) || !Array.isArray(dossier.evidenceRecords) ||
        !Array.isArray(dossier.sourceLedger) || !isPlainObject(dossier.modelInputs) || !isPlainObject(dossier.modelOutputs) ||
        !Array.isArray(dossier.chartStates) || !Array.isArray(dossier.triggerStates) || !Array.isArray(dossier.invalidationStates)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "dossier" });
    }
    var modelInputShape = exactShape(dossier.modelInputs, MODEL_INPUT_FIELDS, MODEL_INPUT_FIELDS);
    if (modelInputShape || dossier.modelInputs.contractVersion !== MODEL_INPUT_VERSION) {
      return freezeAgenda({ ok: false, code: modelInputShape ? modelInputShape.code : "RLAGENDA-MODEL-INVALID", field: modelInputShape ? modelInputShape.field : "contractVersion" });
    }
    if (typeof definition !== "undefined") {
      var inputValidation = validateResearchModelInput(dossier.modelInputs, definition, dossier.observedThrough);
      if (!inputValidation.ok) return freezeAgenda({ ok: false, code: inputValidation.code, field: inputValidation.field || "modelInputs" });
    }
    var predecessorShape = validateDossierArtifactRef(dossier.predecessorDossierRef, dossier.topicId, true);
    var supersedesShape = validateDossierArtifactRef(dossier.supersedesDossierRef, dossier.topicId, true);
    if (predecessorShape) return freezeAgenda({ ok: false, code: predecessorShape.code, field: "predecessorDossierRef" });
    if (supersedesShape) return freezeAgenda({ ok: false, code: supersedesShape.code, field: "supersedesDossierRef" });
    if (canonicalizeAgenda(dossier.predecessorDossierRef) !== canonicalizeAgenda(dossier.supersedesDossierRef)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "supersedesDossierRef" });
    }
    for (var chartIndex = 0; chartIndex < dossier.chartStates.length; chartIndex += 1) {
      var chart = dossier.chartStates[chartIndex];
      var chartShape = exactShape(chart, DOSSIER_CHART_STATE_FIELDS, DOSSIER_CHART_STATE_FIELDS);
      if (chartShape || !ID_PATTERN.test(chart.chartId || "") || !includesValue(AVAILABILITY_STATES, chart.state) ||
          !Array.isArray(chart.series) || !Array.isArray(chart.annotations)) {
        return freezeAgenda({ ok: false, code: chartShape ? chartShape.code : "RLAGENDA-CONTRACT-SHAPE", field: chartShape ? chartShape.field : "chartStates" });
      }
    }
    for (var triggerIndex = 0; triggerIndex < dossier.triggerStates.length; triggerIndex += 1) {
      var trigger = dossier.triggerStates[triggerIndex];
      var triggerShape = exactShape(trigger, DOSSIER_TRIGGER_STATE_FIELDS, DOSSIER_TRIGGER_STATE_FIELDS);
      if (triggerShape || !ID_PATTERN.test(trigger.triggerId || "") || !includesValue(OBSERVATION_STATES, trigger.state) ||
          (trigger.observedAt !== null && !isCanonicalInstant(trigger.observedAt)) || !isStringList(trigger.evidenceRefs, true)) {
        return freezeAgenda({ ok: false, code: triggerShape ? triggerShape.code : "RLAGENDA-CONTRACT-SHAPE", field: triggerShape ? triggerShape.field : "triggerStates" });
      }
    }
    for (var invalidationIndex = 0; invalidationIndex < dossier.invalidationStates.length; invalidationIndex += 1) {
      var invalidation = dossier.invalidationStates[invalidationIndex];
      var invalidationShape = exactShape(invalidation, DOSSIER_INVALIDATION_STATE_FIELDS, DOSSIER_INVALIDATION_STATE_FIELDS);
      if (invalidationShape || !ID_PATTERN.test(invalidation.invalidationId || "") || !includesValue(OBSERVATION_STATES, invalidation.state) ||
          (invalidation.observedAt !== null && !isCanonicalInstant(invalidation.observedAt)) || !isStringList(invalidation.evidenceRefs, true)) {
        return freezeAgenda({ ok: false, code: invalidationShape ? invalidationShape.code : "RLAGENDA-CONTRACT-SHAPE", field: invalidationShape ? invalidationShape.field : "invalidationStates" });
      }
    }
    if (typeof definition !== "undefined") {
      if (!isPlainObject(definition) || definition.topicId !== dossier.topicId || !Array.isArray(definition.chartDefinitions) ||
          !Array.isArray(definition.triggers) || !Array.isArray(definition.invalidations)) {
        return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "definition" });
      }
      var chartIds = dossier.chartStates.map(function (row) { return row.chartId; });
      var triggerIds = dossier.triggerStates.map(function (row) { return row.triggerId; });
      var invalidationIds = dossier.invalidationStates.map(function (row) { return row.invalidationId; });
      if (canonicalizeAgenda(chartIds) !== canonicalizeAgenda(definition.chartDefinitions.map(function (row) { return row.chartId; })) ||
          canonicalizeAgenda(triggerIds) !== canonicalizeAgenda(definition.triggers.map(function (row) { return row.triggerId; })) ||
          canonicalizeAgenda(invalidationIds) !== canonicalizeAgenda(definition.invalidations.map(function (row) { return row.invalidationId; }))) {
        return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "definition" });
      }
    }
    var dossierBody = cloneAgenda(dossier);
    delete dossierBody.dossierId;
    var identity = deriveDossierId(dossierBody);
    if (!identity.ok || identity.id !== dossier.dossierId) return freezeAgenda({ ok: false, code: "RLAGENDA-IDENTITY-INVALID", field: "dossierId" });
    return freezeAgenda({ ok: true, dossier: cloneAgenda(dossier) });
  }

  function validateActiveReview(review, recordsByPath) {
    var shape = exactShape(review, ACTIVE_REVIEW_FIELDS, ACTIVE_REVIEW_FIELDS);
    if (shape) return freezeAgenda({ ok: false, code: shape.code, field: shape.field });
    if (review.contractVersion !== REVIEW_VERSION || review.historicalOnly !== false || review.validationState !== "validated" ||
        !IMMUTABLE_ID_PATTERN.test(review.reviewId || "") || !IMMUTABLE_ID_PATTERN.test(review.generationId || "") ||
        !ID_PATTERN.test(review.topicId || "") || !isCanonicalInstant(review.attemptedAt) || !includesValue(REVIEW_MODES, review.mode) ||
        !isNonEmptyString(review.selectionReason) || typeof review.completePass !== "boolean" || !includesValue(REVIEW_OUTCOMES, review.outcome) ||
        !includesValue(CHANGE_ASSESSMENTS, review.changeAssessment) || !Array.isArray(review.sectionStates) ||
        !isStringList(review.evidenceIds, true) || !includesValue(AVAILABILITY_STATES, review.chartState) ||
        !includesValue(AVAILABILITY_STATES, review.triggerStates) || !includesValue(AVAILABILITY_STATES, review.invalidationStates) ||
        (review.newestEvidenceAgeHours !== null && (!isFiniteNumber(review.newestEvidenceAgeHours) || review.newestEvidenceAgeHours < 0))) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "review" });
    }
    var dossierShape = validateDossierArtifactRef(review.dossierRef, review.topicId, true);
    var predecessorShape = validateDossierArtifactRef(review.predecessorDossierRef, review.topicId, true);
    if (dossierShape) return freezeAgenda({ ok: false, code: dossierShape.code, field: "dossierRef" });
    if (predecessorShape) return freezeAgenda({ ok: false, code: predecessorShape.code, field: "predecessorDossierRef" });
    if (review.outcome === "updated" && (review.reason !== null || review.completePass !== true || review.dossierRef === null)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "outcome" });
    }
    if (review.outcome !== "updated" && !isNonEmptyString(review.reason)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "reason" });
    }
    if (includesValue(["unchanged", "stale"], review.outcome) && review.completePass !== true) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "completePass" });
    }
    if (review.outcome === "unavailable" && (review.dossierRef !== null || review.modelSnapshotRef !== null)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "modelSnapshotRef" });
    }
    if (review.outcome === "unchanged" && (review.dossierRef === null || review.predecessorDossierRef === null ||
        canonicalizeAgenda(review.dossierRef) !== canonicalizeAgenda(review.predecessorDossierRef))) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "dossierRef" });
    }
    if (review.outcome === "stale" && review.dossierRef !== null &&
        canonicalizeAgenda(review.dossierRef) !== canonicalizeAgenda(review.predecessorDossierRef)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "dossierRef" });
    }
    if (review.modelSnapshotRef === null) {
      if (typeof recordsByPath !== "undefined" && review.predecessorDossierRef !== null) {
        var prior = isPlainObject(recordsByPath) ? recordsByPath[review.predecessorDossierRef.path] : null;
        var priorValidation = validateActiveDossier(prior);
        if (!priorValidation.ok || review.predecessorDossierRef.sha256 !== agendaDigest(prior) || dossierIdFromRef(review.predecessorDossierRef) !== prior.dossierId) {
          return freezeAgenda({ ok: false, code: priorValidation.ok ? "RLAGENDA-CURRENT-INVALID" : priorValidation.code, field: priorValidation.ok ? "predecessorDossierRef" : priorValidation.field });
        }
      }
      if (review.dossierRef !== null || review.chartState !== "unavailable" || review.triggerStates !== "unavailable" || review.invalidationStates !== "unavailable") {
        return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: "modelSnapshotRef" });
      }
      return freezeAgenda({ ok: true, review: cloneAgenda(review) });
    }
    var snapshotShape = exactShape(review.modelSnapshotRef, MODEL_SNAPSHOT_REF_FIELDS, MODEL_SNAPSHOT_REF_FIELDS);
    if (snapshotShape || review.dossierRef === null ||
        canonicalizeAgenda(review.modelSnapshotRef.dossierRef) !== canonicalizeAgenda(review.dossierRef) ||
        !HASH_PATTERN.test(review.modelSnapshotRef.modelInputsSha256 || "") ||
        !HASH_PATTERN.test(review.modelSnapshotRef.modelOutputsSha256 || "") ||
        !HASH_PATTERN.test(review.modelSnapshotRef.chartSeriesSha256 || "") ||
        review.chartState !== "available" || review.triggerStates !== "available" || review.invalidationStates !== "available") {
      return freezeAgenda({ ok: false, code: snapshotShape ? snapshotShape.code : "RLAGENDA-CONTRACT-SHAPE", field: snapshotShape ? snapshotShape.field : "modelSnapshotRef" });
    }
    if (typeof recordsByPath !== "undefined") {
      if (review.predecessorDossierRef !== null) {
        var predecessor = isPlainObject(recordsByPath) ? recordsByPath[review.predecessorDossierRef.path] : null;
        var predecessorValidation = validateActiveDossier(predecessor);
        if (!predecessorValidation.ok || review.predecessorDossierRef.sha256 !== agendaDigest(predecessor) || dossierIdFromRef(review.predecessorDossierRef) !== predecessor.dossierId) {
          return freezeAgenda({ ok: false, code: predecessorValidation.ok ? "RLAGENDA-CURRENT-INVALID" : predecessorValidation.code, field: predecessorValidation.ok ? "predecessorDossierRef" : predecessorValidation.field });
        }
      }
      if (!isPlainObject(recordsByPath) || !hasOwn(recordsByPath, review.dossierRef.path)) {
        return freezeAgenda({ ok: false, code: "RLAGENDA-CURRENT-INVALID", field: "dossierRef" });
      }
      var dossier = recordsByPath[review.dossierRef.path];
      var dossierValidation = validateActiveDossier(dossier);
      if (!dossierValidation.ok || review.dossierRef.sha256 !== agendaDigest(dossier) || dossierIdFromRef(review.dossierRef) !== dossier.dossierId ||
          review.modelSnapshotRef.modelInputsSha256 !== agendaDigest(dossier.modelInputs) ||
          review.modelSnapshotRef.modelOutputsSha256 !== agendaDigest(dossier.modelOutputs) ||
          review.modelSnapshotRef.chartSeriesSha256 !== agendaDigest(dossier.chartStates)) {
        return freezeAgenda({ ok: false, code: dossierValidation.ok ? "RLAGENDA-CURRENT-INVALID" : dossierValidation.code, field: dossierValidation.ok ? "modelSnapshotRef" : dossierValidation.field });
      }
    }
    return freezeAgenda({ ok: true, review: cloneAgenda(review) });
  }

  function validateCurrentRef(ref, recordsByPath, expectedVersion, allowHistorical) {
    var shape = exactShape(ref, ARTIFACT_REF_FIELDS, ARTIFACT_REF_FIELDS);
    if (shape || !validImmutablePath(ref.path) || !hasOwn(recordsByPath, ref.path)) return { ok: false, code: "RLAGENDA-CURRENT-INVALID" };
    var record = recordsByPath[ref.path];
    if (expectedVersion === REVIEW_VERSION && record && record.historicalOnly !== true) {
      var reviewValidation = validateActiveReview(record, recordsByPath);
      if (!reviewValidation.ok) return { ok: false, code: reviewValidation.code, field: reviewValidation.field };
    }
    if (expectedVersion === DOSSIER_VERSION && record && record.historicalOnly !== true) {
      var dossierValidation = validateActiveDossier(record);
      if (!dossierValidation.ok) return { ok: false, code: dossierValidation.code, field: dossierValidation.field };
    }
    if (!isPlainObject(record) || record.contractVersion !== expectedVersion || record.validationState !== "validated" || immutablePathForRecord(record) !== ref.path ||
        ref.sha256 !== agendaDigest(record) || ref.contractVersion !== record.contractVersion ||
        ref.generationId !== (hasOwn(record, "generationId") ? record.generationId : null) ||
        ref.topicId !== (hasOwn(record, "topicId") ? record.topicId : null) || ref.historicalOnly !== (record.historicalOnly === true)) {
      return { ok: false, code: "RLAGENDA-CURRENT-INVALID" };
    }
    if (!allowHistorical && ref.historicalOnly) return { ok: false, code: "RLAGENDA-CURRENT-HISTORICAL" };
    return { ok: true, record: record };
  }

  function validateCurrentPointer(pointer, recordsByPath) {
    var shape = exactShape(pointer, CURRENT_FIELDS, CURRENT_FIELDS);
    if (shape || pointer.contractVersion !== CURRENT_VERSION || !isPlainObject(recordsByPath) || !Array.isArray(pointer.topicRefs)) {
      return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID" });
    }
    if (pointer.generationRef === null) {
      if (pointer.updatedAt !== null || pointer.topicRefs.length !== 0) return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID" });
      return freezeAgenda({ ok: true, pointer: cloneAgenda(pointer), records: [] });
    }
    if (!isCanonicalInstant(pointer.updatedAt)) return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID" });
    var generation = validateCurrentRef(pointer.generationRef, recordsByPath, GENERATION_VERSION, false);
    if (!generation.ok) return Object.freeze({ ok: false, code: generation.code });
    var resolved = [generation.record];
    var seenTopics = Object.create(null);
    for (var index = 0; index < pointer.topicRefs.length; index += 1) {
      var topicRef = pointer.topicRefs[index];
      var topicShape = exactShape(topicRef, CURRENT_TOPIC_FIELDS, CURRENT_TOPIC_FIELDS);
      if (topicShape || !ID_PATTERN.test(topicRef.topicId || "") || seenTopics[topicRef.topicId] || !includesValue(CURRENT_TOPIC_STATES, topicRef.state)) {
        return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID" });
      }
      seenTopics[topicRef.topicId] = true;
      if (topicRef.state === "reviewed" && topicRef.reviewRef === null) {
        return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID" });
      }
      if (topicRef.state === "unavailable" && topicRef.reviewRef === null) {
        return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID" });
      }
      if (includesValue(["paused", "retired", "deferred", "not-due", "refused"], topicRef.state) && topicRef.reviewRef !== null) {
        return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID" });
      }
      if (topicRef.reviewRef !== null) {
        var review = validateCurrentRef(topicRef.reviewRef, recordsByPath, REVIEW_VERSION, false);
        if (!review.ok || review.record.topicId !== topicRef.topicId || review.record.generationId !== generation.record.generationId) return Object.freeze({ ok: false, code: review.code || "RLAGENDA-CURRENT-INVALID", field: review.field || null });
        if (topicRef.state === "reviewed" && includesValue(["updated", "unchanged"], review.record.outcome) && topicRef.dossierRef === null) return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID" });
        resolved.push(review.record);
      }
      if (topicRef.dossierRef !== null) {
        var dossier = validateCurrentRef(topicRef.dossierRef, recordsByPath, DOSSIER_VERSION, false);
        if (!dossier.ok || dossier.record.topicId !== topicRef.topicId) return Object.freeze({ ok: false, code: dossier.code || "RLAGENDA-CURRENT-INVALID", field: dossier.field || null });
        resolved.push(dossier.record);
      }
    }
    return freezeAgenda({ ok: true, pointer: cloneAgenda(pointer), records: cloneAgenda(resolved) });
  }

  function validateAgendaRead(read, registry) {
    var shape = exactShape(read, READ_FIELDS, READ_FIELDS);
    if (shape || read.contractVersion !== READ_VERSION || !IMMUTABLE_ID_PATTERN.test(read.generationId || "") ||
        !isCanonicalInstant(read.asOf) || !Array.isArray(read.topics) || !isPlainObject(registry) || !Array.isArray(registry.topics)) {
      return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID", field: shape ? shape.field : "researchAgenda" });
    }
    var expectedById = Object.create(null);
    registry.topics.forEach(function (topic) { expectedById[topic.topicId] = topic; });
    var seen = Object.create(null);
    for (var index = 0; index < read.topics.length; index += 1) {
      var row = read.topics[index];
      var rowShape = exactShape(row, READ_TOPIC_FIELDS, READ_TOPIC_FIELDS);
      if (rowShape || !ID_PATTERN.test(row.topicId || "") || !expectedById[row.topicId] || seen[row.topicId] ||
          !includesValue(REVIEW_MODES, row.mode) || !includesValue(CURRENT_TOPIC_STATES, row.state) ||
          !(row.reason === null || isNonEmptyString(row.reason)) || !isNonEmptyString(row.selectionReason) ||
          !(row.reviewId === null || IMMUTABLE_ID_PATTERN.test(row.reviewId || "")) ||
          !(row.dossierId === null || IMMUTABLE_ID_PATTERN.test(row.dossierId || "")) ||
          !includesValue(REVIEW_OUTCOMES.concat(["paused", "retired", "deferred", "not-due", "refused"]), row.outcome) ||
          !includesValue(CHANGE_ASSESSMENTS, row.changeAssessment) || !includesValue(AVAILABILITY_STATES, row.modelState) ||
          !includesValue(AVAILABILITY_STATES, row.chartState) ||
          !(row.predecessorDossierId === null || IMMUTABLE_ID_PATTERN.test(row.predecessorDossierId || "")) ||
          !(row.supersedesDossierId === null || IMMUTABLE_ID_PATTERN.test(row.supersedesDossierId || ""))) {
        return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID", field: rowShape ? rowShape.field : "topics" });
      }
      seen[row.topicId] = true;
      var topic = expectedById[row.topicId];
      if (topic.lifecycleState === "active" && topic.reviewPolicy.mode === "every-generation" &&
          (!includesValue(["reviewed", "unavailable"], row.state) || !IMMUTABLE_ID_PATTERN.test(row.reviewId || ""))) {
        return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID", field: "mandatoryReview" });
      }
      if (row.newestEvidenceAgeHours !== null && (!isFiniteNumber(row.newestEvidenceAgeHours) || row.newestEvidenceAgeHours < 0)) {
        return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID", field: "newestEvidenceAgeHours" });
      }
    }
    if (Object.keys(seen).length !== registry.topics.length) return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID", field: "topicAccounting" });
    var body = cloneAgenda(read); delete body.readFingerprint;
    if (read.readFingerprint !== agendaDigest(body)) return Object.freeze({ ok: false, code: "RLAGENDA-CURRENT-INVALID", field: "readFingerprint" });
    return freezeAgenda({ ok: true, read: cloneAgenda(read) });
  }

  function triggerConditionMatches(condition, values) {
    var shape = exactShape(condition, ["field", "operator", "value"], ["field", "operator", "value"]);
    if (shape || !isNonEmptyString(condition.field) || !includesValue(TRIGGER_OPERATORS, condition.operator) || !isPlainObject(values) || !hasOwn(values, condition.field)) return false;
    var observed = values[condition.field];
    if (condition.operator === "equals" || condition.operator === "changed") {
      try { return canonicalizeAgenda(observed) === canonicalizeAgenda(condition.value); } catch (error) { return false; }
    }
    if (!isFiniteNumber(observed) || !isFiniteNumber(condition.value)) return false;
    if (condition.operator === "at-least") return observed >= condition.value;
    if (condition.operator === "below") return observed < condition.value;
    return observed > condition.value;
  }

  function latestReviewTimes(events) {
    var byTopicId = Object.create(null);
    for (var index = 0; index < events.length; index += 1) {
      var event = events[index];
      if (event.eventType !== "review") continue;
      if (!byTopicId[event.topicId] || Date.parse(event.occurredAt) > Date.parse(byTopicId[event.topicId])) byTopicId[event.topicId] = event.occurredAt;
    }
    return byTopicId;
  }

  function matchingTrigger(definition, observations, topicId, lastReviewAt, cutoffMs) {
    var candidates = [];
    var lastReviewMs = lastReviewAt === null ? -Infinity : Date.parse(lastReviewAt);
    for (var triggerIndex = 0; triggerIndex < definition.triggers.length; triggerIndex += 1) {
      var trigger = definition.triggers[triggerIndex];
      if (trigger.kind === "elapsed-cadence") continue;
      for (var observationIndex = 0; observationIndex < observations.length; observationIndex += 1) {
        var observation = observations[observationIndex];
        if (observation.topicId === topicId && observation.triggerId === trigger.triggerId &&
          Date.parse(observation.observedAt) > lastReviewMs && Date.parse(observation.observedAt) <= cutoffMs &&
          triggerConditionMatches(trigger.condition, observation.values)) {
          candidates.push({ triggerId: trigger.triggerId, observedAt: observation.observedAt });
        }
      }
    }
    candidates.sort(function (left, right) {
      var timeDelta = Date.parse(right.observedAt) - Date.parse(left.observedAt);
      return timeDelta || left.triggerId.localeCompare(right.triggerId);
    });
    return candidates.length > 0 ? candidates[0] : null;
  }

  function planGeneration(registry, historyText, committedEvidence, generationCutoff) {
    var cutoffMs = Date.parse(generationCutoff);
    if (!isCanonicalInstant(generationCutoff) || !isPlainObject(committedEvidence)) return freezeAgenda({ ok: false, code: "RLAGENDA-PLAN-INVALID" });
    var evidenceShape = exactShape(committedEvidence, PLAN_EVIDENCE_FIELDS, PLAN_EVIDENCE_FIELDS);
    if (evidenceShape || !isPlainObject(committedEvidence.definitionsByTopicId) || !Array.isArray(committedEvidence.triggerObservations)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-PLAN-INVALID" });
    }
    var history = parseHistoryText(historyText);
    if (!history.ok) return freezeAgenda({ ok: false, code: history.code });
    var agenda = validateAgenda(registry);
    if (!agenda.ok && agenda.refusals.some(function (row) { return row.code === "RLAGENDA-CAPACITY-EVERY-GENERATION"; })) {
      return freezeAgenda({
        contractVersion: PLAN_VERSION,
        ok: false,
        code: "RLAGENDA-CAPACITY-EVERY-GENERATION",
        generationCutoff: generationCutoff,
        declaredTopicCount: agenda.declaredCount,
        classifications: [],
        selected: [],
        refusals: cloneAgenda(agenda.refusals)
      });
    }
    if (agenda.status === "invalid") return freezeAgenda({ ok: false, code: agenda.refusals[0].code, refusals: cloneAgenda(agenda.refusals) });
    var observations = [];
    for (var observationIndex = 0; observationIndex < committedEvidence.triggerObservations.length; observationIndex += 1) {
      var observation = committedEvidence.triggerObservations[observationIndex];
      var observationShape = exactShape(observation, TRIGGER_OBSERVATION_FIELDS, TRIGGER_OBSERVATION_FIELDS);
      if (observationShape || !ID_PATTERN.test(observation.topicId || "") || !ID_PATTERN.test(observation.triggerId || "") ||
          !isCanonicalInstant(observation.observedAt) || !isPlainObject(observation.values) || containsPrivateField(observation.values)) {
        return freezeAgenda({ ok: false, code: "RLAGENDA-PLAN-INVALID" });
      }
      observations.push(observation);
    }
    var latestByTopicId = latestReviewTimes(history.events);
    var acceptedById = Object.create(null);
    agenda.accepted.forEach(function (topic) { acceptedById[topic.topicId] = topic; });
    var refusalById = Object.create(null);
    agenda.refusals.forEach(function (row) { if (row.topicId) refusalById[row.topicId] = row; });
    var mandatory = [];
    var cadenceDue = [];
    var classifications = [];
    var selected = [];
    var refusals = cloneAgenda(agenda.refusals);
    for (var topicIndex = 0; topicIndex < registry.topics.length; topicIndex += 1) {
      var rawTopic = registry.topics[topicIndex];
      var topic = acceptedById[rawTopic.topicId];
      if (!topic) {
        classifications.push({
          topicId: isNonEmptyString(rawTopic.topicId) ? rawTopic.topicId : "invalid-topic-" + topicIndex,
          lifecycleState: isNonEmptyString(rawTopic.lifecycleState) ? rawTopic.lifecycleState : null,
          mode: rawTopic.reviewPolicy && rawTopic.reviewPolicy.mode ? rawTopic.reviewPolicy.mode : null,
          status: "refused",
          reason: refusalById[rawTopic.topicId] ? refusalById[rawTopic.topicId].code : "RLAGENDA-PLAN-INVALID",
          triggerId: null,
          lastReviewAt: null,
          sectionIds: [],
          registryIndex: topicIndex
        });
        continue;
      }
      var definition = committedEvidence.definitionsByTopicId[topic.topicId];
      var definitionResult = validateTopicDefinition(definition, topic);
      if (!definitionResult.ok) {
        classifications.push({ topicId: topic.topicId, lifecycleState: topic.lifecycleState, mode: topic.reviewPolicy.mode, status: "refused", reason: definitionResult.code, triggerId: null, lastReviewAt: latestByTopicId[topic.topicId] || null, sectionIds: [], registryIndex: topicIndex });
        refusals.push(refusal(definitionResult.code, "topic definition is invalid for planning", definitionResult.field || null, topic.topicId));
        continue;
      }
      var classification = {
        topicId: topic.topicId,
        lifecycleState: topic.lifecycleState,
        mode: topic.reviewPolicy.mode,
        status: null,
        reason: null,
        triggerId: null,
        lastReviewAt: latestByTopicId[topic.topicId] || null,
        sectionIds: definitionResult.sectionIds.slice(),
        registryIndex: topicIndex
      };
      classifications.push(classification);
      if (topic.lifecycleState !== "active") {
        classification.status = topic.lifecycleState;
        classification.reason = "lifecycle-" + topic.lifecycleState;
        continue;
      }
      if (topic.reviewPolicy.mode === "every-generation") {
        classification.status = "selected";
        classification.reason = "mode-required";
        mandatory.push(classification);
        continue;
      }
      if (classification.lastReviewAt === null) {
        classification.reason = "first-review";
        cadenceDue.push(classification);
        continue;
      }
      var fired = matchingTrigger(definition, observations, topic.topicId, classification.lastReviewAt, cutoffMs);
      if (fired) {
        classification.reason = "trigger-fired";
        classification.triggerId = fired.triggerId;
        cadenceDue.push(classification);
        continue;
      }
      var elapsedMs = cutoffMs - Date.parse(classification.lastReviewAt);
      if (elapsedMs >= topic.reviewPolicy.cadenceDays * 86400000) {
        classification.reason = "cadence-elapsed";
        cadenceDue.push(classification);
      } else {
        classification.status = "not-due";
        classification.reason = "cadence-not-elapsed";
      }
    }
    cadenceDue.sort(function (left, right) {
      var leftTriggered = left.triggerId === null ? 1 : 0;
      var rightTriggered = right.triggerId === null ? 1 : 0;
      if (leftTriggered !== rightTriggered) return leftTriggered - rightTriggered;
      var leftTime = left.lastReviewAt === null ? -Infinity : Date.parse(left.lastReviewAt);
      var rightTime = right.lastReviewAt === null ? -Infinity : Date.parse(right.lastReviewAt);
      if (leftTime !== rightTime) return leftTime - rightTime;
      if (left.registryIndex !== right.registryIndex) return left.registryIndex - right.registryIndex;
      return left.topicId.localeCompare(right.topicId);
    });
    mandatory.forEach(function (classification) { selected.push(classification); });
    for (var cadenceIndex = 0; cadenceIndex < cadenceDue.length; cadenceIndex += 1) {
      var cadenceClassification = cadenceDue[cadenceIndex];
      if (cadenceIndex < registry.reviewPolicy.cadenceTopicReviewBudget) {
        cadenceClassification.status = "selected";
        selected.push(cadenceClassification);
      } else {
        cadenceClassification.status = "deferred";
        cadenceClassification.reason = "cadence-budget";
      }
    }
    var accounted = classifications.length;
    return freezeAgenda({
      contractVersion: PLAN_VERSION,
      ok: true,
      status: refusals.length === 0 ? "available" : "partial",
      generationCutoff: generationCutoff,
      declaredTopicCount: registry.topics.length,
      accountedTopicCount: accounted,
      selectedEveryGenerationCount: mandatory.length,
      dueCadenceCount: cadenceDue.length,
      selectedCadenceCount: selected.filter(function (row) { return row.mode === "cadence"; }).length,
      selected: selected.map(function (row) { return { topicId: row.topicId, mode: row.mode, reason: row.reason, triggerId: row.triggerId, sectionIds: row.sectionIds.slice() }; }),
      classifications: cloneAgenda(classifications),
      refusals: refusals
    });
  }

  function validateAgendaPolicy(policy) {
    var shape = exactShape(policy, REVIEW_POLICY_FIELDS, REVIEW_POLICY_FIELDS);
    if (shape) return refusal(shape.code, "review policy has an invalid shape", shape.field, null);
    if (!isPositiveInteger(policy.maxActiveEveryGenerationTopics) ||
        !isPositiveInteger(policy.cadenceTopicReviewBudget) ||
        !isPositiveInteger(policy.maxConcurrentTopicAcquisitions)) {
      return refusal("RLAGENDA-CAPACITY-INVALID", "every capacity must be a positive integer", null, null);
    }
    if (!Array.isArray(policy.cadenceSelectionOrder) || policy.cadenceSelectionOrder.join("|") !== CADENCE_ORDER.join("|")) {
      return refusal("RLAGENDA-CAPACITY-INVALID", "cadence selection order must be explicit and exact", "cadenceSelectionOrder", null);
    }
    shape = exactShape(policy.researchAuthoring, AUTHORING_FIELDS, AUTHORING_FIELDS);
    if (shape) return refusal(shape.code, "research authoring policy has an invalid shape", shape.field, null);
    for (var index = 0; index < AUTHORING_FIELDS.length; index += 1) {
      if (!isPositiveInteger(policy.researchAuthoring[AUTHORING_FIELDS[index]])) {
        return refusal("RLAGENDA-CAPACITY-INVALID", "every research authoring limit must be a positive integer", AUTHORING_FIELDS[index], null);
      }
    }
    return null;
  }

  function resolveAgendaPolicy(policy) {
    var policyFailure = validateAgendaPolicy(policy);
    if (policyFailure) {
      return freezeAgenda({ ok: false, code: policyFailure.code, field: policyFailure.field });
    }
    var value = isDeepFrozenAgenda(policy) ? policy : freezeAgenda(cloneAgenda(policy));
    return freezeAgenda({ ok: true, value: value, digest: agendaDigest(value) });
  }

  function validateBoundary(boundary, topicId) {
    var shape = exactShape(boundary, BOUNDARY_FIELDS, ["publicOnly"]);
    if (shape) return refusal(shape.code, "scope boundary has an invalid shape", shape.field, topicId);
    if (boundary.publicOnly !== true) return refusal("RLAGENDA-BOUNDARY-INVALID", "topic boundary must be public only", "publicOnly", topicId);
    var listFields = ["geographies", "channels", "horizons"];
    for (var index = 0; index < listFields.length; index += 1) {
      if (hasOwn(boundary, listFields[index]) && !isStringList(boundary[listFields[index]], false)) {
        return refusal("RLAGENDA-BOUNDARY-INVALID", "boundary lists must contain explicit values", listFields[index], topicId);
      }
    }
    return null;
  }

  function validateReviewPolicy(policy, topicId) {
    if (!isPlainObject(policy) || !hasOwn(policy, "mode")) {
      return refusal("RLAGENDA-MODE-MISSING", "topic review mode is required", "reviewPolicy.mode", topicId);
    }
    if (!includesValue(REVIEW_MODES, policy.mode)) {
      return refusal("RLAGENDA-MODE-UNKNOWN", "topic review mode is not recognized", "reviewPolicy.mode", topicId);
    }
    var fields = policy.mode === "every-generation" ? ["mode", "freshnessWindowHours"] : ["mode", "cadenceDays", "freshnessWindowDays"];
    var shape = exactShape(policy, fields, fields);
    if (shape) return refusal("RLAGENDA-MODE-SHAPE", "topic review policy does not match its mode", shape.field, topicId);
    if (policy.mode === "every-generation" && !isPositiveInteger(policy.freshnessWindowHours)) {
      return refusal("RLAGENDA-FRESHNESS-INVALID", "every-generation freshness must be a positive number of hours", "freshnessWindowHours", topicId);
    }
    if (policy.mode === "cadence" && !isPositiveInteger(policy.cadenceDays)) {
      return refusal("RLAGENDA-CADENCE-INVALID", "cadence days must be a positive integer", "cadenceDays", topicId);
    }
    if (policy.mode === "cadence" && !isPositiveInteger(policy.freshnessWindowDays)) {
      return refusal("RLAGENDA-FRESHNESS-INVALID", "cadence freshness must be a positive number of days", "freshnessWindowDays", topicId);
    }
    return null;
  }

  function validateTopicRow(topic, seen) {
    var shape = exactShape(topic, TOPIC_FIELDS, TOPIC_FIELDS);
    var topicId = isPlainObject(topic) && isNonEmptyString(topic.topicId) ? topic.topicId : null;
    if (shape) return refusal(shape.code, "topic has an invalid shape", shape.field, topicId);
    if (!ID_PATTERN.test(topic.topicId)) return refusal("RLAGENDA-ID-INVALID", "topic id must be stable kebab case", "topicId", topicId);
    if (seen[topic.topicId]) return refusal("RLAGENDA-ID-DUPLICATE", "topic id is declared more than once", "topicId", topicId);
    seen[topic.topicId] = true;
    if (!isNonEmptyString(topic.title) || !isNonEmptyString(topic.declaredQuestion)) {
      return refusal("RLAGENDA-QUESTION-INVALID", "topic title and declared question are required", "declaredQuestion", topicId);
    }
    var boundaryFailure = validateBoundary(topic.scopeBoundary, topicId);
    if (boundaryFailure) return boundaryFailure;
    if (!includesValue(LIFECYCLE_STATES, topic.lifecycleState)) {
      return refusal("RLAGENDA-LIFECYCLE-INVALID", "topic lifecycle state is not recognized", "lifecycleState", topicId);
    }
    var policyFailure = validateReviewPolicy(topic.reviewPolicy, topicId);
    if (policyFailure) return policyFailure;
    var expectedRef = "research/agenda/topics/" + topic.topicId + ".definition.json";
    if (topic.definitionRef !== expectedRef) {
      return refusal("RLAGENDA-CONTRACT-SHAPE", "definition reference must match the topic id", "definitionRef", topicId);
    }
    return null;
  }

  function validateAgenda(value) {
    var shape = exactShape(value, AGENDA_FIELDS, AGENDA_FIELDS);
    var declaredCount = isPlainObject(value) && Array.isArray(value.topics) ? value.topics.length : 0;
    if (shape) return agendaResult("invalid", declaredCount, [], [refusal(shape.code, "agenda has an invalid shape", shape.field, null)]);
    if (value.contractVersion !== AGENDA_VERSION) {
      return agendaResult("invalid", declaredCount, [], [refusal("RLAGENDA-CONTRACT-SHAPE", "agenda contract version is unsupported", "contractVersion", null)]);
    }
    var policyFailure = validateAgendaPolicy(value.reviewPolicy);
    if (policyFailure) return agendaResult("invalid", declaredCount, [], [policyFailure]);
    if (!Array.isArray(value.topics) || value.topics.length === 0) {
      return agendaResult("invalid", declaredCount, [], [refusal("RLAGENDA-CONTRACT-SHAPE", "agenda topics must be a non-empty array", "topics", null)]);
    }
    var seen = Object.create(null);
    var accepted = [];
    var refusals = [];
    var mandatoryCount = 0;
    for (var index = 0; index < value.topics.length; index += 1) {
      var topic = value.topics[index];
      var topicFailure = validateTopicRow(topic, seen);
      if (topicFailure) refusals.push(topicFailure);
      else {
        accepted.push(topic);
        if (topic.lifecycleState === "active" && topic.reviewPolicy.mode === "every-generation") mandatoryCount += 1;
      }
    }
    if (mandatoryCount > value.reviewPolicy.maxActiveEveryGenerationTopics) {
      return agendaResult("invalid", declaredCount, [], [refusal(
        "RLAGENDA-CAPACITY-EVERY-GENERATION",
        "active every-generation topic count exceeds the explicit capacity",
        "maxActiveEveryGenerationTopics",
        null
      )]);
    }
    if (refusals.length === 0) return agendaResult("available", declaredCount, accepted, refusals);
    return agendaResult(accepted.length > 0 ? "partial" : "invalid", declaredCount, accepted, refusals);
  }

  function readAgendaText(text, sourceName) {
    if (text === null || typeof text === "undefined") {
      return agendaResult("absent", 0, [], [refusal("RLAGENDA-CONTRACT-ABSENT", "agenda registry is absent", sourceName || null, null)]);
    }
    if (typeof text !== "string" || text.length === 0) {
      return agendaResult("unreadable", 0, [], [refusal("RLAGENDA-CONTRACT-UNREADABLE", "agenda registry is unreadable", sourceName || null, null)]);
    }
    try {
      return validateAgenda(JSON.parse(text));
    } catch (error) {
      return agendaResult("unreadable", 0, [], [refusal("RLAGENDA-CONTRACT-UNREADABLE", "agenda registry is not valid JSON", sourceName || null, null)]);
    }
  }

  function validateWeightMap(value, labels) {
    var shape = exactShape(value, labels, labels);
    if (shape) return shape;
    for (var index = 0; index < labels.length; index += 1) {
      var weight = value[labels[index]];
      if (!isFiniteNumber(weight) || weight < 0 || weight > 1) return { code: "RLAGENDA-EVIDENCE-VOCABULARY", field: labels[index] };
    }
    return null;
  }

  function validateEvidencePolicy(policy) {
    var shape = exactShape(policy, EVIDENCE_POLICY_FIELDS, EVIDENCE_POLICY_FIELDS);
    if (shape || policy.contractVersion !== EVIDENCE_POLICY_VERSION) return { ok: false, code: shape ? shape.code : "RLAGENDA-EVIDENCE-SHAPE", field: shape ? shape.field : "contractVersion" };
    var checks = [
      [policy.confidenceWeights, CONFIDENCE_GRADES],
      [policy.provenanceWeights, PROVENANCE_CLASSES],
      [policy.roleWeights, EVIDENCE_ROLES],
      [policy.corroborationWeights, CORROBORATION_STATES],
      [policy.freshnessWeights, FRESHNESS_STATES],
      [policy.impactCaps, EVIDENCE_ROLES]
    ];
    for (var index = 0; index < checks.length; index += 1) {
      var mapFailure = validateWeightMap(checks[index][0], checks[index][1]);
      if (mapFailure) return { ok: false, code: mapFailure.code, field: mapFailure.field };
    }
    return { ok: true };
  }

  function containsPrivateField(value) {
    if (Array.isArray(value)) {
      for (var arrayIndex = 0; arrayIndex < value.length; arrayIndex += 1) if (containsPrivateField(value[arrayIndex])) return true;
      return false;
    }
    if (!isPlainObject(value)) return false;
    var keys = Object.keys(value);
    for (var index = 0; index < keys.length; index += 1) {
      if (PRIVATE_FIELD_PATTERN.test(keys[index]) || containsPrivateField(value[keys[index]])) return true;
    }
    return false;
  }

  function validateEvidenceRecord(record, policy) {
    var policyResult = validateEvidencePolicy(policy);
    if (!policyResult.ok) return policyResult;
    var shape = exactShape(record, EVIDENCE_FIELDS, EVIDENCE_REQUIRED_FIELDS);
    if (shape || record.contractVersion !== EVIDENCE_VERSION) return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: shape ? shape.field : "contractVersion" };
    if (containsPrivateField(record)) return { ok: false, code: "RLAGENDA-EVIDENCE-PRIVATE", field: null };
    if (!ID_PATTERN.test(record.evidenceId) || !isNonEmptyString(record.claim)) return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: "evidenceId" };
    var observedAt = Date.parse(record.observedAt);
    var availableAt = Date.parse(record.availableAt);
    if (!isFinite(observedAt) || !isFinite(availableAt) || availableAt < observedAt) return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: "availableAt" };
    shape = exactShape(record.source, SOURCE_FIELDS, SOURCE_FIELDS);
    if (shape || !ID_PATTERN.test(record.source.sourceId) || !HASH_PATTERN.test(record.source.contentSha256)) return { ok: false, code: "RLAGENDA-SOURCE-INVALID", field: shape ? shape.field : "source" };
    try {
      var sourceUrl = new URL(record.source.canonicalUrl);
      if (sourceUrl.protocol !== "https:") return { ok: false, code: "RLAGENDA-SOURCE-INVALID", field: "canonicalUrl" };
    } catch (error) {
      return { ok: false, code: "RLAGENDA-SOURCE-INVALID", field: "canonicalUrl" };
    }
    shape = exactShape(record.confidence, CONFIDENCE_FIELDS, CONFIDENCE_FIELDS);
    if (shape) return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: shape.field };
    shape = exactShape(record.corroboration, CORROBORATION_FIELDS, CORROBORATION_FIELDS);
    if (shape) return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: shape.field };
    shape = exactShape(record.conflicts, CONFLICT_FIELDS, CONFLICT_FIELDS);
    if (shape) return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: shape.field };
    shape = exactShape(record.freshness, FRESHNESS_FIELDS, FRESHNESS_FIELDS);
    if (shape) return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: shape.field };
    if (!includesValue(PROVENANCE_CLASSES, record.provenanceClass) ||
        !includesValue(EVIDENCE_ROLES, record.evidenceRole) ||
        !includesValue(CONFIDENCE_GRADES, record.confidence.grade) ||
        !includesValue(CORROBORATION_STATES, record.corroboration.state) ||
        !includesValue(FRESHNESS_STATES, record.freshness.state)) {
      return { ok: false, code: "RLAGENDA-EVIDENCE-VOCABULARY", field: null };
    }
    if (!isStringList(record.actorIds, true) || !isStringList(record.channelIds, true) ||
        !isStringList(record.claimIds, true) || !isStringList(record.causalPath, true) ||
        !isStringList(record.refutedBy, true) || !isStringList(record.corroboration.supportingEvidenceIds, true) ||
        !isStringList(record.conflicts.evidenceIds, true) || !isPositiveInteger(record.corroboration.independentOriginCount)) {
      return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: "evidence lists" };
    }
    if (record.evidenceRole === "indirect" && (record.causalPath.length < 2 || record.refutedBy.length === 0 ||
        record.actorIds.length + record.channelIds.length + record.claimIds.length === 0)) {
      return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: "causalPath" };
    }
    if (hasOwn(record, "firedRefuters")) {
      if (!isStringList(record.firedRefuters, false) || record.firedRefuters.some(function (refuter) { return record.refutedBy.indexOf(refuter) === -1; })) {
        return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: "firedRefuters" };
      }
    }
    if (record.evidenceRole === "model-inference") {
      if (!includesValue(MODEL_FUNCTION_IDS, record.modelFunctionId) ||
          !isStringList(record.inputEvidenceIds, false) || record.inputEvidenceIds.indexOf(record.evidenceId) !== -1 ||
          !isNonEmptyString(record.generatedOutputField)) {
        return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: "modelFunctionId" };
      }
    } else if (hasOwn(record, "modelFunctionId") || hasOwn(record, "inputEvidenceIds") || hasOwn(record, "generatedOutputField")) {
      return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: "modelFunctionId" };
    }
    if (!Array.isArray(record.modelImpacts) || record.modelImpacts.length === 0) return { ok: false, code: "RLAGENDA-EVIDENCE-IMPACT", field: "modelImpacts" };
    for (var impactIndex = 0; impactIndex < record.modelImpacts.length; impactIndex += 1) {
      var impact = record.modelImpacts[impactIndex];
      shape = exactShape(impact, IMPACT_FIELDS, IMPACT_FIELDS);
      if (shape || !includesValue(EVIDENCE_DIRECTIONS, impact.direction) || !isFiniteNumber(impact.rawMagnitude) || impact.rawMagnitude < 0) {
        return { ok: false, code: "RLAGENDA-EVIDENCE-IMPACT", field: shape ? shape.field : "rawMagnitude" };
      }
    }
    return { ok: true };
  }

  function roundNumber(value) {
    return Math.round(value * 1000000000000) / 1000000000000;
  }

  function computeEvidenceWeight(record, policy, generationCutoff) {
    var validation = validateEvidenceRecord(record, policy);
    if (!validation.ok) return validation;
    var cutoff = Date.parse(generationCutoff);
    if (!isFinite(cutoff)) return { ok: false, code: "RLAGENDA-EVIDENCE-SHAPE", field: "generationCutoff" };
    var factors = {
      confidence: policy.confidenceWeights[record.confidence.grade],
      provenance: policy.provenanceWeights[record.provenanceClass],
      role: policy.roleWeights[record.evidenceRole],
      corroboration: policy.corroborationWeights[record.corroboration.state],
      freshness: policy.freshnessWeights[record.freshness.state],
      refuter: hasOwn(record, "firedRefuters") && record.firedRefuters.length > 0 ? 0 : 1
    };
    if (Date.parse(record.availableAt) > cutoff) factors.freshness = 0;
    var weight = roundNumber(factors.confidence * factors.provenance * factors.role * factors.corroboration * factors.freshness * factors.refuter);
    var impact = record.modelImpacts[0];
    var sign = impact.direction === "decrease" ? -1 : 1;
    var boundedImpact = roundNumber(sign * Math.min(Math.abs(impact.rawMagnitude * weight), policy.impactCaps[record.evidenceRole]));
    return {
      ok: true,
      weight: weight,
      boundedImpact: boundedImpact,
      factors: Object.freeze(factors),
      impactCap: policy.impactCaps[record.evidenceRole],
      excluded: weight === 0,
      exclusionReason: factors.refuter === 0 ? "fired-refuter" : (factors.freshness === 0 ? "freshness" : (weight === 0 ? "quality-factor" : null)),
      firedRefuters: hasOwn(record, "firedRefuters") ? record.firedRefuters.slice() : [],
      conflicts: cloneAgenda(record.conflicts)
    };
  }

  function validateSectionList(sections) {
    if (!Array.isArray(sections) || sections.length === 0) return false;
    var seen = Object.create(null);
    for (var index = 0; index < sections.length; index += 1) {
      var shape = exactShape(sections[index], SECTION_FIELDS, SECTION_FIELDS);
      if (shape || !ID_PATTERN.test(sections[index].sectionId) || seen[sections[index].sectionId] ||
          !isNonEmptyString(sections[index].title) || !includesValue(SECTION_KINDS, sections[index].kind) ||
          sections[index].required !== true) return false;
      seen[sections[index].sectionId] = true;
    }
    return true;
  }

  function validateDefinitionList(value, fields, idField, kinds) {
    if (!Array.isArray(value)) return false;
    var seen = Object.create(null);
    for (var index = 0; index < value.length; index += 1) {
      var shape = exactShape(value[index], fields, fields);
      if (shape || !ID_PATTERN.test(value[index][idField]) || seen[value[index][idField]]) return false;
      if (kinds && !includesValue(kinds, value[index].kind)) return false;
      seen[value[index][idField]] = true;
    }
    return true;
  }

  function validateTopicDefinition(definition, registryTopic) {
    var shape = exactShape(definition, DEFINITION_FIELDS, DEFINITION_REQUIRED_FIELDS);
    if (shape || definition.contractVersion !== TOPIC_VERSION) return { ok: false, code: shape ? shape.code : "RLAGENDA-CONTRACT-SHAPE", field: shape ? shape.field : "contractVersion" };
    if (!ID_PATTERN.test(definition.topicId) || !VERSION_PATTERN.test(definition.definitionVersion) || !HASH_PATTERN.test(definition.declaredQuestionSha256)) {
      return { ok: false, code: "RLAGENDA-ID-INVALID", field: "topicId" };
    }
    if (registryTopic) {
      if (definition.topicId !== registryTopic.topicId) return { ok: false, code: "RLAGENDA-ID-INVALID", field: "topicId" };
      if (definition.declaredQuestionSha256 !== sha256Text(registryTopic.declaredQuestion)) return { ok: false, code: "RLAGENDA-QUESTION-DIGEST", field: "declaredQuestionSha256" };
    }
    if (!validateSectionList(definition.analyticalSections)) return { ok: false, code: "RLAGENDA-SECTION-INVALID", field: "analyticalSections" };
    var policyResult = validateEvidencePolicy(definition.evidencePolicy);
    if (!policyResult.ok) return policyResult;
    if (!validateDefinitionList(definition.sourceRequirements, SOURCE_REQUIREMENT_FIELDS, "requirementId", null)) return { ok: false, code: "RLAGENDA-SOURCE-INVALID", field: "sourceRequirements" };
    if (!validateDefinitionList(definition.triggers, TRIGGER_FIELDS, "triggerId", TRIGGER_KINDS)) return { ok: false, code: "RLAGENDA-MODEL-INVALID", field: "triggers" };
    if (!validateDefinitionList(definition.invalidations, INVALIDATION_FIELDS, "invalidationId", TRIGGER_KINDS)) return { ok: false, code: "RLAGENDA-MODEL-INVALID", field: "invalidations" };
    if (!validateDefinitionList(definition.chartDefinitions, CHART_FIELDS, "chartId", CHART_KINDS)) return { ok: false, code: "RLAGENDA-MODEL-INVALID", field: "chartDefinitions" };
    if (!isStringList(definition.modelFunctionIds, true)) return { ok: false, code: "RLAGENDA-MODEL-INVALID", field: "modelFunctionIds" };
    for (var functionIndex = 0; functionIndex < definition.modelFunctionIds.length; functionIndex += 1) {
      if (!includesValue(MODEL_FUNCTION_IDS, definition.modelFunctionIds[functionIndex])) return { ok: false, code: "RLAGENDA-MODEL-INVALID", field: "modelFunctionIds" };
    }
    if (definition.modelFunctionIds.indexOf("updateEscalationProbabilities") !== -1 && !isPlainObject(definition.scenarioTree)) return { ok: false, code: "RLAGENDA-MODEL-INVALID", field: "scenarioTree" };
    if (definition.modelFunctionIds.indexOf("computeFlowState") !== -1 && !isPlainObject(definition.flowNetwork)) return { ok: false, code: "RLAGENDA-FLOW-INVALID", field: "flowNetwork" };
    if (definition.modelFunctionIds.indexOf("computeCommodityShockRanges") !== -1 && !Array.isArray(definition.transmissionModels)) return { ok: false, code: "RLAGENDA-MODEL-INVALID", field: "transmissionModels" };
    if (definition.modelFunctionIds.indexOf("computeEquityProxyRanges") !== -1 && !Array.isArray(definition.proxyDefinitions)) return { ok: false, code: "RLAGENDA-MODEL-INVALID", field: "proxyDefinitions" };
    if (containsPrivateField(definition)) return { ok: false, code: "RLAGENDA-EVIDENCE-PRIVATE", field: null };
    return { ok: true, topicId: definition.topicId, sectionIds: definition.analyticalSections.map(function (section) { return section.sectionId; }) };
  }

  function validateCalibration(calibration, definition) {
    var shape = exactShape(calibration, CALIBRATION_FIELDS, CALIBRATION_FIELDS);
    if (shape || calibration.contractVersion !== CALIBRATION_VERSION || !ID_PATTERN.test(calibration.topicId) ||
        !VERSION_PATTERN.test(calibration.calibrationVersion) || !Array.isArray(calibration.events) || calibration.events.length === 0) {
      return { ok: false, code: "RLAGENDA-CALIBRATION-INVALID", field: shape ? shape.field : "calibration" };
    }
    if (definition && calibration.topicId !== definition.topicId) return { ok: false, code: "RLAGENDA-CALIBRATION-INVALID", field: "topicId" };
    var seen = Object.create(null);
    for (var index = 0; index < calibration.events.length; index += 1) {
      var event = calibration.events[index];
      shape = exactShape(event, CALIBRATION_EVENT_FIELDS, CALIBRATION_EVENT_FIELDS);
      if (shape || !ID_PATTERN.test(event.eventId) || seen[event.eventId] || !VERSION_PATTERN.test(event.eventVersion) ||
          !isFinite(Date.parse(event.eventTime)) || !isFinite(Date.parse(event.cutoffTime)) || Date.parse(event.cutoffTime) < Date.parse(event.eventTime) ||
          !isStringList(event.sourceRefs, false) || !isStringList(event.affectedChannelIds, false) ||
          !isPlainObject(event.preWindow) || !isPlainObject(event.postWindow) || !validateBarFileRefs(event.barFiles) ||
          !isPlainObject(event.proxyReturns) || !isPlainObject(event.maximumAdverseExcursion) ||
          !isPlainObject(event.maximumFavorableExcursion) || !isStringList(event.confounds, true) || !isStringList(event.limitations, false)) {
        return { ok: false, code: "RLAGENDA-CALIBRATION-INVALID", field: shape ? shape.field : "events" };
      }
      seen[event.eventId] = true;
    }
    return { ok: true, eventCount: calibration.events.length };
  }

  function validateBarFileRefs(value) {
    if (!Array.isArray(value) || value.length === 0) return false;
    var seen = Object.create(null);
    for (var index = 0; index < value.length; index += 1) {
      var shape = exactShape(value[index], ["path", "sha256"], ["path", "sha256"]);
      if (shape || !isNonEmptyString(value[index].path) || !HASH_PATTERN.test(value[index].sha256) || seen[value[index].path]) return false;
      seen[value[index].path] = true;
    }
    return true;
  }

  function modelInputRefusal(code, field) {
    return freezeAgenda({ ok: false, code: code, field: field || null });
  }

  function prefixedShape(value, allowedFields, requiredFields, prefix) {
    var shape = exactShape(value, allowedFields, requiredFields);
    if (!shape) return null;
    return modelInputRefusal(shape.code, shape.field === null ? prefix : prefix + "." + shape.field);
  }

  function exactKeyMap(value, requiredKeys, prefix) {
    if (!isPlainObject(value)) return modelInputRefusal("RLAGENDA-CONTRACT-SHAPE", prefix);
    var keys = Object.keys(value);
    for (var keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
      if (requiredKeys.indexOf(keys[keyIndex]) === -1) return modelInputRefusal("RLAGENDA-CONTRACT-UNKNOWN-MEMBER", prefix + "." + keys[keyIndex]);
    }
    for (var requiredIndex = 0; requiredIndex < requiredKeys.length; requiredIndex += 1) {
      if (!hasOwn(value, requiredKeys[requiredIndex])) return modelInputRefusal("RLAGENDA-CONTRACT-MISSING-MEMBER", prefix + "." + requiredKeys[requiredIndex]);
    }
    return null;
  }

  function validateExactInterval(value, prefix, lowLimit, highLimit) {
    var shape = prefixedShape(value, INTERVAL_FIELDS, INTERVAL_FIELDS, prefix);
    if (shape) return shape;
    if (!validateInterval(value) || value.low < lowLimit || value.high > highLimit) return modelInputRefusal("RLAGENDA-MODEL-INVALID", prefix);
    return null;
  }

  function uniqueDefinitionValues(rows, field) {
    return rows.map(function (row) { return row[field]; }).filter(function (value, index, values) {
      return isNonEmptyString(value) && values.indexOf(value) === index;
    });
  }

  function requiredModelEdgeIds(definition) {
    var edges = [];
    definition.flowNetwork.flows.forEach(function (flow) {
      if (Array.isArray(flow.routeEdges)) edges = edges.concat(flow.routeEdges);
    });
    return edges.filter(function (edgeId, index) { return isNonEmptyString(edgeId) && edges.indexOf(edgeId) === index; });
  }

  function requiredModelBarIds(definition) {
    var barIds = uniqueDefinitionValues(definition.transmissionModels, "barId")
      .concat(uniqueDefinitionValues(definition.proxyDefinitions, "ticker"));
    return barIds.filter(function (barId, index) { return barIds.indexOf(barId) === index; });
  }

  function validateModelCalibrationEvent(event, eventIndex, definition, requiredBarIds, requiredChannelIds, scenarioIds, generationCutoff) {
    var prefix = "calibrationEvents." + eventIndex;
    var shape = prefixedShape(event, CALIBRATION_EVENT_FIELDS, CALIBRATION_EVENT_FIELDS, prefix);
    if (shape) return shape;
    if (!ID_PATTERN.test(event.eventId) || !VERSION_PATTERN.test(event.eventVersion) || !isFinite(Date.parse(event.eventTime)) ||
        !isFinite(Date.parse(event.cutoffTime)) || Date.parse(event.cutoffTime) < Date.parse(event.eventTime) ||
        Date.parse(event.cutoffTime) > Date.parse(generationCutoff) || !isStringList(event.sourceRefs, false) ||
        scenarioIds.indexOf(event.scenarioId) === -1 || !isStringList(event.affectedChannelIds, false) ||
        event.affectedChannelIds.some(function (channelId) { return requiredChannelIds.indexOf(channelId) === -1; }) ||
        !isStringList(event.confounds, true) || !isStringList(event.limitations, false)) {
      return modelInputRefusal("RLAGENDA-CALIBRATION-INVALID", prefix);
    }
    var windowFields = ["preWindow", "postWindow"];
    for (var windowIndex = 0; windowIndex < windowFields.length; windowIndex += 1) {
      var windowField = windowFields[windowIndex];
      shape = prefixedShape(event[windowField], ["start", "end"], ["start", "end"], prefix + "." + windowField);
      if (shape) return shape;
      if (!isFinite(Date.parse(event[windowField].start)) || !isFinite(Date.parse(event[windowField].end)) || Date.parse(event[windowField].start) > Date.parse(event[windowField].end)) {
        return modelInputRefusal("RLAGENDA-CALIBRATION-INVALID", prefix + "." + windowField);
      }
    }
    if (!Array.isArray(event.barFiles) || event.barFiles.length !== requiredBarIds.length) return modelInputRefusal("RLAGENDA-CALIBRATION-INVALID", prefix + ".barFiles");
    var observedBarIds = [];
    for (var barIndex = 0; barIndex < event.barFiles.length; barIndex += 1) {
      shape = prefixedShape(event.barFiles[barIndex], ["path", "sha256"], ["path", "sha256"], prefix + ".barFiles." + barIndex);
      if (shape) return shape;
      var match = /^data\/bars\/([A-Z0-9.-]+)\.json$/.exec(event.barFiles[barIndex].path);
      if (!match || requiredBarIds.indexOf(match[1]) === -1 || observedBarIds.indexOf(match[1]) !== -1 || !HASH_PATTERN.test(event.barFiles[barIndex].sha256)) {
        return modelInputRefusal("RLAGENDA-CALIBRATION-INVALID", prefix + ".barFiles." + barIndex);
      }
      observedBarIds.push(match[1]);
    }
    if (requiredBarIds.some(function (barId) { return observedBarIds.indexOf(barId) === -1; }) || requiredBarIds.indexOf(event.benchmark) === -1) {
      return modelInputRefusal("RLAGENDA-CALIBRATION-INVALID", prefix + ".barFiles");
    }
    var mapFields = ["proxyReturns", "maximumAdverseExcursion", "maximumFavorableExcursion"];
    for (var mapIndex = 0; mapIndex < mapFields.length; mapIndex += 1) {
      var mapField = mapFields[mapIndex];
      shape = exactKeyMap(event[mapField], requiredBarIds, prefix + "." + mapField);
      if (shape) return shape;
      if (requiredBarIds.some(function (barId) { return !isFiniteNumber(event[mapField][barId]); })) return modelInputRefusal("RLAGENDA-CALIBRATION-INVALID", prefix + "." + mapField);
    }
    return null;
  }

  function validateResearchModelInput(input, definition, generationCutoff) {
    var shape = prefixedShape(input, MODEL_INPUT_FIELDS, MODEL_INPUT_FIELDS, "publishedInputs");
    if (shape) {
      if (shape.field && shape.field.indexOf("publishedInputs.") === 0) shape = modelInputRefusal(shape.code, shape.field.slice("publishedInputs.".length));
      return shape;
    }
    if (input.contractVersion !== MODEL_INPUT_VERSION || !isPlainObject(definition) || !isCanonicalInstant(generationCutoff) ||
        !isPlainObject(definition.flowNetwork) || !Array.isArray(definition.flowNetwork.flows) ||
        !Array.isArray(definition.transmissionModels) || !Array.isArray(definition.proxyDefinitions) ||
        !isPlainObject(definition.scenarioTree) || !Array.isArray(definition.scenarioTree.nodes) || !isPlainObject(definition.evidencePolicy)) {
      return modelInputRefusal("RLAGENDA-MODEL-INVALID", "contractVersion");
    }

    var edgeIds = requiredModelEdgeIds(definition);
    var channelIds = uniqueDefinitionValues(definition.transmissionModels, "channelId");
    var barIds = requiredModelBarIds(definition);
    var scenarioIds = uniqueDefinitionValues(definition.scenarioTree.nodes, "scenarioId");
    if (edgeIds.length === 0 || channelIds.length !== definition.transmissionModels.length || barIds.length === 0 || scenarioIds.length !== definition.scenarioTree.nodes.length) {
      return modelInputRefusal("RLAGENDA-MODEL-INVALID", "definition");
    }

    shape = exactKeyMap(input.chokepointState, edgeIds, "chokepointState");
    if (shape) return shape;
    for (var edgeIndex = 0; edgeIndex < edgeIds.length; edgeIndex += 1) {
      var edgeId = edgeIds[edgeIndex];
      shape = prefixedShape(input.chokepointState[edgeId], CHOKEPOINT_STATE_FIELDS, CHOKEPOINT_STATE_FIELDS, "chokepointState." + edgeId);
      if (shape) return shape;
      shape = validateExactInterval(input.chokepointState[edgeId].physicalPassFraction, "chokepointState." + edgeId + ".physicalPassFraction", 0, 1) ||
        validateExactInterval(input.chokepointState[edgeId].insuredPassFraction, "chokepointState." + edgeId + ".insuredPassFraction", 0, 1) ||
        validateExactInterval(input.chokepointState[edgeId].delayDays, "chokepointState." + edgeId + ".delayDays", 0, Number.MAX_VALUE);
      if (shape) return shape;
    }

    shape = exactKeyMap(input.inventoryGapByChannel, channelIds, "inventoryGapByChannel");
    if (shape) return shape;
    for (var channelIndex = 0; channelIndex < channelIds.length; channelIndex += 1) {
      shape = validateExactInterval(input.inventoryGapByChannel[channelIds[channelIndex]], "inventoryGapByChannel." + channelIds[channelIndex], 0, 1);
      if (shape) return shape;
    }

    shape = prefixedShape(input.levers, VIEW_LEVER_FIELDS, VIEW_LEVER_FIELDS, "levers");
    if (shape) return shape;
    if (!validateAgendaLeverState(input.levers) || !input.chokepointState.hormuz || !input.chokepointState["bab-el-mandeb"] ||
        input.levers.hormuzPhysicalPassFraction !== input.chokepointState.hormuz.physicalPassFraction.base ||
        input.levers.babElMandebPhysicalPassFraction !== input.chokepointState["bab-el-mandeb"].physicalPassFraction.base) {
      return modelInputRefusal("RLAGENDA-MODEL-INVALID", "levers");
    }

    shape = exactKeyMap(input.currentBars, barIds, "currentBars");
    if (shape) return shape;
    for (var currentBarIndex = 0; currentBarIndex < barIds.length; currentBarIndex += 1) {
      var barId = barIds[currentBarIndex];
      var bar = input.currentBars[barId];
      shape = prefixedShape(bar, CURRENT_BAR_FIELDS, CURRENT_BAR_FIELDS, "currentBars." + barId);
      if (shape) return shape;
      shape = prefixedShape(bar.latest, CURRENT_BAR_ROW_FIELDS, CURRENT_BAR_ROW_FIELDS, "currentBars." + barId + ".latest");
      if (shape) return shape;
      if (bar.sym !== barId || !isCanonicalInstant(bar.asof) || Date.parse(bar.asof) !== bar.latest.t || bar.latest.t > Date.parse(generationCutoff) ||
          CURRENT_BAR_ROW_FIELDS.some(function (field) { return !isFiniteNumber(bar.latest[field]); }) || bar.latest.v < 0 ||
          bar.latest.l > Math.min(bar.latest.o, bar.latest.c) || bar.latest.h < Math.max(bar.latest.o, bar.latest.c) || bar.latest.l > bar.latest.h) {
        return modelInputRefusal("RLAGENDA-MODEL-INVALID", "currentBars." + barId);
      }
    }

    if (!Array.isArray(input.calibrationEvents) || (definition.proxyDefinitions.length > 0 && input.calibrationEvents.length === 0)) {
      return modelInputRefusal("RLAGENDA-CONTRACT-MISSING-MEMBER", "calibrationEvents.0");
    }
    var calibrationIds = Object.create(null);
    for (var calibrationIndex = 0; calibrationIndex < input.calibrationEvents.length; calibrationIndex += 1) {
      var calibrationEvent = input.calibrationEvents[calibrationIndex];
      shape = validateModelCalibrationEvent(calibrationEvent, calibrationIndex, definition, barIds, channelIds, scenarioIds, generationCutoff);
      if (shape) return shape;
      if (calibrationIds[calibrationEvent.eventId]) return modelInputRefusal("RLAGENDA-CALIBRATION-INVALID", "calibrationEvents." + calibrationIndex + ".eventId");
      calibrationIds[calibrationEvent.eventId] = true;
    }

    if (!Array.isArray(input.evidenceImpacts)) return modelInputRefusal("RLAGENDA-CONTRACT-SHAPE", "evidenceImpacts");
    var impactCap = definition.evidencePolicy.impactCaps && definition.evidencePolicy.impactCaps.direct;
    if (!isFiniteNumber(impactCap) || impactCap <= 0) return modelInputRefusal("RLAGENDA-MODEL-INVALID", "definition.evidencePolicy.impactCaps.direct");
    for (var impactIndex = 0; impactIndex < input.evidenceImpacts.length; impactIndex += 1) {
      shape = prefixedShape(input.evidenceImpacts[impactIndex], MODEL_IMPACT_FIELDS, MODEL_IMPACT_FIELDS, "evidenceImpacts." + impactIndex);
      if (shape) return shape;
      if (scenarioIds.indexOf(input.evidenceImpacts[impactIndex].targetId) === -1 || !isFiniteNumber(input.evidenceImpacts[impactIndex].weightedImpact) ||
          Math.abs(input.evidenceImpacts[impactIndex].weightedImpact) > impactCap) {
        return modelInputRefusal("RLAGENDA-EVIDENCE-IMPACT", "evidenceImpacts." + impactIndex);
      }
    }
    return freezeAgenda({ ok: true, value: freezeAgenda(cloneAgenda(input)) });
  }

  function updateEscalationProbabilities(scenarioTree, evidenceImpacts, caps) {
    if (!isPlainObject(scenarioTree) || !Array.isArray(scenarioTree.nodes) || scenarioTree.nodes.length === 0 ||
        !isFiniteNumber(scenarioTree.priorTolerance) || scenarioTree.priorTolerance <= 0 ||
        !Array.isArray(evidenceImpacts) || !isPlainObject(caps) || !isFiniteNumber(caps.maxAbsoluteImpact)) {
      return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    }
    var nodesById = Object.create(null);
    var groups = Object.create(null);
    var index;
    for (index = 0; index < scenarioTree.nodes.length; index += 1) {
      var node = scenarioTree.nodes[index];
      if (!ID_PATTERN.test(node.scenarioId) || nodesById[node.scenarioId] || !isFiniteNumber(node.definitionPrior) || node.definitionPrior <= 0) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
      nodesById[node.scenarioId] = node;
      var parentKey = node.parentId === null ? "__root__" : node.parentId;
      if (!groups[parentKey]) groups[parentKey] = [];
      groups[parentKey].push(node);
    }
    var groupKeys = Object.keys(groups);
    for (index = 0; index < groupKeys.length; index += 1) {
      var priorSum = groups[groupKeys[index]].reduce(function (sum, node) { return sum + node.definitionPrior; }, 0);
      if (Math.abs(priorSum - 1) > scenarioTree.priorTolerance) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    }
    var impactByTarget = Object.create(null);
    for (index = 0; index < evidenceImpacts.length; index += 1) {
      var currentImpact = evidenceImpacts[index];
      if (!nodesById[currentImpact.targetId] || !isFiniteNumber(currentImpact.weightedImpact) || Math.abs(currentImpact.weightedImpact) > caps.maxAbsoluteImpact) return { ok: false, code: "RLAGENDA-EVIDENCE-IMPACT" };
      impactByTarget[currentImpact.targetId] = (impactByTarget[currentImpact.targetId] || 0) + currentImpact.weightedImpact;
    }
    var probabilities = Object.create(null);
    for (index = 0; index < groupKeys.length; index += 1) {
      var siblings = groups[groupKeys[index]];
      var scores = siblings.map(function (node) { return Math.log(node.definitionPrior) + (impactByTarget[node.scenarioId] || 0); });
      var maxScore = Math.max.apply(Math, scores);
      var exponentials = scores.map(function (score) { return Math.exp(score - maxScore); });
      var denominator = exponentials.reduce(function (sum, value) { return sum + value; }, 0);
      for (var siblingIndex = 0; siblingIndex < siblings.length; siblingIndex += 1) {
        probabilities[siblings[siblingIndex].scenarioId] = { conditional: roundNumber(exponentials[siblingIndex] / denominator), unconditional: null };
      }
    }
    var unresolved = scenarioTree.nodes.slice();
    var guard = 0;
    while (unresolved.length > 0 && guard <= scenarioTree.nodes.length) {
      unresolved = unresolved.filter(function (node) {
        if (node.parentId === null) probabilities[node.scenarioId].unconditional = probabilities[node.scenarioId].conditional;
        else if (probabilities[node.parentId] && probabilities[node.parentId].unconditional !== null) {
          probabilities[node.scenarioId].unconditional = roundNumber(probabilities[node.parentId].unconditional * probabilities[node.scenarioId].conditional);
        } else return true;
        return false;
      });
      guard += 1;
    }
    if (unresolved.length > 0) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    return { ok: true, probabilities: probabilities, impactLedger: evidenceImpacts.slice() };
  }

  function validateInterval(value) {
    return isPlainObject(value) && isFiniteNumber(value.low) && isFiniteNumber(value.base) && isFiniteNumber(value.high) && value.low <= value.base && value.base <= value.high;
  }

  function intervalProduct(values) {
    var output = { low: 1, base: 1, high: 1 };
    for (var index = 0; index < values.length; index += 1) {
      output.low *= values[index].low;
      output.base *= values[index].base;
      output.high *= values[index].high;
    }
    return output;
  }

  function addInterval(target, value) {
    target.low += value.low;
    target.base += value.base;
    target.high += value.high;
  }

  function computeFlowState(flowNetwork, chokepointState, scenarioId) {
    if (!isPlainObject(flowNetwork) || !Array.isArray(flowNetwork.flows) || !isPlainObject(chokepointState) || !ID_PATTERN.test(scenarioId)) return { ok: false, code: "RLAGENDA-FLOW-INVALID" };
    var totals = {
      physicallyUnavailable: { low: 0, base: 0, high: 0 },
      delayedDeliverable: { low: 0, base: 0, high: 0 },
      reroutedDelivered: { low: 0, base: 0, high: 0 },
      incrementalTonMiles: { low: 0, base: 0, high: 0 },
      insuredEffectiveThroughput: { low: 0, base: 0, high: 0 },
      unallocated: { low: 0, base: 0, high: 0 }
    };
    var rows = [];
    var seenFlowIds = Object.create(null);
    for (var index = 0; index < flowNetwork.flows.length; index += 1) {
      var flow = flowNetwork.flows[index];
        if (!ID_PATTERN.test(flow.flowId) || seenFlowIds[flow.flowId] || !isFiniteNumber(flow.baselineVolume) || flow.baselineVolume <= 0 ||
          !isStringList(flow.routeEdges, false) || !isStringList(flow.scenarioIds, false) || !isPlainObject(flow.alternateRoute) ||
          !validateInterval(flow.alternateRoute.capacityFraction) || !validateInterval(flow.alternateRoute.distanceMultiplier)) return { ok: false, code: "RLAGENDA-FLOW-INVALID" };
      seenFlowIds[flow.flowId] = true;
      if (flow.scenarioIds.indexOf(scenarioId) === -1) continue;
      var physicalIntervals = [];
      var insuredIntervals = [];
      var delayIntervals = [];
      for (var edgeIndex = 0; edgeIndex < flow.routeEdges.length; edgeIndex += 1) {
        var edgeState = chokepointState[flow.routeEdges[edgeIndex]];
        if (!edgeState || !validateInterval(edgeState.physicalPassFraction) || !validateInterval(edgeState.insuredPassFraction) || !validateInterval(edgeState.delayDays)) return { ok: false, code: "RLAGENDA-FLOW-INVALID" };
        physicalIntervals.push(edgeState.physicalPassFraction);
        insuredIntervals.push(edgeState.insuredPassFraction);
        delayIntervals.push(edgeState.delayDays);
      }
      var deliveredFraction = intervalProduct(physicalIntervals);
      var insuredFraction = intervalProduct(insuredIntervals);
      var rerouteFraction = flow.alternateRoute.capacityFraction;
      var rerouted = {
        low: flow.baselineVolume * Math.min(rerouteFraction.low, 1 - deliveredFraction.high),
        base: flow.baselineVolume * Math.min(rerouteFraction.base, 1 - deliveredFraction.base),
        high: flow.baselineVolume * Math.min(rerouteFraction.high, 1 - deliveredFraction.low)
      };
      var unavailable = {
        low: Math.max(0, flow.baselineVolume * (1 - deliveredFraction.high) - rerouted.high),
        base: Math.max(0, flow.baselineVolume * (1 - deliveredFraction.base) - rerouted.base),
        high: Math.max(0, flow.baselineVolume * (1 - deliveredFraction.low) - rerouted.low)
      };
      var maximumDelay = delayIntervals.reduce(function (output, interval) {
        return { low: Math.max(output.low, interval.low), base: Math.max(output.base, interval.base), high: Math.max(output.high, interval.high) };
      }, { low: 0, base: 0, high: 0 });
      var delayed = {
        low: flow.baselineVolume * deliveredFraction.low * Math.min(maximumDelay.low / 30, 1),
        base: flow.baselineVolume * deliveredFraction.base * Math.min(maximumDelay.base / 30, 1),
        high: flow.baselineVolume * deliveredFraction.high * Math.min(maximumDelay.high / 30, 1)
      };
      var distanceMultiplier = flow.alternateRoute.distanceMultiplier;
      var tonMiles = {
        low: rerouted.low * Math.max(0, distanceMultiplier.low - 1),
        base: rerouted.base * Math.max(0, distanceMultiplier.base - 1),
        high: rerouted.high * Math.max(0, distanceMultiplier.high - 1)
      };
      var insured = {
        low: flow.baselineVolume * deliveredFraction.low * insuredFraction.low,
        base: flow.baselineVolume * deliveredFraction.base * insuredFraction.base,
        high: flow.baselineVolume * deliveredFraction.high * insuredFraction.high
      };
      addInterval(totals.physicallyUnavailable, unavailable);
      addInterval(totals.delayedDeliverable, delayed);
      addInterval(totals.reroutedDelivered, rerouted);
      addInterval(totals.incrementalTonMiles, tonMiles);
      addInterval(totals.insuredEffectiveThroughput, insured);
      rows.push({ flowId: flow.flowId, commodity: flow.commodity, baselineVolume: flow.baselineVolume, unit: flow.unit, physicallyUnavailable: unavailable, delayedDeliverable: delayed, reroutedDelivered: rerouted, incrementalTonMiles: tonMiles, insuredEffectiveThroughput: insured });
    }
    return { ok: true, scenarioId: scenarioId, totals: totals, flows: rows };
  }

  function zeroInterval() {
    return { low: 0, base: 0, high: 0 };
  }

  function scaleInterval(value, scale) {
    if (!validateInterval(value) || !isFiniteNumber(scale) || scale < 0) return null;
    return { low: value.low * scale, base: value.base * scale, high: value.high * scale };
  }

  function multiplyIntervals(left, right) {
    if (!validateInterval(left) || !validateInterval(right)) return null;
    var products = [
      left.low * right.low, left.low * right.high,
      left.high * right.low, left.high * right.high
    ];
    return { low: Math.min.apply(Math, products), base: left.base * right.base, high: Math.max.apply(Math, products) };
  }

  function sumIntervals(values) {
    var output = zeroInterval();
    for (var index = 0; index < values.length; index += 1) {
      if (!validateInterval(values[index])) return null;
      addInterval(output, values[index]);
    }
    return output;
  }

  function probabilityValue(value) {
    if (isFiniteNumber(value)) return value;
    if (isPlainObject(value) && isFiniteNumber(value.unconditional)) return value.unconditional;
    return null;
  }

  function weightedFlowComponents(scenarioProbabilities, flowStates, definition) {
    if (!isPlainObject(flowStates) || !isPlainObject(flowStates.byScenario) || !isPlainObject(flowStates.inventoryGapByChannel)) return null;
    var scenarioIds = Object.keys(scenarioProbabilities);
    if (scenarioIds.length === 0) return null;
    var physicalLossShare = zeroInterval();
    var incrementalTonMileShare = zeroInterval();
    for (var index = 0; index < scenarioIds.length; index += 1) {
      var scenarioId = scenarioIds[index];
      var probability = probabilityValue(scenarioProbabilities[scenarioId]);
      var scenarioFlow = flowStates.byScenario[scenarioId];
      if (!isFiniteNumber(probability) || probability < 0 || probability > 1 || !scenarioFlow || scenarioFlow.ok !== true || !Array.isArray(scenarioFlow.flows)) return null;
      var flowRow = scenarioFlow.flows.find(function (row) { return row.flowId === definition.flowStateId; });
      if (!flowRow) continue;
      if (!isFiniteNumber(flowRow.baselineVolume) || flowRow.baselineVolume <= 0 || !validateInterval(flowRow.physicallyUnavailable) || !validateInterval(flowRow.incrementalTonMiles)) return null;
      var physical = scaleInterval({
        low: flowRow.physicallyUnavailable.low / flowRow.baselineVolume,
        base: flowRow.physicallyUnavailable.base / flowRow.baselineVolume,
        high: flowRow.physicallyUnavailable.high / flowRow.baselineVolume
      }, probability);
      var tonMiles = scaleInterval({
        low: flowRow.incrementalTonMiles.low / flowRow.baselineVolume,
        base: flowRow.incrementalTonMiles.base / flowRow.baselineVolume,
        high: flowRow.incrementalTonMiles.high / flowRow.baselineVolume
      }, probability);
      addInterval(physicalLossShare, physical);
      addInterval(incrementalTonMileShare, tonMiles);
    }
    if (!validateInterval(flowStates.inventoryGapByChannel[definition.channelId])) return null;
    return {
      physicalLossShare: physicalLossShare,
      incrementalTonMileShare: incrementalTonMileShare,
      inventoryGapShare: cloneAgenda(flowStates.inventoryGapByChannel[definition.channelId])
    };
  }

  function computeCommodityShockRanges(scenarioProbabilities, flowStates, transmissionDefinitions, currentBars, levers) {
    if (!isPlainObject(scenarioProbabilities) || !isPlainObject(flowStates) || !Array.isArray(transmissionDefinitions) || !isPlainObject(currentBars) ||
        prefixedShape(levers, COMMODITY_LEVER_FIELDS, COMMODITY_LEVER_FIELDS, "levers") ||
        !isFiniteNumber(levers.inventoryPolicyResponseOffset) || levers.inventoryPolicyResponseOffset < -1 || levers.inventoryPolicyResponseOffset > 1 ||
        !isFiniteNumber(levers.demandOffset) || levers.demandOffset < -1 || levers.demandOffset > 1) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    var channels = [];
    for (var index = 0; index < transmissionDefinitions.length; index += 1) {
      var definition = transmissionDefinitions[index];
      var flow = weightedFlowComponents(scenarioProbabilities, flowStates, definition);
      if (!flow ||
          !validateInterval(definition.physicalSensitivity) || !validateInterval(definition.rerouteSensitivity) || !validateInterval(definition.inventorySensitivity) ||
          !validateInterval(definition.policyResponseOffset) || !validateInterval(definition.demandOffset) || !validateInterval(definition.bounds) || !hasOwn(currentBars, definition.barId)) {
        channels.push({ channelId: definition.channelId, state: "unavailable", reason: "missing-required-component" });
        continue;
      }
      var inventoryPolicyLever = levers.inventoryPolicyResponseOffset;
      var demandLever = levers.demandOffset;
      var components = {
        physical: multiplyIntervals(definition.physicalSensitivity, flow.physicalLossShare),
        reroute: multiplyIntervals(definition.rerouteSensitivity, flow.incrementalTonMileShare),
        inventory: multiplyIntervals(definition.inventorySensitivity, flow.inventoryGapShare),
        policy: {
          low: definition.policyResponseOffset.low + inventoryPolicyLever,
          base: definition.policyResponseOffset.base + inventoryPolicyLever,
          high: definition.policyResponseOffset.high + inventoryPolicyLever
        },
        demand: {
          low: definition.demandOffset.low + demandLever,
          base: definition.demandOffset.base + demandLever,
          high: definition.demandOffset.high + demandLever
        }
      };
      var rawRange = sumIntervals([components.physical, components.reroute, components.inventory, components.policy, components.demand]);
      var range = rawRange && {
        low: roundNumber(Math.max(definition.bounds.low, Math.min(definition.bounds.high, rawRange.low))),
        base: roundNumber(Math.max(definition.bounds.low, Math.min(definition.bounds.high, rawRange.base))),
        high: roundNumber(Math.max(definition.bounds.low, Math.min(definition.bounds.high, rawRange.high)))
      };
      if (!validateInterval(range)) {
        channels.push({ channelId: definition.channelId, state: "unavailable", reason: "invalid-range-order" });
        continue;
      }
      channels.push({ channelId: definition.channelId, state: "available", range: range, components: components, flowInputs: flow, bar: cloneAgenda(currentBars[definition.barId]) });
    }
    return { ok: channels.every(function (row) { return row.state === "available"; }), channels: channels };
  }

  function computeEquityProxyRanges(commodityRanges, proxyDefinitions, calibrationEvents, currentBars) {
    if (!isPlainObject(commodityRanges) || !Array.isArray(proxyDefinitions) || !Array.isArray(calibrationEvents) || !isPlainObject(currentBars)) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    var proxies = proxyDefinitions.map(function (definition) {
      var channel = commodityRanges[definition.channelId];
      var bar = currentBars[definition.ticker];
      var eligibleEvents = calibrationEvents.filter(function (event) { return isPlainObject(event.proxyReturns) && isFiniteNumber(event.proxyReturns[definition.ticker]); });
      if (!channel || !validateInterval(channel) || !bar || !validateInterval(definition.channelSensitivity) || !validateInterval(definition.operatingExposureOffset) ||
          !isPositiveInteger(definition.minimumCalibrationEvents) || eligibleEvents.length < definition.minimumCalibrationEvents) return { proxyId: definition.proxyId, state: "insufficient-evidence" };
      var residuals = eligibleEvents.map(function (event) { return event.proxyReturns[definition.ticker]; });
      residuals.sort(function (left, right) { return left - right; });
      var residualLow = Math.min.apply(Math, residuals);
      var residualHigh = Math.max.apply(Math, residuals);
      var residualBase = residuals.length % 2 === 1 ? residuals[(residuals.length - 1) / 2] : (residuals[residuals.length / 2 - 1] + residuals[residuals.length / 2]) / 2;
      var channelComponent = multiplyIntervals(channel, definition.channelSensitivity);
      var residualComponent = { low: residualLow, base: residualBase, high: residualHigh };
      var rawRange = sumIntervals([channelComponent, residualComponent, definition.operatingExposureOffset]);
      if (!validateInterval(rawRange)) return { proxyId: definition.proxyId, state: "insufficient-evidence" };
      return {
        proxyId: definition.proxyId,
        ticker: definition.ticker,
        state: "available",
        range: {
          low: roundNumber(rawRange.low),
          base: roundNumber(rawRange.base),
          high: roundNumber(rawRange.high)
        },
        components: { channel: channelComponent, calibrationResidual: residualComponent, operatingExposure: cloneAgenda(definition.operatingExposureOffset) },
        calibrationCount: eligibleEvents.length,
        bar: cloneAgenda(bar)
      };
    });
    return { ok: proxies.every(function (row) { return row.state === "available"; }), proxies: proxies };
  }

  function compareScenarioOutputs(currentOutput, predecessorOutput) {
    if (!isPlainObject(currentOutput) || !isPlainObject(currentOutput.probabilities) || !isStringList(currentOutput.evidenceIds, true) ||
      !isStringList(currentOutput.conflictIds, true) || !isFiniteNumber(currentOutput.directionScore) ||
      !isNonEmptyString(currentOutput.dominantScenarioId) || !isFiniteNumber(currentOutput.evidenceCoverage)) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    var currentIds = Object.keys(currentOutput.probabilities);
    if (currentIds.length === 0 || currentIds.some(function (id) { return !isFiniteNumber(currentOutput.probabilities[id]) || currentOutput.probabilities[id] < 0 || currentOutput.probabilities[id] > 1; })) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    if (predecessorOutput === null) return { ok: true, predecessorAvailable: false, probabilityDeltas: {}, addedEvidenceIds: currentOutput.evidenceIds.slice(), removedEvidenceIds: [], conflicts: currentOutput.conflictIds.slice(), currentDirectionScore: currentOutput.directionScore, predecessorDirectionScore: null, currentDominantScenarioId: currentOutput.dominantScenarioId, predecessorDominantScenarioId: null, questionUnchanged: true };
    if (!isPlainObject(predecessorOutput) || !isPlainObject(predecessorOutput.probabilities) || !isStringList(predecessorOutput.evidenceIds, true) ||
      !isStringList(predecessorOutput.conflictIds, true) || !isFiniteNumber(predecessorOutput.directionScore) || !isNonEmptyString(predecessorOutput.dominantScenarioId)) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    var probabilityDeltas = Object.create(null);
    var currentProbabilities = currentOutput.probabilities;
    var priorProbabilities = predecessorOutput.probabilities;
    var priorIds = Object.keys(priorProbabilities);
    if (currentIds.length !== priorIds.length || currentIds.some(function (id) { return !hasOwn(priorProbabilities, id) || !isFiniteNumber(priorProbabilities[id]) || priorProbabilities[id] < 0 || priorProbabilities[id] > 1; })) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    currentIds.forEach(function (id) { probabilityDeltas[id] = roundNumber(currentProbabilities[id] - priorProbabilities[id]); });
    var currentEvidence = currentOutput.evidenceIds;
    var priorEvidence = predecessorOutput.evidenceIds;
    var questionUnchanged = false;
    if (isNonEmptyString(currentOutput.declaredQuestion) && isNonEmptyString(predecessorOutput.declaredQuestion)) {
      questionUnchanged = currentOutput.declaredQuestion === predecessorOutput.declaredQuestion;
    } else if (HASH_PATTERN.test(currentOutput.declaredQuestionSha256 || "") && HASH_PATTERN.test(predecessorOutput.declaredQuestionSha256 || "")) {
      questionUnchanged = currentOutput.declaredQuestionSha256 === predecessorOutput.declaredQuestionSha256;
    }
    return {
      ok: true,
      predecessorAvailable: true,
      probabilityDeltas: probabilityDeltas,
      addedEvidenceIds: currentEvidence.filter(function (id) { return priorEvidence.indexOf(id) === -1; }),
      removedEvidenceIds: priorEvidence.filter(function (id) { return currentEvidence.indexOf(id) === -1; }),
      conflicts: (currentOutput.conflictIds || []).slice(),
      currentDirectionScore: currentOutput.directionScore,
      predecessorDirectionScore: predecessorOutput.directionScore,
      currentDominantScenarioId: currentOutput.dominantScenarioId || null,
      predecessorDominantScenarioId: predecessorOutput.dominantScenarioId || null,
      questionUnchanged: questionUnchanged
    };
  }

  function buildAgendaChangeAssessment(currentOutput, predecessorOutput, causalExplanation) {
    if (!isPlainObject(causalExplanation)) return freezeAgenda({ ok: false, code: "RLAGENDA-MODEL-INVALID", field: "causalExplanation" });
    var comparison = compareScenarioOutputs(currentOutput, predecessorOutput);
    if (!comparison.ok) return freezeAgenda(comparison);
    var direction = "insufficient-evidence";
    if (comparison.predecessorAvailable) {
      var classified = classifyChangeDirection(currentOutput, comparison, CHANGE_ASSESSMENT_THRESHOLDS);
      if (!classified.ok) return freezeAgenda(classified);
      direction = classified.direction;
    }
    return freezeAgenda({
      ok: true,
      value: freezeAgenda({
        direction: direction,
        predecessorAvailable: comparison.predecessorAvailable,
        probabilityDeltas: cloneAgenda(comparison.probabilityDeltas),
        addedEvidenceIds: comparison.addedEvidenceIds.slice(),
        removedEvidenceIds: comparison.removedEvidenceIds.slice(),
        conflictEvidenceIds: comparison.conflicts.slice(),
        currentDirectionScore: comparison.currentDirectionScore,
        predecessorDirectionScore: comparison.predecessorDirectionScore,
        currentDominantScenarioId: comparison.currentDominantScenarioId,
        predecessorDominantScenarioId: comparison.predecessorDominantScenarioId,
        questionUnchanged: comparison.questionUnchanged,
        causalExplanation: freezeAgenda(cloneAgenda(causalExplanation))
      })
    });
  }

  function classifyChangeDirection(currentOutput, comparison, thresholds) {
    if (!isPlainObject(currentOutput) || !isPlainObject(comparison) || !isPlainObject(thresholds) ||
        !isFiniteNumber(thresholds.minimumEvidenceCoverage) || !isFiniteNumber(thresholds.materialDelta) || !isFiniteNumber(thresholds.reversalThreshold)) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    if (!comparison.predecessorAvailable) return { ok: true, direction: "unchanged" };
    if (comparison.questionUnchanged !== true) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    if (!isFiniteNumber(currentOutput.evidenceCoverage) || currentOutput.evidenceCoverage < thresholds.minimumEvidenceCoverage) return { ok: true, direction: "insufficient-evidence" };
    var currentScore = comparison.currentDirectionScore;
    var priorScore = comparison.predecessorDirectionScore;
    if (!isFiniteNumber(currentScore) || !isFiniteNumber(priorScore)) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    if ((currentScore >= thresholds.reversalThreshold && priorScore <= -thresholds.reversalThreshold) ||
        (currentScore <= -thresholds.reversalThreshold && priorScore >= thresholds.reversalThreshold)) return { ok: true, direction: "reversed" };
    var delta = currentScore - priorScore;
    if (delta >= thresholds.materialDelta) return { ok: true, direction: "strengthened" };
    if (delta <= -thresholds.materialDelta) return { ok: true, direction: "weakened" };
    return { ok: true, direction: "unchanged" };
  }

  function valueAtPath(value, path) {
    var parts = path.split(".");
    var current = value;
    for (var index = 0; index < parts.length; index += 1) {
      if (!current || !hasOwn(current, parts[index])) return undefined;
      current = current[parts[index]];
    }
    return current;
  }

  function buildAgendaChartSeries(reviews, chartDefinitions) {
    if (!Array.isArray(reviews) || !Array.isArray(chartDefinitions)) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
    var seenReviews = Object.create(null);
    for (var reviewIndex = 0; reviewIndex < reviews.length; reviewIndex += 1) {
      if (!IMMUTABLE_ID_PATTERN.test(reviews[reviewIndex].reviewId || "") || seenReviews[reviews[reviewIndex].reviewId] || !isCanonicalInstant(reviews[reviewIndex].attemptedAt)) return { ok: false, code: "RLAGENDA-MODEL-INVALID" };
      seenReviews[reviews[reviewIndex].reviewId] = true;
    }
    var charts = chartDefinitions.map(function (definition) {
      var rows = reviews.map(function (review) {
        var value = valueAtPath(review, definition.valuePath);
        return { reviewId: review.reviewId, observedAt: review.attemptedAt, value: typeof value === "undefined" ? null : cloneAgenda(value), unit: definition.unit, annotations: Array.isArray(review.annotations) ? cloneAgenda(review.annotations) : [] };
      });
      return { chartId: definition.chartId, kind: definition.kind, unit: definition.unit, series: rows, tableRows: cloneAgenda(rows) };
    });
    return freezeAgenda({ ok: true, charts: charts });
  }

  function validateAgendaRefinement(topic, proposal) {
    var topicShape = exactShape(topic, TOPIC_FIELDS, TOPIC_FIELDS);
    var proposalShape = exactShape(proposal, REFINEMENT_FIELDS, REFINEMENT_FIELDS);
    if (topicShape || proposalShape || proposal.contractVersion !== REFINEMENT_VERSION || proposal.topicId !== topic.topicId ||
        !Array.isArray(proposal.subjects) || proposal.subjects.length === 0) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-REFINEMENT-INVALID", field: proposalShape ? proposalShape.field : null });
    }
    if (canonicalizeAgenda(proposal.declaredQuestion) !== canonicalizeAgenda(topic.declaredQuestion)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-REFINEMENT-QUESTION-DRIFT", field: "declaredQuestion" });
    }
    if (canonicalizeAgenda(proposal.scopeBoundary) !== canonicalizeAgenda(topic.scopeBoundary)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-REFINEMENT-BOUNDARY-DRIFT", field: "scopeBoundary" });
    }
    for (var index = 0; index < proposal.subjects.length; index += 1) {
      var subject = proposal.subjects[index];
      var subjectShape = exactShape(subject, REFINEMENT_SUBJECT_FIELDS, REFINEMENT_SUBJECT_FIELDS);
      if (subjectShape || !includesValue(REFINEMENT_SUBJECT_KINDS, subject.kind) || !isNonEmptyString(subject.value)) {
        return freezeAgenda({ ok: false, code: "RLAGENDA-REFINEMENT-INVALID", field: "subjects." + index });
      }
      var inside = false;
      if (subject.kind === "geography") inside = Array.isArray(topic.scopeBoundary.geographies) && includesValue(topic.scopeBoundary.geographies, subject.value);
      else if (subject.kind === "channel") inside = Array.isArray(topic.scopeBoundary.channels) && includesValue(topic.scopeBoundary.channels, subject.value);
      else if (subject.kind === "horizon") inside = Array.isArray(topic.scopeBoundary.horizons) && includesValue(topic.scopeBoundary.horizons, subject.value);
      else if (subject.kind === "public-ticker") inside = topic.scopeBoundary.publicOnly === true && /^[A-Z^][A-Z0-9.^=-]{0,19}$/.test(subject.value);
      else inside = topic.scopeBoundary.publicOnly === true && ID_PATTERN.test(subject.value);
      if (!inside) {
        return freezeAgenda({ ok: false, code: "RLAGENDA-REFINEMENT-OUTSIDE-BOUNDARY", field: "subjects." + index, subject: cloneAgenda(subject) });
      }
    }
    return freezeAgenda({
      ok: true,
      value: freezeAgenda({
        contractVersion: REFINEMENT_VERSION,
        topicId: topic.topicId,
        declaredQuestion: topic.declaredQuestion,
        scopeBoundary: cloneAgenda(topic.scopeBoundary),
        subjects: cloneAgenda(proposal.subjects)
      })
    });
  }

  function publicFieldTokens(key) {
    return String(key)
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .map(function (token) { return token.toLowerCase(); });
  }

  function privatePublicField(key) {
    var tokens = publicFieldTokens(key);
    var normalized = tokens.join("");
    if (includesValue(PUBLIC_PRIVATE_FIELD_TOKENS, normalized)) return true;
    return tokens.some(function (token) { return includesValue(PUBLIC_PRIVATE_FIELD_TOKENS, token); });
  }

  function findPrivatePublicField(value, path) {
    if (Array.isArray(value)) {
      for (var arrayIndex = 0; arrayIndex < value.length; arrayIndex += 1) {
        var arrayFinding = findPrivatePublicField(value[arrayIndex], path + "." + arrayIndex);
        if (arrayFinding) return arrayFinding;
      }
      return null;
    }
    if (!isPlainObject(value)) return null;
    var keys = Object.keys(value);
    for (var index = 0; index < keys.length; index += 1) {
      var key = keys[index];
      var fieldPath = path ? path + "." + key : key;
      if (privatePublicField(key)) return fieldPath;
      var nestedFinding = findPrivatePublicField(value[key], fieldPath);
      if (nestedFinding) return nestedFinding;
    }
    return null;
  }

  function validatePublicResearchArtifact(value) {
    if (!isPlainObject(value) || !isNonEmptyString(value.contractVersion)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-CONTRACT-SHAPE", field: null });
    }
    var privateField = findPrivatePublicField(value, "");
    if (privateField) return freezeAgenda({ ok: false, code: "RLAGENDA-PUBLIC-PRIVATE", field: privateField });
    return freezeAgenda({ ok: true, value: cloneAgenda(value) });
  }

  function findingFailure(code, field) {
    return freezeAgenda({ ok: false, code: code || "RLAGENDA-CONTRACT-SHAPE", field: field || null });
  }

  function prefixedFindingField(prefix, field) {
    return prefix + (field ? "." + field : "");
  }

  function validateFindingPublicSubject(subject, topic) {
    var shape = exactShape(subject, FINDING_PUBLIC_SUBJECT_FIELDS, FINDING_PUBLIC_SUBJECT_FIELDS);
    if (shape) return shape;
    if (!includesValue(REFINEMENT_SUBJECT_KINDS, subject.kind) || !isNonEmptyString(subject.value) || topic.scopeBoundary.publicOnly !== true) {
      return { code: "RLAGENDA-PUBLIC-SUBJECT", field: "publicSubjects" };
    }
    if (subject.kind === "geography" && !includesValue(topic.scopeBoundary.geographies || [], subject.value)) return { code: "RLAGENDA-PUBLIC-SUBJECT", field: "publicSubjects" };
    if (subject.kind === "channel" && !includesValue(topic.scopeBoundary.channels || [], subject.value)) return { code: "RLAGENDA-PUBLIC-SUBJECT", field: "publicSubjects" };
    if (subject.kind === "horizon" && !includesValue(topic.scopeBoundary.horizons || [], subject.value)) return { code: "RLAGENDA-PUBLIC-SUBJECT", field: "publicSubjects" };
    if (subject.kind === "public-ticker" && !/^[A-Z^][A-Z0-9.^=-]{0,19}$/.test(subject.value)) return { code: "RLAGENDA-PUBLIC-SUBJECT", field: "publicSubjects" };
    if (subject.kind === "public-market-object" && !ID_PATTERN.test(subject.value)) return { code: "RLAGENDA-PUBLIC-SUBJECT", field: "publicSubjects" };
    return null;
  }

  function validatePublishedFinding(finding, topic, definition, evidenceRecords, sourceLedger) {
    var shape = exactShape(finding, PUBLISHED_FINDING_FIELDS, PUBLISHED_FINDING_FIELDS);
    if (shape) return findingFailure(shape.code, shape.field);
    if (!isPlainObject(topic) || !isPlainObject(topic.scopeBoundary) || !isPlainObject(definition) || definition.topicId !== topic.topicId) {
      return findingFailure("RLAGENDA-CONTRACT-SHAPE", "topicId");
    }
    if (!ID_PATTERN.test(finding.findingId || "")) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "findingId");
    if (!isCanonicalInstant(finding.observedAt)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "observedAt");
    if (!isNonEmptyString(finding.claim)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "claim");
    if (!Array.isArray(finding.publicSubjects) || finding.publicSubjects.length === 0) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "publicSubjects");
    var subjectKeys = Object.create(null);
    for (var subjectIndex = 0; subjectIndex < finding.publicSubjects.length; subjectIndex += 1) {
      var subjectResult = validateFindingPublicSubject(finding.publicSubjects[subjectIndex], topic);
      if (subjectResult) return findingFailure(subjectResult.code, "publicSubjects." + subjectIndex + (subjectResult.field && subjectResult.field !== "publicSubjects" ? "." + subjectResult.field : ""));
      var subjectKey = canonicalizeAgenda(finding.publicSubjects[subjectIndex]);
      if (subjectKeys[subjectKey]) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "publicSubjects." + subjectIndex);
      subjectKeys[subjectKey] = true;
    }
    if (!includesValue(FINDING_HORIZONS, finding.horizon)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "horizon");
    var sourceShape = exactShape(finding.source, FINDING_SOURCE_FIELDS, FINDING_SOURCE_FIELDS);
    if (sourceShape) return findingFailure(sourceShape.code, prefixedFindingField("source", sourceShape.field));
    if (!isUniqueStringList(finding.source.sourceIds, false)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "source.sourceIds");
    var confidenceShape = exactShape(finding.statedConfidence, FINDING_CONFIDENCE_FIELDS, FINDING_CONFIDENCE_FIELDS);
    if (confidenceShape) return findingFailure(confidenceShape.code, prefixedFindingField("statedConfidence", confidenceShape.field));
    if (!includesValue(CONFIDENCE_GRADES, finding.statedConfidence.grade)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "statedConfidence.grade");
    if (!isNonEmptyString(finding.statedConfidence.basis)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "statedConfidence.basis");
    if (!includesValue(PROVENANCE_CLASSES, finding.provenanceClass)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "provenanceClass");
    if (!includesValue(EVIDENCE_ROLES, finding.evidenceRole)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "evidenceRole");
    if (!isUniqueStringList(finding.evidenceRefs, false)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "evidenceRefs");
    if (!isUniqueStringList(finding.triggerRefs, false)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "triggerRefs");
    if (!isUniqueStringList(finding.invalidationRefs, false)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "invalidationRefs");
    if (!isStringList(finding.causalPath, true)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "causalPath");
    if (!isStringList(finding.refutedBy, true)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "refutedBy");
    if (!isStringList(finding.limitations, true)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "limitations");
    if (finding.evidenceRole === "indirect" && (finding.causalPath.length < 2 || finding.refutedBy.length === 0)) {
      return findingFailure("RLAGENDA-CONTRACT-SHAPE", finding.causalPath.length < 2 ? "causalPath" : "refutedBy");
    }
    var evidenceIds = Array.isArray(evidenceRecords) ? evidenceRecords.map(function (record) { return record && record.evidenceId; }) : [];
    var sourceIds = Array.isArray(sourceLedger) ? sourceLedger.map(function (record) { return record && record.sourceId; }) : [];
    var triggerIds = Array.isArray(definition.triggers) ? definition.triggers.map(function (trigger) { return trigger.triggerId; }) : [];
    var invalidationIds = Array.isArray(definition.invalidations) ? definition.invalidations.map(function (invalidation) { return invalidation.invalidationId; }) : [];
    if (!finding.evidenceRefs.every(function (reference) { return includesValue(evidenceIds, reference); })) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "evidenceRefs");
    if (!finding.source.sourceIds.every(function (reference) { return includesValue(sourceIds, reference); })) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "source.sourceIds");
    if (!finding.triggerRefs.every(function (reference) { return includesValue(triggerIds, reference); })) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "triggerRefs");
    if (!finding.invalidationRefs.every(function (reference) { return includesValue(invalidationIds, reference); })) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "invalidationRefs");
    var publicSafety = validatePublicResearchArtifact({ contractVersion: "research-published-finding/v1", finding: finding });
    if (!publicSafety.ok) return findingFailure(publicSafety.code, publicSafety.field);
    return freezeAgenda({ ok: true, value: cloneAgenda(finding) });
  }

  function buildFeature020ResearchSeam(topic, definition, dossier) {
    var topicShape = exactShape(topic, TOPIC_FIELDS, TOPIC_FIELDS);
    if (topicShape) return findingFailure(topicShape.code, prefixedFindingField("topic", topicShape.field));
    if (!ID_PATTERN.test(topic.topicId || "")) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "topicId");
    if (!topic.scopeBoundary || topic.scopeBoundary.publicOnly !== true) return findingFailure("RLAGENDA-PUBLIC-SUBJECT", "topic.scopeBoundary.publicOnly");
    var definitionResult = validateTopicDefinition(definition, topic);
    if (!definitionResult.ok) return findingFailure(definitionResult.code, definitionResult.field || "definition");
    var dossierSafety = validatePublicResearchArtifact(dossier);
    if (!dossierSafety.ok) return findingFailure(dossierSafety.code, dossierSafety.field);
    if (dossier.contractVersion !== DOSSIER_VERSION) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "contractVersion");
    if (dossier.topicId !== topic.topicId) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "topicId");
    if (!IMMUTABLE_ID_PATTERN.test(dossier.dossierId || "")) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "dossierId");
    if (dossier.historicalOnly !== false) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "historicalOnly");
    if (dossier.validationState !== "validated") return findingFailure("RLAGENDA-CONTRACT-SHAPE", "validationState");
    if (!Array.isArray(dossier.findings)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "findings");
    if (!Array.isArray(dossier.evidenceRecords)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "evidenceRecords");
    if (!Array.isArray(dossier.sourceLedger)) return findingFailure("RLAGENDA-CONTRACT-SHAPE", "sourceLedger");
    var findings = [];
    for (var findingIndex = 0; findingIndex < dossier.findings.length; findingIndex += 1) {
      var findingValidation = validatePublishedFinding(dossier.findings[findingIndex], topic, definition, dossier.evidenceRecords, dossier.sourceLedger);
      if (!findingValidation.ok) return findingFailure(findingValidation.code, prefixedFindingField("findings." + findingIndex, findingValidation.field));
      var finding = findingValidation.value;
      findings.push({
        findingId: finding.findingId,
        observedAt: finding.observedAt,
        claim: finding.claim,
        publicSubjects: cloneAgenda(finding.publicSubjects),
        horizon: finding.horizon,
        statedConfidence: cloneAgenda(finding.statedConfidence),
        provenanceClass: finding.provenanceClass,
        evidenceRole: finding.evidenceRole,
        evidenceRefs: finding.evidenceRefs.slice(),
        sourceRefs: finding.source.sourceIds.slice(),
        triggerRefs: finding.triggerRefs.slice(),
        invalidationRefs: finding.invalidationRefs.slice(),
        topicId: topic.topicId,
        dossierId: dossier.dossierId
      });
    }
    for (var index = 0; index < findings.length; index += 1) {
      var findingShape = exactShape(findings[index], FINDING_REFERENCE_FIELDS, FINDING_REFERENCE_FIELDS);
      if (findingShape) return findingFailure(findingShape.code, prefixedFindingField("findings." + index, findingShape.field));
      if (!ID_PATTERN.test(findings[index].findingId || "") || !isCanonicalInstant(findings[index].observedAt) || !isNonEmptyString(findings[index].claim) ||
          !isUniqueStringList(findings[index].evidenceRefs, false) || !isUniqueStringList(findings[index].sourceRefs, false) ||
          !isUniqueStringList(findings[index].triggerRefs, false) || !isUniqueStringList(findings[index].invalidationRefs, false) ||
          findings[index].topicId !== topic.topicId || findings[index].dossierId !== dossier.dossierId) {
        return findingFailure("RLAGENDA-CONTRACT-SHAPE", "findings." + index);
      }
    }
    var seam = {
      contractVersion: FINDING_SEAM_VERSION,
      topicId: topic.topicId,
      dossierId: dossier.dossierId,
      definitionVersion: definition.definitionVersion,
      declaredQuestionSha256: sha256Text(topic.declaredQuestion),
      findings: findings
    };
    var seamShape = exactShape(seam, FINDING_SEAM_FIELDS, FINDING_SEAM_FIELDS);
    var seamSafety = validatePublicResearchArtifact(seam);
    if (seamShape) return findingFailure(seamShape.code, seamShape.field);
    if (!seamSafety.ok) return findingFailure(seamSafety.code, seamSafety.field);
    return freezeAgenda({ ok: true, value: freezeAgenda(cloneAgenda(seam)) });
  }

  function agendaTopicReason(topic) {
    if (topic.state === "reviewed") return "a validated current dossier is available";
    if (topic.reason === "research-lane-unavailable") return "the current research lane did not produce a validated dossier";
    if (topic.reason === "cadence-budget") return "the topic was deferred by this generation's cadence budget";
    if (topic.reason === "not-due") return "the topic was not due under its declared cadence";
    if (topic.reason === "stale-evidence") return "no supporting observation remained inside the freshness window";
    return "the current outcome is " + String(topic.state || "unavailable").replace(/-/g, " ");
  }

  function buildAgendaToolRead(read, registry) {
    var validation = validateAgendaRead(read, registry);
    if (!validation.ok) return validation;
    var primaryTopic = registry.topics.find(function (topic) { return topic.reviewPolicy.mode === "every-generation"; }) || registry.topics[0];
    var titleById = Object.create(null);
    registry.topics.forEach(function (topic) { titleById[topic.topicId] = topic.title; });
    var reviewedTopicCount = read.topics.filter(function (topic) { return topic.state === "reviewed"; }).length;
    var unavailableTopicCount = read.topics.filter(function (topic) { return topic.state === "unavailable" || topic.state === "stale"; }).length;
    var deferredTopicCount = read.topics.filter(function (topic) { return topic.state === "deferred" || topic.state === "not-due"; }).length;
    var sentences = read.topics.map(function (topic) {
      return (titleById[topic.topicId] || topic.topicId) + ": " + agendaTopicReason(topic) + ".";
    });
    var value = {
      asOf: read.asOf,
      deepLink: "research-agenda-lab.html#power/" + primaryTopic.topicId,
      id: "research-agenda-lab",
      metrics: {
        contractVersion: TOOL_READ_VERSION,
        generationId: read.generationId,
        readFingerprint: read.readFingerprint,
        reviewedTopicCount: reviewedTopicCount,
        unavailableTopicCount: unavailableTopicCount,
        deferredTopicCount: deferredTopicCount,
        agendaRead: cloneAgenda(read)
      },
      read: sentences.join(" "),
      source: "research-agenda-current",
      state: reviewedTopicCount > 0 ? (reviewedTopicCount === read.topics.length ? "ready" : "partial") : "unavailable"
    };
    var publicValidation = validatePublicResearchArtifact({
      contractVersion: TOOL_READ_VERSION,
      toolRead: value
    });
    if (!publicValidation.ok) return publicValidation;
    return freezeAgenda({ ok: true, value: freezeAgenda(cloneAgenda(value)) });
  }

  function clampNumber(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function validateAgendaLeverState(leverState) {
    var shape = exactShape(leverState, VIEW_LEVER_FIELDS, VIEW_LEVER_FIELDS);
    if (shape) return false;
    return VIEW_LEVER_FIELDS.every(function (field) { return isFiniteNumber(leverState[field]); }) &&
      leverState.hormuzPhysicalPassFraction >= 0 && leverState.hormuzPhysicalPassFraction <= 1 &&
      leverState.babElMandebPhysicalPassFraction >= 0 && leverState.babElMandebPhysicalPassFraction <= 1 &&
      leverState.reroutedShare >= 0 && leverState.reroutedShare <= 1 &&
      leverState.inventoryPolicyResponseOffset >= -1 && leverState.inventoryPolicyResponseOffset <= 1 &&
      leverState.demandOffset >= -1 && leverState.demandOffset <= 1;
  }

  function replaceIntervalBase(interval, value) {
    if (!validateInterval(interval)) return interval;
    var lowDelta = interval.base - interval.low;
    var highDelta = interval.high - interval.base;
    var base = clampNumber(value, 0, 1);
    return {
      low: clampNumber(base - lowDelta, 0, 1),
      base: base,
      high: clampNumber(base + highDelta, 0, 1)
    };
  }

  function agendaFlowNetworkForLevers(flowNetwork, reroutedShare) {
    var copied = cloneAgenda(flowNetwork);
    copied.flows.forEach(function (flow) {
      if (!flow.alternateRoute || !Array.isArray(flow.alternateRoute.routeEdges) || flow.alternateRoute.routeEdges.length === 0 ||
          !validateInterval(flow.alternateRoute.capacityFraction) || flow.alternateRoute.capacityFraction.high === 0) return;
      flow.alternateRoute.capacityFraction = replaceIntervalBase(flow.alternateRoute.capacityFraction, reroutedShare);
    });
    return copied;
  }

  function recomputeAgendaModelOutputs(definition, inputs, leverState, generationCutoff) {
    var validation = validateResearchModelInput(inputs, definition, generationCutoff);
    if (!validation.ok) return validation;
    inputs = validation.value;
    var baseline = cloneAgenda(inputs.levers);
    var effective = typeof leverState === "undefined" || leverState === null ? baseline : leverState;
    if (!validateAgendaLeverState(effective)) return freezeAgenda({ ok: false, code: "RLAGENDA-MODEL-INVALID", field: "leverState" });
    var chokepointState = cloneAgenda(inputs.chokepointState);
    if (chokepointState.hormuz) chokepointState.hormuz.physicalPassFraction = replaceIntervalBase(chokepointState.hormuz.physicalPassFraction, effective.hormuzPhysicalPassFraction);
    if (chokepointState["bab-el-mandeb"]) chokepointState["bab-el-mandeb"].physicalPassFraction = replaceIntervalBase(chokepointState["bab-el-mandeb"].physicalPassFraction, effective.babElMandebPhysicalPassFraction);
    var probabilities = updateEscalationProbabilities(definition.scenarioTree, inputs.evidenceImpacts, { maxAbsoluteImpact: definition.evidencePolicy.impactCaps.direct });
    if (!probabilities.ok) return probabilities;
    var flowNetwork = agendaFlowNetworkForLevers(definition.flowNetwork, effective.reroutedShare);
    var byScenario = {};
    Object.keys(probabilities.probabilities).forEach(function (scenarioId) {
      byScenario[scenarioId] = computeFlowState(flowNetwork, chokepointState, scenarioId);
    });
    if (Object.keys(byScenario).some(function (scenarioId) { return !byScenario[scenarioId].ok; })) return freezeAgenda({ ok: false, code: "RLAGENDA-FLOW-INVALID" });
    var modelLevers = {
      inventoryPolicyResponseOffset: effective.inventoryPolicyResponseOffset,
      demandOffset: effective.demandOffset
    };
    var commodity = computeCommodityShockRanges(probabilities.probabilities, { byScenario: byScenario, inventoryGapByChannel: inputs.inventoryGapByChannel }, definition.transmissionModels, inputs.currentBars, modelLevers);
    if (!commodity.ok) return freezeAgenda({ ok: false, code: "RLAGENDA-MODEL-INVALID", field: "channelRanges" });
    var channelRanges = Object.fromEntries(commodity.channels.map(function (row) { return [row.channelId, row.range]; }));
    var proxies = computeEquityProxyRanges(channelRanges, definition.proxyDefinitions, inputs.calibrationEvents, inputs.currentBars);
    if (!proxies.ok) return freezeAgenda({ ok: false, code: "RLAGENDA-MODEL-INVALID", field: "proxyRanges" });
    return freezeAgenda({
      ok: true,
      value: freezeAgenda({
        baselineLeverState: baseline,
        leverState: cloneAgenda(effective),
        changedLeverIds: VIEW_LEVER_FIELDS.filter(function (field) { return effective[field] !== baseline[field]; }),
        modelOutputs: {
          scenarioProbability: probabilities.probabilities,
          scenarioProbabilities: probabilities.probabilities,
          physicalFlow: byScenario,
          flowStates: byScenario,
          channelRanges: channelRanges,
          proxyRanges: Object.fromEntries(proxies.proxies.map(function (row) { return [row.proxyId, row.range]; }))
        }
      })
    });
  }

  function unavailableAgendaView(review, unavailableReason) {
    return freezeAgenda({
      ok: true,
      value: freezeAgenda({
        contractVersion: VIEW_STATE_VERSION,
        topicId: review.topicId,
        generationId: review.generationId,
        reviewId: review.reviewId,
        outcome: review.outcome,
        reason: review.reason,
        completePass: review.completePass === true,
        modelAvailable: false,
        modelUnavailableReason: unavailableReason,
        resolvedDossierId: null,
        parity: "not-applicable",
        baselineLeverState: null,
        leverState: null,
        changedLeverIds: [],
        modelOutputs: null,
        charts: [],
        sectionStates: cloneAgenda(Array.isArray(review.sectionStates) ? review.sectionStates : [])
      })
    });
  }

  function computeAgendaViewState(definition, review, resolvedDossier, leverState) {
    if (!isPlainObject(definition) || !isPlainObject(review) || definition.topicId !== review.topicId ||
        review.contractVersion !== REVIEW_VERSION || !IMMUTABLE_ID_PATTERN.test(review.reviewId || "") ||
        !isCanonicalInstant(review.attemptedAt)) {
      return freezeAgenda({ ok: false, code: "RLAGENDA-MODEL-INVALID", field: "review" });
    }
    if (!hasOwn(review, "dossierRef")) return unavailableAgendaView(review, "dossier-ref-missing");
    if (!hasOwn(review, "modelSnapshotRef")) return unavailableAgendaView(review, "model-snapshot-ref-missing");
    if (review.dossierRef === null && review.modelSnapshotRef === null) return unavailableAgendaView(review, "review-model-unavailable");
    if (review.dossierRef === null) return unavailableAgendaView(review, "dossier-ref-missing");
    if (review.modelSnapshotRef === null) return unavailableAgendaView(review, "model-snapshot-ref-missing");
    var reviewValidation = validateActiveReview(review);
    if (!reviewValidation.ok) return unavailableAgendaView(review, "review-contract-invalid");
    if (!isPlainObject(resolvedDossier)) return unavailableAgendaView(review, "resolved-dossier-missing");
    var expectedDossierPath = immutablePathForRecord(resolvedDossier);
    if (dossierIdFromRef(review.dossierRef) !== resolvedDossier.dossierId) return unavailableAgendaView(review, "dossier-id-mismatch");
    if (expectedDossierPath === null || review.dossierRef.path !== expectedDossierPath) return unavailableAgendaView(review, "dossier-path-mismatch");
    if (resolvedDossier.contractVersion !== DOSSIER_VERSION || resolvedDossier.topicId !== review.topicId ||
        resolvedDossier.generationId !== review.generationId || resolvedDossier.historicalOnly !== false) {
      return unavailableAgendaView(review, "dossier-identity-mismatch");
    }
    var dossierValidation = validateActiveDossier(resolvedDossier, definition);
    if (!dossierValidation.ok) return unavailableAgendaView(review, "resolved-dossier-invalid");
    if (review.dossierRef.sha256 !== agendaDigest(resolvedDossier)) return unavailableAgendaView(review, "dossier-digest-mismatch");
    if (canonicalizeAgenda(review.modelSnapshotRef.dossierRef) !== canonicalizeAgenda(review.dossierRef)) {
      return unavailableAgendaView(review, "model-snapshot-dossier-ref-mismatch");
    }
    if (review.modelSnapshotRef.modelInputsSha256 !== agendaDigest(resolvedDossier.modelInputs) ||
        review.modelSnapshotRef.modelOutputsSha256 !== agendaDigest(resolvedDossier.modelOutputs) ||
        review.modelSnapshotRef.chartSeriesSha256 !== agendaDigest(resolvedDossier.chartStates)) {
      return unavailableAgendaView(review, "model-snapshot-digest-mismatch");
    }
    var replay = recomputeAgendaModelOutputs(definition, resolvedDossier.modelInputs, leverState, resolvedDossier.observedThrough);
    if (!replay.ok) return replay;
    var modelOutputs = replay.value.modelOutputs;
    var chartReview = {
      reviewId: review.reviewId,
      attemptedAt: review.attemptedAt,
      modelOutputs: modelOutputs,
      annotations: []
    };
    var charts = buildAgendaChartSeries([chartReview], definition.chartDefinitions);
    if (!charts.ok) return charts;
    var storedComparable = {
      scenarioProbability: resolvedDossier.modelOutputs.scenarioProbability || resolvedDossier.modelOutputs.scenarioProbabilities,
      physicalFlow: resolvedDossier.modelOutputs.physicalFlow || resolvedDossier.modelOutputs.flowStates,
      channelRanges: resolvedDossier.modelOutputs.channelRanges,
      proxyRanges: resolvedDossier.modelOutputs.proxyRanges
    };
    var recomputedComparable = {
      scenarioProbability: modelOutputs.scenarioProbability,
      physicalFlow: modelOutputs.physicalFlow,
      channelRanges: modelOutputs.channelRanges,
      proxyRanges: modelOutputs.proxyRanges
    };
    var baselineRun = replay.value.changedLeverIds.length === 0;
    var storedMatches = canonicalizeAgenda(storedComparable) === canonicalizeAgenda(recomputedComparable);
    if (baselineRun && !storedMatches) return unavailableAgendaView(review, "stored-model-output-mismatch");
    return freezeAgenda({
      ok: true,
      value: freezeAgenda({
        contractVersion: VIEW_STATE_VERSION,
        topicId: review.topicId,
        generationId: review.generationId,
        reviewId: review.reviewId,
        outcome: review.outcome,
        reason: review.reason,
        completePass: review.completePass === true,
        modelAvailable: true,
        modelUnavailableReason: null,
        resolvedDossierId: resolvedDossier.dossierId,
        parity: baselineRun ? "matched" : "user-assumption",
        baselineLeverState: replay.value.baselineLeverState,
        leverState: replay.value.leverState,
        changedLeverIds: replay.value.changedLeverIds,
        modelOutputs: modelOutputs,
        charts: charts.charts,
        sectionStates: cloneAgenda(review.sectionStates || [])
      })
    });
  }

  function readerSentence(code, reason) {
    var sentences = {
      "RLAGENDA-CONTRACT-ABSENT": "The research agenda is not present in this repository checkout.",
      "RLAGENDA-MODE-MISSING": "This topic has no review schedule and was not reviewed.",
      "RLAGENDA-CAPACITY-EVERY-GENERATION": "The required every-generation topics exceed the declared run capacity.",
      "RLAGENDA-EVIDENCE-VOCABULARY": "A research record used an unsupported evidence label."
    };
    if (sentences[code]) return sentences[code];
    return isNonEmptyString(reason) ? reason : "The research agenda could not be used for a named contract reason.";
  }

  return Object.freeze({
    AGENDA_VERSION: AGENDA_VERSION,
    TOPIC_VERSION: TOPIC_VERSION,
    EVIDENCE_VERSION: EVIDENCE_VERSION,
    SOURCE_VERSION: SOURCE_VERSION,
    CALIBRATION_VERSION: CALIBRATION_VERSION,
    EVIDENCE_POLICY_VERSION: EVIDENCE_POLICY_VERSION,
    GENERATION_VERSION: GENERATION_VERSION,
    REVIEW_VERSION: REVIEW_VERSION,
    DOSSIER_VERSION: DOSSIER_VERSION,
    HISTORY_EVENT_VERSION: HISTORY_EVENT_VERSION,
    CURRENT_VERSION: CURRENT_VERSION,
    PLAN_VERSION: PLAN_VERSION,
    READ_VERSION: READ_VERSION,
    REFINEMENT_VERSION: REFINEMENT_VERSION,
    FINDING_SEAM_VERSION: FINDING_SEAM_VERSION,
    VIEW_STATE_VERSION: VIEW_STATE_VERSION,
    TOOL_READ_VERSION: TOOL_READ_VERSION,
    MODEL_INPUT_VERSION: MODEL_INPUT_VERSION,
    CHANGE_ASSESSMENT_THRESHOLDS: CHANGE_ASSESSMENT_THRESHOLDS,
    REVIEW_MODES: REVIEW_MODES,
    LIFECYCLE_STATES: LIFECYCLE_STATES,
    EVIDENCE_ROLES: EVIDENCE_ROLES,
    PROVENANCE_CLASSES: PROVENANCE_CLASSES,
    CONFIDENCE_GRADES: CONFIDENCE_GRADES,
    CORROBORATION_STATES: CORROBORATION_STATES,
    FRESHNESS_STATES: FRESHNESS_STATES,
    SECTION_KINDS: SECTION_KINDS,
    MODEL_FUNCTION_IDS: MODEL_FUNCTION_IDS,
    CHART_KINDS: CHART_KINDS,
    TRIGGER_KINDS: TRIGGER_KINDS,
    HISTORY_EVENT_TYPES: HISTORY_EVENT_TYPES,
    CURRENT_TOPIC_STATES: CURRENT_TOPIC_STATES,
    REVIEW_OUTCOMES: REVIEW_OUTCOMES,
    CHANGE_ASSESSMENTS: CHANGE_ASSESSMENTS,
    AVAILABILITY_STATES: AVAILABILITY_STATES,
    PLAN_TOPIC_STATES: PLAN_TOPIC_STATES,
    TRIGGER_OPERATORS: TRIGGER_OPERATORS,
    REFUSAL_CODES: REFUSAL_CODES,
    CONTRACT_SHAPES: CONTRACT_SHAPES,
    sha256Text: sha256Text,
    canonicalizeAgenda: canonicalizeAgenda,
    agendaDigest: agendaDigest,
    deriveGenerationId: deriveGenerationId,
    deriveReviewId: deriveReviewId,
    deriveDossierId: deriveDossierId,
    deriveSourceId: deriveSourceId,
    prepareImmutableCreate: prepareImmutableCreate,
    classifyTopicLifecycle: classifyTopicLifecycle,
    deriveHistoryEventId: deriveHistoryEventId,
    buildHistoryEvent: buildHistoryEvent,
    appendHistoryEvents: appendHistoryEvents,
    planLifecycleEvents: planLifecycleEvents,
    buildArtifactRef: buildArtifactRef,
    validateActiveReview: validateActiveReview,
    validateActiveDossier: validateActiveDossier,
    validateCurrentPointer: validateCurrentPointer,
    validateAgendaRead: validateAgendaRead,
    planGeneration: planGeneration,
    readAgendaText: readAgendaText,
    validateAgenda: validateAgenda,
    resolveAgendaPolicy: resolveAgendaPolicy,
    validateTopicDefinition: validateTopicDefinition,
    validateCalibration: validateCalibration,
    validateResearchModelInput: validateResearchModelInput,
    validateEvidenceRecord: validateEvidenceRecord,
    computeEvidenceWeight: computeEvidenceWeight,
    updateEscalationProbabilities: updateEscalationProbabilities,
    computeFlowState: computeFlowState,
    computeCommodityShockRanges: computeCommodityShockRanges,
    computeEquityProxyRanges: computeEquityProxyRanges,
    compareScenarioOutputs: compareScenarioOutputs,
    classifyChangeDirection: classifyChangeDirection,
    buildAgendaChangeAssessment: buildAgendaChangeAssessment,
    buildAgendaChartSeries: buildAgendaChartSeries,
    validateAgendaRefinement: validateAgendaRefinement,
    validatePublicResearchArtifact: validatePublicResearchArtifact,
    validatePublishedFinding: validatePublishedFinding,
    buildFeature020ResearchSeam: buildFeature020ResearchSeam,
    buildAgendaToolRead: buildAgendaToolRead,
    recomputeAgendaModelOutputs: recomputeAgendaModelOutputs,
    computeAgendaViewState: computeAgendaViewState,
    readerSentence: readerSentence
  });
}));