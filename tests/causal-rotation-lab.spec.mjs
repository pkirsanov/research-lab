import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jsonl': 'application/x-ndjson; charset=utf-8' };
let server;
let baseUrl;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(ROOT, relative);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + sep) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('not found');
      return;
    }
    response.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream', 'cache-control': 'no-store' });
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

test('Regression: served causal contracts preserve explicit stale and unavailable states', async ({ request }) => {
  const configResponse = await request.get(baseUrl + '/causal-rotation.config.json');
  const observationsResponse = await request.get(baseUrl + '/causal-rotation-observations.json');
  const timingResponse = await request.get(baseUrl + '/tests/fixtures/causal-rotation/invalid/stale-timing.json');
  expect(configResponse.ok()).toBeTruthy();
  expect(observationsResponse.ok()).toBeTruthy();
  expect(timingResponse.ok()).toBeTruthy();
  const observations = await observationsResponse.json();
  expect(observations.hypotheses.some((hypothesis) => hypothesis.unavailableEvidence?.some((entry) => entry.evidenceClass === 'valuation'))).toBeTruthy();
});

test('Regression: Evidence available after a decision is excluded from that decision', async ({ page }) => {
  await page.goto(baseUrl + '/tests/fixtures/causal-rotation/foundation-harness.html');
  await expect(page.getByRole('status')).toHaveText('Production causal foundation ready');
  const result = JSON.parse(await page.locator('#time-result').textContent());
  expect(result.eligible).toBe(0);
  expect(result.excludedCodes.length).toBeGreaterThan(0);
  expect(result.excludedCodes.every((code) => code === 'CR-TIME-INELIGIBLE')).toBeTruthy();
  expect(result.laterCode).toBe('CR-TIME-INELIGIBLE');
  expect(result.frozenBytesUnchanged).toBeTruthy();
  expect(result.frozenDigestUnchanged).toBeTruthy();
  expect(result.outcomeState).toBe('falsified');
});

test('Regression: One announcement drives price options and ETF activity', async ({ page }) => {
  await page.goto(baseUrl + '/tests/fixtures/causal-rotation/foundation-harness.html');
  await expect(page.getByRole('status')).toHaveText('Production causal foundation ready');
  const result = JSON.parse(await page.locator('#cluster-result').textContent());
  expect(result.clusters).toBe(1);
  expect(result.members).toBe(4);
  expect(result.origins).toBe(1);
  expect(result.reasonKeys).toBe(1);
});

test('Regression: Decision-critical valuation and timing inputs are stale or unavailable', async ({ page }) => {
  await page.goto(baseUrl + '/tests/fixtures/causal-rotation/foundation-harness.html');
  await expect(page.getByRole('status')).toHaveText('Production causal foundation ready');
  const results = JSON.parse(await page.locator('#stale-result').textContent());
  expect(results.map((result) => result.posture)).toEqual(['discovery', 'balanced', 'confirmation']);
  expect(results.every((result) => result.timingState === 'stale' && result.timingCode === 'CR-TIMING-UNAVAILABLE')).toBeTruthy();
  expect(results.every((result) => result.missing.includes('valuation') && result.planEligible === false)).toBeTruthy();
});
