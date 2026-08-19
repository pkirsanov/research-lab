import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';
import { startPinnedAgendaSite } from './research-agenda-fixture.support.mjs';

let site;
// BUG-012 scope 02: the agenda fixture boots against committed bar inputs (see the support module).
let agendaSite;
test.beforeAll(async () => { site = await startStaticServer(); agendaSite = await startPinnedAgendaSite(); });
test.afterAll(async () => { if (site) await site.close(); if (agendaSite) await agendaSite.close(); });

async function waitForHeatmap(page) {
  await page.goto(`${site.baseUrl}/market-heatmap-lab.html`);
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await expect(page.locator('body')).toHaveAttribute('data-heatmap-hydration', 'ready', { timeout: 120000 });
  await expect(page.locator('#tbody tr').first()).toBeVisible();
  await expect(page.locator('#tm')).toHaveAttribute('data-rlchart-mode', 'structured');
  await expect(page.locator('#rlcontext-disclosure')).toHaveCount(1);
}

async function disclosureFingerprint(page) {
  return page.locator('#rlcontext-disclosure').getAttribute('data-context-fingerprint');
}

test('Regression: SCN-012-003 Power chart context is equivalent by pointer keyboard touch and table', async ({ page }) => {
  // waitForHeatmap() declares a 120 s hydration wait; the default 30 s budget would abort first.
  test.setTimeout(180_000);
  await waitForHeatmap(page);
  const canvas = page.locator('#tm');
  const disclosure = page.locator('#rlcontext-disclosure');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  const clientX = box.x + box.width / 2;
  const clientY = box.y + box.height / 2;
  await page.mouse.move(clientX, clientY);
  await expect(disclosure).toHaveAttribute('data-state', 'open');
  const pointerPoint = await canvas.getAttribute('data-rlchart-active-point');
  const pointerFingerprint = await disclosureFingerprint(page);
  expect(pointerPoint).toBeTruthy();
  expect(pointerFingerprint).toMatch(/^sha256:/);
  await expect(disclosure).toContainText('Current interpretation');
  await expect(disclosure).toContainText('Basis');
  await expect(disclosure).toContainText('Uncertainty');
  await expect(disclosure).toContainText('Limitation');

  await canvas.dispatchEvent('pointerdown', { clientX, clientY, pointerType: 'touch', bubbles: true });
  await expect(disclosure).toHaveAttribute('data-pinned', 'true');
  expect(await disclosureFingerprint(page)).toBe(pointerFingerprint);

  await canvas.focus();
  await expect(canvas).toBeFocused();
  await expect(canvas).toHaveAttribute('aria-activedescendant', /rlchart-point-/);
  expect(await canvas.getAttribute('data-rlchart-active-point')).toBe(pointerPoint);
  expect(await disclosureFingerprint(page)).toBe(pointerFingerprint);

  await disclosure.locator('[data-rlcontext-link="sameDataTable"]').click();
  const focused = await page.evaluate(() => ({
    id: document.activeElement?.id || '',
    fingerprint: document.activeElement?.getAttribute('data-rlcontext-fingerprint') || ''
  }));
  expect(focused.id).toBe(`heatmap-row-${pointerPoint}`);
  expect(focused.fingerprint).toBe(pointerFingerprint);
  expect(await disclosureFingerprint(page)).toBe(pointerFingerprint);

  expect(await page.locator('#rlgtip, #rltkrtip, #rlcharttip').count()).toBe(0);
});

