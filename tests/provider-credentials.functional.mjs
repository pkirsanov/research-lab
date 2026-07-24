// Regression: specs/_bugs/BUG-002-two-tier-provider-access (supersedes BUG-001)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createStorage, loadRldata } from './provider-credentials.support.mjs';

const PROXY_BASE_URL = 'https://proxy.research.invalid';
const FINNHUB_REQUEST_PATH = 'api/v1/quote?symbol=MSFT';
const DIRECT_PROVIDER_BY_ORIGIN = new Map([
  ['https://api.twelvedata.com', 'twelvedata'],
  ['https://finnhub.io', 'finnhub'],
  ['https://www.alphavantage.co', 'alphavantage'],
  ['https://api.stlouisfed.org', 'fred']
]);

function providerContractsFromProduction() {
  const source = readFileSync(new URL('../rldata.js', import.meta.url), 'utf8');
  const registryMatch = source.match(/var PROVIDERS = Object\.freeze\(\{([\s\S]*?)\n  \}\);\n  var PROVIDER_IDS/);
  assert.ok(registryMatch, 'production provider registry must be readable');
  const entryPattern = /^\s*([a-z0-9]+):\s*Object\.freeze\(\{[^\n]*?\bid:\s*"([^"]+)"[^\n]*?\bhost:\s*"([^"]+)"[^\n]*?\bkeyParam:\s*"([^"]+)"[^\n]*\}\),?\s*$/gm;
  const contracts = Array.from(registryMatch[1].matchAll(entryPattern), (match) => ({
    registryName: match[1],
    id: match[2],
    host: match[3],
    keyParam: match[4]
  }));
  assert.ok(contracts.length > 0, 'production provider registry must contain supported providers');
  assert.equal(contracts.every(({ registryName, id }) => registryName === id), true, 'provider registry keys and IDs must agree');
  return contracts;
}

function credentialCaseVariants(name) {
  let letterIndex = 0;
  const mixedCase = Array.from(name, (character) => {
    if (!/[a-z]/i.test(character)) return character;
    const transformed = letterIndex % 2 === 0 ? character.toUpperCase() : character.toLowerCase();
    letterIndex += 1;
    return transformed;
  }).join('');
  return [...new Set([name, name.toUpperCase(), mixedCase])];
}

function queryEntriesByCredentialClass(url, credentialNames, credentialBearing) {
  return Array.from(url.searchParams.entries()).filter(([name]) => credentialNames.has(name.toLowerCase()) === credentialBearing);
}

function response(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload
  };
}

function requestClass(url) {
  const parsed = new URL(url);
  if (url === `${PROXY_BASE_URL}/health`) return 'health';
  if (parsed.origin === PROXY_BASE_URL) return `proxy-${parsed.pathname.split('/')[1] || 'unknown'}`;
  const directProvider = DIRECT_PROVIDER_BY_ORIGIN.get(parsed.origin);
  return directProvider ? `direct-${directProvider}` : 'unexpected';
}

async function createProxyRealm({ keys = {}, proxyRoute, directRoute, loadOptions = {} }) {
  const requests = [];
  const fetch = async (input, options = {}) => {
    const url = String(input);
    const parsed = new URL(url);
    const entry = { url, options };
    requests.push(entry);

    if (url === `${PROXY_BASE_URL}/health`) return response(200, { status: 'ok' });
    if (parsed.origin === PROXY_BASE_URL) return proxyRoute(entry);

    const provider = DIRECT_PROVIDER_BY_ORIGIN.get(parsed.origin);
    if (provider) return directRoute({ ...entry, provider });
    throw new Error('unexpected provider request class');
  };
  const realm = loadRldata({ ...loadOptions, fetch });
  realm.api.setProxyBaseUrl(PROXY_BASE_URL);
  for (const [provider, key] of Object.entries(keys)) {
    assert.equal(realm.api.setKey(provider, key).ok, true);
  }
  assert.equal(await realm.api.recheckProxy(), true, 'proxy health must succeed before the provider request');
  return { realm, requests };
}

async function invokeFinnhub(realm, urlOrPath = FINNHUB_REQUEST_PATH) {
  try {
    return {
      result: await realm.api.providerFetch('finnhub', urlOrPath),
      rejection: null
    };
  } catch (rejection) {
    return { result: undefined, rejection };
  }
}

