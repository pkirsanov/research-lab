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
 * BLS CPI report acquisition (Scope 03)
 *
 * The concrete CPI vertical. It acquires the official BLS release schedule and
 * the no-key BLS Public Data API v2 index observations through the exact reviewed
 * request/use policies, maps them into the Scope 01 `report-source-snapshot/v1`
 * and `report-schedule/v1` contracts (headline MoM SA from CUSR0000SA0, headline
 * YoY NSA from CUUR0000SA0, previous-period lineage), deterministically selects a
 * pre-release-locked `ReportConsensusArtifact/v1`, and produces released-report
 * evidence through the UNCHANGED Scope 01 `normalizeReleasedReport` primitive.
 * Scope 03 owns only this concrete mapping and call site; it never reimplements
 * the generic lifecycle, dispute, revision, or cutoff rules.
 * ------------------------------------------------------------------ */

export const BLS_ADAPTER_VERSION = 'bls-cpi-report-adapter/v1';
const BLS_SCHEDULE_HEADING = 'Schedule of Releases for the Consumer Price Index';
const CPI_METRIC_DEFINITIONS = Object.freeze([
    Object.freeze({ metricId: 'headline-mom-sa', unit: '%', seasonalBasis: 'seasonally-adjusted', transform: 'mom', seriesId: 'CUSR0000SA0', lag: 1 }),
    Object.freeze({ metricId: 'headline-yoy-nsa', unit: '%', seasonalBasis: 'not-seasonally-adjusted', transform: 'yoy', seriesId: 'CUUR0000SA0', lag: 12 })
]);
const MONTH_NUMBER = Object.freeze({
    january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
});

// UTC offset (ms) a zone had at a given absolute instant.
function zoneOffsetMs(timeZone, date) {
    const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const parts = {};
    for (const part of dtf.formatToParts(date)) parts[part.type] = part.value;
    const asUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
    return asUtc - date.getTime();
}

// Resolve a civil date + wall time in a named zone to a canonical UTC instant.
function zonedWallToUtc(year, month, day, hour, minute, timeZone) {
    const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
    const offset = zoneOffsetMs(timeZone, new Date(guess));
    return new Date(guess - offset).toISOString().replace(/\.\d{3}Z$/, '.000Z');
}

function shiftReportPeriod(reportPeriod, monthsBack) {
    const year = Number(reportPeriod.slice(0, 4));
    const month = Number(reportPeriod.slice(5, 7));
    const zeroBased = (year * 12 + (month - 1)) - monthsBack;
    const newYear = Math.floor(zeroBased / 12);
    const newMonth = (zeroBased % 12) + 1;
    return String(newYear).padStart(4, '0') + '-' + String(newMonth).padStart(2, '0');
}

export function buildBlsScheduleRequest(requestPolicy) {
    const entry = requestPolicy.sources['bls-cpi-schedule'];
    return { sourceId: 'bls-cpi-schedule', method: 'GET', url: 'https://' + entry.host + entry.pathname };
}

export function buildBlsApiRequest(requestPolicy, options) {
    options = options || {};
    const entry = requestPolicy.sources['bls-public-api-v2'];
    const series = options.series || ['CUSR0000SA0', 'CUUR0000SA0'];
    const startYear = String(options.startYear);
    const endYear = String(options.endYear);
    return {
        sourceId: 'bls-public-api-v2',
        method: 'POST',
        url: 'https://' + entry.host + entry.pathname,
        body: { seriesid: series.slice(), startyear: startYear, endyear: endYear }
    };
}

/* Parse the BLS CPI schedule HTML. Requires the exact heading and unique,
 * fully-parseable reference-month / release-date / 08:30-ET rows; any missing,
 * duplicate, or unparseable field fails closed with no inferred value. */
