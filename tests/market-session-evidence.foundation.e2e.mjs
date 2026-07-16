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

function chartSource(retrievedAt) {
  return {
    contractVersion: 'source-provenance/v1',
    sourceId: 'yahoo-chart',
    adapterId: 'yahoo-chart-session',
    adapterVersion: 'yahoo-chart-session-adapter/v1',
    sourceKind: 'best-effort-public-chart',
    sourceUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/SPY',
    requestDescriptor: { method: 'GET', path: '/v8/finance/chart/SPY', query: { interval: '5m', includePrePost: 'true', range: '1mo' } },
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

function bar(start, close = 100, volume = 10) {
  return {
    contractVersion: 'session-source-bar/v1',
    symbol: 'SPY',
    providerSymbol: 'SPY',
    interval: 'PT5M',
    barStart: start,
    open: close - 0.25,
    high: close + 0.5,
    low: close - 0.5,
    close,
    volume,
    priceBasis: 'provider-chart-basis',
    adjustmentState: 'compatible',
    corporateActionRefs: []
  };
}

function officialCloseAnchor(sourceRef) {
  return {
    contractVersion: 'official-regular-close-anchor/v1',
    tradingDate: '2026-07-13',
    close: 99,
    at: '2026-07-13T20:00:00.000Z',
    priceBasis: 'provider-chart-basis',
    adjustmentState: 'compatible',
    sourceRef
  };
}

function minimalBundleInput(session, aggregates, baselines = []) {
  const state = aggregates.some((aggregate) => aggregate.state === 'disputed') ? 'disputed' : 'partial';
  const cutoffAt = aggregates.length > 0 ? aggregates[0].cutoffAt : '2026-07-14T14:00:00.000Z';
  return {
    contractVersion: 'market-session-evidence-input/v1',
    runId: 'run-feature-002-foundation-e2e',
    cutoffAt,
    calendarSession: session,
    aggregates,
    baselines,
    reports: [],
    reactions: [],
    closedDateProof: null,
    requiredEvidence: {
      calendar: { required: true, state: 'available' },
      benchmark: { required: true, symbol: 'SPY', state, officialCloseAnchorState: 'available' },
      dueReports: []
    },
    policy: bundlePolicy
  };
}

test('Regression: SCN-002-016 freezes opening-boundary observations once across the production evidence graph', () => {
  const session = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-14', cutoffPolicy));
  const source = chartSource('2026-07-14T13:59:00.000Z');
  const cutoffAt = '2026-07-14T14:00:00.000Z';
  const observations = [
    unwrap(RLSESSION.classifySessionObservation(bar('2026-07-14T13:25:00.000Z', 100), session, cutoffAt, source)),
    unwrap(RLSESSION.classifySessionObservation(bar('2026-07-14T13:30:00.000Z', 101), session, cutoffAt, source))
  ];
  const anchor = officialCloseAnchor(RLCONTRACTS.semanticFingerprint('source-provenance', source));
  const pre = unwrap(RLSESSION.aggregateSession(observations, session, 'pre-market', cutoffAt, anchor));
  const regular = unwrap(RLSESSION.aggregateSession(observations, session, 'regular', cutoffAt, anchor));
  const graph = unwrap(RLSESSION.buildMarketSessionEvidence(minimalBundleInput(session, [pre, regular])));

  const frozenMembership = pre.observationRefs.concat(regular.observationRefs);
  assert.equal(frozenMembership.length, 2);
  assert.equal(new Set(frozenMembership).size, 2);
  assert.deepEqual([pre.observationRefs[0], regular.observationRefs[0]], observations.map((observation) => observation.observationId));
  assert.equal(graph.sessionAggregateRefs.length, 2);
  assert.equal(graph.cutoffAt, cutoffAt);
});

test('Regression: SCN-002-018 publishes only exact-bucket qualified volume context', () => {
  const session = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-14', cutoffPolicy));
  const signature = session.sessionBoundarySignatures['pre-market'];
  const cutoffAt = '2026-07-14T12:00:00.000Z';
  const source = chartSource('2026-07-14T11:59:00.000Z');
  const observations = Array.from({ length: 48 }, (_, bucketIndex) => unwrap(RLSESSION.classifySessionObservation(
    bar(new Date(Date.parse(session.preMarket.startUtc) + bucketIndex * 300000).toISOString(), 100 + bucketIndex / 100, bucketIndex === 47 ? 300 : 0),
    session,
    cutoffAt,
    source
  )));
  const current = unwrap(RLSESSION.aggregateSession(
    observations,
    session,
    'pre-market',
    cutoffAt,
    officialCloseAnchor(RLCONTRACTS.occurrenceFingerprint('source-provenance', source))
  ));
  assert.equal(current.latestCompletedBucket, 47);
  assert.equal(current.cumulativeObservedVolume, 300);
  assert.equal(current.volumeCompleteness, 'complete');
  const values = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230];
  const candidates = values.map((value, index) => ({
    contractVersion: 'comparable-session-candidate/v1',
    candidateId: RLCONTRACTS.fingerprint('candidate', { contractVersion: 'comparable-session-candidate-test-identity/v1', index, value }),
    tradingDate: `2026-06-${String(index + 1).padStart(2, '0')}`,
    symbol: 'SPY',
    sessionKind: 'pre-market',
    comparisonBoundarySignature: signature,
    interval: 'PT5M',
    sourceId: 'yahoo-chart',
    adapterVersion: 'yahoo-chart-session-adapter/v1',
    priceBasis: 'provider-chart-basis',
    adjustmentState: 'compatible',
    startBucket: 0,
    endBucketInclusive: 47,
    bucketVolumes: Array.from({ length: 48 }, (_, bucketIndex) => ({ bucketIndex, volume: bucketIndex === 47 ? value : 0, volumeState: bucketIndex === 47 ? 'observed' : 'observed-zero' })),
    sourceRef: 'sha256:2222222222222222222222222222222222222222222222222222222222222222'
  }));
  while (candidates.length < 20) candidates.push({ ...candidates[0], candidateId: RLCONTRACTS.fingerprint('excluded', { contractVersion: 'comparable-session-exclusion-test-identity/v1', index: candidates.length }), tradingDate: `2026-06-${String(candidates.length + 1).padStart(2, '0')}`, sessionKind: 'regular' });

  const baseline = unwrap(RLSESSION.buildComparableVolumeBaseline(current, candidates, comparisonPolicy));
  const graph = unwrap(RLSESSION.buildMarketSessionEvidence(minimalBundleInput(session, [current], [baseline])));
  assert.equal(baseline.state, 'qualified');
  assert.equal(baseline.unusualness, 'high');
  assert.deepEqual(baseline.comparisonWindow, { contractVersion: 'comparison-window/v1', sessionKind: 'pre-market', startBucket: 0, endBucketInclusive: 47 });
  assert.equal(graph.volumeBaselineRefs.length, 1);
  assert.equal(graph.volumeBaselineRefs[0].fingerprint, baseline.semanticFingerprint);
});

test('Regression: SCN-002-021 validates a whole-graph closed-date bundle and refuses invalid closure proof', () => {
  const holiday = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-03', cutoffPolicy));
  const priorOpen = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-02', cutoffPolicy));
  const nextOpen = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-06', cutoffPolicy));
  const earlyClose = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-11-27', cutoffPolicy));
  const spring = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-03-09', cutoffPolicy));
  const fall = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-11-02', cutoffPolicy));
  const priorOfficialCloseAnchor = {
    contractVersion: 'official-regular-close-anchor/v1',
    tradingDate: priorOpen.tradingDate,
    close: 99,
    at: priorOpen.officialRegularCloseAt,
    priceBasis: 'provider-chart-basis',
    adjustmentState: 'compatible',
    sourceRef: RLCONTRACTS.occurrenceFingerprint('source-provenance', chartSource('2026-07-03T15:55:00.000Z'))
  };
  const closedInput = {
    contractVersion: 'market-session-evidence-input/v1',
    runId: 'run-feature-002-closed-date-e2e',
    cutoffAt: '2026-07-03T16:00:00.000Z',
    calendarSession: holiday,
    aggregates: [],
    baselines: [],
    reports: [],
    reactions: [],
    closedDateProof: null,
    requiredEvidence: {
      calendar: { required: true, state: 'available' },
      benchmark: {
        required: false,
        presence: 'not-applicable',
        symbol: 'SPY',
        state: 'not-applicable',
        aggregateRef: null,
        officialCloseAnchorState: 'not-applicable',
        baselineRef: null,
        reasonCodes: ['calendar-closed']
      },
      dueReports: []
    },
    closedDateProof: { nextOpenCalendarSession: nextOpen, priorOfficialCloseAnchor },
    policy: bundlePolicy
  };
  const graph = unwrap(RLSESSION.buildMarketSessionEvidence(closedInput));

  assert.deepEqual([holiday.dateState, holiday.nextOpenTradingDate, holiday.regular], ['holiday', '2026-07-06', null]);
  assert.equal(earlyClose.regular.endUtc, earlyClose.afterHours.startUtc);
  assert.equal(earlyClose.regular.endUtc, '2026-11-27T18:00:00.000Z');
  assert.equal(spring.regular.startLocal.slice(11, 16), fall.regular.startLocal.slice(11, 16));
  assert.notEqual(spring.regular.startUtc, fall.regular.startUtc);
  assert.equal(spring.sessionBoundarySignatures.regular, fall.sessionBoundarySignatures.regular);
  assert.notEqual(earlyClose.sessionBoundarySignatures.regular, spring.sessionBoundarySignatures.regular);
  assert.equal(graph.state, 'available');
  assert.deepEqual(graph.sessionAggregateRefs, []);
  assert.deepEqual(graph.volumeBaselineRefs, []);
  assert.deepEqual(Object.keys(graph.requiredEvidence).sort(), [
    'benchmark', 'calendar', 'closedDate', 'contractVersion', 'dueReports', 'mode'
  ]);
  assert.equal(graph.requiredEvidence.contractVersion, 'required-evidence/v1');
  assert.equal(graph.requiredEvidence.mode, 'closed-date');
  assert.deepEqual(graph.requiredEvidence.calendar, {
    required: true,
    state: 'available',
    tradingDate: '2026-07-03',
    dateState: 'holiday',
    calendarSessionRef: graph.calendarSessionRef
  });
  assert.deepEqual(graph.requiredEvidence.benchmark, closedInput.requiredEvidence.benchmark);
  assert.equal(graph.requiredEvidence.closedDate.required, true);
  assert.equal(graph.requiredEvidence.closedDate.state, 'available');
  assert.equal(graph.requiredEvidence.closedDate.closureCalendarSessionRef, graph.calendarSessionRef);
  assert.deepEqual(graph.requiredEvidence.closedDate.priorOfficialCloseAnchor, priorOfficialCloseAnchor);
  assert.equal(graph.requiredEvidence.closedDate.nextOpenCalendarSessionRef.fingerprint, nextOpen.semanticFingerprint);
  assert.equal(graph.requiredEvidence.closedDate.nextOpenTradingDate, '2026-07-06');
  assert.equal(graph.requiredEvidence.closedDate.liveAggregatePresence, 'not-applicable');
  assert.equal(graph.requiredEvidence.closedDate.liveBaselinePresence, 'not-applicable');
  assert.deepEqual(graph.requiredEvidence.closedDate.reasonCodes, ['calendar-closed']);
  assert.deepEqual(Object.keys(graph.requiredEvidence.closedDate).sort(), [
    'closureCalendarSessionRef', 'liveAggregatePresence', 'liveBaselinePresence',
    'nextOpenCalendarSessionRef', 'nextOpenTradingDate', 'priorOfficialCloseAnchor',
    'reasonCodes', 'required', 'state'
  ]);
  assert.deepEqual(Object.keys(graph.requiredEvidence.benchmark).sort(), [
    'aggregateRef', 'baselineRef', 'officialCloseAnchorState', 'presence', 'reasonCodes',
    'required', 'state', 'symbol'
  ]);
  assert.deepEqual(graph.reasonCodes, ['calendar-closed']);
  assert.equal(graph.sourceRefs.includes(priorOfficialCloseAnchor.sourceRef), true);
  assert.equal(graph.sourceRefs.includes(holiday.sourceRef), true);
  assert.equal(RLSESSION.validateMarketSessionEvidence(graph, bundlePolicy).ok, true);

  const uncovered = RLSESSION.loadCalendarSession(calendar, '2026-07-07', cutoffPolicy);
  assert.equal(uncovered.ok, false);
  assert.equal(uncovered.error.code, 'B002-CALENDAR');
  assert.equal(uncovered.error.reason, 'trading-date-not-covered');

  const invalidProofs = [
    { label: 'missing proof', input: { ...closedInput, closedDateProof: null } },
    {
      label: 'missing next-open proof',
      input: { ...closedInput, closedDateProof: { priorOfficialCloseAnchor } }
    },
    {
      label: 'unknown proof field',
      input: { ...closedInput, closedDateProof: { ...closedInput.closedDateProof, inferredClosure: true } }
    },
    {
      label: 'invalid typed absence',
      input: {
        ...closedInput,
        requiredEvidence: {
          ...closedInput.requiredEvidence,
          benchmark: { ...closedInput.requiredEvidence.benchmark, presence: 'missing' }
        }
      }
    },
    {
      label: 'forged next-open identity',
      input: {
        ...closedInput,
        closedDateProof: {
          ...closedInput.closedDateProof,
          nextOpenCalendarSession: {
            ...nextOpen,
            semanticFingerprint: 'sha256:8888888888888888888888888888888888888888888888888888888888888888'
          }
        }
      }
    },
    {
      label: 'forged next-open version',
      input: {
        ...closedInput,
        closedDateProof: {
          ...closedInput.closedDateProof,
          nextOpenCalendarSession: { ...nextOpen, calendarVersion: `${nextOpen.calendarVersion}:forged` }
        }
      }
    },
    {
      label: 'forged next-open source',
      input: {
        ...closedInput,
        closedDateProof: {
          ...closedInput.closedDateProof,
          nextOpenCalendarSession: {
            ...nextOpen,
            sourceRef: 'sha256:9999999999999999999999999999999999999999999999999999999999999999'
          }
        }
      }
    },
    {
      label: 'wrong next-open date',
      input: {
        ...closedInput,
        closedDateProof: {
          ...closedInput.closedDateProof,
          nextOpenCalendarSession: { ...nextOpen, tradingDate: '2026-07-07' }
        }
      }
    },
    {
      label: 'forged prior close',
      input: {
        ...closedInput,
        closedDateProof: {
          ...closedInput.closedDateProof,
          priorOfficialCloseAnchor: { ...priorOfficialCloseAnchor, at: '2026-07-02T19:55:00.000Z' }
        }
      }
    }
  ];
  for (const invalid of invalidProofs) {
    const result = RLSESSION.buildMarketSessionEvidence(invalid.input);
    assert.equal(result.ok, false, invalid.label);
    assert.equal(['B002-CALENDAR', 'B002-INPUT-REJECTED'].includes(result.error.code), true, invalid.label);
    assert.equal(Object.hasOwn(result, 'value'), false, invalid.label);
  }

  const liveRefGraph = structuredClone(graph);
  liveRefGraph.sessionAggregateRefs.push(graph.requiredEvidence.closedDate.nextOpenCalendarSessionRef);
  const liveRefValidation = RLSESSION.validateMarketSessionEvidence(liveRefGraph, bundlePolicy);
  assert.equal(liveRefValidation.ok, false);
  assert.equal(liveRefValidation.error.reason, 'closed-date-required-evidence-invalid');

  const forgedAbsenceGraph = structuredClone(graph);
  forgedAbsenceGraph.requiredEvidence.benchmark.presence = 'missing';
  const forgedAbsenceValidation = RLSESSION.validateMarketSessionEvidence(forgedAbsenceGraph, bundlePolicy);
  assert.equal(forgedAbsenceValidation.ok, false);
  assert.equal(forgedAbsenceValidation.error.reason, 'closed-date-required-evidence-invalid');
});

test('Regression: SCN-002-022 invalid temporal evidence cannot produce a current graph', () => {
  const session = unwrap(RLSESSION.loadCalendarSession(calendar, '2026-07-14', cutoffPolicy));
  const source = chartSource('2026-07-14T13:59:00.000Z');
  const invalid = RLSESSION.classifySessionObservation(bar('2026-07-14T13:58:00.000Z'), session, '2026-07-14T14:00:00.000Z', source);
  assert.equal(invalid.ok, false);
  assert.equal(invalid.error.code, 'B002-TIMESTAMP');
  assert.equal(invalid.error.reason, 'bar-after-cutoff');
  assert.equal(Object.hasOwn(invalid, 'value'), false);

  const graph = RLSESSION.buildMarketSessionEvidence({
    contractVersion: 'market-session-evidence-input/v1',
    runId: 'run-feature-002-invalid-e2e',
    cutoffAt: '2026-07-14T14:00:00.000Z',
    calendarSession: session,
    aggregates: [],
    baselines: [],
    reports: [],
    reactions: [],
    closedDateProof: null,
    requiredEvidence: {
      calendar: { required: true, state: 'available' },
      benchmark: { required: true, symbol: 'SPY', state: 'unavailable', officialCloseAnchorState: 'unavailable' },
      dueReports: []
    },
    policy: bundlePolicy
  });
  assert.equal(graph.ok, false);
  assert.equal(graph.error.code, 'B002-SESSION-REQUIRED');
  assert.equal(graph.error.reason, 'required-benchmark-unavailable');
  assert.equal(Object.hasOwn(graph, 'value'), false);
  assert.equal(graph.currentPointerCandidate, undefined);

  const forgedBenchmark = RLSESSION.buildMarketSessionEvidence({
    contractVersion: 'market-session-evidence-input/v1',
    runId: 'run-feature-002-forged-benchmark-e2e',
    cutoffAt: '2026-07-14T14:00:00.000Z',
    calendarSession: session,
    aggregates: [],
    baselines: [],
    reports: [],
    reactions: [],
    closedDateProof: null,
    requiredEvidence: {
      calendar: { required: true, state: 'available' },
      benchmark: { required: true, symbol: 'SPY', state: 'partial', officialCloseAnchorState: 'available' },
      dueReports: []
    },
    policy: bundlePolicy
  });
  assert.equal(forgedBenchmark.ok, false);
  assert.equal(forgedBenchmark.error.code, 'B002-SESSION-REQUIRED');
  assert.equal(forgedBenchmark.error.reason, 'required-benchmark-aggregate-missing');
  assert.equal(Object.hasOwn(forgedBenchmark, 'value'), false);
});
