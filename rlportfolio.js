(function () {
  "use strict";

  var root = (typeof globalThis !== "undefined") ? globalThis :
    ((typeof window !== "undefined") ? window : {});
  var contracts = root.RLCONTRACTS;
  if (!contracts && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    contracts = require("./rlcontracts.js");
  }
  if (!contracts) throw new Error("RLCONTRACTS must be loaded before RLPORTFOLIO");

  var POLICY_VERSION = "portfolio-survival-allocation-policy/v1";
  var WORKSPACE_VERSION = "PortfolioWorkspace/v1";
  var REVISION_VERSION = "PortfolioRevision/v1";
  var HOLDING_VERSION = "HoldingEntry/v1";
  var ERROR_VERSION = "PortfolioError/v1";
  var POINTER_VERSION = "portfolio-workspace-pointer/v1";
  var PREVIEW_VERSION = "portfolio-import-preview/v1";
  var STORAGE_STATE_VERSION = "portfolio-storage-state/v1";
  var PORTFOLIO_DRAFT_VERSION = "PortfolioDraft/v1";
  var WORKSPACE_IDENTITY_VERSION = "WorkspaceIdentity/v1";
  var PERSONAL_CATEGORY_REGISTRY_VERSION = "PersonalCategoryRegistry/v1";
  var CLEAR_TOMBSTONE_VERSION = "ClearTombstone/v1";
  var FULL_CLEAR_RESULT_VERSION = "FullClearResult/v1";
  var MANDATE_VERSION = "MandateRevision/v1";
  var CASH_NEED_VERSION = "CashNeed/v1";
  var CONSTRAINT_VERSION = "MandateConstraint/v1";
  var MANDATE_PREVIEW_VERSION = "portfolio-mandate-preview/v1";
  var ROUTE_STATE_VERSION = "portfolio-route-state/v1";
  var HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
  var CURRENCY_PATTERN = /^[A-Z]{3}$/;
  var DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  var TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  var SAFE_REASON_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
  var ERROR_CODES = Object.freeze({
    "P008-CONFIG": true,
    "P008-STORE-UNAVAILABLE": true,
    "P008-STORE-WRITE": true,
    "P008-STORE-CONFLICT": true,
    "P008-SCHEMA-FUTURE": true,
    "P008-SCHEMA-CORRUPT": true,
    "P008-MIGRATION": true,
    "P008-IMPORT-SHAPE": true,
    "P008-IMPORT-SECRET": true,
    "P008-MANDATE-SHAPE": true,
    "P008-MANDATE-AUTHORITY": true,
    "P008-IDENTITY": true,
    "P008-CURRENCY": true,
    "P008-NUMERIC": true,
    "P008-DATA-COVERAGE": true,
    "P008-ALIGNMENT": true,
    "P008-COVARIANCE": true,
    "P008-PATH": true,
    "P008-INFEASIBLE": true,
    "P008-SOLVER": true,
    "P008-GENERIC-EVIDENCE": true,
    "P008-EXPORT": true,
    "P008-HOLDING-EDIT": true,
    "P008-CLEAR-CONFIRMATION": true,
    "P008-CLEAR-UNDECLARED": true,
    "P008-CLEAR-PARTIAL": true,
    "P008-BEHAVIOR-IDENTITY": true,
    "P008-BEHAVIOR-TIME": true,
    "P008-BEHAVIOR-FLOOR": true,
    "P008-ACTION-RANK": true,
    "P008-ACTION-WHY": true
  });
  var TOP_POLICY_FIELDS = Object.freeze([
    "analytics", "behavior", "calibration", "contractVersion", "display", "import", "mandate", "queue", "solver", "storage"
  ]);
  var POLICY_SECTION_FIELDS = Object.freeze({
    storage: Object.freeze([
      "contractVersion", "displayModeKey", "migrationVersions", "pointerContractVersion", "pointerKey", "probeValue",
      "quarantineKey", "returnContextKey", "sessionKey", "slotKeys", "workspaceContractVersion", "workspaceNamespace"
    ]),
    import: Object.freeze([
      "allowedFileKinds", "assetTypes", "contractVersion", "duplicateChoices", "fieldAliases", "maxBytes", "maxRows",
      "secretFieldTokens", "secretValueMinimumLength", "secretValuePrefixes", "weightTolerance"
    ]),
    mandate: Object.freeze([
      "cashNeedUnits", "constraintKinds", "constraintTypes", "constraintUnits", "contractVersion",
      "descriptiveRouteStates", "forbiddenInputSources", "horizonUnits", "inputAuthority",
      "mandateDependentStates", "maxCashNeeds", "maxConstraints", "neverInferredFields", "treatmentTimings"
    ]),
    behavior: Object.freeze([
      "contractVersion", "eventCategories", "eventLifecycleStates", "forbiddenEventFields", "halfLifeDays",
      "highScore", "maxBehaviorEvents", "maximumEvidenceAgeDays", "mediumScore", "minimumDistinctCompletions",
      "minimumDistinctUtcDates", "outcomeCommands", "outcomeStates", "recentSupportDays"
    ]),
    analytics: Object.freeze([
      "allocationUnstableRangeThreshold", "benchmarkSymbol", "blackLittermanRiskAversion",
      "blackLittermanTau", "concentrationAlertWeight", "concentrationLenses", "contractVersion",
      "covarianceSensitivity", "covarianceShrinkageLambda", "dossierTrialsSearched",
      "dependenceBootstrapBlockLength", "dependenceBootstrapConfidence", "dependenceBootstrapDrawCount",
      "dependenceBootstrapSeed", "dependenceDownsideThreshold", "dependenceDrawdownThreshold",
      "dependenceMinimumJointTailEvents", "dependenceMinimumObservations", "dependenceRecoveryThreshold",
      "dependenceSearchedVariantCount", "dependenceStressQuantile", "efficiencyFormTested",
      "efficiencyInformationSet", "appraisalMinimumObservations", "appraisalRhoGrid",
      "hedgeCommissionFraction", "hedgeInstrumentClass", "hedgeLiquidity",
      "hedgeRebalancesPerYear", "hedgeRegressionMinimumObservations", "hedgeSlippageFraction", "hedgeSpreadFraction",
      "lowerTailQuantile", "maximumListedAssets",
      "minimumCapmObservations", "minimumJointTailEvents", "minimumRiskObservations", "minimumTailObservations",
      "proxyFactors", "proxyFactorsVersion",
      "riskFreeAnnual", "riskReconciliationTolerance", "targetHistoryCalendarYears",
      "walkForwardFolds"
    ]),
    solver: Object.freeze(["contractVersion", "convergenceTolerance", "maximumIterations"]),
    calibration: Object.freeze([
      "contractVersion", "initialSeed", "materialExposureWeight", "nearCashNeedCalendarDays", "parameterDrawCount",
      "pathCount", "scenarioChunkSize", "scenarioCostTiming", "scenarioDriftRange", "scenarioMaximumWorkUnits",
      "scenarioRecurringCostFraction", "scenarioStartingValue", "stationaryBootstrapMeanBlockSessions",
      "stationaryBootstrapSensitivity"
    ]),
    queue: Object.freeze(["contractVersion", "directActionCap", "generalInterestActionCap"]),
    display: Object.freeze([
      "contractVersion", "defaultMode", "defaultWorkspaceHash", "localNetworkPolicy", "memoryWarning", "policyLabel",
      "privateExportWarning", "sessionWarning"
    ])
  });
  var POLICY_SECTION_VERSIONS = Object.freeze({
    storage: "portfolio-storage-policy/v1",
    import: "portfolio-import-policy/v1",
    mandate: "portfolio-mandate-policy/v1",
    behavior: "portfolio-behavior-policy/v1",
    analytics: "portfolio-analytics-policy/v1",
    solver: "portfolio-solver-policy/v1",
    calibration: "portfolio-calibration-policy/v1",
    queue: "portfolio-queue-policy/v1",
    display: "portfolio-display-policy/v1"
  });
  var HOLDING_FIELDS = Object.freeze([
    "acquisitionDate", "assetClass", "assetType", "contractVersion", "costBasis", "currency", "derivedValue",
    "derivedWeight", "factorTags", "geography", "holdingId", "inputBasis", "issuer", "label", "lifecycleState",
    "liquidityClass", "localValue", "lotId", "price", "provenanceClass", "quantity", "sector", "symbol",
    "transactionCost", "uncertaintyNote", "valuationDate", "valuationFrequency", "valuationMethod", "weight"
  ]);
  var REVISION_FIELDS = Object.freeze([
    "contractVersion", "createdAt", "holdings", "inputBasis", "name", "portfolioId", "semanticFingerprint",
    "supersedes", "valuationCurrency"
  ]);
  var PORTFOLIO_DRAFT_FIELDS = Object.freeze([
    "basePortfolioId", "contractVersion", "createdAt", "draftId", "rows", "validation", "valuationCurrency"
  ]);
  var HOLDING_EDITABLE_FIELDS = Object.freeze([
    "acquisitionDate", "assetClass", "assetType", "costBasis", "currency", "factorTags", "geography", "issuer",
    "label", "liquidityClass", "localValue", "lotId", "price", "quantity", "sector", "symbol",
    "transactionCost", "uncertaintyNote", "valuationDate", "valuationFrequency", "valuationMethod", "weight"
  ]);
  var WORKSPACE_FIELDS = Object.freeze([
    "actionOutcomes", "behaviorEvents", "contentSha256", "contractVersion", "createdAt", "currentMandateId",
    "currentPortfolioId", "generation", "interestSignals", "mandateRevisions", "policyRefs", "portfolioRevisions",
    "allocations", "dossiers", "scenarios", "semanticFingerprint", "updatedAt"
  ]);
  var ERROR_FIELDS = Object.freeze([
    "code", "contractVersion", "field", "reason", "recoverable", "row", "valueEchoed"
  ]);
  var MANDATE_FIELDS = Object.freeze([
    "cashNeeds", "constraints", "contractVersion", "costPolicy", "createdAt", "expectedReturnPolicy", "horizon",
    "inputAuthority", "mandateId", "objectiveLabel", "rebalancePolicy", "semanticFingerprint", "supersedes",
    "survivalDefinition", "valuationCurrency"
  ]);
  var MANDATE_DRAFT_FIELDS = Object.freeze([
    "cashNeeds", "constraints", "costPolicy", "expectedReturnPolicy", "horizon", "objectiveLabel",
    "rebalancePolicy", "survivalDefinition", "valuationCurrency"
  ]);
  var HORIZON_FIELDS = Object.freeze(["endDate", "unit"]);
  var CONSTRAINT_FIELDS = Object.freeze([
    "constraintId", "constraintKind", "contractVersion", "inputAuthority", "kind", "maximum", "minimum", "subject", "unit"
  ]);
  var CONSTRAINT_DRAFT_FIELDS = Object.freeze([
    "constraintKind", "kind", "maximum", "minimum", "subject", "unit"
  ]);
  var CASH_NEED_FIELDS = Object.freeze([
    "amount", "cashNeedId", "contractVersion", "currency", "date", "inputAuthority", "priority", "treatmentTiming", "unit"
  ]);
  var CASH_NEED_DRAFT_FIELDS = Object.freeze([
    "amount", "currency", "date", "priority", "treatmentTiming", "unit"
  ]);
  var MANDATE_NULLABLE_POLICY_FIELDS = Object.freeze([
    "costPolicy", "expectedReturnPolicy", "rebalancePolicy", "survivalDefinition"
  ]);
  var BEHAVIOR_EVENT_VERSION = "BehaviorEvent/v1";
  var BEHAVIOR_EVENT_IDENTITY_VERSION = "BehaviorEventIdentity/v1";
  var BEHAVIOR_OCCURRENCE_VERSION = "BehaviorOccurrence/v1";
  var ACTION_OUTCOME_VERSION = "ActionOutcome/v1";
  var LEGACY_BEHAVIOR_EVENT_FIELDS = Object.freeze([
    "category", "completionConditionId", "contractVersion", "dedupeKey", "domain", "eventId", "horizon",
    "lifecycleState", "occurredAt", "policyVersion", "resultIdentity", "sourceSurface", "subjectId", "subjectKind"
  ]);
  var BEHAVIOR_EVENT_FIELDS = Object.freeze([
    "category", "completionConditionId", "contractVersion", "dedupeKey", "domain", "eventId", "horizon",
    "eventIdentity", "genericEvidenceIdentity", "lifecycleState", "occurredAt", "occurrence", "policyVersion",
    "resultIdentity", "sourceSurface", "subjectId", "subjectKind"
  ]);
  var BEHAVIOR_EVENT_DRAFT_FIELDS = Object.freeze([
    "category", "completionConditionId", "domain", "genericEvidenceIdentity", "horizon", "resultIdentity",
    "sourceSurface", "subjectId", "subjectKind"
  ]);
  var INTEREST_SIGNAL_VERSION = "InterestSignal/v1";
  /* Closed per design.md "InterestSignal/v1". It carries NO market or model confidence and no
     personal-trait label: a relevance inference must never be readable as a forecast, and a
     derived interest must never harden into a description of the person. */
  var INTEREST_SIGNAL_FIELDS = Object.freeze([
    "contractVersion", "distinctUtcDateCount", "domain", "evidenceScore", "expiresAt", "floorSatisfied",
    "horizon", "latestSupportAt", "relevanceBand", "sensitivityBand", "signalId", "subjectId",
    "subjectKind", "supportingEventIds"
  ]);
  var INTEREST_RELEVANCE_BANDS = Object.freeze([
    "insufficient-evidence", "weak-relevance", "moderate-relevance", "strong-relevance"
  ]);
  var INTEREST_SENSITIVITY_BANDS = Object.freeze(["non-sensitive"]);
  var ACTION_OUTCOME_FIELDS = Object.freeze([
    "actionId", "command", "contractVersion", "occurredAt", "outcomeId", "reason", "state"
  ]);
  // Verbatim from design.md "Minimal Behavior Event"; the policy config must declare exactly
  // this set, so a silently widened vocabulary fails policy validation rather than admitting
  // an undocumented event class.
  var BEHAVIOR_CATEGORIES = Object.freeze([
    "ticker-research-completed", "risk-analysis-completed", "path-analysis-completed",
    "dependence-analysis-completed", "hedge-analysis-completed", "allocation-analysis-completed",
    "dossier-review-completed", "owner-review-completed", "brief-action-completed"
  ]);
  var BEHAVIOR_EVENT_STATES = Object.freeze(["eligible", "quarantined"]);
  var OUTCOME_COMMANDS = Object.freeze(["complete", "dismiss", "invalidate", "restore"]);
  var OUTCOME_STATES = Object.freeze(["completed", "dismissed", "invalidated", "open"]);
  var OUTCOME_COMMAND_STATES = Object.freeze({
    complete: "completed", dismiss: "dismissed", invalidate: "invalidated", restore: "open"
  });
  // Cleared by `clearBehavior`; every other outcome state survives a behavior-only clear.
  var BEHAVIOR_CLEARED_OUTCOME_STATES = Object.freeze(["completed", "dismissed"]);
  var BEHAVIOR_VOCABULARY_FIELDS = Object.freeze([
    "eventCategories", "eventLifecycleStates", "forbiddenEventFields", "outcomeCommands", "outcomeStates"
  ]);
  var FOUNDATION_LOCAL_KEYS = Object.freeze([
    "rlPortfolioWorkspaceV1.pointer",
    "rlPortfolioWorkspaceV1.slotA",
    "rlPortfolioWorkspaceV1.slotB",
    "rlPortfolioWorkspaceV1.quarantine",
    "rlPortfolioWorkspaceV1.displayMode"
  ]);
  var FOUNDATION_SESSION_KEYS = Object.freeze([
    "rlPortfolioWorkspaceSessionV1",
    "rlReturnContextV1"
  ]);

  function isPlainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== "[object Object]") return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function hasOnlyFields(value, allowedFields) {
    if (!isPlainObject(value)) return "value";
    var allowed = Object.create(null);
    var index;
    for (index = 0; index < allowedFields.length; index += 1) allowed[allowedFields[index]] = true;
    var keys = Object.keys(value);
    for (index = 0; index < keys.length; index += 1) {
      if (!allowed[keys[index]]) return keys[index];
    }
    return null;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function success(value) {
    return { ok: true, value: deepFreeze(value) };
  }

  function portfolioError(code, reason, field, row, recoverable) {
    var error = {
      contractVersion: ERROR_VERSION,
      code: code,
      reason: reason,
      valueEchoed: false,
      recoverable: recoverable === true
    };
    if (typeof field === "string" && field.length > 0) error.field = field;
    if (Number.isInteger(row) && row > 0) error.row = row;
    return deepFreeze(error);
  }

  function failure(code, reason, field, row, recoverable) {
    return { ok: false, error: portfolioError(code, reason, field, row, recoverable) };
  }

  function canonicalTimestamp(value) {
    return typeof value === "string" && TIMESTAMP_PATTERN.test(value) &&
      Number.isFinite(Date.parse(value)) && new Date(Date.parse(value)).toISOString() === value;
  }

  function calendarDate(value) {
    return typeof value === "string" && DATE_PATTERN.test(value) &&
      Number.isFinite(Date.parse(value + "T00:00:00.000Z")) &&
      new Date(Date.parse(value + "T00:00:00.000Z")).toISOString().slice(0, 10) === value;
  }

  function nonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function finiteNonNegative(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
  }

  function finitePositive(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
  }

  function findNonFinite(value, path) {
    if (typeof value === "number" && !Number.isFinite(value)) return path;
    if (Array.isArray(value)) {
      for (var arrayIndex = 0; arrayIndex < value.length; arrayIndex += 1) {
        var arrayHit = findNonFinite(value[arrayIndex], path + "[" + arrayIndex + "]");
        if (arrayHit) return arrayHit;
      }
      return null;
    }
    if (isPlainObject(value)) {
      var keys = Object.keys(value);
      for (var objectIndex = 0; objectIndex < keys.length; objectIndex += 1) {
        var objectHit = findNonFinite(value[keys[objectIndex]], path + "." + keys[objectIndex]);
        if (objectHit) return objectHit;
      }
    }
    return null;
  }

  function stringArray(value, allowEmpty) {
    if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) return false;
    return value.every(function (entry) { return nonEmptyString(entry); });
  }

  /* A proxy factor is a DECLARED long-short spread of two real tickers, never a label the code
     interprets. `long` alone (no `short`) is a plain long leg. */
  function validProxyFactor(entry) {
    var TICKER = /^[A-Z][A-Z0-9.-]{0,9}$/;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
    var keys = Object.keys(entry).sort().join("|");
    if (keys !== "id|long|short" && keys !== "id|long") return false;
    if (!nonEmptyString(entry.id) || !/^[a-z][a-z0-9-]*$/.test(entry.id)) return false;
    if (typeof entry.long !== "string" || !TICKER.test(entry.long)) return false;
    if (Object.prototype.hasOwnProperty.call(entry, "short")) {
      if (typeof entry.short !== "string" || !TICKER.test(entry.short)) return false;
      if (entry.short === entry.long) return false;
    }
    return true;
  }

  function exactStringSet(value, expected) {
    if (!stringArray(value, false) || value.length !== expected.length) return false;
    var actual = value.slice().sort();
    var required = expected.slice().sort();
    return actual.every(function (entry, index) { return entry === required[index]; });
  }

  function validPolicySection(sectionName, section) {
    if (!isPlainObject(section)) return false;
    if (hasOnlyFields(section, POLICY_SECTION_FIELDS[sectionName])) return false;
    if (Object.keys(section).length !== POLICY_SECTION_FIELDS[sectionName].length) return false;
    if (section.contractVersion !== POLICY_SECTION_VERSIONS[sectionName]) return false;
    return true;
  }

  function validatePolicy(value) {
    if (!isPlainObject(value)) return failure("P008-CONFIG", "policy-required", "policy", null, false);
    if (value.contractVersion !== POLICY_VERSION) return failure("P008-CONFIG", "unknown-version", "contractVersion", null, false);
    var unknown = hasOnlyFields(value, TOP_POLICY_FIELDS);
    if (unknown || Object.keys(value).length !== TOP_POLICY_FIELDS.length) {
      return failure("P008-CONFIG", "unknown-field", unknown || "policy", null, false);
    }
    var nonFinite = findNonFinite(value, "policy");
    if (nonFinite) return failure("P008-CONFIG", "non-finite-policy", nonFinite, null, false);
    var sectionNames = Object.keys(POLICY_SECTION_FIELDS);
    for (var sectionIndex = 0; sectionIndex < sectionNames.length; sectionIndex += 1) {
      if (!validPolicySection(sectionNames[sectionIndex], value[sectionNames[sectionIndex]])) {
        return failure("P008-CONFIG", "invalid-policy", sectionNames[sectionIndex], null, false);
      }
    }
    var storage = value.storage;
    if (storage.workspaceContractVersion !== WORKSPACE_VERSION || storage.pointerContractVersion !== POINTER_VERSION ||
        storage.workspaceNamespace !== "rlPortfolioWorkspaceV1" || storage.pointerKey !== "rlPortfolioWorkspaceV1.pointer" ||
        !exactStringSet(storage.slotKeys, ["rlPortfolioWorkspaceV1.slotA", "rlPortfolioWorkspaceV1.slotB"]) ||
        storage.quarantineKey !== "rlPortfolioWorkspaceV1.quarantine" || storage.sessionKey !== "rlPortfolioWorkspaceSessionV1" ||
        storage.displayModeKey !== "rlPortfolioWorkspaceV1.displayMode" ||
        storage.returnContextKey !== "rlReturnContextV1" || !stringArray(storage.migrationVersions, true) ||
        !nonEmptyString(storage.probeValue)) {
      return failure("P008-CONFIG", "invalid-policy", "storage", null, false);
    }
    var importPolicy = value.import;
    if (!exactStringSet(importPolicy.allowedFileKinds, ["csv", "json"]) ||
        !exactStringSet(importPolicy.duplicateChoices, ["merge", "separate"]) ||
        !exactStringSet(importPolicy.assetTypes, ["listed", "cash", "manual-alternative"]) ||
        !Number.isInteger(importPolicy.maxBytes) || importPolicy.maxBytes <= 0 ||
        !Number.isInteger(importPolicy.maxRows) || importPolicy.maxRows <= 0 ||
        !finitePositive(importPolicy.weightTolerance) || !Number.isInteger(importPolicy.secretValueMinimumLength) ||
        importPolicy.secretValueMinimumLength <= 0 || !stringArray(importPolicy.secretFieldTokens, false) ||
        !stringArray(importPolicy.secretValuePrefixes, false) || !isPlainObject(importPolicy.fieldAliases) ||
        Object.keys(importPolicy.fieldAliases).length === 0 ||
        !Object.keys(importPolicy.fieldAliases).every(function (key) {
          return /^[a-z0-9]+$/.test(key) && nonEmptyString(importPolicy.fieldAliases[key]);
        })) {
      return failure("P008-CONFIG", "invalid-policy", "import", null, false);
    }
    var mandatePolicy = value.mandate;
    if (mandatePolicy.inputAuthority !== "user" ||
        !exactStringSet(mandatePolicy.horizonUnits, ["calendar-date"]) ||
        !exactStringSet(mandatePolicy.constraintKinds, ["hard", "research"]) ||
        !exactStringSet(mandatePolicy.constraintUnits, ["currency", "portfolio-fraction"]) ||
        !exactStringSet(mandatePolicy.cashNeedUnits, ["currency", "portfolio-fraction"]) ||
        !exactStringSet(mandatePolicy.treatmentTimings, ["start-of-step", "end-of-step"]) ||
        !exactStringSet(mandatePolicy.descriptiveRouteStates, ["risk-xray", "path-lab", "diversification", "allocation", "dossier"]) ||
        !stringArray(mandatePolicy.constraintTypes, false) || !stringArray(mandatePolicy.forbiddenInputSources, false) ||
        !stringArray(mandatePolicy.mandateDependentStates, false) || !stringArray(mandatePolicy.neverInferredFields, false) ||
        !Number.isInteger(mandatePolicy.maxConstraints) || mandatePolicy.maxConstraints <= 0 ||
        !Number.isInteger(mandatePolicy.maxCashNeeds) || mandatePolicy.maxCashNeeds <= 0) {
      return failure("P008-CONFIG", "invalid-policy", "mandate", null, false);
    }
    if (!Number.isInteger(value.analytics.targetHistoryCalendarYears) || value.analytics.targetHistoryCalendarYears <= 0 ||
        !Number.isInteger(value.analytics.minimumRiskObservations) || value.analytics.minimumRiskObservations <= 0 ||
        !Number.isInteger(value.analytics.minimumCapmObservations) || value.analytics.minimumCapmObservations <= 0 ||
        !Number.isInteger(value.analytics.minimumTailObservations) || value.analytics.minimumTailObservations <= 0 ||
        !Number.isInteger(value.analytics.minimumJointTailEvents) || value.analytics.minimumJointTailEvents <= 0 ||
        !finiteNonNegative(value.analytics.covarianceShrinkageLambda) ||
        !Array.isArray(value.analytics.covarianceSensitivity) || value.analytics.covarianceSensitivity.length === 0 ||
        !value.analytics.covarianceSensitivity.every(finiteNonNegative) ||
        !finitePositive(value.analytics.riskReconciliationTolerance) ||
        !Number.isInteger(value.analytics.maximumListedAssets) || value.analytics.maximumListedAssets <= 0 ||
        typeof value.analytics.benchmarkSymbol !== "string" || !/^[A-Z][A-Z0-9.-]{0,9}$/.test(value.analytics.benchmarkSymbol) ||
        !finiteNonNegative(value.analytics.riskFreeAnnual) ||
        !stringArray(value.analytics.concentrationLenses, false) ||
        !value.analytics.concentrationLenses.every(function (lens) { return HOLDING_FIELDS.indexOf(lens) !== -1; }) ||
        !finitePositive(value.analytics.concentrationAlertWeight) || value.analytics.concentrationAlertWeight > 1 ||
        !finitePositive(value.analytics.lowerTailQuantile) || value.analytics.lowerTailQuantile >= 0.5 ||
        !Number.isInteger(value.analytics.dependenceMinimumObservations) || value.analytics.dependenceMinimumObservations < 2 ||
        !Number.isInteger(value.analytics.dependenceMinimumJointTailEvents) || value.analytics.dependenceMinimumJointTailEvents < 1 ||
        !finitePositive(value.analytics.dependenceStressQuantile) || value.analytics.dependenceStressQuantile >= 0.5 ||
        !finitePositive(value.analytics.dependenceBootstrapConfidence) || value.analytics.dependenceBootstrapConfidence >= 1 ||
        !Number.isInteger(value.analytics.dependenceBootstrapBlockLength) || value.analytics.dependenceBootstrapBlockLength < 1 ||
        !Number.isInteger(value.analytics.dependenceBootstrapDrawCount) || value.analytics.dependenceBootstrapDrawCount < 2 ||
        !Number.isInteger(value.analytics.dependenceBootstrapSeed) || value.analytics.dependenceBootstrapSeed < 0 ||
        !Number.isInteger(value.analytics.dependenceSearchedVariantCount) || value.analytics.dependenceSearchedVariantCount < 1 ||
        !finiteNonNegative(value.analytics.dependenceDownsideThreshold) ||
        !finitePositive(value.analytics.dependenceDrawdownThreshold) || value.analytics.dependenceDrawdownThreshold >= 1 ||
        !finiteNonNegative(value.analytics.dependenceRecoveryThreshold) || value.analytics.dependenceRecoveryThreshold >= 1 ||
        !Number.isInteger(value.analytics.appraisalMinimumObservations) || value.analytics.appraisalMinimumObservations < 2 ||
        !Array.isArray(value.analytics.appraisalRhoGrid) || value.analytics.appraisalRhoGrid.length === 0 ||
        !value.analytics.appraisalRhoGrid.every(function (rho) { return finitePositive(rho) && rho < 1; }) ||
        !Number.isInteger(value.analytics.hedgeRegressionMinimumObservations) || value.analytics.hedgeRegressionMinimumObservations < 3 ||
        !finitePositive(value.analytics.allocationUnstableRangeThreshold) ||
        value.analytics.allocationUnstableRangeThreshold > 1 ||
        !finitePositive(value.analytics.blackLittermanRiskAversion) ||
        !finitePositive(value.analytics.blackLittermanTau) || value.analytics.blackLittermanTau > 1 ||
        !finiteNonNegative(value.analytics.hedgeCommissionFraction) ||
        !finiteNonNegative(value.analytics.hedgeSpreadFraction) ||
        !finiteNonNegative(value.analytics.hedgeSlippageFraction) ||
        !finiteNonNegative(value.analytics.hedgeRebalancesPerYear) ||
        typeof value.analytics.hedgeInstrumentClass !== "string" || !value.analytics.hedgeInstrumentClass.trim() ||
        !Number.isInteger(value.analytics.walkForwardFolds) || value.analytics.walkForwardFolds < 2 ||
        !Number.isInteger(value.analytics.dossierTrialsSearched) || value.analytics.dossierTrialsSearched < 1 ||
        ["weak", "semi-strong", "strong"].indexOf(value.analytics.efficiencyFormTested) < 0 ||
        typeof value.analytics.efficiencyInformationSet !== "string" || !value.analytics.efficiencyInformationSet.trim() ||
        typeof value.analytics.hedgeLiquidity !== "string" || !value.analytics.hedgeLiquidity.trim() ||
        typeof value.analytics.proxyFactorsVersion !== "string" || !value.analytics.proxyFactorsVersion.trim() ||
        !Array.isArray(value.analytics.proxyFactors) || !value.analytics.proxyFactors.length ||
        !value.analytics.proxyFactors.every(validProxyFactor)) {
      return failure("P008-CONFIG", "invalid-policy", "analytics", null, false);
    }
    var behaviorPolicy = value.behavior;
    if (!exactStringSet(behaviorPolicy.eventCategories, BEHAVIOR_CATEGORIES) ||
        !exactStringSet(behaviorPolicy.eventLifecycleStates, BEHAVIOR_EVENT_STATES) ||
        !exactStringSet(behaviorPolicy.outcomeCommands, OUTCOME_COMMANDS) ||
        !exactStringSet(behaviorPolicy.outcomeStates, OUTCOME_STATES) ||
        !stringArray(behaviorPolicy.forbiddenEventFields, false) ||
        !behaviorPolicy.forbiddenEventFields.every(function (token) { return /^[a-z0-9]+$/.test(token); }) ||
        !Number.isInteger(behaviorPolicy.maxBehaviorEvents) || behaviorPolicy.maxBehaviorEvents <= 0) {
      return failure("P008-CONFIG", "invalid-policy", "behavior", null, false);
    }
    var numericSections = [value.behavior, value.solver, value.calibration, value.queue];
    var numericSectionNames = ["behavior", "solver", "calibration", "queue"];
    for (var numericIndex = 0; numericIndex < numericSections.length; numericIndex += 1) {
      var numericKeys = Object.keys(numericSections[numericIndex]).filter(function (key) {
        return key !== "contractVersion" && key !== "scenarioCostTiming" && key !== "scenarioDriftRange" &&
          BEHAVIOR_VOCABULARY_FIELDS.indexOf(key) < 0;
      });
      if (!numericKeys.every(function (key) {
        var item = numericSections[numericIndex][key];
        if (Array.isArray(item)) return item.length > 0 && item.every(finiteNonNegative);
        return finiteNonNegative(item);
      })) return failure("P008-CONFIG", "invalid-policy", numericSectionNames[numericIndex], null, false);
    }
    if (!Number.isInteger(value.calibration.scenarioChunkSize) || value.calibration.scenarioChunkSize < 1 ||
        !Number.isInteger(value.calibration.scenarioMaximumWorkUnits) ||
        value.calibration.scenarioMaximumWorkUnits !== value.calibration.pathCount * value.calibration.parameterDrawCount ||
        !finitePositive(value.calibration.scenarioStartingValue) ||
        !Array.isArray(value.calibration.scenarioDriftRange) || value.calibration.scenarioDriftRange.length !== 2 ||
        !value.calibration.scenarioDriftRange.every(function (entry) { return typeof entry === "number" && Number.isFinite(entry); }) ||
        value.calibration.scenarioDriftRange[1] < value.calibration.scenarioDriftRange[0] ||
        !finiteNonNegative(value.calibration.scenarioRecurringCostFraction) ||
        ["start-of-step", "end-of-step"].indexOf(value.calibration.scenarioCostTiming) < 0) {
      return failure("P008-CONFIG", "invalid-policy", "calibration", null, false);
    }
    if (value.display.defaultMode !== "simple" || value.display.defaultWorkspaceHash !== "#brief" ||
        value.display.localNetworkPolicy !== "same-origin-only" || !nonEmptyString(value.display.policyLabel) ||
        !nonEmptyString(value.display.privateExportWarning) || !nonEmptyString(value.display.sessionWarning) ||
        !nonEmptyString(value.display.memoryWarning)) {
      return failure("P008-CONFIG", "invalid-policy", "display", null, false);
    }
    return success(clone(value));
  }

  function validatePortfolioError(value) {
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "error-required", "error", null, false);
    var unknown = hasOnlyFields(value, ERROR_FIELDS);
    if (unknown) return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown, null, false);
    if (value.contractVersion !== ERROR_VERSION || !ERROR_CODES[value.code] || !SAFE_REASON_PATTERN.test(value.reason || "") ||
        value.valueEchoed !== false || typeof value.recoverable !== "boolean" ||
        (Object.prototype.hasOwnProperty.call(value, "field") && !nonEmptyString(value.field)) ||
        (Object.prototype.hasOwnProperty.call(value, "row") && (!Number.isInteger(value.row) || value.row <= 0))) {
      return failure("P008-SCHEMA-CORRUPT", "invalid-error", "error", null, false);
    }
    return success(clone(value));
  }

  function normalizeFieldName(value) {
    return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function secretFieldName(value, policy) {
    var normalized = normalizeFieldName(value);
    return policy.import.secretFieldTokens.some(function (token) { return normalized.indexOf(token) !== -1; });
  }

  function secretValue(value, policy) {
    if (typeof value !== "string") return false;
    return policy.import.secretValuePrefixes.some(function (prefix) {
      return value.length >= policy.import.secretValueMinimumLength && value.indexOf(prefix) === 0;
    });
  }

  function findSecretPath(value, policy, path) {
    if (Array.isArray(value)) {
      for (var arrayIndex = 0; arrayIndex < value.length; arrayIndex += 1) {
        var arrayHit = findSecretPath(value[arrayIndex], policy, path + "[" + arrayIndex + "]");
        if (arrayHit) return arrayHit;
      }
      return null;
    }
    if (isPlainObject(value)) {
      var keys = Object.keys(value);
      for (var objectIndex = 0; objectIndex < keys.length; objectIndex += 1) {
        if (secretFieldName(keys[objectIndex], policy)) return path + "." + keys[objectIndex];
        var objectHit = findSecretPath(value[keys[objectIndex]], policy, path + "." + keys[objectIndex]);
        if (objectHit) return objectHit;
      }
      return null;
    }
    return secretValue(value, policy) ? path : null;
  }

  function parseCsv(bytes) {
    var rows = [];
    var row = [];
    var cell = "";
    var quoted = false;
    for (var index = 0; index < bytes.length; index += 1) {
      var character = bytes.charAt(index);
      if (quoted) {
        if (character === '"' && bytes.charAt(index + 1) === '"') {
          cell += '"';
          index += 1;
        } else if (character === '"') {
          quoted = false;
        } else {
          cell += character;
        }
      } else if (character === '"' && cell.length === 0) {
        quoted = true;
      } else if (character === ",") {
        row.push(cell);
        cell = "";
      } else if (character === "\n") {
        row.push(cell.replace(/\r$/, ""));
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += character;
      }
    }
    if (quoted) return { ok: false, reason: "unterminated-quoted-field" };
    if (cell.length > 0 || row.length > 0) {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
    }
    while (rows.length > 0 && rows[rows.length - 1].every(function (entry) { return entry.trim().length === 0; })) rows.pop();
    return { ok: true, rows: rows };
  }

  function parseNumeric(value, field, row, required, positive) {
    if (value === null || typeof value === "undefined" || (typeof value === "string" && value.trim().length === 0)) {
      return required ? { ok: false, error: portfolioError("P008-NUMERIC", "numeric-required", field, row, true) } : { ok: true, value: null };
    }
    var number = (typeof value === "number") ? value : Number(String(value).trim());
    if (!Number.isFinite(number) || (positive && number <= 0) || (!positive && number < 0)) {
      return { ok: false, error: portfolioError("P008-NUMERIC", "numeric-invalid", field, row, true) };
    }
    return { ok: true, value: number };
  }

  function nullableText(value) {
    if (value === null || typeof value === "undefined" || String(value).trim().length === 0) return null;
    return String(value).trim();
  }

  function factorTags(value) {
    if (value === null || typeof value === "undefined" || value === "") return [];
    var entries = Array.isArray(value) ? value : String(value).split(/[;|]/);
    return entries.map(function (entry) { return String(entry).trim(); }).filter(function (entry) { return entry.length > 0; }).sort();
  }

  function holdingIdentityPayload(holding) {
    var payload = clone(holding);
    delete payload.holdingId;
    payload.contractVersion = "portfolio-holding-identity/v1";
    return payload;
  }

  function withHoldingIdentity(holding) {
    var output = clone(holding);
    output.holdingId = contracts.fingerprint("portfolio-holding", holdingIdentityPayload(output));
    return output;
  }

  function rawHoldingResult(raw, row, policy) {
    if (!isPlainObject(raw)) return { ok: false, errors: [portfolioError("P008-IMPORT-SHAPE", "holding-object-required", "holding", row, true)] };
    var secretPath = findSecretPath(raw, policy, "holding");
    if (secretPath) return { ok: false, secret: true, errors: [portfolioError("P008-IMPORT-SECRET", "secret-shaped-field", secretPath, row, false)] };
    var aliases = policy.import.fieldAliases;
    var canonical = {};
    var normalizedFields = [];
    var rawKeys = Object.keys(raw);
    var errors = [];
    for (var keyIndex = 0; keyIndex < rawKeys.length; keyIndex += 1) {
      var normalizedKey = normalizeFieldName(rawKeys[keyIndex]);
      if (!Object.prototype.hasOwnProperty.call(aliases, normalizedKey)) {
        errors.push(portfolioError("P008-IMPORT-SHAPE", "unknown-field", rawKeys[keyIndex], row, true));
      } else {
        var canonicalKey = aliases[normalizedKey];
        if (Object.prototype.hasOwnProperty.call(canonical, canonicalKey)) {
          errors.push(portfolioError("P008-IMPORT-SHAPE", "duplicate-field", canonicalKey, row, true));
        } else {
          canonical[canonicalKey] = raw[rawKeys[keyIndex]];
          if (rawKeys[keyIndex] !== canonicalKey || (typeof raw[rawKeys[keyIndex]] === "string" && raw[rawKeys[keyIndex]] !== raw[rawKeys[keyIndex]].trim())) {
            normalizedFields.push(canonicalKey);
          }
        }
      }
    }
    var assetType = nullableText(canonical.assetType);
    if (!assetType || policy.import.assetTypes.indexOf(assetType) < 0) {
      errors.push(portfolioError("P008-IMPORT-SHAPE", "asset-type-invalid", "assetType", row, true));
    }
    var symbol = nullableText(canonical.symbol);
    var label = nullableText(canonical.label);
    if (symbol) {
      var upperSymbol = symbol.toUpperCase();
      if (upperSymbol !== symbol) normalizedFields.push("symbol");
      symbol = upperSymbol;
    }
    var currency = nullableText(canonical.currency);
    if (currency) {
      var upperCurrency = currency.toUpperCase();
      if (upperCurrency !== currency) normalizedFields.push("currency");
      currency = upperCurrency;
    }
    if (!CURRENCY_PATTERN.test(currency || "")) errors.push(portfolioError("P008-CURRENCY", "currency-invalid", "currency", row, true));
    if ((assetType === "listed" || assetType === "cash") && !symbol) errors.push(portfolioError("P008-IDENTITY", "identity-required", "symbol", row, true));
    if (assetType === "manual-alternative" && !label) errors.push(portfolioError("P008-IDENTITY", "identity-required", "label", row, true));
    var weight = parseNumeric(canonical.weight, "weight", row, false, true);
    var quantity = parseNumeric(canonical.quantity, "quantity", row, false, true);
    var price = parseNumeric(canonical.price, "price", row, false, true);
    var localValue = parseNumeric(canonical.localValue, "localValue", row, false, true);
    var costBasis = parseNumeric(canonical.costBasis, "costBasis", row, false, false);
    var transactionCost = parseNumeric(canonical.transactionCost, "transactionCost", row, false, false);
    [weight, quantity, price, localValue, costBasis, transactionCost].forEach(function (parsed) {
      if (!parsed.ok) errors.push(parsed.error);
    });
    var basisCount = 0;
    if (weight.ok && weight.value !== null) basisCount += 1;
    if (quantity.ok && price.ok && quantity.value !== null && price.value !== null) basisCount += 1;
    if (localValue.ok && localValue.value !== null) basisCount += 1;
    if (basisCount !== 1) errors.push(portfolioError("P008-NUMERIC", "input-basis-invalid", "inputBasis", row, true));
    if ((quantity.ok && quantity.value !== null) !== (price.ok && price.value !== null)) {
      errors.push(portfolioError("P008-NUMERIC", "quantity-price-pair-required", "quantity", row, true));
    }
    var valuationDate = nullableText(canonical.valuationDate);
    var acquisitionDate = nullableText(canonical.acquisitionDate);
    if (valuationDate && !calendarDate(valuationDate)) errors.push(portfolioError("P008-IMPORT-SHAPE", "date-invalid", "valuationDate", row, true));
    if (acquisitionDate && !calendarDate(acquisitionDate)) errors.push(portfolioError("P008-IMPORT-SHAPE", "date-invalid", "acquisitionDate", row, true));
    var valuationMethod = nullableText(canonical.valuationMethod);
    var liquidityClass = nullableText(canonical.liquidityClass);
    var valuationFrequency = nullableText(canonical.valuationFrequency);
    var uncertaintyNote = nullableText(canonical.uncertaintyNote);
    if (assetType === "manual-alternative") {
      if (!valuationDate) errors.push(portfolioError("P008-IMPORT-SHAPE", "manual-field-required", "valuationDate", row, true));
      if (!valuationMethod) errors.push(portfolioError("P008-IMPORT-SHAPE", "manual-field-required", "valuationMethod", row, true));
      if (!liquidityClass) errors.push(portfolioError("P008-IMPORT-SHAPE", "manual-field-required", "liquidityClass", row, true));
      if (!valuationFrequency) errors.push(portfolioError("P008-IMPORT-SHAPE", "manual-field-required", "valuationFrequency", row, true));
      if (!uncertaintyNote) errors.push(portfolioError("P008-IMPORT-SHAPE", "manual-field-required", "uncertaintyNote", row, true));
    }
    if (errors.length > 0) return { ok: false, errors: errors, normalizedFields: normalizedFields };
    var inputBasis = weight.value !== null ? "weight" : (localValue.value !== null ? "local-value" : "quantity-price");
    var derivedValue = inputBasis === "quantity-price" ? quantity.value * price.value : (inputBasis === "local-value" ? localValue.value : null);
    var holding = withHoldingIdentity({
      contractVersion: HOLDING_VERSION,
      holdingId: null,
      lotId: nullableText(canonical.lotId),
      assetType: assetType,
      symbol: symbol,
      label: label,
      currency: currency,
      inputBasis: inputBasis,
      weight: weight.value,
      quantity: quantity.value,
      price: price.value,
      localValue: localValue.value,
      derivedValue: derivedValue,
      derivedWeight: inputBasis === "weight" ? weight.value : null,
      costBasis: costBasis.value,
      acquisitionDate: acquisitionDate,
      issuer: nullableText(canonical.issuer),
      assetClass: nullableText(canonical.assetClass),
      sector: nullableText(canonical.sector),
      geography: nullableText(canonical.geography),
      factorTags: factorTags(canonical.factorTags),
      valuationDate: valuationDate,
      valuationMethod: valuationMethod,
      liquidityClass: liquidityClass,
      transactionCost: transactionCost.value,
      valuationFrequency: valuationFrequency,
      uncertaintyNote: uncertaintyNote,
      lifecycleState: assetType === "manual-alternative" ? "manual" : "valid",
      provenanceClass: "user-entered-holding"
    });
    return { ok: true, holding: holding, normalizedFields: Array.from(new Set(normalizedFields)).sort() };
  }

  function validateHoldingEntry(value, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "holding-required", "holding", null, false);
    var unknown = hasOnlyFields(value, HOLDING_FIELDS);
    if (unknown || Object.keys(value).length !== HOLDING_FIELDS.length) return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "holding", null, false);
    if (value.contractVersion !== HOLDING_VERSION || !HASH_PATTERN.test(value.holdingId || "") ||
        policy.import.assetTypes.indexOf(value.assetType) < 0 || !CURRENCY_PATTERN.test(value.currency || "") ||
        ["weight", "quantity-price", "local-value"].indexOf(value.inputBasis) < 0 ||
        ["valid", "manual"].indexOf(value.lifecycleState) < 0 || value.provenanceClass !== "user-entered-holding" ||
        !Array.isArray(value.factorTags) || !value.factorTags.every(nonEmptyString)) {
      return failure("P008-SCHEMA-CORRUPT", "holding-invalid", "holding", null, false);
    }
    if ((value.assetType === "listed" || value.assetType === "cash") && !nonEmptyString(value.symbol)) return failure("P008-IDENTITY", "identity-required", "symbol", null, false);
    if (value.assetType === "manual-alternative" && !nonEmptyString(value.label)) return failure("P008-IDENTITY", "identity-required", "label", null, false);
    var numericFields = ["weight", "quantity", "price", "localValue", "derivedValue", "derivedWeight", "costBasis", "transactionCost"];
    for (var numericIndex = 0; numericIndex < numericFields.length; numericIndex += 1) {
      var numericValue = value[numericFields[numericIndex]];
      if (numericValue !== null && !finiteNonNegative(numericValue)) return failure("P008-NUMERIC", "numeric-invalid", numericFields[numericIndex], null, false);
    }
    if (value.inputBasis === "weight" && !finitePositive(value.weight)) return failure("P008-NUMERIC", "weight-required", "weight", null, false);
    if (value.inputBasis === "quantity-price" && (!finitePositive(value.quantity) || !finitePositive(value.price) || !finitePositive(value.derivedValue))) return failure("P008-NUMERIC", "quantity-price-required", "quantity", null, false);
    if (value.inputBasis === "local-value" && (!finitePositive(value.localValue) || !finitePositive(value.derivedValue))) return failure("P008-NUMERIC", "local-value-required", "localValue", null, false);
    if (value.assetType === "manual-alternative" && (!calendarDate(value.valuationDate) || !nonEmptyString(value.valuationMethod) || !nonEmptyString(value.liquidityClass) || !nonEmptyString(value.valuationFrequency) || !nonEmptyString(value.uncertaintyNote))) {
      return failure("P008-SCHEMA-CORRUPT", "manual-holding-invalid", "holding", null, false);
    }
    return success(clone(value));
  }

  function duplicateKey(holding) {
    return holding.assetType + "|" + (holding.symbol || holding.label) + "|" + holding.currency;
  }

  function sameOrNull(left, right) {
    return left === right ? left : null;
  }

  function mergeHoldingGroup(group) {
    var first = clone(group[0]);
    if (!group.every(function (holding) { return holding.inputBasis === first.inputBasis; })) return null;
    if (first.inputBasis === "weight") {
      first.weight = group.reduce(function (sum, holding) { return sum + holding.weight; }, 0);
      first.derivedWeight = first.weight;
    } else if (first.inputBasis === "quantity-price") {
      first.quantity = group.reduce(function (sum, holding) { return sum + holding.quantity; }, 0);
      first.derivedValue = group.reduce(function (sum, holding) { return sum + holding.derivedValue; }, 0);
      first.price = first.derivedValue / first.quantity;
    } else {
      first.localValue = group.reduce(function (sum, holding) { return sum + holding.localValue; }, 0);
      first.derivedValue = first.localValue;
    }
    first.costBasis = group.every(function (holding) { return holding.costBasis !== null; })
      ? group.reduce(function (sum, holding) { return sum + holding.costBasis; }, 0) : null;
    first.acquisitionDate = group.slice(1).reduce(function (value, holding) { return sameOrNull(value, holding.acquisitionDate); }, first.acquisitionDate);
    first.lotId = null;
    return withHoldingIdentity(first);
  }

  function previewFromRows(fileKind, rows, policy, globalErrors, duplicateChoice, secretFieldDetected) {
    var validRows = rows.filter(function (row) { return row.holding; });
    var groups = Object.create(null);
    validRows.forEach(function (row) {
      var key = duplicateKey(row.holding);
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    var duplicateGroups = Object.keys(groups).filter(function (key) { return groups[key].length > 1; }).map(function (key) {
      return { key: key, rowIds: groups[key].map(function (row) { return row.rowId; }) };
    });
    var errors = globalErrors.slice();
    rows.forEach(function (row) { errors = errors.concat(row.errors); });
    var holdings = [];
    var duplicateResolutionError = false;
    if (!secretFieldDetected) {
      if (duplicateGroups.length === 0) {
        holdings = validRows.map(function (row) { return clone(row.holding); });
      } else if (duplicateChoice === "separate") {
        holdings = validRows.map(function (row) {
          var holding = clone(row.holding);
          if (holding.lotId === null) holding.lotId = "import-row-" + row.rowId;
          return withHoldingIdentity(holding);
        });
      } else if (duplicateChoice === "merge") {
        Object.keys(groups).sort().forEach(function (key) {
          var merged = mergeHoldingGroup(groups[key].map(function (row) { return row.holding; }));
          if (merged) holdings.push(merged);
          else duplicateResolutionError = true;
        });
        if (duplicateResolutionError) errors.push(portfolioError("P008-IMPORT-SHAPE", "duplicate-basis-conflict", "duplicateChoice", null, true));
      } else {
        holdings = validRows.map(function (row) { return clone(row.holding); });
      }
    }
    var unresolvedRows = rows.filter(function (row) {
      return row.errors.some(function (error) { return error.code === "P008-IDENTITY"; });
    }).length;
    var globallyRejected = globalErrors.length > 0;
    var summary = {
      accepted: validRows.length,
      normalized: rows.filter(function (row) { return row.normalizedFields.length > 0; }).length,
      duplicates: duplicateGroups.reduce(function (count, group) { return count + group.rowIds.length; }, 0),
      unresolved: unresolvedRows,
      rejected: rows.filter(function (row) { return globallyRejected || row.errors.length > 0; }).length + (rows.length === 0 && errors.length > 0 ? 1 : 0),
      removed: 0
    };
    var publicRows = rows.map(function (row) {
      return {
        rowId: row.rowId,
        state: globallyRejected || row.errors.length > 0 ? "rejected" : (duplicateGroups.some(function (group) { return group.rowIds.indexOf(row.rowId) >= 0; }) ? "duplicate" : (row.normalizedFields.length > 0 ? "normalized" : "accepted")),
        normalizedFields: row.normalizedFields.slice(),
        errors: row.errors.slice(),
        holding: row.holding ? clone(row.holding) : null
      };
    });
    return deepFreeze({
      contractVersion: PREVIEW_VERSION,
      fileKind: fileKind,
      rows: publicRows,
      holdings: holdings,
      globalErrors: globalErrors.slice(),
      errors: errors,
      summary: summary,
      duplicateGroups: duplicateGroups,
      duplicateChoices: policy.import.duplicateChoices.slice(),
      duplicateChoice: duplicateChoice,
      secretFieldDetected: secretFieldDetected,
      canConfirm: holdings.length > 0 && errors.length === 0 && (duplicateGroups.length === 0 || duplicateChoice !== null)
    });
  }

  function invalidPreview(fileKind, policy, error, secretFieldDetected) {
    return success(previewFromRows(fileKind, [], policy, [error], null, secretFieldDetected));
  }

  function validateImport(fileKind, bytes, current, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (policy.import.allowedFileKinds.indexOf(fileKind) < 0) return failure("P008-IMPORT-SHAPE", "file-kind-invalid", "fileKind", null, true);
    if (typeof bytes !== "string") return failure("P008-IMPORT-SHAPE", "import-bytes-required", "bytes", null, true);
    if (bytes.length > policy.import.maxBytes) return invalidPreview(fileKind, policy, portfolioError("P008-IMPORT-SHAPE", "import-too-large", "bytes", null, true), false);
    var rows = [];
    var globalErrors = [];
    var secretDetected = false;
    if (fileKind === "csv") {
      var parsedCsv = parseCsv(bytes);
      if (!parsedCsv.ok || parsedCsv.rows.length < 2) return invalidPreview(fileKind, policy, portfolioError("P008-IMPORT-SHAPE", parsedCsv.reason || "csv-data-required", "csv", null, true), false);
      if (parsedCsv.rows.length - 1 > policy.import.maxRows) return invalidPreview(fileKind, policy, portfolioError("P008-IMPORT-SHAPE", "row-limit-exceeded", "csv", null, true), false);
      var headers = parsedCsv.rows[0];
      var mappedHeaders = [];
      headers.forEach(function (header) {
        var normalized = normalizeFieldName(header);
        if (secretFieldName(header, policy)) {
          secretDetected = true;
          globalErrors.push(portfolioError("P008-IMPORT-SECRET", "secret-shaped-field", header.trim(), 1, false));
          mappedHeaders.push(null);
        } else if (!Object.prototype.hasOwnProperty.call(policy.import.fieldAliases, normalized)) {
          globalErrors.push(portfolioError("P008-IMPORT-SHAPE", "unknown-field", header.trim(), 1, true));
          mappedHeaders.push(null);
        } else {
          mappedHeaders.push(policy.import.fieldAliases[normalized]);
        }
      });
      for (var csvIndex = 1; csvIndex < parsedCsv.rows.length; csvIndex += 1) {
        var csvRow = parsedCsv.rows[csvIndex];
        var raw = {};
        if (csvRow.length !== headers.length) {
          rows.push({ rowId: csvIndex, holding: null, normalizedFields: [], errors: [portfolioError("P008-IMPORT-SHAPE", "column-count-mismatch", "row", csvIndex, true)] });
          continue;
        }
        for (var columnIndex = 0; columnIndex < mappedHeaders.length; columnIndex += 1) {
          if (mappedHeaders[columnIndex]) raw[mappedHeaders[columnIndex]] = csvRow[columnIndex];
          if (secretValue(csvRow[columnIndex], policy)) secretDetected = true;
        }
        var csvHolding = rawHoldingResult(raw, csvIndex, policy);
        if (csvHolding.secret) secretDetected = true;
        rows.push({
          rowId: csvIndex,
          holding: csvHolding.ok ? csvHolding.holding : null,
          normalizedFields: csvHolding.normalizedFields || [],
          errors: csvHolding.ok ? [] : csvHolding.errors
        });
      }
      if (secretDetected && !globalErrors.some(function (error) { return error.code === "P008-IMPORT-SECRET"; })) {
        globalErrors.push(portfolioError("P008-IMPORT-SECRET", "secret-shaped-value", "import", null, false));
      }
    } else {
      var parsedJson;
      try {
        parsedJson = JSON.parse(bytes);
      } catch (parseError) {
        return invalidPreview(fileKind, policy, portfolioError("P008-IMPORT-SHAPE", "json-invalid", "json", null, true), false);
      }
      var jsonSecret = findSecretPath(parsedJson, policy, "import");
      if (jsonSecret) return invalidPreview(fileKind, policy, portfolioError("P008-IMPORT-SECRET", "secret-shaped-field", jsonSecret, null, false), true);
      if (!isPlainObject(parsedJson) || hasOnlyFields(parsedJson, ["contractVersion", "holdings", "name"]) || parsedJson.contractVersion !== "portfolio-import/v1" || !Array.isArray(parsedJson.holdings)) {
        return invalidPreview(fileKind, policy, portfolioError("P008-IMPORT-SHAPE", "json-contract-invalid", "json", null, true), false);
      }
      if (parsedJson.holdings.length === 0 || parsedJson.holdings.length > policy.import.maxRows) return invalidPreview(fileKind, policy, portfolioError("P008-IMPORT-SHAPE", "row-count-invalid", "holdings", null, true), false);
      parsedJson.holdings.forEach(function (rawHolding, jsonIndex) {
        var jsonHolding = rawHoldingResult(rawHolding, jsonIndex + 1, policy);
        rows.push({
          rowId: jsonIndex + 1,
          holding: jsonHolding.ok ? jsonHolding.holding : null,
          normalizedFields: jsonHolding.normalizedFields || [],
          errors: jsonHolding.ok ? [] : jsonHolding.errors
        });
      });
    }
    return success(previewFromRows(fileKind, rows, policy, globalErrors, null, secretDetected));
  }

  function validateManualDraft(raw, current, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    var result = rawHoldingResult(raw, 1, policy);
    var row = {
      rowId: 1,
      holding: result.ok ? result.holding : null,
      normalizedFields: result.normalizedFields || [],
      errors: result.ok ? [] : result.errors
    };
    return success(previewFromRows("manual", [row], policy, [], null, result.secret === true));
  }

  function validatePreview(value) {
    if (!isPlainObject(value) || value.contractVersion !== PREVIEW_VERSION || !Array.isArray(value.rows) || !Array.isArray(value.globalErrors) || !Array.isArray(value.errors) || !Array.isArray(value.duplicateChoices)) {
      return failure("P008-IMPORT-SHAPE", "preview-invalid", "preview", null, false);
    }
    return { ok: true };
  }

  function resolveDuplicates(draft, choice) {
    var draftResult = validatePreview(draft);
    if (!draftResult.ok) return draftResult;
    if (draft.duplicateChoices.indexOf(choice) < 0) return failure("P008-IMPORT-SHAPE", "duplicate-choice-invalid", "duplicateChoice", null, true);
    var rows = draft.rows.map(function (row) {
      return { rowId: row.rowId, holding: row.holding ? clone(row.holding) : null, normalizedFields: row.normalizedFields.slice(), errors: row.errors.slice() };
    });
    var policy = activePolicyFromPreview(draft);
    if (!policy) return failure("P008-CONFIG", "policy-context-required", "policy", null, false);
    return success(previewFromRows(draft.fileKind, rows, policy, draft.globalErrors.slice(), choice, draft.secretFieldDetected));
  }

  var lastValidatedPolicy = null;

  function activePolicyFromPreview() {
    return lastValidatedPolicy;
  }

  function applyDraftRemoval(draft, rowIds) {
    var draftResult = validatePreview(draft);
    if (!draftResult.ok) return draftResult;
    if (!Array.isArray(rowIds) || !rowIds.every(function (rowId) { return Number.isInteger(rowId) && rowId > 0; })) {
      return failure("P008-IMPORT-SHAPE", "row-removal-invalid", "rowIds", null, true);
    }
    var policy = activePolicyFromPreview(draft);
    if (!policy) return failure("P008-CONFIG", "policy-context-required", "policy", null, false);
    var removed = new Set(rowIds);
    var rows = draft.rows.filter(function (row) { return !removed.has(row.rowId); }).map(function (row) {
      return { rowId: row.rowId, holding: row.holding ? clone(row.holding) : null, normalizedFields: row.normalizedFields.slice(), errors: row.errors.slice() };
    });
    var preview = previewFromRows(draft.fileKind, rows, policy, draft.globalErrors.slice(), draft.duplicateChoice, draft.secretFieldDetected);
    var mutable = clone(preview);
    mutable.summary.removed = draft.rows.length - rows.length;
    return success(deepFreeze(mutable));
  }

  function policyRefs(policy) {
    return {
      schemaVersion: WORKSPACE_VERSION,
      storagePolicyVersion: policy.storage.contractVersion,
      importPolicyVersion: policy.import.contractVersion,
      mandatePolicyVersion: policy.mandate.contractVersion,
      behaviorPolicyVersion: policy.behavior.contractVersion,
      analyticsPolicyVersion: policy.analytics.contractVersion,
      calibrationPolicyVersion: policy.calibration.contractVersion,
      displayPolicyVersion: policy.display.contractVersion
    };
  }

  function workspaceSemanticPayload(value) {
    return {
      contractVersion: "portfolio-workspace-identity/v1",
      generation: value.generation,
      portfolioRevisions: value.portfolioRevisions,
      currentPortfolioId: value.currentPortfolioId,
      mandateRevisions: value.mandateRevisions,
      currentMandateId: value.currentMandateId,
      behaviorEvents: value.behaviorEvents,
      interestSignals: value.interestSignals,
      actionOutcomes: value.actionOutcomes,
      allocations: value.allocations,
      dossiers: value.dossiers,
      scenarios: value.scenarios,
      policyRefs: value.policyRefs
    };
  }

  function withWorkspaceHashes(value) {
    var output = clone(value);
    delete output.semanticFingerprint;
    delete output.contentSha256;
    output.semanticFingerprint = contracts.fingerprint("portfolio-workspace", workspaceSemanticPayload(output));
    output.contentSha256 = contracts.contentSha256(output, "portfolio-workspace-content/v1");
    return output;
  }

  function createEmptyWorkspace(policy, now) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!canonicalTimestamp(now)) return failure("P008-SCHEMA-CORRUPT", "timestamp-invalid", "now", null, false);
    return success(withWorkspaceHashes({
      contractVersion: WORKSPACE_VERSION,
      generation: 0,
      portfolioRevisions: [],
      currentPortfolioId: null,
      mandateRevisions: [],
      currentMandateId: null,
      behaviorEvents: [],
      interestSignals: [],
      actionOutcomes: [],
      allocations: [],
      dossiers: [],
      scenarios: [],
      policyRefs: policyRefs(policy),
      createdAt: now,
      updatedAt: now
    }));
  }

  function revisionSemanticPayload(value) {
    return {
      contractVersion: "portfolio-revision-semantic/v1",
      name: value.name,
      valuationCurrency: value.valuationCurrency,
      inputBasis: value.inputBasis,
      holdings: value.holdings
    };
  }

  // Lineage identity is content identity plus supersedes; derived from the semantic
  // payload so the two can never drift apart.
  function revisionIdentityPayload(value) {
    var payload = revisionSemanticPayload(value);
    payload.contractVersion = "portfolio-revision-identity/v1";
    payload.supersedes = value.supersedes;
    return payload;
  }

  function validatePortfolioRevision(value, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "revision-required", "revision", null, false);
    var unknown = hasOnlyFields(value, REVISION_FIELDS);
    if (unknown || Object.keys(value).length !== REVISION_FIELDS.length) return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "revision", null, false);
    if (value.contractVersion !== REVISION_VERSION || !HASH_PATTERN.test(value.portfolioId || "") || !HASH_PATTERN.test(value.semanticFingerprint || "") ||
        !nonEmptyString(value.name) || !CURRENCY_PATTERN.test(value.valuationCurrency || "") ||
        ["weight", "local-value", "empty"].indexOf(value.inputBasis) < 0 || !Array.isArray(value.holdings) ||
        !canonicalTimestamp(value.createdAt) || (value.supersedes !== null && !HASH_PATTERN.test(value.supersedes || ""))) {
      return failure("P008-SCHEMA-CORRUPT", "revision-invalid", "revision", null, false);
    }
    if ((value.holdings.length === 0) !== (value.inputBasis === "empty")) {
      return failure("P008-SCHEMA-CORRUPT", "revision-empty-state-invalid", "revision", null, false);
    }
    var seen = Object.create(null);
    for (var index = 0; index < value.holdings.length; index += 1) {
      var holdingResult = validateHoldingEntry(value.holdings[index], policy);
      if (!holdingResult.ok) return holdingResult;
      if (seen[value.holdings[index].holdingId]) return failure("P008-IDENTITY", "duplicate-holding-id", "holdings", null, false);
      seen[value.holdings[index].holdingId] = true;
    }
    var expectedSemantic = contracts.fingerprint("portfolio-revision-semantic", revisionSemanticPayload(value));
    var expectedId = contracts.fingerprint("portfolio-revision", revisionIdentityPayload(value));
    if (value.semanticFingerprint !== expectedSemantic || value.portfolioId !== expectedId) return failure("P008-IDENTITY", "revision-identity-mismatch", "portfolioId", null, false);
    return success(clone(value));
  }

  function currentPortfolioRevision(workspace) {
    if (!workspace || workspace.currentPortfolioId === null) return null;
    for (var index = 0; index < workspace.portfolioRevisions.length; index += 1) {
      if (workspace.portfolioRevisions[index].portfolioId === workspace.currentPortfolioId) {
        return workspace.portfolioRevisions[index];
      }
    }
    return null;
  }

  function draftValidation(rows, valuationCurrency, policy) {
    var errors = [];
    var seen = Object.create(null);
    var allWeights = rows.length > 0;
    var allValues = rows.length > 0;
    rows.forEach(function (holding, index) {
      var validated = validateHoldingEntry(holding, policy);
      if (!validated.ok) {
        errors.push(portfolioError("P008-HOLDING-EDIT", validated.error.reason, "rows[" + index + "]", index + 1, true));
        return;
      }
      if (holding.currency !== valuationCurrency) {
        errors.push(portfolioError("P008-HOLDING-EDIT", "common-currency-required", "rows[" + index + "].currency", index + 1, true));
      }
      if (seen[holding.holdingId]) {
        errors.push(portfolioError("P008-HOLDING-EDIT", "duplicate-holding-id", "rows[" + index + "].holdingId", index + 1, true));
      }
      seen[holding.holdingId] = true;
      allWeights = allWeights && holding.inputBasis === "weight";
      allValues = allValues && (holding.inputBasis === "quantity-price" || holding.inputBasis === "local-value");
    });
    if (rows.length > 0 && !allWeights && !allValues) {
      errors.push(portfolioError("P008-HOLDING-EDIT", "mixed-input-basis", "rows", null, true));
    }
    if (allWeights) {
      var weightSum = rows.reduce(function (sum, holding) { return sum + holding.weight; }, 0);
      if (Math.abs(weightSum - 1) > policy.import.weightTolerance) {
        errors.push(portfolioError("P008-HOLDING-EDIT", "weight-sum-invalid", "rows", null, true));
      }
    }
    return { valid: errors.length === 0, errorCount: errors.length, errors: errors };
  }

  function draftIdentityPayload(basePortfolioId, valuationCurrency, rows, createdAt) {
    return {
      contractVersion: "portfolio-draft-identity/v1",
      basePortfolioId: basePortfolioId,
      valuationCurrency: valuationCurrency,
      rows: rows,
      createdAt: createdAt
    };
  }

  function portfolioDraftFromRows(basePortfolioId, valuationCurrency, rows, createdAt, policy) {
    if ((basePortfolioId !== null && !HASH_PATTERN.test(basePortfolioId || "")) ||
        !CURRENCY_PATTERN.test(valuationCurrency || "") || !Array.isArray(rows) || !canonicalTimestamp(createdAt)) {
      return failure("P008-HOLDING-EDIT", "draft-shape-invalid", "draft", null, true);
    }
    var copiedRows = rows.map(clone);
    var validation = draftValidation(copiedRows, valuationCurrency, policy);
    var draft = {
      contractVersion: PORTFOLIO_DRAFT_VERSION,
      draftId: contracts.fingerprint("portfolio-draft", draftIdentityPayload(basePortfolioId, valuationCurrency, copiedRows, createdAt)),
      basePortfolioId: basePortfolioId,
      valuationCurrency: valuationCurrency,
      rows: copiedRows,
      validation: validation,
      createdAt: createdAt
    };
    return success(deepFreeze(draft));
  }

  function validatePortfolioDraft(value, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(value) || hasOnlyFields(value, PORTFOLIO_DRAFT_FIELDS) ||
        Object.keys(value).length !== PORTFOLIO_DRAFT_FIELDS.length || value.contractVersion !== PORTFOLIO_DRAFT_VERSION) {
      return failure("P008-HOLDING-EDIT", "draft-shape-invalid", "draft", null, true);
    }
    var rebuilt = portfolioDraftFromRows(value.basePortfolioId, value.valuationCurrency, value.rows, value.createdAt, policy);
    if (!rebuilt.ok) return rebuilt;
    if (rebuilt.value.draftId !== value.draftId ||
        contracts.canonicalize(rebuilt.value.validation, "portfolio-draft-validation/v1") !==
          contracts.canonicalize(value.validation, "portfolio-draft-validation/v1")) {
      return failure("P008-HOLDING-EDIT", "draft-identity-invalid", "draftId", null, true);
    }
    return success(clone(value));
  }

  function createPortfolioDraft(currentWorkspace, now, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    if (!canonicalTimestamp(now)) return failure("P008-HOLDING-EDIT", "timestamp-invalid", "now", null, true);
    var revision = currentPortfolioRevision(workspaceResult.value);
    if (!revision) return failure("P008-HOLDING-EDIT", "current-portfolio-required", "currentPortfolioId", null, true);
    return portfolioDraftFromRows(revision.portfolioId, revision.valuationCurrency, revision.holdings, now, policy);
  }

  function stableAddedHoldingId(draft, holding) {
    return contracts.fingerprint("portfolio-draft-holding", {
      contractVersion: "portfolio-draft-holding-identity/v1",
      draftId: draft.draftId,
      ordinal: draft.rows.length,
      sourceHoldingId: holding.holdingId
    });
  }

  function addHoldingRow(draft, row, policy) {
    var draftResult = validatePortfolioDraft(draft, policy);
    if (!draftResult.ok) return draftResult;
    var holdingResult = validateHoldingEntry(row, policy);
    if (!holdingResult.ok) return failure("P008-HOLDING-EDIT", holdingResult.error.reason, holdingResult.error.field, null, true);
    var holding = clone(holdingResult.value);
    holding.holdingId = stableAddedHoldingId(draftResult.value, holding);
    return portfolioDraftFromRows(
      draftResult.value.basePortfolioId,
      draftResult.value.valuationCurrency,
      draftResult.value.rows.concat([holding]),
      draftResult.value.createdAt,
      policy
    );
  }

  function editableHolding(holding) {
    var output = {};
    HOLDING_EDITABLE_FIELDS.forEach(function (field) { output[field] = clone(holding[field]); });
    return output;
  }

  function editHoldingRow(draft, holdingId, patch, policy) {
    var draftResult = validatePortfolioDraft(draft, policy);
    if (!draftResult.ok) return draftResult;
    if (!HASH_PATTERN.test(holdingId || "") || !isPlainObject(patch)) {
      return failure("P008-HOLDING-EDIT", "edit-arguments-invalid", "holdingId", null, true);
    }
    var unknownPatch = hasOnlyFields(patch, HOLDING_EDITABLE_FIELDS);
    if (unknownPatch) return failure("P008-HOLDING-EDIT", "editable-field-invalid", unknownPatch, null, true);
    var found = false;
    var rows = draftResult.value.rows.map(function (holding, index) {
      if (holding.holdingId !== holdingId) return clone(holding);
      found = true;
      var raw = editableHolding(holding);
      Object.keys(patch).forEach(function (field) { raw[field] = patch[field]; });
      var rebuilt = rawHoldingResult(raw, index + 1, policy);
      if (!rebuilt.ok) return { editError: rebuilt.errors[0] };
      var edited = clone(rebuilt.holding);
      edited.holdingId = holdingId;
      return edited;
    });
    if (!found) return failure("P008-HOLDING-EDIT", "holding-not-found", "holdingId", null, true);
    var failedRow = rows.find(function (row) { return row && row.editError; });
    if (failedRow) return failure("P008-HOLDING-EDIT", failedRow.editError.reason, failedRow.editError.field, null, true);
    return portfolioDraftFromRows(
      draftResult.value.basePortfolioId,
      draftResult.value.valuationCurrency,
      rows,
      draftResult.value.createdAt,
      policy
    );
  }

  function removeHoldingRow(draft, holdingId, policy) {
    var draftResult = validatePortfolioDraft(draft, policy);
    if (!draftResult.ok) return draftResult;
    if (!HASH_PATTERN.test(holdingId || "") ||
        !draftResult.value.rows.some(function (row) { return row.holdingId === holdingId; })) {
      return failure("P008-HOLDING-EDIT", "holding-not-found", "holdingId", null, true);
    }
    return portfolioDraftFromRows(
      draftResult.value.basePortfolioId,
      draftResult.value.valuationCurrency,
      draftResult.value.rows.filter(function (row) { return row.holdingId !== holdingId; }),
      draftResult.value.createdAt,
      policy
    );
  }

  function revisionFromPortfolioDraft(draft, now, policy) {
    var draftResult = validatePortfolioDraft(draft, policy);
    if (!draftResult.ok) return draftResult;
    if (!draftResult.value.validation.valid) return failure("P008-HOLDING-EDIT", "draft-invalid", "validation", null, true);
    if (!canonicalTimestamp(now)) return failure("P008-HOLDING-EDIT", "timestamp-invalid", "now", null, true);
    var rows = draftResult.value.rows.map(clone);
    var inputBasis = rows.length === 0 ? "empty" :
      (rows.every(function (holding) { return holding.inputBasis === "weight"; }) ? "weight" : "local-value");
    if (inputBasis === "local-value") {
      var totalValue = rows.reduce(function (sum, holding) { return sum + holding.derivedValue; }, 0);
      rows = rows.map(function (holding) {
        var output = clone(holding);
        output.derivedWeight = output.derivedValue / totalValue;
        return output;
      });
    }
    var revision = {
      contractVersion: REVISION_VERSION,
      portfolioId: null,
      name: rows.length === 0 ? "Portfolio empty" : "Portfolio revision",
      valuationCurrency: draftResult.value.valuationCurrency,
      inputBasis: inputBasis,
      holdings: rows,
      createdAt: now,
      supersedes: draftResult.value.basePortfolioId,
      semanticFingerprint: null
    };
    revision.semanticFingerprint = contracts.fingerprint("portfolio-revision-semantic", revisionSemanticPayload(revision));
    revision.portfolioId = contracts.fingerprint("portfolio-revision", revisionIdentityPayload(revision));
    return success(revision);
  }

  function buildEmptyPortfolioRevision(draft, now, policy) {
    if (!isPlainObject(draft) || !Array.isArray(draft.rows) || draft.rows.length !== 0) {
      return failure("P008-HOLDING-EDIT", "empty-draft-required", "rows", null, true);
    }
    return revisionFromPortfolioDraft(draft, now, policy);
  }

  function workspaceIdentityProjection(workspace, activeRevision) {
    return {
      contractVersion: WORKSPACE_IDENTITY_VERSION,
      activeIdentity: activeRevision.portfolioId,
      supersedesIdentity: activeRevision.supersedes,
      priorResults: workspace.portfolioRevisions.filter(function (entry) {
        return entry.portfolioId !== activeRevision.portfolioId;
      }).map(function (entry) {
        var superseding = workspace.portfolioRevisions.find(function (candidate) {
          return candidate.supersedes === entry.portfolioId;
        });
        return { identity: entry.portfolioId, supersededByIdentity: superseding ? superseding.portfolioId : null };
      })
    };
  }

  function buildPortfolioRevision(draft, currentWorkspace, options, policy) {
    if (!draft.canConfirm || !Array.isArray(draft.holdings) || draft.holdings.length === 0) return failure("P008-IMPORT-SHAPE", "draft-not-confirmable", "draft", null, true);
    if (!isPlainObject(options) || !nonEmptyString(options.name) || !canonicalTimestamp(options.now)) return failure("P008-IDENTITY", "revision-options-invalid", "options", null, true);
    var holdings = draft.holdings.map(clone);
    var currencies = Array.from(new Set(holdings.map(function (holding) { return holding.currency; })));
    if (currencies.length !== 1) return failure("P008-CURRENCY", "common-currency-required", "holdings", null, true);
    var allWeights = holdings.every(function (holding) { return holding.inputBasis === "weight"; });
    var allValues = holdings.every(function (holding) { return holding.inputBasis === "quantity-price" || holding.inputBasis === "local-value"; });
    if (!allWeights && !allValues) return failure("P008-NUMERIC", "mixed-input-basis", "holdings", null, true);
    if (allWeights) {
      var weightSum = holdings.reduce(function (sum, holding) { return sum + holding.weight; }, 0);
      if (Math.abs(weightSum - 1) > policy.import.weightTolerance) return failure("P008-NUMERIC", "weight-sum-invalid", "holdings", null, true);
      holdings = holdings.map(function (holding) {
        var output = clone(holding);
        output.derivedWeight = output.weight;
        return withHoldingIdentity(output);
      });
    } else {
      var totalValue = holdings.reduce(function (sum, holding) { return sum + holding.derivedValue; }, 0);
      if (!finitePositive(totalValue)) return failure("P008-NUMERIC", "portfolio-value-invalid", "holdings", null, true);
      holdings = holdings.map(function (holding) {
        var output = clone(holding);
        output.derivedWeight = output.derivedValue / totalValue;
        return withHoldingIdentity(output);
      });
    }
    var revision = {
      contractVersion: REVISION_VERSION,
      portfolioId: null,
      name: options.name.trim(),
      valuationCurrency: currencies[0],
      inputBasis: allWeights ? "weight" : "local-value",
      holdings: holdings,
      createdAt: options.now,
      supersedes: currentWorkspace.currentPortfolioId,
      semanticFingerprint: null
    };
    revision.semanticFingerprint = contracts.fingerprint("portfolio-revision-semantic", revisionSemanticPayload(revision));
    revision.portfolioId = contracts.fingerprint("portfolio-revision", revisionIdentityPayload(revision));
    return success(revision);
  }

  function buildWorkspaceCandidate(draft, currentWorkspace, options, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    var revisionResult = buildPortfolioRevision(draft, currentWorkspace, options, policy);
    if (!revisionResult.ok) return revisionResult;
    var candidate = clone(currentWorkspace);
    candidate.portfolioRevisions.push(revisionResult.value);
    candidate.currentPortfolioId = revisionResult.value.portfolioId;
    candidate.updatedAt = options.now;
    candidate.policyRefs = policyRefs(policy);
    return success(withWorkspaceHashes(candidate));
  }

  function buildPortfolioClearCandidate(currentWorkspace, now, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    if (!canonicalTimestamp(now)) return failure("P008-SCHEMA-CORRUPT", "timestamp-invalid", "now", null, false);
    var candidate = clone(currentWorkspace);
    candidate.currentPortfolioId = null;
    candidate.updatedAt = now;
    candidate.policyRefs = policyRefs(policy);
    return success(withWorkspaceHashes(candidate));
  }

  function validateWorkspace(value, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "workspace-required", "workspace", null, false);
    var unknown = hasOnlyFields(value, WORKSPACE_FIELDS);
    if (unknown || Object.keys(value).length !== WORKSPACE_FIELDS.length) return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "workspace", null, false);
    if (value.contractVersion !== WORKSPACE_VERSION || !Number.isInteger(value.generation) || value.generation < 0 ||
        !Array.isArray(value.portfolioRevisions) || !Array.isArray(value.mandateRevisions) || !Array.isArray(value.behaviorEvents) ||
        !Array.isArray(value.interestSignals) || !Array.isArray(value.actionOutcomes) || !Array.isArray(value.scenarios) || !Array.isArray(value.allocations) || !Array.isArray(value.dossiers) || !isPlainObject(value.policyRefs) ||
        !canonicalTimestamp(value.createdAt) || !canonicalTimestamp(value.updatedAt) || !HASH_PATTERN.test(value.semanticFingerprint || "") ||
        !HASH_PATTERN.test(value.contentSha256 || "") || (value.currentPortfolioId !== null && !HASH_PATTERN.test(value.currentPortfolioId || "")) ||
        (value.currentMandateId !== null && !HASH_PATTERN.test(value.currentMandateId || ""))) {
      return failure("P008-SCHEMA-CORRUPT", "workspace-invalid", "workspace", null, false);
    }
    if (value.interestSignals.length > 0) {
      for (var signalIndex = 0; signalIndex < value.interestSignals.length; signalIndex += 1) {
        var signalResult = validateInterestSignal(value.interestSignals[signalIndex], policy);
        if (!signalResult.ok) return signalResult;
      }
    }
    if (value.behaviorEvents.length > policy.behavior.maxBehaviorEvents) {
      return failure("P008-SCHEMA-CORRUPT", "behavior-event-cap-exceeded", "behaviorEvents", null, false);
    }
    var eventIds = Object.create(null);
    for (var eventIndex = 0; eventIndex < value.behaviorEvents.length; eventIndex += 1) {
      var eventResult = validateBehaviorEvent(value.behaviorEvents[eventIndex], policy);
      if (!eventResult.ok) return eventResult;
      if (eventIds[value.behaviorEvents[eventIndex].eventId]) return failure("P008-IDENTITY", "duplicate-event-id", "behaviorEvents", null, false);
      eventIds[value.behaviorEvents[eventIndex].eventId] = true;
    }
    var outcomeIds = Object.create(null);
    for (var outcomeIndex = 0; outcomeIndex < value.actionOutcomes.length; outcomeIndex += 1) {
      var outcomeResult = validateActionOutcome(value.actionOutcomes[outcomeIndex], policy);
      if (!outcomeResult.ok) return outcomeResult;
      if (outcomeIds[value.actionOutcomes[outcomeIndex].outcomeId]) return failure("P008-IDENTITY", "duplicate-outcome-id", "actionOutcomes", null, false);
      outcomeIds[value.actionOutcomes[outcomeIndex].outcomeId] = true;
    }
    var scenarioIds = Object.create(null);
    for (var scenarioIndex = 0; scenarioIndex < value.scenarios.length; scenarioIndex += 1) {
      var scenarioResult = validateScenario(value.scenarios[scenarioIndex]);
      if (!scenarioResult.ok) return scenarioResult;
      if (scenarioIds[value.scenarios[scenarioIndex].scenarioId]) return failure("P008-IDENTITY", "duplicate-scenario-id", "scenarios", null, false);
      scenarioIds[value.scenarios[scenarioIndex].scenarioId] = true;
    }
    var allocationIds = Object.create(null);
    for (var allocationIndex = 0; allocationIndex < value.allocations.length; allocationIndex += 1) {
      var allocationResult = validateAllocation(value.allocations[allocationIndex]);
      if (!allocationResult.ok) return allocationResult;
      if (allocationIds[value.allocations[allocationIndex].allocationId]) {
        return failure("P008-IDENTITY", "duplicate-allocation-id", "allocations", null, false);
      }
      allocationIds[value.allocations[allocationIndex].allocationId] = true;
    }
    var dossierIds = Object.create(null);
    for (var dossierIndex = 0; dossierIndex < value.dossiers.length; dossierIndex += 1) {
      var dossierResult = validateDossier(value.dossiers[dossierIndex]);
      if (!dossierResult.ok) return dossierResult;
      if (dossierIds[value.dossiers[dossierIndex].dossierId]) {
        return failure("P008-IDENTITY", "duplicate-dossier-id", "dossiers", null, false);
      }
      dossierIds[value.dossiers[dossierIndex].dossierId] = true;
    }
    var mandateIds = Object.create(null);
    for (var mandateIndex = 0; mandateIndex < value.mandateRevisions.length; mandateIndex += 1) {
      var mandateResult = validateMandateRevision(value.mandateRevisions[mandateIndex], policy);
      if (!mandateResult.ok) return mandateResult;
      if (mandateIds[value.mandateRevisions[mandateIndex].mandateId]) return failure("P008-IDENTITY", "duplicate-mandate-id", "mandateRevisions", null, false);
      mandateIds[value.mandateRevisions[mandateIndex].mandateId] = true;
    }
    if (value.currentMandateId !== null && !mandateIds[value.currentMandateId]) {
      return failure("P008-IDENTITY", "current-mandate-missing", "currentMandateId", null, false);
    }
    var revisionIds = Object.create(null);
    for (var revisionIndex = 0; revisionIndex < value.portfolioRevisions.length; revisionIndex += 1) {
      var revisionResult = validatePortfolioRevision(value.portfolioRevisions[revisionIndex], policy);
      if (!revisionResult.ok) return revisionResult;
      if (revisionIds[value.portfolioRevisions[revisionIndex].portfolioId]) return failure("P008-IDENTITY", "duplicate-revision-id", "portfolioRevisions", null, false);
      revisionIds[value.portfolioRevisions[revisionIndex].portfolioId] = true;
    }
    if (value.currentPortfolioId !== null && !revisionIds[value.currentPortfolioId]) {
      return failure("P008-IDENTITY", "current-revision-missing", "currentPortfolioId", null, false);
    }
    var expected = withWorkspaceHashes(value);
    if (expected.semanticFingerprint !== value.semanticFingerprint || expected.contentSha256 !== value.contentSha256) {
      return failure("P008-IDENTITY", "workspace-hash-mismatch", "workspace", null, false);
    }
    return success(clone(value));
  }

  function mandateConflict(reason, subject, indexes, error) {
    return {
      contractVersion: "portfolio-mandate-conflict/v1",
      reason: reason,
      subject: subject,
      indexes: indexes.slice(),
      error: error
    };
  }

  function constraintIdentityPayload(constraint, declaredIndex) {
    var payload = clone(constraint);
    delete payload.constraintId;
    payload.contractVersion = "portfolio-mandate-constraint-identity/v1";
    payload.declaredIndex = declaredIndex;
    return payload;
  }

  function cashNeedIdentityPayload(cashNeed, declaredIndex) {
    var payload = clone(cashNeed);
    delete payload.cashNeedId;
    payload.contractVersion = "portfolio-cash-need-identity/v1";
    payload.declaredIndex = declaredIndex;
    return payload;
  }

  function mandateSemanticPayload(value) {
    return {
      contractVersion: "portfolio-mandate-semantic/v1",
      objectiveLabel: value.objectiveLabel,
      valuationCurrency: value.valuationCurrency,
      horizon: value.horizon,
      survivalDefinition: value.survivalDefinition,
      rebalancePolicy: value.rebalancePolicy,
      costPolicy: value.costPolicy,
      expectedReturnPolicy: value.expectedReturnPolicy,
      constraints: value.constraints,
      cashNeeds: value.cashNeeds,
      inputAuthority: value.inputAuthority
    };
  }

  // Lineage identity is content identity plus supersedes; derived from the semantic
  // payload so the two can never drift apart.
  function mandateIdentityPayload(value) {
    var payload = mandateSemanticPayload(value);
    payload.contractVersion = "portfolio-mandate-identity/v1";
    payload.supersedes = value.supersedes;
    return payload;
  }

  function normalizeConstraintDraft(entry, index, policy, errors) {
    var field = "constraints[" + index + "]";
    if (!isPlainObject(entry)) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "constraint-object-required", field, index + 1, true));
      return null;
    }
    var unknown = hasOnlyFields(entry, CONSTRAINT_DRAFT_FIELDS);
    if (unknown) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "unknown-field", field + "." + unknown, index + 1, true));
      return null;
    }
    var invalid = false;
    if (policy.mandate.constraintTypes.indexOf(entry.kind) < 0) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "constraint-kind-invalid", field + ".kind", index + 1, true));
      invalid = true;
    }
    if (policy.mandate.constraintKinds.indexOf(entry.constraintKind) < 0) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "constraint-authority-invalid", field + ".constraintKind", index + 1, true));
      invalid = true;
    }
    if (policy.mandate.constraintUnits.indexOf(entry.unit) < 0) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "constraint-unit-invalid", field + ".unit", index + 1, true));
      invalid = true;
    }
    if (!nonEmptyString(entry.subject)) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "constraint-subject-required", field + ".subject", index + 1, true));
      invalid = true;
    }
    ["minimum", "maximum"].forEach(function (bound) {
      var boundValue = entry[bound];
      if (boundValue === null) return;
      if (!finiteNonNegative(boundValue)) {
        errors.push(portfolioError("P008-MANDATE-SHAPE", "constraint-bound-invalid", field + "." + bound, index + 1, true));
        invalid = true;
        return;
      }
      if (entry.unit === "portfolio-fraction" && boundValue > 1) {
        errors.push(portfolioError("P008-MANDATE-SHAPE", "constraint-fraction-out-of-range", field + "." + bound, index + 1, true));
        invalid = true;
      }
    });
    if (entry.minimum === null && entry.maximum === null && entry.kind !== "exclusion") {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "constraint-bound-required", field, index + 1, true));
      invalid = true;
    }
    if (invalid) return null;
    var constraint = {
      contractVersion: CONSTRAINT_VERSION,
      constraintId: null,
      kind: entry.kind,
      subject: entry.subject.trim(),
      constraintKind: entry.constraintKind,
      unit: entry.unit,
      minimum: entry.minimum,
      maximum: entry.maximum,
      inputAuthority: policy.mandate.inputAuthority
    };
    constraint.constraintId = contracts.fingerprint("portfolio-mandate-constraint", constraintIdentityPayload(constraint, index));
    return constraint;
  }

  function normalizeCashNeedDraft(entry, index, policy, errors) {
    var field = "cashNeeds[" + index + "]";
    if (!isPlainObject(entry)) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "cash-need-object-required", field, index + 1, true));
      return null;
    }
    var unknown = hasOnlyFields(entry, CASH_NEED_DRAFT_FIELDS);
    if (unknown) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "unknown-field", field + "." + unknown, index + 1, true));
      return null;
    }
    var invalid = false;
    if (!calendarDate(entry.date)) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "cash-need-date-invalid", field + ".date", index + 1, true));
      invalid = true;
    }
    if (!finitePositive(entry.amount)) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "cash-need-amount-invalid", field + ".amount", index + 1, true));
      invalid = true;
    }
    if (!CURRENCY_PATTERN.test(entry.currency || "")) {
      errors.push(portfolioError("P008-CURRENCY", "cash-need-currency-invalid", field + ".currency", index + 1, true));
      invalid = true;
    }
    if (!Number.isInteger(entry.priority) || entry.priority <= 0) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "cash-need-priority-invalid", field + ".priority", index + 1, true));
      invalid = true;
    }
    if (policy.mandate.cashNeedUnits.indexOf(entry.unit) < 0) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "cash-need-unit-invalid", field + ".unit", index + 1, true));
      invalid = true;
    }
    if (policy.mandate.treatmentTimings.indexOf(entry.treatmentTiming) < 0) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "cash-need-timing-invalid", field + ".treatmentTiming", index + 1, true));
      invalid = true;
    }
    if (entry.unit === "portfolio-fraction" && finitePositive(entry.amount) && entry.amount > 1) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "cash-need-fraction-out-of-range", field + ".amount", index + 1, true));
      invalid = true;
    }
    if (invalid) return null;
    var cashNeed = {
      contractVersion: CASH_NEED_VERSION,
      cashNeedId: null,
      date: entry.date,
      amount: entry.amount,
      currency: entry.currency.toUpperCase(),
      priority: entry.priority,
      unit: entry.unit,
      treatmentTiming: entry.treatmentTiming,
      inputAuthority: policy.mandate.inputAuthority
    };
    cashNeed.cashNeedId = contracts.fingerprint("portfolio-cash-need", cashNeedIdentityPayload(cashNeed, index));
    return cashNeed;
  }

  function detectMandateConflicts(body, now, policy) {
    var conflicts = [];
    var subjects = Object.create(null);
    body.constraints.forEach(function (constraint, index) {
      if (!subjects[constraint.subject]) subjects[constraint.subject] = [];
      subjects[constraint.subject].push({ constraint: constraint, index: index });
      if (constraint.minimum !== null && constraint.maximum !== null && constraint.minimum > constraint.maximum) {
        conflicts.push(mandateConflict("constraint-bounds-inverted", constraint.subject, [index],
          portfolioError("P008-INFEASIBLE", "constraint-bounds-inverted", "constraints[" + index + "]", index + 1, true)));
      }
    });
    Object.keys(subjects).sort().forEach(function (subject) {
      var group = subjects[subject];
      var floors = group.filter(function (entry) { return entry.constraint.minimum !== null; });
      var caps = group.filter(function (entry) { return entry.constraint.maximum !== null; });
      floors.forEach(function (floor) {
        caps.forEach(function (cap) {
          if (floor.index === cap.index || floor.constraint.unit !== cap.constraint.unit) return;
          if (floor.constraint.minimum > cap.constraint.maximum) {
            conflicts.push(mandateConflict("constraint-bounds-conflict", subject, [floor.index, cap.index],
              portfolioError("P008-INFEASIBLE", "constraint-bounds-conflict", "constraints[" + floor.index + "]", floor.index + 1, true)));
          }
        });
      });
      floors.forEach(function (floor) {
        caps.forEach(function (cap) {
          if (floor.index === cap.index || floor.constraint.unit === cap.constraint.unit) return;
          if (floor.constraint.minimum > 0) {
            conflicts.push(mandateConflict("constraint-unit-mismatch", subject, [floor.index, cap.index],
              portfolioError("P008-INFEASIBLE", "constraint-unit-mismatch", "constraints[" + floor.index + "]", floor.index + 1, true)));
          }
        });
      });
      group.filter(function (entry) { return entry.constraint.kind === "exclusion"; }).forEach(function (excluded) {
        group.forEach(function (entry) {
          if (entry.constraint.minimum !== null && entry.constraint.minimum > 0) {
            conflicts.push(mandateConflict("exclusion-minimum-conflict", subject, [excluded.index, entry.index],
              portfolioError("P008-INFEASIBLE", "exclusion-minimum-conflict", "constraints[" + entry.index + "]", entry.index + 1, true)));
          }
        });
      });
    });
    var seenPriorities = Object.create(null);
    body.cashNeeds.forEach(function (cashNeed, index) {
      var field = "cashNeeds[" + index + "]";
      if (cashNeed.date <= now.slice(0, 10)) {
        conflicts.push(mandateConflict("cash-need-date-past", cashNeed.date, [index],
          portfolioError("P008-INFEASIBLE", "cash-need-date-past", field + ".date", index + 1, true)));
      }
      if (body.horizon && cashNeed.date > body.horizon.endDate) {
        conflicts.push(mandateConflict("cash-need-after-horizon", cashNeed.date, [index],
          portfolioError("P008-INFEASIBLE", "cash-need-after-horizon", field + ".date", index + 1, true)));
      }
      if (index > 0 && cashNeed.date < body.cashNeeds[index - 1].date) {
        conflicts.push(mandateConflict("cash-need-declared-order-invalid", cashNeed.date, [index - 1, index],
          portfolioError("P008-INFEASIBLE", "cash-need-declared-order-invalid", field + ".date", index + 1, true)));
      }
      if (cashNeed.unit === "currency" && cashNeed.currency !== body.valuationCurrency) {
        conflicts.push(mandateConflict("cash-need-currency-unavailable", cashNeed.currency, [index],
          portfolioError("P008-CURRENCY", "cash-need-currency-unavailable", field + ".currency", index + 1, true)));
      }
      if (seenPriorities[cashNeed.priority]) {
        conflicts.push(mandateConflict("cash-need-priority-duplicate", String(cashNeed.priority), [seenPriorities[cashNeed.priority] - 1, index],
          portfolioError("P008-INFEASIBLE", "cash-need-priority-duplicate", field + ".priority", index + 1, true)));
      }
      seenPriorities[cashNeed.priority] = index + 1;
    });
    return conflicts;
  }

  function validateMandateDraft(raw, currentWorkspace, options, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(options) || !canonicalTimestamp(options.now)) return failure("P008-MANDATE-SHAPE", "mandate-options-invalid", "options", null, true);
    if (!isPlainObject(raw)) return failure("P008-MANDATE-SHAPE", "mandate-object-required", "mandate", null, true);
    var forbidden = policy.mandate.forbiddenInputSources.filter(function (source) {
      return Object.prototype.hasOwnProperty.call(raw, source);
    });
    if (forbidden.length > 0) {
      return failure("P008-MANDATE-AUTHORITY", "forbidden-input-source", forbidden.sort()[0], null, true);
    }
    var secretPath = findSecretPath(raw, policy, "mandate");
    if (secretPath) return failure("P008-IMPORT-SECRET", "secret-shaped-field", secretPath, null, false);
    var errors = [];
    var unknown = hasOnlyFields(raw, MANDATE_DRAFT_FIELDS);
    if (unknown) errors.push(portfolioError("P008-MANDATE-SHAPE", "unknown-field", unknown, null, true));
    if (!nonEmptyString(raw.objectiveLabel)) errors.push(portfolioError("P008-MANDATE-SHAPE", "objective-label-required", "objectiveLabel", null, true));
    if (!CURRENCY_PATTERN.test(raw.valuationCurrency || "")) errors.push(portfolioError("P008-CURRENCY", "valuation-currency-invalid", "valuationCurrency", null, true));
    var horizon = null;
    if (!isPlainObject(raw.horizon) || hasOnlyFields(raw.horizon, HORIZON_FIELDS) ||
        !calendarDate(raw.horizon.endDate) || policy.mandate.horizonUnits.indexOf(raw.horizon.unit) < 0) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "horizon-invalid", "horizon", null, true));
    } else if (raw.horizon.endDate <= options.now.slice(0, 10)) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "horizon-not-future", "horizon.endDate", null, true));
    } else {
      horizon = { endDate: raw.horizon.endDate, unit: raw.horizon.unit };
    }
    MANDATE_NULLABLE_POLICY_FIELDS.forEach(function (name) {
      if (raw[name] !== null && !nonEmptyString(raw[name])) {
        errors.push(portfolioError("P008-MANDATE-SHAPE", "explicit-null-or-text-required", name, null, true));
      }
    });
    if (!Array.isArray(raw.constraints) || raw.constraints.length > policy.mandate.maxConstraints) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "constraints-invalid", "constraints", null, true));
    }
    if (!Array.isArray(raw.cashNeeds) || raw.cashNeeds.length > policy.mandate.maxCashNeeds) {
      errors.push(portfolioError("P008-MANDATE-SHAPE", "cash-needs-invalid", "cashNeeds", null, true));
    }
    var rawConstraints = Array.isArray(raw.constraints) ? raw.constraints : [];
    var rawCashNeeds = Array.isArray(raw.cashNeeds) ? raw.cashNeeds : [];
    var constraints = rawConstraints.map(function (entry, index) { return normalizeConstraintDraft(entry, index, policy, errors); });
    var cashNeeds = rawCashNeeds.map(function (entry, index) { return normalizeCashNeedDraft(entry, index, policy, errors); });
    var constraintsComplete = constraints.every(function (entry) { return entry !== null; });
    var cashNeedsComplete = cashNeeds.every(function (entry) { return entry !== null; });
    var body = {
      objectiveLabel: nonEmptyString(raw.objectiveLabel) ? raw.objectiveLabel.trim() : null,
      valuationCurrency: CURRENCY_PATTERN.test(raw.valuationCurrency || "") ? raw.valuationCurrency : null,
      horizon: horizon,
      survivalDefinition: raw.survivalDefinition === null ? null : (nonEmptyString(raw.survivalDefinition) ? raw.survivalDefinition.trim() : null),
      rebalancePolicy: raw.rebalancePolicy === null ? null : (nonEmptyString(raw.rebalancePolicy) ? raw.rebalancePolicy.trim() : null),
      costPolicy: raw.costPolicy === null ? null : (nonEmptyString(raw.costPolicy) ? raw.costPolicy.trim() : null),
      expectedReturnPolicy: raw.expectedReturnPolicy === null ? null : (nonEmptyString(raw.expectedReturnPolicy) ? raw.expectedReturnPolicy.trim() : null),
      constraints: constraints.filter(function (entry) { return entry !== null; }),
      cashNeeds: cashNeeds.filter(function (entry) { return entry !== null; })
    };
    var conflicts = (constraintsComplete && cashNeedsComplete && horizon !== null && body.valuationCurrency !== null)
      ? detectMandateConflicts(body, options.now, policy) : [];
    var absentFields = MANDATE_NULLABLE_POLICY_FIELDS.filter(function (name) { return body[name] === null; });
    var workspacePresent = isPlainObject(currentWorkspace);
    return success({
      contractVersion: MANDATE_PREVIEW_VERSION,
      mandate: errors.length === 0 ? clone(body) : null,
      declaredConstraints: rawConstraints.length,
      declaredCashNeeds: rawCashNeeds.length,
      errors: errors,
      conflicts: conflicts,
      absentFields: absentFields,
      summary: {
        constraints: body.constraints.length,
        hardConstraints: body.constraints.filter(function (entry) { return entry.constraintKind === "hard"; }).length,
        researchConstraints: body.constraints.filter(function (entry) { return entry.constraintKind === "research"; }).length,
        cashNeeds: body.cashNeeds.length,
        absent: absentFields.length,
        conflicts: conflicts.length,
        rejected: errors.length
      },
      impact: {
        contractVersion: "portfolio-mandate-impact/v1",
        currentPortfolioId: workspacePresent ? currentWorkspace.currentPortfolioId : null,
        currentMandateId: workspacePresent ? currentWorkspace.currentMandateId : null,
        portfolioUnchanged: true,
        mandateUnchangedUntilConfirm: true,
        dependentStates: policy.mandate.mandateDependentStates.slice(),
        behaviorContribution: "none",
        settingsContribution: "none"
      },
      canConfirm: errors.length === 0 && conflicts.length === 0 &&
        body.constraints.length === rawConstraints.length && body.cashNeeds.length === rawCashNeeds.length
    });
  }

  function validateMandateConstraint(value, policy, declaredIndex) {
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "constraint-required", "constraint", null, false);
    var unknown = hasOnlyFields(value, CONSTRAINT_FIELDS);
    if (unknown || Object.keys(value).length !== CONSTRAINT_FIELDS.length) return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "constraint", null, false);
    if (value.contractVersion !== CONSTRAINT_VERSION || value.inputAuthority !== policy.mandate.inputAuthority ||
        policy.mandate.constraintTypes.indexOf(value.kind) < 0 || policy.mandate.constraintKinds.indexOf(value.constraintKind) < 0 ||
        policy.mandate.constraintUnits.indexOf(value.unit) < 0 || !nonEmptyString(value.subject) ||
        (value.minimum !== null && !finiteNonNegative(value.minimum)) || (value.maximum !== null && !finiteNonNegative(value.maximum))) {
      return failure("P008-SCHEMA-CORRUPT", "constraint-invalid", "constraint", null, false);
    }
    if (value.constraintId !== contracts.fingerprint("portfolio-mandate-constraint", constraintIdentityPayload(value, declaredIndex))) {
      return failure("P008-IDENTITY", "constraint-identity-mismatch", "constraintId", null, false);
    }
    return success(clone(value));
  }

  function validateCashNeed(value, policy, declaredIndex) {
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "cash-need-required", "cashNeed", null, false);
    var unknown = hasOnlyFields(value, CASH_NEED_FIELDS);
    if (unknown || Object.keys(value).length !== CASH_NEED_FIELDS.length) return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "cashNeed", null, false);
    if (value.contractVersion !== CASH_NEED_VERSION || value.inputAuthority !== policy.mandate.inputAuthority ||
        !calendarDate(value.date) || !finitePositive(value.amount) || !CURRENCY_PATTERN.test(value.currency || "") ||
        !Number.isInteger(value.priority) || value.priority <= 0 ||
        policy.mandate.cashNeedUnits.indexOf(value.unit) < 0 ||
        policy.mandate.treatmentTimings.indexOf(value.treatmentTiming) < 0) {
      return failure("P008-SCHEMA-CORRUPT", "cash-need-invalid", "cashNeed", null, false);
    }
    if (value.cashNeedId !== contracts.fingerprint("portfolio-cash-need", cashNeedIdentityPayload(value, declaredIndex))) {
      return failure("P008-IDENTITY", "cash-need-identity-mismatch", "cashNeedId", null, false);
    }
    return success(clone(value));
  }

  function validateMandateRevision(value, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "mandate-required", "mandate", null, false);
    var unknown = hasOnlyFields(value, MANDATE_FIELDS);
    if (unknown || Object.keys(value).length !== MANDATE_FIELDS.length) return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "mandate", null, false);
    if (value.contractVersion !== MANDATE_VERSION || !HASH_PATTERN.test(value.mandateId || "") ||
        !HASH_PATTERN.test(value.semanticFingerprint || "") || value.inputAuthority !== policy.mandate.inputAuthority ||
        !nonEmptyString(value.objectiveLabel) || !CURRENCY_PATTERN.test(value.valuationCurrency || "") ||
        !isPlainObject(value.horizon) || hasOnlyFields(value.horizon, HORIZON_FIELDS) ||
        !calendarDate(value.horizon.endDate) || policy.mandate.horizonUnits.indexOf(value.horizon.unit) < 0 ||
        !Array.isArray(value.constraints) || !Array.isArray(value.cashNeeds) ||
        value.constraints.length > policy.mandate.maxConstraints || value.cashNeeds.length > policy.mandate.maxCashNeeds ||
        !canonicalTimestamp(value.createdAt) || (value.supersedes !== null && !HASH_PATTERN.test(value.supersedes || ""))) {
      return failure("P008-SCHEMA-CORRUPT", "mandate-invalid", "mandate", null, false);
    }
    var nullableInvalid = MANDATE_NULLABLE_POLICY_FIELDS.some(function (name) {
      return value[name] !== null && !nonEmptyString(value[name]);
    });
    if (nullableInvalid) return failure("P008-SCHEMA-CORRUPT", "mandate-invalid", "mandate", null, false);
    var index;
    for (index = 0; index < value.constraints.length; index += 1) {
      var constraintResult = validateMandateConstraint(value.constraints[index], policy, index);
      if (!constraintResult.ok) return constraintResult;
    }
    for (index = 0; index < value.cashNeeds.length; index += 1) {
      var cashNeedResult = validateCashNeed(value.cashNeeds[index], policy, index);
      if (!cashNeedResult.ok) return cashNeedResult;
    }
    if (value.semanticFingerprint !== contracts.fingerprint("portfolio-mandate-semantic", mandateSemanticPayload(value)) ||
        value.mandateId !== contracts.fingerprint("portfolio-mandate", mandateIdentityPayload(value))) {
      return failure("P008-IDENTITY", "mandate-identity-mismatch", "mandateId", null, false);
    }
    return success(clone(value));
  }

  function buildMandateRevision(draft, currentWorkspace, options, policy) {
    if (!isPlainObject(draft) || draft.contractVersion !== MANDATE_PREVIEW_VERSION) return failure("P008-MANDATE-SHAPE", "mandate-draft-invalid", "draft", null, true);
    if (!draft.canConfirm || !isPlainObject(draft.mandate)) return failure("P008-MANDATE-SHAPE", "mandate-draft-not-confirmable", "draft", null, true);
    if (draft.conflicts.length > 0) return failure("P008-INFEASIBLE", "mandate-conflicts-unresolved", "conflicts", null, true);
    if (!isPlainObject(options) || !canonicalTimestamp(options.now)) return failure("P008-MANDATE-SHAPE", "mandate-options-invalid", "options", null, true);
    var mandate = {
      contractVersion: MANDATE_VERSION,
      mandateId: null,
      objectiveLabel: draft.mandate.objectiveLabel,
      valuationCurrency: draft.mandate.valuationCurrency,
      horizon: clone(draft.mandate.horizon),
      survivalDefinition: draft.mandate.survivalDefinition,
      rebalancePolicy: draft.mandate.rebalancePolicy,
      costPolicy: draft.mandate.costPolicy,
      expectedReturnPolicy: draft.mandate.expectedReturnPolicy,
      constraints: clone(draft.mandate.constraints),
      cashNeeds: clone(draft.mandate.cashNeeds),
      inputAuthority: policy.mandate.inputAuthority,
      createdAt: options.now,
      supersedes: currentWorkspace.currentMandateId,
      semanticFingerprint: null
    };
    mandate.semanticFingerprint = contracts.fingerprint("portfolio-mandate-semantic", mandateSemanticPayload(mandate));
    mandate.mandateId = contracts.fingerprint("portfolio-mandate", mandateIdentityPayload(mandate));
    return success(mandate);
  }

  function buildMandateCandidate(draft, currentWorkspace, options, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    var mandateResult = buildMandateRevision(draft, currentWorkspace, options, policy);
    if (!mandateResult.ok) return mandateResult;
    if (currentWorkspace.mandateRevisions.some(function (entry) { return entry.semanticFingerprint === mandateResult.value.semanticFingerprint; })) {
      return failure("P008-IDENTITY", "mandate-revision-unchanged", "mandateId", null, true);
    }
    var candidate = clone(currentWorkspace);
    candidate.mandateRevisions.push(mandateResult.value);
    candidate.currentMandateId = mandateResult.value.mandateId;
    candidate.updatedAt = options.now;
    candidate.policyRefs = policyRefs(policy);
    return success(withWorkspaceHashes(candidate));
  }

  function buildMandateClearCandidate(currentWorkspace, now, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    if (!canonicalTimestamp(now)) return failure("P008-SCHEMA-CORRUPT", "timestamp-invalid", "now", null, false);
    var candidate = clone(currentWorkspace);
    candidate.currentMandateId = null;
    candidate.updatedAt = now;
    candidate.policyRefs = policyRefs(policy);
    return success(withWorkspaceHashes(candidate));
  }

  function currentMandateRevision(workspace) {
    if (!workspace || workspace.currentMandateId === null) return null;
    var matches = workspace.mandateRevisions.filter(function (entry) { return entry.mandateId === workspace.currentMandateId; });
    return matches.length === 1 ? matches[0] : null;
  }

  // A name is an excluded behavior source when its normalized form contains a declared
  // forbidden token. Normalization strips separators first, so `dwell_time`, `dwellTime`,
  // and `Dwell-Time` are the same excluded source and cannot be smuggled past by casing.
  function forbiddenBehaviorField(name, policy) {
    var normalized = normalizeFieldName(name);
    return policy.behavior.forbiddenEventFields.some(function (token) { return normalized.indexOf(token) !== -1; });
  }

  // Returns the path of the first excluded source, or null. Recurses so a forbidden name
  // nested inside an otherwise allowed field is still named exactly rather than collapsing
  // into a generic shape error the UI cannot explain.
  function findForbiddenBehaviorPath(value, policy, path) {
    if (Array.isArray(value)) {
      for (var arrayIndex = 0; arrayIndex < value.length; arrayIndex += 1) {
        var arrayHit = findForbiddenBehaviorPath(value[arrayIndex], policy, path + "[" + arrayIndex + "]");
        if (arrayHit) return arrayHit;
      }
      return null;
    }
    if (isPlainObject(value)) {
      var keys = Object.keys(value);
      for (var objectIndex = 0; objectIndex < keys.length; objectIndex += 1) {
        if (forbiddenBehaviorField(keys[objectIndex], policy)) return path + "." + keys[objectIndex];
        var objectHit = findForbiddenBehaviorPath(value[keys[objectIndex]], policy, path + "." + keys[objectIndex]);
        if (objectHit) return objectHit;
      }
    }
    return null;
  }

  function utcDate(timestamp) {
    return String(timestamp).slice(0, 10);
  }

  // Semantic identity: the same completed research condition, on the same subject, on the
  // same UTC day is one piece of evidence however many times the surface reports it.
  // Retained only for persisted BehaviorEvent/v1 rows written before Scope 18. These rows can be
  // read and cleared, but cannot support relevance because they lack genericEvidenceIdentity.
  function legacyBehaviorDedupePayload(event) {
    return {
      contractVersion: "portfolio-behavior-dedupe/v1",
      category: event.category,
      subjectKind: event.subjectKind,
      subjectId: event.subjectId,
      domain: event.domain,
      completionConditionId: event.completionConditionId,
      utcDate: utcDate(event.occurredAt)
    };
  }

  function legacyBehaviorIdentityPayload(event) {
    var payload = legacyBehaviorDedupePayload(event);
    payload.contractVersion = "portfolio-behavior-event/v1";
    payload.horizon = event.horizon;
    payload.sourceSurface = event.sourceSurface;
    payload.resultIdentity = event.resultIdentity;
    payload.occurredAt = event.occurredAt;
    return payload;
  }

  function behaviorIdentityPayload(event) {
    return {
      contractVersion: BEHAVIOR_EVENT_IDENTITY_VERSION,
      category: event.category,
      subjectKind: event.subjectKind,
      subjectId: event.subjectId,
      domain: event.domain,
      horizon: event.horizon,
      sourceSurface: event.sourceSurface,
      resultIdentity: event.resultIdentity,
      genericEvidenceIdentity: event.genericEvidenceIdentity,
      completionConditionId: event.completionConditionId,
      policyVersion: event.policyVersion
    };
  }

  function canonicalBehaviorIdentity(event, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(event)) return failure("P008-BEHAVIOR-IDENTITY", "behavior-identity-required", "event", null, false);
    var payload = behaviorIdentityPayload(event);
    if (policy.behavior.eventCategories.indexOf(payload.category) < 0 ||
      typeof payload.policyVersion !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(payload.policyVersion) ||
        !safeToken(payload.subjectKind) || !safeToken(payload.subjectId) || !safeToken(payload.domain) ||
        !safeToken(payload.horizon) || !safeToken(payload.sourceSurface) ||
        !safeToken(payload.completionConditionId) || !HASH_PATTERN.test(payload.resultIdentity || "") ||
        !HASH_PATTERN.test(payload.genericEvidenceIdentity || "")) {
      return failure("P008-BEHAVIOR-IDENTITY", "behavior-identity-invalid", "event", null, false);
    }
    var fingerprintPayload = clone(payload);
    fingerprintPayload.contractVersion = "portfolio-behavior-event-identity/v1";
    payload.eventIdentity = contracts.fingerprint("portfolio-behavior-event-identity", fingerprintPayload);
    return success(payload);
  }

  function newYorkCivilDate(occurredAt) {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date(occurredAt));
    var values = {};
    parts.forEach(function (part) { values[part.type] = part.value; });
    return values.year + "-" + values.month + "-" + values.day;
  }

  function buildBehaviorOccurrence(eventIdentity, occurredAt) {
    if (!HASH_PATTERN.test(eventIdentity || "")) {
      return failure("P008-BEHAVIOR-IDENTITY", "event-identity-invalid", "eventIdentity", null, false);
    }
    if (!canonicalTimestamp(occurredAt)) {
      return failure("P008-BEHAVIOR-TIME", "occurred-at-invalid", "occurredAt", null, false);
    }
    var occurrence = {
      contractVersion: BEHAVIOR_OCCURRENCE_VERSION,
      eventIdentity: eventIdentity,
      occurredAt: occurredAt,
      newYorkCivilDate: newYorkCivilDate(occurredAt),
      occurrenceId: null
    };
    var fingerprintPayload = clone(occurrence);
    fingerprintPayload.contractVersion = "portfolio-behavior-occurrence/v1";
    occurrence.occurrenceId = contracts.fingerprint("portfolio-behavior-occurrence", fingerprintPayload);
    return success(occurrence);
  }

  function safeToken(value) {
    return typeof value === "string" && SAFE_REASON_PATTERN.test(value);
  }

  function readLegacyBehaviorEventV1(value, policy) {
    var unknown = hasOnlyFields(value, LEGACY_BEHAVIOR_EVENT_FIELDS);
    if (unknown || Object.keys(value).length !== LEGACY_BEHAVIOR_EVENT_FIELDS.length) {
      return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "behaviorEvent", null, false);
    }
    if (value.contractVersion !== BEHAVIOR_EVENT_VERSION || policy.behavior.eventCategories.indexOf(value.category) < 0 ||
        policy.behavior.eventLifecycleStates.indexOf(value.lifecycleState) < 0 ||
        value.policyVersion !== policy.behavior.contractVersion ||
        !safeToken(value.subjectKind) || !safeToken(value.subjectId) || !safeToken(value.domain) ||
        !safeToken(value.horizon) || !safeToken(value.sourceSurface) || !safeToken(value.completionConditionId) ||
        !HASH_PATTERN.test(value.resultIdentity || "") || !canonicalTimestamp(value.occurredAt) ||
        !HASH_PATTERN.test(value.eventId || "") || !HASH_PATTERN.test(value.dedupeKey || "")) {
      return failure("P008-SCHEMA-CORRUPT", "behavior-event-invalid", "behaviorEvent", null, false);
    }
    var expectedDedupe = contracts.fingerprint("portfolio-behavior-dedupe", legacyBehaviorDedupePayload(value));
    var expectedId = contracts.fingerprint("portfolio-behavior-event", legacyBehaviorIdentityPayload(value));
    if (value.dedupeKey !== expectedDedupe || value.eventId !== expectedId) {
      return failure("P008-IDENTITY", "behavior-event-identity-mismatch", "eventId", null, false);
    }
    return success(clone(value));
  }

  function validateBehaviorEvent(value, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "behavior-event-required", "behaviorEvent", null, false);
    var forbidden = findForbiddenBehaviorPath(value, policy, "behaviorEvent");
    if (forbidden) return failure("P008-SCHEMA-CORRUPT", "forbidden-behavior-source", forbidden, null, false);
    if (hasOnlyFields(value, LEGACY_BEHAVIOR_EVENT_FIELDS) === null &&
        Object.keys(value).length === LEGACY_BEHAVIOR_EVENT_FIELDS.length) {
      return readLegacyBehaviorEventV1(value, policy);
    }
    var unknown = hasOnlyFields(value, BEHAVIOR_EVENT_FIELDS);
    if (unknown || Object.keys(value).length !== BEHAVIOR_EVENT_FIELDS.length) {
      return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "behaviorEvent", null, false);
    }
    if (value.contractVersion !== BEHAVIOR_EVENT_VERSION || policy.behavior.eventCategories.indexOf(value.category) < 0 ||
        policy.behavior.eventLifecycleStates.indexOf(value.lifecycleState) < 0 ||
        value.policyVersion !== policy.behavior.contractVersion ||
        !safeToken(value.subjectKind) || !safeToken(value.subjectId) || !safeToken(value.domain) ||
        !safeToken(value.horizon) || !safeToken(value.sourceSurface) || !safeToken(value.completionConditionId) ||
        !HASH_PATTERN.test(value.resultIdentity || "") || !HASH_PATTERN.test(value.genericEvidenceIdentity || "") ||
        !canonicalTimestamp(value.occurredAt) || !HASH_PATTERN.test(value.eventId || "") ||
        !HASH_PATTERN.test(value.eventIdentity || "") || !HASH_PATTERN.test(value.dedupeKey || "") ||
        !isPlainObject(value.occurrence)) {
      return failure("P008-SCHEMA-CORRUPT", "behavior-event-invalid", "behaviorEvent", null, false);
    }
    var identityResult = canonicalBehaviorIdentity(value, policy);
    if (!identityResult.ok) return identityResult;
    var occurrenceResult = buildBehaviorOccurrence(identityResult.value.eventIdentity, value.occurredAt);
    if (!occurrenceResult.ok) return occurrenceResult;
    var occurrence = value.occurrence;
    var expectedOccurrence = occurrenceResult.value;
    var occurrenceFields = ["contractVersion", "eventIdentity", "newYorkCivilDate", "occurredAt", "occurrenceId"];
    if (value.eventIdentity !== identityResult.value.eventIdentity || value.dedupeKey !== value.eventIdentity ||
        value.eventId !== expectedOccurrence.occurrenceId ||
        hasOnlyFields(occurrence, occurrenceFields) !== null || Object.keys(occurrence).length !== occurrenceFields.length ||
        occurrence.contractVersion !== expectedOccurrence.contractVersion ||
        occurrence.eventIdentity !== expectedOccurrence.eventIdentity || occurrence.occurredAt !== expectedOccurrence.occurredAt ||
        occurrence.newYorkCivilDate !== expectedOccurrence.newYorkCivilDate || occurrence.occurrenceId !== expectedOccurrence.occurrenceId) {
      return failure("P008-IDENTITY", "behavior-event-identity-mismatch", "eventId", null, false);
    }
    return success(clone(value));
  }

  // The only constructor for an eligible event. A draft carrying any excluded source is
  // rejected by name before any field is read, so an engagement or sensitive-trait field
  // can never reach persistence even partially interpreted.
  function buildBehaviorEvent(draft, options, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(draft)) return failure("P008-SCHEMA-CORRUPT", "behavior-draft-required", "draft", null, true);
    var forbidden = findForbiddenBehaviorPath(draft, policy, "draft");
    if (forbidden) return failure("P008-SCHEMA-CORRUPT", "forbidden-behavior-source", forbidden, null, true);
    var unknown = hasOnlyFields(draft, BEHAVIOR_EVENT_DRAFT_FIELDS);
    if (unknown || Object.keys(draft).length !== BEHAVIOR_EVENT_DRAFT_FIELDS.length) {
      return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "draft", null, true);
    }
    if (!isPlainObject(options) || !canonicalTimestamp(options.now)) {
      return failure("P008-SCHEMA-CORRUPT", "behavior-options-invalid", "options", null, true);
    }
    var identityResult = canonicalBehaviorIdentity({
      category: draft.category,
      subjectKind: draft.subjectKind,
      subjectId: draft.subjectId,
      domain: draft.domain,
      horizon: draft.horizon,
      sourceSurface: draft.sourceSurface,
      resultIdentity: draft.resultIdentity,
      genericEvidenceIdentity: draft.genericEvidenceIdentity,
      completionConditionId: draft.completionConditionId,
      policyVersion: policy.behavior.contractVersion
    }, policy);
    if (!identityResult.ok) {
      if (identityResult.error && identityResult.error.reason === "behavior-identity-invalid") {
        return failure("P008-SCHEMA-CORRUPT", "behavior-event-invalid", "draft", null, true);
      }
      return identityResult;
    }
    var occurrenceResult = buildBehaviorOccurrence(identityResult.value.eventIdentity, options.now);
    if (!occurrenceResult.ok) return occurrenceResult;
    var event = {
      contractVersion: BEHAVIOR_EVENT_VERSION,
      eventId: occurrenceResult.value.occurrenceId,
      dedupeKey: identityResult.value.eventIdentity,
      category: draft.category,
      subjectKind: draft.subjectKind,
      subjectId: draft.subjectId,
      domain: draft.domain,
      horizon: draft.horizon,
      sourceSurface: draft.sourceSurface,
      resultIdentity: draft.resultIdentity,
      genericEvidenceIdentity: draft.genericEvidenceIdentity,
      completionConditionId: draft.completionConditionId,
      occurredAt: options.now,
      eventIdentity: identityResult.value.eventIdentity,
      occurrence: occurrenceResult.value,
      policyVersion: policy.behavior.contractVersion,
      lifecycleState: "eligible"
    };
    return validateBehaviorEvent(event, policy);
  }

  // Collapses semantic repeats to their earliest occurrence and reports what was collapsed,
  // so the evidence floor counts distinct completions rather than repeated reporting.
  function dedupeBehaviorEvents(events, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!Array.isArray(events)) return failure("P008-SCHEMA-CORRUPT", "behavior-events-required", "behaviorEvents", null, false);
    if (events.length > policy.behavior.maxBehaviorEvents) {
      return failure("P008-SCHEMA-CORRUPT", "behavior-event-cap-exceeded", "behaviorEvents", null, true);
    }
    var byKey = Object.create(null);
    var order = [];
    for (var index = 0; index < events.length; index += 1) {
      var eventResult = validateBehaviorEvent(events[index], policy);
      if (!eventResult.ok) return eventResult;
      var event = eventResult.value;
      var existing = byKey[event.dedupeKey];
      if (!existing) {
        byKey[event.dedupeKey] = event;
        order.push(event.dedupeKey);
      } else if (event.occurredAt < existing.occurredAt) {
        byKey[event.dedupeKey] = event;
      }
    }
    var retained = order.map(function (key) { return byKey[key]; });
    return success({
      contractVersion: "portfolio-behavior-dedupe-result/v1",
      events: retained,
      inputCount: events.length,
      retainedCount: retained.length,
      collapsedCount: events.length - retained.length
    });
  }

  /* A derived interest is still PERSONAL data, so it is validated as strictly as a behavior event:
     closed field set, forbidden-source scan, and a sensitivity band that admits only
     `non-sensitive`. The band is a closed list rather than a boolean so a future sensitive
     category has to be added deliberately instead of arriving as `true`. */
  function validateInterestSignal(value, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "interest-signal-required", "interestSignal", null, false);
    var forbidden = findForbiddenBehaviorPath(value, policy, "interestSignal");
    if (forbidden) return failure("P008-SCHEMA-CORRUPT", "forbidden-behavior-source", forbidden, null, false);
    var unknown = hasOnlyFields(value, INTEREST_SIGNAL_FIELDS);
    if (unknown || Object.keys(value).length !== INTEREST_SIGNAL_FIELDS.length) {
      return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "interestSignal", null, false);
    }
    if (value.contractVersion !== INTEREST_SIGNAL_VERSION ||
        !HASH_PATTERN.test(value.signalId || "") ||
        !safeToken(value.subjectId) || !safeToken(value.subjectKind) || !safeToken(value.domain) ||
        (value.horizon !== null && !safeToken(value.horizon)) ||
        !Array.isArray(value.supportingEventIds) || value.supportingEventIds.length === 0 ||
        !value.supportingEventIds.every(function (id) { return HASH_PATTERN.test(id || ""); }) ||
        typeof value.distinctUtcDateCount !== "number" || value.distinctUtcDateCount < 0 ||
        typeof value.evidenceScore !== "number" || !isFinite(value.evidenceScore) ||
        typeof value.floorSatisfied !== "boolean" ||
        INTEREST_RELEVANCE_BANDS.indexOf(value.relevanceBand) < 0 ||
        INTEREST_SENSITIVITY_BANDS.indexOf(value.sensitivityBand) < 0 ||
        !canonicalTimestamp(value.latestSupportAt) || !canonicalTimestamp(value.expiresAt)) {
      return failure("P008-SCHEMA-CORRUPT", "interest-signal-invalid", "interestSignal", null, false);
    }
    return success(value);
  }

  function validateActionOutcome(value, policy) {    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "action-outcome-required", "actionOutcome", null, false);
    var forbidden = findForbiddenBehaviorPath(value, policy, "actionOutcome");
    if (forbidden) return failure("P008-SCHEMA-CORRUPT", "forbidden-behavior-source", forbidden, null, false);
    var unknown = hasOnlyFields(value, ACTION_OUTCOME_FIELDS);
    if (unknown || Object.keys(value).length !== ACTION_OUTCOME_FIELDS.length) {
      return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "actionOutcome", null, false);
    }
    if (value.contractVersion !== ACTION_OUTCOME_VERSION || !HASH_PATTERN.test(value.actionId || "") ||
        policy.behavior.outcomeCommands.indexOf(value.command) < 0 ||
        policy.behavior.outcomeStates.indexOf(value.state) < 0 ||
        OUTCOME_COMMAND_STATES[value.command] !== value.state ||
        !safeToken(value.reason) || !canonicalTimestamp(value.occurredAt) || !HASH_PATTERN.test(value.outcomeId || "")) {
      return failure("P008-SCHEMA-CORRUPT", "action-outcome-invalid", "actionOutcome", null, false);
    }
    var expectedId = contracts.fingerprint("portfolio-action-outcome", {
      contractVersion: "portfolio-action-outcome/v1",
      actionId: value.actionId,
      command: value.command,
      reason: value.reason,
      occurredAt: value.occurredAt
    });
    if (value.outcomeId !== expectedId) return failure("P008-IDENTITY", "action-outcome-identity-mismatch", "outcomeId", null, false);
    return success(clone(value));
  }

  // One command maps to exactly one resulting state. Dismissal and invalidation record only
  // a safe reason token; neither carries a negative preference that could feed relevance.
  function reduceActionOutcome(actionId, command, reason, now, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (policy.behavior.outcomeCommands.indexOf(command) < 0) {
      return failure("P008-SCHEMA-CORRUPT", "unknown-outcome-command", "command", null, true);
    }
    var outcome = {
      contractVersion: ACTION_OUTCOME_VERSION,
      outcomeId: null,
      actionId: actionId,
      command: command,
      state: OUTCOME_COMMAND_STATES[command],
      reason: reason,
      occurredAt: now
    };
    outcome.outcomeId = contracts.fingerprint("portfolio-action-outcome", {
      contractVersion: "portfolio-action-outcome/v1",
      actionId: actionId,
      command: command,
      reason: reason,
      occurredAt: now
    });
    return validateActionOutcome(outcome, policy);
  }

  // Appending an event is a normal workspace revision, so it inherits the same pointer-swap
  // commit and generation check as a portfolio or mandate change. A semantic repeat is
  // recorded as `duplicate` and changes nothing, rather than growing the stored evidence.
  function buildBehaviorCandidate(draft, currentWorkspace, options, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    var eventResult = buildBehaviorEvent(draft, options, policy);
    if (!eventResult.ok) return eventResult;
    var candidate = clone(currentWorkspace);
    var duplicate = candidate.behaviorEvents.some(function (entry) { return entry.eventId === eventResult.value.eventId; });
    if (!duplicate) {
      if (candidate.behaviorEvents.length + 1 > policy.behavior.maxBehaviorEvents) {
        return failure("P008-SCHEMA-CORRUPT", "behavior-event-cap-exceeded", "behaviorEvents", null, true);
      }
      candidate.behaviorEvents.push(eventResult.value);
    }
    candidate.updatedAt = options.now;
    candidate.policyRefs = policyRefs(policy);
    var hashed = withWorkspaceHashes(candidate);
    var validated = validateWorkspace(hashed, policy);
    if (!validated.ok) return validated;
    return success({
      contractVersion: "portfolio-behavior-candidate/v1",
      workspace: hashed,
      event: eventResult.value,
      accepted: !duplicate,
      reason: duplicate ? "duplicate-completion" : null
    });
  }

  /* Derives interest signals from EXPLICITLY completed actions only. It reads `behaviorEvents`,
     which the privacy layer populates from deliberate completion commands, so a setting or a
     passive view can never reach this function's input. Signals below the declared floor are still
     EMITTED, carrying `floorSatisfied: false` and the `insufficient-evidence` band, because the
     brief must be able to say "too little history" with real counts rather than show nothing and
     leave the reason to inference. */
  function deriveInterestSignals(workspace, now, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    var workspaceResult = validateWorkspace(workspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    if (!canonicalTimestamp(now)) return failure("P008-SCHEMA-CORRUPT", "timestamp-invalid", "now", null, false);

    var behavior = policy.behavior;
    var byDomain = Object.create(null);
    workspace.behaviorEvents.forEach(function (event) {
      if (!event || !event.domain) return;
      if (event.lifecycleState !== "eligible") return;
      if (!event.genericEvidenceIdentity || !event.eventIdentity || !event.occurrence) return;
      var key = String(event.domain);
      if (!byDomain[key]) {
        byDomain[key] = {
          domain: key,
          subjectKind: "domain",
          horizon: null,
          eventIdentities: Object.create(null),
          dates: Object.create(null),
          latest: null,
          score: 0
        };
      }
      var bucket = byDomain[key];
      var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
      if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;
      bucket.eventIdentities[event.eventIdentity] = true;
      bucket.dates[event.occurrence.newYorkCivilDate] = true;
      if (!bucket.horizon && event.horizon) bucket.horizon = event.horizon;
      if (!bucket.latest || event.occurredAt > bucket.latest) bucket.latest = event.occurredAt;
      bucket.score += Math.pow(0.5, ageDays / behavior.halfLifeDays);
    });

    var signals = Object.keys(byDomain).sort().map(function (key) {
      var bucket = byDomain[key];
      var distinctDates = Object.keys(bucket.dates).length;
      var eventIds = Object.keys(bucket.eventIdentities).sort();
      var distinctEvents = eventIds.length;
      var satisfied = distinctEvents >= behavior.minimumDistinctCompletions &&
        distinctDates >= behavior.minimumDistinctUtcDates;
      var band = "insufficient-evidence";
      if (satisfied) {
        band = distinctEvents >= behavior.highScore ? "strong-relevance"
          : distinctEvents >= behavior.mediumScore ? "moderate-relevance" : "weak-relevance";
      }
      var signal = {
        contractVersion: INTEREST_SIGNAL_VERSION,
        signalId: null,
        subjectId: bucket.domain,
        subjectKind: bucket.subjectKind,
        domain: bucket.domain,
        horizon: bucket.horizon,
        supportingEventIds: eventIds,
        distinctUtcDateCount: distinctDates,
        evidenceScore: Math.round(bucket.score * 10000) / 10000,
        floorSatisfied: satisfied,
        relevanceBand: band,
        sensitivityBand: "non-sensitive",
        latestSupportAt: bucket.latest,
        // Expiry is derived from declared policy, so a signal cannot outlive the evidence under it.
        expiresAt: new Date(Date.parse(bucket.latest) + behavior.maximumEvidenceAgeDays * 86400000).toISOString()
      };
      signal.signalId = contracts.fingerprint("portfolio-interest-signal", {
        contractVersion: "portfolio-interest-signal/v1",
        subjectId: signal.subjectId,
        domain: signal.domain,
        supportingEventIds: signal.supportingEventIds
      });
      return signal;
    });

    for (var index = 0; index < signals.length; index += 1) {
      var validated = validateInterestSignal(signals[index], policy);
      if (!validated.ok) return validated;
    }
    return success(signals);
  }

  /* Persists derived signals through the same reduce-apply-rehash-revalidate path every other
     mutation uses. Derivation is REPLACING, not appending: a signal is a current statement about
     the evidence, so stale signals must not accumulate beside the ones just derived. */
  function buildInterestSignalCandidate(currentWorkspace, now, policy) {
    var derived = deriveInterestSignals(currentWorkspace, now, policy);
    if (!derived.ok) return derived;
    var candidate = clone(currentWorkspace);
    candidate.interestSignals = derived.value;
    candidate.updatedAt = now;
    candidate.policyRefs = policyRefs(policy);
    var hashed = withWorkspaceHashes(candidate);
    var validated = validateWorkspace(hashed, policy);
    if (!validated.ok) return validated;
    return success({
      contractVersion: "portfolio-interest-signal-candidate/v1",
      workspace: hashed,
      signals: derived.value,
      signalCount: derived.value.length
    });
  }

  /* A research action's stable identity. An outcome must point at a SPECIFIC authored action, not
     at a bare ticker: the same subject can be authored differently in two windows, and recording
     "MSFT was completed" would silently discharge both. The brief composer stays dependency-free,
     so identity is computed here, next to the contracts module that already owns fingerprinting. */
  function actionIdentity(descriptor) {
    if (!isPlainObject(descriptor)) return failure("P008-SCHEMA-CORRUPT", "action-descriptor-required", "descriptor", null, false);
    var required = ["windowId", "subjectId", "lane", "evidenceCutoffAt"];
    for (var index = 0; index < required.length; index += 1) {
      if (typeof descriptor[required[index]] !== "string" || !descriptor[required[index]]) {
        return failure("P008-SCHEMA-CORRUPT", "action-descriptor-incomplete", required[index], null, false);
      }
    }
    return success(contracts.fingerprint("portfolio-research-action", {
      contractVersion: "portfolio-research-action/v1",
      windowId: descriptor.windowId,
      subjectId: descriptor.subjectId,
      lane: descriptor.lane,
      evidenceCutoffAt: descriptor.evidenceCutoffAt
    }));
  }

  /* An action outcome mutates the workspace the SAME way every other mutation does: reduce, apply,
     re-hash, re-validate. Callers must not hand-roll this — appending to `actionOutcomes` without
     recomputing the hashes produces a candidate that fails validation at commit, which surfaces to
     the user as a lifecycle button that silently does nothing. */
  var SCENARIO_FIELDS = Object.freeze([
    "computedAt", "identity", "label", "scenarioId", "summary"
  ]);

  /* A saved scenario stores its IDENTITY and a summary, never the resampled paths. The identity
     reproduces the paths exactly, so persisting thousands of rows would duplicate derivable data in
     private storage for no gain and widen what a clear has to remove. */
  function validateScenario(value) {
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "scenario-invalid", "scenarios", null, false);
    var unknown = hasOnlyFields(value, SCENARIO_FIELDS);
    if (unknown || Object.keys(value).length !== SCENARIO_FIELDS.length) {
      return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "scenarios", null, false);
    }
    if (!HASH_PATTERN.test(value.scenarioId || "") || !nonEmptyString(value.identity) ||
        !nonEmptyString(value.label) || value.label.length > 120 ||
        !canonicalTimestamp(value.computedAt) || !isPlainObject(value.summary)) {
      return failure("P008-SCHEMA-CORRUPT", "scenario-invalid", "scenarios", null, false);
    }
    return success(value);
  }

  var ALLOCATION_FIELDS = Object.freeze([
    "allocationId", "basisIdentity", "computedAt", "label", "method", "summary"
  ]);

  var DOSSIER_FIELDS = Object.freeze([
    "basisIdentity", "claimBoundary", "corrections", "dossierId", "recordedAt", "summary", "title"
  ]);

  /* A saved dossier is a research CLAIM about the owner's own holdings, so it
     carries its claim boundary with it. Storing the finding without the boundary
     would let a re-read present a scoped, cost-adjusted, trial-discounted result
     as an unqualified one - the exact failure this scope exists to prevent, and
     the reason the boundary is a required field rather than presentation copy.

     Corrections append; they never overwrite. A dossier whose earlier claim can
     be edited out of existence is not a record, and the correction history is
     the part that shows a reader the claim moved. */
  function validateDossier(value) {
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "dossier-invalid", "dossiers", null, false);
    var unknown = hasOnlyFields(value, DOSSIER_FIELDS);
    if (unknown || Object.keys(value).length !== DOSSIER_FIELDS.length) {
      return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "dossiers", null, false);
    }
    if (!HASH_PATTERN.test(value.dossierId || "") || !nonEmptyString(value.basisIdentity) ||
        !nonEmptyString(value.title) || value.title.length > 120 ||
        !nonEmptyString(value.claimBoundary) ||
        !canonicalTimestamp(value.recordedAt) || !isPlainObject(value.summary) ||
        !Array.isArray(value.corrections)) {
      return failure("P008-SCHEMA-CORRUPT", "dossier-invalid", "dossiers", null, false);
    }
    for (var correctionIndex = 0; correctionIndex < value.corrections.length; correctionIndex += 1) {
      var correction = value.corrections[correctionIndex];
      if (!isPlainObject(correction) || !nonEmptyString(correction.note) ||
          correction.note.length > 400 || !canonicalTimestamp(correction.recordedAt) ||
          Object.keys(correction).length !== 2) {
        return failure("P008-SCHEMA-CORRUPT", "dossier-correction-invalid", "dossiers", null, false);
      }
    }
    return success(value);
  }

  /* The real write path for the dossiers section. Scope 03 pins that no personal
     section may be declared without one, so that its clear sweep cannot be
     vacuously true over an empty-by-construction container. */
  function buildDossierCandidate(basisIdentity, title, claimBoundary, summary, currentWorkspace, now, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    if (!nonEmptyString(basisIdentity) || !nonEmptyString(title) || title.length > 120 ||
        !nonEmptyString(claimBoundary) || !isPlainObject(summary)) {
      return failure("P008-SCHEMA-CORRUPT", "dossier-input-invalid", "dossiers", null, false);
    }
    if (!canonicalTimestamp(now)) return failure("P008-SCHEMA-CORRUPT", "timestamp-invalid", "now", null, false);

    var dossier = {
      dossierId: contracts.fingerprint("portfolio-dossier", {
        contractVersion: "portfolio-dossier-identity/v1",
        basisIdentity: basisIdentity,
        title: title
      }),
      basisIdentity: basisIdentity,
      title: title,
      claimBoundary: claimBoundary,
      summary: clone(summary),
      corrections: [],
      recordedAt: now
    };
    var validated = validateDossier(dossier);
    if (!validated.ok) return validated;

    var candidate = clone(currentWorkspace);
    // Saving the same basis and title twice is a no-op, not a second dossier.
    var duplicate = candidate.dossiers.some(function (entry) { return entry.dossierId === dossier.dossierId; });
    if (!duplicate) candidate.dossiers.push(dossier);
    candidate.updatedAt = now;
    candidate.policyRefs = policyRefs(policy);
    var hashedDossier = withWorkspaceHashes(candidate);
    var dossierWorkspaceValid = validateWorkspace(hashedDossier, policy);
    if (!dossierWorkspaceValid.ok) return dossierWorkspaceValid;
    return success({
      contractVersion: "portfolio-dossier-candidate/v1",
      workspace: hashedDossier,
      dossier: dossier,
      accepted: !duplicate,
      reason: duplicate ? "duplicate-dossier" : null
    });
  }

  /* A saved allocation stores its BASIS identity and a summary, never the full
     candidate matrix. The basis reproduces the candidate exactly, so persisting
     the weights would duplicate derivable data in private storage and widen
     what a clear has to remove. */
  function validateAllocation(value) {
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "allocation-invalid", "allocations", null, false);
    var unknown = hasOnlyFields(value, ALLOCATION_FIELDS);
    if (unknown || Object.keys(value).length !== ALLOCATION_FIELDS.length) {
      return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "allocations", null, false);
    }
    if (!HASH_PATTERN.test(value.allocationId || "") || !nonEmptyString(value.basisIdentity) ||
        !nonEmptyString(value.label) || value.label.length > 120 ||
        !nonEmptyString(value.method) ||
        !canonicalTimestamp(value.computedAt) || !isPlainObject(value.summary)) {
      return failure("P008-SCHEMA-CORRUPT", "allocation-invalid", "allocations", null, false);
    }
    return success(value);
  }

  /* The real write path for the allocations section. Scope 03 pins that no
     personal section may be declared without one, so that its clear sweep
     cannot be vacuously true over an empty-by-construction container. */
  function buildAllocationCandidate(basisIdentity, method, label, summary, currentWorkspace, now, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    if (!nonEmptyString(basisIdentity) || !nonEmptyString(method) ||
        !nonEmptyString(label) || label.length > 120 || !isPlainObject(summary)) {
      return failure("P008-SCHEMA-CORRUPT", "allocation-input-invalid", "allocations", null, false);
    }
    if (!canonicalTimestamp(now)) return failure("P008-SCHEMA-CORRUPT", "timestamp-invalid", "now", null, false);

    var allocation = {
      allocationId: contracts.fingerprint("portfolio-allocation", {
        contractVersion: "portfolio-allocation-identity/v1",
        basisIdentity: basisIdentity,
        method: method,
        label: label
      }),
      basisIdentity: basisIdentity,
      method: method,
      label: label,
      summary: clone(summary),
      computedAt: now
    };
    var validated = validateAllocation(allocation);
    if (!validated.ok) return validated;

    var candidate = clone(currentWorkspace);
    // Saving the same basis and method twice is a no-op, not a second allocation.
    var duplicate = candidate.allocations.some(function (entry) { return entry.allocationId === allocation.allocationId; });
    if (!duplicate) candidate.allocations.push(allocation);
    candidate.updatedAt = now;
    candidate.policyRefs = policyRefs(policy);
    var hashed = withWorkspaceHashes(candidate);
    var workspaceValid = validateWorkspace(hashed, policy);
    if (!workspaceValid.ok) return workspaceValid;
    return success({
      contractVersion: "portfolio-allocation-candidate/v1",
      workspace: hashed,
      allocation: allocation,
      accepted: !duplicate,
      reason: duplicate ? "duplicate-allocation" : null
    });
  }

  /* The real write path for the scenarios section. Scope 03 pins that no personal section may be
     declared without one, so that its clear sweep cannot be vacuously true over an
     empty-by-construction container. */
  function buildScenarioCandidate(identity, label, summary, currentWorkspace, now, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    if (!nonEmptyString(identity) || !nonEmptyString(label) || label.length > 120 || !isPlainObject(summary)) {
      return failure("P008-SCHEMA-CORRUPT", "scenario-input-invalid", "scenarios", null, false);
    }
    if (!canonicalTimestamp(now)) return failure("P008-SCHEMA-CORRUPT", "timestamp-invalid", "now", null, false);

    var scenario = {
      scenarioId: contracts.fingerprint("portfolio-scenario", {
        contractVersion: "portfolio-scenario-identity/v1",
        identity: identity,
        label: label
      }),
      identity: identity,
      label: label,
      summary: clone(summary),
      computedAt: now
    };
    var validated = validateScenario(scenario);
    if (!validated.ok) return validated;

    var candidate = clone(currentWorkspace);
    // Saving the same identity under the same label twice is a no-op, not a second scenario.
    var duplicate = candidate.scenarios.some(function (entry) { return entry.scenarioId === scenario.scenarioId; });
    if (!duplicate) candidate.scenarios.push(scenario);
    candidate.updatedAt = now;
    candidate.policyRefs = policyRefs(policy);
    var hashed = withWorkspaceHashes(candidate);
    var workspaceValid = validateWorkspace(hashed, policy);
    if (!workspaceValid.ok) return workspaceValid;
    return success({
      contractVersion: "portfolio-scenario-candidate/v1",
      workspace: hashed,
      scenario: scenario,
      accepted: !duplicate,
      reason: duplicate ? "duplicate-scenario" : null
    });
  }

  function buildActionOutcomeCandidate(actionId, command, reason, currentWorkspace, now, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    var reduced = reduceActionOutcome(actionId, command, reason, now, policy);
    if (!reduced.ok) return reduced;
    var candidate = clone(currentWorkspace);
    // Recording the same command for the same action twice is a no-op, not a second outcome.
    var duplicate = candidate.actionOutcomes.some(function (entry) {
      return entry.outcomeId === reduced.value.outcomeId;
    });
    if (!duplicate) candidate.actionOutcomes.push(reduced.value);
    candidate.updatedAt = now;
    candidate.policyRefs = policyRefs(policy);
    var hashed = withWorkspaceHashes(candidate);
    var validated = validateWorkspace(hashed, policy);
    if (!validated.ok) return validated;
    return success({
      contractVersion: "portfolio-action-outcome-candidate/v1",
      workspace: hashed,
      outcome: reduced.value,
      accepted: !duplicate,
      reason: duplicate ? "duplicate-outcome" : null
    });
  }

  // Behavior-only clear. Portfolio and mandate revisions, the current pointers, and the
  // creation time are copied through untouched: the affected set is exactly events,
  // interests, and the completed/dismissed outcomes design.md names.
  function buildBehaviorClearCandidate(currentWorkspace, now, policy) {
    var workspaceResult = validateWorkspace(currentWorkspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    if (!canonicalTimestamp(now)) return failure("P008-SCHEMA-CORRUPT", "timestamp-invalid", "now", null, false);
    var candidate = clone(currentWorkspace);
    var clearedEvents = candidate.behaviorEvents.length;
    var clearedSignals = candidate.interestSignals.length;
    var retainedOutcomes = candidate.actionOutcomes.filter(function (entry) {
      return BEHAVIOR_CLEARED_OUTCOME_STATES.indexOf(entry.state) < 0;
    });
    var clearedOutcomes = candidate.actionOutcomes.length - retainedOutcomes.length;
    candidate.behaviorEvents = [];
    candidate.interestSignals = [];
    candidate.actionOutcomes = retainedOutcomes;
    candidate.updatedAt = now;
    candidate.policyRefs = policyRefs(policy);
    var hashed = withWorkspaceHashes(candidate);
    var validated = validateWorkspace(hashed, policy);
    if (!validated.ok) return validated;
    return success({
      contractVersion: "portfolio-behavior-clear-candidate/v1",
      workspace: hashed,
      clearedEventCount: clearedEvents,
      clearedInterestCount: clearedSignals,
      clearedOutcomeCount: clearedOutcomes,
      retainedOutcomeCount: retainedOutcomes.length,
      preservedPortfolioId: hashed.currentPortfolioId,
      preservedMandateId: hashed.currentMandateId
    });
  }

  function projectRouteStates(workspace, policy) {
    var workspaceResult = validateWorkspace(workspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    var mandate = currentMandateRevision(workspace);
    var portfolioPresent = workspace.currentPortfolioId !== null;
    var inferredValues = {};
    policy.mandate.neverInferredFields.forEach(function (name) { inferredValues[name] = null; });
    var routes = policy.mandate.descriptiveRouteStates.map(function (route) {
      return {
        route: route,
        descriptive: {
          available: portfolioPresent,
          reason: portfolioPresent ? null : "portfolio-absent",
          citedPortfolioId: portfolioPresent ? workspace.currentPortfolioId : null
        },
        mandateDependent: policy.mandate.mandateDependentStates.map(function (name) {
          return {
            state: name,
            available: mandate !== null,
            reason: mandate !== null ? null : "mandate-absent",
            citedMandateId: mandate !== null ? mandate.mandateId : null
          };
        }),
        horizon: mandate !== null ? clone(mandate.horizon) : null,
        constraints: mandate !== null ? clone(mandate.constraints) : [],
        cashNeeds: mandate !== null ? clone(mandate.cashNeeds) : [],
        inferredValues: clone(inferredValues)
      };
    });
    return success({
      contractVersion: ROUTE_STATE_VERSION,
      currentPortfolioId: workspace.currentPortfolioId,
      currentMandateId: workspace.currentMandateId,
      citedMandateFingerprint: mandate !== null ? mandate.semanticFingerprint : null,
      behaviorContribution: "none",
      settingsContribution: "none",
      routes: routes
    });
  }

  function storageState(mode, policy, lastVerifiedWrite, generation) {    return deepFreeze({
      contractVersion: STORAGE_STATE_VERSION,
      mode: mode,
      durable: mode === "durable",
      savedDurably: mode === "durable" && lastVerifiedWrite,
      warning: mode === "durable" ? null : (mode === "session" ? policy.display.sessionWarning : policy.display.memoryWarning),
      lastVerifiedWrite: lastVerifiedWrite,
      generation: generation
    });
  }

  function probeStorage(storage, key, value) {
    try {
      storage.setItem(key, value);
      var verified = storage.getItem(key) === value;
      storage.removeItem(key);
      return verified;
    } catch (error) {
      try { storage.removeItem(key); } catch (removeError) { /* probe cleanup is already unavailable */ }
      return false;
    }
  }

  function parseJson(raw) {
    try { return { ok: true, value: JSON.parse(raw) }; } catch (error) { return { ok: false }; }
  }

  function workspaceVersionNumber(contractVersion) {
    var match = /^portfolioworkspace\/v(\d+)$/i.exec(String(contractVersion).replace(/-/g, ""));
    return match ? Number(match[1]) : null;
  }

  function pointerResult(value) {
    if (!isPlainObject(value) || hasOnlyFields(value, ["activeSlot", "contentSha256", "contractVersion", "generation", "semanticFingerprint"]) ||
        value.contractVersion !== POINTER_VERSION || ["slotA", "slotB"].indexOf(value.activeSlot) < 0 ||
        !Number.isInteger(value.generation) || value.generation < 0 || !HASH_PATTERN.test(value.semanticFingerprint || "") ||
        !HASH_PATTERN.test(value.contentSha256 || "")) {
      return failure("P008-SCHEMA-CORRUPT", "pointer-invalid", "pointer", null, false);
    }
    return success(clone(value));
  }

  function createEmptyControllerPersonalState() {
    return deepFreeze({
      editorDrafts: [],
      mandateAndCashNeedDrafts: [],
      scenarioInputs: [],
      hedgeVariants: [],
      blackLittermanViews: [],
      activeIdentities: {},
      draftIdentities: {},
      activeViewModels: {},
      lastValidViewModels: {},
      computeState: null,
      displayState: {},
      disclosureState: {},
      focusRestorationState: null
    });
  }

  function storageEntries(storage) {
    var entries = [];
    for (var index = 0; index < storage.length; index += 1) {
      var key = storage.key(index);
      if (typeof key === "string") entries.push({ key: key, value: storage.getItem(key) });
    }
    entries.sort(function (left, right) { return left.key < right.key ? -1 : (left.key > right.key ? 1 : 0); });
    return entries;
  }

  function reservedPersonalKey(key) {
    return typeof key === "string" && (key.indexOf("rlPortfolio") === 0 || key === "rlReturnContextV1");
  }

  function personalDescriptor(categoryId, categoryLocation, sourcePath, emptyRule) {
    return {
      contractVersion: "PersonalCategoryDescriptor/v1",
      categoryId: categoryId,
      location: categoryLocation,
      sourcePath: sourcePath,
      clearMode: "all-personal",
      emptyRule: emptyRule,
      sensitive: true
    };
  }

  function declaredStorageDescriptors(policy) {
    var descriptors = [
      personalDescriptor("storage:local:" + policy.storage.pointerKey, "local-storage", policy.storage.pointerKey, "absent"),
      personalDescriptor("storage:local:" + policy.storage.quarantineKey, "local-storage", policy.storage.quarantineKey, "absent"),
      personalDescriptor("storage:local:" + policy.storage.displayModeKey, "local-storage", policy.storage.displayModeKey, "absent"),
      personalDescriptor("storage:session:" + policy.storage.sessionKey, "session-storage", policy.storage.sessionKey, "absent"),
      personalDescriptor("storage:session:" + policy.storage.returnContextKey, "session-storage", policy.storage.returnContextKey, "absent")
    ];
    policy.storage.slotKeys.forEach(function (key) {
      descriptors.push(personalDescriptor("storage:local:" + key, "local-storage", key, "absent"));
    });
    return descriptors.sort(function (left, right) { return left.categoryId < right.categoryId ? -1 : 1; });
  }

  function workspaceDescriptors(emptyWorkspace) {
    var descriptors = Object.keys(emptyWorkspace).filter(function (field) {
      return emptyWorkspace[field] === null || Array.isArray(emptyWorkspace[field]);
    }).map(function (field) {
      return personalDescriptor(
        "workspace:" + field,
        "workspace-section",
        field,
        Array.isArray(emptyWorkspace[field]) ? "empty-array" : "null"
      );
    });
    descriptors.push(personalDescriptor("workspace:cash-needs", "workspace-section", "mandateRevisions[].cashNeeds", "empty-array"));
    descriptors.push(personalDescriptor("workspace:supersession-records", "workspace-section", "portfolioRevisions[].supersedes", "empty-array"));
    return descriptors.sort(function (left, right) { return left.categoryId < right.categoryId ? -1 : 1; });
  }

  function controllerDescriptors(emptyController) {
    return Object.keys(emptyController).sort().map(function (field) {
      var value = emptyController[field];
      var rule = Array.isArray(value) ? "empty-array" : value === null ? "null" : value === false ? "false" : "empty-object";
      return personalDescriptor("controller:" + field, "controller-state", field, rule);
    });
  }

  function safeValueHash(value, categoryId) {
    return contracts.contentSha256({ categoryId: categoryId, value: value }, "portfolio-clear-residue/v1");
  }

  function derivePersonalCategoryRegistry(request) {
    if (!isPlainObject(request) || !isPlainObject(request.storageAdapters) ||
        !request.storageAdapters.localStorage || !request.storageAdapters.sessionStorage ||
        !isPlainObject(request.controller) || !isPlainObject(request.controller.controllerPersonalState)) {
      return failure("P008-CLEAR-PARTIAL", "clear-adapters-required", "request", null, false);
    }
    var policyResult = validatePolicy(request.policy);
    if (!policyResult.ok) return policyResult;
    var workspaceResult = validateWorkspace(request.workspace, request.policy);
    if (!workspaceResult.ok) return workspaceResult;
    var emptyWorkspaceResult = createEmptyWorkspace(request.policy, request.now);
    if (!emptyWorkspaceResult.ok) return emptyWorkspaceResult;
    var emptyController = createEmptyControllerPersonalState();
    var storageCategories = declaredStorageDescriptors(request.policy);
    var declared = Object.create(null);
    storageCategories.forEach(function (descriptor) {
      declared[descriptor.location + ":" + descriptor.sourcePath] = true;
    });
    var discoveredUndeclared = [];
    var publicExclusions = [];
    try {
      [
        { storage: request.storageAdapters.localStorage, location: "local-storage" },
        { storage: request.storageAdapters.sessionStorage, location: "session-storage" }
      ].forEach(function (entry) {
        storageEntries(entry.storage).forEach(function (stored) {
          var locationKey = entry.location + ":" + stored.key;
          if (reservedPersonalKey(stored.key) && !declared[locationKey]) {
            discoveredUndeclared.push({
              categoryId: "undeclared:" + locationKey,
              location: entry.location,
              sourcePath: stored.key,
              residueHash: safeValueHash(stored.value, locationKey)
            });
          } else if (!reservedPersonalKey(stored.key)) {
            publicExclusions.push({
              categoryId: "public:" + locationKey,
              location: entry.location,
              sourcePath: stored.key,
              contentSha256: safeValueHash(stored.value, "public:" + locationKey)
            });
          }
        });
      });
    } catch (error) {
      return failure("P008-CLEAR-PARTIAL", "storage-enumeration-failed", "storage", null, true);
    }
    var controllerCategories = controllerDescriptors(emptyController);
    var declaredController = Object.create(null);
    controllerCategories.forEach(function (descriptor) { declaredController[descriptor.sourcePath] = true; });
    Object.keys(request.controller.controllerPersonalState).sort().forEach(function (field) {
      if (!declaredController[field]) {
        discoveredUndeclared.push({
          categoryId: "undeclared:controller-state:" + field,
          location: "controller-state",
          sourcePath: field,
          residueHash: safeValueHash(request.controller.controllerPersonalState[field], "controller:" + field)
        });
      }
    });
    discoveredUndeclared.sort(function (left, right) { return left.categoryId < right.categoryId ? -1 : 1; });
    publicExclusions.sort(function (left, right) { return left.categoryId < right.categoryId ? -1 : 1; });
    var registry = {
      contractVersion: PERSONAL_CATEGORY_REGISTRY_VERSION,
      registryFingerprint: null,
      ownedStoragePrefixes: ["rlPortfolio*", "rlReturnContextV1"],
      storageCategories: storageCategories,
      workspaceCategories: workspaceDescriptors(emptyWorkspaceResult.value),
      controllerCategories: controllerCategories,
      discoveredUndeclared: discoveredUndeclared,
      publicExclusions: publicExclusions
    };
    var fingerprintPayload = clone(registry);
    delete fingerprintPayload.registryFingerprint;
    registry.registryFingerprint = contracts.contentSha256(fingerprintPayload, "personal-category-registry/v1");
    return success(deepFreeze(registry));
  }

  function validateClearTombstone(value, policy) {
    var fields = [
      "contentSha256", "contractVersion", "createdAt", "operationId", "registryFingerprint", "semanticFingerprint", "workspace"
    ];
    if (!isPlainObject(value) || hasOnlyFields(value, fields) || Object.keys(value).length !== fields.length ||
        value.contractVersion !== CLEAR_TOMBSTONE_VERSION || !HASH_PATTERN.test(value.operationId || "") ||
        !HASH_PATTERN.test(value.registryFingerprint || "") || !HASH_PATTERN.test(value.semanticFingerprint || "") ||
        !HASH_PATTERN.test(value.contentSha256 || "") || !canonicalTimestamp(value.createdAt)) {
      return failure("P008-CLEAR-PARTIAL", "tombstone-invalid", "tombstone", null, false);
    }
    var workspaceResult = validateWorkspace(value.workspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    var payload = clone(value);
    delete payload.semanticFingerprint;
    delete payload.contentSha256;
    if (value.semanticFingerprint !== contracts.contentSha256(payload, "clear-tombstone-semantic/v1") ||
        value.contentSha256 !== contracts.contentSha256(payload, "clear-tombstone-content/v1")) {
      return failure("P008-CLEAR-PARTIAL", "tombstone-identity-invalid", "tombstone", null, false);
    }
    return success(clone(value));
  }

  function buildClearTombstone(registry, expectedGeneration, now, policy) {
    var empty = createEmptyWorkspace(policy, now);
    if (!empty.ok) return empty;
    var workspace = clone(empty.value);
    workspace.generation = expectedGeneration + 1;
    workspace.updatedAt = now;
    workspace = withWorkspaceHashes(workspace);
    var workspaceValidation = validateWorkspace(workspace, policy);
    if (!workspaceValidation.ok) return workspaceValidation;
    var payload = {
      contractVersion: CLEAR_TOMBSTONE_VERSION,
      operationId: contracts.fingerprint("portfolio-clear-operation", {
        contractVersion: "portfolio-clear-operation/v1",
        registryFingerprint: registry.registryFingerprint,
        expectedGeneration: expectedGeneration,
        createdAt: now
      }),
      registryFingerprint: registry.registryFingerprint,
      workspace: workspaceValidation.value,
      createdAt: now
    };
    var tombstone = clone(payload);
    tombstone.semanticFingerprint = contracts.contentSha256(payload, "clear-tombstone-semantic/v1");
    tombstone.contentSha256 = contracts.contentSha256(payload, "clear-tombstone-content/v1");
    return validateClearTombstone(tombstone, policy);
  }

  function commitClearTombstone(storageAdapters, tombstone, expectedGeneration, policy) {
    var local = storageAdapters.localStorage;
    var pointerRaw;
    try { pointerRaw = local.getItem(policy.storage.pointerKey); } catch (error) {
      return failure("P008-CLEAR-PARTIAL", "pointer-read-failed", "pointer", null, true);
    }
    var activeSlot = null;
    if (pointerRaw !== null) {
      var parsed = parseJson(pointerRaw);
      if (!parsed.ok || !pointerResult(parsed.value).ok || parsed.value.generation !== expectedGeneration) {
        return failure("P008-STORE-CONFLICT", "generation-conflict", "generation", null, true);
      }
      activeSlot = parsed.value.activeSlot;
    } else if (expectedGeneration !== 0) {
      return failure("P008-STORE-CONFLICT", "generation-conflict", "generation", null, true);
    }
    var inactiveSlot = activeSlot === "slotA" ? "slotB" : "slotA";
    var inactiveKey = policy.storage.workspaceNamespace + "." + inactiveSlot;
    var serialized = contracts.canonicalize(tombstone, "clear-tombstone-content/v1");
    try {
      local.setItem(inactiveKey, serialized);
      var reread = local.getItem(inactiveKey);
      var parsedTombstone = parseJson(reread);
      if (reread !== serialized || !parsedTombstone.ok || !validateClearTombstone(parsedTombstone.value, policy).ok) {
        return failure("P008-CLEAR-PARTIAL", "tombstone-verification-failed", inactiveKey, null, true);
      }
      var pointer = {
        contractVersion: POINTER_VERSION,
        activeSlot: inactiveSlot,
        generation: tombstone.workspace.generation,
        semanticFingerprint: tombstone.semanticFingerprint,
        contentSha256: tombstone.contentSha256
      };
      var pointerBytes = contracts.canonicalize(pointer, pointer.contractVersion);
      local.setItem(policy.storage.pointerKey, pointerBytes);
      if (local.getItem(policy.storage.pointerKey) !== pointerBytes || local.getItem(inactiveKey) !== serialized) {
        return failure("P008-CLEAR-PARTIAL", "pointer-verification-failed", "pointer", null, true);
      }
      return success({ activeSlot: inactiveSlot, activeKey: inactiveKey });
    } catch (error) {
      return failure("P008-CLEAR-PARTIAL", "tombstone-commit-failed", "storage", null, true);
    }
  }

  function workspaceCategoryValue(workspace, descriptor) {
    if (descriptor.sourcePath === "mandateRevisions[].cashNeeds") {
      return workspace.mandateRevisions.reduce(function (items, revision) { return items.concat(revision.cashNeeds); }, []);
    }
    if (descriptor.sourcePath === "portfolioRevisions[].supersedes") {
      return workspace.portfolioRevisions.filter(function (revision) { return revision.supersedes !== null; })
        .map(function (revision) { return revision.supersedes; });
    }
    return workspace[descriptor.sourcePath];
  }

  function emptyByRule(value, rule) {
    if (rule === "absent") return value === null;
    if (rule === "empty-array") return Array.isArray(value) && value.length === 0;
    if (rule === "null") return value === null;
    if (rule === "false") return value === false;
    return isPlainObject(value) && Object.keys(value).length === 0;
  }

  function safeCount(value) {
    if (value === null || value === false) return 0;
    if (Array.isArray(value)) return value.length;
    if (isPlainObject(value)) return Object.keys(value).length;
    return 1;
  }

  function resultCategory(categoryId, categoryLocation, sourcePath, beforeValue, afterValue, emptyRule) {
    var empty = emptyByRule(afterValue, emptyRule);
    return {
      categoryId: categoryId,
      location: categoryLocation,
      sourcePath: sourcePath,
      beforeCount: safeCount(beforeValue),
      afterCount: safeCount(afterValue),
      empty: empty,
      residueHash: empty ? null : safeValueHash(afterValue, categoryId)
    };
  }

  function publicSnapshot(storageAdapters, publicAssetReader) {
    if (!publicAssetReader || typeof publicAssetReader.readAll !== "function") {
      return failure("P008-CLEAR-PARTIAL", "public-reader-required", "publicAssetReader", null, false);
    }
    try {
      var local = storageEntries(storageAdapters.localStorage).filter(function (entry) { return !reservedPersonalKey(entry.key); });
      var session = storageEntries(storageAdapters.sessionStorage).filter(function (entry) { return !reservedPersonalKey(entry.key); });
      var assets = publicAssetReader.readAll();
      if (!isPlainObject(assets)) return failure("P008-CLEAR-PARTIAL", "public-assets-invalid", "publicAssetReader", null, false);
      return success({
        fingerprint: contracts.contentSha256({ local: local, session: session, assets: assets }, "portfolio-public-exclusions/v1"),
        counts: { local: local.length, session: session.length, assets: Object.keys(assets).length }
      });
    } catch (error) {
      return failure("P008-CLEAR-PARTIAL", "public-read-failed", "publicAssetReader", null, true);
    }
  }

  function clearResult(tombstone, registry, status, categoryResults, publicBefore, publicAfter, now) {
    var ordered = categoryResults.slice().sort(function (left, right) { return left.categoryId < right.categoryId ? -1 : 1; });
    return {
      contractVersion: FULL_CLEAR_RESULT_VERSION,
      operationId: tombstone ? tombstone.operationId : null,
      status: status,
      registryFingerprint: registry ? registry.registryFingerprint : null,
      tombstoneCommitted: tombstone !== null,
      categoryResults: ordered,
      safeResidueHashes: ordered.filter(function (entry) { return entry.residueHash !== null; })
        .map(function (entry) { return { categoryId: entry.categoryId, residueHash: entry.residueHash }; }),
      publicBeforeFingerprint: publicBefore ? publicBefore.fingerprint : null,
      publicAfterFingerprint: publicAfter ? publicAfter.fingerprint : null,
      verifiedAt: now
    };
  }

  function clearFailure(code, reason, field, result) {
    var output = failure(code, reason, field, null, true);
    if (result) output.value = deepFreeze(result);
    return output;
  }

  function clearAllPersonalData(request) {
    if (!isPlainObject(request) || request.confirmation !== "CLEAR ALL LOCAL DATA") {
      return clearFailure("P008-CLEAR-CONFIRMATION", "confirmation-mismatch", "confirmation", null);
    }
    if (!request.store || typeof request.store.openWorkspace !== "function" ||
        !isPlainObject(request.storageAdapters) || !request.storageAdapters.localStorage || !request.storageAdapters.sessionStorage ||
        !request.controller || typeof request.controller.replacePersonalState !== "function" ||
        !Number.isInteger(request.expectedGeneration) || !canonicalTimestamp(request.now)) {
      return clearFailure("P008-CLEAR-PARTIAL", "clear-request-invalid", "request", null);
    }
    var policyResult = validatePolicy(request.policy);
    if (!policyResult.ok) return policyResult;
    var opened = request.store.openWorkspace(request.now);
    if (!opened.ok) return opened;
    if (opened.value.workspace.generation !== request.expectedGeneration) {
      return failure("P008-STORE-CONFLICT", "generation-conflict", "generation", null, true);
    }
    var registryResult = derivePersonalCategoryRegistry({
      storageAdapters: request.storageAdapters,
      workspace: opened.value.workspace,
      controller: request.controller,
      policy: request.policy,
      now: request.now
    });
    if (!registryResult.ok) return registryResult;
    var registry = registryResult.value;
    var publicBeforeResult = publicSnapshot(request.storageAdapters, request.publicAssetReader);
    if (!publicBeforeResult.ok) return publicBeforeResult;
    var tombstoneResult = buildClearTombstone(registry, request.expectedGeneration, request.now, request.policy);
    if (!tombstoneResult.ok) return tombstoneResult;
    var tombstone = tombstoneResult.value;
    var tombstoneCommit = commitClearTombstone(request.storageAdapters, tombstone, request.expectedGeneration, request.policy);
    if (!tombstoneCommit.ok) return tombstoneCommit;

    var beforeController = clone(request.controller.controllerPersonalState);
    var failures = [];
    var keepLocal = Object.create(null);
    keepLocal[request.policy.storage.pointerKey] = true;
    keepLocal[tombstoneCommit.value.activeKey] = true;
    try {
      storageEntries(request.storageAdapters.localStorage).forEach(function (entry) {
        if (reservedPersonalKey(entry.key) && !keepLocal[entry.key]) request.storageAdapters.localStorage.removeItem(entry.key);
      });
      storageEntries(request.storageAdapters.sessionStorage).forEach(function (entry) {
        if (reservedPersonalKey(entry.key)) request.storageAdapters.sessionStorage.removeItem(entry.key);
      });
    } catch (error) {
      failures.push("storage-delete-failed");
    }
    try {
      request.controller.replacePersonalState(clone(createEmptyControllerPersonalState()));
    } catch (error) {
      failures.push("controller-reset-failed");
    }

    var categoryResults = [];
    registry.storageCategories.forEach(function (descriptor) {
      var storage = descriptor.location === "local-storage"
        ? request.storageAdapters.localStorage : request.storageAdapters.sessionStorage;
      var afterValue = null;
      try { afterValue = storage.getItem(descriptor.sourcePath); } catch (error) { afterValue = "unavailable"; }
      if (descriptor.sourcePath === request.policy.storage.pointerKey || descriptor.sourcePath === tombstoneCommit.value.activeKey) {
        afterValue = null;
      }
      categoryResults.push(resultCategory(
        descriptor.categoryId, descriptor.location, descriptor.sourcePath, "present", afterValue, descriptor.emptyRule
      ));
    });
    registry.workspaceCategories.forEach(function (descriptor) {
      categoryResults.push(resultCategory(
        descriptor.categoryId,
        descriptor.location,
        descriptor.sourcePath,
        workspaceCategoryValue(opened.value.workspace, descriptor),
        workspaceCategoryValue(tombstone.workspace, descriptor),
        descriptor.emptyRule
      ));
    });
    var afterController = isPlainObject(request.controller.controllerPersonalState)
      ? request.controller.controllerPersonalState : {};
    registry.controllerCategories.forEach(function (descriptor) {
      categoryResults.push(resultCategory(
        descriptor.categoryId,
        descriptor.location,
        descriptor.sourcePath,
        beforeController[descriptor.sourcePath],
        afterController[descriptor.sourcePath],
        descriptor.emptyRule
      ));
    });
    registry.discoveredUndeclared.forEach(function (descriptor) {
      categoryResults.push({
        categoryId: descriptor.categoryId,
        location: descriptor.location,
        sourcePath: descriptor.sourcePath,
        beforeCount: 1,
        afterCount: 0,
        empty: true,
        residueHash: descriptor.residueHash
      });
    });

    var postRegistry = derivePersonalCategoryRegistry({
      storageAdapters: request.storageAdapters,
      workspace: tombstone.workspace,
      controller: request.controller,
      policy: request.policy,
      now: request.now
    });
    if (!postRegistry.ok) failures.push("post-registry-failed");
    if (postRegistry.ok && postRegistry.value.discoveredUndeclared.length > 0) {
      postRegistry.value.discoveredUndeclared.forEach(function (descriptor) {
        failures.push(descriptor.categoryId);
        categoryResults.push({
          categoryId: descriptor.categoryId,
          location: descriptor.location,
          sourcePath: descriptor.sourcePath,
          beforeCount: 0,
          afterCount: 1,
          empty: false,
          residueHash: descriptor.residueHash
        });
      });
    }
    if (categoryResults.some(function (entry) { return !entry.empty; })) failures.push("category-residue");

    var undeclared = registry.discoveredUndeclared.length > 0;
    if (failures.length > 0 || undeclared) {
      var partialPublic = publicSnapshot(request.storageAdapters, request.publicAssetReader);
      return clearFailure(
        undeclared ? "P008-CLEAR-UNDECLARED" : "P008-CLEAR-PARTIAL",
        undeclared ? "undeclared-personal-category" : "clear-verification-failed",
        undeclared ? registry.discoveredUndeclared[0].categoryId : "clear",
        clearResult(
          tombstone,
          registry,
          "partial",
          categoryResults,
          publicBeforeResult.value,
          partialPublic.ok ? partialPublic.value : null,
          request.now
        )
      );
    }

    try {
      request.storageAdapters.localStorage.removeItem(tombstoneCommit.value.activeKey);
      request.storageAdapters.localStorage.removeItem(request.policy.storage.pointerKey);
    } catch (error) {
      return clearFailure(
        "P008-CLEAR-PARTIAL",
        "tombstone-delete-failed",
        "storage",
        clearResult(tombstone, registry, "partial", categoryResults, publicBeforeResult.value, null, request.now)
      );
    }
    var finalPersonal = [];
    try {
      storageEntries(request.storageAdapters.localStorage).concat(storageEntries(request.storageAdapters.sessionStorage))
        .forEach(function (entry) { if (reservedPersonalKey(entry.key)) finalPersonal.push(entry.key); });
    } catch (error) {
      finalPersonal.push("storage-reread-failed");
    }
    var publicAfterResult = publicSnapshot(request.storageAdapters, request.publicAssetReader);
    if (!publicAfterResult.ok || finalPersonal.length > 0 ||
        publicAfterResult.value.fingerprint !== publicBeforeResult.value.fingerprint) {
      return clearFailure(
        "P008-CLEAR-PARTIAL",
        "final-verification-failed",
        "clear",
        clearResult(
          tombstone,
          registry,
          "partial",
          categoryResults,
          publicBeforeResult.value,
          publicAfterResult.ok ? publicAfterResult.value : null,
          request.now
        )
      );
    }
    return success(clearResult(
      tombstone,
      registry,
      "cleared",
      categoryResults,
      publicBeforeResult.value,
      publicAfterResult.value,
      request.now
    ));
  }

  function createPortfolioStore(storageAdapters, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) throw new Error("P008-CONFIG policy invalid");
    if (!isPlainObject(storageAdapters) || !storageAdapters.localStorage || !storageAdapters.sessionStorage) throw new Error("P008-STORE-UNAVAILABLE storage adapters required");
    var local = storageAdapters.localStorage;
    var transientStorage = storageAdapters.sessionStorage;
    var mode = null;
    var memoryWorkspace = null;
    var unsavedWorkspace = null;

    function determineMode() {
      if (probeStorage(local, policy.storage.workspaceNamespace + ".probe", policy.storage.probeValue)) return "durable";
      if (probeStorage(transientStorage, policy.storage.sessionKey + ".probe", policy.storage.probeValue)) return "session";
      return "memory";
    }

    function writeQuarantine(sourceKey, raw, contractVersion, reason, now) {
      var record = {
        contractVersion: "portfolio-quarantine/v1",
        sourceKey: sourceKey,
        observedContractVersion: typeof contractVersion === "string" ? contractVersion : null,
        contentSha256: contracts.contentSha256(String(raw), "portfolio-quarantine-bytes/v1"),
        observedAt: now,
        reasonCodes: [reason]
      };
      try { local.setItem(policy.storage.quarantineKey, contracts.canonicalize(record, record.contractVersion)); } catch (error) { return false; }
      return true;
    }

    function openDurable(now) {
      var pointerRaw;
      try { pointerRaw = local.getItem(policy.storage.pointerKey); } catch (error) { return failure("P008-STORE-UNAVAILABLE", "pointer-read-failed", "pointer", null, true); }
      if (pointerRaw === null) {
        var empty = createEmptyWorkspace(policy, now);
        if (empty.ok) memoryWorkspace = empty.value;
        return empty.ok ? success({ workspace: empty.value, storageState: storageState("durable", policy, false, 0) }) : empty;
      }
      var pointerParsed = parseJson(pointerRaw);
      if (!pointerParsed.ok) return failure("P008-SCHEMA-CORRUPT", "pointer-json-invalid", "pointer", null, false);
      var pointerValidation = pointerResult(pointerParsed.value);
      if (!pointerValidation.ok) return pointerValidation;
      var slotKey = policy.storage.workspaceNamespace + "." + pointerParsed.value.activeSlot;
      var slotRaw;
      try { slotRaw = local.getItem(slotKey); } catch (error) { return failure("P008-STORE-UNAVAILABLE", "slot-read-failed", slotKey, null, true); }
      if (slotRaw === null) return failure("P008-SCHEMA-CORRUPT", "active-slot-missing", slotKey, null, false);
      var slotParsed = parseJson(slotRaw);
      if (!slotParsed.ok) {
        writeQuarantine(slotKey, slotRaw, null, "slot-json-invalid", now);
        return failure("P008-SCHEMA-CORRUPT", "slot-json-invalid", slotKey, null, false);
      }
      if (slotParsed.value.contractVersion === CLEAR_TOMBSTONE_VERSION) {
        var tombstoneValidation = validateClearTombstone(slotParsed.value, policy);
        if (!tombstoneValidation.ok) return tombstoneValidation;
        if (pointerParsed.value.generation !== tombstoneValidation.value.workspace.generation ||
            pointerParsed.value.semanticFingerprint !== tombstoneValidation.value.semanticFingerprint ||
            pointerParsed.value.contentSha256 !== tombstoneValidation.value.contentSha256) {
          return failure("P008-CLEAR-PARTIAL", "pointer-tombstone-mismatch", slotKey, null, false);
        }
        memoryWorkspace = tombstoneValidation.value.workspace;
        return success({
          workspace: tombstoneValidation.value.workspace,
          storageState: storageState("durable", policy, true, tombstoneValidation.value.workspace.generation)
        });
      }
      var versionNumber = workspaceVersionNumber(slotParsed.value.contractVersion);
      if (versionNumber !== null && versionNumber > 1) {
        writeQuarantine(slotKey, slotRaw, slotParsed.value.contractVersion, "future-version", now);
        return failure("P008-SCHEMA-FUTURE", "future-version", slotKey, null, false);
      }
      if (slotParsed.value.contractVersion !== WORKSPACE_VERSION) {
        writeQuarantine(slotKey, slotRaw, slotParsed.value.contractVersion, "migration-unavailable", now);
        return failure("P008-MIGRATION", "migration-unavailable", slotKey, null, false);
      }
      var workspaceValidation = validateWorkspace(slotParsed.value, policy);
      if (!workspaceValidation.ok) {
        writeQuarantine(slotKey, slotRaw, slotParsed.value.contractVersion, workspaceValidation.error.reason, now);
        return workspaceValidation;
      }
      if (pointerParsed.value.generation !== slotParsed.value.generation || pointerParsed.value.semanticFingerprint !== slotParsed.value.semanticFingerprint || pointerParsed.value.contentSha256 !== slotParsed.value.contentSha256) {
        writeQuarantine(slotKey, slotRaw, slotParsed.value.contractVersion, "pointer-slot-mismatch", now);
        return failure("P008-SCHEMA-CORRUPT", "pointer-slot-mismatch", slotKey, null, false);
      }
      memoryWorkspace = workspaceValidation.value;
      return success({ workspace: workspaceValidation.value, storageState: storageState("durable", policy, true, workspaceValidation.value.generation) });
    }

    function openSession(now) {
      var sessionRaw;
      try { sessionRaw = transientStorage.getItem(policy.storage.sessionKey); } catch (error) { mode = "memory"; return openMemory(now); }
      if (sessionRaw === null) {
        var empty = createEmptyWorkspace(policy, now);
        if (empty.ok) memoryWorkspace = empty.value;
        return empty.ok ? success({ workspace: empty.value, storageState: storageState("session", policy, false, 0) }) : empty;
      }
      var parsed = parseJson(sessionRaw);
      if (!parsed.ok) return failure("P008-SCHEMA-CORRUPT", "session-json-invalid", policy.storage.sessionKey, null, false);
      var validation = validateWorkspace(parsed.value, policy);
      if (!validation.ok) return validation;
      memoryWorkspace = validation.value;
      return success({ workspace: validation.value, storageState: storageState("session", policy, false, validation.value.generation) });
    }

    function openMemory(now) {
      if (memoryWorkspace) return success({ workspace: memoryWorkspace, storageState: storageState("memory", policy, false, memoryWorkspace.generation) });
      var empty = createEmptyWorkspace(policy, now);
      if (empty.ok) memoryWorkspace = empty.value;
      return empty.ok ? success({ workspace: empty.value, storageState: storageState("memory", policy, false, 0) }) : empty;
    }

    function openWorkspace(now) {
      if (!canonicalTimestamp(now)) return failure("P008-SCHEMA-CORRUPT", "timestamp-invalid", "now", null, false);
      mode = determineMode();
      if (mode === "durable") return openDurable(now);
      if (mode === "session") return openSession(now);
      return openMemory(now);
    }

    function preparedCandidate(candidate, generation, now) {
      var output = clone(candidate);
      output.generation = generation;
      output.updatedAt = now;
      return withWorkspaceHashes(output);
    }

    function commitDurable(candidate, expectedGeneration, now) {
      var active = openDurable(now);
      if (!active.ok) return active;
      if (active.value.workspace.generation !== expectedGeneration) return failure("P008-STORE-CONFLICT", "generation-conflict", "generation", null, true);
      var next = preparedCandidate(candidate, expectedGeneration + 1, now);
      var nextValidation = validateWorkspace(next, policy);
      if (!nextValidation.ok) return nextValidation;
      unsavedWorkspace = nextValidation.value;
      var pointerRaw = null;
      try { pointerRaw = local.getItem(policy.storage.pointerKey); } catch (error) { return failure("P008-STORE-WRITE", "pointer-read-failed", "pointer", null, true); }
      var activeSlot = null;
      if (pointerRaw !== null) {
        var parsedPointer = parseJson(pointerRaw);
        if (!parsedPointer.ok || !pointerResult(parsedPointer.value).ok) return failure("P008-SCHEMA-CORRUPT", "pointer-invalid", "pointer", null, false);
        activeSlot = parsedPointer.value.activeSlot;
      }
      var inactiveSlot = activeSlot === "slotA" ? "slotB" : "slotA";
      var inactiveKey = policy.storage.workspaceNamespace + "." + inactiveSlot;
      var serialized = contracts.canonicalize(nextValidation.value, "portfolio-workspace-content/v1");
      try { local.setItem(inactiveKey, serialized); } catch (error) { return failure("P008-STORE-WRITE", "slot-write-failed", inactiveKey, null, true); }
      var slotReread;
      try { slotReread = local.getItem(inactiveKey); } catch (error) { return failure("P008-STORE-WRITE", "slot-verification-failed", inactiveKey, null, true); }
      var slotParsed = parseJson(slotReread);
      if (slotReread !== serialized || !slotParsed.ok || !validateWorkspace(slotParsed.value, policy).ok) {
        return failure("P008-STORE-WRITE", "slot-verification-failed", inactiveKey, null, true);
      }
      var pointer = {
        contractVersion: POINTER_VERSION,
        activeSlot: inactiveSlot,
        generation: nextValidation.value.generation,
        semanticFingerprint: nextValidation.value.semanticFingerprint,
        contentSha256: nextValidation.value.contentSha256
      };
      var serializedPointer = contracts.canonicalize(pointer, pointer.contractVersion);
      try { local.setItem(policy.storage.pointerKey, serializedPointer); } catch (error) { return failure("P008-STORE-WRITE", "pointer-write-failed", "pointer", null, true); }
      var verifiedPointer;
      var verifiedSlot;
      try {
        verifiedPointer = local.getItem(policy.storage.pointerKey);
        verifiedSlot = local.getItem(inactiveKey);
      } catch (error) {
        verifiedPointer = null;
        verifiedSlot = null;
      }
      if (verifiedPointer !== serializedPointer || verifiedSlot !== serialized) {
        try {
          if (pointerRaw === null) local.removeItem(policy.storage.pointerKey);
          else local.setItem(policy.storage.pointerKey, pointerRaw);
        } catch (restoreError) { return failure("P008-STORE-WRITE", "pointer-restore-failed", "pointer", null, false); }
        return failure("P008-STORE-WRITE", "pointer-verification-failed", "pointer", null, true);
      }
      memoryWorkspace = nextValidation.value;
      unsavedWorkspace = null;
      return success({ workspace: nextValidation.value, storageState: storageState("durable", policy, true, nextValidation.value.generation) });
    }

    function commitSession(candidate, expectedGeneration, now) {
      var active = openSession(now);
      if (!active.ok) return active;
      if (active.value.workspace.generation !== expectedGeneration) return failure("P008-STORE-CONFLICT", "generation-conflict", "generation", null, true);
      var next = preparedCandidate(candidate, expectedGeneration + 1, now);
      var validation = validateWorkspace(next, policy);
      if (!validation.ok) return validation;
      memoryWorkspace = validation.value;
      unsavedWorkspace = null;
      var serialized = contracts.canonicalize(validation.value, "portfolio-workspace-content/v1");
      try {
        transientStorage.setItem(policy.storage.sessionKey, serialized);
        var reread = transientStorage.getItem(policy.storage.sessionKey);
        var parsed = parseJson(reread);
        if (reread !== serialized || !parsed.ok || !validateWorkspace(parsed.value, policy).ok) throw new Error("session verification failed");
      } catch (error) {
        mode = "memory";
        return success({ workspace: validation.value, storageState: storageState("memory", policy, false, validation.value.generation) });
      }
      return success({ workspace: validation.value, storageState: storageState("session", policy, false, validation.value.generation) });
    }

    function commitMemory(candidate, expectedGeneration, now) {
      var active = openMemory(now);
      if (!active.ok) return active;
      if (active.value.workspace.generation !== expectedGeneration) return failure("P008-STORE-CONFLICT", "generation-conflict", "generation", null, true);
      var next = preparedCandidate(candidate, expectedGeneration + 1, now);
      var validation = validateWorkspace(next, policy);
      if (!validation.ok) return validation;
      memoryWorkspace = validation.value;
      unsavedWorkspace = null;
      return success({ workspace: validation.value, storageState: storageState("memory", policy, false, validation.value.generation) });
    }

    function commitWorkspace(candidate, expectedGeneration, now) {
      if (!Number.isInteger(expectedGeneration) || expectedGeneration < 0 || !canonicalTimestamp(now)) return failure("P008-STORE-CONFLICT", "commit-arguments-invalid", "generation", null, false);
      var candidateValidation = validateWorkspace(candidate, policy);
      if (!candidateValidation.ok) return candidateValidation;
      if (mode === null) mode = determineMode();
      if (mode === "durable") return commitDurable(candidateValidation.value, expectedGeneration, now);
      if (mode === "session") return commitSession(candidateValidation.value, expectedGeneration, now);
      return commitMemory(candidateValidation.value, expectedGeneration, now);
    }

    function commitPortfolioDraft(draft, expectedGeneration, now) {
      var active = openWorkspace(now);
      if (!active.ok) return active;
      var draftResult = validatePortfolioDraft(draft, policy);
      if (!draftResult.ok) return draftResult;
      if (draftResult.value.basePortfolioId !== active.value.workspace.currentPortfolioId) {
        return failure("P008-STORE-CONFLICT", "draft-base-conflict", "basePortfolioId", null, true);
      }
      var revisionResult = revisionFromPortfolioDraft(draftResult.value, now, policy);
      if (!revisionResult.ok) return revisionResult;
      var candidate = clone(active.value.workspace);
      candidate.portfolioRevisions.push(revisionResult.value);
      candidate.currentPortfolioId = revisionResult.value.portfolioId;
      candidate.updatedAt = now;
      candidate.policyRefs = policyRefs(policy);
      var committed = commitWorkspace(withWorkspaceHashes(candidate), expectedGeneration, now);
      if (!committed.ok) return committed;
      var output = clone(committed.value);
      output.revision = clone(revisionResult.value);
      output.workspaceIdentity = workspaceIdentityProjection(output.workspace, output.revision);
      return success(output);
    }

    return Object.freeze({
      openWorkspace: openWorkspace,
      commitWorkspace: commitWorkspace,
      commitPortfolioDraft: commitPortfolioDraft,
      currentMemoryWorkspace: function () { return unsavedWorkspace !== null ? unsavedWorkspace : memoryWorkspace; }
    });
  }

  function openWorkspace(storageAdapters, now, policy) {
    return createPortfolioStore(storageAdapters, policy).openWorkspace(now);
  }

  function commitWorkspace(store, candidate, expectedGeneration, now) {
    if (!store || typeof store.commitWorkspace !== "function") return failure("P008-STORE-UNAVAILABLE", "store-required", "store", null, false);
    return store.commitWorkspace(candidate, expectedGeneration, now);
  }

  function confirmPortfolioDraft(store, draft, expectedGeneration, now) {
    if (!store || typeof store.commitPortfolioDraft !== "function") {
      return failure("P008-STORE-UNAVAILABLE", "store-required", "store", null, false);
    }
    return store.commitPortfolioDraft(draft, expectedGeneration, now);
  }

  function exportPreview(selection) {
    if (!isPlainObject(selection) || !isPlainObject(selection.portfolio) || !Array.isArray(selection.portfolio.holdings)) return failure("P008-EXPORT", "selection-invalid", "selection", null, true);
    return success({
      contractVersion: "portfolio-export-preview/v1",
      categories: ["portfolio-identity", "holding-count", "valuation-currency"],
      holdingCount: selection.portfolio.holdings.length,
      valuationCurrency: selection.portfolio.valuationCurrency,
      personalValuesIncluded: false
    });
  }

  function exportPrivate(selection) {
    if (!lastValidatedPolicy) return failure("P008-CONFIG", "policy-context-required", "policy", null, false);
    if (!isPlainObject(selection) || !isPlainObject(selection.portfolio)) return failure("P008-EXPORT", "selection-invalid", "selection", null, true);
    return success({
      contractVersion: "portfolio-private-export/v1",
      mimeType: "application/json",
      fileName: "portfolio-private-export.json",
      warning: lastValidatedPolicy.display.privateExportWarning,
      text: contracts.canonicalize(selection.portfolio, "portfolio-private-export-content/v1")
    });
  }

  // Safe counts and states only. Every category reports how many records exist and whether
  // the category is present; no holding, mandate, subject, or stored value is ever read into
  // the result, so the inventory can never become a second copy of the personal data.
  function privacyInventory(workspace, storageAdapters, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    var storageResult = foundationPrivacyInventory(storageAdapters);
    if (!storageResult.ok) return storageResult;
    var workspaceResult = validateWorkspace(workspace, policy);
    if (!workspaceResult.ok) return workspaceResult;
    var outcomeStateCounts = {};
    policy.behavior.outcomeStates.forEach(function (state) { outcomeStateCounts[state] = 0; });
    workspace.actionOutcomes.forEach(function (entry) { outcomeStateCounts[entry.state] += 1; });
    var eventCategoryCounts = {};
    policy.behavior.eventCategories.forEach(function (category) { eventCategoryCounts[category] = 0; });
    workspace.behaviorEvents.forEach(function (entry) { eventCategoryCounts[entry.category] += 1; });
    // `clearedBy` declares EVERY operation that empties the category, not the narrowest one.
    // This row is what an owner reads to decide which clear to run, and it is rendered bare
    // ("cleared by behavior"), with nothing on the surface stating that a wider operation also
    // removes it. A label naming only the narrow clear therefore under-states what the wide one
    // deletes. `clearFoundationStorage` removes every declared foundation key, so it empties all
    // eight categories; the three the behavior clear also reaches name both operations.
    function category(name, count, cleared) {
      return { category: name, recordCount: count, present: count > 0, clearedBy: cleared };
    }
    return success({
      contractVersion: "portfolio-privacy-inventory/v1",
      categories: [
        category("portfolio-revisions", workspace.portfolioRevisions.length, "all-personal"),
        category("mandate-revisions", workspace.mandateRevisions.length, "all-personal"),
        category("cash-needs", workspace.mandateRevisions.reduce(function (sum, entry) { return sum + entry.cashNeeds.length; }, 0), "all-personal"),
        category("behavior-events", workspace.behaviorEvents.length, "behavior-and-all-personal"),
        category("interest-signals", workspace.interestSignals.length, "behavior-and-all-personal"),
        category("action-outcomes", workspace.actionOutcomes.length, "behavior-and-all-personal"),
        // Explicitly saved by the owner, so the behavior clear leaves it exactly as it leaves
        // holdings; only the full-personal clear removes it.
        category("scenarios", workspace.scenarios.length, "all-personal"),
        category("allocations", workspace.allocations.length, "all-personal"),
        // A saved dossier records a research CLAIM about the owner's own holdings.
        // It is explicitly saved, so the behavior clear leaves it; only the
        // full-personal clear removes it. Scope 03 discharges that conjunct here.
        category("dossiers", workspace.dossiers.length, "all-personal"),
        // Explicitly saved by the owner, so the behavior clear leaves it exactly as it leaves
        // holdings; only the full-personal clear removes it.
        category("quarantine", storageResult.value.presentKeys.filter(function (entry) { return entry.key === policy.storage.quarantineKey; }).length, "all-personal"),
        category("session-fallback", storageResult.value.presentKeys.filter(function (entry) { return entry.storage === "session"; }).length, "all-personal")
      ],
      eventCategoryCounts: eventCategoryCounts,
      outcomeStateCounts: outcomeStateCounts,
      // FR-031/FR-032/FR-033: these sources are structurally unrepresentable in the closed
      // contracts above, so the inventory can state a real zero rather than a hopeful one.
      excludedSourceCount: 0,
      excludedSourceTokens: policy.behavior.forbiddenEventFields.slice(),
      personalKeyCount: storageResult.value.personalKeyCount,
      unavailableKeys: storageResult.value.unavailableKeys,
      genericNamespacesInspected: false
    });
  }

  function foundationPrivacyInventory(storageAdapters) {
    if (!isPlainObject(storageAdapters) || !storageAdapters.localStorage || !storageAdapters.sessionStorage) {
      return failure("P008-STORE-UNAVAILABLE", "storage-adapters-required", "storage", null, false);
    }
    var present = [];
    var unavailable = [];
    FOUNDATION_LOCAL_KEYS.forEach(function (key) {
      try {
        if (storageAdapters.localStorage.getItem(key) !== null) present.push({ key: key, storage: "local" });
      } catch (error) { unavailable.push({ key: key, storage: "local" }); }
    });
    FOUNDATION_SESSION_KEYS.forEach(function (key) {
      try {
        var storedValue = storageAdapters.sessionStorage.getItem(key);
        if (storedValue !== null) present.push({ key: key, storage: "session" });
      } catch (error) { unavailable.push({ key: key, storage: "session" }); }
    });
    return success({
      contractVersion: "portfolio-foundation-privacy-inventory/v1",
      personalKeyCount: present.length,
      presentKeys: present,
      unavailableKeys: unavailable,
      genericNamespacesInspected: false
    });
  }

  function clearFoundationStorage(storageAdapters) {
    if (!isPlainObject(storageAdapters) || !storageAdapters.localStorage || !storageAdapters.sessionStorage) {
      return failure("P008-STORE-UNAVAILABLE", "storage-adapters-required", "storage", null, false);
    }
    var failures = [];
    FOUNDATION_LOCAL_KEYS.forEach(function (key) {
      try { storageAdapters.localStorage.removeItem(key); } catch (error) { failures.push({ key: key, operation: "remove", storage: "local" }); }
    });
    FOUNDATION_SESSION_KEYS.forEach(function (key) {
      try { storageAdapters.sessionStorage.removeItem(key); } catch (error) { failures.push({ key: key, operation: "remove", storage: "session" }); }
    });
    var inventory = foundationPrivacyInventory(storageAdapters);
    if (!inventory.ok) return inventory;
    var remaining = inventory.value.presentKeys.concat(inventory.value.unavailableKeys);
    if (failures.length > 0 || remaining.length > 0) {
      return failure("P008-STORE-WRITE", "foundation-clear-incomplete", "storage", null, true);
    }
    return success({
      contractVersion: "portfolio-foundation-clear-result/v1",
      verifiedEmpty: true,
      clearedKeyCount: FOUNDATION_LOCAL_KEYS.length + FOUNDATION_SESSION_KEYS.length,
      remainingPersonalKeys: []
    });
  }

  var originalValidatePolicy = validatePolicy;
  validatePolicy = function (value) {
    var result = originalValidatePolicy(value);
    if (result.ok) lastValidatedPolicy = result.value;
    return result;
  };

  /* ---------- Feature 008 Scope 04: public tool-read barrier ----------
     The ONLY thing this tool publishes to the shared public cache. It is a constant: it takes no
     workspace argument, so there is no parameter through which a holding, count, or conclusion
     could reach RLDATA even by mistake. `computedAt` is the sole varying field, and it is a clock
     reading rather than anything derived from local state. */
  var PRIVACY_BOUNDARY_TOOL_ID = "portfolio-survival-allocation-lab";
  var PRIVACY_BOUNDARY_READ = "Private local portfolio analysis stays in its owning tab; open the tool for local research.";

  function privacyBoundaryToolRead(computedAt) {
    return {
      contractVersion: "rl-tool-read/v1",
      id: PRIVACY_BOUNDARY_TOOL_ID,
      availability: "unavailable",
      read: PRIVACY_BOUNDARY_READ,
      metrics: { privacyBoundary: "local-only", personalDataIncluded: false },
      deepLink: PRIVACY_BOUNDARY_TOOL_ID + ".html",
      asOf: null,
      freshUntil: null,
      computedAt: typeof computedAt === "string" && isFinite(Date.parse(computedAt))
        ? computedAt
        : new Date().toISOString()
    };
  }
  /* Truth-state projection for SCN-008-035. It reports what each holding's evidence actually
     supports and computes no analytics — those stay in later scopes. The rule that shapes every
     branch: an absent value is null. Zero, the prior value and the portfolio average are each a
     synthetic completeness, so an unevidenced holding is EXCLUDED and counted, never valued. */
  var TRUTH_PRICE_STATES = { complete: "current", stale: "stale", partial: "stale", unavailable: "missing" };

  function portfolioTruthState(holdings, evidence, asOfDate) {
    if (!Array.isArray(holdings)) return failure("P008-TRUTH-INPUT", "holdings-array-required", "holdings", null, false);
    var source = isPlainObject(evidence) ? evidence : {};
    var rows = holdings.map(function (holding) {
      var symbol = holding && typeof holding.symbol === "string" ? holding.symbol : null;
      var envelope = symbol && isPlainObject(source[symbol]) ? source[symbol] : null;
      // An unrecognised state falls through to "missing" rather than defaulting to current.
      var priceState = envelope && TRUTH_PRICE_STATES.hasOwnProperty(envelope.state)
        ? TRUTH_PRICE_STATES[envelope.state]
        : "missing";
      var factorTags = Array.isArray(holding && holding.factorTags) ? holding.factorTags : [];
      var factorState = factorTags.length > 0 ? "present" : "missing";
      var included = priceState === "current" || priceState === "stale";
      var confidence = priceState === "missing"
        ? "unavailable"
        : (priceState === "stale" || factorState === "missing") ? "reduced" : "full";
      return {
        symbol: symbol,
        priceState: priceState,
        priceReason: priceState === "current" ? null
          : priceState === "stale" ? "last-observation-" + String(envelope && envelope.lastDate)
            : envelope ? "evidence-state-" + String(envelope.state) : "no-evidence-envelope",
        factorState: factorState,
        factorReason: factorState === "present" ? null : "no-factor-tags",
        confidence: confidence,
        valueIncluded: included,
        value: included && isFinite(holding && holding.derivedValue) ? holding.derivedValue : null
      };
    });
    return success({
      contractVersion: "portfolio-truth-state/v1",
      asOf: typeof asOfDate === "string" ? asOfDate : null,
      rows: rows,
      summary: {
        holdingCount: rows.length,
        valuedCount: rows.filter(function (row) { return row.valueIncluded; }).length,
        excludedForMissingEvidence: rows.filter(function (row) { return row.priceState === "missing"; }).length,
        reducedConfidenceCount: rows.filter(function (row) { return row.confidence === "reduced"; }).length
      }
    });
  }
  /* ---------- End Feature 008 Scope 04 ---------- */

  var api = Object.freeze({
    addHoldingRow: addHoldingRow,
    applyDraftRemoval: applyDraftRemoval,
    buildBehaviorCandidate: buildBehaviorCandidate,
    buildBehaviorOccurrence: buildBehaviorOccurrence,
    canonicalBehaviorIdentity: canonicalBehaviorIdentity,
    actionIdentity: actionIdentity,
    buildActionOutcomeCandidate: buildActionOutcomeCandidate,
    buildScenarioCandidate: buildScenarioCandidate,
    buildAllocationCandidate: buildAllocationCandidate,
    buildDossierCandidate: buildDossierCandidate,
    validateDossier: validateDossier,
    validateScenario: validateScenario,
    buildInterestSignalCandidate: buildInterestSignalCandidate,
    deriveInterestSignals: deriveInterestSignals,
    validateInterestSignal: validateInterestSignal,
    buildBehaviorClearCandidate: buildBehaviorClearCandidate,
    buildBehaviorEvent: buildBehaviorEvent,
    buildMandateCandidate: buildMandateCandidate,
    buildMandateClearCandidate: buildMandateClearCandidate,
    buildPortfolioClearCandidate: buildPortfolioClearCandidate,
    buildEmptyPortfolioRevision: buildEmptyPortfolioRevision,
    buildWorkspaceCandidate: buildWorkspaceCandidate,
    clearAllPersonalData: clearAllPersonalData,
    commitWorkspace: commitWorkspace,
    confirmPortfolioDraft: confirmPortfolioDraft,
    createPortfolioDraft: createPortfolioDraft,
    createEmptyControllerPersonalState: createEmptyControllerPersonalState,
    createEmptyWorkspace: createEmptyWorkspace,
    createPortfolioStore: createPortfolioStore,
    clearFoundationStorage: clearFoundationStorage,
    dedupeBehaviorEvents: dedupeBehaviorEvents,
    derivePersonalCategoryRegistry: derivePersonalCategoryRegistry,
    editHoldingRow: editHoldingRow,
    exportPreview: exportPreview,
    exportPrivate: exportPrivate,
    foundationPrivacyInventory: foundationPrivacyInventory,
    openWorkspace: openWorkspace,
    privacyInventory: privacyInventory,
    projectRouteStates: projectRouteStates,
    removeHoldingRow: removeHoldingRow,
    reduceActionOutcome: reduceActionOutcome,
    readLegacyBehaviorEventV1: readLegacyBehaviorEventV1,
    resolveDuplicates: resolveDuplicates,
    validateActionOutcome: validateActionOutcome,
    validateBehaviorEvent: validateBehaviorEvent,
    validateHoldingEntry: validateHoldingEntry,
    validateImport: validateImport,
    validateMandateDraft: validateMandateDraft,
    validateMandateRevision: validateMandateRevision,
    validateManualDraft: validateManualDraft,
    validatePolicy: validatePolicy,
    validatePortfolioDraft: validatePortfolioDraft,
    validatePortfolioError: validatePortfolioError,
    validatePortfolioRevision: validatePortfolioRevision,
    validateWorkspace: validateWorkspace,
    privacyBoundaryToolRead: privacyBoundaryToolRead,
    portfolioTruthState: portfolioTruthState,
    PRIVACY_BOUNDARY_TOOL_ID: PRIVACY_BOUNDARY_TOOL_ID
  });

  root.RLPORTFOLIO = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
})();