export function parseBlsScheduleHtml(bytes, options) {
    options = options || {};
    const timeZone = options.timeZone || 'America/New_York';
    const html = Buffer.isBuffer(bytes) ? bytes.toString('utf8') : String(bytes);
    if (!new RegExp('<h1[^>]*>\\s*' + BLS_SCHEDULE_HEADING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*</h1>').test(html)) {
        return fail('B002-REPORT-SCHEDULE', 'schedule-heading-missing');
    }
    const rowPattern = /<tr>\s*<td class="reference-month">([^<]+)<\/td>\s*<td class="release-date">([^<]+)<\/td>\s*<td class="release-time">([^<]+)<\/td>\s*<\/tr>/g;
    const rows = [];
    const seenPeriods = Object.create(null);
    let match;
    while ((match = rowPattern.exec(html)) !== null) {
        const referenceMonth = match[1].trim();
        const releaseDate = match[2].trim();
        const releaseTime = match[3].trim();
        const monthMatch = /^([A-Za-z]+)\s+(\d{4})$/.exec(referenceMonth);
        if (!monthMatch || !MONTH_NUMBER[monthMatch[1].toLowerCase()]) {
            return fail('B002-REPORT-SCHEDULE', 'schedule-reference-month-unparseable', { field: referenceMonth });
        }
        const reportPeriod = monthMatch[2] + '-' + MONTH_NUMBER[monthMatch[1].toLowerCase()];
        if (seenPeriods[reportPeriod]) return fail('B002-REPORT-SCHEDULE', 'schedule-duplicate-period', { field: reportPeriod });
        seenPeriods[reportPeriod] = true;
        const dateMatch = /^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/.exec(releaseDate);
        if (!dateMatch || !MONTH_NUMBER[dateMatch[1].toLowerCase()]) {
            return fail('B002-REPORT-SCHEDULE', 'schedule-release-date-unparseable', { field: releaseDate });
        }
        const timeMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)\s*ET$/i.exec(releaseTime);
        if (!timeMatch) return fail('B002-REPORT-SCHEDULE', 'schedule-release-time-unparseable', { field: releaseTime });
        let hour = Number(timeMatch[1]) % 12;
        if (timeMatch[3].toUpperCase() === 'PM') hour += 12;
        const scheduledAt = zonedWallToUtc(
            Number(dateMatch[3]), Number(MONTH_NUMBER[dateMatch[1].toLowerCase()]), Number(dateMatch[2]),
            hour, Number(timeMatch[2]), timeZone
        );
        rows.push({ referenceMonth, reportPeriod, releaseDate, releaseTime, scheduledAt });
    }
    if (rows.length === 0) return fail('B002-REPORT-SCHEDULE', 'schedule-no-rows');
    return { ok: true, rows };
}

export function buildReportSchedule(scheduleRow) {
    return {
        contractVersion: 'report-schedule/v1',
        reportId: 'report:bls-cpi:' + scheduleRow.reportPeriod,
        reportType: 'CPI',
        reportPeriod: scheduleRow.reportPeriod,
        scheduledAt: scheduleRow.scheduledAt,
        metricDefinitions: CPI_METRIC_DEFINITIONS.map((definition) => ({
            metricId: definition.metricId,
            unit: definition.unit,
            seasonalBasis: definition.seasonalBasis,
            transform: definition.transform
        }))
    };
}

/* Parse the no-key BLS Public Data API v2 response. Requires REQUEST_SUCCEEDED,
 * the exact requested series, valid M01-M12 periods, and finite index levels;
 * annual (M13), unknown series, or non-finite values fail closed. */
export function parseBlsApiResponse(bytes, seriesIds) {
    const requested = seriesIds || ['CUSR0000SA0', 'CUUR0000SA0'];
    let payload;
    try {
        payload = JSON.parse(Buffer.isBuffer(bytes) ? bytes.toString('utf8') : String(bytes));
    } catch (error) {
        return fail('B002-REPORT-SOURCE', 'bls-api-json-unparseable');
    }
    if (!payload || typeof payload !== 'object' || payload.status !== 'REQUEST_SUCCEEDED') {
        return fail('B002-REPORT-SOURCE', 'bls-api-status-not-succeeded', { status: payload && payload.status });
    }
    if (!payload.Results || !Array.isArray(payload.Results.series)) {
        return fail('B002-REPORT-SOURCE', 'bls-api-shape-invalid');
    }
    const returnedIds = payload.Results.series.map((entry) => entry && entry.seriesID);
    for (const id of returnedIds) {
        if (requested.indexOf(id) === -1) return fail('B002-REPORT-SOURCE', 'bls-api-unexpected-series', { field: id });
    }
    const series = Object.create(null);
    for (const id of requested) {
        const entry = payload.Results.series.find((candidate) => candidate && candidate.seriesID === id);
        if (!entry || !Array.isArray(entry.data)) return fail('B002-REPORT-SOURCE', 'bls-api-series-missing', { field: id });
        const levels = Object.create(null);
        for (const point of entry.data) {
            if (!point || typeof point !== 'object') return fail('B002-REPORT-SOURCE', 'bls-api-point-invalid', { field: id });
            const periodMatch = /^M(0[1-9]|1[0-2])$/.exec(point.period || '');
            if (!periodMatch || !/^\d{4}$/.test(point.year || '')) return fail('B002-REPORT-SOURCE', 'bls-api-period-invalid', { field: id + ':' + point.period });
            const value = Number(point.value);
            if (!Number.isFinite(value)) return fail('B002-REPORT-SOURCE', 'bls-api-value-invalid', { field: id + ':' + point.year + '-' + periodMatch[1] });
            const period = point.year + '-' + periodMatch[1];
            if (Object.prototype.hasOwnProperty.call(levels, period)) return fail('B002-REPORT-SOURCE', 'bls-api-duplicate-period', { field: id + ':' + period });
            levels[period] = value;
        }
        series[id] = levels;
    }
    return { ok: true, series };
}

