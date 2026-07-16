import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from './playwright-runtime.mjs';
import { ROOT, startStaticServer } from './provider-credentials.support.mjs';

const MODEL_CUTOFF = '2026-07-06';
const quoteEnvelope = JSON.parse(readFileSync(resolve(ROOT, 'data/options/MSFT.json'), 'utf8'));
const barsEnvelope = JSON.parse(readFileSync(resolve(ROOT, 'data/bars/MSFT.json'), 'utf8'));

let site;

test.beforeAll(async () => {
  site = await startStaticServer();
});

test.afterAll(async () => {
  if (site) await site.close();
});

function expectedDailyTechnicals(rows) {
  const closes = rows.map((row) => row.c);
  const close = closes.at(-1);
  const meanTail = (window) => closes.slice(-window).reduce((sum, value) => sum + value, 0) / window;
  const sma20 = meanTail(20);
  const sma50 = meanTail(50);
  const sma200 = meanTail(200);
  const high252 = Math.max(...closes.slice(-252));
  const stack = sma20 > sma50 && sma50 > sma200
    ? 'bull-stack'
    : sma20 < sma50 && sma50 < sma200
      ? 'bear-stack'
      : 'tangled';
  return {
    close,
    sma20,
    sma50,
    sma200,
    high252,
    stack,
    closeVsSma50Pct: (close / sma50 - 1) * 100,
    closeVsSma200Pct: (close / sma200 - 1) * 100,
    closeVsHigh252Pct: (close / high252 - 1) * 100
  };
}

