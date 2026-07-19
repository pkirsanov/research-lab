/*
 * tests/distributed-briefs.authorship.integration.mjs — Feature 002 Scope 06 (SCN-002-004/005).
 *
 * Integration coverage for the production shared author pool: freeze the live 22-source registry into
 * ToolModelRead outcomes, then drive runToolAuthorPool over every source with a production-shaped author
 * transport. The pool must resolve one validated brief outcome per source ID with AT MOST four concurrent
 * author processes (independently counted), one call per source, and zero retries or omissions.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import test from 'node:test';

import { freezeToolReads, runToolAuthorPool } from '../scripts/brief-refresh.mjs';
import { profileBudgets, runBudget, authorIdentity, noRecommendationTransport } from './fixtures/feature-002/authorship/brief-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

function readRegistry() {
  return JSON.parse(require('node:fs').readFileSync(new URL('../tools.json', import.meta.url), 'utf8'));
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
    contractVersion: 'market-session-evidence/v1', cutoffAt: '2026-07-14T12:40:00.000Z', fingerprint: h('bundle-int'),
    sessionAggregateRefs: [{ evidenceType: 'session-aggregate', fingerprint: h('agg-int') }],
    volumeBaselineRefs: [{ evidenceType: 'comparable-volume-baseline', fingerprint: h('base-int') }],
    releasedReportRefs: [{ evidenceType: 'released-report-evidence', fingerprint: h('rep-int') }],
    eventReactionRefs: [{ evidenceType: 'event-market-reaction', fingerprint: h('rx-int') }]
  };
}

test('production pool resolves all 22 source outcomes with at most four active author processes', async () => {
  const registry = readRegistry();
  const config = registryConfig();
  const budgets = profileBudgets();
  const frozen = freezeToolReads(registry, { evidence: evidenceBundle(), registryConfig: config }, { symbol: 'SPY' });
  assert.equal(frozen.sourceCount, 22);
  assert.equal(Object.keys(frozen.reads).length, 22);

  const reads = frozen.orderedSourceToolIds.map((toolId) => {
    const read = frozen.reads[toolId];
    return { toolId, read, profile: read.profile, profileBudget: budgets[read.profile] };
  });

  // Independently observe live author concurrency; a small delay lets the four-worker pool overlap.
  let active = 0;
  let observedPeak = 0;
  const rawTransport = noRecommendationTransport();
  const authorFn = async (request) => {
    active += 1;
    observedPeak = Math.max(observedPeak, active);
    await new Promise((resolve) => setTimeout(resolve, 6));
    const raw = await rawTransport(JSON.stringify(request));
    active -= 1;
    return { ok: true, envelope: JSON.parse(raw) };
  };

  const pool = await runToolAuthorPool({
    reads,
    identity: authorIdentity(),
    runBudget: runBudget(22),
    workers: 4,
    maxRetries: 2,
    authorFn
  });

  assert.equal(pool.ok, true, pool.ok ? '' : JSON.stringify(pool.refusal));
  // Exactly one validated outcome per source ID — no omission and no invented participant.
  assert.deepEqual(Object.keys(pool.outcomes).sort(), frozen.orderedSourceToolIds.slice().sort());
  assert.equal(Object.keys(pool.outcomes).length, 22);
  for (const toolId of frozen.orderedSourceToolIds) {
    const outcome = pool.outcomes[toolId];
    assert.equal(outcome.outcome, 'newly-authored');
    assert.equal(outcome.attempts, 1);
    // Each returned brief independently re-validates through the pure ToolBrief validator against its read.
    assert.equal(RLCONTRACTS.validateToolBrief(outcome.brief, frozen.reads[toolId], frozen.reads[toolId].profile).ok, true);
  }

  // Concurrency never exceeds four (independent observation AND pool telemetry), and it genuinely overlaps.
  assert.ok(observedPeak <= 4, `observed peak concurrency ${observedPeak} must not exceed 4`);
  assert.ok(observedPeak >= 2, `observed peak concurrency ${observedPeak} must show real overlap`);
  assert.ok(pool.telemetry.peakConcurrency <= 4);
  assert.equal(pool.telemetry.calls, 22);
  assert.equal(pool.telemetry.retries, 0);
});
