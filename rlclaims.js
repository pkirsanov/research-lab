/*
 * rlclaims.js — Feature 015 frozen claim contract (`brief-recommendation-claim/v1`).
 *
 * Records, at the moment of proposal, exactly what a recommendation claimed and exactly what
 * would make it right or wrong: subject, direction, thesis, resolution predicate, horizon, and
 * outcome-magnitude definition. `claimHash` covers all nine of those terms and excludes exactly
 * five provenance fields, so re-proposing identical terms reuses the identical object and
 * amendment is structurally impossible rather than merely discouraged.
 *
 * Two refusals carry the weight here. A write that would change the bytes at an existing
 * content address aborts with RTR-PREDICATE-AMEND rather than overwriting, because a silently
 * rewritten predicate is a scoring lie that leaves no trace. And the minter refuses rather than
 * guesses: an authored subject is prose and is UNUSABLE as a series lookup, so resolution reads
 * only `resolvesTo` and no ticker is ever parsed out of prose — inferring one would score the
 * funding leg of a rotation as though the claim were long it.
 *
 * Absence is not an error. Each of the seven mint reasons names the field that caused it and the
 * claim is still minted and still counted, so the coverage line can say WHICH input was missing
 * instead of showing one opaque bucket. Dropping a call because an input was absent would shrink
 * the denominator in the direction that flatters.
 *
 * It also carries the LEDGER ROW side of the same pointer: `claimRef`, one optional member added
 * to the existing `brief-recommendation-history-row/v2`, and the dual-version reader that accepts
 * `v1` and `v2` alike. That lives here rather than in `rlcontracts.js` because `rlcontracts.js` is
 * Feature 002-owned and read-only to this feature, and because `claimRef` is a pointer at the
 * `claimHash` this module already mints — splitting the two halves of one pointer across two
 * modules is how they drift.
 */
