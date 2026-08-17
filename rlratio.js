/*
 * rlratio.js — Tier 0.5 pure RLRATIO primitive (ratio-pair measurement).
 *
 * Ratio math, window statistics, evidence-family grouping, and comparability/adjustment
 * parity for declared ratio pairs. Mirrors the rlvol.js module shape exactly.
 *
 * Two refusals carry the weight here. A z-score whose normalisation window is not declared
 * is refused outright rather than returned with an implicit window, because a reader cannot
 * tell "+1.8 over 60 bars" from "+1.8 over 252 bars" and the two mean different things. And
 * a pair whose legs disagree on distribution adjustment returns unavailable rather than a
 * caveated number, because a total-return leg over a price-only leg is a WRONG number, not
 * an imprecise one.
 */
(function (factory) {
    "use strict";

    var api = Object.freeze(factory());
    if (typeof module === "object" && module && module.exports) {
        module.exports = api;
        return;
    }
    if (typeof globalThis === "undefined") {
        throw new Error("RLRATIO_BROWSER_GLOBAL_UNAVAILABLE");
    }
    globalThis.RLRATIO = api;
})(function () {
    "use strict";

    var CONTRACT_VERSION = "ratio-pair-registry/v1";

    /* Closed vocabularies. A value outside these sets is a contract error, never a default. */
    var SEMANTIC_CLASSES = ["risk-appetite", "breadth", "style", "credit", "safety", "global", "dollar"];
    var ADJUSTMENT_BASES = ["price-return", "total-return", "split-only", "unadjusted"];
    var AVAILABILITY = ["available", "unavailable"];
    var COMPARABILITY = ["comparable", "not-comparable"];
    var UNAVAILABLE_REASONS = ["INSUFFICIENT_HISTORY", "NO_COMMON_DATES", "ADJUSTMENT_MISMATCH"];
    var NOT_COMPARABLE_REASONS = ["CURRENCY_MISMATCH", "SESSION_MISMATCH", "CALENDAR_MISMATCH"];

    function schemaError(code, path, message) {
        var error = new Error(message || code);
        error.code = code;
        error.path = path || "$";
        return error;
    }

    function requireIsoInstant(value, path) {
        if (typeof value !== "string") throw schemaError("RLRATIO_DECISION_TIME_INVALID", path);
        var epoch = Date.parse(value);
        if (!Number.isFinite(epoch) || new Date(epoch).toISOString() !== value) {
            throw schemaError("RLRATIO_DECISION_TIME_INVALID", path);
        }
        return epoch;
    }

    function isIsoDate(value) {
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
            !Number.isNaN(Date.parse(value + "T00:00:00.000Z"));
    }

    function contains(values, value) {
        return Array.isArray(values) && values.indexOf(value) !== -1;
    }

    function deepFreeze(value) {
        if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
        Object.freeze(value);
        Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
        return value;
    }

    /* Canonical number formatting keeps Node and browser output byte-identical. */
    function round(value, places) {
        if (!Number.isFinite(value)) return null;
        var factor = Math.pow(10, places);
        return Math.round(value * factor + (value >= 0 ? Number.EPSILON : -Number.EPSILON)) / factor;
    }

    function mean(values) {
        var total = 0;
        for (var i = 0; i < values.length; i += 1) total += values[i];
        return total / values.length;
    }

    function sampleStdDev(values) {
        if (values.length < 2) return null;
        var average = mean(values);
        var acc = 0;
        for (var i = 0; i < values.length; i += 1) acc += (values[i] - average) * (values[i] - average);
        var variance = acc / (values.length - 1);
        return Number.isFinite(variance) && variance >= 0 ? Math.sqrt(variance) : null;
    }

    function requireBarRows(rows, path) {
        if (!Array.isArray(rows)) throw schemaError("RLRATIO_SCHEMA_INVALID", path);
        for (var i = 0; i < rows.length; i += 1) {
            var row = rows[i];
            if (!row || typeof row !== "object") throw schemaError("RLRATIO_SCHEMA_INVALID", path + "[" + i + "]");
            if (!isIsoDate(row.date)) throw schemaError("RLRATIO_SCHEMA_INVALID", path + "[" + i + "].date");
            if (!Number.isFinite(row.close)) throw schemaError("RLRATIO_SCHEMA_INVALID", path + "[" + i + "].close");
        }
        return rows;
    }

    function requireLookbackBars(value, path) {
        if (!Number.isFinite(value) || !Number.isInteger(value) || value < 2) {
            throw schemaError("RLRATIO_SCHEMA_INVALID", path);
        }
        return value;
    }

    function requireString(value, path) {
        if (typeof value !== "string" || value.length === 0) throw schemaError("RLRATIO_SCHEMA_INVALID", path);
        return value;
    }

    function unavailableSeries(opts, reason, comparability) {
        return deepFreeze({
            pairId: opts.pairId,
            ratioFamilyId: opts.ratioFamilyId,
            points: [],
            observedCount: 0,
            asOf: null,
            availability: "unavailable",
            unavailableReason: reason,
            comparability: comparability,
            provenanceCaveat: opts.provenanceCaveat === undefined ? null : opts.provenanceCaveat,
            windowRef: null
        });
    }

    /*
     * Adjustment parity. Compared BEFORE any arithmetic: a total-return leg divided by a
     * price-only leg produces a number that looks valid and is not, so this must refuse
     * rather than caveat.
     */
    function checkAdjustmentParity(rowsA, rowsB, adjustmentRef) {
        if (!adjustmentRef || typeof adjustmentRef !== "object") {
            throw schemaError("RLRATIO_SCHEMA_INVALID", "$.adjustmentRef");
        }
        var numerator = adjustmentRef.numeratorAdjustment;
        var denominator = adjustmentRef.denominatorAdjustment;
        if (!contains(ADJUSTMENT_BASES, numerator)) {
            throw schemaError("RLRATIO_SCHEMA_INVALID", "$.adjustmentRef.numeratorAdjustment");
        }
        if (!contains(ADJUSTMENT_BASES, denominator)) {
            throw schemaError("RLRATIO_SCHEMA_INVALID", "$.adjustmentRef.denominatorAdjustment");
        }
        var matched = numerator === denominator;
        return deepFreeze({
            parity: matched ? "matched" : "mismatched",
            numeratorAdjustment: numerator,
            denominatorAdjustment: denominator,
            unavailableReason: matched ? null : "ADJUSTMENT_MISMATCH"
        });
    }

    /*
     * Session / FX / calendar comparability. A misaligned pair is excluded from confirmation
     * entirely rather than counted as disagreement — a pair we cannot compare is not evidence
     * against anything.
     */
    function checkComparability(refs) {
        if (!refs || typeof refs !== "object") throw schemaError("RLRATIO_SCHEMA_INVALID", "$.refs");
        var mismatches = [];
        [
            { ref: refs.currencyRef, name: "currencyRef", reason: "CURRENCY_MISMATCH" },
            { ref: refs.sessionRef, name: "sessionRef", reason: "SESSION_MISMATCH" },
            { ref: refs.calendarRef, name: "calendarRef", reason: "CALENDAR_MISMATCH" }
        ].forEach(function (entry) {
            if (!entry.ref || typeof entry.ref !== "object") {
                throw schemaError("RLRATIO_SCHEMA_INVALID", "$." + entry.name);
            }
            var left = requireString(entry.ref.numerator, "$." + entry.name + ".numerator");
            var right = requireString(entry.ref.denominator, "$." + entry.name + ".denominator");
            if (left !== right) mismatches.push({ ref: entry.name, reason: entry.reason, numerator: left, denominator: right });
        });
        return deepFreeze({
            comparability: mismatches.length === 0 ? "comparable" : "not-comparable",
            mismatches: mismatches,
            /* The FIRST declared mismatch names the state, so the reason is deterministic. */
            unavailableReason: mismatches.length === 0 ? null : mismatches[0].reason
        });
    }

    /*
     * ratioSeries. Filters both legs to asOf <= decisionTime BEFORE intersecting, so no point
     * can use a bar dated after the requested instant.
     */
    function ratioSeries(rowsA, rowsB, opts) {
        if (!opts || typeof opts !== "object") throw schemaError("RLRATIO_SCHEMA_INVALID", "$.opts");
        requireBarRows(rowsA, "$.rowsA");
        requireBarRows(rowsB, "$.rowsB");
        requireString(opts.pairId, "$.opts.pairId");
        requireString(opts.ratioFamilyId, "$.opts.ratioFamilyId");
        requireLookbackBars(opts.lookbackBars, "$.opts.lookbackBars");
        if (!contains(SEMANTIC_CLASSES, opts.semanticClass)) {
            throw schemaError("RLRATIO_SCHEMA_INVALID", "$.opts.semanticClass");
        }
        requireIsoInstant(opts.decisionTime, "$.opts.decisionTime");

        var parity = checkAdjustmentParity(rowsA, rowsB, opts.adjustmentRef);
        if (parity.parity === "mismatched") return unavailableSeries(opts, "ADJUSTMENT_MISMATCH", "comparable");

        var comparability = checkComparability({
            currencyRef: opts.currencyRef,
            sessionRef: opts.sessionRef,
            calendarRef: opts.calendarRef
        });
        if (comparability.comparability === "not-comparable") {
            return unavailableSeries(opts, comparability.unavailableReason, "not-comparable");
        }

        var cutoff = opts.decisionTime.slice(0, 10);
        var denominatorByDate = {};
        for (var j = 0; j < rowsB.length; j += 1) {
            if (rowsB[j].date <= cutoff) denominatorByDate[rowsB[j].date] = rowsB[j].close;
        }
        var points = [];
        for (var i = 0; i < rowsA.length; i += 1) {
            var row = rowsA[i];
            if (row.date > cutoff) continue;
            var denominator = denominatorByDate[row.date];
            /* A zero or non-finite denominator is dropped rather than producing Infinity. */
            if (!Number.isFinite(denominator) || denominator === 0) continue;
            points.push({ date: row.date, ratio: row.close / denominator });
        }
        points.sort(function (left, right) { return left.date < right.date ? -1 : (left.date > right.date ? 1 : 0); });

        if (points.length === 0) return unavailableSeries(opts, "NO_COMMON_DATES", "comparable");
        if (points.length < opts.lookbackBars) return unavailableSeries(opts, "INSUFFICIENT_HISTORY", "comparable");

        var windowPoints = points.slice(points.length - opts.lookbackBars);
        return deepFreeze({
            pairId: opts.pairId,
            ratioFamilyId: opts.ratioFamilyId,
            points: windowPoints.map(function (point) { return { date: point.date, ratio: round(point.ratio, 8) }; }),
            observedCount: windowPoints.length,
            asOf: windowPoints[windowPoints.length - 1].date,
            availability: "available",
            unavailableReason: null,
            comparability: "comparable",
            provenanceCaveat: opts.provenanceCaveat === undefined ? null : opts.provenanceCaveat,
            windowRef: {
                observations: windowPoints.length,
                startDate: windowPoints[0].date,
                endDate: windowPoints[windowPoints.length - 1].date
            }
        });
    }

    /* trailingChange projects a ratioSeries into the RatioPairContract reading. */
    function trailingChange(series, opts) {
        if (!series || typeof series !== "object") throw schemaError("RLRATIO_SCHEMA_INVALID", "$.series");
        if (!opts || typeof opts !== "object") throw schemaError("RLRATIO_SCHEMA_INVALID", "$.opts");
        requireLookbackBars(opts.lookbackBars, "$.opts.lookbackBars");
        requireIsoInstant(opts.decisionTime, "$.opts.decisionTime");

        if (series.availability === "unavailable") {
            return deepFreeze({
                pairId: series.pairId,
                ratioFamilyId: series.ratioFamilyId,
                trailingPct: null,
                asOf: series.asOf,
                availability: "unavailable",
                unavailableReason: series.unavailableReason,
                windowRef: series.windowRef,
                comparability: series.comparability,
                provenanceCaveat: series.provenanceCaveat
            });
        }

        var points = series.points;
        if (!Array.isArray(points) || points.length < 2) {
            throw schemaError("RLRATIO_SCHEMA_INVALID", "$.series.points");
        }
        var first = points[0].ratio;
        var last = points[points.length - 1].ratio;
        if (!Number.isFinite(first) || first === 0 || !Number.isFinite(last)) {
            throw schemaError("RLRATIO_SCHEMA_INVALID", "$.series.points");
        }
        return deepFreeze({
            pairId: series.pairId,
            ratioFamilyId: series.ratioFamilyId,
            trailingPct: round(((last - first) / first) * 100, 6),
            asOf: series.asOf,
            availability: "available",
            unavailableReason: null,
            windowRef: series.windowRef,
            comparability: series.comparability,
            provenanceCaveat: series.provenanceCaveat
        });
    }

    /*
     * windowStats. The declared window is REQUIRED and is returned on the reading, so the
     * consumer renders "z = +1.8 (252d window)" as adjacent text instead of recovering the
     * window from a tooltip or assuming one.
     */
    function windowStats(values, opts) {
        if (!Array.isArray(values)) throw schemaError("RLRATIO_SCHEMA_INVALID", "$.values");
        if (!opts || typeof opts !== "object") throw schemaError("RLRATIO_SCHEMA_INVALID", "$.opts");
        var windowRef = opts.windowRef;
        if (!windowRef || typeof windowRef !== "object") throw schemaError("RLRATIO_SCHEMA_INVALID", "$.windowRef");
        if (!Number.isFinite(windowRef.observations)) throw schemaError("RLRATIO_SCHEMA_INVALID", "$.windowRef");
        if (!isIsoDate(windowRef.startDate)) throw schemaError("RLRATIO_SCHEMA_INVALID", "$.windowRef");
        if (!isIsoDate(windowRef.endDate)) throw schemaError("RLRATIO_SCHEMA_INVALID", "$.windowRef");
        requireIsoInstant(opts.decisionTime, "$.opts.decisionTime");
        for (var i = 0; i < values.length; i += 1) {
            if (!Number.isFinite(values[i])) throw schemaError("RLRATIO_SCHEMA_INVALID", "$.values[" + i + "]");
        }

        var frozenWindow = { observations: windowRef.observations, startDate: windowRef.startDate, endDate: windowRef.endDate };
        var deviation = sampleStdDev(values);
        if (values.length < 2 || deviation === null || deviation === 0) {
            /* A zero-dispersion window cannot produce a meaningful z-score; it degrades. */
            return deepFreeze({
                zScore: null,
                percentile: null,
                windowRef: frozenWindow,
                availability: "unavailable",
                unavailableReason: "INSUFFICIENT_HISTORY"
            });
        }
        var latest = values[values.length - 1];
        var below = 0;
        for (var k = 0; k < values.length; k += 1) if (values[k] <= latest) below += 1;
        return deepFreeze({
            zScore: round((latest - mean(values)) / deviation, 6),
            percentile: round((below / values.length) * 100, 6),
            windowRef: frozenWindow,
            availability: "available",
            unavailableReason: null
        });
    }

    /*
     * groupByFamily. Runs BEFORE any confirmation arithmetic downstream — that ordering is
     * what stops SOXX/SPY and SMH/SPY from reading as two independent confirmations of the
     * same semiconductor signal. Each family contributes confirmationWeight 1, never its
     * member count.
     */
    function groupByFamily(readings) {
        if (!Array.isArray(readings)) throw schemaError("RLRATIO_SCHEMA_INVALID", "$.readings");
        var order = [];
        var byFamily = {};
        for (var i = 0; i < readings.length; i += 1) {
            var reading = readings[i];
            if (!reading || typeof reading !== "object") throw schemaError("RLRATIO_SCHEMA_INVALID", "$.readings[" + i + "]");
            var familyId = reading.ratioFamilyId;
            if (typeof familyId !== "string" || familyId.length === 0) {
                throw schemaError("RLRATIO_SCHEMA_INVALID", "$.readings[" + i + "].ratioFamilyId");
            }
            if (!Object.prototype.hasOwnProperty.call(byFamily, familyId)) {
                byFamily[familyId] = { ratioFamilyId: familyId, memberPairIds: [], directions: [] };
                order.push(familyId);
            }
            byFamily[familyId].memberPairIds.push(reading.pairId);
            if (reading.availability === "available" && Number.isFinite(reading.trailingPct)) {
                byFamily[familyId].directions.push(reading.trailingPct >= 0 ? "up" : "down");
            }
        }
        return deepFreeze(order.map(function (familyId) {
            var family = byFamily[familyId];
            var directions = family.directions;
            var agreement = "unavailable";
            if (directions.length > 0) {
                var firstDirection = directions[0];
                agreement = directions.every(function (d) { return d === firstDirection; }) ? "agree" : "mixed";
            }
            return {
                ratioFamilyId: family.ratioFamilyId,
                memberPairIds: family.memberPairIds.slice(),
                representativePairId: family.memberPairIds[0],
                memberAgreement: agreement,
                confirmationWeight: 1
            };
        }));
    }

    /* validatePairRegistry refuses an unknown contractVersion outright rather than adapting. */
    function validatePairRegistry(registry) {
        if (!registry || typeof registry !== "object") throw schemaError("RLRATIO_SCHEMA_INVALID", "$.registry");
        if (registry.contractVersion !== CONTRACT_VERSION) {
            throw schemaError("RLRATIO_CONTRACT_VERSION", "$.registry.contractVersion");
        }
        if (!Array.isArray(registry.pairs) || registry.pairs.length === 0) {
            throw schemaError("RLRATIO_SCHEMA_INVALID", "$.registry.pairs");
        }
        var seen = {};
        registry.pairs.forEach(function (pair, index) {
            var base = "$.registry.pairs[" + index + "]";
            if (!pair || typeof pair !== "object") throw schemaError("RLRATIO_SCHEMA_INVALID", base);
            requireString(pair.pairId, base + ".pairId");
            if (Object.prototype.hasOwnProperty.call(seen, pair.pairId)) {
                throw schemaError("RLRATIO_SCHEMA_INVALID", base + ".pairId");
            }
            seen[pair.pairId] = true;
            requireString(pair.numerator, base + ".numerator");
            requireString(pair.denominator, base + ".denominator");
            requireString(pair.ratioFamilyId, base + ".ratioFamilyId");
            requireString(pair.directionConvention, base + ".directionConvention");
            requireLookbackBars(pair.lookbackBars, base + ".lookbackBars");
            if (!contains(SEMANTIC_CLASSES, pair.semanticClass)) {
                throw schemaError("RLRATIO_SCHEMA_INVALID", base + ".semanticClass");
            }
        });
        return deepFreeze({
            contractVersion: registry.contractVersion,
            pairCount: registry.pairs.length,
            pairIds: registry.pairs.map(function (pair) { return pair.pairId; })
        });
    }

    return {
        CONTRACT_VERSION: CONTRACT_VERSION,
        SEMANTIC_CLASSES: Object.freeze(SEMANTIC_CLASSES.slice()),
        ADJUSTMENT_BASES: Object.freeze(ADJUSTMENT_BASES.slice()),
        AVAILABILITY: Object.freeze(AVAILABILITY.slice()),
        COMPARABILITY: Object.freeze(COMPARABILITY.slice()),
        UNAVAILABLE_REASONS: Object.freeze(UNAVAILABLE_REASONS.slice()),
        NOT_COMPARABLE_REASONS: Object.freeze(NOT_COMPARABLE_REASONS.slice()),
        ratioSeries: ratioSeries,
        trailingChange: trailingChange,
        windowStats: windowStats,
        groupByFamily: groupByFamily,
        checkAdjustmentParity: checkAdjustmentParity,
        checkComparability: checkComparability,
        validatePairRegistry: validatePairRegistry
    };
});
