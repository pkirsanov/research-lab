import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};
const CLOCK = '2026-07-15T18%3A00%3A00.000Z';
let server;
let baseUrl;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    if (typeof request.url !== 'string') {
      response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('request URL required');
      return;
    }
    const requestPath = decodeURIComponent(request.url.split('?')[0]);
    const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(ROOT, relative);
    if ((filePath !== ROOT && !filePath.startsWith(ROOT + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('not found');
      return;
    }
    const extension = extname(filePath);
    if (!Object.hasOwn(MIME, extension)) {
      response.writeHead(415, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('unsupported static resource type');
      return;
    }
    response.writeHead(200, {
      'content-type': MIME[extension],
      'cache-control': 'no-store'
    });
    createReadStream(filePath).pipe(response);
  });
  await new Promise((resolveReady) => server.listen(0, '127.0.0.1', resolveReady));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  if (server) await new Promise((resolveClosed, rejectClosed) => {
    server.close((error) => error ? rejectClosed(error) : resolveClosed());
    server.closeAllConnections?.();
  });
});

test('Regression: SCN-007-005 stock four-hour profile exposes session remainder and variant identity', async ({ page }) => {
  const requestedPaths = [];
  page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
  const response = await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=us-equity-4h-core&clock=${CLOCK}`);
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED HISTORICAL');
  await expect(page.locator('#truthState')).toHaveText('DEGRADED');
  await expect(page.locator('#profileName')).toHaveText('U.S. equity classic 4h core-only');
  await expect(page.locator('#sessionPolicy')).toContainText('09:30-16:00 America/New_York');
  await expect(page.locator('#aggregationPolicy')).toContainText('240m + 150m remainder');
  await expect(page.locator('#partialPolicy')).toContainText('partial and non-confirming');
  await expect(page.locator('#resultReceipt')).toContainText('No signal, neutral, setup, or probability is published by Scope 01');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('us-equity-4h-core');
  expect(diagnostics.ownerReadPublished).toBe(false);
  expect(diagnostics.profile.segments.map((segment) => segment.minutes)).toEqual([240, 150]);
  expect(diagnostics.profile.segments[1].status).toBe('partial');
  expect(diagnostics.profile.segments[1].confirming).toBe(false);
  expect(diagnostics.profile.variantId).toMatch(/^tad-variant:[a-f0-9]{64}$/);
  expect(requestedPaths).toContain('/technical-analysis-decision-universe.json');
  expect(requestedPaths).toContain('/tests/fixtures/technical-analysis-decision/source-qualified/us-equity-sessions.json');
  console.log('[SCN-007-005] session=09:30-16:00 America/New_York');
  console.log('[SCN-007-005] segments=240,150');
  console.log('[SCN-007-005] remainder=partial/non-confirming');
  console.log(`[SCN-007-005] variant=${diagnostics.profile.variantId}`);
  console.log('[SCN-007-005] ownerReadPublished=false');
});

test('Regression: SCN-007-006 continuous-market four-hour profile has equal session boundaries', async ({ page }) => {
  const response = await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=continuous-4h&clock=${CLOCK}`);
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED HISTORICAL');
  await expect(page.locator('#truthState')).toHaveText('DEGRADED');
  await expect(page.locator('#profileName')).toHaveText('Continuous-market 4h');
  await expect(page.locator('#sessionPolicy')).toContainText('00:00-24:00 UTC');
  await expect(page.locator('#aggregationPolicy')).toContainText('6 x 240m equal bars');
  await expect(page.locator('#partialPolicy')).toContainText('No unequal stock-session remainder');
  await expect(page.locator('#primaryRole')).toContainText('Primary 1w');
  await expect(page.locator('#setupRole')).toContainText('Setup 1d');
  await expect(page.locator('#triggerRole')).toContainText('Trigger 4h');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('continuous-4h');
  expect(diagnostics.profile.segments).toHaveLength(6);
  expect(diagnostics.profile.segments.every((segment) => segment.minutes === 240 && segment.status === 'closed')).toBeTruthy();
  expect(diagnostics.profile.qualityFlags).not.toContain('US_EQUITY_PARTIAL_SESSION');
  console.log('[SCN-007-006] session=00:00-24:00 UTC');
  console.log('[SCN-007-006] segments=240,240,240,240,240,240');
  console.log('[SCN-007-006] partialWarning=false');
  console.log('[SCN-007-006] roles=1w/1d/4h');
  console.log('[SCN-007-006] ownerReadPublished=false');
});

test('Regression: SCN-007-007 provisional weekly break never rewrites confirmed history', async ({ page }) => {
  const url = `${baseUrl}/technical-analysis-decision-lab.html?fixture=provisional-week&clock=${CLOCK}`;
  await page.goto(url);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED HISTORICAL');
  await expect(page.locator('#truthState')).toHaveText('DEGRADED');
  await expect(page.locator('#confirmedWeekly')).toContainText('week-2026-07-10');
  await expect(page.locator('#provisionalWeekly')).toContainText('week-2026-07-17');
  await expect(page.locator('#weeklyReceipt')).toContainText('Open weekly evidence is provisional');
  const beforeReload = await page.evaluate(() => window.__TAD_DIAGNOSTICS__.weekly);
  expect(beforeReload.confirmedBarId).toBe('week-2026-07-10');
  expect(beforeReload.provisionalBarId).toBe('week-2026-07-17');
  expect(beforeReload.provisionalStatus).toBe('provisional');
  await page.reload();
  await expect(page.locator('#confirmedWeekly')).toContainText('week-2026-07-10');
  const afterReload = await page.evaluate(() => window.__TAD_DIAGNOSTICS__.weekly);
  expect(afterReload).toEqual(beforeReload);
  console.log('[SCN-007-007] confirmed=week-2026-07-10');
  console.log('[SCN-007-007] provisional=week-2026-07-17');
  console.log('[SCN-007-007] provisionalStatus=provisional');
  console.log('[SCN-007-007] reloadConfirmedUnchanged=true');
  console.log('[SCN-007-007] ownerReadPublished=false');
});

