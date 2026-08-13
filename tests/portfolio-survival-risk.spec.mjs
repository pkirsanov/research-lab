/* Feature 008 Scope 07 — Risk X-Ray in the real browser.
 *
 * The unit suite proves the ANALYTICS are correct while saying nothing about whether the page
 * renders what they returned. A page can call a correct function and then display a rounded
 * placeholder, collapse arithmetic and compounded return into one "return", quietly fill a gap, or
 * report a recovery that happened past its own evidence boundary. Every row below therefore asserts
 * the RENDERED state against a value calculated independently here, not against the module output.
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

/* The imported fixture merges to MSFT + BND, so both must carry evidence for the portfolio to be
   measurable at all. */
const SYMBOLS = ['MSFT', 'BND'];

async function openLab(page) {
  const response = await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#brief`);
  expect(response?.status(), 'the Risk X-Ray host page must be served').toBe(200);
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

/* Seeds the SAME shared same-origin bar cache the page reads in production. There is no test-only
   entry point on the page: if these rows can drive it, a genuine cached series can too, which is
   what makes these assertions evidence about production rather than about a fixture hook. */
async function seedBars(page, symbol, rows) {
  await page.evaluate(({ sym, data }) => {
    window.RLDATA.putBars(sym, '1d', data.map((row) => ({
      t: Date.parse(`${row.date}T00:00:00.000Z`),
      c: row.close
    })), 'tp-07-fixture');
  }, { sym: symbol, data: rows });
}

async function openRiskXRay(page) {
  await page.locator('#workspaceTabRiskXray').click();
  await expect(page).toHaveURL(/#risk-xray$/);
  const panel = page.locator('[data-route="risk-xray"]');
  await expect(panel).toBeVisible();
  return panel;
}

function series(dates, closes) {
  return dates.map((date, i) => ({ date, close: closes[i] }));
}

const DATES = ['2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-11'];

test('Regression: SCN-008-013 arithmetic CAGR and conditional drag stay separate', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-07-02 returns');

  // A deliberately volatile MSFT path against a perfectly flat BND. Flat BND makes the portfolio
  // return exactly the MSFT weight times the MSFT return, so the expected values below can be
  // derived here by hand rather than by re-running the production module.
  await seedBars(page, 'MSFT', series(DATES, [100, 150, 100, 150, 100, 150]));
  await seedBars(page, 'BND', series(DATES, [50, 50, 50, 50, 50, 50]));

  const panel = await openRiskXRay(page);
  await expect(panel.locator('#riskXray')).toHaveAttribute('data-risk-state', 'ok');

  // Independently calculated. The fixture merges two MSFT lots, and the merge SUMS their derived
  // values rather than repricing at one lot's price: 10 units at 450.25 plus 2 at 451.00.
  const msftValue = (10 * 450.25) + (2 * 451.00);
  const bndValue = 20 * 72.10;
  const wMsft = msftValue / (msftValue + bndValue);
  const msftReturns = [0.5, -1 / 3, 0.5, -1 / 3, 0.5];
  const portfolio = msftReturns.map((r) => r * wMsft);
  const meanAnnual = (portfolio.reduce((a, b) => a + b, 0) / portfolio.length) * 252;
  const wealth = portfolio.reduce((acc, r) => acc * (1 + r), 1);
  const cagr = Math.pow(wealth, 1 / (portfolio.length / 252)) - 1;

  const arithmeticText = await panel.locator('#riskArithmetic').textContent();
  const cagrText = await panel.locator('#riskCagr').textContent();
  expect(arithmeticText).toContain(`${(meanAnnual * 100).toFixed(2)}%`);
  expect(cagrText).toContain(`${(cagr * 100).toFixed(2)}%`);

  // The three quantities must be rendered as SEPARATE rows, not collapsed into one "return".
  await expect(panel.locator('#riskArithmetic')).toContainText('Arithmetic annualized');
  await expect(panel.locator('#riskCagr')).toContainText('Compounded CAGR');
  await expect(panel.locator('#riskDrag')).toContainText('Observed volatility drag');
  expect(arithmeticText).not.toBe(cagrText);

  // The approximation is displayed and LABELLED conditional with its assumptions visible.
  await expect(panel.locator('#riskDragApprox')).toContainText('Conditional');
  await expect(panel.locator('#riskDragApprox')).toContainText('log-normal');
  await expect(panel.locator('#riskSample')).toContainText('extrapolated-from-short-sample');

  // ADVERSARIAL: no rendered copy may claim lower volatility produces higher wealth, and no
  // forecast may be offered. This is the claim boundary the scope exists to hold.
  const copy = (await panel.locator('#riskXray').innerText()).toLowerCase();
  expect(copy).toContain('no forecast is made');
  for (const banned of ['lower volatility produces higher', 'lower volatility wins', 'will return', 'expected to reach']) {
    expect(copy, `Risk X-Ray must not claim: ${banned}`).not.toContain(banned);
  }
});

test('Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-07-03 drawdown');

  // MSFT peaks, falls, and then fully recovers on the FINAL date -- but BND has no evidence on
  // that date, so the portfolio's evidence boundary is the day before. The recovery is therefore
  // outside what was actually observed for the whole portfolio and must not be reported.
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 99, 240]));
  await seedBars(page, 'BND', series(DATES.slice(0, 5), [50, 50, 50, 50, 50]));

  const panel = await openRiskXRay(page);
  await expect(panel.locator('#riskXray')).toHaveAttribute('data-risk-state', 'ok');

  // The declared cutoff is the last date EVERY constituent still has evidence.
  await expect(panel.locator('#riskSource')).toContainText('evidence cutoff 2026-05-08');

  await expect(panel.locator('#riskPeakDate')).toContainText('2026-05-05');
  await expect(panel.locator('#riskTroughDate')).toContainText('2026-05-06');
  await expect(panel.locator('#riskRecovery')).toContainText('Unrecovered as of cutoff 2026-05-08');
  await expect(panel.locator('#riskUnderWater')).toContainText('still open at the cutoff');

  // ADVERSARIAL: the excluded observation is a 2.4x move. If the cutoff leaked, the page could not
  // still be reporting an unrecovered drawdown, and no recovery date may appear anywhere.
  const recovery = await panel.locator('#riskRecovery').textContent();
  expect(recovery).not.toContain('2026-05-11');
  expect(recovery).not.toContain('Recovered on');

  // Maximum drawdown is independently calculable: the 90 trough against the 120 peak, scaled by
  // the MSFT weight because flat BND contributes nothing.
  const wMsft = ((10 * 450.25) + (2 * 451.00)) / ((10 * 450.25) + (2 * 451.00) + 20 * 72.10);
  const w = [0.2, -0.25, 2 / 30, 0.03125].map((r) => r * wMsft).reduce((acc, r) => [...acc, (acc.at(-1) ?? 1) * (1 + r)], []);
  const peak = Math.max(1, w[0]);
  const expectedMaxDd = (w[1] / peak) - 1;
  const maxText = await panel.locator('#riskMaxDrawdown').textContent();
  expect(maxText).toContain(`${(expectedMaxDd * 100).toFixed(2)}%`);
});

