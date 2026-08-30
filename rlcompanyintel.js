/*
 * Company multi-horizon intelligence composition (RLCOMPANYINTEL).
 *
 * This module owns composition, coverage accounting and research accountability for one public
 * company. It owns NO dimension's math: every number it reports arrives from an adapter that read
 * exactly one source, and every claim it publishes cites a value that reached its own horizon.
 *
 * Three refusals carry the weight here.
 *
 * A horizon is composed from its OWN filtered, deep-frozen input set. A read that declares a
 * shorter maximum horizon is ABSENT from a longer horizon's argument, so a long-horizon composer
 * cannot reach it even by accident. A claim citing a value outside its own set raises
 * C025-HORIZON-ISOLATION rather than quietly widening the evidence.
 *
 * A published owner read is verified by reading it back. putToolRead falls through to a lossy
 * legacy store when the nine-key set drifts, silently dropping availability, computedAt and
 * freshUntil. Publishing without the round trip would therefore emit a read whose reader cannot
 * tell a current answer from a dropped one.
 *
 * An absent source is a NORMAL outcome, never an exception and never a zero. Every mandatory
 * dimension answers on every run with one of five explicit states, and an unavailable state
 * always carries a named reason from a closed vocabulary.
 *
 * Pure by construction: no DOM, no storage, no clock, no random source, no network. Every
 * composition function takes an explicit decisionTime, and the two functions that touch shared
 * state receive the data module as a parameter so a Node test can supply a stub.
 */
