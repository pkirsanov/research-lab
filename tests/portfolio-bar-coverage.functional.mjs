import assert from 'node:assert/strict';
import test from 'node:test';
import { createStorage, loadRldata } from './provider-credentials.support.mjs';

const SYMBOL = 'SCOPE19';
const START = '2021-07-15';
const END = '2026-07-15';
const TARGET = Object.freeze({
  contractVersion: 'BarCoverageTarget/v1',
  requestedStartDate: START,
  requestedEndDate: END,
  targetCalendarYears: 5,
  maximumAgeHours: 24,
  requiredCurrency: 'USD',
  requiredTransform: 'adjusted-close',
  requiredCorporateActionState: 'qualified-adjusted'
});
const SAME_ORIGIN = Object.freeze({
  contractVersion: 'BarCoverageSourcePolicy/v1',
  mode: 'same-origin-only',
  conflictPolicy: 'reject-date',
  publicProviderId: 'yahoo'
});
const PUBLIC_LOOKUP = Object.freeze({ ...SAME_ORIGIN, mode: 'allow-public-symbol-lookup' });

function row(date, close, adjustedClose = close) {
  return {
    t: Date.parse(`${date}T00:00:00.000Z`),
    o: close - 1,
    h: close + 1,
    l: close - 2,
    c: close,
    v: 1000,
    ac: adjustedClose
  };
}

function response(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload
  };
}

function yahooPayload(rows, currency = 'USD') {
  return {
    chart: {
      result: [{
        meta: { currency },
        timestamp: rows.map((entry) => Math.floor(entry.t / 1000)),
        indicators: {
          quote: [{
            open: rows.map((entry) => entry.o),
            high: rows.map((entry) => entry.h),
            low: rows.map((entry) => entry.l),
            close: rows.map((entry) => entry.c),
            volume: rows.map((entry) => entry.v)
          }],
          adjclose: [{ adjclose: rows.map((entry) => entry.ac) }]
        }
      }],
      error: null
    }
  };
}

function coverageRealm({ initialRows = [], staticRows = [], providerRows = [], staticCurrency = null } = {}) {
  const localStorage = createStorage();
  const requests = [];
  const fetch = async (input) => {
    const url = String(input);
    requests.push(url);
    if (url === `data/bars/${SYMBOL}.json`) {
      return response({
        sym: SYMBOL,
        interval: '1d',
        src: 'yahoo',
        currency: staticCurrency,
        rows: staticRows
      });
    }
    if (url.includes('query1.finance.yahoo.com/v8/finance/chart/')) {
      return response(yahooPayload(providerRows));
    }
    throw new Error(`unexpected request: ${url}`);
  };
  const realm = loadRldata({ localStorage, fetch });
  if (initialRows.length) realm.api.putBars(SYMBOL, '1d', initialRows, 'initial-cache');
  return { ...realm, requests };
}

function assertPublicRequestOnly(url) {
  const parsed = new URL(url);
  assert.equal(parsed.hostname, 'query1.finance.yahoo.com');
  assert.equal(parsed.pathname.endsWith(`/chart/${SYMBOL}`), true);
  assert.equal(parsed.searchParams.get('interval'), '1d');
  assert.equal(parsed.searchParams.get('period1'), String(Math.floor(Date.parse(`${START}T00:00:00.000Z`) / 1000)));
  assert.equal(parsed.searchParams.get('period2'), String(Math.floor(Date.parse('2026-07-16T00:00:00.000Z') / 1000)));
  assert.equal(parsed.searchParams.get('events'), 'history');
  const serialized = decodeURIComponent(url).toLowerCase();
  for (const forbidden of ['portfolio', 'quantity', 'value', 'cost', 'mandate', 'behavior', 'action', 'dossier']) {
    assert.equal(serialized.includes(forbidden), false, `${forbidden} must never enter the provider request`);
  }
}

test('SCN-008-045 same-origin append measures actual bounds and preserves partial truth without lookup', async () => {
  const initial = [row('2024-01-03', 103), row('2024-01-04', 104)];
  const staticRows = [row(START, 90), row('2024-01-03', 103), row('2025-07-15', 110)];
  const { api, requests } = coverageRealm({ initialRows: initial, staticRows });
  const beforeLegacyRows = JSON.stringify(api.bars(SYMBOL, '1d'));

  const pending = api.ensureBarCoverage(SYMBOL, '1d', TARGET, SAME_ORIGIN);
  assert.equal(typeof pending?.then, 'function', 'the four-argument contract is Promise-based');
  const result = await pending;

  assert.equal(result.contractVersion, 'BarCoverageResult/v1');
  assert.equal(result.state, 'partial');
  assert.equal(result.firstDate, START, 'same-origin rows append before coverage is measured');
  assert.equal(result.lastDate, '2025-07-15');
  assert.deepEqual(result.missingBounds, { start: false, end: true });
  assert.equal(result.requestState, 'not-permitted');
  assert.deepEqual(requests, [`data/bars/${SYMBOL}.json`], 'same-origin-only never reaches a provider');
  assert.equal(result.reasons.includes('required-end-missing'), true);
  assert.equal(result.reasons.includes('currency-undeclared'), true,
    'a static file with no currency cannot silently become USD');
  assert.equal(result.reasons.includes('transform-undeclared'), true,
    'an adjusted-close column is not a declaration of the transform contract');
  assert.equal(result.reasons.includes('corporate-action-undeclared'), true,
    'a static file with no corporate-action declaration cannot become qualified');
  assert.equal(result.rows.some((entry) => entry.date === START), true);
  assert.equal(result.sourceIds.includes('pages-snapshot'), true);
  assert.notEqual(JSON.stringify(api.bars(SYMBOL, '1d')), beforeLegacyRows,
    'eligible static dates are appended to the shared cache rather than only narrated');
});