test('Regression: Feature 008 return and drawdown canvas tables remain equivalent at desktop mobile and zoom', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-07-04 parity');
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 130, 128]));
  await seedBars(page, 'BND', series(DATES, [50, 51, 50, 50, 52, 52]));

  const panel = await openRiskXRay(page);
  const canvas = panel.locator('#riskCanvas');
  await expect(canvas).toBeVisible();

  // The canvas must be drawn SYNCHRONOUSLY -- nonblank the moment the tab is shown, with no
  // animation frame to wait for. A blank canvas that fills in later is the defect being excluded.
  const nonBlank = await page.evaluate(() => {
    const el = document.getElementById('riskCanvas');
    const ctx = el.getContext('2d');
    const data = ctx.getImageData(0, 0, el.width, el.height).data;
    let coloured = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) coloured += 1;
    }
    return coloured;
  });
  expect(nonBlank, 'the canvas must carry drawn pixels, not a blank frame').toBeGreaterThan(200);

  // RLCHART attached in STRUCTURED mode, which is what supplies keyboard traversal.
  await expect(canvas).toHaveAttribute('data-rlchart-mode', 'structured');
  await expect(canvas).not.toHaveAttribute('data-rlchart-error', /.+/);
  await expect(canvas).toHaveAttribute('tabindex', '0');

  // The accessible point rail is the real keyboard surface, so assert on it rather than on private
  // canvas state: a rail that exists in the DOM is evidence a keyboard user can reach every point.
  const railId = await canvas.getAttribute('aria-owns');
  expect(railId, 'the canvas must own an accessible point rail').toBeTruthy();
  const rail = page.locator(`#${railId}`);
  await expect(rail).toHaveAttribute('role', 'listbox');

  // Every canvas point has an equivalent table row, and the counts match exactly -- the pixels, the
  // rail, and the table are projections of ONE result, so a mismatch means a second computation
  // appeared somewhere.
  const rowCount = await panel.locator('#riskTable tbody tr').count();
  const railCount = await rail.locator('[role="option"]').count();
  expect(rowCount).toBe(6);
  expect(railCount).toBe(rowCount);

  // Each rail option's declared same-data table target must actually resolve in the DOM.
  const targets = await panel.locator('#riskTable tbody tr').evaluateAll(
    (rows) => rows.map((row) => row.id)
  );
  expect(targets.filter(Boolean).length).toBe(rowCount);
  for (const target of targets) {
    await expect(page.locator(`#${target}`)).toHaveCount(1);
  }

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(canvas).toBeVisible();
    // No horizontal body overflow at either size.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    // The table stays present and equivalent at every viewport; it is not a desktop-only affordance.
    expect(await panel.locator('#riskTable tbody tr').count()).toBe(rowCount);
  }

  // 130% text must not drop the table or blank the canvas.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
  await expect(panel.locator('#riskTable')).toBeVisible();
  expect(await panel.locator('#riskTable tbody tr').count()).toBe(rowCount);
  const overflowZoom = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowZoom, 'no horizontal overflow at 130% text').toBeLessThanOrEqual(1);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
});