test('Regression: SCN-012-004 label-only context fails the exact Power item without hiding valid peers', async ({ page }) => {
  // waitForHeatmap() declares a 120 s hydration wait; the default 30 s budget would abort first.
  test.setTimeout(180_000);
  await waitForHeatmap(page);
  const result = await page.evaluate(() => {
    const trigger = document.createElement('button');
    trigger.id = 'label-only-context-fixture';
    trigger.type = 'button';
    trigger.textContent = 'Advancing breadth 64%';
    document.body.appendChild(trigger);
    const validPeer = document.querySelector('#tbody tr');
    const invalid = {
      contractVersion: 'contextual-tooltip/v1',
      contextId: 'test/label-only',
      triggerKind: 'table-value',
      label: 'Advancing breadth',
      definition: 'The percentage of observed constituents with a positive return.',
      displayed: { valueText: '64%', numericValue: 64, unit: 'percent', truthState: 'current' },
      interpretation: { text: 'Advancing breadth 64%', direction: 'threshold-dependent', comparisonBasis: 'Test fixture', window: '1 trading day', thresholdsOrBounds: ['broad participation >= 60%'] },
      provenance: { ownerId: 'contextual-tooltip-test', modelId: 'label-only-fixture', evidenceIdentity: 'test/label-only', sourceRefs: ['fixture:label-only'], observedAsOf: '2026-07-23T00:00:00Z', retrievedOrPublishedAt: '2026-07-23T00:00:00Z', freshness: 'fresh', dataTier: 'test-fixture' },
      uncertainty: { state: 'bounded', rangeOrBand: '62%-66%', reason: 'Fixture band.' },
      limitation: 'Fixture limitation.',
      triggerCondition: 'Fixture trigger.',
      invalidationCondition: 'Fixture invalidation.',
      links: { owner: '', citation: '', sameDataTable: '#label-only-context-fixture', ticker: '' },
      accessibility: { conciseLabel: 'Advancing breadth 64 percent', longDescriptionId: 'rlcontext-label-only-fixture' },
      contextFingerprint: null
    };
    const bound = globalThis.RLCTX.bind(trigger, invalid);
    return {
      ok: bound.ok,
      errorCode: bound.error?.code,
      fieldPath: bound.error?.fieldPath,
      triggerError: trigger.getAttribute('data-rlcontext-error'),
      peerFingerprint: validPeer?.getAttribute('data-rlcontext-fingerprint') || ''
    };
  });

  expect(result).toEqual({
    ok: false,
    errorCode: 'E012-CONTEXT-MISSING',
    fieldPath: '$.interpretation.text',
    triggerError: 'E012-CONTEXT-MISSING',
    peerFingerprint: expect.stringMatching(/^sha256:/)
  });
  await page.locator('#tbody tr').first().focus();
  await expect(page.locator('#rlcontext-disclosure')).toHaveAttribute('data-state', 'open');
  await expect(page.locator('#rlcontext-disclosure')).not.toContainText('Advancing breadth 64%');
});

