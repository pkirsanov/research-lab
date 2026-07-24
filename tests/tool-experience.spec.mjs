import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: SCN-012-033 real-page shadow registry validation derives all experiences without cutover', async ({ page }) => {
  await page.goto(`${site.baseUrl}/index.html`);
  const before = await page.evaluate(() => ({
    navText: document.querySelector('nav')?.textContent || '',
    modeControls: Array.from(document.querySelectorAll('#rlviews, #modeSeg, [data-rlviews]')).map((node) => node.outerHTML),
    experienceHosts: document.querySelectorAll('[data-rlexperience], [data-rlexperience-view]').length
  }));

  await page.addScriptTag({ url: `${site.baseUrl}/rlexperience.js` });
  const result = await page.evaluate(async () => {
    const [registry, config, models, journeys] = await Promise.all([
      fetch('/tools.json').then((response) => response.json()),
      fetch('/tool-experience.config.json').then((response) => response.json()),
      fetch('/simple-models.json').then((response) => response.json()),
      fetch('/journeys.json').then((response) => response.json())
    ]);
    return globalThis.RLEXPERIENCE.validateFoundation({ registry, config, models, journeys });
  });
  expect(result.ok).toBe(true);
  expect(result.value.toolCount).toBe(23);
  expect(result.value.toolIds).toHaveLength(23);
  expect(result.value.shadowOnly).toBe(true);
  expect(result.value.integrationClaims).toEqual([]);

  const refusal = await page.evaluate(async () => {
    const [registry, config, models, journeys] = await Promise.all([
      fetch('/tools.json').then((response) => response.json()),
      fetch('/tool-experience.config.json').then((response) => response.json()),
      fetch('/simple-models.json').then((response) => response.json()),
      fetch('/journeys.json').then((response) => response.json())
    ]);
    registry.tools[1].experience.simpleAdapterModule = '../unsafe.js';
    return globalThis.RLEXPERIENCE.validateFoundation({ registry, config, models, journeys });
  });
  expect(refusal.ok).toBe(false);
  expect(refusal.error.code).toBe('E012-REGISTRY');
  expect(refusal.error.valueEchoed).toBe(false);

  const after = await page.evaluate(() => ({
    navText: document.querySelector('nav')?.textContent || '',
    modeControls: Array.from(document.querySelectorAll('#rlviews, #modeSeg, [data-rlviews]')).map((node) => node.outerHTML),
    experienceHosts: document.querySelectorAll('[data-rlexperience], [data-rlexperience-view]').length
  }));
  expect(after).toEqual(before);
});

