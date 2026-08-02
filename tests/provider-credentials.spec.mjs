// Regression: specs/_bugs/BUG-002-two-tier-provider-access (supersedes BUG-001)
// UI-category Playwright test for the two-tier provider-access editor rendered by
// rlapp.js on index.html#data-settings. Proves the editor renders both tiers, a
// Tier-2 local key can be set through the DOM (stored only in this browser, never
// leaked to the page), a reachable Tier-1 proxy flips the active tier, force-local
// overrides the proxy, unknown/prototype-shaped providers fail closed, and
// "clear all" wipes the browser's provider config.
import { test, expect } from './playwright-runtime.mjs';
import { LEGACY_LOCAL_NAMES, LEGACY_SESSION_NAMES, startProxyHealthServer, startStaticServer } from './provider-credentials.support.mjs';

const CURRENT_PROVIDER_CONFIG = '{"v":1,"proxyBaseUrl":"http://127.0.0.1:9","keys":{"finnhub":"current-ui-key"}}';
const CURRENT_DATA_CACHE = '{"v":1,"bars":{"SPY":{"1d":{"at":1,"rows":[]}}}}';

let site;

test.beforeAll(async () => {
  site = await startStaticServer();
});

test.afterAll(async () => {
  if (site) await site.close();
});

async function seedLegacyBrowserState(page, { localLegacyNames = LEGACY_LOCAL_NAMES, sessionLegacyNames = LEGACY_SESSION_NAMES } = {}) {
  await page.goto(site.baseUrl + '/index.html#data-settings');
  await page.evaluate(({ currentDataCache, currentProviderConfig, localNames, sessionNames }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('rlProviderConfig', currentProviderConfig);
    localStorage.setItem('rlData', currentDataCache);
    localStorage.setItem('unknownCredentialContainer', 'unknown-ui-local-value');
    sessionStorage.setItem('unknownSessionCredentialContainer', 'unknown-ui-session-value');
    localNames.forEach((name) => localStorage.setItem(name, `legacy-ui-local-${name}`));
    sessionNames.forEach((name) => sessionStorage.setItem(name, `legacy-ui-session-${name}`));
  }, {
    currentDataCache: CURRENT_DATA_CACHE,
    currentProviderConfig: CURRENT_PROVIDER_CONFIG,
    localNames: localLegacyNames,
    sessionNames: sessionLegacyNames
  });
  await page.reload();
}

