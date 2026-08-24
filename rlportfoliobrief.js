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
  var portfolio = root.RLPORTFOLIO;
  var contracts = root.RLCONTRACTS;
  if (typeof module === "object" && module && typeof module.exports === "object" && typeof require === "function") {
    if (!portfolio) portfolio = require("./rlportfolio.js");
    if (!contracts) contracts = require("./rlcontracts.js");
  }
  var api = factory(portfolio, contracts);
  root.RLPORTFOLIOBRIEF = api;
  if (typeof module === "object" && module && typeof module.exports === "object") module.exports = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function (portfolio, contracts) {
  "use strict";

  if (!portfolio || !contracts) throw new Error("RLPORTFOLIO and RLCONTRACTS must be loaded before RLPORTFOLIO_BRIEF");

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

  /* FR-052/FR-053. The ONLY verbs this brief may author. Research verbs describe looking at
     something; an order verb describes moving money. Keeping the permitted set closed — rather
     than screening for banned words — means a new verb has to be added deliberately instead of
     slipping in because nobody thought to ban it. */
  var RESEARCH_VERBS = ["review", "inspect", "compare", "run-scenario", "test-dependence",
    "revisit-thesis", "refresh-evidence", "open-owning-analysis"];

  /* Relevance confidence is labelled on its OWN vocabulary (FR-046). It deliberately shares no
     token with market or model confidence, so a reader cannot read "how sure are we this is
     relevant to you" as "how likely is this to make money". */
  var RELEVANCE_CONFIDENCE = ["insufficient-evidence", "weak-relevance", "moderate-relevance", "strong-relevance"];

  function relevanceConfidence(distinctCompletions, behaviorPolicy) {
    if (distinctCompletions < behaviorPolicy.minimumDistinctCompletions) return "insufficient-evidence";
    if (distinctCompletions >= behaviorPolicy.highScore) return "strong-relevance";
    if (distinctCompletions >= behaviorPolicy.mediumScore) return "moderate-relevance";
    return "weak-relevance";
  }

  /* Exponential decay on the policy's half-life. Recency is a MEASUREMENT of how old the newest
     supporting completion is, not a judgement about whether the interest still holds. */
  function decayState(newestCompletedAt, referenceIso, behaviorPolicy) {
    if (!isIso(newestCompletedAt)) return { ageDays: null, weight: 0, state: "no-supporting-action" };
    var ageMs = Date.parse(referenceIso) - Date.parse(newestCompletedAt);
    var ageDays = ageMs / 86400000;
    var halfLife = behaviorPolicy.halfLifeDays;
    var weight = isFinite(halfLife) && halfLife > 0 ? Math.pow(0.5, ageDays / halfLife) : 0;
    var state = "current";
    if (ageDays > behaviorPolicy.maximumEvidenceAgeDays) state = "expired";
    else if (ageDays > behaviorPolicy.recentSupportDays) state = "decaying";
    return { ageDays: Math.round(ageDays * 100) / 100, weight: Math.round(weight * 10000) / 10000, state: state };
  }

  function ok(value) { return { ok: true, value: value }; }
  function err(code, reason, field) { return { ok: false, error: { code: code, reason: reason, field: field || null } }; }

  function contractErr(code, reason, field, row, recoverable) {
    return {
      ok: false,
      error: {
        contractVersion: "PortfolioError/v1",
        code: code,
        reason: reason,
        field: field || null,
        row: typeof row === "number" ? row : null,
        valueEchoed: false,
        recoverable: recoverable === true
      }
    };
  }

  function isObject(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
  function isIso(value) { return typeof value === "string" && isFinite(Date.parse(value)); }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function canonicalFingerprint(kind, contractVersion, value) {
    var payload = clone(value);
    payload.contractVersion = contractVersion;
    return contracts.fingerprint(kind, payload);
  }

  var GENERIC_WINDOW_FIELDS = ["contractVersion", "windowId", "timezone", "windowTradingDate",
    "scheduledCivilTime", "cutoffAt", "snapshotRef", "payloadRef", "historyRefs", "watchlistRef",
    "ownerReadRefs", "publisherIdentity", "genericEvidenceIdentity", "retrievedAt", "composedAt", "state", "reasons"];
  var SNAPSHOT_REF_FIELDS = ["state", "contentSha256", "window", "asOf", "generatedAt", "nextSessionDate", "dataFreshnessSha256"];
  var PAYLOAD_REF_FIELDS = ["state", "contentSha256", "asOf", "attentionIds", "recommendationIds", "deepLinkIds", "lifecycleIds"];
  var HISTORY_REF_FIELDS = ["lineIdentity", "window", "observedAt", "evidenceFingerprint", "sourceToken", "contentSha256"];
  var WATCHLIST_REF_FIELDS = ["state", "contentSha256", "orderedTickerFingerprint"];
  var OWNER_READ_REF_FIELDS = ["sourceContract", "toolId", "role", "profile", "availability", "adapterId", "modelVersion",
    "deepLink", "evidenceCutoff", "evidenceFingerprints", "interpretationFingerprints", "actionEligibilityEffect", "contentSha256"];
  var GENERIC_STATES = ["current", "partial", "stale", "unavailable", "disputed"];
  var HASH_RE = /^sha256:[a-f0-9]{64}$/;

  function exactFields(value, fields) {
    return isObject(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify(fields.slice().sort());
  }
  function stringArray(value) {
    return Array.isArray(value) && value.every(function (entry) { return typeof entry === "string" && entry.length > 0; });
  }
  function civilParts(instant, timezone) {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date(instant));
    var values = {};
    parts.forEach(function (part) { values[part.type] = part.value; });
    return values;
  }
  function newYorkCivilCutoff(date, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !/^\d{2}:\d{2}$/.test(String(time))) return null;
    var target = Date.parse(date + "T" + time + ":00.000Z");
    if (!isFinite(target)) return null;
    var guess = target;
    for (var iteration = 0; iteration < 4; iteration += 1) {
      var parts = civilParts(guess, "America/New_York");
      var represented = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
      guess += target - represented;
    }
    var verified = civilParts(guess, "America/New_York");
    var expected = date + "T" + time + ":00";
    var actual = verified.year + "-" + verified.month + "-" + verified.day + "T" + verified.hour + ":" + verified.minute + ":" + verified.second;
    return actual === expected ? new Date(guess).toISOString() : null;
  }
  /* The evidence cutoff of the window a run analyzes, resolved from the run instant alone.
     The trading date is the New York civil date of that instant, which is why an 11:37 ET run
     of the 11:00 ET morning window resolves to 11:00 and not to the moment it happened to
     execute. Publisher and consumer both call this, so the boundary a brief is measured
     against is the same boundary it was stamped with. */
  function windowCutoffAt(windows, windowId, instant) {
    if (!Array.isArray(windows) || typeof windowId !== "string" || !windowId || !isIso(instant)) return null;
    var declared = null;
    for (var index = 0; index < windows.length; index += 1) {
      if (windows[index] && windows[index].id === windowId) { declared = windows[index]; break; }
    }
    if (!declared || typeof declared.etTime !== "string") return null;
    var parts = civilParts(instant, "America/New_York");
    return newYorkCivilCutoff(parts.year + "-" + parts.month + "-" + parts.day, declared.etTime);
  }
  function validSnapshotRef(value) {
    return exactFields(value, SNAPSHOT_REF_FIELDS) && GENERIC_STATES.indexOf(value.state) >= 0 &&
      HASH_RE.test(value.contentSha256 || "") && HASH_RE.test(value.dataFreshnessSha256 || "") &&
      typeof value.window === "string" && isIso(value.asOf) && isIso(value.generatedAt) && /^\d{4}-\d{2}-\d{2}$/.test(value.nextSessionDate);
  }
  function validPayloadRef(value) {
    return exactFields(value, PAYLOAD_REF_FIELDS) && GENERIC_STATES.indexOf(value.state) >= 0 &&
      HASH_RE.test(value.contentSha256 || "") && isIso(value.asOf) && stringArray(value.attentionIds) &&
      stringArray(value.recommendationIds) && stringArray(value.deepLinkIds) && stringArray(value.lifecycleIds);
  }
  function validHistoryRef(value) {
    return exactFields(value, HISTORY_REF_FIELDS) && HASH_RE.test(value.lineIdentity || "") &&
      HASH_RE.test(value.evidenceFingerprint || "") && HASH_RE.test(value.contentSha256 || "") &&
      typeof value.window === "string" && isIso(value.observedAt) && typeof value.sourceToken === "string" && value.sourceToken.length > 0;
  }
  function validWatchlistRef(value) {
    return exactFields(value, WATCHLIST_REF_FIELDS) && GENERIC_STATES.indexOf(value.state) >= 0 &&
      HASH_RE.test(value.contentSha256 || "") && HASH_RE.test(value.orderedTickerFingerprint || "");
  }
  function validOwnerReadRef(value, cutoffAt) {
    return exactFields(value, OWNER_READ_REF_FIELDS) && typeof value.sourceContract === "string" &&
      typeof value.toolId === "string" && typeof value.role === "string" && typeof value.profile === "string" &&
      GENERIC_STATES.indexOf(value.availability) >= 0 && typeof value.adapterId === "string" &&
      typeof value.modelVersion === "string" && typeof value.deepLink === "string" && isIso(value.evidenceCutoff) &&
      value.evidenceCutoff <= cutoffAt && stringArray(value.evidenceFingerprints) &&
      value.evidenceFingerprints.every(function (entry) { return HASH_RE.test(entry); }) &&
      stringArray(value.interpretationFingerprints) && value.interpretationFingerprints.every(function (entry) { return HASH_RE.test(entry); }) &&
      typeof value.actionEligibilityEffect === "string" && HASH_RE.test(value.contentSha256 || "");
  }
  function validateGenericWindow(input, policy, clock) {
    if (!exactFields(input, GENERIC_WINDOW_FIELDS)) {
      return contractErr("P008-BRIEF-INPUT", "generic-window-shape-invalid", "input", null, false);
    }
    if (input.contractVersion !== "GenericEvidenceWindow/v1" || input.timezone !== "America/New_York" ||
        GENERIC_STATES.indexOf(input.state) < 0 || !stringArray(input.reasons) && input.reasons.length !== 0 ||
        !isIso(input.retrievedAt) || !isIso(input.composedAt)) {
      return contractErr("P008-BRIEF-INPUT", "generic-window-invalid", "input", null, false);
    }
    var cutoffAt = newYorkCivilCutoff(input.windowTradingDate, input.scheduledCivilTime);
    if (!cutoffAt || input.cutoffAt !== cutoffAt) {
      return contractErr("P008-BRIEF-TIME", "generic-window-cutoff-mismatch", "cutoffAt", null, false);
    }
    if (clock && isObject(clock) && isIso(clock.now) && input.composedAt > clock.now) {
      return contractErr("P008-BRIEF-TIME", "composition-after-clock", "composedAt", null, false);
    }
    if (!validSnapshotRef(input.snapshotRef) || !validPayloadRef(input.payloadRef) ||
        !Array.isArray(input.historyRefs) || !input.historyRefs.every(validHistoryRef) ||
        !validWatchlistRef(input.watchlistRef) || !Array.isArray(input.ownerReadRefs) ||
        !input.ownerReadRefs.every(function (entry) { return validOwnerReadRef(entry, cutoffAt); })) {
      return contractErr("P008-BRIEF-EVIDENCE", "generic-evidence-ref-invalid", "input", null, false);
    }
    if (input.snapshotRef.window !== input.windowId || input.payloadRef.asOf > cutoffAt || input.snapshotRef.asOf > cutoffAt) {
      return contractErr("P008-BRIEF-EVIDENCE", "generic-evidence-cutoff-conflict", "input", null, false);
    }
    var historyByEvidence = Object.create(null);
    input.historyRefs.forEach(function (entry) {
      if (entry.observedAt <= cutoffAt && !historyByEvidence[entry.evidenceFingerprint]) historyByEvidence[entry.evidenceFingerprint] = clone(entry);
    });
    var selectedHistoryRefs = Object.keys(historyByEvidence).sort().map(function (key) { return historyByEvidence[key]; });
    if (input.state === "current" && (!selectedHistoryRefs.length || input.snapshotRef.state !== "current" || input.payloadRef.state !== "current")) {
      return contractErr("P008-BRIEF-EVIDENCE", "current-window-evidence-incomplete", "state", null, false);
    }
    var publisherIdentity = canonicalFingerprint("portfolio-generic-publisher", "portfolio-generic-publisher/v1", {
      snapshotIdentity: input.snapshotRef.contentSha256,
      payloadIdentity: input.payloadRef.contentSha256,
      historyIdentities: selectedHistoryRefs.map(function (entry) { return entry.evidenceFingerprint; })
    });
    var qualifiedOwnerReads = input.ownerReadRefs.filter(function (entry) {
      return entry.availability !== "unavailable" && entry.actionEligibilityEffect === "eligible";
    }).sort(function (left, right) { return left.toolId < right.toolId ? -1 : left.toolId > right.toolId ? 1 : 0; });
    var genericEvidenceIdentity = canonicalFingerprint("portfolio-generic-evidence", "portfolio-generic-evidence/v1", {
      publisherIdentity: publisherIdentity,
      watchlistIdentity: input.watchlistRef.orderedTickerFingerprint,
      ownerReadIdentities: qualifiedOwnerReads.map(function (entry) { return entry.contentSha256; }),
      windowId: input.windowId, windowTradingDate: input.windowTradingDate, cutoffAt: cutoffAt, state: input.state
    });
    var value = clone(input);
    value.cutoffAt = cutoffAt;
    value.publisherIdentity = publisherIdentity;
    value.genericEvidenceIdentity = genericEvidenceIdentity;
    value.selectedHistoryRefs = selectedHistoryRefs;
    value.ownerReadRefs = qualifiedOwnerReads;
    return ok(deepFreeze(value));
  }

  function buildActionCandidates(input, policy) {
    if (!isObject(input) || !isObject(input.genericWindow) || !Array.isArray(input.directSubjects) || !Array.isArray(input.inferredSubjects)) {
      return contractErr("P008-ACTION-SHAPE", "action-candidate-input-invalid", "input", null, false);
    }
    var genericWindow = input.genericWindow;
    if (genericWindow.contractVersion !== "GenericEvidenceWindow/v1" || !HASH_RE.test(genericWindow.genericEvidenceIdentity || "")) {
      return contractErr("P008-BRIEF-EVIDENCE", "validated-generic-window-required", "genericWindow", null, false);
    }
    var all = input.directSubjects.concat(input.inferredSubjects), actions = [];
    for (var index = 0; index < all.length; index += 1) {
      var subject = all[index];
      if (!isObject(subject) || typeof subject.subjectId !== "string" || typeof subject.lane !== "string" || !isFinite(subject.materiality)) {
        return contractErr("P008-ACTION-SHAPE", "action-subject-invalid", "subjects", index, false);
      }
      var stale = genericWindow.state === "stale" || subject.evidenceState === "stale";
      var directAuthority = { held: "held", watchlist: "watchlist", completedResearch: "completed-research", inferredRelevance: "inferred-relevance" }[subject.lane];
      var explicitExposure = { held: "held", watchlist: "watchlist", completedResearch: "completed", inferredRelevance: "none" }[subject.lane];
      if (!directAuthority || !explicitExposure) return contractErr("P008-ACTION-SHAPE", "action-lane-invalid", "lane", index, false);
      var action = {
        actionId: canonicalFingerprint("portfolio-research-action", "portfolio-research-action/v1", {
          genericEvidenceIdentity: genericWindow.genericEvidenceIdentity, subjectId: subject.subjectId, lane: subject.lane
        }),
        subject: subject.subjectId, subjectId: subject.subjectId, lane: subject.lane,
        integrity: genericWindow.state === "current" ? "verified" : genericWindow.state === "stale" ? "partial" : "qualified",
        directAuthority: directAuthority, datedUrgency: "none", explicitExposure: explicitExposure,
        triggerState: "active", evidenceState: subject.evidenceState, relevanceScore: subject.materiality,
        researchVerb: stale ? (subject.lane === "held" ? "refresh" : "revisit-thesis") : (subject.lane === "held" ? "review" : "inspect"),
        staleCondition: stale ? genericWindow.reasons.join(",") || "generic-evidence-stale" : null,
        evidenceAgeHours: Math.max(0, Math.round((Date.parse(genericWindow.composedAt) - Date.parse(genericWindow.cutoffAt)) / 3600000 * 100) / 100),
        genericEvidenceIdentity: genericWindow.genericEvidenceIdentity,
        lifecycleState: "open", completedAt: null, invalidatedAt: null, dismissedAt: null
      };
      actions.push(action);
    }
    return ok(deepFreeze({ contractVersion: "ResearchActionCandidateSet/v1", genericEvidenceIdentity: genericWindow.genericEvidenceIdentity, actions: actions }));
  }

  var LIFECYCLE_STATES = Object.freeze({ complete: "completed", dismiss: "dismissed", invalidate: "invalidated", restore: "open" });
  function reduceResearchActionLifecycle(actions, transition, now) {
    if (!Array.isArray(actions) || !isObject(transition) || typeof transition.actionId !== "string" ||
        !Object.prototype.hasOwnProperty.call(LIFECYCLE_STATES, transition.command) ||
        typeof transition.reason !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(transition.reason) || !isIso(now)) {
      return contractErr("P008-ACTION-LIFECYCLE", "action-lifecycle-input-invalid", "transition", null, false);
    }
    var found = false;
    var next = actions.map(function (entry) {
      if (!isObject(entry) || typeof entry.actionId !== "string") return null;
      if (entry.actionId !== transition.actionId) return clone(entry);
      found = true;
      var updated = clone(entry), state = LIFECYCLE_STATES[transition.command];
      updated.lifecycleState = state;
      updated.completedAt = state === "completed" ? now : null;
      updated.dismissedAt = state === "dismissed" ? now : null;
      updated.invalidatedAt = state === "invalidated" ? now : null;
      updated.lifecycleReason = transition.reason;
      return updated;
    });
    if (next.some(function (entry) { return entry === null; })) return contractErr("P008-ACTION-LIFECYCLE", "action-shape-invalid", "actions", null, false);
    if (!found) return contractErr("P008-ACTION-LIFECYCLE", "action-not-found", "actionId", null, false);
    return ok(deepFreeze({
      contractVersion: "ResearchActionLifecycleResult/v1", actions: next,
      transition: { actionId: transition.actionId, command: transition.command, reason: transition.reason, occurredAt: now }
    }));
  }

  function dedupeBehaviorEvents(input) {
    if (!isObject(input) || !Array.isArray(input.events) || !isObject(input.policy)) {
      return contractErr("P008-BEHAVIOR-IDENTITY", "behavior-events-input-required", "input", null, false);
    }
    if (!isIso(input.behaviorCutoffAt)) {
      return contractErr("P008-BEHAVIOR-TIME", "behavior-cutoff-invalid", "behaviorCutoffAt", null, false);
    }
    if (!isObject(input.policy.behavior) || !isFinite(input.policy.behavior.maxBehaviorEvents) ||
        input.events.length > input.policy.behavior.maxBehaviorEvents) {
      return contractErr("P008-CONFIG", "behavior-event-cap-invalid", "policy.behavior.maxBehaviorEvents", null, false);
    }

    var semanticByIdentity = Object.create(null);
    var semanticOrder = [];
    var occurrenceByIdentity = Object.create(null);
    var occurrenceOrder = [];
    var eligibleOccurrences = [];
    var quarantinedOccurrences = [];

    for (var index = 0; index < input.events.length; index += 1) {
      var event = input.events[index];
      if (!isObject(event)) {
        return contractErr("P008-BEHAVIOR-IDENTITY", "behavior-event-object-required", "events", index, false);
      }

      if (!event.genericEvidenceIdentity && event.contractVersion === "BehaviorEvent/v1") {
        var legacy = portfolio.readLegacyBehaviorEventV1(event, input.policy);
        if (!legacy.ok) return legacy;
        quarantinedOccurrences.push(deepFreeze({
          compatibilityPath: "BehaviorEventV1WithoutGenericEvidenceIdentity",
          occurrence: null,
          error: contractErr("P008-BEHAVIOR-IDENTITY", "legacy-event-missing-generic-evidence-identity", "genericEvidenceIdentity", index, false).error
        }));
        continue;
      }

      var identityResult = portfolio.canonicalBehaviorIdentity(event, input.policy);
      if (!identityResult.ok) return identityResult;
      var identity = identityResult.value;
      var occurredAt = event.occurrence && event.occurrence.occurredAt ? event.occurrence.occurredAt : event.occurredAt;
      var occurrenceResult = portfolio.buildBehaviorOccurrence(identity.eventIdentity, occurredAt);
      if (!occurrenceResult.ok) return occurrenceResult;
      var occurrence = occurrenceResult.value;

      if (!semanticByIdentity[identity.eventIdentity]) {
        semanticByIdentity[identity.eventIdentity] = identity;
        semanticOrder.push(identity.eventIdentity);
      }
      if (!occurrenceByIdentity[occurrence.occurrenceId]) {
        occurrenceByIdentity[occurrence.occurrenceId] = occurrence;
        occurrenceOrder.push(occurrence.occurrenceId);
      }

      if (Date.parse(occurrence.occurredAt) > Date.parse(input.behaviorCutoffAt)) {
        quarantinedOccurrences.push(deepFreeze({
          occurrence: occurrence,
          error: contractErr("P008-BEHAVIOR-TIME", "future-behavior-occurrence", "occurredAt", index, false).error
        }));
      } else {
        eligibleOccurrences.push(occurrence);
      }
    }

    return ok(deepFreeze({
      contractVersion: "BehaviorDedupeResult/v1",
      behaviorCutoffAt: input.behaviorCutoffAt,
      semanticEvents: semanticOrder.map(function (identity) { return semanticByIdentity[identity]; }),
      occurrences: occurrenceOrder.map(function (identity) { return occurrenceByIdentity[identity]; }),
      eligibleOccurrences: eligibleOccurrences,
      quarantinedOccurrences: quarantinedOccurrences
    }));
  }

  function deriveInterestSignals(input) {
    if (!isObject(input) || !isObject(input.policy) || !isObject(input.policy.behavior)) {
      return contractErr("P008-CONFIG", "behavior-policy-required", "policy.behavior", null, false);
    }
    var deduped = dedupeBehaviorEvents(input);
    if (!deduped.ok) return deduped;

    var behaviorPolicy = input.policy.behavior;
    if (!isFinite(behaviorPolicy.minimumDistinctCompletions) || !isFinite(behaviorPolicy.minimumDistinctUtcDates) ||
        !isFinite(behaviorPolicy.halfLifeDays) || behaviorPolicy.halfLifeDays <= 0 ||
        !isFinite(behaviorPolicy.maximumEvidenceAgeDays)) {
      return contractErr("P008-CONFIG", "behavior-floor-policy-invalid", "policy.behavior", null, false);
    }

    var semanticByIdentity = Object.create(null);
    deduped.value.semanticEvents.forEach(function (event) { semanticByIdentity[event.eventIdentity] = event; });
    var buckets = Object.create(null);
    input.events.forEach(function (event) {
      if (!isObject(event) || !event.domain) return;
      var domain = String(event.domain);
      if (!buckets[domain]) {
        buckets[domain] = {
          domain: domain,
          rawOccurrenceCount: 0,
          completionIdentities: Object.create(null),
          dates: Object.create(null),
          occurrenceIds: [],
          score: 0,
          latestSupportAt: null,
          subjectKind: event.subjectKind || "domain",
          horizon: event.horizon || null
        };
      }
      buckets[domain].rawOccurrenceCount += 1;
    });

    deduped.value.eligibleOccurrences.forEach(function (occurrence) {
      var semantic = semanticByIdentity[occurrence.eventIdentity];
      if (!semantic) return;
      var bucket = buckets[semantic.domain];
      if (!bucket) return;
      var ageMs = Date.parse(input.behaviorCutoffAt) - Date.parse(occurrence.occurredAt);
      if (ageMs < 0) return;
      var ageDays = ageMs / 86400000;
      if (ageDays <= behaviorPolicy.maximumEvidenceAgeDays) {
        bucket.completionIdentities[occurrence.eventIdentity] = true;
        bucket.dates[occurrence.newYorkCivilDate] = true;
        bucket.occurrenceIds.push(occurrence.occurrenceId);
        bucket.score += Math.pow(0.5, ageDays / behaviorPolicy.halfLifeDays);
        if (!bucket.latestSupportAt || occurrence.occurredAt > bucket.latestSupportAt) {
          bucket.latestSupportAt = occurrence.occurredAt;
        }
      }
    });

    var interestSignals = Object.keys(buckets).sort().map(function (domain) {
      var bucket = buckets[domain];
      var distinctCompletionIdentities = Object.keys(bucket.completionIdentities).length;
      var distinctDates = Object.keys(bucket.dates).length;
      var floorSatisfied = distinctCompletionIdentities >= behaviorPolicy.minimumDistinctCompletions &&
        distinctDates >= behaviorPolicy.minimumDistinctUtcDates;
      var signal = {
        contractVersion: "BehaviorInterestSignal/v1",
        signalId: null,
        subjectKind: "domain",
        subjectId: domain,
        domain: domain,
        horizon: bucket.horizon,
        score: Math.round(bucket.score * 10000) / 10000,
        latestSupportAt: bucket.latestSupportAt,
        supportingOccurrenceIds: bucket.occurrenceIds.slice().sort(),
        floor: {
          rawOccurrenceCount: bucket.rawOccurrenceCount,
          distinctCompletionIdentities: distinctCompletionIdentities,
          requiredDistinctCompletionIdentities: behaviorPolicy.minimumDistinctCompletions,
          distinctNewYorkCivilDates: distinctDates,
          requiredDistinctNewYorkCivilDates: behaviorPolicy.minimumDistinctUtcDates,
          satisfied: floorSatisfied
        }
      };
      signal.signalId = canonicalFingerprint("portfolio-behavior-interest-signal", "portfolio-behavior-interest-signal/v1", {
        domain: signal.domain,
        horizon: signal.horizon,
        supportingOccurrenceIds: signal.supportingOccurrenceIds,
        floor: signal.floor
      });
      return signal;
    });

    return ok(deepFreeze({
      contractVersion: "BehaviorInterestResult/v1",
      behaviorCutoffAt: input.behaviorCutoffAt,
      eligibleOccurrences: deduped.value.eligibleOccurrences,
      quarantinedOccurrences: deduped.value.quarantinedOccurrences,
      interestSignals: interestSignals
    }));
  }

  var RANK_PRIORITY = Object.freeze({
    integrity: Object.freeze({ verified: 0, qualified: 1, partial: 2, unverified: 3, disputed: 4, unavailable: 5 }),
    directAuthority: Object.freeze({ held: 0, "dated-need": 1, watchlist: 2, "completed-research": 3, "inferred-relevance": 4 }),
    datedUrgency: Object.freeze({ overdue: 0, "due-now": 1, "near-term": 2, dated: 3, none: 4 }),
    explicitExposure: Object.freeze({ held: 0, "dated-need": 1, watchlist: 2, completed: 3, none: 4 }),
    triggerState: Object.freeze({ active: 0, triggered: 1, pending: 2, inactive: 3 }),
    evidenceState: Object.freeze({ current: 0, qualified: 1, partial: 2, stale: 3, disputed: 4, unavailable: 5 })
  });

  function rankValue(dimension, value) {
    return Object.prototype.hasOwnProperty.call(RANK_PRIORITY[dimension], value)
      ? RANK_PRIORITY[dimension][value] : null;
  }

  function compareRankedActions(left, right) {
    var dimensions = ["integrity", "directAuthority", "datedUrgency", "explicitExposure", "triggerState", "evidenceState"];
    for (var index = 0; index < dimensions.length; index += 1) {
      var dimension = dimensions[index];
      var delta = rankValue(dimension, left[dimension]) - rankValue(dimension, right[dimension]);
      if (delta) return delta;
    }
    if (left.relevanceScore !== right.relevanceScore) return right.relevanceScore - left.relevanceScore;
    if (left.subject !== right.subject) return left.subject < right.subject ? -1 : 1;
    if (left.actionId !== right.actionId) return left.actionId < right.actionId ? -1 : 1;
    return 0;
  }

  function rankResearchActions(input) {
    if (!isObject(input) || !Array.isArray(input.actions) || !isObject(input.policy) || !isObject(input.policy.queue)) {
      return contractErr("P008-ACTION-RANK", "ranking-input-required", "input", null, false);
    }
    if (!isIso(input.behaviorCutoffAt) || typeof input.genericWindowIdentity !== "string" ||
        !/^sha256:[a-f0-9]{64}$/.test(input.genericWindowIdentity) || !isObject(input.interestResult)) {
      return contractErr("P008-ACTION-RANK", "ranking-context-invalid", "input", null, false);
    }

    var queue = input.policy.queue;
    var visibleActionCap = null;
    if (Object.prototype.hasOwnProperty.call(queue, "visibleActionCap")) {
      if (!Number.isInteger(queue.visibleActionCap) || queue.visibleActionCap < 0) {
        return contractErr("P008-CONFIG", "visible-action-cap-invalid", "policy.queue.visibleActionCap", null, false);
      }
      visibleActionCap = queue.visibleActionCap;
    } else if (Number.isInteger(queue.directActionCap) && queue.directActionCap >= 0 &&
               Number.isInteger(queue.generalInterestActionCap) && queue.generalInterestActionCap >= 0) {
      visibleActionCap = queue.directActionCap + queue.generalInterestActionCap;
    } else {
      return contractErr("P008-CONFIG", "visible-action-cap-missing", "policy.queue", null, false);
    }

    var dimensions = ["integrity", "directAuthority", "datedUrgency", "explicitExposure", "triggerState", "evidenceState"];
    var actions = [];
    for (var actionIndex = 0; actionIndex < input.actions.length; actionIndex += 1) {
      var action = input.actions[actionIndex];
      if (!isObject(action) || typeof action.actionId !== "string" || !action.actionId ||
          typeof action.subject !== "string" || !action.subject || !isFinite(action.relevanceScore)) {
        return contractErr("P008-ACTION-RANK", "action-shape-invalid", "actions", actionIndex, false);
      }
      for (var dimensionIndex = 0; dimensionIndex < dimensions.length; dimensionIndex += 1) {
        var dimension = dimensions[dimensionIndex];
        if (rankValue(dimension, action[dimension]) === null) {
          return contractErr("P008-ACTION-RANK", "action-rank-value-invalid", dimension, actionIndex, false);
        }
      }
      actions.push(clone(action));
    }
    actions.sort(compareRankedActions);

    var ranked = actions.map(function (action, index) {
      action.rankReason = {
        tuple: [
          action.integrity, action.directAuthority, action.datedUrgency, action.explicitExposure,
          action.triggerState, action.evidenceState, action.relevanceScore, action.subject, action.actionId
        ],
        tieBreakers: [
          "integrity:" + action.integrity,
          "direct-authority:" + action.directAuthority,
          "dated-urgency:" + action.datedUrgency,
          "explicit-exposure:" + action.explicitExposure,
          "trigger-state:" + action.triggerState,
          "evidence-state:" + action.evidenceState,
          "relevance-score:" + String(action.relevanceScore),
          "subject:" + action.subject,
          "action-id:" + action.actionId
        ],
        globalRank: index + 1
      };
      return action;
    });
    var visible = ranked.slice(0, visibleActionCap);
    var suppressed = ranked.slice(visibleActionCap).map(function (action) {
      action.suppressionReason = "below-global-cap";
      return action;
    });
    var policyFingerprint = canonicalFingerprint("portfolio-behavior-rank-policy", "portfolio-behavior-rank-policy/v1", {
      behavior: input.policy.behavior,
      queue: input.policy.queue
    });
    var rankingFingerprint = canonicalFingerprint("portfolio-behavior-ranking", "portfolio-behavior-ranking/v1", {
      policyFingerprint: policyFingerprint,
      genericWindowIdentity: input.genericWindowIdentity,
      behaviorCutoffAt: input.behaviorCutoffAt,
      visibleActionCap: visibleActionCap,
      rankedActions: visible,
      suppressedActions: suppressed
    });

    return ok(deepFreeze({
      contractVersion: "BehaviorRankResult/v1",
      policyFingerprint: policyFingerprint,
      genericWindowIdentity: input.genericWindowIdentity,
      behaviorCutoffAt: input.behaviorCutoffAt,
      eligibleOccurrences: input.interestResult.eligibleOccurrences || [],
      quarantinedOccurrences: input.interestResult.quarantinedOccurrences || [],
      interestSignals: input.interestResult.interestSignals || [],
      rankedActions: visible,
      suppressedActions: suppressed,
      visibleActionCap: visibleActionCap,
      rankingFingerprint: rankingFingerprint
    }));
  }

  function composePortfolioBrief(input, policy) {
    if (!isObject(input) || !isObject(input.behaviorRankResult) ||
        input.behaviorRankResult.contractVersion !== "BehaviorRankResult/v1" ||
        !Object.isFrozen(input.behaviorRankResult)) {
      return contractErr("P008-BRIEF-COMPOSE", "immutable-behavior-rank-result-required", "behaviorRankResult", null, false);
    }
    if (input.genericWindow !== undefined &&
        (!isObject(input.genericWindow) || input.genericWindow.contractVersion !== "GenericEvidenceWindow/v1" ||
         !Object.isFrozen(input.genericWindow) ||
         input.genericWindow.genericEvidenceIdentity !== input.behaviorRankResult.genericWindowIdentity)) {
      return contractErr("P008-BRIEF-EVIDENCE", "generic-window-rank-identity-mismatch", "genericWindow", null, false);
    }
    var effectiveInput = clone(input);
    delete effectiveInput.behaviorRankResult;
    delete effectiveInput.genericWindow;
    if (policy) effectiveInput.policy = policy;
    var legacy = composeBrief(effectiveInput);
    if (!legacy.ok) return legacy;
    legacy.value.behaviorRankResult = input.behaviorRankResult;
    legacy.value.genericWindow = input.genericWindow || null;
    legacy.value.rankedActions = input.behaviorRankResult.rankedActions;
    legacy.value.suppressedActions = input.behaviorRankResult.suppressedActions;
    return ok(deepFreeze(legacy.value));
  }

  function whyShown(actionId, rankResult, genericWindow) {
    if (isObject(actionId) && typeof rankResult === "string") {
      var compatibilityRank = actionId;
      actionId = rankResult;
      rankResult = compatibilityRank;
    }
    if (typeof actionId !== "string" || !actionId || !isObject(rankResult) ||
        rankResult.contractVersion !== "BehaviorRankResult/v1" || !Object.isFrozen(rankResult)) {
      return contractErr("P008-ACTION-WHY", "canonical-rank-result-required", "rankResult", null, false);
    }
    var action = null;
    var suppressed = false;
    rankResult.rankedActions.forEach(function (entry) { if (entry.actionId === actionId) action = entry; });
    if (!action) {
      rankResult.suppressedActions.forEach(function (entry) {
        if (entry.actionId === actionId) { action = entry; suppressed = true; }
      });
    }
    if (!action) return contractErr("P008-ACTION-WHY", "action-not-in-rank-result", "actionId", null, false);
    return ok(deepFreeze({
      contractVersion: "BehaviorWhyShown/v1",
      actionId: action.actionId,
      subjectId: action.subjectId || action.subject,
      rankReason: action.rankReason,
      suppressionReason: suppressed ? action.suppressionReason : null,
      policyFingerprint: rankResult.policyFingerprint,
      rankingFingerprint: rankResult.rankingFingerprint,
      genericWindowIdentity: rankResult.genericWindowIdentity,
      behaviorCutoffAt: rankResult.behaviorCutoffAt,
      genericWindow: genericWindow || null
    }));
  }

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

    /* Per-subject support, derived ONLY from explicitly completed actions. Settings, passive
       activity, and view history are not in `completions` by construction, which is what makes
       FR-045's "evidence event categories" a statement about deliberate actions (SCN-008-009). */
    var supportBySubject = {};
    var categoriesBySubject = {};
    var horizonBySubject = {};
    var newestSupportBySubject = {};
    var supportDatesBySubject = {};
    completions.forEach(function (entry) {
      [entry.subjectId, entry.domain].forEach(function (key) {
        if (!key) return;
        key = String(key);
        supportBySubject[key] = (supportBySubject[key] || 0) + 1;
        if (!supportDatesBySubject[key]) supportDatesBySubject[key] = {};
        supportDatesBySubject[key][entry.completedAt.slice(0, 10)] = true;
        if (entry.category) {
          if (!categoriesBySubject[key]) categoriesBySubject[key] = [];
          if (categoriesBySubject[key].indexOf(entry.category) === -1) categoriesBySubject[key].push(entry.category);
        }
        if (entry.horizon && !horizonBySubject[key]) horizonBySubject[key] = entry.horizon;
        if (!newestSupportBySubject[key] || entry.completedAt > newestSupportBySubject[key]) {
          newestSupportBySubject[key] = entry.completedAt;
        }
      });
    });

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
    var underSupportedInferences = [];
    var inferredDomains = {};
    completions.forEach(function (entry) {
      if (entry && entry.domain) inferredDomains[String(entry.domain)] = true;
    });
    Object.keys(inferredDomains).forEach(function (domain) {
      var domainDates = Object.keys(supportDatesBySubject[domain] || {}).length;
      if (supportBySubject[domain] >= input.policy.behavior.minimumDistinctCompletions &&
          domainDates >= input.policy.behavior.minimumDistinctUtcDates) {
        qualify(domain, "inferredRelevance", "domain");
      } else {
        underSupportedInferences.push(domain);
      }
    });

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
    underSupportedInferences.forEach(function (domain) {
      noAction.push({
        subjectId: domain,
        subjectKind: "domain",
        lane: "inferredRelevance",
        scopeSource: LANE_SOURCE.inferredRelevance,
        reason: "insufficient-domain-history"
      });
    });
    Object.keys(qualifiesVia).forEach(function (subjectId) {
      var entry = qualifiesVia[subjectId];
      var observed = byId[subjectId];
      var primary = null;
      for (var laneIndex = 0; laneIndex < LANE_ORDER.length; laneIndex += 1) {
        if (entry.lanes.indexOf(LANE_ORDER[laneIndex]) !== -1) { primary = LANE_ORDER[laneIndex]; break; }
      }
      if (!observed) {
        noAction.push({
          subjectId: subjectId,
          subjectKind: entry.subjectKind,
          lane: primary,
          scopeSource: primary ? LANE_SOURCE[primary] : null,
          // Distinguishes "we looked and there is nothing current" from "nothing was ever observed".
          reason: excludedBySubject[subjectId] ? "evidence-after-cutoff" : "evidence-unavailable"
        });
        return;
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
        alsoQualifiesVia: entry.lanes.filter(function (lane) { return lane !== primary; }),
        /* FR-045. A behaviour-derived item that cannot say why it appeared is indistinguishable
           from a guess, so the explanation travels WITH the item rather than being reconstructed
           by whatever renders it. Direct-scope items carry the same shape so a reader never has to
           learn two vocabularies. */
        explanation: {
          whyShown: primary === "inferredRelevance"
            ? "Inferred from " + (supportBySubject[subjectId] || 0) + " explicitly completed research action(s) in a non-sensitive domain."
            : "In scope because it is a " + LANE_SOURCE[primary].replace("direct-", "") + ".",
          evidenceEventCategories: categoriesBySubject[subjectId] || [],
          relevanceConfidence: primary === "inferredRelevance"
            ? relevanceConfidence(supportBySubject[subjectId] || 0, input.policy.behavior)
            : "not-applicable-direct-scope",
          // Named apart from market/model confidence so the two can never be read as one number.
          confidenceKind: "relevance-only",
          horizon: horizonBySubject[subjectId] || null,
          recency: decayState(newestSupportBySubject[subjectId] || null, input.composedAt, input.policy.behavior),
          evidenceState: observed.coverageState || "unmeasured",
          // What would make this action stop being open. Without it a repeated window becomes a
          // permanent unresolved prompt (FR-054).
          triggerCondition: "Reviewed against the " + window.id + " evidence window.",
          completionCondition: "Marked complete through the explicit completion control.",
          invalidationCondition: "Supporting evidence ages past " + input.policy.behavior.maximumEvidenceAgeDays + " days, or local history is cleared.",
          deepLink: owners[subjectId] ? owners[subjectId].href : null,
          // FR-051/FR-052/FR-053: a research verb, never an order verb.
          researchVerb: primary === "held" ? "review" : "inspect"
        }
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

  return Object.freeze({
    contractVersion: CONTRACT_VERSION,
    laneOrder: LANE_ORDER.slice(),
    laneSource: LANE_SOURCE,
    researchVerbs: RESEARCH_VERBS.slice(),
    relevanceConfidenceScale: RELEVANCE_CONFIDENCE.slice(),
    /* Exported so the PUBLISHER can refuse a brief this module would reject, rather than shipping
       one and leaving every consumer to discover the conflict. One cutoff rule, two callers. */
    newYorkCivilCutoff: newYorkCivilCutoff,
    windowCutoffAt: windowCutoffAt,
    validateGenericWindow: validateGenericWindow,
    composeBrief: composeBrief,
    dedupeBehaviorEvents: dedupeBehaviorEvents,
    deriveInterestSignals: deriveInterestSignals,
    buildActionCandidates: buildActionCandidates,
    rankResearchActions: rankResearchActions,
    composePortfolioBrief: composePortfolioBrief,
    whyShown: whyShown,
    reduceResearchActionLifecycle: reduceResearchActionLifecycle
  });
}));
