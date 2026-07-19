// Regression: specs/_bugs/BUG-001-central-provider-credential-security
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { browserLaunchOptions, loadPlaywright, ROOT, startStaticServer } from './provider-credentials.support.mjs';

const CONTEXTS = 8;
const SENTINEL_PREFIX = 'BUG001-LOAD-SENTINEL-';
const DIRECT_CREDENTIAL_CONTAINERS = new Set([
  'rlApiKeys',
  'tdKey',
  'etfMomTdKey',
  'msftFhKey',
  'etfMomFhKey',
  'rlSessionProviderCredentialsV1'
]);
const site = await startStaticServer();
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(browserLaunchOptions());

try {
  const contexts = await Promise.all(Array.from({ length: CONTEXTS }, () => browser.newContext()));
  const contextAudits = contexts.map(() => ({ credentialRequests: 0, requestAuditPromises: [] }));
  await Promise.all(contexts.map(async (context, index) => {
    await context.addInitScript(({ directCredentialContainers, sentinelPrefix }) => {
      const originalSetItem = Storage.prototype.setItem;
      const bridge = {
        cookieWrites: 0,
        credentialStorageWrites: 0,
        domLeaks: 0,
        historyLeaks: 0,
        messageLeaks: 0,
        workerLeaks: 0
      };
      function containsCredential(value) {
        try { return JSON.stringify(value).includes(sentinelPrefix); } catch (error) { return String(value).includes(sentinelPrefix); }
      }
      function wrapPostMessage(target, key, counter) {
        if (!target || typeof target[key] !== 'function') return;
        const original = target[key];
        target[key] = function (...args) {
          if (containsCredential(args[0])) bridge[counter] += 1;
          return original.apply(this, args);
        };
      }

      Storage.prototype.setItem = function (key, value) {
        if (directCredentialContainers.includes(String(key)) || containsCredential(value)) {
          bridge.credentialStorageWrites += 1;
          throw new Error('credential storage write blocked');
        }
        return originalSetItem.call(this, String(key), String(value));
      };
      wrapPostMessage(window, 'postMessage', 'messageLeaks');
      if (typeof BroadcastChannel !== 'undefined') wrapPostMessage(BroadcastChannel.prototype, 'postMessage', 'messageLeaks');
      if (typeof Worker !== 'undefined') wrapPostMessage(Worker.prototype, 'postMessage', 'workerLeaks');
      if (typeof MessagePort !== 'undefined') wrapPostMessage(MessagePort.prototype, 'postMessage', 'messageLeaks');
      for (const methodName of ['pushState', 'replaceState']) {
        const original = history[methodName];
        history[methodName] = function (...args) {
          if (containsCredential(args)) bridge.historyLeaks += 1;
          return original.apply(this, args);
        };
      }
      const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
      if (cookieDescriptor && cookieDescriptor.get && cookieDescriptor.set) {
        Object.defineProperty(Document.prototype, 'cookie', {
          configurable: true,
          get: cookieDescriptor.get,
          set(value) {
            if (containsCredential(value)) bridge.cookieWrites += 1;
            return cookieDescriptor.set.call(this, value);
          }
        });
      }
      function observeDom() {
        if (!document.documentElement || typeof MutationObserver === 'undefined') return;
        const observer = new MutationObserver((records) => {
          for (const record of records) {
            if (containsCredential(record.target && record.target.textContent)) bridge.domLeaks += 1;
            for (const node of record.addedNodes || []) {
              if (containsCredential(node.textContent)) bridge.domLeaks += 1;
            }
          }
        });
        observer.observe(document.documentElement, { attributes: true, characterData: true, childList: true, subtree: true });
      }
      if (document.documentElement) observeDom();
      else document.addEventListener('DOMContentLoaded', observeDom, { once: true });
      Object.defineProperty(window, '__bug001BridgeAudit', {
        configurable: false,
        enumerable: false,
        value: Object.freeze({ snapshot: () => ({ ...bridge }) })
      });
    }, { directCredentialContainers: Array.from(DIRECT_CREDENTIAL_CONTAINERS), sentinelPrefix: SENTINEL_PREFIX });
    context.on('request', (request) => {
      contextAudits[index].requestAuditPromises.push(request.allHeaders().then((headers) => {
        const url = request.url();
        const credentialHeader = ['authorization', 'x-api-key', 'x-finnhub-token', 'x-controlled-test']
          .some((headerName) => typeof headers[headerName] === 'string' && headers[headerName].length > 0);
        const credentialQuery = /[?&](?:api_?key|apikey|token|access_?token|credential)=/i.test(url);
        const sentinelLeak = url.includes(SENTINEL_PREFIX) || Object.values(headers).some((value) => String(value).includes(SENTINEL_PREFIX));
        return { credentialRequest: credentialHeader || credentialQuery, sentinelLeak };
      }));
    });
  }));

  async function pageState(page, providerId) {
    return page.evaluate(({ provider, sentinelPrefix }) => {
      const storageNames = (storage) => Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(Boolean);
      const storageLeak = (storage) => storageNames(storage).some((key) => {
        const value = storage.getItem(key);
        return String(key).includes(sentinelPrefix) || String(value).includes(sentinelPrefix);
      });
      const forbiddenRuntimeApis = ['key', 'keys', 'hasKey', 'setKey', 'clearAllKeys', 'buildProviderRequest', 'providerFetch', 'migrateLegacyCredentials'];
      return {
        bridge: window.__bug001BridgeAudit.snapshot(),
        credentialInputs: document.querySelectorAll('input[data-provider], input[type="password"]').length,
        directCredentialContainers: storageNames(localStorage).concat(storageNames(sessionStorage)).filter((key) => [
          'rlApiKeys', 'tdKey', 'etfMomTdKey', 'msftFhKey', 'etfMomFhKey', 'rlSessionProviderCredentialsV1'
        ].includes(key)).length,
        forbiddenRuntimeApis: forbiddenRuntimeApis.filter((name) => typeof RLDATA[name] !== 'undefined').length,
        leak: location.href.includes(sentinelPrefix)
          || document.referrer.includes(sentinelPrefix)
          || document.documentElement.outerHTML.includes(sentinelPrefix)
          || document.cookie.includes(sentinelPrefix)
          || window.name.includes(sentinelPrefix)
          || JSON.stringify(history.state).includes(sentinelPrefix)
          || storageLeak(localStorage)
          || storageLeak(sessionStorage),
        openerPresent: window.opener !== null,
        providerState: RLDATA.credentialStatus(provider).state
      };
    }, { provider: providerId, sentinelPrefix: SENTINEL_PREFIX });
  }

  const results = await Promise.all(contexts.map(async (context, index) => {
    const errors = [];
    const controlledUrl = site.baseUrl + '/__bug001__/controlled.html';
    const primary = await context.newPage();
    primary.on('pageerror', (error) => errors.push(error.message));
    await primary.goto(controlledUrl);
    assert.equal((await pageState(primary, 'controlled')).providerState, 'unconfigured');
    const configured = await primary.evaluate((credential) => {
      const result = RLDATA.authorizeCredential('controlled', credential);
      return result.ok === true && result.state === 'configured' && JSON.stringify(result).includes(credential) === false;
    }, SENTINEL_PREFIX + index);
    assert.equal(configured, true);
    const primaryConfiguredState = await pageState(primary, 'controlled');

    const independent = await context.newPage();
    independent.on('pageerror', (error) => errors.push(error.message));
    await independent.goto(controlledUrl);
    const independentState = await pageState(independent, 'controlled');

    await primary.evaluate((url) => {
      const frame = document.createElement('iframe');
      frame.src = url;
      document.body.appendChild(frame);
    }, controlledUrl);
    await primary.waitForSelector('iframe');
    const frame = primary.frames().find((candidate) => candidate !== primary.mainFrame() && candidate.url() === controlledUrl);
    assert.ok(frame);
    await frame.waitForLoadState('domcontentloaded');
    const frameState = await frame.evaluate((sentinelPrefix) => ({
      leak: document.documentElement.outerHTML.includes(sentinelPrefix) || location.href.includes(sentinelPrefix),
      providerState: RLDATA.credentialStatus('controlled').state
    }), SENTINEL_PREFIX);

    const popupPromise = context.waitForEvent('page');
    await primary.evaluate((url) => { window.open(url, '_blank', 'noopener'); }, controlledUrl);
    const popup = await popupPromise;
    popup.on('pageerror', (error) => errors.push(error.message));
    await popup.waitForLoadState('domcontentloaded');
    const popupState = await pageState(popup, 'controlled');

    await primary.reload();
    const refreshedState = await pageState(primary, 'controlled');
    assert.equal(await primary.evaluate((credential) => RLDATA.authorizeCredential('controlled', credential).ok, SENTINEL_PREFIX + index), true);
    await primary.goto(site.baseUrl + '/index.html#data-settings');
    const indexState = await pageState(primary, 'twelvedata');
    await primary.goBack({ waitUntil: 'domcontentloaded' });
    const returnedState = await pageState(primary, 'controlled');

    const result = {
      bridgeLeakCount: [primaryConfiguredState, independentState, popupState, refreshedState, indexState, returnedState]
        .reduce((count, state) => count + Object.values(state.bridge).reduce((total, value) => total + value, 0), 0),
      credentialInputs: [primaryConfiguredState, independentState, popupState, refreshedState, indexState, returnedState]
        .reduce((count, state) => count + state.credentialInputs, 0),
      directCredentialContainers: [primaryConfiguredState, independentState, popupState, refreshedState, indexState, returnedState]
        .reduce((count, state) => count + state.directCredentialContainers, 0),
      errors: errors.length,
      forbiddenRuntimeApis: [primaryConfiguredState, independentState, popupState, refreshedState, indexState, returnedState]
        .reduce((count, state) => count + state.forbiddenRuntimeApis, 0),
      frameUnconfigured: frameState.providerState === 'unconfigured' && frameState.leak === false,
      independentUnconfigured: independentState.providerState === 'unconfigured',
      leakCount: [primaryConfiguredState, independentState, popupState, refreshedState, indexState, returnedState]
        .filter((state) => state.leak).length,
      primaryConfigured: primaryConfiguredState.providerState === 'configured',
      productionDisabled: indexState.providerState === 'disabled',
      popupNoOpener: popupState.openerPresent === false,
      popupUnconfigured: popupState.providerState === 'unconfigured',
      refreshedUnconfigured: refreshedState.providerState === 'unconfigured',
      returnedUnconfigured: returnedState.providerState === 'unconfigured'
    };
    await popup.close();
    await independent.close();
    await primary.close();
    return result;
  }));

  results.forEach((result) => assert.deepEqual(result, {
    bridgeLeakCount: 0,
    credentialInputs: 0,
    directCredentialContainers: 0,
    errors: 0,
    forbiddenRuntimeApis: 0,
    frameUnconfigured: true,
    independentUnconfigured: true,
    leakCount: 0,
    primaryConfigured: true,
    productionDisabled: true,
    popupNoOpener: true,
    popupUnconfigured: true,
    refreshedUnconfigured: true,
    returnedUnconfigured: true
  }));

  const registry = JSON.parse(readFileSync(resolve(ROOT, 'tools.json'), 'utf8')).tools;
  const sourceOffenders = registry.filter((tool) => {
    const source = readFileSync(resolve(ROOT, tool.file), 'utf8');
    return /\bRLDATA\.(?:key|keys|hasKey|setKey|clearAllKeys|buildProviderRequest|providerFetch|migrateLegacyCredentials)\b|\bfunction\s+(?:rlKeys|rlSetKey|rlGetKey|migrateLegacyKeys)\s*\(|\bstate\.(?:apiKey|fhKey|avKey|fredKey)\b|\b(?:apiKey|fhKey|avKey|fredKey)\s*:|\bfunction\s+(?:fetchTDOne|fetchHoldingsAV|fetchFinnhubQuotes)\s*\([^)]*\bkey\b|<input\b[^>]*(?:data-provider|type=["']password["'])/i.test(source);
  }).map((tool) => tool.id);
  assert.deepEqual(sourceOffenders, []);

  const registeredPages = await Promise.all(registry.map(async (tool, index) => {
    const context = contexts[index % contexts.length];
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const response = await page.goto(site.baseUrl + '/' + tool.file, { waitUntil: 'domcontentloaded' });
    const runtime = await pageState(page, 'twelvedata');
    const result = {
      id: tool.id,
      ok: !!(response && response.ok()),
      bridgeLeakCount: Object.values(runtime.bridge).reduce((count, value) => count + value, 0),
      credentialInputs: runtime.credentialInputs,
      directCredentialContainers: runtime.directCredentialContainers,
      forbiddenRuntimeApis: runtime.forbiddenRuntimeApis,
      leak: runtime.leak,
      productionDisabled: runtime.providerState === 'disabled',
      pageErrors
    };
    await page.close();
    return result;
  }));
  registeredPages.forEach((pageResult) => assert.deepEqual(pageResult, {
    id: pageResult.id,
    ok: true,
    bridgeLeakCount: 0,
    credentialInputs: 0,
    directCredentialContainers: 0,
    forbiddenRuntimeApis: 0,
    leak: false,
    productionDisabled: true,
    pageErrors: []
  }));

  const requestAudits = (await Promise.all(contextAudits.flatMap((audit) => audit.requestAuditPromises))).filter(Boolean);
  const credentialRequests = requestAudits.filter((audit) => audit.credentialRequest).length;
  const requestSentinelLeaks = requestAudits.filter((audit) => audit.sentinelLeak).length;
  assert.equal(credentialRequests, 0);
  assert.equal(requestSentinelLeaks, 0);

  console.log('BUG001_LOAD_BEGIN');
  console.log('CATEGORY=load');
  console.log('SERVER=ephemeral-same-origin-http');
  console.log('BROWSER=existing-chromium-compatible-executable');
  console.log('PARALLEL_CONTEXTS=' + CONTEXTS);
  console.log('MINIMUM_PAGES_PER_CONTEXT=3');
  console.log('CONTROLLED_TOP_LEVEL_PAGES=' + (CONTEXTS * 3));
  console.log('CONTROLLED_IFRAMES=' + CONTEXTS);
  console.log('REFRESH_BOUNDARIES=' + CONTEXTS);
  console.log('NAVIGATION_BOUNDARIES=' + CONTEXTS);
  console.log('REGISTERED_PAGES=' + registry.length);
  console.log('REGISTRY_SOURCE_OFFENDERS=' + sourceOffenders.length);
  console.log('REGISTRY_RUNTIME_ERRORS=' + registeredPages.reduce((count, result) => count + result.pageErrors.length, 0));
  console.log('CREDENTIAL_REQUESTS=' + credentialRequests);
  console.log('REQUEST_SENTINEL_LEAKS=' + requestSentinelLeaks);
  console.log('PRIMARY_CONFIGURED=' + results.filter((result) => result.primaryConfigured).length);
  console.log('INDEPENDENT_CONFIGURED=0');
  console.log('DURABLE_CREDENTIAL_STORES=0');
  console.log('CROSS_TAB_TRANSFERS=0');
  console.log('CROSS_WINDOW_TRANSFERS=0');
  console.log('CROSS_IFRAME_TRANSFERS=0');
  console.log('BRIDGE_LEAKS=0');
  console.log('RESULT=PASS');
  console.log('BUG001_LOAD_END');
  await Promise.all(contexts.map((context) => context.close()));
} finally {
  await browser.close();
  await site.close();
}