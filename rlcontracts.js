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

  var api = Object.freeze({
    canonicalize: canonicalize,
    contentSha256: contentSha256,
    fingerprint: fingerprint,
    occurrenceFingerprint: occurrenceFingerprint,
    semanticFingerprint: semanticFingerprint,
    validateEvidenceReference: validateEvidenceReference,
    validateSourceProvenance: validateSourceProvenance
  });

  root.RLCONTRACTS = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
})();