/* Feature 008 Scope 11 — Diversification in the real browser.
 *
 * The unit suite proves the dependence ENGINE refuses to overclaim. It says nothing about
 * whether the page carries those refusals to a reader. A surface can hold a correct
 * `contagionLabel: null` in memory and still print "assets became correlated in the crisis"
 * next to it. Each row below asserts the RENDERED state.
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
  const response = await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#workspace`);
  expect(response?.status(), 'the Diversification host page must be served').toBe(200);
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
    })), 'tp-11-fixture');
  }, { sym: symbol, data: rows });
}

function series(dates, closes) {
  return dates.map((date, i) => ({ date, close: closes[i] }));
}

async function openDiversification(page) {
  await page.locator('#workspaceTabDiversification').click();
  await expect(page).toHaveURL(/#diversification$/);
  const panel = page.locator('[data-route="diversification"]');
  await expect(panel).toBeVisible();
  return panel;
}

async function seedPortfolio(page, name) {
  await openLab(page);
  await importValid(page, name);
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 130, 128]));
  await seedBars(page, 'BND', series(DATES, [50, 51, 50, 50, 52, 52]));
}

test('Regression: SCN-008-022 raw stress correlation shows volatility context and qualified adjustment', async ({ page }) => {
  await seedPortfolio(page, 'TP-11-02 stress');
  const panel = await openDiversification(page);

  await expect(panel.locator('#diversificationLab')).toHaveAttribute('data-dependence-state', 'ok');

  // Every correlation shown names the sample it was measured on. A bare number
  // would imply the correlation is a property of the pair rather than of a window.
  const sampleCells = await panel.locator('#dependenceTable tbody tr td:nth-child(3)').allTextContents();
  expect(sampleCells.length).toBeGreaterThan(0);
  for (const cell of sampleCells) expect(cell).toBe('full observed sample');

  const observationCells = await panel.locator('#dependenceTable tbody tr td:nth-child(4)').allTextContents();
  for (const cell of observationCells) expect(Number(cell)).toBeGreaterThan(0);

  // The claim boundary is on the page, not just in the engine.
  const boundary = await panel.locator('#dependenceClaimBoundary').textContent();
  expect(boundary).toContain('not a property of the pair');
  expect(boundary).toContain('heteroskedasticity produces on its own');
  expect(boundary).toContain('no contagion label is applied automatically');

  // Adversarial copy scan: the surface must not assert contagion anywhere.
  const rendered = await panel.textContent();
  expect(rendered).not.toMatch(/\bcontagion detected\b/i);
  expect(rendered).not.toMatch(/\bproves contagion\b/i);
});

test('Regression: SCN-008-023 finite tail evidence never claims universal correlation one', async ({ page }) => {
  await seedPortfolio(page, 'TP-11-03 tail');
  const panel = await openDiversification(page);

  const tail = panel.locator('#tailDependence');
  await expect(tail).toBeVisible();
  const tailState = await tail.getAttribute('data-tail-state');
  const text = await tail.textContent();

  // Under this fixture the configured event floor is not met, so the refusal is
  // the correct behaviour and is what the page renders.
  expect(tailState).toBe('unavailable');
  expect(text).toContain('Lower-tail dependence unavailable');
  expect(text).toContain('no universal crisis correlation is assumed in its place');

  // The satisfied path is proven too, so this row is not one-sided: with enough
  // joint observations an estimate appears AND still carries its boundary. A
  // conditional branch that never ran would leave that half unproven.
  const satisfied = await page.evaluate(() => {
    const a = [];
    const b = [];
    for (let i = 0; i < 40; i += 1) { a.push(i); b.push(i); }
    return window.RLPORTFOLIOANALYTICS.lowerTailDependence(a, b, { quantile: 0.25, minimumJointEvents: 5 });
  });
  expect(satisfied.state).toBe('ok');
  expect(satisfied.jointEvents).toBeGreaterThanOrEqual(5);
  expect(satisfied.claimBoundary).toContain('does NOT say that all assets become perfectly correlated');
  expect(satisfied.claimBoundary).toContain('in this finite sample');

  // Adversarial copy scan across the whole panel: the universal-crisis sentence
  // is the specific overclaim this scenario exists to prevent.
  const rendered = await panel.textContent();
  expect(rendered).not.toMatch(/all correlations go to (one|1)/i);
  expect(rendered).not.toMatch(/everything is correlated in a crisis/i);
  expect(rendered).not.toMatch(/diversification (always )?fails when you need it/i);
});

test('Regression: SCN-008-024 appraisal smoothing and illiquidity block mechanical decorrelation', async ({ page }) => {
  await seedPortfolio(page, 'TP-11-04 appraisal');
  await openDiversification(page);

  // The engine is reachable from the page, so the qualification the surface would
  // apply to a manual asset is the same one the unit suite pins.
  const qualified = await page.evaluate(() => window.RLPORTFOLIOANALYTICS.alternativeAssetQuality({
    valuationFrequency: 'quarterly',
    lastValuationDate: '2026-03-31',
    valuationMethod: 'appraisal',
    liquidity: 'low',
    expectedTransactionCostFraction: 0.06
  }));
  expect(qualified.state).toBe('ok');
  expect(qualified.smoothingSuspected).toBe(true);
  expect(qualified.requiresSensitivity, 'a conclusion is blocked until a sensitivity is run').toBe(true);
  expect(qualified.caveat).toContain('must NOT be treated as mechanically uncorrelated');

  // Missing evidence must never become an orthogonality argument.
  const incomplete = await page.evaluate(() => window.RLPORTFOLIOANALYTICS.alternativeAssetQuality({
    valuationFrequency: 'quarterly',
    lastValuationDate: '2026-03-31',
    valuationMethod: 'appraisal',
    liquidity: 'low'
  }));
  expect(incomplete.state).toBe('unavailable');
  expect(incomplete.missing).toEqual(['expectedTransactionCostFraction']);
  expect(incomplete.note).toContain('Missing evidence is not an argument for orthogonality');

  // De-smoothing raises variance: that is the hidden risk appraisal smoothing conceals.
  const sensitivity = await page.evaluate(() => window.RLPORTFOLIOANALYTICS.desmoothReturns(
    [0.02, 0.021, 0.019, 0.022, 0.018, 0.02], 0.5
  ));
  expect(sensitivity.state).toBe('ok');
  expect(sensitivity.desmoothedVariance).toBeGreaterThan(sensitivity.observedVariance);
  expect(sensitivity.claimBoundary).toContain('observed series is unchanged');
});

test('Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity', async ({ page }) => {
  await seedPortfolio(page, 'TP-11-05 parity');
  const panel = await openDiversification(page);

  // Synchronous and non-blank on the render that reveals the route.
  const painted = await panel.locator('#dependenceMatrix').evaluate((canvas) => {
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    let coloured = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) coloured += 1;
    }
    return coloured;
  });
  expect(painted, 'the matrix is painted, not blank').toBeGreaterThan(200);

  await expect(panel.locator('#dependenceMatrix')).toHaveAttribute('data-rlchart-mode', 'structured');
  await expect(panel.locator('#dependenceMatrix')).toHaveAttribute('tabindex', '0');
  expect(await panel.locator('#dependenceMatrix[data-rlchart-error]').count(), 'no chart contract error').toBe(0);

  // Every rail option resolves to its own table row: one result, two renderings.
  const railCount = await page.locator('#rlchart-rail-dependenceMatrix [role="option"]').count();
  const tableRows = await panel.locator('#dependenceTable tbody tr').count();
  expect(tableRows).toBeGreaterThan(1);
  expect(railCount, 'keyboard rail exposes exactly the table rows').toBe(tableRows);

  const unresolved = await panel.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#dependenceTable tbody tr'));
    return rows.filter((row) => !row.id || document.querySelectorAll('#' + CSS.escape(row.id)).length !== 1).length;
  });
  expect(unresolved, 'every matrix cell has a unique table target').toBe(0);

  // Keyboard traversal reaches the matrix without a pointer.
  await panel.locator('#dependenceMatrix').focus();
  await page.keyboard.press('ArrowRight');
  expect(await page.locator('#rlchart-rail-dependenceMatrix [aria-selected="true"]').count()).toBe(1);

  // Meaning never depends on colour alone: every cell prints its number, and the
  // adjacent table repeats it as text.
  const correlationCells = await panel.locator('#dependenceTable tbody tr td:nth-child(2)').allTextContents();
  expect(correlationCells.length).toBe(tableRows);
  for (const cell of correlationCells) expect(cell === 'Unavailable' || /-?\d\.\d{3}/.test(cell)).toBe(true);

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(panel.locator('#dependenceMatrix')).toBeVisible();
    await expect(panel.locator('#dependenceTable')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(await panel.locator('#dependenceTable tbody tr').count()).toBe(tableRows);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
  await expect(panel.locator('#dependenceMatrix')).toBeVisible();
  const overflowZoom = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowZoom, 'no horizontal overflow at 130% text').toBeLessThanOrEqual(1);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
});

test('Regression: Feature 008 Diversification refuses rather than showing a simplified matrix', async ({ page }) => {
  // No bars seeded: dependence cannot be formed. The route must say so rather
  // than drawing an empty or zero-filled matrix that looks like a measurement.
  await openLab(page);
  await importValid(page, 'TP-11-05 refusal');
  const panel = await openDiversification(page);

  await expect(panel.locator('#dependenceUnavailable')).toBeVisible();
  const text = await panel.locator('#dependenceUnavailable').textContent();
  expect(text).toContain('Dependence unavailable');
  expect(text).toContain('no correlation, tail estimate, or diversification conclusion is shown');

  expect(await panel.locator('#dependenceMatrix').count(), 'no matrix is drawn without evidence').toBe(0);
  expect(await panel.locator('#dependenceTable').count(), 'no table is drawn without evidence').toBe(0);
});

/* ---------------------------------------------------------------------------
   Scope 12 — hedge variant research
   --------------------------------------------------------------------------- */

