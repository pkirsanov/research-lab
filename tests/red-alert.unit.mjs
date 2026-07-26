/*
 * tests/red-alert.unit.mjs
 * ------------------------------------------------------------------------
 * Feature 012 Scope 12 — Dynamic Red Alert discovery/qualification/projection
 * UNIT contract suite (TP-12-01).
 *
 * Drives the REAL rlmarketaction.js Red Alert engine over INLINE observations
 * (anomaly seeds, WebEvidenceBundle-shaped material claims, and a candidate
 * discovery hypothesis) and proves — against the PRODUCTION transform, never a
 * fixture echo:
 *   - the AnomalySeed / RedAlertCandidate / RedAlert / lifecycle / projection
 *     contracts and their exact closed refusals;
 *   - the explainable ADMISSION SCORE component math and that the total is an
 *     admission index, never a probability / confidence / crash-odds claim;
 *   - all seven hard admission gates, each proven by an adversarial mutation of
 *     the observations that flips qualified -> rejected with a safe reason class;
 *   - semantic de-duplication and APPEND-ONLY lifecycle (changed thesis
 *     supersedes, never rewrites);
 *   - the valid explicit EMPTY projection with cutoff/channels/coverage and NO
 *     illustrative topic, and the visible-cap overflow behaviour;
 *   - that a rejected/hostile candidate title is never projected or echoed.
 *
 * The engine is PURE and channels are classification labels only; there is no
 * named-topic candidate list anywhere in this suite (that is a security-suite
 * static-scan concern). Every candidate here is derived/qualified by production.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RA = require(resolve(ROOT, 'rlmarketaction.js'));

const CUTOFF = '2026-07-24T20:00:00.000Z';

/* ── inline builders (OBSERVATIONS only; production derives the outcome) ── */

/* a WebEvidenceBundle/v1-shaped material claim exactly as Scope 10 acquire()
   emits it: independent origin groups, owner-evidence refs, corroboration and
   freshness are OBSERVED facts the Red Alert engine consumes. */
function materialClaim(overrides) {
  return Object.assign({
    claimId: 'claim-funding',
    materiality: 'material',
    claimKind: 'market-state',
    normalizedClaim: 'Cross-currency funding basis widened sharply this week.',
    sourceExcerptRefs: ['s1:e0', 's2:e0'],
    independentOriginGroups: ['origin:a', 'origin:b'],
    ownerEvidenceRefs: ['market-heatmap-lab:read-1'],
    corroborationState: 'corroborated',
    conflictState: 'consistent',
    freshnessState: 'current',
    authorable: true
  }, overrides || {});
}

function bundle(claims, overrides) {
  return Object.assign({
    contractVersion: 'web-evidence-bundle/v1',
    bundleId: 'run/x:bundle',
    toolId: 'market-brief',
    runId: 'run/x',
    cutoffAt: CUTOFF,
    policyId: 'web-evidence-acquisition/v1:red-alert',
    queryPlanRef: 'sha256:' + '0'.repeat(64),
    acquisitionStartedAt: CUTOFF,
    frozenAt: CUTOFF,
    sources: [],
    claims: claims,
    rejected: [],
    coverage: {},
    byteInventory: {},
    bundleFingerprint: 'sha256:' + '1'.repeat(64)
  }, overrides || {});
}

function seed(overrides) {
  return Object.assign({
    seedId: 'seed-1',
    ownerToolId: 'market-heatmap-lab',
    evidenceRefs: ['market-heatmap-lab:read-1'],
    observedCondition: 'funding basis widened beyond the 95th percentile band',
    normalizedEntities: ['xccy-basis', 'usd-funding'],
    transmissionChannels: ['credit-funding', 'fx-carry'],
    magnitudeOrState: 'p97',
    cutoffAt: CUTOFF,
    freshness: 'current',
    limitations: ['single owner read; corroboration pending']
  }, overrides || {});
}

/* a full discovery hypothesis: the falsifiable proposal a discovery step makes.
   It is NOT a verdict — production qualifies it against the observed bundle. */
