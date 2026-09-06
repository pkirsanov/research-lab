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

test('SCN-012-014 rldata.js preserves the approved Yahoo keyless chain and reads no keyed-provider key on the keyless path', () => {
  const proxied = extractFnSource(RLDATA_RAW, 'proxied');
  // The approved keyless order: the Tier-1 tailnet proxy first WHEN ACTIVE, then the fixed
  // provider origin directly. Open URL-forwarding relays were removed deliberately, because an
  // origin that forwards an arbitrary ?url= turns the connect-src allowlist into an exfiltration
  // path. This assertion previously pinned that relay chain by name, which meant the test could
  // only go green while the exfiltration path existed -- it defended the defect. Pin the reachable
  // hops and the ordering instead, so the property survives a transport change but a reintroduced
  // relay still fails.
  const tierOne = proxied.indexOf('proxyBaseUrl()');
  const direct = proxied.indexOf('chain.push(url');
  assert.ok(tierOne !== -1, 'the keyless chain offers the Tier-1 tailnet proxy hop');
  assert.ok(direct !== -1, 'the keyless chain reaches the fixed provider origin directly');
  assert.ok(tierOne < direct, 'the keyless chain keeps the Tier-1 proxy ahead of the direct origin');
  assert.match(proxied, /proxyActive\(\)/, 'the Tier-1 hop is conditional on the proxy being active, so the direct origin is the keyless default');

  // No open URL-forwarding relay may return to the keyless chain.
  const relayHosts = ['corsproxy.io', 'allorigins.win', 'codetabs.com'];
  const namesRelay = (source) => relayHosts.some((host) => source.includes(host));
  assert.equal(namesRelay(proxied), false, 'the keyless chain names no open URL-forwarding relay');

  /* ADVERSARIAL: prove the relay detector fails on the exact chain this test used to demand. */
  const reintroduced = 'chain.push(url, "https://corsproxy.io/?url=" + encodeURIComponent(url));';
  assert.equal(namesRelay(reintroduced), true, 'the relay detector catches a reintroduced open forwarding relay');

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
  // pagesBars preserves the public rows-only contract by delegating to the same-origin snapshot
  // owner. The delegated helper owns data/bars/<SYM>.json and must not acquire through a proxy.
  const pagesBars = extractFnSource(RLDATA_RAW, 'pagesBars');
  const pagesBarSnapshot = extractFnSource(RLDATA_RAW, 'pagesBarSnapshot');
  assert.match(pagesBars, /pagesBarSnapshot\(\s*sym\s*\)/, 'pagesBars delegates to the same-origin snapshot owner');
  assert.equal(/\bfetchT\s*\(|\bfetch\s*\(/.test(pagesBars), false, 'pagesBars does not bypass the delegated snapshot owner');
  assert.match(pagesBarSnapshot, /fetchT\(\s*["']data\/bars\//, 'pagesBarSnapshot reads the committed same-origin daily-bar snapshot');
  assert.equal(
    /\b(?:proxied|providerFetch|proxyBaseUrl)\s*\(|corsproxy|allorigins|codetabs|query[12]\.finance\.yahoo\.com/.test(pagesBarSnapshot),
    false,
    'pagesBarSnapshot reads data/bars directly without a proxy or provider path'
  );
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

/* ═══════════════════════ TP-06-03 — Scope 06 macro/fundamental source qualification (SCN-012-035) ═══════════════════════
 *
 * Feature 012 Scope 06 adds the macro-rotation (+ fundamental-models) Simple-adapter modules and
 * does NOT touch the source chain or acquire any evidence. This suite proves ownership is intact for
 * the delivered Scope-06 modules: no fetch/provider/storage/author/publication/cross-domain path
 * (comment-stripped scan + a live sentinel run), the adapter consumes only the frozen owner
 * projection, preserves the owner evidence clock, and never substitutes a default for missing
 * evidence (a sector with no relative-strength series stays unavailable, not a fabricated value).
 */

function loadMacroRotation() {
  const path = require.resolve('../rlexperience-adapters/macro-rotation.js');
  delete require.cache[path];
  return require(path);
}

function loadFundamentalModels() {
  const path = require.resolve('../rlexperience-adapters/fundamental-models.js');
  delete require.cache[path];
  return require(path);
}

const MACRO_ROTATION_RAW = readSource('../rlexperience-adapters/macro-rotation.js');
const FUNDAMENTAL_MODELS_RAW = readSource('../rlexperience-adapters/fundamental-models.js');

function sectorRsSeries(slope, wobble, tilt) {
  const out = [];
  for (let i = 0; i < 200; i += 1) {
    const trend = 1 + slope * (i / 200);
    const wob = wobble * Math.sin(i / 9);
    out.push(Math.round((trend + wob + tilt) * 1e6) / 1e6);
  }
  return out;
}

test('SCN-012-035 macro and fundamental source qualification: the macro-rotation module invokes no fetch, provider, storage, author, publication, or cross-domain path', () => {
  const source = stripComments(MACRO_ROTATION_RAW);
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
    /\bmkdirSync\b/,
    /data\/options/,
    /data\/bars/,
    /query[12]\.finance\.yahoo\.com/,
    /corsproxy/,
    /allorigins/,
    /codetabs/,
    /twelvedata/i
  ];
  for (const pattern of forbidden) {
    assert.equal(pattern.test(source), false, `macro-rotation.js must contain no ${pattern}`);
  }
  const crossDomain = /rlexperience-adapters\/(market-structure|options|fundamental-models|strategy-research|property-research|market-action)/;
  assert.equal(crossDomain.test(source), false, 'macro-rotation.js must import no other domain adapter');
});

test('SCN-012-035 macro and fundamental source qualification: the fundamental-models module invokes no fetch, provider, storage, author, publication, or cross-domain path', () => {
  const source = stripComments(FUNDAMENTAL_MODELS_RAW);
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
    /\bmkdirSync\b/,
    /data\/options/,
    /data\/bars/,
    /query[12]\.finance\.yahoo\.com/,
    /corsproxy/,
    /allorigins/,
    /codetabs/,
    /twelvedata/i
  ];
  for (const pattern of forbidden) {
    assert.equal(pattern.test(source), false, `fundamental-models.js must contain no ${pattern}`);
  }
  const crossDomain = /rlexperience-adapters\/(market-structure|options|macro-rotation|strategy-research|property-research|market-action)/;
  assert.equal(crossDomain.test(source), false, 'fundamental-models.js must import no other domain adapter');
});

test('SCN-012-035 macro and fundamental source qualification: the delivered sector-rotation adapter performs zero fetch/provider/storage at runtime', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const sectorDefinition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'sector-research-lab'));
  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [sectorDefinition] }));
  mr.registerMacroRotationAdapters(runtime, api, [sectorDefinition]);

  const owner = {
    contractVersion: 'sector-rotation-owner-state/v1', toolId: 'sector-research-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot cache', benchmarks: ['SPY', 'RSP'],
    sectors: [
      { id: 'XLK', label: 'Technology', rs: { SPY: sectorRsSeries(0.42, 0.05, 0), RSP: sectorRsSeries(0.30, 0.06, 0.04) }, x3: 0.08, breadthPct50: 0.7, riskScore: 1, etf: { ticker: 'XLK', fit: 0.82, mom: 0.61 } },
      { id: 'XLE', label: 'Energy', rs: { SPY: sectorRsSeries(-0.28, 0.07, 0), RSP: sectorRsSeries(-0.20, 0.05, 0.05) }, x3: -0.05, breadthPct50: 0.3, riskScore: 4, etf: { ticker: 'XLE', fit: 0.44, mom: 0.58 } }
    ]
  };

  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage, XMLHttpRequest: globalThis.XMLHttpRequest };
  const calls = { fetch: 0, storage: 0, xhr: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.XMLHttpRequest = function () { calls.xhr += 1; throw new Error('forbidden xhr'); };
  try {
    const base = defaultValues(sectorDefinition);
    const prepared = requireValue(await runtime.prepare({
      definitionId: sectorDefinition.definitionId,
      ownerContext: { ownerState: owner },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    }));
    assert.equal(prepared.state, 'ready');
    // The owner evidence clock is preserved verbatim — the adapter acquires nothing.
    assert.equal(prepared.current.input.evidenceCutoff, owner.asOf, 'evidence cutoff is the frozen owner asOf (no re-clocking)');
    await runtime.recompute({ parameterValues: { ...base, benchmark: 'RSP' }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:00.000Z' });
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

test('SCN-012-035 macro and fundamental source qualification: a sector with no relative-strength series stays unavailable — no default is substituted', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const sectorDefinition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'sector-research-lab'));
  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [sectorDefinition] }));
  mr.registerMacroRotationAdapters(runtime, api, [sectorDefinition]);

  // XLK carries a full series; XLU carries an EMPTY series (no owner evidence). The adapter must
  // keep XLU unavailable (rsRatio null, priced false) and exclude it from the priced leaders —
  // never invent a relative-strength value for it.
  const owner = {
    contractVersion: 'sector-rotation-owner-state/v1', toolId: 'sector-research-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot cache', benchmarks: ['SPY', 'RSP'],
    sectors: [
      { id: 'XLK', label: 'Technology', rs: { SPY: sectorRsSeries(0.42, 0.05, 0), RSP: sectorRsSeries(0.30, 0.06, 0.04) }, x3: 0.08, breadthPct50: 0.7, riskScore: 1, etf: { ticker: 'XLK', fit: 0.82, mom: 0.61 } },
      { id: 'XLU', label: 'Utilities', rs: { SPY: [], RSP: [] }, x3: null, breadthPct50: null, riskScore: null, etf: null }
    ]
  };
  const base = defaultValues(sectorDefinition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: sectorDefinition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  const summary = prepared.current.output.values.summary;
  const utilities = summary.transition.sectors.find((entry) => entry.id === 'XLU');
  assert.equal(utilities.rsRatio, null, 'the empty-evidence sector has no fabricated relative-strength value');
  assert.equal(utilities.quad, null, 'the empty-evidence sector has no fabricated quadrant');
  assert.equal(summary.relativeStrength.leaders.some((leader) => leader.id === 'XLU'), false, 'the empty-evidence sector is excluded from the priced leaders (no default substitution)');
  assert.equal(summary.pricedCount, 1, 'only the one priced sector counts toward coverage');
  // Partial coverage surfaces model-estimate provenance rather than silently claiming all-observed.
  assert.deepEqual(prepared.current.output.provenance.classes, ['observed-fact', 'model-estimate'], 'partial owner coverage is declared, not hidden');
});

