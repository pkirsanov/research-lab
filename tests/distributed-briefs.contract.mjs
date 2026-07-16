import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

function provenance() {
  return {
    contractVersion: 'source-provenance/v1',
    sourceId: 'yahoo-chart',
    adapterId: 'yahoo-chart-session',
    adapterVersion: 'yahoo-chart-session-adapter/v1',
    sourceKind: 'best-effort-public-chart',
    sourceUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/SPY',
    requestDescriptor: {
      method: 'GET',
      path: '/v8/finance/chart/SPY',
      query: { interval: '5m', includePrePost: 'true', range: '1mo' }
    },
    sourcePublishedAt: null,
    retrievedAt: '2026-07-14T13:58:00.000Z',
    contentSha256: 'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    accessClass: 'public-best-effort',
    sourceUsePolicyId: 'source-use-policy/yahoo-normalized/v1',
    sourceUseReviewRef: 'reviews/source-use/yahoo-normalized/v1',
    retentionMode: 'normalized-facts-and-hash',
    freshnessPolicy: 'active-session-20m/v1',
    freshnessState: 'current',
    diagnostics: []
  };
}

function evidenceReference() {
  return {
    contractVersion: 'evidence-reference/v1',
    evidenceType: 'session-aggregate',
    fingerprint: 'sha256:1111111111111111111111111111111111111111111111111111111111111111',
    path: 'briefs/objects/evidence/sessions/SPY/1111111111111111111111111111111111111111111111111111111111111111.json',
    sha256: 'sha256:2222222222222222222222222222222222222222222222222222222222222222',
    state: 'partial',
    cutoffAt: '2026-07-14T14:00:00.000Z',
    provenanceRefs: ['sha256:3333333333333333333333333333333333333333333333333333333333333333']
  };
}

test('RLCONTRACTS canonicalization and semantic/occurrence fingerprints are deterministic', () => {
  const left = {
    contractVersion: 'canonical-vector/v1',
    reasonCodes: ['stale', 'missing', 'stale'],
    observedAt: '2026-07-14T09:30:00-04:00',
    signedZero: -0,
    rankedFacts: [{ rank: 2, id: 'b' }, { rank: 1, id: 'a' }],
    nested: { z: 1, a: 2 }
  };
  const right = {
    nested: { a: 2, z: 1 },
    rankedFacts: [{ rank: 2, id: 'b' }, { rank: 1, id: 'a' }],
    signedZero: 0,
    observedAt: '2026-07-14T13:30:00.000Z',
    reasonCodes: ['missing', 'stale'],
    contractVersion: 'canonical-vector/v1'
  };

  assert.equal(RLCONTRACTS.canonicalize(left, 'canonical-json/v1'), RLCONTRACTS.canonicalize(right, 'canonical-json/v1'));
  assert.equal(RLCONTRACTS.contentSha256(left, 'canonical-json/v1'), RLCONTRACTS.contentSha256(right, 'canonical-json/v1'));
  assert.equal(
    RLCONTRACTS.contentSha256(left, 'canonical-json/v1'),
    `sha256:${createHash('sha256').update(RLCONTRACTS.canonicalize(left, 'canonical-json/v1'), 'utf8').digest('hex')}`
  );
  assert.match(RLCONTRACTS.fingerprint('canonical-vector', left), /^sha256:[a-f0-9]{64}$/);
  assert.equal(RLCONTRACTS.semanticFingerprint('session-evidence', { ...left, runId: 'run-a', cutoffAt: '2026-07-14T14:00:00.000Z', retrievedAt: '2026-07-14T13:58:00.000Z' }), RLCONTRACTS.semanticFingerprint('session-evidence', { ...right, runId: 'run-b', cutoffAt: '2026-07-14T14:05:00.000Z', retrievedAt: '2026-07-14T14:03:00.000Z' }));
  assert.notEqual(RLCONTRACTS.occurrenceFingerprint('session-evidence', { ...left, runId: 'run-a' }), RLCONTRACTS.occurrenceFingerprint('session-evidence', { ...right, runId: 'run-b' }));
  assert.notEqual(
    RLCONTRACTS.canonicalize({ contractVersion: 'chronology/v1', observationRefs: ['sha256:b', 'sha256:a'] }, 'chronology/v1'),
    RLCONTRACTS.canonicalize({ contractVersion: 'chronology/v1', observationRefs: ['sha256:a', 'sha256:b'] }, 'chronology/v1')
  );
  assert.throws(() => RLCONTRACTS.canonicalize({ invalid: Number.POSITIVE_INFINITY }, 'canonical-json/v1'), (error) => error.code === 'B002-INPUT-REJECTED' && error.reason === 'non-finite-number');
  assert.throws(() => RLCONTRACTS.canonicalize({ invalid: undefined }, 'canonical-json/v1'), (error) => error.code === 'B002-INPUT-REJECTED' && error.reason === 'undefined-value');
});

