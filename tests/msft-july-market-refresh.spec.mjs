import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from './playwright-runtime.mjs';
import { ROOT, startStaticServer } from './provider-credentials.support.mjs';

const MODEL_CUTOFF = '2026-07-06';
const quoteEnvelope = JSON.parse(readFileSync(resolve(ROOT, 'data/options/MSFT.json'), 'utf8'));
const barsEnvelope = JSON.parse(readFileSync(resolve(ROOT, 'data/bars/MSFT.json'), 'utf8'));
const CACHE_EVALUATION_TIME = new Date(Math.max(Date.parse(quoteEnvelope.fetched), Date.parse(barsEnvelope.fetched)) + 60000).toISOString();

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
  await page.clock.setFixedTime(CACHE_EVALUATION_TIME);
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

test('Regression: SCN-009-006/007/008 degraded resources stay isolated', async ({ page }) => {
  await page.clock.setFixedTime(CACHE_EVALUATION_TIME);
  const requests = [];
  page.on('request', (request) => {
    requests.push(request.url());
  });

  await page.goto(site.baseUrl + '/msft-july-print-model.html', { waitUntil: 'domcontentloaded' });
  const staticOrigin = new URL(site.baseUrl).origin;

  const hasReducerOperation = await page.evaluate(() => typeof window.MsftJulyModel?.applyResourceOutcome === 'function');
  expect(hasReducerOperation, 'planned window.MsftJulyModel.applyResourceOutcome production reducer must exist').toBe(true);

  await expect.poll(() => page.evaluate(() => window.MsftJulyModel?.runtime?.acceptedState?.marketStatus || null)).toBe('complete');

  const expected = expectedDailyTechnicals(barsEnvelope.rows);
  const staleEvaluationTime = new Date(Date.parse(barsEnvelope.fetched) + 90000000).toISOString();

  // SCN-009-006: the quote resource fails while daily bars stay valid.
  const quoteMissing = await page.evaluate(() => structuredClone(
    window.MsftJulyModel.applyResourceOutcome({ resource: 'quote', outcome: 'missing', reasonCode: 'MSFT-QUOTE-HTTP' })
  ));
  expect(quoteMissing.marketStatus).toBe('partial');
  expect(quoteMissing.quote.status).toBe('unavailable');
  expect(quoteMissing.quote.valueUsd).toBeNull();
  expect(quoteMissing.quote.reasonCode).toBe('MSFT-QUOTE-HTTP');
  expect(quoteMissing.quote.limitation).toBe('Delayed quote request failed');
  expect(quoteMissing.dailyBars.rowCount).toBe(barsEnvelope.rows.length);
  expect(quoteMissing.technicals.cutoff).toBe(barsEnvelope.asof);
  expect(quoteMissing.technicals.close).toBeCloseTo(expected.close, 10);
  const bodyAfterQuoteMissing = await page.locator('body').innerText();
  expect(bodyAfterQuoteMissing).not.toMatch(/\b(?:NaN|Infinity|390\.49)\b/);

  // Restore the accepted quote from the real committed cache (no interception).
  await page.evaluate((env) => window.MsftJulyModel.applyResourceOutcome({ resource: 'quote', envelope: env }), quoteEnvelope);

  // SCN-009-007: the daily-bar resource fails while the quote stays valid.
  const barsMissing = await page.evaluate(() => structuredClone(
    window.MsftJulyModel.applyResourceOutcome({ resource: 'bars', outcome: 'missing', reasonCode: 'MSFT-BARS-HTTP' })
  ));
  expect(barsMissing.marketStatus).toBe('partial');
  expect(barsMissing.quote.valueUsd).toBe(quoteEnvelope.spot);
  expect(barsMissing.quote.providerAsOf).toBe(quoteEnvelope.asof);
  expect(barsMissing.dailyBars.status).toBe('unavailable');
  expect(barsMissing.dailyBars.rowCount).toBe(0);
  expect(barsMissing.dailyBars.limitation).toBe('Daily bars request failed');
  expect(barsMissing.technicals.status).toBe('unavailable');
  expect(barsMissing.technicals.close).toBeNull();
  expect(barsMissing.technicals.sma50).toBeNull();
  expect(barsMissing.technicals.stack).toBeNull();
  expect(Object.keys(barsMissing.technicals.unavailableReasons).sort()).toEqual(['close', 'high252', 'sma20', 'sma200', 'sma50']);

  // Restore accepted bars from the real committed cache.
  await page.evaluate((env) => window.MsftJulyModel.applyResourceOutcome({ resource: 'bars', envelope: env }), barsEnvelope);

  // SCN-009-008: a stale quote and a malformed bars candidate stay isolated.
  const staleQuoteState = await page.evaluate((args) => structuredClone(
    window.MsftJulyModel.applyResourceOutcome({ resource: 'quote', envelope: args.env, evaluationTime: args.evaluationTime })
  ), { env: quoteEnvelope, evaluationTime: staleEvaluationTime });
  expect(staleQuoteState.quote.status).toBe('stale');
  expect(staleQuoteState.quote.providerAsOf).toBe(quoteEnvelope.asof);
  expect(staleQuoteState.quote.retrievedAt).toBe(quoteEnvelope.fetched);

  const malformedBars = { ...barsEnvelope, sym: 'NOT-MSFT' };
  const isolatedState = await page.evaluate((env) => structuredClone(
    window.MsftJulyModel.applyResourceOutcome({ resource: 'bars', envelope: env })
  ), malformedBars);
  expect(isolatedState.quote.status).toBe('stale');
  expect(isolatedState.quote.valueUsd).toBe(quoteEnvelope.spot);
  expect(isolatedState.quote.providerAsOf).toBe(quoteEnvelope.asof);
  expect(isolatedState.quote.retrievedAt).toBe(quoteEnvelope.fetched);
  expect(isolatedState.dailyBars.status).toBe('rejected');
  expect(isolatedState.dailyBars.reasonCode).toBe('MSFT-BARS-SYMBOL');
  expect(isolatedState.dailyBars.limitation).toBe('Daily bars symbol did not match MSFT');
  expect(isolatedState.marketStatus).toBe('partial');

  const providerRequests = requests.filter((url) => {
    const parsed = new URL(url);
    return /^https?:$/.test(parsed.protocol) && parsed.origin !== staticOrigin;
  });
  expect(providerRequests, 'degraded-state reducers must not issue a provider request').toEqual([]);

  console.log(`[SCN-009-006] quoteMissing marketStatus=${quoteMissing.marketStatus} quote.status=${quoteMissing.quote.status} quote.valueUsd=${quoteMissing.quote.valueUsd}`);
  console.log(`[SCN-009-006] quote.reasonCode=${quoteMissing.quote.reasonCode} quote.limitation="${quoteMissing.quote.limitation}" bars.rowCount=${quoteMissing.dailyBars.rowCount} technicals.cutoff=${quoteMissing.technicals.cutoff}`);
  console.log(`[SCN-009-007] barsMissing marketStatus=${barsMissing.marketStatus} quote.valueUsd=${barsMissing.quote.valueUsd} bars.status=${barsMissing.dailyBars.status} bars.limitation="${barsMissing.dailyBars.limitation}"`);
  console.log(`[SCN-009-007] technicals.status=${barsMissing.technicals.status} technicals.stack=${barsMissing.technicals.stack} unavailableReasons=${Object.keys(barsMissing.technicals.unavailableReasons).sort().join(',')}`);
  console.log(`[SCN-009-008] staleQuote status=${staleQuoteState.quote.status} providerAsOf=${staleQuoteState.quote.providerAsOf} retrievedAt=${staleQuoteState.quote.retrievedAt}`);
  console.log(`[SCN-009-008] isolated quote.status=${isolatedState.quote.status} quote.valueUsd=${isolatedState.quote.valueUsd} bars.status=${isolatedState.dailyBars.status} bars.reasonCode=${isolatedState.dailyBars.reasonCode}`);
  console.log(`[SCN-009-008] isolated bars.limitation="${isolatedState.dailyBars.limitation}" marketStatus=${isolatedState.marketStatus}`);
  console.log(`[SCN-009-006/007/008] providerRequests=${providerRequests.length} interception=none`);
});