function hypothesis(overrides) {
  return Object.assign({
    clusterId: 'cluster-1',
    cutoffAt: CUTOFF,
    thesis: 'Bank cross-currency funding stress is transmitting into carry unwinds.',
    severity: 5,
    likelihoodInterval: [0.4, 0.6],
    horizon: '0-2w',
    uncertainty: 'wide; depends on quarter-end funding rollover',
    whyNow: 'Basis and carry both dislocated within the same current window.',
    trigger: 'Basis breaches the prior wide with a carry drawdown confirmation.',
    invalidation: 'Basis normalizes to its 1y median for five sessions.',
    monitoring: 'Track the basis band and the funding owner read daily.',
    resolution: 'Alert resolves when basis and carry both re-anchor.',
    propagation: [
      { from: 'credit-funding', to: 'fx-carry' },
      { from: 'fx-carry', to: 'volatility-options' }
    ],
    affectedAssets: ['DBC', 'GLD'],
    exposureClasses: ['carry', 'funding'],
    researchActions: [
      { verb: 'monitor', detail: 'Watch the funding basis band into quarter end.' },
      { verb: 'verify', detail: 'Reconcile the basis claim against a second wire origin.' }
    ],
    materialClaims: [
      { claimId: 'claim-funding', channel: 'credit-funding', kind: 'market-state' },
      { claimId: 'claim-carry', channel: 'fx-carry', kind: 'market-state' }
    ]
  }, overrides || {});
}

function twoChannelBundle(over1, over2) {
  return bundle([
    materialClaim(Object.assign({ claimId: 'claim-funding' }, over1 || {})),
    materialClaim(Object.assign({
      claimId: 'claim-carry',
      normalizedClaim: 'Carry pairs unwound as funding tightened.',
      independentOriginGroups: ['origin:c', 'origin:d'],
      ownerEvidenceRefs: ['sector-research-lab:read-2'],
      sourceExcerptRefs: ['s3:e0', 's4:e0']
    }, over2 || {}))
  ]);
}

function assembleQualified(bundleOverride, hypoOverride) {
  const input = Object.assign({ bundle: bundleOverride || twoChannelBundle() }, hypothesis(hypoOverride));
  const built = RA.assembleCandidate(input);
  assert.equal(built.ok, true, 'assembleCandidate should accept a well-formed hypothesis + bundle');
  return built.value;
}

/* ═══════════ constants / contract surface ═══════════ */

test('exposes the closed Red Alert contract surface', () => {
  assert.ok(RA.RED_ALERT_CONTRACT && RA.RED_ALERT_CONTRACT.candidate === 'red-alert-candidate/v1');
  assert.equal(RA.RED_ALERT_CONTRACT.alert, 'red-alert/v1');
  assert.equal(RA.RED_ALERT_CONTRACT.projection, 'red-alert-projection/v1');
  assert.equal(RA.RED_ALERT_CONTRACT.seed, 'anomaly-seed/v1');
  assert.deepEqual([...RA.TRANSMISSION_CHANNELS].sort(), [
    'breadth-market-structure', 'commodities-energy', 'counterparty-operational',
    'credit-funding', 'fx-carry', 'geopolitical-supply-chain', 'rates-liquidity', 'volatility-options'
  ]);
  assert.ok(RA.LIFECYCLE_STATES.includes('discovered') && RA.LIFECYCLE_STATES.includes('stale'));
  assert.ok(RA.REJECTION_REASON_CLASSES.includes('insufficient-corroboration'));
  assert.ok(RA.REJECTION_REASON_CLASSES.includes('no-observable-market-evidence'));
  assert.ok(RA.REJECTION_REASON_CLASSES.includes('score-below-threshold'));
});

test('the default admission policy is threshold 75, cap 5, and weights sum to 100', () => {
  const policy = RA.DEFAULT_RED_ALERT_POLICY;
  assert.equal(policy.contractVersion, 'red-alert-policy/v1');
  assert.equal(policy.scoreThreshold, 75);
  assert.equal(policy.visibleCap, 5);
  assert.equal(policy.minSeverity, 4);
  assert.equal(policy.minIndependentOrigins, 2);
  const total = Object.values(policy.components).reduce((s, c) => s + c.weight, 0);
  assert.equal(total, 100, 'the six score components must weight to exactly 100');
});

/* ═══════════ AnomalySeed/v1 ═══════════ */

test('validateAnomalySeed accepts a well-formed seed and rejects malformed ones', () => {
  assert.equal(RA.validateAnomalySeed(seed()).ok, true);
  const noOwner = RA.validateAnomalySeed(seed({ ownerToolId: '' }));
  assert.equal(noOwner.ok, false);
  assert.equal(noOwner.error.code, 'RLMKT-SEED');
  const badChannel = RA.validateAnomalySeed(seed({ transmissionChannels: ['definitely-a-crash'] }));
  assert.equal(badChannel.ok, false);
  assert.equal(badChannel.error.code, 'RLMKT-SEED');
  assert.equal(badChannel.error.valueEchoed, false, 'a rejected seed must not echo its raw value');
  const noEntities = RA.validateAnomalySeed(seed({ normalizedEntities: [] }));
  assert.equal(noEntities.ok, false);
});