test('Regression: SCN-012-028 uncertified Feature 002 exposes exact Brief gate and no author request', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(`${site.baseUrl}/strategy-self-improvement-lab.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await expect(page.getByRole('tab')).toHaveText(['Simple', 'Power', 'Brief', 'Journey']);
  await page.waitForTimeout(150);
  requests.length = 0;

  const initialHistoryLength = await page.evaluate(() => history.length);
  await page.getByRole('tab', { name: 'Brief', exact: true }).click();
  await expect(page).toHaveURL(/#brief$/);
  await expect(page.getByRole('tab', { name: 'Brief', exact: true })).toHaveAttribute('aria-selected', 'true');
  const gate = page.locator('[data-rlexperience-gate="feature-002"]');
  await expect(gate).toBeVisible();
  await expect(gate.getByRole('heading')).toHaveText('Dependency pending: Feature 002');
  await expect(gate).toContainText('Observed status: not_started');
  await expect(gate).toContainText('Observed certification: not_started');
  await expect(gate).toContainText('Withheld: dynamic-tool-brief-v2, live-web-evidence, public-alert-publication');
  await expect(gate).toContainText('Available now: simple, power, journey, deterministic-local-evidence');
  await expect(gate).toContainText('Acceptance gate: status=done; certification=done; milestones=4/4');
  await expect(gate).toContainText('Gate: E012-DEPENDENCY:feature-002');
  await expect(gate.getByRole('button')).toHaveCount(0);
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 1);
  expect(requests).toEqual([]);

  await page.goBack();
  await expect(page).toHaveURL(/#simple$/);
  await expect(page.getByRole('tab', { name: 'Simple', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.goForward();
  await expect(page).toHaveURL(/#brief$/);
  await expect(gate).toBeVisible();
  expect(requests).toEqual([]);
});

test('Regression: SCN-012-029 uncertified Feature 008 preserves public Portfolio and creates no private store', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(`${site.baseUrl}/market-brief.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await expect(page.getByRole('tab')).toHaveText(['Brief', 'Portfolio', 'Red Alert', 'Journey']);
  const keysBefore = await page.evaluate(() => Object.keys(localStorage).sort());
  await page.waitForTimeout(150);
  requests.length = 0;

  await page.getByRole('tab', { name: 'Portfolio', exact: true }).click();
  await expect(page).toHaveURL(/#portfolio$/);
  await expect(page.getByRole('tab', { name: 'Portfolio', exact: true })).toHaveAttribute('aria-selected', 'true');
  const gate = page.locator('[data-rlexperience-gate="feature-008"]');
  await expect(gate).toBeVisible();
  await expect(gate.getByRole('heading')).toHaveText('Dependency pending: Feature 008');
  await expect(gate).toContainText('Observed status: not_started');
  await expect(gate).toContainText('Observed certification: not_started');
  await expect(gate).toContainText('Withheld: private-portfolio-overlay, portfolio-stress-journey');
  await expect(gate).toContainText('Available now: public-watchlist-matrix, public-scope-journeys');
  await expect(gate).toContainText('Acceptance gate: status=done; certification=done; milestones=3/3');
  await expect(gate).toContainText('Gate: E012-DEPENDENCY:feature-008');
  await expect(gate.getByRole('button')).toHaveCount(0);

  const storageAfter = await page.evaluate(() => ({
    keys: Object.keys(localStorage).sort(),
    modeRecord: JSON.parse(localStorage.getItem('rlExperienceModeV1') || 'null'),
    privateKeys: Object.keys(localStorage).filter((key) => /portfolio|holding|private|journey/i.test(key))
  }));
  expect(storageAfter.keys.filter((key) => !keysBefore.includes(key))).toEqual(['rlExperienceModeV1']);
  expect(storageAfter.privateKeys).toEqual([]);
  expect(Object.keys(storageAfter.modeRecord)).toEqual(['contractVersion', 'toolId', 'mode', 'savedAt']);
  expect(storageAfter.modeRecord.mode).toBe('portfolio');
  expect(requests).toEqual([]);
});

test('Regression: BUG-001 options flow shell is ready before heavy hydration begins', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeFetch = globalThis.fetch;
    globalThis.__bug001OptionDeltaStarts = [];
    globalThis.fetch = function (...args) {
      const input = args[0];
      const requestUrl = typeof input === 'string'
        ? input
        : input && typeof input.url === 'string'
          ? input.url
          : String(input);
      try {
        const url = new URL(requestUrl, location.href);
        if (url.origin === location.origin && /^\/data\/options\/[^/]+\.json$/.test(url.pathname)) {
          const verdict = document.querySelector('#verdict');
          const feed = document.querySelector('#feed');
          globalThis.__bug001OptionDeltaStarts.push({
            pathname: url.pathname,
            shellReady: Boolean(document.querySelector('#rlviews[data-rlexperience-shell="ready"]')),
            cacheFirstOwnerPainted: Boolean(
              verdict
              && verdict.textContent.trim()
              && verdict.textContent.trim() !== '—'
              && feed
              && feed.childElementCount > 0
            )
          });
        }
      } catch (error) {
        // Native fetch retains ownership of invalid-input handling.
      }
      return Reflect.apply(nativeFetch, this, args);
    };
  });

  await page.goto(`${site.baseUrl}/options-flow-feed-lab.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.__bug001OptionDeltaStarts.length > 0);

  const firstDeltaStart = await page.evaluate(() => globalThis.__bug001OptionDeltaStarts[0]);
  console.log(
    `[bug001-order] firstDelta=${firstDeltaStart.pathname} shellReadyAtStart=${firstDeltaStart.shellReady} cacheFirstOwnerPainted=${firstDeltaStart.cacheFirstOwnerPainted}`
  );
  expect(firstDeltaStart.cacheFirstOwnerPainted).toBe(true);
  expect(firstDeltaStart.shellReady).toBe(true);

  await page.waitForFunction(() => (
    new Set(globalThis.__bug001OptionDeltaStarts.map((entry) => entry.pathname)).size === 12
  ));
  const shell = page.locator('#rlviews[data-rlexperience-shell="ready"]');
  await expect(shell).toHaveCount(1);
  await expect(shell.getByRole('tab')).toHaveCount(4);
  await expect(page.locator('[data-rlexperience-panel]')).toHaveCount(4);

  await shell.getByRole('tab', { name: 'Power', exact: true }).click();
  await shell.getByRole('tab', { name: 'Simple', exact: true }).click();
  const deltaStarts = await page.evaluate(() => globalThis.__bug001OptionDeltaStarts);
  expect(deltaStarts).toHaveLength(12);
  expect(new Set(deltaStarts.map((entry) => entry.pathname)).size).toBe(12);
  expect(deltaStarts.every((entry) => entry.shellReady)).toBe(true);
});