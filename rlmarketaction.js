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
    "RLMKT-PROJECTION", "RLMKT-VIEW", "RLMKT-GATE", "RLMKT-NOACTION", "RLMKT-VERSION"
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
    validateCenterProjection: validateCenterProjection
  };
});
