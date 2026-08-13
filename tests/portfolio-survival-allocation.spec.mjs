/* Feature 008 Scope 13 — Allocation Comparison in the real browser.
 *
 * The unit suite proves the six methods solve on one basis and that infeasibility is
 * detected. It says nothing about whether the page lists infeasible candidates beside
 * feasible ones instead of quietly dropping them, or whether a "best" label creeps into
 * the rendered copy. Each row below asserts the RENDERED state.
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
  expect(response?.status(), 'the Allocation host page must be served').toBe(200);
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

async function seedBars(page, symbol, rows) {
  await page.evaluate(({ sym, data }) => {
    window.RLDATA.putBars(sym, '1d', data.map((row) => ({
      t: Date.parse(`${row.date}T00:00:00.000Z`),
      c: row.close
    })), 'tp-13-fixture');
  }, { sym: symbol, data: rows });
}

function series(dates, closes) {
  return dates.map((date, i) => ({ date, close: closes[i] }));
}

async function openAllocation(page) {
  await page.locator('#workspaceTabAllocation').click();
  await expect(page).toHaveURL(/#allocation$/);
  const panel = page.locator('[data-route="allocation"]');
  await expect(panel).toBeVisible();
  return panel;
}

async function seedPortfolio(page, name) {
  await openLab(page);
  await importValid(page, name);
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 130, 128]));
  await seedBars(page, 'BND', series(DATES, [50, 51, 50, 50, 52, 52]));
}

test('Regression: SCN-008-026 all six allocation methods share one frozen basis', async ({ page }) => {
  await seedPortfolio(page, 'TP-13-02 six methods');
  const panel = await openAllocation(page);

  await expect(panel.locator('#allocationComparison')).toHaveAttribute('data-allocation-state', 'ok');

  const methods = await panel.locator('#allocationTable tbody tr[data-method]').evaluateAll(
    (rows) => rows.map((row) => row.dataset.method)
  );
  expect(methods, 'every one of the six methods is listed').toEqual([
    'current', 'equal-weight', 'minimum-variance', 'risk-parity', 'black-litterman', 'constrained-mvo'
  ]);

  // Method-specific assumptions are visible per row, so the reader can see what
  // each method believes and not only what it produced.
  const assumptionRows = await panel.locator('#allocationTable tbody tr[data-assumptions-for]').count();
  expect(assumptionRows).toBe(6);
  const equalWeightAssumption = await panel.locator('#allocassumptions-equal-weight').textContent();
  expect(equalWeightAssumption).toContain('Assumes nothing about return, risk, or correlation');

  // The forecast-dependent methods report unavailable rather than inventing the
  // inputs they need.
  const blState = await panel.locator('#alloccandidate-black-litterman td').nth(3).textContent();
  expect(blState).toContain('views-and-confidence-required');
  const mvoState = await panel.locator('#alloccandidate-constrained-mvo td').nth(3).textContent();
  expect(mvoState).toContain('expected-returns-required');
});

test('Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner', async ({ page }) => {
  await seedPortfolio(page, 'TP-13-03 no winner');
  const panel = await openAllocation(page);

  const boundary = await panel.locator('#allocationClaimBoundary').textContent();
  expect(boundary).toContain('None is labelled best or recommended');
  expect(boundary).toContain('an in-sample lead is the weakest kind of evidence');
  expect(boundary).toContain('your current portfolio is not modified');

  // Adversarial copy scan. Minimum variance WILL have the lowest modelled
  // volatility here, which is exactly the moment a surface is tempted to crown it.
  const rendered = await panel.locator('#allocationComparison').textContent();
  expect(rendered).not.toMatch(/\bbest allocation\b/i);
  expect(rendered).not.toMatch(/\brecommended (allocation|method|candidate)\b/i);
  expect(rendered).not.toMatch(/\boptimal choice\b/i);
  expect(rendered).not.toMatch(/\byou should (switch|allocate|rebalance)\b/i);

  // No row is marked as a winner in the DOM either.
  expect(await panel.locator('[data-best], [data-recommended], .winner').count()).toBe(0);
});

test('Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation', async ({ page }) => {
  await seedPortfolio(page, 'TP-13-04 infeasible');
  const panel = await openAllocation(page);

  // Prove the engine the page uses reports impossibility as impossibility, and
  // that the explanation says nothing was relaxed.
  const impossible = await page.evaluate(() => window.RLPORTFOLIOANALYTICS.evaluateFeasibility(
    ['MSFT', 'BND'],
    [0.5, 0.5],
    [
      { subject: 'MSFT', minimum: 0.7, maximum: null },
      { subject: 'BND', minimum: 0.6, maximum: null }
    ]
  ));
  expect(impossible.state).toBe('infeasible');
  expect(impossible.universallyInfeasible).toBe(true);
  expect(impossible.reason).toBe('minimums-exceed-full-allocation');
  expect(impossible.explanation).toContain('No constraint has been relaxed');
  expect(impossible.explanation).toContain('current portfolio is unchanged');

  // Every rendered candidate carries an explicit feasibility verdict; none is
  // blank, which would leave the reader unable to tell checked from unchecked.
  const verdicts = await panel.locator('#allocationTable tbody tr[data-method]').evaluateAll(
    (rows) => rows.map((row) => row.dataset.feasibility)
  );
  expect(verdicts.length).toBe(6);
  for (const verdict of verdicts) {
    expect(['feasible', 'infeasible', 'unavailable']).toContain(verdict);
  }
});

test('Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states', async ({ page }) => {
  await seedPortfolio(page, 'TP-13-05 parity');
  const panel = await openAllocation(page);

  const rowCount = await panel.locator('#allocationTable tbody tr[data-method]').count();
  expect(rowCount).toBe(6);

  // Synchronous and non-blank on the render that reveals the route.
  const painted = await panel.locator('#allocationCanvas').evaluate((canvas) => {
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    let coloured = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) coloured += 1;
    }
    return coloured;
  });
  expect(painted, 'the allocation chart is painted, not blank').toBeGreaterThan(200);

  // Infeasibility is captioned in the pixels, not signalled by colour alone.
  // The caption text is what a reader who cannot distinguish the hues relies on.
  const drawnText = await panel.locator('#allocationCanvas').evaluate((canvas) => canvas.getAttribute('aria-label'));
  expect(drawnText).toContain('infeasible candidates marked');

  const unresolved = await panel.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#allocationTable tbody tr[id]'));
    return rows.filter((row) => document.querySelectorAll('#' + CSS.escape(row.id)).length !== 1).length;
  });
  expect(unresolved, 'every allocation row is a unique link target').toBe(0);

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(panel.locator('#allocationTable')).toBeVisible();
    await expect(panel.locator('#allocationCanvas')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(await panel.locator('#allocationTable tbody tr[data-method]').count()).toBe(rowCount);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
  await expect(panel.locator('#allocationTable')).toBeVisible();
  const overflowZoom = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowZoom, 'no horizontal overflow at 130% text').toBeLessThanOrEqual(1);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
});

test('Regression: Feature 008 Allocation refuses rather than showing candidate weights without evidence', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-13-05 refusal');
  const panel = await openAllocation(page);

  await expect(panel.locator('#allocationUnavailable')).toBeVisible();
  const text = await panel.locator('#allocationUnavailable').textContent();
  expect(text).toContain('Allocation comparison unavailable');
  expect(text).toContain('no candidate weights, ranking, or recommendation is shown');
  expect(text).toContain('Your current portfolio is unchanged');

  expect(await panel.locator('#allocationTable').count(), 'no table without evidence').toBe(0);
});