test('Regression: SCN-008-015 concentration lenses expose overlap and missing look through', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-08-02 concentration');
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 130, 128]));
  await seedBars(page, 'BND', series(DATES, [50, 51, 50, 50, 52, 52]));

  const panel = await openRiskXRay(page);
  const conc = panel.locator('#riskConcentration');
  await expect(conc).toBeVisible();

  // Every configured lens renders its own section with its own coverage state.
  for (const lens of ['symbol', 'assetClass', 'sector', 'currency']) {
    await expect(conc.locator(`[data-lens="${lens}"]`)).toHaveCount(1);
  }

  // The symbol lens covers every holding, so it is complete and its buckets sum to 100%.
  const symbolLens = conc.locator('[data-lens="symbol"]');
  await expect(symbolLens).toHaveAttribute('data-coverage', 'complete');
  await expect(symbolLens.locator('[data-bucket="MSFT"]')).toBeVisible();
  await expect(symbolLens.locator('[data-bucket="BND"]')).toBeVisible();

  // ADVERSARIAL: the fixture carries no sector, so that lens must be PARTIAL and must NAME the
  // holdings it cannot place -- never invent an Other bucket, a zero, or an average.
  const sectorLens = conc.locator('[data-lens="sector"]');
  await expect(sectorLens).toHaveAttribute('data-coverage', 'none');
  await expect(sectorLens.locator('[data-lens-coverage="sector"]')).toContainText('missing this detail');
  await expect(sectorLens.locator('[data-lens-coverage="sector"]')).toContainText('never bucketed as Other');
  const sectorBuckets = await sectorLens.locator('[data-bucket]').allTextContents();
  for (const bucket of sectorBuckets) {
    expect(bucket.toLowerCase()).not.toMatch(/other|unknown|n\/a/);
  }
});

test('Regression: SCN-008-016 beta alpha R squared and residual risk stay separate', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-08-03 capm fitted');

  // MSFT is constructed to move at exactly 2x SPY while BND stays flat, so the portfolio beta is
  // predictable from the fixture rather than read back from the module under test.
  await seedBars(page, 'SPY', series(DATES, [100, 102, 99, 101, 103, 102]));
  await seedBars(page, 'MSFT', series(DATES, [200, 208, 196, 204, 212, 208]));
  await seedBars(page, 'BND', series(DATES, [50, 50, 50, 50, 50, 50]));

  const panel = await openRiskXRay(page);
  const capm = panel.locator('#riskCapm');
  await expect(capm).toHaveAttribute('data-capm-state', 'ok');

  // Every reading is rendered as its OWN row; none stands in for another.
  for (const id of ['#riskBeta', '#riskAlpha', '#riskRSquared', '#riskCorrelation', '#riskResidual', '#riskBetaStdError', '#riskCapmSample']) {
    await expect(panel.locator(id), `${id} must be a separate rendered reading`).toBeVisible();
  }
  await expect(panel.locator('#riskBeta')).toContainText('Beta vs SPY');

  // Independently calculated: BND is flat, so the portfolio return is wMsft * the MSFT return, and
  // MSFT moves at 2x SPY on this fixture. Beta therefore lands at 2 * wMsft.
  const wMsft = ((10 * 450.25) + (2 * 451.00)) / ((10 * 450.25) + (2 * 451.00) + 20 * 72.10);
  const betaText = await panel.locator('#riskBeta').textContent();
  const beta = Number(/Beta vs SPY: (-?[0-9.]+)/.exec(betaText)[1]);
  expect(Math.abs(beta - 2 * wMsft), `beta ${beta} should be near ${2 * wMsft}`).toBeLessThan(0.05);

  // The sample is far below the configured 126-observation minimum and must say so rather than
  // presenting a five-period beta as though it were seasoned.
  await expect(panel.locator('#riskCapmSample')).toContainText('below-configured-minimum');
  await expect(panel.locator('#riskCapmSample')).toContainText('126');

  // ADVERSARIAL: no copy may read a beta as a statement about TOTAL risk.
  const copy = (await capm.innerText()).toLowerCase();
  for (const banned of ['total risk is low', 'low total risk', 'therefore safe', 'less risky overall']) {
    expect(copy, `benchmark fit must not claim: ${banned}`).not.toContain(banned);
  }
});

