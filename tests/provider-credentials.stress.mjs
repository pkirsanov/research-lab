// Regression: specs/_bugs/BUG-002-two-tier-provider-access (supersedes BUG-001)
// Stress-category browser test: many rapid cycles of Tier-2 (local key) and Tier-1
// (proxy) configuration. Proves the two-tier model is stable and leak-free under load:
// keys roundtrip set->configured->cleared, Tier-2 reaches the provider host WITH the
// key, Tier-1 routes through the proxy WITHOUT the key, and no key ever reaches the
// proxy, the DOM, the URL, or the diagnostics stream.
import assert from 'node:assert/strict';
import { browserLaunchOptions, loadPlaywright, startStaticServer } from './provider-credentials.support.mjs';

const CYCLES = 250;
const PROVIDERS = ['twelvedata', 'finnhub', 'alphavantage', 'fred'];
const PROVIDER_HOST_RE = /^https:\/\/(?:finnhub\.io|api\.twelvedata\.com|www\.alphavantage\.co|api\.stlouisfed\.org)\//;
const PROXY_BASE = 'https://rl-proxy.invalid:41443';
const KEY_RE = /RL2-STRESS-\d+/;

const site = await startStaticServer();
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(browserLaunchOptions());
const diagnostics = [];

try {
  const context = await browser.newContext();
  const proxyRequests = [];
  const providerRequests = [];
  // Mock provider hosts (Tier-2) and the tailnet proxy (Tier-1) so no real network is used.
  await context.route(PROVIDER_HOST_RE, (route) => {
    providerRequests.push(route.request().url());
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tier: 'provider' }) });
  });
  await context.route((url) => url.href.startsWith(PROXY_BASE + '/'), (route) => {
    const url = route.request().url();
    proxyRequests.push(url);
    const body = url.endsWith('/health') ? { status: 'ok', providers: {} } : { tier: 'proxy' };
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  const page = await context.newPage();
  page.on('console', (message) => diagnostics.push(message.text()));
  page.on('pageerror', (error) => diagnostics.push(error.message));
  await page.goto(site.baseUrl + '/index.html#data-settings', { waitUntil: 'domcontentloaded' });

  const totals = { roundtrips: 0, tier2Fetches: 0, tier1Fetches: 0, leaks: 0, storageOffenders: 0 };

  for (let cycle = 0; cycle < CYCLES; cycle += 1) {
    const provider = PROVIDERS[cycle % PROVIDERS.length];
    const key = 'RL2-STRESS-' + cycle;
    const outcome = await page.evaluate(async ({ provider, key, proxyBase }) => {
      // Tier-2: set this browser's own local key; stored ONLY in rlProviderConfig.
      const set = RLDATA.setKey(provider, key);
      const afterSet = RLDATA.providerStatus(provider);
      const cfg = JSON.parse(localStorage.getItem('rlProviderConfig') || '{}');
      const storedOnlyInConfig = (cfg.keys || {})[provider] === key;
      // Tier-2 transport reaches the provider host (proxy not yet configured).
      const tier2 = await RLDATA.providerFetch(provider, 'q?s=1').then((body) => body.tier).catch((error) => 'ERR:' + error.message);

      // Enable Tier-1 (proxy); re-probe; providerFetch must now route through the proxy WITHOUT the key.
      RLDATA.setProxyBaseUrl(proxyBase);
      await RLDATA.recheckProxy();
      const tierAfterProxy = RLDATA.providerStatus(provider).tier;
      const statusUnderProxy = RLDATA.providerStatus(provider).state;
      const tier1 = await RLDATA.providerFetch(provider, 'q?s=1').then((body) => body.tier).catch((error) => 'ERR:' + error.message);

      // Clear proxy + key -> unconfigured roundtrip.
      RLDATA.setProxyBaseUrl('');
      const cleared = RLDATA.clearKey(provider);
      const afterClear = RLDATA.providerStatus(provider);
      const cfg2 = JSON.parse(localStorage.getItem('rlProviderConfig') || '{}');
      const keyGone = ((cfg2.keys || {})[provider] || null) === null;

      // The key must never appear on any surface other than rlProviderConfig.
      const leak = document.documentElement.outerHTML.includes(key)
        || location.href.includes(key)
        || document.referrer.includes(key)
        || document.cookie.includes(key)
        || (window.name || '').includes(key)
        || JSON.stringify(history.state || null).includes(key);

      // No legacy per-tool credential containers anywhere.
      const offenders = ['rlApiKeys', 'tdKey', 'etfMomTdKey', 'msftFhKey', 'etfMomFhKey', 'rlSessionProviderCredentialsV1']
        .filter((name) => localStorage.getItem(name) !== null || sessionStorage.getItem(name) !== null).length;

      return {
        set: set.ok === true && afterSet.state === 'configured' && storedOnlyInConfig,
        tier2,
        tierAfterProxy,
        statusUnderProxy,
        tier1,
        roundtrip: cleared.ok === true && afterClear.state === 'unconfigured' && keyGone,
        leak,
        offenders
      };
    }, { provider, key, proxyBase: PROXY_BASE });

    assert.equal(outcome.set, true, `cycle ${cycle}: local key set + stored only in rlProviderConfig`);
    assert.equal(outcome.tier2, 'provider', `cycle ${cycle}: Tier-2 reaches the provider host`);
    assert.equal(outcome.tierAfterProxy, 'proxy', `cycle ${cycle}: reachable proxy -> Tier-1 active`);
    assert.equal(outcome.statusUnderProxy, 'proxy', `cycle ${cycle}: providerStatus reports proxy tier`);
    assert.equal(outcome.tier1, 'proxy', `cycle ${cycle}: Tier-1 routes through the proxy`);
    assert.equal(outcome.roundtrip, true, `cycle ${cycle}: clear returns provider to unconfigured`);
    assert.equal(outcome.leak, false, `cycle ${cycle}: no key leak to any surface`);
    assert.equal(outcome.offenders, 0, `cycle ${cycle}: no legacy credential containers`);

    if (outcome.set && outcome.roundtrip) totals.roundtrips += 1;
    if (outcome.tier2 === 'provider') totals.tier2Fetches += 1;
    if (outcome.tier1 === 'proxy') totals.tier1Fetches += 1;
    if (outcome.leak) totals.leaks += 1;
    totals.storageOffenders += outcome.offenders;
  }

  // The proxy path must NEVER have carried a provider key (server-side injection only).
  const proxyKeyLeaks = proxyRequests.filter((url) => KEY_RE.test(url)).length;
  // Every Tier-2 provider request DID carry a key (correct direct-with-key transport).
  const providerRequestsWithoutKey = providerRequests.filter((url) => !KEY_RE.test(url)).length;

  assert.equal(proxyKeyLeaks, 0, 'no provider key ever sent to the proxy');
  assert.equal(providerRequestsWithoutKey, 0, 'every Tier-2 provider request carried its local key');
  assert.deepEqual(totals, { roundtrips: CYCLES, tier2Fetches: CYCLES, tier1Fetches: CYCLES, leaks: 0, storageOffenders: 0 });
  assert.equal(diagnostics.filter((value) => KEY_RE.test(String(value))).length, 0, 'no key in console/pageerror diagnostics');

  console.log('BUG002_STRESS_BEGIN');
  console.log('CATEGORY=stress');
  console.log('CYCLES=' + CYCLES);
  console.log('TIER2_ROUNDTRIPS=' + totals.roundtrips);
  console.log('TIER1_PROXY_FETCHES=' + totals.tier1Fetches);
  console.log('TIER2_PROVIDER_FETCHES=' + totals.tier2Fetches);
  console.log('PROXY_KEY_LEAKS=' + proxyKeyLeaks);
  console.log('TIER2_REQUESTS_MISSING_KEY=' + providerRequestsWithoutKey);
  console.log('KEY_LEAKS=' + totals.leaks);
  console.log('LEGACY_STORAGE_OFFENDERS=' + totals.storageOffenders);
  console.log('RESULT=PASS');
  console.log('BUG002_STRESS_END');
  await context.close();
} finally {
  await browser.close();
  await site.close();
}