(function (factory) {
    "use strict";

    var api = Object.freeze(factory());
    if (typeof module === "object" && module && module.exports) {
        module.exports = api;
        return;
    }
    var root = typeof globalThis === "object" && globalThis ? globalThis : this;
    root.RLCLAIMS = api;
})(function () {
    "use strict";

    var CONTRACT_VERSION = "brief-recommendation-claim/v1";
    var CLAIM_INPUT_CONTRACT_VERSION = "brief-action-claim-input/v1";
    var RECOMMENDATION_KEY_CONTRACT_VERSION = "brief-distributed-reckey/v1";

    /* The refusal code for a byte-changing write at an existing content address. */
    var PREDICATE_AMEND_CODE = "RTR-PREDICATE-AMEND";
    /* The code carried by every contract violation (an out-of-vocabulary or mis-bound value). */
    var CONTRACT_VIOLATION_CODE = "RTR-CLAIM-CONTRACT";

    /* ── The six closed vocabularies ────────────────────────────────────────────────────────
       Frozen module constants, never literals at a call site. An unrecognised value refuses; it
       is never coerced and never passes through. */
    var SUBJECT_KINDS = Object.freeze(["instrument", "basket", "sector", "aggregate"]);
    var PREDICATE_KINDS = Object.freeze(["threshold", "relative", "directional", "spread"]);
    var PREDICATE_COMPARATORS = Object.freeze(["gte", "lte", "gt", "lt", "crosses-above", "crosses-below"]);
    var HORIZON_KINDS = Object.freeze(["intraday", "next-session", "multi-session", "event-bound"]);
    var MAGNITUDE_UNITS = Object.freeze(["percent-return"]);
    var SIGN_CONVENTIONS = Object.freeze(["direction-adjusted"]);
    /* Frozen at proposal, never chosen at scoring time: an equal-weighted basket and a
       primary-only basket are different measurements, not different renderings of one. */
    var SUBJECT_WEIGHTINGS = Object.freeze(["equal", "primary-only"]);

    /* The nine hashed terms and the complete five-field unhashed set. With `claimHash` — the
       digest, which cannot contain itself — they partition all fifteen declared fields of the
       contract exhaustively, so no field sits outside the partition. There is no unhashed block;
       the block withdrawn by the 2026-08-18 Claim-Identity Reconciliation is not authored,
       declared, or referenced anywhere in this feature.

       `notEvaluable` is unhashed by the 2026-08-18 Mint-Evaluability Reconciliation. It answers
       HOW THIS CLAIM GOT HERE, not what it asserts, and hashing it would give one authored call
       two content addresses once its series lands — and so two entries in the denominator. */
    var HASHED_TERMS = Object.freeze([
        "contractVersion", "recommendationKey", "subject", "actionFamily",
        "direction", "thesisFamily", "predicate", "horizon", "magnitude"
    ]);
    var UNHASHED_FIELDS = Object.freeze([
        "proposalRunId", "proposalEventId", "proposedAt", "citedToolId", "notEvaluable"
    ]);

    /* The closed mint reason set. Each names the field that caused it. A claim carrying one of
       these is still minted and still written — it is not evaluable, not absent. */
    var MINT_REFUSALS = Object.freeze([
        "non-semantic-subject",
        "no-authored-subject",
        "no-committed-series",
        "no-authored-thesis-family",
        "no-authored-horizon",
        "no-authored-predicate",
        "neutral-direction-no-magnitude"
    ]);

    /* ── The ledger row contract ────────────────────────────────────────────────────────────
       Both row versions are Feature 002-owned identifiers. Feature 015 READS them and adds
       exactly ONE optional member to the EXISTING `…/v2`: `claimRef`, an opaque `sha256:…`
       pointer at the claim minted in the same pass. No `v3` is minted, no existing field is
       touched, and no committed row is rewritten, migrated or re-hashed.

       `v1` stays CLOSED at its measured seven fields — one shape across all 240 committed `v1`
       rows. A `v1` row carrying `claimRef` is refused as an unknown field, and that refusal is
       what keeps the version stamp meaningful: without it the stamp would be decoration, because
       any row could then carry any field and still claim to be `v1`.

       `v2` is NOT a closed list and never was. Measured over the 1,140 committed `v2` rows on
       2026-08-19 it presents a 32-key union across three live shapes (17 / 25 / 27 keys), of
       which 12 appear in every row and 20 are optional. `claimRef` becomes the twenty-first
       optional member — which is why this is one field on a contract already built to grow by
       optional field groups, not a version event. `v2` is still not permissive: a name outside
       the union ∪ {`claimRef`} is refused, so the addition is not an escape hatch. */
    var ROW_CONTRACT_V1 = "brief-recommendation-history-row/v1";
    var ROW_CONTRACT_V2 = "brief-recommendation-history-row/v2";

    /* The code carried by every ledger-row violation. Distinct from the claim code so a consumer
       can tell a malformed ROW from a malformed CLAIM. */
    var ROW_CONTRACT_VIOLATION_CODE = "RTR-ROW-CONTRACT";

    /* The refusal for a resolution written against a row that carries no `claimRef`. Absence of
       the pointer is the permanent legacy marker, so this code is what makes those rows
       unscoreable BY CONSTRUCTION rather than merely unscored. */
    var LEGACY_BACKFILL_CODE = "RTR-LEGACY-BACKFILL";

    /* The pointer this feature adds: one field, an opaque string, never a nested object. */
    var CLAIM_REF_FIELD = "claimRef";
    var CLAIM_REF_PATTERN = /^sha256:[a-f0-9]{64}$/;

    var ROW_V1_FIELDS = Object.freeze([
        "canonicalMonth", "contractVersion", "eventId", "eventType",
        "occurredAt", "recommendationKey", "runId"
    ]);

    /* `v2`'s measured live field set, split rather than stated as one list: a required key cannot
       then be demoted to optional by a typo, and `deriveRowFieldUnion` can re-derive BOTH halves
       from the committed ledger to prove these constants still describe what is on disk. */
    var ROW_V2_REQUIRED_FIELDS = Object.freeze([
        "canonicalMonth", "confidence", "contractVersion", "deepLink", "direction", "eventId",
        "eventType", "horizon", "instrument", "occurredAt", "recommendationKey", "runId"
    ]);
    var ROW_V2_MEASURED_OPTIONAL_FIELDS = Object.freeze([
        "bodyContractVersion", "bodySource", "directionSign", "evaluability", "evaluabilityReason",
        "evaluatedAsOf", "instruments", "invalidation", "levels", "levelsText", "outcome",
        "outcomeContractVersion", "proposedAt", "rationale", "reasonCode", "restoresEventId",
        "sourceCommit", "structuralAnchor", "subject", "trigger"
    ]);

    function unionSorted(lists) {
        var seen = Object.create(null);
        var out = [];
        for (var i = 0; i < lists.length; i += 1) {
            for (var j = 0; j < lists[i].length; j += 1) {
                if (seen[lists[i][j]]) continue;
                seen[lists[i][j]] = true;
                out.push(lists[i][j]);
            }
        }
        return Object.freeze(out.sort());
    }

    /* Derived, never hand-typed a second time: the acceptance set IS the measured union plus the
       one field this feature adds. Writing the 33 names out again is precisely how the added
       field and the accepted set drift apart. */
    var ROW_V2_FIELDS = unionSorted([ROW_V2_REQUIRED_FIELDS, ROW_V2_MEASURED_OPTIONAL_FIELDS, [CLAIM_REF_FIELD]]);

    var CLAIM_STORE_DIR = "briefs/objects/claims";
    var BARS_DIR = "data/bars";
    /* The refresh manifest, not a price series — excluded so a claim can never resolve to it. */
    var BARS_MANIFEST_FILENAME = "index.json";
    var SERIES_INTERVAL = "1d";

    /* The publisher's positional fallbacks. A key derived from one of these is not semantically
       stable across runs, so minting on it would create a resolvable-looking claim whose subject
       means nothing. */
    var POSITIONAL_SUBJECT_PATTERN = /^action-\d+$/;
    var POSITIONAL_FAMILY = "note";

    /* ── stable canonicalization + sha256 ───────────────────────────────────────────────────
       Self-contained so the module stays dependency-free and loads under file://, matching the
       shape every hashing module in this repository already uses. */

    function sortValue(value) {
        if (Array.isArray(value)) return value.map(sortValue);
        if (value && typeof value === "object") {
            var out = {};
            var keys = Object.keys(value).sort();
            for (var i = 0; i < keys.length; i += 1) out[keys[i]] = sortValue(value[keys[i]]);
            return out;
        }
        return value;
    }

    function stableStringify(value) { return JSON.stringify(sortValue(value)); }

    function utf8Bytes(text) {
        var bytes = [];
        var source = String(text);
        for (var i = 0; i < source.length; i += 1) {
            var codePoint = source.charCodeAt(i);
            if (codePoint >= 0xd800 && codePoint <= 0xdbff && i + 1 < source.length) {
                var low = source.charCodeAt(i + 1);
                if (low >= 0xdc00 && low <= 0xdfff) {
                    codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (low - 0xdc00);
                    i += 1;
                }
            }
            if (codePoint < 0x80) bytes.push(codePoint);
            else if (codePoint < 0x800) {
                bytes.push(0xc0 | (codePoint >>> 6), 0x80 | (codePoint & 0x3f));
            } else if (codePoint < 0x10000) {
                bytes.push(0xe0 | (codePoint >>> 12), 0x80 | ((codePoint >>> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
            } else {
                bytes.push(
                    0xf0 | (codePoint >>> 18),
                    0x80 | ((codePoint >>> 12) & 0x3f),
                    0x80 | ((codePoint >>> 6) & 0x3f),
                    0x80 | (codePoint & 0x3f)
                );
            }
        }
        return bytes;
    }

    var SHA256_K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    function rotateRight(value, amount) { return (value >>> amount) | (value << (32 - amount)); }

    function sha256Hex(value) {
        var source = utf8Bytes(value);
        var bitLength = source.length * 8;
        var paddedLength = Math.ceil((source.length + 9) / 64) * 64;
        var bytes = new Uint8Array(paddedLength);
        var index;
        for (index = 0; index < source.length; index += 1) bytes[index] = source[index];
        bytes[source.length] = 0x80;
        var highLength = Math.floor(bitLength / 0x100000000);
        var lowLength = bitLength >>> 0;
        for (index = 0; index < 4; index += 1) {
            bytes[paddedLength - 8 + index] = (highLength >>> (24 - index * 8)) & 0xff;
            bytes[paddedLength - 4 + index] = (lowLength >>> (24 - index * 8)) & 0xff;
        }

        var hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
        var words = new Uint32Array(64);
        for (var offset = 0; offset < paddedLength; offset += 64) {
            for (index = 0; index < 16; index += 1) {
                words[index] = (bytes[offset + index * 4] << 24) | (bytes[offset + index * 4 + 1] << 16)
                    | (bytes[offset + index * 4 + 2] << 8) | bytes[offset + index * 4 + 3];
            }
            for (index = 16; index < 64; index += 1) {
                var s0 = rotateRight(words[index - 15], 7) ^ rotateRight(words[index - 15], 18) ^ (words[index - 15] >>> 3);
                var s1 = rotateRight(words[index - 2], 17) ^ rotateRight(words[index - 2], 19) ^ (words[index - 2] >>> 10);
                words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
            }
            var a = hash[0], b = hash[1], c = hash[2], d = hash[3];
            var e = hash[4], f = hash[5], g = hash[6], h = hash[7];
            for (index = 0; index < 64; index += 1) {
                var S1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
                var ch = (e & f) ^ (~e & g);
                var temp1 = (h + S1 + ch + SHA256_K[index] + words[index]) >>> 0;
                var S0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
                var maj = (a & b) ^ (a & c) ^ (b & c);
                var temp2 = (S0 + maj) >>> 0;
                h = g; g = f; f = e;
                e = (d + temp1) >>> 0;
                d = c; c = b; b = a;
                a = (temp1 + temp2) >>> 0;
            }
            hash[0] = (hash[0] + a) >>> 0; hash[1] = (hash[1] + b) >>> 0;
            hash[2] = (hash[2] + c) >>> 0; hash[3] = (hash[3] + d) >>> 0;
            hash[4] = (hash[4] + e) >>> 0; hash[5] = (hash[5] + f) >>> 0;
            hash[6] = (hash[6] + g) >>> 0; hash[7] = (hash[7] + h) >>> 0;
        }

        var hex = "";
        for (index = 0; index < hash.length; index += 1) {
            hex += ("00000000" + hash[index].toString(16)).slice(-8);
        }
        return hex;
    }

    function stableSha(value) { return "sha256:" + sha256Hex(stableStringify(value)); }

    /* ── Reading the foundation action vocabulary ───────────────────────────────────────────
       MARKET_ACTIONS and ACTION_DIRECTION are private to rlcontracts.js — they are NOT on its
       exported api (measured). Rather than shadow them with a second copy that would silently
       go stale, the two frozen literals are read out of rlcontracts.js's own source text. There
       is therefore exactly one definition in the repository, and if either literal moves or
       changes shape this throws instead of scoring against a stale vocabulary. */

    var ACTION_VOCABULARY_SOURCE = "rlcontracts.js";

    function extractFrozenLiteral(sourceText, name) {
        var anchor = "var " + name + " = Object.freeze({";
        var start = String(sourceText).indexOf(anchor);
        if (start === -1) return null;
        var open = start + anchor.length - 1;
        var depth = 0;
        for (var i = open; i < sourceText.length; i += 1) {
            if (sourceText[i] === "{") depth += 1;
            else if (sourceText[i] === "}") {
                depth -= 1;
                if (depth === 0) {
                    var body = sourceText.slice(open, i + 1);
                    /* Quote bare identifier keys so the literal parses as JSON. */
                    var json = body.replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3');
                    try { return JSON.parse(json); } catch (error) { return null; }
                }
            }
        }
        return null;
    }

    /* Returns { families, direction } read from rlcontracts.js source. Throws — never returns a
       partial vocabulary — because a half-known action set silently mis-signs outcomes. */
    function readFoundationActionVocabulary(sourceText) {
        if (typeof sourceText !== "string" || sourceText.length === 0) {
            throw new Error("rlclaims: " + ACTION_VOCABULARY_SOURCE + " source text is required to read the action vocabulary");
        }
        var families = extractFrozenLiteral(sourceText, "MARKET_ACTIONS");
        var direction = extractFrozenLiteral(sourceText, "ACTION_DIRECTION");
        if (!families || !direction) {
            throw new Error("rlclaims: MARKET_ACTIONS/ACTION_DIRECTION not found in " + ACTION_VOCABULARY_SOURCE);
        }
        var familyNames = Object.keys(families).sort();
        for (var i = 0; i < familyNames.length; i += 1) {
            if (!Object.prototype.hasOwnProperty.call(direction, familyNames[i])) {
                throw new Error("rlclaims: action family '" + familyNames[i] + "' has no ACTION_DIRECTION entry");
            }
        }
        return Object.freeze({
            families: Object.freeze(familyNames),
            direction: Object.freeze(direction)
        });
    }

    /* ── Committed series enumeration ───────────────────────────────────────────────────────
       Derived from the directory listing, never a count literal (F-015-D5-02). The bars
       directory is the AVAILABILITY set — what the resolver can actually read. index.json is
       the refresh manifest and is a CURATION set; using it would refuse a claim on a symbol
       whose bars are committed and readable, shrinking the denominator over a curation detail. */
    function enumerateCommittedSeries(fileNames) {
        if (!Array.isArray(fileNames)) {
            throw new Error("rlclaims: enumerateCommittedSeries requires the bars directory listing");
        }
        var symbols = [];
        for (var i = 0; i < fileNames.length; i += 1) {
            var name = fileNames[i];
            if (typeof name !== "string") continue;
            if (name === BARS_MANIFEST_FILENAME) continue;
            if (name.slice(-5) !== ".json") continue;
            symbols.push(name.slice(0, -5));
        }
        symbols.sort();
        return Object.freeze(symbols);
    }

    function seriesRefFor(symbol) { return "bars/" + symbol + "/" + SERIES_INTERVAL; }

    function symbolFromSeriesRef(ref) {
        if (typeof ref !== "string") return null;
        var parts = ref.split("/");
        if (parts.length !== 3 || parts[0] !== "bars" || parts[1].length === 0) return null;
        return parts[1];
    }

    /* ── Publisher key derivation ───────────────────────────────────────────────────────────
       Reproduces scripts/brief-distributed-publish.mjs exactly, over the VERBATIM prose. A
       claim that normalised or symbol-extracted that string could no longer reproduce the key
       it binds to and would silently orphan itself from its ledger row. */
    function deriveRecommendationKey(subjectProse, actionFamily) {
        return stableSha({
            contractVersion: RECOMMENDATION_KEY_CONTRACT_VERSION,
            subject: subjectProse,
            family: actionFamily
        });
    }

    /* ── citedToolId ────────────────────────────────────────────────────────────────────────
       A citation to supporting analysis, not an attribution of authorship. Unresolvable yields
       null and never refuses the mint: dropping a resolvable call over a missing navigation
       affordance is a measurement error in the direction that flatters. */
    function resolveCitedToolId(deepLink, toolsRegistry) {
        if (typeof deepLink !== "string" || deepLink.length === 0) return null;
        var tools = toolsRegistry && Array.isArray(toolsRegistry.tools)
            ? toolsRegistry.tools
            : (Array.isArray(toolsRegistry) ? toolsRegistry : null);
        if (!tools) return null;
        var file = deepLink.split("#")[0].split("?")[0];
        var slash = file.lastIndexOf("/");
        if (slash !== -1) file = file.slice(slash + 1);
        for (var i = 0; i < tools.length; i += 1) {
            if (tools[i] && tools[i].file === file) return tools[i].id;
        }
        return null;
    }

    /* ── claimHash ──────────────────────────────────────────────────────────────────────────
       Exactly the nine hashed terms. Whole objects for predicate/horizon/magnitude, so
       horizon.authoredBand is inside the hash even though the resolver never reads it. */
    function hashedTermsOf(claim) {
        var terms = {};
        for (var i = 0; i < HASHED_TERMS.length; i += 1) terms[HASHED_TERMS[i]] = claim[HASHED_TERMS[i]];
        return terms;
    }

    function claimHash(claim) { return stableSha(hashedTermsOf(claim)); }

    function claimObjectPath(hash) {
        var hex = String(hash).replace(/^sha256:/, "");
        if (!/^[a-f0-9]{64}$/.test(hex)) throw new Error("rlclaims: claimHash is not a bare lowercase sha256 hex");
        return CLAIM_STORE_DIR + "/" + hex + ".json";
    }

    function serializeClaim(claim) { return stableStringify(claim); }

    function violation(reason, field) {
        return { ok: false, error: { code: CONTRACT_VIOLATION_CODE, reason: reason, field: field } };
    }

    function isPlainObject(value) {
        return !!value && typeof value === "object" && !Array.isArray(value);
    }

    function inSet(list, value) {
        return typeof value === "string" && list.indexOf(value) !== -1;
    }

    function nonEmptyString(value) { return typeof value === "string" && value.length > 0; }

    /* ── The dual-version ledger row reader ─────────────────────────────────────────────────
       Accepts BOTH live versions. `v1` is not deprecated, is never rewritten, and no migration
       runs — a reader that quietly "upgraded" a row on read would rewrite history in memory and
       make the two versions indistinguishable to everything downstream.

       Absence of `claimRef` is never an error here. It IS the permanent unresolvable-legacy
       marker under HC-4 / BP-015-002, and it covers all 1,380 committed rows — `v1` and body-`v2`
       alike — so nothing is null-filled, back-filled or estimated. */

    /* The repository's closed-field-list idiom, mirroring `hasOnlyFields` in rlcontracts.js
       (Feature 002-owned, read as precedent and never modified; this module stays dependency-free
       so it loads under file://). Returns the first offending KEY, because "some unknown field"
       does not tell a publisher which one to drop. */
    function hasOnlyFields(value, fields) {
        var allowed = Object.create(null);
        var keys = Object.keys(value);
        var index;
        for (index = 0; index < fields.length; index += 1) allowed[fields[index]] = true;
        for (index = 0; index < keys.length; index += 1) {
            if (!allowed[keys[index]]) return keys[index];
        }
        return null;
    }

    function rowFieldsFor(contractVersion) {
        if (contractVersion === ROW_CONTRACT_V1) return ROW_V1_FIELDS;
        if (contractVersion === ROW_CONTRACT_V2) return ROW_V2_FIELDS;
        return null;
    }

    function rowRequiredFieldsFor(contractVersion) {
        if (contractVersion === ROW_CONTRACT_V1) return ROW_V1_FIELDS;
        if (contractVersion === ROW_CONTRACT_V2) return ROW_V2_REQUIRED_FIELDS;
        return null;
    }

    function rowViolation(reason, field) {
        return { ok: false, error: { code: ROW_CONTRACT_VIOLATION_CODE, reason: reason, field: field } };
    }

    /* Rule order is deliberate: `unknown-field` is evaluated BEFORE the required sweep, so a `v1`
       row carrying `claimRef` refuses on the field that is actually wrong rather than on whichever
       required key a malformed row also happened to drop. */
    function validateLedgerRow(row) {
        if (!isPlainObject(row)) return rowViolation("row-not-an-object", "row");

        var accepted = rowFieldsFor(row.contractVersion);
        if (accepted === null) return rowViolation("row-contract-version-not-allowed", "contractVersion");

        var unknown = hasOnlyFields(row, accepted);
        if (unknown !== null) return rowViolation("unknown-field", unknown);

        var required = rowRequiredFieldsFor(row.contractVersion);
        for (var i = 0; i < required.length; i += 1) {
            if (!Object.prototype.hasOwnProperty.call(row, required[i])) {
                return rowViolation("row-required-field-missing", required[i]);
            }
        }

        /* Present-but-malformed is a different defect from absent. A nested object here would
           make the row a payload rather than a pointer, so the type rule is part of the contract. */
        if (Object.prototype.hasOwnProperty.call(row, CLAIM_REF_FIELD)
            && !(typeof row[CLAIM_REF_FIELD] === "string" && CLAIM_REF_PATTERN.test(row[CLAIM_REF_FIELD]))) {
            return rowViolation("claim-ref-not-opaque-sha256", CLAIM_REF_FIELD);
        }

        return { ok: true, row: row };
    }

    /* Re-derive a version's live field set from real rows. The constants above are a MEASUREMENT
       of the committed ledger, and a measurement nothing re-checks decays into a guess — so this
       is what a test uses to prove they still describe what is on disk. "Required" means present
       in EVERY row, which is only meaningful over a non-empty set; an empty input therefore
       yields empty halves rather than declaring every key required. */
    function deriveRowFieldUnion(rows) {
        var counts = Object.create(null);
        var union = [];
        var total = 0;
        for (var i = 0; i < rows.length; i += 1) {
            if (!isPlainObject(rows[i])) continue;
            total += 1;
            var keys = Object.keys(rows[i]);
            for (var k = 0; k < keys.length; k += 1) {
                if (counts[keys[k]] === undefined) { counts[keys[k]] = 0; union.push(keys[k]); }
                counts[keys[k]] += 1;
            }
        }
        union.sort();
        var required = [];
        var optional = [];
        for (var u = 0; u < union.length; u += 1) {
            if (total > 0 && counts[union[u]] === total) required.push(union[u]);
            else optional.push(union[u]);
        }
        return {
            rowCount: total,
            union: Object.freeze(union),
            required: Object.freeze(required),
            optional: Object.freeze(optional)
        };
    }

    /* ── RTR-LEGACY-BACKFILL ────────────────────────────────────────────────────────────────
       The gate every resolution write passes through. Scope 03 owns the resolution OBJECT; this
       owns the single question of whether the target row may be resolved at all.

       Rule order is the whole contract. The legacy check runs BEFORE the resolution is inspected
       in any way, so no property of the resolution can rescue a claimless row: a complete,
       well-formed, entirely plausible predicate is refused exactly as loudly as a malformed one.
       Inspecting the resolution first and refusing only when it looked wrong is precisely the
       imputation BP-015-002 forbids — it would score 1,380 rows against terms nobody authored.

       Malformed-row still wins over legacy, because a row that is not a valid ledger row is a
       different defect and reporting it as legacy would hide it. */
    function authorizeResolutionWrite(row, resolution) {
        var rowCheck = validateLedgerRow(row);
        if (!rowCheck.ok) return rowCheck;

        if (!Object.prototype.hasOwnProperty.call(row, CLAIM_REF_FIELD)) {
            return {
                ok: false,
                error: {
                    code: LEGACY_BACKFILL_CODE,
                    reason: "claimless-row-unscoreable",
                    field: CLAIM_REF_FIELD,
                    eventId: row.eventId
                }
            };
        }

        if (!isPlainObject(resolution)) return rowViolation("resolution-not-an-object", "resolution");

        return { ok: true, claimRef: row[CLAIM_REF_FIELD], eventId: row.eventId };
    }

    /* ── mintClaim ──────────────────────────────────────────────────────────────────────────
       Two outcomes, deliberately distinct:
         • a CONTRACT VIOLATION ({ ok: false }) — an out-of-vocabulary value or a direction that
           contradicts ACTION_DIRECTION. Malformed input never passes through and is never coerced.
         • a MINTED claim ({ ok: true }) whose `notEvaluable` is null or names one of the seven
           reasons and the field that caused it. The claim is still written and still counted.
       Reasons are evaluated in a fixed order so one input violating one rule always yields the
       same reason; each negative fixture violates exactly one. */
    function mintClaim(input) {
        if (!isPlainObject(input)) return violation("mint-input-invalid", "input");

        var action = input.action;
        if (!isPlainObject(action)) return violation("action-invalid", "action");

        var vocabulary = input.actionVocabulary;
        if (!isPlainObject(vocabulary) || !Array.isArray(vocabulary.families) || !isPlainObject(vocabulary.direction)) {
            return violation("action-vocabulary-invalid", "actionVocabulary");
        }

        var committed = input.committedSeries;
        if (!Array.isArray(committed)) return violation("committed-series-invalid", "committedSeries");

        var actionFamily = action.action;
        if (!nonEmptyString(actionFamily)) return violation("action-family-missing", "action.action");

        /* Family `note` is the publisher's positional fallback, not a market action; it is a
           not-evaluable reason below rather than an unknown-vocabulary violation here. */
        if (actionFamily !== POSITIONAL_FAMILY && vocabulary.families.indexOf(actionFamily) === -1) {
            return violation("action-family-not-allowed", "actionFamily");
        }

        var boundDirection = actionFamily === POSITIONAL_FAMILY ? null : vocabulary.direction[actionFamily];
        if (Object.prototype.hasOwnProperty.call(input, "direction") && input.direction !== null
            && input.direction !== undefined && input.direction !== boundDirection) {
            return violation("direction-not-bound-to-action-family", "direction");
        }

        var claimInput = isPlainObject(action.claim) ? action.claim : null;
        var prose = typeof action.subject === "string" ? action.subject : null;

        /* Subject kind and weighting are contract vocabularies: an out-of-set value refuses. */
        var subjectKind = claimInput && claimInput.subjectKind !== undefined ? claimInput.subjectKind : "instrument";
        if (!inSet(SUBJECT_KINDS, subjectKind)) return violation("subject-kind-not-allowed", "subject.kind");
        var weighting = claimInput && claimInput.weighting !== undefined ? claimInput.weighting : "equal";
        if (!inSet(SUBJECT_WEIGHTINGS, weighting)) return violation("subject-weighting-not-allowed", "subject.weighting");

        var predicateInput = claimInput && isPlainObject(claimInput.predicate) ? claimInput.predicate : null;
        if (predicateInput) {
            if (!inSet(PREDICATE_KINDS, predicateInput.kind)) return violation("predicate-kind-not-allowed", "predicate.kind");
            if (!inSet(PREDICATE_COMPARATORS, predicateInput.comparator)) {
                return violation("predicate-comparator-not-allowed", "predicate.comparator");
            }
            if (!Number.isFinite(predicateInput.value)) return violation("predicate-value-not-finite", "predicate.value");
        }

        var horizonKind = claimInput ? claimInput.horizonKind : undefined;
        if (horizonKind !== undefined && horizonKind !== null && !inSet(HORIZON_KINDS, horizonKind)) {
            return violation("horizon-kind-not-allowed", "horizon.kind");
        }

        var unit = input.magnitudeUnit === undefined ? MAGNITUDE_UNITS[0] : input.magnitudeUnit;
        if (!inSet(MAGNITUDE_UNITS, unit)) return violation("magnitude-unit-not-allowed", "magnitude.unit");
        var signConvention = input.signConvention === undefined ? SIGN_CONVENTIONS[0] : input.signConvention;
        if (!inSet(SIGN_CONVENTIONS, signConvention)) return violation("magnitude-sign-convention-not-allowed", "magnitude.signConvention");

        /* ── Build the frozen terms, then determine evaluability ── */
        var resolvesTo = claimInput && Array.isArray(claimInput.resolvesTo) ? claimInput.resolvesTo.slice() : [];
        var seriesRefs;
        if (claimInput && Array.isArray(claimInput.seriesRefs)) {
            seriesRefs = claimInput.seriesRefs.slice();
        } else {
            seriesRefs = [];
            for (var r = 0; r < resolvesTo.length; r += 1) {
                if (nonEmptyString(resolvesTo[r])) seriesRefs.push(seriesRefFor(resolvesTo[r]));
            }
        }

        var subject = {
            kind: subjectKind,
            prose: prose,
            resolvesTo: resolvesTo,
            seriesRefs: seriesRefs,
            weighting: weighting
        };

        var horizon = {
            kind: nonEmptyString(horizonKind) ? horizonKind : null,
            sessions: claimInput && Number.isFinite(claimInput.horizonSessions) ? claimInput.horizonSessions : null,
            authoredBand: nonEmptyString(action.horizon) ? action.horizon : null,
            resolutionDate: nonEmptyString(input.resolutionDate) ? input.resolutionDate : null,
            eventRef: claimInput && nonEmptyString(claimInput.eventRef) ? claimInput.eventRef : null
        };

        var predicate = predicateInput ? {
            kind: predicateInput.kind,
            basis: nonEmptyString(predicateInput.basis) ? predicateInput.basis : null,
            comparator: predicateInput.comparator,
            value: predicateInput.value,
            reference: nonEmptyString(predicateInput.reference) ? predicateInput.reference : null
        } : null;

        var magnitude = {
            unit: unit,
            entryBasis: nonEmptyString(input.entryBasis) ? input.entryBasis : "close",
            entryDate: nonEmptyString(input.entryDate) ? input.entryDate : null,
            signConvention: signConvention,
            flatBand: claimInput && Number.isFinite(claimInput.flatBand) ? claimInput.flatBand : null
        };

        var thesisFamily = claimInput && nonEmptyString(claimInput.thesisFamily) ? claimInput.thesisFamily : null;
        var direction = boundDirection === undefined ? null : boundDirection;

        var claim = {
            contractVersion: CONTRACT_VERSION,
            recommendationKey: deriveRecommendationKey(prose, actionFamily),
            proposalRunId: nonEmptyString(input.proposalRunId) ? input.proposalRunId : null,
            proposalEventId: nonEmptyString(input.proposalEventId) ? input.proposalEventId : null,
            proposedAt: nonEmptyString(input.proposedAt) ? input.proposedAt : null,
            citedToolId: resolveCitedToolId(action.deepLink, input.toolsRegistry),
            subject: subject,
            actionFamily: actionFamily,
            direction: direction,
            thesisFamily: thesisFamily,
            predicate: predicate,
            horizon: horizon,
            magnitude: magnitude,
            notEvaluable: null,
            claimHash: null
        };

        claim.notEvaluable = evaluateMintReason(claim, committed);
        claim.claimHash = claimHash(claim);
        return { ok: true, claim: claim };
    }

    /* Fixed evaluation order. `non-semantic-subject` precedes the authored-absence codes because
       a positionally-derived subject is meaningless whether or not the rest was authored. */
    function evaluateMintReason(claim, committed) {
        var subject = claim.subject;

        if (claim.actionFamily === POSITIONAL_FAMILY) {
            return { reason: "non-semantic-subject", field: "actionFamily" };
        }
        if (!nonEmptyString(subject.prose) || POSITIONAL_SUBJECT_PATTERN.test(subject.prose)) {
            return { reason: "non-semantic-subject", field: "subject.prose" };
        }
        if (!Array.isArray(subject.resolvesTo) || subject.resolvesTo.length === 0) {
            return { reason: "no-authored-subject", field: "subject.resolvesTo" };
        }
        if (subject.seriesRefs.length === 0) {
            return { reason: "no-committed-series", field: "subject.seriesRefs" };
        }
        for (var i = 0; i < subject.seriesRefs.length; i += 1) {
            var symbol = symbolFromSeriesRef(subject.seriesRefs[i]);
            if (symbol === null || committed.indexOf(symbol) === -1) {
                return { reason: "no-committed-series", field: "subject.seriesRefs" };
            }
        }
        if (!nonEmptyString(claim.thesisFamily)) {
            return { reason: "no-authored-thesis-family", field: "thesisFamily" };
        }
        if (!nonEmptyString(claim.horizon.kind)) {
            return { reason: "no-authored-horizon", field: "horizon.kind" };
        }
        if (claim.horizon.kind === "multi-session" && !Number.isFinite(claim.horizon.sessions)) {
            return { reason: "no-authored-horizon", field: "horizon.sessions" };
        }
        if (claim.horizon.kind === "event-bound") {
            if (!nonEmptyString(claim.horizon.eventRef)) return { reason: "no-authored-horizon", field: "horizon.eventRef" };
        } else if (!nonEmptyString(claim.horizon.resolutionDate)) {
            return { reason: "no-authored-horizon", field: "horizon.resolutionDate" };
        }
        if (claim.predicate === null) {
            return { reason: "no-authored-predicate", field: "predicate" };
        }
        if (claim.direction === 0) {
            return { reason: "neutral-direction-no-magnitude", field: "direction" };
        }
        return null;
    }

    /* ── Content-addressed, append-only store ───────────────────────────────────────────────
       The filesystem is injected so the module stays UMD and dependency-free. Re-minting an
       identical claim is a byte-identical no-op. A write that would change the CLAIM at an
       existing path aborts and never overwrites.

       The comparison is over the nine hashed terms, not the whole serialized object, and that
       distinction is the contract rather than an optimisation. The five unhashed provenance
       fields are deliberately outside the content address, so a byte-identical re-proposal
       carrying a different `citedToolId` is the SAME claim: it reuses the first object and keeps
       the first citation (D1). Comparing whole bytes would fire the amend refusal on that case
       and force a second object for a call the record must count exactly once. What the refusal
       must catch is an AMENDED PREDICATE re-submitted against the original claim reference —
       different hashed terms at the same path — which is BS-008 and is caught here exactly. */
    function writeClaimObject(claim, ports) {
        if (!isPlainObject(ports) || typeof ports.existsSync !== "function"
            || typeof ports.readFileSync !== "function" || typeof ports.writeFileSync !== "function"
            || typeof ports.mkdirSync !== "function") {
            throw new Error("rlclaims: writeClaimObject requires { existsSync, readFileSync, writeFileSync, mkdirSync }");
        }
        var root = nonEmptyString(ports.root) ? ports.root : "";
        var relativePath = claimObjectPath(claim.claimHash);
        var fullPath = root ? root + "/" + relativePath : relativePath;
        var bytes = serializeClaim(claim);

        if (ports.existsSync(fullPath)) {
            var existing = ports.readFileSync(fullPath, "utf8");
            if (existing === bytes) return { ok: true, path: relativePath, written: false, reused: true };
            var incomingTerms = stableStringify(hashedTermsOf(claim));
            var existingTerms = null;
            try { existingTerms = stableStringify(hashedTermsOf(JSON.parse(existing))); } catch (error) { existingTerms = null; }
            if (existingTerms !== null && existingTerms === incomingTerms) {
                return { ok: true, path: relativePath, written: false, reused: true };
            }
            return {
                ok: false,
                error: { code: PREDICATE_AMEND_CODE, reason: "predicate-amend-refused", field: "claimHash", path: relativePath }
            };
        }

        var directory = root ? root + "/" + CLAIM_STORE_DIR : CLAIM_STORE_DIR;
        ports.mkdirSync(directory, { recursive: true });
        ports.writeFileSync(fullPath, bytes);
        return { ok: true, path: relativePath, written: true, reused: false };
    }

    return {
        CONTRACT_VERSION: CONTRACT_VERSION,
        CLAIM_INPUT_CONTRACT_VERSION: CLAIM_INPUT_CONTRACT_VERSION,
        RECOMMENDATION_KEY_CONTRACT_VERSION: RECOMMENDATION_KEY_CONTRACT_VERSION,
        PREDICATE_AMEND_CODE: PREDICATE_AMEND_CODE,
        CONTRACT_VIOLATION_CODE: CONTRACT_VIOLATION_CODE,
        SUBJECT_KINDS: SUBJECT_KINDS,
        SUBJECT_WEIGHTINGS: SUBJECT_WEIGHTINGS,
        PREDICATE_KINDS: PREDICATE_KINDS,
        PREDICATE_COMPARATORS: PREDICATE_COMPARATORS,
        HORIZON_KINDS: HORIZON_KINDS,
        MAGNITUDE_UNITS: MAGNITUDE_UNITS,
        SIGN_CONVENTIONS: SIGN_CONVENTIONS,
        HASHED_TERMS: HASHED_TERMS,
        UNHASHED_FIELDS: UNHASHED_FIELDS,
        MINT_REFUSALS: MINT_REFUSALS,
        CLAIM_STORE_DIR: CLAIM_STORE_DIR,
        BARS_DIR: BARS_DIR,
        BARS_MANIFEST_FILENAME: BARS_MANIFEST_FILENAME,
        ACTION_VOCABULARY_SOURCE: ACTION_VOCABULARY_SOURCE,
        ROW_CONTRACT_V1: ROW_CONTRACT_V1,
        ROW_CONTRACT_V2: ROW_CONTRACT_V2,
        ROW_CONTRACT_VIOLATION_CODE: ROW_CONTRACT_VIOLATION_CODE,
        LEGACY_BACKFILL_CODE: LEGACY_BACKFILL_CODE,
        CLAIM_REF_FIELD: CLAIM_REF_FIELD,
        CLAIM_REF_PATTERN: CLAIM_REF_PATTERN,
        ROW_V1_FIELDS: ROW_V1_FIELDS,
        ROW_V2_REQUIRED_FIELDS: ROW_V2_REQUIRED_FIELDS,
        ROW_V2_MEASURED_OPTIONAL_FIELDS: ROW_V2_MEASURED_OPTIONAL_FIELDS,
        ROW_V2_FIELDS: ROW_V2_FIELDS,
        validateLedgerRow: validateLedgerRow,
        deriveRowFieldUnion: deriveRowFieldUnion,
        authorizeResolutionWrite: authorizeResolutionWrite,
        stableStringify: stableStringify,
        sha256Hex: sha256Hex,
        stableSha: stableSha,
        readFoundationActionVocabulary: readFoundationActionVocabulary,
        enumerateCommittedSeries: enumerateCommittedSeries,
        seriesRefFor: seriesRefFor,
        symbolFromSeriesRef: symbolFromSeriesRef,
        deriveRecommendationKey: deriveRecommendationKey,
        resolveCitedToolId: resolveCitedToolId,
        hashedTermsOf: hashedTermsOf,
        claimHash: claimHash,
        claimObjectPath: claimObjectPath,
        serializeClaim: serializeClaim,
        mintClaim: mintClaim,
        writeClaimObject: writeClaimObject
    };
});
