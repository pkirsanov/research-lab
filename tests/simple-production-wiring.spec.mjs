/*
 * TP-15-03 — Scope 15 production Simple-view wiring, live-stack regression.
 *
 * SCN-012-038 / SCN-012-039 / SCN-012-040 (market-heatmap-lab, INCREMENT 1): open
 * the REAL tool page, let the page auto-hydrate its shared cache, switch to the
 * REAL "Simple" owner mode, and prove the PRODUCTION BRIDGE (no manual injection)
 * resolves the tool's registered adapter, obtains the page's REAL owner state via
 * the uniform provider seam, runs the production runtime, and renders a VISIBLE,
 * ready adapter projection into [data-rlexperience-panel="simple"] — with the real
 * adapter id and a real numeric breadth read. Power shows the native page content
 * with the adapter panel hidden.
 *
 * REAL-STACK, ZERO INTERCEPTION. This test navigates to the real page (the shared
 * four-view shell mounts #rlviews via rlapp.js + rlnav.js), waits for the page's
 * own RLDATA hydration from committed data/bars snapshots, and asserts the
 * production bridge's rendered panel. There is NO page.route / context.route /
 * intercept / msw / nock — the owner data is the page's real cached owner state,
 * never an intercepted response.
 *
 * RED before Scope 15: under the dead-code stub the panel stays
 * data-rlexperience-simple-state="unavailable" with no adapter id, so the
 * "ready" + adapter-id assertions fail. GREEN after: the real bridge + provider +
 * ownerModes render the real adapter.
 */
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

const HYDRATION_TICKER = 'MSFT';
const ADAPTER_ID = 'simple-adapter/market-breadth/v1';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

async function openHydratedHeatmap(page) {
  await page.goto(`${site.baseUrl}/market-heatmap-lab.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  // Wait for the page's own shared-cache hydration (committed data/bars snapshot) so
  // the owner-state provider returns a real snapshot — no fetch is triggered by the test.
  await page.waitForFunction(
    (ticker) => !!(window.RLDATA && typeof RLDATA.bars === 'function' && (RLDATA.bars(ticker, '1d') || []).length > 0),
    HYDRATION_TICKER,
    { timeout: 20000 }
  );
}

test('Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow', async ({ page }) => {
  await openHydratedHeatmap(page);

  // Real owner-mode flow: toggle to Power then Simple so rlviews:change→simple fires AFTER hydration.
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await page.getByRole('tab', { name: 'Simple', exact: true }).click();

  const panel = page.locator('[data-rlexperience-panel="simple"]');

  // The production bridge (async prepare) renders the REAL adapter — poll for the ready state.
  await page.waitForFunction(
    () => {
      const node = document.querySelector('[data-rlexperience-panel="simple"]');
      return !!node && node.getAttribute('data-rlexperience-simple-state') === 'ready';
    },
    null,
    { timeout: 15000 }
  );

  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('data-rlexperience-simple-state', 'ready');
  await expect(panel).toHaveAttribute('data-rlexperience-adapter', ADAPTER_ID);
  // A real numeric breadth read is painted (proves the real adapter, not a placeholder).
  await expect(panel.locator('[data-simple-numeric-value]')).toBeVisible();
  const numericText = (await panel.locator('[data-simple-numeric-value]').textContent()) || '';
  expect(numericText.trim().length).toBeGreaterThan(0);
  // Model B (ownerModes ["power"]): Simple hides native content — applyVisual owns rlv-focused.
  await expect(page.locator('body')).toHaveClass(/rlv-focused/);

  // Power: the adapter panel is hidden and native content is shown (rlv-focused OFF) — nothing deleted.
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await expect(panel).toBeHidden();
  await expect(page.locator('body')).not.toHaveClass(/rlv-focused/);
});
