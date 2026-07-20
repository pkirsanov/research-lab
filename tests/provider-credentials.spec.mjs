// Regression: specs/_bugs/BUG-002-two-tier-provider-access (supersedes BUG-001)
// UI-category Playwright test for the two-tier provider-access editor rendered by
// rlapp.js on index.html#data-settings. Proves the editor renders both tiers, a
// Tier-2 local key can be set through the DOM (stored only in this browser, never
// leaked to the page), a reachable Tier-1 proxy flips the active tier, force-local
// overrides the proxy, unknown/prototype-shaped providers fail closed, and
// "clear all" wipes the browser's provider config.
import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

const PROXY_BASE = 'https://rl-proxy.invalid:41443';

let site;

test.beforeAll(async () => {
  site = await startStaticServer();
});

test.afterAll(async () => {
  if (site) await site.close();
});

test('editor renders both tiers with the two-tier API and providers start unconfigured', async ({ page }) => {
  await page.goto(site.baseUrl + '/index.html#data-settings');
  await expect(page.locator('#data-settings')).toBeVisible();
  await expect(page.locator('#data-settings .settings-head h2')).toHaveText('Provider access');
  await expect(page.locator('#data-settings .settings-provider')).toHaveCount(4);
  await expect(page.locator('#data-settings [data-proxy-url]')).toBeVisible();
  await expect(page.locator('#data-settings .settings-recheck')).toBeVisible();
  await expect(page.locator('#data-settings .settings-forcelocal')).toBeVisible();
  await expect(page.locator('#data-settings .settings-clear')).toBeVisible();
  await expect(page.locator('#data-settings [data-provider-key]')).toHaveCount(4);

  const boot = await page.evaluate(() => {
    const scripts = Array.from(document.scripts).map((script) => script.getAttribute('src') || '');
    const access = RLDATA.providerAccess();
    return {
      apiReady: typeof RLDATA === 'object' && typeof RLAPP === 'object',
      dataBeforeApp: scripts.findIndex((src) => src.startsWith('rldata.js')) < scripts.findIndex((src) => src.startsWith('rlapp.js')),
      twoTierApi: ['providerAccess', 'providerStatus', 'setKey', 'clearKey', 'setProxyBaseUrl', 'recheckProxy', 'providerFetch', 'clearAllProviderConfig']
        .every((fn) => typeof RLDATA[fn] === 'function'),
      accessShape: typeof access.proxyBaseUrl === 'string' && Array.isArray(access.providers) && access.providers.length === 4,
      startsUnconfigured: access.providers.every((provider) => provider.state === 'unconfigured')
    };
  });
  expect(boot).toEqual({ apiReady: true, dataBeforeApp: true, twoTierApi: true, accessShape: true, startsUnconfigured: true });
});

test('Tier-2: a local key set through the editor is stored only in this browser and never leaked', async ({ page }) => {
  await page.goto(site.baseUrl + '/index.html#data-settings');
  await page.fill('#data-settings [data-provider-key="finnhub"]', 'UI-LOCAL-KEY-1');
  await page.click('#data-settings .settings-savekey[data-provider="finnhub"]');

  await expect(page.locator('#data-settings [data-provider-status="finnhub"]')).toHaveText('local key set');
  await expect(page.locator('#data-settings .settings-clearkey[data-provider="finnhub"]')).toBeVisible();

  const state = await page.evaluate(() => {
    const cfg = JSON.parse(localStorage.getItem('rlProviderConfig') || '{}');
    const key = 'UI-LOCAL-KEY-1';
    return {
      inConfig: (cfg.keys || {}).finnhub === key,
      providerState: RLDATA.providerStatus('finnhub').state,
      domLeak: document.documentElement.outerHTML.includes(key),
      urlLeak: location.href.includes(key),
      cookieLeak: document.cookie.includes(key)
    };
  });
  expect(state).toEqual({ inConfig: true, providerState: 'configured', domLeak: false, urlLeak: false, cookieLeak: false });
});

