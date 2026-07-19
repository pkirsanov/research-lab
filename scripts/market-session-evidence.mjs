#!/usr/bin/env node
/*
 * market-session-evidence.mjs — Feature 002, Scope 02.
 *
 * The sole EXTERNAL evidence transport for the distributed-briefs market-session
 * vertical. It acquires bounded Yahoo `includePrePost=true` five-minute bars
 * through an exact reviewed request/use policy, normalizes them into the
 * provider-neutral Scope 01 `session-source-bar/v1` contract, and composes the
 * official-close anchor, extended-hours aggregate, comparable-volume baseline,
 * and evidence bundle through the UNCHANGED Scope 01 foundation
 * (rlsession.js / rlcontracts.js).
 *
 * Boundaries:
 *   - Built-in Node `fetch` with `redirect: "error"` is the only production
 *     transport; tests inject a captured-bytes transport. No proxy, no alternate
 *     origin, no credential.
 *   - A policy/bounds/schema violation or an incompatible observation becomes a
 *     TYPED unavailable/disputed result — never a substituted or inferred value.
 *   - BLS/CPI acquisition is intentionally NOT implemented here; it is owned by
 *     Scope 03. This module owns only the calendar + Yahoo session vertical.
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const RLSESSION = require('../rlsession.js');

export const YAHOO_ADAPTER_ID = 'yahoo-chart-session';
export const YAHOO_ADAPTER_VERSION = 'yahoo-chart-session-adapter/v1';
const USER_AGENT = 'Mozilla/5.0 (research-lab market-session-evidence)';
const FIVE_MINUTES_MS = 300000;
const CANONICAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function fail(code, reason, extra) {
    return Object.assign({ ok: false, code, reason }, extra || {});
}

function sha256Hex(bytes) {
    return 'sha256:' + createHash('sha256').update(bytes).digest('hex');
}

function canonicalTimestamp(value) {
    if (typeof value !== 'string') return null;
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return null;
    return new Date(parsed).toISOString().replace(/\.\d{3}Z$/, '.000Z');
}

/* ------------------------------------------------------------------ *
 * Policy loading + exact request allowlist
 * ------------------------------------------------------------------ */

export function loadSourcePolicies(config) {
    if (!config || typeof config !== 'object') return fail('B002-CONFIG', 'config-required');
    const evidenceConfig = config.marketSessionEvidence;
    if (!evidenceConfig || evidenceConfig.contractVersion !== 'market-session-evidence-config/v1') {
        return fail('B002-CONFIG', 'market-session-evidence-config-invalid');
    }
    const requestPolicy = config[evidenceConfig.sourceRequestPolicy];
    const usePolicy = config[evidenceConfig.sourceUsePolicy];
    const budgetPolicy = config[evidenceConfig.artifactBudgetPolicy];
    if (!requestPolicy || requestPolicy.contractVersion !== 'source-request-policy/v1' || !requestPolicy.sources) {
        return fail('B002-CONFIG', 'source-request-policy-unresolved', { field: evidenceConfig.sourceRequestPolicy });
    }
    if (!usePolicy || usePolicy.contractVersion !== 'source-use-policy/v1' || !usePolicy.decisions) {
        return fail('B002-CONFIG', 'source-use-policy-unresolved', { field: evidenceConfig.sourceUsePolicy });
    }
    if (!budgetPolicy || budgetPolicy.contractVersion !== 'artifact-budget/v1') {
        return fail('B002-CONFIG', 'artifact-budget-policy-unresolved', { field: evidenceConfig.artifactBudgetPolicy });
    }
    return { ok: true, evidenceConfig, requestPolicy, usePolicy, budgetPolicy };
}

/* Validate a concrete acquisition request against the exact allowlisted entry.
 * request: { sourceId, method, url, body? } */
