/*
 * distributed-briefs-foundation.e2e.mjs — Feature 002, Scope 05 (Registry-Wide
 * Normalized Reads) scenario-specific persistent E2E regression suite.
 *
 * Builds ONE real production MarketSessionEvidence/v1 bundle through the production
 * entry points and freezes the COMPLETE runtime-discovered registry through the
 * production registry form of `scripts/brief-refresh.mjs::freezeToolReads`. It proves
 * the whole current registry graph: exactly 22 source reads with the Market Brief
 * final aggregator excluded (SCN-002-001); unavailable / non-live / off-theme
 * evidence never becomes a market recommendation (SCN-002-002); and a registry-only
 * addition joins every read consumer with no inventory edit (SCN-002-003). Validation
 * is the UNCHANGED production `rldata.js::validateToolModelRead` owner-only contract.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { acquireReportEvidence, acquireMarketSessionEvidence } from '../scripts/market-session-evidence.mjs';
import { freezeToolReads } from '../scripts/brief-refresh.mjs';
import '../rldata.js';
import { buildConsensusArtifact, capturedReportTransport } from './fixtures/feature-002/market-session-evidence/report-fixture-builder.mjs';
import { buildYahooChartResponse, encodeResponse, capturedTransport } from './fixtures/feature-002/market-session-evidence/session-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const RLDATA = globalThis.RLDATA;
const registry = JSON.parse(readFileSync(new URL('../tools.json', import.meta.url), 'utf8'));
const marketConfig = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));
const committedCalendar = JSON.parse(readFileSync(new URL('../data/calendars/xnys/calendar.json', import.meta.url), 'utf8'));
const CUTOFF = '2026-07-14T12:40:00.000Z';

function registryConfig() {
    return {
        profiles: {
            'live-market': { freshnessPolicy: 'daily-market-bars-v1', recommendationPolicy: 'market-action-v1', budgetPolicy: 'live-market-v1' },
            'static-model': { freshnessPolicy: 'static-model-asof-v1', recommendationPolicy: 'model-conclusion-v1', budgetPolicy: 'static-model-v1' },
            'local-model': { freshnessPolicy: 'committed-projection-v1', recommendationPolicy: 'operational-next-step-v1', budgetPolicy: 'local-model-v1' },
            'off-theme': { freshnessPolicy: 'off-theme-not-applicable-v1', recommendationPolicy: 'domain-next-step-v1', budgetPolicy: 'off-theme-v1' },
            'final-aggregator': { freshnessPolicy: 'final-aggregation-v1', recommendationPolicy: 'final-synthesis-v1', budgetPolicy: 'final-aggregator-v1' }
        }
    };
}

function addedSourceEntry() {
    return {
        id: 'demo-added-source-lab',
        title: 'Demo Added Source',
        file: 'demo-added-source-lab.html',
        briefing: {
            role: 'source', profile: 'live-market', readAdapter: 'demo-added-source-owning-model-v1',
            readContractVersion: 'tool-model-read/v1', freshnessPolicy: 'daily-market-bars-v1',
            recommendationPolicy: 'market-action-v1', budgetPolicy: 'live-market-v1'
        }
    };
}

async function acquireEvidence() {
    const reportResult = await acquireReportEvidence(marketConfig, {
        report: 'cpi', reportPeriod: '2026-06', cutoffAt: CUTOFF, retrievedAt: '2026-07-14T12:35:00.000Z',
        transport: capturedReportTransport(), consensusArtifacts: [buildConsensusArtifact({ scheduledAt: '2026-07-14T12:30:00.000Z' })]
    });
    assert.equal(reportResult.ok, true, reportResult.reason);
    const sessionResponse = buildYahooChartResponse({ calendar: committedCalendar, tradingDate: '2026-07-14', sessionKind: 'pre-market', bucketCount: 56, priorSessionCount: 20 });
    const result = await acquireMarketSessionEvidence(marketConfig, {
        calendar: committedCalendar, cutoffAt: CUTOFF, tradingDate: '2026-07-14', sessionKind: 'pre-market',
        symbol: 'SPY', providerSymbol: 'SPY', retrievedAt: '2026-07-14T12:39:00.000Z',
        clock: () => Date.parse('2026-07-14T12:39:00.000Z'), sleep: () => Promise.resolve(),
        reactionReport: reportResult.evidence, transport: capturedTransport(encodeResponse(sessionResponse))
    });
    assert.equal(result.ok, true, result.reason);
    return result.evidence;
}

const evidence = await acquireEvidence();
const adapters = { evidence, registryConfig: registryConfig() };

test('Regression: SCN-002-001 current registry freezes 22 source reads and one non-recursive final aggregator', () => {
    const frozen = freezeToolReads(registry, adapters, { symbol: 'SPY' });
    // Every current source ID validates exactly once; the aggregator is excluded (never recursive).
    assert.equal(frozen.participantCount, 23);
    assert.equal(frozen.sourceCount, 22);
    assert.equal(frozen.aggregatorToolId, 'market-brief');
    assert.equal(Object.keys(frozen.reads).length, 22);
    assert.equal(Object.prototype.hasOwnProperty.call(frozen.reads, 'market-brief'), false);
    const seen = new Set();
    for (const toolId of frozen.orderedSourceToolIds) {
        assert.equal(seen.has(toolId), false);
        seen.add(toolId);
        const read = frozen.reads[toolId];
        assert.equal(RLDATA.validateToolModelRead(read).ok, true, toolId);
        assert.equal(read.role, 'source');
        assert.notEqual(read.toolId, 'market-brief');
    }
    assert.equal(seen.size, 22);
});

test('Regression: SCN-002-002 unavailable non-live and off-theme evidence never becomes a market recommendation', () => {
    const frozen = freezeToolReads(registry, adapters, { symbol: 'SPY' });
    // Public structured output preserves zero market-action eligibility for every non-live-market source
    // (static-model, local-model, off-theme) and every not-integrated live-market source. Only a valid
    // owning read with a permitted supporting/contradicting interpretation can ever be eligible.
    for (const toolId of frozen.orderedSourceToolIds) {
        const read = frozen.reads[toolId];
        const profile = frozen.registry.entries[toolId].profile;
        if (profile !== 'live-market') {
            assert.equal(read.recommendationEligibility.eligible, false, `${toolId} (${profile}) must never be market-eligible`);
        }
        if (read.evidenceApplicability && read.evidenceApplicability.status !== 'applicable') {
            assert.equal(read.recommendationEligibility.eligible, false, `${toolId} non-applicable read must not be eligible`);
            assert.equal((read.evidenceInterpretations || []).some((it) => it.actionEligibilityEffect === 'permits-owner-action'), false);
        }
    }
    // The off-theme rentals and the illustrative local-model sources are explicitly excluded from action.
    for (const toolId of ['waterfront-polo-lab', 'palm-springs-rental-market-lab', 'ocean-shores-rental-market-lab', 'smart-money-flow-lab']) {
        assert.equal(frozen.reads[toolId].recommendationEligibility.eligible, false);
        assert.equal(frozen.reads[toolId].evidenceApplicability.status, 'not-applicable');
    }
});

test('Regression: SCN-002-003 registry-only addition joins every read consumer without inventory edits', () => {
    const baseline = freezeToolReads(registry, adapters, { symbol: 'SPY' });
    assert.equal(baseline.participantCount, 23);
    assert.equal(baseline.sourceCount, 22);

    // A registry-only addition (one valid new source) flows through the SAME production loops: the next
    // freeze derives 24/23 and produces a complete read for the added source with no scheduler-list,
    // validator-count, or coverage-list edit.
    const mutated = JSON.parse(JSON.stringify(registry));
    mutated.tools.push(addedSourceEntry());
    const frozen = freezeToolReads(mutated, adapters, { symbol: 'SPY' });
    assert.equal(frozen.participantCount, 24);
    assert.equal(frozen.sourceCount, 23);
    assert.equal(frozen.orderedSourceToolIds[frozen.orderedSourceToolIds.length - 1], 'demo-added-source-lab');
    assert.equal(Object.keys(frozen.reads).length, 23);
    const addedRead = frozen.reads['demo-added-source-lab'];
    assert.equal(RLDATA.validateToolModelRead(addedRead).ok, true);
    // The added live-market source has no declared owner adapter yet, so it is explicitly not-integrated
    // (a complete typed outcome, never a silent omission and never an inferred metric).
    assert.equal(addedRead.evidenceApplicability.status, 'not-integrated');
    assert.equal(addedRead.recommendationEligibility.eligible, false);
    // Every pre-existing source read is unchanged by the addition (no inventory edit contaminated them).
    for (const toolId of baseline.orderedSourceToolIds) {
        assert.equal(JSON.stringify(frozen.reads[toolId]), JSON.stringify(baseline.reads[toolId]), toolId);
    }
});
