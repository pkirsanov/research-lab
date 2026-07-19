/*
 * session-fixture-builder.mjs — Feature 002, Scope 02 captured-response fixture
 * builder. Deterministically constructs Yahoo v8 chart responses shaped EXACTLY
 * like the real `includePrePost=true` five-minute payload, so external-boundary
 * contract tests never depend on a live network fetch (the market is closed on
 * weekends and no captured live pre/post data is available). Given the committed
 * XNYS calendar it emits parallel timestamp/OHLCV arrays for the current session,
 * a bounded set of prior same-kind sessions (comparable-volume lookback), and the
 * prior regular-close bar (official-close anchor).
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const RLSESSION = require('../../../../rlsession.js');

const FIVE_MINUTES_MS = 300000;
const CUTOFF_POLICY = {
    contractVersion: 'cutoff-policy/v1',
    interval: 'PT5M',
    boundaryPolicyVersion: 'xnys-session-boundaries/v1',
    requireNextOpenTradingDate: true
};

export function loadCalendar(path) {
    return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
}

function priorTradingDates(calendar, tradingDate, count) {
    return calendar.rows
        .filter((row) => (row.dateState === 'regular' || row.dateState === 'early-close') && row.tradingDate < tradingDate)
        .map((row) => row.tradingDate)
        .slice(-count);
}

/*
 * options:
 *   calendar          committed XNYS calendar object
 *   tradingDate       current session date (default 2026-07-14)
 *   sessionKind       'pre-market' | 'regular' | 'after-hours' (default 'pre-market')
 *   bucketCount       completed buckets in current + each prior session (default 6)
 *   priorSessionCount prior same-kind sessions to emit (default 20)
 *   currentVolumes    per-bucket volumes for the CURRENT session (default constant)
 *   priorVolume       per-bucket volume for prior sessions (default constant)
 *   missingVolumeBucket  bucket index in the current session emitted with volume:null
 *   anchorClose       prior regular-close price for the official-close anchor (default 100)
 *   splitEvent        optional { date, numerator, denominator } to embed in events.splits
 */
export function buildYahooChartResponse(options = {}) {
    const calendar = options.calendar;
    const tradingDate = options.tradingDate || '2026-07-14';
    const sessionKind = options.sessionKind || 'pre-market';
    const bucketCount = options.bucketCount || 6;
    const priorSessionCount = options.priorSessionCount === undefined ? 20 : options.priorSessionCount;
    const priorVolume = options.priorVolume || 1000;
    const anchorClose = options.anchorClose || 100;

    const session = RLSESSION.loadCalendarSession(calendar, tradingDate, CUTOFF_POLICY);
    if (!session.ok) throw new Error('fixture-builder: current session invalid ' + JSON.stringify(session.error));
    const windowKey = sessionKind === 'pre-market' ? 'preMarket' : (sessionKind === 'after-hours' ? 'afterHours' : 'regular');

    const rows = [];

    const pushSessionBars = (calendarSession, volumes) => {
        const start = Date.parse(calendarSession[windowKey].startUtc);
        for (let bucket = 0; bucket < bucketCount; bucket += 1) {
            const barStartMs = start + bucket * FIVE_MINUTES_MS;
            const price = 100 + bucket * 0.1;
            rows.push({
                ts: Math.floor(barStartMs / 1000),
                open: price,
                high: price + 0.5,
                low: price - 0.5,
                close: price + 0.2,
                volume: volumes[bucket]
            });
        }
    };

    // Prior same-kind sessions (comparable-volume lookback).
    for (const priorDate of priorTradingDates(calendar, tradingDate, priorSessionCount)) {
        const priorSession = RLSESSION.loadCalendarSession(calendar, priorDate, CUTOFF_POLICY);
        if (!priorSession.ok) continue;
        pushSessionBars(priorSession.value, Array.from({ length: bucketCount }, () => priorVolume));
    }

    // Prior regular-close bar for the official-close anchor.
    const priorDate = priorTradingDates(calendar, tradingDate, 1)[0];
    if (priorDate) {
        const priorSession = RLSESSION.loadCalendarSession(calendar, priorDate, CUTOFF_POLICY).value;
        const closeEndMs = Date.parse(priorSession.regular.endUtc);
        rows.push({
            ts: Math.floor((closeEndMs - FIVE_MINUTES_MS) / 1000),
            open: anchorClose - 0.3,
            high: anchorClose + 0.4,
            low: anchorClose - 0.5,
            close: anchorClose,
            volume: 5000
        });
    }

    // Current session bars.
    const currentVolumes = options.currentVolumes || Array.from({ length: bucketCount }, () => 1500);
    if (options.missingVolumeBucket !== undefined) currentVolumes[options.missingVolumeBucket] = null;
    pushSessionBars(session.value, currentVolumes);

    // Sort by timestamp ascending (Yahoo returns ordered arrays).
    rows.sort((left, right) => left.ts - right.ts);

    const events = {};
    if (options.splitEvent) {
        const key = String(options.splitEvent.epochSeconds || Math.floor(Date.parse(options.splitEvent.date + 'T13:30:00.000Z') / 1000));
        events.splits = {
            [key]: {
                date: options.splitEvent.epochSeconds || Math.floor(Date.parse(options.splitEvent.date + 'T13:30:00.000Z') / 1000),
                numerator: options.splitEvent.numerator,
                denominator: options.splitEvent.denominator,
                splitRatio: options.splitEvent.numerator + ':' + options.splitEvent.denominator
            }
        };
    }

    return {
        chart: {
            result: [{
                meta: {
                    currency: 'USD',
                    symbol: options.providerSymbol || 'SPY',
                    exchangeName: 'PCX',
                    instrumentType: 'ETF',
                    gmtoffset: -14400,
                    timezone: 'EDT',
                    exchangeTimezoneName: 'America/New_York',
                    dataGranularity: '5m',
                    range: '1mo',
                    includePrePost: true
                },
                timestamp: rows.map((row) => row.ts),
                indicators: {
                    quote: [{
                        open: rows.map((row) => row.open),
                        high: rows.map((row) => row.high),
                        low: rows.map((row) => row.low),
                        close: rows.map((row) => row.close),
                        volume: rows.map((row) => row.volume)
                    }],
                    adjclose: [{ adjclose: rows.map((row) => row.close) }]
                },
                events
            }],
            error: null
        }
    };
}

export function encodeResponse(response) {
    return Buffer.from(JSON.stringify(response), 'utf8');
}

// A transport that replays fixed captured bytes (no network) for tests.
export function capturedTransport(bytes, overrides = {}) {
    return async () => Object.assign({
        status: 200,
        ok: true,
        redirected: false,
        finalUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/SPY',
        contentType: 'application/json; charset=utf-8',
        bytes: Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes)
    }, overrides);
}
