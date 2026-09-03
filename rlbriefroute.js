(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module && module.exports) module.exports = api;
  if (root) root.RLBRIEFROUTE = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var POLICY_CONTRACT = "brief-generation-shadow/v1";
  var TRANSPORT_CONTRACT = "openai-compatible-chat/v1";
  var CAPABILITY_CONTRACT = "model-route-capability/v1";
  var RECEIPT_CONTRACT = "local-model-usage-receipt/v1";
  var PROFILE_IDS = ["omlx-openai-compatible-qwen38", "ollama-openai-compatible"];
  var LIMITS = {
    modelListTimeoutMs: 5000,
    modelListMaxResponseBytes: 262144,
    chatTimeoutMs: 120000,
    chatMaxRequestBytes: 98304,
    chatMaxResponseBytes: 98304,
    retryCount: 0,
    maxInFlightChats: 1
  };
  var ERRORS = Object.freeze({
    POLICY: "B030-POLICY",
    SHADOW_PROFILE: "B030-SHADOW-PROFILE",
    ADAPTER_CONFIG: "B030-ADAPTER-CONFIG",
    ROUTE_UNAVAILABLE: "B030-ROUTE-UNAVAILABLE",
    USAGE_INVALID: "B030-USAGE-INVALID",
    VALIDATION: "B030-VALIDATION",
    CANCELLED: "B030-CANCELLED"
  });
  var SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:/+-]*$/;

  function failure(code, reason, field) {
    return {
      ok: false,
      error: {
        contractVersion: "brief-shadow-error/v1",
        code: code,
        reason: reason,
        field: field || null
      }
    };
  }

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function exactKeys(value, expected) {
    if (!isPlainObject(value)) return false;
    return JSON.stringify(Object.keys(value).sort()) === JSON.stringify(expected.slice().sort());
  }

  function exactStringArray(value, expected) {
    return Array.isArray(value)
      && JSON.stringify(value) === JSON.stringify(expected)
      && value.every(isNonEmptyString);
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function validateEndpoint(value) {
    if (!isNonEmptyString(value)) return failure(ERRORS.ADAPTER_CONFIG, "base-url-required", "baseUrl");
    var parsed;
    try {
      parsed = new URL(value);
    } catch (error) {
      return failure(ERRORS.ADAPTER_CONFIG, "base-url-invalid", "baseUrl");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return failure(ERRORS.ADAPTER_CONFIG, "base-url-scheme", "baseUrl");
    }
    if (parsed.username || parsed.password) return failure(ERRORS.ADAPTER_CONFIG, "base-url-credentials", "baseUrl");
    if (parsed.search) return failure(ERRORS.ADAPTER_CONFIG, "base-url-query", "baseUrl");
    if (parsed.hash) return failure(ERRORS.ADAPTER_CONFIG, "base-url-fragment", "baseUrl");
    return { ok: true, value: parsed.toString() };
  }

  function validateLimits(value) {
    var names = Object.keys(LIMITS);
    if (!exactKeys(value, names)) return failure(ERRORS.POLICY, "transport-limits-shape", "transport.limits");
    for (var i = 0; i < names.length; i += 1) {
      var name = names[i];
      if (!Number.isInteger(value[name])) return failure(ERRORS.POLICY, "transport-limit-integer", "transport.limits." + name);
      if (name === "retryCount") {
        if (value[name] !== 0) return failure(ERRORS.POLICY, "transport-retry-count", "transport.limits." + name);
      } else if (value[name] <= 0) {
        return failure(ERRORS.POLICY, "transport-limit-positive", "transport.limits." + name);
      }
      if (value[name] !== LIMITS[name]) return failure(ERRORS.POLICY, "transport-limit-mismatch", "transport.limits." + name);
    }
    return { ok: true, value: deepFreeze(clone(value)) };
  }

  function validateRouteCapability(value) {
    var keys = [
      "contractVersion", "capabilityId", "routeClass", "supportedStageKinds",
      "supportedInputClasses", "supportedOutputContracts", "maxContextBytes",
      "maxOutputBytes", "measurableDimensions", "cancellationMode", "usageReceiptVersion"
    ];
    if (!exactKeys(value, keys)) return failure(ERRORS.POLICY, "capability-shape", "capability");
    if (value.contractVersion !== CAPABILITY_CONTRACT) return failure(ERRORS.POLICY, "capability-contract", "capability.contractVersion");
    if (!isNonEmptyString(value.capabilityId) || !SAFE_ID.test(value.capabilityId)) return failure(ERRORS.POLICY, "capability-id", "capability.capabilityId");
    if (value.routeClass !== "local") return failure(ERRORS.POLICY, "capability-route-class", "capability.routeClass");
    if (!exactStringArray(value.supportedStageKinds, ["source-brief-author", "source-brief-critique", "agenda-situation-author", "final-synthesis"])) {
      return failure(ERRORS.POLICY, "capability-stage-kinds", "capability.supportedStageKinds");
    }
    if (!exactStringArray(value.supportedInputClasses, ["public", "source-qualified", "restricted-local"])) {
      return failure(ERRORS.POLICY, "capability-input-classes", "capability.supportedInputClasses");
    }
    if (!exactStringArray(value.supportedOutputContracts, ["tool-author-response/v1", "tool-author-response/v2", "final-author-response/v1"])) {
      return failure(ERRORS.POLICY, "capability-output-contracts", "capability.supportedOutputContracts");
    }
    if (value.maxContextBytes !== LIMITS.chatMaxRequestBytes || value.maxOutputBytes !== LIMITS.chatMaxResponseBytes) {
      return failure(ERRORS.POLICY, "capability-byte-limits", "capability");
    }
    if (!exactStringArray(value.measurableDimensions, ["modelRequests", "inputTokens", "outputTokens", "wallTimeMs", "retries", "concurrency"])) {
      return failure(ERRORS.POLICY, "capability-measurements", "capability.measurableDimensions");
    }
    if (value.cancellationMode !== "cooperative") return failure(ERRORS.POLICY, "capability-cancellation", "capability.cancellationMode");
    if (value.usageReceiptVersion !== RECEIPT_CONTRACT) return failure(ERRORS.POLICY, "capability-receipt", "capability.usageReceiptVersion");
    return { ok: true, value: deepFreeze(clone(value)) };
  }

  function validateAdapter(adapter, profileId) {
    var keys = [
      "adapterId", "profileId", "providerId", "routeClass", "transportContract",
      "capabilityId", "baseUrlEnv", "modelBinding", "usageMapping"
    ];
    if (!exactKeys(adapter, keys)) return failure(ERRORS.POLICY, "adapter-shape", "adapters." + profileId);
    if (adapter.adapterId !== profileId || adapter.profileId !== profileId) return failure(ERRORS.POLICY, "adapter-profile-identity", "adapters." + profileId);
    if (!SAFE_ID.test(adapter.providerId || "")) return failure(ERRORS.POLICY, "adapter-provider-id", "adapters." + profileId + ".providerId");
    if (adapter.routeClass !== "local") return failure(ERRORS.POLICY, "adapter-route-class", "adapters." + profileId + ".routeClass");
    if (adapter.transportContract !== TRANSPORT_CONTRACT) return failure(ERRORS.POLICY, "adapter-transport", "adapters." + profileId + ".transportContract");
    if (adapter.capabilityId !== "local-openai-compatible-author") return failure(ERRORS.POLICY, "adapter-capability", "adapters." + profileId + ".capabilityId");
    if (!isNonEmptyString(adapter.baseUrlEnv) || !/^[A-Z][A-Z0-9_]*$/.test(adapter.baseUrlEnv)) {
      return failure(ERRORS.POLICY, "adapter-base-url-binding", "adapters." + profileId + ".baseUrlEnv");
    }
    var mapping = { promptTokens: "usage.prompt_tokens", completionTokens: "usage.completion_tokens", totalTokens: "usage.total_tokens" };
    if (!exactKeys(adapter.usageMapping, Object.keys(mapping))) return failure(ERRORS.POLICY, "adapter-usage-mapping", "adapters." + profileId + ".usageMapping");
    if (JSON.stringify(adapter.usageMapping) !== JSON.stringify(mapping)) return failure(ERRORS.POLICY, "adapter-usage-mapping", "adapters." + profileId + ".usageMapping");
    if (profileId === PROFILE_IDS[0]) {
      if (adapter.providerId !== "omlx" || adapter.baseUrlEnv !== "BRIEF_OMLX_BASE_URL") return failure(ERRORS.POLICY, "omlx-binding", "adapters." + profileId);
      if (!exactKeys(adapter.modelBinding, ["kind", "modelId"])
        || adapter.modelBinding.kind !== "committed"
        || adapter.modelBinding.modelId !== "Qwen3.8-27B-3bit-MLX") {
        return failure(ERRORS.POLICY, "omlx-model-binding", "adapters." + profileId + ".modelBinding");
      }
    } else if (profileId === PROFILE_IDS[1]) {
      if (adapter.providerId !== "ollama" || adapter.baseUrlEnv !== "BRIEF_OLLAMA_BASE_URL") return failure(ERRORS.POLICY, "ollama-binding", "adapters." + profileId);
      if (!exactKeys(adapter.modelBinding, ["kind", "modelEnv"])
        || adapter.modelBinding.kind !== "environment"
        || adapter.modelBinding.modelEnv !== "BRIEF_OLLAMA_MODEL") {
        return failure(ERRORS.POLICY, "ollama-model-binding", "adapters." + profileId + ".modelBinding");
      }
    } else {
      return failure(ERRORS.POLICY, "adapter-not-approved", "adapters." + profileId);
    }
    return { ok: true };
  }

  function validateShadowPolicy(value) {
    var keys = ["contractVersion", "policyId", "transport", "capabilities", "adapters", "shadowProfiles"];
    if (!exactKeys(value, keys)) return failure(ERRORS.POLICY, "shadow-policy-shape", "policy");
    if (value.contractVersion !== POLICY_CONTRACT || value.policyId !== POLICY_CONTRACT) return failure(ERRORS.POLICY, "shadow-policy-contract", "policy.contractVersion");
    if (!exactKeys(value.transport, ["contractVersion", "limits"]) || value.transport.contractVersion !== TRANSPORT_CONTRACT) {
      return failure(ERRORS.POLICY, "transport-contract", "policy.transport");
    }
    var limits = validateLimits(value.transport.limits);
    if (!limits.ok) return limits;
    if (!exactStringArray(value.shadowProfiles, PROFILE_IDS)) return failure(ERRORS.POLICY, "shadow-profile-inventory", "policy.shadowProfiles");
    if (!exactKeys(value.capabilities, ["local-openai-compatible-author"])) return failure(ERRORS.POLICY, "capability-inventory", "policy.capabilities");
    var capability = validateRouteCapability(value.capabilities["local-openai-compatible-author"]);
    if (!capability.ok) return capability;
    if (!exactKeys(value.adapters, PROFILE_IDS)) return failure(ERRORS.POLICY, "adapter-inventory", "policy.adapters");
    for (var i = 0; i < PROFILE_IDS.length; i += 1) {
      var adapter = validateAdapter(value.adapters[PROFILE_IDS[i]], PROFILE_IDS[i]);
      if (!adapter.ok) return adapter;
    }
    return { ok: true, value: deepFreeze(clone(value)) };
  }

  function resolveShadowProfile(policy, environment) {
    var policyVerdict = validateShadowPolicy(policy);
    if (!policyVerdict.ok) return policyVerdict;
    var env = environment && typeof environment === "object" && !Array.isArray(environment) ? environment : {};
    var profileId = env.BRIEF_SHADOW_PROFILE;
    if (!isNonEmptyString(profileId) || PROFILE_IDS.indexOf(profileId) === -1) {
      return failure(ERRORS.SHADOW_PROFILE, "profile-required-or-unknown", "BRIEF_SHADOW_PROFILE");
    }
    var adapter = policy.adapters[profileId];
    var endpoint = validateEndpoint(env[adapter.baseUrlEnv]);
    if (!endpoint.ok) return endpoint;
    var modelId;
    if (adapter.modelBinding.kind === "committed") modelId = adapter.modelBinding.modelId;
    else modelId = env[adapter.modelBinding.modelEnv];
    if (!isNonEmptyString(modelId) || !SAFE_ID.test(modelId) || modelId.length > 200) {
      return failure(ERRORS.ADAPTER_CONFIG, "model-binding-required", adapter.modelBinding.modelEnv || "modelId");
    }
    var resolved = {
      profileId: adapter.profileId,
      adapterId: adapter.adapterId,
      providerId: adapter.providerId,
      routeClass: adapter.routeClass,
      transportContract: adapter.transportContract,
      capabilityId: adapter.capabilityId,
      capability: clone(policy.capabilities[adapter.capabilityId]),
      baseUrl: endpoint.value,
      modelId: modelId,
      limits: clone(policy.transport.limits),
      usageMapping: clone(adapter.usageMapping)
    };
    return { ok: true, value: deepFreeze(resolved) };
  }

  function usageDimension(nativeUsage, field) {
    if (!isPlainObject(nativeUsage) || !Object.prototype.hasOwnProperty.call(nativeUsage, field)) {
      return { ok: true, value: { state: "unmeasured", reason: "provider-field-missing" } };
    }
    if (!Number.isInteger(nativeUsage[field]) || nativeUsage[field] < 0) {
      return failure(ERRORS.USAGE_INVALID, "provider-token-invalid", "usage." + field);
    }
    return { ok: true, value: { state: "measured", value: nativeUsage[field], source: "provider-response" } };
  }

  function normalizeLocalUsage(nativeUsage) {
    if (nativeUsage !== undefined && nativeUsage !== null && !isPlainObject(nativeUsage)) {
      return failure(ERRORS.USAGE_INVALID, "provider-usage-shape", "usage");
    }
    var input = usageDimension(nativeUsage, "prompt_tokens");
    var output = usageDimension(nativeUsage, "completion_tokens");
    var total = usageDimension(nativeUsage, "total_tokens");
    if (!input.ok) return input;
    if (!output.ok) return output;
    if (!total.ok) return total;
    if (input.value.state === "measured" && output.value.state === "measured" && total.value.state === "measured"
      && input.value.value + output.value.value !== total.value.value) {
      return failure(ERRORS.USAGE_INVALID, "provider-total-inconsistent", "usage.total_tokens");
    }
    var receipt = {
      contractVersion: RECEIPT_CONTRACT,
      modelRequests: { state: "measured", value: 1, source: "adapter-dispatch-ledger" },
      inputTokens: input.value,
      outputTokens: output.value,
      totalTokens: total.value,
      providerCredits: { state: "not-applicable" },
      monetaryCost: { state: "not-applicable" }
    };
    return validateUsageReceipt(receipt);
  }

  function validateUsageDimension(value, allowNotApplicable) {
    if (!isPlainObject(value) || !isNonEmptyString(value.state)) return false;
    if (value.state === "measured") {
      return exactKeys(value, ["state", "value", "source"])
        && Number.isInteger(value.value) && value.value >= 0 && isNonEmptyString(value.source);
    }
    if (value.state === "unmeasured") return exactKeys(value, ["state", "reason"]) && isNonEmptyString(value.reason);
    return allowNotApplicable === true && value.state === "not-applicable" && exactKeys(value, ["state"]);
  }

  function validateUsageReceipt(value) {
    var keys = ["contractVersion", "modelRequests", "inputTokens", "outputTokens", "totalTokens", "providerCredits", "monetaryCost"];
    if (!exactKeys(value, keys) || value.contractVersion !== RECEIPT_CONTRACT) return failure(ERRORS.USAGE_INVALID, "receipt-shape", "receipt");
    if (!validateUsageDimension(value.modelRequests, false)
      || !validateUsageDimension(value.inputTokens, false)
      || !validateUsageDimension(value.outputTokens, false)
      || !validateUsageDimension(value.totalTokens, false)
      || !validateUsageDimension(value.providerCredits, true)
      || !validateUsageDimension(value.monetaryCost, true)) {
      return failure(ERRORS.USAGE_INVALID, "receipt-dimension", "receipt");
    }
    return { ok: true, value: deepFreeze(clone(value)) };
  }

  return Object.freeze({
    POLICY_CONTRACT: POLICY_CONTRACT,
    TRANSPORT_CONTRACT: TRANSPORT_CONTRACT,
    CAPABILITY_CONTRACT: CAPABILITY_CONTRACT,
    RECEIPT_CONTRACT: RECEIPT_CONTRACT,
    PROFILE_IDS: Object.freeze(PROFILE_IDS.slice()),
    REQUIRED_LIMITS: deepFreeze(clone(LIMITS)),
    ERRORS: ERRORS,
    failure: failure,
    validateEndpoint: validateEndpoint,
    validateShadowPolicy: validateShadowPolicy,
    validateRouteCapability: validateRouteCapability,
    resolveShadowProfile: resolveShadowProfile,
    normalizeLocalUsage: normalizeLocalUsage,
    validateUsageReceipt: validateUsageReceipt
  });
}));