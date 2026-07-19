/*
 * tests/distributed-briefs.authorship.e2e.mjs — Feature 002 Scope 06 (SCN-002-004/005/006).
 *
 * Scenario-specific persistent regression tests over the full production authorship graph: freezing the
 * live 22-source registry into one validated brief outcome per source (complete barrier, aggregator never
 * self-consumed, no invented evidence), proving unchanged/duplicate work creates no author call, no new
 * event, and no second content object, and proving the recommendation lifecycle preserves prior terms,
 * merges independent origins at minimum-retained confidence with shared causes counted once, and exposes
 * conflicts.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { freezeToolReads, runToolAuthorPool, resolveBriefReuse } from '../scripts/brief-refresh.mjs';
import { buildToolAuthorRequest, validateAuthorEnvelope, AUTHOR_ERRORS } from '../scripts/brief-author.mjs';
import { eligibleOwnerRead, recommendationRecord, profileBudgets, runBudget, authorIdentity, noRecommendationTransport, makeHash } from './fixtures/feature-002/authorship/brief-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

function readRegistry() {
  return JSON.parse(readFileSync(new URL('../tools.json', import.meta.url), 'utf8'));
}
function registryConfig() {
  return {
    profiles: {
      'live-market': { freshnessPolicy: 'daily-market-bars-v1', recommendationPolicy: 'market-action-v1', budgetPolicy: 'live-market-v1' },
      'static-model': { freshnessPolicy: 'static-model-asof-v1', recommendationPolicy: 'model-conclusion-v1', budgetPolicy: 'static-model-v1' },
      'local-model': { freshnessPolicy: 'committed-projection-v1', recommendationPolicy: 'operational-next-step-v1', budgetPolicy: 'local-model-v1' },
      'off-theme': { freshnessPolicy: 'off-theme-not-applicable-v1', recommendationPolicy: 'domain-next-step-v1', budgetPolicy: 'off-theme-v1' },
      'final-aggregator': { freshnessPolicy: 'final-aggregation-v1', recommendationPolicy: 'final-synthesis-v1', budgetPolicy: 'final-aggregator-v1' }
    }
  };
}
function evidenceBundle() {
  const h = (seed) => `sha256:${createHash('sha256').update(seed).digest('hex')}`;
  return {
    contractVersion: 'market-session-evidence/v1', cutoffAt: '2026-07-14T12:40:00.000Z', fingerprint: h('bundle-e2e'),
    sessionAggregateRefs: [{ evidenceType: 'session-aggregate', fingerprint: h('agg-e2e') }],
    volumeBaselineRefs: [{ evidenceType: 'comparable-volume-baseline', fingerprint: h('base-e2e') }],
    releasedReportRefs: [{ evidenceType: 'released-report-evidence', fingerprint: h('rep-e2e') }],
    eventReactionRefs: [{ evidenceType: 'event-market-reaction', fingerprint: h('rx-e2e') }]
  };
}
function poolAuthorFn() {
  const rawTransport = noRecommendationTransport();
  return async (request) => ({ ok: true, envelope: JSON.parse(await rawTransport(JSON.stringify(request))) });
}
const RUN = { occurredAt: '2026-07-14T12:41:00.000Z', canonicalMonth: '2026-07' };

test('Regression: SCN-002-004 all 22 source reads reach one truthful validated brief outcome', async () => {
  const frozen = freezeToolReads(readRegistry(), { evidence: evidenceBundle(), registryConfig: registryConfig() }, { symbol: 'SPY' });
  const budgets = profileBudgets();
  const reads = frozen.orderedSourceToolIds.map((toolId) => ({ toolId, read: frozen.reads[toolId], profile: frozen.reads[toolId].profile, profileBudget: budgets[frozen.reads[toolId].profile] }));

  const pool = await runToolAuthorPool({ reads, identity: authorIdentity(), runBudget: runBudget(22), workers: 4, maxRetries: 2, authorFn: poolAuthorFn() });
  assert.equal(pool.ok, true, pool.ok ? '' : JSON.stringify(pool.refusal));

  // The all-source barrier: the outcome IDs EXACTLY equal orderedSourceToolIds and the final aggregator is
  // never self-consumed — no source is omitted or invented.
  assert.deepEqual(Object.keys(pool.outcomes).sort(), frozen.orderedSourceToolIds.slice().sort());
  assert.equal(Object.keys(pool.outcomes).length, 22);
  assert.equal(pool.outcomes[frozen.aggregatorToolId], undefined);
  for (const toolId of frozen.orderedSourceToolIds) {
    const outcome = pool.outcomes[toolId];
    assert.ok(['newly-authored', 'carried-forward', 'no-recommendation', 'coverage-only'].includes(outcome.brief.outcome));
    assert.equal(RLCONTRACTS.validateToolBrief(outcome.brief, frozen.reads[toolId], frozen.reads[toolId].profile).ok, true);
  }

  // Truthful evidence: a brief tampered to cite an evidence identity absent from its owner read is
  // rejected — a source outcome can never invent evidence (the SCN-002-004 red-stage discriminator).
  const firstId = frozen.orderedSourceToolIds[0];
  const tampered = JSON.parse(JSON.stringify(pool.outcomes[firstId].brief));
  tampered.evidenceRefs = [{ evidenceType: 'session-aggregate', fingerprint: 'sha256:' + 'e'.repeat(64) }];
  assert.equal(RLCONTRACTS.validateToolBrief(tampered, frozen.reads[firstId], frozen.reads[firstId].profile).error.reason, 'tool-brief-evidence-not-in-read');
});

test('Regression: SCN-002-005 unchanged and duplicate work creates no author prose event or cost churn', async () => {
  const budgets = profileBudgets();
  const read = eligibleOwnerRead();
  const policy = { promptPolicyVersion: 'tool-brief-prompt/v1', schemaVersion: 'tool-brief/v1', modelId: 'gpt-5', validatorVersion: 'tool-brief-validator/v1', runId: 'run-reuse', occurredAt: RUN.occurredAt };

  // Unchanged read reuse: with a matching current index the brief is reused by reference — ZERO author
  // calls — and the occurrence records the current run without rewriting authorship.
  const first = resolveBriefReuse(read, policy, {});
  assert.equal(first.reuse, false);
  const currentIndex = { [read.toolId]: { inputFingerprint: first.inputFingerprint, briefRef: { path: `briefs/objects/briefs/${read.toolId}.json`, sha256: makeHash('brief-obj') }, contentFingerprint: makeHash('content') } };
  const reused = resolveBriefReuse(read, policy, currentIndex);
  assert.equal(reused.reuse, true);
  assert.equal(reused.briefRef.sha256, currentIndex[read.toolId].briefRef.sha256);

  // A changed read (new evidence/freshness fingerprint) can NOT carry forward — the input fingerprint
  // moves, so a live-market brief is re-authored rather than reused.
  const changed = { ...read, fingerprint: makeHash('read-sector-changed') };
  assert.equal(resolveBriefReuse(changed, policy, currentIndex).reuse, false);

  // Idempotent reduction: running the same reduce twice produces IDENTICAL event IDs and index fingerprint
  // — a duplicate run appends no new event and no cost churn (the SCN-002-005 red-stage discriminator).
  const rec = recommendationRecord();
  const r1 = RLCONTRACTS.reduceRecommendationEvents(null, [rec], { runId: 'run-idem', ...RUN });
  const r2 = RLCONTRACTS.reduceRecommendationEvents(null, [rec], { runId: 'run-idem', ...RUN });
  assert.deepEqual(r1.value.events.map((event) => event.eventId), r2.value.events.map((event) => event.eventId));
  assert.equal(r1.value.index.indexFingerprint, r2.value.index.indexFingerprint);
  // Reaffirming identical terms in a later run copies no narrative (observationTerms null).
  const reaffirm = RLCONTRACTS.reduceRecommendationEvents(r1.value.index, [rec], { runId: 'run-reaffirm', ...RUN });
  assert.deepEqual(reaffirm.value.events.map((event) => event.eventType), ['reaffirmed']);
  assert.equal(reaffirm.value.events[0].observationTerms, null);

  // A duplicate author response against a shared seen-set is rejected: a retry never creates a second
  // content object.
  const request = buildToolAuthorRequest(RLCONTRACTS.compactAuthorInput(read, budgets['live-market']).value, authorIdentity()).request;
  const envelope = JSON.parse(await noRecommendationTransport()(JSON.stringify(request)));
  const seen = new Set();
  assert.equal(validateAuthorEnvelope(envelope, request, { seen }).ok, true);
  assert.equal(validateAuthorEnvelope(envelope, request, { seen }).error.code, AUTHOR_ERRORS.DUPLICATE);
});

test('Regression: SCN-002-006 recommendation lifecycle preserves prior terms merges origins and exposes conflicts', () => {
  // Propose then materially modify: the prior observation terms remain addressable after the change.
  const rec = recommendationRecord();
  const keys = RLCONTRACTS.deriveRecommendationKeys(rec);
  const r1 = RLCONTRACTS.reduceRecommendationEvents(null, [rec], { runId: 'run-1', ...RUN });
  const recMod = recommendationRecord({ trigger: 'XLK breaks above the prior swing high' });
  const r2 = RLCONTRACTS.reduceRecommendationEvents(r1.value.index, [recMod], { runId: 'run-2', ...RUN });
  assert.deepEqual(r2.value.events.map((event) => event.eventType), ['modified']);
  const entry = r2.value.index.entries[keys.originRecommendationKey];
  assert.ok(entry.observations[keys.observationFingerprint], 'prior terms remain addressable after modify');

  // Independent origins merge with minimum-retained confidence (never averaged); shared evidence counts
  // once as a single confirmation (the SCN-002-006 red-stage discriminator on confidence).
  const independentA = recommendationRecord({ originToolId: 'sector-research-lab', rationaleEvidenceIds: ['rrg'], confidenceScore: 64 });
  const independentB = recommendationRecord({ originToolId: 'etf-momentum-lab', rationaleEvidenceIds: ['mom'], confidenceScore: 50 });
  const merged = RLCONTRACTS.groupRecommendations([independentA, independentB]);
  assert.equal(merged.value.groups.length, 1);
  assert.equal(merged.value.groups[0].independentOriginCount, 2);
  assert.equal(merged.value.groups[0].mergedConfidenceScore, 50);

  const sharedA = recommendationRecord({ originToolId: 'sector-research-lab', rationaleEvidenceIds: ['shared'], confidenceScore: 64 });
  const sharedB = recommendationRecord({ originToolId: 'bond-regime-lab', rationaleEvidenceIds: ['shared'], confidenceScore: 71 });
  const sharedGroup = RLCONTRACTS.groupRecommendations([sharedA, sharedB]);
  assert.equal(sharedGroup.value.groups[0].independentOriginCount, 1);
  assert.equal(sharedGroup.value.groups[0].mergedConfidenceScore, 64);

  // Incompatible direction on a shared subject stays a separate visible conflict.
  const bullish = recommendationRecord({ originToolId: 'sector-research-lab', subjects: ['XLK'], actionFamily: 'add', rationaleEvidenceIds: ['breadth'] });
  const bearish = recommendationRecord({ originToolId: 'etf-momentum-lab', subjects: ['XLK'], actionFamily: 'trim', rationaleEvidenceIds: ['momentum'] });
  const conflicted = RLCONTRACTS.groupRecommendations([bullish, bearish]);
  assert.equal(conflicted.value.conflicts.length, 1);
  assert.equal(conflicted.value.groups.length, 2);
});