(function (factory) {
    "use strict";

    var api = Object.freeze(factory());
    if (typeof globalThis !== "undefined") globalThis.RLCOMPANYINTEL = api;
    if (typeof module === "object" && module && module.exports) module.exports = api;
})(function () {
    "use strict";

    /* Closed vocabularies. A value outside these sets is a contract error, never a default. */
    var EVIDENCE_STATES = ["current", "partial", "stale", "conflicted", "unavailable"];
    var HORIZON_RANKS = ["tactical", "event", "swing", "structural"];
    var HORIZON_IDS = ["immediate", "event", "swing", "structural"];
    var SOURCE_CLASSES = ["committed-file", "cache", "owner-read", "fixture", "none"];
    var PROVENANCE_CLASSES = ["observed", "derived", "proxy", "modelled"];
    var DIRECTIONS = ["constructive", "pressured", "flat", "none"];
    var EVIDENCE_QUALITIES = ["broad", "narrow", "thin", "absent"];
    var DATE_CLASSES = ["scheduled", "estimated", "occurred", "revised", "unavailable"];
    var DISPOSITIONS = ["changed", "confirmed", "no-change", "refused"];
    var STOPPED_BY = ["declared-limit", "question-answered", "no-source", "guardrail"];
    /* Whether the corpus behind a coverage account has answered at all. It is deliberately not
       an evidence state: a dimension's state describes what a resolved corpus contained, and
       this describes whether the corpus resolved. Collapsing the two is the defect BUG-018
       records. */
    var COVERAGE_READINESS_STATES = ["established", "not-established"];

    var REASON_CODES = [
        "no-shared-read", "no-owner", "no-source-wired", "no-source-exists",
        "symbol-not-covered", "company-not-in-corpus", "window-too-short",
        "source-not-published", "regime-not-published", "fixture-only-evidence",
        "read-company-mismatch", "market-scope-only", "proxy-only", "peer-set-missing",
        "read-aged-past-window", "sources-disagree"
    ];

    var ERROR_CODES = [
        "C025-IDENTITY-UNRESOLVED", "C025-CONFIG-VERSION", "C025-CONFIG-SCHEMA",
        "C025-REGISTRY-INCOMPLETE", "C025-READ-CONTRACT", "C025-READ-COMPANY-MISMATCH",
        "C025-HORIZON-ISOLATION", "C025-PLAN-SCHEMA", "C025-PLAN-BUDGET",
        "C025-PUBLISH-LOSSY", "C025-INPUT-REFUSED"
    ];

    /* The fifteen dimensions the coverage floor requires. A registry missing any one of them is
       incomplete, because a reader would then not be told that the dimension went unanswered. */
    var MANDATORY_DIMENSION_IDS = [
        "performance", "fundamentals", "valuation", "technicals", "cycles",
        "options-structure", "dealer-gamma", "options-flow", "volatility",
        "financial-events", "non-financial-events", "geopolitics", "market-regime",
        "sentiment", "company-risk"
    ];

    /* The six fields a discretionary research branch must record before it may be published. */
    var MANDATORY_BRANCH_FIELDS = ["question", "relevance", "consulted", "result", "disposition", "stopCondition"];

    /* putToolRead persists an rl-tool-read/v1 object only after an EXACT nine-key match. The list
       is frozen here and the published object is assembled from it, so key drift cannot occur. */
    var TOOL_READ_KEYS = ["asOf", "availability", "computedAt", "contractVersion", "deepLink", "freshUntil", "id", "metrics", "read"];

    var TOOL_ID = "company-intelligence-lab";
    var CONFIG_VERSION = "company-intelligence-config/v1";
    var FIXTURE_PATH_MARKER = "tests/fixtures/";

    /* A bare same-origin route file, the only shape an owner deep link may take. The pattern
       is deliberately NOT widened to admit a query string: a subject-carrying link is composed
       by ownerRouteFor from this validated file plus a percent-encoded value, so the one
       registry string that reaches an href never carries anything but [A-Za-z0-9._-] and .html.
       That keeps a scheme, an absolute URL, a protocol-relative //host and a traversing path
       unrepresentable at the source rather than merely filtered later. */
    var SAFE_OWNER_ROUTE = /^[A-Za-z0-9._-]+\.html$/;

    /* The query parameter name an owner route declares when it can actually open on a named
       company. A registry row that declares no such parameter links to the bare route, because
       a parameter the target ignores would be a link that silently does nothing. */
    var SAFE_SUBJECT_PARAM = /^[A-Za-z][A-Za-z0-9_]{0,31}$/;

    /* Why an owner route legitimately carries no company. A closed enum rather than free text
       on purpose: free text would put operator-authored wording on a rendering path and take it
       out of code review. `market-scoped` means the owner answers a market-wide question;
       `fixed-subject` means the owner does not model a company the reader can choose. */
    var OWNER_BARE_REASONS = ["market-scoped", "fixed-subject"];

    /* An operator entry naming a position, a size, a cost basis or a profit figure is refused
       outright. The tool holds tickers and nothing else, forever. */
    var POSITION_INPUT_PATTERNS = [
        /[$€£¥]\s*\d/,
        /\b\d[\d,]*(?:\.\d+)?\s*(?:usd|eur|gbp|dollars?|k|m|bn)\b/i,
        /\b(?:shares?|contracts?|units?|lots?)\b/i,
        /\b(?:position|size|sizing|qty|quantity|cost\s*basis|basis|p\s*\/?\s*l|pnl|profit|loss|gain|proceeds|holdings?|portfolio\s*value)\b/i,
        /\b(?:bought|sold|own)\s+\d/i
    ];

    function contains(values, value) {
        return Array.isArray(values) && values.indexOf(value) !== -1;
    }

    function isPlainObject(value) {
        return !!value && typeof value === "object" && !Array.isArray(value);
    }

    function isNonEmptyString(value) {
        return typeof value === "string" && value.length > 0;
    }

    function isIsoDate(value) {
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
            Number.isFinite(Date.parse(value + "T00:00:00.000Z"));
    }

    function isIsoInstant(value) {
        if (typeof value !== "string") return false;
        var epoch = Date.parse(value);
        return Number.isFinite(epoch) && new Date(epoch).toISOString() === value;
    }

    function deepFreeze(value) {
        if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
        Object.freeze(value);
        Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
        return value;
    }

    /* Canonical number formatting keeps Node and browser output byte-identical. */
    function decimalString(value, places) {
        if (!Number.isFinite(value)) return null;
        var factor = Math.pow(10, places);
        var rounded = Math.round(value * factor + (value >= 0 ? Number.EPSILON : -Number.EPSILON)) / factor;
        return rounded.toFixed(places);
    }

    function dayDifference(fromIsoDate, decisionTime) {
        if (!isIsoDate(fromIsoDate) || !isIsoInstant(decisionTime)) return null;
        var elapsed = Date.parse(decisionTime) - Date.parse(fromIsoDate + "T00:00:00.000Z");
        return Math.floor(elapsed / 86400000);
    }

    function isoDateOf(epochMs) {
        if (!Number.isFinite(epochMs)) return null;
        return new Date(epochMs).toISOString().slice(0, 10);
    }

    function sortBy(list, keyOf) {
        return list.slice().sort(function (left, right) {
            var a = keyOf(left);
            var b = keyOf(right);
            return a < b ? -1 : (a > b ? 1 : 0);
        });
    }

    function makeError(code, message, detail) {
        if (!contains(ERROR_CODES, code)) throw new Error("RLCOMPANYINTEL_UNKNOWN_ERROR_CODE:" + code);
        return deepFreeze({
            contractVersion: "company-intel-error/v1",
            code: code,
            message: message,
            detail: isNonEmptyString(detail) ? detail : null
        });
    }

    function raise(code, message, detail) {
        var record = makeError(code, message, detail);
        var error = new Error(code + ": " + message);
        error.code = code;
        error.record = record;
        throw error;
    }

    /* Canonicalization and content hashing belong to the shared contracts module. Resolving it
       lazily keeps this module importable under Node without a build step and without assuming a
       load order in the browser. */
    var contractsCache = null;
    function contracts() {
        if (contractsCache) return contractsCache;
        if (typeof globalThis !== "undefined" && globalThis.RLCONTRACTS) {
            contractsCache = globalThis.RLCONTRACTS;
            return contractsCache;
        }
        if (typeof require === "function") {
            contractsCache = require("./rlcontracts.js");
            return contractsCache;
        }
        throw new Error("RLCOMPANYINTEL_CONTRACTS_UNAVAILABLE");
    }

    function canonical(value, contractVersion) {
        return contracts().canonicalize(value, contractVersion);
    }

    function fingerprintOf(value, contractVersion) {
        return contracts().contentSha256(value, contractVersion);
    }

    /* ---------- subject resolution ---------- */

    function resolveSubject(identifier, sources) {
        var raw = typeof identifier === "string" ? identifier.trim() : "";
        var refusedInput = refuseInput(raw);
        if (refusedInput) return refusedInput;
        if (!/^[A-Za-z][A-Za-z0-9.\-]{0,9}$/.test(raw)) {
            return makeError("C025-IDENTITY-UNRESOLVED",
                "The entry is not a public company identifier this tool can resolve.",
                "entry: " + (raw.length > 0 ? raw.slice(0, 24) : "empty"));
        }
        var ticker = raw.toUpperCase();
        var registered = isPlainObject(sources) && Array.isArray(sources.secCompanies) ? sources.secCompanies : [];
        var matched = null;
        for (var index = 0; index < registered.length; index += 1) {
            var entry = registered[index];
            if (isPlainObject(entry) && isNonEmptyString(entry.ticker) && entry.ticker.toUpperCase() === ticker) {
                matched = entry;
                break;
            }
        }
        if (matched) {
            return deepFreeze({
                contractVersion: "company-subject/v1",
                subjectId: "company:" + ticker.toLowerCase(),
                ticker: ticker,
                cik: isNonEmptyString(matched.cik) ? matched.cik : null,
                displayName: isNonEmptyString(matched.displayName) ? matched.displayName : ticker,
                identityBasis: "sec-cik",
                resolvedAt: isIsoInstant(sources && sources.decisionTime) ? sources.decisionTime : null
            });
        }
        var covered = isPlainObject(sources) && Array.isArray(sources.barSymbols) ? sources.barSymbols : [];
        if (contains(covered.map(function (symbol) { return String(symbol).toUpperCase(); }), ticker)) {
            return deepFreeze({
                contractVersion: "company-subject/v1",
                subjectId: "company:" + ticker.toLowerCase(),
                ticker: ticker,
                cik: null,
                displayName: ticker,
                identityBasis: "committed-bars",
                resolvedAt: isIsoInstant(sources && sources.decisionTime) ? sources.decisionTime : null
            });
        }
        return makeError("C025-IDENTITY-UNRESOLVED",
            "No SEC identity and no committed price history resolve this identifier.",
            "ticker: " + ticker);
    }

    function refuseInput(rawInput) {
        var text = typeof rawInput === "string" ? rawInput : "";
        for (var index = 0; index < POSITION_INPUT_PATTERNS.length; index += 1) {
            if (POSITION_INPUT_PATTERNS[index].test(text)) {
                return makeError("C025-INPUT-REFUSED",
                    "This tool accepts a public company identifier only. Position, size, cost basis and profit values are refused and nothing is stored.",
                    "pattern index: " + index);
            }
        }
        return null;
    }

    /* ---------- coverage registry ---------- */

    function readCoverageRegistry(config) {
        if (!isPlainObject(config)) {
            raise("C025-CONFIG-SCHEMA", "The configuration is not an object.");
        }
        if (config.contractVersion !== CONFIG_VERSION) {
            raise("C025-CONFIG-VERSION", "The configuration declares an unexpected contract version.",
                "declared: " + String(config.contractVersion));
        }
        if (!Array.isArray(config.coverageRegistry) || config.coverageRegistry.length === 0) {
            raise("C025-CONFIG-SCHEMA", "The configuration declares no coverage registry.");
        }
        if (!Number.isInteger(config.maxBranches) || config.maxBranches < 1) {
            raise("C025-CONFIG-SCHEMA", "The configuration declares no positive branch budget.");
        }
        if (!Array.isArray(config.horizons) || config.horizons.length !== HORIZON_IDS.length) {
            raise("C025-CONFIG-SCHEMA", "The configuration must declare exactly four horizons.");
        }
        var rows = config.coverageRegistry.map(function (row, index) {
            if (!isPlainObject(row) || !isNonEmptyString(row.dimensionId) || !isNonEmptyString(row.label)) {
                raise("C025-CONFIG-SCHEMA", "Coverage registry row " + index + " declares no dimension identity.");
            }
            if (!contains(HORIZON_RANKS, row.maxHorizon)) {
                raise("C025-CONFIG-SCHEMA", "Coverage registry row " + index + " declares an unknown maximum horizon.",
                    "dimension: " + row.dimensionId);
            }
            if (!Number.isFinite(row.freshnessWindowDays) || row.freshnessWindowDays <= 0) {
                raise("C025-CONFIG-SCHEMA", "Coverage registry row " + index + " declares no positive freshness window.",
                    "dimension: " + row.dimensionId);
            }
            var ownerToolId = isNonEmptyString(row.ownerToolId) ? row.ownerToolId : null;
            var ownerDeepLink = isNonEmptyString(row.ownerDeepLink) ? row.ownerDeepLink : null;
            if ((ownerToolId === null) !== (ownerDeepLink === null)) {
                raise("C025-CONFIG-SCHEMA", "Coverage registry row " + index + " declares an owner without a route, or a route without an owner.",
                    "dimension: " + row.dimensionId);
            }
            /* The owner route is the one registry value that reaches an href. The page CSP keeps
               script-src 'unsafe-inline' for the single-file design, so a javascript: or data: URL
               here would execute rather than be blocked. Only a bare same-origin route file is a
               route, which also excludes protocol-relative, absolute and traversing forms. */
            if (ownerDeepLink !== null && !SAFE_OWNER_ROUTE.test(ownerDeepLink)) {
                raise("C025-CONFIG-SCHEMA", "Coverage registry row " + index + " declares an owner route that is not a same-origin route file.",
                    "dimension: " + row.dimensionId);
            }
            /* An owner route may declare the query parameter it reads a company from. The name
               is validated as an identifier, so the composed link cannot grow a second value,
               a fragment or an encoded delimiter out of the registry. Declaration is tested the
               same way as ownerBareReason below — present versus absent — because a weaker test
               here would silently normalise a malformed name to "absent", let the row pass the
               exactly-one rule as a bare link, and drop the company while composing a reason the
               row never earned. A declared name must therefore BE a plain identifier string. */
            var subjectParamDeclared = row.ownerSubjectParam !== null && row.ownerSubjectParam !== undefined;
            var ownerSubjectParam = subjectParamDeclared ? row.ownerSubjectParam : null;
            if (subjectParamDeclared && ownerDeepLink === null) {
                raise("C025-CONFIG-SCHEMA", "Coverage registry row " + index + " declares a subject parameter without an owner route.",
                    "dimension: " + row.dimensionId);
            }
            if (subjectParamDeclared && (!isNonEmptyString(ownerSubjectParam) || !SAFE_SUBJECT_PARAM.test(ownerSubjectParam))) {
                raise("C025-CONFIG-SCHEMA", "Coverage registry row " + index + " declares a subject parameter that is not a plain identifier.",
                    "dimension: " + row.dimensionId);
            }
            /* A row that links to an owner and carries no company must SAY WHY. The three checks
               below turn that from an editorial promise into a config-read error: a reason with
               no route is a half-declared owner; a reason outside the closed enum would reach a
               rendering path unreviewed; and a linked row that declares neither field, or both,
               leaves the reader unable to tell a deliberate bare link from a forgotten one. */
            var bareReasonDeclared = row.ownerBareReason !== null && row.ownerBareReason !== undefined;
            var ownerBareReason = bareReasonDeclared ? row.ownerBareReason : null;
            if (bareReasonDeclared && ownerDeepLink === null) {
                raise("C025-CONFIG-SCHEMA", "Coverage registry row " + index + " declares a bare-link reason without an owner route.",
                    "dimension: " + row.dimensionId);
            }
            if (bareReasonDeclared && !contains(OWNER_BARE_REASONS, ownerBareReason)) {
                raise("C025-CONFIG-SCHEMA", "Coverage registry row " + index + " declares a bare-link reason outside the closed enum.",
                    "dimension: " + row.dimensionId);
            }
            if (ownerDeepLink !== null && subjectParamDeclared === bareReasonDeclared) {
                raise("C025-CONFIG-SCHEMA", "Coverage registry row " + index + " must declare exactly one of a subject parameter and a bare-link reason.",
                    "dimension: " + row.dimensionId);
            }
            return {
                dimensionId: row.dimensionId,
                label: row.label,
                ownerToolId: ownerToolId,
                ownerDeepLink: ownerDeepLink,
                ownerSubjectParam: ownerSubjectParam,
                ownerBareReason: ownerBareReason,
                freshnessWindowDays: row.freshnessWindowDays,
                maxHorizon: row.maxHorizon
            };
        });
        var declared = rows.map(function (row) { return row.dimensionId; });
        var missing = MANDATORY_DIMENSION_IDS.filter(function (id) { return declared.indexOf(id) === -1; });
        if (missing.length > 0) {
            raise("C025-REGISTRY-INCOMPLETE", "The coverage registry omits a mandatory dimension.",
                "missing: " + missing.join(", "));
        }
        var duplicates = declared.filter(function (id, index) { return declared.indexOf(id) !== index; });
        if (duplicates.length > 0) {
            raise("C025-CONFIG-SCHEMA", "The coverage registry declares a dimension twice.",
                "duplicate: " + duplicates.join(", "));
        }
        var eventSource = readEventSource(config.eventSource);
        var horizons = config.horizons.map(function (horizon, index) {
            if (!isPlainObject(horizon) || !contains(HORIZON_IDS, horizon.horizonId) ||
                !contains(HORIZON_RANKS, horizon.rank) || !isNonEmptyString(horizon.question) ||
                !Array.isArray(horizon.primaryDimensionIds) || horizon.primaryDimensionIds.length === 0) {
                raise("C025-CONFIG-SCHEMA", "Horizon " + index + " declares no identity, rank, question or primary dimensions.");
            }
            var strays = horizon.primaryDimensionIds.filter(function (id) { return declared.indexOf(id) === -1; });
            if (strays.length > 0) {
                raise("C025-CONFIG-SCHEMA", "Horizon " + horizon.horizonId + " names a dimension the registry does not declare.",
                    "unknown: " + strays.join(", "));
            }
            /* A primary dimension the horizon's own filter would exclude could never contribute,
               so declaring it would promise coverage the partition makes unreachable. */
            var unreachable = horizon.primaryDimensionIds.filter(function (id) {
                var row = rows.filter(function (candidate) { return candidate.dimensionId === id; })[0];
                return HORIZON_RANKS.indexOf(row.maxHorizon) < HORIZON_RANKS.indexOf(horizon.rank);
            });
            if (unreachable.length > 0) {
                raise("C025-CONFIG-SCHEMA", "Horizon " + horizon.horizonId + " names a dimension its own rank filter excludes.",
                    "unreachable: " + unreachable.join(", "));
            }
            return {
                horizonId: horizon.horizonId,
                rank: horizon.rank,
                question: horizon.question,
                primaryDimensionIds: horizon.primaryDimensionIds.slice().sort()
            };
        });
        return deepFreeze({
            contractVersion: "company-coverage-registry/v1",
            rows: rows,
            horizons: horizons,
            eventSource: eventSource,
            researchRecordSubjects: readResearchRecordSubjects(config.researchRecord),
            maxBranches: config.maxBranches
        });
    }

    /* The subjects that carry a committed authored plan and version tree. A subject absent from
       this list carries none, so the route requests nothing for it: probing for a file that was
       never committed would turn a normal absence into a failed response. An undeclared block is
       an empty list, while a malformed one is refused rather than silently read as empty. */
    function readResearchRecordSubjects(declared) {
        if (declared === undefined || declared === null) return Object.freeze([]);
        if (!isPlainObject(declared) || !Array.isArray(declared.coveredSubjects)) {
            raise("C025-CONFIG-SCHEMA", "The research record declares no covered subject list, even an empty one.");
        }
        declared.coveredSubjects.forEach(function (subjectId, index) {
            if (!isNonEmptyString(subjectId)) {
                raise("C025-CONFIG-SCHEMA", "Research record subject " + index + " names no subject.");
            }
        });
        return Object.freeze(sortBy(declared.coveredSubjects.slice(), function (subjectId) { return subjectId; }));
    }

    /* The declared public event source. It is read here rather than in the adapter so a
       configuration that names a source without stating its access terms, its freshness window
       or the file that carries its rows is refused before any run reaches it. */
    function readEventSource(declared) {
        if (!isPlainObject(declared)) {
            raise("C025-CONFIG-SCHEMA", "The configuration declares no event source.");
        }
        if (!isNonEmptyString(declared.sourceId) || !isNonEmptyString(declared.sourceName) ||
            !isNonEmptyString(declared.sourceUrl) || !isNonEmptyString(declared.accessTerms)) {
            raise("C025-CONFIG-SCHEMA", "The event source declares no identity, url or access terms.");
        }
        if (!Number.isFinite(declared.freshnessWindowDays) || declared.freshnessWindowDays <= 0) {
            raise("C025-CONFIG-SCHEMA", "The event source declares no positive freshness window.");
        }
        if (!Array.isArray(declared.coveredSubjects)) {
            raise("C025-CONFIG-SCHEMA", "The event source declares no covered subject list, even an empty one.");
        }
        var covered = declared.coveredSubjects.map(function (entry, index) {
            if (!isPlainObject(entry) || !isNonEmptyString(entry.subjectId) || !isNonEmptyString(entry.eventsPath)) {
                raise("C025-CONFIG-SCHEMA", "Covered subject " + index + " names no subject and committed file pair.");
            }
            /* Same-origin committed paths only. A covered subject that named a remote file
               would turn a keyless out-of-band read into a request the route issues at runtime. */
            if (/^[a-z][a-z0-9+.-]*:/i.test(entry.eventsPath) || entry.eventsPath.charAt(0) === "/") {
                raise("C025-CONFIG-SCHEMA", "Covered subject " + index + " names a path that is not a same-origin committed file.",
                    "path: " + entry.eventsPath);
            }
            return { subjectId: entry.subjectId, eventsPath: entry.eventsPath };
        });
        return {
            sourceId: declared.sourceId,
            sourceName: declared.sourceName,
            sourceUrl: declared.sourceUrl,
            accessTerms: declared.accessTerms,
            freshnessWindowDays: declared.freshnessWindowDays,
            coveredSubjects: sortBy(covered, function (entry) { return entry.subjectId; })
        };
    }

    /* The committed file a covered subject's events live in, or null when this subject carries
       none. A subject with no entry is a normal absence, so the route asks for nothing. */
    function eventsPathFor(registry, subjectId) {
        var source = registry && isPlainObject(registry.eventSource) ? registry.eventSource : null;
        if (!source) return null;
        for (var index = 0; index < source.coveredSubjects.length; index += 1) {
            if (source.coveredSubjects[index].subjectId === subjectId) return source.coveredSubjects[index].eventsPath;
        }
        return null;
    }

    function registryRow(registry, dimensionId) {
        var rows = registry && Array.isArray(registry.rows) ? registry.rows : [];
        for (var index = 0; index < rows.length; index += 1) {
            if (rows[index].dimensionId === dimensionId) return rows[index];
        }
        return null;
    }

    /* A dimension with a registered owner gets a link. A dimension with no owner says so in
       words, because an empty cell would read as an omission rather than as a stated absence. */
    /* Composes the href a dimension card and the coverage table put on screen. The route half
       is re-tested against SAFE_OWNER_ROUTE here rather than trusted from the caller, so a
       hand-assembled registry that never passed readCoverageRegistry cannot reach an href
       either. The subject half is percent-encoded, and it is only ever appended AFTER a
       validated `<file>.html?<identifier>=`, so no value on either side can introduce a
       scheme, an authority or a path segment. */
    function ownerRouteFor(row, subject) {
        if (!row || !isNonEmptyString(row.ownerDeepLink) || !SAFE_OWNER_ROUTE.test(row.ownerDeepLink)) {
            return null;
        }
        var param = isNonEmptyString(row.ownerSubjectParam) && SAFE_SUBJECT_PARAM.test(row.ownerSubjectParam)
            ? row.ownerSubjectParam
            : null;
        var value = typeof subject === "string" ? subject.trim() : "";
        if (param === null || value === "") {
            return { href: row.ownerDeepLink, carriesSubject: false };
        }
        return {
            href: row.ownerDeepLink + "?" + param + "=" + encodeURIComponent(value),
            carriesSubject: true
        };
    }

    function describeDimensionOwner(registry, dimensionId, subject) {
        var row = registryRow(registry, dimensionId);
        if (!row) {
            return deepFreeze({
                contractVersion: "company-dimension-owner/v1",
                dimensionId: dimensionId,
                hasOwner: false,
                ownerToolId: null,
                ownerDeepLink: null,
                carriesSubject: false,
                statement: "This dimension is not declared in the coverage registry."
            });
        }
        var route = row.ownerToolId === null ? null : ownerRouteFor(row, subject);
        if (route === null) {
            return deepFreeze({
                contractVersion: "company-dimension-owner/v1",
                dimensionId: dimensionId,
                hasOwner: false,
                ownerToolId: null,
                ownerDeepLink: null,
                carriesSubject: false,
                statement: row.ownerToolId === null
                    ? "No registered tool owns " + row.label + ", so there is no route to open."
                    : "The route declared for " + row.label + " is not a same-origin route file, so it is not opened."
            });
        }
        /* A link that does not carry the company says WHY it does not. The reader is told the
           owner is market-scoped, or fixed on its own subject, rather than being left to read a
           bare link as an omission. The last branch is still reachable: a row that DOES declare
           a subject parameter composes a bare href when the caller passes no company. */
        var statement;
        if (route.carriesSubject) {
            statement = row.label + " is owned by " + row.ownerToolId + ", which opens on this company.";
        } else if (row.ownerBareReason === "market-scoped") {
            statement = row.label + " is owned by " + row.ownerToolId
                + ", which answers a market-wide question rather than a company one, so the link carries no company.";
        } else if (row.ownerBareReason === "fixed-subject") {
            statement = row.label + " is owned by " + row.ownerToolId
                + ", which does not model an individual company you can choose, so the link opens on that tool's own subject.";
        } else {
            statement = row.label + " is owned by " + row.ownerToolId
                + ", which reads no company parameter and opens on its own subject.";
        }
        return deepFreeze({
            contractVersion: "company-dimension-owner/v1",
            dimensionId: dimensionId,
            hasOwner: true,
            ownerToolId: row.ownerToolId,
            ownerDeepLink: route.href,
            carriesSubject: route.carriesSubject,
            statement: statement
        });
    }

    /* ---------- dimension reads ---------- */

    function makeValue(valueId, label, value, unit, provenanceClass, sourceName, asOf) {
        if (!contains(PROVENANCE_CLASSES, provenanceClass)) {
            raise("C025-READ-CONTRACT", "A value declares an unknown provenance class.", "value: " + valueId);
        }
        return {
            valueId: valueId,
            label: label,
            value: value,
            unit: unit,
            provenanceClass: provenanceClass,
            sourceName: sourceName,
            asOf: asOf
        };
    }

    function makeRead(spec) {
        if (!contains(EVIDENCE_STATES, spec.state)) {
            raise("C025-READ-CONTRACT", "A dimension read declares an unknown state.", "dimension: " + spec.dimensionId);
        }
        if (spec.state === "current" && spec.reasonCode !== null) {
            raise("C025-READ-CONTRACT", "A current dimension read carries a reason code.", "dimension: " + spec.dimensionId);
        }
        if (spec.state !== "current" && !contains(REASON_CODES, spec.reasonCode)) {
            raise("C025-READ-CONTRACT", "A non-current dimension read carries no known reason code.", "dimension: " + spec.dimensionId);
        }
        if (!contains(SOURCE_CLASSES, spec.sourceClass)) {
            raise("C025-READ-CONTRACT", "A dimension read declares an unknown source class.", "dimension: " + spec.dimensionId);
        }
        var values = spec.state === "unavailable" ? [] : (spec.values || []);
        return {
            contractVersion: "company-dimension-read/v1",
            dimensionId: spec.dimensionId,
            subjectId: spec.subjectId,
            state: spec.state,
            reasonCode: spec.reasonCode,
            maxHorizon: spec.maxHorizon,
            values: sortBy(values, function (value) { return value.valueId; }),
            directionalSignal: contains(["constructive", "pressured", "flat"], spec.directionalSignal) ? spec.directionalSignal : null,
            ownerToolId: spec.ownerToolId,
            ownerDeepLink: spec.ownerDeepLink,
            sourceClass: spec.sourceClass,
            sourceName: isNonEmptyString(spec.sourceName) ? spec.sourceName : null,
            asOf: isIsoDate(spec.asOf) ? spec.asOf : null,
            ageDays: Number.isFinite(spec.ageDays) ? spec.ageDays : null,
            limitations: (spec.limitations || []).slice().sort()
        };
    }

    function unavailableRead(row, subject, reasonCode, sourceClass, limitation) {
        return makeRead({
            dimensionId: row.dimensionId,
            subjectId: subject.subjectId,
            state: "unavailable",
            reasonCode: reasonCode,
            maxHorizon: row.maxHorizon,
            values: [],
            directionalSignal: null,
            ownerToolId: row.ownerToolId,
            ownerDeepLink: row.ownerDeepLink,
            sourceClass: sourceClass,
            sourceName: null,
            asOf: null,
            ageDays: null,
            limitations: isNonEmptyString(limitation) ? [limitation] : []
        });
    }

    /* A read whose source answered but answered too long ago. Every adapter that can age out
       states the same three things — the state, the reason and the absence of a direction — and
       stating them in one place is what stops a fourth adapter from aging out while still
       publishing a direction the stale number no longer supports. */
    function staleRead(row, subject, spec) {
        return makeRead({
            dimensionId: row.dimensionId,
            subjectId: subject.subjectId,
            state: "stale",
            reasonCode: "read-aged-past-window",
            maxHorizon: row.maxHorizon,
            values: spec.values,
            directionalSignal: null,
            ownerToolId: row.ownerToolId,
            ownerDeepLink: row.ownerDeepLink,
            sourceClass: spec.sourceClass,
            sourceName: spec.sourceName,
            asOf: spec.asOf,
            ageDays: spec.ageDays,
            limitations: spec.limitations
        });
    }

    /* An owner publishes its as-of either as a full instant or as a bare date. Both name the same
       day, and every consumer of an owner read needs that day rather than the instant. */
    function ownerReadDay(value) {
        if (isIsoInstant(value)) return value.slice(0, 10);
        return isIsoDate(value) ? value : null;
    }

    function looksLikeFixture(envelope) {
        if (!isPlainObject(envelope)) return false;
        if (envelope.sourceClass === "fixture") return true;
        return isNonEmptyString(envelope.sourcePath) && envelope.sourcePath.indexOf(FIXTURE_PATH_MARKER) !== -1;
    }

    function envelopeSubjectMismatch(envelope, subject) {
        if (!isPlainObject(envelope)) return false;
        if (isNonEmptyString(envelope.subjectId) && envelope.subjectId !== subject.subjectId) return true;
        if (isNonEmptyString(envelope.ticker) && envelope.ticker.toUpperCase() !== subject.ticker) return true;
        if (isNonEmptyString(envelope.cik) && isNonEmptyString(subject.cik) && envelope.cik !== subject.cik) return true;
        return false;
    }

    function signalFromChange(changePercent, threshold) {
        if (!Number.isFinite(changePercent)) return null;
        if (changePercent > threshold) return "constructive";
        if (changePercent < -threshold) return "pressured";
        return "flat";
    }

    function barRows(rldata, symbol) {
        if (!rldata || typeof rldata.bars !== "function") return null;
        var rows = rldata.bars(symbol, "1d");
        return Array.isArray(rows) ? rows : null;
    }

    function trailingChangePercent(rows, lookback) {
        if (!Array.isArray(rows) || rows.length <= lookback) return null;
        var last = rows[rows.length - 1];
        var prior = rows[rows.length - 1 - lookback];
        if (!isPlainObject(last) || !isPlainObject(prior)) return null;
        if (!Number.isFinite(last.c) || !Number.isFinite(prior.c) || prior.c === 0) return null;
        return ((last.c - prior.c) / prior.c) * 100;
    }

    var PERFORMANCE_LOOKBACK = 63;

    function performanceAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "performance");
        var rows = barRows(rldata, subject.ticker);
        if (!rows || rows.length === 0) {
            return unavailableRead(row, subject,
                subject.identityBasis === "sec-cik" ? "company-not-in-corpus" : "symbol-not-covered",
                "none", "No committed daily price history covers " + subject.ticker + ".");
        }
        if (rows.length <= PERFORMANCE_LOOKBACK) {
            return unavailableRead(row, subject, "window-too-short", "cache",
                "Committed history holds " + rows.length + " sessions, fewer than the " + (PERFORMANCE_LOOKBACK + 1) + " the trailing window needs.");
        }
        var asOf = isoDateOf(rows[rows.length - 1].t);
        var ageDays = dayDifference(asOf, decisionTime);
        var change = trailingChangePercent(rows, PERFORMANCE_LOOKBACK);
        var values = [makeValue("performance-trailing-63", "Trailing 63-session price change",
            decimalString(change, 3), "percent", "derived", "committed daily bars", asOf)];
        if (Number.isFinite(ageDays) && ageDays > row.freshnessWindowDays) {
            return staleRead(row, subject, {
                values: values, sourceClass: "cache", sourceName: "committed daily bars",
                asOf: asOf, ageDays: ageDays,
                limitations: ["Price history is " + ageDays + " days old, past the " + row.freshnessWindowDays + " day window."]
            });
        }
        return makeRead({
            dimensionId: "performance", subjectId: subject.subjectId, state: "current",
            reasonCode: null, maxHorizon: row.maxHorizon, values: values,
            directionalSignal: signalFromChange(change, 2), ownerToolId: row.ownerToolId,
            ownerDeepLink: row.ownerDeepLink, sourceClass: "cache", sourceName: "committed daily bars",
            asOf: asOf, ageDays: ageDays, limitations: []
        });
    }

    function relativeAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "performance");
        var benchmark = isPlainObject(sources) && isNonEmptyString(sources.benchmarkSymbol)
            ? sources.benchmarkSymbol.toUpperCase() : null;
        if (!benchmark) {
            return unavailableRead(row, subject, "source-not-published", "none",
                "No benchmark symbol was supplied, so relative performance has no second leg.");
        }
        var own = barRows(rldata, subject.ticker);
        var against = barRows(rldata, benchmark);
        if (!own || !against) {
            return unavailableRead(row, subject, "symbol-not-covered", "none",
                "One leg of the " + subject.ticker + " against " + benchmark + " pair has no committed history.");
        }
        /* Both legs are aligned on their COMMON dates before either change is measured. A spread
           taken across dates only one leg observed is a wrong number, not an imprecise one. */
        var benchmarkByDate = {};
        against.forEach(function (bar) {
            if (isPlainObject(bar) && Number.isFinite(bar.t) && Number.isFinite(bar.c)) {
                benchmarkByDate[isoDateOf(bar.t)] = bar.c;
            }
        });
        var aligned = [];
        own.forEach(function (bar) {
            if (!isPlainObject(bar) || !Number.isFinite(bar.t) || !Number.isFinite(bar.c)) return;
            var date = isoDateOf(bar.t);
            if (!Object.prototype.hasOwnProperty.call(benchmarkByDate, date)) return;
            aligned.push({ date: date, own: bar.c, against: benchmarkByDate[date] });
        });
        if (aligned.length <= PERFORMANCE_LOOKBACK) {
            return unavailableRead(row, subject, "window-too-short", "cache",
                "The " + subject.ticker + " against " + benchmark + " pair shares " + aligned.length +
                " sessions, fewer than the " + (PERFORMANCE_LOOKBACK + 1) + " the trailing window needs.");
        }
        var lastAligned = aligned[aligned.length - 1];
        var priorAligned = aligned[aligned.length - 1 - PERFORMANCE_LOOKBACK];
        if (priorAligned.own === 0 || priorAligned.against === 0) {
            return unavailableRead(row, subject, "window-too-short", "cache",
                "A leg opens the aligned window at zero, so no change can be measured.");
        }
        var ownChange = ((lastAligned.own - priorAligned.own) / priorAligned.own) * 100;
        var againstChange = ((lastAligned.against - priorAligned.against) / priorAligned.against) * 100;
        var spread = ownChange - againstChange;
        var asOf = lastAligned.date;
        return makeRead({
            dimensionId: "performance", subjectId: subject.subjectId, state: "current",
            reasonCode: null, maxHorizon: row.maxHorizon,
            values: [
                makeValue("performance-relative-63", "Trailing 63-session change against " + benchmark,
                    decimalString(spread, 3), "percentage points", "derived",
                    "committed daily bars for " + subject.ticker + " and " + benchmark, asOf),
                /* The own-leg change measured over the ALIGNED window carries the same identity the
                   price adapter publishes. When the two disagree the dimension turns conflicted and
                   both numbers stay visible, because a benchmark with missing sessions moves the
                   window and that movement is the disagreement a reader must see. */
                makeValue("performance-trailing-63", "Trailing 63-session price change",
                    decimalString(ownChange, 3), "percent", "derived",
                    "committed daily bars aligned to " + benchmark, asOf)
            ],
            directionalSignal: signalFromChange(spread, 2), ownerToolId: row.ownerToolId,
            ownerDeepLink: row.ownerDeepLink, sourceClass: "cache",
            sourceName: "committed daily bars for " + subject.ticker + " and " + benchmark,
            asOf: asOf, ageDays: dayDifference(asOf, decisionTime), limitations: []
        });
    }

    function fundamentalsAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "fundamentals");
        var envelope = isPlainObject(sources) && isPlainObject(sources.fundamentalsRead)
            ? sources.fundamentalsRead
            : (rldata && typeof rldata.toolRead === "function" ? rldata.toolRead("company-fundamentals-lab") : null);
        if (!isPlainObject(envelope)) {
            return unavailableRead(row, subject, "source-not-published", "none",
                "No fundamentals publication has been read for this company.");
        }
        if (looksLikeFixture(envelope)) {
            return unavailableRead(row, subject, "fixture-only-evidence", "fixture",
                "The only fundamentals evidence available is fixture data, which never reaches a horizon.");
        }
        if (envelopeSubjectMismatch(envelope, subject)) {
            return unavailableRead(row, subject, "read-company-mismatch", "owner-read",
                "The fundamentals publication names a different company than " + subject.ticker + ".");
        }
        if (!Array.isArray(envelope.facts) || envelope.facts.length === 0 || !isIsoDate(envelope.asOf)) {
            return unavailableRead(row, subject, "source-not-published", "owner-read",
                "The fundamentals publication carries no dated reported fact.");
        }
        var ageDays = dayDifference(envelope.asOf, decisionTime);
        var values = envelope.facts.filter(function (fact) {
            return isPlainObject(fact) && isNonEmptyString(fact.factId) && isNonEmptyString(fact.label) &&
                isNonEmptyString(fact.value) && isNonEmptyString(fact.unit);
        }).map(function (fact) {
            return makeValue("fundamentals-" + fact.factId, fact.label, fact.value, fact.unit,
                "observed", isNonEmptyString(envelope.sourceName) ? envelope.sourceName : "company fundamentals publication",
                envelope.asOf);
        });
        if (values.length === 0) {
            return unavailableRead(row, subject, "source-not-published", "owner-read",
                "Every reported fact in the publication failed its own contract check.");
        }
        if (Number.isFinite(ageDays) && ageDays > row.freshnessWindowDays) {
            return staleRead(row, subject, {
                values: values, sourceClass: "owner-read", sourceName: values[0].sourceName,
                asOf: envelope.asOf, ageDays: ageDays,
                limitations: ["The publication is " + ageDays + " days old, past the " + row.freshnessWindowDays + " day window."]
            });
        }
        return makeRead({
            dimensionId: "fundamentals", subjectId: subject.subjectId, state: "current",
            reasonCode: null, maxHorizon: row.maxHorizon, values: values,
            directionalSignal: envelope.directionalSignal,
            ownerToolId: row.ownerToolId, ownerDeepLink: row.ownerDeepLink, sourceClass: "owner-read",
            sourceName: values[0].sourceName, asOf: envelope.asOf, ageDays: ageDays, limitations: []
        });
    }

    function valuationAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "valuation");
        var metrics = isPlainObject(sources) && Array.isArray(sources.derivedMetrics) ? sources.derivedMetrics : [];
        var usable = metrics.filter(function (metric) {
            return isPlainObject(metric) && isNonEmptyString(metric.metricId) && isNonEmptyString(metric.label) &&
                isNonEmptyString(metric.value) && isNonEmptyString(metric.unit) && isIsoDate(metric.asOf);
        });
        if (usable.length === 0) {
            return unavailableRead(row, subject, "source-not-published", "none",
                "No derived valuation metric has been published for this company.");
        }
        if (usable.some(function (metric) { return looksLikeFixture(metric); })) {
            return unavailableRead(row, subject, "fixture-only-evidence", "fixture",
                "The only valuation evidence available is fixture data, which never reaches a horizon.");
        }
        var values = usable.map(function (metric) {
            return makeValue("valuation-" + metric.metricId, metric.label, metric.value, metric.unit,
                "derived", isNonEmptyString(metric.sourceName) ? metric.sourceName : "company fundamentals publication",
                metric.asOf);
        });
        /* Partial, not current: no peer set exists, so the metric can be read only against the
           company's own history. Calling that a complete valuation would overstate it. */
        return makeRead({
            dimensionId: "valuation", subjectId: subject.subjectId, state: "partial",
            reasonCode: "peer-set-missing", maxHorizon: row.maxHorizon, values: values,
            directionalSignal: sources.valuationSignal,
            ownerToolId: row.ownerToolId, ownerDeepLink: row.ownerDeepLink, sourceClass: "owner-read",
            sourceName: values[0].sourceName, asOf: values[0].asOf,
            ageDays: dayDifference(values[0].asOf, decisionTime),
            limitations: ["No peer set is published, so this reads against the company's own history only."]
        });
    }

    function noSharedReadAdapter(dimensionId, detail) {
        return function (subject, sources, decisionTime, rldata, registry) {
            var row = registryRow(registry, dimensionId);
            return unavailableRead(row, subject, "no-shared-read", "none", detail);
        };
    }

    function optionsStructureAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "options-structure");
        var chain = rldata && typeof rldata.options === "function" ? rldata.options(subject.ticker) : null;
        var detail = chain
            ? "An options chain is cached for " + subject.ticker + ", but no shared module publishes a term or skew read a headless consumer can call."
            : "No options chain is cached for " + subject.ticker + " and no shared module publishes a term or skew read.";
        return unavailableRead(row, subject, "no-shared-read", "none", detail);
    }

    function volatilityAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "volatility");
        var read = rldata && typeof rldata.toolRead === "function" ? rldata.toolRead("volatility-sizing-lab") : null;
        if (!isPlainObject(read)) {
            return unavailableRead(row, subject, "source-not-published", "none",
                "The volatility owner has not published a read on the shared channel.");
        }
        if (looksLikeFixture(read)) {
            return unavailableRead(row, subject, "fixture-only-evidence", "fixture",
                "The volatility read on the channel is fixture data, which never reaches a horizon.");
        }
        var metrics = isPlainObject(read.metrics) ? read.metrics : {};
        if (envelopeSubjectMismatch(metrics, subject)) {
            return unavailableRead(row, subject, "read-company-mismatch", "owner-read",
                "The published volatility read names a different company than " + subject.ticker + ".");
        }
        var percentile = Number.isFinite(metrics.volPercentile) ? metrics.volPercentile : null;
        var asOf = ownerReadDay(read.asOf);
        if (percentile === null || asOf === null) {
            return unavailableRead(row, subject, "source-not-published", "owner-read",
                "The published volatility read carries no dated percentile for " + subject.ticker + ".");
        }
        var ageDays = dayDifference(asOf, decisionTime);
        var values = [makeValue("volatility-percentile-12m", "Volatility percentile",
            decimalString(percentile, 3), "percent", "derived", "volatility owner read", asOf)];
        if (Number.isFinite(ageDays) && ageDays > row.freshnessWindowDays) {
            return staleRead(row, subject, {
                values: values, sourceClass: "owner-read", sourceName: "volatility owner read",
                asOf: asOf, ageDays: ageDays,
                limitations: ["The volatility read is " + ageDays + " days old, past the " + row.freshnessWindowDays + " day window."]
            });
        }
        /* A high volatility percentile is pressure on an immediate read, a low one is not. */
        return makeRead({
            dimensionId: "volatility", subjectId: subject.subjectId, state: "current",
            reasonCode: null, maxHorizon: row.maxHorizon, values: values,
            directionalSignal: percentile >= 70 ? "pressured" : (percentile <= 30 ? "constructive" : "flat"),
            ownerToolId: row.ownerToolId, ownerDeepLink: row.ownerDeepLink, sourceClass: "owner-read",
            sourceName: "volatility owner read", asOf: asOf, ageDays: ageDays, limitations: []
        });
    }

    function financialEventAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "financial-events");
        var produced = publicScheduleSource(subject, sources, decisionTime).filter(function (event) {
            return event.eventClass === "financial";
        });
        if (produced.length === 0) {
            return unavailableRead(row, subject, "no-source-wired", "none",
                "No committed event file covers " + subject.ticker + ", so no financial date can be read.");
        }
        var selection = selectRenderableEvents(produced);
        var renderable = selection.events;
        if (renderable.length === 0) {
            return unavailableRead(row, subject, "source-not-published", "committed-file",
                "The committed event file for " + subject.ticker + " carries rows, but every one of them failed the event contract.");
        }
        var source = registry.eventSource;
        var catalysts = selectUpcomingCatalysts(selection, decisionTime);
        var asOfCandidates = renderable.map(function (event) { return event.asOf; })
            .filter(function (asOf) { return isIsoDate(asOf); }).sort();
        var asOf = asOfCandidates.length > 0 ? asOfCandidates[asOfCandidates.length - 1] : null;
        var ageDays = dayDifference(asOf, decisionTime);
        var nextDays = catalysts.upcoming.length > 0 ? dayDifference(catalysts.upcoming[0].date, decisionTime) : null;
        var values = [
            makeValue("financial-events-upcoming-count", "Dated financial events ahead of this run",
                decimalString(catalysts.upcoming.length, 0), "events", "observed", source.sourceName, asOf),
            makeValue("financial-events-occurred-count", "Sourced financial events already passed",
                decimalString(catalysts.occurred.length, 0), "events", "observed", source.sourceName, asOf),
            /* Days to the next dated event, or the word rather than a zero when none lies ahead. */
            makeValue("financial-events-days-to-next", "Days to the next dated financial event",
                Number.isFinite(nextDays) ? decimalString(Math.abs(nextDays), 0) : null, "days", "derived", source.sourceName, asOf)
        ];
        var limitations = ["Dates are read from committed SEC EDGAR filing records, so an issuer announcement made after " +
            String(asOf) + " is not reflected here."];
        if (catalysts.upcoming.some(function (event) { return event.dateClass === "estimated"; })) {
            limitations.push("At least one date ahead is inferred from the filing pattern rather than announced, and it states its own basis.");
        }
        if (Number.isFinite(ageDays) && ageDays > source.freshnessWindowDays) {
            return staleRead(row, subject, {
                values: values, sourceClass: "committed-file", sourceName: source.sourceName,
                asOf: asOf, ageDays: ageDays,
                limitations: limitations.concat(["The committed event file is " + ageDays +
                    " days old, past the " + source.freshnessWindowDays + " day window."])
            });
        }
        /* Flat, never constructive or pressured. A dated event is a scheduled risk; the source
           says when something happens and says nothing at all about which way it resolves. */
        return makeRead({
            dimensionId: "financial-events", subjectId: subject.subjectId, state: "current",
            reasonCode: null, maxHorizon: row.maxHorizon, values: values,
            directionalSignal: "flat", ownerToolId: row.ownerToolId, ownerDeepLink: row.ownerDeepLink,
            sourceClass: "committed-file", sourceName: source.sourceName, asOf: asOf, ageDays: ageDays,
            limitations: limitations
        });
    }

    function nonFinancialEventAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "non-financial-events");
        return unavailableRead(row, subject, "no-source-exists", "none",
            "No contract and no cache slot exist for non-financial company events, so none can be reported.");
    }

    function geopoliticsAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "geopolitics");
        var read = rldata && typeof rldata.toolRead === "function" ? rldata.toolRead("research-agenda-lab") : null;
        if (!isPlainObject(read) || !isNonEmptyString(read.read)) {
            return unavailableRead(row, subject, "source-not-published", "none",
                "The research agenda owner has not published a read on the shared channel.");
        }
        if (looksLikeFixture(read)) {
            return unavailableRead(row, subject, "fixture-only-evidence", "fixture",
                "The agenda read on the channel is fixture data, which never reaches a horizon.");
        }
        var asOf = ownerReadDay(read.asOf);
        if (asOf === null) {
            return unavailableRead(row, subject, "source-not-published", "owner-read",
                "The published agenda read carries no as-of date.");
        }
        var metrics = isPlainObject(read.metrics) ? read.metrics : {};
        var escalation = Number.isFinite(metrics.escalationCount) ? metrics.escalationCount : null;
        var values = [makeValue("geopolitics-open-topics", "Open agenda topics",
            escalation === null ? null : decimalString(escalation, 0), "topics", "proxy",
            "research agenda owner read", asOf)];
        /* Partial: the agenda covers the market, not this company, so it bounds the backdrop
           rather than describing the issuer. */
        return makeRead({
            dimensionId: "geopolitics", subjectId: subject.subjectId, state: "partial",
            reasonCode: "market-scope-only", maxHorizon: row.maxHorizon, values: values,
            directionalSignal: null, ownerToolId: row.ownerToolId, ownerDeepLink: row.ownerDeepLink,
            sourceClass: "owner-read", sourceName: "research agenda owner read", asOf: asOf,
            ageDays: dayDifference(asOf, decisionTime),
            limitations: ["The agenda is market-scoped, so nothing here is specific to " + subject.ticker + "."]
        });
    }

    function regimeAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "market-regime");
        var context = isPlainObject(sources) ? sources.publishedRegimeContext : null;
        if (!isPlainObject(context) || context.available !== true) {
            return unavailableRead(row, subject, "regime-not-published", "none",
                "No combined regime has been published, so there is no market backdrop to read.");
        }
        if (!isNonEmptyString(context.archetypeName) || !isIsoDate(context.asOf)) {
            return unavailableRead(row, subject, "source-not-published", "owner-read",
                "The published regime context carries no named archetype and dated as-of pair.");
        }
        return makeRead({
            dimensionId: "market-regime", subjectId: subject.subjectId, state: "partial",
            reasonCode: "market-scope-only", maxHorizon: row.maxHorizon,
            values: [makeValue("market-regime-archetype", "Published regime archetype",
                context.archetypeName, "archetype", "modelled", "combined regime publication", context.asOf)],
            directionalSignal: null, ownerToolId: row.ownerToolId, ownerDeepLink: row.ownerDeepLink,
            sourceClass: "owner-read", sourceName: "combined regime publication", asOf: context.asOf,
            ageDays: dayDifference(context.asOf, decisionTime),
            limitations: ["The regime describes the market, not " + subject.ticker + "."]
        });
    }

    function sentimentAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "sentiment");
        var macro = rldata && typeof rldata.macro === "function" ? rldata.macro() : null;
        if (!isPlainObject(macro) || !isPlainObject(macro.fg) || !Number.isFinite(macro.fg.score)) {
            return unavailableRead(row, subject, "source-not-published", "none",
                "No market sentiment reading is cached, so no sentiment backdrop can be reported.");
        }
        var asOf = isIsoInstant(macro.at) ? macro.at.slice(0, 10) : (Number.isFinite(macro.at) ? isoDateOf(macro.at) : null);
        if (asOf === null) {
            return unavailableRead(row, subject, "source-not-published", "cache",
                "The cached sentiment reading carries no usable timestamp.");
        }
        /* Proxy only: this is a market-wide sentiment gauge standing in for a company-level one
           that no source publishes. It is labelled as a proxy everywhere it renders. */
        return makeRead({
            dimensionId: "sentiment", subjectId: subject.subjectId, state: "partial",
            reasonCode: "proxy-only", maxHorizon: row.maxHorizon,
            values: [makeValue("sentiment-market-gauge", "Market sentiment gauge",
                decimalString(macro.fg.score, 3), "index", "proxy", "market sentiment cache", asOf)],
            directionalSignal: null, ownerToolId: row.ownerToolId, ownerDeepLink: row.ownerDeepLink,
            sourceClass: "cache", sourceName: "market sentiment cache", asOf: asOf,
            ageDays: dayDifference(asOf, decisionTime),
            limitations: ["This is a market-wide proxy, not a sentiment reading for " + subject.ticker + "."]
        });
    }

    function companyRiskAdapter(subject, sources, decisionTime, rldata, registry) {
        var row = registryRow(registry, "company-risk");
        return unavailableRead(row, subject, "no-owner", "none",
            "Nothing in this repository owns a company risk register, so no risk read exists to compose.");
    }

    var ADAPTERS = [
        { adapterId: "performanceAdapter", dimensionId: "performance", run: performanceAdapter },
        { adapterId: "relativeAdapter", dimensionId: "performance", run: relativeAdapter },
        { adapterId: "fundamentalsAdapter", dimensionId: "fundamentals", run: fundamentalsAdapter },
        { adapterId: "valuationAdapter", dimensionId: "valuation", run: valuationAdapter },
        {
            adapterId: "technicalsAdapter", dimensionId: "technicals",
            run: noSharedReadAdapter("technicals", "The technical structure math is page-local, so no headless consumer can read it.")
        },
        {
            adapterId: "cycleAdapter", dimensionId: "cycles",
            run: noSharedReadAdapter("cycles", "The trend and cycle math is page-local, so no headless consumer can read it.")
        },
        { adapterId: "optionsStructureAdapter", dimensionId: "options-structure", run: optionsStructureAdapter },
        {
            adapterId: "gammaAdapter", dimensionId: "dealer-gamma",
            run: noSharedReadAdapter("dealer-gamma", "The dealer gamma math is page-local, so no headless consumer can read it.")
        },
        {
            adapterId: "optionsFlowAdapter", dimensionId: "options-flow",
            run: noSharedReadAdapter("options-flow", "The options flow math is page-local, so no headless consumer can read it.")
        },
        { adapterId: "volatilityAdapter", dimensionId: "volatility", run: volatilityAdapter },
        { adapterId: "financialEventAdapter", dimensionId: "financial-events", run: financialEventAdapter },
        { adapterId: "nonFinancialEventAdapter", dimensionId: "non-financial-events", run: nonFinancialEventAdapter },
        { adapterId: "geopoliticsAdapter", dimensionId: "geopolitics", run: geopoliticsAdapter },
        { adapterId: "regimeAdapter", dimensionId: "market-regime", run: regimeAdapter },
        { adapterId: "sentimentAdapter", dimensionId: "sentiment", run: sentimentAdapter },
        { adapterId: "companyRiskAdapter", dimensionId: "company-risk", run: companyRiskAdapter }
    ];

    /* Two adapters may answer the same dimension. They are merged into one read: agreeing values
       union, and a genuine disagreement on the same value identity becomes conflicted with BOTH
       values retained, because picking a winner would hide the disagreement. */
    function mergeDimensionReads(reads, row, subjectId) {
        if (reads.length === 1) return reads[0];
        var usable = reads.filter(function (read) { return read.state === "current" || read.state === "partial"; });
        var limitations = [];
        reads.forEach(function (read) { limitations = limitations.concat(read.limitations); });
        limitations = limitations.filter(function (limitation, index) { return limitations.indexOf(limitation) === index; });
        if (usable.length === 0) {
            var ordered = sortBy(reads, function (read) { return read.state + ":" + read.reasonCode; });
            /* A stale or conflicted survivor keeps its numbers. Only an unavailable read publishes
               none, and makeRead enforces that, so a reader still sees that the source exists. */
            return makeRead({
                dimensionId: row.dimensionId, subjectId: subjectId, state: ordered[0].state,
                reasonCode: ordered[0].reasonCode, maxHorizon: row.maxHorizon, values: ordered[0].values,
                directionalSignal: null, ownerToolId: row.ownerToolId, ownerDeepLink: row.ownerDeepLink,
                sourceClass: ordered[0].sourceClass, sourceName: ordered[0].sourceName,
                asOf: ordered[0].asOf, ageDays: ordered[0].ageDays, limitations: limitations
            });
        }
        var byValueId = {};
        var conflict = false;
        var values = [];
        usable.forEach(function (read) {
            read.values.forEach(function (value) {
                if (Object.prototype.hasOwnProperty.call(byValueId, value.valueId)) {
                    if (byValueId[value.valueId].value === value.value) return;
                    conflict = true;
                    values.push(value);
                    return;
                }
                byValueId[value.valueId] = value;
                values.push(value);
            });
        });
        var signals = usable.map(function (read) { return read.directionalSignal; }).filter(function (signal) { return signal !== null; });
        var distinct = signals.filter(function (signal, index) { return signals.indexOf(signal) === index; });
        var asOfCandidates = usable.map(function (read) { return read.asOf; }).filter(isIsoDate).sort();
        var ages = usable.map(function (read) { return read.ageDays; }).filter(Number.isFinite);
        if (conflict) {
            return makeRead({
                dimensionId: row.dimensionId, subjectId: subjectId, state: "conflicted",
                reasonCode: "sources-disagree", maxHorizon: row.maxHorizon, values: values,
                directionalSignal: null, ownerToolId: row.ownerToolId, ownerDeepLink: row.ownerDeepLink,
                sourceClass: usable[0].sourceClass, sourceName: usable[0].sourceName,
                asOf: asOfCandidates.length ? asOfCandidates[0] : null,
                ageDays: ages.length ? Math.max.apply(null, ages) : null,
                limitations: limitations.concat(["Two sources answer this dimension differently. Both values are shown and neither wins."])
            });
        }
        var allCurrent = usable.length === reads.length && usable.every(function (read) { return read.state === "current"; });
        /* The surviving reason names why the dimension fell short of current, taken from the read
           that fell short rather than replaced by a generic stand-in. */
        var shortfall = sortBy(reads.filter(function (read) { return read.reasonCode !== null; }),
            function (read) { return read.reasonCode; })[0];
        return makeRead({
            dimensionId: row.dimensionId, subjectId: subjectId,
            state: allCurrent ? "current" : "partial",
            reasonCode: allCurrent ? null : (shortfall ? shortfall.reasonCode : "source-not-published"),
            maxHorizon: row.maxHorizon, values: values,
            directionalSignal: distinct.length === 1 ? distinct[0] : (distinct.length > 1 ? "flat" : null),
            ownerToolId: row.ownerToolId, ownerDeepLink: row.ownerDeepLink,
            sourceClass: usable[0].sourceClass, sourceName: usable[0].sourceName,
            asOf: asOfCandidates.length ? asOfCandidates[0] : null,
            ageDays: ages.length ? Math.max.apply(null, ages) : null,
            limitations: limitations
        });
    }

    function runAdapters(subject, sources, decisionTime, rldata) {
        if (!isPlainObject(subject) || subject.contractVersion !== "company-subject/v1") {
            raise("C025-READ-CONTRACT", "Adapters need a resolved company subject.");
        }
        if (!isIsoInstant(decisionTime)) {
            raise("C025-READ-CONTRACT", "Adapters need an explicit ISO decision time.");
        }
        var registry = isPlainObject(sources) && sources.registry && sources.registry.contractVersion === "company-coverage-registry/v1"
            ? sources.registry : null;
        if (!registry) {
            raise("C025-REGISTRY-INCOMPLETE", "Adapters need a validated coverage registry.");
        }
        var refusals = [];
        var byDimension = {};
        ADAPTERS.forEach(function (adapter) {
            var read = adapter.run(subject, isPlainObject(sources) ? sources : {}, decisionTime, rldata, registry);
            if (read.reasonCode === "read-company-mismatch") {
                refusals.push(makeError("C025-READ-COMPANY-MISMATCH",
                    "A consumed read names a different company and was excluded.",
                    adapter.adapterId + " on " + adapter.dimensionId));
            }
            if (!byDimension[adapter.dimensionId]) byDimension[adapter.dimensionId] = [];
            byDimension[adapter.dimensionId].push(read);
        });
        var merged = registry.rows.map(function (row) {
            var reads = byDimension[row.dimensionId];
            if (!reads || reads.length === 0) {
                refusals.push(makeError("C025-READ-CONTRACT",
                    "A registry dimension had no adapter and could not answer.", row.dimensionId));
                return unavailableRead(row, subject, "no-owner", "none",
                    "No adapter is wired for " + row.label + ".");
            }
            return mergeDimensionReads(reads, row, subject.subjectId);
        });
        return deepFreeze({
            contractVersion: "company-evidence-bundle/v1",
            subjectId: subject.subjectId,
            decisionTime: decisionTime,
            reads: sortBy(merged, function (read) { return read.dimensionId; }),
            refusals: sortBy(refusals, function (refusal) { return refusal.code + ":" + refusal.detail; })
        });
    }

    /* ---------- coverage account ---------- */

    /* An empty cache and a company with no source produce the same read set, so a caller that
       knows its corpus has not answered yet has to be able to say so: `corpusReadiness` is that
       input. Omitting it means "the corpus is resolved", which is what every caller written
       before this parameter existed was already asserting implicitly, so the account keeps its
       current shape and meaning for them. A value that is neither word is refused rather than
       coerced, because a misspelled readiness silently reverting to "established" would
       reintroduce exactly the claim this parameter exists to prevent. The refusal reuses the
       account's own input-contract code: the readiness word is an input to this function, and
       the refusal set is closed. */
    function buildCoverageAccount(reads, registry, corpusReadiness) {
        if (!isPlainObject(registry) || registry.contractVersion !== "company-coverage-registry/v1") {
            raise("C025-REGISTRY-INCOMPLETE", "The coverage account needs a validated registry.");
        }
        var readiness = corpusReadiness === undefined || corpusReadiness === null ? "established" : corpusReadiness;
        if (!contains(COVERAGE_READINESS_STATES, readiness)) {
            raise("C025-READ-CONTRACT", "Corpus readiness must be established or not-established.", String(corpusReadiness));
        }
        var list = Array.isArray(reads) ? reads : (isPlainObject(reads) && Array.isArray(reads.reads) ? reads.reads : null);
        if (!list) raise("C025-READ-CONTRACT", "The coverage account needs a dimension read list.");
        var byDimension = {};
        list.forEach(function (read) { byDimension[read.dimensionId] = read; });
        var totals = {};
        EVIDENCE_STATES.forEach(function (state) { totals[state] = 0; });
        var rows = registry.rows.map(function (row) {
            var read = byDimension[row.dimensionId];
            if (!read) {
                raise("C025-REGISTRY-INCOMPLETE", "A registry dimension produced no read.", row.dimensionId);
            }
            totals[read.state] += 1;
            return {
                dimensionId: row.dimensionId,
                label: row.label,
                state: read.state,
                reasonCode: read.reasonCode,
                ownerToolId: row.ownerToolId,
                ownerDeepLink: row.ownerDeepLink,
                asOf: read.asOf,
                ageDays: read.ageDays
            };
        });
        var subjectId = list.length > 0 ? list[0].subjectId : null;
        return deepFreeze({
            contractVersion: "company-coverage-account/v1",
            subjectId: subjectId,
            readiness: readiness,
            rows: rows,
            totals: totals
        });
    }

    /* Evidence families group the reads by how their evidence was acquired, so the sources
       workspace can state what class of thing answered rather than listing fifteen rows flat. */
    function groupEvidenceFamilies(reads) {
        var list = Array.isArray(reads) ? reads : (isPlainObject(reads) && Array.isArray(reads.reads) ? reads.reads : []);
        var families = SOURCE_CLASSES.map(function (sourceClass) {
            var members = list.filter(function (read) { return read.sourceClass === sourceClass; });
            return {
                familyId: sourceClass,
                dimensionIds: sortBy(members.map(function (read) { return read.dimensionId; }), function (id) { return id; }),
                answeredCount: members.filter(function (read) { return read.state !== "unavailable"; }).length,
                memberCount: members.length
            };
        }).filter(function (family) { return family.memberCount > 0; });
        return deepFreeze({
            contractVersion: "company-evidence-family-group/v1",
            families: families,
            groupedCount: families.reduce(function (total, family) { return total + family.memberCount; }, 0)
        });
    }

    /* ---------- horizon partition ---------- */

    /* A read may serve a horizon only when its declared maximum horizon reaches that far. The
       filter builds four separate arguments, so a composer cannot reach a read it may not use
       even if a later edit forgets the rule. */
    function partitionByHorizon(reads) {
        var list = Array.isArray(reads) ? reads : (isPlainObject(reads) && Array.isArray(reads.reads) ? reads.reads : []);
        var partition = {};
        HORIZON_RANKS.forEach(function (rank) {
            var minimum = HORIZON_RANKS.indexOf(rank);
            partition[rank] = list.filter(function (read) {
                return HORIZON_RANKS.indexOf(read.maxHorizon) >= minimum;
            }).map(function (read) { return JSON.parse(JSON.stringify(read)); });
            partition[rank] = sortBy(partition[rank], function (read) { return read.dimensionId; });
        });
        return deepFreeze(partition);
    }

    /* ---------- horizon composition ---------- */

    function qualityFromCount(count) {
        if (count >= 4) return "broad";
        if (count >= 2) return "narrow";
        if (count >= 1) return "thin";
        return "absent";
    }

    function downgrade(quality) {
        var index = EVIDENCE_QUALITIES.indexOf(quality);
        /* A direction that exists is never downgraded to absent, because absent means no
           direction at all. The floor is thin. */
        if (index < 0 || index >= EVIDENCE_QUALITIES.indexOf("thin")) return quality;
        return EVIDENCE_QUALITIES[index + 1];
    }

    function horizonPolicy(policy, horizonId) {
        if (!isPlainObject(policy) || policy.contractVersion !== "company-coverage-registry/v1") {
            raise("C025-REGISTRY-INCOMPLETE", "A horizon composer needs a validated registry as its policy.");
        }
        for (var index = 0; index < policy.horizons.length; index += 1) {
            if (policy.horizons[index].horizonId === horizonId) return policy.horizons[index];
        }
        raise("C025-REGISTRY-INCOMPLETE", "The registry declares no horizon named " + horizonId + ".");
        return null;
    }

    function composeHorizon(horizonId, set, policy, decisionTime) {
        if (!Array.isArray(set)) {
            raise("C025-HORIZON-ISOLATION", "A horizon composer needs its own filtered input set.", horizonId);
        }
        if (!isIsoInstant(decisionTime)) {
            raise("C025-READ-CONTRACT", "A horizon composer needs an explicit ISO decision time.", horizonId);
        }
        var declared = horizonPolicy(policy, horizonId);
        var rank = declared.rank;
        var leaked = set.filter(function (read) {
            return HORIZON_RANKS.indexOf(read.maxHorizon) < HORIZON_RANKS.indexOf(rank);
        });
        if (leaked.length > 0) {
            raise("C025-HORIZON-ISOLATION",
                "A read that may not serve this horizon reached its input set.",
                horizonId + ": " + leaked.map(function (read) { return read.dimensionId; }).join(", "));
        }
        var ownValueIds = {};
        set.forEach(function (read) {
            read.values.forEach(function (value) { ownValueIds[value.valueId] = true; });
        });
        var primary = declared.primaryDimensionIds;
        var byDimension = {};
        set.forEach(function (read) { byDimension[read.dimensionId] = read; });

        var usable = [];
        var unavailableDimensionIds = [];
        var gapReasons = [];
        primary.forEach(function (dimensionId) {
            var read = byDimension[dimensionId];
            if (!read || read.state === "unavailable" || read.state === "stale" || read.state === "conflicted") {
                unavailableDimensionIds.push(dimensionId);
                gapReasons.push(dimensionId + " (" + (read ? read.reasonCode : "not-in-set") + ")");
                return;
            }
            usable.push(read);
        });

        var signalled = usable.filter(function (read) { return read.directionalSignal !== null; });
        var subjectId = set.length > 0 ? set[0].subjectId : null;

        var direction;
        var claims = [];
        if (signalled.length === 0) {
            direction = "none";
        } else {
            var constructive = signalled.filter(function (read) { return read.directionalSignal === "constructive"; }).length;
            var pressured = signalled.filter(function (read) { return read.directionalSignal === "pressured"; }).length;
            if (constructive > pressured) direction = "constructive";
            else if (pressured > constructive) direction = "pressured";
            else direction = "flat";
            claims = signalled.map(function (read) {
                var supporting = read.values.map(function (value) { return value.valueId; });
                supporting.forEach(function (valueId) {
                    if (!ownValueIds[valueId]) {
                        raise("C025-HORIZON-ISOLATION",
                            "A claim cites a value that is not present in its own horizon input set.",
                            horizonId + ": " + valueId);
                    }
                });
                return {
                    claimId: horizonId + "-" + read.dimensionId,
                    text: read.dimensionId + " reads " + read.directionalSignal + " on " + supporting.length +
                        (supporting.length === 1 ? " value" : " values") + " as of " + String(read.asOf) + ".",
                    supportingValueIds: supporting.slice().sort()
                };
            });
            claims = sortBy(claims, function (claim) { return claim.claimId; });
        }

        var quality = qualityFromCount(signalled.length);
        if (direction !== "none" && unavailableDimensionIds.length >= 4) quality = downgrade(quality);
        if (direction === "none") {
            quality = "absent";
            claims = [];
        }

        var gapEffect = unavailableDimensionIds.length === 0
            ? "Every dimension this horizon composes from answered."
            : "These dimensions did not reach this read: " + gapReasons.slice().sort().join(", ") + ".";

        var summary;
        if (direction === "none") {
            summary = "No eligible evidence reached this horizon. " + gapEffect;
        } else {
            summary = "This horizon reads " + direction + " on " + signalled.length +
                (signalled.length === 1 ? " dimension" : " dimensions") + ", evidence " + quality + ".";
        }

        /* The named dimension and the direction it would have to reverse are read off ONE
           element, so the sentence cannot name one dimension and another dimension's reading. */
        var leadingSignal = sortBy(signalled, function (read) { return read.dimensionId; })[0];
        var invalidation = direction === "none"
            ? "This reads none until one of " + primary.slice().sort().join(", ") + " publishes an eligible read."
            : "This reading changes when " + leadingSignal.dimensionId +
                " reverses its " + leadingSignal.directionalSignal + " reading.";

        var composed = {
            contractVersion: "company-horizon-read/v1",
            horizonId: horizonId,
            subjectId: subjectId,
            question: declared.question,
            direction: direction,
            evidenceQuality: quality,
            summary: summary,
            claims: claims,
            contributingDimensionIds: sortBy(usable.map(function (read) { return read.dimensionId; }), function (id) { return id; }),
            unavailableDimensionIds: unavailableDimensionIds.slice().sort(),
            gapEffect: gapEffect,
            invalidation: invalidation,
            composedAt: decisionTime
        };
        composed.inputFingerprint = fingerprintOf({
            contractVersion: "company-horizon-input-set/v1",
            horizonId: horizonId,
            reads: set
        }, "company-horizon-input-set/v1");
        return deepFreeze(composed);
    }

    function composeImmediate(set, policy, decisionTime) { return composeHorizon("immediate", set, policy, decisionTime); }
    function composeEvent(set, policy, decisionTime) { return composeHorizon("event", set, policy, decisionTime); }
    function composeSwing(set, policy, decisionTime) { return composeHorizon("swing", set, policy, decisionTime); }
    function composeStructural(set, policy, decisionTime) { return composeHorizon("structural", set, policy, decisionTime); }

    /* ---------- contradictions ---------- */

    var OPPOSED = { constructive: "pressured", pressured: "constructive" };

    function extractContradictions(horizons) {
        var list = Array.isArray(horizons) ? horizons.filter(function (horizon) {
            return isPlainObject(horizon) && horizon.contractVersion === "company-horizon-read/v1";
        }) : [];
        var ordered = sortBy(list, function (horizon) { return horizon.horizonId; });
        var records = [];
        for (var left = 0; left < ordered.length; left += 1) {
            for (var right = left + 1; right < ordered.length; right += 1) {
                if (OPPOSED[ordered[left].direction] === ordered[right].direction) {
                    records.push({
                        contractVersion: "company-contradiction/v1",
                        contradictionId: ordered[left].horizonId + "-vs-" + ordered[right].horizonId,
                        subjectId: ordered[left].subjectId,
                        horizonIds: [ordered[left].horizonId, ordered[right].horizonId],
                        directions: [ordered[left].direction, ordered[right].direction],
                        statement: "The " + ordered[left].horizonId + " horizon reads " + ordered[left].direction +
                            " while the " + ordered[right].horizonId + " horizon reads " + ordered[right].direction +
                            ". Both readings stand; neither is averaged away."
                    });
                }
            }
        }
        return deepFreeze(sortBy(records, function (record) { return record.contradictionId; }));
    }

    /* ---------- company events ---------- */

    var EVENT_FILE_CONTRACT = "company-event-file/v1";
    /* A date class the committed file may declare. `occurred` is deliberately absent: whether
       something has happened is decided by comparing its date against the run's own decisionTime,
       never by trusting a file that was written at some other moment. */
    var DECLARABLE_DATE_CLASSES = ["scheduled", "estimated", "revised"];

    /* The chosen keyless public source. Rows are read out of band from the SEC EDGAR company
       submissions endpoint, verified once, and committed under data/company-intelligence/, so
       this module still performs no network call and the route issues no external request.

       Two rules make the output honest. A date that precedes the run's decisionTime is an
       outcome, never a forecast, so it is reclassified to `occurred` and carries whatever was
       observed. A date the committed file merely inferred stays `estimated` and keeps the basis
       of the inference, so a guess is never presented as a calendar fact.

       Neither sourceUrl nor asOf is ever inherited from the file header. A row that carries no
       source of its own must fail the event contract rather than borrow the header's, because
       borrowing is exactly how an unsourced non-financial event would slip into the rendered
       set wearing someone else's provenance. */
    function publicScheduleSource(subject, sources, decisionTime) {
        if (!isPlainObject(subject) || subject.contractVersion !== "company-subject/v1") {
            raise("C025-READ-CONTRACT", "The public schedule source needs a resolved company subject.");
        }
        if (!isIsoInstant(decisionTime)) {
            raise("C025-READ-CONTRACT", "The public schedule source needs an explicit ISO decision time.");
        }
        var file = isPlainObject(sources) ? sources.committedEvents : null;
        /* No committed file is a normal outcome. The dimension states the absence itself. */
        if (!isPlainObject(file) || file.contractVersion !== EVENT_FILE_CONTRACT) return deepFreeze([]);
        /* A file naming another company answers this subject with nothing rather than
           lending it dates that were never about it. */
        if (file.subjectId !== subject.subjectId) return deepFreeze([]);
        var today = decisionTime.slice(0, 10);
        var rows = Array.isArray(file.events) ? file.events : [];
        var produced = rows.map(function (row) {
            var declared = isPlainObject(row) ? row.dateClass : null;
            var hasDate = isPlainObject(row) && isIsoDate(row.date);
            var forward = contains(DECLARABLE_DATE_CLASSES, declared) ? declared : "unavailable";
            var passed = hasDate && forward !== "unavailable" && row.date < today;
            var dateClass = passed ? "occurred" : forward;
            return {
                contractVersion: "company-event/v1",
                subjectId: file.subjectId,
                eventId: isPlainObject(row) ? row.eventId : null,
                eventType: isPlainObject(row) ? row.eventType : null,
                eventClass: isPlainObject(row) ? row.eventClass : null,
                date: hasDate ? row.date : null,
                dateClass: dateClass,
                estimateBasis: dateClass === "estimated" && isNonEmptyString(row.estimateBasis) ? row.estimateBasis : null,
                sourceClass: "committed-file",
                sourceName: isNonEmptyString(row.sourceName) ? row.sourceName : (isNonEmptyString(file.sourceName) ? file.sourceName : null),
                sourceUrl: isNonEmptyString(row.sourceUrl) ? row.sourceUrl : null,
                asOf: isIsoDate(row.asOf) ? row.asOf : null,
                effectHorizonId: contains(HORIZON_IDS, row.effectHorizonId) ? row.effectHorizonId : null,
                /* An outcome is only ever attached to something that has already happened. */
                observedOutcome: dateClass === "occurred" && isNonEmptyString(row.observedOutcome) ? row.observedOutcome : null
            };
        });
        return deepFreeze(sortBy(produced, function (event) { return String(event.date) + ":" + String(event.eventId); }));
    }

    function validateCompanyEvent(event) {
        if (!isPlainObject(event) || event.contractVersion !== "company-event/v1") {
            return makeError("C025-READ-CONTRACT", "The event does not declare the company event contract.");
        }
        if (!isNonEmptyString(event.eventId) || !isNonEmptyString(event.eventType) ||
            !contains(["financial", "non-financial"], event.eventClass)) {
            return makeError("C025-READ-CONTRACT", "The event declares no identity, type or class.",
                "event: " + String(event.eventId));
        }
        if (!contains(DATE_CLASSES, event.dateClass)) {
            return makeError("C025-READ-CONTRACT", "The event declares an unknown date class.",
                "event: " + event.eventId);
        }
        /* Every event states where its date came from, so a reader is never left guessing
           whether a rendered date was filed, cached or inferred. */
        if (!contains(SOURCE_CLASSES, event.sourceClass)) {
            return makeError("C025-READ-CONTRACT", "The event declares no known source class.",
                "event: " + event.eventId);
        }
        if (event.dateClass !== "unavailable" && !isIsoDate(event.date)) {
            return makeError("C025-READ-CONTRACT", "The event declares a date class without a date.",
                "event: " + event.eventId);
        }
        /* An estimated date without a stated basis is a guess presented as a calendar fact. */
        if (event.dateClass === "estimated" && !isNonEmptyString(event.estimateBasis)) {
            return makeError("C025-READ-CONTRACT", "An estimated event date carries no estimate basis.",
                "event: " + event.eventId);
        }
        if (event.eventClass === "non-financial" && (!isNonEmptyString(event.sourceUrl) || !isIsoDate(event.asOf))) {
            return makeError("C025-READ-CONTRACT", "A non-financial event carries no source url and as-of pair.",
                "event: " + event.eventId);
        }
        return null;
    }

    function selectRenderableEvents(events) {
        var list = Array.isArray(events) ? events : [];
        var renderable = [];
        var refusals = [];
        list.forEach(function (event) {
            var refusal = validateCompanyEvent(event);
            if (refusal) {
                refusals.push(refusal);
                return;
            }
            renderable.push({
                contractVersion: "company-event/v1",
                subjectId: event.subjectId,
                eventId: event.eventId,
                eventType: event.eventType,
                eventClass: event.eventClass,
                date: event.date,
                dateClass: event.dateClass,
                estimateBasis: isNonEmptyString(event.estimateBasis) ? event.estimateBasis : null,
                sourceClass: event.sourceClass,
                sourceName: isNonEmptyString(event.sourceName) ? event.sourceName : null,
                sourceUrl: isNonEmptyString(event.sourceUrl) ? event.sourceUrl : null,
                asOf: isIsoDate(event.asOf) ? event.asOf : null,
                effectHorizonId: contains(HORIZON_IDS, event.effectHorizonId) ? event.effectHorizonId : null,
                observedOutcome: isNonEmptyString(event.observedOutcome) ? event.observedOutcome : null
            });
        });
        return deepFreeze({
            contractVersion: "company-event-selection/v1",
            events: sortBy(renderable, function (event) { return event.date + ":" + event.eventId; }),
            refusals: sortBy(refusals, function (refusal) { return String(refusal.detail); })
        });
    }

    /* An upcoming catalyst is something still ahead of the run. Splitting the renderable set in
       two is the whole point: a date that has passed is an outcome to be judged against, and
       leaving it in the catalyst list would keep presenting a finished event as a forecast. */
    function selectUpcomingCatalysts(selection, decisionTime) {
        if (!isPlainObject(selection) || selection.contractVersion !== "company-event-selection/v1") {
            raise("C025-READ-CONTRACT", "The catalyst view needs a validated event selection.");
        }
        if (!isIsoInstant(decisionTime)) {
            raise("C025-READ-CONTRACT", "The catalyst view needs an explicit ISO decision time.");
        }
        var today = decisionTime.slice(0, 10);
        var upcoming = [];
        var occurred = [];
        selection.events.forEach(function (event) {
            if (event.dateClass === "occurred" || (isIsoDate(event.date) && event.date < today)) occurred.push(event);
            else upcoming.push(event);
        });
        var subjectId = selection.events.length > 0 ? selection.events[0].subjectId : null;
        return deepFreeze({
            contractVersion: "company-upcoming-catalysts/v1",
            subjectId: subjectId,
            decisionTime: decisionTime,
            upcoming: sortBy(upcoming, function (event) { return String(event.date) + ":" + event.eventId; }),
            occurred: sortBy(occurred, function (event) { return String(event.date) + ":" + event.eventId; }),
            /* An empty list says why it is empty, so the region never reads as an omission. */
            emptyReason: upcoming.length > 0 ? null
                : (selection.events.length === 0
                    ? "No company event reached this run, so no catalyst can be listed."
                    : "Every sourced event has already passed, so no dated catalyst lies ahead of this run.")
        });
    }

    /* ---------- adaptive research plan ---------- */

    function validateBranch(branch, index, maxBranches) {
        if (!isPlainObject(branch)) {
            return makeError("C025-PLAN-SCHEMA", "Research branch " + index + " is not an object.");
        }
        var missing = MANDATORY_BRANCH_FIELDS.filter(function (field) {
            var value = branch[field];
            if (field === "consulted") return !Array.isArray(value) || value.length === 0;
            if (field === "relevance") return !isPlainObject(value) || !contains(HORIZON_IDS, value.horizonId);
            return !isNonEmptyString(value);
        });
        if (missing.length > 0) {
            return makeError("C025-PLAN-SCHEMA",
                "Research branch " + index + " omits a mandatory field, so it cannot be published.",
                "missing: " + missing.join(", "));
        }
        if (!contains(DISPOSITIONS, branch.disposition)) {
            return makeError("C025-PLAN-SCHEMA", "Research branch " + index + " declares an unknown disposition.",
                "disposition: " + String(branch.disposition));
        }
        if (!contains(STOPPED_BY, branch.stoppedBy)) {
            return makeError("C025-PLAN-SCHEMA", "Research branch " + index + " declares an unknown stop authority.",
                "stoppedBy: " + String(branch.stoppedBy));
        }
        if (branch.disposition === "refused" &&
            (!isNonEmptyString(branch.refusalReason) || (Array.isArray(branch.changedTargets) && branch.changedTargets.length > 0))) {
            return makeError("C025-PLAN-SCHEMA",
                "A refused branch needs a stated reason and must change nothing.",
                "branch: " + branch.branchId);
        }
        if (index >= maxBranches) {
            return makeError("C025-PLAN-BUDGET",
                "Research branch " + index + " exceeds the declared branch budget of " + maxBranches + ".",
                "branch: " + String(branch.branchId));
        }
        return null;
    }

    function attachResearchPlan(subject, sources) {
        if (!isPlainObject(subject) || subject.contractVersion !== "company-subject/v1") {
            raise("C025-READ-CONTRACT", "A research plan needs a resolved company subject.");
        }
        var maxBranches = branchBudgetOf(sources);
        var committed = isPlainObject(sources) && isPlainObject(sources.committedPlan) ? sources.committedPlan : null;
        if (!committed || !Array.isArray(committed.branches) || committed.branches.length === 0) {
            return emptyPlan(subject.subjectId, maxBranches, "none", "floor-was-sufficient", []);
        }
        if (committed.subjectId !== subject.subjectId) {
            return emptyPlan(subject.subjectId, maxBranches, "committed-file", "plan-names-another-company", [
                makeError("C025-READ-COMPANY-MISMATCH",
                    "The committed research plan names a different company.",
                    "plan subject: " + String(committed.subjectId))
            ]);
        }
        return normalizePlan(subject.subjectId, maxBranches, committed.branches, "committed-file", null, null);
    }

    /* The second plan source at the same extension point. Increment A read a plan the repository
       had already committed; this one publishes branches the Research Agent authored for this
       decision, so the record must also name who authored it and when. An unsigned plan is
       refused rather than published as an anonymous one. */
    function agentAuthoredPlanSource(subject, sources) {
        if (!isPlainObject(subject) || subject.contractVersion !== "company-subject/v1") {
            raise("C025-READ-CONTRACT", "An authored research plan needs a resolved company subject.");
        }
        var maxBranches = branchBudgetOf(sources);
        var authored = isPlainObject(sources) && isPlainObject(sources.authoredPlan) ? sources.authoredPlan : null;
        if (!authored || !Array.isArray(authored.branches) || authored.branches.length === 0) {
            return emptyPlan(subject.subjectId, maxBranches, "none", "floor-was-sufficient", []);
        }
        if (authored.contractVersion !== "company-authored-plan/v1") {
            return emptyPlan(subject.subjectId, maxBranches, "agent-authored", "authorship-not-recorded", [
                makeError("C025-PLAN-SCHEMA",
                    "The authored research plan does not declare the authored-plan contract.",
                    "contractVersion: " + String(authored.contractVersion))
            ]);
        }
        if (authored.subjectId !== subject.subjectId) {
            return emptyPlan(subject.subjectId, maxBranches, "agent-authored", "plan-names-another-company", [
                makeError("C025-READ-COMPANY-MISMATCH",
                    "The authored research plan names a different company.",
                    "plan subject: " + String(authored.subjectId))
            ]);
        }
        if (!isNonEmptyString(authored.authoredBy) || !isIsoDate(authored.authoredAt)) {
            return emptyPlan(subject.subjectId, maxBranches, "agent-authored", "authorship-not-recorded", [
                makeError("C025-PLAN-SCHEMA",
                    "An authored research plan must name its author and the date it was authored.",
                    "authoredBy: " + String(authored.authoredBy) + ", authoredAt: " + String(authored.authoredAt))
            ]);
        }
        return normalizePlan(subject.subjectId, maxBranches, authored.branches, "agent-authored",
            authored.authoredBy, authored.authoredAt);
    }

    function branchBudgetOf(sources) {
        var maxBranches = isPlainObject(sources) && Number.isInteger(sources.maxBranches) && sources.maxBranches > 0
            ? sources.maxBranches : null;
        if (maxBranches === null) {
            raise("C025-CONFIG-SCHEMA", "A research plan needs the declared branch budget from the configuration.");
        }
        return maxBranches;
    }

    function emptyPlan(subjectId, maxBranches, planSource, emptyReason, refusals) {
        return deepFreeze({
            contractVersion: "company-research-plan/v1",
            subjectId: subjectId,
            planSource: planSource,
            authoredBy: null,
            authoredAt: null,
            maxBranches: maxBranches,
            branches: [],
            refusals: refusals,
            budgetRemaining: maxBranches,
            emptyReason: emptyReason
        });
    }

    /* Both plan sources publish the same record, so a branch is validated and normalized in one
       place. A second normalizer would let the two sources drift apart on the six mandatory
       fields, which is exactly the drift the schema refusal exists to prevent. */
    function normalizePlan(subjectId, maxBranches, rawBranches, planSource, authoredBy, authoredAt) {
        var branches = [];
        var refusals = [];
        rawBranches.forEach(function (branch, index) {
            var refusal = validateBranch(branch, index, maxBranches);
            if (refusal) {
                refusals.push(refusal);
                return;
            }
            branches.push({
                contractVersion: "company-research-branch/v1",
                branchId: isNonEmptyString(branch.branchId) ? branch.branchId : "branch-" + (index + 1),
                question: branch.question,
                relevance: {
                    horizonId: branch.relevance.horizonId,
                    claimId: isNonEmptyString(branch.relevance.claimId) ? branch.relevance.claimId : null
                },
                consulted: branch.consulted.map(function (entry) {
                    return {
                        kind: isNonEmptyString(entry && entry.kind) ? entry.kind : "unstated",
                        ref: isNonEmptyString(entry && entry.ref) ? entry.ref : "unstated",
                        deepLink: isNonEmptyString(entry && entry.deepLink) ? entry.deepLink : null
                    };
                }),
                result: branch.result,
                disposition: branch.disposition,
                changedTargets: Array.isArray(branch.changedTargets) ? branch.changedTargets.map(function (target) {
                    return {
                        horizonId: target && target.horizonId,
                        field: target && target.field,
                        from: target && target.from,
                        to: target && target.to
                    };
                }) : [],
                refusalReason: isNonEmptyString(branch.refusalReason) ? branch.refusalReason : null,
                stopCondition: branch.stopCondition,
                stoppedBy: branch.stoppedBy
            });
        });
        return deepFreeze({
            contractVersion: "company-research-plan/v1",
            subjectId: subjectId,
            planSource: planSource,
            authoredBy: isNonEmptyString(authoredBy) ? authoredBy : null,
            authoredAt: isIsoDate(authoredAt) ? authoredAt : null,
            maxBranches: maxBranches,
            branches: branches,
            refusals: sortBy(refusals, function (refusal) { return refusal.code + ":" + String(refusal.detail); }),
            /* A refused branch still consumed real evaluation work, so it counts against the
               budget. Not counting it would make refusal a free retry. company-intelligence.config.json
               records that decision under refusedBranchCounting with its rationale. */
            budgetRemaining: Math.max(0, maxBranches - rawBranches.length),
            emptyReason: branches.length === 0 ? "every-branch-refused" : null
        });
    }

    /* ---------- read version ---------- */

    function buildReadVersion(parts, decisionTime) {
        if (!isPlainObject(parts)) raise("C025-READ-CONTRACT", "A read version needs its composed parts.");
        if (!isIsoInstant(decisionTime)) raise("C025-READ-CONTRACT", "A read version needs an explicit ISO decision time.");
        var subject = parts.subject;
        if (!isPlainObject(subject) || subject.contractVersion !== "company-subject/v1") {
            raise("C025-READ-CONTRACT", "A read version needs a resolved company subject.");
        }
        var horizons = sortBy(Array.isArray(parts.horizons) ? parts.horizons : [], function (horizon) { return horizon.horizonId; });
        if (horizons.length !== HORIZON_IDS.length) {
            raise("C025-READ-CONTRACT", "A read version needs all four horizon reads.",
                "received: " + horizons.length);
        }
        if (!isPlainObject(parts.coverageAccount) || parts.coverageAccount.contractVersion !== "company-coverage-account/v1") {
            raise("C025-READ-CONTRACT", "A read version needs a coverage account.");
        }
        if (!isPlainObject(parts.evidenceFamilies) || parts.evidenceFamilies.contractVersion !== "company-evidence-family-group/v1") {
            raise("C025-READ-CONTRACT", "A read version needs an evidence family grouping.");
        }
        if (!isPlainObject(parts.researchPlan) || parts.researchPlan.contractVersion !== "company-research-plan/v1") {
            raise("C025-READ-CONTRACT", "A read version needs a research plan, even an empty one.");
        }
        if (!isPlainObject(parts.events) || parts.events.contractVersion !== "company-event-selection/v1") {
            raise("C025-READ-CONTRACT", "A read version needs an event selection, even an empty one.");
        }
        var body = {
            contractVersion: "company-read-version/v1",
            versionId: subject.subjectId + ":" + decisionTime.slice(0, 10),
            subjectId: subject.subjectId,
            composedAt: decisionTime,
            priorVersionId: isNonEmptyString(parts.priorVersionId) ? parts.priorVersionId : null,
            subject: subject,
            horizons: horizons,
            coverageAccount: parts.coverageAccount,
            evidenceFamilies: parts.evidenceFamilies,
            contradictions: Array.isArray(parts.contradictions) ? parts.contradictions : [],
            researchPlan: parts.researchPlan,
            events: parts.events,
            refusals: sortBy(Array.isArray(parts.refusals) ? parts.refusals : [], function (refusal) {
                return refusal.code + ":" + String(refusal.detail);
            })
        };
        var version = JSON.parse(JSON.stringify(body));
        version.contentFingerprint = fingerprintOf(body, "company-read-version/v1");
        return deepFreeze(version);
    }

    /* ---------- append-only version tree ---------- */

    /* A version id carries colons, which a committed file name should not. One helper owns that
       translation so the reader, the writer and the route can never disagree about a path. */
    function versionPathsFor(subjectId, versionId) {
        if (!isNonEmptyString(subjectId)) {
            raise("C025-READ-CONTRACT", "A version path needs a resolved subject id.");
        }
        var folder = "data/company-intelligence/" + subjectId.replace(/:/g, "-");
        return {
            root: folder,
            currentPointer: folder + "/current.json",
            authoredPlan: folder + "/plan-authored.json",
            version: isNonEmptyString(versionId) ? folder + "/versions/" + versionId.replace(/:/g, "-") + ".json" : null
        };
    }

    /* The committed history this subject already carries. The route fetches the files and hands
       them over; the module verifies each record against the fingerprint it shipped with, so a
       silently edited prior version surfaces as a refusal rather than as history. */
    function readVersionHistory(subject, sources) {
        if (!isPlainObject(subject) || subject.contractVersion !== "company-subject/v1") {
            raise("C025-READ-CONTRACT", "A version history needs a resolved company subject.");
        }
        var tree = isPlainObject(sources) && isPlainObject(sources.versionTree) ? sources.versionTree : null;
        var records = tree && Array.isArray(tree.versions) ? tree.versions : [];
        var pointer = tree && isPlainObject(tree.pointer) ? tree.pointer : null;
        var refusals = [];
        var versions = [];
        records.forEach(function (record, index) {
            if (!isPlainObject(record) || record.contractVersion !== "company-read-version/v1" ||
                !isNonEmptyString(record.versionId) || !isIsoInstant(record.composedAt)) {
                refusals.push(makeError("C025-READ-CONTRACT",
                    "A committed version record fails the read-version contract, so it is not shown as history.",
                    "index: " + index));
                return;
            }
            if (record.subjectId !== subject.subjectId) {
                refusals.push(makeError("C025-READ-COMPANY-MISMATCH",
                    "A committed version record names a different company.",
                    "version: " + record.versionId));
                return;
            }
            var body = {};
            Object.keys(record).forEach(function (key) {
                if (key !== "contentFingerprint") body[key] = record[key];
            });
            var recomputed = fingerprintOf(body, "company-read-version/v1");
            if (record.contentFingerprint !== recomputed) {
                refusals.push(makeError("C025-READ-CONTRACT",
                    "A committed version record no longer matches the fingerprint it shipped with.",
                    "version: " + record.versionId));
                return;
            }
            versions.push({
                versionId: record.versionId,
                composedAt: record.composedAt,
                priorVersionId: isNonEmptyString(record.priorVersionId) ? record.priorVersionId : null,
                contentFingerprint: record.contentFingerprint,
                path: versionPathsFor(subject.subjectId, record.versionId).version
            });
        });
        var known = versions.map(function (entry) { return entry.versionId; });
        var currentVersionId = null;
        if (pointer !== null) {
            if (pointer.contractVersion !== "company-version-pointer/v1" || pointer.subjectId !== subject.subjectId ||
                !contains(known, pointer.versionId)) {
                refusals.push(makeError("C025-READ-CONTRACT",
                    "The committed pointer does not name a readable version of this company, so no current version is claimed.",
                    "pointer: " + String(pointer.versionId)));
            } else {
                currentVersionId = pointer.versionId;
            }
        }
        return deepFreeze({
            contractVersion: "company-version-history/v1",
            subjectId: subject.subjectId,
            currentVersionId: currentVersionId,
            versions: sortBy(versions, function (entry) { return entry.versionId; }),
            refusals: sortBy(refusals, function (refusal) { return refusal.code + ":" + String(refusal.detail); }),
            emptyReason: versions.length === 0 ? "no-committed-version" : null
        });
    }

    /* The append-only writer. The module owns no filesystem, so it returns the operations the
       caller must perform rather than performing them. That is what makes the append-only
       guarantee assertable: untouchedPaths lists every prior version file, and no operation may
       name one. A run that would re-author an already-committed dated version is refused. */
    function planVersionWrite(version, history) {
        if (!isPlainObject(version) || version.contractVersion !== "company-read-version/v1") {
            raise("C025-READ-CONTRACT", "A version write plan needs a composed read version.");
        }
        if (!isPlainObject(history) || history.contractVersion !== "company-version-history/v1") {
            raise("C025-READ-CONTRACT", "A version write plan needs the committed version history.");
        }
        if (version.subjectId !== history.subjectId) {
            return makeError("C025-READ-COMPANY-MISMATCH",
                "The composed version and the committed history name different companies.",
                "version: " + version.subjectId + ", history: " + history.subjectId);
        }
        if (version.priorVersionId !== history.currentVersionId) {
            return makeError("C025-READ-CONTRACT",
                "The composed version does not reference the version the pointer currently names, so the chain would break.",
                "version prior: " + String(version.priorVersionId) + ", pointer: " + String(history.currentVersionId));
        }
        var existing = history.versions.map(function (entry) { return entry.path; });
        var paths = versionPathsFor(version.subjectId, version.versionId);
        if (contains(existing, paths.version)) {
            return makeError("C025-READ-CONTRACT",
                "A version carrying this date is already committed, so this run may not author it again.",
                "version: " + version.versionId);
        }
        return deepFreeze({
            contractVersion: "company-version-write-plan/v1",
            subjectId: version.subjectId,
            versionId: version.versionId,
            priorVersionId: version.priorVersionId,
            operations: [
                { operation: "create", path: paths.version, body: version },
                {
                    operation: "advance-pointer",
                    path: paths.currentPointer,
                    body: {
                        contractVersion: "company-version-pointer/v1",
                        subjectId: version.subjectId,
                        versionId: version.versionId,
                        priorVersionId: version.priorVersionId,
                        contentFingerprint: version.contentFingerprint
                    }
                }
            ],
            untouchedPaths: sortBy(existing, function (path) { return path; }),
            refusals: []
        });
    }

    /* ---------- publication ---------- */

    function buildToolReadObject(version, decisionTime) {
        var totals = version.coverageAccount.totals;
        var answered = totals.current + totals.partial;
        var availability = answered === 0 ? "unavailable" : (totals.current === 0 ? "stale" : "current");
        var asOfCandidates = version.coverageAccount.rows
            .filter(function (row) { return (row.state === "current" || row.state === "partial") && isIsoDate(row.asOf); })
            .map(function (row) { return row.asOf; })
            .sort();
        var asOf = availability === "unavailable" || asOfCandidates.length === 0
            ? null : asOfCandidates[asOfCandidates.length - 1] + "T00:00:00.000Z";
        var freshUntil = asOf === null ? null : new Date(Date.parse(asOf) + 7 * 86400000).toISOString();
        /* putToolRead refuses a stale or current availability whose clocks are absent, and it
           drops all three clocks when the key set drifts. Both are settled here in one place. */
        if (availability !== "unavailable" && asOf === null) availability = "unavailable";
        var horizonWords = sortBy(version.horizons, function (horizon) { return horizon.horizonId; })
            .map(function (horizon) { return horizon.horizonId + " " + horizon.direction; })
            .join(", ");
        var source = {
            contractVersion: "rl-tool-read/v1",
            id: TOOL_ID,
            availability: availability,
            asOf: availability === "unavailable" ? null : asOf,
            computedAt: decisionTime,
            freshUntil: availability === "unavailable" ? null : freshUntil,
            read: version.subject.ticker + ": " + horizonWords + ".",
            metrics: {
                subjectId: version.subjectId,
                horizonSummaries: sortBy(version.horizons, function (horizon) { return horizon.horizonId; })
                    .map(function (horizon) {
                        return { horizonId: horizon.horizonId, direction: horizon.direction, evidenceQuality: horizon.evidenceQuality };
                    }),
                coverageTotals: totals,
                contradictionCount: version.contradictions.length,
                contentFingerprint: version.contentFingerprint
            },
            deepLink: "company-intelligence-lab.html?symbol=" + version.subject.ticker
        };
        var assembled = {};
        TOOL_READ_KEYS.forEach(function (key) { assembled[key] = source[key]; });
        return assembled;
    }

    function publishToolRead(version, rldata) {
        if (!isPlainObject(version) || version.contractVersion !== "company-read-version/v1") {
            raise("C025-READ-CONTRACT", "Publication needs a composed read version.");
        }
        if (!isPlainObject(version.coverageAccount) || version.coverageAccount.readiness !== "established") {
            return makeError("C025-PUBLISH-LOSSY",
                "The coverage account is not established, so no ordinary shared tool read was published.");
        }
        if (!rldata || typeof rldata.putToolRead !== "function" || typeof rldata.toolRead !== "function") {
            return makeError("C025-PUBLISH-LOSSY",
                "The shared data channel exposes no verifiable publication path, so nothing was published.");
        }
        var candidate = buildToolReadObject(version, version.composedAt);
        var keys = Object.keys(candidate).sort();
        if (JSON.stringify(keys) !== JSON.stringify(TOOL_READ_KEYS.slice().sort())) {
            return makeError("C025-PUBLISH-LOSSY",
                "The assembled read does not carry exactly the nine contracted keys, so nothing was published.",
                "keys: " + keys.join(", "));
        }
        var written = rldata.putToolRead(TOOL_ID, candidate);
        if (!isPlainObject(written)) {
            return makeError("C025-PUBLISH-LOSSY",
                "The shared channel rejected the read, so nothing was published.");
        }
        var storedBack = rldata.toolRead(TOOL_ID);
        if (!isPlainObject(storedBack)) {
            return makeError("C025-PUBLISH-LOSSY",
                "The published read could not be read back, so it must not be reported as published.");
        }
        var before = canonical(candidate, "rl-tool-read/v1");
        var after;
        try {
            after = canonical(storedBack, "rl-tool-read/v1");
        } catch (error) {
            return makeError("C025-PUBLISH-LOSSY",
                "The stored read is not canonicalizable, so the round trip cannot be verified.",
                error.message);
        }
        if (before !== after) {
            return makeError("C025-PUBLISH-LOSSY",
                "The published read did not round trip intact, so it must not be reported as published.",
                "stored keys: " + Object.keys(storedBack).sort().join(", "));
        }
        return deepFreeze(JSON.parse(JSON.stringify(storedBack)));
    }

    return {
        CONTRACT_VERSION: "company-intelligence/v1",
        CONFIG_VERSION: CONFIG_VERSION,
        TOOL_ID: TOOL_ID,
        EVIDENCE_STATES: Object.freeze(EVIDENCE_STATES.slice()),
        HORIZON_RANKS: Object.freeze(HORIZON_RANKS.slice()),
        HORIZON_IDS: Object.freeze(HORIZON_IDS.slice()),
        SOURCE_CLASSES: Object.freeze(SOURCE_CLASSES.slice()),
        PROVENANCE_CLASSES: Object.freeze(PROVENANCE_CLASSES.slice()),
        DIRECTIONS: Object.freeze(DIRECTIONS.slice()),
        EVIDENCE_QUALITIES: Object.freeze(EVIDENCE_QUALITIES.slice()),
        DATE_CLASSES: Object.freeze(DATE_CLASSES.slice()),
        DISPOSITIONS: Object.freeze(DISPOSITIONS.slice()),
        STOPPED_BY: Object.freeze(STOPPED_BY.slice()),
        COVERAGE_READINESS_STATES: Object.freeze(COVERAGE_READINESS_STATES.slice()),
        REASON_CODES: Object.freeze(REASON_CODES.slice()),
        ERROR_CODES: Object.freeze(ERROR_CODES.slice()),
        MANDATORY_DIMENSION_IDS: Object.freeze(MANDATORY_DIMENSION_IDS.slice()),
        MANDATORY_BRANCH_FIELDS: Object.freeze(MANDATORY_BRANCH_FIELDS.slice()),
        TOOL_READ_KEYS: Object.freeze(TOOL_READ_KEYS.slice()),
        ADAPTER_IDS: Object.freeze(ADAPTERS.map(function (adapter) { return adapter.adapterId; })),
        resolveSubject: resolveSubject,
        refuseInput: refuseInput,
        readCoverageRegistry: readCoverageRegistry,
        describeDimensionOwner: describeDimensionOwner,
        runAdapters: runAdapters,
        buildCoverageAccount: buildCoverageAccount,
        groupEvidenceFamilies: groupEvidenceFamilies,
        partitionByHorizon: partitionByHorizon,
        composeImmediate: composeImmediate,
        composeEvent: composeEvent,
        composeSwing: composeSwing,
        composeStructural: composeStructural,
        extractContradictions: extractContradictions,
        publicScheduleSource: publicScheduleSource,
        selectRenderableEvents: selectRenderableEvents,
        selectUpcomingCatalysts: selectUpcomingCatalysts,
        eventsPathFor: eventsPathFor,
        attachResearchPlan: attachResearchPlan,
        agentAuthoredPlanSource: agentAuthoredPlanSource,
        buildReadVersion: buildReadVersion,
        versionPathsFor: versionPathsFor,
        readVersionHistory: readVersionHistory,
        planVersionWrite: planVersionWrite,
        publishToolRead: publishToolRead
    };
});