function transformedMetric(definition, levels, reportPeriod) {
    const current = levels[reportPeriod];
    const priorPeriod = shiftReportPeriod(reportPeriod, definition.lag);
    const prior = levels[priorPeriod];
    if (!Number.isFinite(current) || !Number.isFinite(prior) || prior === 0) return null;
    return {
        metricId: definition.metricId,
        period: reportPeriod,
        value: 100 * (current / prior - 1),
        unit: definition.unit,
        seasonalBasis: definition.seasonalBasis,
        transform: definition.transform,
        rawLevel: current,
        priorRawLevel: prior
    };
}

/* Map one or more accepted BLS API observations to a `report-source-snapshot/v1`.
 * Each accepted source becomes one immutable source record carrying the target
 * actual (MoM SA + YoY NSA) and the preceding period's same transformed metric.
 * Multiple disagreeing sources are preserved verbatim (no averaging). */
export function mapBlsCpiSnapshot(sources, schedule, options) {
    options = options || {};
    const reportPeriod = schedule.reportPeriod;
    const previousPeriod = shiftReportPeriod(reportPeriod, 1);
    const sourceRecords = [];
    for (const entry of sources) {
        const levels = entry.series;
        const metrics = [];
        const previous = [];
        for (const definition of CPI_METRIC_DEFINITIONS) {
            const seriesLevels = levels[definition.seriesId] || {};
            const actual = transformedMetric(definition, seriesLevels, reportPeriod);
            if (actual) {
                metrics.push({
                    metricId: actual.metricId, period: actual.period, value: actual.value,
                    unit: actual.unit, seasonalBasis: actual.seasonalBasis, transform: actual.transform
                });
            }
            const prior = transformedMetric(definition, seriesLevels, previousPeriod);
            if (prior) {
                previous.push({
                    metricId: prior.metricId, period: prior.period, value: prior.value,
                    unit: prior.unit, seasonalBasis: prior.seasonalBasis, transform: prior.transform
                });
            }
        }
        const contentTag = (entry.source && entry.source.contentSha256 ? entry.source.contentSha256.slice(7, 19) : String(sourceRecords.length));
        sourceRecords.push({
            sourceRecordId: 'record:bls-cpi:' + reportPeriod + ':' + contentTag,
            sourceRef: entry.source,
            releasedAt: entry.releasedAt || schedule.scheduledAt,
            metrics,
            previous
        });
    }
    return {
        ok: true,
        snapshot: {
            contractVersion: 'report-source-snapshot/v1',
            reportId: schedule.reportId,
            reportPeriod,
            sourceRecords
        }
    };
}

/* Deterministically select the latest pre-release-locked consensus artifact for
 * this schedule: newest sourcePublishedAt, then capturedAt, then canonical
 * fingerprint, all strictly before scheduledAt. Two latest eligible artifacts
 * with unequal comparable values are a consensus dispute (no synthesized value);
 * earlier artifacts are retained as lineage. */