test('SCN-BUG002-002 local keys persist across lifecycle signals (Tier-2 is durable, not memory-only)', () => {
  const key = 'functional-local-sentinel';
  for (const type of ['hashchange', 'popstate', 'pagehide', 'beforeunload']) {
    const realm = loadRldata();
    assert.equal(realm.api.setKey('finnhub', key).ok, true);
    assert.equal(realm.api.providerStatus('finnhub').state, 'configured');
    realm.dispatchLifecycle(type, { persisted: true });
    // New contract: navigation/lifecycle does NOT clear the local key (opposite of BUG-001).
    assert.equal(realm.api.providerStatus('finnhub').state, 'configured', `${type} must not clear the persisted local key`);
    assert.deepEqual(realm.sessionStorage.snapshot(), {}, 'no key ever touches sessionStorage');
  }
});

test('SCN-BUG002-002b same browser shares keys across pages; separate browsers stay isolated', () => {
  const key = 'shared-across-pages';
  const localStorage = createStorage();
  const sessionStorage = createStorage();

  // Same browser (shared localStorage): a key set on one page is visible on another.
  const pageOne = loadRldata({ localStorage, sessionStorage, pathname: '/index.html' });
  assert.equal(pageOne.api.setKey('twelvedata', key).ok, true);
  const pageTwo = loadRldata({ localStorage, sessionStorage, pathname: '/sector-research-lab.html' });
  assert.equal(pageTwo.api.providerStatus('twelvedata').state, 'configured', 'a key set on one page is visible on another page of the same browser');

  // Separate browser (separate localStorage): user B never sees user A's key.
  const otherBrowser = loadRldata({ localStorage: createStorage(), sessionStorage: createStorage() });
  assert.equal(otherBrowser.api.providerStatus('twelvedata').state, 'unconfigured', 'a separate browser does not see another browser key');
  assert.equal(JSON.stringify(otherBrowser.api.providerAccess()).includes(key), false, 'a separate browser never receives the key value');

  // clearKey removes it for this browser only.
  assert.equal(pageOne.api.clearKey('twelvedata').ok, true);
  const pageThree = loadRldata({ localStorage, sessionStorage });
  assert.equal(pageThree.api.providerStatus('twelvedata').state, 'unconfigured', 'clearKey removes the key for this browser');
  assert.deepEqual(sessionStorage.snapshot(), {}, 'keys never touch sessionStorage');
});

test('Regression BUG-004: proxy HTTP failure falls back once to same-provider local key', async () => {
  for (const proxyStatus of [503, 502]) {
    const localKey = `bug004-finnhub-http-${proxyStatus}`;
    const directResult = {
      source: { provider: 'finnhub', tier: 'direct' },
      quote: { symbol: 'MSFT', fields: ['current', 'change', 'timestamp'] },
      recoveredFromStatus: proxyStatus
    };
    const { realm, requests } = await createProxyRealm({
      keys: { finnhub: localKey },
      proxyRoute: async () => response(proxyStatus, {
        code: proxyStatus === 503 ? 'PROVIDER_KEY_MISSING' : 'UPSTREAM_UNAVAILABLE',
        provider: 'finnhub'
      }),
      directRoute: async ({ provider }) => {
        assert.equal(provider, 'finnhub');
        return response(200, directResult);
      }
    });

    const { result, rejection } = await invokeFinnhub(realm);
    const classes = requests.map(({ url }) => requestClass(url));
    const proxyRequests = requests.filter(({ url }) => new URL(url).origin === PROXY_BASE_URL);
    const directRequests = requests.filter(({ url }) => new URL(url).origin === 'https://finnhub.io');

    assert.deepEqual(classes, ['health', 'proxy-finnhub', 'direct-finnhub']);
    assert.equal(proxyRequests.every(({ url }) => !url.includes(localKey)), true, `status ${proxyStatus} proxy URLs must stay keyless`);
    assert.equal(rejection, null, `status ${proxyStatus} must continue to the local tier`);
    assert.deepEqual(result, directResult, `status ${proxyStatus} must return the direct host structure`);
    assert.equal(Object.hasOwn(result, 'code'), false, 'the direct result must not be confused with the proxy error envelope');
    assert.equal(directRequests.length, 1, 'fallback must make exactly one direct request');
    const directUrl = new URL(directRequests[0].url);
    assert.equal(directUrl.pathname, '/api/v1/quote');
    assert.equal(directUrl.searchParams.get('symbol'), 'MSFT');
    assert.equal(directUrl.searchParams.get('token'), localKey, 'only the direct finnhub request may carry the local key');
    assert.equal(requests.length, 3, 'no retry or extra provider request is allowed');

    const observableSurfaces = JSON.stringify({
      access: realm.api.providerAccess(),
      status: realm.api.providerStatus('finnhub'),
      dataState: realm.api.dataState(),
      toolReads: realm.api.toolRead(),
      result,
      rejection: rejection && rejection.message
    });
    assert.equal(observableSurfaces.includes(localKey), false, 'status, access, tool-read, result, and error surfaces must remain keyless');
  }
});

