// Regression: specs/_bugs/BUG-001-central-provider-credential-security
import assert from 'node:assert/strict';
import { browserLaunchOptions, loadPlaywright, startStaticServer } from './provider-credentials.support.mjs';

const CYCLES = 250;
const NAVIGATION_CYCLES = 25;
const SENTINEL_PREFIX = 'BUG001-STRESS-SENTINEL-';

const site = await startStaticServer();
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(browserLaunchOptions());
const diagnostics = [];

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', (message) => diagnostics.push(message.text()));
  page.on('pageerror', (error) => diagnostics.push(error.message));
  await page.goto(site.baseUrl + '/index.html#data-settings');

  for (let cycle = 0; cycle < CYCLES; cycle += 1) {
    const outcome = await page.evaluate(({ cycleNumber, sentinelPrefix }) => {
      const input = document.querySelector('input[data-provider="finnhub"]');
      const save = document.querySelector('.settings-save');
      const clear = document.querySelector('.settings-clear');
      const sentinel = sentinelPrefix + cycleNumber;
      input.value = sentinel;
      save.click();
      const configured = RLDATA.hasKey('finnhub');
      const blankAfterSave = input.value === '';
      const secretRendered = document.documentElement.outerHTML.includes(sentinel);
      clear.click();
      return {
        blankAfterSave,
        configured,
        secretRendered,
        cleared: !RLDATA.hasKey('finnhub') && sessionStorage.length === 0,
        configuredStatuses: document.querySelectorAll('[data-provider-status].set').length
      };
    }, { cycleNumber: cycle, sentinelPrefix: SENTINEL_PREFIX });

    assert.deepEqual(outcome, {
      blankAfterSave: true,
      configured: true,
      secretRendered: false,
      cleared: true,
      configuredStatuses: 0
    });

    if ((cycle + 1) % 25 === 0) {
      await page.reload();
      assert.equal(await page.locator('input[data-provider="finnhub"]').inputValue(), '');
      assert.equal(await page.evaluate(() => RLDATA.hasKey('finnhub')), false);
    }
  }

  const finalState = await page.evaluate(() => ({
    configuredProviders: RLDATA.providers().filter((provider) => RLDATA.hasKey(provider.id)).length,
    credentialStoreKeys: Object.keys(sessionStorage),
    durableCredentialStore: localStorage.getItem('rlApiKeys')
  }));
  assert.deepEqual(finalState, { configuredProviders: 0, credentialStoreKeys: [], durableCredentialStore: null });

  await page.locator('input[data-provider="finnhub"]').fill(SENTINEL_PREFIX + 'FAILURE');
  await page.locator('.settings-save').click();
  for (let cycle = 0; cycle < NAVIGATION_CYCLES; cycle += 1) {
    const failures = await page.evaluate(async (sentinelPrefix) => {
      const disabled = await RLDATA.providerFetch('twelvedata', 'https://api.twelvedata.com/time_series?symbol=MSFT&interval=1day');
      const forbidden = RLDATA.buildProviderRequest('finnhub', 'https://finnhub.io/api/v1/quote?symbol=MSFT&TOKEN=' + encodeURIComponent(sentinelPrefix + 'FAILURE'));
      return { disabled, forbidden };
    }, SENTINEL_PREFIX);
    assert.deepEqual(failures.disabled, { ok: false, provider: 'twelvedata', reason: 'provider-disabled' });
    assert.deepEqual(failures.forbidden, { ok: false, provider: 'finnhub', reason: 'credential-query-forbidden' });
    assert.equal(JSON.stringify(failures).includes(SENTINEL_PREFIX), false);
    await page.goto(site.baseUrl + '/market-brief.html');
    assert.equal((await page.content()).includes(SENTINEL_PREFIX), false);
    await page.goto(site.baseUrl + '/index.html#data-settings');
    assert.equal(await page.locator('input[data-provider="finnhub"]').inputValue(), '');
  }
  await page.locator('.settings-clear').click();
  assert.equal(diagnostics.some((value) => String(value).includes(SENTINEL_PREFIX)), false);

  console.log('BUG001_STRESS_BEGIN');
  console.log('CATEGORY=stress');
  console.log('SERVER=ephemeral-same-origin-http');
  console.log('BROWSER=existing-chromium-compatible-executable');
  console.log('PRODUCTION_PAGE=index.html');
  console.log('PRODUCTION_OWNER=rldata.js+rlapp.js');
  console.log('CYCLES=' + CYCLES);
  console.log('RELOADS=' + (CYCLES / 25));
  console.log('NAVIGATION_CYCLES=' + NAVIGATION_CYCLES);
  console.log('PROVIDER_FAILURE_CASES=' + (NAVIGATION_CYCLES * 2));
  console.log('SESSION_STORE_BOUNDED=true');
  console.log('RENDERED_SENTINELS=0');
  console.log('DIAGNOSTIC_SENTINELS=0');
  console.log('RESULT=PASS');
  console.log('BUG001_STRESS_END');
  await context.close();
} finally {
  await browser.close();
  await site.close();
}