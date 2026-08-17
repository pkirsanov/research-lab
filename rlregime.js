/*
 * rlregime.js — Tier 2 sole composer RLREGIME.
 *
 * Facet validation, horizon eligibility, staleness degradation, confirmation arithmetic,
 * contradiction extraction, persistence gating, regime composition, archetype matching,
 * sleeve fits, the owner read, and the legacy compatibility projections.
 *
 * The composer exists so exactly one place names a regime. Three refusals define it:
 * an unmatched facet combination renders its fingerprint rather than borrowing the nearest
 * archetype's name; a stale facet leaves the denominator rather than becoming Neutral; and a
 * contradiction is carried as its own record rather than averaged into the headline, because
 * averaging "narrowing breadth" with "risk-on trend" produces a number that describes neither.
 */
(function (factory) {
    "use strict";

    var api = Object.freeze(factory());
    if (typeof module === "object" && module && module.exports) {
        module.exports = api;
        return;
    }
    if (typeof globalThis === "undefined") {
        throw new Error("RLREGIME_BROWSER_GLOBAL_UNAVAILABLE");
    }
    globalThis.RLREGIME = api;
})(function () {
    "use strict";

    var FACET_CONTRACT = "regime-facet/v1";
    var COMBINED_CONTRACT = "combined-regime/v1";
    var ARCHETYPE_CONTRACT = "regime-archetype-registry/v1";
    var OWNER_READ_CONTRACT = "regime-owner-read/v1";

    /* Longest first. A facet may serve a read no longer than its own declared class. */
    var HORIZONS = ["structural", "swing", "tactical"];
    var HORIZON_RANK = { structural: 3, swing: 2, tactical: 1 };

    var FACET_KINDS = [
        "sentiment-stress", "trend-structure", "breadth-participation", "credit",
        "curve", "duration-posture", "volatility-magnitude", "ratio-derived",
        "positioning-context"
    ];
    /* Magnitude- and structure-only kinds carry zero direction, so they may never stand in
       for a directional regime value. Dealer gamma says how moves propagate, not which way. */
    var DIRECTIONLESS_KINDS = ["volatility-magnitude", "positioning-context"];

    /*
     * Closed value vocabularies keyed by facet `kind`. A facet value outside its own kind's
     * list is refused at validation rather than carried as an unrecognised string, because an
     * unrecognised value would silently drop out of stance comparison and read as agreement.
     */
    var KIND_VOCABULARIES = {
        "sentiment-stress": ["complacent", "neutral", "stressed", "panic"],
        "trend-structure": ["uptrend", "risk-on", "sideways", "downtrend", "risk-off"],
        "breadth-participation": ["broad", "broadening", "mixed", "narrow", "narrowing"],
        "credit": ["spreads-tightening", "spreads-stable", "spreads-widening"],
        "curve": ["steepening", "flat", "flattening", "inverted"],
        "duration-posture": ["extending", "neutral", "shortening"],
        "volatility-magnitude": ["subdued", "normal", "elevated", "extreme"],
        "ratio-derived": ["leading", "in-line", "lagging"],
        "positioning-context": ["dealer-long-gamma", "dealer-short-gamma"]
    };

    /*
     * Declared stance per (kind, value). Contradiction is a declared relationship between two
     * stances, not a string-similarity guess, which is what lets "uptrend" and "narrowing"
     * register as the conflict they are despite sharing no substring. Every
     * volatility-magnitude value carries stance "none": that IS its zero-direction property.
     */
    var STANCE = {
        "sentiment-stress": { complacent: "risk-on", neutral: "neutral", stressed: "risk-off", panic: "risk-off" },
        "trend-structure": { uptrend: "risk-on", "risk-on": "risk-on", sideways: "neutral", downtrend: "risk-off", "risk-off": "risk-off" },
        "breadth-participation": { broad: "risk-on", broadening: "risk-on", mixed: "neutral", narrow: "risk-off", narrowing: "risk-off" },
        "credit": { "spreads-tightening": "risk-on", "spreads-stable": "neutral", "spreads-widening": "risk-off" },
        "curve": { steepening: "risk-on", flat: "neutral", flattening: "risk-off", inverted: "risk-off" },
        "duration-posture": { extending: "risk-off", neutral: "neutral", shortening: "risk-on" },
        "volatility-magnitude": { subdued: "none", normal: "none", elevated: "none", extreme: "none" },
        "ratio-derived": { leading: "risk-on", "in-line": "neutral", lagging: "risk-off" },
        "positioning-context": { "dealer-long-gamma": "none", "dealer-short-gamma": "none" }
    };

    /* A sleeve fit ranks; it never sizes. These tokens are refused at the contract boundary. */
    var FORBIDDEN_SLEEVE_TOKENS = [
        "weight", "allocation", "exposure", "target", "positionsize", "position_size",
        "position size", "buy", "sell", "hold"
    ];

    var FACET_STATES = ["available", "stale", "unavailable"];
    var PERSISTENCE_STATES = ["confirmed", "forming"];
    var TRANSITION_STATES = ["settled", "candidate"];
    var PROJECTION_VOCABULARIES = ["macro-regime-legacy/v1", "market-structure-band-legacy/v1"];
    var UNRESOLVED_LABELS = ["Mixed", "Unresolved"];

    function schemaError(code, path, message) {
        var error = new Error(message || code);
        error.code = code;
        error.path = path || "$";
        return error;
    }

    function requireIsoInstant(value, path) {
        if (typeof value !== "string") throw schemaError("RLREGIME_DECISION_TIME_INVALID", path);
        var epoch = Date.parse(value);
        if (!Number.isFinite(epoch) || new Date(epoch).toISOString() !== value) {
            throw schemaError("RLREGIME_DECISION_TIME_INVALID", path);
        }
        return epoch;
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

    function requireString(value, path) {
        if (typeof value !== "string" || value.length === 0) throw schemaError("RLREGIME_SCHEMA_INVALID", path);
        return value;
    }

    function validateFacet(facet) {
        if (!facet || typeof facet !== "object") throw schemaError("RLREGIME_SCHEMA_INVALID", "$.facet");
        if (facet.contractVersion !== FACET_CONTRACT) {
            throw schemaError("RLREGIME_CONTRACT_VERSION", "$.facet.contractVersion");
        }
        requireString(facet.facetId, "$.facet.facetId");
        if (!contains(FACET_KINDS, facet.kind)) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.facet.kind");
        if (!contains(HORIZONS, facet.horizon)) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.facet.horizon");
        if (!contains(FACET_STATES, facet.state)) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.facet.state");
        requireString(facet.valueVocabularyId, "$.facet.valueVocabularyId");
        requireIsoInstant(facet.asOf, "$.facet.asOf");
        /* An available facet MUST carry a value from its own kind's closed vocabulary; an
           unavailable one MUST NOT invent one. */
        if (facet.state === "available") {
            requireString(facet.value, "$.facet.value");
            if (!contains(KIND_VOCABULARIES[facet.kind], facet.value)) {
                throw schemaError("RLREGIME_SCHEMA_INVALID", "$.facet.value");
            }
        } else if (facet.value !== null && facet.value !== undefined) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", "$.facet.value");
        }
        if (facet.state === "unavailable") requireString(facet.unavailableReason, "$.facet.unavailableReason");
        return deepFreeze({
            contractVersion: FACET_CONTRACT,
            facetId: facet.facetId,
            kind: facet.kind,
            value: facet.state === "available" ? facet.value : null,
            valueVocabularyId: facet.valueVocabularyId,
            horizon: facet.horizon,
            state: facet.state,
            asOf: facet.asOf,
            freshnessWindowBars: Number.isFinite(facet.freshnessWindowBars) ? facet.freshnessWindowBars : null,
            historyBars: Number.isFinite(facet.historyBars) ? facet.historyBars : null,
            sourceAttribution: facet.sourceAttribution === undefined ? null : facet.sourceAttribution,
            coverageNote: facet.coverageNote === undefined ? null : facet.coverageNote,
            unavailableReason: facet.unavailableReason === undefined ? null : facet.unavailableReason
        });
    }

    function validateFacetSet(facets) {
        if (!Array.isArray(facets) || facets.length === 0) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.facets");
        var validated = facets.map(function (facet) { return validateFacet(facet); });
        var seen = {};
        validated.forEach(function (facet, index) {
            if (Object.prototype.hasOwnProperty.call(seen, facet.facetId)) {
                throw schemaError("RLREGIME_SCHEMA_INVALID", "$.facets[" + index + "].facetId");
            }
            seen[facet.facetId] = true;
        });
        var byHorizon = { structural: [], swing: [], tactical: [] };
        validated.forEach(function (facet) { byHorizon[facet.horizon].push(facet); });
        return deepFreeze({ facets: validated, byHorizon: byHorizon });
    }

    /*
     * Eligibility for a requested horizon. A facet declared at a SHORTER horizon than the read
     * is excluded from that read entirely — a tactical reading cannot move a structural value.
     */
    function eligibilityFor(facet, horizon) {
        if (HORIZON_RANK[facet.horizon] < HORIZON_RANK[horizon]) {
            return { eligible: false, reason: "horizon shorter than requested read" };
        }
        if (Number.isFinite(facet.historyBars) && Number.isFinite(facet.freshnessWindowBars)
            && facet.historyBars < facet.freshnessWindowBars) {
            return { eligible: false, reason: "history shorter than requested read" };
        }
        if (facet.state !== "available") {
            return { eligible: false, reason: facet.state === "stale" ? "stale beyond freshness window" : (facet.unavailableReason || "unavailable") };
        }
        return { eligible: true, reason: null };
    }

    /*
     * confirmationRatio. m counts only facets that actually participate; a stale or ineligible
     * facet LEAVES the denominator rather than being mapped to a neutral in-vocabulary value.
     */
    function confirmationRatio(facetSet, horizon) {
        var set = facetSet && facetSet.facets ? facetSet : validateFacetSet(facetSet);
        var readHorizon = horizon === undefined ? "structural" : horizon;
        if (!contains(HORIZONS, readHorizon)) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.horizon");
        var participating = [];
        var excluded = [];
        set.facets.forEach(function (facet) {
            var verdict = eligibilityFor(facet, readHorizon);
            if (verdict.eligible) participating.push(facet);
            else excluded.push({ facetId: facet.facetId, reason: verdict.reason });
        });
        var m = participating.length;
        if (m === 0) {
            /* Never 0, never 0/0, never a fixed denominator that hides missing evidence. */
            return deepFreeze({
                k: null, m: 0, ratio: null,
                availability: "unavailable",
                unavailableReason: "NO_ELIGIBLE_FACETS",
                excludedFacetIds: excluded.map(function (entry) { return entry.facetId; }),
                absentFacetIds: excluded.map(function (entry) { return entry.facetId; }),
                exclusions: excluded,
                whatWouldResolve: "at least one facet eligible at the requested horizon and within its freshness window",
                participatingFacetIds: []
            });
        }
        var directional = participating.filter(function (facet) { return !contains(DIRECTIONLESS_KINDS, facet.kind); });
        var contradictions = extractContradictions({ facets: participating });
        var contradicting = {};
        contradictions.forEach(function (record) { contradicting[record.facetIdA] = true; contradicting[record.facetIdB] = true; });
        var k = directional.filter(function (facet) { return !contradicting[facet.facetId]; }).length;
        return deepFreeze({
            k: k, m: m, ratio: Number(((k / m)).toFixed(6)),
            availability: "available",
            unavailableReason: null,
            excludedFacetIds: excluded.map(function (entry) { return entry.facetId; }),
            absentFacetIds: excluded.map(function (entry) { return entry.facetId; }),
            exclusions: excluded,
            whatWouldResolve: excluded.length === 0 ? null : "refresh or re-declare: " + excluded.map(function (e) { return e.facetId; }).join(","),
            participatingFacetIds: participating.map(function (facet) { return facet.facetId; })
        });
    }

    function stanceOf(facet) {
        if (facet.state !== "available" || facet.value === null) return "none";
        return STANCE[facet.kind][facet.value];
    }

    /* A directionless facet cannot stand where a regime direction is expected. */
    function requireDirectionalFacet(facet, path) {
        var validated = facet && facet.contractVersion === FACET_CONTRACT ? facet : validateFacet(facet);
        if (contains(DIRECTIONLESS_KINDS, validated.kind)) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", (path || "$.facet") + ".kind");
        }
        return validated;
    }

    function opposedStances(a, b) {
        return (a === "risk-on" && b === "risk-off") || (a === "risk-off" && b === "risk-on");
    }

    function extractContradictions(facetSet) {
        var facets = facetSet && facetSet.facets ? facetSet.facets : facetSet;
        if (!Array.isArray(facets)) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.facets");
        var records = [];
        for (var i = 0; i < facets.length; i += 1) {
            for (var j = i + 1; j < facets.length; j += 1) {
                var a = facets[i];
                var b = facets[j];
                if (a.state !== "available" || b.state !== "available") continue;
                if (!opposedStances(stanceOf(a), stanceOf(b))) continue;
                records.push({
                    contradictionId: a.facetId + "|" + b.facetId,
                    facetIdA: a.facetId, valueA: a.value, horizonA: a.horizon, stanceA: stanceOf(a),
                    facetIdB: b.facetId, valueB: b.value, horizonB: b.horizon, stanceB: stanceOf(b),
                    /* Displayed alongside the headline; never collapsed into it. */
                    note: a.facetId + " reads " + a.value + " (" + a.horizon + ") while "
                        + b.facetId + " reads " + b.value + " (" + b.horizon + ")"
                });
            }
        }
        return deepFreeze(records);
    }

    /*
     * applyPersistence. A single new observation implying a different archetype does NOT flip
     * the label; it records a candidate transition and leaves the confirmed value displayed.
     */
    function applyPersistence(facet, runState, policy) {
        var validated = facet && facet.contractVersion === FACET_CONTRACT ? facet : validateFacet(facet);
        if (!runState || typeof runState !== "object") throw schemaError("RLREGIME_SCHEMA_INVALID", "$.runState");
        if (!policy || typeof policy !== "object" || !policy.runThresholds) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", "$.policy.runThresholds");
        }
        var threshold = policy.runThresholds[validated.horizon];
        if (!Number.isFinite(threshold) || !Number.isInteger(threshold) || threshold < 1) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", "$.policy.runThresholds." + validated.horizon);
        }
        var priorValue = runState.priorValue === undefined ? null : runState.priorValue;
        var priorRun = Number.isFinite(runState.runLength) ? runState.runLength : 0;
        var changed = priorValue !== null && validated.value !== null && validated.value !== priorValue;
        var runLength = changed ? 1 : priorRun + 1;
        return deepFreeze({
            facetId: validated.facetId,
            /* Sub-threshold is `forming` on the facet and `candidate` as a transition state:
               the same fact named from the facet's side and from the transition's side. */
            persistenceState: runLength >= threshold ? "confirmed" : "forming",
            transitionState: changed && runLength < threshold ? "candidate" : "settled",
            runLength: runLength,
            thresholdBars: threshold,
            transitionedFrom: changed ? priorValue : null,
            /* The value the surface displays: a candidate never replaces the confirmed one. */
            displayedValue: changed && runLength < threshold ? priorValue : validated.value
        });
    }

    function fingerprintOf(facets) {
        return facets.slice().sort(function (a, b) { return a.facetId < b.facetId ? -1 : (a.facetId > b.facetId ? 1 : 0); })
            .map(function (facet) { return facet.facetId + "=" + (facet.value === null ? "unavailable" : facet.value); })
            .join("|");
    }

    function validateArchetypeRegistry(registry) {
        if (!registry || typeof registry !== "object") throw schemaError("RLREGIME_SCHEMA_INVALID", "$.registry");
        if (registry.contractVersion !== ARCHETYPE_CONTRACT) {
            throw schemaError("RLREGIME_CONTRACT_VERSION", "$.registry.contractVersion");
        }
        if (!Array.isArray(registry.entries) || registry.entries.length === 0) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", "$.registry.entries");
        }
        registry.entries.forEach(function (entry, index) {
            var base = "$.registry.entries[" + index + "]";
            requireString(entry.archetypeId, base + ".archetypeId");
            requireString(entry.displayName, base + ".displayName");
            if (!Array.isArray(entry.tuple) || entry.tuple.length === 0) throw schemaError("RLREGIME_SCHEMA_INVALID", base + ".tuple");
            entry.tuple.forEach(function (cell, cellIndex) {
                requireString(cell.facetId, base + ".tuple[" + cellIndex + "].facetId");
                /* Fully enumerated: a wildcard or range would make the mapping approximate. */
                requireString(cell.value, base + ".tuple[" + cellIndex + "].value");
                if (cell.value === "*" || cell.value.indexOf("..") !== -1) {
                    throw schemaError("RLREGIME_SCHEMA_INVALID", base + ".tuple[" + cellIndex + "].value");
                }
            });
            if (!entry.projections || typeof entry.projections !== "object") {
                throw schemaError("RLREGIME_SCHEMA_INVALID", base + ".projections");
            }
            /* BOTH cells required, so a new archetype cannot silently fall out of a legacy vocabulary. */
            PROJECTION_VOCABULARIES.forEach(function (vocabulary) {
                var cell = entry.projections[vocabulary];
                if (!cell || typeof cell !== "object" || typeof cell.projectedValue !== "string") {
                    throw schemaError("RLREGIME_SCHEMA_INVALID", base + ".projections");
                }
            });
        });
        return registry;
    }

    function matchArchetype(combinedRegime, registry) {
        validateArchetypeRegistry(registry);
        if (!combinedRegime || typeof combinedRegime !== "object") throw schemaError("RLREGIME_SCHEMA_INVALID", "$.combinedRegime");
        var valueByFacet = {};
        combinedRegime.facets.forEach(function (facet) {
            /* A directionless facet may not carry a tuple cell, so it can never name a regime. */
            if (facet.state === "available" && !contains(DIRECTIONLESS_KINDS, facet.kind)) {
                valueByFacet[facet.facetId] = facet.value;
            }
        });
        var matched = null;
        registry.entries.forEach(function (entry) {
            if (matched) return;
            if (Array.isArray(entry.horizons) && !contains(entry.horizons, combinedRegime.horizon)) return;
            var every = entry.tuple.every(function (cell) { return valueByFacet[cell.facetId] === cell.value; });
            if (every) matched = entry;
        });
        if (matched === null) {
            /* No nearest-neighbour, no majority vote, no approximate name. */
            var present = combinedRegime.facets.filter(function (f) { return f.state === "available"; });
            return deepFreeze({
                archetypeId: null,
                displayName: "Unresolved",
                matchedTuple: null,
                matchBasis: "no-enumerated-match",
                fingerprintId: combinedRegime.fingerprint,
                unresolvedFacetPair: present.length >= 2
                    ? [present[0].facetId + "=" + present[0].value, present[1].facetId + "=" + present[1].value]
                    : present.map(function (f) { return f.facetId + "=" + f.value; })
            });
        }
        return deepFreeze({
            archetypeId: matched.archetypeId,
            displayName: matched.displayName,
            matchedTuple: matched.tuple.map(function (cell) { return { facetId: cell.facetId, value: cell.value }; }),
            matchBasis: "exact-enumerated-tuple"
        });
    }

    function composeRegime(facets, policy) {
        var set = facets && facets.facets ? facets : validateFacetSet(facets);
        if (!policy || typeof policy !== "object") throw schemaError("RLREGIME_SCHEMA_INVALID", "$.policy");
        requireIsoInstant(policy.decisionTime, "$.policy.decisionTime");
        var horizon = policy.horizon === undefined ? "structural" : policy.horizon;
        if (!contains(HORIZONS, horizon)) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.policy.horizon");

        /* As-of safety: a facet stamped after the decision instant cannot inform this read. */
        var asOfSafe = [];
        var hindsight = [];
        set.facets.forEach(function (facet) {
            if (Date.parse(facet.asOf) > Date.parse(policy.decisionTime)) hindsight.push(facet.facetId);
            else asOfSafe.push(facet);
        });

        var eligible = [];
        var exclusions = [];
        asOfSafe.forEach(function (facet) {
            var verdict = eligibilityFor(facet, horizon);
            if (verdict.eligible) eligible.push(facet);
            else exclusions.push({ facetId: facet.facetId, reason: verdict.reason });
        });

        var confirmation = confirmationRatio({ facets: asOfSafe }, horizon);
        var contradictions = extractContradictions({ facets: eligible });
        return deepFreeze({
            contractVersion: COMBINED_CONTRACT,
            horizon: horizon,
            decisionTime: policy.decisionTime,
            facets: eligible,
            fingerprint: fingerprintOf(eligible),
            fingerprintId: fingerprintOf(eligible),
            confirmation: confirmation,
            contradictions: contradictions,
            excludedFacetIds: exclusions.map(function (entry) { return entry.facetId; }),
            exclusions: exclusions,
            /* A label smoothed across later observations is refused, and the refusal says why. */
            rejectedHindsightFacetIds: hindsight,
            asOfSafe: hindsight.length === 0,
            asOfSafetyNote: hindsight.length === 0 ? null : "label was not as-of-safe: " + hindsight.join(",") + " are stamped after decisionTime",
            archetypeRegistryVersion: policy.archetypeRegistryVersion === undefined ? null : policy.archetypeRegistryVersion,
            sleeveRegistryVersion: policy.sleeveRegistryVersion === undefined ? null : policy.sleeveRegistryVersion
        });
    }

    function rejectForbiddenSleeveOutput(sleeve, path) {
        Object.keys(sleeve).forEach(function (key) {
            var flatKey = key.toLowerCase();
            FORBIDDEN_SLEEVE_TOKENS.forEach(function (token) {
                if (flatKey.indexOf(token.replace(/[ _]/g, "")) !== -1 || flatKey === token) {
                    throw schemaError("RLREGIME_SCHEMA_INVALID", path + "." + key);
                }
            });
        });
    }

    function sleeveFits(combinedRegime, sleeveRegistry) {
        if (!combinedRegime || combinedRegime.contractVersion !== COMBINED_CONTRACT) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", "$.combinedRegime");
        }
        if (!sleeveRegistry || !Array.isArray(sleeveRegistry.sleeves)) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.sleeveRegistry.sleeves");
        var eligibleFacetIds = combinedRegime.facets.map(function (facet) { return facet.facetId; });
        var rows = sleeveRegistry.sleeves.map(function (sleeve, index) {
            var path = "$.sleeveRegistry.sleeves[" + index + "]";
            rejectForbiddenSleeveOutput(sleeve, path);
            requireString(sleeve.sleeveId, path + ".sleeveId");
            requireString(sleeve.family, path + ".family");
            /* Sub-type is never collapsed with bond or commodity. */
            requireString(sleeve.subType, path + ".subType");
            requireString(sleeve.invalidation, path + ".invalidation");
            if (!Array.isArray(sleeve.rationaleFacetIds) || sleeve.rationaleFacetIds.length === 0) {
                throw schemaError("RLREGIME_SCHEMA_INVALID", path + ".rationaleFacetIds");
            }
            if (!Number.isInteger(sleeve.ordinal)) throw schemaError("RLREGIME_SCHEMA_INVALID", path + ".ordinal");
            var supporting = sleeve.rationaleFacetIds.filter(function (id) { return contains(eligibleFacetIds, id); });
            return { sleeve: sleeve, supporting: supporting };
        });

        /*
         * No-advantage is an explicit state, not a tie broken into a 1..n list. If no sleeve has
         * a supporting facet in this read, or every sleeve declares the same ordinal, then the
         * regime distinguishes none of them and saying otherwise would invent a preference.
         */
        var distinctOrdinals = {};
        rows.forEach(function (row) { distinctOrdinals[row.sleeve.ordinal] = true; });
        var anySupported = rows.some(function (row) { return row.supporting.length > 0; });
        var noAdvantage = !anySupported || Object.keys(distinctOrdinals).length <= 1;
        var reason = !anySupported
            ? "no rationale facet is eligible at this horizon"
            : "every sleeve declares the same ordinal";

        return deepFreeze(rows.map(function (row) {
            return {
                contractVersion: "sleeve-fit/v1",
                sleeveId: row.sleeve.sleeveId,
                family: row.sleeve.family,
                subType: row.sleeve.subType,
                /* Ordinal ONLY — no weight, allocation, exposure, target, or position size. */
                ordinal: noAdvantage ? null : row.sleeve.ordinal,
                noAdvantage: noAdvantage,
                noAdvantageReason: noAdvantage ? reason : null,
                rationaleFacetIds: row.supporting.slice(),
                invalidation: row.sleeve.invalidation
            };
        }));
    }

    /*
     * historySeries. Each point is composed only from observations at or before its own as-of
     * stamp, so a label can never be informed by a bar that had not printed when it was stamped.
     * A smoothing request is refused rather than served, because a smoothed label reads as a
     * contemporaneous call while carrying information that did not exist at that timestamp.
     */
    function historySeries(observations, opts) {
        if (!Array.isArray(observations) || observations.length === 0) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", "$.observations");
        }
        if (!opts || typeof opts !== "object") throw schemaError("RLREGIME_SCHEMA_INVALID", "$.opts");
        var horizon = opts.horizon === undefined ? "structural" : opts.horizon;
        if (!contains(HORIZONS, horizon)) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.opts.horizon");
        if (opts.smoothing !== undefined && opts.smoothing !== "none") {
            return deepFreeze({
                availability: "unavailable",
                unavailableReason: "HINDSIGHT_SMOOTHING_REFUSED",
                points: [],
                note: "refused: a label smoothed with '" + opts.smoothing
                    + "' across later observations is not as-of-safe",
                whatWouldResolve: "request the series with smoothing 'none' so each point uses only observations at or before its own as-of stamp"
            });
        }
        var points = observations.map(function (observation, index) {
            requireIsoInstant(observation.asOf, "$.observations[" + index + "].asOf");
            if (!Array.isArray(observation.facets)) {
                throw schemaError("RLREGIME_SCHEMA_INVALID", "$.observations[" + index + "].facets");
            }
            var cutoff = Date.parse(observation.asOf);
            /* Only facets at or before THIS point's own cutoff inform THIS point. */
            var visible = observation.facets.filter(function (facet) { return Date.parse(facet.asOf) <= cutoff; });
            if (visible.length === 0) {
                return {
                    asOf: observation.asOf,
                    availability: "unavailable",
                    unavailableReason: "NO_FACET_AT_CUTOFF",
                    regime: null,
                    whatWouldResolve: "a facet stamped at or before " + observation.asOf
                };
            }
            return {
                asOf: observation.asOf,
                availability: "available",
                unavailableReason: null,
                regime: composeRegime(visible, { decisionTime: observation.asOf, horizon: horizon }),
                whatWouldResolve: null
            };
        });
        return deepFreeze({
            availability: "available",
            unavailableReason: null,
            points: points,
            note: null,
            whatWouldResolve: null
        });
    }

    function ownerRead(combinedRegime, opts) {
        if (!combinedRegime || combinedRegime.contractVersion !== COMBINED_CONTRACT) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", "$.combinedRegime");
        }
        if (!opts || typeof opts !== "object") throw schemaError("RLREGIME_SCHEMA_INVALID", "$.opts");
        requireString(opts.deepLink, "$.opts.deepLink");
        return deepFreeze({
            contractVersion: OWNER_READ_CONTRACT,
            source: "DERIVED",
            horizon: combinedRegime.horizon,
            asOf: combinedRegime.decisionTime,
            fingerprint: combinedRegime.fingerprint,
            confirmation: combinedRegime.confirmation,
            contradictionCount: combinedRegime.contradictions.length,
            deepLink: opts.deepLink,
            evidenceFamilyId: opts.evidenceFamilyId === undefined ? null : opts.evidenceFamilyId
        });
    }

    /* projectCompatibility maps ONLY through the registry's enumerated cell, never by inference. */
    function projectCompatibility(combinedRegime, targetVocabularyId, registry) {
        if (!contains(PROJECTION_VOCABULARIES, targetVocabularyId)) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", "$.targetVocabularyId");
        }
        var match = matchArchetype(combinedRegime, registry);
        if (match.archetypeId === null) {
            return deepFreeze({
                targetVocabularyId: targetVocabularyId,
                projectedValue: null,
                availability: "unavailable",
                unavailableReason: "NO_ENUMERATED_ARCHETYPE",
                lossy: true,
                lossyFields: ["horizon", "confirmation", "contradictions"]
            });
        }
        var entry = null;
        registry.entries.forEach(function (candidate) { if (candidate.archetypeId === match.archetypeId) entry = candidate; });
        var cell = entry.projections[targetVocabularyId];
        return deepFreeze({
            targetVocabularyId: targetVocabularyId,
            archetypeId: match.archetypeId,
            projectedValue: cell.projectedValue,
            risk: Number.isFinite(cell.risk) ? cell.risk : null,
            availability: "available",
            unavailableReason: null,
            /* Every projection is lossy by construction and says so. */
            lossy: cell.lossy === true,
            lossyFields: Array.isArray(cell.lossyFields) ? cell.lossyFields.slice() : []
        });
    }

    function readPublishedContext(publishedRegime, opts) {
        if (!publishedRegime || publishedRegime.contractVersion !== COMBINED_CONTRACT) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", "$.publishedRegime");
        }
        if (!opts || typeof opts !== "object") throw schemaError("RLREGIME_SCHEMA_INVALID", "$.opts");
        requireIsoInstant(opts.decisionTime, "$.opts.decisionTime");
        if (opts.horizon !== undefined && !contains(HORIZONS, opts.horizon)) {
            throw schemaError("RLREGIME_SCHEMA_INVALID", "$.opts.horizon");
        }
        var stale = Date.parse(opts.decisionTime) > Date.parse(publishedRegime.decisionTime);
        return deepFreeze({
            horizon: publishedRegime.horizon,
            fingerprint: publishedRegime.fingerprint,
            confirmation: publishedRegime.confirmation,
            contradictions: publishedRegime.contradictions,
            asOf: publishedRegime.decisionTime,
            availability: stale ? "stale" : "current",
            /* The reader never re-derives a name; it reads what the composer published.
               There is no recomposition path here, and no registry is held. */
            isRecomputation: false,
            derivesLocally: false
        });
    }

    return {
        FACET_CONTRACT: FACET_CONTRACT,
        COMBINED_CONTRACT: COMBINED_CONTRACT,
        ARCHETYPE_CONTRACT: ARCHETYPE_CONTRACT,
        OWNER_READ_CONTRACT: OWNER_READ_CONTRACT,
        HORIZONS: Object.freeze(HORIZONS.slice()),
        FACET_KINDS: Object.freeze(FACET_KINDS.slice()),
        FACET_STATES: Object.freeze(FACET_STATES.slice()),
        PERSISTENCE_STATES: Object.freeze(PERSISTENCE_STATES.slice()),
        TRANSITION_STATES: Object.freeze(TRANSITION_STATES.slice()),
        PROJECTION_VOCABULARIES: Object.freeze(PROJECTION_VOCABULARIES.slice()),
        UNRESOLVED_LABELS: Object.freeze(UNRESOLVED_LABELS.slice()),
        KIND_VOCABULARIES: deepFreeze(JSON.parse(JSON.stringify(KIND_VOCABULARIES))),
        DIRECTIONLESS_KINDS: Object.freeze(DIRECTIONLESS_KINDS.slice()),
        FORBIDDEN_SLEEVE_TOKENS: Object.freeze(FORBIDDEN_SLEEVE_TOKENS.slice()),
        validateFacet: validateFacet,
        validateFacetSet: validateFacetSet,
        validateArchetypeRegistry: validateArchetypeRegistry,
        requireDirectionalFacet: requireDirectionalFacet,
        stanceOf: stanceOf,
        confirmationRatio: confirmationRatio,
        extractContradictions: extractContradictions,
        applyPersistence: applyPersistence,
        composeRegime: composeRegime,
        historySeries: historySeries,
        matchArchetype: matchArchetype,
        sleeveFits: sleeveFits,
        ownerRead: ownerRead,
        projectCompatibility: projectCompatibility,
        readPublishedContext: readPublishedContext
    };
});