test('editor renders both tiers with the two-tier API and providers start unconfigured', async ({ page }) => {
  await page.goto(site.baseUrl + '/index.html#data-settings');
  await expect(page.locator('#data-settings')).toBeVisible();
  await expect(page.locator('#data-settings .settings-head h2')).toHaveText('Provider access');
  await expect(page.locator('#data-settings .settings-grid .settings-provider')).toHaveCount(4);
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

test('Tier-1: a reachable proxy flips the active tier, and force-local overrides it', async ({ page }) => {
  const proxy = await startProxyHealthServer();
  try {
    await page.goto(site.baseUrl + '/index.html#data-settings');
    await page.fill('#data-settings [data-proxy-url]', proxy.baseUrl);
    await page.click('#data-settings .settings-saveproxy');

    await expect(page.locator('#data-settings [data-tier]')).toHaveText('Tier 1 · tailnet proxy (reachable)');
    await expect(page.locator('#data-settings [data-provider-status="finnhub"]')).toHaveText('via proxy');
    expect(await page.evaluate(() => RLDATA.providerStatus('finnhub').tier)).toBe('proxy');
    expect(proxy.requests.map(({ url }) => url)).toContain('/health');

    // Force-local overrides a reachable proxy — the active tier returns to local.
    await page.check('#data-settings [data-force-local]');
    expect(await page.evaluate(() => RLDATA.providerStatus('finnhub').tier)).toBe('local');
    await expect(page.locator('#data-settings [data-provider-status="finnhub"]')).not.toHaveText('via proxy');
  } finally {
    await proxy.close();
  }
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

test('Regression BUG-001: legacy cleanup erases pre-BUG-002 containers and preserves current provider access', async ({ page }) => {
  await seedLegacyBrowserState(page);

  await expect(page.locator('#data-settings .settings-legacy')).toBeVisible();
  await expect(page.locator('#data-settings [data-legacy-container-count]')).toHaveText(String(LEGACY_LOCAL_NAMES.length + LEGACY_SESSION_NAMES.length));
  await expect(page.locator('#data-settings .settings-legacy-disclosure')).toContainText('whole containers');
  await expect(page.locator('#data-settings [data-provider-status="finnhub"]')).toHaveText('local key set');

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('whole pre-BUG-002 containers');
    await dialog.accept();
  });
  await page.click('#data-settings .settings-erase-legacy');

  await expect(page.locator('#data-settings [data-legacy-cleanup-status]')).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#data-settings [data-legacy-cleanup-status]')).toContainText('11 legacy credential containers erased');
  const state = await page.evaluate(({ currentDataCache, currentProviderConfig, localNames, sessionNames }) => ({
    providerConfigRaw: localStorage.getItem('rlProviderConfig'),
    dataCacheRaw: localStorage.getItem('rlData'),
    remainingLocalLegacyNames: localNames.filter((name) => localStorage.getItem(name) !== null),
    remainingSessionLegacyNames: sessionNames.filter((name) => sessionStorage.getItem(name) !== null),
    unknownLocal: localStorage.getItem('unknownCredentialContainer'),
    unknownSession: sessionStorage.getItem('unknownSessionCredentialContainer'),
    providerState: RLDATA.providerStatus('finnhub').state,
    proxyBaseUrl: RLDATA.providerAccess().proxyBaseUrl
  }), {
    currentDataCache: CURRENT_DATA_CACHE,
    currentProviderConfig: CURRENT_PROVIDER_CONFIG,
    localNames: LEGACY_LOCAL_NAMES,
    sessionNames: LEGACY_SESSION_NAMES
  });
  expect(state).toEqual({
    providerConfigRaw: CURRENT_PROVIDER_CONFIG,
    dataCacheRaw: CURRENT_DATA_CACHE,
    remainingLocalLegacyNames: [],
    remainingSessionLegacyNames: [],
    unknownLocal: 'unknown-ui-local-value',
    unknownSession: 'unknown-ui-session-value',
    providerState: 'configured',
    proxyBaseUrl: 'http://127.0.0.1:9'
  });
});

test('Regression BUG-001: incomplete legacy cleanup is explicit and does not alter BUG-002 configuration', async ({ page }) => {
  const localLegacyNames = ['tdKey', 'etfMomLab'];
  await seedLegacyBrowserState(page, { localLegacyNames, sessionLegacyNames: [] });
  await page.evaluate(() => {
    const platformRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (name) {
      if (String(name) === 'etfMomLab') throw new DOMException('forced legacy deletion failure', 'OperationError');
      return platformRemoveItem.call(this, name);
    };
  });

  page.once('dialog', async (dialog) => dialog.accept());
  await page.click('#data-settings .settings-erase-legacy');

  const cleanupStatus = page.locator('#data-settings [data-legacy-cleanup-status]');
  await expect(cleanupStatus).toHaveAttribute('data-state', 'incomplete');
  await expect(cleanupStatus).toContainText('1 legacy credential container remains');
  await expect(cleanupStatus).not.toContainText('successfully erased');
  await expect(cleanupStatus).not.toContainText('etfMomLab');
  await expect(cleanupStatus).not.toContainText('legacy-ui-local-etfMomLab');

  const state = await page.evaluate(() => ({
    providerConfigRaw: localStorage.getItem('rlProviderConfig'),
    tdKeyPresent: localStorage.getItem('tdKey') !== null,
    blockedLegacyPresent: localStorage.getItem('etfMomLab') !== null,
    providerState: RLDATA.providerStatus('finnhub').state,
    proxyBaseUrl: RLDATA.providerAccess().proxyBaseUrl
  }));
  expect(state).toEqual({
    providerConfigRaw: CURRENT_PROVIDER_CONFIG,
    tdKeyPresent: false,
    blockedLegacyPresent: true,
    providerState: 'configured',
    proxyBaseUrl: 'http://127.0.0.1:9'
  });
});

test('Regression BUG-001: inaccessible legacy storage is unavailable, never falsely clear', async ({ page }) => {
  await page.addInitScript(() => {
    const inaccessible = {
      get length() { throw new Error('SecurityError: session storage unavailable'); },
      key() { throw new Error('SecurityError: session storage unavailable'); },
      getItem() { throw new Error('SecurityError: session storage unavailable'); },
      setItem() { throw new Error('SecurityError: session storage unavailable'); },
      removeItem() { throw new Error('SecurityError: session storage unavailable'); }
    };
    Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get() { return inaccessible; } });
  });
  await page.goto(`${site.baseUrl}/index.html#data-settings`);
  const unavailable = page.locator('[data-legacy-detection-state="unavailable"]');
  await expect(unavailable).toBeVisible();
  await expect(unavailable).toContainText('No absence claim is made');
  await expect(page.locator('#data-settings')).not.toContainText('No pre-BUG-002 credential containers detected');
});

test('Regression BUG-001: cancelling destructive cleanup preserves the legacy container', async ({ page }) => {
  await page.goto(`${site.baseUrl}/index.html#data-settings`);
  await page.evaluate(() => localStorage.setItem('tdKey', 'legacy-value-never-read'));
  await page.reload();
  await expect(page.locator('.settings-erase-legacy')).toBeVisible();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.locator('.settings-erase-legacy').click();
  await expect(page.locator('#data-settings .settings-message')).toContainText('cancelled');
  expect(await page.evaluate(() => localStorage.getItem('tdKey'))).toBe('legacy-value-never-read');
});
