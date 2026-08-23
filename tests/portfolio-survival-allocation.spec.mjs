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
const PAGE_ERRORS = new WeakMap();

test.beforeAll(async () => {
  server = await startPortfolioServer();
});

test.afterAll(async () => {
  if (server) await server.close();
});

const DATES = ['2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-11'];

async function openLab(page) {
  const errors = [];
  PAGE_ERRORS.set(page, errors);
  page.on('pageerror', (error) => errors.push(String(error)));
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

async function applyAllocationInputs(page, panel, expectedReturns = '0.04, 0.08', benchmarkWeights = '0.5, 0.5') {
  await panel.locator('#allocationExpectedReturns').fill(expectedReturns);
  await panel.locator('#blBenchmarkWeights').fill(benchmarkWeights);
  await panel.locator('#allocationRiskAversion').fill('2.5');
  await panel.locator('#allocationApplyInputs').click();
  expect(PAGE_ERRORS.get(page), 'applying complete research inputs must not throw').toEqual([]);
  await expect(panel.locator('#allocationInputStatus')).toContainText('are active for this local comparison');
}

async function addExplicitView(panel, central = 0.20) {
  await panel.locator('#blHorizonSessions').fill('63');
  await panel.locator('#blMagnitudeLow').fill(String(central - 0.02));
  await panel.locator('#blExpectedReturn').fill(String(central));
  await panel.locator('#blMagnitudeHigh').fill(String(central + 0.02));
  await panel.locator('#blConfidenceSource').selectOption('user-stated-range');
  await panel.locator('#blUncertaintyVariance').fill('0.0025');
  await panel.locator('#blInvalidation').fill('Invalidate when the stated thesis or horizon changes.');
  await panel.locator('#blApply').click();
  await expect(panel.locator('#blackLittermanEditor')).toHaveAttribute('data-posterior-state', 'ok');
}

async function declareSurvivalFloor(page, floor = '85000') {
  await page.locator('#workspaceTabPathLab').click();
  const pathPanel = page.locator('[data-route="path-lab"]');
  await expect(pathPanel).toBeVisible();
  await pathPanel.locator('#survivalFloor').fill(floor);
  await pathPanel.locator('#survivalFloorApply').click();
}

async function confirmMandate(page, fixtureName) {
  await page.locator('#mandateFile').setInputFiles(resolve(FIXTURE_ROOT, fixtureName));
  await expect(page.locator('#mandateResult')).not.toHaveText('No mandate draft previewed.');
  await expect(page.locator('#confirmMandate')).toBeEnabled();
  await page.locator('#confirmMandate').click();
  await expect(page.locator('#currentMandate')).toContainText('Current mandate');
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
  const blState = await panel.locator('#alloccandidate-black-litterman td').last().textContent();
  expect(blState).toContain('black-litterman-input-invalid');
  const mvoState = await panel.locator('#alloccandidate-constrained-mvo td').last().textContent();
  expect(mvoState).toContain('expected-returns-or-risk-aversion');
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

  // No benchmark is inferred from holdings or equal weight.
  await expect(panel.locator('#blackLittermanEditor')).toHaveAttribute('data-posterior-state', 'unavailable');
  expect(await panel.locator('#allocationExpectedReturns').inputValue()).toBe('');
  expect(await panel.locator('#blBenchmarkWeights').inputValue()).toBe('');

  await applyAllocationInputs(page, panel);

  // With an explicit benchmark but no stated view the candidate is
  // equilibrium-only and the posterior equals the implied equilibrium.
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

  // Nothing view-shaped is prefilled regardless of holdings.
  expect(await panel.locator('#blExpectedReturn').inputValue()).toBe('');
  expect(await panel.locator('#blHorizonSessions').inputValue()).toBe('');
  expect(await panel.locator('#blUncertaintyVariance').inputValue()).toBe('');

  // An incomplete view is refused rather than part-accepted.
  await panel.locator('#blApply').click();
  await expect(panel.locator('#blError')).toContainText('requires a positive horizon');
  await expect(panel.locator('#blackLittermanEditor')).toHaveAttribute('data-posterior-state', 'equilibrium-only');
});