test('Regression: SCN-009-003/004/010 market outcomes preserve the scenario', async ({ page }) => {
  await page.clock.setFixedTime(CACHE_EVALUATION_TIME);

  // Seed a shared Options-Structure-Lab MSFT snapshot. The pre-Scope-3 autoImpliedMove side effect would
  // overwrite the user-owned implied-move input from this snapshot; Scope 3 keeps impMove user-owned, so the
  // HTML default must survive while the options IV evidence for risk-neutral odds is still captured.
  await page.addInitScript(() => {
    try {
      localStorage.setItem('optSnaps', JSON.stringify({ MSFT: { '2026-07-01': { emPct: 0.09, atmIV: 0.30, skew: -0.02 } } }));
    } catch (error) { /* ignore seeding failure */ }
  });

  const requests = [];
  page.on('request', (request) => {
    requests.push(request.url());
  });

  await page.goto(site.baseUrl + '/msft-july-print-model.html', { waitUntil: 'domcontentloaded' });
  const staticOrigin = new URL(site.baseUrl).origin;

  // Planned Scope 3 public production operations must exist.
  const controllerSurface = await page.evaluate(() => ({
    applyRefreshOutcome: typeof window.MsftJulyModel?.applyRefreshOutcome === 'function',
    readValuation: typeof window.MsftJulyModel?.readValuation === 'function',
    snapshotScenarioInputs: typeof window.MsftJulyModel?.snapshotScenarioInputs === 'function'
  }));
  expect(controllerSurface, 'planned Scope 3 window.MsftJulyModel refresh/valuation/snapshot operations must exist').toEqual({
    applyRefreshOutcome: true,
    readValuation: true,
    snapshotScenarioInputs: true
  });

  await expect.poll(() => page.evaluate(() => window.MsftJulyModel?.runtime?.acceptedState?.marketStatus || null)).toBe('complete');

  // SCN-009-004 (part 1): the removed autoImpliedMove cache write leaves the user-owned implied move at its HTML
  // default even though a snapshot is present, while the options IV evidence is still captured for risk-neutral odds.
  const afterBootImpMove = await page.evaluate(() => document.getElementById('impMove').value);
  const optEvidence = await page.evaluate(() => (window.__msftOpt ? { atmIV: window.__msftOpt.atmIV, day: window.__msftOpt.day } : null));
  expect(afterBootImpMove, 'autoImpliedMove must not overwrite the user-owned implied-move input').toBe('5.5');
  expect(optEvidence, 'options IV evidence must still be captured for risk-neutral odds').toEqual({ atmIV: 0.30, day: '2026-07-01' });

  // The user edits Q4 revenue, FY27 incremental depreciation, the selected scenario P/E, and the implied move.
  const edits = { q4Revenue: 84, deltaDep: 30, fwdPE: 26, impMove: 8.5 };
  await page.evaluate((values) => {
    function fire(el) { el.dispatchEvent(new Event('input', { bubbles: true })); }
    const q4 = document.getElementById('q4Revenue'); q4.value = String(values.q4Revenue); fire(q4);
    const im = document.getElementById('impMove'); im.value = String(values.impMove); fire(im);
    const depR = document.getElementById('deltaDep_r'); depR.value = String(values.deltaDep); fire(depR);
    const peR = document.getElementById('fwdPE_r'); peR.value = String(values.fwdPE); fire(peR);
  }, edits);

  const editedInputs = await page.evaluate(() => window.MsftJulyModel.snapshotScenarioInputs());
  expect(editedInputs.q4Revenue).toBe('84');
  expect(editedInputs.deltaDep).toBe('30');
  expect(editedInputs.fwdPE).toBe('26');
  expect(editedInputs.impMove).toBe('8.5');

  const valuationBefore = await page.evaluate(() => window.MsftJulyModel.readValuation());
  const bootAccepted = await page.evaluate(() => structuredClone(window.MsftJulyModel.runtime.acceptedState));
  const priceVsBefore = await page.locator('#o_pricevs').innerText();

  // SCN-009-003: a newer accepted delayed spot reprices ONLY the spot-relative comparisons.
  const newerSpot = quoteEnvelope.spot * 1.03;
  const newerEnvelope = { ...quoteEnvelope, spot: newerSpot };
  const acceptedNewer = await page.evaluate((envelope) => structuredClone(
    window.MsftJulyModel.applyRefreshOutcome({ resource: 'quote', envelope, requestSeq: 2 })
  ), newerEnvelope);
  expect(acceptedNewer.quote.valueUsd).toBeCloseTo(newerSpot, 10);
  expect(acceptedNewer.quote.requestSeq).toBe(2);

  const valuationAfterAccept = await page.evaluate(() => window.MsftJulyModel.readValuation());
  const inputsAfterAccept = await page.evaluate(() => window.MsftJulyModel.snapshotScenarioInputs());
  const priceVsAfter = await page.locator('#o_pricevs').innerText();

  // Model-only outputs and the selected P/E are unchanged; the spot-relative multiple reprices; inputs and bars are untouched.
  expect(valuationAfterAccept.modeledFy27Eps).toBeCloseTo(valuationBefore.modeledFy27Eps, 10);
  expect(valuationAfterAccept.selectedScenarioPe).toBe(valuationBefore.selectedScenarioPe);
  expect(valuationAfterAccept.selectedScenarioPe).toBe(26);
  expect(valuationAfterAccept.spotOverModeledFy27Eps).toBeCloseTo(newerSpot / valuationAfterAccept.modeledFy27Eps, 9);
  expect(valuationAfterAccept.spotOverModeledFy27Eps).not.toBeCloseTo(valuationBefore.spotOverModeledFy27Eps, 6);
  expect(valuationAfterAccept.marketMultipleBasis).toBe('model-relative-not-consensus');
  expect(valuationAfterAccept.spotOverModeledFy27Eps).not.toBe(valuationAfterAccept.selectedScenarioPe);
  expect(inputsAfterAccept).toEqual(editedInputs);
  expect(acceptedNewer.dailyBars.cutoff).toBe(bootAccepted.dailyBars.cutoff);
  expect(acceptedNewer.dailyBars.rowCount).toBe(bootAccepted.dailyBars.rowCount);
  expect(acceptedNewer.fundamentalModel.asOf).toBe(MODEL_CUTOFF);
  expect(priceVsAfter).not.toBe(priceVsBefore);

  // SCN-009-010 (older/out-of-order): an older refresh candidate never replaces the newer accepted spot.
  const olderEnvelope = { ...quoteEnvelope, spot: quoteEnvelope.spot * 0.9 };
  const afterOlder = await page.evaluate((envelope) => structuredClone(
    window.MsftJulyModel.applyRefreshOutcome({ resource: 'quote', envelope, requestSeq: 1 })
  ), olderEnvelope);
  expect(afterOlder.quote.valueUsd).toBeCloseTo(newerSpot, 10);
  expect(afterOlder.quote.requestSeq).toBe(2);

  // SCN-009-010 (failed refresh): failure is recorded without clearing the accepted quote or its clocks.
  const afterFailure = await page.evaluate(() => structuredClone(
    window.MsftJulyModel.applyRefreshOutcome({ resource: 'quote', outcome: 'refresh-failed', reasonCode: 'MSFT-QUOTE-HTTP' })
  ));
  expect(afterFailure.quote.valueUsd).toBeCloseTo(newerSpot, 10);
  expect(afterFailure.quote.providerAsOf).toBe(quoteEnvelope.asof);
  expect(afterFailure.quote.retrievedAt).toBe(quoteEnvelope.fetched);
  expect(afterFailure.quote.requestSeq).toBe(2);
  expect(afterFailure.quote.reasonCode).toBe('MSFT-QUOTE-HTTP');
  expect(afterFailure.dailyBars.cutoff).toBe(bootAccepted.dailyBars.cutoff);
  expect(afterFailure.dailyBars.rowCount).toBe(bootAccepted.dailyBars.rowCount);
  expect(afterFailure.fundamentalModel.asOf).toBe(MODEL_CUTOFF);

  // SCN-009-004 (part 2): every user-owned scenario input survives accepted, failed, and late-old outcomes.
  const inputsFinal = await page.evaluate(() => window.MsftJulyModel.snapshotScenarioInputs());
  expect(inputsFinal).toEqual(editedInputs);
  expect(inputsFinal.impMove).toBe('8.5');
  expect(inputsFinal.fwdPE).toBe('26');

  const providerRequests = requests.filter((url) => {
    const parsed = new URL(url);
    return /^https?:$/.test(parsed.protocol) && parsed.origin !== staticOrigin;
  });
  expect(providerRequests, 'market-outcome integrity must not issue a provider request').toEqual([]);

  console.log(`[SCN-009-004] afterBootImpMove=${afterBootImpMove} optEvidenceAtmIV=${optEvidence.atmIV} day=${optEvidence.day}`);
  console.log(`[SCN-009-004] editedInputs q4Revenue=${editedInputs.q4Revenue} deltaDep=${editedInputs.deltaDep} fwdPE=${editedInputs.fwdPE} impMove=${editedInputs.impMove}`);
  console.log(`[SCN-009-003] spotOverEps before=${valuationBefore.spotOverModeledFy27Eps} after=${valuationAfterAccept.spotOverModeledFy27Eps} selectedPe=${valuationAfterAccept.selectedScenarioPe} basis=${valuationAfterAccept.marketMultipleBasis}`);
  console.log(`[SCN-009-003] modeledEps before=${valuationBefore.modeledFy27Eps} after=${valuationAfterAccept.modeledFy27Eps} inputsUnchanged=${JSON.stringify(inputsAfterAccept) === JSON.stringify(editedInputs)}`);
  console.log(`[SCN-009-003] o_pricevs before="${priceVsBefore}" after="${priceVsAfter}"`);
  console.log(`[SCN-009-010] newerSpot=${newerSpot.toFixed(4)} afterOlder.value=${afterOlder.quote.valueUsd} afterOlder.seq=${afterOlder.quote.requestSeq}`);
  console.log(`[SCN-009-010] afterFailure value=${afterFailure.quote.valueUsd} providerAsOf=${afterFailure.quote.providerAsOf} reasonCode=${afterFailure.quote.reasonCode}`);
  console.log(`[SCN-009-004] inputsFinal impMove=${inputsFinal.impMove} fwdPE=${inputsFinal.fwdPE} allSurvived=${JSON.stringify(inputsFinal) === JSON.stringify(editedInputs)}`);
  console.log(`[SCN-009-003/004/010] providerRequests=${providerRequests.length} interception=none`);
});

