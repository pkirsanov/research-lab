/*
 * released-report-evidence.e2e.mjs — Feature 002, Scope 03 (CPI Release
 * Evidence) scenario-specific persistent E2E regression suite.
 *
 * Each test drives the COMPLETE CPI vertical through the production entry point
 * `acquireReportEvidence` (schedule acquisition + BLS Public Data API v2 mapping
 * + deterministic pre-release consensus selection) over the captured
 * external-boundary fixtures, then re-validates the produced pointer-ready graph
 * through the UNCHANGED Scope 01 `rlsession.js::validateReleasedReportEvidence`
 * primitive. The Scope 03 adapter owns only the concrete BLS mapping and call
 * site; the lifecycle, dispute, revision, and cutoff rules are the Scope 01
 * foundation and are asserted here as a whole-graph regression.
 *
 * Golden values mirror design.md BS-002-022: June 2026 CPI scheduled
 * 2026-07-14T08:30 ET (12:30Z); CUSR0000SA0 Jun=320/May=319 -> MoM 100*(320/319-1);
 * CUUR0000SA0 Jun=323/prior-Jun=315 -> YoY 100*(323/315-1); consensus 0.30 MoM SA.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { acquireReportEvidence } from '../scripts/market-session-evidence.mjs';
import {
    buildBlsApiResponse,
    buildConsensusArtifact,
    capturedReportTransport,
    encodeJson
} from './fixtures/feature-002/market-session-evidence/report-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLSESSION = require('../rlsession.js');
const marketConfig = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));

const CPI_SCHEDULED_AT = '2026-07-14T12:30:00.000Z';
const RETRIEVED_AT = '2026-07-14T12:35:00.000Z';
const RELEASED_CUTOFF = '2026-07-14T12:45:00.000Z';

// Golden transformed CPI figures derived from the committed fixture index levels.
const MOM_JUNE = 100 * (320 / 319 - 1);
const YOY_JUNE = 100 * (323 / 315 - 1);
const MOM_MAY = 100 * (319 / 318 - 1);
const YOY_MAY = 100 * (322 / 314 - 1);
const CONSENSUS_MOM = 0.30;

function cpiOptions(overrides) {
    return Object.assign({
        report: 'cpi',
        reportPeriod: '2026-06',
        cutoffAt: RELEASED_CUTOFF,
        retrievedAt: RETRIEVED_AT
    }, overrides);
}

test('Regression: SCN-002-019 exposes upcoming then released CPI lineage without stale carry', async () => {
    const consensus = buildConsensusArtifact({ scheduledAt: CPI_SCHEDULED_AT });

    // A run whose cutoff falls before the official release keeps CPI upcoming:
    // a pointer-ready graph must NOT leak an actual, surprise, or release clock.
    const upcoming = await acquireReportEvidence(marketConfig, cpiOptions({
        cutoffAt: '2026-07-14T12:29:59.000Z',
        transport: capturedReportTransport(),
        consensusArtifacts: [consensus]
    }));
    assert.equal(upcoming.ok, true, upcoming.reason);
    assert.equal(upcoming.evidence.state, 'upcoming');
    assert.deepEqual(upcoming.evidence.actual, []);
    assert.deepEqual(upcoming.evidence.surprises, []);
    assert.deepEqual(upcoming.evidence.consensus, []);
    assert.equal(upcoming.evidence.releasedAt, null);
    assert.equal(upcoming.evidence.freshnessState, 'not-applicable');
    // The upcoming graph is itself a valid, committable released-report-evidence graph.
    assert.equal(RLSESSION.validateReleasedReportEvidence(upcoming.evidence).ok, true);

    // A later bounded run after the release proves released with EXACT BLS transforms
    // and preserves every field of the released official evidence graph.
    const released = await acquireReportEvidence(marketConfig, cpiOptions({
        transport: capturedReportTransport(),
        consensusArtifacts: [consensus]
    }));
    assert.equal(released.ok, true, released.reason);
    const graph = released.evidence;
    assert.equal(graph.contractVersion, 'released-report-evidence/v1');
    assert.equal(graph.state, 'released');
    assert.equal(graph.reportType, 'CPI');
    assert.equal(graph.reportPeriod, '2026-06');
    assert.equal(graph.scheduledAt, CPI_SCHEDULED_AT);
    assert.equal(graph.cutoffAt, RELEASED_CUTOFF);
    assert.equal(graph.releasedAt, CPI_SCHEDULED_AT);
    assert.equal(graph.freshnessState, 'current');

    // Re-validating the produced pointer-ready graph through the Scope 01 primitive
    // is the whole-graph proof that no field, hash, or cutoff invariant was violated.
    const revalidated = RLSESSION.validateReleasedReportEvidence(graph);
    assert.equal(revalidated.ok, true, revalidated.error && `${revalidated.error.code}:${revalidated.error.reason}`);

    // Actual carries both exact transformed metrics with their full unit/basis lineage.
    const mom = graph.actual.find((metric) => metric.metricId === 'headline-mom-sa');
    const yoy = graph.actual.find((metric) => metric.metricId === 'headline-yoy-nsa');
    assert.ok(Math.abs(mom.value - MOM_JUNE) < 1e-12);
    assert.ok(Math.abs(yoy.value - YOY_JUNE) < 1e-12);
    assert.equal(mom.unit, '%');
    assert.equal(mom.seasonalBasis, 'seasonally-adjusted');
    assert.equal(mom.transform, 'mom');
    assert.equal(yoy.seasonalBasis, 'not-seasonally-adjusted');
    assert.equal(yoy.transform, 'yoy');

    // Previous-period lineage is preserved for both transforms (real lineage, not stale carry).
    const prevMom = graph.previous.find((metric) => metric.metricId === 'headline-mom-sa');
    const prevYoy = graph.previous.find((metric) => metric.metricId === 'headline-yoy-nsa');
    assert.equal(prevMom.period, '2026-05');
    assert.equal(prevYoy.period, '2026-05');
    assert.ok(Math.abs(prevMom.value - MOM_MAY) < 1e-12);
    assert.ok(Math.abs(prevYoy.value - YOY_MAY) < 1e-12);

    // Only the MoM SA metric carries a signed percentage-point surprise vs the matching consensus.
    assert.equal(graph.consensus.length, 1);
    assert.equal(graph.surprises.length, 1);
    assert.equal(graph.surprises[0].metricId, 'headline-mom-sa');
    assert.equal(graph.surprises[0].unit, 'percentage-points');
    assert.ok(Math.abs(graph.surprises[0].value - (MOM_JUNE - CONSENSUS_MOM)) < 1e-12);

    // No stale carry: a post-release consensus (captured at the release, not strictly before)
    // is ineligible for selection and cannot fill the current surprise field; the released
    // actual/previous stay intact and the report is honestly consensus-unavailable.
    const lateConsensus = buildConsensusArtifact({ scheduledAt: CPI_SCHEDULED_AT, capturedAt: CPI_SCHEDULED_AT });
    const releasedLate = await acquireReportEvidence(marketConfig, cpiOptions({
        transport: capturedReportTransport(),
        consensusArtifacts: [lateConsensus]
    }));
    assert.equal(releasedLate.evidence.state, 'released');
    assert.deepEqual(releasedLate.evidence.surprises, []);
    assert.deepEqual(releasedLate.evidence.consensus, []);
    assert.equal(releasedLate.consensusReason, 'consensus-unavailable');
    assert.ok(releasedLate.evidence.reasonCodes.includes('consensus-unavailable'));
    assert.equal(releasedLate.evidence.actual.length, 2);
    assert.equal(RLSESSION.validateReleasedReportEvidence(releasedLate.evidence).ok, true);
});

test('Regression: SCN-002-023 provider disagreement blocks a single CPI surprise and owner claim', async () => {
    // Two accepted BLS source records disagree on the June SA level (320 vs 321).
    const conflicting = encodeJson(buildBlsApiResponse({ overrideValue: { series: 'CUSR0000SA0', period: '2026-06', value: 321.0 } }));
    const disputed = await acquireReportEvidence(marketConfig, cpiOptions({
        transport: capturedReportTransport({ apiResponses: [encodeJson(buildBlsApiResponse()), conflicting] }),
        additionalApiFetches: 1,
        consensusArtifacts: [buildConsensusArtifact({ scheduledAt: CPI_SCHEDULED_AT })]
    }));
    assert.equal(disputed.ok, true, disputed.reason);
    const graph = disputed.evidence;

    // The reconciled report is disputed: no resolved actual, no surprise, no dependent owner claim.
    assert.equal(graph.state, 'disputed');
    assert.deepEqual(graph.actual, []);
    assert.deepEqual(graph.surprises, []);
    assert.ok(graph.reasonCodes.includes('provider-disagreement'));

    // The disputed graph is still a valid, committable pointer-ready evidence graph.
    const revalidated = RLSESSION.validateReleasedReportEvidence(graph);
    assert.equal(revalidated.ok, true, revalidated.error && `${revalidated.error.code}:${revalidated.error.reason}`);

    // Every disagreeing source record is preserved verbatim with its own provenance clock
    // (no average, no silent winner, no user-side choose-winner control).
    assert.equal(graph.sourceRecords.length, 2);
    assert.equal(disputed.snapshot.sourceRecords.length, 2);
    const momValues = disputed.snapshot.sourceRecords
        .map((record) => record.metrics.find((metric) => metric.metricId === 'headline-mom-sa').value)
        .sort((left, right) => left - right);
    assert.notEqual(momValues[0], momValues[1]);
    assert.ok(Math.abs(momValues[0] - MOM_JUNE) < 1e-12);
    assert.ok(Math.abs(momValues[1] - 100 * (321 / 319 - 1)) < 1e-12);
    // The two records keep distinct identities; nothing is merged into one winner.
    assert.notEqual(graph.sourceRecords[0].sourceRecordId, graph.sourceRecords[1].sourceRecordId);
});

test('Regression: SCN-002-024 CPI revision appends while original release graph remains immutable', async () => {
    const consensus = buildConsensusArtifact({ scheduledAt: CPI_SCHEDULED_AT });
    const withConsensus = (overrides) => cpiOptions(Object.assign({ consensusArtifacts: [consensus] }, overrides));

    // The original released graph is revision 0.
    const original = await acquireReportEvidence(marketConfig, withConsensus({ transport: capturedReportTransport() }));
    assert.equal(original.ok, true, original.reason);
    assert.equal(original.evidence.state, 'released');
    assert.equal(original.evidence.revisionNumber, 0);
    assert.equal(original.evidence.supersedesEvidenceRef, null);
    const originalJson = JSON.stringify(original.evidence);
    const originalFingerprint = original.evidence.semanticFingerprint;
    assert.equal(RLSESSION.validateReleasedReportEvidence(original.evidence).ok, true);

    // A later accepted BLS snapshot changes the June SA level -> exactly one appended revision
    // whose identity supersedes the original by fingerprint, never rewriting the original.
    const revisedBytes = encodeJson(buildBlsApiResponse({ overrideValue: { series: 'CUSR0000SA0', period: '2026-06', value: 321.0 } }));
    const revision = await acquireReportEvidence(marketConfig, withConsensus({
        transport: capturedReportTransport({ apiBytes: revisedBytes }),
        cutoffAt: '2026-07-14T13:00:00.000Z',
        previousEvidence: original.evidence
    }));
    assert.equal(revision.ok, true, revision.reason);
    assert.equal(revision.evidence.state, 'revised');
    assert.equal(revision.evidence.revisionNumber, 1);
    assert.equal(revision.evidence.supersedesEvidenceRef.fingerprint, originalFingerprint);
    assert.notEqual(revision.evidence.revisionIdentity, original.evidence.revisionIdentity);
    assert.equal(RLSESSION.validateReleasedReportEvidence(revision.evidence).ok, true);

    // The original release evidence object remains byte-identical (immutable prior evidence).
    assert.equal(JSON.stringify(original.evidence), originalJson);
    assert.equal(original.evidence.semanticFingerprint, originalFingerprint);

    // An identical repeat snapshot creates no duplicate revision event (idempotent identity).
    const repeat = await acquireReportEvidence(marketConfig, withConsensus({
        transport: capturedReportTransport({ apiBytes: revisedBytes }),
        cutoffAt: '2026-07-14T13:05:00.000Z',
        previousEvidence: revision.evidence
    }));
    assert.equal(repeat.evidence.revisionNumber, revision.evidence.revisionNumber);
    assert.equal(repeat.evidence.revisionIdentity, revision.evidence.revisionIdentity);
    assert.equal(repeat.evidence.supersedesEvidenceRef, null);
});
