/*
 * rlmarketaction.js
 * ------------------------------------------------------------------------
 * Feature 012 Scope 09 — Market Action Center PUBLIC projection composer.
 *
 * This module is the ONE pure composer/validator for the two public Market
 * Action Center contracts:
 *
 *   - PortfolioTickerMatrix/v1  (PUBLIC watchlist projection only)
 *       composePublicMatrix()  builds one scope-labeled per-ticker matrix from
 *       the committed ticker-only watchlist, a registry-derived domain map, and
 *       EXISTING public owner reads that are handed IN. Every cell carries an
 *       EXPLICIT applicability + state — a missing owner read is `unavailable`
 *       with a gap reason, NEVER neutral by omission. Every row is scope-labeled
 *       `Public watchlist`.
 *       validatePublicMatrix() re-checks the closed contract and REJECTS any
 *       private-workspace row, any private/holding field, and any cell whose
 *       applicability/state is absent or outside the closed enums.
 *
 *   - MarketActionCenterProjection/v1  (the four-view Center truth)
 *       composeCenterProjection()  composes EXACTLY four top-level views —
 *       Brief, Portfolio, Red Alert, Journey — from existing public projections.
 *       No Simple/Power/fifth top-level mode is derivable; evidence and
 *       experiments are in-view disclosures. When coverage is complete and zero
 *       actions are admitted it states that no current action clears the bar and
 *       NEVER manufactures a trade, catalyst, or confidence claim (SCN-012-019).
 *       validateCenterProjection() re-checks the exact four-view set, the single
 *       active view, and the exact dependency-pending gates.
 *
 * HARD INVARIANTS enforced here:
 *   - PUBLIC-ONLY. This module consumes the ticker-only watchlist and public
 *     owner reads handed in by the caller. It NEVER reads or creates a Feature
 *     008 private key, holding, quantity, cost, P&L, mandate, or personal
 *     exposure, and it REJECTS any input that carries such a field
 *     (RLMKT-PRIVACY). Public-watchlist status never implies ownership
 *     (SCN-012-022).
 *   - PURE. This module performs ZERO fetch / providerFetch / credential /
 *     localStorage / sessionStorage / LLM / publisher access and writes nothing.
 *     It is in-memory compute only and holds no I/O surface at all.
 *   - EXACT DEPENDENCY-PENDING GATES. Live Red Alert publication and authored
 *     ToolBrief/v2 Briefs are gated to Feature 002; the private Portfolio
 *     overlay is gated to Feature 008. This module renders those as explicit
 *     dependency-pending states — it does NOT implement them (Scopes 11/12/13).
 *   - EXACTLY FOUR TOP-LEVEL VIEWS. A Center projection with any other view set,
 *     a fifth view, or a Simple/Power top-level mode is rejected (RLMKT-VIEW).
 *   - NO FABRICATION. The no-action Brief state never synthesizes an action,
 *     catalyst, or confidence claim that the caller did not admit.
 *
 * Ships as a UMD dual module: Node (module.exports) for tests, and browser global
 * RLMARKETACTIONCENTER for the shared shell (distinct from the RLMARKETACTION
 * simple-adapter global owned by rlexperience-adapters/market-action.js, which
 * rlbrief.js delegates its next-session action feed to — the two must not collide).
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLMARKETACTION_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLMARKETACTIONCENTER = api;
})(function () {
  "use strict";

  /* ═══════════ closed contract constants ═══════════ */

  var CONTRACT = Object.freeze({
    matrix: "portfolio-ticker-matrix/v1",
    projection: "market-action-center-projection/v1",
    scopeSummary: "matrix-scope-summary/v1",
    privacyAssertion: "matrix-privacy-assertion/v1"
  });
  /* the exact four top-level Market Action Center views, in order. */
  var CENTER_VIEW_IDS = Object.freeze(["brief", "portfolio", "red-alert", "journey"]);
  /* the closed matrix cell states. A missing read is `unavailable`, never neutral. */
  var CELL_STATES = Object.freeze([
    "current", "partial", "stale", "disputed", "unavailable", "not-applicable"
  ]);
  var APPLICABILITY = Object.freeze(["applicable", "not-applicable"]);
  var SCOPE_CLASSES = Object.freeze(["public-watchlist", "private-workspace"]);
  var PUBLIC_SCOPE_LABEL = "Public watchlist";
  /* the seven public matrix domains (mirror tool-experience.config.json matrixPolicy.domains). */
  var MATRIX_DOMAINS = Object.freeze([
    "fundamentals", "options", "technical", "macro-rotation", "volatility", "catalyst", "gaps"
  ]);
  /* the exact dependency-pending gates. These capabilities are gated, not implemented here. */
  var GATE = Object.freeze({
    authoredBriefV2: "dependency-pending:feature-002",
    redAlertPublication: "dependency-pending:feature-002",
    privatePortfolioOverlay: "dependency-pending:feature-008"
  });
  var REFUSAL_CODES = Object.freeze([
    "RLMKT-INPUT", "RLMKT-MATRIX", "RLMKT-CELL", "RLMKT-SCOPE", "RLMKT-PRIVACY",
    "RLMKT-PROJECTION", "RLMKT-VIEW", "RLMKT-GATE", "RLMKT-NOACTION", "RLMKT-VERSION",
    /* Scope 12 Red Alert engine refusal codes. */
    "RLMKT-SEED", "RLMKT-CANDIDATE", "RLMKT-SCORE", "RLMKT-LIFECYCLE", "RLMKT-ALARMISM", "RLMKT-REDALERT"
  ]);
  /* forbidden PRIVATE field-name roots (Feature 008 portfolio state). A field whose
     lower-cased name contains any of these roots may never enter a public matrix or
     a Center projection (SCN-012-022). Chosen to avoid collisions with the public
     matrix/projection field vocabulary. */
  var PRIVATE_FIELD_ROOTS = Object.freeze([
    "holding", "quantity", "sharecount", "shares", "costbasis", "avgcost", "avgprice",
    "lotsize", "pnl", "pandl", "profitloss", "mandate", "exposure", "personalexposure",
    "position", "positions", "allocationsize", "privateticker", "accountid"
  ]);
  var NO_ACTION_STATEMENT = "No current action clears the bar for this window.";
  var ISO_PATTERN = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/;

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

  function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
  }

  /* ═══════════ canonical serialization + fingerprint ═══════════ */

  function canonicalize(value) {
    var active = [];
    function encode(current) {
      if (current === null) return "null";
      if (typeof current === "string" || typeof current === "boolean") return JSON.stringify(current);
      if (typeof current === "number") {
        if (!Number.isFinite(current)) throw new Error("RLMARKETACTION_NONFINITE_CANONICAL_VALUE");
        return JSON.stringify(current);
      }
      if (Array.isArray(current)) {
        if (active.indexOf(current) !== -1) throw new Error("RLMARKETACTION_CYCLIC_CANONICAL_VALUE");
        active.push(current);
        var items = current.map(encode);
        active.pop();
        return "[" + items.join(",") + "]";
      }
      if (isPlainObject(current)) {
        if (active.indexOf(current) !== -1) throw new Error("RLMARKETACTION_CYCLIC_CANONICAL_VALUE");
        active.push(current);
        var fields = Object.keys(current).sort().map(function (key) {
          if (typeof current[key] === "undefined") throw new Error("RLMARKETACTION_UNDEFINED_CANONICAL_VALUE");
          return JSON.stringify(key) + ":" + encode(current[key]);
        });
        active.pop();
        return "{" + fields.join(",") + "}";
      }
      throw new Error("RLMARKETACTION_UNSUPPORTED_CANONICAL_VALUE");
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
    if (REFUSAL_CODES.indexOf(code) === -1) code = "RLMKT-INPUT";
    var error = new Error(code + " " + fieldPath + " " + reason);
    error.name = "RlmktRefusal";
    error.code = code;
    error.fieldPath = fieldPath;
    error.reason = reason;
    throw error;
  }

  function capture(operation) {
    try {
      return deepFreeze({ ok: true, value: deepFreeze(operation()) });
    } catch (error) {
      if (error && error.name === "RlmktRefusal") {
        return deepFreeze({ ok: false, error: { contractVersion: "market-action-error/v1", code: error.code, fieldPath: error.fieldPath, reason: error.reason, valueEchoed: false } });
      }
      return deepFreeze({ ok: false, error: { contractVersion: "market-action-error/v1", code: "RLMKT-INPUT", fieldPath: "$", reason: "composer rejected an unsupported value", valueEchoed: false } });
    }
  }

  /* ═══════════ private-field barrier (SCN-012-022) ═══════════ */

  /* Deep-scan every field NAME in a value; reject any that names Feature 008 private
     portfolio state. This is the structural guarantee that a public matrix or Center
     projection can never carry or imply a holding, quantity, cost, P&L, mandate, or
     exposure — even if a caller tries to smuggle one in. */
  function assertNoPrivateField(value, fieldPath) {
    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i += 1) assertNoPrivateField(value[i], fieldPath + "[" + i + "]");
      return;
    }
    if (isPlainObject(value)) {
      var keys = Object.keys(value);
      for (var k = 0; k < keys.length; k += 1) {
        var lower = keys[k].toLowerCase();
        for (var r = 0; r < PRIVATE_FIELD_ROOTS.length; r += 1) {
          if (lower.indexOf(PRIVATE_FIELD_ROOTS[r]) !== -1) {
            reject("RLMKT-PRIVACY", fieldPath + "." + keys[k], "forbidden private portfolio field name (Feature 008 private state may never enter a public projection)");
          }
        }
        assertNoPrivateField(value[keys[k]], fieldPath + "." + keys[k]);
      }
    }
  }

  /* ═══════════ PortfolioTickerMatrix/v1 — PUBLIC composer ═══════════ */

  function normalizeWatchlist(watchlist) {
    if (!isPlainObject(watchlist) || !Array.isArray(watchlist.items)) {
      reject("RLMKT-INPUT", "$.watchlist.items", "public watchlist must be an object with an items array");
    }
    var seen = Object.create(null);
    return watchlist.items.map(function (item, index) {
      if (!isPlainObject(item) || !isNonEmptyString(item.ticker)) {
        reject("RLMKT-INPUT", "$.watchlist.items[" + index + "].ticker", "each watchlist item requires a non-empty ticker");
      }
      if (seen[item.ticker]) reject("RLMKT-INPUT", "$.watchlist.items[" + index + "].ticker", "duplicate watchlist ticker");
      seen[item.ticker] = true;
      return { ticker: item.ticker, type: isNonEmptyString(item.type) ? item.type : "unknown", label: isNonEmptyString(item.label) ? item.label : item.ticker, model: isNonEmptyString(item.model) ? item.model : null };
    });
  }

  function resolveCell(input, ticker, domainId) {
    var applicabilityMap = isPlainObject(input.applicability) ? input.applicability : {};
    var domainApplicability = isPlainObject(applicabilityMap[domainId]) ? applicabilityMap[domainId] : {};
    var declared = domainApplicability[ticker];
    var precedence = (isPlainObject(input.ownerPrecedence) && Array.isArray(input.ownerPrecedence[domainId])) ? input.ownerPrecedence[domainId] : [];
    var firstOwner = precedence.length > 0 ? precedence[0] : null;

    /* not-applicable is EXPLICIT and does not count as missing coverage. */
    if (declared === "not-applicable" || (typeof declared === "undefined" && precedence.length === 0)) {
      return {
        domainId: domainId,
        ownerToolId: firstOwner,
        applicability: "not-applicable",
        state: "not-applicable",
        read: null,
        asOf: null,
        provenance: "registry-applicability",
        gapReason: "domain not applicable to this public-watchlist ticker",
        ownerDeepLink: null,
        publicBriefRef: null,
        localOverlayRef: null
      };
    }
    if (typeof declared !== "undefined" && declared !== "applicable") {
      reject("RLMKT-CELL", "$.applicability." + domainId + "." + ticker, "cell applicability must be exactly 'applicable' or 'not-applicable', never neutral by omission");
    }

    var reads = isPlainObject(input.ownerReads) ? input.ownerReads : {};
    for (var i = 0; i < precedence.length; i += 1) {
      var toolId = precedence[i];
      var toolReads = isPlainObject(reads[toolId]) ? reads[toolId] : {};
      var read = toolReads[ticker];
      if (isPlainObject(read) && isNonEmptyString(read.state)) {
        if (CELL_STATES.indexOf(read.state) === -1 || read.state === "not-applicable") {
          reject("RLMKT-CELL", "$.ownerReads." + toolId + "." + ticker + ".state", "owner read state must be one of current|partial|stale|disputed|unavailable");
        }
        var covered = read.state === "current";
        return {
          domainId: domainId,
          ownerToolId: toolId,
          applicability: "applicable",
          state: read.state,
          read: isNonEmptyString(read.read) ? read.read : null,
          asOf: isNonEmptyString(read.asOf) ? read.asOf : null,
          provenance: isNonEmptyString(read.provenance) ? read.provenance : "owner-read",
          gapReason: covered ? null : (isNonEmptyString(read.gapReason) ? read.gapReason : "owner read is " + read.state),
          ownerDeepLink: isNonEmptyString(read.ownerDeepLink) ? read.ownerDeepLink : (toolId + ".html#power"),
          publicBriefRef: null,
          localOverlayRef: null
        };
      }
    }

    /* applicable but no current owner read: EXPLICITLY unavailable, never neutral. */
    return {
      domainId: domainId,
      ownerToolId: firstOwner,
      applicability: "applicable",
      state: "unavailable",
      read: null,
      asOf: null,
      provenance: "owner-read",
      gapReason: "no current public owner read for this ticker in this domain",
      ownerDeepLink: firstOwner ? (firstOwner + ".html#power") : null,
      publicBriefRef: null,
      localOverlayRef: null
    };
  }

  function composePublicMatrix(rawInput) {
    return capture(function () {
      if (!isPlainObject(rawInput)) reject("RLMKT-INPUT", "$", "matrix input must be an object");
      /* the composer refuses to even accept private portfolio input (SCN-012-022). */
      assertNoPrivateField(rawInput, "$");

      if (!isNonEmptyString(rawInput.matrixId)) reject("RLMKT-INPUT", "$.matrixId", "matrixId is required");
      if (!isNonEmptyString(rawInput.cutoffAt) || !ISO_PATTERN.test(rawInput.cutoffAt)) reject("RLMKT-INPUT", "$.cutoffAt", "cutoffAt must be an ISO timestamp");
      if (!isNonEmptyString(rawInput.generationRef)) reject("RLMKT-INPUT", "$.generationRef", "generationRef is required (the Feature 002 or legacy generation this matrix belongs to)");
      if (!isNonEmptyString(rawInput.domainMapVersion)) reject("RLMKT-INPUT", "$.domainMapVersion", "domainMapVersion is required");

      var items = normalizeWatchlist(rawInput.watchlist);

      var rows = items.map(function (item) {
        var cells = MATRIX_DOMAINS.map(function (domainId) { return resolveCell(rawInput, item.ticker, domainId); });
        var gaps = cells
          .filter(function (cell) { return cell.applicability === "applicable" && cell.state !== "current"; })
          .map(function (cell) { return { domainId: cell.domainId, state: cell.state, gapReason: cell.gapReason }; });
        return {
          rowId: "matrix/" + rawInput.matrixId + "/row/" + item.ticker,
          scopeClass: "public-watchlist",
          ticker: item.ticker,
          scopeLabel: PUBLIC_SCOPE_LABEL,
          scopeRef: item.model ? item.model : "watchlist.json",
          cells: cells,
          /* authored per-ticker catalyst Brief is a Feature 002 dependency-pending gate;
             the composer never fabricates a catalyst. */
          catalyst: { state: GATE.authoredBriefV2, ref: null, note: "Authored public catalyst Brief is gated to Feature 002 certification (Scope 11)." },
          gaps: gaps,
          publicBriefState: GATE.authoredBriefV2,
          localOverlayState: GATE.privatePortfolioOverlay
        };
      });

      var scopeSummary = {
        contractVersion: CONTRACT.scopeSummary,
        scopeClass: "public-watchlist",
        scopeLabel: PUBLIC_SCOPE_LABEL,
        source: "watchlist.json",
        rowCount: rows.length,
        coveredCellCount: rows.reduce(function (sum, row) { return sum + row.cells.filter(function (c) { return c.state === "current"; }).length; }, 0),
        gapCount: rows.reduce(function (sum, row) { return sum + row.gaps.length; }, 0)
      };

      var privacyAssertion = {
        contractVersion: CONTRACT.privacyAssertion,
        publicOnly: true,
        feature008KeyRead: false,
        feature008KeyCreated: false,
        privateFieldsPresent: false,
        statement: "Public watchlist only. No holding, quantity, cost, P&L, mandate, or personal exposure is read, created, or inferred."
      };

      var matrix = {
        contractVersion: CONTRACT.matrix,
        matrixId: rawInput.matrixId,
        cutoffAt: rawInput.cutoffAt,
        generationRef: rawInput.generationRef,
        scopeSummary: scopeSummary,
        rows: rows,
        domainMapVersion: rawInput.domainMapVersion,
        privacyAssertion: privacyAssertion,
        matrixFingerprint: null
      };
      matrix.matrixFingerprint = fingerprint(Object.assign({}, matrix, { matrixFingerprint: null }));
      return matrix;
    });
  }

  function validatePublicMatrix(matrix) {
    return capture(function () {
      if (!isPlainObject(matrix)) reject("RLMKT-MATRIX", "$", "matrix must be an object");
      if (matrix.contractVersion !== CONTRACT.matrix) reject("RLMKT-VERSION", "$.contractVersion", "unsupported matrix contract version");
      assertNoPrivateField(matrix, "$");

      if (!Array.isArray(matrix.rows)) reject("RLMKT-MATRIX", "$.rows", "matrix rows must be an array");
      matrix.rows.forEach(function (row, index) {
        var base = "$.rows[" + index + "]";
        if (!isPlainObject(row)) reject("RLMKT-MATRIX", base, "each row must be an object");
        if (SCOPE_CLASSES.indexOf(row.scopeClass) === -1) reject("RLMKT-SCOPE", base + ".scopeClass", "unknown scope class");
        /* the PUBLIC validator refuses a private-workspace row (SCN-012-022). */
        if (row.scopeClass !== "public-watchlist") reject("RLMKT-SCOPE", base + ".scopeClass", "public matrix validator refuses a private-workspace row");
        if (row.scopeLabel !== PUBLIC_SCOPE_LABEL) reject("RLMKT-SCOPE", base + ".scopeLabel", "every public row must be labeled 'Public watchlist'");
        if (!isNonEmptyString(row.ticker)) reject("RLMKT-MATRIX", base + ".ticker", "row ticker is required");
        if (!Array.isArray(row.cells) || row.cells.length !== MATRIX_DOMAINS.length) {
          reject("RLMKT-CELL", base + ".cells", "every row must carry exactly one cell per matrix domain (never neutral by omission)");
        }
        row.cells.forEach(function (cell, cellIndex) {
          var cbase = base + ".cells[" + cellIndex + "]";
          if (!isPlainObject(cell)) reject("RLMKT-CELL", cbase, "each cell must be an object");
          if (cell.domainId !== MATRIX_DOMAINS[cellIndex]) reject("RLMKT-CELL", cbase + ".domainId", "cell domain order must match the closed matrix domain list");
          if (APPLICABILITY.indexOf(cell.applicability) === -1) reject("RLMKT-CELL", cbase + ".applicability", "cell applicability must be exactly 'applicable' or 'not-applicable'");
          if (CELL_STATES.indexOf(cell.state) === -1) reject("RLMKT-CELL", cbase + ".state", "cell state must be one of the closed six states, never absent");
          if (cell.applicability === "not-applicable" && cell.state !== "not-applicable") reject("RLMKT-CELL", cbase + ".state", "a not-applicable cell must carry state not-applicable");
          if (cell.applicability === "applicable" && cell.state === "not-applicable") reject("RLMKT-CELL", cbase + ".state", "an applicable cell may not carry state not-applicable");
          if (cell.state !== "current" && !isNonEmptyString(cell.gapReason)) reject("RLMKT-CELL", cbase + ".gapReason", "any non-current cell must carry an explicit gap reason");
        });
        if (row.publicBriefState !== GATE.authoredBriefV2) reject("RLMKT-GATE", base + ".publicBriefState", "authored per-ticker public Brief must remain a Feature 002 dependency-pending gate");
        if (row.localOverlayState !== GATE.privatePortfolioOverlay) reject("RLMKT-GATE", base + ".localOverlayState", "private overlay must remain a Feature 008 dependency-pending gate");
      });

      if (!isPlainObject(matrix.privacyAssertion) || matrix.privacyAssertion.publicOnly !== true || matrix.privacyAssertion.feature008KeyRead !== false || matrix.privacyAssertion.feature008KeyCreated !== false || matrix.privacyAssertion.privateFieldsPresent !== false) {
        reject("RLMKT-PRIVACY", "$.privacyAssertion", "matrix must assert public-only scope with no Feature 008 key read/create and no private fields");
      }
      if (matrix.matrixFingerprint !== fingerprint(Object.assign({}, matrix, { matrixFingerprint: null }))) {
        reject("RLMKT-MATRIX", "$.matrixFingerprint", "matrix fingerprint does not match its canonical content");
      }
      return {
        contractVersion: CONTRACT.matrix,
        matrixId: matrix.matrixId,
        rowCount: matrix.rows.length,
        publicOnly: true,
        privateFieldsPresent: false,
        matrixFingerprint: matrix.matrixFingerprint
      };
    });
  }

  /* ═══════════ MarketActionCenterProjection/v1 — four-view composer ═══════════ */

  function composeBriefView(rawBrief) {
    if (!isPlainObject(rawBrief)) reject("RLMKT-PROJECTION", "$.brief", "brief input is required");
    var actions = Array.isArray(rawBrief.actions) ? rawBrief.actions : [];
    var imminentCatalysts = Array.isArray(rawBrief.imminentCatalysts) ? rawBrief.imminentCatalysts : [];
    var visibleLimitations = Array.isArray(rawBrief.visibleLimitations) ? rawBrief.visibleLimitations : [];
    var coverageComplete = rawBrief.coverageComplete === true;

    /* SCN-012-019: authored ToolBrief/v2 is gated; the composer refuses a claim of an
       authored/frozen-bundle Brief before Feature 002. */
    if (rawBrief.authored === true || rawBrief.frozenBundle === true) {
      reject("RLMKT-GATE", "$.brief.authored", "an authored/frozen-bundle Brief (ToolBrief/v2) is a Feature 002 dependency-pending gate, not a current capability");
    }

    /* native long-context disclosures default CLOSED. trigger/invalidation and any
       blocking limitation remain visible and are NOT disclosures. */
    var disclosures = (Array.isArray(rawBrief.disclosures) ? rawBrief.disclosures : []).map(function (disclosure, index) {
      if (!isPlainObject(disclosure) || !isNonEmptyString(disclosure.id)) reject("RLMKT-PROJECTION", "$.brief.disclosures[" + index + "].id", "each closed disclosure requires an id");
      return { id: disclosure.id, kind: isNonEmptyString(disclosure.kind) ? disclosure.kind : "detail", open: false, ref: isNonEmptyString(disclosure.ref) ? disclosure.ref : null };
    });

    var noAction = null;
    if (coverageComplete && actions.length === 0) {
      /* the no-action projection states the bar was not cleared and manufactures NOTHING. */
      noAction = {
        coverageComplete: true,
        statement: NO_ACTION_STATEMENT,
        fabricatedAction: false,
        fabricatedCatalyst: false,
        fabricatedConfidence: false
      };
    }

    return {
      viewId: "brief",
      window: isNonEmptyString(rawBrief.window) ? rawBrief.window : null,
      cutoffAt: isNonEmptyString(rawBrief.cutoffAt) ? rawBrief.cutoffAt : null,
      sourceTruth: isNonEmptyString(rawBrief.sourceTruth) ? rawBrief.sourceTruth : null,
      actions: actions,
      coverageComplete: coverageComplete,
      noAction: noAction,
      imminentCatalysts: imminentCatalysts,
      visibleLimitations: visibleLimitations,
      disclosures: disclosures,
      /* the current legacy payload may be shown only under its actual legacy provenance. */
      legacyProvenance: isNonEmptyString(rawBrief.legacyProvenance) ? rawBrief.legacyProvenance : "legacy-market-brief-payload",
      authorState: GATE.authoredBriefV2
    };
  }

  function composePortfolioView(rawPortfolio) {
    if (!isPlainObject(rawPortfolio)) reject("RLMKT-PROJECTION", "$.portfolio", "portfolio input is required");
    if (!isNonEmptyString(rawPortfolio.publicMatrixRef)) reject("RLMKT-PROJECTION", "$.portfolio.publicMatrixRef", "portfolio view requires a public matrix reference");
    return {
      viewId: "portfolio",
      publicMatrixRef: rawPortfolio.publicMatrixRef,
      privateOverlayState: GATE.privatePortfolioOverlay,
      browserCapability: {
        contractVersion: "portfolio-browser-capability/v1",
        localPrivateOverlaySupported: false,
        reason: "private RLPORTFOLIO overlay is gated to Feature 008 (Scope 13); only the public watchlist matrix is composed here"
      }
    };
  }

  function composeRedAlertView(rawRedAlert) {
    var source = isPlainObject(rawRedAlert) ? rawRedAlert : {};
    var alertRefs = Array.isArray(source.alertRefs) ? source.alertRefs : [];
    /* live publication is a Feature 002 dependency-pending gate. A projection that
       claims live publication is refused. */
    if (source.published === true) reject("RLMKT-GATE", "$.redAlert.published", "live Red Alert publication is a Feature 002 dependency-pending gate (Scope 12), not a current capability");
    return {
      viewId: "red-alert",
      alertRefs: alertRefs,
      /* an explicit empty projection is a valid outcome — no alert is honest. */
      emptyProjection: alertRefs.length === 0 ? { cutoffAt: isNonEmptyString(source.cutoffAt) ? source.cutoffAt : null, statement: "No candidate qualifies as a current Red Alert." } : null,
      publicationState: GATE.redAlertPublication
    };
  }

  function composeJourneyView(rawJourney) {
    if (!isPlainObject(rawJourney) || !Array.isArray(rawJourney.definitionRefs)) reject("RLMKT-PROJECTION", "$.journey.definitionRefs", "journey view requires the committed global journey definition refs");
    if (rawJourney.definitionRefs.length !== CENTER_VIEW_IDS.length) reject("RLMKT-PROJECTION", "$.journey.definitionRefs", "the Market Action Center exposes exactly four global journey goals");
    rawJourney.definitionRefs.forEach(function (ref, index) {
      if (!isNonEmptyString(ref)) reject("RLMKT-PROJECTION", "$.journey.definitionRefs[" + index + "]", "each journey definition ref must be a non-empty id");
    });
    return {
      viewId: "journey",
      definitionRefs: rawJourney.definitionRefs.slice(),
      /* the portfolio-stress journey's private prerequisite is blocked until Feature 008. */
      portfolioStressPrerequisiteState: GATE.privatePortfolioOverlay
    };
  }

  function composeCenterProjection(rawInput) {
    return capture(function () {
      if (!isPlainObject(rawInput)) reject("RLMKT-PROJECTION", "$", "projection input must be an object");
      assertNoPrivateField(rawInput, "$");

      if (!isNonEmptyString(rawInput.projectionId)) reject("RLMKT-PROJECTION", "$.projectionId", "projectionId is required");
      if (!isNonEmptyString(rawInput.generationRef)) reject("RLMKT-PROJECTION", "$.generationRef", "generationRef is required");
      if (!isNonEmptyString(rawInput.cutoffAt) || !ISO_PATTERN.test(rawInput.cutoffAt)) reject("RLMKT-PROJECTION", "$.cutoffAt", "cutoffAt must be an ISO timestamp");

      var activeView = isNonEmptyString(rawInput.activeView) ? rawInput.activeView : "brief";
      if (CENTER_VIEW_IDS.indexOf(activeView) === -1) reject("RLMKT-VIEW", "$.activeView", "the active view must be exactly one of brief|portfolio|red-alert|journey");

      var views = {
        brief: composeBriefView(rawInput.brief),
        portfolio: composePortfolioView(rawInput.portfolio),
        "red-alert": composeRedAlertView(rawInput.redAlert),
        journey: composeJourneyView(rawInput.journey)
      };

      var projection = {
        contractVersion: CONTRACT.projection,
        projectionId: rawInput.projectionId,
        generationRef: rawInput.generationRef,
        cutoffAt: rawInput.cutoffAt,
        viewOrder: CENTER_VIEW_IDS.slice(),
        viewState: { activeView: activeView },
        views: views,
        gates: {
          authoredBriefV2: GATE.authoredBriefV2,
          redAlertPublication: GATE.redAlertPublication,
          privatePortfolioOverlay: GATE.privatePortfolioOverlay
        },
        projectionFingerprint: null
      };
      projection.projectionFingerprint = fingerprint(Object.assign({}, projection, { projectionFingerprint: null }));
      return projection;
    });
  }

  function validateCenterProjection(projection) {
    return capture(function () {
      if (!isPlainObject(projection)) reject("RLMKT-PROJECTION", "$", "projection must be an object");
      if (projection.contractVersion !== CONTRACT.projection) reject("RLMKT-VERSION", "$.contractVersion", "unsupported projection contract version");
      assertNoPrivateField(projection, "$");

      /* EXACTLY the four top-level views, in the canonical order — no fifth/Simple/Power. */
      if (!Array.isArray(projection.viewOrder) || projection.viewOrder.length !== CENTER_VIEW_IDS.length) {
        reject("RLMKT-VIEW", "$.viewOrder", "the Market Action Center has exactly four top-level views");
      }
      projection.viewOrder.forEach(function (viewId, index) {
        if (viewId !== CENTER_VIEW_IDS[index]) reject("RLMKT-VIEW", "$.viewOrder[" + index + "]", "top-level view order must be exactly brief, portfolio, red-alert, journey");
      });
      if (!isPlainObject(projection.views)) reject("RLMKT-VIEW", "$.views", "views must be an object");
      var viewKeys = Object.keys(projection.views).sort();
      var expectedKeys = CENTER_VIEW_IDS.slice().sort();
      if (JSON.stringify(viewKeys) !== JSON.stringify(expectedKeys)) reject("RLMKT-VIEW", "$.views", "views must contain exactly brief, portfolio, red-alert, journey and no other top-level mode");

      if (!isPlainObject(projection.viewState) || CENTER_VIEW_IDS.indexOf(projection.viewState.activeView) === -1) {
        reject("RLMKT-VIEW", "$.viewState.activeView", "exactly one active view from the closed four-view set is required");
      }

      /* the exact dependency-pending gates must be present and unchanged. */
      if (!isPlainObject(projection.gates) || projection.gates.authoredBriefV2 !== GATE.authoredBriefV2 || projection.gates.redAlertPublication !== GATE.redAlertPublication || projection.gates.privatePortfolioOverlay !== GATE.privatePortfolioOverlay) {
        reject("RLMKT-GATE", "$.gates", "authored Brief v2, live Red Alert publication, and the private portfolio overlay must remain exact dependency-pending gates");
      }

      /* no-action Brief may never fabricate an action/catalyst/confidence. */
      var brief = projection.views.brief;
      if (isPlainObject(brief) && isPlainObject(brief.noAction)) {
        if (brief.actions && brief.actions.length !== 0) reject("RLMKT-NOACTION", "$.views.brief.actions", "a no-action Brief must carry zero actions");
        if (brief.noAction.statement !== NO_ACTION_STATEMENT || brief.noAction.fabricatedAction !== false || brief.noAction.fabricatedCatalyst !== false || brief.noAction.fabricatedConfidence !== false) {
          reject("RLMKT-NOACTION", "$.views.brief.noAction", "the no-action Brief must state the bar was not cleared and manufacture no action, catalyst, or confidence claim");
        }
      }

      return {
        contractVersion: CONTRACT.projection,
        projectionId: projection.projectionId,
        activeView: projection.viewState.activeView,
        viewCount: projection.viewOrder.length,
        gatesPending: 3,
        projectionFingerprint: projection.projectionFingerprint
      };
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     Scope 12 — Dynamic Red Alert discovery / qualification / projection engine.

     PURE and additive. Discovery starts ONLY from current public owner-read
     anomaly seeds; transmission channels are classification labels only and the
     engine carries NO named threat/entity/country/asset candidate list. A
     candidate becomes a visible Red Alert only when it clears all seven hard
     admission gates AND the exact explainable ADMISSION SCORE threshold — the
     total is an admission index, never a probability / confidence / crash-odds
     claim. A weak/alarmist/conflicted/stale/below-threshold candidate is a
     NON-throwing rejection (safe reason class + count only) that consumes no
     visible slot; contract-malformed or hostile input is a closed refusal.
     Live acquisition and public Red Alert publication stay gated to Feature 002
     (Scope 11); this engine produces fixture/local qualification only.
     ═══════════════════════════════════════════════════════════════════════ */

  var RED_ALERT_CONTRACT = Object.freeze({
    seed: "anomaly-seed/v1",
    candidate: "red-alert-candidate/v1",
    alert: "red-alert/v1",
    projection: "red-alert-projection/v1",
    empty: "red-alert-empty/v1",
    policy: "red-alert-policy/v1"
  });

  /* the eight allowed transmission channels — CLASSIFICATION LABELS ONLY. The
     registry contains no named threat; a channel cannot seed a candidate. */
  var TRANSMISSION_CHANNELS = Object.freeze([
    "rates-liquidity", "fx-carry", "credit-funding", "volatility-options",
    "commodities-energy", "breadth-market-structure",
    "geopolitical-supply-chain", "counterparty-operational"
  ]);

  var LIFECYCLE_STATES = Object.freeze([
    "discovered", "evidence-building", "qualified", "rejected",
    "acknowledged", "monitoring", "invalidated", "resolved", "stale"
  ]);

  /* the legal APPEND-ONLY lifecycle transitions. discovered -> evidence-building
     -> qualified | rejected, then qualified -> acknowledged -> monitoring ->
     invalidated | resolved | stale. 'stale' (evidence aging) is reachable from
     any live qualified state. */
  var LIFECYCLE_TRANSITIONS = Object.freeze({
    "discovered": ["evidence-building", "rejected"],
    "evidence-building": ["qualified", "rejected"],
    "qualified": ["acknowledged", "stale"],
    "acknowledged": ["monitoring", "stale"],
    "monitoring": ["invalidated", "resolved", "stale"],
    "rejected": [],
    "invalidated": [],
    "resolved": [],
    "stale": []
  });

  /* the closed safe rejection reason-class vocabulary. A rejected candidate is
     represented ONLY by these counts, never by its dramatic title/text. */
  var REJECTION_REASON_CLASSES = Object.freeze([
    "insufficient-corroboration", "no-observable-market-evidence",
    "incomplete-fields", "source-conflict", "stale-or-cutoff-mismatch",
    "score-below-threshold", "low-severity"
  ]);

  /* research-ONLY verbs. No execution / order / hedge-placement verb is allowed. */
  var RESEARCH_VERBS = Object.freeze([
    "monitor", "verify", "investigate", "scenario-test", "review-hedge-research", "trace-claims"
  ]);

  /* the embedded default policy MIRRORS market-brief.config.json "red-alert-policy/v1";
     scripts/validate-market-action.mjs proves the committed config equals this. */
  var DEFAULT_RED_ALERT_POLICY = deepFreeze({
    contractVersion: "red-alert-policy/v1",
    policyId: "red-alert-policy/v1",
    scoreThreshold: 75,
    visibleCap: 5,
    minSeverity: 4,
    minIndependentOrigins: 2,
    minOwnerEvidence: 1,
    components: {
      severity: { weight: 25 },
      likelihood: { weight: 15 },
      observableTransmission: { weight: 20, cap: 3 },
      evidenceStrength: { weight: 20, cap: 3 },
      imminence: { weight: 10 },
      falsifiabilityActionability: { weight: 10 }
    },
    horizonBands: [
      { id: "0-2w", maxDays: 14, bandScore: 1 },
      { id: "2-8w", maxDays: 56, bandScore: 0.7 },
      { id: "2-6m", maxDays: 180, bandScore: 0.4 },
      { id: ">6m", maxDays: null, bandScore: 0.2 }
    ],
    severityLabels: { "1": "informational", "2": "low", "3": "elevated", "4": "high", "5": "severe" },
    stalenessWindowDays: { source: 45, ownerEvidence: 21 }
  });

  var RED_ALERT_EMPTY_STATEMENT = "No current candidate cleared the Red Alert evidence bar for this window.";
  var RED_ALERT_METHOD_REF = "notes/market-brief.md#red-alert-qualification";
  /* forbidden alarmist certainty/urgency terms. Severity is text and restrained;
     no unsupported certainty/inevitability/urgency language may appear. */
  var FORBIDDEN_ALARMIST_TERMS = Object.freeze([
    "guaranteed", "inevitable", "certain to", "will definitely", "act now",
    "panic", "sure thing", "zero-risk", "cannot fail", "imminent crash", "catastrophic collapse"
  ]);
  /* structural hostile-shape detector for a discovery thesis (markup / injected
     instruction / URL / credential / shell / template-expansion). */
  var HOSTILE_SHAPE = /<\/?[a-z][\s\S]*>|ignore (all|previous) instructions|https?:\/\/|javascript:|api[_-]?key|rm -rf|\$\{/i;

  function round2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }
  function dedupeSort(arr) { var seen = Object.create(null); (arr || []).forEach(function (x) { seen[x] = true; }); return Object.keys(seen).sort(); }
  function resolveRedAlertPolicy(policy) { return isPlainObject(policy) ? policy : DEFAULT_RED_ALERT_POLICY; }
  function containsHostileShape(text) { return typeof text === "string" && HOSTILE_SHAPE.test(text); }
  function severityLabelFor(policy, level) {
    var labels = (policy && isPlainObject(policy.severityLabels)) ? policy.severityLabels : DEFAULT_RED_ALERT_POLICY.severityLabels;
    return isNonEmptyString(labels[String(level)]) ? labels[String(level)] : "unlabeled";
  }
  function horizonBandScore(policy, horizonId) {
    var bands = (policy && Array.isArray(policy.horizonBands)) ? policy.horizonBands : DEFAULT_RED_ALERT_POLICY.horizonBands;
    for (var i = 0; i < bands.length; i += 1) if (bands[i].id === horizonId) return bands[i].bandScore;
    return 0;
  }

  /* ── AnomalySeed/v1 ── */

  function normalizeAnomalySeed(seed, path) {
    if (!isPlainObject(seed)) reject("RLMKT-SEED", path, "anomaly seed must be an object");
    if (!isNonEmptyString(seed.seedId)) reject("RLMKT-SEED", path + ".seedId", "seedId is required");
    if (!isNonEmptyString(seed.ownerToolId)) reject("RLMKT-SEED", path + ".ownerToolId", "an anomaly seed must name its owning tool");
    if (!Array.isArray(seed.evidenceRefs) || seed.evidenceRefs.length === 0 || !seed.evidenceRefs.every(isNonEmptyString)) reject("RLMKT-SEED", path + ".evidenceRefs", "an anomaly seed requires at least one owner evidence ref");
    if (!isNonEmptyString(seed.observedCondition)) reject("RLMKT-SEED", path + ".observedCondition", "observedCondition is required");
    if (!Array.isArray(seed.normalizedEntities) || seed.normalizedEntities.length === 0 || !seed.normalizedEntities.every(isNonEmptyString)) reject("RLMKT-SEED", path + ".normalizedEntities", "an anomaly seed requires at least one normalized entity");
    if (!Array.isArray(seed.transmissionChannels) || seed.transmissionChannels.length === 0) reject("RLMKT-SEED", path + ".transmissionChannels", "an anomaly seed requires at least one transmission channel");
    seed.transmissionChannels.forEach(function (channel, i) {
      if (TRANSMISSION_CHANNELS.indexOf(channel) === -1) reject("RLMKT-SEED", path + ".transmissionChannels[" + i + "]", "unknown transmission channel (channels are classification labels only)");
    });
    if (!isNonEmptyString(seed.cutoffAt) || !ISO_PATTERN.test(seed.cutoffAt)) reject("RLMKT-SEED", path + ".cutoffAt", "cutoffAt must be an ISO timestamp");
    return {
      contractVersion: RED_ALERT_CONTRACT.seed,
      seedId: seed.seedId,
      ownerToolId: seed.ownerToolId,
      evidenceRefs: seed.evidenceRefs.slice(),
      observedCondition: seed.observedCondition,
      normalizedEntities: seed.normalizedEntities.slice(),
      transmissionChannels: seed.transmissionChannels.slice(),
      magnitudeOrState: isNonEmptyString(seed.magnitudeOrState) ? seed.magnitudeOrState : "unspecified",
      cutoffAt: seed.cutoffAt,
      freshness: isNonEmptyString(seed.freshness) ? seed.freshness : "current",
      limitations: Array.isArray(seed.limitations) ? seed.limitations.filter(isNonEmptyString) : []
    };
  }

  function validateAnomalySeed(seed) {
    return capture(function () { return normalizeAnomalySeed(seed, "$"); });
  }

  /* ── clustering (overlapping entities / shared evidence) ── */

  function clusterAnomalySeeds(seeds) {
    return capture(function () {
      if (!Array.isArray(seeds) || seeds.length === 0) reject("RLMKT-SEED", "$", "clustering requires a non-empty seed array");
      var normalized = seeds.map(function (s, i) { return normalizeAnomalySeed(s, "$[" + i + "]"); });
      var parent = normalized.map(function (_, i) { return i; });
      function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
      function union(a, b) { parent[find(a)] = find(b); }
      for (var i = 0; i < normalized.length; i += 1) {
        for (var j = i + 1; j < normalized.length; j += 1) {
          var shareEntity = normalized[i].normalizedEntities.some(function (e) { return normalized[j].normalizedEntities.indexOf(e) !== -1; });
          var shareEvidence = normalized[i].evidenceRefs.some(function (e) { return normalized[j].evidenceRefs.indexOf(e) !== -1; });
          if (shareEntity || shareEvidence) union(i, j);
        }
      }
      var groups = Object.create(null);
      normalized.forEach(function (s, i) {
        var root = find(i);
        if (!groups[root]) groups[root] = [];
        groups[root].push(s);
      });
      var clusters = Object.keys(groups).map(function (root, index) {
        var members = groups[root];
        var entities = Object.create(null), channels = Object.create(null), evidence = Object.create(null);
        members.forEach(function (m) {
          m.normalizedEntities.forEach(function (e) { entities[e] = true; });
          m.transmissionChannels.forEach(function (c) { channels[c] = true; });
          m.evidenceRefs.forEach(function (e) { evidence[e] = true; });
        });
        return {
          clusterId: "cluster/" + index,
          seedIds: members.map(function (m) { return m.seedId; }).sort(),
          ownerToolIds: dedupeSort(members.map(function (m) { return m.ownerToolId; })),
          normalizedEntities: Object.keys(entities).sort(),
          transmissionChannels: Object.keys(channels).sort(),
          evidenceRefs: Object.keys(evidence).sort(),
          cutoffAt: members[0].cutoffAt
        };
      });
      return { clusters: clusters };
    });
  }

  /* ── bounded public query-plan derivation (through Scope 10 render/acquire) ── */

  function buildQueryPlanInput(cluster, options) {
    return capture(function () {
      if (!isPlainObject(cluster) || !Array.isArray(cluster.normalizedEntities) || cluster.normalizedEntities.length === 0) reject("RLMKT-CANDIDATE", "$.cluster", "a query plan requires a cluster with observed entities");
      if (!Array.isArray(cluster.transmissionChannels) || cluster.transmissionChannels.length === 0) reject("RLMKT-CANDIDATE", "$.cluster.transmissionChannels", "a query plan requires the cluster's classified channels");
      var opts = isPlainObject(options) ? options : {};
      /* ONE bounded query per classified channel; terms DERIVE from observed
         entities only — never a hardcoded threat/topic term. */
      var terms = cluster.normalizedEntities.slice(0, 3).join(" ");
      var templates = cluster.transmissionChannels.map(function (channel, i) {
        return {
          templateId: "seed-derived/" + channel + "/" + i,
          termsTemplate: terms + " {{entity}}",
          purpose: "material-claim-corroboration",
          transmissionChannel: channel,
          allowedHosts: Array.isArray(opts.allowedHosts) ? opts.allowedHosts : [],
          requiredSourceClasses: Array.isArray(opts.requiredSourceClasses) ? opts.requiredSourceClasses : ["wire"],
          freshnessWindowDays: Number.isInteger(opts.freshnessWindowDays) ? opts.freshnessWindowDays : 7,
          maxResults: Number.isInteger(opts.maxResults) ? opts.maxResults : 4
        };
      });
      return {
        toolId: isNonEmptyString(opts.toolId) ? opts.toolId : "market-brief",
        runId: isNonEmptyString(opts.runId) ? opts.runId : ("run/red-alert/" + cluster.clusterId),
        cutoffAt: cluster.cutoffAt,
        clusterRef: cluster.clusterId,
        facts: { entity: cluster.normalizedEntities[0] },
        templates: templates
      };
    });
  }

  /* ── candidate assembly (derives channels / origins / owner-evidence from the frozen bundle) ── */

  function normalizePropagation(edges) {
    if (!Array.isArray(edges)) return [];
    return edges
      .filter(function (e) { return isPlainObject(e) && TRANSMISSION_CHANNELS.indexOf(e.from) !== -1 && TRANSMISSION_CHANNELS.indexOf(e.to) !== -1; })
      .map(function (e) { return { from: e.from, to: e.to }; });
  }

  function normalizeResearchActions(actions) {
    if (!Array.isArray(actions)) return [];
    return actions
      .filter(function (a) { return isPlainObject(a) && RESEARCH_VERBS.indexOf(a.verb) !== -1 && isNonEmptyString(a.detail); })
      .map(function (a) { return { verb: a.verb, detail: a.detail }; });
  }

  function buildCandidate(input) {
    if (!isPlainObject(input)) reject("RLMKT-CANDIDATE", "$", "candidate assembly input must be an object");
    var bundle = input.bundle;
    if (!isPlainObject(bundle) || bundle.contractVersion !== "web-evidence-bundle/v1" || !Array.isArray(bundle.claims)) reject("RLMKT-CANDIDATE", "$.bundle", "assembly requires a frozen web-evidence-bundle/v1 with claims");
    if (!isNonEmptyString(input.cutoffAt) || !ISO_PATTERN.test(input.cutoffAt)) reject("RLMKT-CANDIDATE", "$.cutoffAt", "cutoffAt must be an ISO timestamp");
    if (bundle.cutoffAt !== input.cutoffAt) reject("RLMKT-CANDIDATE", "$.cutoffAt", "the frozen bundle cutoff must match the candidate cutoff (cutoff compatibility)");
    if (!isNonEmptyString(input.thesis)) reject("RLMKT-CANDIDATE", "$.thesis", "a candidate requires a normalized thesis");
    if (containsHostileShape(input.thesis)) reject("RLMKT-CANDIDATE", "$.thesis", "thesis contains a forbidden instruction/markup/url shape");
    if (!Number.isInteger(input.severity) || input.severity < 1 || input.severity > 5) reject("RLMKT-CANDIDATE", "$.severity", "severity must be an integer 1..5");
    var li = input.likelihoodInterval;
    if (!Array.isArray(li) || li.length !== 2 || !li.every(function (n) { return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1; }) || li[0] > li[1]) reject("RLMKT-CANDIDATE", "$.likelihoodInterval", "likelihoodInterval must be a finite [lo,hi] within [0,1]");

    var mats = Array.isArray(input.materialClaims) ? input.materialClaims : [];
    if (mats.length === 0) reject("RLMKT-CANDIDATE", "$.materialClaims", "a candidate must reference at least one material claim");
    var byId = Object.create(null);
    bundle.claims.forEach(function (c) { if (isPlainObject(c) && isNonEmptyString(c.claimId)) byId[c.claimId] = c; });
    var claimRefs = [];
    var channels = Object.create(null);
    var originGroupUnion = Object.create(null);
    var ownerEvidence = Object.create(null);
    var materialEvaluation = mats.map(function (m, i) {
      if (!isPlainObject(m) || !isNonEmptyString(m.claimId)) reject("RLMKT-CANDIDATE", "$.materialClaims[" + i + "].claimId", "each material claim reference requires a claimId");
      if (TRANSMISSION_CHANNELS.indexOf(m.channel) === -1) reject("RLMKT-CANDIDATE", "$.materialClaims[" + i + "].channel", "each material claim must map to a known transmission channel");
      var claim = byId[m.claimId];
      if (!claim) reject("RLMKT-CANDIDATE", "$.materialClaims[" + i + "].claimId", "named material claim is absent from the frozen bundle");
      if (claim.materiality !== "material") reject("RLMKT-CANDIDATE", "$.materialClaims[" + i + "].claimId", "a candidate material claim must be a material bundle claim");
      claimRefs.push(m.claimId);
      channels[m.channel] = true;
      (Array.isArray(claim.independentOriginGroups) ? claim.independentOriginGroups : []).forEach(function (g) { originGroupUnion[g] = true; });
      (Array.isArray(claim.ownerEvidenceRefs) ? claim.ownerEvidenceRefs : []).forEach(function (r) { ownerEvidence[r] = true; });
      return {
        claimId: m.claimId,
        channel: m.channel,
        kind: isNonEmptyString(m.kind) ? m.kind : claim.claimKind,
        claimKind: claim.claimKind,
        originGroupCount: Array.isArray(claim.independentOriginGroups) ? claim.independentOriginGroups.length : 0,
        ownerEvidenceCount: Array.isArray(claim.ownerEvidenceRefs) ? claim.ownerEvidenceRefs.length : 0,
        corroborationState: isNonEmptyString(claim.corroborationState) ? claim.corroborationState : "uncorroborated",
        conflictState: isNonEmptyString(claim.conflictState) ? claim.conflictState : "consistent",
        freshnessState: isNonEmptyString(claim.freshnessState) ? claim.freshnessState : "unsupported"
      };
    });

    var candidate = {
      contractVersion: RED_ALERT_CONTRACT.candidate,
      candidateId: "candidate/" + (isNonEmptyString(input.clusterId) ? input.clusterId : "adhoc") + "/" + fingerprint(input.thesis).slice(7, 19),
      clusterId: isNonEmptyString(input.clusterId) ? input.clusterId : null,
      thesis: input.thesis,
      severity: input.severity,
      likelihoodInterval: [li[0], li[1]],
      horizon: isNonEmptyString(input.horizon) ? input.horizon : "",
      uncertainty: isNonEmptyString(input.uncertainty) ? input.uncertainty : "",
      whyNow: isNonEmptyString(input.whyNow) ? input.whyNow : "",
      trigger: isNonEmptyString(input.trigger) ? input.trigger : "",
      invalidation: isNonEmptyString(input.invalidation) ? input.invalidation : "",
      monitoring: isNonEmptyString(input.monitoring) ? input.monitoring : "",
      resolution: isNonEmptyString(input.resolution) ? input.resolution : "",
      propagation: normalizePropagation(input.propagation),
      affectedAssets: Array.isArray(input.affectedAssets) ? input.affectedAssets.filter(isNonEmptyString) : [],
      exposureClasses: Array.isArray(input.exposureClasses) ? input.exposureClasses.filter(isNonEmptyString) : [],
      researchActions: normalizeResearchActions(input.researchActions),
      channels: Object.keys(channels).sort(),
      claimRefs: claimRefs.slice().sort(),
      materialEvaluation: materialEvaluation,
      independentOriginGroupCount: Object.keys(originGroupUnion).length,
      ownerMarketEvidenceRefs: Object.keys(ownerEvidence).sort(),
      bundleRef: isNonEmptyString(bundle.bundleFingerprint) ? bundle.bundleFingerprint : bundle.bundleId,
      cutoffAt: input.cutoffAt,
      lifecycleState: "evidence-building",
      fingerprint: null
    };
    candidate.fingerprint = fingerprint(Object.assign({}, candidate, { fingerprint: null }));
    return candidate;
  }

  function assembleCandidate(input) {
    return capture(function () { return buildCandidate(input); });
  }

  /* ── explainable admission score (index, NEVER a probability) ── */

  /* a structural shape guard so a malformed candidate refuses with the precise
     code, never a coerced generic RLMKT-INPUT from a downstream TypeError. */
  function assertCandidateShape(candidate, code) {
    if (!isPlainObject(candidate) || candidate.contractVersion !== RED_ALERT_CONTRACT.candidate) reject(code, "$", "expected a red-alert-candidate/v1");
    if (!Number.isInteger(candidate.severity) || candidate.severity < 1 || candidate.severity > 5) reject(code, "$.severity", "candidate severity must be an integer 1..5");
    var li = candidate.likelihoodInterval;
    if (!Array.isArray(li) || li.length !== 2 || !li.every(function (n) { return typeof n === "number" && Number.isFinite(n); })) reject(code, "$.likelihoodInterval", "candidate likelihoodInterval must be a finite [lo,hi]");
    if (!Array.isArray(candidate.materialEvaluation) || !Array.isArray(candidate.propagation) || !Array.isArray(candidate.affectedAssets) || !Array.isArray(candidate.researchActions) || !Array.isArray(candidate.channels)) reject(code, "$", "candidate is structurally incomplete");
  }

  function computeScore(candidate, policy) {
    assertCandidateShape(candidate, "RLMKT-SCORE");
    var comp = policy.components;
    var mats = Array.isArray(candidate.materialEvaluation) ? candidate.materialEvaluation : [];
    var midpoint = (candidate.likelihoodInterval[0] + candidate.likelihoodInterval[1]) / 2;
    var verifiedChannels = Object.create(null);
    mats.forEach(function (m) { if (m.corroborationState === "corroborated" && m.freshnessState === "current") verifiedChannels[m.channel] = true; });
    var vc = Math.min(Object.keys(verifiedChannels).length, comp.observableTransmission.cap);
    var origins = mats.map(function (m) { return m.originGroupCount; });
    var meanOrigins = origins.length > 0 ? origins.reduce(function (s, n) { return s + n; }, 0) / origins.length : 0;
    var es = Math.min(meanOrigins, comp.evidenceStrength.cap);
    var band = horizonBandScore(policy, candidate.horizon);
    var falsifiers = [candidate.trigger, candidate.invalidation, candidate.monitoring, candidate.resolution].filter(isNonEmptyString).length + (candidate.researchActions.length > 0 ? 1 : 0);
    var rawSeverity = candidate.severity / 5 * comp.severity.weight;
    var rawLikelihood = midpoint * comp.likelihood.weight;
    var rawTransmission = vc / comp.observableTransmission.cap * comp.observableTransmission.weight;
    var rawEvidence = es / comp.evidenceStrength.cap * comp.evidenceStrength.weight;
    var rawImminence = band * comp.imminence.weight;
    var rawFalsifiability = falsifiers / 5 * comp.falsifiabilityActionability.weight;
    return {
      components: {
        severity: round2(rawSeverity),
        likelihood: round2(rawLikelihood),
        observableTransmission: round2(rawTransmission),
        evidenceStrength: round2(rawEvidence),
        imminence: round2(rawImminence),
        falsifiabilityActionability: round2(rawFalsifiability)
      },
      admissionScore: round2(rawSeverity + rawLikelihood + rawTransmission + rawEvidence + rawImminence + rawFalsifiability),
      verifiedChannelCount: Object.keys(verifiedChannels).length,
      meanOriginsPerMaterialClaim: round2(meanOrigins)
    };
  }

  function scoreCandidate(candidate, policy) {
    return capture(function () { return computeScore(candidate, resolveRedAlertPolicy(policy)); });
  }

  /* ── qualification (7 hard gates + score threshold; rejection is non-throwing) ── */

  function runQualification(candidate, policy) {
    assertCandidateShape(candidate, "RLMKT-CANDIDATE");
    var reasons = [];
    var mats = Array.isArray(candidate.materialEvaluation) ? candidate.materialEvaluation : [];
    /* gate 1: every material claim has >= minIndependentOrigins CURRENT origin
       groups (origins + freshness ONLY; owner evidence is gate 2, conflict is gate 5). */
    var gate1Pass = mats.length > 0 && mats.every(function (m) { return m.originGroupCount >= policy.minIndependentOrigins && m.freshnessState === "current"; });
    if (!gate1Pass) {
      if (mats.some(function (m) { return m.freshnessState === "stale" || m.freshnessState === "unsupported"; })) reasons.push("stale-or-cutoff-mismatch");
      if (mats.some(function (m) { return m.originGroupCount < policy.minIndependentOrigins; })) reasons.push("insufficient-corroboration");
    }
    /* gate 2: >= minOwnerEvidence owner market-evidence refs among market-state material claims. */
    var ownerEv = mats.filter(function (m) { return m.kind === "market-state" || m.claimKind === "market-state"; }).reduce(function (s, m) { return s + m.ownerEvidenceCount; }, 0);
    if (ownerEv < policy.minOwnerEvidence) reasons.push("no-observable-market-evidence");
    /* gate 3: severity >= minSeverity (finite likelihood interval enforced at assembly). */
    if (!(candidate.severity >= policy.minSeverity)) reasons.push("low-severity");
    /* gate 4: all falsifiable/complete fields present. */
    var complete = isNonEmptyString(candidate.thesis) && isNonEmptyString(candidate.whyNow) && isNonEmptyString(candidate.trigger) && isNonEmptyString(candidate.invalidation) && isNonEmptyString(candidate.monitoring) && isNonEmptyString(candidate.resolution) && isNonEmptyString(candidate.horizon) && isNonEmptyString(candidate.uncertainty) && candidate.propagation.length > 0 && candidate.affectedAssets.length > 0 && candidate.researchActions.length > 0;
    if (!complete) reasons.push("incomplete-fields");
    /* gate 5: no unresolved conflict changing the thesis (any conflicted material claim). */
    if (mats.some(function (m) { return m.conflictState === "conflicted" || m.corroborationState === "conflicted"; })) reasons.push("source-conflict");
    /* gate 6 (cutoff compatibility) enforced at assembly; the gate-1 stale path covers a stale material claim. */
    /* gate 7: admission score threshold. */
    var scored = computeScore(candidate, policy);
    if (scored.admissionScore < policy.scoreThreshold) reasons.push("score-below-threshold");

    var uniqueReasons = dedupeSort(reasons.filter(function (r) { return REJECTION_REASON_CLASSES.indexOf(r) !== -1; }));
    if (uniqueReasons.length > 0) {
      return { outcome: "rejected", reasonClasses: uniqueReasons, admissionScore: scored.admissionScore, scoreComponents: scored.components, alert: null };
    }
    return { outcome: "qualified", reasonClasses: [], admissionScore: scored.admissionScore, scoreComponents: scored.components, alert: buildAlert(candidate, scored, policy) };
  }

  function qualifyCandidate(candidate, policy) {
    return capture(function () { return runQualification(candidate, resolveRedAlertPolicy(policy)); });
  }

  /* ── semantic key + de-duplication + append-only lifecycle ── */

  function semanticKey(alertOrCandidate) {
    var x = isPlainObject(alertOrCandidate) ? alertOrCandidate : {};
    var key = {
      thesis: String(x.thesis || "").trim().toLowerCase(),
      channels: (Array.isArray(x.channels) ? x.channels.slice() : []).sort(),
      propagation: (Array.isArray(x.propagation) ? x.propagation.map(function (e) { return e.from + ">" + e.to; }) : []).sort(),
      assets: (Array.isArray(x.affectedAssets) ? x.affectedAssets.slice() : []).sort(),
      exposureClasses: (Array.isArray(x.exposureClasses) ? x.exposureClasses.slice() : []).sort()
    };
    return "redkey:" + sha256(canonicalize(key));
  }

  function sharesLineage(priorAlert, candidate) {
    var pa = Array.isArray(priorAlert.channels) ? priorAlert.channels : [];
    var ca = Array.isArray(candidate.channels) ? candidate.channels : [];
    var shareChannel = pa.some(function (c) { return ca.indexOf(c) !== -1; });
    var pAssets = Array.isArray(priorAlert.affectedAssets) ? priorAlert.affectedAssets : [];
    var cAssets = Array.isArray(candidate.affectedAssets) ? candidate.affectedAssets : [];
    var shareAsset = pAssets.some(function (x) { return cAssets.indexOf(x) !== -1; });
    return shareChannel && shareAsset && priorAlert.semanticKey !== semanticKey(candidate);
  }

  function dedupeCandidate(priorAlerts, candidate) {
    var key = semanticKey(candidate);
    var prior = Array.isArray(priorAlerts) ? priorAlerts : [];
    for (var i = 0; i < prior.length; i += 1) {
      if (isPlainObject(prior[i]) && prior[i].semanticKey === key) return { status: "duplicate", semanticKey: key };
    }
    for (var j = 0; j < prior.length; j += 1) {
      if (isPlainObject(prior[j]) && sharesLineage(prior[j], candidate)) return { status: "supersedes", semanticKey: key, supersededKey: prior[j].semanticKey };
    }
    return { status: "new", semanticKey: key };
  }

  function buildAlert(candidate, scored, policy) {
    var events = [
      { seq: 0, from: null, to: "discovered", at: candidate.cutoffAt, kind: "discovery", note: null },
      { seq: 1, from: "discovered", to: "evidence-building", at: candidate.cutoffAt, kind: "evidence", note: null },
      { seq: 2, from: "evidence-building", to: "qualified", at: candidate.cutoffAt, kind: "qualification", note: null }
    ];
    var alert = {
      contractVersion: RED_ALERT_CONTRACT.alert,
      alertId: "alert/" + candidate.candidateId,
      semanticKey: null,
      thesis: candidate.thesis,
      severityLevel: candidate.severity,
      severityLabel: severityLabelFor(policy, candidate.severity),
      likelihoodInterval: candidate.likelihoodInterval.slice(),
      horizon: candidate.horizon,
      uncertainty: candidate.uncertainty,
      affectedAssets: candidate.affectedAssets.slice(),
      exposureClasses: candidate.exposureClasses.slice(),
      propagation: candidate.propagation.map(function (e) { return { from: e.from, to: e.to }; }),
      whyNow: candidate.whyNow,
      trigger: candidate.trigger,
      invalidation: candidate.invalidation,
      monitoring: candidate.monitoring,
      resolution: candidate.resolution,
      channels: candidate.channels.slice(),
      claimRefs: candidate.claimRefs.slice(),
      independentOriginGroupCount: candidate.independentOriginGroupCount,
      ownerMarketEvidenceRefs: candidate.ownerMarketEvidenceRefs.slice(),
      researchActions: candidate.researchActions.map(function (a) { return { verb: a.verb, detail: a.detail }; }),
      admissionScore: scored.admissionScore,
      scoreComponents: scored.components,
      cutoffAt: candidate.cutoffAt,
      lifecycle: { state: "qualified", events: events },
      presentation: { severityText: true, flashing: false, pulse: false, alertRole: false, executeCommand: false },
      alertFingerprint: null
    };
    alert.semanticKey = semanticKey(alert);
    alert.alertFingerprint = fingerprint(Object.assign({}, alert, { alertFingerprint: null }));
    return alert;
  }

  function applyLifecycleEvent(alert, event) {
    return capture(function () {
      if (!isPlainObject(alert) || !isPlainObject(alert.lifecycle) || !isNonEmptyString(alert.lifecycle.state)) reject("RLMKT-LIFECYCLE", "$.alert", "a lifecycle transition requires an alert with a current lifecycle state");
      if (!isPlainObject(event) || LIFECYCLE_STATES.indexOf(event.to) === -1) reject("RLMKT-LIFECYCLE", "$.event.to", "a lifecycle event must target a known lifecycle state");
      var from = alert.lifecycle.state;
      var legal = LIFECYCLE_TRANSITIONS[from] || [];
      if (legal.indexOf(event.to) === -1) reject("RLMKT-LIFECYCLE", "$.event.to", "illegal lifecycle transition from " + from + " to " + event.to);
      var priorEvents = Array.isArray(alert.lifecycle.events) ? alert.lifecycle.events : [];
      var appended = priorEvents.slice();
      appended.push({ seq: priorEvents.length, from: from, to: event.to, at: isNonEmptyString(event.at) ? event.at : alert.cutoffAt, kind: isNonEmptyString(event.kind) ? event.kind : "transition", note: isNonEmptyString(event.note) ? event.note : null });
      var next = Object.assign({}, alert, { lifecycle: { state: event.to, events: appended }, alertFingerprint: null });
      next.alertFingerprint = fingerprint(Object.assign({}, next, { alertFingerprint: null }));
      return next;
    });
  }

  /* ── no-alarmism + round-trip validators ── */

  function assertNoAlarmism(alert) {
    var p = isPlainObject(alert.presentation) ? alert.presentation : {};
    if (p.severityText !== true || p.flashing !== false || p.pulse !== false || p.alertRole !== false || p.executeCommand !== false) {
      reject("RLMKT-ALARMISM", "$.presentation", "a Red Alert must render restrained text with no flashing/pulse/alert-role/execute control");
    }
    var haystack = [alert.thesis, alert.whyNow, alert.trigger, alert.invalidation].filter(isNonEmptyString).join(" ").toLowerCase();
    for (var i = 0; i < FORBIDDEN_ALARMIST_TERMS.length; i += 1) {
      if (haystack.indexOf(FORBIDDEN_ALARMIST_TERMS[i]) !== -1) reject("RLMKT-ALARMISM", "$.text", "a Red Alert must not use unsupported alarmist certainty/urgency language");
    }
  }

  function validateRedAlert(alert) {
    return capture(function () {
      if (!isPlainObject(alert) || alert.contractVersion !== RED_ALERT_CONTRACT.alert) reject("RLMKT-REDALERT", "$", "not a red-alert/v1");
      if (!isNonEmptyString(alert.thesis)) reject("RLMKT-REDALERT", "$.thesis", "thesis required");
      if (!(alert.severityLevel >= 4 && alert.severityLevel <= 5)) reject("RLMKT-REDALERT", "$.severityLevel", "a visible Red Alert is severity 4 or 5");
      ["whyNow", "trigger", "invalidation", "monitoring", "resolution", "horizon", "uncertainty"].forEach(function (field) {
        if (!isNonEmptyString(alert[field])) reject("RLMKT-REDALERT", "$." + field, "a visible Red Alert requires " + field);
      });
      if (!Array.isArray(alert.propagation) || alert.propagation.length === 0) reject("RLMKT-REDALERT", "$.propagation", "a visible Red Alert requires a propagation path");
      if (!Array.isArray(alert.researchActions) || alert.researchActions.length === 0) reject("RLMKT-REDALERT", "$.researchActions", "a visible Red Alert requires at least one research action");
      alert.researchActions.forEach(function (a, i) {
        if (!isPlainObject(a) || RESEARCH_VERBS.indexOf(a.verb) === -1) reject("RLMKT-ALARMISM", "$.researchActions[" + i + "].verb", "research actions must use research-only verbs (no execution command)");
      });
      assertNoAlarmism(alert);
      if (alert.alertFingerprint !== fingerprint(Object.assign({}, alert, { alertFingerprint: null }))) reject("RLMKT-REDALERT", "$.alertFingerprint", "alert fingerprint does not match its canonical content");
      return { contractVersion: RED_ALERT_CONTRACT.alert, alertId: alert.alertId, severityLevel: alert.severityLevel, admissionScore: alert.admissionScore, alarmismClean: true };
    });
  }

  function validateRedAlertProjection(projection) {
    return capture(function () {
      if (!isPlainObject(projection) || projection.contractVersion !== RED_ALERT_CONTRACT.projection) reject("RLMKT-REDALERT", "$", "not a red-alert-projection/v1");
      if (!Array.isArray(projection.visibleAlerts)) reject("RLMKT-REDALERT", "$.visibleAlerts", "visibleAlerts must be an array");
      if (projection.visibleAlerts.length > DEFAULT_RED_ALERT_POLICY.visibleCap) reject("RLMKT-REDALERT", "$.visibleAlerts", "visible Red Alerts exceed the cap of " + DEFAULT_RED_ALERT_POLICY.visibleCap);
      projection.visibleAlerts.forEach(function (alert, i) {
        var checked = validateRedAlert(alert);
        if (!checked.ok) reject(checked.error.code, "$.visibleAlerts[" + i + "]", checked.error.reason);
      });
      if (!isPlainObject(projection.rejections) || typeof projection.rejections.count !== "number") reject("RLMKT-REDALERT", "$.rejections", "a projection must report a safe rejection count");
      if (projection.visibleAlerts.length === 0 && !isPlainObject(projection.emptyState)) reject("RLMKT-REDALERT", "$.emptyState", "an empty projection must carry an explicit empty state");
      if (isPlainObject(projection.emptyState)) {
        if (projection.emptyState.statement !== RED_ALERT_EMPTY_STATEMENT) reject("RLMKT-REDALERT", "$.emptyState.statement", "the empty-state statement drifted from the exact copy");
        if (!Array.isArray(projection.emptyState.channelsReviewed)) reject("RLMKT-REDALERT", "$.emptyState.channelsReviewed", "the empty state must report the channels reviewed");
        if (!isNonEmptyString(projection.emptyState.methodRef)) reject("RLMKT-REDALERT", "$.emptyState.methodRef", "the empty state must link a method reference");
      }
      if (projection.publicationState !== GATE.redAlertPublication) reject("RLMKT-REDALERT", "$.publicationState", "live Red Alert publication must remain a Feature 002 dependency-pending gate");
      if (projection.projectionFingerprint !== fingerprint(Object.assign({}, projection, { projectionFingerprint: null }))) reject("RLMKT-REDALERT", "$.projectionFingerprint", "projection fingerprint does not match its canonical content");
      return { contractVersion: RED_ALERT_CONTRACT.projection, visibleCount: projection.visibleAlerts.length, rejectionCount: projection.rejections.count, empty: projection.visibleAlerts.length === 0 };
    });
  }

  /* ── top-level pipeline (cluster is done by caller; here we qualify + project) ── */

  function qualifyRedAlerts(input) {
    return capture(function () {
      if (!isPlainObject(input)) reject("RLMKT-REDALERT", "$", "projection input must be an object");
      if (!isNonEmptyString(input.projectionId)) reject("RLMKT-REDALERT", "$.projectionId", "projectionId is required");
      if (!isNonEmptyString(input.cutoffAt) || !ISO_PATTERN.test(input.cutoffAt)) reject("RLMKT-REDALERT", "$.cutoffAt", "cutoffAt must be an ISO timestamp");
      var policy = resolveRedAlertPolicy(input.policy);
      var seeds = Array.isArray(input.seeds) ? input.seeds.map(function (s, i) { return normalizeAnomalySeed(s, "$.seeds[" + i + "]"); }) : [];
      var candidateInputs = Array.isArray(input.candidateInputs) ? input.candidateInputs : [];

      var qualified = [];
      var rejections = { count: 0, byReasonClass: {} };
      candidateInputs.forEach(function (ci) {
        var candidate;
        try {
          candidate = buildCandidate(Object.assign({ cutoffAt: input.cutoffAt }, ci));
        } catch (buildError) {
          /* a malformed / hostile candidate becomes a SAFE rejection count — its
             raw title is never assembled into or projected onto the view. A real
             engine fault (non-refusal) is re-thrown so it cannot be swallowed. */
          if (!buildError || buildError.name !== "RlmktRefusal") throw buildError;
          rejections.count += 1;
          rejections.byReasonClass["incomplete-fields"] = (rejections.byReasonClass["incomplete-fields"] || 0) + 1;
          return;
        }
        var q = runQualification(candidate, policy);
        if (q.outcome === "qualified") {
          qualified.push(q.alert);
        } else {
          rejections.count += 1;
          q.reasonClasses.forEach(function (rc) { rejections.byReasonClass[rc] = (rejections.byReasonClass[rc] || 0) + 1; });
        }
      });
      qualified.sort(function (a, b) { return b.admissionScore - a.admissionScore; });
      var visible = qualified.slice(0, policy.visibleCap);
      var overflow = qualified.slice(policy.visibleCap).map(function (a) { return { alertId: a.alertId, semanticKey: a.semanticKey, admissionScore: a.admissionScore }; });

      var channelsReviewed = Array.isArray(input.channelsReviewed) && input.channelsReviewed.length > 0
        ? dedupeSort(input.channelsReviewed.filter(function (c) { return TRANSMISSION_CHANNELS.indexOf(c) !== -1; }))
        : dedupeSort(seeds.reduce(function (acc, s) { return acc.concat(s.transmissionChannels); }, []));
      var ownerCoverage = { toolsConsulted: dedupeSort(seeds.map(function (s) { return s.ownerToolId; })), anomalySeedCount: seeds.length };
      var lifecycleEvents = visible.reduce(function (acc, a) {
        return acc.concat(a.lifecycle.events.map(function (e) { return { alertKey: a.semanticKey, from: e.from, to: e.to, at: e.at, kind: e.kind }; }));
      }, []);

      var emptyState = null;
      if (visible.length === 0) {
        emptyState = {
          contractVersion: RED_ALERT_CONTRACT.empty,
          statement: RED_ALERT_EMPTY_STATEMENT,
          cutoffAt: input.cutoffAt,
          channelsReviewed: channelsReviewed,
          ownerCoverage: ownerCoverage,
          rejectionCount: rejections.count,
          methodRef: RED_ALERT_METHOD_REF
        };
      }

      var projection = {
        contractVersion: RED_ALERT_CONTRACT.projection,
        projectionId: input.projectionId,
        cutoffAt: input.cutoffAt,
        visibleAlerts: visible,
        overflowAlertRefs: overflow,
        rejections: rejections,
        emptyState: emptyState,
        channelsReviewed: channelsReviewed,
        ownerCoverage: ownerCoverage,
        lifecycleEvents: lifecycleEvents,
        publicationState: GATE.redAlertPublication,
        projectionFingerprint: null
      };
      projection.projectionFingerprint = fingerprint(Object.assign({}, projection, { projectionFingerprint: null }));
      return projection;
    });
  }

  /* ── latent-risk Journey bridge (Scope 12 · Scope 08 no-execution runtime) ──
     Extract the falsifiable EVIDENCE references from a qualified red-alert/v1 so
     the latent-risk Journey can CONSUME them through the Scope 08 runtime. This
     is a PURE data projection: it copies the alert's owner market-evidence and
     public claim references and its stable semantic identity — it holds no
     execution, publication, order, or private-holding authority of any kind, and
     it never mutates the alert it reads. The Journey uses the returned refs to
     complete or REJECT its single review step; a rejection changes only local
     review state and leaves the alert evidence untouched. */
  function buildLatentRiskEvidence(alert) {
    return capture(function () {
      if (!isPlainObject(alert) || alert.contractVersion !== RED_ALERT_CONTRACT.alert) reject("RLMKT-REDALERT", "$", "latent-risk evidence requires a qualified red-alert/v1");
      if (!isNonEmptyString(alert.semanticKey)) reject("RLMKT-REDALERT", "$.semanticKey", "a qualified alert must carry a stable semantic identity");
      if (!isNonEmptyString(alert.thesis)) reject("RLMKT-REDALERT", "$.thesis", "a qualified alert must carry a thesis");
      var ownerRefs = Array.isArray(alert.ownerMarketEvidenceRefs) ? alert.ownerMarketEvidenceRefs.slice() : [];
      if (ownerRefs.length < 1) reject("RLMKT-REDALERT", "$.ownerMarketEvidenceRefs", "a qualified alert must carry at least one owner market-evidence reference");
      var publicRefs = Array.isArray(alert.claimRefs) ? alert.claimRefs.slice() : [];
      return {
        contractVersion: "latent-risk-evidence/v1",
        evidenceIdentity: alert.semanticKey,
        publicTargetId: "market-brief",
        thesis: alert.thesis,
        ownerRefs: ownerRefs,
        publicRefs: publicRefs,
        severityLevel: alert.severityLevel,
        admissionScore: alert.admissionScore,
        noExecution: true,
        noPublication: true
      };
    });
  }

  /* ═══════════ frozen public API ═══════════ */

  return {
    CONTRACT: CONTRACT,
    CENTER_VIEW_IDS: CENTER_VIEW_IDS,
    CELL_STATES: CELL_STATES,
    APPLICABILITY: APPLICABILITY,
    MATRIX_DOMAINS: MATRIX_DOMAINS,
    PUBLIC_SCOPE_LABEL: PUBLIC_SCOPE_LABEL,
    GATE: GATE,
    REFUSAL_CODES: REFUSAL_CODES,
    PRIVATE_FIELD_ROOTS: PRIVATE_FIELD_ROOTS,
    NO_ACTION_STATEMENT: NO_ACTION_STATEMENT,
    canonicalize: canonicalize,
    fingerprint: fingerprint,
    composePublicMatrix: composePublicMatrix,
    validatePublicMatrix: validatePublicMatrix,
    composeCenterProjection: composeCenterProjection,
    validateCenterProjection: validateCenterProjection,
    /* Scope 12 — Red Alert engine. */
    RED_ALERT_CONTRACT: RED_ALERT_CONTRACT,
    TRANSMISSION_CHANNELS: TRANSMISSION_CHANNELS,
    LIFECYCLE_STATES: LIFECYCLE_STATES,
    REJECTION_REASON_CLASSES: REJECTION_REASON_CLASSES,
    RESEARCH_VERBS: RESEARCH_VERBS,
    DEFAULT_RED_ALERT_POLICY: DEFAULT_RED_ALERT_POLICY,
    RED_ALERT_EMPTY_STATEMENT: RED_ALERT_EMPTY_STATEMENT,
    validateAnomalySeed: validateAnomalySeed,
    clusterAnomalySeeds: clusterAnomalySeeds,
    buildQueryPlanInput: buildQueryPlanInput,
    assembleCandidate: assembleCandidate,
    scoreCandidate: scoreCandidate,
    qualifyCandidate: qualifyCandidate,
    semanticKey: semanticKey,
    dedupeCandidate: dedupeCandidate,
    applyLifecycleEvent: applyLifecycleEvent,
    qualifyRedAlerts: qualifyRedAlerts,
    validateRedAlert: validateRedAlert,
    validateRedAlertProjection: validateRedAlertProjection,
    buildLatentRiskEvidence: buildLatentRiskEvidence
  };
});
