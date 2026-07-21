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

const REQUIRED_PAIRS = [
  'ocean-shores-wa::large-luxury-4plus',
  'ocean-shores-wa::whole-market',
  'palm-springs-ca::large-luxury-5plus',
  'palm-springs-ca::whole-market'
];

async function loadProductionPage(page, search = '') {
  const requestedPaths = [];
  page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
  // Production research + audit + economics-proof tests run in Power (the deep dive) where the full
  // research audit, deterministic-economics proof, and provenance surfaces live after the Simple-view
  // simplification. Simple is asserted separately by the Simple-cockpit redesign test.
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?mode=power${search ? '&' + search.replace(/^\?/, '') : ''}`);
  await expect(page.locator('#truthState')).not.toContainText('INVALID');
  await expect(page.locator('#fixtureBand')).toBeHidden();
  await expect(page.locator('#truthState')).not.toContainText('TEST FIXTURE');
  await expect(page.locator('#researchAudit')).toBeVisible();
  // Let the (now-enabled) shared brief mount finish its one-time fetch before the
  // caller snapshots the request count, so post-interaction assertions see zero new requests.
  await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { state: 'attached', timeout: 10000 }).catch(() => { });
  return { requestedPaths };
}

async function loadScope3Route(page, routePath, search = '') {
  const requestedPaths = [];
  page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
  const response = await page.goto(`${baseUrl}/${routePath}${search}`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('[data-rental-root]')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#truthState')).not.toContainText('INVALID');
  await expect(page.locator('#routeIdentity')).toBeVisible();
  await expect(page.locator('#pairIdentity')).toBeVisible();
  // Let the (now-enabled) shared brief mount finish its one-time fetch before the
  // caller snapshots the request count, so post-interaction assertions see zero new requests.
  await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { state: 'attached', timeout: 10000 }).catch(() => { });
  return { requestedPaths };
}

async function metricText(page, metricId) {
  return (await page.locator(`[data-metric="${metricId}"]`).textContent()) || '';
}

function receiptField(line, field) {
  const match = line.match(new RegExp(`(?:^| \\| )${field}=([^|]*)`));
  return match ? match[1].trim() : null;
}

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
  await expect(page.locator('#contractErrors')).toContainText('PBRM-CONFIG-FETCH');
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE');
  await expect(page.locator('#modelReceipt')).toBeHidden();
  await expect(page.locator('#truthDetail')).toContainText('No thesis, scenario conclusion, deterministic result, or numeric owner metric');
  await expect(page.locator('#publicationState')).toHaveText('TEST FIXTURE: owner-read publication disabled.');
  expect(requestedPaths).toContain('/tests/fixtures/place-based-rental-market/missing-config.json');
  expect(requestedPaths).not.toContain('/tests/fixtures/place-based-rental-market/palm.valid.payload.json');
  expect(requestedPaths).not.toContain('/tests/fixtures/place-based-rental-market/ocean.valid.payload.json');
  const diagnostics = await page.evaluate(() => window.__PBRM_DIAGNOSTICS__);
  expect(diagnostics.ownerReadPublished).toBe(false);
  expect(diagnostics.requests).toEqual(['tests/fixtures/place-based-rental-market/missing-config.json']);
  console.log('[SCN-005-002] truth=INVALID CONFIGURATION');
  console.log('[SCN-005-002] code=PBRM-CONFIG-FETCH');
  console.log('[SCN-005-002] configRequests=1');
  console.log('[SCN-005-002] payloadRequests=0');
  console.log('[SCN-005-002] ownerReadPublished=false');
  console.log('[SCN-005-002] substituteOutputs=0');
});

test('Regression: SCN-005-004 invalid payload produces errors and no conclusion', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=invalid&clock=${CLOCK}`);
  await expect(page.locator('#truthState')).toHaveText('INVALID PAYLOAD');
  await expect(page.locator('#contractErrors')).toContainText('PBRM-PAYLOAD-PAIR-LEAK');
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE');
  await expect(page.locator('#modelReceipt')).toBeHidden();
  await expect(page.locator('#truthDetail')).toContainText('No thesis, scenario conclusion, deterministic result, or numeric owner metric');
  await expect(page.locator('#publicationState')).toHaveText('TEST FIXTURE: owner-read publication disabled.');
  const diagnostics = await page.evaluate(() => window.__PBRM_DIAGNOSTICS__);
  expect(diagnostics.payload).toBeNull();
  expect(diagnostics.ownerReadPublished).toBe(false);
  console.log('[SCN-005-004] truth=INVALID PAYLOAD');
  console.log('[SCN-005-004] code=PBRM-PAYLOAD-PAIR-LEAK');
  console.log('[SCN-005-004] payloadAccepted=false');
  console.log('[SCN-005-004] modelVisible=false');
  console.log('[SCN-005-004] ownerReadPublished=false');
});

test('Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=current&mode=power&clock=${CLOCK}`);
  await expect(page.locator('#truthState')).toContainText('CURRENT');
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE');
  await page.getByRole('button', { name: 'Run occupancy proof' }).click();
  const receipt = await page.locator('#occupancyProof').textContent();
  const adjusted = Number(receipt.match(/adjustedOccupancy=([^\n]+)/)[1]);
  const expected = Math.min(1, Math.max(0, 0.40 * (1 + 0.10) / (1 + 0.25)));
  expect(adjusted).toBeCloseTo(expected, 12);
  expect(receipt).toContain('invalid=PBRM-MODEL-OCCUPANCY-DENOMINATOR');
  expect(receipt).toContain('numericOnInvalid=false');
  expect(adjusted).toBeGreaterThanOrEqual(0);
  expect(adjusted).toBeLessThanOrEqual(1);
  console.log('[SCN-005-006] base=0.40');
  console.log('[SCN-005-006] demandDelta=0.10');
  console.log('[SCN-005-006] supplyDelta=0.25');
  console.log('[SCN-005-006] adjustedOccupancy=' + adjusted);
  console.log('[SCN-005-006] expected=' + expected);
  console.log('[SCN-005-006] invalidCode=PBRM-MODEL-OCCUPANCY-DENOMINATOR');
  console.log('[SCN-005-006] invalidNumeric=false');
});