/* ═══════════ clustering ═══════════ */

test('clusterAnomalySeeds groups overlapping entities/channels and separates disjoint seeds', () => {
  const a = seed({ seedId: 'a', normalizedEntities: ['xccy-basis'], transmissionChannels: ['credit-funding'] });
  const b = seed({ seedId: 'b', normalizedEntities: ['xccy-basis', 'jpy'], transmissionChannels: ['fx-carry'], evidenceRefs: ['owner:2'] });
  const c = seed({ seedId: 'c', ownerToolId: 'options-flow-feed-lab', normalizedEntities: ['spx-skew'], transmissionChannels: ['volatility-options'], evidenceRefs: ['owner:3'] });
  const res = RA.clusterAnomalySeeds([a, b, c]);
  assert.equal(res.ok, true);
  const clusters = res.value.clusters;
  assert.equal(clusters.length, 2, 'overlapping-entity seeds cluster; the disjoint seed is its own cluster');
  const big = clusters.find((cl) => cl.seedIds.length === 2);
  assert.ok(big && big.seedIds.includes('a') && big.seedIds.includes('b'));
  assert.ok(big.transmissionChannels.includes('credit-funding') && big.transmissionChannels.includes('fx-carry'));
});

/* ═══════════ query-plan derivation (no named topic) ═══════════ */

test('buildQueryPlanInput derives channel-classified queries from observed entities, not a topic catalog', () => {
  const cluster = RA.clusterAnomalySeeds([seed()]).value.clusters[0];
  const plan = RA.buildQueryPlanInput(cluster, { toolId: 'market-brief', runId: 'run/x' });
  assert.equal(plan.ok, true);
  assert.ok(Array.isArray(plan.value.templates) && plan.value.templates.length > 0);
  assert.equal(plan.value.cutoffAt, CUTOFF);
  /* the derived query terms come from the OBSERVED entities/channels, never a hardcoded threat term. */
  const rendered = JSON.stringify(plan.value.templates).toLowerCase();
  assert.ok(rendered.includes('xccy-basis') || rendered.includes('usd-funding'), 'query terms derive from observed entities');
  for (const topic of ['usd/jpy', 'private credit', 'capex', 'war']) {
    assert.equal(rendered.includes(topic), false, `no illustrative topic (${topic}) may be baked into a derived plan`);
  }
});

/* ═══════════ candidate assembly ═══════════ */

test('assembleCandidate builds a RedAlertCandidate/v1 whose channels/origins/owner-evidence derive from the bundle', () => {
  const candidate = assembleQualified();
  assert.equal(candidate.contractVersion, 'red-alert-candidate/v1');
  assert.equal(candidate.lifecycleState, 'evidence-building');
  assert.deepEqual([...candidate.channels].sort(), ['credit-funding', 'fx-carry']);
  assert.equal(candidate.independentOriginGroupCount >= 2, true);
  assert.ok(candidate.ownerMarketEvidenceRefs.length >= 1);
  assert.equal(candidate.claimRefs.length, 2);
  assert.ok(typeof candidate.fingerprint === 'string' && candidate.fingerprint.startsWith('sha256:'));
});

test('assembleCandidate rejects a hypothesis that names a material claim absent from the bundle', () => {
  const input = Object.assign({ bundle: twoChannelBundle() }, hypothesis({
    materialClaims: [{ claimId: 'claim-ghost', channel: 'credit-funding', kind: 'market-state' }]
  }));
  const built = RA.assembleCandidate(input);
  assert.equal(built.ok, false);
  assert.equal(built.error.code, 'RLMKT-CANDIDATE');
});

test('assembleCandidate rejects a bundle whose cutoff disagrees with the hypothesis cutoff', () => {
  const built = RA.assembleCandidate(Object.assign(
    { bundle: twoChannelBundle(null, null) },
    hypothesis({ cutoffAt: '2026-07-25T20:00:00.000Z' })
  ));
  assert.equal(built.ok, false);
  assert.equal(built.error.code, 'RLMKT-CANDIDATE');
});

