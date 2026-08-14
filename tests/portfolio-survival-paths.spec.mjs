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
  const response = await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#workspace`);
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

test('Regression: SCN-008-018 identical stationary bootstrap specification reproduces paths', async ({ page }) => {
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

test('Regression: SCN-008-019 parameter uncertainty is separate from path randomness', async ({ page }) => {
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

test('Regression: SCN-008-038 a saved scenario survives reload and is removed by a full personal clear', async ({ page }) => {
  await seedPortfolio(page, 'TP-09-06 persistence');
  const panel = await openPathLab(page);
  await expect(panel.locator('#pathLab')).toHaveAttribute('data-path-state', 'ok');

  const identity = await panel.locator('#pathIdentity').textContent();
  await panel.locator('#pathSaveScenario').click();
  const result = panel.locator('#pathSaveResult');
  await expect(result).toHaveAttribute('data-accepted', 'true');
  await expect(result).toContainText('1 scenario(s) saved');
  // Only the identity plus a summary is stored: the identity reproduces the paths exactly, so
  // persisting thousands of resampled rows would duplicate derivable data in private storage.
  await expect(result).toContainText('never the resampled paths');

  // Saving the SAME scenario again is a no-op, not a second row.
  await panel.locator('#pathSaveScenario').click();
  await expect(result).toHaveAttribute('data-accepted', 'false');
  await expect(result).toContainText('already saved, not duplicated');
  await expect(result).toContainText('1 scenario(s) saved');

  // It survives a reload, which is what makes it a saved scenario rather than a render artefact.
  await page.reload();
  await page.locator('#workspaceTabPathLab').click();
  await expect(page.locator('#pathSaveResult')).toContainText('1 scenario(s) saved');
  const stored = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__.scenarioCount);
  expect(stored).toBe(1);

  // ADVERSARIAL: the identity must be the SAME one the surface showed, not a fresh sample.
  const afterReload = await page.locator('#pathIdentity').textContent();
  expect(afterReload).toBe(identity);

  // The full personal clear removes it. The workspace lives in slotA/slotB, which are on
  // FOUNDATION_LOCAL_KEYS, so a scenario stored INSIDE the workspace is swept with everything else.
  // A parallel top-level key would have survived, which is why the field lives where it does.
  await page.locator('#workspaceTabBrief').click();
  await page.locator('#openPrivacy').click();
  await page.locator('#emergencyClear').click();
  await expect(page.locator('#privacyResult')).not.toHaveText('No clear requested.');
  const afterClear = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__.scenarioCount);
  expect(afterClear, 'a full personal clear must remove every saved scenario').toBe(0);
});

test('Regression: Feature 008 dependent path fan and uncertainty tables remain equivalent at desktop mobile and zoom', async ({ page }) => {
  await seedPortfolio(page, 'TP-09-05 fan');
  const panel = await openPathLab(page);

  // Synchronous and non-blank: the canvas is painted during the same render that
  // reveals the panel, so a tab that was hidden never shows an empty frame.
  const painted = await panel.locator('#pathCanvas').evaluate((canvas) => {
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let coloured = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) coloured += 1;
    }
    return coloured;
  });
  expect(painted, 'fan canvas is painted, not blank').toBeGreaterThan(200);

  await expect(panel.locator('#pathCanvas')).toHaveAttribute('data-rlchart-mode', 'structured');
  await expect(panel.locator('#pathCanvas')).toHaveAttribute('tabindex', '0');
  expect(await panel.locator('#pathCanvas[data-rlchart-error]').count(), 'no chart contract error').toBe(0);

  // One result, two renderings: every rail option must resolve to a table row of
  // the same fan, so the picture and the numbers cannot disagree.
  const railCount = await page.locator('#rlchart-rail-pathCanvas [role="option"]').count();
  const fanRows = await panel.locator('#pathFanTable tbody tr').count();
  expect(fanRows, 'fan table has one row per session including session 0').toBeGreaterThan(1);
  expect(railCount, 'keyboard rail exposes exactly the table rows').toBe(fanRows);

  const unresolved = await panel.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#pathFanTable tbody tr'));
    return rows.filter((row) => !row.id || document.querySelectorAll('#' + CSS.escape(row.id)).length !== 1).length;
  });
  expect(unresolved, 'every fan row is a unique link target').toBe(0);

  // Both canvases coexist: adding the fan must not evict the risk chart.
  expect(await page.locator('canvas#pathCanvas').count()).toBe(1);

  // Keyboard traversal: the fan is reachable and steppable without a pointer.
  await panel.locator('#pathCanvas').focus();
  await page.keyboard.press('ArrowRight');
  const selectedAfterStep = await page.locator('#rlchart-rail-pathCanvas [aria-selected="true"]').count();
  expect(selectedAfterStep, 'arrow key selects a fan point').toBe(1);

  // The terminal-distribution table stays present and equivalent alongside the fan.
  const termRows = await panel.locator('#pathTable tbody tr').count();
  expect(termRows).toBe(2);
  await expect(panel.locator('[data-distribution="path-randomness"]')).toBeVisible();
  await expect(panel.locator('[data-distribution="combined"]')).toBeVisible();

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(panel.locator('#pathCanvas')).toBeVisible();
    await expect(panel.locator('#pathTable')).toBeVisible();
    await expect(panel.locator('#pathFanTable')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(await panel.locator('#pathTable tbody tr').count()).toBe(termRows);
    expect(await panel.locator('#pathFanTable tbody tr').count()).toBe(fanRows);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
  await expect(panel.locator('#pathCanvas')).toBeVisible();
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

/* ---------------------------------------------------------------------------
   Scope 10 — dated cash needs and survival states
   --------------------------------------------------------------------------- */

async function firstModeledSession(page) {
  return page.locator('#cashNeeds .microcopy').first().textContent();
}

test('Regression: SCN-008-020 dated cash need records before and after collision capital', async ({ page }) => {
  await seedPortfolio(page, 'TP-10-02 collision');
  const panel = await openPathLab(page);

  // The modeled calendar is stated on screen, so the need's landing step is
  // checkable by a reader rather than only by the test.
  const note = await firstModeledSession(page);
  expect(note).toContain('business days projected forward');
  expect(note).toContain('never moved to a better one');

  const firstSession = note.match(/Modeled sessions (\d{4}-\d{2}-\d{2})/)[1];

  await panel.locator('#cashNeedAmount').fill('20000');
  await panel.locator('#cashNeedDate').fill(firstSession);
  await panel.locator('#cashNeedLabel').fill('Tuition');
  await panel.locator('#cashNeedAdd').click();

  const row = panel.locator('#cashNeedTimeline tbody tr').first();
  await expect(row).toBeVisible();

  const cells = await row.locator('th, td').allTextContents();
  expect(cells[0]).toBe('Tuition');
  expect(cells[1], 'the stated date is shown verbatim').toBe(firstSession);
  expect(cells[2], 'the modeled date is on or after the stated date').not.toBe('');
  expect(cells[2] >= cells[1], 'a need is never pulled earlier than its stated date').toBe(true);

  // Capital before, applied, and capital after are all present as real currency
  // figures - not a single opaque "impact" number.
  expect(cells[3]).toMatch(/\$/);
  expect(cells[4]).toMatch(/\$20,000/);
  expect(cells[5]).toMatch(/\$/);
  expect(cells[6]).toMatch(/%$/);

  // The need is not reduced to make the result look better.
  expect(cells[4], 'the full requested amount is stated even if partly funded').toContain('of $20,000');

  const diagnostics = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(diagnostics.cashNeedCount).toBe(1);
});

test('Regression: SCN-008-021 missing survival definition renders distributions without probability', async ({ page }) => {
  await seedPortfolio(page, 'TP-10-03 no definition');
  const panel = await openPathLab(page);

  // Distributions remain fully available.
  await expect(panel.locator('#pathBands')).toBeVisible();
  await expect(panel.locator('#pathTable')).toBeVisible();
  await expect(panel.locator('#pathCanvas')).toBeVisible();

  // Survival refuses, names the missing field, and states what it did NOT supply.
  await expect(panel.locator('#survivalBand')).toHaveAttribute('data-survival-state', 'unavailable');
  const survival = await panel.locator('#survivalResult').textContent();
  expect(survival).toContain('Survival unavailable');
  expect(survival).toContain('floorValue');
  expect(survival).toContain('No probability, wealth floor, withdrawal rate, or success threshold is supplied');

  // Adversarial: no percentage, no floor figure, and no withdrawal rate leaks
  // into the survival band while the definition is absent. A default 4% rule
  // would be caught here.
  const bandText = await panel.locator('#survivalBand').textContent();
  expect(bandText).not.toMatch(/\d+(\.\d+)?%\s+of\s+\d+\s+modeled/);
  expect(bandText).not.toMatch(/4%|0\.04/);

  const beforeFloor = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__.survivalFloorSet);
  expect(beforeFloor).toBe(false);

  // Supplying the floor is what turns it on - nothing else does.
  await panel.locator('#survivalFloor').fill('1');
  await panel.locator('#survivalFloorApply').click();
  await expect(panel.locator('#survivalBand')).toHaveAttribute('data-survival-state', 'ok');
  const withFloor = await panel.locator('#survivalResult').textContent();
  expect(withFloor).toContain('Survival');
  expect(withFloor).toContain('modeled series stay at or above');
  expect(withFloor).toContain('A path fails when its capital falls below the stated floor');
});