/* countryRows: a synthetic daily-bar series for the country-rotation owner fixture (distinct shape
   per seed so the single-sourced pairwise correlation differs across countries). */
function countryRows(seed, drift, wobble) {
  const rows = [];
  const base = Date.UTC(2026, 3, 1);
  let close = 100;
  for (let i = 0; i < 90; i += 1) {
    close = close * (1 + drift + wobble * Math.sin((i + seed) / 5));
    rows.push({ t: base + i * 864e5, c: Math.round(close * 1e4) / 1e4 });
  }
  return rows;
}

test('SCN-012-035 macro and fundamental source qualification: the delivered country-rotation adapter performs zero fetch/provider/storage and preserves the frozen local-close clock', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'global-rotation-lab'));
  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }));
  mr.registerMacroRotationAdapters(runtime, api, [definition]);

  const owner = {
    contractVersion: 'country-rotation-owner-state/v1', toolId: 'global-rotation-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot cache', benchmark: 'ACWI',
    countries: [
      { id: 'EWY', label: 'South Korea', rel21: 6, rel63: 3, rel126: 1, fxScore: 0.5, vol: 0.25, localCloseAgeHours: 2, rows: countryRows(0, 0.004, 0.010) },
      { id: 'EWG', label: 'Germany', rel21: -2, rel63: 4, rel126: 8, fxScore: -0.3, vol: 0.35, localCloseAgeHours: 12, rows: countryRows(7, -0.002, 0.014) }
    ]
  };

  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage, XMLHttpRequest: globalThis.XMLHttpRequest };
  const calls = { fetch: 0, storage: 0, xhr: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.XMLHttpRequest = function () { calls.xhr += 1; throw new Error('forbidden xhr'); };
  try {
    const base = defaultValues(definition);
    const prepared = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: owner },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    }));
    assert.equal(prepared.state, 'ready');
    // The owner evidence clock is preserved verbatim — the adapter acquires nothing and re-clocks nothing.
    assert.equal(prepared.current.input.evidenceCutoff, owner.asOf, 'evidence cutoff is the frozen owner asOf (no re-clocking)');
    // The frozen local-close facts drive freshness; the adapter never fetches a fresher close.
    const fresh = prepared.current.output.values.summary.freshness;
    assert.equal(fresh.countries.find((c) => c.id === 'EWY').state, 'fresh', 'a 2h-old local close is fresh under the 24h default');
    assert.equal(fresh.countries.find((c) => c.id === 'EWG').ageHours, 12, 'the frozen local-close age is preserved verbatim');
    await runtime.recompute({ parameterValues: { ...base, 'local-close-max-age': 6 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:00.000Z' });
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

test('SCN-012-035 macro and fundamental source qualification: a country with no relative-momentum stays unavailable — no default is substituted', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'global-rotation-lab'));
  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }));
  mr.registerMacroRotationAdapters(runtime, api, [definition]);

  // EWY carries full relative-momentum; EWG carries NO finite relative (all null). The adapter must
  // keep EWG unavailable (momentum null, priced false) and exclude it from the priced queue — never
  // invent a momentum for it. Its frozen local close still surfaces honestly in freshness.
  const owner = {
    contractVersion: 'country-rotation-owner-state/v1', toolId: 'global-rotation-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot cache', benchmark: 'ACWI',
    countries: [
      { id: 'EWY', label: 'South Korea', rel21: 6, rel63: 3, rel126: 1, fxScore: 0.5, vol: 0.25, localCloseAgeHours: 2, rows: countryRows(0, 0.004, 0.010) },
      { id: 'EWG', label: 'Germany', rel21: null, rel63: null, rel126: null, fxScore: null, vol: null, localCloseAgeHours: 40, rows: [] }
    ]
  };
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.queue.some((entry) => entry.id === 'EWG'), false, 'the no-momentum country is excluded from the priced queue (no default substitution)');
  assert.equal(summary.pricedCount, 1, 'only the one priced country counts toward coverage');
  const ewgFresh = summary.freshness.countries.find((c) => c.id === 'EWG');
  assert.equal(ewgFresh.state, 'stale', 'the unavailable country still reports its honest frozen local-close staleness (40h > 24h default)');
  assert.deepEqual(prepared.current.output.provenance.classes, ['observed-fact', 'model-estimate'], 'partial owner coverage is declared, not hidden');
});

