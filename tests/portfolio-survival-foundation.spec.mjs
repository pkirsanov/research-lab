import { expect, test } from './playwright-runtime.mjs';
import { resolve } from 'node:path';
import { FIXTURE_ROOT, startPortfolioServer } from './portfolio-survival.support.mjs';

let server;

test.beforeAll(async () => {
  server = await startPortfolioServer();
});

test.afterAll(async () => {
  if (server) await server.close();
});

async function blockStorage(page, mode) {
  await page.addInitScript((requestedMode) => {
    function blockedStorage() {
      return Object.freeze({
        get length() { return 0; },
        clear() { throw new Error('storage blocked'); },
        getItem() { throw new Error('storage blocked'); },
        key() { return null; },
        removeItem() { throw new Error('storage blocked'); },
        setItem() { throw new Error('storage blocked'); }
      });
    }
    if (requestedMode === 'session' || requestedMode === 'memory') {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: blockedStorage() });
    }
    if (requestedMode === 'memory') {
      Object.defineProperty(window, 'sessionStorage', { configurable: true, value: blockedStorage() });
    }
  }, mode);
}

async function openRoute(page) {
  const browserRequests = [];
  page.on('request', (request) => browserRequests.push(request.url()));
  const response = await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#brief`);
  expect(response?.status(), 'unregistered portfolio route foundation must be served').toBe(200);
  await expect(page.getByRole('heading', { name: 'Portfolio Brief' })).toBeVisible();
  await expect(page.locator('#localBoundary')).toContainText('Local-only');
  await expect(page.locator('#workspaceTabBrief')).toHaveAttribute('aria-selected', 'true');
  return browserRequests;
}

async function importValid(page, name = 'Scope 01 portfolio') {
  await page.locator('#portfolioName').fill(name);
  await page.locator('#portfolioFile').setInputFiles(resolve(FIXTURE_ROOT, 'valid-portfolio.csv'));
  await expect(page.locator('#previewAccepted')).toHaveText('3');
  await expect(page.locator('#previewNormalized')).not.toHaveText('0');
  await expect(page.locator('#previewDuplicates')).toHaveText('2');
  await page.locator('#duplicateChoice').selectOption('merge');
  await page.locator('#localOnlyAcknowledgement').check();
  await expect(page.locator('#confirmImport')).toBeEnabled();
  await page.locator('#confirmImport').click();
  await expect(page.locator('#currentRevision')).toContainText('Current revision');
}

test('Regression: SCN-008-001 valid local portfolio import creates one current revision', async ({ page }) => {
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);
  await importValid(page);
  const first = await page.evaluate(() => ({
    diagnostics: window.__PORTFOLIO_DIAGNOSTICS__,
    localKeys: Object.keys(localStorage).sort(),
    sessionKeys: Object.keys(sessionStorage).sort(),
    url: location.href
  }));
  expect(first.diagnostics.generation).toBe(1);
  expect(first.diagnostics.revisionCount).toBe(1);
  expect(first.diagnostics.holdingCount).toBe(2);
  expect(first.diagnostics.storageMode).toBe('durable');
  expect(first.localKeys).toEqual(['rlPortfolioWorkspaceV1.pointer', 'rlPortfolioWorkspaceV1.slotA']);
  expect(first.sessionKeys).toEqual([]);
  expect(first.url).not.toMatch(/MSFT|BND|quantity|costBasis/i);
  const revisionId = first.diagnostics.currentPortfolioId;
  await page.reload();
  await expect(page.locator('#currentRevision')).toContainText(revisionId.slice(0, 20));
  const reloaded = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(reloaded.currentPortfolioId).toBe(revisionId);
  expect(reloaded.revisionCount).toBe(1);
  const requests = server.requests.slice(requestStart);
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((entry) => !/https?:\/\//.test(entry.pathname) && entry.method === 'GET')).toBe(true);
  expect(JSON.stringify(requests)).not.toMatch(/Scope 01 portfolio|MSFT|BND|costBasis/i);
  expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
  expect(await page.evaluate(async () => !navigator.serviceWorker.controller && (await navigator.serviceWorker.getRegistrations()).length === 0)).toBe(true);
  console.log('[SCN-008-001] route=served');
  console.log('[SCN-008-001] previewAccepted=3');
  console.log('[SCN-008-001] duplicateChoice=merge');
  console.log('[SCN-008-001] generation=' + reloaded.generation);
  console.log('[SCN-008-001] revisions=' + reloaded.revisionCount);
  console.log('[SCN-008-001] holdings=' + reloaded.holdingCount);
  console.log('[SCN-008-001] storageMode=' + reloaded.storageMode);
  console.log('[SCN-008-001] localKeys=' + first.localKeys.join(','));
  console.log('[SCN-008-001] remoteRequests=0');
});

