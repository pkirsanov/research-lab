(function () {
    "use strict";

    var root = (typeof globalThis !== "undefined") ? globalThis :
        ((typeof window !== "undefined") ? window : {});
    var contracts = root.RLCONTRACTS;
    if (!contracts && typeof module !== "undefined" && module && module.exports) {
        contracts = require("./rlcontracts.js");
    }
    if (!contracts) {
        var dependencyError = new Error("RLCONTRACTS is required");
        dependencyError.code = "PBRM-BOOT-DEPENDENCY";
        throw dependencyError;
    }

    var CONFIG_SCHEMA = "place-based-rental-market-config/v2";
    var PAYLOAD_SCHEMA = "place-based-rental-market-payload/v2";
    var UNIT_CONTRACT = "place-based-rental-market-unit/v2";
    var BASIS_CONTRACT = "place-based-rental-market-basis/v1";
    var ASSUMPTIONS_CONTRACT = "place-based-rental-market-user-assumptions/v2";
    var RESULT_CONTRACT = "place-based-rental-market-result/v2";
    var VIEW_MODEL_CONTRACT = "place-based-rental-market-view-model/v2";
    var INNER_READ_CONTRACT = "place-based-rental-market-tool-read/v2";
    var OUTER_READ_CONTRACT = "rl-tool-read/v1";
    var MANDATORY_MARKETS = Object.freeze(["palm-springs-ca", "ocean-shores-wa"]);
    var MANDATORY_SEGMENTS = Object.freeze(["whole-market", "large-luxury-5plus"]);
    var LUXURY_SEGMENT_BY_MARKET = Object.freeze({ "palm-springs-ca": "large-luxury-5plus", "ocean-shores-wa": "large-luxury-4plus" });
    function isLuxurySegment(segmentId) { return typeof segmentId === "string" && /^large-luxury-[0-9]+plus$/.test(segmentId); }
    function luxuryMinBedrooms(segmentId) { var m = /^large-luxury-([0-9]+)plus$/.exec(segmentId); return m ? parseInt(m[1], 10) : null; }
    function mandatorySegmentsForMarket(marketId) { return ["whole-market", LUXURY_SEGMENT_BY_MARKET[marketId]]; }
    var CONFIG_KEYS = Object.freeze([
        "schemaVersion", "configVersion", "contracts", "requiredResearchCategoryIds",
        "enums", "freshness", "limits", "bounds", "displayFormats",
        "comparisonBasisFields", "initialUi", "marketCatalog", "marketProfiles",
        "segmentCatalog", "geographyCatalog", "populationCatalog", "legalFieldCatalog",
        "costFieldCatalog", "riskFieldCatalog", "premiumAttributeCatalog", "sourcePolicies",
        "metricDefinitions", "scenarioCatalog"
    ]);
    var CONTRACT_KEYS = Object.freeze([
        "marketPayload", "unit", "formula", "researchMethod", "changeAccounting",
        "comparisonBasis", "userAssumptions", "result", "viewModel", "ownerRead", "uiState"
    ]);
    var PAYLOAD_KEYS = Object.freeze([
        "schemaVersion", "payloadId", "marketId", "configVersion", "formulaVersion",
        "researchMethodVersion", "changeAccountingVersion", "assembledAt", "units",
        "educationalDisclosure"
    ]);
    var UNIT_KEYS = Object.freeze([
        "contractVersion", "unitId", "pairKey", "marketId", "segmentId", "researchedAt",
        "asOf", "staleAfter", "prior", "categoryCoverage", "segmentCoverage",
        "luxuryQualification", "thesis", "sources", "claims", "metricObservations",
        "definitionConflicts", "forecastMethods", "series", "annualSyntheses", "scenarios",
        "initialSelection", "acquisitionSample", "acquisitionBaseline", "variableCostBaseline",
        "fixedRiskCostBaseline", "riskAssumptionBaseline", "legalFacts", "drivers", "changes",
        "unknowns"
    ]);
    var BASIS_FIELDS = Object.freeze([
        "metricDefinitionId", "marketId", "geographyId", "populationId", "segmentId",
        "periodStart", "periodEnd", "currency", "unit", "aggregation", "sourceMethodId",
        "sampleFrameId", "qualificationSignature"
    ]);
    var BASIS_REASONS = Object.freeze({
        metricDefinitionId: "METRIC_DEFINITION",
        marketId: "MARKET",
        geographyId: "GEOGRAPHY",
        populationId: "POPULATION",
        segmentId: "SEGMENT_QUALIFICATION",
        periodStart: "PERIOD",
        periodEnd: "PERIOD",
        currency: "CURRENCY",
        unit: "UNIT",
        aggregation: "AGGREGATION",
        sourceMethodId: "SOURCE_METHOD",
        sampleFrameId: "SAMPLE_FRAME",
        qualificationSignature: "SEGMENT_QUALIFICATION"
    });
    var ASSUMPTION_KEYS = Object.freeze([
        "contractVersion", "marketId", "segmentId", "pairKey", "unitId", "scenarioId",
        "forecastYear", "demandDelta", "supplyDelta", "adrShock", "downtime",
        "purchasePriceUsd", "leverageRatio", "downPaymentRatio", "annualMortgageRate",
        "loanTermYears", "variableOperatingExpenseRatio", "fixedRiskCosts"
    ]);
    var OPTIONAL_ASSUMPTION_KEYS = Object.freeze(["baseOccupancy", "baseAdrUsd", "availableNights"]);
    var SAFE_PATH = /^[a-z0-9][a-z0-9._/-]*$/;
    var SECRET_PARAMETER = /(?:authorization|auth|cookie|credential|key|password|secret|token)/i;

    function isObject(value) {
        return !!value && Object.prototype.toString.call(value) === "[object Object]";
    }

    function isFiniteNumber(value) {
        return typeof value === "number" && Number.isFinite(value);
    }

    function own(value, key) {
        return Object.prototype.hasOwnProperty.call(value, key);
    }

    function pbrmError(code, path, message) {
        return { code: code, path: path, message: message || code };
    }

    function validation(errors) {
        return { ok: errors.length === 0, errors: errors };
    }

    function exactKeys(value, keys, code, path, errors) {
        if (!isObject(value)) {
            errors.push(pbrmError(code, path, "object required"));
            return false;
        }
        var allowed = Object.create(null);
        var index;
        for (index = 0; index < keys.length; index += 1) allowed[keys[index]] = true;
        var actual = Object.keys(value);
        for (index = 0; index < actual.length; index += 1) {
            if (!allowed[actual[index]]) errors.push(pbrmError(code, path ? path + "." + actual[index] : actual[index], "unknown key"));
        }
        for (index = 0; index < keys.length; index += 1) {
            if (!own(value, keys[index])) errors.push(pbrmError(code, path ? path + "." + keys[index] : keys[index], "missing key"));
        }
        return true;
    }

    function uniqueBy(values, key, code, path, errors) {
        var seen = Object.create(null);
        for (var index = 0; index < values.length; index += 1) {
            var id = values[index] && values[index][key];
            if (typeof id !== "string" || !id) errors.push(pbrmError(code, path + "." + index + "." + key, "id required"));
            else if (seen[id]) errors.push(pbrmError(code, path + "." + index + "." + key, "duplicate id"));
            else seen[id] = true;
        }
        return seen;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
        if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
        if (Array.isArray(value)) {
            for (var arrayIndex = 0; arrayIndex < value.length; arrayIndex += 1) deepFreeze(value[arrayIndex]);
        } else if (!(value instanceof Map)) {
            var keys = Object.keys(value);
            for (var keyIndex = 0; keyIndex < keys.length; keyIndex += 1) deepFreeze(value[keys[keyIndex]]);
        }
        return Object.freeze(value);
    }

    function asMap(values, key) {
        var output = new Map();
        for (var index = 0; index < values.length; index += 1) output.set(values[index][key], deepFreeze(values[index]));
        return Object.freeze(output);
    }

    function safeRelativePath(value) {
        return typeof value === "string" && SAFE_PATH.test(value) && value.indexOf("..") === -1 &&
            value.indexOf("//") === -1 && value.indexOf("?") === -1 && value.indexOf("#") === -1 &&
            value.indexOf("\\") === -1 && value.indexOf(":") === -1;
    }

    function safeSourceUrl(value) {
        try {
            var parsed = new URL(value);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return { ok: false, reason: "SCHEME" };
            if (parsed.username || parsed.password) return { ok: false, reason: "USERINFO" };
            var queryNames = [];
            parsed.searchParams.forEach(function (_entry, key) { queryNames.push(key); });
            for (var index = 0; index < queryNames.length; index += 1) {
                if (SECRET_PARAMETER.test(queryNames[index])) return { ok: false, reason: "SECRET_QUERY" };
            }
            if (parsed.hash) {
                var hashName = parsed.hash.slice(1).split("=")[0];
                if (SECRET_PARAMETER.test(hashName)) return { ok: false, reason: "SECRET_FRAGMENT" };
            }
            return { ok: true, value: parsed.href };
        } catch (_error) {
            return { ok: false, reason: "MALFORMED" };
        }
    }

    function validateConfig(value) {
        var errors = [];
        if (!exactKeys(value, CONFIG_KEYS, "PBRM-CONFIG-SCHEMA", "", errors)) return validation(errors);
        if (value.schemaVersion !== CONFIG_SCHEMA) errors.push(pbrmError("PBRM-CONFIG-VERSION", "schemaVersion", "unsupported config schema"));
        if (typeof value.configVersion !== "string" || !value.configVersion) errors.push(pbrmError("PBRM-CONFIG-VERSION", "configVersion", "config version required"));
        exactKeys(value.contracts, CONTRACT_KEYS, "PBRM-CONFIG-SCHEMA", "contracts", errors);
        if (isObject(value.contracts)) {
            var expectedContracts = {
                marketPayload: PAYLOAD_SCHEMA,
                unit: UNIT_CONTRACT,
                formula: "place-based-rental-market-model/2.0.0",
                researchMethod: "place-based-rental-market-research/2.0.0",
                changeAccounting: "place-based-rental-market-change/v2",
                comparisonBasis: BASIS_CONTRACT,
                userAssumptions: ASSUMPTIONS_CONTRACT,
                result: RESULT_CONTRACT,
                viewModel: VIEW_MODEL_CONTRACT,
                ownerRead: INNER_READ_CONTRACT,
                uiState: "place-based-rental-market-ui-state/v2"
            };
            Object.keys(expectedContracts).forEach(function (key) {
                if (value.contracts[key] !== expectedContracts[key]) errors.push(pbrmError("PBRM-CONFIG-VERSION", "contracts." + key, "unsupported contract version"));
            });
        }
        var arrays = ["requiredResearchCategoryIds", "marketCatalog", "marketProfiles", "segmentCatalog", "geographyCatalog", "populationCatalog", "legalFieldCatalog", "costFieldCatalog", "riskFieldCatalog", "premiumAttributeCatalog", "sourcePolicies", "metricDefinitions", "scenarioCatalog", "comparisonBasisFields"];
        for (var arrayIndex = 0; arrayIndex < arrays.length; arrayIndex += 1) {
            if (!Array.isArray(value[arrays[arrayIndex]])) errors.push(pbrmError("PBRM-CONFIG-SCHEMA", arrays[arrayIndex], "array required"));
        }
        if (errors.length) return validation(errors);

        var marketIds = uniqueBy(value.marketCatalog, "marketId", "PBRM-CONFIG-REF", "marketCatalog", errors);
        var profileIds = uniqueBy(value.marketProfiles, "profileId", "PBRM-CONFIG-PROFILE", "marketProfiles", errors);
        var pairIds = uniqueBy(value.segmentCatalog, "pairKey", "PBRM-CONFIG-REF", "segmentCatalog", errors);
        var geographyIds = uniqueBy(value.geographyCatalog, "id", "PBRM-CONFIG-REF", "geographyCatalog", errors);
        var populationIds = uniqueBy(value.populationCatalog, "id", "PBRM-CONFIG-REF", "populationCatalog", errors);
        var legalIds = uniqueBy(value.legalFieldCatalog, "id", "PBRM-CONFIG-PROFILE", "legalFieldCatalog", errors);
        var costIds = uniqueBy(value.costFieldCatalog, "id", "PBRM-CONFIG-PROFILE", "costFieldCatalog", errors);
        var riskIds = uniqueBy(value.riskFieldCatalog, "id", "PBRM-CONFIG-PROFILE", "riskFieldCatalog", errors);
        var premiumIds = uniqueBy(value.premiumAttributeCatalog, "id", "PBRM-CONFIG-PROFILE", "premiumAttributeCatalog", errors);
        uniqueBy(value.metricDefinitions, "id", "PBRM-CONFIG-REF", "metricDefinitions", errors);

        MANDATORY_MARKETS.forEach(function (marketId) {
            if (!marketIds[marketId]) errors.push(pbrmError("PBRM-CONFIG-REF", "marketCatalog", "mandatory market missing"));
            mandatorySegmentsForMarket(marketId).forEach(function (segmentId) {
                if (!pairIds[marketId + "::" + segmentId]) errors.push(pbrmError("PBRM-CONFIG-REF", "segmentCatalog", "mandatory pair missing"));
            });
        });
        if (value.marketCatalog.length !== MANDATORY_MARKETS.length) errors.push(pbrmError("PBRM-CONFIG-REF", "marketCatalog", "exactly two markets required"));
        if (value.segmentCatalog.length !== MANDATORY_MARKETS.length * MANDATORY_SEGMENTS.length) errors.push(pbrmError("PBRM-CONFIG-REF", "segmentCatalog", "exactly four mandatory pairs required"));

        value.marketCatalog.forEach(function (market, index) {
            var base = "marketCatalog." + index;
            if (!safeRelativePath(market.routePath)) errors.push(pbrmError("PBRM-CONFIG-REF", base + ".routePath", "unsafe route path"));
            if (!safeRelativePath(market.payloadPath)) errors.push(pbrmError("PBRM-CONFIG-REF", base + ".payloadPath", "unsafe payload path"));
            if (!profileIds[market.profileId]) errors.push(pbrmError("PBRM-CONFIG-PROFILE", base + ".profileId", "profile missing"));
            if (!marketIds[market.comparisonMarketId] || market.comparisonMarketId === market.marketId) errors.push(pbrmError("PBRM-CONFIG-REF", base + ".comparisonMarketId", "comparison market invalid"));
            if (!pairIds[market.marketId + "::" + market.defaultSegmentId]) errors.push(pbrmError("PBRM-CONFIG-REF", base + ".defaultSegmentId", "default segment invalid"));
        });
        value.segmentCatalog.forEach(function (segment, index) {
            var base = "segmentCatalog." + index;
            if (segment.pairKey !== segment.marketId + "::" + segment.segmentId) errors.push(pbrmError("PBRM-CONFIG-REF", base + ".pairKey", "pair identity mismatch"));
            if (!marketIds[segment.marketId]) errors.push(pbrmError("PBRM-CONFIG-REF", base + ".marketId", "market missing"));
            if (!populationIds[segment.populationDefinitionId]) errors.push(pbrmError("PBRM-CONFIG-REF", base + ".populationDefinitionId", "population missing"));
            if (!pairIds[segment.marketId + "::" + segment.comparisonSegmentId]) errors.push(pbrmError("PBRM-CONFIG-REF", base + ".comparisonSegmentId", "comparison segment missing"));
            if (isLuxurySegment(segment.segmentId) && (segment.minimumBedrooms !== luxuryMinBedrooms(segment.segmentId) || segment.rentalType !== "entire-home")) {
                errors.push(pbrmError("PBRM-CONFIG-REF", base + ".qualificationPolicy", "luxury boundary invalid"));
            }
        });
        value.marketProfiles.forEach(function (profile, index) {
            var base = "marketProfiles." + index;
            if (!marketIds[profile.marketId]) errors.push(pbrmError("PBRM-CONFIG-PROFILE", base + ".marketId", "profile market missing"));
            var references = [
                [profile.requiredLegalFieldIds, legalIds, "requiredLegalFieldIds"],
                [profile.requiredVariableCostFieldIds, costIds, "requiredVariableCostFieldIds"],
                [profile.requiredFixedRiskCostFieldIds, costIds, "requiredFixedRiskCostFieldIds"],
                [profile.requiredRiskFieldIds, riskIds, "requiredRiskFieldIds"],
                [profile.premiumAttributeIds, premiumIds, "premiumAttributeIds"]
            ];
            references.forEach(function (entry) {
                if (!Array.isArray(entry[0])) errors.push(pbrmError("PBRM-CONFIG-PROFILE", base + "." + entry[2], "array required"));
                else entry[0].forEach(function (id) {
                    if (!entry[1][id]) errors.push(pbrmError("PBRM-CONFIG-PROFILE", base + "." + entry[2], "profile reference missing"));
                });
            });
        });
        value.legalFieldCatalog.forEach(function (field, index) {
            if (!geographyIds[field.jurisdictionGeographyId]) errors.push(pbrmError("PBRM-CONFIG-PROFILE", "legalFieldCatalog." + index + ".jurisdictionGeographyId", "geography missing"));
        });
        if (JSON.stringify(value.comparisonBasisFields) !== JSON.stringify(BASIS_FIELDS)) {
            errors.push(pbrmError("PBRM-CONFIG-SCHEMA", "comparisonBasisFields", "comparison fields must be exact"));
        }
        if (!isObject(value.bounds)) errors.push(pbrmError("PBRM-CONFIG-SCHEMA", "bounds", "bounds object required"));
        else Object.keys(value.bounds).forEach(function (boundId) {
            var bound = value.bounds[boundId];
            if (!isObject(bound) || !isFiniteNumber(bound.min) || !isFiniteNumber(bound.max) || bound.min > bound.max || !isFiniteNumber(bound.step) || typeof bound.integer !== "boolean") {
                errors.push(pbrmError("PBRM-CONFIG-SCHEMA", "bounds." + boundId, "invalid bound"));
            }
        });
        return validation(errors);
    }

    function indexConfig(config) {
        var copied = deepFreeze(clone(config));
        return deepFreeze({
            contracts: copied.contracts,
            categories: copied.requiredResearchCategoryIds,
            enums: copied.enums,
            freshness: copied.freshness,
            limits: copied.limits,
            bounds: copied.bounds,
            formats: copied.displayFormats,
            comparisonBasisFields: copied.comparisonBasisFields,
            initialUi: copied.initialUi,
            marketsById: asMap(copied.marketCatalog, "marketId"),
            profilesById: asMap(copied.marketProfiles, "profileId"),
            segmentsByPair: asMap(copied.segmentCatalog, "pairKey"),
            geographiesById: asMap(copied.geographyCatalog, "id"),
            populationsById: asMap(copied.populationCatalog, "id"),
            legalFieldsById: asMap(copied.legalFieldCatalog, "id"),
            costFieldsById: asMap(copied.costFieldCatalog, "id"),
            riskFieldsById: asMap(copied.riskFieldCatalog, "id"),
            premiumAttributesById: asMap(copied.premiumAttributeCatalog, "id"),
            sourcePoliciesById: asMap(copied.sourcePolicies, "id"),
            metricDefinitionsById: asMap(copied.metricDefinitions, "id"),
            scenariosById: asMap(copied.scenarioCatalog, "id")
        });
    }

    function evaluateLuxuryQualification(unit, segmentPolicy) {
        var qualification = unit && unit.luxuryQualification;
        if (!qualification || qualification.method === "not-applicable") {
            return deepFreeze({ disposition: "not-applicable", memberResults: [], reasonCodes: [] });
        }
        var policy = segmentPolicy && segmentPolicy.composite;
        var members = Array.isArray(qualification.members) ? qualification.members : [];
        var sampleN = qualification.sample && qualification.sample.sampleN;
        var reasonCodes = [];
        var memberResults = [];
        var sampleUnknown = !isFiniteNumber(sampleN) || !policy || sampleN < policy.minimumSampleSize;
        if (sampleUnknown) reasonCodes.push("SAMPLE_SIZE");
        members.forEach(function (member, index) {
            var memberReasons = [];
            var unknown = false;
            if (!isFiniteNumber(member.bedrooms)) unknown = true;
            else if (member.bedrooms < segmentPolicy.minimumBedrooms) memberReasons.push("BEDROOMS");
            if (typeof member.rentalType !== "string") unknown = true;
            else if (member.rentalType !== segmentPolicy.rentalType) memberReasons.push("RENTAL_TYPE");
            if (!isFiniteNumber(member.squareFeet)) unknown = true;
            else if (member.squareFeet < policy.minimumSquareFeet) memberReasons.push("SQUARE_FEET");
            var premiumIds = Array.isArray(member.premiumAttributeIds) ? member.premiumAttributeIds : [];
            if (premiumIds.length < policy.minimumPremiumAttributes) memberReasons.push("PREMIUM_ATTRIBUTES");
            if (!isFiniteNumber(member.sampleMeasure) || !isFiniteNumber(qualification.composite && qualification.composite.samplePercentileValue)) unknown = true;
            else if (member.sampleMeasure < qualification.composite.samplePercentileValue) memberReasons.push("PERCENTILE");
            var disposition = memberReasons.length ? "not-qualified" : ((unknown || sampleUnknown) ? "unknown" : "qualified");
            memberReasons.forEach(function (reason) { if (reasonCodes.indexOf(reason) === -1) reasonCodes.push(reason); });
            memberResults.push({ index: index, disposition: disposition, reasonCodes: memberReasons });
        });
        var disposition;
        if (sampleUnknown) disposition = "unknown";
        else if (!memberResults.length) disposition = "unknown";
        else if (memberResults.some(function (entry) { return entry.disposition === "qualified"; })) disposition = "qualified";
        else if (memberResults.some(function (entry) { return entry.disposition === "unknown"; })) disposition = "unknown";
        else disposition = "not-qualified";
        return deepFreeze({ disposition: disposition, memberResults: memberResults, reasonCodes: reasonCodes });
    }

    function computeCoverage(segmentCoverage, qualificationResult, _configIndex) {
        var samples = segmentCoverage && Array.isArray(segmentCoverage.metricSamples) ? segmentCoverage.metricSamples : [];
        var sample = samples.length ? samples[0] : null;
        var denominator = sample && sample.qualifyingDenominator;
        var sampleN = sample && sample.sampleN;
        var ratio = null;
        if (isFiniteNumber(denominator) && denominator > 0 && isFiniteNumber(sampleN) && sampleN >= 0 && sampleN <= denominator) ratio = sampleN / denominator;
        return deepFreeze({
            state: segmentCoverage && segmentCoverage.state ? segmentCoverage.state : "unknown",
            candidateCount: segmentCoverage && segmentCoverage.candidateCount ? segmentCoverage.candidateCount.value : null,
            qualifyingCount: segmentCoverage && segmentCoverage.qualifyingCount ? segmentCoverage.qualifyingCount.value : null,
            metricSampleN: sampleN === undefined ? null : sampleN,
            qualifyingDenominator: denominator === undefined ? null : denominator,
            coverageRatio: ratio,
            intersectionMethod: segmentCoverage && segmentCoverage.intersection ? segmentCoverage.intersection.method : "unknown",
            missingFieldIds: segmentCoverage && Array.isArray(segmentCoverage.missingFieldIds) ? segmentCoverage.missingFieldIds.slice() : [],
            confidenceConsequence: segmentCoverage && segmentCoverage.confidenceConsequence ? segmentCoverage.confidenceConsequence : "Coverage unknown.",
            qualificationDisposition: qualificationResult && qualificationResult.disposition ? qualificationResult.disposition : "unknown",
            independentMarginalsUsed: []
        });
    }

    function validateMarketPayload(value, configIndex, expectedMarketId) {
        var errors = [];
        if (!exactKeys(value, PAYLOAD_KEYS, "PBRM-PAYLOAD-SCHEMA", "", errors)) return validation(errors);
        if (value.schemaVersion !== configIndex.contracts.marketPayload) errors.push(pbrmError("PBRM-PAYLOAD-VERSION", "schemaVersion", "unsupported payload schema"));
        if (value.configVersion !== undefined && typeof value.configVersion !== "string") errors.push(pbrmError("PBRM-PAYLOAD-VERSION", "configVersion", "config version required"));
        if (value.formulaVersion !== configIndex.contracts.formula || value.researchMethodVersion !== configIndex.contracts.researchMethod || value.changeAccountingVersion !== configIndex.contracts.changeAccounting) {
            errors.push(pbrmError("PBRM-PAYLOAD-VERSION", "formulaVersion", "payload contract version mismatch"));
        }
        if (value.marketId !== expectedMarketId || !configIndex.marketsById.has(expectedMarketId)) errors.push(pbrmError("PBRM-PAYLOAD-MARKET", "marketId", "payload market mismatch"));
        if (!Array.isArray(value.units)) {
            errors.push(pbrmError("PBRM-PAYLOAD-SCHEMA", "units", "units array required"));
            return validation(errors);
        }
        var seenSegments = Object.create(null);
        value.units.forEach(function (unit, unitIndex) {
            var unitPath = "units." + unitIndex;
            if (!isObject(unit)) {
                errors.push(pbrmError("PBRM-PAYLOAD-SCHEMA", unitPath, "unit object required"));
                return;
            }
            var expectedPair = expectedMarketId + "::" + unit.segmentId;
            if (unit.marketId !== expectedMarketId || unit.pairKey !== expectedPair || typeof unit.unitId !== "string" || unit.unitId.indexOf("unit:" + expectedMarketId + ":" + unit.segmentId + ":") !== 0) {
                errors.push(pbrmError("PBRM-PAYLOAD-PAIR-LEAK", unitPath + ".pairKey", "unit crosses market or pair boundary"));
            }
            exactKeys(unit, UNIT_KEYS, "PBRM-PAYLOAD-SCHEMA", unitPath, errors);
            if (unit.contractVersion !== configIndex.contracts.unit) errors.push(pbrmError("PBRM-PAYLOAD-VERSION", unitPath + ".contractVersion", "unit contract mismatch"));
            if (!configIndex.segmentsByPair.has(unit.pairKey)) errors.push(pbrmError("PBRM-PAYLOAD-PAIR-LEAK", unitPath + ".pairKey", "unit pair is not configured"));
            if (seenSegments[unit.segmentId]) errors.push(pbrmError("PBRM-PAYLOAD-SCHEMA", unitPath + ".segmentId", "duplicate segment"));
            seenSegments[unit.segmentId] = true;
            if (!Array.isArray(unit.categoryCoverage)) errors.push(pbrmError("PBRM-PAYLOAD-CATEGORY", unitPath + ".categoryCoverage", "category coverage required"));
            else {
                var categoryIds = unit.categoryCoverage.map(function (entry) { return entry.categoryId; });
                if (categoryIds.length !== configIndex.categories.length || configIndex.categories.some(function (id) { return categoryIds.indexOf(id) === -1; })) {
                    errors.push(pbrmError("PBRM-PAYLOAD-CATEGORY", unitPath + ".categoryCoverage", "all categories required exactly once"));
                }
            }
            var segment = configIndex.segmentsByPair.get(unit.pairKey);
            if (segment && isLuxurySegment(unit.segmentId) && unit.luxuryQualification) {
                var qualification = evaluateLuxuryQualification(unit, segment.qualificationPolicy);
                if (unit.luxuryQualification.disposition !== qualification.disposition) errors.push(pbrmError("PBRM-PAYLOAD-QUALIFICATION", unitPath + ".luxuryQualification.disposition", "qualification disposition mismatch"));
            }
            if (Array.isArray(unit.sources)) unit.sources.forEach(function (source, sourceIndex) {
                var sourceResult = safeSourceUrl(source.url);
                if (!sourceResult.ok) errors.push(pbrmError("PBRM-PAYLOAD-RIGHTS", unitPath + ".sources." + sourceIndex + ".url", "unsafe source URL"));
            });
            if (Array.isArray(unit.metricObservations)) unit.metricObservations.forEach(function (observation, metricIndex) {
                var metricPath = unitPath + ".metricObservations." + metricIndex;
                if (observation.marketId !== unit.marketId || observation.segmentId !== unit.segmentId || (typeof observation.id === "string" && observation.id.indexOf("metric:" + unit.marketId + ":" + unit.segmentId + ":") !== 0)) {
                    errors.push(pbrmError("PBRM-PAYLOAD-PAIR-LEAK", metricPath, "metric crosses pair boundary"));
                }
                if (isLuxurySegment(unit.segmentId) && observation.evidenceClass === "observed") {
                    var definition = configIndex.metricDefinitionsById.get(observation.metricDefinitionId);
                    var wrongDefinition = !definition || !Array.isArray(definition.segmentApplicability) || definition.segmentApplicability.indexOf(unit.segmentId) === -1;
                    var wrongPopulation = observation.populationId !== segment.populationDefinitionId;
                    var wrongQualification = observation.qualificationSignature === "not-applicable";
                    if (wrongDefinition || wrongPopulation || wrongQualification) errors.push(pbrmError("PBRM-PAYLOAD-BROAD-LUXURY-SUBSTITUTION", metricPath, "broad evidence cannot populate observed luxury performance"));
                }
            });
            var pairArrays = ["sources", "claims", "metricObservations", "definitionConflicts", "forecastMethods", "series", "annualSyntheses", "scenarios", "legalFacts", "drivers", "unknowns"];
            pairArrays.forEach(function (arrayName) {
                if (!Array.isArray(unit[arrayName])) return;
                unit[arrayName].forEach(function (record, recordIndex) {
                    if (record && typeof record.id === "string" && record.id.indexOf(":" + unit.marketId + ":" + unit.segmentId + ":") === -1) {
                        errors.push(pbrmError("PBRM-PAYLOAD-PAIR-LEAK", unitPath + "." + arrayName + "." + recordIndex + ".id", "record id is not pair-local"));
                    }
                });
            });
        });
        mandatorySegmentsForMarket(expectedMarketId).forEach(function (segmentId) {
            if (!seenSegments[segmentId]) errors.push(pbrmError("PBRM-PAYLOAD-SCHEMA", "units", "mandatory segment missing"));
        });
        if (value.units.length !== MANDATORY_SEGMENTS.length) errors.push(pbrmError("PBRM-PAYLOAD-SCHEMA", "units", "exactly two mandatory units required"));
        return validation(errors);
    }
    validateMarketPayload.safeSourceUrl = safeSourceUrl;

    function indexMarketPayload(payload, configIndex) {
        var copied = deepFreeze(clone(payload));
        var unitsByPair = asMap(copied.units, "pairKey");
        var sourcesById = new Map();
        var claimsById = new Map();
        var metricsById = new Map();
        var scenariosById = new Map();
        copied.units.forEach(function (unit) {
            unit.sources.forEach(function (record) { sourcesById.set(record.id, record); });
            unit.claims.forEach(function (record) { claimsById.set(record.id, record); });
            unit.metricObservations.forEach(function (record) { metricsById.set(record.id, record); });
            unit.scenarios.forEach(function (record) { scenariosById.set(record.id, record); });
        });
        return deepFreeze({
            market: configIndex.marketsById.get(copied.marketId),
            payload: copied,
            unitsByPair: unitsByPair,
            sourcesById: Object.freeze(sourcesById),
            claimsById: Object.freeze(claimsById),
            metricsById: Object.freeze(metricsById),
            scenariosById: Object.freeze(scenariosById)
        });
    }

    function resolvePairMetricDefinition(configIndex, segment, family) {
        var matches = [];
        if (configIndex && configIndex.metricDefinitionsById && segment && typeof family === "string" && family) {
            configIndex.metricDefinitionsById.forEach(function (definition) {
                if (definition.family === family &&
                    definition.populationId === segment.populationDefinitionId &&
                    Array.isArray(definition.segmentApplicability) &&
                    definition.segmentApplicability.indexOf(segment.segmentId) !== -1) {
                    matches.push(definition);
                }
            });
        }
        if (matches.length !== 1) {
            var error = new Error("exactly one pair metric definition required");
            error.code = "PBRM-CONFIG-METRIC-DEFINITION";
            error.path = "metricDefinitions." + (segment && segment.pairKey ? segment.pairKey : "unknown") + "." + family;
            throw error;
        }
        return matches[0];
    }

    function buildBasisSignature(observation, _unit, _configIndex) {
        var signature = { contractVersion: BASIS_CONTRACT };
        BASIS_FIELDS.forEach(function (field) {
            if (field === "periodStart") signature[field] = own(observation, field) ? observation[field] : (observation.period && observation.period.start);
            else if (field === "periodEnd") signature[field] = own(observation, field) ? observation[field] : (observation.period && observation.period.end);
            else signature[field] = own(observation, field) ? observation[field] : null;
        });
        signature.sha256 = contracts.contentSha256(signature, BASIS_CONTRACT);
        return deepFreeze(signature);
    }

    function cleanNumber(value) {
        return Number(value.toPrecision(15));
    }

    function compareAligned(left, right) {
        var reasons = [];
        BASIS_FIELDS.forEach(function (field) {
            if (left[field] !== right[field] && reasons.indexOf(BASIS_REASONS[field]) === -1) reasons.push(BASIS_REASONS[field]);
        });
        if (!isFiniteNumber(left.value) || !isFiniteNumber(right.value)) reasons.push("MISSING_VALUE");
        if (reasons.length) {
            return deepFreeze({ state: "INCOMPARABLE", leftSignature: left, rightSignature: right, mismatchReasons: reasons, absoluteDelta: null, percentDelta: null, percentUnavailableReason: null, ranking: null });
        }
        var delta = cleanNumber(right.value - left.value);
        return deepFreeze({
            state: "COMPARABLE",
            leftSignature: left,
            rightSignature: right,
            mismatchReasons: [],
            absoluteDelta: delta,
            percentDelta: left.value === 0 ? null : cleanNumber(delta / left.value),
            percentUnavailableReason: left.value === 0 ? "ZERO_BASELINE" : null,
            ranking: null
        });
    }

    function modelFailure(code, path) {
        return { ok: false, errors: [pbrmError(code, path || "model", code)] };
    }

    function computeAdjustedOccupancy(base, demandDelta, supplyDelta) {
        if (!isFiniteNumber(base) || !isFiniteNumber(demandDelta) || !isFiniteNumber(supplyDelta)) return modelFailure("PBRM-MODEL-NONFINITE", "occupancy");
        var denominator = 1 + supplyDelta;
        if (!Number.isFinite(denominator) || denominator <= 0) return modelFailure("PBRM-MODEL-OCCUPANCY-DENOMINATOR", "supplyDelta");
        return { ok: true, value: Math.min(1, Math.max(0, base * (1 + demandDelta) / denominator)), errors: [] };
    }

    function computeEffectiveAvailableNights(availableNights, downtime) {
        if (!Number.isInteger(availableNights) || availableNights < 0 || !isObject(downtime) || !Array.isArray(downtime.items)) return modelFailure("PBRM-MODEL-DOWNTIME", "downtime");
        var unionCount = 0;
        if (downtime.method === "explicit-disjoint-days") {
            var ids = Object.create(null);
            for (var index = 0; index < downtime.items.length; index += 1) {
                var item = downtime.items[index];
                if (!item || typeof item.riskFieldId !== "string" || ids[item.riskFieldId] || !Number.isInteger(item.days) || item.days < 0 || item.disjointWithAllOthers !== true) return modelFailure("PBRM-MODEL-DOWNTIME", "downtime.items." + index);
                ids[item.riskFieldId] = true;
                unionCount += item.days;
            }
        } else if (downtime.method === "calendar-day-union") {
            var dates = Object.create(null);
            var categoryIds = Object.create(null);
            for (var itemIndex = 0; itemIndex < downtime.items.length; itemIndex += 1) {
                var dateItem = downtime.items[itemIndex];
                if (!dateItem || typeof dateItem.riskFieldId !== "string" || categoryIds[dateItem.riskFieldId] || !Array.isArray(dateItem.dates)) return modelFailure("PBRM-MODEL-DOWNTIME", "downtime.items." + itemIndex);
                categoryIds[dateItem.riskFieldId] = true;
                for (var dateIndex = 0; dateIndex < dateItem.dates.length; dateIndex += 1) {
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateItem.dates[dateIndex])) return modelFailure("PBRM-MODEL-DOWNTIME", "downtime.items." + itemIndex + ".dates." + dateIndex);
                    dates[dateItem.dates[dateIndex]] = true;
                }
            }
            unionCount = Object.keys(dates).length;
        } else return modelFailure("PBRM-MODEL-DOWNTIME", "downtime.method");
        if (unionCount > availableNights) return modelFailure("PBRM-MODEL-DOWNTIME", "downtime");
        return { ok: true, value: Math.max(0, availableNights - unionCount), downtimeUnionDays: unionCount, errors: [] };
    }

    function computeMonthlyPayment(principal, annualRate, termYears) {
        if (!isFiniteNumber(principal) || principal < 0 || !isFiniteNumber(annualRate) || annualRate < 0 || !Number.isInteger(termYears) || termYears <= 0) return modelFailure("PBRM-MODEL-PAYMENT", "payment");
        var payments = termYears * 12;
        var monthlyRate = annualRate / 12;
        var monthly;
        var branch;
        if (monthlyRate === 0) {
            monthly = principal / payments;
            branch = "zero-rate";
        } else {
            var power = Math.pow(1 + monthlyRate, payments);
            var denominator = power - 1;
            if (!Number.isFinite(power) || !Number.isFinite(denominator) || denominator <= 0) return modelFailure("PBRM-MODEL-PAYMENT", "payment.denominator");
            monthly = principal * monthlyRate * power / denominator;
            branch = "amortizing";
        }
        if (!Number.isFinite(monthly)) return modelFailure("PBRM-MODEL-PAYMENT", "payment.monthly");
        return { ok: true, branch: branch, monthlyPaymentUsd: monthly, annualDebtServiceUsd: monthly * 12, paymentCount: payments, errors: [] };
    }

    function normalizeUserAssumptions(candidate, pairContext) {
        if (!isObject(candidate)) return modelFailure("PBRM-MODEL-NONFINITE", "assumptions");
        var actualKeys = Object.keys(candidate);
        for (var keyIndex = 0; keyIndex < actualKeys.length; keyIndex += 1) {
            if (ASSUMPTION_KEYS.indexOf(actualKeys[keyIndex]) === -1 && OPTIONAL_ASSUMPTION_KEYS.indexOf(actualKeys[keyIndex]) === -1) {
                return modelFailure("PBRM-MODEL-IDENTITY", "assumptions." + actualKeys[keyIndex]);
            }
        }
        for (var requiredKeyIndex = 0; requiredKeyIndex < ASSUMPTION_KEYS.length; requiredKeyIndex += 1) {
            if (!own(candidate, ASSUMPTION_KEYS[requiredKeyIndex])) {
                return modelFailure("PBRM-MODEL-IDENTITY", "assumptions." + ASSUMPTION_KEYS[requiredKeyIndex]);
            }
        }
        var copied = clone(candidate);
        if (copied.contractVersion !== ASSUMPTIONS_CONTRACT || copied.marketId !== pairContext.marketId || copied.segmentId !== pairContext.segmentId || copied.pairKey !== pairContext.pairKey || copied.unitId !== pairContext.unitId || copied.scenarioId !== pairContext.scenarioId) {
            return modelFailure("PBRM-MODEL-IDENTITY", "assumptions");
        }
        var numeric = ["demandDelta", "supplyDelta", "adrShock", "purchasePriceUsd", "leverageRatio", "downPaymentRatio", "annualMortgageRate", "loanTermYears", "variableOperatingExpenseRatio"];
        for (var index = 0; index < numeric.length; index += 1) {
            if (!isFiniteNumber(copied[numeric[index]])) return modelFailure("PBRM-MODEL-NONFINITE", "assumptions." + numeric[index]);
            var bound = pairContext.bounds && pairContext.bounds[numeric[index]];
            if (bound && (copied[numeric[index]] < bound.min || copied[numeric[index]] > bound.max || (bound.integer && !Number.isInteger(copied[numeric[index]])))) {
                return modelFailure("PBRM-MODEL-BOUNDS", "assumptions." + numeric[index]);
            }
        }
        for (var optionalIndex = 0; optionalIndex < OPTIONAL_ASSUMPTION_KEYS.length; optionalIndex += 1) {
            var optionalKey = OPTIONAL_ASSUMPTION_KEYS[optionalIndex];
            if (!own(copied, optionalKey)) continue;
            if (!isFiniteNumber(copied[optionalKey])) return modelFailure("PBRM-MODEL-NONFINITE", "assumptions." + optionalKey);
            var optionalBound = pairContext.bounds && pairContext.bounds[optionalKey];
            if (optionalBound && (copied[optionalKey] < optionalBound.min || copied[optionalKey] > optionalBound.max || (optionalBound.integer && !Number.isInteger(copied[optionalKey])))) {
                return modelFailure("PBRM-MODEL-BOUNDS", "assumptions." + optionalKey);
            }
        }
        if (Math.abs((copied.leverageRatio + copied.downPaymentRatio) - 1) > Number.EPSILON * 16) return modelFailure("PBRM-MODEL-BOUNDS", "assumptions.leverageRatio");
        if (!Array.isArray(copied.fixedRiskCosts)) return modelFailure("PBRM-MODEL-COST-INCOMPLETE", "assumptions.fixedRiskCosts");
        return { ok: true, value: deepFreeze(copied), errors: [] };
    }

    function computeRentalResult(pairContext, assumptions) {
        var normalized = normalizeUserAssumptions(assumptions, pairContext);
        if (!normalized.ok) return normalized;
        var value = normalized.value;
        var baseOccupancy = own(value, "baseOccupancy") ? value.baseOccupancy : pairContext.baseOccupancy;
        var baseAdrUsd = own(value, "baseAdrUsd") ? value.baseAdrUsd : pairContext.baseAdrUsd;
        var availableNights = own(value, "availableNights") ? value.availableNights : pairContext.availableNights;
        if (!isFiniteNumber(baseOccupancy) || !isFiniteNumber(baseAdrUsd)) return modelFailure("PBRM-MODEL-BASE-INPUT-REQUIRED", "pairContext");
        var occupancy = computeAdjustedOccupancy(baseOccupancy, value.demandDelta, value.supplyDelta);
        if (!occupancy.ok) return occupancy;
        var nights = computeEffectiveAvailableNights(availableNights, value.downtime);
        if (!nights.ok) return nights;
        var adjustedAdr = baseAdrUsd * (1 + value.adrShock);
        if (!Number.isFinite(adjustedAdr) || adjustedAdr < 0) return modelFailure("PBRM-MODEL-ADR", "assumptions.adrShock");
        if (value.purchasePriceUsd <= 0 || value.leverageRatio < 0 || value.leverageRatio > 1 || value.variableOperatingExpenseRatio < 0 || value.variableOperatingExpenseRatio > 1) return modelFailure("PBRM-MODEL-BOUNDS", "assumptions");
        var principal = value.purchasePriceUsd * value.leverageRatio;
        var payment = computeMonthlyPayment(principal, value.annualMortgageRate, value.loanTermYears);
        if (!payment.ok) return payment;
        var adjustedRevpar = occupancy.value * adjustedAdr;
        var grossRevenue = adjustedRevpar * nights.value;
        var variableCost = grossRevenue * value.variableOperatingExpenseRatio;
        var fixedById = Object.create(null);
        var fixedSum = 0;
        for (var costIndex = 0; costIndex < value.fixedRiskCosts.length; costIndex += 1) {
            var line = value.fixedRiskCosts[costIndex];
            if (!line || typeof line.costFieldId !== "string" || fixedById[line.costFieldId] || !isFiniteNumber(line.annualUsd) || line.annualUsd < 0) return modelFailure("PBRM-MODEL-COST-INCOMPLETE", "assumptions.fixedRiskCosts." + costIndex);
            fixedById[line.costFieldId] = line.annualUsd;
            fixedSum += line.annualUsd;
        }
        var required = Array.isArray(pairContext.requiredFixedRiskCostFieldIds) ? pairContext.requiredFixedRiskCostFieldIds : [];
        var missing = required.filter(function (id) { return !own(fixedById, id); });
        var complete = missing.length === 0;
        var totalCost = complete ? variableCost + fixedSum : null;
        var cashFlow = complete ? grossRevenue - totalCost - payment.annualDebtServiceUsd : null;
        var result = {
            contractVersion: RESULT_CONTRACT,
            formulaVersion: pairContext.formulaVersion,
            marketId: pairContext.marketId,
            segmentId: pairContext.segmentId,
            pairKey: pairContext.pairKey,
            unitId: pairContext.unitId,
            scenarioId: pairContext.scenarioId,
            adjustedOccupancy: occupancy.value,
            adjustedAdrUsd: adjustedAdr,
            adjustedRevparUsd: adjustedRevpar,
            effectiveAvailableNights: nights.value,
            downtimeUnionDays: nights.downtimeUnionDays,
            grossRevenueUsd: grossRevenue,
            grossYield: grossRevenue / value.purchasePriceUsd,
            loanPrincipalUsd: principal,
            paymentBranch: payment.branch,
            monthlyPaymentUsd: payment.monthlyPaymentUsd,
            annualDebtServiceUsd: payment.annualDebtServiceUsd,
            variableOperatingCostUsd: variableCost,
            fixedRiskCostUsd: complete ? fixedSum : null,
            totalOperatingCostUsd: totalCost,
            preTaxCashFlowUsd: cashFlow,
            economicsState: complete ? "COMPLETE" : "INCOMPLETE",
            missingCostFieldIds: missing,
            errors: complete ? [] : [pbrmError("PBRM-MODEL-COST-INCOMPLETE", "fixedRiskCosts", "required cost missing")]
        };
        return { ok: true, result: deepFreeze(result), errors: result.errors };
    }

    function resultIdentity(input) {
        var identity = {
            contractVersion: input.contractVersion,
            formulaVersion: input.formulaVersion,
            marketId: input.marketId,
            segmentId: input.segmentId,
            pairKey: input.pairKey,
            unitId: input.unitId,
            scenarioId: input.scenarioId,
            acquisitionBaselineId: input.acquisitionBaselineId,
            variableCostBaselineId: input.variableCostBaselineId,
            fixedRiskCostBaselineId: input.fixedRiskCostBaselineId,
            riskAssumptionBaselineId: input.riskAssumptionBaselineId,
            validatedUserAssumptions: input.validatedUserAssumptions
        };
        return contracts.contentSha256(identity, RESULT_CONTRACT);
    }

    function buildToolRead(viewModel, computedAt) {
        var result = viewModel.result || {};
        var metrics = {
            contractVersion: INNER_READ_CONTRACT,
            marketId: viewModel.pair.marketId,
            segmentId: viewModel.pair.segmentId,
            pairKey: viewModel.pair.pairKey,
            unitId: viewModel.pair.unitId,
            researchState: viewModel.truth.state,
            coverageState: viewModel.coverage.state,
            qualificationDisposition: viewModel.qualification.disposition,
            phase: viewModel.thesis.phase,
            direction: viewModel.thesis.direction,
            confidencePct: viewModel.thesis.confidencePct,
            selectedYear: viewModel.scenario.year,
            scenarioId: viewModel.scenario.id,
            resultId: viewModel.resultId,
            economicsState: result.economicsState || "UNAVAILABLE",
            materialCaveatClaimId: null,
            omittedMetrics: [],
            modelErrorCodes: [],
            missingCostFieldIds: Array.isArray(result.missingCostFieldIds) ? result.missingCostFieldIds.slice() : []
        };
        var numeric = ["adjustedOccupancy", "adjustedAdrUsd", "adjustedRevparUsd", "effectiveAvailableNights", "grossRevenueUsd", "grossYield", "annualDebtServiceUsd", "variableOperatingCostUsd", "fixedRiskCostUsd", "totalOperatingCostUsd", "preTaxCashFlowUsd"];
        numeric.forEach(function (key) {
            if (isFiniteNumber(result[key])) metrics[key] = result[key];
            else metrics.omittedMetrics.push(key);
        });
        var allErrors = [];
        if (Array.isArray(viewModel.errors)) allErrors = allErrors.concat(viewModel.errors);
        if (Array.isArray(result.errors)) allErrors = allErrors.concat(result.errors);
        metrics.modelErrorCodes = allErrors.map(function (entry) { return entry.code; }).filter(function (code, index, values) { return values.indexOf(code) === index; });
        var deepLink = viewModel.route.path + "?segment=" + encodeURIComponent(viewModel.pair.segmentId) + "&mode=simple&year=" + encodeURIComponent(viewModel.scenario.year) + "&scenario=" + encodeURIComponent(viewModel.scenario.id) + "#decision";
        var readParts = ["research " + viewModel.truth.state, "coverage " + viewModel.coverage.state];
        if (viewModel.qualification && viewModel.qualification.disposition && viewModel.qualification.disposition !== "not-applicable") {
            readParts.push("luxury-qualification " + viewModel.qualification.disposition);
        }
        if (viewModel.thesis && viewModel.thesis.phase && viewModel.thesis.phase !== "unavailable") {
            readParts.push("cycle " + viewModel.thesis.phase + "/" + viewModel.thesis.direction + " " + viewModel.thesis.confidencePct + "% confidence");
        }
        if (isFiniteNumber(result.preTaxCashFlowUsd)) {
            readParts.push("pre-tax cash flow $" + Math.round(result.preTaxCashFlowUsd));
        } else {
            readParts.push("economics " + (result.economicsState || "UNAVAILABLE"));
        }
        return deepFreeze({
            contractVersion: OUTER_READ_CONTRACT,
            id: viewModel.route.toolId,
            asOf: viewModel.truth.asOf,
            freshUntil: viewModel.truth.freshUntil,
            availability: viewModel.truth.state === "current" ? "current" : (viewModel.truth.state === "stale" ? "stale" : "unavailable"),
            read: viewModel.pair.marketId + " · " + viewModel.pair.segmentId + " — " + readParts.join("; "),
            metrics: metrics,
            deepLink: deepLink,
            computedAt: computedAt
        });
    }

    function buildViewModel(input) {
        var model = {
            contractVersion: VIEW_MODEL_CONTRACT,
            route: input.route,
            pair: input.pair,
            truth: input.truth,
            coverage: input.coverage,
            qualification: input.qualification,
            thesis: input.thesis,
            scenario: input.scenario,
            assumptions: input.assumptions,
            result: input.result,
            resultId: input.resultId,
            costCompleteness: input.costCompleteness,
            comparison: input.comparison,
            researchSections: input.researchSections || [],
            marketProfileSections: input.marketProfileSections || [],
            sourceInspectorIndex: input.sourceInspectorIndex || {},
            ownerRead: input.ownerRead || null,
            errors: input.errors || [],
            renderDigest: null
        };
        var digestInput = clone(model);
        delete digestInput.ownerRead;
        delete digestInput.renderDigest;
        model.renderDigest = contracts.contentSha256(digestInput, VIEW_MODEL_CONTRACT);
        return deepFreeze(model);
    }

    function auditText(value) {
        if (value === null || value === undefined || value === "") return "NONE";
        return String(value).replace(/\s+/g, " ").replace(/\|/g, "/").trim();
    }

    function auditList(values) {
        return Array.isArray(values) && values.length ? values.map(auditText).join(",") : "NONE";
    }

    function auditNumber(value, unavailable) {
        return isFiniteNumber(value) ? String(value) : (unavailable || "UNKNOWN");
    }

    function auditMaterialIdentities(unit) {
        var identities = [
            "thesis:" + unit.thesis.id,
            "coverage:coverage:" + unit.marketId + ":" + unit.segmentId + ":segment",
            "acquisition-sample:" + unit.acquisitionSample.sampleId,
            "acquisition-baseline:" + unit.acquisitionBaseline.baselineId,
            "risk-assumption:" + unit.riskAssumptionBaseline.baselineId
        ];
        [
            ["claim", unit.claims], ["source", unit.sources],
            ["metric-observation", unit.metricObservations], ["legal-fact", unit.legalFacts],
            ["driver", unit.drivers], ["forecast-method", unit.forecastMethods],
            ["scenario", unit.scenarios], ["unknown", unit.unknowns]
        ].forEach(function (group) {
            group[1].forEach(function (record) { identities.push(group[0] + ":" + record.id); });
        });
        unit.luxuryQualification.members.forEach(function (member) {
            identities.push("qualification-member:" + member.memberId);
        });
        unit.acquisitionSample.memberIds.forEach(function (memberId) {
            identities.push("sample-member:" + memberId);
        });
        unit.variableCostBaseline.components.concat(unit.fixedRiskCostBaseline.lines).forEach(function (line) {
            var parts = line.costFieldId.split(":");
            identities.push("cost-line:cost-line:" + unit.marketId + ":" + unit.segmentId + ":" + parts[parts.length - 1]);
        });
        return identities;
    }

    function buildResearchAuditProjection(configIndex, payloadIndexes) {
        if (!configIndex || !configIndex.marketsById || !payloadIndexes) {
            throw Object.assign(new Error("validated research indexes required"), { code: "PBRM-AUDIT-INPUT" });
        }
        var payloadEntries = [];
        configIndex.marketsById.forEach(function (_market, marketId) {
            if (payloadIndexes[marketId] && payloadIndexes[marketId].payload) {
                payloadEntries.push({ marketId: marketId, index: payloadIndexes[marketId] });
            }
        });
        if (!payloadEntries.length) {
            throw Object.assign(new Error("validated research payloads required"), { code: "PBRM-AUDIT-INPUT" });
        }
        var units = [];
        payloadEntries.forEach(function (entry) {
            entry.index.payload.units.forEach(function (unit) {
                units.push({ unit: unit, payload: entry.index.payload, index: entry.index });
            });
        });
        var fixtureAuthority = payloadEntries.some(function (entry) {
            var payload = entry.index.payload;
            return /TEST[- ]FIXTURE/i.test([payload.configVersion, payload.payloadId, payload.educationalDisclosure].join(" "));
        });

        var inventoryLines = [
            "authority=" + (fixtureAuthority ? "TEST FIXTURE SYNTHETIC" : "PRODUCTION RESEARCH PROPOSAL"),
            "publication=" + (fixtureAuthority ? "DISABLED" : "UNCOMMITTED FOR REVIEW"),
            "markets=" + payloadEntries.length,
            "units=" + units.length
        ];
        units.forEach(function (entry) {
            var unit = entry.unit;
            var categoryStates = Object.create(null);
            unit.categoryCoverage.forEach(function (category) {
                categoryStates[category.state] = (categoryStates[category.state] || 0) + 1;
            });
            var stateReceipt = Object.keys(categoryStates).sort().map(function (state) {
                return state + ":" + categoryStates[state];
            }).join(",");
            inventoryLines.push("pair=" + unit.pairKey +
                " | unitId=" + unit.unitId +
                " | categories=" + unit.categoryCoverage.length + "/" + configIndex.categories.length +
                " | categoryStates=" + stateReceipt);
        });

        var changeLines = [];
        units.forEach(function (entry) {
            var unit = entry.unit;
            var pairToken = ":" + unit.marketId + ":" + unit.segmentId + ":";
            var records = unit.changes.records;
            var pairOwned = records.every(function (record) {
                return typeof record.id === "string" && record.id.indexOf(pairToken) !== -1 &&
                    typeof record.entityId === "string" && record.entityId.indexOf(pairToken) !== -1;
            });
            var materialIdentities = [];
            records.forEach(function (record) {
                var identity = record.entityType + ":" + record.entityId;
                if (materialIdentities.indexOf(identity) === -1) materialIdentities.push(identity);
            });
            var expectedMaterialIdentities = auditMaterialIdentities(unit);
            var accountingComplete = unit.prior.mode === "compared" &&
                materialIdentities.length === records.length &&
                materialIdentities.length === expectedMaterialIdentities.length &&
                expectedMaterialIdentities.every(function (identity) { return materialIdentities.indexOf(identity) !== -1; });
            changeLines.push("pair=" + unit.pairKey +
                " | priorMode=" + unit.prior.mode +
                " | priorUnitId=" + auditText(unit.prior.unitId) +
                " | priorResearchedAt=" + auditText(unit.prior.researchedAt) +
                " | priorGitBlobOid=" + auditText(unit.prior.gitBlobOid) +
                " | changeMode=" + unit.changes.mode +
                " | priorUnitMatch=" + (unit.prior.mode === "compared" ? String(unit.changes.priorUnitId === unit.prior.unitId) : "NOT APPLICABLE") +
                " | changeRecords=" + records.length +
                " | materialEntities=" + materialIdentities.length +
                " | expectedMaterialEntities=" + expectedMaterialIdentities.length +
                " | complete=" + (unit.prior.mode === "compared" ? accountingComplete : "NOT APPLICABLE") +
                " | entityTypes=" + auditList(records.map(function (record) { return record.entityType; }).filter(function (value, index, values) { return values.indexOf(value) === index; })) +
                " | pairOwned=" + pairOwned +
                " | priorRelativeClaims=" + unit.thesis.changeViewClaimIds.length);
        });

        var attemptLines = [];
        units.forEach(function (entry) {
            var unit = entry.unit;
            var attempts = Object.create(null);
            unit.categoryCoverage.forEach(function (category) {
                category.attemptedSourceIds.forEach(function (sourceId) {
                    if (!attempts[sourceId]) attempts[sourceId] = { categories: [], consequences: [] };
                    attempts[sourceId].categories.push(category.categoryId);
                    attempts[sourceId].consequences.push(category.consequence);
                });
            });
            Object.keys(attempts).sort().forEach(function (sourceId) {
                var source = entry.index.sourcesById.get(sourceId);
                var positiveSubstitution = unit.claims.concat(unit.metricObservations).some(function (record) {
                    return Array.isArray(record.sourceRefs) && record.sourceRefs.some(function (reference) {
                        return reference.sourceId === sourceId && reference.role !== "attempt";
                    });
                });
                var numericAbsent = source && source.rights && source.rights.numericValueAllowed === false && !own(source, "value");
                attemptLines.push("pair=" + unit.pairKey +
                    " | categories=" + auditList(attempts[sourceId].categories) +
                    " | source=" + sourceId +
                    " | state=" + (source ? source.state : "missing") +
                    " | context=" + (source ? auditText(source.title) + " / " + auditText(source.access && source.access.note) : "UNRESOLVED") +
                    " | consequence=" + auditList(attempts[sourceId].consequences) +
                    " | numericValue=" + (numericAbsent ? "ABSENT" : "UNRESOLVED") +
                    " | positiveSubstitution=" + positiveSubstitution);
            });
        });
        if (!attemptLines.length) attemptLines.push("attempts=0 | numericValue=ABSENT | positiveSubstitution=false");

        var claims = [];
        var scenarios = [];
        units.forEach(function (entry) {
            entry.unit.claims.forEach(function (claim) { claims.push(claim); });
            entry.unit.scenarios.forEach(function (scenario) { scenarios.push(scenario); });
        });
        var evidenceLines = ["observed, assumption, inference, and modeled output remain separate"];
        ["observed", "assumption", "inference"].forEach(function (evidenceClass) {
            var matching = claims.filter(function (claim) { return claim.evidenceClass === evidenceClass; });
            evidenceLines.push("class=" + evidenceClass.toUpperCase() +
                " | claims=" + matching.length +
                " | sourceRefs=" + matching.reduce(function (total, claim) { return total + claim.sourceRefs.length; }, 0) +
                " | metricRefs=" + matching.reduce(function (total, claim) { return total + claim.metricObservationIds.length; }, 0) +
                " | supportLinks=" + matching.reduce(function (total, claim) { return total + claim.supportsClaimIds.length + claim.contradictsClaimIds.length; }, 0) +
                " | lineage=" + (evidenceClass === "observed" ? "eligible source" : (evidenceClass === "assumption" ? "declared assumption" : "claims and method")));
        });
        evidenceLines.push("class=MODELED OUTPUT" +
            " | scenarios=" + scenarios.length +
            " | assumptionRefs=" + scenarios.reduce(function (total, scenario) { return total + scenario.assumptionClaimIds.length; }, 0) +
            " | inferenceRefs=" + scenarios.reduce(function (total, scenario) { return total + scenario.inferenceClaimIds.length; }, 0) +
            " | falsifierRefs=" + scenarios.reduce(function (total, scenario) { return total + scenario.falsifierClaimIds.length; }, 0) +
            " | lineage=forecast method + assumptions + inference + falsifier");

        var ownersById = Object.create(null);
        var unitIdentitySets = [];
        units.forEach(function (entry) {
            var unit = entry.unit;
            var ids = [unit.unitId, unit.thesis.id, unit.acquisitionSample.sampleId,
            unit.acquisitionBaseline.baselineId, unit.variableCostBaseline.baselineId,
            unit.fixedRiskCostBaseline.baselineId, unit.riskAssumptionBaseline.baselineId];
            ["sources", "claims", "metricObservations", "definitionConflicts", "forecastMethods", "series", "annualSyntheses", "scenarios", "legalFacts", "drivers", "unknowns"].forEach(function (arrayName) {
                unit[arrayName].forEach(function (record) { if (record && record.id) ids.push(record.id); });
            });
            unitIdentitySets.push({ unit: unit, ids: ids });
            ids.forEach(function (id) {
                if (!ownersById[id]) ownersById[id] = [];
                ownersById[id].push(unit.pairKey);
            });
        });
        var independenceLines = ["receipts=" + units.length];
        unitIdentitySets.forEach(function (entry) {
            var unit = entry.unit;
            var pairToken = ":" + unit.marketId + ":" + unit.segmentId + ":";
            var foreignIds = entry.ids.filter(function (id) { return typeof id !== "string" || id.indexOf(pairToken) === -1; });
            var duplicateIds = entry.ids.filter(function (id) { return ownersById[id] && ownersById[id].length > 1; });
            independenceLines.push("pair=" + unit.pairKey +
                " | unitId=" + unit.unitId +
                " | recordIds=" + entry.ids.length +
                " | foreignIds=" + foreignIds.length +
                " | duplicateIds=" + duplicateIds.length +
                " | inheritedIdentity=" + (foreignIds.length > 0 || duplicateIds.length > 0) +
                " | categories=" + unit.categoryCoverage.length + "/" + configIndex.categories.length);
        });

        var acquisitionLines = [];
        units.filter(function (entry) { return isLuxurySegment(entry.unit.segmentId); }).forEach(function (entry) {
            var unit = entry.unit;
            var sample = unit.acquisitionSample;
            var baseline = unit.acquisitionBaseline;
            acquisitionLines.push("pair=" + unit.pairKey +
                " | segment=" + unit.segmentId +
                " | status=" + sample.status +
                " | state=" + sample.state +
                " | filters=" + auditList(sample.filters) +
                " | dedup=" + auditText(sample.dedupMethod) +
                " | sampleN=" + auditNumber(sample.sampleN) +
                " | statistic=" + auditText(sample.statistic) +
                " | range=" + auditNumber(sample.lowUsd, "UNAVAILABLE") + ".." + auditNumber(sample.highUsd, "UNAVAILABLE") +
                " | period=" + auditText(sample.period.start) + ".." + auditText(sample.period.end) +
                " | exclusions=" + auditList(sample.exclusions) +
                " | legalUnknowns=" + auditList(sample.legalUnknownIds) +
                " | rights=" + sample.rightsState +
                " | baseline=" + baseline.state +
                " | purchasePriceUsd=" + auditNumber(baseline.purchasePriceUsd, "UNAVAILABLE"));
        });

        var scenarioLines = [];
        units.forEach(function (entry) {
            var unit = entry.unit;
            unit.scenarios.forEach(function (scenario) {
                var method = unit.forecastMethods.find(function (candidate) { return candidate.id === scenario.forecastMethodId; });
                scenarioLines.push("pair=" + unit.pairKey +
                    " | slot=" + scenario.scenarioSlotId +
                    " | year=" + scenario.year +
                    " | state=" + scenario.state +
                    " | baseline=" + (scenario.observedBaselineRefs.length ? "ALIGNED" : "UNAVAILABLE") +
                    " | baselineRefs=" + scenario.observedBaselineRefs.length +
                    " | gap=" + (scenario.baselineGapClaimIds.length ? "EXPLICIT" : "NONE") +
                    " | baselineGaps=" + scenario.baselineGapClaimIds.length +
                    " | assumptions=" + scenario.assumptionClaimIds.length +
                    " | inferences=" + scenario.inferenceClaimIds.length +
                    " | output=occupancy:" + auditNumber(scenario.baseOccupancy, "INPUT REQUIRED") + ",adrUsd:" + auditNumber(scenario.baseAdrUsd, "INPUT REQUIRED") + ",availableNights:" + auditNumber(scenario.availableNights) +
                    " | method=" + auditText(scenario.forecastMethodId) +
                    " | methodVersion=" + auditText(method && method.version) +
                    " | coverage=" + scenario.coverageState +
                    " | confidence=" + scenario.confidencePct + "%" +
                    " | falsifiers=" + scenario.falsifierClaimIds.length +
                    " | requiredUserInputs=" + auditList(scenario.requiredUserInputIds) +
                    " | inputPosture=" + (scenario.requiredUserInputIds.length ? "INPUT REQUIRED" : "DECLARED ASSUMPTIONS") +
                    " | observedFact=false");
            });
        });

        return deepFreeze({
            inventory: inventoryLines.join("\n"),
            changes: changeLines.join("\n"),
            attempts: attemptLines.join("\n"),
            evidenceClasses: evidenceLines.join("\n"),
            independence: independenceLines.join("\n"),
            acquisition: acquisitionLines.join("\n"),
            scenarios: scenarioLines.join("\n")
        });
    }

    function parseQuery(search) {
        var params = new URLSearchParams(search || "");
        return {
            fixture: params.get("fixture"),
            segment: params.get("segment"),
            mode: params.get("mode"),
            year: params.get("year"),
            scenario: params.get("scenario"),
            clock: params.get("clock")
        };
    }

    function mountRoute(options) {
        if (typeof document === "undefined" || typeof fetch === "undefined") {
            return Promise.reject(Object.assign(new Error("browser environment required"), { code: "PBRM-BOOT-DEPENDENCY" }));
        }
        options = options || {};
        var adapter = options.adapter;
        if (!adapter || typeof adapter.marketId !== "string" || typeof adapter.toolId !== "string" || typeof adapter.configPath !== "string") {
            return Promise.reject(Object.assign(new Error("route adapter required"), { code: "PBRM-ROUTE-IDENTITY" }));
        }
        var query = parseQuery(location.search);
        var fixtureMode = query.fixture !== null;
        var fixtureAllowed = !fixtureMode || ["current", "invalid", "missing-config", "compared"].indexOf(query.fixture) !== -1;
        var fixturePaths = options.fixtures || {};
        var configPath = fixtureMode ? (query.fixture === "missing-config" ? fixturePaths.missingConfig : fixturePaths.config) : adapter.configPath;
        var diagnostics = { fixture: fixtureMode, requests: [], payload: null, payloads: {}, ownerReadPublished: false, activePair: null, viewModel: null, ownerRead: null, errors: [] };
        var runtime = {
            adapter: adapter,
            query: query,
            fixtureMode: fixtureMode,
            config: null,
            configIndex: null,
            market: null,
            indexes: null,
            mode: null,
            candidate: null,
            initialCandidate: null,
            sourceTrigger: null
        };
        var MODE_STORAGE_KEY = "rl.placeBasedRentalMarket.mode.v2";
        root.__PBRM_DIAGNOSTICS__ = diagnostics;

        function node(id) { return document.getElementById(id); }
        function setText(id, text) { var element = node(id); if (element) element.textContent = text; }
        function setHidden(id, hidden) {
            var element = node(id);
            if (!element) return;
            element.hidden = hidden;
            element.style.display = hidden ? "none" : "block";
            if (!hidden && id === "modelReceipt") {
                var controls = node("proofControls");
                if (controls) controls.style.display = "grid";
            }
        }
        function showFailure(kind, errors) {
            diagnostics.errors = errors.slice();
            setText("truthState", kind === "config" ? "INVALID CONFIGURATION" : "INVALID PAYLOAD");
            setText("truthDetail", "No thesis, scenario conclusion, deterministic result, or numeric owner metric is available.");
            setText("contractErrors", errors.map(function (entry) { return entry.code + " " + entry.path; }).join("\n"));
            setHidden("modelReceipt", true);
            setHidden("researchAudit", true);
            setText("publicationState", fixtureMode ? "TEST FIXTURE: owner-read publication disabled." : "Owner-read publication unavailable.");
            var rentalRoot = node("main");
            if (rentalRoot && typeof rentalRoot.setAttribute === "function") rentalRoot.setAttribute("aria-busy", "false");
        }
        function readJson(path) {
            diagnostics.requests.push(path);
            return fetch(path, { cache: "no-store", credentials: "same-origin" }).then(function (response) {
                if (!response.ok) throw Object.assign(new Error("fetch failed"), { code: "PBRM-FETCH", path: path });
                return response.json();
            });
        }
        function renderResearchAudit(projection) {
            setText("researchInventoryReceipt", projection.inventory);
            setText("changeAccountingAuditReceipt", projection.changes);
            setText("attemptedResearchReceipt", projection.attempts);
            setText("evidenceClassAuditReceipt", projection.evidenceClasses);
            setText("unitIndependenceReceipt", projection.independence);
            setText("acquisitionAuditReceipt", projection.acquisition);
            setText("scenarioAuditReceipt", projection.scenarios);
            setHidden("researchAudit", false);
        }
        function pairContext(unit, configIndex, selectedScenario) {
            var scenario = selectedScenario || unit.scenarios.find(function (entry) { return entry.id === unit.initialSelection.scenarioId; });
            var fixedLines = unit.fixedRiskCostBaseline.lines.filter(function (line) { return line.applicability === "applicable" && isFiniteNumber(line.annualUsd); });
            var fixtureFinanceAvailable = fixtureMode && isFiniteNumber(unit.acquisitionBaseline.purchasePriceUsd);
            var assumptions = {
                contractVersion: ASSUMPTIONS_CONTRACT,
                marketId: unit.marketId,
                segmentId: unit.segmentId,
                pairKey: unit.pairKey,
                unitId: unit.unitId,
                scenarioId: scenario.id,
                forecastYear: scenario.year,
                demandDelta: unit.initialSelection.demandDelta,
                supplyDelta: unit.initialSelection.supplyDelta,
                adrShock: unit.initialSelection.adrShock,
                downtime: unit.riskAssumptionBaseline.downtime,
                purchasePriceUsd: unit.acquisitionBaseline.purchasePriceUsd,
                leverageRatio: fixtureFinanceAvailable ? 0.8 : null,
                downPaymentRatio: fixtureFinanceAvailable ? 0.2 : null,
                annualMortgageRate: fixtureFinanceAvailable ? 0.06 : null,
                loanTermYears: fixtureFinanceAvailable ? 30 : null,
                variableOperatingExpenseRatio: unit.variableCostBaseline.operatingExpenseRatio,
                fixedRiskCosts: fixedLines.map(function (line) { return { costFieldId: line.costFieldId, annualUsd: line.annualUsd }; })
            };
            if (isFiniteNumber(scenario.baseOccupancy)) assumptions.baseOccupancy = scenario.baseOccupancy;
            if (isFiniteNumber(scenario.baseAdrUsd)) assumptions.baseAdrUsd = scenario.baseAdrUsd;
            if (isFiniteNumber(scenario.availableNights)) assumptions.availableNights = scenario.availableNights;
            var profile = configIndex.profilesById.get(configIndex.marketsById.get(unit.marketId).profileId);
            var required = profile.requiredFixedRiskCostFieldIds.filter(function (id) {
                var field = configIndex.costFieldsById.get(id);
                return field && field.requiredForSegmentIds.indexOf(unit.segmentId) !== -1;
            });
            return {
                context: {
                    marketId: unit.marketId,
                    segmentId: unit.segmentId,
                    pairKey: unit.pairKey,
                    unitId: unit.unitId,
                    scenarioId: scenario.id,
                    formulaVersion: configIndex.contracts.formula,
                    acquisitionBaselineId: unit.acquisitionBaseline.baselineId,
                    variableCostBaselineId: unit.variableCostBaseline.baselineId,
                    fixedRiskCostBaselineId: unit.fixedRiskCostBaseline.baselineId,
                    riskAssumptionBaselineId: unit.riskAssumptionBaseline.baselineId,
                    baseOccupancy: scenario.baseOccupancy,
                    baseAdrUsd: scenario.baseAdrUsd,
                    availableNights: scenario.availableNights,
                    requiredFixedRiskCostFieldIds: required,
                    bounds: configIndex.bounds
                },
                assumptions: assumptions,
                scenario: scenario
            };
        }

        function claimStatement(unit, claimId, fallback) {
            var claim = unit.claims.find(function (entry) { return entry.id === claimId; });
            return claim && typeof claim.statement === "string" ? claim.statement : fallback;
        }

        function replaceChildren(element) {
            if (!element) return;
            while (element.firstChild) element.removeChild(element.firstChild);
        }

        function appendText(element, text, className) {
            var paragraph = document.createElement("p");
            if (className) paragraph.className = className;
            paragraph.textContent = text;
            element.appendChild(paragraph);
            return paragraph;
        }

        function storageRead(key) {
            if (fixtureMode || !root.localStorage) return null;
            try {
                var raw = root.localStorage.getItem(key);
                return raw ? JSON.parse(raw) : null;
            } catch (_error) {
                return null;
            }
        }

        function storageWrite(key, value) {
            if (fixtureMode || !root.localStorage) return;
            try { root.localStorage.setItem(key, JSON.stringify(value)); } catch (_error) { return; }
        }

        function storageRemove(key) {
            if (fixtureMode || !root.localStorage) return;
            try { root.localStorage.removeItem(key); } catch (_error) { return; }
        }

        function pairStorageKey(unit) {
            return "rl.placeBasedRentalMarket.pair.v2." + unit.marketId + "." + unit.segmentId;
        }

        function resolveScenario(unit) {
            if ((query.year && !query.scenario) || (!query.year && query.scenario)) return null;
            if (!query.year && !query.scenario) {
                return unit.scenarios.find(function (entry) { return entry.id === unit.initialSelection.scenarioId && entry.year === unit.initialSelection.forecastYear; }) || null;
            }
            var year = Number(query.year);
            return unit.scenarios.find(function (entry) { return entry.id === query.scenario && entry.year === year; }) || null;
        }

        function resolveMode(configIndex) {
            if (query.mode !== null && ["simple", "power"].indexOf(query.mode) === -1) return null;
            if (query.mode) return query.mode;
            var stored = storageRead(MODE_STORAGE_KEY);
            if (stored && stored.contractVersion === configIndex.contracts.uiState && ["simple", "power"].indexOf(stored.mode) !== -1) return stored.mode;
            return configIndex.initialUi.mode;
        }

        function clockFor(unit) {
            var now = fixtureMode && query.clock ? Date.parse(query.clock) : Date.now();
            if (!Number.isFinite(now)) return null;
            var researched = Date.parse(unit.researchedAt);
            var freshUntil = Date.parse(unit.staleAfter);
            if (!Number.isFinite(researched) || !Number.isFinite(freshUntil)) return null;
            return {
                now: now,
                computedAt: new Date(now).toISOString(),
                ageDays: Math.max(0, Math.floor((now - researched) / 86400000)),
                thresholdDays: Math.max(0, Math.round((freshUntil - researched) / 86400000)),
                stale: now > freshUntil
            };
        }

        function comparisonFor(unit, payloadIndex, configIndex) {
            var segment = configIndex.segmentsByPair.get(unit.pairKey);
            var whole = payloadIndex.unitsByPair.get(unit.marketId + "::whole-market");
            var observation = whole && whole.metricObservations.length ? whole.metricObservations[0] : null;
            if (!observation || !isLuxurySegment(unit.segmentId)) {
                return deepFreeze({ state: "INCOMPARABLE", mismatchReasons: ["SEGMENT_QUALIFICATION"], absoluteDelta: null, ranking: null });
            }
            var left = buildBasisSignature(observation, whole, configIndex);
            var targetDefinition = resolvePairMetricDefinition(configIndex, segment, "occupancy");
            var right = buildBasisSignature({
                metricDefinitionId: targetDefinition.id,
                marketId: unit.marketId,
                geographyId: observation.geographyId,
                populationId: segment.populationDefinitionId,
                segmentId: unit.segmentId,
                periodStart: observation.period.start,
                periodEnd: observation.period.end,
                currency: observation.currency || null,
                unit: observation.unit || "ratio",
                aggregation: observation.aggregation || "mean",
                sourceMethodId: observation.sourceMethodId,
                sampleFrameId: "UNKNOWN",
                qualificationSignature: "UNKNOWN"
            }, unit, configIndex);
            return compareAligned(Object.assign({ value: observation.value }, left), Object.assign({ value: null }, right));
        }

        function initialAssumptionsFor(unit, pair) {
            var restored = storageRead(pairStorageKey(unit));
            if (!restored) return clone(pair.assumptions);
            var identityMatches = restored.contractVersion === runtime.configIndex.contracts.uiState &&
                restored.configVersion === runtime.config.configVersion &&
                restored.formulaVersion === runtime.configIndex.contracts.formula &&
                restored.unitId === unit.unitId && restored.marketId === unit.marketId &&
                restored.segmentId === unit.segmentId && restored.pairKey === unit.pairKey &&
                restored.scenarioId === pair.scenario.id && restored.forecastYear === pair.scenario.year;
            if (identityMatches && isObject(restored.assumptions) && normalizeUserAssumptions(restored.assumptions, pair.context).ok) {
                setText("storageState", "RESTORED MATCHING PAIR STATE");
                return clone(restored.assumptions);
            }
            storageRemove(pairStorageKey(unit));
            setText("storageState", "STORED PAIR STATE RESET");
            return clone(pair.assumptions);
        }

        function candidateFor(unit, payloadIndex, configIndex, pair, assumptions) {
            var segment = configIndex.segmentsByPair.get(unit.pairKey);
            var qualification = evaluateLuxuryQualification(unit, segment.qualificationPolicy);
            var coverage = computeCoverage(unit.segmentCoverage, qualification, configIndex);
            var clock = clockFor(unit);
            if (!clock) return { error: pbrmError("PBRM-FIXTURE-CLOCK", "clock", "valid fixture clock required") };
            var normalized = normalizeUserAssumptions(assumptions, pair.context);
            var model = normalized.ok ? computeRentalResult(pair.context, normalized.value) : normalized;
            var result = model.ok && model.result ? model.result : null;
            var resultId = result ? resultIdentity({
                contractVersion: result.contractVersion,
                formulaVersion: result.formulaVersion,
                marketId: result.marketId,
                segmentId: result.segmentId,
                pairKey: result.pairKey,
                unitId: result.unitId,
                scenarioId: result.scenarioId,
                acquisitionBaselineId: pair.context.acquisitionBaselineId,
                variableCostBaselineId: pair.context.variableCostBaselineId,
                fixedRiskCostBaselineId: pair.context.fixedRiskCostBaselineId,
                riskAssumptionBaselineId: pair.context.riskAssumptionBaselineId,
                validatedUserAssumptions: normalized.value
            }) : null;
            var truthState = clock.stale ? "stale" : ((coverage.state === "sparse" || coverage.state === "unknown") ? coverage.state : "current");
            var truth = {
                state: truthState,
                asOf: unit.asOf,
                freshUntil: unit.staleAfter,
                ageDays: clock.ageDays,
                thresholdDays: clock.thresholdDays
            };
            var market = configIndex.marketsById.get(unit.marketId);
            var route = {
                path: market.routePath,
                toolId: market.toolId,
                ownerReadId: market.ownerReadId,
                marketId: market.marketId,
                label: market.label
            };
            var sourceIndex = {};
            unit.sources.forEach(function (source) { sourceIndex[source.id] = source; });
            var comparison = comparisonFor(unit, payloadIndex, configIndex);
            var errors = normalized.ok ? (model.errors || []) : normalized.errors;
            var viewInput = {
                route: route,
                pair: {
                    marketId: unit.marketId,
                    segmentId: unit.segmentId,
                    pairKey: unit.pairKey,
                    unitId: unit.unitId,
                    configVersion: runtime.config.configVersion,
                    formulaVersion: configIndex.contracts.formula,
                    marketLabel: market.label,
                    segmentLabel: segment.label
                },
                truth: truth,
                coverage: coverage,
                qualification: qualification,
                thesis: unit.thesis,
                scenario: pair.scenario,
                assumptions: normalized.ok ? normalized.value : assumptions,
                result: result,
                resultId: resultId,
                costCompleteness: result ? { state: result.economicsState, missingFieldIds: result.missingCostFieldIds } : { state: "UNAVAILABLE", missingFieldIds: [] },
                comparison: comparison,
                researchSections: unit.categoryCoverage,
                marketProfileSections: configIndex.profilesById.get(market.profileId),
                sourceInspectorIndex: sourceIndex,
                errors: errors
            };
            var baseView = buildViewModel(viewInput);
            var ownerRead = buildToolRead(baseView, clock.computedAt);
            viewInput.ownerRead = ownerRead;
            var viewModel = buildViewModel(viewInput);
            return {
                unit: unit,
                pair: pair,
                assumptions: normalized.ok ? normalized.value : assumptions,
                model: model,
                viewModel: viewModel,
                ownerRead: ownerRead,
                researchDigest: contracts.contentSha256(unit, UNIT_CONTRACT),
                clock: clock
            };
        }

        function formatMetric(metricId, value) {
            if (!isFiniteNumber(value)) return "UNKNOWN";
            var formatMap = {
                adjustedOccupancy: "occupancy",
                adjustedAdrUsd: "adr",
                adjustedRevparUsd: "revpar",
                effectiveAvailableNights: "effectiveNights",
                grossRevenueUsd: "grossRevenue",
                grossYield: "grossYield",
                annualDebtServiceUsd: "debtService",
                variableOperatingCostUsd: "variableCost",
                fixedRiskCostUsd: "fixedRiskCost",
                totalOperatingCostUsd: "totalOperatingCost",
                preTaxCashFlowUsd: "preTaxCashFlow"
            };
            var format = runtime.configIndex.formats[formatMap[metricId]];
            if (!format) return String(value);
            var options = { maximumFractionDigits: format.maximumFractionDigits };
            if (format.style === "currency") {
                options.style = "currency";
                options.currency = format.currency;
            } else if (format.style === "percent") {
                options.style = "percent";
            }
            var formatted = new Intl.NumberFormat("en-US", options).format(value);
            if (metricId === "preTaxCashFlowUsd" && value < 0) return "NEGATIVE -" + new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: format.maximumFractionDigits }).format(Math.abs(value));
            return formatted;
        }

        function renderSimpleModel(result) {
            var grid = node("modelResultGrid");
            if (!grid) return;
            replaceChildren(grid);
            [
                ["preTaxCashFlowUsd", "Pre-tax cash flow / yr"],
                ["grossRevenueUsd", "Gross revenue / yr"],
                ["totalOperatingCostUsd", "Total operating cost / yr"],
                ["effectiveAvailableNights", "Effective nights"],
                ["adjustedOccupancy", "Occupancy"],
                ["adjustedAdrUsd", "ADR"],
                ["grossYield", "Gross yield"]
            ].forEach(function (metric) {
                var cell = document.createElement("div");
                cell.className = "result-cell";
                var labelSpan = document.createElement("span");
                labelSpan.className = "metric-label";
                labelSpan.textContent = metric[1];
                var valueStrong = document.createElement("strong");
                valueStrong.setAttribute("data-simple-metric", metric[0]);
                valueStrong.textContent = result ? formatMetric(metric[0], result[metric[0]]) : "UNKNOWN";
                cell.appendChild(labelSpan);
                cell.appendChild(valueStrong);
                grid.appendChild(cell);
            });
        }

        function renderResult(candidate) {
            var result = candidate.viewModel.result || {};
            var rows = [
                ["adjustedOccupancy", "Adjusted occupancy"],
                ["adjustedAdrUsd", "Adjusted ADR"],
                ["adjustedRevparUsd", "Adjusted RevPAR"],
                ["effectiveAvailableNights", "Effective available nights"],
                ["grossRevenueUsd", "Gross revenue"],
                ["grossYield", "Gross yield"],
                ["annualDebtServiceUsd", "Annual debt service"],
                ["variableOperatingCostUsd", "Variable operating cost"],
                ["fixedRiskCostUsd", "Fixed and risk cost"],
                ["totalOperatingCostUsd", "Total operating cost"],
                ["preTaxCashFlowUsd", "Pre-tax cash flow"]
            ];
            var body = node("economicsRows");
            replaceChildren(body);
            rows.forEach(function (row) {
                var tableRow = document.createElement("tr");
                var label = document.createElement("th");
                var value = document.createElement("td");
                label.scope = "row";
                label.textContent = row[1];
                value.setAttribute("data-metric", row[0]);
                value.textContent = formatMetric(row[0], result[row[0]]);
                value.title = row[1] + " for " + candidate.unit.pairKey + ": " + value.textContent;
                tableRow.appendChild(label);
                tableRow.appendChild(value);
                body.appendChild(tableRow);
            });
            setText("economicsState", result.economicsState || "UNAVAILABLE");
            setText("costCompleteness", result.economicsState === "INCOMPLETE" ? "INCOMPLETE ECONOMICS · missing " + result.missingCostFieldIds.join(", ") : (result.economicsState || "UNAVAILABLE"));
            setText("resultId", candidate.viewModel.resultId || "UNAVAILABLE");
            setText("renderDigest", candidate.viewModel.renderDigest);
            var decision = candidate.viewModel.truth.state.toUpperCase() + " · " + candidate.unit.pairKey + " · " + candidate.unit.thesis.phase.toUpperCase() + " / " + candidate.unit.thesis.direction.toUpperCase() + " · cash flow " + formatMetric("preTaxCashFlowUsd", result.preTaxCashFlowUsd);
            setText("simpleDecision", decision);
            setText("powerDecision", decision);
            setText("ownerReadReceipt", "state=" + candidate.ownerRead.availability.toUpperCase() + "\npair=" + candidate.unit.pairKey + "\nresultId=" + (candidate.viewModel.resultId || "UNAVAILABLE") + "\npreTaxCashFlowUsd=" + formatMetric("preTaxCashFlowUsd", result.preTaxCashFlowUsd) + "\nomitted=" + candidate.ownerRead.metrics.omittedMetrics.join(","));
            renderSimpleModel(result);
            drawEconomicsChart(candidate);
        }

        function drawEconomicsChart(candidate) {
            var canvas = node("economicsChart");
            if (!canvas || !document.body.classList.contains("power")) return;
            var result = candidate.viewModel.result || {};
            var rows = [
                ["Revenue", result.grossRevenueUsd],
                ["Variable cost", result.variableOperatingCostUsd],
                ["Fixed risk", result.fixedRiskCostUsd],
                ["Debt service", result.annualDebtServiceUsd],
                ["Cash flow", result.preTaxCashFlowUsd]
            ].filter(function (row) { return isFiniteNumber(row[1]); });
            var context = canvas.getContext && canvas.getContext("2d");
            if (!context || rows.length < 2) {
                canvas.setAttribute("data-render-state", "unavailable");
                return;
            }
            var cssWidth = Math.max(320, Math.floor(canvas.getBoundingClientRect().width || 640));
            var cssHeight = 236;
            var ratio = root.devicePixelRatio || 1;
            canvas.width = cssWidth * ratio;
            canvas.height = cssHeight * ratio;
            canvas.style.height = cssHeight + "px";
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            context.clearRect(0, 0, cssWidth, cssHeight);
            context.fillStyle = "#f8f6ef";
            context.fillRect(0, 0, cssWidth, cssHeight);
            var max = Math.max.apply(null, rows.map(function (row) { return Math.abs(row[1]); })) || 1;
            var zero = cssWidth * 0.54;
            var rowHeight = 36;
            rows.forEach(function (row, index) {
                var y = 24 + index * rowHeight;
                var width = Math.max(2, Math.abs(row[1]) / max * (cssWidth * 0.38));
                context.fillStyle = row[1] < 0 ? "#a6382a" : "#1f6b62";
                context.fillRect(row[1] < 0 ? zero - width : zero, y, width, 18);
                context.fillStyle = "#1d2926";
                context.font = "12px sans-serif";
                context.fillText(row[0], 10, y + 14);
            });
            context.strokeStyle = "#1d2926";
            context.beginPath();
            context.moveTo(zero, 12);
            context.lineTo(zero, cssHeight - 12);
            context.stroke();
            canvas.setAttribute("data-render-state", "drawn");
            if (root.RLCHART && typeof root.RLCHART.attach === "function") {
                root.RLCHART.attach(canvas, function (_mouseX, mouseY) {
                    var index = Math.floor((mouseY - 24) / rowHeight);
                    if (index < 0 || index >= rows.length) return null;
                    return root.RLCHART.tip(rows[index][0], [["Value", formatMetric(index === rows.length - 1 ? "preTaxCashFlowUsd" : "grossRevenueUsd", rows[index][1])]], "Same deterministic result as the authoritative table.");
                });
            }
        }

        function renderDefinitionAudit(unit, payloadIndex) {
            var container = node("definitionAudit");
            replaceChildren(container);
            var conflict = unit.definitionConflicts[0];
            var sources = [];
            if (conflict) {
                sources = [payloadIndex.sourcesById.get(conflict.leftSourceId), payloadIndex.sourcesById.get(conflict.rightSourceId)].filter(Boolean);
            }
            if (sources.length < 2) {
                var whole = payloadIndex.unitsByPair.get(unit.marketId + "::whole-market");
                sources = whole ? whole.sources.slice(0, 2) : [];
            }
            sources.slice(0, 2).forEach(function (source) {
                var card = document.createElement("section");
                card.setAttribute("data-definition", source.id);
                appendText(card, source.title, "definition-title");
                appendText(card, "Population " + source.populationId + " · period " + source.observationPeriod.start + " to " + source.observationPeriod.end);
                container.appendChild(card);
            });
            appendText(container, "INCOMPARABLE · reason=" + (conflict ? conflict.reason : "SEGMENT_QUALIFICATION") + " · aggregate=NONE · ranking=NONE", "incomparable");
        }

        function renderSources(unit) {
            var list = node("sourceList");
            replaceChildren(list);
            unit.sources.forEach(function (source) {
                var button = document.createElement("button");
                button.type = "button";
                button.setAttribute("data-source-trigger", source.id);
                button.textContent = source.title;
                button.title = "Inspect source provenance for this selected pair.";
                button.addEventListener("click", function () { openSource(source, button); });
                list.appendChild(button);
            });
        }

        function openSource(source, trigger) {
            var dialog = node("sourceDialog");
            runtime.sourceTrigger = trigger;
            setText("sourceTitle", source.title);
            setText("sourcePublisher", source.publisher);
            setText("sourceRetrieved", source.retrievedAt);
            setText("sourceGeography", source.geographyId);
            setText("sourcePopulation", source.populationId);
            setText("sourceRights", source.rights.state + " · " + source.rights.note);
            setText("sourceLimitations", source.limitations.join(" · "));
            var link = node("sourceLink");
            link.href = source.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.referrerPolicy = "no-referrer";
            link.hidden = false;
            dialog.showModal();
            node("sourceDialogHeading").focus();
        }

        function wireInspector() {
            var dialog = node("sourceDialog");
            if (!dialog || dialog.dataset.wired === "true") return;
            dialog.dataset.wired = "true";
            node("closeSourceDialog").addEventListener("click", function () { dialog.close(); });
            dialog.addEventListener("close", function () {
                if (runtime.sourceTrigger && runtime.sourceTrigger.isConnected) runtime.sourceTrigger.focus();
                else if (node("sourcesHeading")) node("sourcesHeading").focus();
            });
        }

        function renderProfile(candidate) {
            var unit = candidate.unit;
            var configIndex = runtime.configIndex;
            var market = configIndex.marketsById.get(unit.marketId);
            var profile = configIndex.profilesById.get(market.profileId);
            var legal = node("legalSupplyReceipt");
            replaceChildren(legal);
            appendText(legal, "LEGAL ELIGIBILITY · not active supply", "supply-label");
            profile.requiredLegalFieldIds.forEach(function (fieldId) {
                var field = configIndex.legalFieldsById.get(fieldId);
                var fact = unit.legalFacts.find(function (entry) { return entry.legalFieldId === fieldId; });
                appendText(legal, field.label + " · " + (fact ? fact.state.toUpperCase() + " · " + fact.statement : "MISSING OR UNKNOWN"));
            });
            setText("activeSupplyReceipt", "ACTIVE OTA SUPPLY · candidate population " + (candidate.viewModel.coverage.candidateCount === null ? "UNKNOWN" : candidate.viewModel.coverage.candidateCount) + " · population " + configIndex.segmentsByPair.get(unit.pairKey).populationDefinitionId);
            setText("supplyAssumptionReceipt", "SCENARIO ASSUMPTION · supplyDelta=" + candidate.assumptions.supplyDelta + " · inference only");
            setText("supplySeparation", "INCOMPARABLE populations · aggregate=NONE · legal capacity, active listings, and scenario assumptions remain separate");

            var obligations = unit.marketId === "palm-springs-ca" ? node("palmObligations") : node("coastalBurden");
            replaceChildren(obligations);
            appendText(obligations, unit.marketId === "palm-springs-ca" ? "Palm Springs municipal and operating ledger" : "Ocean Shores coastal and operating ledger", "obligation-title");
            if (unit.marketId === "palm-springs-ca") {
                profile.requiredLegalFieldIds.forEach(function (fieldId) {
                    var legalField = configIndex.legalFieldsById.get(fieldId);
                    var legalFact = unit.legalFacts.find(function (entry) { return entry.legalFieldId === fieldId; });
                    appendText(obligations, legalField.label + " · " + (legalFact ? legalFact.state.toUpperCase() + " · " + legalFact.statement : "MISSING OR UNKNOWN"));
                });
                appendText(obligations, "Management · " + (isFiniteNumber(unit.variableCostBaseline.operatingExpenseRatio) ? formatMetric("grossYield", unit.variableCostBaseline.operatingExpenseRatio) : "MISSING"));
            }
            profile.requiredFixedRiskCostFieldIds.forEach(function (fieldId) {
                var field = configIndex.costFieldsById.get(fieldId);
                var line = unit.fixedRiskCostBaseline.lines.find(function (entry) { return entry.costFieldId === fieldId; });
                var value = line && isFiniteNumber(line.annualUsd) ? formatMetric("fixedRiskCostUsd", line.annualUsd) : "MISSING OR UNKNOWN";
                appendText(obligations, field.label + " · " + (line ? line.applicability.toUpperCase() + " · " + value : value));
            });
            if (unit.marketId === "ocean-shores-wa") {
                profile.requiredRiskFieldIds.forEach(function (fieldId) {
                    var risk = configIndex.riskFieldsById.get(fieldId);
                    appendText(obligations, risk.label + " · geography preserved · " + risk.allowedGeographyIds.join(", "));
                });
            }
            setText("acquisitionSummary", "status=" + unit.acquisitionSample.status + " · state=" + unit.acquisitionSample.state + " · sampleN=" + (unit.acquisitionSample.sampleN === null ? "UNKNOWN" : unit.acquisitionSample.sampleN) + " · baseline=" + unit.acquisitionBaseline.state + " · legalUnknowns=" + unit.acquisitionSample.legalUnknownIds.join(","));
            if (unit.marketId === "ocean-shores-wa") {
                var labels = ["geo:ocean-shores-city", "geo:grays-harbor-county", "geo:peninsulas-region", "geo:washington-coast", "geo:property-level"].map(function (id) {
                    var geography = configIndex.geographiesById.get(id);
                    if (geography) return geography.label;
                    return id.split(":").pop().split("-").map(function (part) { return part.charAt(0).toUpperCase() + part.slice(1); }).join(" ") + " [CONFIG LABEL MISSING]";
                });
                setText("geographyReceipt", labels.join(" · "));
            } else setText("geographyReceipt", "Palm Springs city · Greater Palm Springs · Coachella Valley · California · Property level");
        }

        function renderThesis(candidate) {
            var unit = candidate.unit;
            var thesis = unit.thesis;
            var summary = claimStatement(unit, thesis.summaryClaimId, "No supported segment conclusion is available.");
            var support = claimStatement(unit, thesis.strongestSupportClaimId, "No positive support claim is available.");
            var conflict = claimStatement(unit, thesis.strongestConflictOrUnknownClaimId, "No resolved conflict claim is available.");
            var unknown = thesis.unknownClaimIds.length ? claimStatement(unit, thesis.unknownClaimIds[0], "Unknown remains unresolved.") : "No additional unknown claim.";
            var falsifier = candidate.pair.scenario.falsifierClaimIds.length ? claimStatement(unit, candidate.pair.scenario.falsifierClaimIds[0], "Falsifier not source-resolved.") : "No supported falsifier; scenario remains assumption-driven.";
            setText("thesisSummary", summary);
            setText("thesisPhase", thesis.phase.toUpperCase());
            setText("thesisDirection", thesis.direction.toUpperCase());
            setText("thesisConfidence", thesis.confidencePct + "%");
            setText("supportSummary", support);
            setText("conflictSummary", conflict);
            setText("unknownSummary", unknown);
            setText("falsifierSummary", falsifier);
            setText("scenarioSummary", candidate.pair.scenario.label + " · " + candidate.pair.scenario.state.toUpperCase() + " · year " + candidate.pair.scenario.year + " · observedFact=false");
        }

        function numberControl(container, id, labelText, value, bound, primary, costFieldId) {
            var wrapper = document.createElement("div");
            wrapper.className = "control" + (primary ? " primary-control" : "");
            var label = document.createElement("label");
            label.htmlFor = id;
            label.textContent = labelText;
            label.title = labelText + " is a public hypothetical input for the selected pair; it never changes research.";
            var input = document.createElement("input");
            input.type = "number";
            input.id = id;
            input.name = id;
            if (bound) {
                input.min = String(bound.min);
                input.max = String(bound.max);
                input.step = String(bound.step);
            }
            input.value = isFiniteNumber(value) ? String(value) : "";
            if (costFieldId) input.setAttribute("data-cost-id", costFieldId);
            else input.setAttribute("data-assumption-id", id);
            input.setAttribute("aria-describedby", id + "Error");
            var error = document.createElement("span");
            error.id = id + "Error";
            error.className = "input-error";
            error.setAttribute("role", "status");
            error.textContent = isFiniteNumber(value) ? "" : "Required before dependent numeric output.";
            wrapper.appendChild(label);
            /* A range slider paired with the number input makes the model playable. The number input
               stays the source of truth (validation, precise entry, empty/required state, tests); the
               slider only mirrors it. Only bounded controls get a slider (a range needs min/max/step). */
            if (bound) {
                var slider = document.createElement("input");
                slider.type = "range";
                slider.className = "control-slider";
                slider.min = String(bound.min);
                slider.max = String(bound.max);
                slider.step = String(bound.step);
                slider.value = isFiniteNumber(value) ? String(value) : String(bound.min);
                slider.setAttribute("aria-label", labelText + " slider");
                slider.setAttribute("tabindex", "-1");
                slider.addEventListener("input", function () {
                    input.value = slider.value;
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                });
                input.addEventListener("input", function () {
                    if (input.value !== "" && Number.isFinite(Number(input.value))) slider.value = input.value;
                });
                var sliderRow = document.createElement("div");
                sliderRow.className = "control-slider-row";
                sliderRow.appendChild(slider);
                sliderRow.appendChild(input);
                wrapper.appendChild(sliderRow);
            } else {
                wrapper.appendChild(input);
            }
            wrapper.appendChild(error);
            container.appendChild(wrapper);
        }

        function renderControls(candidate) {
            var container = node("allAssumptions");
            replaceChildren(container);
            var profile = runtime.configIndex.profilesById.get(runtime.configIndex.marketsById.get(candidate.unit.marketId).profileId);
            var primary = profile.primaryLeverIds;
            var assumptions = candidate.assumptions;
            var controls = [
                ["baseOccupancy", "Base occupancy", assumptions.baseOccupancy, "baseOccupancy"],
                ["baseAdrUsd", "Base ADR (USD)", assumptions.baseAdrUsd, "baseAdrUsd"],
                ["availableNights", "Calendar available nights", assumptions.availableNights, "availableNights"],
                ["demandDelta", "Demand delta", assumptions.demandDelta, "demandDelta"],
                ["supplyDelta", "Supply delta", assumptions.supplyDelta, "supplyDelta"],
                ["adrShock", "ADR shock", assumptions.adrShock, "adrShock"],
                ["purchasePriceUsd", "Purchase price (USD)", assumptions.purchasePriceUsd, "purchasePriceUsd"],
                ["leverageRatio", "Leverage ratio", assumptions.leverageRatio, "leverageRatio"],
                ["downPaymentRatio", "Down payment ratio", assumptions.downPaymentRatio, "downPaymentRatio"],
                ["annualMortgageRate", "Annual mortgage rate", assumptions.annualMortgageRate, "annualMortgageRate"],
                ["loanTermYears", "Loan term (years)", assumptions.loanTermYears, "loanTermYears"],
                ["variableOperatingExpenseRatio", "Variable operating expense ratio", assumptions.variableOperatingExpenseRatio, "variableOperatingExpenseRatio"]
            ];
            var downtimeDays = assumptions.downtime.items.reduce(function (total, item) { return total + (isFiniteNumber(item.days) ? item.days : (Array.isArray(item.dates) ? item.dates.length : 0)); }, 0);
            controls.splice(6, 0, ["downtimeDays", "Downtime days", downtimeDays, "downtimeDays"]);
            controls.forEach(function (control) {
                numberControl(container, control[0], control[1], control[2], runtime.configIndex.bounds[control[3]], primary.indexOf(control[0]) !== -1, null);
            });
            var costHeading = document.createElement("h3");
            costHeading.textContent = "Explicit annual fixed and risk costs";
            container.appendChild(costHeading);
            profile.requiredFixedRiskCostFieldIds.forEach(function (fieldId) {
                var field = runtime.configIndex.costFieldsById.get(fieldId);
                var line = assumptions.fixedRiskCosts.find(function (entry) { return entry.costFieldId === fieldId; });
                numberControl(container, "costInput-" + fieldId.replace(/[^a-z0-9]+/g, "-"), field.label + " (USD)", line && line.annualUsd, runtime.configIndex.bounds.annualFixedRiskCostUsd, primary.indexOf("annualFixedRiskCostUsd") !== -1, fieldId);
            });
            Array.prototype.forEach.call(container.querySelectorAll('input[type="number"]'), function (input) {
                input.addEventListener("input", function () {
                    if (input.id === "leverageRatio" && input.value !== "" && Number.isFinite(Number(input.value))) node("downPaymentRatio").value = String(1 - Number(input.value));
                    if (input.id === "downPaymentRatio" && input.value !== "" && Number.isFinite(Number(input.value))) node("leverageRatio").value = String(1 - Number(input.value));
                    recomputeFromControls(input);
                });
            });
        }

        function readControls() {
            var assumptions = clone(runtime.candidate.assumptions);
            var errors = [];
            var scalarIds = ["baseOccupancy", "baseAdrUsd", "availableNights", "demandDelta", "supplyDelta", "adrShock", "purchasePriceUsd", "leverageRatio", "downPaymentRatio", "annualMortgageRate", "loanTermYears", "variableOperatingExpenseRatio"];
            scalarIds.forEach(function (id) {
                var input = node(id);
                var error = node(id + "Error");
                var value = input.value === "" ? null : Number(input.value);
                var bound = runtime.configIndex.bounds[id];
                var invalid = value === null || !Number.isFinite(value) || (bound && (value < bound.min || value > bound.max || (bound.integer && !Number.isInteger(value))));
                input.setAttribute("aria-invalid", invalid ? "true" : "false");
                error.textContent = invalid ? (value === null ? "Required before dependent numeric output." : "Enter a value inside the configured bounds.") : "";
                if (invalid) errors.push(pbrmError(value === null ? "PBRM-MODEL-NONFINITE" : "PBRM-MODEL-BOUNDS", "assumptions." + id, "invalid input"));
                else assumptions[id] = value;
            });
            var downtimeInput = node("downtimeDays");
            var downtimeValue = downtimeInput.value === "" ? null : Number(downtimeInput.value);
            var downtimeBound = runtime.configIndex.bounds.downtimeDays;
            var downtimeInvalid = downtimeValue === null || !Number.isInteger(downtimeValue) || downtimeValue < downtimeBound.min || downtimeValue > downtimeBound.max;
            downtimeInput.setAttribute("aria-invalid", downtimeInvalid ? "true" : "false");
            node("downtimeDaysError").textContent = downtimeInvalid ? "Enter a whole number of days inside the configured bounds." : "";
            if (downtimeInvalid) errors.push(pbrmError("PBRM-MODEL-BOUNDS", "assumptions.downtime", "invalid downtime"));
            else {
                assumptions.downtime = clone(assumptions.downtime);
                if (!assumptions.downtime.items.length && downtimeValue > 0) assumptions.downtime.items.push({ riskFieldId: "riskfield:ocean:coastal-access-downtime", days: downtimeValue, disjointWithAllOthers: true });
                else assumptions.downtime.items.forEach(function (item, index) { if (index === 0) item.days = downtimeValue; });
            }
            assumptions.fixedRiskCosts = [];
            Array.prototype.forEach.call(node("allAssumptions").querySelectorAll("[data-cost-id]"), function (input) {
                var error = node(input.id + "Error");
                if (input.value === "") {
                    input.setAttribute("aria-invalid", "false");
                    error.textContent = "MISSING: complete cash flow remains unavailable.";
                    return;
                }
                var value = Number(input.value);
                var bound = runtime.configIndex.bounds.annualFixedRiskCostUsd;
                var invalid = !Number.isFinite(value) || value < bound.min || value > bound.max;
                input.setAttribute("aria-invalid", invalid ? "true" : "false");
                error.textContent = invalid ? "Enter a non-negative annual cost inside the configured bounds." : "";
                if (invalid) errors.push(pbrmError("PBRM-MODEL-BOUNDS", "assumptions.fixedRiskCosts." + input.getAttribute("data-cost-id"), "invalid cost"));
                else assumptions.fixedRiskCosts.push({ costFieldId: input.getAttribute("data-cost-id"), annualUsd: value });
            });
            return { assumptions: assumptions, errors: errors };
        }

        function recomputeFromControls(trigger) {
            var parsed = readControls();
            if (parsed.errors.length) {
                var body = node("economicsRows");
                replaceChildren(body);
                [
                    ["adjustedOccupancy", "Adjusted occupancy"], ["adjustedAdrUsd", "Adjusted ADR"],
                    ["adjustedRevparUsd", "Adjusted RevPAR"], ["effectiveAvailableNights", "Effective available nights"],
                    ["grossRevenueUsd", "Gross revenue"], ["grossYield", "Gross yield"],
                    ["annualDebtServiceUsd", "Annual debt service"], ["variableOperatingCostUsd", "Variable operating cost"],
                    ["fixedRiskCostUsd", "Fixed and risk cost"], ["totalOperatingCostUsd", "Total operating cost"],
                    ["preTaxCashFlowUsd", "Pre-tax cash flow"]
                ].forEach(function (row) {
                    var tableRow = document.createElement("tr");
                    var label = document.createElement("th");
                    var value = document.createElement("td");
                    label.scope = "row";
                    label.textContent = row[1];
                    value.setAttribute("data-metric", row[0]);
                    value.textContent = "UNKNOWN";
                    value.title = row[1] + " is unavailable until every invalid input is corrected.";
                    tableRow.appendChild(label);
                    tableRow.appendChild(value);
                    body.appendChild(tableRow);
                });
                setText("economicsState", "UNAVAILABLE");
                setText("costCompleteness", "INVALID INPUT · dependent numeric outputs cleared; no prior result is retained.");
                setText("resultId", "UNAVAILABLE");
                renderSimpleModel(null);
                setText("simpleDecision", runtime.candidate.viewModel.truth.state.toUpperCase() + " · " + runtime.candidate.unit.pairKey + " · INVALID INPUT · dependent economics unavailable");
                setText("powerDecision", runtime.candidate.viewModel.truth.state.toUpperCase() + " · " + runtime.candidate.unit.pairKey + " · INVALID INPUT · dependent economics unavailable");
                setText("ownerReadReceipt", "state=" + runtime.candidate.ownerRead.availability.toUpperCase() + "\npair=" + runtime.candidate.unit.pairKey + "\nresultId=UNAVAILABLE\nomitted=ALL DEPENDENT NUMERICS\nerrors=" + parsed.errors.map(function (error) { return error.code; }).join(","));
                var canvas = node("economicsChart");
                canvas.setAttribute("data-render-state", "unavailable");
                setText("liveUpdate", "Invalid input remains visible; dependent numeric output is unavailable.");
                return;
            }
            var candidate = candidateFor(runtime.candidate.unit, runtime.indexes[runtime.candidate.unit.marketId], runtime.configIndex, runtime.candidate.pair, parsed.assumptions);
            runtime.candidate = candidate;
            diagnostics.viewModel = candidate.viewModel;
            diagnostics.ownerRead = candidate.ownerRead;
            renderResult(candidate);
            setText("supplyAssumptionReceipt", "SCENARIO ASSUMPTION · supplyDelta=" + candidate.assumptions.supplyDelta + " · inference only");
            setText("liveUpdate", candidate.viewModel.pair.marketLabel + " updated effective nights, revenue, costs, yield, and cash flow.");
            if (!fixtureMode) {
                storageWrite(pairStorageKey(candidate.unit), {
                    contractVersion: runtime.configIndex.contracts.uiState,
                    configVersion: runtime.config.configVersion,
                    formulaVersion: runtime.configIndex.contracts.formula,
                    unitId: candidate.unit.unitId,
                    marketId: candidate.unit.marketId,
                    segmentId: candidate.unit.segmentId,
                    pairKey: candidate.unit.pairKey,
                    scenarioId: candidate.pair.scenario.id,
                    forecastYear: candidate.pair.scenario.year,
                    assumptions: candidate.assumptions
                });
                setText("storageState", "MATCHING PAIR STATE SAVED");
            }
            if (trigger) trigger.focus();
        }

        function updateAddress() {
            if (!root.history || typeof root.history.replaceState !== "function") return;
            var params = new URLSearchParams();
            if (query.fixture) params.set("fixture", query.fixture);
            params.set("segment", runtime.candidate.unit.segmentId);
            params.set("mode", runtime.mode);
            params.set("year", String(runtime.candidate.pair.scenario.year));
            params.set("scenario", runtime.candidate.pair.scenario.id);
            if (query.clock) params.set("clock", query.clock);
            root.history.replaceState(null, "", runtime.market.routePath + "?" + params.toString() + "#decision");
        }

        function setMode(mode, persist) {
            runtime.mode = mode;
            document.body.classList.toggle("power", mode === "power");
            node("modeSimple").setAttribute("aria-pressed", mode === "simple" ? "true" : "false");
            node("modePower").setAttribute("aria-pressed", mode === "power" ? "true" : "false");
            if (persist && !fixtureMode) storageWrite(MODE_STORAGE_KEY, { contractVersion: runtime.configIndex.contracts.uiState, mode: mode });
            if (runtime.candidate) {
                updateAddress();
                drawEconomicsChart(runtime.candidate);
            }
        }

        function renderCandidate(candidate, focusCoverage) {
            var rentalRoot = node("main");
            rentalRoot.setAttribute("aria-busy", "true");
            runtime.candidate = candidate;
            runtime.initialCandidate = candidate;
            diagnostics.activePair = candidate.unit.pairKey;
            diagnostics.viewModel = candidate.viewModel;
            diagnostics.ownerRead = candidate.ownerRead;
            setText("routeIdentity", candidate.viewModel.route.marketId + " · " + candidate.viewModel.route.label);
            setText("pairIdentity", candidate.unit.pairKey);
            setText("researchDigest", candidate.researchDigest);
            var truthLabel = candidate.viewModel.truth.state.toUpperCase() + (fixtureMode ? " TEST FIXTURE" : " RESEARCH");
            setText("truthState", truthLabel);
            setText("truthDetail", "Research age " + candidate.clock.ageDays + " days · stale threshold " + candidate.clock.thresholdDays + " days · as of " + candidate.unit.asOf + ". " + (fixtureMode ? "Synthetic fixture only; no persistence or publication." : "Production proposal remains UNCOMMITTED FOR REVIEW."));
            setText("coverageSummary", candidate.viewModel.coverage.state.toUpperCase() + " · candidates " + (candidate.viewModel.coverage.candidateCount === null ? "UNKNOWN" : candidate.viewModel.coverage.candidateCount) + " · qualifying " + (candidate.viewModel.coverage.qualifyingCount === null ? "UNKNOWN" : candidate.viewModel.coverage.qualifyingCount) + " · sample " + (candidate.viewModel.coverage.metricSampleN === null ? "UNKNOWN" : candidate.viewModel.coverage.metricSampleN));
            setText("qualificationSummary", candidate.viewModel.qualification.disposition.toUpperCase() + " · " + (candidate.viewModel.qualification.reasonCodes.length ? candidate.viewModel.qualification.reasonCodes.join(", ") : "no failed gate"));
            renderThesis(candidate);
            renderProfile(candidate);
            renderDefinitionAudit(candidate.unit, runtime.indexes[candidate.unit.marketId]);
            renderSources(candidate.unit);
            renderControls(candidate);
            renderResult(candidate);
            setText("publicationState", fixtureMode ? "TEST FIXTURE: owner-read publication disabled." : "UNCOMMITTED FOR REVIEW; owner-read publication deferred until Scope 4.");
            setText("storageState", fixtureMode ? "TEST FIXTURE: persistence disabled" : (node("storageState").textContent || "PAIR-ONLY LOCAL STATE"));
            node("segmentWhole").setAttribute("aria-pressed", candidate.unit.segmentId === "whole-market" ? "true" : "false");
            node("segmentLuxury").setAttribute("aria-pressed", isLuxurySegment(candidate.unit.segmentId) ? "true" : "false");
            var otherMarket = runtime.configIndex.marketsById.get(runtime.market.comparisonMarketId);
            var marketLink = node("marketLink");
            var linkParams = new URLSearchParams();
            if (query.fixture) linkParams.set("fixture", query.fixture);
            linkParams.set("segment", candidate.unit.segmentId);
            linkParams.set("mode", runtime.mode);
            if (query.clock) linkParams.set("clock", query.clock);
            marketLink.href = otherMarket.routePath + "?" + linkParams.toString();
            marketLink.textContent = "Open " + otherMarket.label;
            marketLink.title = "Navigate to the independently owned " + otherMarket.label + " route; no research is repainted in place.";
            setMode(runtime.mode, false);
            updateAddress();
            rentalRoot.setAttribute("aria-busy", "false");
            if (focusCoverage) node("coverageHeading").focus();
        }

        function completeRender(unit, payloadIndex, configIndex, pair, model) {
            if (typeof document.createElement !== "function" || !node("modeSimple") || !node("economicsRows")) return model;
            var assumptions = initialAssumptionsFor(unit, pair);
            var candidate = candidateFor(unit, payloadIndex, configIndex, pair, assumptions);
            if (candidate.error) {
                showFailure("payload", [candidate.error]);
                return null;
            }
            renderCandidate(candidate, false);
            return candidate.model;
        }

        function wireRouteControls() {
            if (typeof document.createElement !== "function") return;
            var modeSegment = node("modeSeg");
            if (!modeSegment || modeSegment.dataset.wired === "true") return;
            modeSegment.dataset.wired = "true";
            node("modeSimple").addEventListener("click", function () { setMode("simple", true); });
            node("modePower").addEventListener("click", function () { setMode("power", true); });
            function switchSegment(segmentId) {
                var pairKey = runtime.adapter.marketId + "::" + segmentId;
                var unit = runtime.indexes[runtime.adapter.marketId].unitsByPair.get(pairKey);
                if (!unit) {
                    showFailure("payload", [pbrmError("PBRM-PAIR-LINK", "segment", "INVALID PAIR LINK")]);
                    return;
                }
                query.segment = segmentId;
                query.year = null;
                query.scenario = null;
                node("main").setAttribute("aria-busy", "true");
                renderUnit(unit, runtime.indexes[runtime.adapter.marketId], runtime.configIndex, true);
            }
            node("segmentWhole").addEventListener("click", function () { switchSegment("whole-market"); });
            node("segmentLuxury").addEventListener("click", function () { switchSegment(LUXURY_SEGMENT_BY_MARKET[runtime.adapter.marketId]); });
            node("resetAssumptions").addEventListener("click", function () {
                storageRemove(pairStorageKey(runtime.candidate.unit));
                query.year = null;
                query.scenario = null;
                renderUnit(runtime.candidate.unit, runtime.indexes[runtime.adapter.marketId], runtime.configIndex, false);
                setText("liveUpdate", "Selected pair assumptions reset to their explicit payload and fixture posture.");
                node("resetAssumptions").focus();
            });
            node("printView").addEventListener("click", function () { root.print(); });
            root.addEventListener("resize", function () { if (runtime.candidate) drawEconomicsChart(runtime.candidate); });
            wireInspector();
        }

        function renderUnit(unit, payloadIndex, configIndex) {
            var selectedScenario = resolveScenario(unit);
            if (!selectedScenario) {
                showFailure("payload", [pbrmError("PBRM-PAIR-LINK", "scenario", "INVALID PAIR LINK")]);
                return null;
            }
            var segment = configIndex.segmentsByPair.get(unit.pairKey);
            var qualification = evaluateLuxuryQualification(unit, segment.qualificationPolicy);
            var coverage = computeCoverage(unit.segmentCoverage, qualification, configIndex);
            diagnostics.activePair = unit.pairKey;
            var truthWord = coverage.state === "sparse" || coverage.state === "unknown" ? coverage.state.toUpperCase() : "CURRENT";
            setText("truthState", truthWord + (fixtureMode ? " TEST FIXTURE" : " RESEARCH"));
            setText("truthDetail", fixtureMode ?
                "Synthetic fixture mode validates contracts and equations only; no market research is published." :
                "Validated production payloads are consumed as an uncommitted research proposal; missing values remain unavailable.");
            setText("contractErrors", "");
            setHidden("modelReceipt", false);
            setText("publicationState", fixtureMode ? "TEST FIXTURE: owner-read publication disabled." : "UNCOMMITTED FOR REVIEW; owner-read publication deferred.");
            setText("qualificationReceipt", "disposition=" + qualification.disposition.toUpperCase() + "\nreasons=" + (qualification.reasonCodes.length ? qualification.reasonCodes.join(",") : "NONE"));
            setText("coverageReceipt", "state=" + coverage.state.toUpperCase() + "\ncandidateCount=" + (coverage.candidateCount === null ? "UNKNOWN" : coverage.candidateCount) + "\nqualifyingCount=" + (coverage.qualifyingCount === null ? "UNKNOWN" : coverage.qualifyingCount) + "\nmetricSampleN=" + (coverage.metricSampleN === null ? "UNKNOWN" : coverage.metricSampleN) + "\ncoverageRatio=" + (coverage.coverageRatio === null ? "UNKNOWN" : coverage.coverageRatio) + "\nintersectionMethod=" + coverage.intersectionMethod + "\nmissing=" + coverage.missingFieldIds.join(","));
            var luxuryMetrics = unit.metricObservations.filter(function (entry) { return entry.evidenceClass === "observed"; });
            setText("luxuryObservationReceipt", "observedLuxuryOccupancy=" + (luxuryMetrics.length ? luxuryMetrics[0].value : "UNKNOWN") + "\nobservedLuxuryAdrUsd=UNKNOWN\nobservedLuxuryRevenueUsd=UNKNOWN");
            var whole = payloadIndex.unitsByPair.get(unit.marketId + "::whole-market");
            var wholeObservation = whole && whole.metricObservations.length ? whole.metricObservations[0] : null;
            setText("broadContextReceipt", "wholeMarketOccupancy=" + (wholeObservation ? wholeObservation.value : "UNKNOWN") + "\ncontextOnly=true");
            if (wholeObservation && isLuxurySegment(unit.segmentId)) {
                var left = buildBasisSignature(wholeObservation, whole, configIndex);
                var targetMetricDefinition = resolvePairMetricDefinition(configIndex, segment, "occupancy");
                var right = buildBasisSignature({
                    metricDefinitionId: targetMetricDefinition.id,
                    marketId: unit.marketId,
                    geographyId: wholeObservation.geographyId,
                    populationId: segment.populationDefinitionId,
                    segmentId: unit.segmentId,
                    periodStart: wholeObservation.period.start,
                    periodEnd: wholeObservation.period.end,
                    currency: wholeObservation.currency || null,
                    unit: wholeObservation.unit || "ratio",
                    aggregation: wholeObservation.aggregation || "mean",
                    sourceMethodId: wholeObservation.sourceMethodId,
                    sampleFrameId: "UNKNOWN",
                    qualificationSignature: "UNKNOWN"
                }, unit, configIndex);
                var comparison = compareAligned(Object.assign({ value: wholeObservation.value }, left), Object.assign({ value: null }, right));
                setText("comparisonReceipt", "state=" + comparison.state + "\nreasons=" + comparison.mismatchReasons.join(",") + "\nabsoluteDelta=" + (comparison.absoluteDelta === null ? "UNKNOWN" : comparison.absoluteDelta) + "\nranking=UNKNOWN");
            } else setText("comparisonReceipt", "state=INCOMPARABLE\nreasons=SEGMENT_QUALIFICATION\nabsoluteDelta=UNKNOWN\nranking=UNKNOWN");

            var pair = pairContext(unit, configIndex, selectedScenario);
            var model = computeRentalResult(pair.context, pair.assumptions);
            diagnostics.payload = payloadIndex.payload;
            var occupancyButton = node("runOccupancyProof");
            if (occupancyButton) occupancyButton.onclick = function () {
                var result = computeAdjustedOccupancy(0.4, 0.1, 0.25);
                var invalid = computeAdjustedOccupancy(0.4, 0.1, -1);
                setText("occupancyProof", "adjustedOccupancy=" + result.value + "\ninvalid=" + invalid.errors[0].code + "\nnumericOnInvalid=" + own(invalid, "value"));
            };
            function paymentReceipt(rate, outputId) {
                var assumptions = clone(pair.assumptions);
                assumptions.annualMortgageRate = rate;
                var computed = computeRentalResult(pair.context, assumptions);
                var result = computed.result;
                if (!computed.ok || !result) {
                    setText(outputId, "branch=unavailable\nerrors=" + (computed.errors.map(function (error) { return error.code; }).join(",") || "PBRM-MODEL-UNAVAILABLE") + "\nnumericOutput=false");
                    return;
                }
                setText(outputId, "branch=" + result.paymentBranch + "\nmonthlyPaymentUsd=" + result.monthlyPaymentUsd + "\nannualDebtServiceUsd=" + result.annualDebtServiceUsd + "\ngrossYield=" + result.grossYield + "\nvariableOperatingCostUsd=" + result.variableOperatingCostUsd + "\nfixedRiskCostUsd=" + result.fixedRiskCostUsd + "\ntotalOperatingCostUsd=" + result.totalOperatingCostUsd + "\npreTaxCashFlowUsd=" + result.preTaxCashFlowUsd + "\nfinite=" + Object.keys(result).filter(function (key) { return typeof result[key] === "number"; }).every(function (key) { return Number.isFinite(result[key]); }));
            }
            var amortizationButton = node("runAmortizationProof");
            if (amortizationButton) amortizationButton.onclick = function () { paymentReceipt(0.06, "amortizationProof"); };
            var zeroButton = node("runZeroRateProof");
            if (zeroButton) zeroButton.onclick = function () { paymentReceipt(0, "zeroRateProof"); };
            return completeRender(unit, payloadIndex, configIndex, pair, model);
        }

        if (fixtureMode) {
            setText("fixtureBand", "TEST FIXTURE - synthetic records - persistence and owner-read publication disabled");
            if (node("fixtureBand")) node("fixtureBand").style.display = "block";
        }
        if (!fixtureAllowed) {
            showFailure("config", [pbrmError("PBRM-FIXTURE-UNKNOWN", "fixture", "fixture mode is not mapped by this route")]);
            return Promise.resolve(null);
        }
        return readJson(configPath).then(function (config) {
            var configValidation = validateConfig(config);
            if (!configValidation.ok) {
                showFailure("config", configValidation.errors);
                return null;
            }
            var configIndex = indexConfig(config);
            var market = configIndex.marketsById.get(adapter.marketId);
            if (!market || market.toolId !== adapter.toolId) {
                showFailure("config", [pbrmError("PBRM-ROUTE-IDENTITY", "adapter", "route identity mismatch")]);
                return null;
            }
            var routeName = location.pathname ? location.pathname.split("/").pop() : null;
            if (routeName && routeName !== market.routePath) {
                showFailure("config", [pbrmError("PBRM-ROUTE-IDENTITY", "location.pathname", "route path mismatch")]);
                return null;
            }
            runtime.config = config;
            runtime.configIndex = configIndex;
            runtime.market = market;
            runtime.mode = resolveMode(configIndex);
            if (!runtime.mode) {
                showFailure("config", [pbrmError("PBRM-PAIR-LINK", "mode", "INVALID PAIR LINK")]);
                return null;
            }
            wireRouteControls();
            var payloadRequests = config.marketCatalog.map(function (entry) {
                var path;
                if (fixtureMode) {
                    if (entry.marketId === adapter.marketId && query.fixture === "invalid") path = fixturePaths.invalidPayload;
                    else if (entry.marketId === adapter.marketId && query.fixture === "compared") path = fixturePaths.comparedPayloads && fixturePaths.comparedPayloads[entry.marketId];
                    else path = fixturePaths.payloads[entry.marketId];
                } else path = entry.payloadPath;
                if (typeof path !== "string" || !path) {
                    throw Object.assign(new Error("fixture path is not mapped"), { code: "PBRM-FIXTURE-UNKNOWN", path: "fixture." + query.fixture + "." + entry.marketId });
                }
                return readJson(path).then(function (payload) { return { entry: entry, payload: payload }; });
            });
            return Promise.all(payloadRequests).then(function (loaded) {
                var indexes = Object.create(null);
                var ownErrors = [];
                loaded.forEach(function (item) {
                    var payloadValidation = validateMarketPayload(item.payload, configIndex, item.entry.marketId);
                    if (payloadValidation.ok) indexes[item.entry.marketId] = indexMarketPayload(item.payload, configIndex);
                    else if (item.entry.marketId === adapter.marketId) ownErrors = payloadValidation.errors;
                });
                if (ownErrors.length || !indexes[adapter.marketId]) {
                    showFailure("payload", ownErrors.length ? ownErrors : [pbrmError("PBRM-PAYLOAD-FETCH", "payload", "route payload unavailable")]);
                    diagnostics.payload = null;
                    return null;
                }
                var segmentId = query.segment || market.defaultSegmentId;
                var pairKey = adapter.marketId + "::" + segmentId;
                if (!configIndex.segmentsByPair.has(pairKey) || !indexes[adapter.marketId].unitsByPair.has(pairKey)) {
                    showFailure("payload", [pbrmError("PBRM-PAIR-LINK", "segment", "INVALID PAIR LINK")]);
                    return null;
                }
                diagnostics.payloads = indexes;
                runtime.indexes = indexes;
                renderResearchAudit(buildResearchAuditProjection(configIndex, indexes));
                return renderUnit(indexes[adapter.marketId].unitsByPair.get(pairKey), indexes[adapter.marketId], configIndex);
            });
        }).catch(function (error) {
            var code = error && error.code === "PBRM-FETCH" ? "PBRM-CONFIG-FETCH" :
                (error && (error.code === "PBRM-CONFIG-METRIC-DEFINITION" || error.code === "PBRM-FIXTURE-UNKNOWN") ? error.code : "PBRM-CONFIG-PARSE");
            showFailure("config", [pbrmError(code, error && error.path ? error.path : configPath, "configuration unavailable")]);
            return null;
        });
    }

    var api = Object.freeze({
        validateConfig: validateConfig,
        indexConfig: indexConfig,
        validateMarketPayload: validateMarketPayload,
        indexMarketPayload: indexMarketPayload,
        evaluateLuxuryQualification: evaluateLuxuryQualification,
        computeCoverage: computeCoverage,
        buildBasisSignature: buildBasisSignature,
        compareAligned: compareAligned,
        normalizeUserAssumptions: normalizeUserAssumptions,
        computeAdjustedOccupancy: computeAdjustedOccupancy,
        computeEffectiveAvailableNights: computeEffectiveAvailableNights,
        computeMonthlyPayment: computeMonthlyPayment,
        computeRentalResult: computeRentalResult,
        resultIdentity: resultIdentity,
        buildViewModel: buildViewModel,
        buildToolRead: buildToolRead,
        buildResearchAuditProjection: buildResearchAuditProjection,
        mountRoute: mountRoute
    });

    root.RLRENTAL = api;
    if (typeof module !== "undefined" && module && module.exports) module.exports = api;
})();