test('Regression BUG-004: key-bearing full URL stays keyless at proxy and singular at direct fallback', async () => {
  const localKey = 'bug004-full-url-local-sentinel';
  const requestUrl = new URL('https://finnhub.io/api/v1/quote');
  requestUrl.searchParams.append('symbol', 'MSFT');
  requestUrl.searchParams.append('metric', 'price');
  requestUrl.searchParams.append('metric', 'volume');
  requestUrl.searchParams.append('token', localKey);
  requestUrl.searchParams.append('empty', '');
  const expectedQuery = Array.from(requestUrl.searchParams.entries()).filter(([name]) => name !== 'token');
  const directResult = {
    source: { provider: 'finnhub', tier: 'direct' },
    quote: { symbol: 'MSFT', metrics: ['price', 'volume'] },
    recoveredFrom: 'key-bearing-full-url'
  };
  const { realm, requests } = await createProxyRealm({
    keys: { finnhub: localKey, twelvedata: 'bug004-cross-provider-sentinel' },
    proxyRoute: async () => response(503, { code: 'PROVIDER_KEY_MISSING', provider: 'finnhub' }),
    directRoute: async () => response(200, directResult)
  });

  const { result, rejection } = await invokeFinnhub(realm, requestUrl.href);
  const classes = requests.map(({ url }) => requestClass(url));
  const proxyUrls = requests
    .filter(({ url }) => new URL(url).origin === PROXY_BASE_URL)
    .map(({ url }) => new URL(url));
  const proxyProviderUrl = proxyUrls.find(({ pathname }) => pathname.startsWith('/finnhub/'));
  const directUrls = requests
    .filter(({ url }) => DIRECT_PROVIDER_BY_ORIGIN.has(new URL(url).origin))
    .map(({ url }) => new URL(url));
  const directUrl = directUrls[0];
  const withoutCredential = (url) => Array.from(url.searchParams.entries()).filter(([name]) => name !== 'token');

  assert.deepEqual({
    classes,
    proxyKeyParamCount: proxyUrls.reduce((count, url) => count + url.searchParams.getAll('token').length, 0),
    proxyContainsLocalKey: proxyUrls.some((url) => url.href.includes(localKey)),
    directRequestCount: directUrls.length,
    directProviderClass: directUrl && requestClass(directUrl.href),
    directKeyParamCount: directUrl && directUrl.searchParams.getAll('token').length,
    directKeyMatchesLocal: directUrl && directUrl.searchParams.get('token') === localKey,
    crossProviderRequested: classes.some((request) => request.startsWith('direct-') && request !== 'direct-finnhub'),
    proxyPathPreserved: proxyProviderUrl && proxyProviderUrl.pathname === `/finnhub${requestUrl.pathname}`,
    proxyQueryPreserved: proxyProviderUrl && JSON.stringify(withoutCredential(proxyProviderUrl)) === JSON.stringify(expectedQuery),
    directPathPreserved: directUrl && directUrl.pathname === requestUrl.pathname,
    directQueryPreserved: directUrl && JSON.stringify(withoutCredential(directUrl)) === JSON.stringify(expectedQuery),
    directResultReturned: JSON.stringify(result) === JSON.stringify(directResult),
    rejectionMessage: rejection && rejection.message
  }, {
    classes: ['health', 'proxy-finnhub', 'direct-finnhub'],
    proxyKeyParamCount: 0,
    proxyContainsLocalKey: false,
    directRequestCount: 1,
    directProviderClass: 'direct-finnhub',
    directKeyParamCount: 1,
    directKeyMatchesLocal: true,
    crossProviderRequested: false,
    proxyPathPreserved: true,
    proxyQueryPreserved: true,
    directPathPreserved: true,
    directQueryPreserved: true,
    directResultReturned: true,
    rejectionMessage: null
  }, 'full provider URLs must strip credentials before proxy routing and append exactly one local key only at same-provider direct fallback');
});

