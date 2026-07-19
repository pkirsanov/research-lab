/*
 * distributed-briefs-shared-canary.mjs — Feature 002, Scope 05 (Registry-Wide
 * Normalized Reads) independent shared-infrastructure canaries.
 *
 * These canaries run BEFORE the broad read-barrier suites and prove the protected
 * shared surfaces (tools.json, rldata.js, brief-refresh.mjs, rlapp.js) keep their
 * exact pre-Scope-05 semantics after the additive briefing metadata / registry read
 * dispatch. They retain the live-derived 23/22, five-publisher, and four-headless
 * values as named current-repository canary constants (never runtime constants).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import '../rldata.js';
import * as briefRefresh from '../scripts/brief-refresh.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const RLDATA = globalThis.RLDATA;
const registry = JSON.parse(readFileSync(new URL('../tools.json', import.meta.url), 'utf8'));
const rlappSource = readFileSync(new URL('../rlapp.js', import.meta.url), 'utf8');

// Named current-repository canary constants (derived-not-runtime; the derived registry is the truth).
const OBSERVED_REGISTRY_IDS = [
    'market-brief', 'market-heatmap-lab', 'options-flow-feed-lab', 'intraday-tape-lab', 'swing-structure-lab',
    'options-structure-lab', 'gamma-trading-lab', 'sector-research-lab', 'global-rotation-lab', 'real-assets-lab',
    'bond-regime-lab', 'ai-capex-strategy-lab', 'msft-july-print-model', 'company-fundamentals-lab', 'etf-momentum-lab',
    'strategy-self-improvement-lab', 'strategy-validation-lab', 'smart-money-flow-lab', 'waterfront-polo-lab',
    'volatility-sizing-lab', 'palm-springs-rental-market-lab', 'ocean-shores-rental-market-lab', 'technical-analysis-decision-lab'
];
const FIVE_BROWSER_PUBLISHERS = ['sector-research-lab', 'global-rotation-lab', 'real-assets-lab', 'bond-regime-lab', 'etf-momentum-lab'];
const FOUR_HEADLESS_BUILDERS = ['buildSectorToolRead', 'buildEtfToolRead', 'buildGlobalToolRead', 'buildRealAssetsToolRead'];
const RLAPP_STATUS_TONES = ['loading', 'bad', 'warn', 'ok', 'local'];

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

test('Canary: observed registry retains 23 ordered links and one Market Brief aggregator', () => {
    // The additive briefing metadata never changes registry identity, order, files, labels, or links.
    const ids = registry.tools.map((entry) => entry.id);
    assert.equal(ids.length, 23);
    assert.deepEqual(ids, OBSERVED_REGISTRY_IDS);
    for (const entry of registry.tools) {
        assert.equal(typeof entry.file === 'string' && entry.file.length > 0, true);
        assert.equal(entry.file.indexOf('://'), -1);
        assert.equal(entry.nav && typeof entry.nav.label === 'string' && entry.nav.label.length > 0, true);
    }

    // Exactly one final aggregator (Market Brief) and it is never a source: derived, aggregator excluded.
    const aggregators = registry.tools.filter((entry) => entry.briefing.role === 'final-aggregator').map((entry) => entry.id);
    assert.deepEqual(aggregators, ['market-brief']);
    const frozen = RLCONTRACTS.validateRegistry(registry, registryConfig());
    assert.equal(frozen.ok, true);
    assert.equal(frozen.value.participantCount, 23);
    assert.equal(frozen.value.orderedParticipantIds.length, 23);
    assert.equal(frozen.value.aggregatorToolId, 'market-brief');
    assert.equal(frozen.value.orderedSourceToolIds.indexOf('market-brief'), -1);
});

test('Canary: five browser publishers four headless reads and RLAPP statuses preserve semantics', () => {
    // The five current browser publishers still round-trip their legacy rl-tool-read/v1 projection
    // byte-identically: the additive tool-model-read/v1 branch never intercepts an existing publisher.
    for (const toolId of FIVE_BROWSER_PUBLISHERS) {
        const projection = {
            contractVersion: 'rl-tool-read/v1', id: toolId, availability: 'current',
            asOf: '2026-07-14T12:00:00.000Z', computedAt: '2026-07-14T12:05:00.000Z', freshUntil: '2026-07-14T18:00:00.000Z',
            read: 'canary publisher read', metrics: { leader: 'SPY', score: 42 }, deepLink: `${toolId}.html`
        };
        assert.equal(JSON.stringify(RLDATA.putToolRead(toolId, projection)), JSON.stringify(projection));
    }

    // The four headless Tier-A builders are preserved as callable exports (no headless read removed).
    for (const builder of FOUR_HEADLESS_BUILDERS) {
        assert.equal(typeof briefRefresh[builder], 'function');
    }

    // The out-of-scope RLAPP status vocabulary is unchanged: rlapp.js keeps its five tones and was not
    // given briefing/registry-freeze responsibilities by Scope 05.
    for (const tone of RLAPP_STATUS_TONES) {
        assert.equal(rlappSource.includes(`tone: "${tone}"`), true, `RLAPP tone missing: ${tone}`);
    }
    assert.equal(/\bbriefing\b|validateRegistry|freezeToolReads/.test(rlappSource), false);
});