test('Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted', async ({ page }) => {
  const consoleMessages = [];
  page.on('console', (message) => consoleMessages.push(message.text()));
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);
  await importValid(page, 'Prior portfolio');
  const prior = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  const sentinel = 'SCOPE01-E2E-PRIVATE-' + Date.now();
  const invalidBytes = (await import('node:fs')).readFileSync(resolve(FIXTURE_ROOT, 'invalid-secret-portfolio.csv'), 'utf8').replaceAll('__PRIVATE_SENTINEL__', sentinel);
  await page.locator('#portfolioFile').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from(invalidBytes) });
  await expect(page.locator('#confirmImport')).toBeDisabled();
  await expect(page.locator('#previewRejected')).not.toHaveText('0');
  await expect(page.locator('#importErrors')).toContainText('P008-IMPORT-SECRET');
  await expect(page.locator('#currentRevision')).toContainText('Current portfolio unchanged');
  await expect(page.locator('body')).not.toContainText(sentinel);
  const after = await page.evaluate((privateSentinel) => ({
    diagnostics: window.__PORTFOLIO_DIAGNOSTICS__,
    local: Object.values(localStorage).join('\n'),
    session: Object.values(sessionStorage).join('\n'),
    url: location.href,
    bodyContains: document.body.textContent.includes(privateSentinel)
  }), sentinel);
  expect(after.diagnostics.currentPortfolioId).toBe(prior.currentPortfolioId);
  expect(after.diagnostics.generation).toBe(prior.generation);
  expect(after.local).not.toContain(sentinel);
  expect(after.session).not.toContain(sentinel);
  expect(after.url).not.toContain(sentinel);
  expect(after.bodyContains).toBe(false);
  expect(consoleMessages.join('\n')).not.toContain(sentinel);
  expect(JSON.stringify(server.requests.slice(requestStart))).not.toContain(sentinel);
  expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
  console.log('[SCN-008-002] confirmation=disabled');
  console.log('[SCN-008-002] redaction=value-not-echoed');
  console.log('[SCN-008-002] generation=' + after.diagnostics.generation);
  console.log('[SCN-008-002] currentUnchanged=true');
  console.log('[SCN-008-002] storageSentinel=false');
  console.log('[SCN-008-002] consoleSentinel=false');
  console.log('[SCN-008-002] urlSentinel=false');
  console.log('[SCN-008-002] requestSentinel=false');
});

test('Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes', async ({ browser }) => {
  const outcomes = [];
  for (const mode of ['durable', 'session', 'memory']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await blockStorage(page, mode);
    const browserRequests = await openRoute(page);
    await expect(page.locator('#storageMode')).toContainText(mode === 'durable' ? 'Durable' : mode === 'session' ? 'Session-only' : 'Memory-only');
    if (mode !== 'durable') await expect(page.locator('#storageWarning')).toContainText('closes with this tab');
    await importValid(page, `${mode} portfolio`);
    await expect(page.locator('#commitResult')).toHaveText(mode === 'durable'
      ? 'Verified durable local revision.'
      : 'Verified for this tab only. No durable-save claim.');
    const before = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
    expect(before.savedDurably).toBe(mode === 'durable');
    const invalidBytes = (await import('node:fs')).readFileSync(resolve(FIXTURE_ROOT, 'invalid-secret-portfolio.csv'), 'utf8');
    await page.locator('#portfolioFile').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from(invalidBytes) });
    await expect(page.locator('#confirmImport')).toBeDisabled();
    const after = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
    expect(after.currentPortfolioId).toBe(before.currentPortfolioId);
    expect(after.generation).toBe(before.generation);
    expect(after.storageMode).toBe(mode);
    expect(after.savedDurably).toBe(mode === 'durable');
    expect(browserRequests.length).toBeGreaterThan(0);
    expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
    expect(await page.evaluate(async () => !navigator.serviceWorker.controller && (await navigator.serviceWorker.getRegistrations()).length === 0)).toBe(true);
    if (mode === 'session') {
      await page.reload();
      await expect.poll(async () => page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__ ? window.__PORTFOLIO_DIAGNOSTICS__.currentPortfolioId : null)).toBe(before.currentPortfolioId);
    }
    outcomes.push(`${mode}:${after.generation}:${after.storageMode}`);
    await context.close();
  }
  expect(outcomes).toHaveLength(3);
  console.log('[TP-01-05] modes=' + outcomes.join(','));
  console.log('[TP-01-05] durable=true');
  console.log('[TP-01-05] session=true');
  console.log('[TP-01-05] memory=true');
  console.log('[TP-01-05] priorRevisionPreserved=true');
  console.log('[TP-01-05] falseDurableClaim=false');
  console.log('[TP-01-05] sessionWarning=true');
  console.log('[TP-01-05] externalProviders=0');
});