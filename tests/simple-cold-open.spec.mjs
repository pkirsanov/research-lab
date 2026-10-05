/*
 * BUG-004 class: a tool whose owner data hydrates AFTER shell boot must requalify its Simple view
 * by itself. Before this, opening options-flow-feed-lab, sector-research-lab or global-rotation-lab
 * directly showed "No result yet" and only a Power-then-Simple toggle revealed the real result.
 * Nothing here clicks a view control before the readiness assertion, so a toggle can never mask it.
 * intraday-tape-lab is deliberately absent: it needs intraday bars the repo does not commit, so
 * "unavailable" is its honest cold-open answer without a provider key.
 */
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

const TOOLS = ['options-flow-feed-lab', 'sector-research-lab', 'global-rotation-lab'];

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

for (const toolId of TOOLS) {
  test(`${toolId}: a direct Simple open requalifies to ready without any view toggle`, async ({ page }) => {
    test.setTimeout(300000);
    const modes = [];
    await page.addInitScript(() => {
      window.__coldOpenModes = [];
      window.addEventListener('rlviews:change', (event) => window.__coldOpenModes.push(event && event.detail && event.detail.mode));
    });
    await page.goto(`${site.baseUrl}/${toolId}.html`);
    const panel = page.locator('[data-rlexperience-panel="simple"]').first();
    await expect(panel).toHaveAttribute('data-rlexperience-simple-state', 'ready', { timeout: 150000 });
    await expect(page.locator('body')).toHaveAttribute('data-rlview', 'simple');
    modes.push(...(await page.evaluate(() => window.__coldOpenModes)));
    expect(modes.filter((mode) => mode && mode !== 'simple'), 'no other view was ever shown on the way to ready').toEqual([]);
  });
}
