/* RLSHOCK — topic-neutral shock-transmission contract foundation.
   Pure browser and CommonJS UMD. No DOM, storage, network, timer, clock, or
   owner-model authority. Contract: shock-transmission/v1. */
(function (factory) {
  "use strict";

  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLSHOCK_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLSHOCK = api;
})(function () {
  "use strict";

  var CONTRACT_VERSIONS = Object.freeze({
    resourcePolicy: "shock-transmission/resource-policy/v1",
    definition: "shock-transmission/definition/v1",
    observationSet: "shock-transmission/observation-set/v1",
    adapterOutput: "shock-transmission/adapter-output/v1",
    snapshot: "shock-transmission/v1",
    viewState: "shock-transmission/view-state/v1",
    claimRow: "shock-transmission/claim-row/v1",
    edgeRow: "shock-transmission/edge-row/v1",
    error: "shock-transmission/error/v1"
  });

  var ERROR_CODES = Object.freeze([
    "RLSHOCK-CONTRACT", "RLSHOCK-VERSION-UNSUPPORTED", "RLSHOCK-VERSION-MIXED",
    "RLSHOCK-UNKNOWN-MEMBER", "RLSHOCK-MISSING-MEMBER", "RLSHOCK-TYPE",
    "RLSHOCK-VOCABULARY", "RLSHOCK-IDENTITY", "RLSHOCK-DIGEST",
    "RLSHOCK-REFERENCE", "RLSHOCK-DUPLICATE", "RLSHOCK-GRAPH-ENDPOINT",
    "RLSHOCK-GRAPH-CYCLE", "RLSHOCK-GRAPH-PATH", "RLSHOCK-RANGE",
    "RLSHOCK-UNIT", "RLSHOCK-SIGN", "RLSHOCK-TIME", "RLSHOCK-VINTAGE",
    "RLSHOCK-EVIDENCE", "RLSHOCK-PROBABILITY", "RLSHOCK-CALIBRATION",
    "RLSHOCK-LIFECYCLE", "RLSHOCK-POLICY-AUTHORITY", "RLSHOCK-PUBLIC-PRIVATE",
    "RLSHOCK-PROJECTION-LOSSY", "RLSHOCK-HYPOTHETICAL-PERSIST", "RLSHOCK-RESOURCE"
  ]);

  var ID_PATTERN = /^[a-z][a-z0-9]*(?:[-:.][a-z0-9]+)*$/;
  var DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/;
  var SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
  var QUANTITY_STATES = Object.freeze(["current", "stale", "unavailable", "conflicted", "insufficient-sample"]);
  var PROVENANCE_CLASSES = Object.freeze(["observed-fact", "user-assumption", "model-estimate", "unavailable"]);
  var UNIT_DIMENSIONS = Object.freeze([
    "fraction", "percentage-point", "basis-point", "currency", "physical-quantity",
    "index-point", "calendar-day", "trading-session", "count"
  ]);
  var EDGE_SIGNS = Object.freeze(["positive", "negative", "mixed", "zero"]);
  var EDGE_STATES = Object.freeze(["candidate", "supported", "conflicted", "refuted", "superseded"]);
  var PATH_STATES = Object.freeze(["candidate", "active", "restored", "refuted", "superseded"]);
  var SHOCK_STATES = Object.freeze(["observed", "revised", "resolved", "superseded"]);
  var OFFSET_STATES = Object.freeze(["available", "constrained", "exhausted", "unavailable"]);
  var FOUNDATION_OFFSET_KINDS = Object.freeze(["inventory", "reroute", "substitution", "recycling", "allocation", "demand-response"]);
  var ACTOR_CLASSES = Object.freeze([
    "executive", "finance-ministry", "resource-agency", "central-bank", "legislature",
    "corporate", "intermediary", "household", "multilateral", "other-public"
  ]);
  var ACTOR_STATES = Object.freeze(["active", "inactive", "unavailable"]);
  var REACTION_STATES = Object.freeze(["observed", "inferred", "refuted", "superseded"]);
  var POLICY_STATES = Object.freeze(["announced", "implemented", "effective", "ineffective", "reversed"]);
  var RESTORATION_STATES = Object.freeze(["unmet", "partially-met", "met", "invalidated"]);
  var POLICY_LAYERS = Object.freeze([
    "market-plumbing", "liquidity", "intermediation", "solvency", "income-demand", "physical-capacity"
  ]);
  var EFFECT_DIMENSIONS = Object.freeze(["growth", "inflation", "liquidity", "credibility", "physical-capacity"]);
  var NODE_KINDS = Object.freeze(["shock", "offset", "state", "actor-reaction", "policy-action", "restoration", "outcome"]);
  var DURATION_BASES = Object.freeze(["calendar-day", "calendar-month", "trading-session"]);
  var CLAIM_CLASSES = Object.freeze(["observed-fact", "stated-intent", "model-inference", "analyst-analogy", "constraint", "falsifier"]);
  var FINDING_STATES = Object.freeze(["current", "stale", "missing", "conflicted", "unsupported", "invalidated"]);
  var FINDING_LIFECYCLES = Object.freeze(["current", "stale", "invalidated", "superseded"]);
  var EVIDENCE_ROLES = Object.freeze(["direct", "indirect", "context", "falsifier"]);
  var EVIDENCE_GRADES = Object.freeze(["A", "B", "C", "D", "unavailable"]);
  var PUBLIC_SUBJECT_KINDS = Object.freeze(["topic", "geography", "channel", "public-ticker", "public-market-object"]);
  var PRIVATE_FIELD_NAMES = Object.freeze([
    "holding", "holdings", "position", "positions", "positionSize", "holdingSize",
    "positionQuantity", "holdingQuantity", "costBasis", "profit", "profitLoss", "pnl",
    "account", "accountId", "mandate", "credential", "credentials", "token", "authToken",
    "accessToken", "refreshToken", "apiKey", "key", "password", "secret", "privateKey", "cvv", "cvc"
  ]);
  var PRIVATE_FIELD_INDEX = Object.freeze(PRIVATE_FIELD_NAMES.reduce(function (index, name) {
    index[normalizeFieldName(name)] = true;
    return index;
  }, Object.create(null)));

  var RESOURCE_POLICY_FIELDS = Object.freeze([
    "contractVersion", "policyId", "maxHorizonsPerDefinition", "maxGraphNodesPerSnapshot"
  ]);
  var DEFINITION_FIELDS = Object.freeze([
    "contractVersion", "definitionId", "predecessorDefinitionDigest", "topicId", "adapterId",
    "adapterVersion", "resourcePolicyId", "resourcePolicyDigest", "unitRegistry", "horizonRegistry",
    "leverRegistry", "offsetKinds", "actorRegistry", "policyLayerRegistry", "scenarioSetRegistry",
    "calibrationPolicies", "stateDimensionRegistry", "sourceRefs", "asOf", "limitations", "definitionDigest"
  ]);
  var UNIT_FIELDS = Object.freeze(["unitId", "label", "dimension", "symbol"]);
  var HORIZON_FIELDS = Object.freeze([
    "horizonId", "label", "order", "durationBasis", "startExclusive", "endInclusive",
    "scenarioSetId", "calibrationPolicyId"
  ]);
  var LEVER_FIELDS = Object.freeze([
    "leverId", "label", "description", "unitId", "minimum", "maximum", "step",
    "baselinePath", "targetIds", "ownerAdapterId"
  ]);
  var OFFSET_KIND_FIELDS = Object.freeze(["kindId", "label", "compositionOperatorId", "unitId", "requiredFieldIds"]);
  var ACTOR_REGISTRY_FIELDS = Object.freeze(["actorId", "label", "actorClass"]);
  var POLICY_LAYER_REGISTRY_FIELDS = Object.freeze(["policyLayerId", "label"]);
  var SCENARIO_SET_FIELDS = Object.freeze(["scenarioSetId", "label", "scenarioIds"]);
  var CALIBRATION_POLICY_FIELDS = Object.freeze(["calibrationPolicyId", "outcomeRuleId", "minimumResolvedSample"]);
  var STATE_DIMENSION_FIELDS = Object.freeze(["dimensionId", "label", "allowedStates", "unitId", "ownerRef", "requiredWhen"]);
  var OBSERVATION_SET_FIELDS = Object.freeze([
    "contractVersion", "observationSetId", "topicId", "generationCutoff", "asOf", "availableAt",
    "sourceRefs", "evidenceRefs", "observations", "unavailableStates", "limitations"
  ]);
  var OBSERVATION_FIELDS = Object.freeze([
    "observationId", "state", "quantity", "sourceRefs", "evidenceRefs", "asOf", "availableAt", "limitations"
  ]);
  var UNAVAILABLE_STATE_FIELDS = Object.freeze(["stateId", "reason", "sourceRefs", "evidenceRefs", "asOf", "limitations"]);
  var ADAPTER_OUTPUT_FIELDS = Object.freeze([
    "contractVersion", "topicId", "adapterId", "adapterVersion", "availableAt", "vintageId", "state",
    "predecessorSnapshotRef", "shocks", "offsets", "actors", "actorReactions", "policyActions",
    "restorationConditions", "graph", "scenarioCurves", "findings", "baselineLeverValues", "calibration",
    "limitations"
  ]);
  var SNAPSHOT_FIELDS = Object.freeze([
    "contractVersion", "topicId", "adapterId", "adapterVersion", "resourcePolicyId", "resourcePolicyDigest",
    "definitionDigest", "observationSetDigest", "asOf", "availableAt", "vintageId", "state",
    "predecessorSnapshotRef", "shocks", "offsets", "actors", "actorReactions", "policyActions",
    "restorationConditions", "graph", "scenarioCurves", "findings", "horizonRegistry", "leverRegistry",
    "baselineLeverValues", "calibration", "limitations", "snapshotId", "snapshotDigest"
  ]);
  var QUANTITY_FIELDS = Object.freeze([
    "state", "range", "unitId", "provenanceClass", "sourceRefs", "evidenceRefs", "asOf", "availableAt",
    "vintageId", "limitations", "unavailableReason"
  ]);
  var RANGE_FIELDS = Object.freeze(["low", "base", "high"]);
  var MEASUREMENT_FIELDS = Object.freeze(["value", "unitId"]);
  var SHOCK_FIELDS = Object.freeze([
    "shockId", "predecessorVersionId", "label", "lifecycleState", "startAt", "affectedCapacity",
    "observedLoss", "uncertainty", "repairConditionIds", "sourceRefs", "evidenceRefs", "provenanceClass",
    "asOf", "limitations", "versionId"
  ]);
  var OFFSET_FIELDS = Object.freeze([
    "offsetId", "predecessorVersionId", "shockId", "kindId", "lifecycleState", "capacity",
    "accessibleCapacity", "lag", "expiryAt", "requiredForNet", "unknownCapacityUpperBound",
    "sourceRefs", "evidenceRefs", "asOf", "limitations", "versionId"
  ]);
  var ACTOR_FIELDS = Object.freeze(["actorId", "label", "actorClass", "state", "sourceRefs", "asOf"]);
  var CLAIM_FIELDS = Object.freeze([
    "claimId", "claimClass", "statement", "evidenceGrade", "evidenceBasis", "evidenceRefs", "sourceRefs",
    "asOf", "limitations", "refuterConditionIds"
  ]);
  var REACTION_FIELDS = Object.freeze([
    "reactionId", "predecessorVersionId", "actorId", "lifecycleState", "observedBehavior", "statedIntent",
    "inferredNextAction", "constraints", "falsifiers", "evidenceRefs", "sourceRefs", "asOf", "limitations",
    "versionId"
  ]);
  var POLICY_ACTION_FIELDS = Object.freeze([
    "policyActionId", "predecessorVersionId", "ownerActorId", "lifecycleState", "triggerConditionIds",
    "instrumentId", "amountOrState", "lag", "reversible", "policyLayer", "effects",
    "restorationConditionIds", "evidenceRefs", "sourceRefs", "asOf", "limitations", "versionId"
  ]);
  var EFFECT_FIELDS = Object.freeze(["dimension", "state", "quantity"]);
  var RESTORATION_FIELDS = Object.freeze([
    "conditionId", "predecessorVersionId", "ownerRef", "layer", "state", "observationRule",
    "evidenceRefs", "sourceRefs", "observedAt", "limitations", "versionId"
  ]);
  var GRAPH_FIELDS = Object.freeze(["nodes", "edges", "paths"]);
  var NODE_FIELDS = Object.freeze(["nodeId", "kind", "label", "rank", "horizonId", "layer", "stateRef", "ownerRef"]);
  var EDGE_FIELDS = Object.freeze([
    "edgeId", "predecessorVersionId", "fromNodeId", "toNodeId", "lifecycleState", "sign", "range",
    "unitId", "lag", "persistence", "horizonIds", "evidenceRefs", "sourceRefs", "limitationRefs",
    "refuterConditionIds", "modelOwnerRef", "versionId"
  ]);
  var PATH_FIELDS = Object.freeze([
    "pathId", "predecessorVersionId", "label", "lifecycleState", "edgeIds", "outcomeNodeId",
    "conflictGroupId", "limitations", "versionId"
  ]);
  var FINDING_FIELDS = Object.freeze([
    "findingId", "predecessorVersionId", "lifecycleState", "claim", "publicSubjects", "horizonId",
    "sourceRefs", "provenanceClass", "evidenceRole", "evidenceGrade", "evidenceRefs", "pathIds",
    "causalPath", "refutedBy", "limitations", "triggerConditionIds", "invalidationConditionIds",
    "state", "asOf", "versionId"
  ]);
  var PUBLIC_SUBJECT_FIELDS = Object.freeze(["kind", "value"]);
  var VIEW_STATE_FIELDS = Object.freeze([
    "contractVersion", "topicId", "snapshotId", "definitionDigest", "selectedHorizonId", "projectionClass",
    "availability", "reason", "fieldPath", "baseline", "comparison", "graph", "orderedPaths", "policyRows",
    "scenarioRows", "calibrationRows", "findings", "ownerLinks", "horizonRegistry", "horizonRegistryDigest",
    "leverRegistry", "leverRegistryDigest", "changedLeverIds", "persistable"
  ]);
  var VIEW_BASELINE_FIELDS = Object.freeze(["claims", "edges"]);
  var VIEW_EDGE_FIELDS = Object.freeze([
    "edgeId", "pathId", "order", "sign", "unitId", "range", "lag", "persistence",
    "evidenceRefs", "limitations", "refuters"
  ]);

  function normalizeFieldName(value) {
    return String(value).replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  }

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function compareCodePoints(left, right) {
    var leftPoints = Array.from(left);
    var rightPoints = Array.from(right);
    var length = Math.min(leftPoints.length, rightPoints.length);
    for (var index = 0; index < length; index += 1) {
      var leftCode = leftPoints[index].codePointAt(0);
      var rightCode = rightPoints[index].codePointAt(0);
      if (leftCode !== rightCode) return leftCode - rightCode;
    }
    return leftPoints.length - rightPoints.length;
  }

  function normalizedNumber(value) {
    if (!Number.isFinite(value)) throw new Error("RLSHOCK_NONFINITE_CANONICAL_VALUE");
    if (Object.is(value, -0)) return 0;
    if (Number.isInteger(value)) return value;
    return Number(value.toFixed(12));
  }

  function canonicalize(value) {
    var active = [];
    function encode(current) {
      if (current === null) return "null";
      if (typeof current === "string" || typeof current === "boolean") return JSON.stringify(current);
      if (typeof current === "number") return JSON.stringify(normalizedNumber(current));
      if (Array.isArray(current)) {
        if (active.indexOf(current) !== -1) throw new Error("RLSHOCK_CYCLIC_CANONICAL_VALUE");
        active.push(current);
        var items = [];
        for (var itemIndex = 0; itemIndex < current.length; itemIndex += 1) {
          if (!Object.prototype.hasOwnProperty.call(current, itemIndex)) throw new Error("RLSHOCK_SPARSE_CANONICAL_ARRAY");
          items.push(encode(current[itemIndex]));
        }
        active.pop();
        return "[" + items.join(",") + "]";
      }
      if (isPlainObject(current)) {
        if (active.indexOf(current) !== -1) throw new Error("RLSHOCK_CYCLIC_CANONICAL_VALUE");
        active.push(current);
        var fields = Object.keys(current).sort(compareCodePoints).map(function (key) {
          if (typeof current[key] === "undefined") throw new Error("RLSHOCK_UNDEFINED_CANONICAL_VALUE");
          return JSON.stringify(key) + ":" + encode(current[key]);
        });
        active.pop();
        return "{" + fields.join(",") + "}";
      }
      throw new Error("RLSHOCK_UNSUPPORTED_CANONICAL_VALUE");
    }
    return encode(value);
  }

  function cloneCanonical(value) {
    return JSON.parse(canonicalize(value));
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function utf8Bytes(text) {
    var bytes = [];
    for (var index = 0; index < text.length; index += 1) {
      var codePoint = text.charCodeAt(index);
      if (codePoint >= 0xD800 && codePoint <= 0xDBFF && index + 1 < text.length) {
        var low = text.charCodeAt(index + 1);
        if (low >= 0xDC00 && low <= 0xDFFF) {
          codePoint = ((codePoint - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
          index += 1;
        }
      }
      if (codePoint < 0x80) bytes.push(codePoint);
      else if (codePoint < 0x800) bytes.push(0xC0 | (codePoint >> 6), 0x80 | (codePoint & 0x3F));
      else if (codePoint < 0x10000) bytes.push(0xE0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3F), 0x80 | (codePoint & 0x3F));
      else bytes.push(0xF0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3F), 0x80 | ((codePoint >> 6) & 0x3F), 0x80 | (codePoint & 0x3F));
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
        words[wordIndex] = ((bytes[byteIndex] << 24) | (bytes[byteIndex + 1] << 16) | (bytes[byteIndex + 2] << 8) | bytes[byteIndex + 3]) | 0;
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

  function digest(value) {
    return sha256Text(canonicalize(value));
  }

  function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
  }

  function isKnown(values, value) {
    return values.indexOf(value) !== -1;
  }

  function fieldPath(parent, key) {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
      ? parent + "." + key
      : parent + "[" + JSON.stringify(key) + "]";
  }

  function indexPath(parent, index) {
    return parent + "[" + index + "]";
  }

  function contextOf(value) {
    var topicId = isPlainObject(value) && typeof value.topicId === "string" ? value.topicId : null;
    var recordId = null;
    if (isPlainObject(value)) {
      var candidates = ["snapshotId", "definitionId", "observationSetId", "findingId", "shockId", "edgeId", "pathId"];
      for (var index = 0; index < candidates.length; index += 1) {
        if (typeof value[candidates[index]] === "string") {
          recordId = value[candidates[index]];
          break;
        }
      }
    }
    return { topicId: topicId, recordId: recordId };
  }

  function failure(code, path, reason, value) {
    var context = contextOf(value);
    return deepFreeze({
      ok: false,
      error: {
        contractVersion: CONTRACT_VERSIONS.error,
        code: code,
        fieldPath: path,
        reason: reason,
        topicId: context.topicId,
        recordId: context.recordId,
        valueEchoed: false
      }
    });
  }

  function success(value, extra) {
    var result = { ok: true, value: deepFreeze(cloneCanonical(value)) };
    if (isPlainObject(extra)) Object.keys(extra).forEach(function (key) { result[key] = extra[key]; });
    return deepFreeze(result);
  }

  function shapeFailure(value, path, requiredFields, allowedFields, context) {
    if (!isPlainObject(value)) return failure("RLSHOCK-TYPE", path, "Expected an object.", context);
    var allowed = Object.create(null);
    allowedFields.forEach(function (field) { allowed[field] = true; });
    var unknown = Object.keys(value).filter(function (key) { return !allowed[key]; }).sort(compareCodePoints);
    if (unknown.length > 0) return failure("RLSHOCK-UNKNOWN-MEMBER", fieldPath(path, unknown[0]), "Unknown member.", context);
    for (var index = 0; index < requiredFields.length; index += 1) {
      if (!hasOwn(value, requiredFields[index])) return failure("RLSHOCK-MISSING-MEMBER", fieldPath(path, requiredFields[index]), "Required member is missing.", context);
    }
    return null;
  }

  function privateFieldFailure(value, path, context) {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value)) {
      for (var arrayIndex = 0; arrayIndex < value.length; arrayIndex += 1) {
        var arrayFailure = privateFieldFailure(value[arrayIndex], indexPath(path, arrayIndex), context);
        if (arrayFailure) return arrayFailure;
      }
      return null;
    }
    if (!isPlainObject(value)) return failure("RLSHOCK-TYPE", path, "Public artifacts accept plain JSON objects only.", context);
    var keys = Object.keys(value).sort(compareCodePoints);
    for (var keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
      var key = keys[keyIndex];
      var childPath = fieldPath(path, key);
      if (PRIVATE_FIELD_INDEX[normalizeFieldName(key)]) return failure("RLSHOCK-PUBLIC-PRIVATE", childPath, "Private field is forbidden in a public artifact.", context);
      var childFailure = privateFieldFailure(value[key], childPath, context);
      if (childFailure) return childFailure;
    }
    return null;
  }

  function validateString(value, path, context) {
    if (typeof value !== "string" || value.trim() === "") return failure("RLSHOCK-TYPE", path, "Expected a non-empty string.", context);
    return null;
  }

  function validateId(value, path, context) {
    if (typeof value !== "string" || !ID_PATTERN.test(value)) return failure("RLSHOCK-IDENTITY", path, "Expected a stable lowercase identifier.", context);
    return null;
  }

  function validateDigest(value, path, context) {
    if (typeof value !== "string" || !DIGEST_PATTERN.test(value)) return failure("RLSHOCK-DIGEST", path, "Expected a canonical SHA-256 digest.", context);
    return null;
  }

  function validateInstant(value, path, context, allowNull) {
    if (allowNull && value === null) return null;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) {
      return failure("RLSHOCK-TIME", path, "Expected a canonical UTC instant.", context);
    }
    return null;
  }

  function validateEnum(value, allowed, path, context, code) {
    if (!isKnown(allowed, value)) return failure(code, path, "Value is outside the closed vocabulary.", context);
    return null;
  }

  function validateNumber(value, path, context, integer) {
    if (!Number.isFinite(value) || (integer && !Number.isInteger(value))) return failure("RLSHOCK-TYPE", path, "Expected a finite numeric value.", context);
    return null;
  }

  function validateStringList(value, path, context, nonEmpty) {
    if (!Array.isArray(value)) return failure("RLSHOCK-TYPE", path, "Expected an array.", context);
    if (nonEmpty && value.length === 0) return failure("RLSHOCK-EVIDENCE", path, "At least one value is required.", context);
    var seen = Object.create(null);
    for (var index = 0; index < value.length; index += 1) {
      var itemFailure = validateString(value[index], indexPath(path, index), context);
      if (itemFailure) return itemFailure;
      if (seen[value[index]]) return failure("RLSHOCK-DUPLICATE", indexPath(path, index), "Duplicate member.", context);
      seen[value[index]] = true;
    }
    return null;
  }

  function validateExactIdMap(value, path, ids, context) {
    if (!isPlainObject(value)) return failure("RLSHOCK-TYPE", path, "Expected an id-to-value map.", context);
    var expected = ids.slice().sort(compareCodePoints);
    var actual = Object.keys(value).sort(compareCodePoints);
    for (var actualIndex = 0; actualIndex < actual.length; actualIndex += 1) {
      if (expected.indexOf(actual[actualIndex]) === -1) return failure("RLSHOCK-UNKNOWN-MEMBER", fieldPath(path, actual[actualIndex]), "Unknown registry member.", context);
    }
    for (var expectedIndex = 0; expectedIndex < expected.length; expectedIndex += 1) {
      if (!hasOwn(value, expected[expectedIndex])) return failure("RLSHOCK-MISSING-MEMBER", fieldPath(path, expected[expectedIndex]), "Registry member is missing.", context);
      var numberFailure = validateNumber(value[expected[expectedIndex]], fieldPath(path, expected[expectedIndex]), context, false);
      if (numberFailure) return numberFailure;
    }
    return null;
  }

  function validateRange(value, path, context) {
    var shape = shapeFailure(value, path, RANGE_FIELDS, RANGE_FIELDS, context);
    if (shape) return shape;
    var lowFailure = validateNumber(value.low, fieldPath(path, "low"), context, false);
    if (lowFailure) return failure("RLSHOCK-RANGE", fieldPath(path, "low"), "Range low must be finite.", context);
    var baseFailure = validateNumber(value.base, fieldPath(path, "base"), context, false);
    if (baseFailure) return failure("RLSHOCK-RANGE", fieldPath(path, "base"), "Range base must be finite.", context);
    var highFailure = validateNumber(value.high, fieldPath(path, "high"), context, false);
    if (highFailure) return failure("RLSHOCK-RANGE", fieldPath(path, "high"), "Range high must be finite.", context);
    if (value.low > value.base) return failure("RLSHOCK-RANGE", fieldPath(path, "base"), "Range low exceeds base.", context);
    if (value.base > value.high) return failure("RLSHOCK-RANGE", fieldPath(path, "high"), "Range base exceeds high.", context);
    return null;
  }

  function validateMeasurement(value, path, unitIds, context) {
    var shape = shapeFailure(value, path, MEASUREMENT_FIELDS, MEASUREMENT_FIELDS, context);
    if (shape) return shape;
    var numberFailure = validateNumber(value.value, fieldPath(path, "value"), context, false);
    if (numberFailure) return numberFailure;
    if (unitIds.indexOf(value.unitId) === -1) return failure("RLSHOCK-UNIT", fieldPath(path, "unitId"), "Measurement unit is not declared.", context);
    return null;
  }

  function validateQuantity(value, path, unitIds, context) {
    var shape = shapeFailure(value, path, QUANTITY_FIELDS, QUANTITY_FIELDS, context);
    if (shape) return shape;
    var stateFailure = validateEnum(value.state, QUANTITY_STATES, fieldPath(path, "state"), context, "RLSHOCK-VOCABULARY");
    if (stateFailure) return stateFailure;
    if (unitIds.indexOf(value.unitId) === -1) return failure("RLSHOCK-UNIT", fieldPath(path, "unitId"), "Quantity unit is not declared.", context);
    var provenanceFailure = validateEnum(value.provenanceClass, PROVENANCE_CLASSES, fieldPath(path, "provenanceClass"), context, "RLSHOCK-VOCABULARY");
    if (provenanceFailure) return provenanceFailure;
    var sourceFailure = validateStringList(value.sourceRefs, fieldPath(path, "sourceRefs"), context, value.state !== "unavailable");
    if (sourceFailure) return sourceFailure;
    var evidenceFailure = validateStringList(value.evidenceRefs, fieldPath(path, "evidenceRefs"), context, value.state !== "unavailable");
    if (evidenceFailure) return evidenceFailure;
    var limitationFailure = validateStringList(value.limitations, fieldPath(path, "limitations"), context, value.provenanceClass === "model-estimate" || value.state === "conflicted");
    if (limitationFailure) return limitationFailure;
    var rangeRequired = value.state === "current" || value.state === "conflicted";
    if (rangeRequired) {
      var rangeFailure = validateRange(value.range, fieldPath(path, "range"), context);
      if (rangeFailure) return rangeFailure;
      var asOfFailure = validateInstant(value.asOf, fieldPath(path, "asOf"), context, false);
      if (asOfFailure) return asOfFailure;
      var availableFailure = validateInstant(value.availableAt, fieldPath(path, "availableAt"), context, false);
      if (availableFailure) return availableFailure;
      var vintageFailure = validateId(value.vintageId, fieldPath(path, "vintageId"), context);
      if (vintageFailure) return vintageFailure;
      if (value.unavailableReason !== null) return failure("RLSHOCK-RANGE", fieldPath(path, "unavailableReason"), "Available quantity cannot carry an unavailable reason.", context);
    } else {
      if (value.range !== null) return failure("RLSHOCK-RANGE", fieldPath(path, "range"), "Unavailable quantity cannot carry a numeric range.", context);
      var reasonFailure = validateString(value.unavailableReason, fieldPath(path, "unavailableReason"), context);
      if (reasonFailure) return reasonFailure;
      if (value.asOf !== null) {
        var optionalAsOfFailure = validateInstant(value.asOf, fieldPath(path, "asOf"), context, true);
        if (optionalAsOfFailure) return optionalAsOfFailure;
      }
      if (value.availableAt !== null) {
        var optionalAvailableFailure = validateInstant(value.availableAt, fieldPath(path, "availableAt"), context, true);
        if (optionalAvailableFailure) return optionalAvailableFailure;
      }
      if (value.vintageId !== null) {
        var optionalVintageFailure = validateId(value.vintageId, fieldPath(path, "vintageId"), context);
        if (optionalVintageFailure) return optionalVintageFailure;
      }
    }
    return null;
  }

  function validateVersionedIdentity(value, path, prefix, context) {
    var body = cloneCanonical(value);
    delete body.versionId;
    var expected = prefix + "-" + digest(body).slice(7);
    if (value.versionId !== expected) return failure("RLSHOCK-DIGEST", fieldPath(path, "versionId"), "Version identity does not match canonical content.", context);
    return null;
  }

  function resolveResourcePolicy(config) {
    var blockPath = "$[" + JSON.stringify(CONTRACT_VERSIONS.resourcePolicy) + "]";
    if (!isPlainObject(config)) return failure("RLSHOCK-CONTRACT", "$", "Repository configuration must be an object.", config);
    if (!hasOwn(config, CONTRACT_VERSIONS.resourcePolicy)) return failure("RLSHOCK-MISSING-MEMBER", blockPath, "Required resource policy is missing.", config);
    var policy = config[CONTRACT_VERSIONS.resourcePolicy];
    var shape = shapeFailure(policy, blockPath, RESOURCE_POLICY_FIELDS, RESOURCE_POLICY_FIELDS, policy);
    if (shape) return shape;
    if (policy.contractVersion !== CONTRACT_VERSIONS.resourcePolicy) return failure("RLSHOCK-VERSION-UNSUPPORTED", fieldPath(blockPath, "contractVersion"), "Unsupported resource policy version.", policy);
    if (policy.policyId !== CONTRACT_VERSIONS.resourcePolicy) return failure("RLSHOCK-IDENTITY", fieldPath(blockPath, "policyId"), "Resource policy identity mismatch.", policy);
    if (policy.maxHorizonsPerDefinition !== 48) return failure("RLSHOCK-RESOURCE", fieldPath(blockPath, "maxHorizonsPerDefinition"), "Resource policy must declare the reviewed horizon limit.", policy);
    if (policy.maxGraphNodesPerSnapshot !== 200) return failure("RLSHOCK-RESOURCE", fieldPath(blockPath, "maxGraphNodesPerSnapshot"), "Resource policy must declare the reviewed graph-node limit.", policy);
    var admitted = cloneCanonical(policy);
    return success(admitted, { digest: digest(admitted) });
  }

  function validateDefinitionCandidate(value, resourcePolicy) {
    var context = value;
    var privateFailure = privateFieldFailure(value, "$", context);
    if (privateFailure) return privateFailure;
    var shape = shapeFailure(value, "$", DEFINITION_FIELDS, DEFINITION_FIELDS, context);
    if (shape) return shape;
    if (value.contractVersion !== CONTRACT_VERSIONS.definition) return failure("RLSHOCK-VERSION-UNSUPPORTED", "$.contractVersion", "Unsupported definition version.", context);
    var idFields = ["definitionId", "topicId", "adapterId"];
    for (var idIndex = 0; idIndex < idFields.length; idIndex += 1) {
      var idFailure = validateId(value[idFields[idIndex]], "$." + idFields[idIndex], context);
      if (idFailure) return idFailure;
    }
    if (typeof value.adapterVersion !== "string" || !SEMVER_PATTERN.test(value.adapterVersion)) return failure("RLSHOCK-IDENTITY", "$.adapterVersion", "Adapter version must be semantic.", context);
    if (value.resourcePolicyId !== CONTRACT_VERSIONS.resourcePolicy) return failure("RLSHOCK-REFERENCE", "$.resourcePolicyId", "Definition names an unknown resource policy.", context);
    if (value.resourcePolicyDigest !== digest(resourcePolicy)) return failure("RLSHOCK-DIGEST", "$.resourcePolicyDigest", "Definition resource policy digest mismatch.", context);
    if (!Array.isArray(value.horizonRegistry)) return failure("RLSHOCK-TYPE", "$.horizonRegistry", "Horizon registry must be an array.", context);
    if (value.horizonRegistry.length === 0) return failure("RLSHOCK-RESOURCE", "$.horizonRegistry", "At least one horizon is required.", context);
    if (value.horizonRegistry.length > resourcePolicy.maxHorizonsPerDefinition) {
      return failure("RLSHOCK-RESOURCE", indexPath("$.horizonRegistry", resourcePolicy.maxHorizonsPerDefinition), "Horizon registry exceeds the resolved policy.", context);
    }
    if (value.predecessorDefinitionDigest !== null) {
      var predecessorFailure = validateDigest(value.predecessorDefinitionDigest, "$.predecessorDefinitionDigest", context);
      if (predecessorFailure) return predecessorFailure;
    }
    var sourceFailure = validateStringList(value.sourceRefs, "$.sourceRefs", context, true);
    if (sourceFailure) return sourceFailure;
    var asOfFailure = validateInstant(value.asOf, "$.asOf", context, false);
    if (asOfFailure) return asOfFailure;
    var limitationsFailure = validateStringList(value.limitations, "$.limitations", context, false);
    if (limitationsFailure) return limitationsFailure;

    if (!Array.isArray(value.unitRegistry) || value.unitRegistry.length === 0) return failure("RLSHOCK-UNIT", "$.unitRegistry", "At least one unit is required.", context);
    var unitIds = [];
    for (var unitIndex = 0; unitIndex < value.unitRegistry.length; unitIndex += 1) {
      var unitPath = indexPath("$.unitRegistry", unitIndex);
      var unit = value.unitRegistry[unitIndex];
      var unitShape = shapeFailure(unit, unitPath, UNIT_FIELDS, UNIT_FIELDS, context);
      if (unitShape) return unitShape;
      var unitIdFailure = validateId(unit.unitId, fieldPath(unitPath, "unitId"), context);
      if (unitIdFailure) return unitIdFailure;
      if (unitIds.indexOf(unit.unitId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(unitPath, "unitId"), "Duplicate unit id.", context);
      unitIds.push(unit.unitId);
      var unitLabelFailure = validateString(unit.label, fieldPath(unitPath, "label"), context);
      if (unitLabelFailure) return unitLabelFailure;
      var dimensionFailure = validateEnum(unit.dimension, UNIT_DIMENSIONS, fieldPath(unitPath, "dimension"), context, "RLSHOCK-UNIT");
      if (dimensionFailure) return dimensionFailure;
      var symbolFailure = validateString(unit.symbol, fieldPath(unitPath, "symbol"), context);
      if (symbolFailure) return symbolFailure;
    }

    var horizonIds = [];
    var scenarioSetIds = [];
    var calibrationPolicyIds = [];
    for (var horizonIndex = 0; horizonIndex < value.horizonRegistry.length; horizonIndex += 1) {
      var horizonPath = indexPath("$.horizonRegistry", horizonIndex);
      var horizon = value.horizonRegistry[horizonIndex];
      var horizonShape = shapeFailure(horizon, horizonPath, HORIZON_FIELDS, HORIZON_FIELDS, context);
      if (horizonShape) return horizonShape;
      var horizonIdFailure = validateId(horizon.horizonId, fieldPath(horizonPath, "horizonId"), context);
      if (horizonIdFailure) return horizonIdFailure;
      if (horizonIds.indexOf(horizon.horizonId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(horizonPath, "horizonId"), "Duplicate horizon id.", context);
      horizonIds.push(horizon.horizonId);
      if (horizon.order !== horizonIndex) return failure("RLSHOCK-VOCABULARY", fieldPath(horizonPath, "order"), "Horizon order must be contiguous.", context);
      var horizonLabelFailure = validateString(horizon.label, fieldPath(horizonPath, "label"), context);
      if (horizonLabelFailure) return horizonLabelFailure;
      var basisFailure = validateEnum(horizon.durationBasis, DURATION_BASES, fieldPath(horizonPath, "durationBasis"), context, "RLSHOCK-VOCABULARY");
      if (basisFailure) return basisFailure;
      var startFailure = validateNumber(horizon.startExclusive, fieldPath(horizonPath, "startExclusive"), context, true);
      if (startFailure || horizon.startExclusive < 0) return failure("RLSHOCK-RANGE", fieldPath(horizonPath, "startExclusive"), "Horizon start must be a non-negative integer.", context);
      var endFailure = validateNumber(horizon.endInclusive, fieldPath(horizonPath, "endInclusive"), context, true);
      if (endFailure || horizon.endInclusive <= horizon.startExclusive) return failure("RLSHOCK-RANGE", fieldPath(horizonPath, "endInclusive"), "Horizon end must follow its start.", context);
      var scenarioSetFailure = validateId(horizon.scenarioSetId, fieldPath(horizonPath, "scenarioSetId"), context);
      if (scenarioSetFailure) return scenarioSetFailure;
      var calibrationPolicyFailure = validateId(horizon.calibrationPolicyId, fieldPath(horizonPath, "calibrationPolicyId"), context);
      if (calibrationPolicyFailure) return calibrationPolicyFailure;
      scenarioSetIds.push(horizon.scenarioSetId);
      calibrationPolicyIds.push(horizon.calibrationPolicyId);
    }

    if (!Array.isArray(value.leverRegistry)) return failure("RLSHOCK-TYPE", "$.leverRegistry", "Lever registry must be an array.", context);
    var leverIds = [];
    for (var leverIndex = 0; leverIndex < value.leverRegistry.length; leverIndex += 1) {
      var leverPath = indexPath("$.leverRegistry", leverIndex);
      var lever = value.leverRegistry[leverIndex];
      var leverShape = shapeFailure(lever, leverPath, LEVER_FIELDS, LEVER_FIELDS, context);
      if (leverShape) return leverShape;
      var leverIdFailure = validateId(lever.leverId, fieldPath(leverPath, "leverId"), context);
      if (leverIdFailure) return leverIdFailure;
      if (leverIds.indexOf(lever.leverId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(leverPath, "leverId"), "Duplicate lever id.", context);
      leverIds.push(lever.leverId);
      var leverStringFields = ["label", "description", "baselinePath", "ownerAdapterId"];
      for (var leverStringIndex = 0; leverStringIndex < leverStringFields.length; leverStringIndex += 1) {
        var leverStringFailure = validateString(lever[leverStringFields[leverStringIndex]], fieldPath(leverPath, leverStringFields[leverStringIndex]), context);
        if (leverStringFailure) return leverStringFailure;
      }
      if (unitIds.indexOf(lever.unitId) === -1) return failure("RLSHOCK-UNIT", fieldPath(leverPath, "unitId"), "Lever unit is not declared.", context);
      var minimumFailure = validateNumber(lever.minimum, fieldPath(leverPath, "minimum"), context, false);
      if (minimumFailure) return minimumFailure;
      var maximumFailure = validateNumber(lever.maximum, fieldPath(leverPath, "maximum"), context, false);
      if (maximumFailure || lever.maximum <= lever.minimum) return failure("RLSHOCK-RANGE", fieldPath(leverPath, "maximum"), "Lever maximum must exceed minimum.", context);
      var stepFailure = validateNumber(lever.step, fieldPath(leverPath, "step"), context, false);
      if (stepFailure || lever.step <= 0) return failure("RLSHOCK-RANGE", fieldPath(leverPath, "step"), "Lever step must be positive.", context);
      var targetFailure = validateStringList(lever.targetIds, fieldPath(leverPath, "targetIds"), context, true);
      if (targetFailure) return targetFailure;
    }

    var registryArrayFields = ["offsetKinds", "actorRegistry", "policyLayerRegistry", "scenarioSetRegistry", "calibrationPolicies", "stateDimensionRegistry"];
    for (var registryIndex = 0; registryIndex < registryArrayFields.length; registryIndex += 1) {
      if (!Array.isArray(value[registryArrayFields[registryIndex]])) return failure("RLSHOCK-TYPE", "$." + registryArrayFields[registryIndex], "Registry must be an array.", context);
    }

    var offsetKindIds = [];
    for (var offsetKindIndex = 0; offsetKindIndex < value.offsetKinds.length; offsetKindIndex += 1) {
      var offsetKindPath = indexPath("$.offsetKinds", offsetKindIndex);
      var offsetKind = value.offsetKinds[offsetKindIndex];
      var offsetKindShape = shapeFailure(offsetKind, offsetKindPath, OFFSET_KIND_FIELDS, OFFSET_KIND_FIELDS, context);
      if (offsetKindShape) return offsetKindShape;
      var offsetKindIdFailure = validateId(offsetKind.kindId, fieldPath(offsetKindPath, "kindId"), context);
      if (offsetKindIdFailure) return offsetKindIdFailure;
      if (offsetKindIds.indexOf(offsetKind.kindId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(offsetKindPath, "kindId"), "Duplicate offset kind.", context);
      offsetKindIds.push(offsetKind.kindId);
      if (["subtract-range", "widen-range", "withhold-net"].indexOf(offsetKind.compositionOperatorId) === -1) return failure("RLSHOCK-VOCABULARY", fieldPath(offsetKindPath, "compositionOperatorId"), "Unknown composition operator.", context);
      if (unitIds.indexOf(offsetKind.unitId) === -1) return failure("RLSHOCK-UNIT", fieldPath(offsetKindPath, "unitId"), "Offset-kind unit is not declared.", context);
      var offsetLabelFailure = validateString(offsetKind.label, fieldPath(offsetKindPath, "label"), context);
      if (offsetLabelFailure) return offsetLabelFailure;
      var requiredFieldFailure = validateStringList(offsetKind.requiredFieldIds, fieldPath(offsetKindPath, "requiredFieldIds"), context, false);
      if (requiredFieldFailure) return requiredFieldFailure;
    }

    var actorRegistryIds = [];
    for (var actorRegistryIndex = 0; actorRegistryIndex < value.actorRegistry.length; actorRegistryIndex += 1) {
      var actorRegistryPath = indexPath("$.actorRegistry", actorRegistryIndex);
      var actorRegistryRow = value.actorRegistry[actorRegistryIndex];
      var actorRegistryShape = shapeFailure(actorRegistryRow, actorRegistryPath, ACTOR_REGISTRY_FIELDS, ACTOR_REGISTRY_FIELDS, context);
      if (actorRegistryShape) return actorRegistryShape;
      var actorRegistryIdFailure = validateId(actorRegistryRow.actorId, fieldPath(actorRegistryPath, "actorId"), context);
      if (actorRegistryIdFailure) return actorRegistryIdFailure;
      if (actorRegistryIds.indexOf(actorRegistryRow.actorId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(actorRegistryPath, "actorId"), "Duplicate actor id.", context);
      actorRegistryIds.push(actorRegistryRow.actorId);
      var actorRegistryLabelFailure = validateString(actorRegistryRow.label, fieldPath(actorRegistryPath, "label"), context);
      if (actorRegistryLabelFailure) return actorRegistryLabelFailure;
      var actorRegistryClassFailure = validateEnum(actorRegistryRow.actorClass, ACTOR_CLASSES, fieldPath(actorRegistryPath, "actorClass"), context, "RLSHOCK-VOCABULARY");
      if (actorRegistryClassFailure) return actorRegistryClassFailure;
    }

    var layerIds = [];
    for (var layerIndex = 0; layerIndex < value.policyLayerRegistry.length; layerIndex += 1) {
      var layerPath = indexPath("$.policyLayerRegistry", layerIndex);
      var layer = value.policyLayerRegistry[layerIndex];
      var layerShape = shapeFailure(layer, layerPath, POLICY_LAYER_REGISTRY_FIELDS, POLICY_LAYER_REGISTRY_FIELDS, context);
      if (layerShape) return layerShape;
      var layerIdFailure = validateEnum(layer.policyLayerId, POLICY_LAYERS, fieldPath(layerPath, "policyLayerId"), context, "RLSHOCK-VOCABULARY");
      if (layerIdFailure) return layerIdFailure;
      if (layerIds.indexOf(layer.policyLayerId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(layerPath, "policyLayerId"), "Duplicate policy layer.", context);
      layerIds.push(layer.policyLayerId);
      var layerLabelFailure = validateString(layer.label, fieldPath(layerPath, "label"), context);
      if (layerLabelFailure) return layerLabelFailure;
    }

    var declaredScenarioSetIds = [];
    for (var scenarioSetIndex = 0; scenarioSetIndex < value.scenarioSetRegistry.length; scenarioSetIndex += 1) {
      var scenarioSetPath = indexPath("$.scenarioSetRegistry", scenarioSetIndex);
      var scenarioSet = value.scenarioSetRegistry[scenarioSetIndex];
      var scenarioSetShape = shapeFailure(scenarioSet, scenarioSetPath, SCENARIO_SET_FIELDS, SCENARIO_SET_FIELDS, context);
      if (scenarioSetShape) return scenarioSetShape;
      var scenarioSetIdFailure = validateId(scenarioSet.scenarioSetId, fieldPath(scenarioSetPath, "scenarioSetId"), context);
      if (scenarioSetIdFailure) return scenarioSetIdFailure;
      if (declaredScenarioSetIds.indexOf(scenarioSet.scenarioSetId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(scenarioSetPath, "scenarioSetId"), "Duplicate scenario set.", context);
      declaredScenarioSetIds.push(scenarioSet.scenarioSetId);
      var scenarioSetLabelFailure = validateString(scenarioSet.label, fieldPath(scenarioSetPath, "label"), context);
      if (scenarioSetLabelFailure) return scenarioSetLabelFailure;
      var scenarioIdsFailure = validateStringList(scenarioSet.scenarioIds, fieldPath(scenarioSetPath, "scenarioIds"), context, true);
      if (scenarioIdsFailure) return scenarioIdsFailure;
    }

    var declaredCalibrationPolicyIds = [];
    for (var calibrationIndex = 0; calibrationIndex < value.calibrationPolicies.length; calibrationIndex += 1) {
      var calibrationPath = indexPath("$.calibrationPolicies", calibrationIndex);
      var calibrationPolicy = value.calibrationPolicies[calibrationIndex];
      var calibrationShape = shapeFailure(calibrationPolicy, calibrationPath, CALIBRATION_POLICY_FIELDS, CALIBRATION_POLICY_FIELDS, context);
      if (calibrationShape) return calibrationShape;
      var calibrationIdFailure = validateId(calibrationPolicy.calibrationPolicyId, fieldPath(calibrationPath, "calibrationPolicyId"), context);
      if (calibrationIdFailure) return calibrationIdFailure;
      if (declaredCalibrationPolicyIds.indexOf(calibrationPolicy.calibrationPolicyId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(calibrationPath, "calibrationPolicyId"), "Duplicate calibration policy.", context);
      declaredCalibrationPolicyIds.push(calibrationPolicy.calibrationPolicyId);
      var outcomeRuleFailure = validateId(calibrationPolicy.outcomeRuleId, fieldPath(calibrationPath, "outcomeRuleId"), context);
      if (outcomeRuleFailure) return outcomeRuleFailure;
      var minimumSampleFailure = validateNumber(calibrationPolicy.minimumResolvedSample, fieldPath(calibrationPath, "minimumResolvedSample"), context, true);
      if (minimumSampleFailure || calibrationPolicy.minimumResolvedSample <= 0) return failure("RLSHOCK-CALIBRATION", fieldPath(calibrationPath, "minimumResolvedSample"), "Minimum resolved sample must be positive.", context);
    }

    for (var stateDimensionIndex = 0; stateDimensionIndex < value.stateDimensionRegistry.length; stateDimensionIndex += 1) {
      var stateDimensionPath = indexPath("$.stateDimensionRegistry", stateDimensionIndex);
      var stateDimension = value.stateDimensionRegistry[stateDimensionIndex];
      var stateDimensionShape = shapeFailure(stateDimension, stateDimensionPath, STATE_DIMENSION_FIELDS, STATE_DIMENSION_FIELDS, context);
      if (stateDimensionShape) return stateDimensionShape;
      var dimensionIdFailure = validateId(stateDimension.dimensionId, fieldPath(stateDimensionPath, "dimensionId"), context);
      if (dimensionIdFailure) return dimensionIdFailure;
      var dimensionLabelFailure = validateString(stateDimension.label, fieldPath(stateDimensionPath, "label"), context);
      if (dimensionLabelFailure) return dimensionLabelFailure;
      var allowedStatesFailure = validateStringList(stateDimension.allowedStates, fieldPath(stateDimensionPath, "allowedStates"), context, true);
      if (allowedStatesFailure) return allowedStatesFailure;
      if (unitIds.indexOf(stateDimension.unitId) === -1) return failure("RLSHOCK-UNIT", fieldPath(stateDimensionPath, "unitId"), "State-dimension unit is not declared.", context);
      var ownerFailure = validateId(stateDimension.ownerRef, fieldPath(stateDimensionPath, "ownerRef"), context);
      if (ownerFailure) return ownerFailure;
      var requiredWhenFailure = validateString(stateDimension.requiredWhen, fieldPath(stateDimensionPath, "requiredWhen"), context);
      if (requiredWhenFailure) return requiredWhenFailure;
    }

    for (var horizonRefIndex = 0; horizonRefIndex < value.horizonRegistry.length; horizonRefIndex += 1) {
      if (declaredScenarioSetIds.indexOf(scenarioSetIds[horizonRefIndex]) === -1) return failure("RLSHOCK-REFERENCE", fieldPath(indexPath("$.horizonRegistry", horizonRefIndex), "scenarioSetId"), "Horizon scenario set does not resolve.", context);
      if (declaredCalibrationPolicyIds.indexOf(calibrationPolicyIds[horizonRefIndex]) === -1) return failure("RLSHOCK-REFERENCE", fieldPath(indexPath("$.horizonRegistry", horizonRefIndex), "calibrationPolicyId"), "Horizon calibration policy does not resolve.", context);
    }

    var definitionDigestFailure = validateDigest(value.definitionDigest, "$.definitionDigest", context);
    if (definitionDigestFailure) return definitionDigestFailure;
    var digestBody = cloneCanonical(value);
    delete digestBody.definitionDigest;
    if (value.definitionDigest !== digest(digestBody)) return failure("RLSHOCK-DIGEST", "$.definitionDigest", "Definition digest does not match canonical content.", context);
    return null;
  }

  function validateDefinition(value, resourcePolicy) {
    var failureResult = validateDefinitionCandidate(value, resourcePolicy);
    return failureResult || success(value);
  }

  function validateObservationSetCandidate(value, definition, cutoff) {
    var context = value;
    var privateFailure = privateFieldFailure(value, "$", context);
    if (privateFailure) return privateFailure;
    var shape = shapeFailure(value, "$", OBSERVATION_SET_FIELDS, OBSERVATION_SET_FIELDS, context);
    if (shape) return shape;
    if (value.contractVersion !== CONTRACT_VERSIONS.observationSet) return failure("RLSHOCK-VERSION-UNSUPPORTED", "$.contractVersion", "Unsupported observation-set version.", context);
    var idFailure = validateId(value.observationSetId, "$.observationSetId", context);
    if (idFailure) return idFailure;
    if (value.topicId !== definition.topicId) return failure("RLSHOCK-REFERENCE", "$.topicId", "Observation topic does not match the selected definition.", context);
    var cutoffFailure = validateInstant(value.generationCutoff, "$.generationCutoff", context, false);
    if (cutoffFailure) return cutoffFailure;
    if (value.generationCutoff !== cutoff) return failure("RLSHOCK-VINTAGE", "$.generationCutoff", "Observation cutoff differs from the validated request cutoff.", context);
    var asOfFailure = validateInstant(value.asOf, "$.asOf", context, false);
    if (asOfFailure) return asOfFailure;
    var availableFailure = validateInstant(value.availableAt, "$.availableAt", context, false);
    if (availableFailure) return availableFailure;
    if (Date.parse(value.asOf) > Date.parse(cutoff)) return failure("RLSHOCK-VINTAGE", "$.asOf", "Observation is later than the generation cutoff.", context);
    if (Date.parse(value.availableAt) > Date.parse(cutoff)) return failure("RLSHOCK-VINTAGE", "$.availableAt", "Observation became available after the generation cutoff.", context);
    var sourceFailure = validateStringList(value.sourceRefs, "$.sourceRefs", context, true);
    if (sourceFailure) return sourceFailure;
    var evidenceFailure = validateStringList(value.evidenceRefs, "$.evidenceRefs", context, true);
    if (evidenceFailure) return evidenceFailure;
    var limitationsFailure = validateStringList(value.limitations, "$.limitations", context, false);
    if (limitationsFailure) return limitationsFailure;
    if (!Array.isArray(value.observations) || value.observations.length === 0) return failure("RLSHOCK-EVIDENCE", "$.observations", "At least one observation is required.", context);
    var unitIds = definition.unitRegistry.map(function (row) { return row.unitId; });
    var observationIds = [];
    for (var observationIndex = 0; observationIndex < value.observations.length; observationIndex += 1) {
      var observationPath = indexPath("$.observations", observationIndex);
      var observation = value.observations[observationIndex];
      var observationShape = shapeFailure(observation, observationPath, OBSERVATION_FIELDS, OBSERVATION_FIELDS, context);
      if (observationShape) return observationShape;
      var observationIdFailure = validateId(observation.observationId, fieldPath(observationPath, "observationId"), context);
      if (observationIdFailure) return observationIdFailure;
      if (observationIds.indexOf(observation.observationId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(observationPath, "observationId"), "Duplicate observation id.", context);
      observationIds.push(observation.observationId);
      var observationStateFailure = validateEnum(observation.state, QUANTITY_STATES, fieldPath(observationPath, "state"), context, "RLSHOCK-VOCABULARY");
      if (observationStateFailure) return observationStateFailure;
      var quantityFailure = validateQuantity(observation.quantity, fieldPath(observationPath, "quantity"), unitIds, context);
      if (quantityFailure) return quantityFailure;
      var observationSourceFailure = validateStringList(observation.sourceRefs, fieldPath(observationPath, "sourceRefs"), context, true);
      if (observationSourceFailure) return observationSourceFailure;
      var observationEvidenceFailure = validateStringList(observation.evidenceRefs, fieldPath(observationPath, "evidenceRefs"), context, true);
      if (observationEvidenceFailure) return observationEvidenceFailure;
      var observationAsOfFailure = validateInstant(observation.asOf, fieldPath(observationPath, "asOf"), context, false);
      if (observationAsOfFailure) return observationAsOfFailure;
      var observationAvailableFailure = validateInstant(observation.availableAt, fieldPath(observationPath, "availableAt"), context, false);
      if (observationAvailableFailure) return observationAvailableFailure;
      if (Date.parse(observation.availableAt) > Date.parse(cutoff)) return failure("RLSHOCK-VINTAGE", fieldPath(observationPath, "availableAt"), "Observation became available after the cutoff.", context);
      var observationLimitationsFailure = validateStringList(observation.limitations, fieldPath(observationPath, "limitations"), context, false);
      if (observationLimitationsFailure) return observationLimitationsFailure;
    }
    if (!Array.isArray(value.unavailableStates)) return failure("RLSHOCK-TYPE", "$.unavailableStates", "Unavailable states must be an array.", context);
    for (var unavailableIndex = 0; unavailableIndex < value.unavailableStates.length; unavailableIndex += 1) {
      var unavailablePath = indexPath("$.unavailableStates", unavailableIndex);
      var unavailable = value.unavailableStates[unavailableIndex];
      var unavailableShape = shapeFailure(unavailable, unavailablePath, UNAVAILABLE_STATE_FIELDS, UNAVAILABLE_STATE_FIELDS, context);
      if (unavailableShape) return unavailableShape;
      var unavailableIdFailure = validateId(unavailable.stateId, fieldPath(unavailablePath, "stateId"), context);
      if (unavailableIdFailure) return unavailableIdFailure;
      var unavailableReasonFailure = validateString(unavailable.reason, fieldPath(unavailablePath, "reason"), context);
      if (unavailableReasonFailure) return unavailableReasonFailure;
      var unavailableSourceFailure = validateStringList(unavailable.sourceRefs, fieldPath(unavailablePath, "sourceRefs"), context, false);
      if (unavailableSourceFailure) return unavailableSourceFailure;
      var unavailableEvidenceFailure = validateStringList(unavailable.evidenceRefs, fieldPath(unavailablePath, "evidenceRefs"), context, false);
      if (unavailableEvidenceFailure) return unavailableEvidenceFailure;
      var unavailableAsOfFailure = validateInstant(unavailable.asOf, fieldPath(unavailablePath, "asOf"), context, true);
      if (unavailableAsOfFailure) return unavailableAsOfFailure;
      var unavailableLimitationsFailure = validateStringList(unavailable.limitations, fieldPath(unavailablePath, "limitations"), context, true);
      if (unavailableLimitationsFailure) return unavailableLimitationsFailure;
    }
    return null;
  }

  function validateObservationSet(value, definition, cutoff) {
    if (!isPlainObject(definition)) return failure("RLSHOCK-CONTRACT", "$", "A validated definition is required.", definition);
    if (definition.contractVersion !== CONTRACT_VERSIONS.definition) return failure("RLSHOCK-VERSION-UNSUPPORTED", "$.contractVersion", "Unsupported definition version.", definition);
    var failureResult = validateObservationSetCandidate(value, definition, cutoff);
    return failureResult || success(value, { digest: digest(value) });
  }

  function validateClaim(value, path, context) {
    var shape = shapeFailure(value, path, CLAIM_FIELDS, CLAIM_FIELDS, context);
    if (shape) return shape;
    var idFailure = validateId(value.claimId, fieldPath(path, "claimId"), context);
    if (idFailure) return idFailure;
    var classFailure = validateEnum(value.claimClass, CLAIM_CLASSES, fieldPath(path, "claimClass"), context, "RLSHOCK-VOCABULARY");
    if (classFailure) return classFailure;
    var statementFailure = validateString(value.statement, fieldPath(path, "statement"), context);
    if (statementFailure) return statementFailure;
    var gradeFailure = validateEnum(value.evidenceGrade, EVIDENCE_GRADES, fieldPath(path, "evidenceGrade"), context, "RLSHOCK-EVIDENCE");
    if (gradeFailure) return gradeFailure;
    var basisFailure = validateString(value.evidenceBasis, fieldPath(path, "evidenceBasis"), context);
    if (basisFailure) return basisFailure;
    var evidenceFailure = validateStringList(value.evidenceRefs, fieldPath(path, "evidenceRefs"), context, true);
    if (evidenceFailure) return evidenceFailure;
    var sourceFailure = validateStringList(value.sourceRefs, fieldPath(path, "sourceRefs"), context, true);
    if (sourceFailure) return sourceFailure;
    var instantFailure = validateInstant(value.asOf, fieldPath(path, "asOf"), context, false);
    if (instantFailure) return instantFailure;
    var inferred = value.claimClass === "model-inference" || value.claimClass === "analyst-analogy";
    var limitationsFailure = validateStringList(value.limitations, fieldPath(path, "limitations"), context, inferred);
    if (limitationsFailure) return limitationsFailure;
    var refuterFailure = validateStringList(value.refuterConditionIds, fieldPath(path, "refuterConditionIds"), context, inferred);
    if (refuterFailure) return refuterFailure;
    return null;
  }

  function validateShock(value, path, unitIds, context) {
    var shape = shapeFailure(value, path, SHOCK_FIELDS, SHOCK_FIELDS, context);
    if (shape) return shape;
    var idFailure = validateId(value.shockId, fieldPath(path, "shockId"), context);
    if (idFailure) return idFailure;
    if (value.predecessorVersionId !== null) {
      var predecessorFailure = validateId(value.predecessorVersionId, fieldPath(path, "predecessorVersionId"), context);
      if (predecessorFailure) return predecessorFailure;
    }
    var labelFailure = validateString(value.label, fieldPath(path, "label"), context);
    if (labelFailure) return labelFailure;
    var lifecycleFailure = validateEnum(value.lifecycleState, SHOCK_STATES, fieldPath(path, "lifecycleState"), context, "RLSHOCK-LIFECYCLE");
    if (lifecycleFailure) return lifecycleFailure;
    var startFailure = validateInstant(value.startAt, fieldPath(path, "startAt"), context, false);
    if (startFailure) return startFailure;
    var quantityFields = ["affectedCapacity", "observedLoss", "uncertainty"];
    for (var quantityIndex = 0; quantityIndex < quantityFields.length; quantityIndex += 1) {
      var quantityFailure = validateQuantity(value[quantityFields[quantityIndex]], fieldPath(path, quantityFields[quantityIndex]), unitIds, context);
      if (quantityFailure) return quantityFailure;
    }
    var repairFailure = validateStringList(value.repairConditionIds, fieldPath(path, "repairConditionIds"), context, true);
    if (repairFailure) return repairFailure;
    var sourceFailure = validateStringList(value.sourceRefs, fieldPath(path, "sourceRefs"), context, true);
    if (sourceFailure) return sourceFailure;
    var evidenceFailure = validateStringList(value.evidenceRefs, fieldPath(path, "evidenceRefs"), context, true);
    if (evidenceFailure) return evidenceFailure;
    var provenanceFailure = validateEnum(value.provenanceClass, PROVENANCE_CLASSES, fieldPath(path, "provenanceClass"), context, "RLSHOCK-VOCABULARY");
    if (provenanceFailure) return provenanceFailure;
    var asOfFailure = validateInstant(value.asOf, fieldPath(path, "asOf"), context, false);
    if (asOfFailure) return asOfFailure;
    var limitationFailure = validateStringList(value.limitations, fieldPath(path, "limitations"), context, false);
    if (limitationFailure) return limitationFailure;
    return validateVersionedIdentity(value, path, "shock-version", context);
  }

  function validateOffset(value, path, unitIds, definition, context) {
    var shape = shapeFailure(value, path, OFFSET_FIELDS, OFFSET_FIELDS, context);
    if (shape) return shape;
    var idFields = ["offsetId", "shockId"];
    for (var idIndex = 0; idIndex < idFields.length; idIndex += 1) {
      var idFailure = validateId(value[idFields[idIndex]], fieldPath(path, idFields[idIndex]), context);
      if (idFailure) return idFailure;
    }
    if (value.predecessorVersionId !== null) {
      var predecessorFailure = validateId(value.predecessorVersionId, fieldPath(path, "predecessorVersionId"), context);
      if (predecessorFailure) return predecessorFailure;
    }
    var extensionKinds = definition.offsetKinds.map(function (row) { return row.kindId; });
    if (FOUNDATION_OFFSET_KINDS.concat(extensionKinds).indexOf(value.kindId) === -1) return failure("RLSHOCK-VOCABULARY", fieldPath(path, "kindId"), "Offset kind is not declared.", context);
    var lifecycleFailure = validateEnum(value.lifecycleState, OFFSET_STATES, fieldPath(path, "lifecycleState"), context, "RLSHOCK-LIFECYCLE");
    if (lifecycleFailure) return lifecycleFailure;
    var capacityFailure = validateQuantity(value.capacity, fieldPath(path, "capacity"), unitIds, context);
    if (capacityFailure) return capacityFailure;
    var accessibleFailure = validateQuantity(value.accessibleCapacity, fieldPath(path, "accessibleCapacity"), unitIds, context);
    if (accessibleFailure) return accessibleFailure;
    var lagFailure = validateMeasurement(value.lag, fieldPath(path, "lag"), unitIds, context);
    if (lagFailure) return lagFailure;
    var expiryFailure = validateInstant(value.expiryAt, fieldPath(path, "expiryAt"), context, true);
    if (expiryFailure) return expiryFailure;
    if (typeof value.requiredForNet !== "boolean") return failure("RLSHOCK-TYPE", fieldPath(path, "requiredForNet"), "Required-for-net must be boolean.", context);
    if (value.unknownCapacityUpperBound !== null) {
      var upperBoundFailure = validateQuantity(value.unknownCapacityUpperBound, fieldPath(path, "unknownCapacityUpperBound"), unitIds, context);
      if (upperBoundFailure) return upperBoundFailure;
    }
    if (value.requiredForNet && value.accessibleCapacity.state === "unavailable" && value.unknownCapacityUpperBound === null) {
      return failure("RLSHOCK-RANGE", fieldPath(path, "unknownCapacityUpperBound"), "A required unavailable offset needs a source-qualified upper bound before net publication.", context);
    }
    var sourceFailure = validateStringList(value.sourceRefs, fieldPath(path, "sourceRefs"), context, true);
    if (sourceFailure) return sourceFailure;
    var evidenceFailure = validateStringList(value.evidenceRefs, fieldPath(path, "evidenceRefs"), context, true);
    if (evidenceFailure) return evidenceFailure;
    var asOfFailure = validateInstant(value.asOf, fieldPath(path, "asOf"), context, false);
    if (asOfFailure) return asOfFailure;
    var limitationsFailure = validateStringList(value.limitations, fieldPath(path, "limitations"), context, false);
    if (limitationsFailure) return limitationsFailure;
    return validateVersionedIdentity(value, path, "offset-version", context);
  }

  function validateActor(value, path, context) {
    var shape = shapeFailure(value, path, ACTOR_FIELDS, ACTOR_FIELDS, context);
    if (shape) return shape;
    var idFailure = validateId(value.actorId, fieldPath(path, "actorId"), context);
    if (idFailure) return idFailure;
    var labelFailure = validateString(value.label, fieldPath(path, "label"), context);
    if (labelFailure) return labelFailure;
    var classFailure = validateEnum(value.actorClass, ACTOR_CLASSES, fieldPath(path, "actorClass"), context, "RLSHOCK-VOCABULARY");
    if (classFailure) return classFailure;
    var stateFailure = validateEnum(value.state, ACTOR_STATES, fieldPath(path, "state"), context, "RLSHOCK-LIFECYCLE");
    if (stateFailure) return stateFailure;
    var sourceFailure = validateStringList(value.sourceRefs, fieldPath(path, "sourceRefs"), context, true);
    if (sourceFailure) return sourceFailure;
    return validateInstant(value.asOf, fieldPath(path, "asOf"), context, false);
  }

  function validateReaction(value, path, context) {
    var shape = shapeFailure(value, path, REACTION_FIELDS, REACTION_FIELDS, context);
    if (shape) return shape;
    var idFields = ["reactionId", "actorId"];
    for (var idIndex = 0; idIndex < idFields.length; idIndex += 1) {
      var idFailure = validateId(value[idFields[idIndex]], fieldPath(path, idFields[idIndex]), context);
      if (idFailure) return idFailure;
    }
    if (value.predecessorVersionId !== null) {
      var predecessorFailure = validateId(value.predecessorVersionId, fieldPath(path, "predecessorVersionId"), context);
      if (predecessorFailure) return predecessorFailure;
    }
    var lifecycleFailure = validateEnum(value.lifecycleState, REACTION_STATES, fieldPath(path, "lifecycleState"), context, "RLSHOCK-LIFECYCLE");
    if (lifecycleFailure) return lifecycleFailure;
    var claimCollections = ["observedBehavior", "statedIntent", "inferredNextAction", "constraints", "falsifiers"];
    for (var collectionIndex = 0; collectionIndex < claimCollections.length; collectionIndex += 1) {
      var collectionName = claimCollections[collectionIndex];
      if (!Array.isArray(value[collectionName])) return failure("RLSHOCK-TYPE", fieldPath(path, collectionName), "Claim collection must be an array.", context);
      for (var claimIndex = 0; claimIndex < value[collectionName].length; claimIndex += 1) {
        var claimPath = indexPath(fieldPath(path, collectionName), claimIndex);
        var claimFailure = validateClaim(value[collectionName][claimIndex], claimPath, context);
        if (claimFailure) return claimFailure;
        var claimClass = value[collectionName][claimIndex].claimClass;
        if (collectionName === "observedBehavior" && claimClass !== "observed-fact") return failure("RLSHOCK-EVIDENCE", fieldPath(claimPath, "claimClass"), "Observed behavior requires observed-fact claims.", context);
        if (collectionName === "statedIntent" && claimClass !== "stated-intent") return failure("RLSHOCK-EVIDENCE", fieldPath(claimPath, "claimClass"), "Stated intent requires stated-intent claims.", context);
        if (collectionName === "inferredNextAction" && ["model-inference", "analyst-analogy"].indexOf(claimClass) === -1) return failure("RLSHOCK-EVIDENCE", fieldPath(claimPath, "claimClass"), "Inferred action requires an inference claim.", context);
      }
    }
    var evidenceFailure = validateStringList(value.evidenceRefs, fieldPath(path, "evidenceRefs"), context, true);
    if (evidenceFailure) return evidenceFailure;
    var sourceFailure = validateStringList(value.sourceRefs, fieldPath(path, "sourceRefs"), context, true);
    if (sourceFailure) return sourceFailure;
    var asOfFailure = validateInstant(value.asOf, fieldPath(path, "asOf"), context, false);
    if (asOfFailure) return asOfFailure;
    var limitationsFailure = validateStringList(value.limitations, fieldPath(path, "limitations"), context, false);
    if (limitationsFailure) return limitationsFailure;
    return validateVersionedIdentity(value, path, "reaction-version", context);
  }

  function validateRestoration(value, path, context) {
    var shape = shapeFailure(value, path, RESTORATION_FIELDS, RESTORATION_FIELDS, context);
    if (shape) return shape;
    var idFields = ["conditionId", "ownerRef"];
    for (var idIndex = 0; idIndex < idFields.length; idIndex += 1) {
      var idFailure = validateId(value[idFields[idIndex]], fieldPath(path, idFields[idIndex]), context);
      if (idFailure) return idFailure;
    }
    if (value.predecessorVersionId !== null) {
      var predecessorFailure = validateId(value.predecessorVersionId, fieldPath(path, "predecessorVersionId"), context);
      if (predecessorFailure) return predecessorFailure;
    }
    var layerFailure = validateEnum(value.layer, POLICY_LAYERS, fieldPath(path, "layer"), context, "RLSHOCK-POLICY-AUTHORITY");
    if (layerFailure) return layerFailure;
    var stateFailure = validateEnum(value.state, RESTORATION_STATES, fieldPath(path, "state"), context, "RLSHOCK-LIFECYCLE");
    if (stateFailure) return stateFailure;
    var ruleFailure = validateString(value.observationRule, fieldPath(path, "observationRule"), context);
    if (ruleFailure) return ruleFailure;
    var evidenceFailure = validateStringList(value.evidenceRefs, fieldPath(path, "evidenceRefs"), context, true);
    if (evidenceFailure) return evidenceFailure;
    var sourceFailure = validateStringList(value.sourceRefs, fieldPath(path, "sourceRefs"), context, true);
    if (sourceFailure) return sourceFailure;
    var observedFailure = validateInstant(value.observedAt, fieldPath(path, "observedAt"), context, true);
    if (observedFailure) return observedFailure;
    var limitationsFailure = validateStringList(value.limitations, fieldPath(path, "limitations"), context, false);
    if (limitationsFailure) return limitationsFailure;
    return validateVersionedIdentity(value, path, "restoration-version", context);
  }

  function validatePolicyAction(value, path, unitIds, actorIds, declaredLayerIds, context) {
    var shape = shapeFailure(value, path, POLICY_ACTION_FIELDS, POLICY_ACTION_FIELDS, context);
    if (shape) return shape;
    var idFields = ["policyActionId", "ownerActorId", "instrumentId"];
    for (var idIndex = 0; idIndex < idFields.length; idIndex += 1) {
      var idFailure = validateId(value[idFields[idIndex]], fieldPath(path, idFields[idIndex]), context);
      if (idFailure) return idFailure;
    }
    if (actorIds.indexOf(value.ownerActorId) === -1) return failure("RLSHOCK-POLICY-AUTHORITY", fieldPath(path, "ownerActorId"), "Policy owner does not resolve to a declared actor.", context);
    if (value.predecessorVersionId !== null) {
      var predecessorFailure = validateId(value.predecessorVersionId, fieldPath(path, "predecessorVersionId"), context);
      if (predecessorFailure) return predecessorFailure;
    }
    var lifecycleFailure = validateEnum(value.lifecycleState, POLICY_STATES, fieldPath(path, "lifecycleState"), context, "RLSHOCK-LIFECYCLE");
    if (lifecycleFailure) return lifecycleFailure;
    var triggerFailure = validateStringList(value.triggerConditionIds, fieldPath(path, "triggerConditionIds"), context, true);
    if (triggerFailure) return triggerFailure;
    var amountFailure = validateQuantity(value.amountOrState, fieldPath(path, "amountOrState"), unitIds, context);
    if (amountFailure) return amountFailure;
    var lagFailure = validateMeasurement(value.lag, fieldPath(path, "lag"), unitIds, context);
    if (lagFailure) return lagFailure;
    if (typeof value.reversible !== "boolean") return failure("RLSHOCK-TYPE", fieldPath(path, "reversible"), "Reversibility must be boolean.", context);
    var layerFailure = validateEnum(value.policyLayer, POLICY_LAYERS, fieldPath(path, "policyLayer"), context, "RLSHOCK-POLICY-AUTHORITY");
    if (layerFailure) return layerFailure;
    if (declaredLayerIds.indexOf(value.policyLayer) === -1) return failure("RLSHOCK-POLICY-AUTHORITY", fieldPath(path, "policyLayer"), "Policy layer is not declared by the selected definition.", context);
    if (!Array.isArray(value.effects) || value.effects.length === 0) return failure("RLSHOCK-POLICY-AUTHORITY", fieldPath(path, "effects"), "At least one policy effect is required.", context);
    for (var effectIndex = 0; effectIndex < value.effects.length; effectIndex += 1) {
      var effectPath = indexPath(fieldPath(path, "effects"), effectIndex);
      var effect = value.effects[effectIndex];
      var effectShape = shapeFailure(effect, effectPath, EFFECT_FIELDS, EFFECT_FIELDS, context);
      if (effectShape) return effectShape;
      var effectDimensionFailure = validateEnum(effect.dimension, EFFECT_DIMENSIONS, fieldPath(effectPath, "dimension"), context, "RLSHOCK-POLICY-AUTHORITY");
      if (effectDimensionFailure) return effectDimensionFailure;
      var effectStateFailure = validateEnum(effect.state, QUANTITY_STATES, fieldPath(effectPath, "state"), context, "RLSHOCK-VOCABULARY");
      if (effectStateFailure) return effectStateFailure;
      if (effect.quantity !== null) {
        var effectQuantityFailure = validateQuantity(effect.quantity, fieldPath(effectPath, "quantity"), unitIds, context);
        if (effectQuantityFailure) return effectQuantityFailure;
      } else if (effect.state !== "unavailable") return failure("RLSHOCK-RANGE", fieldPath(effectPath, "quantity"), "Available effect requires a quantity.", context);
    }
    var restorationFailure = validateStringList(value.restorationConditionIds, fieldPath(path, "restorationConditionIds"), context, true);
    if (restorationFailure) return restorationFailure;
    var evidenceFailure = validateStringList(value.evidenceRefs, fieldPath(path, "evidenceRefs"), context, true);
    if (evidenceFailure) return evidenceFailure;
    var sourceFailure = validateStringList(value.sourceRefs, fieldPath(path, "sourceRefs"), context, true);
    if (sourceFailure) return sourceFailure;
    var asOfFailure = validateInstant(value.asOf, fieldPath(path, "asOf"), context, false);
    if (asOfFailure) return asOfFailure;
    var limitationsFailure = validateStringList(value.limitations, fieldPath(path, "limitations"), context, false);
    if (limitationsFailure) return limitationsFailure;
    return validateVersionedIdentity(value, path, "policy-version", context);
  }

  function validateNode(value, path, horizonIds, context) {
    var shape = shapeFailure(value, path, NODE_FIELDS, NODE_FIELDS, context);
    if (shape) return shape;
    var idFailure = validateId(value.nodeId, fieldPath(path, "nodeId"), context);
    if (idFailure) return idFailure;
    var kindFailure = validateEnum(value.kind, NODE_KINDS, fieldPath(path, "kind"), context, "RLSHOCK-VOCABULARY");
    if (kindFailure) return kindFailure;
    var labelFailure = validateString(value.label, fieldPath(path, "label"), context);
    if (labelFailure) return labelFailure;
    var rankFailure = validateNumber(value.rank, fieldPath(path, "rank"), context, true);
    if (rankFailure || value.rank < 0) return failure("RLSHOCK-GRAPH-CYCLE", fieldPath(path, "rank"), "Node rank must be non-negative.", context);
    if (horizonIds.indexOf(value.horizonId) === -1) return failure("RLSHOCK-REFERENCE", fieldPath(path, "horizonId"), "Node horizon does not resolve.", context);
    var layerFailure = validateEnum(value.layer, POLICY_LAYERS, fieldPath(path, "layer"), context, "RLSHOCK-POLICY-AUTHORITY");
    if (layerFailure) return layerFailure;
    var stateFailure = validateId(value.stateRef, fieldPath(path, "stateRef"), context);
    if (stateFailure) return stateFailure;
    return validateId(value.ownerRef, fieldPath(path, "ownerRef"), context);
  }

  function validateEdge(value, path, unitIds, horizonIds, context) {
    var shape = shapeFailure(value, path, EDGE_FIELDS, EDGE_FIELDS, context);
    if (shape) return shape;
    var idFields = ["edgeId", "fromNodeId", "toNodeId", "modelOwnerRef"];
    for (var idIndex = 0; idIndex < idFields.length; idIndex += 1) {
      var idFailure = validateId(value[idFields[idIndex]], fieldPath(path, idFields[idIndex]), context);
      if (idFailure) return idFailure;
    }
    if (value.predecessorVersionId !== null) {
      var predecessorFailure = validateId(value.predecessorVersionId, fieldPath(path, "predecessorVersionId"), context);
      if (predecessorFailure) return predecessorFailure;
    }
    var lifecycleFailure = validateEnum(value.lifecycleState, EDGE_STATES, fieldPath(path, "lifecycleState"), context, "RLSHOCK-LIFECYCLE");
    if (lifecycleFailure) return lifecycleFailure;
    var signFailure = validateEnum(value.sign, EDGE_SIGNS, fieldPath(path, "sign"), context, "RLSHOCK-SIGN");
    if (signFailure) return signFailure;
    var rangeFailure = validateRange(value.range, fieldPath(path, "range"), context);
    if (rangeFailure) return rangeFailure;
    if (unitIds.indexOf(value.unitId) === -1) return failure("RLSHOCK-UNIT", fieldPath(path, "unitId"), "Edge unit is not declared.", context);
    if (value.sign === "positive" && value.range.low < 0) return failure("RLSHOCK-SIGN", fieldPath(path, "sign"), "Positive edge cannot have a negative low value.", context);
    if (value.sign === "negative" && value.range.high > 0) return failure("RLSHOCK-SIGN", fieldPath(path, "sign"), "Negative edge cannot have a positive high value.", context);
    if (value.sign === "mixed" && !(value.range.low < 0 && value.range.high > 0)) {
      return failure("RLSHOCK-SIGN", fieldPath(path, "sign"), "Mixed edge must cross zero.", context);
    }
    if (value.sign === "zero" && !(value.range.low === 0 && value.range.base === 0 && value.range.high === 0)) {
      return failure("RLSHOCK-SIGN", fieldPath(path, "sign"), "Zero edge must contain only zero.", context);
    }
    var lagFailure = validateMeasurement(value.lag, fieldPath(path, "lag"), unitIds, context);
    if (lagFailure) return lagFailure;
    var persistenceFailure = validateMeasurement(value.persistence, fieldPath(path, "persistence"), unitIds, context);
    if (persistenceFailure) return persistenceFailure;
    var horizonFailure = validateStringList(value.horizonIds, fieldPath(path, "horizonIds"), context, true);
    if (horizonFailure) return horizonFailure;
    for (var horizonIndex = 0; horizonIndex < value.horizonIds.length; horizonIndex += 1) {
      if (horizonIds.indexOf(value.horizonIds[horizonIndex]) === -1) return failure("RLSHOCK-REFERENCE", indexPath(fieldPath(path, "horizonIds"), horizonIndex), "Edge horizon does not resolve.", context);
    }
    var listFields = ["evidenceRefs", "sourceRefs", "limitationRefs", "refuterConditionIds"];
    for (var listIndex = 0; listIndex < listFields.length; listIndex += 1) {
      var listFailure = validateStringList(value[listFields[listIndex]], fieldPath(path, listFields[listIndex]), context, true);
      if (listFailure) return listFailure;
    }
    return validateVersionedIdentity(value, path, "edge-version", context);
  }

  function validatePathRecord(value, path, context) {
    var shape = shapeFailure(value, path, PATH_FIELDS, PATH_FIELDS, context);
    if (shape) return shape;
    var idFields = ["pathId", "outcomeNodeId"];
    for (var idIndex = 0; idIndex < idFields.length; idIndex += 1) {
      var idFailure = validateId(value[idFields[idIndex]], fieldPath(path, idFields[idIndex]), context);
      if (idFailure) return idFailure;
    }
    if (value.predecessorVersionId !== null) {
      var predecessorFailure = validateId(value.predecessorVersionId, fieldPath(path, "predecessorVersionId"), context);
      if (predecessorFailure) return predecessorFailure;
    }
    var labelFailure = validateString(value.label, fieldPath(path, "label"), context);
    if (labelFailure) return labelFailure;
    var lifecycleFailure = validateEnum(value.lifecycleState, PATH_STATES, fieldPath(path, "lifecycleState"), context, "RLSHOCK-LIFECYCLE");
    if (lifecycleFailure) return lifecycleFailure;
    var edgesFailure = validateStringList(value.edgeIds, fieldPath(path, "edgeIds"), context, true);
    if (edgesFailure) return edgesFailure;
    if (value.conflictGroupId !== null) {
      var conflictFailure = validateId(value.conflictGroupId, fieldPath(path, "conflictGroupId"), context);
      if (conflictFailure) return conflictFailure;
    }
    var limitationsFailure = validateStringList(value.limitations, fieldPath(path, "limitations"), context, false);
    if (limitationsFailure) return limitationsFailure;
    return validateVersionedIdentity(value, path, "path-version", context);
  }

  function validateFinding(value, path, horizonIds, context) {
    var shape = shapeFailure(value, path, FINDING_FIELDS, FINDING_FIELDS, context);
    if (shape) return shape;
    var idFailure = validateId(value.findingId, fieldPath(path, "findingId"), context);
    if (idFailure) return idFailure;
    if (value.predecessorVersionId !== null) {
      var predecessorFailure = validateId(value.predecessorVersionId, fieldPath(path, "predecessorVersionId"), context);
      if (predecessorFailure) return predecessorFailure;
    }
    var lifecycleFailure = validateEnum(value.lifecycleState, FINDING_LIFECYCLES, fieldPath(path, "lifecycleState"), context, "RLSHOCK-LIFECYCLE");
    if (lifecycleFailure) return lifecycleFailure;
    var claimFailure = validateString(value.claim, fieldPath(path, "claim"), context);
    if (claimFailure) return claimFailure;
    if (!Array.isArray(value.publicSubjects) || value.publicSubjects.length === 0) return failure("RLSHOCK-EVIDENCE", fieldPath(path, "publicSubjects"), "At least one public subject is required.", context);
    for (var subjectIndex = 0; subjectIndex < value.publicSubjects.length; subjectIndex += 1) {
      var subjectPath = indexPath(fieldPath(path, "publicSubjects"), subjectIndex);
      var subject = value.publicSubjects[subjectIndex];
      var subjectShape = shapeFailure(subject, subjectPath, PUBLIC_SUBJECT_FIELDS, PUBLIC_SUBJECT_FIELDS, context);
      if (subjectShape) return subjectShape;
      var kindFailure = validateEnum(subject.kind, PUBLIC_SUBJECT_KINDS, fieldPath(subjectPath, "kind"), context, "RLSHOCK-PUBLIC-PRIVATE");
      if (kindFailure) return kindFailure;
      var valueFailure = validateString(subject.value, fieldPath(subjectPath, "value"), context);
      if (valueFailure) return valueFailure;
    }
    if (horizonIds.indexOf(value.horizonId) === -1) return failure("RLSHOCK-REFERENCE", fieldPath(path, "horizonId"), "Finding horizon does not resolve.", context);
    var sourceFailure = validateStringList(value.sourceRefs, fieldPath(path, "sourceRefs"), context, true);
    if (sourceFailure) return sourceFailure;
    var provenanceFailure = validateEnum(value.provenanceClass, PROVENANCE_CLASSES, fieldPath(path, "provenanceClass"), context, "RLSHOCK-VOCABULARY");
    if (provenanceFailure) return provenanceFailure;
    var roleFailure = validateEnum(value.evidenceRole, EVIDENCE_ROLES, fieldPath(path, "evidenceRole"), context, "RLSHOCK-EVIDENCE");
    if (roleFailure) return roleFailure;
    var gradeFailure = validateEnum(value.evidenceGrade, EVIDENCE_GRADES, fieldPath(path, "evidenceGrade"), context, "RLSHOCK-EVIDENCE");
    if (gradeFailure) return gradeFailure;
    var listFields = ["evidenceRefs", "pathIds", "causalPath", "refutedBy", "limitations", "triggerConditionIds", "invalidationConditionIds"];
    for (var listIndex = 0; listIndex < listFields.length; listIndex += 1) {
      var listFailure = validateStringList(value[listFields[listIndex]], fieldPath(path, listFields[listIndex]), context, true);
      if (listFailure) return listFailure;
    }
    var stateFailure = validateEnum(value.state, FINDING_STATES, fieldPath(path, "state"), context, "RLSHOCK-LIFECYCLE");
    if (stateFailure) return stateFailure;
    var asOfFailure = validateInstant(value.asOf, fieldPath(path, "asOf"), context, false);
    if (asOfFailure) return asOfFailure;
    return validateVersionedIdentity(value, path, "finding-version", context);
  }

  function validatePrimitiveEnvelope(value, definition, resourcePolicy, rootFields, expectedVersion) {
    var context = value;
    var privateFailure = privateFieldFailure(value, "$", context);
    if (privateFailure) return privateFailure;
    var shape = shapeFailure(value, "$", rootFields, rootFields, context);
    if (shape) return shape;
    if (value.contractVersion !== expectedVersion) return failure("RLSHOCK-VERSION-UNSUPPORTED", "$.contractVersion", "Unsupported contract version.", context);
    if (value.topicId !== definition.topicId) return failure("RLSHOCK-REFERENCE", "$.topicId", "Topic does not match the selected definition.", context);
    if (value.adapterId !== definition.adapterId) return failure("RLSHOCK-REFERENCE", "$.adapterId", "Adapter does not match the selected definition.", context);
    if (value.adapterVersion !== definition.adapterVersion) return failure("RLSHOCK-VERSION-MIXED", "$.adapterVersion", "Adapter version does not match the selected definition.", context);
    var availableFailure = validateInstant(value.availableAt, "$.availableAt", context, false);
    if (availableFailure) return availableFailure;
    var vintageFailure = validateId(value.vintageId, "$.vintageId", context);
    if (vintageFailure) return vintageFailure;
    var stateFailure = validateEnum(value.state, ["current", "stale", "unavailable", "conflicted"], "$.state", context, "RLSHOCK-LIFECYCLE");
    if (stateFailure) return stateFailure;
    if (value.predecessorSnapshotRef !== null && !isPlainObject(value.predecessorSnapshotRef)) return failure("RLSHOCK-REFERENCE", "$.predecessorSnapshotRef", "Predecessor snapshot ref must be null or an object.", context);
    var arrayFields = ["shocks", "offsets", "actors", "actorReactions", "policyActions", "restorationConditions", "scenarioCurves", "findings", "calibration"];
    for (var arrayIndex = 0; arrayIndex < arrayFields.length; arrayIndex += 1) {
      if (!Array.isArray(value[arrayFields[arrayIndex]])) return failure("RLSHOCK-TYPE", "$." + arrayFields[arrayIndex], "Expected an array.", context);
    }
    if (!isPlainObject(value.graph)) return failure("RLSHOCK-TYPE", "$.graph", "Expected a graph object.", context);
    var graphShape = shapeFailure(value.graph, "$.graph", GRAPH_FIELDS, GRAPH_FIELDS, context);
    if (graphShape) return graphShape;
    if (!Array.isArray(value.graph.nodes) || !Array.isArray(value.graph.edges) || !Array.isArray(value.graph.paths)) return failure("RLSHOCK-TYPE", "$.graph", "Graph collections must be arrays.", context);
    if (value.graph.nodes.length > resourcePolicy.maxGraphNodesPerSnapshot) return failure("RLSHOCK-RESOURCE", indexPath("$.graph.nodes", resourcePolicy.maxGraphNodesPerSnapshot), "Graph node count exceeds the resolved policy.", context);
    var unitIds = definition.unitRegistry.map(function (row) { return row.unitId; });
    var horizonIds = definition.horizonRegistry.map(function (row) { return row.horizonId; });

    for (var shockIndex = 0; shockIndex < value.shocks.length; shockIndex += 1) {
      var shockFailure = validateShock(value.shocks[shockIndex], indexPath("$.shocks", shockIndex), unitIds, context);
      if (shockFailure) return shockFailure;
    }
    for (var offsetIndex = 0; offsetIndex < value.offsets.length; offsetIndex += 1) {
      var offsetPath = indexPath("$.offsets", offsetIndex);
      var offsetFailure = validateOffset(value.offsets[offsetIndex], offsetPath, unitIds, definition, context);
      if (offsetFailure) return offsetFailure;
    }
    var actorIds = [];
    for (var actorIndex = 0; actorIndex < value.actors.length; actorIndex += 1) {
      var actorFailure = validateActor(value.actors[actorIndex], indexPath("$.actors", actorIndex), context);
      if (actorFailure) return actorFailure;
      if (actorIds.indexOf(value.actors[actorIndex].actorId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(indexPath("$.actors", actorIndex), "actorId"), "Duplicate actor id.", context);
      actorIds.push(value.actors[actorIndex].actorId);
    }
    for (var reactionIndex = 0; reactionIndex < value.actorReactions.length; reactionIndex += 1) {
      var reactionFailure = validateReaction(value.actorReactions[reactionIndex], indexPath("$.actorReactions", reactionIndex), context);
      if (reactionFailure) return reactionFailure;
    }
    var declaredLayerIds = definition.policyLayerRegistry.map(function (row) { return row.policyLayerId; });
    for (var policyIndex = 0; policyIndex < value.policyActions.length; policyIndex += 1) {
      var policyFailure = validatePolicyAction(value.policyActions[policyIndex], indexPath("$.policyActions", policyIndex), unitIds, actorIds, declaredLayerIds, context);
      if (policyFailure) return policyFailure;
    }
    for (var restorationIndex = 0; restorationIndex < value.restorationConditions.length; restorationIndex += 1) {
      var restorationFailure = validateRestoration(value.restorationConditions[restorationIndex], indexPath("$.restorationConditions", restorationIndex), context);
      if (restorationFailure) return restorationFailure;
    }

    var nodeIds = [];
    var nodeRanks = Object.create(null);
    for (var nodeIndex = 0; nodeIndex < value.graph.nodes.length; nodeIndex += 1) {
      var nodePath = indexPath("$.graph.nodes", nodeIndex);
      var nodeFailure = validateNode(value.graph.nodes[nodeIndex], nodePath, horizonIds, context);
      if (nodeFailure) return nodeFailure;
      if (nodeIds.indexOf(value.graph.nodes[nodeIndex].nodeId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(nodePath, "nodeId"), "Duplicate graph node.", context);
      nodeIds.push(value.graph.nodes[nodeIndex].nodeId);
      nodeRanks[value.graph.nodes[nodeIndex].nodeId] = value.graph.nodes[nodeIndex].rank;
    }
    var edgeIds = [];
    var edgesById = Object.create(null);
    for (var edgeIndex = 0; edgeIndex < value.graph.edges.length; edgeIndex += 1) {
      var edgePath = indexPath("$.graph.edges", edgeIndex);
      var edge = value.graph.edges[edgeIndex];
      var edgeFailure = validateEdge(edge, edgePath, unitIds, horizonIds, context);
      if (edgeFailure) return edgeFailure;
      if (edgeIds.indexOf(edge.edgeId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(edgePath, "edgeId"), "Duplicate graph edge.", context);
      edgeIds.push(edge.edgeId);
      edgesById[edge.edgeId] = edge;
      if (nodeIds.indexOf(edge.fromNodeId) === -1) return failure("RLSHOCK-GRAPH-ENDPOINT", fieldPath(edgePath, "fromNodeId"), "Edge source node does not resolve.", context);
      if (nodeIds.indexOf(edge.toNodeId) === -1) return failure("RLSHOCK-GRAPH-ENDPOINT", fieldPath(edgePath, "toNodeId"), "Edge target node does not resolve.", context);
      if (nodeRanks[edge.fromNodeId] >= nodeRanks[edge.toNodeId]) return failure("RLSHOCK-GRAPH-CYCLE", fieldPath(edgePath, "toNodeId"), "Edge rank must increase.", context);
    }
    var pathIds = [];
    for (var pathIndex = 0; pathIndex < value.graph.paths.length; pathIndex += 1) {
      var graphPathPath = indexPath("$.graph.paths", pathIndex);
      var graphPath = value.graph.paths[pathIndex];
      var graphPathFailure = validatePathRecord(graphPath, graphPathPath, context);
      if (graphPathFailure) return graphPathFailure;
      if (pathIds.indexOf(graphPath.pathId) !== -1) return failure("RLSHOCK-DUPLICATE", fieldPath(graphPathPath, "pathId"), "Duplicate path id.", context);
      pathIds.push(graphPath.pathId);
      var priorEdge = null;
      for (var pathEdgeIndex = 0; pathEdgeIndex < graphPath.edgeIds.length; pathEdgeIndex += 1) {
        var selectedEdge = edgesById[graphPath.edgeIds[pathEdgeIndex]];
        if (!selectedEdge) return failure("RLSHOCK-GRAPH-PATH", indexPath(fieldPath(graphPathPath, "edgeIds"), pathEdgeIndex), "Path edge does not resolve.", context);
        if (priorEdge && priorEdge.toNodeId !== selectedEdge.fromNodeId) return failure("RLSHOCK-GRAPH-PATH", indexPath(fieldPath(graphPathPath, "edgeIds"), pathEdgeIndex), "Path edges are discontinuous.", context);
        priorEdge = selectedEdge;
      }
      if (!priorEdge || priorEdge.toNodeId !== graphPath.outcomeNodeId) return failure("RLSHOCK-GRAPH-PATH", fieldPath(graphPathPath, "outcomeNodeId"), "Path does not reach its outcome.", context);
    }

    for (var findingIndex = 0; findingIndex < value.findings.length; findingIndex += 1) {
      var findingFailure = validateFinding(value.findings[findingIndex], indexPath("$.findings", findingIndex), horizonIds, context);
      if (findingFailure) return findingFailure;
    }
    for (var curveIndex = 0; curveIndex < value.scenarioCurves.length; curveIndex += 1) {
      if (!isPlainObject(value.scenarioCurves[curveIndex])) return failure("RLSHOCK-TYPE", indexPath("$.scenarioCurves", curveIndex), "Scenario curve must be an object.", context);
    }
    for (var calibrationIndex = 0; calibrationIndex < value.calibration.length; calibrationIndex += 1) {
      if (!isPlainObject(value.calibration[calibrationIndex])) return failure("RLSHOCK-TYPE", indexPath("$.calibration", calibrationIndex), "Calibration row must be an object.", context);
    }
    var leverMapFailure = validateExactIdMap(value.baselineLeverValues, "$.baselineLeverValues", definition.leverRegistry.map(function (row) { return row.leverId; }), context);
    if (leverMapFailure) return leverMapFailure;
    var limitationsFailure = validateStringList(value.limitations, "$.limitations", context, false);
    if (limitationsFailure) return limitationsFailure;
    return null;
  }

  function validateAdapterOutputCandidate(value, definition, resourcePolicy) {
    return validatePrimitiveEnvelope(value, definition, resourcePolicy, ADAPTER_OUTPUT_FIELDS, CONTRACT_VERSIONS.adapterOutput);
  }

  function validateAdapterOutput(value, definition, resourcePolicy) {
    var failureResult = validateAdapterOutputCandidate(value, definition, resourcePolicy);
    return failureResult || success(value, { digest: digest(value) });
  }

  function validateSnapshotCandidate(value, definition, resourcePolicy) {
    var context = value;
    var privateFailure = privateFieldFailure(value, "$", context);
    if (privateFailure) return privateFailure;
    var shape = shapeFailure(value, "$", SNAPSHOT_FIELDS, SNAPSHOT_FIELDS, context);
    if (shape) return shape;
    if (value.contractVersion !== CONTRACT_VERSIONS.snapshot) return failure("RLSHOCK-VERSION-UNSUPPORTED", "$.contractVersion", "Unsupported snapshot version.", context);
    if (value.resourcePolicyId !== CONTRACT_VERSIONS.resourcePolicy) return failure("RLSHOCK-REFERENCE", "$.resourcePolicyId", "Snapshot resource policy identity mismatch.", context);
    if (value.resourcePolicyDigest !== digest(resourcePolicy)) return failure("RLSHOCK-DIGEST", "$.resourcePolicyDigest", "Snapshot resource policy digest mismatch.", context);
    if (value.definitionDigest !== definition.definitionDigest) return failure("RLSHOCK-DIGEST", "$.definitionDigest", "Snapshot definition digest mismatch.", context);
    if (!isPlainObject(value.graph)) return failure("RLSHOCK-TYPE", "$.graph", "Expected a graph object.", context);
    var graphShape = shapeFailure(value.graph, "$.graph", GRAPH_FIELDS, GRAPH_FIELDS, context);
    if (graphShape) return graphShape;
    if (!Array.isArray(value.graph.nodes)) return failure("RLSHOCK-TYPE", "$.graph.nodes", "Graph nodes must be an array.", context);
    if (value.graph.nodes.length > resourcePolicy.maxGraphNodesPerSnapshot) return failure("RLSHOCK-RESOURCE", indexPath("$.graph.nodes", resourcePolicy.maxGraphNodesPerSnapshot), "Graph node count exceeds the resolved policy.", context);
    var primitiveFailure = validatePrimitiveEnvelope(value, definition, resourcePolicy, SNAPSHOT_FIELDS, CONTRACT_VERSIONS.snapshot);
    if (primitiveFailure) return primitiveFailure;
    var digestFields = ["observationSetDigest", "snapshotDigest"];
    for (var digestIndex = 0; digestIndex < digestFields.length; digestIndex += 1) {
      var digestFailure = validateDigest(value[digestFields[digestIndex]], "$." + digestFields[digestIndex], context);
      if (digestFailure) return digestFailure;
    }
    var asOfFailure = validateInstant(value.asOf, "$.asOf", context, false);
    if (asOfFailure) return asOfFailure;
    if (Date.parse(value.availableAt) < Date.parse(value.asOf)) return failure("RLSHOCK-TIME", "$.availableAt", "Snapshot cannot be available before its as-of time.", context);
    for (var horizonIndex = 0; horizonIndex < value.horizonRegistry.length; horizonIndex += 1) {
      var horizonPath = indexPath("$.horizonRegistry", horizonIndex);
      var horizonShape = shapeFailure(value.horizonRegistry[horizonIndex], horizonPath, HORIZON_FIELDS, HORIZON_FIELDS, context);
      if (horizonShape) return horizonShape;
    }
    for (var leverIndex = 0; leverIndex < value.leverRegistry.length; leverIndex += 1) {
      var leverPath = indexPath("$.leverRegistry", leverIndex);
      var leverShape = shapeFailure(value.leverRegistry[leverIndex], leverPath, LEVER_FIELDS, LEVER_FIELDS, context);
      if (leverShape) return leverShape;
    }
    if (canonicalize(value.horizonRegistry) !== canonicalize(definition.horizonRegistry)) return failure("RLSHOCK-DIGEST", "$.horizonRegistry", "Snapshot horizon registry differs from the definition.", context);
    if (canonicalize(value.leverRegistry) !== canonicalize(definition.leverRegistry)) return failure("RLSHOCK-DIGEST", "$.leverRegistry", "Snapshot lever registry differs from the definition.", context);
    var identityBody = cloneCanonical(value);
    delete identityBody.snapshotId;
    delete identityBody.snapshotDigest;
    var expectedDigest = digest(identityBody);
    if (value.snapshotDigest !== expectedDigest) return failure("RLSHOCK-DIGEST", "$.snapshotDigest", "Snapshot digest does not match canonical content.", context);
    var expectedId = "shock-snapshot-" + expectedDigest.slice(7);
    if (value.snapshotId !== expectedId) return failure("RLSHOCK-DIGEST", "$.snapshotId", "Snapshot id does not match canonical content.", context);
    return null;
  }

  function validateSnapshot(value, definition, resourcePolicy) {
    var failureResult = validateSnapshotCandidate(value, definition, resourcePolicy);
    return failureResult || success(value);
  }

  function composeSnapshot(definition, observationSet, adapterOutput, resourcePolicy) {
    var definitionResult = validateDefinition(definition, resourcePolicy);
    if (!definitionResult.ok) return definitionResult;
    var observationResult = validateObservationSetCandidate(observationSet, definitionResult.value, observationSet && observationSet.generationCutoff);
    if (observationResult) return observationResult;
    var adapterResult = validateAdapterOutput(adapterOutput, definitionResult.value, resourcePolicy);
    if (!adapterResult.ok) return adapterResult;
    var output = adapterResult.value;
    var snapshotBody = {
      contractVersion: CONTRACT_VERSIONS.snapshot,
      topicId: definitionResult.value.topicId,
      adapterId: definitionResult.value.adapterId,
      adapterVersion: definitionResult.value.adapterVersion,
      resourcePolicyId: resourcePolicy.policyId,
      resourcePolicyDigest: digest(resourcePolicy),
      definitionDigest: definitionResult.value.definitionDigest,
      observationSetDigest: digest(observationSet),
      asOf: observationSet.asOf,
      availableAt: output.availableAt,
      vintageId: output.vintageId,
      state: output.state,
      predecessorSnapshotRef: output.predecessorSnapshotRef,
      shocks: output.shocks,
      offsets: output.offsets,
      actors: output.actors,
      actorReactions: output.actorReactions,
      policyActions: output.policyActions,
      restorationConditions: output.restorationConditions,
      graph: output.graph,
      scenarioCurves: output.scenarioCurves,
      findings: output.findings,
      horizonRegistry: definitionResult.value.horizonRegistry,
      leverRegistry: definitionResult.value.leverRegistry,
      baselineLeverValues: output.baselineLeverValues,
      calibration: output.calibration,
      limitations: output.limitations
    };
    var snapshotDigest = digest(snapshotBody);
    var snapshot = cloneCanonical(snapshotBody);
    snapshot.snapshotId = "shock-snapshot-" + snapshotDigest.slice(7);
    snapshot.snapshotDigest = snapshotDigest;
    var validation = validateSnapshot(snapshot, definitionResult.value, resourcePolicy);
    return validation.ok ? success(validation.value) : validation;
  }

  function validateViewEnvelope(value) {
    var privateFailure = privateFieldFailure(value, "$", value);
    if (privateFailure) return privateFailure;
    var shape = shapeFailure(value, "$", VIEW_STATE_FIELDS, VIEW_STATE_FIELDS, value);
    if (shape) return shape;
    if (value.contractVersion !== CONTRACT_VERSIONS.viewState) return failure("RLSHOCK-VERSION-UNSUPPORTED", "$.contractVersion", "Unsupported view-state version.", value);
    var baselineShape = shapeFailure(value.baseline, "$.baseline", VIEW_BASELINE_FIELDS, VIEW_BASELINE_FIELDS, value);
    if (baselineShape) return baselineShape;
    if (!Array.isArray(value.baseline.claims)) return failure("RLSHOCK-TYPE", "$.baseline.claims", "Claims must be an array.", value);
    if (!Array.isArray(value.baseline.edges)) return failure("RLSHOCK-TYPE", "$.baseline.edges", "Edges must be an array.", value);
    return null;
  }

  function projectClaimRows(viewState) {
    var envelopeFailure = validateViewEnvelope(viewState);
    if (envelopeFailure) return envelopeFailure;
    var rows = [];
    for (var claimIndex = 0; claimIndex < viewState.baseline.claims.length; claimIndex += 1) {
      var claimPath = indexPath("$.baseline.claims", claimIndex);
      var claim = viewState.baseline.claims[claimIndex];
      var claimFailure = validateClaim(claim, claimPath, viewState);
      if (claimFailure) return claimFailure;
      var visibleLabel = claim.claimClass === "observed-fact" ? "Observed fact"
        : (claim.claimClass === "model-inference" || claim.claimClass === "analyst-analogy" ? "Model inference" : claim.claimClass);
      rows.push({
        contractVersion: CONTRACT_VERSIONS.claimRow,
        claimId: claim.claimId,
        claimClass: claim.claimClass,
        visibleLabel: visibleLabel,
        evidenceGrade: claim.evidenceGrade,
        evidenceBasis: claim.evidenceBasis,
        sourceRefs: claim.sourceRefs,
        asOf: claim.asOf,
        limitations: claim.limitations,
        refuters: claim.refuterConditionIds
      });
    }
    return success(rows);
  }

  function projectEdgeRows(viewState) {
    var envelopeFailure = validateViewEnvelope(viewState);
    if (envelopeFailure) return envelopeFailure;
    var rows = [];
    for (var edgeIndex = 0; edgeIndex < viewState.baseline.edges.length; edgeIndex += 1) {
      var edgePath = indexPath("$.baseline.edges", edgeIndex);
      var edge = viewState.baseline.edges[edgeIndex];
      if (!isPlainObject(edge)) return failure("RLSHOCK-PROJECTION-LOSSY", edgePath, "Edge projection input must be an object.", viewState);
      for (var fieldIndex = 0; fieldIndex < VIEW_EDGE_FIELDS.length; fieldIndex += 1) {
        if (!hasOwn(edge, VIEW_EDGE_FIELDS[fieldIndex])) return failure("RLSHOCK-PROJECTION-LOSSY", fieldPath(edgePath, VIEW_EDGE_FIELDS[fieldIndex]), "Edge projection qualifier is missing.", viewState);
      }
      var edgeShape = shapeFailure(edge, edgePath, VIEW_EDGE_FIELDS, VIEW_EDGE_FIELDS, viewState);
      if (edgeShape) return edgeShape;
      var rangeFailure = validateRange(edge.range, fieldPath(edgePath, "range"), viewState);
      if (rangeFailure) return rangeFailure;
      var signFailure = validateEnum(edge.sign, EDGE_SIGNS, fieldPath(edgePath, "sign"), viewState, "RLSHOCK-SIGN");
      if (signFailure) return signFailure;
      var evidenceFailure = validateStringList(edge.evidenceRefs, fieldPath(edgePath, "evidenceRefs"), viewState, true);
      if (evidenceFailure) return failure("RLSHOCK-PROJECTION-LOSSY", fieldPath(edgePath, "evidenceRefs"), "Edge evidence is missing.", viewState);
      var limitationsFailure = validateStringList(edge.limitations, fieldPath(edgePath, "limitations"), viewState, true);
      if (limitationsFailure) return failure("RLSHOCK-PROJECTION-LOSSY", fieldPath(edgePath, "limitations"), "Edge limitation is missing.", viewState);
      var refuterFailure = validateStringList(edge.refuters, fieldPath(edgePath, "refuters"), viewState, true);
      if (refuterFailure) return failure("RLSHOCK-PROJECTION-LOSSY", fieldPath(edgePath, "refuters"), "Edge refuter is missing.", viewState);
      rows.push({
        contractVersion: CONTRACT_VERSIONS.edgeRow,
        edgeId: edge.edgeId,
        pathId: edge.pathId,
        order: edge.order,
        sign: edge.sign,
        unitId: edge.unitId,
        low: edge.range.low,
        base: edge.range.base,
        high: edge.range.high,
        lag: edge.lag,
        persistence: edge.persistence,
        evidenceRefs: edge.evidenceRefs,
        limitations: edge.limitations,
        refuters: edge.refuters
      });
    }
    return success(rows);
  }

  function readerSentence(errorValue) {
    var error = isPlainObject(errorValue) && isPlainObject(errorValue.error) ? errorValue.error : errorValue;
    if (!isPlainObject(error)) return failure("RLSHOCK-CONTRACT", "$", "Reader error must be an object.", errorValue);
    if (error.contractVersion !== CONTRACT_VERSIONS.error) return failure("RLSHOCK-VERSION-UNSUPPORTED", "$.contractVersion", "Reader error uses an unsupported version.", error);
    if (typeof error.fieldPath !== "string" || error.fieldPath.trim() === "") return failure("RLSHOCK-MISSING-MEMBER", "$.fieldPath", "A v2 refusal requires a machine field path.", error);
    var reasonFailure = validateString(error.reason, "$.reason", error);
    if (reasonFailure) return reasonFailure;
    return error.reason + " Machine path: " + error.fieldPath + ".";
  }

  return deepFreeze({
    CONTRACT_VERSIONS: CONTRACT_VERSIONS,
    ERROR_CODES: ERROR_CODES,
    CLAIM_CLASSES: CLAIM_CLASSES,
    UNIT_DIMENSIONS: UNIT_DIMENSIONS,
    EDGE_SIGNS: EDGE_SIGNS,
    canonicalize: canonicalize,
    digest: digest,
    resolveResourcePolicy: resolveResourcePolicy,
    validateDefinition: validateDefinition,
    validateObservationSet: validateObservationSet,
    validateAdapterOutput: validateAdapterOutput,
    composeSnapshot: composeSnapshot,
    validateSnapshot: validateSnapshot,
    projectClaimRows: projectClaimRows,
    projectEdgeRows: projectEdgeRows,
    readerSentence: readerSentence
  });
});
