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
    "P008-EXPORT": true
  });
  var TOP_POLICY_FIELDS = Object.freeze([
    "analytics", "behavior", "calibration", "contractVersion", "display", "import", "queue", "solver", "storage"
  ]);
  var POLICY_SECTION_FIELDS = Object.freeze({
    storage: Object.freeze([
      "contractVersion", "migrationVersions", "pointerContractVersion", "pointerKey", "probeValue",
      "quarantineKey", "returnContextKey", "sessionKey", "slotKeys", "workspaceContractVersion", "workspaceNamespace"
    ]),
    import: Object.freeze([
      "allowedFileKinds", "assetTypes", "contractVersion", "duplicateChoices", "fieldAliases", "maxBytes", "maxRows",
      "secretFieldTokens", "secretValueMinimumLength", "secretValuePrefixes", "weightTolerance"
    ]),
    behavior: Object.freeze([
      "contractVersion", "halfLifeDays", "highScore", "maximumEvidenceAgeDays", "mediumScore",
      "minimumDistinctCompletions", "minimumDistinctUtcDates", "recentSupportDays"
    ]),
    analytics: Object.freeze([
      "contractVersion", "covarianceSensitivity", "covarianceShrinkageLambda", "maximumListedAssets",
      "minimumCapmObservations", "minimumJointTailEvents", "minimumRiskObservations", "minimumTailObservations",
      "riskReconciliationTolerance", "targetHistoryCalendarYears"
    ]),
    solver: Object.freeze(["contractVersion", "convergenceTolerance", "maximumIterations"]),
    calibration: Object.freeze([
      "contractVersion", "initialSeed", "materialExposureWeight", "nearCashNeedCalendarDays", "parameterDrawCount",
      "pathCount", "stationaryBootstrapMeanBlockSessions", "stationaryBootstrapSensitivity"
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
  var WORKSPACE_FIELDS = Object.freeze([
    "actionOutcomes", "behaviorEvents", "contentSha256", "contractVersion", "createdAt", "currentMandateId",
    "currentPortfolioId", "generation", "interestSignals", "mandateRevisions", "policyRefs", "portfolioRevisions",
    "semanticFingerprint", "updatedAt"
  ]);
  var ERROR_FIELDS = Object.freeze([
    "code", "contractVersion", "field", "reason", "recoverable", "row", "valueEchoed"
  ]);
  var FOUNDATION_LOCAL_KEYS = Object.freeze([
    "rlPortfolioWorkspaceV1.pointer",
    "rlPortfolioWorkspaceV1.slotA",
    "rlPortfolioWorkspaceV1.slotB",
    "rlPortfolioWorkspaceV1.quarantine"
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
    if (!Number.isInteger(value.analytics.targetHistoryCalendarYears) || value.analytics.targetHistoryCalendarYears <= 0 ||
        !Number.isInteger(value.analytics.minimumRiskObservations) || value.analytics.minimumRiskObservations <= 0 ||
        !Number.isInteger(value.analytics.minimumCapmObservations) || value.analytics.minimumCapmObservations <= 0 ||
        !Number.isInteger(value.analytics.minimumTailObservations) || value.analytics.minimumTailObservations <= 0 ||
        !Number.isInteger(value.analytics.minimumJointTailEvents) || value.analytics.minimumJointTailEvents <= 0 ||
        !finiteNonNegative(value.analytics.covarianceShrinkageLambda) ||
        !Array.isArray(value.analytics.covarianceSensitivity) || value.analytics.covarianceSensitivity.length === 0 ||
        !value.analytics.covarianceSensitivity.every(finiteNonNegative) ||
        !finitePositive(value.analytics.riskReconciliationTolerance) ||
        !Number.isInteger(value.analytics.maximumListedAssets) || value.analytics.maximumListedAssets <= 0) {
      return failure("P008-CONFIG", "invalid-policy", "analytics", null, false);
    }
    var numericSections = [value.behavior, value.solver, value.calibration, value.queue];
    for (var numericIndex = 0; numericIndex < numericSections.length; numericIndex += 1) {
      var numericKeys = Object.keys(numericSections[numericIndex]).filter(function (key) { return key !== "contractVersion"; });
      if (!numericKeys.every(function (key) {
        var item = numericSections[numericIndex][key];
        if (Array.isArray(item)) return item.length > 0 && item.every(finiteNonNegative);
        return finiteNonNegative(item);
      })) return failure("P008-CONFIG", "invalid-policy", sectionNames[numericIndex], null, false);
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
    if (value.holdingId !== contracts.fingerprint("portfolio-holding", holdingIdentityPayload(value))) {
      return failure("P008-IDENTITY", "holding-identity-mismatch", "holdingId", null, false);
    }
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
      policyRefs: policyRefs(policy),
      createdAt: now,
      updatedAt: now
    }));
  }

  function revisionIdentityPayload(value) {
    return {
      contractVersion: "portfolio-revision-identity/v1",
      name: value.name,
      valuationCurrency: value.valuationCurrency,
      inputBasis: value.inputBasis,
      holdings: value.holdings,
      supersedes: value.supersedes
    };
  }

  function validatePortfolioRevision(value, policy) {
    var policyResult = validatePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(value)) return failure("P008-SCHEMA-CORRUPT", "revision-required", "revision", null, false);
    var unknown = hasOnlyFields(value, REVISION_FIELDS);
    if (unknown || Object.keys(value).length !== REVISION_FIELDS.length) return failure("P008-SCHEMA-CORRUPT", "unknown-field", unknown || "revision", null, false);
    if (value.contractVersion !== REVISION_VERSION || !HASH_PATTERN.test(value.portfolioId || "") || !HASH_PATTERN.test(value.semanticFingerprint || "") ||
        !nonEmptyString(value.name) || !CURRENCY_PATTERN.test(value.valuationCurrency || "") ||
        ["weight", "local-value"].indexOf(value.inputBasis) < 0 || !Array.isArray(value.holdings) || value.holdings.length === 0 ||
        !canonicalTimestamp(value.createdAt) || (value.supersedes !== null && !HASH_PATTERN.test(value.supersedes || ""))) {
      return failure("P008-SCHEMA-CORRUPT", "revision-invalid", "revision", null, false);
    }
    var seen = Object.create(null);
    for (var index = 0; index < value.holdings.length; index += 1) {
      var holdingResult = validateHoldingEntry(value.holdings[index], policy);
      if (!holdingResult.ok) return holdingResult;
      if (seen[value.holdings[index].holdingId]) return failure("P008-IDENTITY", "duplicate-holding-id", "holdings", null, false);
      seen[value.holdings[index].holdingId] = true;
    }
    var expectedSemantic = contracts.fingerprint("portfolio-revision-semantic", revisionIdentityPayload(value));
    var expectedId = contracts.fingerprint("portfolio-revision", revisionIdentityPayload(value));
    if (value.semanticFingerprint !== expectedSemantic || value.portfolioId !== expectedId) return failure("P008-IDENTITY", "revision-identity-mismatch", "portfolioId", null, false);
    return success(clone(value));
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
    revision.semanticFingerprint = contracts.fingerprint("portfolio-revision-semantic", revisionIdentityPayload(revision));
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
        !Array.isArray(value.interestSignals) || !Array.isArray(value.actionOutcomes) || !isPlainObject(value.policyRefs) ||
        !canonicalTimestamp(value.createdAt) || !canonicalTimestamp(value.updatedAt) || !HASH_PATTERN.test(value.semanticFingerprint || "") ||
        !HASH_PATTERN.test(value.contentSha256 || "") || (value.currentPortfolioId !== null && !HASH_PATTERN.test(value.currentPortfolioId || "")) ||
        value.currentMandateId !== null) {
      return failure("P008-SCHEMA-CORRUPT", "workspace-invalid", "workspace", null, false);
    }
    if (value.mandateRevisions.length > 0 || value.behaviorEvents.length > 0 || value.interestSignals.length > 0 || value.actionOutcomes.length > 0) {
      return failure("P008-SCHEMA-CORRUPT", "unsupported-contract-scope", "workspace", null, false);
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

  function storageState(mode, policy, lastVerifiedWrite, generation) {
    return deepFreeze({
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

    return Object.freeze({
      openWorkspace: openWorkspace,
      commitWorkspace: commitWorkspace,
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

  var api = Object.freeze({
    applyDraftRemoval: applyDraftRemoval,
    buildPortfolioClearCandidate: buildPortfolioClearCandidate,
    buildWorkspaceCandidate: buildWorkspaceCandidate,
    commitWorkspace: commitWorkspace,
    createEmptyWorkspace: createEmptyWorkspace,
    createPortfolioStore: createPortfolioStore,
    clearFoundationStorage: clearFoundationStorage,
    exportPreview: exportPreview,
    exportPrivate: exportPrivate,
    foundationPrivacyInventory: foundationPrivacyInventory,
    openWorkspace: openWorkspace,
    resolveDuplicates: resolveDuplicates,
    validateHoldingEntry: validateHoldingEntry,
    validateImport: validateImport,
    validateManualDraft: validateManualDraft,
    validatePolicy: validatePolicy,
    validatePortfolioError: validatePortfolioError,
    validatePortfolioRevision: validatePortfolioRevision,
    validateWorkspace: validateWorkspace
  });

  root.RLPORTFOLIO = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
})();