export function selectConsensusArtifact(artifacts, schedule) {
    const scheduledEpoch = Date.parse(schedule.scheduledAt);
    const eligible = (artifacts || []).filter((artifact) =>
        artifact && artifact.contractVersion === 'report-consensus-artifact/v1' &&
        artifact.reportId === schedule.reportId && artifact.reportPeriod === schedule.reportPeriod &&
        Date.parse(artifact.sourcePublishedAt) < scheduledEpoch &&
        Date.parse(artifact.capturedAt) < scheduledEpoch &&
        Date.parse(artifact.lockedAt) < scheduledEpoch);
    if (eligible.length === 0) return { ok: true, consensus: null, lineage: [], reason: 'consensus-unavailable' };
    const ordered = eligible.slice().sort((left, right) => {
        const byPublished = Date.parse(right.sourcePublishedAt) - Date.parse(left.sourcePublishedAt);
        if (byPublished !== 0) return byPublished;
        const byCaptured = Date.parse(right.capturedAt) - Date.parse(left.capturedAt);
        if (byCaptured !== 0) return byCaptured;
        return right.fingerprint < left.fingerprint ? -1 : (right.fingerprint > left.fingerprint ? 1 : 0);
    });
    const top = ordered[0];
    const tied = ordered.filter((artifact) =>
        artifact.sourcePublishedAt === top.sourcePublishedAt && artifact.capturedAt === top.capturedAt);
    if (tied.some((artifact) => artifact.value !== top.value)) {
        return { ok: true, consensus: null, lineage: ordered, reason: 'consensus-disputed' };
    }
    return { ok: true, consensus: top, lineage: ordered.slice(1) };
}

export async function fetchBlsCpiSchedule(request, transport, policies, options) {
    options = options || {};
    const acquisition = await fetchWithSourcePolicy(request, policies, transport, Object.assign({
        adapterId: 'bls-cpi-schedule', adapterVersion: BLS_ADAPTER_VERSION
    }, options));
    if (!acquisition.ok) return acquisition;
    const parsed = parseBlsScheduleHtml(acquisition.bytes, options);
    if (!parsed.ok) return parsed;
    return { ok: true, rows: parsed.rows, schedules: parsed.rows.map(buildReportSchedule), source: acquisition.provenance };
}

export async function fetchBlsCpiSource(request, transport, policies, options) {
    options = options || {};
    const acquisition = await fetchWithSourcePolicy(request, policies, transport, Object.assign({
        adapterId: 'bls-public-api-v2', adapterVersion: BLS_ADAPTER_VERSION
    }, options));
    if (!acquisition.ok) return acquisition;
    const parsed = parseBlsApiResponse(acquisition.bytes, options.series);
    if (!parsed.ok) return parsed;
    return { ok: true, series: parsed.series, source: acquisition.provenance };
}

/* Orchestrate one CPI report's evidence graph through the Scope 01 primitive.
 * A schedule/elapsed clock never becomes an actual; a missing/late/invalid
 * consensus never becomes a surprise; a changed accepted level appends a
 * revision without rewriting the original. */