test('Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity', async ({ page }) => {
  await seedPortfolio(page, 'TP-10-04 order');
  const panel = await openPathLab(page);

  const note = await firstModeledSession(page);
  const dates = note.match(/Modeled sessions (\d{4}-\d{2}-\d{2}) through (\d{4}-\d{2}-\d{2})/);
  const first = dates[1];
  const last = dates[2];

  // Entered out of chronological order on purpose: the timeline must reorder.
  for (const [amount, date, label] of [
    ['3000', last, 'Later need'],
    ['1000', first, 'Earlier need']
  ]) {
    await panel.locator('#cashNeedAmount').fill(amount);
    await panel.locator('#cashNeedDate').fill(date);
    await panel.locator('#cashNeedLabel').fill(label);
    await panel.locator('#cashNeedAdd').click();
  }

  const labels = await panel.locator('#cashNeedTimeline tbody tr th').allTextContents();
  expect(labels, 'the timeline is chronological, not entry-ordered').toEqual(['Earlier need', 'Later need']);

  const sessions = await panel.locator('#cashNeedTimeline tbody tr').evaluateAll(
    (rows) => rows.map((row) => Number(row.dataset.session))
  );
  expect(sessions[0]).toBeLessThan(sessions[1]);

  // Every timeline row is a unique link target, like the fan rows.
  const unresolved = await panel.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#cashNeedTimeline tbody tr'));
    return rows.filter((row) => !row.id || document.querySelectorAll('#' + CSS.escape(row.id)).length !== 1).length;
  });
  expect(unresolved).toBe(0);

  // Canvas parity survives the timeline being present, at both geometries.
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(panel.locator('#pathCanvas')).toBeVisible();
    await expect(panel.locator('#cashNeedTimeline')).toBeVisible();
    const painted = await panel.locator('#pathCanvas').evaluate((canvas) => {
      const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      let coloured = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) coloured += 1;
      }
      return coloured;
    });
    expect(painted, `canvas stays painted at ${viewport.width}px`).toBeGreaterThan(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(await panel.locator('#cashNeedTimeline tbody tr').count()).toBe(2);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
  await expect(panel.locator('#cashNeedTimeline')).toBeVisible();
  const overflowZoom = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowZoom, 'no horizontal overflow at 130% text').toBeLessThanOrEqual(1);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
});

test('Regression: Feature 008 an incomplete cash need is refused rather than partly assumed', async ({ page }) => {
  await seedPortfolio(page, 'TP-10-04 refusal');
  const panel = await openPathLab(page);

  await expect(panel.locator('#cashNeedEmpty')).toContainText('None is assumed on your behalf');

  // Amount only: no date, no label. The surface must refuse, not invent today's
  // date or an empty label.
  await panel.locator('#cashNeedAmount').fill('5000');
  await panel.locator('#cashNeedAdd').click();

  await expect(panel.locator('#cashNeedError')).toContainText('requires an amount, a date, and a label');
  expect(await panel.locator('#cashNeedTimeline tbody tr').count()).toBe(0);
  const diagnostics = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(diagnostics.cashNeedCount).toBe(0);
});
