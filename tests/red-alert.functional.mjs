/*
 * tests/red-alert.functional.mjs
 * ------------------------------------------------------------------------
 * Feature 012 Scope 12 — Dynamic Red Alert DISCOVERY/QUALIFICATION functional
 * suite (TP-12-02). Proves the PRODUCTION transform end-to-end over committed
 * exact-format fixtures that supply OBSERVATIONS/SOURCES ONLY — never a
 * pre-labelled verdict:
 *   - raw owner anomaly seeds cluster (production), a bounded plan is DERIVED
 *     from observed entities (no topic catalog), and every candidate consumes a
 *     Scope 10 FROZEN WebEvidenceBundle produced by the REAL acquire() through
 *     each fixture's injected boundary (the same production code Scope 10 ships);
 *   - SCN-012-023 (dynamic corroborated + market-confirmed candidate qualifies),
 *     SCN-012-024 (weak/uncorroborated candidate consumes no visible slot), and
 *     SCN-012-025 (no candidate clears -> honest empty state) are all DERIVED;
 *   - append/supersede lifecycle transitions preserve prior falsifiers;
 *   - a RUNTIME observation mutation of the qualified fixture (drop one origin)
 *     flips the SAME hypothesis from qualified to rejected — proving the verdict
 *     is production-derived, not fixture-encoded.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, resolveFixturePolicies, runFixtureAcquisition } from '../scripts/validate-web-evidence.mjs';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RA = require(resolve(ROOT, 'rlmarketaction.js'));
const FIXTURE_DIR = resolve(ROOT, 'tests/fixtures/feature-012/red-alert');

const config = loadConfig();
const policies = resolveFixturePolicies(config);
const redAlertPolicy = policies['red-alert'];
assert.ok(redAlertPolicy, 'the red-alert acquisition lane policy must resolve from the committed config');

function loadRedAlertFixture(name) {
  return JSON.parse(readFileSync(resolve(FIXTURE_DIR, name + '.json'), 'utf8'));
}

/* drive the REAL Scope 10 acquire() over the fixture's web-evidence records and
   return the FROZEN WebEvidenceBundle. */
async function acquireBundle(fixture) {
  const { acquireResult } = await runFixtureAcquisition(fixture.webEvidence, redAlertPolicy);
  assert.equal(acquireResult.ok, true, `fixture ${fixture.scenario} acquire() unexpectedly rejected: ${acquireResult.ok ? '' : acquireResult.error.code + ' ' + acquireResult.error.detail}`);
  return acquireResult.value;
}

/* produce a Red Alert projection for a fixture through the production engine. */
async function projectFixture(fixture) {
  const candidateInputs = [];
  if (fixture.webEvidence && fixture.hypothesis) {
    const bundle = await acquireBundle(fixture);
    candidateInputs.push(Object.assign({ bundle }, fixture.hypothesis));
  }
  const projection = RA.qualifyRedAlerts({
    projectionId: 'functional/' + fixture.scenario,
    cutoffAt: fixture.cutoffAt,
    seeds: fixture.seeds || [],
    candidateInputs,
    channelsReviewed: fixture.channelsReviewed || []
  });
  assert.equal(projection.ok, true, `fixture ${fixture.scenario} projection unexpectedly refused: ${projection.ok ? '' : JSON.stringify(projection.error)}`);
  return projection.value;
}

/* the SPEC of what production MUST DERIVE per committed observation set. The
   fixtures encode no verdict; these expectations live in the test. */
const EXPECTATIONS = {
  'qualified-candidate': { visible: 1, reason: null },
  'one-origin-weak': { visible: 0, reason: 'insufficient-corroboration' },
  'no-owner-transmission': { visible: 0, reason: 'no-observable-market-evidence' },
  'conflict-supersede': { visible: 0, reason: 'source-conflict' },
  'stale': { visible: 0, reason: 'stale-or-cutoff-mismatch' },
  'injection-hostile': { visible: 0, reason: 'insufficient-corroboration' },
  'no-topic-hardcoding': { visible: 1, reason: null },
  'no-candidates-empty': { visible: 0, reason: null, empty: true }
};

