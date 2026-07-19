/*
 * distributed-briefs-owner-reads.integration.mjs — Feature 002, Scope 04 (Event
 * Reaction and Owner Integration) integration suite.
 *
 * Builds ONE real production MarketSessionEvidence/v1 bundle through both
 * production entry points (`acquireReportEvidence` + `acquireMarketSessionEvidence`)
 * and freezes the six declared owning-read consumers over it via the production
 * `scripts/brief-refresh.mjs::freezeToolReads`. It asserts every owner consumes
 * typed evidence refs that actually exist in the frozen bundle, carries an owner-
 * produced interpretation with matching adapter/model provenance validated by
 * `rldata.js::validateToolModelRead`, and that the shared layer never recomputes an
 * owner formula. No owner/model output is mocked; the owner adapters are executed.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { acquireReportEvidence, acquireMarketSessionEvidence } from '../scripts/market-session-evidence.mjs';
import { freezeToolReads, OWNER_EVIDENCE_DECLARATIONS } from '../scripts/brief-refresh.mjs';
import '../rldata.js';
import { buildConsensusArtifact, capturedReportTransport } from './fixtures/feature-002/market-session-evidence/report-fixture-builder.mjs';
import { buildYahooChartResponse, encodeResponse, capturedTransport } from './fixtures/feature-002/market-session-evidence/session-fixture-builder.mjs';

const RLDATA = globalThis.RLDATA;
const marketConfig = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));
const committedCalendar = JSON.parse(readFileSync(new URL('../data/calendars/xnys/calendar.json', import.meta.url), 'utf8'));
const CUTOFF = '2026-07-14T12:40:00.000Z';

// Owner-formula field names that must NEVER appear on a shared owner read (proves the shared
// layer publishes an interpretation without recomputing RRG/FX/asset/bond/momentum/tape models).
const OWNER_FORMULA_FIELDS = ['rsRatio', 'rsMom', 'quad', 'accel', 'rrgState', 'rotation', 'score', 'signal', 'sharpe', 'annVol', 'trend', 'fx', 'ranked', 'leader'];

async function buildFrozenOwnerReads() {
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

const { evidence, frozen } = await buildFrozenOwnerReads();
const bundleFingerprints = new Set([
    evidence.fingerprint,
    ...evidence.sessionAggregateRefs.map((ref) => ref.fingerprint),
    ...evidence.volumeBaselineRefs.map((ref) => ref.fingerprint),
    ...evidence.releasedReportRefs.map((ref) => ref.fingerprint),
    ...evidence.eventReactionRefs.map((ref) => ref.fingerprint)
]);

test('six declared owners consume typed evidence refs through production model reads', () => {
    // The six declared owning-read consumers are exactly the design set.
    assert.deepEqual(
        OWNER_EVIDENCE_DECLARATIONS.map((declaration) => declaration.toolId).sort(),
        ['bond-regime-lab', 'etf-momentum-lab', 'global-rotation-lab', 'intraday-tape-lab', 'real-assets-lab', 'sector-research-lab']
    );
    assert.equal(Object.keys(frozen.owners).length, 6);

    for (const declaration of OWNER_EVIDENCE_DECLARATIONS) {
        const read = frozen.owners[declaration.toolId];
        // Every owner read validates as a ToolModelRead/v1 and preserves its owner model identity.
        const validation = RLDATA.validateToolModelRead(read);
        assert.equal(validation.ok, true, `${declaration.toolId}: ${validation.reason}`);
        assert.equal(read.contractVersion, 'tool-model-read/v1');
        assert.equal(read.role, 'source');
        assert.equal(read.adapter.adapterId, declaration.adapterId);
        assert.equal(read.adapter.owningModelVersion, declaration.owningModelVersion);
        assert.equal(read.evidenceCutoff, CUTOFF);

        // Exactly one owner-produced interpretation whose provenance is this owner's adapter/model.
        assert.equal(read.evidenceInterpretations.length, 1);
        const interpretation = read.evidenceInterpretations[0];
        assert.equal(interpretation.ownerAdapterId, declaration.adapterId);
        assert.equal(interpretation.ownerModelVersion, declaration.owningModelVersion);
        // Every typed evidence ref it consumes actually exists in the frozen bundle.
        for (const fingerprint of interpretation.evidenceRefs) assert.equal(bundleFingerprints.has(fingerprint), true, `${declaration.toolId} ref not in bundle`);
        for (const ref of read.evidenceRefs) assert.equal(bundleFingerprints.has(ref.fingerprint), true);

        // The shared layer never recomputes an owner formula (no owner-model output fields leak in).
        for (const field of OWNER_FORMULA_FIELDS) assert.equal(Object.prototype.hasOwnProperty.call(read, field), false, `${declaration.toolId} leaked owner formula field ${field}`);
    }

    // Bond Regime is the ONE owner whose CPI report + reaction inputs permit an owner action.
    const bond = frozen.owners['bond-regime-lab'];
    assert.equal(bond.evidenceInterpretations[0].kind, 'supporting');
    assert.equal(bond.evidenceInterpretations[0].actionEligibilityEffect, 'permits-owner-action');
    assert.equal(bond.recommendationEligibility.eligible, true);
    const bondRefTypes = bond.evidenceRefs.map((ref) => ref.evidenceType).sort();
    assert.deepEqual(bondRefTypes, ['event-market-reaction', 'released-report-evidence']);

    // The four session-context owners treat session evidence as tactical context only.
    for (const toolId of ['intraday-tape-lab', 'sector-research-lab', 'etf-momentum-lab', 'global-rotation-lab']) {
        const read = frozen.owners[toolId];
        assert.equal(read.evidenceInterpretations[0].kind, 'context');
        assert.equal(read.evidenceInterpretations[0].actionEligibilityEffect, 'context-only');
        assert.equal(read.recommendationEligibility.eligible, false);
        assert.equal(read.evidenceRefs.some((ref) => ref.evidenceType === 'session-aggregate'), true);
    }

    // Real Assets exposes an explicit not-applicable interpretation for a non-real-asset (SPY) run.
    const realAssets = frozen.owners['real-assets-lab'];
    assert.equal(realAssets.evidenceInterpretations[0].kind, 'not-applicable');
    assert.equal(realAssets.recommendationEligibility.eligible, false);
    assert.equal(realAssets.marketSessionEvidenceRef, null);

    // Every non-owner source receives an explicit applicability result with no interpretation.
    assert.equal(frozen.others['options-flow-lab'].evidenceApplicability.status, 'not-integrated');
    assert.equal(frozen.others['options-flow-lab'].evidenceInterpretations.length, 0);
    assert.equal(RLDATA.validateToolModelRead(frozen.others['options-flow-lab']).ok, true);
    assert.equal(frozen.others['waterfront-polo-lab'].evidenceApplicability.status, 'not-applicable');
    assert.equal(RLDATA.validateToolModelRead(frozen.others['waterfront-polo-lab']).ok, true);
});
