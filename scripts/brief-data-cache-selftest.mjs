#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = mkdtempSync(resolve(tmpdir(), 'research-lab-cache-selftest-'));

function writeJson(path, value) {
    writeFileSync(resolve(fixture, path), JSON.stringify(value, null, 2) + '\n');
}

function run(script, logName, extraEnv = {}) {
    const result = spawnSync(process.execPath, ['--import', resolve(fixture, 'mock-fetch.mjs'), resolve(fixture, 'scripts', script)], {
        cwd: fixture,
        encoding: 'utf8',
        env: { ...process.env, BRIEF_WINDOW: 'morning', BAR_FETCH_CONCURRENCY: '4', OPTION_FETCH_CONCURRENCY: '2', MOCK_FETCH_LOG: resolve(fixture, logName), ...extraEnv }
    });
    assert.equal(result.status, 0, `${script} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    return { output: result.stdout, log: JSON.parse(readFileSync(resolve(fixture, logName), 'utf8')) };
}

try {
    mkdirSync(resolve(fixture, 'scripts'), { recursive: true });
    copyFileSync(resolve(ROOT, 'scripts/fetch-bars.mjs'), resolve(fixture, 'scripts/fetch-bars.mjs'));
    copyFileSync(resolve(ROOT, 'scripts/fetch-options.mjs'), resolve(fixture, 'scripts/fetch-options.mjs'));
    copyFileSync(resolve(ROOT, 'scripts/validate-brief-cache.mjs'), resolve(fixture, 'scripts/validate-brief-cache.mjs'));

    writeJson('sector-universe.json', { entries: [], sectorMap: {} });
    writeJson('watchlist.json', { items: [] });
    writeJson('market-brief.config.json', { benchmarks: [], track: { indexes: [], sectors: [], groups: [] } });
    writeJson('etf-universe.json', { entries: [] });
    writeJson('fx-regime-universe.json', { currencies: [], broadDollarSeries: [], directPairs: [] });
    writeJson('global-rotation-universe.json', { entries: [], benchmarks: [] });
    writeJson('real-assets-universe.json', { entries: [], benchmarks: [] });
    writeJson('bond-regime-universe.json', { instruments: [] });
    writeJson('options-structure-universe.json', { entries: [{ id: 'SPY' }, { id: 'SPX', alt: { yahoo: '^SPX' } }] });

    writeFileSync(resolve(fixture, 'mock-fetch.mjs'), `
import { writeFileSync } from 'node:fs';
let active = 0;
let maxActive = 0;
const calls = [];
const timestamps = Array.from({ length: 260 }, (_, index) => 1735689600 + index * 86400);
globalThis.fetch = async function mockFetch(url) {
  const target = String(url);
  calls.push(target);
  active += 1;
  maxActive = Math.max(maxActive, active);
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 15));
  active -= 1;
  if (target.includes('cdn.cboe.com')) {
    return { ok: true, status: 200, json: async () => ({ data: { current_price: 100, close: 100, last_trade_time: 'fixture', options: [{ option: 'SPY991231C00100000', iv: 0.2, open_interest: 10, volume: 4, bid: 1, ask: 1.2, last_trade_price: 1.1 }] } }) };
  }
    if (target.includes('interval=5m')) {
        const start = Date.parse(process.env.BAR_EXPECTED_SESSION_START_UTC) / 1000;
        const end = Date.parse(process.env.BAR_EXPECTED_SESSION_END_UTC) / 1000;
        const intradayTimestamps = Array.from({ length: Math.floor((end - start) / 300) }, (_, index) => start + index * 300);
        const values = intradayTimestamps.map((_, index) => process.env.MOCK_INTRADAY_ZERO === '1' ? null : 125 + index / 100);
        return { ok: true, status: 200, json: async () => ({ chart: { result: [{ meta: { tradingPeriods: [[{ start, end }]] }, timestamp: intradayTimestamps, indicators: { quote: [{ open: values, high: values.map((value) => value + 0.1), low: values.map((value) => value - 0.1), close: values, volume: intradayTimestamps.map(() => 100) }] }, events: {} }] } }) };
    }
  const values = timestamps.map((_, index) => 100 + index / 10);
    const dailyValues = process.env.MOCK_DAILY_GAP === '1' ? values.map((value, index) => index === values.length - 1 ? null : value) : values;
    const adjustedValues = process.env.MOCK_DIVIDEND === '1' ? dailyValues.map((value) => value == null ? null : value * 0.5) : dailyValues;
    const events = process.env.MOCK_DIVIDEND === '1' ? { dividends: { expected: { amount: 1, date: timestamps[timestamps.length - 1] } } } : {};
    return { ok: true, status: 200, json: async () => ({ chart: { result: [{ timestamp: timestamps, indicators: { quote: [{ open: dailyValues, high: dailyValues, low: dailyValues, close: dailyValues, volume: timestamps.map((_, index) => index === timestamps.length - 1 && process.env.MOCK_DAILY_GAP === '1' ? null : 1000) }], adjclose: [{ adjclose: adjustedValues }] }, events }] } }) };
};
process.on('exit', () => writeFileSync(process.env.MOCK_FETCH_LOG, JSON.stringify({ calls, maxActive }) + '\\n'));
`);

    const firstBars = run('fetch-bars.mjs', 'first-bars.json');
    const firstBarCalls = firstBars.log.calls.filter((url) => url.includes('query1.finance.yahoo.com'));
    assert.equal(firstBarCalls.length, 9, 'the union fetches each built-in ticker and the canonical index alias exactly once');
    assert.equal(firstBarCalls.some((url) => url.includes('%5ESPX')), true, 'SPX resolves through its canonical Yahoo ^SPX alias');
    assert.ok(firstBars.log.maxActive > 1, 'ticker histories are fetched concurrently');
    const barIndex = JSON.parse(readFileSync(resolve(fixture, 'data/bars/index.json'), 'utf8'));
    assert.equal(barIndex.expected, 9);
    assert.equal(barIndex.freshCount, 9, `all nine fixture bars are freshly fetched\n${firstBars.output}`);
    assert.equal(barIndex.carriedCount, 0);
    assert.deepEqual(barIndex.missing, []);
    assert.equal(barIndex.refreshWindow, 'morning');

    const firstOptions = run('fetch-options.mjs', 'first-options.json');
    assert.equal(firstOptions.log.calls.filter((url) => url.includes('query1.finance.yahoo.com')).length, 0, 'options issue no duplicate Yahoo history request');
    assert.equal(firstOptions.log.calls.filter((url) => url.includes('cdn.cboe.com')).length, 2, 'one CBOE chain request is made per option entry');
    assert.equal(JSON.parse(readFileSync(resolve(fixture, 'data/options/SPY.json'), 'utf8')).bars.length, 260, 'options attach canonical SPY bars');
    assert.equal(JSON.parse(readFileSync(resolve(fixture, 'data/options/SPX.json'), 'utf8')).bars.length, 260, 'options attach canonical ^SPX bars through the alias');
    const optionIndex = JSON.parse(readFileSync(resolve(fixture, 'data/options/index.json'), 'utf8'));
    assert.equal(optionIndex.expected, 2);
    assert.equal(optionIndex.freshCount, 2);
    assert.equal(optionIndex.carriedCount, 0);
    assert.deepEqual(optionIndex.missing, []);
    assert.equal(optionIndex.refreshWindow, 'morning');

    const secondBars = run('fetch-bars.mjs', 'second-bars.json');
    const secondOptions = run('fetch-options.mjs', 'second-options.json');
    assert.equal(secondBars.log.calls.length, 0, 'a second machine reuses Git-cached bars for the same window');
    assert.equal(secondOptions.log.calls.length, 0, 'a second machine reuses Git-cached options for the same window');

    rmSync(resolve(fixture, 'data/bars'), { recursive: true, force: true });
    const expectedSessionDate = '2025-09-17';
    const expectedSessionStart = expectedSessionDate + 'T13:30:00.000Z';
    const expectedSessionEnd = expectedSessionDate + 'T20:00:00.000Z';
    const strictEnv = {
        BRIEF_WINDOW: 'pre-close',
        BRIEF_REQUIRE_COMPLETE_RUN: '1',
        BAR_EXPECTED_SESSION_DATE: expectedSessionDate,
        BAR_EXPECTED_SESSION_START_UTC: expectedSessionStart,
        BAR_EXPECTED_SESSION_END_UTC: expectedSessionEnd,
        MOCK_DAILY_GAP: '1'
    };
    const repairedBars = run('fetch-bars.mjs', 'repaired-bars.json', strictEnv);
    assert.equal(repairedBars.log.calls.filter((url) => url.includes('interval=1d')).length, 9, 'strict refresh attempts every daily series once');
    assert.equal(repairedBars.log.calls.filter((url) => url.includes('interval=5m')).length, 9, 'a null completed daily row triggers one same-provider intraday repair per series');
    const repairedIndex = JSON.parse(readFileSync(resolve(fixture, 'data/bars/index.json'), 'utf8'));
    assert.equal(repairedIndex.expectedSessionDate, expectedSessionDate);
    assert.equal(repairedIndex.freshCount, 9);
    assert.equal(repairedIndex.reconstructedCount, 9);
    assert.equal(repairedIndex.sessionReuseCount, 0);
    assert.equal(repairedIndex.tickers.every((row) => row.asof === expectedSessionDate && row.reconstructed === true), true);
    const repairedSpy = JSON.parse(readFileSync(resolve(fixture, 'data/bars/SPY.json'), 'utf8'));
    assert.equal(repairedSpy.src, 'yahoo-daily+intraday-repair');
    assert.deepEqual(repairedSpy.reconstructedSessions, [expectedSessionDate]);
    assert.equal(repairedSpy.rows.at(-1).sourceBars, 78);
    assert.equal(new Date(repairedSpy.rows.at(-1).t).toISOString(), expectedSessionStart);
    assert.equal(repairedSpy.rows.at(-1).o, 125);
    assert.ok(Math.abs(repairedSpy.rows.at(-1).h - 125.87) < 1e-9);
    assert.ok(Math.abs(repairedSpy.rows.at(-1).l - 124.9) < 1e-9);
    assert.ok(Math.abs(repairedSpy.rows.at(-1).c - 125.77) < 1e-9);
    assert.equal(repairedSpy.rows.at(-1).v, 7800, 'intraday repair aggregates one official regular session without inventing price or volume');

    run('fetch-options.mjs', 'repaired-options.json', strictEnv);
    const strictValidation = spawnSync(process.execPath, [resolve(fixture, 'scripts/validate-brief-cache.mjs'), '--require-current-run'], {
        cwd: fixture,
        encoding: 'utf8',
        env: { ...process.env, ...strictEnv }
    });
    assert.equal(strictValidation.status, 0, `session-aware cache validation failed\nstdout:\n${strictValidation.stdout}\nstderr:\n${strictValidation.stderr}`);

    const reusedBars = run('fetch-bars.mjs', 'reused-session-bars.json', { ...strictEnv, BRIEF_WINDOW: 'after-hours', MOCK_DAILY_GAP: '0' });
    assert.equal(reusedBars.log.calls.length, 0, 'a later publication window reuses bars already complete for the same XNYS session');
    const reusedIndex = JSON.parse(readFileSync(resolve(fixture, 'data/bars/index.json'), 'utf8'));
    assert.equal(reusedIndex.sessionReuseCount, 9);
    assert.equal(reusedIndex.tickers.every((row) => row.sessionCached === true && row.asof === expectedSessionDate), true);

    const staleIndex = JSON.parse(readFileSync(resolve(fixture, 'data/bars/index.json'), 'utf8'));
    staleIndex.tickers.find((row) => row.sym === 'SPY').asof = '2025-09-16';
    writeJson('data/bars/index.json', staleIndex);
    const staleValidation = spawnSync(process.execPath, [resolve(fixture, 'scripts/validate-brief-cache.mjs'), '--require-current-run'], {
        cwd: fixture,
        encoding: 'utf8',
        env: { ...process.env, ...strictEnv, BRIEF_WINDOW: 'after-hours' }
    });
    assert.equal(staleValidation.status, 1, 'strict validation refuses a ticker receipt behind the last completed XNYS session');
    assert.match(staleValidation.stderr, /SPY observed receipt must equal completed XNYS session 2025-09-17/);

    rmSync(resolve(fixture, 'data/bars'), { recursive: true, force: true });
    const zeroObservedBars = run('fetch-bars.mjs', 'zero-observed-bars.json', { ...strictEnv, MOCK_INTRADAY_ZERO: '1' });
    assert.equal(zeroObservedBars.log.calls.filter((url) => url.includes('interval=5m')).length, 9);
    const zeroObservedIndex = JSON.parse(readFileSync(resolve(fixture, 'data/bars/index.json'), 'utf8'));
    assert.equal(zeroObservedIndex.freshCount, 9);
    assert.equal(zeroObservedIndex.carriedCount, 0);
    assert.equal(zeroObservedIndex.reconstructedCount, 0);
    assert.equal(zeroObservedIndex.zeroObservedCount, 9);
    assert.equal(zeroObservedIndex.tickers.every((row) => row.sessionState === 'zero-observed' && row.sessionDate === expectedSessionDate && row.asof === '2025-09-16'), true);
    const zeroObservedSpy = JSON.parse(readFileSync(resolve(fixture, 'data/bars/SPY.json'), 'utf8'));
    assert.equal(zeroObservedSpy.sessionState, 'zero-observed');
    assert.deepEqual(zeroObservedSpy.zeroObservedSessions, [expectedSessionDate]);
    assert.equal(zeroObservedSpy.rows.some((row) => new Date(row.t).toISOString().slice(0, 10) === expectedSessionDate), false, 'zero-observed session creates no synthetic zero-volume bar');
    const zeroValidation = spawnSync(process.execPath, [resolve(fixture, 'scripts/validate-brief-cache.mjs'), '--require-current-run'], {
        cwd: fixture,
        encoding: 'utf8',
        env: { ...process.env, ...strictEnv }
    });
    assert.equal(zeroValidation.status, 0, `zero-observed session validation failed\nstdout:\n${zeroValidation.stdout}\nstderr:\n${zeroValidation.stderr}`);

    rmSync(resolve(fixture, 'data/bars'), { recursive: true, force: true });
    const dividendBars = run('fetch-bars.mjs', 'dividend-bars.json', { ...strictEnv, MOCK_DIVIDEND: '1' });
    assert.equal(dividendBars.log.calls.filter((url) => url.includes('interval=5m')).length, 9);
    const dividendSpy = JSON.parse(readFileSync(resolve(fixture, 'data/bars/SPY.json'), 'utf8'));
    assert.equal(dividendSpy.sessionState, 'observed');
    assert.equal(dividendSpy.rows.at(-1).c, 125.77, 'dividend-date repair retains the raw post-event close instead of applying the prior adjusted-close factor');
    assert.equal(dividendSpy.rows.at(-2).c, 62.9, 'pre-dividend daily history keeps its adjusted-close basis');

    console.log('[brief-data-cache] PASS: completed sessions are observed, reconstructed, or explicitly zero-observed; dividends preserve basis; same-session cache is reusable');
} finally {
    rmSync(fixture, { recursive: true, force: true });
}