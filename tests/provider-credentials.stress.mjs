// Regression: specs/_bugs/BUG-001-central-provider-credential-security
import assert from 'node:assert/strict';
import { browserLaunchOptions, loadPlaywright, startStaticServer } from './provider-credentials.support.mjs';

const CYCLES = 250;
const SENTINEL_PREFIX = 'BUG001-STRESS-SENTINEL-';
const LEGACY_LOCAL_NAMES = [
  'rlApiKeys',
  'tdKey',
  'etfMomTdKey',
  'msftFhKey',
  'etfMomFhKey',
  'etfMomLab',
  'sectorLab',
  'rlStratVal',
  'strategyValidationLab',
  'aiCapexApi'
];
const LEGACY_SESSION_NAMES = ['rlSessionProviderCredentialsV1'];
const UNKNOWN_CONTAINER = 'rlApiKeysCandidate';
const NON_SECRET_CACHE = 'rlData';
const CONTROLLED_ORIGIN = 'https://controlled.invalid';
const PRODUCTION_PROVIDER_ORIGIN = /(?:api\.twelvedata\.com|finnhub\.io|alphavantage\.co|fred\.stlouisfed)/i;

const site = await startStaticServer();
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(browserLaunchOptions());
const diagnostics = [];
const requestAuditPromises = [];
let activeCredential = null;

