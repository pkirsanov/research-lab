/*
 * rljourney.js
 * ------------------------------------------------------------------------
 * Feature 012 Scope 08 — Journey capability RUNTIME.
 *
 * This module is the ONE shared Journey runtime. It CONSUMES the static Journey
 * definition/step registry (journeys.json) whose SCHEMA is owned and validated
 * by rlexperience.js (validateJourneyRegistry / validateJourneyDefinition /
 * validateJourneyStep). rljourney adds the RUNTIME layer that rlexperience does
 * not own:
 *
 *   - runtime-boundary shape preconditions for a definition/step it is asked to
 *     compile (a defensive re-check; it does NOT fork the full Scope-04 schema
 *     validator — deep registry validation stays single-sourced in rlexperience);
 *   - dependency-DAG construction with cycle rejection and topological order;
 *   - canonical semantic fingerprints for compiled definitions, sessions, and
 *     completion packets;
 *   - JourneySession create / serialize / restore / step-complete / resume /
 *     backtrack with DEPENDENCY-AWARE TRANSITIVE STALE marking (SCN-012-010):
 *     backtracking an earlier assumption marks every transitive dependent stale
 *     WITH a reason, leaves unrelated completed steps intact, and a completion
 *     packet CANNOT carry a stale dependent conclusion;
 *   - typed complete / partial / refused JourneyCompletionPacket construction
 *     (SCN-012-011): the runtime is NON-EXECUTING. There is no trade/order/
 *     holding-change/rebalance/hedge/external-execution code path anywhere in
 *     this module. Recording human signoff records acceptance of the RESEARCH
 *     PROCESS only and mutates local review state only;
 *   - closed, safe refusal errors.
 *
 * HARD INVARIANTS enforced here:
 *   - A definition/step handed to the runtime CANNOT contain executable
 *     JavaScript (any function value anywhere is rejected: RLJOURNEY-EXECUTION).
 *   - Every compiled goal carries noExecution:true (a definition that does not
 *     declare it is rejected).
 *   - The runtime performs ZERO fetch / providerFetch / credential / localStorage
 *     / LLM / publisher access and mutates NO owner/portfolio/publication state.
 *     Session persistence (verified local slots) is a SEPARATE storage concern
 *     delivered by a later scope; this module is pure in-memory compute and
 *     therefore holds no I/O surface at all.
 *   - Sessions/packets carry ONLY non-sensitive data: any forbidden field name
 *     (token/account/holding/quantity/cost/pnl/payment/secret/position/...) is
 *     rejected (RLJOURNEY-PRIVACY).
 *   - PORTFOLIO-STRESS PRIVATE EXECUTION IS GATED TO SCOPE 13, NOT implemented
 *     here. A definition with privacyClass "local-private-ref" (the Market
 *     Action Center portfolio-stress goal) compiles with gated:true; the runtime
 *     reads no Feature 008 data and never derives a real portfolio comparison —
 *     its private step stays an evidence-gated placeholder.
 *
 * Ships as a UMD dual module: Node (module.exports) for tests, and browser global
 * RLJOURNEY for the shared shell.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLJOURNEY_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLJOURNEY = api;
})(function () {
  "use strict";

  /* ═══════════ closed contract constants ═══════════ */

  var CONTRACT = Object.freeze({
    runtime: "journey-runtime/v1",
    compiled: "journey-compiled-definition/v1",
    session: "journey-session/v1",
    packet: "journey-completion-packet/v1"
  });
  var MECHANISMS = Object.freeze(["wizard", "checklist", "decision-tree", "scenario-lab", "composition"]);
  var COMPLETION_PREDICATES = Object.freeze([
    "all-required-evidence-current", "explicit-choice-recorded",
    "scenario-comparison-complete", "branch-terminal-reached"
  ]);
  var PACKET_OUTCOMES = Object.freeze(["complete", "partial", "refused"]);
  var PRIVACY_CLASSES = Object.freeze(["public-safe", "local-nonsensitive", "local-private-ref"]);
  var STEP_STATES = Object.freeze(["pending", "active", "complete", "stale"]);
  var REFUSAL_CODES = Object.freeze([
    "RLJOURNEY-INPUT", "RLJOURNEY-DEFINITION", "RLJOURNEY-STEP", "RLJOURNEY-DAG",
    "RLJOURNEY-MECHANISM", "RLJOURNEY-SESSION", "RLJOURNEY-STALE", "RLJOURNEY-PACKET",
    "RLJOURNEY-EXECUTION", "RLJOURNEY-PRIVACY", "RLJOURNEY-VERSION", "RLJOURNEY-STORE"
  ]);
  /* forbidden storage field-name roots (privacy boundary). A field whose lower-cased
     name contains any of these roots may never enter a session or a packet. */
  var FORBIDDEN_FIELD_ROOTS = Object.freeze([
    "authtoken", "token", "account", "holding", "quantity", "costbasis", "cost",
    "pnl", "pandl", "payment", "secret", "apikey", "password", "position", "ssn",
    "credential"
  ]);
  var ID_PATTERN = /^[a-z0-9]+(?:[a-z0-9/-]*[a-z0-9])?$/;
  /* goal identifiers that are placeholder / example-only and are never a real goal. */
  var GENERIC_GOAL_TOKENS = Object.freeze([
    "example", "generic", "placeholder", "goal-one", "goal-two", "sample", "tbd", "todo", "demo"
  ]);

  /* ═══════════ structural helpers ═══════════ */

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function equalStringArray(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    for (var i = 0; i < left.length; i += 1) { if (left[i] !== right[i]) return false; }
    return true;
  }

  /* ═══════════ canonical serialization + fingerprint ═══════════ */

  function canonicalize(value) {
    var active = [];
    function encode(current) {
      if (current === null) return "null";
      if (typeof current === "string" || typeof current === "boolean") return JSON.stringify(current);
      if (typeof current === "number") {
        if (!Number.isFinite(current)) throw new Error("RLJOURNEY_NONFINITE_CANONICAL_VALUE");
        return JSON.stringify(current);
      }
      if (Array.isArray(current)) {
        if (active.indexOf(current) !== -1) throw new Error("RLJOURNEY_CYCLIC_CANONICAL_VALUE");
        active.push(current);
        var items = current.map(encode);
        active.pop();
        return "[" + items.join(",") + "]";
      }
      if (isPlainObject(current)) {
        if (active.indexOf(current) !== -1) throw new Error("RLJOURNEY_CYCLIC_CANONICAL_VALUE");
        active.push(current);
        var fields = Object.keys(current).sort().map(function (key) {
          if (typeof current[key] === "undefined") throw new Error("RLJOURNEY_UNDEFINED_CANONICAL_VALUE");
          return JSON.stringify(key) + ":" + encode(current[key]);
        });
        active.pop();
        return "{" + fields.join(",") + "}";
      }
      throw new Error("RLJOURNEY_UNSUPPORTED_CANONICAL_VALUE");
    }
    return encode(value);
  }

  /* self-contained synchronous SHA-256 over the UTF-8 bytes of the canonical form.
     Identical result in Node and the browser (no crypto dependency, no async). */
  function sha256(text) {
    var K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
    var bytes = [];
    for (var ci = 0; ci < text.length; ci += 1) {
      var code = text.charCodeAt(ci);
      if (code < 0x80) { bytes.push(code); }
      else if (code < 0x800) { bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f)); }
      else if (code < 0xd800 || code >= 0xe000) { bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f)); }
      else {
        ci += 1;
        var full = 0x10000 + (((code & 0x3ff) << 10) | (text.charCodeAt(ci) & 0x3ff));
        bytes.push(0xf0 | (full >> 18), 0x80 | ((full >> 12) & 0x3f), 0x80 | ((full >> 6) & 0x3f), 0x80 | (full & 0x3f));
      }
    }
    var bitLength = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) { bytes.push(0); }
    var high = Math.floor(bitLength / 0x100000000);
    var low = bitLength >>> 0;
    bytes.push((high >>> 24) & 0xff, (high >>> 16) & 0xff, (high >>> 8) & 0xff, high & 0xff);
    bytes.push((low >>> 24) & 0xff, (low >>> 16) & 0xff, (low >>> 8) & 0xff, low & 0xff);
    var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);
    for (var offset = 0; offset < bytes.length; offset += 64) {
      for (var t = 0; t < 16; t += 1) {
        w[t] = (bytes[offset + t * 4] << 24) | (bytes[offset + t * 4 + 1] << 16) | (bytes[offset + t * 4 + 2] << 8) | bytes[offset + t * 4 + 3];
      }
      for (t = 16; t < 64; t += 1) {
        var s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        var s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
      for (t = 0; t < 64; t += 1) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var temp1 = (hh + S1 + ch + K[t] + w[t]) | 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (S0 + maj) | 0;
        hh = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }
      h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
    }
    var hex = "";
    for (var hi = 0; hi < h.length; hi += 1) {
      hex += ("00000000" + (h[hi] >>> 0).toString(16)).slice(-8);
    }
    return hex;
  }

  function fingerprint(value) {
    return "sha256:" + sha256(canonicalize(value));
  }

  /* ═══════════ safe closed errors ═══════════ */

  function reject(code, fieldPath, reason) {
    var error = new Error(code + " " + fieldPath + " " + reason);
    error.name = "RljRefusal";
    error.code = code;
    error.fieldPath = fieldPath;
    error.reason = reason;
    throw error;
  }

  function capture(operation) {
    try {
      return { ok: true, value: operation() };
    } catch (error) {
      if (error && error.name === "RljRefusal") {
        return { ok: false, error: { code: error.code, fieldPath: error.fieldPath, reason: error.reason } };
      }
      throw error;
    }
  }

  function projectError(error) {
    if (error && error.name === "RljRefusal") {
      return { code: error.code, fieldPath: error.fieldPath, reason: error.reason };
    }
    return { code: "RLJOURNEY-INPUT", fieldPath: "$", reason: "unexpected runtime error" };
  }

  /* ═══════════ invariant guards ═══════════ */

  /* Config/definition/session/packet data may never contain executable JavaScript. */
  function assertNoExecutable(value, path) {
    var seen = [];
    (function walk(current, currentPath) {
      if (typeof current === "function") reject("RLJOURNEY-EXECUTION", currentPath, "executable code is forbidden in Journey data");
      if (!current || typeof current !== "object") return;
      if (seen.indexOf(current) !== -1) return;
      seen.push(current);
      if (Array.isArray(current)) {
        current.forEach(function (item, index) { walk(item, currentPath + "[" + index + "]"); });
        return;
      }
      Object.keys(current).forEach(function (key) { walk(current[key], currentPath + "." + key); });
    })(value, path);
  }

  /* Sessions/packets may carry only non-sensitive data. */
  function assertNoForbiddenFields(value, path) {
    var seen = [];
    (function walk(current, currentPath) {
      if (!current || typeof current !== "object") return;
      if (seen.indexOf(current) !== -1) return;
      seen.push(current);
      if (Array.isArray(current)) {
        current.forEach(function (item, index) { walk(item, currentPath + "[" + index + "]"); });
        return;
      }
      Object.keys(current).forEach(function (key) {
        var lowered = String(key).toLowerCase();
        FORBIDDEN_FIELD_ROOTS.forEach(function (root) {
          if (lowered.indexOf(root) !== -1) reject("RLJOURNEY-PRIVACY", currentPath + "." + key, "forbidden sensitive field name");
        });
        walk(current[key], currentPath + "." + key);
      });
    })(value, path);
  }

  function requireString(value, path) {
    if (typeof value !== "string" || value.length === 0) reject("RLJOURNEY-INPUT", path, "non-empty string required");
    return value;
  }

  function requireArray(value, path, minLength) {
    if (!Array.isArray(value) || value.length < (minLength || 0)) reject("RLJOURNEY-INPUT", path, "array of at least " + (minLength || 0) + " required");
    return value;
  }

  /* ═══════════ definition runtime-shape precondition ═══════════
     A defensive runtime-boundary check. Deep schema validation of the whole
     registry is single-sourced in rlexperience.validateJourneyRegistry — this
     only verifies the runtime preconditions rljourney relies on so a malformed
     definition never reaches the DAG builder or the session engine. */
  function requireRuntimeDefinitionShape(definition) {
    if (!isPlainObject(definition)) reject("RLJOURNEY-DEFINITION", "$definition", "definition object required");
    requireString(definition.definitionId, "$definition.definitionId");
    requireString(definition.definitionVersion, "$definition.definitionVersion");
    requireString(definition.toolId, "$definition.toolId");
    requireString(definition.goalId, "$definition.goalId");
    if (!ID_PATTERN.test(definition.definitionId) || !ID_PATTERN.test(definition.toolId) || !ID_PATTERN.test(definition.goalId)) {
      reject("RLJOURNEY-DEFINITION", "$definition", "definition identifiers are invalid");
    }
    if (MECHANISMS.indexOf(definition.mechanism) === -1) reject("RLJOURNEY-DEFINITION", "$definition.mechanism", "unknown mechanism");
    if (definition.noExecution !== true) reject("RLJOURNEY-DEFINITION", "$definition.noExecution", "definition must declare noExecution true");
    if (PRIVACY_CLASSES.indexOf(definition.privacyClass) === -1) reject("RLJOURNEY-DEFINITION", "$definition.privacyClass", "unknown privacy class");
    requireArray(definition.stepIds, "$definition.stepIds", 1);
    if (!isPlainObject(definition.backtrackPolicy) || definition.backtrackPolicy.mode !== "transitive-dependents-stale" || definition.backtrackPolicy.auditPriorOutcomes !== true) {
      reject("RLJOURNEY-DEFINITION", "$definition.backtrackPolicy", "backtrack policy must be transitive-dependents-stale with audit");
    }
    if (!isPlainObject(definition.staleEvidencePolicy) || definition.staleEvidencePolicy.mode !== "reopen-dependent-steps" || definition.staleEvidencePolicy.preserveAudit !== true) {
      reject("RLJOURNEY-DEFINITION", "$definition.staleEvidencePolicy", "stale policy must reopen-dependent-steps with audit");
    }
    if (!isPlainObject(definition.completionPolicy) || !equalStringArray(definition.completionPolicy.outcomes, PACKET_OUTCOMES)) {
      reject("RLJOURNEY-DEFINITION", "$definition.completionPolicy.outcomes", "completion outcomes must be exact complete/partial/refused");
    }
    requireArray(definition.completionPolicy.predicates, "$definition.completionPolicy.predicates", 1);
    definition.completionPolicy.predicates.forEach(function (predicate, index) {
      if (COMPLETION_PREDICATES.indexOf(predicate) === -1) reject("RLJOURNEY-DEFINITION", "$definition.completionPolicy.predicates[" + index + "]", "unknown completion predicate");
    });
    if (!isPlainObject(definition.packetPolicy) || definition.packetPolicy.humanSignoffRequired !== true || definition.packetPolicy.noExecution !== true) {
      reject("RLJOURNEY-DEFINITION", "$definition.packetPolicy", "packet policy must require signoff and declare noExecution");
    }
    if (!isPlainObject(definition.evidencePolicy)) reject("RLJOURNEY-DEFINITION", "$definition.evidencePolicy", "evidence policy required");
    requireArray(definition.evidencePolicy.requiredSlots, "$definition.evidencePolicy.requiredSlots", 1);
    requireArray(definition.evidencePolicy.allowedProvenance, "$definition.evidencePolicy.allowedProvenance", 1);
    requireArray(definition.prerequisiteRules, "$definition.prerequisiteRules", 1);
    if (!isPlainObject(definition.contextSchema)) reject("RLJOURNEY-DEFINITION", "$definition.contextSchema", "context schema required");
    requireArray(definition.contextSchema.allowedFields, "$definition.contextSchema.allowedFields", 1);
    requireArray(definition.contextSchema.requiredFields, "$definition.contextSchema.requiredFields", 1);
    if (!isPlainObject(definition.accessibility)) reject("RLJOURNEY-DEFINITION", "$definition.accessibility", "accessibility labels required");
    requireArray(definition.limitations, "$definition.limitations", 1);
  }

  function requireRuntimeStepShape(step, definitionId) {
    if (!isPlainObject(step)) reject("RLJOURNEY-STEP", "$step", "step object required");
    requireString(step.stepId, "$step.stepId");
    if (step.definitionId !== definitionId) reject("RLJOURNEY-STEP", "$step.definitionId", "step does not belong to its definition");
    if (COMPLETION_PREDICATES.indexOf(step.completionPredicate) === -1) reject("RLJOURNEY-STEP", "$step.completionPredicate", "unknown completion predicate");
    if (step.sideEffectPolicy !== "none") reject("RLJOURNEY-STEP", "$step.sideEffectPolicy", "steps cannot declare side effects");
    requireArray(step.dependsOnStepIds, "$step.dependsOnStepIds", 0);
    requireArray(step.invalidatesStepIds, "$step.invalidatesStepIds", 0);
    requireArray(step.requiredEvidenceSlots, "$step.requiredEvidenceSlots", 0);
  }

  /* ═══════════ dependency DAG (cycle rejection + topological order) ═══════════ */

  function buildDependencyGraph(definition, steps) {
    var stepMap = Object.create(null);
    var declared = definition.stepIds.slice();
    steps.forEach(function (step) {
      requireRuntimeStepShape(step, definition.definitionId);
      if (declared.indexOf(step.stepId) === -1) reject("RLJOURNEY-DAG", "$steps." + step.stepId, "step is not declared by its definition");
      if (stepMap[step.stepId]) reject("RLJOURNEY-DAG", "$steps." + step.stepId, "duplicate step");
      stepMap[step.stepId] = step;
    });
    declared.forEach(function (stepId) {
      if (!stepMap[stepId]) reject("RLJOURNEY-DAG", "$definition.stepIds." + stepId, "declared step has no step record");
    });
    /* forward edges dep -> step from dependsOnStepIds; validate containment. */
    var indegree = Object.create(null);
    var adjacency = Object.create(null);
    declared.forEach(function (stepId) { indegree[stepId] = 0; adjacency[stepId] = []; });
    declared.forEach(function (stepId) {
      var step = stepMap[stepId];
      step.dependsOnStepIds.forEach(function (depId) {
        if (declared.indexOf(depId) === -1) reject("RLJOURNEY-DAG", "$steps." + stepId + ".dependsOnStepIds", "dependency leaves the definition");
        if (depId === stepId) reject("RLJOURNEY-DAG", "$steps." + stepId, "step cannot depend on itself");
        adjacency[depId].push(stepId);
        indegree[stepId] += 1;
      });
      step.invalidatesStepIds.forEach(function (targetId) {
        if (declared.indexOf(targetId) === -1) reject("RLJOURNEY-DAG", "$steps." + stepId + ".invalidatesStepIds", "invalidation target leaves the definition");
      });
      (step.branchRules || []).forEach(function (rule) {
        if (rule && rule.targetStepId && declared.indexOf(rule.targetStepId) === -1) reject("RLJOURNEY-DAG", "$steps." + stepId + ".branchRules", "branch target leaves the definition");
      });
    });
    /* Kahn topological sort in declared order for determinism; leftover nodes => cycle. */
    var queue = declared.filter(function (stepId) { return indegree[stepId] === 0; });
    var order = [];
    var remaining = Object.assign(Object.create(null), indegree);
    var cursor = 0;
    while (cursor < queue.length) {
      var current = queue[cursor];
      cursor += 1;
      order.push(current);
      adjacency[current].forEach(function (next) {
        remaining[next] -= 1;
        if (remaining[next] === 0) queue.push(next);
      });
    }
    if (order.length !== declared.length) reject("RLJOURNEY-DAG", "$definition.stepIds", "step dependency graph contains a cycle");
    /* direct dependents = steps that depend on it, plus its explicit invalidation targets. */
    var directDependents = Object.create(null);
    declared.forEach(function (stepId) { directDependents[stepId] = []; });
    declared.forEach(function (stepId) {
      var step = stepMap[stepId];
      step.dependsOnStepIds.forEach(function (depId) {
        if (directDependents[depId].indexOf(stepId) === -1) directDependents[depId].push(stepId);
      });
      step.invalidatesStepIds.forEach(function (targetId) {
        if (directDependents[stepId].indexOf(targetId) === -1) directDependents[stepId].push(targetId);
      });
    });
    /* transitive closure of dependents in topological order. */
    var transitiveDependents = Object.create(null);
    for (var oi = order.length - 1; oi >= 0; oi -= 1) {
      var node = order[oi];
      var collected = [];
      directDependents[node].forEach(function (dep) {
        if (collected.indexOf(dep) === -1) collected.push(dep);
        (transitiveDependents[dep] || []).forEach(function (deeper) {
          if (collected.indexOf(deeper) === -1) collected.push(deeper);
        });
      });
      collected.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
      transitiveDependents[node] = collected;
    }
    return { order: order, stepMap: stepMap, directDependents: directDependents, transitiveDependents: transitiveDependents };
  }

  /* ═══════════ definition / registry compilation ═══════════ */

  function compileDefinitionInternal(definition, steps) {
    assertNoExecutable(definition, "$definition");
    requireArray(steps, "$steps", 1);
    steps.forEach(function (step, index) { assertNoExecutable(step, "$steps[" + index + "]"); });
    requireRuntimeDefinitionShape(definition);
    var graph = buildDependencyGraph(definition, steps);
    var fingerprintSource = JSON.parse(JSON.stringify(definition));
    fingerprintSource.definitionFingerprint = null;
    var stepFingerprints = graph.order.map(function (stepId) {
      var stepSource = JSON.parse(JSON.stringify(graph.stepMap[stepId]));
      stepSource.stepFingerprint = null;
      return { stepId: stepId, stepFingerprint: fingerprint(stepSource) };
    });
    var compiled = {
      contractVersion: CONTRACT.compiled,
      definitionId: definition.definitionId,
      definitionVersion: definition.definitionVersion,
      toolId: definition.toolId,
      goalId: definition.goalId,
      title: definition.title,
      mechanism: definition.mechanism,
      privacyClass: definition.privacyClass,
      gated: definition.privacyClass === "local-private-ref",
      noExecution: true,
      contextSchema: {
        allowedFields: definition.contextSchema.allowedFields.slice(),
        requiredFields: definition.contextSchema.requiredFields.slice()
      },
      evidenceRequiredSlots: definition.evidencePolicy.requiredSlots.slice(),
      completionPredicates: definition.completionPolicy.predicates.slice(),
      order: graph.order.slice(),
      directDependents: graph.directDependents,
      transitiveDependents: graph.transitiveDependents,
      steps: graph.order.map(function (stepId) {
        var step = graph.stepMap[stepId];
        return {
          stepId: step.stepId,
          mechanismRole: step.mechanismRole,
          dependsOnStepIds: step.dependsOnStepIds.slice(),
          requiredEvidenceSlots: step.requiredEvidenceSlots.slice(),
          completionPredicate: step.completionPredicate,
          gated: definition.privacyClass === "local-private-ref"
        };
      }),
      stepFingerprints: stepFingerprints,
      definitionFingerprint: fingerprint(fingerprintSource)
    };
    return deepFreeze(compiled);
  }

  function compileRegistryInternal(registry) {
    if (!isPlainObject(registry)) reject("RLJOURNEY-DEFINITION", "$registry", "registry object required");
    requireArray(registry.definitions, "$registry.definitions", 1);
    requireArray(registry.steps, "$registry.steps", 1);
    var stepsByDefinition = Object.create(null);
    registry.steps.forEach(function (step, index) {
      if (!isPlainObject(step)) reject("RLJOURNEY-STEP", "$registry.steps[" + index + "]", "step object required");
      var definitionId = step.definitionId;
      (stepsByDefinition[definitionId] = stepsByDefinition[definitionId] || []).push(step);
    });
    var compiledById = Object.create(null);
    var byTool = Object.create(null);
    registry.definitions.forEach(function (definition, index) {
      if (!isPlainObject(definition)) reject("RLJOURNEY-DEFINITION", "$registry.definitions[" + index + "]", "definition object required");
      var steps = stepsByDefinition[definition.definitionId] || [];
      if (steps.length === 0) reject("RLJOURNEY-DEFINITION", "$registry.definitions[" + index + "]", "definition has no steps");
      var compiled = compileDefinitionInternal(definition, steps);
      if (compiledById[compiled.definitionId]) reject("RLJOURNEY-DEFINITION", "$registry.definitions[" + index + "]", "duplicate definition");
      compiledById[compiled.definitionId] = compiled;
      (byTool[compiled.toolId] = byTool[compiled.toolId] || []).push(compiled);
    });
    return deepFreeze({
      contractVersion: CONTRACT.runtime,
      definitions: compiledById,
      byTool: byTool,
      definitionIds: Object.keys(compiledById)
    });
  }

  /* ═══════════ registry completeness (SCN-012-032) ═══════════
     inventory rows are derived from the production tool registry (tools.json):
       { registryId, kind: "ordinary"|"market-action-center", journeyDefinitionIds:[...] } */
  function validateRegistryCompletenessInternal(registry, inventory) {
    var compiledRegistry = compileRegistryInternal(registry);
    requireArray(inventory, "$inventory", 1);
    var ordinaryTools = 0;
    var centerGoals = 0;
    var totalGoals = 0;
    inventory.forEach(function (row, index) {
      var rowPath = "$inventory[" + index + "]";
      if (!isPlainObject(row)) reject("RLJOURNEY-INPUT", rowPath, "inventory row required");
      requireString(row.registryId, rowPath + ".registryId");
      requireArray(row.journeyDefinitionIds, rowPath + ".journeyDefinitionIds", 1);
      var isCenter = row.kind === "market-action-center";
      if (!isCenter && row.kind !== "ordinary") reject("RLJOURNEY-INPUT", rowPath + ".kind", "unknown registry kind");
      if (isCenter && row.journeyDefinitionIds.length !== 4) reject("RLJOURNEY-DEFINITION", rowPath + ".journeyDefinitionIds", "Market Action Center requires exactly four global goals");
      if (!isCenter && row.journeyDefinitionIds.length < 2) reject("RLJOURNEY-DEFINITION", rowPath + ".journeyDefinitionIds", "ordinary tool requires at least two concrete goals");
      var seenGoals = Object.create(null);
      row.journeyDefinitionIds.forEach(function (definitionId, goalIndex) {
        var goalPath = rowPath + ".journeyDefinitionIds[" + goalIndex + "]";
        var compiled = compiledRegistry.definitions[definitionId];
        if (!compiled) reject("RLJOURNEY-DEFINITION", goalPath, "journey definition is unresolved");
        var expectedToolId = isCenter ? "market-action" : row.registryId;
        if (compiled.toolId !== expectedToolId) reject("RLJOURNEY-DEFINITION", goalPath, "journey definition tool identity mismatch");
        if (seenGoals[compiled.goalId]) reject("RLJOURNEY-DEFINITION", goalPath, "duplicate goal for tool");
        seenGoals[compiled.goalId] = true;
        var loweredGoal = compiled.goalId.toLowerCase();
        GENERIC_GOAL_TOKENS.forEach(function (token) {
          if (loweredGoal === token || loweredGoal.indexOf(token) !== -1) reject("RLJOURNEY-DEFINITION", goalPath, "generic or example-only goal is forbidden");
        });
        if (MECHANISMS.indexOf(compiled.mechanism) === -1) reject("RLJOURNEY-DEFINITION", goalPath, "goal has no valid mechanism");
        if (compiled.evidenceRequiredSlots.length < 1) reject("RLJOURNEY-DEFINITION", goalPath, "goal has no evidence slot");
        if (compiled.completionPredicates.length < 1) reject("RLJOURNEY-DEFINITION", goalPath, "goal has no completion predicate");
        if (compiled.order.length < 1) reject("RLJOURNEY-DEFINITION", goalPath, "goal has no steps");
        if (compiled.noExecution !== true) reject("RLJOURNEY-DEFINITION", goalPath, "goal must declare noExecution");
        totalGoals += 1;
        if (isCenter) centerGoals += 1;
      });
      if (!isCenter) ordinaryTools += 1;
    });
    if (centerGoals !== 4) reject("RLJOURNEY-DEFINITION", "$inventory", "Market Action Center must expose exactly four global goals");
    return deepFreeze({
      contractVersion: CONTRACT.runtime,
      ordinaryTools: ordinaryTools,
      centerGoals: centerGoals,
      totalGoals: totalGoals,
      definitionCount: compiledRegistry.definitionIds.length
    });
  }

  /* ═══════════ mechanism adapter contract (declarative, non-executing) ═══════════ */

  var MECHANISM_ADAPTERS = deepFreeze({
    wizard: { mechanism: "wizard", progression: "linear", requiresBranchTerminal: false },
    checklist: { mechanism: "checklist", progression: "unordered-complete", requiresBranchTerminal: false },
    "decision-tree": { mechanism: "decision-tree", progression: "branching", requiresBranchTerminal: true },
    "scenario-lab": { mechanism: "scenario-lab", progression: "comparison", requiresBranchTerminal: false },
    composition: { mechanism: "composition", progression: "declared-reducers", requiresBranchTerminal: false }
  });

  function validateMechanismAdapterInternal(adapter) {
    if (!isPlainObject(adapter)) reject("RLJOURNEY-MECHANISM", "$adapter", "adapter object required");
    if (MECHANISMS.indexOf(adapter.mechanism) === -1) reject("RLJOURNEY-MECHANISM", "$adapter.mechanism", "unknown mechanism");
    Object.keys(adapter).forEach(function (key) {
      if (typeof adapter[key] === "function") reject("RLJOURNEY-EXECUTION", "$adapter." + key, "mechanism adapters are declarative and cannot carry executable code");
    });
    var canonical = MECHANISM_ADAPTERS[adapter.mechanism];
    if (adapter.progression !== canonical.progression) reject("RLJOURNEY-MECHANISM", "$adapter.progression", "mechanism progression mismatch");
    return deepFreeze({ mechanism: adapter.mechanism, progression: canonical.progression, requiresBranchTerminal: canonical.requiresBranchTerminal });
  }

  /* ═══════════ session lifecycle ═══════════ */

  function validateContext(compiled, context) {
    if (typeof context === "undefined" || context === null) return {};
    if (!isPlainObject(context)) reject("RLJOURNEY-SESSION", "$context", "context must be a plain object");
    assertNoExecutable(context, "$context");
    assertNoForbiddenFields(context, "$context");
    var allowed = compiled.contextSchema.allowedFields;
    var projected = {};
    Object.keys(context).forEach(function (key) {
      if (allowed.indexOf(key) === -1) reject("RLJOURNEY-SESSION", "$context." + key, "context field is not allowed by the definition");
      projected[key] = context[key];
    });
    compiled.contextSchema.requiredFields.forEach(function (field) {
      if (!Object.prototype.hasOwnProperty.call(projected, field)) reject("RLJOURNEY-SESSION", "$context." + field, "required context field missing");
    });
    return projected;
  }

  function sessionFingerprint(session) {
    var source = JSON.parse(JSON.stringify(session));
    source.sessionFingerprint = null;
    source.updatedAt = null;
    return fingerprint(source);
  }

  function finalizeSession(session) {
    session.sessionFingerprint = sessionFingerprint(session);
    return deepFreeze(session);
  }

  function nextRequiredStepId(session) {
    for (var i = 0; i < session.order.length; i += 1) {
      var stepId = session.order[i];
      var record = session.steps[stepId];
      if (record.status === "complete") continue;
      var depsMet = record.dependsOnStepIds.every(function (depId) { return session.steps[depId].status === "complete"; });
      if (depsMet) return stepId;
    }
    return null;
  }

  function createSessionInternal(compiled, options) {
    if (!isPlainObject(compiled) || compiled.contractVersion !== CONTRACT.compiled) reject("RLJOURNEY-SESSION", "$compiled", "compiled definition required");
    var settings = options || {};
    var sessionId = settings.sessionId ? requireString(settings.sessionId, "$options.sessionId") : "session/" + compiled.definitionId + "/" + fingerprint({ id: compiled.definitionId, at: settings.createdAt || "unspecified" }).slice(7, 23);
    var createdAt = settings.createdAt ? requireString(settings.createdAt, "$options.createdAt") : null;
    var context = validateContext(compiled, settings.context);
    var steps = {};
    compiled.steps.forEach(function (step) {
      steps[step.stepId] = {
        status: "pending",
        dependsOnStepIds: step.dependsOnStepIds.slice(),
        requiredEvidenceSlots: step.requiredEvidenceSlots.slice(),
        gated: step.gated,
        input: null,
        evidence: [],
        conclusion: null,
        staleReason: null,
        completedAt: null
      };
    });
    var session = {
      contractVersion: CONTRACT.session,
      sessionId: sessionId,
      definitionId: compiled.definitionId,
      definitionVersion: compiled.definitionVersion,
      definitionFingerprint: compiled.definitionFingerprint,
      toolId: compiled.toolId,
      goalId: compiled.goalId,
      mechanism: compiled.mechanism,
      privacyClass: compiled.privacyClass,
      gated: compiled.gated,
      order: compiled.order.slice(),
      transitiveDependents: JSON.parse(JSON.stringify(compiled.transitiveDependents)),
      context: context,
      steps: steps,
      history: [],
      status: "in-progress",
      createdAt: createdAt,
      updatedAt: createdAt,
      sessionFingerprint: null
    };
    session.nextRequiredStepId = nextRequiredStepId(session);
    assertNoForbiddenFields(session, "$session");
    return finalizeSession(session);
  }

  function serializeSessionInternal(session) {
    if (!isPlainObject(session) || session.contractVersion !== CONTRACT.session) reject("RLJOURNEY-SESSION", "$session", "session required");
    assertNoForbiddenFields(session, "$session");
    var record = JSON.parse(JSON.stringify(session));
    return deepFreeze(record);
  }

  function restoreSessionInternal(compiled, record) {
    if (!isPlainObject(compiled) || compiled.contractVersion !== CONTRACT.compiled) reject("RLJOURNEY-SESSION", "$compiled", "compiled definition required");
    if (!isPlainObject(record) || record.contractVersion !== CONTRACT.session) reject("RLJOURNEY-SESSION", "$record", "session record required");
    if (record.definitionId !== compiled.definitionId) reject("RLJOURNEY-SESSION", "$record.definitionId", "session belongs to a different definition");
    if (record.definitionFingerprint !== compiled.definitionFingerprint) reject("RLJOURNEY-STALE", "$record.definitionFingerprint", "definition changed since the session was saved");
    if (!equalStringArray(record.order, compiled.order)) reject("RLJOURNEY-STALE", "$record.order", "session step order no longer matches the definition");
    assertNoExecutable(record, "$record");
    assertNoForbiddenFields(record, "$record");
    var restored = JSON.parse(JSON.stringify(record));
    Object.keys(restored.steps).forEach(function (stepId) {
      if (compiled.order.indexOf(stepId) === -1) reject("RLJOURNEY-STALE", "$record.steps." + stepId, "session references an unknown step");
      if (STEP_STATES.indexOf(restored.steps[stepId].status) === -1) reject("RLJOURNEY-SESSION", "$record.steps." + stepId + ".status", "unknown step status");
    });
    restored.nextRequiredStepId = nextRequiredStepId(restored);
    return finalizeSession(restored);
  }

  /* Evidence-based completion: a visit/click without recorded evidence for a required
     slot is NEVER a completion. */
  function completeStepInternal(session, stepId, submission) {
    if (!isPlainObject(session) || session.contractVersion !== CONTRACT.session) reject("RLJOURNEY-SESSION", "$session", "session required");
    var next = JSON.parse(JSON.stringify(session));
    var record = next.steps[stepId];
    if (!record) reject("RLJOURNEY-STEP", "$session.steps." + stepId, "unknown step");
    var input = submission && submission.input;
    var evidence = (submission && submission.evidence) || [];
    if (typeof input !== "undefined" && input !== null) assertNoExecutable(input, "$submission.input");
    assertNoExecutable(evidence, "$submission.evidence");
    if (typeof input !== "undefined" && input !== null) assertNoForbiddenFields(input, "$submission.input");
    assertNoForbiddenFields(evidence, "$submission.evidence");
    record.dependsOnStepIds.forEach(function (depId) {
      if (next.steps[depId].status !== "complete") reject("RLJOURNEY-STEP", "$session.steps." + stepId, "dependency step is not complete");
    });
    if (!Array.isArray(evidence) || evidence.length < record.requiredEvidenceSlots.length) {
      reject("RLJOURNEY-STEP", "$submission.evidence", "step requires recorded evidence; a visit or click is not a completion");
    }
    var providedSlots = evidence.map(function (item) { return item && item.slot; });
    record.requiredEvidenceSlots.forEach(function (slot) {
      if (providedSlots.indexOf(slot) === -1) reject("RLJOURNEY-STEP", "$submission.evidence", "required evidence slot missing: " + slot);
    });
    record.status = "complete";
    record.input = typeof input === "undefined" ? null : input;
    record.evidence = JSON.parse(JSON.stringify(evidence));
    record.conclusion = submission && typeof submission.conclusion !== "undefined" ? submission.conclusion : null;
    record.staleReason = null;
    record.completedAt = submission && submission.completedAt ? requireString(submission.completedAt, "$submission.completedAt") : null;
    next.history.push({ event: "step-complete", stepId: stepId, at: record.completedAt });
    next.updatedAt = record.completedAt;
    next.nextRequiredStepId = nextRequiredStepId(next);
    next.status = next.nextRequiredStepId === null ? "steps-complete" : "in-progress";
    assertNoForbiddenFields(next, "$session");
    return finalizeSession(next);
  }

  function previewBacktrackInternal(session, stepId) {
    if (!isPlainObject(session) || session.contractVersion !== CONTRACT.session) reject("RLJOURNEY-SESSION", "$session", "session required");
    if (!session.steps[stepId]) reject("RLJOURNEY-STEP", "$session.steps." + stepId, "unknown step");
    var dependents = (session.transitiveDependents[stepId] || []).slice();
    var staleDependents = dependents.filter(function (depId) { return session.steps[depId].status === "complete"; });
    var unrelatedComplete = session.order.filter(function (candidate) {
      return candidate !== stepId && dependents.indexOf(candidate) === -1 && session.steps[candidate].status === "complete";
    });
    return deepFreeze({ stepId: stepId, staleDependents: staleDependents, unrelatedComplete: unrelatedComplete });
  }

  /* SCN-012-010: backtracking an earlier assumption reopens that step and marks every
     TRANSITIVE dependent stale WITH a reason; unrelated completed steps stay intact. */
  function backtrackStepInternal(session, stepId, options) {
    if (!isPlainObject(session) || session.contractVersion !== CONTRACT.session) reject("RLJOURNEY-SESSION", "$session", "session required");
    var settings = options || {};
    var reason = requireString(settings.reason, "$options.reason");
    var next = JSON.parse(JSON.stringify(session));
    if (!next.steps[stepId]) reject("RLJOURNEY-STEP", "$session.steps." + stepId, "unknown step");
    if (typeof settings.newInput !== "undefined" && settings.newInput !== null) {
      assertNoExecutable(settings.newInput, "$options.newInput");
      assertNoForbiddenFields(settings.newInput, "$options.newInput");
    }
    var reopened = next.steps[stepId];
    reopened.status = "active";
    reopened.input = typeof settings.newInput === "undefined" ? reopened.input : settings.newInput;
    reopened.evidence = [];
    reopened.conclusion = null;
    reopened.staleReason = null;
    reopened.completedAt = null;
    var dependents = (next.transitiveDependents[stepId] || []);
    dependents.forEach(function (depId) {
      var depRecord = next.steps[depId];
      if (depRecord.status === "complete" || depRecord.status === "active") {
        depRecord.status = "stale";
        depRecord.staleReason = "dependency backtracked: " + stepId + " (" + reason + ")";
        depRecord.conclusion = null;
      }
    });
    next.history.push({ event: "backtrack", stepId: stepId, reason: reason, staled: dependents.slice() });
    next.updatedAt = settings.at ? requireString(settings.at, "$options.at") : null;
    next.nextRequiredStepId = nextRequiredStepId(next);
    next.status = "in-progress";
    assertNoForbiddenFields(next, "$session");
    return finalizeSession(next);
  }

  /* ═══════════ completion packet (typed complete/partial/refused; NON-EXECUTING) ═══════════ */

  function buildCompletionPacketInternal(session, options) {
    if (!isPlainObject(session) || session.contractVersion !== CONTRACT.session) reject("RLJOURNEY-PACKET", "$session", "session required");
    var settings = options || {};
    var outcome = settings.outcome;
    if (PACKET_OUTCOMES.indexOf(outcome) === -1) reject("RLJOURNEY-PACKET", "$options.outcome", "outcome must be complete/partial/refused");
    var staleSteps = session.order.filter(function (stepId) { return session.steps[stepId].status === "stale"; });
    var pendingOrActive = session.order.filter(function (stepId) {
      return session.steps[stepId].status === "pending" || session.steps[stepId].status === "active";
    });
    if (outcome === "complete") {
      if (staleSteps.length > 0) reject("RLJOURNEY-STALE", "$session", "a complete packet cannot include stale dependent conclusions");
      if (pendingOrActive.length > 0) reject("RLJOURNEY-PACKET", "$session", "a complete packet requires every required step complete");
      if (!settings.signoff) reject("RLJOURNEY-PACKET", "$options.signoff", "a complete packet requires human signoff");
    }
    /* only steps whose status is exactly "complete" contribute a conclusion — stale
       dependent conclusions are structurally excluded. */
    var outcomes = session.order
      .filter(function (stepId) { return session.steps[stepId].status === "complete"; })
      .map(function (stepId) {
        var record = session.steps[stepId];
        return {
          stepId: stepId,
          conclusion: record.conclusion,
          evidenceRefs: record.evidence.map(function (item) { return item && item.slot; })
        };
      });
    if (settings.signoff) {
      if (!isPlainObject(settings.signoff)) reject("RLJOURNEY-PACKET", "$options.signoff", "signoff must be a plain object");
      assertNoExecutable(settings.signoff, "$options.signoff");
      assertNoForbiddenFields(settings.signoff, "$options.signoff");
    }
    var packet = {
      contractVersion: CONTRACT.packet,
      definitionId: session.definitionId,
      definitionFingerprint: session.definitionFingerprint,
      sessionId: session.sessionId,
      toolId: session.toolId,
      goalId: session.goalId,
      outcome: outcome,
      intent: settings.intent ? requireString(settings.intent, "$options.intent") : session.goalId,
      context: JSON.parse(JSON.stringify(session.context)),
      outcomes: outcomes,
      excludedStaleSteps: staleSteps.slice(),
      excludedIncompleteSteps: pendingOrActive.slice(),
      assumptions: Array.isArray(settings.assumptions) ? settings.assumptions.slice() : [],
      conflicts: Array.isArray(settings.conflicts) ? settings.conflicts.slice() : [],
      unresolved: Array.isArray(settings.unresolved) ? settings.unresolved.slice() : [],
      quality: settings.quality ? settings.quality : { staleExcluded: staleSteps.length, incompleteExcluded: pendingOrActive.length },
      trace: { sessionFingerprint: session.sessionFingerprint, historyLength: session.history.length },
      disclaimer: "Research process record only. No trade, order, holding change, rebalance, hedge, or external execution is triggered.",
      signoff: settings.signoff ? JSON.parse(JSON.stringify(settings.signoff)) : null,
      reviewRecorded: false,
      noExecution: true,
      executed: false,
      packetFingerprint: null
    };
    assertNoExecutable(packet, "$packet");
    assertNoForbiddenFields(packet, "$packet");
    var fingerprintSource = JSON.parse(JSON.stringify(packet));
    fingerprintSource.packetFingerprint = null;
    packet.packetFingerprint = fingerprint(fingerprintSource);
    return deepFreeze(packet);
  }

  /* SCN-012-011: recording human signoff accepts the RESEARCH PROCESS only. It mutates
     local review state only and triggers NO execution. There is no execution code path. */
  function recordSignoffInternal(packet, signoff) {
    if (!isPlainObject(packet) || packet.contractVersion !== CONTRACT.packet) reject("RLJOURNEY-PACKET", "$packet", "packet required");
    if (!isPlainObject(signoff)) reject("RLJOURNEY-PACKET", "$signoff", "signoff must be a plain object");
    assertNoExecutable(signoff, "$signoff");
    assertNoForbiddenFields(signoff, "$signoff");
    var next = JSON.parse(JSON.stringify(packet));
    next.signoff = JSON.parse(JSON.stringify(signoff));
    next.reviewRecorded = true;
    next.noExecution = true;
    next.executed = false;
    var fingerprintSource = JSON.parse(JSON.stringify(next));
    fingerprintSource.packetFingerprint = null;
    next.packetFingerprint = fingerprint(fingerprintSource);
    return deepFreeze(next);
  }

  /* ═══════════ verified local session store (provider-injected; NO storage global) ═══════════
     The runtime NEVER references a browser storage global. The caller injects a provider
     { getItem(key) -> string|null, setItem(key, value), removeItem(key) }: the browser shell
     injects the platform per-origin store, Node tests inject a Map-backed fake (or a
     capability-disabled throwing provider). Verified DOUBLE-BUFFER: a write goes to the INACTIVE
     slot, is re-read and hash-compared, and only THEN is the pointer flipped — a corrupt slot can
     never destroy the last-valid session, and clearStore is the ONLY path that deletes user data.
     Sessions already reject the runtime privacy roots; the store ADDITIONALLY rejects the config
     journeyStoragePolicy.forbiddenFieldNames, so only non-sensitive data is ever persisted. */

  function requireStoragePolicy(policy) {
    if (!isPlainObject(policy)) reject("RLJOURNEY-STORE", "$policy", "journey storage policy object required");
    requireString(policy.pointerKey, "$policy.pointerKey");
    if (!Array.isArray(policy.slotKeys) || policy.slotKeys.length !== 2) reject("RLJOURNEY-STORE", "$policy.slotKeys", "verified store requires exactly two slot keys");
    policy.slotKeys.forEach(function (key, index) { requireString(key, "$policy.slotKeys[" + index + "]"); });
    if (typeof policy.maxSessionBytes !== "number" || !Number.isFinite(policy.maxSessionBytes) || policy.maxSessionBytes <= 0) {
      reject("RLJOURNEY-STORE", "$policy.maxSessionBytes", "positive maxSessionBytes required");
    }
    requireArray(policy.forbiddenFieldNames, "$policy.forbiddenFieldNames", 1);
    return policy;
  }

  function requireProvider(provider) {
    if (!provider || typeof provider !== "object") reject("RLJOURNEY-STORE", "$provider", "storage provider object required");
    if (typeof provider.getItem !== "function" || typeof provider.setItem !== "function" || typeof provider.removeItem !== "function") {
      reject("RLJOURNEY-STORE", "$provider", "provider must expose getItem, setItem, removeItem");
    }
    return provider;
  }

  /* Reject any field whose lower-cased name contains a policy-forbidden token — an additional
     boundary on top of the runtime FORBIDDEN_FIELD_ROOTS enforced on every session and packet. */
  function assertPolicyCleanFields(value, policy, path) {
    var forbidden = policy.forbiddenFieldNames.map(function (name) { return String(name).toLowerCase(); });
    var seen = [];
    (function walk(current, currentPath) {
      if (!current || typeof current !== "object") return;
      if (seen.indexOf(current) !== -1) return;
      seen.push(current);
      if (Array.isArray(current)) { current.forEach(function (item, index) { walk(item, currentPath + "[" + index + "]"); }); return; }
      Object.keys(current).forEach(function (key) {
        var lowered = String(key).toLowerCase();
        forbidden.forEach(function (token) {
          if (lowered.indexOf(token) !== -1) reject("RLJOURNEY-PRIVACY", currentPath + "." + key, "policy-forbidden sensitive field name");
        });
        walk(current[key], currentPath + "." + key);
      });
    })(value, path);
  }

  function utf8ByteLength(text) {
    var bytes = 0;
    for (var i = 0; i < text.length; i += 1) {
      var code = text.charCodeAt(i);
      if (code < 0x80) bytes += 1;
      else if (code < 0x800) bytes += 2;
      else if (code < 0xd800 || code >= 0xe000) bytes += 3;
      else { i += 1; bytes += 4; }
    }
    return bytes;
  }

  function slotKeyFor(policy, slot) {
    return slot === "A" ? policy.slotKeys[0] : policy.slotKeys[1];
  }

  function readPointer(provider, policy) {
    var raw;
    try { raw = provider.getItem(policy.pointerKey); } catch (error) { return null; }
    if (typeof raw !== "string" || raw.length === 0) return null;
    var parsed;
    try { parsed = JSON.parse(raw); } catch (error) { return null; }
    if (!isPlainObject(parsed) || (parsed.active !== "A" && parsed.active !== "B")) return null;
    return parsed;
  }

  /* Capability detection is a REAL probe write + read-back (never request interception). A provider
     that throws on write, or silently drops the probe, is reported session-only. */
  function storageCapabilityInternal(provider, policy) {
    requireProvider(provider);
    requireStoragePolicy(policy);
    var probeKey = policy.pointerKey + ".probe";
    var probeValue = "rlj-probe-" + fingerprint({ probe: policy.pointerKey }).slice(7, 19);
    try {
      provider.setItem(probeKey, probeValue);
      var readBack = provider.getItem(probeKey);
      provider.removeItem(probeKey);
      if (readBack !== probeValue) return deepFreeze({ durable: false, mode: "session-only", reason: "storage-readback-mismatch" });
      return deepFreeze({ durable: true, mode: "durable", reason: null });
    } catch (error) {
      return deepFreeze({ durable: false, mode: "session-only", reason: "storage-unavailable" });
    }
  }

  function saveSessionInternal(provider, policy, record) {
    requireProvider(provider);
    requireStoragePolicy(policy);
    if (!isPlainObject(record) || record.contractVersion !== CONTRACT.session) reject("RLJOURNEY-STORE", "$record", "session record required");
    assertNoExecutable(record, "$record");
    assertNoForbiddenFields(record, "$record");
    assertPolicyCleanFields(record, policy, "$record");
    var payload = canonicalize(record);
    var bytes = utf8ByteLength(payload);
    if (bytes > policy.maxSessionBytes) reject("RLJOURNEY-STORE", "$record", "session exceeds maxSessionBytes (" + bytes + " > " + policy.maxSessionBytes + ")");
    var expectedFingerprint = "sha256:" + sha256(payload);
    var pointer = readPointer(provider, policy);
    var targetSlot = pointer && pointer.active === "A" ? "B" : "A"; /* always write the INACTIVE slot */
    var targetKey = slotKeyFor(policy, targetSlot);
    try {
      provider.setItem(targetKey, payload);
    } catch (error) {
      reject("RLJOURNEY-STORE", "$provider", "storage write unavailable; last-valid session preserved");
    }
    var reread;
    try { reread = provider.getItem(targetKey); } catch (error) { reread = null; }
    if (reread !== payload || ("sha256:" + sha256(String(reread))) !== expectedFingerprint) {
      reject("RLJOURNEY-STORE", "$provider", "verified re-read failed; last-valid session preserved");
    }
    /* Flip the pointer ONLY after the verified re-read — the previous active slot stays intact
       until this line, so any failure above leaves the last-valid session recoverable. */
    var newPointer = { active: targetSlot, fingerprint: expectedFingerprint, bytes: bytes, updatedAt: (record.updatedAt || null) };
    try {
      provider.setItem(policy.pointerKey, JSON.stringify(newPointer));
    } catch (error) {
      reject("RLJOURNEY-STORE", "$provider", "pointer flip failed; last-valid session preserved");
    }
    return deepFreeze({ slot: targetSlot, key: targetKey, fingerprint: expectedFingerprint, bytes: bytes });
  }

  function loadSlot(provider, policy, slot, expectedFingerprint) {
    var raw;
    try { raw = provider.getItem(slotKeyFor(policy, slot)); } catch (error) { return null; }
    if (typeof raw !== "string" || raw.length === 0) return null;
    if (expectedFingerprint && ("sha256:" + sha256(raw)) !== expectedFingerprint) return null;
    var parsed;
    try { parsed = JSON.parse(raw); } catch (error) { return null; }
    if (!isPlainObject(parsed) || parsed.contractVersion !== CONTRACT.session) return null;
    return parsed;
  }

  function loadSessionInternal(provider, policy) {
    requireProvider(provider);
    requireStoragePolicy(policy);
    var pointer = readPointer(provider, policy);
    if (!pointer) return deepFreeze({ record: null, slot: null, corrupt: false });
    /* Try the pointer's active slot (fingerprint-verified) first, then the OTHER slot as the
       last-valid recovery — a corrupt active write never loses the previous good session. */
    var active = loadSlot(provider, policy, pointer.active, pointer.fingerprint);
    if (active) return deepFreeze({ record: active, slot: pointer.active, corrupt: false });
    var other = pointer.active === "A" ? "B" : "A";
    var fallback = loadSlot(provider, policy, other, null);
    if (fallback) return deepFreeze({ record: fallback, slot: other, corrupt: true });
    return deepFreeze({ record: null, slot: null, corrupt: true });
  }

  function clearStoreInternal(provider, policy) {
    requireProvider(provider);
    requireStoragePolicy(policy);
    /* The ONLY user-data deletion path. */
    [policy.pointerKey, slotKeyFor(policy, "A"), slotKeyFor(policy, "B")].forEach(function (key) {
      try { provider.removeItem(key); } catch (error) { /* best-effort removal */ }
    });
    return deepFreeze({ cleared: true });
  }

  function exportSessionInternal(provider, policy) {
    var loaded = loadSessionInternal(provider, policy);
    if (!loaded.record) return deepFreeze({ record: null, json: null, slot: null });
    assertNoForbiddenFields(loaded.record, "$export");
    assertPolicyCleanFields(loaded.record, policy, "$export");
    return deepFreeze({ record: loaded.record, json: canonicalize(loaded.record), slot: loaded.slot, corrupt: loaded.corrupt });
  }

  /* Safe export of a LIVE in-memory session with NO provider — available even in session-only
     mode where durable storage is unavailable, so the user can always export their work. */
  function exportRecordInternal(policy, record) {
    requireStoragePolicy(policy);
    if (!isPlainObject(record) || record.contractVersion !== CONTRACT.session) reject("RLJOURNEY-STORE", "$record", "session record required");
    assertNoExecutable(record, "$record");
    assertNoForbiddenFields(record, "$record");
    assertPolicyCleanFields(record, policy, "$record");
    var json = canonicalize(record);
    return deepFreeze({ json: json, bytes: utf8ByteLength(json) });
  }

  function runtimeDiagnosticInternal() {
    return deepFreeze({
      contractVersion: CONTRACT.runtime,
      mechanisms: MECHANISMS.slice(),
      completionPredicates: COMPLETION_PREDICATES.slice(),
      packetOutcomes: PACKET_OUTCOMES.slice(),
      privacyClasses: PRIVACY_CLASSES.slice(),
      stepStates: STEP_STATES.slice(),
      refusalCodes: REFUSAL_CODES.slice(),
      forbiddenFieldRoots: FORBIDDEN_FIELD_ROOTS.slice(),
      noExecution: true
    });
  }

  /* ── generic no-execution evidence submission composer (Scope 12 · latent-risk) ──
     Compose a Journey completeStep submission from EXTERNAL evidence references
     (e.g. a qualified Red Alert's owner market-evidence and public claim refs) so
     a research goal can CONSUME that evidence through this runtime. It is pure,
     generic (not coupled to any producer), and NON-EXECUTING: it asserts no
     function value or forbidden private field can enter the submission, and it
     emits ONLY the {input, evidence, conclusion} research data the runtime already
     accepts. It grants no order, publication, or execution capability whatsoever. */
  function composeEvidenceSubmissionInternal(spec, options) {
    if (!isPlainObject(spec)) reject("RLJOURNEY-INPUT", "$spec", "evidence submission spec object required");
    assertNoExecutable(spec, "$spec");
    assertNoForbiddenFields(spec, "$spec");
    var opts = isPlainObject(options) ? options : {};
    assertNoExecutable(opts, "$options");
    var ownerRefs = Array.isArray(spec.ownerRefs) ? spec.ownerRefs : [];
    requireArray(ownerRefs, "$spec.ownerRefs", 1);
    var publicRefs = Array.isArray(spec.publicRefs) ? spec.publicRefs : [];
    var ownerSlot = (typeof opts.ownerSlot === "string" && opts.ownerSlot.length > 0) ? opts.ownerSlot : "owner-evidence";
    var publicSlot = (typeof opts.publicSlot === "string" && opts.publicSlot.length > 0) ? opts.publicSlot : "public-source";
    var phaseOutcome = (typeof spec.phaseOutcome === "string" && spec.phaseOutcome.length > 0) ? spec.phaseOutcome
      : ((typeof opts.phaseOutcome === "string" && opts.phaseOutcome.length > 0) ? opts.phaseOutcome : "reviewed");
    var evidence = ownerRefs.map(function (ref, index) {
      requireString(ref, "$spec.ownerRefs[" + index + "]");
      return { slot: ownerSlot, ref: ref, provenance: "owner-evidence" };
    });
    publicRefs.forEach(function (ref) {
      if (typeof ref === "string" && ref.length > 0) evidence.push({ slot: publicSlot, ref: ref, provenance: "public-source" });
    });
    var submission = { input: { phaseOutcome: phaseOutcome }, evidence: evidence };
    if (typeof spec.conclusion === "string" && spec.conclusion.length > 0) submission.conclusion = spec.conclusion;
    else if (typeof opts.conclusion === "string" && opts.conclusion.length > 0) submission.conclusion = opts.conclusion;
    if (typeof opts.completedAt === "string" && opts.completedAt.length > 0) submission.completedAt = opts.completedAt;
    assertNoExecutable(submission, "$submission");
    return submission;
  }

  return {
    CONTRACT: CONTRACT,
    MECHANISMS: MECHANISMS,
    COMPLETION_PREDICATES: COMPLETION_PREDICATES,
    PACKET_OUTCOMES: PACKET_OUTCOMES,
    PRIVACY_CLASSES: PRIVACY_CLASSES,
    STEP_STATES: STEP_STATES,
    REFUSAL_CODES: REFUSAL_CODES,
    FORBIDDEN_FIELD_ROOTS: FORBIDDEN_FIELD_ROOTS,
    MECHANISM_ADAPTERS: MECHANISM_ADAPTERS,
    canonicalize: canonicalize,
    fingerprint: fingerprint,
    projectError: projectError,
    compileDefinition: function (definition, steps) { return capture(function () { return compileDefinitionInternal(definition, steps); }); },
    compileRegistry: function (registry) { return capture(function () { return compileRegistryInternal(registry); }); },
    validateRegistryCompleteness: function (registry, inventory) { return capture(function () { return validateRegistryCompletenessInternal(registry, inventory); }); },
    validateMechanismAdapter: function (adapter) { return capture(function () { return validateMechanismAdapterInternal(adapter); }); },
    createSession: function (compiled, options) { return capture(function () { return createSessionInternal(compiled, options); }); },
    serializeSession: function (session) { return capture(function () { return serializeSessionInternal(session); }); },
    restoreSession: function (compiled, record) { return capture(function () { return restoreSessionInternal(compiled, record); }); },
    completeStep: function (session, stepId, submission) { return capture(function () { return completeStepInternal(session, stepId, submission); }); },
    previewBacktrack: function (session, stepId) { return capture(function () { return previewBacktrackInternal(session, stepId); }); },
    backtrackStep: function (session, stepId, options) { return capture(function () { return backtrackStepInternal(session, stepId, options); }); },
    buildCompletionPacket: function (session, options) { return capture(function () { return buildCompletionPacketInternal(session, options); }); },
    recordSignoff: function (packet, signoff) { return capture(function () { return recordSignoffInternal(packet, signoff); }); },
    composeEvidenceSubmission: function (spec, options) { return capture(function () { return composeEvidenceSubmissionInternal(spec, options); }); },
    store: {
      capability: function (provider, policy) { return capture(function () { return storageCapabilityInternal(provider, policy); }); },
      saveSession: function (provider, policy, record) { return capture(function () { return saveSessionInternal(provider, policy, record); }); },
      loadSession: function (provider, policy) { return capture(function () { return loadSessionInternal(provider, policy); }); },
      clearStore: function (provider, policy) { return capture(function () { return clearStoreInternal(provider, policy); }); },
      exportSession: function (provider, policy) { return capture(function () { return exportSessionInternal(provider, policy); }); },
      exportRecord: function (policy, record) { return capture(function () { return exportRecordInternal(policy, record); }); }
    },
    assertNoForbiddenFields: function (value) { return capture(function () { assertNoForbiddenFields(value, "$value"); return true; }); },
    runtimeDiagnostic: function () { return capture(function () { return runtimeDiagnosticInternal(); }); }
  };
});
