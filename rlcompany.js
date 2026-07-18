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

    // Deterministic extractor for the exact SEC XBRL Company Facts response bytes. It never invents a
    // value: a requested concept resolves ONLY from the retained response, anchored to one coherent
    // balance-sheet reporting date so every same-period observation is drawn from the same real filing.
    // A concept the issuer does not tag (for example a bank regulatory-capital extension) resolves to an
    // explicit unavailable observation rather than a substitute figure.
    function parseSecCompanyFactsResponse(rawText, provenance, requests) {
        var provenanceKeys = ["sourceUrl", "cik", "retrievedAt", "mediaType", "rights", "requestIdentityPolicy"];
        if (typeof rawText !== "string" || rawText.length === 0 || utf8Binary(rawText).length > MAX_SEC_RESPONSE_BYTES) throw contractException("C010-SOURCE-SCHEMA", "SEC Company Facts response bytes must be non-empty and within the configured response bound");
        if (!hasExactKeys(provenance, provenanceKeys) || !CIK_PATTERN.test(provenance.cik || "") || provenance.sourceUrl !== "https://data.sec.gov/api/xbrl/companyfacts/CIK" + provenance.cik + ".json" || !isIso(provenance.retrievedAt) || !/^application\/json(?:;|$)/i.test(provenance.mediaType || "") || !RIGHTS_CLASS_SET[provenance.rights] || provenance.requestIdentityPolicy !== "sec-user-agent-required/v1") throw contractException("C010-SOURCE-SCHEMA", "SEC Company Facts provenance must identify the exact URL, CIK, retrieval clock, media type, rights, and request-identity policy");
        if (!Array.isArray(requests) || requests.length === 0) throw contractException("C010-MAPPING-SCHEMA", "SEC Company Facts extraction requires at least one requested concept");
        var response;
        try { response = JSON.parse(rawText); } catch (_error) { throw contractException("C010-PUBLICATION-JSON", "SEC Company Facts response bytes are not valid JSON"); }
        var responseCik = response && /^\d{1,10}$/.test(String(response.cik)) ? String(response.cik).padStart(10, "0") : null;
        if (responseCik !== provenance.cik || !isBoundedString(response.entityName, false) || !isPlainObject(response.facts)) throw contractException("C010-SOURCE-SCHEMA", "SEC Company Facts response is missing the exact issuer identity or facts map");

        var ANNUAL_FORMS = { "10-K": true, "10-K/A": true };
        var PERIODIC_FORMS = { "10-K": true, "10-K/A": true, "10-Q": true, "10-Q/A": true };
        function conceptUnits(sourceConcept, unit) {
            var parts = String(sourceConcept).split(":");
            if (parts.length !== 2) return null;
            var taxonomy = response.facts[parts[0]];
            var concept = taxonomy && isPlainObject(taxonomy) ? taxonomy[parts[1]] : null;
            var units = concept && isPlainObject(concept) && isPlainObject(concept.units) ? concept.units[unit] : null;
            return Array.isArray(units) ? { taxonomy: parts[0], concept: parts[1], entries: units, label: concept.label } : null;
        }
        function usableEntry(entry) {
            return isPlainObject(entry) && isIsoDate(entry.end) && typeof entry.val === "number" && isFinite(entry.val) && isBoundedString(entry.accn, false) && PERIODIC_FORMS[entry.form];
        }
        function decimalString(numberValue) {
            if (!Number.isInteger(numberValue)) return null; // SEC balance-sheet, share, and deposit amounts are integers; a non-integer is refused rather than rounded.
            return String(numberValue);
        }
        function laterFiled(candidate, incumbent) {
            if (!incumbent) return true;
            var candidateFiled = isIsoDate(candidate.filed) ? candidate.filed : "";
            var incumbentFiled = isIsoDate(incumbent.filed) ? incumbent.filed : "";
            if (candidateFiled !== incumbentFiled) return candidateFiled > incumbentFiled;
            return String(candidate.accn) > String(incumbent.accn);
        }

        var anchorRequests = requests.filter(function (request) { return request.role === "anchor"; });
        if (anchorRequests.length !== 1) throw contractException("C010-MAPPING-SCHEMA", "SEC Company Facts extraction requires exactly one anchor concept");
        var anchorRequest = anchorRequests[0];
        var anchorLookup = conceptUnits(anchorRequest.sourceConcept, anchorRequest.unit || "USD");
        if (!anchorLookup) throw contractException("C010-SOURCE-SCHEMA", "SEC Company Facts response does not tag the anchor balance-sheet concept " + anchorRequest.sourceConcept);
        var anchorEntry = null;
        anchorLookup.entries.forEach(function (entry) {
            if (!usableEntry(entry) || !ANNUAL_FORMS[entry.form]) return;
            if (!anchorEntry || entry.end > anchorEntry.end || (entry.end === anchorEntry.end && laterFiled(entry, anchorEntry))) anchorEntry = entry;
        });
        if (!anchorEntry) throw contractException("C010-SOURCE-SCHEMA", "SEC Company Facts response has no annual anchor balance-sheet entry for " + anchorRequest.sourceConcept);
        var anchorEnd = anchorEntry.end;

        function selectBalance(lookup) {
            var selected = null;
            lookup.entries.forEach(function (entry) {
                if (!usableEntry(entry) || entry.end !== anchorEnd || entry.start !== undefined) return; // balance-sheet (instant) facts carry no start.
                if (laterFiled(entry, selected)) selected = entry;
            });
            return selected;
        }
        function selectDuration(lookup) {
            var selected = null;
            lookup.entries.forEach(function (entry) {
                if (!usableEntry(entry) || entry.end !== anchorEnd || !isIsoDate(entry.start) || !ANNUAL_FORMS[entry.form]) return;
                var days = Math.round((Date.parse(entry.end + "T00:00:00Z") - Date.parse(entry.start + "T00:00:00Z")) / 86400000);
                if (days < 350 || days > 380) return; // only a full fiscal-year duration matches the annual anchor.
                if (laterFiled(entry, selected)) selected = entry;
            });
            return selected;
        }

        var observations = requests.map(function (request) {
            var unit = request.unit || "USD";
            var valueType = request.valueType || "integer";
            var lookup = conceptUnits(request.sourceConcept, unit);
            var base = {
                sourceConcept: request.sourceConcept,
                normalizedConcept: request.normalizedConcept || null,
                role: request.role,
                taxonomy: lookup ? lookup.taxonomy : String(request.sourceConcept).split(":")[0],
                concept: lookup ? lookup.concept : String(request.sourceConcept).split(":").slice(1).join(":"),
                unit: unit,
                valueType: valueType
            };
            var entry = null;
            if (lookup) entry = request.role === "duration" ? selectDuration(lookup) : selectBalance(lookup);
            if (!entry) {
                return Object.assign(base, { available: false, value: null, end: null, start: null, accn: null, fy: null, fp: null, form: null, filed: null });
            }
            var decimal = decimalString(entry.val);
            if (decimal === null) {
                return Object.assign(base, { available: false, value: null, end: null, start: null, accn: null, fy: null, fp: null, form: null, filed: null });
            }
            return Object.assign(base, {
                available: true,
                value: decimal,
                end: entry.end,
                start: isIsoDate(entry.start) ? entry.start : null,
                accn: entry.accn,
                fy: typeof entry.fy === "number" ? entry.fy : null,
                fp: isBoundedString(entry.fp, false) ? entry.fp : null,
                form: entry.form,
                filed: isIsoDate(entry.filed) ? entry.filed : null
            });
        });

        return deepFreeze({
            contractVersion: "company-sec-companyfacts-normalized/v1",
            contentSha256: "sha256:" + sha256Hex(rawText),
            sourceUrl: provenance.sourceUrl,
            cik: responseCik,
            entityName: response.entityName,
            anchor: {
                sourceConcept: anchorRequest.sourceConcept,
                end: anchorEntry.end,
                accn: anchorEntry.accn,
                form: anchorEntry.form,
                fy: typeof anchorEntry.fy === "number" ? anchorEntry.fy : null,
                fp: isBoundedString(anchorEntry.fp, false) ? anchorEntry.fp : null,
                filed: isIsoDate(anchorEntry.filed) ? anchorEntry.filed : null,
                unit: anchorRequest.unit || "USD"
            },
            observations: observations,
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
        var keys = ["contractVersion", "policyVersions", "validationLimits", "sec", "companies", "sources", "mappings", "archetypes", "formulas", "model", "freshnessPolicies", "materialityPolicy", "rightsPolicy", "peers", "feature002"];
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
        if (!hasExactKeys(value.materialityPolicy, ["policyVersion", "status", "rules"]) || !isBoundedString(value.materialityPolicy.policyVersion, false) || !["active", "not-authorized"].includes(value.materialityPolicy.status) || !Array.isArray(value.materialityPolicy.rules) || (value.materialityPolicy.status === "not-authorized" && value.materialityPolicy.rules.length !== 0) || (value.materialityPolicy.status === "active" && value.materialityPolicy.rules.length !== 1)) {
            addError(errors, "C010-CONFIG-SCHEMA", "config", null, "materialityPolicy", "invalid materiality policy", "exactly one active ranking rule or an empty not-authorized policy");
        } else if (value.materialityPolicy.status === "active") {
            try { validateBriefRankingPolicy(value.materialityPolicy.rules[0]); }
            catch (error) { addError(errors, "C010-CONFIG-SCHEMA", "config", null, "materialityPolicy", error.message, "valid company-brief-ranking/v1 rule"); }
        }
        validateConfiguredRightsPolicy(value.rightsPolicy, errors);
        validateConfiguredFeature002(value.feature002, errors, companyIds);
        validateConfiguredModel(value.model, errors, companyIds);
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
        if (["company-dossier-summary/v1", "fundamentals-tool-read/v1", "company-history-index/v1", "company-model-pack/v1"].includes(value.contractVersion)) return validateGenerationObject(value);
        if (value.contractVersion === "adaptive-company-brief/v1") return validateAdaptiveCompanyBrief(value);
        return finishValidation([makeError("C010-PUBLICATION-SCHEMA", "publication", "blocking", value.companyId || null, [], "unknown contract version: " + String(value.contractVersion), "supported company publication contract", true)], value);
    }

    function validateGenerationObject(value) {
        var errors = [];
        if (!isPlainObject(value) || !isId(value.companyId) || !isId(value.publicationId) || !isInteger(value.generation, 1)) addError(errors, "C010-PUBLICATION-SCHEMA", "publication", value && value.companyId ? value.companyId : null, null, "generation object lacks publication identity", "companyId, publicationId, and positive generation");
        validateBounds(value, "object", 0, errors, value && value.companyId ? value.companyId : null);
        return finishValidation(errors, value);
    }

    function validateAdaptiveCompanyBrief(value) {
        var errors = [];
        if (!isId(value.briefId) || !isId(value.companyId) || !isId(value.archetypeId) || !isId(value.acceptedScenarioRevisionId) || !HASH_PATTERN.test(value.acceptedStateFingerprint || "") || !["material-update", "unchanged", "partial", "stale", "conflicted", "unavailable"].includes(value.status) || !isPlainObject(value.clocks) || !Array.isArray(value.coverage) || !Array.isArray(value.reviewedEvidence) || !Array.isArray(value.materialChanges) || !Array.isArray(value.modelImpactProposals) || !Array.isArray(value.limitations) || !HASH_PATTERN.test(value.contentFingerprint || "")) {
            addError(errors, "C010-BRIEF-SCHEMA", "brief", value && value.companyId ? value.companyId : null, value && value.briefId ? value.briefId : null, "invalid adaptive company brief identity or bounded collections", "validated brief identity, status, clocks, coverage, evidence, proposals, limitations, and content fingerprint");
        }
        validateBounds(value, "brief", 0, errors, value && value.companyId ? value.companyId : null);
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
            manifestSha256: manifest.manifestSha256,
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
            ownerRead: clone(objects[manifest.ownerReadRef.objectId]),
            modelPack: manifest.modelPackRef ? clone(objects[manifest.modelPackRef.objectId]) : null,
            brief: manifest.briefRef ? clone(objects[manifest.briefRef.objectId]) : null
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

    // ------------------------------------------------------------------
    // Scope 3 (Increment A): linked model evaluation and user-owned accepted state.
    // A model definition is a pure acyclic graph of driver leaves and computed
    // nodes. Editing one driver recomputes only dependency-reachable nodes from
    // one draft tuple; unreachable history is carried unchanged; failed nodes
    // report their explicit dependency path. Evidence refresh cannot rebase an
    // accepted revision — only an explicit user confirmation creates a new one.
    // ------------------------------------------------------------------

    var MODEL_NODE_KINDS = Object.freeze(["statement", "cash", "balance", "kpi", "per-share", "valuation"]);
    var MODEL_NODE_KIND_SET = toSet(MODEL_NODE_KINDS);
    // Fixed arity per operation; 0 means variadic (>= 2 inputs). No operation carries an implicit default value.
    var MODEL_OPERATIONS = Object.freeze({ grow: 2, product: 2, ratio: 2, difference: 2, sum: 0, passthrough: 1 });

    function validateModelDefinition(modelDefinition) {
        if (!isPlainObject(modelDefinition) || !hasExactKeys(modelDefinition, ["modelDefinitionId", "modelVersion", "family", "label", "status", "drivers", "nodes"])) {
            throw contractException("C010-MODEL-DEPENDENCY", "model definition requires modelDefinitionId, modelVersion, family, label, status, drivers, and nodes");
        }
        if (!isId(modelDefinition.modelDefinitionId) || !isBoundedString(modelDefinition.modelVersion, false) || !isBoundedString(modelDefinition.family, false) || !isBoundedString(modelDefinition.label, false) || !["accepted", "proposed", "retired"].includes(modelDefinition.status) || !Array.isArray(modelDefinition.drivers) || modelDefinition.drivers.length === 0 || !Array.isArray(modelDefinition.nodes) || modelDefinition.nodes.length === 0) {
            throw contractException("C010-MODEL-DEPENDENCY", "model definition identity, status, drivers, or nodes are invalid");
        }
        var driverIds = Object.create(null);
        modelDefinition.drivers.forEach(function (driver) {
            if (!isPlainObject(driver) || !hasExactKeys(driver, ["driverId", "concept", "unit", "editable"]) || !isId(driver.driverId) || !isBoundedString(driver.concept, false) || !isBoundedString(driver.unit, false) || typeof driver.editable !== "boolean" || driverIds[driver.driverId]) {
                throw contractException("C010-MODEL-DEPENDENCY", "invalid or duplicate model driver: " + String(driver && driver.driverId));
            }
            driverIds[driver.driverId] = true;
        });
        var nodeIds = Object.create(null);
        modelDefinition.nodes.forEach(function (node) {
            if (!isPlainObject(node) || !hasExactKeys(node, ["nodeId", "kind", "concept", "unit", "operation", "inputs"]) || !isId(node.nodeId) || !MODEL_NODE_KIND_SET[node.kind] || !isBoundedString(node.concept, false) || !isBoundedString(node.unit, false) || !Object.prototype.hasOwnProperty.call(MODEL_OPERATIONS, node.operation) || !Array.isArray(node.inputs) || node.inputs.length === 0 || nodeIds[node.nodeId] || driverIds[node.nodeId]) {
                throw contractException("C010-MODEL-DEPENDENCY", "invalid or duplicate model node: " + String(node && node.nodeId));
            }
            var arity = MODEL_OPERATIONS[node.operation];
            if (node.operation === "sum") {
                if (node.inputs.length < 2) throw contractException("C010-MODEL-DEPENDENCY", "sum node " + node.nodeId + " requires at least two inputs");
            } else if (node.inputs.length !== arity) {
                throw contractException("C010-MODEL-DEPENDENCY", "operation " + node.operation + " on node " + node.nodeId + " requires exactly " + arity + " inputs");
            }
            if (!uniqueStrings(node.inputs, false)) throw contractException("C010-MODEL-DEPENDENCY", "node " + node.nodeId + " repeats an input");
            nodeIds[node.nodeId] = true;
        });
        modelDefinition.nodes.forEach(function (node) {
            node.inputs.forEach(function (inputId) {
                if (!driverIds[inputId] && !nodeIds[inputId]) throw contractException("C010-MODEL-DEPENDENCY", "node " + node.nodeId + " references unknown input " + String(inputId));
            });
        });
        return { driverIds: driverIds, nodeIds: nodeIds };
    }

    function modelTopoOrder(modelDefinition) {
        // Kahn topological order over node->node edges; drivers are always leaf sources.
        var nodeIdSet = toSet(modelDefinition.nodes.map(function (node) { return node.nodeId; }));
        var indegree = Object.create(null);
        var consumers = Object.create(null);
        modelDefinition.drivers.forEach(function (driver) { consumers[driver.driverId] = consumers[driver.driverId] || []; });
        modelDefinition.nodes.forEach(function (node) { indegree[node.nodeId] = 0; consumers[node.nodeId] = consumers[node.nodeId] || []; });
        modelDefinition.nodes.forEach(function (node) {
            node.inputs.forEach(function (inputId) {
                consumers[inputId] = consumers[inputId] || [];
                consumers[inputId].push(node.nodeId);
                if (nodeIdSet[inputId]) indegree[node.nodeId]++;
            });
        });
        var queue = modelDefinition.nodes.filter(function (node) { return indegree[node.nodeId] === 0; }).map(function (node) { return node.nodeId; });
        var order = [];
        while (queue.length) {
            var id = queue.shift();
            order.push(id);
            consumers[id].forEach(function (childId) {
                if (nodeIdSet[childId]) { indegree[childId]--; if (indegree[childId] === 0) queue.push(childId); }
            });
        }
        if (order.length !== modelDefinition.nodes.length) throw contractException("C010-MODEL-CYCLE", "model definition contains a cyclic dependency");
        return { order: order, consumers: consumers, nodeIdSet: nodeIdSet };
    }

    function modelReachableFrom(startId, consumers, nodeIdSet) {
        // Breadth-first walk from the changed driver to every dependency-reachable node, with parent pointers.
        var reachable = Object.create(null);
        var parent = Object.create(null);
        var seen = Object.create(null);
        seen[startId] = true;
        var queue = [startId];
        while (queue.length) {
            var id = queue.shift();
            (consumers[id] || []).forEach(function (childId) {
                if (!seen[childId]) {
                    seen[childId] = true;
                    parent[childId] = id;
                    if (nodeIdSet[childId]) reachable[childId] = true;
                    queue.push(childId);
                }
            });
        }
        return { reachable: reachable, parent: parent };
    }

    function modelDependencyPath(nodeId, startId, parent) {
        var path = [nodeId];
        var current = nodeId;
        while (current !== startId && parent[current] !== undefined) {
            current = parent[current];
            path.unshift(current);
        }
        return path;
    }

    function evaluateModel(request) {
        if (!isPlainObject(request) || !hasExactKeys(request, ["modelDefinition", "baseline", "draft"])) {
            throw contractException("C010-MODEL-DEPENDENCY", "evaluateModel requires modelDefinition, baseline, and draft");
        }
        var modelDefinition = clone(request.modelDefinition);
        var baseline = clone(request.baseline);
        var draft = clone(request.draft);
        validateModelDefinition(modelDefinition);
        if (!isPlainObject(baseline) || !isPlainObject(baseline.assumptions) || !isPlainObject(baseline.outputs)) throw contractException("C010-MODEL-DEPENDENCY", "evaluateModel baseline requires assumptions and outputs maps");
        if (!isPlainObject(draft) || !isId(draft.changedDriverId) || !isPlainObject(draft.assumptions)) throw contractException("C010-MODEL-DEPENDENCY", "evaluateModel draft requires a changedDriverId and an assumptions map");
        var driverById = Object.create(null);
        modelDefinition.drivers.forEach(function (driver) { driverById[driver.driverId] = driver; });
        if (!driverById[draft.changedDriverId]) throw contractException("C010-MODEL-DEPENDENCY", "the changed driver is not part of the model definition: " + draft.changedDriverId);
        modelDefinition.drivers.forEach(function (driver) {
            if (!Object.prototype.hasOwnProperty.call(draft.assumptions, driver.driverId)) throw contractException("C010-MODEL-DEPENDENCY", "the draft tuple is missing an assumption for driver " + driver.driverId);
        });

        var topo = modelTopoOrder(modelDefinition);
        var reach = modelReachableFrom(draft.changedDriverId, topo.consumers, topo.nodeIdSet);
        var nodeById = Object.create(null);
        modelDefinition.nodes.forEach(function (node) { nodeById[node.nodeId] = node; });

        var computedValue = Object.create(null);
        var blockedById = Object.create(null);
        var reasonById = Object.create(null);

        function driverNumber(driverId) {
            var parsed = parseFiniteDecimal(String(draft.assumptions[driverId]));
            if (!parsed.ok) throw contractException("C010-INTEGRITY-NONFINITE", "driver value is not a finite decimal string: " + driverId);
            return parsed.value;
        }

        function resolveInput(inputId) {
            if (driverById[inputId]) return { value: driverNumber(inputId), blocked: false };
            if (blockedById[inputId]) return { value: null, blocked: true, blockedNode: inputId };
            return { value: computedValue[inputId], blocked: false };
        }

        topo.order.forEach(function (nodeId) {
            var node = nodeById[nodeId];
            if (!reach.reachable[nodeId]) {
                // Unreachable: carry the immutable baseline value verbatim; never recompute.
                if (!Object.prototype.hasOwnProperty.call(baseline.outputs, nodeId)) throw contractException("C010-MODEL-DEPENDENCY", "baseline is missing a carried output for unreachable node " + nodeId);
                var carried = parseFiniteDecimal(String(baseline.outputs[nodeId]));
                if (!carried.ok) throw contractException("C010-INTEGRITY-NONFINITE", "carried baseline output is not a finite decimal string: " + nodeId);
                computedValue[nodeId] = carried.value;
                blockedById[nodeId] = false;
                return;
            }
            var operands = [];
            var blockedInput = null;
            for (var index = 0; index < node.inputs.length; index++) {
                var resolved = resolveInput(node.inputs[index]);
                if (resolved.blocked) { blockedInput = resolved.blockedNode; break; }
                operands.push(resolved.value);
            }
            if (blockedInput) {
                blockedById[nodeId] = true;
                computedValue[nodeId] = null;
                reasonById[nodeId] = "Blocked because upstream dependency " + blockedInput + " is blocked.";
                return;
            }
            var result;
            if (node.operation === "grow") result = operands[0] * (1 + operands[1]);
            else if (node.operation === "product") result = operands[0] * operands[1];
            else if (node.operation === "difference") result = operands[0] - operands[1];
            else if (node.operation === "passthrough") result = operands[0];
            else if (node.operation === "sum") result = operands.reduce(function (total, operand) { return total + operand; }, 0);
            else {
                // ratio
                if (operands[1] === 0) {
                    blockedById[nodeId] = true;
                    computedValue[nodeId] = null;
                    reasonById[nodeId] = "Blocked by an invalid (zero) denominator for " + node.concept + ".";
                    return;
                }
                result = operands[0] / operands[1];
            }
            if (!Number.isFinite(result)) {
                blockedById[nodeId] = true;
                computedValue[nodeId] = null;
                reasonById[nodeId] = "Blocked by a non-finite result for " + node.concept + ".";
                return;
            }
            computedValue[nodeId] = result;
            blockedById[nodeId] = false;
        });

        var reachableNodeIds = [];
        var unchangedNodeIds = [];
        var blockedNodeIds = [];
        var outputs = modelDefinition.nodes.map(function (node) {
            var recomputed = !!reach.reachable[node.nodeId];
            if (recomputed) reachableNodeIds.push(node.nodeId); else unchangedNodeIds.push(node.nodeId);
            var blocked = !!blockedById[node.nodeId];
            if (blocked) blockedNodeIds.push(node.nodeId);
            var value;
            if (!recomputed) value = baseline.outputs[node.nodeId];
            else value = blocked ? null : decimalString(computedValue[node.nodeId]);
            return {
                nodeId: node.nodeId,
                kind: node.kind,
                concept: node.concept,
                unit: node.unit,
                operation: node.operation,
                value: value,
                state: blocked ? "blocked" : "available",
                reason: blocked ? (reasonById[node.nodeId] || "Blocked.") : null,
                dependencyPath: blocked ? modelDependencyPath(node.nodeId, draft.changedDriverId, reach.parent) : [],
                recomputed: recomputed
            };
        });

        return deepFreeze({
            contractVersion: "company-model-evaluation/v1",
            modelDefinitionId: modelDefinition.modelDefinitionId,
            changedDriverId: draft.changedDriverId,
            outputs: outputs,
            reachableNodeIds: reachableNodeIds,
            unchangedNodeIds: unchangedNodeIds,
            blockedNodeIds: blockedNodeIds
        });
    }

    function validateScenarioRevisionShape(revision) {
        var keys = ["contractVersion", "scenarioRevisionId", "scenarioId", "revision", "companyId", "name", "owner", "state", "modelDefinitionId", "historicalCutoff", "assumptions", "outputs", "parentRevisionId", "createdAt"];
        if (!isPlainObject(revision) || !hasExactKeys(revision, keys) || revision.contractVersion !== "company-scenario-revision/v1" || !isId(revision.scenarioRevisionId) || !isId(revision.scenarioId) || !isInteger(revision.revision, 1) || !isId(revision.companyId) || !isBoundedString(revision.name, false) || !["committed-research", "local-user"].includes(revision.owner) || !["draft", "active", "superseded"].includes(revision.state) || !isId(revision.modelDefinitionId) || (!isIsoDate(revision.historicalCutoff) && !isIso(revision.historicalCutoff)) || !Array.isArray(revision.assumptions) || revision.assumptions.length === 0 || !Array.isArray(revision.outputs) || (revision.parentRevisionId !== null && !isId(revision.parentRevisionId)) || !isIso(revision.createdAt)) {
            throw contractException("C010-MODEL-DEPENDENCY", "invalid company-scenario-revision/v1 shape");
        }
        revision.assumptions.forEach(function (assumption) {
            if (!hasExactKeys(assumption, ["driverId", "value"]) || !isId(assumption.driverId) || !parseFiniteDecimal(String(assumption.value)).ok) throw contractException("C010-MODEL-DEPENDENCY", "invalid scenario assumption");
        });
        revision.outputs.forEach(function (output) {
            if (!hasExactKeys(output, ["nodeId", "value"]) || !isId(output.nodeId)) throw contractException("C010-MODEL-DEPENDENCY", "invalid scenario output");
        });
        return revision;
    }

    function scenarioBaselineTuple(revision) {
        var assumptions = Object.create(null);
        revision.assumptions.forEach(function (assumption) { assumptions[assumption.driverId] = assumption.value; });
        var outputs = Object.create(null);
        revision.outputs.forEach(function (output) { outputs[output.nodeId] = output.value; });
        return { assumptions: assumptions, outputs: outputs };
    }

    function reduceScenarioDraft(request) {
        if (!isPlainObject(request) || !hasExactKeys(request, ["activeRevision", "modelDefinition", "editAssumption"])) throw contractException("C010-MODEL-DEPENDENCY", "reduceScenarioDraft requires activeRevision, modelDefinition, and editAssumption");
        var activeRevision = clone(request.activeRevision);
        var modelDefinition = clone(request.modelDefinition);
        var edit = clone(request.editAssumption);
        validateScenarioRevisionShape(activeRevision);
        validateModelDefinition(modelDefinition);
        if (!isPlainObject(edit) || !isId(edit.driverId) || !parseFiniteDecimal(String(edit.value)).ok) throw contractException("C010-MODEL-DEPENDENCY", "editAssumption requires a driverId and a finite decimal value");
        var baseline = scenarioBaselineTuple(activeRevision);
        if (!Object.prototype.hasOwnProperty.call(baseline.assumptions, edit.driverId)) throw contractException("C010-MODEL-DEPENDENCY", "the edited driver is not part of the active revision assumptions: " + edit.driverId);
        var draftAssumptions = Object.assign({}, baseline.assumptions);
        draftAssumptions[edit.driverId] = String(edit.value);
        var evaluation = evaluateModel({ modelDefinition: modelDefinition, baseline: baseline, draft: { changedDriverId: edit.driverId, assumptions: draftAssumptions } });
        return deepFreeze({
            contractVersion: "company-scenario-draft/v1",
            scenarioId: activeRevision.scenarioId,
            baseRevision: activeRevision.revision,
            baseRevisionId: activeRevision.scenarioRevisionId,
            changedDriverId: edit.driverId,
            changedValue: String(edit.value),
            assumptions: Object.keys(draftAssumptions).map(function (driverId) { return { driverId: driverId, value: draftAssumptions[driverId] }; }),
            evaluation: evaluation,
            state: "draft"
        });
    }

    function reduceCompanySelection(request) {
        if (!isPlainObject(request) || !hasExactKeys(request, ["activeRevision", "modelDefinition", "acceptedPublication"])) throw contractException("C010-MODEL-DEPENDENCY", "reduceCompanySelection requires activeRevision, modelDefinition, and acceptedPublication");
        var activeRevision = clone(request.activeRevision);
        var modelDefinition = clone(request.modelDefinition);
        var acceptedPublication = clone(request.acceptedPublication);
        validateScenarioRevisionShape(activeRevision);
        validateModelDefinition(modelDefinition);
        if (!isPlainObject(acceptedPublication) || !isId(acceptedPublication.publicationId) || !isInteger(acceptedPublication.generation, 1) || !HASH_PATTERN.test(acceptedPublication.manifestSha256 || "") || !Array.isArray(acceptedPublication.evidenceChanges)) {
            throw contractException("C010-PUBLICATION-SCHEMA", "reduceCompanySelection requires a hash-valid accepted publication with evidence changes");
        }
        var driverByConcept = Object.create(null);
        modelDefinition.drivers.forEach(function (driver) { driverByConcept[driver.concept] = driver; });
        var proposals = [];
        acceptedPublication.evidenceChanges.forEach(function (change) {
            if (!isPlainObject(change) || !isBoundedString(change.concept, false)) throw contractException("C010-PUBLICATION-SCHEMA", "an evidence change requires a concept");
            var driver = driverByConcept[change.concept];
            if (!driver) return; // an evidence change with no model driver raises no proposal and never rebases
            proposals.push(deepFreeze({
                contractVersion: "company-model-impact-proposal/v1",
                proposalId: "proposal-" + driver.driverId + "-g" + acceptedPublication.generation,
                companyId: activeRevision.companyId,
                scenarioId: activeRevision.scenarioId,
                baseRevision: activeRevision.revision,
                baseRevisionId: activeRevision.scenarioRevisionId,
                affectedDriverId: driver.driverId,
                concept: change.concept,
                direction: isBoundedString(change.direction, false) ? change.direction : "unspecified",
                priorValue: change.priorValue !== undefined ? change.priorValue : null,
                currentValue: change.currentValue !== undefined ? change.currentValue : null,
                proposedValue: change.currentValue !== undefined ? change.currentValue : null,
                rationale: "A newer hash-valid publication changed evidence for " + change.concept + "; the accepted assumption is preserved until you decide.",
                confidence: isPlainObject(change.confidence) ? change.confidence : { band: "unspecified" },
                invalidation: isBoundedString(change.invalidation, false) ? change.invalidation : "A later restatement or conflicting filing supersedes this evidence change.",
                sourceRef: change.sourceRef !== undefined ? change.sourceRef : null,
                decisionState: "pending",
                resultingRevision: null
            }));
        });
        return deepFreeze({
            contractVersion: "company-selection-result/v1",
            companyId: activeRevision.companyId,
            scenarioId: activeRevision.scenarioId,
            activeRevision: activeRevision,
            rebased: false,
            acceptedPublication: { publicationId: acceptedPublication.publicationId, generation: acceptedPublication.generation, manifestSha256: acceptedPublication.manifestSha256 },
            proposals: proposals
        });
    }

    function reduceProposalDecision(request) {
        if (!isPlainObject(request) || !hasExactKeys(request, ["activeRevision", "proposal", "decision", "modelDefinition"])) throw contractException("C010-MODEL-DEPENDENCY", "reduceProposalDecision requires activeRevision, proposal, decision, and modelDefinition");
        var activeRevision = clone(request.activeRevision);
        var proposal = clone(request.proposal);
        var decision = clone(request.decision);
        var modelDefinition = clone(request.modelDefinition);
        validateScenarioRevisionShape(activeRevision);
        validateModelDefinition(modelDefinition);
        if (!isPlainObject(proposal) || proposal.contractVersion !== "company-model-impact-proposal/v1" || !isId(proposal.affectedDriverId) || proposal.decisionState !== "pending") {
            throw contractException("C010-MODEL-DEPENDENCY", "reduceProposalDecision requires a pending company-model-impact-proposal/v1");
        }
        if (!isPlainObject(decision) || !["accept", "edit-confirm", "reject"].includes(decision.kind) || !isIso(decision.confirmedAt)) {
            throw contractException("C010-MODEL-DEPENDENCY", "the decision requires a kind of accept, edit-confirm, or reject and a confirmedAt clock");
        }
        // The active revision is never mutated; it is returned as an immutable prior revision.
        var priorRevision = clone(activeRevision);
        if (decision.kind === "reject") {
            return deepFreeze({
                contractVersion: "company-proposal-decision-result/v1",
                decisionState: "rejected",
                revisionsCreated: 0,
                priorRevision: priorRevision,
                newRevision: null,
                decision: { kind: "reject", proposalId: proposal.proposalId, recordedAt: decision.confirmedAt, rationale: isBoundedString(decision.rationale, false) ? decision.rationale : "The user rejected the proposal; the accepted revision is unchanged." }
            });
        }
        var newValue;
        var decisionState;
        if (decision.kind === "accept") { newValue = proposal.proposedValue; decisionState = "accepted"; } else {
            if (!parseFiniteDecimal(String(decision.editedValue)).ok) throw contractException("C010-MODEL-DEPENDENCY", "edit-confirm requires a finite editedValue");
            newValue = String(decision.editedValue);
            decisionState = "edited-and-confirmed";
        }
        if (!parseFiniteDecimal(String(newValue)).ok) throw contractException("C010-MODEL-DEPENDENCY", "the applied assumption value must be a finite decimal string");
        var assumptionsMap = Object.create(null);
        activeRevision.assumptions.forEach(function (assumption) { assumptionsMap[assumption.driverId] = assumption.value; });
        if (!Object.prototype.hasOwnProperty.call(assumptionsMap, proposal.affectedDriverId)) throw contractException("C010-MODEL-DEPENDENCY", "the proposal targets a driver absent from the active revision: " + proposal.affectedDriverId);
        assumptionsMap[proposal.affectedDriverId] = String(newValue);
        var baseline = scenarioBaselineTuple(activeRevision);
        var evaluation = evaluateModel({ modelDefinition: modelDefinition, baseline: baseline, draft: { changedDriverId: proposal.affectedDriverId, assumptions: assumptionsMap } });
        var newRevision = deepFreeze({
            contractVersion: "company-scenario-revision/v1",
            scenarioRevisionId: activeRevision.scenarioId + "-r" + (activeRevision.revision + 1),
            scenarioId: activeRevision.scenarioId,
            revision: activeRevision.revision + 1,
            companyId: activeRevision.companyId,
            name: activeRevision.name,
            owner: activeRevision.owner,
            state: "active",
            modelDefinitionId: activeRevision.modelDefinitionId,
            historicalCutoff: activeRevision.historicalCutoff,
            assumptions: Object.keys(assumptionsMap).map(function (driverId) { return { driverId: driverId, value: assumptionsMap[driverId] }; }),
            outputs: evaluation.outputs.map(function (output) { return { nodeId: output.nodeId, value: output.value }; }),
            parentRevisionId: activeRevision.scenarioRevisionId,
            createdAt: decision.confirmedAt
        });
        return deepFreeze({
            contractVersion: "company-proposal-decision-result/v1",
            decisionState: decisionState,
            revisionsCreated: 1,
            priorRevision: priorRevision,
            newRevision: newRevision,
            decision: { kind: decision.kind, proposalId: proposal.proposalId, recordedAt: decision.confirmedAt, appliedValue: String(newValue) }
        });
    }

    function forecastObservationShape(observation, label) {
        var keys = ["observationId", "evidenceClass", "definition", "unit", "currency", "periodId", "value", "sourceRef", "clocks"];
        if (!isPlainObject(observation) || !hasExactKeys(observation, keys) || !isId(observation.observationId) || !EVIDENCE_CLASS_SET[observation.evidenceClass] || !isBoundedString(observation.definition, false) || !isBoundedString(observation.unit, false) || (observation.currency !== null && !/^[A-Z]{3}$/.test(observation.currency)) || !isBoundedString(observation.periodId, false) || (observation.value !== null && !isBoundedString(observation.value, true)) || !isBoundedString(String(observation.sourceRef), false) || !isPlainObject(observation.clocks)) {
            throw contractException("C010-SOURCE-SCHEMA", label + " forecast observation is invalid");
        }
        return {
            observationId: observation.observationId,
            evidenceClass: observation.evidenceClass,
            definition: observation.definition,
            unit: observation.unit,
            currency: observation.currency,
            periodId: observation.periodId,
            value: observation.value,
            sourceRef: observation.sourceRef,
            clocks: clone(observation.clocks)
        };
    }

    function deriveForecastError(request) {
        if (!isPlainObject(request) || !hasExactKeys(request, ["estimate", "actual"])) throw contractException("C010-SOURCE-SCHEMA", "deriveForecastError requires an estimate and an actual observation");
        var estimate = forecastObservationShape(request.estimate, "estimate");
        var actual = forecastObservationShape(request.actual, "actual");
        // Classes never collapse: the estimate keeps its estimate class; the actual keeps its reported/normalized class.
        if (estimate.evidenceClass !== "estimate") throw contractException("C010-SOURCE-SCHEMA", "the estimate observation must carry the estimate evidence class");
        if (!["reported", "normalized"].includes(actual.evidenceClass)) throw contractException("C010-SOURCE-SCHEMA", "the actual observation must carry a reported or normalized evidence class");
        var mismatches = [];
        if (estimate.definition !== actual.definition) mismatches.push("definition");
        if (estimate.unit !== actual.unit) mismatches.push("unit");
        if (estimate.currency !== actual.currency) mismatches.push("currency");
        if (estimate.periodId !== actual.periodId) mismatches.push("period");
        var comparable = mismatches.length === 0;
        var forecastError = null;
        var reason = null;
        if (!comparable) {
            reason = "Forecast error is withheld until the estimate and actual are comparable; mismatched: " + mismatches.join(", ") + ".";
        } else if (estimate.value === null || actual.value === null) {
            comparable = false;
            reason = "Forecast error requires both an estimate value and a reported actual value.";
        } else {
            var estimateNumber = parseFiniteDecimal(estimate.value);
            var actualNumber = parseFiniteDecimal(actual.value);
            if (!estimateNumber.ok || !actualNumber.ok) throw contractException("C010-INTEGRITY-NONFINITE", "forecast observation values must be finite decimal strings");
            var errorValue = actualNumber.value - estimateNumber.value;
            forecastError = {
                value: decimalString(errorValue),
                unit: actual.unit,
                currency: actual.currency,
                periodId: actual.periodId,
                ratio: estimateNumber.value === 0 ? null : decimalString(errorValue / estimateNumber.value)
            };
        }
        return deepFreeze({
            contractVersion: "company-forecast-error/v1",
            concept: actual.definition,
            periodId: actual.periodId,
            estimate: estimate,
            actual: actual,
            comparable: comparable,
            forecastError: forecastError,
            reason: reason
        });
    }

    // Compute every node value fresh from one full assumptions tuple in dependency order.
    // Used to materialize the accepted scenario's published baseline outputs.
    function computeModelBaseline(modelDefinition, assumptions) {
        var definition = clone(modelDefinition);
        var tuple = clone(assumptions);
        validateModelDefinition(definition);
        if (!isPlainObject(tuple)) throw contractException("C010-MODEL-DEPENDENCY", "computeModelBaseline requires an assumptions map");
        definition.drivers.forEach(function (driver) {
            if (!Object.prototype.hasOwnProperty.call(tuple, driver.driverId) || !parseFiniteDecimal(String(tuple[driver.driverId])).ok) throw contractException("C010-MODEL-DEPENDENCY", "computeModelBaseline is missing a finite assumption for driver " + driver.driverId);
        });
        var topo = modelTopoOrder(definition);
        var driverById = Object.create(null);
        definition.drivers.forEach(function (driver) { driverById[driver.driverId] = driver; });
        var nodeById = Object.create(null);
        definition.nodes.forEach(function (node) { nodeById[node.nodeId] = node; });
        var computedValue = Object.create(null);
        var blockedById = Object.create(null);
        var reasonById = Object.create(null);
        topo.order.forEach(function (nodeId) {
            var node = nodeById[nodeId];
            var operands = [];
            var blockedInput = null;
            for (var index = 0; index < node.inputs.length; index++) {
                var inputId = node.inputs[index];
                if (driverById[inputId]) { operands.push(parseFiniteDecimal(String(tuple[inputId])).value); continue; }
                if (blockedById[inputId]) { blockedInput = inputId; break; }
                operands.push(computedValue[inputId]);
            }
            if (blockedInput) { blockedById[nodeId] = true; computedValue[nodeId] = null; reasonById[nodeId] = "Blocked because upstream dependency " + blockedInput + " is blocked."; return; }
            var result;
            if (node.operation === "grow") result = operands[0] * (1 + operands[1]);
            else if (node.operation === "product") result = operands[0] * operands[1];
            else if (node.operation === "difference") result = operands[0] - operands[1];
            else if (node.operation === "passthrough") result = operands[0];
            else if (node.operation === "sum") result = operands.reduce(function (total, operand) { return total + operand; }, 0);
            else {
                if (operands[1] === 0) { blockedById[nodeId] = true; computedValue[nodeId] = null; reasonById[nodeId] = "Blocked by an invalid (zero) denominator for " + node.concept + "."; return; }
                result = operands[0] / operands[1];
            }
            if (!Number.isFinite(result)) { blockedById[nodeId] = true; computedValue[nodeId] = null; reasonById[nodeId] = "Blocked by a non-finite result for " + node.concept + "."; return; }
            computedValue[nodeId] = result;
            blockedById[nodeId] = false;
        });
        var blockedNodeIds = [];
        var outputs = definition.nodes.map(function (node) {
            var blocked = !!blockedById[node.nodeId];
            if (blocked) blockedNodeIds.push(node.nodeId);
            return { nodeId: node.nodeId, kind: node.kind, concept: node.concept, unit: node.unit, value: blocked ? null : decimalString(computedValue[node.nodeId]), state: blocked ? "blocked" : "available", reason: blocked ? (reasonById[node.nodeId] || "Blocked.") : null };
        });
        return deepFreeze({ contractVersion: "company-model-baseline/v1", modelDefinitionId: definition.modelDefinitionId, outputs: outputs, blockedNodeIds: blockedNodeIds });
    }

    function validateConfiguredModel(model, errors, companyIds) {
        if (!isPlainObject(model) || !hasExactKeys(model, ["policyVersion", "definitions", "scenarios"]) || !isBoundedString(model.policyVersion, false) || !Array.isArray(model.definitions) || model.definitions.length === 0 || !Array.isArray(model.scenarios)) {
            addError(errors, "C010-CONFIG-SCHEMA", "config", null, "model", "invalid model configuration group", "explicit model policy version, at least one definition, and a scenarios array");
            return;
        }
        var definitionById = Object.create(null);
        model.definitions.forEach(function (definition) {
            var ref = definition && definition.modelDefinitionId ? definition.modelDefinitionId : "model definitions";
            try {
                validateModelDefinition(definition);
                modelTopoOrder(definition);
            } catch (error) {
                addError(errors, error.code === "C010-MODEL-CYCLE" ? "C010-MODEL-CYCLE" : "C010-MODEL-DEPENDENCY", "model", null, ref, error.message, "acyclic model definition with valid drivers, nodes, and operations");
                return;
            }
            if (definitionById[definition.modelDefinitionId]) addError(errors, "C010-INTEGRITY-DUPLICATE", "integrity", null, ref, "duplicate model definition id", "unique model definition ids");
            definitionById[definition.modelDefinitionId] = definition;
        });
        var scenarioIds = Object.create(null);
        model.scenarios.forEach(function (scenario) {
            var ref = scenario && scenario.scenarioId ? scenario.scenarioId : "model scenarios";
            if (!isPlainObject(scenario) || !hasExactKeys(scenario, ["scenarioId", "companyId", "modelDefinitionId", "revision", "name", "owner", "status", "historicalCutoff", "assumptions"]) || !isId(scenario.scenarioId) || !isId(scenario.companyId) || !isId(scenario.modelDefinitionId) || !isInteger(scenario.revision, 1) || !isBoundedString(scenario.name, false) || !["committed-research", "local-user"].includes(scenario.owner) || !["accepted", "draft", "superseded"].includes(scenario.status) || (!isIsoDate(scenario.historicalCutoff) && !isIso(scenario.historicalCutoff)) || !Array.isArray(scenario.assumptions) || scenario.assumptions.length === 0) {
                addError(errors, "C010-CONFIG-SCHEMA", "config", scenario && scenario.companyId ? scenario.companyId : null, ref, "invalid model scenario", "explicit scenario identity, model reference, owner, status, cutoff, and assumptions");
                return;
            }
            if (scenarioIds[scenario.scenarioId]) addError(errors, "C010-INTEGRITY-DUPLICATE", "integrity", null, ref, "duplicate scenario id", "unique scenario ids");
            scenarioIds[scenario.scenarioId] = true;
            if (companyIds && !companyIds[scenario.companyId]) addError(errors, "C010-CONFIG-REFERENCE", "config", scenario.companyId, scenario.companyId, "scenario references an unknown company", "configured companyId");
            var definition = definitionById[scenario.modelDefinitionId];
            if (!definition) { addError(errors, "C010-CONFIG-REFERENCE", "config", null, scenario.modelDefinitionId, "scenario references an unknown model definition", "configured modelDefinitionId"); return; }
            var driverIds = toSet(definition.drivers.map(function (driver) { return driver.driverId; }));
            var assumed = Object.create(null);
            scenario.assumptions.forEach(function (assumption) {
                if (!isPlainObject(assumption) || !hasExactKeys(assumption, ["driverId", "value"]) || !isId(assumption.driverId) || !parseFiniteDecimal(String(assumption.value)).ok) {
                    addError(errors, "C010-CONFIG-SCHEMA", "config", null, ref, "invalid scenario assumption", "explicit driverId and finite decimal value");
                    return;
                }
                if (!driverIds[assumption.driverId]) addError(errors, "C010-CONFIG-REFERENCE", "config", null, assumption.driverId, "scenario assumption references an unknown driver", "configured driverId");
                assumed[assumption.driverId] = true;
            });
            definition.drivers.forEach(function (driver) {
                if (!assumed[driver.driverId]) addError(errors, "C010-CONFIG-SCHEMA", "config", null, ref, "scenario is missing an assumption for driver " + driver.driverId, "one assumption per model driver");
            });
        });
    }

    // SCN-010-028: a peer statistic admits only comparable observations; qualified/excluded rows, missing members, and
    // outliers stay visible with their exact reasons and a missing member is NEVER represented as a zero.
    function selectPeersView(request) {
        if (!isPlainObject(request) || !isPlainObject(request.peerSet) || !isPlainObject(request.statistic) || !Array.isArray(request.observations)) throw contractException("C010-PUBLICATION-SCHEMA", "peers view requires a peer set, a statistic, and an observation list");
        var peerSet = request.peerSet;
        if (!isId(peerSet.peerSetId) || !isId(peerSet.subjectCompanyId) || !uniqueStrings(peerSet.companyIds, false) || peerSet.companyIds.length === 0) throw contractException("C010-PUBLICATION-SCHEMA", "peer set requires an id, a subject company, and a non-empty unique member set");
        var statistic = request.statistic;
        if (!isBoundedString(statistic.concept, false) || ["median", "mean", "min", "max"].indexOf(statistic.operation) === -1) throw contractException("C010-PUBLICATION-SCHEMA", "peer statistic requires a concept and one of median, mean, min, or max");
        var seenCompany = Object.create(null);
        var comparable = [];
        var qualified = [];
        var excluded = [];
        var outliers = [];
        request.observations.forEach(function (observation) {
            if (!isPlainObject(observation) || !isId(observation.companyId) || ["comparable", "qualified", "excluded"].indexOf(observation.eligibility) === -1 || !isBoundedString(observation.reason, false)) throw contractException("C010-PUBLICATION-SCHEMA", "each peer observation requires a company, an eligibility, and an exact reason");
            var normalizedValue = observation.value === undefined ? null : observation.value;
            if (normalizedValue !== null && (typeof normalizedValue !== "string" || !parseFiniteDecimal(normalizedValue).ok)) throw contractException("C010-INTEGRITY-NONFINITE", "a peer observation value must be a finite decimal string or null");
            if (seenCompany[observation.companyId]) throw contractException("C010-INTEGRITY-DUPLICATE", "a peer observation repeats a company: " + observation.companyId);
            seenCompany[observation.companyId] = true;
            var record = { companyId: observation.companyId, value: normalizedValue, eligibility: observation.eligibility, reason: observation.reason, outlier: observation.outlier === true };
            if (record.outlier) outliers.push(clone(record));
            if (observation.eligibility === "comparable") comparable.push(clone(record));
            else if (observation.eligibility === "qualified") qualified.push(clone(record));
            else excluded.push(clone(record));
        });
        // Only comparable observations that carry a finite value enter the named statistic and the sample size.
        var statisticInputs = comparable.filter(function (record) { return record.value !== null; });
        var orderedInputs = statisticInputs.map(function (record) { return { companyId: record.companyId, value: record.value, numeric: parseFiniteDecimal(record.value).value }; }).sort(function (a, b) { return a.numeric - b.numeric; });
        var statisticValue = null;
        if (orderedInputs.length > 0) {
            if (statistic.operation === "min") statisticValue = orderedInputs[0].value;
            else if (statistic.operation === "max") statisticValue = orderedInputs[orderedInputs.length - 1].value;
            else if (statistic.operation === "median") statisticValue = orderedInputs[(orderedInputs.length - 1) >> 1].value;
            else statisticValue = String(orderedInputs.reduce(function (sum, entry) { return sum + entry.numeric; }, 0) / orderedInputs.length);
        }
        // A declared member with no observation at all is missing — never a zero-filled data point.
        var missing = peerSet.companyIds.filter(function (companyId) { return !seenCompany[companyId]; });
        return deepFreeze({
            contractVersion: "company-peers-view/v1",
            peerSetId: peerSet.peerSetId,
            subjectCompanyId: peerSet.subjectCompanyId,
            purpose: peerSet.purpose !== undefined ? peerSet.purpose : null,
            statistic: {
                concept: statistic.concept,
                operation: statistic.operation,
                unit: statistic.unit !== undefined ? statistic.unit : null,
                value: statisticValue,
                sampleSize: orderedInputs.length,
                memberCompanyIds: orderedInputs.map(function (entry) { return entry.companyId; })
            },
            comparable: comparable,
            qualified: qualified,
            excluded: excluded,
            missing: missing,
            outliers: outliers
        });
    }

    // SCN-010-002 / SCN-010-003 (Scope 7): the archetype-aware resilience overlay.
    // Every resilience check is resolved against the accepted archetype's own
    // diagnostic-policy applicability BEFORE any number is produced. An applicable
    // check runs the shared evaluateDiagnostic, so the raw formula renders first
    // from the reported observations and any lease or treasury-stock effect is
    // named beside it with exact refs and NO pass/fail value. A check the archetype
    // marks inapplicable (an ordinary industrial liabilities/equity or
    // net-debt/EBITDA heuristic under the financial-institution policy) is recorded
    // inapplicable WITH the deciding policy id and NEVER produces an industrial
    // weakness rank. Archetype-specific source-qualified facts (restaurant lease
    // context, or bank deposits/credit/liquidity/CET1/preferred capital) stay
    // available without being forced through an inapplicable heuristic.
    var INAPPLICABLE_APPLICABILITY = toSet(["inapplicable", "inapplicable-financial-institution", "not-applicable", "never"]);
    function selectResilienceView(request) {
        if (!isPlainObject(request) || !isPlainObject(request.archetypeView) || request.archetypeView.contractVersion !== "company-archetype-view/v1" || !isId(request.subjectCompanyId) || !Array.isArray(request.checks)) {
            throw contractException("C010-PUBLICATION-SCHEMA", "resilience view requires an archetype view, a subject company, and a check list");
        }
        var archetypeView = request.archetypeView;
        var accepted = archetypeView.status === "accepted" && isPlainObject(archetypeView.definition);
        // Applicability is decided ONLY by the accepted archetype's own diagnostic policies; an unclassified company runs no archetype heuristic.
        var policyById = Object.create(null);
        var policyByConcept = Object.create(null);
        if (accepted && Array.isArray(archetypeView.definition.diagnosticPolicies)) {
            archetypeView.definition.diagnosticPolicies.forEach(function (policy) {
                if (policy && isId(policy.policyId)) policyById[policy.policyId] = policy;
                if (policy && isBoundedString(policy.concept, false)) policyByConcept[policy.concept] = policy;
            });
        }
        var seenCheck = Object.create(null);
        var checks = request.checks.map(function (check) {
            if (!isPlainObject(check) || !isId(check.checkId) || !isId(check.policyId) || !isBoundedString(check.policyVersion, false) || !isBoundedString(check.concept, false) || !isPlainObject(check.raw)) {
                throw contractException("C010-PUBLICATION-SCHEMA", "each resilience check requires a checkId, policyId, policyVersion, concept, and raw record");
            }
            if (seenCheck[check.checkId]) throw contractException("C010-INTEGRITY-DUPLICATE", "a resilience check repeats a checkId: " + check.checkId);
            seenCheck[check.checkId] = true;
            var policy = policyById[check.policyId] || policyByConcept[check.concept] || null;
            var applicable = !(policy && INAPPLICABLE_APPLICABILITY[policy.applicability]);
            if (!applicable) {
                // The ordinary industrial heuristic is inapplicable for this archetype: keep the deciding policy id, never run the diagnostic, and never rank the company as industrially weak.
                return deepFreeze({
                    checkId: check.checkId,
                    policyId: policy.policyId,
                    policyVersion: policy.policyVersion,
                    concept: check.concept,
                    applicability: "inapplicable",
                    inapplicableReason: isBoundedString(check.inapplicableReason, false) ? check.inapplicableReason : "The " + archetypeView.primaryArchetypeId + " archetype marks the ordinary " + check.concept + " heuristic inapplicable under policy " + policy.policyId + ".",
                    decidingPolicyId: policy.policyId,
                    decidingArchetypeId: archetypeView.primaryArchetypeId,
                    diagnostic: null,
                    weaknessRank: null
                });
            }
            // Applicable: the shared diagnostic renders the raw formula first from the reported observations, then names any lease/treasury context beside it with refs and no pass/fail value.
            var diagnostic = evaluateDiagnostic({
                checkId: check.checkId,
                policyId: check.policyId,
                policyVersion: check.policyVersion,
                concept: check.concept,
                periodId: check.periodId,
                raw: check.raw,
                contextualAdjustment: check.contextualAdjustment !== undefined ? check.contextualAdjustment : null,
                interpretationMode: check.interpretationMode !== undefined ? check.interpretationMode : null
            });
            return deepFreeze({
                checkId: check.checkId,
                policyId: check.policyId,
                policyVersion: check.policyVersion,
                concept: check.concept,
                applicability: "applicable",
                inapplicableReason: null,
                decidingPolicyId: policy ? policy.policyId : null,
                decidingArchetypeId: accepted ? archetypeView.primaryArchetypeId : null,
                diagnostic: diagnostic,
                weaknessRank: null
            });
        });
        var seenFact = Object.create(null);
        var archetypeFacts = (Array.isArray(request.archetypeFacts) ? request.archetypeFacts : []).map(function (fact) {
            if (!isPlainObject(fact) || !isId(fact.factId) || !isBoundedString(fact.concept, false) || !isBoundedString(fact.state, false)) {
                throw contractException("C010-PUBLICATION-SCHEMA", "each resilience archetype fact requires a factId, concept, and state");
            }
            if (seenFact[fact.factId]) throw contractException("C010-INTEGRITY-DUPLICATE", "a resilience archetype fact repeats a factId: " + fact.factId);
            seenFact[fact.factId] = true;
            var value = fact.value === undefined ? null : fact.value;
            if (value !== null && !isBoundedString(value, true)) throw contractException("C010-PUBLICATION-SCHEMA", "a resilience archetype fact value must be a bounded string or null");
            return {
                factId: fact.factId,
                concept: fact.concept,
                label: isBoundedString(fact.label, false) ? fact.label : fact.concept,
                value: value,
                unit: isBoundedString(fact.unit, true) ? fact.unit : null,
                state: fact.state,
                sourceRefs: allStrings(fact.sourceRefs, false) ? fact.sourceRefs.slice() : []
            };
        });
        return deepFreeze({
            contractVersion: "company-resilience-view/v1",
            subjectCompanyId: request.subjectCompanyId,
            archetypeStatus: archetypeView.status,
            archetypeId: accepted ? archetypeView.primaryArchetypeId : null,
            checks: checks,
            archetypeFacts: archetypeFacts,
            // A financial-institution overlay whose ordinary heuristics are inapplicable never yields an industrial weakness rank.
            industrialWeaknessRank: null,
            industrialRankProduced: false
        });
    }

    // SCN-010-015: an accepted-state export is a pure projection of the already-accepted generation. It never refetches,
    // never carries a local scenario draft, and never carries a credential — only published, source-qualified content leaves the tool.
    function buildAcceptedExport(accepted) {
        if (!isPlainObject(accepted) || accepted.contractVersion !== "company-accepted-state/v1") throw contractException("C010-PUBLICATION-SCHEMA", "accepted export requires accepted publication state");
        var ownerRead = isPlainObject(accepted.ownerRead) ? accepted.ownerRead : {};
        return deepFreeze({
            contractVersion: "company-accepted-export/v1",
            companyId: accepted.companyId,
            publicationId: accepted.publicationId,
            generation: accepted.generation,
            manifestSha256: accepted.manifestSha256,
            view: {
                identity: clone(accepted.identity),
                summary: clone(accepted.summary),
                evidenceCoverage: clone(accepted.evidenceCoverage),
                claims: clone(accepted.claims),
                dependencyResults: clone(accepted.dependencyResults),
                periods: clone(accepted.periods),
                restatements: clone(accepted.restatements),
                conflicts: clone(accepted.conflicts),
                unavailableLinks: clone(accepted.unavailableLinks),
                limitations: clone(ownerRead.limitations || []),
                brief: accepted.brief ? clone(accepted.brief) : null,
                clocks: {
                    statementCutoff: ownerRead.statementCutoff !== undefined ? ownerRead.statementCutoff : null,
                    modelCutoff: ownerRead.modelCutoff !== undefined ? ownerRead.modelCutoff : null,
                    briefCutoff: ownerRead.briefCutoff !== undefined ? ownerRead.briefCutoff : null,
                    marketCutoff: ownerRead.marketCutoff !== undefined ? ownerRead.marketCutoff : null
                },
                modelPack: accepted.modelPack ? {
                    modelPackId: accepted.modelPack.modelPackId,
                    modelDefinitionId: accepted.modelPack.modelDefinition.modelDefinitionId,
                    acceptedScenarioRevisionId: accepted.modelPack.acceptedScenario.scenarioRevisionId,
                    baselineOutputs: clone(accepted.modelPack.baselineOutputs)
                } : null
            },
            containsPrivateData: false
        });
    }

    function validateBriefRankingPolicy(policy) {
        var scoreKeys = ["sourceQuality", "companyMateriality", "modelSensitivity", "novelty", "eventProximity", "unresolvedRisk"];
        var dispositionKeys = ["material", "conflict", "confirmation", "immaterial", "duplicate", "not-evaluable"];
        if (!isPlainObject(policy) || !hasExactKeys(policy, ["policyVersion", "weights", "dispositionMultipliers"]) || policy.policyVersion !== "company-brief-ranking/v1" || !isPlainObject(policy.weights) || !hasExactKeys(policy.weights, scoreKeys) || !isPlainObject(policy.dispositionMultipliers) || !hasExactKeys(policy.dispositionMultipliers, dispositionKeys)) throw contractException("C010-BRIEF-SCHEMA", "brief ranking requires an explicit company-brief-ranking/v1 policy");
        scoreKeys.concat(dispositionKeys.map(function (key) { return "disposition:" + key; })).forEach(function (key) {
            var value = key.indexOf("disposition:") === 0 ? policy.dispositionMultipliers[key.slice(12)] : policy.weights[key];
            if (!Number.isFinite(value) || value < 0) throw contractException("C010-BRIEF-SCHEMA", "brief ranking weights and multipliers must be finite non-negative numbers");
        });
        return scoreKeys;
    }

    function validateEvidenceChange(change, scoreKeys) {
        var keys = ["contractVersion", "changeId", "evidenceClass", "disposition", "sourceRef", "periodOrWindow", "observed", "companyMechanism", "affectedClaimIds", "affectedDriverIds", "scoreInputs", "numericSupport", "evidenceNeeded", "duplicateOf"];
        if (!isPlainObject(change) || !hasExactKeys(change, keys) || change.contractVersion !== "evidence-change/v1" || !isId(change.changeId) || EVIDENCE_CLASSES.indexOf(change.evidenceClass) === -1 || ["material", "conflict", "confirmation", "immaterial", "duplicate", "not-evaluable"].indexOf(change.disposition) === -1 || !isId(change.sourceRef) || !isBoundedString(change.periodOrWindow, false) || !isBoundedString(change.observed, false) || (change.companyMechanism !== null && !isBoundedString(change.companyMechanism, false)) || !uniqueStrings(change.affectedClaimIds, true) || !uniqueStrings(change.affectedDriverIds, true) || !uniqueStrings(change.evidenceNeeded, true) || (change.duplicateOf !== null && !isId(change.duplicateOf)) || !isPlainObject(change.scoreInputs) || !hasExactKeys(change.scoreInputs, scoreKeys)) throw contractException("C010-BRIEF-SCHEMA", "evidence changes require explicit identity, class, disposition, source, clock, mechanism, affected refs, ranking inputs, and evidence needs");
        scoreKeys.forEach(function (key) {
            if (!Number.isInteger(change.scoreInputs[key]) || change.scoreInputs[key] < 0 || change.scoreInputs[key] > 5) throw contractException("C010-BRIEF-SCHEMA", "evidence ranking inputs must be integers from zero through five");
        });
        if (change.numericSupport !== null) {
            if (!isPlainObject(change.numericSupport) || !hasExactKeys(change.numericSupport, ["assumptionId", "direction", "range", "rationale", "confidence", "invalidation"]) || !isId(change.numericSupport.assumptionId) || ["increase", "decrease", "review"].indexOf(change.numericSupport.direction) === -1 || !isPlainObject(change.numericSupport.range) || !hasExactKeys(change.numericSupport.range, ["low", "high"]) || !parseFiniteDecimal(change.numericSupport.range.low).ok || !parseFiniteDecimal(change.numericSupport.range.high).ok || !isBoundedString(change.numericSupport.rationale, false) || !isBoundedString(change.numericSupport.confidence, false) || !isBoundedString(change.numericSupport.invalidation, false)) throw contractException("C010-BRIEF-SCHEMA", "numeric support requires an assumption, direction, finite range, rationale, confidence, and invalidation");
        }
    }

    // SCN-010-017/021/022: the rank is a deterministic policy result. Repeated headlines never add a component,
    // and macro/market/news/sentiment without an evidenced company mechanism remain context-only.
    function rankEvidenceChanges(request) {
        if (!isPlainObject(request) || !hasExactKeys(request, ["policy", "changes"]) || !Array.isArray(request.changes)) throw contractException("C010-BRIEF-SCHEMA", "rankEvidenceChanges requires an explicit policy and changes array");
        var scoreKeys = validateBriefRankingPolicy(request.policy);
        var seenIds = Object.create(null);
        var ranked = request.changes.map(function (sourceChange) {
            validateEvidenceChange(sourceChange, scoreKeys);
            if (seenIds[sourceChange.changeId]) throw contractException("C010-INTEGRITY-DUPLICATE", "duplicate evidence change id: " + sourceChange.changeId);
            seenIds[sourceChange.changeId] = true;
            var change = clone(sourceChange);
            var contextClass = ["market-observation", "news", "sentiment"].indexOf(change.evidenceClass) !== -1;
            var hasMechanism = isBoundedString(change.companyMechanism, false) && (change.affectedClaimIds.length > 0 || change.affectedDriverIds.length > 0);
            var eligibility = contextClass && !hasMechanism ? "context-only" : "company-mechanism";
            var components = {};
            var baseScore = 0;
            scoreKeys.forEach(function (key) {
                components[key] = request.policy.weights[key] * change.scoreInputs[key];
                baseScore += components[key];
            });
            var multiplier = request.policy.dispositionMultipliers[change.disposition];
            var score = eligibility === "context-only" || change.duplicateOf !== null ? 0 : baseScore * multiplier;
            return Object.assign(change, { eligibility: eligibility, components: components, score: score });
        });
        var classPriority = EVIDENCE_CLASSES.reduce(function (result, evidenceClass, index) { result[evidenceClass] = index; return result; }, Object.create(null));
        ranked.sort(function (left, right) {
            if (right.score !== left.score) return right.score - left.score;
            if (classPriority[left.evidenceClass] !== classPriority[right.evidenceClass]) return classPriority[left.evidenceClass] - classPriority[right.evidenceClass];
            return left.changeId < right.changeId ? -1 : left.changeId > right.changeId ? 1 : 0;
        });
        return deepFreeze({ contractVersion: "company-evidence-ranking/v1", policyVersion: request.policy.policyVersion, ranked: ranked });
    }

    function coverageStatus(coverage) {
        if (coverage.some(function (entry) { return entry.state === "conflicted"; })) return "conflicted";
        if (coverage.some(function (entry) { return entry.state === "stale"; })) return "stale";
        if (coverage.some(function (entry) { return entry.state === "partial"; })) return "partial";
        if (coverage.every(function (entry) { return entry.state === "unavailable"; })) return "unavailable";
        if (coverage.some(function (entry) { return entry.state === "unavailable"; })) return "partial";
        return null;
    }

    function validateBriefCoverage(coverage) {
        if (!Array.isArray(coverage) || coverage.length === 0) throw contractException("C010-BRIEF-SCHEMA", "adaptive brief requires explicit per-class coverage");
        var seen = Object.create(null);
        coverage.forEach(function (entry) {
            if (!isPlainObject(entry) || !hasExactKeys(entry, ["evidenceClass", "state", "cutoff", "requiredUpdate"]) || EVIDENCE_CLASSES.indexOf(entry.evidenceClass) === -1 || ["current", "partial", "stale", "conflicted", "unavailable"].indexOf(entry.state) === -1 || (entry.cutoff !== null && !isBoundedString(entry.cutoff, false)) || (entry.requiredUpdate !== null && !isBoundedString(entry.requiredUpdate, false))) throw contractException("C010-BRIEF-SCHEMA", "brief coverage requires class, state, cutoff, and required update");
            if (seen[entry.evidenceClass]) throw contractException("C010-INTEGRITY-DUPLICATE", "duplicate brief coverage class: " + entry.evidenceClass);
            seen[entry.evidenceClass] = true;
        });
        return seen;
    }

    // SCN-010-017..024/031: build one bounded brief over the immutable accepted state. Narrative classes can create
    // watch context, but only current, mechanism-linked, numerically supported non-news/non-sentiment evidence can
    // produce a model-impact proposal. No branch mutates accepted facts, assumptions, archetype, or revision.
    function buildAdaptiveCompanyBrief(request) {
        var keys = ["contractVersion", "companyId", "archetypeId", "priorBrief", "acceptedState", "clocks", "coverage", "changes", "rankingPolicy"];
        if (!isPlainObject(request) || !hasExactKeys(request, keys) || request.contractVersion !== "adaptive-company-brief-request/v1" || !isId(request.companyId) || !isId(request.archetypeId) || (request.priorBrief !== null && !isPlainObject(request.priorBrief)) || !isPlainObject(request.acceptedState) || !isPlainObject(request.clocks) || !hasExactKeys(request.clocks, ["statementCutoff", "modelCutoff", "briefCutoff", "marketCutoff", "retrievalCutoff"]) || !Array.isArray(request.changes)) throw contractException("C010-BRIEF-SCHEMA", "adaptive brief requires explicit company, archetype, nullable prior brief, accepted state, five clocks, coverage, changes, and ranking policy");
        if (request.acceptedState.contractVersion !== "company-brief-accepted-state/v1" || request.acceptedState.companyId !== request.companyId || !isPlainObject(request.acceptedState.archetype) || request.acceptedState.archetype.primaryArchetypeId !== request.archetypeId || !isId(request.acceptedState.scenarioRevisionId) || !Array.isArray(request.acceptedState.facts) || !Array.isArray(request.acceptedState.assumptions) || !isPlainObject(request.acceptedState.fundamentalDirection)) throw contractException("C010-BRIEF-SCHEMA", "adaptive brief accepted state must match the requested company and archetype and carry facts, assumptions, revision, and direction");
        Object.keys(request.clocks).forEach(function (key) {
            if (request.clocks[key] !== null && !isBoundedString(request.clocks[key], false)) throw contractException("C010-BRIEF-SCHEMA", "adaptive brief clocks must be explicit strings or null");
        });
        var coverageClasses = validateBriefCoverage(request.coverage);
        request.changes.forEach(function (change) {
            if (!coverageClasses[change.evidenceClass]) throw contractException("C010-BRIEF-SCHEMA", "adaptive brief coverage is missing evidence class " + change.evidenceClass);
        });
        var acceptedState = clone(request.acceptedState);
        var acceptedStateBytes = JSON.stringify(acceptedState);
        var ranking = rankEvidenceChanges({ policy: request.rankingPolicy, changes: request.changes });
        var coverageByClass = request.coverage.reduce(function (result, entry) { result[entry.evidenceClass] = entry; return result; }, Object.create(null));
        var materialChanges = ranking.ranked.filter(function (change) {
            return change.disposition === "material" && change.eligibility === "company-mechanism" && coverageByClass[change.evidenceClass].state === "current";
        });
        var reportedFacts = materialChanges.filter(function (change) { return change.evidenceClass === "reported"; }).map(function (change) {
            return { changeId: change.changeId, evidenceClass: change.evidenceClass, sourceRef: change.sourceRef, periodOrWindow: change.periodOrWindow, observed: change.observed };
        });
        var modelImpactProposals = materialChanges.filter(function (change) {
            return change.numericSupport !== null && ["news", "sentiment"].indexOf(change.evidenceClass) === -1;
        }).map(function (change) {
            return {
                contractVersion: "company-model-impact-proposal/v1",
                proposalId: "proposal-" + change.changeId,
                changeId: change.changeId,
                affectedAssumptionId: change.numericSupport.assumptionId,
                affectedDriverIds: clone(change.affectedDriverIds),
                direction: change.numericSupport.direction,
                range: clone(change.numericSupport.range),
                rationale: change.numericSupport.rationale,
                confidence: change.numericSupport.confidence,
                supportingEvidenceRefs: [change.sourceRef],
                conflictingEvidenceRefs: [],
                invalidation: change.numericSupport.invalidation,
                decisionState: "pending"
            };
        });
        var watchConditions = ranking.ranked.filter(function (change) {
            return ["management-claim", "news", "sentiment"].indexOf(change.evidenceClass) !== -1 || change.disposition === "conflict" || change.disposition === "not-evaluable";
        }).map(function (change) {
            return { changeId: change.changeId, evidenceClass: change.evidenceClass, sourceRef: change.sourceRef, periodOrWindow: change.periodOrWindow, mechanism: change.companyMechanism, evidenceNeeded: clone(change.evidenceNeeded) };
        });
        var degraded = coverageStatus(request.coverage);
        var status = degraded || (materialChanges.length ? "material-update" : "unchanged");
        if (degraded) {
            materialChanges = materialChanges.filter(function (change) { return coverageByClass[change.evidenceClass].state === "current"; });
            modelImpactProposals = modelImpactProposals.filter(function (proposal) {
                var change = materialChanges.filter(function (candidate) { return candidate.changeId === proposal.changeId; })[0];
                return !!change;
            });
        }
        if (status === "stale") {
            var staleClasses = request.coverage.filter(function (entry) { return entry.state === "stale"; }).map(function (entry) { return entry.evidenceClass; });
            materialChanges = materialChanges.filter(function (change) { return staleClasses.indexOf(change.evidenceClass) === -1; });
            modelImpactProposals = modelImpactProposals.filter(function (proposal) {
                return materialChanges.some(function (change) { return change.changeId === proposal.changeId; });
            });
        }
        var conflictPresent = ranking.ranked.some(function (change) { return change.disposition === "conflict"; });
        var confidenceBand = degraded || conflictPresent ? "constrained" : "bounded";
        var limitations = request.coverage.filter(function (entry) { return entry.state !== "current"; }).map(function (entry) {
            return entry.evidenceClass + " is " + entry.state + " through " + (entry.cutoff || "an unavailable cutoff") + (entry.requiredUpdate ? "; required update: " + entry.requiredUpdate : "");
        });
        ranking.ranked.forEach(function (change) {
            change.evidenceNeeded.forEach(function (need) { if (limitations.indexOf(need) === -1) limitations.push(need); });
        });
        var noChangeRationale = status === "unchanged" ? "Reviewed eligible evidence produced no thesis or model change; duplicate, confirmation, and immaterial items remain recorded without narrative churn." : null;
        var semantic = {
            companyId: request.companyId,
            archetypeId: request.archetypeId,
            priorBriefId: request.priorBrief ? request.priorBrief.briefId : null,
            acceptedStateFingerprint: "sha256:" + sha256Hex(acceptedStateBytes),
            statementCutoff: request.clocks.statementCutoff,
            modelCutoff: request.clocks.modelCutoff,
            marketCutoff: request.clocks.marketCutoff,
            status: status,
            coverage: request.coverage,
            reviewedEvidence: ranking.ranked.map(function (change) { return { changeId: change.changeId, disposition: change.disposition, score: change.score }; }),
            materialChangeIds: materialChanges.map(function (change) { return change.changeId; }),
            proposalIds: modelImpactProposals.map(function (proposal) { return proposal.proposalId; }),
            noChangeRationale: noChangeRationale
        };
        var contentFingerprint = companyObjectSha256(semantic);
        var brief = {
            contractVersion: "adaptive-company-brief/v1",
            briefId: "brief-" + request.companyId + "-" + contentFingerprint.slice(7, 19),
            companyId: request.companyId,
            archetypeId: acceptedState.archetype.primaryArchetypeId,
            acceptedScenarioRevisionId: acceptedState.scenarioRevisionId,
            acceptedStateFingerprint: "sha256:" + sha256Hex(acceptedStateBytes),
            priorBriefId: request.priorBrief ? request.priorBrief.briefId : null,
            status: status,
            clocks: clone(request.clocks),
            coverage: clone(request.coverage),
            fundamentalDirection: clone(acceptedState.fundamentalDirection),
            thesisClaims: clone(request.priorBrief ? (request.priorBrief.thesisClaims || []) : []),
            reviewedEvidence: clone(ranking.ranked),
            materialChanges: clone(materialChanges),
            reportedFacts: reportedFacts,
            modelImpactProposals: clone(modelImpactProposals),
            watchConditions: watchConditions,
            confidenceBand: confidenceBand,
            limitations: limitations,
            noChangeRationale: noChangeRationale,
            recommendationEligibility: { eligible: false, reason: "Educational company research only; no recommendation or execution instruction is produced." },
            contentFingerprint: contentFingerprint
        };
        return deepFreeze(brief);
    }

    function selectBriefView(brief) {
        if (!isPlainObject(brief) || brief.contractVersion !== "adaptive-company-brief/v1" || !Array.isArray(brief.reviewedEvidence)) throw contractException("C010-BRIEF-SCHEMA", "brief view requires a validated adaptive company brief");
        var evidenceClasses = [];
        var evidence = brief.reviewedEvidence.map(function (change) {
            if (evidenceClasses.indexOf(change.evidenceClass) === -1) evidenceClasses.push(change.evidenceClass);
            return { changeId: change.changeId, evidenceClass: change.evidenceClass, sourceRef: change.sourceRef, periodOrWindow: change.periodOrWindow, observed: change.observed, disposition: change.disposition };
        });
        return deepFreeze({
            contractVersion: "company-brief-view/v1",
            briefId: brief.briefId,
            status: brief.status,
            clocks: clone(brief.clocks),
            evidenceClasses: evidenceClasses,
            evidence: evidence,
            fundamentalDirection: clone(brief.fundamentalDirection),
            confidenceBand: brief.confidenceBand,
            materialChanges: clone(brief.materialChanges),
            modelImpactProposals: clone(brief.modelImpactProposals),
            coverage: clone(brief.coverage),
            limitations: clone(brief.limitations)
        });
    }

    function appendAdaptiveBriefHistory(request) {
        if (!isPlainObject(request) || !hasExactKeys(request, ["history", "brief"]) || !Array.isArray(request.history) || !isPlainObject(request.brief) || request.brief.contractVersion !== "adaptive-company-brief/v1") throw contractException("C010-BRIEF-SCHEMA", "appendAdaptiveBriefHistory requires a history array and validated brief");
        var history = clone(request.history);
        history.forEach(function (event) {
            if (!isPlainObject(event) || event.contractVersion !== "company-brief-history-event/v1" || !isBoundedString(event.contentFingerprint, false)) throw contractException("C010-BRIEF-SCHEMA", "brief history contains an invalid event");
        });
        if (history.some(function (event) { return event.contentFingerprint === request.brief.contentFingerprint; })) return deepFreeze({ contractVersion: "company-brief-history-append/v1", history: history, appended: false, reason: "duplicate-semantic-content" });
        history.push({
            contractVersion: "company-brief-history-event/v1",
            briefId: request.brief.briefId,
            companyId: request.brief.companyId,
            status: request.brief.status,
            priorBriefId: request.brief.priorBriefId,
            contentFingerprint: request.brief.contentFingerprint,
            clocks: clone(request.brief.clocks),
            reviewedEvidenceIds: request.brief.reviewedEvidence.map(function (change) { return change.changeId; }),
            materialChangeIds: request.brief.materialChanges.map(function (change) { return change.changeId; }),
            proposalIds: request.brief.modelImpactProposals.map(function (proposal) { return proposal.proposalId; })
        });
        return deepFreeze({ contractVersion: "company-brief-history-append/v1", history: history, appended: true, reason: "new-semantic-content" });
    }

    // SCN-010-015 / FR-010-093..097: the committed FundamentalsToolRead/v1 is a deterministic projection of the accepted
    // generation. Its semantic content (status, direction, missing facts, statement clock, limitations) is derived from
    // the non-owner-read parts of the accepted state, so a recompute rejects any drift in the committed owner read.
    function buildFundamentalsToolRead(request) {
        if (!isPlainObject(request) || !isPlainObject(request.accepted) || request.accepted.contractVersion !== "company-accepted-state/v1" || !isId(request.readId)) throw contractException("C010-PUBLICATION-SCHEMA", "fundamentals tool read requires accepted state and a read id");
        var accepted = request.accepted;
        var direction = (accepted.dependencyResults || []).filter(function (result) { return result.id === "metric-direction"; })[0] || null;
        var available = !!(direction && direction.state === "available");
        var missingFactIds = direction && Array.isArray(direction.missingFactIds) ? direction.missingFactIds.slice() : [];
        var statementCutoff = accepted.periods && accepted.periods.length ? accepted.periods[0].end : null;
        var brief = isPlainObject(accepted.brief) && accepted.brief.contractVersion === "adaptive-company-brief/v1" ? accepted.brief : null;
        var modelPack = isPlainObject(accepted.modelPack) && accepted.modelPack.contractVersion === "company-model-pack/v1" ? accepted.modelPack : null;
        var briefStatus = brief ? brief.status : null;
        var readStatus = briefStatus === "material-update" || briefStatus === "unchanged" ? "current" : (briefStatus || (available ? "current" : "unavailable"));
        var limitations = available
            ? ["A source-qualified direction is published from the accepted generation with all clocks and evidence classes."]
            : [
                "Exact SEC Submissions bytes provide identity and filing metadata only; no source-qualified financial statement observation is present.",
                "No recommendation or confident substitute is published."
            ];
        if (brief) brief.limitations.forEach(function (limitation) { if (limitations.indexOf(limitation) === -1) limitations.push(limitation); });
        var toolRead = {
            contractVersion: "fundamentals-tool-read/v1",
            readId: request.readId,
            publicationId: accepted.publicationId,
            generation: accepted.generation,
            companyId: accepted.companyId,
            status: readStatus,
            statementCutoff: statementCutoff,
            modelCutoff: modelPack ? modelPack.acceptedScenario.historicalCutoff : null,
            briefCutoff: brief ? brief.clocks.briefCutoff : null,
            marketCutoff: brief ? brief.clocks.marketCutoff : null,
            retrievalCutoff: brief ? brief.clocks.retrievalCutoff : null,
            direction: available ? String(direction.value) : "Unavailable",
            missingFactIds: missingFactIds,
            archetypeId: brief ? brief.archetypeId : null,
            briefStatus: briefStatus,
            coverage: brief ? clone(brief.coverage) : [],
            materialChanges: brief ? clone(brief.materialChanges) : [],
            modelImpactProposals: brief ? clone(brief.modelImpactProposals) : [],
            disagreements: brief ? brief.reviewedEvidence.filter(function (change) { return change.disposition === "conflict"; }).map(function (change) { return { changeId: change.changeId, evidenceClass: change.evidenceClass, sourceRef: change.sourceRef, periodOrWindow: change.periodOrWindow }; }) : [],
            sourceLinks: (accepted.sources || []).map(function (source) { return { sourceId: source.sourceId, url: source.url, rights: source.rights, clocks: clone(source.clocks) }; }),
            confidenceBand: brief ? brief.confidenceBand : "constrained",
            watchConditions: brief ? clone(brief.watchConditions) : [],
            invalidations: brief ? brief.modelImpactProposals.map(function (proposal) { return { proposalId: proposal.proposalId, invalidation: proposal.invalidation }; }) : [],
            recommendationEligibility: { eligible: false, reason: "Educational company research only; no recommendation or execution instruction is produced." },
            deepLinks: { company: "company-fundamentals-lab.html", brief: "company-fundamentals-lab.html?mode=detailed&tab=brief", sources: "company-fundamentals-lab.html?mode=detailed&tab=sources" },
            limitations: limitations
        };
        if (request.modelPackRef !== undefined && request.modelPackRef !== null) {
            var modelPackRefValidation = validateObjectRef(request.modelPackRef);
            if (!modelPackRefValidation.ok) throw contractException(modelPackRefValidation.errors[0].code, "fundamentals tool read model pack ref is invalid");
            toolRead.modelPackRef = clone(request.modelPackRef);
        }
        if (request.briefRef !== undefined && request.briefRef !== null) {
            var briefRefValidation = validateObjectRef(request.briefRef);
            if (!briefRefValidation.ok) throw contractException(briefRefValidation.errors[0].code, "fundamentals tool read brief ref is invalid");
            toolRead.briefRef = clone(request.briefRef);
        } else if (brief) {
            var derivedBriefSha256 = companyObjectSha256(brief);
            toolRead.briefRef = {
                contractVersion: "company-object-ref/v1",
                path: "data/company-fundamentals/objects/" + derivedBriefSha256.slice(7) + ".json",
                sha256: derivedBriefSha256,
                objectId: brief.briefId
            };
        }
        return deepFreeze(toolRead);
    }

    // SCN-010-007 (Scope 8): the cross-entity comparability boundary. A growth rate, aggregate statistic, or rank over
    // two or more bases is produced ONLY when every basis shares the reference basis's currency, fiscal calendar, and
    // unit (or an explicit conversion/alignment object bridges the difference). Whenever a basis differs in currency,
    // fiscal calendar, or unit and no reconciliation bridges it, the raw bases stay fully visible while the derived
    // growth, statistic, and rank are withheld as unavailable with the exact machine-readable reason — never silently
    // computed or coerced.
    var COMPARABILITY_OPERATION_SET = toSet(["growth", "statistic", "rank"]);
    var COMPARABILITY_STATISTIC_SET = toSet(["mean", "median", "min", "max", "sum"]);
    var COMPARABILITY_AXIS_REASON = { currency: "currency-mismatch", "fiscal-calendar": "fiscal-calendar-mismatch", unit: "unit-mismatch" };
    var COMPARABILITY_AXIS_ORDER = ["currency", "fiscal-calendar", "unit"];

    function comparabilityBasisShape(basis, index) {
        var keys = ["basisId", "companyId", "concept", "unit", "currency", "fiscalYearEnd", "periodId", "periodEnd", "value"];
        if (!isPlainObject(basis) || !hasExactKeys(basis, keys) || !isId(basis.basisId) || !isId(basis.companyId) || !isBoundedString(basis.concept, false) || !isBoundedString(basis.unit, false) || !/^[A-Z]{3}$/.test(String(basis.currency)) || !/^\d{2}-\d{2}$/.test(String(basis.fiscalYearEnd)) || !isBoundedString(basis.periodId, false) || !isBoundedString(String(basis.periodEnd), false) || (basis.value !== null && (!isBoundedString(basis.value, false) || !parseFiniteDecimal(basis.value).ok))) {
            throw contractException("C010-PUBLICATION-SCHEMA", "comparability basis " + index + " requires an id, company, concept, unit, ISO currency, fiscal-year-end, period, and a finite decimal value or null");
        }
        return {
            basisId: basis.basisId,
            companyId: basis.companyId,
            concept: basis.concept,
            unit: basis.unit,
            currency: basis.currency,
            fiscalYearEnd: basis.fiscalYearEnd,
            periodId: basis.periodId,
            periodEnd: String(basis.periodEnd),
            value: basis.value,
            valueState: basis.value === null ? "unavailable" : "reported"
        };
    }

    function evaluateComparability(request) {
        if (!isPlainObject(request) || !isBoundedString(request.concept, false) || !Array.isArray(request.operations) || request.operations.length === 0 || !Array.isArray(request.bases) || request.bases.length < 2) {
            throw contractException("C010-PUBLICATION-SCHEMA", "comparability requires a concept, a non-empty operations list, and at least two bases");
        }
        request.operations.forEach(function (operation) {
            if (!COMPARABILITY_OPERATION_SET[operation]) throw contractException("C010-PUBLICATION-SCHEMA", "unsupported comparability operation: " + operation);
        });
        var statisticOperation = "mean";
        if (request.statistic !== undefined && request.statistic !== null) {
            if (!isPlainObject(request.statistic) || !COMPARABILITY_STATISTIC_SET[request.statistic.operation]) throw contractException("C010-PUBLICATION-SCHEMA", "a comparability statistic requires one of mean, median, min, max, or sum");
            statisticOperation = request.statistic.operation;
        }
        // An explicit conversion/alignment object may bridge only the axes it names; absent one, an incompatible axis stands.
        var bridgedAxes = Object.create(null);
        var reconciliation = null;
        if (request.reconciliation !== undefined && request.reconciliation !== null) {
            if (!isPlainObject(request.reconciliation) || !Array.isArray(request.reconciliation.bridges) || request.reconciliation.bridges.length === 0) throw contractException("C010-PUBLICATION-SCHEMA", "a reconciliation requires an explicit non-empty list of bridged axes");
            request.reconciliation.bridges.forEach(function (axis) {
                if (!COMPARABILITY_AXIS_REASON[axis]) throw contractException("C010-PUBLICATION-SCHEMA", "a reconciliation may only bridge currency, fiscal-calendar, or unit: " + axis);
                bridgedAxes[axis] = true;
            });
            reconciliation = { bridges: request.reconciliation.bridges.slice(), note: isBoundedString(request.reconciliation.note, false) ? request.reconciliation.note : null };
        }
        var seenBasis = Object.create(null);
        var bases = request.bases.map(function (basis, index) {
            var shaped = comparabilityBasisShape(basis, index);
            if (seenBasis[shaped.basisId]) throw contractException("C010-INTEGRITY-DUPLICATE", "a comparability basis repeats an id: " + shaped.basisId);
            seenBasis[shaped.basisId] = true;
            return shaped;
        });
        var reference = bases[0];
        var reasonSet = Object.create(null);
        var incompatibilities = [];
        bases.slice(1).forEach(function (basis) {
            var mismatches = [];
            if (basis.currency !== reference.currency && !bridgedAxes.currency) mismatches.push("currency");
            if (basis.fiscalYearEnd !== reference.fiscalYearEnd && !bridgedAxes["fiscal-calendar"]) mismatches.push("fiscal-calendar");
            if (basis.unit !== reference.unit && !bridgedAxes.unit) mismatches.push("unit");
            if (mismatches.length) {
                mismatches.forEach(function (axis) { reasonSet[axis] = true; });
                incompatibilities.push({
                    basisId: basis.basisId,
                    companyId: basis.companyId,
                    mismatches: mismatches.slice(),
                    detail: "Basis " + basis.basisId + " differs from " + reference.basisId + " in " + mismatches.join(", ") + "; no explicit conversion or alignment object bridges it."
                });
            }
        });
        var reasonCodes = COMPARABILITY_AXIS_ORDER.filter(function (axis) { return reasonSet[axis]; }).map(function (axis) { return COMPARABILITY_AXIS_REASON[axis]; });
        var comparable = reasonCodes.length === 0;
        var reason = comparable ? null : "A cross-entity comparison over incompatible bases is withheld: " + reasonCodes.join(", ") + ". The raw values remain visible; growth, statistic, and rank stay unavailable until an explicit conversion or alignment object is provided.";
        function unavailableOperation() {
            return { state: "unavailable", value: null, reasonCodes: reasonCodes.slice(), reason: reason };
        }
        var valuedBases = bases.filter(function (basis) { return basis.value !== null; });
        var operations = {};
        request.operations.forEach(function (operation) {
            if (!comparable) { operations[operation] = unavailableOperation(); return; }
            if (operation === "growth") {
                if (bases.length !== 2 || bases[0].value === null || bases[1].value === null) {
                    operations.growth = { state: "unavailable", value: null, reasonCodes: ["insufficient-values"], reason: "Growth requires exactly two comparable bases that both carry a reported value." };
                    return;
                }
                var prior = parseFiniteDecimal(bases[0].value).value;
                var current = parseFiniteDecimal(bases[1].value).value;
                if (prior === 0) {
                    operations.growth = { state: "unavailable", value: null, reasonCodes: ["zero-base"], reason: "Growth is undefined when the prior comparable base is zero." };
                    return;
                }
                operations.growth = { state: "available", value: decimalString((current - prior) / prior), reasonCodes: [], reason: null };
            } else if (operation === "statistic") {
                if (valuedBases.length === 0) {
                    operations.statistic = { state: "unavailable", value: null, reasonCodes: ["insufficient-values"], reason: "The statistic requires at least one comparable base with a reported value." };
                    return;
                }
                var numbers = valuedBases.map(function (basis) { return parseFiniteDecimal(basis.value).value; });
                var ordered = numbers.slice().sort(function (a, b) { return a - b; });
                var statisticValue;
                if (statisticOperation === "min") statisticValue = ordered[0];
                else if (statisticOperation === "max") statisticValue = ordered[ordered.length - 1];
                else if (statisticOperation === "median") statisticValue = ordered[(ordered.length - 1) >> 1];
                else if (statisticOperation === "sum") statisticValue = numbers.reduce(function (sum, entry) { return sum + entry; }, 0);
                else statisticValue = numbers.reduce(function (sum, entry) { return sum + entry; }, 0) / numbers.length;
                operations.statistic = { state: "available", value: decimalString(statisticValue), operation: statisticOperation, sampleSize: valuedBases.length, memberCompanyIds: valuedBases.map(function (basis) { return basis.companyId; }), reasonCodes: [], reason: null };
            } else {
                if (valuedBases.length < 2) {
                    operations.rank = { state: "unavailable", value: null, reasonCodes: ["insufficient-values"], reason: "A rank requires at least two comparable bases with reported values." };
                    return;
                }
                var ranked = valuedBases.map(function (basis) { return { companyId: basis.companyId, basisId: basis.basisId, value: basis.value, numeric: parseFiniteDecimal(basis.value).value }; }).sort(function (a, b) { return b.numeric - a.numeric; }).map(function (entry, position) { return { companyId: entry.companyId, basisId: entry.basisId, value: entry.value, rank: position + 1 }; });
                operations.rank = { state: "available", value: ranked, reasonCodes: [], reason: null };
            }
        });
        return deepFreeze({
            contractVersion: "company-comparability/v1",
            concept: request.concept,
            operationsRequested: request.operations.slice(),
            bases: bases,
            comparable: comparable,
            incompatibilities: incompatibilities,
            reasonCodes: reasonCodes,
            reason: reason,
            reconciliation: reconciliation,
            operations: operations
        });
    }

    // SCN-010-032 (Scope 8): every data visual has an equivalent accessible table. buildAccessibleChartTable turns a
    // labeled value series (the same values a chart would plot) into a normalized table model — a caption, explicit
    // column headers, and exactly one row per series point. A point with no value renders as explicit text (a
    // caller-supplied note or "Unavailable"), never a blank cell or a color-only signal, so the table is fully
    // understandable non-visually and mirrors the chart values one to one.
    function buildAccessibleChartTable(request) {
        if (!isPlainObject(request) || !isBoundedString(request.caption, false) || !isBoundedString(request.categoryLabel, false) || !isBoundedString(request.valueLabel, false) || !Array.isArray(request.series) || request.series.length === 0) {
            throw contractException("C010-PUBLICATION-SCHEMA", "an accessible chart table requires a caption, a category label, a value label, and a non-empty series");
        }
        var unit = request.unit === undefined || request.unit === null ? null : (isBoundedString(request.unit, false) ? request.unit : null);
        var rows = request.series.map(function (point, index) {
            if (!isPlainObject(point) || !isBoundedString(point.label, false) || (point.value !== undefined && point.value !== null && (!isBoundedString(point.value, false) || !parseFiniteDecimal(point.value).ok))) {
                throw contractException("C010-PUBLICATION-SCHEMA", "accessible chart series point " + index + " requires a label and a finite decimal value or null");
            }
            var value = point.value === undefined ? null : point.value;
            var note = isBoundedString(point.note, false) ? point.note : null;
            var state = isBoundedString(point.state, false) ? point.state : (value === null ? "unavailable" : "available");
            var valueText = value === null ? (note || "Unavailable") : (unit ? value + " " + unit : value);
            return { label: point.label, value: value, valueText: valueText, state: state, note: note };
        });
        return deepFreeze({
            contractVersion: "company-accessible-table/v1",
            caption: request.caption,
            columns: [request.categoryLabel, request.valueLabel, "State"],
            unit: unit,
            rows: rows
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
        parseSecCompanyFactsResponse: parseSecCompanyFactsResponse,
        validateFactObservation: validateFactObservation,
        validateNormalizedFact: validateNormalizedFact,
        validateCompanyDossier: validateCompanyDossier,
        validatePublicationManifest: validatePublicationManifest,
        validatePublicationGraph: validatePublicationGraph,
        validateCompanyError: validateCompanyError,
        propagateDependencyStates: propagateDependencyStates,
        selectSourcesView: selectSourcesView,
        selectSimpleView: selectSimpleView,
        selectPeersView: selectPeersView,
        selectResilienceView: selectResilienceView,
        buildAcceptedExport: buildAcceptedExport,
        evaluateComparability: evaluateComparability,
        buildAccessibleChartTable: buildAccessibleChartTable,
        rankEvidenceChanges: rankEvidenceChanges,
        buildAdaptiveCompanyBrief: buildAdaptiveCompanyBrief,
        selectBriefView: selectBriefView,
        appendAdaptiveBriefHistory: appendAdaptiveBriefHistory,
        buildFundamentalsToolRead: buildFundamentalsToolRead,
        classifyReportingPeriod: classifyReportingPeriod,
        reconcileFactObservations: reconcileFactObservations,
        evaluateStatementIntegrity: evaluateStatementIntegrity,
        evaluateDerivedMetric: evaluateDerivedMetric,
        evaluateDiagnostic: evaluateDiagnostic,
        resolveArchetypeView: resolveArchetypeView,
        evaluateModel: evaluateModel,
        reduceScenarioDraft: reduceScenarioDraft,
        reduceCompanySelection: reduceCompanySelection,
        reduceProposalDecision: reduceProposalDecision,
        deriveForecastError: deriveForecastError,
        computeModelBaseline: computeModelBaseline,
        projectAcceptedPublication: projectAcceptedPublication,
        loadSameOriginJson: loadSameOriginJson,
        validateCompanyCurrentPointer: validateCompanyCurrentPointer,
        loadCompanyPublication: loadCompanyPublication
    });
})();