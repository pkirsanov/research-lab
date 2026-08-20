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
 * Absence is not an error. Each of the eight mint reasons names the field that caused it and the
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
 *
 * And it carries the closed OUTCOME-CLASS vocabulary with the table that routes each class either
 * to the array fed to `rlvSummarizeOutcomes` or to a count beside it. A resolved-flat outcome is
 * exactly `0` often enough to matter and the primitive reads `0` as never-resolved, so the class
 * is decided HERE — against the band frozen into the claim at proposal, which is inside the hash —
 * and its value is withheld from the array rather than nudged to a sign the data does not support.
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
        "neutral-direction-no-magnitude",
        "no-authored-flat-band"
    ]);

    /* ── The closed outcome-class vocabulary and its contribution routing ───────────────────
       `rlvSummarizeOutcomes` — Feature 007-owned, consumed unmodified and NOT imported here —
       filters wins with `value > 0` and losses with `value < 0`, then derives `unresolved` by
       subtraction. An outcome of exactly `0` is neither, so a claim that DID resolve, against
       committed data, to a flat result is reported as though it was never resolved at all. That
       is the HC-7 violation, and it is fixed at the SOURCE rather than downstream because the
       primitive deep-freezes its results and offers no seam to patch.

       So every call carries exactly one of these six classes, and the class ALONE decides whether
       it contributes a NUMBER to the array handed to the primitive or a COUNT to the surrounding
       report. An unrecognised value refuses; it is never coerced and never passes through. */
    var OUTCOME_CLASSES = Object.freeze([
        "win", "loss", "resolved-flat", "unresolved", "not-evaluable", "unresolvable-legacy"
    ]);

    var CONTRIBUTION_NUMBER = "number";
    var CONTRIBUTION_COUNT = "count";

    /* The routing table. `resolved-flat` sits on the COUNT side while still carrying its exact
       value in the resolution record — which is precisely what makes it distinguishable from
       `unresolved` in both places at once: the record says what it resolved TO, the report says
       how many did. Selecting and ordering elements is ROUTING, not estimation; no statistic is
       computed anywhere in this block. */
    var OUTCOME_CONTRIBUTIONS = Object.freeze({
        "win": CONTRIBUTION_NUMBER,
        "loss": CONTRIBUTION_NUMBER,
        "resolved-flat": CONTRIBUTION_COUNT,
        "unresolved": CONTRIBUTION_COUNT,
        "not-evaluable": CONTRIBUTION_COUNT,
        "unresolvable-legacy": CONTRIBUTION_COUNT
    });

    /* The refusal for a bare `0` reaching the array fed to the primitive. */
    var FLAT_ZERO_CODE = "RTR-FLAT-ZERO";

    function outcomeClassesContributing(contribution) {
        var out = [];
        for (var i = 0; i < OUTCOME_CLASSES.length; i += 1) {
            if (OUTCOME_CONTRIBUTIONS[OUTCOME_CLASSES[i]] === contribution) out.push(OUTCOME_CLASSES[i]);
        }
        return Object.freeze(out);
    }

    /* Derived from the table, never hand-typed a second time — the same reason `ROW_V2_FIELDS` is
       derived. A literal list here would let a class be re-routed in the table while the set that
       consumes it kept the old answer, and the two would disagree silently. */
    var DIRECTIONAL_OUTCOME_CLASSES = outcomeClassesContributing(CONTRIBUTION_NUMBER);
    var COUNTED_OUTCOME_CLASSES = outcomeClassesContributing(CONTRIBUTION_COUNT);

    /* ── The denominator contract ───────────────────────────────────────────────────────────
       `winRate` divides by the fed array's length (`rlvalidation.js#L147`), so the fed array's
       composition IS the published denominator — there is no second quantity to publish. The
       label is declared HERE, beside the array whose length defines it, and rendered by scope 05:
       one definition, so a surface cannot render a bare "hit rate" over a directional-only
       denominator and read as though the four withheld classes were counted in it. */
    var DIRECTIONAL_RATE_LABEL = "directional hit rate";

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

    /* ── brief-recommendation-resolution/v1 ─────────────────────────────────────────────────
       The 015-owned record of what a claim resolved TO. Eleven fields partitioned exhaustively:
       eight hashed content terms, two unhashed provenance fields, and the digest — which cannot
       contain itself.

       `eventId` and `lifecycleBinding` sit OUTSIDE the address for the same reason `claimHash`
       excludes `proposalRunId`: `lifecycleEventId` hashes `runId`, so the same closure re-emitted
       tomorrow carries a different `eventId`. Hashing it would give one outcome two content
       addresses, and so two entries in an accounting that is supposed to count each call once.
       Identity is content; provenance is metadata. */
    var RESOLUTION_CONTRACT_VERSION = "brief-recommendation-resolution/v1";
    var RESOLUTION_STORE_DIR = "briefs/objects/resolutions";

    var RESOLUTION_HASHED_TERMS = Object.freeze([
        "contractVersion", "claimHash", "resolutionDate", "closureEventType",
        "outcomeClass", "outcomeValue", "reasonCode", "provenance"
    ]);
    var RESOLUTION_UNHASHED_FIELDS = Object.freeze(["eventId", "lifecycleBinding"]);
    /* Derived, never hand-typed a second time: the accepted field set IS the partition. A term
       added to the hash but not to the accepted set would refuse as an unknown field. */
    var RESOLUTION_FIELDS = unionSorted([RESOLUTION_HASHED_TERMS, RESOLUTION_UNHASHED_FIELDS, ["resolutionHash"]]);

    /* Keys that are RUN-SCOPED and therefore may never appear inside the HASHED `provenance`
       block. A run id or a wall clock there would move the content address on every pass, which
       is exactly the idempotence the content-addressed store exists to provide. They belong in
       `lifecycleBinding`, which is deliberately outside the hash. */
    var RUN_SCOPED_KEYS = Object.freeze([
        "runId", "resolvedAt", "computedAt", "generatedAt", "observedAt"
    ]);

    var SESSION_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

    var CLOSURE_VOCABULARY_SOURCE = "rlcontracts.js";
    /* The refusal for a closure event outside the 002-owned vocabulary. */
    var CLOSURE_VOCAB_CODE = "RTR-CLOSURE-VOCAB";
    /* The refusal for a content-addressed write that would change existing bytes. */
    var RESOLUTION_CONFLICT_CODE = "RTR-RESOLUTION-CONFLICT";

    /* Which closure events each outcome class may be recorded under, keyed by the 015-OWNED
       vocabulary rather than by the 002-owned one. The DIRECTION of this table is the point.
       `CLOSE_EVENT_TYPES` is private to rlcontracts.js and is read from its source text, so
       restating its members here would be exactly the shadow copy that would go stale. Keying by
       `outcomeClass` names only the five closure events 015 actually emits; `withdrawn` is never
       written down at all and falls out as the residue of the source vocabulary that no class
       admits — D4's "never resolver-emitted" DERIVED rather than restated. A withdrawal is an
       authoring act, and a resolver that could withdraw a claim could withdraw the ones it was
       about to score badly.

       The two axes do not determine each other and are both recorded. A `satisfied` claim can
       carry a NEGATIVE `outcomeValue` — a threshold clearing on the resolution session after an
       adverse path — so collapsing the axes would quietly overwrite one of them. */
    var OUTCOME_CLOSURE_EVENTS = Object.freeze({
        "win": Object.freeze(["satisfied", "invalidated"]),
        "loss": Object.freeze(["satisfied", "invalidated"]),
        "resolved-flat": Object.freeze(["satisfied", "invalidated"]),
        "unresolved": Object.freeze(["expired", "unresolved"]),
        "not-evaluable": Object.freeze(["not-evaluable"]),
        /* A legacy row carries no claim, so there is nothing to address a resolution BY. It is
           counted permanently and never recorded — the same fact RTR-LEGACY-BACKFILL states from
           the row side, here stated from the record side. */
        "unresolvable-legacy": Object.freeze([])
    });

    /* The not-evaluable reasons that cannot be known at mint because they are properties of the
       OBSERVATIONS rather than of the authored claim. */
    var RESOLVER_NOT_EVALUABLE_REASONS = Object.freeze([
        "no-committed-reference", "zero-observed-session", "calendar-coverage-exhausted"
    ]);

    /* Derived from `MINT_REFUSALS`, never restated: every mint reason is a legal not-evaluable
       reason BY CONSTRUCTION, so a ninth mint reason can never land as an unrecordable outcome
       whose claim then falls out of the accounting. */
    var NOT_EVALUABLE_REASONS = unionSorted([MINT_REFUSALS, RESOLVER_NOT_EVALUABLE_REASONS]);

    var CLOSURE_REASON_CODES = Object.freeze({
        "satisfied": Object.freeze(["predicate-satisfied"]),
        "invalidated": Object.freeze(["predicate-invalidated"]),
        "expired": Object.freeze(["horizon-elapsed"]),
        "unresolved": Object.freeze(["session-absent", "path-incomplete"]),
        "not-evaluable": NOT_EVALUABLE_REASONS
    });

    /* The classes that carry a magnitude. `resolved-flat` sits on the COUNT side of the routing
       table and STILL carries its exact value — that pairing IS HC-7. The record says what the
       claim resolved TO while the report says how many did, so a resolved-flat outcome stays
       distinguishable from an unresolved one in both places at once. */
    var MAGNITUDE_BEARING_OUTCOME_CLASSES = unionSorted([DIRECTIONAL_OUTCOME_CLASSES, ["resolved-flat"]]);

    /* ── The class partition ────────────────────────────────────────────────────────────────
       Seven buckets accounting for every proposed call exactly once. Five carry the six outcome
       classes — `win` and `loss` share `resolvedDirectional` because that sum IS the fed array's
       length and therefore the published denominator. `withdrawn` and `open` are lifecycle states
       that no outcome class describes: a withdrawal is never resolver-emitted, and an open claim
       has not resolved yet. Both are still counted, because excluded is not the same as hidden. */
    var PARTITION_BUCKET_FOR_CLASS = Object.freeze({
        "win": "resolvedDirectional",
        "loss": "resolvedDirectional",
        "resolved-flat": "resolvedFlat",
        "unresolved": "unresolved",
        "not-evaluable": "notEvaluable",
        "unresolvable-legacy": "unresolvableLegacy"
    });
    var NON_CLASS_PARTITION_BUCKETS = Object.freeze(["withdrawn", "open"]);

    /* Derived from the map in vocabulary order, so a seventh class cannot appear without a
       bucket and a renamed bucket cannot appear without a class. */
    function partitionBucketsFromClasses() {
        var out = [];
        for (var i = 0; i < OUTCOME_CLASSES.length; i += 1) {
            var bucket = PARTITION_BUCKET_FOR_CLASS[OUTCOME_CLASSES[i]];
            if (bucket !== undefined && out.indexOf(bucket) === -1) out.push(bucket);
        }
        for (var n = 0; n < NON_CLASS_PARTITION_BUCKETS.length; n += 1) out.push(NON_CLASS_PARTITION_BUCKETS[n]);
        return Object.freeze(out);
    }

    var PARTITION_BUCKETS = partitionBucketsFromClasses();

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

    /* ── The proposal-frozen flat band ──────────────────────────────────────────────────────
       The band is read from the MINTED CLAIM and never taken as an argument, because `magnitude`
       is a hashed term: a band chosen at scoring time would sit OUTSIDE `claimHash`, so one
       content address could yield a different `outcomeClass` on a later run and the record would
       stop being reproducible from its own identity. Making the claim the only source is what
       keeps that structural rather than a convention.

       Finite AND strictly positive is a PRECONDITION, asserted before any class is assigned and
       never repaired here. `Math.abs(v) <= null` is exactly `v === 0` — the degenerate classifier
       the boundary row exists to defeat, reached without anyone writing `=== 0` — and a negative
       band makes `resolved-flat` unreachable for every value, so the class is not merely vacuous
       but dead. Supplying a default instead of refusing would move the boundary outside the
       content address, which is the one repair this module must never make. */
    function flatBandFor(claim) {
        if (!isPlainObject(claim) || !isPlainObject(claim.magnitude)) {
            return violation("claim-magnitude-invalid", "magnitude");
        }
        var band = claim.magnitude.flatBand;
        if (!Number.isFinite(band) || band <= 0) {
            return violation("flat-band-not-finite-positive", "magnitude.flatBand");
        }
        return { ok: true, flatBand: band };
    }

    /* The routing a class implies. The membership test runs against the frozen array rather than
       against the table's keys, so an inherited property name such as `constructor` refuses like
       any other value outside the vocabulary instead of resolving through the prototype. */
    function outcomeContributionFor(outcomeClass) {
        if (!inSet(OUTCOME_CLASSES, outcomeClass)) {
            return violation("outcome-class-not-allowed", "outcomeClass");
        }
        return { ok: true, outcomeClass: outcomeClass, contribution: OUTCOME_CONTRIBUTIONS[outcomeClass] };
    }

    /* ── classifyOutcome ────────────────────────────────────────────────────────────────────
       One resolved numeric outcome to exactly one class, plus the routing that class implies.

       The value is carried through VERBATIM. No rounding, no `±ε` nudge, no fabricated sign: a
       flat outcome pushed to `+ε` so that it lands in `wins` would manufacture a directional
       result the data does not support, and would bias `averageWin` toward whatever ε was picked.
       Only the ROUTING differs between a flat outcome and a small win — never the value. */
    function classifyOutcome(outcomeValue, claim) {
        var band = flatBandFor(claim);
        if (!band.ok) return band;
        if (!Number.isFinite(outcomeValue)) return violation("outcome-value-not-finite", "outcomeValue");

        /* Inclusive at both edges and evaluated FIRST, so every value inside the authored band —
           an exact `0` among them — is resolved-flat before `win`/`loss` are considered. A bare
           `0` therefore cannot reach the directional array by classification at all. */
        var outcomeClass;
        if (Math.abs(outcomeValue) <= band.flatBand) outcomeClass = "resolved-flat";
        else if (outcomeValue > 0) outcomeClass = "win";
        else outcomeClass = "loss";

        return {
            ok: true,
            outcomeClass: outcomeClass,
            outcomeValue: outcomeValue,
            flatBand: band.flatBand,
            contribution: OUTCOME_CONTRIBUTIONS[outcomeClass]
        };
    }

    /* ── RTR-FLAT-ZERO ──────────────────────────────────────────────────────────────────────
       The gate on the array handed to `rlvSummarizeOutcomes`. `-0 === 0` is true, so a negative
       zero — which the primitive would also drop into `unresolved` — refuses here too. Nothing is
       coerced: a non-number is not read as a zero, it falls through to the finite check and
       refuses for what it actually is. */
    function assertZeroFreeOutcomes(values) {
        if (!Array.isArray(values)) return violation("directional-array-not-an-array", "outcomes");
        for (var i = 0; i < values.length; i += 1) {
            if (values[i] === 0) {
                return {
                    ok: false,
                    error: {
                        code: FLAT_ZERO_CODE,
                        reason: "bare-zero-in-directional-array",
                        field: "outcomes[" + i + "]",
                        index: i
                    }
                };
            }
            if (!Number.isFinite(values[i])) return violation("outcome-value-not-finite", "outcomes[" + i + "]");
        }
        return { ok: true, outcomes: values.slice() };
    }

    /* ── routeOutcomes ──────────────────────────────────────────────────────────────────────
       The table applied to a cohort: `win` and `loss` become numbers in the directional array,
       the other four become counts beside it. `resolvedDirectional` is that array's length and
       therefore — because `winRate` divides by it — the published denominator, exposed here so a
       caller can branch BEFORE reaching a primitive that refuses an empty array.

       Every counted class is seeded at zero rather than added on first sight, so a class that
       never fired reads as an explicit `0` instead of a missing key. A missing key is how a
       bucket quietly leaves a partition that is supposed to sum to the proposed total. */
    function routeOutcomes(records) {
        if (!Array.isArray(records)) return violation("outcome-records-not-an-array", "records");

        var counts = {};
        var c;
        for (c = 0; c < COUNTED_OUTCOME_CLASSES.length; c += 1) counts[COUNTED_OUTCOME_CLASSES[c]] = 0;

        var directional = [];
        for (var i = 0; i < records.length; i += 1) {
            if (!isPlainObject(records[i])) return violation("outcome-record-not-an-object", "records[" + i + "]");
            var routed = outcomeContributionFor(records[i].outcomeClass);
            if (!routed.ok) return routed;
            if (routed.contribution === CONTRIBUTION_COUNT) {
                counts[routed.outcomeClass] += 1;
                continue;
            }
            if (!Number.isFinite(records[i].outcomeValue)) {
                return violation("outcome-value-not-finite", "records[" + i + "].outcomeValue");
            }
            directional.push(records[i].outcomeValue);
        }

        /* The same gate applied where the array is BUILT, not only where it is consumed: a
           resolved-flat value mis-routed onto the number side refuses with RTR-FLAT-ZERO rather
           than being summarised as a claim that never resolved. */
        var gated = assertZeroFreeOutcomes(directional);
        if (!gated.ok) return gated;

        return {
            ok: true,
            directional: gated.outcomes,
            counts: counts,
            resolvedDirectional: gated.outcomes.length
        };
    }

    /* ── directionalDenominator ─────────────────────────────────────────────────────────────
       The denominator contract, declared rather than left as a convention two surfaces are
       trusted to keep. `winRate` divides by the fed array's length, so `resolvedDirectional` is
       not a quantity that HAPPENS to agree with the published denominator — it IS it, and this
       binds the two at one place so they cannot drift apart.

       No statistic is computed. `summary` is the primitive's own frozen result, read verbatim;
       the only work here is refusing the pairings that would make the label a lie:

       - a summary produced from a DIFFERENT array than the one routing built (`count` mismatch),
         which is how a filtered, padded or re-derived array quietly moves the denominator;
       - `wins + losses !== resolvedDirectional`, which under the zero-free convention can only
         mean a zero reached the array and was absorbed into the primitive's `unresolved`;
       - a rate published with no denominator to publish beside it (`resolvedDirectional === 0`),
         which is the branch the caller is expected to take BEFORE calling at all. */
    function directionalDenominator(routed, summary) {
        if (!isPlainObject(routed) || routed.ok !== true || !Array.isArray(routed.directional)
            || !Number.isInteger(routed.resolvedDirectional)) {
            return violation("routed-outcomes-invalid", "routed");
        }
        if (routed.resolvedDirectional !== routed.directional.length) {
            return violation("resolved-directional-is-not-the-fed-array-length", "resolvedDirectional");
        }
        if (routed.resolvedDirectional === 0) {
            return violation("no-directional-denominator-to-publish", "resolvedDirectional");
        }

        if (!isPlainObject(summary) || summary.ok !== true || !Number.isInteger(summary.count)
            || !Number.isInteger(summary.wins) || !Number.isInteger(summary.losses)
            || !Number.isFinite(summary.winRate)) {
            return violation("outcome-summary-invalid", "summary");
        }
        if (summary.count !== routed.resolvedDirectional) {
            return violation("summary-count-is-not-the-fed-array-length", "count");
        }
        if (summary.wins + summary.losses !== routed.resolvedDirectional) {
            return violation("wins-plus-losses-is-not-the-fed-array-length", "resolvedDirectional");
        }

        return {
            ok: true,
            label: DIRECTIONAL_RATE_LABEL,
            resolvedDirectional: routed.resolvedDirectional,
            wins: summary.wins,
            losses: summary.losses,
            /* The primitive's own value passed through — never recomputed here, because a second
               division is a second answer, and the two would eventually disagree. */
            rate: summary.winRate
        };
    }

    /* ── The closure-event vocabulary, read from its single definition ─────────────────────
       `CLOSE_EVENT_TYPES` is private to rlcontracts.js — it is NOT on that module's exported api
       (measured: 20 keys, none matching /clos|EVENT_TYPE/i). Rather than shadow it with a second
       copy that would silently go stale, the frozen literal is read out of the module's own
       source text, exactly as MARKET_ACTIONS and ACTION_DIRECTION already are. There is therefore
       exactly one definition in the repository, and if the literal moves or changes shape this
       THROWS instead of validating against a stale vocabulary. */
    function readClosureEventVocabulary(sourceText) {
        if (typeof sourceText !== "string" || sourceText.length === 0) {
            throw new Error("rlclaims: " + CLOSURE_VOCABULARY_SOURCE + " source text is required to read the closure-event vocabulary");
        }
        var literal = extractFrozenLiteral(sourceText, "CLOSE_EVENT_TYPES");
        if (!literal) throw new Error("rlclaims: CLOSE_EVENT_TYPES not found in " + CLOSURE_VOCABULARY_SOURCE);

        var names = Object.keys(literal).sort();
        if (names.length === 0) throw new Error("rlclaims: CLOSE_EVENT_TYPES is empty in " + CLOSURE_VOCABULARY_SOURCE);
        for (var i = 0; i < names.length; i += 1) {
            if (literal[names[i]] !== true) {
                throw new Error("rlclaims: CLOSE_EVENT_TYPES member '" + names[i] + "' changed shape in " + CLOSURE_VOCABULARY_SOURCE);
            }
        }

        /* Every closure event 015 emits must still exist upstream. A renamed member would leave
           the pairing table pointing at nothing and silently stop admitting a whole outcome
           class — a vocabulary drift that presents as an empty column rather than as an error. */
        var classes = Object.keys(OUTCOME_CLOSURE_EVENTS);
        for (var c = 0; c < classes.length; c += 1) {
            var allowed = OUTCOME_CLOSURE_EVENTS[classes[c]];
            for (var a = 0; a < allowed.length; a += 1) {
                if (names.indexOf(allowed[a]) === -1) {
                    throw new Error("rlclaims: closure event '" + allowed[a] + "' is absent from CLOSE_EVENT_TYPES in " + CLOSURE_VOCABULARY_SOURCE);
                }
            }
        }
        return Object.freeze(names);
    }

    /* ── resolutionHash ────────────────────────────────────────────────────────────────────
       Exactly the eight hashed terms. `eventId` and `lifecycleBinding` — which carry `runId` and
       the wall clock — are excluded, so two passes over unchanged inputs recompute one address
       and the repeat write is a byte-identical no-op. */
    function resolutionHashedTermsOf(resolution) {
        var terms = {};
        for (var i = 0; i < RESOLUTION_HASHED_TERMS.length; i += 1) {
            terms[RESOLUTION_HASHED_TERMS[i]] = resolution[RESOLUTION_HASHED_TERMS[i]];
        }
        return terms;
    }

    function resolutionHash(resolution) { return stableSha(resolutionHashedTermsOf(resolution)); }

    function resolutionObjectPath(hash) {
        var hex = String(hash).replace(/^sha256:/, "");
        if (!/^[a-f0-9]{64}$/.test(hex)) throw new Error("rlclaims: resolutionHash is not a bare lowercase sha256 hex");
        return RESOLUTION_STORE_DIR + "/" + hex + ".json";
    }

    function serializeResolution(resolution) { return stableStringify(resolution); }

    /* ── buildResolution ────────────────────────────────────────────────────────────────────
       One resolved claim to one `brief-recommendation-resolution/v1` record.

       The value is carried through VERBATIM — no rounding, no `±ε` nudge, no fabricated sign.
       Rounding lives at render, so identical inputs produce identical bits, which is what
       determinism actually requires. What varies between a flat outcome and a small win is the
       ROUTING the class implies, never the number the record stores. */
    function buildResolution(input) {
        if (!isPlainObject(input)) return violation("resolution-input-invalid", "input");

        var vocabulary = input.closureVocabulary;
        if (!Array.isArray(vocabulary) || vocabulary.length === 0) {
            return violation("closure-vocabulary-invalid", "closureVocabulary");
        }

        var routed = outcomeContributionFor(input.outcomeClass);
        if (!routed.ok) return routed;
        var outcomeClass = routed.outcomeClass;

        var allowedClosures = OUTCOME_CLOSURE_EVENTS[outcomeClass];
        if (!Array.isArray(allowedClosures)) return violation("outcome-class-has-no-closure-mapping", "outcomeClass");
        if (allowedClosures.length === 0) return violation("outcome-class-carries-no-resolution", "outcomeClass");

        /* The 002-owned vocabulary is the ACCEPTANCE set and is checked first, so a value outside
           it refuses for what it is rather than for the pairing it happens to miss. The SUPPLIED
           array is the set — restating the six members here would be the stale shadow copy that
           `readClosureEventVocabulary` exists to avoid, and a restricted vocabulary would then
           silently fail to restrict. */
        if (!inSet(vocabulary, input.closureEventType)) {
            return {
                ok: false,
                error: { code: CLOSURE_VOCAB_CODE, reason: "closure-event-not-in-vocabulary", field: "closureEventType" }
            };
        }
        if (allowedClosures.indexOf(input.closureEventType) === -1) {
            return violation("closure-event-not-allowed-for-outcome-class", "closureEventType");
        }

        var allowedReasons = CLOSURE_REASON_CODES[input.closureEventType];
        if (!Array.isArray(allowedReasons)) return violation("closure-event-has-no-reason-codes", "closureEventType");
        if (!inSet(allowedReasons, input.reasonCode)) {
            return violation("reason-code-not-allowed-for-closure-event", "reasonCode");
        }

        if (!nonEmptyString(input.claimHash) || !CLAIM_REF_PATTERN.test(input.claimHash)) {
            return violation("claim-hash-not-opaque-sha256", "claimHash");
        }
        if (!nonEmptyString(input.eventId)) return violation("event-id-absent", "eventId");

        /* A SESSION date, not a wall clock. The date is hashed, so a timestamp here would move
           the content address on every pass; and the resolver resolves against sessions, so a
           value carrying a time of day would describe a read the resolver never performed. */
        if (!nonEmptyString(input.resolutionDate) || !SESSION_DATE_PATTERN.test(input.resolutionDate)) {
            return violation("resolution-date-not-a-session-date", "resolutionDate");
        }

        var carriesMagnitude = inSet(MAGNITUDE_BEARING_OUTCOME_CLASSES, outcomeClass);
        if (carriesMagnitude) {
            if (!Number.isFinite(input.outcomeValue)) return violation("outcome-value-not-finite", "outcomeValue");
            /* A directional class holding an exact zero is HC-7 arriving one step earlier than
               the array gate: the primitive would drop it into `unresolved`, so it refuses here
               with the same owned code rather than being summarised as never resolved. */
            if (routed.contribution === CONTRIBUTION_NUMBER && input.outcomeValue === 0) {
                return {
                    ok: false,
                    error: { code: FLAT_ZERO_CODE, reason: "bare-zero-in-directional-class", field: "outcomeValue" }
                };
            }
            if (outcomeClass === "win" && !(input.outcomeValue > 0)) {
                return violation("outcome-value-sign-contradicts-class", "outcomeValue");
            }
            if (outcomeClass === "loss" && !(input.outcomeValue < 0)) {
                return violation("outcome-value-sign-contradicts-class", "outcomeValue");
            }
        } else if (input.outcomeValue !== null) {
            /* `null` is required rather than absent, because an absent key and a null one read
               the same to a consumer that only asks whether a value is falsy. */
            return violation("outcome-value-must-be-null", "outcomeValue");
        }

        if (!isPlainObject(input.provenance)) return violation("provenance-not-an-object", "provenance");
        var provenanceKeys = Object.keys(input.provenance);
        for (var p = 0; p < provenanceKeys.length; p += 1) {
            if (inSet(RUN_SCOPED_KEYS, provenanceKeys[p])) {
                return violation("run-scoped-key-in-hashed-provenance", "provenance." + provenanceKeys[p]);
            }
        }
        if (!isPlainObject(input.lifecycleBinding)) return violation("lifecycle-binding-not-an-object", "lifecycleBinding");

        var resolution = {
            contractVersion: RESOLUTION_CONTRACT_VERSION,
            claimHash: input.claimHash,
            eventId: input.eventId,
            resolutionDate: input.resolutionDate,
            closureEventType: input.closureEventType,
            outcomeClass: outcomeClass,
            /* Verbatim. `sortValue` is applied to the two object blocks so key order cannot vary
               the address, and to nothing else — a number is never passed through a transform. */
            outcomeValue: carriesMagnitude ? input.outcomeValue : null,
            reasonCode: input.reasonCode,
            provenance: sortValue(input.provenance),
            lifecycleBinding: sortValue(input.lifecycleBinding),
            resolutionHash: null
        };
        resolution.resolutionHash = resolutionHash(resolution);
        return { ok: true, resolution: resolution, contribution: routed.contribution };
    }

    /* ── The content-addressed resolution store ─────────────────────────────────────────────
       Mirrors the claim store's depth (`briefs/objects/claims`) and the evidence store's bare
       lowercase-hex filename. Re-resolving an unchanged claim recomputes the identical hash and
       writes identical bytes; a write that would CHANGE the bytes at an existing address aborts
       with RTR-RESOLUTION-CONFLICT and never overwrites. */
    function writeResolutionObject(resolution, row, ports) {
        /* Scope 02's gate FIRST, before the resolution is inspected in any way. It owns the
           single question of whether the target row may be resolved at all, and its rule order is
           what makes a claimless row unscoreable BY CONSTRUCTION: no property of a well-formed
           resolution can rescue one. Called, never re-implemented and never bypassed. */
        var authorized = authorizeResolutionWrite(row, resolution);
        if (!authorized.ok) return authorized;

        if (!isPlainObject(ports) || typeof ports.existsSync !== "function"
            || typeof ports.readFileSync !== "function" || typeof ports.writeFileSync !== "function"
            || typeof ports.mkdirSync !== "function") {
            throw new Error("rlclaims: writeResolutionObject requires { existsSync, readFileSync, writeFileSync, mkdirSync }");
        }

        if (resolution.contractVersion !== RESOLUTION_CONTRACT_VERSION) {
            return violation("resolution-contract-version-not-allowed", "contractVersion");
        }
        var unknown = hasOnlyFields(resolution, RESOLUTION_FIELDS);
        if (unknown !== null) return violation("unknown-field", unknown);
        for (var f = 0; f < RESOLUTION_FIELDS.length; f += 1) {
            if (!Object.prototype.hasOwnProperty.call(resolution, RESOLUTION_FIELDS[f])) {
                return violation("required-field-absent", RESOLUTION_FIELDS[f]);
            }
        }
        /* The address must BE the content. A record whose digest does not cover its own terms
           would be filed under a name that says nothing about what is inside it. */
        if (resolution.resolutionHash !== resolutionHash(resolution)) {
            return violation("resolution-hash-does-not-match-content", "resolutionHash");
        }
        /* The resolution must be ABOUT the claim the row points at. The gate returns that pointer
           precisely so it can be bound rather than assumed. */
        if (resolution.claimHash !== authorized.claimRef) {
            return violation("resolution-claim-hash-does-not-match-row", "claimHash");
        }

        var root = nonEmptyString(ports.root) ? ports.root : "";
        var relativePath = resolutionObjectPath(resolution.resolutionHash);
        var fullPath = root ? root + "/" + relativePath : relativePath;
        var bytes = serializeResolution(resolution);

        if (ports.existsSync(fullPath)) {
            var existing = ports.readFileSync(fullPath, "utf8");
            if (existing === bytes) return { ok: true, path: relativePath, written: false, reused: true };
            return {
                ok: false,
                error: {
                    code: RESOLUTION_CONFLICT_CODE,
                    reason: "resolution-conflict-refused",
                    field: "resolutionHash",
                    path: relativePath
                }
            };
        }

        var directory = root ? root + "/" + RESOLUTION_STORE_DIR : RESOLUTION_STORE_DIR;
        ports.mkdirSync(directory, { recursive: true });
        ports.writeFileSync(fullPath, bytes);
        return { ok: true, path: relativePath, written: true, reused: false };
    }

    /* ── assertClassPartition ───────────────────────────────────────────────────────────────
       Asserted, not asserted-to. A failure means a claim fell out of the accounting, which is
       precisely how a denominator gets quietly flattered.

       An ABSENT bucket refuses rather than reading as zero, and an unknown bucket name refuses
       rather than being ignored. Both are the same defect seen from two sides: a mistyped bucket
       silently contributes nothing while looking like it contributes, and that is exactly how a
       class leaves a partition without anyone noticing. */
    function assertClassPartition(parts) {
        if (!isPlainObject(parts)) return violation("partition-input-invalid", "parts");

        var unknown = hasOnlyFields(parts, unionSorted([PARTITION_BUCKETS, ["totalProposed"]]));
        if (unknown !== null) return violation("unknown-partition-bucket", unknown);

        if (!Number.isInteger(parts.totalProposed) || parts.totalProposed < 0) {
            return violation("partition-total-not-a-count", "totalProposed");
        }

        var buckets = {};
        var sum = 0;
        for (var i = 0; i < PARTITION_BUCKETS.length; i += 1) {
            var name = PARTITION_BUCKETS[i];
            if (!Object.prototype.hasOwnProperty.call(parts, name)) {
                return violation("partition-bucket-absent", name);
            }
            if (!Number.isInteger(parts[name]) || parts[name] < 0) {
                return violation("partition-bucket-not-a-count", name);
            }
            buckets[name] = parts[name];
            sum += parts[name];
        }

        if (sum !== parts.totalProposed) {
            return {
                ok: false,
                error: {
                    code: CONTRACT_VIOLATION_CODE,
                    reason: "partition-does-not-sum-to-proposed",
                    field: "totalProposed",
                    sum: sum,
                    totalProposed: parts.totalProposed,
                    unaccounted: parts.totalProposed - sum
                }
            };
        }
        return { ok: true, buckets: buckets, sum: sum, totalProposed: parts.totalProposed };
    }

    /* The partition built FROM the routing rather than counted a second time beside it. Two
       independent tallies of one cohort is how the visible report and the published denominator
       come to disagree, so the five class buckets are derived from `routeOutcomes`' own result
       and only the two lifecycle buckets — states no outcome class describes — are supplied. */
    function classPartition(routed, lifecycle) {
        if (!isPlainObject(routed) || routed.ok !== true || !Array.isArray(routed.directional)
            || !isPlainObject(routed.counts) || !Number.isInteger(routed.resolvedDirectional)) {
            return violation("routed-outcomes-invalid", "routed");
        }
        if (!isPlainObject(lifecycle)) return violation("lifecycle-counts-invalid", "lifecycle");

        var parts = { totalProposed: lifecycle.totalProposed };
        for (var b = 0; b < PARTITION_BUCKETS.length; b += 1) parts[PARTITION_BUCKETS[b]] = 0;
        parts.resolvedDirectional = routed.resolvedDirectional;

        var counted = Object.keys(routed.counts);
        for (var c = 0; c < counted.length; c += 1) {
            if (!Object.prototype.hasOwnProperty.call(PARTITION_BUCKET_FOR_CLASS, counted[c])) {
                return violation("partition-bucket-undeclared-for-class", counted[c]);
            }
            parts[PARTITION_BUCKET_FOR_CLASS[counted[c]]] += routed.counts[counted[c]];
        }

        for (var n = 0; n < NON_CLASS_PARTITION_BUCKETS.length; n += 1) {
            var lifecycleName = NON_CLASS_PARTITION_BUCKETS[n];
            if (!Object.prototype.hasOwnProperty.call(lifecycle, lifecycleName)) {
                return violation("lifecycle-count-absent", lifecycleName);
            }
            parts[lifecycleName] = lifecycle[lifecycleName];
        }

        return assertClassPartition(parts);
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
        /* Finite AND strictly positive, never defaulted: `resolved-flat` is `|outcome| <= flatBand`,
           so a null or zero band makes the flat class unreachable and a negative one makes it empty. */
        if (!Number.isFinite(claim.magnitude.flatBand) || claim.magnitude.flatBand <= 0) {
            return { reason: "no-authored-flat-band", field: "magnitude.flatBand" };
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
        OUTCOME_CLASSES: OUTCOME_CLASSES,
        OUTCOME_CONTRIBUTIONS: OUTCOME_CONTRIBUTIONS,
        DIRECTIONAL_OUTCOME_CLASSES: DIRECTIONAL_OUTCOME_CLASSES,
        COUNTED_OUTCOME_CLASSES: COUNTED_OUTCOME_CLASSES,
        CONTRIBUTION_NUMBER: CONTRIBUTION_NUMBER,
        CONTRIBUTION_COUNT: CONTRIBUTION_COUNT,
        DIRECTIONAL_RATE_LABEL: DIRECTIONAL_RATE_LABEL,
        MAGNITUDE_BEARING_OUTCOME_CLASSES: MAGNITUDE_BEARING_OUTCOME_CLASSES,
        FLAT_ZERO_CODE: FLAT_ZERO_CODE,
        RESOLUTION_CONTRACT_VERSION: RESOLUTION_CONTRACT_VERSION,
        RESOLUTION_STORE_DIR: RESOLUTION_STORE_DIR,
        RESOLUTION_HASHED_TERMS: RESOLUTION_HASHED_TERMS,
        RESOLUTION_UNHASHED_FIELDS: RESOLUTION_UNHASHED_FIELDS,
        RESOLUTION_FIELDS: RESOLUTION_FIELDS,
        RUN_SCOPED_KEYS: RUN_SCOPED_KEYS,
        CLOSURE_VOCABULARY_SOURCE: CLOSURE_VOCABULARY_SOURCE,
        CLOSURE_VOCAB_CODE: CLOSURE_VOCAB_CODE,
        RESOLUTION_CONFLICT_CODE: RESOLUTION_CONFLICT_CODE,
        OUTCOME_CLOSURE_EVENTS: OUTCOME_CLOSURE_EVENTS,
        CLOSURE_REASON_CODES: CLOSURE_REASON_CODES,
        RESOLVER_NOT_EVALUABLE_REASONS: RESOLVER_NOT_EVALUABLE_REASONS,
        NOT_EVALUABLE_REASONS: NOT_EVALUABLE_REASONS,
        PARTITION_BUCKET_FOR_CLASS: PARTITION_BUCKET_FOR_CLASS,
        NON_CLASS_PARTITION_BUCKETS: NON_CLASS_PARTITION_BUCKETS,
        PARTITION_BUCKETS: PARTITION_BUCKETS,
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
        flatBandFor: flatBandFor,
        outcomeContributionFor: outcomeContributionFor,
        classifyOutcome: classifyOutcome,
        assertZeroFreeOutcomes: assertZeroFreeOutcomes,
        routeOutcomes: routeOutcomes,
        directionalDenominator: directionalDenominator,
        buildResolution: buildResolution,
        resolutionHash: resolutionHash,
        resolutionObjectPath: resolutionObjectPath,
        serializeResolution: serializeResolution,
        writeResolutionObject: writeResolutionObject,
        assertClassPartition: assertClassPartition,
        classPartition: classPartition,
        stableStringify: stableStringify,
        sha256Hex: sha256Hex,
        stableSha: stableSha,
        readFoundationActionVocabulary: readFoundationActionVocabulary,
        readClosureEventVocabulary: readClosureEventVocabulary,
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