test('SCN-012-035 macro and fundamental source qualification: the delivered real-asset-driver adapter performs zero fetch/provider/storage and preserves the frozen owner clock', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'real-assets-lab'));
  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }));
  mr.registerMacroRotationAdapters(runtime, api, [definition]);

  const owner = {
    contractVersion: 'real-asset-driver-owner-state/v1', toolId: 'real-assets-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot cache', benchmark: 'DBC', selected: 'GLD',
    drivers: { uup63: -3, tlt63: 5, tip63: 7, qqq63: 8, xle63: 4, xli63: 3, dbc63: 2, gld63: 6, btc63: 12, goldSilverRatio63: -4 },
    breadthReturns: [8, -3, 5, -1, 6, -2],
    assets: [
      { id: 'GLD', label: 'Gold', model: 'gold', trendScore: 70, volatility: 16, drawdown: 8, ownerScore: 68, riskPenalty: 3 },
      { id: 'DBC', label: 'Broad commodities', model: 'broad', trendScore: 54, volatility: 22, drawdown: 12, ownerScore: 50, riskPenalty: 5 }
    ]
  };

  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage, XMLHttpRequest: globalThis.XMLHttpRequest };
  const calls = { fetch: 0, storage: 0, xhr: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.XMLHttpRequest = function () { calls.xhr += 1; throw new Error('forbidden xhr'); };
  try {
    const base = defaultValues(definition);
    const prepared = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: owner },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    }));
    assert.equal(prepared.state, 'ready');
    // The owner evidence clock is preserved verbatim — the adapter acquires nothing and re-clocks nothing.
    assert.equal(prepared.current.input.evidenceCutoff, owner.asOf, 'evidence cutoff is the frozen owner asOf (no re-clocking)');
    // The frozen drawdown drives the risk state; the adapter never fetches a fresher owner score.
    const summary = prepared.current.output.values.summary;
    assert.equal(summary.riskState.drawdown, 8, 'the frozen selected-asset drawdown is preserved verbatim');
    await runtime.recompute({ parameterValues: { ...base, 'usd-shock': 6 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:00.000Z' });
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

test('SCN-012-035 macro and fundamental source qualification: a real asset with no owner score and absent breadth stay unavailable — no default is substituted', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'real-assets-lab'));
  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }));
  mr.registerMacroRotationAdapters(runtime, api, [definition]);

  // GLD carries a full owner score; ZZZ carries NO owner score (null). The commodity-breadth returns
  // are ABSENT (empty). The adapter must keep ZZZ out of priced coverage and keep breadth unavailable
  // — never invent an owner score for ZZZ nor a breadth percentage from no returns.
  const owner = {
    contractVersion: 'real-asset-driver-owner-state/v1', toolId: 'real-assets-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot cache', benchmark: 'DBC', selected: 'GLD',
    drivers: { uup63: -3, tlt63: 5, qqq63: 8 },
    breadthReturns: [],
    assets: [
      { id: 'GLD', label: 'Gold', model: 'gold', trendScore: 70, volatility: 16, drawdown: 8, ownerScore: 68, riskPenalty: 3 },
      { id: 'ZZZ', label: 'Illiquid', model: 'broad', trendScore: null, volatility: null, drawdown: null, ownerScore: null, riskPenalty: null }
    ]
  };
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.pricedCount, 1, 'only the one priced asset counts toward coverage');
  assert.equal(summary.confirmation.breadth, null, 'absent breadth returns produce no fabricated breadth percentage');
  assert.equal(summary.confirmation.state, 'unavailable', 'the breadth confirmation stays unavailable, not a default confirmed/unconfirmed');
  assert.deepEqual(prepared.current.output.provenance.classes, ['observed-fact', 'model-estimate'], 'partial owner coverage is declared, not hidden');
});