test('Regression: SCN-009-009/011/012 one state drives modes refresh and export', async ({ page }) => {
  await page.clock.setFixedTime(CACHE_EVALUATION_TIME);
  const requests = [];
  page.on('request', (request) => {
    requests.push(request.url());
  });

  await page.goto(site.baseUrl + '/msft-july-print-model.html', { waitUntil: 'domcontentloaded' });
  const staticOrigin = new URL(site.baseUrl).origin;

  // Planned Scope 4 one-state mode + export surface must exist.
  const surface = await page.evaluate(() => ({
    modeSeg: Boolean(document.getElementById('modeSeg')),
    simpleTab: Boolean(document.getElementById('simpleTab')),
    powerTab: Boolean(document.getElementById('powerTab')),
    simpleView: Boolean(document.getElementById('simpleView')),
    powerView: Boolean(document.getElementById('powerView')),
    setMode: typeof window.MsftJulyModel?.setMode === 'function',
    displayMode: typeof window.MsftJulyModel?.displayMode === 'string',
    buildCsvSnapshot: typeof window.MsftJulyModel?.buildCsvSnapshot === 'function'
  }));
  expect(surface, 'planned Scope 4 one-state mode + export surface must exist').toEqual({
    modeSeg: true, simpleTab: true, powerTab: true, simpleView: true, powerView: true,
    setMode: true, displayMode: true, buildCsvSnapshot: true
  });

  await expect.poll(() => page.evaluate(() => window.MsftJulyModel?.runtime?.acceptedState?.marketStatus || null)).toBe('complete');
  await expect.poll(() => page.evaluate(() => typeof window.RLDATA?.credentialStatus === 'function')).toBe(true);

  // ---- SCN-009-011: Simple is the first-use default; one accepted state drives both modes. ----
  const beforeMode = await page.evaluate(() => ({
    displayMode: window.MsftJulyModel.displayMode,
    bodyPower: document.body.classList.contains('power'),
    simpleSelected: document.getElementById('simpleTab').getAttribute('aria-selected'),
    powerSelected: document.getElementById('powerTab').getAttribute('aria-selected'),
    simpleHidden: document.getElementById('simpleView').hidden,
    powerHidden: document.getElementById('powerView').hidden,
    powerInert: document.getElementById('powerView').hasAttribute('inert')
  }));
  expect(beforeMode, 'Simple is the first-use default with an inactive, inert Power view').toEqual({
    displayMode: 'simple', bodyPower: false, simpleSelected: 'true', powerSelected: 'false',
    simpleHidden: false, powerHidden: true, powerInert: true
  });

  const acceptedSpot = await page.evaluate(() => window.MsftJulyModel.runtime.acceptedState.quote.valueUsd);
  const inputsBeforeSwitch = await page.evaluate(() => window.MsftJulyModel.snapshotScenarioInputs());
  const csvSimple = await page.evaluate(() => window.MsftJulyModel.buildCsvSnapshot());
  const simpleMap = Object.fromEntries(csvSimple);

  // Switch Simple -> Power by pointer.
  await page.locator('#powerTab').click();
  const afterPointer = await page.evaluate(() => ({
    displayMode: window.MsftJulyModel.displayMode,
    bodyPower: document.body.classList.contains('power'),
    powerSelected: document.getElementById('powerTab').getAttribute('aria-selected'),
    simpleHidden: document.getElementById('simpleView').hidden,
    simpleInert: document.getElementById('simpleView').hasAttribute('inert'),
    powerHidden: document.getElementById('powerView').hidden
  }));
  expect(afterPointer, 'pointer activation shows Power and leaves the Simple view inert').toEqual({
    displayMode: 'power', bodyPower: true, powerSelected: 'true', simpleHidden: true, simpleInert: true, powerHidden: false
  });

  // The same accepted state drives both modes: spot, valuation, and clocks match; no scenario mutation.
  const csvPower = await page.evaluate(() => window.MsftJulyModel.buildCsvSnapshot());
  const powerMap = Object.fromEntries(csvPower);
  expect(powerMap.quote_value_usd).toBe(simpleMap.quote_value_usd);
  expect(powerMap.quote_value_usd).toBe(String(acceptedSpot));
  expect(powerMap.spot_over_modeled_fy27_eps).toBe(simpleMap.spot_over_modeled_fy27_eps);
  expect(powerMap.daily_bars_cutoff).toBe(simpleMap.daily_bars_cutoff);
  expect(powerMap.evaluation_time).toBe(simpleMap.evaluation_time);
  expect(simpleMap.display_mode).toBe('simple');
  expect(powerMap.display_mode).toBe('power');
  const inputsAfterSwitch = await page.evaluate(() => window.MsftJulyModel.snapshotScenarioInputs());
  expect(inputsAfterSwitch, 'mode switch must not mutate any scenario input').toEqual(inputsBeforeSwitch);

  // Switch Power -> Simple by keyboard (roving tablist, automatic activation).
  await page.locator('#powerTab').focus();
  await page.keyboard.press('ArrowLeft');
  const afterKeyboard = await page.evaluate(() => ({
    displayMode: window.MsftJulyModel.displayMode,
    bodyPower: document.body.classList.contains('power'),
    simpleSelected: document.getElementById('simpleTab').getAttribute('aria-selected'),
    focused: document.activeElement ? document.activeElement.id : null
  }));
  expect(afterKeyboard, 'keyboard activation returns to Simple and keeps focus on the selected tab').toEqual({
    displayMode: 'simple', bodyPower: false, simpleSelected: 'true', focused: 'simpleTab'
  });

  // ---- SCN-009-012: CSV reconstructs the accepted state; schema v1; no data_as_of. ----
  expect(csvPower[0]).toEqual(['schema_version', 'msft-july-market-refresh/v1']);
  expect(powerMap).not.toHaveProperty('data_as_of');
  expect(csvPower.every(([field]) => field !== 'data_as_of' && field !== 'spot_price')).toBe(true);
  expect(powerMap.tool_id).toBe('msft-july-print-model');
  expect(powerMap.model_as_of).toBe(MODEL_CUTOFF);
  expect(powerMap.market_status).toBe('complete');
  expect(powerMap.quote_value_usd).toBe(String(quoteEnvelope.spot));
  expect(powerMap.daily_bars_row_count).toBe(String(barsEnvelope.rows.length));
  const expectedTech = expectedDailyTechnicals(barsEnvelope.rows);
  expect(Number(powerMap.daily_close_usd)).toBeCloseTo(expectedTech.close, 10);
  expect(powerMap.exported_at, 'export carries a distinct ISO export timestamp').toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  expect(powerMap.exported_at).not.toBe('');
  for (const localized of ['quote_value_usd', 'daily_close_usd', 'spot_over_modeled_fy27_eps', 'fy27_eps_usd']) {
    expect(String(powerMap[localized]), `${localized} is a raw finite value`).not.toMatch(/[$,%]/);
  }

  // ---- SCN-009-009: central optional refresh preserves cache truth. ----
  const centralState = await page.evaluate(() => window.RLDATA.credentialStatus('finnhub').state);
  const acceptedBeforeRefresh = await page.evaluate(() => structuredClone(window.MsftJulyModel.runtime.acceptedState));
  await page.locator('#btnLive').click();
  await expect.poll(() => page.evaluate(() => document.getElementById('liveStatus').innerHTML)).toContain('index.html#data-settings');
  const liveStatusText = await page.evaluate(() => document.getElementById('liveStatus').innerHTML);
  const acceptedAfterRefresh = await page.evaluate(() => structuredClone(window.MsftJulyModel.runtime.acceptedState));
  expect(acceptedAfterRefresh.quote.valueUsd, 'refusal preserves the cache-backed accepted quote').toBe(acceptedBeforeRefresh.quote.valueUsd);
  expect(acceptedAfterRefresh.quote.providerAsOf).toBe(acceptedBeforeRefresh.quote.providerAsOf);
  expect(acceptedAfterRefresh.marketStatus).toBe(acceptedBeforeRefresh.marketStatus);
  expect(liveStatusText.toLowerCase()).toMatch(/central|disabled|not configured|data settings/);
  expect(liveStatusText).toContain('index.html#data-settings');
  expect(liveStatusText, 'no direct provider host or tokenized URL is exposed').not.toMatch(/finnhub\.io|token=|apikey|api_key/i);

  // Force an 'unconfigured' central policy report to prove the settings-link branch.
  const forcedUnconfigured = await page.evaluate(() => {
    try {
      const original = window.RLDATA.credentialStatus;
      window.RLDATA.credentialStatus = (id) => id === 'finnhub'
        ? { ok: true, providerId: 'finnhub', state: 'unconfigured', lifetime: 'current-document-memory', reasonCode: null }
        : original.call(window.RLDATA, id);
      return window.RLDATA.credentialStatus('finnhub').state === 'unconfigured';
    } catch (error) { return false; }
  });
  expect(forcedUnconfigured, 'the shared credential API is mutable for the unconfigured simulation').toBe(true);
  await page.locator('#btnLive').click();
  const unconfiguredStatus = await page.evaluate(() => document.getElementById('liveStatus').innerHTML);
  expect(unconfiguredStatus).toContain('index.html#data-settings');
  const acceptedAfterUnconfigured = await page.evaluate(() => window.MsftJulyModel.runtime.acceptedState.quote.valueUsd);
  expect(acceptedAfterUnconfigured).toBe(acceptedBeforeRefresh.quote.valueUsd);

  // No page-local credential input or storage ever appears.
  const credentialInputs = await page.evaluate(() => document.querySelectorAll('input[data-provider], input[type="password"], #fhKey, #msftFhKey').length);
  expect(credentialInputs).toBe(0);

  const providerRequests = requests.filter((url) => {
    const parsed = new URL(url);
    return /^https?:$/.test(parsed.protocol) && parsed.origin !== staticOrigin;
  });
  expect(providerRequests, 'one-state mode/refresh/export flow must not issue a provider request').toEqual([]);

  console.log(`[SCN-009-011] before=${JSON.stringify(beforeMode)}`);
  console.log(`[SCN-009-011] afterPointer displayMode=${afterPointer.displayMode} bodyPower=${afterPointer.bodyPower} simpleHidden=${afterPointer.simpleHidden} simpleInert=${afterPointer.simpleInert}`);
  console.log(`[SCN-009-011] afterKeyboard displayMode=${afterKeyboard.displayMode} focused=${afterKeyboard.focused}`);
  console.log(`[SCN-009-011] acceptedSpot=${acceptedSpot} simpleSpot=${simpleMap.quote_value_usd} powerSpot=${powerMap.quote_value_usd} inputsUnchanged=${JSON.stringify(inputsAfterSwitch) === JSON.stringify(inputsBeforeSwitch)}`);
  console.log(`[SCN-009-012] schema=${csvPower[0][1]} data_as_of=${Object.prototype.hasOwnProperty.call(powerMap, 'data_as_of') ? 'present' : 'absent'} rowCount=${csvPower.length}`);
  console.log(`[SCN-009-012] quote_value_usd=${powerMap.quote_value_usd} daily_bars_row_count=${powerMap.daily_bars_row_count} exported_at=${powerMap.exported_at}`);
  console.log(`[SCN-009-009] centralState=${centralState} statusHasSettingsLink=${liveStatusText.includes('index.html#data-settings')} acceptedSpotPreserved=${acceptedAfterRefresh.quote.valueUsd === acceptedBeforeRefresh.quote.valueUsd}`);
  console.log(`[SCN-009-009/011/012] providerRequests=${providerRequests.length} interception=none`);
});

