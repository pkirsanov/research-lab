// Regression: specs/_bugs/BUG-002-two-tier-provider-access (supersedes BUG-001)
// Load-category browser test: many isolated browsers each hold their OWN Tier-2
// local key. Proves per-browser isolation, persistence across reload/navigation,
// Tier-2 transport to the (mocked) provider host, and that the key never leaks to
// any surface other than this browser's own rlProviderConfig.
import assert from 'node:assert/strict';
import { browserLaunchOptions, loadPlaywright, startStaticServer } from './provider-credentials.support.mjs';

const CONTEXTS = 8;
const PROVIDER_HOST_RE = /^https:\/\/(?:finnhub\.io|api\.twelvedata\.com|www\.alphavantage\.co|api\.stlouisfed\.org)\//;

const site = await startStaticServer();
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(browserLaunchOptions());

try {
  const contexts = await Promise.all(Array.from({ length: CONTEXTS }, () => browser.newContext()));

  const results = await Promise.all(contexts.map(async (context, index) => {
    const key = 'RL2-LOAD-KEY-' + index;
    const providerRequests = [];
    // Mock the provider host so no real network is hit; capture the URL to prove
    // the key IS sent to the provider (correct Tier-2) and only there.
    await context.route(PROVIDER_HOST_RE, (route) => {
      providerRequests.push(route.request().url());
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tier: 'provider' }) });
    });

    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(site.baseUrl + '/index.html#data-settings', { waitUntil: 'domcontentloaded' });

    // Tier-2: this browser sets its OWN local key.
    const set = await page.evaluate(
      (k) => RLDATA.setKey('finnhub', k).ok && RLDATA.providerStatus('finnhub').state === 'configured',
      key
    );

    // Persists across reload + same-origin navigation (opposite of the BUG-001 memory-only model).
    await page.reload({ waitUntil: 'domcontentloaded' });
    const afterReload = await page.evaluate(() => RLDATA.providerStatus('finnhub').state);
    await page.goto(site.baseUrl + '/sector-research-lab.html', { waitUntil: 'domcontentloaded' });
    const afterNav = await page.evaluate(() => RLDATA.providerStatus('finnhub').state);

    // Tier-2 transport reaches the provider host (mocked) with the key in the query.
    const fetched = await page.evaluate(
      () => RLDATA.providerFetch('finnhub', 'https://finnhub.io/api/v1/quote?symbol=MSFT')
        .then((body) => body.tier)
        .catch((error) => 'ERR:' + error.message)
    );

    // The key lives ONLY in this browser's rlProviderConfig — never in DOM/URL/referrer/cookie/name/history.
    const surfaces = await page.evaluate((k) => {
      const cfg = JSON.parse(localStorage.getItem('rlProviderConfig') || '{}');
      return {
        inConfig: (cfg.keys || {}).finnhub === k,
        domLeak: document.documentElement.outerHTML.includes(k),
        urlLeak: location.href.includes(k),
        referrerLeak: document.referrer.includes(k),
        cookieLeak: document.cookie.includes(k),
        nameLeak: (window.name || '').includes(k),
        historyLeak: JSON.stringify(history.state || null).includes(k)
      };
    }, key);

    await page.close();
    return { index, key, set, afterReload, afterNav, fetched, surfaces, providerRequests, errors: errors.length };
  }));

  // Cross-context isolation: re-open each browser and confirm it sees ONLY its own key.
  const seen = await Promise.all(contexts.map(async (context) => {
    const page = await context.newPage();
    await page.goto(site.baseUrl + '/index.html', { waitUntil: 'domcontentloaded' });
    const value = await page.evaluate(
      () => (JSON.parse(localStorage.getItem('rlProviderConfig') || '{}').keys || {}).finnhub || null
    );
    await page.close();
    return value;
  }));

  results.forEach((result) => {
    assert.equal(result.set, true, `ctx ${result.index}: sets its own local key`);
    assert.equal(result.afterReload, 'configured', `ctx ${result.index}: key persists across reload`);
    assert.equal(result.afterNav, 'configured', `ctx ${result.index}: key persists across navigation`);
    assert.equal(result.fetched, 'provider', `ctx ${result.index}: Tier-2 providerFetch reaches the provider host`);
    assert.equal(result.errors, 0, `ctx ${result.index}: no page errors`);
    assert.deepEqual(
      result.surfaces,
      { inConfig: true, domLeak: false, urlLeak: false, referrerLeak: false, cookieLeak: false, nameLeak: false, historyLeak: false },
      `ctx ${result.index}: key only in rlProviderConfig`
    );
    assert.ok(
      result.providerRequests.some((url) => url.includes(result.key)),
      `ctx ${result.index}: key reaches the provider host (Tier-2 transport)`
    );
  });
  seen.forEach((value, index) => assert.equal(value, 'RL2-LOAD-KEY-' + index, `ctx ${index}: sees only its own isolated key`));
  assert.equal(new Set(seen).size, CONTEXTS, 'all contexts hold distinct, isolated keys');

  console.log('BUG002_LOAD_BEGIN');
  console.log('CATEGORY=load');
  console.log('PARALLEL_CONTEXTS=' + CONTEXTS);
  console.log('ISOLATED_KEYS=' + new Set(seen).size);
  console.log('PERSISTED_ACROSS_RELOAD=' + results.filter((result) => result.afterReload === 'configured').length);
  console.log('PERSISTED_ACROSS_NAV=' + results.filter((result) => result.afterNav === 'configured').length);
  console.log('TIER2_PROVIDER_REACHED=' + results.filter((result) => result.fetched === 'provider').length);
  console.log('KEY_LEAKS=0');
  console.log('RESULT=PASS');
  console.log('BUG002_LOAD_END');

  await Promise.all(contexts.map((context) => context.close()));
} finally {
  await browser.close();
  await site.close();
}