test('Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate', async ({ page }) => {
  await seedPortfolio(page, 'TP-14-05 explicit view');
  const panel = await openAllocation(page);

  await applyAllocationInputs(page, panel);

  const readBlColumn = (index) => panel.locator('#blTable tbody tr').evaluateAll(
    (rows, i) => rows.map((row) => Array.from(row.querySelectorAll('td'))[i].textContent), index
  );

  const equilibriumBefore = await readBlColumn(0);
  const subject = await panel.locator('#blSubject').inputValue();

  await addExplicitView(panel, 0.20);

  // The equilibrium column is UNCHANGED by the view. If stating a view rewrote
  // the equilibrium, the reader could no longer see what the market thought.
  const equilibriumAfter = await readBlColumn(0);
  expect(equilibriumAfter, 'a stated view must not alter the implied equilibrium').toEqual(equilibriumBefore);

  // The stated view is shown as the user's own range, with its confidence source.
  const viewCells = await readBlColumn(1);
  const stated = viewCells.filter((cell) => cell !== 'None stated');
  expect(stated.length).toBe(1);
  expect(stated[0]).toContain('18.00% to 22.00%');
  expect(stated[0]).toContain('user-stated-range');

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
  await applyAllocationInputs(page, panel);

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

test('Regression: SCN-008-050 six real allocation methods enforce one complete basis and explicit views', async ({ page }) => {
  await seedPortfolio(page, 'TP-24-03 complete allocation');
  await declareSurvivalFloor(page);
  const panel = await openAllocation(page);
  await applyAllocationInputs(page, panel);
  await addExplicitView(panel, 0.16);
  await panel.locator('#allocationRunSensitivity').click();
  await expect(panel.locator('#allocationSensitivityStatus')).toContainText('declared method-axis trials completed');

  await expect(panel.locator('#allocationComparison')).toHaveAttribute('data-allocation-state', 'ok');
  const basisFingerprint = await panel.locator('#allocationComparison').getAttribute('data-basis-fingerprint');
  expect(basisFingerprint).toMatch(/^fnv1a64:/);
  const rows = panel.locator('#allocationTable tbody tr[data-method]');
  expect(await rows.count()).toBe(6);
  expect(await rows.evaluateAll((items) => new Set(items.map((item) => item.dataset.basisFingerprint)).size)).toBe(1);

  const methods = await rows.evaluateAll((items) => items.map((item) => item.dataset.method));
  expect(methods).toEqual([
    'current', 'equal-weight', 'minimum-variance', 'risk-parity', 'black-litterman', 'constrained-mvo'
  ]);
  await expect(panel.locator('#alloccandidate-risk-parity')).toContainText('ERC residual');
  await expect(panel.locator('#alloccandidate-constrained-mvo')).toContainText('KKT residual');
  for (const method of methods) {
    const text = await panel.locator(`#alloccandidate-${method}`).textContent();
    expect(text).toContain('shared paths');
    expect(text).toContain('Turnover');
    expect(text).toMatch(/survival \d+\.\d%/);
  }

  await expect(panel.locator('#allocationCompleteSensitivity')).toHaveAttribute('data-sensitivity-state', 'ok');
  expect(await panel.locator('#allocationCompleteSensitivityTable tbody tr').count()).toBe(6);
  const sensitivitySummary = await panel.locator('#allocationSensitivitySummary').textContent();
  for (const axis of [
    'history', 'means', 'covariance', 'views', 'costs', 'assetBounds',
    'groupBounds', 'turnover', 'cash', 'leverage', 'riskAversion'
  ]) expect(sensitivitySummary).toContain(axis);

  const boundary = await panel.locator('#allocationClaimBoundary').textContent();
  expect(boundary).toContain('None is labelled best or recommended');
  expect(boundary).toContain('your current portfolio is not modified');
  expect(await panel.locator('[data-best], [data-recommended], .winner').count()).toBe(0);
});

test('Regression: SCN-008-050 infeasible constraints remain visible and explicit BL posterior changes allocation', async ({ page }) => {
  await seedPortfolio(page, 'TP-24-05 constraints and posterior');
  await confirmMandate(page, 'mandate-allocation-infeasible.json');
  const panel = await openAllocation(page);

  await expect(panel.locator('#alloccandidate-current')).toHaveAttribute('data-feasibility', 'infeasible');
  await expect(panel.locator('[data-infeasible-for="current"]')).toContainText('No constraint was relaxed');

  await applyAllocationInputs(page, panel);
  const equilibriumWeights = await panel.locator('#alloccandidate-black-litterman td').nth(0).textContent();
  const equilibriumColumn = await panel.locator('#blTable tbody tr td:nth-child(4)').allTextContents();
  await addExplicitView(panel, 0.20);
  const viewedWeights = await panel.locator('#alloccandidate-black-litterman td').nth(0).textContent();
  const posteriorColumn = await panel.locator('#blTable tbody tr td:nth-child(4)').allTextContents();
  expect(viewedWeights).not.toBe(equilibriumWeights);
  expect(posteriorColumn).not.toEqual(equilibriumColumn);
  await expect(panel.locator('#blackLittermanEditor')).toHaveAttribute('data-posterior-state', 'ok');
  expect(await panel.locator('#alloccandidate-black-litterman').getAttribute('data-feasibility')).toBe('feasible');
});

/* Scope 15 needs a history long enough for real walk-forward folds. The dossier
   REFUSES on a short sample ('folds-exceed-sample'), which is correct behaviour
   and is asserted separately below - so the satisfied path has to be fed a
   sample that genuinely supports the declared fold count rather than the fold
   count being lowered to fit the fixture. */
const LONG_DATES = Array.from({ length: 16 }, (_, i) => {
  const day = new Date(Date.UTC(2026, 3, 6 + i));
  return day.toISOString().slice(0, 10);
});

async function seedLongHistory(page, name) {
  await openLab(page);
  await importValid(page, name);
  await seedBars(page, 'MSFT', series(LONG_DATES, [100, 104, 99, 107, 112, 108, 115, 111, 119, 124, 118, 127, 131, 126, 134, 139]));
  await seedBars(page, 'BND', series(LONG_DATES, [50, 50.2, 50.1, 50.4, 50.3, 50.6, 50.5, 50.8, 50.7, 51, 50.9, 51.2, 51.1, 51.4, 51.3, 51.6]));
}

async function openDossier(page) {
  await page.locator('#workspaceTabDossier').click();
  await expect(page).toHaveURL(/#dossier$/);
  const panel = page.locator('[data-route="dossier"]');
  await expect(panel).toBeVisible();
  return panel;
}

test('Regression: SCN-008-031 dossier separates in sample walk forward costs and trials', async ({ page }) => {
  await seedLongHistory(page, 'TP-15-03 dossier separation');
  const panel = await openDossier(page);
  await expect(panel.locator('#researchDossier')).toBeVisible();
  await expect(panel.locator('#dossierTable')).toBeVisible();

  /* Three separate figures. A single blended "backtest return" is exactly the
     shape this scope exists to refuse: the in-sample number is the one the rule
     was chosen to maximise, so presenting it merged with the others hides the
     part that means least. Cells are read row-wise because nth-child counts the
     row header. */
  const rows = await panel.evaluate((root) => Array.from(root.querySelectorAll('#dossierTable tbody tr')).map((tr) => ({
    measure: tr.dataset.measure,
    result: Array.from(tr.querySelectorAll('td'))[0].textContent.trim(),
    answers: Array.from(tr.querySelectorAll('td'))[1].textContent.trim()
  })));
  expect(rows.map((r) => r.measure)).toEqual(['in-sample', 'walk-forward', 'cost-adjusted']);
  rows.forEach((row) => expect(row.result).toMatch(/^-?\d+\.\d\d%$/));

  /* Costs must strictly reduce the walk-forward figure, or the cost row is
     decorative rather than an adjustment. */
  const asNumber = (text) => Number(text.replace('%', ''));
  expect(asNumber(rows[2].result)).toBeLessThan(asNumber(rows[1].result));
  expect(rows[1].answers).toContain('after the one used to fit');

  /* The trial count must be on screen with its consequence stated. A count
     alone invites the reader to skip past it; searching many rules and
     publishing the best is the commonest way a backtest overstates itself. */
  const trials = (await panel.locator('#dossierTrials').textContent()).trim();
  expect(trials).toMatch(/\d+/);
  expect(trials.toLowerCase()).toContain('searched');
  expect(trials.toLowerCase()).toContain('chance');

  const limitations = await panel.evaluate((root) => Array.from(root.querySelectorAll('#dossierLimitations li')).map((li) => li.textContent.trim()));
  expect(limitations.length).toBeGreaterThanOrEqual(4);
  const joined = limitations.join(' | ').toLowerCase();
  expect(joined).toContain('selection');
  expect(joined).toContain('survivorship');

  /* No historical result may be described as proof of future superiority. The
     boundary has to REFUSE explicitly, not merely omit the claim. */
  const boundary = (await panel.locator('#dossierClaimBoundary').textContent()).toLowerCase();
  expect(boundary).toMatch(/no claim|makes no claim|not a prediction/);
  const bodyText = (await panel.locator('#researchDossier').textContent()).toLowerCase();
  expect(bodyText).not.toMatch(/\bproves\b/);
  expect(bodyText).not.toMatch(/\bguaranteed\b/);
  expect(bodyText).not.toMatch(/this rule will outperform(?! in future\.)/);
});

test('Regression: SCN-008-032 efficiency claim is scoped to one tested information set', async ({ page }) => {
  await seedLongHistory(page, 'TP-15-03 efficiency scope');
  const panel = await openDossier(page);
  await expect(panel.locator('#efficiencyClaim')).toBeVisible();
  expect(await panel.locator('#efficiencyClaim').getAttribute('data-efficiency-state')).toBe('ok');

  /* "The market is inefficient" is not a testable sentence. A test uses one
     information set over one sample, so the conclusion binds that and nothing
     else - and the two forms NOT tested have to be named, or a reader will
     silently generalise from one result to all three. */
  const scope = (await panel.locator('#efficiencyScope').textContent()).trim();
  expect(scope).toContain('weak');
  expect(scope).toContain('information set');
  expect(scope).toContain('sample');
  expect(scope).toContain('untested here');
  expect(scope).toContain('semi-strong');
  expect(scope).toContain('strong');

  const alternatives = await panel.evaluate((root) => Array.from(root.querySelectorAll('#efficiencyAlternatives li')).map((li) => li.textContent.trim()));
  expect(alternatives.length).toBeGreaterThanOrEqual(4);
  const altText = alternatives.join(' | ').toLowerCase();
  expect(altText).toContain('data snooping');
  expect(altText).toContain('risk');

  /* The product must never ASSERT that efficiency is refuted. This is checked
     STRUCTURALLY, because a negative substring check on the prose also matches
     the sentence that does the refusing ("...does not claim that all
     market-efficiency hypotheses are false"). Banning the phrase would ban the
     disclaimer along with the claim. */
  expect(await panel.locator('#efficiencyClaim').getAttribute('data-all-forms-refuted')).toBe('false');
  const claimText = (await panel.locator('#efficiencyClaim').textContent()).toLowerCase();
  expect(claimText).not.toMatch(/\bproves? (that )?markets/);
  expect(claimText).not.toMatch(/markets are inefficient\.(?! )/);
  const efficiencyBoundary = (await panel.locator('#efficiencyClaimBoundary').textContent()).toLowerCase();
  expect(efficiencyBoundary).toMatch(/does not claim|and to nothing else/);
  expect(efficiencyBoundary).toContain('untested here');
});

test('Regression: SCN-008-033 correlation never emits a substantially identical verdict', async ({ page }) => {
  await seedLongHistory(page, 'TP-15-03 replacement research');
  const panel = await openDossier(page);
  await expect(panel.locator('#replacementComparison')).toBeVisible();

  /* Whether two securities are substantially identical is a legal and tax
     question. This tool has no standing to answer it, and the cost of being
     wrong is owed to a tax authority - so it delivers the evidence and stops. */
  expect(await panel.locator('#replacementComparison').getAttribute('data-adjudicated')).toBe('false');

  const inputs = await panel.evaluate((root) => Array.from(root.querySelectorAll('#replacementInputs li')).map((li) => ({
    kind: li.dataset.factKind || null,
    text: li.textContent.trim()
  })));
  expect(inputs.length).toBeGreaterThanOrEqual(1);
  expect(inputs.some((row) => row.kind === 'correlation')).toBe(true);

  /* Refusing "not substantially identical" matters exactly as much as refusing
     "substantially identical" - a false clearance is the more expensive error. */
  const text = (await panel.locator('#replacementComparison').textContent()).toLowerCase();
  expect(text).not.toMatch(/\bis substantially identical\b/);
  expect(text).not.toMatch(/\bnot substantially identical\b/);
  expect(text).not.toContain('safe to');
  expect(text).not.toContain('wash sale is');
  const boundary = (await panel.locator('#replacementClaimBoundary').textContent()).toLowerCase();
  expect(boundary).toMatch(/not a determination|no conclusion/);
  expect(boundary).toMatch(/tax|legal/);
  expect(boundary).toContain('no threshold');
});

test('Regression: Feature 008 dossier ledgers claims corrections and private export remain accessible without mobile overlap', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedLongHistory(page, 'TP-15-04 dossier mobile parity');
  const panel = await openDossier(page);
  await expect(panel.locator('#dossierTable')).toBeVisible();

  /* A dossier that overflows the body on a phone is a dossier nobody reads, and
     the claim boundaries are the part most worth reading. */
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'no horizontal body overflow at phone width').toBeLessThanOrEqual(1);

  const boxes = await panel.evaluate((root) => ['#dossierTable', '#dossierTrials', '#dossierLimitations', '#dossierClaimBoundary', '#efficiencyScope', '#replacementInputs', '#replacementClaimBoundary']
    .map((selector) => {
      const node = root.querySelector(selector);
      const rect = node.getBoundingClientRect();
      return { selector, top: rect.top, bottom: rect.bottom, width: rect.width };
    }));
  boxes.forEach((box) => expect(box.width, `${box.selector} is rendered`).toBeGreaterThan(0));
  for (let i = 1; i < boxes.length; i += 1) {
    expect(boxes[i].top, `${boxes[i].selector} does not overlap ${boxes[i - 1].selector}`).toBeGreaterThanOrEqual(boxes[i - 1].bottom - 1);
  }

  /* Every dossier figure stays reachable as exact table text at phone width -
     the numbers are the evidence, so they may not be reduced to a graphic. */
  const cells = await panel.evaluate((root) => Array.from(root.querySelectorAll('#dossierTable tbody tr')).map((tr) => Array.from(tr.querySelectorAll('td'))[0].textContent.trim()));
  expect(cells).toHaveLength(3);
  cells.forEach((cell) => expect(cell).toMatch(/%$/));

  /* The private export stays reachable while the dossier work is open - a claim
     boundary the user cannot act on is inert. */
  await page.locator('#workspaceTabBrief').click();
  await expect(page.locator('#exportPortfolio')).toBeVisible();
  await expect(page.locator('#exportWarning')).toBeVisible();
});
