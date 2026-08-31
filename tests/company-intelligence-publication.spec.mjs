/*
 * Feature 028 Scope 05 — public registration, acknowledged-pair authority, and Pages.
 *
 * Real system Chrome, real production routes, real static files, and zero request interception.
 * The only temporary filesystem is the production Pages projection created by
 * scripts/build-pages-site.mjs. No test response or internal model is mocked.
 */
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTE = 'company-intelligence-lab.html';
const TOOL_ID = 'company-intelligence-lab';
const TITLE = 'Company Multi-Horizon Intelligence Lab';
const NOTE = 'notes/company-intelligence-lab.md';
const SELECTOR = 'data/company-intelligence/publication-current.json';
const PROJECTION = 'data/company-intelligence/publication-current.js';

const readJson = (relative) => JSON.parse(readFileSync(join(ROOT, relative), 'utf8'));

let site;
let registry;

test.beforeAll(async () => {
  site = await startStaticServer({ root: ROOT });
  registry = readJson('tools.json');
});

test.afterAll(async () => {
  if (site) await site.close();
});

async function openCompany(page, suffix = '') {
  const errors = [];
  const ownFailures = [];
  const origin = new URL(site.baseUrl).origin;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400) ownFailures.push(`${response.status()} ${response.url()}`);
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith(origin)) ownFailures.push(`FAILED ${request.url()} ${request.failure()?.errorText || ''}`);
  });
  const response = await page.goto(`${site.baseUrl}/${ROUTE}${suffix}`, { waitUntil: 'domcontentloaded' });
  expect(response.status()).toBe(200);
  await expect(page.locator('body')).toHaveAttribute('data-publication-authority', 'acknowledged', { timeout: 30_000 });
  await expect(page.locator('#publication-pair-band')).toBeVisible();
  expect(errors, `runtime errors: ${errors.join(' | ')}`).toEqual([]);
  expect(ownFailures, `same-origin failures: ${ownFailures.join(' | ')}`).toEqual([]);
}

test('Regression: SCN-028-001 Company Intelligence is reachable once from catalogue navigation and notes', async ({ page, request }) => {
  const entries = registry.tools.filter((tool) => tool.id === TOOL_ID);
  expect(entries).toHaveLength(1);
  const [entry] = entries;
  expect(entry.title).toBe(TITLE);
  expect(entry.file).toBe(ROUTE);
  expect(entry.notes).toBe(NOTE);
  expect(entry.status).toBe('live');

  await page.goto(`${site.baseUrl}/index.html`, { waitUntil: 'domcontentloaded' });
  const card = page.locator(`.card[data-tool-id="${TOOL_ID}"]`);
  await expect(card).toHaveCount(1);
  await expect(card.getByRole('link', { name: /open tool/i })).toHaveAttribute('href', ROUTE);
  await expect(card.getByRole('link', { name: /notes/i })).toHaveAttribute('href', NOTE);
  await page.locator('#toolFilter').fill('company intelligence');
  await expect(card).toBeVisible();

  await page.locator('#rlnav-launcher').click();
  const navItem = page.locator(`#rlnav a.rlnav-item[href="${ROUTE}"]`);
  await expect(navItem).toHaveCount(1);
  await expect(navItem).toContainText('Company Intelligence');
  await navItem.click();
  await expect(page).toHaveURL(new RegExp(`${ROUTE.replace('.', '\\.')}$`));
  await expect(page.locator(`#rlnav a.rlnav-item[href="${ROUTE}"]`)).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#page-title')).toHaveText(TITLE);
  await expect(page.locator('body')).toHaveAttribute('data-publication-authority', 'acknowledged', { timeout: 30_000 });
  await expect(page.locator('#publication-pair-band')).toHaveAttribute('data-generation-id', /.+/);

  const notes = await request.get(`${site.baseUrl}/${NOTE}`);
  expect(notes.status()).toBe(200);
  expect(await notes.text()).toMatch(/coupled publication/i);
});

test('Regression: SCN-028-018 failed refresh keeps the dated acknowledged pair visibly authoritative', async ({ page }) => {
  await openCompany(page);

  const pair = page.locator('#publication-pair-band');
  const attempt = page.locator('#publication-attempt-band');
  await expect(pair).toHaveAttribute('data-pair-state', 'stale');
  await expect(pair).toHaveAttribute('data-generation-id', /.+/);
  await expect(pair).toHaveAttribute('data-version-id', /.+/);
  await expect(pair).toContainText('Stale');
  await expect(pair).toContainText(/published/i);
  await expect(pair).not.toContainText('Current · fresh');

  await expect(attempt).toHaveAttribute('data-attempt-state', 'failed');
  await expect(attempt).toContainText('Update failed');
  await expect(attempt).toContainText('C028-PACKAGING');
  await expect(attempt).toContainText(/current pair remains/i);
  expect(await attempt.getAttribute('data-authoritative-generation-id')).toBe(await pair.getAttribute('data-generation-id'));
  expect(await attempt.getAttribute('data-attempt-generation-id')).not.toBe(await pair.getAttribute('data-generation-id'));

  const publishedRows = page.locator('#workspace-outcome-body [data-published-version-row]');
  await page.locator('#mode-power').click();
  await expect(publishedRows.first()).toBeVisible();
  await expect(publishedRows.filter({ hasText: await attempt.getAttribute('data-attempt-generation-id') })).toHaveCount(0);
});