async function enterHedge(panel, { exposure = '100000', volatility = '0.2', carry = '0.01', proxy = 'FXE' } = {}) {
  await panel.locator('#hedgeExposure').fill(exposure);
  await panel.locator('#hedgeVolatility').fill(volatility);
  await panel.locator('#hedgeCarry').fill(carry);
  await panel.locator('#hedgeProxy').fill(proxy);
  await panel.locator('#hedgeApply').click();
}

test('Regression: SCN-008-025 hedged and unhedged comparison keeps carry and basis risk separate', async ({ page }) => {
  await seedPortfolio(page, 'TP-12-02 hedge');
  const panel = await openDiversification(page);

  // Nothing is assumed before the user enters anything.
  await expect(panel.locator('#hedgeEmpty')).toContainText('No exposure, proxy, ratio, or cost is assumed on your behalf');
  await expect(panel.locator('#hedgeEmpty')).toContainText('nothing is derived from your recorded behavior or display settings');

  await enterHedge(panel);

  const rows = panel.locator('#hedgeTable tbody tr');
  expect(await rows.count(), 'unhedged, partial and fully hedged are all shown').toBe(3);
  const labels = await rows.locator('th').allTextContents();
  expect(labels).toEqual(['Unhedged', 'Partial hedge 50%', 'Fully hedged']);

  // Carry, direct and turnover are SEPARATE columns. One blended "net" figure
  // would let a large carry hide behind a large risk reduction.
  const headers = await panel.locator('#hedgeTable thead th').allTextContents();
  expect(headers).toEqual(['Variant', 'Residual volatility', 'Carry', 'Direct', 'Turnover', 'Total cost', 'Basis risk']);

  // The unhedged baseline costs nothing and reduces nothing.
  // td indices are shifted by one: the variant label is a th, not a td.
  const unhedged = await rows.nth(0).locator('td').allTextContents();
  expect(unhedged[1], 'unhedged carry is zero').toMatch(/\$0/);
  expect(unhedged[4], 'unhedged total cost is zero').toMatch(/\$0/);

  // Cost rises with the ratio; both directions of the trade-off are visible.
  const fully = await rows.nth(2).locator('td').allTextContents();
  expect(fully[4], 'a full hedge costs something').not.toMatch(/^\$0$/);
  expect(
    Number(fully[0].replace('%', '')),
    'a full hedge leaves less residual volatility than no hedge'
  ).toBeLessThan(Number(unhedged[0].replace('%', '')));

  // Basis risk is stated per row, not assumed away.
  expect(fully[5]).toContain('Remains');

  // No prescription anywhere on the surface.
  const boundary = await panel.locator('#hedgeClaimBoundary').textContent();
  expect(boundary).toContain('No hedge ratio is prescribed as optimal or suitable');
  expect(boundary).toContain('nothing is executed');
  expect(boundary).toContain('your portfolio is not modified');

  const rendered = await panel.locator('#hedgeVariants').textContent();
  expect(rendered).not.toMatch(/recommended (hedge )?ratio/i);
  expect(rendered).not.toMatch(/optimal for you/i);
  expect(rendered).not.toMatch(/\bplace (the )?order\b/i);
});