test('Tier-1: a reachable proxy flips the active tier, and force-local overrides it', async ({ page, context }) => {
  await context.route((url) => url.href.startsWith(PROXY_BASE + '/'), (route) => {
    const url = route.request().url();
    const body = url.endsWith('/health') ? { status: 'ok', providers: {} } : { tier: 'proxy' };
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.goto(site.baseUrl + '/index.html#data-settings');
  await page.fill('#data-settings [data-proxy-url]', PROXY_BASE);
  await page.click('#data-settings .settings-saveproxy');

  await expect(page.locator('#data-settings [data-tier]')).toHaveText('Tier 1 · tailnet proxy (reachable)');
  await expect(page.locator('#data-settings [data-provider-status="finnhub"]')).toHaveText('via proxy');
  expect(await page.evaluate(() => RLDATA.providerStatus('finnhub').tier)).toBe('proxy');

  // Force-local overrides a reachable proxy — the active tier returns to local.
  await page.check('#data-settings [data-force-local]');
  expect(await page.evaluate(() => RLDATA.providerStatus('finnhub').tier)).toBe('local');
  await expect(page.locator('#data-settings [data-provider-status="finnhub"]')).not.toHaveText('via proxy');
});

test('unknown/prototype-shaped providers fail closed, and "clear all" wipes this browser', async ({ page }) => {
  await page.goto(site.baseUrl + '/index.html#data-settings');

  const result = await page.evaluate(async () => {
    RLDATA.setKey('finnhub', 'REAL-KEY');
    RLDATA.setProxyBaseUrl('https://example.invalid:1');
    const accessBefore = JSON.stringify(RLDATA.providerAccess());
    const objectProtoBefore = Object.getOwnPropertyNames(Object.prototype).sort().join('|');
    const functionProtoBefore = Object.getOwnPropertyNames(Function.prototype).sort().join('|');

    const rogueIds = ['unknown', '', 'toString', 'constructor', '__proto__'];
    const setResults = [];
    const statusResults = [];
    const fetchResults = [];
    for (const id of rogueIds) {
      setResults.push(RLDATA.setKey(id, 'rogue-value'));
      statusResults.push(RLDATA.providerStatus(id));
      fetchResults.push(await RLDATA.providerFetch(id, 'q').then(() => 'RESOLVED').catch((error) => error.message));
    }

    const failClosed = {
      realStillConfigured: RLDATA.providerStatus('finnhub').state === 'configured',
      setRejected: setResults.every((entry) => entry.ok === false && entry.reasonCode === 'UNKNOWN_PROVIDER'),
      statusUnknown: statusResults.every((entry) => entry.ok === false && entry.reasonCode === 'UNKNOWN_PROVIDER'),
      fetchRejected: fetchResults.every((message) => typeof message === 'string' && message.startsWith('unknown provider')),
      accessUnchanged: JSON.stringify(RLDATA.providerAccess()) === accessBefore,
      prototypesUnchanged: Object.getOwnPropertyNames(Object.prototype).sort().join('|') === objectProtoBefore
        && Object.getOwnPropertyNames(Function.prototype).sort().join('|') === functionProtoBefore,
      noKeyLeak: JSON.stringify(setResults.concat(statusResults)).includes('rogue-value') === false
    };

    // Clear all wipes this browser's provider config.
    RLDATA.clearAllProviderConfig();
    const cfgAfterClear = JSON.parse(localStorage.getItem('rlProviderConfig') || 'null');
    const afterClear = {
      finnhubCleared: RLDATA.providerStatus('finnhub').state === 'unconfigured',
      proxyCleared: RLDATA.providerAccess().proxyBaseUrl === '',
      configEmptied: !cfgAfterClear || !cfgAfterClear.keys || Object.keys(cfgAfterClear.keys).length === 0
    };
    return { failClosed, afterClear };
  });

  expect(result.failClosed).toEqual({
    realStillConfigured: true,
    setRejected: true,
    statusUnknown: true,
    fetchRejected: true,
    accessUnchanged: true,
    prototypesUnchanged: true,
    noKeyLeak: true
  });
  expect(result.afterClear).toEqual({ finnhubCleared: true, proxyCleared: true, configEmptied: true });
});
