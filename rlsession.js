(function () {
  "use strict";

  var root = (typeof globalThis !== "undefined") ? globalThis :
    ((typeof window !== "undefined") ? window : {});
  var contracts = root.RLCONTRACTS;
  if (!contracts && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    contracts = require("./rlcontracts.js");
  }
  if (!contracts) throw new Error("RLCONTRACTS must be loaded before RLSESSION");

  var FIVE_MINUTES_MS = 300000;
  var HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
  var DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  var OFFSET_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
  var CANONICAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  var LOCAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/;
  var SESSION_KINDS = Object.freeze({
    "after-hours": true,
    "pre-market": true,
    regular: true
  });
  var DATE_STATES = Object.freeze({
    "early-close": true,
    holiday: true,
    regular: true,
    weekend: true
  });
  var EVIDENCE_STATES = Object.freeze({
    available: true,
    disputed: true,
    misaligned: true,
    partial: true,
    stale: true,
    unavailable: true
  });
  var STATE_PRECEDENCE = Object.freeze({
    available: 0,
    partial: 1,
    stale: 2,
    unavailable: 3,
    misaligned: 4,
    disputed: 5
  });
  var AGGREGATE_FIELDS = Object.freeze([
    "adjustmentState", "adapterVersion", "aggregateId", "comparisonBoundarySignature",
    "contractVersion", "coverageEnd", "coverageStart", "cumulativeObservedVolume",
    "cutoffAt", "elapsedMinutes", "expectedBucketsThroughCutoff", "high", "interval",
    "latest", "latestAt", "latestCompletedBucket", "latestLabel", "low", "missingBuckets",
    "observationRefs", "occurrenceFingerprint", "officialRegularCloseAnchor", "open",
    "priceBars", "priceBasis", "reasonCodes", "returnFromOfficialClose", "semanticFingerprint",
    "sessionEnd", "sessionKind", "sessionStart", "sourceId", "sourceRefs", "state", "symbol",
    "tradingDate", "volumeBars", "volumeCompleteness", "vwap"
  ]);
  var OBSERVATION_FIELDS = Object.freeze([
    "adapterVersion", "adjustmentState", "barEnd", "barStart", "bucketIndex", "calendarFingerprint",
    "close", "comparisonBoundarySignature", "contractVersion", "corporateActionRefs", "cutoffAt",
    "freshnessState", "high", "interval", "low", "observationId", "occurrenceFingerprint", "open",
    "priceBasis", "providerSymbol", "semanticFingerprint", "sessionEnd", "sessionKind", "sessionStart",
    "sourceId", "sourceRef", "symbol", "tradingDate", "volume", "volumeState"
  ]);
  var BASELINE_FIELDS = Object.freeze([
    "baselineId", "candidateSessionCount", "comparisonWindow", "contractVersion", "coverage",
    "currentAggregateRef", "currentVolume", "eligibleSessionCount", "eligibleSessions",
    "excludedSessions", "mad", "median", "midrankPercentile", "missingSessionCount",
    "occurrenceFingerprint", "peerRefs", "reasonCodes", "relativeVolume", "robustZ",
    "semanticFingerprint", "state", "unusualness"
  ]);
  var REPORT_FIELDS = Object.freeze([
    "actual", "consensus", "contractVersion", "cutoffAt", "freshnessState", "metrics",
    "occurrenceFingerprint", "previous", "reasonCodes", "releaseIdentity", "releasedAt",
    "reportId", "reportPeriod", "reportType", "revisionIdentity", "revisionNumber",
    "scheduledAt", "semanticFingerprint", "sourceRecords", "supersedesEvidenceRef",
    "surprises", "state"
  ]);
  var REACTION_FIELDS = Object.freeze([
    "contractVersion", "cutoffAt", "highExcursion", "latest", "lowExcursion",
    "observationRefs", "occurrenceFingerprint", "preReleaseBaseline", "reactionId",
    "reasonCodes", "releaseIdentity", "reportEvidenceRef", "returnFromBaseline", "segments",
    "semanticFingerprint", "sourceRefs", "state", "symbol", "volumeBaselineRefs"
  ]);
  var COMPLETED_BAR_WINDOW_FIELDS = Object.freeze([
    "contractVersion", "endAt", "endBucketInclusive", "expectedBucketCount", "missingBuckets",
    "observationRefs", "observationSemanticRefs", "role", "sessionKind", "startAt", "startBucket"
  ]);
  var REACTION_SEGMENT_FIELDS = Object.freeze([
    "adapterVersion", "adjustmentState", "calendarFingerprint", "comparisonBoundarySignature",
    "comparisonWindow", "contractVersion", "cumulativeObservedVolume", "cutoffAt", "endAt",
    "endBucketInclusive", "expectedBucketCount", "high", "interval", "latest", "low",
    "missingBuckets", "observationRefs", "observationSemanticRefs", "occurrenceFingerprint",
    "postReleaseWindow", "preReleaseWindow", "priceBarCount", "priceBasis", "providerSymbol",
    "reasonCodes", "releaseIdentity", "segmentId", "segmentOrdinal", "semanticFingerprint",
    "sessionEnd", "sessionKind", "sessionStart", "sourceId", "sourceRefs", "startAt",
    "startBucket", "state", "symbol", "tradingDate", "volumeBarCount", "volumeCompleteness"
  ]);
  var BUNDLE_FIELDS = Object.freeze([
    "calendarSessionRef", "contractVersion", "cutoffAt", "eventReactionRefs", "evidenceId",
    "fingerprint", "reasonCodes", "releasedReportRefs", "requiredEvidence", "runId",
    "sessionAggregateRefs", "sourceRefs", "state", "volumeBaselineRefs"
  ]);
  var REQUIRED_EVIDENCE_FIELDS = Object.freeze([
    "benchmark", "calendar", "closedDate", "contractVersion", "dueReports", "mode"
  ]);
  var REQUIRED_CALENDAR_FIELDS = Object.freeze([
    "calendarSessionRef", "dateState", "required", "state", "tradingDate"
  ]);
  var REQUIRED_BENCHMARK_FIELDS = Object.freeze([
    "aggregateRef", "baselineRef", "officialCloseAnchorState", "presence", "reasonCodes",
    "required", "state", "symbol"
  ]);
  var REQUIRED_CLOSED_DATE_FIELDS = Object.freeze([
    "closureCalendarSessionRef", "liveAggregatePresence", "liveBaselinePresence",
    "nextOpenCalendarSessionRef", "nextOpenTradingDate", "priorOfficialCloseAnchor",
    "reasonCodes", "required", "state"
  ]);
  var OFFICIAL_ANCHOR_FIELDS = Object.freeze([
    "adjustmentState", "at", "close", "contractVersion", "priceBasis", "sourceRef", "tradingDate"
  ]);

  function isPlainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== "[object Object]") return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function hasOnlyFields(value, fields) {
    var allowed = Object.create(null);
    var index;
    for (index = 0; index < fields.length; index += 1) allowed[fields[index]] = true;
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

  function success(value) {
    return { ok: true, value: deepFreeze(value) };
  }

  function failure(code, reason, field) {
    var error = {
      contractVersion: "evidence-error/v1",
      code: code,
      reason: reason
    };
    if (field) error.field = field;
    return { ok: false, error: error };
  }

  function timestampResult(value, field) {
    if (typeof value !== "string" || !OFFSET_TIMESTAMP_PATTERN.test(value)) {
      return { ok: false, reason: "timestamp-naive", field: field };
    }
    var epoch = Date.parse(value);
    if (!Number.isFinite(epoch)) return { ok: false, reason: "timestamp-invalid", field: field };
    return { ok: true, epoch: epoch, value: new Date(epoch).toISOString() };
  }

  function canonicalTimestampResult(value, field) {
    var parsed = timestampResult(value, field);
    if (!parsed.ok) return parsed;
    if (!CANONICAL_TIMESTAMP_PATTERN.test(value) || parsed.value !== value) {
      return { ok: false, reason: "timestamp-not-canonical-utc", field: field };
    }
    return parsed;
  }

  function finiteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function nonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
  }

  function localWallAt(epoch, timeZone) {
    var formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    });
    var parts = formatter.formatToParts(new Date(epoch));
    var values = {};
    parts.forEach(function (part) {
      if (part.type !== "literal") values[part.type] = part.value;
    });
    return values.year + "-" + values.month + "-" + values.day + "T" +
      values.hour + ":" + values.minute + ":" + values.second + ".000";
  }

  function validateInterval(interval, timeZone, field) {
    if (!isPlainObject(interval)) return failure("B002-CALENDAR", "calendar-interval-required", field);
    var unknown = hasOnlyFields(interval, ["endLocal", "endUtc", "startLocal", "startUtc"]);
    if (unknown) return failure("B002-CALENDAR", "calendar-interval-unknown-field", field + "." + unknown);
    if (!LOCAL_TIMESTAMP_PATTERN.test(interval.startLocal || "") || !LOCAL_TIMESTAMP_PATTERN.test(interval.endLocal || "")) {
      return failure("B002-CALENDAR", "calendar-local-boundary-invalid", field);
    }
    var startUtc = canonicalTimestampResult(interval.startUtc, field + ".startUtc");
    var endUtc = canonicalTimestampResult(interval.endUtc, field + ".endUtc");
    if (!startUtc.ok || !endUtc.ok || startUtc.epoch >= endUtc.epoch) {
      return failure("B002-CALENDAR", "calendar-utc-boundary-invalid", field);
    }
    if (Date.parse(interval.startLocal) !== startUtc.epoch || Date.parse(interval.endLocal) !== endUtc.epoch) {
      return failure("B002-CALENDAR", "calendar-local-utc-mismatch", field);
    }
    try {
      if (localWallAt(startUtc.epoch, timeZone) !== interval.startLocal.slice(0, 23) ||
          localWallAt(endUtc.epoch, timeZone) !== interval.endLocal.slice(0, 23)) {
        return failure("B002-CALENDAR", "calendar-timezone-roundtrip-mismatch", field);
      }
    } catch (error) {
      return failure("B002-CALENDAR", "calendar-timezone-invalid", "timeZone");
    }
    return { ok: true, startEpoch: startUtc.epoch, endEpoch: endUtc.epoch };
  }

  function validateCutoffPolicy(policy) {
    if (!isPlainObject(policy)) return failure("B002-CALENDAR", "cutoff-policy-required", "cutoffPolicy");
    var unknown = hasOnlyFields(policy, ["boundaryPolicyVersion", "contractVersion", "interval", "requireNextOpenTradingDate"]);
    if (unknown) return failure("B002-CALENDAR", "cutoff-policy-unknown-field", "cutoffPolicy." + unknown);
    if (policy.contractVersion !== "cutoff-policy/v1" || policy.interval !== "PT5M" ||
        typeof policy.boundaryPolicyVersion !== "string" || policy.boundaryPolicyVersion.length === 0 ||
        typeof policy.requireNextOpenTradingDate !== "boolean") {
      return failure("B002-CALENDAR", "cutoff-policy-invalid", "cutoffPolicy");
    }
    return { ok: true };
  }

  function validateCalendarRow(calendar, row, field) {
    if (!isPlainObject(row)) return failure("B002-CALENDAR", "calendar-row-invalid", field);
    var unknown = hasOnlyFields(row, ["afterHours", "closureCode", "closureLabel", "dateState", "preMarket", "regular", "tradingDate"]);
    if (unknown) return failure("B002-CALENDAR", "calendar-row-unknown-field", field + "." + unknown);
    if (!DATE_PATTERN.test(row.tradingDate || "") || !DATE_STATES[row.dateState]) {
      return failure("B002-CALENDAR", "calendar-row-invalid", field);
    }
    var closed = row.dateState === "holiday" || row.dateState === "weekend";
    if (closed) {
      if (row.preMarket !== null || row.regular !== null || row.afterHours !== null ||
          typeof row.closureCode !== "string" || !row.closureCode ||
          typeof row.closureLabel !== "string" || !row.closureLabel) {
        return failure("B002-CALENDAR", "closed-calendar-row-invalid", field);
      }
      return { ok: true };
    }
    if (row.closureCode !== null || row.closureLabel !== null) {
      return failure("B002-CALENDAR", "open-calendar-row-closure-invalid", field);
    }
    var preResult = validateInterval(row.preMarket, calendar.timeZone, field + ".preMarket");
    var regularResult = validateInterval(row.regular, calendar.timeZone, field + ".regular");
    var afterResult = validateInterval(row.afterHours, calendar.timeZone, field + ".afterHours");
    if (!preResult.ok) return preResult;
    if (!regularResult.ok) return regularResult;
    if (!afterResult.ok) return afterResult;
    if (row.preMarket.endUtc !== row.regular.startUtc || row.regular.endUtc !== row.afterHours.startUtc) {
      return failure("B002-CALENDAR", "calendar-boundary-overlap-or-gap", field);
    }
    var expectedRegularEnd = row.dateState === "early-close" ? "13:00" : "16:00";
    if (row.preMarket.startLocal.slice(11, 16) !== "04:00" || row.preMarket.endLocal.slice(11, 16) !== "09:30" ||
        row.regular.startLocal.slice(11, 16) !== "09:30" || row.regular.endLocal.slice(11, 16) !== expectedRegularEnd ||
        row.afterHours.startLocal.slice(11, 16) !== expectedRegularEnd || row.afterHours.endLocal.slice(11, 16) !== "20:00") {
      return failure("B002-CALENDAR", "calendar-session-boundary-invalid", field);
    }
    return { ok: true };
  }

  function sessionSignature(calendar, row, sessionKind, interval) {
    var wallStart = interval.startLocal.slice(11, 16);
    var wallEnd = interval.endLocal.slice(11, 16);
    var duration = (Date.parse(interval.endUtc) - Date.parse(interval.startUtc)) / 60000;
    return contracts.semanticFingerprint("session-boundary-signature", {
      contractVersion: "session-boundary-signature/v1",
      boundaryPolicyVersion: calendar.boundaryPolicyVersion,
      calendarId: calendar.calendarId,
      elapsedMinutes: duration,
      interval: "PT5M",
      localEnd: wallEnd,
      localStart: wallStart,
      sessionKind: sessionKind,
      timeZone: calendar.timeZone
    });
  }

  function validateCalendarSession(value) {
    if (!isPlainObject(value)) return failure("B002-CALENDAR", "calendar-session-required", "calendarSession");
    var fields = [
      "afterHours", "calendarId", "calendarVersion", "closureCode", "closureLabel", "contractVersion",
      "dateState", "nextOpenTradingDate", "occurrenceFingerprint", "officialRegularCloseAt", "preMarket",
      "regular", "semanticFingerprint", "sessionBoundarySignatures", "sourceRef", "timeZone",
      "timeZoneVersion", "tradingDate"
    ];
    var unknown = hasOnlyFields(value, fields);
    if (unknown) return failure("B002-CALENDAR", "calendar-session-unknown-field", unknown);
    if (value.contractVersion !== "calendar-session/v1" || value.calendarId !== "XNYS" ||
        value.timeZone !== "America/New_York" || !DATE_PATTERN.test(value.tradingDate || "") ||
        !DATE_STATES[value.dateState] || typeof value.calendarVersion !== "string" || !value.calendarVersion ||
        typeof value.timeZoneVersion !== "string" || !value.timeZoneVersion ||
        (value.nextOpenTradingDate !== null && (!DATE_PATTERN.test(value.nextOpenTradingDate || "") || value.nextOpenTradingDate <= value.tradingDate))) {
      return failure("B002-CALENDAR", "calendar-session-identity-invalid", "calendarSession");
    }
    if (!HASH_PATTERN.test(value.sourceRef || "") || !HASH_PATTERN.test(value.semanticFingerprint || "") ||
        !HASH_PATTERN.test(value.occurrenceFingerprint || "")) {
      return failure("B002-CALENDAR", "calendar-session-fingerprint-invalid", "calendarSession");
    }
    var expectedCalendarOccurrence = contracts.occurrenceFingerprint("calendar-session", {
      contractVersion: "calendar-session-occurrence/v1",
      semanticFingerprint: value.semanticFingerprint,
      sourceRef: value.sourceRef
    });
    if (value.occurrenceFingerprint !== expectedCalendarOccurrence) {
      return failure("B002-CALENDAR", "calendar-session-fingerprint-invalid", "calendarSession");
    }
    var closed = value.dateState === "holiday" || value.dateState === "weekend";
    if (closed) {
      if (value.preMarket !== null || value.regular !== null || value.afterHours !== null ||
          value.officialRegularCloseAt !== null || typeof value.closureCode !== "string" || !value.closureCode ||
          typeof value.closureLabel !== "string" || !value.closureLabel) {
        return failure("B002-CALENDAR", "closed-date-interval-invalid", "calendarSession");
      }
    } else {
      if (value.closureCode !== null || value.closureLabel !== null) {
        return failure("B002-CALENDAR", "open-date-closure-invalid", "calendarSession");
      }
      var pre = validateInterval(value.preMarket, value.timeZone, "preMarket");
      var regular = validateInterval(value.regular, value.timeZone, "regular");
      var after = validateInterval(value.afterHours, value.timeZone, "afterHours");
      if (!pre.ok) return pre;
      if (!regular.ok) return regular;
      if (!after.ok) return after;
      if (value.preMarket.endUtc !== value.regular.startUtc || value.regular.endUtc !== value.afterHours.startUtc ||
          value.officialRegularCloseAt !== value.regular.endUtc) {
        return failure("B002-CALENDAR", "calendar-boundary-overlap-or-gap", "calendarSession");
      }
      var expectedRegularEnd = value.dateState === "early-close" ? "13:00" : "16:00";
      if (value.preMarket.startLocal.slice(11, 16) !== "04:00" || value.preMarket.endLocal.slice(11, 16) !== "09:30" ||
          value.regular.startLocal.slice(11, 16) !== "09:30" || value.regular.endLocal.slice(11, 16) !== expectedRegularEnd ||
          value.afterHours.startLocal.slice(11, 16) !== expectedRegularEnd || value.afterHours.endLocal.slice(11, 16) !== "20:00") {
        return failure("B002-CALENDAR", "calendar-session-boundary-invalid", "calendarSession");
      }
      if (!isPlainObject(value.sessionBoundarySignatures) ||
          !HASH_PATTERN.test(value.sessionBoundarySignatures["pre-market"] || "") ||
          !HASH_PATTERN.test(value.sessionBoundarySignatures.regular || "") ||
          !HASH_PATTERN.test(value.sessionBoundarySignatures["after-hours"] || "")) {
        return failure("B002-CALENDAR", "calendar-signatures-invalid", "sessionBoundarySignatures");
      }
    }
    return success(value);
  }

  function loadCalendarSession(calendar, tradingDate, cutoffPolicy) {
    var policyResult = validateCutoffPolicy(cutoffPolicy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(calendar) || calendar.contractVersion !== "xnys-calendar/v1" ||
        calendar.calendarId !== "XNYS" || calendar.timeZone !== "America/New_York" ||
        typeof calendar.calendarVersion !== "string" || !calendar.calendarVersion ||
        typeof calendar.timeZoneVersion !== "string" || !calendar.timeZoneVersion ||
        !DATE_PATTERN.test(calendar.coverageStart || "") || !DATE_PATTERN.test(calendar.coverageEnd || "") ||
        calendar.coverageStart > calendar.coverageEnd || !Array.isArray(calendar.rows) ||
        !DATE_PATTERN.test(tradingDate || "")) {
      return failure("B002-CALENDAR", "calendar-contract-invalid", "calendar");
    }
    if (calendar.boundaryPolicyVersion !== cutoffPolicy.boundaryPolicyVersion) {
      return failure("B002-CALENDAR", "calendar-boundary-policy-mismatch", "boundaryPolicyVersion");
    }
    var sourceResult = contracts.validateSourceProvenance(calendar.sourceRef);
    if (!sourceResult.ok) return failure("B002-CALENDAR", "calendar-source-invalid", "sourceRef");
    var seenDates = Object.create(null);
    var previousDate = null;
    var row = null;
    var index;
    for (index = 0; index < calendar.rows.length; index += 1) {
      var candidate = calendar.rows[index];
      var rowResult = validateCalendarRow(calendar, candidate, "rows." + index);
      if (!rowResult.ok) return rowResult;
      if (seenDates[candidate.tradingDate] || candidate.tradingDate < calendar.coverageStart || candidate.tradingDate > calendar.coverageEnd) {
        return failure("B002-CALENDAR", "calendar-row-invalid", "rows");
      }
      if (previousDate && candidate.tradingDate <= previousDate) {
        return failure("B002-CALENDAR", "calendar-rows-not-ordered", "rows");
      }
      seenDates[candidate.tradingDate] = true;
      previousDate = candidate.tradingDate;
      if (candidate.tradingDate === tradingDate) row = candidate;
    }
    if (!row || tradingDate < calendar.coverageStart || tradingDate > calendar.coverageEnd) {
      return failure("B002-CALENDAR", "trading-date-not-covered", "tradingDate");
    }
    if (!DATE_STATES[row.dateState]) return failure("B002-CALENDAR", "calendar-date-state-invalid", "dateState");

    var nextOpen = null;
    for (index = 0; index < calendar.rows.length; index += 1) {
      if (calendar.rows[index].tradingDate > tradingDate &&
          (calendar.rows[index].dateState === "regular" || calendar.rows[index].dateState === "early-close")) {
        nextOpen = calendar.rows[index].tradingDate;
        break;
      }
    }
    if (cutoffPolicy.requireNextOpenTradingDate && nextOpen === null) {
      return failure("B002-CALENDAR", "next-open-trading-date-missing", "nextOpenTradingDate");
    }

    var closed = row.dateState === "holiday" || row.dateState === "weekend";
    var signatures = {};
    if (closed) {
      if (row.preMarket !== null || row.regular !== null || row.afterHours !== null ||
          typeof row.closureCode !== "string" || !row.closureCode) {
        return failure("B002-CALENDAR", "closed-calendar-row-invalid", "rows");
      }
    } else {
      var preResult = validateInterval(row.preMarket, calendar.timeZone, "preMarket");
      var regularResult = validateInterval(row.regular, calendar.timeZone, "regular");
      var afterResult = validateInterval(row.afterHours, calendar.timeZone, "afterHours");
      if (!preResult.ok) return preResult;
      if (!regularResult.ok) return regularResult;
      if (!afterResult.ok) return afterResult;
      if (row.preMarket.endUtc !== row.regular.startUtc || row.regular.endUtc !== row.afterHours.startUtc) {
        return failure("B002-CALENDAR", "calendar-boundary-overlap-or-gap", "rows");
      }
      signatures["pre-market"] = sessionSignature(calendar, row, "pre-market", row.preMarket);
      signatures.regular = sessionSignature(calendar, row, "regular", row.regular);
      signatures["after-hours"] = sessionSignature(calendar, row, "after-hours", row.afterHours);
    }

    var sourceSemanticFingerprint = contracts.semanticFingerprint("source-provenance", calendar.sourceRef);
    var sourceOccurrenceFingerprint = contracts.occurrenceFingerprint("source-provenance", calendar.sourceRef);
    var semanticInput = {
      contractVersion: "calendar-session-semantic/v1",
      afterHours: row.afterHours,
      calendarId: calendar.calendarId,
      calendarVersion: calendar.calendarVersion,
      closureCode: row.closureCode,
      closureLabel: row.closureLabel,
      dateState: row.dateState,
      nextOpenTradingDate: nextOpen,
      officialRegularCloseAt: closed ? null : row.regular.endUtc,
      preMarket: row.preMarket,
      regular: row.regular,
      sessionBoundarySignatures: signatures,
      sourceRef: sourceSemanticFingerprint,
      timeZone: calendar.timeZone,
      timeZoneVersion: calendar.timeZoneVersion,
      tradingDate: tradingDate
    };
    var semanticFingerprint = contracts.semanticFingerprint("calendar-session", semanticInput);
    var occurrenceFingerprint = contracts.occurrenceFingerprint("calendar-session", {
      contractVersion: "calendar-session-occurrence/v1",
      semanticFingerprint: semanticFingerprint,
      sourceRef: sourceOccurrenceFingerprint
    });
    var session = {
      contractVersion: "calendar-session/v1",
      calendarId: calendar.calendarId,
      calendarVersion: calendar.calendarVersion,
      timeZone: calendar.timeZone,
      timeZoneVersion: calendar.timeZoneVersion,
      tradingDate: tradingDate,
      dateState: row.dateState,
      closureCode: row.closureCode,
      closureLabel: row.closureLabel,
      preMarket: row.preMarket,
      regular: row.regular,
      afterHours: row.afterHours,
      officialRegularCloseAt: closed ? null : row.regular.endUtc,
      sessionBoundarySignatures: signatures,
      nextOpenTradingDate: nextOpen,
      sourceRef: sourceOccurrenceFingerprint,
      semanticFingerprint: semanticFingerprint,
      occurrenceFingerprint: occurrenceFingerprint
    };
    var validation = validateCalendarSession(session);
    return validation.ok ? success(session) : validation;
  }

  function validateSourceBar(sourceBar) {
    if (!isPlainObject(sourceBar)) return failure("B002-INPUT-REJECTED", "source-bar-required", "sourceBar");
    var allowed = [
      "adjustmentState", "barEnd", "barStart", "barStartLocal", "close", "contractVersion",
      "corporateActionRefs", "high", "interval", "low", "open", "priceBasis", "providerSymbol",
      "symbol", "volume"
    ];
    var unknown = hasOnlyFields(sourceBar, allowed);
    if (unknown) return failure("B002-INPUT-REJECTED", "source-bar-unknown-field", unknown);
    if (sourceBar.contractVersion !== "session-source-bar/v1" || sourceBar.interval !== "PT5M" ||
        typeof sourceBar.symbol !== "string" || !sourceBar.symbol ||
        typeof sourceBar.providerSymbol !== "string" || !sourceBar.providerSymbol) {
      return failure("B002-INPUT-REJECTED", "source-bar-contract-invalid", "sourceBar");
    }
    return { ok: true };
  }

  function classifySessionObservation(sourceBar, calendarSession, cutoffAt, source) {
    var calendarResult = validateCalendarSession(calendarSession);
    if (!calendarResult.ok) return calendarResult;
    var barResult = validateSourceBar(sourceBar);
    if (!barResult.ok) return barResult;
    var sourceResult = contracts.validateSourceProvenance(source);
    if (!sourceResult.ok) return failure("B002-INPUT-REJECTED", "source-provenance-invalid", "source");
    var cutoff = canonicalTimestampResult(cutoffAt, "cutoffAt");
    if (!cutoff.ok) return failure("B002-TIMESTAMP", cutoff.reason, cutoff.field);
    if (Date.parse(source.retrievedAt) > cutoff.epoch) {
      return failure("B002-TIMESTAMP", "source-retrieved-after-cutoff", "source.retrievedAt");
    }
    var start = timestampResult(sourceBar.barStart, "barStart");
    if (!start.ok) return failure("B002-TIMESTAMP", start.reason, start.field);
    if (sourceBar.barStartLocal !== undefined) {
      try {
        if (localWallAt(start.epoch, calendarSession.timeZone) !== sourceBar.barStartLocal) {
          return failure("B002-TIMESTAMP", "local-time-roundtrip-mismatch", "barStartLocal");
        }
      } catch (error) {
        return failure("B002-TIMESTAMP", "local-time-roundtrip-mismatch", "barStartLocal");
      }
    }
    var end;
    if (sourceBar.barEnd !== undefined) {
      end = timestampResult(sourceBar.barEnd, "barEnd");
      if (!end.ok) return failure("B002-TIMESTAMP", end.reason, end.field);
    } else {
      end = { ok: true, epoch: start.epoch + FIVE_MINUTES_MS, value: new Date(start.epoch + FIVE_MINUTES_MS).toISOString() };
    }
    if (end.epoch > cutoff.epoch) return failure("B002-TIMESTAMP", "bar-after-cutoff", "barEnd");
    if (start.epoch % FIVE_MINUTES_MS !== 0) return failure("B002-TIMESTAMP", "interval-off-grid", "barStart");
    if (end.epoch - start.epoch !== FIVE_MINUTES_MS) {
      return failure("B002-TIMESTAMP", "interval-duration-invalid", "barEnd");
    }

    var memberships = [];
    var intervals = [
      { key: "preMarket", kind: "pre-market" },
      { key: "regular", kind: "regular" },
      { key: "afterHours", kind: "after-hours" }
    ];
    for (var index = 0; index < intervals.length; index += 1) {
      var interval = calendarSession[intervals[index].key];
      if (!interval) continue;
      var intervalStart = Date.parse(interval.startUtc);
      var intervalEnd = Date.parse(interval.endUtc);
      if (start.epoch >= intervalStart && end.epoch <= intervalEnd) {
        memberships.push({
          kind: intervals[index].kind,
          start: intervalStart,
          end: intervalEnd,
          interval: interval
        });
      } else if (start.epoch >= intervalStart && start.epoch < intervalEnd && end.epoch > intervalEnd) {
        return failure("B002-TIMESTAMP", "interval-cross-session", "barEnd");
      }
    }
    if (memberships.length !== 1) {
      return failure("B002-TIMESTAMP", memberships.length === 0 ? "interval-outside-calendar" : "interval-ambiguous", "barStart");
    }
    var membership = memberships[0];
    var prices = [sourceBar.open, sourceBar.high, sourceBar.low, sourceBar.close];
    if (!prices.every(function (value) { return finiteNumber(value) && value > 0; }) ||
        sourceBar.low > sourceBar.open || sourceBar.low > sourceBar.close ||
        sourceBar.high < sourceBar.open || sourceBar.high < sourceBar.close || sourceBar.low > sourceBar.high) {
      return failure("B002-INPUT-REJECTED", "ohlc-invalid", "sourceBar");
    }
    if (sourceBar.volume !== null && !nonNegativeInteger(sourceBar.volume)) {
      return failure("B002-INPUT-REJECTED", "volume-invalid", "volume");
    }
    if (sourceBar.priceBasis !== "provider-chart-basis") {
      return failure("B002-INPUT-REJECTED", "price-basis-invalid", "priceBasis");
    }
    if (sourceBar.adjustmentState !== "compatible" &&
        sourceBar.adjustmentState !== "corporate-action-discontinuity" &&
        sourceBar.adjustmentState !== "disputed") {
      return failure("B002-INPUT-REJECTED", "adjustment-state-invalid", "adjustmentState");
    }
    if (!Array.isArray(sourceBar.corporateActionRefs) ||
        sourceBar.corporateActionRefs.some(function (ref) { return !HASH_PATTERN.test(ref); })) {
      return failure("B002-INPUT-REJECTED", "corporate-action-refs-invalid", "corporateActionRefs");
    }

    var volumeState = sourceBar.volume === null ? "missing" : (sourceBar.volume === 0 ? "observed-zero" : "observed");
    var sourceSemanticRef = contracts.semanticFingerprint("source-provenance", source);
    var sourceOccurrenceRef = contracts.occurrenceFingerprint("source-provenance", source);
    var semanticInput = {
      contractVersion: "session-observation-semantic/v1",
      adapterVersion: source.adapterVersion,
      adjustmentState: sourceBar.adjustmentState,
      barEnd: end.value,
      barStart: start.value,
      calendarFingerprint: calendarSession.semanticFingerprint,
      calendarVersion: calendarSession.calendarVersion,
      close: sourceBar.close,
      comparisonBoundarySignature: calendarSession.sessionBoundarySignatures[membership.kind],
      corporateActionRefs: sourceBar.corporateActionRefs,
      high: sourceBar.high,
      interval: sourceBar.interval,
      low: sourceBar.low,
      open: sourceBar.open,
      priceBasis: sourceBar.priceBasis,
      providerSymbol: sourceBar.providerSymbol,
      sessionKind: membership.kind,
      sourceId: source.sourceId,
      sourceRef: sourceSemanticRef,
      symbol: sourceBar.symbol,
      tradingDate: calendarSession.tradingDate,
      volume: sourceBar.volume,
      volumeState: volumeState
    };
    var semanticFingerprint = contracts.semanticFingerprint("session-observation", semanticInput);
    var occurrenceInput = {
      contractVersion: "session-observation-occurrence/v1",
      cutoffAt: cutoff.value,
      freshnessState: source.freshnessState,
      retrievedAt: source.retrievedAt,
      semanticFingerprint: semanticFingerprint
    };
    var occurrenceFingerprint = contracts.occurrenceFingerprint("session-observation", occurrenceInput);
    var observation = {
      contractVersion: "session-observation/v1",
      observationId: occurrenceFingerprint,
      semanticFingerprint: semanticFingerprint,
      occurrenceFingerprint: occurrenceFingerprint,
      symbol: sourceBar.symbol,
      providerSymbol: sourceBar.providerSymbol,
      interval: sourceBar.interval,
      barStart: start.value,
      barEnd: end.value,
      tradingDate: calendarSession.tradingDate,
      sessionKind: membership.kind,
      calendarFingerprint: calendarSession.semanticFingerprint,
      comparisonBoundarySignature: calendarSession.sessionBoundarySignatures[membership.kind],
      sessionStart: membership.interval.startUtc,
      sessionEnd: membership.interval.endUtc,
      bucketIndex: (start.epoch - membership.start) / FIVE_MINUTES_MS,
      open: sourceBar.open,
      high: sourceBar.high,
      low: sourceBar.low,
      close: sourceBar.close,
      volume: sourceBar.volume,
      volumeState: volumeState,
      priceBasis: sourceBar.priceBasis,
      adjustmentState: sourceBar.adjustmentState,
      corporateActionRefs: sourceBar.corporateActionRefs.slice(),
      cutoffAt: cutoff.value,
      sourceRef: sourceOccurrenceRef,
      sourceId: source.sourceId,
      adapterVersion: source.adapterVersion,
      freshnessState: source.freshnessState
    };
    var validation = validateSessionObservation(observation);
    return validation.ok ? success(observation) : validation;
  }

  function validateSessionObservation(value) {
    if (!isPlainObject(value)) return failure("B002-INPUT-REJECTED", "session-observation-required", "observation");
    var unknown = hasOnlyFields(value, OBSERVATION_FIELDS);
    if (unknown) return failure("B002-INPUT-REJECTED", "session-observation-unknown-field", unknown);
    if (value.contractVersion !== "session-observation/v1" || !HASH_PATTERN.test(value.observationId || "") ||
        !HASH_PATTERN.test(value.semanticFingerprint || "") || !HASH_PATTERN.test(value.occurrenceFingerprint || "") ||
      !HASH_PATTERN.test(value.calendarFingerprint || "") || !HASH_PATTERN.test(value.comparisonBoundarySignature || "") ||
        !SESSION_KINDS[value.sessionKind] || !nonNegativeInteger(value.bucketIndex) || value.interval !== "PT5M") {
      return failure("B002-INPUT-REJECTED", "session-observation-contract-invalid", "observation");
    }
    if (value.observationId !== value.occurrenceFingerprint) {
      return failure("B002-INPUT-REJECTED", "session-observation-identity-mismatch", "observationId");
    }
    var timestamps = ["barStart", "barEnd", "cutoffAt", "sessionStart", "sessionEnd"];
    var parsedTimestamps = Object.create(null);
    for (var index = 0; index < timestamps.length; index += 1) {
      var parsed = canonicalTimestampResult(value[timestamps[index]], timestamps[index]);
      if (!parsed.ok) return failure("B002-TIMESTAMP", parsed.reason, parsed.field);
      parsedTimestamps[timestamps[index]] = parsed.epoch;
    }
    if (parsedTimestamps.barEnd - parsedTimestamps.barStart !== FIVE_MINUTES_MS ||
        parsedTimestamps.barEnd > parsedTimestamps.cutoffAt ||
        parsedTimestamps.barStart < parsedTimestamps.sessionStart ||
        parsedTimestamps.barEnd > parsedTimestamps.sessionEnd) {
      return failure("B002-TIMESTAMP", "session-observation-time-invalid", "observation");
    }
    if ((parsedTimestamps.barStart - parsedTimestamps.sessionStart) / FIVE_MINUTES_MS !== value.bucketIndex) {
      return failure("B002-TIMESTAMP", "session-observation-bucket-mismatch", "bucketIndex");
    }
    if (![value.open, value.high, value.low, value.close].every(function (price) { return finiteNumber(price) && price > 0; }) ||
        value.low > value.open || value.low > value.close || value.high < value.open ||
        value.high < value.close || value.low > value.high) {
      return failure("B002-INPUT-REJECTED", "session-observation-price-invalid", "observation");
    }
    if (typeof value.symbol !== "string" || !value.symbol || typeof value.providerSymbol !== "string" || !value.providerSymbol ||
        !DATE_PATTERN.test(value.tradingDate || "") || typeof value.sourceId !== "string" || !value.sourceId ||
        typeof value.adapterVersion !== "string" || !value.adapterVersion || !HASH_PATTERN.test(value.sourceRef || "")) {
      return failure("B002-INPUT-REJECTED", "session-observation-source-invalid", "observation");
    }
    if (value.priceBasis !== "provider-chart-basis" ||
        ["compatible", "corporate-action-discontinuity", "disputed"].indexOf(value.adjustmentState) === -1 ||
        ["current", "stale", "not-applicable"].indexOf(value.freshnessState) === -1 ||
        !Array.isArray(value.corporateActionRefs) ||
        value.corporateActionRefs.some(function (ref) { return !HASH_PATTERN.test(ref); })) {
      return failure("B002-INPUT-REJECTED", "session-observation-semantics-invalid", "observation");
    }
    if (value.volume !== null && !nonNegativeInteger(value.volume)) {
      return failure("B002-INPUT-REJECTED", "session-observation-volume-invalid", "volume");
    }
    if ((value.volume === null && value.volumeState !== "missing") ||
        (value.volume === 0 && value.volumeState !== "observed-zero") ||
        (finiteNumber(value.volume) && value.volume > 0 && value.volumeState !== "observed")) {
      return failure("B002-INPUT-REJECTED", "volume-state-mismatch", "volumeState");
    }
    return success(value);
  }

  function duplicateKey(observation) {
    return observation.sourceId + "\n" + observation.adapterVersion + "\n" + observation.providerSymbol +
      "\n" + observation.interval + "\n" + observation.barStart;
  }

  function duplicateMeaning(observation) {
    return {
      contractVersion: "session-observation-duplicate/v1",
      adjustmentState: observation.adjustmentState,
      barEnd: observation.barEnd,
      barStart: observation.barStart,
      close: observation.close,
      calendarFingerprint: observation.calendarFingerprint,
      comparisonBoundarySignature: observation.comparisonBoundarySignature,
      corporateActionRefs: observation.corporateActionRefs,
      high: observation.high,
      low: observation.low,
      open: observation.open,
      priceBasis: observation.priceBasis,
      sessionKind: observation.sessionKind,
      volume: observation.volume,
      volumeState: observation.volumeState
    };
  }

  function validateOfficialAnchor(anchor) {
    if (anchor === null) return { ok: true };
    var unknown = isPlainObject(anchor) ? hasOnlyFields(anchor, OFFICIAL_ANCHOR_FIELDS) : null;
    if (!isPlainObject(anchor) || anchor.contractVersion !== "official-regular-close-anchor/v1" ||
        !DATE_PATTERN.test(anchor.tradingDate || "") || !finiteNumber(anchor.close) || anchor.close <= 0 ||
        anchor.priceBasis !== "provider-chart-basis" || !HASH_PATTERN.test(anchor.sourceRef || "") || unknown) {
      return failure("B002-INPUT-REJECTED", "official-close-anchor-invalid", "officialRegularCloseAnchor");
    }
    var at = canonicalTimestampResult(anchor.at, "officialRegularCloseAnchor.at");
    if (!at.ok) return failure("B002-TIMESTAMP", at.reason, at.field);
    if (anchor.adjustmentState !== "compatible" && anchor.adjustmentState !== "corporate-action-discontinuity" && anchor.adjustmentState !== "disputed") {
      return failure("B002-INPUT-REJECTED", "official-close-adjustment-invalid", "officialRegularCloseAnchor.adjustmentState");
    }
    return { ok: true };
  }

  function aggregateSession(observations, calendarSession, sessionKind, cutoffAt, officialCloseAnchor) {
    var calendarResult = validateCalendarSession(calendarSession);
    if (!calendarResult.ok) return calendarResult;
    if (!Array.isArray(observations)) return failure("B002-INPUT-REJECTED", "observations-required", "observations");
    if (!SESSION_KINDS[sessionKind]) return failure("B002-INPUT-REJECTED", "session-kind-invalid", "sessionKind");
    var cutoff = canonicalTimestampResult(cutoffAt, "cutoffAt");
    if (!cutoff.ok) return failure("B002-TIMESTAMP", cutoff.reason, cutoff.field);
    var anchorResult = validateOfficialAnchor(officialCloseAnchor);
    if (!anchorResult.ok) return anchorResult;
    var keyMap = Object.create(null);
    var deduplicated = [];
    var index;
    for (index = 0; index < observations.length; index += 1) {
      var validation = validateSessionObservation(observations[index]);
      if (!validation.ok) return validation;
      if (observations[index].cutoffAt !== cutoff.value) {
        return failure("B002-TIMESTAMP", "mixed-observation-cutoff", "observations");
      }
      var key = duplicateKey(observations[index]);
      var meaning = contracts.canonicalize(duplicateMeaning(observations[index]), "session-observation-duplicate/v1");
      if (keyMap[key]) {
        if (keyMap[key].meaning !== meaning) {
          return failure("B002-TIMESTAMP", "duplicate-observation-disagreement", "observations");
        }
        continue;
      }
      keyMap[key] = { meaning: meaning, observation: observations[index] };
      deduplicated.push(observations[index]);
    }
    var intervalKey = sessionKind === "pre-market" ? "preMarket" : (sessionKind === "after-hours" ? "afterHours" : "regular");
    var interval = calendarSession[intervalKey];
    if (!interval) return failure("B002-CALENDAR", "session-not-active-on-date", "sessionKind");
    var included = deduplicated.filter(function (observation) {
      return observation.tradingDate === calendarSession.tradingDate && observation.sessionKind === sessionKind;
    }).sort(function (left, right) { return Date.parse(left.barStart) - Date.parse(right.barStart); });
    if (included.some(function (observation) {
      return observation.calendarFingerprint !== calendarSession.semanticFingerprint ||
        observation.comparisonBoundarySignature !== calendarSession.sessionBoundarySignatures[sessionKind];
    })) {
      return failure("B002-COMPARABILITY", "aggregate-calendar-misaligned", "observations");
    }
    if (included.some(function (observation) {
      return observation.symbol !== included[0].symbol || observation.sourceId !== included[0].sourceId ||
        observation.adapterVersion !== included[0].adapterVersion || observation.interval !== included[0].interval ||
        observation.priceBasis !== included[0].priceBasis;
    })) {
      return failure("B002-COMPARABILITY", "aggregate-semantics-misaligned", "observations");
    }
    var includedBuckets = Object.create(null);
    for (index = 0; index < included.length; index += 1) {
      if (includedBuckets[included[index].bucketIndex]) {
        return failure("B002-TIMESTAMP", "duplicate-session-bucket", "observations");
      }
      includedBuckets[included[index].bucketIndex] = true;
    }
    var sessionStart = Date.parse(interval.startUtc);
    var sessionEnd = Date.parse(interval.endUtc);
    var eligibleEnd = Math.min(cutoff.epoch, sessionEnd);
    var expectedBuckets = eligibleEnd <= sessionStart ? 0 : Math.floor((eligibleEnd - sessionStart) / FIVE_MINUTES_MS);
    var bucketSet = Object.create(null);
    included.forEach(function (observation) { bucketSet[observation.bucketIndex] = true; });
    var missingBuckets = 0;
    for (index = 0; index < expectedBuckets; index += 1) {
      if (!bucketSet[index]) missingBuckets += 1;
    }
    var volumeBars = included.filter(function (observation) { return observation.volume !== null; });
    var cumulativeVolume = volumeBars.length === 0 ? null : volumeBars.reduce(function (sum, observation) { return sum + observation.volume; }, 0);
    var volumeCompleteness = "missing";
    if (volumeBars.length > 0 && volumeBars.length < expectedBuckets) volumeCompleteness = "partial";
    if (expectedBuckets > 0 && volumeBars.length === expectedBuckets) {
      volumeCompleteness = cumulativeVolume === 0 ? "all-observed-zero" : "complete";
    }
    var state = "unavailable";
    if (included.length > 0) {
      if (included.some(function (observation) { return observation.freshnessState === "stale"; })) state = "stale";
      else if (cutoff.epoch < sessionEnd || included.length < expectedBuckets) state = "partial";
      else state = "available";
    }
    var open = included.length ? included[0].open : null;
    var high = included.length ? Math.max.apply(null, included.map(function (observation) { return observation.high; })) : null;
    var low = included.length ? Math.min.apply(null, included.map(function (observation) { return observation.low; })) : null;
    var latestObservation = included.length ? included[included.length - 1] : null;
    var vwap = null;
    if (expectedBuckets > 0 && included.length === expectedBuckets && volumeBars.length === expectedBuckets && cumulativeVolume > 0) {
      vwap = included.reduce(function (sum, observation) {
        return sum + ((observation.high + observation.low + observation.close) / 3) * observation.volume;
      }, 0) / cumulativeVolume;
    }
    var adjustmentState = "compatible";
    if (included.some(function (observation) { return observation.adjustmentState === "disputed"; }) ||
        (officialCloseAnchor && officialCloseAnchor.adjustmentState === "disputed")) adjustmentState = "disputed";
    else if (included.some(function (observation) { return observation.adjustmentState === "corporate-action-discontinuity"; }) ||
        (officialCloseAnchor && officialCloseAnchor.adjustmentState === "corporate-action-discontinuity")) adjustmentState = "corporate-action-discontinuity";
    if (adjustmentState === "disputed") state = "disputed";
    else if (adjustmentState === "corporate-action-discontinuity") state = "misaligned";
    var returnFromOfficialClose = latestObservation && officialCloseAnchor && adjustmentState === "compatible" &&
      officialCloseAnchor.priceBasis === latestObservation.priceBasis ? latestObservation.close / officialCloseAnchor.close - 1 : null;
    var reasonCodes = [];
    if (missingBuckets > 0) reasonCodes.push("missing-price-buckets");
    if (volumeCompleteness === "partial" || volumeCompleteness === "missing") reasonCodes.push("incomplete-volume");
    if (adjustmentState !== "compatible") reasonCodes.push("adjustment-incompatible");
    if (state === "stale") reasonCodes.push("source-stale");
    var sourceRefs = included.map(function (observation) { return observation.sourceRef; });
    if (officialCloseAnchor) sourceRefs.push(officialCloseAnchor.sourceRef);
    sourceRefs = Array.from(new Set(sourceRefs)).sort();
    var semanticInput = {
      contractVersion: "session-aggregate-semantic/v1",
      adjustmentState: adjustmentState,
      calendarFingerprint: calendarSession.semanticFingerprint,
      comparisonBoundarySignature: calendarSession.sessionBoundarySignatures[sessionKind],
      cumulativeObservedVolume: cumulativeVolume,
      expectedBucketsThroughCutoff: expectedBuckets,
      high: high,
      latest: latestObservation ? latestObservation.close : null,
      low: low,
      observationRefs: included.map(function (observation) { return observation.semanticFingerprint; }),
      officialRegularCloseAnchor: officialCloseAnchor,
      open: open,
      priceBasis: included.length ? included[0].priceBasis : null,
      reasonCodes: reasonCodes,
      sessionKind: sessionKind,
      sourceRefs: sourceRefs,
      state: state,
      symbol: included.length ? included[0].symbol : null,
      tradingDate: calendarSession.tradingDate,
      volumeCompleteness: volumeCompleteness,
      vwap: vwap
    };
    var semanticFingerprint = contracts.semanticFingerprint("session-aggregate", semanticInput);
    var occurrenceFingerprint = contracts.occurrenceFingerprint("session-aggregate", {
      contractVersion: "session-aggregate-occurrence/v1",
      cutoffAt: cutoff.value,
      observationRefs: included.map(function (observation) { return observation.observationId; }),
      semanticFingerprint: semanticFingerprint
    });
    var aggregate = {
      contractVersion: "session-aggregate/v1",
      aggregateId: occurrenceFingerprint,
      semanticFingerprint: semanticFingerprint,
      occurrenceFingerprint: occurrenceFingerprint,
      symbol: included.length ? included[0].symbol : null,
      tradingDate: calendarSession.tradingDate,
      sessionKind: sessionKind,
      state: state,
      sessionStart: interval.startUtc,
      sessionEnd: interval.endUtc,
      cutoffAt: cutoff.value,
      comparisonBoundarySignature: calendarSession.sessionBoundarySignatures[sessionKind],
      interval: "PT5M",
      sourceId: included.length ? included[0].sourceId : null,
      adapterVersion: included.length ? included[0].adapterVersion : null,
      priceBasis: included.length ? included[0].priceBasis : null,
      adjustmentState: adjustmentState,
      latestCompletedBucket: latestObservation ? latestObservation.bucketIndex : null,
      elapsedMinutes: latestObservation ? (Date.parse(latestObservation.barEnd) - sessionStart) / 60000 : null,
      expectedBucketsThroughCutoff: expectedBuckets,
      priceBars: included.length,
      volumeBars: volumeBars.length,
      missingBuckets: missingBuckets,
      open: open,
      high: high,
      low: low,
      latest: latestObservation ? latestObservation.close : null,
      latestAt: latestObservation ? latestObservation.barEnd : null,
      latestLabel: latestObservation ? (sessionKind === "regular" ? "regular-latest" : "indicative-" + sessionKind) : null,
      cumulativeObservedVolume: cumulativeVolume,
      volumeCompleteness: volumeCompleteness,
      vwap: vwap,
      officialRegularCloseAnchor: officialCloseAnchor,
      returnFromOfficialClose: returnFromOfficialClose,
      coverageStart: included.length ? included[0].barStart : null,
      coverageEnd: latestObservation ? latestObservation.barEnd : null,
      reasonCodes: reasonCodes,
      observationRefs: included.map(function (observation) { return observation.observationId; }),
      sourceRefs: sourceRefs
    };
    var validationResult = validateSessionAggregate(aggregate);
    return validationResult.ok ? success(aggregate) : validationResult;
  }

  function validateSessionAggregate(value) {
    if (!isPlainObject(value)) return failure("B002-INPUT-REJECTED", "session-aggregate-required", "aggregate");
    var unknown = hasOnlyFields(value, AGGREGATE_FIELDS);
    if (unknown) return failure("B002-INPUT-REJECTED", "session-aggregate-unknown-field", unknown);
    if (value.contractVersion !== "session-aggregate/v1" || !HASH_PATTERN.test(value.aggregateId || "") ||
        !HASH_PATTERN.test(value.semanticFingerprint || "") || !HASH_PATTERN.test(value.occurrenceFingerprint || "") ||
        !SESSION_KINDS[value.sessionKind] || !EVIDENCE_STATES[value.state] || value.interval !== "PT5M" ||
        !HASH_PATTERN.test(value.comparisonBoundarySignature || "") || !DATE_PATTERN.test(value.tradingDate || "")) {
      return failure("B002-INPUT-REJECTED", "session-aggregate-contract-invalid", "aggregate");
    }
    if (value.aggregateId !== value.occurrenceFingerprint) {
      return failure("B002-INPUT-REJECTED", "session-aggregate-identity-mismatch", "aggregateId");
    }
    var timestampFields = ["cutoffAt", "sessionStart", "sessionEnd"];
    var timestampEpochs = Object.create(null);
    for (var timestampIndex = 0; timestampIndex < timestampFields.length; timestampIndex += 1) {
      var parsedTimestamp = canonicalTimestampResult(value[timestampFields[timestampIndex]], timestampFields[timestampIndex]);
      if (!parsedTimestamp.ok) return failure("B002-TIMESTAMP", parsedTimestamp.reason, parsedTimestamp.field);
      timestampEpochs[timestampFields[timestampIndex]] = parsedTimestamp.epoch;
    }
    if (timestampEpochs.sessionStart >= timestampEpochs.sessionEnd) {
      return failure("B002-TIMESTAMP", "session-aggregate-time-invalid", "aggregate");
    }
    if (value.latestCompletedBucket !== null && !nonNegativeInteger(value.latestCompletedBucket)) {
      return failure("B002-INPUT-REJECTED", "latest-completed-bucket-invalid", "latestCompletedBucket");
    }
    if (value.cumulativeObservedVolume !== null && !nonNegativeInteger(value.cumulativeObservedVolume)) {
      return failure("B002-INPUT-REJECTED", "cumulative-volume-invalid", "cumulativeObservedVolume");
    }
    if (["complete", "partial", "missing", "all-observed-zero"].indexOf(value.volumeCompleteness) === -1) {
      return failure("B002-INPUT-REJECTED", "volume-completeness-invalid", "volumeCompleteness");
    }
    if (!Array.isArray(value.observationRefs) || !Array.isArray(value.sourceRefs) || !Array.isArray(value.reasonCodes) ||
        value.observationRefs.some(function (ref) { return !HASH_PATTERN.test(ref); }) ||
        value.sourceRefs.some(function (ref) { return !HASH_PATTERN.test(ref); }) ||
        value.reasonCodes.some(function (reason) { return typeof reason !== "string" || !reason; }) ||
        new Set(value.observationRefs).size !== value.observationRefs.length ||
        new Set(value.sourceRefs).size !== value.sourceRefs.length) {
      return failure("B002-INPUT-REJECTED", "session-aggregate-lineage-invalid", "aggregate");
    }
    var countFields = ["expectedBucketsThroughCutoff", "priceBars", "volumeBars", "missingBuckets"];
    if (countFields.some(function (field) { return !nonNegativeInteger(value[field]); }) ||
        value.priceBars + value.missingBuckets !== value.expectedBucketsThroughCutoff ||
        value.volumeBars > value.priceBars || value.observationRefs.length !== value.priceBars) {
      return failure("B002-INPUT-REJECTED", "session-aggregate-coverage-invalid", "aggregate");
    }
    var priceFields = ["open", "high", "low", "latest"];
    if (priceFields.some(function (field) { return value[field] !== null && (!finiteNumber(value[field]) || value[field] <= 0); }) ||
        (value.priceBars > 0 && (value.open === null || value.high === null || value.low === null || value.latest === null)) ||
        (value.priceBars === 0 && priceFields.some(function (field) { return value[field] !== null; })) ||
        (value.priceBars > 0 && (value.low > value.open || value.low > value.latest || value.high < value.open || value.high < value.latest))) {
      return failure("B002-INPUT-REJECTED", "session-aggregate-price-invalid", "aggregate");
    }
    if (value.latestAt !== null) {
      var latestAt = canonicalTimestampResult(value.latestAt, "latestAt");
      var coverageStart = canonicalTimestampResult(value.coverageStart, "coverageStart");
      var coverageEnd = canonicalTimestampResult(value.coverageEnd, "coverageEnd");
      if (!latestAt.ok || !coverageStart.ok || !coverageEnd.ok || value.latestAt !== value.coverageEnd ||
          coverageStart.epoch < timestampEpochs.sessionStart || coverageEnd.epoch > timestampEpochs.cutoffAt ||
          value.elapsedMinutes !== (latestAt.epoch - timestampEpochs.sessionStart) / 60000 ||
          value.latestCompletedBucket !== value.elapsedMinutes / 5 - 1) {
        return failure("B002-TIMESTAMP", "session-aggregate-coverage-time-invalid", "aggregate");
      }
    } else if (value.priceBars !== 0 || value.coverageStart !== null || value.coverageEnd !== null ||
        value.latestCompletedBucket !== null || value.elapsedMinutes !== null || value.latestLabel !== null) {
      return failure("B002-INPUT-REJECTED", "session-aggregate-empty-state-invalid", "aggregate");
    }
    if (value.cumulativeObservedVolume !== null && !nonNegativeInteger(value.cumulativeObservedVolume)) {
      return failure("B002-INPUT-REJECTED", "cumulative-volume-invalid", "cumulativeObservedVolume");
    }
    if ((value.volumeBars === 0 && (value.cumulativeObservedVolume !== null || value.volumeCompleteness !== "missing")) ||
        (value.volumeBars > 0 && value.volumeBars < value.expectedBucketsThroughCutoff && value.volumeCompleteness !== "partial") ||
        (value.volumeBars === value.expectedBucketsThroughCutoff && value.volumeBars > 0 &&
          ((value.cumulativeObservedVolume === 0 && value.volumeCompleteness !== "all-observed-zero") ||
           (value.cumulativeObservedVolume > 0 && value.volumeCompleteness !== "complete")))) {
      return failure("B002-INPUT-REJECTED", "session-aggregate-volume-state-invalid", "aggregate");
    }
    if ((value.vwap !== null && (!finiteNumber(value.vwap) || value.vwap <= 0)) ||
        (value.returnFromOfficialClose !== null && !finiteNumber(value.returnFromOfficialClose))) {
      return failure("B002-INPUT-REJECTED", "session-aggregate-derived-value-invalid", "aggregate");
    }
    var anchorResult = validateOfficialAnchor(value.officialRegularCloseAnchor);
    if (!anchorResult.ok) return anchorResult;
    if (value.symbol !== null && (typeof value.symbol !== "string" || !value.symbol ||
        typeof value.sourceId !== "string" || !value.sourceId || typeof value.adapterVersion !== "string" || !value.adapterVersion ||
        value.priceBasis !== "provider-chart-basis")) {
      return failure("B002-INPUT-REJECTED", "session-aggregate-source-invalid", "aggregate");
    }
    return success(value);
  }

  function validateComparablePolicy(policy) {
    if (!isPlainObject(policy)) return failure("B002-COMPARABILITY", "comparison-policy-required", "policy");
    var fields = [
      "candidateSessionCount", "contractVersion", "highPercentile", "highRobustZ", "interval",
      "lowPercentile", "lowRobustZ", "qualifiedMinCoverage", "qualifiedMinEligible",
      "thinMinCoverage", "thinMinEligible"
    ];
    var unknown = hasOnlyFields(policy, fields);
    if (unknown) return failure("B002-COMPARABILITY", "comparison-policy-unknown-field", "policy." + unknown);
    if (policy.contractVersion !== "comparable-volume-policy/v1" || policy.interval !== "PT5M" ||
        policy.candidateSessionCount !== 20 || policy.qualifiedMinEligible !== 10 || policy.qualifiedMinCoverage !== 0.70 ||
        policy.thinMinEligible !== 5 || policy.thinMinCoverage !== 0.40 || policy.highPercentile !== 90 ||
        policy.lowPercentile !== 10 || policy.highRobustZ !== 2.5 || policy.lowRobustZ !== -2.5) {
      return failure("B002-COMPARABILITY", "comparison-policy-invalid", "policy");
    }
    return { ok: true };
  }

  function median(values) {
    var ordered = values.slice().sort(function (left, right) { return left - right; });
    var middle = Math.floor(ordered.length / 2);
    return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
  }

  function candidateExclusion(candidate, current, comparisonWindow) {
    if (!isPlainObject(candidate) || candidate.contractVersion !== "comparable-session-candidate/v1") return "candidate-contract-invalid";
    if (candidate.symbol !== current.symbol) return "symbol-mismatch";
    if (candidate.sessionKind !== current.sessionKind) return "session-kind-mismatch";
    if (candidate.comparisonBoundarySignature !== current.comparisonBoundarySignature) return "comparison-boundary-mismatch";
    if (candidate.interval !== current.interval || candidate.sourceId !== current.sourceId ||
        candidate.adapterVersion !== current.adapterVersion || candidate.priceBasis !== current.priceBasis) {
      return "provider-semantics-mismatch";
    }
    if (candidate.adjustmentState !== "compatible") return "adjustment-incompatible";
    if (candidate.startBucket !== comparisonWindow.startBucket || candidate.endBucketInclusive !== comparisonWindow.endBucketInclusive) {
      return "bucket-range-mismatch";
    }
    var expectedBucketCount = comparisonWindow.endBucketInclusive - comparisonWindow.startBucket + 1;
    if (!HASH_PATTERN.test(candidate.sourceRef || "") || !Array.isArray(candidate.bucketVolumes) ||
        candidate.bucketVolumes.length !== expectedBucketCount) {
      return "missing-volume";
    }
    var bucketMap = Object.create(null);
    for (var bucketIndex = 0; bucketIndex < candidate.bucketVolumes.length; bucketIndex += 1) {
      var candidateBucket = candidate.bucketVolumes[bucketIndex];
      if (!isPlainObject(candidateBucket) || !nonNegativeInteger(candidateBucket.bucketIndex) ||
          bucketMap[candidateBucket.bucketIndex]) return "missing-volume";
      bucketMap[candidateBucket.bucketIndex] = candidateBucket;
    }
    for (var index = comparisonWindow.startBucket; index <= comparisonWindow.endBucketInclusive; index += 1) {
      var bucket = bucketMap[index];
      if (!isPlainObject(bucket) || bucket.bucketIndex !== index || bucket.volume === null ||
          !nonNegativeInteger(bucket.volume) ||
          (bucket.volume === 0 && bucket.volumeState !== "observed-zero") ||
          (bucket.volume > 0 && bucket.volumeState !== "observed")) return "missing-volume";
    }
    return null;
  }

  function baselineUnavailable(current, candidates, policy, reasonCodes, comparisonWindow) {
    var semanticInput = {
      contractVersion: "comparable-volume-baseline-semantic/v1",
      comparisonWindow: comparisonWindow,
      current: current,
      policy: policy,
      reasonCodes: reasonCodes
    };
    var semanticFingerprint = contracts.semanticFingerprint("comparable-volume-baseline", semanticInput);
    var occurrenceFingerprint = contracts.occurrenceFingerprint("comparable-volume-baseline", {
      contractVersion: "comparable-volume-baseline-occurrence/v1",
      cutoffAt: current.cutoffAt,
      semanticFingerprint: semanticFingerprint
    });
    return {
      contractVersion: "comparable-volume-baseline/v1",
      baselineId: occurrenceFingerprint,
      semanticFingerprint: semanticFingerprint,
      occurrenceFingerprint: occurrenceFingerprint,
      state: "unavailable",
      currentAggregateRef: current.semanticFingerprint || contracts.semanticFingerprint("session-aggregate", current),
      comparisonWindow: comparisonWindow,
      candidateSessionCount: candidates.length,
      eligibleSessionCount: 0,
      missingSessionCount: candidates.length,
      coverage: candidates.length ? 0 : null,
      eligibleSessions: [],
      excludedSessions: candidates.map(function (candidate) {
        return { tradingDate: candidate.tradingDate || null, reasonCodes: reasonCodes.slice() };
      }),
      currentVolume: current.cumulativeObservedVolume,
      median: null,
      mad: null,
      midrankPercentile: null,
      relativeVolume: null,
      robustZ: null,
      unusualness: "unavailable",
      peerRefs: [],
      reasonCodes: reasonCodes
    };
  }

  function buildComparableVolumeBaseline(current, candidates, policy) {
    var policyResult = validateComparablePolicy(policy);
    if (!policyResult.ok) return policyResult;
    var currentIsAggregate = isPlainObject(current) && current.contractVersion === "session-aggregate/v1";
    var currentIsSegment = isPlainObject(current) && current.contractVersion === "reaction-segment/v1";
    var currentResult = currentIsAggregate ? validateSessionAggregate(current) :
      (currentIsSegment ? validateReactionSegment(current) : failure("B002-COMPARABILITY", "current-window-contract-invalid", "current"));
    if (!currentResult.ok) return currentResult;
    if (!Array.isArray(candidates) || candidates.length !== policy.candidateSessionCount) {
      return failure("B002-COMPARABILITY", "candidate-session-count-invalid", "candidates");
    }
    var comparisonWindow = currentIsSegment ? Object.assign({}, current.comparisonWindow) : {
      contractVersion: "comparison-window/v1",
      sessionKind: current.sessionKind,
      startBucket: 0,
      endBucketInclusive: current.latestCompletedBucket
    };
    var knownCompleteVolume = current.volumeCompleteness === "complete" || current.volumeCompleteness === "all-observed-zero";
    if ((!currentIsSegment && current.latestCompletedBucket === null) || !knownCompleteVolume ||
        !nonNegativeInteger(current.cumulativeObservedVolume) || current.adjustmentState !== "compatible" ||
        current.state === "stale") {
      var unavailableReason = current.state === "stale" ? "current-source-stale" : "current-window-incomplete";
      var unavailable = baselineUnavailable(current, candidates, policy, [unavailableReason], comparisonWindow);
      return success(unavailable);
    }
    var eligible = [];
    var excluded = [];
    var seenCandidates = Object.create(null);
    var seenCandidateDates = Object.create(null);
    candidates.forEach(function (candidate) {
      var reason = candidateExclusion(candidate, current, comparisonWindow);
      if (!reason && (!DATE_PATTERN.test(candidate.tradingDate || "") || candidate.tradingDate >= current.tradingDate)) {
        reason = "candidate-date-not-prior";
      }
      if (!reason && seenCandidateDates[candidate.tradingDate]) reason = "candidate-date-duplicate";
      if (candidate && DATE_PATTERN.test(candidate.tradingDate || "")) seenCandidateDates[candidate.tradingDate] = true;
      if (!reason && (!HASH_PATTERN.test(candidate.candidateId || "") || seenCandidates[candidate.candidateId])) {
        reason = "candidate-identity-invalid";
      }
      if (candidate && candidate.candidateId) seenCandidates[candidate.candidateId] = true;
      if (reason) {
        excluded.push({ tradingDate: candidate && candidate.tradingDate || null, reasonCodes: [reason] });
        return;
      }
      var volume = candidate.bucketVolumes.reduce(function (sum, bucket) { return sum + bucket.volume; }, 0);
      eligible.push({
        tradingDate: candidate.tradingDate,
        volume: volume,
        volumeState: volume === 0 ? "observed-zero" : "observed",
        sourceRef: candidate.sourceRef,
        comparisonBoundarySignature: candidate.comparisonBoundarySignature
      });
    });
    eligible.sort(function (left, right) { return left.tradingDate < right.tradingDate ? -1 : (left.tradingDate > right.tradingDate ? 1 : 0); });
    excluded.sort(function (left, right) { return (left.tradingDate || "") < (right.tradingDate || "") ? -1 : 1; });
    var coverage = eligible.length / candidates.length;
    var state = "unavailable";
    if (eligible.length >= policy.qualifiedMinEligible && coverage >= policy.qualifiedMinCoverage) state = "qualified";
    else if (eligible.length >= policy.thinMinEligible && coverage >= policy.thinMinCoverage) state = "thin";
    var values = eligible.map(function (entry) { return entry.volume; });
    var middle = state === "unavailable" ? null : median(values);
    var mad = middle === null ? null : median(values.map(function (value) { return Math.abs(value - middle); }));
    var currentVolume = current.cumulativeObservedVolume;
    var below = values.filter(function (value) { return value < currentVolume; }).length;
    var equal = values.filter(function (value) { return value === currentVolume; }).length;
    var percentile = state === "unavailable" ? null : 100 * (below + 0.5 * equal) / values.length;
    var relativeVolume = middle !== null && middle > 0 ? currentVolume / middle : null;
    var robustZ = mad !== null && mad > 0 ? 0.67448975 * (currentVolume - middle) / mad : null;
    var unusualness = "unavailable";
    if (state === "thin") unusualness = "not-qualified";
    else if (state === "qualified" && mad === 0) unusualness = "zero-dispersion";
    else if (state === "qualified" && percentile >= policy.highPercentile && robustZ >= policy.highRobustZ) unusualness = "high";
    else if (state === "qualified" && percentile <= policy.lowPercentile && robustZ <= policy.lowRobustZ) unusualness = "low";
    else if (state === "qualified") unusualness = "ordinary";
    var reasonCodes = state === "qualified" ? [] : (state === "thin" ? ["sample-thin"] : ["sample-unavailable"]);
    if (state === "qualified" && mad === 0) reasonCodes.push("zero-dispersion");
    var semanticInput = {
      contractVersion: "comparable-volume-baseline-semantic/v1",
      candidates: candidates.map(function (candidate) { return candidate.candidateId; }),
      comparisonWindow: comparisonWindow,
      currentAggregateRef: current.semanticFingerprint,
      currentVolume: currentVolume,
      eligibleSessions: eligible,
      excludedSessions: excluded,
      policy: policy,
      state: state,
      unusualness: unusualness
    };
    var semanticFingerprint = contracts.semanticFingerprint("comparable-volume-baseline", semanticInput);
    var occurrenceFingerprint = contracts.occurrenceFingerprint("comparable-volume-baseline", {
      contractVersion: "comparable-volume-baseline-occurrence/v1",
      cutoffAt: current.cutoffAt,
      semanticFingerprint: semanticFingerprint
    });
    var baseline = {
      contractVersion: "comparable-volume-baseline/v1",
      baselineId: occurrenceFingerprint,
      semanticFingerprint: semanticFingerprint,
      occurrenceFingerprint: occurrenceFingerprint,
      state: state,
      currentAggregateRef: semanticInput.currentAggregateRef,
      comparisonWindow: comparisonWindow,
      candidateSessionCount: candidates.length,
      eligibleSessionCount: eligible.length,
      missingSessionCount: excluded.length,
      coverage: coverage,
      eligibleSessions: eligible,
      excludedSessions: excluded,
      currentVolume: currentVolume,
      median: middle,
      mad: mad,
      midrankPercentile: percentile,
      relativeVolume: relativeVolume,
      robustZ: robustZ,
      unusualness: unusualness,
      peerRefs: [],
      reasonCodes: reasonCodes
    };
    var validation = validateComparableVolumeBaseline(baseline);
    return validation.ok ? success(baseline) : validation;
  }

  function validateComparableVolumeBaseline(value) {
    if (!isPlainObject(value)) return failure("B002-COMPARABILITY", "baseline-required", "baseline");
    var unknown = hasOnlyFields(value, BASELINE_FIELDS);
    if (unknown) return failure("B002-COMPARABILITY", "baseline-unknown-field", unknown);
    if (value.contractVersion !== "comparable-volume-baseline/v1" || !HASH_PATTERN.test(value.baselineId || "") ||
        !HASH_PATTERN.test(value.semanticFingerprint || "") || !HASH_PATTERN.test(value.occurrenceFingerprint || "") ||
        ["qualified", "thin", "unavailable"].indexOf(value.state) === -1 ||
        !nonNegativeInteger(value.candidateSessionCount) || !nonNegativeInteger(value.eligibleSessionCount) ||
        !nonNegativeInteger(value.missingSessionCount) ||
        value.candidateSessionCount !== value.eligibleSessionCount + value.missingSessionCount) {
      return failure("B002-COMPARABILITY", "baseline-contract-invalid", "baseline");
    }
    if (value.baselineId !== value.occurrenceFingerprint) {
      return failure("B002-COMPARABILITY", "baseline-identity-mismatch", "baselineId");
    }
    if (!HASH_PATTERN.test(value.currentAggregateRef || "") || !isPlainObject(value.comparisonWindow) ||
        value.comparisonWindow.contractVersion !== "comparison-window/v1" ||
        !SESSION_KINDS[value.comparisonWindow.sessionKind] ||
        !nonNegativeInteger(value.comparisonWindow.startBucket) ||
        !nonNegativeInteger(value.comparisonWindow.endBucketInclusive) ||
        value.comparisonWindow.startBucket > value.comparisonWindow.endBucketInclusive) {
      return failure("B002-COMPARABILITY", "baseline-window-invalid", "baseline");
    }
    if (!Array.isArray(value.eligibleSessions) || !Array.isArray(value.excludedSessions) ||
        !Array.isArray(value.peerRefs) || !Array.isArray(value.reasonCodes) ||
        value.eligibleSessions.length !== value.eligibleSessionCount ||
        value.excludedSessions.length !== value.missingSessionCount ||
        value.peerRefs.some(function (ref) { return !HASH_PATTERN.test(ref); }) ||
        value.reasonCodes.some(function (reason) { return typeof reason !== "string" || !reason; })) {
      return failure("B002-COMPARABILITY", "baseline-lineage-invalid", "baseline");
    }
    if (value.eligibleSessions.some(function (entry) {
      return !isPlainObject(entry) || !DATE_PATTERN.test(entry.tradingDate || "") ||
        !nonNegativeInteger(entry.volume) || ["observed", "observed-zero"].indexOf(entry.volumeState) === -1 ||
        !HASH_PATTERN.test(entry.sourceRef || "") || !HASH_PATTERN.test(entry.comparisonBoundarySignature || "");
    }) || value.excludedSessions.some(function (entry) {
      return !isPlainObject(entry) || (entry.tradingDate !== null && !DATE_PATTERN.test(entry.tradingDate || "")) ||
        !Array.isArray(entry.reasonCodes) || entry.reasonCodes.length === 0;
    })) {
      return failure("B002-COMPARABILITY", "baseline-session-record-invalid", "baseline");
    }
    var expectedCoverage = value.candidateSessionCount === 0 ? null : value.eligibleSessionCount / value.candidateSessionCount;
    var numericFields = ["median", "mad", "midrankPercentile", "relativeVolume", "robustZ"];
    if (value.coverage !== expectedCoverage || value.coverage === null || value.coverage < 0 || value.coverage > 1 ||
        (value.currentVolume !== null && !nonNegativeInteger(value.currentVolume)) ||
        numericFields.some(function (field) { return value[field] !== null && !finiteNumber(value[field]); }) ||
        (value.mad !== null && value.mad < 0) ||
        (value.midrankPercentile !== null && (value.midrankPercentile < 0 || value.midrankPercentile > 100)) ||
        (value.relativeVolume !== null && value.relativeVolume < 0)) {
      return failure("B002-COMPARABILITY", "baseline-statistics-invalid", "baseline");
    }
    var expectedState = value.eligibleSessionCount >= 10 && value.coverage >= 0.70 ? "qualified" :
      (value.eligibleSessionCount >= 5 && value.coverage >= 0.40 ? "thin" : "unavailable");
    if (value.state !== expectedState) {
      return failure("B002-COMPARABILITY", "baseline-qualification-invalid", "state");
    }
    var allowedUnusualness = value.state === "qualified" ? ["high", "low", "ordinary", "zero-dispersion"] :
      (value.state === "thin" ? ["not-qualified"] : ["unavailable"]);
    if (allowedUnusualness.indexOf(value.unusualness) === -1 ||
        (value.state === "qualified" && value.mad === 0 && value.unusualness !== "zero-dispersion") ||
        (value.unusualness === "zero-dispersion" && (value.mad !== 0 || value.robustZ !== null)) ||
        ((value.unusualness === "high" || value.unusualness === "low") && value.robustZ === null) ||
        (value.state === "unavailable" && numericFields.some(function (field) { return value[field] !== null; }))) {
      return failure("B002-COMPARABILITY", "baseline-unusualness-invalid", "unusualness");
    }
    return success(value);
  }

  function validateSchedule(schedule) {
    if (!isPlainObject(schedule) || schedule.contractVersion !== "report-schedule/v1" ||
        typeof schedule.reportId !== "string" || !schedule.reportId || typeof schedule.reportType !== "string" ||
        !DATE_PATTERN.test(schedule.reportPeriod + "-01") || !Array.isArray(schedule.metricDefinitions) || schedule.metricDefinitions.length === 0) {
      return failure("B002-REPORT-REQUIRED", "report-schedule-invalid", "schedule");
    }
    var scheduled = canonicalTimestampResult(schedule.scheduledAt, "schedule.scheduledAt");
    if (!scheduled.ok) return failure("B002-TIMESTAMP", scheduled.reason, scheduled.field);
    var seen = Object.create(null);
    for (var index = 0; index < schedule.metricDefinitions.length; index += 1) {
      var definition = schedule.metricDefinitions[index];
      if (!isPlainObject(definition) || typeof definition.metricId !== "string" || !definition.metricId || seen[definition.metricId] ||
          typeof definition.unit !== "string" || typeof definition.seasonalBasis !== "string" || typeof definition.transform !== "string") {
        return failure("B002-REPORT-REQUIRED", "report-metric-definition-invalid", "schedule.metricDefinitions");
      }
      seen[definition.metricId] = true;
    }
    return { ok: true, scheduled: scheduled };
  }

  function comparableMetric(metric, definition, reportPeriod) {
    return isPlainObject(metric) && metric.metricId === definition.metricId && metric.period === reportPeriod &&
      metric.unit === definition.unit && metric.seasonalBasis === definition.seasonalBasis &&
      metric.transform === definition.transform && finiteNumber(metric.value);
  }

  function validateConsensus(consensus, schedule, evidenceRoot) {
    if (consensus === null) return { ok: false, reason: "consensus-unavailable" };
    var fields = [
      "capturedAt", "consensusId", "contentSha256", "contractVersion", "fingerprint",
      "lockManifestSha256", "lockedAt", "lockRunId", "metricId", "preReleaseLockRef",
      "reportId", "reportPeriod", "scheduledAt", "seasonalBasis", "sourcePublishedAt",
      "sourceRef", "transform", "unit", "value"
    ];
    if (!isPlainObject(consensus) || hasOnlyFields(consensus, fields)) return { ok: false, reason: "consensus-lock-invalid" };
    if (!isPlainObject(consensus) || consensus.contractVersion !== "report-consensus-artifact/v1" ||
        consensus.reportId !== schedule.reportId || consensus.reportPeriod !== schedule.reportPeriod ||
        !finiteNumber(consensus.value) || !HASH_PATTERN.test(consensus.contentSha256 || "") ||
        !HASH_PATTERN.test(consensus.fingerprint || "") || !HASH_PATTERN.test(consensus.lockManifestSha256 || "") ||
        typeof consensus.consensusId !== "string" || !consensus.consensusId ||
        typeof consensus.sourceRef !== "string" || !consensus.sourceRef ||
        typeof consensus.lockRunId !== "string" || !consensus.lockRunId ||
        consensus.scheduledAt !== schedule.scheduledAt) return { ok: false, reason: "consensus-lock-invalid" };
    var definition = schedule.metricDefinitions.find(function (item) { return item.metricId === consensus.metricId; });
    if (!definition || consensus.unit !== definition.unit || consensus.seasonalBasis !== definition.seasonalBasis ||
        consensus.transform !== definition.transform) return { ok: false, reason: "consensus-lock-invalid" };
    var times = [consensus.sourcePublishedAt, consensus.capturedAt, consensus.lockedAt];
    var scheduledEpoch = Date.parse(schedule.scheduledAt);
    var parsedTimes = times.map(function (value) {
      var parsed = canonicalTimestampResult(value, "consensus");
      return parsed.ok ? parsed.epoch : null;
    });
    if (parsedTimes.some(function (epoch) { return epoch === null || epoch >= scheduledEpoch; }) ||
        parsedTimes[0] > parsedTimes[1] || parsedTimes[1] > parsedTimes[2]) {
      return { ok: false, reason: "consensus-lock-invalid" };
    }
    var refResult = contracts.validateEvidenceReference(consensus.preReleaseLockRef, { evidenceRoot: evidenceRoot });
    if (!refResult.ok || Date.parse(consensus.preReleaseLockRef.cutoffAt) >= scheduledEpoch) {
      return { ok: false, reason: "consensus-lock-invalid" };
    }
    var fingerprintInput = {};
    fields.forEach(function (field) {
      if (field !== "fingerprint") fingerprintInput[field] = consensus[field];
    });
    if (contracts.semanticFingerprint("report-consensus-artifact", fingerprintInput) !== consensus.fingerprint) {
      return { ok: false, reason: "consensus-lock-invalid" };
    }
    return {
      ok: true,
      value: {
        metricId: consensus.metricId,
        period: consensus.reportPeriod,
        value: consensus.value,
        unit: consensus.unit,
        seasonalBasis: consensus.seasonalBasis,
        transform: consensus.transform,
        sourceRef: consensus.sourceRef,
        preReleaseLockRef: consensus.preReleaseLockRef,
        consensusId: consensus.consensusId
      }
    };
  }

  function referenceFor(evidenceType, value, cutoffAt, evidenceRoot, category, state, provenanceRefs) {
    var semantic = value.semanticFingerprint || contracts.semanticFingerprint(evidenceType, value);
    var path = evidenceRoot + "/" + category + "/" + semantic.slice(7) + ".json";
    return {
      contractVersion: "evidence-reference/v1",
      evidenceType: evidenceType,
      fingerprint: semantic,
      path: path,
      sha256: contracts.contentSha256(value, value.contractVersion),
      state: state,
      cutoffAt: cutoffAt,
      provenanceRefs: Array.from(new Set((provenanceRefs || []).filter(function (ref) { return HASH_PATTERN.test(ref); }))).sort()
    };
  }

  function normalizeReleasedReport(sourceSnapshot, schedule, consensus, previousEvidence, cutoffAt) {
    var scheduleResult = validateSchedule(schedule);
    if (!scheduleResult.ok) return scheduleResult;
    var cutoff = canonicalTimestampResult(cutoffAt, "cutoffAt");
    if (!cutoff.ok) return failure("B002-TIMESTAMP", cutoff.reason, cutoff.field);
    if (!isPlainObject(sourceSnapshot) || sourceSnapshot.contractVersion !== "report-source-snapshot/v1" ||
        sourceSnapshot.reportId !== schedule.reportId || sourceSnapshot.reportPeriod !== schedule.reportPeriod ||
        !Array.isArray(sourceSnapshot.sourceRecords)) {
      return failure("B002-REPORT-REQUIRED", "report-source-snapshot-invalid", "sourceSnapshot");
    }
    if (previousEvidence !== null) {
      var previousValidation = validateReleasedReportEvidence(previousEvidence);
      if (!previousValidation.ok) return previousValidation;
      if (previousEvidence.reportId !== schedule.reportId || previousEvidence.reportPeriod !== schedule.reportPeriod) {
        return failure("B002-REPORT-REQUIRED", "previous-report-identity-mismatch", "previousEvidence");
      }
    }
    var upcoming = cutoff.epoch < scheduleResult.scheduled.epoch;
    var acceptedRecords = [];
    var reasonCodes = [];
    for (var index = 0; index < sourceSnapshot.sourceRecords.length; index += 1) {
      var record = sourceSnapshot.sourceRecords[index];
      if (!isPlainObject(record) || !Array.isArray(record.metrics) || typeof record.sourceRecordId !== "string") {
        return failure("B002-REPORT-REQUIRED", "report-source-record-invalid", "sourceRecords");
      }
      var sourceValidation = contracts.validateSourceProvenance(record.sourceRef);
      if (!sourceValidation.ok) return failure("B002-REPORT-REQUIRED", "report-source-provenance-invalid", "sourceRecords.sourceRef");
      var released = canonicalTimestampResult(record.releasedAt, "sourceRecords.releasedAt");
      if (!released.ok) return failure("B002-TIMESTAMP", released.reason, released.field);
      if (released.epoch < scheduleResult.scheduled.epoch) {
        reasonCodes.push("source-record-before-schedule");
        continue;
      }
      if (Date.parse(record.sourceRef.retrievedAt) < released.epoch) {
        reasonCodes.push("source-record-retrieved-before-release");
        continue;
      }
      if (Date.parse(record.sourceRef.retrievedAt) > cutoff.epoch || released.epoch > cutoff.epoch) {
        reasonCodes.push("source-record-after-cutoff");
        continue;
      }
      acceptedRecords.push({
        record: record,
        released: released,
        sourceRef: contracts.occurrenceFingerprint("source-provenance", record.sourceRef)
      });
    }

    var actual = [];
    var previous = [];
    var disputed = false;
    if (!upcoming) {
      for (index = 0; index < schedule.metricDefinitions.length; index += 1) {
        var definition = schedule.metricDefinitions[index];
        var matches = [];
        acceptedRecords.forEach(function (entry) {
          entry.record.metrics.forEach(function (metric) {
            if (comparableMetric(metric, definition, schedule.reportPeriod)) {
              matches.push({
                metricId: metric.metricId,
                period: metric.period,
                value: metric.value,
                unit: metric.unit,
                seasonalBasis: metric.seasonalBasis,
                transform: metric.transform,
                sourceRef: entry.sourceRef
              });
            }
          });
        });
        var values = Array.from(new Set(matches.map(function (metric) { return metric.value; })));
        if (values.length > 1) disputed = true;
        else if (matches.length > 0) actual.push(matches[0]);
        acceptedRecords.forEach(function (entry) {
          (entry.record.previous || []).forEach(function (metric) {
            if (metric.metricId === definition.metricId && finiteNumber(metric.value) &&
                typeof metric.period === "string" && metric.period && metric.unit === definition.unit &&
                metric.seasonalBasis === definition.seasonalBasis && metric.transform === definition.transform) {
              previous.push({
                metricId: metric.metricId,
                period: metric.period,
                value: metric.value,
                unit: metric.unit,
                seasonalBasis: metric.seasonalBasis,
                transform: metric.transform,
                sourceRef: entry.sourceRef
              });
            }
          });
        });
      }
    }
    if (disputed) {
      actual = [];
      reasonCodes.push("provider-disagreement");
    }

    var consensusResult = validateConsensus(consensus, schedule, "briefs/objects/evidence");
    var consensusValues = [];
    if (!upcoming && consensusResult.ok) consensusValues.push(consensusResult.value);
    else if (!consensusResult.ok) reasonCodes.push(consensusResult.reason);
    var surprises = [];
    actual.forEach(function (actualMetric) {
      var consensusMetric = consensusValues.find(function (item) {
        return item.metricId === actualMetric.metricId && item.period === actualMetric.period &&
          item.unit === actualMetric.unit && item.seasonalBasis === actualMetric.seasonalBasis &&
          item.transform === actualMetric.transform;
      });
      if (consensusMetric) {
        surprises.push({
          metricId: actualMetric.metricId,
          period: actualMetric.period,
          value: actualMetric.value - consensusMetric.value,
          unit: "percentage-points",
          seasonalBasis: actualMetric.seasonalBasis,
          transform: actualMetric.transform
        });
      }
    });

    var state = "upcoming";
    if (!upcoming) {
      if (disputed) state = "disputed";
      else if (actual.length === schedule.metricDefinitions.length) state = "released";
      else if (previousEvidence && (previousEvidence.state === "released" || previousEvidence.state === "revised")) state = "stale";
      else state = "unavailable";
    }
    var revisionNumber = 0;
    var changed = false;
    if (previousEvidence && state === "released") {
      changed = contracts.canonicalize(actual, "released-report-values/v1") !==
        contracts.canonicalize(previousEvidence.actual, "released-report-values/v1");
      revisionNumber = previousEvidence.revisionNumber + (changed ? 1 : 0);
      if (changed) state = "revised";
      else if (previousEvidence.state === "revised") state = "revised";
    }
    var releasedAt = acceptedRecords.length ? acceptedRecords.map(function (entry) { return entry.released.value; }).sort()[0] : null;
    var releaseIdentity = contracts.semanticFingerprint("released-report-release", {
      contractVersion: "released-report-release-identity/v1",
      metricIds: schedule.metricDefinitions.map(function (definition) { return definition.metricId; }),
      releasedAt: releasedAt,
      reportId: schedule.reportId,
      reportPeriod: schedule.reportPeriod,
      scheduledAt: schedule.scheduledAt
    });
    var revisionIdentity = contracts.semanticFingerprint("released-report-revision", {
      contractVersion: "released-report-revision-identity/v1",
      actual: actual,
      previous: previous,
      releaseIdentity: releaseIdentity,
      revisionNumber: revisionNumber,
      sourceRecords: acceptedRecords.map(function (entry) {
        return { sourceRecordId: entry.record.sourceRecordId, sourceRef: entry.sourceRef, metrics: entry.record.metrics };
      })
    });
    var report = {
      contractVersion: "released-report-evidence/v1",
      reportId: schedule.reportId,
      reportType: schedule.reportType,
      reportPeriod: schedule.reportPeriod,
      scheduledAt: schedule.scheduledAt,
      releasedAt: releasedAt,
      state: state,
      metrics: schedule.metricDefinitions.map(function (definition) { return Object.assign({}, definition); }),
      actual: actual,
      consensus: consensusValues,
      previous: previous,
      surprises: surprises,
      revisionNumber: revisionNumber,
      releaseIdentity: releaseIdentity,
      revisionIdentity: revisionIdentity,
      supersedesEvidenceRef: changed ? referenceFor(
        "released-report-evidence",
        previousEvidence,
        previousEvidence.cutoffAt,
        "briefs/objects/evidence",
        "reports/" + encodeURIComponent(schedule.reportId),
        previousEvidence.state,
        previousEvidence.sourceRecords.map(function (entry) { return entry.sourceRef; })
      ) : null,
      sourceRecords: acceptedRecords.map(function (entry) {
        return {
          sourceRecordId: entry.record.sourceRecordId,
          sourceRef: entry.sourceRef,
          releasedAt: entry.released.value,
          metrics: entry.record.metrics.map(function (metric) { return Object.assign({}, metric); })
        };
      }),
      cutoffAt: cutoff.value,
      freshnessState: state === "stale" ? "stale" : (state === "upcoming" ? "not-applicable" : "current"),
      reasonCodes: Array.from(new Set(reasonCodes)).sort(),
      semanticFingerprint: null,
      occurrenceFingerprint: null
    };
    report.semanticFingerprint = contracts.semanticFingerprint("released-report-evidence", report);
    report.occurrenceFingerprint = contracts.occurrenceFingerprint("released-report-evidence", report);
    var validation = validateReleasedReportEvidence(report);
    return validation.ok ? success(report) : validation;
  }

  function validateReleasedReportEvidence(value) {
    if (!isPlainObject(value)) return failure("B002-REPORT-REQUIRED", "released-report-required", "report");
    var unknown = hasOnlyFields(value, REPORT_FIELDS);
    if (unknown) return failure("B002-REPORT-REQUIRED", "released-report-unknown-field", unknown);
    if (value.contractVersion !== "released-report-evidence/v1" ||
        ["upcoming", "released", "revised", "stale", "unavailable", "disputed"].indexOf(value.state) === -1 ||
        !HASH_PATTERN.test(value.releaseIdentity || "") || !HASH_PATTERN.test(value.revisionIdentity || "") ||
        !HASH_PATTERN.test(value.semanticFingerprint || "") || !HASH_PATTERN.test(value.occurrenceFingerprint || "") ||
        !nonNegativeInteger(value.revisionNumber) || !Array.isArray(value.metrics) || !Array.isArray(value.actual) ||
        !Array.isArray(value.consensus) || !Array.isArray(value.previous) || !Array.isArray(value.surprises) ||
        !Array.isArray(value.sourceRecords) || !Array.isArray(value.reasonCodes)) {
      return failure("B002-REPORT-REQUIRED", "released-report-contract-invalid", "report");
    }
    var cutoff = canonicalTimestampResult(value.cutoffAt, "cutoffAt");
    var scheduled = canonicalTimestampResult(value.scheduledAt, "scheduledAt");
    if (!cutoff.ok) return failure("B002-TIMESTAMP", cutoff.reason, cutoff.field);
    if (!scheduled.ok) return failure("B002-TIMESTAMP", scheduled.reason, scheduled.field);
    if (value.releasedAt !== null) {
      var released = canonicalTimestampResult(value.releasedAt, "releasedAt");
      if (!released.ok || released.epoch > cutoff.epoch) return failure("B002-TIMESTAMP", "report-release-after-cutoff", "releasedAt");
    }
    if ((value.state === "upcoming" && (value.releasedAt !== null || value.actual.length > 0 || value.surprises.length > 0)) ||
        ((value.state === "released" || value.state === "revised") && (value.releasedAt === null || value.actual.length === 0))) {
      return failure("B002-REPORT-REQUIRED", "report-state-time-mismatch", "state");
    }
    var definitionsValid = value.metrics.every(function (metric) {
      return isPlainObject(metric) && typeof metric.metricId === "string" && metric.metricId &&
        typeof metric.unit === "string" && metric.unit && typeof metric.seasonalBasis === "string" && metric.seasonalBasis &&
        typeof metric.transform === "string" && metric.transform;
    });
    var sourcedMetricValid = function (metric, allowCitationRef) {
      return isPlainObject(metric) && typeof metric.metricId === "string" && metric.metricId &&
        typeof metric.period === "string" && metric.period && finiteNumber(metric.value) &&
        typeof metric.unit === "string" && metric.unit && typeof metric.seasonalBasis === "string" && metric.seasonalBasis &&
        typeof metric.transform === "string" && metric.transform &&
        (allowCitationRef ? (typeof metric.sourceRef === "string" && metric.sourceRef.length > 0) : HASH_PATTERN.test(metric.sourceRef || ""));
    };
    if (!definitionsValid || value.actual.some(function (metric) { return !sourcedMetricValid(metric, false); }) ||
        value.previous.some(function (metric) { return !sourcedMetricValid(metric, false); }) ||
        value.consensus.some(function (metric) { return !sourcedMetricValid(metric, true); }) ||
        value.surprises.some(function (metric) {
          return !isPlainObject(metric) || typeof metric.metricId !== "string" || !metric.metricId ||
            typeof metric.period !== "string" || !metric.period || !finiteNumber(metric.value) ||
            typeof metric.unit !== "string" || !metric.unit || typeof metric.seasonalBasis !== "string" || !metric.seasonalBasis ||
            typeof metric.transform !== "string" || !metric.transform;
        })) {
      return failure("B002-REPORT-REQUIRED", "released-report-metric-invalid", "report");
    }
    var sourceRecordIds = Object.create(null);
    for (var sourceIndex = 0; sourceIndex < value.sourceRecords.length; sourceIndex += 1) {
      var sourceRecord = value.sourceRecords[sourceIndex];
      var sourceReleased = isPlainObject(sourceRecord) ? canonicalTimestampResult(sourceRecord.releasedAt, "sourceRecords.releasedAt") : { ok: false };
      if (!isPlainObject(sourceRecord) || typeof sourceRecord.sourceRecordId !== "string" || !sourceRecord.sourceRecordId ||
          sourceRecordIds[sourceRecord.sourceRecordId] || !HASH_PATTERN.test(sourceRecord.sourceRef || "") ||
          !sourceReleased.ok || sourceReleased.epoch > cutoff.epoch || !Array.isArray(sourceRecord.metrics) ||
          sourceRecord.metrics.some(function (metric) {
            return !isPlainObject(metric) || typeof metric.metricId !== "string" || !metric.metricId ||
              typeof metric.period !== "string" || !metric.period || !finiteNumber(metric.value) ||
              typeof metric.unit !== "string" || !metric.unit || typeof metric.seasonalBasis !== "string" || !metric.seasonalBasis ||
              typeof metric.transform !== "string" || !metric.transform;
          })) {
        return failure("B002-REPORT-REQUIRED", "released-report-source-record-invalid", "sourceRecords");
      }
      sourceRecordIds[sourceRecord.sourceRecordId] = true;
    }
    if (["current", "stale", "not-applicable"].indexOf(value.freshnessState) === -1 ||
        value.reasonCodes.some(function (reason) { return typeof reason !== "string" || !reason; })) {
      return failure("B002-REPORT-REQUIRED", "released-report-state-invalid", "report");
    }
    if (value.supersedesEvidenceRef !== null) {
      var supersedesResult = contracts.validateEvidenceReference(value.supersedesEvidenceRef, { evidenceRoot: "briefs/objects/evidence" });
      if (!supersedesResult.ok) return failure("B002-REPORT-REQUIRED", "released-report-supersedes-invalid", "supersedesEvidenceRef");
    }
    var semanticCandidate = Object.assign({}, value, {
      occurrenceFingerprint: null,
      semanticFingerprint: null
    });
    if (contracts.semanticFingerprint("released-report-evidence", semanticCandidate) !== value.semanticFingerprint) {
      return failure("B002-REPORT-REQUIRED", "released-report-fingerprint-mismatch", "semanticFingerprint");
    }
    var occurrenceCandidate = Object.assign({}, value, { occurrenceFingerprint: null });
    if (contracts.occurrenceFingerprint("released-report-evidence", occurrenceCandidate) !== value.occurrenceFingerprint) {
      return failure("B002-REPORT-REQUIRED", "released-report-occurrence-mismatch", "occurrenceFingerprint");
    }
    return success(value);
  }

  function validateReactionPolicy(policy) {
    if (!isPlainObject(policy)) return failure("B002-REACTION", "reaction-policy-required", "policy");
    var unknown = hasOnlyFields(policy, ["contractVersion", "interval", "segmentOrder", "strictPostRelease"]);
    if (unknown) return failure("B002-REACTION", "reaction-policy-unknown-field", "policy." + unknown);
    if (policy.contractVersion !== "reaction-policy/v1" || policy.interval !== "PT5M" || policy.strictPostRelease !== true ||
        !Array.isArray(policy.segmentOrder) || policy.segmentOrder.join(",") !== "pre-market,regular,after-hours") {
      return failure("B002-REACTION", "reaction-policy-invalid", "policy");
    }
    return { ok: true };
  }

  function semanticWindow(window) {
    return {
      contractVersion: window.contractVersion,
      role: window.role,
      sessionKind: window.sessionKind,
      startBucket: window.startBucket,
      endBucketInclusive: window.endBucketInclusive,
      startAt: window.startAt,
      endAt: window.endAt,
      expectedBucketCount: window.expectedBucketCount,
      observationSemanticRefs: window.observationSemanticRefs,
      missingBuckets: window.missingBuckets
    };
  }

  function reactionSegmentSemanticInput(segment) {
    return {
      contractVersion: "reaction-segment-semantic/v1",
      segmentContractVersion: segment.contractVersion,
      reactionPolicyVersion: "reaction-policy/v1",
      segmentOrdinal: segment.segmentOrdinal,
      releaseIdentity: segment.releaseIdentity,
      symbol: segment.symbol,
      providerSymbol: segment.providerSymbol,
      tradingDate: segment.tradingDate,
      calendarFingerprint: segment.calendarFingerprint,
      sessionKind: segment.sessionKind,
      sessionStart: segment.sessionStart,
      sessionEnd: segment.sessionEnd,
      comparisonBoundarySignature: segment.comparisonBoundarySignature,
      interval: segment.interval,
      preReleaseWindow: semanticWindow(segment.preReleaseWindow),
      postReleaseWindow: semanticWindow(segment.postReleaseWindow),
      comparisonWindow: segment.comparisonWindow,
      startBucket: segment.startBucket,
      endBucketInclusive: segment.endBucketInclusive,
      startAt: segment.startAt,
      endAt: segment.endAt,
      sourceId: segment.sourceId,
      adapterVersion: segment.adapterVersion,
      priceBasis: segment.priceBasis,
      adjustmentState: segment.adjustmentState,
      state: segment.state,
      expectedBucketCount: segment.expectedBucketCount,
      priceBarCount: segment.priceBarCount,
      volumeBarCount: segment.volumeBarCount,
      missingBuckets: segment.missingBuckets,
      latest: segment.latest,
      high: segment.high,
      low: segment.low,
      cumulativeObservedVolume: segment.cumulativeObservedVolume,
      volumeCompleteness: segment.volumeCompleteness,
      observationSemanticRefs: segment.observationSemanticRefs,
      reasonCodes: segment.reasonCodes
    };
  }

  function reactionSegmentOccurrenceInput(segment, semanticFingerprint) {
    return {
      contractVersion: "reaction-segment-occurrence/v1",
      semanticFingerprint: semanticFingerprint || segment.semanticFingerprint,
      cutoffAt: segment.cutoffAt,
      preReleaseObservationRefs: segment.preReleaseWindow.observationRefs,
      postReleaseObservationRefs: segment.postReleaseWindow.observationRefs,
      sourceRefs: segment.sourceRefs
    };
  }

  function validateCompletedBarWindow(value, expectedRole) {
    if (!isPlainObject(value) || hasOnlyFields(value, COMPLETED_BAR_WINDOW_FIELDS) ||
        value.contractVersion !== "completed-bar-window/v1" || value.role !== expectedRole ||
        !SESSION_KINDS[value.sessionKind] || !nonNegativeInteger(value.startBucket) ||
        !nonNegativeInteger(value.endBucketInclusive) || value.startBucket > value.endBucketInclusive ||
        !nonNegativeInteger(value.expectedBucketCount) ||
        value.expectedBucketCount !== value.endBucketInclusive - value.startBucket + 1 ||
        !Array.isArray(value.observationSemanticRefs) || !Array.isArray(value.observationRefs) ||
        !Array.isArray(value.missingBuckets) ||
        value.observationSemanticRefs.length !== value.observationRefs.length ||
        value.observationSemanticRefs.some(function (ref) { return !HASH_PATTERN.test(ref); }) ||
        value.observationRefs.some(function (ref) { return !HASH_PATTERN.test(ref); }) ||
        new Set(value.observationSemanticRefs).size !== value.observationSemanticRefs.length ||
        new Set(value.observationRefs).size !== value.observationRefs.length) {
      return failure("B002-REACTION", "completed-bar-window-invalid", expectedRole);
    }
    var start = canonicalTimestampResult(value.startAt, expectedRole + ".startAt");
    var end = canonicalTimestampResult(value.endAt, expectedRole + ".endAt");
    if (!start.ok || !end.ok || start.epoch >= end.epoch ||
        end.epoch - start.epoch !== value.expectedBucketCount * FIVE_MINUTES_MS) {
      return failure("B002-TIMESTAMP", "completed-bar-window-time-invalid", expectedRole);
    }
    var previousMissing = -1;
    for (var index = 0; index < value.missingBuckets.length; index += 1) {
      var missing = value.missingBuckets[index];
      if (!nonNegativeInteger(missing) || missing < value.startBucket ||
          missing > value.endBucketInclusive || missing <= previousMissing) {
        return failure("B002-REACTION", "completed-bar-window-missing-invalid", expectedRole + ".missingBuckets");
      }
      previousMissing = missing;
    }
    if (value.observationRefs.length + value.missingBuckets.length !== value.expectedBucketCount) {
      return failure("B002-REACTION", "completed-bar-window-coverage-invalid", expectedRole);
    }
    if (expectedRole === "pre-release-baseline" &&
        (value.expectedBucketCount !== 1 || value.observationRefs.length !== 1 || value.missingBuckets.length !== 0)) {
      return failure("B002-REACTION", "pre-release-window-invalid", expectedRole);
    }
    return { ok: true };
  }

  function validateReactionSegment(value) {
    if (!isPlainObject(value) || hasOnlyFields(value, REACTION_SEGMENT_FIELDS) ||
        value.contractVersion !== "reaction-segment/v1" || !HASH_PATTERN.test(value.segmentId || "") ||
        !HASH_PATTERN.test(value.semanticFingerprint || "") || !HASH_PATTERN.test(value.occurrenceFingerprint || "") ||
        !nonNegativeInteger(value.segmentOrdinal) || !HASH_PATTERN.test(value.releaseIdentity || "") ||
        typeof value.symbol !== "string" || !value.symbol || typeof value.providerSymbol !== "string" || !value.providerSymbol ||
        !DATE_PATTERN.test(value.tradingDate || "") || !HASH_PATTERN.test(value.calendarFingerprint || "") ||
        !SESSION_KINDS[value.sessionKind] || !HASH_PATTERN.test(value.comparisonBoundarySignature || "") ||
        value.interval !== "PT5M" || typeof value.sourceId !== "string" || !value.sourceId ||
        typeof value.adapterVersion !== "string" || !value.adapterVersion || value.priceBasis !== "provider-chart-basis" ||
        value.adjustmentState !== "compatible" || ["available", "partial", "stale"].indexOf(value.state) === -1) {
      return failure("B002-REACTION", "reaction-segment-invalid", "segments");
    }
    var timestampFields = ["sessionStart", "sessionEnd", "startAt", "endAt", "cutoffAt"];
    var epochs = Object.create(null);
    for (var timestampIndex = 0; timestampIndex < timestampFields.length; timestampIndex += 1) {
      var parsed = canonicalTimestampResult(value[timestampFields[timestampIndex]], "segments." + timestampFields[timestampIndex]);
      if (!parsed.ok) return failure("B002-TIMESTAMP", "reaction-segment-time-invalid", "segments");
      epochs[timestampFields[timestampIndex]] = parsed.epoch;
    }
    if (epochs.sessionStart >= epochs.sessionEnd || epochs.startAt < epochs.sessionStart ||
        epochs.endAt > epochs.sessionEnd || epochs.endAt > epochs.cutoffAt || epochs.startAt >= epochs.endAt ||
        epochs.startAt !== epochs.sessionStart + value.startBucket * FIVE_MINUTES_MS ||
        epochs.endAt !== epochs.sessionStart + (value.endBucketInclusive + 1) * FIVE_MINUTES_MS) {
      return failure("B002-TIMESTAMP", "reaction-segment-time-invalid", "segments");
    }
    var preWindowResult = validateCompletedBarWindow(value.preReleaseWindow, "pre-release-baseline");
    if (!preWindowResult.ok) return preWindowResult;
    var postWindowResult = validateCompletedBarWindow(value.postReleaseWindow, "post-release-reaction");
    if (!postWindowResult.ok) return postWindowResult;
    if (!isPlainObject(value.comparisonWindow) ||
        hasOnlyFields(value.comparisonWindow, ["contractVersion", "endBucketInclusive", "sessionKind", "startBucket"]) ||
        value.comparisonWindow.contractVersion !== "comparison-window/v1" ||
        value.comparisonWindow.sessionKind !== value.sessionKind ||
        value.comparisonWindow.startBucket !== value.startBucket ||
        value.comparisonWindow.endBucketInclusive !== value.endBucketInclusive ||
        value.postReleaseWindow.sessionKind !== value.sessionKind ||
        value.postReleaseWindow.startBucket !== value.startBucket ||
        value.postReleaseWindow.endBucketInclusive !== value.endBucketInclusive ||
        value.postReleaseWindow.startAt !== value.startAt || value.postReleaseWindow.endAt !== value.endAt ||
        !sameCanonical(value.postReleaseWindow.observationSemanticRefs, value.observationSemanticRefs, "reaction-observation-semantic-refs/v1") ||
        !sameCanonical(value.postReleaseWindow.observationRefs, value.observationRefs, "reaction-observation-refs/v1") ||
        !sameCanonical(value.postReleaseWindow.missingBuckets, value.missingBuckets, "reaction-missing-buckets/v1")) {
      return failure("B002-REACTION", "reaction-segment-window-mismatch", "segments");
    }
    if (!nonNegativeInteger(value.expectedBucketCount) || !nonNegativeInteger(value.priceBarCount) ||
        !nonNegativeInteger(value.volumeBarCount) ||
        value.expectedBucketCount !== value.endBucketInclusive - value.startBucket + 1 ||
        value.priceBarCount !== value.observationRefs.length ||
        value.priceBarCount + value.missingBuckets.length !== value.expectedBucketCount ||
        value.volumeBarCount > value.priceBarCount || !Array.isArray(value.sourceRefs) ||
        value.sourceRefs.some(function (ref) { return !HASH_PATTERN.test(ref); }) ||
        new Set(value.sourceRefs).size !== value.sourceRefs.length ||
        !sameCanonical(value.sourceRefs, value.sourceRefs.slice().sort(), "reaction-source-refs/v1") ||
        !Array.isArray(value.reasonCodes) || value.reasonCodes.some(function (reason) { return typeof reason !== "string" || !reason; }) ||
        new Set(value.reasonCodes).size !== value.reasonCodes.length ||
        !sameCanonical(value.reasonCodes, value.reasonCodes.slice().sort(), "reaction-reason-codes/v1")) {
      return failure("B002-REACTION", "reaction-segment-coverage-invalid", "segments");
    }
    if (![value.latest, value.high, value.low].every(function (price) { return finiteNumber(price) && price > 0; }) ||
        value.low > value.latest || value.high < value.latest || value.low > value.high ||
        (value.cumulativeObservedVolume !== null && !nonNegativeInteger(value.cumulativeObservedVolume)) ||
        ["complete", "partial", "missing", "all-observed-zero"].indexOf(value.volumeCompleteness) === -1) {
      return failure("B002-REACTION", "reaction-segment-values-invalid", "segments");
    }
    if ((value.volumeBarCount === 0 && (value.cumulativeObservedVolume !== null || value.volumeCompleteness !== "missing")) ||
        (value.volumeBarCount > 0 && value.volumeBarCount < value.expectedBucketCount && value.volumeCompleteness !== "partial") ||
        (value.volumeBarCount === value.expectedBucketCount &&
          ((value.cumulativeObservedVolume === 0 && value.volumeCompleteness !== "all-observed-zero") ||
           (value.cumulativeObservedVolume > 0 && value.volumeCompleteness !== "complete"))) ||
        (value.state === "available" && value.reasonCodes.length !== 0) ||
        (value.state === "stale" && value.reasonCodes.indexOf("source-stale") === -1) ||
        (value.state === "partial" && value.reasonCodes.length === 0)) {
      return failure("B002-REACTION", "reaction-segment-volume-invalid", "segments");
    }
    var expectedSemantic = contracts.semanticFingerprint("reaction-segment", reactionSegmentSemanticInput(value));
    var expectedOccurrence = contracts.occurrenceFingerprint(
      "reaction-segment",
      reactionSegmentOccurrenceInput(value, expectedSemantic)
    );
    if (value.semanticFingerprint !== expectedSemantic || value.occurrenceFingerprint !== expectedOccurrence ||
        value.segmentId !== value.occurrenceFingerprint) {
      return failure("B002-REACTION", "reaction-segment-identity-mismatch", "segments");
    }
    return success(value);
  }

  function buildReactionSegment(rows, baselineObservation, report, cutoffAt, segmentOrdinal) {
    var first = rows[0];
    var sessionStartEpoch = Date.parse(first.sessionStart);
    var sessionEndEpoch = Date.parse(first.sessionEnd);
    var releaseEpoch = Date.parse(report.releasedAt);
    var cutoffEpoch = Date.parse(cutoffAt);
    var startBucket = Math.max(0, Math.floor((releaseEpoch - sessionStartEpoch) / FIVE_MINUTES_MS) + 1);
    var endBucketInclusive = Math.floor((Math.min(cutoffEpoch, sessionEndEpoch) - sessionStartEpoch) / FIVE_MINUTES_MS) - 1;
    if (startBucket > endBucketInclusive) return null;
    var startAt = new Date(sessionStartEpoch + startBucket * FIVE_MINUTES_MS).toISOString();
    var endAt = new Date(sessionStartEpoch + (endBucketInclusive + 1) * FIVE_MINUTES_MS).toISOString();
    var bucketMap = Object.create(null);
    rows.forEach(function (row) { bucketMap[row.bucketIndex] = row; });
    var missingBuckets = [];
    for (var bucketIndex = startBucket; bucketIndex <= endBucketInclusive; bucketIndex += 1) {
      if (!bucketMap[bucketIndex]) missingBuckets.push(bucketIndex);
    }
    var included = rows.filter(function (row) {
      return row.bucketIndex >= startBucket && row.bucketIndex <= endBucketInclusive;
    }).sort(function (left, right) {
      var byStart = Date.parse(left.barStart) - Date.parse(right.barStart);
      return byStart || (left.observationId < right.observationId ? -1 : 1);
    });
    var volumeRows = included.filter(function (row) { return row.volume !== null; });
    var cumulativeVolume = volumeRows.length === 0 ? null : volumeRows.reduce(function (sum, row) { return sum + row.volume; }, 0);
    var expectedBucketCount = endBucketInclusive - startBucket + 1;
    var volumeCompleteness = "missing";
    if (volumeRows.length > 0 && volumeRows.length < expectedBucketCount) volumeCompleteness = "partial";
    if (volumeRows.length === expectedBucketCount) volumeCompleteness = cumulativeVolume === 0 ? "all-observed-zero" : "complete";
    var stale = included.some(function (row) { return row.freshnessState === "stale"; });
    var reasonCodes = [];
    if (endAt !== first.sessionEnd) reasonCodes.push("segment-window-open");
    if (missingBuckets.length > 0) reasonCodes.push("missing-price-bucket");
    if (volumeRows.length < expectedBucketCount) reasonCodes.push("missing-volume-bucket");
    if (stale) reasonCodes.push("source-stale");
    reasonCodes.sort();
    var state = stale ? "stale" :
      (endAt === first.sessionEnd && missingBuckets.length === 0 &&
       (volumeCompleteness === "complete" || volumeCompleteness === "all-observed-zero") ? "available" : "partial");
    var preReleaseWindow = {
      contractVersion: "completed-bar-window/v1",
      role: "pre-release-baseline",
      sessionKind: baselineObservation.sessionKind,
      startBucket: baselineObservation.bucketIndex,
      endBucketInclusive: baselineObservation.bucketIndex,
      startAt: baselineObservation.barStart,
      endAt: baselineObservation.barEnd,
      expectedBucketCount: 1,
      observationSemanticRefs: [baselineObservation.semanticFingerprint],
      observationRefs: [baselineObservation.observationId],
      missingBuckets: []
    };
    var postReleaseWindow = {
      contractVersion: "completed-bar-window/v1",
      role: "post-release-reaction",
      sessionKind: first.sessionKind,
      startBucket: startBucket,
      endBucketInclusive: endBucketInclusive,
      startAt: startAt,
      endAt: endAt,
      expectedBucketCount: expectedBucketCount,
      observationSemanticRefs: included.map(function (row) { return row.semanticFingerprint; }),
      observationRefs: included.map(function (row) { return row.observationId; }),
      missingBuckets: missingBuckets
    };
    var sourceRefs = [baselineObservation.sourceRef].concat(included.map(function (row) { return row.sourceRef; }));
    sourceRefs = Array.from(new Set(sourceRefs)).sort();
    var segment = {
      contractVersion: "reaction-segment/v1",
      segmentId: null,
      semanticFingerprint: null,
      occurrenceFingerprint: null,
      segmentOrdinal: segmentOrdinal,
      releaseIdentity: report.releaseIdentity,
      symbol: first.symbol,
      providerSymbol: first.providerSymbol,
      tradingDate: first.tradingDate,
      calendarFingerprint: first.calendarFingerprint,
      sessionKind: first.sessionKind,
      sessionStart: first.sessionStart,
      sessionEnd: first.sessionEnd,
      comparisonBoundarySignature: first.comparisonBoundarySignature,
      interval: first.interval,
      preReleaseWindow: preReleaseWindow,
      postReleaseWindow: postReleaseWindow,
      comparisonWindow: {
        contractVersion: "comparison-window/v1",
        sessionKind: first.sessionKind,
        startBucket: startBucket,
        endBucketInclusive: endBucketInclusive
      },
      startBucket: startBucket,
      endBucketInclusive: endBucketInclusive,
      startAt: startAt,
      endAt: endAt,
      cutoffAt: cutoffAt,
      sourceId: first.sourceId,
      adapterVersion: first.adapterVersion,
      priceBasis: first.priceBasis,
      adjustmentState: first.adjustmentState,
      state: state,
      expectedBucketCount: expectedBucketCount,
      priceBarCount: included.length,
      volumeBarCount: volumeRows.length,
      missingBuckets: missingBuckets,
      latest: included[included.length - 1].close,
      high: Math.max.apply(null, included.map(function (row) { return row.high; })),
      low: Math.min.apply(null, included.map(function (row) { return row.low; })),
      cumulativeObservedVolume: cumulativeVolume,
      volumeCompleteness: volumeCompleteness,
      observationSemanticRefs: included.map(function (row) { return row.semanticFingerprint; }),
      observationRefs: included.map(function (row) { return row.observationId; }),
      sourceRefs: sourceRefs,
      reasonCodes: reasonCodes
    };
    segment.semanticFingerprint = contracts.semanticFingerprint("reaction-segment", reactionSegmentSemanticInput(segment));
    segment.occurrenceFingerprint = contracts.occurrenceFingerprint(
      "reaction-segment",
      reactionSegmentOccurrenceInput(segment)
    );
    segment.segmentId = segment.occurrenceFingerprint;
    return segment;
  }

  function joinEventMarketReaction(report, observations, cutoffAt, policy) {
    var policyResult = validateReactionPolicy(policy);
    if (!policyResult.ok) return policyResult;
    var reportResult = validateReleasedReportEvidence(report);
    if (!reportResult.ok) return reportResult;
    if (!Array.isArray(observations)) return failure("B002-REACTION", "reaction-observations-required", "observations");
    var cutoff = canonicalTimestampResult(cutoffAt, "cutoffAt");
    if (!cutoff.ok) return failure("B002-TIMESTAMP", cutoff.reason, cutoff.field);
    if (Date.parse(report.cutoffAt) > cutoff.epoch) {
      return failure("B002-TIMESTAMP", "report-after-reaction-cutoff", "report.cutoffAt");
    }
    if (report.state !== "released" && report.state !== "revised") {
      return failure("B002-REACTION", "report-not-released", "report.state");
    }
    var releaseEpoch = Date.parse(report.releasedAt);
    var valid = [];
    for (var index = 0; index < observations.length; index += 1) {
      var validation = validateSessionObservation(observations[index]);
      if (!validation.ok) return validation;
      if (observations[index].cutoffAt !== cutoff.value) {
        return failure("B002-TIMESTAMP", "reaction-observation-cutoff-mismatch", "observations");
      }
      valid.push(observations[index]);
    }
    valid.sort(function (left, right) { return Date.parse(left.barStart) - Date.parse(right.barStart); });
    if (valid.length > 0 && valid.some(function (observation) {
      return observation.symbol !== valid[0].symbol || observation.tradingDate !== valid[0].tradingDate ||
        observation.sourceId !== valid[0].sourceId || observation.adapterVersion !== valid[0].adapterVersion ||
        observation.providerSymbol !== valid[0].providerSymbol || observation.priceBasis !== valid[0].priceBasis ||
        observation.calendarFingerprint !== valid[0].calendarFingerprint;
    })) {
      return failure("B002-REACTION", "reaction-semantics-misaligned", "observations");
    }
    for (index = 1; index < valid.length; index += 1) {
      if (valid[index].observationId === valid[index - 1].observationId ||
          Date.parse(valid[index].barStart) < Date.parse(valid[index - 1].barEnd)) {
        return failure("B002-REACTION", "reaction-observation-order-invalid", "observations");
      }
    }
    var baselineCandidates = valid.filter(function (observation) { return Date.parse(observation.barEnd) <= releaseEpoch; });
    var baselineObservation = baselineCandidates.length ? baselineCandidates[baselineCandidates.length - 1] : null;
    var post = valid.filter(function (observation) {
      return Date.parse(observation.barStart) > releaseEpoch && Date.parse(observation.barEnd) <= cutoff.epoch;
    });
    var reasonCodes = [];
    if (valid.some(function (observation) {
      var start = Date.parse(observation.barStart);
      var end = Date.parse(observation.barEnd);
      return start <= releaseEpoch && end > releaseEpoch;
    })) reasonCodes.push("release-straddling-bar-excluded");
    if (valid.some(function (observation) { return Date.parse(observation.barEnd) > cutoff.epoch; })) reasonCodes.push("post-cutoff-bar-excluded");
    if (!baselineObservation) reasonCodes.push("pre-release-baseline-unavailable");
    if (post.length === 0) reasonCodes.push("post-release-bars-unavailable");
    var adjustmentDisputed = valid.some(function (observation) { return observation.adjustmentState === "disputed"; });
    var adjustmentDiscontinuous = valid.some(function (observation) { return observation.adjustmentState === "corporate-action-discontinuity"; });
    var sourceStale = valid.some(function (observation) { return observation.freshnessState === "stale"; });
    if (adjustmentDisputed) reasonCodes.push("adjustment-disputed");
    else if (adjustmentDiscontinuous) reasonCodes.push("adjustment-incompatible");
    if (sourceStale) reasonCodes.push("source-stale");
    var segmentMap = Object.create(null);
    post.forEach(function (observation) {
      if (!segmentMap[observation.sessionKind]) segmentMap[observation.sessionKind] = [];
      segmentMap[observation.sessionKind].push(observation);
    });
    var segmentGroups = [];
    if (baselineObservation && !adjustmentDisputed && !adjustmentDiscontinuous) {
      policy.segmentOrder.forEach(function (sessionKind) {
        var rows = segmentMap[sessionKind];
        if (rows && rows.length > 0) segmentGroups.push(rows);
      });
      segmentGroups.sort(function (left, right) {
        var byStart = Date.parse(left[0].barStart) - Date.parse(right[0].barStart);
        return byStart || policy.segmentOrder.indexOf(left[0].sessionKind) - policy.segmentOrder.indexOf(right[0].sessionKind);
      });
    }
    var segments = segmentGroups.map(function (rows, segmentOrdinal) {
      return buildReactionSegment(rows, baselineObservation, report, cutoff.value, segmentOrdinal);
    }).filter(function (segment) { return segment !== null; });
    segments.forEach(function (segment) {
      reasonCodes = reasonCodes.concat(segment.reasonCodes);
    });
    reasonCodes = Array.from(new Set(reasonCodes)).sort();
    var latestObservation = post.length ? post[post.length - 1] : null;
    var baseline = baselineObservation ? {
      barStart: baselineObservation.barStart,
      barEnd: baselineObservation.barEnd,
      value: baselineObservation.close,
      sessionKind: baselineObservation.sessionKind,
      priceBasis: baselineObservation.priceBasis,
      sourceRef: baselineObservation.sourceRef,
      observationRef: baselineObservation.observationId
    } : null;
    var state = baseline && segments.length > 0 ?
      (segments.every(function (segment) { return segment.state === "available"; }) ? "complete" :
        (segments.some(function (segment) { return segment.state === "stale"; }) ? "stale" : "partial")) : "unavailable";
    if (adjustmentDisputed) state = "disputed";
    else if (adjustmentDiscontinuous) state = "unavailable";
    var resolvedMovement = state !== "disputed" && state !== "unavailable";
    var sourceRefs = Array.from(new Set(valid.map(function (observation) { return observation.sourceRef; }))).sort();
    var reportRef = referenceFor(
      "released-report-evidence",
      report,
      report.cutoffAt,
      "briefs/objects/evidence",
      "reports/" + encodeURIComponent(report.reportId),
      report.state,
      report.sourceRecords.map(function (entry) { return entry.sourceRef; })
    );
    var semanticInput = {
      contractVersion: "event-market-reaction-semantic/v1",
      baseline: baseline,
      observationRefs: segments.reduce(function (refs, segment) {
        return refs.concat(segment.observationSemanticRefs);
      }, []),
      releaseIdentity: report.releaseIdentity,
      reportEvidenceRef: reportRef.fingerprint,
      segmentSemanticRefs: segments.map(function (segment) { return segment.semanticFingerprint; }),
      state: state,
      reasonCodes: reasonCodes,
      symbol: latestObservation ? latestObservation.symbol : (baselineObservation ? baselineObservation.symbol : null)
    };
    var semanticFingerprint = contracts.semanticFingerprint("event-market-reaction", semanticInput);
    var occurrenceFingerprint = contracts.occurrenceFingerprint("event-market-reaction", {
      contractVersion: "event-market-reaction-occurrence/v1",
      cutoffAt: cutoff.value,
      observationRefs: post.map(function (observation) { return observation.observationId; }),
      segmentRefs: segments.map(function (segment) { return segment.occurrenceFingerprint; }),
      sourceRefs: sourceRefs,
      semanticFingerprint: semanticFingerprint
    });
    var reaction = {
      contractVersion: "event-market-reaction/v1",
      reactionId: occurrenceFingerprint,
      semanticFingerprint: semanticFingerprint,
      occurrenceFingerprint: occurrenceFingerprint,
      reportEvidenceRef: reportRef,
      releaseIdentity: report.releaseIdentity,
      symbol: latestObservation ? latestObservation.symbol : (baselineObservation ? baselineObservation.symbol : null),
      cutoffAt: cutoff.value,
      state: state,
      preReleaseBaseline: baseline,
      segments: segments,
      latest: latestObservation && resolvedMovement ? latestObservation.close : null,
      returnFromBaseline: latestObservation && baseline && resolvedMovement ? latestObservation.close / baseline.value - 1 : null,
      highExcursion: latestObservation && baseline && resolvedMovement ? Math.max.apply(null, post.map(function (row) { return row.high; })) / baseline.value - 1 : null,
      lowExcursion: latestObservation && baseline && resolvedMovement ? Math.min.apply(null, post.map(function (row) { return row.low; })) / baseline.value - 1 : null,
      volumeBaselineRefs: [],
      observationRefs: post.map(function (observation) { return observation.observationId; }),
      sourceRefs: sourceRefs,
      reasonCodes: reasonCodes
    };
    var reactionValidation = validateEventMarketReaction(reaction);
    return reactionValidation.ok ? success(reaction) : reactionValidation;
  }

  function validateEventMarketReaction(value) {
    if (!isPlainObject(value)) return failure("B002-REACTION", "event-reaction-required", "reaction");
    var unknown = hasOnlyFields(value, REACTION_FIELDS);
    if (unknown) return failure("B002-REACTION", "event-reaction-unknown-field", unknown);
    if (value.contractVersion !== "event-market-reaction/v1" || !HASH_PATTERN.test(value.reactionId || "") ||
        !HASH_PATTERN.test(value.semanticFingerprint || "") || !HASH_PATTERN.test(value.occurrenceFingerprint || "") ||
      !HASH_PATTERN.test(value.releaseIdentity || "") || typeof value.symbol !== "string" || !value.symbol ||
        ["partial", "complete", "stale", "unavailable", "disputed"].indexOf(value.state) === -1 ||
        !Array.isArray(value.segments) || !Array.isArray(value.observationRefs) || !Array.isArray(value.sourceRefs) ||
        !Array.isArray(value.volumeBaselineRefs) || !Array.isArray(value.reasonCodes)) {
      return failure("B002-REACTION", "event-reaction-contract-invalid", "reaction");
    }
    var cutoff = canonicalTimestampResult(value.cutoffAt, "cutoffAt");
    if (!cutoff.ok) return failure("B002-TIMESTAMP", cutoff.reason, cutoff.field);
    var refResult = contracts.validateEvidenceReference(value.reportEvidenceRef, { evidenceRoot: "briefs/objects/evidence" });
    if (!refResult.ok) return failure("B002-REACTION", "report-evidence-ref-invalid", "reportEvidenceRef");
    if (Date.parse(value.reportEvidenceRef.cutoffAt) > cutoff.epoch) {
      return failure("B002-TIMESTAMP", "report-after-reaction-cutoff", "reportEvidenceRef.cutoffAt");
    }
    if (value.observationRefs.some(function (ref) { return !HASH_PATTERN.test(ref); }) ||
        value.sourceRefs.some(function (ref) { return !HASH_PATTERN.test(ref); }) ||
        value.volumeBaselineRefs.some(function (ref) { return !HASH_PATTERN.test(ref); }) ||
        value.reasonCodes.some(function (reason) { return typeof reason !== "string" || !reason; }) ||
        new Set(value.observationRefs).size !== value.observationRefs.length ||
        new Set(value.sourceRefs).size !== value.sourceRefs.length ||
        new Set(value.reasonCodes).size !== value.reasonCodes.length ||
        !sameCanonical(value.sourceRefs, value.sourceRefs.slice().sort(), "reaction-source-refs/v1") ||
        !sameCanonical(value.reasonCodes, value.reasonCodes.slice().sort(), "reaction-reason-codes/v1")) {
      return failure("B002-REACTION", "event-reaction-lineage-invalid", "reaction");
    }
    var previousEnd = null;
    for (var segmentIndex = 0; segmentIndex < value.segments.length; segmentIndex += 1) {
      var segment = value.segments[segmentIndex];
      var segmentResult = validateReactionSegment(segment);
      if (!segmentResult.ok) return segmentResult;
      var segmentStart = Date.parse(segment.startAt);
      var segmentEnd = Date.parse(segment.endAt);
      if (segment.segmentOrdinal !== segmentIndex || segment.releaseIdentity !== value.releaseIdentity ||
          segment.symbol !== value.symbol || segment.cutoffAt !== value.cutoffAt ||
          segment.sourceRefs.some(function (ref) { return value.sourceRefs.indexOf(ref) === -1; }) ||
          (previousEnd !== null && segmentStart < previousEnd)) {
        return failure("B002-REACTION", "reaction-segment-parent-mismatch", "segments");
      }
      previousEnd = segmentEnd;
    }
    var flattenedObservationRefs = value.segments.reduce(function (refs, segment) {
      return refs.concat(segment.observationRefs);
    }, []);
    if (value.segments.length > 0 &&
        !sameCanonical(flattenedObservationRefs, value.observationRefs, "reaction-observation-refs/v1")) {
      return failure("B002-REACTION", "reaction-observation-cross-link-invalid", "observationRefs");
    }
    if (value.preReleaseBaseline !== null) {
      var unknownBaselineField = hasOnlyFields(value.preReleaseBaseline, [
        "barEnd", "barStart", "observationRef", "priceBasis", "sessionKind", "sourceRef", "value"
      ]);
      var baselineStart = canonicalTimestampResult(value.preReleaseBaseline.barStart, "preReleaseBaseline.barStart");
      var baselineEnd = canonicalTimestampResult(value.preReleaseBaseline.barEnd, "preReleaseBaseline.barEnd");
      if (unknownBaselineField || !baselineStart.ok || !baselineEnd.ok || baselineStart.epoch >= baselineEnd.epoch ||
          !finiteNumber(value.preReleaseBaseline.value) || value.preReleaseBaseline.value <= 0 ||
          !SESSION_KINDS[value.preReleaseBaseline.sessionKind] ||
          value.preReleaseBaseline.priceBasis !== "provider-chart-basis" ||
          !HASH_PATTERN.test(value.preReleaseBaseline.sourceRef || "") ||
          !HASH_PATTERN.test(value.preReleaseBaseline.observationRef || "")) {
        return failure("B002-REACTION", "pre-release-baseline-invalid", "preReleaseBaseline");
      }
    }
    if (value.segments.length > 0 && value.preReleaseBaseline === null) {
      return failure("B002-REACTION", "reaction-segment-parent-mismatch", "preReleaseBaseline");
    }
    for (var preLinkIndex = 0; preLinkIndex < value.segments.length; preLinkIndex += 1) {
      var preWindow = value.segments[preLinkIndex].preReleaseWindow;
      if (preWindow.startAt !== value.preReleaseBaseline.barStart ||
          preWindow.endAt !== value.preReleaseBaseline.barEnd ||
          preWindow.sessionKind !== value.preReleaseBaseline.sessionKind ||
          preWindow.observationRefs[0] !== value.preReleaseBaseline.observationRef ||
          value.segments[preLinkIndex].sourceRefs.indexOf(value.preReleaseBaseline.sourceRef) === -1) {
        return failure("B002-REACTION", "reaction-segment-parent-mismatch", "segments.preReleaseWindow");
      }
    }
    if (["latest", "returnFromBaseline", "highExcursion", "lowExcursion"].some(function (field) {
      return value[field] !== null && !finiteNumber(value[field]);
    }) || ((value.state === "unavailable" || value.state === "disputed") &&
      ["latest", "returnFromBaseline", "highExcursion", "lowExcursion"].some(function (field) { return value[field] !== null; }))) {
      return failure("B002-REACTION", "event-reaction-state-invalid", "reaction");
    }
    var semanticInput = {
      contractVersion: "event-market-reaction-semantic/v1",
      baseline: value.preReleaseBaseline,
      observationRefs: value.segments.reduce(function (refs, segment) {
        return refs.concat(segment.observationSemanticRefs);
      }, []),
      releaseIdentity: value.releaseIdentity,
      reportEvidenceRef: value.reportEvidenceRef.fingerprint,
      segmentSemanticRefs: value.segments.map(function (segment) { return segment.semanticFingerprint; }),
      state: value.state,
      reasonCodes: value.reasonCodes,
      symbol: value.symbol
    };
    if (contracts.semanticFingerprint("event-market-reaction", semanticInput) !== value.semanticFingerprint) {
      return failure("B002-REACTION", "event-reaction-semantic-identity-mismatch", "semanticFingerprint");
    }
    var expectedOccurrence = contracts.occurrenceFingerprint("event-market-reaction", {
      contractVersion: "event-market-reaction-occurrence/v1",
      cutoffAt: value.cutoffAt,
      observationRefs: value.observationRefs,
      segmentRefs: value.segments.map(function (segment) { return segment.occurrenceFingerprint; }),
      sourceRefs: value.sourceRefs,
      semanticFingerprint: value.semanticFingerprint
    });
    if (value.reactionId !== value.occurrenceFingerprint || expectedOccurrence !== value.occurrenceFingerprint) {
      return failure("B002-REACTION", "event-reaction-identity-mismatch", "reactionId");
    }
    return success(value);
  }

  function validateBundlePolicy(policy) {
    if (!isPlainObject(policy)) return failure("B002-INPUT-REJECTED", "bundle-policy-required", "policy");
    var unknown = hasOnlyFields(policy, ["contractVersion", "evidenceRoot", "requiredBenchmarkSymbol", "requiredCalendar", "requiredDueReportStates"]);
    if (unknown) return failure("B002-INPUT-REJECTED", "bundle-policy-unknown-field", "policy." + unknown);
    if (policy.contractVersion !== "market-session-evidence-policy/v1" || policy.requiredCalendar !== true ||
        typeof policy.requiredBenchmarkSymbol !== "string" || !policy.requiredBenchmarkSymbol ||
        typeof policy.evidenceRoot !== "string" || policy.evidenceRoot.charAt(0) === "/" ||
        policy.evidenceRoot.indexOf("..") !== -1 || !Array.isArray(policy.requiredDueReportStates) ||
        policy.requiredDueReportStates.join(",") !== "upcoming,released,revised") {
      return failure("B002-INPUT-REJECTED", "bundle-policy-invalid", "policy");
    }
    return { ok: true };
  }

  function strongestState(states) {
    var strongest = "available";
    states.forEach(function (state) {
      if (STATE_PRECEDENCE[state] !== undefined && STATE_PRECEDENCE[state] > STATE_PRECEDENCE[strongest]) strongest = state;
    });
    return strongest;
  }

  function baselineEvidenceState(state) {
    if (state === "qualified") return "available";
    if (state === "thin") return "partial";
    return "unavailable";
  }

  function sameCanonical(left, right, contractVersion) {
    try {
      return contracts.canonicalize(left, contractVersion) === contracts.canonicalize(right, contractVersion);
    } catch (error) {
      return false;
    }
  }

  function validateRequiredCalendarInput(value) {
    if (!isPlainObject(value) || hasOnlyFields(value, ["required", "state"]) ||
        value.required !== true || value.state !== "available") {
      return failure("B002-CALENDAR", "required-calendar-unavailable", "requiredEvidence.calendar");
    }
    return { ok: true };
  }

  function validateDueReportInputs(value, reports, policy) {
    if (!Array.isArray(value)) {
      return failure("B002-REPORT-REQUIRED", "due-report-results-required", "requiredEvidence.dueReports");
    }
    var seen = Object.create(null);
    for (var index = 0; index < value.length; index += 1) {
      var dueReport = value[index];
      if (!isPlainObject(dueReport) || hasOnlyFields(dueReport, ["reportId", "required", "state"]) ||
          dueReport.required !== true || typeof dueReport.reportId !== "string" || !dueReport.reportId ||
          policy.requiredDueReportStates.indexOf(dueReport.state) === -1 || seen[dueReport.reportId]) {
        return failure("B002-REPORT-REQUIRED", "required-report-unavailable", "requiredEvidence.dueReports");
      }
      if (!reports.some(function (report) {
        return report.reportId === dueReport.reportId && report.state === dueReport.state;
      })) {
        return failure("B002-REPORT-REQUIRED", "required-report-evidence-missing", "requiredEvidence.dueReports");
      }
      seen[dueReport.reportId] = true;
    }
    return { ok: true };
  }

  function validateClosedBenchmarkInput(value, symbol) {
    if (!isPlainObject(value) || hasOnlyFields(value, REQUIRED_BENCHMARK_FIELDS) ||
        value.required !== false || value.presence !== "not-applicable" || value.symbol !== symbol ||
        value.state !== "not-applicable" || value.aggregateRef !== null ||
        value.officialCloseAnchorState !== "not-applicable" || value.baselineRef !== null ||
        !Array.isArray(value.reasonCodes) || value.reasonCodes.length !== 1 || value.reasonCodes[0] !== "calendar-closed") {
      return failure("B002-INPUT-REJECTED", "closed-date-benchmark-absence-invalid", "requiredEvidence.benchmark");
    }
    return { ok: true };
  }

  function validateClosedDateProof(proof, calendarSession, cutoffAt) {
    if (!isPlainObject(proof) || hasOnlyFields(proof, ["nextOpenCalendarSession", "priorOfficialCloseAnchor"])) {
      return failure("B002-CALENDAR", "closed-date-proof-required", "closedDateProof");
    }
    var nextOpenResult = validateCalendarSession(proof.nextOpenCalendarSession);
    if (!nextOpenResult.ok) return nextOpenResult;
    var nextOpen = proof.nextOpenCalendarSession;
    if ((calendarSession.dateState !== "holiday" && calendarSession.dateState !== "weekend") ||
        calendarSession.preMarket !== null || calendarSession.regular !== null || calendarSession.afterHours !== null ||
        calendarSession.officialRegularCloseAt !== null ||
        (nextOpen.dateState !== "regular" && nextOpen.dateState !== "early-close") ||
        nextOpen.tradingDate !== calendarSession.nextOpenTradingDate ||
        nextOpen.calendarId !== calendarSession.calendarId ||
        nextOpen.calendarVersion !== calendarSession.calendarVersion ||
        nextOpen.timeZone !== calendarSession.timeZone ||
        nextOpen.timeZoneVersion !== calendarSession.timeZoneVersion ||
        nextOpen.sourceRef !== calendarSession.sourceRef) {
      return failure("B002-CALENDAR", "closed-date-calendar-proof-mismatch", "closedDateProof.nextOpenCalendarSession");
    }
    var anchorResult = validateOfficialAnchor(proof.priorOfficialCloseAnchor);
    if (!anchorResult.ok || proof.priorOfficialCloseAnchor === null ||
        proof.priorOfficialCloseAnchor.adjustmentState !== "compatible" ||
        proof.priorOfficialCloseAnchor.tradingDate >= calendarSession.tradingDate ||
        Date.parse(proof.priorOfficialCloseAnchor.at) >= Date.parse(cutoffAt)) {
      return failure("B002-INPUT-REJECTED", "closed-date-prior-anchor-invalid", "closedDateProof.priorOfficialCloseAnchor");
    }
    var anchorWall;
    try {
      anchorWall = localWallAt(Date.parse(proof.priorOfficialCloseAnchor.at), calendarSession.timeZone);
    } catch (error) {
      return failure("B002-INPUT-REJECTED", "closed-date-prior-anchor-invalid", "closedDateProof.priorOfficialCloseAnchor");
    }
    if (anchorWall.slice(0, 10) !== proof.priorOfficialCloseAnchor.tradingDate ||
        ["13:00", "16:00"].indexOf(anchorWall.slice(11, 16)) === -1) {
      return failure("B002-INPUT-REJECTED", "closed-date-prior-anchor-invalid", "closedDateProof.priorOfficialCloseAnchor");
    }
    return { ok: true };
  }

  function requiredEvidenceInputResult(input, calendarSession, cutoffAt) {
    if (!isPlainObject(input.requiredEvidence) ||
        hasOnlyFields(input.requiredEvidence, ["benchmark", "calendar", "dueReports"])) {
      return failure("B002-INPUT-REJECTED", "required-evidence-input-invalid", "requiredEvidence");
    }
    var calendarInputResult = validateRequiredCalendarInput(input.requiredEvidence.calendar);
    if (!calendarInputResult.ok) return calendarInputResult;
    var dueReportResult = validateDueReportInputs(input.requiredEvidence.dueReports, input.reports, input.policy);
    if (!dueReportResult.ok) return dueReportResult;
    var closed = calendarSession.dateState === "holiday" || calendarSession.dateState === "weekend";
    if (closed) {
      var closedBenchmarkResult = validateClosedBenchmarkInput(input.requiredEvidence.benchmark, input.policy.requiredBenchmarkSymbol);
      if (!closedBenchmarkResult.ok) return closedBenchmarkResult;
      return validateClosedDateProof(input.closedDateProof, calendarSession, cutoffAt);
    }
    if (input.closedDateProof !== null) {
      return failure("B002-INPUT-REJECTED", "open-date-closed-proof-invalid", "closedDateProof");
    }
    var benchmark = input.requiredEvidence.benchmark;
    if (!isPlainObject(benchmark) || hasOnlyFields(benchmark, ["officialCloseAnchorState", "required", "state", "symbol"]) ||
        benchmark.required !== true || benchmark.symbol !== input.policy.requiredBenchmarkSymbol ||
        ["available", "partial"].indexOf(benchmark.state) === -1 ||
        benchmark.officialCloseAnchorState !== "available") {
      return failure("B002-SESSION-REQUIRED", "required-benchmark-unavailable", "requiredEvidence.benchmark");
    }
    return { ok: true };
  }

  function validateRequiredEvidence(value, bundle, policy) {
    if (!isPlainObject(value) || hasOnlyFields(value, REQUIRED_EVIDENCE_FIELDS) ||
        value.contractVersion !== "required-evidence/v1" ||
        ["open-date", "closed-date"].indexOf(value.mode) === -1 ||
        !isPlainObject(value.calendar) || hasOnlyFields(value.calendar, REQUIRED_CALENDAR_FIELDS) ||
        value.calendar.required !== true || value.calendar.state !== "available" ||
        !DATE_PATTERN.test(value.calendar.tradingDate || "") || !DATE_STATES[value.calendar.dateState] ||
        !sameCanonical(value.calendar.calendarSessionRef, bundle.calendarSessionRef, "evidence-reference/v1") ||
        !Array.isArray(value.dueReports)) {
      return failure("B002-INPUT-REJECTED", "required-evidence-contract-invalid", "requiredEvidence");
    }
    var dueReportIds = Object.create(null);
    for (var dueIndex = 0; dueIndex < value.dueReports.length; dueIndex += 1) {
      var due = value.dueReports[dueIndex];
      if (!isPlainObject(due) || hasOnlyFields(due, ["reportId", "required", "state"]) ||
          due.required !== true || typeof due.reportId !== "string" || !due.reportId ||
          policy.requiredDueReportStates.indexOf(due.state) === -1 || dueReportIds[due.reportId]) {
        return failure("B002-REPORT-REQUIRED", "required-report-unavailable", "requiredEvidence.dueReports");
      }
      dueReportIds[due.reportId] = true;
    }
    if (!isPlainObject(value.benchmark) || hasOnlyFields(value.benchmark, REQUIRED_BENCHMARK_FIELDS) ||
        value.benchmark.symbol !== policy.requiredBenchmarkSymbol || !Array.isArray(value.benchmark.reasonCodes)) {
      return failure("B002-INPUT-REJECTED", "required-benchmark-contract-invalid", "requiredEvidence.benchmark");
    }
    if (value.mode === "closed-date") {
      if (value.calendar.dateState !== "holiday" && value.calendar.dateState !== "weekend") {
        return failure("B002-CALENDAR", "closed-date-calendar-state-invalid", "requiredEvidence.calendar.dateState");
      }
      if (value.benchmark.required !== false || value.benchmark.presence !== "not-applicable" ||
          value.benchmark.state !== "not-applicable" || value.benchmark.aggregateRef !== null ||
          value.benchmark.officialCloseAnchorState !== "not-applicable" || value.benchmark.baselineRef !== null ||
          value.benchmark.reasonCodes.length !== 1 || value.benchmark.reasonCodes[0] !== "calendar-closed" ||
          bundle.sessionAggregateRefs.length !== 0 || bundle.volumeBaselineRefs.length !== 0 ||
          !isPlainObject(value.closedDate) || hasOnlyFields(value.closedDate, REQUIRED_CLOSED_DATE_FIELDS)) {
        return failure("B002-INPUT-REJECTED", "closed-date-required-evidence-invalid", "requiredEvidence");
      }
      var closedDate = value.closedDate;
      if (closedDate.required !== true || closedDate.state !== "available" ||
          !sameCanonical(closedDate.closureCalendarSessionRef, bundle.calendarSessionRef, "evidence-reference/v1") ||
          !DATE_PATTERN.test(closedDate.nextOpenTradingDate || "") ||
          closedDate.nextOpenTradingDate <= value.calendar.tradingDate ||
          closedDate.liveAggregatePresence !== "not-applicable" ||
          closedDate.liveBaselinePresence !== "not-applicable" ||
          !Array.isArray(closedDate.reasonCodes) || closedDate.reasonCodes.length !== 1 ||
          closedDate.reasonCodes[0] !== "calendar-closed") {
        return failure("B002-INPUT-REJECTED", "closed-date-required-evidence-invalid", "requiredEvidence.closedDate");
      }
      var nextOpenRefResult = contracts.validateEvidenceReference(closedDate.nextOpenCalendarSessionRef, { evidenceRoot: policy.evidenceRoot });
      if (!nextOpenRefResult.ok || closedDate.nextOpenCalendarSessionRef.evidenceType !== "calendar-session" ||
          closedDate.nextOpenCalendarSessionRef.state !== "available" ||
          closedDate.nextOpenCalendarSessionRef.cutoffAt !== bundle.cutoffAt) {
        return failure("B002-CALENDAR", "next-open-calendar-reference-invalid", "requiredEvidence.closedDate.nextOpenCalendarSessionRef");
      }
      var priorAnchorResult = validateOfficialAnchor(closedDate.priorOfficialCloseAnchor);
      if (!priorAnchorResult.ok || closedDate.priorOfficialCloseAnchor === null ||
          closedDate.priorOfficialCloseAnchor.adjustmentState !== "compatible" ||
          closedDate.priorOfficialCloseAnchor.tradingDate >= value.calendar.tradingDate ||
          Date.parse(closedDate.priorOfficialCloseAnchor.at) >= Date.parse(bundle.cutoffAt) ||
          bundle.sourceRefs.indexOf(closedDate.priorOfficialCloseAnchor.sourceRef) === -1 ||
          closedDate.nextOpenCalendarSessionRef.provenanceRefs.some(function (ref) {
            return bundle.sourceRefs.indexOf(ref) === -1;
          })) {
        return failure("B002-INPUT-REJECTED", "closed-date-prior-anchor-invalid", "requiredEvidence.closedDate.priorOfficialCloseAnchor");
      }
      if (bundle.state !== "available" || bundle.reasonCodes.indexOf("calendar-closed") === -1) {
        return failure("B002-INPUT-REJECTED", "closed-date-bundle-state-invalid", "bundle.state");
      }
      return { ok: true };
    }
    if (value.closedDate !== null || (value.calendar.dateState !== "regular" && value.calendar.dateState !== "early-close") ||
        value.benchmark.required !== true || value.benchmark.presence !== "present" ||
        ["available", "partial"].indexOf(value.benchmark.state) === -1 ||
        value.benchmark.officialCloseAnchorState !== "available" ||
        !isPlainObject(value.benchmark.aggregateRef)) {
      return failure("B002-INPUT-REJECTED", "open-date-required-evidence-invalid", "requiredEvidence");
    }
    var aggregateMatch = bundle.sessionAggregateRefs.some(function (ref) {
      return sameCanonical(ref, value.benchmark.aggregateRef, "evidence-reference/v1");
    });
    var baselineMatch = value.benchmark.baselineRef === null || bundle.volumeBaselineRefs.some(function (ref) {
      return sameCanonical(ref, value.benchmark.baselineRef, "evidence-reference/v1");
    });
    if (!aggregateMatch || !baselineMatch || (value.benchmark.baselineRef === null && value.benchmark.reasonCodes.length === 0)) {
      return failure("B002-INPUT-REJECTED", "open-date-required-evidence-cross-ref-invalid", "requiredEvidence.benchmark");
    }
    return { ok: true };
  }

  function buildMarketSessionEvidence(input) {
    if (!isPlainObject(input) || input.contractVersion !== "market-session-evidence-input/v1") {
      return failure("B002-INPUT-REJECTED", "bundle-input-invalid", "input");
    }
    var unknownInputField = hasOnlyFields(input, [
      "aggregates", "baselines", "calendarSession", "contractVersion", "cutoffAt",
      "closedDateProof", "policy", "reactions", "reports", "requiredEvidence", "runId"
    ]);
    if (unknownInputField) {
      return failure("B002-INPUT-REJECTED", "bundle-input-unknown-field", unknownInputField);
    }
    var policyResult = validateBundlePolicy(input.policy);
    if (!policyResult.ok) return policyResult;
    var cutoff = canonicalTimestampResult(input.cutoffAt, "cutoffAt");
    if (!cutoff.ok) return failure("B002-TIMESTAMP", cutoff.reason, cutoff.field);
    if (typeof input.runId !== "string" || !input.runId || !Array.isArray(input.aggregates) ||
        !Array.isArray(input.baselines) || !Array.isArray(input.reports) || !Array.isArray(input.reactions) ||
        !isPlainObject(input.requiredEvidence) || !Object.prototype.hasOwnProperty.call(input, "closedDateProof")) {
      return failure("B002-INPUT-REJECTED", "bundle-input-shape-invalid", "input");
    }
    var calendarResult = validateCalendarSession(input.calendarSession);
    if (!calendarResult.ok) return calendarResult;
    var index;
    for (index = 0; index < input.aggregates.length; index += 1) {
      var aggregateResult = validateSessionAggregate(input.aggregates[index]);
      if (!aggregateResult.ok) return aggregateResult;
      if (input.aggregates[index].cutoffAt !== cutoff.value) return failure("B002-TIMESTAMP", "aggregate-cutoff-mismatch", "aggregates");
    }
    for (index = 0; index < input.baselines.length; index += 1) {
      var baselineResult = validateComparableVolumeBaseline(input.baselines[index]);
      if (!baselineResult.ok) return baselineResult;
      if (!input.aggregates.some(function (aggregate) {
        return aggregate.semanticFingerprint === input.baselines[index].currentAggregateRef;
      }) && !input.reactions.some(function (reaction) {
        return isPlainObject(reaction) && Array.isArray(reaction.segments) && reaction.segments.some(function (segment) {
          return segment.semanticFingerprint === input.baselines[index].currentAggregateRef;
        });
      })) {
        return failure("B002-COMPARABILITY", "baseline-current-aggregate-missing", "baselines");
      }
    }
    for (index = 0; index < input.reports.length; index += 1) {
      var reportResult = validateReleasedReportEvidence(input.reports[index]);
      if (!reportResult.ok) return reportResult;
      if (input.reports[index].cutoffAt !== cutoff.value) return failure("B002-TIMESTAMP", "report-cutoff-mismatch", "reports");
    }
    for (index = 0; index < input.reactions.length; index += 1) {
      var reactionResult = validateEventMarketReaction(input.reactions[index]);
      if (!reactionResult.ok) return reactionResult;
      if (input.reactions[index].cutoffAt !== cutoff.value) return failure("B002-TIMESTAMP", "reaction-cutoff-mismatch", "reactions");
    }
    var seenObservations = Object.create(null);
    for (index = 0; index < input.aggregates.length; index += 1) {
      var refs = input.aggregates[index].observationRefs || [];
      for (var refIndex = 0; refIndex < refs.length; refIndex += 1) {
        if (seenObservations[refs[refIndex]]) return failure("B002-TIMESTAMP", "observation-counted-in-multiple-aggregates", "aggregates");
        seenObservations[refs[refIndex]] = true;
      }
    }
    var requiredInputResult = requiredEvidenceInputResult(input, input.calendarSession, cutoff.value);
    if (!requiredInputResult.ok) return requiredInputResult;
    var closedDate = input.calendarSession.dateState === "holiday" || input.calendarSession.dateState === "weekend";
    var benchmarkAggregate = null;
    if (!closedDate) {
      benchmarkAggregate = input.aggregates.find(function (aggregate) {
        return aggregate.symbol === input.policy.requiredBenchmarkSymbol &&
          aggregate.tradingDate === input.calendarSession.tradingDate &&
          aggregate.state === input.requiredEvidence.benchmark.state &&
          aggregate.officialRegularCloseAnchor !== null;
      });
      if (!benchmarkAggregate) {
        return failure("B002-SESSION-REQUIRED", "required-benchmark-aggregate-missing", "requiredEvidence.benchmark");
      }
    } else if (input.aggregates.length !== 0 || input.baselines.length !== 0) {
      return failure("B002-INPUT-REJECTED", "closed-date-live-evidence-forbidden", "aggregates");
    }

    var sourceRefs = [input.calendarSession.sourceRef];
    if (closedDate) {
      sourceRefs.push(input.closedDateProof.nextOpenCalendarSession.sourceRef);
      sourceRefs.push(input.closedDateProof.priorOfficialCloseAnchor.sourceRef);
    }
    input.aggregates.forEach(function (aggregate) { sourceRefs = sourceRefs.concat(aggregate.sourceRefs || []); });
    input.reports.forEach(function (report) {
      sourceRefs = sourceRefs.concat(report.sourceRecords.map(function (record) { return record.sourceRef; }));
    });
    input.reactions.forEach(function (reaction) { sourceRefs = sourceRefs.concat(reaction.sourceRefs || []); });
    sourceRefs = Array.from(new Set(sourceRefs)).sort();
    var aggregateEntries = input.aggregates.slice().sort(function (left, right) {
      var leftKey = (left.symbol || "") + ":" + left.sessionKind;
      var rightKey = (right.symbol || "") + ":" + right.sessionKind;
      return leftKey < rightKey ? -1 : (leftKey > rightKey ? 1 : 0);
    });
    var baselineEntries = input.baselines.slice().sort(function (left, right) {
      return left.semanticFingerprint < right.semanticFingerprint ? -1 : 1;
    });
    var reportEntries = input.reports.slice().sort(function (left, right) {
      var leftKey = left.reportId + ":" + left.revisionNumber;
      var rightKey = right.reportId + ":" + right.revisionNumber;
      return leftKey < rightKey ? -1 : 1;
    });
    var reactionEntries = input.reactions.slice().sort(function (left, right) {
      var leftKey = left.releaseIdentity + ":" + left.symbol;
      var rightKey = right.releaseIdentity + ":" + right.symbol;
      return leftKey < rightKey ? -1 : 1;
    });
    var requiredReportIds = Object.create(null);
    input.requiredEvidence.dueReports.forEach(function (dueReport) { requiredReportIds[dueReport.reportId] = true; });
    var requiredReportFingerprints = Object.create(null);
    reportEntries.forEach(function (report) {
      if (requiredReportIds[report.reportId]) requiredReportFingerprints[report.semanticFingerprint] = true;
    });
    var states = [input.requiredEvidence.calendar.state, input.requiredEvidence.benchmark.state];
    input.requiredEvidence.dueReports.forEach(function (dueReport) {
      states.push(dueReport.state === "released" || dueReport.state === "revised" || dueReport.state === "upcoming" ? "available" : dueReport.state);
    });
    var state = strongestState(states);
    var calendarRef = referenceFor("calendar-session", input.calendarSession, cutoff.value, input.policy.evidenceRoot, "calendars", "available", [input.calendarSession.sourceRef]);
    var aggregateRefs = aggregateEntries.map(function (aggregate) {
      return referenceFor("session-aggregate", aggregate, cutoff.value, input.policy.evidenceRoot, "sessions/" + encodeURIComponent(aggregate.symbol || "unknown"), aggregate.state, aggregate.sourceRefs || []);
    });
    var baselineRefs = baselineEntries.map(function (baseline) {
      return referenceFor("comparable-volume-baseline", baseline, cutoff.value, input.policy.evidenceRoot, "baselines", baselineEvidenceState(baseline.state), []);
    });
    var reportRefs = reportEntries.map(function (report) {
      return referenceFor("released-report-evidence", report, cutoff.value, input.policy.evidenceRoot, "reports/" + encodeURIComponent(report.reportId), report.state, report.sourceRecords.map(function (record) { return record.sourceRef; }));
    });
    var reactionRefs = reactionEntries.map(function (reaction) {
      return referenceFor("event-market-reaction", reaction, cutoff.value, input.policy.evidenceRoot, "reactions/" + encodeURIComponent(reaction.releaseIdentity), reaction.state, reaction.sourceRefs);
    });
    var nextOpenRef = closedDate ? referenceFor(
      "calendar-session",
      input.closedDateProof.nextOpenCalendarSession,
      cutoff.value,
      input.policy.evidenceRoot,
      "calendars",
      "available",
      [input.closedDateProof.nextOpenCalendarSession.sourceRef]
    ) : null;
    var benchmarkAggregateRef = null;
    var benchmarkBaselineRef = null;
    var benchmarkReasonCodes = [];
    if (!closedDate) {
      benchmarkAggregateRef = aggregateRefs.find(function (ref) {
        return ref.fingerprint === benchmarkAggregate.semanticFingerprint;
      });
      var benchmarkBaselineIndex = baselineEntries.findIndex(function (baseline) {
        return baseline.currentAggregateRef === benchmarkAggregate.semanticFingerprint;
      });
      if (benchmarkBaselineIndex >= 0) {
        benchmarkBaselineRef = baselineRefs[benchmarkBaselineIndex];
        benchmarkReasonCodes = benchmarkReasonCodes.concat(baselineEntries[benchmarkBaselineIndex].reasonCodes || []);
      } else {
        benchmarkReasonCodes.push("baseline-not-provided");
      }
      benchmarkReasonCodes = benchmarkReasonCodes.concat(benchmarkAggregate.reasonCodes || []);
    }
    benchmarkReasonCodes = Array.from(new Set(benchmarkReasonCodes)).sort();
    var dueReports = input.requiredEvidence.dueReports.map(function (dueReport) {
      return { required: true, reportId: dueReport.reportId, state: dueReport.state };
    }).sort(function (left, right) {
      return left.reportId < right.reportId ? -1 : (left.reportId > right.reportId ? 1 : 0);
    });
    var requiredEvidence = {
      contractVersion: "required-evidence/v1",
      mode: closedDate ? "closed-date" : "open-date",
      calendar: {
        required: true,
        state: "available",
        tradingDate: input.calendarSession.tradingDate,
        dateState: input.calendarSession.dateState,
        calendarSessionRef: calendarRef
      },
      benchmark: closedDate ? {
        required: false,
        presence: "not-applicable",
        symbol: input.policy.requiredBenchmarkSymbol,
        state: "not-applicable",
        aggregateRef: null,
        officialCloseAnchorState: "not-applicable",
        baselineRef: null,
        reasonCodes: ["calendar-closed"]
      } : {
        required: true,
        presence: "present",
        symbol: input.policy.requiredBenchmarkSymbol,
        state: benchmarkAggregate.state,
        aggregateRef: benchmarkAggregateRef,
        officialCloseAnchorState: "available",
        baselineRef: benchmarkBaselineRef,
        reasonCodes: benchmarkReasonCodes
      },
      closedDate: closedDate ? {
        required: true,
        state: "available",
        closureCalendarSessionRef: calendarRef,
        priorOfficialCloseAnchor: Object.assign({}, input.closedDateProof.priorOfficialCloseAnchor),
        nextOpenCalendarSessionRef: nextOpenRef,
        nextOpenTradingDate: input.closedDateProof.nextOpenCalendarSession.tradingDate,
        liveAggregatePresence: "not-applicable",
        liveBaselinePresence: "not-applicable",
        reasonCodes: ["calendar-closed"]
      } : null,
      dueReports: dueReports
    };
    var reasonCodes = closedDate ? ["calendar-closed"] : benchmarkReasonCodes.slice();
    reportEntries.forEach(function (report) {
      if (requiredReportIds[report.reportId]) reasonCodes = reasonCodes.concat(report.reasonCodes || []);
    });
    reactionEntries.forEach(function (reaction) {
      if (reaction.reportEvidenceRef && requiredReportFingerprints[reaction.reportEvidenceRef.fingerprint]) {
        reasonCodes = reasonCodes.concat(reaction.reasonCodes || []);
      }
    });
    reasonCodes = Array.from(new Set(reasonCodes)).sort();
    var semanticInput = {
      contractVersion: "market-session-evidence-semantic/v1",
      calendarSessionRef: calendarRef.fingerprint,
      eventReactionRefs: reactionRefs.map(function (ref) { return ref.fingerprint; }),
      releasedReportRefs: reportRefs.map(function (ref) { return ref.fingerprint; }),
      policy: input.policy,
      requiredEvidence: requiredEvidence,
      sessionAggregateRefs: aggregateRefs.map(function (ref) { return ref.fingerprint; }),
      sourceRefs: sourceRefs,
      state: state,
      volumeBaselineRefs: baselineRefs.map(function (ref) { return ref.fingerprint; })
    };
    var semanticFingerprint = contracts.semanticFingerprint("market-session-evidence", semanticInput);
    var occurrenceFingerprint = contracts.occurrenceFingerprint("market-session-evidence", {
      contractVersion: "market-session-evidence-occurrence/v1",
      cutoffAt: cutoff.value,
      runId: input.runId,
      semanticFingerprint: semanticFingerprint
    });
    var bundle = {
      contractVersion: "market-session-evidence/v1",
      evidenceId: occurrenceFingerprint,
      runId: input.runId,
      cutoffAt: cutoff.value,
      calendarSessionRef: calendarRef,
      sessionAggregateRefs: aggregateRefs,
      volumeBaselineRefs: baselineRefs,
      releasedReportRefs: reportRefs,
      eventReactionRefs: reactionRefs,
      requiredEvidence: requiredEvidence,
      state: state,
      sourceRefs: sourceRefs,
      reasonCodes: reasonCodes,
      fingerprint: semanticFingerprint
    };
    var bundleValidation = validateMarketSessionEvidence(bundle, input.policy);
    return bundleValidation.ok ? success(bundle) : bundleValidation;
  }

  function validateMarketSessionEvidence(value, policy) {
    var policyResult = validateBundlePolicy(policy);
    if (!policyResult.ok) return policyResult;
    if (!isPlainObject(value)) return failure("B002-INPUT-REJECTED", "market-session-evidence-required", "bundle");
    var unknown = hasOnlyFields(value, BUNDLE_FIELDS);
    if (unknown) return failure("B002-INPUT-REJECTED", "market-session-evidence-unknown-field", unknown);
    if (value.contractVersion !== "market-session-evidence/v1" || !HASH_PATTERN.test(value.evidenceId || "") ||
        !HASH_PATTERN.test(value.fingerprint || "") || !EVIDENCE_STATES[value.state] ||
      typeof value.runId !== "string" || !value.runId ||
        !Array.isArray(value.sessionAggregateRefs) || !Array.isArray(value.volumeBaselineRefs) ||
        !Array.isArray(value.releasedReportRefs) || !Array.isArray(value.eventReactionRefs) ||
        !Array.isArray(value.sourceRefs) || !Array.isArray(value.reasonCodes)) {
      return failure("B002-INPUT-REJECTED", "market-session-evidence-contract-invalid", "bundle");
    }
    var cutoff = canonicalTimestampResult(value.cutoffAt, "cutoffAt");
    if (!cutoff.ok) return failure("B002-TIMESTAMP", cutoff.reason, cutoff.field);
    var refs = [value.calendarSessionRef].concat(value.sessionAggregateRefs, value.volumeBaselineRefs, value.releasedReportRefs, value.eventReactionRefs);
    for (var index = 0; index < refs.length; index += 1) {
      var refResult = contracts.validateEvidenceReference(refs[index], { evidenceRoot: policy.evidenceRoot });
      if (!refResult.ok) return failure("B002-INPUT-REJECTED", "bundle-evidence-ref-invalid", "references");
      if (refs[index].cutoffAt !== value.cutoffAt) return failure("B002-TIMESTAMP", "bundle-reference-cutoff-mismatch", "references");
    }
    if (value.sourceRefs.some(function (ref) { return !HASH_PATTERN.test(ref); }) ||
        value.reasonCodes.some(function (reason) { return typeof reason !== "string" || !reason; })) {
      return failure("B002-INPUT-REJECTED", "market-session-evidence-lineage-invalid", "bundle");
    }
    var requiredEvidenceResult = validateRequiredEvidence(value.requiredEvidence, value, policy);
    if (!requiredEvidenceResult.ok) return requiredEvidenceResult;
    var semanticInput = {
      contractVersion: "market-session-evidence-semantic/v1",
      calendarSessionRef: value.calendarSessionRef.fingerprint,
      eventReactionRefs: value.eventReactionRefs.map(function (ref) { return ref.fingerprint; }),
      releasedReportRefs: value.releasedReportRefs.map(function (ref) { return ref.fingerprint; }),
      policy: policy,
      requiredEvidence: value.requiredEvidence,
      sessionAggregateRefs: value.sessionAggregateRefs.map(function (ref) { return ref.fingerprint; }),
      sourceRefs: value.sourceRefs,
      state: value.state,
      volumeBaselineRefs: value.volumeBaselineRefs.map(function (ref) { return ref.fingerprint; })
    };
    if (contracts.semanticFingerprint("market-session-evidence", semanticInput) !== value.fingerprint) {
      return failure("B002-INPUT-REJECTED", "market-session-evidence-fingerprint-mismatch", "fingerprint");
    }
    var expectedOccurrence = contracts.occurrenceFingerprint("market-session-evidence", {
      contractVersion: "market-session-evidence-occurrence/v1",
      cutoffAt: value.cutoffAt,
      runId: value.runId,
      semanticFingerprint: value.fingerprint
    });
    if (expectedOccurrence !== value.evidenceId) {
      return failure("B002-INPUT-REJECTED", "market-session-evidence-identity-mismatch", "evidenceId");
    }
    return success(value);
  }

  var api = Object.freeze({
    aggregateSession: aggregateSession,
    buildComparableVolumeBaseline: buildComparableVolumeBaseline,
    buildMarketSessionEvidence: buildMarketSessionEvidence,
    classifySessionObservation: classifySessionObservation,
    joinEventMarketReaction: joinEventMarketReaction,
    loadCalendarSession: loadCalendarSession,
    normalizeReleasedReport: normalizeReleasedReport,
    validateCalendarSession: validateCalendarSession,
    validateComparableVolumeBaseline: validateComparableVolumeBaseline,
    validateEventMarketReaction: validateEventMarketReaction,
    validateMarketSessionEvidence: validateMarketSessionEvidence,
    validateReleasedReportEvidence: validateReleasedReportEvidence,
    validateSessionAggregate: validateSessionAggregate,
    validateSessionObservation: validateSessionObservation
  });

  root.RLSESSION = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
})();