/*
 * scripts/recommendation-claim-mint.mjs — Feature 015 scope 02, the publisher mint hook.
 *
 * The publisher already builds one recommendation event per authored action. This mints the
 * scope-01 claim for the same action in the same pass and hands back the `claimRef` pointer the
 * ledger row will carry.
 *
 * Two structural properties are deliberate and are what the unit rows assert.
 *
 * It runs AFTER the events exist and only ever ADDS a key. `eventId` is hashed from
 * `{ contractVersion, runFingerprint, recommendationKey, index }` and `recommendationKey` from
 * `{ subject, family }` — neither is a hash of the row — so a hook that cannot reach into their
 * derivation cannot perturb them. Threading the mint INTO the event builder would have made that
 * a promise; ordering it after makes it a property.
 *
 * And a mint that does not produce a fully evaluable claim yields NO `claimRef`, carrying its
 * reason forward on the event instead. A claimless row is unscoreable by construction under
 * RTR-LEGACY-BACKFILL, which is the honest outcome for an action whose subject is prose the
 * resolver cannot look up. Attaching a pointer anyway would promise a score that would have to be
 * invented later.
 *
 * Nothing here can break publication. Every read and every mint is guarded, because an additive,
 * still-gated pointer must never be able to stop a brief from being published — but the
 * degradation is RECORDED on the event rather than silent.
 */
import { createRequire } from 'node:module';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const claims = require('../rlclaims.js');

/** The field the event carries when no claim could be pointed at. Never reaches a ledger row. */
export const CLAIM_NOT_EVALUABLE_FIELD = 'claimNotEvaluable';

/**
 * The three inputs `mintClaim` needs that live on disk. Read once per run, never per action.
 * A failure yields `{ ok: false, notEvaluable }` rather than throwing: the caller degrades every
 * event to claimless with that named reason.
 */
export function loadMintContext(root) {
  const base = typeof root === 'string' && root ? root : '.';
  const read = (label, relative, parse) => {
    try {
      return { ok: true, value: parse(path.join(base, relative)) };
    } catch (error) {
      return { ok: false, reason: 'mint-context-unavailable', field: label };
    }
  };

  const vocabulary = read('actionVocabulary', claims.ACTION_VOCABULARY_SOURCE, (p) =>
    claims.readFoundationActionVocabulary(readFileSync(p, 'utf8')));
  if (!vocabulary.ok) return { ok: false, notEvaluable: vocabulary };

  const series = read('committedSeries', claims.BARS_DIR, (p) =>
    claims.enumerateCommittedSeries(readdirSync(p)));
  if (!series.ok) return { ok: false, notEvaluable: series };

  // A missing registry costs only `citedToolId`, which never refuses a mint — so it degrades to
  // an empty registry rather than disabling the hook for every action.
  let toolsRegistry = null;
  try { toolsRegistry = JSON.parse(readFileSync(path.join(base, 'tools.json'), 'utf8')); } catch (error) { toolsRegistry = null; }

  return {
    ok: true,
    context: {
      actionVocabulary: vocabulary.value,
      committedSeries: series.value,
      toolsRegistry,
    },
  };
}

function authoredActions(payload) {
  if (!payload || typeof payload !== 'object') return [];
  const next = payload.nextSession;
  if (!next || typeof next !== 'object' || !Array.isArray(next.actions)) return [];
  return next.actions;
}

function refusalFrom(reason, field) {
  return { reason, field };
}

/**
 * One mint record per event, index-aligned with `recommendationRowsFromPayload`'s own
 * `actions.map(...)`. Index alignment alone would be a silent hazard, so the minted claim's
 * `recommendationKey` — derived from the same `{ subject, family }` the publisher hashed — is
 * checked against the event's. A mismatch yields no pointer: binding a claim to the WRONG event
 * is strictly worse than binding none.
 */
export function mintClaimRecords(events, payload, options) {
  const opts = options || {};
  const rows = Array.isArray(events) ? events : [];
  const actions = authoredActions(payload);

  const loaded = opts.context ? { ok: true, context: opts.context } : loadMintContext(opts.root);
  if (!loaded.ok) {
    const unavailable = refusalFrom(loaded.notEvaluable.reason, loaded.notEvaluable.field);
    return rows.map(() => ({ claimRef: null, claim: null, notEvaluable: unavailable }));
  }

  return rows.map((event, index) => {
    const action = actions[index];
    if (!action || typeof action !== 'object') {
      return { claimRef: null, claim: null, notEvaluable: refusalFrom('no-authored-action', 'nextSession.actions') };
    }

    let minted;
    try {
      minted = claims.mintClaim({
        action,
        actionVocabulary: loaded.context.actionVocabulary,
        committedSeries: loaded.context.committedSeries,
        toolsRegistry: loaded.context.toolsRegistry,
        proposalRunId: typeof opts.proposalRunId === 'string' ? opts.proposalRunId : null,
        proposalEventId: typeof event.eventId === 'string' ? event.eventId : null,
        proposedAt: typeof opts.proposedAt === 'string' ? opts.proposedAt : null,
      });
    } catch (error) {
      return { claimRef: null, claim: null, notEvaluable: refusalFrom('mint-threw', 'action') };
    }

    if (!minted || minted.ok !== true) {
      const error = minted && minted.error ? minted.error : {};
      return {
        claimRef: null,
        claim: null,
        notEvaluable: { reason: error.reason || 'mint-refused', field: error.field || 'action', code: error.code || claims.CONTRACT_VIOLATION_CODE },
      };
    }

    const claim = minted.claim;
    if (claim.recommendationKey !== event.recommendationKey) {
      return { claimRef: null, claim, notEvaluable: refusalFrom('recommendation-key-mismatch', 'recommendationKey') };
    }
    if (claim.notEvaluable !== null) {
      return { claimRef: null, claim, notEvaluable: claim.notEvaluable };
    }
    return { claimRef: claim.claimHash, claim, notEvaluable: null };
  });
}

/**
 * The publisher-facing form: the same events, each gaining EITHER `claimRef` or the honest
 * reason it has none. No other key is touched, so `eventId` and `recommendationKey` travel
 * through byte-identical.
 */
export function attachClaimRefs(events, payload, options) {
  const rows = Array.isArray(events) ? events : [];
  const records = mintClaimRecords(rows, payload, options);
  return rows.map((event, index) => {
    const record = records[index];
    if (record.claimRef !== null) return { ...event, [claims.CLAIM_REF_FIELD]: record.claimRef };
    return { ...event, [CLAIM_NOT_EVALUABLE_FIELD]: record.notEvaluable };
  });
}