export async function acquireReportEvidence(config, options) {
    options = options || {};
    const policies = loadSourcePolicies(config);
    if (!policies.ok) return policies;
    const reportKey = options.report || 'cpi';
    const reportConfig = (policies.evidenceConfig.reports || {})[reportKey];
    if (!reportConfig) return fail('B002-REPORT-CONFIG', 'report-config-missing', { field: reportKey });
    const cutoffAt = canonicalTimestamp(options.cutoffAt);
    if (!cutoffAt) return fail('B002-INPUT-REJECTED', 'cutoff-required');
    const reportPeriod = options.reportPeriod;
    if (!reportPeriod) return fail('B002-INPUT-REJECTED', 'report-period-required');
    const transport = options.transport || nodeFetchTransport;
    const acquireOptions = { retrievedAt: options.retrievedAt, clock: options.clock, sleep: options.sleep, freshnessState: options.freshnessState };

    const scheduleRequest = options.scheduleRequest || buildBlsScheduleRequest(policies.requestPolicy);
    const scheduleResult = await fetchBlsCpiSchedule(scheduleRequest, transport, policies, acquireOptions);
    if (!scheduleResult.ok) return scheduleResult;
    const schedule = scheduleResult.schedules.find((candidate) => candidate.reportPeriod === reportPeriod);
    if (!schedule) return fail('B002-REPORT-SCHEDULE', 'schedule-period-not-found', { field: reportPeriod });

    const year = Number(reportPeriod.slice(0, 4));
    const apiRequest = options.apiRequest || buildBlsApiRequest(policies.requestPolicy, {
        series: reportConfig.series, startYear: year - 1, endYear: year
    });
    const sources = [];
    const fetchCount = 1 + (options.additionalApiFetches || 0);
    for (let index = 0; index < fetchCount; index += 1) {
        const sourceResult = await fetchBlsCpiSource(apiRequest, transport, policies, Object.assign({ series: reportConfig.series }, acquireOptions));
        if (!sourceResult.ok) return sourceResult;
        sources.push({ series: sourceResult.series, source: sourceResult.source, releasedAt: options.releasedAt || schedule.scheduledAt });
    }

    const snapshotResult = mapBlsCpiSnapshot(sources, schedule, options);
    if (!snapshotResult.ok) return snapshotResult;

    const consensusSelection = selectConsensusArtifact(options.consensusArtifacts || [], schedule);
    const report = RLSESSION.normalizeReleasedReport(snapshotResult.snapshot, schedule, consensusSelection.consensus, options.previousEvidence || null, cutoffAt);
    if (!report.ok) return fail('B002-REPORT', report.error.reason, { field: report.error.field });
    return {
        ok: true,
        evidence: report.value,
        schedule,
        snapshot: snapshotResult.snapshot,
        consensus: consensusSelection.consensus,
        consensusLineage: consensusSelection.lineage,
        consensusReason: consensusSelection.reason || null,
        sources,
        source: sources[0].source,
        state: report.value.state
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

/* Scope 04: the exact reaction policy consumed by the unchanged Scope 01
 * joinEventMarketReaction primitive. strictPostRelease with the canonical
 * pre-market/regular/after-hours segment order; no configurable formula. */
const REACTION_POLICY = Object.freeze({
    contractVersion: 'reaction-policy/v1',
    interval: 'PT5M',
    strictPostRelease: true,
    segmentOrder: ['pre-market', 'regular', 'after-hours']
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

    // Cutoff-safe report reaction (Scope 04). When a released report for this run is supplied,
    // consume the UNCHANGED Scope 01 joinEventMarketReaction primitive over the same session
    // observations, and build each ReactionSegment/v1 comparable volume baseline through the
    // UNCHANGED buildComparableVolumeBaseline signature and the segment's exact non-zero window.
    // This is the concrete vertical call site; it is not a second join implementation.
    const reports = [];
    const reactions = [];
    const dueReports = [];
    const reactionBaselines = [];
    if (options.reactionReport) {
        const report = options.reactionReport;
        if (report.cutoffAt !== cutoffAt) return fail('B002-REACTION', 'reaction-report-cutoff-mismatch', { field: 'reactionReport.cutoffAt' });
        const reactionResult = RLSESSION.joinEventMarketReaction(report, observations, cutoffAt, REACTION_POLICY);
        if (!reactionResult.ok) return fail('B002-REACTION', reactionResult.error.reason, { field: reactionResult.error.field });
        const reaction = reactionResult.value;
        reports.push(report);
        reactions.push(reaction);
        dueReports.push({ reportId: report.reportId, required: true, state: report.state });
        const reactionPriorDates = calendar.rows
            .filter((row) => (row.dateState === 'regular' || row.dateState === 'early-close') && row.tradingDate < session.tradingDate)
            .map((row) => row.tradingDate)
            .reverse();
        for (const segment of reaction.segments) {
            const window = { sessionKind: segment.sessionKind, startBucket: segment.startBucket, endBucketInclusive: segment.endBucketInclusive };
            const segmentCandidates = [];
            for (const priorDate of reactionPriorDates) {
                if (segmentCandidates.length >= comparablePolicy.candidateSessionCount) break;
                const priorResult = RLSESSION.loadCalendarSession(calendar, priorDate, CUTOFF_POLICY);
                if (!priorResult.ok) continue;
                const candidate = candidateFromPriorSession(bars, priorResult.value, segment.sessionKind, cutoffAt, source, window);
                if (candidate) segmentCandidates.push(candidate);
            }
            if (segmentCandidates.length === comparablePolicy.candidateSessionCount) {
                const segmentBaselineResult = RLSESSION.buildComparableVolumeBaseline(segment, segmentCandidates, comparablePolicy);
                if (!segmentBaselineResult.ok) return fail('B002-COMPARABILITY', segmentBaselineResult.error.reason, { field: segmentBaselineResult.error.field });
                reactionBaselines.push(segmentBaselineResult.value);
            }
        }
    }

    const requiredEvidence = {
        benchmark: { officialCloseAnchorState: 'available', required: true, state: aggregate.state, symbol: BUNDLE_POLICY.requiredBenchmarkSymbol },
        calendar: { required: true, state: 'available' },
        dueReports
    };
    const bundleInput = {
        contractVersion: 'market-session-evidence-input/v1',
        runId,
        cutoffAt,
        calendarSession: session,
        aggregates: [aggregate],
        baselines: (baseline ? [baseline] : []).concat(reactionBaselines),
        reports,
        reactions,
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
        reaction: reactions[0] || null,
        report: reports[0] || null,
        reactionBaselines,
        anchor,
        source,
        session,
        observationCount: observations.length,
        state: aggregate.state
    };
}