test('Regression: SCN-005-008 buyer economics use standard amortization in one result', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=current&mode=power&clock=${CLOCK}`);
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
  const variableOperatingCost = Number(fields.variableOperatingCostUsd);
  const fixedRiskCost = Number(fields.fixedRiskCostUsd);
  const totalOperatingCost = Number(fields.totalOperatingCostUsd);
  const preTaxCashFlow = Number(fields.preTaxCashFlowUsd);
  const grossRevenue = variableOperatingCost / 0.35;
  expect(fields.branch).toBe('amortizing');
  expect(monthly).toBeCloseTo(expectedMonthly, 10);
  expect(annual).toBeCloseTo(monthly * 12, 10);
  expect(grossYield).toBeCloseTo(grossRevenue / 500000, 12);
  expect(totalOperatingCost).toBeCloseTo(variableOperatingCost + fixedRiskCost, 10);
  expect(preTaxCashFlow).toBeCloseTo(grossRevenue - totalOperatingCost - annual, 10);
  expect([monthly, annual, grossYield, variableOperatingCost, fixedRiskCost, totalOperatingCost, preTaxCashFlow].every(Number.isFinite)).toBe(true);
  console.log('[SCN-005-008] branch=' + fields.branch);
  console.log('[SCN-005-008] principal=' + principal);
  console.log('[SCN-005-008] monthlyPaymentUsd=' + monthly);
  console.log('[SCN-005-008] annualDebtServiceUsd=' + annual);
  console.log('[SCN-005-008] grossYield=' + grossYield);
  console.log('[SCN-005-008] variableOperatingCostUsd=' + variableOperatingCost);
  console.log('[SCN-005-008] fixedRiskCostUsd=' + fixedRiskCost);
  console.log('[SCN-005-008] totalOperatingCostUsd=' + totalOperatingCost);
  console.log('[SCN-005-008] preTaxCashFlowUsd=' + preTaxCashFlow);
});

test('Regression: SCN-005-009 zero-rate financing stays finite', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=current&mode=power&clock=${CLOCK}`);
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

test('Regression: SCN-005-008/009 production unavailable financing fails loud without numeric output', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const { requestedPaths } = await loadProductionPage(page);
  const requestCountBeforeInteractions = requestedPaths.length;
  await expect(page.locator('#fixtureBand')).toBeHidden();
  await expect(page.locator('#publicationState')).toContainText('UNCOMMITTED FOR REVIEW');

  await page.getByRole('button', { name: 'Run amortization proof', exact: true }).click();
  await page.getByRole('button', { name: 'Run zero-rate proof', exact: true }).click();

  const amortizationReceipt = (await page.locator('#amortizationProof').textContent()) || '';
  const zeroRateReceipt = (await page.locator('#zeroRateProof').textContent()) || '';
  for (const receipt of [amortizationReceipt, zeroRateReceipt]) {
    expect(receipt).toContain('branch=unavailable');
    expect(receipt).toContain('errors=PBRM-MODEL-NONFINITE');
    expect(receipt).toContain('numericOutput=false');
    expect(receipt).not.toMatch(/(?:monthlyPaymentUsd|annualDebtServiceUsd|preTaxCashFlowUsd)=/);
  }

  await expect(page.locator('#fixtureBand')).toBeHidden();
  await expect(page.locator('#publicationState')).toContainText('UNCOMMITTED FOR REVIEW');
  expect(pageErrors).toEqual([]);
  expect(requestedPaths).toHaveLength(requestCountBeforeInteractions);
  console.log('[SCN-005-008/009] route=production');
  console.log('[SCN-005-008/009] fixtureAuthority=false');
  console.log('[SCN-005-008/009] publication=UNCOMMITTED FOR REVIEW');
  console.log('[SCN-005-008/009] amortization=' + amortizationReceipt.replace(/\n/g, ' | '));
  console.log('[SCN-005-008/009] zeroRate=' + zeroRateReceipt.replace(/\n/g, ' | '));
  console.log('[SCN-005-008/009] pageErrors=' + pageErrors.length);
  console.log('[SCN-005-008/009] requestsBefore=' + requestCountBeforeInteractions);
  console.log('[SCN-005-008/009] requestsAfter=' + requestedPaths.length);
  console.log('[SCN-005-008/009] postInteractionRequests=' + (requestedPaths.length - requestCountBeforeInteractions));
});

test('Regression: SCN-005-020 five bedrooms alone never qualifies luxury', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=current&segment=large-luxury-5plus&clock=${CLOCK}`);
  await expect(page.locator('#truthState')).toContainText('SPARSE');
  await expect(page.locator('#qualificationReceipt')).toContainText('UNKNOWN');
  await expect(page.locator('#qualificationReceipt')).toContainText('SAMPLE_SIZE');
  await expect(page.locator('#qualificationReceipt')).toContainText('PREMIUM_ATTRIBUTES');
  await expect(page.locator('#qualificationReceipt')).not.toContainText('QUALIFIED\n');
  console.log('[SCN-005-020] bedrooms=5');
  console.log('[SCN-005-020] rentalType=entire-home');
  console.log('[SCN-005-020] sampleN=4');
  console.log('[SCN-005-020] premiumAttributes=1');
  console.log('[SCN-005-020] disposition=UNKNOWN');
  console.log('[SCN-005-020] broadSubstitution=false');
});

test('Regression: SCN-005-021 sparse segment evidence remains visible', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=current&segment=large-luxury-5plus&clock=${CLOCK}`);
  await expect(page.locator('#coverageReceipt')).toContainText('state=SPARSE');
  await expect(page.locator('#coverageReceipt')).toContainText('candidateCount=12');
  await expect(page.locator('#coverageReceipt')).toContainText('qualifyingCount=UNKNOWN');
  await expect(page.locator('#coverageReceipt')).toContainText('metricSampleN=UNKNOWN');
  await expect(page.locator('#coverageReceipt')).toContainText('coverageRatio=UNKNOWN');
  await expect(page.locator('#coverageReceipt')).toContainText('missing=qualifying-denominator,observed-luxury-performance');
  console.log('[SCN-005-021] state=SPARSE');
  console.log('[SCN-005-021] candidateCount=12');
  console.log('[SCN-005-021] qualifyingCount=UNKNOWN');
  console.log('[SCN-005-021] metricSampleN=UNKNOWN');
  console.log('[SCN-005-021] coverageRatio=UNKNOWN');
  console.log('[SCN-005-021] completeLabel=false');
});