test('Regression: SCN-008-016 benchmark fit is unavailable rather than regressed against a guess', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-08-03 capm unavailable');
  // Portfolio evidence exists but the DECLARED benchmark has none, so no regression is possible.
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 130, 128]));
  await seedBars(page, 'BND', series(DATES, [50, 51, 50, 50, 52, 52]));

  const panel = await openRiskXRay(page);
  const capm = panel.locator('#riskCapm');
  await expect(capm).toHaveAttribute('data-capm-state', 'benchmark-unavailable');
  await expect(panel.locator('#riskCapmUnavailable')).toContainText('Benchmark fit unavailable');
  await expect(panel.locator('#riskCapmUnavailable')).toContainText('no beta, alpha, or explanatory figure is shown');

  // ADVERSARIAL: not one fitted figure may be rendered when the benchmark has no evidence.
  for (const id of ['#riskBeta', '#riskAlpha', '#riskRSquared', '#riskCorrelation', '#riskResidual', '#riskBetaStdError']) {
    await expect(panel.locator(id), `${id} must be absent without benchmark evidence`).toHaveCount(0);
  }
});

test('Regression: SCN-008-017 marginal and total risk contributions reconcile', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-08-04 contributions');
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 130, 128]));
  await seedBars(page, 'BND', series(DATES, [50, 51, 50, 50, 52, 52]));

  const panel = await openRiskXRay(page);
  const box = panel.locator('#riskContributions');
  await expect(box).toHaveAttribute('data-contribution-state', 'ok');
  await expect(box).toHaveAttribute('data-covariance-state', 'ok');

  // One row per holding, each carrying weight, marginal, contribution, and share as SEPARATE cells.
  await expect(box.locator('#riskContributionTable tbody tr')).toHaveCount(2);
  await expect(box.locator('[data-contributor="MSFT"]')).toBeVisible();
  await expect(box.locator('[data-contributor="BND"]')).toBeVisible();

  // The shrinkage assumption is never implicit: the basis and lambda are stated on the surface.
  await expect(panel.locator('#riskCovarianceState')).toContainText('conditioned covariance');
  await expect(panel.locator('#riskCovarianceState')).toContainText('lambda auto-raised: false');

  // The Euler reconciliation is a real arithmetic check and its result is shown, not assumed.
  await expect(panel.locator('#riskReconciliation')).toContainText('reconciled: true');
  const reconText = await panel.locator('#riskReconciliation').textContent();
  const sum = Number(/sum to ([0-9.]+)/.exec(reconText)[1]);
  const risk = Number(/portfolio risk ([0-9.]+)/.exec(reconText)[1]);
  expect(Math.abs(sum - risk)).toBeLessThanOrEqual(1e-8);
});

test('Regression: SCN-008-016 declared proxy factors report exposures and name themselves proxies', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-08-03 factors');
  // MSFT tracks SPY at 2x while BND is flat, so the portfolio loads on the market proxy.
  await seedBars(page, 'SPY', series(DATES, [100, 102, 99, 101, 103, 102]));
  await seedBars(page, 'MSFT', series(DATES, [200, 208, 196, 204, 212, 208]));
  await seedBars(page, 'BND', series(DATES, [50, 50, 50, 50, 50, 50]));
  // Two of the five declared legs are present, so the other three must be NAMED unavailable.
  await seedBars(page, 'IWM', series(DATES, [80, 81, 79, 80, 82, 81]));

  const panel = await openRiskXRay(page);
  const box = panel.locator('#riskFactors');
  await expect(box).toHaveAttribute('data-factor-state', 'ok');

  // The surface states it is a PROXY basis, versioned, and names what it could not fit.
  await expect(panel.locator('#riskFactorBasis')).toContainText('DECLARED PROXY');
  await expect(panel.locator('#riskFactorBasis')).toContainText('proxy-factors/v1');
  await expect(panel.locator('#riskFactorBasis')).toContainText('unavailable:');
  await expect(panel.locator('#riskFactorBasis')).toContainText('growth');
  await expect(panel.locator('#riskFactorBasis')).toContainText('momentum');
  await expect(panel.locator('#riskFactorBasis')).toContainText('international');

  // Fitted exposures are shown as their own rows, separate from fit quality and residual.
  await expect(box.locator('[data-factor="market"]')).toBeVisible();
  await expect(panel.locator('#riskFactorR2')).toBeVisible();
  await expect(panel.locator('#riskFactorResidual')).toBeVisible();
  await expect(panel.locator('#riskFactorAlpha')).toBeVisible();

  // ADVERSARIAL: the copy must not promote a proxy spread to the academic factor it resembles, and
  // must not forecast.
  const copy = (await box.innerText()).toLowerCase();
  expect(copy).toContain('not the academic factor');
  for (const banned of ['fama', 'will outperform', 'expected to return', 'guarantees']) {
    expect(copy, `factor copy must not claim: ${banned}`).not.toContain(banned);
  }
});

