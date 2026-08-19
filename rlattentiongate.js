/*
 * rlattentiongate.js — the OBSERVED half of decision-attention/v1.
 *
 * BUG-009 R1. The attention feed published nothing on every run because
 * `RLATTN.buildAttentionItem` refuses a candidate that carries no observed
 * `gateResult`, and no module anywhere produced one. The lane authors judgement;
 * nothing observed market state and said so in the gate's vocabulary.
 *
 * WHAT THIS MODULE DOES AND DOES NOT DECIDE. Every value it emits is either
 * (a) read straight off committed Tier-A state, or (b) the result of applying a
 * DECLARED band from `attention-detection-policy/v1` to such a reading. It holds
 * no thresholds of its own: `resolvePolicy` refuses a policy that does not carry
 * them, so a missing policy yields NO observation rather than a default-shaped
 * guess. The numbers live in market-brief.config.json where an owner can edit
 * them without touching code — which is the whole point, because a threshold is
 * a statement about when a person wants to be interrupted, not a fact about a
 * market.
 *
 * Every emitted gateResult carries the policy id it was judged under and the
 * figure that crossed, so a reader can always answer "why am I being shown
 * this?" with a number and a rule rather than a verdict.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module && module.exports) module.exports = api;
  if (root) root.RLATTNGATE = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var CONTRACT = "attention-gate/v1";
  var SEVERITIES = ["mild", "moderate", "severe"];
  var IMMINENCE = ["imminent", "developing", "latent"];
  var CONFIRMATION = ["present", "absent", "partial"];
  var DISPOSITIONS = ["attention", "context", "no-action"];

  function isPlainObject(v) { return !!v && typeof v === "object" && !Array.isArray(v); }
  function isNonEmptyString(v) { return typeof v === "string" && v.trim().length > 0; }
  function num(v) { return Number.isFinite(v) ? v : null; }

  /* A policy is USABLE only when it carries every band this module reads. A
     partially declared policy is refused whole: filling a gap with a default
     would be this module inventing the one thing it must not invent. */
  function resolvePolicy(policy) {
    if (!isPlainObject(policy)) return null;
    var bands = policy.severityBands;
    if (!Array.isArray(bands) || bands.length === 0) return null;
    var ok = bands.every(function (b) {
      return isPlainObject(b) && SEVERITIES.indexOf(b.severity) !== -1 && Number.isFinite(b.minAbsPct);
    });
    if (!ok) return null;
    if (!Number.isFinite(policy.imminentWithinPct) || !Number.isFinite(policy.developingWithinPct)) return null;
    if (!isPlainObject(policy.transmissionBySubject)) return null;
    if (!isNonEmptyString(policy.sourceToolId)) return null;
    if (!isNonEmptyString(policy.policyId)) return null;
    return policy;
  }

  /* Severity is the widest declared band the reading clears. A reading below the
     narrowest band is NOT "mild" — it is no observation at all, which is how the
     feed stays quiet on a quiet day. */
  function severityFor(absPct, policy) {
    var best = null;
    var bestMin = -1;
    policy.severityBands.forEach(function (b) {
      if (absPct >= b.minAbsPct && b.minAbsPct > bestMin) { best = b.severity; bestMin = b.minAbsPct; }
    });
    return best;
  }

  function imminenceFor(distanceToLevelPct, policy) {
    var d = Math.abs(distanceToLevelPct);
    if (d <= policy.imminentWithinPct) return "imminent";
    if (d <= policy.developingWithinPct) return "developing";
    return "latent";
  }

  /* Confirmation is READ, never inferred from the same number that produced the
     severity — otherwise a single reading would corroborate itself. The
     persistence gate is a separate, independently computed Tier-A flag. */
  function confirmationFor(tracked) {
    var flags = isPlainObject(tracked) && isPlainObject(tracked.flags) ? tracked.flags : null;
    if (!flags) return { state: "absent", note: "Tier-A published no persistence flags for this subject, so nothing corroborates the reading." };
    if (flags.persistenceGateMet === true) {
      return { state: "present", detail: "the Tier-A persistence gate is met for this subject across the published window" };
    }
    if (flags.persistenceGateMet === false) {
      return { state: "absent", note: "the Tier-A persistence gate is NOT met, so this reading has not persisted and is reported unconfirmed" };
    }
    return { state: "partial", note: "Tier-A published no persistence verdict, so corroboration is unknown rather than assumed" };
  }

  /* Disposition is the ONLY place loudness is decided, and it is deliberately
     conservative: a subject reaches `attention` only when a severe reading has
     independently persisted. Everything else is context or nothing. */
  function dispositionFor(severity, confirmationState) {
    if (severity === "severe" && confirmationState === "present") return "attention";
    if (severity === "severe" || severity === "moderate") return "context";
    return "no-action";
  }

  function figure(label, value, sourceId, asOf) {
    return { label: label, value: value, provenance: { sourceId: sourceId, asOf: asOf } };
  }

  /*
   * Build the observed half for ONE subject. Returns null when the subject is
   * not observable or clears no declared band — an absent observation, never a
   * quiet one.
   */
  function observeGate(input) {
    if (!isPlainObject(input)) return null;
    var policy = resolvePolicy(input.policy);
    if (!policy) return null;

    var subject = input.subject;
    var tracked = input.tracked;
    if (!isNonEmptyString(subject) || !isPlainObject(tracked)) return null;

    var asOf = isNonEmptyString(input.observedAt) ? input.observedAt
      : (isNonEmptyString(tracked.asOf) ? tracked.asOf : null);
    if (!asOf) return null;

    var ma200Dist = num(tracked.ma200Dist);
    var px = num(tracked.px);
    var levels = isPlainObject(tracked.levels) ? tracked.levels : {};
    var high52w = num(levels.high52w);

    if (ma200Dist === null) return null;

    var absPct = Math.abs(ma200Dist);
    var severity = severityFor(absPct, policy);
    if (!severity) return null;

    var fromHighPct = (px !== null && high52w !== null && high52w !== 0)
      ? ((px - high52w) / high52w) * 100 : null;

    var imminence = imminenceFor(ma200Dist, policy);
    var confirmation = confirmationFor(tracked);
    var disposition = dispositionFor(severity, confirmation.state);

    var channels = Array.isArray(policy.transmissionBySubject[subject])
      ? policy.transmissionBySubject[subject].slice() : [];

    var sourceId = isNonEmptyString(input.sourceId) ? input.sourceId : policy.sourceToolId;
    var figures = [figure("distance from 200-day", ma200Dist.toFixed(2) + "%", sourceId, asOf)];
    if (fromHighPct !== null) figures.push(figure("from 52-week high", fromHighPct.toFixed(2) + "%", sourceId, asOf));
    if (isNonEmptyString(tracked.maStack)) figures.push(figure("moving-average stack", tracked.maStack, sourceId, asOf));

    var gate = {
      contractVersion: CONTRACT,
      policyId: policy.policyId,
      subject: subject,
      disposition: disposition,
      severity: severity,
      imminence: imminence,
      observedAt: asOf,
      transmissionPath: channels,
      marketConfirmation: confirmation.state === "present"
        ? { state: "present", detail: confirmation.detail }
        : { state: confirmation.state },
      figures: figures,
      triggeredBy: {
        reading: "ma200Dist",
        value: ma200Dist,
        band: severity,
        minAbsPct: policy.severityBands.reduce(function (acc, b) {
          return (b.severity === severity && (acc === null || b.minAbsPct > acc)) ? b.minAbsPct : acc;
        }, null)
      }
    };
    if (confirmation.state !== "present") gate.marketConfirmationNote = confirmation.note;
    if (channels.length === 0 && imminence === "imminent") {
      gate.transmissionAbsenceNote = "no transmission channel is declared for this subject in attention-detection-policy/v1, so none is claimed";
    }
    return gate;
  }

  /* Attach an observed half to candidates that lack one. A candidate that already
     carries `observed` is returned untouched — this never overwrites an
     observation someone else made. */
  function attachObserved(candidates, snapshot, policy, options) {
    if (!Array.isArray(candidates)) return [];
    var tracked = isPlainObject(snapshot) && isPlainObject(snapshot.tracked) ? snapshot.tracked : {};
    var opts = isPlainObject(options) ? options : {};
    return candidates.map(function (candidate) {
      if (!isPlainObject(candidate)) return candidate;
      if (isPlainObject(candidate.observed)) return candidate;
      var subject = isNonEmptyString(candidate.subject) ? candidate.subject : null;
      if (!subject || !isPlainObject(tracked[subject])) return candidate;
      var gate = observeGate({
        subject: subject,
        tracked: tracked[subject],
        policy: policy,
        observedAt: isNonEmptyString(snapshot.asOf) ? snapshot.asOf : null,
        sourceId: opts.sourceId
      });
      if (!gate) return candidate;
      var next = {};
      Object.keys(candidate).forEach(function (k) { next[k] = candidate[k]; });
      next.observed = gate;
      return next;
    });
  }

  return Object.freeze({
    CONTRACT: CONTRACT,
    SEVERITIES: Object.freeze(SEVERITIES.slice()),
    IMMINENCE: Object.freeze(IMMINENCE.slice()),
    CONFIRMATION: Object.freeze(CONFIRMATION.slice()),
    DISPOSITIONS: Object.freeze(DISPOSITIONS.slice()),
    resolvePolicy: resolvePolicy,
    severityFor: severityFor,
    imminenceFor: imminenceFor,
    confirmationFor: confirmationFor,
    dispositionFor: dispositionFor,
    observeGate: observeGate,
    attachObserved: attachObserved
  });
}));
