// Regression: specs/_bugs/BUG-004-proxy-route-local-key-fallback
// Real local browser/settings coverage only. No third-party provider request is
// made or intercepted; deterministic provider transport belongs to functional tests.
import { test, expect } from './playwright-runtime.mjs';
import { startProxyHealthServer, startStaticServer } from './provider-credentials.support.mjs';

let proxy;
let site;

test.beforeAll(async () => {
  site = await startStaticServer();
  proxy = await startProxyHealthServer();
});

test.afterAll(async () => {
  if (proxy) await proxy.close();
  if (site) await site.close();
});

test('SCN-BUG004-003 force-local status stays masked with a reachable local proxy', async ({ page }) => {
  const localKey = 'bug004-browser-local-key';
  const consoleMessages = [];
  const pageErrors = [];
  page.on('console', (message) => consoleMessages.push(message.text()));
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(site.baseUrl + '/index.html#data-settings');
  await expect(page.locator('#data-settings')).toBeVisible();

  await page.fill('#data-settings [data-provider-key="finnhub"]', localKey);
  await page.click('#data-settings .settings-savekey[data-provider="finnhub"]');
  await expect(page.locator('#data-settings [data-provider-status="finnhub"]')).toHaveText('local key set');

  await page.fill('#data-settings [data-proxy-url]', proxy.baseUrl);
  await page.click('#data-settings .settings-saveproxy');
  await expect(page.locator('#data-settings [data-tier]')).toHaveText('Tier 1 · tailnet proxy (reachable)');
  await expect(page.locator('#data-settings [data-provider-status="finnhub"]')).toHaveText('via proxy');

  await page.check('#data-settings [data-force-local]');
  await expect(page.locator('#data-settings [data-tier]')).toContainText('Tier 2 · local keys');
  await expect(page.locator('#data-settings [data-provider-status="finnhub"]')).toHaveText('local key set');

  const browserState = await page.evaluate((key) => {
    const config = JSON.parse(localStorage.getItem('rlProviderConfig') || '{}');
    const access = RLDATA.providerAccess();
    const status = RLDATA.providerStatus('finnhub');
    return {
      accessLeak: JSON.stringify(access).includes(key),
      cookieLeak: document.cookie.includes(key),
      dataStateLeak: JSON.stringify(RLDATA.dataState()).includes(key),
      domLeak: document.documentElement.outerHTML.includes(key),
      forceLocal: access.forceLocal,
      historyLeak: JSON.stringify(history.state).includes(key)
        || performance.getEntriesByType('navigation').some((entry) => entry.name.includes(key)),
      keyStored: (config.keys || {}).finnhub === key,
      proxyReachable: access.proxyReachable,
      statusLeak: JSON.stringify(status).includes(key),
      tier: access.tier,
      toolReadLeak: JSON.stringify(RLDATA.toolRead()).includes(key),
      urlLeak: location.href.includes(key)
    };
  }, localKey);

  expect(browserState).toEqual({
    accessLeak: false,
    cookieLeak: false,
    dataStateLeak: false,
    domLeak: false,
    forceLocal: true,
    historyLeak: false,
    keyStored: true,
    proxyReachable: true,
    statusLeak: false,
    tier: 'local',
    toolReadLeak: false,
    urlLeak: false
  });
  expect(proxy.requests).toEqual([{ method: 'GET', url: '/health' }]);
  expect(JSON.stringify(proxy.requests).includes(localKey)).toBe(false);
  expect(consoleMessages.join('\n')).not.toContain(localKey);
  expect(pageErrors.join('\n')).not.toContain(localKey);
  expect(pageErrors).toEqual([]);
});