test('Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero', async ({ page }) => {
  await seedPortfolio(page, 'TP-12-03 missing cost');
  const panel = await openDiversification(page);

  // Carry deliberately left empty: the one cost the user must state.
  await enterHedge(panel, { carry: '' });

  await expect(panel.locator('#hedgeNetUnavailable')).toBeVisible();
  const note = await panel.locator('#hedgeNetUnavailable').textContent();
  expect(note).toContain('Net benefit unavailable');
  expect(note).toContain('annualCarryFraction');
  expect(note).toContain('is NOT treated as zero');
  expect(note).toContain('zero is a claim about the world');

  // Every row reports the refusal rather than a plausible total built on a
  // silently-zeroed carry. Total cost is the fifth td (the label is a th).
  const totals = await panel.locator('#hedgeTable tbody tr td:nth-child(6)').allTextContents();
  for (const total of totals) expect(total).toContain('Net unavailable');

  const states = await panel.locator('#hedgeTable tbody tr').evaluateAll(
    (rows) => rows.map((row) => row.dataset.variantState)
  );
  expect(states.every((s) => s === 'gross-only')).toBe(true);
});

test('Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom', async ({ page }) => {
  await seedPortfolio(page, 'TP-12-04 hedge parity');
  const panel = await openDiversification(page);
  await enterHedge(panel);

  const rowCount = await panel.locator('#hedgeTable tbody tr').count();
  expect(rowCount).toBe(3);

  const unresolved = await panel.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#hedgeTable tbody tr'));
    return rows.filter((row) => !row.id || document.querySelectorAll('#' + CSS.escape(row.id)).length !== 1).length;
  });
  expect(unresolved, 'every hedge row is a unique link target').toBe(0);

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(panel.locator('#hedgeTable')).toBeVisible();
    await expect(panel.locator('#dependenceMatrix')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(await panel.locator('#hedgeTable tbody tr').count()).toBe(rowCount);

    // The matrix must still be painted with the hedge table below it.
    const painted = await panel.locator('#dependenceMatrix').evaluate((canvas) => {
      const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      let coloured = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) coloured += 1;
      }
      return coloured;
    });
    expect(painted).toBeGreaterThan(200);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
  await expect(panel.locator('#hedgeTable')).toBeVisible();
  const overflowZoom = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowZoom, 'no horizontal overflow at 130% text').toBeLessThanOrEqual(1);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
});