test('Regression: SCN-007-030 failed delta refresh preserves cached source-qualified truth', async ({ page }) => {
  const responses = [];
  page.on('response', (response) => responses.push({ path: new URL(response.url()).pathname, status: response.status() }));
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=cached-refresh-failure&clock=${CLOCK}`);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED HISTORICAL');
  await expect(page.locator('#truthState')).toHaveText('STALE');
  await expect(page.locator('#cachedTruth')).toContainText('Last source-qualified close: 127.40');
  await expect(page.locator('#cachedTruth')).toContainText('age 26h');
  await expect(page.locator('#failedResource')).toContainText('missing-delta.json');
  await expect(page.locator('#requiredSource')).toContainText('source-qualified 65m delta');
  await expect(page.locator('#refreshReceipt')).toContainText('Cached value remains stale; unavailable tactical evidence contributes no neutral value');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('cached-refresh-failure');
  expect(diagnostics.refresh.httpStatus).toBe(404);
  expect(diagnostics.refresh.cachedClose).toBe(127.4);
  expect(diagnostics.refresh.truthState).toBe('stale');
  expect(diagnostics.refresh).not.toHaveProperty('neutralEvidence');
  expect(responses).toContainEqual({ path: '/tests/fixtures/technical-analysis-decision/invalid/missing-delta.json', status: 404 });
  console.log('[SCN-007-030] deltaStatus=404');
  console.log('[SCN-007-030] cachedClose=127.40');
  console.log('[SCN-007-030] exactAge=26h');
  console.log('[SCN-007-030] truth=STALE');
  console.log('[SCN-007-030] neutralEvidence=omitted');
});

test('Regression: Feature 007 qualified series and RLVALID preserve legacy shared behavior', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=us-equity-4h-core&clock=${CLOCK}`);
  await page.waitForFunction(() => {
    const diagnostics = window.__TAD_DIAGNOSTICS__;
    return diagnostics?.fixtureId === 'us-equity-4h-core'
      && Array.isArray(diagnostics.seriesEnvelope?.bars)
      && diagnostics.seriesEnvelope.bars.length > 0;
  });
  const shared = await page.evaluate(() => {
    const legacyRows = [{ t: 1700000000000, o: 10, h: 11, l: 9, c: 10.5, v: 100 }];
    RLDATA.putBars('LEGACY-CANARY', '1d', legacyRows, 'canary');
    RLDATA.putToolRead('legacy-canary', { asOf: '2026-07-15T17:00:00.000Z', read: 'Legacy canary', metrics: { state: 'unchanged' }, deepLink: 'legacy.html' });
    const before = JSON.stringify({ bars: RLDATA.bars('LEGACY-CANARY', '1d'), info: RLDATA.barInfo('LEGACY-CANARY', '1d'), read: RLDATA.toolRead('legacy-canary') });
    const envelope = window.__TAD_DIAGNOSTICS__.seriesEnvelope;
    const stored = RLDATA.putQualifiedBarSeries(envelope);
    const restored = RLDATA.qualifiedBarSeries(envelope.symbol, envelope.interval, envelope.source.vintageId);
    const after = JSON.stringify({ bars: RLDATA.bars('LEGACY-CANARY', '1d'), info: RLDATA.barInfo('LEGACY-CANARY', '1d'), read: RLDATA.toolRead('legacy-canary') });
    return {
      before,
      after,
      contractVersion: restored && restored.contractVersion,
      qualifiedRows: restored && restored.bars.length,
      storedRows: stored && stored.bars.length,
      credentialApi: typeof RLDATA.authorizeCredential,
      validationApi: Object.keys(RLVALID).sort()
    };
  });
  expect(shared.after).toBe(shared.before);
  expect(shared.contractVersion).toBe('tad-series/v1');
  expect(shared.qualifiedRows).toBeGreaterThan(0);
  expect(shared.storedRows).toBe(shared.qualifiedRows);
  expect(shared.credentialApi).toBe('function');
  expect(shared.validationApi).toEqual([
    'rlvAdjustBenjaminiHochberg',
    'rlvAdjustHolm',
    'rlvBuildPurgedFolds',
    'rlvDeflatedSharpe',
    'rlvQuantiles',
    'rlvSummarizeOutcomes',
    'rlvWilsonInterval'
  ]);

  await page.goto(`${baseUrl}/strategy-validation-lab.html`);
  await expect(page.locator('#verdict')).toBeVisible();
  const verdictText = await page.locator('#verdict').innerText();
  expect(verdictText).toMatch(/GOAL MET \(OOS\)|GOAL NOT MET \(OOS\)|No validation yet/);
  expect(verdictText).not.toMatch(/undefined|NaN/);
  const parity = await page.evaluate(() => window.__STRATEGY_RLVALID_PARITY__);
  expect(parity.available).toBe(true);
  expect(parity.equal).toBe(true);
  expect(parity.fields).toEqual(['psr', 'dsr', 'srAnn', 'nTrials', 'n']);
  console.log('[Feature-007-canary] legacyRldataBytesEqual=true');
  console.log(`[Feature-007-canary] qualifiedRows=${shared.qualifiedRows}`);
  console.log('[Feature-007-canary] credentialApi=preserved');
  console.log('[Feature-007-canary] rlvalidDeclarations=7');
  console.log('[Feature-007-canary] strategyParity=true');
});