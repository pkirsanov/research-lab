import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { loadSourcePolicies, validateSourceRequest, buildYahooRequest } from '../scripts/market-session-evidence.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const RLSESSION = require('../rlsession.js');
const calendar = JSON.parse(readFileSync(new URL('./fixtures/feature-002/market-session-evidence/xnys-calendar.v1.json', import.meta.url), 'utf8'));
const marketConfig = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));

const CUTOFF_POLICY = Object.freeze({
  contractVersion: 'cutoff-policy/v1',
  interval: 'PT5M',
  boundaryPolicyVersion: 'xnys-session-boundaries/v1',
  requireNextOpenTradingDate: true
});

const COMPARABLE_POLICY = Object.freeze({
  contractVersion: 'comparable-volume-policy/v1',
  interval: 'PT5M',
  candidateSessionCount: 20,
  qualifiedMinEligible: 10,
  qualifiedMinCoverage: 0.70,
  thinMinEligible: 5,
  thinMinCoverage: 0.40,
  highPercentile: 90,
  lowPercentile: 10,
  highRobustZ: 2.5,
  lowRobustZ: -2.5
});

function unwrap(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code}:${result.error.reason}`);
  return result.value;
}

function sourceAt(retrievedAt) {
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
    retrievedAt,
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

function sourceBar(barStart, overrides = {}) {
  return {
    contractVersion: 'session-source-bar/v1',
    symbol: 'SPY',
    providerSymbol: 'SPY',
    interval: 'PT5M',
    barStart,
    open: 100,
    high: 102,
    low: 99,
    close: 101,
    volume: 10,
    priceBasis: 'provider-chart-basis',
    adjustmentState: 'compatible',
    corporateActionRefs: [],
    ...overrides
  };
}

function currentAggregate(volume = 300) {
  const session = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-14', CUTOFF_POLICY));
  const cutoffAt = '2026-07-14T12:00:00.000Z';
  const source = sourceAt('2026-07-14T11:59:00.000Z');
  const observations = Array.from({ length: 48 }, (_, bucketIndex) => unwrap(RLSESSION.classifySessionObservation(
    sourceBar(new Date(Date.parse(session.preMarket.startUtc) + bucketIndex * 300000).toISOString(), {
      volume: bucketIndex === 47 ? volume : 0
    }),
    session,
    cutoffAt,
    source
  )));
  return unwrap(RLSESSION.aggregateSession(observations, session, 'pre-market', cutoffAt, {
    contractVersion: 'official-regular-close-anchor/v1',
    tradingDate: '2026-07-13',
    close: 100,
    at: '2026-07-13T20:00:00.000Z',
    priceBasis: 'provider-chart-basis',
    adjustmentState: 'compatible',
    sourceRef: RLCONTRACTS.occurrenceFingerprint('source-provenance', source)
  }));
}

function preMarketSignature() {
  return unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-14', CUTOFF_POLICY)).sessionBoundarySignatures['pre-market'];
}

function bucketVolumes(value, endBucket = 47, missingBucket = null) {
  return Array.from({ length: endBucket + 1 }, (_, bucketIndex) => ({
    bucketIndex,
    volume: bucketIndex === missingBucket ? null : (bucketIndex === endBucket ? value : 0),
    volumeState: bucketIndex === missingBucket ? 'missing' : (bucketIndex === endBucket && value > 0 ? 'observed' : 'observed-zero')
  }));
}

function candidate(index, value, overrides = {}) {
  return {
    contractVersion: 'comparable-session-candidate/v1',
    candidateId: RLCONTRACTS.fingerprint('comparable-session-candidate', { contractVersion: 'comparable-session-candidate-test-identity/v1', index, value, overrides }),
    tradingDate: `2026-06-${String(index + 1).padStart(2, '0')}`,
    symbol: 'SPY',
    sessionKind: 'pre-market',
    comparisonBoundarySignature: preMarketSignature(),
    interval: 'PT5M',
    sourceId: 'yahoo-chart',
    adapterVersion: 'yahoo-chart-session-adapter/v1',
    priceBasis: 'provider-chart-basis',
    adjustmentState: 'compatible',
    startBucket: 0,
    endBucketInclusive: 47,
    bucketVolumes: bucketVolumes(value),
    sourceRef: 'sha256:2222222222222222222222222222222222222222222222222222222222222222',
    ...overrides
  };
}

function twentyCandidates(values) {
  const candidates = values.map((value, index) => candidate(index, value)).concat([
    candidate(14, 10, { bucketVolumes: bucketVolumes(10, 47, 12) }),
    candidate(15, 10, { sessionKind: 'regular' }),
    candidate(16, 10, { comparisonBoundarySignature: 'sha256:3333333333333333333333333333333333333333333333333333333333333333' }),
    candidate(17, 10, { endBucketInclusive: 48, bucketVolumes: bucketVolumes(10, 48) }),
    candidate(18, 10, { adapterVersion: 'yahoo-chart-session-adapter/v2' }),
    candidate(19, 10, { adjustmentState: 'corporate-action-discontinuity' })
  ]);
  let extraIndex = 20;
  while (candidates.length < 20) {
    candidates.push(candidate(extraIndex, 10, { bucketVolumes: bucketVolumes(10, 47, 12) }));
    extraIndex += 1;
  }
  return candidates.slice(0, 20);
}

test('SCN-002-016: opening-boundary bars belong to exactly one session and cutoff', () => {
  const session = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-14', CUTOFF_POLICY));
  const source = sourceAt('2026-07-14T13:58:00.000Z');
  const cutoffAt = '2026-07-14T14:00:00.000Z';

  const preOpen = unwrap(RLSESSION.classifySessionObservation(sourceBar('2026-07-14T13:25:00.000Z'), session, cutoffAt, source));
  const atOpen = unwrap(RLSESSION.classifySessionObservation(sourceBar('2026-07-14T13:30:00.000Z', { close: 103, high: 104, low: 100 }), session, cutoffAt, source));

  assert.equal(preOpen.barEnd, '2026-07-14T13:30:00.000Z');
  assert.equal(preOpen.sessionKind, 'pre-market');
  assert.equal(preOpen.bucketIndex, 65);
  assert.equal(atOpen.sessionKind, 'regular');
  assert.equal(atOpen.bucketIndex, 0);
  assert.equal(preOpen.cutoffAt, cutoffAt);
  assert.notEqual(preOpen.observationId, atOpen.observationId);

  const laterSource = sourceAt('2026-07-14T13:59:00.000Z');
  const repeatedPreOpen = unwrap(RLSESSION.classifySessionObservation(sourceBar('2026-07-14T13:25:00.000Z'), session, cutoffAt, laterSource));
  assert.equal(repeatedPreOpen.semanticFingerprint, preOpen.semanticFingerprint);
  assert.notEqual(repeatedPreOpen.occurrenceFingerprint, preOpen.occurrenceFingerprint);
  assert.notEqual(repeatedPreOpen.sourceRef, preOpen.sourceRef);

  const preAggregate = unwrap(RLSESSION.aggregateSession([preOpen, atOpen], session, 'pre-market', cutoffAt, null));
  const regularAggregate = unwrap(RLSESSION.aggregateSession([preOpen, atOpen], session, 'regular', cutoffAt, null));
  assert.deepEqual(preAggregate.observationRefs, [preOpen.observationId]);
  assert.deepEqual(regularAggregate.observationRefs, [atOpen.observationId]);
  assert.equal(new Set(preAggregate.observationRefs.concat(regularAggregate.observationRefs)).size, 2);
});

test('SCN-002-018: comparable volume uses exact completed buckets and preserves missing versus zero', () => {
  const exactValues = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230];
  const current = currentAggregate(300);
  const baseline = unwrap(RLSESSION.buildComparableVolumeBaseline(current, twentyCandidates(exactValues), COMPARABLE_POLICY));

  const missingLineage = structuredClone(current);
  delete missingLineage.sourceRefs;
  assert.equal(RLSESSION.validateSessionAggregate(missingLineage).error.reason, 'session-aggregate-lineage-invalid');
  assert.equal(RLSESSION.validateSessionAggregate({ ...current, missingBuckets: current.missingBuckets + 1 }).error.reason, 'session-aggregate-coverage-invalid');
  assert.equal(RLSESSION.validateSessionAggregate({
    ...current,
    aggregateId: 'sha256:6666666666666666666666666666666666666666666666666666666666666666'
  }).error.reason, 'session-aggregate-identity-mismatch');

  assert.equal(baseline.candidateSessionCount, 20);
  assert.equal(baseline.eligibleSessionCount, 14);
  assert.equal(baseline.missingSessionCount, 6);
  assert.equal(baseline.coverage, 0.70);
  assert.equal(baseline.median, 165);
  assert.equal(baseline.mad, 35);
  assert.equal(baseline.midrankPercentile, 100);
  assert.ok(Math.abs(baseline.relativeVolume - (300 / 165)) < 1e-12);
  assert.ok(Math.abs(baseline.robustZ - 2.601603321428571) < 1e-12);
  assert.equal(baseline.state, 'qualified');
  assert.equal(baseline.unusualness, 'high');
  assert.equal(RLSESSION.validateComparableVolumeBaseline({ ...baseline, coverage: 2 }).error.reason, 'baseline-statistics-invalid');
  assert.deepEqual(
    baseline.excludedSessions.flatMap((entry) => entry.reasonCodes).sort(),
    [
      'adjustment-incompatible',
      'bucket-range-mismatch',
      'comparison-boundary-mismatch',
      'missing-volume',
      'provider-semantics-mismatch',
      'session-kind-mismatch'
    ]
  );

  const zeroValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  const zeroBaseline = unwrap(RLSESSION.buildComparableVolumeBaseline(currentAggregate(45), twentyCandidates(zeroValues), COMPARABLE_POLICY));
  assert.equal(zeroBaseline.state, 'thin');
  assert.equal(zeroBaseline.eligibleSessions[0].volume, 0);
  assert.equal(zeroBaseline.eligibleSessions[0].volumeState, 'observed-zero');
  assert.equal(zeroBaseline.excludedSessions.some((entry) => entry.reasonCodes.includes('missing-volume')), true);
  assert.equal(zeroBaseline.unusualness, 'not-qualified');

  const zeroDispersion = unwrap(RLSESSION.buildComparableVolumeBaseline(currentAggregate(300), twentyCandidates(Array(14).fill(100)), COMPARABLE_POLICY));
  assert.equal(zeroDispersion.state, 'qualified');
  assert.equal(zeroDispersion.mad, 0);
  assert.equal(zeroDispersion.robustZ, null);
  assert.equal(zeroDispersion.unusualness, 'zero-dispersion');
  assert.equal(RLSESSION.validateComparableVolumeBaseline({ ...zeroDispersion, unusualness: 'high' }).error.reason, 'baseline-unusualness-invalid');

  const futureCandidates = twentyCandidates(exactValues);
  futureCandidates[0] = { ...futureCandidates[0], tradingDate: '2026-07-15' };
  const futureExcluded = unwrap(RLSESSION.buildComparableVolumeBaseline(currentAggregate(300), futureCandidates, COMPARABLE_POLICY));
  assert.equal(futureExcluded.excludedSessions.some((entry) => entry.reasonCodes.includes('candidate-date-not-prior')), true);

  const duplicateDateCandidates = twentyCandidates(exactValues);
  duplicateDateCandidates[1] = { ...duplicateDateCandidates[1], tradingDate: duplicateDateCandidates[0].tradingDate };
  const duplicateDateExcluded = unwrap(RLSESSION.buildComparableVolumeBaseline(currentAggregate(300), duplicateDateCandidates, COMPARABLE_POLICY));
  assert.equal(duplicateDateExcluded.excludedSessions.some((entry) => entry.reasonCodes.includes('candidate-date-duplicate')), true);

  const missingPolicy = RLSESSION.buildComparableVolumeBaseline(currentAggregate(300), twentyCandidates(exactValues));
  assert.deepEqual(missingPolicy, {
    ok: false,
    error: {
      contractVersion: 'evidence-error/v1',
      code: 'B002-COMPARABILITY',
      reason: 'comparison-policy-required',
      field: 'policy'
    }
  });
});

test('SCN-002-021: committed XNYS rows resolve holidays early closes and DST', () => {
  const holiday = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-03', CUTOFF_POLICY));
  assert.equal(holiday.dateState, 'holiday');
  assert.equal(holiday.preMarket, null);
  assert.equal(holiday.regular, null);
  assert.equal(holiday.afterHours, null);
  assert.equal(holiday.nextOpenTradingDate, '2026-07-06');
  assert.equal(RLSESSION.validateCalendarSession({ ...holiday, closureLabel: null }).error.reason, 'closed-date-interval-invalid');

  const earlyClose = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-11-27', CUTOFF_POLICY));
  assert.equal(earlyClose.dateState, 'early-close');
  assert.equal(earlyClose.regular.endLocal, '2026-11-27T13:00:00.000-05:00');
  assert.equal(earlyClose.regular.endUtc, '2026-11-27T18:00:00.000Z');
  assert.equal(earlyClose.afterHours.startUtc, earlyClose.regular.endUtc);
  assert.notEqual(earlyClose.sessionBoundarySignatures.regular, earlyClose.sessionBoundarySignatures.afterHours);

  const beforeDst = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-03-06', CUTOFF_POLICY));
  const afterSpringDst = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-03-09', CUTOFF_POLICY));
  const afterFallDst = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-11-02', CUTOFF_POLICY));
  assert.equal(beforeDst.regular.startLocal.slice(11, 16), '09:30');
  assert.equal(afterSpringDst.regular.startLocal.slice(11, 16), '09:30');
  assert.equal(afterFallDst.regular.startLocal.slice(11, 16), '09:30');
  assert.equal(beforeDst.regular.startUtc, '2026-03-06T14:30:00.000Z');
  assert.equal(afterSpringDst.regular.startUtc, '2026-03-09T13:30:00.000Z');
  assert.equal(afterFallDst.regular.startUtc, '2026-11-02T14:30:00.000Z');
  assert.equal(beforeDst.sessionBoundarySignatures.regular, afterSpringDst.sessionBoundarySignatures.regular);

  const shiftedClose = structuredClone(beforeDst);
  shiftedClose.regular.endLocal = '2026-03-06T15:55:00.000-05:00';
  shiftedClose.regular.endUtc = '2026-03-06T20:55:00.000Z';
  shiftedClose.afterHours.startLocal = shiftedClose.regular.endLocal;
  shiftedClose.afterHours.startUtc = shiftedClose.regular.endUtc;
  shiftedClose.officialRegularCloseAt = shiftedClose.regular.endUtc;
  assert.equal(RLSESSION.validateCalendarSession(shiftedClose).error.reason, 'calendar-session-boundary-invalid');

  const laterCalendar = structuredClone(calendar);
  laterCalendar.sourceRef.retrievedAt = '2026-07-14T12:05:00.000Z';
  const repeatedBeforeDst = unwrap(RLSESSION.loadCalendarSession(laterCalendar, '2026-03-06', CUTOFF_POLICY));
  assert.equal(repeatedBeforeDst.semanticFingerprint, beforeDst.semanticFingerprint);
  assert.notEqual(repeatedBeforeDst.occurrenceFingerprint, beforeDst.occurrenceFingerprint);
  assert.notEqual(repeatedBeforeDst.sourceRef, beforeDst.sourceRef);

  const uncovered = RLSESSION.loadCalendarSession(calendar, '2026-07-07', CUTOFF_POLICY);
  assert.equal(uncovered.ok, false);
  assert.equal(uncovered.error.code, 'B002-CALENDAR');
  assert.equal(uncovered.error.reason, 'trading-date-not-covered');

  const corruptUnselectedRow = structuredClone(calendar);
  corruptUnselectedRow.rows.find((row) => row.tradingDate === '2026-11-02').regular.startUtc = '2026-11-02T14:35:00.000Z';
  const corruptCalendar = RLSESSION.loadCalendarSession(corruptUnselectedRow, '2026-07-14', CUTOFF_POLICY);
  assert.equal(corruptCalendar.ok, false);
  assert.equal(corruptCalendar.error.code, 'B002-CALENDAR');
  assert.equal(corruptCalendar.error.reason, 'calendar-local-utc-mismatch');
});

test('SCN-002-022: invalid stale missing disputed and post-cutoff evidence fails loud', () => {
  const session = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-14', CUTOFF_POLICY));
  const source = sourceAt('2026-07-14T13:50:00.000Z');
  const cutoffAt = '2026-07-14T14:00:00.000Z';

  const cases = [
    [sourceBar('2026-07-14T13:30:00'), 'timestamp-naive'],
    [sourceBar('2026-03-08T02:30:00.000-05:00', { barStartLocal: '2026-03-08T02:30:00.000' }), 'local-time-roundtrip-mismatch'],
    [sourceBar('2026-07-14T13:31:00.000Z'), 'interval-off-grid'],
    [sourceBar('2026-07-14T13:25:00.000Z', { barEnd: '2026-07-14T13:35:00.000Z' }), 'interval-duration-invalid'],
    [sourceBar('2026-07-14T13:58:00.000Z'), 'bar-after-cutoff']
  ];

  for (const [bar, reason] of cases) {
    const result = RLSESSION.classifySessionObservation(bar, session, cutoffAt, source);
    assert.equal(result.ok, false, reason);
    assert.equal(result.error.code, 'B002-TIMESTAMP');
    assert.equal(result.error.reason, reason);
    assert.equal(Object.hasOwn(result, 'value'), false);
  }

  const staleSource = sourceAt('2026-07-14T13:00:00.000Z');
  staleSource.freshnessState = 'stale';
  const stale = unwrap(RLSESSION.classifySessionObservation(sourceBar('2026-07-14T13:30:00.000Z'), session, cutoffAt, staleSource));
  assert.equal(stale.freshnessState, 'stale');

  const missingVolume = unwrap(RLSESSION.classifySessionObservation(sourceBar('2026-07-14T13:35:00.000Z', { volume: null }), session, cutoffAt, source));
  const zeroVolume = unwrap(RLSESSION.classifySessionObservation(sourceBar('2026-07-14T13:40:00.000Z', { volume: 0 }), session, cutoffAt, source));
  assert.deepEqual([missingVolume.volume, missingVolume.volumeState], [null, 'missing']);
  assert.deepEqual([zeroVolume.volume, zeroVolume.volumeState], [0, 'observed-zero']);

  const forgedNegativeVolume = RLSESSION.validateSessionObservation({ ...zeroVolume, volume: -1, volumeState: 'observed' });
  assert.equal(forgedNegativeVolume.ok, false);
  assert.equal(forgedNegativeVolume.error.reason, 'session-observation-volume-invalid');

  const forgedObservationIdentity = RLSESSION.validateSessionObservation({
    ...zeroVolume,
    observationId: 'sha256:5555555555555555555555555555555555555555555555555555555555555555'
  });
  assert.equal(forgedObservationIdentity.ok, false);
  assert.equal(forgedObservationIdentity.error.reason, 'session-observation-identity-mismatch');

  const forgedBucketIndex = RLSESSION.validateSessionObservation({ ...zeroVolume, bucketIndex: zeroVolume.bucketIndex + 1 });
  assert.equal(forgedBucketIndex.ok, false);
  assert.equal(forgedBucketIndex.error.reason, 'session-observation-bucket-mismatch');

  const forgedOhlc = RLSESSION.validateSessionObservation({ ...zeroVolume, low: zeroVolume.high + 1 });
  assert.equal(forgedOhlc.ok, false);
  assert.equal(forgedOhlc.error.reason, 'session-observation-price-invalid');

  const duplicateBucket = unwrap(RLSESSION.classifySessionObservation(sourceBar('2026-07-14T13:40:00.000Z', {
    providerSymbol: 'SPY.ALIAS',
    close: 102,
    high: 103
  }), session, cutoffAt, source));
  const duplicateBucketAggregate = RLSESSION.aggregateSession([zeroVolume, duplicateBucket], session, 'regular', cutoffAt, null);
  assert.equal(duplicateBucketAggregate.ok, false);
  assert.equal(duplicateBucketAggregate.error.code, 'B002-TIMESTAMP');
  assert.equal(duplicateBucketAggregate.error.reason, 'duplicate-session-bucket');

  const disputed = unwrap(RLSESSION.classifySessionObservation(sourceBar('2026-07-14T13:45:00.000Z', {
    adjustmentState: 'disputed'
  }), session, cutoffAt, source));
  assert.equal(unwrap(RLSESSION.aggregateSession([disputed], session, 'regular', cutoffAt, null)).state, 'disputed');

  const discontinuous = unwrap(RLSESSION.classifySessionObservation(sourceBar('2026-07-14T13:50:00.000Z', {
    adjustmentState: 'corporate-action-discontinuity',
    corporateActionRefs: ['sha256:4444444444444444444444444444444444444444444444444444444444444444']
  }), session, cutoffAt, source));
  assert.equal(unwrap(RLSESSION.aggregateSession([discontinuous], session, 'regular', cutoffAt, null)).state, 'misaligned');

  const duplicateDisagreement = RLSESSION.aggregateSession([
    zeroVolume,
    {
      ...zeroVolume,
      observationId: RLCONTRACTS.fingerprint('session-observation', { contractVersion: 'session-observation-test-identity/v1', variant: 'disputed' }),
      occurrenceFingerprint: RLCONTRACTS.fingerprint('session-observation', { contractVersion: 'session-observation-test-identity/v1', variant: 'disputed' }),
      close: zeroVolume.close + 1
    }
  ], session, 'regular', cutoffAt, null);
  assert.equal(duplicateDisagreement.ok, false);
  assert.equal(duplicateDisagreement.error.code, 'B002-TIMESTAMP');
  assert.equal(duplicateDisagreement.error.reason, 'duplicate-observation-disagreement');
});

test('SCN-002-028: source policy accepts only the exact NYSE and Yahoo request contracts', () => {
  const policies = loadSourcePolicies(marketConfig);
  assert.equal(policies.ok, true, policies.reason);
  const requestPolicy = policies.requestPolicy;

  // Canonical Yahoo and NYSE requests are accepted exactly.
  const yahoo = buildYahooRequest('SPY', requestPolicy);
  assert.equal(yahoo.url, 'https://query1.finance.yahoo.com/v8/finance/chart/SPY?interval=5m&range=1mo&includePrePost=true&includeAdjustedClose=true&events=div%2Csplits');
  assert.equal(validateSourceRequest(yahoo, requestPolicy).ok, true);

  const nyse = { sourceId: 'nyse-hours-calendar', method: 'GET', url: 'https://www.nyse.com/markets/hours-calendars' };
  assert.equal(validateSourceRequest(nyse, requestPolicy).ok, true);

  // Every mutation of the exact contract is rejected with its closed reason.
  const reject = (request, reason) => {
    const result = validateSourceRequest(request, requestPolicy);
    assert.equal(result.ok, false, `expected rejection for ${reason}`);
    assert.equal(result.code, 'B002-SOURCE-REQUEST');
    assert.equal(result.reason, reason, `wrong reason for mutation ${reason}`);
  };

  reject({ sourceId: 'unknown-source', method: 'GET', url: yahoo.url }, 'source-not-allowlisted');
  reject({ sourceId: 'yahoo-chart', method: 'POST', url: yahoo.url }, 'method-mismatch');
  reject({ sourceId: 'yahoo-chart', method: 'GET', url: yahoo.url.replace('https://', 'http://') }, 'scheme-not-allowlisted');
  reject({ sourceId: 'yahoo-chart', method: 'GET', url: yahoo.url.replace('query1.finance.yahoo.com', 'evil.example.com') }, 'host-not-allowlisted');
  reject({ sourceId: 'yahoo-chart', method: 'GET', url: yahoo.url.replace('query1.finance.yahoo.com', 'attacker@query1.finance.yahoo.com') }, 'userinfo-forbidden');
  reject({ sourceId: 'yahoo-chart', method: 'GET', url: yahoo.url + '#leak' }, 'fragment-forbidden');
  reject({ sourceId: 'yahoo-chart', method: 'GET', url: 'https://query1.finance.yahoo.com/v8/finance/quote/SPY?interval=5m&range=1mo&includePrePost=true&includeAdjustedClose=true&events=div%2Csplits' }, 'path-not-allowlisted');
  reject({ sourceId: 'yahoo-chart', method: 'GET', url: yahoo.url + '&extra=1' }, 'query-key-cardinality-mismatch');
  reject({ sourceId: 'yahoo-chart', method: 'GET', url: yahoo.url.replace('&events=div%2Csplits', '&other=div%2Csplits') }, 'query-key-missing');
  reject({ sourceId: 'yahoo-chart', method: 'GET', url: yahoo.url.replace('interval=5m', 'interval=1m') }, 'query-value-mismatch');
  reject({ sourceId: 'yahoo-chart', method: 'GET', url: yahoo.url + '&interval=5m' }, 'duplicate-query-key');

  reject({ sourceId: 'nyse-hours-calendar', method: 'POST', url: nyse.url }, 'method-mismatch');
  reject({ sourceId: 'nyse-hours-calendar', method: 'GET', url: 'https://www.nyse.com/markets/other' }, 'path-not-allowlisted');
  reject({ sourceId: 'nyse-hours-calendar', method: 'GET', url: nyse.url + '?leak=1' }, 'query-key-cardinality-mismatch');
});
