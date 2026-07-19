import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
    loadSourcePolicies,
    buildYahooRequest,
    fetchWithSourcePolicy,
    fetchYahooSessionSource,
    acquireMarketSessionEvidence
} from '../scripts/market-session-evidence.mjs';
import { capturedTransport } from './fixtures/feature-002/market-session-evidence/session-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const marketConfig = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));
const fixtureCalendar = JSON.parse(readFileSync(new URL('./fixtures/feature-002/market-session-evidence/xnys-calendar.v1.json', import.meta.url), 'utf8'));
const recordedBytes = readFileSync(new URL('./fixtures/feature-002/market-session-evidence/yahoo-chart-spy.recorded.json', import.meta.url));

const noopSleep = () => Promise.resolve();
const CUTOFF = '2026-07-14T08:30:00.000Z';
const baseOptions = {
    symbol: 'SPY',
    providerSymbol: 'SPY',
    retrievedAt: '2026-07-14T08:29:00.000Z',
    clock: () => Date.parse('2026-07-14T08:29:00.000Z'),
    sleep: noopSleep
};

function cloneConfig() {
    return JSON.parse(JSON.stringify(marketConfig));
}

test('SCN-002-017: captured Yahoo bytes normalize official and indicative session fields without missing-volume coercion', async () => {
    const policies = loadSourcePolicies(marketConfig);
    assert.equal(policies.ok, true, policies.reason);
    const request = buildYahooRequest('SPY', policies.requestPolicy);

    const acquired = await fetchYahooSessionSource(request, capturedTransport(recordedBytes), policies, baseOptions);
    assert.equal(acquired.ok, true, acquired.reason);

    // Every captured bar is normalized: prior regular-close bar plus six pre-market bars.
    assert.equal(acquired.bars.length, 7);

    // Missing volume is preserved as null, never coerced to zero.
    const missing = acquired.bars.find((bar) => bar.barStart === '2026-07-14T08:10:00.000Z');
    assert.equal(missing.volume, null);
    const observedZero = acquired.bars.filter((bar) => bar.volume === 0);
    assert.equal(observedZero.length, 0);

    // Provider OHLC is preserved exactly, never substituting close for an absent field.
    const firstPre = acquired.bars.find((bar) => bar.barStart === '2026-07-14T08:00:00.000Z');
    assert.equal(firstPre.open, 100.0);
    assert.equal(firstPre.high, 100.5);
    assert.equal(firstPre.low, 99.6);
    assert.equal(firstPre.close, 100.2);
    assert.notEqual(firstPre.open, firstPre.close);
    assert.equal(firstPre.priceBasis, 'provider-chart-basis');

    // Acquisition provenance is a valid, hash-bearing source-provenance record.
    const provenance = RLCONTRACTS.validateSourceProvenance(acquired.source);
    assert.equal(provenance.ok, true, provenance.error && provenance.error.reason);
    assert.equal(acquired.source.sourceId, 'yahoo-chart');
    assert.match(acquired.source.contentSha256, /^sha256:[a-f0-9]{64}$/);

    // Compose the evidence graph: official close stays a separate anchor from the indicative latest.
    const evidence = await acquireMarketSessionEvidence(marketConfig, Object.assign({}, baseOptions, {
        calendar: fixtureCalendar,
        transport: capturedTransport(recordedBytes),
        cutoffAt: CUTOFF,
        tradingDate: '2026-07-14',
        sessionKind: 'pre-market'
    }));
    assert.equal(evidence.ok, true, evidence.reason);
    const aggregate = evidence.aggregate;

    // Official regular close anchor is a distinct, timestamped field.
    assert.ok(aggregate.officialRegularCloseAnchor);
    assert.equal(aggregate.officialRegularCloseAnchor.close, 100);
    assert.equal(aggregate.officialRegularCloseAnchor.at, '2026-07-13T20:00:00.000Z');
    assert.equal(aggregate.officialRegularCloseAnchor.tradingDate, '2026-07-13');

    // Indicative extended-hours latest is separately labeled and never populates the official-close field.
    assert.equal(aggregate.latestLabel, 'indicative-pre-market');
    assert.equal(aggregate.latest, 100.7);
    assert.equal(aggregate.latestAt, CUTOFF);
    assert.notEqual(aggregate.latest, aggregate.officialRegularCloseAnchor.close);
    assert.notEqual(aggregate.latestAt, aggregate.officialRegularCloseAnchor.at);

    // Missing volume propagates to a partial (never fabricated-complete) volume disclosure.
    assert.equal(aggregate.volumeCompleteness, 'partial');
    assert.equal(aggregate.volumeBars, 5);
    assert.equal(aggregate.priceBars, 6);
    assert.equal(aggregate.cumulativeObservedVolume, 7500);
    assert.ok(aggregate.reasonCodes.includes('incomplete-volume'));

    // The return from the official close is a real derived value, not a claim about the anchor itself.
    assert.ok(Number.isFinite(aggregate.returnFromOfficialClose));
});

