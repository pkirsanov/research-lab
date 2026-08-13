/* Feature 008 Scope 09 — Path Lab in the real browser.
 *
 * The unit suite proves the path ENGINE is deterministic and separates its distributions. It says
 * nothing about whether the page renders what the engine returned, keeps the two uncertainty
 * sources apart on screen, or lets an expected-path claim slip into the copy. Each row below asserts
 * the RENDERED state.
 */
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

const DATES = ['2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-11'];

async function openLab(page) {
  const response = await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#brief`);
  expect(response?.status(), 'the Path Lab host page must be served').toBe(200);
  await expect(page.locator('#workspaceTabBrief')).toHaveAttribute('aria-selected', 'true');
}

async function importValid(page, name) {
  await page.locator('#portfolioName').fill(name);
  await page.locator('#portfolioFile').setInputFiles(resolve(FIXTURE_ROOT, 'valid-portfolio.csv'));
  await expect(page.locator('#previewAccepted')).toHaveText('3');
  await page.locator('#duplicateChoice').selectOption('merge');
  await page.locator('#localOnlyAcknowledgement').check();
  await page.locator('#confirmImport').click();
  await expect(page.locator('#currentRevision')).toContainText('Current revision');
}

/* Seeds the SAME shared same-origin bar cache the page reads in production. */
async function seedBars(page, symbol, rows) {
  await page.evaluate(({ sym, data }) => {
    window.RLDATA.putBars(sym, '1d', data.map((row) => ({
      t: Date.parse(`${row.date}T00:00:00.000Z`),
      c: row.close
    })), 'tp-09-fixture');
  }, { sym: symbol, data: rows });
}

async function openPathLab(page) {
  await page.locator('#workspaceTabPathLab').click();
  await expect(page).toHaveURL(/#path-lab$/);
  const panel = page.locator('[data-route="path-lab"]');
  await expect(panel).toBeVisible();
  return panel;
}

function series(dates, closes) {
  return dates.map((date, i) => ({ date, close: closes[i] }));
}

async function seedPortfolio(page, name) {
  await openLab(page);
  await importValid(page, name);
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 130, 128]));
  await seedBars(page, 'BND', series(DATES, [50, 51, 50, 50, 52, 52]));
}

test('Regression: SCN-008-018 an identical specification reproduces an identical scenario identity', async ({ page }) => {
  await seedPortfolio(page, 'TP-09-02 reproducibility');
  const panel = await openPathLab(page);
  await expect(panel.locator('#pathLab')).toHaveAttribute('data-path-state', 'ok');

  const first = await panel.locator('#pathIdentity').textContent();
  const firstBands = await panel.locator('#pathBands').innerText();

  // Leave the route and come back: the production render path runs again from scratch.
  await page.locator('#workspaceTabBrief').click();
  await expect(page.locator('#briefWorkspace')).toBeVisible();
  const again = await openPathLab(page);

  expect(await again.locator('#pathIdentity').textContent()).toBe(first);
  expect(await again.locator('#pathBands').innerText()).toBe(firstBands);

  // The identity must actually carry the fields that change a result, not be an opaque token.
  expect(first).toContain('ScenarioSpecification/v1');
  expect(first).toContain('seed=');
  expect(first).toContain('meanBlockSessions=');
  expect(first).toContain('horizonSessions=');

  // Block length and sampling assumptions are visible, not buried in the identity string.
  await expect(panel.locator('#pathMethod')).toContainText('stationary-bootstrap');
  await expect(panel.locator('#pathMethod')).toContainText('mean block');
  await expect(panel.locator('#pathMethod')).toContainText('common random streams: true');
});

test('Regression: SCN-008-019 path randomness and parameter uncertainty stay separately labelled', async ({ page }) => {
  await seedPortfolio(page, 'TP-09-03 uncertainty');
  const panel = await openPathLab(page);
  await expect(panel.locator('#pathLab')).toHaveAttribute('data-path-state', 'ok');

  // Three distributions, three rows, three distinct labels.
  await expect(panel.locator('#pathRandomness')).toContainText('Path randomness');
  await expect(panel.locator('#pathParameterUncertainty')).toContainText('Across-parameter');
  await expect(panel.locator('#pathCombined')).toContainText('Combined');

  // The most influential assumption is named on the surface.
  await expect(panel.locator('#pathInfluence')).toContainText('drift');
  await expect(panel.locator('#pathInfluence')).toContainText('Median spread');

  // ADVERSARIAL: the two uncertainty sources must not render the same figures. If the page ever
  // showed one band twice, or blended them into a single number, these would match.
  const randomness = await panel.locator('#pathRandomness').textContent();
  const combined = await panel.locator('#pathCombined').textContent();
  expect(randomness.replace('Path randomness at the central assumption', ''))
    .not.toBe(combined.replace('Combined path and parameter distribution', ''));

  // No expected-path claim, and no forecast language anywhere on the surface.
  await expect(panel.locator('#pathClaimBoundary')).toContainText('not a forecast');
  const copy = (await panel.locator('#pathLab').innerText()).toLowerCase();
  for (const banned of ['expected path', 'will reach', 'projected to', 'you can expect', 'guaranteed']) {
    expect(copy, `Path Lab must not claim: ${banned}`).not.toContain(banned);
  }
});

test('Regression: Feature 008 Path Lab table stays equivalent and stable at desktop mobile and zoom', async ({ page }) => {
  await seedPortfolio(page, 'TP-09-04 parity');
  const panel = await openPathLab(page);

  const rowCount = await panel.locator('#pathTable tbody tr').count();
  expect(rowCount).toBe(2);
  await expect(panel.locator('[data-distribution="path-randomness"]')).toBeVisible();
  await expect(panel.locator('[data-distribution="combined"]')).toBeVisible();

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(panel.locator('#pathTable')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(await panel.locator('#pathTable tbody tr').count()).toBe(rowCount);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
  await expect(panel.locator('#pathTable')).toBeVisible();
  const overflowZoom = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowZoom, 'no horizontal overflow at 130% text').toBeLessThanOrEqual(1);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
});

test('Regression: Feature 008 Path Lab refuses rather than generating a path without evidence', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-09-05 refusal');
  // Only one of the two holdings has evidence, so no portfolio return sample exists to resample.
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 130, 128]));

  const panel = await openPathLab(page);
  await expect(panel.locator('#pathUnavailable')).toBeVisible();
  await expect(panel.locator('#pathUnavailable')).toContainText('Path Lab unavailable');
  await expect(panel.locator('#pathUnavailable')).toContainText('no path, percentile, or survival figure is shown');

  // ADVERSARIAL: not one path figure may be present in the refusing state.
  for (const id of ['#pathIdentity', '#pathBands', '#pathTable', '#pathRandomness', '#pathCombined']) {
    await expect(panel.locator(id), `${id} must be absent when no sample exists`).toHaveCount(0);
  }
});
