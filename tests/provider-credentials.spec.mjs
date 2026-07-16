  // Regression: specs/_bugs/BUG-001-central-provider-credential-security
  import { test, expect } from './playwright-runtime.mjs';
  import { readFileSync } from 'node:fs';
  import { resolve } from 'node:path';
  import { ROOT, startStaticServer } from './provider-credentials.support.mjs';

  let site;

  test.beforeAll(async () => {
    site = await startStaticServer();
  });

  test.afterAll(async () => {
    if (site) await site.close();
  });

  function controlledUrl() {
    return site.baseUrl + '/__bug001__/controlled.html';
  }

  async function configureControlled(page) {
    const configured = await page.evaluate((credential) => {
      const result = RLDATA.authorizeCredential('controlled', credential);
      return result.ok === true && result.state === 'configured' && !JSON.stringify(result).includes(credential);
    }, 'controlled-test-value');
    expect(configured).toBeTruthy();
  }

  async function expectControlledUnconfigured(page) {
    expect(await page.evaluate(() => RLDATA.credentialStatus('controlled').state)).toBe('unconfigured');
  }

  async function credentialBridgeLeakDetected(page) {
    return page.evaluate((credential) => {
      const storageContains = (storage) => Array.from({ length: storage.length }, (_, index) => storage.key(index)).some((key) => {
        const value = storage.getItem(key);
        return String(key).includes(credential) || String(value).includes(credential);
      });
      const surfaces = [
        location.href,
        document.referrer,
        document.documentElement.outerHTML,
        document.cookie,
        window.name,
        JSON.stringify(history.state)
      ];
      return surfaces.some((value) => String(value).includes(credential)) || storageContains(localStorage) || storageContains(sessionStorage);
    }, 'controlled-test-value');
  }

  test('Canary BUG-001: real index loads shared status and erase controls with no credential editor', async ({ page }) => {
    await page.goto(site.baseUrl + '/index.html#data-settings');
    await expect(page.locator('#data-settings')).toBeVisible();
    await expect(page.locator('#data-settings .settings-provider')).toHaveCount(4);
    await expect(page.locator('#data-settings input[data-provider], #data-settings input[type="password"]')).toHaveCount(0);
    await expect(page.locator('#data-settings .settings-save, #data-settings .settings-migrate')).toHaveCount(0);
    await expect(page.locator('#data-settings .settings-clear')).toBeVisible();

    const boot = await page.evaluate(() => {
      const scripts = Array.from(document.scripts).map((script) => script.getAttribute('src') || '');
      return {
        apiReady: typeof RLDATA === 'object' && typeof RLAPP === 'object',
        dataBeforeApp: scripts.findIndex((src) => src.startsWith('rldata.js')) < scripts.findIndex((src) => src.startsWith('rlapp.js')),
        policiesDisabled: RLDATA.providerPolicies().every((policy) => policy.state === 'disabled'),
        statusOnly: RLDATA.providerPolicies().every((policy) => ['providerId', 'label', 'state', 'reasonCode'].every((key) => Object.hasOwn(policy, key)))
      };
    });
    expect(boot).toEqual({ apiReady: true, dataBeforeApp: true, policiesDisabled: true, statusOnly: true });
  });

  test('Regression BUG-001: one shared current-document capability owns every credential surface', async ({ page, request }) => {
    const registry = JSON.parse(readFileSync(resolve(ROOT, 'tools.json'), 'utf8')).tools;
    const rldataSource = readFileSync(resolve(ROOT, 'rldata.js'), 'utf8');
    const rlappSource = readFileSync(resolve(ROOT, 'rlapp.js'), 'utf8');
    const forbiddenRuntimeIdentifiers = [
      'CREDENTIAL_STORE_KEY',
      'storageSurface',
      'readCredentialEnvelope',
      'writeCredentialEnvelope',
      'function getKey',
      'buildProviderRequest'
    ];

    expect((rldataSource.match(/function authorizeCredential\s*\(/g) || []).length).toBe(1);
    expect((rldataSource.match(/function credentialStatus\s*\(/g) || []).length).toBe(1);
    for (const identifier of forbiddenRuntimeIdentifiers) expect(rldataSource.includes(identifier)).toBeFalsy();
    expect(/settings-save|settings-migrate|input type="password"|api\.setKey|api\.hasKey/.test(rlappSource)).toBeFalsy();

    await page.goto(site.baseUrl + '/index.html#data-settings');
    await expect(page.locator('#data-settings input[data-provider], #data-settings input[type="password"]')).toHaveCount(0);

    for (const tool of registry) {
      const response = await request.get(site.baseUrl + '/' + tool.file);
      expect(response.ok()).toBeTruthy();
      const source = await response.text();
      expect(/\bfunction\s+(?:rlKeys|rlSetKey|rlGetKey|migrateLegacyKeys)\b/.test(source)).toBeFalsy();
      expect(/<input\b[^>]*(?:data-provider|id=["'](?:apiKey|fhKey|avKey|fredKey|keyInput|key)["'])[^>]*>/i.test(source)).toBeFalsy();
      expect(/\bstate\.(?:apiKey|fhKey|avKey|fredKey)\b|\b(?:apiKey|fhKey|avKey|fredKey)\s*:/.test(source)).toBeFalsy();
      await page.goto(site.baseUrl + '/' + tool.file, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('input[data-provider], input[type="password"]')).toHaveCount(0);
      expect(await page.evaluate(() => typeof RLDATA === 'object' && typeof RLDATA.credentialStatus === 'function')).toBeTruthy();
    }
  });

  test('Regression BUG-001: every lifecycle and document boundary starts unconfigured', async ({ browser, context, page }) => {
    const url = controlledUrl();
    await page.goto(url);
    await expectControlledUnconfigured(page);

    await configureControlled(page);
    expect(await credentialBridgeLeakDetected(page)).toBeFalsy();
    await page.evaluate(() => { location.hash = 'route-change'; });
    await expect.poll(() => page.evaluate(() => RLDATA.credentialStatus('controlled').state)).toBe('unconfigured');

    await configureControlled(page);
    await page.evaluate(() => { history.pushState({ route: 'history-change' }, '', '#history-change'); });
    await expectControlledUnconfigured(page);

    await configureControlled(page);
    await page.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); });
    await expectControlledUnconfigured(page);

    await configureControlled(page);
    await page.reload();
    await expectControlledUnconfigured(page);

    await configureControlled(page);
    await page.goto(site.baseUrl + '/index.html#data-settings');
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await expectControlledUnconfigured(page);

    await configureControlled(page);
    await page.evaluate((frameUrl) => {
      const frame = document.createElement('iframe');
      frame.src = frameUrl;
      document.body.appendChild(frame);
    }, url);
    await page.waitForSelector('iframe');
    const frame = page.frames().find((candidate) => candidate.url() === url && candidate !== page.mainFrame());
    expect(frame).toBeTruthy();
    await frame.waitForLoadState('domcontentloaded');
    expect(await frame.evaluate(() => RLDATA.credentialStatus('controlled').state)).toBe('unconfigured');

    const independent = await context.newPage();
    await independent.goto(url);
    await expectControlledUnconfigured(independent);
    await independent.close();

    const popupPromise = context.waitForEvent('page');
    await page.evaluate((popupUrl) => { window.open(popupUrl, '_blank', 'noopener'); }, url);
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await expectControlledUnconfigured(popup);
    await popup.close();

    const closing = await context.newPage();
    await closing.goto(url);
    await configureControlled(closing);
    await closing.close();
    const reopened = await context.newPage();
    await reopened.goto(url);
    await expectControlledUnconfigured(reopened);
    await reopened.close();

    const isolatedContext = await browser.newContext();
    try {
      const isolated = await isolatedContext.newPage();
      await isolated.goto(url);
      await expectControlledUnconfigured(isolated);
    } finally {
      await isolatedContext.close();
    }

    expect(await credentialBridgeLeakDetected(page)).toBeFalsy();
  });

  test('Regression BUG-001: unknown and prototype-shaped providers fail without mutation', async ({ page }) => {
    await page.goto(controlledUrl());
    const result = await page.evaluate(async (credential) => {
      const policyBefore = JSON.stringify(RLDATA.providerPolicies());
      const objectPrototypeBefore = Object.getOwnPropertyNames(Object.prototype).sort().join('|');
      const functionPrototypeBefore = Object.getOwnPropertyNames(Function.prototype).sort().join('|');
      const configured = RLDATA.authorizeCredential('controlled', credential).ok;
      const rogueIds = ['unknown', '', 'toString', 'constructor', '__proto__'];
      const providerResults = [];
      for (const providerId of rogueIds) {
        providerResults.push(RLDATA.credentialStatus(providerId));
        providerResults.push(RLDATA.authorizeCredential(providerId, credential));
        providerResults.push(RLDATA.clearCredential(providerId));
        providerResults.push(await RLDATA.useCredential(providerId, 'ping', {}));
      }
      const operationResults = [];
      for (const operationId of rogueIds) operationResults.push(await RLDATA.useCredential('controlled', operationId, {}));
      return {
        configured,
        operationRejectionsClosed: operationResults.every((entry) => Object.isFrozen(entry) && entry.ok === false && entry.reasonCode === 'UNKNOWN_OPERATION'),
        policyUnchanged: JSON.stringify(RLDATA.providerPolicies()) === policyBefore,
        providerRejectionsClosed: providerResults.every((entry) => Object.isFrozen(entry) && entry.ok === false && entry.reasonCode === 'UNKNOWN_PROVIDER'),
        prototypesUnchanged: Object.getOwnPropertyNames(Object.prototype).sort().join('|') === objectPrototypeBefore && Object.getOwnPropertyNames(Function.prototype).sort().join('|') === functionPrototypeBefore,
        runtimePreserved: RLDATA.credentialStatus('controlled').state === 'configured',
        secretReturned: JSON.stringify(providerResults.concat(operationResults)).includes(credential),
        storageEmpty: localStorage.length === 0 && sessionStorage.length === 0
      };
    }, 'controlled-test-value');

    expect(result).toEqual({
      configured: true,
      operationRejectionsClosed: true,
      policyUnchanged: true,
      providerRejectionsClosed: true,
      prototypesUnchanged: true,
      runtimePreserved: true,
      secretReturned: false,
      storageEmpty: true
    });
  });