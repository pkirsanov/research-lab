/*
 * reaction-fixture-builder.mjs — Feature 002, Scope 04 (Event Reaction and Owner
 * Integration) shared deterministic reaction fixtures.
 *
 * Mirrors the reaction test setup already proven by the Scope 01
 * `market-session-evidence.foundation.functional.mjs` suite so the Scope 04
 * unit / functional / e2e suites drive the SAME normalized inputs into the
 * unchanged Scope 01 `rlsession.js::joinEventMarketReaction` primitive and the
 * concrete `scripts/market-session-evidence.mjs::acquireMarketSessionEvidence`
 * call site. No live network is used; every input is a committed contract value.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../../../../rlcontracts.js');
const RLSESSION = require('../../../../rlsession.js');

const FIVE_MINUTES_MS = 300000;

export const CUTOFF_POLICY = Object.freeze({
    contractVersion: 'cutoff-policy/v1',
    interval: 'PT5M',
    boundaryPolicyVersion: 'xnys-session-boundaries/v1',
    requireNextOpenTradingDate: true
});

export const REACTION_POLICY = Object.freeze({
    contractVersion: 'reaction-policy/v1',
    interval: 'PT5M',
    strictPostRelease: true,
    segmentOrder: ['pre-market', 'regular', 'after-hours']
});

export const COMPARISON_POLICY = Object.freeze({
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

export function unwrap(result) {
    if (!result.ok) {
        throw new Error(result.error ? `${result.error.code}:${result.error.reason}` : 'fixture unwrap failed');
    }
    return result.value;
}

export function sourceAt(sourceId, retrievedAt, sourceKind = 'best-effort-public-chart') {
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

export function loadSession(calendar, tradingDate = '2026-07-14') {
    return unwrap(RLSESSION.loadCalendarSession(calendar, tradingDate, CUTOFF_POLICY));
}

/* Classify a bounded range of contiguous PT5M bars into Scope 01 SessionObservation/v1
   values, exactly as the foundation reaction suite does. barStart runs from startUtc
   through endStartUtc inclusive (bar end = start + PT5M). */
export function classifyRange(session, cutoffAt, source, startUtc, endStartUtc, barOverrides = {}) {
    const rows = [];
    for (let time = Date.parse(startUtc), end = Date.parse(endStartUtc); time <= end; time += FIVE_MINUTES_MS) {
        const bucket = (time - Date.parse(session.preMarket.startUtc)) / FIVE_MINUTES_MS;
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

export function consensusArtifact(scheduledAt, overrides = {}) {
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
        scheduledAt,
        ...overrides
    };
    artifact.fingerprint = RLCONTRACTS.semanticFingerprint('report-consensus-artifact', artifact);
    return artifact;
}

/* One comparable-session candidate over a bucket window, mirrored from the foundation
   reaction suite. Volume lands entirely in the last bucket so segment comparables are
   deterministic. */
export function candidate(index, value, signature, endBucket, startBucket = 0, overrides = {}) {
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

/* A 20-candidate set aligned to a segment's exact window, with two known ineligible members
   (one shifted start bucket, five wrong session kind) to exercise exact-window comparability. */
export function reactionCandidates(values, segment) {
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

/* Build one released (or revised) CPI ReleasedReportEvidence/v1 through the UNCHANGED
   Scope 01 normalizeReleasedReport primitive. Defaults reproduce the foundation golden
   (headline MoM SA, actual 0.40 vs prior 0.25). */
export function buildReleasedReport(options = {}) {
    const scheduledAt = options.scheduledAt || '2026-07-14T12:30:00.000Z';
    const cutoffAt = options.cutoffAt || '2026-07-14T12:40:00.000Z';
    const actualValue = options.actualValue === undefined ? 0.40 : options.actualValue;
    const previousValue = options.previousValue === undefined ? 0.25 : options.previousValue;
    const retrievedAt = options.retrievedAt || '2026-07-14T12:35:00.000Z';
    const schedule = {
        contractVersion: 'report-schedule/v1',
        reportId: 'report:test-cpi:2026-06',
        reportType: 'CPI',
        reportPeriod: '2026-06',
        scheduledAt,
        metricDefinitions: [{
            metricId: 'headline-mom-sa',
            unit: '%',
            seasonalBasis: 'seasonally-adjusted',
            transform: 'mom'
        }]
    };
    const reportSource = sourceAt('bls-public-api-v2', retrievedAt, 'official-report');
    if (options.reportSourcePublishedAt) reportSource.sourcePublishedAt = options.reportSourcePublishedAt;
    const snapshot = {
        contractVersion: 'report-source-snapshot/v1',
        reportId: schedule.reportId,
        reportPeriod: schedule.reportPeriod,
        sourceRecords: [{
            sourceRecordId: options.sourceRecordId || 'record:test-cpi:2026-06:1',
            sourceRef: reportSource,
            releasedAt: options.releasedAt || scheduledAt,
            metrics: [{
                metricId: 'headline-mom-sa',
                period: '2026-06',
                value: actualValue,
                unit: '%',
                seasonalBasis: 'seasonally-adjusted',
                transform: 'mom'
            }],
            previous: [{
                metricId: 'headline-mom-sa',
                period: '2026-05',
                value: previousValue,
                unit: '%',
                seasonalBasis: 'seasonally-adjusted',
                transform: 'mom'
            }]
        }]
    };
    const consensus = options.consensus === null ? null : consensusArtifact(scheduledAt);
    return unwrap(RLSESSION.normalizeReleasedReport(snapshot, schedule, consensus, options.previousEvidence || null, cutoffAt));
}

/* One complete reaction scenario: session, classified observations spanning the release,
   a released report, and the joined EventMarketReaction/v1 produced by the unchanged
   Scope 01 primitive. Golden window: pre-market 2026-07-14, release 12:30Z, cutoff 12:40Z,
   baseline bucket 53 (12:25-12:30Z), one post segment startBucket 55 (12:35-12:40Z). */
export function buildReactionScenario(calendar, overrides = {}) {
    const tradingDate = overrides.tradingDate || '2026-07-14';
    const cutoffAt = overrides.cutoffAt || '2026-07-14T12:40:00.000Z';
    const session = loadSession(calendar, tradingDate);
    const chartSource = sourceAt('yahoo-chart', overrides.retrievedAt || '2026-07-14T12:39:00.000Z');
    const observations = classifyRange(
        session,
        cutoffAt,
        chartSource,
        overrides.startUtc || '2026-07-14T08:00:00.000Z',
        overrides.endStartUtc || '2026-07-14T12:35:00.000Z',
        overrides.barOverrides || {}
    );
    const report = overrides.report || buildReleasedReport({ cutoffAt, ...(overrides.reportOptions || {}) });
    const reaction = unwrap(RLSESSION.joinEventMarketReaction(report, observations, cutoffAt, REACTION_POLICY));
    return { session, chartSource, observations, report, reaction, cutoffAt };
}
