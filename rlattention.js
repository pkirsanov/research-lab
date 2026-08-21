/*
 * rlattention.js
 * ------------------------------------------------------------------------
 * Feature 017 Scope 01 — Decision Attention capability module.
 *
 * ONE pure composer/validator for the DecisionAttention/v1 contract. It turns
 * an OBSERVED low-noise-gate result plus human-authored fields into a single
 * publishable attention item, or it REFUSES with a closed RLATTN-* code. There
 * is no partially-publishable item: a claim that cannot be falsified, cannot be
 * placed in a decision window, cannot name its transmission path, or carries an
 * unprovenanced figure does not reach the reader at all.
 *
 * Invariants this module holds:
 *   - It NEVER redefines the certified alert-engine lifecycle. The nine
 *     certified states are read from rlmarketaction.js at load time and the
 *     certified edges are preserved verbatim; the two new states (escalated,
 *     superseded) are APPEND-ONLY terminals that never travel upstream.
 *   - No clock and no randomness anywhere. Every instant is passed in.
 *     Ranking is a pure total order, byte-identical under any permutation.
 *   - Severity is recorded but is NOT part of the rank key: a severe claim with
 *     no identified channel ranks below a moderate one whose effect is arriving.
 *   - Absence is a value. An empty transmission path, an absent market
 *     confirmation and a missing provenance each refuse or carry an explicit
 *     marker; none of them ever renders as zero, blank or neutral.
 *   - toViewModel returns raw strings and booleans only. The caller escapes.
 *
 * Ships as a UMD dual module: Node (module.exports) for tests, and browser
 * global RLATTN for the tools.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) { module.exports = api; return; }
  if (typeof globalThis === "undefined") { throw new Error("RLATTN_BROWSER_GLOBAL_UNAVAILABLE"); }
  globalThis.RLATTN = api;
})(function () {
  "use strict";

  var CONTRACT_VERSION = "decision-attention/v1";
  var OUTCOME_CONTRACT_VERSION = "attention-outcome/v1";
  var INTERRUPTION_CONTRACT_VERSION = "interruption-rate/v1";

  /* published limits: a headline ceiling, a card ceiling, a minimum closed
     sample below which no interruption rate may be reported. */
  var LIMITS = Object.freeze({ headlineMaxChars: 120, attentionMaxCards: 7, minClosedSample: 20 });

  /* ── the external certified contract this module MUST NOT redefine ─────── */

  var CERTIFIED_STATES = Object.freeze([
    "discovered", "evidence-building", "qualified", "rejected",
    "acknowledged", "monitoring", "invalidated", "resolved", "stale"
  ]);

  /* verbatim copy of the certified edges — order is part of the contract. */
  var CERTIFIED_TRANSITIONS = Object.freeze({
    "discovered": Object.freeze(["evidence-building", "rejected"]),
    "evidence-building": Object.freeze(["qualified", "rejected"]),
    "qualified": Object.freeze(["acknowledged", "stale"]),
    "acknowledged": Object.freeze(["monitoring", "stale"]),
    "monitoring": Object.freeze(["invalidated", "resolved", "stale"]),
    "rejected": Object.freeze([]),
    "invalidated": Object.freeze([]),
    "resolved": Object.freeze([]),
    "stale": Object.freeze([])
  });

  var NEW_STATES = Object.freeze(["escalated", "superseded"]);

  /* the ONLY edges this module appends. Every one terminates in a new state:
     a live item may be escalated out of the attention surface, and any open
     item may be closed by a named successor. */
  var APPENDED_EDGES = Object.freeze({
    "discovered": Object.freeze(["superseded"]),
    "evidence-building": Object.freeze(["superseded"]),
    "qualified": Object.freeze(["escalated", "superseded"]),
    "acknowledged": Object.freeze(["escalated", "superseded"]),
    "monitoring": Object.freeze(["escalated", "superseded"])
  });

  /* ── upstream vocabulary resolution (load time) ────────────────────────── */

  var GLOBAL = (typeof globalThis === "object" && globalThis) ? globalThis : null;
  var upstreamModule = null;

  function upstream() {
    if (upstreamModule) return upstreamModule;
    if (GLOBAL && GLOBAL.RLMARKETACTIONCENTER) { upstreamModule = GLOBAL.RLMARKETACTIONCENTER; return upstreamModule; }
    if (typeof require === "function") { upstreamModule = require("./rlmarketaction.js"); return upstreamModule; }
    throw new Error("RLATTN-LIFECYCLE-DRIFT: the certified market-action vocabulary is unreachable");
  }

  function upstreamLifecycleStates() {
    var injected = GLOBAL ? GLOBAL.RLMARKETACTION : null;
    if (injected && Array.isArray(injected.LIFECYCLE_STATES)) return injected.LIFECYCLE_STATES.slice();
    var env = (typeof process === "object" && process && process.env)
      ? process.env.RLATTN_UPSTREAM_LIFECYCLE_STATES : null;
    if (typeof env === "string" && env.trim().length > 0) {
      return env.split(",").map(function (s) { return String(s).trim(); })
        .filter(function (s) { return s.length > 0; });
    }
    var mod = upstream();
    if (!mod || !Array.isArray(mod.LIFECYCLE_STATES)) {
      throw new Error("RLATTN-LIFECYCLE-DRIFT: the certified lifecycle vocabulary is unreadable upstream");
    }
    return mod.LIFECYCLE_STATES.slice();
  }

  /* identity assertion: a certified state that has vanished upstream means the
     alert engine and this surface no longer agree — refuse to load at all. */
  (function assertNoLifecycleDrift() {
    var observed = upstreamLifecycleStates();
    for (var i = 0; i < CERTIFIED_STATES.length; i++) {
      if (observed.indexOf(CERTIFIED_STATES[i]) === -1) {
        throw new Error("RLATTN-LIFECYCLE-DRIFT: upstream lifecycle vocabulary is missing the certified state \""
          + CERTIFIED_STATES[i] + "\"");
      }
    }
  })();

  var TRANSMISSION_CHANNELS = (function () {
    var mod = upstream();
    if (!mod || !Array.isArray(mod.TRANSMISSION_CHANNELS) || mod.TRANSMISSION_CHANNELS.length === 0) {
      throw new Error("RLATTN-LIFECYCLE-DRIFT: the certified transmission-channel vocabulary is unreadable upstream");
    }
    return Object.freeze(mod.TRANSMISSION_CHANNELS.slice());
  })();

  var RESEARCH_VERBS = (function () {
    var mod = upstream();
    if (!mod || !Array.isArray(mod.RESEARCH_VERBS) || mod.RESEARCH_VERBS.length === 0) {
      throw new Error("RLATTN-LIFECYCLE-DRIFT: the certified research-verb vocabulary is unreadable upstream");
    }
    return Object.freeze(mod.RESEARCH_VERBS.slice());
  })();

  /* ── this module's own closed vocabularies ─────────────────────────────── */

  var ATTENTION_LIFECYCLE_STATES = Object.freeze(CERTIFIED_STATES.concat(NEW_STATES));

  var ATTENTION_LIFECYCLE_TRANSITIONS = (function () {
    var out = {};
    for (var i = 0; i < CERTIFIED_STATES.length; i++) {
      var state = CERTIFIED_STATES[i];
      out[state] = Object.freeze(CERTIFIED_TRANSITIONS[state].concat(APPENDED_EDGES[state] || []));
    }
    for (var j = 0; j < NEW_STATES.length; j++) out[NEW_STATES[j]] = Object.freeze([]);
    return Object.freeze(out);
  })();

  var TERMINAL_STATES = Object.freeze(ATTENTION_LIFECYCLE_STATES.filter(function (s) {
    return ATTENTION_LIFECYCLE_TRANSITIONS[s].length === 0;
  }));

  var DECISION_WINDOWS = Object.freeze(["pre-market", "morning", "pre-close", "after-hours"]);

  var TERMINAL_OUTCOME_CLASSES = Object.freeze(["escalated", "confirmed", "resolved", "expired-without-effect"]);

  var REFUSAL_CODES = Object.freeze([
    "RLATTN-LIFECYCLE-DRIFT",
    "RLATTN-LIFECYCLE",
    "RLATTN-HEADLINE",
    "RLATTN-FALSIFIABILITY",
    "RLATTN-WINDOW",
    "RLATTN-DISPOSITION",
    "RLATTN-OVERLAP",
    "RLATTN-PRIVACY",
    "RLATTN-TRANSMISSION",
    "RLATTN-CONFIRMATION",
    "RLATTN-PROVENANCE",
    "RLATTN-VERB",
    "RLATTN-DEEPLINK"
  ]);

  /* only a non-committal gate disposition may become an attention item. */
  var ELIGIBLE_DISPOSITIONS = Object.freeze(["attention", "context", "no-action"]);

  var SEVERITIES = Object.freeze(["mild", "moderate", "severe"]);

  /* urgency ordering — the rank key. Severity is deliberately absent. */
  var IMMINENCE_ORDER = Object.freeze(["imminent", "developing", "latent"]);

  var CONFIRMATION_STATES = Object.freeze(["present", "absent", "partial"]);

  var ANCHORS = Object.freeze(["open", "close"]);

  /* fields that would turn a public read into a position disclosure. */
  var PRIVATE_FIELDS = Object.freeze(["size", "quantity", "costBasis", "pnl"]);

  /* ── small pure helpers ────────────────────────────────────────────────── */

  function isPlainObject(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
  function isNonEmptyString(v) { return typeof v === "string" && v.trim().length > 0; }
  function trimmed(v) { return typeof v === "string" ? v.trim() : ""; }
  /* The page a link addresses, with any section fragment removed. Only the
     fragment is dropped, so a hostile value still fails registry membership. */
  function pageOf(v) { return trimmed(v).split("#")[0]; }
  function isFiniteNumber(v) { return typeof v === "number" && isFinite(v); }

  function refuse(code, field, message) {
    return { ok: false, code: code, field: field, message: message };
  }

  function isIsoInstant(v) {
    if (!isNonEmptyString(v)) return false;
    var s = v.trim();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(s)) return false;
    return isFinite(Date.parse(s));
  }

  /* DISC-009-004. Tier-A refreshes the page's data several times a day; the attention items are
     recomposed only when the narrative is, so an item's observation can be older than the data
     shown around it. brief-refresh.mjs never writes the payload (the R-5 boundary), so the answer
     is not to recompose on the data path but to SAY SO: stale-but-stable is a fair contract only
     when the reader can see it. Pure and instant-based so the cockpit and the tests share it. */
  function observationFreshness(observedAt, asOf) {
    if (!isIsoInstant(observedAt) || !isIsoInstant(asOf)) return "unknown";
    var observed = Date.parse(observedAt);
    var current = Date.parse(asOf);
    if (observed >= current) return "current";
    return "behind-data";
  }

  function observationFreshnessNote(observedAt, asOf) {
    var state = observationFreshness(observedAt, asOf);
    if (state === "current") return null;
    if (state === "unknown") return "Observed: not stated by this item.";
    return "Observed " + observedAt + ", before the " + asOf + " data on this page. The reading still "
      + "stands as published and is not re-checked until the next full compose.";
  }

  function isIsoDate(v) {
    if (!isNonEmptyString(v)) return false;
    var s = v.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    return isFinite(Date.parse(s + "T00:00:00.000Z"));
  }

  function instantMs(v) { return Date.parse(String(v).trim()); }

  /* an explicit instant in, an explicit instant out — never a wall clock. */
  function shiftInstant(iso, minutes) {
    return new Date(instantMs(iso) + Math.round(minutes) * 60000).toISOString();
  }

  function hash32(str, basis) {
    var h = basis >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return ("0000000" + h.toString(16)).slice(-8);
  }

  function stableId(canonical) {
    return "attn-" + hash32(canonical, 2166136261) + hash32(canonical, 40389);
  }

  function findPrivateField(node, depth) {
    if (depth > 5 || node === null || typeof node !== "object") return null;
    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        var nested = findPrivateField(node[i], depth + 1);
        if (nested) return nested;
      }
      return null;
    }
    for (var k = 0; k < PRIVATE_FIELDS.length; k++) {
      if (Object.prototype.hasOwnProperty.call(node, PRIVATE_FIELDS[k])) return PRIVATE_FIELDS[k];
    }
    var keys = Object.keys(node);
    for (var j = 0; j < keys.length; j++) {
      var found = findPrivateField(node[keys[j]], depth + 1);
      if (found) return found;
    }
    return null;
  }

  /* ── decision window resolution ────────────────────────────────────────── */

  function sessionBoundary(session, spec) {
    var base = spec.anchor === "open" ? session.opensUtc : session.closesUtc;
    if (!isIsoInstant(base)) return null;
    return shiftInstant(base, spec.offsetMinutes);
  }

  function resolveDecisionWindow(windowId, tradingDateIso, calendarSource, windowVocabulary, options) {
    var opts = isPlainObject(options) ? options : {};

    if (!isNonEmptyString(windowId) || DECISION_WINDOWS.indexOf(trimmed(windowId)) === -1) {
      return refuse("RLATTN-WINDOW", "windowId", "the decision window is outside the declared window vocabulary");
    }
    var id = trimmed(windowId);

    if (!isPlainObject(windowVocabulary) || !isPlainObject(windowVocabulary[id])) {
      return refuse("RLATTN-WINDOW", "windowVocabulary", "the supplied window vocabulary declares no anchor for this window");
    }
    var spec = windowVocabulary[id];
    if (ANCHORS.indexOf(spec.anchor) === -1 || !isFiniteNumber(spec.offsetMinutes)) {
      return refuse("RLATTN-WINDOW", "windowVocabulary", "a window is an anchor plus an offset in minutes");
    }

    if (!isIsoDate(tradingDateIso)) {
      return refuse("RLATTN-WINDOW", "tradingDateIso", "the trading date is not a resolvable calendar date");
    }
    var date = trimmed(tradingDateIso);

    var sessions = (isPlainObject(calendarSource) && Array.isArray(calendarSource.sessions))
      ? calendarSource.sessions.filter(function (s) { return isPlainObject(s) && isIsoDate(s.tradingDate); })
      : [];
    if (sessions.length === 0) {
      return refuse("RLATTN-WINDOW", "calendarSource", "the supplied calendar declares no sessions");
    }

    var nowIso = isNonEmptyString(opts.nowIso) ? trimmed(opts.nowIso) : null;
    if (nowIso !== null && !isIsoInstant(nowIso)) {
      return refuse("RLATTN-WINDOW", "nowIso", "the supplied instant is not a resolvable timestamp");
    }

    var exact = null;
    for (var i = 0; i < sessions.length; i++) {
      if (trimmed(sessions[i].tradingDate) === date) { exact = sessions[i]; break; }
    }

    if (exact !== null) {
      var boundary = sessionBoundary(exact, spec);
      if (boundary === null) {
        return refuse("RLATTN-WINDOW", "calendarSource", "the observed session carries no resolvable anchor instant");
      }
      if (nowIso === null || instantMs(boundary) > instantMs(nowIso)) {
        return {
          ok: true, windowId: id, tradingDate: trimmed(exact.tradingDate), boundaryUtc: boundary,
          resolvedFrom: "session", anchor: spec.anchor, offsetMinutes: spec.offsetMinutes
        };
      }
    }

    /* a non-trading date, or an already-elapsed boundary, rolls forward to the
       next observed session rather than resolving into the past. */
    var next = null;
    for (var j = 0; j < sessions.length; j++) {
      var candidate = trimmed(sessions[j].tradingDate);
      if (candidate <= date) continue;
      if (next === null || candidate < trimmed(next.tradingDate)) next = sessions[j];
    }
    if (next === null) {
      return refuse("RLATTN-WINDOW", "tradingDateIso", "the supplied calendar declares no session on or after this date");
    }
    var nextBoundary = sessionBoundary(next, spec);
    if (nextBoundary === null) {
      return refuse("RLATTN-WINDOW", "calendarSource", "the next observed session carries no resolvable anchor instant");
    }
    return {
      ok: true, windowId: id, tradingDate: trimmed(next.tradingDate), boundaryUtc: nextBoundary,
      resolvedFrom: "next-session-open", anchor: spec.anchor, offsetMinutes: spec.offsetMinutes
    };
  }

  /* ── shared field rules, expressed once and used by build and validate ─── */

  function checkDisposition(disposition) {
    if (!isNonEmptyString(disposition) || ELIGIBLE_DISPOSITIONS.indexOf(trimmed(disposition)) === -1) {
      return refuse("RLATTN-DISPOSITION", "disposition", "only a non-committal gate disposition may become an attention item");
    }
    return null;
  }

  function checkSubject(subject, watchlistScope) {
    if (!isNonEmptyString(subject)) {
      return refuse("RLATTN-PRIVACY", "subject", "an attention item names a subject inside the public watchlist scope");
    }
    var scope = Array.isArray(watchlistScope) ? watchlistScope.map(trimmed) : [];
    if (scope.length === 0 || scope.indexOf(trimmed(subject)) === -1) {
      return refuse("RLATTN-PRIVACY", "subject", "the subject is outside the public watchlist scope");
    }
    return null;
  }

  function checkOverlap(subject, publishedActionSubjects) {
    var published = Array.isArray(publishedActionSubjects) ? publishedActionSubjects.map(trimmed) : [];
    if (published.indexOf(trimmed(subject)) !== -1) {
      return refuse("RLATTN-OVERLAP", "subject", "this subject is already published as an action and must not be surfaced twice");
    }
    return null;
  }

  function checkHeadline(headline) {
    if (!isNonEmptyString(headline)) {
      return refuse("RLATTN-HEADLINE", "headline", "an attention item carries a headline");
    }
    var length = trimmed(headline).length;
    if (length > LIMITS.headlineMaxChars) {
      return refuse("RLATTN-HEADLINE", "headline",
        "the headline exceeds the limit of " + LIMITS.headlineMaxChars + " characters (" + length + " characters)");
    }
    return null;
  }

  function checkFalsifiability(authored) {
    if (!isNonEmptyString(authored.invalidation)) {
      return refuse("RLATTN-FALSIFIABILITY", "invalidation", "an item that cannot be invalidated is not publishable");
    }
    if (!isNonEmptyString(authored.escalationTrigger)) {
      return refuse("RLATTN-FALSIFIABILITY", "escalationTrigger", "an item with no escalation trigger is not publishable");
    }
    if (!isIsoInstant(authored.expiry)) {
      return refuse("RLATTN-FALSIFIABILITY", "expiry", "an item with no resolvable expiry is not publishable");
    }
    return null;
  }

  function checkVerb(verb) {
    if (!isNonEmptyString(verb) || RESEARCH_VERBS.indexOf(trimmed(verb)) === -1) {
      return refuse("RLATTN-VERB", "verb", "an attention item uses a research verb only, never an execution command");
    }
    return null;
  }

  function checkHorizon(horizon) {
    if (!isNonEmptyString(horizon)) {
      return refuse("RLATTN-WINDOW", "horizon", "an attention item declares a horizon independently of its decision window");
    }
    return null;
  }

  /* An empty path is publishable only while the item is NOT claiming that the
     effect is already arriving; an imminent claim with no channel must say so. */
  /* FR-018. The link is checked against the registry-derived allowlist rather than
     accepted as written, for the same reason checkSubject checks watchlist scope: an
     item that could name its own destination could send a reader anywhere, and a
     fabricated link is indistinguishable from a real one once rendered. */
  function checkDeepLink(deepLink, toolDeepLinks) {
    if (!isNonEmptyString(deepLink)) {
      return refuse("RLATTN-DEEPLINK", "deepLink", "an attention item deep-links to the tool that owns its math");
    }
    var allowed = Array.isArray(toolDeepLinks) ? toolDeepLinks.map(pageOf) : [];
    /* Membership is a property of the PAGE. A link may address a section of a
       registered tool (bond-regime-lab.html#simple is a live toolReads value),
       and the browser's href guard already admits a fragment, so comparing the
       whole string would refuse a legitimate link and disagree with the render. */
    if (allowed.length === 0 || allowed.indexOf(pageOf(deepLink)) === -1) {
      return refuse("RLATTN-DEEPLINK", "deepLink", "the deep link is not a registered tool page");
    }
    return null;
  }

  function checkTransmission(path, absenceNote, imminence) {
    if (!Array.isArray(path)) {
      return refuse("RLATTN-TRANSMISSION", "transmissionPath", "the transmission path is a list of certified channels");
    }
    for (var i = 0; i < path.length; i++) {
      if (!isNonEmptyString(path[i]) || TRANSMISSION_CHANNELS.indexOf(trimmed(path[i])) === -1) {
        return refuse("RLATTN-TRANSMISSION", "transmissionPath", "a transmission channel outside the certified vocabulary cannot be invented");
      }
    }
    if (path.length === 0 && trimmed(imminence) === "imminent" && !isNonEmptyString(absenceNote)) {
      return refuse("RLATTN-TRANSMISSION", "transmissionAbsenceNote", "an arriving effect with no identified channel must state that absence explicitly");
    }
    return null;
  }

  function checkConfirmation(confirmation, note) {
    if (!isPlainObject(confirmation) || CONFIRMATION_STATES.indexOf(trimmed(confirmation.state)) === -1) {
      return refuse("RLATTN-CONFIRMATION", "marketConfirmation", "market confirmation carries an explicit state");
    }
    var state = trimmed(confirmation.state);
    if (state === "present" && !isNonEmptyString(confirmation.detail)) {
      return refuse("RLATTN-CONFIRMATION", "marketConfirmation", "a present confirmation names the observed instrument evidence");
    }
    if (state !== "present" && !isNonEmptyString(note)) {
      return refuse("RLATTN-CONFIRMATION", "marketConfirmationNote", "an unconfirmed item must say so explicitly rather than read as neutral");
    }
    return null;
  }

  function checkFigures(figures) {
    if (!Array.isArray(figures)) {
      return refuse("RLATTN-PROVENANCE", "figures", "figures are a list, each one carrying its own provenance");
    }
    for (var i = 0; i < figures.length; i++) {
      var fig = figures[i];
      if (!isPlainObject(fig) || !isNonEmptyString(fig.label) || !isNonEmptyString(String(fig.value))) {
        return refuse("RLATTN-PROVENANCE", "figures", "a figure carries a label and a value");
      }
      if (!isPlainObject(fig.provenance) || !isNonEmptyString(fig.provenance.sourceId) || !isIsoInstant(fig.provenance.asOf)) {
        return refuse("RLATTN-PROVENANCE", "figures", "a figure with no source and as-of instant does not render");
      }
    }
    return null;
  }

  function checkObservationQuality(gate) {
    if (!isNonEmptyString(gate.severity) || SEVERITIES.indexOf(trimmed(gate.severity)) === -1) {
      return refuse("RLATTN-PROVENANCE", "severity", "the observed severity is outside the declared vocabulary");
    }
    if (!isNonEmptyString(gate.imminence) || IMMINENCE_ORDER.indexOf(trimmed(gate.imminence)) === -1) {
      return refuse("RLATTN-PROVENANCE", "imminence", "the observed imminence is outside the declared vocabulary");
    }
    if (!isIsoInstant(gate.observedAt)) {
      return refuse("RLATTN-PROVENANCE", "observedAt", "an observation carries the instant it was observed");
    }
    return null;
  }

  /* ── build ─────────────────────────────────────────────────────────────── */

  function buildAttentionItem(gateResult, authored, context) {
    if (!isPlainObject(gateResult)) {
      return refuse("RLATTN-PROVENANCE", "gateResult", "an attention item is built from an observed gate result");
    }
    if (!isPlainObject(authored)) {
      return refuse("RLATTN-PROVENANCE", "authored", "an attention item carries human-authored falsifiability fields");
    }
    if (!isPlainObject(context)) {
      return refuse("RLATTN-PROVENANCE", "context", "an attention item resolves against an observed calendar and watchlist scope");
    }

    var failure = checkDisposition(gateResult.disposition);
    if (failure) return failure;

    var leaked = findPrivateField(gateResult, 0) || findPrivateField(authored, 0);
    if (leaked) {
      return refuse("RLATTN-PRIVACY", leaked, "a position field must never enter a public attention item");
    }

    failure = checkSubject(gateResult.subject, context.watchlistScope);
    if (failure) return failure;

    failure = checkOverlap(gateResult.subject, context.publishedActionSubjects);
    if (failure) return failure;

    failure = checkDeepLink(gateResult.deepLink, context.toolDeepLinks);
    if (failure) return failure;

    failure = checkHeadline(authored.headline);
    if (failure) return failure;

    failure = checkFalsifiability(authored);
    if (failure) return failure;

    failure = checkVerb(authored.verb);
    if (failure) return failure;

    failure = checkHorizon(authored.horizon);
    if (failure) return failure;

    failure = checkObservationQuality(gateResult);
    if (failure) return failure;

    var window = resolveDecisionWindow(authored.decisionWindow, context.tradingDateIso,
      context.calendarSource, context.windowVocabulary);
    if (window.ok !== true) {
      return refuse("RLATTN-WINDOW", "decisionWindow", window.message);
    }

    failure = checkTransmission(gateResult.transmissionPath, gateResult.transmissionAbsenceNote, gateResult.imminence);
    if (failure) return failure;

    failure = checkConfirmation(gateResult.marketConfirmation, gateResult.marketConfirmationNote);
    if (failure) return failure;

    failure = checkFigures(gateResult.figures);
    if (failure) return failure;

    if (!isNonEmptyString(authored.rationale)) {
      return refuse("RLATTN-PROVENANCE", "rationale", "an attention item states why the reader is being interrupted");
    }

    var subject = trimmed(gateResult.subject);
    var headline = trimmed(authored.headline);
    var observedAt = trimmed(gateResult.observedAt);
    var id = stableId([subject, headline, observedAt, window.windowId,
      trimmed(authored.horizon), trimmed(authored.verb)].join("\u0000"));

    var figures = Object.freeze(gateResult.figures.map(function (fig) {
      return Object.freeze({
        label: trimmed(fig.label),
        value: String(fig.value),
        provenance: Object.freeze({ sourceId: trimmed(fig.provenance.sourceId), asOf: trimmed(fig.provenance.asOf) })
      });
    }));

    var item = Object.freeze({
      contractVersion: CONTRACT_VERSION,
      id: id,
      gateId: isNonEmptyString(gateResult.gateId) ? trimmed(gateResult.gateId) : null,
      subject: subject,
      deepLink: trimmed(gateResult.deepLink),
      disposition: trimmed(gateResult.disposition),
      severity: trimmed(gateResult.severity),
      imminence: trimmed(gateResult.imminence),
      headline: headline,
      rationale: trimmed(authored.rationale),
      verb: trimmed(authored.verb),
      invalidation: trimmed(authored.invalidation),
      escalationTrigger: trimmed(authored.escalationTrigger),
      expiry: trimmed(authored.expiry),
      decisionWindow: window.windowId,
      windowBoundaryUtc: window.boundaryUtc,
      windowTradingDate: window.tradingDate,
      windowResolvedFrom: window.resolvedFrom,
      horizon: trimmed(authored.horizon),
      transmissionPath: Object.freeze(gateResult.transmissionPath.map(trimmed)),
      transmissionAbsenceNote: isNonEmptyString(gateResult.transmissionAbsenceNote)
        ? trimmed(gateResult.transmissionAbsenceNote) : null,
      marketConfirmation: Object.freeze({
        state: trimmed(gateResult.marketConfirmation.state),
        detail: isNonEmptyString(gateResult.marketConfirmation.detail)
          ? trimmed(gateResult.marketConfirmation.detail) : null
      }),
      marketConfirmationNote: isNonEmptyString(gateResult.marketConfirmationNote)
        ? trimmed(gateResult.marketConfirmationNote) : null,
      figures: figures,
      observedAt: observedAt,
      state: "discovered",
      supersededBy: null,
      lifecycle: Object.freeze([
        Object.freeze({ to: "discovered", at: observedAt, condition: "observed", ref: null })
      ])
    });

    return { ok: true, item: item };
  }

  /* ── validate ──────────────────────────────────────────────────────────── */

  function validateAttentionItem(item, context) {
    var violations = [];
    function record(failure) { if (failure) violations.push({ code: failure.code, field: failure.field, message: failure.message }); }

    if (!isPlainObject(item)) {
      return { ok: false, contractVersion: CONTRACT_VERSION, violations: Object.freeze([
        { code: "RLATTN-PROVENANCE", field: "item", message: "an attention item is an object" }
      ]) };
    }
    var ctx = isPlainObject(context) ? context : {};

    record(checkDisposition(item.disposition));
    var leaked = findPrivateField(item, 0);
    if (leaked) record(refuse("RLATTN-PRIVACY", leaked, "a position field must never enter a public attention item"));
    record(checkSubject(item.subject, ctx.watchlistScope));
    record(checkOverlap(item.subject, ctx.publishedActionSubjects));
    record(checkHeadline(item.headline));
    record(checkFalsifiability(item));
    record(checkVerb(item.verb));
    record(checkHorizon(item.horizon));
    record(checkObservationQuality(item));
    record(checkTransmission(item.transmissionPath, item.transmissionAbsenceNote, item.imminence));
    record(checkConfirmation(item.marketConfirmation, item.marketConfirmationNote));
    record(checkFigures(item.figures));
    /* FR-018 is a rule about PUBLISHED items, so the publish side has to enforce
       it too; build-side only left the gate accepting an absent link (A-017-10). */
    record(checkDeepLink(item.deepLink, ctx.toolDeepLinks));

    var window = resolveDecisionWindow(item.decisionWindow, ctx.tradingDateIso, ctx.calendarSource, ctx.windowVocabulary);
    if (window.ok !== true) record(refuse("RLATTN-WINDOW", "decisionWindow", window.message));

    if (!isNonEmptyString(item.state) || ATTENTION_LIFECYCLE_STATES.indexOf(item.state) === -1) {
      record(refuse("RLATTN-LIFECYCLE", "state", "the item state is outside the declared lifecycle"));
    }

    return { ok: violations.length === 0, contractVersion: CONTRACT_VERSION, violations: Object.freeze(violations) };
  }

  /* ── ranking ───────────────────────────────────────────────────────────── */

  function imminenceRank(item) {
    var idx = isPlainObject(item) ? IMMINENCE_ORDER.indexOf(trimmed(item.imminence)) : -1;
    return idx === -1 ? IMMINENCE_ORDER.length : idx;
  }

  function isMapped(item) {
    return isPlainObject(item) && Array.isArray(item.transmissionPath) && item.transmissionPath.length > 0;
  }

  function windowRank(item) {
    var idx = isPlainObject(item) ? DECISION_WINDOWS.indexOf(trimmed(item.decisionWindow)) : -1;
    return idx === -1 ? DECISION_WINDOWS.length : idx;
  }

  function channelRank(item) {
    if (!isMapped(item)) return TRANSMISSION_CHANNELS.length;
    var idx = TRANSMISSION_CHANNELS.indexOf(trimmed(item.transmissionPath[0]));
    return idx === -1 ? TRANSMISSION_CHANNELS.length : idx;
  }

  function compareStrings(a, b) { return a < b ? -1 : (a > b ? 1 : 0); }

  /* the rank key is urgency, then whether a channel is identified, then the
     decision window, then a deterministic identity tiebreak. Severity is not
     part of it: a loud claim with no channel does not jump the queue. */
  function compareItems(a, b) {
    var d = imminenceRank(a) - imminenceRank(b);
    if (d !== 0) return d;
    d = (isMapped(a) ? 0 : 1) - (isMapped(b) ? 0 : 1);
    if (d !== 0) return d;
    d = windowRank(a) - windowRank(b);
    if (d !== 0) return d;
    d = channelRank(a) - channelRank(b);
    if (d !== 0) return d;
    d = compareStrings(trimmed(a && a.subject), trimmed(b && b.subject));
    if (d !== 0) return d;
    d = compareStrings(trimmed(a && a.headline), trimmed(b && b.headline));
    if (d !== 0) return d;
    return compareStrings(trimmed(a && a.id), trimmed(b && b.id));
  }

  function rankAttentionItems(items) {
    var list = Array.isArray(items) ? items.slice() : [];
    return list.sort(compareItems);
  }

  /* an item is live on this tier only while it holds a declared lifecycle state
     that still has somewhere to go. A state the module does not recognise is
     never assumed to be live. */
  function isLiveAttentionItem(item) {
    return isPlainObject(item)
      && isNonEmptyString(item.state)
      && ATTENTION_LIFECYCLE_STATES.indexOf(item.state) !== -1
      && TERMINAL_STATES.indexOf(item.state) === -1;
  }

  function selectAttentionItems(items, cap) {
    var limit = isFiniteNumber(cap) && cap > 0 ? Math.floor(cap) : LIMITS.attentionMaxCards;
    /* an item that reached a terminal state stood down from this tier, so it is
       excluded BEFORE ranking and BEFORE the cap and is therefore absent from
       `suppressed` as well: `suppressed` is a cap-overflow set, not a rejection
       set, and nothing that left the tier was ever held back by the ceiling. */
    var live = (Array.isArray(items) ? items : []).filter(isLiveAttentionItem);
    var ranked = rankAttentionItems(live);
    var published = ranked.slice(0, Math.min(limit, ranked.length));
    var suppressed = ranked.slice(published.length);
    return {
      contractVersion: CONTRACT_VERSION,
      cap: limit,
      published: published,
      suppressed: suppressed,
      capApplied: suppressed.length > 0,
      emptyStatement: published.length === 0 ? "Nothing requires attention in this window." : null
    };
  }

  function subjectLabel(item) {
    return (isPlainObject(item) && isNonEmptyString(item.subject)) ? trimmed(item.subject) : "the other item";
  }

  function urgencyClause(item) {
    var imminence = isPlainObject(item) ? trimmed(item.imminence) : "";
    if (imminence === "imminent") return "its effect is already arriving";
    if (imminence === "developing") return "its effect is still developing";
    return "its effect is not yet in motion";
  }

  function channelClause(item) {
    return isMapped(item) ? "a transmission channel is identified" : "no transmission channel is identified";
  }

  function rankRationale(higher, lower) {
    var above = subjectLabel(higher);
    var below = subjectLabel(lower);
    var higherReason = urgencyClause(higher) + " and " + channelClause(higher);
    var lowerReason = urgencyClause(lower) + " and " + channelClause(lower);

    if (above !== below) {
      return above + " is placed above " + below + " because " + higherReason
        + ", while for " + below + " " + lowerReason + ".";
    }

    /* F-017-04. Two items may legitimately share a ticker, and the comparative
       mirror then ranks a name against itself: "QQQ is placed above QQQ
       because R, while for QQQ R." When the reasons match too it states one
       fact twice and explains nothing, which costs the reader more than
       silence. Sharing a subject is valid, so the repair belongs in the
       sentence and never in a uniqueness rule. */
    if (higherReason === lowerReason) {
      return above + " is placed here because " + higherReason
        + "; the item below it stands on the same footing.";
    }
    return above + " is placed above a second " + below + " item because " + higherReason
      + ", while for the second " + lowerReason + ".";
  }

  /* ── lifecycle ─────────────────────────────────────────────────────────── */

  function applyAttentionLifecycleEvent(item, event) {
    if (!isPlainObject(item) || !isNonEmptyString(item.state) || ATTENTION_LIFECYCLE_STATES.indexOf(item.state) === -1) {
      return refuse("RLATTN-LIFECYCLE", "item", "a lifecycle event applies to an item in a known state");
    }
    if (!isPlainObject(event)) {
      return refuse("RLATTN-LIFECYCLE", "event", "a lifecycle event is an object");
    }
    if (!isNonEmptyString(event.to) || ATTENTION_LIFECYCLE_STATES.indexOf(trimmed(event.to)) === -1) {
      return refuse("RLATTN-LIFECYCLE", "event.to", "the target state is outside the declared lifecycle");
    }
    var to = trimmed(event.to);
    var legal = ATTENTION_LIFECYCLE_TRANSITIONS[item.state] || [];
    if (legal.indexOf(to) === -1) {
      return refuse("RLATTN-LIFECYCLE", "event.to", "this edge is not declared in the append-only lifecycle");
    }
    if (!isIsoInstant(event.at)) {
      return refuse("RLATTN-LIFECYCLE", "event.at", "a lifecycle event carries the instant it occurred");
    }
    if (!isNonEmptyString(event.condition)) {
      return refuse("RLATTN-LIFECYCLE", "event.condition", "a lifecycle event names the condition that caused it");
    }

    var history = Array.isArray(item.lifecycle) ? item.lifecycle.slice() : [];
    var last = history.length > 0 ? history[history.length - 1] : null;
    if (last && isIsoInstant(last.at) && instantMs(trimmed(event.at)) < instantMs(trimmed(last.at))) {
      return refuse("RLATTN-LIFECYCLE", "event.at", "lifecycle history is append-only and cannot move backwards in time");
    }

    var ref = isNonEmptyString(event.ref) ? trimmed(event.ref) : null;
    if (to === "superseded" && ref === null) {
      return refuse("RLATTN-LIFECYCLE", "event.ref", "a superseding close must name its successor");
    }

    history.push(Object.freeze({ to: to, at: trimmed(event.at), condition: trimmed(event.condition), ref: ref }));

    var next = {};
    var keys = Object.keys(item);
    for (var i = 0; i < keys.length; i++) next[keys[i]] = item[keys[i]];
    next.state = to;
    next.lifecycle = Object.freeze(history);
    next.supersededBy = to === "superseded" ? ref : (item.supersededBy || null);

    return { ok: true, item: Object.freeze(next) };
  }

  function deriveOutcomeRecord(item, closure) {
    if (!isPlainObject(item) || !isNonEmptyString(item.state) || ATTENTION_LIFECYCLE_STATES.indexOf(item.state) === -1) {
      return refuse("RLATTN-LIFECYCLE", "item", "an outcome record derives from an item in a known state");
    }
    if (TERMINAL_STATES.indexOf(item.state) === -1) {
      return refuse("RLATTN-LIFECYCLE", "item.state", "an open item has no outcome yet");
    }
    if (!isPlainObject(closure)) {
      return refuse("RLATTN-LIFECYCLE", "closure", "an outcome record carries its closure");
    }
    if (!isIsoInstant(closure.closedAt)) {
      return refuse("RLATTN-LIFECYCLE", "closure.closedAt", "a closure carries the instant the item closed");
    }
    if (!isNonEmptyString(closure.outcomeClass) || TERMINAL_OUTCOME_CLASSES.indexOf(trimmed(closure.outcomeClass)) === -1) {
      return refuse("RLATTN-LIFECYCLE", "closure.outcomeClass", "the outcome class is outside the declared vocabulary");
    }
    if (!isNonEmptyString(closure.note)) {
      return refuse("RLATTN-LIFECYCLE", "closure.note", "a closure states what actually happened");
    }

    return {
      ok: true,
      record: Object.freeze({
        contractVersion: OUTCOME_CONTRACT_VERSION,
        itemId: isNonEmptyString(item.id) ? trimmed(item.id) : null,
        subject: isNonEmptyString(item.subject) ? trimmed(item.subject) : null,
        state: item.state,
        outcomeClass: trimmed(closure.outcomeClass),
        openedAt: isIsoInstant(item.observedAt) ? trimmed(item.observedAt) : null,
        closedAt: trimmed(closure.closedAt),
        decisionWindow: isNonEmptyString(item.decisionWindow) ? trimmed(item.decisionWindow) : null,
        supersededBy: isNonEmptyString(item.supersededBy) ? trimmed(item.supersededBy) : null,
        note: trimmed(closure.note)
      })
    };
  }

  /* the share of closed interruptions that turned out to matter. Below the
     minimum closed sample there is no rate at all, never a flattering zero.
     Both sides publish together: reporting only the warranted share would put
     the hits in front of the reader and leave the wasted interruptions out. */
  function computeInterruptionRate(records, policy, asOfIso) {
    var minClosedSample = (isPlainObject(policy) && isFiniteNumber(policy.minClosedSample))
      ? Math.floor(policy.minClosedSample) : LIMITS.minClosedSample;
    var list = Array.isArray(records) ? records.filter(isPlainObject) : [];
    var closed = list.filter(function (r) { return TERMINAL_OUTCOME_CLASSES.indexOf(trimmed(r.outcomeClass)) !== -1; });
    var effective = closed.filter(function (r) { return trimmed(r.outcomeClass) !== "expired-without-effect"; });
    var expiredWithoutEffect = closed.length - effective.length;
    var sufficientSample = minClosedSample > 0 && closed.length >= minClosedSample;
    var warrantedShare = sufficientSample ? effective.length / closed.length : null;

    return Object.freeze({
      contractVersion: INTERRUPTION_CONTRACT_VERSION,
      asOf: isIsoInstant(asOfIso) ? trimmed(asOfIso) : null,
      closedSample: closed.length,
      minClosedSample: minClosedSample,
      sufficientSample: sufficientSample,
      effectiveCount: effective.length,
      expiredWithoutEffectCount: expiredWithoutEffect,
      rate: warrantedShare,
      warrantedShare: warrantedShare,
      expiredWithoutEffectShare: sufficientSample ? expiredWithoutEffect / closed.length : null,
      statement: sufficientSample
        ? "Of the closed attention items, " + effective.length + " of " + closed.length
          + " turned out to matter and " + expiredWithoutEffect + " expired without effect."
        : "The closed sample is too small to report an interruption rate."
    });
  }

  /* ── view model: raw strings and booleans only, the caller escapes ─────── */

  function toViewModel(item, context) {
    if (!isPlainObject(item)) return null;
    var ctx = isPlainObject(context) ? context : {};
    var figures = Array.isArray(item.figures) ? item.figures.filter(function (fig) {
      return isPlainObject(fig) && isPlainObject(fig.provenance)
        && isNonEmptyString(fig.provenance.sourceId) && isNonEmptyString(fig.provenance.asOf);
    }) : [];

    return {
      contractVersion: CONTRACT_VERSION,
      id: isNonEmptyString(item.id) ? trimmed(item.id) : null,
      subject: isNonEmptyString(item.subject) ? trimmed(item.subject) : null,
      headline: isNonEmptyString(item.headline) ? trimmed(item.headline) : null,
      rationale: isNonEmptyString(item.rationale) ? trimmed(item.rationale) : null,
      verb: isNonEmptyString(item.verb) ? trimmed(item.verb) : null,
      severity: isNonEmptyString(item.severity) ? trimmed(item.severity) : null,
      imminence: isNonEmptyString(item.imminence) ? trimmed(item.imminence) : null,
      decisionWindow: isNonEmptyString(item.decisionWindow) ? trimmed(item.decisionWindow) : null,
      windowBoundaryUtc: isIsoInstant(item.windowBoundaryUtc) ? trimmed(item.windowBoundaryUtc) : null,
      windowTradingDate: isIsoDate(item.windowTradingDate) ? trimmed(item.windowTradingDate) : null,
      windowResolvedFrom: isNonEmptyString(item.windowResolvedFrom) ? trimmed(item.windowResolvedFrom) : null,
      horizon: isNonEmptyString(item.horizon) ? trimmed(item.horizon) : null,
      invalidation: isNonEmptyString(item.invalidation) ? trimmed(item.invalidation) : null,
      escalationTrigger: isNonEmptyString(item.escalationTrigger) ? trimmed(item.escalationTrigger) : null,
      expiry: isIsoInstant(item.expiry) ? trimmed(item.expiry) : null,
      state: isNonEmptyString(item.state) ? trimmed(item.state) : null,
      supersededBy: isNonEmptyString(item.supersededBy) ? trimmed(item.supersededBy) : null,
      transmissionPath: Array.isArray(item.transmissionPath) ? item.transmissionPath.map(trimmed) : [],
      transmissionMapped: isMapped(item),
      transmissionAbsenceNote: isNonEmptyString(item.transmissionAbsenceNote) ? trimmed(item.transmissionAbsenceNote) : null,
      marketConfirmationState: (isPlainObject(item.marketConfirmation) && isNonEmptyString(item.marketConfirmation.state))
        ? trimmed(item.marketConfirmation.state) : null,
      marketConfirmationDetail: (isPlainObject(item.marketConfirmation) && isNonEmptyString(item.marketConfirmation.detail))
        ? trimmed(item.marketConfirmation.detail) : null,
      marketConfirmationNote: isNonEmptyString(item.marketConfirmationNote) ? trimmed(item.marketConfirmationNote) : null,
      marketConfirmed: isPlainObject(item.marketConfirmation) && trimmed(item.marketConfirmation.state) === "present",
      observedAt: isIsoInstant(item.observedAt) ? trimmed(item.observedAt) : null,
      inWatchlistScope: Array.isArray(ctx.watchlistScope)
        ? ctx.watchlistScope.map(trimmed).indexOf(trimmed(item.subject)) !== -1 : false,
      figures: figures.map(function (fig) {
        return {
          label: trimmed(fig.label),
          value: String(fig.value),
          provenance: { sourceId: trimmed(fig.provenance.sourceId), asOf: trimmed(fig.provenance.asOf) }
        };
      })
    };
  }

  return {
    CONTRACT_VERSION: CONTRACT_VERSION,
    ATTENTION_LIFECYCLE_STATES: ATTENTION_LIFECYCLE_STATES,
    ATTENTION_LIFECYCLE_TRANSITIONS: ATTENTION_LIFECYCLE_TRANSITIONS,
    DECISION_WINDOWS: DECISION_WINDOWS,
    /* exported so the authoring instruction's worked example can be proven against the SAME
       predicate the expiry check refuses on, rather than against a restated regex. */
    isIsoInstant: isIsoInstant,
    observationFreshness: observationFreshness,
    observationFreshnessNote: observationFreshnessNote,
    /* exported so the authoring instruction can be RENDERED from the same frozen array
       checkVerb refuses on, rather than keeping a second copy that drifts. */
    RESEARCH_VERBS: RESEARCH_VERBS,
    /* exported so the authoring instruction can render the headline cap from the SAME
       frozen limit checkHeadline refuses on, rather than restating the number. */
    LIMITS: LIMITS,
    TERMINAL_OUTCOME_CLASSES: TERMINAL_OUTCOME_CLASSES,
    REFUSAL_CODES: REFUSAL_CODES,
    resolveDecisionWindow: resolveDecisionWindow,
    buildAttentionItem: buildAttentionItem,
    validateAttentionItem: validateAttentionItem,
    rankAttentionItems: rankAttentionItems,
    selectAttentionItems: selectAttentionItems,
    rankRationale: rankRationale,
    applyAttentionLifecycleEvent: applyAttentionLifecycleEvent,
    deriveOutcomeRecord: deriveOutcomeRecord,
    computeInterruptionRate: computeInterruptionRate,
    toViewModel: toViewModel
  };
});
