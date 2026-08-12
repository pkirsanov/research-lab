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
  var LANE_SOURCE = {    held: "direct-holding",
    watchlist: "direct-watchlist",
    completedResearch: "direct-completed-research",
    inferredRelevance: "behavior-derived"
  };

  /* Ordered worst-last so the highest rank is the most degraded state. `unmeasured` outranks
     `complete` because "we did not check" must never present as "we checked and it is fine". */
  var COVERAGE_RANK = { complete: 0, unmeasured: 1, partial: 2, stale: 3, unavailable: 4 };

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
  function evaluateFloor(completions, behaviorPolicy) {    var distinctCompletions = distinctCount(completions, function (c) { return c && c.subjectId; });
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
    /* Tracked PER SUBJECT as well as in total, so FR-064 can say WHICH of the two silences applies:
       evidence existed but fell outside the window, or none was ever observed. */
    var excludedBySubject = {};
    evidence.forEach(function (record) {
      if (!isObject(record) || !isIso(record.observedAt)) {
        excludedAfterCutoff += 1;
        if (isObject(record) && record.subjectId) excludedBySubject[String(record.subjectId)] = true;
        return;
      }
      if (record.observedAt > evidenceCutoffAt) {
        excludedAfterCutoff += 1;
        excludedBySubject[String(record.subjectId)] = true;
        return;
      }
      usable.push(record);
    });

    var holdings = Array.isArray(input.holdings) ? input.holdings : [];
    var watchlist = Array.isArray(input.watchlist) ? input.watchlist : [];
    var allCompletions = Array.isArray(input.completions) ? input.completions : [];

    /* FR-041's FOURTH clock. The local action-history cutoff is distinct from the generic evidence
       cutoff: one bounds what the market knew, the other bounds how far back local activity still
       counts. `maximumEvidenceAgeDays` is declared policy, so it is ENFORCED here — an unenforced
       age limit would let a completion from years ago keep clearing the behaviour floor forever. */
    var maxAgeDays = input.policy.behavior.maximumEvidenceAgeDays;
    var actionHistoryCutoffAt = isFinite(maxAgeDays)
      ? new Date(Date.parse(input.composedAt) - maxAgeDays * 86400000).toISOString()
      : null;
    var completions = [];
    var excludedStaleCompletions = 0;
    allCompletions.forEach(function (entry) {
      if (!isObject(entry) || !isIso(entry.completedAt)) { excludedStaleCompletions += 1; return; }
      if (actionHistoryCutoffAt && entry.completedAt < actionHistoryCutoffAt) { excludedStaleCompletions += 1; return; }
      completions.push(entry);
    });
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
      if (!byId[key]) byId[key] = { materiality: 0, evidenceIds: [], coverageState: null };
      byId[key].evidenceIds.push(record.id);
      var value = isFinite(record.materiality) ? record.materiality : 0;
      if (value > byId[key].materiality) byId[key].materiality = value;
      /* FR-050. The WORST coverage state across a subject's records wins. Taking the best would let
         one complete day make a mostly-absent series look fresh, which is precisely the
         misrepresentation this field exists to prevent. */
      if (record.coverageState && COVERAGE_RANK[record.coverageState] !== undefined) {
        var current = byId[key].coverageState;
        if (current === null || COVERAGE_RANK[record.coverageState] > COVERAGE_RANK[current]) {
          byId[key].coverageState = record.coverageState;
        }
      }
    });

    var lanes = { held: [], watchlist: [], completedResearch: [], inferredRelevance: [] };
    /* Owner routing is SUPPLIED by the caller from the shared tool registry rather than hardcoded
       here, so the brief cannot drift from the registry that actually defines which tool owns what. */
    var owners = isObject(input.owners) ? input.owners : {};
    /* Supplied by the caller from the previously rendered window. The composer holds no cross-window
       memory of its own, so this stays an explicit input rather than hidden state. */
    var priorEvidenceIds = isObject(input.priorEvidenceIds) ? input.priorEvidenceIds : {};
    /* FR-064. A subject that qualified by scope but produced no action is ACCOUNTED FOR, never
       silently dropped. Dropping it is the failure this list exists to prevent: a held ticker whose
       evidence is unavailable would simply vanish, and the reader could not tell "nothing to do"
       apart from "we do not know". Each entry therefore carries WHY it produced no action. */
    var noAction = [];
    Object.keys(qualifiesVia).forEach(function (subjectId) {
      var entry = qualifiesVia[subjectId];
      var observed = byId[subjectId];
      var scopeLane = null;
      for (var laneIndex = 0; laneIndex < LANE_ORDER.length; laneIndex += 1) {
        if (entry.lanes.indexOf(LANE_ORDER[laneIndex]) !== -1) { scopeLane = LANE_ORDER[laneIndex]; break; }
      }
      if (!observed) {
        noAction.push({
          subjectId: subjectId,
          subjectKind: entry.subjectKind,
          lane: scopeLane,
          scopeSource: scopeLane ? LANE_SOURCE[scopeLane] : null,
          // Distinguishes "we looked and there is nothing current" from "nothing was ever observed".
          reason: excludedBySubject[subjectId] ? "evidence-after-cutoff" : "evidence-unavailable"
        });
        return;
      }
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
        /* FR-050. Carried onto the item so a partial or stale series cannot support an action as
           if it were fresh. The item is still shown — withholding it would be its own distortion —
           but it declares the quality of what it rests on. */
        evidenceState: observed.coverageState || "unmeasured",
        supportsCurrentActionAsFresh: (observed.coverageState || "unmeasured") === "complete",
        /* FR-060/FR-061. When a Research Lab tool already owns this subject the brief LINKS to it
           instead of restating its model here; a duplicated specialist model is how two surfaces
           start disagreeing. When nothing owns it the gap is named as an unowned capability, which
           is a statement about the toolset, NOT a licence to synthesise a specialist result. */
        owner: owners[subjectId] || null,
        unownedCapability: !owners[subjectId],
        /* FR-059. A general-interest item says outright that it is not a known holding. Position in
           a lower lane is not a substitute: a reader who skims could otherwise carry ownership
           over from the lanes above. */
        notAKnownHolding: primary !== "held",
        /* FR-057. Seeing the same subject again in a later window is NOT a second, independent
           confirmation when it rests on the same underlying evidence. Comparing this window's
           evidence ids against the prior window's is what keeps a repeat from reading as
           corroboration. Absent a prior window there is nothing to compare, and it says so. */
        confirmationBasis: (function () {
          var prior = priorEvidenceIds[subjectId];
          if (!prior) return "no-prior-window";
          var current = observed.evidenceIds.slice().sort().join(",");
          return current === prior.slice().sort().join(",")
            ? "same-evidence-as-prior-window"
            : "new-evidence-since-prior-window";
        })(),
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
        /* FR-064 again: a subject trimmed by the bounded queue is still owed an explanation.
           It is not "no action", it is "ranked below the visible cap", and saying so is what
           keeps the bound honest instead of making items disappear. */
        lanes[lane].slice(cap).forEach(function (item) {
          noAction.push({
            subjectId: item.subjectId,
            subjectKind: item.subjectKind,
            lane: lane,
            scopeSource: LANE_SOURCE[lane],
            reason: "below-visible-queue-cap"
          });
        });
        lanes[lane] = lanes[lane].slice(0, cap);
      }
    });

    var itemCount = LANE_ORDER.reduce(function (total, lane) { return total + lanes[lane].length; }, 0);

    noAction.sort(function (a, b) { return a.subjectId < b.subjectId ? -1 : 1; });

    /* FR-067. One identity binds the five things that make a brief reproducible: which portfolio
       revision, which generic window and cutoff, when it was composed locally, which behaviour
       policy applied, and which action set resulted. The action set is folded in as an ordered
       lane:subject signature so two briefs that differ ONLY in their actions cannot share an
       identity and be mistaken for the same view. */
    var actionSignature = LANE_ORDER.map(function (lane) {
      return lane + "[" + lanes[lane].map(function (item) { return item.subjectId; }).join(",") + "]";
    }).join("|");

    return ok({
      contractVersion: CONTRACT_VERSION,
      window: { id: window.id, label: window.label, etTime: window.etTime, anchor: window.anchor, offsetMinutes: window.offsetMinutes },
      // Three clocks, never collapsed: what was knowable, when the public brief shipped, and when
      // this local view was assembled.
      times: { evidenceCutoffAt: evidenceCutoffAt, publishedAt: input.publishedAt, composedAt: input.composedAt, actionHistoryCutoffAt: actionHistoryCutoffAt },
      identity: {
        portfolioRevisionId: input.portfolioRevisionId || null,
        windowId: window.id,
        evidenceCutoffAt: evidenceCutoffAt,
        composedAt: input.composedAt,
        behaviorPolicyVersion: input.policy.contractVersion || null,
        actionSignature: actionSignature,
        itemCount: itemCount
      },
      lanes: lanes,
      noAction: noAction,
      states: {
        behaviorHistory: floor.satisfied ? "sufficient-history" : "insufficient-history",
        behaviorFloor: floor,
        materialChange: itemCount ? "material-change" : "no-material-change",
        itemCount: itemCount,
        excludedAfterCutoff: excludedAfterCutoff,
        suppressedByCap: suppressedByCap,
        // Surfaced as a count so "nothing to show" and "several things unexplained" cannot look alike.
        noActionCount: noAction.length,
        // Declared policy that is enforced, reported so an aging-out is visible rather than silent.
        excludedStaleCompletions: excludedStaleCompletions
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
