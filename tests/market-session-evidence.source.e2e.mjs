import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import test from 'node:test';
import {
    loadSourcePolicies,
    buildYahooRequest,
    fetchWithSourcePolicy,
    acquireMarketSessionEvidence
} from '../scripts/market-session-evidence.mjs';
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
const CUTOFF = '2026-07-14T08:30:00.000Z';
const baseOptions = {
    symbol: 'SPY',
    providerSymbol: 'SPY',
    retrievedAt: '2026-07-14T08:29:00.000Z',
    clock: () => Date.parse('2026-07-14T08:29:00.000Z'),
    sleep: () => Promise.resolve()
};

function acquire(overrides) {
    return acquireMarketSessionEvidence(marketConfig, Object.assign({
        calendar: committedCalendar,
        cutoffAt: CUTOFF,
        tradingDate: '2026-07-14',
        sessionKind: 'pre-market'
    }, baseOptions, overrides));
}

test('Regression: SCN-002-017 publishes separate official and indicative price with exact-window volume context', async () => {
    const response = buildYahooChartResponse({ calendar: committedCalendar, tradingDate: '2026-07-14', sessionKind: 'pre-market', bucketCount: 6, priorSessionCount: 20 });
    const result = await acquire({ transport: capturedTransport(encodeResponse(response)) });
    assert.equal(result.ok, true, result.reason);

    // The published evidence bundle is a valid, pointer-ready market-session-evidence graph.
    const bundle = result.evidence;
    assert.equal(bundle.contractVersion, 'market-session-evidence/v1');
    const revalidated = RLSESSION.validateMarketSessionEvidence(bundle, BUNDLE_POLICY);
    assert.equal(revalidated.ok, true, revalidated.error && `${revalidated.error.code}:${revalidated.error.reason}`);
    assert.equal(bundle.sessionAggregateRefs.length, 1);
    assert.equal(bundle.volumeBaselineRefs.length, 1);

    const aggregate = result.aggregate;

    // Official regular close remains a separate timestamped anchor.
    assert.ok(aggregate.officialRegularCloseAnchor);
    assert.equal(aggregate.officialRegularCloseAnchor.tradingDate, '2026-07-13');
    assert.equal(aggregate.officialRegularCloseAnchor.at, '2026-07-13T20:00:00.000Z');
    assert.equal(aggregate.officialRegularCloseAnchor.close, 100);

    // Extended-hours latest is labeled indicative and never relabeled as a close.
    assert.equal(aggregate.sessionKind, 'pre-market');
    assert.equal(aggregate.latestLabel, 'indicative-pre-market');
    assert.notEqual(aggregate.latestAt, aggregate.officialRegularCloseAnchor.at);
    assert.ok(Number.isFinite(aggregate.returnFromOfficialClose));

    // Comparable volume is compared only within the exact same-kind, same-completed-bucket window with disclosure.
    const baseline = result.baseline;
    assert.ok(baseline);
    assert.equal(baseline.comparisonWindow.sessionKind, 'pre-market');
    assert.equal(baseline.comparisonWindow.startBucket, 0);
    assert.equal(baseline.comparisonWindow.endBucketInclusive, aggregate.latestCompletedBucket);
    assert.equal(baseline.currentAggregateRef, aggregate.semanticFingerprint);
    assert.equal(baseline.candidateSessionCount, 20);
    assert.equal(baseline.state, 'qualified');
    assert.equal(baseline.eligibleSessionCount, 20);
    assert.equal(baseline.coverage, 1);
    // Sample, coverage and robust disclosure are present (never a bare number).
    assert.equal(typeof baseline.midrankPercentile, 'number');
    assert.equal(typeof baseline.relativeVolume, 'number');
    assert.ok(['ordinary', 'high', 'low', 'zero-dispersion'].includes(baseline.unusualness));

    // A corporate-action split suppresses the unsupported comparison and return claim, and the
    // misaligned session is surfaced as truthful unavailability rather than a fabricated bundle.
    const splitResponse = buildYahooChartResponse({ calendar: committedCalendar, tradingDate: '2026-07-14', sessionKind: 'pre-market', bucketCount: 6, priorSessionCount: 20, splitEvent: { date: '2026-07-10', numerator: 2, denominator: 1 } });
    const splitResult = await acquire({ transport: capturedTransport(encodeResponse(splitResponse)) });
    assert.equal(splitResult.ok, true, splitResult.reason);
    assert.equal(splitResult.aggregate.adjustmentState, 'corporate-action-discontinuity');
    assert.equal(splitResult.aggregate.state, 'misaligned');
    assert.equal(splitResult.aggregate.returnFromOfficialClose, null);
    assert.equal(splitResult.baseline, null); // comparison suppressed, not fabricated
    assert.equal(splitResult.evidence, null); // misaligned benchmark is not publishable
    assert.equal(splitResult.state, 'misaligned');
});

test('Regression: SCN-002-028 source acquisition is bounded reviewed fail-loud and no-write', async () => {
    const policies = loadSourcePolicies(marketConfig);
    assert.equal(policies.ok, true);
    const request = buildYahooRequest('SPY', policies.requestPolicy);
    const response = buildYahooChartResponse({ calendar: committedCalendar, tradingDate: '2026-07-14', sessionKind: 'pre-market', bucketCount: 6, priorSessionCount: 20 });
    const bytes = encodeResponse(response);

    // Snapshot the scope-owned generated roots BEFORE any acquisition (no-write proof).
    const snapshot = () => {
        const calendarPath = new URL('../data/calendars/xnys/calendar.json', import.meta.url);
        const barsDir = new URL('../data/session-bars/', import.meta.url);
        const calendarStat = existsSync(calendarPath) ? (() => { const s = statSync(calendarPath); return `${s.size}:${s.mtimeMs}`; })() : 'absent';
        const barsListing = existsSync(barsDir) ? readdirSync(barsDir).sort().join(',') : 'absent';
        return `calendar=${calendarStat}|session-bars=${barsListing}`;
    };
    const before = snapshot();

    // Fail-loud, bounded, reviewed acquisition on every external-boundary violation.
    const fixed = (overrides) => async () => Object.assign({ status: 200, ok: true, redirected: false, finalUrl: request.url, contentType: 'application/json', bytes: Buffer.from('{}') }, overrides);
    const redirect = await fetchWithSourcePolicy(request, policies, fixed({ redirected: true }), baseOptions);
    assert.equal(redirect.code, 'B002-SOURCE-REDIRECT');
    const oversize = await fetchWithSourcePolicy(request, policies, fixed({ bytes: Buffer.alloc(8388609, 0x20) }), baseOptions);
    assert.equal(oversize.code, 'B002-SOURCE-BYTES');
    const media = await fetchWithSourcePolicy(request, policies, fixed({ contentType: 'text/html' }), baseOptions);
    assert.equal(media.code, 'B002-SOURCE-MEDIA');

    // A successful full acquisition composes a valid graph and remains reviewed.
    const ok = await acquire({ transport: capturedTransport(bytes) });
    assert.equal(ok.ok, true, ok.reason);
    assert.equal(RLSESSION.validateMarketSessionEvidence(ok.evidence, BUNDLE_POLICY).ok, true);
    assert.equal(ok.source.retentionMode, 'normalized-facts-and-hash');
    assert.match(ok.source.contentSha256, /^sha256:[a-f0-9]{64}$/);
    assert.equal(ok.source.accessClass, 'public-best-effort');

    // The acquisition path wrote no repository file (calendar bytes + session-bars root unchanged).
    const after = snapshot();
    assert.equal(after, before);
});