test('Regression: SCN-009-011 viewport accessibility and canvas matrix', async ({ page }, testInfo) => {
  await page.clock.setFixedTime(CACHE_EVALUATION_TIME);
  const requests = [];
  page.on('request', (request) => {
    requests.push(request.url());
  });

  await page.goto(site.baseUrl + '/msft-july-print-model.html', { waitUntil: 'domcontentloaded' });
  const staticOrigin = new URL(site.baseUrl).origin;

  const hasModeSurface = await page.evaluate(() =>
    Boolean(document.getElementById('modeSeg')) &&
    Boolean(document.getElementById('simpleView')) &&
    Boolean(document.getElementById('powerView')) &&
    typeof window.MsftJulyModel?.setMode === 'function');
  expect(hasModeSurface, 'planned Scope 4 mode tablist and views must exist').toBe(true);

  await expect.poll(() => page.evaluate(() => window.MsftJulyModel?.runtime?.acceptedState?.marketStatus || null)).toBe('complete');

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 1000 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-320', width: 320, height: 800 }
  ];

  const overflow = {};
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    const semantics = await page.evaluate(() => {
      const seg = document.getElementById('modeSeg');
      const simpleTab = document.getElementById('simpleTab');
      const powerTab = document.getElementById('powerTab');
      return {
        tablist: seg.getAttribute('role'),
        tabs: [simpleTab.getAttribute('role'), powerTab.getAttribute('role')],
        controls: [simpleTab.getAttribute('aria-controls'), powerTab.getAttribute('aria-controls')]
      };
    });
    expect(semantics).toEqual({ tablist: 'tablist', tabs: ['tab', 'tab'], controls: ['simpleView', 'powerView'] });

    // Simple: the inactive Power view is hidden + inert; no body horizontal overflow.
    await page.evaluate(() => window.MsftJulyModel.setMode('simple'));
    const simpleLayout = await page.evaluate(() => ({
      bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      powerHidden: document.getElementById('powerView').hidden,
      powerInert: document.getElementById('powerView').hasAttribute('inert'),
      simpleHidden: document.getElementById('simpleView').hidden
    }));
    expect(simpleLayout.powerHidden).toBe(true);
    expect(simpleLayout.powerInert).toBe(true);
    expect(simpleLayout.simpleHidden).toBe(false);
    expect(simpleLayout.bodyOverflow, `no body horizontal overflow at ${viewport.name} (simple)`).toBeLessThanOrEqual(1);

    // Power: the inactive Simple view is hidden + inert; no body horizontal overflow.
    await page.evaluate(() => window.MsftJulyModel.setMode('power'));
    const powerLayout = await page.evaluate(() => ({
      bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      simpleHidden: document.getElementById('simpleView').hidden,
      simpleInert: document.getElementById('simpleView').hasAttribute('inert'),
      powerHidden: document.getElementById('powerView').hidden
    }));
    expect(powerLayout.simpleHidden).toBe(true);
    expect(powerLayout.simpleInert).toBe(true);
    expect(powerLayout.powerHidden).toBe(false);
    expect(powerLayout.bodyOverflow, `no body horizontal overflow at ${viewport.name} (power)`).toBeLessThanOrEqual(1);

    overflow[viewport.name] = { simple: simpleLayout.bodyOverflow, power: powerLayout.bodyOverflow };

    // Power canvases draw nonblank content.
    const canvasPixels = await page.evaluate(() => {
      const ids = ['cMargin', 'cBridge', 'cTornado'];
      return ids.map((id) => {
        const cv = document.getElementById(id);
        if (!cv || !cv.getContext) return { id, nonblank: false, width: 0 };
        const ctx = cv.getContext('2d');
        const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
        let nonblank = 0;
        for (let index = 3; index < data.length; index += 4) {
          if (data[index] !== 0) { nonblank += 1; if (nonblank > 50) break; }
        }
        return { id, nonblank: nonblank > 50, width: cv.width };
      });
    });
    for (const canvas of canvasPixels) {
      expect(canvas.width, `${canvas.id} has positive width at ${viewport.name}`).toBeGreaterThan(0);
      expect(canvas.nonblank, `${canvas.id} draws nonblank pixels at ${viewport.name}`).toBe(true);
    }

    // Accessible names: tabs are named; range sliders and canvases carry aria-labels.
    const labels = await page.evaluate(() => {
      const ranges = Array.from(document.querySelectorAll('input[type=range]'));
      const canvases = Array.from(document.querySelectorAll('canvas'));
      return {
        tabsNamed: ['simpleTab', 'powerTab'].every((id) => (document.getElementById(id).textContent || '').trim().length > 0),
        rangesLabeled: ranges.length > 0 && ranges.every((el) => (el.getAttribute('aria-label') || '').length > 0),
        canvasesLabeled: canvases.length > 0 && canvases.every((el) => (el.getAttribute('aria-label') || '').length > 0)
      };
    });
    expect(labels).toEqual({ tabsNamed: true, rangesLabeled: true, canvasesLabeled: true });

    // Screenshots: complete Simple + complete Power for this viewport (saved under the gitignored test-results dir).
    await page.evaluate(() => window.MsftJulyModel.setMode('simple'));
    const simpleShot = await page.screenshot({ path: testInfo.outputPath(`msft-scope4-${viewport.name}-simple.png`) });
    expect(simpleShot.length).toBeGreaterThan(1000);
    await page.evaluate(() => window.MsftJulyModel.setMode('power'));
    const powerShot = await page.screenshot({ path: testInfo.outputPath(`msft-scope4-${viewport.name}-power.png`) });
    expect(powerShot.length).toBeGreaterThan(1000);
  }

  // Keyboard cycling: ArrowRight/ArrowLeft/Home/End move + activate; focus stays on the selected tab.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.MsftJulyModel.setMode('simple'));
  await page.locator('#simpleTab').focus();
  await page.keyboard.press('ArrowRight');
  const afterRight = await page.evaluate(() => ({ mode: window.MsftJulyModel.displayMode, focused: document.activeElement ? document.activeElement.id : null }));
  expect(afterRight).toEqual({ mode: 'power', focused: 'powerTab' });
  await page.keyboard.press('ArrowLeft');
  const afterLeft = await page.evaluate(() => ({ mode: window.MsftJulyModel.displayMode, focused: document.activeElement ? document.activeElement.id : null }));
  expect(afterLeft).toEqual({ mode: 'simple', focused: 'simpleTab' });
  await page.keyboard.press('End');
  expect(await page.evaluate(() => document.activeElement ? document.activeElement.id : null)).toBe('powerTab');
  await page.keyboard.press('Home');
  expect(await page.evaluate(() => document.activeElement ? document.activeElement.id : null)).toBe('simpleTab');

  // Partial-state screenshots (desktop + mobile) after the quote resource is cleared; no NaN/Infinity/stale spot.
  await page.evaluate(() => window.MsftJulyModel.applyResourceOutcome({ resource: 'quote', outcome: 'missing', reasonCode: 'MSFT-QUOTE-HTTP' }));
  await page.evaluate(() => window.MsftJulyModel.setMode('simple'));
  const partialBodyText = await page.locator('body').innerText();
  expect(partialBodyText).not.toMatch(/\b(?:NaN|Infinity|390\.49)\b/);
  const partialDesktop = await page.screenshot({ path: testInfo.outputPath('msft-scope4-partial-desktop.png') });
  expect(partialDesktop.length).toBeGreaterThan(1000);
  await page.setViewportSize({ width: 390, height: 844 });
  const partialMobile = await page.screenshot({ path: testInfo.outputPath('msft-scope4-partial-mobile.png') });
  expect(partialMobile.length).toBeGreaterThan(1000);
  const partialOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(partialOverflow, 'no body overflow in the partial mobile state').toBeLessThanOrEqual(1);

  const providerRequests = requests.filter((url) => {
    const parsed = new URL(url);
    return /^https?:$/.test(parsed.protocol) && parsed.origin !== staticOrigin;
  });
  expect(providerRequests, 'viewport/a11y/canvas matrix must not issue a provider request').toEqual([]);

  console.log(`[SCN-009-011] overflow=${JSON.stringify(overflow)}`);
  console.log(`[SCN-009-011] keyboard afterRight=${afterRight.mode}/${afterRight.focused} afterLeft=${afterLeft.mode}/${afterLeft.focused}`);
  console.log(`[SCN-009-011] canvasNonblank=verified@4viewports partialBodyClean=true providerRequests=${providerRequests.length}`);
});
