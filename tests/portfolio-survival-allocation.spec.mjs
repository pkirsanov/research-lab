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

/* ---------------------------------------------------------------------------
   Scope 14 — sensitivity ranges and the explicit Black-Litterman editor
   --------------------------------------------------------------------------- */

test('Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions', async ({ page }) => {
  await seedPortfolio(page, 'TP-14-03 sensitivity');
  const panel = await openAllocation(page);

  await expect(panel.locator('#allocationSensitivity')).toHaveAttribute('data-sensitivity-state', 'ok');

  // Trial accounting is visible: a range built on an undisclosed number of
  // trials cannot be judged by a reader.
  const trials = await panel.locator('#sensitivityTrials').textContent();
  expect(trials).toMatch(/\d+ valid trials?/);
  expect(trials).toMatch(/\d+ failed/);
  expect(trials).toContain('declared perturbations');
  expect(trials).toContain('instability threshold');

  // Cells are read row-wise rather than by nth-child, because nth-child counts
  // the row-header th and every td index would otherwise be off by one.
  const sensitivityRows = await panel.locator('#sensitivityTable tbody tr').evaluateAll(
    (rows) => rows.map((row) => Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent))
  );
  expect(sensitivityRows.length).toBeGreaterThan(1);

  // Every holding shows a RANGE, never a bare point weight.
  for (const cells of sensitivityRows) {
    expect(cells[0], 'a weight must be shown as a low-to-high range').toMatch(/%\s+to\s+.*%/);
  }

  // Each row carries an explicit stability verdict from the declared set,
  // rather than a blank a reader cannot distinguish from "not checked".
  for (const cells of sensitivityRows) {
    expect(['Unstable across the declared set', 'Stable on this set']).toContain(cells[2]);
  }

  // Reversal conditions are always reported, including the honest "none" case.
  await expect(panel.locator('#sensitivityReversals')).toBeVisible();
  expect(await panel.locator('#sensitivityReversals li').count()).toBeGreaterThan(0);

  const claim = await panel.locator('#sensitivityClaimBoundary').textContent();
  expect(claim).toContain('perturbations');
});

test('Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence', async ({ page }) => {
  await seedPortfolio(page, 'TP-14-04 behavior exclusion');
  const panel = await openAllocation(page);

  await expect(panel.locator('#blackLittermanEditor')).toBeVisible();

  // With no stated view the candidate is equilibrium-only and the posterior
  // equals the implied equilibrium on every row.
  await expect(panel.locator('#blackLittermanEditor')).toHaveAttribute('data-posterior-state', 'equilibrium-only');
  const before = await panel.locator('#blTable tbody tr').evaluateAll((rows) => rows.map((row) => {
    const cells = Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent);
    return { equilibrium: cells[0], view: cells[1], posterior: cells[2] };
  }));
  expect(before.length).toBeGreaterThan(1);
  for (const row of before) {
    expect(row.view).toBe('None stated');
    expect(row.posterior, 'with no view the posterior IS the equilibrium').toBe(row.equilibrium);
  }

  // The exclusion statement is rendered from the engine's own accounting, so it
  // cannot drift from what actually happened.
  const exclusion = await panel.locator('#blExclusionStatement').textContent();
  expect(exclusion).toMatch(/behaviour signal|No behaviour signal/);

  const note = await panel.locator('#blNote').textContent();
  expect(note).toContain('0 views derived');
  expect(note).toContain('No expected return, confidence, or view is prefilled or suggested');

  // Nothing is prefilled: the editor fields start empty regardless of holdings.
  expect(await panel.locator('#blExpectedReturn').inputValue()).toBe('');
  expect(await panel.locator('#blConfidence').inputValue()).toBe('');

  // An incomplete view is refused rather than part-accepted.
  await panel.locator('#blApply').click();
  await expect(panel.locator('#blError')).toContainText('requires an expected return and a confidence');
  await expect(panel.locator('#blackLittermanEditor')).toHaveAttribute('data-posterior-state', 'equilibrium-only');
});

test('Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate', async ({ page }) => {
  await seedPortfolio(page, 'TP-14-05 explicit view');
  const panel = await openAllocation(page);

  const readBlColumn = (index) => panel.locator('#blTable tbody tr').evaluateAll(
    (rows, i) => rows.map((row) => Array.from(row.querySelectorAll('td'))[i].textContent), index
  );

  const equilibriumBefore = await readBlColumn(0);
  const subject = await panel.locator('#blSubject').inputValue();

  await panel.locator('#blExpectedReturn').fill('0.2');
  await panel.locator('#blConfidence').fill('0.8');
  await panel.locator('#blApply').click();

  await expect(panel.locator('#blackLittermanEditor')).toHaveAttribute('data-posterior-state', 'ok');

  // The equilibrium column is UNCHANGED by the view. If stating a view rewrote
  // the equilibrium, the reader could no longer see what the market thought.
  const equilibriumAfter = await readBlColumn(0);
  expect(equilibriumAfter, 'a stated view must not alter the implied equilibrium').toEqual(equilibriumBefore);

  // The stated view is shown as the user's own, with its confidence.
  const viewCells = await readBlColumn(1);
  const stated = viewCells.filter((cell) => cell !== 'None stated');
  expect(stated.length).toBe(1);
  expect(stated[0]).toContain('20.00%');
  expect(stated[0]).toContain('confidence 0.8');

  // The posterior moved and is now distinct from the equilibrium on the viewed row.
  const rowCells = await panel.locator('#bl-' + subject).locator('td').allTextContents();
  expect(rowCells[2], 'the posterior must differ from the equilibrium once a view is stated').not.toBe(rowCells[0]);

  const note = await panel.locator('#blNote').textContent();
  expect(note).toContain('which part of the answer is the market');
  expect(note).toContain('0 views derived');
});

test('Regression: Feature 008 allocation sensitivity ranges and Black Litterman editor preserve mobile table parity', async ({ page }) => {
  await seedPortfolio(page, 'TP-14-06 parity');
  const panel = await openAllocation(page);

  const sensitivityRows = await panel.locator('#sensitivityTable tbody tr').count();
  const blRows = await panel.locator('#blTable tbody tr').count();
  expect(sensitivityRows).toBeGreaterThan(1);
  expect(blRows).toBe(sensitivityRows);

  const unresolved = await panel.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#sensitivityTable tbody tr[id], #blTable tbody tr[id]'));
    return rows.filter((row) => document.querySelectorAll('#' + CSS.escape(row.id)).length !== 1).length;
  });
  expect(unresolved, 'every sensitivity and BL row is a unique link target').toBe(0);

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(panel.locator('#sensitivityTable')).toBeVisible();
    await expect(panel.locator('#blTable')).toBeVisible();
    await expect(panel.locator('#allocationCanvas')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(await panel.locator('#sensitivityTable tbody tr').count()).toBe(sensitivityRows);
    expect(await panel.locator('#blTable tbody tr').count()).toBe(blRows);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
  await expect(panel.locator('#sensitivityTable')).toBeVisible();
  await expect(panel.locator('#blTable')).toBeVisible();
  const overflowZoom = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowZoom, 'no horizontal overflow at 130% text').toBeLessThanOrEqual(1);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
});
