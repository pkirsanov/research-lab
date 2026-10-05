/*
 * The unusual-options Simple view must show WHICH contracts lit up and how concentrated the
 * premium is, not only a count: the largest flagged contracts by premium, in $ millions.
 * Real page, real static server, no interception.
 */
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Simple unusual-options view charts the largest flagged contracts by premium', async ({ page }) => {
  test.setTimeout(300000);
  await page.goto(`${site.baseUrl}/options-flow-feed-lab.html`);
  const panel = page.locator('[data-rlexperience-panel="simple"]');
  await expect(panel).toHaveAttribute('data-rlexperience-simple-state', 'ready', { timeout: 150000 });

  const chart = panel.locator('[data-simple-chart="bars"]');
  await expect(chart).toBeVisible();
  const svg = chart.locator('svg[role="img"]');
  expect(await svg.locator('rect').count(), 'one bar per ranked contract').toBeGreaterThanOrEqual(1);
  expect(await svg.locator('line').count(), 'no reference line: there is no threshold on premium here').toBe(0);
  const label = await svg.getAttribute('aria-label');
  expect(label).toContain('Largest flagged contracts by premium');
  expect(label, 'each bar names its ticker, side, strike and days to expiry').toMatch(/[A-Z]{1,5} [CP] \d+(\.\d+)? · \d+d/);
  // The shared ticker linkifier once swapped each ticker for an HTML link that an SVG <text> cannot
  // draw, so the label looked right in the DOM yet showed no ticker. Assert what is actually drawn.
  const firstLabel = svg.locator('text').first();
  expect(await firstLabel.textContent()).toMatch(/^[A-Z]{1,5} [CP] \d/);
  expect((await firstLabel.boundingBox()).width, 'the ticker is drawn, not just present in the DOM').toBeGreaterThan(110);
  await expect(panel.locator('[data-simple-numeric-value]')).toBeVisible();
});