export function validateSourceRequest(request, requestPolicy) {
    if (!request || typeof request !== 'object') return fail('B002-SOURCE-REQUEST', 'request-required');
    const entry = requestPolicy && requestPolicy.sources ? requestPolicy.sources[request.sourceId] : null;
    if (!entry) return fail('B002-SOURCE-REQUEST', 'source-not-allowlisted', { field: 'sourceId' });
    if (request.method !== entry.method) return fail('B002-SOURCE-REQUEST', 'method-mismatch', { field: 'method' });
    let url;
    try {
        url = new URL(request.url);
    } catch (error) {
        return fail('B002-SOURCE-REQUEST', 'url-unparseable', { field: 'url' });
    }
    if (url.protocol !== entry.scheme) return fail('B002-SOURCE-REQUEST', 'scheme-not-allowlisted', { field: 'url.protocol' });
    if (url.username || url.password) return fail('B002-SOURCE-REQUEST', 'userinfo-forbidden', { field: 'url' });
    if (url.hash) return fail('B002-SOURCE-REQUEST', 'fragment-forbidden', { field: 'url.hash' });
    if (url.hostname !== entry.host) return fail('B002-SOURCE-REQUEST', 'host-not-allowlisted', { field: 'url.host' });
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(url.hostname) || url.hostname.includes(':')) {
        return fail('B002-SOURCE-REQUEST', 'ip-literal-host-forbidden', { field: 'url.host' });
    }
    const port = url.port ? Number(url.port) : (url.protocol === 'https:' ? 443 : null);
    if (entry.port && port !== entry.port) return fail('B002-SOURCE-REQUEST', 'port-not-allowlisted', { field: 'url.port' });
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('..') || pathname.includes('//')) return fail('B002-SOURCE-REQUEST', 'path-traversal-forbidden', { field: 'url.pathname' });
    if (entry.pathnameMode === 'exact') {
        if (pathname !== entry.pathname) return fail('B002-SOURCE-REQUEST', 'path-not-allowlisted', { field: 'url.pathname' });
    } else if (entry.pathnameMode === 'prefix') {
        if (pathname.indexOf(entry.pathnamePrefix) !== 0 || pathname.length <= entry.pathnamePrefix.length) {
            return fail('B002-SOURCE-REQUEST', 'path-not-allowlisted', { field: 'url.pathname' });
        }
    } else {
        return fail('B002-SOURCE-REQUEST', 'path-mode-invalid', { field: 'url.pathname' });
    }
    // Exact query-key set + fixed query values; reject duplicates and unexpected keys.
    const expectedKeys = entry.queryKeys || [];
    const seen = Object.create(null);
    const rawPairs = [];
    for (const [key, value] of url.searchParams.entries()) {
        if (seen[key]) return fail('B002-SOURCE-REQUEST', 'duplicate-query-key', { field: 'url.query.' + key });
        seen[key] = true;
        rawPairs.push([key, value]);
    }
    if (rawPairs.length !== expectedKeys.length) return fail('B002-SOURCE-REQUEST', 'query-key-cardinality-mismatch', { field: 'url.query' });
    for (const key of expectedKeys) {
        if (!seen[key]) return fail('B002-SOURCE-REQUEST', 'query-key-missing', { field: 'url.query.' + key });
        const actual = url.searchParams.get(key);
        if (actual !== String(entry.queryValues[key])) return fail('B002-SOURCE-REQUEST', 'query-value-mismatch', { field: 'url.query.' + key });
    }
    // Body schema
    if (entry.requestBodySchema === null) {
        if (request.body !== undefined && request.body !== null) return fail('B002-SOURCE-REQUEST', 'unexpected-request-body', { field: 'body' });
    } else if (!request.body || typeof request.body !== 'object') {
        return fail('B002-SOURCE-REQUEST', 'request-body-required', { field: 'body' });
    }
    return { ok: true, entry, url };
}

function resolveSourceUse(sourceId, usePolicy) {
    const decision = usePolicy && usePolicy.decisions ? usePolicy.decisions[sourceId] : null;
    if (!decision) return fail('B002-SOURCE-USE', 'source-use-decision-missing', { field: sourceId });
    if (decision.decision !== 'allow-normalized-publication') {
        return fail('B002-SOURCE-USE', 'source-use-denied', { field: sourceId });
    }
    if (decision.rawBodyRetention !== 'hash-only') return fail('B002-SOURCE-USE', 'raw-body-retention-invalid', { field: sourceId });
    return { ok: true, decision };
}

/* ------------------------------------------------------------------ *
 * Transports
 * ------------------------------------------------------------------ */