test('Research charts tables tickers sources and tooltips retain units provenance limits and keyboard access', async ({ page }) => {
  await page.goto(`${agendaSite.baseUrl}/research-agenda-lab.html?fixture=reversal#power/geopolitical-supply-shock`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await page.waitForFunction(() => globalThis.__researchAgendaDebug && globalThis.__researchAgendaDebug.getViewState());

  const chartRows = page.locator('#powerScenarios .metric-row');
  const tableRows = page.locator('#powerScenarioTable tbody tr');
  await expect(chartRows).toHaveCount(3);
  await expect(tableRows).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    const chartValue = await chartRows.nth(index).locator('.metric-value').textContent();
    await chartRows.nth(index).focus();
    await expect(chartRows.nth(index)).toBeFocused();
    await expect(chartRows.nth(index)).toHaveAttribute('title', /probability.*Current canonical model estimate.*Limited by/i);
    await expect(chartRows.nth(index)).toHaveAttribute('aria-label', /probability.*published evidence.*scenario tree/i);
    await expect(tableRows.nth(index).locator('td').nth(1)).toHaveText(chartValue);
    await expect(tableRows.nth(index).locator('td').nth(2)).toHaveText('probability');
    await expect(tableRows.nth(index).locator('td').nth(3)).toHaveText('Canonical current model');
  }

  const proxyRows = page.locator('#proxyWorkspace tbody tr');
  await expect(proxyRows).toHaveCount(12);
  const tickerLinks = page.locator('#proxyWorkspace tbody a');
  await expect(tickerLinks).toHaveCount(12);
  await tickerLinks.first().focus();
  await expect(tickerLinks.first()).toBeFocused();
  await expect(tickerLinks.first()).toHaveAttribute('href', /^https:\/\/finance\.yahoo\.com\/quote\//);
  await expect(proxyRows.first().locator('td').nth(1)).toContainText('%');
  await expect(proxyRows.first().locator('td').nth(2)).toHaveText(/^\d{4}-\d{2}-\d{2}$/);
  await expect(proxyRows.first().locator('td').nth(3)).toContainText('event');
  await expect(proxyRows.first().locator('td').nth(4)).not.toHaveText('');

  const sources = page.locator('#sourceList .source-row a');
  await expect(sources).toHaveCount(2);
  await sources.first().focus();
  await expect(sources.first()).toBeFocused();
  await expect(sources.first()).toHaveAttribute('href', /^https:\/\//);
  await expect(page.locator('#sourceList .source-row').first()).toContainText('Observed');
  await expect(page.locator('#sourceList .source-row').first()).toContainText('public source');
});

test('Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas', async ({ page }) => {
  // test.slow() yields only 3 x 30 s = 90 s, short of the 120 s waitForHeatmap() declares.
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const fallbackPage = await page.context().newPage();
  await fallbackPage.setViewportSize({ width: 390, height: 844 });
  await fallbackPage.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await waitForHeatmap(page);
  const firstRowId = await page.locator('#tbody tr').first().getAttribute('id');
  expect(firstRowId).toBeTruthy();
  const trigger = page.locator(`#${firstRowId} .rltkr-context`);
  await trigger.dispatchEvent('pointerdown', { pointerType: 'touch', bubbles: true, clientX: 32, clientY: 32 });
  const disclosure = page.locator('#rlcontext-disclosure');
  await expect(disclosure).toHaveAttribute('data-layout', 'sheet');
  await expect(disclosure).toHaveAttribute('role', 'dialog');
  await expect(disclosure).toHaveAttribute('aria-modal', 'true');
  const sheet = await disclosure.boundingBox();
  expect(sheet).not.toBeNull();
  expect(sheet.x).toBeGreaterThanOrEqual(0);
  expect(sheet.y).toBeGreaterThanOrEqual(0);
  expect(sheet.x + sheet.width).toBeLessThanOrEqual(390);
  expect(sheet.y + sheet.height).toBeLessThanOrEqual(844);

  await page.keyboard.press('Escape');
  await expect(disclosure).toHaveAttribute('data-state', 'closed');
  await expect(trigger).toBeFocused();
  await trigger.dispatchEvent('pointerdown', { pointerType: 'touch', bubbles: true, clientX: 32, clientY: 32 });
  await disclosure.locator('[data-rlcontext-close]').click();
  const closeState = await page.evaluate((rowId) => {
    const current = document.querySelector(`#${rowId} .rltkr-context`);
    return {
      currentConnected: Boolean(current && current.isConnected),
      currentIsActive: current === document.activeElement,
      activeId: document.activeElement?.id || '',
      activeClass: document.activeElement?.className || '',
      disclosureState: document.querySelector('#rlcontext-disclosure')?.getAttribute('data-state') || '',
      triggerCount: document.querySelectorAll(`#${rowId} .rltkr-context`).length
    };
  }, firstRowId);
  expect(closeState).toEqual({
    currentConnected: true,
    currentIsActive: true,
    activeId: '',
    activeClass: 'rltkr-context rlcontext-trigger',
    disclosureState: 'closed',
    triggerCount: 1
  });
  await expect(trigger).toBeFocused();

  await fallbackPage.goto(`${site.baseUrl}/market-heatmap-lab.html`);
  await expect(fallbackPage.locator('#tm')).toHaveAttribute('data-rlchart-unavailable', 'true');
  await expect(fallbackPage.locator('#tbl')).toHaveAttribute('data-context-primary', 'true');
  await expect(fallbackPage.locator('#tbl')).toBeVisible();
  await expect(fallbackPage.locator('#mapHint')).toContainText('same-data table is primary');
  await expect(fallbackPage.locator('#verdict')).not.toHaveText('');
  await fallbackPage.close();
});