test('SCN-012-035 macro and fundamental source qualification: the delivered fixed-income-sleeve adapter performs zero fetch/provider/storage and preserves the frozen owner clock', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'bond-regime-lab'));
  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }));
  mr.registerMacroRotationAdapters(runtime, api, [definition]);

  const owner = {
    contractVersion: 'fixed-income-sleeve-owner-state/v1', toolId: 'bond-regime-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot cache', regime: { realYieldChangeBp: 14, breakevenChangeBp: -9, creditConfirmation: 0.55 },
    sleeves: [
      { id: 'long-treasury', label: 'Long Treasury', rateDuration: 17, spreadDuration: 0, convexity: 3.2, rateShockKind: 'nominal', spreadShockKind: 'none', carry: 4.2 },
      { id: 'investment-grade-corporate', label: 'IG Corporate', rateDuration: 7, spreadDuration: 6.5, convexity: 0.8, rateShockKind: 'nominal', spreadShockKind: 'ig', carry: 5.4 }
    ]
  };

  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage, XMLHttpRequest: globalThis.XMLHttpRequest };
  const calls = { fetch: 0, storage: 0, xhr: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.XMLHttpRequest = function () { calls.xhr += 1; throw new Error('forbidden xhr'); };
  try {
    const base = { ...defaultValues(definition), 'rate-shock': 40, 'spread-shock': 20 };
    const prepared = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: owner },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    }));
    assert.equal(prepared.state, 'ready');
    // The owner evidence clock is preserved verbatim — the adapter acquires nothing and re-clocks nothing.
    assert.equal(prepared.current.input.evidenceCutoff, owner.asOf, 'evidence cutoff is the frozen owner asOf (no re-clocking)');
    // The frozen credit-regime confirmation drives the regime read; the adapter never fetches a fresher fact.
    const summary = prepared.current.output.values.summary;
    assert.equal(summary.regime.creditConfirmation, 0.55, 'the frozen credit confirmation is preserved verbatim');
    await runtime.recompute({ parameterValues: { ...base, 'rate-shock': 120 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:00.000Z' });
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

test('SCN-012-035 macro and fundamental source qualification: a sleeve with no owner characteristics and an absent regime stay unavailable — no default is substituted', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'bond-regime-lab'));
  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }));
  mr.registerMacroRotationAdapters(runtime, api, [definition]);

  // long-treasury carries full owner characteristics; ZZZ carries NO rate duration or convexity. The
  // regime facts are ABSENT. The adapter must keep ZZZ out of the priced coverage and keep the regime
  // unavailable — never invent a total for ZZZ nor a regime confirmation from no facts.
  const owner = {
    contractVersion: 'fixed-income-sleeve-owner-state/v1', toolId: 'bond-regime-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot cache', regime: { realYieldChangeBp: null, breakevenChangeBp: null, creditConfirmation: null },
    sleeves: [
      { id: 'long-treasury', label: 'Long Treasury', rateDuration: 17, spreadDuration: 0, convexity: 3.2, rateShockKind: 'nominal', spreadShockKind: 'none', carry: 4.2 },
      { id: 'ZZZ', label: 'Illiquid', rateDuration: null, spreadDuration: null, convexity: null, rateShockKind: 'nominal', spreadShockKind: 'none', carry: null }
    ]
  };
  const base = { ...defaultValues(definition), 'rate-shock': 40 };
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.pricedCount, 1, 'only the one priced sleeve counts toward coverage');
  const illiquid = summary.outcomes.find((entry) => entry.id === 'ZZZ');
  assert.equal(illiquid.total, null, 'the characteristic-less sleeve produces no fabricated total');
  assert.equal(summary.regime.state, 'unavailable', 'the regime stays unavailable, not a default confirmed/unconfirmed');
  assert.equal(summary.regime.confirmationScore, null, 'an absent credit confirmation produces no fabricated score');
  assert.deepEqual(prepared.current.output.provenance.classes, ['observed-fact', 'model-estimate'], 'partial owner coverage is declared, not hidden');
});

