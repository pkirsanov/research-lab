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
        "curve", "duration-posture", "volatility-magnitude", "ratio-derived"
    ];
    /* volatility-magnitude is magnitude-only with zero direction, so it may never stand in
       for a directional regime value. That refusal is enforced in composeRegime. */
    var DIRECTIONLESS_KINDS = ["volatility-magnitude"];

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
        /* An available facet MUST carry a value; an unavailable one MUST NOT invent one. */
        if (facet.state === "available") {
            requireString(facet.value, "$.facet.value");
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

    /* Opposing directional pairs. Kept explicit so a contradiction is a declared relationship
       rather than a string-similarity guess. */
    var OPPOSED = [
        ["uptrend", "downtrend"], ["risk-on", "risk-off"], ["broad", "narrow"],
        ["broadening", "narrowing"], ["spreads-tightening", "spreads-widening"],
        ["steepening", "flattening"], ["extending", "shortening"]
    ];

    function opposes(a, b) {
        for (var i = 0; i < OPPOSED.length; i += 1) {
            if ((OPPOSED[i][0] === a && OPPOSED[i][1] === b) || (OPPOSED[i][1] === a && OPPOSED[i][0] === b)) return true;
        }
        return false;
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
                if (!opposes(a.value, b.value)) continue;
                records.push({
                    contradictionId: a.facetId + "|" + b.facetId,
                    facetIdA: a.facetId, valueA: a.value,
                    facetIdB: b.facetId, valueB: b.value,
                    horizon: HORIZON_RANK[a.horizon] <= HORIZON_RANK[b.horizon] ? a.horizon : b.horizon,
                    /* Displayed alongside the headline; never collapsed into it. */
                    note: a.facetId + " reads " + a.value + " while " + b.facetId + " reads " + b.value
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
            if (facet.state === "available") valueByFacet[facet.facetId] = facet.value;
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

    function sleeveFits(combinedRegime, sleeveRegistry) {
        if (!combinedRegime || typeof combinedRegime !== "object") throw schemaError("RLREGIME_SCHEMA_INVALID", "$.combinedRegime");
        if (!sleeveRegistry || !Array.isArray(sleeveRegistry.sleeves)) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.sleeveRegistry.sleeves");
        return deepFreeze(sleeveRegistry.sleeves.map(function (sleeve, index) {
            requireString(sleeve.sleeveId, "$.sleeveRegistry.sleeves[" + index + "].sleeveId");
            requireString(sleeve.family, "$.sleeveRegistry.sleeves[" + index + "].family");
            requireString(sleeve.subType, "$.sleeveRegistry.sleeves[" + index + "].subType");
            if (!Number.isInteger(sleeve.ordinal)) throw schemaError("RLREGIME_SCHEMA_INVALID", "$.sleeveRegistry.sleeves[" + index + "].ordinal");
            return {
                contractVersion: "sleeve-fit/v1",
                sleeveId: sleeve.sleeveId,
                family: sleeve.family,
                subType: sleeve.subType,
                /* Ordinal ONLY — no weight, allocation, exposure, target, or position size. */
                ordinal: sleeve.ordinal
            };
        }));
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
        validateFacet: validateFacet,
        validateFacetSet: validateFacetSet,
        validateArchetypeRegistry: validateArchetypeRegistry,
        confirmationRatio: confirmationRatio,
        extractContradictions: extractContradictions,
        applyPersistence: applyPersistence,
        composeRegime: composeRegime,
        matchArchetype: matchArchetype,
        sleeveFits: sleeveFits,
        ownerRead: ownerRead,
        projectCompatibility: projectCompatibility,
        readPublishedContext: readPublishedContext
    };
});