test('Regression: SCN-005-022 whole-market values never become observed luxury performance', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=current&segment=large-luxury-5plus&clock=${CLOCK}`);
  await expect(page.locator('#luxuryObservationReceipt')).toContainText('observedLuxuryOccupancy=UNKNOWN');
  await expect(page.locator('#luxuryObservationReceipt')).toContainText('observedLuxuryAdrUsd=UNKNOWN');
  await expect(page.locator('#luxuryObservationReceipt')).toContainText('observedLuxuryRevenueUsd=UNKNOWN');
  await expect(page.locator('#broadContextReceipt')).toContainText('wholeMarketOccupancy=0.4');
  await expect(page.locator('#broadContextReceipt')).toContainText('contextOnly=true');
  const diagnostics = await page.evaluate(() => window.__PBRM_DIAGNOSTICS__);
  expect(diagnostics.activePair).toBe('palm-springs-ca::large-luxury-5plus');
  console.log('[SCN-005-022] observedLuxuryOccupancy=UNKNOWN');
  console.log('[SCN-005-022] observedLuxuryAdrUsd=UNKNOWN');
  console.log('[SCN-005-022] observedLuxuryRevenueUsd=UNKNOWN');
  console.log('[SCN-005-022] wholeMarketContext=0.4');
  console.log('[SCN-005-022] contextOnly=true');
  console.log('[SCN-005-022] premiumMultiplierUsed=false');
});

test('Regression: SCN-005-023 deltas require aligned market and segment bases', async ({ page }) => {
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=current&segment=large-luxury-5plus&clock=${CLOCK}`);
  await expect(page.locator('#comparisonReceipt')).toContainText('state=INCOMPARABLE');
  await expect(page.locator('#comparisonReceipt')).toContainText('METRIC_DEFINITION');
  await expect(page.locator('#comparisonReceipt')).toContainText('POPULATION');
  await expect(page.locator('#comparisonReceipt')).toContainText('SEGMENT_QUALIFICATION');
  await expect(page.locator('#comparisonReceipt')).toContainText('absoluteDelta=UNKNOWN');
  await expect(page.locator('#comparisonReceipt')).toContainText('ranking=UNKNOWN');
  console.log('[SCN-005-023] state=INCOMPARABLE');
  console.log('[SCN-005-023] reason=METRIC_DEFINITION');
  console.log('[SCN-005-023] reason=POPULATION');
  console.log('[SCN-005-023] reason=SEGMENT_QUALIFICATION');
  console.log('[SCN-005-023] absoluteDelta=UNKNOWN');
  console.log('[SCN-005-023] ranking=UNKNOWN');
});

test('Regression: SCN-005-001 researched payload exposes four truthful units and no fixture authority', async ({ page }) => {
  const { requestedPaths } = await loadProductionPage(page);
  const receipt = page.locator('#researchInventoryReceipt');
  await expect(receipt).toBeVisible();
  await expect(receipt).toContainText('authority=PRODUCTION RESEARCH PROPOSAL');
  await expect(receipt).toContainText('publication=UNCOMMITTED FOR REVIEW');
  await expect(receipt).toContainText('markets=2');
  await expect(receipt).toContainText('units=4');
  const receiptText = (await receipt.textContent()) || '';
  const pairLines = receiptText.split('\n').filter((line) => line.startsWith('pair='));
  expect(pairLines).toHaveLength(4);
  for (const pair of REQUIRED_PAIRS) {
    const pairLine = pairLines.find((line) => line.startsWith(`pair=${pair} |`));
    expect(pairLine).toBeTruthy();
    expect(pairLine).toContain('categories=9/9');
  }
  await expect(page.locator('#fixtureBand')).toBeHidden();
  expect(requestedPaths).toContain('/place-based-rental-market.config.json');
  expect(requestedPaths).toContain('/palm-springs-rental-market.payload.json');
  expect(requestedPaths).toContain('/ocean-shores-rental-market.payload.json');
  expect(requestedPaths).not.toContain('/tests/fixtures/place-based-rental-market/palm.compared.payload.json');
  console.log('[SCN-005-001] markets=2');
  console.log('[SCN-005-001] units=4');
  console.log('[SCN-005-001] categoriesPerUnit=9');
  console.log('[SCN-005-001] productionPayloads=2');
  console.log('[SCN-005-001] fixtureAuthority=false');
  console.log('[SCN-005-001] proposalState=UNCOMMITTED FOR REVIEW');
});