/* ═══════════ admission score (explainable index, NOT probability) ═══════════ */

test('scoreCandidate computes the exact explainable component math and calls the total an admission score', () => {
  const candidate = assembleQualified();
  const scored = RA.scoreCandidate(candidate);
  assert.equal(scored.ok, true);
  const c = scored.value.components;
  assert.equal(c.severity, 25, 'severity 5 -> 5/5*25 = 25');
  assert.equal(c.likelihood, 7.5, 'likelihood midpoint 0.5 -> 0.5*15 = 7.5');
  assert.equal(c.observableTransmission, 13.33, '2 verified channels -> 2/3*20 = 13.33');
  assert.equal(c.evidenceStrength, 13.33, 'mean 2 origins -> 2/3*20 = 13.33');
  assert.equal(c.imminence, 10, 'horizon 0-2w band 1.0 -> 10');
  assert.equal(c.falsifiabilityActionability, 10, 'all falsifiers present -> 10');
  assert.equal(scored.value.admissionScore, 79.17, 'total admission score = 79.17');
  /* the score result names an ADMISSION index and never a probability/confidence/crash-odds field. */
  const keys = Object.keys(scored.value).concat(Object.keys(scored.value.components));
  for (const forbidden of ['probability', 'confidence', 'crashOdds', 'crashProbability', 'odds', 'certainty']) {
    assert.equal(keys.includes(forbidden), false, `the score must not expose a ${forbidden} field`);
  }
  assert.equal('admissionScore' in scored.value, true);
});

/* ═══════════ hard gates — each proven by an observation mutation ═══════════ */

test('qualifyCandidate qualifies a fully corroborated, market-confirmed, high-severity candidate (SCN-012-023)', () => {
  const q = RA.qualifyCandidate(assembleQualified());
  assert.equal(q.ok, true);
  assert.equal(q.value.outcome, 'qualified');
  assert.ok(q.value.admissionScore >= 75);
  assert.equal(q.value.alert.contractVersion, 'red-alert/v1');
  assert.equal(q.value.alert.severityLevel >= 4, true);
  assert.ok(q.value.alert.severityLabel && typeof q.value.alert.severityLabel === 'string');
});

test('gate 1: dropping a material claim to a single origin group rejects with insufficient-corroboration (SCN-012-024)', () => {
  const weak = twoChannelBundle({ independentOriginGroups: ['origin:a'], corroborationState: 'uncorroborated' });
  const q = RA.qualifyCandidate(assembleQualified(weak));
  assert.equal(q.ok, true);
  assert.equal(q.value.outcome, 'rejected');
  assert.ok(q.value.reasonClasses.includes('insufficient-corroboration'));
  assert.equal(q.value.alert, null, 'a rejected candidate projects no alert');
});

test('gate 2: removing owner market-evidence rejects with no-observable-market-evidence (SCN-012-024)', () => {
  const noOwner = twoChannelBundle({ ownerEvidenceRefs: [] }, { ownerEvidenceRefs: [] });
  const q = RA.qualifyCandidate(assembleQualified(noOwner));
  assert.equal(q.value.outcome, 'rejected');
  assert.ok(q.value.reasonClasses.includes('no-observable-market-evidence'));
});

test('gate 3: severity below 4 rejects with low-severity', () => {
  const q = RA.qualifyCandidate(assembleQualified(undefined, { severity: 3 }));
  assert.equal(q.value.outcome, 'rejected');
  assert.ok(q.value.reasonClasses.includes('low-severity'));
});

test('gate 4: a missing falsifiable field rejects with incomplete-fields', () => {
  const q = RA.qualifyCandidate(assembleQualified(undefined, { invalidation: '' }));
  assert.equal(q.value.outcome, 'rejected');
  assert.ok(q.value.reasonClasses.includes('incomplete-fields'));
});

test('gate 5: a conflicted material claim rejects with source-conflict', () => {
  const conflicted = twoChannelBundle({ conflictState: 'conflicted', corroborationState: 'conflicted' });
  const q = RA.qualifyCandidate(assembleQualified(conflicted));
  assert.equal(q.value.outcome, 'rejected');
  assert.ok(q.value.reasonClasses.includes('source-conflict'));
});

