/*
 * distributed-briefs-read-adapters.integration.mjs — Feature 002, Scope 05
 * (Registry-Wide Normalized Reads) integration suite.
 *
 * Builds ONE real production MarketSessionEvidence/v1 bundle through the production
 * entry points, then freezes the COMPLETE runtime-discovered registry via the
 * production registry form of `scripts/brief-refresh.mjs::freezeToolReads`
 * (validated through `rlcontracts.js::validateRegistry`). It asserts every one of
 * the derived source IDs receives exactly one truthful, validated ToolModelRead/v1
 * outcome. The six Scope 04 owning-model reads and the committed
 * company-fundamentals static-evaluator read are executed as real production
 * adapters; every remaining source emits an explicit typed applicability outcome
 * rather than an inferred metric. No source is omitted or invalid, and the final
 * aggregator (Market Brief) is never self-consumed. No owner/model output is mocked.
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

// The committed per-profile briefing-policy bindings (design.md Registry Entry Contract), supplied
// to validateRegistry by the caller so the pure contract module holds no default policy values.
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

async function buildRegistryFreeze() {
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
    const evidence = result.evidence;
    const frozen = freezeToolReads(registry, { evidence, registryConfig: registryConfig() }, { symbol: 'SPY' });
    return { evidence, frozen };
}

const { evidence, frozen } = await buildRegistryFreeze();

test('all observed 22 source adapters emit truthful production ToolModelRead outcomes', () => {
    // The frozen registry derives exactly the 22 source IDs (aggregator excluded) in registry order.
    const expectedSources = registry.tools.filter((entry) => entry.briefing.role === 'source').map((entry) => entry.id);
    assert.equal(frozen.sourceCount, 22);
    assert.equal(frozen.participantCount, 23);
    assert.deepEqual(frozen.orderedSourceToolIds, expectedSources);
    assert.equal(frozen.aggregatorToolId, 'market-brief');
    // The final aggregator is never self-consumed: it has no source read.
    assert.equal(Object.prototype.hasOwnProperty.call(frozen.reads, 'market-brief'), false);

    // EVERY derived source has exactly one complete, validated ToolModelRead/v1 outcome — none omitted,
    // inferred, or invalid; identity/profile/role/deepLink match the frozen registry.
    assert.equal(Object.keys(frozen.reads).length, 22);
    for (const toolId of frozen.orderedSourceToolIds) {
        const read = frozen.reads[toolId];
        const validation = RLDATA.validateToolModelRead(read);
        assert.equal(validation.ok, true, `${toolId}: ${validation.reason}`);
        assert.equal(read.contractVersion, 'tool-model-read/v1');
        assert.equal(read.toolId, toolId);
        assert.equal(read.role, 'source');
        assert.equal(read.profile, frozen.registry.entries[toolId].profile);
        assert.equal(typeof read.deepLink === 'string' && read.deepLink.length > 0, true);
        assert.equal(read.evidenceCutoff, evidence.cutoffAt);
    }

    // The six Scope 04 owning reads are executed as real owner adapters (adapter identity preserved).
    for (const toolId of ['intraday-tape-lab', 'sector-research-lab', 'etf-momentum-lab', 'global-rotation-lab', 'real-assets-lab', 'bond-regime-lab']) {
        assert.equal(frozen.reads[toolId].adapter.adapterId, registry.tools.find((entry) => entry.id === toolId).briefing.readAdapter);
    }

    // A non-owner live-market source is explicitly not-integrated (no inferred metrics, no interpretation);
    // a static/local/off-theme source (including the SEC-facts company model) is explicitly not-applicable
    // for XNYS market-session evidence. Neither invents an evidence conclusion, and neither is ever
    // market-action eligible.
    const heatmap = frozen.reads['market-heatmap-lab'];
    assert.equal(heatmap.evidenceApplicability.status, 'not-integrated');
    assert.equal(heatmap.evidenceInterpretations.length, 0);
    assert.equal(heatmap.recommendationEligibility.eligible, false);
    for (const toolId of ['ai-capex-strategy-lab', 'company-fundamentals-lab', 'strategy-validation-lab', 'waterfront-polo-lab']) {
        const read = frozen.reads[toolId];
        assert.equal(read.evidenceApplicability.status, 'not-applicable');
        assert.equal(read.evidenceInterpretations.length, 0);
        assert.equal(read.recommendationEligibility.eligible, false);
    }
});
