(function () {
  "use strict";

  var root = (typeof globalThis !== "undefined") ? globalThis :
    ((typeof window !== "undefined") ? window : {});
  var HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
  var SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9._:/-]*$/;
  var SAFE_REASON_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
  var TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
  var CANONICAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  var TIMESTAMP_KEYS = Object.freeze({
    acquisitionStartedAt: true,
    at: true,
    barEnd: true,
    barStart: true,
    capturedAt: true,
    coverageEnd: true,
    coverageStart: true,
    cutoffAt: true,
    endUtc: true,
    latestAt: true,
    lockedAt: true,
    occurredAt: true,
    observedAt: true,
    releasedAt: true,
    retrievedAt: true,
    scheduledAt: true,
    scheduledFor: true,
    sourcePublishedAt: true,
    startUtc: true
  });
  var SET_LIKE_ARRAY_KEYS = Object.freeze({
    corporateActionRefs: true,
    diagnostics: true,
    evidenceIds: true,
    evidenceRefs: true,
    peerRefs: true,
    provenanceRefs: true,
    reasonCodes: true,
    sourceRefs: true,
    subjects: true
  });
  var SEMANTIC_VOLATILE_KEYS = Object.freeze({
    cutoffAt: true,
    evidenceId: true,
    freshnessState: true,
    occurrenceFingerprint: true,
    retrievedAt: true,
    runId: true
  });
  var SOURCE_IDS = Object.freeze({
    "bls-cpi-schedule": true,
    "bls-public-api-v2": true,
    "manual-consensus-artifact": true,
    "nyse-hours-calendar": true,
    "yahoo-chart": true
  });
  var SOURCE_POLICIES = Object.freeze({
    "bls-cpi-schedule": Object.freeze({ sourceKind: "official-report", accessClass: "public-official", host: "www.bls.gov", method: "GET", path: "/schedule/news_release/cpi.htm" }),
    "bls-public-api-v2": Object.freeze({ sourceKind: "official-report", accessClass: "public-official", host: "api.bls.gov", method: "POST", path: "/publicAPI/v2/timeseries/data/" }),
    "manual-consensus-artifact": Object.freeze({ sourceKind: "sourced-consensus", accessClass: "public-manual-citation", host: null, method: "GET", path: null }),
    "nyse-hours-calendar": Object.freeze({ sourceKind: "official-calendar", accessClass: "public-official", host: "www.nyse.com", method: "GET", path: "/markets/hours-calendars" }),
    "yahoo-chart": Object.freeze({ sourceKind: "best-effort-public-chart", accessClass: "public-best-effort", host: "query1.finance.yahoo.com", method: "GET", pathPrefix: "/v8/finance/chart/" })
  });
  var SOURCE_KINDS = Object.freeze({
    "best-effort-public-chart": true,
    "official-calendar": true,
    "official-report": true,
    "sourced-consensus": true
  });
  var ACCESS_CLASSES = Object.freeze({
    "public-best-effort": true,
    "public-manual-citation": true,
    "public-official": true
  });
  var RETENTION_MODES = Object.freeze({
    "citation-only": true,
    "no-publication": true,
    "normalized-facts-and-hash": true
  });
  var FRESHNESS_STATES = Object.freeze({
    current: true,
    stale: true,
    "not-applicable": true
  });
  var EVIDENCE_TYPES = Object.freeze({
    "calendar-session": true,
    "comparable-volume-baseline": true,
    "event-market-reaction": true,
    "market-session-evidence": true,
    "released-report-evidence": true,
    "session-aggregate": true,
    "session-observation": true
  });
  var EVIDENCE_STATES = Object.freeze({
    available: true,
    complete: true,
    disputed: true,
    misaligned: true,
    partial: true,
    qualified: true,
    released: true,
    revised: true,
    stale: true,
    thin: true,
    unavailable: true,
    upcoming: true
  });
  var SOURCE_PROVENANCE_FIELDS = Object.freeze([
    "accessClass",
    "adapterId",
    "adapterVersion",
    "contentSha256",
    "contractVersion",
    "diagnostics",
    "freshnessPolicy",
    "freshnessState",
    "requestDescriptor",
    "retentionMode",
    "retrievedAt",
    "sourceId",
    "sourceKind",
    "sourcePublishedAt",
    "sourceUrl",
    "sourceUsePolicyId",
    "sourceUseReviewRef"
  ]);
  var EVIDENCE_REFERENCE_FIELDS = Object.freeze([
    "contractVersion",
    "cutoffAt",
    "evidenceType",
    "fingerprint",
    "path",
    "provenanceRefs",
    "sha256",
    "state"
  ]);
  /* Closed briefing contract vocabulary (design.md Registry Entry Contract). These are the
     design-fixed allowed roles/profiles and the required per-entry field set — structural
     contract, NOT tunable policy values. The concrete freshness/recommendation/budget policy
     VALUES a given profile must resolve to are supplied by the caller-provided config, never a
     default in this module. */
  var BRIEFING_ENTRY_FIELDS = Object.freeze([
    "budgetPolicy",
    "freshnessPolicy",
    "profile",
    "readAdapter",
    "readContractVersion",
    "recommendationPolicy",
    "role"
  ]);
  var BRIEFING_POLICY_ID_FIELDS = Object.freeze([
    "readAdapter",
    "readContractVersion",
    "freshnessPolicy",
    "recommendationPolicy",
    "budgetPolicy"
  ]);
  var BRIEFING_PROFILE_ROLE = Object.freeze({
    "live-market": "source",
    "static-model": "source",
    "local-model": "source",
    "off-theme": "source",
    "final-aggregator": "final-aggregator"
  });
  var SHA256_CONSTANTS = Object.freeze([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function contractError(reason, field) {
    var error = new Error(reason);
    error.name = "RLContractError";
    error.code = "B002-INPUT-REJECTED";
    error.reason = reason;
    if (field) error.field = field;
    return error;
  }

  function failure(reason, field) {
    return {
      ok: false,
      error: {
        contractVersion: "evidence-error/v1",
        code: "B002-INPUT-REJECTED",
        reason: reason,
        field: field
      }
    };
  }

  function success(value) {
    return { ok: true, value: value };
  }

  function isPlainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== "[object Object]") return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

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

  function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
  }

  function normalizeTimestamp(value, field) {
    if (!isNonEmptyString(value) || !TIMESTAMP_PATTERN.test(value)) {
      throw contractError("timestamp-offset-required", field);
    }
    var epoch = Date.parse(value);
    if (!Number.isFinite(epoch)) throw contractError("timestamp-invalid", field);
    return new Date(epoch).toISOString();
  }

  function utf8Bytes(value) {
    var bytes = [];
    var index;
    for (index = 0; index < value.length; index += 1) {
      var codePoint = value.charCodeAt(index);
      if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
        if (index + 1 >= value.length) throw contractError("invalid-unicode", "value");
        var low = value.charCodeAt(index + 1);
        if (low < 0xdc00 || low > 0xdfff) throw contractError("invalid-unicode", "value");
        codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (low - 0xdc00);
        index += 1;
      } else if (codePoint >= 0xdc00 && codePoint <= 0xdfff) {
        throw contractError("invalid-unicode", "value");
      }
      if (codePoint <= 0x7f) {
        bytes.push(codePoint);
      } else if (codePoint <= 0x7ff) {
        bytes.push(0xc0 | (codePoint >>> 6));
        bytes.push(0x80 | (codePoint & 0x3f));
      } else if (codePoint <= 0xffff) {
        bytes.push(0xe0 | (codePoint >>> 12));
        bytes.push(0x80 | ((codePoint >>> 6) & 0x3f));
        bytes.push(0x80 | (codePoint & 0x3f));
      } else {
        bytes.push(0xf0 | (codePoint >>> 18));
        bytes.push(0x80 | ((codePoint >>> 12) & 0x3f));
        bytes.push(0x80 | ((codePoint >>> 6) & 0x3f));
        bytes.push(0x80 | (codePoint & 0x3f));
      }
    }
    return bytes;
  }

  function rotateRight(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

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

    var hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    var words = new Int32Array(64);
    var offset;
    for (offset = 0; offset < bytes.length; offset += 64) {
      for (index = 0; index < 16; index += 1) {
        var wordOffset = offset + index * 4;
        words[index] = (bytes[wordOffset] << 24) |
          (bytes[wordOffset + 1] << 16) |
          (bytes[wordOffset + 2] << 8) |
          bytes[wordOffset + 3];
      }
      for (index = 16; index < 64; index += 1) {
        var previous15 = words[index - 15];
        var previous2 = words[index - 2];
        var sigma0 = rotateRight(previous15, 7) ^ rotateRight(previous15, 18) ^ (previous15 >>> 3);
        var sigma1 = rotateRight(previous2, 17) ^ rotateRight(previous2, 19) ^ (previous2 >>> 10);
        words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) | 0;
      }

      var a = hash[0];
      var b = hash[1];
      var c = hash[2];
      var d = hash[3];
      var e = hash[4];
      var f = hash[5];
      var g = hash[6];
      var h = hash[7];
      for (index = 0; index < 64; index += 1) {
        var sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
        var choice = (e & f) ^ ((~e) & g);
        var temporary1 = (h + sum1 + choice + SHA256_CONSTANTS[index] + words[index]) | 0;
        var sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
        var majority = (a & b) ^ (a & c) ^ (b & c);
        var temporary2 = (sum0 + majority) | 0;
        h = g;
        g = f;
        f = e;
        e = (d + temporary1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temporary1 + temporary2) | 0;
      }
      hash[0] = (hash[0] + a) | 0;
      hash[1] = (hash[1] + b) | 0;
      hash[2] = (hash[2] + c) | 0;
      hash[3] = (hash[3] + d) | 0;
      hash[4] = (hash[4] + e) | 0;
      hash[5] = (hash[5] + f) | 0;
      hash[6] = (hash[6] + g) | 0;
      hash[7] = (hash[7] + h) | 0;
    }

    var output = "";
    for (index = 0; index < hash.length; index += 1) {
      output += (hash[index] >>> 0).toString(16).padStart(8, "0");
    }
    return output;
  }

  function normalizedValue(value, key, stack) {
    if (value === undefined) throw contractError("undefined-value", key || "value");
    if (value === null || typeof value === "boolean" || typeof value === "string") {
      if (typeof value === "string" && TIMESTAMP_KEYS[key]) return normalizeTimestamp(value, key);
      return value;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw contractError("non-finite-number", key || "value");
      return Object.is(value, -0) ? 0 : value;
    }
    if (typeof value !== "object") throw contractError("unsupported-value-type", key || "value");
    if (stack.indexOf(value) !== -1) throw contractError("cyclic-value", key || "value");
    stack.push(value);
    var result;
    var index;
    if (Array.isArray(value)) {
      result = [];
      for (index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index)) throw contractError("sparse-array", key || "value");
        result.push(normalizedValue(value[index], key, stack));
      }
      if (SET_LIKE_ARRAY_KEYS[key]) {
        result.sort(function (left, right) {
          var leftKey = JSON.stringify(left);
          var rightKey = JSON.stringify(right);
          return leftKey < rightKey ? -1 : (leftKey > rightKey ? 1 : 0);
        });
        var unique = [];
        var previous = null;
        for (index = 0; index < result.length; index += 1) {
          var encoded = JSON.stringify(result[index]);
          if (index === 0 || encoded !== previous) unique.push(result[index]);
          previous = encoded;
        }
        result = unique;
      }
    } else {
      if (!isPlainObject(value)) throw contractError("non-plain-object", key || "value");
      result = {};
      var keys = Object.keys(value).sort();
      for (index = 0; index < keys.length; index += 1) {
        result[keys[index]] = normalizedValue(value[keys[index]], keys[index], stack);
      }
    }
    stack.pop();
    return result;
  }

  function canonicalize(value, contractVersion) {
    if (!isNonEmptyString(contractVersion) || !SAFE_ID_PATTERN.test(contractVersion)) {
      throw contractError("canonical-contract-version-required", "contractVersion");
    }
    return JSON.stringify(normalizedValue(value, "", []));
  }

  function identityContractVersion(value) {
    if (!isPlainObject(value) || !isNonEmptyString(value.contractVersion)) {
      throw contractError("identity-contract-version-required", "contractVersion");
    }
    return value.contractVersion;
  }

  function fingerprint(kind, value) {
    if (!isNonEmptyString(kind) || !SAFE_ID_PATTERN.test(kind)) {
      throw contractError("fingerprint-kind-invalid", "kind");
    }
    var contractVersion = identityContractVersion(value);
    var canonical = canonicalize(value, contractVersion);
    return "sha256:" + sha256Hex(kind + "\n" + contractVersion + "\n" + canonical);
  }

  function contentSha256(value, contractVersion) {
    return "sha256:" + sha256Hex(canonicalize(value, contractVersion));
  }

  function withoutSemanticVolatileFields(value) {
    if (Array.isArray(value)) {
      return value.map(withoutSemanticVolatileFields);
    }
    if (!isPlainObject(value)) return value;
    var output = {};
    Object.keys(value).forEach(function (key) {
      if (!SEMANTIC_VOLATILE_KEYS[key]) output[key] = withoutSemanticVolatileFields(value[key]);
    });
    return output;
  }

  function semanticFingerprint(kind, value) {
    return fingerprint(kind + "/semantic", withoutSemanticVolatileFields(value));
  }

  function occurrenceFingerprint(kind, value) {
    return fingerprint(kind + "/occurrence", value);
  }

  function validateCanonicalTimestamp(value, field, nullable) {
    if (value === null && nullable) return null;
    try {
      var normalized = normalizeTimestamp(value, field);
      if (!CANONICAL_TIMESTAMP_PATTERN.test(value) || normalized !== value) return "timestamp-not-canonical-utc";
    } catch (error) {
      return error.reason || "timestamp-invalid";
    }
    return null;
  }

  function validateSafeString(value, field) {
    if (!isNonEmptyString(value) || !SAFE_ID_PATTERN.test(value)) return failure("invalid-safe-string", field);
    return null;
  }

  function validateRequestBodyValue(value, field, forbiddenKey) {
    if (value === null || typeof value === "string" || typeof value === "boolean") return null;
    if (typeof value === "number") return Number.isFinite(value) ? null : failure("request-body-value-invalid", field);
    if (Array.isArray(value)) {
      for (var index = 0; index < value.length; index += 1) {
        var arrayFailure = validateRequestBodyValue(value[index], field + "." + index, forbiddenKey);
        if (arrayFailure) return arrayFailure;
      }
      return null;
    }
    if (!isPlainObject(value)) return failure("request-body-value-invalid", field);
    var keys = Object.keys(value);
    for (var keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
      if (forbiddenKey.test(keys[keyIndex])) return failure("secret-shaped-request-field", field + "." + keys[keyIndex]);
      var objectFailure = validateRequestBodyValue(value[keys[keyIndex]], field + "." + keys[keyIndex], forbiddenKey);
      if (objectFailure) return objectFailure;
    }
    return null;
  }

  function validateRequestDescriptor(value) {
    if (!isPlainObject(value)) return failure("request-descriptor-required", "requestDescriptor");
    var unknown = hasOnlyFields(value, ["body", "method", "path", "query"]);
    if (unknown) return failure("unknown-field", "requestDescriptor." + unknown);
    if (value.method !== "GET" && value.method !== "POST") return failure("request-method-invalid", "requestDescriptor.method");
    if (!isNonEmptyString(value.path) || value.path.charAt(0) !== "/" || value.path.indexOf("..") !== -1) {
      return failure("request-path-invalid", "requestDescriptor.path");
    }
    if (!isPlainObject(value.query)) return failure("request-query-invalid", "requestDescriptor.query");
    var forbiddenKey = /(?:authorization|cookie|credential|key|password|secret|token)/i;
    var queryKeys = Object.keys(value.query);
    var index;
    for (index = 0; index < queryKeys.length; index += 1) {
      if (forbiddenKey.test(queryKeys[index])) return failure("secret-shaped-request-field", "requestDescriptor.query." + queryKeys[index]);
      var queryValue = value.query[queryKeys[index]];
      if (typeof queryValue !== "string" && typeof queryValue !== "number" && typeof queryValue !== "boolean") {
        return failure("request-query-value-invalid", "requestDescriptor.query." + queryKeys[index]);
      }
    }
    if (Object.prototype.hasOwnProperty.call(value, "body") && !isPlainObject(value.body)) {
      return failure("request-body-invalid", "requestDescriptor.body");
    }
    if (Object.prototype.hasOwnProperty.call(value, "body")) {
      var bodyFailure = validateRequestBodyValue(value.body, "requestDescriptor.body", forbiddenKey);
      if (bodyFailure) return bodyFailure;
    }
    return null;
  }

  function validateSourceProvenance(value) {
    if (!isPlainObject(value)) return failure("source-provenance-required", "source");
    var unknown = hasOnlyFields(value, SOURCE_PROVENANCE_FIELDS);
    if (unknown) return failure("unknown-field", unknown);
    if (value.contractVersion !== "source-provenance/v1") return failure("contract-version-invalid", "contractVersion");
    if (!SOURCE_IDS[value.sourceId]) return failure("source-id-not-allowlisted", "sourceId");
    var sourcePolicy = SOURCE_POLICIES[value.sourceId];
    var stringFields = ["adapterId", "adapterVersion", "sourceUsePolicyId", "sourceUseReviewRef", "freshnessPolicy"];
    var index;
    for (index = 0; index < stringFields.length; index += 1) {
      var stringFailure = validateSafeString(value[stringFields[index]], stringFields[index]);
      if (stringFailure) return stringFailure;
    }
    if (!SOURCE_KINDS[value.sourceKind]) return failure("source-kind-invalid", "sourceKind");
    if (value.sourceKind !== sourcePolicy.sourceKind) return failure("source-kind-mismatch", "sourceKind");
    if (!isNonEmptyString(value.sourceUrl)) return failure("source-url-invalid", "sourceUrl");
    var sourceUrl;
    try {
      sourceUrl = new URL(value.sourceUrl);
      if (sourceUrl.protocol !== "https:" || sourceUrl.username || sourceUrl.password || sourceUrl.hash) {
        return failure("source-url-invalid", "sourceUrl");
      }
    } catch (error) {
      return failure("source-url-invalid", "sourceUrl");
    }
    var requestFailure = validateRequestDescriptor(value.requestDescriptor);
    if (requestFailure) return requestFailure;
    if ((sourcePolicy.host && sourceUrl.hostname !== sourcePolicy.host) ||
        (sourcePolicy.path && (sourceUrl.pathname !== sourcePolicy.path || value.requestDescriptor.path !== sourcePolicy.path)) ||
        (sourcePolicy.pathPrefix && (sourceUrl.pathname.indexOf(sourcePolicy.pathPrefix) !== 0 || value.requestDescriptor.path !== sourceUrl.pathname)) ||
        value.requestDescriptor.method !== sourcePolicy.method) {
      return failure("source-url-not-allowlisted", "sourceUrl");
    }
    var publishedFailure = validateCanonicalTimestamp(value.sourcePublishedAt, "sourcePublishedAt", true);
    if (publishedFailure) return failure(publishedFailure, "sourcePublishedAt");
    var retrievedFailure = validateCanonicalTimestamp(value.retrievedAt, "retrievedAt", false);
    if (retrievedFailure) return failure(retrievedFailure, "retrievedAt");
    if (value.sourcePublishedAt !== null && Date.parse(value.sourcePublishedAt) > Date.parse(value.retrievedAt)) {
      return failure("source-time-order-invalid", "sourcePublishedAt");
    }
    if (!HASH_PATTERN.test(value.contentSha256 || "")) return failure("content-sha256-invalid", "contentSha256");
    if (!ACCESS_CLASSES[value.accessClass]) return failure("access-class-invalid", "accessClass");
    if (value.accessClass !== sourcePolicy.accessClass) return failure("access-class-mismatch", "accessClass");
    if (!RETENTION_MODES[value.retentionMode]) return failure("retention-mode-invalid", "retentionMode");
    if (!FRESHNESS_STATES[value.freshnessState]) return failure("freshness-state-invalid", "freshnessState");
    if (!Array.isArray(value.diagnostics)) return failure("diagnostics-invalid", "diagnostics");
    for (index = 0; index < value.diagnostics.length; index += 1) {
      if (!SAFE_REASON_PATTERN.test(value.diagnostics[index])) return failure("diagnostic-code-invalid", "diagnostics");
    }
    return success(JSON.parse(canonicalize(value, value.contractVersion)));
  }

  function validateRelativeRoot(value) {
    if (!isNonEmptyString(value) || value.charAt(0) === "/" || value.indexOf("\\") !== -1 || value.indexOf("?") !== -1 || value.indexOf("#") !== -1) return false;
    var parts = value.split("/");
    if (parts.some(function (part) { return !part || part === "." || part === ".."; })) return false;
    return true;
  }

  function validateEvidenceReference(value, policy) {
    if (!isPlainObject(policy) || !isNonEmptyString(policy.evidenceRoot)) return failure("evidence-root-required", "policy.evidenceRoot");
    if (!validateRelativeRoot(policy.evidenceRoot)) return failure("evidence-root-invalid", "policy.evidenceRoot");
    if (!isPlainObject(value)) return failure("evidence-reference-required", "reference");
    var unknown = hasOnlyFields(value, EVIDENCE_REFERENCE_FIELDS);
    if (unknown) return failure("unknown-field", unknown);
    if (value.contractVersion !== "evidence-reference/v1") return failure("contract-version-invalid", "contractVersion");
    if (!EVIDENCE_TYPES[value.evidenceType]) return failure("evidence-type-invalid", "evidenceType");
    if (!HASH_PATTERN.test(value.fingerprint || "")) return failure("fingerprint-invalid", "fingerprint");
    if (!validateRelativeRoot(value.path) || value.path.indexOf(policy.evidenceRoot + "/") !== 0) {
      return failure("evidence-path-outside-root", "path");
    }
    if (!HASH_PATTERN.test(value.sha256 || "")) return failure("content-sha256-invalid", "sha256");
    if (!EVIDENCE_STATES[value.state]) return failure("unknown-evidence-state", "state");
    var cutoffFailure = validateCanonicalTimestamp(value.cutoffAt, "cutoffAt", false);
    if (cutoffFailure) return failure(cutoffFailure, "cutoffAt");
    if (!Array.isArray(value.provenanceRefs)) return failure("provenance-refs-invalid", "provenanceRefs");
    for (var index = 0; index < value.provenanceRefs.length; index += 1) {
      if (!HASH_PATTERN.test(value.provenanceRefs[index])) return failure("provenance-ref-invalid", "provenanceRefs");
    }
    return success(JSON.parse(canonicalize(value, value.contractVersion)));
  }

  /* Freeze the complete runtime-discovered briefing registry from the committed tools.json.
     Counts are DERIVED from the live entries (never a literal or count-minus-one): every entry
     with a validated briefing role of `source` contributes to sourceCount; exactly one entry
     must be the `final-aggregator`, and it never appears in orderedSourceToolIds. When a config
     with per-profile policy bindings is supplied, each entry's freshness/recommendation/budget
     policy IDs must match its profile's committed binding — a mismatch fails loud before any
     source acquisition or authorship. No parallel source list is ever kept. */
  function validateRegistry(registry, config) {
    var tools;
    if (Array.isArray(registry)) tools = registry;
    else if (isPlainObject(registry) && Array.isArray(registry.tools)) tools = registry.tools;
    else return failure("registry-tools-required", "registry.tools");
    if (tools.length === 0) return failure("registry-empty", "registry.tools");

    var configProfiles = null;
    if (config !== undefined && config !== null) {
      if (!isPlainObject(config) || !isPlainObject(config.profiles)) return failure("registry-config-invalid", "config.profiles");
      configProfiles = config.profiles;
    }

    var orderedParticipantIds = [];
    var orderedSourceToolIds = [];
    var adapterSeen = Object.create(null);
    var participantSeen = Object.create(null);
    var entries = {};
    var aggregatorToolId = null;
    var index;
    var fieldIndex;
    for (index = 0; index < tools.length; index += 1) {
      var entry = tools[index];
      if (!isPlainObject(entry)) return failure("registry-entry-invalid", "tools." + index);
      var toolId = entry.id;
      if (!isNonEmptyString(toolId) || !SAFE_ID_PATTERN.test(toolId)) return failure("registry-tool-id-invalid", "tools." + index + ".id");
      if (participantSeen[toolId]) return failure("registry-duplicate-participant", toolId);
      participantSeen[toolId] = true;

      var briefing = entry.briefing;
      if (!isPlainObject(briefing)) return failure("briefing-required", toolId + ".briefing");
      var unknownField = hasOnlyFields(briefing, BRIEFING_ENTRY_FIELDS);
      if (unknownField) return failure("briefing-unknown-field", toolId + ".briefing." + unknownField);
      for (fieldIndex = 0; fieldIndex < BRIEFING_ENTRY_FIELDS.length; fieldIndex += 1) {
        if (!isNonEmptyString(briefing[BRIEFING_ENTRY_FIELDS[fieldIndex]])) return failure("briefing-field-missing", toolId + ".briefing." + BRIEFING_ENTRY_FIELDS[fieldIndex]);
      }
      var role = briefing.role;
      var profile = briefing.profile;
      if (!Object.prototype.hasOwnProperty.call(BRIEFING_PROFILE_ROLE, profile)) return failure("briefing-profile-invalid", toolId + ".briefing.profile");
      if (role !== "source" && role !== "final-aggregator") return failure("briefing-role-invalid", toolId + ".briefing.role");
      if (BRIEFING_PROFILE_ROLE[profile] !== role) return failure("briefing-role-profile-mismatch", toolId + ".briefing.role");
      for (fieldIndex = 0; fieldIndex < BRIEFING_POLICY_ID_FIELDS.length; fieldIndex += 1) {
        if (!SAFE_ID_PATTERN.test(briefing[BRIEFING_POLICY_ID_FIELDS[fieldIndex]])) return failure("briefing-field-invalid", toolId + ".briefing." + BRIEFING_POLICY_ID_FIELDS[fieldIndex]);
      }
      if (adapterSeen[briefing.readAdapter]) return failure("briefing-duplicate-adapter", toolId + ".briefing.readAdapter");
      adapterSeen[briefing.readAdapter] = true;
      if (configProfiles) {
        var expected = configProfiles[profile];
        if (!isPlainObject(expected)) return failure("registry-config-profile-missing", "config.profiles." + profile);
        if (briefing.freshnessPolicy !== expected.freshnessPolicy ||
          briefing.recommendationPolicy !== expected.recommendationPolicy ||
          briefing.budgetPolicy !== expected.budgetPolicy) {
          return failure("briefing-policy-mismatch", toolId + ".briefing");
        }
      }

      orderedParticipantIds.push(toolId);
      if (role === "final-aggregator") {
        if (aggregatorToolId !== null) return failure("registry-multiple-aggregators", toolId + ".briefing.role");
        aggregatorToolId = toolId;
      } else {
        orderedSourceToolIds.push(toolId);
      }
      entries[toolId] = {
        role: role,
        profile: profile,
        readAdapter: briefing.readAdapter,
        readContractVersion: briefing.readContractVersion,
        freshnessPolicy: briefing.freshnessPolicy,
        recommendationPolicy: briefing.recommendationPolicy,
        budgetPolicy: briefing.budgetPolicy
      };
    }
    if (aggregatorToolId === null) return failure("registry-missing-aggregator", "registry");
    if (orderedSourceToolIds.indexOf(aggregatorToolId) >= 0) return failure("registry-aggregator-is-source", aggregatorToolId);

    var frozen = {
      contractVersion: "frozen-briefing-registry/v1",
      participantCount: orderedParticipantIds.length,
      sourceCount: orderedSourceToolIds.length,
      aggregatorToolId: aggregatorToolId,
      orderedParticipantIds: orderedParticipantIds.slice(),
      orderedSourceToolIds: orderedSourceToolIds.slice(),
      entries: entries
    };
    frozen.registryFingerprint = fingerprint("frozen-briefing-registry", frozen);
    return success(frozen);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Scope 06 — Bounded Authorship and Recommendation Lifecycle contracts.

     Pure dual-runtime foundation for the bounded author boundary and the
     deterministic recommendation lifecycle. No network, filesystem, DOM, owner
     formula, or default policy VALUE lives here — every budget/policy object is
     supplied by the caller from committed config. These functions own identity,
     compaction, validation, and reduction; the natural-language author never owns
     recommendation identity or grouping.
     ───────────────────────────────────────────────────────────────────────── */

  var BUDGET_CODE = "B002-BUDGET";
  var BRIEF_OUTCOMES = Object.freeze({ "newly-authored": true, "carried-forward": true, "no-recommendation": true, "coverage-only": true });
  var BRIEF_STATUSES = Object.freeze({ validated: true });
  var WINDOW_USES = Object.freeze({ primary: true, confirmation: true, context: true, "not-applicable": true });
  var MARKET_ACTIONS = Object.freeze({ hold: true, trim: true, add: true, hedge: true, rotate: true });
  /* Only the live-market profile emits global market recommendations; static/local/off-theme sources use
     nextSteps operational/domain records and never enter the market recommendation stream. */
  var RECOMMENDATION_PROFILES = Object.freeze({ "live-market": true });
  /* Directional sign of a market action family, used to detect an incompatible (opposed) conflict on a
     shared subject. hold is neutral (never conflicts by direction). */
  var ACTION_DIRECTION = Object.freeze({ add: 1, rotate: 1, trim: -1, hedge: -1, hold: 0 });
  var LIFECYCLE_EVENT_TYPES = Object.freeze({
    proposed: true, reaffirmed: true, modified: true, conflicted: true, withdrawn: true,
    expired: true, satisfied: true, invalidated: true, unresolved: true, "not-evaluable": true,
    superseded: true, correction: true
  });
  var CLOSE_EVENT_TYPES = Object.freeze({ withdrawn: true, expired: true, satisfied: true, invalidated: true, unresolved: true, "not-evaluable": true });
  var TOOL_BRIEF_FIELDS = Object.freeze([
    "authorship", "contentFingerprint", "contractVersion", "decisionRationale", "evidenceBoundary",
    "evidenceRefs", "inputFingerprint", "limitations", "marketSessionEvidenceRef", "nextSteps",
    "outcome", "ownerInterpretationRefs", "profile", "readRef", "recommendations", "runId",
    "status", "summary", "toolId", "validation", "windowUse"
  ]);
  var RECOMMENDATION_FIELDS = Object.freeze([
    "actionFamily", "aggregationKey", "applicability", "confidenceBand", "confidenceScore",
    "horizon", "invalidation", "marketEligible", "observationFingerprint", "originRecommendationKey",
    "originToolId", "rationaleEvidenceIds", "subjects", "supersedesKeys", "thesisFamily", "trigger"
  ]);
  var SECRET_SHAPED_KEY = /(?:authorization|cookie|credential|api[-_]?key|password|passphrase|secret|token|position|cost[-_]?basis|pnl|holding|account)/i;
  var INSTRUCTION_OR_MARKUP = /<[a-z!/]|javascript:|data:text\/html|`{3}|\bignore (?:all |previous )/i;

  function budgetFailure(reason, field) {
    return { ok: false, error: { contractVersion: "evidence-error/v1", code: BUDGET_CODE, reason: reason, field: field } };
  }

  function utf8ByteLength(value) {
    return utf8Bytes(value).length;
  }

  function safeCanonicalBytes(value, contractVersion) {
    return utf8ByteLength(canonicalize(value, contractVersion));
  }

  /* Scan any brief/author value for secret-shaped keys and instruction/markup-shaped strings.
     Returns a failure or null. This is the privacy + unsafe-output gate reused by validateToolBrief
     and the author-envelope validator. */
  function scanUnsafeValue(value, field) {
    if (typeof value === "string") {
      if (INSTRUCTION_OR_MARKUP.test(value)) return failure("unsafe-instruction-or-markup", field);
      return null;
    }
    if (value === null || typeof value === "number" || typeof value === "boolean") return null;
    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i += 1) {
        var arrayFailure = scanUnsafeValue(value[i], field + "." + i);
        if (arrayFailure) return arrayFailure;
      }
      return null;
    }
    if (!isPlainObject(value)) return failure("unsafe-value-type", field);
    var keys = Object.keys(value);
    for (var k = 0; k < keys.length; k += 1) {
      if (SECRET_SHAPED_KEY.test(keys[k])) return failure("secret-shaped-field", field + "." + keys[k]);
      var objectFailure = scanUnsafeValue(value[keys[k]], field + "." + keys[k]);
      if (objectFailure) return objectFailure;
    }
    return null;
  }

  /* Deterministic reservation shape helpers. A read fact declares requiredForBrief (boolean) and an
     integer briefPriority; compaction keeps every mandatory field and required fact, then fills optional
     facts by descending priority and stable fact ID until (and only until) the profile input cap. */
  var COMPACT_MANDATORY_KEYS = Object.freeze([
    "contractVersion", "toolId", "profile", "role", "runId", "adapter", "status",
    "evaluatedAt", "modelAsOf", "sourceAsOf", "freshUntil", "asOf", "marketAsOf", "evidenceCutoff",
    "summary", "read", "sources", "evidenceBoundary", "limitations", "recommendationEligibility",
    "marketSessionEvidenceRef", "evidenceRefs", "evidenceApplicability", "evidenceInterpretations",
    "deepLink", "fingerprint"
  ]);

  function factSortKey(fact) {
    return typeof fact.id === "string" ? fact.id : JSON.stringify(fact.id);
  }

  /* compactAuthorInput(read, profileBudget): produce one deterministic bounded author input for a source
     read under an explicit profile budget. Mandatory identity/state/clocks/sources/boundaries/eligibility/
     evidence/required-fact material is always retained whole. Optional facts are ranked by descending
     briefPriority then stable fact ID and each is included WHOLE or omitted WHOLE (never truncated). The
     UTF-8 byte length of the canonical input is a conservative token-count upper bound (a token is never
     smaller than a byte). If the mandatory material alone exceeds the profile input cap it refuses with
     B002-BUDGET rather than summarize input to fit. Omitted optional facts remain reachable by ID and
     content fingerprint. */
  function compactAuthorInput(read, profileBudget) {
    if (!isPlainObject(read)) return failure("author-input-read-required", "read");
    if (!isPlainObject(profileBudget)) return failure("author-input-budget-required", "profileBudget");
    var maxInputTokens = profileBudget.maxInputTokens;
    var maxOutputTokens = profileBudget.maxOutputTokens;
    var promptReserveBytes = profileBudget.promptReserveBytes;
    if (!Number.isInteger(maxInputTokens) || maxInputTokens <= 0) return failure("author-budget-input-invalid", "profileBudget.maxInputTokens");
    if (!Number.isInteger(maxOutputTokens) || maxOutputTokens <= 0) return failure("author-budget-output-invalid", "profileBudget.maxOutputTokens");
    if (!Number.isInteger(promptReserveBytes) || promptReserveBytes < 0) return failure("author-budget-reserve-invalid", "profileBudget.promptReserveBytes");
    var contractVersion = isNonEmptyString(read.contractVersion) ? read.contractVersion : null;
    if (!contractVersion || !SAFE_ID_PATTERN.test(contractVersion)) return failure("author-input-contract-invalid", "read.contractVersion");
    if (!isNonEmptyString(read.toolId)) return failure("author-input-tool-required", "read.toolId");

    var facts = [];
    if (Object.prototype.hasOwnProperty.call(read, "facts")) {
      if (!Array.isArray(read.facts)) return failure("author-input-facts-invalid", "read.facts");
      facts = read.facts;
    }
    var seenFactId = Object.create(null);
    var requiredFacts = [];
    var optionalFacts = [];
    var index;
    for (index = 0; index < facts.length; index += 1) {
      var fact = facts[index];
      if (!isPlainObject(fact) || !isNonEmptyString(fact.id)) return failure("author-input-fact-id-required", "read.facts." + index);
      if (seenFactId[fact.id]) return failure("author-input-fact-duplicate", "read.facts." + index);
      seenFactId[fact.id] = true;
      if (typeof fact.requiredForBrief !== "boolean") return failure("author-input-fact-required-flag", "read.facts." + index + ".requiredForBrief");
      if (!Number.isInteger(fact.briefPriority)) return failure("author-input-fact-priority", "read.facts." + index + ".briefPriority");
      if (fact.requiredForBrief) requiredFacts.push(fact); else optionalFacts.push(fact);
    }
    optionalFacts.sort(function (left, right) {
      if (right.briefPriority !== left.briefPriority) return right.briefPriority - left.briefPriority;
      var leftKey = factSortKey(left);
      var rightKey = factSortKey(right);
      return leftKey < rightKey ? -1 : (leftKey > rightKey ? 1 : 0);
    });

    var mandatoryBase = {};
    for (index = 0; index < COMPACT_MANDATORY_KEYS.length; index += 1) {
      var key = COMPACT_MANDATORY_KEYS[index];
      if (Object.prototype.hasOwnProperty.call(read, key)) mandatoryBase[key] = read[key];
    }
    function buildCompacted(selectedFacts) {
      var shaped = {};
      var shapeIndex;
      for (shapeIndex = 0; shapeIndex < COMPACT_MANDATORY_KEYS.length; shapeIndex += 1) {
        var shapeKey = COMPACT_MANDATORY_KEYS[shapeIndex];
        if (Object.prototype.hasOwnProperty.call(mandatoryBase, shapeKey)) shaped[shapeKey] = mandatoryBase[shapeKey];
      }
      shaped.facts = selectedFacts;
      return shaped;
    }
    function measureFacts(selectedFacts) {
      return promptReserveBytes + safeCanonicalBytes(buildCompacted(selectedFacts), contractVersion);
    }

    var reservedBytes;
    try {
      reservedBytes = measureFacts(requiredFacts);
    } catch (mandatoryError) {
      return failure(mandatoryError.reason || "author-input-noncanonical", mandatoryError.field || "read");
    }
    if (reservedBytes > maxInputTokens) return budgetFailure("mandatory-material-exceeds-cap", "read");

    var included = requiredFacts.slice();
    var includedFactIds = included.map(function (entry) { return entry.id; });
    var omittedFacts = [];
    var currentBytes = reservedBytes;
    for (index = 0; index < optionalFacts.length; index += 1) {
      var candidateFacts = included.concat([optionalFacts[index]]);
      var candidateBytes;
      try {
        candidateBytes = measureFacts(candidateFacts);
      } catch (optionalError) {
        return failure(optionalError.reason || "author-input-noncanonical", "read.facts");
      }
      if (candidateBytes <= maxInputTokens) {
        included = candidateFacts;
        includedFactIds.push(optionalFacts[index].id);
        currentBytes = candidateBytes;
      } else {
        omittedFacts.push({ id: optionalFacts[index].id, fingerprint: contentSha256(optionalFacts[index], "tool-fact/v1") });
      }
    }

    var compactedRead = buildCompacted(included);
    var finalBytes = currentBytes;
    includedFactIds.sort();
    omittedFacts.sort(function (left, right) { return left.id < right.id ? -1 : (left.id > right.id ? 1 : 0); });
    return success({
      contractVersion: "compact-author-input/v1",
      toolId: read.toolId,
      profile: isNonEmptyString(read.profile) ? read.profile : null,
      compactedRead: compactedRead,
      includedFactIds: includedFactIds,
      omittedFacts: omittedFacts,
      reservedInputTokens: finalBytes,
      maxInputTokens: maxInputTokens,
      maxOutputTokens: maxOutputTokens,
      inputByteLength: finalBytes - promptReserveBytes,
      promptReserveBytes: promptReserveBytes
    });
  }

  function collectReadEvidenceIdentity(read) {
    var evidenceFingerprints = Object.create(null);
    var factIds = Object.create(null);
    var interpretationRefs = Object.create(null);
    var index;
    if (Array.isArray(read.evidenceRefs)) {
      for (index = 0; index < read.evidenceRefs.length; index += 1) {
        var ref = read.evidenceRefs[index];
        if (ref && typeof ref.fingerprint === "string") evidenceFingerprints[ref.fingerprint] = true;
      }
    }
    if (read.marketSessionEvidenceRef && typeof read.marketSessionEvidenceRef.fingerprint === "string") {
      evidenceFingerprints[read.marketSessionEvidenceRef.fingerprint] = true;
    }
    if (Array.isArray(read.facts)) {
      for (index = 0; index < read.facts.length; index += 1) {
        if (read.facts[index] && typeof read.facts[index].id === "string") factIds[read.facts[index].id] = true;
      }
    }
    if (Array.isArray(read.evidenceInterpretations)) {
      for (index = 0; index < read.evidenceInterpretations.length; index += 1) {
        var interpretation = read.evidenceInterpretations[index];
        if (!isPlainObject(interpretation)) continue;
        var interpretationRef = isNonEmptyString(interpretation.interpretationId)
          ? interpretation.interpretationId
          : contentSha256(interpretation, "evidence-interpretation/v1");
        interpretationRefs[interpretationRef] = true;
      }
    }
    return { evidenceFingerprints: evidenceFingerprints, factIds: factIds, interpretationRefs: interpretationRefs };
  }

  function validateBriefRecommendation(recommendation, read, profile, identity, field) {
    if (!isPlainObject(recommendation)) return failure("recommendation-invalid", field);
    if (!MARKET_ACTIONS[recommendation.actionFamily]) return failure("recommendation-action-not-allowed", field + ".actionFamily");
    if (!RECOMMENDATION_PROFILES[profile]) return failure("recommendation-profile-not-eligible", field + ".actionFamily");
    if (!read.recommendationEligibility || read.recommendationEligibility.eligible !== true) return failure("recommendation-read-not-eligible", field);
    var permitted = read.recommendationEligibility.permittedActionFamilies;
    if (!Array.isArray(permitted) || permitted.indexOf(recommendation.actionFamily) < 0) return failure("recommendation-action-not-permitted", field + ".actionFamily");
    var requiredStrings = ["thesisFamily", "horizon", "trigger", "invalidation", "confidenceBand"];
    for (var s = 0; s < requiredStrings.length; s += 1) {
      if (!isNonEmptyString(recommendation[requiredStrings[s]])) return failure("recommendation-field-missing", field + "." + requiredStrings[s]);
    }
    if (!Array.isArray(recommendation.subjects) || recommendation.subjects.length === 0) return failure("recommendation-subjects-required", field + ".subjects");
    if (!Number.isFinite(recommendation.confidenceScore)) return failure("recommendation-confidence-invalid", field + ".confidenceScore");
    if (!Array.isArray(recommendation.rationaleEvidenceIds) || recommendation.rationaleEvidenceIds.length === 0) return failure("recommendation-evidence-required", field + ".rationaleEvidenceIds");
    for (var e = 0; e < recommendation.rationaleEvidenceIds.length; e += 1) {
      var citedId = recommendation.rationaleEvidenceIds[e];
      if (!identity.evidenceFingerprints[citedId] && !identity.factIds[citedId] && !identity.interpretationRefs[citedId]) {
        return failure("recommendation-cited-evidence-absent", field + ".rationaleEvidenceIds." + e);
      }
    }
    return null;
  }

  /* validateToolBrief(brief, read, profile): enforce the ToolBrief/v1 contract against its owner read and
     profile. A market recommendation is legal ONLY when the profile is live-market, the read declares
     recommendationEligibility.eligible true, the action family is permitted by the read, and every cited
     evidence identity exists in the read. A no-recommendation/coverage-only outcome carries no
     recommendation; a static/local/off-theme profile carries none at all. Evidence and owner-interpretation
     references are exact subsets of the read (no new evidence identity), and every field is scanned for
     secret-shaped keys and instruction/markup-shaped strings. */
  function validateToolBrief(brief, read, profile) {
    if (!isPlainObject(brief)) return failure("tool-brief-required", "brief");
    if (!isPlainObject(read)) return failure("tool-brief-read-required", "read");
    if (!isNonEmptyString(profile)) return failure("tool-brief-profile-required", "profile");
    var unknown = hasOnlyFields(brief, TOOL_BRIEF_FIELDS);
    if (unknown) return failure("unknown-field", "brief." + unknown);
    if (brief.contractVersion !== "tool-brief/v1") return failure("contract-version-invalid", "brief.contractVersion");
    if (brief.toolId !== read.toolId) return failure("tool-brief-tool-mismatch", "brief.toolId");
    if (brief.profile !== profile || read.profile !== profile) return failure("tool-brief-profile-mismatch", "brief.profile");
    if (isNonEmptyString(read.runId) && brief.runId !== read.runId) return failure("tool-brief-run-mismatch", "brief.runId");
    if (!BRIEF_OUTCOMES[brief.outcome]) return failure("tool-brief-outcome-invalid", "brief.outcome");
    if (!BRIEF_STATUSES[brief.status]) return failure("tool-brief-status-invalid", "brief.status");
    if (!WINDOW_USES[brief.windowUse]) return failure("tool-brief-window-use-invalid", "brief.windowUse");
    if (!isNonEmptyString(brief.summary)) return failure("tool-brief-summary-required", "brief.summary");
    if (!isNonEmptyString(brief.decisionRationale)) return failure("tool-brief-rationale-required", "brief.decisionRationale");

    if (!isPlainObject(brief.readRef)) return failure("tool-brief-read-ref-required", "brief.readRef");
    if (!HASH_PATTERN.test(brief.readRef.sha256 || "")) return failure("tool-brief-read-ref-hash-invalid", "brief.readRef.sha256");
    if (brief.readRef.fingerprint !== read.fingerprint) return failure("tool-brief-read-fingerprint-mismatch", "brief.readRef.fingerprint");
    if (!isNonEmptyString(brief.inputFingerprint)) return failure("tool-brief-input-fingerprint-required", "brief.inputFingerprint");
    if (!isNonEmptyString(brief.contentFingerprint)) return failure("tool-brief-content-fingerprint-required", "brief.contentFingerprint");

    var identity = collectReadEvidenceIdentity(read);
    var refIndex;
    if (!Array.isArray(brief.evidenceRefs)) return failure("tool-brief-evidence-refs-invalid", "brief.evidenceRefs");
    for (refIndex = 0; refIndex < brief.evidenceRefs.length; refIndex += 1) {
      var evidenceRef = brief.evidenceRefs[refIndex];
      if (!evidenceRef || !identity.evidenceFingerprints[evidenceRef.fingerprint]) return failure("tool-brief-evidence-not-in-read", "brief.evidenceRefs." + refIndex);
    }
    if (brief.marketSessionEvidenceRef !== null) {
      if (!brief.marketSessionEvidenceRef || !read.marketSessionEvidenceRef || brief.marketSessionEvidenceRef.fingerprint !== read.marketSessionEvidenceRef.fingerprint) {
        return failure("tool-brief-session-evidence-mismatch", "brief.marketSessionEvidenceRef");
      }
    }
    if (!Array.isArray(brief.ownerInterpretationRefs)) return failure("tool-brief-interpretation-refs-invalid", "brief.ownerInterpretationRefs");
    for (refIndex = 0; refIndex < brief.ownerInterpretationRefs.length; refIndex += 1) {
      if (!identity.interpretationRefs[brief.ownerInterpretationRefs[refIndex]]) return failure("tool-brief-interpretation-not-in-read", "brief.ownerInterpretationRefs." + refIndex);
    }

    if (!Array.isArray(brief.recommendations)) return failure("tool-brief-recommendations-invalid", "brief.recommendations");
    if (!Array.isArray(brief.nextSteps)) return failure("tool-brief-next-steps-invalid", "brief.nextSteps");
    if ((brief.outcome === "no-recommendation" || brief.outcome === "coverage-only") && brief.recommendations.length > 0) {
      return failure("tool-brief-outcome-recommendation-conflict", "brief.recommendations");
    }
    if (!RECOMMENDATION_PROFILES[profile] && brief.recommendations.length > 0) {
      return failure("tool-brief-profile-recommendation-forbidden", "brief.recommendations");
    }
    for (refIndex = 0; refIndex < brief.recommendations.length; refIndex += 1) {
      var recommendationFailure = validateBriefRecommendation(brief.recommendations[refIndex], read, profile, identity, "brief.recommendations." + refIndex);
      if (recommendationFailure) return recommendationFailure;
    }

    if (!isPlainObject(brief.authorship)) return failure("tool-brief-authorship-required", "brief.authorship");
    if (!isPlainObject(brief.validation)) return failure("tool-brief-validation-required", "brief.validation");
    if (!Array.isArray(brief.evidenceBoundary) || !Array.isArray(brief.limitations)) return failure("tool-brief-boundaries-invalid", "brief.evidenceBoundary");

    var unsafeFailure = scanUnsafeValue(brief, "brief");
    if (unsafeFailure) return unsafeFailure;

    var canonicalBrief;
    try {
      canonicalBrief = JSON.parse(canonicalize(brief, brief.contractVersion));
    } catch (canonicalError) {
      return failure(canonicalError.reason || "tool-brief-noncanonical", canonicalError.field || "brief");
    }
    return success(canonicalBrief);
  }

  /* Foundation-owned recommendation identity. Authors never own identity: origin/aggregation keys and the
     observation fingerprint are derived deterministically from the record's canonical fields. A record MAY
     carry the keys, but a mismatch against the derived value is rejected (author-forged identity fails). */
  function deriveRecommendationKeys(recommendation) {
    var originKey = fingerprint("origin-recommendation-key", {
      contractVersion: "origin-recommendation-key/v1",
      originToolId: recommendation.originToolId,
      thesisFamily: recommendation.thesisFamily,
      subjects: recommendation.subjects,
      actionFamily: recommendation.actionFamily,
      horizon: recommendation.horizon
    });
    var aggregationKey = fingerprint("aggregation-key", {
      contractVersion: "aggregation-key/v1",
      thesisFamily: recommendation.thesisFamily,
      subjects: recommendation.subjects,
      actionFamily: recommendation.actionFamily,
      horizon: recommendation.horizon
    });
    var observationFingerprint = fingerprint("recommendation-observation", {
      contractVersion: "recommendation-observation/v1",
      originRecommendationKey: originKey,
      trigger: recommendation.trigger,
      invalidation: recommendation.invalidation,
      rationaleEvidenceIds: recommendation.rationaleEvidenceIds,
      confidenceBand: recommendation.confidenceBand,
      confidenceScore: recommendation.confidenceScore,
      applicability: recommendation.applicability
    });
    return { originRecommendationKey: originKey, aggregationKey: aggregationKey, observationFingerprint: observationFingerprint };
  }

  function normalizeRecommendation(recommendation, field) {
    if (!isPlainObject(recommendation)) return failure("recommendation-invalid", field);
    var unknown = hasOnlyFields(recommendation, RECOMMENDATION_FIELDS);
    if (unknown) return failure("unknown-field", field + "." + unknown);
    if (!isNonEmptyString(recommendation.originToolId)) return failure("recommendation-origin-tool-required", field + ".originToolId");
    if (!isNonEmptyString(recommendation.thesisFamily)) return failure("recommendation-thesis-required", field + ".thesisFamily");
    if (!MARKET_ACTIONS[recommendation.actionFamily]) return failure("recommendation-action-not-allowed", field + ".actionFamily");
    if (!isNonEmptyString(recommendation.horizon)) return failure("recommendation-horizon-required", field + ".horizon");
    if (!Array.isArray(recommendation.subjects) || recommendation.subjects.length === 0) return failure("recommendation-subjects-required", field + ".subjects");
    if (!isNonEmptyString(recommendation.trigger) || !isNonEmptyString(recommendation.invalidation)) return failure("recommendation-condition-required", field + ".trigger");
    if (!isNonEmptyString(recommendation.confidenceBand)) return failure("recommendation-confidence-band-required", field + ".confidenceBand");
    if (!Number.isFinite(recommendation.confidenceScore)) return failure("recommendation-confidence-invalid", field + ".confidenceScore");
    if (!Array.isArray(recommendation.rationaleEvidenceIds) || recommendation.rationaleEvidenceIds.length === 0) return failure("recommendation-evidence-required", field + ".rationaleEvidenceIds");
    var derived = deriveRecommendationKeys(recommendation);
    if (isNonEmptyString(recommendation.originRecommendationKey) && recommendation.originRecommendationKey !== derived.originRecommendationKey) return failure("recommendation-origin-key-mismatch", field + ".originRecommendationKey");
    if (isNonEmptyString(recommendation.aggregationKey) && recommendation.aggregationKey !== derived.aggregationKey) return failure("recommendation-aggregation-key-mismatch", field + ".aggregationKey");
    if (isNonEmptyString(recommendation.observationFingerprint) && recommendation.observationFingerprint !== derived.observationFingerprint) return failure("recommendation-observation-mismatch", field + ".observationFingerprint");
    var subjects = recommendation.subjects.slice().sort();
    var evidenceFingerprint = fingerprint("recommendation-evidence-origin", { contractVersion: "recommendation-evidence-origin/v1", rationaleEvidenceIds: recommendation.rationaleEvidenceIds });
    return success({
      originRecommendationKey: derived.originRecommendationKey,
      aggregationKey: derived.aggregationKey,
      observationFingerprint: derived.observationFingerprint,
      originToolId: recommendation.originToolId,
      thesisFamily: recommendation.thesisFamily,
      subjects: subjects,
      actionFamily: recommendation.actionFamily,
      horizon: recommendation.horizon,
      trigger: recommendation.trigger,
      invalidation: recommendation.invalidation,
      confidenceBand: recommendation.confidenceBand,
      confidenceScore: recommendation.confidenceScore,
      applicability: isNonEmptyString(recommendation.applicability) ? recommendation.applicability : "educational-market-research",
      rationaleEvidenceIds: recommendation.rationaleEvidenceIds.slice(),
      evidenceOriginFingerprint: evidenceFingerprint,
      marketEligible: recommendation.marketEligible !== false,
      supersedesKeys: Array.isArray(recommendation.supersedesKeys) ? recommendation.supersedesKeys.slice() : []
    });
  }

  function lifecycleEventId(runId, recommendationKey, eventType, observationFingerprint, relatedKeys) {
    return fingerprint("recommendation-event", {
      contractVersion: "recommendation-event/v1",
      runId: runId,
      recommendationKey: recommendationKey,
      eventType: eventType,
      observationFingerprint: observationFingerprint || null,
      relatedKeys: (relatedKeys || []).slice().sort()
    });
  }

  function subjectsConflict(left, right) {
    var shared = false;
    for (var i = 0; i < left.subjects.length; i += 1) {
      if (right.subjects.indexOf(left.subjects[i]) >= 0) { shared = true; break; }
    }
    if (!shared) return false;
    var leftDirection = ACTION_DIRECTION[left.actionFamily];
    var rightDirection = ACTION_DIRECTION[right.actionFamily];
    if (Number.isFinite(leftDirection) && Number.isFinite(rightDirection) && leftDirection * rightDirection < 0) return true;
    if (left.horizon !== right.horizon) return true;
    return false;
  }

  /* reduceRecommendationEvents(previous, current, run): produce idempotent append-only lifecycle events and
     a new compact current-state index. A new origin proposes (or supersedes prior keys and proposes); an
     unchanged origin/observation reaffirms by reference with no narrative copy; a changed observation
     appends a modified event and a new immutable observation while prior terms remain addressable; an
     incompatible pair conflicts without closing either; explicit run.closures append closure events with
     the original frozen terms; run.corrections append a correction naming the affected event ID and never
     delete or edit it. Re-running with identical inputs yields identical event IDs and index. */
  function reduceRecommendationEvents(previous, current, run) {
    if (previous !== null && previous !== undefined && !isPlainObject(previous)) return failure("recommendation-previous-invalid", "previous");
    if (!Array.isArray(current)) return failure("recommendation-current-invalid", "current");
    if (!isPlainObject(run) || !isNonEmptyString(run.runId) || !isNonEmptyString(run.occurredAt) || !isNonEmptyString(run.canonicalMonth)) {
      return failure("recommendation-run-invalid", "run");
    }
    var occurredAt;
    try {
      occurredAt = normalizeTimestamp(run.occurredAt, "run.occurredAt");
    } catch (timeError) {
      return failure(timeError.reason || "recommendation-run-time-invalid", "run.occurredAt");
    }

    var previousEntries = (previous && isPlainObject(previous.entries)) ? previous.entries : {};
    var newEntries = {};
    var entryKeys = Object.keys(previousEntries);
    var i;
    for (i = 0; i < entryKeys.length; i += 1) {
      var previousEntry = previousEntries[entryKeys[i]];
      newEntries[entryKeys[i]] = {
        originRecommendationKey: previousEntry.originRecommendationKey,
        aggregationKey: previousEntry.aggregationKey,
        observationFingerprint: previousEntry.observationFingerprint,
        terms: previousEntry.terms,
        state: previousEntry.state,
        observations: isPlainObject(previousEntry.observations) ? JSON.parse(JSON.stringify(previousEntry.observations)) : {},
        firstProposedAt: previousEntry.firstProposedAt,
        lastEventId: previousEntry.lastEventId,
        lastEventType: previousEntry.lastEventType
      };
    }

    var normalized = [];
    for (i = 0; i < current.length; i += 1) {
      var normalizedResult = normalizeRecommendation(current[i], "current." + i);
      if (!normalizedResult.ok) return normalizedResult;
      normalized.push(normalizedResult.value);
    }
    normalized.sort(function (left, right) { return left.originRecommendationKey < right.originRecommendationKey ? -1 : (left.originRecommendationKey > right.originRecommendationKey ? 1 : 0); });

    var events = [];
    function pushEvent(eventType, recommendationKey, observationFingerprint, relatedKeys, reasonCode, observationTerms) {
      var eventId = lifecycleEventId(run.runId, recommendationKey, eventType, observationFingerprint, relatedKeys);
      events.push({
        contractVersion: "recommendation-event/v1",
        eventId: eventId,
        eventType: eventType,
        runId: run.runId,
        occurredAt: occurredAt,
        canonicalMonth: run.canonicalMonth,
        recommendationKey: recommendationKey,
        observationRef: observationFingerprint || null,
        relatedKeys: (relatedKeys || []).slice().sort(),
        reasonCode: isNonEmptyString(reasonCode) ? reasonCode : null,
        observationTerms: observationTerms || null
      });
      return eventId;
    }

    var presentKeys = Object.create(null);
    for (i = 0; i < normalized.length; i += 1) {
      var recommendation = normalized[i];
      var originKey = recommendation.originRecommendationKey;
      presentKeys[originKey] = true;
      var terms = {
        subjects: recommendation.subjects,
        actionFamily: recommendation.actionFamily,
        horizon: recommendation.horizon,
        thesisFamily: recommendation.thesisFamily,
        trigger: recommendation.trigger,
        invalidation: recommendation.invalidation,
        confidenceBand: recommendation.confidenceBand,
        confidenceScore: recommendation.confidenceScore,
        rationaleEvidenceIds: recommendation.rationaleEvidenceIds,
        applicability: recommendation.applicability
      };
      var existing = previousEntries[originKey];
      var eventId;
      if (!existing) {
        var supersededKeys = [];
        for (var sk = 0; sk < recommendation.supersedesKeys.length; sk += 1) {
          if (previousEntries[recommendation.supersedesKeys[sk]]) supersededKeys.push(recommendation.supersedesKeys[sk]);
        }
        supersededKeys.sort();
        for (var sj = 0; sj < supersededKeys.length; sj += 1) {
          pushEvent("superseded", supersededKeys[sj], previousEntries[supersededKeys[sj]].observationFingerprint, [originKey], "superseded-by-new-key", null);
          newEntries[supersededKeys[sj]].state = "superseded";
          newEntries[supersededKeys[sj]].lastEventType = "superseded";
        }
        eventId = pushEvent("proposed", originKey, recommendation.observationFingerprint, supersededKeys, "new-origin", terms);
        var observationMap = {};
        observationMap[recommendation.observationFingerprint] = terms;
        newEntries[originKey] = {
          originRecommendationKey: originKey,
          aggregationKey: recommendation.aggregationKey,
          observationFingerprint: recommendation.observationFingerprint,
          terms: terms,
          state: "active",
          observations: observationMap,
          firstProposedAt: occurredAt,
          lastEventId: eventId,
          lastEventType: "proposed"
        };
      } else if (existing.observationFingerprint === recommendation.observationFingerprint) {
        eventId = pushEvent("reaffirmed", originKey, recommendation.observationFingerprint, [], "unchanged-terms", null);
        newEntries[originKey].state = "active";
        newEntries[originKey].lastEventId = eventId;
        newEntries[originKey].lastEventType = "reaffirmed";
      } else {
        eventId = pushEvent("modified", originKey, recommendation.observationFingerprint, [existing.observationFingerprint], "material-change", terms);
        newEntries[originKey].observations[recommendation.observationFingerprint] = terms;
        newEntries[originKey].observationFingerprint = recommendation.observationFingerprint;
        newEntries[originKey].terms = terms;
        newEntries[originKey].state = "active";
        newEntries[originKey].lastEventId = eventId;
        newEntries[originKey].lastEventType = "modified";
      }
    }

    for (i = 0; i < normalized.length; i += 1) {
      for (var j = i + 1; j < normalized.length; j += 1) {
        if (subjectsConflict(normalized[i], normalized[j])) {
          var keyA = normalized[i].originRecommendationKey;
          var keyB = normalized[j].originRecommendationKey;
          pushEvent("conflicted", keyA, normalized[i].observationFingerprint, [keyB], "incompatible-origin", null);
          pushEvent("conflicted", keyB, normalized[j].observationFingerprint, [keyA], "incompatible-origin", null);
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(run, "closures")) {
      if (!Array.isArray(run.closures)) return failure("recommendation-closures-invalid", "run.closures");
      var closures = run.closures.slice().sort(function (left, right) {
        var leftKey = (left && left.originRecommendationKey) || "";
        var rightKey = (right && right.originRecommendationKey) || "";
        return leftKey < rightKey ? -1 : (leftKey > rightKey ? 1 : 0);
      });
      for (i = 0; i < closures.length; i += 1) {
        var closure = closures[i];
        if (!isPlainObject(closure) || !CLOSE_EVENT_TYPES[closure.eventType]) return failure("recommendation-closure-type-invalid", "run.closures." + i + ".eventType");
        var closureEntry = newEntries[closure.originRecommendationKey];
        if (!closureEntry) return failure("recommendation-closure-key-absent", "run.closures." + i + ".originRecommendationKey");
        if (presentKeys[closure.originRecommendationKey]) return failure("recommendation-closure-still-active", "run.closures." + i);
        pushEvent(closure.eventType, closure.originRecommendationKey, closureEntry.observationFingerprint, [], isNonEmptyString(closure.reasonCode) ? closure.reasonCode : closure.eventType, closureEntry.terms);
        closureEntry.state = "closed";
        closureEntry.lastEventType = closure.eventType;
      }
    }

    if (Object.prototype.hasOwnProperty.call(run, "corrections")) {
      if (!Array.isArray(run.corrections)) return failure("recommendation-corrections-invalid", "run.corrections");
      var corrections = run.corrections.slice().sort(function (left, right) {
        var leftId = (left && left.affectedEventId) || "";
        var rightId = (right && right.affectedEventId) || "";
        return leftId < rightId ? -1 : (leftId > rightId ? 1 : 0);
      });
      for (i = 0; i < corrections.length; i += 1) {
        var correction = corrections[i];
        if (!isPlainObject(correction) || !isNonEmptyString(correction.affectedEventId) || !isNonEmptyString(correction.recommendationKey)) return failure("recommendation-correction-invalid", "run.corrections." + i);
        pushEvent("correction", correction.recommendationKey, null, [correction.affectedEventId], isNonEmptyString(correction.reasonCode) ? correction.reasonCode : "correction", null);
      }
    }

    events.sort(function (left, right) { return left.eventId < right.eventId ? -1 : (left.eventId > right.eventId ? 1 : 0); });
    var deduped = [];
    var seenEvent = Object.create(null);
    for (i = 0; i < events.length; i += 1) {
      if (seenEvent[events[i].eventId]) continue;
      seenEvent[events[i].eventId] = true;
      deduped.push(events[i]);
    }

    var index = {
      contractVersion: "recommendation-index/v1",
      runId: run.runId,
      canonicalMonth: run.canonicalMonth,
      entries: newEntries
    };
    index.indexFingerprint = fingerprint("recommendation-index", {
      contractVersion: "recommendation-index/v1",
      entries: newEntries
    });
    return success({ contractVersion: "recommendation-reduction/v1", events: deduped, index: index });
  }

  /* groupRecommendations(recommendations): produce exact/compatible aggregation groups, shared-origin
     provenance, and explicit conflicts without ever adding or averaging confidence. A group's merged
     confidence is the MINIMUM retained origin score. Members that share the same evidence-origin
     fingerprint count once as an independent confirmation. An incompatible direction/horizon on a shared
     subject stays a separate visible conflict. Coverage-only/ineligible records are excluded with a reason.
     Ordering is deterministic by aggregation key then origin key. */
  function groupRecommendations(recommendations) {
    if (!Array.isArray(recommendations)) return failure("recommendation-set-invalid", "recommendations");
    var eligible = [];
    var exclusions = [];
    var i;
    for (i = 0; i < recommendations.length; i += 1) {
      var normalizedResult = normalizeRecommendation(recommendations[i], "recommendations." + i);
      if (!normalizedResult.ok) return normalizedResult;
      var normalizedRecommendation = normalizedResult.value;
      if (normalizedRecommendation.marketEligible) eligible.push(normalizedRecommendation);
      else exclusions.push({ originRecommendationKey: normalizedRecommendation.originRecommendationKey, reason: "market-ineligible" });
    }

    var groupsByAggregation = {};
    var aggregationOrder = [];
    for (i = 0; i < eligible.length; i += 1) {
      var recommendation = eligible[i];
      if (!groupsByAggregation[recommendation.aggregationKey]) {
        groupsByAggregation[recommendation.aggregationKey] = [];
        aggregationOrder.push(recommendation.aggregationKey);
      }
      groupsByAggregation[recommendation.aggregationKey].push(recommendation);
    }
    aggregationOrder.sort();

    var groups = [];
    for (i = 0; i < aggregationOrder.length; i += 1) {
      var members = groupsByAggregation[aggregationOrder[i]];
      members.sort(function (left, right) { return left.originRecommendationKey < right.originRecommendationKey ? -1 : (left.originRecommendationKey > right.originRecommendationKey ? 1 : 0); });
      var mergedConfidence = null;
      var evidenceOriginSet = Object.create(null);
      var memberKeys = [];
      var originToolIds = [];
      for (var m = 0; m < members.length; m += 1) {
        mergedConfidence = mergedConfidence === null ? members[m].confidenceScore : Math.min(mergedConfidence, members[m].confidenceScore);
        evidenceOriginSet[members[m].evidenceOriginFingerprint] = true;
        memberKeys.push(members[m].originRecommendationKey);
        if (originToolIds.indexOf(members[m].originToolId) < 0) originToolIds.push(members[m].originToolId);
      }
      originToolIds.sort();
      groups.push({
        aggregationKey: aggregationOrder[i],
        thesisFamily: members[0].thesisFamily,
        subjects: members[0].subjects.slice(),
        actionFamily: members[0].actionFamily,
        horizon: members[0].horizon,
        memberKeys: memberKeys,
        originToolIds: originToolIds,
        mergedConfidenceScore: mergedConfidence,
        confidencePolicy: "minimum-retained",
        independentOriginCount: Object.keys(evidenceOriginSet).length,
        sharedEvidenceOrigin: Object.keys(evidenceOriginSet).length < members.length
      });
    }

    var conflicts = [];
    for (i = 0; i < eligible.length; i += 1) {
      for (var j = i + 1; j < eligible.length; j += 1) {
        if (subjectsConflict(eligible[i], eligible[j])) {
          var pair = [eligible[i].originRecommendationKey, eligible[j].originRecommendationKey].sort();
          conflicts.push({ keys: pair, reason: eligible[i].horizon !== eligible[j].horizon ? "horizon-conflict" : "direction-conflict" });
        }
      }
    }
    conflicts.sort(function (left, right) {
      var leftKey = left.keys.join("|");
      var rightKey = right.keys.join("|");
      return leftKey < rightKey ? -1 : (leftKey > rightKey ? 1 : 0);
    });
    exclusions.sort(function (left, right) { return left.originRecommendationKey < right.originRecommendationKey ? -1 : (left.originRecommendationKey > right.originRecommendationKey ? 1 : 0); });

    return success({
      contractVersion: "recommendation-groups/v1",
      confidencePolicy: "minimum-retained",
      groups: groups,
      conflicts: conflicts,
      exclusions: exclusions
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Scope 08 — Window-Aware Final Aggregation contracts.

     Pure dual-runtime foundation for the ONE registry-complete final synthesis. It owns final input
     compaction (one mandatory FinalSourceEnvelope/v1 per DERIVED source ID in registry order plus the
     run/window header, groups/conflicts, required-evidence summaries, low-noise results, and compact
     active lifecycle metadata — refusing rather than omitting a participant), the four-window
     consumption contract, the low-noise promotion gate, and complete final validation (coverage,
     provenance, bounded actions, preserved conflicts, distinct clocks, and no unsupported or
     evidence-invented recommendation). No network, filesystem, DOM, owner formula, or default policy
     VALUE lives here; every budget/threshold/window ref reaches these functions from the caller. The
     final aggregator never consumes a source brief for itself.
     ───────────────────────────────────────────────────────────────────────── */

  var WINDOW_POLICY_VERSION = "window-consumption/v1";
  /* The four scheduled windows. `priorWindow` is the ONLY predecessor a window may name a published
     thesis from (morning → same-date pre-market at an earlier cutoff); every other window names none.
     `requiresOfficialClose` forces the current date's official regular-close anchor to be retained
     separately (after-hours). `forbidsOfficialClose` refuses an official close before the calendar
     close (pre-close). */
  var WINDOW_POLICY = Object.freeze({
    "pre-market": Object.freeze({ priorWindow: null, requiresOfficialClose: false, forbidsOfficialClose: false }),
    "morning": Object.freeze({ priorWindow: "pre-market", requiresOfficialClose: false, forbidsOfficialClose: false }),
    "pre-close": Object.freeze({ priorWindow: null, requiresOfficialClose: false, forbidsOfficialClose: true }),
    "after-hours": Object.freeze({ priorWindow: null, requiresOfficialClose: true, forbidsOfficialClose: false })
  });
  var COVERAGE_OUTCOMES = Object.freeze({
    included: true, merged: true, carried: true, "coverage-only": true,
    conflicted: true, excluded: true, failed: true, "final-aggregator": true
  });
  var FINAL_BRIEF_FIELDS = Object.freeze([
    "actions", "attention", "authorship", "clocks", "conflicts", "contractVersion", "coverage",
    "evidenceRefs", "exclusions", "finalFingerprint", "freshnessSummary", "limitations",
    "marketSessionEvidenceRef", "ownerInterpretationRefs", "publication", "registry", "runFingerprint",
    "runId", "sourceRefs", "validation", "windowContext"
  ]);
  var FINAL_ACTION_FIELDS = Object.freeze([
    "actionFamily", "aggregationKey", "horizon", "invalidation", "memberKeys", "mergedConfidenceScore",
    "originToolIds", "ownerInterpretationRefs", "subjects", "trigger"
  ]);
  var WINDOW_CONTEXT_FIELDS = Object.freeze([
    "calendarSessionRef", "cutoffAt", "officialCloseAnchorRef", "priorWindowThesisRef",
    "priorWindowThesisState", "requiredEvidenceResults", "scheduledFor", "tradingDate", "window"
  ]);

  function sameStringSet(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    var a = left.slice().sort();
    var b = right.slice().sort();
    for (var i = 0; i < a.length; i += 1) { if (a[i] !== b[i]) return false; }
    return true;
  }

  /* validateWindowHeader(header): enforce the four-window consumption contract on one run/window header.
     Rejects an unknown window, a non-canonical scheduled/cutoff clock, a missing calendar/required-evidence
     ref, an after-hours header without its own official regular-close anchor, a pre-close header that names
     an official close, a non-morning header that names a prior-window thesis, and a morning header whose
     prior thesis is not a same-date pre-market thesis at an earlier cutoff (absence must be declared
     `insufficient`, never reconstructed). Returns a failure or null. */
  function validateWindowHeader(header, field) {
    var at = field || "windowContext";
    if (!isPlainObject(header)) return failure("window-header-required", at);
    var unknown = hasOnlyFields(header, WINDOW_CONTEXT_FIELDS);
    if (unknown) return failure("unknown-field", at + "." + unknown);
    var policy = WINDOW_POLICY[header.window];
    if (!policy) return failure("window-invalid", at + ".window");
    if (!isNonEmptyString(header.tradingDate)) return failure("window-trading-date-required", at + ".tradingDate");
    var scheduledFailure = validateCanonicalTimestamp(header.scheduledFor, at + ".scheduledFor", false);
    if (scheduledFailure) return failure(scheduledFailure, at + ".scheduledFor");
    var cutoffFailure = validateCanonicalTimestamp(header.cutoffAt, at + ".cutoffAt", false);
    if (cutoffFailure) return failure(cutoffFailure, at + ".cutoffAt");
    if (Date.parse(header.scheduledFor) > Date.parse(header.cutoffAt)) return failure("window-cutoff-before-scheduled", at + ".cutoffAt");
    if (header.calendarSessionRef === undefined || header.calendarSessionRef === null) return failure("window-calendar-ref-required", at + ".calendarSessionRef");
    if (!Array.isArray(header.requiredEvidenceResults)) return failure("window-required-evidence-invalid", at + ".requiredEvidenceResults");
    var officialClose = Object.prototype.hasOwnProperty.call(header, "officialCloseAnchorRef") ? header.officialCloseAnchorRef : null;
    if (policy.requiresOfficialClose && (officialClose === null || officialClose === undefined)) {
      return failure("window-official-close-required", at + ".officialCloseAnchorRef");
    }
    if (policy.forbidsOfficialClose && officialClose !== null && officialClose !== undefined) {
      return failure("window-official-close-forbidden", at + ".officialCloseAnchorRef");
    }
    var priorRef = Object.prototype.hasOwnProperty.call(header, "priorWindowThesisRef") ? header.priorWindowThesisRef : null;
    if (policy.priorWindow === null) {
      if (priorRef !== null && priorRef !== undefined) return failure("window-prior-thesis-not-allowed", at + ".priorWindowThesisRef");
      return null;
    }
    // Morning: exactly one of a same-date earlier-cutoff pre-market thesis OR an explicit insufficient state.
    if (priorRef === null || priorRef === undefined) {
      if (header.priorWindowThesisState !== "insufficient") return failure("window-prior-thesis-insufficient-undeclared", at + ".priorWindowThesisState");
      return null;
    }
    if (header.priorWindowThesisState === "insufficient") return failure("window-prior-thesis-state-contradiction", at + ".priorWindowThesisState");
    if (!isPlainObject(priorRef)) return failure("window-prior-thesis-invalid", at + ".priorWindowThesisRef");
    if (priorRef.window !== policy.priorWindow) return failure("window-prior-thesis-window-mismatch", at + ".priorWindowThesisRef.window");
    if (priorRef.tradingDate !== header.tradingDate) return failure("window-prior-thesis-date-mismatch", at + ".priorWindowThesisRef.tradingDate");
    var priorCutoffFailure = validateCanonicalTimestamp(priorRef.cutoffAt, at + ".priorWindowThesisRef.cutoffAt", false);
    if (priorCutoffFailure) return failure(priorCutoffFailure, at + ".priorWindowThesisRef.cutoffAt");
    if (Date.parse(priorRef.cutoffAt) >= Date.parse(header.cutoffAt)) return failure("window-prior-thesis-cutoff-not-earlier", at + ".priorWindowThesisRef.cutoffAt");
    return null;
  }

  /* evaluateLowNoiseGate(candidate): the pure anti-reactivity gate for one normalized observation. A
     fresh unusual observation reaches an action slot ONLY when its basis validates, its comparison is
     qualified when an unusualness claim is made, an eligible live-market owner interpretation names it,
     the owner recommendation is falsifiable, at least one anti-reactivity condition holds (a declared
     structural break, persistence across THREE DISTINCT observation fingerprints, or independent
     owner/evidence corroboration), and no dispute/conflict/thin/profile-boundary blocks it. Repeated
     identical fingerprints earn no persistence credit; failure keeps valid evidence as bounded context
     or no-action that consumes no action slot and adds no confidence. */
  function evaluateLowNoiseGate(candidate) {
    if (!isPlainObject(candidate)) return failure("low-noise-candidate-required", "candidate");
    var reasons = [];
    if (candidate.basisValidated !== true) return success({ contractVersion: "low-noise-gate/v1", destination: "unavailable", promote: false, reasons: ["basis-invalid"] });
    if (candidate.disputed === true) return success({ contractVersion: "low-noise-gate/v1", destination: "disputed", promote: false, reasons: ["provider-dispute"] });
    if (candidate.currentEvidence !== true) return success({ contractVersion: "low-noise-gate/v1", destination: "unavailable", promote: false, reasons: ["evidence-not-current"] });
    if (candidate.unusualnessClaimed === true && candidate.comparisonQualified !== true) {
      return success({ contractVersion: "low-noise-gate/v1", destination: "unavailable", promote: false, reasons: ["comparison-not-qualified"] });
    }
    var falsifiable = candidate.falsifiable;
    var ownerOk = candidate.ownerEligible === true && isNonEmptyString(candidate.ownerInterpretationRef);
    if (!ownerOk) reasons.push("no-eligible-owner-interpretation");
    var falsifiableOk = isPlainObject(falsifiable) && isNonEmptyString(falsifiable.trigger) && isNonEmptyString(falsifiable.invalidation) &&
      Array.isArray(falsifiable.subjects) && falsifiable.subjects.length > 0 && isNonEmptyString(falsifiable.horizon);
    if (!falsifiableOk) reasons.push("owner-recommendation-not-falsifiable");
    var distinct = {};
    var fingerprints = Array.isArray(candidate.persistenceFingerprints) ? candidate.persistenceFingerprints : [];
    for (var f = 0; f < fingerprints.length; f += 1) { if (isNonEmptyString(fingerprints[f])) distinct[fingerprints[f]] = true; }
    var persistent = Object.keys(distinct).length >= 3;
    var antiReactivity = candidate.structuralBreak === true || persistent || candidate.independentCorroboration === true;
    if (!antiReactivity) reasons.push("no-structural-break-persistence-or-corroboration");
    if (candidate.conflicted === true) reasons.push("owner-direction-conflict");
    if (candidate.thin === true) reasons.push("thin-baseline");
    if (candidate.profileBoundaryOk === false) reasons.push("profile-boundary");
    if (reasons.length === 0) return success({ contractVersion: "low-noise-gate/v1", destination: "action", promote: true, reasons: [] });
    reasons.sort();
    return success({ contractVersion: "low-noise-gate/v1", destination: "context", promote: false, reasons: reasons });
  }

  function resolveFrozenRegistry(registry, config) {
    if (isPlainObject(registry) && registry.contractVersion === "frozen-briefing-registry/v1") return success(registry);
    return validateRegistry(registry, config);
  }

  function finalOptionalFactSort(left, right) {
    var leftPriority = Number.isInteger(left.finalPriority) ? left.finalPriority : (Number.isInteger(left.briefPriority) ? left.briefPriority : 0);
    var rightPriority = Number.isInteger(right.finalPriority) ? right.finalPriority : (Number.isInteger(right.briefPriority) ? right.briefPriority : 0);
    if (rightPriority !== leftPriority) return rightPriority - leftPriority;
    if (left.sourceOrder !== right.sourceOrder) return left.sourceOrder - right.sourceOrder;
    return left.id < right.id ? -1 : (left.id > right.id ? 1 : 0);
  }

  /* Build one mandatory FinalSourceEnvelope/v1 from a validated owner read and its validated source brief.
     Every mandatory decision field is retained whole; only optional fact prose is deferred (its id and
     content fingerprint are still recorded). No string is truncated and no participant is dropped. */
  function buildFinalSourceEnvelope(read, brief) {
    var legalRecommendations = [];
    var recs = Array.isArray(brief.recommendations) ? brief.recommendations : [];
    for (var r = 0; r < recs.length; r += 1) {
      var rec = recs[r];
      legalRecommendations.push({
        subjects: Array.isArray(rec.subjects) ? rec.subjects.slice() : [],
        actionFamily: rec.actionFamily,
        horizon: rec.horizon,
        trigger: rec.trigger,
        invalidation: rec.invalidation,
        confidenceBand: rec.confidenceBand,
        confidenceScore: rec.confidenceScore
      });
    }
    var nextStepTypes = [];
    var steps = Array.isArray(brief.nextSteps) ? brief.nextSteps : [];
    for (var s = 0; s < steps.length; s += 1) { if (steps[s] && isNonEmptyString(steps[s].type)) nextStepTypes.push(steps[s].type); }
    var evidenceFingerprints = [];
    var evidence = Array.isArray(brief.evidenceRefs) ? brief.evidenceRefs : [];
    for (var e = 0; e < evidence.length; e += 1) { if (evidence[e] && isNonEmptyString(evidence[e].fingerprint)) evidenceFingerprints.push(evidence[e].fingerprint); }
    return {
      contractVersion: "final-source-envelope/v1",
      toolId: read.toolId,
      profile: read.profile,
      status: read.status,
      readRef: { fingerprint: read.fingerprint },
      briefRef: { fingerprint: brief.contentFingerprint },
      ownerSummary: isNonEmptyString(read.summary) ? read.summary : null,
      decisionReason: isNonEmptyString(brief.decisionRationale) ? brief.decisionRationale : null,
      outcome: brief.outcome,
      recommendations: legalRecommendations,
      nextStepTypes: nextStepTypes,
      ownerInterpretationRefs: Array.isArray(brief.ownerInterpretationRefs) ? brief.ownerInterpretationRefs.slice() : [],
      evidenceRefs: evidenceFingerprints,
      clocks: {
        sourceAsOf: isNonEmptyString(read.sourceAsOf) ? read.sourceAsOf : null,
        modelAsOf: isNonEmptyString(read.modelAsOf) ? read.modelAsOf : null,
        freshUntil: isNonEmptyString(read.freshUntil) ? read.freshUntil : null
      },
      eligibility: isPlainObject(read.recommendationEligibility) ? read.recommendationEligibility : { eligible: false },
      evidenceBoundary: Array.isArray(read.evidenceBoundary) ? read.evidenceBoundary.slice() : [],
      limitations: Array.isArray(read.limitations) ? read.limitations.slice() : [],
      finalUse: isNonEmptyString(brief.windowUse) ? brief.windowUse : "context"
    };
  }

  /* compactFinalAuthorInput(registry, reads, briefs, groups, runContext, finalBudget): produce ONE bounded
     final-author input. It builds one mandatory FinalSourceEnvelope/v1 for every DERIVED source ID in
     registry order (never a literal count), plus the frozen registry/window header, deterministic
     groups/conflicts/exclusions, required-evidence summaries, low-noise results, and compact active
     lifecycle metadata. The final aggregator is never among the sources and is never self-consumed. The
     mandatory set is canonicalized under a conservative UTF-8 byte-as-token reservation; if it alone
     exceeds the final input cap it refuses B002-BUDGET before any author invocation (never truncating a
     participant, recommendation term, conflict, provenance ref, or required context). Optional facts are
     then added WHOLE by descending finalPriority, then source registry order, then stable fact ID; omitted
     fact IDs and fingerprints remain recorded. */
  function compactFinalAuthorInput(registry, reads, briefs, groups, runContext, finalBudget) {
    if (!isPlainObject(reads)) return failure("final-reads-required", "reads");
    if (!isPlainObject(briefs)) return failure("final-briefs-required", "briefs");
    if (!isPlainObject(groups) || groups.contractVersion !== "recommendation-groups/v1") return failure("final-groups-invalid", "groups");
    if (!isPlainObject(runContext)) return failure("final-run-context-required", "runContext");
    if (!isPlainObject(finalBudget)) return failure("final-budget-required", "finalBudget");
    var maxInputTokens = finalBudget.maxInputTokens;
    var maxOutputTokens = finalBudget.maxOutputTokens;
    var promptReserveBytes = finalBudget.promptReserveBytes;
    if (!Number.isInteger(maxInputTokens) || maxInputTokens <= 0) return failure("final-budget-input-invalid", "finalBudget.maxInputTokens");
    if (!Number.isInteger(maxOutputTokens) || maxOutputTokens <= 0) return failure("final-budget-output-invalid", "finalBudget.maxOutputTokens");
    if (!Number.isInteger(promptReserveBytes) || promptReserveBytes < 0) return failure("final-budget-reserve-invalid", "finalBudget.promptReserveBytes");

    var frozenResult = resolveFrozenRegistry(registry, runContext.registryConfig || null);
    if (!frozenResult.ok) return frozenResult;
    var frozen = frozenResult.value;

    if (!isNonEmptyString(runContext.runId)) return failure("final-run-id-required", "runContext.runId");
    if (!isNonEmptyString(runContext.runFingerprint)) return failure("final-run-fingerprint-required", "runContext.runFingerprint");
    if (!isPlainObject(runContext.marketSessionEvidenceRef) || !isNonEmptyString(runContext.marketSessionEvidenceRef.fingerprint)) {
      return failure("final-session-evidence-ref-required", "runContext.marketSessionEvidenceRef");
    }
    var headerFailure = validateWindowHeader(runContext.windowContext, "runContext.windowContext");
    if (headerFailure) return headerFailure;

    // The aggregator can never be consumed as a source (never a recursive Market Brief source brief).
    if (Object.prototype.hasOwnProperty.call(reads, frozen.aggregatorToolId) || Object.prototype.hasOwnProperty.call(briefs, frozen.aggregatorToolId)) {
      return failure("final-aggregator-self-consumed", frozen.aggregatorToolId);
    }

    var sourceEnvelopes = [];
    var optionalFacts = [];
    var sourceOrder;
    for (sourceOrder = 0; sourceOrder < frozen.orderedSourceToolIds.length; sourceOrder += 1) {
      var sourceId = frozen.orderedSourceToolIds[sourceOrder];
      var read = reads[sourceId];
      var brief = briefs[sourceId];
      if (!isPlainObject(read) || read.toolId !== sourceId) return failure("final-source-read-missing", "reads." + sourceId);
      if (!isPlainObject(brief) || brief.toolId !== sourceId) return failure("final-source-brief-missing", "briefs." + sourceId);
      sourceEnvelopes.push(buildFinalSourceEnvelope(read, brief));
      if (Array.isArray(read.facts)) {
        for (var fi = 0; fi < read.facts.length; fi += 1) {
          var fact = read.facts[fi];
          if (isPlainObject(fact) && isNonEmptyString(fact.id) && fact.requiredForBrief === false) {
            optionalFacts.push({ sourceToolId: sourceId, sourceOrder: sourceOrder, id: fact.id, briefPriority: fact.briefPriority, finalPriority: fact.finalPriority, fact: fact });
          }
        }
      }
    }
    optionalFacts.sort(finalOptionalFactSort);

    var runHeader = {
      runId: runContext.runId,
      runFingerprint: runContext.runFingerprint,
      window: runContext.windowContext.window,
      tradingDate: runContext.windowContext.tradingDate,
      scheduledFor: runContext.windowContext.scheduledFor,
      cutoffAt: runContext.windowContext.cutoffAt,
      calendarSessionRef: runContext.windowContext.calendarSessionRef,
      officialCloseAnchorRef: Object.prototype.hasOwnProperty.call(runContext.windowContext, "officialCloseAnchorRef") ? runContext.windowContext.officialCloseAnchorRef : null,
      requiredEvidenceResults: runContext.windowContext.requiredEvidenceResults,
      priorWindowThesisRef: Object.prototype.hasOwnProperty.call(runContext.windowContext, "priorWindowThesisRef") ? runContext.windowContext.priorWindowThesisRef : null,
      priorWindowThesisState: Object.prototype.hasOwnProperty.call(runContext.windowContext, "priorWindowThesisState") ? runContext.windowContext.priorWindowThesisState : null
    };
    var lowNoiseResults = Array.isArray(runContext.lowNoiseResults) ? runContext.lowNoiseResults : [];
    var lifecycle = isPlainObject(runContext.lifecycle) ? runContext.lifecycle : { contractVersion: "compact-lifecycle/v1", entries: {} };
    var actionThresholds = isPlainObject(runContext.actionThresholds) ? runContext.actionThresholds : { maxActions: 5, maxAttention: 8 };

    function buildFinalInput(selectedOptional) {
      var optionalRecords = [];
      for (var oi = 0; oi < selectedOptional.length; oi += 1) {
        optionalRecords.push({ sourceToolId: selectedOptional[oi].sourceToolId, id: selectedOptional[oi].id, fact: selectedOptional[oi].fact });
      }
      return {
        contractVersion: "final-author-input/v1",
        runHeader: runHeader,
        registry: {
          participantCount: frozen.participantCount,
          sourceCount: frozen.sourceCount,
          aggregatorToolId: frozen.aggregatorToolId,
          registryFingerprint: frozen.registryFingerprint,
          orderedParticipantIds: frozen.orderedParticipantIds.slice(),
          orderedSourceToolIds: frozen.orderedSourceToolIds.slice()
        },
        marketSessionEvidenceRef: runContext.marketSessionEvidenceRef,
        sourceEnvelopes: sourceEnvelopes,
        groups: { confidencePolicy: groups.confidencePolicy, groups: groups.groups, conflicts: groups.conflicts, exclusions: groups.exclusions },
        lowNoiseResults: lowNoiseResults,
        lifecycle: lifecycle,
        actionThresholds: actionThresholds,
        optionalFacts: optionalRecords
      };
    }
    function measure(selectedOptional) {
      return promptReserveBytes + safeCanonicalBytes(buildFinalInput(selectedOptional), "final-author-input/v1");
    }

    var reservedBytes;
    try {
      reservedBytes = measure([]);
    } catch (mandatoryError) {
      return failure(mandatoryError.reason || "final-input-noncanonical", mandatoryError.field || "finalInput");
    }
    if (reservedBytes > maxInputTokens) return budgetFailure("final-mandatory-material-exceeds-cap", "finalInput");

    var included = [];
    var includedFactIds = [];
    var omittedFacts = [];
    var currentBytes = reservedBytes;
    for (var oi = 0; oi < optionalFacts.length; oi += 1) {
      var candidate = included.concat([optionalFacts[oi]]);
      var candidateBytes;
      try {
        candidateBytes = measure(candidate);
      } catch (optionalError) {
        return failure(optionalError.reason || "final-input-noncanonical", "finalInput.optionalFacts");
      }
      if (candidateBytes <= maxInputTokens) {
        included = candidate;
        includedFactIds.push(optionalFacts[oi].id);
        currentBytes = candidateBytes;
      } else {
        omittedFacts.push({ id: optionalFacts[oi].id, sourceToolId: optionalFacts[oi].sourceToolId, fingerprint: contentSha256(optionalFacts[oi].fact, "tool-fact/v1") });
      }
    }

    var finalInput = buildFinalInput(included);
    includedFactIds.sort();
    omittedFacts.sort(function (left, right) { return left.id < right.id ? -1 : (left.id > right.id ? 1 : 0); });
    var policyFingerprint = fingerprint("final-author-policy", {
      contractVersion: "final-author-policy/v1",
      registryFingerprint: frozen.registryFingerprint,
      windowPolicyVersion: WINDOW_POLICY_VERSION,
      window: runHeader.window,
      maxInputTokens: maxInputTokens,
      maxOutputTokens: maxOutputTokens
    });
    return success({
      contractVersion: "compact-final-author-input/v1",
      finalInput: finalInput,
      participantIds: frozen.orderedParticipantIds.slice(),
      orderedSourceToolIds: frozen.orderedSourceToolIds.slice(),
      includedFactIds: includedFactIds,
      omittedFacts: omittedFacts,
      reservedInputTokens: currentBytes,
      inputByteLength: currentBytes - promptReserveBytes,
      promptReserveBytes: promptReserveBytes,
      maxInputTokens: maxInputTokens,
      maxOutputTokens: maxOutputTokens,
      policyFingerprint: policyFingerprint
    });
  }

  /* validateFinalBrief(final, runInputs, groups): prove one FinalBrief/v1 is a complete, honest,
     registry-wide synthesis. It rejects a final that omits or duplicates a registry participant, references
     a read/brief/recommendation absent from the run manifest, creates a market action from an ineligible
     profile/read, alters source recommendation terms, raises merged confidence above the minimum retained
     origin score, counts a shared evidence origin as independent, hides a conflict, exceeds the action or
     attention bound, lets an attention (low-noise) item consume an action slot, violates the window
     contract or the distinct-clock order, or embeds unsafe/private content. `runInputs` supplies the frozen
     registry, the run's reads/briefs maps, the session-evidence ref, and the action/attention thresholds;
     `groups` is the deterministic pre-aggregation the final must faithfully reflect. */
  function validateFinalBrief(final, runInputs, groups) {
    if (!isPlainObject(final)) return failure("final-brief-required", "final");
    if (!isPlainObject(runInputs)) return failure("final-run-inputs-required", "runInputs");
    if (!isPlainObject(groups) || groups.contractVersion !== "recommendation-groups/v1") return failure("final-groups-invalid", "groups");
    var unknown = hasOnlyFields(final, FINAL_BRIEF_FIELDS);
    if (unknown) return failure("unknown-field", "final." + unknown);
    if (final.contractVersion !== "final-brief/v1") return failure("contract-version-invalid", "final.contractVersion");

    var frozenResult = resolveFrozenRegistry(runInputs.registry, runInputs.registryConfig || null);
    if (!frozenResult.ok) return frozenResult;
    var frozen = frozenResult.value;
    var reads = isPlainObject(runInputs.reads) ? runInputs.reads : {};
    var briefs = isPlainObject(runInputs.briefs) ? runInputs.briefs : {};

    // Registry counts/fingerprint are derived, never literal; the final must carry the exact frozen values.
    if (!isPlainObject(final.registry)) return failure("final-registry-required", "final.registry");
    if (final.registry.participantCount !== frozen.participantCount) return failure("final-participant-count-mismatch", "final.registry.participantCount");
    if (final.registry.sourceCount !== frozen.sourceCount) return failure("final-source-count-mismatch", "final.registry.sourceCount");
    if (final.registry.registryFingerprint !== frozen.registryFingerprint) return failure("final-registry-fingerprint-mismatch", "final.registry.registryFingerprint");

    // One coverage row per participant, each exactly once — no omission, no duplicate, no invented participant.
    if (!Array.isArray(final.coverage)) return failure("final-coverage-invalid", "final.coverage");
    var coverageIds = [];
    var seenCoverage = Object.create(null);
    for (var c = 0; c < final.coverage.length; c += 1) {
      var row = final.coverage[c];
      if (!isPlainObject(row) || !isNonEmptyString(row.toolId)) return failure("final-coverage-row-invalid", "final.coverage." + c);
      if (!COVERAGE_OUTCOMES[row.outcome]) return failure("final-coverage-outcome-invalid", "final.coverage." + c + ".outcome");
      if (seenCoverage[row.toolId]) return failure("final-coverage-duplicate-participant", "final.coverage." + c + ".toolId");
      seenCoverage[row.toolId] = true;
      coverageIds.push(row.toolId);
    }
    if (!sameStringSet(coverageIds, frozen.orderedParticipantIds)) return failure("final-coverage-incomplete", "final.coverage");

    // One read/brief ref per source; every ref exists in the run manifest with a matching fingerprint.
    if (!isPlainObject(final.sourceRefs)) return failure("final-source-refs-invalid", "final.sourceRefs");
    var sourceRefKeys = Object.keys(final.sourceRefs);
    if (!sameStringSet(sourceRefKeys, frozen.orderedSourceToolIds)) return failure("final-source-refs-incomplete", "final.sourceRefs");
    for (var sri = 0; sri < frozen.orderedSourceToolIds.length; sri += 1) {
      var sid = frozen.orderedSourceToolIds[sri];
      var refEntry = final.sourceRefs[sid];
      if (!isPlainObject(refEntry) || !isPlainObject(refEntry.readRef) || !isPlainObject(refEntry.briefRef)) return failure("final-source-ref-shape-invalid", "final.sourceRefs." + sid);
      var manifestRead = reads[sid];
      var manifestBrief = briefs[sid];
      if (!isPlainObject(manifestRead) || refEntry.readRef.fingerprint !== manifestRead.fingerprint) return failure("final-read-ref-absent-from-manifest", "final.sourceRefs." + sid + ".readRef");
      if (!isPlainObject(manifestBrief) || refEntry.briefRef.fingerprint !== manifestBrief.contentFingerprint) return failure("final-brief-ref-absent-from-manifest", "final.sourceRefs." + sid + ".briefRef");
    }

    if (!isPlainObject(runInputs.marketSessionEvidenceRef) || !isPlainObject(final.marketSessionEvidenceRef) ||
      final.marketSessionEvidenceRef.fingerprint !== runInputs.marketSessionEvidenceRef.fingerprint) {
      return failure("final-session-evidence-mismatch", "final.marketSessionEvidenceRef");
    }

    var headerFailure = validateWindowHeader(final.windowContext, "final.windowContext");
    if (headerFailure) return headerFailure;

    // Distinct clocks: authored/evidence/model/published are separate and correctly ordered.
    if (!isPlainObject(final.clocks)) return failure("final-clocks-required", "final.clocks");
    var clockFields = ["modelAsOf", "evidenceCutoffAt", "authoredAt", "publishedAt"];
    for (var ck = 0; ck < clockFields.length; ck += 1) {
      var clockFailure = validateCanonicalTimestamp(final.clocks[clockFields[ck]], "final.clocks." + clockFields[ck], false);
      if (clockFailure) return failure(clockFailure, "final.clocks." + clockFields[ck]);
    }
    if (!(Date.parse(final.clocks.modelAsOf) <= Date.parse(final.clocks.evidenceCutoffAt) &&
      Date.parse(final.clocks.evidenceCutoffAt) <= Date.parse(final.clocks.authoredAt) &&
      Date.parse(final.clocks.authoredAt) <= Date.parse(final.clocks.publishedAt))) {
      return failure("final-clock-order-invalid", "final.clocks");
    }

    var thresholds = isPlainObject(runInputs.actionThresholds) ? runInputs.actionThresholds : { maxActions: 5, maxAttention: 8 };
    if (!Array.isArray(final.actions)) return failure("final-actions-invalid", "final.actions");
    if (Number.isInteger(thresholds.maxActions) && final.actions.length > thresholds.maxActions) return failure("final-actions-exceed-limit", "final.actions");
    var attention = Array.isArray(final.attention) ? final.attention : [];
    if (Number.isInteger(thresholds.maxAttention) && attention.length > thresholds.maxAttention) return failure("final-attention-exceed-limit", "final.attention");

    // Index the deterministic groups the final must faithfully reflect.
    var groupByKey = Object.create(null);
    for (var g = 0; g < groups.groups.length; g += 1) groupByKey[groups.groups[g].aggregationKey] = groups.groups[g];

    var actionSubjects = Object.create(null);
    for (var a = 0; a < final.actions.length; a += 1) {
      var action = final.actions[a];
      if (!isPlainObject(action)) return failure("final-action-invalid", "final.actions." + a);
      var actionUnknown = hasOnlyFields(action, FINAL_ACTION_FIELDS);
      if (actionUnknown) return failure("unknown-field", "final.actions." + a + "." + actionUnknown);
      if (!MARKET_ACTIONS[action.actionFamily]) return failure("final-action-family-invalid", "final.actions." + a + ".actionFamily");
      var group = groupByKey[action.aggregationKey];
      if (!group) return failure("final-action-not-in-groups", "final.actions." + a + ".aggregationKey");
      // Terms cannot be altered from the deterministic group.
      if (!sameStringSet(action.subjects, group.subjects) || action.actionFamily !== group.actionFamily || action.horizon !== group.horizon) {
        return failure("final-action-terms-altered", "final.actions." + a);
      }
      if (!sameStringSet(action.memberKeys, group.memberKeys)) return failure("final-action-members-altered", "final.actions." + a + ".memberKeys");
      // Merged confidence is EXACTLY the minimum retained origin score; never raised.
      if (action.mergedConfidenceScore > group.mergedConfidenceScore) return failure("final-confidence-above-minimum", "final.actions." + a + ".mergedConfidenceScore");
      if (action.mergedConfidenceScore !== group.mergedConfidenceScore) return failure("final-confidence-not-minimum-retained", "final.actions." + a + ".mergedConfidenceScore");
      // Every origin read must be eligible + live-market; the action must name an owner interpretation from those briefs.
      if (!Array.isArray(action.ownerInterpretationRefs) || action.ownerInterpretationRefs.length === 0) return failure("final-action-owner-interpretation-required", "final.actions." + a + ".ownerInterpretationRefs");
      var permittedInterpretations = Object.create(null);
      for (var oti = 0; oti < group.originToolIds.length; oti += 1) {
        var originToolId = group.originToolIds[oti];
        var originRead = reads[originToolId];
        if (!isPlainObject(originRead) || !originRead.recommendationEligibility || originRead.recommendationEligibility.eligible !== true || originRead.profile !== "live-market") {
          return failure("final-action-ineligible-origin", "final.actions." + a + ".originToolIds");
        }
        var originBrief = briefs[originToolId];
        var refs = originBrief && Array.isArray(originBrief.ownerInterpretationRefs) ? originBrief.ownerInterpretationRefs : [];
        for (var pr = 0; pr < refs.length; pr += 1) permittedInterpretations[refs[pr]] = true;
      }
      for (var air = 0; air < action.ownerInterpretationRefs.length; air += 1) {
        if (!permittedInterpretations[action.ownerInterpretationRefs[air]]) return failure("final-action-owner-interpretation-absent", "final.actions." + a + ".ownerInterpretationRefs." + air);
      }
      for (var asub = 0; asub < action.subjects.length; asub += 1) actionSubjects[action.subjects[asub]] = true;
    }

    // Every deterministic conflict remains visible; none may be hidden.
    if (!Array.isArray(final.conflicts)) return failure("final-conflicts-invalid", "final.conflicts");
    var finalConflictKeys = Object.create(null);
    for (var fc = 0; fc < final.conflicts.length; fc += 1) {
      if (isPlainObject(final.conflicts[fc]) && Array.isArray(final.conflicts[fc].keys)) finalConflictKeys[final.conflicts[fc].keys.slice().sort().join("|")] = true;
    }
    for (var gc = 0; gc < groups.conflicts.length; gc += 1) {
      if (!finalConflictKeys[groups.conflicts[gc].keys.slice().sort().join("|")]) return failure("final-conflict-hidden", "final.conflicts");
    }

    // Attention (low-noise) items consume no action slot.
    for (var at = 0; at < attention.length; at += 1) {
      var item = attention[at];
      if (!isPlainObject(item) || !isNonEmptyString(item.suppressionReason)) return failure("final-attention-suppression-required", "final.attention." + at);
      if (item.destination !== "context" && item.destination !== "no-action") return failure("final-attention-destination-invalid", "final.attention." + at + ".destination");
      if (Array.isArray(item.subjects)) {
        for (var isub = 0; isub < item.subjects.length; isub += 1) {
          if (actionSubjects[item.subjects[isub]]) return failure("final-attention-consumes-action", "final.attention." + at + ".subjects");
        }
      }
    }

    var unsafeFailure = scanUnsafeValue(final, "final");
    if (unsafeFailure) return unsafeFailure;

    var canonicalFinal;
    try {
      canonicalFinal = JSON.parse(canonicalize(final, final.contractVersion));
    } catch (canonicalError) {
      return failure(canonicalError.reason || "final-noncanonical", canonicalError.field || "final");
    }
    return success(canonicalFinal);
  }

  var api = Object.freeze({
    canonicalize: canonicalize,
    compactAuthorInput: compactAuthorInput,
    compactFinalAuthorInput: compactFinalAuthorInput,
    contentSha256: contentSha256,
    deriveRecommendationKeys: deriveRecommendationKeys,
    evaluateLowNoiseGate: evaluateLowNoiseGate,
    fingerprint: fingerprint,
    groupRecommendations: groupRecommendations,
    occurrenceFingerprint: occurrenceFingerprint,
    reduceRecommendationEvents: reduceRecommendationEvents,
    semanticFingerprint: semanticFingerprint,
    validateEvidenceReference: validateEvidenceReference,
    validateFinalBrief: validateFinalBrief,
    validateRegistry: validateRegistry,
    validateSourceProvenance: validateSourceProvenance,
    validateToolBrief: validateToolBrief,
    validateWindowHeader: validateWindowHeader
  });

  root.RLCONTRACTS = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
})();