// Production transport: built-in fetch, redirect rejected, bytes captured.
export async function nodeFetchTransport(resolved) {
    const response = await fetch(resolved.url, {
        method: resolved.method,
        redirect: 'error',
        headers: Object.assign({ 'User-Agent': USER_AGENT, Accept: resolved.accept }, resolved.body ? { 'Content-Type': 'application/json' } : {}),
        body: resolved.body ? JSON.stringify(resolved.body) : undefined
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    return {
        status: response.status,
        ok: response.ok,
        redirected: response.redirected,
        finalUrl: response.url,
        contentType: response.headers.get('content-type') || '',
        bytes: buffer
    };
}

/* ------------------------------------------------------------------ *
 * Bounded acquisition through the source policy
 * ------------------------------------------------------------------ */

export async function fetchWithSourcePolicy(request, policies, transport, options) {
    options = options || {};
    const requestResult = validateSourceRequest(request, policies.requestPolicy);
    if (!requestResult.ok) return requestResult;
    const useResult = resolveSourceUse(request.sourceId, policies.usePolicy);
    if (!useResult.ok) return useResult;
    const entry = requestResult.entry;
    const acquisition = policies.evidenceConfig.acquisition;
    const ceilingMs = (acquisition.ceilingSeconds || 120) * 1000;
    const maxAttempts = (acquisition.retryCount || 0) + 1;
    const backoffMs = acquisition.backoffMs || [];
    const sleep = options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    const startedAt = options.clock ? options.clock() : Date.now();
    const diagnostics = [];
    let attempt = 0;
    let lastReason = 'source-unavailable';
    while (attempt < maxAttempts) {
        if (((options.clock ? options.clock() : Date.now()) - startedAt) > ceilingMs) {
            return fail('B002-SOURCE-TIMEOUT', 'acquisition-ceiling-exceeded', { diagnostics });
        }
        if (attempt > 0) {
            const waitMs = Math.min(backoffMs[attempt - 1] || backoffMs[backoffMs.length - 1] || 0, (acquisition.maxRetryAfterSeconds || 10) * 1000);
            if (waitMs > 0) await sleep(waitMs);
        }
        let response;
        try {
            response = await transport({ method: entry.method, url: request.url, accept: (entry.responseMediaTypes || [])[0], body: request.body });
        } catch (error) {
            lastReason = 'transport-error';
            diagnostics.push('attempt-' + attempt + '-transport-error');
            attempt += 1;
            continue;
        }
        if (response.redirected || (response.status >= 300 && response.status < 400)) {
            return fail('B002-SOURCE-REDIRECT', 'redirect-not-permitted', { diagnostics });
        }
        if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
            lastReason = 'retryable-status-' + response.status;
            diagnostics.push('attempt-' + attempt + '-status-' + response.status);
            attempt += 1;
            continue;
        }
        if (!response.ok || response.status !== 200) {
            return fail('B002-SOURCE-HTTP', 'non-success-status', { status: response.status, diagnostics });
        }
        const bytes = response.bytes;
        const maxBytes = entry.maxResponseBytes || acquisition.maxResponseBytes;
        if (bytes.length > maxBytes) return fail('B002-SOURCE-BYTES', 'response-byte-cap-exceeded', { bytes: bytes.length, diagnostics });
        const mediaOk = (entry.responseMediaTypes || []).some((type) => (response.contentType || '').split(';')[0].trim() === type);
        if (!mediaOk) return fail('B002-SOURCE-MEDIA', 'response-media-type-not-allowlisted', { contentType: response.contentType, diagnostics });
        const retrievedAt = canonicalTimestamp(options.retrievedAt || new Date((options.clock ? options.clock() : Date.now())).toISOString());
        const provenance = {
            contractVersion: 'source-provenance/v1',
            sourceId: request.sourceId,
            adapterId: options.adapterId || YAHOO_ADAPTER_ID,
            adapterVersion: options.adapterVersion || YAHOO_ADAPTER_VERSION,
            sourceKind: entry.sourceKind,
            sourceUrl: request.url,
            requestDescriptor: { method: entry.method, path: new URL(request.url).pathname, query: Object.fromEntries(new URL(request.url).searchParams.entries()) },
            sourcePublishedAt: null,
            retrievedAt,
            contentSha256: sha256Hex(bytes),
            accessClass: entry.accessClass,
            sourceUsePolicyId: useResult.decision.policyId,
            sourceUseReviewRef: useResult.decision.sourceUseReviewRef,
            retentionMode: useResult.decision.retentionMode,
            freshnessPolicy: useResult.decision.freshnessPolicy,
            freshnessState: options.freshnessState || 'current',
            diagnostics: []
        };
        const provenanceCheck = RLCONTRACTS.validateSourceProvenance(provenance);
        if (!provenanceCheck.ok) {
            return fail('B002-SOURCE-PROVENANCE', provenanceCheck.error ? provenanceCheck.error.reason : 'provenance-invalid', { field: provenanceCheck.error && provenanceCheck.error.field });
        }
        return { ok: true, bytes, contentSha256: provenance.contentSha256, contentType: response.contentType, provenance: provenanceCheck.value, diagnostics };
    }
    return fail('B002-SOURCE-UNAVAILABLE', lastReason, { diagnostics });
}

/* ------------------------------------------------------------------ *
 * Yahoo chart parsing + normalization
 * ------------------------------------------------------------------ */

export function buildYahooRequest(providerSymbol, requestPolicy) {
    const entry = requestPolicy.sources['yahoo-chart'];
    const url = new URL('https://' + entry.host + entry.pathnamePrefix + encodeURIComponent(providerSymbol));
    for (const key of entry.queryKeys) url.searchParams.set(key, String(entry.queryValues[key]));
    return { sourceId: 'yahoo-chart', method: 'GET', url: url.toString() };
}

export function parseYahooChart(bytes, options) {
    options = options || {};
    const maxTimestamps = options.maxTimestamps || 10000;
    let payload;
    try {
        payload = JSON.parse(Buffer.isBuffer(bytes) ? bytes.toString('utf8') : String(bytes));
    } catch (error) {
        return fail('B002-SOURCE-SCHEMA', 'yahoo-json-unparseable');
    }
    if (!payload || !payload.chart || (payload.chart.error !== null && payload.chart.error !== undefined)) {
        return fail('B002-SOURCE-SCHEMA', 'yahoo-chart-error-present');
    }
    const result = Array.isArray(payload.chart.result) ? payload.chart.result[0] : null;
    if (!result || !Array.isArray(result.timestamp) || !result.indicators || !Array.isArray(result.indicators.quote)) {
        return fail('B002-SOURCE-SCHEMA', 'yahoo-result-shape-invalid');
    }
    const timestamp = result.timestamp;
    if (timestamp.length > maxTimestamps) return fail('B002-SOURCE-SCHEMA', 'yahoo-timestamp-cap-exceeded', { count: timestamp.length });
    const quote = result.indicators.quote[0] || {};
    const fields = ['open', 'high', 'low', 'close', 'volume'];
    for (const field of fields) {
        if (!Array.isArray(quote[field]) || quote[field].length !== timestamp.length) {
            return fail('B002-SOURCE-SCHEMA', 'yahoo-quote-array-length-mismatch', { field });
        }
    }
    return { ok: true, result, timestamp, quote, meta: result.meta || {}, events: result.events || {} };
}

/* Split events between the anchor and current observation are a
 * corporate-action discontinuity; a conflicting symbol/event record is disputed. */
function corporateActionState(events, symbol) {
    const splits = events && events.splits ? Object.values(events.splits) : [];
    const refs = [];
    let state = 'compatible';
    for (const split of splits) {
        if (!split || typeof split !== 'object') { state = 'disputed'; continue; }
        const ref = RLCONTRACTS.fingerprint('corporate-action-split', {
            contractVersion: 'corporate-action-split/v1',
            symbol,
            date: split.date,
            numerator: split.numerator,
            denominator: split.denominator,
            splitRatio: split.splitRatio
        });
        refs.push(ref);
        if (state === 'compatible') state = 'corporate-action-discontinuity';
    }
    return { state, refs: refs.sort() };
}

export function normalizeYahooSession(parsed, options) {
    const { symbol, providerSymbol } = options;
    const budget = options.budget || {};
    const corporate = corporateActionState(parsed.events, symbol);
    const bars = [];
    let missingVolume = 0;
    let droppedOhlc = 0;
    for (let i = 0; i < parsed.timestamp.length; i += 1) {
        const ts = parsed.timestamp[i];
        if (!Number.isFinite(ts)) { droppedOhlc += 1; continue; }
        const open = parsed.quote.open[i];
        const high = parsed.quote.high[i];
        const low = parsed.quote.low[i];
        const close = parsed.quote.close[i];
        const rawVolume = parsed.quote.volume[i];
        // Never substitute close for an absent OHL; a bar with any absent OHLC is dropped, not coerced.
        if (![open, high, low, close].every((value) => Number.isFinite(value) && value > 0)) { droppedOhlc += 1; continue; }
        let volume;
        if (rawVolume === null || rawVolume === undefined) { volume = null; missingVolume += 1; }
        else if (Number.isInteger(rawVolume) && rawVolume >= 0) volume = rawVolume;
        else { droppedOhlc += 1; continue; }
        const barStart = new Date(ts * 1000).toISOString().replace(/\.\d{3}Z$/, '.000Z');
        if (!CANONICAL_TIMESTAMP_PATTERN.test(barStart)) { droppedOhlc += 1; continue; }
        bars.push({
            contractVersion: 'session-source-bar/v1',
            symbol,
            providerSymbol,
            interval: 'PT5M',
            barStart,
            barEnd: new Date(ts * 1000 + FIVE_MINUTES_MS).toISOString().replace(/\.\d{3}Z$/, '.000Z'),
            open, high, low, close,
            volume,
            priceBasis: 'provider-chart-basis',
            adjustmentState: corporate.state,
            corporateActionRefs: corporate.refs.slice()
        });
    }
    const maxBars = budget.maxBarsPerSymbolTradingDate || 200;
    return { ok: true, bars, corporateActionRefs: corporate.refs, adjustmentState: corporate.state, maxBarsPerSymbolTradingDate: maxBars, diagnostics: { missingVolume, droppedOhlc } };
}

export async function fetchYahooSessionSource(request, transport, policies, options) {
    options = options || {};
    const providerSymbol = options.providerSymbol || options.symbol;
    const acquisition = await fetchWithSourcePolicy(request, policies, transport, options);
    if (!acquisition.ok) return acquisition;
    const parsed = parseYahooChart(acquisition.bytes, { maxTimestamps: (policies.requestPolicy.sources['yahoo-chart'] || {}).maxTimestamps });
    if (!parsed.ok) return parsed;
    const normalized = normalizeYahooSession(parsed, { symbol: options.symbol, providerSymbol, budget: policies.budgetPolicy });
    if (!normalized.ok) return normalized;
    return {
        ok: true,
        source: acquisition.provenance,
        bars: normalized.bars,
        adjustmentState: normalized.adjustmentState,
        corporateActionRefs: normalized.corporateActionRefs,
        meta: parsed.meta,
        diagnostics: normalized.diagnostics
    };
}

/* ------------------------------------------------------------------ *
 * Evidence composition through the Scope 01 foundation
 * ------------------------------------------------------------------ */

const CUTOFF_POLICY = Object.freeze({
    contractVersion: 'cutoff-policy/v1',
    interval: 'PT5M',
    boundaryPolicyVersion: 'xnys-session-boundaries/v1',
    requireNextOpenTradingDate: true
});

function comparablePolicyFrom(volumePolicy) {
    return {
        contractVersion: 'comparable-volume-policy/v1',
        interval: 'PT5M',
        candidateSessionCount: volumePolicy.candidateSessions,
        qualifiedMinEligible: volumePolicy.qualifiedMinSamples,
        qualifiedMinCoverage: volumePolicy.qualifiedMinCoverage,
        thinMinEligible: volumePolicy.thinMinSamples,
        thinMinCoverage: volumePolicy.thinMinCoverage,
        highPercentile: volumePolicy.highPercentile,
        lowPercentile: volumePolicy.lowPercentile,
        highRobustZ: volumePolicy.robustZThreshold,
        lowRobustZ: -volumePolicy.robustZThreshold
    };
}

const BUNDLE_POLICY = Object.freeze({
    contractVersion: 'market-session-evidence-policy/v1',
    evidenceRoot: 'briefs/objects/evidence',
    requiredCalendar: true,
    requiredBenchmarkSymbol: 'SPY',
    requiredDueReportStates: ['upcoming', 'released', 'revised']
});

function sessionWindow(session, sessionKind) {
    const key = sessionKind === 'pre-market' ? 'preMarket' : (sessionKind === 'after-hours' ? 'afterHours' : 'regular');
    return session[key];
}

function classifyWindow(bars, session, sessionKind, cutoffAt, source) {
    const window = sessionWindow(session, sessionKind);
    if (!window) return [];
    const startEpoch = Date.parse(window.startUtc);
    const endEpoch = Date.parse(window.endUtc);
    const observations = [];
    for (const bar of bars) {
        const barStartEpoch = Date.parse(bar.barStart);
        const barEndEpoch = Date.parse(bar.barEnd || bar.barStart);
        if (barStartEpoch < startEpoch || barEndEpoch > endEpoch) continue;
        if (barEndEpoch > Date.parse(cutoffAt)) continue;
        const result = RLSESSION.classifySessionObservation(bar, session, cutoffAt, source);
        if (result.ok) observations.push(result.value);
    }
    return observations;
}

function officialCloseAnchor(bars, priorSession, source) {
    if (!priorSession || !priorSession.officialRegularCloseAt) return null;
    const target = priorSession.officialRegularCloseAt;
    const bar = bars.find((candidate) => (candidate.barEnd || '') === target &&
        Date.parse(candidate.barStart) >= Date.parse(priorSession.regular.startUtc));
    if (!bar) return null;
    return {
        contractVersion: 'official-regular-close-anchor/v1',
        tradingDate: priorSession.tradingDate,
        close: bar.close,
        at: target,
        priceBasis: 'provider-chart-basis',
        adjustmentState: bar.adjustmentState,
        sourceRef: RLCONTRACTS.occurrenceFingerprint('source-provenance', source)
    };
}

function candidateFromPriorSession(bars, session, sessionKind, cutoffAt, source, window) {
    const observations = classifyWindow(bars, session, sessionKind, cutoffAt, source).filter((observation) =>
        observation.bucketIndex >= window.startBucket && observation.bucketIndex <= window.endBucketInclusive);
    const byBucket = new Map();
    for (const observation of observations) byBucket.set(observation.bucketIndex, observation);
    const bucketVolumes = [];
    for (let index = window.startBucket; index <= window.endBucketInclusive; index += 1) {
        const observation = byBucket.get(index);
        if (!observation || observation.volume === null || !Number.isInteger(observation.volume)) return null;
        bucketVolumes.push({ bucketIndex: index, volume: observation.volume, volumeState: observation.volumeState });
    }
    const first = observations[0];
    if (!first) return null;
    const candidateIdentity = {
        contractVersion: 'comparable-session-candidate-identity/v1',
        tradingDate: session.tradingDate,
        sessionKind,
        comparisonBoundarySignature: session.sessionBoundarySignatures[sessionKind],
        bucketVolumes
    };
    return {
        contractVersion: 'comparable-session-candidate/v1',
        candidateId: RLCONTRACTS.occurrenceFingerprint('comparable-session-candidate', candidateIdentity),
        symbol: first.symbol,
        sessionKind,
        comparisonBoundarySignature: session.sessionBoundarySignatures[sessionKind],
        interval: 'PT5M',
        sourceId: first.sourceId,
        adapterVersion: first.adapterVersion,
        priceBasis: first.priceBasis,
        adjustmentState: 'compatible',
        startBucket: window.startBucket,
        endBucketInclusive: window.endBucketInclusive,
        tradingDate: session.tradingDate,
        sourceRef: first.sourceRef,
        bucketVolumes
    };
}

function loadCalendar(config) {
    const path = config.marketSessionEvidence.calendar.path;
    return JSON.parse(readFileSync(path, 'utf8'));
}

/* Orchestrate one symbol's session evidence graph. Returns a typed unavailable
 * result rather than a substituted value on any acquisition/composition gap. */
export async function acquireMarketSessionEvidence(config, options) {
    options = options || {};
    const policies = loadSourcePolicies(config);
    if (!policies.ok) return policies;
    const calendar = options.calendar || loadCalendar(config);
    const cutoffAt = canonicalTimestamp(options.cutoffAt);
    const sessionKind = options.sessionKind || 'pre-market';
    const symbol = options.symbol || (policies.evidenceConfig.symbols.required || [])[0];
    const providerSymbol = options.providerSymbol || symbol;
    const runId = options.runId || ('market-session-' + (options.tradingDate || 'run'));
    if (!cutoffAt) return fail('B002-INPUT-REJECTED', 'cutoff-required');

    const sessionResult = RLSESSION.loadCalendarSession(calendar, options.tradingDate, CUTOFF_POLICY);
    if (!sessionResult.ok) return fail('B002-CALENDAR', sessionResult.error.reason, { field: sessionResult.error.field });
    const session = sessionResult.value;

    const request = options.request || buildYahooRequest(providerSymbol, policies.requestPolicy);
    const acquired = await fetchYahooSessionSource(request, options.transport || nodeFetchTransport, policies, {
        symbol, providerSymbol, retrievedAt: options.retrievedAt, clock: options.clock, sleep: options.sleep, freshnessState: options.freshnessState
    });
    if (!acquired.ok) return acquired;
    const source = acquired.source;
    const bars = acquired.bars;

    const observations = classifyWindow(bars, session, sessionKind, cutoffAt, source);
    if (observations.length === 0) {
        return { ok: true, evidence: null, state: 'unavailable', reason: 'no-current-session-observations', source, session };
    }

    // Prior official close anchor from the preceding open calendar session.
    const priorTradingDate = calendar.rows
        .filter((row) => (row.dateState === 'regular' || row.dateState === 'early-close') && row.tradingDate < session.tradingDate)
        .map((row) => row.tradingDate)
        .pop();
    let priorSession = null;
    if (priorTradingDate) {
        const priorResult = RLSESSION.loadCalendarSession(calendar, priorTradingDate, CUTOFF_POLICY);
        if (priorResult.ok) priorSession = priorResult.value;
    }
    const anchor = officialCloseAnchor(bars, priorSession, source);

    const aggregateResult = RLSESSION.aggregateSession(observations, session, sessionKind, cutoffAt, anchor);
    if (!aggregateResult.ok) return fail('B002-AGGREGATE', aggregateResult.error.reason, { field: aggregateResult.error.field });
    const aggregate = aggregateResult.value;

    // A misaligned/disputed/stale/unavailable session cannot be a publishable benchmark; surface it as
    // truthful unavailability with the suppressed aggregate rather than fabricating a valid bundle.
    if (aggregate.state !== 'available' && aggregate.state !== 'partial') {
        return { ok: true, evidence: null, state: aggregate.state, reason: 'benchmark-not-comparable', aggregate, baseline: null, anchor, source, session, observationCount: observations.length };
    }

    const comparablePolicy = comparablePolicyFrom(policies.evidenceConfig.volumePolicy);
    let baseline = null;
    if (aggregate.latestCompletedBucket !== null &&
        (aggregate.volumeCompleteness === 'complete' || aggregate.volumeCompleteness === 'all-observed-zero') &&
        aggregate.adjustmentState === 'compatible') {
        const window = { sessionKind, startBucket: 0, endBucketInclusive: aggregate.latestCompletedBucket };
        const priorDates = calendar.rows
            .filter((row) => (row.dateState === 'regular' || row.dateState === 'early-close') && row.tradingDate < session.tradingDate)
            .map((row) => row.tradingDate)
            .reverse();
        const candidates = [];
        for (const priorDate of priorDates) {
            if (candidates.length >= comparablePolicy.candidateSessionCount) break;
            const priorResult = RLSESSION.loadCalendarSession(calendar, priorDate, CUTOFF_POLICY);
            if (!priorResult.ok) continue;
            const candidate = candidateFromPriorSession(bars, priorResult.value, sessionKind, cutoffAt, source, window);
            if (candidate) candidates.push(candidate);
        }
        if (candidates.length === comparablePolicy.candidateSessionCount) {
            const baselineResult = RLSESSION.buildComparableVolumeBaseline(aggregate, candidates, comparablePolicy);
            if (!baselineResult.ok) return fail('B002-COMPARABILITY', baselineResult.error.reason, { field: baselineResult.error.field });
            baseline = baselineResult.value;
        }
    }

    const requiredEvidence = {
        benchmark: { officialCloseAnchorState: 'available', required: true, state: aggregate.state, symbol: BUNDLE_POLICY.requiredBenchmarkSymbol },
        calendar: { required: true, state: 'available' },
        dueReports: []
    };
    const bundleInput = {
        contractVersion: 'market-session-evidence-input/v1',
        runId,
        cutoffAt,
        calendarSession: session,
        aggregates: [aggregate],
        baselines: baseline ? [baseline] : [],
        reports: [],
        reactions: [],
        requiredEvidence,
        closedDateProof: null,
        policy: BUNDLE_POLICY
    };
    const bundleResult = RLSESSION.buildMarketSessionEvidence(bundleInput);
    if (!bundleResult.ok) return fail('B002-BUNDLE', bundleResult.error.reason, { field: bundleResult.error.field });

    return {
        ok: true,
        evidence: bundleResult.value,
        aggregate,
        baseline,
        anchor,
        source,
        session,
        observationCount: observations.length,
        state: aggregate.state
    };
}
