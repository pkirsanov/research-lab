// Regression: specs/_bugs/BUG-001-central-provider-credential-security
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { browserLaunchOptions, loadPlaywright, ROOT, startStaticServer } from './provider-credentials.support.mjs';

const CONTEXTS = 8;
const site = await startStaticServer();
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(browserLaunchOptions());

try {
  const contexts = await Promise.all(Array.from({ length: CONTEXTS }, () => browser.newContext()));
  const results = await Promise.all(contexts.map(async (context, index) => {
    const primary = await context.newPage();
    await primary.goto(site.baseUrl + '/index.html#data-settings');
    await primary.locator('input[data-provider="finnhub"]').fill('BUG001-LOAD-SENTINEL-' + index);
    await primary.locator('.settings-save').click();
    assert.equal(await primary.locator('input[data-provider="finnhub"]').inputValue(), '');

    const independent = await context.newPage();
    await independent.goto(site.baseUrl + '/index.html#data-settings');
    const result = {
      primaryConfigured: await primary.evaluate(() => RLDATA.hasKey('finnhub')),
      independentConfigured: await independent.evaluate(() => RLDATA.hasKey('finnhub')),
      primaryDurableCredentialStore: await primary.evaluate(() => localStorage.getItem('rlApiKeys')),
      independentDurableCredentialStore: await independent.evaluate(() => localStorage.getItem('rlApiKeys'))
    };
    await independent.close();
    await primary.close();
    return result;
  }));

  results.forEach((result) => assert.deepEqual(result, {
    primaryConfigured: true,
    independentConfigured: false,
    primaryDurableCredentialStore: null,
    independentDurableCredentialStore: null
  }));

  const registry = JSON.parse(readFileSync(resolve(ROOT, 'tools.json'), 'utf8')).tools;
  const sourceOffenders = registry.filter((tool) => {
    const source = readFileSync(resolve(ROOT, tool.file), 'utf8');
    return /\bfunction\s+rlGetKey\s*\(|\bstate\.(?:apiKey|fhKey|avKey|fredKey)\b|\b(?:apiKey|fhKey|avKey|fredKey)\s*:|\bfunction\s+(?:fetchTDOne|fetchHoldingsAV|fetchFinnhubQuotes)\s*\([^)]*\bkey\b/.test(source);
  }).map((tool) => tool.id);
  assert.deepEqual(sourceOffenders, []);

  const registeredPages = await Promise.all(registry.map(async (tool, index) => {
    const context = contexts[index % contexts.length];
    const page = await context.newPage();
    const pageErrors = [];
    const credentialRequests = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('request', (request) => {
      if (/api\.twelvedata\.com|alphavantage\.co/i.test(request.url())) credentialRequests.push(request.url());
    });
    const response = await page.goto(site.baseUrl + '/' + tool.file, { waitUntil: 'domcontentloaded' });
    const result = {
      id: tool.id,
      ok: !!(response && response.ok()),
      credentialInputs: await page.locator('input[data-provider], input[type="password"]').count(),
      configuredProviders: await page.evaluate(() => RLDATA.providers().filter((provider) => RLDATA.hasKey(provider.id)).length),
      credentialRequests: credentialRequests.length,
      pageErrors
    };
    await page.close();
    return result;
  }));
  registeredPages.forEach((pageResult) => assert.deepEqual(pageResult, {
    id: pageResult.id,
    ok: true,
    credentialInputs: 0,
    configuredProviders: 0,
    credentialRequests: 0,
    pageErrors: []
  }));

  console.log('BUG001_LOAD_BEGIN');
  console.log('CATEGORY=load');
  console.log('SERVER=ephemeral-same-origin-http');
  console.log('BROWSER=existing-chromium-compatible-executable');
  console.log('PARALLEL_CONTEXTS=' + CONTEXTS);
  console.log('PAGES_PER_CONTEXT=2');
  console.log('TOTAL_PAGES=' + (CONTEXTS * 2));
  console.log('REGISTERED_PAGES=' + registry.length);
  console.log('REGISTRY_SOURCE_OFFENDERS=' + sourceOffenders.length);
  console.log('REGISTRY_RUNTIME_ERRORS=' + registeredPages.reduce((count, result) => count + result.pageErrors.length, 0));
  console.log('UNVERIFIED_PROVIDER_REQUESTS=' + registeredPages.reduce((count, result) => count + result.credentialRequests, 0));
  console.log('PRIMARY_CONFIGURED=' + results.filter((result) => result.primaryConfigured).length);
  console.log('INDEPENDENT_CONFIGURED=' + results.filter((result) => result.independentConfigured).length);
  console.log('DURABLE_CREDENTIAL_STORES=0');
  console.log('CROSS_TAB_TRANSFERS=0');
  console.log('RESULT=PASS');
  console.log('BUG001_LOAD_END');
  await Promise.all(contexts.map((context) => context.close()));
} finally {
  await browser.close();
  await site.close();
}