/*
 * event-market-reaction.functional.mjs — Feature 002, Scope 04 (Event Reaction
 * and Owner Integration) functional suite.
 *
 * Drives the concrete production pipeline `scripts/market-session-evidence.mjs::
 * acquireMarketSessionEvidence` over deterministic captured Yahoo session bytes
 * plus a released CPI report, and asserts the joined production reaction graph
 * preserves field-complete cutoff-safe ReactionSegment/v1 values, the segment's
 * exact non-zero comparison window, and linked later-cutoff / revision lineage
 * without rewriting earlier identities. The reaction join and segment contract
 * are the UNCHANGED Scope 01 primitives; Scope 04 owns only the call-site vertical.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { acquireMarketSessionEvidence } from '../scripts/market-session-evidence.mjs';
import { buildYahooChartResponse, encodeResponse, capturedTransport } from './fixtures/feature-002/market-session-evidence/session-fixture-builder.mjs';
import { buildReleasedReport } from './fixtures/feature-002/market-session-evidence/reaction-fixture-builder.mjs';

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

function acquire(overrides, transportBytes) {
    return acquireMarketSessionEvidence(marketConfig, Object.assign({
        calendar: committedCalendar,
        tradingDate: '2026-07-14',
        sessionKind: 'pre-market',
        symbol: 'SPY',
        providerSymbol: 'SPY',
        retrievedAt: '2026-07-14T12:39:00.000Z',
        clock: () => Date.parse('2026-07-14T12:39:00.000Z'),
        sleep: () => Promise.resolve(),
        transport: capturedTransport(transportBytes)
    }, overrides));
}

function sessionBytes(bucketCount) {
    return encodeResponse(buildYahooChartResponse({
        calendar: committedCalendar,
        tradingDate: '2026-07-14',
        sessionKind: 'pre-market',
        bucketCount,
        priorSessionCount: 20
    }));
}

test('SCN-002-020: production reaction graph preserves field-complete segments exact comparables and revision lineage', async () => {
    const cutoffAt = '2026-07-14T12:40:00.000Z';
    const report = buildReleasedReport({ cutoffAt });
    assert.equal(report.state, 'released');

    const result = await acquire({ cutoffAt, reactionReport: report }, sessionBytes(56));
    assert.equal(result.ok, true, result.reason);

    // The published bundle is a valid, pointer-ready market-session-evidence graph carrying
    // the report and reaction refs; re-validation is the whole-graph immutability proof.
    const revalidated = RLSESSION.validateMarketSessionEvidence(result.evidence, BUNDLE_POLICY);
    assert.equal(revalidated.ok, true, revalidated.error && `${revalidated.error.code}:${revalidated.error.reason}`);

    // The concrete pipeline produced exactly one field-complete cutoff-safe reaction segment.
    const reaction = result.reaction;
    assert.ok(reaction, 'pipeline must publish a reaction when a released report is supplied');
    assert.equal(reaction.contractVersion, 'event-market-reaction/v1');
    assert.equal(reaction.segments.length, 1);
    const segment = reaction.segments[0];
    assert.deepEqual(Object.keys(segment).sort(), REACTION_SEGMENT_FIELDS.slice().sort());

    // Exact non-zero comparison window (no bucket-zero remapping) and cutoff-safe membership:
    // the bar straddling the 12:30Z release is excluded and never becomes baseline or post bar.
    assert.equal(segment.startBucket, 55);
    assert.equal(segment.endBucketInclusive, 55);
    assert.equal(segment.comparisonWindow.startBucket, 55);
    assert.equal(segment.cutoffAt, cutoffAt);
    assert.equal(segment.state, 'partial');
    assert.equal(reaction.reasonCodes.includes('release-straddling-bar-excluded'), true);
    assert.equal(reaction.preReleaseBaseline.barEnd, '2026-07-14T12:30:00.000Z');

    // Exact segment comparables: the pipeline built the segment's comparable volume baseline
    // through the unchanged buildComparableVolumeBaseline signature and the segment's window.
    assert.equal(result.reactionBaselines.length, 1);
    assert.deepEqual(result.reactionBaselines[0].comparisonWindow, segment.comparisonWindow);
    assert.equal(result.reactionBaselines[0].currentAggregateRef, segment.semanticFingerprint);

    // Source / boundary mismatch fails loud: a report whose cutoff disagrees with the run
    // cutoff cannot be joined into a look-ahead-safe reaction.
    const mismatched = await acquire({ cutoffAt, reactionReport: buildReleasedReport({ cutoffAt: '2026-07-14T12:45:00.000Z' }) }, sessionBytes(56));
    assert.equal(mismatched.ok, false);
    assert.equal(mismatched.reason, 'reaction-report-cutoff-mismatch');

    // Later-cutoff revision lineage: a revised report at a later cutoff creates a NEW linked
    // parent reaction occurrence, while the earlier reaction recomputes byte-identical.
    const laterCutoff = '2026-07-14T12:45:00.000Z';
    const revisedReport = buildReleasedReport({ cutoffAt: laterCutoff, actualValue: 0.41, previousEvidence: report });
    assert.equal(revisedReport.state, 'revised');
    const laterResult = await acquire({ cutoffAt: laterCutoff, reactionReport: revisedReport }, sessionBytes(57));
    assert.equal(laterResult.ok, true, laterResult.reason);
    assert.notEqual(laterResult.reaction.reactionId, reaction.reactionId);
    assert.equal(laterResult.reaction.reportEvidenceRef.state, 'revised');

    const rerun = await acquire({ cutoffAt, reactionReport: report }, sessionBytes(56));
    assert.equal(rerun.reaction.reactionId, reaction.reactionId);
    assert.equal(rerun.reaction.semanticFingerprint, reaction.semanticFingerprint);
    assert.equal(JSON.stringify(rerun.reaction), JSON.stringify(reaction));
});
