import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };
const CLOCK = '2026-07-14T12%3A00%3A00.000Z';
let server;
let baseUrl;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(ROOT, relative);
    if ((filePath !== ROOT && !filePath.startsWith(ROOT + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
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

test('Regression: SCN-005-002 missing configuration blocks payload fetch and every output', async ({ page }) => {
  const requestedPaths = [];
  page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=missing-config&clock=${CLOCK}`);
  await expect(page.locator('#truthState')).toHaveText('INVALID CONFIGURATION');
  await expect(page.locator('#contractErrors')).toContainText('PSRM-CONFIG-FETCH');
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE');
  await expect(page.locator('#modelReceipt')).toBeHidden();
  await expect(page.locator('#truthDetail')).toContainText('No thesis, scenario conclusion, deterministic result, or numeric owner metric');
  await expect(page.locator('#publicationState')).toHaveText('TEST FIXTURE: owner-read publication disabled.');
  expect(requestedPaths).toContain('/tests/fixtures/palm-springs-rental-market/missing-config.json');
  expect(requestedPaths).not.toContain('/tests/fixtures/palm-springs-rental-market/current.payload.json');
  const diagnostics = await page.evaluate(() => window.__PSRM_DIAGNOSTICS__);
  expect(diagnostics.ownerReadPublished).toBe(false);
  expect(diagnostics.requests).toEqual(['tests/fixtures/palm-springs-rental-market/missing-config.json']);
  console.log('[SCN-005-002] truth=INVALID CONFIGURATION');
  console.log('[SCN-005-002] code=PSRM-CONFIG-FETCH');
  console.log('[SCN-005-002] configRequests=1');
  console.log('[SCN-005-002] payloadRequests=0');
  console.log('[SCN-005-002] ownerReadPublished=false');
  console.log('[SCN-005-002] substituteOutputs=0');
});

test('Regression: SCN-005-004 invalid payload produces errors and no conclusion', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=invalid&clock=${CLOCK}`);
  await expect(page.locator('#truthState')).toHaveText('INVALID PAYLOAD');
  await expect(page.locator('#contractErrors')).toContainText('PSRM-PAYLOAD-REF');
  await expect(page.locator('#contractErrors')).toContainText('PSRM-PAYLOAD-CATEGORY');
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE');
  await expect(page.locator('#modelReceipt')).toBeHidden();
  await expect(page.locator('#truthDetail')).toContainText('No thesis, scenario conclusion, deterministic result, or numeric owner metric');
  await expect(page.locator('#publicationState')).toHaveText('TEST FIXTURE: owner-read publication disabled.');
  const diagnostics = await page.evaluate(() => window.__PSRM_DIAGNOSTICS__);
  expect(diagnostics.payload).toBeNull();
  expect(diagnostics.ownerReadPublished).toBe(false);
  console.log('[SCN-005-004] truth=INVALID PAYLOAD');
  console.log('[SCN-005-004] code=PSRM-PAYLOAD-REF');
  console.log('[SCN-005-004] code=PSRM-PAYLOAD-CATEGORY');
  console.log('[SCN-005-004] payloadAccepted=false');
  console.log('[SCN-005-004] modelVisible=false');
  console.log('[SCN-005-004] ownerReadPublished=false');
});

test('Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=current&clock=${CLOCK}`);
  await expect(page.locator('#truthState')).toContainText('CURRENT');
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE');
  await page.getByRole('button', { name: 'Run occupancy proof' }).click();
  const receipt = await page.locator('#occupancyProof').textContent();
  const adjusted = Number(receipt.match(/adjustedOccupancy=([^\n]+)/)[1]);
  const expected = Math.min(1, Math.max(0, 0.40 * (1 + 0.10) / (1 + 0.25)));
  expect(adjusted).toBeCloseTo(expected, 12);
  expect(receipt).toContain('invalid=PSRM-MODEL-OCCUPANCY-DENOMINATOR');
  expect(receipt).toContain('numericOnInvalid=false');
  expect(adjusted).toBeGreaterThanOrEqual(0);
  expect(adjusted).toBeLessThanOrEqual(1);
  console.log('[SCN-005-006] base=0.40');
  console.log('[SCN-005-006] demandDelta=0.10');
  console.log('[SCN-005-006] supplyDelta=0.25');
  console.log('[SCN-005-006] adjustedOccupancy=' + adjusted);
  console.log('[SCN-005-006] expected=' + expected);
  console.log('[SCN-005-006] invalidCode=PSRM-MODEL-OCCUPANCY-DENOMINATOR');
  console.log('[SCN-005-006] invalidNumeric=false');
});

test('Regression: SCN-005-008 buyer economics use standard amortization in one result', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=current&clock=${CLOCK}`);
  await expect(page.locator('#truthState')).toContainText('CURRENT');
  await page.getByRole('button', { name: 'Run amortization proof' }).click();
  const receipt = await page.locator('#amortizationProof').textContent();
  const fields = Object.fromEntries(receipt.trim().split('\n').map((line) => line.split('=')));
  const principal = 500000 * 0.8;
  const monthlyRate = 0.06 / 12;
  const payments = 30 * 12;
  const power = Math.pow(1 + monthlyRate, payments);
  const expectedMonthly = principal * monthlyRate * power / (power - 1);
  const monthly = Number(fields.monthlyPaymentUsd);
  const annual = Number(fields.annualDebtServiceUsd);
  const grossYield = Number(fields.grossYield);
  const operatingExpense = Number(fields.operatingExpenseUsd);
  const preTaxCashFlow = Number(fields.preTaxCashFlowUsd);
  const grossRevenue = operatingExpense / 0.35;
  expect(fields.branch).toBe('amortizing');
  expect(monthly).toBeCloseTo(expectedMonthly, 10);
  expect(annual).toBeCloseTo(monthly * 12, 10);
  expect(grossYield).toBeCloseTo(grossRevenue / 500000, 12);
  expect(preTaxCashFlow).toBeCloseTo(grossRevenue - operatingExpense - annual, 10);
  expect([monthly, annual, grossYield, operatingExpense, preTaxCashFlow].every(Number.isFinite)).toBe(true);
  console.log('[SCN-005-008] branch=' + fields.branch);
  console.log('[SCN-005-008] principal=' + principal);
  console.log('[SCN-005-008] monthlyPaymentUsd=' + monthly);
  console.log('[SCN-005-008] annualDebtServiceUsd=' + annual);
  console.log('[SCN-005-008] grossYield=' + grossYield);
  console.log('[SCN-005-008] operatingExpenseUsd=' + operatingExpense);
  console.log('[SCN-005-008] preTaxCashFlowUsd=' + preTaxCashFlow);
});

test('Regression: SCN-005-009 zero-rate financing stays finite', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=current&clock=${CLOCK}`);
  await expect(page.locator('#truthState')).toContainText('CURRENT');
  await page.getByRole('button', { name: 'Run zero-rate proof' }).click();
  const receipt = await page.locator('#zeroRateProof').textContent();
  const fields = Object.fromEntries(receipt.trim().split('\n').map((line) => line.split('=')));
  const principal = 500000 * 0.8;
  const payments = 30 * 12;
  const monthly = Number(fields.monthlyPaymentUsd);
  const annual = Number(fields.annualDebtServiceUsd);
  const cashFlow = Number(fields.preTaxCashFlowUsd);
  expect(fields.branch).toBe('zero-rate');
  expect(monthly).toBeCloseTo(principal / payments, 12);
  expect(annual).toBeCloseTo(monthly * 12, 12);
  expect(Number.isFinite(cashFlow)).toBe(true);
  expect(fields.finite).toBe('true');
  console.log('[SCN-005-009] branch=' + fields.branch);
  console.log('[SCN-005-009] principal=' + principal);
  console.log('[SCN-005-009] payments=' + payments);
  console.log('[SCN-005-009] monthlyPaymentUsd=' + monthly);
  console.log('[SCN-005-009] annualDebtServiceUsd=' + annual);
  console.log('[SCN-005-009] preTaxCashFlowUsd=' + cashFlow);
  console.log('[SCN-005-009] finite=' + fields.finite);
});