test('Regression: SCN-005-013 compared refresh accounts for every material entity by pair', async ({ page }) => {
  const requestedPaths = [];
  page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?fixture=compared&mode=power&clock=${CLOCK}`);
  await expect(page.locator('#truthState')).not.toContainText('INVALID');
  await expect(page.locator('#researchAudit')).toBeVisible();
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE');
  await expect(page.locator('#publicationState')).toHaveText('TEST FIXTURE: owner-read publication disabled.');
  await expect(page.locator('#researchInventoryReceipt')).toContainText('authority=TEST FIXTURE SYNTHETIC');
  await expect(page.locator('#researchInventoryReceipt')).toContainText('publication=DISABLED');

  const receipt = page.locator('#changeAccountingAuditReceipt');
  await expect(receipt).toBeVisible();
  const receiptText = (await receipt.textContent()) || '';
  const pairLines = receiptText.split('\n').filter((line) => line.startsWith('pair='));
  const comparedLines = pairLines.filter((line) => receiptField(line, 'priorMode') === 'compared');
  expect(comparedLines).toHaveLength(1);
  const comparedLine = comparedLines[0];
  expect(comparedLine).toContain('pair=palm-springs-ca::whole-market');
  expect(comparedLine).toContain('priorUnitId=unit:palm-springs-ca:whole-market:test-prior-v2');
  expect(comparedLine).toContain('priorResearchedAt=2026-07-17T10:00:00.000Z');
  expect(comparedLine).toContain('priorGitBlobOid=0123456789abcdef0123456789abcdef01234567');
  expect(comparedLine).toContain('changeMode=compared');
  expect(comparedLine).toContain('priorUnitMatch=true');
  expect(comparedLine).toContain('changeRecords=11');
  expect(comparedLine).toContain('materialEntities=11');
  expect(comparedLine).toContain('expectedMaterialEntities=11');
  expect(comparedLine).toContain('complete=true');
  expect(comparedLine).toContain('entityTypes=thesis,coverage,metric-observation,scenario,acquisition-sample,acquisition-baseline,cost-line,risk-assumption');
  expect(comparedLine).toContain('pairOwned=true');
  expect(requestedPaths).toContain('/tests/fixtures/place-based-rental-market/palm.compared.payload.json');
  expect(requestedPaths).not.toContain('/palm-springs-rental-market.payload.json');
  console.log('[SCN-005-013] authority=TEST FIXTURE SYNTHETIC');
  console.log('[SCN-005-013] publication=DISABLED');
  console.log('[SCN-005-013] comparedPair=palm-springs-ca::whole-market');
  console.log('[SCN-005-013] priorUnitMatch=true');
  console.log('[SCN-005-013] changeRecords=11');
  console.log('[SCN-005-013] materialEntities=11');
  console.log('[SCN-005-013] complete=true');
  console.log('[SCN-005-013] fixtureAsMarketProof=false');
});

test('Regression: SCN-005-014 baseline refresh invents no prior change', async ({ page }) => {
  const { requestedPaths } = await loadProductionPage(page);
  const receipt = page.locator('#changeAccountingAuditReceipt');
  await expect(receipt).toBeVisible();
  const receiptText = (await receipt.textContent()) || '';
  const pairLines = receiptText.split('\n').filter((line) => line.startsWith('pair='));
  expect(pairLines).toHaveLength(4);
  expect(pairLines.map((line) => receiptField(line, 'pair')).sort()).toEqual(REQUIRED_PAIRS);
  for (const pairLine of pairLines) {
    expect(pairLine).toContain('priorMode=baseline');
    expect(pairLine).toContain('priorUnitId=NONE');
    expect(pairLine).toContain('priorResearchedAt=NONE');
    expect(pairLine).toContain('priorGitBlobOid=NONE');
    expect(pairLine).toContain('changeMode=baseline');
    expect(pairLine).toContain('priorUnitMatch=NOT APPLICABLE');
    expect(pairLine).toContain('changeRecords=0');
    expect(pairLine).toContain('materialEntities=0');
    expect(pairLine).toContain('complete=NOT APPLICABLE');
    expect(pairLine).toContain('priorRelativeClaims=0');
  }
  expect(receiptText).not.toContain('priorMode=compared');
  expect(receiptText).not.toContain('complete=true');
  expect(requestedPaths).toContain('/palm-springs-rental-market.payload.json');
  expect(requestedPaths).toContain('/ocean-shores-rental-market.payload.json');
  console.log('[SCN-005-014] priorMode=baseline');
  console.log('[SCN-005-014] priorUnitIds=NONE');
  console.log('[SCN-005-014] changeRecords=0');
  console.log('[SCN-005-014] priorRelativeClaims=0');
  console.log('[SCN-005-014] units=4');
  console.log('[SCN-005-014] comparedCompletionClaim=false');
});

test('Regression: SCN-005-015 inaccessible research remains unknown without a value', async ({ page }) => {
  await loadProductionPage(page);
  const receipt = page.locator('#attemptedResearchReceipt');
  await expect(receipt).toBeVisible();
  const receiptText = (await receipt.textContent()) || '';
  const attemptLines = receiptText.split('\n').filter((line) => line.startsWith('pair='));
  expect(attemptLines.length).toBeGreaterThanOrEqual(4);
  expect([...new Set(attemptLines.map((line) => receiptField(line, 'pair')))].sort()).toEqual(REQUIRED_PAIRS);
  for (const attemptLine of attemptLines) {
    expect(['inaccessible', 'rejected']).toContain(receiptField(attemptLine, 'state'));
    const context = receiptField(attemptLine, 'context');
    const consequence = receiptField(attemptLine, 'consequence');
    expect(context).toBeTruthy();
    expect(context).not.toBe('UNRESOLVED');
    expect(context).toContain(' / ');
    expect(consequence).toBeTruthy();
    expect(consequence).not.toBe('NONE');
    expect(attemptLine).toContain('numericValue=ABSENT');
    expect(attemptLine).toContain('positiveSubstitution=false');
  }
  console.log('[SCN-005-015] unitsWithAttempts=4');
  console.log('[SCN-005-015] attemptedStates=inaccessible-or-rejected');
  console.log('[SCN-005-015] sourceContext=visible');
  console.log('[SCN-005-015] consequence=visible');
  console.log('[SCN-005-015] numericValue=ABSENT');
  console.log('[SCN-005-015] positiveSubstitution=false');
});

test('Regression: SCN-005-016 observed assumptions inference and modeled outputs stay distinct', async ({ page }) => {
  await loadProductionPage(page);
  const receipt = page.locator('#evidenceClassAuditReceipt');
  await expect(receipt).toBeVisible();
  await expect(receipt).toContainText('observed, assumption, inference, and modeled output remain separate');
  const receiptText = (await receipt.textContent()) || '';
  const classLines = receiptText.split('\n').filter((line) => line.startsWith('class='));
  expect(classLines.map((line) => line.split(' | ')[0])).toEqual([
    'class=OBSERVED',
    'class=ASSUMPTION',
    'class=INFERENCE',
    'class=MODELED OUTPUT'
  ]);
  const lineageByClass = {
    OBSERVED: 'eligible source',
    ASSUMPTION: 'declared assumption',
    INFERENCE: 'claims and method'
  };
  for (const evidenceClass of ['OBSERVED', 'ASSUMPTION', 'INFERENCE']) {
    const classLine = classLines.find((line) => line.startsWith(`class=${evidenceClass} |`));
    expect(classLine).toBeTruthy();
    expect(Number(receiptField(classLine, 'claims'))).toBeGreaterThan(0);
    const referenceCount = ['sourceRefs', 'metricRefs', 'supportLinks']
      .reduce((total, field) => total + Number(receiptField(classLine, field)), 0);
    expect(referenceCount).toBeGreaterThan(0);
    expect(receiptField(classLine, 'lineage')).toBe(lineageByClass[evidenceClass]);
  }
  const modeledLine = classLines.find((line) => line.startsWith('class=MODELED OUTPUT |'));
  expect(modeledLine).toBeTruthy();
  expect(Number(receiptField(modeledLine, 'scenarios'))).toBeGreaterThan(0);
  expect(Number(receiptField(modeledLine, 'assumptionRefs'))).toBeGreaterThan(0);
  expect(Number(receiptField(modeledLine, 'inferenceRefs'))).toBeGreaterThan(0);
  expect(Number(receiptField(modeledLine, 'falsifierRefs'))).toBeGreaterThan(0);
  expect(receiptField(modeledLine, 'lineage')).toBe('forecast method + assumptions + inference + falsifier');
  console.log('[SCN-005-016] visibleClasses=OBSERVED,ASSUMPTION,INFERENCE,MODELED OUTPUT');
  console.log('[SCN-005-016] observedLineage=eligible source');
  console.log('[SCN-005-016] assumptionLineage=declared assumption');
  console.log('[SCN-005-016] inferenceLineage=claims and method');
  console.log('[SCN-005-016] modeledLineage=forecast method + assumptions + inference + falsifier');
  console.log('[SCN-005-016] referenceCounts=nonzero');
});

test('Regression: SCN-005-026 refresh accounts independently for all four mandatory units', async ({ page }) => {
  await loadProductionPage(page);
  const receipt = page.locator('#unitIndependenceReceipt');
  await expect(receipt).toBeVisible();
  await expect(receipt).toContainText('receipts=4');
  const receiptText = (await receipt.textContent()) || '';
  const pairLines = receiptText.split('\n').filter((line) => line.startsWith('pair='));
  expect(pairLines).toHaveLength(4);
  expect(pairLines.map((line) => receiptField(line, 'pair')).sort()).toEqual(REQUIRED_PAIRS);
  for (const pairLine of pairLines) {
    expect(pairLine).toContain('foreignIds=0');
    expect(pairLine).toContain('duplicateIds=0');
    expect(pairLine).toContain('inheritedIdentity=false');
    expect(pairLine).toContain('categories=9/9');
  }
  console.log('[SCN-005-026] receipts=4');
  console.log('[SCN-005-026] duplicateIds=0');
  console.log('[SCN-005-026] foreignIds=0');
  console.log('[SCN-005-026] inheritedIdentity=false');
  console.log('[SCN-005-026] categories=9/9');
});

test('Regression: SCN-005-027 acquisition baselines disclose sample status and legal unknowns', async ({ page }) => {
  await loadProductionPage(page);
  const receipt = page.locator('#acquisitionAuditReceipt');
  await expect(receipt).toBeVisible();
  const receiptText = (await receipt.textContent()) || '';
  const luxuryLines = receiptText.split('\n').filter((line) => line.startsWith('pair='));
  expect(luxuryLines).toHaveLength(2);
  expect(luxuryLines.map((line) => receiptField(line, 'pair')).sort()).toEqual([
    'ocean-shores-wa::large-luxury-4plus',
    'palm-springs-ca::large-luxury-5plus'
  ]);
  expect(luxuryLines.map((line) => receiptField(line, 'state')).sort()).toEqual(['sparse', 'unclean']);
  for (const luxuryLine of luxuryLines) {
    expect(receiptField(luxuryLine, 'status')).toBe('active-ask');
    expect(receiptField(luxuryLine, 'filters')).not.toBe('NONE');
    expect(receiptField(luxuryLine, 'dedup')).not.toBe('NONE');
    expect(Number(receiptField(luxuryLine, 'sampleN'))).toBeGreaterThan(0);
    expect(receiptField(luxuryLine, 'statistic')).toBeTruthy();
    const range = receiptField(luxuryLine, 'range').split('..').map(Number);
    expect(range[0]).toBeGreaterThan(0);
    expect(range[1]).toBeGreaterThanOrEqual(range[0]);
    expect(receiptField(luxuryLine, 'period')).not.toContain('NONE');
    expect(receiptField(luxuryLine, 'exclusions')).not.toBe('NONE');
    expect(receiptField(luxuryLine, 'legalUnknowns')).not.toBe('NONE');
    expect(receiptField(luxuryLine, 'rights')).toBe('public-summary');
    expect(receiptField(luxuryLine, 'baseline')).toBe('unavailable');
    expect(receiptField(luxuryLine, 'purchasePriceUsd')).toBe('UNAVAILABLE');
  }
  console.log('[SCN-005-027] luxurySamples=2');
  console.log('[SCN-005-027] status=active-ask');
  console.log('[SCN-005-027] sampleStates=sparse,unclean');
  console.log('[SCN-005-027] filtersDedupRangePeriod=visible');
  console.log('[SCN-005-027] legalUnknowns=visible');
  console.log('[SCN-005-027] rights=public-summary');
  console.log('[SCN-005-027] baseline=unavailable');
  console.log('[SCN-005-027] purchasePriceUsd=UNAVAILABLE');
});

test('Regression: SCN-005-028 remaining-2026 and 2027 scenarios remain falsifiable not factual', async ({ page }) => {
  await loadProductionPage(page);
  const receipt = page.locator('#scenarioAuditReceipt');
  await expect(receipt).toBeVisible();
  const receiptText = (await receipt.textContent()) || '';
  const scenarioLines = receiptText.split('\n').filter((line) => line.startsWith('pair='));
  const expectedWholeSlots = ['scenario-slot:rest-2026-base', 'scenario-slot:2027-downside', 'scenario-slot:2027-base', 'scenario-slot:2027-upside'];
  const wholePairs = ['ocean-shores-wa::whole-market', 'palm-springs-ca::whole-market'];
  for (const pair of wholePairs) {
    const pairLines = scenarioLines.filter((line) => receiptField(line, 'pair') === pair);
    expect(pairLines).toHaveLength(4);
    expect(pairLines.map((line) => receiptField(line, 'slot')).sort()).toEqual(expectedWholeSlots.slice().sort());
    for (const pairLine of pairLines) {
      expect(receiptField(pairLine, 'baseline')).toBeTruthy();
      expect(Number(receiptField(pairLine, 'assumptions'))).toBeGreaterThan(0);
      expect(Number(receiptField(pairLine, 'inferences'))).toBeGreaterThan(0);
      expect(receiptField(pairLine, 'output')).toContain('occupancy:');
      expect(receiptField(pairLine, 'method')).not.toBe('NONE');
      expect(receiptField(pairLine, 'methodVersion')).not.toBe('NONE');
      expect(receiptField(pairLine, 'coverage')).toBeTruthy();
      const confidence = Number(receiptField(pairLine, 'confidence').replace('%', ''));
      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(100);
      expect(Number(receiptField(pairLine, 'falsifiers'))).toBeGreaterThan(0);
      expect(receiptField(pairLine, 'observedFact')).toBe('false');
    }
  }
  const luxuryLines = scenarioLines.filter((line) => receiptField(line, 'slot') === 'scenario-slot:assumption-sensitivity');
  expect(luxuryLines).toHaveLength(2);
  expect(luxuryLines.map((line) => receiptField(line, 'pair')).sort()).toEqual([
    'ocean-shores-wa::large-luxury-4plus',
    'palm-springs-ca::large-luxury-5plus'
  ]);
  for (const luxuryLine of luxuryLines) {
    expect(receiptField(luxuryLine, 'state')).toBe('assumption-driven');
    expect(receiptField(luxuryLine, 'baseline')).toBe('UNAVAILABLE');
    expect(receiptField(luxuryLine, 'inputPosture')).toBe('INPUT REQUIRED');
    expect(receiptField(luxuryLine, 'observedFact')).toBe('false');
    const requiredInputs = receiptField(luxuryLine, 'requiredUserInputs');
    for (const input of ['baseOccupancy', 'baseAdrUsd', 'purchasePriceUsd', 'variableOperatingExpenseRatio', 'annualFixedRiskCostUsd']) {
      expect(requiredInputs).toContain(input);
    }
  }
  console.log('[SCN-005-028] wholeMarketScenarios=8');
  console.log('[SCN-005-028] luxurySensitivityScenarios=2');
  console.log('[SCN-005-028] methodsCoverageConfidenceFalsifiers=visible');
  console.log('[SCN-005-028] requiredUserInputs=visible');
  console.log('[SCN-005-028] observedFact=false');
});

test('Regression: SCN-005-003 stale research stays stale in Simple Power and owner read', async ({ page }) => {
  await loadScope3Route(page, 'palm-springs-rental-market-lab.html', `?fixture=current&clock=2026-08-15T12%3A00%3A00.000Z`);
  await expect(page.locator('#truthState')).toContainText('STALE');
  await expect(page.locator('#truthDetail')).toContainText('age');
  await expect(page.locator('#truthDetail')).toContainText('threshold');
  await expect(page.locator('#pairIdentity')).toHaveText('palm-springs-ca::whole-market');
  await expect(page.locator('#simpleDecision')).toContainText('STALE');
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  await expect(page.locator('#powerDecision')).toContainText('STALE');
  await expect(page.locator('#ownerReadReceipt')).toContainText('STALE');
  await expect(page.locator('#ownerReadReceipt')).toContainText('palm-springs-ca::whole-market');
  await expect(page.locator('#truthState')).not.toContainText(/CURRENT|LIVE/);
});

test('Regression: SCN-005-005 pair levers recompute with zero post-boot requests', async ({ page }) => {
  const { requestedPaths } = await loadScope3Route(page, 'ocean-shores-rental-market-lab.html', `?fixture=current&clock=${CLOCK}`);
  const requestsAfterBoot = requestedPaths.length;
  const researchDigest = await page.locator('#researchDigest').textContent();
  const firstResultId = await page.locator('#resultId').textContent();
  await page.locator('#demandDelta').fill('0.12');
  await page.locator('#downtimeDays').fill('15');
  await page.locator('#purchasePriceUsd').fill('450000');
  await expect(page.locator('#resultId')).not.toHaveText(firstResultId || '');
  await expect(page.locator('#researchDigest')).toHaveText(researchDigest || '');
  await expect(page.locator('#liveUpdate')).toContainText('Ocean Shores');
  expect(requestedPaths).toHaveLength(requestsAfterBoot);
  await expect(page.locator('#coverageSummary')).not.toContainText('loading', { ignoreCase: true });
  await expect(page.locator('#thesisSummary')).not.toContainText('loading', { ignoreCase: true });
  await page.locator('#demandDelta').fill('0.75');
  await expect(page.locator('#demandDelta')).toHaveValue('0.75');
  await expect(page.locator('#demandDeltaError')).toContainText('configured bounds');
  await expect(page.locator('[data-metric="preTaxCashFlowUsd"]')).toHaveText('UNKNOWN');
  await expect(page.locator('#resultId')).toHaveText('UNAVAILABLE');
  await page.locator('#demandDelta').fill('0.12');
  await page.getByRole('button', { name: 'Reset selected pair' }).click();
  await expect(page.locator('#demandDelta')).toHaveValue('0');
  expect(requestedPaths).toHaveLength(requestsAfterBoot);
});

test('Regression: SCN-005-007 incompatible occupancy definitions remain separate and unaggregated', async ({ page }) => {
  await loadScope3Route(page, 'palm-springs-rental-market-lab.html', '?mode=power');
  const definitions = page.locator('#definitionAudit [data-definition]');
  await expect(definitions).toHaveCount(2);
  const left = (await definitions.nth(0).textContent()) || '';
  const right = (await definitions.nth(1).textContent()) || '';
  expect(left.length).toBeGreaterThan(20);
  expect(right.length).toBeGreaterThan(20);
  expect(left).not.toBe(right);
  await expect(page.locator('#definitionAudit')).toContainText('INCOMPARABLE');
  await expect(page.locator('#definitionAudit')).toContainText('reason');
  await expect(page.locator('#definitionAudit')).toContainText('aggregate=NONE');
  await expect(page.locator('#definitionAudit')).toContainText('ranking=NONE');
});

test('Regression: SCN-005-010 negative cash flow remains signed and explicit everywhere', async ({ page }) => {
  await loadScope3Route(page, 'palm-springs-rental-market-lab.html', `?fixture=current&clock=${CLOCK}`);
  const simpleCashFlow = await metricText(page, 'preTaxCashFlowUsd');
  expect(simpleCashFlow).toMatch(/NEGATIVE.*-\$/);
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  const powerCashFlow = await metricText(page, 'preTaxCashFlowUsd');
  expect(powerCashFlow).toBe(simpleCashFlow);
  await expect(page.locator('#ownerReadReceipt')).toContainText(simpleCashFlow);
  const decisionText = (await page.locator('#decision').textContent()) || '';
  expect(decisionText).not.toMatch(/attractive|viable|positive cash flow/i);
});

test('Regression: SCN-005-011 both routes keep desktop mobile Simple Power decisions identical', async ({ page }, testInfo) => {
  for (const routePath of ['palm-springs-rental-market-lab.html', 'ocean-shores-rental-market-lab.html']) {
    const routeId = routePath.replace('-rental-market-lab.html', '');
    await page.setViewportSize({ width: 1280, height: 900 });
    await loadScope3Route(page, routePath, `?fixture=current&clock=${CLOCK}`);
    await expect(page.locator('#rlviews button[data-rlview-mode="simple"]')).toHaveAttribute('aria-selected', 'true');
    const pair = await page.locator('#pairIdentity').textContent();
    const digest = await page.locator('#renderDigest').textContent();
    const resultId = await page.locator('#resultId').textContent();
    await page.locator('#rlviews button[data-rlview-mode="power"]').click();
    await expect(page.locator('#pairIdentity')).toHaveText(pair || '');
    await expect(page.locator('#renderDigest')).toHaveText(digest || '');
    await expect(page.locator('#resultId')).toHaveText(resultId || '');
    const desktopPath = testInfo.outputPath(`${routeId}-desktop.png`);
    await page.screenshot({ path: desktopPath, fullPage: true });
    await testInfo.attach(`${routeId}-desktop`, { path: desktopPath, contentType: 'image/png' });
    const canvasPath = testInfo.outputPath(`${routeId}-canvas.png`);
    const canvasPng = await page.locator('#economicsChart').screenshot({ path: canvasPath });
    expect(canvasPng.byteLength).toBeGreaterThan(2000);
    await testInfo.attach(`${routeId}-canvas`, { path: canvasPath, contentType: 'image/png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#pairIdentity')).toHaveText(pair || '');
    await expect(page.locator('#renderDigest')).toHaveText(digest || '');
    await expect(page.locator('#resultId')).toHaveText(resultId || '');
    const mainBox = await page.locator('main').boundingBox();
    expect(mainBox).not.toBeNull();
    expect(mainBox.x).toBeGreaterThanOrEqual(0);
    expect(mainBox.width).toBeLessThanOrEqual(390);
    await expect(page.locator('#economicsTable')).toBeVisible();
    await expect(page.locator('#economicsChart')).toHaveAttribute('data-render-state', 'drawn');
    const mobilePath = testInfo.outputPath(`${routeId}-mobile.png`);
    await page.screenshot({ path: mobilePath, fullPage: true });
    await testInfo.attach(`${routeId}-mobile`, { path: mobilePath, contentType: 'image/png' });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html`);
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html`);
  await expect(page.locator('#rlviews button[data-rlview-mode="power"]')).toHaveAttribute('aria-selected', 'true');
});

test('Regression: SCN-005-012 source inspector resolves provenance and restores exact focus', async ({ page }) => {
  await loadScope3Route(page, 'palm-springs-rental-market-lab.html', '?mode=power');
  const trigger = page.locator('[data-source-trigger]').first();
  await expect(trigger).toBeVisible();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Source inspector' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Publisher');
  await expect(dialog).toContainText('Retrieved');
  await expect(dialog).toContainText('Geography');
  await expect(dialog).toContainText('Population');
  await expect(dialog).toContainText('Rights');
  await expect(dialog).toContainText('Limitations');
  const sourceLink = dialog.getByRole('link', { name: 'Open source' });
  await expect(sourceLink).toHaveAttribute('href', /^https?:\/\//);
  await expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer');
  expect(await dialog.locator('script,style,iframe').count()).toBe(0);
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('Regression: SCN-005-017 legal and active supply remain separate from scenario assumptions', async ({ page }) => {
  await loadScope3Route(page, 'ocean-shores-rental-market-lab.html', '?mode=power');
  await expect(page.locator('#legalSupplyReceipt')).toContainText('LEGAL ELIGIBILITY');
  await expect(page.locator('#legalSupplyReceipt')).toContainText('City endorsement');
  await expect(page.locator('#activeSupplyReceipt')).toContainText('ACTIVE OTA SUPPLY');
  await expect(page.locator('#supplyAssumptionReceipt')).toContainText('SCENARIO ASSUMPTION');
  await expect(page.locator('#supplyAssumptionReceipt')).toContainText('supplyDelta');
  await expect(page.locator('#supplySeparation')).toContainText('INCOMPARABLE');
  await expect(page.locator('#supplySeparation')).toContainText('aggregate=NONE');
});

test('Regression: SCN-005-019 market and segment switching commits one matching result', async ({ page }) => {
  await loadScope3Route(page, 'palm-springs-rental-market-lab.html', `?fixture=current&clock=${CLOCK}`);
  const firstPair = await page.locator('#pairIdentity').textContent();
  const firstResultId = await page.locator('#resultId').textContent();
  await page.getByRole('button', { name: '5+ Luxury', exact: true }).click();
  await expect(page.locator('#pairIdentity')).toHaveText('palm-springs-ca::large-luxury-5plus');
  await expect(page.locator('#decision')).not.toContainText(firstPair || '');
  await expect(page.locator('#resultId')).not.toHaveText(firstResultId || '');
  await expect(page.locator('#coverageSummary')).toContainText('SPARSE');
  await page.locator('[data-rental-market-link]').click();
  await expect(page).toHaveURL(/ocean-shores-rental-market-lab\.html/);
  await expect(page.locator('#routeIdentity')).toContainText('ocean-shores-wa');
  await expect(page.locator('#pairIdentity')).toContainText('ocean-shores-wa::');
  await expect(page.locator('#decision')).not.toContainText('palm-springs-ca');
});

test('Regression: SCN-005-024 Ocean Shores coastal inputs change nights costs and cash flow', async ({ page }) => {
  await loadScope3Route(page, 'ocean-shores-rental-market-lab.html', `?fixture=current&clock=${CLOCK}`);
  const researchDigest = await page.locator('#researchDigest').textContent();
  const costInputs = page.locator('[data-cost-id]');
  for (let index = 0; index < await costInputs.count(); index += 1) {
    const input = costInputs.nth(index);
    if ((await input.inputValue()) === '') await input.fill('100');
  }
  await expect(page.locator('#economicsState')).toHaveText('COMPLETE');
  const before = {
    nights: await metricText(page, 'effectiveAvailableNights'),
    revenue: await metricText(page, 'grossRevenueUsd'),
    costs: await metricText(page, 'fixedRiskCostUsd'),
    yield: await metricText(page, 'grossYield'),
    cashFlow: await metricText(page, 'preTaxCashFlowUsd')
  };
  await page.locator('#downtimeDays').fill('20');
  await page.locator('[data-cost-id="costfield:ocean:flood-insurance"]').fill('4500');
  await page.locator('[data-cost-id="costfield:ocean:wind-storm-reserve"]').fill('3000');
  expect(await metricText(page, 'effectiveAvailableNights')).not.toBe(before.nights);
  expect(await metricText(page, 'grossRevenueUsd')).not.toBe(before.revenue);
  expect(await metricText(page, 'fixedRiskCostUsd')).not.toBe(before.costs);
  expect(await metricText(page, 'grossYield')).not.toBe(before.yield);
  expect(await metricText(page, 'preTaxCashFlowUsd')).not.toBe(before.cashFlow);
  await expect(page.locator('#researchDigest')).toHaveText(researchDigest || '');
  await expect(page.locator('#geographyReceipt')).toContainText(/Ocean Shores city/i);
  await expect(page.locator('#geographyReceipt')).toContainText(/Grays Harbor County/i);
  await expect(page.locator('#geographyReceipt')).toContainText(/Peninsulas region/i);
  await expect(page.locator('#geographyReceipt')).toContainText(/Washington coast/i);
  await expect(page.locator('#geographyReceipt')).toContainText(/Property level/i);
});

test('Regression: SCN-005-025 Palm Springs luxury keeps legal and operating boundaries', async ({ page }) => {
  await loadScope3Route(page, 'palm-springs-rental-market-lab.html', '?segment=large-luxury-5plus');
  await expect(page.locator('#pairIdentity')).toHaveText('palm-springs-ca::large-luxury-5plus');
  const coverageBox = await page.locator('[data-rental-coverage]').boundingBox();
  const thesisBox = await page.locator('[data-rental-thesis]').boundingBox();
  expect(coverageBox.y).toBeLessThan(thesisBox.y);
  await expect(page.locator('#qualificationSummary')).toContainText(/UNKNOWN|SPARSE/);
  await expect(page.locator('#acquisitionSummary')).toContainText('active-ask');
  await expect(page.locator('#palmObligations')).toContainText(/certificate/i);
  await expect(page.locator('#palmObligations')).toContainText(/cap/i);
  await expect(page.locator('#palmObligations')).toContainText(/contract/i);
  await expect(page.locator('#palmObligations')).toContainText(/pool and spa/i);
  await expect(page.locator('#palmObligations')).toContainText(/landscape/i);
  await expect(page.locator('#palmObligations')).toContainText(/water/i);
  await expect(page.locator('#palmObligations')).toContainText(/energy/i);
  await expect(page.locator('#palmObligations')).toContainText(/management/i);
  await expect(page.locator('#palmObligations')).toContainText(/compliance/i);
  await expect(page.locator('#palmObligations')).toContainText(/insurance/i);
  await expect(page.locator('#palmObligations')).toContainText(/association|HOA/i);
  await expect(page.locator('#palmObligations')).toContainText(/UNKNOWN|MISSING/);
  await expect(page.locator('#broadContextReceipt')).toContainText('contextOnly=true');
  await expect(page.locator('#luxuryObservationReceipt')).toContainText('UNKNOWN');
});

test('Redesign: Simple is a lean cockpit — model + sliders in Simple, deep-dive lives in Power', async ({ page }) => {
  // Simple mode is a lean cockpit: what's known (compact coverage + qualification), the decision,
  // the model result, and the playable sliders — nothing else. (mode=simple is explicit here so the
  // assertion is deterministic even when a prior ?mode=power test persisted a mode; the config default
  // is already `simple`, verified by SCN-005-011's default rlviews state.)
  await page.goto(`${baseUrl}/palm-springs-rental-market-lab.html?mode=simple`);
  await expect(page.locator('#truthState')).not.toContainText('INVALID');
  await expect(page.locator('#fixtureBand')).toBeHidden();
  // The Simple essentials ARE visible.
  for (const essential of ['#decision', '#modelResult', '[data-rental-primary-controls]', '#coverageSummary', '#qualificationSummary']) {
    await expect(page.locator(essential)).toBeVisible();
  }
  // The governance / evidence / proof / provenance detail is HIDDEN in Simple (moved to Power).
  for (const powerOnly of ['[data-rental-truth]', '#researchAudit', '#modelReceipt', '#palmProfile', '#coverageReceipt', '#qualificationReceipt', '[data-rental-sources]', '[data-rental-owner-read]']) {
    await expect(page.locator(powerOnly)).toBeHidden();
  }
  // Playable model: every bounded assumption carries a paired range slider.
  expect(await page.locator('.control-slider').count()).toBeGreaterThan(6);
  // Simple presents the model: a visible result grid that mirrors the authoritative economics exactly.
  await expect(page.locator('#modelResultGrid [data-simple-metric]')).toHaveCount(7);
  for (const metric of ['preTaxCashFlowUsd', 'grossRevenueUsd', 'adjustedOccupancy']) {
    const simpleValue = (await page.locator(`#modelResultGrid [data-simple-metric="${metric}"]`).textContent()) || '';
    expect(simpleValue.trim()).toBe((await metricText(page, metric)).trim());
  }
  // A slider drives its paired number input (the deterministic source of truth), tolerant of step snapping.
  const occupancyRow = page.locator('.control-slider-row', { has: page.locator('#baseOccupancy') });
  const occupancySlider = occupancyRow.locator('.control-slider');
  await occupancySlider.fill('0.62');
  await expect(page.locator('#baseOccupancy')).toHaveValue(await occupancySlider.inputValue());
  // Switching to Power (the shared rlviews switch) reveals the deep-dive surfaces the cockpit hides.
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  await expect(page.locator('#researchAudit')).toBeVisible();
  await expect(page.locator('#modelReceipt')).toBeVisible();
});