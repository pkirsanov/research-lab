/*
 * distributed-briefs-owner-reads.e2e.mjs — Feature 002, Scope 04 (Event Reaction
 * and Owner Integration) scenario-specific persistent E2E regression suite.
 *
 * Builds ONE real production MarketSessionEvidence/v1 bundle (report + reaction)
 * through both production entry points, freezes the owning-read consumers via
 * `scripts/brief-refresh.mjs::freezeToolReads`, and proves the whole owner graph
 * makes shared evidence FINAL-ELIGIBLE only after an owning read publishes a
 * permitted interpretation. Shared Yahoo/BLS provenance, tactical context reads,
 * non-owner sources, and a forged final author can never turn raw evidence into a
 * confirmation or an action. Validation is the UNCHANGED production
 * `rldata.js::validateToolModelRead` owner-only contract.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { acquireReportEvidence, acquireMarketSessionEvidence } from '../scripts/market-session-evidence.mjs';
import { freezeToolReads } from '../scripts/brief-refresh.mjs';
import '../rldata.js';
import { buildConsensusArtifact, capturedReportTransport } from './fixtures/feature-002/market-session-evidence/report-fixture-builder.mjs';
import { buildYahooChartResponse, encodeResponse, capturedTransport } from './fixtures/feature-002/market-session-evidence/session-fixture-builder.mjs';

const RLDATA = globalThis.RLDATA;
const marketConfig = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));
const committedCalendar = JSON.parse(readFileSync(new URL('../data/calendars/xnys/calendar.json', import.meta.url), 'utf8'));
const CUTOFF = '2026-07-14T12:40:00.000Z';

// The final author's eligibility rule: shared evidence is final-eligible ONLY when a VALID owning
// read has published a supporting/contradicting interpretation that permits an owner action.
// Context-only, not-applicable, not-integrated, or invalid reads contribute NOTHING.
function finalEligibleEvidenceRefs(reads) {
    const eligible = new Set();
    for (const read of reads) {
        if (!RLDATA.validateToolModelRead(read).ok) continue;
        if (!read.recommendationEligibility || read.recommendationEligibility.eligible !== true) continue;
        for (const interpretation of (read.evidenceInterpretations || [])) {
            if (interpretation.actionEligibilityEffect !== 'permits-owner-action') continue;
            if (interpretation.kind !== 'supporting' && interpretation.kind !== 'contradicting') continue;
            for (const fingerprint of interpretation.evidenceRefs) eligible.add(fingerprint);
        }
    }
    return eligible;
}

async function buildOwnerGraph() {
    const reportResult = await acquireReportEvidence(marketConfig, {
        report: 'cpi',
        reportPeriod: '2026-06',
        cutoffAt: CUTOFF,
        retrievedAt: '2026-07-14T12:35:00.000Z',
        transport: capturedReportTransport(),
        consensusArtifacts: [buildConsensusArtifact({ scheduledAt: '2026-07-14T12:30:00.000Z' })]
    });
    assert.equal(reportResult.ok, true, reportResult.reason);
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
    const evidence = result.evidence;
    const frozen = freezeToolReads(evidence, { symbol: 'SPY' }, [
        { toolId: 'options-flow-lab', profile: 'live-market' },
        { toolId: 'waterfront-polo-lab', profile: 'off-theme' }
    ]);
    return { evidence, frozen };
}

const { evidence, frozen } = await buildOwnerGraph();

test('Regression: SCN-002-026 final-eligible evidence exists only after an owning read publishes its interpretation', () => {
    const reportFingerprint = evidence.releasedReportRefs[0].fingerprint;
    const reactionFingerprint = evidence.eventReactionRefs[0].fingerprint;
    const aggregateFingerprint = evidence.sessionAggregateRefs[0].fingerprint;

    // Shared evidence ALONE (no owning read) is never final-eligible: with zero owner reads there is
    // no permitted interpretation, so raw Yahoo/BLS provenance supports no recommendation.
    assert.equal(finalEligibleEvidenceRefs([]).size, 0);

    // After the owning reads freeze, ONLY the Bond Regime owner's published supporting interpretation
    // makes its consumed CPI report + reaction refs final-eligible.
    const ownerReads = Object.values(frozen.owners);
    const eligible = finalEligibleEvidenceRefs(ownerReads);
    assert.equal(eligible.has(reportFingerprint), true);
    assert.equal(eligible.has(reactionFingerprint), true);

    // Tactical context (session-aggregate) evidence consumed by Sector/ETF/Global/Intraday is NOT
    // final-eligible: a context-only interpretation can never inflate into a confirmation or action.
    assert.equal(eligible.has(aggregateFingerprint), false);

    // Exactly one owning read (Bond Regime) is eligible; the shared report ref is counted once, never
    // inflated across the multiple owners that reference the same shared provenance.
    const eligibleReads = ownerReads.filter((read) => read.recommendationEligibility.eligible === true);
    assert.equal(eligibleReads.length, 1);
    assert.equal(eligibleReads[0].toolId, 'bond-regime-lab');
    assert.equal(eligible.size, 2);

    // Profile boundaries hold: non-owner sources are explicit applicability with no interpretation,
    // so they contribute no final-eligible evidence.
    const otherReads = Object.values(frozen.others);
    assert.equal(finalEligibleEvidenceRefs(otherReads).size, 0);
    for (const read of otherReads) {
        assert.equal(RLDATA.validateToolModelRead(read).ok, true);
        assert.equal(read.evidenceInterpretations.length, 0);
        assert.equal(['not-integrated', 'not-applicable'].includes(read.evidenceApplicability.status), true);
    }

    // A final author cannot manufacture eligibility: forging the Bond Regime read as a final
    // aggregator that keeps the supporting interpretation is rejected by the owner-only validator,
    // so it can never become final-eligible.
    const forgedFinal = JSON.parse(JSON.stringify(frozen.owners['bond-regime-lab']));
    forgedFinal.role = 'final-aggregator';
    forgedFinal.profile = 'final-aggregator';
    assert.equal(RLDATA.validateToolModelRead(forgedFinal).reason, 'final-author-cannot-interpret');
    assert.equal(finalEligibleEvidenceRefs([forgedFinal]).size, 0);
});
