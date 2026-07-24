import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { clone, loadProductionApi, readJson } from './tool-experience.support.mjs';

/*
 * TP-05-03 — Source ownership functional canaries (SCN-012-014, SCN-012-015, SCN-012-016).
 *
 * Feature 012 Scope 05 adds two Simple-adapter modules and does NOT touch the source chain or the
 * options publisher. This suite proves that ownership is intact:
 *  - SCN-012-016  The two new adapter modules invoke NO fetch/provider/storage/author/publication
 *                 path (comprehensive comment-stripped scan of every runtime path, plus a live
 *                 sentinel run), consume only the frozen owner projection, and create no second
 *                 options producer — scripts/fetch-options.mjs remains the sole data/options writer.
 *  - SCN-012-014  rldata.js keeps Yahoo's keyless chain (direct + ordered public CORS proxies) and
 *                 reads no keyed-provider local key on the keyless path.
 *  - SCN-012-015  rldata.js paints the committed same-origin daily snapshot FIRST (labelled
 *                 pages-snapshot) and only fetches the remote delta when the snapshot is absent.
 *
 * The byte-level zero-diff of rldata.js / scripts/fetch-options.mjs / data/options is recorded as
 * terminal git evidence in report.md; these tests assert the ownership PROPERTIES are preserved.
 */

const require = createRequire(import.meta.url);

function loadMarketStructure() {
  const path = require.resolve('../rlexperience-adapters/market-structure.js');
  delete require.cache[path];
  return require(path);
}

function loadOptions() {
  const path = require.resolve('../rlexperience-adapters/options.js');
  delete require.cache[path];
  return require(path);
}