test('Regression BUG-004: registry-reserved query fields are stripped before proxy and canonicalized once for direct', async () => {
  const contracts = providerContractsFromProduction();
  assert.deepEqual(
    contracts.map(({ host, id }) => [`https://${host}`, id]),
    Array.from(DIRECT_PROVIDER_BY_ORIGIN.entries()),
    'the functional harness must cover every production registry provider'
  );
  const reservedQueryNames = [...new Set(contracts.map(({ keyParam }) => keyParam))];
  const normalizedReservedQueryNames = new Set(reservedQueryNames.map((name) => name.toLowerCase()));
  const configuredKeys = Object.fromEntries(contracts.map(({ id }) => [id, `bug004-${id}-configured-key`]));
  const expectedNonCredentialEntries = [
    ['symbol', 'ORDER-CANARY'],
    ['metric', 'price'],
    ['metric', 'volume'],
    ['empty', '']
  ];
  const observations = [];

  for (const contract of contracts) {
    const requestUrl = new URL(`https://${contract.host}/v1/security-normalization`);
    requestUrl.searchParams.append('symbol', 'ORDER-CANARY');
    for (const reservedQueryName of reservedQueryNames) {
      for (const variant of credentialCaseVariants(reservedQueryName)) {
        requestUrl.searchParams.append(variant, `caller-${contract.id}-${variant}-first`);
        requestUrl.searchParams.append(variant, `caller-${contract.id}-${variant}-second`);
      }
    }
    requestUrl.searchParams.append('metric', 'price');
    requestUrl.searchParams.append('metric', 'volume');
    requestUrl.searchParams.append('empty', '');

    const { realm, requests } = await createProxyRealm({
      keys: configuredKeys,
      proxyRoute: async () => response(503, { code: 'PROVIDER_KEY_MISSING', provider: contract.id }),
      directRoute: async ({ provider }) => {
        assert.equal(provider, contract.id, 'fallback must stay on the selected registry provider');
        return response(200, { recovered: true });
      }
    });

    let rejection = null;
    try {
      await realm.api.providerFetch(contract.id, requestUrl.href);
    } catch (error) {
      rejection = error;
    }

    const classes = requests.map(({ url }) => requestClass(url));
    const proxyRequest = requests.find(({ url }) => requestClass(url) === `proxy-${contract.id}`);
    const directRequests = requests.filter(({ url }) => requestClass(url).startsWith('direct-'));
    const directRequest = directRequests[0];
    const proxyUrl = proxyRequest && new URL(proxyRequest.url);
    const directUrl = directRequest && new URL(directRequest.url);
    const proxyCredentialEntries = proxyUrl
      ? queryEntriesByCredentialClass(proxyUrl, normalizedReservedQueryNames, true)
      : [];
    const directCredentialEntries = directUrl
      ? queryEntriesByCredentialClass(directUrl, normalizedReservedQueryNames, true)
      : [];
    const configuredCanonicalCount = directCredentialEntries.filter(([name, value]) => (
      name === contract.keyParam && value === configuredKeys[contract.id]
    )).length;

    observations.push({
      provider: contract.id,
      orderExact: JSON.stringify(classes) === JSON.stringify(['health', `proxy-${contract.id}`, `direct-${contract.id}`]),
      proxyCredentialLeakCount: proxyCredentialEntries.length,
      directUnexpectedCredentialCount: directCredentialEntries.length - configuredCanonicalCount,
      directConfiguredCanonicalCount: configuredCanonicalCount,
      proxyNonCredentialOrderExact: proxyUrl && JSON.stringify(queryEntriesByCredentialClass(proxyUrl, normalizedReservedQueryNames, false)) === JSON.stringify(expectedNonCredentialEntries),
      directNonCredentialOrderExact: directUrl && JSON.stringify(queryEntriesByCredentialClass(directUrl, normalizedReservedQueryNames, false)) === JSON.stringify(expectedNonCredentialEntries),
      directRequestCount: directRequests.length,
      crossProviderRequestCount: classes.filter((requestClassName) => requestClassName.startsWith('direct-') && requestClassName !== `direct-${contract.id}`).length,
      rejectionMessage: rejection && rejection.message
    });
  }

  console.log('BUG004_CREDENTIAL_NORMALIZATION_MATRIX_BEGIN');
  console.log(`REGISTRY_PROVIDER_COUNT=${contracts.length}`);
  console.log(`REGISTRY_RESERVED_QUERY_NAME_COUNT=${reservedQueryNames.length}`);
  console.log(`REGISTRY_RESERVED_QUERY_NAMES=${reservedQueryNames.join(',')}`);
  console.log(`CALLER_RESERVED_QUERY_ENTRY_COUNT_PER_PROVIDER=${reservedQueryNames.flatMap(credentialCaseVariants).length * 2}`);
  for (const observation of observations) {
    console.log(`PROVIDER=${observation.provider} PROXY_CREDENTIAL_LEAKS=${observation.proxyCredentialLeakCount} DIRECT_UNEXPECTED_CREDENTIALS=${observation.directUnexpectedCredentialCount} DIRECT_CONFIGURED_CANONICAL=${observation.directConfiguredCanonicalCount} DIRECT_REQUESTS=${observation.directRequestCount} CROSS_PROVIDER_REQUESTS=${observation.crossProviderRequestCount} ORDER_EXACT=${observation.orderExact} PROXY_NONCREDENTIAL_ORDER=${observation.proxyNonCredentialOrderExact} DIRECT_NONCREDENTIAL_ORDER=${observation.directNonCredentialOrderExact}`);
  }
  console.log(`TOTAL_PROXY_CREDENTIAL_LEAKS=${observations.reduce((total, observation) => total + observation.proxyCredentialLeakCount, 0)}`);
  console.log(`TOTAL_DIRECT_UNEXPECTED_CREDENTIALS=${observations.reduce((total, observation) => total + observation.directUnexpectedCredentialCount, 0)}`);
  console.log('EXTERNAL_NETWORK=false');
  const failingProviders = observations.filter((observation) => !(
    observation.orderExact === true
    && observation.proxyCredentialLeakCount === 0
    && observation.directUnexpectedCredentialCount === 0
    && observation.directConfiguredCanonicalCount === 1
    && observation.proxyNonCredentialOrderExact === true
    && observation.directNonCredentialOrderExact === true
    && observation.directRequestCount === 1
    && observation.crossProviderRequestCount === 0
    && observation.rejectionMessage === null
  ));
  console.log(`MATRIX_FAILURES=${failingProviders.length}`);
  console.log('BUG004_CREDENTIAL_NORMALIZATION_MATRIX_END');

  assert.equal(failingProviders.length, 0, 'every registry-reserved query-field name, including case variants and duplicates, must be removed before proxy routing and replaced by one selected-provider canonical field only on direct fallback');
});

