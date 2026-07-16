(function (factory) {
  "use strict";

  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLFX_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLFX = api;
})(function () {
  "use strict";

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function canonicalize(value) {
    var active = [];

    function encode(current) {
      if (current === null) return "null";
      if (typeof current === "string" || typeof current === "boolean") {
        return JSON.stringify(current);
      }
      if (typeof current === "number") {
        if (!Number.isFinite(current)) throw new Error("RLFX_NONFINITE_CANONICAL_VALUE");
        return JSON.stringify(current);
      }
      if (Array.isArray(current)) {
        if (active.indexOf(current) !== -1) throw new Error("RLFX_CYCLIC_CANONICAL_VALUE");
        active.push(current);
        var items = current.map(encode);
        active.pop();
        return "[" + items.join(",") + "]";
      }
      if (isPlainObject(current)) {
        if (active.indexOf(current) !== -1) throw new Error("RLFX_CYCLIC_CANONICAL_VALUE");
        active.push(current);
        var fields = Object.keys(current).sort().map(function (key) {
          if (typeof current[key] === "undefined") {
            throw new Error("RLFX_UNDEFINED_CANONICAL_VALUE");
          }
          return JSON.stringify(key) + ":" + encode(current[key]);
        });
        active.pop();
        return "{" + fields.join(",") + "}";
      }
      throw new Error("RLFX_UNSUPPORTED_CANONICAL_VALUE");
    }

    return encode(value);
  }

  function decisionId(value) {
    var bytes = canonicalize(value);
    var hash = 0x811c9dc5;
    for (var index = 0; index < bytes.length; index += 1) {
      hash ^= bytes.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
    return "fxd-v1-" + (hash >>> 0).toString(16).padStart(8, "0");
  }

  function cloneCanonical(value) {
    return JSON.parse(canonicalize(value));
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) {
      deepFreeze(value[key]);
    });
    return Object.freeze(value);
  }

  function requireIsoInstant(value) {
    if (typeof value !== "string") throw new Error("RLFX_DECISION_TIME_INVALID");
    var epoch = Date.parse(value);
    if (!Number.isFinite(epoch) || new Date(epoch).toISOString() !== value) {
      throw new Error("RLFX_DECISION_TIME_INVALID");
    }
    return value;
  }

  function requireNonEmptyString(value, code) {
    if (typeof value !== "string" || value.trim() === "") throw new Error(code);
    return value;
  }

  var COHORTS = ["G10", "liquid-EM", "managed-reference"];
  var UNAVAILABLE_REASONS = [
    "NO_SOURCE", "ACCESS_REQUIRED", "RIGHTS_UNCLEAR", "NO_COVERAGE",
    "NON_TRADABLE", "INSUFFICIENT_HISTORY", "NO_COMMON_DATES",
    "INVALID_ORIENTATION", "NONFINITE", "SOURCE_ERROR"
  ];
  var OBSERVATION_FAMILIES = [
    "spot", "broad-dollar", "policy-rate-proxy", "forward-carry",
    "reer-value", "realized-risk", "positioning", "event"
  ];
  var AVAILABILITIES = ["loading", "fresh", "stale", "revised", "unavailable"];
  var ALLOWED_RIGHTS = ["redistributable", "reference-only"];

  function contains(values, value) {
    return Array.isArray(values) && values.indexOf(value) !== -1;
  }

  function schemaError(code, path, message) {
    var error = new Error(message || code);
    error.code = code;
    error.path = path || "$";
    return error;
  }

  function requireObject(value, path) {
    if (!isPlainObject(value)) throw schemaError("RLFX_SCHEMA_INVALID", path, "object is required");
    return value;
  }

  function requireArray(value, path) {
    if (!Array.isArray(value)) throw schemaError("RLFX_SCHEMA_INVALID", path, "array is required");
    return value;
  }

  function requireFinite(value, path) {
    if (!Number.isFinite(value)) throw schemaError("RLFX_SCHEMA_INVALID", path, "finite number is required");
    return value;
  }

  function requirePositiveInteger(value, path) {
    if (!Number.isInteger(value) || value <= 0) throw schemaError("RLFX_SCHEMA_INVALID", path, "positive integer is required");
    return value;
  }

  function requireStringArray(value, path, allowEmpty) {
    requireArray(value, path);
    if (!allowEmpty && value.length === 0) throw schemaError("RLFX_SCHEMA_INVALID", path, "non-empty array is required");
    value.forEach(function (entry, index) {
      requireNonEmptyString(entry, "RLFX_SCHEMA_INVALID");
      if (entry !== entry.trim()) throw schemaError("RLFX_SCHEMA_INVALID", path + "[" + index + "]", "trimmed string is required");
    });
    return value;
  }

  function requireEnum(value, values, path) {
    if (!contains(values, value)) throw schemaError("RLFX_SCHEMA_INVALID", path, "value is outside the closed vocabulary");
    return value;
  }

  function requireIso(value, path) {
    try {
      return requireIsoInstant(value);
    } catch (_error) {
      throw schemaError("RLFX_SCHEMA_INVALID", path, "canonical ISO instant is required");
    }
  }

  function requireIsoDate(value, path) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value + "T00:00:00.000Z"))) {
      throw schemaError("RLFX_SCHEMA_INVALID", path, "ISO date is required");
    }
    return value;
  }

  function requireHttpUrl(value, path) {
    if (typeof value !== "string" || !/^https?:\/\//.test(value)) {
      throw schemaError("RLFX_SCHEMA_INVALID", path, "HTTP or HTTPS URL is required");
    }
    return value;
  }

  function exactKeys(value, allowed, path) {
    Object.keys(value).forEach(function (key) {
      if (allowed.indexOf(key) === -1) throw schemaError("RLFX_SCHEMA_INVALID", path + "." + key, "unknown key");
    });
  }

  function sum(values) {
    return values.reduce(function (total, value) { return total + value; }, 0);
  }

  function mean(values) {
    return values.length ? sum(values) / values.length : null;
  }

  function sampleStd(values) {
    if (values.length < 2) return 0;
    var average = mean(values);
    var variance = sum(values.map(function (value) { return Math.pow(value - average, 2); })) / (values.length - 1);
    return Math.sqrt(variance);
  }

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function utcDate(timestamp) {
    return new Date(timestamp).toISOString().slice(0, 10);
  }

  function validateReviewWindow(windowValue, path) {
    requireObject(windowValue, path);
    if (windowValue.mode === "max-age") {
      exactKeys(windowValue, ["mode", "observedMaxAgeMs", "retrievalMaxAgeMs"], path);
      requireFinite(windowValue.observedMaxAgeMs, path + ".observedMaxAgeMs");
      requireFinite(windowValue.retrievalMaxAgeMs, path + ".retrievalMaxAgeMs");
      if (windowValue.observedMaxAgeMs <= 0 || windowValue.retrievalMaxAgeMs <= 0) {
        throw schemaError("RLFX_SCHEMA_INVALID", path, "max-age windows must be positive");
      }
      return;
    }
    if (windowValue.mode === "next-review") {
      exactKeys(windowValue, ["mode", "reviewAt", "retrievalMaxAgeMs"], path);
      requireIso(windowValue.reviewAt, path + ".reviewAt");
      requireFinite(windowValue.retrievalMaxAgeMs, path + ".retrievalMaxAgeMs");
      if (windowValue.retrievalMaxAgeMs <= 0) throw schemaError("RLFX_SCHEMA_INVALID", path, "retrieval window must be positive");
      return;
    }
    throw schemaError("RLFX_SCHEMA_INVALID", path + ".mode", "unknown review-window mode");
  }

  function validationFailure(error) {
    return deepFreeze({
      ok: false,
      errors: [{
        code: error && error.code ? error.code : "RLFX_UNIVERSE_INVALID",
        path: error && error.path ? error.path : "$",
        message: error && error.message ? error.message : "universe validation failed"
      }]
    });
  }

  function validateUniverse(value) {
    try {
      requireObject(value, "$ ");
      exactKeys(value, ["schemaVersion", "version", "reviewedAt", "currencies", "broadDollarSeries", "directPairs", "derivedCrosses", "evidenceSources", "policies"], "$ ");
      if (value.schemaVersion !== "rlfx-universe/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$.schemaVersion", "unknown universe contract");
      requireNonEmptyString(value.version, "RLFX_UNIVERSE_INVALID");
      requireIsoDate(value.reviewedAt, "$.reviewedAt");

      var currencyIds = {};
      requireArray(value.currencies, "$.currencies");
      if (value.currencies.length === 0 || value.currencies.length > 32) throw schemaError("RLFX_UNIVERSE_INVALID", "$.currencies", "bounded currency inventory is required");
      value.currencies.forEach(function (currency, index) {
        var path = "$.currencies[" + index + "]";
        requireObject(currency, path);
        exactKeys(currency, ["code", "name", "cohort", "rankEligible", "autoPairEligible", "usdLeg", "tradability", "settlement", "management", "onshoreOffshore", "fixing", "limitations"], path);
        requireNonEmptyString(currency.code, "RLFX_UNIVERSE_INVALID");
        requireNonEmptyString(currency.name, "RLFX_UNIVERSE_INVALID");
        requireEnum(currency.cohort, COHORTS, path + ".cohort");
        if (currencyIds[currency.code]) throw schemaError("RLFX_UNIVERSE_INVALID", path + ".code", "duplicate currency code");
        currencyIds[currency.code] = true;
        if (typeof currency.rankEligible !== "boolean" || typeof currency.autoPairEligible !== "boolean") throw schemaError("RLFX_UNIVERSE_INVALID", path, "eligibility flags are required");
        requireEnum(currency.tradability, ["indicative-proxy", "reference-only", "non-tradable"], path + ".tradability");
        requireEnum(currency.settlement, ["deliverable", "non-deliverable", "mixed", "reference"], path + ".settlement");
        requireEnum(currency.management, ["free-float", "managed", "peg-band", "reference"], path + ".management");
        requireEnum(currency.onshoreOffshore, ["not-applicable", "onshore", "offshore", "both"], path + ".onshoreOffshore");
        requireStringArray(currency.limitations, path + ".limitations", currency.management === "free-float");
        if (currency.code === "USD") {
          if (currency.usdLeg !== null) throw schemaError("RLFX_UNIVERSE_INVALID", path + ".usdLeg", "USD numeraire must have a null market leg");
        } else {
          requireObject(currency.usdLeg, path + ".usdLeg");
          exactKeys(currency.usdLeg, ["symbol", "sourceBase", "sourceQuote", "canonicalBase", "canonicalQuote", "sourcePolicyId"], path + ".usdLeg");
          ["symbol", "sourceBase", "sourceQuote", "canonicalBase", "canonicalQuote", "sourcePolicyId"].forEach(function (field) {
            requireNonEmptyString(currency.usdLeg[field], "RLFX_UNIVERSE_INVALID");
          });
          if (currency.usdLeg.canonicalBase !== currency.code || currency.usdLeg.canonicalQuote !== "USD") throw schemaError("RLFX_UNIVERSE_INVALID", path + ".usdLeg", "canonical USD orientation is invalid");
        }
        if (currency.cohort === "managed-reference" && (currency.rankEligible || currency.autoPairEligible)) throw schemaError("RLFX_UNIVERSE_INVALID", path, "managed/reference currencies cannot rank or auto-pair");
      });

      var sourceIds = {};
      requireArray(value.evidenceSources, "$.evidenceSources");
      value.evidenceSources.forEach(function (policy, index) {
        var path = "$.evidenceSources[" + index + "]";
        requireObject(policy, path);
        exactKeys(policy, ["sourceId", "providerTags", "family", "activation", "acquisition", "sourceUrl", "sourceUsePolicyId", "sourceUseReviewRef", "reviewedAt", "rights", "persistence", "expectedCadence", "reviewWindow", "subjects", "limitations"], path);
        requireNonEmptyString(policy.sourceId, "RLFX_SOURCE_POLICY_INVALID");
        if (sourceIds[policy.sourceId]) throw schemaError("RLFX_SOURCE_POLICY_INVALID", path + ".sourceId", "duplicate source policy");
        sourceIds[policy.sourceId] = true;
        requireStringArray(policy.providerTags, path + ".providerTags", policy.acquisition === "unavailable");
        requireEnum(policy.family, OBSERVATION_FAMILIES, path + ".family");
        requireEnum(policy.activation, ["approved", "unreviewed", "denied"], path + ".activation");
        requireEnum(policy.acquisition, ["same-origin-snapshot", "headless-network", "unavailable"], path + ".acquisition");
        requireHttpUrl(policy.sourceUrl, path + ".sourceUrl");
        requireEnum(policy.rights, ["redistributable", "reference-only", "restricted", "unknown"], path + ".rights");
        requireEnum(policy.persistence, ["public-snapshot", "memory-only", "forbidden"], path + ".persistence");
        requireEnum(policy.expectedCadence, ["session", "daily", "weekly", "monthly", "event-driven", "tenor-specific"], path + ".expectedCadence");
        validateReviewWindow(policy.reviewWindow, path + ".reviewWindow");
        requireStringArray(policy.subjects, path + ".subjects", false);
        requireStringArray(policy.limitations, path + ".limitations", false);
        if (policy.activation === "approved") {
          requireNonEmptyString(policy.sourceUsePolicyId, "RLFX_SOURCE_POLICY_INVALID");
          requireNonEmptyString(policy.sourceUseReviewRef, "RLFX_SOURCE_POLICY_INVALID");
          requireIso(policy.reviewedAt, path + ".reviewedAt");
          if (!contains(ALLOWED_RIGHTS, policy.rights) || policy.persistence === "forbidden") throw schemaError("RLFX_SOURCE_POLICY_INVALID", path, "approved policy must permit its declared use");
        } else if (policy.sourceUsePolicyId !== null || policy.sourceUseReviewRef !== null || policy.reviewedAt !== null) {
          throw schemaError("RLFX_SOURCE_POLICY_INVALID", path, "inactive policies cannot carry authorization claims");
        }
      });

      requireArray(value.broadDollarSeries, "$.broadDollarSeries");
      value.broadDollarSeries.forEach(function (series, index) {
        var path = "$.broadDollarSeries[" + index + "]";
        requireObject(series, path);
        exactKeys(series, ["id", "slot", "kind", "symbol", "sourcePolicyId", "quality", "limitations"], path);
        requireNonEmptyString(series.id, "RLFX_UNIVERSE_INVALID");
        requireEnum(series.slot, ["Broad", "AFE", "EME"], path + ".slot");
        requireEnum(series.kind, ["official", "proxy"], path + ".kind");
        if (series.symbol !== null) requireNonEmptyString(series.symbol, "RLFX_UNIVERSE_INVALID");
        if (!sourceIds[series.sourcePolicyId]) throw schemaError("RLFX_UNIVERSE_INVALID", path + ".sourcePolicyId", "unknown source policy");
        requireEnum(series.quality, ["observed", "official-revised", "indicative-proxy"], path + ".quality");
        requireStringArray(series.limitations, path + ".limitations", false);
      });

      var pairIds = {};
      requireArray(value.directPairs, "$.directPairs");
      value.directPairs.forEach(function (pair, index) {
        var path = "$.directPairs[" + index + "]";
        requireObject(pair, path);
        exactKeys(pair, ["id", "symbol", "base", "quote", "sourceBase", "sourceQuote", "sourcePolicyId", "cohortRelationship", "tradability", "limitations"], path);
        ["id", "symbol", "base", "quote", "sourceBase", "sourceQuote", "sourcePolicyId"].forEach(function (field) { requireNonEmptyString(pair[field], "RLFX_UNIVERSE_INVALID"); });
        if (!currencyIds[pair.base] || !currencyIds[pair.quote] || pair.base === pair.quote) throw schemaError("RLFX_UNIVERSE_INVALID", path, "pair currencies are invalid");
        var relationship = [pair.base, pair.quote].sort().join("-");
        if (pairIds[relationship]) throw schemaError("RLFX_UNIVERSE_INVALID", path, "duplicate direct/inverse relationship");
        pairIds[relationship] = true;
        if (!sourceIds[pair.sourcePolicyId]) throw schemaError("RLFX_UNIVERSE_INVALID", path + ".sourcePolicyId", "unknown source policy");
        requireEnum(pair.cohortRelationship, ["within-G10", "within-liquid-EM", "cross-cohort", "managed-reference"], path + ".cohortRelationship");
        requireEnum(pair.tradability, ["indicative-proxy", "reference-only", "non-tradable"], path + ".tradability");
        requireStringArray(pair.limitations, path + ".limitations", false);
      });

      requireObject(value.derivedCrosses, "$.derivedCrosses");
      exactKeys(value.derivedCrosses, ["enabled", "automaticWithinCohortOnly", "explicitCrossCohort", "maximumRelationships", "limitations"], "$.derivedCrosses");
      if (typeof value.derivedCrosses.enabled !== "boolean" || value.derivedCrosses.automaticWithinCohortOnly !== true || value.derivedCrosses.explicitCrossCohort !== true) throw schemaError("RLFX_UNIVERSE_INVALID", "$.derivedCrosses", "derived-cross boundary is invalid");
      requirePositiveInteger(value.derivedCrosses.maximumRelationships, "$.derivedCrosses.maximumRelationships");
      requireStringArray(value.derivedCrosses.limitations, "$.derivedCrosses.limitations", false);

      requireObject(value.policies, "$.policies");
      exactKeys(value.policies, ["horizons", "strength", "risk", "pair", "globalRotation", "carryUnwind", "dailyBarReviewHours"], "$.policies");
      ["tactical", "swing", "structural"].forEach(function (horizon) {
        var policy = value.policies.horizons && value.policies.horizons[horizon];
        requireObject(policy, "$.policies.horizons." + horizon);
        exactKeys(policy, ["sessions", "deadbandLogReturn", "momentumScale", "trendFast", "trendSlow"], "$.policies.horizons." + horizon);
        requirePositiveInteger(policy.sessions, "$.policies.horizons." + horizon + ".sessions");
        ["deadbandLogReturn", "momentumScale"].forEach(function (field) { if (requireFinite(policy[field], "$.policies.horizons." + horizon + "." + field) <= 0) throw schemaError("RLFX_UNIVERSE_INVALID", "$.policies.horizons." + horizon + "." + field, "positive policy is required"); });
        requirePositiveInteger(policy.trendFast, "$.policies.horizons." + horizon + ".trendFast");
        requirePositiveInteger(policy.trendSlow, "$.policies.horizons." + horizon + ".trendSlow");
        if (policy.trendFast >= policy.trendSlow) throw schemaError("RLFX_UNIVERSE_INVALID", "$.policies.horizons." + horizon, "fast trend must be shorter than slow trend");
      });
      requireObject(value.policies.strength, "$.policies.strength");
      ["minimumPeers", "minimumCoverageRatio", "stateZ", "rankStabilityDates"].forEach(function (field) { requireFinite(value.policies.strength[field], "$.policies.strength." + field); });
      requireObject(value.policies.risk, "$.policies.risk");
      ["volatilitySessions", "drawdownSessions", "annualization", "calmPercentile", "stressedPercentile"].forEach(function (field) { requireFinite(value.policies.risk[field], "$.policies.risk." + field); });
      requireObject(value.policies.pair, "$.policies.pair");
      requireObject(value.policies.pair.lensWeights, "$.policies.pair.lensWeights");
      ["balanced", "trend", "risk"].forEach(function (lens) {
        var weights = value.policies.pair.lensWeights[lens];
        requireObject(weights, "$.policies.pair.lensWeights." + lens);
        exactKeys(weights, ["strength", "momentum", "trend", "risk"], "$.policies.pair.lensWeights." + lens);
        Object.keys(weights).forEach(function (key) { requireFinite(weights[key], "$.policies.pair.lensWeights." + lens + "." + key); });
        if (Math.abs(sum(Object.keys(weights).map(function (key) { return weights[key]; })) - 1) > 1e-12) throw schemaError("RLFX_UNIVERSE_INVALID", "$.policies.pair.lensWeights." + lens, "weights must sum to one");
      });
      requireObject(value.policies.globalRotation, "$.policies.globalRotation");
      requireObject(value.policies.globalRotation.postureWeights, "$.policies.globalRotation.postureWeights");
      ["offense", "balanced", "defense"].forEach(function (posture) {
        var weights = value.policies.globalRotation.postureWeights[posture];
        requireObject(weights, "$.policies.globalRotation.postureWeights." + posture);
        exactKeys(weights, ["momentum", "trend", "risk"], "$.policies.globalRotation.postureWeights." + posture);
        if (Math.abs(weights.momentum + weights.trend + weights.risk - 1) > 1e-12) throw schemaError("RLFX_UNIVERSE_INVALID", "$.policies.globalRotation.postureWeights." + posture, "weights must sum to one");
      });
      requireObject(value.policies.carryUnwind, "$.policies.carryUnwind");
      requireFinite(value.policies.carryUnwind.fundingStrengthZ, "$.policies.carryUnwind.fundingStrengthZ");
      requireFinite(value.policies.carryUnwind.riskVolatilityRatio, "$.policies.carryUnwind.riskVolatilityRatio");
      requireFinite(value.policies.dailyBarReviewHours, "$.policies.dailyBarReviewHours");
      return deepFreeze({ ok: true, value: cloneCanonical(value) });
    } catch (error) {
      return validationFailure(error);
    }
  }

  function unavailableEnvelope(raw, policy, reason, detail) {
    var providerTag = raw && typeof raw.providerTag === "string" ? raw.providerTag : null;
    var observedAsOf = raw && typeof raw.observedAsOf === "string" && Number.isFinite(Date.parse(raw.observedAsOf)) ? new Date(Date.parse(raw.observedAsOf)).toISOString() : null;
    var retrievedAt = raw && typeof raw.retrievedAt === "string" && Number.isFinite(Date.parse(raw.retrievedAt)) ? new Date(Date.parse(raw.retrievedAt)).toISOString() : null;
    var sourceId = policy && typeof policy.sourceId === "string" ? policy.sourceId : null;
    var rights = policy && typeof policy.rights === "string" ? policy.rights : "unknown";
    var limitations = policy && Array.isArray(policy.limitations) ? policy.limitations.slice() : [];
    if (detail) limitations.push(detail);
    return deepFreeze({
      contractVersion: "rldata-bar-series/v1",
      seriesId: "series:" + String(raw && raw.symbol ? raw.symbol : "unknown") + ":" + String(raw && raw.interval ? raw.interval : "unknown"),
      symbol: raw && typeof raw.symbol === "string" ? raw.symbol : "",
      interval: raw && typeof raw.interval === "string" ? raw.interval : "1d",
      availability: "unavailable",
      rows: [],
      source: {
        id: sourceId,
        providerTag: providerTag,
        url: null,
        sourceUsePolicyId: policy && typeof policy.sourceUsePolicyId === "string" ? policy.sourceUsePolicyId : null,
        sourceUseReviewRef: policy && typeof policy.sourceUseReviewRef === "string" ? policy.sourceUseReviewRef : null
      },
      observedAsOf: observedAsOf,
      retrievedAt: retrievedAt,
      expectedCadence: policy && typeof policy.expectedCadence === "string" ? policy.expectedCadence : null,
      reviewWindow: policy && isPlainObject(policy.reviewWindow) ? cloneCanonical(policy.reviewWindow) : null,
      freshUntil: null,
      cacheAgeMs: retrievedAt && raw && typeof raw.decisionTime === "string" ? Math.max(0, Date.parse(raw.decisionTime) - Date.parse(retrievedAt)) : null,
      unavailableReason: reason,
      rights: rights,
      quality: null,
      limitations: limitations
    });
  }

  function normalizeSourceEnvelope(value, policy, decisionTime) {
    requireObject(value, "$envelope");
    requireObject(policy, "$policy");
    requireIso(decisionTime, "$decisionTime");
    var raw = cloneCanonical(value);
    raw.decisionTime = decisionTime;
    if (typeof raw.symbol !== "string" || raw.symbol.trim() === "" || raw.interval !== "1d") return unavailableEnvelope(raw, policy, "SOURCE_ERROR", "Symbol and daily interval are required");
    if (raw.metadataVerified === false) return unavailableEnvelope(raw, policy, "RIGHTS_UNCLEAR", "Legacy rows have no reviewed series metadata");
    if (policy.activation !== "approved" || !contains(ALLOWED_RIGHTS, policy.rights) || policy.persistence === "forbidden" || typeof policy.sourceUsePolicyId !== "string" || !policy.sourceUsePolicyId || typeof policy.sourceUseReviewRef !== "string" || !policy.sourceUseReviewRef) {
      return unavailableEnvelope(raw, policy, "RIGHTS_UNCLEAR", "Source-use authorization is incomplete");
    }
    if (!Array.isArray(policy.providerTags) || policy.providerTags.indexOf(raw.providerTag) === -1 || !Array.isArray(policy.subjects) || policy.subjects.indexOf(raw.symbol) === -1) {
      return unavailableEnvelope(raw, policy, "RIGHTS_UNCLEAR", "Provider tag or subject does not match the approved policy");
    }
    try {
      requireHttpUrl(policy.sourceUrl, "$policy.sourceUrl");
      if (raw.sourceUrl !== policy.sourceUrl) return unavailableEnvelope(raw, policy, "RIGHTS_UNCLEAR", "Source URL does not match the approved policy");
      requireIso(raw.retrievedAt, "$envelope.retrievedAt");
      validateReviewWindow(policy.reviewWindow, "$policy.reviewWindow");
      var normalized = normalizeDailySeries(raw.rows, { legId: raw.symbol, observationId: policy.sourceId + ":" + raw.symbol, subject: raw.symbol, adjustment: "raw-close" });
      if (normalized.rows.length === 0) return unavailableEnvelope(raw, policy, "NONFINITE", "No finite positive rows remain");
      var observedAsOf = new Date(normalized.rows[normalized.rows.length - 1].t).toISOString();
      var observedEpoch = Date.parse(observedAsOf);
      var retrievedEpoch = Date.parse(raw.retrievedAt);
      var decisionEpoch = Date.parse(decisionTime);
      var freshUntilEpoch;
      if (policy.reviewWindow.mode === "max-age") {
        freshUntilEpoch = Math.min(observedEpoch + policy.reviewWindow.observedMaxAgeMs, retrievedEpoch + policy.reviewWindow.retrievalMaxAgeMs);
      } else {
        freshUntilEpoch = Math.min(Date.parse(policy.reviewWindow.reviewAt), retrievedEpoch + policy.reviewWindow.retrievalMaxAgeMs);
      }
      var quality = typeof raw.quality === "string" ? raw.quality : (policy.family === "spot" ? "observed" : "indicative-proxy");
      requireEnum(quality, ["observed", "indicative-proxy", "official-revised"], "$envelope.quality");
      return deepFreeze({
        contractVersion: "rldata-bar-series/v1",
        seriesId: "series:" + policy.sourceId + ":" + raw.symbol + ":" + raw.interval,
        symbol: raw.symbol,
        interval: raw.interval,
        availability: decisionEpoch <= freshUntilEpoch ? "fresh" : "stale",
        rows: normalized.rows.map(function (row) { return { t: row.t, c: row.c }; }),
        source: {
          id: policy.sourceId,
          providerTag: raw.providerTag,
          url: policy.sourceUrl,
          sourceUsePolicyId: policy.sourceUsePolicyId,
          sourceUseReviewRef: policy.sourceUseReviewRef
        },
        observedAsOf: observedAsOf,
        retrievedAt: raw.retrievedAt,
        expectedCadence: policy.expectedCadence,
        reviewWindow: cloneCanonical(policy.reviewWindow),
        freshUntil: new Date(freshUntilEpoch).toISOString(),
        cacheAgeMs: Math.max(0, decisionEpoch - retrievedEpoch),
        rights: policy.rights,
        quality: quality,
        limitations: requireStringArray(policy.limitations, "$policy.limitations", false).slice()
      });
    } catch (error) {
      return unavailableEnvelope(raw, policy, "SOURCE_ERROR", error.message);
    }
  }

  function normalizeObservation(value) {
    requireObject(value, "$observation");
    exactKeys(value, ["contractVersion", "observationId", "family", "subject", "base", "quote", "sourceBase", "sourceQuote", "inverted", "positiveMeaning", "cohort", "tradability", "value", "event", "unit", "transformation", "horizon", "source", "observedAsOf", "retrievedAt", "expectedCadence", "reviewWindow", "availability", "unavailableReason", "availabilityDetail", "rights", "quality", "revisionId", "adjustment", "lineage", "limitations"], "$observation");
    if (value.contractVersion !== "rlfx-currency-observation/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$observation.contractVersion", "unknown observation contract");
    requireNonEmptyString(value.observationId, "RLFX_SCHEMA_INVALID");
    requireEnum(value.family, OBSERVATION_FAMILIES, "$observation.family");
    requireObject(value.subject, "$observation.subject");
    requireEnum(value.subject.kind, ["currency", "pair", "cohort", "index", "contract", "event"], "$observation.subject.kind");
    requireNonEmptyString(value.subject.id, "RLFX_SCHEMA_INVALID");
    requireEnum(value.cohort, ["G10", "liquid-EM", "managed-reference", "unsupported"], "$observation.cohort");
    requireEnum(value.tradability, ["tradable-observed", "indicative-proxy", "reference-only", "non-tradable"], "$observation.tradability");
    requireEnum(value.availability, AVAILABILITIES, "$observation.availability");
    requireEnum(value.rights, ["redistributable", "reference-only", "restricted", "unknown"], "$observation.rights");
    requireEnum(value.quality, ["observed", "official-revised", "indicative-proxy", "derived", "user-assumption"], "$observation.quality");
    requireIso(value.observedAsOf, "$observation.observedAsOf");
    requireIso(value.retrievedAt, "$observation.retrievedAt");
    validateReviewWindow(value.reviewWindow, "$observation.reviewWindow");
    requireObject(value.source, "$observation.source");
    requireHttpUrl(value.source.url, "$observation.source.url");
    requireObject(value.lineage, "$observation.lineage");
    requireStringArray(value.lineage.originIds, "$observation.lineage.originIds", false);
    requireStringArray(value.lineage.derivedFrom, "$observation.lineage.derivedFrom", true);
    requireStringArray(value.limitations, "$observation.limitations", value.quality === "observed");
    if (value.subject.kind === "pair") {
      ["base", "quote", "sourceBase", "sourceQuote", "positiveMeaning"].forEach(function (field) { requireNonEmptyString(value[field], "RLFX_SCHEMA_INVALID"); });
      if (typeof value.inverted !== "boolean") throw schemaError("RLFX_SCHEMA_INVALID", "$observation.inverted", "pair inversion flag is required");
    }
    var result = cloneCanonical(value);
    if (value.rights === "restricted" || value.rights === "unknown") {
      delete result.value;
      result.availability = "unavailable";
      result.unavailableReason = "RIGHTS_UNCLEAR";
      result.availabilityDetail = "Numeric value excluded because source rights are not approved";
      result.source.url = null;
      return deepFreeze(result);
    }
    if (value.availability === "unavailable") {
      requireEnum(value.unavailableReason, UNAVAILABLE_REASONS, "$observation.unavailableReason");
      if (Object.prototype.hasOwnProperty.call(value, "value")) throw schemaError("RLFX_SCHEMA_INVALID", "$observation.value", "unavailable observation cannot contain a value");
    } else {
      if (Object.prototype.hasOwnProperty.call(value, "unavailableReason")) throw schemaError("RLFX_SCHEMA_INVALID", "$observation.unavailableReason", "available observation cannot contain an unavailable reason");
      if (value.family !== "event") requireFinite(value.value, "$observation.value");
    }
    return deepFreeze(result);
  }

  function normalizeCarryRead(value, decisionTime) {
    requireObject(value, "$carry");
    requireIso(decisionTime, "$decisionTime");
    if (value.contractVersion !== "rlfx-carry-read/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$carry.contractVersion", "unknown carry contract");
    requireEnum(value.kind, ["unavailable", "policy-rate-proxy", "market-implied"], "$carry.kind");
    requireObject(value.pair, "$carry.pair");
    requireNonEmptyString(value.pair.base, "RLFX_SCHEMA_INVALID");
    requireNonEmptyString(value.pair.quote, "RLFX_SCHEMA_INVALID");
    requireStringArray(value.limitations, "$carry.limitations", false);
    requireIso(value.computedAt, "$carry.computedAt");
    if (value.computedAt !== decisionTime) throw schemaError("RLFX_DECISION_TIME_INVALID", "$carry.computedAt", "carry computedAt must equal decisionTime");
    var copy = cloneCanonical(value);
    if (value.kind === "unavailable") {
      requireEnum(value.unavailableReason, UNAVAILABLE_REASONS, "$carry.unavailableReason");
      if (value.freshUntil !== null) throw schemaError("RLFX_SCHEMA_INVALID", "$carry.freshUntil", "unavailable carry has no freshness deadline");
      copy.label = "Unavailable";
      return deepFreeze(copy);
    }
    requireFinite(value.value, "$carry.value");
    requireEnum(value.rights, ALLOWED_RIGHTS, "$carry.rights");
    requireIso(value.observedAsOf, "$carry.observedAsOf");
    requireIso(value.retrievedAt, "$carry.retrievedAt");
    requireIso(value.freshUntil, "$carry.freshUntil");
    requireStringArray(value.sourceObservationIds, "$carry.sourceObservationIds", false);
    requireNonEmptyString(value.tenor, "RLFX_SCHEMA_INVALID");
    requireNonEmptyString(value.unit, "RLFX_SCHEMA_INVALID");
    if (value.kind === "policy-rate-proxy") {
      exactKeys(value, ["contractVersion", "kind", "state", "pair", "proxyInstrument", "tenor", "basis", "value", "unit", "roll", "liquidity", "cost", "rights", "sourceObservationIds", "observedAsOf", "retrievedAt", "computedAt", "freshUntil", "limitations"], "$carry");
      if (value.state !== "Proxy Only" || value.tenor !== "policy-target-current" || value.basis !== "policy-rate-differential" || value.roll !== "not-applicable" || value.liquidity !== "not-observed" || value.cost !== "not-observed") throw schemaError("RLFX_SCHEMA_INVALID", "$carry", "policy-rate proxy taxonomy is invalid");
      requireObject(value.proxyInstrument, "$carry.proxyInstrument");
      requireNonEmptyString(value.proxyInstrument.basePolicyRate, "RLFX_SCHEMA_INVALID");
      requireNonEmptyString(value.proxyInstrument.quotePolicyRate, "RLFX_SCHEMA_INVALID");
      if (value.sourceObservationIds.length !== 2) throw schemaError("RLFX_SCHEMA_INVALID", "$carry.sourceObservationIds", "two policy observations are required");
      copy.label = "Policy-rate proxy";
      return deepFreeze(copy);
    }
    exactKeys(value, ["contractVersion", "kind", "subtype", "state", "pair", "instrument", "tenor", "basis", "value", "unit", "roll", "liquidity", "cost", "rights", "sourceObservationIds", "observedAsOf", "retrievedAt", "computedAt", "freshUntil", "limitations"], "$carry");
    requireEnum(value.subtype, ["tradable-forward", "futures-implied", "swap-implied"], "$carry.subtype");
    if (value.state !== "Market Implied") throw schemaError("RLFX_SCHEMA_INVALID", "$carry.state", "market-implied state is required");
    requireObject(value.instrument, "$carry.instrument");
    ["id", "venue", "contractOrQuote"].forEach(function (field) { requireNonEmptyString(value.instrument[field], "RLFX_SCHEMA_INVALID"); });
    requireObject(value.basis, "$carry.basis");
    requireNonEmptyString(value.basis.kind, "RLFX_SCHEMA_INVALID");
    if (value.basis.value !== null) requireFinite(value.basis.value, "$carry.basis.value");
    requireNonEmptyString(value.basis.unit, "RLFX_SCHEMA_INVALID");
    if (typeof value.basis.observed !== "boolean") throw schemaError("RLFX_SCHEMA_INVALID", "$carry.basis.observed", "basis observation flag is required");
    ["roll", "liquidity", "cost"].forEach(function (field) {
      requireObject(value[field], "$carry." + field);
    });
    ["convention", "limitation"].forEach(function (field) { requireNonEmptyString(value.roll[field], "RLFX_SCHEMA_INVALID"); });
    if (value.roll.nextRollAt !== null) requireIso(value.roll.nextRollAt, "$carry.roll.nextRollAt");
    ["measure", "unit", "limitation"].forEach(function (field) { requireNonEmptyString(value.liquidity[field], "RLFX_SCHEMA_INVALID"); requireNonEmptyString(value.cost[field], "RLFX_SCHEMA_INVALID"); });
    if (value.liquidity.value !== null) requireFinite(value.liquidity.value, "$carry.liquidity.value");
    if (value.cost.value !== null) requireFinite(value.cost.value, "$carry.cost.value");
    copy.label = "Market-implied carry";
    return deepFreeze(copy);
  }

  function normalizeDailySeries(rows, leg) {
    requireArray(rows, "$rows");
    leg = isPlainObject(leg) ? leg : {};
    var byDate = {};
    var dropped = 0;
    rows.forEach(function (row, index) {
      if (!isPlainObject(row) || !Number.isFinite(row.t) || !Number.isFinite(row.c) || row.c <= 0) return;
      var date;
      try { date = utcDate(row.t); } catch (_error) { return; }
      var prior = byDate[date];
      if (!prior || row.t > prior.t || (row.t === prior.t && index > prior.inputIndex)) {
        if (prior) dropped += 1;
        byDate[date] = { date: date, t: row.t, c: row.c, inputIndex: index };
      } else {
        dropped += 1;
      }
    });
    var normalizedRows = Object.keys(byDate).sort().map(function (date) {
      return { date: date, t: byDate[date].t, c: byDate[date].c };
    });
    return deepFreeze({
      legId: typeof leg.legId === "string" ? leg.legId : "series",
      observationId: typeof leg.observationId === "string" ? leg.observationId : (typeof leg.legId === "string" ? leg.legId : "series"),
      subject: typeof leg.subject === "string" ? leg.subject : (typeof leg.legId === "string" ? leg.legId : "series"),
      adjustment: typeof leg.adjustment === "string" ? leg.adjustment : "raw-close",
      rows: normalizedRows,
      validDateCount: normalizedRows.length,
      duplicateDatesDropped: dropped
    });
  }

  function relationshipId(base, quote) {
    return "rel:" + [base, quote].sort().join("-");
  }

  function orientSeries(rows, sourceOrientation, requestedOrientation) {
    requireObject(sourceOrientation, "$sourceOrientation");
    requireObject(requestedOrientation, "$requestedOrientation");
    ["base", "quote"].forEach(function (field) {
      requireNonEmptyString(sourceOrientation[field], "RLFX_SCHEMA_INVALID");
      requireNonEmptyString(requestedOrientation[field], "RLFX_SCHEMA_INVALID");
    });
    var direct = sourceOrientation.base === requestedOrientation.base && sourceOrientation.quote === requestedOrientation.quote;
    var inverse = sourceOrientation.base === requestedOrientation.quote && sourceOrientation.quote === requestedOrientation.base;
    var id = relationshipId(requestedOrientation.base, requestedOrientation.quote);
    if (!direct && !inverse) {
      return deepFreeze({ state: "unavailable", unavailableReason: "INVALID_ORIENTATION", base: requestedOrientation.base, quote: requestedOrientation.quote, relationshipId: id, rows: [], lineage: { construction: "unavailable", sourceOrientation: cloneCanonical(sourceOrientation) } });
    }
    var normalized = normalizeDailySeries(rows, { legId: id, observationId: id, subject: requestedOrientation.base + "/" + requestedOrientation.quote, adjustment: "raw-close" });
    var orientedRows = normalized.rows.map(function (row) {
      return { date: row.date, t: row.t, c: inverse ? 1 / row.c : row.c };
    });
    if (!orientedRows.every(function (row) { return Number.isFinite(row.c) && row.c > 0; })) {
      return deepFreeze({ state: "unavailable", unavailableReason: "NONFINITE", base: requestedOrientation.base, quote: requestedOrientation.quote, relationshipId: id, rows: [], lineage: { construction: inverse ? "inverse" : "direct", sourceOrientation: cloneCanonical(sourceOrientation) } });
    }
    return deepFreeze({
      state: "ready",
      base: requestedOrientation.base,
      quote: requestedOrientation.quote,
      positiveMeaning: requestedOrientation.base + " strengthens versus " + requestedOrientation.quote,
      relationshipId: id,
      construction: inverse ? "inverse" : "direct",
      rows: orientedRows,
      lineage: { construction: inverse ? "inverse" : "direct", sourceOrientation: cloneCanonical(sourceOrientation) }
    });
  }

  function alignExact(legs, horizonSessions, purpose) {
    requireArray(legs, "$legs");
    requirePositiveInteger(horizonSessions, "$horizonSessions");
    if (legs.length === 0) throw schemaError("RLFX_SCHEMA_INVALID", "$legs", "at least one leg is required");
    var normalized = legs.map(function (leg, index) {
      requireObject(leg, "$legs[" + index + "]");
      return normalizeDailySeries(leg.rows, leg);
    });
    var adjustments = normalized.map(function (leg) { return leg.adjustment; }).filter(function (value, index, values) { return values.indexOf(value) === index; });
    if (adjustments.length > 1) throw schemaError("RLFX_SCHEMA_INVALID", "$legs", "adjusted and raw rows cannot be mixed");
    var dateSets = normalized.map(function (leg) { return new Set(leg.rows.map(function (row) { return row.date; })); });
    var commonDates = Array.from(dateSets[0]).filter(function (date) {
      return dateSets.slice(1).every(function (setValue) { return setValue.has(date); });
    }).sort();
    var requiredRowCount = horizonSessions + 1;
    var selectedDates = commonDates.slice(-requiredRowCount);
    var valuesByLeg = {};
    normalized.forEach(function (leg) {
      valuesByLeg[leg.legId] = Object.fromEntries(leg.rows.map(function (row) { return [row.date, row.c]; }));
    });
    var latestCommonDate = commonDates.length ? commonDates[commonDates.length - 1] : null;
    var unmatched = {};
    normalized.forEach(function (leg) {
      unmatched[leg.legId] = leg.rows.map(function (row) { return row.date; }).filter(function (date) { return latestCommonDate === null || date > latestCommonDate; });
    });
    var state = commonDates.length >= requiredRowCount ? "aligned" : (commonDates.length ? "insufficient" : "unavailable");
    var unavailableReason = state === "insufficient" ? "INSUFFICIENT_HISTORY" : (state === "unavailable" ? "NO_COMMON_DATES" : null);
    var identity = {
      purpose: purpose || "pair-return",
      horizonSessions: horizonSessions,
      legs: normalized.map(function (leg) { return { legId: leg.legId, dates: leg.rows.map(function (row) { return row.date; }) }; })
    };
    var result = {
      contractVersion: "rlfx-observation-set/v1",
      setId: "set-v1-" + decisionId(identity).slice("fxd-v1-".length),
      purpose: purpose || "pair-return",
      horizonSessions: horizonSessions,
      legs: normalized.map(function (leg) { return { legId: leg.legId, observationId: leg.observationId, subject: leg.subject, orientation: leg.legId, adjustment: leg.adjustment, validDateCount: leg.validDateCount }; }),
      alignedRows: selectedDates.map(function (date) {
        var values = {};
        normalized.forEach(function (leg) { values[leg.legId] = valuesByLeg[leg.legId][date]; });
        return { date: date, values: values };
      }),
      coverage: {
        requiredRowCount: requiredRowCount,
        commonRowCount: commonDates.length,
        earliestCommonDate: commonDates.length ? commonDates[0] : null,
        latestCommonDate: latestCommonDate,
        unmatchedNewerDates: unmatched,
        duplicateDatesDropped: Object.fromEntries(normalized.map(function (leg) { return [leg.legId, leg.duplicateDatesDropped]; }))
      },
      lineage: { sourceObservationIds: normalized.map(function (leg) { return leg.observationId; }), uniqueRelationshipIds: [] },
      state: state
    };
    if (unavailableReason) result.unavailableReason = unavailableReason;
    return deepFreeze(result);
  }

  function computeBroadDollar(input) {
    requireObject(input, "$broadDollar");
    requireIso(input.decisionTime, "$broadDollar.decisionTime");
    requireEnum(input.selected, ["Broad", "AFE", "EME"], "$broadDollar.selected");
    requirePositiveInteger(input.horizonSessions, "$broadDollar.horizonSessions");
    requireFinite(input.deadbandLogReturn, "$broadDollar.deadbandLogReturn");
    requirePositiveInteger(input.trendFast, "$broadDollar.trendFast");
    requirePositiveInteger(input.trendSlow, "$broadDollar.trendSlow");
    requireArray(input.series, "$broadDollar.series");
    var records = {};
    input.series.forEach(function (series, index) {
      requireObject(series, "$broadDollar.series[" + index + "]");
      requireNonEmptyString(series.id, "RLFX_SCHEMA_INVALID");
      requireEnum(series.slot, ["Broad", "AFE", "EME"], "$broadDollar.series[" + index + "].slot");
      requireEnum(series.kind, ["official", "proxy"], "$broadDollar.series[" + index + "].kind");
      requireIso(series.observedAsOf, "$broadDollar.series[" + index + "].observedAsOf");
      var normalized = normalizeDailySeries(series.rows, { legId: series.id, observationId: series.id, subject: series.slot, adjustment: "raw-close" });
      var state = "Indeterminate";
      var logReturn = null;
      var trend = 0;
      if (normalized.rows.length >= Math.max(input.horizonSessions + 1, input.trendSlow)) {
        var closes = normalized.rows.map(function (row) { return row.c; });
        var start = closes[closes.length - 1 - input.horizonSessions];
        var end = closes[closes.length - 1];
        logReturn = Math.log(end / start);
        var fast = mean(closes.slice(-input.trendFast));
        var slow = mean(closes.slice(-input.trendSlow));
        trend = end > fast && fast > slow ? 1 : (end < fast && fast < slow ? -1 : 0);
        var direction = logReturn > input.deadbandLogReturn ? 1 : (logReturn < -input.deadbandLogReturn ? -1 : 0);
        var vote = direction + trend;
        state = vote > 0 ? "Strengthening" : (vote < 0 ? "Weakening" : "Range-Bound");
      }
      records[series.id] = { id: series.id, slot: series.slot, kind: series.kind, state: state, observedAsOf: series.observedAsOf, logReturn: logReturn, trend: trend };
    });
    var official = Object.keys(records).map(function (id) { return records[id]; }).filter(function (record) { return record.kind === "official" && record.slot === input.selected; })[0] || null;
    var proxy = Object.keys(records).map(function (id) { return records[id]; }).filter(function (record) { return record.kind === "proxy" && record.slot === input.selected; })[0] || null;
    var conflicts = [];
    if (official && proxy && official.state !== "Indeterminate" && proxy.state !== "Indeterminate" && official.state !== "Range-Bound" && proxy.state !== "Range-Bound" && official.state !== proxy.state) {
      conflicts.push({ code: "OFFICIAL_PROXY_DIVERGENCE", families: [official.id, proxy.id], blocking: false, detail: "Official and proxy dollar directions oppose" });
    }
    var officialStates = Object.keys(records).map(function (id) { return records[id]; }).filter(function (record) { return record.kind === "official"; });
    var usableStates = officialStates.filter(function (record) { return record.state !== "Indeterminate"; });
    var concentration = "unavailable";
    if (usableStates.length) {
      var uniqueStates = usableStates.map(function (record) { return record.state; }).filter(function (state, index, states) { return states.indexOf(state) === index; });
      if (usableStates.length === 3 && uniqueStates.length === 1) concentration = "broad";
      else if (records["official-afe"] && records["official-broad"] && records["official-afe"].state === records["official-broad"].state) concentration = "AFE-led";
      else if (records["official-eme"] && records["official-broad"] && records["official-eme"].state === records["official-broad"].state) concentration = "EME-led";
      else concentration = "mixed";
    }
    var selectedState = official && official.state !== "Indeterminate" ? official.state : (proxy ? proxy.state : "Indeterminate");
    var basis = official && proxy ? "official-and-proxy" : (official ? "official" : (proxy ? "proxy-only" : "unavailable"));
    return deepFreeze({
      contractVersion: "rlfx-broad-dollar-read/v1",
      selected: input.selected,
      state: selectedState,
      basis: basis,
      series: records,
      concentration: concentration,
      conflicts: conflicts,
      confirmation: "Selected dollar series must retain its direction and trend on its next exact observation window.",
      invalidation: "An opposing selected-series direction or an official/proxy divergence invalidates the current regime read."
    });
  }

  function computeCurrencyStrength(input) {
    requireObject(input, "$strength");
    requireIso(input.decisionTime, "$strength.decisionTime");
    requireEnum(input.cohort, COHORTS, "$strength.cohort");
    requireArray(input.currencies, "$strength.currencies");
    requireObject(input.currencySeries, "$strength.currencySeries");
    requirePositiveInteger(input.horizonSessions, "$strength.horizonSessions");
    requirePositiveInteger(input.minimumPeers, "$strength.minimumPeers");
    requireFinite(input.minimumCoverageRatio, "$strength.minimumCoverageRatio");
    requireFinite(input.stateZ, "$strength.stateZ");
    requireFinite(input.deadbandLogReturn, "$strength.deadbandLogReturn");
    var configured = input.currencies.filter(function (currency) { return currency.cohort === input.cohort; });
    if (input.cohort === "managed-reference") {
      return deepFreeze({ contractVersion: "rlfx-cohort-strength/v1", cohort: input.cohort, state: "reference-only", evaluationDate: null, rankWindow: null, eligibleCount: 0, configuredCount: configured.length, coverageRatio: 0, dispersion: null, ranked: [], autoCandidate: null, limitations: ["Managed/reference currencies are inspection-only and cannot auto-rank or auto-pair."] });
    }
    var eligible = configured.filter(function (currency) { return currency.rankEligible === true && currency.management === "free-float"; });
    var legs = eligible.map(function (currency) {
      return { legId: currency.code, observationId: "currency:" + currency.code, subject: currency.code, adjustment: "raw-close", rows: input.currencySeries[currency.code] || [] };
    });
    var rankWindow = alignExact(legs, input.horizonSessions, "cohort-strength");
    var relationshipIds = [];
    for (var left = 0; left < eligible.length; left += 1) {
      for (var right = left + 1; right < eligible.length; right += 1) relationshipIds.push(relationshipId(eligible[left].code, eligible[right].code));
    }
    var mutableWindow = cloneCanonical(rankWindow);
    mutableWindow.lineage.uniqueRelationshipIds = relationshipIds;
    rankWindow = deepFreeze(mutableWindow);
    if (rankWindow.state !== "aligned") {
      return deepFreeze({ contractVersion: "rlfx-cohort-strength/v1", cohort: input.cohort, state: "unavailable", evaluationDate: rankWindow.coverage.latestCommonDate, rankWindow: rankWindow, eligibleCount: 0, configuredCount: configured.length, coverageRatio: 0, dispersion: null, ranked: [], autoCandidate: null, unavailableReason: rankWindow.unavailableReason, limitations: ["The complete eligible relationship graph does not share the configured exact-date window."] });
    }
    var first = rankWindow.alignedRows[0].values;
    var last = rankWindow.alignedRows[rankWindow.alignedRows.length - 1].values;
    var raw = {};
    var breadth = {};
    var peerCount = {};
    eligible.forEach(function (currency) {
      var peerReturns = eligible.filter(function (peer) { return peer.code !== currency.code; }).map(function (peer) {
        return Math.log(last[currency.code] / first[currency.code]) - Math.log(last[peer.code] / first[peer.code]);
      });
      raw[currency.code] = mean(peerReturns);
      peerCount[currency.code] = peerReturns.length;
      breadth[currency.code] = peerReturns.length ? (peerReturns.filter(function (value) { return value > input.deadbandLogReturn; }).length - peerReturns.filter(function (value) { return value < -input.deadbandLogReturn; }).length) / peerReturns.length : 0;
    });
    var eligibleCodes = eligible.filter(function (currency) {
      var coverage = peerCount[currency.code] / Math.max(1, configured.length - 1);
      return peerCount[currency.code] >= input.minimumPeers && coverage >= input.minimumCoverageRatio;
    }).map(function (currency) { return currency.code; });
    var rawValues = eligibleCodes.map(function (code) { return raw[code]; });
    var rawMean = mean(rawValues);
    var dispersion = sampleStd(rawValues);
    var ranked = eligible.map(function (currency) {
      var coverage = peerCount[currency.code] / Math.max(1, configured.length - 1);
      if (eligibleCodes.indexOf(currency.code) === -1) {
        return { currency: currency.code, cohort: input.cohort, state: "Unavailable", rank: null, rawMeanLogReturn: null, zDistance: null, breadth: null, eligiblePeerCount: peerCount[currency.code], requiredPeerCount: input.minimumPeers, coverageRatio: coverage, relationshipIds: relationshipIds.filter(function (id) { return id.indexOf(currency.code) !== -1; }), rankWindowId: rankWindow.setId, windowStart: rankWindow.coverage.earliestCommonDate, evaluationDate: rankWindow.coverage.latestCommonDate, rankStability: null, unavailableReason: "NO_COVERAGE" };
      }
      var z = dispersion === 0 ? 0 : (raw[currency.code] - rawMean) / dispersion;
      return { currency: currency.code, cohort: input.cohort, state: z >= input.stateZ ? "Strong" : (z <= -input.stateZ ? "Weak" : "Neutral"), rank: 0, rawMeanLogReturn: raw[currency.code], zDistance: z, breadth: breadth[currency.code], eligiblePeerCount: peerCount[currency.code], requiredPeerCount: input.minimumPeers, coverageRatio: coverage, relationshipIds: relationshipIds.filter(function (id) { return id.indexOf(currency.code) !== -1; }), rankWindowId: rankWindow.setId, windowStart: rankWindow.coverage.earliestCommonDate, evaluationDate: rankWindow.coverage.latestCommonDate, rankStability: null };
    });
    var rankable = ranked.filter(function (entry) { return Number.isFinite(entry.zDistance); }).sort(function (leftEntry, rightEntry) {
      return rightEntry.zDistance - leftEntry.zDistance || rightEntry.eligiblePeerCount - leftEntry.eligiblePeerCount || leftEntry.currency.localeCompare(rightEntry.currency);
    });
    rankable.forEach(function (entry, index) { entry.rank = index + 1; });
    var autoEligible = rankable.filter(function (entry) {
      var config = eligible.find(function (currency) { return currency.code === entry.currency; });
      return config && config.autoPairEligible === true;
    });
    var candidate = autoEligible.length >= 2 ? { base: autoEligible[0].currency, quote: autoEligible[autoEligible.length - 1].currency, cohort: input.cohort, relationshipId: relationshipId(autoEligible[0].currency, autoEligible[autoEligible.length - 1].currency) } : null;
    return deepFreeze({ contractVersion: "rlfx-cohort-strength/v1", cohort: input.cohort, state: rankable.length === eligible.length ? "ranked" : "partial", evaluationDate: rankWindow.coverage.latestCommonDate, rankWindow: rankWindow, eligibleCount: rankable.length, configuredCount: configured.length, coverageRatio: configured.length ? rankable.length / configured.length : 0, dispersion: dispersion, ranked: ranked.sort(function (leftEntry, rightEntry) { return (leftEntry.rank === null) - (rightEntry.rank === null) || (leftEntry.rank || 0) - (rightEntry.rank || 0); }), autoCandidate: candidate, limitations: ["Ranks use one full-graph exact-date window and unique economic relationships."] });
  }

  function trailingReturn(normalizedRows, sessions) {
    if (normalizedRows.length < sessions + 1) return null;
    return normalizedRows[normalizedRows.length - 1].c / normalizedRows[normalizedRows.length - 1 - sessions].c - 1;
  }

  function pairTrend(normalizedRows, fast, slow) {
    if (normalizedRows.length < slow) return null;
    var closes = normalizedRows.map(function (row) { return row.c; });
    var latest = closes[closes.length - 1];
    var fastAverage = mean(closes.slice(-fast));
    var slowAverage = mean(closes.slice(-slow));
    return latest > fastAverage && fastAverage > slowAverage ? 1 : (latest < fastAverage && fastAverage < slowAverage ? -1 : 0);
  }

  function realizedRisk(normalizedRows, policy, riskRise) {
    var closes = normalizedRows.map(function (row) { return row.c; });
    var returns = [];
    for (var index = Math.max(1, closes.length - policy.volatilitySessions); index < closes.length; index += 1) returns.push(Math.log(closes[index] / closes[index - 1]));
    var volatility = returns.length >= 2 ? sampleStd(returns) * Math.sqrt(policy.annualization) : null;
    var windowRows = normalizedRows.slice(-policy.drawdownSessions);
    var peak = null;
    var drawdown = 0;
    windowRows.forEach(function (row) {
      peak = peak === null ? row.c : Math.max(peak, row.c);
      drawdown = Math.min(drawdown, row.c / peak - 1);
    });
    return { state: riskRise ? "Stressed" : "Normal", volatility: volatility, drawdown: drawdown, horizonSessions: policy.volatilitySessions };
  }

  function unavailableCarry(decisionTime) {
    return deepFreeze({ contractVersion: "rlfx-carry-read/v1", kind: "unavailable", state: "Unavailable", pair: { base: "N/A", quote: "N/A" }, unavailableReason: "NO_SOURCE", availabilityDetail: "No carry input supplied", computedAt: decisionTime, freshUntil: null, limitations: ["Carry evidence is unavailable"], label: "Unavailable" });
  }

  function computePairRead(input) {
    requireObject(input, "$pair");
    requireIso(input.decisionTime, "$pair.decisionTime");
    requireNonEmptyString(input.base, "RLFX_SCHEMA_INVALID");
    requireNonEmptyString(input.quote, "RLFX_SCHEMA_INVALID");
    requireEnum(input.cohort, COHORTS, "$pair.cohort");
    requireEnum(input.selectedHorizon, ["tactical", "swing", "structural"], "$pair.selectedHorizon");
    requireObject(input.policy, "$pair.policy");
    requireObject(input.policy.horizons, "$pair.policy.horizons");
    requireObject(input.policy.risk, "$pair.policy.risk");
    var normalized = normalizeDailySeries(input.rows, { legId: input.base + input.quote, observationId: "pair:" + input.base + input.quote, subject: input.base + "/" + input.quote, adjustment: "raw-close" });
    var momentum = {};
    ["tactical", "swing", "structural"].forEach(function (name) {
      var horizon = input.policy.horizons[name];
      requireObject(horizon, "$pair.policy.horizons." + name);
      var value = trailingReturn(normalized.rows, horizon.sessions);
      momentum[name] = value === null ? { state: "Unavailable", value: null, unavailableReason: "INSUFFICIENT_HISTORY" } : { state: value > 0 ? "Positive" : (value < 0 ? "Negative" : "Flat"), value: value, horizonSessions: horizon.sessions };
    });
    var selected = momentum[input.selectedHorizon];
    var selectedPolicy = input.policy.horizons[input.selectedHorizon];
    var trend = pairTrend(normalized.rows, selectedPolicy.trendFast, selectedPolicy.trendSlow);
    var risk = realizedRisk(normalized.rows, input.policy.risk, input.riskRise === true);
    var carry = input.carry ? normalizeCarryRead(input.carry, input.decisionTime) : unavailableCarry(input.decisionTime);
    var conflicts = [];
    if (Number.isFinite(carry.value) && trend !== null && ((carry.value < 0 && trend > 0) || (carry.value > 0 && trend < 0))) conflicts.push({ code: "TREND_CARRY_DIVERGENCE", families: ["pair-trend", "carry"], blocking: false, detail: "Direct trend and carry evidence oppose" });
    if (input.reerValue && input.reerValue.availability !== "unavailable" && ((input.reerValue.state === "Cheap" && trend < 0) || (input.reerValue.state === "Rich" && trend > 0))) conflicts.push({ code: "VALUE_TREND_TENSION", families: ["reer-value", "pair-trend"], blocking: false, detail: "Slow value context opposes tactical trend" });
    var baseStrength = input.baseStrength;
    var quoteStrength = input.quoteStrength;
    var coreAvailable = baseStrength && quoteStrength && Number.isFinite(baseStrength.zDistance) && Number.isFinite(quoteStrength.zDistance) && selected && Number.isFinite(selected.value) && trend !== null && Number.isFinite(risk.volatility);
    var state = "Unavailable";
    var composite = null;
    var confidence = null;
    var weights = input.policy.lensWeights;
    if (coreAvailable && input.managedReference !== true) {
      var strengthScore = clamp((baseStrength.zDistance - quoteStrength.zDistance) / 2, -1, 1);
      var momentumScore = clamp(Math.log(1 + selected.value) / selectedPolicy.momentumScale, -1, 1);
      var riskScore = risk.state === "Stressed" ? -1 : 0;
      composite = weights.strength * strengthScore + weights.momentum * momentumScore + weights.trend * trend + weights.risk * riskScore;
      state = composite >= input.policy.candidateMinimum && strengthScore > 0 && momentumScore > 0 && trend === 1 && risk.state !== "Stressed" ? "Candidate" : (composite <= input.policy.rejectedMaximum || (strengthScore < 0 && momentumScore < 0 && trend === -1) ? "Rejected" : "Mixed");
      var coverage = Math.min(baseStrength.coverageRatio, quoteStrength.coverageRatio);
      var support = (strengthScore > 0 ? weights.strength : 0) + (momentumScore > 0 ? weights.momentum : 0) + (trend > 0 ? weights.trend : 0) + (risk.state !== "Stressed" ? weights.risk : 0);
      var contradiction = (strengthScore < 0 ? weights.strength : 0) + (momentumScore < 0 ? weights.momentum : 0) + (trend < 0 ? weights.trend : 0) + (risk.state === "Stressed" ? weights.risk : 0);
      confidence = clamp(Math.round(100 * coverage * support - 100 * coverage * contradiction - 5 * conflicts.length), 0, 100);
    }
    if (input.managedReference === true) state = "Unavailable";
    var highCarryWeakness = Number.isFinite(carry.value) && Number.isFinite(selected.value) && ((carry.value > 0 && selected.value < 0) || (carry.value < 0 && selected.value > 0));
    var fundingStrength = input.fundingStrength === true;
    var riskRise = input.riskRise === true;
    var crowded = input.crowded === true;
    var otherConditionCount = [fundingStrength, riskRise, crowded].filter(Boolean).length;
    var unwindState = highCarryWeakness && riskRise && (fundingStrength || crowded) ? "Active" : (highCarryWeakness && otherConditionCount === 1 ? "Watch" : (carry.kind === "unavailable" && (!input.positioning || input.positioning.availability === "unavailable") ? "Indeterminate" : "Dormant"));
    var event = input.event && isPlainObject(input.event) ? cloneCanonical(input.event) : { state: "Unavailable", availability: "unavailable", unavailableReason: "NO_SOURCE", limitations: ["No approved event source"] };
    var positioning = input.positioning && isPlainObject(input.positioning) ? cloneCanonical(input.positioning) : { state: "Unavailable", availability: "unavailable", unavailableReason: "NO_COVERAGE", limitations: ["No mapped positioning source"] };
    return deepFreeze({
      contractVersion: "rlfx-pair-read/v1",
      base: input.base,
      quote: input.quote,
      cohort: input.cohort,
      orientation: { base: input.base, quote: input.quote, positiveMeaning: input.base + " strengthens versus " + input.quote },
      relationshipId: relationshipId(input.base, input.quote),
      construction: "direct",
      state: state,
      composite: composite,
      momentum: momentum,
      trend: trend === 1 ? "Uptrend" : (trend === -1 ? "Downtrend" : (trend === 0 ? "Mixed" : "Unavailable")),
      trendValue: trend,
      risk: risk,
      carry: carry,
      reerValue: input.reerValue ? cloneCanonical(input.reerValue) : { state: "Unavailable", availability: "unavailable", unavailableReason: "NO_SOURCE", limitations: ["No REER source"] },
      positioning: positioning,
      event: event,
      carryUnwind: { state: unwindState, conditions: [{ id: "highCarryWeakness", met: highCarryWeakness }, { id: "fundingStrength", met: fundingStrength }, { id: "riskRise", met: riskRise }, { id: "crowded", met: crowded }] },
      conflicts: conflicts,
      confidencePct: confidence,
      coverage: { commonRowCount: normalized.rows.length, latestCommonDate: normalized.rows.length ? normalized.rows[normalized.rows.length - 1].date : null },
      confirmation: "Independent strength, direct momentum, trend, and risk must remain aligned on current observations.",
      invalidation: "A price trend reversal or realized-risk breach invalidates the pair read.",
      warnings: input.managedReference === true ? ["Managed/reference currencies cannot become automatic candidates."] : [],
      lineage: { relationshipIds: [relationshipId(input.base, input.quote)], sourceObservationIds: ["pair:" + input.base + input.quote] }
    });
  }

  function scoreCountryLeadership(input) {
    requireObject(input, "$countryScore");
    exactKeys(input, ["momentum", "trend", "risk", "weights"], "$countryScore");
    requireFinite(input.momentum, "$countryScore.momentum");
    requireObject(input.weights, "$countryScore.weights");
    exactKeys(input.weights, ["momentum", "trend", "risk"], "$countryScore.weights");
    var available = ["momentum", "trend", "risk"].filter(function (key) { return Number.isFinite(input[key]); });
    var weightTotal = sum(available.map(function (key) { return requireFinite(input.weights[key], "$countryScore.weights." + key); }));
    if (weightTotal <= 0) throw schemaError("RLFX_SCHEMA_INVALID", "$countryScore.weights", "positive available weight is required");
    var normalized = sum(available.map(function (key) { return input.weights[key] * clamp(input[key], -1, 1); })) / weightTotal;
    return deepFreeze({ score: clamp(50 + 50 * normalized, 0, 100), scoreCoverage: weightTotal });
  }

  function computeGlobalRotation(input) {
    requireObject(input, "$global");
    requireIso(input.decisionTime, "$global.decisionTime");
    requirePositiveInteger(input.horizonSessions, "$global.horizonSessions");
    requireEnum(input.posture, ["offense", "balanced", "defense"], "$global.posture");
    requireNonEmptyString(input.benchmark, "RLFX_SCHEMA_INVALID");
    requireArray(input.countries, "$global.countries");
    var rows = input.countries.map(function (country, index) {
      requireObject(country, "$global.countries[" + index + "]");
      var usdSet = alignExact([
        { legId: "etf", observationId: country.ticker, subject: country.ticker, adjustment: "adjusted-close", rows: country.etfRows },
        { legId: "benchmark", observationId: input.benchmark, subject: input.benchmark, adjustment: "adjusted-close", rows: country.benchmarkRows }
      ], input.horizonSessions, "global-usd-leadership");
      var usdLeadership = { contractVersion: "rlfx-global-usd-leadership/v1", state: "unavailable", horizonSessions: input.horizonSessions, observationSet: usdSet, asOf: usdSet.coverage.latestCommonDate ? usdSet.coverage.latestCommonDate + "T00:00:00.000Z" : null, computedAt: input.decisionTime, freshUntil: country.usdFreshUntil || null, unavailableReason: usdSet.unavailableReason || "INSUFFICIENT_HISTORY" };
      if (usdSet.state === "aligned") {
        var usdFirst = usdSet.alignedRows[0].values;
        var usdLast = usdSet.alignedRows[usdSet.alignedRows.length - 1].values;
        usdLeadership = { contractVersion: "rlfx-global-usd-leadership/v1", state: "ready", horizonSessions: input.horizonSessions, observationSet: usdSet, usdEtfReturn: usdLast.etf / usdFirst.etf - 1, benchmarkReturn: usdLast.benchmark / usdFirst.benchmark - 1, usdRelativeReturn: (usdLast.etf / usdFirst.etf - 1) - (usdLast.benchmark / usdFirst.benchmark - 1), asOf: usdSet.coverage.latestCommonDate + "T00:00:00.000Z", computedAt: input.decisionTime, freshUntil: country.usdFreshUntil };
      }
      var decomposition = { contractVersion: "rlfx-global-decomposition/v1", state: "unavailable", currency: country.currency, horizonSessions: input.horizonSessions, observationSet: usdSet, relationship: "Unavailable", unavailableReason: "NO_SOURCE", asOf: null, computedAt: input.decisionTime, freshUntil: null, limitations: ["FX decomposition requires a verified exact-date leg."] };
      if (Array.isArray(country.fxRows) && country.fxRows.length) {
        var oriented = orientSeries(country.fxRows, country.fxSourceOrientation, { base: country.currency, quote: "USD" });
        if (oriented.state === "ready") {
          var decompositionSet = alignExact([
            { legId: "etf", observationId: country.ticker, subject: country.ticker, adjustment: "adjusted-close", rows: country.etfRows },
            { legId: "benchmark", observationId: input.benchmark, subject: input.benchmark, adjustment: "adjusted-close", rows: country.benchmarkRows },
            { legId: "fx", observationId: "fx:" + country.currency, subject: country.currency + "/USD", adjustment: "adjusted-close", rows: oriented.rows }
          ], input.horizonSessions, "global-decomposition");
          decomposition = { contractVersion: "rlfx-global-decomposition/v1", state: "unavailable", currency: country.currency, horizonSessions: input.horizonSessions, observationSet: decompositionSet, relationship: "Unavailable", unavailableReason: decompositionSet.unavailableReason || "INSUFFICIENT_HISTORY", asOf: decompositionSet.coverage.latestCommonDate ? decompositionSet.coverage.latestCommonDate + "T00:00:00.000Z" : null, computedAt: input.decisionTime, freshUntil: country.fxFreshUntil || null, limitations: ["Approximate local return excludes fees, withholding, tracking, and close-timing differences."] };
          if (decompositionSet.state === "aligned") {
            var first = decompositionSet.alignedRows[0].values;
            var last = decompositionSet.alignedRows[decompositionSet.alignedRows.length - 1].values;
            var usdReturn = last.etf / first.etf - 1;
            var benchmarkReturn = last.benchmark / first.benchmark - 1;
            var fxReturn = last.fx / first.fx - 1;
            var localReturn = (1 + usdReturn) / (1 + fxReturn) - 1;
            var translation = usdReturn - localReturn;
            var localRelative = localReturn - benchmarkReturn;
            var deadband = input.agreementDeadbandPct / 100;
            var localDirection = localRelative > deadband ? 1 : (localRelative < -deadband ? -1 : 0);
            var translationDirection = translation > deadband ? 1 : (translation < -deadband ? -1 : 0);
            var relationship = localDirection > 0 && translationDirection > 0 ? "Joint Support" : (localDirection > 0 && translationDirection < 0 ? "Local-Equity-Led With FX Drag" : (localDirection <= 0 && translationDirection > 0 ? "FX-Led Translation" : (localDirection < 0 && translationDirection < 0 ? "Joint Weakness" : "Mixed")));
            decomposition = { contractVersion: "rlfx-global-decomposition/v1", state: "ready", currency: country.currency, horizonSessions: input.horizonSessions, observationSet: decompositionSet, usdReturnOnDecompositionDates: usdReturn, benchmarkReturnOnDecompositionDates: benchmarkReturn, usdRelativeReturnOnDecompositionDates: usdReturn - benchmarkReturn, fxReturn: fxReturn, approximateLocalReturn: localReturn, approximateLocalRelativeReturn: localRelative, translation: translation, interaction: localReturn * fxReturn, relationship: relationship, asOf: decompositionSet.coverage.latestCommonDate + "T00:00:00.000Z", computedAt: input.decisionTime, freshUntil: country.fxFreshUntil, limitations: ["Approximate local return excludes fees, withholding, tracking, and close-timing differences."] };
          }
        }
      }
      var scored = scoreCountryLeadership({ momentum: country.momentum, trend: country.trend, risk: country.risk, weights: input.postureWeights });
      return { ticker: country.ticker, country: country.country, currency: country.currency, score: scored.score, scoreCoverage: scored.scoreCoverage, usdLeadership: usdLeadership, decomposition: decomposition };
    }).sort(function (left, right) { return right.score - left.score || left.ticker.localeCompare(right.ticker); });
    var result = { contractVersion: "rlfx-global-rotation-read/v1", benchmark: input.benchmark, horizonSessions: input.horizonSessions, posture: input.posture, computedAt: input.decisionTime, freshUntil: rows.length && rows[0].usdLeadership.freshUntil ? rows[0].usdLeadership.freshUntil : null, leader: rows.length ? rows[0] : null, ranked: rows.map(function (row) { return { ticker: row.ticker, country: row.country, currency: row.currency, score: row.score, scoreCoverage: row.scoreCoverage }; }), unavailableStates: rows.filter(function (row) { return row.decomposition.state === "unavailable"; }).map(function (row) { return { subject: row.ticker + ":decomposition", reason: row.decomposition.unavailableReason, detail: row.decomposition.limitations[0] }; }), asOf: rows.length ? rows[0].usdLeadership.asOf : null };
    result.resultId = "gr-v1-" + decisionId(result).slice("fxd-v1-".length);
    return deepFreeze(result);
  }

  function emptyEvidence(reason) {
    return { state: "Unavailable", availability: "unavailable", unavailableReason: reason, limitations: ["No eligible observation was supplied."] };
  }

  function emptyDecision(input, computedAt, configVersion) {
    var carry = { contractVersion: "rlfx-carry-read/v1", kind: "unavailable", state: "Unavailable", pair: { base: input.controls.base || "N/A", quote: input.controls.quote || "N/A" }, unavailableReason: "NO_SOURCE", availabilityDetail: "No carry observation supplied", computedAt: computedAt, freshUntil: null, limitations: ["No carry observation supplied"], label: "Unavailable" };
    return {
      contractVersion: "rlfx-decision-read/v1",
      configVersion: configVersion,
      computedAt: computedAt,
      controls: cloneCanonical(input.controls),
      state: "unavailable",
      broadDollar: { selected: input.controls.dollarComparison, state: "Indeterminate", basis: "unavailable", series: {}, concentration: "unavailable", conflicts: [], confirmation: "Approved dollar evidence is required.", invalidation: "No directional dollar conclusion exists." },
      cohorts: {
        "G10": { state: "unavailable", evaluationDate: null, rankWindow: null, eligibleCount: 0, configuredCount: 0, coverageRatio: 0, dispersion: null, ranked: [] },
        "liquid-EM": { state: "unavailable", evaluationDate: null, rankWindow: null, eligibleCount: 0, configuredCount: 0, coverageRatio: 0, dispersion: null, ranked: [] },
        "managed-reference": { state: "reference-only", evaluationDate: null, rankWindow: null, eligibleCount: 0, configuredCount: 0, coverageRatio: 0, dispersion: null, ranked: [] }
      },
      pair: { contractVersion: "rlfx-pair-read/v1", base: input.controls.base, quote: input.controls.quote, state: "Unavailable", unavailableReason: "NO_SOURCE", confidencePct: null, confirmation: "Approved pair evidence is required.", invalidation: "No directional pair conclusion exists." },
      hedgeResearch: { state: "Indeterminate", requiredEvidence: [], rationale: "Required market evidence is unavailable.", confirmation: "Approved broad-dollar, currency, translation, and risk evidence is required.", invalidation: "No directional hedge-research conclusion exists." },
      evidence: { spot: emptyEvidence("RIGHTS_UNCLEAR"), independentStrength: emptyEvidence("NO_COVERAGE"), carry: carry, reerValue: emptyEvidence("NO_SOURCE"), delayedPositioning: emptyEvidence("NO_COVERAGE"), realizedRisk: emptyEvidence("NO_SOURCE"), events: emptyEvidence("NO_SOURCE") },
      carryUnwind: { state: "Indeterminate", conditions: [] },
      conflicts: [],
      coverage: { required: 7, available: 0, ratio: 0, stale: 0, unavailable: 7 },
      confidencePct: null,
      confirmation: "Approved minimum evidence must become available.",
      invalidation: "No directional conclusion exists while minimum evidence is unavailable.",
      asOf: null,
      freshUntil: null,
      limitations: ["No eligible observations were supplied."]
    };
  }

  function computeCurrencyDecision(input) {
    if (!isPlainObject(input)) throw new Error("RLFX_SCHEMA_INVALID");
    var computedAt = requireIsoInstant(input.decisionTime);
    var configVersion = requireNonEmptyString(input.configVersion, "RLFX_SCHEMA_INVALID");
    if (!isPlainObject(input.controls)) throw new Error("RLFX_SCHEMA_INVALID");
    if (!Array.isArray(input.sourceEnvelopes) || !Array.isArray(input.observations)) {
      throw new Error("RLFX_SCHEMA_INVALID");
    }
    var identityInput = cloneCanonical(input);
    var decision = emptyDecision(input, computedAt, configVersion);
    if (input.broadDollarInput && input.cohortInputs && input.pairInput) {
      decision.broadDollar = cloneCanonical(computeBroadDollar(input.broadDollarInput));
      decision.cohorts = {
        "G10": cloneCanonical(computeCurrencyStrength(input.cohortInputs["G10"])),
        "liquid-EM": cloneCanonical(computeCurrencyStrength(input.cohortInputs["liquid-EM"])),
        "managed-reference": cloneCanonical(computeCurrencyStrength(input.cohortInputs["managed-reference"]))
      };
      var selectedCohort = decision.cohorts[input.controls.cohort];
      var pairInput = cloneCanonical(input.pairInput);
      if (!pairInput.baseStrength && selectedCohort && Array.isArray(selectedCohort.ranked)) pairInput.baseStrength = selectedCohort.ranked.find(function (entry) { return entry.currency === pairInput.base; }) || null;
      if (!pairInput.quoteStrength && selectedCohort && Array.isArray(selectedCohort.ranked)) pairInput.quoteStrength = selectedCohort.ranked.find(function (entry) { return entry.currency === pairInput.quote; }) || null;
      decision.pair = cloneCanonical(computePairRead(pairInput));
      decision.evidence = { spot: { state: decision.pair.state === "Unavailable" ? "Unavailable" : "Available" }, independentStrength: { state: selectedCohort.state }, carry: decision.pair.carry, reerValue: decision.pair.reerValue, delayedPositioning: decision.pair.positioning, realizedRisk: decision.pair.risk, events: decision.pair.event };
      decision.carryUnwind = decision.pair.carryUnwind;
      decision.conflicts = decision.broadDollar.conflicts.concat(decision.pair.conflicts);
      decision.coverage = { required: 7, available: [decision.broadDollar.state !== "Indeterminate", selectedCohort.state === "ranked", decision.pair.state !== "Unavailable", decision.pair.carry.kind !== "unavailable", decision.pair.reerValue.availability !== "unavailable", decision.pair.positioning.availability !== "unavailable", decision.pair.event.availability !== "unavailable"].filter(Boolean).length, ratio: 0, stale: 0, unavailable: 0 };
      decision.coverage.ratio = decision.coverage.available / decision.coverage.required;
      decision.coverage.unavailable = decision.coverage.required - decision.coverage.available;
      decision.confidencePct = decision.pair.confidencePct;
      decision.state = decision.pair.state === "Unavailable" || decision.broadDollar.state === "Indeterminate" ? "partial" : "ready";
      decision.confirmation = decision.pair.confirmation;
      decision.invalidation = decision.pair.invalidation;
      decision.limitations = ["Evidence families retain independent clocks, rights, and lineage."];
    }
    decision.decisionId = decisionId({ input: identityInput, output: decision });
    return deepFreeze(decision);
  }

  function projectFxToolRead(decision) {
    requireObject(decision, "$decision");
    if (decision.contractVersion !== "rlfx-decision-read/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$decision.contractVersion", "unknown decision contract");
    var cohort = decision.cohorts && decision.cohorts[decision.controls.cohort];
    var ranked = cohort && Array.isArray(cohort.ranked) ? cohort.ranked.filter(function (entry) { return Number.isFinite(entry.zDistance); }) : [];
    var strongest = ranked.slice().sort(function (left, right) { return right.zDistance - left.zDistance; })[0] || null;
    var weakest = ranked.slice().sort(function (left, right) { return left.zDistance - right.zDistance; })[0] || null;
    var currencyStates = {};
    ranked.forEach(function (entry) { currencyStates[entry.currency] = { cohort: entry.cohort, state: entry.state, zDistance: entry.zDistance, coverageRatio: entry.coverageRatio }; });
    return deepFreeze({
      contractVersion: "rl-tool-read/v1",
      id: "fx-regime-relative-value-lab",
      availability: decision.state === "ready" ? "current" : "unavailable",
      asOf: decision.state === "ready" ? decision.asOf : null,
      read: decision.state === "ready" ? decision.broadDollar.state + "; " + decision.pair.state : "FX evidence unavailable under the active source contract",
      metrics: {
        contractVersion: "rlfx-tool-read/v1",
        decisionId: decision.decisionId,
        state: decision.state,
        broadDollarState: decision.broadDollar.state,
        broadDollarBasis: decision.broadDollar.basis,
        cohort: decision.controls.cohort,
        strongest: strongest ? { currency: strongest.currency, state: strongest.state, coverageRatio: strongest.coverageRatio } : null,
        weakest: weakest ? { currency: weakest.currency, state: weakest.state, coverageRatio: weakest.coverageRatio } : null,
        currencyStates: currencyStates,
        selectedPair: { base: decision.pair.base || null, quote: decision.pair.quote || null, state: decision.pair.state, momentumState: decision.pair.momentum && decision.pair.momentum[decision.controls.horizon] ? decision.pair.momentum[decision.controls.horizon].state : "Unavailable", strengthState: cohort ? cohort.state : "unavailable", riskState: decision.pair.risk ? decision.pair.risk.state : "Unavailable" },
        hedgeResearchState: decision.hedgeResearch.state,
        carryUnwindState: decision.carryUnwind.state,
        coverage: cloneCanonical(decision.coverage),
        conflicts: (decision.conflicts || []).map(function (conflict) { return { code: conflict.code, families: conflict.families.slice() }; }),
        confirmation: decision.confirmation,
        invalidation: decision.invalidation,
        freshUntil: decision.freshUntil,
        educationalOnly: true
      },
      deepLink: "fx-regime-relative-value-lab.html#simple",
      computedAt: decision.computedAt,
      freshUntil: decision.state === "ready" ? decision.freshUntil : null
    });
  }

  function projectGlobalToolRead(result) {
    requireObject(result, "$globalResult");
    if (result.contractVersion !== "rlfx-global-rotation-read/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$globalResult.contractVersion", "unknown Global Rotation contract");
    return deepFreeze({
      contractVersion: "rl-tool-read/v1",
      id: "global-rotation-lab",
      availability: result.leader && result.leader.usdLeadership.state === "ready" ? "current" : "unavailable",
      asOf: result.asOf,
      read: result.leader ? result.leader.country + " leads the equity-only research queue" : "Global Rotation unavailable",
      metrics: { contractVersion: "rlfx-global-tool-read/v1", benchmark: result.benchmark, horizonSessions: result.horizonSessions, leader: result.leader ? { ticker: result.leader.ticker, country: result.leader.country, currency: result.leader.currency, score: result.leader.score, usdLeadership: cloneCanonical(result.leader.usdLeadership), decomposition: cloneCanonical(result.leader.decomposition) } : null, unavailableStates: cloneCanonical(result.unavailableStates), educationalOnly: true },
      deepLink: "global-rotation-lab.html#simple",
      computedAt: result.computedAt,
      freshUntil: result.freshUntil
    });
  }

  return {
    validateUniverse: validateUniverse,
    normalizeSourceEnvelope: normalizeSourceEnvelope,
    normalizeObservation: normalizeObservation,
    normalizeCarryRead: normalizeCarryRead,
    normalizeDailySeries: normalizeDailySeries,
    orientSeries: orientSeries,
    alignExact: alignExact,
    computeCurrencyStrength: computeCurrencyStrength,
    computePairRead: computePairRead,
    computeBroadDollar: computeBroadDollar,
    canonicalize: canonicalize,
    decisionId: decisionId,
    computeCurrencyDecision: computeCurrencyDecision,
    computeGlobalRotation: computeGlobalRotation,
    scoreCountryLeadership: scoreCountryLeadership,
    projectFxToolRead: projectFxToolRead,
    projectGlobalToolRead: projectGlobalToolRead
  };
});