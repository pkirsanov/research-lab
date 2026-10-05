/*
 * The heatmap Simple view must show WHERE breadth is, not only the headline percentage:
 * one bar per group against the broad-leadership threshold, drawn from numbers the owner
 * model already computed. Real page, real static server, no interception.
 */
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Simple breadth view paints a per-group chart against the threshold, with a text alternative', async ({ page }) => {
  test.setTimeout(300000);
  await page.goto(`${site.baseUrl}/market-heatmap-lab.html`);
  const panel = page.locator('[data-rlexperience-panel="simple"]');
  await expect(panel).toHaveAttribute('data-rlexperience-simple-state', 'ready', { timeout: 120000 });

  const chart = panel.locator('[data-simple-chart="bars"]');
  await expect(chart).toBeVisible();
  const svg = chart.locator('svg[role="img"]');
  const bars = svg.locator('rect');
  expect(await bars.count(), 'one bar per group').toBeGreaterThanOrEqual(2);
  await expect(svg.locator('line'), 'the threshold reference line is drawn').toHaveCount(1);

  const label = await svg.getAttribute('aria-label');
  expect(label, 'the figure has a text alternative naming the metric').toContain('Share of each group rising');
  expect(label, 'and the reference it is judged against').toContain('Broad threshold');

  // The verdict and the controls still render around the chart.
  await expect(panel.locator('[data-simple-numeric-value]')).toBeVisible();
  expect(await panel.locator('select, input[type="range"]').count()).toBeGreaterThanOrEqual(5);
});
