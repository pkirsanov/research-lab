import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const RLSESSION = require('../rlsession.js');
const calendar = JSON.parse(readFileSync(new URL('./fixtures/feature-002/market-session-evidence/xnys-calendar.v1.json', import.meta.url), 'utf8'));

const cutoffPolicy = {
  contractVersion: 'cutoff-policy/v1',
  interval: 'PT5M',
  boundaryPolicyVersion: 'xnys-session-boundaries/v1',
  requireNextOpenTradingDate: true
};
const comparisonPolicy = {
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
};
const reactionPolicy = {
  contractVersion: 'reaction-policy/v1',
  interval: 'PT5M',
  strictPostRelease: true,
  segmentOrder: ['pre-market', 'regular', 'after-hours']
};
const bundlePolicy = {
  contractVersion: 'market-session-evidence-policy/v1',
  evidenceRoot: 'briefs/objects/evidence',
  requiredCalendar: true,
  requiredBenchmarkSymbol: 'SPY',
  requiredDueReportStates: ['upcoming', 'released', 'revised']
};

function unwrap(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code}:${result.error.reason}`);
  return result.value;
}

function sourceAt(sourceId, retrievedAt, sourceKind = 'best-effort-public-chart') {
  const official = sourceKind === 'official-report';
  return {
    contractVersion: 'source-provenance/v1',
    sourceId,
    adapterId: `${sourceId}-normalized`,
    adapterVersion: `${sourceId}-adapter/v1`,
    sourceKind,
    sourceUrl: official ? 'https://api.bls.gov/publicAPI/v2/timeseries/data/' : 'https://query1.finance.yahoo.com/v8/finance/chart/SPY',
    requestDescriptor: {
      method: official ? 'POST' : 'GET',
      path: official ? '/publicAPI/v2/timeseries/data/' : '/v8/finance/chart/SPY',
      query: official ? {} : { interval: '5m', includePrePost: 'true', range: '1mo' }
    },
    sourcePublishedAt: official ? '2026-07-14T12:30:00.000Z' : null,
    retrievedAt,
    contentSha256: 'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    accessClass: official ? 'public-official' : 'public-best-effort',
    sourceUsePolicyId: `source-use-policy/${sourceId}/v1`,
    sourceUseReviewRef: `reviews/source-use/${sourceId}/v1`,
    retentionMode: 'normalized-facts-and-hash',
    freshnessPolicy: official ? 'report-target-period/v1' : 'active-session-20m/v1',
    freshnessState: 'current',
    diagnostics: []
  };
}

function classifyRange(session, cutoffAt, source, startUtc, endStartUtc, barOverrides = {}) {
  const rows = [];
  for (let time = Date.parse(startUtc), end = Date.parse(endStartUtc); time <= end; time += 300000) {
    const bucket = (time - Date.parse(session.preMarket.startUtc)) / 300000;
    rows.push(unwrap(RLSESSION.classifySessionObservation({
      contractVersion: 'session-source-bar/v1',
      symbol: 'SPY',
      providerSymbol: 'SPY',
      interval: 'PT5M',
      barStart: new Date(time).toISOString(),
      open: 100 + bucket / 100,
      high: 101 + bucket / 100,
      low: 99 + bucket / 100,
      close: 100.5 + bucket / 100,
      volume: 10,
      priceBasis: 'provider-chart-basis',
      adjustmentState: 'compatible',
      corporateActionRefs: [],
      ...barOverrides
    }, session, cutoffAt, source)));
  }
  return rows;
}

function candidate(index, value, signature, endBucket, startBucket = 0, overrides = {}) {
  return {
    contractVersion: 'comparable-session-candidate/v1',
    candidateId: RLCONTRACTS.fingerprint('comparable-session-candidate', { contractVersion: 'comparable-session-candidate-test-identity/v1', index, value, signature, startBucket, endBucket, overrides }),
    tradingDate: `2026-06-${String(index + 1).padStart(2, '0')}`,
    symbol: 'SPY',
    sessionKind: 'pre-market',
    comparisonBoundarySignature: signature,
    interval: 'PT5M',
    sourceId: 'yahoo-chart',
    adapterVersion: 'yahoo-chart-adapter/v1',
    priceBasis: 'provider-chart-basis',
    adjustmentState: 'compatible',
    startBucket,
    endBucketInclusive: endBucket,
    bucketVolumes: Array.from({ length: endBucket - startBucket + 1 }, (_, offset) => ({
      bucketIndex: startBucket + offset,
      volume: startBucket + offset === endBucket ? value : 0,
      volumeState: startBucket + offset === endBucket ? 'observed' : 'observed-zero'
    })),
    sourceRef: 'sha256:4444444444444444444444444444444444444444444444444444444444444444',
    ...overrides
  };
}

function reactionCandidates(values, segment) {
  const candidates = values.map((value, index) => candidate(
    index,
    value,
    segment.comparisonBoundarySignature,
    segment.endBucketInclusive,
    segment.startBucket
  ));
  while (candidates.length < 20) {
    const index = candidates.length;
    candidates.push(candidate(
      index,
      10,
      segment.comparisonBoundarySignature,
      segment.endBucketInclusive,
      segment.startBucket,
      index === 14 ? { startBucket: segment.startBucket - 1 } : { sessionKind: 'regular' }
    ));
  }
  return candidates;
}

function consensusArtifact(scheduledAt) {
  const artifact = {
    contractVersion: 'report-consensus-artifact/v1',
    consensusId: 'consensus:cpi:headline-mom-sa:2026-06',
    reportId: 'report:test-cpi:2026-06',
    reportPeriod: '2026-06',
    metricId: 'headline-mom-sa',
    value: 0.30,
    unit: '%',
    seasonalBasis: 'seasonally-adjusted',
    transform: 'mom',
    sourcePublishedAt: '2026-07-14T11:00:00.000Z',
    capturedAt: '2026-07-14T11:05:00.000Z',
    sourceRef: 'reviews/consensus/test-provider/v1',
    contentSha256: 'sha256:5555555555555555555555555555555555555555555555555555555555555555',
    preReleaseLockRef: {
      contractVersion: 'evidence-reference/v1',
      evidenceType: 'market-session-evidence',
      fingerprint: 'sha256:6666666666666666666666666666666666666666666666666666666666666666',
      path: 'briefs/objects/evidence/bundles/6666666666666666666666666666666666666666666666666666666666666666.json',
      sha256: 'sha256:7777777777777777777777777777777777777777777777777777777777777777',
      state: 'available',
      cutoffAt: '2026-07-14T11:10:00.000Z',
      provenanceRefs: []
    },
    lockedAt: '2026-07-14T11:10:00.000Z',
    lockRunId: 'run-pre-release-cpi-2026-06',
    lockManifestSha256: 'sha256:8888888888888888888888888888888888888888888888888888888888888888',
    scheduledAt
  };
  artifact.fingerprint = RLCONTRACTS.semanticFingerprint('report-consensus-artifact', artifact);
  return artifact;
}

test('Foundation pipeline builds one deterministic cutoff-safe evidence bundle from normalized inputs', () => {
  const cutoffAt = '2026-07-14T12:40:00.000Z';
  const session = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-14', cutoffPolicy));
  const chartSource = sourceAt('yahoo-chart', '2026-07-14T12:39:00.000Z');
  const observations = classifyRange(session, cutoffAt, chartSource, '2026-07-14T08:00:00.000Z', '2026-07-14T12:35:00.000Z');
  const officialCloseAnchor = {
    contractVersion: 'official-regular-close-anchor/v1',
    tradingDate: '2026-07-13',
    close: 100,
    at: '2026-07-13T20:00:00.000Z',
    priceBasis: 'provider-chart-basis',
    adjustmentState: 'compatible',
    sourceRef: RLCONTRACTS.occurrenceFingerprint('source-provenance', chartSource)
  };
  const aggregate = unwrap(RLSESSION.aggregateSession(observations, session, 'pre-market', cutoffAt, officialCloseAnchor));
  assert.equal(aggregate.priceBars, 56);
  assert.equal(aggregate.expectedBucketsThroughCutoff, 56);
  assert.equal(aggregate.latestCompletedBucket, 55);
  assert.equal(aggregate.cumulativeObservedVolume, 560);
  assert.equal(aggregate.latestLabel, 'indicative-pre-market');
  assert.equal(aggregate.returnFromOfficialClose, aggregate.latest / 100 - 1);

  const historical = Array.from({ length: 14 }, (_, index) => candidate(index, 250 + index * 10, aggregate.comparisonBoundarySignature, 55));
  for (let index = 14; index < 20; index += 1) {
    historical.push({ ...candidate(index, 300, aggregate.comparisonBoundarySignature, 55), sessionKind: 'regular' });
  }
  const baseline = unwrap(RLSESSION.buildComparableVolumeBaseline(aggregate, historical, comparisonPolicy));
  assert.equal(baseline.state, 'qualified');
  assert.equal(baseline.comparisonWindow.endBucketInclusive, 55);
  assert.equal(baseline.currentVolume, 560);

  const schedule = {
    contractVersion: 'report-schedule/v1',
    reportId: 'report:test-cpi:2026-06',
    reportType: 'CPI',
    reportPeriod: '2026-06',
    scheduledAt: '2026-07-14T12:30:00.000Z',
    metricDefinitions: [{
      metricId: 'headline-mom-sa',
      unit: '%',
      seasonalBasis: 'seasonally-adjusted',
      transform: 'mom'
    }]
  };
  const reportSource = sourceAt('bls-public-api-v2', '2026-07-14T12:35:00.000Z', 'official-report');
  const snapshot = {
    contractVersion: 'report-source-snapshot/v1',
    reportId: schedule.reportId,
    reportPeriod: schedule.reportPeriod,
    sourceRecords: [{
      sourceRecordId: 'record:test-cpi:2026-06:1',
      sourceRef: reportSource,
      releasedAt: schedule.scheduledAt,
      metrics: [{
        metricId: 'headline-mom-sa',
        period: '2026-06',
        value: 0.40,
        unit: '%',
        seasonalBasis: 'seasonally-adjusted',
        transform: 'mom'
      }],
      previous: [{
        metricId: 'headline-mom-sa',
        period: '2026-05',
        value: 0.25,
        unit: '%',
        seasonalBasis: 'seasonally-adjusted',
        transform: 'mom'
      }]
    }]
  };
  const report = unwrap(RLSESSION.normalizeReleasedReport(snapshot, schedule, consensusArtifact(schedule.scheduledAt), null, cutoffAt));
  assert.equal(report.state, 'released');
  assert.equal(report.actual[0].value, 0.40);
  assert.match(report.previous[0].sourceRef, /^sha256:[a-f0-9]{64}$/);
  assert.ok(Math.abs(report.surprises[0].value - 0.10) < 1e-12);
  const contradictoryReleased = RLSESSION.validateReleasedReportEvidence({ ...report, releasedAt: null });
  assert.equal(contradictoryReleased.ok, false);
  assert.equal(contradictoryReleased.error.reason, 'report-state-time-mismatch');
  const forgedReportValue = structuredClone(report);
  forgedReportValue.actual[0].value = 0.41;
  assert.equal(RLSESSION.validateReleasedReportEvidence(forgedReportValue).error.reason, 'released-report-fingerprint-mismatch');
  const nonFiniteReportValue = structuredClone(report);
  nonFiniteReportValue.actual[0].value = Number.NaN;
  const nonFiniteReport = RLSESSION.validateReleasedReportEvidence(nonFiniteReportValue);
  assert.equal(nonFiniteReport.ok, false);
  assert.equal(nonFiniteReport.error.reason, 'released-report-metric-invalid');

  const earlySnapshot = structuredClone(snapshot);
  earlySnapshot.sourceRecords[0].releasedAt = '2026-07-14T12:20:00.000Z';
  earlySnapshot.sourceRecords[0].sourceRef = sourceAt('bls-public-api-v2', '2026-07-14T12:25:00.000Z', 'official-report');
  earlySnapshot.sourceRecords[0].sourceRef.sourcePublishedAt = '2026-07-14T12:20:00.000Z';
  const upcoming = unwrap(RLSESSION.normalizeReleasedReport(earlySnapshot, schedule, null, null, '2026-07-14T12:29:59.000Z'));
  assert.equal(upcoming.state, 'upcoming');
  assert.equal(upcoming.releasedAt, null);
  assert.deepEqual(upcoming.actual, []);
  assert.deepEqual(upcoming.sourceRecords, []);
  const contradictoryUpcoming = RLSESSION.validateReleasedReportEvidence({ ...upcoming, releasedAt: schedule.scheduledAt });
  assert.equal(contradictoryUpcoming.ok, false);
  assert.equal(contradictoryUpcoming.error.code, 'B002-TIMESTAMP');
  assert.equal(contradictoryUpcoming.error.reason, 'report-release-after-cutoff');

  const prematureRetrievalSnapshot = structuredClone(snapshot);
  prematureRetrievalSnapshot.sourceRecords[0].sourceRef = sourceAt('bls-public-api-v2', '2026-07-14T12:25:00.000Z', 'official-report');
  prematureRetrievalSnapshot.sourceRecords[0].sourceRef.sourcePublishedAt = '2026-07-14T12:20:00.000Z';
  const prematureRetrieval = unwrap(RLSESSION.normalizeReleasedReport(prematureRetrievalSnapshot, schedule, null, null, cutoffAt));
  assert.equal(prematureRetrieval.state, 'unavailable');
  assert.equal(prematureRetrieval.reasonCodes.includes('source-record-retrieved-before-release'), true);

  const disputedSnapshot = structuredClone(snapshot);
  const conflictingRecord = structuredClone(disputedSnapshot.sourceRecords[0]);
  conflictingRecord.sourceRecordId = 'record:test-cpi:2026-06:2';
  conflictingRecord.metrics[0].value = 0.45;
  disputedSnapshot.sourceRecords.push(conflictingRecord);
  const disputedReport = unwrap(RLSESSION.normalizeReleasedReport(disputedSnapshot, schedule, consensusArtifact(schedule.scheduledAt), null, cutoffAt));
  assert.equal(disputedReport.state, 'disputed');
  assert.equal(disputedReport.sourceRecords.length, 2);
  assert.deepEqual(disputedReport.actual, []);
  assert.deepEqual(disputedReport.surprises, []);
  assert.equal(disputedReport.reasonCodes.includes('provider-disagreement'), true);

  const reaction = unwrap(RLSESSION.joinEventMarketReaction(report, observations, cutoffAt, reactionPolicy));
  const segment = reaction.segments[0];
  assert.equal(reaction.preReleaseBaseline.barStart, '2026-07-14T12:25:00.000Z');
  assert.equal(reaction.preReleaseBaseline.barEnd, '2026-07-14T12:30:00.000Z');
  assert.deepEqual(reaction.observationRefs, [observations.at(-1).observationId]);
  assert.equal(segment.segmentId, segment.occurrenceFingerprint);
  assert.deepEqual(Object.keys(segment).sort(), [
    'adapterVersion', 'adjustmentState', 'calendarFingerprint', 'comparisonBoundarySignature',
    'comparisonWindow', 'contractVersion', 'cumulativeObservedVolume', 'cutoffAt', 'endAt',
    'endBucketInclusive', 'expectedBucketCount', 'high', 'interval', 'latest', 'low',
    'missingBuckets', 'observationRefs', 'observationSemanticRefs', 'occurrenceFingerprint',
    'postReleaseWindow', 'preReleaseWindow', 'priceBarCount', 'priceBasis', 'providerSymbol',
    'reasonCodes', 'releaseIdentity', 'segmentId', 'segmentOrdinal', 'semanticFingerprint',
    'sessionEnd', 'sessionKind', 'sessionStart', 'sourceId', 'sourceRefs', 'startAt',
    'startBucket', 'state', 'symbol', 'tradingDate', 'volumeBarCount', 'volumeCompleteness'
  ].sort());
  assert.match(segment.semanticFingerprint, /^sha256:[a-f0-9]{64}$/);
  assert.equal(segment.segmentOrdinal, 0);
  assert.equal(segment.releaseIdentity, report.releaseIdentity);
  assert.equal(segment.symbol, 'SPY');
  assert.equal(segment.providerSymbol, 'SPY');
  assert.equal(segment.tradingDate, session.tradingDate);
  assert.equal(segment.calendarFingerprint, session.semanticFingerprint);
  assert.equal(segment.comparisonBoundarySignature, session.sessionBoundarySignatures['pre-market']);
  assert.equal(segment.startBucket, 55);
  assert.equal(segment.endBucketInclusive, 55);
  assert.deepEqual(segment.comparisonWindow, {
    contractVersion: 'comparison-window/v1',
    sessionKind: 'pre-market',
    startBucket: 55,
    endBucketInclusive: 55
  });
  assert.deepEqual(segment.preReleaseWindow, {
    contractVersion: 'completed-bar-window/v1',
    role: 'pre-release-baseline',
    sessionKind: 'pre-market',
    startBucket: 53,
    endBucketInclusive: 53,
    startAt: '2026-07-14T12:25:00.000Z',
    endAt: '2026-07-14T12:30:00.000Z',
    expectedBucketCount: 1,
    observationSemanticRefs: [observations.at(-3).semanticFingerprint],
    observationRefs: [observations.at(-3).observationId],
    missingBuckets: []
  });
  assert.deepEqual(segment.postReleaseWindow, {
    contractVersion: 'completed-bar-window/v1',
    role: 'post-release-reaction',
    sessionKind: 'pre-market',
    startBucket: 55,
    endBucketInclusive: 55,
    startAt: '2026-07-14T12:35:00.000Z',
    endAt: '2026-07-14T12:40:00.000Z',
    expectedBucketCount: 1,
    observationSemanticRefs: [observations.at(-1).semanticFingerprint],
    observationRefs: [observations.at(-1).observationId],
    missingBuckets: []
  });
  assert.equal(segment.expectedBucketCount, 1);
  assert.equal(segment.priceBarCount, 1);
  assert.equal(segment.volumeBarCount, 1);
  assert.equal(segment.cumulativeObservedVolume, 10);
  assert.equal(segment.volumeCompleteness, 'complete');
  assert.equal(segment.state, 'partial');
  assert.deepEqual(segment.reasonCodes, ['segment-window-open']);
  assert.deepEqual(segment.observationSemanticRefs, [observations.at(-1).semanticFingerprint]);
  assert.deepEqual(segment.observationRefs, [observations.at(-1).observationId]);
  assert.deepEqual(segment.sourceRefs, [observations.at(-1).sourceRef]);

  const segmentBaseline = unwrap(RLSESSION.buildComparableVolumeBaseline(
    segment,
    reactionCandidates([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], segment),
    comparisonPolicy
  ));
  assert.deepEqual(segmentBaseline.comparisonWindow, segment.comparisonWindow);
  assert.equal(segmentBaseline.currentAggregateRef, segment.semanticFingerprint);
  assert.equal(segmentBaseline.currentVolume, segment.cumulativeObservedVolume);
  assert.equal(segmentBaseline.eligibleSessionCount, 14);
  assert.equal(segmentBaseline.excludedSessions.some((entry) => entry.reasonCodes.includes('bucket-range-mismatch')), true);
  assert.equal(segmentBaseline.excludedSessions.filter((entry) => entry.reasonCodes.includes('session-kind-mismatch')).length, 5);

  const forgedSegmentIdentity = structuredClone(reaction);
  forgedSegmentIdentity.segments[0].segmentOrdinal = 1;
  assert.equal(RLSESSION.validateEventMarketReaction(forgedSegmentIdentity).error.reason, 'reaction-segment-identity-mismatch');
  const forgedSegmentSemanticIdentity = structuredClone(reaction);
  forgedSegmentSemanticIdentity.segments[0].semanticFingerprint = 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  assert.equal(RLSESSION.validateEventMarketReaction(forgedSegmentSemanticIdentity).error.reason, 'reaction-segment-identity-mismatch');
  const missingParentSourceRefs = structuredClone(reaction);
  delete missingParentSourceRefs.sourceRefs;
  assert.equal(RLSESSION.validateEventMarketReaction(missingParentSourceRefs).error.reason, 'event-reaction-contract-invalid');

  const forgedPreReleaseLink = structuredClone(reaction);
  forgedPreReleaseLink.segments[0].preReleaseWindow.observationRefs[0] =
    'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
  forgedPreReleaseLink.segments[0].occurrenceFingerprint = RLCONTRACTS.occurrenceFingerprint(
    'reaction-segment',
    {
      contractVersion: 'reaction-segment-occurrence/v1',
      semanticFingerprint: forgedPreReleaseLink.segments[0].semanticFingerprint,
      cutoffAt: forgedPreReleaseLink.segments[0].cutoffAt,
      preReleaseObservationRefs: forgedPreReleaseLink.segments[0].preReleaseWindow.observationRefs,
      postReleaseObservationRefs: forgedPreReleaseLink.segments[0].postReleaseWindow.observationRefs,
      sourceRefs: forgedPreReleaseLink.segments[0].sourceRefs
    }
  );
  forgedPreReleaseLink.segments[0].segmentId = forgedPreReleaseLink.segments[0].occurrenceFingerprint;
  forgedPreReleaseLink.occurrenceFingerprint = RLCONTRACTS.occurrenceFingerprint(
    'event-market-reaction',
    {
      contractVersion: 'event-market-reaction-occurrence/v1',
      cutoffAt: forgedPreReleaseLink.cutoffAt,
      observationRefs: forgedPreReleaseLink.observationRefs,
      segmentRefs: forgedPreReleaseLink.segments.map((entry) => entry.occurrenceFingerprint),
      sourceRefs: forgedPreReleaseLink.sourceRefs,
      semanticFingerprint: forgedPreReleaseLink.semanticFingerprint
    }
  );
  forgedPreReleaseLink.reactionId = forgedPreReleaseLink.occurrenceFingerprint;
  assert.equal(
    RLSESSION.validateEventMarketReaction(forgedPreReleaseLink).error.reason,
    'reaction-segment-parent-mismatch'
  );

  const gapCutoffAt = '2026-07-14T12:45:00.000Z';
  const gapSource = sourceAt('yahoo-chart', '2026-07-14T12:44:00.000Z');
  const gappedObservations = classifyRange(
    session,
    gapCutoffAt,
    gapSource,
    '2026-07-14T12:25:00.000Z',
    '2026-07-14T12:40:00.000Z'
  ).filter((observation) => observation.barStart !== '2026-07-14T12:35:00.000Z');
  const gappedReaction = unwrap(RLSESSION.joinEventMarketReaction(report, gappedObservations, gapCutoffAt, reactionPolicy));
  const gappedSegment = gappedReaction.segments[0];
  assert.deepEqual(gappedSegment.comparisonWindow, {
    contractVersion: 'comparison-window/v1',
    sessionKind: 'pre-market',
    startBucket: 55,
    endBucketInclusive: 56
  });
  assert.deepEqual(gappedSegment.missingBuckets, [55]);
  assert.deepEqual(gappedSegment.postReleaseWindow.missingBuckets, [55]);
  assert.equal(gappedSegment.priceBarCount, 1);
  assert.equal(gappedSegment.volumeBarCount, 1);
  assert.equal(gappedSegment.volumeCompleteness, 'partial');
  assert.deepEqual(gappedSegment.reasonCodes, [
    'missing-price-bucket', 'missing-volume-bucket', 'segment-window-open'
  ]);

  const chronologicalObservations = classifyRange(
    session,
    gapCutoffAt,
    gapSource,
    '2026-07-14T12:25:00.000Z',
    '2026-07-14T12:40:00.000Z'
  );
  const chronologicalReaction = unwrap(RLSESSION.joinEventMarketReaction(
    report,
    chronologicalObservations,
    gapCutoffAt,
    reactionPolicy
  ));
  assert.deepEqual(
    chronologicalReaction.segments[0].observationRefs,
    chronologicalObservations.slice(-2).map((observation) => observation.observationId)
  );
  const reversedChronology = structuredClone(chronologicalReaction);
  reversedChronology.segments[0].observationRefs.reverse();
  reversedChronology.segments[0].observationSemanticRefs.reverse();
  reversedChronology.segments[0].postReleaseWindow.observationRefs.reverse();
  reversedChronology.segments[0].postReleaseWindow.observationSemanticRefs.reverse();
  assert.equal(RLSESSION.validateEventMarketReaction(reversedChronology).error.reason, 'reaction-segment-identity-mismatch');
  assert.equal(RLSESSION.validateEventMarketReaction({
    ...reaction,
    reactionId: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
  }).error.reason, 'event-reaction-identity-mismatch');
  const invalidReactionCutoff = RLSESSION.validateEventMarketReaction({ ...reaction, cutoffAt: 'not-a-timestamp' });
  assert.equal(invalidReactionCutoff.ok, false);
  assert.equal(invalidReactionCutoff.error.code, 'B002-TIMESTAMP');
  const forgedReactionSegment = structuredClone(reaction);
  forgedReactionSegment.segments[0].endAt = '2026-07-14T12:45:00.000Z';
  assert.equal(RLSESSION.validateEventMarketReaction(forgedReactionSegment).error.reason, 'reaction-segment-time-invalid');

  const mixedCutoffObservation = {
    ...observations.at(-2),
    cutoffAt: '2026-07-14T12:35:00.000Z'
  };
  const mixedCutoffReaction = RLSESSION.joinEventMarketReaction(report, [mixedCutoffObservation, observations.at(-1)], cutoffAt, reactionPolicy);
  assert.equal(mixedCutoffReaction.ok, false);
  assert.equal(mixedCutoffReaction.error.code, 'B002-TIMESTAMP');
  assert.equal(mixedCutoffReaction.error.reason, 'reaction-observation-cutoff-mismatch');

  const staleSource = sourceAt('yahoo-chart', '2026-07-14T12:39:00.000Z');
  staleSource.freshnessState = 'stale';
  const staleObservations = classifyRange(session, cutoffAt, staleSource, '2026-07-14T12:25:00.000Z', '2026-07-14T12:35:00.000Z');
  const staleReaction = unwrap(RLSESSION.joinEventMarketReaction(report, staleObservations, cutoffAt, reactionPolicy));
  assert.equal(staleReaction.state, 'stale');

  const disputedObservations = classifyRange(session, cutoffAt, chartSource, '2026-07-14T12:25:00.000Z', '2026-07-14T12:35:00.000Z', {
    adjustmentState: 'disputed'
  });
  const disputedReaction = unwrap(RLSESSION.joinEventMarketReaction(report, disputedObservations, cutoffAt, reactionPolicy));
  assert.equal(disputedReaction.state, 'disputed');
  assert.equal(disputedReaction.returnFromBaseline, null);

  const qqqObservation = unwrap(RLSESSION.classifySessionObservation({
    contractVersion: 'session-source-bar/v1',
    symbol: 'QQQ',
    providerSymbol: 'QQQ',
    interval: 'PT5M',
    barStart: '2026-07-14T12:35:00.000Z',
    open: 100,
    high: 101,
    low: 99,
    close: 100.5,
    volume: 10,
    priceBasis: 'provider-chart-basis',
    adjustmentState: 'compatible',
    corporateActionRefs: []
  }, session, cutoffAt, chartSource));
  const mixedSymbolReaction = RLSESSION.joinEventMarketReaction(report, [observations.at(-2), qqqObservation], cutoffAt, reactionPolicy);
  assert.equal(mixedSymbolReaction.ok, false);
  assert.equal(mixedSymbolReaction.error.code, 'B002-REACTION');
  assert.equal(mixedSymbolReaction.error.reason, 'reaction-semantics-misaligned');

  const input = {
    contractVersion: 'market-session-evidence-input/v1',
    runId: 'run-feature-002-foundation-functional',
    cutoffAt,
    calendarSession: session,
    aggregates: [aggregate],
    baselines: [baseline, segmentBaseline],
    reports: [report],
    reactions: [reaction],
    closedDateProof: null,
    requiredEvidence: {
      calendar: { required: true, state: 'available' },
      benchmark: { required: true, symbol: 'SPY', state: aggregate.state, officialCloseAnchorState: 'available' },
      dueReports: [{ required: true, reportId: report.reportId, state: report.state }]
    },
    policy: bundlePolicy
  };
  const first = unwrap(RLSESSION.buildMarketSessionEvidence(input));
  const second = unwrap(RLSESSION.buildMarketSessionEvidence({
    policy: { ...bundlePolicy },
    requiredEvidence: { ...input.requiredEvidence },
    reactions: [...input.reactions],
    reports: [...input.reports],
    baselines: [...input.baselines],
    aggregates: [...input.aggregates],
    calendarSession: { ...input.calendarSession },
    closedDateProof: null,
    cutoffAt,
    runId: input.runId,
    contractVersion: input.contractVersion
  }));
  assert.equal(first.contractVersion, 'market-session-evidence/v1');
  assert.equal(first.fingerprint, second.fingerprint);
  assert.equal(first.evidenceId, second.evidenceId);
  assert.match(first.evidenceId, /^sha256:[a-f0-9]{64}$/);
  assert.equal(first.calendarSessionRef.evidenceType, 'calendar-session');
  assert.deepEqual(Object.keys(first.requiredEvidence).sort(), [
    'benchmark', 'calendar', 'closedDate', 'contractVersion', 'dueReports', 'mode'
  ]);
  assert.equal(first.requiredEvidence.contractVersion, 'required-evidence/v1');
  assert.equal(first.requiredEvidence.mode, 'open-date');
  assert.equal(first.requiredEvidence.closedDate, null);
  assert.equal(first.requiredEvidence.calendar.tradingDate, session.tradingDate);
  assert.equal(first.requiredEvidence.calendar.dateState, session.dateState);
  assert.deepEqual(first.requiredEvidence.calendar.calendarSessionRef, first.calendarSessionRef);
  assert.equal(first.requiredEvidence.benchmark.presence, 'present');
  assert.equal(first.requiredEvidence.benchmark.aggregateRef.fingerprint, aggregate.semanticFingerprint);
  assert.equal(first.requiredEvidence.benchmark.baselineRef.fingerprint, baseline.semanticFingerprint);
  assert.deepEqual(first.sessionAggregateRefs.map((ref) => ref.fingerprint), [aggregate.semanticFingerprint]);
  assert.equal(first.volumeBaselineRefs.some((ref) => ref.fingerprint === segmentBaseline.semanticFingerprint), true);
  assert.equal(first.eventReactionRefs[0].fingerprint, reaction.semanticFingerprint);
  assert.equal(RLSESSION.validateMarketSessionEvidence(first, bundlePolicy).ok, true);
  assert.equal(RLSESSION.validateMarketSessionEvidence({ ...first, state: 'available' }, bundlePolicy).error.reason, 'market-session-evidence-fingerprint-mismatch');
  assert.equal(RLSESSION.validateMarketSessionEvidence({
    ...first,
    evidenceId: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  }, bundlePolicy).error.reason, 'market-session-evidence-identity-mismatch');

  const optionalUnavailableAggregate = unwrap(RLSESSION.aggregateSession([], session, 'regular', cutoffAt, null));
  const isolatedOptionalFailure = unwrap(RLSESSION.buildMarketSessionEvidence({
    ...input,
    aggregates: [aggregate, optionalUnavailableAggregate]
  }));
  assert.equal(optionalUnavailableAggregate.state, 'unavailable');
  assert.equal(isolatedOptionalFailure.state, aggregate.state);
  assert.equal(isolatedOptionalFailure.sessionAggregateRefs.some((ref) => ref.state === 'unavailable'), true);
  assert.equal(isolatedOptionalFailure.reasonCodes.includes('incomplete-volume'), false);

  const noPolicy = RLSESSION.buildMarketSessionEvidence({ ...input, policy: undefined });
  assert.equal(noPolicy.ok, false);
  assert.equal(noPolicy.error.code, 'B002-INPUT-REJECTED');
  assert.equal(noPolicy.error.reason, 'bundle-policy-required');

  const ownerInterpretationLeak = RLSESSION.buildMarketSessionEvidence({
    ...input,
    ownerModelInterpretation: { direction: 'bullish' }
  });
  assert.equal(ownerInterpretationLeak.ok, false);
  assert.equal(ownerInterpretationLeak.error.code, 'B002-INPUT-REJECTED');
  assert.equal(ownerInterpretationLeak.error.reason, 'bundle-input-unknown-field');

  const unlinkedBaseline = RLSESSION.buildMarketSessionEvidence({
    ...input,
    baselines: [{
      ...baseline,
      currentAggregateRef: 'sha256:9999999999999999999999999999999999999999999999999999999999999999'
    }]
  });
  assert.equal(unlinkedBaseline.ok, false);
  assert.equal(unlinkedBaseline.error.code, 'B002-COMPARABILITY');
  assert.equal(unlinkedBaseline.error.reason, 'baseline-current-aggregate-missing');

  const forgedDueReport = RLSESSION.buildMarketSessionEvidence({
    ...input,
    baselines: [baseline],
    reports: [],
    reactions: [],
    requiredEvidence: {
      ...input.requiredEvidence,
      dueReports: [{ required: true, reportId: 'report:missing:2026-06', state: 'upcoming' }]
    }
  });
  assert.equal(forgedDueReport.ok, false);
  assert.equal(forgedDueReport.error.code, 'B002-REPORT-REQUIRED');
  assert.equal(forgedDueReport.error.reason, 'required-report-evidence-missing');

  const lateConsensus = consensusArtifact(schedule.scheduledAt);
  lateConsensus.capturedAt = schedule.scheduledAt;
  const lateConsensusReport = unwrap(RLSESSION.normalizeReleasedReport(snapshot, schedule, lateConsensus, null, cutoffAt));
  assert.equal(lateConsensusReport.consensus.length, 0);
  assert.equal(lateConsensusReport.surprises.length, 0);
  assert.equal(lateConsensusReport.reasonCodes.includes('consensus-lock-invalid'), true);

  const mutatedConsensus = consensusArtifact(schedule.scheduledAt);
  mutatedConsensus.value = 0.35;
  const mutatedConsensusReport = unwrap(RLSESSION.normalizeReleasedReport(snapshot, schedule, mutatedConsensus, null, cutoffAt));
  assert.equal(mutatedConsensusReport.consensus.length, 0);
  assert.equal(mutatedConsensusReport.surprises.length, 0);
  assert.equal(mutatedConsensusReport.reasonCodes.includes('consensus-lock-invalid'), true);

  const changedSnapshot = structuredClone(snapshot);
  changedSnapshot.sourceRecords[0].metrics[0].value = 0.45;
  const revision = unwrap(RLSESSION.normalizeReleasedReport(changedSnapshot, schedule, consensusArtifact(schedule.scheduledAt), report, '2026-07-14T12:45:00.000Z'));
  assert.equal(revision.state, 'revised');
  assert.equal(revision.revisionNumber, 1);
  assert.equal(revision.supersedesEvidenceRef.fingerprint, report.semanticFingerprint);
  assert.notEqual(revision.revisionIdentity, report.revisionIdentity);

  const repeatedRevision = unwrap(RLSESSION.normalizeReleasedReport(changedSnapshot, schedule, consensusArtifact(schedule.scheduledAt), revision, '2026-07-14T12:50:00.000Z'));
  assert.equal(repeatedRevision.state, 'revised');
  assert.equal(repeatedRevision.revisionNumber, revision.revisionNumber);
  assert.equal(repeatedRevision.revisionIdentity, revision.revisionIdentity);
  assert.equal(repeatedRevision.supersedesEvidenceRef, null);

  const scheduleOnly = unwrap(RLSESSION.normalizeReleasedReport({ ...snapshot, sourceRecords: [] }, schedule, null, null, cutoffAt));
  assert.equal(scheduleOnly.state, 'unavailable');
  assert.deepEqual(scheduleOnly.actual, []);
});
