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
  var VEHICLE_STATIC_FACT_KINDS = [
    "issuer", "exchange", "active-status", "objective", "direction",
    "currency-or-basket", "benchmark", "exposure-mechanism", "legal-structure",
    "leverage", "reset-policy", "expense", "tax-form-class",
    "collateral-policy", "rebalance-policy", "distribution-policy"
  ];
  var VEHICLE_REQUIRED_FACT_REFS = {
    issuer: "issuer",
    exchange: "exchange",
    activeStatus: "active-status",
    objective: "objective",
    direction: "direction",
    currencyOrBasket: "currency-or-basket",
    benchmark: "benchmark",
    exposureMechanism: "exposure-mechanism",
    legalStructure: "legal-structure",
    leverage: "leverage",
    resetPolicy: "reset-policy",
    expense: "expense",
    taxFormClass: "tax-form-class"
  };
  var VEHICLE_OPTIONAL_FACT_REFS = {
    collateralPolicy: "collateral-policy",
    rebalancePolicy: "rebalance-policy",
    distributionPolicy: "distribution-policy"
  };
  var VEHICLE_REQUIRED_STATIC_FACT_KINDS = Object.keys(VEHICLE_REQUIRED_FACT_REFS).map(function (key) {
    return VEHICLE_REQUIRED_FACT_REFS[key];
  });
  var VEHICLE_DYNAMIC_FACT_KINDS = [
    "market-price", "nav", "premium-discount", "aum", "spread", "volume",
    "holdings", "distribution", "collateral", "closure-notice",
    "underlying-level", "reset-session"
  ];
  var VEHICLE_FACT_KINDS = VEHICLE_STATIC_FACT_KINDS.concat(VEHICLE_DYNAMIC_FACT_KINDS);
  var VEHICLE_REASON_CODES = UNAVAILABLE_REASONS.concat([
    "ACTIVE_STATUS_UNKNOWN", "VEHICLE_CLOSED", "REQUIRED_FACT_MISSING",
    "REQUIRED_FACT_STALE", "DIRECTION_MISMATCH", "CURRENCY_MISMATCH",
    "BASKET_MISMATCH", "HORIZON_INCOMPATIBLE", "STRUCTURE_INCOMPATIBLE",
    "DAILY_RESET_NOT_PERMITTED", "RESET_SESSION_UNAVAILABLE",
    "LIQUIDITY_POLICY_FAILED", "COST_POLICY_FAILED", "RETURN_BASIS_MISMATCH",
    "TRACKING_EVIDENCE_INCOMPLETE", "FIT_TIE", "NO_ELIGIBLE_VEHICLE"
  ]);
  var VEHICLE_SOURCE_CLASSES = ["issuer", "exchange", "regulator", "approved-public-market"];
  var VEHICLE_SOURCE_CADENCES = ["exchange-session", "daily", "monthly", "quarterly-review", "event-driven"];
  var VEHICLE_QUALITIES = ["issuer-declared", "exchange-observed", "regulator-declared", "approved-public-derived"];
  var VEHICLE_ACTIVE_STATES = ["active", "pending-closure", "closed", "merged"];
  var VEHICLE_TRACKING_CONTEXT_FACT_KINDS = ["expense", "distribution", "collateral", "premium-discount", "rebalance-policy"];
  var VEHICLE_FIT_CRITERIA = [
    "active-status", "objective-direction", "currency-basket", "horizon", "structure",
    "leverage-reset", "liquidity", "cost", "fact-coverage", "tracking"
  ];
  var VEHICLE_FIT_STATE_TIERS = ["Eligible", "Caution", "Tactical-Only"];
  var VEHICLE_TRACKING_TIERS = ["Tracking", "Indeterminate", "Diverging"];
  var VEHICLE_TRACKING_STATES = ["Tracking", "Diverging", "Indeterminate", "Unavailable"];
  var VEHICLE_OBJECTIVE_KINDS = [
    "foreign-currency-strength", "dollar-strength", "dollar-weakness",
    "diversified-em-currency", "compare-wrappers"
  ];
  var VEHICLE_HORIZONS = ["tactical", "swing", "structural"];
  var VEHICLE_CLASSES = [
    "unlevered-single-currency", "broad-dollar-basket",
    "diversified-currency-basket", "tactical-daily-reset"
  ];
  var VEHICLE_RESET_PERMISSIONS = ["exclude", "permit-tactical"];
  var RECOMMENDATION_RELATIONS = [
    "closes-above", "closes-below", "trades-at-or-above",
    "trades-at-or-below", "enters-band", "exits-band"
  ];
  var RECOMMENDATION_PROVENANCE_CLASSES = ["observed-fact", "user-assumption", "model-estimate"];
  var RECOMMENDATION_OWNER_DEEP_LINK = "fx-regime-relative-value-lab.html#power";

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

  function exactRequiredKeys(value, required, path) {
    exactKeys(value, required, path);
    required.forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        throw schemaError("RLFX_SCHEMA_INVALID", path + "." + key, "required key is missing");
      }
    });
  }

  function normalizeRecommendationInstrument(value, path) {
    requireObject(value, path);
    exactRequiredKeys(value, ["vehicleId", "ticker", "marketSeriesId"], path);
    requireNonEmptyString(value.vehicleId, "RLFX_SCHEMA_INVALID");
    requireNonEmptyString(value.ticker, "RLFX_SCHEMA_INVALID");
    requireNonEmptyString(value.marketSeriesId, "RLFX_SCHEMA_INVALID");
    return cloneCanonical(value);
  }

  function normalizeEconomicDirection(value, path) {
    requireObject(value, path);
    exactRequiredKeys(value, ["instrumentSide", "exposure"], path);
    requireEnum(value.instrumentSide, ["long", "short"], path + ".instrumentSide");
    requireNonEmptyString(value.exposure, "RLFX_SCHEMA_INVALID");
    return cloneCanonical(value);
  }

  function normalizeRecommendationProvenance(value, path, ownerEvidenceRefs, allowEmpty) {
    requireArray(value, path);
    if (!allowEmpty && value.length === 0) throw schemaError("RLFX_SCHEMA_INVALID", path, "at least one provenance record is required");
    return value.map(function (entry, index) {
      var entryPath = path + "[" + index + "]";
      requireObject(entry, entryPath);
      exactRequiredKeys(entry, ["class", "evidenceRef"], entryPath);
      requireEnum(entry.class, RECOMMENDATION_PROVENANCE_CLASSES, entryPath + ".class");
      requireNonEmptyString(entry.evidenceRef, "RLFX_SCHEMA_INVALID");
      if (ownerEvidenceRefs !== null && !contains(ownerEvidenceRefs, entry.evidenceRef)) {
        throw schemaError("RLFX_SCHEMA_INVALID", entryPath + ".evidenceRef", "provenance evidence is outside the owner evidence identity");
      }
      return cloneCanonical(entry);
    });
  }

  function normalizeAttributableLevelGateShape(value, path) {
    requireObject(value, path);
    exactRequiredKeys(value, ["gateId", "instrument", "relation", "level", "unit", "observationBasis", "evidenceRefs"], path);
    requireNonEmptyString(value.gateId, "RLFX_SCHEMA_INVALID");
    var instrument = normalizeRecommendationInstrument(value.instrument, path + ".instrument");
    requireEnum(value.relation, RECOMMENDATION_RELATIONS, path + ".relation");
    requireFinite(value.level, path + ".level");
    if (value.unit !== "instrument-price") throw schemaError("RLFX_SCHEMA_INVALID", path + ".unit", "instrument-price is required");
    requireObject(value.observationBasis, path + ".observationBasis");
    exactRequiredKeys(value.observationBasis, ["observationId", "field", "adjustment", "observedAsOf"], path + ".observationBasis");
    requireNonEmptyString(value.observationBasis.observationId, "RLFX_SCHEMA_INVALID");
    requireEnum(value.observationBasis.field, ["close", "adjusted-close"], path + ".observationBasis.field");
    requireEnum(value.observationBasis.adjustment, ["raw-close", "adjusted-close"], path + ".observationBasis.adjustment");
    requireIso(value.observationBasis.observedAsOf, path + ".observationBasis.observedAsOf");
    requireUniqueStringArray(value.evidenceRefs, path + ".evidenceRefs", false);
    return {
      gateId: value.gateId,
      instrument: instrument,
      relation: value.relation,
      level: value.level,
      unit: value.unit,
      observationBasis: cloneCanonical(value.observationBasis),
      evidenceRefs: value.evidenceRefs.slice()
    };
  }

  function normalizeAttributableLevelGate(value, context) {
    requireObject(context, "$attributableLevelGateContext");
    exactRequiredKeys(context, ["selectedInstrument", "marketObservation", "ownerEvidenceRefs", "decisionTime"], "$attributableLevelGateContext");
    var selectedInstrument = normalizeRecommendationInstrument(context.selectedInstrument, "$attributableLevelGateContext.selectedInstrument");
    requireArray(context.ownerEvidenceRefs, "$attributableLevelGateContext.ownerEvidenceRefs");
    requireUniqueStringArray(context.ownerEvidenceRefs, "$attributableLevelGateContext.ownerEvidenceRefs", false);
    requireIso(context.decisionTime, "$attributableLevelGateContext.decisionTime");
    requireObject(context.marketObservation, "$attributableLevelGateContext.marketObservation");
    requireDeepFrozen(context.marketObservation, "$attributableLevelGateContext.marketObservation");
    validateVehicleObservationShape(context.marketObservation, "$attributableLevelGateContext.marketObservation", true);

    var normalized = normalizeAttributableLevelGateShape(value, "$attributableLevelGate");
    if (canonicalize(normalized.instrument) !== canonicalize(selectedInstrument)) {
      throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGate.instrument", "gate instrument must equal the selected recommendation instrument");
    }
    var observation = context.marketObservation;
    if (observation.kind !== "series" || observation.factKind !== "market-price" || observation.series.returnBasis !== "market-price") {
      throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGateContext.marketObservation", "a typed market-price series is required");
    }
    if (observation.vehicleId !== selectedInstrument.vehicleId || observation.ticker !== selectedInstrument.ticker || observation.series.seriesId !== selectedInstrument.marketSeriesId) {
      throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGateContext.marketObservation", "market evidence must name the selected recommendation instrument");
    }
    if (!contains(ALLOWED_RIGHTS, observation.rights)) {
      throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGateContext.marketObservation.rights", "market evidence is not rights-eligible");
    }
    if (!contains(["fresh", "revised"], observation.availability) || observation.freshUntil === null || Date.parse(context.decisionTime) > Date.parse(observation.freshUntil)) {
      throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGateContext.marketObservation.availability", "market evidence is not current");
    }
    if (!contains(context.ownerEvidenceRefs, observation.observationId)) {
      throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGateContext.ownerEvidenceRefs", "market evidence is outside the owner evidence identity");
    }
    if (normalized.observationBasis.observationId !== observation.observationId || normalized.observationBasis.observedAsOf !== observation.observedAsOf) {
      throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGate.observationBasis", "gate observation basis must equal the current market observation");
    }
    if (normalized.observationBasis.adjustment !== observation.series.adjustment) {
      throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGate.observationBasis.adjustment", "gate adjustment must equal the market series adjustment");
    }
    var expectedField = observation.series.adjustment === "adjusted-close" ? "adjusted-close" : "close";
    if (normalized.observationBasis.field !== expectedField) {
      throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGate.observationBasis.field", "gate field must equal the market series close basis");
    }
    normalized.evidenceRefs.forEach(function (evidenceRef, index) {
      if (!contains(context.ownerEvidenceRefs, evidenceRef)) {
        throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGate.evidenceRefs[" + index + "]", "gate evidence is outside the owner evidence identity");
      }
    });
    if (!contains(normalized.evidenceRefs, observation.observationId)) {
      throw schemaError("RLFX_SCHEMA_INVALID", "$attributableLevelGate.evidenceRefs", "gate evidence must include its market observation");
    }
    return deepFreeze(normalized);
  }

  function recommendationGateSemantics(gate) {
    return {
      instrument: gate.instrument,
      relation: gate.relation,
      level: gate.level,
      unit: gate.unit,
      observationBasis: gate.observationBasis
    };
  }

  function normalizeRecommendationOutcome(value) {
    requireObject(value, "$recommendationOutcome");
    if (value.outcome === "recommendation") {
      exactRequiredKeys(value, [
        "contractVersion", "outcome", "instrument", "objective", "economicDirection",
        "horizon", "trigger", "invalidation", "evidenceIdentity", "evidenceCutoff",
        "provenance", "ownerDeepLink", "evaluability", "confidencePct",
        "educationalOnly", "executionAvailable"
      ], "$recommendationOutcome");
    } else {
      exactRequiredKeys(value, [
        "contractVersion", "outcome", "objective", "economicDirection", "horizon",
        "reasonCodes", "evidenceIdentity", "evidenceCutoff", "provenance",
        "ownerDeepLink", "evaluability", "confidencePct", "educationalOnly",
        "executionAvailable"
      ], "$recommendationOutcome");
    }
    if (value.contractVersion !== "rlfx-recommendation-outcome/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$recommendationOutcome.contractVersion", "unknown recommendation-outcome contract");
    requireEnum(value.outcome, ["recommendation", "no-vehicle", "unavailable"], "$recommendationOutcome.outcome");
    requireEnum(value.objective, VEHICLE_OBJECTIVE_KINDS, "$recommendationOutcome.objective");
    requireEnum(value.horizon, VEHICLE_HORIZONS, "$recommendationOutcome.horizon");
    requireNonEmptyString(value.evidenceIdentity, "RLFX_SCHEMA_INVALID");
    if (value.evidenceCutoff !== null) requireIso(value.evidenceCutoff, "$recommendationOutcome.evidenceCutoff");
    if (value.ownerDeepLink !== RECOMMENDATION_OWNER_DEEP_LINK) throw schemaError("RLFX_SCHEMA_INVALID", "$recommendationOutcome.ownerDeepLink", "the owning Power deep link is required");
    if (value.educationalOnly !== true || value.executionAvailable !== false) throw schemaError("RLFX_SCHEMA_INVALID", "$recommendationOutcome", "educational and no-execution truth is required");
    if (value.confidencePct !== null) {
      requireFinite(value.confidencePct, "$recommendationOutcome.confidencePct");
      if (value.confidencePct < 0 || value.confidencePct > 100) throw schemaError("RLFX_SCHEMA_INVALID", "$recommendationOutcome.confidencePct", "confidence must describe evidence quality from zero to one hundred");
    }

    var normalized;
    if (value.outcome === "recommendation") {
      if (value.evaluability !== "machine-checkable") throw schemaError("RLFX_SCHEMA_INVALID", "$recommendationOutcome.evaluability", "recommendation must be machine-checkable");
      if (value.evidenceCutoff === null) throw schemaError("RLFX_SCHEMA_INVALID", "$recommendationOutcome.evidenceCutoff", "recommendation evidence cutoff is required");
      var instrument = normalizeRecommendationInstrument(value.instrument, "$recommendationOutcome.instrument");
      var trigger = normalizeAttributableLevelGateShape(value.trigger, "$recommendationOutcome.trigger");
      var invalidation = normalizeAttributableLevelGateShape(value.invalidation, "$recommendationOutcome.invalidation");
      if (canonicalize(trigger.instrument) !== canonicalize(instrument) || canonicalize(invalidation.instrument) !== canonicalize(instrument)) {
        throw schemaError("RLFX_SCHEMA_INVALID", "$recommendationOutcome.instrument", "both gates must equal the recommendation instrument");
      }
      var provenance = normalizeRecommendationProvenance(value.provenance, "$recommendationOutcome.provenance", null, false);
      var provenanceRefs = provenance.map(function (entry) { return entry.evidenceRef; });
      trigger.evidenceRefs.concat(invalidation.evidenceRefs).forEach(function (evidenceRef, index) {
        if (!contains(provenanceRefs, evidenceRef)) {
          throw schemaError("RLFX_SCHEMA_INVALID", "$recommendationOutcome.provenance[" + index + "]", "gate evidence must belong to the recommendation provenance");
        }
      });
      if (canonicalize(recommendationGateSemantics(trigger)) === canonicalize(recommendationGateSemantics(invalidation))) {
        throw schemaError("RLFX_SCHEMA_INVALID", "$recommendationOutcome.invalidation", "trigger and invalidation cannot be semantically identical");
      }
      normalized = {
        contractVersion: value.contractVersion,
        outcome: value.outcome,
        instrument: instrument,
        objective: value.objective,
        economicDirection: normalizeEconomicDirection(value.economicDirection, "$recommendationOutcome.economicDirection"),
        horizon: value.horizon,
        trigger: trigger,
        invalidation: invalidation,
        evidenceIdentity: value.evidenceIdentity,
        evidenceCutoff: value.evidenceCutoff,
        provenance: provenance,
        ownerDeepLink: value.ownerDeepLink,
        evaluability: value.evaluability,
        confidencePct: value.confidencePct,
        educationalOnly: true,
        executionAvailable: false
      };
    } else {
      if (value.evaluability !== "non-recommendation") throw schemaError("RLFX_SCHEMA_INVALID", "$recommendationOutcome.evaluability", "non-recommendation evaluability is required");
      requireUniqueStringArray(value.reasonCodes, "$recommendationOutcome.reasonCodes", false);
      normalized = {
        contractVersion: value.contractVersion,
        outcome: value.outcome,
        objective: value.objective,
        economicDirection: value.economicDirection === null ? null : normalizeEconomicDirection(value.economicDirection, "$recommendationOutcome.economicDirection"),
        horizon: value.horizon,
        reasonCodes: value.reasonCodes.slice(),
        evidenceIdentity: value.evidenceIdentity,
        evidenceCutoff: value.evidenceCutoff,
        provenance: normalizeRecommendationProvenance(value.provenance, "$recommendationOutcome.provenance", null, true),
        ownerDeepLink: value.ownerDeepLink,
        evaluability: value.evaluability,
        confidencePct: value.confidencePct,
        educationalOnly: true,
        executionAvailable: false
      };
    }
    return deepFreeze(normalized);
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

  function requireUniqueStringArray(value, path, allowEmpty) {
    requireStringArray(value, path, allowEmpty);
    var seen = {};
    value.forEach(function (entry, index) {
      if (seen[entry]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + "[" + index + "]", "duplicate value");
      seen[entry] = true;
    });
    return value;
  }

  function requireNullableString(value, path) {
    if (value !== null) requireNonEmptyString(value, "RLFX_VEHICLE_UNIVERSE_INVALID");
    return value;
  }

  function requireNullableIso(value, path) {
    if (value !== null) requireIso(value, path);
    return value;
  }

  function requireNullableEnum(value, values, path) {
    if (value !== null) requireEnum(value, values, path);
    return value;
  }

  function vehicleUniverseFailure(error) {
    return deepFreeze({
      ok: false,
      errors: [{
        code: error && error.code === "RLFX_CONTRACT_VERSION" ? "RLFX_CONTRACT_VERSION" : "RLFX_VEHICLE_UNIVERSE_INVALID",
        path: error && error.path ? error.path : "$",
        message: error && error.message ? error.message : "vehicle universe validation failed"
      }]
    });
  }

  function validateVehicleSourcePolicy(policy, path) {
    requireObject(policy, path);
    exactKeys(policy, ["contractVersion", "policyId", "sourceId", "sourceClass", "sourceUrl", "activation", "sourceUsePolicyId", "sourceUseReviewRef", "rights", "retention", "allowedFactKinds", "forbiddenPayloadKinds", "subjectTickers", "expectedCadence", "reviewWindow", "limitations"], path);
    if (policy.contractVersion !== "rlfx-vehicle-source-policy/v1") throw schemaError("RLFX_CONTRACT_VERSION", path + ".contractVersion", "unknown vehicle source-policy contract");
    requireNonEmptyString(policy.policyId, "RLFX_VEHICLE_UNIVERSE_INVALID");
    requireNonEmptyString(policy.sourceId, "RLFX_VEHICLE_UNIVERSE_INVALID");
    requireEnum(policy.sourceClass, VEHICLE_SOURCE_CLASSES, path + ".sourceClass");
    requireHttpUrl(policy.sourceUrl, path + ".sourceUrl");
    requireEnum(policy.activation, ["approved", "unreviewed", "denied"], path + ".activation");
    requireNullableString(policy.sourceUsePolicyId, path + ".sourceUsePolicyId");
    requireNullableString(policy.sourceUseReviewRef, path + ".sourceUseReviewRef");
    requireEnum(policy.rights, ["redistributable", "reference-only", "restricted", "unknown"], path + ".rights");
    requireEnum(policy.retention, ["normalized-facts-and-hash", "memory-only", "forbidden"], path + ".retention");
    requireUniqueStringArray(policy.allowedFactKinds, path + ".allowedFactKinds", false);
    policy.allowedFactKinds.forEach(function (factKind, index) {
      requireEnum(factKind, VEHICLE_FACT_KINDS, path + ".allowedFactKinds[" + index + "]");
    });
    requireUniqueStringArray(policy.forbiddenPayloadKinds, path + ".forbiddenPayloadKinds", true);
    requireUniqueStringArray(policy.subjectTickers, path + ".subjectTickers", false);
    requireEnum(policy.expectedCadence, VEHICLE_SOURCE_CADENCES, path + ".expectedCadence");
    if (contains(policy.allowedFactKinds, "active-status") && policy.expectedCadence !== "event-driven") {
      throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".expectedCadence", "active-status source policy must be event-driven");
    }
    validateReviewWindow(policy.reviewWindow, path + ".reviewWindow");
    requireStringArray(policy.limitations, path + ".limitations", false);
    if (policy.activation === "approved") {
      requireNonEmptyString(policy.sourceUsePolicyId, "RLFX_VEHICLE_UNIVERSE_INVALID");
      requireNonEmptyString(policy.sourceUseReviewRef, "RLFX_VEHICLE_UNIVERSE_INVALID");
      if (!contains(ALLOWED_RIGHTS, policy.rights) || policy.retention === "forbidden") {
        throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path, "approved vehicle source policy must permit its declared use");
      }
    } else if (policy.sourceUsePolicyId !== null || policy.sourceUseReviewRef !== null) {
      throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path, "inactive vehicle source policy cannot carry authorization claims");
    }
  }

  function validateCurrencyVehicle(vehicle, path) {
    requireObject(vehicle, path);
    exactKeys(vehicle, ["contractVersion", "vehicleId", "ticker", "assetBoundary", "factRefs", "optionalFactRefs"], path);
    if (vehicle.contractVersion !== "rlfx-currency-vehicle/v1") throw schemaError("RLFX_CONTRACT_VERSION", path + ".contractVersion", "unknown currency-vehicle contract");
    requireNonEmptyString(vehicle.vehicleId, "RLFX_VEHICLE_UNIVERSE_INVALID");
    requireNonEmptyString(vehicle.ticker, "RLFX_VEHICLE_UNIVERSE_INVALID");
    if (!/^[A-Z][A-Z0-9.]{0,9}$/.test(vehicle.ticker)) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".ticker", "canonical exchange ticker is required");
    if (vehicle.assetBoundary !== "fiat-currency-exchange-traded-vehicle") throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".assetBoundary", "vehicle is outside the fiat-currency boundary");
    requireObject(vehicle.factRefs, path + ".factRefs");
    exactKeys(vehicle.factRefs, Object.keys(VEHICLE_REQUIRED_FACT_REFS), path + ".factRefs");
    Object.keys(VEHICLE_REQUIRED_FACT_REFS).forEach(function (field) {
      requireNonEmptyString(vehicle.factRefs[field], "RLFX_VEHICLE_UNIVERSE_INVALID");
    });
    requireObject(vehicle.optionalFactRefs, path + ".optionalFactRefs");
    exactKeys(vehicle.optionalFactRefs, Object.keys(VEHICLE_OPTIONAL_FACT_REFS), path + ".optionalFactRefs");
    Object.keys(VEHICLE_OPTIONAL_FACT_REFS).forEach(function (field) {
      requireNullableString(vehicle.optionalFactRefs[field], path + ".optionalFactRefs." + field);
    });
  }

  function requireExactOrderedArray(value, expected, path) {
    requireUniqueStringArray(value, path, false);
    if (canonicalize(value) !== canonicalize(expected)) {
      throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path, "ordered policy vocabulary is incomplete or reordered");
    }
  }

  function validateVehicleTrackingPolicy(policy, path) {
    requireObject(policy, path);
    exactKeys(policy, ["contractVersion", "policyId", "requiredLegFactKinds", "minimumCommonDateCount", "maximumAbsoluteUnexplainedResidual"], path);
    if (policy.contractVersion !== "rlfx-vehicle-tracking-policy/v1") throw schemaError("RLFX_CONTRACT_VERSION", path + ".contractVersion", "unknown vehicle tracking-policy contract");
    requireNonEmptyString(policy.policyId, "RLFX_VEHICLE_UNIVERSE_INVALID");
    requireExactOrderedArray(policy.requiredLegFactKinds, ["market-price", "nav", "underlying-level"], path + ".requiredLegFactKinds");
    requirePositiveInteger(policy.minimumCommonDateCount, path + ".minimumCommonDateCount");
    requireFinite(policy.maximumAbsoluteUnexplainedResidual, path + ".maximumAbsoluteUnexplainedResidual");
    if (policy.maximumAbsoluteUnexplainedResidual <= 0) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".maximumAbsoluteUnexplainedResidual", "positive tracking residual threshold is required");
  }

  function validateVehicleClassRule(rule, path) {
    requireObject(rule, path);
    exactKeys(rule, ["vehicleClass", "allowedLegalStructures", "allowedExposureMechanisms", "allowedLeverageValues", "allowedResetPolicyValues"], path);
    requireEnum(rule.vehicleClass, VEHICLE_CLASSES, path + ".vehicleClass");
    requireUniqueStringArray(rule.allowedLegalStructures, path + ".allowedLegalStructures", false);
    requireUniqueStringArray(rule.allowedExposureMechanisms, path + ".allowedExposureMechanisms", false);
    requireUniqueStringArray(rule.allowedLeverageValues, path + ".allowedLeverageValues", false);
    requireUniqueStringArray(rule.allowedResetPolicyValues, path + ".allowedResetPolicyValues", false);
  }

  function validateVehicleFitPolicy(policy, path) {
    requireObject(policy, path);
    exactKeys(policy, [
      "contractVersion", "policyId", "criterionOrder", "stateTierOrder", "trackingTierOrder",
      "requiredStaticFactKinds", "activeStatusMaximumAgeMs", "cautionTrackingStates",
      "dailyResetVehicleIds", "semanticTieDisposition", "evaluationOrder", "vehicleClassRules"
    ], path);
    if (policy.contractVersion !== "rlfx-vehicle-fit-policy/v1") throw schemaError("RLFX_CONTRACT_VERSION", path + ".contractVersion", "unknown vehicle fit-policy contract");
    requireNonEmptyString(policy.policyId, "RLFX_VEHICLE_UNIVERSE_INVALID");
    requireExactOrderedArray(policy.criterionOrder, VEHICLE_FIT_CRITERIA, path + ".criterionOrder");
    requireExactOrderedArray(policy.stateTierOrder, VEHICLE_FIT_STATE_TIERS, path + ".stateTierOrder");
    requireExactOrderedArray(policy.trackingTierOrder, VEHICLE_TRACKING_TIERS, path + ".trackingTierOrder");
    requireExactOrderedArray(policy.requiredStaticFactKinds, VEHICLE_REQUIRED_STATIC_FACT_KINDS, path + ".requiredStaticFactKinds");
    requireFinite(policy.activeStatusMaximumAgeMs, path + ".activeStatusMaximumAgeMs");
    if (policy.activeStatusMaximumAgeMs <= 0) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".activeStatusMaximumAgeMs", "positive active-status age is required");
    requireExactOrderedArray(policy.cautionTrackingStates, ["Indeterminate", "Diverging"], path + ".cautionTrackingStates");
    requireUniqueStringArray(policy.dailyResetVehicleIds, path + ".dailyResetVehicleIds", false);
    if (policy.semanticTieDisposition !== "Unavailable/FIT_TIE") throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".semanticTieDisposition", "semantic ties must fail closed");
    if (policy.evaluationOrder !== "registry") throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".evaluationOrder", "evaluation order must be registry order");
    requireArray(policy.vehicleClassRules, path + ".vehicleClassRules");
    if (policy.vehicleClassRules.length !== VEHICLE_CLASSES.length) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".vehicleClassRules", "one rule per vehicle class is required");
    policy.vehicleClassRules.forEach(function (rule, index) {
      validateVehicleClassRule(rule, path + ".vehicleClassRules[" + index + "]");
      if (rule.vehicleClass !== VEHICLE_CLASSES[index]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".vehicleClassRules[" + index + "].vehicleClass", "vehicle class rules must use closed order");
    });
  }

  function validateVehicleThresholdPolicy(policy, path, kind) {
    var contractVersion = kind === "liquidity" ? "rlfx-vehicle-liquidity-policy/v1" : "rlfx-vehicle-cost-policy/v1";
    requireObject(policy, path);
    exactKeys(policy, ["contractVersion", "policyId", "requiredFactKinds", "minimumObservationCount", "criteria"], path);
    if (policy.contractVersion !== contractVersion) throw schemaError("RLFX_CONTRACT_VERSION", path + ".contractVersion", "unknown vehicle " + kind + "-policy contract");
    requireNonEmptyString(policy.policyId, "RLFX_VEHICLE_UNIVERSE_INVALID");
    requireUniqueStringArray(policy.requiredFactKinds, path + ".requiredFactKinds", false);
    policy.requiredFactKinds.forEach(function (factKind, index) {
      requireEnum(factKind, VEHICLE_FACT_KINDS, path + ".requiredFactKinds[" + index + "]");
    });
    requirePositiveInteger(policy.minimumObservationCount, path + ".minimumObservationCount");
    requireArray(policy.criteria, path + ".criteria");
    if (policy.criteria.length !== policy.requiredFactKinds.length || policy.minimumObservationCount > policy.criteria.length) {
      throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path, "threshold policy counts must be explicit and satisfiable");
    }
    policy.criteria.forEach(function (criterion, index) {
      var criterionPath = path + ".criteria[" + index + "]";
      requireObject(criterion, criterionPath);
      exactKeys(criterion, ["factKind", "operator", "threshold", "unit"], criterionPath);
      if (criterion.factKind !== policy.requiredFactKinds[index]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", criterionPath + ".factKind", "policy criteria must follow required fact order");
      requireEnum(criterion.operator, ["minimum", "maximum"], criterionPath + ".operator");
      requireFinite(criterion.threshold, criterionPath + ".threshold");
      requireNonEmptyString(criterion.unit, "RLFX_VEHICLE_UNIVERSE_INVALID");
    });
  }

  function vehicleObservationAllowedKeys(observation, path) {
    var commonKeys = ["contractVersion", "observationId", "vehicleId", "ticker", "factKind", "sourcePolicyId", "source", "observedAsOf", "retrievedAt", "expectedCadence", "reviewWindow", "freshUntil", "rights", "quality", "revisionId", "limitations"];
    if (observation.kind === "scalar") return commonKeys.concat(["kind", "availability", "value", "unit"]);
    if (observation.kind === "series") return commonKeys.concat(["kind", "availability", "series", "unit"]);
    if (observation.kind === "unavailable") return commonKeys.concat(["kind", "availability", "unavailableReason", "availabilityDetail"]);
    throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".kind", "unknown vehicle observation branch");
  }

  function validateVehicleObservationShape(observation, path, strictFinite) {
    requireObject(observation, path);
    exactKeys(observation, vehicleObservationAllowedKeys(observation, path), path);
    if (observation.contractVersion !== "rlfx-vehicle-observation/v1") throw schemaError("RLFX_CONTRACT_VERSION", path + ".contractVersion", "unknown vehicle-observation contract");
    requireNonEmptyString(observation.observationId, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireNonEmptyString(observation.vehicleId, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireNonEmptyString(observation.ticker, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireEnum(observation.factKind, VEHICLE_FACT_KINDS, path + ".factKind");
    requireNonEmptyString(observation.sourcePolicyId, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireObject(observation.source, path + ".source");
    exactKeys(observation.source, ["id", "class", "url"], path + ".source");
    requireNonEmptyString(observation.source.id, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireEnum(observation.source.class, VEHICLE_SOURCE_CLASSES, path + ".source.class");
    if (observation.source.url !== null) requireHttpUrl(observation.source.url, path + ".source.url");
    requireNullableIso(observation.observedAsOf, path + ".observedAsOf");
    requireNullableIso(observation.retrievedAt, path + ".retrievedAt");
    requireNullableEnum(observation.expectedCadence, VEHICLE_SOURCE_CADENCES, path + ".expectedCadence");
    if (observation.reviewWindow !== null) validateReviewWindow(observation.reviewWindow, path + ".reviewWindow");
    requireNullableIso(observation.freshUntil, path + ".freshUntil");
    requireEnum(observation.rights, ["redistributable", "reference-only", "restricted", "unknown"], path + ".rights");
    requireNullableEnum(observation.quality, VEHICLE_QUALITIES, path + ".quality");
    requireNullableString(observation.revisionId, path + ".revisionId");
    requireStringArray(observation.limitations, path + ".limitations", false);

    if (observation.kind === "unavailable") {
      requireEnum(observation.availability, ["loading", "unavailable"], path + ".availability");
      if (observation.availability === "loading") {
        if (observation.unavailableReason !== null) throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".unavailableReason", "loading observation requires a null reason");
      } else {
        requireEnum(observation.unavailableReason, VEHICLE_REASON_CODES, path + ".unavailableReason");
      }
      requireNonEmptyString(observation.availabilityDetail, "RLFX_VEHICLE_OBSERVATION_INVALID");
      if (observation.freshUntil !== null) throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".freshUntil", "unavailable observation has no freshness deadline");
      return;
    }

    requireEnum(observation.availability, ["fresh", "stale", "revised"], path + ".availability");
    if (observation.observedAsOf === null || observation.retrievedAt === null || observation.expectedCadence === null || observation.reviewWindow === null || observation.freshUntil === null || observation.quality === null) {
      throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path, "available vehicle observation requires independent source clocks, cadence, freshness, and quality");
    }
    if (observation.availability === "revised" && observation.revisionId === null) throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".revisionId", "revised observation requires a revision ID");
    requireNonEmptyString(observation.unit, "RLFX_VEHICLE_OBSERVATION_INVALID");
    if (observation.kind === "scalar") {
      var scalar = observation.value;
      if (typeof scalar === "number") {
        if (strictFinite) requireFinite(scalar, path + ".value");
      } else if (typeof scalar === "string") {
        requireNonEmptyString(scalar, "RLFX_VEHICLE_OBSERVATION_INVALID");
      } else if (typeof scalar === "boolean") {
        return;
      } else if (Array.isArray(scalar)) {
        requireStringArray(scalar, path + ".value", false);
      } else if (observation.factKind === "reset-session" && isPlainObject(scalar)) {
        exactKeys(scalar, ["resetSessionId", "resetSessionEndsAt"], path + ".value");
        requireNonEmptyString(scalar.resetSessionId, "RLFX_VEHICLE_OBSERVATION_INVALID");
        requireIso(scalar.resetSessionEndsAt, path + ".value.resetSessionEndsAt");
      } else {
        throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".value", "scalar vehicle fact has an invalid value type");
      }
      return;
    }
    requireObject(observation.series, path + ".series");
    exactKeys(observation.series, ["seriesId", "returnBasis", "adjustment", "currency"], path + ".series");
    requireNonEmptyString(observation.series.seriesId, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireEnum(observation.series.returnBasis, ["market-price", "nav-per-share", "spot", "benchmark-index", "total-return-index"], path + ".series.returnBasis");
    requireEnum(observation.series.adjustment, ["raw-close", "adjusted-close", "not-applicable"], path + ".series.adjustment");
    requireNonEmptyString(observation.series.currency, "RLFX_VEHICLE_OBSERVATION_INVALID");
  }

  function validateVehicleUniverse(value) {
    try {
      requireObject(value, "$vehicleUniverse");
      exactKeys(value, ["contractVersion", "version", "reviewedAt", "sourcePolicies", "vehicles", "observations", "policies"], "$vehicleUniverse");
      if (value.contractVersion !== "rlfx-vehicle-universe/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$vehicleUniverse.contractVersion", "unknown vehicle-universe contract");
      requireNonEmptyString(value.version, "RLFX_VEHICLE_UNIVERSE_INVALID");
      requireIso(value.reviewedAt, "$vehicleUniverse.reviewedAt");

      var policiesById = {};
      var sourceIds = {};
      requireArray(value.sourcePolicies, "$vehicleUniverse.sourcePolicies");
      if (value.sourcePolicies.length === 0) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.sourcePolicies", "at least one source policy is required");
      value.sourcePolicies.forEach(function (policy, index) {
        var path = "$vehicleUniverse.sourcePolicies[" + index + "]";
        validateVehicleSourcePolicy(policy, path);
        if (policiesById[policy.policyId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".policyId", "duplicate vehicle source policy");
        if (sourceIds[policy.sourceId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".sourceId", "duplicate vehicle source ID");
        policiesById[policy.policyId] = policy;
        sourceIds[policy.sourceId] = true;
      });

      var vehiclesById = {};
      var vehiclesByTicker = {};
      requireArray(value.vehicles, "$vehicleUniverse.vehicles");
      if (value.vehicles.length === 0) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.vehicles", "closed vehicle inventory is required");
      value.vehicles.forEach(function (vehicle, index) {
        var path = "$vehicleUniverse.vehicles[" + index + "]";
        validateCurrencyVehicle(vehicle, path);
        if (vehiclesById[vehicle.vehicleId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".vehicleId", "duplicate vehicle ID");
        if (vehiclesByTicker[vehicle.ticker]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".ticker", "duplicate vehicle ticker");
        vehiclesById[vehicle.vehicleId] = vehicle;
        vehiclesByTicker[vehicle.ticker] = vehicle;
        var covered = value.sourcePolicies.some(function (policy) { return contains(policy.subjectTickers, vehicle.ticker); });
        if (!covered) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".ticker", "vehicle has no source-policy subject coverage");
      });
      value.sourcePolicies.forEach(function (policy, policyIndex) {
        policy.subjectTickers.forEach(function (ticker, tickerIndex) {
          if (!vehiclesByTicker[ticker]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.sourcePolicies[" + policyIndex + "].subjectTickers[" + tickerIndex + "]", "source policy covers an unknown vehicle");
        });
      });

      var observationsById = {};
      requireArray(value.observations, "$vehicleUniverse.observations");
      value.observations.forEach(function (observation, index) {
        var path = "$vehicleUniverse.observations[" + index + "]";
        validateVehicleObservationShape(observation, path, true);
        if (observationsById[observation.observationId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".observationId", "duplicate vehicle observation ID");
        var vehicle = vehiclesById[observation.vehicleId];
        var policy = policiesById[observation.sourcePolicyId];
        if (!vehicle || vehicle.ticker !== observation.ticker) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path, "observation vehicle identity is unknown or mismatched");
        if (!policy || !contains(policy.subjectTickers, observation.ticker) || !contains(policy.allowedFactKinds, observation.factKind)) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path, "observation is outside source-policy coverage");
        if (observation.source.id !== policy.sourceId || observation.source.class !== policy.sourceClass) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".source", "observation source identity does not match its policy");
        if (observation.source.url !== null && observation.source.url !== policy.sourceUrl) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".source.url", "observation source URL does not match its policy");
        if (observation.factKind === "active-status" && observation.kind === "scalar" && !contains(VEHICLE_ACTIVE_STATES, observation.value)) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", path + ".value", "active status is outside the closed vocabulary");
        observationsById[observation.observationId] = observation;
      });

      value.vehicles.forEach(function (vehicle, vehicleIndex) {
        Object.keys(VEHICLE_REQUIRED_FACT_REFS).forEach(function (field) {
          var observation = observationsById[vehicle.factRefs[field]];
          if (!observation || observation.vehicleId !== vehicle.vehicleId || observation.ticker !== vehicle.ticker || observation.factKind !== VEHICLE_REQUIRED_FACT_REFS[field]) {
            throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.vehicles[" + vehicleIndex + "].factRefs." + field, "required fact reference is missing or mismatched");
          }
        });
        Object.keys(VEHICLE_OPTIONAL_FACT_REFS).forEach(function (field) {
          var reference = vehicle.optionalFactRefs[field];
          if (reference === null) return;
          var observation = observationsById[reference];
          if (!observation || observation.vehicleId !== vehicle.vehicleId || observation.ticker !== vehicle.ticker || observation.factKind !== VEHICLE_OPTIONAL_FACT_REFS[field]) {
            throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.vehicles[" + vehicleIndex + "].optionalFactRefs." + field, "optional fact reference is missing or mismatched");
          }
        });
      });

      requireObject(value.policies, "$vehicleUniverse.policies");
      exactKeys(value.policies, ["contractVersion", "requiredStaticFactKinds", "trackingPolicyId", "fitPolicyId", "trackingPolicies", "fitPolicies", "liquidityPolicies", "costPolicies"], "$vehicleUniverse.policies");
      if (value.policies.contractVersion !== "rlfx-vehicle-policy/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$vehicleUniverse.policies.contractVersion", "unknown vehicle-policy contract");
      requireUniqueStringArray(value.policies.requiredStaticFactKinds, "$vehicleUniverse.policies.requiredStaticFactKinds", false);
      if (canonicalize(value.policies.requiredStaticFactKinds) !== canonicalize(VEHICLE_REQUIRED_STATIC_FACT_KINDS)) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.policies.requiredStaticFactKinds", "required static fact contract is incomplete or reordered");
      requireNonEmptyString(value.policies.trackingPolicyId, "RLFX_VEHICLE_UNIVERSE_INVALID");
      requireNonEmptyString(value.policies.fitPolicyId, "RLFX_VEHICLE_UNIVERSE_INVALID");
      requireArray(value.policies.trackingPolicies, "$vehicleUniverse.policies.trackingPolicies");
      requireArray(value.policies.fitPolicies, "$vehicleUniverse.policies.fitPolicies");
      requireArray(value.policies.liquidityPolicies, "$vehicleUniverse.policies.liquidityPolicies");
      requireArray(value.policies.costPolicies, "$vehicleUniverse.policies.costPolicies");
      if (value.policies.trackingPolicies.length === 0 || value.policies.fitPolicies.length === 0 || value.policies.liquidityPolicies.length === 0 || value.policies.costPolicies.length === 0) {
        throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.policies", "complete tracking, fit, liquidity, and cost policy records are required");
      }
      var vehiclePolicyIds = {};
      value.policies.trackingPolicies.forEach(function (policy, index) {
        validateVehicleTrackingPolicy(policy, "$vehicleUniverse.policies.trackingPolicies[" + index + "]");
        if (vehiclePolicyIds[policy.policyId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.policies.trackingPolicies[" + index + "].policyId", "duplicate vehicle policy ID");
        vehiclePolicyIds[policy.policyId] = true;
      });
      value.policies.fitPolicies.forEach(function (policy, index) {
        validateVehicleFitPolicy(policy, "$vehicleUniverse.policies.fitPolicies[" + index + "]");
        if (vehiclePolicyIds[policy.policyId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.policies.fitPolicies[" + index + "].policyId", "duplicate vehicle policy ID");
        policy.dailyResetVehicleIds.forEach(function (vehicleId, vehicleIndex) {
          if (!vehiclesById[vehicleId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.policies.fitPolicies[" + index + "].dailyResetVehicleIds[" + vehicleIndex + "]", "daily-reset policy references an unknown vehicle");
        });
        vehiclePolicyIds[policy.policyId] = true;
      });
      value.policies.liquidityPolicies.forEach(function (policy, index) {
        validateVehicleThresholdPolicy(policy, "$vehicleUniverse.policies.liquidityPolicies[" + index + "]", "liquidity");
        if (vehiclePolicyIds[policy.policyId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.policies.liquidityPolicies[" + index + "].policyId", "duplicate vehicle policy ID");
        vehiclePolicyIds[policy.policyId] = true;
      });
      value.policies.costPolicies.forEach(function (policy, index) {
        validateVehicleThresholdPolicy(policy, "$vehicleUniverse.policies.costPolicies[" + index + "]", "cost");
        if (vehiclePolicyIds[policy.policyId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.policies.costPolicies[" + index + "].policyId", "duplicate vehicle policy ID");
        vehiclePolicyIds[policy.policyId] = true;
      });
      if (!vehiclePolicyIds[value.policies.trackingPolicyId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.policies.trackingPolicyId", "selected tracking policy does not resolve");
      if (!vehiclePolicyIds[value.policies.fitPolicyId]) throw schemaError("RLFX_VEHICLE_UNIVERSE_INVALID", "$vehicleUniverse.policies.fitPolicyId", "selected fit policy does not resolve");
      return deepFreeze({ ok: true, value: cloneCanonical(value) });
    } catch (error) {
      return vehicleUniverseFailure(error);
    }
  }

  function safeVehicleIso(value) {
    try {
      return value === null ? null : requireIso(value, "$vehicleObservation.clock");
    } catch (_error) {
      return null;
    }
  }

  function safeVehicleReviewWindow(value) {
    try {
      if (value === null) return null;
      validateReviewWindow(value, "$vehicleObservation.reviewWindow");
      return cloneCanonical(value);
    } catch (_error) {
      return null;
    }
  }

  function vehicleUnavailableObservation(raw, reason, detail) {
    var limitations = raw && Array.isArray(raw.limitations) ? raw.limitations.filter(function (entry) { return typeof entry === "string" && entry.trim() !== ""; }).slice() : [];
    if (detail && limitations.indexOf(detail) === -1) limitations.push(detail);
    if (limitations.length === 0) limitations.push("Vehicle observation is unavailable under the active source contract.");
    return deepFreeze({
      contractVersion: "rlfx-vehicle-observation/v1",
      observationId: raw.observationId,
      vehicleId: raw.vehicleId,
      ticker: raw.ticker,
      factKind: raw.factKind,
      sourcePolicyId: raw.sourcePolicyId,
      source: { id: raw.source.id, class: raw.source.class, url: null },
      observedAsOf: safeVehicleIso(raw.observedAsOf),
      retrievedAt: safeVehicleIso(raw.retrievedAt),
      expectedCadence: contains(VEHICLE_SOURCE_CADENCES, raw.expectedCadence) ? raw.expectedCadence : null,
      reviewWindow: safeVehicleReviewWindow(raw.reviewWindow),
      freshUntil: null,
      rights: contains(["redistributable", "reference-only", "restricted", "unknown"], raw.rights) ? raw.rights : "unknown",
      quality: contains(VEHICLE_QUALITIES, raw.quality) ? raw.quality : null,
      revisionId: typeof raw.revisionId === "string" && raw.revisionId.trim() !== "" ? raw.revisionId : null,
      limitations: limitations,
      kind: "unavailable",
      availability: "unavailable",
      unavailableReason: reason,
      availabilityDetail: detail
    });
  }

  function normalizeVehicleObservation(value, context) {
    requireObject(value, "$vehicleObservation");
    requireObject(context, "$vehicleObservationContext");
    exactKeys(context, ["universe", "decisionTime", "payloadKind"], "$vehicleObservationContext");
    requireIso(context.decisionTime, "$vehicleObservationContext.decisionTime");
    requireNonEmptyString(context.payloadKind, "RLFX_VEHICLE_OBSERVATION_INVALID");
    exactKeys(value, vehicleObservationAllowedKeys(value, "$vehicleObservation"), "$vehicleObservation");
    if (value.contractVersion !== "rlfx-vehicle-observation/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$vehicleObservation.contractVersion", "unknown vehicle-observation contract");
    requireNonEmptyString(value.observationId, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireNonEmptyString(value.vehicleId, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireNonEmptyString(value.ticker, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireEnum(value.factKind, VEHICLE_FACT_KINDS, "$vehicleObservation.factKind");
    requireNonEmptyString(value.sourcePolicyId, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireObject(value.source, "$vehicleObservation.source");
    exactKeys(value.source, ["id", "class", "url"], "$vehicleObservation.source");
    requireNonEmptyString(value.source.id, "RLFX_VEHICLE_OBSERVATION_INVALID");
    requireEnum(value.source.class, VEHICLE_SOURCE_CLASSES, "$vehicleObservation.source.class");
    var universeValidation = validateVehicleUniverse(context.universe);
    if (!universeValidation.ok) throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", "$vehicleObservationContext.universe", universeValidation.errors[0].message);

    var universe = universeValidation.value;
    var vehicle = universe.vehicles.find(function (entry) { return entry.vehicleId === value.vehicleId; });
    var policy = universe.sourcePolicies.find(function (entry) { return entry.policyId === value.sourcePolicyId; });
    if (!vehicle || vehicle.ticker !== value.ticker) throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", "$vehicleObservation.vehicleId", "unknown or mismatched vehicle identity");
    if (!policy || !contains(policy.allowedFactKinds, value.factKind) || !contains(policy.subjectTickers, value.ticker)) throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", "$vehicleObservation.sourcePolicyId", "unknown fact or source-policy coverage");
    if (value.source.id !== policy.sourceId || value.source.class !== policy.sourceClass) throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", "$vehicleObservation.source", "source identity does not match its policy");

    if (!contains(["redistributable", "reference-only", "restricted", "unknown"], value.rights)) return vehicleUnavailableObservation(value, "SOURCE_ERROR", "Observation rights are outside the closed vocabulary.");
    if (policy.activation !== "approved" || !contains(ALLOWED_RIGHTS, policy.rights) || !contains(ALLOWED_RIGHTS, value.rights) || policy.sourceUsePolicyId === null || policy.sourceUseReviewRef === null || policy.retention === "forbidden" || contains(policy.forbiddenPayloadKinds, context.payloadKind)) {
      return vehicleUnavailableObservation(value, "RIGHTS_UNCLEAR", "Source-use authorization is incomplete or excludes this payload.");
    }

    try {
      validateVehicleObservationShape(value, "$vehicleObservation", false);
      if (value.kind === "unavailable") return deepFreeze(cloneCanonical(value));
      if (value.source.url !== null && value.source.url !== policy.sourceUrl) throw new Error("Source URL does not match the approved policy");
      if (value.expectedCadence !== policy.expectedCadence) throw new Error("Observation cadence does not match the approved policy");
      if (canonicalize(value.reviewWindow) !== canonicalize(policy.reviewWindow)) throw new Error("Observation review window does not match the approved policy");
      var observedEpoch = Date.parse(requireIso(value.observedAsOf, "$vehicleObservation.observedAsOf"));
      var retrievedEpoch = Date.parse(requireIso(value.retrievedAt, "$vehicleObservation.retrievedAt"));
      var decisionEpoch = Date.parse(context.decisionTime);
      if (observedEpoch > retrievedEpoch || retrievedEpoch > decisionEpoch) throw new Error("Observation clocks are not ordered at the decision time");
      var freshUntilEpoch;
      if (policy.reviewWindow.mode === "max-age") freshUntilEpoch = Math.min(observedEpoch + policy.reviewWindow.observedMaxAgeMs, retrievedEpoch + policy.reviewWindow.retrievalMaxAgeMs);
      else freshUntilEpoch = Math.min(Date.parse(policy.reviewWindow.reviewAt), retrievedEpoch + policy.reviewWindow.retrievalMaxAgeMs);
      var freshUntil = new Date(freshUntilEpoch).toISOString();
      if (value.freshUntil !== null && value.freshUntil !== freshUntil) throw new Error("Supplied freshness deadline does not match the source policy");
      if (value.kind === "scalar") {
        if (typeof value.value === "number" && !Number.isFinite(value.value)) throw new Error("Scalar numeric value is non-finite");
        if (typeof value.value === "string" && value.value.trim() === "") throw new Error("Scalar string value is empty");
        if (Array.isArray(value.value) && value.value.length === 0) throw new Error("Scalar string-array value is empty");
        if (value.factKind === "active-status" && !contains(VEHICLE_ACTIVE_STATES, value.value)) throw new Error("Active status is outside the closed vocabulary");
      }
      var normalized = cloneCanonical(value);
      normalized.freshUntil = freshUntil;
      normalized.availability = decisionEpoch > freshUntilEpoch || value.availability === "stale" ? "stale" : value.availability;
      return deepFreeze(normalized);
    } catch (error) {
      return vehicleUnavailableObservation(value, "SOURCE_ERROR", error.message);
    }
  }

  function inspectVehicleTrackingLeg(value, legId, factKind, input) {
    if (value === null) {
      return { legId: legId, observation: null, rows: [], basis: null, status: "incomplete", reason: "TRACKING_EVIDENCE_INCOMPLETE" };
    }
    var path = "$vehicleTracking." + legId;
    requireObject(value, path);
    exactKeys(value, ["observation", "rows"], path);
    requireArray(value.rows, path + ".rows");
    validateVehicleObservationShape(value.observation, path + ".observation", true);
    var observation = value.observation;
    if (observation.vehicleId !== input.vehicleId || observation.ticker !== input.ticker || observation.factKind !== factKind) {
      throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".observation", "tracking leg identity or fact kind is mismatched");
    }
    if (observation.kind === "unavailable") {
      return {
        legId: legId,
        observation: observation,
        rows: [],
        basis: null,
        status: "unavailable",
        reason: observation.unavailableReason === null ? "TRACKING_EVIDENCE_INCOMPLETE" : observation.unavailableReason
      };
    }
    if (observation.kind !== "series") {
      return { legId: legId, observation: observation, rows: [], basis: null, status: "incomplete", reason: "TRACKING_EVIDENCE_INCOMPLETE" };
    }
    if (!contains(ALLOWED_RIGHTS, observation.rights)) {
      return { legId: legId, observation: observation, rows: [], basis: observation.series.returnBasis, status: "unavailable", reason: "RIGHTS_UNCLEAR" };
    }
    var observedEpoch = Date.parse(observation.observedAsOf);
    var retrievedEpoch = Date.parse(observation.retrievedAt);
    var decisionEpoch = Date.parse(input.decisionTime);
    if (observedEpoch > retrievedEpoch || retrievedEpoch > decisionEpoch) {
      return { legId: legId, observation: observation, rows: [], basis: observation.series.returnBasis, status: "unavailable", reason: "SOURCE_ERROR" };
    }
    if (observation.availability === "stale" || decisionEpoch > Date.parse(observation.freshUntil)) {
      return { legId: legId, observation: observation, rows: [], basis: observation.series.returnBasis, status: "stale", reason: "REQUIRED_FACT_STALE" };
    }
    return { legId: legId, observation: observation, rows: value.rows, basis: observation.series.returnBasis, status: "ready", reason: null };
  }

  function vehicleTrackingContexts(values, input) {
    return values.map(function (observation, index) {
      var path = "$vehicleTracking.contexts[" + index + "]";
      validateVehicleObservationShape(observation, path, true);
      if (observation.vehicleId !== input.vehicleId || observation.ticker !== input.ticker) {
        throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path, "tracking context vehicle identity is mismatched");
      }
      if (!contains(VEHICLE_TRACKING_CONTEXT_FACT_KINDS, observation.factKind)) {
        throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".factKind", "fact kind is not a tracking context");
      }
      var state = "unavailable";
      if (observation.kind !== "unavailable" && contains(ALLOWED_RIGHTS, observation.rights)) {
        state = observation.availability;
        if (Date.parse(input.decisionTime) > Date.parse(observation.freshUntil)) state = "stale";
      }
      return { factKind: observation.factKind, observationId: observation.observationId, state: state };
    }).sort(function (left, right) {
      return left.factKind.localeCompare(right.factKind) || left.observationId.localeCompare(right.observationId);
    });
  }

  function vehicleTrackingBasisCompatible(legs) {
    var permittedByLeg = {
      market: ["market-price", "total-return-index"],
      nav: ["nav-per-share", "total-return-index"],
      underlying: ["spot", "benchmark-index", "total-return-index"]
    };
    if (!legs.every(function (leg) { return contains(permittedByLeg[leg.legId], leg.basis); })) return false;
    var basisClasses = legs.map(function (leg) { return leg.basis === "total-return-index" ? "total-return" : "price-return"; });
    var adjustments = legs.map(function (leg) { return leg.observation.series.adjustment; });
    var currencies = legs.map(function (leg) { return leg.observation.series.currency; });
    return basisClasses.every(function (value) { return value === basisClasses[0]; }) &&
      adjustments.every(function (value) { return value === adjustments[0]; }) &&
      currencies.every(function (value) { return value === currencies[0]; });
  }

  function oldestVehicleTrackingClock(legs, field) {
    return legs.map(function (leg) { return leg.observation[field]; }).sort()[0];
  }

  function vehicleTrackingLimitations(reason) {
    var limitations = [
      "Returns and observed differences use exact common dates; no forward fill is applied.",
      "Fee, carry, income, roll, collateral, rebalance, and premium effects are not inferred or subtracted from the unexplained residual."
    ];
    if (reason === "TRACKING_EVIDENCE_INCOMPLETE") limitations.push("Market, NAV, and declared underlying series are all required for a complete tracking read.");
    if (reason === "RETURN_BASIS_MISMATCH") limitations.push("Required series do not share one compatible return basis, adjustment, and currency.");
    if (reason === "REQUIRED_FACT_STALE") limitations.push("At least one required series is stale at the explicit decision time.");
    if (reason === "INSUFFICIENT_HISTORY" || reason === "NO_COMMON_DATES") limitations.push("Required series do not share enough exact dates for the selected horizon.");
    return limitations;
  }

  function finishVehicleTrackingRead(input, legs, fields) {
    var result = {
      contractVersion: "rlfx-vehicle-tracking-read/v1",
      trackingReadId: "",
      vehicleId: input.vehicleId,
      ticker: input.ticker,
      horizon: input.horizon,
      state: fields.state,
      observationSet: fields.observationSet,
      returnBasis: fields.returnBasis,
      returns: fields.returns,
      observedDifferences: fields.observedDifferences,
      sourcedContexts: fields.sourcedContexts,
      unexplainedResidual: fields.unexplainedResidual,
      evidenceCutoff: fields.evidenceCutoff,
      freshUntil: fields.freshUntil,
      unavailableReason: fields.unavailableReason,
      limitations: vehicleTrackingLimitations(fields.unavailableReason)
    };
    var identity = {
      decisionTime: input.decisionTime,
      result: cloneCanonical(result),
      requiredObservations: legs.map(function (leg) {
        if (leg.observation === null) return { legId: leg.legId, observationId: null, revisionId: null, availability: "unavailable" };
        return {
          legId: leg.legId,
          observationId: leg.observation.observationId,
          revisionId: leg.observation.revisionId,
          availability: leg.observation.availability
        };
      }),
      contextObservations: input.contexts.map(function (observation) {
        return { observationId: observation.observationId, revisionId: observation.revisionId, availability: observation.availability };
      })
    };
    result.trackingReadId = "vehicle-track-v1-" + decisionId(identity).slice("fxd-v1-".length);
    return deepFreeze(result);
  }

  function emptyVehicleTrackingFields(state, reason, bases, contexts, observationSet, evidenceCutoff, freshUntil) {
    return {
      state: state,
      observationSet: observationSet,
      returnBasis: bases,
      returns: { market: null, nav: null, underlying: null },
      observedDifferences: { marketMinusNav: null, navMinusUnderlying: null, marketMinusUnderlying: null },
      sourcedContexts: contexts,
      unexplainedResidual: null,
      evidenceCutoff: evidenceCutoff,
      freshUntil: freshUntil,
      unavailableReason: reason
    };
  }

  function computeVehicleTrackingRead(input) {
    requireObject(input, "$vehicleTracking");
    exactKeys(input, ["decisionTime", "vehicleId", "ticker", "horizon", "horizonSessions", "market", "nav", "underlying", "contexts"], "$vehicleTracking");
    requireIso(input.decisionTime, "$vehicleTracking.decisionTime");
    requireNonEmptyString(input.vehicleId, "RLFX_SCHEMA_INVALID");
    requireNonEmptyString(input.ticker, "RLFX_SCHEMA_INVALID");
    if (!/^[A-Z][A-Z0-9.]{0,9}$/.test(input.ticker)) throw schemaError("RLFX_SCHEMA_INVALID", "$vehicleTracking.ticker", "canonical exchange ticker is required");
    requireEnum(input.horizon, ["tactical", "swing", "structural"], "$vehicleTracking.horizon");
    requirePositiveInteger(input.horizonSessions, "$vehicleTracking.horizonSessions");
    requireArray(input.contexts, "$vehicleTracking.contexts");

    var contexts = vehicleTrackingContexts(input.contexts, input);
    var legs = [
      inspectVehicleTrackingLeg(input.market, "market", "market-price", input),
      inspectVehicleTrackingLeg(input.nav, "nav", "nav", input),
      inspectVehicleTrackingLeg(input.underlying, "underlying", "underlying-level", input)
    ];
    var bases = {
      market: legs[0].basis,
      nav: legs[1].basis,
      underlying: legs[2].basis
    };
    var incomplete = legs.find(function (leg) { return leg.status === "incomplete"; });
    if (incomplete) {
      return finishVehicleTrackingRead(input, legs, emptyVehicleTrackingFields("Indeterminate", incomplete.reason, bases, contexts, null, null, null));
    }
    var unavailable = legs.find(function (leg) { return leg.status === "unavailable"; });
    if (unavailable) {
      return finishVehicleTrackingRead(input, legs, emptyVehicleTrackingFields("Unavailable", unavailable.reason, bases, contexts, null, null, null));
    }
    var stale = legs.find(function (leg) { return leg.status === "stale"; });
    if (stale) {
      return finishVehicleTrackingRead(input, legs, emptyVehicleTrackingFields("Unavailable", stale.reason, bases, contexts, null, null, null));
    }
    if (!vehicleTrackingBasisCompatible(legs)) {
      return finishVehicleTrackingRead(input, legs, emptyVehicleTrackingFields("Unavailable", "RETURN_BASIS_MISMATCH", bases, contexts, null, null, null));
    }

    var observationSet = alignExact(legs.map(function (leg) {
      return {
        legId: leg.legId,
        observationId: leg.observation.observationId,
        subject: input.ticker + ":" + leg.legId,
        adjustment: leg.observation.series.adjustment,
        rows: leg.rows
      };
    }), input.horizonSessions, "vehicle-tracking");
    var evidenceCutoff = oldestVehicleTrackingClock(legs, "observedAsOf");
    var freshUntil = oldestVehicleTrackingClock(legs, "freshUntil");
    if (observationSet.state !== "aligned") {
      var unavailableState = observationSet.state === "insufficient" ? "Indeterminate" : "Unavailable";
      return finishVehicleTrackingRead(input, legs, emptyVehicleTrackingFields(unavailableState, observationSet.unavailableReason, bases, contexts, observationSet, evidenceCutoff, freshUntil));
    }

    var first = observationSet.alignedRows[0].values;
    var last = observationSet.alignedRows[observationSet.alignedRows.length - 1].values;
    var returns = {
      market: last.market / first.market - 1,
      nav: last.nav / first.nav - 1,
      underlying: last.underlying / first.underlying - 1
    };
    var differences = {
      marketMinusNav: returns.market - returns.nav,
      navMinusUnderlying: returns.nav - returns.underlying,
      marketMinusUnderlying: returns.market - returns.underlying
    };
    var directions = [returns.market, returns.nav, returns.underlying].map(function (value) { return value > 0 ? 1 : (value < 0 ? -1 : 0); });
    var hasPositive = directions.indexOf(1) !== -1;
    var hasNegative = directions.indexOf(-1) !== -1;
    var oneDirection = directions.every(function (value) { return value === directions[0]; });
    var state = hasPositive && hasNegative ? "Diverging" : (oneDirection ? "Tracking" : "Indeterminate");
    var reason = state === "Indeterminate" ? "TRACKING_EVIDENCE_INCOMPLETE" : null;
    return finishVehicleTrackingRead(input, legs, {
      state: state,
      observationSet: observationSet,
      returnBasis: bases,
      returns: returns,
      observedDifferences: differences,
      sourcedContexts: contexts,
      unexplainedResidual: { basis: "nav-minus-underlying", value: differences.navMinusUnderlying },
      evidenceCutoff: evidenceCutoff,
      freshUntil: freshUntil,
      unavailableReason: reason
    });
  }

  function uniqueVehicleReasonCodes(values) {
    var seen = {};
    return values.filter(function (value) {
      if (!contains(VEHICLE_REASON_CODES, value)) throw schemaError("RLFX_FIT_POLICY_INVALID", "$vehicleFit.reasonCodes", "unknown vehicle reason code");
      if (seen[value]) return false;
      seen[value] = true;
      return true;
    });
  }

  function makeVehicleFitCriterion(criterion, state, reasonCodes, evidenceObservationIds) {
    return {
      criterion: criterion,
      state: state,
      reasonCodes: uniqueVehicleReasonCodes(reasonCodes),
      evidenceObservationIds: evidenceObservationIds.filter(function (value, index, values) {
        return values.indexOf(value) === index;
      })
    };
  }

  function fitObservationStatus(observation, decisionTime, sourcePoliciesById, missingReason) {
    if (!observation) return { state: "unavailable", reason: missingReason, observation: null };
    if (observation.kind === "unavailable") {
      return {
        state: "unavailable",
        reason: observation.unavailableReason === null ? missingReason : observation.unavailableReason,
        observation: observation
      };
    }
    var sourcePolicy = sourcePoliciesById[observation.sourcePolicyId];
    if (!sourcePolicy || sourcePolicy.activation !== "approved" || sourcePolicy.sourceUsePolicyId === null || sourcePolicy.sourceUseReviewRef === null || !contains(ALLOWED_RIGHTS, sourcePolicy.rights) || sourcePolicy.retention === "forbidden" || !contains(ALLOWED_RIGHTS, observation.rights)) {
      return { state: "unavailable", reason: "RIGHTS_UNCLEAR", observation: observation };
    }
    var decisionEpoch = Date.parse(decisionTime);
    var observedEpoch = Date.parse(observation.observedAsOf);
    var retrievedEpoch = Date.parse(observation.retrievedAt);
    var freshUntilEpoch = Date.parse(observation.freshUntil);
    if (observedEpoch > retrievedEpoch || retrievedEpoch > decisionEpoch) {
      return { state: "unavailable", reason: "SOURCE_ERROR", observation: observation };
    }
    var expectedFreshUntilEpoch = sourcePolicy.reviewWindow.mode === "max-age" ?
      Math.min(observedEpoch + sourcePolicy.reviewWindow.observedMaxAgeMs, retrievedEpoch + sourcePolicy.reviewWindow.retrievalMaxAgeMs) :
      Math.min(Date.parse(sourcePolicy.reviewWindow.reviewAt), retrievedEpoch + sourcePolicy.reviewWindow.retrievalMaxAgeMs);
    if (freshUntilEpoch !== expectedFreshUntilEpoch) {
      return { state: "unavailable", reason: "SOURCE_ERROR", observation: observation };
    }
    if (observation.availability === "stale" || decisionEpoch > freshUntilEpoch) {
      return { state: "unavailable", reason: "REQUIRED_FACT_STALE", observation: observation };
    }
    return { state: "ready", reason: null, observation: observation };
  }

  function fitStatusReasons(statuses) {
    return uniqueVehicleReasonCodes(statuses.filter(function (status) {
      return status.state === "unavailable";
    }).map(function (status) {
      return status.reason;
    }));
  }

  function fitEvidenceIds(statuses) {
    return statuses.filter(function (status) {
      return status.observation !== null;
    }).map(function (status) {
      return status.observation.observationId;
    });
  }

  function validateFitTrackingRead(read, path) {
    requireObject(read, path);
    exactKeys(read, [
      "contractVersion", "trackingReadId", "vehicleId", "ticker", "horizon", "state",
      "observationSet", "returnBasis", "returns", "observedDifferences", "sourcedContexts",
      "unexplainedResidual", "evidenceCutoff", "freshUntil", "unavailableReason", "limitations"
    ], path);
    if (read.contractVersion !== "rlfx-vehicle-tracking-read/v1") throw schemaError("RLFX_CONTRACT_VERSION", path + ".contractVersion", "unknown vehicle tracking-read contract");
    requireNonEmptyString(read.trackingReadId, "RLFX_TRACKING_INPUT_INVALID");
    requireNonEmptyString(read.vehicleId, "RLFX_TRACKING_INPUT_INVALID");
    requireNonEmptyString(read.ticker, "RLFX_TRACKING_INPUT_INVALID");
    requireEnum(read.horizon, VEHICLE_HORIZONS, path + ".horizon");
    requireEnum(read.state, VEHICLE_TRACKING_STATES, path + ".state");
    requireNullableIso(read.evidenceCutoff, path + ".evidenceCutoff");
    requireNullableIso(read.freshUntil, path + ".freshUntil");
    if (read.unavailableReason !== null) requireEnum(read.unavailableReason, VEHICLE_REASON_CODES, path + ".unavailableReason");
    requireStringArray(read.limitations, path + ".limitations", false);
  }

  function validateFitObservation(observation, path, vehiclesById, sourcePoliciesById) {
    validateVehicleObservationShape(observation, path, true);
    var vehicle = vehiclesById[observation.vehicleId];
    var sourcePolicy = sourcePoliciesById[observation.sourcePolicyId];
    if (!vehicle || vehicle.ticker !== observation.ticker) throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path, "fit observation vehicle identity is unknown or mismatched");
    if (!sourcePolicy || !contains(sourcePolicy.subjectTickers, observation.ticker) || !contains(sourcePolicy.allowedFactKinds, observation.factKind)) {
      throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".sourcePolicyId", "fit observation is outside source-policy coverage");
    }
    if (observation.source.id !== sourcePolicy.sourceId || observation.source.class !== sourcePolicy.sourceClass) {
      throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".source", "fit observation source identity does not match its policy");
    }
    if (observation.source.url !== null && observation.source.url !== sourcePolicy.sourceUrl) {
      throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".source.url", "fit observation source URL does not match its policy");
    }
    if (observation.kind !== "unavailable") {
      if (observation.expectedCadence !== sourcePolicy.expectedCadence) {
        throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".expectedCadence", "fit observation cadence does not match its source policy");
      }
      if (canonicalize(observation.reviewWindow) !== canonicalize(sourcePolicy.reviewWindow)) {
        throw schemaError("RLFX_VEHICLE_OBSERVATION_INVALID", path + ".reviewWindow", "fit observation review window does not match its source policy");
      }
    }
  }

  function compareThreshold(value, criterion) {
    if (criterion.operator === "minimum") return value >= criterion.threshold;
    return value <= criterion.threshold;
  }

  function evaluateVehicleThresholdCriterion(name, policy, vehicle, observationForFact, decisionTime, sourcePoliciesById) {
    var statuses = policy.criteria.map(function (criterion) {
      var status = observationForFact(criterion.factKind, "REQUIRED_FACT_MISSING");
      if (status.state === "ready" && (typeof status.observation.value !== "number" || !Number.isFinite(status.observation.value) || status.observation.unit !== criterion.unit)) {
        return { state: "unavailable", reason: "SOURCE_ERROR", observation: status.observation };
      }
      return status;
    });
    var readyCount = statuses.filter(function (status) { return status.state === "ready"; }).length;
    var unavailableReasons = fitStatusReasons(statuses);
    if (readyCount < policy.minimumObservationCount && unavailableReasons.indexOf("REQUIRED_FACT_MISSING") === -1) unavailableReasons.push("REQUIRED_FACT_MISSING");
    var failed = statuses.some(function (status, index) {
      return status.state === "ready" && !compareThreshold(status.observation.value, policy.criteria[index]);
    });
    var failureCode = name === "liquidity" ? "LIQUIDITY_POLICY_FAILED" : "COST_POLICY_FAILED";
    if (failed) return makeVehicleFitCriterion(name, "fail", [failureCode].concat(unavailableReasons), fitEvidenceIds(statuses));
    if (unavailableReasons.length !== 0 || readyCount < policy.minimumObservationCount) return makeVehicleFitCriterion(name, "unavailable", unavailableReasons, fitEvidenceIds(statuses));
    return makeVehicleFitCriterion(name, "pass", [], fitEvidenceIds(statuses));
  }

  function oldestFitClock(observations, field, trackingRead) {
    var values = observations.filter(function (observation) {
      return observation && observation.kind !== "unavailable" && observation[field] !== null;
    }).map(function (observation) {
      return observation[field];
    });
    if (trackingRead && trackingRead[field] !== null) values.push(trackingRead[field]);
    return values.length === 0 ? null : values.sort()[0];
  }

  function evaluateVehicleFit(vehicle, registryIndex, context) {
    var staticStatusCache = {};
    function staticStatus(factKind, missingReason) {
      if (staticStatusCache[factKind]) return staticStatusCache[factKind];
      var field = Object.keys(VEHICLE_REQUIRED_FACT_REFS).find(function (key) {
        return VEHICLE_REQUIRED_FACT_REFS[key] === factKind;
      });
      var observation = field ? context.observationsById[vehicle.factRefs[field]] : null;
      var status = fitObservationStatus(observation, context.input.decisionTime, context.sourcePoliciesById, missingReason);
      staticStatusCache[factKind] = status;
      return status;
    }

    function observationForFact(factKind, missingReason) {
      if (contains(VEHICLE_REQUIRED_STATIC_FACT_KINDS, factKind)) return staticStatus(factKind, missingReason);
      var matches = context.observations.filter(function (observation) {
        return observation.vehicleId === vehicle.vehicleId && observation.factKind === factKind;
      });
      if (matches.length > 1) throw schemaError("RLFX_FIT_POLICY_INVALID", "$vehicleFit.observations", "vehicle fit fact is ambiguous");
      return fitObservationStatus(matches.length === 1 ? matches[0] : null, context.input.decisionTime, context.sourcePoliciesById, missingReason);
    }

    var criteria = [];
    var activeStatus = staticStatus("active-status", "ACTIVE_STATUS_UNKNOWN");
    var activeReasons = fitStatusReasons([activeStatus]);
    if (activeStatus.state === "ready" && Date.parse(context.input.decisionTime) - Date.parse(activeStatus.observation.observedAsOf) > context.fitPolicy.activeStatusMaximumAgeMs) {
      activeReasons.push("REQUIRED_FACT_STALE");
    }
    if (activeStatus.state === "ready" && activeStatus.observation.value !== "active") {
      criteria.push(makeVehicleFitCriterion("active-status", "fail", ["VEHICLE_CLOSED"].concat(activeReasons), fitEvidenceIds([activeStatus])));
    } else if (activeReasons.length !== 0) {
      criteria.push(makeVehicleFitCriterion("active-status", "unavailable", activeReasons, fitEvidenceIds([activeStatus])));
    } else {
      criteria.push(makeVehicleFitCriterion("active-status", "pass", [], fitEvidenceIds([activeStatus])));
    }

    var objectiveStatus = staticStatus("objective", "REQUIRED_FACT_MISSING");
    var directionStatus = staticStatus("direction", "REQUIRED_FACT_MISSING");
    var objectiveStatuses = [objectiveStatus, directionStatus];
    var objectiveMismatch = objectiveStatus.state === "ready" && directionStatus.state === "ready" &&
      ((context.input.objective.kind !== "compare-wrappers" && objectiveStatus.observation.value !== context.input.objective.kind) || directionStatus.observation.value !== context.input.objective.direction);
    var objectiveReasons = fitStatusReasons(objectiveStatuses);
    if (objectiveMismatch) objectiveReasons.unshift("DIRECTION_MISMATCH");
    criteria.push(makeVehicleFitCriterion(
      "objective-direction",
      objectiveMismatch ? "fail" : (objectiveReasons.length === 0 ? "pass" : "unavailable"),
      objectiveReasons,
      fitEvidenceIds(objectiveStatuses)
    ));

    var currencyStatus = staticStatus("currency-or-basket", "REQUIRED_FACT_MISSING");
    var currencyMismatch = currencyStatus.state === "ready" && currencyStatus.observation.value !== context.input.objective.subjectId;
    var currencyReasons = fitStatusReasons([currencyStatus]);
    if (currencyMismatch) {
      currencyReasons.unshift(context.input.controls.vehicleClass === "broad-dollar-basket" || context.input.controls.vehicleClass === "diversified-currency-basket" ? "BASKET_MISMATCH" : "CURRENCY_MISMATCH");
    }
    criteria.push(makeVehicleFitCriterion(
      "currency-basket",
      currencyMismatch ? "fail" : (currencyReasons.length === 0 ? "pass" : "unavailable"),
      currencyReasons,
      fitEvidenceIds([currencyStatus])
    ));

    var resetStatus = staticStatus("reset-policy", "REQUIRED_FACT_MISSING");
    var horizonReasons = fitStatusReasons([resetStatus]);
    var horizonMismatch = resetStatus.state === "ready" && resetStatus.observation.value === "daily" && context.input.controls.horizon !== "tactical";
    if (horizonMismatch) horizonReasons.unshift("HORIZON_INCOMPATIBLE");
    criteria.push(makeVehicleFitCriterion(
      "horizon",
      horizonMismatch ? "fail" : (horizonReasons.length === 0 ? "pass" : "unavailable"),
      horizonReasons,
      fitEvidenceIds([resetStatus])
    ));

    var classRule = context.fitPolicy.vehicleClassRules.find(function (rule) {
      return rule.vehicleClass === context.input.controls.vehicleClass;
    });
    var legalStatus = staticStatus("legal-structure", "REQUIRED_FACT_MISSING");
    var mechanismStatus = staticStatus("exposure-mechanism", "REQUIRED_FACT_MISSING");
    var structureStatuses = [legalStatus, mechanismStatus];
    var structureMismatch = legalStatus.state === "ready" && mechanismStatus.state === "ready" &&
      (!contains(classRule.allowedLegalStructures, legalStatus.observation.value) || !contains(classRule.allowedExposureMechanisms, mechanismStatus.observation.value));
    var structureReasons = fitStatusReasons(structureStatuses);
    if (structureMismatch) structureReasons.unshift("STRUCTURE_INCOMPATIBLE");
    criteria.push(makeVehicleFitCriterion(
      "structure",
      structureMismatch ? "fail" : (structureReasons.length === 0 ? "pass" : "unavailable"),
      structureReasons,
      fitEvidenceIds(structureStatuses)
    ));

    var leverageStatus = staticStatus("leverage", "REQUIRED_FACT_MISSING");
    var leverageStatuses = [leverageStatus, resetStatus];
    var leverageReasons = fitStatusReasons(leverageStatuses);
    var leverageFailed = leverageStatus.state === "ready" && resetStatus.state === "ready" &&
      (!contains(classRule.allowedLeverageValues, leverageStatus.observation.value) || !contains(classRule.allowedResetPolicyValues, resetStatus.observation.value));
    if (leverageFailed) leverageReasons.unshift("STRUCTURE_INCOMPATIBLE");
    var dailyReset = resetStatus.state === "ready" && resetStatus.observation.value === "daily";
    if (dailyReset) {
      if (!contains(context.fitPolicy.dailyResetVehicleIds, vehicle.vehicleId)) {
        leverageFailed = true;
        leverageReasons.unshift("STRUCTURE_INCOMPATIBLE");
      }
      if (context.input.controls.dailyResetPermission !== "permit-tactical") {
        leverageFailed = true;
        leverageReasons.unshift("DAILY_RESET_NOT_PERMITTED");
      }
      if (context.input.controls.horizon !== "tactical") {
        leverageFailed = true;
        leverageReasons.unshift("HORIZON_INCOMPATIBLE");
      }
      var resetSessionStatus = observationForFact("reset-session", "RESET_SESSION_UNAVAILABLE");
      leverageStatuses.push(resetSessionStatus);
      if (resetSessionStatus.state !== "ready" || Date.parse(context.input.decisionTime) >= Date.parse(resetSessionStatus.observation.value.resetSessionEndsAt)) {
        leverageReasons.push("RESET_SESSION_UNAVAILABLE");
      }
    }
    leverageReasons = uniqueVehicleReasonCodes(leverageReasons);
    criteria.push(makeVehicleFitCriterion(
      "leverage-reset",
      leverageFailed ? "fail" : (leverageReasons.length === 0 ? "pass" : "unavailable"),
      leverageReasons,
      fitEvidenceIds(leverageStatuses)
    ));

    criteria.push(evaluateVehicleThresholdCriterion("liquidity", context.liquidityPolicy, vehicle, observationForFact, context.input.decisionTime, context.sourcePoliciesById));
    criteria.push(evaluateVehicleThresholdCriterion("cost", context.costPolicy, vehicle, observationForFact, context.input.decisionTime, context.sourcePoliciesById));

    var requiredStatuses = context.fitPolicy.requiredStaticFactKinds.map(function (factKind) {
      return staticStatus(factKind, "REQUIRED_FACT_MISSING");
    });
    var coverageReasons = fitStatusReasons(requiredStatuses);
    criteria.push(makeVehicleFitCriterion("fact-coverage", coverageReasons.length === 0 ? "pass" : "unavailable", coverageReasons, fitEvidenceIds(requiredStatuses)));

    var trackingRead = context.trackingReadsByVehicleId[vehicle.vehicleId] || null;
    var trackingReasons = [];
    var trackingCriterionState = "pass";
    if (!trackingRead || trackingRead.ticker !== vehicle.ticker || trackingRead.horizon !== context.input.controls.horizon) {
      trackingCriterionState = "unavailable";
      trackingReasons.push("TRACKING_EVIDENCE_INCOMPLETE");
    } else if (!trackingRead.observationSet || !trackingRead.observationSet.coverage || !Number.isInteger(trackingRead.observationSet.coverage.commonRowCount) || trackingRead.observationSet.coverage.commonRowCount < context.trackingPolicy.minimumCommonDateCount) {
      trackingCriterionState = "unavailable";
      trackingReasons.push("TRACKING_EVIDENCE_INCOMPLETE");
    } else if (trackingRead.state === "Unavailable" || (trackingRead.freshUntil !== null && Date.parse(context.input.decisionTime) > Date.parse(trackingRead.freshUntil))) {
      trackingCriterionState = "unavailable";
      trackingReasons.push(trackingRead.unavailableReason === null ? "TRACKING_EVIDENCE_INCOMPLETE" : trackingRead.unavailableReason);
    } else if (contains(context.fitPolicy.cautionTrackingStates, trackingRead.state)) {
      trackingCriterionState = "caution";
      if (trackingRead.state === "Indeterminate") trackingReasons.push(trackingRead.unavailableReason === null ? "TRACKING_EVIDENCE_INCOMPLETE" : trackingRead.unavailableReason);
    } else if (trackingRead.unexplainedResidual !== null && Math.abs(trackingRead.unexplainedResidual.value) > context.trackingPolicy.maximumAbsoluteUnexplainedResidual) {
      trackingCriterionState = "caution";
      trackingReasons.push("TRACKING_EVIDENCE_INCOMPLETE");
    }
    criteria.push(makeVehicleFitCriterion("tracking", trackingCriterionState, trackingReasons, []));

    if (criteria.map(function (criterion) { return criterion.criterion; }).join("|") !== context.fitPolicy.criterionOrder.join("|")) {
      throw schemaError("RLFX_FIT_POLICY_INVALID", "$vehicleFit.criteria", "fit criteria do not match policy order");
    }
    var hasFailure = criteria.some(function (criterion) { return criterion.state === "fail"; });
    var hasUnavailable = criteria.some(function (criterion) { return criterion.state === "unavailable"; });
    var hasCaution = criteria.some(function (criterion) { return criterion.state === "caution"; });
    var state = hasFailure ? "Rejected" : (hasUnavailable ? "Unavailable" : (dailyReset ? "Tactical-Only" : (hasCaution ? "Caution" : "Eligible")));
    var reasonCodes = uniqueVehicleReasonCodes([].concat.apply([], criteria.map(function (criterion) { return criterion.reasonCodes; })));
    var evidenceIds = [].concat.apply([], criteria.map(function (criterion) { return criterion.evidenceObservationIds; }));
    var evidenceObservations = evidenceIds.map(function (observationId) { return context.observationsById[observationId]; }).filter(Boolean);
    var wrapperStatuses = [legalStatus, mechanismStatus, leverageStatus, resetStatus];
    var wrapperUnavailable = fitStatusReasons(wrapperStatuses);
    var materialWrapperCaveat = wrapperUnavailable.length === 0 ?
      "legal-structure=" + legalStatus.observation.value + "; exposure-mechanism=" + mechanismStatus.observation.value + "; leverage=" + leverageStatus.observation.value + "; reset-policy=" + resetStatus.observation.value :
      "Wrapper evidence unavailable: " + wrapperUnavailable.join(", ");
    var evaluation = {
      vehicleId: vehicle.vehicleId,
      ticker: vehicle.ticker,
      state: state,
      criteria: criteria,
      reasonCodes: reasonCodes,
      materialWrapperCaveat: materialWrapperCaveat,
      factCutoff: oldestFitClock(evidenceObservations, "observedAsOf", trackingRead),
      freshUntil: oldestFitClock(evidenceObservations, "freshUntil", trackingRead),
      trackingReadId: trackingRead ? trackingRead.trackingReadId : null
    };
    var trackingTier = trackingRead ? context.fitPolicy.trackingTierOrder.indexOf(trackingRead.state) : -1;
    return {
      evaluation: evaluation,
      registryIndex: registryIndex,
      semanticRank: [
        context.fitPolicy.stateTierOrder.indexOf(state),
        criteria[1].state === "pass" && criteria[2].state === "pass" ? 0 : 1,
        criteria[4].state === "pass" && criteria[5].state === "pass" ? 0 : 1,
        criteria[8].state === "pass" ? 0 : 1,
        trackingTier,
        criteria[6].state === "pass" ? 0 : 1,
        criteria[7].state === "pass" ? 0 : 1
      ]
    };
  }

  function compareVehicleRank(left, right) {
    for (var index = 0; index < left.semanticRank.length; index += 1) {
      if (left.semanticRank[index] !== right.semanticRank[index]) return left.semanticRank[index] - right.semanticRank[index];
    }
    return left.registryIndex - right.registryIndex;
  }

  function sameVehicleSemanticRank(left, right) {
    return left.semanticRank.every(function (value, index) { return value === right.semanticRank[index]; });
  }

  function computeVehicleFitRead(input) {
    requireObject(input, "$vehicleFit");
    exactKeys(input, ["decisionTime", "universe", "objective", "controls", "observations", "trackingReads"], "$vehicleFit");
    requireIso(input.decisionTime, "$vehicleFit.decisionTime");
    requireObject(input.objective, "$vehicleFit.objective");
    exactKeys(input.objective, ["kind", "subjectId", "direction"], "$vehicleFit.objective");
    requireEnum(input.objective.kind, VEHICLE_OBJECTIVE_KINDS, "$vehicleFit.objective.kind");
    requireNonEmptyString(input.objective.subjectId, "RLFX_FIT_POLICY_INVALID");
    requireNonEmptyString(input.objective.direction, "RLFX_FIT_POLICY_INVALID");
    requireObject(input.controls, "$vehicleFit.controls");
    exactKeys(input.controls, ["horizon", "vehicleClass", "dailyResetPermission", "liquidityPolicyId", "costPolicyId"], "$vehicleFit.controls");
    requireEnum(input.controls.horizon, VEHICLE_HORIZONS, "$vehicleFit.controls.horizon");
    requireEnum(input.controls.vehicleClass, VEHICLE_CLASSES, "$vehicleFit.controls.vehicleClass");
    requireEnum(input.controls.dailyResetPermission, VEHICLE_RESET_PERMISSIONS, "$vehicleFit.controls.dailyResetPermission");
    requireNonEmptyString(input.controls.liquidityPolicyId, "RLFX_FIT_POLICY_INVALID");
    requireNonEmptyString(input.controls.costPolicyId, "RLFX_FIT_POLICY_INVALID");
    requireArray(input.observations, "$vehicleFit.observations");
    requireArray(input.trackingReads, "$vehicleFit.trackingReads");

    var universeValidation = validateVehicleUniverse(input.universe);
    if (!universeValidation.ok) throw schemaError("RLFX_FIT_POLICY_INVALID", "$vehicleFit.universe", universeValidation.errors[0].message);
    var universe = universeValidation.value;
    var sourcePoliciesById = {};
    var vehiclesById = {};
    universe.sourcePolicies.forEach(function (policy) { sourcePoliciesById[policy.policyId] = policy; });
    universe.vehicles.forEach(function (vehicle) { vehiclesById[vehicle.vehicleId] = vehicle; });
    var trackingPolicy = universe.policies.trackingPolicies.find(function (policy) { return policy.policyId === universe.policies.trackingPolicyId; });
    var fitPolicy = universe.policies.fitPolicies.find(function (policy) { return policy.policyId === universe.policies.fitPolicyId; });
    var liquidityPolicy = universe.policies.liquidityPolicies.find(function (policy) { return policy.policyId === input.controls.liquidityPolicyId; });
    var costPolicy = universe.policies.costPolicies.find(function (policy) { return policy.policyId === input.controls.costPolicyId; });
    if (!trackingPolicy || !fitPolicy || !liquidityPolicy || !costPolicy) throw schemaError("RLFX_FIT_POLICY_INVALID", "$vehicleFit.controls", "selected vehicle policy does not resolve");

    var observationsById = {};
    universe.observations.forEach(function (observation) { observationsById[observation.observationId] = observation; });
    input.observations.forEach(function (observation, index) {
      validateFitObservation(observation, "$vehicleFit.observations[" + index + "]", vehiclesById, sourcePoliciesById);
      if (input.observations.slice(0, index).some(function (prior) { return prior.observationId === observation.observationId; })) {
        throw schemaError("RLFX_FIT_POLICY_INVALID", "$vehicleFit.observations[" + index + "].observationId", "duplicate fit observation ID");
      }
      observationsById[observation.observationId] = observation;
    });
    var observations = Object.keys(observationsById).map(function (observationId) { return observationsById[observationId]; });

    var trackingReadsByVehicleId = {};
    input.trackingReads.forEach(function (read, index) {
      validateFitTrackingRead(read, "$vehicleFit.trackingReads[" + index + "]");
      if (!vehiclesById[read.vehicleId] || vehiclesById[read.vehicleId].ticker !== read.ticker) throw schemaError("RLFX_TRACKING_INPUT_INVALID", "$vehicleFit.trackingReads[" + index + "]", "tracking read vehicle identity is unknown or mismatched");
      if (trackingReadsByVehicleId[read.vehicleId]) throw schemaError("RLFX_TRACKING_INPUT_INVALID", "$vehicleFit.trackingReads[" + index + "].vehicleId", "duplicate tracking read");
      trackingReadsByVehicleId[read.vehicleId] = read;
    });

    var context = {
      input: input,
      observations: observations,
      observationsById: observationsById,
      sourcePoliciesById: sourcePoliciesById,
      trackingReadsByVehicleId: trackingReadsByVehicleId,
      trackingPolicy: trackingPolicy,
      fitPolicy: fitPolicy,
      liquidityPolicy: liquidityPolicy,
      costPolicy: costPolicy
    };
    var ranked = universe.vehicles.map(function (vehicle, index) {
      return evaluateVehicleFit(vehicle, index, context);
    });
    var evaluations = ranked.map(function (entry) { return entry.evaluation; });
    var candidates = ranked.filter(function (entry) { return contains(VEHICLE_FIT_STATE_TIERS, entry.evaluation.state); }).sort(compareVehicleRank);
    var potentiallyMatchingUnavailable = ranked.filter(function (entry) { return entry.evaluation.state === "Unavailable"; });
    var aggregateState;
    var selectedEntry = null;
    var aggregateReasons = [];
    if (candidates.length > 1 && sameVehicleSemanticRank(candidates[0], candidates[1])) {
      aggregateState = "Unavailable";
      aggregateReasons = ["FIT_TIE"];
    } else if (potentiallyMatchingUnavailable.length !== 0) {
      aggregateState = "Unavailable";
      aggregateReasons = uniqueVehicleReasonCodes([].concat.apply([], potentiallyMatchingUnavailable.map(function (entry) { return entry.evaluation.reasonCodes; })));
    } else if (candidates.length === 0) {
      aggregateState = "No Eligible Vehicle";
      aggregateReasons = ["NO_ELIGIBLE_VEHICLE"];
    } else {
      selectedEntry = candidates[0];
      aggregateState = selectedEntry.evaluation.state;
      aggregateReasons = selectedEntry.evaluation.reasonCodes.slice();
    }
    var result = {
      contractVersion: "rlfx-vehicle-fit-read/v1",
      fitReadId: "",
      objective: cloneCanonical(input.objective),
      controls: cloneCanonical(input.controls),
      state: aggregateState,
      selectedVehicleId: selectedEntry ? selectedEntry.evaluation.vehicleId : null,
      selected: selectedEntry ? cloneCanonical(selectedEntry.evaluation) : null,
      evaluations: evaluations,
      eligibleVehicleIds: evaluations.filter(function (evaluation) { return contains(VEHICLE_FIT_STATE_TIERS, evaluation.state); }).map(function (evaluation) { return evaluation.vehicleId; }),
      rejectedVehicleIds: evaluations.filter(function (evaluation) { return evaluation.state === "Rejected"; }).map(function (evaluation) { return evaluation.vehicleId; }),
      unavailableVehicleIds: evaluations.filter(function (evaluation) { return evaluation.state === "Unavailable"; }).map(function (evaluation) { return evaluation.vehicleId; }),
      reasonCodes: aggregateReasons,
      evidenceCutoff: oldestFitClock(evaluations.map(function (evaluation) { return { kind: "fit-evaluation", observedAsOf: evaluation.factCutoff }; }), "observedAsOf", null),
      freshUntil: oldestFitClock(evaluations.map(function (evaluation) { return { kind: "fit-evaluation", freshUntil: evaluation.freshUntil }; }), "freshUntil", null),
      confirmation: selectedEntry ? "Confirm the objective and every selected vehicle criterion against the current evidence identity." : "Confirm the currency thesis without substituting an ineligible or unavailable vehicle.",
      invalidation: selectedEntry ? "Invalidate the selection when any required fact, policy threshold, tracking state, direction, or reset session ceases to pass." : "Selection remains invalid until the exact rejected or unavailable criteria change under current evidence.",
      limitations: [
        "Vehicle fit evaluates the closed registry once in registry order under explicit versioned policies.",
        "Vehicle price momentum is not an objective input and cannot create or reverse the currency thesis.",
        "Registry order stabilizes evaluation output but never resolves a semantic selection tie."
      ]
    };
    result.fitReadId = "vehicle-fit-v1-" + decisionId({
      decisionTime: input.decisionTime,
      universeVersion: universe.version,
      trackingPolicyId: trackingPolicy.policyId,
      fitPolicyId: fitPolicy.policyId,
      result: cloneCanonical(result)
    }).slice("fxd-v1-".length);
    return deepFreeze(result);
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

  function requireDeepFrozen(value, path) {
    if (!value || typeof value !== "object") return;
    if (!Object.isFrozen(value)) throw schemaError("RLFX_OWNER_INPUT_INVALID", path, "a deeply frozen computed input is required");
    Object.keys(value).forEach(function (key) {
      requireDeepFrozen(value[key], path + "." + key);
    });
  }

  function validateOwnerControls(controls) {
    requireObject(controls, "$fxOwner.controls");
    exactKeys(controls, [
      "objective", "subjectId", "cohort", "horizon", "pairMode", "base", "quote",
      "vehicleClass", "dailyResetPermission", "liquidityPolicyId", "costPolicyId",
      "evidenceLens", "dollarComparison"
    ], "$fxOwner.controls");
    requireEnum(controls.objective, VEHICLE_OBJECTIVE_KINDS, "$fxOwner.controls.objective");
    requireNonEmptyString(controls.subjectId, "RLFX_OWNER_INPUT_INVALID");
    requireEnum(controls.cohort, COHORTS, "$fxOwner.controls.cohort");
    requireEnum(controls.horizon, VEHICLE_HORIZONS, "$fxOwner.controls.horizon");
    requireEnum(controls.pairMode, ["auto", "explicit"], "$fxOwner.controls.pairMode");
    requireNullableString(controls.base, "$fxOwner.controls.base");
    requireNullableString(controls.quote, "$fxOwner.controls.quote");
    requireEnum(controls.vehicleClass, VEHICLE_CLASSES, "$fxOwner.controls.vehicleClass");
    requireEnum(controls.dailyResetPermission, VEHICLE_RESET_PERMISSIONS, "$fxOwner.controls.dailyResetPermission");
    requireNonEmptyString(controls.liquidityPolicyId, "RLFX_OWNER_INPUT_INVALID");
    requireNonEmptyString(controls.costPolicyId, "RLFX_OWNER_INPUT_INVALID");
    requireEnum(controls.evidenceLens, ["balanced", "trend", "risk"], "$fxOwner.controls.evidenceLens");
    requireEnum(controls.dollarComparison, ["Broad", "AFE", "EME"], "$fxOwner.controls.dollarComparison");
  }

  function validateOwnerCurrencyDecision(currencyDecision, decisionTime, controls) {
    requireObject(currencyDecision, "$fxOwner.currencyDecision");
    requireDeepFrozen(currencyDecision, "$fxOwner.currencyDecision");
    if (currencyDecision.contractVersion !== "rlfx-decision-read/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$fxOwner.currencyDecision.contractVersion", "unknown currency decision contract");
    requireNonEmptyString(currencyDecision.decisionId, "RLFX_OWNER_INPUT_INVALID");
    requireNonEmptyString(currencyDecision.configVersion, "RLFX_OWNER_INPUT_INVALID");
    requireIso(currencyDecision.computedAt, "$fxOwner.currencyDecision.computedAt");
    if (currencyDecision.computedAt !== decisionTime) throw schemaError("RLFX_OWNER_INPUT_INVALID", "$fxOwner.currencyDecision.computedAt", "currency decision time must equal the owner decision time");
    requireObject(currencyDecision.controls, "$fxOwner.currencyDecision.controls");
    ["cohort", "horizon", "pairMode", "base", "quote", "evidenceLens", "dollarComparison"].forEach(function (field) {
      if (canonicalize(currencyDecision.controls[field]) !== canonicalize(controls[field])) {
        throw schemaError("RLFX_OWNER_INPUT_INVALID", "$fxOwner.controls." + field, "owner controls must preserve the computed currency decision controls");
      }
    });
    requireEnum(currencyDecision.state, ["ready", "partial", "indeterminate", "unavailable"], "$fxOwner.currencyDecision.state");
    requireObject(currencyDecision.broadDollar, "$fxOwner.currencyDecision.broadDollar");
    requireObject(currencyDecision.cohorts, "$fxOwner.currencyDecision.cohorts");
    requireObject(currencyDecision.pair, "$fxOwner.currencyDecision.pair");
    requireObject(currencyDecision.coverage, "$fxOwner.currencyDecision.coverage");
    requireNonEmptyString(currencyDecision.confirmation, "RLFX_OWNER_INPUT_INVALID");
    requireNonEmptyString(currencyDecision.invalidation, "RLFX_OWNER_INPUT_INVALID");
    requireNullableIso(currencyDecision.asOf, "$fxOwner.currencyDecision.asOf");
    requireNullableIso(currencyDecision.freshUntil, "$fxOwner.currencyDecision.freshUntil");
    requireStringArray(currencyDecision.limitations, "$fxOwner.currencyDecision.limitations", false);
  }

  function ownerVehicleObjective(controls) {
    var direction;
    if (controls.objective === "foreign-currency-strength") direction = "long-" + controls.subjectId + "/short-USD";
    else if (controls.objective === "dollar-strength" && controls.vehicleClass === "tactical-daily-reset") direction = "short-" + controls.subjectId + "/long-USD";
    else if (controls.objective === "dollar-strength") direction = "long-USD";
    else if (controls.objective === "dollar-weakness") direction = "short-USD";
    else if (controls.objective === "diversified-em-currency") direction = "long-diversified-EM-currency-basket";
    else {
      if (controls.base === null || controls.quote === null) throw schemaError("RLFX_OWNER_INPUT_INVALID", "$fxOwner.controls", "compare-wrappers requires an explicit pair direction");
      direction = "long-" + controls.base + "/short-" + controls.quote;
    }
    return {
      kind: controls.objective,
      subjectId: controls.subjectId,
      direction: direction
    };
  }

  function ownerFitControls(controls) {
    return {
      horizon: controls.horizon,
      vehicleClass: controls.vehicleClass,
      dailyResetPermission: controls.dailyResetPermission,
      liquidityPolicyId: controls.liquidityPolicyId,
      costPolicyId: controls.costPolicyId
    };
  }

  function ownerConsumedObservations(universe, observations) {
    var byId = {};
    universe.observations.forEach(function (observation) { byId[observation.observationId] = observation; });
    observations.forEach(function (observation) { byId[observation.observationId] = observation; });
    return Object.keys(byId).sort().map(function (observationId) { return byId[observationId]; });
  }

  function ownerObservationIdentity(observation, includeRetrievalOccurrence) {
    var identity = {
      observationId: observation.observationId,
      vehicleId: observation.vehicleId,
      ticker: observation.ticker,
      factKind: observation.factKind,
      sourcePolicyId: observation.sourcePolicyId,
      kind: observation.kind,
      availability: observation.availability,
      observedAsOf: observation.observedAsOf,
      revisionId: observation.revisionId,
      unavailableReason: observation.kind === "unavailable" ? observation.unavailableReason : null,
      semanticValue: observation.kind === "scalar" ? cloneCanonical(observation.value) : (observation.kind === "series" ? cloneCanonical(observation.series) : null)
    };
    if (includeRetrievalOccurrence) {
      identity.retrievedAt = observation.retrievedAt;
      identity.freshUntil = observation.freshUntil;
    }
    return identity;
  }

  function ownerResetSessions(observations) {
    return observations.filter(function (observation) {
      return observation.factKind === "reset-session" && observation.kind === "scalar" && isPlainObject(observation.value);
    }).map(function (observation) {
      return {
        vehicleId: observation.vehicleId,
        observationId: observation.observationId,
        revisionId: observation.revisionId,
        availability: observation.availability,
        resetSessionId: observation.value.resetSessionId,
        resetSessionEndsAt: observation.value.resetSessionEndsAt
      };
    }).sort(function (left, right) { return left.vehicleId.localeCompare(right.vehicleId); });
  }

  function ownerTrackingMap(trackingReads) {
    var result = {};
    trackingReads.slice().sort(function (left, right) { return left.vehicleId.localeCompare(right.vehicleId); }).forEach(function (read) {
      result[read.vehicleId] = read;
    });
    return result;
  }

  function ownerTrackingSemanticIdentity(read) {
    return {
      vehicleId: read.vehicleId,
      ticker: read.ticker,
      horizon: read.horizon,
      state: read.state,
      observationSetId: read.observationSet && typeof read.observationSet.setId === "string" ? read.observationSet.setId : null,
      returnBasis: cloneCanonical(read.returnBasis),
      returns: cloneCanonical(read.returns),
      observedDifferences: cloneCanonical(read.observedDifferences),
      unexplainedResidual: cloneCanonical(read.unexplainedResidual),
      evidenceCutoff: read.evidenceCutoff,
      unavailableReason: read.unavailableReason
    };
  }

  function ownerFitSemanticIdentity(vehicleFit) {
    return {
      objective: cloneCanonical(vehicleFit.objective),
      controls: cloneCanonical(vehicleFit.controls),
      state: vehicleFit.state,
      selectedVehicleId: vehicleFit.selectedVehicleId,
      evaluations: vehicleFit.evaluations.map(function (evaluation) {
        return {
          vehicleId: evaluation.vehicleId,
          ticker: evaluation.ticker,
          state: evaluation.state,
          criteria: evaluation.criteria.map(function (criterion) {
            return {
              criterion: criterion.criterion,
              state: criterion.state,
              reasonCodes: criterion.reasonCodes.slice(),
              evidenceObservationIds: criterion.evidenceObservationIds.slice()
            };
          }),
          reasonCodes: evaluation.reasonCodes.slice(),
          materialWrapperCaveat: evaluation.materialWrapperCaveat,
          factCutoff: evaluation.factCutoff
        };
      }),
      eligibleVehicleIds: vehicleFit.eligibleVehicleIds.slice(),
      rejectedVehicleIds: vehicleFit.rejectedVehicleIds.slice(),
      unavailableVehicleIds: vehicleFit.unavailableVehicleIds.slice(),
      reasonCodes: vehicleFit.reasonCodes.slice(),
      evidenceCutoff: vehicleFit.evidenceCutoff,
      confirmation: vehicleFit.confirmation,
      invalidation: vehicleFit.invalidation
    };
  }

  function requiredOwnerClock(values) {
    if (values.some(function (value) { return value === null; })) return null;
    return values.slice().sort()[0];
  }

  function ownerState(currencyDecision, vehicleFit, decisionTime, evidenceCutoff, freshUntil) {
    var fitConclusive = contains(VEHICLE_FIT_STATE_TIERS.concat(["No Eligible Vehicle"]), vehicleFit.state);
    var clocksCurrent = evidenceCutoff !== null && freshUntil !== null && Date.parse(decisionTime) <= Date.parse(freshUntil);
    if (currencyDecision.state === "unavailable") return "unavailable";
    if (vehicleFit.state === "Unavailable") return currencyDecision.state === "ready" ? "partial" : "unavailable";
    if (!fitConclusive || !clocksCurrent) return currencyDecision.state === "indeterminate" ? "indeterminate" : "partial";
    if (currencyDecision.state === "ready") return "ready";
    if (currencyDecision.state === "partial") return "partial";
    return "indeterminate";
  }

  function ownerDecisionText(currencyDecision, vehicleFit) {
    var currencyState = currencyDecision.broadDollar.state + "; pair " + currencyDecision.pair.state;
    if (vehicleFit.selected !== null) {
      return currencyState + ". Selected vehicle " + vehicleFit.selected.ticker + " is " + vehicleFit.state + " under the explicit owner controls.";
    }
    if (vehicleFit.state === "No Eligible Vehicle") {
      return currencyState + ". No Eligible Vehicle satisfies the explicit objective, horizon, structure, liquidity, and cost controls.";
    }
    return currencyState + ". Vehicle fit is unavailable because required current facts do not support a selection.";
  }

  function ownerLimitations(currencyDecision, vehicleFit) {
    var values = currencyDecision.limitations.concat(vehicleFit.limitations).concat([
      "Educational research only; execution is unavailable.",
      "A listed vehicle remains distinct from spot currency and retains its wrapper limitations."
    ]);
    return values.filter(function (value, index) { return values.indexOf(value) === index; });
  }

  function uniqueRecommendationReasonCodes(values) {
    var result = [];
    values.forEach(function (value) {
      if (typeof value === "string" && value.trim() !== "" && result.indexOf(value) === -1) result.push(value);
    });
    return result;
  }

  function vehicleOutcomeReasonCodes(vehicleFit) {
    var reasons = vehicleFit.reasonCodes.slice();
    vehicleFit.evaluations.forEach(function (evaluation) {
      reasons = reasons.concat(evaluation.reasonCodes);
    });
    return uniqueRecommendationReasonCodes(reasons);
  }

  function ownerEvidenceReferenceIds(consumedObservations) {
    return consumedObservations.map(function (observation) {
      return observation.observationId;
    }).filter(function (observationId, index, values) {
      return values.indexOf(observationId) === index;
    }).sort();
  }

  function validateRecommendationEvidenceEnvelope(value) {
    if (value === null) return;
    requireObject(value, "$recommendationEvidence");
    exactRequiredKeys(value, [
      "contractVersion", "economicDirection", "marketObservation",
      "trigger", "invalidation", "provenance"
    ], "$recommendationEvidence");
    if (value.contractVersion !== "rlfx-attributable-recommendation-evidence/v1") {
      throw schemaError("RLFX_CONTRACT_VERSION", "$recommendationEvidence.contractVersion", "unknown attributable recommendation evidence contract");
    }
  }

  function recommendationDirectionResult(value, expectedExposure) {
    if (value === null || typeof value === "undefined") return { value: null, reasonCodes: ["ECONOMIC_DIRECTION_MISSING"] };
    try {
      var direction = normalizeEconomicDirection(value, "$recommendationEvidence.economicDirection");
      if (direction.exposure !== expectedExposure) return { value: direction, reasonCodes: ["ECONOMIC_DIRECTION_MISMATCH"] };
      return { value: direction, reasonCodes: [] };
    } catch (_error) {
      return { value: null, reasonCodes: ["ECONOMIC_DIRECTION_INVALID"] };
    }
  }

  function recommendationProvenanceResult(value, ownerEvidenceRefs) {
    if (!Array.isArray(value) || value.length === 0) return { value: [], reasonCodes: ["PROVENANCE_MISSING"] };
    try {
      return {
        value: normalizeRecommendationProvenance(value, "$recommendationEvidence.provenance", ownerEvidenceRefs, false),
        reasonCodes: []
      };
    } catch (error) {
      var reason = error && error.path && error.path.indexOf("evidenceRef") !== -1 ? "PROVENANCE_UNATTRIBUTABLE" : "PROVENANCE_INVALID";
      return { value: [], reasonCodes: [reason] };
    }
  }

  function recommendationMarketResult(observation, selected, ownerEvidenceRefs, decisionTime) {
    if (observation === null || typeof observation === "undefined") {
      return { instrument: null, reasonCodes: ["MARKET_EVIDENCE_MISSING"] };
    }
    try {
      requireObject(observation, "$recommendationEvidence.marketObservation");
      requireDeepFrozen(observation, "$recommendationEvidence.marketObservation");
      validateVehicleObservationShape(observation, "$recommendationEvidence.marketObservation", true);
    } catch (_error) {
      return { instrument: null, reasonCodes: ["MARKET_EVIDENCE_INVALID"] };
    }
    var reasons = [];
    if (observation.kind !== "series" || observation.factKind !== "market-price" || observation.series.returnBasis !== "market-price" || observation.series.adjustment === "not-applicable") {
      reasons.push("MARKET_SERIES_INELIGIBLE");
    }
    if (observation.vehicleId !== selected.vehicleId || observation.ticker !== selected.ticker) reasons.push("MARKET_INSTRUMENT_MISMATCH");
    if (!contains(ALLOWED_RIGHTS, observation.rights)) reasons.push("MARKET_RIGHTS_INELIGIBLE");
    if (!contains(["fresh", "revised"], observation.availability) || observation.freshUntil === null || Date.parse(decisionTime) > Date.parse(observation.freshUntil)) {
      reasons.push("MARKET_EVIDENCE_STALE");
    }
    if (!contains(ownerEvidenceRefs, observation.observationId)) reasons.push("MARKET_EVIDENCE_UNATTRIBUTABLE");
    var instrument = observation.kind === "series" ? {
      vehicleId: observation.vehicleId,
      ticker: observation.ticker,
      marketSeriesId: observation.series.seriesId
    } : null;
    return { instrument: instrument, reasonCodes: uniqueRecommendationReasonCodes(reasons) };
  }

  function gateOutcomeReasonCode(prefix, error) {
    var path = error && typeof error.path === "string" ? error.path : "";
    var suffix = error && error.message === "required key is missing" ? "_MISSING" : "_INVALID";
    if (path.indexOf(".instrument") !== -1) return prefix + "_INSTRUMENT" + suffix;
    if (path.indexOf(".relation") !== -1) return prefix + "_RELATION" + suffix;
    if (path.indexOf(".level") !== -1) return prefix + "_LEVEL" + suffix;
    if (path.indexOf(".observationBasis") !== -1) return prefix + "_OBSERVATION_BASIS" + suffix;
    if (path.indexOf(".evidenceRefs") !== -1 || path.indexOf("ownerEvidenceRefs") !== -1) return prefix + "_EVIDENCE" + suffix;
    if (path.indexOf("marketObservation.rights") !== -1) return "MARKET_RIGHTS_INELIGIBLE";
    if (path.indexOf("marketObservation.availability") !== -1) return "MARKET_EVIDENCE_STALE";
    return prefix + suffix;
  }

  function recommendationGateResult(value, prefix, context) {
    if (value === null || typeof value === "undefined") return { value: null, reasonCodes: [prefix + "_MISSING"] };
    try {
      return { value: normalizeAttributableLevelGate(value, context), reasonCodes: [] };
    } catch (error) {
      if (error && (error.code === "RLFX_CONTRACT_VERSION" || error.message === "unknown key")) throw error;
      return { value: null, reasonCodes: [gateOutcomeReasonCode(prefix, error)] };
    }
  }

  function knownOwnerEconomicDirection(ownerDecision) {
    var exposure = ownerDecision.vehicleFit && ownerDecision.vehicleFit.objective ? ownerDecision.vehicleFit.objective.direction : null;
    if (typeof exposure !== "string" || exposure.trim() === "") return null;
    if (exposure.indexOf("long-") === 0) return { instrumentSide: "long", exposure: exposure };
    if (exposure.indexOf("short-") === 0) return { instrumentSide: "short", exposure: exposure };
    return null;
  }

  function nonRecommendationOutcome(ownerDecision, outcome, reasonCodes, direction, provenance) {
    return normalizeRecommendationOutcome({
      contractVersion: "rlfx-recommendation-outcome/v1",
      outcome: outcome,
      objective: ownerDecision.controls.objective,
      economicDirection: direction,
      horizon: ownerDecision.controls.horizon,
      reasonCodes: uniqueRecommendationReasonCodes(reasonCodes),
      evidenceIdentity: ownerDecision.evidenceIdentity,
      evidenceCutoff: ownerDecision.evidenceCutoff,
      provenance: provenance,
      ownerDeepLink: RECOMMENDATION_OWNER_DEEP_LINK,
      evaluability: "non-recommendation",
      confidencePct: Number.isFinite(ownerDecision.currencyDecision.confidencePct) ? ownerDecision.currencyDecision.confidencePct : null,
      educationalOnly: true,
      executionAvailable: false
    });
  }

  function computeRecommendationOutcome(input) {
    requireObject(input, "$recommendationOutcomeInput");
    exactRequiredKeys(input, ["ownerDecision", "ownerEvidenceRefs", "recommendationEvidence"], "$recommendationOutcomeInput");
    requireObject(input.ownerDecision, "$recommendationOutcomeInput.ownerDecision");
    requireDeepFrozen(input.ownerDecision, "$recommendationOutcomeInput.ownerDecision");
    requireObject(input.ownerDecision.controls, "$recommendationOutcomeInput.ownerDecision.controls");
    requireObject(input.ownerDecision.vehicleFit, "$recommendationOutcomeInput.ownerDecision.vehicleFit");
    requireObject(input.ownerDecision.currencyDecision, "$recommendationOutcomeInput.ownerDecision.currencyDecision");
    requireNonEmptyString(input.ownerDecision.evidenceIdentity, "RLFX_SCHEMA_INVALID");
    requireNullableIso(input.ownerDecision.evidenceCutoff, "$recommendationOutcomeInput.ownerDecision.evidenceCutoff");
    requireIso(input.ownerDecision.computedAt, "$recommendationOutcomeInput.ownerDecision.computedAt");
    requireUniqueStringArray(input.ownerEvidenceRefs, "$recommendationOutcomeInput.ownerEvidenceRefs", false);

    var fitReasons = vehicleOutcomeReasonCodes(input.ownerDecision.vehicleFit);
    var knownDirection = knownOwnerEconomicDirection(input.ownerDecision);
    if (input.ownerDecision.vehicleFit.state === "No Eligible Vehicle") {
      return nonRecommendationOutcome(
        input.ownerDecision,
        "no-vehicle",
        uniqueRecommendationReasonCodes(["NO_ELIGIBLE_VEHICLE"].concat(fitReasons)),
        knownDirection,
        []
      );
    }
    if (input.ownerDecision.vehicleFit.selected === null || !contains(VEHICLE_FIT_STATE_TIERS, input.ownerDecision.vehicleFit.state)) {
      return nonRecommendationOutcome(
        input.ownerDecision,
        "unavailable",
        uniqueRecommendationReasonCodes(["VEHICLE_FIT_UNAVAILABLE"].concat(fitReasons)),
        knownDirection,
        []
      );
    }

    var reasons = [];
    if (input.ownerDecision.state !== "ready") reasons.push("OWNER_EVIDENCE_INCOMPLETE");
    if (input.ownerDecision.evidenceCutoff === null) reasons.push("EVIDENCE_CUTOFF_MISSING");
    if (input.recommendationEvidence === null) {
      return nonRecommendationOutcome(
        input.ownerDecision,
        "unavailable",
        reasons.concat(["ATTRIBUTABLE_EVIDENCE_MISSING", "TRIGGER_MISSING", "INVALIDATION_MISSING"]),
        knownDirection,
        []
      );
    }
    validateRecommendationEvidenceEnvelope(input.recommendationEvidence);

    var evidence = input.recommendationEvidence;
    var directionResult = recommendationDirectionResult(evidence.economicDirection, input.ownerDecision.vehicleFit.objective.direction);
    var provenanceResult = recommendationProvenanceResult(evidence.provenance, input.ownerEvidenceRefs);
    var marketResult = recommendationMarketResult(evidence.marketObservation, input.ownerDecision.vehicleFit.selected, input.ownerEvidenceRefs, input.ownerDecision.computedAt);
    reasons = reasons.concat(directionResult.reasonCodes, provenanceResult.reasonCodes, marketResult.reasonCodes);

    var triggerResult = { value: null, reasonCodes: ["TRIGGER_MISSING"] };
    var invalidationResult = { value: null, reasonCodes: ["INVALIDATION_MISSING"] };
    if (marketResult.instrument !== null && marketResult.reasonCodes.length === 0) {
      var gateContext = {
        selectedInstrument: marketResult.instrument,
        marketObservation: evidence.marketObservation,
        ownerEvidenceRefs: input.ownerEvidenceRefs,
        decisionTime: input.ownerDecision.computedAt
      };
      triggerResult = recommendationGateResult(evidence.trigger, "TRIGGER", gateContext);
      invalidationResult = recommendationGateResult(evidence.invalidation, "INVALIDATION", gateContext);
    }
    reasons = reasons.concat(triggerResult.reasonCodes, invalidationResult.reasonCodes);
    if (triggerResult.value !== null && invalidationResult.value !== null && canonicalize(recommendationGateSemantics(triggerResult.value)) === canonicalize(recommendationGateSemantics(invalidationResult.value))) {
      reasons.push("TRIGGER_INVALIDATION_IDENTICAL");
    }
    reasons = uniqueRecommendationReasonCodes(reasons);
    if (reasons.length !== 0) {
      return nonRecommendationOutcome(input.ownerDecision, "unavailable", reasons, knownDirection, provenanceResult.value);
    }

    return normalizeRecommendationOutcome({
      contractVersion: "rlfx-recommendation-outcome/v1",
      outcome: "recommendation",
      instrument: marketResult.instrument,
      objective: input.ownerDecision.controls.objective,
      economicDirection: directionResult.value,
      horizon: input.ownerDecision.controls.horizon,
      trigger: triggerResult.value,
      invalidation: invalidationResult.value,
      evidenceIdentity: input.ownerDecision.evidenceIdentity,
      evidenceCutoff: input.ownerDecision.evidenceCutoff,
      provenance: provenanceResult.value,
      ownerDeepLink: RECOMMENDATION_OWNER_DEEP_LINK,
      evaluability: "machine-checkable",
      confidencePct: Number.isFinite(input.ownerDecision.currencyDecision.confidencePct) ? input.ownerDecision.currencyDecision.confidencePct : null,
      educationalOnly: true,
      executionAvailable: false
    });
  }

  function computeFxOwnerDecision(input) {
    requireObject(input, "$fxOwner");
    exactKeys(input, [
      "decisionTime", "currencyDecision", "vehicleUniverse", "vehicleObservations",
      "trackingReads", "controls", "fitPolicyId", "trackingPolicyId", "recommendationEvidence"
    ], "$fxOwner");
    requireIso(input.decisionTime, "$fxOwner.decisionTime");
    validateOwnerControls(input.controls);
    validateOwnerCurrencyDecision(input.currencyDecision, input.decisionTime, input.controls);
    requireArray(input.vehicleObservations, "$fxOwner.vehicleObservations");
    requireArray(input.trackingReads, "$fxOwner.trackingReads");
    input.vehicleObservations.forEach(function (observation, index) {
      requireDeepFrozen(observation, "$fxOwner.vehicleObservations[" + index + "]");
    });
    input.trackingReads.forEach(function (read, index) {
      requireDeepFrozen(read, "$fxOwner.trackingReads[" + index + "]");
    });
    requireNonEmptyString(input.fitPolicyId, "RLFX_OWNER_INPUT_INVALID");
    requireNonEmptyString(input.trackingPolicyId, "RLFX_OWNER_INPUT_INVALID");

    var universeValidation = validateVehicleUniverse(input.vehicleUniverse);
    if (!universeValidation.ok) throw schemaError("RLFX_OWNER_INPUT_INVALID", "$fxOwner.vehicleUniverse", universeValidation.errors[0].message);
    var universe = universeValidation.value;
    if (input.fitPolicyId !== universe.policies.fitPolicyId) throw schemaError("RLFX_OWNER_INPUT_INVALID", "$fxOwner.fitPolicyId", "fit policy identity must match the validated vehicle universe");
    if (input.trackingPolicyId !== universe.policies.trackingPolicyId) throw schemaError("RLFX_OWNER_INPUT_INVALID", "$fxOwner.trackingPolicyId", "tracking policy identity must match the validated vehicle universe");

    var vehicleFit = computeVehicleFitRead({
      decisionTime: input.decisionTime,
      universe: universe,
      objective: ownerVehicleObjective(input.controls),
      controls: ownerFitControls(input.controls),
      observations: input.vehicleObservations,
      trackingReads: input.trackingReads
    });
    var consumedObservations = ownerConsumedObservations(universe, input.vehicleObservations);
    var trackingReads = ownerTrackingMap(input.trackingReads);
    var resetSessions = ownerResetSessions(consumedObservations);
    var configVersions = {
      currencyUniverse: input.currencyDecision.configVersion,
      vehicleUniverse: universe.version,
      fitPolicy: input.fitPolicyId,
      trackingPolicy: input.trackingPolicyId
    };
    var controls = cloneCanonical(input.controls);
    var evidenceCutoff = requiredOwnerClock([input.currencyDecision.asOf, vehicleFit.evidenceCutoff]);
    var freshUntil = requiredOwnerClock([input.currencyDecision.freshUntil, vehicleFit.freshUntil]);
    var ownerEvidenceRefs = ownerEvidenceReferenceIds(consumedObservations);
    var semanticIdentity = {
      controls: controls,
      currencyDecisionId: input.currencyDecision.decisionId,
      configVersions: configVersions,
      observations: consumedObservations.map(function (observation) { return ownerObservationIdentity(observation, false); }),
      tracking: input.trackingReads.slice().sort(function (left, right) { return left.vehicleId.localeCompare(right.vehicleId); }).map(ownerTrackingSemanticIdentity),
      fit: ownerFitSemanticIdentity(vehicleFit),
      resetSessions: resetSessions,
      evidenceCutoff: evidenceCutoff
    };
    var provisionalEvidenceIdentity = "fxe-v1-" + decisionId(semanticIdentity).slice("fxd-v1-".length);
    var ownerCore = deepFreeze({
      contractVersion: "rlfx-owner-decision/v1",
      ownerDecisionId: "",
      configVersions: configVersions,
      computedAt: input.decisionTime,
      controls: controls,
      currencyDecision: input.currencyDecision,
      vehicleFit: vehicleFit,
      trackingReads: trackingReads,
      state: ownerState(input.currencyDecision, vehicleFit, input.decisionTime, evidenceCutoff, freshUntil),
      ownerDecision: ownerDecisionText(input.currencyDecision, vehicleFit),
      evidenceIdentity: provisionalEvidenceIdentity,
      evidenceCutoff: evidenceCutoff,
      freshUntil: freshUntil,
      confirmation: input.currencyDecision.confirmation + " " + vehicleFit.confirmation,
      invalidation: input.currencyDecision.invalidation + " " + vehicleFit.invalidation,
      limitations: ownerLimitations(input.currencyDecision, vehicleFit)
    });
    var provisionalOutcome = computeRecommendationOutcome({
      ownerDecision: ownerCore,
      ownerEvidenceRefs: ownerEvidenceRefs,
      recommendationEvidence: Object.prototype.hasOwnProperty.call(input, "recommendationEvidence") ? input.recommendationEvidence : null
    });
    var outcomeIdentityMaterial = cloneCanonical(provisionalOutcome);
    outcomeIdentityMaterial.evidenceIdentity = null;
    var evidenceIdentity = "fxe-v1-" + decisionId({
      ownerEvidence: semanticIdentity,
      recommendationOutcome: outcomeIdentityMaterial
    }).slice("fxd-v1-".length);
    var finalOutcomeValue = cloneCanonical(provisionalOutcome);
    finalOutcomeValue.evidenceIdentity = evidenceIdentity;
    var recommendationOutcome = normalizeRecommendationOutcome(finalOutcomeValue);
    var result = {
      contractVersion: ownerCore.contractVersion,
      ownerDecisionId: "",
      configVersions: ownerCore.configVersions,
      computedAt: ownerCore.computedAt,
      controls: ownerCore.controls,
      currencyDecision: ownerCore.currencyDecision,
      vehicleFit: ownerCore.vehicleFit,
      trackingReads: ownerCore.trackingReads,
      state: ownerCore.state,
      ownerDecision: ownerCore.ownerDecision,
      recommendationOutcome: recommendationOutcome,
      evidenceIdentity: evidenceIdentity,
      evidenceCutoff: ownerCore.evidenceCutoff,
      freshUntil: ownerCore.freshUntil,
      confirmation: ownerCore.confirmation,
      invalidation: ownerCore.invalidation,
      limitations: ownerCore.limitations
    };
    result.ownerDecisionId = "fxo-v1-" + decisionId({
      decisionTime: input.decisionTime,
      controls: controls,
      currencyDecisionId: input.currencyDecision.decisionId,
      configVersions: configVersions,
      observations: consumedObservations.map(function (observation) { return ownerObservationIdentity(observation, true); }),
      trackingReadIds: Object.keys(trackingReads).sort().map(function (vehicleId) { return trackingReads[vehicleId].trackingReadId; }),
      fitOutput: cloneCanonical(vehicleFit),
      resetSessions: resetSessions,
      evidenceIdentity: evidenceIdentity,
      recommendationOutcome: recommendationOutcome
    }).slice("fxd-v1-".length);
    return deepFreeze(result);
  }

  function validateFxOwnerDecision(ownerDecision) {
    requireObject(ownerDecision, "$fxOwnerDecision");
    exactKeys(ownerDecision, [
      "contractVersion", "ownerDecisionId", "configVersions", "computedAt", "controls",
      "currencyDecision", "vehicleFit", "trackingReads", "state", "ownerDecision",
      "recommendationOutcome", "evidenceIdentity", "evidenceCutoff", "freshUntil",
      "confirmation", "invalidation", "limitations"
    ], "$fxOwnerDecision");
    if (ownerDecision.contractVersion !== "rlfx-owner-decision/v1") throw schemaError("RLFX_CONTRACT_VERSION", "$fxOwnerDecision.contractVersion", "unknown FX owner decision contract");
    requireDeepFrozen(ownerDecision, "$fxOwnerDecision");
    requireNonEmptyString(ownerDecision.ownerDecisionId, "RLFX_OWNER_DECISION_INVALID");
    requireNonEmptyString(ownerDecision.evidenceIdentity, "RLFX_OWNER_DECISION_INVALID");
    requireIso(ownerDecision.computedAt, "$fxOwnerDecision.computedAt");
    requireEnum(ownerDecision.state, ["ready", "partial", "indeterminate", "unavailable"], "$fxOwnerDecision.state");
    requireNullableIso(ownerDecision.evidenceCutoff, "$fxOwnerDecision.evidenceCutoff");
    requireNullableIso(ownerDecision.freshUntil, "$fxOwnerDecision.freshUntil");
    requireNonEmptyString(ownerDecision.ownerDecision, "RLFX_OWNER_DECISION_INVALID");
    requireNonEmptyString(ownerDecision.confirmation, "RLFX_OWNER_DECISION_INVALID");
    requireNonEmptyString(ownerDecision.invalidation, "RLFX_OWNER_DECISION_INVALID");
    requireStringArray(ownerDecision.limitations, "$fxOwnerDecision.limitations", false);
    var normalizedOutcome = normalizeRecommendationOutcome(ownerDecision.recommendationOutcome);
    if (canonicalize(normalizedOutcome) !== canonicalize(ownerDecision.recommendationOutcome)) throw schemaError("RLFX_OWNER_DECISION_INVALID", "$fxOwnerDecision.recommendationOutcome", "recommendation outcome is not canonical");
    if (normalizedOutcome.objective !== ownerDecision.controls.objective || normalizedOutcome.horizon !== ownerDecision.controls.horizon) throw schemaError("RLFX_OWNER_DECISION_INVALID", "$fxOwnerDecision.recommendationOutcome", "recommendation outcome must preserve owner controls");
    if (normalizedOutcome.evidenceIdentity !== ownerDecision.evidenceIdentity || normalizedOutcome.evidenceCutoff !== ownerDecision.evidenceCutoff) throw schemaError("RLFX_OWNER_DECISION_INVALID", "$fxOwnerDecision.recommendationOutcome", "recommendation outcome must preserve owner evidence identity and cutoff");
    if (normalizedOutcome.outcome === "recommendation" && (ownerDecision.vehicleFit.selected === null || normalizedOutcome.instrument.vehicleId !== ownerDecision.vehicleFit.selected.vehicleId || normalizedOutcome.instrument.ticker !== ownerDecision.vehicleFit.selected.ticker)) {
      throw schemaError("RLFX_OWNER_DECISION_INVALID", "$fxOwnerDecision.recommendationOutcome.instrument", "recommendation instrument must equal the selected vehicle");
    }
    if (normalizedOutcome.outcome === "no-vehicle" && ownerDecision.vehicleFit.state !== "No Eligible Vehicle") throw schemaError("RLFX_OWNER_DECISION_INVALID", "$fxOwnerDecision.recommendationOutcome.outcome", "no-vehicle requires the settled no-eligible fit state");
  }

  function escapeReaderText(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readerObjectiveLabel(objective) {
    var labels = {
      "foreign-currency-strength": "Foreign-currency strength",
      "dollar-strength": "Dollar strength",
      "dollar-weakness": "Dollar weakness",
      "diversified-em-currency": "Diversified emerging-market currency",
      "compare-wrappers": "Listed-wrapper comparison"
    };
    return labels[objective];
  }

  function readerHorizonLabel(horizon) {
    return { tactical: "Tactical", swing: "Swing", structural: "Structural" }[horizon];
  }

  function readerCutoffLabel(value) {
    if (value === null) return "No eligible evidence cutoff is available";
    return "Evidence through " + value.slice(0, 10) + " at " + value.slice(11, 16) + " UTC";
  }

  function readerReasonText(reasonCode) {
    var exact = {
      NO_ELIGIBLE_VEHICLE: "No reviewed listed vehicle satisfies every active objective, horizon, structure, liquidity, and cost constraint.",
      VEHICLE_FIT_UNAVAILABLE: "Required listed-vehicle facts are unavailable or no longer current.",
      OWNER_EVIDENCE_INCOMPLETE: "The owner research evidence is incomplete for a current recommendation.",
      EVIDENCE_CUTOFF_MISSING: "The evaluated evidence does not have a complete current cutoff.",
      ATTRIBUTABLE_EVIDENCE_MISSING: "Current attributable price evidence is missing.",
      ECONOMIC_DIRECTION_MISSING: "The listed-instrument direction is not attributable.",
      ECONOMIC_DIRECTION_INVALID: "The listed-instrument direction is not valid for this research context.",
      ECONOMIC_DIRECTION_MISMATCH: "The listed-instrument direction does not match the evaluated currency objective.",
      PROVENANCE_MISSING: "The supporting facts do not include attributable provenance.",
      PROVENANCE_INVALID: "The supporting provenance is incomplete.",
      PROVENANCE_UNATTRIBUTABLE: "The supporting provenance does not belong to this research context.",
      MARKET_EVIDENCE_MISSING: "A current listed-instrument market series is missing.",
      MARKET_EVIDENCE_INVALID: "The listed-instrument market series is incomplete.",
      MARKET_SERIES_INELIGIBLE: "The available series is not an eligible listed-instrument price series.",
      MARKET_INSTRUMENT_MISMATCH: "The price series does not match the selected listed vehicle.",
      MARKET_RIGHTS_INELIGIBLE: "The available price evidence cannot be reused for this public research result.",
      MARKET_EVIDENCE_STALE: "The listed-instrument price evidence is no longer current.",
      MARKET_EVIDENCE_UNATTRIBUTABLE: "The listed-instrument price evidence does not belong to this research context.",
      TRIGGER_INVALIDATION_IDENTICAL: "Confirmation and invalidation must describe different price conditions.",
      ACTIVE_STATUS_UNKNOWN: "Current listed status is unavailable.",
      VEHICLE_CLOSED: "The reviewed listed vehicle is no longer active.",
      REQUIRED_FACT_MISSING: "A required listed-vehicle fact is missing.",
      REQUIRED_FACT_STALE: "A required listed-vehicle fact is no longer current.",
      DIRECTION_MISMATCH: "The listed vehicle does not match the evaluated currency direction.",
      CURRENCY_MISMATCH: "The listed vehicle does not match the evaluated currency.",
      BASKET_MISMATCH: "The listed basket does not match the evaluated objective.",
      HORIZON_INCOMPATIBLE: "The listed vehicle is incompatible with the evaluated horizon.",
      STRUCTURE_INCOMPATIBLE: "The listed-vehicle structure is incompatible with the active constraints.",
      DAILY_RESET_NOT_PERMITTED: "A daily-reset vehicle is not permitted for this horizon.",
      RESET_SESSION_UNAVAILABLE: "The required daily reset session is unavailable or expired.",
      LIQUIDITY_POLICY_FAILED: "The listed vehicle does not satisfy the active liquidity requirement.",
      COST_POLICY_FAILED: "The listed vehicle does not satisfy the active cost requirement.",
      RETURN_BASIS_MISMATCH: "The available return series do not share a comparable basis.",
      TRACKING_EVIDENCE_INCOMPLETE: "Listed-vehicle tracking evidence is incomplete.",
      FIT_TIE: "The reviewed evidence cannot distinguish between equally ranked listed vehicles.",
      NO_SOURCE: "A required approved source is unavailable.",
      ACCESS_REQUIRED: "A required source needs access that this public tool does not request.",
      RIGHTS_UNCLEAR: "Reuse rights are not established for a required fact.",
      NO_COVERAGE: "A required source does not cover this research subject.",
      NON_TRADABLE: "The available observation is not a tradable listed instrument.",
      INSUFFICIENT_HISTORY: "There is not enough eligible history for this horizon.",
      NO_COMMON_DATES: "Required series do not share enough exact observation dates.",
      INVALID_ORIENTATION: "The currency direction cannot be verified from the available series.",
      NONFINITE: "A required numeric observation is invalid.",
      SOURCE_ERROR: "A required source observation could not be validated."
    };
    if (exact[reasonCode]) return exact[reasonCode];
    if (reasonCode.indexOf("TRIGGER_") === 0) return "The confirmation price condition is incomplete or unattributable.";
    if (reasonCode.indexOf("INVALIDATION_") === 0) return "The invalidation price condition is incomplete or unattributable.";
    return "Required evidence does not support a current recommendation.";
  }

  function readerGateText(gate, label) {
    var relations = {
      "closes-above": "closes above",
      "closes-below": "closes below",
      "trades-at-or-above": "trades at or above",
      "trades-at-or-below": "trades at or below",
      "enters-band": "enters the level band at",
      "exits-band": "exits the level band at"
    };
    return escapeReaderText(label + " when " + gate.instrument.ticker + " " + relations[gate.relation] + " " + String(gate.level) + " on the " + (gate.observationBasis.field === "adjusted-close" ? "adjusted closing" : "closing") + " price basis.");
  }

  function projectFxReaderDecision(ownerDecision) {
    validateFxOwnerDecision(ownerDecision);
    var outcome = ownerDecision.recommendationOutcome;
    var isRecommendation = outcome.outcome === "recommendation";
    var decisionLabel = isRecommendation ? "Complete research setup" : (outcome.outcome === "no-vehicle" ? "No eligible listed vehicle" : "Recommendation unavailable");
    var summary;
    if (isRecommendation) summary = outcome.instrument.ticker + " has complete attributable confirmation and invalidation conditions for this research horizon.";
    else if (outcome.outcome === "no-vehicle") summary = "The currency research result is available, but no reviewed listed vehicle satisfies every active constraint.";
    else summary = "The available evidence does not support a complete attributable recommendation.";
    var reasons = isRecommendation ? [] : outcome.reasonCodes.map(readerReasonText).filter(function (reason, index, values) {
      return values.indexOf(reason) === index;
    }).map(escapeReaderText);
    return deepFreeze({
      decision: decisionLabel,
      summary: escapeReaderText(summary),
      objective: readerObjectiveLabel(outcome.objective),
      direction: isRecommendation ? escapeReaderText((outcome.economicDirection.instrumentSide === "long" ? "Long " : "Short ") + outcome.instrument.ticker + " research exposure") : null,
      horizon: readerHorizonLabel(outcome.horizon),
      evidenceState: isRecommendation ? "Current evidence with complete price conditions" : (outcome.outcome === "no-vehicle" ? "Current evidence with no eligible listed vehicle" : "Evidence incomplete for a current recommendation"),
      evidenceCutoff: readerCutoffLabel(outcome.evidenceCutoff),
      continuity: "Same research context across Simple, Power, Brief, and Journey.",
      vehicle: isRecommendation ? {
        ticker: escapeReaderText(outcome.instrument.ticker),
        label: escapeReaderText(outcome.instrument.ticker + " listed vehicle")
      } : null,
      confirmation: isRecommendation ? readerGateText(outcome.trigger, "Confirmation") : null,
      invalidation: isRecommendation ? readerGateText(outcome.invalidation, "Invalidation") : null,
      reasons: reasons,
      educationalDisclosure: "Educational research, not investment advice.",
      executionDisclosure: "No trade execution or order preparation is available.",
      ownerDeepLink: RECOMMENDATION_OWNER_DEEP_LINK
    });
  }

  function selectedVehicleStructure(evaluation) {
    if (evaluation === null) return null;
    var prefix = "legal-structure=";
    if (evaluation.materialWrapperCaveat.slice(0, prefix.length) !== prefix) return null;
    var separator = evaluation.materialWrapperCaveat.indexOf(";");
    if (separator === -1) return null;
    return evaluation.materialWrapperCaveat.slice(prefix.length, separator);
  }

  function ownerProjectionAvailability(ownerDecision) {
    var fitCurrent = contains(VEHICLE_FIT_STATE_TIERS.concat(["No Eligible Vehicle"]), ownerDecision.vehicleFit.state);
    var hasClocks = ownerDecision.evidenceCutoff !== null && ownerDecision.freshUntil !== null;
    var withinDeadline = hasClocks && Date.parse(ownerDecision.computedAt) <= Date.parse(ownerDecision.freshUntil);
    if ((ownerDecision.state === "ready" || ownerDecision.state === "partial") && fitCurrent && withinDeadline) return "current";
    if (ownerDecision.state === "indeterminate" && fitCurrent && hasClocks && !withinDeadline) return "stale";
    return "unavailable";
  }

  function projectFxToolReadV2(ownerDecision) {
    validateFxOwnerDecision(ownerDecision);
    var readerDecision = projectFxReaderDecision(ownerDecision);
    var legacyMetrics = projectFxToolRead(ownerDecision.currencyDecision).metrics;
    var availability = ownerProjectionAvailability(ownerDecision);
    var selected = availability === "unavailable" || ownerDecision.vehicleFit.state === "Unavailable" ? null : ownerDecision.vehicleFit.selected;
    var selectedVehicleId = selected === null ? null : selected.vehicleId;
    var selectedTracking = selectedVehicleId === null ? null : ownerDecision.trackingReads[selectedVehicleId];
    var alternatives = ownerDecision.vehicleFit.evaluations.filter(function (evaluation) {
      return evaluation.vehicleId !== selectedVehicleId;
    }).map(function (evaluation) {
      return {
        vehicleId: evaluation.vehicleId,
        ticker: evaluation.ticker,
        state: evaluation.state,
        reasonCodes: evaluation.reasonCodes.slice()
      };
    });
    var rejected = ownerDecision.vehicleFit.evaluations.filter(function (evaluation) {
      return evaluation.state === "Rejected";
    }).map(function (evaluation) {
      return {
        vehicleId: evaluation.vehicleId,
        ticker: evaluation.ticker,
        reasonCodes: evaluation.reasonCodes.slice()
      };
    });
    var read = readerDecision.summary;
    return deepFreeze({
      contractVersion: "rl-tool-read/v1",
      id: "fx-regime-relative-value-lab",
      availability: availability,
      asOf: availability === "unavailable" ? null : ownerDecision.evidenceCutoff,
      read: read,
      metrics: {
        contractVersion: "rlfx-tool-read/v2",
        ownerDecisionId: ownerDecision.ownerDecisionId,
        evidenceIdentity: ownerDecision.evidenceIdentity,
        state: ownerDecision.state,
        objective: ownerDecision.controls.objective,
        subjectId: ownerDecision.controls.subjectId,
        horizon: ownerDecision.controls.horizon,
        cohort: ownerDecision.controls.cohort,
        broadDollarState: legacyMetrics.broadDollarState,
        broadDollarBasis: legacyMetrics.broadDollarBasis,
        strongest: cloneCanonical(legacyMetrics.strongest),
        weakest: cloneCanonical(legacyMetrics.weakest),
        currencyStates: cloneCanonical(legacyMetrics.currencyStates),
        selectedPair: cloneCanonical(legacyMetrics.selectedPair),
        hedgeResearchState: legacyMetrics.hedgeResearchState,
        carryUnwindState: legacyMetrics.carryUnwindState,
        vehicle: {
          state: ownerDecision.vehicleFit.state,
          selectedVehicleId: selectedVehicleId,
          selectedTicker: selected === null ? null : selected.ticker,
          selectedStructure: selectedVehicleStructure(selected),
          selectedDirection: selected === null ? null : ownerDecision.vehicleFit.objective.direction,
          materialWrapperCaveat: selected === null ? null : selected.materialWrapperCaveat,
          trackingState: selectedTracking === null ? null : selectedTracking.state,
          alternatives: alternatives,
          rejected: rejected,
          factCutoff: ownerDecision.vehicleFit.evidenceCutoff,
          freshUntil: ownerDecision.vehicleFit.freshUntil
        },
        recommendationOutcome: ownerDecision.recommendationOutcome,
        coverage: cloneCanonical(legacyMetrics.coverage),
        conflicts: cloneCanonical(legacyMetrics.conflicts),
        confirmation: ownerDecision.confirmation,
        invalidation: ownerDecision.invalidation,
        evidenceCutoff: ownerDecision.evidenceCutoff,
        freshUntil: ownerDecision.freshUntil,
        educationalOnly: true,
        executionAvailable: false
      },
      deepLink: ownerDecision.recommendationOutcome.ownerDeepLink,
      computedAt: ownerDecision.computedAt,
      freshUntil: availability === "unavailable" ? null : ownerDecision.freshUntil
    });
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
    validateVehicleUniverse: validateVehicleUniverse,
    normalizeAttributableLevelGate: normalizeAttributableLevelGate,
    normalizeRecommendationOutcome: normalizeRecommendationOutcome,
    normalizeSourceEnvelope: normalizeSourceEnvelope,
    normalizeObservation: normalizeObservation,
    normalizeVehicleObservation: normalizeVehicleObservation,
    computeVehicleTrackingRead: computeVehicleTrackingRead,
    computeVehicleFitRead: computeVehicleFitRead,
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
    computeFxOwnerDecision: computeFxOwnerDecision,
    computeRecommendationOutcome: computeRecommendationOutcome,
    projectFxReaderDecision: projectFxReaderDecision,
    computeGlobalRotation: computeGlobalRotation,
    scoreCountryLeadership: scoreCountryLeadership,
    projectFxToolRead: projectFxToolRead,
    projectFxToolReadV2: projectFxToolReadV2,
    projectGlobalToolRead: projectGlobalToolRead
  };
});