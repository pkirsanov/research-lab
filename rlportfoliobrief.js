/* rlportfoliobrief.js — Feature 008 Scope 05: four-window direct-scope Portfolio Brief composer.
 *
 * This module composes a LOCAL brief from PUBLIC generic evidence. It is deliberately pure: it
 * performs no I/O, holds no state, and never writes anywhere. Callers hand it the generic window
 * contract and the local workspace facts, and it returns a projection.
 *
 * Three invariants shape every branch, and each one prevents a failure that looks harmless:
 *
 *   1. CUTOFF INTEGRITY. An observation later than the window's cutoff is excluded and COUNTED.
 *      Letting a later observation into an earlier window makes that brief secretly clairvoyant,
 *      which destroys any later ability to audit what was knowable at the time.
 *
 *   2. LANE SEPARATION. Held, watchlist, completed-research and inferred-relevance are separate
 *      because they qualify for different reasons and carry different authority. Merging them lets
 *      an inferred interest read as an owned position, and lets an owned position read as proof of
 *      preference. Both directions are wrong, so both are asserted against.
 *
 *   3. FLOOR HONESTY. Below the declared behavior floor the inferred lane is EMPTY and the
 *      shortfall is named with its actual counts. Filling it manufactures the appearance of
 *      personalisation out of too little history.
 *
 * The window contract is READ from the generic public config. This module never declares its own
 * windows, because a second copy of the schedule is a second source of truth that will drift.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  root.RLPORTFOLIOBRIEF = api;
  if (typeof module === "object" && module && typeof module.exports === "object") module.exports = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var CONTRACT_VERSION = "rl-portfolio-brief/v1";

  /* Authority order, highest first. A subject that qualifies more than once is placed in the
     highest lane ONCE and discloses the others, rather than being duplicated or silently dropped. */
  var LANE_ORDER = ["held", "watchlist", "completedResearch", "inferredRelevance"];
  var LANE_SOURCE = {
    held: "direct-holding",
    watchlist: "direct-watchlist",
    completedResearch: "direct-completed-research",
    inferredRelevance: "behavior-derived"
  };

  function ok(value) { return { ok: true, value: value }; }
  function err(code, reason, field) { return { ok: false, error: { code: code, reason: reason, field: field || null } }; }

  function isObject(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
  function isIso(value) { return typeof value === "string" && isFinite(Date.parse(value)); }

  /* The cutoff is the window's exact ET time on the evidence date. ET is UTC-4 during the
     daylight-saving period the market calendar uses for these windows; the offset is taken from
     the caller when supplied so this stays correct rather than assuming one half of the year. */
  function cutoffFor(window, referenceIso, etOffsetMinutes) {
    var parts = String(window.etTime || "").split(":");
    if (parts.length !== 2) return null;
    var day = referenceIso.slice(0, 10);
    var offset = isFinite(etOffsetMinutes) ? etOffsetMinutes : -240;
    var utcMs = Date.parse(day + "T" + parts[0] + ":" + parts[1] + ":00.000Z") - offset * 60000;
    return isFinite(utcMs) ? new Date(utcMs).toISOString() : null;
  }

  function distinctCount(list, pick) {
    var seen = {};
    list.forEach(function (entry) {
      var key = pick(entry);
      if (key) seen[String(key)] = true;
    });
    return Object.keys(seen).length;
  }

  /* Behaviour must clear BOTH floors. Requiring distinct dates as well as distinct completions is
     what stops a single burst of activity in one sitting from reading as a sustained interest. */
  function evaluateFloor(completions, behaviorPolicy) {
    var distinctCompletions = distinctCount(completions, function (c) { return c && c.subjectId; });
    var distinctUtcDates = distinctCount(completions, function (c) {
      return c && isIso(c.completedAt) ? c.completedAt.slice(0, 10) : null;
    });
    var requiredCompletions = behaviorPolicy.minimumDistinctCompletions;
    var requiredUtcDates = behaviorPolicy.minimumDistinctUtcDates;
    return {
      distinctCompletions: distinctCompletions,
      requiredCompletions: requiredCompletions,
      distinctUtcDates: distinctUtcDates,
      requiredUtcDates: requiredUtcDates,
      satisfied: distinctCompletions >= requiredCompletions && distinctUtcDates >= requiredUtcDates
    };
  }

  function composeBrief(input) {
    if (!isObject(input)) return err("P008-BRIEF-INPUT", "input-object-required", "input");
    if (!Array.isArray(input.windows) || !input.windows.length) return err("P008-BRIEF-WINDOWS", "generic-window-contract-required", "windows");
    if (!isObject(input.policy) || !isObject(input.policy.behavior) || !isObject(input.policy.queue)) {
      return err("P008-BRIEF-POLICY", "behavior-and-queue-policy-required", "policy");
    }
    if (!isIso(input.publishedAt)) return err("P008-BRIEF-PUBLISHED", "generic-publication-time-required", "publishedAt");
    if (!isIso(input.composedAt)) return err("P008-BRIEF-COMPOSED", "local-composition-time-required", "composedAt");

    var window = null;
    for (var i = 0; i < input.windows.length; i += 1) {
      if (input.windows[i] && input.windows[i].id === input.windowId) { window = input.windows[i]; break; }
    }
    if (!window) return err("P008-BRIEF-WINDOW-ID", "window-not-in-generic-contract", "windowId");

    var evidenceCutoffAt = cutoffFor(window, input.publishedAt, input.etOffsetMinutes);
    if (!evidenceCutoffAt) return err("P008-BRIEF-CUTOFF", "window-et-time-unparseable", "windows");

    // INVARIANT 1. Split rather than filter, so the exclusion can be reported as a number.
    var evidence = Array.isArray(input.evidence) ? input.evidence : [];
    var usable = [];
    var excludedAfterCutoff = 0;
    evidence.forEach(function (record) {
      if (!isObject(record) || !isIso(record.observedAt)) { excludedAfterCutoff += 1; return; }
      if (record.observedAt > evidenceCutoffAt) { excludedAfterCutoff += 1; return; }
      usable.push(record);
    });

    var holdings = Array.isArray(input.holdings) ? input.holdings : [];
    var watchlist = Array.isArray(input.watchlist) ? input.watchlist : [];
    var completions = Array.isArray(input.completions) ? input.completions : [];
    var floor = evaluateFloor(completions, input.policy.behavior);

    // INVARIANT 2. Build the qualification map first, then place each subject exactly once.
    var qualifiesVia = {};
    function qualify(subjectId, lane, subjectKind) {
      if (!subjectId) return;
      var key = String(subjectId);
      if (!qualifiesVia[key]) qualifiesVia[key] = { lanes: [], subjectKind: subjectKind || "ticker" };
      if (qualifiesVia[key].lanes.indexOf(lane) === -1) qualifiesVia[key].lanes.push(lane);
    }
    holdings.forEach(function (holding) { qualify(holding && holding.symbol, "held", "ticker"); });
    watchlist.forEach(function (symbol) { qualify(symbol, "watchlist", "ticker"); });
    completions.forEach(function (entry) { qualify(entry && entry.subjectId, "completedResearch", entry && entry.subjectKind); });

    // INVARIANT 3. The inferred lane is populated ONLY when both floors clear. Domains reached
    // solely by inference never enter the map otherwise, so there is nothing to leak downstream.
    if (floor.satisfied) {
      completions.forEach(function (entry) {
        if (!entry || !entry.domain) return;
        qualify(entry.domain, "inferredRelevance", "domain");
      });
    }

    var byId = {};
    usable.forEach(function (record) {
      var key = String(record.subjectId);
      if (!byId[key]) byId[key] = { materiality: 0, evidenceIds: [] };
      byId[key].evidenceIds.push(record.id);
      var value = isFinite(record.materiality) ? record.materiality : 0;
      if (value > byId[key].materiality) byId[key].materiality = value;
    });

    var lanes = { held: [], watchlist: [], completedResearch: [], inferredRelevance: [] };
    Object.keys(qualifiesVia).forEach(function (subjectId) {
      var entry = qualifiesVia[subjectId];
      var observed = byId[subjectId];
      if (!observed) return; // No evidence survived the cutoff for this subject.
      var primary = null;
      for (var index = 0; index < LANE_ORDER.length; index += 1) {
        if (entry.lanes.indexOf(LANE_ORDER[index]) !== -1) { primary = LANE_ORDER[index]; break; }
      }
      if (!primary) return;
      lanes[primary].push({
        subjectId: subjectId,
        subjectKind: entry.subjectKind,
        lane: primary,
        scopeSource: LANE_SOURCE[primary],
        // Stated explicitly rather than left to the reader: ownership is not a preference signal.
        impliesPreference: false,
        materiality: observed.materiality,
        evidenceIds: observed.evidenceIds,
        alsoQualifiesVia: entry.lanes.filter(function (lane) { return lane !== primary; })
      });
    });

    // Materiality-ordered so a bounded queue keeps what matters most rather than an arbitrary slice.
    var suppressedByCap = 0;
    var directCap = input.policy.queue.directActionCap;
    var inferredCap = input.policy.queue.generalInterestActionCap;
    LANE_ORDER.forEach(function (lane) {
      lanes[lane].sort(function (a, b) {
        return b.materiality - a.materiality || (a.subjectId < b.subjectId ? -1 : 1);
      });
      var cap = lane === "inferredRelevance" ? inferredCap : directCap;
      if (lanes[lane].length > cap) {
        suppressedByCap += lanes[lane].length - cap;
        lanes[lane] = lanes[lane].slice(0, cap);
      }
    });

    var itemCount = LANE_ORDER.reduce(function (total, lane) { return total + lanes[lane].length; }, 0);

    return ok({
      contractVersion: CONTRACT_VERSION,
      window: { id: window.id, label: window.label, etTime: window.etTime, anchor: window.anchor, offsetMinutes: window.offsetMinutes },
      // Three clocks, never collapsed: what was knowable, when the public brief shipped, and when
      // this local view was assembled.
      times: { evidenceCutoffAt: evidenceCutoffAt, publishedAt: input.publishedAt, composedAt: input.composedAt },
      lanes: lanes,
      states: {
        behaviorHistory: floor.satisfied ? "sufficient-history" : "insufficient-history",
        behaviorFloor: floor,
        materialChange: itemCount ? "material-change" : "no-material-change",
        itemCount: itemCount,
        excludedAfterCutoff: excludedAfterCutoff,
        suppressedByCap: suppressedByCap
      }
    });
  }

  return {
    contractVersion: CONTRACT_VERSION,
    laneOrder: LANE_ORDER.slice(),
    laneSource: LANE_SOURCE,
    composeBrief: composeBrief
  };
}));
