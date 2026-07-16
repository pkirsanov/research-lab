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

function run(script, logName) {
    const result = spawnSync(process.execPath, ['--import', resolve(fixture, 'mock-fetch.mjs'), resolve(fixture, 'scripts', script)], {
        cwd: fixture,
        encoding: 'utf8',
        env: { ...process.env, BRIEF_WINDOW: 'morning', BAR_FETCH_CONCURRENCY: '4', OPTION_FETCH_CONCURRENCY: '2', MOCK_FETCH_LOG: resolve(fixture, logName) }
    });
    assert.equal(result.status, 0, `${script} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    return { output: result.stdout, log: JSON.parse(readFileSync(resolve(fixture, logName), 'utf8')) };
}

try {
    mkdirSync(resolve(fixture, 'scripts'), { recursive: true });
    copyFileSync(resolve(ROOT, 'scripts/fetch-bars.mjs'), resolve(fixture, 'scripts/fetch-bars.mjs'));
    copyFileSync(resolve(ROOT, 'scripts/fetch-options.mjs'), resolve(fixture, 'scripts/fetch-options.mjs'));

    writeJson('sector-universe.json', { entries: [], sectorMap: {} });
    writeJson('watchlist.json', { items: [] });
    writeJson('market-brief.config.json', { benchmarks: [], track: { indexes: [], sectors: [], groups: [] } });
    writeJson('etf-universe.json', { entries: [] });
    writeJson('fx-regime-universe.json', { currencies: [], broadDollarSeries: [], directPairs: [] });
    writeJson('global-rotation-universe.json', { entries: [], benchmarks: [] });
    writeJson('real-assets-universe.json', { entries: [], benchmarks: [] });
    writeJson('bond-regime-universe.json', { instruments: [] });
    writeJson('options-structure-universe.json', { entries: [{ id: 'SPY' }] });

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
  const values = timestamps.map((_, index) => 100 + index / 10);
  return { ok: true, status: 200, json: async () => ({ chart: { result: [{ timestamp: timestamps, indicators: { quote: [{ open: values, high: values, low: values, close: values, volume: timestamps.map(() => 1000) }], adjclose: [{ adjclose: values }] } }] } }) };
};
process.on('exit', () => writeFileSync(process.env.MOCK_FETCH_LOG, JSON.stringify({ calls, maxActive }) + '\\n'));
`);

    const firstBars = run('fetch-bars.mjs', 'first-bars.json');
    const firstBarCalls = firstBars.log.calls.filter((url) => url.includes('query1.finance.yahoo.com'));
    assert.equal(firstBarCalls.length, 8, 'the union fetches each built-in ticker exactly once');
    assert.ok(firstBars.log.maxActive > 1, 'ticker histories are fetched concurrently');

    const firstOptions = run('fetch-options.mjs', 'first-options.json');
    assert.equal(firstOptions.log.calls.filter((url) => url.includes('query1.finance.yahoo.com')).length, 0, 'options issue no duplicate Yahoo history request');
    assert.equal(firstOptions.log.calls.filter((url) => url.includes('cdn.cboe.com')).length, 1, 'one CBOE chain request is made');
    assert.equal(JSON.parse(readFileSync(resolve(fixture, 'data/options/SPY.json'), 'utf8')).bars.length, 260, 'options attach canonical SPY bars');

    const secondBars = run('fetch-bars.mjs', 'second-bars.json');
    const secondOptions = run('fetch-options.mjs', 'second-options.json');
    assert.equal(secondBars.log.calls.length, 0, 'a second machine reuses Git-cached bars for the same window');
    assert.equal(secondOptions.log.calls.length, 0, 'a second machine reuses Git-cached options for the same window');

    console.log('[brief-data-cache] PASS: one concurrent ticker pull feeds all tools and same-window Git cache is cross-machine reusable');
} finally {
    rmSync(fixture, { recursive: true, force: true });
}