test('gate 6: a stale material claim rejects with stale-or-cutoff-mismatch', () => {
  const stale = twoChannelBundle({ freshnessState: 'stale' });
  const q = RA.qualifyCandidate(assembleQualified(stale));
  assert.equal(q.value.outcome, 'rejected');
  assert.ok(q.value.reasonClasses.includes('stale-or-cutoff-mismatch'));
});

test('gate 7: a complete but low-scoring candidate rejects with score-below-threshold', () => {
  const q = RA.qualifyCandidate(assembleQualified(undefined, {
    severity: 4, likelihoodInterval: [0.1, 0.2], horizon: '>6m',
    materialClaims: [{ claimId: 'claim-funding', channel: 'credit-funding', kind: 'market-state' }]
  }));
  assert.equal(q.value.outcome, 'rejected');
  assert.ok(q.value.reasonClasses.includes('score-below-threshold'));
  assert.ok(q.value.admissionScore < 75);
});

test('a malformed candidate contract (not observations) is a closed refusal, not a silent rejection', () => {
  const bad = RA.qualifyCandidate({ contractVersion: 'red-alert-candidate/v1' });
  assert.equal(bad.ok, false);
  assert.equal(bad.error.code, 'RLMKT-CANDIDATE');
  assert.equal(bad.error.valueEchoed, false);
});

/* ═══════════ de-duplication + append-only lifecycle ═══════════ */

test('semanticKey is stable for the same thesis/path and differs for a materially changed thesis', () => {
  const a = assembleQualified();
  const b = assembleQualified();
  assert.equal(RA.semanticKey(a), RA.semanticKey(b), 'same thesis/path/claims -> same key');
  const changed = assembleQualified(undefined, { thesis: 'A totally different sovereign-debt rollover risk.' });
  assert.notEqual(RA.semanticKey(a), RA.semanticKey(changed), 'a materially changed thesis produces a new key');
});

test('dedupeCandidate flags duplicate vs supersede vs new', () => {
  const a = RA.qualifyCandidate(assembleQualified()).value.alert;
  const same = assembleQualified();
  assert.equal(RA.dedupeCandidate([a], same).status, 'duplicate');
  const superseding = assembleQualified(undefined, { thesis: 'Funding stress now routes through repo, not carry.', propagation: [{ from: 'credit-funding', to: 'rates-liquidity' }] });
  assert.equal(RA.dedupeCandidate([a], superseding).status, 'supersedes');
  const fresh = assembleQualified => null;
  assert.equal(RA.dedupeCandidate([], same).status, 'new');
});

test('applyLifecycleEvent appends immutable events and preserves the original trigger/invalidation', () => {
  const alert = RA.qualifyCandidate(assembleQualified()).value.alert;
  const originalTrigger = alert.trigger;
  const ack = RA.applyLifecycleEvent(alert, { to: 'acknowledged', at: CUTOFF, note: 'seen' });
  assert.equal(ack.ok, true);
  assert.equal(ack.value.lifecycle.state, 'acknowledged');
  assert.equal(ack.value.trigger, originalTrigger, 'trigger is never rewritten by a lifecycle transition');
  assert.equal(ack.value.lifecycle.events.length, alert.lifecycle.events.length + 1, 'events are append-only');
  const mon = RA.applyLifecycleEvent(ack.value, { to: 'monitoring', at: CUTOFF });
  assert.equal(mon.value.lifecycle.events.length, ack.value.lifecycle.events.length + 1);
  const illegal = RA.applyLifecycleEvent(alert, { to: 'resolved', at: CUTOFF });
  assert.equal(illegal.ok, false, 'an illegal lifecycle transition is refused');
  assert.equal(illegal.error.code, 'RLMKT-LIFECYCLE');
});

/* ═══════════ projection (visible cap, rejections as counts, empty state) ═══════════ */

test('qualifyRedAlerts projects qualified rows, safe rejection counts, and an honest empty state (SCN-012-025)', () => {
  const empty = RA.qualifyRedAlerts({
    projectionId: 'p-empty', cutoffAt: CUTOFF,
    seeds: [seed()],
    candidateInputs: [],
    channelsReviewed: ['credit-funding', 'fx-carry']
  });
  assert.equal(empty.ok, true);
  assert.equal(empty.value.visibleAlerts.length, 0);
  assert.ok(empty.value.emptyState, 'no qualified candidate -> explicit empty state');
  assert.equal(empty.value.emptyState.cutoffAt, CUTOFF);
  assert.ok(Array.isArray(empty.value.emptyState.channelsReviewed) && empty.value.emptyState.channelsReviewed.length > 0);
  assert.ok(empty.value.emptyState.methodRef, 'the empty state links a method reference');
  /* the empty state pads NOTHING — no illustrative topic string. */
  const emptyText = JSON.stringify(empty.value.emptyState).toLowerCase();
  for (const topic of ['usd/jpy', 'private credit', 'capex', 'war']) {
    assert.equal(emptyText.includes(topic), false, `the empty state must not pad with a ${topic} example`);
  }
  assert.equal(empty.value.publicationState, 'dependency-pending:feature-002', 'live publication stays Feature 002 gated');
});