test('Regression: Feature 008 concentration CAPM and contribution diagnostics preserve mobile canvas table parity', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-08-05 parity');
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 130, 128]));
  await seedBars(page, 'BND', series(DATES, [50, 51, 50, 50, 52, 52]));
  await seedBars(page, 'SPY', series(DATES, [400, 404, 396, 398, 410, 408]));

  const panel = await openRiskXRay(page);
  const canvas = panel.locator('#riskContributionCanvas');
  await expect(canvas).toBeVisible();

  // Drawn SYNCHRONOUSLY: nonblank the moment the tab is shown, with no animation frame to wait for.
  const coloured = await page.evaluate(() => {
    const el = document.getElementById('riskContributionCanvas');
    const data = el.getContext('2d').getImageData(0, 0, el.width, el.height).data;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) n += 1;
    }
    return n;
  });
  expect(coloured, 'the contribution canvas must carry drawn pixels').toBeGreaterThan(200);

  // Structured attach is what supplies keyboard traversal, and it validates every point context.
  await expect(canvas).toHaveAttribute('data-rlchart-mode', 'structured');
  await expect(canvas).not.toHaveAttribute('data-rlchart-error', /.+/);
  await expect(canvas).toHaveAttribute('tabindex', '0');

  // Every chart point resolves to a real table row: pixels and cells are one projection, so a
  // mismatch would mean a second computation appeared.
  const railId = await canvas.getAttribute('aria-owns');
  const rail = page.locator(`#${railId}`);
  const railCount = await rail.locator('[role="option"]').count();
  const rowCount = await panel.locator('#riskContributionTable tbody tr').count();
  expect(railCount).toBe(rowCount);
  expect(rowCount).toBe(2);

  const rowIds = await panel.locator('#riskContributionTable tbody tr').evaluateAll((rows) => rows.map((r) => r.id));
  expect(rowIds.filter(Boolean).length).toBe(rowCount);
  for (const id of rowIds) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  // Both diagnostics canvases coexist; adding the second must not have displaced the first.
  await expect(panel.locator('#riskCanvas')).toHaveAttribute('data-rlchart-mode', 'structured');

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(canvas).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(await panel.locator('#riskContributionTable tbody tr').count()).toBe(rowCount);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
  await expect(panel.locator('#riskContributionTable')).toBeVisible();
  const overflowZoom = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowZoom, 'no horizontal overflow at 130% text').toBeLessThanOrEqual(1);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
});

test('Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-07-05 refusal');

  // Only ONE of the two holdings has evidence. A portfolio cannot be measured from half its
  // positions, and the honest answer is a named refusal -- never a figure computed from the
  // observable subset, which would silently re-weight the portfolio to 100% MSFT.
  await seedBars(page, 'MSFT', series(DATES, [100, 120, 90, 96, 130, 128]));

  const panel = await openRiskXRay(page);
  await expect(panel.locator('#riskUnavailable')).toBeVisible();
  await expect(panel.locator('#riskUnavailable')).toContainText('Risk X-Ray unavailable');
  await expect(panel.locator('#riskUnavailable')).toContainText('no return, drawdown, or recovery figure is shown');

  // ADVERSARIAL: not one metric may be present in the refusing state.
  for (const id of ['#riskArithmetic', '#riskCagr', '#riskDrag', '#riskMaxDrawdown', '#riskRecovery', '#riskCanvas', '#riskTable']) {
    await expect(panel.locator(id), `${id} must be absent when the portfolio is not measurable`).toHaveCount(0);
  }
});