test('SCN-012-035 macro and fundamental source qualification: the delivered etf-ranking adapter performs zero fetch/provider/storage and preserves the frozen owner clock', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'etf-momentum-lab'));
  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }));
  mr.registerMacroRotationAdapters(runtime, api, [definition]);

  const owner = {
    contractVersion: 'etf-ranking-owner-state/v1', toolId: 'etf-momentum-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot cache',
    benchmarks: { SPY: { cagr: 0.10, trailing: { '1M': 0.01, '3M': 0.03, '6M': 0.06, '1Y': 0.10 } }, QQQ: { cagr: 0.14, trailing: { '1M': 0.02, '3M': 0.05, '6M': 0.09, '1Y': 0.15 } } },
    funds: [
      { ticker: 'MTUM', name: 'iShares MSCI USA Momentum', trailing: { '1M': 0.02, '3M': 0.06, '6M': 0.14, '1Y': 0.22 }, annVol: 0.18, maxDD: -0.12, sharpe: 1.1, cagr: 0.20, aum: 28456 },
      { ticker: 'VFMO', name: 'Vanguard U.S. Momentum', trailing: { '1M': -0.01, '3M': 0.02, '6M': 0.05, '1Y': 0.16 }, annVol: 0.14, maxDD: -0.08, sharpe: 1.3, cagr: 0.15, aum: 1935 }
    ]
  };

  const sentinels = { fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage, XMLHttpRequest: globalThis.XMLHttpRequest };
  const calls = { fetch: 0, storage: 0, xhr: 0 };
  globalThis.fetch = () => { calls.fetch += 1; throw new Error('forbidden fetch'); };
  globalThis.localStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.sessionStorage = { getItem() { calls.storage += 1; }, setItem() { calls.storage += 1; } };
  globalThis.XMLHttpRequest = function () { calls.xhr += 1; throw new Error('forbidden xhr'); };
  try {
    const base = defaultValues(definition);
    const prepared = requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: owner },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-25T20:02:00.000Z'
    }));
    assert.equal(prepared.state, 'ready');
    // The owner evidence clock is preserved verbatim — the adapter acquires nothing and re-clocks nothing.
    assert.equal(prepared.current.input.evidenceCutoff, owner.asOf, 'evidence cutoff is the frozen owner asOf (no re-clocking)');
    // The frozen owner momentum drives the ranking; the adapter never fetches a fresher fact.
    const summary = prepared.current.output.values.summary;
    const mtum = summary.ranking.find((row) => row.ticker === 'MTUM');
    assert.equal(mtum.momentum, 0.14, 'the frozen 6M momentum is preserved verbatim (no re-fetch)');
    await runtime.recompute({ parameterValues: { ...base, benchmark: 'QQQ' }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-25T20:03:00.000Z' });
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

test('SCN-012-035 macro and fundamental source qualification: an ETF with no owner metrics and an absent benchmark stay unavailable — no default is substituted', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = clone(readJson('simple-models.json').definitions.find((d) => d.toolId === 'etf-momentum-lab'));
  const config = readJson('tool-experience.config.json');
  const runtime = requireValue(api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }));
  mr.registerMacroRotationAdapters(runtime, api, [definition]);

  // MTUM carries a full owner trailing ladder; ZZZ carries NO trailing return at any horizon and no CAGR.
  // The default SPY benchmark is ABSENT from the frozen state. The adapter must keep ZZZ out of the priced
  // ranking, produce no fabricated excess for it, and keep the benchmark CAGR unavailable — never a default.
  const owner = {
    contractVersion: 'etf-ranking-owner-state/v1', toolId: 'etf-momentum-lab', asOf: '2026-07-24T20:00:00.000Z',
    source: 'pages-snapshot cache',
    benchmarks: { QQQ: { cagr: 0.14, trailing: { '6M': 0.09 } } },
    funds: [
      { ticker: 'MTUM', name: 'iShares MSCI USA Momentum', trailing: { '1M': 0.02, '3M': 0.06, '6M': 0.14, '1Y': 0.22 }, annVol: 0.18, maxDD: -0.12, sharpe: 1.1, cagr: 0.20, aum: 28456 },
      { ticker: 'ZZZ', name: 'Illiquid', trailing: {}, annVol: null, maxDD: null, sharpe: null, cagr: null, aum: null }
    ]
  };
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-25T20:02:00.000Z'
  }));
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.fundCount, 2, 'both funds are carried in the coverage count');
  assert.equal(summary.pricedCount, 1, 'only the one priced fund counts toward the ranking');
  assert.equal(summary.ranking.length, 1, 'the metric-less fund is excluded from the priced ranking');
  assert.equal(summary.ranking.find((row) => row.ticker === 'ZZZ'), undefined, 'no fabricated ranking row for the metric-less fund');
  assert.equal(summary.relativePerformance.benchmarkCagr, null, 'an absent benchmark produces no fabricated CAGR');
  const zzzExcess = summary.relativePerformance.funds.find((row) => row.ticker === 'ZZZ');
  assert.equal(zzzExcess.excess, null, 'the metric-less fund produces no fabricated excess');
  assert.deepEqual(prepared.current.output.provenance.classes, ['observed-fact', 'model-estimate'], 'partial owner coverage is declared, not hidden');
});