test('MarketSessionEvidence v1 contracts preserve provenance identities states and ownership boundaries', () => {
  const RLSESSION = require('../rlsession.js');
  const source = provenance();
  const ref = evidenceReference();

  assert.equal(RLCONTRACTS.validateSourceProvenance(source).ok, true);
  assert.equal(RLCONTRACTS.validateEvidenceReference(ref, { evidenceRoot: 'briefs/objects/evidence' }).ok, true);
  assert.equal(RLCONTRACTS.validateSourceProvenance({ ...source, hiddenWinner: 'provider-a' }).error.reason, 'unknown-field');
  assert.equal(RLCONTRACTS.validateSourceProvenance({ ...source, sourceUrl: 'https://example.com/v8/finance/chart/SPY' }).error.reason, 'source-url-not-allowlisted');
  assert.equal(RLCONTRACTS.validateSourceProvenance({ ...source, sourceKind: 'official-report' }).error.reason, 'source-kind-mismatch');
  assert.equal(RLCONTRACTS.validateSourceProvenance({ ...source, sourcePublishedAt: '2026-07-14T13:59:00.000Z' }).error.reason, 'source-time-order-invalid');

  const secretBearingPost = {
    ...source,
    sourceId: 'bls-public-api-v2',
    adapterId: 'bls-public-api-v2-normalized',
    adapterVersion: 'bls-public-api-v2-adapter/v1',
    sourceKind: 'official-report',
    sourceUrl: 'https://api.bls.gov/publicAPI/v2/timeseries/data/',
    requestDescriptor: {
      method: 'POST',
      path: '/publicAPI/v2/timeseries/data/',
      query: {},
      body: { registrationkey: 'must-not-enter-provenance' }
    },
    sourcePublishedAt: '2026-07-14T12:30:00.000Z',
    accessClass: 'public-official',
    sourceUsePolicyId: 'source-use-policy/bls-normalized/v1',
    sourceUseReviewRef: 'reviews/source-use/bls-normalized/v1',
    freshnessPolicy: 'report-target-period/v1'
  };
  assert.equal(RLCONTRACTS.validateSourceProvenance(secretBearingPost).error.reason, 'secret-shaped-request-field');
  assert.equal(RLCONTRACTS.validateEvidenceReference({ ...ref, path: '../private.json' }, { evidenceRoot: 'briefs/objects/evidence' }).error.reason, 'evidence-path-outside-root');
  assert.equal(RLCONTRACTS.validateEvidenceReference({ ...ref, state: 'healthy' }, { evidenceRoot: 'briefs/objects/evidence' }).error.reason, 'unknown-evidence-state');
  assert.equal(RLCONTRACTS.validateEvidenceReference(ref).error.reason, 'evidence-root-required');

  const exactSessionExports = [
    'loadCalendarSession',
    'classifySessionObservation',
    'aggregateSession',
    'buildComparableVolumeBaseline',
    'normalizeReleasedReport',
    'joinEventMarketReaction',
    'buildMarketSessionEvidence',
    'validateCalendarSession',
    'validateSessionObservation',
    'validateSessionAggregate',
    'validateComparableVolumeBaseline',
    'validateReleasedReportEvidence',
    'validateEventMarketReaction',
    'validateMarketSessionEvidence'
  ];
  assert.deepEqual(Object.keys(RLSESSION).sort(), exactSessionExports.sort());
  assert.equal(Object.isFrozen(RLCONTRACTS), true);
  assert.equal(Object.isFrozen(RLSESSION), true);

  const contractsSource = readFileSync(new URL('../rlcontracts.js', import.meta.url), 'utf8');
  const sessionSource = readFileSync(new URL('../rlsession.js', import.meta.url), 'utf8');
  const browserRoot = {};
  Function('globalThis', 'window', 'module', 'exports', 'require', `${contractsSource}\nreturn globalThis.RLCONTRACTS;`)(browserRoot, undefined, undefined, undefined, undefined);
  Function('globalThis', 'window', 'module', 'exports', 'require', `${sessionSource}\nreturn globalThis.RLSESSION;`)(browserRoot, undefined, undefined, undefined, undefined);
  assert.equal(browserRoot.RLCONTRACTS.canonicalize({ b: 2, a: 1 }, 'canonical-json/v1'), '{"a":1,"b":2}');
  assert.deepEqual(Object.keys(browserRoot.RLSESSION).sort(), exactSessionExports.sort());

  assert.doesNotMatch(contractsSource, /\b(?:fetch|XMLHttpRequest|localStorage|document)\b/);
  assert.doesNotMatch(sessionSource, /\b(?:fetch|XMLHttpRequest|localStorage|document|ownerModel|recommendation)\b/);
});