test('every committed red-alert fixture drives the production transform to its DERIVED outcome', async () => {
  const files = readdirSync(FIXTURE_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
  assert.ok(files.length >= 7, `expected the committed red-alert fixtures, found ${files.length}`);
  for (const name of files) {
    const expectation = EXPECTATIONS[name];
    assert.ok(expectation, `fixture ${name} has no declared expectation in the functional spec`);
    const fixture = loadRedAlertFixture(name);
    const projection = await projectFixture(fixture);
    assert.equal(projection.visibleAlerts.length, expectation.visible, `fixture ${name} produced ${projection.visibleAlerts.length} visible alert(s), expected ${expectation.visible}`);
    if (expectation.reason) {
      assert.ok((projection.rejections.byReasonClass[expectation.reason] || 0) >= 1, `fixture ${name} did not derive the expected rejection reason ${expectation.reason}: ${JSON.stringify(projection.rejections.byReasonClass)}`);
    }
    if (expectation.empty) {
      assert.ok(projection.emptyState, `fixture ${name} should render an explicit empty state`);
    }
    const validated = RA.validateRedAlertProjection(projection);
    assert.equal(validated.ok, true, `fixture ${name} projection failed round-trip validation: ${validated.ok ? '' : JSON.stringify(validated.error)}`);
  }
});

test('SCN-012-023: a dynamic anomaly with corroborated transmission and owner evidence qualifies a complete alert', async () => {
  const fixture = loadRedAlertFixture('qualified-candidate');
  /* seeds cluster through production (not a topic catalog). */
  const clustered = RA.clusterAnomalySeeds(fixture.seeds);
  assert.equal(clustered.ok, true);
  assert.equal(clustered.value.clusters.length, 1, 'the two overlapping seeds cluster into one');
  const projection = await projectFixture(fixture);
  assert.equal(projection.visibleAlerts.length, 1);
  const alert = projection.visibleAlerts[0];
  /* every falsifiable field is present and the threat was NOT required by a topic list. */
  for (const field of ['thesis', 'whyNow', 'trigger', 'invalidation', 'monitoring', 'resolution', 'horizon', 'uncertainty']) {
    assert.ok(alert[field] && alert[field].length > 0, `qualified alert is missing ${field}`);
  }
  assert.ok(alert.severityLevel >= 4);
  assert.ok(alert.propagation.length > 0 && alert.affectedAssets.length > 0 && alert.researchActions.length > 0);
  assert.ok(alert.independentOriginGroupCount >= 2 && alert.ownerMarketEvidenceRefs.length >= 1);
  assert.ok(alert.admissionScore >= 75);
});

test('SCN-012-024: a dramatic candidate lacking corroboration consumes no visible slot', async () => {
  const fixture = loadRedAlertFixture('one-origin-weak');
  const projection = await projectFixture(fixture);
  assert.equal(projection.visibleAlerts.length, 0, 'no visible alert for a weak candidate');
  assert.equal(projection.rejections.count, 1, 'the weak candidate is counted as a safe rejection');
  assert.ok(projection.rejections.byReasonClass['insufficient-corroboration'] >= 1);
});

test('SCN-012-025: when no candidate clears the bar the projection is an honest empty state with cutoff/coverage', async () => {
  const fixture = loadRedAlertFixture('no-candidates-empty');
  const projection = await projectFixture(fixture);
  assert.equal(projection.visibleAlerts.length, 0);
  assert.ok(projection.emptyState, 'an explicit empty state is required');
  assert.equal(projection.emptyState.cutoffAt, fixture.cutoffAt);
  assert.ok(projection.emptyState.channelsReviewed.length > 0, 'the empty state reports channels reviewed');
  assert.ok(projection.emptyState.ownerCoverage.anomalySeedCount >= 1, 'the empty state reports owner/seed coverage');
  const text = JSON.stringify(projection.emptyState).toLowerCase();
  for (const topic of ['usd/jpy', 'private credit', 'capex', 'war']) {
    assert.equal(text.includes(topic), false, `the empty state must not pad with a ${topic} illustrative topic`);
  }
});

test('append/supersede lifecycle preserves prior falsifiers on a qualified alert', async () => {
  const fixture = loadRedAlertFixture('qualified-candidate');
  const projection = await projectFixture(fixture);
  const alert = projection.visibleAlerts[0];
  const originalTrigger = alert.trigger;
  const ack = RA.applyLifecycleEvent(alert, { to: 'acknowledged', at: fixture.cutoffAt });
  assert.equal(ack.ok, true);
  assert.equal(ack.value.trigger, originalTrigger, 'a lifecycle transition never rewrites the trigger');
  assert.equal(ack.value.lifecycle.events.length, alert.lifecycle.events.length + 1);
});

test('a RUNTIME observation mutation (drop one origin) flips the SAME hypothesis from qualified to rejected', async () => {
  const fixture = loadRedAlertFixture('qualified-candidate');
  const baseline = await projectFixture(fixture);
  assert.equal(baseline.visibleAlerts.length, 1, 'the intact observations qualify');

  /* mutate ONLY the observations: remove the second independent origin for the
     funding claim (drop the bis-funding source + its search candidate). The
     hypothesis is byte-identical. */
  const mutated = JSON.parse(JSON.stringify(fixture));
  const q0 = 'run/2026-07-24/red-alert-qualified:q0';
  mutated.webEvidence.boundary.search[q0] = mutated.webEvidence.boundary.search[q0].filter((c) => c.candidateId !== 'cand-bis-funding');
  delete mutated.webEvidence.boundary.retrieve['https://bis.example/publ/funding-note'];
  const mutatedProjection = await projectFixture(mutated);
  assert.equal(mutatedProjection.visibleAlerts.length, 0, 'dropping one origin flips the SAME hypothesis to rejected');
  assert.ok(mutatedProjection.rejections.byReasonClass['insufficient-corroboration'] >= 1, 'the flip is attributed to the observation change, not the hypothesis');
});