test('Regression BUG-004: proxy transport rejection falls back once to same-provider local key', async () => {
  const localKey = 'bug004-finnhub-transport-key';
  const rawTransportError = 'raw proxy socket detail must stay private';
  const directResult = { provider: 'finnhub', recovered: true, structure: ['quote', 'direct'] };
  const { realm, requests } = await createProxyRealm({
    keys: { finnhub: localKey },
    proxyRoute: async () => { throw new Error(rawTransportError); },
    directRoute: async ({ provider }) => {
      assert.equal(provider, 'finnhub');
      return response(200, directResult);
    }
  });

  const { result, rejection } = await invokeFinnhub(realm);
  assert.deepEqual(requests.map(({ url }) => requestClass(url)), ['health', 'proxy-finnhub', 'direct-finnhub']);
  assert.equal(requests.filter(({ url }) => new URL(url).origin === 'https://finnhub.io').length, 1);
  assert.deepEqual(result, directResult);
  assert.equal(rejection, null);
  assert.equal(JSON.stringify({ result, rejection }).includes(rawTransportError), false, 'raw transport errors must not surface');
  assert.equal(requests.filter(({ url }) => new URL(url).origin === PROXY_BASE_URL).every(({ url }) => !url.includes(localKey)), true);
});

test('Regression BUG-004: proxy timeout rejection falls back once to same-provider local key', async () => {
  const localKey = 'bug004-finnhub-timeout-key';
  const rawTimeoutError = 'raw proxy timeout detail must stay private';
  const directResult = { provider: 'finnhub', recovered: true, transport: 'direct-after-timeout' };
  const timers = [];
  let providerTimeoutScheduled = false;
  const setTimeout = (callback, milliseconds) => {
    const timer = { callback, cleared: false, milliseconds };
    timers.push(timer);
    if (milliseconds === 12000 && !providerTimeoutScheduled) {
      providerTimeoutScheduled = true;
      queueMicrotask(() => { if (!timer.cleared) callback(); });
    }
    return timer;
  };
  const clearTimeout = (timer) => { timer.cleared = true; };
  let proxySignalAborted = false;
  const { realm, requests } = await createProxyRealm({
    keys: { finnhub: localKey },
    loadOptions: { clearTimeout, setTimeout },
    proxyRoute: ({ options }) => new Promise((resolve, reject) => {
      const rejectForAbort = () => {
        proxySignalAborted = true;
        reject(new Error(rawTimeoutError));
      };
      if (options.signal.aborted) rejectForAbort();
      else options.signal.addEventListener('abort', rejectForAbort, { once: true });
    }),
    directRoute: async ({ provider }) => {
      assert.equal(provider, 'finnhub');
      return response(200, directResult);
    }
  });

  const { result, rejection } = await invokeFinnhub(realm);
  assert.equal(proxySignalAborted, true, 'the production fetchT AbortController path must trigger the rejection');
  assert.equal(timers.filter(({ milliseconds }) => milliseconds === 12000).length, 2, 'proxy and direct fetches each create their normal timeout guard');
  assert.equal(timers.every(({ cleared }) => cleared), true, 'all deterministic timeout guards must be cleared after settlement');
  assert.deepEqual(requests.map(({ url }) => requestClass(url)), ['health', 'proxy-finnhub', 'direct-finnhub']);
  assert.equal(requests.filter(({ url }) => new URL(url).origin === 'https://finnhub.io').length, 1);
  assert.deepEqual(result, directResult);
  assert.equal(rejection, null);
  assert.equal(JSON.stringify({ result, rejection }).includes(rawTimeoutError), false, 'raw timeout errors must not surface');
});

