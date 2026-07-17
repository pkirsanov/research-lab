/* RLCOMPANY - source-qualified company contracts and publication foundation.
   Browser/Node safe; no DOM, storage, provider credential, or authoring authority. */
(function () {
    "use strict";

    var root = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this);
    var HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
    var ID_PATTERN = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
    var CIK_PATTERN = /^\d{10}$/;
    var ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
    var MAX_SEC_RESPONSE_BYTES = 26214400;
    var STRUCTURAL_LIMITS = Object.freeze({ maxStringLength: 8192, maxArrayLength: 10000, maxDepth: 32, maxObjects: 4096, maxPathLength: 512 });
    var EVIDENCE_CLASSES = Object.freeze([
        "reported", "normalized", "derived", "guidance", "estimate", "user-assumption",
        "model-output", "management-claim", "market-observation", "news", "sentiment"
    ]);
    var EVIDENCE_STATES = Object.freeze([
        "current", "partial", "stale", "conflicted", "unavailable", "rejected",
        "restated", "absent-from-eligible-source"
    ]);
    var DEPENDENCY_STATES = Object.freeze(["available", "current", "stale", "conflicted", "unavailable", "rejected"]);
    var RIGHTS_CLASSES = Object.freeze(["redistributable-structured", "citation-and-summary-only", "restricted-reference"]);
    var ERROR_CODES = Object.freeze([
        "C010-CONFIG-SCHEMA", "C010-CONFIG-VERSION", "C010-CONFIG-REFERENCE",
        "C010-SOURCE-SCHEMA", "C010-SOURCE-UNAVAILABLE",
        "C010-IDENTITY-SCHEMA", "C010-IDENTITY-CONFLICT",
        "C010-PERIOD-SCHEMA", "C010-MAPPING-SCHEMA",
        "C010-INTEGRITY-DUPLICATE", "C010-INTEGRITY-NONFINITE", "C010-INTEGRITY-DEPENDENCY", "C010-INTEGRITY-BALANCE-SHEET",
        "C010-MODEL-DEPENDENCY", "C010-MODEL-CYCLE",
        "C010-BRIEF-SCHEMA",
        "C010-PUBLICATION-SCHEMA", "C010-PUBLICATION-NOT-FOUND", "C010-PUBLICATION-REF",
        "C010-PUBLICATION-HASH", "C010-PUBLICATION-COMPANY", "C010-PUBLICATION-GENERATION",
        "C010-PUBLICATION-ORIGIN", "C010-PUBLICATION-CONTENT-TYPE", "C010-PUBLICATION-JSON",
        "C010-RIGHTS-SCHEMA", "C010-RIGHTS-PRIVATE-DATA", "C010-PEER-SCHEMA", "C010-MARKET-SCHEMA"
    ]);
    var ERROR_CODE_SET = toSet(ERROR_CODES);
    var EVIDENCE_CLASS_SET = toSet(EVIDENCE_CLASSES);
    var EVIDENCE_STATE_SET = toSet(EVIDENCE_STATES);
    var DEPENDENCY_STATE_SET = toSet(DEPENDENCY_STATES);
    var RIGHTS_CLASS_SET = toSet(RIGHTS_CLASSES);

    function toSet(values) {
        var output = Object.create(null);
        values.forEach(function (value) { output[value] = true; });
        return output;
    }

    function isPlainObject(value) {
        return !!value && Object.prototype.toString.call(value) === "[object Object]";
    }

    function clone(value) {
        return value == null ? value : JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
        if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
        Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
        return Object.freeze(value);
    }

    function canonicalizeCompanyObject(value) {
        if (value === null) return "null";
        if (typeof value === "string") return JSON.stringify(value);
        if (typeof value === "boolean") return value ? "true" : "false";
        if (typeof value === "number") {
            if (!Number.isFinite(value)) throw contractException("C010-INTEGRITY-NONFINITE", "non-finite number cannot be canonicalized");
            return JSON.stringify(value);
        }
        if (Array.isArray(value)) return "[" + value.map(canonicalizeCompanyObject).join(",") + "]";
        if (isPlainObject(value)) {
            return "{" + Object.keys(value).sort().filter(function (key) {
                return value[key] !== undefined;
            }).map(function (key) {
                return JSON.stringify(key) + ":" + canonicalizeCompanyObject(value[key]);
            }).join(",") + "}";
        }
        throw contractException("C010-PUBLICATION-SCHEMA", "unsupported canonical value type: " + typeof value);
    }

    function utf8Binary(value) {
        var bytes = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(value) : null;
        if (bytes) {
            var encoded = "";
            for (var byteIndex = 0; byteIndex < bytes.length; byteIndex++) encoded += String.fromCharCode(bytes[byteIndex]);
            return encoded;
        }
        return unescape(encodeURIComponent(value));
    }

    function rotateRight(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }

    function sha256Hex(value) {
        var binary = utf8Binary(String(value));
        var words = [];
        var hash = [];
        var constants = [];
        var composite = {};
        var candidate = 2;
        while (constants.length < 64) {
            if (!composite[candidate]) {
                for (var multiple = candidate * candidate; multiple < 313; multiple += candidate) composite[multiple] = true;
                hash.push((Math.pow(candidate, 0.5) * 0x100000000) | 0);
                constants.push((Math.pow(candidate, 1 / 3) * 0x100000000) | 0);
            }
            candidate++;
        }
        var bitLength = binary.length * 8;
        binary += "\x80";
        while (binary.length % 64 !== 56) binary += "\x00";
        for (var charIndex = 0; charIndex < binary.length; charIndex++) {
            words[charIndex >> 2] = words[charIndex >> 2] || 0;
            words[charIndex >> 2] |= binary.charCodeAt(charIndex) << ((3 - charIndex) % 4) * 8;
        }
        words.push(Math.floor(bitLength / 0x100000000));
        words.push(bitLength | 0);
        for (var blockStart = 0; blockStart < words.length; blockStart += 16) {
            var schedule = words.slice(blockStart, blockStart + 16);
            var priorHash = hash.slice(0);
            for (var round = 0; round < 64; round++) {
                if (round >= 16) {
                    var word15 = schedule[round - 15];
                    var word2 = schedule[round - 2];
                    var sigma0 = rotateRight(word15, 7) ^ rotateRight(word15, 18) ^ (word15 >>> 3);
                    var sigma1 = rotateRight(word2, 17) ^ rotateRight(word2, 19) ^ (word2 >>> 10);
                    schedule[round] = (schedule[round - 16] + sigma0 + schedule[round - 7] + sigma1) | 0;
                }
                var choice = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
                var majority = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
                var sum0 = rotateRight(hash[0], 2) ^ rotateRight(hash[0], 13) ^ rotateRight(hash[0], 22);
                var sum1 = rotateRight(hash[4], 6) ^ rotateRight(hash[4], 11) ^ rotateRight(hash[4], 25);
                var temporary1 = (hash[7] + sum1 + choice + constants[round] + schedule[round]) | 0;
                var temporary2 = (sum0 + majority) | 0;
                hash = [(temporary1 + temporary2) | 0, hash[0], hash[1], hash[2], (hash[3] + temporary1) | 0, hash[4], hash[5], hash[6]];
            }
            for (var hashIndex = 0; hashIndex < 8; hashIndex++) hash[hashIndex] = (hash[hashIndex] + priorHash[hashIndex]) | 0;
        }
        return hash.map(function (part) { return (part >>> 0).toString(16).padStart(8, "0"); }).join("");
    }

    function companyObjectSha256(value) {
        return "sha256:" + sha256Hex(canonicalizeCompanyObject(value));
    }

    function companyManifestSha256(manifest) {
        var input = clone(manifest);
        if (isPlainObject(input)) delete input.manifestSha256;
        return companyObjectSha256(input);
    }

    function contractException(code, message) {
        var error = new Error(message);
        error.name = "CompanyContractError";
        error.code = code;
        return error;
    }

    function makeError(code, scope, severity, companyId, affectedRefs, observed, required, preserveLastValid) {
        if (!ERROR_CODE_SET[code]) throw contractException("C010-PUBLICATION-SCHEMA", "unknown CompanyError code: " + code);
        return deepFreeze({
            contractVersion: "company-error/v1",
            code: code,
            scope: scope,
            severity: severity,
            companyId: companyId,
            affectedRefs: affectedRefs.slice(),
            observed: observed,
            required: required,
            preserveLastValid: preserveLastValid
        });
    }

    function addError(errors, code, scope, companyId, affectedRef, observed, required) {
        errors.push(makeError(code, scope, "blocking", companyId, affectedRef ? [affectedRef] : [], observed, required, true));
    }

    function finishValidation(errors, value) {
        if (errors.length) return deepFreeze({ ok: false, errors: errors.slice() });
        return deepFreeze({ ok: true, value: clone(value), errors: [] });
    }

    function hasExactKeys(value, keys) {
        if (!isPlainObject(value)) return false;
        var actual = Object.keys(value).sort();
        var expected = keys.slice().sort();
        return actual.length === expected.length && actual.every(function (key, index) { return key === expected[index]; });
    }

    function isBoundedString(value, allowEmpty) {
        return typeof value === "string" && value.length <= STRUCTURAL_LIMITS.maxStringLength && (allowEmpty || value.length > 0);
    }

    function isId(value) {
        return typeof value === "string" && ID_PATTERN.test(value);
    }

    function isIso(value) {
        return typeof value === "string" && Number.isFinite(Date.parse(value));
    }

    function isIsoDate(value) {
        return typeof value === "string" && ISO_DATE_PATTERN.test(value) && Number.isFinite(Date.parse(value + "T00:00:00Z"));
    }

    function isInteger(value, minimum) {
        return Number.isInteger(value) && value >= minimum;
    }

    function allStrings(values, allowEmpty) {
        return Array.isArray(values) && values.length <= STRUCTURAL_LIMITS.maxArrayLength && values.every(function (value) { return isBoundedString(value, allowEmpty); });
    }

    function uniqueStrings(values, allowEmpty) {
        return allStrings(values, allowEmpty) && new Set(values).size === values.length;
    }

    function validateBounds(value, path, depth, errors, companyId) {
        if (depth > STRUCTURAL_LIMITS.maxDepth) {
            addError(errors, "C010-PUBLICATION-SCHEMA", "publication", companyId, path, "object depth exceeds structural bound", "bounded JSON depth");
            return;
        }
        if (typeof value === "number" && !Number.isFinite(value)) {
            addError(errors, "C010-INTEGRITY-NONFINITE", "integrity", companyId, path, "non-finite numeric value", "finite number or source decimal string");
            return;
        }
        if (typeof value === "string" && value.length > STRUCTURAL_LIMITS.maxStringLength) {
            addError(errors, "C010-PUBLICATION-SCHEMA", "publication", companyId, path, "string exceeds structural bound", "bounded string");
            return;
        }
        if (Array.isArray(value)) {
            if (value.length > STRUCTURAL_LIMITS.maxArrayLength) addError(errors, "C010-PUBLICATION-SCHEMA", "publication", companyId, path, "array exceeds structural bound", "bounded array");
            value.forEach(function (entry, index) { validateBounds(entry, path + "[" + index + "]", depth + 1, errors, companyId); });
            return;
        }
        if (isPlainObject(value)) Object.keys(value).forEach(function (key) { validateBounds(value[key], path + "." + key, depth + 1, errors, companyId); });
    }

    function isSafeRelativePath(value) {
        if (typeof value !== "string" || value.length === 0 || value.length > STRUCTURAL_LIMITS.maxPathLength) return false;
        if (value[0] === "/" || value.indexOf("\\") !== -1 || /[?#\u0000-\u001f]/.test(value) || /^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
        var segments = value.split("/");
        return segments.every(function (segment) { return segment.length > 0 && segment !== "." && segment !== ".."; });
    }

    function validateObjectRef(value) {
        var errors = [];
        if (!hasExactKeys(value, ["contractVersion", "path", "sha256", "objectId"]) || value.contractVersion !== "company-object-ref/v1" || !isSafeRelativePath(value.path) || !HASH_PATTERN.test(value.sha256 || "") || !isId(value.objectId)) {
            addError(errors, "C010-PUBLICATION-REF", "publication", null, value && value.objectId ? value.objectId : null, "invalid object reference", "company-object-ref/v1 with safe relative path, sha256, and objectId");
        }
        return finishValidation(errors, value);
    }

    function validateSourceClock(value, errors, companyId, path) {
        var keys = ["reportingPeriodEnd", "sourcePublishedAt", "acceptedAt", "retrievedAt", "observedAt"];
        if (!hasExactKeys(value, keys)) {
            addError(errors, "C010-SOURCE-SCHEMA", "source", companyId, path, "invalid source clock fields", "all five explicit source clocks");
            return;
        }
        keys.forEach(function (key) {
            if (value[key] !== null && !isIso(value[key]) && !(key === "reportingPeriodEnd" && isIsoDate(value[key]))) addError(errors, "C010-SOURCE-SCHEMA", "source", companyId, path + "." + key, "invalid source clock", "ISO timestamp, ISO date for period end, or explicit null");
        });
    }

    function validateCompanyIdentity(value) {
        var errors = [];
        var keys = ["contractVersion", "companyId", "issuerName", "ticker", "exchange", "securityName", "cik", "reportingCurrency", "fiscalYearEnd", "accountingBasis", "identitySourceRefs", "continuity", "status"];
        if (!hasExactKeys(value, keys) || value.contractVersion !== "company-identity/v1") {
            addError(errors, "C010-IDENTITY-SCHEMA", "identity", value && value.companyId ? value.companyId : null, null, "invalid CompanyIdentity fields or version", "exact company-identity/v1 contract");
            return finishValidation(errors, value);
        }
        if (!isId(value.companyId) || !isBoundedString(value.issuerName, false) || !isBoundedString(value.ticker, false) || !isBoundedString(value.exchange, false) || !isBoundedString(value.securityName, false) || !CIK_PATTERN.test(value.cik) || !/^[A-Z]{3}$/.test(value.reportingCurrency) || !/^\d{2}-\d{2}$/.test(value.fiscalYearEnd) || !["US-GAAP"].includes(value.accountingBasis) || !["verified", "conflicted", "inactive", "unsupported"].includes(value.status)) {
            addError(errors, "C010-IDENTITY-SCHEMA", "identity", value.companyId, value.companyId, "invalid issuer identity value", "stable SEC identity, listing, currency, fiscal year end, accounting basis, and closed status");
        }
        if (!Array.isArray(value.identitySourceRefs) || value.identitySourceRefs.length === 0 || value.identitySourceRefs.some(function (ref) { return !validateObjectRef(ref).ok; })) addError(errors, "C010-IDENTITY-SCHEMA", "identity", value.companyId, value.companyId, "identity source references are absent or invalid", "one or more valid identity source refs");
        if (!hasExactKeys(value.continuity, ["state", "decision", "predecessorCompanyIds", "rationale"]) || !["continuous", "changed", "conflicted"].includes(value.continuity.state) || !["accepted", "rejected", "pending"].includes(value.continuity.decision) || !allStrings(value.continuity.predecessorCompanyIds, false) || !isBoundedString(value.continuity.rationale, false)) addError(errors, "C010-IDENTITY-SCHEMA", "identity", value.companyId, value.companyId, "invalid continuity decision", "explicit continuity state, decision, predecessors, and rationale");
        if (value.status === "verified" && value.continuity.decision !== "accepted") addError(errors, "C010-IDENTITY-CONFLICT", "identity", value.companyId, value.companyId, "verified identity lacks accepted continuity", "accepted continuity decision");
        return finishValidation(errors, value);
    }

    function validateReportingPeriod(value) {
        var errors = [];
        var keys = ["contractVersion", "periodId", "kind", "start", "end", "durationDays", "fiscalYear", "fiscalQuarter", "form", "accession", "filedAt", "amendmentState", "comparability", "qualifications"];
        if (!hasExactKeys(value, keys) || value.contractVersion !== "reporting-period/v1") {
            addError(errors, "C010-PERIOD-SCHEMA", "period", null, value && value.periodId ? value.periodId : null, "invalid ReportingPeriod fields or version", "exact reporting-period/v1 contract");
            return finishValidation(errors, value);
        }
        var durationKind = value.kind !== "instant";
        if (!isId(value.periodId) || !["instant", "quarter", "year-to-date", "annual", "trailing"].includes(value.kind) || !isIsoDate(value.end) || (durationKind ? !isIsoDate(value.start) || !isInteger(value.durationDays, 1) : value.start !== null || value.durationDays !== null) || !isInteger(value.fiscalYear, 1900) || (value.fiscalQuarter !== null && ![1, 2, 3, 4].includes(value.fiscalQuarter)) || !["10-K", "10-K/A", "10-Q", "10-Q/A", "8-K", "issuer-release"].includes(value.form) || (value.accession !== null && !isBoundedString(value.accession, false)) || !isIso(value.filedAt) || !["original", "amended", "recast"].includes(value.amendmentState) || !["comparable", "qualified", "incomparable"].includes(value.comparability) || !allStrings(value.qualifications, false)) addError(errors, "C010-PERIOD-SCHEMA", "period", null, value.periodId, "invalid reporting-period value", "explicit period class, clocks, fiscal labels, form, amendment, and comparability");
        return finishValidation(errors, value);
    }

    function validateSourceArtifact(value) {
        var errors = [];
        var keys = ["contractVersion", "sourceId", "companyId", "sourceKind", "url", "documentId", "clocks", "contentSha256", "rights", "availability", "limitations"];
        if (!hasExactKeys(value, keys) || value.contractVersion !== "source-artifact/v1") {
            addError(errors, "C010-SOURCE-SCHEMA", "source", value && value.companyId ? value.companyId : null, value && value.sourceId ? value.sourceId : null, "invalid SourceArtifact fields or version", "exact source-artifact/v1 contract");
            return finishValidation(errors, value);
        }
        var parsedUrl = null;
        try { parsedUrl = new URL(value.url); } catch (_error) { parsedUrl = null; }
        if (!isId(value.sourceId) || !isId(value.companyId) || !["sec-submissions", "sec-companyfacts", "filing", "issuer-release", "issuer-presentation", "transcript", "estimate-set", "market", "news", "sentiment"].includes(value.sourceKind) || !parsedUrl || parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password || !isBoundedString(value.documentId, false) || (value.contentSha256 !== null && !HASH_PATTERN.test(value.contentSha256)) || !RIGHTS_CLASS_SET[value.rights] || !["available", "metadata-only", "link-unavailable"].includes(value.availability) || !allStrings(value.limitations, false)) addError(errors, "C010-SOURCE-SCHEMA", "source", value.companyId, value.sourceId, "invalid source artifact value", "public HTTPS source identity, explicit clocks, hash, rights, availability, and limitations");
        validateSourceClock(value.clocks, errors, value.companyId, value.sourceId + ".clocks");
        return finishValidation(errors, value);
    }

    function parseSecSubmissionsResponse(rawText, provenance) {
        var provenanceKeys = ["sourceUrl", "cik", "retrievedAt", "mediaType", "rights", "requestIdentityPolicy"];
        if (typeof rawText !== "string" || rawText.length === 0 || utf8Binary(rawText).length > MAX_SEC_RESPONSE_BYTES) throw contractException("C010-SOURCE-SCHEMA", "SEC Submissions response bytes must be non-empty and within the configured response bound");
        if (!hasExactKeys(provenance, provenanceKeys) || !CIK_PATTERN.test(provenance.cik || "") || provenance.sourceUrl !== "https://data.sec.gov/submissions/CIK" + provenance.cik + ".json" || !isIso(provenance.retrievedAt) || !/^application\/json(?:;|$)/i.test(provenance.mediaType || "") || !RIGHTS_CLASS_SET[provenance.rights] || provenance.requestIdentityPolicy !== "sec-user-agent-required/v1") throw contractException("C010-SOURCE-SCHEMA", "SEC Submissions provenance must identify the exact URL, CIK, retrieval clock, media type, rights, and request-identity policy");
        var response;
        try { response = JSON.parse(rawText); } catch (_error) { throw contractException("C010-PUBLICATION-JSON", "SEC Submissions response bytes are not valid JSON"); }
        var responseCik = response && /^\d{1,10}$/.test(String(response.cik)) ? String(response.cik).padStart(10, "0") : null;
        var recent = response && response.filings && response.filings.recent;
        var filingFields = ["accessionNumber", "filingDate", "reportDate", "acceptanceDateTime", "form", "primaryDocument", "primaryDocDescription"];
        var recentArraysValid = isPlainObject(recent) && filingFields.every(function (field) { return Array.isArray(recent[field]); });
        var filingCount = recentArraysValid ? recent.form.length : -1;
        if (responseCik !== provenance.cik || !isBoundedString(response.name, false) || !Array.isArray(response.tickers) || response.tickers.length === 0 || !allStrings(response.tickers, false) || !Array.isArray(response.exchanges) || response.exchanges.length !== response.tickers.length || !allStrings(response.exchanges, false) || !/^\d{4}$/.test(response.fiscalYearEnd || "") || !recentArraysValid || filingCount === 0 || filingFields.some(function (field) { return recent[field].length !== filingCount; })) throw contractException("C010-SOURCE-SCHEMA", "SEC Submissions response is missing exact issuer identity or aligned recent-filing arrays");
        var quarterlyIndex = recent.form.findIndex(function (form) { return form === "10-Q" || form === "10-Q/A"; });
        if (quarterlyIndex === -1 || !isBoundedString(recent.accessionNumber[quarterlyIndex], false) || !isIsoDate(recent.filingDate[quarterlyIndex]) || !isIsoDate(recent.reportDate[quarterlyIndex]) || !isIso(recent.acceptanceDateTime[quarterlyIndex]) || !isBoundedString(recent.primaryDocument[quarterlyIndex], false) || !isBoundedString(recent.primaryDocDescription[quarterlyIndex], true)) throw contractException("C010-SOURCE-SCHEMA", "SEC Submissions response has no complete recent quarterly filing identity");
        return deepFreeze({
            contractVersion: "company-sec-submissions-normalized/v1",
            contentSha256: "sha256:" + sha256Hex(rawText),
            sourceUrl: provenance.sourceUrl,
            cik: responseCik,
            issuerName: response.name,
            tickers: response.tickers.slice(),
            exchanges: response.exchanges.slice(),
            fiscalYearEnd: response.fiscalYearEnd.slice(0, 2) + "-" + response.fiscalYearEnd.slice(2),
            latestQuarterlyFiling: {
                accessionNumber: recent.accessionNumber[quarterlyIndex],
                filingDate: recent.filingDate[quarterlyIndex],
                reportDate: recent.reportDate[quarterlyIndex],
                acceptanceDateTime: recent.acceptanceDateTime[quarterlyIndex],
                form: recent.form[quarterlyIndex],
                primaryDocument: recent.primaryDocument[quarterlyIndex],
                primaryDocDescription: recent.primaryDocDescription[quarterlyIndex]
            },
            provenance: clone(provenance)
        });
    }

    function validateFactObservation(value) {
        var errors = [];
        var keys = ["contractVersion", "observationId", "companyId", "evidenceClass", "sourceRef", "periodRef", "sourceConcept", "value", "valueType", "unit", "currency", "decimals", "signConvention", "state", "clocks", "definition", "qualifiers"];
        if (!hasExactKeys(value, keys) || value.contractVersion !== "fact-observation/v1") {
            addError(errors, "C010-SOURCE-SCHEMA", "source", value && value.companyId ? value.companyId : null, value && value.observationId ? value.observationId : null, "invalid FactObservation fields or version", "exact fact-observation/v1 contract");
            return finishValidation(errors, value);
        }
        if (!isId(value.observationId) || !isId(value.companyId) || !EVIDENCE_CLASS_SET[value.evidenceClass] || !validateObjectRef(value.sourceRef).ok || (value.periodRef !== null && !validateObjectRef(value.periodRef).ok) || !isBoundedString(value.sourceConcept, false) || (value.value !== null && !isBoundedString(value.value, true)) || !["decimal", "integer", "string", "boolean"].includes(value.valueType) || !isBoundedString(value.unit, false) || (value.currency !== null && !/^[A-Z]{3}$/.test(value.currency)) || (value.decimals !== null && !/^-?\d+$/.test(value.decimals)) || !isBoundedString(value.signConvention, false) || !EVIDENCE_STATE_SET[value.state] || !isBoundedString(value.definition, false) || !allStrings(value.qualifiers, false)) addError(errors, "C010-SOURCE-SCHEMA", "source", value.companyId, value.observationId, "invalid fact observation value", "source-qualified observation with explicit class, state, concept, value class, unit, and lineage");
        if (["unavailable", "absent-from-eligible-source", "rejected"].includes(value.state) && value.value !== null) addError(errors, "C010-INTEGRITY-DEPENDENCY", "integrity", value.companyId, value.observationId, "unavailable observation carries a value", "explicit null without zero or carried value");
        if ((value.valueType === "decimal" || value.valueType === "integer") && value.value !== null && !parseFiniteDecimal(value.value).ok) addError(errors, "C010-INTEGRITY-NONFINITE", "integrity", value.companyId, value.observationId, "numeric source value is not a finite decimal string", "reconstructable finite decimal string");
        validateSourceClock(value.clocks, errors, value.companyId, value.observationId + ".clocks");
        return finishValidation(errors, value);
    }

    function validateNormalizedFact(value) {
        var errors = [];
        var keys = ["contractVersion", "factId", "normalizedConcept", "currentObservationId", "observationIds", "mappingId", "mappingVersion", "transformation", "resolutionState", "resolutionReason"];
        if (!hasExactKeys(value, keys) || value.contractVersion !== "normalized-fact/v1") {
            addError(errors, "C010-MAPPING-SCHEMA", "mapping", null, value && value.factId ? value.factId : null, "invalid NormalizedFact fields or version", "exact normalized-fact/v1 contract");
            return finishValidation(errors, value);
        }
        if (!isId(value.factId) || !isBoundedString(value.normalizedConcept, false) || (value.currentObservationId !== null && !isId(value.currentObservationId)) || !allStrings(value.observationIds, false) || !isId(value.mappingId) || !isBoundedString(value.mappingVersion, false) || !hasExactKeys(value.transformation, ["sign", "scalePower10", "aggregation"]) || ![-1, 1].includes(value.transformation.sign) || !Number.isInteger(value.transformation.scalePower10) || !isBoundedString(value.transformation.aggregation, false) || !["reconciled", "restated", "conflicted", "unmapped", "unavailable"].includes(value.resolutionState) || !isBoundedString(value.resolutionReason, false)) addError(errors, "C010-MAPPING-SCHEMA", "mapping", null, value.factId, "invalid normalized fact value", "explicit mapping, transformation, observation lineage, and resolution");
        if (["conflicted", "unmapped", "unavailable"].includes(value.resolutionState) && value.currentObservationId !== null) addError(errors, "C010-MAPPING-SCHEMA", "mapping", null, value.factId, "unresolved fact selects a current observation", "null currentObservationId while unresolved");
        if (value.currentObservationId !== null && value.observationIds.indexOf(value.currentObservationId) === -1) addError(errors, "C010-CONFIG-REFERENCE", "config", null, value.factId, "current observation is absent from observationIds", "current observation included in explicit lineage");
        return finishValidation(errors, value);
    }

    function validateCompanyDossier(value) {
        var errors = [];
        var keys = ["contractVersion", "dossierId", "publicationId", "generation", "companyId", "evidenceCutoff", "identityRef", "periodRefs", "sourceRefs", "observations", "normalizedFacts", "mappings", "formulas", "claims", "consumers", "dependencyGraph", "evidenceCoverage", "restatements", "conflicts", "unavailableLinks", "validation"];
        if (!hasExactKeys(value, keys) || value.contractVersion !== "company-dossier/v1") {
            addError(errors, "C010-PUBLICATION-SCHEMA", "publication", value && value.companyId ? value.companyId : null, value && value.dossierId ? value.dossierId : null, "invalid CompanyDossier fields or version", "exact company-dossier/v1 foundation contract");
            return finishValidation(errors, value);
        }
        if (!isId(value.dossierId) || !isId(value.publicationId) || !isInteger(value.generation, 1) || !isId(value.companyId) || !isIso(value.evidenceCutoff) || !validateObjectRef(value.identityRef).ok || !Array.isArray(value.periodRefs) || value.periodRefs.some(function (ref) { return !validateObjectRef(ref).ok; }) || !Array.isArray(value.sourceRefs) || value.sourceRefs.some(function (ref) { return !validateObjectRef(ref).ok; }) || !Array.isArray(value.observations) || !Array.isArray(value.normalizedFacts) || !Array.isArray(value.mappings) || !Array.isArray(value.formulas) || !Array.isArray(value.claims) || !Array.isArray(value.consumers) || !isPlainObject(value.dependencyGraph) || !Array.isArray(value.evidenceCoverage) || !Array.isArray(value.restatements) || !Array.isArray(value.conflicts) || !Array.isArray(value.unavailableLinks) || !hasExactKeys(value.validation, ["status", "checks"]) || value.validation.status !== "validated" || !allStrings(value.validation.checks, false)) addError(errors, "C010-PUBLICATION-SCHEMA", "publication", value.companyId, value.dossierId, "invalid dossier identity, refs, collections, or validation receipt", "complete validated dossier graph");
        value.observations.forEach(function (observation) { var result = validateFactObservation(observation); if (!result.ok) errors = errors.concat(result.errors); });
        value.normalizedFacts.forEach(function (fact) { var result = validateNormalizedFact(fact); if (!result.ok) errors = errors.concat(result.errors); });
        var duplicateCollections = [
            [value.observations, "observationId"], [value.normalizedFacts, "factId"], [value.mappings, "mappingId"],
            [value.formulas, "formulaId"], [value.claims, "claimId"], [value.consumers, "consumerId"],
            [value.restatements, "restatementId"], [value.conflicts, "conflictId"], [value.unavailableLinks, "unavailableLinkId"]
        ];
        duplicateCollections.forEach(function (entry) { validateUniqueIds(entry[0], entry[1], errors, value.companyId); });
        try { propagateDependencyStates(value.dependencyGraph); } catch (error) { addError(errors, error.code || "C010-INTEGRITY-DEPENDENCY", "integrity", value.companyId, value.dossierId, error.message, "acyclic dependency graph with explicit states"); }
        return finishValidation(errors, value);
    }

    function validatePublicationManifest(value) {
        var errors = [];
        var keys = ["contractVersion", "publicationId", "generation", "companyId", "createdAt", "sourceCutoff", "configFingerprint", "policyVersions", "identityRef", "summaryRef", "dossierRef", "modelPackRef", "briefRef", "ownerReadRef", "sourceRefs", "historyRefs", "validation", "manifestSha256"];
        if (!hasExactKeys(value, keys) || value.contractVersion !== "company-publication-manifest/v1") {
            addError(errors, "C010-PUBLICATION-SCHEMA", "publication", value && value.companyId ? value.companyId : null, value && value.publicationId ? value.publicationId : null, "invalid publication manifest fields or version", "exact company-publication-manifest/v1 contract");
            return finishValidation(errors, value);
        }
        var refs = [value.identityRef, value.summaryRef, value.dossierRef, value.ownerReadRef].concat(value.sourceRefs || [], value.historyRefs || []);
        if (value.modelPackRef !== null) refs.push(value.modelPackRef);
        if (value.briefRef !== null) refs.push(value.briefRef);
        if (!isId(value.publicationId) || !isInteger(value.generation, 1) || !isId(value.companyId) || !isIso(value.createdAt) || !isIso(value.sourceCutoff) || !HASH_PATTERN.test(value.configFingerprint || "") || !isPlainObject(value.policyVersions) || Object.keys(value.policyVersions).length === 0 || Object.keys(value.policyVersions).some(function (key) { return !isId(key) || !isBoundedString(value.policyVersions[key], false); }) || refs.some(function (ref) { return !validateObjectRef(ref).ok; }) || !hasExactKeys(value.validation, ["status", "checks"]) || value.validation.status !== "validated" || !allStrings(value.validation.checks, false) || !HASH_PATTERN.test(value.manifestSha256 || "")) addError(errors, "C010-PUBLICATION-SCHEMA", "publication", value.companyId, value.publicationId, "invalid publication identity, clocks, policies, refs, validation, or hash", "complete validated content-addressed publication manifest");
        validateUniqueIds(refs, "objectId", errors, value.companyId);
        return finishValidation(errors, value);
    }

    function validateCompanyError(value) {
        var errors = [];
        var keys = ["contractVersion", "code", "scope", "severity", "companyId", "affectedRefs", "observed", "required", "preserveLastValid"];
        if (!hasExactKeys(value, keys) || value.contractVersion !== "company-error/v1" || !ERROR_CODE_SET[value.code] || !["config", "source", "identity", "period", "mapping", "integrity", "model", "brief", "publication", "rights", "peer", "market"].includes(value.scope) || !["blocking", "scoped"].includes(value.severity) || (value.companyId !== null && !isId(value.companyId)) || !allStrings(value.affectedRefs, false) || !isBoundedString(value.observed, false) || !isBoundedString(value.required, false) || typeof value.preserveLastValid !== "boolean") addError(errors, "C010-PUBLICATION-SCHEMA", "publication", value && value.companyId ? value.companyId : null, null, "invalid or unknown CompanyError", "closed company-error/v1 contract and known code");
        return finishValidation(errors, value);
    }

    function validateUniqueIds(values, key, errors, companyId) {
        if (!Array.isArray(values)) return;
        var seen = Object.create(null);
        values.forEach(function (value) {
            var id = value && value[key];
            if (!isId(id)) {
                addError(errors, "C010-PUBLICATION-SCHEMA", "publication", companyId, key, "missing or invalid " + key, "bounded stable identifier");
            } else if (seen[id]) {
                addError(errors, "C010-INTEGRITY-DUPLICATE", "integrity", companyId, id, "duplicate identifier", "unique identifiers within one publication");
            }
            seen[id] = true;
        });
    }

    function validateConfiguredCompany(company, errors, sourceIds, companyIds) {
        var keys = ["companyId", "issuerName", "ticker", "exchange", "securityName", "cik", "reportingCurrency", "fiscalYearEnd", "accountingBasis", "identitySourceIds", "continuity"];
        var affectedRef = company && company.companyId ? company.companyId : "companies";
        var continuityKeys = ["state", "decision", "predecessorCompanyIds", "rationale"];
        if (!hasExactKeys(company, keys) || !isId(company.companyId) || !isBoundedString(company.issuerName, false) || !isBoundedString(company.ticker, false) || !isBoundedString(company.exchange, false) || !isBoundedString(company.securityName, false) || !CIK_PATTERN.test(company.cik || "") || !/^[A-Z]{3}$/.test(company.reportingCurrency || "") || !/^\d{2}-\d{2}$/.test(company.fiscalYearEnd || "") || !["US-GAAP"].includes(company.accountingBasis) || !uniqueStrings(company.identitySourceIds, false) || company.identitySourceIds.length === 0 || !hasExactKeys(company.continuity, continuityKeys) || !["continuous", "changed", "conflicted"].includes(company.continuity.state) || !["accepted", "rejected", "pending"].includes(company.continuity.decision) || !uniqueStrings(company.continuity.predecessorCompanyIds, false) || !isBoundedString(company.continuity.rationale, false)) {
            addError(errors, "C010-CONFIG-SCHEMA", "config", company && company.companyId ? company.companyId : null, affectedRef, "invalid configured company identity", "exact issuer, security, filing, fiscal, accounting, source, and continuity fields");
            return;
        }
        company.identitySourceIds.forEach(function (sourceId) {
            if (!sourceIds[sourceId]) addError(errors, "C010-CONFIG-REFERENCE", "config", company.companyId, sourceId, "company identity references an unknown source", "configured sourceId");
        });
        company.continuity.predecessorCompanyIds.forEach(function (companyId) {
            if (companyId === company.companyId || !companyIds[companyId]) addError(errors, "C010-CONFIG-REFERENCE", "config", company.companyId, companyId, "company continuity references an unknown or self predecessor", "different configured companyId");
        });
    }

    function validateConfiguredSource(source, errors, allowedSourcePaths, publicRightsClasses) {
        var keys = ["sourceId", "sourceKind", "scheme", "host", "pathPattern", "rights"];
        var affectedRef = source && source.sourceId ? source.sourceId : "sources";
        if (!hasExactKeys(source, keys) || !isId(source.sourceId) || !["sec-submissions", "sec-companyfacts"].includes(source.sourceKind) || source.scheme !== "https" || source.host !== "data.sec.gov" || !isBoundedString(source.pathPattern, false) || !RIGHTS_CLASS_SET[source.rights]) {
            addError(errors, "C010-CONFIG-SCHEMA", "config", null, affectedRef, "invalid configured source", "exact allowlisted SEC source identity, HTTPS path, and rights class");
            return;
        }
        if (!allowedSourcePaths[source.pathPattern]) addError(errors, "C010-CONFIG-REFERENCE", "config", null, source.pathPattern, "source path is not derived from a configured company and SEC path template", "configured company CIK and allowlisted SEC path");
        if (!publicRightsClasses[source.rights]) addError(errors, "C010-CONFIG-REFERENCE", "rights", null, source.rights, "source rights are absent from the public rights policy", "public rights class");
    }

    function validateConfiguredMapping(mapping, errors, sourceIds) {
        var keys = ["mappingId", "mappingVersion", "sourceId", "sourceConcept", "normalizedConcept", "evidenceClass", "transformation", "status"];
        var affectedRef = mapping && mapping.mappingId ? mapping.mappingId : "mappings";
        if (!hasExactKeys(mapping, keys) || !isId(mapping.mappingId) || !isBoundedString(mapping.mappingVersion, false) || !isId(mapping.sourceId) || !isBoundedString(mapping.sourceConcept, false) || !isBoundedString(mapping.normalizedConcept, false) || !EVIDENCE_CLASS_SET[mapping.evidenceClass] || !hasExactKeys(mapping.transformation, ["sign", "scalePower10", "aggregation"]) || ![-1, 1].includes(mapping.transformation.sign) || !Number.isInteger(mapping.transformation.scalePower10) || !isBoundedString(mapping.transformation.aggregation, false) || !["accepted", "proposed", "retired"].includes(mapping.status)) {
            addError(errors, "C010-CONFIG-SCHEMA", "config", null, affectedRef, "invalid configured mapping", "exact mapping contract with source, concept, evidence class, transformation, and status");
            return;
        }
        if (!sourceIds[mapping.sourceId]) addError(errors, "C010-CONFIG-REFERENCE", "config", null, mapping.sourceId, "mapping references an unknown source", "configured sourceId");
    }

    function validateConfiguredFormula(formula, errors, mappingIds) {
        var keys = ["formulaId", "formulaVersion", "inputMappingIds", "outputConcept", "expression", "status"];
        var affectedRef = formula && formula.formulaId ? formula.formulaId : "formulas";
        if (!hasExactKeys(formula, keys) || !isId(formula.formulaId) || !isBoundedString(formula.formulaVersion, false) || !uniqueStrings(formula.inputMappingIds, false) || formula.inputMappingIds.length === 0 || !isBoundedString(formula.outputConcept, false) || !isBoundedString(formula.expression, false) || !["accepted", "proposed", "retired"].includes(formula.status)) {
            addError(errors, "C010-CONFIG-SCHEMA", "config", null, affectedRef, "invalid configured formula", "exact formula contract with explicit mapping inputs, output, expression, and status");
            return;
        }
        formula.inputMappingIds.forEach(function (mappingId) { if (!mappingIds[mappingId]) addError(errors, "C010-CONFIG-REFERENCE", "config", null, mappingId, "formula references an unknown mapping", "configured mappingId"); });
    }

    function validateConfiguredArchetypeDefinition(definition, errors, formulaIds) {
        var keys = ["archetypeId", "archetypeVersion", "label", "status", "kpiPriorities", "diagnosticPolicies"];
        var affectedRef = definition && definition.archetypeId ? definition.archetypeId : "archetype definitions";
        if (!hasExactKeys(definition, keys) || !isId(definition.archetypeId) || !isBoundedString(definition.archetypeVersion, false) || !isBoundedString(definition.label, false) || !["accepted", "proposed", "retired"].includes(definition.status) || !Array.isArray(definition.kpiPriorities) || !Array.isArray(definition.diagnosticPolicies)) {
            addError(errors, "C010-CONFIG-SCHEMA", "config", null, affectedRef, "invalid archetype definition", "exact versioned archetype definition with label, status, ordered KPI priorities, and diagnostic policies");
            return;
        }
        if (definition.status === "accepted" && definition.kpiPriorities.length === 0) addError(errors, "C010-CONFIG-SCHEMA", "config", null, affectedRef, "accepted archetype defines no KPI priority", "at least one ordered KPI priority for an accepted archetype");
        var kpiIds = definition.kpiPriorities.map(function (kpi) { return kpi && kpi.kpiId; });
        if (new Set(kpiIds).size !== kpiIds.length) addError(errors, "C010-INTEGRITY-DUPLICATE", "integrity", null, affectedRef, "duplicate KPI priority id", "unique KPI priority ids within one archetype");
        definition.kpiPriorities.forEach(function (kpi) {
            if (!hasExactKeys(kpi, ["kpiId", "label", "normalizedConcept", "formulaId"]) || !isId(kpi.kpiId) || !isBoundedString(kpi.label, false) || !isBoundedString(kpi.normalizedConcept, false) || (kpi.formulaId !== null && !isId(kpi.formulaId))) {
                addError(errors, "C010-CONFIG-SCHEMA", "config", null, kpi && kpi.kpiId ? kpi.kpiId : affectedRef, "invalid KPI priority", "explicit kpiId, label, normalizedConcept, and a formulaId or explicit null");
            } else if (kpi.formulaId !== null && formulaIds && !formulaIds[kpi.formulaId]) {
                addError(errors, "C010-CONFIG-REFERENCE", "config", null, kpi.formulaId, "KPI priority references an unknown formula", "configured formulaId");
            }
        });
        var policyIds = definition.diagnosticPolicies.map(function (policy) { return policy && policy.policyId; });
        if (new Set(policyIds).size !== policyIds.length) addError(errors, "C010-INTEGRITY-DUPLICATE", "integrity", null, affectedRef, "duplicate diagnostic policy id", "unique diagnostic policy ids within one archetype");
        definition.diagnosticPolicies.forEach(function (policy) {
            if (!hasExactKeys(policy, ["policyId", "policyVersion", "concept", "applicability"]) || !isId(policy.policyId) || !isBoundedString(policy.policyVersion, false) || !isBoundedString(policy.concept, false) || !isBoundedString(policy.applicability, false)) {
                addError(errors, "C010-CONFIG-SCHEMA", "config", null, policy && policy.policyId ? policy.policyId : affectedRef, "invalid diagnostic policy", "explicit policyId, policyVersion, concept, and applicability");
            }
        });
    }

    function validateConfiguredArchetypeAssignment(assignment, errors, companyIds, archetypeIds) {
        var keys = ["companyId", "primaryArchetypeId", "secondaryArchetypeIds", "status", "rationale"];
        var affectedRef = assignment && (assignment.companyId || assignment.assignmentId) ? (assignment.companyId || assignment.assignmentId) : "archetype assignments";
        if (!hasExactKeys(assignment, keys) || !isId(assignment.companyId) || (assignment.primaryArchetypeId !== null && !isId(assignment.primaryArchetypeId)) || !uniqueStrings(assignment.secondaryArchetypeIds, false) || !["accepted", "proposed", "unclassified", "under-review"].includes(assignment.status) || !isBoundedString(assignment.rationale, false)) {
            addError(errors, "C010-CONFIG-SCHEMA", "config", assignment && assignment.companyId ? assignment.companyId : null, affectedRef, "invalid archetype assignment", "exact company assignment with explicit primary, secondary, status, and rationale");
            return;
        }
        if (!companyIds[assignment.companyId]) addError(errors, "C010-CONFIG-REFERENCE", "config", assignment.companyId, assignment.companyId, "archetype assignment references an unknown company", "configured companyId");
        var assignedArchetypeIds = assignment.secondaryArchetypeIds.slice();
        if (assignment.primaryArchetypeId !== null) assignedArchetypeIds.push(assignment.primaryArchetypeId);
        assignedArchetypeIds.forEach(function (archetypeId) { if (!archetypeIds[archetypeId]) addError(errors, "C010-CONFIG-REFERENCE", "config", assignment.companyId, archetypeId, "assignment references an unknown archetype", "configured archetypeId"); });
    }

    function validateConfiguredPeerSet(peerSet, errors, companyIds, archetypeIds) {
        var keys = ["peerSetId", "peerSetVersion", "purpose", "subjectCompanyId", "companyIds", "archetypeIds", "status"];
        var affectedRef = peerSet && peerSet.peerSetId ? peerSet.peerSetId : "peers";
        if (!hasExactKeys(peerSet, keys) || !isId(peerSet.peerSetId) || !isBoundedString(peerSet.peerSetVersion, false) || !isBoundedString(peerSet.purpose, false) || !isId(peerSet.subjectCompanyId) || !uniqueStrings(peerSet.companyIds, false) || peerSet.companyIds.length === 0 || !uniqueStrings(peerSet.archetypeIds, false) || !["validated", "proposed", "retired"].includes(peerSet.status)) {
            addError(errors, "C010-CONFIG-SCHEMA", "config", peerSet && peerSet.subjectCompanyId ? peerSet.subjectCompanyId : null, affectedRef, "invalid configured peer set", "exact peer-set identity, purpose, companies, archetypes, and status");
            return;
        }
        [peerSet.subjectCompanyId].concat(peerSet.companyIds).forEach(function (companyId) { if (!companyIds[companyId]) addError(errors, "C010-CONFIG-REFERENCE", "config", peerSet.subjectCompanyId, companyId, "peer set references an unknown company", "configured companyId"); });
        peerSet.archetypeIds.forEach(function (archetypeId) { if (!archetypeIds[archetypeId]) addError(errors, "C010-CONFIG-REFERENCE", "config", peerSet.subjectCompanyId, archetypeId, "peer set references an unknown archetype", "configured archetypeId"); });
    }

    function validateConfiguredRightsPolicy(rightsPolicy, errors) {
        if (!hasExactKeys(rightsPolicy, ["policyVersion", "publicClasses", "restrictedBodyPolicy"]) || !isBoundedString(rightsPolicy.policyVersion, false) || !uniqueStrings(rightsPolicy.publicClasses, false) || rightsPolicy.publicClasses.length === 0 || rightsPolicy.publicClasses.some(function (entry) { return !RIGHTS_CLASS_SET[entry] || entry === "restricted-reference"; }) || rightsPolicy.restrictedBodyPolicy !== "omit") {
            addError(errors, "C010-RIGHTS-SCHEMA", "rights", null, "rightsPolicy", "invalid public rights policy", "unique public rights classes and restricted-body omission");
        }
    }

    function validateConfiguredFeature002(feature002, errors, companyIds) {
        var keys = ["adapterId", "readContractVersion", "briefSubjects", "maxSubjectsPerRead", "recommendationEligibility"];
        if (!hasExactKeys(feature002, keys) || !isId(feature002.adapterId) || feature002.readContractVersion !== "tool-model-read/v1" || !uniqueStrings(feature002.briefSubjects, false) || !isInteger(feature002.maxSubjectsPerRead, 1) || feature002.briefSubjects.length > feature002.maxSubjectsPerRead || feature002.recommendationEligibility !== "educational-research-only") {
            addError(errors, "C010-CONFIG-SCHEMA", "config", null, "feature002", "invalid Feature 002 boundary", "explicit adapter, contract, unique bounded company subjects, read budget, and non-action eligibility");
            return;
        }
        feature002.briefSubjects.forEach(function (companyId) {
            if (!isId(companyId) || !companyIds[companyId]) addError(errors, "C010-CONFIG-REFERENCE", "config", companyId, companyId, "Feature 002 subject references an unknown company", "configured companyId");
        });
    }

    function validateCompanyConfig(value) {
        var errors = [];
        var keys = ["contractVersion", "policyVersions", "validationLimits", "sec", "companies", "sources", "mappings", "archetypes", "formulas", "freshnessPolicies", "materialityPolicy", "rightsPolicy", "peers", "feature002"];
        if (!hasExactKeys(value, keys)) {
            addError(errors, "C010-CONFIG-SCHEMA", "config", null, null, "invalid top-level company config fields", "all explicit company foundation configuration groups and no unknown groups");
            return finishValidation(errors, value);
        }
        if (value.contractVersion !== "company-fundamentals-config/v1") addError(errors, "C010-CONFIG-VERSION", "config", null, null, String(value.contractVersion), "company-fundamentals-config/v1");
        var policyKeys = ["config", "identity", "period", "mapping", "dependency", "publication", "rights", "freshness", "materiality", "peer", "feature002"];
        if (!hasExactKeys(value.policyVersions, policyKeys) || policyKeys.some(function (key) { return !isBoundedString(value.policyVersions[key], false); })) addError(errors, "C010-CONFIG-SCHEMA", "config", null, "policyVersions", "missing or invalid policy version", "all explicit policy versions");
        if (!hasExactKeys(value.validationLimits, ["maxStringLength", "maxArrayLength", "maxObjectDepth", "maxPublicationObjects", "maxPathLength"]) || !Object.keys(value.validationLimits || {}).every(function (key) { return isInteger(value.validationLimits[key], 1); })) addError(errors, "C010-CONFIG-SCHEMA", "config", null, "validationLimits", "missing or invalid safety bound", "all positive explicit validation limits");
        if (!hasExactKeys(value.sec, ["baseUrl", "allowedPaths", "request"]) || value.sec.baseUrl !== "https://data.sec.gov" || !allStrings(value.sec.allowedPaths, false) || value.sec.allowedPaths.length !== 2 || !hasExactKeys(value.sec.request, ["timeoutMs", "maxResponseBytes", "minIntervalMs", "maxAttempts", "retryableStatuses"]) || !isInteger(value.sec.request.timeoutMs, 1) || !isInteger(value.sec.request.maxResponseBytes, 1) || !isInteger(value.sec.request.minIntervalMs, 100) || !isInteger(value.sec.request.maxAttempts, 1) || !Array.isArray(value.sec.request.retryableStatuses) || value.sec.request.retryableStatuses.some(function (status) { return !Number.isInteger(status) || status < 400 || status > 599; })) addError(errors, "C010-CONFIG-SCHEMA", "config", null, "sec", "invalid SEC request policy", "exact keyless SEC origin, two allowlisted paths, and explicit request limits");
        ["companies", "sources", "mappings", "formulas", "freshnessPolicies", "peers"].forEach(function (key) { if (!Array.isArray(value[key])) addError(errors, "C010-CONFIG-SCHEMA", "config", null, key, "configuration group is not an array", "explicit array"); });
        if (!isPlainObject(value.archetypes) || !Array.isArray(value.archetypes.definitions) || !Array.isArray(value.archetypes.assignments) || !hasExactKeys(value.archetypes, ["definitions", "assignments"])) addError(errors, "C010-CONFIG-SCHEMA", "config", null, "archetypes", "invalid archetype registry", "explicit definitions and assignments arrays");
        validateUniqueIds(value.companies || [], "companyId", errors, null);
        validateUniqueIds(value.sources || [], "sourceId", errors, null);
        validateUniqueIds(value.mappings || [], "mappingId", errors, null);
        validateUniqueIds(value.formulas || [], "formulaId", errors, null);
        validateUniqueIds(value.peers || [], "peerSetId", errors, null);
        validateUniqueIds((value.archetypes && value.archetypes.definitions) || [], "archetypeId", errors, null);
        validateUniqueIds((value.archetypes && value.archetypes.assignments) || [], "companyId", errors, null);
        var sourceIds = toSet((value.sources || []).map(function (source) { return source.sourceId; }));
        var companyIds = toSet((value.companies || []).map(function (company) { return company.companyId; }));
        var publicRightsClasses = toSet(value.rightsPolicy && Array.isArray(value.rightsPolicy.publicClasses) ? value.rightsPolicy.publicClasses : []);
        var allowedSourcePaths = Object.create(null);
        (value.companies || []).forEach(function (company) {
            (value.sec && Array.isArray(value.sec.allowedPaths) ? value.sec.allowedPaths : []).forEach(function (pathTemplate) {
                if (CIK_PATTERN.test(company.cik || "")) allowedSourcePaths[pathTemplate.replace("{cik10}", company.cik)] = true;
            });
        });
        (value.companies || []).forEach(function (company) { validateConfiguredCompany(company, errors, sourceIds, companyIds); });
        (value.sources || []).forEach(function (source) { validateConfiguredSource(source, errors, allowedSourcePaths, publicRightsClasses); });
        var mappingIds = toSet((value.mappings || []).map(function (mapping) { return mapping.mappingId; }));
        var formulaIds = toSet((value.formulas || []).map(function (formula) { return formula.formulaId; }));
        var archetypeIds = toSet(((value.archetypes && value.archetypes.definitions) || []).map(function (definition) { return definition.archetypeId; }));
        (value.mappings || []).forEach(function (mapping) { validateConfiguredMapping(mapping, errors, sourceIds); });
        (value.formulas || []).forEach(function (formula) { validateConfiguredFormula(formula, errors, mappingIds); });
        ((value.archetypes && value.archetypes.definitions) || []).forEach(function (definition) { validateConfiguredArchetypeDefinition(definition, errors, formulaIds); });
        ((value.archetypes && value.archetypes.assignments) || []).forEach(function (assignment) { validateConfiguredArchetypeAssignment(assignment, errors, companyIds, archetypeIds); });
        (value.peers || []).forEach(function (peerSet) { validateConfiguredPeerSet(peerSet, errors, companyIds, archetypeIds); });
        var freshnessSeen = Object.create(null);
        (value.freshnessPolicies || []).forEach(function (policy) {
            if (!hasExactKeys(policy, ["evidenceClass", "policyVersion", "clockField", "status", "maxAgeHours"]) || !EVIDENCE_CLASS_SET[policy.evidenceClass] || !isBoundedString(policy.policyVersion, false) || !["sourcePublishedAt", "acceptedAt", "retrievedAt", "observedAt"].includes(policy.clockField) || !["active", "unconfigured"].includes(policy.status) || (policy.status === "active" ? !isInteger(policy.maxAgeHours, 1) : policy.maxAgeHours !== null)) addError(errors, "C010-CONFIG-SCHEMA", "config", null, policy.evidenceClass || "freshnessPolicies", "invalid freshness policy", "one explicit active window or explicit unconfigured state per evidence class");
            if (freshnessSeen[policy.evidenceClass]) addError(errors, "C010-INTEGRITY-DUPLICATE", "integrity", null, policy.evidenceClass, "duplicate freshness policy", "one policy per evidence class");
            freshnessSeen[policy.evidenceClass] = true;
        });
        EVIDENCE_CLASSES.forEach(function (evidenceClass) { if (!freshnessSeen[evidenceClass]) addError(errors, "C010-CONFIG-SCHEMA", "config", null, evidenceClass, "missing freshness policy", "explicit policy for every evidence class"); });
        if (!hasExactKeys(value.materialityPolicy, ["policyVersion", "status", "rules"]) || !isBoundedString(value.materialityPolicy.policyVersion, false) || !["active", "not-authorized"].includes(value.materialityPolicy.status) || !Array.isArray(value.materialityPolicy.rules) || (value.materialityPolicy.status === "not-authorized" && value.materialityPolicy.rules.length !== 0)) addError(errors, "C010-CONFIG-SCHEMA", "config", null, "materialityPolicy", "invalid materiality policy", "explicit active rules or an empty not-authorized policy");
        validateConfiguredRightsPolicy(value.rightsPolicy, errors);
        validateConfiguredFeature002(value.feature002, errors, companyIds);
        validateBounds(value, "config", 0, errors, null);
        return finishValidation(errors, value);
    }

    function parseFiniteDecimal(value) {
        if (typeof value !== "string" || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) return deepFreeze({ ok: false, code: "C010-INTEGRITY-NONFINITE" });
        var numeric = Number(value);
        if (!Number.isFinite(numeric)) return deepFreeze({ ok: false, code: "C010-INTEGRITY-NONFINITE" });
        return deepFreeze({ ok: true, value: numeric, source: value });
    }

    function propagateDependencyStates(graph) {
        if (!hasExactKeys(graph, ["nodes", "edges"]) || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) throw contractException("C010-INTEGRITY-DEPENDENCY", "dependency graph requires explicit nodes and edges");
        var nodeById = Object.create(null);
        var order = [];
        graph.nodes.forEach(function (node) {
            if (!isPlainObject(node) || !isId(node.id) || !isBoundedString(node.kind, false) || !DEPENDENCY_STATE_SET[node.state] || nodeById[node.id]) throw contractException(nodeById[node.id] ? "C010-INTEGRITY-DUPLICATE" : "C010-INTEGRITY-DEPENDENCY", "invalid or duplicate dependency node: " + String(node && node.id));
            nodeById[node.id] = clone(node);
            order.push(node.id);
        });
        var incoming = Object.create(null);
        var outgoing = Object.create(null);
        var indegree = Object.create(null);
        order.forEach(function (id) { incoming[id] = []; outgoing[id] = []; indegree[id] = 0; });
        var edgeSeen = Object.create(null);
        graph.edges.forEach(function (edge) {
            if (!hasExactKeys(edge, ["from", "to"]) || !nodeById[edge.from] || !nodeById[edge.to] || edge.from === edge.to) throw contractException("C010-INTEGRITY-DEPENDENCY", "invalid dependency edge");
            var edgeId = edge.from + "->" + edge.to;
            if (edgeSeen[edgeId]) throw contractException("C010-INTEGRITY-DUPLICATE", "duplicate dependency edge: " + edgeId);
            edgeSeen[edgeId] = true;
            incoming[edge.to].push(edge.from);
            outgoing[edge.from].push(edge.to);
            indegree[edge.to]++;
        });
        var queue = order.filter(function (id) { return indegree[id] === 0; });
        var evaluated = Object.create(null);
        var visited = [];
        while (queue.length) {
            var id = queue.shift();
            var node = clone(nodeById[id]);
            var parents = incoming[id].map(function (parentId) { return evaluated[parentId]; });
            var blockedParents = parents.filter(function (parent) { return parent.state !== "available" && parent.state !== "current"; });
            var ownBlocked = node.state !== "available" && node.state !== "current";
            var missingFactIds = [];
            if (ownBlocked && node.kind === "fact") missingFactIds.push(node.id);
            blockedParents.forEach(function (parent) {
                if (parent.kind === "fact") missingFactIds.push(parent.id);
                (parent.missingFactIds || []).forEach(function (missingId) { missingFactIds.push(missingId); });
            });
            missingFactIds = Array.from(new Set(missingFactIds)).sort();
            if (blockedParents.length) {
                node.state = dependencyBlockedState(blockedParents);
                node.value = null;
            } else if (ownBlocked) {
                node.value = null;
            }
            node.missingFactIds = missingFactIds;
            evaluated[id] = node;
            visited.push(id);
            outgoing[id].forEach(function (childId) {
                indegree[childId]--;
                if (indegree[childId] === 0) queue.push(childId);
            });
        }
        if (visited.length !== order.length) throw contractException("C010-MODEL-CYCLE", "dependency graph contains a cycle");
        return deepFreeze(order.map(function (id) { return evaluated[id]; }));
    }

    function dependencyBlockedState(parents) {
        var priority = ["conflicted", "rejected", "unavailable", "stale"];
        for (var index = 0; index < priority.length; index++) if (parents.some(function (parent) { return parent.state === priority[index]; })) return priority[index];
        return "unavailable";
    }

    function buildIndex(values, key, label) {
        if (!Array.isArray(values)) throw contractException("C010-PUBLICATION-SCHEMA", label + " must be an array");
        var index = Object.create(null);
        values.forEach(function (value) {
            var id = value && value[key];
            if (!isId(id) || index[id]) throw contractException(index[id] ? "C010-INTEGRITY-DUPLICATE" : "C010-PUBLICATION-SCHEMA", "invalid or duplicate " + label + " id: " + String(id));
            index[id] = value;
        });
        return index;
    }

    function resolveIds(ids, index, label) {
        if (!allStrings(ids, false)) throw contractException("C010-PUBLICATION-SCHEMA", label + " refs must be explicit IDs");
        return ids.map(function (id) {
            if (!index[id]) throw contractException("C010-PUBLICATION-REF", "unresolved " + label + " ref: " + id);
            return clone(index[id]);
        });
    }

    function selectSourcesView(acceptedState, focusRef) {
        if (!isPlainObject(acceptedState) || !isId(acceptedState.companyId) || !isId(focusRef)) throw contractException("C010-PUBLICATION-SCHEMA", "Sources view requires accepted company state and a bounded focus ref");
        var claimIndex = buildIndex(acceptedState.claims, "claimId", "claim");
        var claim = claimIndex[focusRef];
        if (!claim) throw contractException("C010-PUBLICATION-REF", "unknown claim focus ref: " + focusRef);
        var observationIndex = buildIndex(acceptedState.observations, "observationId", "observation");
        var sourceIndex = buildIndex(acceptedState.sources, "sourceId", "source");
        var periodIndex = buildIndex(acceptedState.periods, "periodId", "period");
        var mappingIndex = buildIndex(acceptedState.mappings, "mappingId", "mapping");
        var formulaIndex = buildIndex(acceptedState.formulas, "formulaId", "formula");
        var consumerIndex = buildIndex(acceptedState.consumers, "consumerId", "consumer");
        var restatementIndex = buildIndex(acceptedState.restatements, "restatementId", "restatement");
        var conflictIndex = buildIndex(acceptedState.conflicts, "conflictId", "conflict");
        var unavailableIndex = buildIndex(acceptedState.unavailableLinks, "unavailableLinkId", "unavailable link");
        var unavailableLinks = resolveIds(claim.unavailableLinkIds, unavailableIndex, "unavailable link").map(function (link) {
            if (!sourceIndex[link.requiredSourceId]) throw contractException("C010-PUBLICATION-REF", "unavailable link source is unresolved: " + String(link.requiredSourceId));
            if (!periodIndex[link.periodId]) throw contractException("C010-PUBLICATION-REF", "unavailable link period is unresolved: " + String(link.periodId));
            link.source = clone(sourceIndex[link.requiredSourceId]);
            link.period = clone(periodIndex[link.periodId]);
            return link;
        });
        var observations = resolveIds(claim.observationIds, observationIndex, "observation").map(function (observation) {
            var sourceId = observation.sourceRef && observation.sourceRef.objectId;
            var periodId = observation.periodRef && observation.periodRef.objectId;
            if (!sourceIndex[sourceId]) throw contractException("C010-PUBLICATION-REF", "observation source is unresolved: " + String(sourceId));
            if (periodId && !periodIndex[periodId]) throw contractException("C010-PUBLICATION-REF", "observation period is unresolved: " + periodId);
            observation.source = clone(sourceIndex[sourceId]);
            observation.period = periodId ? clone(periodIndex[periodId]) : null;
            return observation;
        });
        var observedSourceIds = toSet(observations.map(function (observation) { return observation.source.sourceId; }));
        var sourceRequirements = unavailableLinks.map(function (link) { return link.source; }).filter(function (source, index, sources) {
            return !observedSourceIds[source.sourceId] && sources.findIndex(function (candidate) { return candidate.sourceId === source.sourceId; }) === index;
        });
        var transformations = claim.transformationIds.map(function (id) {
            if (mappingIndex[id]) return Object.assign({ id: id, kind: "mapping" }, clone(mappingIndex[id]));
            if (formulaIndex[id]) return Object.assign({ id: id, kind: "formula" }, clone(formulaIndex[id]));
            throw contractException("C010-PUBLICATION-REF", "unresolved transformation ref: " + id);
        });
        var rightsSeen = Object.create(null);
        var rights = observations.map(function (observation) { return observation.source; }).concat(sourceRequirements).filter(function (source) {
            if (rightsSeen[source.sourceId]) return false;
            rightsSeen[source.sourceId] = true;
            return true;
        }).map(function (source) { return { sourceId: source.sourceId, rights: source.rights, availability: source.availability || null, limitations: clone(source.limitations || []) }; });
        return deepFreeze({
            contractVersion: "company-sources-view/v1",
            companyId: acceptedState.companyId,
            focusRef: focusRef,
            claim: clone(claim),
            observations: observations,
            sourceRequirements: clone(sourceRequirements),
            transformations: transformations,
            consumers: resolveIds(claim.consumerIds, consumerIndex, "consumer"),
            rights: rights,
            restatements: resolveIds(claim.restatementIds, restatementIndex, "restatement"),
            conflicts: resolveIds(claim.conflictIds, conflictIndex, "conflict"),
            unavailableLinks: unavailableLinks
        });
    }

    function collectObjectRefs(value, refs) {
        if (isPlainObject(value) && value.contractVersion === "company-object-ref/v1") {
            refs.push(value);
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(function (entry) { collectObjectRefs(entry, refs); });
            return;
        }
        if (isPlainObject(value)) Object.keys(value).forEach(function (key) { collectObjectRefs(value[key], refs); });
    }

    function validateContractObject(value) {
        if (!isPlainObject(value)) return finishValidation([makeError("C010-PUBLICATION-SCHEMA", "publication", "blocking", null, [], "publication object is not an object", "versioned JSON object", true)], value);
        if (value.contractVersion === "company-identity/v1") return validateCompanyIdentity(value);
        if (value.contractVersion === "reporting-period/v1") return validateReportingPeriod(value);
        if (value.contractVersion === "source-artifact/v1") return validateSourceArtifact(value);
        if (value.contractVersion === "fact-observation/v1") return validateFactObservation(value);
        if (value.contractVersion === "normalized-fact/v1") return validateNormalizedFact(value);
        if (value.contractVersion === "company-dossier/v1") return validateCompanyDossier(value);
        if (value.contractVersion === "company-error/v1") return validateCompanyError(value);
        if (["company-dossier-summary/v1", "fundamentals-tool-read/v1", "company-history-index/v1"].includes(value.contractVersion)) return validateGenerationObject(value);
        return finishValidation([makeError("C010-PUBLICATION-SCHEMA", "publication", "blocking", value.companyId || null, [], "unknown contract version: " + String(value.contractVersion), "supported company publication contract", true)], value);
    }

    function validateGenerationObject(value) {
        var errors = [];
        if (!isPlainObject(value) || !isId(value.companyId) || !isId(value.publicationId) || !isInteger(value.generation, 1)) addError(errors, "C010-PUBLICATION-SCHEMA", "publication", value && value.companyId ? value.companyId : null, null, "generation object lacks publication identity", "companyId, publicationId, and positive generation");
        validateBounds(value, "object", 0, errors, value && value.companyId ? value.companyId : null);
        return finishValidation(errors, value);
    }

    function validatePublicationGraph(manifest, objects) {
        var manifestResult = validatePublicationManifest(manifest);
        var errors = manifestResult.ok ? [] : manifestResult.errors.slice();
        if (!isPlainObject(objects) || Object.keys(objects).length === 0 || Object.keys(objects).length > STRUCTURAL_LIMITS.maxObjects) {
            addError(errors, "C010-PUBLICATION-SCHEMA", "publication", manifest && manifest.companyId ? manifest.companyId : null, null, "invalid publication object inventory", "non-empty bounded object map");
            return finishValidation(errors, { manifest: manifest, objects: objects });
        }
        if (!manifestResult.ok) return finishValidation(errors, { manifest: manifest, objects: objects });
        if (companyManifestSha256(manifest) !== manifest.manifestSha256) addError(errors, "C010-PUBLICATION-HASH", "publication", manifest.companyId, manifest.publicationId, "manifest hash mismatch", "canonical manifest hash excluding manifestSha256");
        var initialRefs = [manifest.identityRef, manifest.summaryRef, manifest.dossierRef, manifest.ownerReadRef].concat(manifest.sourceRefs, manifest.historyRefs);
        if (manifest.modelPackRef !== null) initialRefs.push(manifest.modelPackRef);
        if (manifest.briefRef !== null) initialRefs.push(manifest.briefRef);
        var queue = initialRefs.slice();
        var visited = Object.create(null);
        while (queue.length) {
            var ref = queue.shift();
            var refResult = validateObjectRef(ref);
            if (!refResult.ok) {
                errors = errors.concat(refResult.errors);
                continue;
            }
            if (visited[ref.objectId]) {
                if (visited[ref.objectId].sha256 !== ref.sha256 || visited[ref.objectId].path !== ref.path) addError(errors, "C010-PUBLICATION-REF", "publication", manifest.companyId, ref.objectId, "same objectId has divergent references", "one immutable ref per objectId");
                continue;
            }
            visited[ref.objectId] = ref;
            var objectValue = objects[ref.objectId];
            if (!isPlainObject(objectValue)) {
                addError(errors, "C010-PUBLICATION-REF", "publication", manifest.companyId, ref.objectId, "referenced object is absent", "complete object graph");
                continue;
            }
            validateBounds(objectValue, ref.objectId, 0, errors, manifest.companyId);
            if (companyObjectSha256(objectValue) !== ref.sha256) addError(errors, "C010-PUBLICATION-HASH", "publication", manifest.companyId, ref.objectId, "object hash mismatch", "canonical bytes bound to ObjectRef sha256");
            if (objectValue.companyId !== undefined && objectValue.companyId !== manifest.companyId) addError(errors, "C010-PUBLICATION-COMPANY", "publication", manifest.companyId, ref.objectId, "object belongs to another company", "one company identity per publication");
            if (objectValue.publicationId !== undefined && objectValue.publicationId !== manifest.publicationId) addError(errors, "C010-PUBLICATION-GENERATION", "publication", manifest.companyId, ref.objectId, "object belongs to another publication", "one publicationId per graph");
            if (objectValue.generation !== undefined && objectValue.generation !== manifest.generation) addError(errors, "C010-PUBLICATION-GENERATION", "publication", manifest.companyId, ref.objectId, "object belongs to another generation", "one generation per graph");
            var objectResult = validateContractObject(objectValue);
            if (!objectResult.ok) errors = errors.concat(objectResult.errors);
            var nestedRefs = [];
            collectObjectRefs(objectValue, nestedRefs);
            nestedRefs.forEach(function (nestedRef) { queue.push(nestedRef); });
        }
        Object.keys(objects).forEach(function (objectId) { if (!visited[objectId]) addError(errors, "C010-PUBLICATION-REF", "publication", manifest.companyId, objectId, "unreferenced object in publication bundle", "every object reachable from the manifest"); });
        return finishValidation(errors, { manifest: manifest, objects: objects });
    }

    function findObjectByVersion(objects, version) {
        var matches = Object.keys(objects).map(function (key) { return objects[key]; }).filter(function (value) { return value.contractVersion === version; });
        if (matches.length !== 1) throw contractException("C010-PUBLICATION-SCHEMA", "expected exactly one " + version + " object");
        return matches[0];
    }

    function projectAcceptedPublication(manifest, objects) {
        var validation = validatePublicationGraph(manifest, objects);
        if (!validation.ok) {
            var error = contractException(validation.errors[0].code, validation.errors[0].observed);
            error.validationErrors = validation.errors;
            throw error;
        }
        var identity = objects[manifest.identityRef.objectId];
        var summary = objects[manifest.summaryRef.objectId];
        var dossier = objects[manifest.dossierRef.objectId];
        var sources = manifest.sourceRefs.map(function (ref) { return objects[ref.objectId]; });
        var periods = dossier.periodRefs.map(function (ref) { return objects[ref.objectId]; });
        var dependencyResults = propagateDependencyStates(dossier.dependencyGraph);
        return deepFreeze({
            contractVersion: "company-accepted-state/v1",
            companyId: manifest.companyId,
            publicationId: manifest.publicationId,
            generation: manifest.generation,
            identity: clone(identity),
            summary: clone(summary),
            dossier: clone(dossier),
            evidenceCoverage: clone(dossier.evidenceCoverage),
            claims: clone(dossier.claims),
            observations: clone(dossier.observations),
            sources: clone(sources),
            periods: clone(periods),
            mappings: clone(dossier.mappings),
            formulas: clone(dossier.formulas),
            consumers: clone(dossier.consumers),
            restatements: clone(dossier.restatements),
            conflicts: clone(dossier.conflicts),
            unavailableLinks: clone(dossier.unavailableLinks),
            dependencyResults: clone(dependencyResults),
            ownerRead: clone(objects[manifest.ownerReadRef.objectId])
        });
    }

    function selectSimpleView(acceptedState, archetypeView) {
        if (!isPlainObject(acceptedState) || acceptedState.contractVersion !== "company-accepted-state/v1") throw contractException("C010-PUBLICATION-SCHEMA", "Simple view requires accepted publication state");
        if (archetypeView !== undefined && archetypeView !== null && (!isPlainObject(archetypeView) || archetypeView.contractVersion !== "company-archetype-view/v1")) throw contractException("C010-PUBLICATION-SCHEMA", "Simple view archetype context must be a company-archetype-view/v1 object or omitted");
        var classified = !!(archetypeView && archetypeView.status === "accepted" && isPlainObject(archetypeView.definition));
        // Which normalized concepts have a source-qualified (reconciled or restated) fact; archetype prioritization never mutates these.
        var resolvedConcepts = Object.create(null);
        (acceptedState.dossier && Array.isArray(acceptedState.dossier.normalizedFacts) ? acceptedState.dossier.normalizedFacts : []).forEach(function (fact) {
            if (fact && (fact.resolutionState === "reconciled" || fact.resolutionState === "restated") && fact.currentObservationId) resolvedConcepts[fact.normalizedConcept] = fact;
        });
        var archetype;
        var kpiPriorities;
        var kpiAvailability;
        var diagnostics;
        var diagnosticsAvailability;
        if (classified) {
            archetype = { status: "accepted", primaryArchetypeId: archetypeView.primaryArchetypeId, label: archetypeView.definition.label, lens: archetypeView.definition.label };
            kpiPriorities = archetypeView.definition.kpiPriorities.map(function (kpi, index) {
                var resolved = resolvedConcepts[kpi.normalizedConcept];
                return {
                    kpiId: kpi.kpiId,
                    label: kpi.label,
                    normalizedConcept: kpi.normalizedConcept,
                    formulaId: kpi.formulaId,
                    rank: index + 1,
                    state: resolved ? "available" : "unavailable",
                    factId: resolved ? resolved.factId : null,
                    value: null,
                    evidenceRequirement: resolved ? null : "Requires a source-qualified SEC Company Facts observation for " + kpi.normalizedConcept + "."
                };
            });
            kpiAvailability = { state: "available", evidenceRequirement: null };
            diagnostics = archetypeView.definition.diagnosticPolicies.map(function (policy) {
                return { policyId: policy.policyId, policyVersion: policy.policyVersion, concept: policy.concept, applicability: policy.applicability, state: "available" };
            });
            diagnosticsAvailability = { state: "available", evidenceRequirement: null };
        } else {
            // An unclassified company inherits no lens: shared statements and trace stay available, but no KPI or diagnostic priority is invented.
            archetype = { status: "unclassified", primaryArchetypeId: null, label: null, lens: null };
            kpiPriorities = [];
            kpiAvailability = { state: "unavailable", evidenceRequirement: "An accepted archetype assignment is required before company-specific KPI priorities are available." };
            diagnostics = [];
            diagnosticsAvailability = { state: "unavailable", evidenceRequirement: "An accepted archetype assignment is required before archetype diagnostics are available." };
        }
        var ownerRead = isPlainObject(acceptedState.ownerRead) ? acceptedState.ownerRead : {};
        return deepFreeze({
            contractVersion: "company-simple-view/v1",
            companyId: acceptedState.companyId,
            publicationId: acceptedState.publicationId,
            generation: acceptedState.generation,
            identity: clone(acceptedState.identity),
            summary: clone(acceptedState.summary),
            evidenceCoverage: clone(acceptedState.evidenceCoverage),
            claims: clone(acceptedState.claims),
            dependencyResults: clone(acceptedState.dependencyResults),
            archetype: archetype,
            kpiPriorities: kpiPriorities,
            kpiAvailability: kpiAvailability,
            diagnostics: diagnostics,
            diagnosticsAvailability: diagnosticsAvailability,
            clocks: {
                statementCutoff: ownerRead.statementCutoff !== undefined ? ownerRead.statementCutoff : null,
                modelCutoff: ownerRead.modelCutoff !== undefined ? ownerRead.modelCutoff : null,
                briefCutoff: ownerRead.briefCutoff !== undefined ? ownerRead.briefCutoff : null,
                marketCutoff: ownerRead.marketCutoff !== undefined ? ownerRead.marketCutoff : null
            }
        });
    }

    function requestSameOriginJson(options) {
        if (!hasExactKeys(options, ["baseUrl", "path", "companyId", "fetchImpl"]) || !isBoundedString(options.baseUrl, false) || !isSafeRelativePath(options.path) || !isId(options.companyId) || typeof options.fetchImpl !== "function") return Promise.reject(contractException("C010-PUBLICATION-REF", "loader requires explicit baseUrl, safe path, companyId, and fetch implementation"));
        var base;
        var target;
        try {
            base = new URL(options.baseUrl);
            target = new URL(options.path, base);
        } catch (_error) {
            return Promise.reject(contractException("C010-PUBLICATION-ORIGIN", "invalid publication origin or path"));
        }
        if (target.origin !== base.origin) return Promise.reject(contractException("C010-PUBLICATION-ORIGIN", "publication reads must remain same-origin"));
        return options.fetchImpl(target.href, { method: "GET", cache: "no-store", credentials: "omit", redirect: "error", headers: { Accept: "application/json" } }).then(function (response) {
            if (!response || !response.ok) throw contractException(response && response.status === 404 ? "C010-PUBLICATION-NOT-FOUND" : "C010-SOURCE-UNAVAILABLE", "publication response unavailable");
            if (response.redirected || (response.url && new URL(response.url, base).origin !== base.origin)) throw contractException("C010-PUBLICATION-ORIGIN", "publication redirect left the accepted origin");
            var contentType = response.headers && response.headers.get ? response.headers.get("content-type") : null;
            if (!contentType || !/^application\/json(?:;|$)/i.test(contentType)) throw contractException("C010-PUBLICATION-CONTENT-TYPE", "publication response is not JSON");
            return response.text().then(function (text) { return { text: text, url: target.href }; });
        }).then(function (document) {
            try { document.value = JSON.parse(document.text); } catch (_error) { throw contractException("C010-PUBLICATION-JSON", "publication response is not valid JSON"); }
            return document;
        });
    }

    function loadSameOriginJson(options) {
        return requestSameOriginJson(options).then(function (document) { return document.value; });
    }

    function validateCompanyCurrentPointer(value, companyId) {
        var keys = ["contractVersion", "companyId", "generation", "publicationId", "manifestPath", "manifestSha256", "selectedAt"];
        if (!hasExactKeys(value, keys) || value.contractVersion !== "company-current-pointer/v1" || value.companyId !== companyId || !isInteger(value.generation, 1) || !isId(value.publicationId) || !isSafeRelativePath(value.manifestPath) || !HASH_PATTERN.test(value.manifestSha256 || "") || !isIso(value.selectedAt)) throw contractException(value && value.companyId !== companyId ? "C010-PUBLICATION-COMPANY" : "C010-PUBLICATION-SCHEMA", "invalid company-current-pointer/v1 response");
        if (value.manifestPath !== "data/company-fundamentals/objects/" + value.manifestSha256.slice(7) + ".json") throw contractException("C010-PUBLICATION-HASH", "current pointer manifest path is not content-addressed by manifestSha256");
        return value;
    }

    function loadCompanyPublication(options) {
        return requestSameOriginJson(options).then(function (pointerDocument) {
            var pointer = validateCompanyCurrentPointer(pointerDocument.value, options.companyId);
            return requestSameOriginJson({ baseUrl: options.baseUrl, path: pointer.manifestPath, companyId: options.companyId, fetchImpl: options.fetchImpl }).then(function (manifestDocument) {
                var manifest = manifestDocument.value;
                var manifestValidation = validatePublicationManifest(manifest);
                if (!manifestValidation.ok) throw contractException(manifestValidation.errors[0].code, manifestValidation.errors[0].observed);
                if (manifest.companyId !== pointer.companyId) throw contractException("C010-PUBLICATION-COMPANY", "manifest does not match current pointer company");
                if (manifest.publicationId !== pointer.publicationId || manifest.generation !== pointer.generation) throw contractException("C010-PUBLICATION-GENERATION", "manifest does not match current pointer publication generation");
                if (manifest.manifestSha256 !== pointer.manifestSha256 || companyManifestSha256(manifest) !== pointer.manifestSha256) throw contractException("C010-PUBLICATION-HASH", "manifest does not match current pointer hash");

                var queue = [manifest.identityRef, manifest.summaryRef, manifest.dossierRef, manifest.ownerReadRef].concat(manifest.sourceRefs, manifest.historyRefs);
                if (manifest.modelPackRef !== null) queue.push(manifest.modelPackRef);
                if (manifest.briefRef !== null) queue.push(manifest.briefRef);
                var refs = Object.create(null);
                var objects = Object.create(null);

                function loadNextObject() {
                    if (!queue.length) return Promise.resolve(projectAcceptedPublication(manifest, objects));
                    var ref = queue.shift();
                    var refValidation = validateObjectRef(ref);
                    if (!refValidation.ok) throw contractException(refValidation.errors[0].code, refValidation.errors[0].observed);
                    var expectedPath = "data/company-fundamentals/objects/" + ref.sha256.slice(7) + ".json";
                    if (ref.path !== expectedPath) throw contractException("C010-PUBLICATION-HASH", "object ref path is not content-addressed by sha256");
                    if (refs[ref.objectId]) {
                        if (refs[ref.objectId].sha256 !== ref.sha256 || refs[ref.objectId].path !== ref.path) throw contractException("C010-PUBLICATION-REF", "same objectId has divergent references");
                        return loadNextObject();
                    }
                    refs[ref.objectId] = ref;
                    return requestSameOriginJson({ baseUrl: options.baseUrl, path: ref.path, companyId: options.companyId, fetchImpl: options.fetchImpl }).then(function (objectDocument) {
                        if (companyObjectSha256(objectDocument.value) !== ref.sha256) throw contractException("C010-PUBLICATION-HASH", "canonical publication object does not match object ref");
                        objects[ref.objectId] = objectDocument.value;
                        var nestedRefs = [];
                        collectObjectRefs(objectDocument.value, nestedRefs);
                        nestedRefs.forEach(function (nestedRef) { queue.push(nestedRef); });
                        return loadNextObject();
                    });
                }

                return loadNextObject();
            });
        });
    }

    function classifyReportingPeriod(period) {
        var validation = validateReportingPeriod(period);
        if (!validation.ok) {
            var periodError = contractException(validation.errors[0].code, validation.errors[0].observed);
            periodError.validationErrors = validation.errors;
            throw periodError;
        }
        var amended = period.amendmentState !== "original" || /\/A$/.test(period.form);
        var classification = period.kind === "quarter" ? "quarter"
            : period.kind === "annual" ? "annual"
                : period.kind === "year-to-date" ? "year-to-date"
                    : period.kind === "trailing" ? "trailing"
                        : "instant";
        // Exact-meaning rule: only a true single-quarter duration is a standalone quarter.
        // A year-to-date, instant, annual, or trailing observation must NEVER be shown as a standalone quarter.
        var standaloneQuarter = classification === "quarter";
        // Two observations are delta-comparable only when their duration class, exact duration span,
        // and comparability state match (concept, unit, and currency are matched at the fact level).
        var comparabilityKey = [classification, String(period.durationDays), period.comparability].join("|");
        return deepFreeze({
            contractVersion: "reporting-period-classification/v1",
            periodId: period.periodId,
            kind: period.kind,
            classification: classification,
            standaloneQuarter: standaloneQuarter,
            amended: amended,
            amendmentState: period.amendmentState,
            durationDays: period.durationDays,
            fiscalYear: period.fiscalYear,
            fiscalQuarter: period.fiscalQuarter,
            start: period.start,
            end: period.end,
            comparability: period.comparability,
            comparabilityKey: comparabilityKey
        });
    }

    function reconcileFactObservations(request) {
        if (!hasExactKeys(request, ["factId", "normalizedConcept", "mappingId", "mappingVersion", "transformation", "observations", "amendments"])) {
            throw contractException("C010-MAPPING-SCHEMA", "reconcileFactObservations requires factId, normalizedConcept, mappingId, mappingVersion, transformation, observations, and amendments");
        }
        if (!isId(request.factId) || !isBoundedString(request.normalizedConcept, false) || !isId(request.mappingId) || !isBoundedString(request.mappingVersion, false) || !hasExactKeys(request.transformation, ["sign", "scalePower10", "aggregation"]) || ![-1, 1].includes(request.transformation.sign) || !Number.isInteger(request.transformation.scalePower10) || !isBoundedString(request.transformation.aggregation, false) || !Array.isArray(request.observations) || !Array.isArray(request.amendments)) {
            throw contractException("C010-MAPPING-SCHEMA", "reconcileFactObservations received an invalid mapping, transformation, or collection");
        }
        request.observations.forEach(function (observation) {
            var observationValidation = validateFactObservation(observation);
            if (!observationValidation.ok) {
                var observationError = contractException(observationValidation.errors[0].code, observationValidation.errors[0].observed);
                observationError.validationErrors = observationValidation.errors;
                throw observationError;
            }
        });
        var observationIds = request.observations.map(function (observation) { return observation.observationId; });
        if (new Set(observationIds).size !== observationIds.length) throw contractException("C010-INTEGRITY-DUPLICATE", "reconcileFactObservations received duplicate observation IDs");
        var activeStates = { current: true, restated: true, partial: true, stale: true };
        var eligible = request.observations.filter(function (observation) { return observation.value !== null && activeStates[observation.state]; });
        var eligibleById = Object.create(null);
        eligible.forEach(function (observation) { eligibleById[observation.observationId] = observation; });
        request.amendments.forEach(function (relation) {
            if (!hasExactKeys(relation, ["originalObservationId", "amendingObservationId"]) || !isId(relation.originalObservationId) || !isId(relation.amendingObservationId) || relation.originalObservationId === relation.amendingObservationId || observationIds.indexOf(relation.originalObservationId) === -1 || observationIds.indexOf(relation.amendingObservationId) === -1) {
                throw contractException("C010-MAPPING-SCHEMA", "amendment relation must reference two distinct provided observations");
            }
        });

        var currentObservationId = null;
        var resolutionState;
        var resolutionReason;
        var changeEvent;
        var restatement = null;
        var conflictingObservationIds = [];

        var appliedAmendment = request.amendments.filter(function (relation) {
            return eligibleById[relation.originalObservationId] && eligibleById[relation.amendingObservationId];
        });
        var distinctEligibleValues = Array.from(new Set(eligible.map(function (observation) { return observation.value; })));

        if (appliedAmendment.length) {
            // The amending accession supersedes the original while the original stays auditable in lineage.
            var latestAmendment = appliedAmendment[appliedAmendment.length - 1];
            currentObservationId = latestAmendment.amendingObservationId;
            resolutionState = "restated";
            resolutionReason = "The amending accession " + latestAmendment.amendingObservationId + " supersedes " + latestAmendment.originalObservationId + " while both observations remain in lineage.";
            changeEvent = "restatement";
            restatement = { originalObservationId: latestAmendment.originalObservationId, amendingObservationId: latestAmendment.amendingObservationId };
        } else if (eligible.length >= 2 && distinctEligibleValues.length > 1) {
            // Genuine disagreement without an amendment relation stays conflicted and is NEVER averaged.
            currentObservationId = null;
            resolutionState = "conflicted";
            resolutionReason = "Eligible observations materially disagree without an amendment relation; both remain visible and no value is synthesized.";
            changeEvent = "conflict";
            conflictingObservationIds = eligible.map(function (observation) { return observation.observationId; });
        } else if (eligible.length >= 1) {
            currentObservationId = eligible[0].observationId;
            resolutionState = "reconciled";
            resolutionReason = "One source-qualified observation resolves the normalized fact.";
            changeEvent = "reconciled";
        } else {
            currentObservationId = null;
            resolutionState = "unavailable";
            resolutionReason = "No eligible source-qualified observation is present.";
            changeEvent = "unavailable";
        }

        var normalizedFact = {
            contractVersion: "normalized-fact/v1",
            factId: request.factId,
            normalizedConcept: request.normalizedConcept,
            currentObservationId: currentObservationId,
            observationIds: observationIds.slice(),
            mappingId: request.mappingId,
            mappingVersion: request.mappingVersion,
            transformation: clone(request.transformation),
            resolutionState: resolutionState,
            resolutionReason: resolutionReason
        };
        var normalizedValidation = validateNormalizedFact(normalizedFact);
        if (!normalizedValidation.ok) {
            var normalizedError = contractException(normalizedValidation.errors[0].code, normalizedValidation.errors[0].observed);
            normalizedError.validationErrors = normalizedValidation.errors;
            throw normalizedError;
        }
        return deepFreeze({
            contractVersion: "fact-reconciliation/v1",
            normalizedFact: normalizedFact,
            changeEvent: changeEvent,
            averaged: false,
            currentObservationId: currentObservationId,
            observationIds: observationIds.slice(),
            conflictingObservationIds: conflictingObservationIds,
            restatement: restatement
        });
    }

    function xbrlRoundingHalfInterval(decimals) {
        if (typeof decimals !== "string" || !/^-?\d+$/.test(decimals)) throw contractException("C010-INTEGRITY-BALANCE-SHEET", "statement fact decimals must be an explicit integer string");
        return 0.5 * Math.pow(10, -Number(decimals));
    }

    function decimalString(value) {
        if (!Number.isFinite(value)) throw contractException("C010-INTEGRITY-NONFINITE", "statement integrity produced a non-finite result");
        return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6)));
    }

    function statementInput(entry, label) {
        if (!hasExactKeys(entry, ["observationId", "value", "decimals"]) || !isId(entry.observationId)) throw contractException("C010-INTEGRITY-BALANCE-SHEET", label + " statement input requires observationId, value, and decimals");
        var parsed = parseFiniteDecimal(entry.value);
        if (!parsed.ok) throw contractException("C010-INTEGRITY-NONFINITE", label + " statement value is not a finite decimal string");
        return { observationId: entry.observationId, value: parsed.value, decimals: entry.decimals };
    }

    function evaluateStatementIntegrity(request) {
        if (!hasExactKeys(request, ["companyId", "periodId", "assets", "liabilities", "equity"]) || !isId(request.companyId) || !isId(request.periodId)) {
            throw contractException("C010-INTEGRITY-BALANCE-SHEET", "evaluateStatementIntegrity requires companyId, periodId, assets, liabilities, and equity");
        }
        var assets = statementInput(request.assets, "assets");
        var liabilities = statementInput(request.liabilities, "liabilities");
        var equity = statementInput(request.equity, "equity");
        var difference = assets.value - (liabilities.value + equity.value);
        var allowedInterval = xbrlRoundingHalfInterval(assets.decimals) + xbrlRoundingHalfInterval(liabilities.decimals) + xbrlRoundingHalfInterval(equity.decimals);
        var withinTolerance = Math.abs(difference) <= allowedInterval;
        var inputRefs = [assets.observationId, liabilities.observationId, equity.observationId];
        var differenceText = decimalString(difference);
        var allowedIntervalText = decimalString(allowedInterval);
        var error = withinTolerance ? null : makeError(
            "C010-INTEGRITY-BALANCE-SHEET",
            "integrity",
            "blocking",
            request.companyId,
            inputRefs,
            "assets minus (liabilities plus equity) difference " + differenceText + " for period " + request.periodId,
            "difference within the summed XBRL rounding interval " + allowedIntervalText,
            true
        );
        return deepFreeze({
            contractVersion: "statement-integrity/v1",
            companyId: request.companyId,
            periodId: request.periodId,
            withinTolerance: withinTolerance,
            difference: differenceText,
            allowedInterval: allowedIntervalText,
            inputRefs: inputRefs,
            // Source facts always remain inspectable; only dependent conclusions are withheld on imbalance.
            sourceFacts: {
                assets: { observationId: assets.observationId, value: decimalString(assets.value), decimals: assets.decimals },
                liabilities: { observationId: liabilities.observationId, value: decimalString(liabilities.value), decimals: liabilities.decimals },
                equity: { observationId: equity.observationId, value: decimalString(equity.value), decimals: equity.decimals }
            },
            blockedConclusions: withinTolerance ? [] : ["resilience-diagnostics", "dependent-model", "company-brief"],
            error: error
        });
    }

    var ACTIVE_INPUT_STATES = Object.freeze({ available: true, current: true, reconciled: true, restated: true });

    function derivedMetricExpression(operation, inputs) {
        var concepts = inputs.map(function (input) { return input.concept; });
        if (operation === "ratio") return concepts[0] + " / " + concepts[1];
        if (operation === "difference" || operation === "net-share-change") return concepts[0] + " - " + concepts[1];
        return concepts.join(" + ");
    }

    function validateEvaluationInput(input, code) {
        var baseKeys = ["inputId", "ref", "concept", "unit", "periodId", "value", "state"];
        var flowKeys = baseKeys.concat(["flowKind"]);
        if (!(hasExactKeys(input, baseKeys) || hasExactKeys(input, flowKeys)) || !isId(input.inputId) || !isId(input.ref) || !isBoundedString(input.concept, false) || !isBoundedString(input.unit, false) || !isId(input.periodId) || (input.value !== null && !isBoundedString(input.value, true)) || !isBoundedString(input.state, false) || (input.flowKind !== undefined && !["period-flow", "balance"].includes(input.flowKind))) {
            throw contractException(code, "evaluation input requires inputId, ref, concept, unit, periodId, value, state, and an optional flowKind");
        }
        var normalized = { inputId: input.inputId, ref: input.ref, concept: input.concept, unit: input.unit, periodId: input.periodId, value: input.value, state: input.state };
        if (input.flowKind !== undefined) normalized.flowKind = input.flowKind;
        return normalized;
    }

    // Transparent derived metric: exposes formula, ordered inputs, and qualifications and never emits a universal score.
    function evaluateDerivedMetric(request) {
        if (!hasExactKeys(request, ["metricId", "formulaId", "formulaVersion", "outputConcept", "unit", "periodId", "operation", "inputs", "qualifications"])) {
            throw contractException("C010-MAPPING-SCHEMA", "evaluateDerivedMetric requires metricId, formulaId, formulaVersion, outputConcept, unit, periodId, operation, inputs, and qualifications");
        }
        if (!isId(request.metricId) || !isId(request.formulaId) || !isBoundedString(request.formulaVersion, false) || !isBoundedString(request.outputConcept, false) || !isBoundedString(request.unit, false) || !isId(request.periodId) || !isBoundedString(request.operation, false) || !Array.isArray(request.inputs) || request.inputs.length === 0 || !Array.isArray(request.qualifications)) {
            throw contractException("C010-MAPPING-SCHEMA", "evaluateDerivedMetric received an invalid metric identity, operation, or collection");
        }
        var arity = { ratio: 2, difference: 2, "net-share-change": 2, sum: 0 };
        if (!Object.prototype.hasOwnProperty.call(arity, request.operation)) throw contractException("C010-MAPPING-SCHEMA", "evaluateDerivedMetric operation is not supported: " + request.operation);
        if (arity[request.operation] !== 0 && request.inputs.length !== arity[request.operation]) throw contractException("C010-MAPPING-SCHEMA", "operation " + request.operation + " requires exactly " + arity[request.operation] + " inputs");
        var inputs = request.inputs.map(function (input) { return validateEvaluationInput(input, "C010-MAPPING-SCHEMA"); });
        var qualifications = request.qualifications.map(function (entry) {
            if (!hasExactKeys(entry, ["rule", "detail"]) || !isBoundedString(entry.rule, false) || !isBoundedString(entry.detail, false)) throw contractException("C010-MAPPING-SCHEMA", "derived-metric qualification requires an explicit rule and detail");
            return { rule: entry.rule, detail: entry.detail };
        });
        var missing = inputs.filter(function (input) { return input.value === null || !ACTIVE_INPUT_STATES[input.state]; });
        var value = null;
        var state;
        if (missing.length) {
            state = "unavailable";
            qualifications.push({ rule: "missing-input", detail: "Inputs without a source-qualified value withhold the metric: " + missing.map(function (input) { return input.concept; }).join(", ") + "." });
        } else {
            var operands = inputs.map(function (input) {
                var parsed = parseFiniteDecimal(input.value);
                if (!parsed.ok) throw contractException("C010-INTEGRITY-NONFINITE", "derived-metric input value is not a finite decimal string: " + input.inputId);
                return parsed.value;
            });
            if (inputs.some(function (input) { return input.periodId !== request.periodId; })) qualifications.push({ rule: "comparability", detail: "One or more inputs are drawn from a period other than the metric period." });
            if (request.operation === "ratio") {
                if (operands[1] === 0) {
                    state = "blocked";
                    qualifications.push({ rule: "invalid-denominator", detail: "The denominator is zero; no ratio value is computed and no substitute is fabricated." });
                } else {
                    value = decimalString(operands[0] / operands[1]);
                    state = "available";
                }
            } else if (request.operation === "difference" || request.operation === "net-share-change") {
                value = decimalString(operands[0] - operands[1]);
                state = "available";
            } else {
                value = decimalString(operands.reduce(function (total, operand) { return total + operand; }, 0));
                state = "available";
            }
        }
        return deepFreeze({
            contractVersion: "company-derived-metric/v1",
            metricId: request.metricId,
            formulaId: request.formulaId,
            formulaVersion: request.formulaVersion,
            outputConcept: request.outputConcept,
            unit: request.unit,
            periodId: request.periodId,
            operation: request.operation,
            expression: derivedMetricExpression(request.operation, inputs),
            inputs: inputs,
            qualifications: qualifications,
            value: value,
            state: state
        });
    }

    // Capital-allocation interpretation: cites net share change and dilution and keeps gross repurchase and treasury distinct
    // from period share flows. Repurchase magnitude alone is never scored as an improvement.
    function interpretCapitalAllocation(inputs) {
        var byConcept = Object.create(null);
        inputs.forEach(function (input) { byConcept[input.concept] = input; });
        var sharesIssued = byConcept["shares-issued"];
        var sharesRepurchased = byConcept["shares-repurchased"];
        var shareBasedComp = byConcept["share-based-comp"];
        var dilutedShares = byConcept["diluted-shares"];
        var grossRepurchase = byConcept["repurchase-outlay"];
        var treasury = byConcept["treasury-stock"];
        var netShareChange = null;
        if (sharesIssued && sharesRepurchased && sharesIssued.value !== null && sharesRepurchased.value !== null) {
            var issued = parseFiniteDecimal(sharesIssued.value);
            var repurchased = parseFiniteDecimal(sharesRepurchased.value);
            if (issued.ok && repurchased.ok) netShareChange = decimalString(issued.value - repurchased.value);
        }
        var interpretationParts = [
            netShareChange === null
                ? "The net share change is unavailable without both issuance and repurchase share counts."
                : "The net share change is " + netShareChange + " shares (shares issued minus shares repurchased).",
            shareBasedComp && dilutedShares && shareBasedComp.value !== null && dilutedShares.value !== null
                ? "The dilution is read from share-based compensation " + shareBasedComp.value + " against " + dilutedShares.value + " diluted shares."
                : "The dilution requires share-based-compensation and diluted-share evidence.",
            "Gross repurchase outlay and treasury balance are reported as distinct period-flow and balance items; repurchase magnitude alone is not scored as an improvement."
        ];
        return {
            netShareChange: netShareChange,
            dilutionShareBasedComp: shareBasedComp ? shareBasedComp.value : null,
            dilutedShares: dilutedShares ? dilutedShares.value : null,
            grossRepurchaseOutlay: grossRepurchase ? { value: grossRepurchase.value, flowKind: grossRepurchase.flowKind || "period-flow" } : null,
            treasuryStockBalance: treasury ? { value: treasury.value, flowKind: treasury.flowKind || "balance" } : null,
            interpretation: interpretationParts.join(" ")
        };
    }

    // Diagnostic check: the raw record (value, formula, threshold, input refs, period) always renders before any evidenced
    // contextual adjustment; an omitted concept with no eligible observation is absent-from-eligible-source, never zero or pass.
    function evaluateDiagnostic(request) {
        if (!hasExactKeys(request, ["checkId", "policyId", "policyVersion", "concept", "periodId", "raw", "contextualAdjustment", "interpretationMode"])) {
            throw contractException("C010-MAPPING-SCHEMA", "evaluateDiagnostic requires checkId, policyId, policyVersion, concept, periodId, raw, contextualAdjustment, and interpretationMode");
        }
        if (!isId(request.checkId) || !isId(request.policyId) || !isBoundedString(request.policyVersion, false) || !isBoundedString(request.concept, false) || !isId(request.periodId) || !hasExactKeys(request.raw, ["formula", "threshold", "operation", "inputs"]) || !isBoundedString(request.raw.formula, false) || (request.raw.threshold !== null && !isBoundedString(request.raw.threshold, false)) || !isBoundedString(request.raw.operation, false) || !Array.isArray(request.raw.inputs) || (request.interpretationMode !== null && !isBoundedString(request.interpretationMode, false))) {
            throw contractException("C010-MAPPING-SCHEMA", "evaluateDiagnostic received an invalid check identity, raw record, or interpretation mode");
        }
        var supportedRawOperations = { ratio: true, difference: true, sum: true, "presence-check": true, none: true };
        if (!supportedRawOperations[request.raw.operation]) throw contractException("C010-MAPPING-SCHEMA", "evaluateDiagnostic raw operation is not supported: " + request.raw.operation);
        if ((request.raw.operation === "ratio" || request.raw.operation === "difference") && request.raw.inputs.length !== 2) throw contractException("C010-MAPPING-SCHEMA", "raw operation " + request.raw.operation + " requires exactly two inputs");
        var inputs = request.raw.inputs.map(function (input) { return validateEvaluationInput(input, "C010-MAPPING-SCHEMA"); });
        var eligibleInputs = inputs.filter(function (input) { return input.value !== null && ACTIVE_INPUT_STATES[input.state]; });
        var inputRefs = inputs.map(function (input) { return input.ref; });

        var presence;
        var rawState;
        var rawValue = null;
        if (eligibleInputs.length === 0) {
            // No eligible observation proves the concept present or an explicit zero.
            presence = "absent-from-eligible-source";
            rawState = "absent-from-eligible-source";
        } else if (request.raw.operation === "ratio" || request.raw.operation === "difference" || request.raw.operation === "sum") {
            if (eligibleInputs.length !== inputs.length) {
                rawState = "unavailable";
                presence = "unavailable";
            } else {
                var operands = inputs.map(function (input) {
                    var parsed = parseFiniteDecimal(input.value);
                    if (!parsed.ok) throw contractException("C010-INTEGRITY-NONFINITE", "diagnostic raw input value is not a finite decimal string: " + input.inputId);
                    return parsed.value;
                });
                if (request.raw.operation === "ratio") {
                    if (operands[1] === 0) { rawState = "blocked"; } else { rawValue = decimalString(operands[0] / operands[1]); rawState = "available"; }
                } else if (request.raw.operation === "difference") {
                    rawValue = decimalString(operands[0] - operands[1]); rawState = "available";
                } else {
                    rawValue = decimalString(operands.reduce(function (total, operand) { return total + operand; }, 0)); rawState = "available";
                }
                presence = "present";
            }
        } else {
            // presence-check or none: presence is proven by an eligible observation without a numeric result.
            presence = "present";
            rawState = "available";
        }

        var contextual = null;
        if (request.contextualAdjustment !== null) {
            var adjustment = request.contextualAdjustment;
            if (!hasExactKeys(adjustment, ["adjustmentId", "amount", "rationale", "sourceRefs", "sensitivity", "applicability"]) || !isId(adjustment.adjustmentId) || !isBoundedString(adjustment.amount, false) || !isBoundedString(adjustment.rationale, false) || !allStrings(adjustment.sourceRefs, false) || !isBoundedString(adjustment.sensitivity, false) || !isBoundedString(adjustment.applicability, false)) {
                throw contractException("C010-MAPPING-SCHEMA", "evaluateDiagnostic contextual adjustment requires adjustmentId, amount, rationale, sourceRefs, sensitivity, and applicability");
            }
            contextual = { adjustmentId: adjustment.adjustmentId, amount: adjustment.amount, rationale: adjustment.rationale, sourceRefs: adjustment.sourceRefs.slice(), sensitivity: adjustment.sensitivity, applicability: adjustment.applicability };
        }

        var interpretation = null;
        var capitalAllocation = null;
        if (request.interpretationMode === "capital-allocation") {
            capitalAllocation = interpretCapitalAllocation(inputs);
            interpretation = capitalAllocation.interpretation;
        }

        return deepFreeze({
            contractVersion: "company-diagnostic-check/v1",
            checkId: request.checkId,
            policyId: request.policyId,
            policyVersion: request.policyVersion,
            concept: request.concept,
            periodId: request.periodId,
            // The raw record renders first and is never erased by a contextual adjustment.
            raw: {
                formula: request.raw.formula,
                threshold: request.raw.threshold,
                operation: request.raw.operation,
                inputRefs: inputRefs,
                period: request.periodId,
                value: rawValue,
                state: rawState,
                presence: presence,
                inputs: inputs
            },
            contextual: contextual,
            presence: presence,
            capitalAllocation: capitalAllocation,
            interpretation: interpretation
        });
    }

    // Resolve the company archetype overlay (KPI priorities and diagnostic applicability) from configuration.
    function resolveArchetypeView(config, companyId) {
        if (!isPlainObject(config) || !isPlainObject(config.archetypes) || !Array.isArray(config.archetypes.definitions) || !Array.isArray(config.archetypes.assignments) || !isId(companyId)) {
            throw contractException("C010-CONFIG-SCHEMA", "resolveArchetypeView requires a config with archetype definitions and assignments and a company id");
        }
        var assignment = null;
        config.archetypes.assignments.forEach(function (candidate) { if (!assignment && candidate && candidate.companyId === companyId) assignment = candidate; });
        var unclassified = function (rationale) {
            return deepFreeze({ contractVersion: "company-archetype-view/v1", companyId: companyId, status: "unclassified", primaryArchetypeId: null, rationale: rationale, definition: null });
        };
        if (!assignment || assignment.status !== "accepted" || !assignment.primaryArchetypeId) {
            return unclassified(assignment && isBoundedString(assignment.rationale, false) ? assignment.rationale : "No accepted archetype assignment is available for this company.");
        }
        var definition = null;
        config.archetypes.definitions.forEach(function (candidate) { if (!definition && candidate && candidate.archetypeId === assignment.primaryArchetypeId) definition = candidate; });
        if (!definition) return unclassified("The assigned archetype is not defined in configuration.");
        return deepFreeze({
            contractVersion: "company-archetype-view/v1",
            companyId: companyId,
            status: "accepted",
            primaryArchetypeId: assignment.primaryArchetypeId,
            rationale: assignment.rationale,
            definition: clone(definition)
        });
    }

    root.RLCOMPANY = Object.freeze({
        EVIDENCE_CLASSES: EVIDENCE_CLASSES,
        EVIDENCE_STATES: EVIDENCE_STATES,
        RIGHTS_CLASSES: RIGHTS_CLASSES,
        ERROR_CODES: ERROR_CODES,
        canonicalizeCompanyObject: canonicalizeCompanyObject,
        sha256Hex: sha256Hex,
        companyObjectSha256: companyObjectSha256,
        companyManifestSha256: companyManifestSha256,
        parseFiniteDecimal: parseFiniteDecimal,
        isSafeRelativePath: isSafeRelativePath,
        makeError: makeError,
        validateObjectRef: validateObjectRef,
        validateCompanyConfig: validateCompanyConfig,
        validateCompanyIdentity: validateCompanyIdentity,
        validateReportingPeriod: validateReportingPeriod,
        validateSourceArtifact: validateSourceArtifact,
        parseSecSubmissionsResponse: parseSecSubmissionsResponse,
        validateFactObservation: validateFactObservation,
        validateNormalizedFact: validateNormalizedFact,
        validateCompanyDossier: validateCompanyDossier,
        validatePublicationManifest: validatePublicationManifest,
        validatePublicationGraph: validatePublicationGraph,
        validateCompanyError: validateCompanyError,
        propagateDependencyStates: propagateDependencyStates,
        selectSourcesView: selectSourcesView,
        selectSimpleView: selectSimpleView,
        classifyReportingPeriod: classifyReportingPeriod,
        reconcileFactObservations: reconcileFactObservations,
        evaluateStatementIntegrity: evaluateStatementIntegrity,
        evaluateDerivedMetric: evaluateDerivedMetric,
        evaluateDiagnostic: evaluateDiagnostic,
        resolveArchetypeView: resolveArchetypeView,
        projectAcceptedPublication: projectAcceptedPublication,
        loadSameOriginJson: loadSameOriginJson,
        validateCompanyCurrentPointer: validateCompanyCurrentPointer,
        loadCompanyPublication: loadCompanyPublication
    });
})();