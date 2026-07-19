/* ═══════════ RLDATA — shared cross-tool market-data cache (rlData) ═══════════
   One self-contained IIFE loaded by every Research Lab page that needs market data.
   Implements the contract in notes/shared-data-layer.md: a single schema-versioned
   localStorage object `rlData` so data fetched by one tool is REUSED by every other
   tool (APPEND, never refetch). Provider-tagged, interval-keyed, TTL-fresh, quota-aware.
   Also exposes ensure* fetch helpers (Yahoo v8 → public proxies → Twelve Data) that
   populate the cache on demand. Safe on file://, GitHub Pages, and Node (no-DOM guard).
   Educational only — not investment advice. */
(function () {
  "use strict";
  var root = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : {});
  var HAS_LS = (function () { try { return (typeof localStorage !== "undefined") && !!localStorage; } catch (e) { return false; } })();
  var HAS_FETCH = (typeof fetch !== "undefined");

  /* ── pure helpers (extractable by scripts/selftest.mjs — keep as `function` decls) ── */

  /* merge two OHLCV arrays, dedupe by bar time `t`, ascending. Newer rows win on collision. */
  function mergeBars(oldRows, newRows) {
    var map = {}, i, r, out = [], keys;
    oldRows = Array.isArray(oldRows) ? oldRows : [];
    newRows = Array.isArray(newRows) ? newRows : [];
    for (i = 0; i < oldRows.length; i++) { r = oldRows[i]; if (r && isFinite(r.t)) map[r.t] = r; }
    for (i = 0; i < newRows.length; i++) { r = newRows[i]; if (r && isFinite(r.t)) map[r.t] = r; }
    keys = Object.keys(map).map(Number).sort(function (a, b) { return a - b; });
    for (i = 0; i < keys.length; i++) out.push(map[keys[i]]);
    return out;
  }

  /* freshness test: is a stored `at` epoch-ms within maxAgeMs of now? */
  function isFresh(at, maxAgeMs) { return !!(at && isFinite(at) && isFinite(maxAgeMs) && (Date.now() - at) <= maxAgeMs); }

  /* simple moving average of the last n closes (rows carry `.c`); null if insufficient. */
  function sma(rows, n) {
    if (!Array.isArray(rows) || !(n > 0) || rows.length < n) return null;
    var s = 0, i, r;
    for (i = rows.length - n; i < rows.length; i++) { r = rows[i]; if (!r || !isFinite(r.c)) return null; s += r.c; }
    return s / n;
  }

  /* trailing momentum in percent over `lookback` bars: last close vs the close `lookback` bars ago. */
  function momentumPct(rows, lookback) {
    if (!Array.isArray(rows) || !(lookback > 0) || rows.length < lookback + 1) return null;
    var a = rows[rows.length - 1], b = rows[rows.length - 1 - lookback];
    if (!a || !b || !isFinite(a.c) || !isFinite(b.c) || b.c === 0) return null;
    return (a.c / b.c - 1) * 100;
  }

  /* ── cache core ── */
  var SCHEMA = 1, KEY = "rlData", CAP_BYTES = 4 * 1024 * 1024;
  var PROVIDER_POLICIES = Object.freeze({
    twelvedata: Object.freeze({ id: "twelvedata", label: "Twelve Data", note: "Daily and intraday bars", enrollmentUrl: "https://twelvedata.com/pricing", browserOriginAuthorization: "unverified", authorizationEvidence: Object.freeze([]), authTransport: "unavailable", authHeaderName: null, requestOrigins: Object.freeze([]), operations: Object.freeze({}), eligibleDocuments: Object.freeze([]), cspProfile: "not-eligible" }),
    finnhub: Object.freeze({ id: "finnhub", label: "Finnhub", note: "Fast live quotes", enrollmentUrl: "https://finnhub.io/register", browserOriginAuthorization: "unverified", authorizationEvidence: Object.freeze([]), authTransport: "unavailable", authHeaderName: null, requestOrigins: Object.freeze([]), operations: Object.freeze({}), eligibleDocuments: Object.freeze([]), cspProfile: "not-eligible" }),
    alphavantage: Object.freeze({ id: "alphavantage", label: "Alpha Vantage", note: "ETF holdings and sector weights", enrollmentUrl: "https://www.alphavantage.co/support/#api-key", browserOriginAuthorization: "unverified", authorizationEvidence: Object.freeze([]), authTransport: "unavailable", authHeaderName: null, requestOrigins: Object.freeze([]), operations: Object.freeze({}), eligibleDocuments: Object.freeze([]), cspProfile: "not-eligible" }),
    fred: Object.freeze({ id: "fred", label: "FRED", note: "Treasury-yield fallback", enrollmentUrl: "https://fredaccount.stlouisfed.org/login/secure/", browserOriginAuthorization: "unverified", authorizationEvidence: Object.freeze([]), authTransport: "unavailable", authHeaderName: null, requestOrigins: Object.freeze([]), operations: Object.freeze({}), eligibleDocuments: Object.freeze([]), cspProfile: "not-eligible" })
  });
  var PROVIDER_IDS = Object.freeze(Object.keys(PROVIDER_POLICIES));
  var _credentialRuntime = Object.create(null);
  var _mem = null;   /* in-memory source of truth — keeps the session working even when localStorage is full (QuotaExceededError) */
  var _activity = { resources: {}, updatedAt: null };

  function load() {
    if (_mem) return _mem;
    var d = null;
    if (HAS_LS) { try { d = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { d = null; } }
    if (!d || d.v !== SCHEMA) d = { v: SCHEMA, bars: {}, quotes: {}, options: {}, si: {}, macro: null, events: {}, toolReads: {} };
    d.bars = d.bars || {}; d.quotes = d.quotes || {}; d.options = d.options || {}; d.si = d.si || {}; d.events = d.events || {}; d.toolReads = d.toolReads || {};
    _mem = d;
    return _mem;
  }
  function prune(d) {
    /* on quota, drop the oldest-`at` symbol bars bucket until under cap. */
    try {
      var syms = Object.keys(d.bars || {});
      syms.sort(function (a, b) { return oldestAt(d.bars[a]) - oldestAt(d.bars[b]); });
      while (syms.length && JSON.stringify(d).length > CAP_BYTES) { delete d.bars[syms.shift()]; }
    } catch (e) { }
  }
  function oldestAt(intervalMap) { var m = Infinity, k; for (k in intervalMap) { if (intervalMap[k] && intervalMap[k].at < m) m = intervalMap[k].at; } return isFinite(m) ? m : 0; }
  function save(d) {
    _mem = d;   /* always retain the complete session dataset, even when persistence must be compacted */
    if (!HAS_LS) return;
    try { localStorage.setItem(KEY, JSON.stringify(d)); }
    catch (e) {
      /* Prune a persistence-only copy. Mutating `d` here used to evict early symbols from `_mem`
         while a large heatmap was still hydrating, leaving half the map with "no data" tiles. */
      try {
        var persisted = JSON.parse(JSON.stringify(d));
        prune(persisted);
        localStorage.setItem(KEY, JSON.stringify(persisted));
      } catch (e2) { /* quota exceeded — the complete in-memory copy still serves this session */ }
    }
  }

  function providerPolicy(provider) {
    if (typeof provider !== "string" || !Object.prototype.hasOwnProperty.call(PROVIDER_POLICIES, provider)) return null;
    return PROVIDER_POLICIES[provider];
  }
  function currentDocumentId() {
    var pathname = root.location && String(root.location.pathname || "") || "/index.html";
    return pathname.split("/").pop() || "index.html";
  }
  function operationPolicy(policy, operationId) {
    if (!policy || typeof operationId !== "string" || !policy.operations || !Object.prototype.hasOwnProperty.call(policy.operations, operationId)) return null;
    return policy.operations[operationId];
  }
  function frozenResult(value) { return Object.freeze(value); }
  function unknownProvider(providerId) {
    return frozenResult({ ok: false, providerId: typeof providerId === "string" ? providerId : "", state: "disabled", reasonCode: "UNKNOWN_PROVIDER" });
  }
  function providerEligible(policy) {
    return !!(policy && policy.browserOriginAuthorization === "verified" && Array.isArray(policy.authorizationEvidence) && policy.authorizationEvidence.length > 0 && policy.authTransport === "header" && typeof policy.authHeaderName === "string" && policy.authHeaderName && Array.isArray(policy.requestOrigins) && policy.requestOrigins.length > 0 && policy.operations && Object.keys(policy.operations).length > 0 && Array.isArray(policy.eligibleDocuments) && policy.eligibleDocuments.indexOf(currentDocumentId()) >= 0 && policy.cspProfile === "credential-capable-v1");
  }
  function providerPolicies() {
    return Object.freeze(PROVIDER_IDS.map(function (providerId) {
      var policy = PROVIDER_POLICIES[providerId];
      return Object.freeze({ providerId: providerId, label: policy.label, note: policy.note, enrollmentUrl: policy.enrollmentUrl, state: providerEligible(policy) ? "unconfigured" : "disabled", reasonCode: providerEligible(policy) ? null : "PROVIDER_DISABLED" });
    }));
  }
  function credentialStatus(providerId) {
    var policy = providerPolicy(providerId);
    if (!policy) return unknownProvider(providerId);
    var eligible = providerEligible(policy), configured = Object.prototype.hasOwnProperty.call(_credentialRuntime, providerId);
    return frozenResult({ ok: true, providerId: providerId, state: eligible ? (configured ? "configured" : "unconfigured") : "disabled", lifetime: "current-document-memory", reasonCode: eligible ? null : "PROVIDER_DISABLED" });
  }
  function authorizeCredential(providerId, credential) {
    var policy = providerPolicy(providerId);
    if (!policy) return unknownProvider(providerId);
    if (!providerEligible(policy)) return frozenResult({ ok: false, providerId: providerId, state: "disabled", reasonCode: "PROVIDER_DISABLED" });
    if (typeof credential !== "string" || !credential.trim()) return frozenResult({ ok: false, providerId: providerId, state: credentialStatus(providerId).state, reasonCode: "INVALID_CREDENTIAL" });
    _credentialRuntime[providerId] = credential.trim();
    return frozenResult({ ok: true, providerId: providerId, state: "configured", reasonCode: null });
  }
  function clearCredential(providerId) {
    if (!providerPolicy(providerId)) return unknownProvider(providerId);
    delete _credentialRuntime[providerId];
    return frozenResult({ ok: true, providerId: providerId, state: "unconfigured", reasonCode: null });
  }
  function clearCurrentDocumentCredentials() {
    Object.keys(_credentialRuntime).forEach(function (providerId) { delete _credentialRuntime[providerId]; });
  }
  function clearAllCredentials() {
    clearCurrentDocumentCredentials();
    return frozenResult({ ok: true, runtimeState: "unconfigured" });
  }
  function useCredential(providerId, operationId) {
    var policy = providerPolicy(providerId);
    if (!policy) return Promise.resolve(unknownProvider(providerId));
    if (!operationPolicy(policy, operationId)) return Promise.resolve(frozenResult({ ok: false, providerId: providerId, operationId: typeof operationId === "string" ? operationId : "", reasonCode: "UNKNOWN_OPERATION" }));
    if (!providerEligible(policy)) return Promise.resolve(frozenResult({ ok: false, providerId: providerId, operationId: operationId, reasonCode: "PROVIDER_DISABLED" }));
    if (!Object.prototype.hasOwnProperty.call(_credentialRuntime, providerId)) return Promise.resolve(frozenResult({ ok: false, providerId: providerId, operationId: operationId, reasonCode: "CREDENTIAL_MISSING" }));
    return Promise.resolve(frozenResult({ ok: false, providerId: providerId, operationId: operationId, reasonCode: "TRANSPORT_UNAVAILABLE" }));
  }
  function installCredentialLifecycle() {
    if (!root || typeof root.addEventListener !== "function") return;
    ["pagehide", "beforeunload", "hashchange", "popstate"].forEach(function (eventName) { root.addEventListener(eventName, clearCurrentDocumentCredentials); });
    root.addEventListener("pageshow", function (event) { if (event && event.persisted) clearCurrentDocumentCredentials(); });
    if (!root.history) return;
    ["pushState", "replaceState"].forEach(function (methodName) {
      var original = root.history[methodName];
      if (typeof original !== "function") return;
      root.history[methodName] = function () {
        clearCurrentDocumentCredentials();
        return original.apply(this, arguments);
      };
    });
  }
  installCredentialLifecycle();

  function reportData(resource, state, detail) {
    if (!resource) return;
    var value = Object.assign({ resource: resource, state: state || "idle", at: Date.now() }, detail || {});
    _activity.resources[resource] = value; _activity.updatedAt = value.at;
    try { if (root && typeof root.dispatchEvent === "function" && typeof root.CustomEvent === "function") root.dispatchEvent(new root.CustomEvent("rl:data-status", { detail: dataState() })); } catch (e) { }
  }
  function dataState() {
    var rows = Object.keys(_activity.resources).map(function (key) { return _activity.resources[key]; });
    var counts = { refreshing: 0, ready: 0, fresh: 0, stale: 0, error: 0, missing: 0 };
    rows.forEach(function (row) { if (counts[row.state] != null) counts[row.state]++; });
    return { updatedAt: _activity.updatedAt, resources: rows, counts: counts };
  }
  function barInfo(sym, interval, maxAgeH) {
    var d = load(), bucket = d.bars[sym] && d.bars[sym][interval];
    if (!bucket) return { state: "missing", at: null, src: null, rows: 0 };
    var fresh = maxAgeH == null || isFresh(bucket.at, maxAgeH * 3600e3);
    return { state: fresh ? "fresh" : "stale", at: bucket.at || null, src: bucket.src || null, rows: (bucket.rows || []).length };
  }

  /* bars: interval-keyed, never cross-evicted; append-merge, provider-tagged. */
  function getBars(sym, interval, maxAgeH) {
    var d = load(), b = d.bars[sym] && d.bars[sym][interval];
    if (!b) return null;
    if (maxAgeH != null && !isFresh(b.at, maxAgeH * 3600e3)) return null;
    return b.rows;
  }
  function putBars(sym, interval, rows, src) {
    var d = load();
    d.bars[sym] = d.bars[sym] || {};
    var prev = d.bars[sym][interval];
    d.bars[sym][interval] = { at: Date.now(), src: src || (prev && prev.src) || "unknown", rows: mergeBars(prev && prev.rows, rows) };
    save(d); return d.bars[sym][interval].rows;
  }
  function seriesMetaValid(meta) {
    if (!meta || typeof meta !== "object" || Array.isArray(meta)) return false;
    if (typeof meta.sourceId !== "string" || !meta.sourceId || typeof meta.providerTag !== "string" || !meta.providerTag) return false;
    if (typeof meta.url !== "string" || !/^https?:\/\//.test(meta.url)) return false;
    if (typeof meta.sourceUsePolicyId !== "string" || !meta.sourceUsePolicyId || typeof meta.sourceUseReviewRef !== "string" || !meta.sourceUseReviewRef) return false;
    if (typeof meta.retrievedAt !== "string" || !isFinite(Date.parse(meta.retrievedAt))) return false;
    if (typeof meta.expectedCadence !== "string" || !meta.expectedCadence || !meta.reviewWindow || typeof meta.reviewWindow !== "object") return false;
    if (meta.rights !== "redistributable" && meta.rights !== "reference-only") return false;
    if (meta.quality !== "observed" && meta.quality !== "indicative-proxy" && meta.quality !== "official-revised") return false;
    return Array.isArray(meta.limitations) && meta.limitations.length > 0 && meta.limitations.every(function (entry) { return typeof entry === "string" && !!entry; });
  }
  function putBarSeries(sym, interval, rows, seriesMeta) {
    if (typeof sym !== "string" || !sym || interval !== "1d" || !seriesMetaValid(seriesMeta)) return null;
    var d = load(), retrievedAt = Date.parse(seriesMeta.retrievedAt);
    d.bars[sym] = d.bars[sym] || {};
    var prev = d.bars[sym][interval];
    var meta = JSON.parse(JSON.stringify(seriesMeta));
    d.bars[sym][interval] = {
      at: retrievedAt,
      src: meta.providerTag,
      rows: mergeBars(prev && prev.rows, rows),
      seriesMeta: meta
    };
    save(d); return barSeries(sym, interval, null, meta.retrievedAt);
  }
  function barSeries(sym, interval, sourcePolicy, decisionTime) {
    var d = load(), bucket = d.bars[sym] && d.bars[sym][interval], meta = bucket && bucket.seriesMeta;
    var policy = sourcePolicy || (meta && meta.sourcePolicy) || null;
    if (!root.RLFX || typeof root.RLFX.normalizeSourceEnvelope !== "function") return null;
    var raw = {
      symbol: sym,
      interval: interval,
      providerTag: bucket && bucket.src || null,
      sourceUrl: meta && meta.url || null,
      retrievedAt: meta && meta.retrievedAt || (bucket && bucket.at && isFinite(bucket.at) ? new Date(bucket.at).toISOString() : null),
      quality: meta && meta.quality || null,
      metadataVerified: !!(bucket && seriesMetaValid(meta)),
      rows: bucket && Array.isArray(bucket.rows) ? bucket.rows : []
    };
    return root.RLFX.normalizeSourceEnvelope(raw, policy || {}, decisionTime);
  }
  function ensureBarSeries(sym, interval, sourcePolicy, decisionTime) {
    if (!root.RLFX || typeof root.RLFX.normalizeSourceEnvelope !== "function") return Promise.resolve(null);
    var current = barSeries(sym, interval, sourcePolicy, decisionTime);
    if (current && current.availability === "fresh") return Promise.resolve(current);
    var approved = sourcePolicy && sourcePolicy.activation === "approved" &&
      (sourcePolicy.rights === "redistributable" || sourcePolicy.rights === "reference-only") &&
      sourcePolicy.persistence !== "forbidden" && Array.isArray(sourcePolicy.providerTags) && sourcePolicy.providerTags.length > 0;
    if (!approved) return Promise.resolve(current);
    return ensureBars(sym, interval, 0, "5y").then(function () {
      var d = load(), bucket = d.bars[sym] && d.bars[sym][interval];
      if (!bucket || sourcePolicy.providerTags.indexOf(bucket.src) < 0) return barSeries(sym, interval, sourcePolicy, decisionTime);
      var retrievedAt = bucket.at && isFinite(bucket.at) ? new Date(bucket.at).toISOString() : null;
      var meta = {
        sourceId: sourcePolicy.sourceId,
        providerTag: bucket.src,
        url: sourcePolicy.sourceUrl,
        sourceUsePolicyId: sourcePolicy.sourceUsePolicyId,
        sourceUseReviewRef: sourcePolicy.sourceUseReviewRef,
        retrievedAt: retrievedAt,
        expectedCadence: sourcePolicy.expectedCadence,
        reviewWindow: sourcePolicy.reviewWindow,
        rights: sourcePolicy.rights,
        quality: sourcePolicy.family === "spot" ? "observed" : "indicative-proxy",
        limitations: sourcePolicy.limitations
      };
      if (!seriesMetaValid(meta)) return barSeries(sym, interval, sourcePolicy, decisionTime);
      putBarSeries(sym, interval, [], meta);
      return barSeries(sym, interval, sourcePolicy, decisionTime);
    });
  }
  function getQuote(sym, maxAgeMin) { var d = load(), q = d.quotes[sym]; if (!q) return null; if (maxAgeMin != null && !isFresh(q.at, maxAgeMin * 60e3)) return null; return q; }
  function putQuote(sym, price, chgPct, src) { var d = load(); d.quotes[sym] = { at: Date.now(), price: price, chgPct: chgPct, src: src || "unknown" }; save(d); }

  /* options: our own rlData.options OR the options-lab legacy `optSnaps` store (read AS-IS; sign already applied). */
  function getOptions(sym, day) {
    var d = load(), o = d.options[sym];
    if (o) { if (day) return o[day] || null; var days = Object.keys(o).sort(); return days.length ? o[days[days.length - 1]] : null; }
    if (HAS_LS) { try { var legacy = JSON.parse(localStorage.getItem("optSnaps") || "null"); if (legacy && legacy[sym]) { var lk = Object.keys(legacy[sym]).sort(); return day ? (legacy[sym][day] || null) : (lk.length ? legacy[sym][lk[lk.length - 1]] : null); } } catch (e) { } }
    return null;
  }
  function putOptions(sym, day, snap) { var d = load(); d.options[sym] = d.options[sym] || {}; d.options[sym][day] = snap; save(d); }

  /* macro gauge — shape { at, fg:{score,band}, vix, vixTerm, breadth, pcRatio } — feeds RLG.macroRegime. */
  function getMacro(maxAgeMin) { var d = load(); if (!d.macro) return null; if (maxAgeMin != null && !isFresh(d.macro.at, maxAgeMin * 60e3)) return null; return d.macro; }
  function putMacro(obj) { var d = load(); d.macro = Object.assign({ at: Date.now() }, d.macro || {}, obj || {}); d.macro.at = Date.now(); save(d); return d.macro; }

  function getEvents(sym) { var d = load(); return (sym ? d.events[sym] : d.events) || null; }
  function putEvents(sym, obj) { var d = load(); d.events[sym] = Object.assign({ at: Date.now() }, obj || {}); save(d); }

  /* Simple-view reads: every tool publishes one compact decision read so the Market Brief
     can reuse the owning model instead of duplicating its math. Shape:
     { id, asOf, read, metrics{}, deepLink }. A missing/invalid id is rejected. */
  function getToolRead(id) { var d = load(); return id ? (d.toolReads[id] || null) : d.toolReads; }

  /* ── Feature 002 Scope 04: ToolModelRead/v1 owner-read validation ──
     A ToolModelRead/v1 is the additive owner-read contract that lets an owning tool publish a
     typed interpretation of the frozen MarketSessionEvidence bundle. The evidence foundation may
     supply values and comparability states, but ONLY the owning adapter may write
     evidenceInterpretations, and its provenance MUST match the read's own adapter/model. A brief
     or final author can never add, change, or infer one, and shared Yahoo/BLS provenance can never
     be counted as an owner action. Additive fields are validated only when present so the existing
     compact rl-tool-read/v1 and legacy shapes remain valid. */
  var HASH_RE = /^sha256:[a-f0-9]{64}$/;
  function trmFail(reason) { return { ok: false, reason: reason }; }
  function validEvidenceRefList(list) {
    return Array.isArray(list) && list.every(function (ref) { return typeof ref === "string" && HASH_RE.test(ref); });
  }
  function validateToolModelRead(read) {
    if (!read || typeof read !== "object" || Array.isArray(read)) return trmFail("read-required");
    if (read.contractVersion !== "tool-model-read/v1") return trmFail("contract-version-invalid");
    if (typeof read.toolId !== "string" || !read.toolId) return trmFail("tool-id-required");
    if (["source", "final-aggregator"].indexOf(read.role) < 0) return trmFail("role-invalid");
    if (["live-market", "static-model", "local-model", "off-theme", "final-aggregator"].indexOf(read.profile) < 0) return trmFail("profile-invalid");
    if (["fresh", "stale", "unavailable", "not-run", "not-applicable"].indexOf(read.status) < 0) return trmFail("status-invalid");
    var adapter = read.adapter;
    if (!adapter || typeof adapter !== "object" || typeof adapter.adapterId !== "string" || !adapter.adapterId ||
      typeof adapter.owningModelVersion !== "string" || !adapter.owningModelVersion) return trmFail("adapter-provenance-required");
    if (typeof read.deepLink !== "string" || !read.deepLink) return trmFail("deep-link-required");
    if (read.evidenceCutoff !== undefined && read.evidenceCutoff !== null &&
      (typeof read.evidenceCutoff !== "string" || !isFinite(Date.parse(read.evidenceCutoff)))) return trmFail("evidence-cutoff-invalid");
    if (read.evidenceRefs !== undefined && read.evidenceRefs !== null) {
      if (!Array.isArray(read.evidenceRefs) || read.evidenceRefs.some(function (ref) {
        return !ref || typeof ref !== "object" || typeof ref.evidenceType !== "string" || !ref.evidenceType || !HASH_RE.test(ref.fingerprint || "");
      })) return trmFail("evidence-refs-invalid");
    }
    var applicability = read.evidenceApplicability;
    if (applicability !== undefined && applicability !== null) {
      if (typeof applicability !== "object" || Array.isArray(applicability) ||
        ["applicable", "not-applicable", "not-integrated"].indexOf(applicability.status) < 0 ||
        typeof applicability.reason !== "string" || !applicability.reason) return trmFail("evidence-applicability-invalid");
    }
    var interpretations = read.evidenceInterpretations;
    if (interpretations !== undefined && interpretations !== null) {
      if (!Array.isArray(interpretations)) return trmFail("evidence-interpretations-invalid");
      if (interpretations.length > 0 && read.role !== "source") return trmFail("final-author-cannot-interpret");
      if (applicability) {
        if (applicability.status === "not-integrated" && interpretations.length > 0) return trmFail("non-integrated-source-cannot-interpret");
        if (applicability.status === "not-applicable" && interpretations.some(function (it) { return it && it.kind !== "not-applicable"; })) return trmFail("not-applicable-source-cannot-affirm");
      }
      for (var i = 0; i < interpretations.length; i += 1) {
        var it = interpretations[i];
        if (!it || typeof it !== "object" || Array.isArray(it) ||
          ["supporting", "contradicting", "context", "insufficient", "not-applicable"].indexOf(it.kind) < 0 ||
          typeof it.ownerAdapterId !== "string" || !it.ownerAdapterId ||
          typeof it.ownerModelVersion !== "string" || !it.ownerModelVersion ||
          !validEvidenceRefList(it.evidenceRefs) ||
          ["permits-owner-action", "context-only", "blocks-action", "not-applicable"].indexOf(it.actionEligibilityEffect) < 0 ||
          typeof it.summary !== "string" || !it.summary) return trmFail("evidence-interpretation-invalid");
        if (it.ownerAdapterId !== adapter.adapterId || it.ownerModelVersion !== adapter.owningModelVersion) return trmFail("evidence-interpretation-provenance-mismatch");
      }
    }
    var eligibility = read.recommendationEligibility;
    if (eligibility && typeof eligibility === "object" && eligibility.eligible === true) {
      if (read.role !== "source") return trmFail("final-author-cannot-be-eligible");
      var permits = Array.isArray(interpretations) && interpretations.some(function (it) {
        return it.actionEligibilityEffect === "permits-owner-action" && (it.kind === "supporting" || it.kind === "contradicting");
      });
      if (!permits) return trmFail("action-eligibility-without-owner-interpretation");
    }
    return { ok: true, value: read };
  }

  function putToolRead(id, obj) {
    if (!id || typeof id !== "string") return null;
    var d = load(), src = (obj && typeof obj === "object") ? obj : {};
    if (src.contractVersion === "rl-tool-read/v1") {
      var keys = Object.keys(src).sort(), expected = ["asOf", "availability", "computedAt", "contractVersion", "deepLink", "freshUntil", "id", "metrics", "read"].sort();
      if (JSON.stringify(keys) !== JSON.stringify(expected) || src.id !== id) return null;
      if (["current", "stale", "unavailable"].indexOf(src.availability) < 0) return null;
      if (src.asOf !== null && (typeof src.asOf !== "string" || !isFinite(Date.parse(src.asOf)))) return null;
      if (typeof src.computedAt !== "string" || !isFinite(Date.parse(src.computedAt))) return null;
      if (src.freshUntil !== null && (typeof src.freshUntil !== "string" || !isFinite(Date.parse(src.freshUntil)))) return null;
      if (typeof src.read !== "string" || !src.metrics || typeof src.metrics !== "object" || Array.isArray(src.metrics) || typeof src.deepLink !== "string" || !src.deepLink) return null;
      if (src.availability === "unavailable" && (src.asOf !== null || src.freshUntil !== null)) return null;
      d.toolReads[id] = JSON.parse(JSON.stringify(src));
      save(d); return d.toolReads[id];
    }
    if (src.contractVersion === "tool-model-read/v1" && src.toolId === id && validateToolModelRead(src).ok) {
      /* Conforming Scope 04 owner read: persist intact so additive evidence refs / interpretations
         round-trip. A non-conforming tool-model-read/v1 falls through to the legacy compact store. */
      d.toolReads[id] = JSON.parse(JSON.stringify(src));
      save(d); return d.toolReads[id];
    }
    d.toolReads[id] = {
      id: id,
      asOf: src.asOf || new Date().toISOString(),
      read: String(src.read || ""),
      metrics: (src.metrics && typeof src.metrics === "object") ? src.metrics : {},
      deepLink: src.deepLink || (id + ".html")
    };
    save(d); return d.toolReads[id];
  }

  function freshness() {
    var d = load(), out = { macro: d.macro && d.macro.at || null, bars: {}, options: {}, toolReads: {} }, s, iv;
    for (s in d.bars) { out.bars[s] = {}; for (iv in d.bars[s]) out.bars[s][iv] = d.bars[s][iv].at; }
    for (s in d.options) { var ks = Object.keys(d.options[s]); out.options[s] = ks.length ? ks[ks.length - 1] : null; }
    for (s in d.toolReads) out.toolReads[s] = d.toolReads[s].asOf || null;
    return out;
  }

  /* ── fetch/ensure (browser only; Node callers use scripts/brief-refresh.mjs) ── */
  function proxied(url) {
    /* same free-proxy mechanism the other labs use: direct → corsproxy → allorigins → codetabs. */
    return [url,
      "https://corsproxy.io/?url=" + encodeURIComponent(url),
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
      "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(url)];
  }
  /* fetch with an abort timeout so a hung request can never stall a caller (default 9s). */
  function fetchT(url, opts, ms) {
    opts = opts || {};
    if (typeof AbortController === "undefined" || typeof fetch === "undefined") return fetch(url, opts);
    var ctl = new AbortController(), to = setTimeout(function () { try { ctl.abort(); } catch (e) { } }, ms || 9000);
    opts.signal = ctl.signal;
    return fetch(url, opts).then(function (r) { clearTimeout(to); return r; }, function (e) { clearTimeout(to); throw e; });
  }
  function fetchJson(url) {
    var chain = proxied(url), i = 0;
    return (function next() {
      if (i >= chain.length) return Promise.reject(new Error("all proxies failed"));
      return fetchT(chain[i++]).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); }).catch(next);
    })();
  }
  function yahooToRows(j) {
    try {
      var res = j.chart.result[0], t = res.timestamp || [], q = res.indicators.quote[0],
        adj = res.indicators.adjclose && res.indicators.adjclose[0] && res.indicators.adjclose[0].adjclose, rows = [], i;
      for (i = 0; i < t.length; i++) {
        var c = adj ? adj[i] : q.close[i]; if (c == null) continue;
        rows.push({ t: t[i] * 1000, o: q.open[i], h: q.high[i], l: q.low[i], c: c, v: q.volume[i] });
      }
      return rows;
    } catch (e) { return null; }
  }
  /* same-origin daily-bar snapshot (data/bars/<SYM>.json) written by scripts/fetch-bars.mjs. Works on
     GitHub Pages with NO CORS/proxy; only attempted over http(s) for 1d bars (file:// falls straight through). */
  function pagesBars(sym) {
    if (typeof location === "undefined" || !/^https?:/.test(location.protocol)) return Promise.resolve(null);
    return fetchT("data/bars/" + encodeURIComponent(sym) + ".json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (j) { return (j && Array.isArray(j.rows) && j.rows.length) ? j.rows : null; })
      .catch(function () { return null; });
  }
  function pagesMacro() {
    if (typeof location === "undefined" || !/^https?:/.test(location.protocol)) return Promise.resolve(null);
    return fetchT("market-brief.snapshot.json", { cache: "no-store" })
      .then(function (response) { if (!response.ok) throw new Error("http " + response.status); return response.json(); })
      .then(function (snapshot) {
        var regime = snapshot && snapshot.regime; if (!regime) return null;
        var sourceAt = Date.parse(snapshot.generatedAt || snapshot.asOf || "");
        return { sourceAt: isFinite(sourceAt) ? sourceAt : null, fg: regime.fearGreed != null ? { score: +regime.fearGreed, band: regime.band || "" } : undefined, vix: regime.vix != null ? +regime.vix : undefined, source: "market-brief-snapshot" };
      }).catch(function () { return null; });
  }
  function ensureBars(sym, interval, maxAgeH, range) {
    var resource = "bars:" + sym + ":" + interval, cached = getBars(sym, interval, maxAgeH), stale = getBars(sym, interval) || null, priorAt = barInfo(sym, interval).at;
    if (cached) { reportData(resource, "fresh", Object.assign({ label: sym + " " + interval }, barInfo(sym, interval, maxAgeH))); return Promise.resolve(cached); }
    reportData(resource, "refreshing", { label: sym + " " + interval, hadCached: !!stale });
    if (!HAS_FETCH) { reportData(resource, stale ? "stale" : "missing", { label: sym + " " + interval, hadCached: !!stale }); return Promise.resolve(stale); }
    var pre = (interval === "1d") ? pagesBars(sym) : Promise.resolve(null);
    return pre.then(function (snap) {
      if (snap && snap.length) return putBars(sym, interval, snap, "pages-snapshot");
      range = range || (interval === "1d" ? "5y" : interval === "5m" ? "1mo" : "7d");
      function yahooFallback() {
        var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(sym) + "?range=" + range + "&interval=" + interval + "&includeAdjustedClose=true";
        return fetchJson(url).then(function (j) { var rows = yahooToRows(j); return (rows && rows.length) ? putBars(sym, interval, rows, "yahoo") : null; }).catch(function () { return null; });
      }
      if (interval !== "1d" && typeof location !== "undefined" && /^https?:/.test(location.protocol)) return stale;
      return yahooFallback().then(function (rows) { return rows || (getBars(sym, interval) || null); });
    }).then(function (rows) {
      var info = barInfo(sym, interval, maxAgeH);
      reportData(resource, rows && rows.length ? ((info.at && info.at !== priorAt) || info.state === "fresh" ? "ready" : "stale") : "error", Object.assign({ label: sym + " " + interval, hadCached: !!stale }, info));
      return rows;
    }).catch(function () { reportData(resource, stale ? "stale" : "error", { label: sym + " " + interval, hadCached: !!stale }); return stale; });
  }
  function ensureMacro(maxAgeMin) {
    var cached = getMacro(maxAgeMin);
    if (cached) { reportData("macro", "fresh", { label: "Macro regime", at: cached.at || null }); return Promise.resolve(cached); }
    var stale = getMacro() || null; reportData("macro", "refreshing", { label: "Macro regime", hadCached: !!stale });
    if (!HAS_FETCH) { reportData("macro", stale ? "stale" : "missing", { label: "Macro regime", hadCached: !!stale }); return Promise.resolve(stale); }
    return pagesMacro().then(function (snapshot) {
      if (snapshot) return putMacro(snapshot);
      var fgUrl = "https://production.dataviz.cnn.io/index/fearandgreed/graphdata";
      var vixUrl = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?range=1mo&interval=1d";
      return Promise.all([
        fetchJson(fgUrl).then(function (j) { try { return { score: Math.round(j.fear_and_greed.score), band: j.fear_and_greed.rating }; } catch (e) { return null; } }).catch(function () { return null; }),
        fetchJson(vixUrl).then(function (j) { var r = yahooToRows(j); return (r && r.length) ? r[r.length - 1].c : null; }).catch(function () { return null; })
      ]).then(function (res) {
        var fg = res[0], vix = res[1];
        if (fg == null && vix == null) return stale;
        return putMacro({ fg: fg || undefined, vix: (vix != null ? vix : undefined), source: "live-providers" });
      });
    }).then(function (value) { reportData("macro", value ? "ready" : "error", { label: "Macro regime", at: value && (value.sourceAt || value.at) || null, hadCached: !!stale, src: value && value.source || null }); return value; })
      .catch(function () { reportData("macro", stale ? "stale" : "error", { label: "Macro regime", hadCached: !!stale }); return stale; });
  }

  root.RLDATA = {
    // accessors
    bars: getBars, putBars: putBars, quote: getQuote, putQuote: putQuote,
    barSeries: barSeries, putBarSeries: putBarSeries, ensureBarSeries: ensureBarSeries,
    options: getOptions, putOptions: putOptions, macro: getMacro, putMacro: putMacro,
    events: getEvents, putEvents: putEvents, toolRead: getToolRead, putToolRead: putToolRead,
    validateToolModelRead: validateToolModelRead,
    freshness: freshness, barInfo: barInfo, dataState: dataState, reportData: reportData,
    providerPolicies: providerPolicies, credentialStatus: credentialStatus,
    authorizeCredential: authorizeCredential, useCredential: useCredential,
    clearCredential: clearCredential, clearAllCredentials: clearAllCredentials,
    // fetch/ensure
    ensureBars: ensureBars, ensureMacro: ensureMacro,
    // pure helpers (also used by selftest)
    mergeBars: mergeBars, isFresh: isFresh, sma: sma, momentumPct: momentumPct
  };

  /* ---------- Feature 007: qualified interval series ---------- */
  function qualifiedClone(value) { return JSON.parse(JSON.stringify(value)); }
  function qualifiedFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { qualifiedFreeze(value[key]); });
    return Object.freeze(value);
  }
  function qualifiedExactKeys(value, expected) {
    return !!(value && typeof value === "object" && !Array.isArray(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify(expected.slice().sort()));
  }
  function qualifiedSourceValid(source) {
    var keys = ["contractVersion", "sourceId", "authority", "providerTag", "sourceUrl", "sourceUsePolicyId", "sourceUseReviewRef", "rights", "quality", "observedThrough", "availableAt", "retrievedAt", "freshUntil", "adjustmentPolicyId", "currency", "venue", "sessionContractId", "revisionPolicy", "vintageId", "limitations"];
    if (!qualifiedExactKeys(source, keys) || source.contractVersion !== "tad-source-vintage/v1" || !/^https:\/\//.test(source.sourceUrl)) return false;
    var requiredStrings = ["sourceId", "authority", "providerTag", "sourceUsePolicyId", "sourceUseReviewRef", "adjustmentPolicyId", "currency", "venue", "sessionContractId", "revisionPolicy", "vintageId"];
    if (requiredStrings.some(function (key) { return typeof source[key] !== "string" || !source[key]; })) return false;
    if (["redistributable", "reference-only"].indexOf(source.rights) < 0 || ["observed", "official-revised", "indicative-proxy"].indexOf(source.quality) < 0) return false;
    var clocks = [source.observedThrough, source.availableAt, source.retrievedAt, source.freshUntil].map(Date.parse);
    return clocks.every(Number.isFinite) && clocks[0] <= clocks[1] && clocks[1] <= clocks[2] && clocks[2] <= clocks[3] && Array.isArray(source.limitations) && source.limitations.length > 0 && source.limitations.every(function (entry) { return typeof entry === "string" && !!entry; });
  }
  function qualifiedBarValid(bar, source, seen) {
    var keys = ["barId", "interval", "sessionId", "openedAt", "closedAt", "availableAt", "o", "h", "l", "c", "v", "adjustmentPolicyId", "status", "expectedDurationMs", "actualDurationMs", "qualityFlags", "sourceRowIds"];
    if (!qualifiedExactKeys(bar, keys) || typeof bar.barId !== "string" || !bar.barId || seen[bar.barId]) return false;
    seen[bar.barId] = true;
    var opened = Date.parse(bar.openedAt), closed = Date.parse(bar.closedAt), available = Date.parse(bar.availableAt);
    var numeric = [bar.o, bar.h, bar.l, bar.c, bar.v, bar.expectedDurationMs, bar.actualDurationMs];
    return [opened, closed, available].every(Number.isFinite) && opened < closed && opened <= available &&
      numeric.every(function (value) { return typeof value === "number" && Number.isFinite(value); }) &&
      bar.l <= Math.min(bar.o, bar.c) && Math.max(bar.o, bar.c) <= bar.h && bar.v >= 0 &&
      bar.expectedDurationMs > 0 && bar.actualDurationMs > 0 &&
      bar.adjustmentPolicyId === source.adjustmentPolicyId && ["closed", "provisional", "partial"].indexOf(bar.status) >= 0 &&
      Array.isArray(bar.qualityFlags) && Array.isArray(bar.sourceRowIds) && bar.sourceRowIds.length > 0;
  }
  function qualifiedEnvelopeValid(envelope) {
    var keys = ["contractVersion", "symbol", "assetClass", "interval", "source", "bars", "availability", "errors"];
    if (!qualifiedExactKeys(envelope, keys) || envelope.contractVersion !== "tad-series/v1" || typeof envelope.symbol !== "string" || !envelope.symbol || typeof envelope.assetClass !== "string" || !envelope.assetClass || typeof envelope.interval !== "string" || !envelope.interval || !qualifiedSourceValid(envelope.source) || !Array.isArray(envelope.bars) || !envelope.bars.length || !qualifiedExactKeys(envelope.availability, ["state", "observedThrough"]) || !Array.isArray(envelope.errors) || envelope.errors.length) return false;
    var seen = Object.create(null);
    return envelope.bars.every(function (bar) { return qualifiedBarValid(bar, envelope.source, seen); });
  }
  function putQualifiedBarSeries(envelope) {
    if (!qualifiedEnvelopeValid(envelope)) return null;
    var data = load(), symbol = envelope.symbol, interval = envelope.interval, vintageId = envelope.source.vintageId;
    if (!Object.prototype.hasOwnProperty.call(data.bars, symbol)) data.bars[symbol] = {};
    if (!data.bars[symbol] || typeof data.bars[symbol] !== "object" || Array.isArray(data.bars[symbol])) return null;
    var existing = data.bars[symbol][interval];
    if (!existing) existing = { at: Date.parse(envelope.source.retrievedAt), src: envelope.source.providerTag, rows: [] };
    if (!Object.prototype.hasOwnProperty.call(existing, "qualifiedSeries")) existing.qualifiedSeries = {};
    if (!existing.qualifiedSeries || typeof existing.qualifiedSeries !== "object" || Array.isArray(existing.qualifiedSeries)) return null;
    existing.qualifiedSeries[vintageId] = qualifiedClone(envelope);
    data.bars[symbol][interval] = existing;
    save(data);
    return qualifiedBarSeries(symbol, interval, vintageId);
  }
  function qualifiedBarSeries(symbol, interval, vintageId) {
    if (typeof symbol !== "string" || !symbol || typeof interval !== "string" || !interval) return null;
    var data = load(), bucket = data.bars[symbol] && data.bars[symbol][interval], series = bucket && bucket.qualifiedSeries;
    if (!series || typeof series !== "object") return null;
    var selectedVintage = vintageId;
    if (selectedVintage == null) {
      var candidates = Object.keys(series).filter(function (id) { return qualifiedEnvelopeValid(series[id]); });
      if (!candidates.length) return null;
      candidates.sort(function (left, right) { return Date.parse(series[left].source.retrievedAt) - Date.parse(series[right].source.retrievedAt) || left.localeCompare(right); });
      selectedVintage = candidates[candidates.length - 1];
    }
    if (typeof selectedVintage !== "string" || !qualifiedEnvelopeValid(series[selectedVintage])) return null;
    return qualifiedFreeze(qualifiedClone(series[selectedVintage]));
  }
  root.RLDATA.putQualifiedBarSeries = putQualifiedBarSeries;
  root.RLDATA.qualifiedBarSeries = qualifiedBarSeries;
  /* ---------- End Feature 007 qualified interval series ---------- */
})();