test('SCN-002-028: Yahoo and NYSE fixture mutations enforce bounds retries provenance and source use', async () => {
    const policies = loadSourcePolicies(marketConfig);
    assert.equal(policies.ok, true);
    const request = buildYahooRequest('SPY', policies.requestPolicy);
    const json = (value) => Buffer.from(JSON.stringify(value), 'utf8');
    const fixedResponse = (overrides) => async () => Object.assign({
        status: 200, ok: true, redirected: false, finalUrl: request.url, contentType: 'application/json', bytes: json({})
    }, overrides);

    // A successful acquisition still yields a valid provenance record (baseline for the mutations).
    const good = await fetchYahooSessionSource(request, capturedTransport(recordedBytes), policies, baseOptions);
    assert.equal(good.ok, true, good.reason);
    assert.equal(RLCONTRACTS.validateSourceProvenance(good.source).ok, true);

    const expectFail = async (result, code, reason) => {
        assert.equal(result.ok, false, `expected failure ${code}`);
        assert.equal(result.code, code, `wrong code (want ${code} got ${result.code}:${result.reason})`);
        if (reason) assert.equal(result.reason, reason);
    };

    // Redirect is never followed.
    await expectFail(await fetchWithSourcePolicy(request, policies, fixedResponse({ redirected: true }), baseOptions), 'B002-SOURCE-REDIRECT');

    // Byte cap is enforced.
    const oversize = Buffer.alloc(8388609, 0x20);
    await expectFail(await fetchWithSourcePolicy(request, policies, fixedResponse({ bytes: oversize }), baseOptions), 'B002-SOURCE-BYTES');

    // Response media type must be allowlisted.
    await expectFail(await fetchWithSourcePolicy(request, policies, fixedResponse({ contentType: 'text/html' }), baseOptions), 'B002-SOURCE-MEDIA');

    // Retryable status exhausts bounded retries and stays unavailable (never substituted).
    const retry = await fetchWithSourcePolicy(request, policies, fixedResponse({ status: 429, ok: false }), baseOptions);
    await expectFail(retry, 'B002-SOURCE-UNAVAILABLE', 'retryable-status-429');
    assert.equal(retry.diagnostics.length, 3);

    // A hard non-success status fails loud.
    await expectFail(await fetchWithSourcePolicy(request, policies, fixedResponse({ status: 404, ok: false }), baseOptions), 'B002-SOURCE-HTTP');

    // A denied use decision blocks fetch-and-publish entirely.
    const deniedConfig = cloneConfig();
    deniedConfig['market-evidence-source-use/v1'].decisions['yahoo-chart'].decision = 'deny-publication';
    const deniedPolicies = loadSourcePolicies(deniedConfig);
    await expectFail(await fetchWithSourcePolicy(request, deniedPolicies, capturedTransport(recordedBytes), baseOptions), 'B002-SOURCE-USE', 'source-use-denied');

    // Unreviewed raw-body retention is rejected.
    const retentionConfig = cloneConfig();
    retentionConfig['market-evidence-source-use/v1'].decisions['yahoo-chart'].rawBodyRetention = 'full-body';
    const retentionPolicies = loadSourcePolicies(retentionConfig);
    await expectFail(await fetchWithSourcePolicy(request, retentionPolicies, capturedTransport(recordedBytes), baseOptions), 'B002-SOURCE-USE', 'raw-body-retention-invalid');

    // Malformed provider arrays fail the schema contract.
    const arrayMismatch = { chart: { result: [{ meta: {}, timestamp: [1, 2, 3], indicators: { quote: [{ open: [1, 2], high: [1, 2, 3], low: [1, 2, 3], close: [1, 2, 3], volume: [1, 2, 3] }], adjclose: [{ adjclose: [1, 2, 3] }] }, events: {} }], error: null } };
    await expectFail(await fetchYahooSessionSource(request, capturedTransport(json(arrayMismatch)), policies, baseOptions), 'B002-SOURCE-SCHEMA', 'yahoo-quote-array-length-mismatch');

    // A provider-declared error is not a session.
    const chartError = { chart: { result: null, error: { code: 'Not Found', description: 'No data found for symbol' } } };
    await expectFail(await fetchYahooSessionSource(request, capturedTransport(json(chartError)), policies, baseOptions), 'B002-SOURCE-SCHEMA', 'yahoo-chart-error-present');

    // The timestamp cap is enforced.
    const overCap = 10001;
    const capped = {
        chart: {
            result: [{
                meta: {},
                timestamp: Array.from({ length: overCap }, (_, index) => 1784016000 + index * 300),
                indicators: {
                    quote: [{
                        open: Array.from({ length: overCap }, () => 100),
                        high: Array.from({ length: overCap }, () => 101),
                        low: Array.from({ length: overCap }, () => 99),
                        close: Array.from({ length: overCap }, () => 100),
                        volume: Array.from({ length: overCap }, () => 10)
                    }],
                    adjclose: [{ adjclose: Array.from({ length: overCap }, () => 100) }]
                },
                events: {}
            }],
            error: null
        }
    };
    await expectFail(await fetchYahooSessionSource(request, capturedTransport(json(capped)), policies, baseOptions), 'B002-SOURCE-SCHEMA', 'yahoo-timestamp-cap-exceeded');

    // An uncovered calendar date fails loud without a weekday fallback.
    const uncovered = await acquireMarketSessionEvidence(marketConfig, Object.assign({}, baseOptions, {
        calendar: fixtureCalendar,
        transport: capturedTransport(recordedBytes),
        cutoffAt: '2026-12-30T12:00:00.000Z',
        tradingDate: '2035-01-02',
        sessionKind: 'pre-market'
    }));
    await expectFail(uncovered, 'B002-CALENDAR', 'trading-date-not-covered');
});