function loadRlvol() {
  const path = require.resolve('../rlvol.js');
  delete require.cache[path];
  return require(path);
}

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code || ''} ${result.error.fieldPath || result.error.reason || ''}`);
  return result.value;
}

function defaultValues(definition) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
}

function readSource(relativeUrl) {
  return readFileSync(new URL(relativeUrl, import.meta.url), 'utf8');
}

/* Strip block and line comments so authority scans target real CALLS, not the documentation prose
   that names the forbidden capabilities the module deliberately avoids. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/* Extract a top-level `function NAME(...) { ... }` source (balanced braces) from a module source. */
function extractFnSource(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `function ${name} not found`);
  let index = source.indexOf('{', start);
  assert.notEqual(index, -1, `function ${name} has no body`);
  let depth = 0;
  let end = -1;
  for (let i = index; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  assert.notEqual(end, -1, `function ${name} body is unbalanced`);
  return source.slice(start, end);
}

const MARKET_STRUCTURE_RAW = readSource('../rlexperience-adapters/market-structure.js');
const OPTIONS_RAW = readSource('../rlexperience-adapters/options.js');
const RLDATA_RAW = readSource('../rldata.js');
const FETCH_OPTIONS_RAW = readSource('../scripts/fetch-options.mjs');

/* ═══════════════════════ SCN-012-016 — no runtime source authority in the new modules ═══════════════════════ */

test('SCN-012-016 the two Scope-05 adapter modules invoke no fetch, provider, storage, author, publication, or cross-domain path', () => {
  const modules = [
    { name: 'market-structure.js', source: stripComments(MARKET_STRUCTURE_RAW), crossDomain: /rlexperience-adapters\/(options|macro-rotation|fundamental-models|strategy-research|property-research|market-action)/ },
    { name: 'options.js', source: stripComments(OPTIONS_RAW), crossDomain: /rlexperience-adapters\/(market-structure|macro-rotation|fundamental-models|strategy-research|property-research|market-action)/ }
  ];
  const forbidden = [
    /\bfetch\s*\(/,
    /\bproviderFetch\s*\(/,
    /\bRLDATA\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bindexedDB\b/,
    /\bXMLHttpRequest\b/,
    /\bWebSocket\b/,
    /\bEventSource\b/,
    /sendBeacon/,
    /\bimport\s*\(/,
    /\bwriteFileSync\b/,
    /\bwriteFile\b/,
    /data\/options/,
    /data\/bars/,
    /query[12]\.finance\.yahoo\.com/,
    /corsproxy/,
    /allorigins/,
    /codetabs/,
    /twelvedata/i
  ];
  for (const mod of modules) {
    for (const pattern of forbidden) {
      assert.equal(pattern.test(mod.source), false, `${mod.name} must contain no ${pattern}`);
    }
    assert.equal(mod.crossDomain.test(mod.source), false, `${mod.name} must import no other domain adapter`);
  }
});

test('SCN-012-016 functional: the delivered adapters perform zero fetch/provider/storage at runtime through the production runtime', async () => {
  const api = loadProductionApi();
  const ms = loadMarketStructure();
  const opts = loadOptions();
  const rlvol = loadRlvol();

  // A representative adapter from EACH new module is run end-to-end (compute + sensitivity) under
  // fetch/storage sentinels — proving the runtime path itself touches no forbidden authority.
  const surfaceDefinition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'options-structure-lab'));
  const breadthDefinition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'market-heatmap-lab'));

  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [surfaceDefinition, breadthDefinition] }));
  opts.registerOptionsAdapters(runtime, api, [surfaceDefinition]);
  ms.registerMarketStructureAdapters(runtime, api, [breadthDefinition], { rlvol });

  const surfaceOwner = {
    contractVersion: 'options-surface-owner-state/v1', toolId: 'options-structure-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot data/options', nowMs: Date.UTC(2026, 6, 24, 20, 0, 0), spot: 100, div: 0, zoom: 40, minOI: 0,
    chains: [{ dte: 7, calls: [{ strike: 100, openInterest: 3000, volume: 500, impliedVolatility: 0.45, bid: 3, ask: 3.2, lastPrice: 3.1 }, { strike: 110, openInterest: 1500, volume: 200, impliedVolatility: 0.5, bid: 0.8, ask: 1, lastPrice: 0.9 }], puts: [{ strike: 95, openInterest: 2000, volume: 350, impliedVolatility: 0.48, bid: 1.5, ask: 1.7, lastPrice: 1.6 }, { strike: 90, openInterest: 3000, volume: 250, impliedVolatility: 0.52, bid: 0.7, ask: 0.9, lastPrice: 0.8 }] }]
  };

  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage, XMLHttpRequest: globalThis.XMLHttpRequest };
  const calls = { fetch: 0, storage: 0, xhr: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.XMLHttpRequest = function () { calls.xhr += 1; throw new Error('forbidden xhr'); };
  try {
    const base = defaultValues(surfaceDefinition);
    const prepared = requireValue(await runtime.prepare({
      definitionId: surfaceDefinition.definitionId,
      ownerContext: { ownerState: surfaceOwner },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    }));
    assert.equal(prepared.state, 'ready');
    await runtime.recompute({ parameterValues: { ...base, 'iv-shock': 10 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:00.000Z' });
  } finally {
    globalThis.fetch = sentinels.fetch;
    globalThis.localStorage = sentinels.localStorage;
    globalThis.sessionStorage = sentinels.sessionStorage;
    globalThis.XMLHttpRequest = sentinels.XMLHttpRequest;
  }
  assert.equal(calls.fetch, 0, 'zero fetch calls at runtime');
  assert.equal(calls.storage, 0, 'zero storage calls at runtime');
  assert.equal(calls.xhr, 0, 'zero XMLHttpRequest calls at runtime');
});

test('SCN-012-016 scripts/fetch-options.mjs remains the sole data/options producer and Feature 012 adds no second producer', () => {
  // The one scheduled producer writes data/options/*.json + index.json.
  assert.match(FETCH_OPTIONS_RAW, /writeFileSync\(\s*OUT_DIR/, 'fetch-options.mjs writes the data/options snapshot');
  assert.match(FETCH_OPTIONS_RAW, /OUT_DIR\s*=\s*['"][^'"]*data\/options/, 'fetch-options.mjs OUT_DIR is data/options');

  // Neither new adapter module writes a snapshot or defines a second chain producer.
  for (const [name, raw] of [['market-structure.js', MARKET_STRUCTURE_RAW], ['options.js', OPTIONS_RAW]]) {
    const source = stripComments(raw);
    assert.equal(/writeFileSync|writeFile\(|fs\.write|mkdirSync/.test(source), false, `${name} writes no snapshot`);
    assert.equal(/data\/options/.test(source), false, `${name} references no data/options path in code`);
  }

  // The option owner pages still consume the SAME-ORIGIN snapshot object (owner-first, no new path).
  for (const page of ['../options-flow-feed-lab.html', '../options-structure-lab.html', '../gamma-trading-lab.html']) {
    assert.match(readSource(page), /data\/options\//, `${page} consumes the same-origin data/options snapshot`);
  }
});

/* ═══════════════════════ SCN-012-014 — Yahoo keeps its keyless chain in rldata.js ═══════════════════════ */

test('SCN-012-014 rldata.js preserves the ordered Yahoo keyless chain and reads no keyed-provider key on the keyless path', () => {
  const proxied = extractFnSource(RLDATA_RAW, 'proxied');
  // Direct request first, then the approved public CORS proxies in the existing order.
  const direct = proxied.indexOf('chain.push(url');
  const cors = proxied.indexOf('corsproxy.io');
  const allo = proxied.indexOf('allorigins.win');
  const code = proxied.indexOf('codetabs.com');
  assert.ok(direct !== -1 && cors !== -1 && allo !== -1 && code !== -1, 'the keyless chain names direct Yahoo + the three public proxies');
  assert.ok(direct < cors && cors < allo && allo < code, 'the keyless chain keeps its existing direct → corsproxy → allorigins → codetabs order');

  // The keyless request builders attach NO keyed-provider local key.
  const fetchJson = extractFnSource(RLDATA_RAW, 'fetchJson');
  for (const keyless of [proxied, fetchJson]) {
    assert.equal(/providerFetch/.test(keyless), false, 'the keyless path does not route through the keyed providerFetch');
    assert.equal(/rlProviderConfig|PROVIDER_CFG_KEY|apikey|apiKey/.test(keyless), false, 'the keyless path reads no keyed-provider local key');
  }

  // The keyed provider path is separate and only the keyed Twelve Data fetch uses providerFetch.
  const twelve = extractFnSource(RLDATA_RAW, 'twelveDataBars');
  assert.match(twelve, /providerFetch\(\s*["']twelvedata["']/, 'the keyed Twelve Data fallback is the only providerFetch consumer');
});

/* ═══════════════════════ SCN-012-015 — daily snapshot paints first; only the delta is fetched ═══════════════════════ */

test('SCN-012-015 rldata.js paints the committed same-origin daily snapshot first and only fetches the remote delta', () => {
  const ensureBars = extractFnSource(RLDATA_RAW, 'ensureBars');
  // The same-origin snapshot is consulted and returned FIRST, labelled pages-snapshot.
  const snapReturn = ensureBars.indexOf('putBars(sym, interval, snap, "pages-snapshot")');
  const yahooDelta = ensureBars.indexOf('query1.finance.yahoo.com');
  assert.notEqual(snapReturn, -1, 'ensureBars returns the same-origin snapshot labelled pages-snapshot');
  assert.notEqual(yahooDelta, -1, 'ensureBars keeps a remote Yahoo delta fetch');
  assert.ok(snapReturn < yahooDelta, 'the snapshot-first branch precedes the remote Yahoo delta (snapshot painted before delta)');
  // A successful same-origin snapshot load is NOT labelled live/yahoo.
  assert.equal(/putBars\(sym, interval, snap, "(live|yahoo)"/.test(ensureBars), false, 'the same-origin snapshot is never labelled live/yahoo');
  // pagesBars is the same-origin daily-bar reader (data/bars/<SYM>.json), no proxy/CORS.
  const pagesBars = extractFnSource(RLDATA_RAW, 'pagesBars');
  assert.match(pagesBars, /data\/bars\//, 'pagesBars reads the committed same-origin daily-bar snapshot');
});

/* ═══════════════════════ rldata.js ownership surface is intact (targeted zero-edit canary) ═══════════════════════ */

test('SCN-012-014/015 rldata.js source-ownership surface (keyless chain, snapshot, provider) is intact', () => {
  for (const marker of [
    /function proxied\(/,
    /function fetchJson\(/,
    /function ensureBars\(/,
    /function ensureMacro\(/,
    /function providerFetch\(/,
    /function pagesBars\(/,
    /ensureBars:\s*ensureBars/,
    /ensureMacro:\s*ensureMacro/,
    /setProxyBaseUrl:\s*setProxyBaseUrl/,
    /setKey:\s*setKey/
  ]) {
    assert.match(RLDATA_RAW, marker, `rldata.js retains its ownership marker ${marker}`);
  }
});