test('Regression: SCN-009-001/002/005 cache-first market truth', async ({ page }) => {
  await page.addInitScript(() => {
    const probe = { firstPaint: null, putQuote: 0, putQuoteArgs: null, putBars: 0, putBarsArgs: null, reports: [] };
    Object.defineProperty(window, '__feature009SharedFailureProbe', { value: probe });
    document.addEventListener('DOMContentLoaded', () => {
      const state = window.MsftJulyModel?.runtime?.acceptedState;
      probe.firstPaint = {
        modelAsOf: state?.fundamentalModel?.asOf || null,
        quoteStatus: state?.quote?.status || null,
        quoteValue: state?.quote?.valueUsd ?? null,
        barsStatus: state?.dailyBars?.status || null,
        technicalClose: state?.technicals?.close ?? null
      };
    }, { once: true });

    let dataApi;
    Object.defineProperty(window, 'RLDATA', {
      configurable: true,
      get: () => dataApi,
      set: (value) => {
        dataApi = value;
        if (!value || typeof value !== 'object') return;
        value.putQuote = function () {
          probe.putQuote += 1;
          probe.putQuoteArgs = Array.from(arguments);
          throw new Error('Feature 009 forced shared quote write failure');
        };
        value.putBars = function () {
          probe.putBars += 1;
          probe.putBarsArgs = {
            symbol: arguments[0],
            interval: arguments[1],
            rowCount: Array.isArray(arguments[2]) ? arguments[2].length : null,
            sourceId: arguments[3]
          };
          throw new Error('Feature 009 forced shared bar write failure');
        };
      }
    });

    let appApi;
    Object.defineProperty(window, 'RLAPP', {
      configurable: true,
      get: () => appApi,
      set: (value) => {
        appApi = value;
        if (!value || typeof value !== 'object' || typeof value.report !== 'function') return;
        const report = value.report;
        value.report = function (resource, state, detail) {
          if (detail?.label === 'MSFT cached delayed quote' || detail?.label === 'MSFT daily adjusted bars') {
            probe.reports.push({ resource, state, detail: structuredClone(detail) });
            throw new Error('Feature 009 forced shared report failure');
          }
          return report.apply(this, arguments);
        };
      }
    });
  });

  const requests = [];
  page.on('request', (request) => {
    requests.push(request.url());
  });

  await page.goto(site.baseUrl + '/msft-july-print-model.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#asOfNote')).toContainText(MODEL_CUTOFF);
  const firstPaintText = await page.locator('body').innerText();
  expect(firstPaintText).not.toMatch(/\b(?:NaN|Infinity|undefined)\b/);

  const staticOrigin = new URL(site.baseUrl).origin;
  const hasProductionController = await page.evaluate(() => Boolean(window.MsftJulyModel));
  expect(hasProductionController, 'planned window.MsftJulyModel production controller must exist').toBe(true);

  const firstPaintState = await page.evaluate(() => structuredClone(window.__feature009SharedFailureProbe.firstPaint));
  expect(firstPaintState).toEqual({
    modelAsOf: MODEL_CUTOFF,
    quoteStatus: 'loading',
    quoteValue: null,
    barsStatus: 'loading',
    technicalClose: null
  });

  await expect.poll(() => page.evaluate(() => {
    const state = window.MsftJulyModel?.runtime?.acceptedState;
    return state?.marketStatus || null;
  })).toBe('complete');

  const providerRequests = requests.filter((url) => {
    const parsed = new URL(url);
    return /^https?:$/.test(parsed.protocol) && parsed.origin !== staticOrigin;
  });
  expect(providerRequests, 'complete cache-first boot must not issue a provider request').toEqual([]);

  const acceptedState = await page.evaluate(() => structuredClone(window.MsftJulyModel.runtime.acceptedState));
  const sharedFailureProbe = await page.evaluate(() => structuredClone(window.__feature009SharedFailureProbe));
  const expected = expectedDailyTechnicals(barsEnvelope.rows);
  const cachePaths = requests.map((url) => new URL(url).pathname);

  expect(cachePaths.filter((path) => path === '/data/options/MSFT.json')).toHaveLength(1);
  expect(cachePaths.filter((path) => path === '/data/bars/MSFT.json')).toHaveLength(1);
  expect(sharedFailureProbe.putQuote, 'accepted quote must attempt the isolated shared write').toBe(1);
  expect(sharedFailureProbe.putBars, 'accepted bars must attempt the isolated shared write').toBe(1);
  expect(sharedFailureProbe.putQuoteArgs, 'shared quote write must contain only the sanitized quote projection').toEqual(['MSFT', quoteEnvelope.spot, null, acceptedState.quote.sourceId]);
  expect(sharedFailureProbe.putBarsArgs, 'shared bar write must contain only validated daily rows and source identity').toEqual({
    symbol: 'MSFT',
    interval: '1d',
    rowCount: barsEnvelope.rows.length,
    sourceId: acceptedState.dailyBars.sourceId
  });
  const reports = Object.fromEntries(sharedFailureProbe.reports.map((entry) => [entry.resource, entry]));
  expect(Object.keys(reports).sort(), 'shared report failures must be isolated from accepted page truth').toEqual(['bars:msft', 'quotes:msft']);
  expect(Object.keys(reports['quotes:msft'].detail).sort(), 'quote report must exclude raw option-chain and credential fields').toEqual(['label', 'providerAsOf', 'retrievedAt', 'sharedWrite', 'sourceId']);
  expect(Object.keys(reports['bars:msft'].detail).sort(), 'bar report must expose only sanitized daily-series metadata').toEqual(['cutoff', 'label', 'retrievedAt', 'rowCount', 'sharedWrite', 'sourceId']);
  expect(reports['quotes:msft'].detail.sharedWrite).toBe('failed');
  expect(reports['bars:msft'].detail.sharedWrite).toBe('failed');
  expect(acceptedState.fundamentalModel.asOf).toBe(MODEL_CUTOFF);
  expect(acceptedState.quote.valueUsd).toBe(quoteEnvelope.spot);
  expect(acceptedState.quote.providerAsOf).toBe(quoteEnvelope.asof);
  expect(acceptedState.quote.retrievedAt).toBe(quoteEnvelope.fetched);
  expect(acceptedState.dailyBars.cutoff).toBe(barsEnvelope.asof);
  expect(acceptedState.dailyBars.retrievedAt).toBe(barsEnvelope.fetched);
  expect(acceptedState.dailyBars.rowCount).toBe(barsEnvelope.rows.length);

  const clocks = [
    acceptedState.fundamentalModel.asOf,
    acceptedState.quote.providerAsOf,
    acceptedState.quote.retrievedAt,
    acceptedState.dailyBars.cutoff,
    acceptedState.dailyBars.retrievedAt,
    acceptedState.evaluationTime
  ];
  expect(new Set(clocks).size).toBe(clocks.length);
  expect(acceptedState).not.toHaveProperty('data_as_of');

  expect(quoteEnvelope.spot).not.toBe(expected.close);
  expect(acceptedState.technicals.cutoff).toBe(barsEnvelope.asof);
  expect(acceptedState.technicals.close).toBeCloseTo(expected.close, 10);
  expect(acceptedState.technicals.sma20).toBeCloseTo(expected.sma20, 10);
  expect(acceptedState.technicals.sma50).toBeCloseTo(expected.sma50, 10);
  expect(acceptedState.technicals.sma200).toBeCloseTo(expected.sma200, 10);
  expect(acceptedState.technicals.high252).toBeCloseTo(expected.high252, 10);
  expect(acceptedState.technicals.stack).toBe(expected.stack);
  expect(acceptedState.technicals.closeVsSma50Pct).toBeCloseTo(expected.closeVsSma50Pct, 10);
  expect(acceptedState.technicals.closeVsSma200Pct).toBeCloseTo(expected.closeVsSma200Pct, 10);
  expect(acceptedState.technicals.closeVsHigh252Pct).toBeCloseTo(expected.closeVsHigh252Pct, 10);
  expect(acceptedState.technicals.close).not.toBe(acceptedState.quote.valueUsd);

  console.log(`[SCN-009-001] firstPaint=${firstPaintState.quoteStatus}/${firstPaintState.barsStatus} quote=${firstPaintState.quoteValue} technicalClose=${firstPaintState.technicalClose}`);
  console.log(`[SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=${providerRequests.length}`);
  console.log(`[SCN-009-001] sharedWriteFailures=quote:${sharedFailureProbe.putQuote},bars:${sharedFailureProbe.putBars} reportFailures=${sharedFailureProbe.reports.length}`);
  console.log(`[SCN-009-001] quoteReportKeys=${Object.keys(reports['quotes:msft'].detail).sort().join(',')}`);
  console.log(`[SCN-009-001] barsReportKeys=${Object.keys(reports['bars:msft'].detail).sort().join(',')}`);
  console.log(`[SCN-009-002] modelAsOf=${acceptedState.fundamentalModel.asOf}`);
  console.log(`[SCN-009-002] quoteProviderAsOf=${acceptedState.quote.providerAsOf} quoteRetrievedAt=${acceptedState.quote.retrievedAt}`);
  console.log(`[SCN-009-002] barsCutoff=${acceptedState.dailyBars.cutoff} barsRetrievedAt=${acceptedState.dailyBars.retrievedAt}`);
  console.log(`[SCN-009-002] uniqueClocks=${new Set(clocks).size} data_as_of=${Object.prototype.hasOwnProperty.call(acceptedState, 'data_as_of') ? 'present' : 'absent'}`);
  console.log(`[SCN-009-005] dailyRows=${acceptedState.dailyBars.rowCount} quote=${acceptedState.quote.valueUsd} dailyClose=${acceptedState.technicals.close}`);
  console.log('[SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly');
});