test('qualifyRedAlerts enforces the visible cap of 5 and pushes the overflow to history refs', () => {
  const inputs = [];
  for (let i = 0; i < 7; i += 1) {
    inputs.push(Object.assign({ bundle: twoChannelBundle() }, hypothesis({
      clusterId: 'cluster-' + i,
      thesis: 'Distinct qualified funding-stress variant number ' + i + ' across channels.',
      affectedAssets: ['DBC', 'GLD', 'SLV' + i]
    })));
  }
  const proj = RA.qualifyRedAlerts({ projectionId: 'p-cap', cutoffAt: CUTOFF, seeds: [seed()], candidateInputs: inputs, channelsReviewed: ['credit-funding', 'fx-carry'] });
  assert.equal(proj.ok, true);
  assert.equal(proj.value.visibleAlerts.length, 5, 'no more than five Red Alerts are visible');
  assert.equal(proj.value.overflowAlertRefs.length, 2, 'lower-ranked qualified alerts remain as history/disclosure refs');
});

test('qualifyRedAlerts reports rejections only as safe counts by reason class and never echoes a rejected thesis', () => {
  const weak = twoChannelBundle({ independentOriginGroups: ['origin:a'], corroborationState: 'uncorroborated' });
  const dramatic = Object.assign({ bundle: weak }, hypothesis({ thesis: 'SENSATIONAL UNSTOPPABLE MELTDOWN NARRATIVE ZZZ.' }));
  const proj = RA.qualifyRedAlerts({ projectionId: 'p-rej', cutoffAt: CUTOFF, seeds: [seed()], candidateInputs: [dramatic], channelsReviewed: ['credit-funding'] });
  assert.equal(proj.ok, true);
  assert.equal(proj.value.visibleAlerts.length, 0);
  assert.equal(proj.value.rejections.count, 1);
  assert.ok(proj.value.rejections.byReasonClass['insufficient-corroboration'] >= 1);
  assert.equal(JSON.stringify(proj.value).includes('SENSATIONAL'), false, 'a rejected dramatic title is never projected');
});

/* ═══════════ round-trip validators ═══════════ */

test('validateRedAlert and validateRedAlertProjection round-trip a produced projection', () => {
  const proj = RA.qualifyRedAlerts({ projectionId: 'p-rt', cutoffAt: CUTOFF, seeds: [seed()], candidateInputs: [Object.assign({ bundle: twoChannelBundle() }, hypothesis())], channelsReviewed: ['credit-funding', 'fx-carry'] });
  assert.equal(proj.ok, true);
  const vp = RA.validateRedAlertProjection(proj.value);
  assert.equal(vp.ok, true, JSON.stringify(vp.ok ? {} : vp.error));
  const va = RA.validateRedAlert(proj.value.visibleAlerts[0]);
  assert.equal(va.ok, true, JSON.stringify(va.ok ? {} : va.error));
  /* a tampered fingerprint is refused. */
  const tampered = JSON.parse(JSON.stringify(proj.value.visibleAlerts[0]));
  tampered.alertFingerprint = 'sha256:' + '0'.repeat(64);
  assert.equal(RA.validateRedAlert(tampered).ok, false);
});

test('validateRedAlert refuses an alarmist presentation (no flashing/pulse/alert-role/execute)', () => {
  const alert = JSON.parse(JSON.stringify(RA.qualifyRedAlerts({ projectionId: 'p-al', cutoffAt: CUTOFF, seeds: [seed()], candidateInputs: [Object.assign({ bundle: twoChannelBundle() }, hypothesis())], channelsReviewed: ['credit-funding', 'fx-carry'] }).value.visibleAlerts[0]));
  alert.presentation.flashing = true;
  const res = RA.validateRedAlert(alert);
  assert.equal(res.ok, false);
  assert.equal(res.error.code, 'RLMKT-ALARMISM');
});