test('SCN-008-045 approved public lookup requests only public range fields and completes qualified coverage', async () => {
  const staticRows = [row(START, 90)];
  const providerRows = [row(START, 90), row(END, 130)];
  const { api, requests } = coverageRealm({ staticRows, providerRows, staticCurrency: 'USD' });

  const result = await api.ensureBarCoverage(SYMBOL, '1d', TARGET, PUBLIC_LOOKUP);
  assert.equal(result.state, 'complete');
  assert.equal(result.firstDate, START);
  assert.equal(result.lastDate, END);
  assert.deepEqual(result.missingBounds, { start: false, end: false });
  assert.equal(result.currency, 'USD');
  assert.equal(result.transform, 'adjusted-close');
  assert.equal(result.corporateActionState, 'qualified-adjusted');
  assert.equal(result.requestState, 'completed');
  assert.equal(result.reasons.length, 0);
  assert.equal(result.rows.length, 2, 'same-date provider rows do not duplicate static rows');
  assert.equal(requests.length, 2, 'one static request and one provider request are issued');
  assertPublicRequestOnly(requests[1]);
});

test('SCN-008-045 conflicting same-date rows are disputed and cannot satisfy a requested bound', async () => {
  const initial = [row(START, 90)];
  const staticRows = [row(START, 999), row(END, 130)];
  const { api } = coverageRealm({ initialRows: initial, staticRows, staticCurrency: 'USD' });

  const result = await api.ensureBarCoverage(SYMBOL, '1d', TARGET, SAME_ORIGIN);
  assert.equal(result.state, 'partial');
  assert.deepEqual(result.disputedDates, [START]);
  assert.equal(result.eligibleDates.includes(START), false, 'a conflicting date is excluded rather than overwritten');
  assert.equal(result.reasons.includes('required-start-disputed'), true);
  assert.equal(result.rows.some((entry) => entry.date === END), true,
    'the non-conflicting static date remains available despite the dispute');
});

test('Adversarial: requested range labels and row counts cannot fake date coverage', async () => {
  const first = Date.parse('2022-01-01T00:00:00.000Z');
  const repeated = Array.from({ length: 1300 }, (_, index) =>
    row(new Date(first + index * 86400000).toISOString().slice(0, 10), 100 + index));
  const { api } = coverageRealm({ initialRows: repeated, staticRows: [], staticCurrency: 'USD' });

  const result = await api.ensureBarCoverage(SYMBOL, '1d', TARGET, SAME_ORIGIN);
  assert.equal(result.observedCount > 1000, true, 'the row-count alternative genuinely clears a large-count heuristic');
  assert.equal(result.target.requestedStartDate, START, 'the requested label is present and therefore cannot itself prove coverage');
  assert.equal(result.target.requestedEndDate, END);
  assert.notEqual(result.state, 'complete');
  assert.equal(result.firstDate, '2022-01-01');
  assert.equal(result.lastDate, '2025-07-23');
  assert.deepEqual(result.missingBounds, { start: true, end: true });
});

test('legacy ensureBars and three-argument coverage retain cache and Promise compatibility', async () => {
  const rows = [row('2026-07-14', 120), row('2026-07-15', 121)];
  const { api, localStorage } = coverageRealm({ initialRows: rows, staticRows: rows, staticCurrency: 'USD' });
  const before = localStorage.getItem('rlData');

  const legacyCoverage = api.ensureBarCoverage(SYMBOL, '1d', {
    mode: 'same-origin-only', requiredFirst: '2026-07-14', requiredLast: '2026-07-15'
  });
  assert.equal(typeof legacyCoverage?.then, 'undefined', 'the existing three-argument measurement remains synchronous');
  assert.equal(legacyCoverage.state, 'complete');
  assert.equal(localStorage.getItem('rlData'), before, 'the legacy measurement remains read-only');

  const legacyEnsure = api.ensureBars(SYMBOL, '1d', 24, '5y');
  assert.equal(typeof legacyEnsure?.then, 'function');
  assert.deepEqual(await legacyEnsure, rows);
  assert.deepEqual(api.bars(SYMBOL, '1d'), rows);
});

test('invalid target or source policy fails before cache mutation or any request', async () => {
  const { api, localStorage, requests } = coverageRealm({ initialRows: [row(START, 90)] });
  const before = localStorage.getItem('rlData');
  const invalidTarget = { ...TARGET, targetCalendarYears: 4 };
  const invalidSource = { ...PUBLIC_LOOKUP, quantity: 10 };

  const targetResult = await api.ensureBarCoverage(SYMBOL, '1d', invalidTarget, SAME_ORIGIN);
  assert.equal(targetResult.state, 'unavailable');
  assert.equal(targetResult.reasons.includes('target-range-year-mismatch'), true);

  const sourceResult = await api.ensureBarCoverage(SYMBOL, '1d', TARGET, invalidSource);
  assert.equal(sourceResult.state, 'unavailable');
  assert.equal(sourceResult.reasons.includes('source-policy-unknown-field'), true);
  assert.equal(localStorage.getItem('rlData'), before);
  assert.deepEqual(requests, []);
});
