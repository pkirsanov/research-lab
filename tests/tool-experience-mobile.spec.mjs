import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: SCN-012-031 narrow ordinary shell preserves four full modes focus and geometry', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(`${site.baseUrl}/strategy-self-improvement-lab.html`);
  const shell = page.locator('#rlviews[data-rlexperience-shell="ready"]');
  await expect(shell).toBeVisible();
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveText(['Simple', 'Power', 'Brief', 'Journey']);
  await expect(tabs).toHaveCount(4);

  const initialGeometry = await page.evaluate(() => {
    const dock = document.querySelector('#rlviews');
    const style = getComputedStyle(dock);
    return {
      bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bottom: style.bottom,
      dockRight: dock.getBoundingClientRect().right,
      position: style.position,
      tabHeights: Array.from(dock.querySelectorAll('[role="tab"]'), (tab) => tab.getBoundingClientRect().height),
      viewportWidth: document.documentElement.clientWidth
    };
  });
  expect(initialGeometry.position).toBe('fixed');
  expect(initialGeometry.bottom).not.toBe('auto');
  expect(initialGeometry.bodyOverflow).toBeLessThanOrEqual(1);
  expect(initialGeometry.dockRight).toBeLessThanOrEqual(initialGeometry.viewportWidth + 1);
  expect(initialGeometry.tabHeights.every((height) => height >= 44)).toBe(true);

  await page.getByRole('tab', { name: 'Simple', exact: true }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Journey', exact: true })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Journey', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page).toHaveURL(/#journey$/);
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'Simple', exact: true })).toBeFocused();
  await expect(page).toHaveURL(/#simple$/);
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Journey', exact: true })).toBeFocused();
  await expect(page).toHaveURL(/#journey$/);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('tab', { name: 'Journey', exact: true })).toHaveAttribute('tabindex', '0');

  await page.getByRole('tab', { name: 'Brief', exact: true }).click();
  await expect(page).toHaveURL(/#brief$/);
  await expect(page.locator('[data-rlexperience-gate="feature-002"]')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#journey$/);
  await page.goForward();
  await expect(page).toHaveURL(/#brief$/);

  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  for (const label of ['Simple', 'Power', 'Brief', 'Journey']) {
    const tab = page.getByRole('tab', { name: label, exact: true });
    await tab.evaluate((node) => node.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
    const rect = await tab.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect.x).toBeGreaterThanOrEqual(-1);
    expect(rect.x + rect.width).toBeLessThanOrEqual(321);
    await expect(tab).toHaveText(label);
  }
  const zoomGeometry = await page.evaluate(() => ({
    bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    dockOverflowMode: getComputedStyle(document.querySelector('#rlviews')).overflowX,
    selectedCount: document.querySelectorAll('#rlviews [aria-selected="true"]').length,
    zeroTabIndexCount: document.querySelectorAll('#rlviews [role="tab"][tabindex="0"]').length
  }));
  expect(zoomGeometry.bodyOverflow).toBeLessThanOrEqual(1);
  expect(['auto', 'scroll']).toContain(zoomGeometry.dockOverflowMode);
  expect(zoomGeometry.selectedCount).toBe(1);
  expect(zoomGeometry.zeroTabIndexCount).toBe(1);
});