try {
  const context = await browser.newContext();
  await context.addInitScript(({ legacyLocalNames, legacySessionNames, sentinelPrefix }) => {
    const original = {
      getItem: Storage.prototype.getItem,
      removeItem: Storage.prototype.removeItem,
      setItem: Storage.prototype.setItem
    };
    const localNames = new Set(legacyLocalNames);
    const sessionNames = new Set(legacySessionNames);
    const state = {
      credentialStorageWriteAttempts: 0,
      failedRemovals: 0,
      failRemoval: null,
      legacyValueReads: 0,
      registeredWrites: 0,
      removed: [],
      removedUnexpected: [],
      runtimeNotEmptyAtRemoval: 0
    };

    function storageClass(storage) {
      if (storage === localStorage) return 'localStorage';
      if (storage === sessionStorage) return 'sessionStorage';
      return 'unknown';
    }
    function registered(storageName, key) {
      return storageName === 'localStorage' ? localNames.has(key) : storageName === 'sessionStorage' && sessionNames.has(key);
    }
    function storageFor(storageName) {
      if (storageName === 'localStorage') return localStorage;
      if (storageName === 'sessionStorage') return sessionStorage;
      throw new Error('unknown storage class');
    }
    function names(storage) {
      return Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter((key) => key !== null).sort();
    }

    Storage.prototype.getItem = function (key) {
      const storageName = storageClass(this);
      const normalized = String(key);
      if (registered(storageName, normalized)) {
        state.legacyValueReads += 1;
        throw new Error('registered legacy value read blocked');
      }
      return original.getItem.call(this, normalized);
    };
    Storage.prototype.setItem = function (key, value) {
      const storageName = storageClass(this);
      const normalized = String(key);
      if (registered(storageName, normalized)) {
        state.registeredWrites += 1;
        throw new Error('registered legacy container rewrite blocked');
      }
      if (String(value).includes(sentinelPrefix)) {
        state.credentialStorageWriteAttempts += 1;
        throw new Error('credential storage write blocked');
      }
      return original.setItem.call(this, normalized, String(value));
    };
    Storage.prototype.removeItem = function (key) {
      const storageName = storageClass(this);
      const normalized = String(key);
      if (registered(storageName, normalized)) {
        state.removed.push(storageName + ':' + normalized);
        if (window.RLDATA && window.RLDATA.credentialStatus('controlled').state !== 'unconfigured') {
          state.runtimeNotEmptyAtRemoval += 1;
        }
        if (state.failRemoval === storageName + ':' + normalized) {
          state.failedRemovals += 1;
          throw new Error('registered legacy deletion blocked');
        }
      } else {
        state.removedUnexpected.push(storageName + ':' + normalized);
      }
      return original.removeItem.call(this, normalized);
    };

    Object.defineProperty(window, '__bug001StorageAudit', {
      configurable: false,
      enumerable: false,
      value: Object.freeze({
        allowRemoval() {
          state.failRemoval = null;
        },
        failRemoval(storageName, key) {
          state.failRemoval = storageName + ':' + key;
        },
        names() {
          return { localStorage: names(localStorage), sessionStorage: names(sessionStorage) };
        },
        prepare(entries) {
          for (const key of legacyLocalNames.concat(['rlData', 'rlApiKeysCandidate'])) original.removeItem.call(localStorage, key);
          for (const key of legacySessionNames) original.removeItem.call(sessionStorage, key);
          for (const entry of entries) original.setItem.call(storageFor(entry.storageClass), entry.key, entry.value);
          state.credentialStorageWriteAttempts = 0;
          state.failedRemovals = 0;
          state.failRemoval = null;
          state.legacyValueReads = 0;
          state.registeredWrites = 0;
          state.removed = [];
          state.removedUnexpected = [];
          state.runtimeNotEmptyAtRemoval = 0;
        },
        readUnregistered(storageName, key) {
          if (registered(storageName, key)) throw new Error('test attempted registered legacy value read');
          return original.getItem.call(storageFor(storageName), key);
        },
        remainingValuesContainSentinel() {
          for (const storage of [localStorage, sessionStorage]) {
            for (const key of names(storage)) {
              const storageName = storageClass(storage);
              if (registered(storageName, key)) throw new Error('registered legacy container remains before value scan');
              if (String(original.getItem.call(storage, key)).includes(sentinelPrefix)) return true;
            }
          }
          return false;
        },
        summary() {
          return {
            credentialStorageWriteAttempts: state.credentialStorageWriteAttempts,
            failedRemovals: state.failedRemovals,
            legacyValueReads: state.legacyValueReads,
            registeredWrites: state.registeredWrites,
            removed: state.removed.slice(),
            removedUnexpected: state.removedUnexpected.slice(),
            runtimeNotEmptyAtRemoval: state.runtimeNotEmptyAtRemoval
          };
        }
      })
    });
  }, {
    legacyLocalNames: LEGACY_LOCAL_NAMES,
    legacySessionNames: LEGACY_SESSION_NAMES,
    sentinelPrefix: SENTINEL_PREFIX
  });

  const page = await context.newPage();
  page.on('console', (message) => diagnostics.push(message.text()));
  page.on('pageerror', (error) => diagnostics.push(error.message));
  page.on('request', (request) => {
    const credential = activeCredential;
    requestAuditPromises.push(request.allHeaders().then((headers) => {
      const url = request.url();
      return {
        approvedHeader: credential !== null && headers['x-controlled-test'] === credential,
        controlled: new URL(url).origin === CONTROLLED_ORIGIN,
        credentialInUrl: credential !== null && url.includes(credential),
        productionProvider: PRODUCTION_PROVIDER_ORIGIN.test(url)
      };
    }));
  });

  const controlledUrl = site.baseUrl + '/__bug001__/controlled.html';
  await page.goto(controlledUrl);
  const totals = {
    controlledHeaderAttempts: 0,
    credentialStorageWriteAttempts: 0,
    failedRemovals: 0,
    legacyValueReads: 0,
    productionProviderRequests: 0,
    registeredWrites: 0,
    removedUnexpected: 0,
    runtimeNotEmptyAtRemoval: 0
  };

  for (let cycle = 0; cycle < CYCLES; cycle += 1) {
    const localName = LEGACY_LOCAL_NAMES[cycle % LEGACY_LOCAL_NAMES.length];
    const sessionName = LEGACY_SESSION_NAMES[cycle % LEGACY_SESSION_NAMES.length];
    const storageOutcome = await page.evaluate(async ({ cycleNumber, localName, sessionName, sentinelPrefix }) => {
      const sentinel = sentinelPrefix + cycleNumber;
      const audit = window.__bug001StorageAudit;
      audit.prepare([
        { storageClass: 'localStorage', key: localName, value: sentinel },
        { storageClass: 'sessionStorage', key: sessionName, value: sentinel },
        { storageClass: 'localStorage', key: 'rlData', value: '{"v":1,"bars":{},"quotes":{},"options":{},"si":{},"macro":null,"events":{},"toolReads":{}}' },
        { storageClass: 'localStorage', key: 'rlApiKeysCandidate', value: 'opaque-control' }
      ]);
      const beforeDismiss = audit.names();
      const firstDetection = RLDATA.detectLegacyCredentialLocations();
      const secondDetection = RLDATA.detectLegacyCredentialLocations();
      const afterDismiss = audit.names();
      const authorizedForClear = RLDATA.authorizeCredential('controlled', sentinel);
      audit.failRemoval('localStorage', localName);
      const partialClear = await RLDATA.clearAllCredentials();
      const namesAfterPartialClear = audit.names();
      const runtimeAfterPartialClear = RLDATA.credentialStatus('controlled');
      audit.allowRemoval();
      const eraseResult = await RLDATA.eraseLegacyCredentialLocations();
      const namesAfterErase = audit.names();
      const explicitAuthorization = RLDATA.authorizeCredential('controlled', sentinel);
      const explicitClear = RLDATA.clearCredential('controlled');
      const finalStatus = RLDATA.credentialStatus('controlled');
      const auditSummary = audit.summary();
      const registeredNamesAfterPartial = namesAfterPartialClear.localStorage.filter((key) => key === localName)
        .concat(namesAfterPartialClear.sessionStorage.filter((key) => key === sessionName));
      const resultText = JSON.stringify([firstDetection, secondDetection, partialClear, eraseResult, explicitClear, finalStatus]);
      return {
        auditSummary,
        boundedDetection: Object.isFrozen(firstDetection)
          && firstDetection.detected === true
          && firstDetection.containerCount === 2
          && Array.isArray(firstDetection.providerIds)
          && firstDetection.providerIds.length > 0
          && firstDetection.providerIds.every((providerId) => ['twelvedata', 'finnhub', 'alphavantage', 'fred'].includes(providerId))
          && Array.isArray(firstDetection.locationClasses)
          && firstDetection.locationClasses.length > 0
          && firstDetection.locationClasses.every((locationClass) => typeof locationClass === 'string' && locationClass.length > 0),
        dismissalInert: JSON.stringify(firstDetection) === JSON.stringify(secondDetection)
          && JSON.stringify(beforeDismiss) === JSON.stringify(afterDismiss),
        explicitClear: explicitAuthorization.ok === true
          && explicitClear.ok === true
          && explicitClear.state === 'unconfigured'
          && finalStatus.state === 'unconfigured',
        partialClear: authorizedForClear.ok === true
          && partialClear.ok === false
          && partialClear.runtimeState === 'unconfigured'
          && partialClear.cleanupStatus === 'incomplete'
          && partialClear.code === 'CLEAR_INCOMPLETE'
          && partialClear.remainingContainerCount >= 1
          && runtimeAfterPartialClear.state === 'unconfigured'
          && registeredNamesAfterPartial.length === 1,
        wholeContainerErase: eraseResult.ok === true
          && eraseResult.status === 'complete'
          && eraseResult.remainingContainerCount === 0
          && namesAfterErase.localStorage.includes(localName) === false
          && namesAfterErase.sessionStorage.includes(sessionName) === false,
        exactNameBoundary: namesAfterErase.localStorage.includes('rlApiKeysCandidate')
          && audit.readUnregistered('localStorage', 'rlApiKeysCandidate') === 'opaque-control',
        nonSecretCachePreserved: audit.readUnregistered('localStorage', 'rlData') === '{"v":1,"bars":{},"quotes":{},"options":{},"si":{},"macro":null,"events":{},"toolReads":{}}',
        sentinelAbsent: resultText.includes(sentinel) === false
          && document.documentElement.outerHTML.includes(sentinel) === false
          && location.href.includes(sentinel) === false
          && document.referrer.includes(sentinel) === false
          && audit.remainingValuesContainSentinel() === false
      };
    }, { cycleNumber: cycle, localName, sessionName, sentinelPrefix: SENTINEL_PREFIX });

    assert.deepEqual({
      boundedDetection: storageOutcome.boundedDetection,
      dismissalInert: storageOutcome.dismissalInert,
      exactNameBoundary: storageOutcome.exactNameBoundary,
      explicitClear: storageOutcome.explicitClear,
      nonSecretCachePreserved: storageOutcome.nonSecretCachePreserved,
      partialClear: storageOutcome.partialClear,
      sentinelAbsent: storageOutcome.sentinelAbsent,
      wholeContainerErase: storageOutcome.wholeContainerErase
    }, {
      boundedDetection: true,
      dismissalInert: true,
      exactNameBoundary: true,
      explicitClear: true,
      nonSecretCachePreserved: true,
      partialClear: true,
      sentinelAbsent: true,
      wholeContainerErase: true
    });

    totals.credentialStorageWriteAttempts += storageOutcome.auditSummary.credentialStorageWriteAttempts;
    totals.failedRemovals += storageOutcome.auditSummary.failedRemovals;
    totals.legacyValueReads += storageOutcome.auditSummary.legacyValueReads;
    totals.registeredWrites += storageOutcome.auditSummary.registeredWrites;
    totals.removedUnexpected += storageOutcome.auditSummary.removedUnexpected.length;
    totals.runtimeNotEmptyAtRemoval += storageOutcome.auditSummary.runtimeNotEmptyAtRemoval;

    const credential = SENTINEL_PREFIX + cycle;
    const requestPromiseStart = requestAuditPromises.length;
    activeCredential = credential;
    const transportOutcome = await page.evaluate(async (sentinel) => {
      const configured = RLDATA.authorizeCredential('controlled', sentinel);
      const controlledFailure = await RLDATA.useCredential('controlled', 'ping', {});
      const productionStatus = RLDATA.credentialStatus('twelvedata');
      const productionAuthorization = RLDATA.authorizeCredential('twelvedata', sentinel);
      const productionFailure = await RLDATA.useCredential('twelvedata', 'time_series', {});
      const cleared = RLDATA.clearCredential('controlled');
      const serialized = JSON.stringify([configured, controlledFailure, productionStatus, productionAuthorization, productionFailure, cleared]);
      return {
        configured: configured.ok === true && configured.state === 'configured',
        controlledFailure: controlledFailure.ok === false
          && ['PROVIDER_AUTH_FAILED', 'PROVIDER_REQUEST_FAILED'].includes(controlledFailure.reasonCode),
        productionDisabled: productionStatus.state === 'disabled'
          && productionStatus.reasonCode === 'PROVIDER_DISABLED'
          && productionAuthorization.ok === false
          && productionAuthorization.reasonCode === 'PROVIDER_DISABLED'
          && productionFailure.ok === false
          && productionFailure.reasonCode === 'PROVIDER_DISABLED',
        sanitized: serialized.includes(sentinel) === false
          && ['headers', 'url', 'body', 'stack', 'cause', 'response'].every((key) => Object.hasOwn(controlledFailure, key) === false),
        cleared: cleared.ok === true && RLDATA.credentialStatus('controlled').state === 'unconfigured'
      };
    }, credential);
    const cycleRequests = await Promise.all(requestAuditPromises.slice(requestPromiseStart));
    activeCredential = null;
    const controlledRequests = cycleRequests.filter((request) => request.controlled);
    const productionRequests = cycleRequests.filter((request) => request.productionProvider);
    assert.deepEqual(transportOutcome, {
      configured: true,
      controlledFailure: true,
      productionDisabled: true,
      sanitized: true,
      cleared: true
    });
    assert.equal(controlledRequests.length, 1);
    assert.equal(controlledRequests[0].approvedHeader, true);
    assert.equal(controlledRequests[0].credentialInUrl, false);
    assert.equal(productionRequests.length, 0);
    totals.controlledHeaderAttempts += controlledRequests.length;
    totals.productionProviderRequests += productionRequests.length;

    await page.goto(site.baseUrl + '/index.html#data-settings');
    const indexOutcome = await page.evaluate((sentinel) => ({
      credentialInputs: document.querySelectorAll('input[data-provider], input[type="password"]').length,
      disabledPolicies: RLDATA.providerPolicies().every((policy) => policy.state === 'disabled'),
      leak: document.documentElement.outerHTML.includes(sentinel)
        || location.href.includes(sentinel)
        || document.referrer.includes(sentinel)
        || JSON.stringify(history.state).includes(sentinel)
    }), credential);
    assert.deepEqual(indexOutcome, { credentialInputs: 0, disabledPolicies: true, leak: false });
    await page.goto(controlledUrl);
    assert.equal(await page.evaluate(() => RLDATA.credentialStatus('controlled').state), 'unconfigured');
  }

  assert.deepEqual(totals, {
    controlledHeaderAttempts: CYCLES,
    credentialStorageWriteAttempts: 0,
    failedRemovals: CYCLES,
    legacyValueReads: 0,
    productionProviderRequests: 0,
    registeredWrites: 0,
    removedUnexpected: 0,
    runtimeNotEmptyAtRemoval: 0
  });
  assert.equal(diagnostics.filter((value) => String(value).includes(SENTINEL_PREFIX)).length, 0);

  console.log('BUG001_STRESS_BEGIN');
  console.log('CATEGORY=stress');
  console.log('SERVER=ephemeral-same-origin-http');
  console.log('BROWSER=existing-chromium-compatible-executable');
  console.log('CYCLES=' + CYCLES);
  console.log('DETECTION_CYCLES=' + CYCLES);
  console.log('DISMISSAL_CYCLES=' + CYCLES);
  console.log('PARTIAL_CLEAR_CYCLES=' + CYCLES);
  console.log('WHOLE_ERASE_CYCLES=' + CYCLES);
  console.log('AUTHORIZED_FAILURE_CYCLES=' + CYCLES);
  console.log('EXPLICIT_CLEAR_CYCLES=' + CYCLES);
  console.log('NAVIGATION_CYCLES=' + CYCLES);
  console.log('CONTROLLED_HEADER_ATTEMPTS=' + totals.controlledHeaderAttempts);
  console.log('PRODUCTION_PROVIDER_REQUESTS=' + totals.productionProviderRequests);
  console.log('LEGACY_VALUE_READS=' + totals.legacyValueReads);
  console.log('REGISTERED_CONTAINER_WRITES=' + totals.registeredWrites);
  console.log('UNEXPECTED_CONTAINER_REMOVALS=' + totals.removedUnexpected);
  console.log('RENDERED_SENTINELS=0');
  console.log('DIAGNOSTIC_SENTINELS=0');
  console.log('RESULT=PASS');
  console.log('BUG001_STRESS_END');
  await context.close();
} finally {
  await browser.close();
  await site.close();
}