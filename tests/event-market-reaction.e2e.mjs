/*
 * event-market-reaction.e2e.mjs — Feature 002, Scope 04 (Event Reaction and Owner
 * Integration) scenario-specific persistent E2E regression suite.
 *
 * Drives the COMPLETE production evidence chain through both production entry
 * points: `acquireReportEvidence` (BLS CPI release, Scope 03) supplies the
 * released report that `acquireMarketSessionEvidence` (Scope 02 session vertical +
 * Scope 04 reaction call site) joins into one cutoff-safe MarketSessionEvidence/v1
 * bundle. The produced whole graph is then re-validated through the UNCHANGED
 * Scope 01 `rlsession.js::validateMarketSessionEvidence` primitive, proving the
 * immutable graph carries only field-complete cutoff-safe ReactionSegment/v1
 * values with no look-ahead, no bucket-zero remapping, and stable identities.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { acquireReportEvidence, acquireMarketSessionEvidence } from '../scripts/market-session-evidence.mjs';
import { buildConsensusArtifact, capturedReportTransport } from './fixtures/feature-002/market-session-evidence/report-fixture-builder.mjs';
import { buildYahooChartResponse, encodeResponse, capturedTransport } from './fixtures/feature-002/market-session-evidence/session-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLSESSION = require('../rlsession.js');
const marketConfig = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));
const committedCalendar = JSON.parse(readFileSync(new URL('../data/calendars/xnys/calendar.json', import.meta.url), 'utf8'));

const BUNDLE_POLICY = {
    contractVersion: 'market-session-evidence-policy/v1',
    evidenceRoot: 'briefs/objects/evidence',
    requiredCalendar: true,
    requiredBenchmarkSymbol: 'SPY',
    requiredDueReportStates: ['upcoming', 'released', 'revised']
};

const CPI_SCHEDULED_AT = '2026-07-14T12:30:00.000Z';
const CUTOFF = '2026-07-14T12:40:00.000Z';

const REACTION_SEGMENT_FIELDS = [
    'adapterVersion', 'adjustmentState', 'calendarFingerprint', 'comparisonBoundarySignature',
    'comparisonWindow', 'contractVersion', 'cumulativeObservedVolume', 'cutoffAt', 'endAt',
    'endBucketInclusive', 'expectedBucketCount', 'high', 'interval', 'latest', 'low',
    'missingBuckets', 'observationRefs', 'observationSemanticRefs', 'occurrenceFingerprint',
    'postReleaseWindow', 'preReleaseWindow', 'priceBarCount', 'priceBasis', 'providerSymbol',
    'reasonCodes', 'releaseIdentity', 'segmentId', 'segmentOrdinal', 'semanticFingerprint',
    'sessionEnd', 'sessionKind', 'sessionStart', 'sourceId', 'sourceRefs', 'startAt',
    'startBucket', 'state', 'symbol', 'tradingDate', 'volumeBarCount', 'volumeCompleteness'
];

test('Regression: SCN-002-020 publishes only field-complete cutoff-safe ReactionSegment v1 graphs', async () => {
    // Production report acquisition: the released CPI graph for the run cutoff.
    const consensus = buildConsensusArtifact({ scheduledAt: CPI_SCHEDULED_AT });
    const reportResult = await acquireReportEvidence(marketConfig, {
        report: 'cpi',
        reportPeriod: '2026-06',
        cutoffAt: CUTOFF,
        retrievedAt: '2026-07-14T12:35:00.000Z',
        transport: capturedReportTransport(),
        consensusArtifacts: [consensus]
    });
    assert.equal(reportResult.ok, true, reportResult.reason);
    assert.equal(reportResult.evidence.state, 'released');
    assert.equal(reportResult.evidence.cutoffAt, CUTOFF);

    // Production session + reaction composition over the SAME run cutoff.
    const sessionResponse = buildYahooChartResponse({ calendar: committedCalendar, tradingDate: '2026-07-14', sessionKind: 'pre-market', bucketCount: 56, priorSessionCount: 20 });
    const result = await acquireMarketSessionEvidence(marketConfig, {
        calendar: committedCalendar,
        cutoffAt: CUTOFF,
        tradingDate: '2026-07-14',
        sessionKind: 'pre-market',
        symbol: 'SPY',
        providerSymbol: 'SPY',
        retrievedAt: '2026-07-14T12:39:00.000Z',
        clock: () => Date.parse('2026-07-14T12:39:00.000Z'),
        sleep: () => Promise.resolve(),
        reactionReport: reportResult.evidence,
        transport: capturedTransport(encodeResponse(sessionResponse))
    });
    assert.equal(result.ok, true, result.reason);

    // Whole-graph immutability: the published bundle re-validates through the Scope 01 primitive.
    const bundle = result.evidence;
    assert.equal(bundle.contractVersion, 'market-session-evidence/v1');
    const revalidated = RLSESSION.validateMarketSessionEvidence(bundle, BUNDLE_POLICY);
    assert.equal(revalidated.ok, true, revalidated.error && `${revalidated.error.code}:${revalidated.error.reason}`);
    assert.equal(bundle.releasedReportRefs.length, 1);
    assert.equal(bundle.eventReactionRefs.length, 1);

    // Exactly one field-complete cutoff-safe ReactionSegment/v1 with the exact non-zero window.
    const reaction = result.reaction;
    assert.ok(reaction);
    assert.equal(RLSESSION.validateEventMarketReaction(reaction).ok, true);
    assert.equal(reaction.segments.length, 1);
    const segment = reaction.segments[0];
    assert.deepEqual(Object.keys(segment).sort(), REACTION_SEGMENT_FIELDS.slice().sort());
    assert.equal(segment.startBucket, 55);
    assert.equal(segment.comparisonWindow.startBucket, 55);
    assert.equal(segment.cutoffAt, CUTOFF);
    assert.equal(segment.priceBasis, 'provider-chart-basis');
    assert.equal(segment.adjustmentState, 'compatible');
    assert.equal(segment.sessionKind, 'pre-market');

    // No look-ahead: the bar straddling the 12:30Z release is excluded, the pre-release baseline
    // ends exactly at the release, and only strictly-post-release completed bars are published.
    assert.equal(reaction.reasonCodes.includes('release-straddling-bar-excluded'), true);
    assert.equal(reaction.preReleaseBaseline.barEnd, '2026-07-14T12:30:00.000Z');
    assert.deepEqual(reaction.observationRefs, segment.observationRefs);
    assert.equal(reaction.observationRefs.length, 1);

    // The reaction's parent report ref preserves the released source/cutoff/state provenance.
    assert.equal(reaction.reportEvidenceRef.state, 'released');
    assert.equal(reaction.reportEvidenceRef.cutoffAt, CUTOFF);

    // Immutable recompute: the same production inputs reproduce byte-identical reaction identities.
    const rerunResponse = buildYahooChartResponse({ calendar: committedCalendar, tradingDate: '2026-07-14', sessionKind: 'pre-market', bucketCount: 56, priorSessionCount: 20 });
    const rerun = await acquireMarketSessionEvidence(marketConfig, {
        calendar: committedCalendar,
        cutoffAt: CUTOFF,
        tradingDate: '2026-07-14',
        sessionKind: 'pre-market',
        symbol: 'SPY',
        providerSymbol: 'SPY',
        retrievedAt: '2026-07-14T12:39:00.000Z',
        clock: () => Date.parse('2026-07-14T12:39:00.000Z'),
        sleep: () => Promise.resolve(),
        reactionReport: reportResult.evidence,
        transport: capturedTransport(encodeResponse(rerunResponse))
    });
    assert.equal(rerun.reaction.reactionId, reaction.reactionId);
    assert.equal(JSON.stringify(rerun.reaction), JSON.stringify(reaction));
});