test('Regression: SCN-028-020 file origin paints the committed pair before reconciliation and exposes no private state', async ({ page }) => {
  test.setTimeout(90_000);
  const requests = [];
  const errors = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(pathToFileURL(join(ROOT, ROUTE)).href, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveAttribute('data-publication-authority', 'acknowledged', { timeout: 30_000 });
  await expect(page.locator('#publication-pair-band')).toHaveAttribute('data-generation-id', /.+/);
  await expect(page.locator('#cockpit-horizons [data-publication-horizon]')).toHaveCount(4);
  await expect(page.locator('#rl-proto-warn')).toContainText('committed publication shown');
  await expect(page.locator('#rl-proto-warn')).toContainText('live reconciliation unavailable');
  await expect(page.locator('#publication-live-state')).toHaveText('Local file · live reconciliation unavailable');
  expect(errors, `file-origin runtime errors: ${errors.join(' | ')}`).toEqual([]);
  expect(requests.filter((url) => !url.startsWith('file://')), `off-origin requests: ${requests.join(' | ')}`).toEqual([]);

  const projection = await page.evaluate(() => globalThis.RLCOMPANYINTEL_PUBLICATION);
  expect(Object.isFrozen(projection)).toBe(true);
  expect(Object.isFrozen(projection.pair)).toBe(true);
  const forbidden = /(credential|password|token|cookie|accountId|holding|position|quantity|costBasis|profit|loss|pnl|proceeds|order|approval|execution|routing|operatorIdentity|privatePath)/i;
  const fieldNames = [];
  const walk = (value) => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) { fieldNames.push(key); walk(child); }
  };
  walk(projection);
  expect(fieldNames.filter((field) => forbidden.test(field)), `private projection fields: ${fieldNames.filter((field) => forbidden.test(field)).join(', ')}`).toEqual([]);
});

test('Regression: Company Intelligence and every acknowledged pair dependency exist in the built Pages artifact', async ({ page, request }) => {
  const destination = `.rl-scope05-site-${process.pid}`;
  const siteRoot = join(ROOT, destination);
  let packaged;
  try {
    const builder = await import('../scripts/build-pages-site.mjs');
    const plan = builder.buildPagesSite({ root: ROOT, destination });
    expect(plan.companyPublication.active).toBe(true);
    expect(plan.companyPublication.requiredPaths.length).toBeGreaterThan(8);
    for (const relative of plan.companyPublication.requiredPaths) {
      expect(existsSync(join(siteRoot, relative)), `built artifact missing ${relative}`).toBe(true);
    }

    packaged = await startStaticServer({ root: siteRoot });
    for (const relative of plan.companyPublication.requiredPaths) {
      const response = await request.get(`${packaged.baseUrl}/${relative}`);
      expect(response.status(), `${relative} must be served from the built artifact`).toBe(200);
      expect(await response.body(), `${relative} must preserve committed bytes`).toEqual(readFileSync(join(ROOT, relative)));
    }

    const response = await page.goto(`${packaged.baseUrl}/${ROUTE}`, { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toHaveAttribute('data-publication-authority', 'acknowledged', { timeout: 30_000 });
  } finally {
    if (packaged) await packaged.close();
    if (existsSync(siteRoot)) rmSync(siteRoot, { recursive: true, force: true });
  }
});

test('Regression: acknowledged pair attempt state deep links accessibility and responsive behavior preserve existing route semantics', async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 900 });
  await openCompany(page);

  const pair = page.locator('#publication-pair-band');
  const generation = await pair.getAttribute('data-generation-id');
  const version = await pair.getAttribute('data-version-id');
  const matchingBrief = pair.getByRole('link', { name: /matching Market Action brief/i });
  await expect(matchingBrief).toHaveAttribute('href', `market-brief.html?generation=${encodeURIComponent(generation)}#brief`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, '320 CSS px must not create body-level horizontal scroll').toBeLessThanOrEqual(1);
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  const zoomOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(zoomOverflow, '200 percent zoom must not create body-level horizontal scroll').toBeLessThanOrEqual(1);
  await page.evaluate(() => { document.documentElement.style.zoom = '1'; });

  await page.locator('#open-publication-lineage').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'power');
  await expect(page.locator('#workspace-outcome-heading')).toBeFocused();
  await expect(page.locator(`#workspace-outcome-body [data-published-version-row="${version}"]`)).toBeVisible();

  await page.goto(`${site.baseUrl}/market-brief.html?generation=${encodeURIComponent(generation)}#brief`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#toolReads [data-company-owner-read]')).toHaveCount(1, { timeout: 30_000 });
  const row = page.locator('#toolReads [data-company-owner-read]');
  await expect(row).toHaveAttribute('data-generation-id', generation);
  await expect(row).toHaveAttribute('data-version-id', version);
  await expect(row.locator('[data-company-horizon]')).toHaveCount(4);
  const companyLink = row.getByRole('link', { name: /exact Company Intelligence read/i });
  await expect(companyLink).toHaveAttribute('href', `company-intelligence-lab.html?symbol=MSFT&generation=${encodeURIComponent(generation)}`);

  await companyLink.click();
  await expect(page.locator('#publication-pair-band')).toHaveAttribute('data-generation-id', generation, { timeout: 30_000 });
  const navTransition = await page.locator('#rlnav').evaluate((node) => getComputedStyle(node).transitionDuration);
  expect(navTransition.split(',').every((duration) => parseFloat(duration) === 0)).toBe(true);
});
