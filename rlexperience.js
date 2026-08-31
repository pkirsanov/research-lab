(function (factory) {
  "use strict";

  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLEXPERIENCE_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLEXPERIENCE = api;
})(function () {
  "use strict";

  var EXPERIENCE_ERROR_KEYS = [
    "contractVersion", "code", "phase", "toolId", "contractId", "reason",
    "fieldPath", "recoverable", "dependencyGateId", "valueEchoed"
  ];
  var REFUSAL_CODES = [
    "E012-REGISTRY", "E012-VIEWSET", "E012-VIEW-TARGET",
    "E012-SIMPLE-DEFINITION", "E012-SIMPLE-INPUT",
    "E012-SIMPLE-NONDETERMINISTIC", "E012-SIMPLE-NO-EFFECT",
    "E012-CONTEXT-MISSING", "E012-WEB-POLICY", "E012-WEB-ROBOTS",
    "E012-WEB-BUDGET", "E012-WEB-UNSAFE", "E012-WEB-CORROBORATION",
    "E012-AUTHOR-BOUNDARY", "E012-JOURNEY-DEFINITION",
    "E012-JOURNEY-STORE", "E012-JOURNEY-STALE",
    "E012-REDALERT-QUALIFICATION", "E012-PRIVACY", "E012-DEPENDENCY",
    "E012-PUBLICATION", "E012-VERSION"
  ];
  var CONFIG_KEYS = [
    "contractVersion", "viewSets", "routingPolicy", "adapterPolicy",
    "registries", "contextPolicy", "journeyStoragePolicy", "redAlertPolicy",
    "matrixPolicy", "dependencyGates", "performanceBudgets", "artifactBudgets",
    "migrationPolicy", "refusalCodes"
  ];
  var VIEW_SET_KEYS = ["viewSetId", "kind", "registryToolId", "viewIds", "labels", "defaultViewId"];
  var EXPERIENCE_KEYS = [
    "contractVersion", "kind", "viewSetId", "viewIds",
    "simpleModelDefinitionId", "simpleAdapterId", "simpleAdapterModule",
    "powerAdapterId", "briefPolicyId", "journeyDefinitionIds",
    "contextPolicyId", "matrixDomains", "publicAliases"
  ];
  var MODEL_KEYS = [
    "contractVersion", "definitionId", "toolId", "modelId", "modelVersion",
    "researchQuestion", "resultSchemaId", "adapterId", "adapterModule",
    "inputRequirements", "parameterDefinitions", "scenarioDefinitions",
    "seedPolicy", "sensitivityPolicy", "calibrationPolicy", "provenancePolicy",
    "performancePolicy", "limitations", "deepLinkTargets", "definitionFingerprint"
  ];
  var PARAMETER_KEYS = [
    "parameterId", "label", "kind", "unit", "domain", "defaultValue",
    "defaultSource", "interpretation", "affectsOutputPaths", "disabledWhen",
    "identityBearing"
  ];
  var JOURNEY_DEFINITION_KEYS = [
    "contractVersion", "definitionId", "definitionVersion", "toolId", "goalId",
    "title", "outcomeDescription", "mechanism", "prerequisiteRules",
    "contextSchema", "stepIds", "evidencePolicy", "backtrackPolicy",
    "staleEvidencePolicy", "completionPolicy", "packetPolicy", "privacyClass",
    "noExecution", "accessibility", "limitations", "definitionFingerprint"
  ];
  var JOURNEY_STEP_KEYS = [
    "contractVersion", "stepId", "definitionId", "title", "purpose",
    "mechanismRole", "dependsOnStepIds", "inputSchema", "allowedInputProvenance",
    "requiredEvidenceSlots", "optionalEvidenceSlots", "completionPredicate",
    "branchRules", "staleWhen", "invalidatesStepIds", "ownerDeepLinks",
    "sideEffectPolicy", "accessibility", "stepFingerprint"
  ];
  var COMPLETION_PREDICATES = [
    "all-required-evidence-current", "explicit-choice-recorded",
    "scenario-comparison-complete", "branch-terminal-reached"
  ];
  var MECHANISMS = ["wizard", "checklist", "decision-tree", "scenario-lab", "composition"];
  var SIMPLE_TRUTH_STATES = Object.freeze([
    "ready", "partial", "stale", "unavailable", "disputed", "rejected"
  ]);
  /* Reader-facing wording for a non-ready result. The truth state itself stays machine-readable
     on data-rlexperience-simple-state; only the prose changes. */
  var SIMPLE_STATE_HEADING = Object.freeze({
    partial: "Partial result",
    stale: "Result may be out of date",
    unavailable: "No result yet",
    disputed: "Sources disagree",
    rejected: "Result rejected"
  });
  var SIMPLE_EVIDENCE_KEYS = [
    "contractVersion", "toolId", "state", "evidenceCutoff", "evidenceRefs",
    "parameterValues", "assumptions", "limitations", "invalidationConditions",
    "evidenceIdentity"
  ];
  var SIMPLE_EVIDENCE_REF_KEYS = [
    "requirementId", "evidenceRef", "semanticFingerprint", "sourceClass",
    "observedAsOf", "retrievedOrPublishedAt", "freshness", "dataTier",
    "valueState"
  ];
  var SIMPLE_ADAPTER_KEYS = [
    "contractVersion", "adapterId", "supportedDefinitionIds",
    "validateDefinition", "captureEvidence", "normalizeInputs", "compute",
    "compareSensitivity", "projectOwnerEvidence"
  ];
  var TOOL_CONTROL_STATE_KEYS = [
    "contractVersion", "toolId", "revision", "parameterValues",
    "ownerDecisionId", "evidenceIdentity", "evidenceCutoff"
  ];
  var TOOL_CONTROL_FACTORY_KEYS = [
    "initialState", "parameterDefinitions", "commitHandler", "notifySubscribers"
  ];
  var TOOL_CONTROL_CHANGE_KEYS = ["parameterId", "value", "expectedRevision"];
  var TOOL_CONTROL_OWNER_RESULT_KEYS = [
    "contractVersion", "toolId", "parameterValues", "ownerDecisionId",
    "evidenceIdentity", "evidenceCutoff"
  ];
  var SAFE_MODULE_PATTERN = /^rlexperience-adapters\/[a-z0-9-]+\.js$/;
  var ID_PATTERN = /^[a-z0-9]+(?:[a-z0-9/-]*[a-z0-9])?$/;

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function canonicalize(value) {
    var active = [];

    function encode(current) {
      if (current === null) return "null";
      if (typeof current === "string" || typeof current === "boolean") return JSON.stringify(current);
      if (typeof current === "number") {
        if (!Number.isFinite(current)) throw new Error("RLEXPERIENCE_NONFINITE_CANONICAL_VALUE");
        return JSON.stringify(current);
      }
      if (Array.isArray(current)) {
        if (active.indexOf(current) !== -1) throw new Error("RLEXPERIENCE_CYCLIC_CANONICAL_VALUE");
        active.push(current);
        var items = current.map(encode);
        active.pop();
        return "[" + items.join(",") + "]";
      }
      if (isPlainObject(current)) {
        if (active.indexOf(current) !== -1) throw new Error("RLEXPERIENCE_CYCLIC_CANONICAL_VALUE");
        active.push(current);
        var fields = Object.keys(current).sort().map(function (key) {
          if (typeof current[key] === "undefined") throw new Error("RLEXPERIENCE_UNDEFINED_CANONICAL_VALUE");
          return JSON.stringify(key) + ":" + encode(current[key]);
        });
        active.pop();
        return "{" + fields.join(",") + "}";
      }
      throw new Error("RLEXPERIENCE_UNSUPPORTED_CANONICAL_VALUE");
    }

    return encode(value);
  }

  function utf8Bytes(text) {
    var bytes = [];
    for (var index = 0; index < text.length; index += 1) {
      var code = text.charCodeAt(index);
      if (code < 0x80) bytes.push(code);
      else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      else if (code >= 0xd800 && code <= 0xdbff && index + 1 < text.length) {
        var low = text.charCodeAt(index + 1);
        if (low >= 0xdc00 && low <= 0xdfff) {
          var point = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
          bytes.push(0xf0 | (point >> 18), 0x80 | ((point >> 12) & 0x3f), 0x80 | ((point >> 6) & 0x3f), 0x80 | (point & 0x3f));
          index += 1;
        } else bytes.push(0xef, 0xbf, 0xbd);
      } else bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
    return bytes;
  }

  function rotateRight(value, count) {
    return (value >>> count) | (value << (32 - count));
  }

  function sha256(text) {
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
    var bytes = utf8Bytes(text);
    var bitLengthHigh = Math.floor((bytes.length * 8) / 0x100000000);
    var bitLengthLow = (bytes.length * 8) >>> 0;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    bytes.push(
      (bitLengthHigh >>> 24) & 0xff, (bitLengthHigh >>> 16) & 0xff,
      (bitLengthHigh >>> 8) & 0xff, bitLengthHigh & 0xff,
      (bitLengthLow >>> 24) & 0xff, (bitLengthLow >>> 16) & 0xff,
      (bitLengthLow >>> 8) & 0xff, bitLengthLow & 0xff
    );

    for (var offset = 0; offset < bytes.length; offset += 64) {
      var words = new Array(64);
      for (var wordIndex = 0; wordIndex < 16; wordIndex += 1) {
        var byteIndex = offset + wordIndex * 4;
        words[wordIndex] = (
          (bytes[byteIndex] << 24) | (bytes[byteIndex + 1] << 16) |
          (bytes[byteIndex + 2] << 8) | bytes[byteIndex + 3]
        ) >>> 0;
      }
      for (wordIndex = 16; wordIndex < 64; wordIndex += 1) {
        var previous15 = words[wordIndex - 15];
        var previous2 = words[wordIndex - 2];
        var sigma0 = rotateRight(previous15, 7) ^ rotateRight(previous15, 18) ^ (previous15 >>> 3);
        var sigma1 = rotateRight(previous2, 17) ^ rotateRight(previous2, 19) ^ (previous2 >>> 10);
        words[wordIndex] = (words[wordIndex - 16] + sigma0 + words[wordIndex - 7] + sigma1) >>> 0;
      }

      var a = hash[0], b = hash[1], c = hash[2], d = hash[3];
      var e = hash[4], f = hash[5], g = hash[6], h = hash[7];
      for (wordIndex = 0; wordIndex < 64; wordIndex += 1) {
        var sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
        var choice = (e & f) ^ (~e & g);
        var temporary1 = (h + sum1 + choice + constants[wordIndex] + words[wordIndex]) >>> 0;
        var sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
        var majority = (a & b) ^ (a & c) ^ (b & c);
        var temporary2 = (sum0 + majority) >>> 0;
        h = g; g = f; f = e; e = (d + temporary1) >>> 0;
        d = c; c = b; b = a; a = (temporary1 + temporary2) >>> 0;
      }
      hash[0] = (hash[0] + a) >>> 0; hash[1] = (hash[1] + b) >>> 0;
      hash[2] = (hash[2] + c) >>> 0; hash[3] = (hash[3] + d) >>> 0;
      hash[4] = (hash[4] + e) >>> 0; hash[5] = (hash[5] + f) >>> 0;
      hash[6] = (hash[6] + g) >>> 0; hash[7] = (hash[7] + h) >>> 0;
    }
    return hash.map(function (value) { return value.toString(16).padStart(8, "0"); }).join("");
  }

  /* Fingerprints are pure over the canonical form, so identical canonical input always
     yields an identical digest. Data-dense pages re-derive the same handful of contexts
     per rendered cell: a data-dense lab page measured 113,710 derivations of only 18
     distinct canonical values, hashing 193.4 MB through the block loop below and blocking
     the main thread ~23s during startup. Caching on the canonical string is transparent
     (pure function memoisation) and keeps that work off the critical path. */
  var fingerprintCache = new Map();
  var FINGERPRINT_CACHE_LIMIT = 4096;

  function fingerprint(value) {
    var canonical = canonicalize(value);
    var cached = fingerprintCache.get(canonical);
    if (typeof cached === "string") return cached;
    var computed = "sha256:" + sha256(canonical);
    /* Bounded so a page churning unique contexts cannot grow this without limit. */
    if (fingerprintCache.size >= FINGERPRINT_CACHE_LIMIT) fingerprintCache.clear();
    fingerprintCache.set(canonical, computed);
    return computed;
  }

  function cloneCanonical(value) {
    return JSON.parse(canonicalize(value));
  }

  function projectError(details) {
    var source = isPlainObject(details) ? details : {};
    var error = {
      contractVersion: "experience-error/v1",
      code: REFUSAL_CODES.indexOf(source.code) === -1 ? "E012-REGISTRY" : source.code,
      phase: typeof source.phase === "string" ? source.phase : "validation",
      toolId: typeof source.toolId === "string" ? source.toolId : null,
      contractId: typeof source.contractId === "string" ? source.contractId : null,
      reason: typeof source.reason === "string" ? source.reason : "contract validation failed",
      fieldPath: typeof source.fieldPath === "string" ? source.fieldPath : "$",
      recoverable: source.recoverable === true,
      dependencyGateId: typeof source.dependencyGateId === "string" ? source.dependencyGateId : null,
      valueEchoed: false
    };
    return deepFreeze(error);
  }

  function ContractFailure(details) {
    this.details = projectError(details);
  }

  function reject(code, phase, contractId, fieldPath, reason, toolId, dependencyGateId) {
    throw new ContractFailure({
      code: code,
      phase: phase,
      contractId: contractId,
      fieldPath: fieldPath,
      reason: reason,
      toolId: toolId || null,
      dependencyGateId: dependencyGateId || null,
      recoverable: false
    });
  }

  function capture(operation) {
    try {
      return deepFreeze({ ok: true, value: deepFreeze(operation()) });
    } catch (error) {
      if (error instanceof ContractFailure) return deepFreeze({ ok: false, error: error.details });
      return deepFreeze({
        ok: false,
        error: projectError({
          code: "E012-REGISTRY",
          phase: "validation",
          contractId: null,
          fieldPath: "$",
          reason: "validator rejected an unsupported value"
        })
      });
    }
  }

  function exactKeys(value, expectedKeys, path, code, phase, contractId, toolId) {
    if (!isPlainObject(value)) reject(code, phase, contractId, path, "object required", toolId);
    Object.keys(value).forEach(function (key) {
      if (expectedKeys.indexOf(key) === -1) reject(code, phase, contractId, path + "." + key, "unknown field", toolId);
    });
    expectedKeys.forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) reject(code, phase, contractId, path + "." + key, "required field missing", toolId);
    });
  }

  function requireVersion(actual, expected, path, phase, toolId) {
    if (actual !== expected) reject("E012-VERSION", phase, expected, path, "unsupported contract version", toolId);
  }

  function requireString(value, path, code, phase, contractId, toolId) {
    if (typeof value !== "string" || value.length === 0) reject(code, phase, contractId, path, "non-empty string required", toolId);
  }

  function requireStringArray(value, path, code, phase, contractId, minimum, toolId) {
    if (!Array.isArray(value) || value.length < (minimum || 0)) reject(code, phase, contractId, path, "string array required", toolId);
    var seen = Object.create(null);
    value.forEach(function (item, index) {
      requireString(item, path + "[" + index + "]", code, phase, contractId, toolId);
      if (seen[item]) reject(code, phase, contractId, path + "[" + index + "]", "duplicate value", toolId);
      seen[item] = true;
    });
  }

  function requireFinitePositive(value, path, code, phase, contractId) {
    if (!Number.isFinite(value) || value <= 0) reject(code, phase, contractId, path, "positive finite number required");
  }

  function equalArray(left, right) {
    return Array.isArray(left) && left.length === right.length && left.every(function (value, index) { return value === right[index]; });
  }

  function safeModule(modulePath, config, path, code, phase, toolId) {
    if (typeof modulePath !== "string" || !SAFE_MODULE_PATTERN.test(modulePath) ||
      !config.adapterPolicy.moduleAllowlist.includes(modulePath)) {
      reject(code, phase, "experience-adapter-policy/v1", path, "adapter module is not allowlisted and same-origin safe", toolId);
    }
  }

  function validateViewSet(viewSet, expected, path) {
    exactKeys(viewSet, VIEW_SET_KEYS, path, "E012-REGISTRY", "config", "tool-experience-config/v1");
    if (viewSet.viewSetId !== expected.viewSetId || viewSet.kind !== expected.kind ||
      viewSet.registryToolId !== expected.registryToolId || viewSet.defaultViewId !== expected.defaultViewId ||
      !equalArray(viewSet.labels, expected.labels)) {
      reject("E012-VIEWSET", "config", "tool-experience-config/v1", path, "view-set identity or labels do not match the closed contract");
    }
    if (!equalArray(viewSet.viewIds, expected.viewIds)) {
      reject("E012-VIEWSET", "config", "tool-experience-config/v1", path + ".viewIds", "view order does not match the closed contract");
    }
  }

  function validateDependencyConfig(dependencyGates) {
    exactKeys(dependencyGates, ["BUG004", "FEATURE002", "FEATURE008"], "$.dependencyGates", "E012-REGISTRY", "config", "tool-experience-config/v1");
    Object.keys(dependencyGates).forEach(function (key) {
      var gate = dependencyGates[key];
      var path = "$.dependencyGates." + key;
      exactKeys(gate, ["gateId", "statePath", "acceptedPredicate", "withheldCapabilities", "preservedCapabilities"], path, "E012-REGISTRY", "config", "tool-experience-config/v1");
      requireString(gate.gateId, path + ".gateId", "E012-REGISTRY", "config", "tool-experience-config/v1");
      requireString(gate.statePath, path + ".statePath", "E012-REGISTRY", "config", "tool-experience-config/v1");
      requireStringArray(gate.withheldCapabilities, path + ".withheldCapabilities", "E012-REGISTRY", "config", "tool-experience-config/v1", 1);
      requireStringArray(gate.preservedCapabilities, path + ".preservedCapabilities", "E012-REGISTRY", "config", "tool-experience-config/v1", 1);
      var predicateKeys = key === "BUG004"
        ? ["statuses", "certificationStatuses", "requiredEvidenceIds"]
        : ["statuses", "certificationStatuses", "requiredMilestones"];
      exactKeys(gate.acceptedPredicate, predicateKeys, path + ".acceptedPredicate", "E012-REGISTRY", "config", "tool-experience-config/v1");
      predicateKeys.forEach(function (predicateKey) {
        requireStringArray(gate.acceptedPredicate[predicateKey], path + ".acceptedPredicate." + predicateKey, "E012-REGISTRY", "config", "tool-experience-config/v1", 1);
      });
    });
  }

  function validateConfigInternal(config) {
    exactKeys(config, CONFIG_KEYS, "$", "E012-REGISTRY", "config", "tool-experience-config/v1");
    requireVersion(config.contractVersion, "tool-experience-config/v1", "$.contractVersion", "config");
    exactKeys(config.viewSets, ["ordinary-four-view/v1", "market-action-center-four-view/v1"], "$.viewSets", "E012-REGISTRY", "config", config.contractVersion);
    validateViewSet(config.viewSets["ordinary-four-view/v1"], {
      viewSetId: "ordinary-four-view/v1", kind: "ordinary", registryToolId: null,
      viewIds: ["simple", "power", "brief", "journey"],
      labels: ["Simple", "Power", "Brief", "Journey"], defaultViewId: "simple"
    }, "$.viewSets.ordinary-four-view/v1");
    validateViewSet(config.viewSets["market-action-center-four-view/v1"], {
      viewSetId: "market-action-center-four-view/v1", kind: "market-action-center",
      registryToolId: config.viewSets["market-action-center-four-view/v1"].registryToolId,
      viewIds: ["brief", "portfolio", "red-alert", "journey"],
      labels: ["Brief", "Portfolio", "Red Alert", "Journey"], defaultViewId: "brief"
    }, "$.viewSets.market-action-center-four-view/v1");
    requireString(config.viewSets["market-action-center-four-view/v1"].registryToolId, "$.viewSets.market-action-center-four-view/v1.registryToolId", "E012-VIEWSET", "config", config.contractVersion);

    exactKeys(config.routingPolicy, ["contractVersion", "publicHashPrefix", "nestedTargetSeparator", "history", "focus", "localModeKey", "invalidTargetPolicy"], "$.routingPolicy", "E012-REGISTRY", "config", config.contractVersion);
    requireVersion(config.routingPolicy.contractVersion, "experience-routing-policy/v1", "$.routingPolicy.contractVersion", "config");
    exactKeys(config.routingPolicy.history, ["userSelection", "bootNormalization", "invalidTarget"], "$.routingPolicy.history", "E012-REGISTRY", "config", config.routingPolicy.contractVersion);
    exactKeys(config.routingPolicy.focus, ["nestedPublicTarget", "returnTarget"], "$.routingPolicy.focus", "E012-REGISTRY", "config", config.routingPolicy.contractVersion);
    if (config.routingPolicy.publicHashPrefix !== "#" || config.routingPolicy.nestedTargetSeparator !== "/" ||
      config.routingPolicy.history.userSelection !== "push" || config.routingPolicy.history.bootNormalization !== "replace" ||
      config.routingPolicy.history.invalidTarget !== "replace" || config.routingPolicy.focus.nestedPublicTarget !== "after-render" ||
      config.routingPolicy.focus.returnTarget !== "exact-trigger" || config.routingPolicy.invalidTargetPolicy !== "remove-target-preserve-mode") {
      reject("E012-REGISTRY", "config", config.routingPolicy.contractVersion, "$.routingPolicy", "routing policy does not match the closed contract");
    }
    requireString(config.routingPolicy.localModeKey, "$.routingPolicy.localModeKey", "E012-REGISTRY", "config", config.routingPolicy.contractVersion);

    exactKeys(config.adapterPolicy, ["contractVersion", "modulePattern", "moduleAllowlist", "registrationPolicy"], "$.adapterPolicy", "E012-REGISTRY", "config", config.contractVersion);
    requireVersion(config.adapterPolicy.contractVersion, "experience-adapter-policy/v1", "$.adapterPolicy.contractVersion", "config");
    if (config.adapterPolicy.modulePattern !== "^rlexperience-adapters/[a-z0-9-]+\\.js$" || config.adapterPolicy.registrationPolicy !== "exact-declared-adapter-ids") {
      reject("E012-REGISTRY", "config", config.adapterPolicy.contractVersion, "$.adapterPolicy", "adapter policy does not match the closed contract");
    }
    requireStringArray(config.adapterPolicy.moduleAllowlist, "$.adapterPolicy.moduleAllowlist", "E012-REGISTRY", "config", config.adapterPolicy.contractVersion, 1);
    config.adapterPolicy.moduleAllowlist.forEach(function (modulePath, index) {
      if (!SAFE_MODULE_PATTERN.test(modulePath)) reject("E012-REGISTRY", "config", config.adapterPolicy.contractVersion, "$.adapterPolicy.moduleAllowlist[" + index + "]", "unsafe adapter module path");
    });

    exactKeys(config.registries, ["simpleModelRegistryPath", "journeyRegistryPath"], "$.registries", "E012-REGISTRY", "config", config.contractVersion);
    if (config.registries.simpleModelRegistryPath !== "simple-models.json" || config.registries.journeyRegistryPath !== "journeys.json") {
      reject("E012-REGISTRY", "config", config.contractVersion, "$.registries", "constituent registry paths must be exact");
    }

    exactKeys(config.contextPolicy, ["contractVersion", "policyId", "rendererBudgets"], "$.contextPolicy", "E012-REGISTRY", "config", config.contractVersion);
    requireVersion(config.contextPolicy.contractVersion, "contextual-tooltip-policy/v1", "$.contextPolicy.contractVersion", "config");
    if (config.contextPolicy.policyId !== "contextual-tooltip/v1") reject("E012-REGISTRY", "config", config.contextPolicy.contractVersion, "$.contextPolicy.policyId", "context policy must be exact");
    exactKeys(config.contextPolicy.rendererBudgets, ["maxValueTextChars", "maxInterpretationChars", "maxLimitationChars"], "$.contextPolicy.rendererBudgets", "E012-REGISTRY", "config", config.contextPolicy.contractVersion);
    Object.keys(config.contextPolicy.rendererBudgets).forEach(function (key) { requireFinitePositive(config.contextPolicy.rendererBudgets[key], "$.contextPolicy.rendererBudgets." + key, "E012-REGISTRY", "config", config.contextPolicy.contractVersion); });

    exactKeys(config.journeyStoragePolicy, ["contractVersion", "namespace", "pointerKey", "slotKeys", "maxSessionBytes", "maxRetainedSessions", "completedOrAbandonedExpiryDays", "forbiddenFieldNames"], "$.journeyStoragePolicy", "E012-REGISTRY", "config", config.contractVersion);
    requireVersion(config.journeyStoragePolicy.contractVersion, "journey-storage-policy/v1", "$.journeyStoragePolicy.contractVersion", "config");
    if (config.journeyStoragePolicy.namespace !== "rlJourneySessionsV1" || config.journeyStoragePolicy.pointerKey !== "rlJourneySessionsV1.pointer" ||
      !equalArray(config.journeyStoragePolicy.slotKeys, ["rlJourneySessionsV1.slotA", "rlJourneySessionsV1.slotB"]) ||
      config.journeyStoragePolicy.maxSessionBytes !== 131072 || config.journeyStoragePolicy.maxRetainedSessions !== 20 ||
      config.journeyStoragePolicy.completedOrAbandonedExpiryDays !== 90) {
      reject("E012-REGISTRY", "config", config.journeyStoragePolicy.contractVersion, "$.journeyStoragePolicy", "Journey storage budgets and keys must be exact");
    }
    requireStringArray(config.journeyStoragePolicy.forbiddenFieldNames, "$.journeyStoragePolicy.forbiddenFieldNames", "E012-REGISTRY", "config", config.journeyStoragePolicy.contractVersion, 1);

    exactKeys(config.redAlertPolicy, ["contractVersion", "hardGate", "minimumIndependentOrigins", "minimumObservableMarketEvidence", "minimumVisibleCount", "noTopicSeedList"], "$.redAlertPolicy", "E012-REGISTRY", "config", config.contractVersion);
    requireVersion(config.redAlertPolicy.contractVersion, "red-alert-policy/v1", "$.redAlertPolicy.contractVersion", "config");
    if (config.redAlertPolicy.hardGate !== "current-corroborated-observable-falsifiable" || config.redAlertPolicy.minimumIndependentOrigins !== 2 ||
      config.redAlertPolicy.minimumObservableMarketEvidence !== 1 || config.redAlertPolicy.minimumVisibleCount !== 0 || config.redAlertPolicy.noTopicSeedList !== true) {
      reject("E012-REGISTRY", "config", config.redAlertPolicy.contractVersion, "$.redAlertPolicy", "Red Alert policy must remain dynamic and fail closed");
    }

    exactKeys(config.matrixPolicy, ["contractVersion", "domains", "publicScopeLabel", "privateScopeLabel"], "$.matrixPolicy", "E012-REGISTRY", "config", config.contractVersion);
    requireVersion(config.matrixPolicy.contractVersion, "public-matrix-policy/v1", "$.matrixPolicy.contractVersion", "config");
    requireStringArray(config.matrixPolicy.domains, "$.matrixPolicy.domains", "E012-REGISTRY", "config", config.matrixPolicy.contractVersion, 1);
    if (config.matrixPolicy.publicScopeLabel !== "Public watchlist" || config.matrixPolicy.privateScopeLabel !== "Private workspace - local only") {
      reject("E012-REGISTRY", "config", config.matrixPolicy.contractVersion, "$.matrixPolicy", "matrix scope labels must be exact");
    }
    validateDependencyConfig(config.dependencyGates);

    var performanceVersion = config.performanceBudgets && config.performanceBudgets.contractVersion;
    var performanceKeys = ["contractVersion", "validationMaxMs", "interactionMaxMs", "localRecomputeMaxMs", "layoutShiftMax"];
    if (performanceVersion === "experience-performance-policy/v2") {
      performanceKeys = performanceKeys.concat(["standardSimpleMaxMs", "heavySimpleMaxMs", "cooperativeChunkMaxMs"]);
    } else if (performanceVersion !== "experience-performance-policy/v1") {
      reject("E012-VERSION", "config", "experience-performance-policy/v2", "$.performanceBudgets.contractVersion", "unsupported contract version");
    }
    exactKeys(config.performanceBudgets, performanceKeys, "$.performanceBudgets", "E012-REGISTRY", "config", config.contractVersion);
    performanceKeys.slice(1).forEach(function (key) {
      requireFinitePositive(config.performanceBudgets[key], "$.performanceBudgets." + key, "E012-REGISTRY", "config", performanceVersion);
    });
    if (performanceVersion === "experience-performance-policy/v2" &&
      (config.performanceBudgets.standardSimpleMaxMs > config.performanceBudgets.localRecomputeMaxMs ||
        config.performanceBudgets.heavySimpleMaxMs < config.performanceBudgets.localRecomputeMaxMs ||
        config.performanceBudgets.cooperativeChunkMaxMs > config.performanceBudgets.standardSimpleMaxMs)) {
      reject("E012-REGISTRY", "config", performanceVersion, "$.performanceBudgets", "Simple runtime budgets are internally inconsistent");
    }

    exactKeys(config.artifactBudgets, ["contractVersion", "configMaxBytes", "simpleModelsMaxBytes", "journeysMaxBytes", "briefHistoryRecentMaxBytes", "briefHistoryRecentMaxRows", "briefFirstLoadMaxBytes"], "$.artifactBudgets", "E012-REGISTRY", "config", config.contractVersion);
    requireVersion(config.artifactBudgets.contractVersion, "experience-artifact-budget/v1", "$.artifactBudgets.contractVersion", "config");
    ["configMaxBytes", "simpleModelsMaxBytes", "journeysMaxBytes", "briefHistoryRecentMaxBytes", "briefHistoryRecentMaxRows", "briefFirstLoadMaxBytes"].forEach(function (key) { requireFinitePositive(config.artifactBudgets[key], "$.artifactBudgets." + key, "E012-REGISTRY", "config", config.artifactBudgets.contractVersion); });

    exactKeys(config.migrationPolicy, ["contractVersion", "phase", "shadowOnly", "visibleModeCutover", "panelBootstrap"], "$.migrationPolicy", "E012-REGISTRY", "config", config.contractVersion);
    requireVersion(config.migrationPolicy.contractVersion, "experience-migration-policy/v1", "$.migrationPolicy.contractVersion", "config");
    var contractShadow = config.migrationPolicy.phase === "contract-shadow" && config.migrationPolicy.panelBootstrap === false;
    var shellCanary = config.migrationPolicy.phase === "shell-canary" && config.migrationPolicy.panelBootstrap === true;
    if ((!contractShadow && !shellCanary) || config.migrationPolicy.shadowOnly !== true ||
      config.migrationPolicy.visibleModeCutover !== false) {
      reject("E012-REGISTRY", "config", config.migrationPolicy.contractVersion, "$.migrationPolicy", "migration policy must be an explicit shadow or shell-canary state");
    }
    if (!equalArray(config.refusalCodes, REFUSAL_CODES)) reject("E012-REGISTRY", "config", config.contractVersion, "$.refusalCodes", "refusal code enum must be exact");
    return deepFreeze(cloneCanonical(config));
  }

  function validateInputRequirement(requirement, path) {
    exactKeys(requirement, ["requirementId", "sourceClass", "required", "stalePolicy"], path, "E012-SIMPLE-DEFINITION", "simple-definition", "simple-model-definition/v1");
    requireString(requirement.requirementId, path + ".requirementId", "E012-SIMPLE-DEFINITION", "simple-definition", "simple-model-definition/v1");
    requireString(requirement.sourceClass, path + ".sourceClass", "E012-SIMPLE-DEFINITION", "simple-definition", "simple-model-definition/v1");
    if (typeof requirement.required !== "boolean" || ["accept", "label", "reject"].indexOf(requirement.stalePolicy) === -1) {
      reject("E012-SIMPLE-DEFINITION", "simple-definition", "simple-model-definition/v1", path, "invalid input requirement policy");
    }
  }

  function validateParameter(parameter, path) {
    exactKeys(parameter, PARAMETER_KEYS, path, "E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1");
    requireString(parameter.parameterId, path + ".parameterId", "E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1");
    requireString(parameter.label, path + ".label", "E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1");
    requireString(parameter.unit, path + ".unit", "E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1");
    requireString(parameter.interpretation, path + ".interpretation", "E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1");
    if (["number", "integer", "enum", "boolean", "seed"].indexOf(parameter.kind) === -1) reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".kind", "unknown parameter kind");
    if (["registry", "tool-config", "evidence-derived"].indexOf(parameter.defaultSource) === -1) reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".defaultSource", "unknown default source");
    if (parameter.identityBearing !== true) reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".identityBearing", "parameters must be identity bearing");
    requireStringArray(parameter.affectsOutputPaths, path + ".affectsOutputPaths", "E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", 1);
    if (!Array.isArray(parameter.disabledWhen)) reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".disabledWhen", "disabledWhen array required");

    if (["number", "integer", "seed"].indexOf(parameter.kind) !== -1) {
      exactKeys(parameter.domain, ["min", "max", "step"], path + ".domain", "E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1");
      if (![parameter.domain.min, parameter.domain.max, parameter.domain.step].every(Number.isFinite) || parameter.domain.min > parameter.domain.max || parameter.domain.step <= 0) {
        reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".domain", "invalid numeric domain");
      }
      if (parameter.defaultValue === null) {
        if (parameter.defaultSource !== "evidence-derived") reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".defaultValue", "null default requires evidence-derived source");
      } else if (!Number.isFinite(parameter.defaultValue) || parameter.defaultValue < parameter.domain.min || parameter.defaultValue > parameter.domain.max ||
        ((parameter.kind === "integer" || parameter.kind === "seed") && !Number.isInteger(parameter.defaultValue))) {
        reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".defaultValue", "default is outside the declared domain");
      }
    } else {
      exactKeys(parameter.domain, ["options"], path + ".domain", "E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1");
      if (!Array.isArray(parameter.domain.options) || parameter.domain.options.length < 2) reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".domain.options", "at least two options required");
      var optionValues = [];
      parameter.domain.options.forEach(function (option, index) {
        exactKeys(option, ["value", "label"], path + ".domain.options[" + index + "]", "E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1");
        requireString(option.label, path + ".domain.options[" + index + "].label", "E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1");
        if (parameter.kind === "boolean" && typeof option.value !== "boolean") reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".domain.options[" + index + "].value", "boolean option required");
        if (parameter.kind === "enum" && typeof option.value !== "string") reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".domain.options[" + index + "].value", "string option required");
        if (optionValues.some(function (value) { return value === option.value; })) reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".domain.options[" + index + "].value", "duplicate option");
        optionValues.push(option.value);
      });
      if (!optionValues.some(function (value) { return value === parameter.defaultValue; })) reject("E012-SIMPLE-DEFINITION", "simple-definition", "parameter-definition/v1", path + ".defaultValue", "default must match one option");
    }
  }

  function validateParameterValue(parameter, value, path, toolId) {
    if (["number", "integer", "seed"].indexOf(parameter.kind) !== -1) {
      if (!Number.isFinite(value)) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", path, "finite numeric parameter required", toolId);
      if ((parameter.kind === "integer" || parameter.kind === "seed") && !Number.isInteger(value)) {
        reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", path, "integer parameter required", toolId);
      }
      if (value < parameter.domain.min || value > parameter.domain.max) {
        reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", path, "parameter is outside the declared domain", toolId);
      }
      var stepPosition = (value - parameter.domain.min) / parameter.domain.step;
      if (Math.abs(stepPosition - Math.round(stepPosition)) > 1e-9) {
        reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", path, "parameter does not align with the declared step", toolId);
      }
      return;
    }
    var optionValues = parameter.domain.options.map(function (option) { return option.value; });
    if (!optionValues.some(function (candidate) { return candidate === value; })) {
      reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", path, "parameter is not a declared option", toolId);
    }
  }

  function validateToolControlCutoff(value, path, toolId) {
    if (value === null) return;
    var parsed = typeof value === "string" ? new Date(value) : null;
    if (!parsed || !Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
      reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", path, "ISO evidence cutoff or null required", toolId);
    }
  }

  function copyToolControlState(state) {
    return deepFreeze({
      contractVersion: state.contractVersion,
      toolId: state.toolId,
      revision: state.revision,
      parameterValues: cloneCanonical(state.parameterValues),
      ownerDecisionId: state.ownerDecisionId,
      evidenceIdentity: state.evidenceIdentity,
      evidenceCutoff: state.evidenceCutoff
    });
  }

  function validateToolControlDefinitions(definitions) {
    if (!Array.isArray(definitions) || definitions.length < 1) {
      reject("E012-SIMPLE-DEFINITION", "tool-control-binding", "tool-control-binding/v1", "$.parameterDefinitions", "parameter definitions are required");
    }
    var seen = Object.create(null);
    return deepFreeze(definitions.map(function (parameter, index) {
      var path = "$.parameterDefinitions[" + index + "]";
      validateParameter(parameter, path);
      if (seen[parameter.parameterId]) {
        reject("E012-SIMPLE-DEFINITION", "tool-control-binding", "tool-control-binding/v1", path + ".parameterId", "duplicate parameter ID");
      }
      seen[parameter.parameterId] = true;
      return deepFreeze(cloneCanonical(parameter));
    }));
  }

  function validateToolControlState(source, definitions, path) {
    var toolId = source && source.toolId;
    exactKeys(source, TOOL_CONTROL_STATE_KEYS, path, "E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", toolId);
    if (source.contractVersion !== "tool-control-binding/v1") {
      reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", path + ".contractVersion", "unsupported binding contract", toolId);
    }
    requireString(source.toolId, path + ".toolId", "E012-SIMPLE-INPUT", "tool-control-binding", source.contractVersion, toolId);
    if (!ID_PATTERN.test(source.toolId)) {
      reject("E012-SIMPLE-INPUT", "tool-control-binding", source.contractVersion, path + ".toolId", "invalid tool ID", toolId);
    }
    if (!Number.isInteger(source.revision) || source.revision < 0) {
      reject("E012-SIMPLE-INPUT", "tool-control-binding", source.contractVersion, path + ".revision", "non-negative integer revision required", toolId);
    }
    if (!isPlainObject(source.parameterValues)) {
      reject("E012-SIMPLE-INPUT", "tool-control-binding", source.contractVersion, path + ".parameterValues", "explicit parameter object required", toolId);
    }
    if (definitions) {
      var definitionMap = Object.create(null);
      definitions.forEach(function (parameter) { definitionMap[parameter.parameterId] = parameter; });
      Object.keys(source.parameterValues).forEach(function (parameterId) {
        if (!definitionMap[parameterId]) {
          reject("E012-SIMPLE-INPUT", "tool-control-binding", source.contractVersion, path + ".parameterValues." + parameterId, "unknown parameter", toolId);
        }
      });
      definitions.forEach(function (parameter) {
        if (!Object.prototype.hasOwnProperty.call(source.parameterValues, parameter.parameterId)) {
          reject("E012-SIMPLE-INPUT", "tool-control-binding", source.contractVersion, path + ".parameterValues." + parameter.parameterId, "explicit parameter value required", toolId);
        }
        validateParameterValue(parameter, source.parameterValues[parameter.parameterId], path + ".parameterValues." + parameter.parameterId, toolId);
      });
    } else {
      Object.keys(source.parameterValues).forEach(function (parameterId) {
        var value = source.parameterValues[parameterId];
        if (!((typeof value === "number" && Number.isFinite(value)) || typeof value === "string" || typeof value === "boolean")) {
          reject("E012-SIMPLE-INPUT", "tool-control-binding", source.contractVersion, path + ".parameterValues." + parameterId, "finite primitive parameter required", toolId);
        }
      });
    }
    requireString(source.ownerDecisionId, path + ".ownerDecisionId", "E012-SIMPLE-INPUT", "tool-control-binding", source.contractVersion, toolId);
    requireString(source.evidenceIdentity, path + ".evidenceIdentity", "E012-SIMPLE-INPUT", "tool-control-binding", source.contractVersion, toolId);
    validateToolControlCutoff(source.evidenceCutoff, path + ".evidenceCutoff", toolId);
    return copyToolControlState(source);
  }

  function validateToolControlOwnerResult(result, state, parameterValues) {
    exactKeys(result, TOOL_CONTROL_OWNER_RESULT_KEYS, "$.ownerResult", "E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-owner-result/v1", state.toolId);
    if (result.contractVersion !== "tool-control-owner-result/v1") {
      reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-owner-result/v1", "$.ownerResult.contractVersion", "unsupported owner result contract", state.toolId);
    }
    if (result.toolId !== state.toolId) {
      reject("E012-SIMPLE-INPUT", "tool-control-binding", result.contractVersion, "$.ownerResult.toolId", "owner result tool does not match the binding", state.toolId);
    }
    if (!isPlainObject(result.parameterValues) || canonicalize(result.parameterValues) !== canonicalize(parameterValues)) {
      reject("E012-SIMPLE-INPUT", "tool-control-binding", result.contractVersion, "$.ownerResult.parameterValues", "owner result parameters do not match the binding candidate", state.toolId);
    }
    requireString(result.ownerDecisionId, "$.ownerResult.ownerDecisionId", "E012-SIMPLE-INPUT", "tool-control-binding", result.contractVersion, state.toolId);
    requireString(result.evidenceIdentity, "$.ownerResult.evidenceIdentity", "E012-SIMPLE-INPUT", "tool-control-binding", result.contractVersion, state.toolId);
    validateToolControlCutoff(result.evidenceCutoff, "$.ownerResult.evidenceCutoff", state.toolId);
    return deepFreeze({
      ownerDecisionId: result.ownerDecisionId,
      evidenceIdentity: result.evidenceIdentity,
      evidenceCutoff: result.evidenceCutoff
    });
  }

  function projectToolControlBindingInternal(binding) {
    var source = binding;
    if (binding && typeof binding.snapshot === "function") {
      try {
        source = binding.snapshot();
      } catch (error) {
        reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", "$.binding", "binding snapshot failed");
      }
    }
    return validateToolControlState(source, null, "$.binding");
  }

  function createToolControlBindingInternal(options) {
    exactKeys(options, TOOL_CONTROL_FACTORY_KEYS, "$", "E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1");
    if (typeof options.commitHandler !== "function") {
      reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", "$.commitHandler", "owner commit handler required");
    }
    if (typeof options.notifySubscribers !== "function") {
      reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", "$.notifySubscribers", "subscriber notification handler required");
    }
    var definitions = validateToolControlDefinitions(options.parameterDefinitions);
    var parameterMap = Object.create(null);
    definitions.forEach(function (parameter) { parameterMap[parameter.parameterId] = parameter; });
    var state = validateToolControlState(options.initialState, definitions, "$.initialState");

    function snapshot() {
      return copyToolControlState(state);
    }

    async function commit(change) {
      try {
        exactKeys(change, TOOL_CONTROL_CHANGE_KEYS, "$.change", "E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", state.toolId);
        if (!Number.isInteger(change.expectedRevision) || change.expectedRevision < 0 || change.expectedRevision !== state.revision) {
          reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", "$.change.expectedRevision", "stale binding revision", state.toolId);
        }
        requireString(change.parameterId, "$.change.parameterId", "E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", state.toolId);
        var parameter = parameterMap[change.parameterId];
        if (!parameter) {
          reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", "$.change.parameterId", "undeclared parameter", state.toolId);
        }
        validateParameterValue(parameter, change.value, "$.change.value", state.toolId);

        var candidateValues = cloneCanonical(state.parameterValues);
        candidateValues[change.parameterId] = change.value;
        candidateValues = deepFreeze(candidateValues);
        var request = deepFreeze({
          contractVersion: "tool-control-commit/v1",
          toolId: state.toolId,
          expectedRevision: change.expectedRevision,
          parameterValues: candidateValues
        });
        var result;
        try {
          result = await options.commitHandler(request);
        } catch (handlerError) {
          reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", "$.commitHandler", "owner commit handler failed", state.toolId);
        }
        if (state.revision !== change.expectedRevision) {
          reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", "$.change.expectedRevision", "stale binding revision", state.toolId);
        }
        var owner = validateToolControlOwnerResult(result, state, candidateValues);
        var previousState = state;
        state = copyToolControlState({
          contractVersion: "tool-control-binding/v1",
          toolId: state.toolId,
          revision: state.revision + 1,
          parameterValues: candidateValues,
          ownerDecisionId: owner.ownerDecisionId,
          evidenceIdentity: owner.evidenceIdentity,
          evidenceCutoff: owner.evidenceCutoff
        });
        try {
          var notificationResult = options.notifySubscribers(snapshot());
          if (typeof notificationResult !== "undefined") {
            state = previousState;
            reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", "$.notifySubscribers", "subscriber notification must complete synchronously", state.toolId);
          }
        } catch (notificationError) {
          state = previousState;
          if (notificationError instanceof ContractFailure) throw notificationError;
          reject("E012-SIMPLE-INPUT", "tool-control-binding", "tool-control-binding/v1", "$.notifySubscribers", "subscriber notification failed", state.toolId);
        }
        return snapshot();
      } catch (error) {
        if (error instanceof ContractFailure) throw error.details;
        throw projectError({
          code: "E012-SIMPLE-INPUT",
          phase: "tool-control-binding",
          toolId: state.toolId,
          contractId: "tool-control-binding/v1",
          fieldPath: "$",
          reason: "binding rejected an unsupported value"
        });
      }
    }

    var binding = {};
    TOOL_CONTROL_STATE_KEYS.forEach(function (key) {
      Object.defineProperty(binding, key, {
        enumerable: true,
        get: function () {
          return key === "parameterValues" ? deepFreeze(cloneCanonical(state.parameterValues)) : state[key];
        }
      });
    });
    Object.defineProperty(binding, "snapshot", { value: snapshot });
    Object.defineProperty(binding, "commit", { value: commit });
    return Object.freeze(binding);
  }

  function validateModelDefinition(definition, index, config, seenDefinitions, seenAdapters) {
    var path = "$.definitions[" + index + "]";
    exactKeys(definition, MODEL_KEYS, path, "E012-SIMPLE-DEFINITION", "simple-definition", "simple-model-definition/v1", definition.toolId);
    requireVersion(definition.contractVersion, "simple-model-definition/v1", path + ".contractVersion", "simple-definition", definition.toolId);
    ["definitionId", "toolId", "modelId", "modelVersion", "researchQuestion", "resultSchemaId", "adapterId"].forEach(function (key) {
      requireString(definition[key], path + "." + key, "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
    });
    if (!ID_PATTERN.test(definition.definitionId) || !ID_PATTERN.test(definition.toolId) || !ID_PATTERN.test(definition.adapterId)) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path, "definition identifiers are invalid", definition.toolId);
    if (seenDefinitions[definition.definitionId]) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".definitionId", "duplicate definition ID", definition.toolId);
    if (seenAdapters[definition.adapterId]) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".adapterId", "duplicate adapter ID", definition.toolId);
    seenDefinitions[definition.definitionId] = true;
    seenAdapters[definition.adapterId] = true;
    safeModule(definition.adapterModule, config, path + ".adapterModule", "E012-SIMPLE-DEFINITION", "simple-definition", definition.toolId);

    if (!Array.isArray(definition.inputRequirements) || definition.inputRequirements.length < 1) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".inputRequirements", "input requirements are required", definition.toolId);
    definition.inputRequirements.forEach(function (requirement, requirementIndex) { validateInputRequirement(requirement, path + ".inputRequirements[" + requirementIndex + "]"); });
    if (!Array.isArray(definition.parameterDefinitions) || definition.parameterDefinitions.length < 2) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".parameterDefinitions", "at least two parameters are required", definition.toolId);
    var parameterIds = Object.create(null);
    definition.parameterDefinitions.forEach(function (parameter, parameterIndex) {
      validateParameter(parameter, path + ".parameterDefinitions[" + parameterIndex + "]");
      if (parameterIds[parameter.parameterId]) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".parameterDefinitions[" + parameterIndex + "].parameterId", "duplicate parameter ID", definition.toolId);
      parameterIds[parameter.parameterId] = true;
    });

    if (!Array.isArray(definition.scenarioDefinitions) || definition.scenarioDefinitions.length < 1) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".scenarioDefinitions", "at least one scenario is required", definition.toolId);
    definition.scenarioDefinitions.forEach(function (scenario, scenarioIndex) {
      var scenarioPath = path + ".scenarioDefinitions[" + scenarioIndex + "]";
      exactKeys(scenario, ["scenarioId", "label", "parameterOverrides"], scenarioPath, "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
      requireString(scenario.scenarioId, scenarioPath + ".scenarioId", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
      requireString(scenario.label, scenarioPath + ".label", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
      if (!isPlainObject(scenario.parameterOverrides)) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, scenarioPath + ".parameterOverrides", "parameter override object required", definition.toolId);
      Object.keys(scenario.parameterOverrides).forEach(function (parameterId) {
        if (!parameterIds[parameterId]) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, scenarioPath + ".parameterOverrides." + parameterId, "scenario references an unknown parameter", definition.toolId);
        var parameter = definition.parameterDefinitions.find(function (candidate) { return candidate.parameterId === parameterId; });
        validateParameterValue(parameter, scenario.parameterOverrides[parameterId], scenarioPath + ".parameterOverrides." + parameterId, definition.toolId);
      });
    });

    exactKeys(definition.seedPolicy, ["required", "defaultSeed", "defaultSource", "randomnessClass", "commonRandomNumbersForSensitivity"], path + ".seedPolicy", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
    if (["none", "seeded-path", "seeded-resampling"].indexOf(definition.seedPolicy.randomnessClass) === -1 || typeof definition.seedPolicy.required !== "boolean" || typeof definition.seedPolicy.commonRandomNumbersForSensitivity !== "boolean") {
      reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".seedPolicy", "invalid seed policy", definition.toolId);
    }
    if (definition.seedPolicy.randomnessClass === "none") {
      if (definition.seedPolicy.required !== false || definition.seedPolicy.defaultSeed !== null || definition.seedPolicy.defaultSource !== null) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".seedPolicy", "deterministic seed policy must be empty", definition.toolId);
    } else if (definition.seedPolicy.required !== true || !Number.isInteger(definition.seedPolicy.defaultSeed) || ["registry", "tool-config"].indexOf(definition.seedPolicy.defaultSource) === -1 || definition.seedPolicy.commonRandomNumbersForSensitivity !== true) {
      reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".seedPolicy", "stochastic seed policy must be explicit", definition.toolId);
    }

    exactKeys(definition.sensitivityPolicy, ["method", "requireOutputEffect", "flatRegionPolicy"], path + ".sensitivityPolicy", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
    exactKeys(definition.calibrationPolicy, ["class", "requiredFields"], path + ".calibrationPolicy", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
    exactKeys(definition.provenancePolicy, ["allowedClasses", "requireEvidenceCutoff"], path + ".provenancePolicy", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
    exactKeys(definition.performancePolicy, ["maxComputeMs", "deterministic"], path + ".performancePolicy", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
    exactKeys(definition.deepLinkTargets, ["power", "journey"], path + ".deepLinkTargets", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
    requireStringArray(definition.calibrationPolicy.requiredFields, path + ".calibrationPolicy.requiredFields", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, 1, definition.toolId);
    requireStringArray(definition.provenancePolicy.allowedClasses, path + ".provenancePolicy.allowedClasses", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, 1, definition.toolId);
    requireFinitePositive(definition.performancePolicy.maxComputeMs, path + ".performancePolicy.maxComputeMs", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion);
    if (definition.sensitivityPolicy.method !== "one-at-a-time" || definition.sensitivityPolicy.requireOutputEffect !== true || definition.sensitivityPolicy.flatRegionPolicy !== "explicit-proof" ||
      typeof definition.calibrationPolicy.class !== "string" || definition.provenancePolicy.requireEvidenceCutoff !== true || definition.performancePolicy.deterministic !== true) {
      reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path, "model policies do not match the closed declaration contract", definition.toolId);
    }
    requireStringArray(definition.limitations, path + ".limitations", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, 1, definition.toolId);
    requireString(definition.deepLinkTargets.power, path + ".deepLinkTargets.power", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
    requireString(definition.deepLinkTargets.journey, path + ".deepLinkTargets.journey", "E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, definition.toolId);
    if (definition.definitionFingerprint !== null && typeof definition.definitionFingerprint !== "string") reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".definitionFingerprint", "fingerprint must be null or canonical SHA-256", definition.toolId);
    var fingerprintInput = cloneCanonical(definition);
    fingerprintInput.definitionFingerprint = null;
    var computedFingerprint = fingerprint(fingerprintInput);
    if (definition.definitionFingerprint !== null && definition.definitionFingerprint !== computedFingerprint) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, path + ".definitionFingerprint", "definition fingerprint mismatch", definition.toolId);
    var projected = cloneCanonical(definition);
    projected.definitionFingerprint = computedFingerprint;
    return projected;
  }

  function validateSimpleModelRegistryInternal(registry, config) {
    exactKeys(registry, ["contractVersion", "definitions"], "$", "E012-SIMPLE-DEFINITION", "simple-registry", "simple-model-registry/v1");
    requireVersion(registry.contractVersion, "simple-model-registry/v1", "$.contractVersion", "simple-registry");
    if (!Array.isArray(registry.definitions) || registry.definitions.length < 1) reject("E012-SIMPLE-DEFINITION", "simple-registry", registry.contractVersion, "$.definitions", "model definitions are required");
    var seenDefinitions = Object.create(null);
    var seenAdapters = Object.create(null);
    var definitions = registry.definitions.map(function (definition, index) {
      return validateModelDefinition(definition, index, config, seenDefinitions, seenAdapters);
    });
    return deepFreeze({ contractVersion: registry.contractVersion, definitions: definitions });
  }

  function validateRuntimeDefinition(definition) {
    exactKeys(definition, MODEL_KEYS, "$.definition", "E012-SIMPLE-DEFINITION", "simple-definition", "simple-model-definition/v1", definition && definition.toolId);
    requireVersion(definition.contractVersion, "simple-model-definition/v1", "$.definition.contractVersion", "simple-definition", definition.toolId);
    if (!Array.isArray(definition.inputRequirements) || definition.inputRequirements.length < 1) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, "$.definition.inputRequirements", "input requirements are required", definition.toolId);
    if (!Array.isArray(definition.parameterDefinitions) || definition.parameterDefinitions.length < 2) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, "$.definition.parameterDefinitions", "parameter definitions are required", definition.toolId);
    definition.parameterDefinitions.forEach(function (parameter, index) { validateParameter(parameter, "$.definition.parameterDefinitions[" + index + "]"); });
    if (!Array.isArray(definition.scenarioDefinitions) || definition.scenarioDefinitions.length < 1) reject("E012-SIMPLE-DEFINITION", "simple-definition", definition.contractVersion, "$.definition.scenarioDefinitions", "scenario definitions are required", definition.toolId);
    return definition;
  }

  function semanticEvidenceRefs(evidenceRefs) {
    return evidenceRefs.map(function (reference) {
      return {
        requirementId: reference.requirementId,
        evidenceRef: reference.evidenceRef,
        semanticFingerprint: reference.semanticFingerprint,
        sourceClass: reference.sourceClass,
        valueState: reference.valueState
      };
    });
  }

  function simpleEvidenceIdentity(evidence) {
    return fingerprint({
      contractVersion: "simple-evidence-identity/v1",
      toolId: evidence.toolId,
      state: evidence.state,
      evidenceCutoff: evidence.evidenceCutoff,
      evidenceRefs: semanticEvidenceRefs(evidence.evidenceRefs),
      parameterValues: evidence.parameterValues,
      assumptions: evidence.assumptions,
      limitations: evidence.limitations,
      invalidationConditions: evidence.invalidationConditions
    });
  }

  function validateSimpleEvidence(definition, evidence) {
    exactKeys(evidence, SIMPLE_EVIDENCE_KEYS, "$.evidence", "E012-SIMPLE-INPUT", "simple-input", "simple-evidence-snapshot/v1", definition.toolId);
    requireVersion(evidence.contractVersion, "simple-evidence-snapshot/v1", "$.evidence.contractVersion", "simple-input", definition.toolId);
    if (evidence.toolId !== definition.toolId) reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, "$.evidence.toolId", "evidence owner does not match the definition", definition.toolId);
    if (SIMPLE_TRUTH_STATES.indexOf(evidence.state) === -1) reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, "$.evidence.state", "unknown evidence truth state", definition.toolId);
    requireString(evidence.evidenceCutoff, "$.evidence.evidenceCutoff", "E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, definition.toolId);
    requireString(evidence.evidenceIdentity, "$.evidence.evidenceIdentity", "E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, definition.toolId);
    if (!Array.isArray(evidence.evidenceRefs)) reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, "$.evidence.evidenceRefs", "evidence reference array required", definition.toolId);
    if (!isPlainObject(evidence.parameterValues)) reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, "$.evidence.parameterValues", "evidence parameter object required", definition.toolId);
    ["assumptions", "limitations", "invalidationConditions"].forEach(function (key) {
      requireStringArray(evidence[key], "$.evidence." + key, "E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, key === "limitations" ? 1 : 0, definition.toolId);
    });
    Object.keys(evidence.parameterValues).forEach(function (key) {
      var value = evidence.parameterValues[key];
      if (!((typeof value === "number" && Number.isFinite(value)) || typeof value === "string" || typeof value === "boolean")) {
        reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, "$.evidence.parameterValues." + key, "evidence parameter must be a finite primitive", definition.toolId);
      }
    });
    var references = Object.create(null);
    evidence.evidenceRefs.forEach(function (reference, index) {
      var path = "$.evidence.evidenceRefs[" + index + "]";
      exactKeys(reference, SIMPLE_EVIDENCE_REF_KEYS, path, "E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, definition.toolId);
      ["requirementId", "evidenceRef", "semanticFingerprint", "sourceClass", "observedAsOf", "retrievedOrPublishedAt", "freshness", "dataTier"].forEach(function (key) {
        requireString(reference[key], path + "." + key, "E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, definition.toolId);
      });
      if (!/^sha256:[0-9a-f]{64}$/.test(reference.semanticFingerprint)) reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, path + ".semanticFingerprint", "canonical SHA-256 evidence fingerprint required", definition.toolId);
      if (SIMPLE_TRUTH_STATES.indexOf(reference.valueState) === -1) reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, path + ".valueState", "unknown evidence value state", definition.toolId);
      if (references[reference.requirementId]) reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, path + ".requirementId", "duplicate evidence requirement", definition.toolId);
      references[reference.requirementId] = reference;
    });
    if (evidence.evidenceIdentity !== simpleEvidenceIdentity(evidence)) reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, "$.evidence.evidenceIdentity", "evidence semantic identity mismatch", definition.toolId);
    definition.inputRequirements.forEach(function (requirement) {
      var reference = references[requirement.requirementId];
      if (requirement.required && !reference) reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, "$.evidence.evidenceRefs", "required evidence is missing", definition.toolId);
      if (reference && requirement.stalePolicy === "reject" && (reference.valueState === "stale" || reference.freshness === "stale")) {
        reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, "$.evidence.evidenceRefs", "required evidence is stale", definition.toolId);
      }
    });
    if (evidence.state !== "ready") reject("E012-SIMPLE-INPUT", "simple-input", evidence.contractVersion, "$.evidence.state", "evidence state does not permit a new run", definition.toolId);
  }

  function normalizeSimpleInputInternal(definition, evidence, parameterValues, seed, scenarioIds) {
    validateRuntimeDefinition(definition);
    validateSimpleEvidence(definition, evidence);
    if (!isPlainObject(parameterValues)) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.parameterValues", "explicit parameter object required", definition.toolId);
    var parameterMap = Object.create(null);
    definition.parameterDefinitions.forEach(function (parameter) { parameterMap[parameter.parameterId] = parameter; });
    Object.keys(parameterValues).forEach(function (parameterId) {
      if (!parameterMap[parameterId]) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.parameterValues." + parameterId, "unknown parameter", definition.toolId);
    });
    var parameters = definition.parameterDefinitions.map(function (parameter) {
      if (!Object.prototype.hasOwnProperty.call(parameterValues, parameter.parameterId)) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.parameterValues." + parameter.parameterId, "explicit parameter value required", definition.toolId);
      var value = parameterValues[parameter.parameterId];
      var sourceClass = "user-assumption";
      if (value === null && parameter.defaultSource === "evidence-derived") {
        if (!Object.prototype.hasOwnProperty.call(evidence.parameterValues, parameter.parameterId)) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.parameterValues." + parameter.parameterId, "evidence-derived parameter is unavailable", definition.toolId);
        value = evidence.parameterValues[parameter.parameterId];
        sourceClass = "observed-fact";
      }
      validateParameterValue(parameter, value, "$.parameterValues." + parameter.parameterId, definition.toolId);
      return { parameterId: parameter.parameterId, value: value, unit: parameter.unit, sourceClass: sourceClass };
    });
    if (definition.seedPolicy.randomnessClass === "none") {
      if (seed !== null) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.seed", "deterministic model seed must be null", definition.toolId);
    } else {
      if (!Number.isInteger(seed)) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.seed", "explicit integer seed required", definition.toolId);
      var seedParameter = parameters.find(function (parameter) { return parameter.parameterId === "seed"; });
      if (seedParameter && seedParameter.value !== seed) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.seed", "seed parameter and seed policy value differ", definition.toolId);
    }
    if (!Array.isArray(scenarioIds) || scenarioIds.length < 1) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.scenarioIds", "explicit scenario IDs required", definition.toolId);
    var scenarioMap = Object.create(null);
    definition.scenarioDefinitions.forEach(function (scenario) { scenarioMap[scenario.scenarioId] = scenario; });
    var seenScenarios = Object.create(null);
    var scenarios = scenarioIds.map(function (scenarioId, index) {
      if (typeof scenarioId !== "string" || !scenarioMap[scenarioId]) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.scenarioIds[" + index + "]", "unknown scenario ID", definition.toolId);
      if (seenScenarios[scenarioId]) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.scenarioIds[" + index + "]", "duplicate scenario ID", definition.toolId);
      seenScenarios[scenarioId] = true;
      return cloneCanonical(scenarioMap[scenarioId]);
    });
    var definitionFingerprint = definition.definitionFingerprint;
    if (definitionFingerprint === null) {
      var definitionInput = cloneCanonical(definition);
      definitionInput.definitionFingerprint = null;
      definitionFingerprint = fingerprint(definitionInput);
    }
    var normalized = {
      contractVersion: "normalized-simple-input/v1",
      toolId: definition.toolId,
      definitionId: definition.definitionId,
      modelId: definition.modelId,
      modelVersion: definition.modelVersion,
      evidenceIdentity: simpleEvidenceIdentity(evidence),
      evidenceCutoff: evidence.evidenceCutoff,
      evidenceRefs: semanticEvidenceRefs(evidence.evidenceRefs),
      parameters: parameters,
      seed: seed,
      scenarios: scenarios,
      policyFingerprints: [
        definitionFingerprint,
        fingerprint(definition.seedPolicy),
        fingerprint(definition.sensitivityPolicy),
        fingerprint(definition.calibrationPolicy),
        fingerprint({ provenancePolicy: definition.provenancePolicy, performancePolicy: definition.performancePolicy })
      ],
      limitations: definition.limitations.concat(evidence.limitations),
      inputFingerprint: null
    };
    normalized.inputFingerprint = fingerprint(normalized);
    return deepFreeze(normalized);
  }

  function computeSimpleIdentityInternal(input) {
    if (!isPlainObject(input) || input.contractVersion !== "normalized-simple-input/v1") reject("E012-SIMPLE-INPUT", "simple-identity", "normalized-simple-input/v1", "$", "normalized Simple input required", input && input.toolId);
    return fingerprint({
      contractVersion: "simple-compute-identity/v1",
      toolId: input.toolId,
      definitionId: input.definitionId,
      modelId: input.modelId,
      modelVersion: input.modelVersion,
      evidenceIdentity: input.evidenceIdentity,
      evidenceCutoff: input.evidenceCutoff,
      evidenceRefs: input.evidenceRefs,
      parameters: input.parameters,
      seed: input.seed,
      scenarios: input.scenarios,
      policyFingerprints: input.policyFingerprints
    });
  }

  function projectSimpleStateInternal(state, options) {
    if (SIMPLE_TRUTH_STATES.indexOf(state) === -1) reject("E012-SIMPLE-INPUT", "simple-projection", "simple-projection/v1", "$.state", "unknown Simple truth state", options && options.toolId);
    if (!isPlainObject(options)) reject("E012-SIMPLE-INPUT", "simple-projection", "simple-projection/v1", "$", "projection options required");
    requireString(options.message, "$.message", "E012-SIMPLE-INPUT", "simple-projection", "simple-projection/v1", options.toolId);
    requireStringArray(options.requiredEvidence, "$.requiredEvidence", "E012-SIMPLE-INPUT", "simple-projection", "simple-projection/v1", 0, options.toolId);
    requireStringArray(options.observedEvidence, "$.observedEvidence", "E012-SIMPLE-INPUT", "simple-projection", "simple-projection/v1", 0, options.toolId);
    requireStringArray(options.limitations, "$.limitations", "E012-SIMPLE-INPUT", "simple-projection", "simple-projection/v1", 1, options.toolId);
    if (!isPlainObject(options.uncertainty)) reject("E012-SIMPLE-INPUT", "simple-projection", "simple-projection/v1", "$.uncertainty", "uncertainty object required", options.toolId);
    var valueText = Object.prototype.hasOwnProperty.call(options, "valueText") ? options.valueText : (state === "unavailable" ? "Unavailable" : state.charAt(0).toUpperCase() + state.slice(1));
    var numericValue = state === "ready" && Object.prototype.hasOwnProperty.call(options, "numericValue") ? options.numericValue : null;
    if (numericValue !== null && !Number.isFinite(numericValue)) reject("E012-SIMPLE-INPUT", "simple-projection", "simple-projection/v1", "$.numericValue", "finite projection value or null required", options.toolId);
    return deepFreeze({
      contractVersion: "simple-projection/v1",
      state: state,
      /* Simple is a decision-first cockpit, so the heading is the tool's own verdict. It used to
         be the constant "Simple model result" on every tool, which told a reader nothing. */
      heading: state === "ready"
        ? ((typeof options.heading === "string" && options.heading.trim()) ? options.heading.trim() : valueText)
        : (SIMPLE_STATE_HEADING[state] || "Result unavailable"),
      message: options.message,
      toolId: typeof options.toolId === "string" ? options.toolId : null,
      definitionId: typeof options.definitionId === "string" ? options.definitionId : null,
      adapterId: typeof options.adapterId === "string" ? options.adapterId : null,
      valueText: valueText,
      numericValue: numericValue,
      unit: typeof options.unit === "string" ? options.unit : null,
      /* What the reader ACTUALLY sees on the value line. valueText/unit stay the machine
         contract; this is the rendered form (grouped digits, unit slug spelled out). Declaring
         it keeps render-versus-projection parity checkable without forcing the panel to print
         a raw slug like "pct-of-universe" at a human. */
      readableValueText: (function () {
        if (state !== "ready" || numericValue === null) return null;
        var readableNumber = readableSimpleNumber(numericValue);
        var readableUnit = readableSimpleUnit(typeof options.unit === "string" ? options.unit : null);
        return (readableNumber || valueText) + (readableUnit ? " " + readableUnit : "");
      })(),
      requiredEvidence: cloneCanonical(options.requiredEvidence),
      observedEvidence: cloneCanonical(options.observedEvidence),
      lastValidComputeIdentity: options.lastValidRun && typeof options.lastValidRun.computeIdentity === "string" ? options.lastValidRun.computeIdentity : null,
      evidenceCutoff: typeof options.evidenceCutoff === "string" ? options.evidenceCutoff : null,
      limitations: cloneCanonical(options.limitations),
      uncertainty: cloneCanonical(options.uncertainty),
      deepLinks: isPlainObject(options.deepLinks) ? cloneCanonical(options.deepLinks) : {},
      noExecution: true
    });
  }

  function uniqueStrings(values) {
    var seen = Object.create(null);
    return values.filter(function (value) {
      if (seen[value]) return false;
      seen[value] = true;
      return true;
    });
  }

  function adapterValue(result, code, phase, contractId, fieldPath, toolId) {
    if (!isPlainObject(result) || result.ok !== true || !Object.prototype.hasOwnProperty.call(result, "value")) {
      reject(code, phase, contractId, fieldPath, "adapter rejected the operation", toolId);
    }
    return result.value;
  }

  function validateSimpleOutput(definition, input, output) {
    var keys = ["contractVersion", "state", "values", "scenarios", "calibration", "provenance", "uncertainty", "assumptions", "limitations", "invalidationConditions", "flatRegionProofs"];
    exactKeys(output, keys, "$.output", "E012-SIMPLE-INPUT", "simple-compute", "simple-model-output/v1", definition.toolId);
    requireVersion(output.contractVersion, "simple-model-output/v1", "$.output.contractVersion", "simple-compute", definition.toolId);
    if (SIMPLE_TRUTH_STATES.indexOf(output.state) === -1) reject("E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, "$.output.state", "unknown output truth state", definition.toolId);
    if (!isPlainObject(output.values)) reject("E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, "$.output.values", "output values object required", definition.toolId);
    canonicalize(output.values);
    if (!Array.isArray(output.scenarios) || output.scenarios.length !== input.scenarios.length) reject("E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, "$.output.scenarios", "scenario results must match normalized scenarios", definition.toolId);
    output.scenarios.forEach(function (scenario, index) {
      var path = "$.output.scenarios[" + index + "]";
      exactKeys(scenario, ["scenarioId", "state", "values"], path, "E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, definition.toolId);
      if (scenario.scenarioId !== input.scenarios[index].scenarioId) reject("E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, path + ".scenarioId", "scenario result identity mismatch", definition.toolId);
      if (SIMPLE_TRUTH_STATES.indexOf(scenario.state) === -1) reject("E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, path + ".state", "unknown scenario truth state", definition.toolId);
      canonicalize(scenario.values);
    });
    exactKeys(output.calibration, ["state", "reason"], "$.output.calibration", "E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, definition.toolId);
    exactKeys(output.provenance, ["classes", "evidenceIdentity"], "$.output.provenance", "E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, definition.toolId);
    exactKeys(output.uncertainty, ["state", "rangeOrBand", "reason"], "$.output.uncertainty", "E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, definition.toolId);
    [output.calibration.state, output.calibration.reason, output.provenance.evidenceIdentity, output.uncertainty.state, output.uncertainty.rangeOrBand, output.uncertainty.reason].forEach(function (value, index) {
      requireString(value, "$.output.metadata[" + index + "]", "E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, definition.toolId);
    });
    requireStringArray(output.provenance.classes, "$.output.provenance.classes", "E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, 1, definition.toolId);
    output.provenance.classes.forEach(function (sourceClass, index) {
      if (definition.provenancePolicy.allowedClasses.indexOf(sourceClass) === -1) reject("E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, "$.output.provenance.classes[" + index + "]", "output provenance class is not declared", definition.toolId);
    });
    if (output.provenance.evidenceIdentity !== input.evidenceIdentity) reject("E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, "$.output.provenance.evidenceIdentity", "output evidence identity mismatch", definition.toolId);
    ["assumptions", "limitations", "invalidationConditions"].forEach(function (key) {
      requireStringArray(output[key], "$.output." + key, "E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, key === "limitations" ? 1 : 0, definition.toolId);
    });
    if (!Array.isArray(output.flatRegionProofs)) reject("E012-SIMPLE-INPUT", "simple-compute", output.contractVersion, "$.output.flatRegionProofs", "flat-region proof array required", definition.toolId);
    return deepFreeze(cloneCanonical(output));
  }

  function validateOwnerProjection(definition, output, projection) {
    exactKeys(projection, ["contractVersion", "state", "valueText", "numericValue", "unit", "summary", "sourceRefs"], "$.ownerProjection", "E012-SIMPLE-INPUT", "simple-projection", "owner-evidence-projection/v1", definition.toolId);
    requireVersion(projection.contractVersion, "owner-evidence-projection/v1", "$.ownerProjection.contractVersion", "simple-projection", definition.toolId);
    if (projection.state !== output.state) reject("E012-SIMPLE-INPUT", "simple-projection", projection.contractVersion, "$.ownerProjection.state", "owner projection state mismatch", definition.toolId);
    ["valueText", "unit", "summary"].forEach(function (key) { requireString(projection[key], "$.ownerProjection." + key, "E012-SIMPLE-INPUT", "simple-projection", projection.contractVersion, definition.toolId); });
    if (projection.numericValue !== null && !Number.isFinite(projection.numericValue)) reject("E012-SIMPLE-INPUT", "simple-projection", projection.contractVersion, "$.ownerProjection.numericValue", "finite owner value or null required", definition.toolId);
    requireStringArray(projection.sourceRefs, "$.ownerProjection.sourceRefs", "E012-SIMPLE-INPUT", "simple-projection", projection.contractVersion, 1, definition.toolId);
    return deepFreeze(cloneCanonical(projection));
  }

  function changedSimpleParameters(definition, baselineInput, currentInput) {
    var baseline = Object.create(null);
    baselineInput.parameters.forEach(function (parameter) { baseline[parameter.parameterId] = parameter.value; });
    return currentInput.parameters.filter(function (parameter) {
      var declared = definition.parameterDefinitions.find(function (candidate) { return candidate.parameterId === parameter.parameterId; });
      return declared.kind !== "seed" && baseline[parameter.parameterId] !== parameter.value;
    }).map(function (parameter) { return parameter.parameterId; });
  }

  function simpleRandomness(definition, baselineInput, currentInput) {
    return deepFreeze({
      contractVersion: "simple-randomness/v1",
      mode: baselineInput.seed !== currentInput.seed ? "path-separated" : (definition.seedPolicy.commonRandomNumbersForSensitivity ? "common-random-numbers" : "deterministic"),
      seed: baselineInput.seed,
      baselinePathIdentity: fingerprint({ evidenceIdentity: baselineInput.evidenceIdentity, seed: baselineInput.seed }),
      currentPathIdentity: fingerprint({ evidenceIdentity: currentInput.evidenceIdentity, seed: currentInput.seed })
    });
  }

  function emptySensitivity(definition, input) {
    return deepFreeze({
      contractVersion: "simple-sensitivity/v1",
      sharedRandomness: simpleRandomness(definition, input, input),
      seedChanged: false,
      effects: []
    });
  }

  function validateSensitivity(definition, baselineInput, currentInput, changedParameters, sensitivity, randomness, baselineOutput, currentOutput) {
    exactKeys(sensitivity, ["contractVersion", "sharedRandomness", "seedChanged", "effects"], "$.sensitivity", "E012-SIMPLE-INPUT", "simple-sensitivity", "simple-sensitivity/v1", definition.toolId);
    requireVersion(sensitivity.contractVersion, "simple-sensitivity/v1", "$.sensitivity.contractVersion", "simple-sensitivity", definition.toolId);
    if (canonicalize(sensitivity.sharedRandomness) !== canonicalize(randomness)) reject("E012-SIMPLE-INPUT", "simple-sensitivity", sensitivity.contractVersion, "$.sensitivity.sharedRandomness", "adapter changed the runtime randomness contract", definition.toolId);
    if (sensitivity.seedChanged !== (baselineInput.seed !== currentInput.seed) || !Array.isArray(sensitivity.effects)) reject("E012-SIMPLE-INPUT", "simple-sensitivity", sensitivity.contractVersion, "$.sensitivity", "invalid sensitivity classification", definition.toolId);
    var effects = sensitivity.effects.filter(function (effect) { return changedParameters.indexOf(effect.parameterId) !== -1; });
    changedParameters.forEach(function (parameterId) {
      var effect = effects.find(function (candidate) { return candidate.parameterId === parameterId; });
      if (!effect || (effect.outputChanged !== true && effect.flatRegionProof === null)) reject("E012-SIMPLE-NO-EFFECT", "simple-sensitivity", sensitivity.contractVersion, "$.sensitivity.effects", "changed parameter has no proved output effect", definition.toolId);
    });
    if (changedParameters.length > 0 && fingerprint(baselineOutput) === fingerprint(currentOutput) && !effects.every(function (effect) { return effect.flatRegionProof !== null; })) {
      reject("E012-SIMPLE-NO-EFFECT", "simple-sensitivity", sensitivity.contractVersion, "$.output", "changed parameter produced no semantic output effect", definition.toolId);
    }
    return deepFreeze({
      contractVersion: sensitivity.contractVersion,
      sharedRandomness: cloneCanonical(randomness),
      seedChanged: sensitivity.seedChanged,
      effects: cloneCanonical(effects)
    });
  }

  function createSimpleRuntimeInternal(config, modelRegistry) {
    var validatedConfig = validateConfigInternal(config);
    if (validatedConfig.performanceBudgets.contractVersion !== "experience-performance-policy/v2") reject("E012-REGISTRY", "simple-runtime", "experience-performance-policy/v2", "$.performanceBudgets.contractVersion", "Simple runtime requires explicit v2 budgets");
    var validatedModels = validateSimpleModelRegistryInternal(modelRegistry, validatedConfig);
    var definitions = Object.create(null);
    var declaredAdapters = Object.create(null);
    validatedModels.definitions.forEach(function (definition) {
      definitions[definition.definitionId] = definition;
      declaredAdapters[definition.adapterId] = definition;
    });
    var adapters = Object.create(null);
    var semanticOutputs = Object.create(null);
    var baselineComputation = null;
    var currentComputation = null;
    var currentDefinition = null;
    var frozenEvidence = null;
    var lastValidRun = null;
    var activeToken = null;
    var tokenSequence = 0;
    var yieldCount = 0;
    var projection = projectSimpleStateInternal("unavailable", {
      message: "Select a declared definition with a registered owner adapter.",
      requiredEvidence: [],
      observedEvidence: [],
      lastValidRun: null,
      evidenceCutoff: null,
      limitations: ["The shared core supplies no owner formula or behavioral default."],
      uncertainty: { state: "unavailable", reason: "No validated owner run exists." },
      deepLinks: {}
    });

    function registerAdapter(adapter) {
      return capture(function () {
        exactKeys(adapter, SIMPLE_ADAPTER_KEYS, "$.adapter", "E012-REGISTRY", "simple-adapter", "simple-model-adapter/v1");
        requireVersion(adapter.contractVersion, "simple-model-adapter/v1", "$.adapter.contractVersion", "simple-adapter");
        requireString(adapter.adapterId, "$.adapter.adapterId", "E012-REGISTRY", "simple-adapter", adapter.contractVersion);
        requireStringArray(adapter.supportedDefinitionIds, "$.adapter.supportedDefinitionIds", "E012-REGISTRY", "simple-adapter", adapter.contractVersion, 1);
        ["validateDefinition", "captureEvidence", "normalizeInputs", "compute", "compareSensitivity", "projectOwnerEvidence"].forEach(function (method) {
          if (typeof adapter[method] !== "function") reject("E012-REGISTRY", "simple-adapter", adapter.contractVersion, "$.adapter." + method, "adapter method required");
        });
        var definition = declaredAdapters[adapter.adapterId];
        if (!definition) reject("E012-REGISTRY", "simple-adapter", adapter.contractVersion, "$.adapter.adapterId", "adapter is not declared");
        if (adapters[adapter.adapterId]) reject("E012-REGISTRY", "simple-adapter", adapter.contractVersion, "$.adapter.adapterId", "adapter is already registered", definition.toolId);
        if (adapter.supportedDefinitionIds.length !== 1 || adapter.supportedDefinitionIds[0] !== definition.definitionId) reject("E012-REGISTRY", "simple-adapter", adapter.contractVersion, "$.adapter.supportedDefinitionIds", "adapter definition declaration is not exact", definition.toolId);
        var adapterDefinition = adapterValue(adapter.validateDefinition(definition), "E012-SIMPLE-DEFINITION", "simple-adapter", adapter.contractVersion, "$.adapter.validateDefinition", definition.toolId);
        if (canonicalize(adapterDefinition) !== canonicalize(definition)) reject("E012-SIMPLE-DEFINITION", "simple-adapter", adapter.contractVersion, "$.adapter.validateDefinition", "adapter changed the definition", definition.toolId);
        adapters[adapter.adapterId] = adapter;
        return deepFreeze({ adapterId: adapter.adapterId, supportedDefinitionIds: cloneCanonical(adapter.supportedDefinitionIds), registered: true });
      });
    }

    function adapterStatus(definitionId) {
      return capture(function () {
        var definition = definitions[definitionId];
        if (!definition) reject("E012-REGISTRY", "simple-adapter", "simple-model-adapter/v1", "$.definitionId", "definition is not declared");
        return deepFreeze({ definitionId: definitionId, adapterId: definition.adapterId, registered: Boolean(adapters[definition.adapterId]) });
      });
    }

    function beginToken(definition) {
      var token = { id: tokenSequence + 1, cancelled: false };
      tokenSequence = token.id;
      activeToken = token;
      var control = {
        tokenId: token.id,
        chunkMaxMs: validatedConfig.performanceBudgets.cooperativeChunkMaxMs,
        checkpoint: function () {
          if (token.cancelled) reject("E012-SIMPLE-INPUT", "simple-runtime", "simple-cancellation-token/v1", "$.token", "computation cancelled", definition.toolId);
          if (activeToken !== token) reject("E012-SIMPLE-INPUT", "simple-runtime", "simple-cancellation-token/v1", "$.token", "stale completion discarded", definition.toolId);
        },
        yield: function () {
          control.checkpoint();
          yieldCount += 1;
          return new Promise(function (resolve, rejectPromise) {
            setTimeout(function () {
              try {
                control.checkpoint();
                resolve();
              } catch (error) {
                rejectPromise(error);
              }
            }, 0);
          });
        }
      };
      return { token: token, control: deepFreeze(control) };
    }

    async function normalizedFromAdapter(definition, adapter, evidence, values, seed, scenarios) {
      var core = normalizeSimpleInputInternal(definition, evidence, values, seed, scenarios);
      var adapterInput = adapterValue(await adapter.normalizeInputs(definition, evidence, values, seed, scenarios), "E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.adapter.normalizeInputs", definition.toolId);
      if (canonicalize(core) !== canonicalize(adapterInput)) reject("E012-SIMPLE-INPUT", "simple-input", "normalized-simple-input/v1", "$.adapter.normalizeInputs", "adapter normalization differs from the core", definition.toolId);
      return core;
    }

    async function compute(definition, adapter, input, control) {
      control.checkpoint();
      var computeIdentity = computeSimpleIdentityInternal(input);
      var output = validateSimpleOutput(definition, input, adapterValue(await adapter.compute(input, control), "E012-SIMPLE-INPUT", "simple-compute", "simple-model-output/v1", "$.adapter.compute", definition.toolId));
      control.checkpoint();
      var outputFingerprint = fingerprint(output);
      if (semanticOutputs[computeIdentity] && semanticOutputs[computeIdentity] !== outputFingerprint) reject("E012-SIMPLE-NONDETERMINISTIC", "simple-compute", output.contractVersion, "$.output", "same compute identity produced different output", definition.toolId);
      semanticOutputs[computeIdentity] = outputFingerprint;
      var ownerProjection = validateOwnerProjection(definition, output, adapterValue(await adapter.projectOwnerEvidence(output), "E012-SIMPLE-INPUT", "simple-projection", "owner-evidence-projection/v1", "$.adapter.projectOwnerEvidence", definition.toolId));
      control.checkpoint();
      return deepFreeze({
        contractVersion: "simple-computation/v1",
        computeIdentity: computeIdentity,
        input: input,
        output: output,
        ownerProjection: ownerProjection
      });
    }

    function buildRun(definition, baseline, current, sensitivity, changedParameters, computedAt) {
      requireString(computedAt, "$.computedAt", "E012-SIMPLE-INPUT", "simple-run", "simple-model-run/v1", definition.toolId);
      return deepFreeze({
        contractVersion: "simple-model-run/v1",
        computeIdentity: current.computeIdentity,
        toolId: definition.toolId,
        definitionId: definition.definitionId,
        modelId: definition.modelId,
        modelVersion: definition.modelVersion,
        state: current.output.state,
        researchQuestion: definition.researchQuestion,
        baseline: baseline,
        current: current,
        changedParameters: cloneCanonical(changedParameters),
        scenarios: current.output.scenarios,
        sensitivity: sensitivity,
        calibration: current.output.calibration,
        provenance: current.output.provenance,
        uncertainty: current.output.uncertainty,
        assumptions: uniqueStrings(current.output.assumptions),
        limitations: uniqueStrings(definition.limitations.concat(current.input.limitations, current.output.limitations)),
        invalidationConditions: uniqueStrings(current.output.invalidationConditions),
        evidenceRefs: current.input.evidenceRefs,
        evidenceCutoff: current.input.evidenceCutoff,
        computedAt: computedAt,
        deepLinks: cloneCanonical(definition.deepLinkTargets)
      });
    }

    function setReadyProjection(definition, computation, run) {
      projection = projectSimpleStateInternal(computation.output.state, {
        toolId: definition.toolId,
        definitionId: definition.definitionId,
        adapterId: definition.adapterId,
        message: computation.ownerProjection.summary,
        valueText: computation.ownerProjection.valueText,
        numericValue: computation.ownerProjection.numericValue,
        unit: computation.ownerProjection.unit,
        requiredEvidence: definition.inputRequirements.filter(function (requirement) { return requirement.required; }).map(function (requirement) { return requirement.requirementId; }),
        observedEvidence: computation.input.evidenceRefs.map(function (reference) { return reference.requirementId; }),
        lastValidRun: run,
        evidenceCutoff: computation.input.evidenceCutoff,
        limitations: run.limitations,
        uncertainty: { state: computation.output.uncertainty.state, reason: computation.output.uncertainty.reason },
        deepLinks: definition.deepLinkTargets
      });
    }

    function failureState(evidence) {
      if (evidence && SIMPLE_TRUTH_STATES.indexOf(evidence.state) !== -1 && evidence.state !== "ready") return evidence.state;
      return "rejected";
    }

    function recordFailure(error, definition, evidence) {
      if (error.details.reason === "stale completion discarded") return;
      var state = failureState(evidence);
      var target = definition || currentDefinition;
      projection = projectSimpleStateInternal(state, {
        toolId: target ? target.toolId : null,
        definitionId: target ? target.definitionId : null,
        adapterId: target ? target.adapterId : null,
        message: state === "stale" ? "Required owner evidence is stale." : state === "unavailable" ? "Required owner evidence is unavailable." : "Candidate input was rejected by the Simple contract.",
        requiredEvidence: target ? target.inputRequirements.filter(function (requirement) { return requirement.required; }).map(function (requirement) { return requirement.requirementId; }) : [],
        observedEvidence: evidence && Array.isArray(evidence.evidenceRefs) ? evidence.evidenceRefs.map(function (reference) { return reference.requirementId; }) : [],
        lastValidRun: lastValidRun,
        evidenceCutoff: evidence && typeof evidence.evidenceCutoff === "string" ? evidence.evidenceCutoff : null,
        limitations: target ? target.limitations : ["The shared core supplies no owner formula or behavioral default."],
        uncertainty: { state: state, reason: error.details.reason },
        deepLinks: target ? target.deepLinkTargets : {}
      });
    }

    async function execute(operation, context) {
      try {
        return deepFreeze({ ok: true, value: deepFreeze(await operation()) });
      } catch (error) {
        if (error instanceof ContractFailure) {
          recordFailure(error, context.definition, context.evidence);
          return deepFreeze({ ok: false, error: error.details });
        }
        var projected = new ContractFailure({ code: "E012-SIMPLE-INPUT", phase: "simple-runtime", contractId: "simple-model-run/v1", fieldPath: "$", reason: "runtime rejected an unsupported adapter value", toolId: context.definition && context.definition.toolId });
        recordFailure(projected, context.definition, context.evidence);
        return deepFreeze({ ok: false, error: projected.details });
      }
    }

    async function prepare(options) {
      var context = { definition: null, evidence: null };
      return execute(async function () {
        exactKeys(options, ["definitionId", "ownerContext", "parameterValues", "seed", "scenarioIds", "computedAt"], "$", "E012-SIMPLE-INPUT", "simple-runtime", "simple-model-run/v1");
        var definition = definitions[options.definitionId];
        context.definition = definition;
        if (!definition) reject("E012-REGISTRY", "simple-runtime", "simple-model-run/v1", "$.definitionId", "definition is not declared");
        var adapter = adapters[definition.adapterId];
        if (!adapter) reject("E012-REGISTRY", "simple-runtime", "simple-model-adapter/v1", "$.adapterId", "declared owner adapter is not registered", definition.toolId);
        var evidence = adapterValue(await adapter.captureEvidence(options.ownerContext), "E012-SIMPLE-INPUT", "simple-input", "simple-evidence-snapshot/v1", "$.adapter.captureEvidence", definition.toolId);
        context.evidence = evidence;
        var input = await normalizedFromAdapter(definition, adapter, evidence, options.parameterValues, options.seed, options.scenarioIds);
        var token = beginToken(definition);
        var computation = await compute(definition, adapter, input, token.control);
        token.control.checkpoint();
        currentDefinition = definition;
        frozenEvidence = deepFreeze(cloneCanonical(evidence));
        baselineComputation = computation;
        currentComputation = computation;
        var run = buildRun(definition, computation, computation, emptySensitivity(definition, input), [], options.computedAt);
        lastValidRun = run;
        setReadyProjection(definition, computation, run);
        return run;
      }, context);
    }

    async function recompute(options) {
      var context = { definition: currentDefinition, evidence: frozenEvidence };
      return execute(async function () {
        exactKeys(options, ["parameterValues", "seed", "scenarioIds", "computedAt"], "$", "E012-SIMPLE-INPUT", "simple-runtime", "simple-model-run/v1", currentDefinition && currentDefinition.toolId);
        if (!currentDefinition || !baselineComputation || !frozenEvidence) reject("E012-SIMPLE-INPUT", "simple-runtime", "simple-model-run/v1", "$", "valid baseline required before recompute");
        var adapter = adapters[currentDefinition.adapterId];
        var input = await normalizedFromAdapter(currentDefinition, adapter, frozenEvidence, options.parameterValues, options.seed, options.scenarioIds);
        var token = beginToken(currentDefinition);
        var computation = await compute(currentDefinition, adapter, input, token.control);
        token.control.checkpoint();
        var changedParameters = changedSimpleParameters(currentDefinition, baselineComputation.input, input);
        var randomness = simpleRandomness(currentDefinition, baselineComputation.input, input);
        var rawSensitivity = adapterValue(await adapter.compareSensitivity(baselineComputation.input, input, randomness), "E012-SIMPLE-INPUT", "simple-sensitivity", "simple-sensitivity/v1", "$.adapter.compareSensitivity", currentDefinition.toolId);
        token.control.checkpoint();
        var sensitivity = validateSensitivity(currentDefinition, baselineComputation.input, input, changedParameters, rawSensitivity, randomness, baselineComputation.output, computation.output);
        currentComputation = computation;
        var run = buildRun(currentDefinition, baselineComputation, computation, sensitivity, changedParameters, options.computedAt);
        lastValidRun = run;
        setReadyProjection(currentDefinition, computation, run);
        return run;
      }, context);
    }

    async function refreshEvidence(options) {
      var context = { definition: currentDefinition, evidence: null };
      return execute(async function () {
        exactKeys(options, ["ownerContext", "parameterValues", "seed", "scenarioIds", "computedAt"], "$", "E012-SIMPLE-INPUT", "simple-runtime", "simple-model-run/v1", currentDefinition && currentDefinition.toolId);
        if (!currentDefinition) reject("E012-SIMPLE-INPUT", "simple-runtime", "simple-model-run/v1", "$", "valid definition required before evidence refresh");
        var adapter = adapters[currentDefinition.adapterId];
        var evidence = adapterValue(await adapter.captureEvidence(options.ownerContext), "E012-SIMPLE-INPUT", "simple-input", "simple-evidence-snapshot/v1", "$.adapter.captureEvidence", currentDefinition.toolId);
        context.evidence = evidence;
        var input = await normalizedFromAdapter(currentDefinition, adapter, evidence, options.parameterValues, options.seed, options.scenarioIds);
        var token = beginToken(currentDefinition);
        var computation = await compute(currentDefinition, adapter, input, token.control);
        token.control.checkpoint();
        frozenEvidence = deepFreeze(cloneCanonical(evidence));
        baselineComputation = computation;
        currentComputation = computation;
        var run = buildRun(currentDefinition, computation, computation, emptySensitivity(currentDefinition, input), [], options.computedAt);
        lastValidRun = run;
        setReadyProjection(currentDefinition, computation, run);
        return run;
      }, context);
    }

    function resetBaseline(options) {
      return capture(function () {
        exactKeys(options, ["computedAt"], "$", "E012-SIMPLE-INPUT", "simple-runtime", "simple-model-run/v1", currentDefinition && currentDefinition.toolId);
        if (!currentDefinition || !currentComputation) reject("E012-SIMPLE-INPUT", "simple-runtime", "simple-model-run/v1", "$", "current valid run required before baseline reset");
        baselineComputation = currentComputation;
        var run = buildRun(currentDefinition, currentComputation, currentComputation, emptySensitivity(currentDefinition, currentComputation.input), [], options.computedAt);
        lastValidRun = run;
        setReadyProjection(currentDefinition, currentComputation, run);
        return run;
      });
    }

    function cancel() {
      return capture(function () {
        if (!activeToken) reject("E012-SIMPLE-INPUT", "simple-runtime", "simple-cancellation-token/v1", "$.token", "no active computation to cancel", currentDefinition && currentDefinition.toolId);
        activeToken.cancelled = true;
        return deepFreeze({ cancelled: true, tokenId: activeToken.id });
      });
    }

    function snapshot() {
      return capture(function () {
        return deepFreeze({
          contractVersion: "simple-runtime-snapshot/v1",
          state: projection.state,
          definitionId: currentDefinition ? currentDefinition.definitionId : null,
          baseline: baselineComputation,
          current: currentComputation,
          lastValidRun: lastValidRun,
          projection: projection
        });
      });
    }

    function diagnostic() {
      return capture(function () {
        return deepFreeze({
          contractVersion: "simple-runtime-diagnostic/v1",
          definitionCount: validatedModels.definitions.length,
          declaredAdapterCount: Object.keys(declaredAdapters).length,
          registeredAdapterCount: Object.keys(adapters).length,
          currentComputeIdentity: lastValidRun ? lastValidRun.computeIdentity : null,
          currentState: projection.state,
          cooperativeChunkMaxMs: validatedConfig.performanceBudgets.cooperativeChunkMaxMs,
          yieldCount: yieldCount,
          toolIdBranchCount: 0,
          authority: { network: false, provider: false, storage: false, authoring: false, publication: false, formula: false }
        });
      });
    }

    return deepFreeze({
      registerAdapter: registerAdapter,
      adapterStatus: adapterStatus,
      prepare: prepare,
      recompute: recompute,
      refreshEvidence: refreshEvidence,
      resetBaseline: resetBaseline,
      cancel: cancel,
      snapshot: snapshot,
      project: function () { return capture(function () { return projection; }); },
      diagnostic: diagnostic
    });
  }

  /* Reader-facing formatting for the Simple value line. The unit is a contract id such as
     "country-score"; a reader needs "country score". */
  function readableSimpleUnit(unit) {
    return (typeof unit === "string" && unit) ? unit.replace(/-/g, " ") : "";
  }
  function readableSimpleNumber(value) {
    if (!Number.isFinite(value)) return "";
    var magnitude = Math.abs(value);
    var digits = magnitude >= 100 ? 0 : (magnitude >= 1 ? 2 : 4);
    return value.toFixed(digits);
  }

  function renderSimpleProjectionInternal(host, projection) {
    if (!host || typeof host.appendChild !== "function" || !host.ownerDocument) reject("E012-SIMPLE-INPUT", "simple-projection", "simple-projection/v1", "$.host", "DOM host required", projection && projection.toolId);
    var documentRef = host.ownerDocument;
    host.textContent = "";
    host.className = "rlexperience-placeholder";
    host.hidden = false;
    host.setAttribute("data-rlexperience-simple-state", projection.state);
    if (projection.adapterId) host.setAttribute("data-rlexperience-adapter", projection.adapterId);
    var heading = documentRef.createElement("h2");
    heading.textContent = projection.heading;
    host.appendChild(heading);
    var message = documentRef.createElement("p");
    message.textContent = projection.message;
    host.appendChild(message);
    if (projection.state === "ready" && projection.numericValue !== null) {
      var value = documentRef.createElement("p");
      value.setAttribute("data-simple-numeric-value", "current");
      /* The owner model computes a number and the projection carries it, but the renderer used
         to print only valueText — a fixed label like "Rotate toward EWY". Steering a control
         moved the number and the reader saw nothing change. The label is now the heading, so
         this line carries the figure itself. */
      var readable = readableSimpleNumber(projection.numericValue);
      var unitText = readableSimpleUnit(projection.unit);
      value.textContent = projection.readableValueText || ((readable || projection.valueText) + (unitText ? " " + unitText : ""));
      host.appendChild(value);
    }
    /* The preserved-run compute identity is provenance, not a reader fact. It stays on the
       projection for the Power evidence disclosure and no longer prints a sha256 here. */
    var limitation = documentRef.createElement("p");
    limitation.textContent = "Limitation: " + projection.limitations.join(" ");
    host.appendChild(limitation);
    return projection;
  }

  function runtimeDiagnosticInternal() {
    return deepFreeze({
      contractVersion: "simple-runtime-diagnostic/v1",
      definitionCount: 0,
      declaredAdapterCount: 0,
      registeredAdapterCount: 0,
      currentComputeIdentity: null,
      currentState: "unavailable",
      cooperativeChunkMaxMs: null,
      yieldCount: 0,
      toolIdBranchCount: 0,
      authority: { network: false, provider: false, storage: false, authoring: false, publication: false, formula: false }
    });
  }

  /* Which UMD adapter-module global + registrar drives each ordinary tool's
     Simple adapter. Keyed by the simple-models.json `adapterModule` path. This is
     infrastructure wiring (which module + registrar), never an owner formula. The
     brief-only `market-action.js` runs inside Brief and is intentionally absent. */
  var ADAPTER_MODULE_BINDINGS = {
    "rlexperience-adapters/market-structure.js": { global: "RLMARKETSTRUCTURE", register: "registerMarketStructureAdapters" },
    "rlexperience-adapters/options.js": { global: "RLOPTIONS", register: "registerOptionsAdapters" },
    "rlexperience-adapters/macro-rotation.js": { global: "RLMACROROTATION", register: "registerMacroRotationAdapters" },
    "rlexperience-adapters/fundamental-models.js": { global: "RLFUNDAMENTALS", register: "registerFundamentalModelsAdapters" },
    "rlexperience-adapters/strategy-research.js": { global: "RLSTRATEGY", register: "registerStrategyResearchAdapters" },
    "rlexperience-adapters/property-research.js": { global: "RLPROPERTY", register: "registerPropertyResearchAdapters" },
    "rlexperience-adapters/research-agenda.js": { global: "RLRESEARCHAGENDA", register: "registerResearchAgendaAdapters" },
    "rlexperience-adapters/company-intelligence.js": { global: "RLCOMPANYEXPERIENCE", register: "registerCompanyIntelligenceAdapters" }
  };

  /* ─── Steerable Simple-control helpers ───────────────────────────────────────
     Simple is a user-steerable cockpit, not a static verdict: every declared
     parameterDefinition becomes a REAL control that changes a real model input and
     recomputes production logic. These helpers read ONLY a parameter's OWN declared
     metadata — kind, label, unit, interpretation, and domain (enum/boolean options,
     or numeric min/max/step) — so no range, option, step, or default is ever
     invented here. */

  /* A numeric domain wider than this many steps gets an exact number field instead
     of a slider; a slider over millions of steps cannot express its own domain. */
  var CONTROL_MAX_SLIDER_STEPS = 1000;

  function controlIsChoice(parameter) {
    return parameter.kind === "enum" || parameter.kind === "boolean";
  }

  /* Declared option values are strings or booleans; DOM option values are strings.
     Tokenizing both ways keeps the round-trip exact (never a parsed guess). */
  function controlOptionToken(value) {
    return typeof value === "boolean" ? (value ? "true" : "false") : String(value);
  }

  function controlOptionFromToken(parameter, token) {
    var options = (parameter.domain && parameter.domain.options) || [];
    for (var i = 0; i < options.length; i += 1) {
      if (controlOptionToken(options[i].value) === token) return { found: true, value: options[i].value };
    }
    return { found: false, value: null };
  }

  function controlOptionLabel(parameter, value) {
    var options = (parameter.domain && parameter.domain.options) || [];
    for (var i = 0; i < options.length; i += 1) {
      if (options[i].value === value) return options[i].label;
    }
    return controlOptionToken(value);
  }

  /* The parameter's OWN declared domain rule — the same finite/integer/range/step
     predicate the runtime enforces. A value that fails it is refused, never clamped
     or rounded into range. */
  function controlNumberIsDeclared(parameter, value) {
    var domain = parameter.domain || {};
    if (!Number.isFinite(value)) return false;
    if ((parameter.kind === "integer" || parameter.kind === "seed") && !Number.isInteger(value)) return false;
    if (value < domain.min || value > domain.max) return false;
    var stepPosition = (value - domain.min) / domain.step;
    return Math.abs(stepPosition - Math.round(stepPosition)) <= 1e-9;
  }

  function controlIsRepresentable(parameter, value) {
    if (controlIsChoice(parameter)) return controlOptionFromToken(parameter, controlOptionToken(value)).found;
    return controlNumberIsDeclared(parameter, value);
  }

  function controlValueText(parameter, value) {
    if (controlIsChoice(parameter)) return controlOptionLabel(parameter, value);
    return String(value) + (parameter.unit ? " " + parameter.unit : "");
  }

  /* Repo tooltip rule: say what the control IS and what its CURRENT setting means. */
  function controlTooltip(parameter, value) {
    return parameter.label + " — " + parameter.interpretation + " Current setting: " + controlValueText(parameter, value) + ".";
  }

  var CONTROL_STYLES = {
    container: "margin-top:14px;padding-top:12px;border-top:1px solid #263646;display:grid;gap:9px",
    note: "margin:0 0 2px;font-size:12px;color:#7f93a6",
    row: "display:grid;grid-template-columns:minmax(120px,auto) minmax(90px,1fr) auto;gap:10px;align-items:center",
    label: "font-size:13px;color:#9fb2c4",
    select: "min-width:0;background:#0b1219;color:#dce9f5;border:1px solid #2b3d50;border-radius:6px;padding:4px 6px;font:inherit;font-size:13px",
    number: "min-width:0;background:#0b1219;color:#dce9f5;border:1px solid #2b3d50;border-radius:6px;padding:4px 6px;font:inherit;font-size:13px",
    range: "min-width:0;width:100%;accent-color:#4da3ff",
    readout: "font-size:13px;color:#cfe0ef;font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap"
  };

  /* Production Simple-view bridge (Model B — Scope 15). On rlviews:change→simple
     for an ordinary tool, resolve the tool's registered adapter definition, obtain
     the page's REAL owner state through the uniform provider seam, run the exact
     production runtime (createSimpleRuntime + register<Domain>Adapters + prepare)
     the adapter e2e already proves, and render the real projection into
     [data-rlexperience-panel="simple"]. When no provider / owner state / adapter
     module is available, or the owner evidence does not permit a run, render the
     honest "unavailable" projection (truthful degradation — no invented signal).

     INVARIANT (BUG-003 closure): this bridge NEVER mutates body.rlv-focused —
     applyVisual (rlviews.js) is the sole owner of that class. The bridge performs
     local compute only: it never fetch/providerFetch, reads credentials, calls an
     author/publisher/store, or mutates owner state. */
  function renderSimpleBridgeInternal(options) {
    options = options || {};
    var panel = options.panel;
    if (!panel) return Promise.resolve(null);
    var toolId = options.toolId;
    var definition = options.definition || null;
    var ownerState = options.ownerState || null;
    var moduleObject = options.moduleObject || null;
    var registerFnName = options.registerFnName || null;
    var api = options.api || null;
    var config = options.config || null;
    var experience = options.toolExperience || null;
    var adapterId = options.adapterId || (definition && definition.simpleAdapterId) || (experience && experience.simpleAdapterId) || null;
    var definitionId = (definition && definition.definitionId) || (experience && experience.simpleModelDefinitionId) || null;

    /* Cross-invocation paint guard (BUG-004 FR-B004-09). `runSequence` below already
       supersedes a stale run WITHIN one invocation. This claims the caller's shared
       generation so a stale invocation cannot paint over a NEWER one either: the
       boot-time run that resolves to "unavailable" must not land after an
       owner-readiness refresh has already painted "ready". Absent the seam (the
       public renderSimpleBridge API, and every existing caller) the bridge behaves
       exactly as before — nothing is gated. */
    var claimGeneration = typeof options.claimGeneration === "function" ? options.claimGeneration : null;
    var isCurrentGeneration = typeof options.isCurrentGeneration === "function" ? options.isCurrentGeneration : null;
    var hasAcceptedGeneration = Object.prototype.hasOwnProperty.call(options, "acceptedGeneration");
    var generation = hasAcceptedGeneration ? options.acceptedGeneration : (claimGeneration ? claimGeneration() : null);
    function mayPaint() { return !isCurrentGeneration || isCurrentGeneration(generation); }

    function honestUnavailable(reason) {
      var projection = projectSimpleStateInternal("unavailable", {
        toolId: toolId,
        definitionId: definitionId,
        adapterId: adapterId,
        message: "This tool's own model is not loaded, so there is no result to show. Nothing was requested, saved, published, or filled in from a default.",
        requiredEvidence: ["owner-evidence"],
        observedEvidence: [],
        lastValidRun: null,
        evidenceCutoff: null,
        limitations: ["The shared core cannot invent or substitute the missing owner model."],
        uncertainty: { state: "unavailable", reason: reason || "The declared owner adapter is not available." },
        deepLinks: { power: "#power", journey: "#journey" }
      });
      if (mayPaint()) renderSimpleProjectionInternal(panel, projection);
      return projection;
    }

    if (!definition || !ownerState || !moduleObject || !registerFnName || typeof moduleObject[registerFnName] !== "function" || !api || !config) {
      return Promise.resolve(honestUnavailable("No wired owner-state provider or adapter module is available for this tool."));
    }

    var runtime;
    try {
      runtime = createSimpleRuntimeInternal(config, { contractVersion: "simple-model-registry/v1", definitions: [definition] });
      moduleObject[registerFnName](runtime, api, [definition], { rlvol: (typeof globalThis !== "undefined" ? globalThis.RLVOL : undefined) });
    } catch (setupError) {
      return Promise.resolve(honestUnavailable("The owner adapter runtime could not be initialized."));
    }

    var parameterValues = {};
    var definitions = Array.isArray(definition.parameterDefinitions) ? definition.parameterDefinitions : [];
    for (var i = 0; i < definitions.length; i += 1) parameterValues[definitions[i].parameterId] = definitions[i].defaultValue;
    var seed = (definition.seedPolicy && definition.seedPolicy.required) ? definition.seedPolicy.defaultSeed : null;

    /* Cancellation safety. The runtime already supersedes an in-flight computation:
       a newer prepare installs a new active token, so the older one's control
       checkpoint refuses with "stale completion discarded" — the one failure the
       runtime deliberately does NOT project, leaving the newer result standing.
       This sequence mirrors that decision in the panel: a superseded continuation
       paints nothing, so a rapid control change can never render a stale projection
       (or a stale-completion "unavailable") over a newer one. */
    var runSequence = 0;
    var controlNodes = null;
    var panelDocument = panel.ownerDocument || null;

    function pendingValues() {
      var values = {};
      for (var key in parameterValues) {
        if (Object.prototype.hasOwnProperty.call(parameterValues, key)) values[key] = parameterValues[key];
      }
      return values;
    }

    function restoreControlFocus(parameterId) {
      if (!parameterId || !controlNodes) return;
      var node = controlNodes[parameterId];
      if (node && typeof node.focus === "function") node.focus();
    }

    /* A control moved: adopt the new value and re-run the SAME production path that
       painted the first projection — local compute over the owner state already
       captured for this render. No provider request, no re-read, no new data. */
    function commitControl(parameter, node) {
      if (!mayPaint()) return;
      var next;
      if (controlIsChoice(parameter)) {
        var decoded = controlOptionFromToken(parameter, String(node.value));
        if (!decoded.found) return;
        next = decoded.value;
      } else {
        next = Number(node.value);
        if (typeof node.setAttribute === "function") node.setAttribute("aria-invalid", controlNumberIsDeclared(parameter, next) ? "false" : "true");
        if (!controlNumberIsDeclared(parameter, next)) return;
      }
      if (next === parameterValues[parameter.parameterId]) return;
      parameterValues[parameter.parameterId] = next;
      /* A user actuation makes THIS invocation the live one again: its controls are the
         ones on screen, so its result must outrank any older pending run (FR-B004-09). */
      if (claimGeneration && !hasAcceptedGeneration) generation = claimGeneration();
      var keepFocus = !!(panelDocument && panelDocument.activeElement === node);
      run(new Date().toISOString(), keepFocus ? parameter.parameterId : null);
    }

    function buildControlRow(parameter, shown) {
      var row = panelDocument.createElement("div");
      row.className = "rlexperience-control";
      row.setAttribute("data-rlexperience-control", parameter.parameterId);
      row.setAttribute("style", CONTROL_STYLES.row);

      var elementId = "rlexperience-control-" + String(toolId) + "-" + parameter.parameterId;
      var label = panelDocument.createElement("label");
      label.setAttribute("for", elementId);
      label.setAttribute("style", CONTROL_STYLES.label);
      label.textContent = parameter.label;
      row.appendChild(label);

      var node;
      var styleKey;
      if (controlIsChoice(parameter)) {
        node = panelDocument.createElement("select");
        styleKey = "select";
        parameter.domain.options.forEach(function (option) {
          var optionNode = panelDocument.createElement("option");
          var token = controlOptionToken(option.value);
          optionNode.setAttribute("value", token);
          optionNode.value = token;
          optionNode.textContent = option.label;
          if (option.value === shown) {
            optionNode.setAttribute("selected", "selected");
            optionNode.selected = true;
          }
          node.appendChild(optionNode);
        });
        node.value = controlOptionToken(shown);
      } else {
        var domain = parameter.domain;
        var stepCount = domain.step > 0 ? (domain.max - domain.min) / domain.step : Infinity;
        var inputType = stepCount <= CONTROL_MAX_SLIDER_STEPS ? "range" : "number";
        node = panelDocument.createElement("input");
        styleKey = inputType;
        node.setAttribute("type", inputType);
        node.type = inputType;
        node.setAttribute("min", String(domain.min));
        node.setAttribute("max", String(domain.max));
        node.setAttribute("step", String(domain.step));
        node.setAttribute("value", String(shown));
        node.value = String(shown);
      }
      node.id = elementId;
      node.setAttribute("id", elementId);
      node.setAttribute("data-rlexperience-control-input", parameter.parameterId);
      node.setAttribute("title", controlTooltip(parameter, shown));
      node.setAttribute("style", CONTROL_STYLES[styleKey]);
      row.appendChild(node);

      var readout = panelDocument.createElement("span");
      readout.setAttribute("data-rlexperience-control-value", parameter.parameterId);
      readout.setAttribute("style", CONTROL_STYLES.readout);
      readout.textContent = controlValueText(parameter, shown);
      row.appendChild(readout);

      if (typeof node.addEventListener === "function") {
        if (controlIsChoice(parameter)) {
          node.addEventListener("keydown", function (event) {
            var options = parameter.domain.options;
            var currentIndex = options.map(function (option) {
              return controlOptionToken(option.value);
            }).indexOf(String(node.value));
            var nextIndex = currentIndex;
            if (event.key === "Home") nextIndex = 0;
            else if (event.key === "End") nextIndex = options.length - 1;
            else if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = Math.min(options.length - 1, currentIndex + 1);
            else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = Math.max(0, currentIndex - 1);
            else return;
            event.preventDefault();
            node.value = controlOptionToken(options[nextIndex].value);
            commitControl(parameter, node);
          });
        }
        /* "input" only moves the readout (free); the model re-runs on the committed
           "change", so dragging a slider stays smooth and every commit is a real run. */
        node.addEventListener("input", function () {
          if (!mayPaint()) return;
          if (controlIsChoice(parameter)) return;
          var live = Number(node.value);
          if (!Number.isFinite(live)) return;
          readout.textContent = controlValueText(parameter, live);
          node.setAttribute("title", controlTooltip(parameter, live));
        });
        node.addEventListener("change", function () { commitControl(parameter, node); });
      }
      controlNodes[parameter.parameterId] = node;
      return row;
    }

    /* One REAL control per declared parameter. Positions come from the run's RESOLVED
       input, so an evidence-derived parameter shows the value the owner evidence
       supplied while parameterValues keeps sending its declared default — first paint
       is byte-identical to the pre-control bridge. Controls are painted only for a run
       that published a result: with nothing to steer, a lever would be decorative. */
    function renderControls(resolvedParameters) {
      if (!panelDocument || typeof panelDocument.createElement !== "function" || typeof panel.appendChild !== "function") return;
      var resolved = Object.create(null);
      (resolvedParameters || []).forEach(function (entry) { resolved[entry.parameterId] = entry.value; });
      var container = panelDocument.createElement("div");
      container.className = "rlexperience-controls";
      container.setAttribute("role", "group");
      container.setAttribute("aria-label", "Model parameters");
      container.setAttribute("data-rlexperience-controls", "parameters");
      container.setAttribute("style", CONTROL_STYLES.container);
      var note = panelDocument.createElement("p");
      note.setAttribute("data-rlexperience-controls-note", "steerable");
      note.setAttribute("style", CONTROL_STYLES.note);
      note.textContent = "Steer the model: each control changes a declared model input and recomputes the owner model on the evidence already loaded — nothing new is requested.";
      container.appendChild(note);
      controlNodes = Object.create(null);
      definitions.forEach(function (parameter) {
        var shown = Object.prototype.hasOwnProperty.call(resolved, parameter.parameterId) ? resolved[parameter.parameterId] : parameter.defaultValue;
        if (!controlIsRepresentable(parameter, shown)) return;
        container.appendChild(buildControlRow(parameter, shown));
      });
      panel.appendChild(container);
    }

    function run(computedAt, focusParameterId) {
      runSequence += 1;
      var mySequence = runSequence;
      return Promise.resolve(runtime.prepare({
        definitionId: definition.definitionId,
        ownerContext: { ownerState: ownerState },
        parameterValues: pendingValues(),
        seed: seed,
        scenarioIds: ["baseline"],
        computedAt: computedAt
      })).then(function (prepared) {
        if (mySequence !== runSequence || !mayPaint()) return null;
        if (!prepared || !prepared.ok) return honestUnavailable("The owner evidence does not currently permit a model run.");
        var settled = runtime.snapshot().value;
        var projection = settled.projection;
        renderSimpleProjectionInternal(panel, projection);
        if (projection.state !== "unavailable" && settled.current) {
          renderControls(settled.current.input.parameters);
          restoreControlFocus(focusParameterId);
        }
        return projection;
      }).catch(function () {
        if (mySequence !== runSequence || !mayPaint()) return null;
        return honestUnavailable("The owner adapter run failed.");
      });
    }

    return run(options.computedAt || new Date().toISOString(), null);
  }

  /* BUG-004 F-BUG004-A — the tool-scoped Simple requalification coordinator.

     The bridge used to run on exactly ONE trigger: rlviews:change into Simple. A page
     whose owner evidence hydrates AFTER shell boot therefore painted one honest
     "unavailable" and never ran again, so a cold-open Simple stayed unavailable until
     the user changed views — the mode toggle was manufacturing the only refresh the
     bridge understood. The coordinator adds the missing trigger as a public, tool-scoped
     request and routes BOTH triggers through one render path so the two cannot drift.

     Deliberately NOT a poller and NOT a global data-status listener: owner readiness is
     an edge the owning page already knows about, so the page states it once. */
  var SIMPLE_REFRESH_COORDINATOR = null;

  function installSimpleProjectionBridge() {
    /* Per-TOOL state. A request naming tool A must never repaint tool B, and A's
       generation counter must never invalidate B's in-flight run. */
    var toolStates = Object.create(null);

    function toolState(toolId) {
      var entry = toolStates[toolId];
      if (!entry) {
        entry = { generation: 0, running: false, scheduled: null, successor: null };
        toolStates[toolId] = entry;
      }
      return entry;
    }

    function resolveCurrentOrdinaryTool(toolId) {
      if (!toolId) return null;
      var registration = globalThis.__rlviewsRegistration;
      if (!registration || !registration.shell || registration.shell.toolId !== toolId) return null;
      if (!registration.registry || !Array.isArray(registration.registry.tools)) return null;
      var tool = registration.registry.tools.find(function (candidate) { return candidate && candidate.id === toolId; });
      if (!tool || !tool.experience || tool.experience.kind !== "ordinary") return null;
      return { registration: registration, tool: tool };
    }

    /* Everything one run needs, resolved from the CURRENT registration and globals.
       Returns null whenever the request must be declined WITHOUT touching the panel:
       no registration, a different tool than the shell owns, a non-ordinary tool, no
       adapter panel, or the shell is not currently showing Simple. Declining is silent
       by contract — painting here would let a background tool or a view the user has
       already left overwrite what is on screen. */
    function resolveSimpleContext(toolId) {
      if (!toolId || typeof document === "undefined" || !document.body) return null;
      var current = resolveCurrentOrdinaryTool(toolId);
      if (!current) return null;
      var registration = current.registration;
      var tool = current.tool;
      /* Two independent ways a page already answers Simple itself. Painting the shell's panel in
         either case puts a SECOND Simple answer beside the page's own one, and the two can flatly
         contradict each other: the placeholder reads "this tool's own model is not loaded, so there
         is no result to show" while the page's own cockpit, directly beneath it, renders a resolved
         decision. The shell already stands down for these pages everywhere else it would compete —
         it leaves location.hash alone, it keeps the page's own #modeSeg, and applyVisual never
         focuses over them — so declining here is the same rule applied to the one surface that
         still painted. Both conditions are generic properties of the registration, never a tool
         identity. Declining is silent by contract, exactly as for the cases above. */
      if (Array.isArray(registration.ownerModes) && registration.ownerModes.indexOf("simple") !== -1) return null;
      if (registration.ownsRoute === true) return null;
      if (document.body.getAttribute("data-rlview") !== "simple") return null;
      var panel = document.querySelector('[data-rlexperience-panel="simple"]');
      if (!panel) return null;

      var definition = null;
      var models = registration.simpleModels;
      if (models && Array.isArray(models.definitions)) {
        for (var i = 0; i < models.definitions.length; i += 1) {
          if (models.definitions[i] && models.definitions[i].toolId === toolId) { definition = models.definitions[i]; break; }
        }
      }
      var modulePath = definition ? definition.adapterModule : (tool.experience.simpleAdapterModule || null);
      var binding = modulePath ? ADAPTER_MODULE_BINDINGS[modulePath] : null;
      return { panel: panel, tool: tool, definition: definition, binding: binding, config: registration.config };
    }

    function disableRenderedControls(panel) {
      if (!panel) return;
      var nodes = [];
      if (typeof panel.querySelectorAll === "function") {
        nodes = Array.prototype.slice.call(panel.querySelectorAll("[data-rlexperience-control-input]"));
      } else if (typeof panel.findAllByAttribute === "function") {
        nodes = panel.findAllByAttribute("data-rlexperience-control-input");
      }
      for (var i = 0; i < nodes.length; i += 1) {
        nodes[i].disabled = true;
        if (typeof nodes[i].setAttribute === "function") {
          nodes[i].setAttribute("disabled", "disabled");
          nodes[i].setAttribute("aria-disabled", "true");
        }
      }
    }

    function claimAcceptedGeneration(state, panel) {
      state.generation += 1;
      disableRenderedControls(panel);
      return state.generation;
    }

    /* THE single render path. A view change into Simple and an owner-readiness request
       both land here, so there is one registry lookup, one provider read, one binding
       resolution and one bridge invocation for every trigger.

       The owner provider is read WHEN THE RUN STARTS, never when it was queued, so a
       coalesced request always projects the newest owner state. That read is a plain
       synchronous call into state the page has already hydrated — the coordinator
       acquires nothing. Missing provider or empty owner state is passed through as-is
       so the bridge renders its honest "unavailable"; readiness is never forced. */
    function renderSimpleForTool(toolId, context, acceptedGeneration) {
      var ownerState = null;
      var providers = globalThis.__rlOwnerStateProvider;
      if (providers && typeof providers[toolId] === "function") {
        try { ownerState = providers[toolId](); } catch (providerError) { ownerState = null; }
      }
      var state = toolState(toolId);
      return Promise.resolve(renderSimpleBridgeInternal({
        panel: context.panel,
        toolId: toolId,
        toolExperience: context.tool.experience,
        definition: context.definition,
        ownerState: ownerState,
        moduleObject: context.binding ? globalThis[context.binding.global] : null,
        registerFnName: context.binding ? context.binding.register : null,
        adapterId: context.tool.experience.simpleAdapterId,
        api: globalThis.RLEXPERIENCE,
        config: context.config,
        computedAt: new Date().toISOString(),
        acceptedGeneration: acceptedGeneration,
        isCurrentGeneration: function (claimed) { return claimed === state.generation; }
      }));
    }

    function startSimpleRun(toolId, acceptedGeneration) {
      var state = toolState(toolId);
      if (acceptedGeneration !== state.generation) return Promise.resolve(null);
      /* Re-validated at START, not at queue time: the user may have left Simple while
         this run was waiting, and a superseded request must resolve null untouched. */
      var context = resolveSimpleContext(toolId);
      if (!context) return Promise.resolve(null);
      state.running = true;
      return Promise.resolve().then(function () {
        return renderSimpleForTool(toolId, context, acceptedGeneration);
      }).catch(function () { return null; }).then(function (projection) {
        state.running = false;
        var successor = state.successor;
        state.successor = null;
        if (successor) successor.begin();
        return projection;
      });
    }

    function successorSlot(toolId, acceptedGeneration) {
      var slot = { generation: acceptedGeneration, settled: false };
      slot.promise = new Promise(function (resolve) {
        slot.begin = function () {
          if (slot.settled) return;
          slot.settled = true;
          resolve(startSimpleRun(toolId, slot.generation));
        };
        slot.cancel = function () {
          if (slot.settled) return;
          slot.settled = true;
          resolve(null);
        };
      });
      return slot;
    }

    /* A queued run is a SLOT for the same reason a successor is: queued work must be
       cancellable. Left as a bare promise it could only be abandoned, and abandoning it
       does not stop it — `startSimpleRun` mints a FRESH generation when it begins, so a
       generation bump cannot reach work that has not started yet. Cancelling resolves the
       promise (never drops it) so awaiters settle instead of hanging. */
    function scheduledSlot(toolId, state, acceptedGeneration) {
      var slot = { cancelled: false, generation: acceptedGeneration };
      slot.promise = new Promise(function (resolve) {
        slot.cancel = function () { slot.cancelled = true; resolve(null); };
        Promise.resolve().then(function () {
          if (slot.cancelled) return;
          if (state.scheduled === slot) state.scheduled = null;
          resolve(startSimpleRun(toolId, slot.generation));
        });
      });
      return slot;
    }

    /* Public entry point. Filters first, then coalesces; it never renders directly. */
    function requestSimpleRefresh(options) {
      var toolId = options && options.toolId;
      var context = toolId ? resolveSimpleContext(toolId) : null;
      if (!context) return Promise.resolve(null);
      var state = toolState(toolId);
      var acceptedGeneration = claimAcceptedGeneration(state, context.panel);

      /* One run at a time per tool with at most ONE queued successor: extra requests
         arriving mid-run replace that successor rather than stacking runs, so a burst
         of N notifications costs one extra render and only the latest caller remains. */
      if (state.running) {
        if (state.successor) state.successor.cancel();
        state.successor = successorSlot(toolId, acceptedGeneration);
        return state.successor.promise;
      }

      /* Idle: fold every same-turn request into ONE scheduled run. Because the provider
         is read when that run starts, the coalesced result carries the newest owner
         state rather than the first caller's snapshot. */
      if (!state.scheduled) state.scheduled = scheduledSlot(toolId, state, acceptedGeneration);
      else state.scheduled.generation = acceptedGeneration;
      return state.scheduled.promise;
    }

    /* A view transition supersedes prior Simple work: an in-flight run may no longer
       commit, and nothing queued survives leaving the view. Both queued slots — the
       scheduled run and the successor — are cancelled, and each cancellation resolves
       (never drops) its promise so awaiters settle instead of hanging. Cancelling the
       scheduled slot is what makes the second half of that sentence true: the generation
       bump above only reaches a run that has already STARTED and captured a claim.
       `resolveSimpleContext` re-validating at run start is a separate guard for a
       separate purpose, and it does not fire when the view attribute is unchanged — a
       same-mode popstate re-entry, which rlviews `selectMode` deliberately does not
       short-circuit, previously let a stale queued run land after its invalidation. */
    function invalidateSimpleGeneration(toolId) {
      if (!toolId) return;
      var state = toolState(toolId);
      state.generation += 1;
      if (typeof document !== "undefined" && typeof document.querySelector === "function") {
        disableRenderedControls(document.querySelector('[data-rlexperience-panel="simple"]'));
      }
      var scheduled = state.scheduled;
      state.scheduled = null;
      if (scheduled) scheduled.cancel();
      var successor = state.successor;
      state.successor = null;
      if (successor) successor.cancel();
    }

    SIMPLE_REFRESH_COORDINATOR = { request: requestSimpleRefresh };

    if (typeof globalThis === "undefined" || typeof globalThis.addEventListener !== "function") return;
    globalThis.addEventListener("rlviews:change", function (event) {
      var detail = event && event.detail;
      if (!detail) return;
      if (!resolveCurrentOrdinaryTool(detail.toolId)) return;
      invalidateSimpleGeneration(detail.toolId);
      if (detail.mode !== "simple") return;
      requestSimpleRefresh({ toolId: detail.toolId });
      /* BUG-003 closure: NO body.classList mutation here. applyVisual (rlviews.js)
         is the sole owner of rlv-focused; the stub's classList.add is removed. */
    });
  }

  installSimpleProjectionBridge();

  function validateJourneyDefinition(definition, index, seenDefinitions, seenGoals) {
    var path = "$.definitions[" + index + "]";
    exactKeys(definition, JOURNEY_DEFINITION_KEYS, path, "E012-JOURNEY-DEFINITION", "journey-definition", "journey-definition/v1", definition.toolId);
    requireVersion(definition.contractVersion, "journey-definition/v1", path + ".contractVersion", "journey-definition", definition.toolId);
    ["definitionId", "definitionVersion", "toolId", "goalId", "title", "outcomeDescription"].forEach(function (key) { requireString(definition[key], path + "." + key, "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, definition.toolId); });
    if (!ID_PATTERN.test(definition.definitionId) || !ID_PATTERN.test(definition.toolId) || !ID_PATTERN.test(definition.goalId)) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path, "Journey identifiers are invalid", definition.toolId);
    if (seenDefinitions[definition.definitionId]) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".definitionId", "duplicate Journey definition", definition.toolId);
    var goalKey = definition.toolId + "\u0000" + definition.goalId;
    if (seenGoals[goalKey]) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".goalId", "duplicate tool goal", definition.toolId);
    seenDefinitions[definition.definitionId] = true;
    seenGoals[goalKey] = true;
    if (MECHANISMS.indexOf(definition.mechanism) === -1) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".mechanism", "unknown Journey mechanism", definition.toolId);
    if (definition.noExecution !== true) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".noExecution", "Journey must declare noExecution true", definition.toolId);
    if (["public-safe", "local-nonsensitive", "local-private-ref"].indexOf(definition.privacyClass) === -1) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".privacyClass", "unknown privacy class", definition.toolId);
    requireStringArray(definition.stepIds, path + ".stepIds", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, 1, definition.toolId);

    if (!Array.isArray(definition.prerequisiteRules) || definition.prerequisiteRules.length < 1) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".prerequisiteRules", "prerequisite rules required", definition.toolId);
    definition.prerequisiteRules.forEach(function (rule, ruleIndex) {
      var rulePath = path + ".prerequisiteRules[" + ruleIndex + "]";
      exactKeys(rule, ["ruleId", "predicate"], rulePath, "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, definition.toolId);
      requireString(rule.ruleId, rulePath + ".ruleId", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, definition.toolId);
      if (COMPLETION_PREDICATES.indexOf(rule.predicate) === -1) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, rulePath + ".predicate", "unknown prerequisite predicate", definition.toolId);
    });

    exactKeys(definition.contextSchema, ["contractVersion", "allowedFields", "requiredFields"], path + ".contextSchema", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, definition.toolId);
    requireVersion(definition.contextSchema.contractVersion, "journey-context-schema/v1", path + ".contextSchema.contractVersion", "journey-definition", definition.toolId);
    requireStringArray(definition.contextSchema.allowedFields, path + ".contextSchema.allowedFields", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, 1, definition.toolId);
    requireStringArray(definition.contextSchema.requiredFields, path + ".contextSchema.requiredFields", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, 1, definition.toolId);
    definition.contextSchema.requiredFields.forEach(function (field, fieldIndex) {
      if (definition.contextSchema.allowedFields.indexOf(field) === -1) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".contextSchema.requiredFields[" + fieldIndex + "]", "required context field is not allowed", definition.toolId);
    });

    exactKeys(definition.evidencePolicy, ["requiredSlots", "allowedProvenance"], path + ".evidencePolicy", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, definition.toolId);
    requireStringArray(definition.evidencePolicy.requiredSlots, path + ".evidencePolicy.requiredSlots", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, 1, definition.toolId);
    requireStringArray(definition.evidencePolicy.allowedProvenance, path + ".evidencePolicy.allowedProvenance", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, 1, definition.toolId);
    exactKeys(definition.backtrackPolicy, ["mode", "auditPriorOutcomes"], path + ".backtrackPolicy", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, definition.toolId);
    exactKeys(definition.staleEvidencePolicy, ["mode", "preserveAudit"], path + ".staleEvidencePolicy", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, definition.toolId);
    exactKeys(definition.completionPolicy, ["predicates", "outcomes"], path + ".completionPolicy", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, definition.toolId);
    requireStringArray(definition.completionPolicy.predicates, path + ".completionPolicy.predicates", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, 1, definition.toolId);
    definition.completionPolicy.predicates.forEach(function (predicate, predicateIndex) {
      if (COMPLETION_PREDICATES.indexOf(predicate) === -1) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".completionPolicy.predicates[" + predicateIndex + "]", "unknown completion predicate", definition.toolId);
    });
    if (!equalArray(definition.completionPolicy.outcomes, ["complete", "partial", "refused"])) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".completionPolicy.outcomes", "completion outcomes must be exact", definition.toolId);
    exactKeys(definition.packetPolicy, ["contractVersion", "humanSignoffRequired", "noExecution"], path + ".packetPolicy", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, definition.toolId);
    requireVersion(definition.packetPolicy.contractVersion, "journey-completion-packet/v1", path + ".packetPolicy.contractVersion", "journey-definition", definition.toolId);
    if (definition.packetPolicy.humanSignoffRequired !== true || definition.packetPolicy.noExecution !== true || definition.backtrackPolicy.mode !== "transitive-dependents-stale" || definition.backtrackPolicy.auditPriorOutcomes !== true || definition.staleEvidencePolicy.mode !== "reopen-dependent-steps" || definition.staleEvidencePolicy.preserveAudit !== true) {
      reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path, "Journey lifecycle policies must be exact", definition.toolId);
    }
    exactKeys(definition.accessibility, ["progressSemantics", "currentStepSemantics"], path + ".accessibility", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, definition.toolId);
    requireStringArray(definition.limitations, path + ".limitations", "E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, 1, definition.toolId);
    if (definition.definitionFingerprint !== null && typeof definition.definitionFingerprint !== "string") reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".definitionFingerprint", "fingerprint must be null or canonical SHA-256", definition.toolId);
    var fingerprintInput = cloneCanonical(definition);
    fingerprintInput.definitionFingerprint = null;
    var computedFingerprint = fingerprint(fingerprintInput);
    if (definition.definitionFingerprint !== null && definition.definitionFingerprint !== computedFingerprint) reject("E012-JOURNEY-DEFINITION", "journey-definition", definition.contractVersion, path + ".definitionFingerprint", "definition fingerprint mismatch", definition.toolId);
    var projected = cloneCanonical(definition);
    projected.definitionFingerprint = computedFingerprint;
    return projected;
  }

  function validateJourneyStep(step, index, seenSteps) {
    var path = "$.steps[" + index + "]";
    exactKeys(step, JOURNEY_STEP_KEYS, path, "E012-JOURNEY-DEFINITION", "journey-step", "journey-step/v1");
    requireVersion(step.contractVersion, "journey-step/v1", path + ".contractVersion", "journey-step");
    ["stepId", "definitionId", "title", "purpose", "mechanismRole"].forEach(function (key) { requireString(step[key], path + "." + key, "E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion); });
    if (seenSteps[step.stepId]) reject("E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion, path + ".stepId", "duplicate Journey step");
    seenSteps[step.stepId] = true;
    ["dependsOnStepIds", "allowedInputProvenance", "requiredEvidenceSlots", "optionalEvidenceSlots", "staleWhen", "invalidatesStepIds", "ownerDeepLinks"].forEach(function (key) {
      requireStringArray(step[key], path + "." + key, "E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion, key === "requiredEvidenceSlots" || key === "ownerDeepLinks" ? 1 : 0);
    });
    exactKeys(step.inputSchema, ["contractVersion", "allowedFields", "requiredFields"], path + ".inputSchema", "E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion);
    requireVersion(step.inputSchema.contractVersion, "journey-step-input/v1", path + ".inputSchema.contractVersion", "journey-step");
    requireStringArray(step.inputSchema.allowedFields, path + ".inputSchema.allowedFields", "E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion, 0);
    requireStringArray(step.inputSchema.requiredFields, path + ".inputSchema.requiredFields", "E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion, 0);
    if (COMPLETION_PREDICATES.indexOf(step.completionPredicate) === -1) reject("E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion, path + ".completionPredicate", "unknown completion predicate");
    if (!Array.isArray(step.branchRules)) reject("E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion, path + ".branchRules", "branch rules array required");
    step.branchRules.forEach(function (rule, ruleIndex) {
      exactKeys(rule, ["ruleId", "predicate", "targetStepId"], path + ".branchRules[" + ruleIndex + "]", "E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion);
    });
    if (step.sideEffectPolicy !== "none") reject("E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion, path + ".sideEffectPolicy", "Journey steps cannot have side effects");
    exactKeys(step.accessibility, ["label", "description"], path + ".accessibility", "E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion);
    if (step.stepFingerprint !== null && typeof step.stepFingerprint !== "string") reject("E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion, path + ".stepFingerprint", "fingerprint must be null or canonical SHA-256");
    var fingerprintInput = cloneCanonical(step);
    fingerprintInput.stepFingerprint = null;
    var computedFingerprint = fingerprint(fingerprintInput);
    if (step.stepFingerprint !== null && step.stepFingerprint !== computedFingerprint) reject("E012-JOURNEY-DEFINITION", "journey-step", step.contractVersion, path + ".stepFingerprint", "step fingerprint mismatch");
    var projected = cloneCanonical(step);
    projected.stepFingerprint = computedFingerprint;
    return projected;
  }

  function validateJourneyRegistryInternal(registry) {
    exactKeys(registry, ["contractVersion", "definitions", "steps"], "$", "E012-JOURNEY-DEFINITION", "journey-registry", "journey-registry/v1");
    requireVersion(registry.contractVersion, "journey-registry/v1", "$.contractVersion", "journey-registry");
    if (!Array.isArray(registry.definitions) || registry.definitions.length < 1 || !Array.isArray(registry.steps) || registry.steps.length < 1) reject("E012-JOURNEY-DEFINITION", "journey-registry", registry.contractVersion, "$", "Journey definitions and steps are required");
    var seenDefinitions = Object.create(null);
    var seenGoals = Object.create(null);
    var definitions = registry.definitions.map(function (definition, index) { return validateJourneyDefinition(definition, index, seenDefinitions, seenGoals); });
    var seenSteps = Object.create(null);
    var steps = registry.steps.map(function (step, index) { return validateJourneyStep(step, index, seenSteps); });
    var definitionMap = Object.create(null);
    definitions.forEach(function (definition) { definitionMap[definition.definitionId] = definition; });
    var referencedSteps = Object.create(null);
    definitions.forEach(function (definition, definitionIndex) {
      definition.stepIds.forEach(function (stepId, stepIndex) {
        if (!seenSteps[stepId]) reject("E012-JOURNEY-DEFINITION", "journey-registry", registry.contractVersion, "$.definitions[" + definitionIndex + "].stepIds[" + stepIndex + "]", "Journey step reference is unresolved", definition.toolId);
        referencedSteps[stepId] = (referencedSteps[stepId] || 0) + 1;
      });
    });
    steps.forEach(function (step, stepIndex) {
      if (!definitionMap[step.definitionId]) reject("E012-JOURNEY-DEFINITION", "journey-registry", registry.contractVersion, "$.steps[" + stepIndex + "].definitionId", "step definition reference is unresolved");
      if (definitionMap[step.definitionId].stepIds.indexOf(step.stepId) === -1) reject("E012-JOURNEY-DEFINITION", "journey-registry", registry.contractVersion, "$.steps[" + stepIndex + "].stepId", "step is not declared by its definition");
      if (referencedSteps[step.stepId] !== 1) reject("E012-JOURNEY-DEFINITION", "journey-registry", registry.contractVersion, "$.steps[" + stepIndex + "].stepId", "step must resolve exactly once");
      step.dependsOnStepIds.concat(step.invalidatesStepIds).forEach(function (linkedStepId) {
        if (!seenSteps[linkedStepId] || definitionMap[step.definitionId].stepIds.indexOf(linkedStepId) === -1) reject("E012-JOURNEY-DEFINITION", "journey-registry", registry.contractVersion, "$.steps[" + stepIndex + "]", "step dependency must remain inside the definition");
      });
    });
    return deepFreeze({ contractVersion: registry.contractVersion, definitions: definitions, steps: steps });
  }

  function validateExperience(experience, tool, index, config, modelMap, modelByTool, journeyMap) {
    var path = "$.tools[" + index + "].experience";
    if (!isPlainObject(experience)) reject("E012-REGISTRY", "tool-registry", "tool-experience/v1", path, "experience declaration is required", tool.id);
    exactKeys(experience, EXPERIENCE_KEYS, path, "E012-REGISTRY", "tool-registry", "tool-experience/v1", tool.id);
    requireVersion(experience.contractVersion, "tool-experience/v1", path + ".contractVersion", "tool-registry", tool.id);
    var viewSet = config.viewSets[experience.viewSetId];
    if (!viewSet || viewSet.kind !== experience.kind) reject("E012-VIEWSET", "tool-registry", experience.contractVersion, path + ".viewSetId", "experience kind and view set do not match", tool.id);
    if (!equalArray(experience.viewIds, viewSet.viewIds)) reject("E012-VIEWSET", "tool-registry", experience.contractVersion, path + ".viewIds", "experience view order does not match the configured view set", tool.id);
    var isSpecialization = experience.kind === "market-action-center";
    if ((isSpecialization && tool.id !== viewSet.registryToolId) || (!isSpecialization && viewSet.registryToolId !== null)) reject("E012-VIEWSET", "tool-registry", experience.contractVersion, path + ".kind", "specialization registry identity does not match config", tool.id);
    safeModule(experience.simpleAdapterModule, config, path + ".simpleAdapterModule", "E012-REGISTRY", "tool-registry", tool.id);
    requireString(experience.simpleAdapterId, path + ".simpleAdapterId", "E012-REGISTRY", "tool-registry", experience.contractVersion, tool.id);
    requireString(experience.powerAdapterId, path + ".powerAdapterId", "E012-REGISTRY", "tool-registry", experience.contractVersion, tool.id);
    requireString(experience.briefPolicyId, path + ".briefPolicyId", "E012-REGISTRY", "tool-registry", experience.contractVersion, tool.id);
    if (!/^web-evidence-policy\/[a-z0-9-]+\/v1$/.test(experience.briefPolicyId)) reject("E012-REGISTRY", "tool-registry", experience.contractVersion, path + ".briefPolicyId", "Brief policy ID is invalid", tool.id);
    if (experience.contextPolicyId !== config.contextPolicy.policyId) reject("E012-REGISTRY", "tool-registry", experience.contractVersion, path + ".contextPolicyId", "context policy reference is unresolved", tool.id);
    requireStringArray(experience.journeyDefinitionIds, path + ".journeyDefinitionIds", "E012-REGISTRY", "tool-registry", experience.contractVersion, isSpecialization ? 4 : 2, tool.id);
    if (isSpecialization && experience.journeyDefinitionIds.length !== 4) reject("E012-REGISTRY", "tool-registry", experience.contractVersion, path + ".journeyDefinitionIds", "Market Action Center requires exactly four global goals", tool.id);
    if (!Array.isArray(experience.matrixDomains) || !Array.isArray(experience.publicAliases)) reject("E012-REGISTRY", "tool-registry", experience.contractVersion, path, "matrix domains and public aliases must be arrays", tool.id);
    experience.matrixDomains.forEach(function (domain, domainIndex) {
      if (config.matrixPolicy.domains.indexOf(domain) === -1) reject("E012-REGISTRY", "tool-registry", experience.contractVersion, path + ".matrixDomains[" + domainIndex + "]", "matrix domain is unknown", tool.id);
    });
    experience.publicAliases.forEach(function (alias, aliasIndex) { requireString(alias, path + ".publicAliases[" + aliasIndex + "]", "E012-REGISTRY", "tool-registry", experience.contractVersion, tool.id); });

    var model;
    if (isSpecialization) {
      if (experience.simpleModelDefinitionId !== null) reject("E012-REGISTRY", "tool-registry", experience.contractVersion, path + ".simpleModelDefinitionId", "Market Action Center top-level Simple reference must be null", tool.id);
      model = modelByTool[tool.id];
    } else {
      requireString(experience.simpleModelDefinitionId, path + ".simpleModelDefinitionId", "E012-REGISTRY", "tool-registry", experience.contractVersion, tool.id);
      model = modelMap[experience.simpleModelDefinitionId];
    }
    if (!model || model.toolId !== tool.id) reject("E012-REGISTRY", "tool-registry", experience.contractVersion, path + ".simpleModelDefinitionId", "Simple model reference is unresolved", tool.id);
    if (model.adapterId !== experience.simpleAdapterId || model.adapterModule !== experience.simpleAdapterModule) reject("E012-REGISTRY", "tool-registry", experience.contractVersion, path + ".simpleAdapterId", "Simple adapter declaration does not match the model", tool.id);
    experience.journeyDefinitionIds.forEach(function (definitionId, definitionIndex) {
      var definition = journeyMap[definitionId];
      if (!definition || (definition.toolId !== tool.id && !(isSpecialization && definition.toolId === "market-action"))) reject("E012-REGISTRY", "tool-registry", experience.contractVersion, path + ".journeyDefinitionIds[" + definitionIndex + "]", "Journey definition reference is unresolved", tool.id);
    });
    return { toolId: tool.id, kind: experience.kind, modelDefinitionId: model.definitionId, journeyDefinitionIds: cloneCanonical(experience.journeyDefinitionIds) };
  }

  function validateToolRegistryInternal(registry, config, modelRegistry, journeyRegistry) {
    if (!isPlainObject(registry) || !Array.isArray(registry.tools)) reject("E012-REGISTRY", "tool-registry", "tool-experience/v1", "$", "tools registry is invalid");
    ["site", "description", "updated"].forEach(function (key) { requireString(registry[key], "$." + key, "E012-REGISTRY", "tool-registry", "tool-experience/v1"); });
    if (registry.tools.length < 1) reject("E012-REGISTRY", "tool-registry", "tool-experience/v1", "$.tools", "at least one registry tool is required");
    var modelMap = Object.create(null);
    var modelByTool = Object.create(null);
    modelRegistry.definitions.forEach(function (definition, index) {
      modelMap[definition.definitionId] = definition;
      if (modelByTool[definition.toolId]) reject("E012-REGISTRY", "tool-registry", "tool-experience/v1", "$.models.definitions[" + index + "].toolId", "each tool must have exactly one model definition", definition.toolId);
      modelByTool[definition.toolId] = definition;
    });
    var journeyMap = Object.create(null);
    journeyRegistry.definitions.forEach(function (definition) { journeyMap[definition.definitionId] = definition; });
    var seenTools = Object.create(null);
    var referencedJourneys = Object.create(null);
    var records = registry.tools.map(function (tool, index) {
      if (!isPlainObject(tool)) reject("E012-REGISTRY", "tool-registry", "tool-experience/v1", "$.tools[" + index + "]", "tool entry must be an object");
      requireString(tool.id, "$.tools[" + index + "].id", "E012-REGISTRY", "tool-registry", "tool-experience/v1");
      if (seenTools[tool.id]) reject("E012-REGISTRY", "tool-registry", "tool-experience/v1", "$.tools[" + index + "].id", "duplicate tool ID", tool.id);
      seenTools[tool.id] = true;
      var record = validateExperience(tool.experience, tool, index, config, modelMap, modelByTool, journeyMap);
      record.journeyDefinitionIds.forEach(function (definitionId) { referencedJourneys[definitionId] = (referencedJourneys[definitionId] || 0) + 1; });
      return record;
    });
    modelRegistry.definitions.forEach(function (definition, index) {
      if (!seenTools[definition.toolId]) reject("E012-REGISTRY", "tool-registry", "tool-experience/v1", "$.models.definitions[" + index + "].toolId", "model definition has no registered tool", definition.toolId);
    });
    journeyRegistry.definitions.forEach(function (definition, index) {
      if (referencedJourneys[definition.definitionId] !== 1) reject("E012-REGISTRY", "tool-registry", "tool-experience/v1", "$.journeys.definitions[" + index + "].definitionId", "Journey definition must be referenced exactly once", definition.toolId);
    });
    var specializationId = config.viewSets["market-action-center-four-view/v1"].registryToolId;
    var marketCount = records.filter(function (record) { return record.kind === "market-action-center"; }).length;
    if (marketCount !== 1 || !seenTools[specializationId]) reject("E012-VIEWSET", "tool-registry", "tool-experience/v1", "$.tools", "exactly one configured Market Action Center specialization is required");
    return deepFreeze({ records: records, toolIds: records.map(function (record) { return record.toolId; }) });
  }

  function evaluateDependencyGatesInternal(config, states) {
    var observedStates = isPlainObject(states) ? states : {};
    return Object.keys(config.dependencyGates).map(function (key) {
      var gate = config.dependencyGates[key];
      var state = isPlainObject(observedStates[key]) ? observedStates[key] : {};
      var certification = isPlainObject(state.certification) ? state.certification : {};
      var predicate = gate.acceptedPredicate;
      var statusAccepted = predicate.statuses.indexOf(state.status) !== -1;
      var certificationAccepted = predicate.certificationStatuses.indexOf(certification.status) !== -1;
      var required = predicate.requiredEvidenceIds || predicate.requiredMilestones;
      var observed = predicate.requiredEvidenceIds
        ? (Array.isArray(state.evidenceIds) ? state.evidenceIds : [])
        : (Array.isArray(state.milestones) ? state.milestones : []);
      var requirementsAccepted = required.every(function (item) { return observed.indexOf(item) !== -1; });
      return deepFreeze({
        gateId: gate.gateId,
        satisfied: statusAccepted && certificationAccepted && requirementsAccepted,
        observed: {
          status: typeof state.status === "string" ? state.status : null,
          certificationStatus: typeof certification.status === "string" ? certification.status : null,
          matchedRequirementCount: required.filter(function (item) { return observed.indexOf(item) !== -1; }).length,
          requiredRequirementCount: required.length
        },
        withheldCapabilities: cloneCanonical(gate.withheldCapabilities),
        preservedCapabilities: cloneCanonical(gate.preservedCapabilities),
        dependencyGateId: gate.gateId
      });
    });
  }

  function registryTools(registry) {
    if (!isPlainObject(registry) || !Array.isArray(registry.tools)) {
      reject("E012-REGISTRY", "shell", "experience-shell/v1", "$.registry", "tools registry is invalid");
    }
    return registry.tools;
  }

  function resolveShellInternal(config, registry, toolId) {
    var validatedConfig = validateConfigInternal(config);
    requireString(toolId, "$.toolId", "E012-REGISTRY", "shell", "experience-shell/v1");
    var matches = registryTools(registry).filter(function (tool) { return tool && tool.id === toolId; });
    if (matches.length !== 1) {
      reject("E012-REGISTRY", "shell", "experience-shell/v1", "$.toolId", "registered tool must resolve exactly once", toolId);
    }
    var experience = matches[0].experience;
    if (!isPlainObject(experience)) {
      reject("E012-REGISTRY", "shell", "tool-experience/v1", "$.experience", "experience declaration is required", toolId);
    }
    var viewSet = validatedConfig.viewSets[experience.viewSetId];
    if (!viewSet || viewSet.kind !== experience.kind || !equalArray(viewSet.viewIds, experience.viewIds)) {
      reject("E012-VIEWSET", "shell", "experience-shell/v1", "$.experience.viewSetId", "tool experience does not resolve the configured view set", toolId);
    }
    return deepFreeze({
      contractVersion: "experience-shell/v1",
      toolId: toolId,
      kind: viewSet.kind,
      viewSetId: viewSet.viewSetId,
      viewIds: cloneCanonical(viewSet.viewIds),
      labels: cloneCanonical(viewSet.labels),
      defaultViewId: viewSet.defaultViewId,
      routingPolicy: cloneCanonical(validatedConfig.routingPolicy),
      migrationPolicy: cloneCanonical(validatedConfig.migrationPolicy)
    });
  }

  function shellHasMode(shell, mode) {
    return isPlainObject(shell) && Array.isArray(shell.viewIds) && shell.viewIds.indexOf(mode) !== -1;
  }

  function exactModeRecordKeys(record) {
    if (!isPlainObject(record)) return false;
    var keys = Object.keys(record);
    var expected = ["contractVersion", "toolId", "mode", "savedAt"];
    return keys.length === expected.length && expected.every(function (key) { return Object.prototype.hasOwnProperty.call(record, key); });
  }

  function createModeRecordInternal(shell, mode, savedAt) {
    if (!shellHasMode(shell, mode)) {
      reject("E012-VIEW-TARGET", "mode-state", "experience-mode/v1", "$.mode", "mode is not available for this shell", shell && shell.toolId);
    }
    requireString(savedAt, "$.savedAt", "E012-VIEW-TARGET", "mode-state", "experience-mode/v1", shell.toolId);
    return deepFreeze({
      contractVersion: "experience-mode/v1",
      toolId: shell.toolId,
      mode: mode,
      savedAt: savedAt
    });
  }

  function restoreModeRecordInternal(shell, record) {
    if (!exactModeRecordKeys(record) || record.contractVersion !== "experience-mode/v1" ||
      record.toolId !== shell.toolId || !shellHasMode(shell, record.mode) ||
      typeof record.savedAt !== "string" || record.savedAt.length === 0) return null;
    return createModeRecordInternal(shell, record.mode, record.savedAt);
  }

  function publicTargetSet(options) {
    var values = isPlainObject(options) && Array.isArray(options.publicTargetIds)
      ? options.publicTargetIds
      : [];
    var set = Object.create(null);
    values.forEach(function (value) {
      if (typeof value === "string" && /^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/.test(value)) set[value] = true;
    });
    return set;
  }

  function routeProjection(mode, targetId, source, historyAction, focusPolicy, recovery) {
    return deepFreeze({
      contractVersion: "experience-route/v1",
      mode: mode,
      targetId: targetId,
      canonicalHash: "#" + mode + (targetId ? "/" + targetId : ""),
      source: source,
      historyAction: historyAction,
      focusPolicy: focusPolicy,
      recovery: recovery,
      noFetch: true
    });
  }

  function resolveRouteInternal(shell, hash, options) {
    if (!isPlainObject(shell) || shell.contractVersion !== "experience-shell/v1" ||
      !shellHasMode(shell, shell.defaultViewId)) {
      reject("E012-VIEWSET", "route", "experience-route/v1", "$.shell", "validated shell is required", shell && shell.toolId);
    }
    var rawHash = typeof hash === "string" ? hash.trim() : "";
    var targetSet = publicTargetSet(options);
    if (!rawHash || rawHash === "#") {
      var restored = restoreModeRecordInternal(shell, isPlainObject(options) ? options.localModeRecord : null);
      return routeProjection(
        restored ? restored.mode : shell.defaultViewId,
        null,
        restored ? "local" : "default",
        "replace",
        "browser-default",
        null
      );
    }

    var fragment = rawHash.charAt(0) === "#" ? rawHash.slice(1) : rawHash;
    var parts = fragment.split("/");
    var mode = parts[0];
    if (!shellHasMode(shell, mode)) {
      return routeProjection(shell.defaultViewId, null, "recovery", "replace", "mode-heading", "view-link-not-available");
    }
    if (parts.length === 1) return routeProjection(mode, null, "hash", "none", "browser-default", null);
    if (parts.length === 2 && targetSet[parts[1]]) {
      return routeProjection(mode, parts[1], "hash", "none", "target-after-render", null);
    }
    return routeProjection(mode, null, "recovery", "replace", "mode-heading", "view-link-not-available");
  }

  function transitionRouteInternal(shell, currentRoute, action) {
    if (!isPlainObject(currentRoute) || currentRoute.contractVersion !== "experience-route/v1" || !isPlainObject(action)) {
      reject("E012-VIEW-TARGET", "route", "experience-route-transition/v1", "$", "current route and action are required", shell && shell.toolId);
    }
    if (action.type === "select") {
      if (!shellHasMode(shell, action.mode)) {
        reject("E012-VIEW-TARGET", "route", "experience-route-transition/v1", "$.mode", "selected mode is unavailable", shell.toolId);
      }
      var selectedRoute = routeProjection(action.mode, null, "user", "none", "browser-default", null);
      var changed = selectedRoute.canonicalHash !== currentRoute.canonicalHash;
      return deepFreeze({
        contractVersion: "experience-route-transition/v1",
        route: selectedRoute,
        historyAction: changed ? "push" : "none",
        focusPolicy: "selected-tab",
        noFetch: true,
        recompute: false,
        modeRecord: createModeRecordInternal(shell, action.mode, action.savedAt)
      });
    }
    if (action.type === "popstate") {
      var restoredRoute = resolveRouteInternal(shell, action.hash, { publicTargetIds: action.publicTargetIds });
      return deepFreeze({
        contractVersion: "experience-route-transition/v1",
        route: restoredRoute,
        historyAction: restoredRoute.historyAction === "replace" ? "replace" : "none",
        focusPolicy: action.focusInsideControl === true ? "selected-tab" : "preserve",
        noFetch: true,
        recompute: false,
        modeRecord: null
      });
    }
    reject("E012-VIEW-TARGET", "route", "experience-route-transition/v1", "$.type", "unknown route action", shell.toolId);
  }

  function dependencyLabel(gateId) {
    return String(gateId).split("-").map(function (part, index) {
      if (index === 0 && part.toLowerCase() === "feature") return "Feature";
      return part.toUpperCase() === part ? part : part.charAt(0).toUpperCase() + part.slice(1);
    }).join(" ");
  }

  function projectDependencyGateInternal(config, gateKey, states) {
    var validatedConfig = validateConfigInternal(config);
    if (!Object.prototype.hasOwnProperty.call(validatedConfig.dependencyGates, gateKey)) {
      reject("E012-DEPENDENCY", "dependency", "dependency-gate-panel/v1", "$.gateKey", "dependency gate is unknown");
    }
    var gate = validatedConfig.dependencyGates[gateKey];
    var projections = evaluateDependencyGatesInternal(validatedConfig, states);
    var projection = projections.find(function (item) { return item.gateId === gate.gateId; });
    var requirementName = gate.acceptedPredicate.requiredEvidenceIds ? "evidence" : "milestones";
    var required = gate.acceptedPredicate.requiredEvidenceIds || gate.acceptedPredicate.requiredMilestones;
    return deepFreeze({
      contractVersion: "dependency-gate-panel/v1",
      state: projection.satisfied ? "available" : "dependency-pending",
      heading: (projection.satisfied ? "Dependency available: " : "Dependency pending: ") + dependencyLabel(gate.gateId),
      gateId: gate.gateId,
      gateCode: "E012-DEPENDENCY:" + gate.gateId,
      evidencePath: gate.statePath,
      requirementName: requirementName,
      observed: cloneCanonical(projection.observed),
      withheldCapabilities: cloneCanonical(projection.withheldCapabilities),
      preservedCapabilities: cloneCanonical(projection.preservedCapabilities),
      /* Criteria only. Encoded "all-N-required", never "N/N", so the requirement can never be
         misread as progress; observed progress is observed.matchedRequirementCount. */
      acceptanceGate: "status=" + gate.acceptedPredicate.statuses.join("|") +
        "; certification=" + gate.acceptedPredicate.certificationStatuses.join("|") +
        "; " + requirementName + "=all-" + required.length + "-required",
      bypassAllowed: false
    });
  }

  function validateFoundationInternal(packet) {
    if (!isPlainObject(packet)) reject("E012-REGISTRY", "foundation", "tool-experience-validation/v1", "$", "foundation packet must be an object");
    Object.keys(packet).forEach(function (key) {
      if (["config", "registry", "models", "journeys", "dependencyStates"].indexOf(key) === -1) reject("E012-REGISTRY", "foundation", "tool-experience-validation/v1", "$." + key, "unknown foundation field");
    });
    ["config", "registry", "models", "journeys"].forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(packet, key)) reject("E012-REGISTRY", "foundation", "tool-experience-validation/v1", "$." + key, "required foundation field missing");
    });
    var config = validateConfigInternal(packet.config);
    var models = validateSimpleModelRegistryInternal(packet.models, config);
    var journeys = validateJourneyRegistryInternal(packet.journeys, config);
    var registry = validateToolRegistryInternal(packet.registry, config, models, journeys);
    var dependencies = evaluateDependencyGatesInternal(config, packet.dependencyStates);
    var ordinaryCount = registry.records.filter(function (record) { return record.kind === "ordinary"; }).length;
    var marketActionCount = registry.records.filter(function (record) { return record.kind === "market-action-center"; }).length;
    var summary = {
      contractVersion: "tool-experience-validation/v1",
      toolCount: registry.records.length,
      ordinaryCount: ordinaryCount,
      marketActionCount: marketActionCount,
      toolIds: cloneCanonical(registry.toolIds),
      simpleModelDefinitionCount: models.definitions.length,
      journeyDefinitionCount: journeys.definitions.length,
      journeyStepCount: journeys.steps.length,
      dependencyStates: dependencies,
      shadowOnly: config.migrationPolicy.shadowOnly,
      integrationClaims: []
    };
    summary.validationFingerprint = fingerprint(summary);
    return deepFreeze(summary);
  }

  return {
    SIMPLE_TRUTH_STATES: SIMPLE_TRUTH_STATES,
    canonicalize: canonicalize,
    fingerprint: fingerprint,
    projectError: projectError,
    normalizeSimpleInput: function (definition, evidence, parameterValues, seed, scenarioIds) { return capture(function () { return normalizeSimpleInputInternal(definition, evidence, parameterValues, seed, scenarioIds); }); },
    computeSimpleIdentity: function (input) { return capture(function () { return computeSimpleIdentityInternal(input); }); },
    projectSimpleState: function (state, options) { return capture(function () { return projectSimpleStateInternal(state, options); }); },
    renderSimpleProjection: function (host, projection) { return capture(function () { return renderSimpleProjectionInternal(host, projection); }); },
    renderSimpleBridge: function (options) { return renderSimpleBridgeInternal(options); },
    createToolControlBinding: function (options) { return capture(function () { return createToolControlBindingInternal(options); }); },
    projectToolControlBinding: function (binding) { return capture(function () { return projectToolControlBindingInternal(binding); }); },
    /* Tool-scoped Simple requalification (BUG-004 F-BUG004-A). A page whose owner state
       becomes readable after shell boot calls this once, naming ITS tool; the coordinator
       decides whether that request is current, rereads the page's already-hydrated owner
       provider, and reruns the same bridge path a view change uses. It resolves null when
       the request is not current and never forces readiness. */
    requestSimpleRefresh: function (options) {
      return SIMPLE_REFRESH_COORDINATOR ? SIMPLE_REFRESH_COORDINATOR.request(options) : Promise.resolve(null);
    },
    createSimpleRuntime: function (config, models) { return capture(function () { return createSimpleRuntimeInternal(config, models); }); },
    runtimeDiagnostic: function () { return capture(function () { return runtimeDiagnosticInternal(); }); },
    validateConfig: function (config) { return capture(function () { return validateConfigInternal(config); }); },
    validateSimpleModelRegistry: function (registry, config) { return capture(function () { return validateSimpleModelRegistryInternal(registry, validateConfigInternal(config)); }); },
    validateJourneyRegistry: function (registry, config) { return capture(function () { validateConfigInternal(config); return validateJourneyRegistryInternal(registry); }); },
    validateToolRegistry: function (registry, config, models, journeys) {
      return capture(function () {
        var validatedConfig = validateConfigInternal(config);
        var validatedModels = validateSimpleModelRegistryInternal(models, validatedConfig);
        var validatedJourneys = validateJourneyRegistryInternal(journeys, validatedConfig);
        return validateToolRegistryInternal(registry, validatedConfig, validatedModels, validatedJourneys);
      });
    },
    evaluateDependencyGates: function (config, states) { return capture(function () { return evaluateDependencyGatesInternal(validateConfigInternal(config), states); }); },
    resolveShell: function (config, registry, toolId) { return capture(function () { return resolveShellInternal(config, registry, toolId); }); },
    resolveRoute: function (shell, hash, options) { return capture(function () { return resolveRouteInternal(shell, hash, options); }); },
    transitionRoute: function (shell, currentRoute, action) { return capture(function () { return transitionRouteInternal(shell, currentRoute, action); }); },
    createModeRecord: function (shell, mode, savedAt) { return capture(function () { return createModeRecordInternal(shell, mode, savedAt); }); },
    restoreModeRecord: function (shell, record) { return capture(function () { return restoreModeRecordInternal(shell, record); }); },
    projectDependencyGate: function (config, gateKey, states) { return capture(function () { return projectDependencyGateInternal(config, gateKey, states); }); },
    validateFoundation: function (packet) { return capture(function () { return validateFoundationInternal(packet); }); }
  };
});