test('Regression BUG-004: proxy JSON decode failure falls back once to same-provider local key', async () => {
  const localKey = 'bug004-finnhub-json-key';
  const rawDecodeError = 'raw proxy JSON decoder detail must stay private';
  const directResult = { provider: 'finnhub', recovered: true, decodedBy: 'direct-host' };
  const { realm, requests } = await createProxyRealm({
    keys: { finnhub: localKey },
    proxyRoute: async () => ({
      ok: true,
      status: 200,
      json: async () => { throw new Error(rawDecodeError); }
    }),
    directRoute: async ({ provider }) => {
      assert.equal(provider, 'finnhub');
      return response(200, directResult);
    }
  });

  const { result, rejection } = await invokeFinnhub(realm);
  assert.deepEqual(requests.map(({ url }) => requestClass(url)), ['health', 'proxy-finnhub', 'direct-finnhub']);
  assert.equal(requests.filter(({ url }) => new URL(url).origin === 'https://finnhub.io').length, 1);
  assert.deepEqual(result, directResult);
  assert.equal(rejection, null);
  assert.equal(JSON.stringify({ result, rejection }).includes(rawDecodeError), false, 'raw JSON decode errors must not surface');
});

test('Regression BUG-004: fallback never crosses provider or retries', async () => {
  const finnhubKey = 'bug004-finnhub-bound-key';
  const twelveDataKey = 'bug004-twelvedata-must-stay-unused';
  const rawDirectBody = 'raw direct provider response must stay private';
  const { realm, requests } = await createProxyRealm({
    keys: { finnhub: finnhubKey, twelvedata: twelveDataKey },
    proxyRoute: async () => response(503, { code: 'PROVIDER_KEY_MISSING', provider: 'finnhub' }),
    directRoute: async ({ provider }) => {
      assert.equal(provider, 'finnhub', 'fallback must never select another configured provider');
      return response(401, { detail: rawDirectBody });
    }
  });

  const { result, rejection } = await invokeFinnhub(realm);
  assert.equal(result, undefined);
  assert.equal(rejection && rejection.message, 'PROVIDER_REQUEST_FAILED:finnhub');
  assert.deepEqual(requests.map(({ url }) => requestClass(url)), ['health', 'proxy-finnhub', 'direct-finnhub']);
  assert.equal(requests.filter(({ url }) => requestClass(url) === 'direct-finnhub').length, 1, 'direct failure must be terminal with no retry');
  assert.equal(requests.some(({ url }) => requestClass(url) === 'direct-twelvedata'), false, 'another configured provider must remain unused');
  const directUrl = new URL(requests.find(({ url }) => requestClass(url) === 'direct-finnhub').url);
  assert.equal(directUrl.searchParams.get('token'), finnhubKey);
  assert.equal(directUrl.href.includes(twelveDataKey), false);
  assert.equal(requests.filter(({ url }) => new URL(url).origin === PROXY_BASE_URL).every(({ url }) => !url.includes(finnhubKey) && !url.includes(twelveDataKey)), true);
  assert.equal(rejection.message.includes(rawDirectBody), false, 'direct response details must be replaced by the sanitized provider error');
});

test('Regression BUG-004: no same-provider key fails closed without disclosure', async () => {
  const otherProviderKey = 'bug004-other-provider-secret';
  const proxyBodySentinel = 'bug004-proxy-response-private-detail';
  const diagnostics = [];
  const originalConsole = {};
  const methods = ['debug', 'error', 'info', 'log', 'warn'];
  for (const method of methods) {
    originalConsole[method] = console[method];
    console[method] = (...args) => diagnostics.push(args.map(String).join(' '));
  }

  let realm;
  let requests;
  let outcome;
  try {
    ({ realm, requests } = await createProxyRealm({
      keys: { twelvedata: otherProviderKey },
      proxyRoute: async () => response(503, {
        code: 'PROVIDER_KEY_MISSING',
        provider: 'finnhub',
        detail: proxyBodySentinel
      }),
      directRoute: async () => { throw new Error('no direct request is allowed without the same-provider key'); }
    }));
    outcome = await invokeFinnhub(realm);
  } finally {
    for (const method of methods) console[method] = originalConsole[method];
  }

  assert.equal(outcome.result, undefined);
  assert.equal(outcome.rejection && outcome.rejection.message, 'PROVIDER_KEY_MISSING:finnhub');
  assert.deepEqual(requests.map(({ url }) => requestClass(url)), ['health', 'proxy-finnhub']);
  assert.equal(requests.some(({ url }) => requestClass(url).startsWith('direct-')), false, 'no direct provider request is allowed');
  assert.equal(requests.every(({ url }) => !url.includes(otherProviderKey)), true, 'the other-provider key must not enter any request URL');

  const observableSurfaces = JSON.stringify({
    access: realm.api.providerAccess(),
    status: realm.api.providerStatus('finnhub'),
    dataState: realm.api.dataState(),
    toolReads: realm.api.toolRead(),
    error: outcome.rejection.message,
    diagnostics
  });
  assert.equal(observableSurfaces.includes(otherProviderKey), false, 'status, access, tool reads, errors, and logs must not disclose another provider key');
  assert.equal(observableSurfaces.includes(proxyBodySentinel), false, 'the proxy response body must not reach observable surfaces');
});

test('SCN-BUG004-003 force-local uses the shared direct provider path', async () => {
  const localKey = 'bug004-finnhub-force-local-key';
  const directResult = { provider: 'finnhub', tier: 'direct', forcedLocal: true };
  const { realm, requests } = await createProxyRealm({
    keys: { finnhub: localKey },
    proxyRoute: async () => { throw new Error('force-local must bypass the proxy provider route'); },
    directRoute: async ({ provider }) => {
      assert.equal(provider, 'finnhub');
      return response(200, directResult);
    }
  });

  assert.equal(realm.api.setForceLocal(true).ok, true);
  assert.equal(realm.api.providerStatus('finnhub').tier, 'local');
  const { result, rejection } = await invokeFinnhub(realm);
  assert.deepEqual(result, directResult);
  assert.equal(rejection, null);
  assert.deepEqual(requests.map(({ url }) => requestClass(url)), ['health', 'direct-finnhub']);
  assert.equal(requests.filter(({ url }) => requestClass(url) === 'direct-finnhub').length, 1);
  assert.equal(requests.some(({ url }) => requestClass(url) === 'proxy-finnhub'), false);
  assert.equal(new URL(requests[1].url).searchParams.get('token'), localKey);
});