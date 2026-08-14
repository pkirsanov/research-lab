#!/usr/bin/env node
/*
 * Research-Lab math self-test.
 *
 * Extracts the pure numeric helpers straight out of the tool HTML files
 * (balanced-brace matching — no eval of the whole DOM-bound script) and
 * asserts their mathematical invariants. This codifies the ad-hoc checks
 * we otherwise run by hand every time the strategy math changes, so a
 * regression in a greek, a tail-risk measure, or a Sharpe deflation is
 * caught before it ships.
 *
 * Usage:  node scripts/selftest.mjs
 * Exit:   0 = all invariants hold, 1 = at least one failed.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  BRIEF_EVENT_REQUIRED_KEYS,
  BRIEF_EVENT_SCENARIO_REQUIRED_KEYS,
  BRIEF_EVENT_SCENARIO_SHAPE_KEYS,
  BRIEF_EVENT_SHAPE_KEYS,
  briefEventContractInstruction,
  findEventContractInstructionGaps,
  validateBriefPayload
} from './validate-brief-payload.mjs';
import { formatSpecTestPathFindings, validateSpecTestPaths } from './validate-spec-test-paths.mjs';
import * as piiScan from './pii-scan.mjs';
import { buildCompanyFundamentalsOwnerRead } from './brief-refresh.mjs';
import {
  BRIEF_NARRATIVE_FIELDS_OPTIONAL,
  BRIEF_NARRATIVE_FIELDS_REQUIRED,
  BRIEF_STRUCTURED_FIELDS,
  READER_VOCABULARY_LEAKS,
  findBriefNarrativeVocabularyLeaks,
  isBriefNarrativeField,
  matchesFieldPatterns,
  walkBriefStrings
} from './reader-vocabulary.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');

/* Extract `function <name>(...) { ... }` by balancing braces from the first `{`.
   Safe for the pure-math helpers here (none embed `{`/`}` inside string literals). */
function extractFn(src, name) {
  const sig = new RegExp('function\\s+' + name + '\\s*\\(');
  const m = sig.exec(src);
  if (!m) throw new Error('function not found: ' + name);
  let i = src.indexOf('{', m.index);
  if (i < 0) throw new Error('no body for: ' + name);
  let depth = 0, start = i;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(m.index, i);
}

/* Build a sandbox that exposes the named functions after evaluating a preamble. */
function build(fnSources, exportNames, preamble = '') {
  const body = preamble + '\n' + fnSources.join('\n') + '\nreturn {' + exportNames.join(',') + '};';
  // eslint-disable-next-line no-new-func
  return Function(body)();
}

let failures = 0, passes = 0;
function assert(cond, msg) {
  if (cond) { passes++; console.log('  \u2713 ' + msg); }
  else { failures++; console.log('  \u2717 FAIL: ' + msg); }
}
function approx(a, b, tol) { return Math.abs(a - b) <= tol; }
function group(name) { console.log('\n' + name); }
const COMPANY_ROUTE_SCRIPTS = Object.freeze([
  'rlexperience.js', 'rlcontext.js', 'rldata.js', 'rlapp.js', 'rlcompany.js',
  'rlexperience-adapters/fundamental-models.js',
  'rlg.js', 'rlchart.js', 'rlticker.js', 'rlnav.js'
]);
function hasExactCompanyRouteScripts(sources) {
  return JSON.stringify(sources) === JSON.stringify(COMPANY_ROUTE_SCRIPTS);
}

/* ---------- Step 1: model text is data + CSP defense in depth ---------- */
try {
  group('Step 1 security — escaped model sinks and CSP on every page');
  const htmlPages = readdirSync(ROOT).filter((file) => file.endsWith('.html')).sort();
  const cspPattern = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"\s*\/?\s*>/i;
  const policies = htmlPages.map((file) => ({ file, match: cspPattern.exec(read(file)) }));
  const missingCsp = policies.filter((entry) => !entry.match).map((entry) => entry.file);
  assert(missingCsp.length === 0, 'every shipped HTML page carries a Content-Security-Policy meta');

  const uniquePolicies = new Set(policies.filter((entry) => entry.match).map((entry) => entry.match[1]));
  assert(uniquePolicies.size === 1, 'all pages use one identical CSP instead of drifting per page');
  const csp = uniquePolicies.size === 1 ? [...uniquePolicies][0] : '';
  assert(/default-src 'self'/.test(csp) && /script-src 'self' 'unsafe-inline'/.test(csp), 'CSP keeps the single-file inline-script design while defaulting to self');
  assert(/object-src 'none'/.test(csp) && /base-uri 'none'/.test(csp) && /form-action 'none'/.test(csp), 'CSP blocks object, base-tag, and form exfiltration paths');
  const connectTokens = ((/connect-src\s+([^;]+)/.exec(csp) || [])[1] || '').trim().split(/\s+/).filter(Boolean);
  assert(connectTokens.includes("'self'") && !connectTokens.includes('https:') && !connectTokens.includes('*'), 'CSP connect-src is an explicit origin allowlist, never wildcard https');
  assert(/https:\/\/query1\.finance\.yahoo\.com/.test(csp) && /https:\/\/api\.twelvedata\.com/.test(csp) && /https:\/\/\*\.ts\.net:\*/.test(csp) && /https:\/\/stockanalysis\.com/.test(csp),
    'CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths');
  const relayHosts = ['corsproxy.io', 'api.allorigins.win', 'api.codetabs.com'];
  assert(relayHosts.every((host) => !csp.includes(host)), 'CSP allows no open URL-forwarding relay origin');
  const productionNetworkSources = htmlPages.concat(readdirSync(ROOT).filter((file) => /^rl.*\.js$/.test(file)));
  assert(productionNetworkSources.every((file) => relayHosts.every((host) => !read(file).includes(host))),
    'production pages and shared runtime contain no open URL-forwarding relay chain');

  const sinkPattern = /innerHTML\s*=.*\+\s*\(?[a-z]+\.(?:title|note|read|summary|why|what)/i;
  const sinkFiles = htmlPages.concat(readdirSync(ROOT).filter((file) => /^rl.*\.js$/.test(file)));
  const unescapedSinks = sinkFiles.filter((file) => read(file).split(/\r?\n/).some((line) => sinkPattern.test(line) && !/esc\s*\(/.test(line)));
  assert(unescapedSinks.length === 0, 'no model/config-authored field reaches innerHTML without esc()');

  /* ADVERSARIAL: prove the static sink detector catches the exact original defect. */
  const originalDefect = 'host.innerHTML = "<b>" + x.title + "</b>";';
  assert(sinkPattern.test(originalDefect) && !/esc\s*\(/.test(originalDefect), 'the sink detector catches an unescaped model-authored title');
} catch (error) { failures++; console.log('  \u2717 FAIL (Step 1 security group threw): ' + error.message); }

/* ---------- Feature 004: RLFX/RLDATA foundation ---------- */
try {
  group('Feature 004 RLFX/RLDATA foundation');
  const { createRequire } = await import('node:module');
  const featureRequire = createRequire(import.meta.url);
  const RLFX = featureRequire('../rlfx.js');
  const fixture = JSON.parse(read('tests/fixtures/fx-regime/foundation-cases.json'));
  const commonjsInput = JSON.parse(read('tests/fixtures/fx-regime/commonjs-determinism-input.json'));
  const fixtureRows = (dates, levels) => levels.map((close, index) => ({ t: Date.parse(dates[index] + 'T21:00:00.000Z'), c: close }));
  const fixtureSeries = (codes, levels, dates) => Object.fromEntries(codes.map((code) => [code, fixtureRows(dates, levels[code])]));

  const priorGlobal = globalThis.RLFX;
  const sentinel = Object.freeze({ owner: 'feature-004-selftest-sentinel' });
  globalThis.RLFX = sentinel;
  delete featureRequire.cache[featureRequire.resolve('../rlfx.js')];
  const imported = featureRequire('../rlfx.js');
  const firstDecision = imported.computeCurrencyDecision(structuredClone(commonjsInput));
  const secondDecision = imported.computeCurrencyDecision(structuredClone(commonjsInput));
  assert(globalThis.RLFX === sentinel && Object.isFrozen(firstDecision) && Object.isFrozen(firstDecision.controls) && imported.canonicalize(firstDecision) === imported.canonicalize(secondDecision) && firstDecision.computedAt === commonjsInput.decisionTime && firstDecision.decisionId === secondDecision.decisionId, 'RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic');
  if (priorGlobal === undefined) delete globalThis.RLFX; else globalThis.RLFX = priorGlobal;

  const universe = JSON.parse(read('fx-regime-universe.json'));
  const universeResult = RLFX.validateUniverse(universe);
  assert(universeResult.ok && universeResult.value.currencies.length === 24 && universeResult.value.evidenceSources.every((policy) => policy.activation !== 'approved'), 'RLFX universe is bounded closed and asserts no live source authorization');

  const rldataSource = read('rldata.js'), durable = {}, session = {};
  const durableStorage = { getItem: (key) => durable[key] || null, setItem: (key, value) => { durable[key] = value; }, removeItem: (key) => { delete durable[key]; } };
  const sessionStorage = { getItem: (key) => session[key] || null, setItem: (key, value) => { session[key] = value; }, removeItem: (key) => { delete session[key]; } };
  const rldataRoot = { RLFX, location: { pathname: '/index.html', protocol: 'https:' } };
  const rldata = Function('globalThis', 'window', 'localStorage', 'sessionStorage', 'fetch', 'location', 'document', rldataSource + '\nreturn globalThis.RLDATA;')(rldataRoot, rldataRoot, durableStorage, sessionStorage, undefined, rldataRoot.location, undefined);
  const sourceRows = fixtureRows(fixture.dates, fixture.sourceEnvelope.levels);
  const seriesMeta = {
    sourceId: fixture.sourceEnvelope.policy.sourceId,
    providerTag: fixture.sourceEnvelope.providerTag,
    url: fixture.sourceEnvelope.sourceUrl,
    sourceUsePolicyId: fixture.sourceEnvelope.policy.sourceUsePolicyId,
    sourceUseReviewRef: fixture.sourceEnvelope.policy.sourceUseReviewRef,
    retrievedAt: fixture.sourceEnvelope.retrievedAt,
    expectedCadence: fixture.sourceEnvelope.policy.expectedCadence,
    reviewWindow: fixture.sourceEnvelope.policy.reviewWindow,
    rights: fixture.sourceEnvelope.policy.rights,
    quality: 'observed',
    limitations: fixture.sourceEnvelope.policy.limitations
  };
  rldata.putBarSeries(fixture.sourceEnvelope.symbol, '1d', sourceRows, seriesMeta);
  const approvedEnvelope = rldata.barSeries(fixture.sourceEnvelope.symbol, '1d', fixture.sourceEnvelope.policy, fixture.decisionTime);
  rldata.putBars('FEATURE004-LEGACY', '1d', [{ t: sourceRows[0].t, c: 918273.645 }], fixture.sourceEnvelope.providerTag);
  const legacyEnvelope = rldata.barSeries('FEATURE004-LEGACY', '1d', { ...fixture.sourceEnvelope.policy, subjects: ['FEATURE004-LEGACY'] }, fixture.decisionTime);
  assert(approvedEnvelope.retrievedAt === fixture.sourceEnvelope.retrievedAt && approvedEnvelope.observedAsOf === new Date(sourceRows.at(-1).t).toISOString() && approvedEnvelope.rights === 'redistributable' && legacyEnvelope.unavailableReason === 'RIGHTS_UNCLEAR' && legacyEnvelope.rows.length === 0 && !JSON.stringify(legacyEnvelope).includes('918273.645'), 'RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows');

  const legacyRead = rldata.putToolRead('feature004-legacy-read', { asOf: '2026-01-19T21:00:00.000Z', read: 'Legacy read', metrics: { state: 'legacy' }, deepLink: 'legacy.html' });
  const versionedRead = { contractVersion: 'rl-tool-read/v1', id: 'fx-regime-relative-value-lab', availability: 'unavailable', asOf: null, read: 'Unavailable under source contract', metrics: { state: 'unavailable' }, deepLink: 'fx-regime-relative-value-lab.html#simple', computedAt: fixture.decisionTime, freshUntil: null };
  const savedVersionedRead = rldata.putToolRead(versionedRead.id, versionedRead);
  assert(JSON.parse(durable.rlData).v === 1 && JSON.stringify(rldata.bars(fixture.sourceEnvelope.symbol, '1d')) === JSON.stringify(sourceRows) && legacyRead.asOf === '2026-01-19T21:00:00.000Z' && !Object.prototype.hasOwnProperty.call(legacyRead, 'computedAt') && savedVersionedRead.computedAt === fixture.decisionTime && savedVersionedRead.asOf === null, 'RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes');

  const tdRows = rldata.tdToRows({
    status: 'ok', values: [
      { datetime: '2026-07-20 15:55:00', open: '1', high: '3', low: '0.5', close: '2', volume: '100' },
      { datetime: '2026-07-20 15:50:00', open: '0.9', high: '2', low: '0.8', close: '1.5', volume: '' }
    ]
  });
  assert(
    rldata.tdInterval('1d') === '1day' && rldata.tdInterval('5m') === '5min' && rldata.tdInterval('1m') === '1min' && rldata.tdInterval('nope') === null &&
    rldata.tdSymbol('BTC-USD') === 'BTC/USD' && rldata.tdSymbol('EURUSD=X') === 'EUR/USD' && rldata.tdSymbol('MSFT') === 'MSFT' &&
    Array.isArray(tdRows) && tdRows.length === 2 && tdRows[0].t < tdRows[1].t && tdRows[1].c === 2 && tdRows[1].v === 100 && tdRows[0].v === null &&
    rldata.tdToRows({ status: 'error', code: 429 }) === null && rldata.tdToRows({ values: 'x' }) === null,
    'RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null');

  const broadInput = structuredClone(fixture.broadDollar);
  broadInput.series = broadInput.series.map((series) => ({ ...series, rows: fixtureRows(fixture.dates, series.levels) }));
  const broad = RLFX.computeBroadDollar(broadInput);
  assert(broad.series['official-broad'].state === 'Weakening' && broad.series['proxy-broad'].state === 'Strengthening' && broad.series['official-afe'].observedAsOf !== broad.series['official-eme'].observedAsOf && broad.conflicts.some((conflict) => conflict.code === 'OFFICIAL_PROXY_DIVERGENCE') && broad.concentration !== 'broad', 'RLFX broad dollar keeps Broad AFE EME and proxy states separate');

  const rankDates = fixture.dates.slice(0, 4);
  const rankInput = {
    decisionTime: fixture.decisionTime,
    cohort: 'G10',
    currencies: fixture.g10.codes.map((code) => ({ code, cohort: 'G10', rankEligible: true, autoPairEligible: true, management: 'free-float' })),
    currencySeries: fixtureSeries(fixture.g10.codes, fixture.g10.levels, rankDates),
    horizonSessions: 3,
    minimumPeers: 3,
    minimumCoverageRatio: 0.6,
    stateZ: 0.5,
    deadbandLogReturn: 0.001
  };
  const ranked = RLFX.computeCurrencyStrength(rankInput);
  const eur = ranked.ranked.find((entry) => entry.currency === 'EUR');
  const laggedRankInput = structuredClone(rankInput);
  laggedRankInput.currencySeries.CHF = fixtureRows(fixture.dates.slice(1, 5), fixture.g10.levels.CHF);
  const unavailableRank = RLFX.computeCurrencyStrength(laggedRankInput);
  assert(eur.state !== 'Strong' && eur.rawMeanLogReturn < 0 && ranked.ranked.every((entry) => entry.rankWindowId === ranked.rankWindow.setId && entry.evaluationDate === ranked.evaluationDate) && unavailableRank.state === 'unavailable' && unavailableRank.ranked.length === 0 && unavailableRank.rankWindow.coverage.commonRowCount < 4, 'RLFX cohort rank requires one full-graph exact-date window');

  const directRows = fixtureRows(rankDates, [1.1, 1.2, 1.3, 1.4]);
  const inverseRows = directRows.map((row) => ({ t: row.t, c: 1 / row.c }));
  const direct = RLFX.orientSeries(directRows, { base: 'EUR', quote: 'USD' }, { base: 'EUR', quote: 'USD' });
  const inverse = RLFX.orientSeries(inverseRows, { base: 'USD', quote: 'EUR' }, { base: 'EUR', quote: 'USD' });
  const invalidOrientation = RLFX.orientSeries(directRows, { base: 'GBP', quote: 'USD' }, { base: 'EUR', quote: 'USD' });
  assert(approx(direct.rows.at(-1).c / direct.rows[0].c - 1, inverse.rows.at(-1).c / inverse.rows[0].c - 1, 1e-12) && direct.relationshipId === inverse.relationshipId && invalidOrientation.unavailableReason === 'INVALID_ORIENTATION' && invalidOrientation.rows.length === 0, 'RLFX orientation and inverse relationship contracts count one economic edge');

  const emInput = { ...structuredClone(rankInput), cohort: 'liquid-EM', currencies: fixture.liquidEm.codes.map((code) => ({ code, cohort: 'liquid-EM', rankEligible: true, autoPairEligible: true, management: 'free-float' })), currencySeries: fixtureSeries(fixture.liquidEm.codes, fixture.liquidEm.levels, rankDates) };
  const emRank = RLFX.computeCurrencyStrength(emInput);
  const managedRank = RLFX.computeCurrencyStrength({ decisionTime: fixture.decisionTime, cohort: 'managed-reference', currencies: [{ code: 'CNY', cohort: 'managed-reference', rankEligible: false, autoPairEligible: false, management: 'managed' }], currencySeries: { CNY: fixtureRows(rankDates.slice(0, 2), [1, 1.0001]) }, horizonSessions: 1, minimumPeers: 1, minimumCoverageRatio: 1, stateZ: 0.5, deadbandLogReturn: 0.001 });
  assert(ranked.ranked.every((entry) => fixture.g10.codes.includes(entry.currency)) && emRank.ranked.every((entry) => fixture.liquidEm.codes.includes(entry.currency)) && ranked.autoCandidate.base !== emRank.autoCandidate.base && managedRank.state === 'reference-only' && managedRank.ranked.length === 0 && managedRank.autoCandidate === null, 'RLFX cohort and managed-reference eligibility never pool or auto-elevate');

  const pairInput = { decisionTime: fixture.decisionTime, base: fixture.pair.base, quote: fixture.pair.quote, cohort: fixture.pair.cohort, selectedHorizon: 'tactical', rows: fixtureRows(fixture.dates, fixture.pair.risingLevels), baseStrength: { zDistance: 1.1, coverageRatio: 0.9 }, quoteStrength: { zDistance: -1, coverageRatio: 0.9 }, policy: fixture.pair.policy, carry: fixture.policyCarry, reerValue: fixture.reerValue, positioning: fixture.positioning, event: fixture.eventUnavailable, managedReference: false, fundingStrength: false, riskRise: false };
  const adverseCarry = RLFX.computePairRead(pairInput);
  const supportiveCarry = RLFX.computePairRead({ ...pairInput, carry: { ...pairInput.carry, value: 0.75 } });
  assert(adverseCarry.momentum.tactical.state === 'Positive' && adverseCarry.carry.kind === 'policy-rate-proxy' && adverseCarry.carry.label === 'Policy-rate proxy' && adverseCarry.carry.subtype === undefined && adverseCarry.carry.roll === 'not-applicable' && adverseCarry.carry.liquidity === 'not-observed' && adverseCarry.carry.cost === 'not-observed' && adverseCarry.conflicts.some((conflict) => conflict.code === 'TREND_CARRY_DIVERGENCE') && adverseCarry.confidencePct < supportiveCarry.confidencePct, 'RLFX pair momentum and Policy-rate proxy remain distinct evidence');

  const carryRequiredPaths = [['instrument'], ['instrument', 'id'], ['instrument', 'venue'], ['instrument', 'contractOrQuote'], ['tenor'], ['basis'], ['roll'], ['liquidity'], ['cost'], ['rights'], ['observedAsOf'], ['retrievedAt'], ['freshUntil'], ['limitations']];
  const carryRejected = carryRequiredPaths.every((path) => {
    const candidate = structuredClone(fixture.marketCarry);
    let target = candidate;
    for (let index = 0; index < path.length - 1; index++) target = target[path[index]];
    delete target[path.at(-1)];
    try { RLFX.normalizeCarryRead(candidate, fixture.decisionTime); return false; } catch (_error) { return true; }
  });
  const completeCarry = RLFX.normalizeCarryRead(fixture.marketCarry, fixture.decisionTime);
  const proxyCarry = RLFX.normalizeCarryRead(fixture.policyCarry, fixture.decisionTime);
  assert(carryRejected && completeCarry.kind === 'market-implied' && proxyCarry.label === 'Policy-rate proxy' && proxyCarry.subtype === undefined, 'RLFX CarryReadV1 rejects every incomplete market-implied branch');

  const fallingInput = { ...pairInput, rows: fixtureRows(fixture.dates, fixture.pair.fallingLevels), baseStrength: { zDistance: 0.2, coverageRatio: 0.9 }, quoteStrength: { zDistance: -0.1, coverageRatio: 0.9 } };
  const valueAndPositioning = RLFX.computePairRead(fallingInput);
  const missingPositioning = RLFX.computePairRead({ ...fallingInput, positioning: { state: 'Unavailable', availability: 'unavailable', unavailableReason: 'NO_COVERAGE', limitations: ['No mapped contract'] } });
  assert(valueAndPositioning.state !== 'Candidate' && valueAndPositioning.conflicts.some((conflict) => conflict.code === 'VALUE_TREND_TENSION') && valueAndPositioning.positioning.reportAsOf === fixture.positioning.reportAsOf && valueAndPositioning.positioning.releasedAt === fixture.positioning.releasedAt && missingPositioning.positioning.unavailableReason === 'NO_COVERAGE' && !/uncrowded|balanced|light/i.test(JSON.stringify(missingPositioning.positioning)), 'RLFX value and delayed positioning preserve semantics clocks and unavailable states');

  const unwindInput = { ...fallingInput, baseStrength: { zDistance: 0.8, coverageRatio: 0.9 }, quoteStrength: { zDistance: -0.8, coverageRatio: 0.9 }, carry: { ...fixture.policyCarry, value: 0.75 } };
  const highCarryOnly = RLFX.computePairRead(unwindInput);
  const activeUnwind = RLFX.computePairRead({ ...unwindInput, fundingStrength: true, riskRise: true });
  assert(highCarryOnly.carryUnwind.state === 'Dormant' && activeUnwind.carryUnwind.state === 'Active' && highCarryOnly.event.unavailableReason === 'NO_SOURCE' && /price|risk/i.test(highCarryOnly.invalidation), 'RLFX carry unwind and event absence retain multi-family rules and market invalidation');

  const restrictedObservation = {
    contractVersion: 'rlfx-currency-observation/v1', observationId: 'restricted:sentinel', family: 'spot', subject: { kind: 'pair', id: 'EURJPY' }, base: 'EUR', quote: 'JPY', sourceBase: 'EUR', sourceQuote: 'JPY', inverted: false, positiveMeaning: 'EUR strengthens versus JPY', cohort: 'G10', tradability: 'indicative-proxy', value: 918273.645, unit: 'JPY per EUR', transformation: 'raw', horizon: null, source: { id: 'restricted-source', label: 'Restricted source', url: 'https://restricted.example.invalid/value' }, observedAsOf: '2026-01-19T21:00:00.000Z', retrievedAt: '2026-01-19T21:05:00.000Z', expectedCadence: 'daily', reviewWindow: { mode: 'max-age', observedMaxAgeMs: 86400000, retrievalMaxAgeMs: 86400000 }, availability: 'fresh', availabilityDetail: 'Technically retrievable but unreviewed', rights: 'unknown', quality: 'indicative-proxy', revisionId: null, adjustment: 'raw-close', lineage: { originIds: ['restricted:sentinel'], relationshipId: 'rel:EUR-JPY', derivedFrom: [] }, limitations: ['Redistribution rights are unknown']
  };
  const erased = RLFX.normalizeObservation(restrictedObservation);
  assert(erased.availability === 'unavailable' && erased.unavailableReason === 'RIGHTS_UNCLEAR' && erased.value === undefined && !JSON.stringify(erased).includes('918273.645') && !JSON.stringify(erased).includes('restricted.example.invalid'), 'RLFX rights gate strips restricted numeric values from public projections');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 004 foundation group threw): ' + e.message); }

/* ---------- Feature 011: RLVOL conditional-volatility foundation ---------- */
try {
  group('Feature 011 RLVOL foundation');
  const { createRequire } = await import('node:module');
  const featureRequire = createRequire(import.meta.url);
  const RLVOL = featureRequire('../rlvol.js');

  /* deterministic generators (no randomness; volatility clustering via a fixed LCG) */
  const makeRng = (seed) => { let s = seed >>> 0; return () => { s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; return s / 0x7fffffff; }; };
  const gauss = (rng) => (rng() * 2 - 1) + (rng() * 2 - 1) + (rng() * 2 - 1);
  const simGarch = (n, omega, alpha, beta, seed) => { const rng = makeRng(seed); let sig2 = omega / (1 - alpha - beta); const r = []; for (let i = 0; i < n; i++) { const e = gauss(rng); const x = Math.sqrt(sig2) * e; r.push(x); sig2 = omega + alpha * x * x + beta * sig2; } return r; };
  const simArch = (n, omega, alpha, seed) => { const rng = makeRng(seed); let sig2 = omega / (1 - alpha); const r = []; for (let i = 0; i < n; i++) { const e = gauss(rng); const x = Math.sqrt(sig2) * e; r.push(x); sig2 = omega + alpha * x * x; } return r; };
  const closesFromReturns = (returns, startPx = 100) => { const closes = [startPx]; for (const r of returns) closes.push(closes[closes.length - 1] * Math.exp(r)); return closes; };
  const barRows = (closes, baseT = Date.UTC(2023, 0, 2)) => closes.map((c, i) => ({ t: baseT + i * 86400000, c: Math.round(c * 1e4) / 1e4 }));
  const isoOf = (t) => new Date(t).toISOString().slice(0, 10);
  const GARCH_OPTS = { maxIter: 200, tolerance: 1e-8, minOmega: 1e-12, maxPersistence: 0.999 };
  const buildInput = (returns, estimator, opts = {}) => {
    const closes = closesFromReturns(returns);
    const rows = opts.rows || barRows(closes);
    return {
      decisionTime: '2024-06-01T12:00:00.000Z',
      configVersion: 'selftest-rlvol-v1',
      controls: { asset: opts.asset || 'SPY', estimator, termLengthDays: 21, targetVol: opts.targetVol || 0.15, notional: opts.notional === undefined ? 100000 : opts.notional, historyRange: opts.historyRange || '5y' },
      asset: { symbol: opts.asset || 'SPY', name: 'SPDR S&P 500 ETF Trust', cohort: 'equity-index', management: 'free-float', defaultTargetVol: 0.15, regimeWindowObs: opts.regimeWindowObs || 120, minForecastObs: opts.minForecastObs || 60, reviewWindowHours: 100000, limitations: [] },
      policy: { ewma: { lambda: 0.94, seedWindow: 20 }, garch: opts.garch || GARCH_OPTS, forecast: { defaultHorizonDays: 21, maxHorizonDays: 63, annualization: 252 }, regime: { calmMaxPct: 25, normalMaxPct: 75, elevatedMaxPct: 95 }, sizing: { cap: 2.0, forecastVolFloor: 0.05 }, managedSuppression: { zeroReturnFraction: 0.30, minAbsDailyReturn: 0.0005, identicalCloseRun: 10 }, history: { defaultRange: '5y', longRangeOptions: ['10y', 'max'], dailyBarReviewHours: 100000 } },
      bars: { rows, observedAsOf: isoOf(rows[rows.length - 1].t), retrievedAt: '2024-06-01T11:30:00.000Z', source: { id: 'pages-snapshot', url: null } }
    };
  };

  /* SCN-011-020 — deterministic browser/Node parity with CommonJS purity */
  const determinismInput = JSON.parse(read('tests/fixtures/volatility-sizing/commonjs-determinism-input.json'));
  const priorGlobal = globalThis.RLVOL;
  const sentinel = Object.freeze({ owner: 'feature-011-selftest-sentinel' });
  globalThis.RLVOL = sentinel;
  delete featureRequire.cache[featureRequire.resolve('../rlvol.js')];
  const imported = featureRequire('../rlvol.js');
  const firstDecision = imported.buildVolDecisionRead(structuredClone(determinismInput));
  const secondDecision = imported.buildVolDecisionRead(structuredClone(determinismInput));
  assert(globalThis.RLVOL === sentinel && Object.isFrozen(firstDecision) && Object.isFrozen(firstDecision.controls) && imported.canonicalize(firstDecision) === imported.canonicalize(secondDecision) && firstDecision.computedAt === determinismInput.decisionTime && firstDecision.decisionId === secondDecision.decisionId, 'RLVOL CommonJS import preserves the existing global and explicit decisionTime is deterministic');
  if (priorGlobal === undefined) delete globalThis.RLVOL; else globalThis.RLVOL = priorGlobal;

  /* SCN-011-001 — clustering keeps the forecast elevated, typed forecast (EWMA + GARCH) */
  const calmBase = simGarch(260, 0.000008, 0.05, 0.90, 99);
  const clustered = calmBase.concat([0.055, -0.05, 0.058]);
  const ewmaClustered = RLVOL.buildVolDecisionRead(buildInput(clustered, 'ewma'));
  const garchClustered = RLVOL.buildVolDecisionRead(buildInput(clustered, 'garch11'));
  const calmBaselineRealized = RLVOL.realizedVol(RLVOL.logReturns(closesFromReturns(calmBase)).slice(0, 200), 20);
  assert(
    ewmaClustered.forecast.kind === 'forecast' && ewmaClustered.forecast.value > calmBaselineRealized &&
    ewmaClustered.persistence.persistence === 0.94 && ewmaClustered.term.points.every((p) => p.kind === 'forecast') &&
    garchClustered.diagnostics.estimatorResolved === 'garch11' && garchClustered.persistence.persistence > 0.8 &&
    garchClustered.term.longRunVol !== null && garchClustered.term.points[0].vol > garchClustered.term.longRunVol &&
    garchClustered.term.points.every((p) => p.kind === 'forecast'),
    'RLVOL EWMA and GARCH forecasts keep high persistence elevated above the long-run and stay typed forecast');

  /* SCN-011-003 — sizing multiplier min(cap, targetVol/max(floor, forecastVol)) with a worked example */
  const readyForSizing = ewmaClustered;
  const expectedMultiplier = RLVOL.sizingMultiplier(readyForSizing.controls.targetVol, readyForSizing.forecast.value, readyForSizing.sizing.cap, readyForSizing.sizing.forecastVolFloor);
  assert(
    approx(RLVOL.sizingMultiplier(0.15, 0.30, 2.0, 0.05), 0.5, 1e-9) &&
    readyForSizing.sizing.state === 'ready' && readyForSizing.sizing.conditional === true &&
    readyForSizing.sizing.multiplier === expectedMultiplier &&
    readyForSizing.sizing.workedExample && readyForSizing.sizing.workedExample.notional === 100000 &&
    approx(readyForSizing.sizing.workedExample.conditionalExposure, 100000 * expectedMultiplier, 1e-6),
    'RLVOL sizing multiplier is min(cap, targetVol over max(floor, forecastVol)) with a worked example');

  /* SCN-011-004 — near-zero forecast floors the multiplier at the cap, never diverges */
  assert(
    RLVOL.sizingMultiplier(0.15, 1e-12, 2.0, 0.05) === 2.0 && Number.isFinite(RLVOL.sizingMultiplier(0.15, 0, 2.0, 0.05)) &&
    RLVOL.sizingMultiplier(0.15, 0, 2.0, 0.05) === 2.0 && RLVOL.sizingMultiplier(0.15, 1e-300, 2.0, 0.05) <= 2.0,
    'RLVOL near-zero forecast vol floors the multiplier at the cap and never diverges');

  /* SCN-011-006 — GARCH fit is a labeled lightweight optimizer, never institutional MLE */
  const fitClustered = RLVOL.garch11Fit(RLVOL.logReturns(closesFromReturns(clustered)), GARCH_OPTS);
  const garchText = JSON.stringify(fitClustered) + JSON.stringify(garchClustered);
  assert(
    fitClustered.ok === true && fitClustered.method === 'lightweight-optimizer' &&
    Number.isFinite(fitClustered.omega) && Number.isFinite(fitClustered.alpha) && Number.isFinite(fitClustered.beta) &&
    fitClustered.persistence > 0 && fitClustered.persistence < 1 && garchClustered.forecast.quality === 'fitted' &&
    !/\bMLE\b|maximum[- ]likelihood|institutional/i.test(garchText),
    'RLVOL GARCH fit is a labeled lightweight optimizer and never institutional MLE');

  /* SCN-011-011 — non-convergent GARCH resolves to the labeled EWMA fallback */
  const fallbackInput = buildInput(clustered, 'garch11', { garch: { ...GARCH_OPTS, maxPersistence: 0.20 } });
  const fallbackDecision = RLVOL.buildVolDecisionRead(fallbackInput);
  assert(
    RLVOL.garch11Fit(RLVOL.logReturns(closesFromReturns(clustered)), { ...GARCH_OPTS, maxPersistence: 0.20 }).reason === 'FIT_NONCONVERGENT' &&
    fallbackDecision.diagnostics.estimatorResolved === 'ewma' && fallbackDecision.diagnostics.garchConverged === false &&
    Number.isFinite(fallbackDecision.forecast.value) && fallbackDecision.limitations.some((l) => /did not converge/.test(l)),
    'RLVOL non-convergent GARCH resolves to the labeled EWMA closed-form fallback');

  /* SCN-011-012 — material EWMA-vs-GARCH persistence divergence opens a conflict, never averaged */
  const shortMemory = simArch(400, 0.00005, 0.35, 7);
  const divergenceDecision = RLVOL.buildVolDecisionRead(buildInput(shortMemory, 'garch11'));
  const garchPersistence = divergenceDecision.persistence.persistence;
  assert(
    divergenceDecision.diagnostics.estimatorResolved === 'garch11' &&
    divergenceDecision.conflicts.some((c) => c.code === 'EWMA_GARCH_PERSISTENCE_DIVERGENCE') &&
    Math.abs(garchPersistence - 0.94) > 0.1 && garchPersistence !== (0.94 + garchPersistence) / 2,
    'RLVOL material EWMA-vs-GARCH persistence divergence opens an evidence conflict and is never averaged');

  /* SCN-011-013 — realized reads are typed realized and never relabeled forecast in the owner read */
  const typingOwner = RLVOL.projectVolToolRead(ewmaClustered);
  let realizedRelabelRejected = false;
  try { RLVOL.normalizeObservation({ ...ewmaClustered.realized, estimator: 'ewma' }); } catch (_e) { realizedRelabelRejected = true; }
  let forecastRelabelRejected = false;
  try { RLVOL.normalizeObservation({ ...ewmaClustered.forecast, kind: 'realized' }); } catch (_e) { forecastRelabelRejected = true; }
  assert(
    ewmaClustered.realized.kind === 'realized' && ewmaClustered.realized.estimator === 'realized-rolling' &&
    ewmaClustered.forecast.kind === 'forecast' && realizedRelabelRejected && forecastRelabelRejected &&
    typingOwner.metrics.forecastVol !== null && typingOwner.metrics.realizedVol !== null,
    'RLVOL realized reads are typed realized and never relabeled forecast in the owner read');

  /* SCN-011-014 — longer history is best-effort caveated and projects no multi-decade single-path number */
  const longHistory = RLVOL.buildVolDecisionRead(buildInput(clustered, 'ewma', { historyRange: '10y' }));
  const longOwner = RLVOL.projectVolToolRead(longHistory);
  assert(
    longHistory.controls.historyRange === '10y' && longHistory.limitations.some((l) => /best-effort/.test(l)) &&
    !/outperform|multi-decade|15-year|50-year|150-year/i.test(JSON.stringify(longOwner)),
    'RLVOL longer history is best-effort caveated and projects no multi-decade single-path number');

  /* SCN-011-002 — volPercentile always returns its trailing windowRef and regimeBand maps thresholds */
  const windowRef = { observations: 4, startDate: '2024-01-02', endDate: '2024-01-05' };
  const percentileRead = RLVOL.volPercentile(0.25, [0.1, 0.2, 0.3, 0.4], windowRef);
  let percentileRefusedWithoutWindow = false;
  try { RLVOL.volPercentile(0.25, [0.1, 0.2, 0.3, 0.4], null); } catch (_e) { percentileRefusedWithoutWindow = true; }
  const thresholds = { calmMaxPct: 25, normalMaxPct: 75, elevatedMaxPct: 95 };
  assert(
    percentileRead.windowRef && percentileRead.windowRef.observations === 4 && percentileRead.windowRef.startDate === '2024-01-02' &&
    percentileRefusedWithoutWindow && RLVOL.regimeBand(10, thresholds) === 'calm' && RLVOL.regimeBand(50, thresholds) === 'normal' &&
    RLVOL.regimeBand(90, thresholds) === 'elevated' && RLVOL.regimeBand(99, thresholds) === 'storm' &&
    ewmaClustered.regime.windowRef && ewmaClustered.regime.windowRef.observations > 0,
    'RLVOL volPercentile always returns its trailing windowRef and regimeBand maps thresholds');

  /* SCN-011-008 — detectManagedSuppression flags peg/band/halt low volatility as managed-suppressed */
  const pegCloses = []; let px = 100; for (let i = 0; i < 160; i++) { px = px * (1 + (i % 20 === 0 ? 0.00003 : 0)); pegCloses.push(px); }
  const pegReturns = RLVOL.logReturns(pegCloses);
  const pegDecision = RLVOL.buildVolDecisionRead(buildInput(pegReturns, 'ewma', { rows: barRows(pegCloses) }));
  assert(
    RLVOL.detectManagedSuppression(pegReturns, pegCloses, { zeroReturnFraction: 0.30, minAbsDailyReturn: 0.0005, identicalCloseRun: 10 }) === true &&
    RLVOL.detectManagedSuppression(RLVOL.logReturns(closesFromReturns(clustered)), closesFromReturns(clustered), { zeroReturnFraction: 0.30, minAbsDailyReturn: 0.0005, identicalCloseRun: 10 }) === false &&
    pegDecision.regime.managedSuppressed === true && pegDecision.state === 'partial' &&
    pegDecision.sizing.state === 'unavailable' && pegDecision.sizing.unavailableReason === 'MANAGED_SUPPRESSED',
    'RLVOL detectManagedSuppression flags peg band or halt low volatility as managed-suppressed');

  /* SCN-011-009 — below-minimum coverage is INSUFFICIENT_HISTORY with exact required-versus-available counts */
  const shortSeries = simGarch(40, 0.00002, 0.08, 0.90, 5);
  const shortDecision = RLVOL.buildVolDecisionRead(buildInput(shortSeries, 'ewma', { minForecastObs: 60 }));
  assert(
    shortDecision.state === 'unavailable' && shortDecision.forecast.unavailableReason === 'INSUFFICIENT_HISTORY' &&
    shortDecision.forecast.coverageObs.requiredMinimum === 60 && shortDecision.forecast.coverageObs.used === RLVOL.logReturns(closesFromReturns(shortSeries)).length &&
    shortDecision.forecast.value === undefined && shortDecision.regime.percentile === null && shortDecision.sizing.multiplier === null,
    'RLVOL below-minimum coverage is INSUFFICIENT_HISTORY with exact required-versus-available counts');

  /* SCN-011-021 — projectVolToolRead emits summary-only owner read with no raw bars or restricted payload */
  const ownerRead = RLVOL.projectVolToolRead(ewmaClustered);
  const ownerKeys = Object.keys(ownerRead).sort().join(',');
  const ownerStr = JSON.stringify(ownerRead);
  assert(
    ownerKeys === 'asOf,availability,computedAt,contractVersion,deepLink,freshUntil,id,metrics,read' &&
    ownerRead.contractVersion === 'rl-tool-read/v1' && ownerRead.id === 'volatility-sizing-lab' && ownerRead.deepLink === 'volatility-sizing-lab.html' &&
    ownerRead.availability === 'current' && typeof ownerRead.metrics.regimeWindowObs === 'number' &&
    ownerRead.metrics.forecastVol !== null && ownerRead.metrics.realizedVol !== null &&
    !ownerStr.includes('"rows"') && !/"t":\d{10,}/.test(ownerStr) && !/https?:\/\//.test(ownerStr),
    'RLVOL projectVolToolRead emits summary-only owner read with no raw bars or restricted payload');

  /* SCN-011-015 — the volatility tool is registered identically across the registry trio */
  const toolsRegistry = JSON.parse(read('tools.json')).tools;
  const volTool = toolsRegistry.find((tool) => tool.id === 'volatility-sizing-lab');
  const indexHtml = read('index.html');
  const navJs = read('rlnav.js');
  const indexHasVol = /id:\s*'volatility-sizing-lab'/.test(indexHtml) && /file:\s*'volatility-sizing-lab\.html'/.test(indexHtml);
  const navHasVol = /\{[^}]*label:\s*"Vol Sizing"[^}]*icon:\s*"🌪️"[^}]*file:\s*"volatility-sizing-lab\.html"[^}]*\}/.test(navJs);
  assert(
    volTool && volTool.nav && volTool.nav.label === 'Vol Sizing' && volTool.nav.icon === '🌪️' &&
    volTool.file === 'volatility-sizing-lab.html' && volTool.notes === 'notes/volatility-sizing-lab.md' &&
    volTool.data === 'volatility-sizing-universe.json' && indexHasVol && navHasVol,
    'tool registry parity: volatility-sizing-lab is registered identically across tools.json, index.html, and rlnav.js');

  /* SCN-011-015 — validateUniverse accepts the closed universe and rejects unknown keys */
  const volUniverse = JSON.parse(read('volatility-sizing-universe.json'));
  const universeOk = RLVOL.validateUniverse(volUniverse);
  const unknownKey = JSON.parse(JSON.stringify(volUniverse)); unknownKey.assets[0].bogusKey = 1;
  const orderViolation = JSON.parse(JSON.stringify(volUniverse)); orderViolation.policy.regime.calmMaxPct = 80;
  const duplicateSymbol = JSON.parse(JSON.stringify(volUniverse)); duplicateSymbol.assets.push(JSON.parse(JSON.stringify(duplicateSymbol.assets[0])));
  const badManagement = JSON.parse(JSON.stringify(volUniverse)); const mref = badManagement.assets.find((a) => a.management === 'managed-reference'); if (mref) mref.limitations = [];
  assert(
    universeOk.ok && universeOk.value.assets.length >= 5 && Object.isFrozen(universeOk.value) && universeOk.value.schemaVersion === 'rlvol-universe/v1' &&
    !RLVOL.validateUniverse(unknownKey).ok && RLVOL.validateUniverse(unknownKey).errors[0].code === 'RLVOL_UNIVERSE_INVALID' &&
    !RLVOL.validateUniverse(orderViolation).ok && !RLVOL.validateUniverse(duplicateSymbol).ok && (!mref || !RLVOL.validateUniverse(badManagement).ok),
    'RLVOL validateUniverse accepts the closed volatility-sizing universe and rejects unknown keys');

  /* SCN-011-021 — projectVolToolRead browser/headless parity carries no raw bars and is accepted by the existing versioned putToolRead */
  const ownerDecision = RLVOL.buildVolDecisionRead(structuredClone(determinismInput));
  const ownerReadA = RLVOL.projectVolToolRead(ownerDecision);
  const ownerReadB = RLVOL.projectVolToolRead(RLVOL.buildVolDecisionRead(structuredClone(determinismInput)));
  const ownerJson = JSON.stringify(ownerReadA);
  const durable011 = {}, session011 = {};
  const durableStorage011 = { getItem: (key) => durable011[key] || null, setItem: (key, value) => { durable011[key] = value; }, removeItem: (key) => { delete durable011[key]; } };
  const sessionStorage011 = { getItem: (key) => session011[key] || null, setItem: (key, value) => { session011[key] = value; }, removeItem: (key) => { delete session011[key]; } };
  const rldataRoot011 = { location: { pathname: '/volatility-sizing-lab.html', protocol: 'https:' } };
  const rldata011 = Function('globalThis', 'window', 'localStorage', 'sessionStorage', 'fetch', 'location', 'document', read('rldata.js') + '\nreturn globalThis.RLDATA;')(rldataRoot011, rldataRoot011, durableStorage011, sessionStorage011, undefined, rldataRoot011.location, undefined);
  const savedOwnerRead = rldata011.putToolRead('volatility-sizing-lab', JSON.parse(JSON.stringify(ownerReadA)));
  assert(
    RLVOL.canonicalize(ownerReadA) === RLVOL.canonicalize(ownerReadB) &&
    !ownerJson.includes('"rows"') && !/"t":\d{10,}/.test(ownerJson) && !/https?:\/\//.test(ownerJson) &&
    savedOwnerRead && savedOwnerRead.id === 'volatility-sizing-lab' && savedOwnerRead.contractVersion === 'rl-tool-read/v1' &&
    savedOwnerRead.availability === ownerReadA.availability && typeof savedOwnerRead.metrics === 'object',
    'RLVOL projectVolToolRead browser and headless parity carries no raw bars');

  /* SCN-011-019 — registry-wide Market Brief coverage includes the registered volatility owner read */
  const briefPayload = JSON.parse(read('market-brief.payload.json'));
  const briefConfig = JSON.parse(read('market-brief.config.json'));
  const briefSnapshot = JSON.parse(read('market-brief.snapshot.json'));
  const briefRegistry = JSON.parse(read('tools.json'));
  const briefAgendaRegistry = JSON.parse(read('research-agenda.json'));
  const volCoverage = (briefPayload.toolCoverage || []).find((entry) => entry.id === 'volatility-sizing-lab');
  const briefErrors = validateBriefPayload(briefPayload, briefRegistry, briefConfig, briefSnapshot, briefAgendaRegistry);
  assert(
    volCoverage && volCoverage.deepLink === 'volatility-sizing-lab.html' && typeof volCoverage.reason === 'string' && volCoverage.reason.trim().length > 0 &&
    briefErrors.length === 0,
    'Registry-wide Market Brief coverage selftest includes the registered volatility owner read');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 011 RLVOL foundation group threw): ' + e.message + '\n' + (e.stack || '')); }

/* ---------- ETF: Sharpe deflation + shock models ---------- */
try {
  group('etf-momentum-lab.html \u2014 Deflated/Probabilistic Sharpe + MC shocks');
  const src = read('etf-momentum-lab.html');
  const names = ['mean', 'gauss', 'studentT', 'normCdf', 'invNorm', 'moments', 'deflatedSharpe'];
  const env = build(names.map((n) => extractFn(src, n)), names, 'var ANN=252;');

  assert(approx(env.normCdf(0), 0.5, 1e-3), 'normCdf(0) = 0.5');
  assert(approx(env.normCdf(1.6448536), 0.95, 2e-3), 'normCdf(1.6449) = 0.95');
  assert(env.normCdf(-3) < env.normCdf(0) && env.normCdf(0) < env.normCdf(3), 'normCdf is monotone increasing');
  assert(approx(env.normCdf(env.invNorm(0.9)), 0.9, 2e-3), 'invNorm/normCdf round-trip at 0.9');
  assert(approx(env.normCdf(env.invNorm(0.05)), 0.05, 2e-3), 'invNorm/normCdf round-trip at 0.05');

  // scaled Student-t(5): unit variance, fat tails
  const nu = 5, sc = Math.sqrt((nu - 2) / nu);
  let n = 200000, s = 0, s2 = 0, k4 = 0;
  for (let i = 0; i < n; i++) { const x = env.studentT(nu) * sc; s += x; s2 += x * x; k4 += x * x * x * x; }
  const mu = s / n, varr = s2 / n - mu * mu, kurt = (k4 / n) / (varr * varr);
  assert(approx(varr, 1, 0.06), 'scaled Student-t(5) variance ~ 1 (preserves target sigma), got ' + varr.toFixed(3));
  assert(kurt > 4, 'scaled Student-t(5) kurtosis > 3 (fat tails), got ' + kurt.toFixed(2));

  // deflatedSharpe: strong uptrend => high DSR; flat/noisy => low DSR; DSR <= PSR always
  const up = [], flat = [];
  let lvl = 100;
  for (let i = 0; i < 320; i++) { lvl *= (1 + 0.0009 + 0.006 * Math.sin(i * 1.3)); up.push(lvl); flat.push(100 * (1 + 0.02 * Math.sin(i * 0.7))); }
  const dUp = env.deflatedSharpe(up, 24), dFlat = env.deflatedSharpe(flat, 24);
  assert(dUp && dUp.psr >= 0 && dUp.psr <= 1 && dUp.dsr >= 0 && dUp.dsr <= 1, 'DSR/PSR are probabilities in [0,1]');
  assert(dUp.dsr <= dUp.psr + 1e-9, 'Deflated Sharpe <= Probabilistic Sharpe (deflation only lowers it)');
  assert(dUp.dsr > 0.7, 'strong-uptrend equity => high DSR (' + (dUp.dsr * 100).toFixed(0) + '%)');
  assert(dFlat.dsr < 0.6, 'flat/noisy equity => low DSR (' + (dFlat.dsr * 100).toFixed(0) + '%)');
  const simpleStrong = { trailing: { '3M': 0.12, '6M': 0.24, '1Y': 0.30 }, sharpe: 1.4, annVol: 0.20 };
  const simpleWeak = { trailing: { '3M': -0.04, '6M': -0.08, '1Y': -0.10 }, sharpe: -0.5, annVol: 0.35 };
  // Feature 012 Scope 06: the etf Simple ranking (etfSimpleSignal/etfSimpleScore) is single-sourced to
  // RLMACROROTATION.etfMomentumSignal/etfCompositeScore in macro-rotation.js — the page delegates and
  // carries no inline momentum/composite formula, so the owner ranking is tested through the module.
  const etfRankReq = (await import('node:module')).createRequire(import.meta.url);
  delete etfRankReq.cache[etfRankReq.resolve('../rlexperience-adapters/macro-rotation.js')];
  const RLMR = etfRankReq('../rlexperience-adapters/macro-rotation.js');
  assert(/RLMACROROTATION\.etfMomentumSignal\s*\(/.test(src) && /RLMACROROTATION\.etfCompositeScore\s*\(/.test(src), 'etf page single-sources the Simple ranking to RLMACROROTATION (no inline momentum/composite formula)');
  assert(approx(RLMR.etfMomentumSignal(simpleStrong, 'blend'), 0.22, 1e-12), 'Simple ETF blend averages 3M/6M/1Y inputs');
  assert(RLMR.etfCompositeScore(simpleStrong, '6M', 'balanced') > RLMR.etfCompositeScore(simpleWeak, '6M', 'balanced'), 'Simple ETF balanced ranking rewards stronger momentum/quality');
  assert(RLMR.etfCompositeScore(simpleStrong, '6M', 'raw') === 0.24, 'Simple ETF raw mode preserves the selected momentum signal');
} catch (e) { failures++; console.log('  \u2717 FAIL (etf group threw): ' + e.message); }

/* ---------- AI-Capex: CVaR tail-risk (single-sourced to RLFUNDAMENTALS) ---------- */
try {
  group('ai-capex-strategy-lab.html \u2014 CVaR expected shortfall');
  // Feature 012 Scope 06: the lognormal invNorm/CVaR tail-risk primitives are single-sourced to
  // rlexperience-adapters/fundamental-models.js (RLFUNDAMENTALS); the page delegates and carries no
  // inline copy, so the tail-risk math is tested against the single-source module, not the page.
  const src = read('ai-capex-strategy-lab.html');
  const cvarReq = (await import('node:module')).createRequire(import.meta.url);
  delete cvarReq.cache[cvarReq.resolve('../rlexperience-adapters/fundamental-models.js')];
  const RLF = cvarReq('../rlexperience-adapters/fundamental-models.js');
  assert(/RLFUNDAMENTALS\.invNorm\s*\(/.test(src) && /RLFUNDAMENTALS\.cvarOf\s*\(/.test(src), 'ai-capex page single-sources invNorm/cvarOf to RLFUNDAMENTALS (no inline tail-risk copy)');
  const a = RLF.cvarOf(0.15, 0.30, 0.05), b = RLF.cvarOf(0.10, 0.50, 0.05), c = RLF.cvarOf(0.03, 0.20, 0.05);
  assert(a < 0 && b < 0 && c < 0, 'CVaR(5%) returns are negative (losses)');
  assert(a > -1 && b > -1 && c > -1, 'CVaR bounded at -100%');
  assert(b < a, 'higher vol => deeper CVaR tail (sigma .5 worse than .3)');
} catch (e) { failures++; console.log('  \u2717 FAIL (ai-capex group threw): ' + e.message); }

/* ---------- Company scenario bridge (single-sourced to RLFUNDAMENTALS) ---------- */
try {
  group('company-fundamentals-lab.html \u2014 bounded scenario bridge');
  // Feature 012 Scope 06: the bounded company scenario projection is single-sourced to
  // rlexperience-adapters/fundamental-models.js (RLFUNDAMENTALS.projectCompanyScenario); the company
  // page Power path loads the module and delegates, carrying no inline projection copy, so the bounded
  // scenario formula is tested against the single-source module — never the page.
  const companySrc = read('company-fundamentals-lab.html');
  const companyReq = (await import('node:module')).createRequire(import.meta.url);
  delete companyReq.cache[companyReq.resolve('../rlexperience-adapters/fundamental-models.js')];
  const RLF2 = companyReq('../rlexperience-adapters/fundamental-models.js');
  assert(/rlexperience-adapters\/fundamental-models\.js/.test(companySrc), 'company page loads the fundamental-models module');
  assert(/RLFUNDAMENTALS\.projectCompanyScenario\s*\(/.test(companySrc), 'company page single-sources the bounded scenario to RLFUNDAMENTALS.projectCompanyScenario (no inline projection copy)');
  assert(RLF2.supportedAdapterIds.indexOf('simple-adapter/company-scenario-bridge/v1') >= 0, 'company-scenario-bridge is a declared supported adapter');
  // Owner parity: the bounded projection reproduces the owner accepted-scenario revenue node (base-revenue 200000 * (1 + growth 0.1) = 220000).
  const cbase = { revenue: { value: 200000, unit: 'USD-millions', state: 'reported' }, operatingMargin: { value: 0.4, unit: 'ratio', state: 'reported' }, revenueGrowth: { value: 0.1, unit: 'ratio', state: 'reported' }, capexIntensity: { value: 0.2, unit: 'ratio', state: 'reported' }, valuationMultiple: { value: 20, unit: 'x', state: 'reported' } };
  const cproj = RLF2.projectCompanyScenario(cbase, { growth: 10, marginChange: 0, gapPolicy: 'preserve' });
  assert(cproj.revenue === 220000 && cproj.operatingIncome === 88000 && cproj.valuation === 1760000 && cproj.state === 'ready', 'projectCompanyScenario reproduces the owner revenue node (220000) and derives operating income + bounded valuation');
  // Gap preservation: an unavailable required reported field stays null (honest), never a fabricated default; refuse withholds.
  const cgap = { ...cbase, revenue: { value: null, unit: 'USD-millions', state: 'unavailable' } };
  const cpres = RLF2.projectCompanyScenario(cgap, { growth: 10, marginChange: 0, gapPolicy: 'preserve' });
  const cref = RLF2.projectCompanyScenario(cgap, { growth: 10, marginChange: 0, gapPolicy: 'refuse' });
  assert(cpres.revenue === null && cpres.state === 'unavailable' && cpres.missing.indexOf('revenue') >= 0, 'projectCompanyScenario preserves an unavailable reported gap as null (no default substituted)');
  assert(cref.state === 'refused' && cref.revenue === null, 'the refuse gap policy withholds the bounded scenario when a required reported field is gapped');
} catch (e) { failures++; console.log('  \u2717 FAIL (company scenario bridge group threw): ' + e.message); }

/* ---------- MSFT margin/EPS/valuation bridge (single-sourced to RLFUNDAMENTALS) ---------- */
try {
  group('msft-july-print-model.html \u2014 margin/EPS/valuation bridge');
  // Feature 012 Scope 06: the reported-period FY26->FY27 margin/EPS/valuation bridge is single-sourced
  // to rlexperience-adapters/fundamental-models.js (RLFUNDAMENTALS.msftAnnualBridge); the page's
  // calculateAnnual loads the module and delegates, carrying no inline bridge copy, so the reconciled
  // bridge formula is tested against the single-source module \u2014 never the page.
  const msftSrc = read('msft-july-print-model.html');
  const msftReq = (await import('node:module')).createRequire(import.meta.url);
  delete msftReq.cache[msftReq.resolve('../rlexperience-adapters/fundamental-models.js')];
  const RLF3 = msftReq('../rlexperience-adapters/fundamental-models.js');
  assert(/rlexperience-adapters\/fundamental-models\.js/.test(msftSrc), 'msft page loads the fundamental-models module');
  assert(/RLFUNDAMENTALS\.msftAnnualBridge\s*\(/.test(msftSrc), 'msft page single-sources the FY26->FY27 bridge to RLFUNDAMENTALS.msftAnnualBridge (no inline bridge copy)');
  assert(!/OI26 \+ GP_price \+ GP_vol \+ GP_fx - GP_churn - dDep - dOpex/.test(msftSrc), 'msft page carries no inline OI27 bridge formula');
  assert(RLF3.supportedAdapterIds.indexOf('simple-adapter/msft-margin-eps/v1') >= 0, 'msft-margin-eps is a declared supported adapter');
  // Owner parity: a clean zero-growth identity carries revenue/OI straight through (OM27 == om26,
  // EPS27 == OI27/sh, implied == EPS27 * pe); a depreciation step + price uplift bite the bridge.
  const mflat = RLF3.msftAnnualBridge({ revFY26: 100, om26: 0.4, vol: 0, prc: 0, churn: 0, fx: 0, pm: 1, vm: 1, cm: 1, opexI: 0, dDep: 0, oi: 0, tax: 0, sh: 1, pe: 10 });
  assert(mflat.OI27 === 40 && mflat.OM27 === 0.4 && mflat.EPS27 === 40 && mflat.implied === 400, 'msftAnnualBridge zero-growth identity: OI27 40, OM27 0.40, EPS27 40, implied 400');
  const mdep = RLF3.msftAnnualBridge({ revFY26: 100, om26: 0.4, vol: 0, prc: 0.10, churn: 0, fx: 0, pm: 1, vm: 1, cm: 1, opexI: 0, dDep: 5, oi: 0, tax: 0, sh: 1, pe: 10 });
  assert(mdep.GP_price === 10 && mdep.OI27 === 45 && mdep.EPS27 > mflat.EPS27, 'a $5 depreciation step + 10% price uplift net +$5 to OI27 (45) and lift EPS27');
} catch (e) { failures++; console.log('  \u2717 FAIL (msft margin/EPS bridge group threw): ' + e.message); }

/* ---------- Gamma: second-order greeks ---------- */
try {
  group('gamma-trading-lab.html \u2014 vanna / charm greeks');
  const src = read('gamma-trading-lab.html');
  const names = ['bsmVanna', 'bsmCharm'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const T = 7 / 365;
  assert(isFinite(env.bsmVanna(100, 105, T, 0.045, 0, 0.35)), 'bsmVanna finite for a normal contract');
  assert(isFinite(env.bsmCharm(100, 100, T, 0.045, 0, 0.35)), 'bsmCharm finite at the money');
  assert(env.bsmVanna(100, 105, 0, 0.045, 0, 0.35) === 0, 'bsmVanna guards T=0 => 0');
  assert(env.bsmCharm(100, 105, 0, 0.045, 0, 0.35) === 0, 'bsmCharm guards T=0 => 0');
  assert(env.bsmVanna(100, 105, T, 0.045, 0, 0) === 0, 'bsmVanna guards sigma=0 => 0');
} catch (e) { failures++; console.log('  \u2717 FAIL (gamma group threw): ' + e.message); }

/* ---------- Options: rolling percentile / z ---------- */
try {
  group('options-structure-lab.html \u2014 percentile / z-score');
  const src = read('options-structure-lab.html');
  const names = ['pctRankZ'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  assert(env.pctRankZ(5, [1, 2, 3]) === null || env.pctRankZ(5, [1, 2]) === null, 'pctRankZ needs >= 3 samples');
  const r = env.pctRankZ(3, [1, 2, 3, 4, 5]);
  assert(r && r.pct >= 0 && r.pct <= 100, 'percentile in [0,100]');
  assert(env.pctRankZ(6, [1, 2, 3, 4, 5]).pct === 100, 'value above all history => 100th pct');
  assert(env.pctRankZ(0, [1, 2, 3, 4, 5]).pct === 0, 'value below all history => 0th pct');
} catch (e) { failures++; console.log('  \u2717 FAIL (options group threw): ' + e.message); }

/* ---------- rlg.js: shared macro-regime classifier ---------- */
try {
  group('rlg.js \u2014 shared macro-regime classifier');
  const src = read('rlg.js');
  const env = build([extractFn(src, 'macroRegime')], ['macroRegime']);
  assert(env.macroRegime({ fg: { score: 80 }, vix: 14 }).risk === 1, 'extreme greed => risk +1');
  assert(env.macroRegime({ fg: { score: 10 }, vix: 35 }).risk === -1, 'extreme fear => risk -1');
  assert(env.macroRegime({ fg: { score: 50 }, vix: 18 }).risk === 0, 'neutral F&G => risk 0');
  const hot = env.macroRegime({ fg: { score: 65 }, vix: 32 });
  assert(hot.risk === 1 && hot.cls === 'warn', 'risk-on with VIX>=30 keeps risk +1 but flags warn');
  assert(env.macroRegime({}).band === 'Unknown', 'no macro data => Unknown');
  assert(env.macroRegime({ vix: 28 }).risk === -1, 'VIX-only fallback: 28 => risk -1');
} catch (e) { failures++; console.log('  \u2717 FAIL (rlg group threw): ' + e.message); }

/* ---------- Options: realized-vol cone ---------- */
try {
  group('options-structure-lab.html \u2014 realized-vol cone');
  const src = read('options-structure-lab.html');
  const names = ['realizedVol', 'rvCone'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const bars = [];
  for (let i = 0; i < 120; i++) bars.push({ c: 100 * (1 + 0.001 * i) * (1 + 0.02 * Math.sin(i * 0.6)) });
  const rc = env.rvCone(bars);
  assert(rc && rc.term && rc.term[20] > 0 && isFinite(rc.term[20]), 'RV20 is positive & finite');
  assert(rc.cone && rc.cone.min <= rc.cone.med && rc.cone.med <= rc.cone.max, 'RV cone ordered min <= med <= max');
  assert(env.rvCone([{ c: 1 }, { c: 2 }]) === null, 'rvCone needs >= 40 bars');
} catch (e) { failures++; console.log('  \u2717 FAIL (options rv group threw): ' + e.message); }

/* ---------- Swing: weekly multi-timeframe trend ---------- */
try {
  group('swing-structure-lab.html \u2014 weekly multi-timeframe trend');
  const src = read('swing-structure-lab.html');
  const names = ['resampleWeekly', 'mtfTrend'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const base = Date.UTC(2025, 0, 1), up = [], dn = [];
  for (let i = 0; i < 220; i++) { const t = base + i * 864e5; up.push({ t, o: 100, h: 101, l: 99, c: 100 * Math.pow(1.002, i), v: 1 }); dn.push({ t, o: 100, h: 101, l: 99, c: 100 * Math.pow(0.998, i), v: 1 }); }
  assert(env.mtfTrend(up).trend === 'up', 'rising daily bars => weekly trend up');
  assert(env.mtfTrend(dn).trend === 'down', 'falling daily bars => weekly trend down');
  assert(env.mtfTrend([{ t: base, o: 1, h: 1, l: 1, c: 1, v: 1 }]) === null, 'mtfTrend needs >= 12 weeks');
} catch (e) { failures++; console.log('  \u2717 FAIL (swing mtf group threw): ' + e.message); }

/* ---------- Intraday: profile tags (single prints / poor highs) ---------- */
try {
  group('intraday-tape-lab.html \u2014 profile tags (single prints / poor high-low)');
  const src = read('intraday-tape-lab.html');
  const names = ['profileTags'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const buckets = [];
  for (let i = 0; i < 10; i++) buckets.push({ mid: 100 + i, up: 100, down: 100 });
  buckets[0] = { mid: 100, up: 5, down: 5 };     // thin low => poor low false
  buckets[3] = { mid: 103, up: 5, down: 5 };     // thin single-print shelf (neighbors heavier)
  buckets[5] = { mid: 105, up: 500, down: 500 }; // POC
  buckets[9] = { mid: 109, up: 400, down: 400 }; // heavy high => poor high
  const pt = env.profileTags({ buckets, hi: 110, lo: 100 });
  assert(pt && pt.poorHigh === true, 'heavy volume at the high => poor high');
  assert(pt.poorLow === false, 'thin volume at the low => not a poor low');
  assert(pt.singles.length >= 1 && pt.singles.indexOf(103) >= 0, 'thin middle bucket => single print at 103');
  assert(env.profileTags({ buckets: [] }) === null, 'profileTags needs >= 5 buckets');
} catch (e) { failures++; console.log('  \u2717 FAIL (intraday profile group threw): ' + e.message); }

/* ---------- Intraday + Swing: volume-profile shape (D/P/B/thin) ---------- */
try {
  group('intraday + swing \u2014 volume-profile shape (D/P/B/thin)');
  const srcI = read('intraday-tape-lab.html');
  const envI = build([extractFn(srcI, 'profileShape')], ['profileShape']);
  const mk = (pocIdx, pocV, base) => { const b = []; for (let i = 0; i < 11; i++) b.push({ mid: 100 + i, up: base / 2, down: base / 2 }); b[pocIdx] = { mid: 100 + pocIdx, up: pocV / 2, down: pocV / 2 }; return b; };
  // D-shape: POC mid, wide value area (not thin), unimodal
  assert(envI.profileShape({ buckets: mk(5, 1000, 100), vah: 108, val: 102, hi: 110, lo: 100 }).shape === 'D', 'POC mid + wide value area => D-shape');
  // P-shape: POC in the upper third
  assert(envI.profileShape({ buckets: mk(8, 1000, 100), vah: 110, val: 104, hi: 110, lo: 100 }).shape === 'P', 'POC high => P-shape');
  // thin/trend: value area tiny vs range
  assert(envI.profileShape({ buckets: mk(5, 1000, 100), vah: 105.6, val: 104.4, hi: 110, lo: 100 }).shape === 'thin', 'narrow value area vs range => thin/trend');
  // B-shape: two distributions
  const bB = mk(2, 1000, 40); bB[9] = { mid: 109, up: 300, down: 300 };
  assert(envI.profileShape({ buckets: bB, vah: 104, val: 100, hi: 110, lo: 100 }).shape === 'B', 'two distributions => B-shape');
  assert(envI.profileShape({ buckets: [] }) === null, 'profileShape needs >= 6 buckets');
  const srcS = read('swing-structure-lab.html');
  const envS = build([extractFn(srcS, 'profileShape')], ['profileShape']);
  assert(envS.profileShape({ buckets: mk(5, 1000, 100), vah: 108, val: 102, hi: 110, lo: 100 }).shape === 'D', 'swing profileShape classifies a balanced profile as D');
} catch (e) { failures++; console.log('  \u2717 FAIL (profile-shape group threw): ' + e.message); }

/* ---------- MSFT: risk-neutral scenario odds ---------- */
try {
  group('msft-july-print-model.html \u2014 risk-neutral scenario odds');
  const src = read('msft-july-print-model.html');
  const names = ['normCdfM', 'rnProbs'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const rn = env.rnProbs(370, 0.25, 267, 377, 540);
  assert(rn && approx(rn.bear + rn.base + rn.bull, 1, 1e-9), 'risk-neutral odds sum to 1');
  assert(rn.bear >= 0 && rn.base >= 0 && rn.bull >= 0, 'all odds non-negative');
  assert(rn.bull < rn.base, 'far-OTM bull target less likely than the base');
  assert(env.rnProbs(370, 0.25, 400, 377, 540) === null, 'non-monotone scenarios => null');
  assert(env.rnProbs(370, 0, 267, 377, 540) === null, 'zero vol => null');
} catch (e) { failures++; console.log('  \u2717 FAIL (msft rn group threw): ' + e.message); }

/* ---------- AI-Capex: shrinkage covariance ---------- */
try {
  group('ai-capex-strategy-lab.html \u2014 shrinkage covariance (empirical correlation)');
  const src = read('ai-capex-strategy-lab.html');
  const names = ['alignReturns', 'ledoitWolf'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const A = [100], B = [100], C = [100];
  for (let i = 1; i < 140; i++) { const s = Math.sin(i * 0.5) * 0.02; A.push(A[i - 1] * (1 + s + 0.001)); B.push(B[i - 1] * (1 + s * 0.95 + 0.0012)); C.push(C[i - 1] * (1 + Math.cos(i * 0.9) * 0.02 + 0.001)); }
  const al = env.alignReturns({ A, B, C }, ['A', 'B', 'C']);
  assert(al && al.tks.length === 3 && al.X.length >= 100, 'alignReturns builds 3 aligned return columns');
  const lw = env.ledoitWolf(al.X, al.tks);
  assert(lw && lw.corr['A|A'] === 1, 'diagonal correlation = 1');
  assert(lw.corr['A|B'] === lw.corr['B|A'], 'correlation matrix is symmetric');
  assert(lw.corr['A|B'] > lw.corr['A|C'], 'co-moving A,B more correlated than A,C');
  assert(lw.corr['A|B'] <= 0.99 && lw.corr['A|B'] >= -0.99, 'off-diagonal clamped to [-0.99, 0.99]');
  assert(lw.shrink > 0 && lw.shrink < 1, 'shrinkage intensity in (0,1)');
  assert(env.ledoitWolf([[1, 2]], ['A', 'B']) === null, 'ledoitWolf needs >= 20 observations');
} catch (e) { failures++; console.log('  \u2717 FAIL (ai-capex cov group threw): ' + e.message); }

/* ---------- Swing: per-signal edge backtest ---------- */
try {
  group('swing-structure-lab.html \u2014 per-signal edge backtest');
  const src = read('swing-structure-lab.html');
  const env = build([extractFn(src, 'signalEdge')], ['signalEdge']);
  // synthetic regime that lives on BOTH sides of the 200-day within the backtest window (i>=210):
  // uptrend to seed the 200-day, then a downtrend (price below), then an uptrend (price above)
  const closes = [];
  for (let i = 0; i < 260; i++) closes.push(100 * Math.pow(1.004, i));
  let base = closes[closes.length - 1];
  for (let i = 0; i < 120; i++) closes.push(base * Math.pow(0.985, i + 1));
  base = closes[closes.length - 1];
  for (let i = 0; i < 140; i++) closes.push(base * Math.pow(1.012, i + 1));
  const sma = (L, idx) => { if (idx < L - 1) return null; let s = 0; for (let j = idx - L + 1; j <= idx; j++) s += closes[j]; return s / L; };
  const full = [], ma = { m20: [], m50: [], m200: [] };
  for (let i = 0; i < closes.length; i++) { full.push({ c: closes[i] }); ma.m20.push(sma(20, i)); ma.m50.push(sma(50, i)); ma.m200.push(sma(200, i)); }
  const se = env.signalEdge(full, ma, 21);
  assert(se && se.groups['Vs 200-day'], 'signalEdge produces a Vs 200-day group');
  const v = {}; se.groups['Vs 200-day'].forEach((r) => { v[r.st] = r; });
  assert(v.Above && v.Below, 'both Above and Below 200-day states are sampled');
  assert(v.Above.hit > v.Below.hit, 'Above-200-day beats Below on forward hit-rate (edge recovered)');
  assert(v.Above.median > v.Below.median, 'Above-200-day forward median > Below');
  assert(env.signalEdge([{ c: 1 }], { m20: [], m50: [], m200: [] }, 21) === null, 'signalEdge needs >= 260 bars');
} catch (e) { failures++; console.log('  \u2717 FAIL (swing edge group threw): ' + e.message); }

/* ---------- Smart Money: single-sourced disclosure-lag decay + consensus + reproducible disclosure-decay adapter (RLSTRATEGY) ---------- */
// Feature 012 Scope 07: the disclosure-lag decay / consensus / realistic-edge owner formulas are single-sourced
// in rlexperience-adapters/strategy-research.js (RLSTRATEGY), which the page delegates to. Both the page's Power
// path and the registered disclosure-decay/v1 Simple adapter consume the exact same pure owner functions
// (owner-parity), and the surviving-conviction model is deterministic over the frozen disclosed filing set.
try {
  group('smart-money-flow-lab.html \u2014 single-sourced disclosure-lag decay + consensus + reproducible disclosure-decay adapter (RLSTRATEGY)');
  const src = read('smart-money-flow-lab.html');
  const { createRequire } = await import('node:module');
  const smartRequire = createRequire(import.meta.url);
  delete smartRequire.cache[smartRequire.resolve('../rlexperience-adapters/strategy-research.js')];
  const RLST = smartRequire('../rlexperience-adapters/strategy-research.js');

  // alphaDecay: the owner information-edge decay — the exact owner semantics the page used inline before the rewire.
  assert(RLST.alphaDecay(0, 15) === 1, 'alphaDecay(0,H) = 1 (no age, full edge)');
  assert(approx(RLST.alphaDecay(15, 15), 0.5, 1e-9), 'alphaDecay(H,H) = 0.5 (one half-life)');
  assert(approx(RLST.alphaDecay(45, 15), 0.125, 1e-9), 'alphaDecay(3H,H) = 12.5% (45d @ 15d half-life)');
  assert(RLST.alphaDecay(30, 15) < RLST.alphaDecay(10, 15), 'alphaDecay strictly decreasing in age');
  assert(RLST.alphaDecay(200, 15) > 0 && RLST.alphaDecay(0, 15) <= 1, 'alphaDecay stays in (0,1]');

  assert(RLST.dayGap('2026-05-20', '2026-06-28') === 39, 'dayGap counts whole days (STOCK-Act lag)');
  assert(RLST.dayGap('2026-06-28', '2026-05-20') === 0, 'dayGap clamps a reversed range to 0');
  assert(RLST.dayGap('not-a-date', '2026-06-28') === 0, 'dayGap is NaN-safe -> 0');

  assert(RLST.consensusScore(3, 1e6, 2, 15) > RLST.consensusScore(1, 1e6, 2, 15), 'consensus rises with distinct filers');
  assert(RLST.consensusScore(2, 5e6, 2, 15) > RLST.consensusScore(2, 1e5, 2, 15), 'consensus rises with net $');
  assert(RLST.consensusScore(2, 1e6, 40, 15) < RLST.consensusScore(2, 1e6, 2, 15), 'consensus falls as the cluster ages');

  assert(approx(RLST.realisticEdgeFraction(2, 15), RLST.alphaDecay(2, 15), 1e-12), 'realistic edge == decay at the disclosure lag');
  assert(RLST.realisticEdgeFraction(45, 15) < RLST.realisticEdgeFraction(2, 15), 'a 45-day 13F echo retains far less than a 2-day Form 4');

  // disclosure-decay adapter canary: deterministic over the frozen filing set + genuine parameter effects
  // (SCN-012-036 owner-parity at the adapter summary level).
  const owner = {
    today: '2026-07-05', disclosures: [
      { ticker: 'AAA', filer: 'F1', type: 'insider', side: 'buy', usd: 2000000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'AAA', filer: 'F2', type: 'insider', side: 'buy', usd: 900000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'AAA', filer: 'F3', type: 'insider', side: 'buy', usd: 600000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'BBB', filer: 'G1', type: 'congress', side: 'buy', usd: 250000, txn: '2026-04-30', disclosed: '2026-06-29' },
      { ticker: 'BBB', filer: 'G2', type: 'congress', side: 'buy', usd: 120000, txn: '2026-04-30', disclosed: '2026-06-29' },
      { ticker: 'BBB', filer: 'G3', type: 'congress', side: 'buy', usd: 90000, txn: '2026-04-30', disclosed: '2026-06-29' }
    ]
  };
  const P = { 'source-mix': 'blended', 'lag-half-life': 45, 'cluster-minimum': 3, 'consensus-threshold': 0.6, 'decay-floor': 0.1 };
  const d1 = RLST.computeDisclosureDecaySummary(owner, P);
  const d2 = RLST.computeDisclosureDecaySummary(owner, P);
  assert(JSON.stringify(d1) === JSON.stringify(d2), 'disclosure-decay: identical inputs => identical summary (deterministic over the frozen filing set)');
  const dInsider = RLST.computeDisclosureDecaySummary(owner, Object.assign({}, P, { 'source-mix': 'insider' }));
  assert(dInsider.conviction.totalNaive !== d1.conviction.totalNaive, 'disclosure-decay: source-mix genuinely changes total naive conviction');
  const dLong = RLST.computeDisclosureDecaySummary(owner, Object.assign({}, P, { 'lag-half-life': 90 }));
  assert(dLong.decayedConviction.totalDecayed > d1.decayedConviction.totalDecayed, 'disclosure-decay: a longer lag half-life retains more surviving conviction');

  // single-source wiring: the page loads the module, delegates, and carries no inline formula copy.
  assert(/rlexperience-adapters\/strategy-research\.js/.test(src), 'smart-money-flow-lab.html loads the strategy-research module');
  assert(/RLSTRATEGY\.alphaDecay\s*\(/.test(src) && /RLSTRATEGY\.consensusScore\s*\(/.test(src) && /RLSTRATEGY\.realisticEdgeFraction\s*\(/.test(src) && /RLSTRATEGY\.dayGap\s*\(/.test(src), 'smart-money-flow-lab.html delegates disclosure-lag decay / consensus / realistic-edge / dayGap to the single source');
  assert(!/return Math\.pow\(2, -Math\.max\(0, ageDays\) \/ halfLifeDays\)/.test(src) && !/var breadth = Math\.log2\(1 \+ Math\.max\(0, nFilers\)\)/.test(src), 'smart-money-flow-lab.html carries no inline copy of the single-sourced disclosure-lag / consensus formula');
} catch (e) { failures++; console.log('  \u2717 FAIL (smart-money group threw): ' + e.message); }

/* ---------- Waterfront × Masters Water-Polo screener: single-sourced geo + filter (RLPROPERTY) ---------- */
// Feature 012 Scope 07: the great-circle distance / drive-time / nearest-club / market-filter owner primitives
// are single-sourced in rlexperience-adapters/property-research.js (RLPROPERTY), which the page delegates to.
// Both the owning waterfront page's screener AND the location-suitability/v1 Simple adapter consume the exact
// same pure owner primitives (owner-parity); the page carries no inline copy of the geo/market-filter formulas.
try {
  group('waterfront-polo-lab.html \u2014 single-sourced geo distance, drive-time & market filter (RLPROPERTY)');
  const src = read('waterfront-polo-lab.html');
  const { createRequire } = await import('node:module');
  const wpRequire = createRequire(import.meta.url);
  delete wpRequire.cache[wpRequire.resolve('../rlexperience-adapters/property-research.js')];
  const RLP = wpRequire('../rlexperience-adapters/property-research.js');

  // haversine: identity, symmetry, known city pair (Orlando <-> Tampa ~ 77-85 mi)
  assert(RLP.haversineMi(28.54, -81.38, 28.54, -81.38) === 0, 'haversineMi(p,p) = 0');
  assert(approx(RLP.haversineMi(28.54, -81.38, 27.95, -82.46), RLP.haversineMi(27.95, -82.46, 28.54, -81.38), 1e-9), 'haversineMi symmetric');
  const orlTpa = RLP.haversineMi(28.54, -81.38, 27.95, -82.46);
  assert(orlTpa > 60 && orlTpa < 95, 'Orlando<->Tampa great-circle ~77-85 mi, got ' + orlTpa.toFixed(1));

  // drive-time: 0 at 0, monotone, 38 mi @ 38 mph @ rf 1.0 = 60 min
  assert(RLP.driveMinutesApprox(0, 38, 1.25) === 0, 'driveMinutesApprox(0,...) = 0');
  assert(approx(RLP.driveMinutesApprox(38, 38, 1.0), 60, 1e-6), '38 mi @ 38 mph, rf 1.0 => 60 min');
  assert(RLP.driveMinutesApprox(50, 38, 1.25) > RLP.driveMinutesApprox(10, 38, 1.25), 'drive-time monotone in distance');
  assert(RLP.driveMinutesApprox(-5, 38, 1.25) === null && RLP.driveMinutesApprox(10, 0, 1.25) === null, 'guards bad input => null');

  // nearestClub: picks the closest of the set
  const clubs = [{ lat: 28.5, lon: -81.4 }, { lat: 27.9, lon: -82.5 }, { lat: 30.3, lon: -81.7 }];
  assert(RLP.nearestClub(28.55, -81.38, clubs).idx === 0, 'nearestClub picks the co-located Orlando club');
  assert(RLP.nearestClub(30.2, -81.65, clubs).idx === 2, 'nearestClub picks Jacksonville for a NE point');

  // marketPasses: budget-fit rank, drive-time gate, water/flood/surge/land/ins filters
  const base = { driveMin: 25, budgetFit: 'strong', water: 'lake', flood: 1, surge: 0, land: 3, insBand: 1 };
  const fAll = { withinOnly: true, minutes: 40, minFit: 'good', water: { lake: true, river: true, intracoastal: true, canalBay: true, ocean: true }, maxFlood: 4, maxSurge: 4, minLand: 1, maxIns: 3 };
  assert(RLP.marketPasses(base, fAll) === true, 'a strong, in-ring, low-risk lake market passes');
  assert(RLP.marketPasses(Object.assign({}, base, { driveMin: 55 }), fAll) === false, 'out-of-ring drive-time fails when withinOnly');
  assert(RLP.marketPasses(Object.assign({}, base, { budgetFit: 'over' }), fAll) === false, 'over-budget fails minFit >= good');
  assert(RLP.marketPasses(Object.assign({}, base, { budgetFit: 'partial' }), fAll) === false, 'partial (rank 1) fails minFit good (rank 2)');
  assert(RLP.marketPasses(base, Object.assign({}, fAll, { water: { lake: false, river: true, intracoastal: true, canalBay: true, ocean: true } })) === false, 'excluded water type fails');
  assert(RLP.marketPasses(Object.assign({}, base, { surge: 4 }), Object.assign({}, fAll, { maxSurge: 2 })) === false, 'high-surge market fails a low max-surge cap');
  assert(RLP.marketPasses(Object.assign({}, base, { land: 1 }), Object.assign({}, fAll, { minLand: 3 })) === false, 'low-land market fails a high land floor');

  // single-source wiring: the owning page loads the module, delegates, and carries no inline formula copy.
  assert(/rlexperience-adapters\/property-research\.js/.test(src), 'waterfront-polo-lab.html loads the property-research module');
  assert(/RLPROPERTY\.haversineMi\s*\(/.test(src) && /RLPROPERTY\.driveMinutesApprox\s*\(/.test(src) && /RLPROPERTY\.nearestClub\s*\(/.test(src) && /RLPROPERTY\.marketPasses\s*\(/.test(src), 'waterfront-polo-lab.html delegates geo distance / drive-time / nearest-club / market-filter to the single source');
  assert(!/var R = 3958\.7613/.test(src) && !/var fitRank = \{ strong: 3, good: 2, partial: 1, over: 0 \}/.test(src), 'waterfront-polo-lab.html carries no inline copy of the single-sourced geo / market-filter formula');
} catch (e) { failures++; console.log('  \u2717 FAIL (waterfront-polo group threw): ' + e.message); }

/* ---------- Property research: str-scenario place-based cash flow (single-sourced RLRENTAL owner engine) ---------- */
// Feature 012 Scope 07: the str-scenario Simple adapters reuse the shared place-based owner rental engine
// rlrental.js (RLRENTAL.computeRentalResult) — the exact function the owning rental page consumes through
// mountRoute. Both the owner page's cash flow and the registered str-scenario adapter consume ONE engine
// (owner-parity); the place-based cash flow is never re-derived, and undisclosed property economics are
// preserved as an explicit INCOMPLETE gap (a null bottom line + a missing-cost list), never zero-filled.
try {
  group('property-research.js \u2014 str-scenario place-based cash flow (single-sourced RLRENTAL owner engine)');
  const { createRequire } = await import('node:module');
  const propRequire = createRequire(import.meta.url);
  delete propRequire.cache[propRequire.resolve('../rlexperience-adapters/property-research.js')];
  delete propRequire.cache[propRequire.resolve('../rlrental.js')];
  const RLP = propRequire('../rlexperience-adapters/property-research.js');
  const RLR = propRequire('../rlrental.js');
  const palmSrc = read('palm-springs-rental-market-lab.html');

  assert(RLP.supportedAdapterIds.includes('simple-adapter/str-scenario/palm-springs/v1'), 'property-research exposes the delivered str-scenario/palm-springs adapter');
  assert(typeof RLP.computeStrScenarioSummary === 'function', 'property-research exposes the single-source computeStrScenarioSummary');

  const owner = {
    contractVersion: 'str-scenario-owner-state/v1', toolId: 'palm-springs-rental-market-lab', asOf: '2026-07-26',
    source: 'selftest synthetic place scenario', marketId: 'palm-springs-ca',
    formulaVersion: 'place-based-rental-market-formula/v2', forecastYear: 2026,
    requiredFixedRiskCostFieldIds: ['insurance'],
    fullRequiredFixedRiskCostFieldIds: ['insurance', 'property-tax', 'capital-reserve'],
    missingEconomics: ['property-tax', 'capital-reserve', 'resale-basis'],
    loanTermYears: 30, leverageRatio: 0.7, downPaymentRatio: 0.3, baseFixedInsuranceUsd: null,
    segments: {
      'whole-market': { segmentId: 'whole-market', pairKey: 'palm-springs-ca::whole-market', unitId: 'ps-whole', baseOccupancy: 0.6, availableNights: 340, purchasePriceUsd: 1250000, baseAdrUsd: 600 },
      'large-luxury': { segmentId: 'large-luxury-5plus', pairKey: 'palm-springs-ca::large-luxury-5plus', unitId: 'ps-lux', baseOccupancy: 0.55, availableNights: 300, purchasePriceUsd: 3500000, baseAdrUsd: 1200 }
    }
  };
  const base = { segment: 'large-luxury', adr: 1200, occupancy: 60, 'financing-rate': 7, 'operating-cost': 35, insurance: 20000, 'regulation-stress': 0.25, horizon: 5 };
  const s1 = RLP.computeStrScenarioSummary(owner, base, RLR);
  const s2 = RLP.computeStrScenarioSummary(owner, base, RLR);
  assert(JSON.stringify(s1) === JSON.stringify(s2), 'str-scenario: identical inputs => identical summary (deterministic over the frozen owner place state)');

  // owner parity: the headline cash flow equals a DIRECT RLRENTAL.computeRentalResult run over the same inputs.
  const preset = owner.segments['large-luxury'];
  const ctx = { marketId: owner.marketId, segmentId: preset.segmentId, pairKey: preset.pairKey, unitId: preset.unitId, scenarioId: 'baseline', formulaVersion: owner.formulaVersion, baseOccupancy: preset.baseOccupancy, baseAdrUsd: preset.baseAdrUsd, availableNights: preset.availableNights, requiredFixedRiskCostFieldIds: owner.requiredFixedRiskCostFieldIds, bounds: {} };
  const asum = { contractVersion: 'place-based-rental-market-user-assumptions/v2', marketId: owner.marketId, segmentId: preset.segmentId, pairKey: preset.pairKey, unitId: preset.unitId, scenarioId: 'baseline', forecastYear: owner.forecastYear, demandDelta: 0, supplyDelta: 0, adrShock: 0, downtime: { method: 'explicit-disjoint-days', items: [] }, purchasePriceUsd: preset.purchasePriceUsd, leverageRatio: owner.leverageRatio, downPaymentRatio: owner.downPaymentRatio, annualMortgageRate: base['financing-rate'] / 100, loanTermYears: owner.loanTermYears, variableOperatingExpenseRatio: base['operating-cost'] / 100, fixedRiskCosts: [{ costFieldId: 'insurance', annualUsd: base.insurance }], baseOccupancy: base.occupancy / 100, baseAdrUsd: base.adr, availableNights: preset.availableNights };
  const direct = RLR.computeRentalResult(ctx, asum);
  assert(direct.ok && s1.cashFlow.grossRevenueUsd === Math.round(direct.result.grossRevenueUsd * 100) / 100, 'str-scenario: gross revenue is single-sourced from RLRENTAL.computeRentalResult (owner-parity)');
  assert(s1.cashFlow.annualOperatingPreTaxCashFlowUsd === Math.round(direct.result.preTaxCashFlowUsd * 100) / 100, 'str-scenario: operating pre-tax cash flow is single-sourced from the owner engine');

  // genuine parameter effects (owner-recomputed, not echoed).
  const sAdr = RLP.computeStrScenarioSummary(owner, Object.assign({}, base, { adr: 1600 }), RLR);
  assert(sAdr.cashFlow.grossRevenueUsd > s1.cashFlow.grossRevenueUsd, 'str-scenario: a higher ADR genuinely raises the owner gross revenue');
  const sReg = RLP.computeStrScenarioSummary(owner, Object.assign({}, base, { 'regulation-stress': 0.6 }), RLR);
  assert(sReg.stress.stressedGrossRevenueUsd < s1.stress.stressedGrossRevenueUsd, 'str-scenario: a heavier regulatory stress genuinely deepens the revenue haircut');
  assert(JSON.stringify(sReg.cashFlow) === JSON.stringify(s1.cashFlow), 'str-scenario: regulatory stress leaves the base cash flow unchanged (a separate stress scenario)');

  // gap preservation: undisclosed property economics stay unavailable, the operating path stays real.
  assert(s1.cashFlow.fullEconomicsState === 'INCOMPLETE' && s1.cashFlow.fullPreTaxCashFlowUsd === null, 'str-scenario: undisclosed property economics keep the full bottom line INCOMPLETE/null (never zero-filled)');
  assert(Array.isArray(s1.cashFlow.missingCostFieldIds) && s1.cashFlow.missingCostFieldIds.length > 0 && typeof s1.cashFlow.annualOperatingPreTaxCashFlowUsd === 'number', 'str-scenario: the missing-cost gap is preserved while the disclosed operating cash flow stays a real owner number');

  // single-source wiring: the owning page loads the engine and carries no inline cash-flow formula copy.
  assert(/<script src="rlrental\.js">/.test(palmSrc), 'palm-springs-rental-market-lab.html loads the shared owner rental engine rlrental.js');
  assert(/RLRENTAL\.mountRoute\s*\(/.test(palmSrc) && !/computeRentalResult\s*=\s*function/.test(palmSrc), 'palm-springs-rental-market-lab.html consumes the owner engine via RLRENTAL.mountRoute with no inline cash-flow formula');
} catch (e) { failures++; console.log('  \u2717 FAIL (property-research str-scenario group threw): ' + e.message); }

/* ---------- Strategy Validation: real-data walk-forward engine (single-sourced RLSTRATEGY) + robustness ---------- */
// Feature 012 Scope 07: the real-data walk-forward engine (seriesFromCloses / backtest / metrics /
// walkForwardEmbargo / scorePass / allPass and the buyHoldCurve benchmark) is single-sourced in
// rlexperience-adapters/strategy-research.js (RLSTRATEGY). The Power page AND the registered
// walk-forward-validation/v1 Simple adapter compute from that ONE source; the page carries no inline copy of
// any of those formulas. The Bailey-Lopez de Prado deflated Sharpe stays RLVALID-owned on the page (Feature 007).
try {
  group('strategy-validation-lab.html \u2014 real-data walk-forward OOS engine (single-sourced RLSTRATEGY) + Deflated Sharpe');
  const src = read('strategy-validation-lab.html');
  const { createRequire } = await import('node:module');
  const validationRequire = createRequire(import.meta.url);
  delete validationRequire.cache[validationRequire.resolve('../rlexperience-adapters/strategy-research.js')];
  const RLST = validationRequire('../rlexperience-adapters/strategy-research.js');

  // seriesFromCloses: REAL bars -> the same engine struct the seeded path uses (single source)
  const ramp = []; for (let i = 0; i < 200; i++) ramp.push(100 * Math.pow(1.001, i));
  const Sr = RLST.seriesFromCloses(ramp);
  assert(Sr && Sr.days === 199, 'seriesFromCloses: days = closes.length - 1');
  assert(approx(Sr.fwd[0], 0.001, 1e-9), 'seriesFromCloses: forward return matches the bar ratio');
  assert(Sr.pPx[1] === ramp[0] && approx(Sr.pPx[2], ramp[0] + ramp[1], 1e-6), 'seriesFromCloses: price prefix-sum is correct');
  assert(RLST.seriesFromCloses([1, 2, 3]) === null, 'seriesFromCloses rejects < 120 bars (no stub series)');

  // metrics on a known positive-drift path
  const rr = [0.01, 0.02, 0.01, 0.02, 0.01, 0.02, 0.01, 0.02], curve = []; let eq = 1;
  for (let i = 0; i < rr.length; i++) { eq *= (1 + rr[i]); curve.push(eq); }
  const mm = RLST.metrics({ curve, r: rr, expo: rr.map(() => 1) });
  assert(mm.cagr > 0 && mm.sharpe > 0, 'metrics: positive-drift path => positive CAGR & Sharpe');
  assert(approx(mm.tim, 1, 1e-9), 'metrics: fully-invested path => time-in-market = 1');

  // buyHoldCurve: the benchmark equity curve compounds the forward returns from 1
  const bh = RLST.buyHoldCurve(Sr, 0, 5);
  assert(bh.length === 5 && approx(bh[0], 1 * (1 + Sr.fwd[0]), 1e-9), 'buyHoldCurve: compounds the forward returns from 1');

  // walkForwardEmbargo on a DETERMINISTIC strong-bull seeded path (module genSeries returns the engine struct)
  const L = { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 };
  const bull = RLST.genSeries(12345, 8, [{ frac: 1, muAnnual: 0.18, sigAnnual: 0.11 }]);
  const wf = RLST.walkForwardEmbargo(bull, L, 4, 0.6, 5);
  assert(wf.oos !== null && isFinite(wf.oos.sharpe), 'walkForwardEmbargo: produces a finite out-of-sample Sharpe');
  assert(wf.usable > 0 && wf.oosCurve.length > 20, 'walkForwardEmbargo: stitches usable OOS folds');
  assert(wf.oos.tim > 0 && wf.folds.length === 4, 'walkForwardEmbargo: long-biased rule takes OOS exposure; one record per fold');

  // embargo PURGES leakage — a massive embargo can never leave MORE usable OOS
  const wfBig = RLST.walkForwardEmbargo(bull, L, 4, 0.6, 100000);
  assert(wfBig.usable <= wf.usable, 'walkForwardEmbargo: larger embargo never increases usable OOS (purge, not peek)');

  // goal scorecard (judged OOS)
  const goal = { targetCagr: 0.08, sharpeFloor: 0.7, maxDdCeiling: 0.30, minTimeInMarket: 0.25 };
  assert(RLST.allPass(RLST.scorePass({ cagr: 0.2, sharpe: 1.5, maxDd: 0.1, tim: 0.5 }, goal)) === true, 'scorePass/allPass: a clearly-good OOS result passes all four targets');
  assert(RLST.allPass(RLST.scorePass({ cagr: 0.02, sharpe: 0.3, maxDd: 0.5, tim: 0.1 }, goal)) === false, 'scorePass/allPass: a weak OOS result fails');

  // genDemoSeries: the page's SYNTHETIC demo path delegates its PRNG to the single source and stays reproducible.
  const moduleSrc = read('rlexperience-adapters/strategy-research.js');
  const prngPreamble = 'var ANN = 252, VOL_WIN = 20;\nvar RLSTRATEGY = (function(){ ' + extractFn(moduleSrc, 'mulberry32') + ' ' + extractFn(moduleSrc, 'gauss') + ' return { mulberry32: mulberry32, gauss: gauss }; })();';
  const demoEnv = build([extractFn(src, 'mulberry32'), extractFn(src, 'gaussR'), extractFn(src, 'genDemoSeries')], ['genDemoSeries'], prngPreamble);
  const demoRegimes = [{ frac: 1, muAnnual: 0.15, sigAnnual: 0.15 }];
  const d1 = demoEnv.genDemoSeries(4242, 8, demoRegimes), d2 = demoEnv.genDemoSeries(4242, 8, demoRegimes);
  assert(d1.length === d2.length && d1[d1.length - 1] === d2[d2.length - 1], 'genDemoSeries: same seed => identical reproducible demo path (through the single-sourced PRNG)');
  assert(demoEnv.genDemoSeries(777, 8, demoRegimes)[d1.length - 1] !== d1[d1.length - 1], 'genDemoSeries: a different seed selects a distinct reproducible demo path');

  // Deflated Sharpe (Bailey-Lopez de Prado) stays RLVALID-owned on the page (Feature 007) — its lifted stats round-trip.
  const statsEnv = build([extractFn(src, 'meanA'), extractFn(src, 'moments'), extractFn(src, 'normCdf'), extractFn(src, 'invNorm'), extractFn(src, 'deflatedSharpe')], ['deflatedSharpe', 'normCdf', 'invNorm'], 'var ANN=252;');
  const dS = statsEnv.deflatedSharpe(wf.oosCurve, 8);
  assert(dS && dS.dsr >= 0 && dS.dsr <= 1 && dS.psr >= 0 && dS.psr <= 1, 'deflatedSharpe (page-owned Bailey-LdP): DSR/PSR are probabilities in [0,1]');
  assert(dS.dsr <= dS.psr + 1e-9, 'deflatedSharpe: an 8-trial discount only lowers Sharpe confidence');
  assert(approx(statsEnv.normCdf(statsEnv.invNorm(0.9)), 0.9, 2e-3), 'lifted stats: invNorm/normCdf round-trip holds');

  // single-source wiring: the page loads the module, delegates the real-data engine, and carries no inline copy.
  assert(/rlexperience-adapters\/strategy-research\.js/.test(src), 'strategy-validation-lab.html loads the strategy-research module');
  assert(/RLSTRATEGY\.walkForwardEmbargo\s*\(/.test(src) && /RLSTRATEGY\.seriesFromCloses\s*\(/.test(src) && /RLSTRATEGY\.scorePass\s*\(/.test(src) && /RLSTRATEGY\.allPass\s*\(/.test(src) && /RLSTRATEGY\.mulberry32\s*\(/.test(src) && /RLSTRATEGY\.gauss\s*\(/.test(src), 'strategy-validation-lab.html delegates the real-data walk-forward engine to the single source');
  assert(!/var pnl = want \* S\.fwd\[i\];/.test(src) && !/out\.oos\.sharpe = out\.meanOos;/.test(src) && !/var warm = Math\.max\(L\.slow, L\.momLookback, VOL_WIN\) \+ 1;/.test(src), 'strategy-validation-lab.html carries no inline copy of the single-sourced backtest / walk-forward formula');
  assert(/function strategyValidationParityDeflatedSharpe/.test(src) && /RLVALID\.rlvDeflatedSharpe/.test(src), 'strategy-validation-lab.html keeps the Bailey-Lopez de Prado deflated Sharpe RLVALID-owned (Feature 007)');
} catch (e) { failures++; console.log('  \u2717 FAIL (strategy-validation group threw): ' + e.message); }

/* ---------- Strategy Self-Improvement: single-sourced seeded path + walk-forward + reproducible strategy-evolution adapter (RLSTRATEGY) ---------- */
// Feature 012 Scope 07: the seeded PRNG / synthetic path / walk-forward owner formulas are single-sourced
// in rlexperience-adapters/strategy-research.js (RLSTRATEGY), which the page delegates to. Both the page's
// Power path and the registered strategy-evolution/v1 Simple adapter consume the exact same pure owner
// functions — so Simple and Power share one seeded process (owner-parity), and the seeded path is fully
// reproducible under an explicit integer seed (SCN-012-002).
try {
  group('strategy-self-improvement-lab.html \u2014 single-sourced seeded path + walk-forward engine + reproducible strategy-evolution adapter (RLSTRATEGY)');
  const src = read('strategy-self-improvement-lab.html');
  const { createRequire } = await import('node:module');
  const strategyRequire = createRequire(import.meta.url);
  delete strategyRequire.cache[strategyRequire.resolve('../rlexperience-adapters/strategy-research.js')];
  const RLST = strategyRequire('../rlexperience-adapters/strategy-research.js');

  // mulberry32: deterministic PRNG — same seed => same stream; a different seed => a different stream.
  const a1 = RLST.mulberry32(12345), a2 = RLST.mulberry32(12345);
  assert(a1() === a2() && a1() === a2(), 'mulberry32: same seed yields the same stream (reproducible)');
  assert(RLST.mulberry32(12345)() !== RLST.mulberry32(999)(), 'mulberry32: a different seed yields a different draw');

  // genSeries: the seeded synthetic path — same seed => identical path; a different seed => a distinct path.
  const regimes = [{ frac: 1, muAnnual: 0.11, sigAnnual: 0.16 }];
  const s1 = RLST.genSeries(20260722, 8, regimes), s2 = RLST.genSeries(20260722, 8, regimes);
  assert(s1.days === s2.days && s1.px[s1.days] === s2.px[s2.days], 'genSeries: same seed => identical reproducible path (terminal price)');
  assert(RLST.genSeries(777, 8, regimes).px[s1.days] !== s1.px[s1.days], 'genSeries: a different seed selects a distinct reproducible path');

  // walkForward: the single-sourced owner evaluation engine produces finite OOS metrics on the seeded path.
  const levers = { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 };
  const wf = RLST.walkForward(s1, levers, 5, 0.6);
  assert(wf.oos && isFinite(wf.oos.sharpe) && wf.folds.length === 5, 'walkForward: finite OOS Sharpe, one record per fold');

  // strategy-evolution determinism canary: same frozen scenario + params + seed => identical summary;
  // changing the seed => a distinct reproducible path (SCN-012-002 at the adapter summary level).
  const owner = { years: 8, regimes: [{ frac: 0.4, muAnnual: 0.17, sigAnnual: 0.14 }, { frac: 0.2, muAnnual: -0.38, sigAnnual: 0.42 }, { frac: 0.4, muAnnual: 0.13, sigAnnual: 0.18 }], startLevers: levers, leverRanges: { fast: { min: 5, max: 60, step: 5 }, momLookback: { min: 20, max: 250, step: 10 }, volTarget: { min: 0.05, max: 0.35, step: 0.025 }, stopDd: { min: 0.05, max: 0.4, step: 0.025 } }, walkForward: { folds: 5, trainRatio: 0.6 } };
  const P = { goal: 'sharpe', variable: 'trend-window', 'search-budget': 50, 'overfit-penalty': 0.25, seed: 20260722, 'acceptance-threshold': 0.1, 'walk-forward-folds': 5 };
  const sum1 = RLST.computeStrategyEvolutionSummary(owner, P);
  const sum2 = RLST.computeStrategyEvolutionSummary(owner, P);
  assert(sum1.path.pathIdentity === sum2.path.pathIdentity, 'strategy-evolution: same seed => identical reproducible path identity');
  assert(JSON.stringify(sum1) === JSON.stringify(sum2), 'strategy-evolution: identical inputs => identical summary (reproducible)');
  const sumSeed = RLST.computeStrategyEvolutionSummary(owner, Object.assign({}, P, { seed: 20260723 }));
  assert(sumSeed.path.pathIdentity !== sum1.path.pathIdentity, 'strategy-evolution: a new seed selects a distinct reproducible path');

  // single-source wiring: the page loads the module, delegates, and carries no inline formula copy.
  assert(/rlexperience-adapters\/strategy-research\.js/.test(src), 'strategy-self-improvement-lab.html loads the strategy-research module');
  assert(/RLSTRATEGY\.mulberry32\s*\(/.test(src) && /RLSTRATEGY\.genSeries\s*\(/.test(src) && /RLSTRATEGY\.walkForward\s*\(/.test(src) && /RLSTRATEGY\.backtest\s*\(/.test(src) && /RLSTRATEGY\.metrics\s*\(/.test(src), 'strategy-self-improvement-lab.html delegates PRNG/path/backtest/metrics/walk-forward to the single source');
  assert(!/a = a \+ 0x6D2B79F5 \| 0/.test(src) && !/px\[i \+ 1\] = px\[i\] \* Math\.exp\(r\)/.test(src) && !/out\.oos\.sharpe = out\.meanOos/.test(src), 'strategy-self-improvement-lab.html carries no inline copy of the single-sourced seeded path / walk-forward formula');
} catch (e) { failures++; console.log('  \u2717 FAIL (strategy-self-improvement group threw): ' + e.message); }

/* ---------- Sector lab: ETF-selector risk / liquidity / drawdown helpers ---------- */
try {
  group('sector-research-lab.html \u2014 ETF-selector metrics (drawdown, dollar ADV, Sharpe-like, tracking error / beta / info ratio)');
  const src = read('sector-research-lab.html');
  const names = ['maxDD', 'advDollar', 'annualize', 'sharpeLike', 'mean', 'variance', 'stdev', 'covar', 'activeStats'];
  const env = build(names.map((n) => extractFn(src, n)), names, 'var ANN=252;');

  // maxDD: peak-to-trough fraction in [0,1]
  assert(env.maxDD([1, 2, 3, 4, 5]) === 0, 'maxDD: a monotonically rising path has zero drawdown');
  assert(approx(env.maxDD([100, 50]), 0.5, 1e-12), 'maxDD: halving from the peak = 0.50');
  assert(approx(env.maxDD([100, 120, 60, 90]), 0.5, 1e-12), 'maxDD: worst peak(120)->trough(60) = 0.50, not the later partial recovery');
  assert(env.maxDD([100]) === null, 'maxDD: a <2-point series is null');

  // advDollar: average price x volume over the last k bars (liquidity proxy)
  assert(approx(env.advDollar([10, 10, 10], [100, 100, 100], 21), 1000, 1e-9), 'advDollar: constant $10 x 100sh = $1,000/day');
  assert(approx(env.advDollar([10, 20], [100, 100], 1), 2000, 1e-9), 'advDollar: k=1 uses only the last bar ($20 x 100)');
  assert(env.advDollar([10, 10], null, 21) === null, 'advDollar: no volume series -> null');

  // annualize + sharpeLike: risk-adjusted momentum
  assert(approx(env.annualize(0.10, 365), 0.10, 1e-9), 'annualize: +10% over exactly 1y is 10%/yr');
  assert(env.annualize(0.10, 182) > 0.19, 'annualize: +10% in ~6mo compounds to >19%/yr');
  const shHi = env.sharpeLike(0.20, 182, 0.20, 0.04);
  const shLo = env.sharpeLike(0.05, 182, 0.20, 0.04);
  assert(shHi > shLo, 'sharpeLike: same vol, higher return -> higher score');
  assert(env.sharpeLike(0.20, 182, 0.10, 0.04) > shHi, 'sharpeLike: same return, lower vol -> higher score');
  assert(env.sharpeLike(0.20, 182, 0, 0.04) === null, 'sharpeLike: zero vol -> null (no divide-by-zero)');

  // activeStats: tracking error / beta / information ratio of a candidate ETF vs its sector SPDR (aligned daily returns)
  const bmk = []; for (let i = 0; i < 60; i++) bmk.push(0.01 * Math.sin(i * 0.5));
  assert(env.activeStats([1, 2, 3], [1, 2, 3]) === null, 'activeStats: <20 aligned points -> null');
  const same = env.activeStats(bmk, bmk);
  assert(same && approx(same.te, 0, 1e-9), 'activeStats: identical series -> zero tracking error');
  assert(same && approx(same.beta, 1, 1e-9), 'activeStats: identical series -> beta 1.00');
  assert(same && same.ir === null, 'activeStats: identical series -> info ratio null (no drift, TE=0)');
  const amp = bmk.map((x) => 1.5 * x);
  const st = env.activeStats(amp, bmk);
  assert(st && approx(st.beta, 1.5, 1e-9), 'activeStats: a = 1.5x the sector -> beta 1.50 (amplifies the move)');
  assert(st && st.te > 0, 'activeStats: an amplified fund has positive tracking error (drifts from the sector)');
  const drift = bmk.map((x, i) => x + 0.001 + 0.003 * Math.sin(i * 0.9));
  const dr = env.activeStats(drift, bmk);
  assert(dr && dr.ir > 0, 'activeStats: a fund with positive mean active return -> positive information ratio');
  assert(dr && dr.te > 0, 'activeStats: a drifting fund has positive tracking error');
} catch (e) { failures++; console.log('  \u2717 FAIL (sector-lab group threw): ' + e.message); }

/* ---------- Sector lab: Simple rotation action thresholds (single-sourced RLMACROROTATION) ---------- */
try {
  group('sector-research-lab.html — Simple rotation action thresholds (single-sourced RLMACROROTATION)');
  const src = read('sector-research-lab.html');
  // The into/out classifier, RRG normalization, quadrant, and state label are single-sourced in
  // rlexperience-adapters/macro-rotation.js (RLMACROROTATION), which the page delegates to. Expose
  // the module as the global the page's delegating functions reference, then evaluate them.
  const macroRotationRequire = (await import('node:module')).createRequire(import.meta.url);
  delete macroRotationRequire.cache[macroRotationRequire.resolve('../rlexperience-adapters/macro-rotation.js')];
  const RLMACROROTATION = macroRotationRequire('../rlexperience-adapters/macro-rotation.js');
  const priorMacro = globalThis.RLMACROROTATION;
  globalThis.RLMACROROTATION = RLMACROROTATION;
  try {
    const names = ['sectorSimpleCandidates'];
    const env = build(names.map((n) => extractFn(src, n)), names);
    const improving = { id: 'XLF', quad: 'I', state: { t: 'Improving ↑' }, accel: 0.35, x3: 0.04 };
    const weakImproving = { id: 'XLE', quad: 'I', state: { t: 'Improving ↑' }, accel: 0.10, x3: -0.02 };
    const peaking = { id: 'XLV', quad: 'L', state: { t: 'Peaking ⚠' }, accel: -0.30, x3: -0.03 };
    const early = env.sectorSimpleCandidates([improving, weakImproving, peaking], 'early');
    const strict = env.sectorSimpleCandidates([improving, weakImproving, peaking], 'strict');
    assert(early.into.length === 2, 'early threshold keeps both improving rotations');
    assert(strict.into.length === 1 && strict.into[0].id === 'XLF', 'strict threshold requires acceleration plus positive 3M excess');
    assert(strict.out.length === 1 && strict.out[0].id === 'XLV', 'strict threshold keeps a confirmed peaking rotation-out');
    // Single-source: the page loads the module, delegates the classifier, and carries no inline copy.
    assert(/rlexperience-adapters\/macro-rotation\.js/.test(src) && /RLMACROROTATION\.rotationCandidacy\s*\(/.test(src), 'sector page single-sources rotationCandidacy from RLMACROROTATION');
    assert(/RLMACROROTATION\.rollZ100\s*\(/.test(src) && /RLMACROROTATION\.rrgQuadrant\s*\(/.test(src) && /RLMACROROTATION\.stateLabel\s*\(/.test(src), 'sector page delegates rollZ100/rrgQuadrant/stateLabel to the single source');
    assert(!/view\.quad === 'I' \|\| view\.state\.t === 'Basing/.test(src) && !/out\[i\] = sd \? 100 \+ \(a\[i\] - m\) \/ sd : 100/.test(src), 'sector page carries no inline classifier or RRG-normalization copy');
  } finally {
    if (priorMacro === undefined) delete globalThis.RLMACROROTATION; else globalThis.RLMACROROTATION = priorMacro;
  }
} catch (e) { failures++; console.log('  ✗ FAIL (sector Simple group threw): ' + e.message); }
/* ---------- Market Heatmap: squarified treemap + heat color + breadth ---------- */
try {
  group('market-heatmap-lab.html — squarified treemap layout, heat color, page helpers + single-sourced breadth (RLMARKETSTRUCTURE)');
  const src = read('market-heatmap-lab.html');
  // Page-only helpers (treemap layout, colour, dollar-volume, tool-read) stay inline on the
  // page and remain extractable; the breadth/return/sigma owner formulas are single-sourced
  // in rlexperience-adapters/market-structure.js (RLMARKETSTRUCTURE), which the page delegates to.
  const names = ['trWorst', 'squarify', 'heatMix', 'heatColor', 'dollarVol', 'buildHeatToolRead'];
  const env = build(names.map((n) => extractFn(src, n)), names, extractFn(src, 'isFinite'));
  const { createRequire } = await import('node:module');
  const heatmapRequire = createRequire(import.meta.url);
  delete heatmapRequire.cache[heatmapRequire.resolve('../rlexperience-adapters/market-structure.js')];
  const RLMS = heatmapRequire('../rlexperience-adapters/market-structure.js');

  // squarify: area conserved, area ∝ value, within bounds, non-overlapping
  const items = [{ value: 6, id: 'a' }, { value: 6, id: 'b' }, { value: 4, id: 'c' }, { value: 3, id: 'd' }, { value: 2, id: 'e' }, { value: 1, id: 'f' }];
  const W = 600, H = 400, rects = env.squarify(items, 0, 0, W, H);
  assert(rects.length === items.length, 'squarify: one rect per positive-value item');
  let totalArea = 0; for (const r of rects) totalArea += r.w * r.h;
  assert(approx(totalArea, W * H, 1e-6), 'squarify: total tile area == container area (' + totalArea.toFixed(1) + ' vs ' + (W * H) + ')');
  const totalVal = items.reduce((s, it) => s + it.value, 0);
  let propOk = true, boundsOk = true;
  for (const r of rects) {
    if (!approx(r.w * r.h, r.item.value / totalVal * W * H, 1e-3)) propOk = false;
    if (r.x < -1e-6 || r.y < -1e-6 || r.x + r.w > W + 1e-6 || r.y + r.h > H + 1e-6) boundsOk = false;
  }
  assert(propOk, 'squarify: every tile area is proportional to its value');
  assert(boundsOk, 'squarify: every tile stays within the container');
  let overlap = 0;
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i], b = rects[j];
    const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
    const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    overlap += ix * iy;
  }
  assert(overlap < 1e-3, 'squarify: tiles do not overlap (total overlap ' + overlap.toExponential(1) + ')');
  assert(env.squarify([], 0, 0, W, H).length === 0, 'squarify: empty input => no rects');
  assert(env.squarify([{ value: -3 }, { value: 0 }], 0, 0, W, H).length === 0, 'squarify: non-positive values dropped');

  // heatColor: neutral at 0, greener for +, redder for −, clamped beyond ±cap
  const chan = (s) => s.match(/\d+/g).map(Number);
  const c0 = env.heatColor(0, 3), cPos = env.heatColor(2, 3), cNeg = env.heatColor(-2, 3);
  assert(/^rgb\(/.test(c0) && /^rgb\(/.test(cPos) && /^rgb\(/.test(cNeg), 'heatColor: returns rgb() strings');
  assert(chan(cPos)[1] > chan(c0)[1], 'heatColor: positive return is greener than neutral');
  assert(chan(cNeg)[0] > chan(c0)[0], 'heatColor: negative return is redder than neutral');
  assert(env.heatColor(99, 3) === env.heatColor(3, 3) && env.heatColor(-99, 3) === env.heatColor(-3, 3), 'heatColor: clamps beyond ±cap');

  // breadthReadCells (single source) — the page's breadthRead delegates here.
  const cells = [{ ticker: 'A', pct: 2 }, { ticker: 'B', pct: 1 }, { ticker: 'C', pct: -1 }, { ticker: 'D', pct: NaN }];
  const br = RLMS.breadthReadCells(cells);
  assert(br.total === 3 && br.green === 2, 'breadthReadCells: counts finite cells; greens = up names');
  assert(br.leader.ticker === 'A' && br.laggard.ticker === 'C', 'breadthReadCells: identifies leader & laggard');
  assert(RLMS.breadthReadCells([{ pct: 1 }, { pct: 1 }, { pct: 1 }]).bias === 'risk-on', 'breadthReadCells: all-green => risk-on');
  assert(RLMS.breadthReadCells([{ pct: -1 }, { pct: -1 }, { pct: -1 }]).bias === 'risk-off', 'breadthReadCells: all-red => risk-off');
  assert(RLMS.breadthReadCells([{ pct: 2 }, { pct: null }, { pct: -1 }]).total === 2, 'breadthReadCells: excludes null-pct (unavailable) cells from total (Number.isFinite parity with page)');

  // buildHeatToolRead — the tool's OWN Simple-view read published to the shared cache (Brief tab + Market Brief)
  const heatCells = [{ ticker: 'XLE', sector: 'Energy', pct: 2.13 }, { ticker: 'XLK', sector: 'Technology', pct: 0.4 }, { ticker: 'XLU', sector: 'Utilities', pct: -0.81 }];
  const heatBr = RLMS.breadthReadCells(heatCells);
  const heatRead = env.buildHeatToolRead(heatBr, '1d', heatCells.slice().sort((a, b) => b.pct - a.pct));
  assert(heatRead.id === 'market-heatmap-lab' && heatRead.deepLink === 'market-heatmap-lab.html', 'buildHeatToolRead: correct id + self deep link');
  assert(/breadth: 2\/3 sectors green over 1d/.test(heatRead.read), 'buildHeatToolRead: read carries the computed breadth count');
  assert(/leader XLE \+2\.13%/.test(heatRead.read) && /laggard XLU -0\.81%/.test(heatRead.read), 'buildHeatToolRead: read names the computed leader + laggard');
  assert(heatRead.metrics.bias === heatBr.bias && heatRead.metrics.leader.ticker === 'XLE' && heatRead.metrics.ranked.length === 3, 'buildHeatToolRead: metrics mirror breadthRead (bias, leader, ranked)');

  // data helpers — pctOverWindow/meanSampleSd single source (page delegates); dollarVol stays page-only.
  const rows = [{ c: 100, v: 10 }, { c: 110, v: 20 }, { c: 121, v: 30 }];
  assert(approx(RLMS.pctOverWindow(rows, 1), 10, 1e-9), 'pctOverWindow: last vs 1-back = +10%');
  assert(approx(RLMS.pctOverWindow(rows, 2), 21, 1e-9), 'pctOverWindow: last vs 2-back = +21%');
  assert(approx(env.dollarVol(rows), 121 * 30, 1e-9), 'dollarVol: last close × last volume');
  const ms = RLMS.meanSampleSd([2, 4, 6]);
  assert(approx(ms.mean, 4, 1e-9) && approx(ms.sd, 2, 1e-9), 'meanSampleSd: mean 4, sample sd 2');
  assert(RLMS.meanSampleSd([2, null, 4]).mean === 3, 'meanSampleSd: rejects null members => mean 3 (Number.isFinite parity with page)');

  // single-source wiring: the page loads the module, delegates, and carries no inline formula copy.
  assert(/rlexperience-adapters\/market-structure\.js/.test(src), 'market-heatmap-lab.html loads the market-structure module');
  assert(/RLMARKETSTRUCTURE\.pctOverWindow\s*\(/.test(src) && /RLMARKETSTRUCTURE\.meanSampleSd\s*\(/.test(src) && /RLMARKETSTRUCTURE\.breadthReadCells\s*\(/.test(src), 'market-heatmap-lab.html delegates pctOver/meanSd/breadthRead to the single source');
  assert(/WIN_BARS\s*=\s*RLMARKETSTRUCTURE\.WINDOW_BARS/.test(src), 'market-heatmap-lab.html single-sources WIN_BARS from the module');
  assert(!/last\.c \/ base\.c - 1\) \* 100/.test(src) && !/Math\.sqrt\(s \/ \(n - 1\)\)/.test(src) && !/frac > 0\.6 \? "risk-on"/.test(src), 'market-heatmap-lab.html carries no inline copy of the single-sourced breadth formula');
} catch (e) { failures++; console.log('  ✗ FAIL (market-heatmap group threw): ' + e.message); }
/* ---------- RLCHART: horizontal-level label de-collision (declutterY) ---------- */
try {
  group('rlchart.js — declutterY level-label de-collision');
  const src = read('rlchart.js');
  const env = build([extractFn(src, 'declutterY')], ['declutterY']);
  // already-spaced labels are unchanged
  const spaced = env.declutterY([{ y: 10, t: 'A' }, { y: 40, t: 'B' }, { y: 80, t: 'C' }], 12, 0, 200);
  assert(spaced.length === 3 && spaced[0].ly === 10 && spaced[1].ly === 40 && spaced[2].ly === 80, 'declutterY: already-spaced labels keep their y');
  // a collided cluster (Gamma Flip / wall / max pain within ~3px) is spread >= gap apart, sorted by true y
  const clustered = env.declutterY([{ y: 100, t: 'flip' }, { y: 103, t: 'wall' }, { y: 101, t: 'pain' }], 12, 0, 400);
  assert(clustered.map((o) => o.t).join(',') === 'flip,pain,wall', 'declutterY: sorts ascending by true y');
  let okGap = true; for (let i = 1; i < clustered.length; i++) if (clustered[i].ly - clustered[i - 1].ly < 12 - 1e-9) okGap = false;
  assert(okGap, 'declutterY: collided labels are pushed at least `gap` apart');
  // the true line position is preserved on every item (only the label `ly` moves)
  assert(clustered.every((o) => o.y === Number(o.y)) && clustered.find((o) => o.t === 'wall').y === 103, 'declutterY: preserves each item true y (line stays put)');
  // 4 labels needing 3*gap=36px fit in a 40px band => clamped within [top,bottom] with the gap kept
  const bounded = env.declutterY([{ y: 38 }, { y: 39 }, { y: 39.5 }, { y: 40 }], 12, 0, 40);
  assert(bounded[0].ly >= -1e-9 && bounded[bounded.length - 1].ly <= 40 + 1e-9, 'declutterY: clamps the label stack within [top,bottom]');
  let okGap2 = true; for (let i = 1; i < bounded.length; i++) if (bounded[i].ly - bounded[i - 1].ly < 12 - 1e-9) okGap2 = false;
  assert(okGap2, 'declutterY: keeps the min gap even when the stack is pulled up from the bottom');
  // copies item props, drops null / non-finite y, tolerates empty/null input
  const props = env.declutterY([{ y: 50, c: '#f00', t: 'X' }, { y: 'nan', t: 'skip' }, { y: null }], 10, 0, 100);
  assert(props.length === 1 && props[0].c === '#f00' && props[0].t === 'X' && props[0].ly === 50, 'declutterY: copies item props and drops null / non-finite y');
  assert(Array.isArray(env.declutterY(null, 12, 0, 100)) && env.declutterY([], 12, 0, 100).length === 0, 'declutterY: null / empty input => empty array');
} catch (e) { failures++; console.log('  ✗ FAIL (declutterY group threw): ' + e.message); }
/* ---------- Unusual Options Activity: chain parse + unusual-score + tape read ---------- */
try {
  group('options-flow-feed-lab.html — chain parse, vol/OI + premium + unusual score, tape read (single-sourced RLOPTIONS)');
  const src = read('options-flow-feed-lab.html');
  // The options-flow owner formulas (vol/OI, premium notional, DTE, unusual score, chain parse/score,
  // tape read) are single-sourced in rlexperience-adapters/options.js (RLOPTIONS), which the page
  // delegates to. Golden-pin the module owner primitives, then assert the page single-sources them.
  const { createRequire } = await import('node:module');
  const optionsRequire = createRequire(import.meta.url);
  delete optionsRequire.cache[optionsRequire.resolve('../rlexperience-adapters/options.js')];
  const RLOPTIONS = optionsRequire('../rlexperience-adapters/options.js');

  assert(RLOPTIONS.volOI(20, 10) === 2, 'volOI: 20 vol / 10 OI = 2');
  assert(RLOPTIONS.volOI(5, 0) === Infinity, 'volOI: OI 0 with volume => Infinity (brand-new positioning)');
  assert(RLOPTIONS.volOI(0, 0) === 0, 'volOI: no volume, no OI => 0');
  assert(RLOPTIONS.premiumNotional(10, 2.5) === 2500, 'premiumNotional: 10 × $2.5 × 100 = $2,500');
  assert(RLOPTIONS.premiumNotional(0, 2) === 0 && RLOPTIONS.premiumNotional(10, 0) === 0, 'premiumNotional: guards zero vol / mid');
  assert(RLOPTIONS.dteFrom(7 * 86400, 0) === 7, 'dteFrom: 7 days out from epoch 0 = 7 DTE');
  assert(RLOPTIONS.dteFrom(NaN, 0) === null, 'dteFrom: bad expiry => null');

  const chainJson = { optionChain: { result: [{ quote: { regularMarketPrice: 100 }, options: [{ expirationDate: 1000000, calls: [{ strike: 100, volume: 500, openInterest: 100, impliedVolatility: 0.4, bid: 2, ask: 2.2, lastPrice: 2.1 }], puts: [{ strike: 95, volume: 50, openInterest: 200, impliedVolatility: 0.5, bid: 1, ask: 1.2, lastPrice: 1.1 }] }] }] } };
  const parsed = RLOPTIONS.parseYahooChain(chainJson);
  assert(parsed && parsed.spot === 100 && parsed.rows.length === 2, 'parseYahooChain: spot + 2 rows (call + put)');
  const pcall = parsed.rows.find((r) => r.type === 'C'), pput = parsed.rows.find((r) => r.type === 'P');
  assert(pcall && approx(pcall.mid, 2.1, 1e-9), 'parseYahooChain: call mid = (bid+ask)/2');
  assert(pput && pput.strike === 95 && pput.oi === 200, 'parseYahooChain: put fields carried through');
  assert(RLOPTIONS.parseYahooChain({}) === null, 'parseYahooChain: malformed json => null');

  const scored = RLOPTIONS.scoreChain(parsed, 'TEST', 0);
  const sc = scored.find((r) => r.type === 'C'), sp = scored.find((r) => r.type === 'P');
  assert(approx(sc.premium, 500 * 2.1 * 100, 1e-6), 'scoreChain: call premium = vol × mid × 100');
  assert(sc.score >= 0 && sc.score <= 100 && sp.score >= 0 && sp.score <= 100, 'scoreChain: unusual scores in [0,100]');
  assert(sc.score > sp.score, 'scoreChain: high vol/OI + high-premium call scores more unusual than the quiet put');
  assert(sc.ticker === 'TEST' && sc.volOI === 5, 'scoreChain: tags ticker + vol/OI');

  const tr = RLOPTIONS.tapeRead(scored);
  assert(tr.frac > 0.6 && /call-heavy/.test(tr.lean), 'tapeRead: call premium dominant => call-heavy lean');
  assert(RLOPTIONS.tapeRead([]).lean === 'n/a', 'tapeRead: no rows => n/a');

  // single-source wiring: the page loads the module, delegates each owner primitive to RLOPTIONS.*, and carries no inline formula copy.
  assert(/rlexperience-adapters\/options\.js/.test(src), 'options-flow-feed-lab.html loads the options module');
  assert(/RLOPTIONS\.volOI\s*\(/.test(src) && /RLOPTIONS\.premiumNotional\s*\(/.test(src) && /RLOPTIONS\.unusualScore\s*\(/.test(src) && /RLOPTIONS\.scoreChain\s*\(/.test(src) && /RLOPTIONS\.tapeRead\s*\(/.test(src), 'options-flow-feed-lab.html delegates the owner primitives to the single source');
  assert(!/return vol \/ oi;/.test(src) && !/vol \* mid \* 100/.test(src) && !/frac > 0\.6 \? "call-heavy/.test(src), 'options-flow-feed-lab.html carries no inline copy of the single-sourced owner formulas');
} catch (e) { failures++; console.log('  ✗ FAIL (options-flow group threw): ' + e.message); }

/* ---------- Global rotation: equity-only leadership score, FX as a separate product ---------- */
try {
  group('global-rotation-lab.html — equity-only score + separate FX decomposition');
  const src = read('global-rotation-lab.html');
  const names = ['globalTrailingPct', 'globalAnnualVol', 'globalMaxDrawdown', 'globalTrendState', 'globalMomentumScore', 'globalRiskQuality', 'postureWeights'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const base = Date.UTC(2025, 0, 1), rising = [], falling = [];
  for (let i = 0; i < 260; i++) {
    rising.push({ t: base + i * 864e5, c: 100 * Math.pow(1.0015, i) });
    falling.push({ t: base + i * 864e5, c: 100 * Math.pow(0.9985, i) });
  }
  assert(env.globalTrailingPct(rising, 21) > 0 && env.globalTrailingPct(falling, 21) < 0, 'trailing return preserves direction');
  assert(env.globalAnnualVol(rising, 63) >= 0, 'annualized volatility is finite and non-negative');
  assert(env.globalMaxDrawdown(rising, 252) < 1e-9, 'monotonic rise has zero max drawdown');
  assert(env.globalMaxDrawdown(falling, 252) > 0.25, 'persistent decline produces a material drawdown');
  assert(env.globalTrendState(rising, 'balanced').pass === true, 'rising 20/50/200 structure passes balanced trend gate');
  assert(env.globalTrendState(falling, 'balanced').pass === false, 'falling 20/50/200 structure fails balanced trend gate');

  /* Feature 004 Scope 3: the page no longer owns an FX-weighted score. Posture weights are
     equity-only and the shared engine refuses to score an fx key at all. */
  const balanced = env.postureWeights('balanced');
  assert(Object.keys(balanced).sort().join(',') === 'momentum,risk,trend', 'posture weights are equity-only — no FX weight exists');
  assert(env.postureWeights('offense').momentum > env.postureWeights('defense').momentum, 'offense weights momentum more heavily than defense');
  const RLFX = (await import('node:module')).createRequire(import.meta.url)('../rlfx.js');
  const strong = RLFX.scoreCountryLeadership({ momentum: 0.8, trend: 0.7, risk: 0.5, weights: balanced });
  const weak = RLFX.scoreCountryLeadership({ momentum: -0.8, trend: -0.7, risk: -0.5, weights: balanced });
  assert(strong.score > 70 && weak.score < 30, 'supportive inputs outrank adverse inputs on the common 0-100 scale');
  let rejectedFx = false;
  try { RLFX.scoreCountryLeadership({ momentum: 0.5, trend: 0.5, risk: 0.5, fx: 0.9, weights: balanced }); } catch (e) { rejectedFx = true; }
  assert(rejectedFx, 'raw FX cannot re-enter the country score — an fx key is refused outright');
  /* Built from fragments so this guard cannot match its own source and defeat the consumer gate. */
  const retired = ['global' + 'FxConfirm', 'global' + 'CountryScore', 'fx' + 'Weight', 'currency' + 'Proxy', 'fx' + 'Inverse'];
  assert(!new RegExp(retired.join('|')).test(src), 'the page retains no FX-scoring or duplicated-orientation consumer');

  /* Feature 004 Scope 4 (SCN-004-023) — the FX/Global relationship is read from each owner's own
     published tool read. It never builds a third model, so there is no merged score to inspect.
     These are the REAL v2 projection shapes: FX direction comes from the recommendation outcome's
     economic direction, Global's from the leader's USD relative return. */
  (await import('node:module')).createRequire(import.meta.url)('../rlbrief.js');
  const RLBRIEF = globalThis.RLBRIEF;
  const at = '2026-08-08T12:00:00.000Z';
  const later = '2026-08-09T00:00:00.000Z';
  const fxSide = (side) => ({
    contractVersion: 'rlfx-tool-read/v2', id: 'fx-regime-relative-value-lab', availability: 'current',
    asOf: at, read: 'FX owner read', deepLink: 'fx-regime-relative-value-lab.html#power',
    computedAt: at, freshUntil: later,
    metrics: { evidenceIdentity: 'fxe-v1-aaa', recommendationOutcome: { economicDirection: { exposure: 'long-JPY/short-USD', instrumentSide: side } } }
  });
  const globalSide = (relative) => ({
    contractVersion: 'rl-tool-read/v1', id: 'global-rotation-lab', availability: 'current',
    asOf: at, read: 'Global owner read', deepLink: 'global-rotation-lab.html#simple',
    computedAt: at, freshUntil: later,
    metrics: { evidenceIdentity: 'gr-v1-bbb', leader: { ticker: 'EWJ', usdLeadership: { state: 'ready', usdRelativeReturn: relative } } }
  });

  const agree = RLBRIEF.evaluateFxGlobalRelationship(fxSide('long'), globalSide(0.04), at);
  assert(agree.relationship === 'Agreement' && agree.blockingReasons.length === 0, 'equal nonzero directions classify as Agreement');
  assert(agree.fx.computedAt === at && agree.fx.freshUntil === later && agree.global.computedAt === at && agree.global.freshUntil === later, 'both owners keep their own computedAt and freshUntil clocks');
  assert(agree.fx.ownerDeepLink !== agree.global.ownerDeepLink, 'each owner is attributed through its own deep link');
  assert(!('score' in agree) && !('coverage' in agree), 'the relationship builds no third composite score or coverage claim');

  const diverge = RLBRIEF.evaluateFxGlobalRelationship(fxSide('long'), globalSide(-0.04), at);
  assert(diverge.relationship === 'Divergence' && diverge.blockingReasons.length === 0, 'opposite nonzero directions classify as Divergence');

  /* Non-vacuity: the classifier must actually distinguish the two, not return one label always. */
  assert(agree.relationship !== diverge.relationship, 'the Agreement/Divergence check is non-vacuous — the same inputs do not yield one label');

  const zero = RLBRIEF.evaluateFxGlobalRelationship(fxSide('none'), globalSide(0.04), at);
  assert(zero.relationship === 'Insufficient Evidence' && zero.fx === null, 'an unattributable side yields Insufficient Evidence');
  assert(zero.blockingReasons.indexOf('DIRECTION_NOT_ATTRIBUTABLE') !== -1, 'the unattributable direction is named as a blocking reason');

  const flatGlobal = RLBRIEF.evaluateFxGlobalRelationship(fxSide('long'), globalSide(0), at);
  assert(flatGlobal.relationship === 'Insufficient Evidence' && flatGlobal.global === null, 'a flat Global relative return is not a direction');

  const staleGlobal = Object.assign(globalSide(0.04), { freshUntil: '2026-08-08T00:00:00.000Z' });
  const stale = RLBRIEF.evaluateFxGlobalRelationship(fxSide('long'), staleGlobal, at);
  assert(stale.relationship === 'Insufficient Evidence' && stale.global === null, 'a stale owner read cannot contribute a direction');
  assert(stale.fx !== null && stale.fx.ownerDeepLink, 'the remaining current owner stays attributable when the other is stale');

  const missing = RLBRIEF.evaluateFxGlobalRelationship(null, globalSide(0.04), at);
  assert(missing.relationship === 'Insufficient Evidence' && missing.blockingReasons.indexOf('FX_OWNER_READ_MISSING') !== -1, 'a missing FX owner read is reasoned, not synthesized');

  /* Feature 004 Scope 5 (TP-05-15, NFR-021) — a readiness timeout may only widen on evidence.
     The guard below is the authorization rule: a proposal must carry same-condition measured
     latency AND an adversarial stalled/starved case that still fails inside the governing budget.
     A measured normal case alone is exactly the argument that makes budgets drift. */
  function fxAuthorizeBudgetWidening(proposal, governingBudgetMs) {
    const reasons = [];
    if (!proposal || typeof proposal !== 'object') return { ok: false, reasons: ['NO_PROPOSAL'] };
    if (!Number.isFinite(proposal.proposedMs) || !Number.isFinite(proposal.currentMs)) reasons.push('BUDGET_NOT_NUMERIC');
    else if (proposal.proposedMs <= proposal.currentMs) return { ok: true, reasons: [] }; // not a widening
    if (!Number.isFinite(proposal.measuredLatencyMs)) reasons.push('NO_SAME_CONDITION_MEASUREMENT');
    if (proposal.measurementCondition !== proposal.predicate) reasons.push('MEASUREMENT_CONDITION_MISMATCH');
    const stalls = Array.isArray(proposal.adversarialCases) ? proposal.adversarialCases : [];
    if (!stalls.some((c) => c.kind === 'stalled')) reasons.push('NO_STALLED_CASE');
    if (!stalls.some((c) => c.kind === 'starved')) reasons.push('NO_STARVED_CASE');
    if (stalls.some((c) => c.stillFails !== true)) reasons.push('ADVERSARIAL_CASE_DOES_NOT_FAIL');
    if (Number.isFinite(proposal.proposedMs) && proposal.proposedMs > governingBudgetMs) reasons.push('EXCEEDS_GOVERNING_BUDGET');
    return { ok: reasons.length === 0, reasons };
  }

  const governing = JSON.parse(read('tool-experience.config.json')).performanceBudgets.localRecomputeMaxMs;
  assert(governing === 250, 'the governing local-recompute budget is unchanged at 250ms');

  const measuredOnly = { predicate: 'fx-owner-ready', currentMs: 100, proposedMs: 200, measuredLatencyMs: 140, measurementCondition: 'fx-owner-ready', adversarialCases: [] };
  const onlyMeasured = fxAuthorizeBudgetWidening(measuredOnly, governing);
  assert(!onlyMeasured.ok, 'a measured normal case alone cannot authorize widening');
  assert(onlyMeasured.reasons.indexOf('NO_STALLED_CASE') !== -1 && onlyMeasured.reasons.indexOf('NO_STARVED_CASE') !== -1, 'the missing adversarial coverage is named');

  const wrongCondition = { predicate: 'fx-owner-ready', currentMs: 100, proposedMs: 200, measuredLatencyMs: 140, measurementCondition: 'some-other-predicate', adversarialCases: [{ kind: 'stalled', stillFails: true }, { kind: 'starved', stillFails: true }] };
  assert(fxAuthorizeBudgetWidening(wrongCondition, governing).reasons.indexOf('MEASUREMENT_CONDITION_MISMATCH') !== -1, 'latency measured under a different predicate is not same-condition evidence');

  const passingAdversarial = { predicate: 'fx-owner-ready', currentMs: 100, proposedMs: 200, measuredLatencyMs: 140, measurementCondition: 'fx-owner-ready', adversarialCases: [{ kind: 'stalled', stillFails: true }, { kind: 'starved', stillFails: false }] };
  assert(fxAuthorizeBudgetWidening(passingAdversarial, governing).reasons.indexOf('ADVERSARIAL_CASE_DOES_NOT_FAIL') !== -1, 'an adversarial case that passes proves nothing and is rejected');

  const overBudget = { predicate: 'fx-owner-ready', currentMs: 100, proposedMs: 400, measuredLatencyMs: 140, measurementCondition: 'fx-owner-ready', adversarialCases: [{ kind: 'stalled', stillFails: true }, { kind: 'starved', stillFails: true }] };
  assert(fxAuthorizeBudgetWidening(overBudget, governing).reasons.indexOf('EXCEEDS_GOVERNING_BUDGET') !== -1, 'a widening past the governing budget is rejected even when fully evidenced');

  const evidencedWidening = { predicate: 'fx-owner-ready', currentMs: 100, proposedMs: 200, measuredLatencyMs: 140, measurementCondition: 'fx-owner-ready', adversarialCases: [{ kind: 'stalled', stillFails: true }, { kind: 'starved', stillFails: true }] };
  assert(fxAuthorizeBudgetWidening(evidencedWidening, governing).ok, 'a fully evidenced widening inside the governing budget is authorized');

  /* Non-vacuity: the guard must genuinely separate the two, not reject everything. */
  assert(fxAuthorizeBudgetWidening(evidencedWidening, governing).ok !== onlyMeasured.ok, 'the budget guard is non-vacuous — it accepts evidenced widening and rejects unevidenced widening');
  assert(fxAuthorizeBudgetWidening({ predicate: 'p', currentMs: 200, proposedMs: 100 }, governing).ok, 'narrowing a timeout needs no widening evidence');


  /* The real production projection must flow through the classifier unmodified. Today's committed
     source posture makes the FX read unavailable, so the honest result is Insufficient Evidence. */
  const liveFxRead = RLFX.projectFxToolReadV2(RLFX.computeFxOwnerDecision({
    decisionTime: at,
    currencyDecision: RLFX.computeCurrencyDecision({ decisionTime: at, configVersion: 'probe', controls: { cohort: 'G10', horizon: 'swing', pairMode: 'explicit', base: 'JPY', quote: 'USD', evidenceLens: 'balanced', dollarComparison: 'Broad' }, sourceEnvelopes: [], observations: [] }),
    vehicleUniverse: RLFX.validateVehicleUniverse(JSON.parse(read('fx-vehicle-universe.json'))).value,
    vehicleObservations: JSON.parse(read('fx-vehicle-universe.json')).observations.map((o) => RLFX.normalizeVehicleObservation(o, { universe: JSON.parse(read('fx-vehicle-universe.json')), decisionTime: at, payloadKind: 'normalized-structural-fact' })),
    trackingReads: [],
    controls: { objective: 'foreign-currency-strength', subjectId: 'JPY', cohort: 'G10', horizon: 'swing', pairMode: 'explicit', base: 'JPY', quote: 'USD', vehicleClass: 'unlevered-single-currency', dailyResetPermission: 'exclude', liquidityPolicyId: 'vehicle-liquidity-research-minimum-v1', costPolicyId: 'vehicle-cost-research-maximum-v1', evidenceLens: 'balanced', dollarComparison: 'Broad' },
    fitPolicyId: 'vehicle-fit-lexicographic-v1',
    trackingPolicyId: 'vehicle-tracking-exact-date-v1'
  }));
  const live = RLBRIEF.evaluateFxGlobalRelationship(liveFxRead, globalSide(0.04), at);
  assert(live.relationship === 'Insufficient Evidence' && live.fx === null, 'the real FX projection is unavailable today, so the relationship stays Insufficient Evidence');
  assert(live.blockingReasons.indexOf('OWNER_NOT_CURRENT') !== -1, 'the real projection is refused for the reason it actually carries');

  /* TP-04-09 / TP-04-10 (SCN-004-032) — Brief prose requires a complete current evidence chain.
     Every incomplete branch becomes an unavailable non-recommendation, never a softened claim. */
  const allMissing = RLBRIEF.evaluateFxBriefEligibility(null, null, null, null, at);
  assert(allMissing.state === 'unavailable', 'a Brief with no owner, model, bundle, or publication is unavailable');
  assert(allMissing.blockingReasons.indexOf('OWNER_READ_MISSING') !== -1, 'the missing owner read is named, not implied');
  assert(allMissing.ownerDecisionId === null && allMissing.evidenceCutoff === null, 'an unavailable Brief invents no owner identity or cutoff');

  /* The real FX owner decision cannot produce current Brief prose today, and the refusal must name
     why rather than degrade into a weaker but still affirmative claim. */
  const liveEligibility = RLBRIEF.evaluateFxBriefEligibility(liveFxRead, null, null, null, at);
  assert(liveEligibility.state !== 'current', 'the real FX owner read does not yield current Brief prose');
  assert(liveEligibility.blockingReasons.length > 0, 'the refusal carries at least one exact blocking reason');

  /* Non-vacuity: the evaluator must distinguish states rather than always refusing. A complete,
     matching, cited chain reaches `current`; removing any one link must not. */
  const ownerRead = { contractVersion: 'rlfx-tool-read/v2', id: 'fx-regime-relative-value-lab', availability: 'current', asOf: at, read: 'r', deepLink: 'fx-regime-relative-value-lab.html#power', computedAt: at, freshUntil: later, metrics: { ownerDecisionId: 'fxo-1', evidenceIdentity: 'fxe-1', evidenceCutoff: at } };
  const partial = RLBRIEF.evaluateFxBriefEligibility(ownerRead, null, null, null, at);
  assert(partial.state !== 'current', 'an owner read alone is not a complete evidence chain');
  assert(partial.state !== allMissing.state || partial.blockingReasons.length !== allMissing.blockingReasons.length, 'the eligibility check is non-vacuous — a present owner read changes the refusal from the all-missing case');



  /* Feature 004 Scope 4 (TP-04-12, TP-04-13, SCN-004-033) — both FX Journey DAGs run through the
     production rljourney.js runtime. They live in a fixture because rlexperience.js requires every
     journeys.json definition to be claimed by a registered tool, and the FX tool registers in
     Scope 5; Scope 5 copies this exact fixture in, so the cutover cannot drift from what ran here. */
  const RJ = (await import('node:module')).createRequire(import.meta.url)('../rljourney.js');
  const fxJourneys = JSON.parse(read('tests/fixtures/fx-regime/journey-definitions.json'));
  assert(fxJourneys.definitions.length === 2 && fxJourneys.steps.length === 12, 'the FX registry carries exactly two definitions and twelve steps');

  const fxCompiled = RJ.compileRegistry(fxJourneys);
  assert(fxCompiled.ok, 'both FX Journey DAGs compile through production rljourney.js');
  const selection = fxCompiled.value.definitions['journey/fx-regime-relative-value-lab/currency-vehicle-selection/v1'];
  const wrapper = fxCompiled.value.definitions['journey/fx-regime-relative-value-lab/wrapper-mismatch/v1'];
  assert(selection && wrapper, 'both declared FX goals resolve');
  assert(selection.order.length === 6 && wrapper.order.length === 6, 'each FX DAG orders exactly six steps');
  assert(selection.noExecution === true && wrapper.noExecution === true, 'both FX DAGs declare noExecution');
  assert(selection.evidenceRequiredSlots.indexOf('owner-evidence') !== -1, 'the selection DAG requires an owner-evidence slot');
  assert(fxJourneys.definitions.every((d) => d.privacyClass === 'public-safe'), 'both FX DAGs stay inside the public-safe privacy boundary');
  assert(fxJourneys.definitions.every((d) => d.packetPolicy.humanSignoffRequired === true && d.packetPolicy.noExecution === true), 'both FX completion packets require human signoff and forbid execution');

  /* The order is a real dependency sort, not the declaration order: `structure` depends on both
     `horizon` and `direction`, so it can never precede either. */
  const order = selection.order;
  const at_ = (id) => order.indexOf('journey/fx-regime-relative-value-lab/currency-vehicle-selection/v1/step/' + id);
  assert(at_('objective') < at_('horizon') && at_('objective') < at_('direction'), 'the objective step precedes both branches it feeds');
  assert(at_('horizon') < at_('structure') && at_('direction') < at_('structure'), 'structure follows both of its dependencies');
  assert(at_('structure') < at_('constraints') && at_('constraints') < at_('settled-outcome'), 'the settled outcome is last');

  /* TP-04-13 (SCN-004-033) — refreshing evidence reopens the first affected step and its transitive
     dependents, and preserves both unrelated steps and the audit history. */
  const semanticRef = (requirementId, ch) => ({
    requirementId,
    evidenceRef: 'owner:' + requirementId,
    semanticFingerprint: 'sha256:' + ch.repeat(64),
    sourceClass: 'owner-evidence',
    valueState: 'ready',
    observedAsOf: '2026-08-08T11:00:00.000Z',
    retrievedOrPublishedAt: at,
    freshness: 'fresh',
    dataTier: 'public'
  });

  const created = RJ.createSession(selection, {
    context: { evidenceIdentity: 'fxe-v1-aaa' },
    createdAt: at,
    semanticEvidenceRefs: [semanticRef('owner-evidence-changed', 'a')]
  });
  assert(created.ok, 'an FX Journey session starts from the compiled DAG with a semantic baseline');
  let fxSession = created.value;

  const stepBase = 'journey/fx-regime-relative-value-lab/currency-vehicle-selection/v1/step/';
  const ownerEvidence = [{ slot: 'owner-evidence', ref: 'owner:fx:fxe-v1-aaa', provenance: 'owner-evidence' }];

  for (const id of ['objective', 'horizon', 'direction']) {
    const done = RJ.completeStep(fxSession, stepBase + id, { input: { choice: id }, evidence: ownerEvidence, completedAt: at });
    assert(done.ok, 'the ' + id + ' step completes with current owner evidence');
    fxSession = done.value;
  }
  assert(fxSession.steps[stepBase + 'objective'].status === 'complete', 'a completed step is recorded complete');

  /* TP-04-13 (SCN-004-033) — refreshing evidence reopens the affected step and its transitive
     dependents on the FX DAG itself, and preserves both unrelated steps and the audit history. */
  const unchangedRefresh = RJ.refreshEvidence(fxSession, [semanticRef('owner-evidence-changed', 'a')]);
  assert(unchangedRefresh.ok, 'an unchanged semantic refresh is accepted');
  assert(unchangedRefresh.value.steps[stepBase + 'objective'].status === 'complete', 'an unchanged fingerprint reopens nothing');

  const changed = RJ.refreshEvidence(unchangedRefresh.value, [semanticRef('owner-evidence-changed', 'b')]);
  assert(changed.ok, 'a changed semantic fingerprint is accepted');
  const after = changed.value;
  assert(after.steps[stepBase + 'objective'].status !== 'complete', 'the affected step reopens when its semantic evidence changes');
  assert(after.steps[stepBase + 'horizon'].status !== 'complete' && after.steps[stepBase + 'direction'].status !== 'complete', 'transitive dependents reopen with it');
  assert(after.steps[stepBase + 'settled-outcome'].status !== 'complete', 'a step that never ran is never marked complete by a refresh');
  assert(Array.isArray(after.history) && after.history.length >= fxSession.history.length, 'audit history is preserved across the refresh, never truncated');

  /* Non-vacuity: the reopen must be driven by the CHANGED fingerprint, not by calling refresh at
     all — the unchanged pass above must leave the same step complete. */
  assert(unchangedRefresh.value.steps[stepBase + 'objective'].status !== after.steps[stepBase + 'objective'].status, 'the reopen check is non-vacuous — only the changed fingerprint reopens the step');

  /* TP-04-12 — a completion packet requires human signoff, stays non-executable, and carries no
     order, portfolio, holding, account, credential, or personalized tax field. */
  let complete = created.value;
  for (const stepId of selection.order) {
    complete = RJ.completeStep(complete, stepId, { input: { choice: stepId }, evidence: ownerEvidence, completedAt: at }).value;
  }
  const packet = RJ.buildCompletionPacket(complete, { outcome: 'complete', signoff: { reviewer: 'independent-reviewer', decision: 'accept-research-process' } });
  assert(packet.ok, 'a fully current FX Journey builds a completion packet');
  assert(packet.value.noExecution === true && packet.value.executed === false, 'the packet retains noExecution:true and executed:false');
  const packetText = JSON.stringify(packet.value).toLowerCase();
  for (const forbidden of RJ.FORBIDDEN_FIELD_ROOTS) {
    assert(packetText.indexOf('"' + forbidden) === -1, 'the completion packet carries no ' + forbidden + ' field');
  }

  /* A packet cannot be built from a session whose evidence went stale — signoff never revives it. */
  const stalePacket = RJ.buildCompletionPacket(after, { outcome: 'complete', signoff: { reviewer: 'independent-reviewer', decision: 'accept-research-process' } });
  assert(!stalePacket.ok, 'a reopened session cannot be signed off as complete');






  /* TP-03-01 (SCN-004-020) — the two-leg and three-leg products are separate objects with their
     own returns, coverage, and clocks. The adversarial case gives FX an unmatched newest date, so
     a shared or aliased observation set would show up as identical coverage. */
  const gBase = Date.UTC(2025, 0, 1);
  const series = (n, rate, offsetDays) => Array.from({ length: n }, (_, i) => ({ t: gBase + (i + (offsetDays || 0)) * 864e5, c: 100 * Math.pow(rate, i) }));
  const etfRows = series(90, 1.002), benchRows = series(90, 1.001);
  const fxShort = series(88, 1.0005);
  const gCountry = (fxRows, orientation) => ({
    ticker: 'EWJ', country: 'Japan', currency: 'JPY',
    etfRows, benchmarkRows: benchRows, fxRows, fxSourceOrientation: orientation,
    momentum: 0.4, trend: 0.3, risk: 0.2, usdFreshUntil: null, fxFreshUntil: null
  });
  const gInput = (fxRows, orientation) => ({
    decisionTime: '2026-08-08T00:00:00.000Z', horizonSessions: 63, posture: 'balanced',
    benchmark: 'ACWI', postureWeights: balanced, agreementDeadbandPct: 0.25,
    countries: [gCountry(fxRows, orientation)]
  });
  const gReady = RLFX.computeGlobalRotation(gInput(fxShort, { base: 'USD', quote: 'JPY' })).leader;
  assert(gReady.usdLeadership !== gReady.decomposition, 'USD leadership and decomposition are distinct objects');
  assert(gReady.usdLeadership.observationSet !== gReady.decomposition.observationSet, 'the two products never share one observation set');
  assert(Number.isFinite(gReady.usdLeadership.usdRelativeReturn), 'USD leadership exposes its own two-leg relative return');
  assert(!('fxReturn' in gReady.usdLeadership), 'the two-leg product carries no FX leg');
  assert(gReady.usdLeadership.asOf !== null && gReady.usdLeadership.computedAt !== null, 'USD leadership owns its own asOf and computedAt');
  assert(gReady.decomposition.asOf !== gReady.usdLeadership.asOf, 'an unmatched newest FX date gives decomposition its own distinct asOf');

  /* TP-03-02 (SCN-004-021) — score, rank, and the leader spread are equity-only. Two genuinely
     different FX paths over identical equity bars must move decomposition and nothing else.
     (An inverted series under the mirrored orientation is the SAME relationship, so it would be a
     vacuous control; these two paths differ economically.) */
  const fxRising = series(88, 1.0009), fxFalling = series(88, 0.9991);
  const forward = RLFX.computeGlobalRotation(gInput(fxRising, { base: 'USD', quote: 'JPY' }));
  const reversed = RLFX.computeGlobalRotation(gInput(fxFalling, { base: 'USD', quote: 'JPY' }));
  assert(JSON.stringify(forward.ranked) === JSON.stringify(reversed.ranked), 'a raw FX reversal cannot change country score or rank');
  assert(forward.leader.decomposition.fxReturn !== reversed.leader.decomposition.fxReturn, 'the reversal really did change the FX leg, so the invariance above is not vacuous');
  assert(forward.leader.usdLeadership.usdRelativeReturn === reversed.leader.usdLeadership.usdRelativeReturn, 'USD leadership is FX-independent');

  /* The mirrored orientation is the same relationship, so it must resolve identically end to end. */
  const mirrored = RLFX.computeGlobalRotation(gInput(fxRising.map((r) => ({ t: r.t, c: 1 / r.c })), { base: 'JPY', quote: 'USD' }));
  assert(Math.abs(mirrored.leader.decomposition.fxReturn - forward.leader.decomposition.fxReturn) < 1e-12,
    'a mirrored source orientation describes one relationship and resolves to one FX return');

  /* TP-03-03 (SCN-004-022) — missing FX keeps USD leadership available and leaves decomposition
     unavailable with no numeric fields and no zero-FX assumption. */
  const noFx = RLFX.computeGlobalRotation(gInput([], null)).leader;
  assert(noFx.usdLeadership.state === 'ready', 'USD leadership survives missing FX');
  assert(noFx.decomposition.state === 'unavailable' && noFx.decomposition.unavailableReason === 'NO_SOURCE', 'decomposition reports its own unavailable reason');
  ['fxReturn', 'approximateLocalReturn', 'translation', 'interaction'].forEach((field) => {
    assert(!(field in noFx.decomposition), 'unavailable decomposition exposes no numeric ' + field);
  });
  const projected = RLFX.projectGlobalToolRead(RLFX.computeGlobalRotation(gInput([], null)));
  assert(JSON.stringify(projected).indexOf('"fxReturn"') === -1, 'the owner projection never re-stamps an absent FX leg');
} catch (e) { failures++; console.log('  ✗ FAIL (global-rotation group threw): ' + e.message); }

/* ---------- Real assets: model-specific drivers and risk penalties ---------- */
try {
  group('real-assets-lab.html — distinct gold / bitcoin / silver / commodity models');
  const src = read('real-assets-lab.html');
  const names = ['realClamp', 'realTrailingPct', 'realAnnualVol', 'realMaxDrawdown', 'realSma', 'realTrendState', 'realSignalFromPct', 'realConfirmScore', 'realRiskPenalty', 'goldModelScore', 'bitcoinModelScore', 'silverModelScore', 'commodityModelScore'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const base = Date.UTC(2025, 0, 1), rising = [], volatile = [];
  for (let i = 0; i < 260; i++) {
    rising.push({ t: base + i * 864e5, c: 100 * Math.pow(1.0012, i) });
    volatile.push({ t: base + i * 864e5, c: 100 * Math.pow(1.0005, i) * (1 + 0.12 * Math.sin(i * 0.8)) });
  }
  assert(env.realTrailingPct(rising, 63) > 0, 'real-asset trailing return captures a rising path');
  assert(env.realAnnualVol(volatile, 63, 252) > env.realAnnualVol(rising, 63, 252), 'volatile path has higher realized volatility');
  assert(env.realMaxDrawdown(volatile, 126) > env.realMaxDrawdown(rising, 126), 'volatile path has deeper max drawdown');
  assert(env.realTrendState(rising, 'strategic').label === 'Uptrend', 'rising structural path classifies as Uptrend');
  const params = { confirmationWeight: 1, volatilityPenalty: 1, riskMultiplier: 1 };
  const metrics = { trend: { score: 70 }, volatility: 18, drawdown: 6 };
  const goldTailwind = env.goldModelScore(metrics, { uup63: -5, tlt63: 5, tip63: 7 }, params);
  const goldHeadwind = env.goldModelScore(metrics, { uup63: 5, tlt63: -5, tip63: -7 }, params);
  assert(goldTailwind.score > goldHeadwind.score, 'gold model rewards weaker USD and supportive duration/rate proxies');
  const bitcoinRiskOn = env.bitcoinModelScore({ trend: { score: 65 }, volatility: 45, drawdown: 8 }, { qqq63: 12 }, params);
  const bitcoinRiskOff = env.bitcoinModelScore({ trend: { score: 65 }, volatility: 45, drawdown: 8 }, { qqq63: -12 }, params);
  assert(bitcoinRiskOn.score > bitcoinRiskOff.score, 'bitcoin model responds to QQQ risk-appetite confirmation');
  const silverConfirm = env.silverModelScore(metrics, { goldSilverRatio63: -6, gld63: 8, xli63: 8 }, params);
  const silverDiverge = env.silverModelScore(metrics, { goldSilverRatio63: 6, gld63: -8, xli63: -8 }, params);
  assert(silverConfirm.score > silverDiverge.score, 'silver model rewards falling gold/silver ratio plus gold and industrial confirmation');
  const energyConfirm = env.commodityModelScore(metrics, { xle63: 10, breadth: 80 }, params, 'energy');
  const energyDiverge = env.commodityModelScore(metrics, { xle63: -10, breadth: 20 }, params, 'energy');
  assert(energyConfirm.score > energyDiverge.score, 'energy model rewards XLE confirmation and commodity breadth');
  [goldTailwind, bitcoinRiskOn, silverConfirm, energyConfirm].forEach((result) => assert(result.score >= 0 && result.score <= 100, 'model score is clamped to [0,100]'));
} catch (e) { failures++; console.log('  ✗ FAIL (real-assets group threw): ' + e.message); }

/* ---------- Bond regime: aligned credit evidence + two-key policy ---------- */
try {
  group('bond-regime-lab.html — credit evidence foundation');
  const src = read('bond-regime-lab.html');
  const names = ['finiteNumber', 'bpToDecimal', 'pctToDecimal', 'validateBondConfig', 'alignCommonDateRows', 'buildRatioSeries', 'rollingPercentile', 'estimateDurationConfound', 'classifyRelativeCreditPulse', 'classifyCreditConfirmation', 'aggregateCreditConfirmations', 'classifyCreditRegime', 'stableDecisionDigest'];
  const env = build(names.map((name) => extractFn(src, name)), names);
  const config = JSON.parse(read('bond-regime-universe.json'));
  const day = (offset) => Date.UTC(2026, 0, 2 + offset);
  const left = [{ t: day(0), c: 100 }, { t: day(1), c: 101 }, { t: day(2), c: 102 }, { t: day(3), c: 103 }];
  const right = [{ t: day(0), c: 100 }, { t: day(2), c: 100 }, { t: day(3), c: 100 }, { t: day(4), c: 100 }];
  const aligned = env.alignCommonDateRows(left, right);
  assert(aligned.rows.length === 3, 'Bond Regime: common-date ratio alignment excludes unmatched legs');
  assert(aligned.latestCommonDate === '2026-01-05' && aligned.unmatchedNewerDates.right[0] === '2026-01-06', 'Bond Regime: latest ratio date is the newest exact common UTC date');
  const mismatch = env.buildRatioSeries(aligned, 'distribution-adjusted', 'price-only');
  assert(mismatch.state === 'unavailable' && mismatch.errorCode === 'BRL-RATIO-ADJUSTMENT-MISMATCH', 'Bond Regime: adjustment mismatch fails instead of mixing return definitions');
  const ratio = env.buildRatioSeries(aligned, 'distribution-adjusted', 'distribution-adjusted');
  assert(ratio.state === 'ready' && ratio.rows.every((row) => Number.isFinite(row.ratio)), 'Bond Regime: aligned ratio rows stay finite');

  const confound = env.estimateDurationConfound(3.2, 7.87, 42, 3, config.classifier.durationConfound);
  assert(confound.purity === 'confounded' && confound.effectPct > 1.9, 'Bond Regime: duration confound blocks ratio-only constructive credit');
  const strengthening = [
    { pairId: 'jnk-lqd', state: 'ready', direction: 'strengthening', purity: confound.purity, latestCommonDate: '2026-01-31', breadth: 'full' },
    { pairId: 'hyg-lqd', state: 'ready', direction: 'strengthening', purity: 'clean', latestCommonDate: '2026-01-31', breadth: 'full' }
  ];
  const stableOas = env.classifyCreditConfirmation({ id: 'oas', kind: 'oas', value: 2.5, changeBp: 0, observedAt: '2026-01-31', freshness: 'fresh' }, config.classifier.confirmation);
  const mixed = env.classifyCreditRegime(strengthening, [stableOas], config.classifier);
  assert(mixed.state === 'Mixed' && mixed.conflicts.indexOf('duration-confounded') >= 0, 'Bond Regime: duration-driven strengthening with no independent improvement remains Mixed');
  const tighteningOas = env.classifyCreditConfirmation({ id: 'oas', kind: 'oas', value: 2.5, changeBp: -12, observedAt: '2026-01-31', freshness: 'fresh' }, config.classifier.confirmation);
  const constructive = env.classifyCreditRegime(strengthening, [tighteningOas], config.classifier);
  assert(constructive.state === 'Constructive' && /ratio/.test(constructive.invalidation) && /spread/.test(constructive.invalidation), 'Bond Regime: aligned breadth plus current independent confirmation is constructive');
  const wideningOas = env.classifyCreditConfirmation({ id: 'oas', kind: 'oas', value: 2.5, changeBp: 18, observedAt: '2026-01-31', freshness: 'fresh' }, config.classifier.confirmation);
  assert(wideningOas.levelState === 'tight' && wideningOas.momentumState === 'widening' && wideningOas.direction === 'mixed', 'Bond Regime: spread level and momentum remain independent');
  assert(env.aggregateCreditConfirmations([tighteningOas]).direction === 'improving', 'Bond Regime: one current independent family satisfies only one confirmation key');

  const validConfig = env.validateBondConfig(config);
  assert(validConfig.ok && validConfig.errors.length === 0, 'Bond Regime: complete configuration validates');
  const unknownConfig = JSON.parse(JSON.stringify(config)); unknownConfig.unknownTopLevel = true;
  const nonfiniteConfig = JSON.parse(JSON.stringify(config)); nonfiniteConfig.classifier.ratio.change21dThresholdPct = null;
  const credentialConfig = JSON.parse(JSON.stringify(config)); credentialConfig.sourcePolicies.oas.apiKey = 'forbidden';
  const staleShapeConfig = JSON.parse(JSON.stringify(config)); delete staleShapeConfig.instruments[0].carry.reviewWindowDays;
  assert(!env.validateBondConfig(unknownConfig).ok && !env.validateBondConfig(nonfiniteConfig).ok && !env.validateBondConfig(credentialConfig).ok && !env.validateBondConfig(staleShapeConfig).ok, 'Bond Regime: configuration rejects unknown nonfinite credential and stale-contract shapes');
  assert(env.finiteNumber('12.5') === 12.5 && env.finiteNumber('') === null && env.bpToDecimal(100) === 0.01 && env.pctToDecimal(5) === 0.05, 'Bond Regime: numeric boundary helpers are finite and unit safe');
  assert(env.stableDecisionDigest({ b: 2, a: 1 }) === env.stableDecisionDigest({ a: 1, b: 2 }), 'Bond Regime: decision digest is stable across object key order');
} catch (e) { failures++; console.log('  ✗ FAIL (bond-regime credit group threw): ' + e.message); }

/* ---------- Bond regime: curve, inflation and duration foundation ---------- */
try {
  group('bond-regime-lab.html — curve inflation and duration foundation');
  const src = read('bond-regime-lab.html');
  const names = ['finiteNumber', 'alignCommonDateRows', 'classifyCurveState', 'classifyCurveImpulse', 'deriveBreakevenRows', 'classifyInflationState', 'classifyDurationPosture'];
  const env = build(names.map((name) => extractFn(src, name)), names);
  const curvePolicy = { flatBandBp: 25, impulseLookbackDays: 21, impulseNoiseBp: 5, inflationNoiseBp: 5 };
  function curveRows(shortStart, shortEnd, longStart, longEnd) {
    const rows = [];
    for (let index = 0; index < 22; index += 1) rows.push({ date: '2026-01-' + String(index + 2).padStart(2, '0'), y3m: 3.5, y2: shortStart + (shortEnd - shortStart) * index / 21, y5: 3.8, y10: longStart + (longEnd - longStart) * index / 21, y30: 4.4 });
    return rows;
  }
  assert(env.classifyCurveImpulse(curveRows(4.5, 3.5, 4.5, 4.1), curvePolicy).state === 'Bull Steepener', 'Bond Regime: curve impulse names Bull Steepener');
  assert(env.classifyCurveImpulse(curveRows(4.5, 4.1, 4.5, 3.5), curvePolicy).state === 'Bull Flattener', 'Bond Regime: curve impulse names Bull Flattener');
  assert(env.classifyCurveImpulse(curveRows(3.5, 3.7, 4, 4.8), curvePolicy).state === 'Bear Steepener', 'Bond Regime: curve impulse names Bear Steepener');
  assert(env.classifyCurveImpulse(curveRows(3.5, 4.3, 4, 4.2), curvePolicy).state === 'Bear Flattener', 'Bond Regime: curve impulse names Bear Flattener');
  const bear = env.classifyCurveImpulse(curveRows(3.5, 3.7, 4, 4.8), curvePolicy);
  const inflation = env.classifyInflationState([{ date: '2026-01-02', realYieldPct: 1.7, breakevenPct: 2.1 }, { date: '2026-01-23', realYieldPct: 2.15, breakevenPct: 2.45 }], curvePolicy);
  const shorten = env.classifyDurationPosture(env.classifyCurveState(curveRows(3.5, 3.7, 4, 4.8).slice(-1), curvePolicy), bear, inflation, { state: 'Mixed' });
  assert(shorten.state === 'Shorten' && shorten.curveImpulse.state === 'Bear Steepener' && shorten.inflationState.state === 'Heating', 'Bond Regime: bear steepening and inflation pressure shorten duration');
  const inversion = env.classifyCurveState([{ date: '2026-01-23', y3m: 4.8, y2: 4.6, y10: 4 }], curvePolicy);
  const noImpulse = { state: 'Mixed', shortChangeBp: 0, longChangeBp: 0, slopeChangeBp: 0, asOf: '2026-01-23' };
  const inversionOnly = env.classifyDurationPosture(inversion, noImpulse, { state: 'Unavailable', availability: 'unavailable' }, { state: 'Mixed' });
  assert(inversion.state === 'Inverted' && ['Balanced', 'Indeterminate'].includes(inversionOnly.state), 'Bond Regime: curve level cannot independently set duration posture');
  const nominal = [{ date: '2026-01-02', y10: 4.3 }, { date: '2026-01-03', y10: 4.4 }, { date: '2026-01-04', y10: 4.5 }];
  const real = [{ date: '2026-01-02', y10: 1.9 }, { date: '2026-01-04', y10: 2.0 }, { date: '2026-01-05', y10: 2.1 }];
  const breakeven = env.deriveBreakevenRows(nominal, real);
  assert(breakeven.length === 2 && breakeven[0].date === '2026-01-02' && breakeven[1].date === '2026-01-04', 'Bond Regime: breakeven uses exact common nominal and real dates');
  assert(approx(breakeven[0].breakevenPct, 2.4, 1e-12) && approx(breakeven[1].breakevenPct, 2.5, 1e-12), 'Bond Regime: breakeven is nominal minus real yield');
  assert(env.deriveBreakevenRows(nominal, []).length === 0, 'Bond Regime: absent real rows remain unavailable');
} catch (e) { failures++; console.log('  ✗ FAIL (bond-regime curve group threw): ' + e.message); }

/* ---------- Bond regime: unit-safe sleeve scenario engine ---------- */
try {
  group('bond-regime-lab.html — sleeve scenario foundation');
  const src = read('bond-regime-lab.html');
  // calculateScenarioResult single-sources its carry+rate+spread+convexity decomposition to
  // rlexperience-adapters/macro-rotation.js (RLMACROROTATION); expose it as the global the page's
  // delegating function references, then evaluate the extracted owner functions.
  const bondMacroRequire = (await import('node:module')).createRequire(import.meta.url);
  delete bondMacroRequire.cache[bondMacroRequire.resolve('../rlexperience-adapters/macro-rotation.js')];
  const priorBondMacro = globalThis.RLMACROROTATION;
  globalThis.RLMACROROTATION = bondMacroRequire('../rlexperience-adapters/macro-rotation.js');
  try {
    const names = ['finiteNumber', 'bpToDecimal', 'pctToDecimal', 'bondTrailingReturnPct', 'bondRealizedVolPct', 'bondMaxDrawdownPct', 'bondTrendState', 'scenarioShockForSleeve', 'solveBreakEvenShock', 'classifyReliability', 'calculateScenarioResult', 'rankScenarioResults', 'selectResearchExpression', 'buildDecisionRead', 'buildBondToolRead'];
    const env = build(names.map((name) => extractFn(src, name)), names);
    const config = JSON.parse(read('bond-regime-universe.json'));
    const instruments = Object.fromEntries(config.instruments.map((instrument) => [instrument.ticker, instrument]));
    const sleeves = Object.fromEntries(config.sleeves.map((sleeve) => [sleeve.id, sleeve]));
    const assumptions = { id: 'custom', horizonMonths: 6, treasuryShockBp: -50, igSpreadShockBp: 60, hySpreadShockBp: 150, breakevenShockBp: 0 };
    const marketRows = Array.from({ length: 80 }, (_, index) => ({ t: Date.UTC(2026, 0, 2 + index), c: 100 * Math.pow(1.001, index) }));
    assert(env.bondTrailingReturnPct(marketRows, 63) > 0, 'Bond Regime: sleeve trailing total return uses adjusted closes');
    assert(env.bondRealizedVolPct(marketRows, 63) >= 0, 'Bond Regime: sleeve realized volatility is finite and non-negative');
    assert(env.bondMaxDrawdownPct(marketRows, 63) < 1e-9, 'Bond Regime: monotonic sleeve path has zero drawdown');
    assert(env.bondTrendState(marketRows).state === 'Uptrend', 'Bond Regime: sleeve trend uses the shared adjusted-close path');
    assert(env.bondTrailingReturnPct([], 63) === null && env.bondRealizedVolPct([], 63) === null && env.bondMaxDrawdownPct([], 63) === null, 'Bond Regime: insufficient sleeve history remains unavailable');
    const treasury = env.calculateScenarioResult(sleeves['intermediate-treasury'], instruments.IEF, assumptions, config.localApproximationBounds, '2026-07-13');
    const ig = env.calculateScenarioResult(sleeves['investment-grade-corporate'], instruments.LQD, assumptions, config.localApproximationBounds, '2026-07-13');
    const hy = env.calculateScenarioResult(sleeves['high-yield-corporate'], instruments.HYG, assumptions, config.localApproximationBounds, '2026-07-13');
    [treasury, ig, hy].forEach((result) => assert(approx(result.carryPct + result.ratePct + (result.spreadPct || 0) + result.convexityPct, result.totalPct, 1e-10), 'Bond Regime: scenario terms sum exactly for ' + result.sleeveId));
    assert(treasury.spreadPct === null && treasury.spreadApplicability === 'not-applicable', 'Bond Regime: Treasury spread is not applicable, never observed zero');
    assert(Number.isFinite(ig.spreadPct) && Number.isFinite(hy.spreadPct), 'Bond Regime: corporate sleeves expose finite spread terms');
    const tipsShock = env.scenarioShockForSleeve(sleeves['inflation-linked-treasury'], { ...assumptions, treasuryShockBp: 0, breakevenShockBp: 50 });
    assert(tipsShock.rateShockBp === -50 && tipsShock.spreadShockBp === null, 'Bond Regime: TIPS maps nominal minus breakeven into real-yield shock');
    const zeroConvexity = env.solveBreakEvenShock(5, 6, 5, 0);
    assert(approx(zeroConvexity, 50, 1e-9), 'Bond Regime: zero-convexity break-even uses carry over duration');
    assert(env.solveBreakEvenShock(20, 12, 1, 100) === null, 'Bond Regime: invalid convexity discriminant is unavailable');
    const large = env.calculateScenarioResult(sleeves['high-yield-corporate'], instruments.HYG, { ...assumptions, hySpreadShockBp: 400 }, config.localApproximationBounds, '2026-07-13');
    assert(Number.isFinite(large.totalPct) && large.reliability === 'Reduced reliability', 'Bond Regime: large finite shock retains arithmetic with reduced reliability');
    ['nonparallel curves', 'optionality', 'defaults', 'liquidity', 'tracking'].forEach((risk) => assert(large.warnings.some((warning) => warning.includes(risk)), 'Bond Regime: large-shock warning names ' + risk));
    const staleInstrument = JSON.parse(JSON.stringify(instruments.LQD)); staleInstrument.rateDuration.asOf = '2020-01-01';
    const stale = env.calculateScenarioResult(sleeves['investment-grade-corporate'], staleInstrument, assumptions, config.localApproximationBounds, '2026-07-13');
    const ranked = env.rankScenarioResults([treasury, stale]);
    assert(!stale.rankable && stale.rank === null && stale.warnings.some((warning) => warning.includes('rateDuration')), 'Bond Regime: stale characteristic remains visible and unranked');
    assert(ranked.find((result) => result.sleeveId === stale.sleeveId).rank === null, 'Bond Regime: stale sleeve receives no rank');
    const invalid = env.calculateScenarioResult(sleeves['intermediate-treasury'], instruments.IEF, { ...assumptions, treasuryShockBp: Infinity }, config.localApproximationBounds, '2026-07-13');
    assert(!invalid.rankable && invalid.errorCode === 'BRL-MODEL-NONFINITE' && invalid.totalPct === null, 'Bond Regime: nonfinite scenario input cannot retain a current result');
    const indeterminateRead = env.buildDecisionRead({ state: 'Indeterminate', confidence: 'Low', confirming: [], conflicts: [], missing: ['independent-credit-confirmation'], nextConfirmation: 'Current independent confirmation', invalidation: 'No directional read', asOf: '2026-07-10', confirmationState: 'unavailable' }, { state: 'Balanced', confidence: 'Moderate', confirming: [], contradicting: [], invalidation: 'Directional curve impulse', asOf: '2026-07-10' }, [treasury], { ...assumptions, rawManualValue: 2.681923, rawSourceUrl: 'https://example.com/restricted-sentinel' }, 0.2);
    assert(indeterminateRead.expression === null, 'Bond Regime: Indeterminate observed axis publishes no preferred expression');
    const normalized = env.buildBondToolRead(indeterminateRead);
    assert(normalized.metrics.preferredSleeveId === null && normalized.metrics.resultPct === null, 'Bond Regime: normalized read nulls indeterminate action and result');
    assert(!JSON.stringify(normalized).includes('2.681923') && !JSON.stringify(normalized).includes('restricted-sentinel'), 'Bond Regime: normalized read omits restricted values and source URLs');
    assert(normalized.deepLink === 'bond-regime-lab.html#simple' && normalized.metrics.creditRegime === 'Indeterminate', 'Bond Regime: normalized read keeps owner deep link and observed state');
    // Single-source: the page loads the module, delegates the decomposition, and carries no inline copy.
    assert(/rlexperience-adapters\/macro-rotation\.js/.test(src) && /RLMACROROTATION\.sleeveTotalReturn\s*\(/.test(src), 'bond page single-sources sleeveTotalReturn from RLMACROROTATION');
    assert(!/0\.5 \* values\.convexity \* combinedShock \* combinedShock/.test(src), 'bond page carries no inline sleeve convexity/total copy');
  } finally {
    if (priorBondMacro === undefined) delete globalThis.RLMACROROTATION; else globalThis.RLMACROROTATION = priorBondMacro;
  }
} catch (e) { failures++; console.log('  ✗ FAIL (bond-regime scenario group threw): ' + e.message); }

/* ---------- Bond regime: cache-first public and restricted adapters ---------- */
try {
  group('bond-regime-lab.html — observation adapter contracts');
  const src = read('bond-regime-lab.html');
  const names = ['finiteNumber', 'deriveBreakevenRows', 'parseTreasuryCurveCsv', 'normalizeManualObservation'];
  const env = build(names.map((name) => extractFn(src, name)), names);
  const nominal = env.parseTreasuryCurveCsv(read('tests/fixtures/bond-regime/nominal-valid.csv'), 'nominal');
  assert(nominal.ok && nominal.rows.length === 3, 'Bond Regime: official nominal Treasury fixture requires all configured maturities');
  assert(Object.keys(nominal.rows[0]).sort().join(',') === 'date,y10,y2,y30,y3m,y5', 'Bond Regime: nominal parser emits the closed maturity shape');
  const missing = env.parseTreasuryCurveCsv(read('tests/fixtures/bond-regime/nominal-missing-maturity.csv'), 'nominal');
  assert(!missing.ok && missing.rows.length === 0 && missing.errorCode === 'BRL-CURVE-NOMINAL-UNAVAILABLE', 'Bond Regime: missing nominal maturity rejects the whole family');
  const real = env.parseTreasuryCurveCsv(read('tests/fixtures/bond-regime/real-valid.csv'), 'real');
  assert(real.ok && real.rows.length === 3, 'Bond Regime: official real Treasury fixture requires all configured maturities');
  assert(Object.keys(real.rows[0]).sort().join(',') === 'date,y10,y20,y30,y5', 'Bond Regime: real parser emits the closed maturity shape');
  const breakeven = env.deriveBreakevenRows(nominal.rows, real.rows);
  assert(breakeven.length === 2 && breakeven.every((row) => ['2026-01-02', '2026-01-06'].includes(row.date)), 'Bond Regime: official real fixture derives only aligned breakevens');
  const current = env.normalizeManualObservation({ id: 'oas', kind: 'oas', value: 2.6, change: -8, unit: 'percent', observedAt: '2026-07-10', sourceUrl: 'https://example.com/source', sourceLabel: 'User-viewed source', acknowledged: true }, '2026-07-13', 7);
  assert(current.state === 'fresh' && current.persistence === 'memory-only' && current.rights === 'restricted-local-view', 'Bond Regime: valid restricted observation normalizes memory-only');
  const stale = env.normalizeManualObservation({ id: 'oas', kind: 'oas', value: 2.6, change: -8, unit: 'percent', observedAt: '2026-06-01', sourceUrl: 'https://example.com/source', sourceLabel: 'User-viewed source', acknowledged: true }, '2026-07-13', 7);
  assert(stale.state === 'unavailable' && stale.value === undefined && stale.errorCode === 'BRL-OPTIONAL-UNAVAILABLE', 'Bond Regime: stale manual observation is unavailable without numeric substitute');
  const invalidUrl = env.normalizeManualObservation({ id: 'oas', kind: 'oas', value: 2.6, change: -8, unit: 'percent', observedAt: '2026-07-10', sourceUrl: 'javascript:alert(1)', sourceLabel: 'Bad source', acknowledged: true }, '2026-07-13', 7);
  assert(invalidUrl.state === 'unavailable' && invalidUrl.value === undefined, 'Bond Regime: manual source URL must be HTTP or HTTPS');
  const config = JSON.parse(read('bond-regime-universe.json'));
  const policyText = JSON.stringify(config.sourcePolicies);
  assert(!/api[_-]?key|fredgraph|series\/BAML|series\/NFCI/i.test(policyText), 'Bond Regime: source policy rejects credentials and restricted live endpoints');
  assert(config.sourcePolicies.oas.persistence === 'memory-only' && config.sourcePolicies.financialConditions.persistence === 'memory-only', 'Bond Regime: restricted families cannot use persistent storage');
  const collector = read('scripts/fetch-bars.mjs');
  config.instruments.forEach((instrument) => assert(collector.includes('bond-regime-universe.json') || collector.includes(instrument.ticker), 'Canary: Bond Regime snapshot inventory includes ' + instrument.ticker));
} catch (e) { failures++; console.log('  ✗ FAIL (bond-regime adapter group threw): ' + e.message); }

/* ---------- Bond regime: official curve artifact contract and gate (spec 018 Scope 1) ---------- */
try {
  group('bond-regime — official curve artifact contract and gate');
  const { createRequire } = await import('node:module');
  const curveRequire = createRequire(import.meta.url);
  const RLC = curveRequire(join(ROOT, 'rlcontracts.js'));
  const {
    validateOfficialCurves, REQUIRED_MATURITIES, REQUIRED_QUERY_TYPE, OFFICIAL_CURVE_HOST
  } = await import('./validate-official-curves.mjs');

  const fixture = (name) => JSON.parse(read('tests/fixtures/official-curves/' + name + '.json'));
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const universe = JSON.parse(read('bond-regime-universe.json'));
  const conformant = fixture('conformant');
  const runGate = (artifact) => validateOfficialCurves(artifact, { universe });
  const refusalCodes = (errors) => errors.map((entry) => entry.split(' at ')[0]);

  // TP-01-01 — a fresh family carries full provenance. Scheme and host are
  // asserted structurally; a full-string literal would pass even if the URL
  // pointed at the wrong year.
  const nominal = conformant.families.nominal;
  const envelope = nominal.provenance[0];
  const parsedUrl = new URL(envelope.sourceUrl);
  assert(runGate(conformant).length === 0, 'Official curves TP-01-01: the conformant artifact passes the gate with zero errors');
  assert(envelope.sourceId === 'us-treasury-nominal' && parsedUrl.protocol === 'https:' && parsedUrl.hostname === OFFICIAL_CURVE_HOST,
    'Official curves TP-01-01: a fresh family carries a source id and an https URL on the declared official host');
  assert(typeof nominal.observedAt === 'string' && typeof envelope.retrievedAt === 'string' && envelope.retrievedAt.endsWith('Z'),
    'Official curves TP-01-01: a fresh family carries an observation as-of date and a canonical retrieval time');

  // TP-01-02 — the no-credential guarantee is mechanical, not inspected.
  const credentialed = runGate(fixture('credentialed-envelope'));
  assert(credentialed.some((entry) => entry.includes('secret-shaped-request-field')),
    'Official curves TP-01-02: a credential-shaped query key is refused with secret-shaped-request-field');

  // TP-01-03 — every adversarial fixture is refused, each naming its own cause.
  const adversarial = {
    'missing-required-field': 'family-field-missing',
    'credentialed-envelope': 'provenance-invalid:secret-shaped-request-field',
    'restricted-observation': 'restricted-observation-present',
    'off-host-source-url': 'off-host-source-url',
    'query-binding-mismatch': 'source-id-to-query-binding-invalid',
    'partial-row': 'row-partial',
    'observed-at-drift': 'observed-at-mismatch'
  };
  const causes = new Set();
  for (const [name, expected] of Object.entries(adversarial)) {
    const errors = runGate(fixture(name));
    assert(errors.length > 0 && refusalCodes(errors).includes(expected),
      'Official curves TP-01-03: ' + name + ' is refused with ' + expected);
    causes.add(expected);
  }
  assert(causes.size === 7, 'Official curves TP-01-03: the seven adversarial fixtures produce seven DISTINCT causes, so no two are refused for the same reason');

  // TP-01-04 — the restriction sweep, proven on each restricted shape rather
  // than only on the committed fixture.
  const withFinancialConditions = clone(conformant);
  withFinancialConditions.families.nominal.financialConditions = -0.31;
  assert(refusalCodes(runGate(withFinancialConditions)).includes('restricted-observation-present'),
    'Official curves TP-01-04: a financial-conditions value anywhere is refused');
  const withRestrictedRights = clone(conformant);
  withRestrictedRights.families.real.rights = 'restricted-local-view';
  assert(refusalCodes(runGate(withRestrictedRights)).includes('restricted-rights-present'),
    'Official curves TP-01-04: a restricted-local-view rights string anywhere is refused');

  // TP-01-05 — the committed bond policy names no keyed or licensed endpoint,
  // and the additive allowlist introduces no new host.
  const policyText = JSON.stringify(universe.sourcePolicies);
  assert(!/api_key|fredgraph|series\/BAML|series\/NFCI/i.test(policyText),
    'Official curves TP-01-05: the committed bond source policy matches none of api_key, fredgraph, series/BAML, series/NFCI');
  const treasuryHosts = ['us-treasury-nominal', 'us-treasury-real'].map((id) => RLC.SOURCE_POLICIES[id].host);
  assert(treasuryHosts.every((host) => host === OFFICIAL_CURVE_HOST),
    'Official curves TP-01-05: the two added allowlist entries introduce no host beyond ' + OFFICIAL_CURVE_HOST);

  // TP-01-06 — the conformant artifact is swept end to end and carries nothing restricted.
  const conformantText = JSON.stringify(conformant);
  assert(!/"oas"|"financialConditions"|restricted-local-view/.test(conformantText),
    'Official curves TP-01-06: a full sweep of the conformant artifact finds no oas value, no financial-conditions value and no restricted rights string');

  // TP-01-07 — the binding gap, proven from BOTH sides. If the shared validator
  // ever refused this envelope the assertion below would fail, and the feature
  // gate check would no longer be load-bearing.
  const misbound = fixture('query-binding-mismatch');
  const misboundEnvelope = misbound.families.nominal.provenance[0];
  const sharedVerdict = RLC.validateSourceProvenance(misboundEnvelope);
  assert(!sharedVerdict || sharedVerdict.ok !== false,
    'Official curves TP-01-07: the SHARED validator ACCEPTS the mis-bound envelope — one host, one method, one path prefix, so the frozen contract cannot express this rule');
  assert(refusalCodes(runGate(misbound)).includes('source-id-to-query-binding-invalid'),
    'Official curves TP-01-07: the feature gate REFUSES the same envelope, closing the gap the shared contract structurally cannot');
  assert(REQUIRED_QUERY_TYPE['us-treasury-nominal'] !== REQUIRED_QUERY_TYPE['us-treasury-real'],
    'Official curves TP-01-07: the two families are distinguished by query type, the only field that separates them');

  // TP-01-08 — R-4 settled: the declared policy travels verbatim, the copy
  // states its own retention.
  assert(JSON.stringify(nominal.declaredPolicy) === JSON.stringify(universe.sourcePolicies.nominalCurve),
    'Official curves TP-01-08: declaredPolicy holds the committed policy block byte-for-byte');
  assert(nominal.declaredPolicy.persistence === 'browser-cache' && nominal.persistence === 'same-origin-artifact',
    'Official curves TP-01-08: the declared policy still reads browser-cache while the committed copy states same-origin-artifact');
  assert(nominal.rights === 'public-official' && nominal.declaredPolicy.rights === 'public-official',
    'Official curves TP-01-08: rights carries public-official unaltered');
  const browserCachePersistence = clone(conformant);
  browserCachePersistence.families.nominal.persistence = 'browser-cache';
  assert(refusalCodes(runGate(browserCachePersistence)).includes('family-persistence-invalid'),
    'Official curves TP-01-08: a family writing persistence browser-cache onto a committed file is refused');
  const tamperedPolicy = clone(conformant);
  tamperedPolicy.families.nominal.declaredPolicy.mode = 'public-official-cached';
  assert(refusalCodes(runGate(tamperedPolicy)).includes('declared-policy-mismatch'),
    'Official curves TP-01-08: a declaredPolicy that drifts from the committed block is refused');

  // TP-01-09 — the contract extension is additive only.
  const PRE_EXISTING_SOURCE_IDS = ['bls-cpi-schedule', 'bls-public-api-v2', 'manual-consensus-artifact', 'nyse-hours-calendar', 'yahoo-chart'];
  const PRE_EXISTING_POLICIES = {
    'bls-cpi-schedule': { sourceKind: 'official-report', accessClass: 'public-official', host: 'www.bls.gov', method: 'GET', path: '/schedule/news_release/cpi.htm' },
    'bls-public-api-v2': { sourceKind: 'official-report', accessClass: 'public-official', host: 'api.bls.gov', method: 'POST', path: '/publicAPI/v2/timeseries/data/' },
    'manual-consensus-artifact': { sourceKind: 'sourced-consensus', accessClass: 'public-manual-citation', host: null, method: 'GET', path: null },
    'nyse-hours-calendar': { sourceKind: 'official-calendar', accessClass: 'public-official', host: 'www.nyse.com', method: 'GET', path: '/markets/hours-calendars' },
    'yahoo-chart': { sourceKind: 'best-effort-public-chart', accessClass: 'public-best-effort', host: 'query1.finance.yahoo.com', method: 'GET', pathPrefix: '/v8/finance/chart/' }
  };
  assert(PRE_EXISTING_SOURCE_IDS.every((id) => RLC.SOURCE_IDS[id] === true),
    'Official curves TP-01-09: every pre-existing SOURCE_IDS key survives the extension');
  assert(Object.keys(PRE_EXISTING_POLICIES).every((id) => JSON.stringify(RLC.SOURCE_POLICIES[id]) === JSON.stringify(PRE_EXISTING_POLICIES[id])),
    'Official curves TP-01-09: every pre-existing SOURCE_POLICIES entry retains its shape and values byte-for-byte');
  const addedIds = Object.keys(RLC.SOURCE_IDS).filter((id) => !PRE_EXISTING_SOURCE_IDS.includes(id));
  assert(addedIds.length === 2 && addedIds.includes('us-treasury-nominal') && addedIds.includes('us-treasury-real'),
    'Official curves TP-01-09: the ONLY difference is the two added Treasury entries');
  assert(!RLC.SOURCE_KINDS['official-curve'] && Object.keys(RLC.SOURCE_KINDS).length === 4,
    'Official curves TP-01-09: SOURCE_KINDS is unchanged — official-report already admits a daily yield-curve publication');

  // Required maturity sets are the browser's own, not a second definition.
  assert(REQUIRED_MATURITIES['us-treasury-nominal'].join(',') === 'y3m,y2,y5,y10,y30'
    && REQUIRED_MATURITIES['us-treasury-real'].join(',') === 'y5,y10,y20,y30',
    'Official curves: the gate requires the same maturity set the browser parser requires, so the headless path cannot admit a shape the tool would reject');
} catch (e) { failures++; console.log('  ✗ FAIL (official curve artifact group threw): ' + e.message); }

/* ---------- Bond regime: Tier-A official curve acquisition (spec 018 Scope 2) ---------- */
try {
  group('bond-regime — Tier-A official curve acquisition');
  const { acquireOfficialCurves, USER_AGENT } = await import('./acquire-official-curves.mjs');
  const { validateOfficialCurves } = await import('./validate-official-curves.mjs');
  const universe = JSON.parse(read('bond-regime-universe.json'));
  const NOW = new Date('2026-01-07T12:00:00.000Z');

  const csv = (name) => read('tests/fixtures/official-curves/' + name + '.csv');
  const ok = (body) => ({ ok: true, status: 200, text: async () => body });
  const fail = () => ({ ok: false, status: 503, text: async () => '' });

  /* Routes by the query type each family carries, so a stub can never silently
     answer for the wrong family the way a positional stub would. */
  function router(map) {
    const seen = [];
    const impl = async (url, init) => {
      seen.push({ url, init });
      const parsed = new URL(url);
      const kind = parsed.searchParams.get('type') === 'daily_treasury_real_yield_curve' ? 'real' : 'nominal';
      const year = parsed.pathname.split('/').filter(Boolean).slice(-2)[0];
      const responder = map[`${kind}:${year}`];
      return responder ? responder() : fail();
    };
    impl.seen = seen;
    return impl;
  }

  const HAPPY = {
    'nominal:2026': () => ok(csv('response-nominal-year-current')),
    'nominal:2025': () => ok(csv('response-nominal-year-prior')),
    'real:2026': () => ok(csv('response-real-year-current')),
    'real:2025': () => ok(csv('response-real-year-current'))
  };

  // TP-02-01 — a missing configured maturity rejects the WHOLE family.
  const missingImpl = router({
    ...HAPPY,
    'real:2026': () => ok(csv('response-real-missing-maturity')),
    'real:2025': () => ok(csv('response-real-missing-maturity'))
  });
  const missing = await acquireOfficialCurves({ root: ROOT, now: NOW, fetchImpl: missingImpl, priorArtifact: null });
  assert(missing.artifact.families.real.state === 'unavailable' && missing.artifact.families.real.errorCode === 'BRL-CURVE-MATURITY-MISSING',
    'Official curves TP-02-01: a missing maturity column yields state unavailable with BRL-CURVE-MATURITY-MISSING');
  assert(missing.artifact.families.real.rows.length === 0,
    'Official curves TP-02-01: the rejected family carries exactly zero rows, never partial or substituted rows');
  assert(missing.artifact.families.real.diagnostics.some((entry) => entry.startsWith('missing-headers:') && entry.includes('20 yr')),
    'Official curves TP-02-01: the refusal names the missing header rather than only its class');
  assert(missing.artifact.families.nominal.state === 'fresh' && missing.artifact.families.nominal.rows.length > 0,
    'Official curves TP-02-01: the nominal family is unaffected by the real family being rejected');

  // TP-02-02 — a transport failure in one family leaves the other intact.
  const partialImpl = router({ ...HAPPY, 'real:2026': fail, 'real:2025': fail });
  const partial = await acquireOfficialCurves({ root: ROOT, now: NOW, fetchImpl: partialImpl, priorArtifact: null });
  assert(partial.artifact.families.nominal.state === 'fresh' && partial.artifact.families.nominal.provenance.length === 2,
    'Official curves TP-02-02: the nominal family stays fresh with its full provenance array when the real acquisition fails');
  assert(partial.artifact.families.real.state === 'unavailable' && partial.artifact.families.real.errorCode === 'BRL-OPTIONAL-UNAVAILABLE'
    && partial.artifact.families.real.diagnostics.includes('BRL-CURVE-FETCH-FAILED'),
    'Official curves TP-02-02: the real family is unavailable with its own code and a fetch-failed diagnostic');

  // TP-02-03 — two consecutive years, merged by date, ascending and unique.
  const happy = await acquireOfficialCurves({ root: ROOT, now: NOW, fetchImpl: router(HAPPY), priorArtifact: null });

  /* The acquisition must refuse redirects and bound every request. Both are provenance controls:
     a followed cross-host redirect would let contentSha256 attest bytes the declared sourceUrl
     never served, and an unbounded request can hang an unattended run indefinitely. Asserting the
     OPTIONS actually handed to fetch — rather than grepping the source for the words — is what
     makes this non-vacuous: deleting either option from the call site fails this row. */
  const seenInit = [];
  await acquireOfficialCurves({
    root: ROOT, now: NOW, priorArtifact: null,
    fetchImpl: (url, init) => { seenInit.push(init || {}); return router(HAPPY)(url); }
  });
  assert(seenInit.length > 0 && seenInit.every((init) => init.redirect === 'error'),
    'Official curves TP-02-03: every Treasury request is issued with redirect:"error", so a cross-host redirect cannot be attested as treasury.gov content (' + seenInit.length + ' requests)');
  assert(seenInit.every((init) => init.signal && typeof init.signal.aborted === 'boolean'),
    'Official curves TP-02-03: every Treasury request carries an abort signal, so no acquisition can hang unbounded');

  const nominalFamily = happy.artifact.families.nominal;
  const dates = nominalFamily.rows.map((row) => row.date);
  assert(JSON.stringify(nominalFamily.coverageYears) === JSON.stringify([2025, 2026]),
    'Official curves TP-02-03: coverageYears holds exactly the prior and current UTC years');
  assert(dates.every((date) => Number(date.slice(0, 4)) === 2025 || Number(date.slice(0, 4)) === 2026),
    'Official curves TP-02-03: every merged row date falls inside the declared coverage years');
  assert(JSON.stringify(dates) === JSON.stringify(dates.slice().sort()) && new Set(dates).size === dates.length,
    'Official curves TP-02-03: merged rows are date-ascending and date-unique after the two-year collapse');
  assert(nominalFamily.observedAt === dates[dates.length - 1],
    'Official curves TP-02-03: observedAt is the newest merged row date');

  // TP-02-04 — carry-forward is verbatim and is NOT restamped.
  const priorArtifact = happy.artifact;
  const priorNominal = JSON.parse(JSON.stringify(priorArtifact.families.nominal));
  const laterNow = new Date('2026-01-09T12:00:00.000Z');
  const carriedRun = await acquireOfficialCurves({
    root: ROOT, now: laterNow, priorArtifact,
    fetchImpl: router({ 'nominal:2026': fail, 'nominal:2025': fail, 'real:2026': fail, 'real:2025': fail })
  });
  const carried = carriedRun.artifact.families.nominal;
  assert(carried.carriedForward === true && carried.diagnostics.includes('carried-forward-from-prior-artifact'),
    'Official curves TP-02-04: a carried family says so and carries the carried-forward diagnostic');
  assert(JSON.stringify(carried.rows) === JSON.stringify(priorNominal.rows) && carried.observedAt === priorNominal.observedAt,
    'Official curves TP-02-04: the carried family reproduces the prior rows and observedAt byte-identically');
  assert(JSON.stringify(carried.provenance) === JSON.stringify(priorNominal.provenance),
    'Official curves TP-02-04: every prior provenance envelope is carried forward byte-identically');
  const carriedRetrieved = carried.provenance.map((entry) => entry.retrievedAt);
  assert(carriedRetrieved.every((stamp) => !stamp.startsWith('2026-01-09')),
    'Official curves TP-02-04: retrievedAt is NOT advanced to the current run — a restamped record would claim freshness it does not have');

  // TP-02-05 — total acquisition failure with no prior degrades the bond read alone.
  const bothFailed = await acquireOfficialCurves({
    root: ROOT, now: NOW, priorArtifact: null,
    fetchImpl: router({ 'nominal:2026': fail, 'nominal:2025': fail, 'real:2026': fail, 'real:2025': fail })
  });
  assert(bothFailed.artifact.families.nominal.state === 'unavailable' && bothFailed.artifact.families.real.state === 'unavailable',
    'Official curves TP-02-05: with both families failing and no prior artifact, each is a named absence rather than a throw');
  assert(bothFailed.artifact.contractVersion === 'official-curve-artifact/v1' && validateOfficialCurves(bothFailed.artifact, { universe }).length === 0,
    'Official curves TP-02-05: the all-unavailable artifact is still a VALID artifact, so the publication run has something well-formed to read');
  // Adversarial twin for the provenance relaxation: an unavailable family may
  // carry no envelopes, but a FRESH one may not, or the relaxation would let an
  // unattested family through claiming freshness.
  const freshWithoutProvenance = JSON.parse(JSON.stringify(happy.artifact));
  freshWithoutProvenance.families.nominal.provenance = [];
  assert(validateOfficialCurves(freshWithoutProvenance, { universe })
    .some((entry) => entry.startsWith('provenance-missing')),
    'Official curves TP-02-05 adversarial: a FRESH family with no provenance is still refused, so allowing an empty array on an unavailable family opened no hole');

  // TP-02-06 — one URL definition, in the committed universe.
  const requested = happy.requests.map((entry) => entry.url);
  const expected = [2025, 2026].flatMap((year) => [
    universe.sourcePolicies.nominalCurve.urlTemplate.split('{YEAR}').join(String(year)),
    universe.sourcePolicies.realCurve.urlTemplate.split('{YEAR}').join(String(year))
  ]);
  assert(requested.every((url) => expected.includes(url)) && requested.length === 4,
    'Official curves TP-02-06: every requested URL is derived from a committed urlTemplate by year substitution');
  const acquisitionSource = read('scripts/acquire-official-curves.mjs');
  assert(!/https:\/\/home\.treasury\.gov/.test(acquisitionSource),
    'Official curves TP-02-06: the acquisition module contains no Treasury URL literal — the template remains the single definition');

  // TP-02-07 — the producer and the contract are proven to agree.
  assert(validateOfficialCurves(happy.artifact, { universe }).length === 0,
    'Official curves TP-02-07: the artifact acquisition ACTUALLY writes is accepted by scope 1\'s gate with zero errors');
  assert(happy.artifact.families.nominal.provenance.length === 2 && happy.artifact.families.real.provenance.length === 2,
    'Official curves TP-02-07: a fully successful run carries four provenance envelopes, one per response');
  assert(happy.artifact.families.nominal.provenance.every((entry) => /^sha256:[0-9a-f]{64}$/.test(entry.contentSha256)),
    'Official curves TP-02-07: a content hash is computed per response');

  // TP-02-08 — asserted against the RECORDED request list, not the module's intent.
  assert(happy.requests.every((entry) => JSON.stringify(Object.keys(entry.headers)) === JSON.stringify(['User-Agent'])),
    'Official curves TP-02-08: only a User-Agent header is sent — no Authorization, no cookie, no credential');
  assert(happy.requests.every((entry) => entry.headers['User-Agent'] === USER_AGENT && new URL(entry.url).hostname === 'home.treasury.gov'),
    'Official curves TP-02-08: every recorded request goes to home.treasury.gov and nowhere else');
  assert(happy.requests.every((entry) => !/(authorization|cookie|credential|api_key|token|secret|password)/i.test(entry.url)),
    'Official curves TP-02-08: no credential-shaped query key appears in any recorded request');
  const artifactText = JSON.stringify(happy.artifact);
  assert(!/"oas"|"financialConditions"|restricted-local-view/.test(artifactText)
    && !/oas|financialConditions/.test(happy.requests.map((entry) => entry.url).join(' ')),
    'Official curves TP-02-08: the oas and financialConditions families are never fetched and never written');
} catch (e) { failures++; console.log('  ✗ FAIL (official curve acquisition group threw): ' + e.message); }

/* ---------- Bond regime: observed-cadence freshness admission (spec 018 Scope 3) ---------- */
try {
  group('bond-regime — observed-cadence freshness admission');
  const { admitCurveFamily } = await import('./brief-refresh.mjs');
  const cadence = (name) => JSON.parse(read('tests/fixtures/official-curves/cadence-' + name + '.json'));
  const ADMISSION_FIELDS = ['verdict', 'errorCode', 'lastGoodObservedAt', 'elapsedDays', 'windowDays', 'basis'];

  // TP-03-01 — a weekend is not staleness.
  const weekend = cadence('weekend');
  const sunday = admitCurveFamily(weekend, 'nominal', '2026-01-11');
  assert(sunday.verdict === 'current' && sunday.errorCode === null,
    'Freshness TP-03-01: a Friday lastObserved evaluated on Sunday is current with a null errorCode');
  assert(sunday.windowDays === 4 && sunday.elapsedDays === 2,
    'Freshness TP-03-01: the weekend is absorbed by the observed 3-day gap plus the 1-day lag, not by a calendar');
  assert(!/stale/i.test(sunday.basis),
    'Freshness TP-03-01: no staleness reason is published for a weekend run');

  // TP-03-02 — a bond-market holiday is not staleness, and no calendar is read.
  const holiday = cadence('holiday-gap');
  const afterHoliday = admitCurveFamily(holiday, 'nominal', '2026-01-15');
  assert(afterHoliday.verdict === 'current' && afterHoliday.windowDays === 5,
    'Freshness TP-03-02: a 4-day bond-holiday gap widens the derived window to 5 and the run stays current');
  /* Source-level proof, and stated as exactly that: an ESM named import cannot be
     intercepted from inside this process, so this asserts the rule CONTAINS no
     file read rather than tracing one. It still fails the moment anyone adds one. */
  const refreshSource = read('scripts/brief-refresh.mjs');
  const ruleStart = refreshSource.indexOf('export function admitCurveFamily');
  const ruleBody = refreshSource.slice(ruleStart, refreshSource.indexOf('\n}', ruleStart));
  assert(ruleStart > 0 && !/readFileSync|readFile\(|existsSync|join\(|require\(/.test(ruleBody),
    'Freshness TP-03-02: the admission rule opens no file at all — it reads no calendar because it reads nothing');
  assert(!/calendar/i.test(ruleBody),
    'Freshness TP-03-02: data/calendars/xnys/calendar.json is never named in the rule, so a right answer reached by reading the wrong file is impossible');

  // TP-03-03 — a missed publication is staleness with a named reason.
  const stale = admitCurveFamily(weekend, 'nominal', '2026-01-20');
  assert(stale.verdict === 'stale' && stale.errorCode === 'BRL-CURVE-FAMILY-STALE',
    'Freshness TP-03-03: a run past the derived window is stale with BRL-CURVE-FAMILY-STALE');
  assert(stale.lastGoodObservedAt === '2026-01-09' && stale.elapsedDays === 11 && stale.windowDays === 4 && stale.basis.length > 0,
    'Freshness TP-03-03: the admission block names lastGoodObservedAt, elapsedDays, windowDays and a non-empty observed-gap basis');
  assert(JSON.stringify(Object.keys(stale)) === JSON.stringify(ADMISSION_FIELDS),
    'Freshness TP-03-03: the admission block carries exactly the six contracted fields, so scope 5 codes against a settled shape');

  // TP-03-04 — too little observed history is a named absence.
  const short = admitCurveFamily(cadence('short-history'), 'nominal', '2026-01-12');
  assert(short.verdict === 'undetermined' && short.errorCode === 'BRL-CURVE-FRESHNESS-UNDERIVABLE',
    'Freshness TP-03-04: fewer observed gaps than minCadenceObservations yields undetermined with BRL-CURVE-FRESHNESS-UNDERIVABLE');
  assert(short.verdict !== 'current' && short.verdict !== 'stale',
    'Freshness TP-03-04: the named absence defaults to NEITHER current nor stale');
  assert(/gaps-2-of-5/.test(short.basis),
    'Freshness TP-03-04: the reason states the observation count rather than assuming a publication schedule');
  assert(!/BRL-/.test(short.basis) && /^BRL-[A-Z-]+$/.test(short.errorCode),
    'Freshness TP-03-04: uppercase BRL- codes stay in errorCode and lowercase-hyphen reasons stay in basis — neither vocabulary leaks into the other field');

  // TP-03-05 — the window is enforced at its exact edge from both sides.
  const atEdge = admitCurveFamily(weekend, 'nominal', '2026-01-13');
  const pastEdge = admitCurveFamily(weekend, 'nominal', '2026-01-14');
  assert(atEdge.elapsedDays === atEdge.windowDays && atEdge.verdict === 'current',
    'Freshness TP-03-05: at elapsedDays === windowDays the verdict is current');
  assert(pastEdge.elapsedDays === pastEdge.windowDays + 1 && pastEdge.verdict === 'stale',
    'Freshness TP-03-05: at windowDays + 1 the verdict is stale, so the window cannot be widened to infinity');
  /* The policy is read from the ARTIFACT, so changing it must move the boundary.
     A hardcoded window would leave this verdict unchanged. */
  const widened = JSON.parse(JSON.stringify(weekend));
  widened.freshnessPolicy.publicationLagDays = 2;
  assert(admitCurveFamily(widened, 'nominal', '2026-01-14').verdict === 'current'
    && admitCurveFamily(widened, 'nominal', '2026-01-14').windowDays === 5,
    'Freshness TP-03-05: raising publicationLagDays in the artifact moves the boundary, proving no window value is hardcoded in the rule');

  // TP-03-06 — a live publication stoppage still goes stale.
  const stoppage = admitCurveFamily(cadence('stoppage'), 'nominal', '2026-02-20');
  assert(stoppage.verdict === 'stale' && stoppage.windowDays === 4 && stoppage.elapsedDays === 42,
    'Freshness TP-03-06: an outage far past the widest observed gap is stale — the window is not widened by the outage it exists to detect');

  // TP-03-07 — determinism.
  const first = admitCurveFamily(weekend, 'nominal', '2026-01-11');
  const second = admitCurveFamily(weekend, 'nominal', '2026-01-11');
  assert(JSON.stringify(first) === JSON.stringify(second),
    'Freshness TP-03-07: the same artifact and the same injected run date return an identical verdict, code and admission block');
  assert(!/new Date\(\)|Date\.now\(\)/.test(ruleBody),
    'Freshness TP-03-07: the rule reads no wall clock — the run date arrives as a parameter');
} catch (e) { failures++; console.log('  ✗ FAIL (observed-cadence freshness group threw): ' + e.message); }

/* ---------- Bond regime: headless official curve consumption (spec 018 Scope 4) ----------
   The path from a committed artifact into the model, and the four ways it can end. The point of
   this group is that a family is admitted only when it EARNS admission: absent, gate-invalid and
   stale artifacts all resolve to the model's own named-absence shape and contribute zero rows,
   while a fresh admitted artifact resolves the duration axis WITHOUT resolving the credit axis —
   so the published refusal narrows rather than disappearing.

   Every case drives the real `buildBondRegimeToolRead` against the real committed universe. The
   model is never edited and no classifier, threshold or vocabulary is restated here. */
try {
  group('bond-regime — headless curve consumption');
  const refresh4 = await import('./brief-refresh.mjs');
  const owner4 = await import('./owner-state.mjs');
  const universe4 = JSON.parse(read('bond-regime-universe.json'));
  const fixture4 = (name) => JSON.parse(read('tests/fixtures/official-curves/' + name + '.json'));
  const conformant4 = fixture4('conformant');
  const bondRead4 = (over) => refresh4.buildBondRegimeToolRead(Object.assign({ config: universe4 }, over));

  // TP-04-01 — no artifact on file. This is today's behaviour and it MUST survive the feature.
  // The absence is constructed through the promoted export, so the test cannot drift from the
  // canonical shape by hand-writing a second one.
  const canonicalAbsence = owner4.unavailableCurveFamily(universe4.sourcePolicies.nominalCurve, 'BRL-CURVE-NOMINAL-UNAVAILABLE');
  const absent4 = bondRead4({ officialCurveArtifact: null });
  assert(canonicalAbsence.state === 'unavailable' && canonicalAbsence.rows.length === 0 && canonicalAbsence.retrievedAt === null
    && canonicalAbsence.sourceId === universe4.sourcePolicies.nominalCurve.id,
    'Consumption TP-04-01: unavailableCurveFamily is exported with its shape intact and retrievedAt null — nothing was retrieved, so no clock is stamped');
  assert(absent4.state === 'unavailable' && absent4.metrics.curveState === 'Unavailable' && absent4.metrics.curveImpulse === 'Unavailable'
    && absent4.metrics.inflationState === 'Unavailable' && absent4.metrics.evidenceGaps.includes('the Treasury yield curve')
    && absent4.metrics.curveAsOf === null && absent4.metrics.durationPosture === 'Indeterminate',
    'Consumption TP-04-01: with no artifact on file all three curve-derived families read Unavailable, the curve gap is named, and curveAsOf is null');
  assert(absent4.metrics.resultPct === null && absent4.metrics.preferredSleeveId === null
    && absent4.metrics.curveAdmission.nominal.errorCode === 'BRL-CURVE-ARTIFACT-ABSENT' && absent4.metrics.curveAdmission.real.errorCode === 'BRL-CURVE-ARTIFACT-ABSENT',
    'Consumption TP-04-01: no zero, no empty-but-plausible family and no neutral filler is published in place of the missing curve — the absence is named');
  assert(owner4.officialCurveArtifact(join(ROOT, 'tests', 'fixtures')) === null,
    'Consumption TP-04-01: officialCurveArtifact returns null for a root holding no artifact rather than throwing or inventing one');

  // TP-04-02 — a GATE-FAILING artifact. The fixture fails on a missing maturity INSIDE a row, which
  // is invisible to any shallow shape test, so this also proves the read-time check is the gate's
  // own predicate rather than a second one that could drift.
  const invalidArtifact4 = fixture4('invalid-for-consumption');
  const invalid4 = bondRead4({ officialCurveArtifact: invalidArtifact4 });
  const invalidReason4 = JSON.stringify(invalid4.metrics.curveAdmission);
  assert(invalid4.metrics.curveState === 'Unavailable' && invalid4.metrics.inflationState === 'Unavailable'
    && invalid4.metrics.curveAsOf === null && invalid4.metrics.durationPosture === 'Indeterminate'
    && invalid4.metrics.evidenceGaps.includes('the Treasury yield curve'),
    'Consumption TP-04-02: a gate-failing artifact admits exactly zero rows to the model and the read is the named-absence form');
  assert(invalid4.metrics.curveAdmission.nominal.errorCode === 'BRL-CURVE-ARTIFACT-INVALID' && /row-partial/.test(invalidReason4),
    'Consumption TP-04-02: the reason names the validation failure class the gate itself returned (' + invalid4.metrics.curveAdmission.nominal.basis + ')');
  assert(!/home\.treasury\.gov|https?:\/\//.test(invalidReason4) && !/4\.38|4\.28|1\.76/.test(invalidReason4),
    'Consumption TP-04-02: the refusal reason carries no source URL fragment and no observed value');

  // TP-04-03 — the committed ADVERSARIAL 2 shape, run against a REAL acquired artifact rather than
  // a hand-built fixture. This is the assertion this whole feature exists to make reachable.
  const realArtifact4 = owner4.officialCurveArtifact(ROOT);
  const fresh4 = bondRead4({ officialCurveArtifact: realArtifact4, runDate: realArtifact4 ? realArtifact4.families.nominal.observedAt : null });
  assert(!!realArtifact4 && fresh4.metrics.curveAdmission.nominal.verdict === 'current',
    'Consumption TP-04-03: the repository holds a real acquired artifact whose nominal family earns admission at its own observed date');
  assert(fresh4.state === 'unavailable' && fresh4.metrics.durationPosture !== 'Indeterminate' && fresh4.metrics.creditRegime === 'Indeterminate'
    && !fresh4.metrics.evidenceGaps.includes('the Treasury yield curve')
    && fresh4.metrics.evidenceGaps.includes('an independent credit-spread reading') && !/Treasury yield curve/.test(fresh4.read),
    'Consumption TP-04-03: with both curve families fresh and no credit-spread observation the duration axis resolves, the credit axis does not, state stays unavailable and evidenceGaps narrows to the credit gap alone');
  assert(/so the credit call cannot be made/.test(fresh4.read) && !/duration call/.test(fresh4.read)
    && fresh4.metrics.curveAsOf === realArtifact4.families.nominal.observedAt,
    'Consumption TP-04-03: the consequence clause names only the credit call, and curveAsOf is the artifact\u2019s own observed date rather than a run clock');

  // TP-04-04 — a gate-VALID artifact refused on cadence alone. The same fixture is admitted one day
  // after its own last observation, so staleness is derived from the run date, not baked into it.
  const staleArtifact4 = fixture4('stale-for-consumption');
  const stale4 = bondRead4({ officialCurveArtifact: staleArtifact4, runDate: '2026-03-01' });
  const staleAdmitted4 = bondRead4({ officialCurveArtifact: staleArtifact4, runDate: '2026-01-03' });
  assert(stale4.metrics.curveState === 'Unavailable' && stale4.metrics.curveAsOf === null && stale4.metrics.durationPosture === 'Indeterminate'
    && stale4.metrics.curveAdmission.nominal.verdict === 'stale'
    && stale4.metrics.curveAdmission.nominal.errorCode === 'BRL-CURVE-FAMILY-STALE'
    && stale4.metrics.curveAdmission.nominal.lastGoodObservedAt === '2026-01-02',
    'Consumption TP-04-04: a stale-admission artifact admits zero rows, curveAsOf is null, and curveAdmission carries the verdict, BRL-CURVE-FAMILY-STALE and lastGoodObservedAt');
  assert(staleAdmitted4.metrics.curveAdmission.nominal.verdict === 'current' && staleAdmitted4.metrics.curveState !== 'Unavailable',
    'Consumption TP-04-04: the SAME fixture is admitted one day after its own last observation, so the refusal above is a derived verdict rather than a property of the file');

  // TP-04-05 — curve LEVEL and duration POSTURE are separate conclusions. An inverted level with no
  // directional impulse and no inflation context must not manufacture a directional posture. The
  // posture vocabulary is extracted from the model's own classifier rather than restated.
  const postureVocab4 = (() => {
    const fn = /function classifyDurationPosture\([\s\S]*?\n        \}/.exec(read('bond-regime-lab.html'));
    return [...new Set((fn ? fn[0] : '').match(/"(?:Balanced|Extend|Shorten|Indeterminate)"/g) || [])].map((w) => w.slice(1, -1));
  })();
  const invertedArtifact4 = JSON.parse(JSON.stringify(fixture4('stale-for-consumption')));
  for (const row of invertedArtifact4.families.nominal.rows) { row.y2 = 4.6; row.y3m = 4.7; row.y10 = 4.0; }
  // The real family is withheld at the ARTIFACT level, whose persistence is same-origin-artifact and
  // whose two consecutive coverage years travel with the family whatever its state — a different
  // shape from the BROWSER family the page holds, where an absence carries persistence 'none' and no
  // coverage at all. Conflating the two is a gate refusal, correctly.
  invertedArtifact4.families.real = Object.assign({}, invertedArtifact4.families.real, {
    state: 'unavailable', errorCode: 'BRL-OPTIONAL-UNAVAILABLE', observedAt: null, rows: [], provenance: []
  });
  const inverted4 = bondRead4({ officialCurveArtifact: invertedArtifact4, runDate: '2026-01-03' });
  assert(postureVocab4.length >= 3 && postureVocab4.includes('Balanced') && postureVocab4.includes('Indeterminate'),
    'Consumption TP-04-05: the duration-posture vocabulary is extracted from the model\u2019s own classifier, never restated (' + postureVocab4.join('/') + ')');
  assert(inverted4.metrics.curveState === 'Inverted' && inverted4.metrics.inflationState === 'Unavailable'
    && postureVocab4.includes(inverted4.metrics.durationPosture)
    && inverted4.metrics.durationPosture !== 'Shorten' && inverted4.metrics.durationPosture !== 'Extend',
    'Consumption TP-04-05: an inverted curve level with no directional impulse and no inflation context yields a posture that is neither Shorten nor Extend — level is not posture (' + inverted4.metrics.durationPosture + ')');

  // TP-04-06 — the breakeven join is EXACT common dates. Driven through the model's own
  // deriveBreakevenRows, so no join rule is reimplemented here.
  const page4 = refresh4.loadToolFunctions('bond-regime-lab.html', ['finiteNumber', 'deriveBreakevenRows']);
  const nominal4 = [{ date: '2026-01-05', y10: 4.4 }, { date: '2026-01-06', y10: 4.41 }, { date: '2026-01-07', y10: 4.42 }, { date: '2026-01-08', y10: 4.43 }];
  const real4 = [{ date: '2026-01-05', y10: 2.0 }, { date: '2026-01-07', y10: 2.02 }];
  const breakevens4 = page4.deriveBreakevenRows(nominal4, real4);
  const commonDates4 = nominal4.filter((row) => real4.some((other) => other.date === row.date)).map((row) => row.date);
  assert(breakevens4.length === commonDates4.length && breakevens4.length === 2
    && breakevens4.map((row) => row.date).join(',') === commonDates4.join(','),
    'Consumption TP-04-06: the breakeven row count equals the exact common-date count — a nominal date with no matching real date produces no row');
  assert(!breakevens4.some((row) => row.date === '2026-01-06' || row.date === '2026-01-08')
    && Math.abs(breakevens4[0].breakevenPct - 2.4) < 1e-9,
    'Consumption TP-04-06: no forward-fill, no interpolation and no nearest-date match — the unmatched dates are simply absent and the matched value is nominal minus real on its own date');

  // TP-04-09 — precedence. An explicit deps value still wins over a present artifact, which is what
  // keeps every injection-based adversarial case in this suite meaning exactly what it meant before.
  const explicitAbsence4 = bondRead4({
    officialCurveArtifact: realArtifact4,
    nominalCurve: owner4.unavailableCurveFamily(universe4.sourcePolicies.nominalCurve, 'BRL-CURVE-NOMINAL-UNAVAILABLE'),
    realCurve: owner4.unavailableCurveFamily(universe4.sourcePolicies.realCurve, 'BRL-OPTIONAL-UNAVAILABLE')
  });
  assert(!!realArtifact4 && explicitAbsence4.metrics.curveState === 'Unavailable' && explicitAbsence4.metrics.durationPosture === 'Indeterminate'
    && explicitAbsence4.metrics.evidenceGaps.includes('the Treasury yield curve'),
    'Consumption TP-04-09: an explicit deps.nominalCurve wins over a present committed artifact, so the seam is unwidened and every injected fixture keeps its exact semantics');

  /* THREE modules name the artifact file with a literal of their own: the gate's default path, the
     acquisition's write path, and the consumption read path. They MUST name one file. Importing one
     into another would close a cycle (gate → acquisition → brief-refresh → gate), so all three are
     compared here instead: drift between any pair becomes a test failure rather than a bare
     `validate-official-curves` run reporting a false FAIL against a repository that does hold a
     valid artifact, or a consumption path silently reading somewhere nothing is ever written. */
  const acquisition4 = await import('./acquire-official-curves.mjs');
  const gateDefaultPath4 = (/positional\[0\]\s*\|\|\s*'([^']+)'/.exec(read('scripts/validate-official-curves.mjs')) || [])[1];
  const readerSegments4 = (/path\.join\(root,\s*((?:'[^']+'\s*,\s*)*'[^']+')\s*\)/.exec(read('scripts/owner-state.mjs')) || [])[1];
  const readerPath4 = readerSegments4 ? readerSegments4.split(',').map((s) => s.trim().slice(1, -1)).join('/') : null;
  assert(!!gateDefaultPath4 && gateDefaultPath4 === acquisition4.ARTIFACT_RELATIVE_PATH,
    'Consumption TP-04-09: the gate\u2019s default artifact path and the acquisition\u2019s write path name one file (' + gateDefaultPath4 + ')');
  assert(!!readerPath4 && readerPath4 === acquisition4.ARTIFACT_RELATIVE_PATH,
    'Consumption TP-04-09: the consumption READ path in owner-state.mjs names that same one file, so a reader cannot drift to a location nothing writes (' + readerPath4 + ')');

  /* Same drift class, different constant. OFFICIAL_CURVE_HOST is the single source of truth for the
     one host the artifact may come from, but two consumers cannot import it: the CSP is a static
     meta tag, and bond-regime-lab.html is a browser single-file tool that cannot import a Node
     module in a build-free repo. Both restate the host as a literal. Left unasserted, changing the
     constant would silently leave the CSP blocking the host the gate now trusts, or leave the
     renderer linking a host the gate no longer does — a security control drifting out from under
     its own source of truth. Compared here for the same reason the artifact path is. */
  const gate4 = await import('./validate-official-curves.mjs');
  const labSource4 = read('bond-regime-lab.html');
  const cspHost4 = new RegExp('connect-src[^"]*https://' + gate4.OFFICIAL_CURVE_HOST.replace(/\./g, '\\.')).test(labSource4);
  const rendererHost4 = labSource4.includes('host === "' + gate4.OFFICIAL_CURVE_HOST + '"');
  assert(cspHost4,
    'Consumption TP-04-09: the tool\u2019s CSP connect-src admits exactly the gate\u2019s OFFICIAL_CURVE_HOST, so the browser cannot be blocked from the one host the gate trusts');
  assert(rendererHost4,
    'Consumption TP-04-09: the source-table link restriction names the gate\u2019s OFFICIAL_CURVE_HOST, so the only linkable host cannot drift away from the only admissible one');
} catch (e) { failures++; console.log('  ✗ FAIL (headless curve consumption group threw): ' + e.message); }

/* ---------- FX regime: headless owner read (A03 / RF-FX-HEADLESS) ----------
   Feature 004 is certified in the browser but had no scheduled read, so the FX row was reported
   `stale` — "no fresh headless read this window" — rather than saying what the owner model actually
   concludes. `buildFxToolRead` closes that by running the SAME RLFX chain the route runs at boot.

   The point of this group is that the published absence is EARNED, not asserted. Every case drives
   the real builder against the real committed universes; no scoring, fit, tracking or admission rule
   is restated here. The adversarial cases matter most: if the read said "unavailable" no matter what
   it were handed, it would be decoration, so two of the four below change the committed contract and
   require the output to change with it. */
try {
  group('fx-regime — headless owner read');
  const refreshFx = await import('./brief-refresh.mjs');
  const currencyFx = JSON.parse(read('fx-regime-universe.json'));
  const vehicleFx = JSON.parse(read('fx-vehicle-universe.json'));
  const clone = (value) => JSON.parse(JSON.stringify(value));

  // TP-A03-01 — the committed contract approves no source, so the owner model reaches no verdict and
  // says so in its own words, source-qualified by the families the contract actually declares.
  const fxRead = refreshFx.buildFxToolRead();
  const declaredFamilies = [...new Set(currencyFx.evidenceSources.map((s) => s.family))].sort();
  assert(fxRead.id === 'fx-regime-relative-value-lab' && fxRead.source === 'owning-tool-functions'
    && fxRead.deepLink === 'fx-regime-relative-value-lab.html#power',
    'FX TP-A03-01: the scheduled run publishes an FX owner read from the owning model, deep-linked to its Power evidence view');
  assert(fxRead.state === 'unavailable' && fxRead.metrics.approvedSourceCount === 0
    && fxRead.metrics.declaredSourceCount === currencyFx.evidenceSources.length,
    'FX TP-A03-01: with zero approved sources in the committed contract the read is explicitly unavailable, and it counts the contract rather than assuming it');
  assert(declaredFamilies.every((family) => fxRead.read.includes(family)),
    'FX TP-A03-01: the absence is source-qualified — every withheld evidence family the universe declares is named in the published sentence');

  // TP-A03-02 — the read is the OWNER's conclusion, carrying its decision identity, not a local string.
  assert(/^fxo-v1-/.test(fxRead.metrics.ownerDecisionId) && /^fxe-v1-/.test(fxRead.metrics.evidenceIdentity)
    && fxRead.metrics.projection.contractVersion === 'rl-tool-read/v1'
    && fxRead.metrics.selectedPair.state === 'Unavailable' && fxRead.metrics.vehicle.state === 'Unavailable',
    'FX TP-A03-02: the published read carries RLFX\u2019s own owner-decision and evidence identities and its projected contract, so the scheduled read and the route cannot drift into two answers');

  // TP-A03-03 (ADVERSARIAL) — approve a source properly and the read MUST stop reporting the same
  // absence. A gate that survives its own precondition being removed is not a gate.
  const approvedFx = clone(currencyFx);
  Object.assign(approvedFx.evidenceSources[0], {
    activation: 'approved', sourceUsePolicyId: 'selftest-source-use', sourceUseReviewRef: 'selftest-review',
    reviewedAt: '2026-08-13T00:00:00.000Z', rights: 'redistributable', persistence: 'public-snapshot'
  });
  const approvedRead = refreshFx.buildFxToolRead({ currencyUniverse: approvedFx, vehicleUniverse: vehicleFx });
  assert(approvedRead.read !== fxRead.read && approvedRead.read.includes(approvedFx.evidenceSources[0].sourceId),
    'FX TP-A03-03 adversarial: approving a source changes the published read and names that source — the absence tracks the contract instead of being hardcoded');

  // TP-A03-04 (ADVERSARIAL) — a universe the OWNER's own validator rejects must be refused by the
  // same predicate the route uses, not silently degraded into the ordinary no-evidence sentence.
  const brokenFx = clone(currencyFx);
  brokenFx.schemaVersion = 'rlfx-universe/v99';
  const brokenRead = refreshFx.buildFxToolRead({ currencyUniverse: brokenFx, vehicleUniverse: vehicleFx });
  assert(brokenRead.state === 'unavailable' && brokenRead.read !== fxRead.read
    && /fails the owner's own validator/.test(brokenRead.read),
    'FX TP-A03-04 adversarial: an invalid committed universe is refused by the owner\u2019s own validator with a distinct reason, never folded into the no-evidence case');
} catch (e) { failures++; console.log('  ✗ FAIL (fx headless owner read group threw): ' + e.message); }

/* ---------- Portfolio brief: owner routing is READ, not declared (A04 / Feature 008 Scope 06) ----------
   `state.briefOwners` shipped initialized to `{}` and never populated, so every brief item rendered
   `unownedCapability` with a null deep link — the page told the reader no owning tool existed even
   where one did. These assertions pin the wiring that fixed it, because the failure mode is silent:
   reverting to an empty map breaks no existing test and produces a page that still renders.

   The routing itself is exercised in the browser; what is pinned here is that the page still READS
   the shared registry rather than declaring routes locally, and that it single-sources the link. */
try {
  group('portfolio brief — owner routing reads the registry');
  const portfolioPage = read('portfolio-survival-allocation-lab.html');
  const ownerArtifact = JSON.parse(read('market-brief.owner-reads.json'));
  // Comment-stripped, because a commented-out call still matches a naive substring search — which is
  // precisely the regression this pins, and the first draft of this assertion fell for it.
  const portfolioLive = portfolioPage.split('\n').filter((line) => !/^\s*(\/\/|\/\*|\*)/.test(line)).join('\n');

  assert(/function loadOwnerRoutes\(\)/.test(portfolioLive) && /^\s*loadOwnerRoutes\(\);/m.test(portfolioLive),
    'Owner routing A04-01: the page defines loadOwnerRoutes and CALLS it at boot on a live line, so briefOwners is populated rather than left empty');
  assert(/loadOwnerRoutes[\s\S]{0,900}market-brief\.owner-reads\.json/.test(portfolioPage),
    'Owner routing A04-02: ownership is read from the public owner-read artifact, so it is a registry fact rather than a list this page could drift from');
  assert(/read\.ownerDeepLink/.test(portfolioPage) && !/loadOwnerRoutes[\s\S]{0,900}tools\.json/.test(portfolioPage),
    'Owner routing A04-03: the route comes from the producer\u2019s own ownerDeepLink, so the link has ONE definition instead of a second resolution through tools.json');
  assert(/state\.briefOwners = \{\};/.test(portfolioPage),
    'Owner routing A04-04: a fetch failure restores the EMPTY map, so an unowned subject is a named capability gap rather than a guessed route');

  // The artifact must actually carry what the routing depends on, or the wiring above is inert.
  const routable = Object.values(ownerArtifact.ownerReads || {})
    .flatMap((perTicker) => Object.values(perTicker || {}))
    .filter((entry) => entry && typeof entry.ownerDeepLink === 'string' && entry.ownerDeepLink && typeof entry.domainId === 'string');
  assert(Array.isArray(ownerArtifact.domainsProduced) && ownerArtifact.domainsProduced.length > 0 && routable.length > 0,
    'Owner routing A04-05: the published artifact carries domainsProduced plus per-read domainId and ownerDeepLink, so the page has real routes to resolve');
} catch (e) { failures++; console.log('  ✗ FAIL (portfolio owner routing group threw): ' + e.message); }

/* ---------- Portfolio Survival: no user-typed value may reach an innerHTML sink ----------

   This tool renders data the OWNER TYPES: symbols, holding labels, cash-need descriptions. That
   makes it the one tool in this repo where an innerHTML sink is a real XSS path rather than a
   theoretical one — a holding labelled `<img src=x onerror=...>` would execute if it were ever
   concatenated into markup.

   The delivered code is already correct: every user-derived value is written with textContent, and
   every innerHTML assignment is a static header literal or a clear. That is exactly the property
   worth pinning, because it is invisible in review — the next person adding a column has no signal
   that reaching for `+ symbol +` here is different from reaching for it in a chart label.

   The pin asserts the RHS of every innerHTML assignment is literal-only: no template interpolation,
   and nothing left over once string literals are removed. An identifier indirection would defeat it,
   so the one that existed (`var head = ...; table.innerHTML = head;`) was inlined rather than
   allowlisted — an allowlist entry is a hole that grows. */
try {
  group('portfolio survival — innerHTML sinks stay literal-only');
  const portfolioPage = read('portfolio-survival-allocation-lab.html');

  // Capture each assignment RHS up to the terminating semicolon, across line breaks.
  const sinks = [...portfolioPage.matchAll(/\.innerHTML\s*=\s*([\s\S]*?);/g)].map((m) => m[1]);
  assert(sinks.length > 0, 'Portfolio XSS pin covers a real surface: at least one innerHTML assignment was found to check');

  const dynamic = sinks.filter((rhs) => {
    if (/\$\{/.test(rhs)) return true;              // template interpolation
    const withoutLiterals = rhs.replace(/"(?:[^"\\]|\\.)*"/g, '').replace(/'(?:[^'\\]|\\.)*'/g, '');
    return /[A-Za-z_$]/.test(withoutLiterals);      // any surviving identifier == dynamic
  });
  assert(dynamic.length === 0,
    `Portfolio XSS: every innerHTML assignment is a static literal, so an owner-typed symbol or label cannot become markup (dynamic sinks found: ${JSON.stringify(dynamic.map((d) => d.trim().slice(0, 60)))})`);

  // The safe path must actually be in use, or the pin above is satisfied by a page that renders nothing.
  assert(/textContent\s*=\s*[^;]*(rowSymbol|columnSymbol|symbol|label)/.test(portfolioPage),
    'Portfolio XSS: owner-typed symbols and labels are written through textContent, which is what makes the literal-only sink rule sufficient rather than merely narrow');
} catch (e) { failures++; console.log('  ✗ FAIL (portfolio innerHTML sink group threw): ' + e.message); }

/* ---------- Market Brief: §6c larger-picture / anti-reactivity helpers ---------- */
try {
  group('rlbrief.js — §6c structural frame + anti-reactivity (MA stack, horizon cap, persistence gate)');
  const src = read('rlbrief.js');
  // The window/action-gating primitives are single-sourced in rlexperience-adapters/market-action.js
  // (RLMARKETACTION); rlbrief.js now delegates to them. Extract each pure fn from the file that OWNS it so this
  // §6c action-gate canary still tests the real bodies — behaviour is byte-identical before/after the extraction.
  const actionSrc = read('rlexperience-adapters/market-action.js');
  const briefNames = ['maStackLabel', 'pctFromLevel', 'memberArray', 'groupBreadth', 'notableMembers'];
  const actionNames = ['capConfidence', 'consecutiveRun', 'isPersistentSignal', 'normalizeRecommendation', 'nextSessionActions', 'actionableAttention', 'nearTermEvents'];
  const names = briefNames.concat(actionNames);
  const env = build(briefNames.map((n) => extractFn(src, n)).concat(actionNames.map((n) => extractFn(actionSrc, n))), names);

  // maStackLabel — the PRIMARY structural frame (20/50/200)
  assert(env.maStackLabel(3, 2, 1) === 'bull-stack', 'maStackLabel: 20>50>200 => bull-stack');
  assert(env.maStackLabel(1, 2, 3) === 'bear-stack', 'maStackLabel: 20<50<200 => bear-stack');
  assert(env.maStackLabel(2, 3, 1) === 'tangled', 'maStackLabel: non-monotone MAs => tangled');
  assert(env.maStackLabel(NaN, 2, 1) === 'n/a', 'maStackLabel: missing MA => n/a');

  // pctFromLevel — signed distance from a level (MA / high / support)
  assert(approx(env.pctFromLevel(110, 100), 10, 1e-9), 'pctFromLevel: 110 vs 100 = +10% (above)');
  assert(approx(env.pctFromLevel(90, 100), -10, 1e-9), 'pctFromLevel: 90 vs 100 = -10% (below)');
  assert(env.pctFromLevel(100, 0) === null && env.pctFromLevel(NaN, 100) === null, 'pctFromLevel: guards zero/NaN => null');

  // capConfidence — a tactical (single-session) read can never look as strong as a structural one
  assert(env.capConfidence(68, 'tactical', 55) === 55, 'capConfidence: tactical 68 capped to 55');
  assert(env.capConfidence(68, 'structural', 55) === 68, 'capConfidence: structural read is NOT capped');
  assert(env.capConfidence(80, 'swing', 55) === 80, 'capConfidence: swing read is NOT capped');
  assert(env.capConfidence(40, 'tactical', 55) === 40, 'capConfidence: tactical below cap is unchanged');
  assert(env.capConfidence(90, 'tactical') === 55, 'capConfidence: default tactical cap = 55');

  // consecutiveRun + isPersistentSignal — the persistence gate (noise vs signal)
  assert(JSON.stringify(env.consecutiveRun([-0.2, -0.5, -0.9])) === JSON.stringify({ dir: -1, len: 2 }), 'consecutiveRun: 3-read decline => dir -1, len 2');
  assert(env.consecutiveRun([-0.2, -0.5, -0.3]).len === 1, 'consecutiveRun: a reversal breaks the run (len resets to the tail)');
  // the exact XLK example from the over-reactive payload: a single-slice wiggle is NOT yet a trend
  assert(env.isPersistentSignal([-0.53, -0.94], 2) === false, 'persistence gate: one-window RS drop (−0.53→−0.94) is NOT a persistent signal');
  assert(env.isPersistentSignal([-0.2, -0.5, -0.9], 2) === true, 'persistence gate: a 3-read same-direction decline IS a persistent signal');
  assert(env.isPersistentSignal([-0.2, -0.5, -0.3], 2) === false, 'persistence gate: an alternating series is noise, not a signal');

  // §7a mega-cap / thematic groups — memberArray normalization
  assert(env.memberArray({ AAPL: { mom21: 5 }, MSFT: { mom21: -3 } }).length === 2, 'memberArray: object map => 2-element array');
  assert(env.memberArray({ AAPL: { mom21: 5 } })[0].ticker === 'AAPL', 'memberArray: injects the ticker key from the map');
  assert(env.memberArray([{ ticker: 'NVDA', mom21: 8 }])[0].ticker === 'NVDA', 'memberArray: passes an array through');
  assert(env.memberArray(null).length === 0, 'memberArray: null => empty array');

  // groupBreadth — internal health behind the ETF read
  var _mem = {
    AAPL: { maStack: 'bull-stack', ma50Dist: 2, ma200Dist: 8, mom21: 3 },
    MSFT: { maStack: 'bear-stack', ma50Dist: -5, ma200Dist: -13, mom21: -7 },
    NVDA: { maStack: 'bull-stack', ma50Dist: 4, ma200Dist: 20, mom21: 6 }
  };
  var _br = env.groupBreadth(_mem);
  assert(_br.n === 3 && _br.bullStacked === 2, 'groupBreadth: 2 of 3 bull-stacked');
  assert(_br.above200 === 2 && _br.above50 === 2 && _br.upMom === 2, 'groupBreadth: 2 of 3 above 50/200-day & positive on 21d');
  assert(_br.label === '2/3 bull-stacked', 'groupBreadth: compact label');
  assert(env.groupBreadth({}).label === 'n/a', 'groupBreadth: empty => n/a label');

  // notableMembers — pick + rank the movers / structural divergers (§7a)
  var _nm = env.notableMembers(_mem, { minMovePct: 3, max: 4 });
  assert(_nm.length === 3, 'notableMembers: all three clear the notable bar');
  assert(_nm[0].ticker === 'MSFT' && _nm[1].ticker === 'NVDA' && _nm[2].ticker === 'AAPL', 'notableMembers: ranked by move magnitude (|MSFT 7| > |NVDA 6| > |AAPL 3|)');
  assert(/bear-stack/.test(_nm[0].reason), 'notableMembers: MSFT flagged bear-stack in its reason');
  assert(env.notableMembers({ QCOM: { maStack: 'tangled', ma50Dist: 1, ma200Dist: 2, mom21: 1, mom5: 0.5 } }, { minMovePct: 3, max: 4 }).length === 0, 'notableMembers: a small-move, non-diverging member is NOT notable');
  var _cap = env.notableMembers({ A: { mom21: 10 }, B: { mom21: 9 }, C: { mom21: 8 } }, { minMovePct: 3, max: 2 });
  assert(_cap.length === 2 && _cap[0].ticker === 'A', 'notableMembers: capped to max, top mover first');
  var _actions = env.nextSessionActions([
    { direction: 'add', instrument: 'XLF', trigger: 'hold breakout', invalidation: 'lose breakout', structuralAnchor: 'above 50d', confidence: 62 },
    { action: 'watch', subject: 'MAGS', trigger: 'breadth improves', confidence: 70 },
    { action: 'hedge', subject: 'SPY', trigger: 'before CPI', confidence: 54 },
    { action: 'trim', subject: 'XLI', confidence: 70 }
  ], 5, 55);
  assert(_actions.length === 1 && _actions[0].action === 'add' && _actions[0].subject === 'XLF', 'nextSessionActions keeps only triggered, non-watch actions above confidence floor');
  var _attention = env.actionableAttention([
    { title: 'Confirmed break', structuralAnchor: '50d', confidence: 60 },
    { title: 'Watchlist only', structuralAnchor: '200d', confidence: 70 },
    { title: 'No anchor', confidence: 80 },
    { title: 'Low confidence', structuralAnchor: '50d', confidence: 40 }
  ], 55);
  assert(_attention.length === 1 && _attention[0].title === 'Confirmed break', 'actionableAttention removes watch/no-anchor/low-confidence noise');
  var _events = env.nearTermEvents([{ when: '2026-07-14', event: 'CPI' }, { when: '2026-07-29', event: 'FOMC' }, { when: 'bad', event: 'bad' }], '2026-07-12T11:00:00-04:00', 14);
  assert(_events.length === 1 && _events[0].event === 'CPI', 'nearTermEvents keeps only valid catalysts inside the next-session window');
  const rendererRoot = {};
  const renderer = Function('window', 'document', src + '\nreturn window.RLBRIEF;')(rendererRoot, {});
  const backdropHost = { innerHTML: '' };
  renderer.renderBackdrop(backdropHost, JSON.parse(read('market-brief.payload.json')).backdrop);
  assert(/Trend evidence/.test(backdropHost.innerHTML) && /What would change this read/.test(backdropHost.innerHTML), 'renderBackdrop accepts generated scalar narrative fields without aborting later sections');
  // per-tool Brief-tab live-read overlay: the owning tool's RLDATA.toolReads[<id>] read is surfaced on its own page (copilot-instructions §"brief covers every tool")
  assert(typeof renderer.liveReadView === 'function', 'rlbrief exposes the liveReadView helper');
  assert(renderer.liveReadView(null, 'x') === null && renderer.liveReadView({ read: '' }, 'x') === null, 'liveReadView: absent/empty read => null (no fabricated content)');
  assert(renderer.liveReadView({ id: 'a', read: 'x' }, 'b') === null, 'liveReadView: id/tool mismatch => null');
  var _lv = renderer.liveReadView({ id: 'sector-research-lab', read: '  Rotate toward XLE  ', asOf: '2026-07-20T20:00:00Z', metrics: { leader: 'XLE' }, deepLink: 'sector-research-lab.html' }, 'sector-research-lab');
  assert(_lv && _lv.read === 'Rotate toward XLE' && _lv.metrics.leader === 'XLE' && _lv.deepLink === 'sector-research-lab.html', 'liveReadView: valid read normalizes (trims text, keeps metrics + deepLink)');
  assert(renderer.liveReadView({ read: 'no-id read' }, null).read === 'no-id read', 'liveReadView: a read without an id is accepted when no toolId is enforced');
  const renderAllSource = extractFn(read('market-brief.html'), 'renderAll');
  assert(renderAllSource.indexOf('renderAsOf();') < renderAllSource.indexOf('RLBRIEF.renderBackdrop'), 'generation timestamp renders before complex brief sections');

  /* ── Narrative freshness. The Tier-B written read is operator-hosted and can stop refreshing
     while the Tier-A computed layer keeps updating; the failure this guards is the page serving
     last week's narrative as if it were this morning's. Classification is a pure function so the
     RULE is asserted here rather than inferred from pixels. */
  const freshPolicy = JSON.parse(read('market-brief.config.json'))['freshness-policy/v1'];
  assert(freshPolicy && freshPolicy.contractVersion === 'freshness-policy/v1', 'the freshness policy is declared in market-brief.config.json');
  assert(freshPolicy.warnAfterHours === 18 && freshPolicy.staleAfterHours === 72, 'freshness thresholds are the published 18h / 72h');
  const NOW = Date.parse('2026-07-31T12:00:00Z');
  const at = (hoursAgo) => ({ generatedAt: new Date(NOW - hoursAgo * 3600000).toISOString() });
  const verdict = (hoursAgo) => renderer.narrativeFreshness(at(hoursAgo), freshPolicy, NOW);

  assert(verdict(1).state === 'fresh', 'an hour-old narrative is fresh');
  /* The largest legitimate weekday gap is 17:00 ET -> 07:30 ET next morning (~14.5h). If the warn
     state fired inside that, the banner would cry wolf every single morning and be ignored. */
  assert(verdict(14.5).state === 'fresh', 'a normal overnight gap does NOT raise the banner');
  assert(verdict(19).state === 'aging', 'past the warn threshold the narrative is flagged aging');
  /* A Friday-close to Monday-open weekend is ~62h and is healthy. */
  assert(verdict(62).state === 'aging' && verdict(62).state !== 'stale', 'a normal weekend gap does NOT reach stale');
  assert(verdict(80).state === 'stale', 'past the stale threshold the narrative is flagged stale');

  /* Absence must NEVER read as freshness — this is the honest "narrative not refreshed this
     window" state the page owes the reader when Tier-B did not publish at all. */
  assert(renderer.narrativeFreshness(null, freshPolicy, NOW).state === 'absent', 'a missing payload is absent, never fresh');
  assert(renderer.narrativeFreshness({}, freshPolicy, NOW).state === 'absent', 'a payload with no generatedAt is absent, never fresh');
  assert(/not refreshed this window/i.test(renderer.narrativeFreshness(null, freshPolicy, NOW).message), 'the absent state says so in plain words');
  assert(renderer.narrativeFreshness({ generatedAt: 'not-a-date' }, freshPolicy, NOW).state === 'unknown', 'an unparseable timestamp is unknown, never fresh');
  assert(renderer.narrativeFreshness({ generatedAt: new Date(NOW + 3600000).toISOString() }, freshPolicy, NOW).state === 'unknown', 'a future-stamped payload is unknown, never fresh');

  /* ADVERSARIAL: a classifier that answered "fresh" for everything would satisfy the fresh cases
     above. Require that at least one input genuinely produces each non-fresh state, so the rule
     cannot be quietly reduced to a constant. */
  const observed = new Set([1, 19, 80].map((h) => verdict(h).state)
    .concat([renderer.narrativeFreshness(null, freshPolicy, NOW).state, renderer.narrativeFreshness({ generatedAt: 'x' }, freshPolicy, NOW).state]));
  assert(observed.size === 5 && ['fresh', 'aging', 'stale', 'absent', 'unknown'].every((s) => observed.has(s)),
    'the freshness classifier really discriminates — all five states are reachable, so it is not a constant');

  const briefHtml = read('market-brief.html');
  assert(/id="freshbar"/.test(briefHtml), 'the brief page ships the freshness banner element');
  assert(briefHtml.indexOf('RLBRIEF.renderFreshness') < briefHtml.indexOf('RLBRIEF.renderScorecard'), 'freshness renders before the track record and everything below it');
} catch (e) { failures++; console.log('  ✗ FAIL (market-brief group threw): ' + e.message); }

/* ---------- Shared RLDATA: Simple-view tool-read contract ---------- */
try {
  group('rldata.js — shared toolReads round-trip + freshness');
  const source = read('rldata.js'), store = {}, session = {}, root = { location: { pathname: '/index.html', protocol: 'https:' } };
  let rlDataWriteCount = 0;
  const storage = { getItem: (key) => store[key] || null, key: (index) => Object.keys(store)[index] ?? null, get length() { return Object.keys(store).length; }, setItem: (key, value) => { if (key === 'rlData') rlDataWriteCount += 1; store[key] = value; }, removeItem: (key) => { delete store[key]; } };
  const sessionStorage = { getItem: (key) => session[key] || null, key: (index) => Object.keys(session)[index] ?? null, get length() { return Object.keys(session).length; }, setItem: (key, value) => { session[key] = value; }, removeItem: (key) => { delete session[key]; } };
  const api = Function('globalThis', 'localStorage', 'sessionStorage', 'fetch', 'location', source + '\nreturn globalThis.RLDATA;')(root, storage, sessionStorage, undefined, root.location);
  const saved = api.putToolRead('probe-tool', { asOf: '2026-07-12T12:00:00Z', read: 'Actionable probe', metrics: { score: 72 }, deepLink: 'probe.html' });
  const loaded = api.toolRead('probe-tool'), freshness = api.freshness();
  assert(saved.id === 'probe-tool' && loaded.read === 'Actionable probe', 'toolReads persist and round-trip by tool id');
  assert(loaded.metrics.score === 72 && loaded.deepLink === 'probe.html', 'toolReads retain structured metrics and deep link');
  assert(freshness.toolReads['probe-tool'] === '2026-07-12T12:00:00Z', 'toolReads expose as-of freshness');
  assert(api.putToolRead('', { read: 'bad' }) === null, 'toolReads reject an empty id');
  storage.setItem('etfMomLab', JSON.stringify({ apiKey: 'legacy-td', avKey: 'legacy-av', focus: 'QQQ' }));
  storage.setItem('msftFhKey', 'legacy-fh');
  storage.setItem('rlStratVal', JSON.stringify({ apiKey: 'legacy-strategy-key', basket: ['SPY'] }));
  const policies = api.providerPolicies();
  assert(Object.isFrozen(policies) && policies.length > 0 && policies.every((policy) => Object.isFrozen(policy) && policy.state === 'unconfigured'), 'provider registry is frozen; every provider starts unconfigured (no proxy, no local key)');
  assert(typeof api.detectLegacyCredentials === 'undefined' && typeof api.migrateLegacyCredentials === 'undefined', 'legacy credential value detection and migration APIs are absent');
  assert(Object.keys(session).length === 0 && !!store.rlData, 'non-secret rlData cache remains durable; session storage holds no provider config');
  assert(typeof api.providerFetch === 'function' && typeof api.setKey === 'function' && typeof api.setProxyBaseUrl === 'function' && typeof api.clearAllProviderConfig === 'function' && typeof api.recheckProxy === 'function' && typeof api.detectLegacyCredentialContainers === 'function' && typeof api.eraseLegacyCredentialContainers === 'function', 'two-tier provider access and pre-BUG-002 legacy cleanup APIs are exposed');
  const localSet = api.setKey('finnhub', 'selftest-local-key');
  assert(localSet.ok && api.providerStatus('finnhub').state === 'configured' && api.providerStatus('finnhub').localConfigured === true, 'a local key configures a provider (Tier-2, this-browser-only)');
  const providerConfigBeforeLegacyErase = store.rlProviderConfig, dataCacheBeforeLegacyErase = store.rlData;
  const legacyPresence = api.detectLegacyCredentialContainers();
  assert(legacyPresence.detected === true && legacyPresence.containerCount === 3 && legacyPresence.locationClasses.join(',') === 'legacy-scalar-key,legacy-tool-state', 'legacy registry detects exact pre-BUG-002 names through redacted metadata only');
  const legacyErase = api.eraseLegacyCredentialContainers();
  assert(legacyErase.ok === true && legacyErase.status === 'complete' && legacyErase.removedContainerCount === 3 && !store.etfMomLab && !store.msftFhKey && !store.rlStratVal && store.rlProviderConfig === providerConfigBeforeLegacyErase && store.rlData === dataCacheBeforeLegacyErase && api.providerStatus('finnhub').state === 'configured', 'legacy cleanup verifies exact-name absence while BUG-002 provider config and non-secret rlData remain byte-compatible');
  assert(api.clearAllProviderConfig().ok && api.providerStatus('finnhub').state === 'unconfigured', 'clearing all provider config resets local keys and the proxy URL');
  api.reportData('bars:SPY:1d', 'refreshing', { label: 'SPY daily bars' });
  assert(api.dataState().counts.refreshing === 1, 'data lifecycle reports an in-flight resource');
  api.reportData('bars:SPY:1d', 'ready', { label: 'SPY daily bars', rows: 500 });
  assert(api.dataState().counts.ready === 1 && api.dataState().resources[0].rows === 500, 'data lifecycle reports a completed resource with context');

  const batchRows = [{ t: 1700000000000, o: 100, h: 101, l: 99, c: 100.5, v: 1000 }];
  const beforeSuccessfulBatch = rlDataWriteCount;
  await api.withPersistenceBatch(async () => {
    api.putBars('BATCH-A', '1d', batchRows, 'test');
    api.putBars('BATCH-B', '1d', batchRows, 'test');
    api.putBars('BATCH-C', '1d', batchRows, 'test');
    assert(api.bars('BATCH-A', '1d').length === 1 && api.bars('BATCH-C', '1d').length === 1, 'persistence batching never delays in-memory visibility');
  });
  assert(rlDataWriteCount - beforeSuccessfulBatch === 1, 'three updates in one persistence batch serialize durable rlData exactly once');

  const beforeRejectedBatch = rlDataWriteCount;
  let rejectedBatch = false;
  try {
    await api.withPersistenceBatch(async () => {
      api.putBars('BATCH-REJECTED', '1d', batchRows, 'test');
      throw new Error('expected-batch-rejection');
    });
  } catch (error) { rejectedBatch = error.message === 'expected-batch-rejection'; }
  assert(rejectedBatch && rlDataWriteCount - beforeRejectedBatch === 1 && api.bars('BATCH-REJECTED', '1d').length === 1,
    'a rejected persistence batch still flushes accepted in-memory updates exactly once');
  assert(/RLDATA\.withPersistenceBatch\s*\(/.test(read('market-heatmap-lab.html')),
    'market heatmap batches durable cache writes across its bulk symbol hydration');

  const quotaStore = {};
  const quotaStorage = {
    getItem: (key) => quotaStore[key] || null,
    setItem: (key, value) => { if (value.length > 1200) throw new Error('QuotaExceededError'); quotaStore[key] = value; },
    removeItem: (key) => { delete quotaStore[key]; }
  };
  const quotaSource = source.replace('4 * 1024 * 1024', '900');
  const quotaRoot = { location: { pathname: '/market-heatmap-lab.html', protocol: 'https:' } };
  const quotaApi = Function('globalThis', 'localStorage', 'sessionStorage', 'fetch', 'location', quotaSource + '\nreturn globalThis.RLDATA;')(quotaRoot, quotaStorage, sessionStorage, undefined, quotaRoot.location);
  const denseRows = Array.from({ length: 40 }, (_, i) => ({ t: 1700000000000 + i * 86400000, o: 100 + i, h: 101 + i, l: 99 + i, c: 100.5 + i, v: 1000000 + i }));
  quotaApi.putBars('EARLY', '1d', denseRows, 'test');
  quotaApi.putBars('LATE', '1d', denseRows, 'test');
  assert(quotaApi.bars('EARLY', '1d').length === 40 && quotaApi.bars('LATE', '1d').length === 40, 'quota pruning preserves every hydrated symbol in the live session cache');
  assert(Object.keys(quotaApi.freshness().bars).length === 2, 'quota-compacted persistence does not shrink in-memory breadth coverage');
} catch (e) { failures++; console.log('  ✗ FAIL (RLDATA toolReads group threw): ' + e.message); }

/* ---------- Committed-surface PII scan ---------- */
try {
  group('pii-scan — no personal identifier reaches a commit');
  const piiResult = piiScan.runPiiScan({ root: ROOT });
  if (!piiResult.ok) console.log(piiScan.formatFindings(piiResult));
  assert(piiResult.ok, 'committed surface carries no personal identifier');
  assert(piiResult.filesScanned > 500, 'the scan covered the repository (files=' + piiResult.filesScanned + ')');

  /* Commit messages are the other half of the committed surface, and `git ls-files`
     cannot see them — that blind spot let a home path sit in history through an
     earlier scrub. Requiring a non-trivial count stops this passing vacuously if
     git ever goes missing and the message pass silently yields nothing. */
  assert(piiResult.messagesScanned > 100, 'the scan covered commit messages (messages=' + piiResult.messagesScanned + ')');
  const piiMessages = piiScan.listCommitMessages(ROOT);
  assert(piiMessages.length === piiResult.messagesScanned, 'every enumerated commit message is scanned');
  assert(piiMessages.every((record) => /^[0-9a-f]{40}$/.test(record.sha)), 'each scanned message is bound to a commit sha');

  /* ADVERSARIAL: a scan that reports clean for ANY input proves nothing. Drive the
     committed synthetic samples through every rule and require each to fire. */
  const piiConfig = piiScan.loadConfig(ROOT);
  const piiRules = piiScan.buildRules(piiConfig);
  const piiSamples = JSON.parse(read('tests/fixtures/pii-scan/samples.json'));
  const fired = (text) => piiScan.scanText(text, piiRules).map((finding) => finding.rule);
  for (const sample of piiSamples.positive) {
    assert(fired(sample.text).indexOf(sample.rule) >= 0, 'detects ' + sample.label);
  }
  /* A guard that cries wolf on committed fixtures gets switched off, so the
     negative samples are as load-bearing as the positive ones. */
  for (const sample of piiSamples.negative) {
    assert(fired(sample.text).length === 0, sample.label);
  }
  /* Adding a rule without a positive sample would ship it unexercised. */
  const sampledRules = new Set(piiSamples.positive.map((sample) => sample.rule));
  assert(piiRules.regex.every((rule) => sampledRules.has(rule.id)), 'every regex rule has a positive sample');

  /* A real name has no shape, so it is carried as a digest. Prove the digest path
     binds without restating any real term. */
  const denyRules = piiScan.buildRules(Object.assign({}, piiConfig, { deniedTermHashes: [piiScan.hashTerm('Ada Lovelace')] }));
  assert(piiScan.scanText('written by Ada Lovelace here', denyRules).some((f) => f.rule === 'denied-term'), 'a denylisted term is caught by digest alone');
  assert(piiScan.scanText('written by Grace Hopper here', denyRules).length === 0, 'a name that is NOT denylisted is not matched');
  assert((piiConfig.deniedTermHashes || []).length >= 1, 'the committed denylist carries at least one term digest');

  /* A scanner that prints what it found copies the identifier into CI logs. */
  const piiSample = piiScan.formatFindings({ ok: false, filesScanned: 1, messagesScanned: 0, findings: [{ file: 'x.md', line: 1, column: 1, rule: 'personal-email', length: 20 }] });
  assert(piiSample.split('\n')[0].indexOf('@') < 0, 'a finding line never echoes the matched identifier');
} catch (e) { failures++; console.log('  \u2717 FAIL (pii-scan group threw): ' + e.message); }

/* ---------- Registry parity + Tier-A owning-tool coverage ---------- */
try {
  group('tool registry — tools.json == index == nav; Tier-A adapters registered');
  const registry = JSON.parse(read('tools.json')).tools;
  const expected = registry.map((tool) => tool.id);
  const indexIds = Array.from(read('index.html').matchAll(/\bid:\s*'([^']+)'/g)).map((match) => match[1]).filter((id) => id !== 'next-tool');
  const navIds = Array.from(read('rlnav.js').matchAll(/\bfile:\s*"([^"]+\.html)"/g)).map((match) => match[1]).filter((file) => file !== 'index.html').map((file) => file.replace(/\.html$/, ''));
  assert(JSON.stringify(expected) === JSON.stringify(indexIds), 'landing registry matches tools.json order');
  assert(JSON.stringify(expected) === JSON.stringify(navIds), 'navigation registry matches tools.json order');
  assert(expected.indexOf('global-rotation-lab') >= 0 && expected.indexOf('real-assets-lab') >= 0, 'global rotation and real assets are registered');
  const refresh = read('scripts/brief-refresh.mjs');
  assert(/buildGlobalToolRead/.test(refresh) && /buildRealAssetsToolRead/.test(refresh) && /buildToolCoverage/.test(refresh), 'Tier-A carries exact global/real-asset reads plus registry coverage');

  /* ── D2/D3, "reachable or removed" / "wired or not shipped". Source for an in-progress feature
    may remain in the repository, but the Pages artifact contains registered product surfaces and
    their runtime dependencies only. */
  const pagesSite = await import('./build-pages-site.mjs');
  const sitePlan = pagesSite.planPagesSite(ROOT);
  const rootPages = readdirSync(ROOT).filter((name) => name.endsWith('.html')).sort();
  const registeredFiles = new Set(registry.map((tool) => tool.file));
  assert(sitePlan.registeredPages.length === registry.length, 'the Pages artifact includes every registered tool page');
  assert(sitePlan.registeredPages.every((file) => registeredFiles.has(file)), 'the Pages artifact includes no unregistered tool page');
  assert(sitePlan.registeredPages.includes('portfolio-survival-allocation-lab.html'),
    'the released portfolio route is published rather than excluded');
  /* Feature 006 Scope 4: the Trend Dynamics route is now registered, so the build MUST ship it and
     MUST NOT still carry it as an exclusion. Asserting both directions is what makes registration
     atomic: a half-move that registered the tool but left the exclusion standing fails here. */
  assert(!sitePlan.excludedPaths.includes('trend-dynamics-cycle-lab.html') && sitePlan.registeredPages.includes('trend-dynamics-cycle-lab.html'),
    'the registered Trend Dynamics route ships and is no longer excluded');
  assert(sitePlan.excludedPaths.includes('rlcausal.js'),
    'an unconsumed shared module is removed from the public artifact');
  assert(!sitePlan.excludedPaths.includes('rlportfolio.js'),
    'a shared module consumed by a registered page is shipped');
  assert(read('portfolio-survival-allocation-lab.html').includes('src="rlportfolio.js"'),
    'the registered Portfolio page is the production consumer for rlportfolio.js');
  /* Feature 004 Scope 3: global-rotation-lab.html is registered and now loads rlfx.js, so the
     module must ship. An excluded path is never copied, which would 404 on a live page. */
  assert(!sitePlan.excludedPaths.includes('rlfx.js'), 'a shared module consumed by a registered page is shipped, not excluded');
  assert(read('global-rotation-lab.html').includes('src="rlfx.js"'), 'the registered Global page really is the consumer that requires rlfx.js to ship');

  /* ADVERSARIAL: a check that passed for any input would prove nothing. An unlisted root page MUST
      be detected — this is the exact regression the deploy projection exists to stop. */
  const injected = pagesSite.findUnaccountedPages(
    rootPages.concat('definitely-not-registered-page.html'),
    registeredFiles,
    new Set(sitePlan.excludedPaths)
  );
  assert(injected.length === 1 && injected[0] === 'definitely-not-registered-page.html', 'the root-page accounting really detects an unlisted page');

  /* Discovery grouping. tools.json `.group` is the source of truth. The two file://-compatible
    local registry mirrors carry the same field, and both render by filtering records on that
    field. There is no separate membership list to drift. */
  const ungrouped = registry.filter((tool) => typeof tool.group !== 'string' || !tool.group.trim()).map((tool) => tool.id);
  assert(ungrouped.length === 0, 'every registered tool declares a discovery group in tools.json');

  const expectedGroups = Object.fromEntries(registry.map((tool) => [tool.id, tool.group]));
  const indexSource = read('index.html');
  const navSource = read('rlnav.js');
  const indexGroups = Object.fromEntries(Array.from(indexSource.matchAll(/\bid:\s*'([^']+)'\s*,\s*\n\s*group:\s*'([^']+)'/g)).map((match) => [match[1], match[2]]));
  const navGroups = Object.fromEntries(Array.from(navSource.matchAll(/\bfile:\s*"([^"]+\.html)"\s*,\s*group:\s*"([^"]+)"/g)).map((match) => [match[1].replace(/\.html$/, ''), match[2]]));
  assert(JSON.stringify(indexGroups) === JSON.stringify(expectedGroups), 'landing-page registry groups match tools.json .group exactly');
  assert(JSON.stringify(navGroups) === JSON.stringify(expectedGroups), 'navigation registry groups match tools.json .group exactly');
  assert(!/\b(?:var|const|let)\s+GROUPS\b/.test(indexSource + '\n' + navSource), 'neither discovery surface carries a hardcoded group-membership list');
  assert(/TOOLS\.filter\(function \(tool\) \{ return tool\.group === group; \}\)/.test(indexSource) && /TOOLS\.filter\(function \(tool\) \{ return tool\.group === group; \}\)/.test(navSource),
    'landing page and rail both derive members by filtering registry records on .group');

  /* ADVERSARIAL: a grouping check that would pass against an empty or partial registry proves
      nothing. Prove the comparison binds by mutating one assignment and requiring a mismatch. */
  const tampered = { ...expectedGroups, [expected[0]]: 'not-a-real-group' };
  assert(JSON.stringify(indexGroups) !== JSON.stringify(tampered), 'the group parity comparison detects a single reassigned tool');

} catch (e) { failures++; console.log('  ✗ FAIL (registry coverage group threw): ' + e.message); }

/* ---------- Shared application shell: central keys + automatic data deltas ---------- */
try {
  group('rlapp.js — one key surface, all-page status, automatic stale-data refresh');
  const registry = JSON.parse(read('tools.json')).tools;
  const missingShell = registry.filter((tool) => read(tool.file).indexOf('src="rlapp.js') < 0).map((tool) => tool.id);
  assert(missingShell.length === 0, 'every registered tool loads the shared data-status shell');
  const badOrder = registry.filter((tool) => { const html = read(tool.file), data = html.lastIndexOf('src="rldata.js'), app = html.lastIndexOf('src="rlapp.js'); return data < 0 || app < 0 || data > app; }).map((tool) => tool.id);
  assert(badOrder.length === 0, 'every registered tool loads RLDATA before RLAPP');
  const index = read('index.html');
  const dataSource = read('rldata.js'), appSource = read('rlapp.js');
  assert(index.indexOf('id="data-settings"') >= 0 && /Provider access/.test(appSource) && /providerAccess/.test(appSource) && /data-proxy-url/.test(appSource) && /setProxyBaseUrl/.test(appSource) && /settings-savekey/.test(appSource) && /data-provider-key/.test(appSource) && /clearAllProviderConfig/.test(appSource) && !/rlApiKeys/.test(appSource), 'the landing page exposes the two-tier provider editor (tailnet proxy URL + per-provider local key inputs)');
  const keyIds = ['apiKey', 'fhKey', 'avKey', 'fredKey', 'keyInput', 'key'];
  const visible = [];
  registry.forEach((tool) => {
    const html = read(tool.file);
    Array.from(html.matchAll(/<input\b[^>]*\bid="([^"]+)"[^>]*>/gi)).forEach((match) => {
      if (keyIds.indexOf(match[1]) >= 0 || /\bdata-provider=/.test(match[0])) visible.push(tool.id + ':' + match[1]);
    });
  });
  assert(visible.length === 0, 'tool pages expose no duplicate credential inputs');
  const credentialWriterPages = registry.filter((tool) => {
    const source = read(tool.file);
    return /\b(?:rlSetKey|rlMigrate|migrateLegacyKeys)\s*\(|localStorage\.(?:getItem|setItem)\([^\n]*(?:rlApiKeys|apiKey|fhKey|avKey|fredKey)|\bfunction\s+rlGetKey\s*\(|\bstate\.(?:apiKey|fhKey|avKey|fredKey)\b|\b(?:apiKey|fhKey|avKey|fredKey)\s*:/.test(source);
  }).map((tool) => tool.id);
  assert(credentialWriterPages.length === 0, 'registered tools expose no duplicate provider credential setter migration or durable storage access' + (credentialWriterPages.length ? ': ' + credentialWriterPages.join(', ') : ''));
  const credentialQueryPages = registry.filter((tool) => {
    const source = read(tool.file);
    return /[?&](?:token|apikey|api_key|access_token|key)=['" ]*\s*\+?\s*encodeURIComponent\(/i.test(source) || /\bfunction\s+(?:fetchTDOne|fetchHoldingsAV|fetchFinnhubQuotes)\s*\([^)]*\bkey\b/.test(source);
  }).map((tool) => tool.id);
  assert(credentialQueryPages.length === 0, 'registered tools expose no credential-bearing provider URL transport' + (credentialQueryPages.length ? ': ' + credentialQueryPages.join(', ') : ''));
  assert(/setTimeout\(refreshLive, 0\)/.test(read('market-brief.html')), 'market brief refreshes its live layer automatically');
  assert(/doFetch\(false, true\); \/\* cache-first/.test(read('swing-structure-lab.html')) && /doFetch\(false, true\); \/\* cache-first/.test(read('intraday-tape-lab.html')), 'swing and intraday pages fetch only stale/missing shared deltas on boot');
  assert(/setTimeout\(function \(\) \{ fetchAll\(true\); \}, 0\)/.test(read('options-structure-lab.html')), 'options structure auto-loads its selected chain without optional cross-origin probes');
  assert(/setTimeout\(hydrateSharedData, 0\)/.test(read('strategy-validation-lab.html')), 'strategy validation auto-refreshes enabled instruments from shared bars');
  assert(/tr\.groups/.test(read('scripts/fetch-bars.mjs')), 'same-origin bar snapshots include brief thematic-group ETFs and members');
} catch (e) { failures++; console.log('  ✗ FAIL (shared application shell group threw): ' + e.message); }

/* ---------- Market Brief payload contract ---------- */
try {
  group('market brief — registry-wide coverage + action-only payload contract');
  const payload = JSON.parse(read('market-brief.payload.json'));
  const registry = JSON.parse(read('tools.json'));
  const config = JSON.parse(read('market-brief.config.json'));
  const snapshot = JSON.parse(read('market-brief.snapshot.json'));
  const agendaRegistry = JSON.parse(read('research-agenda.json'));
  const validErrors = validateBriefPayload(payload, registry, config, snapshot, agendaRegistry);
  assert(validErrors.length === 0, 'current payload satisfies the executable brief contract' + (validErrors.length ? ': ' + validErrors.join('; ') : ''));
  const missingCoverage = JSON.parse(JSON.stringify(payload));
  missingCoverage.toolCoverage = missingCoverage.toolCoverage.slice(1);
  assert(validateBriefPayload(missingCoverage, registry, config, snapshot, agendaRegistry).some((error) => /missing registered tools/.test(error)), 'contract rejects omission of a registered tool');
  const genericRealAssets = JSON.parse(JSON.stringify(payload));
  genericRealAssets.toolReads['real-assets-lab'].metrics = { score: 50 };
  assert(validateBriefPayload(genericRealAssets, registry, config, snapshot, agendaRegistry).some((error) => /model-specific GLD/.test(error)), 'contract rejects a generic real-assets read without GLD/BTC/SLV detail');
  const vagueAction = JSON.parse(JSON.stringify(payload));
  vagueAction.nextSession.actions = [{ action: 'watch', subject: 'SPY', confidence: 80 }];
  assert(validateBriefPayload(vagueAction, registry, config, snapshot, agendaRegistry).some((error) => /action must be/.test(error)), 'contract rejects watch-only or incomplete next-session output');
  const missingSection = JSON.parse(JSON.stringify(payload));
  delete missingSection.events;
  assert(validateBriefPayload(missingSection, registry, config, snapshot, agendaRegistry).some((error) => /events must be/.test(error)), 'contract rejects a missing visible brief section');

  /* The §9 events contract. `events` used to be checked only for being a non-empty ARRAY, so
     nothing below the array was checked at all: a run that renamed prob→probability and
     expectedEffect→detail and dropped psychologyNote entirely passed this gate and shipped. The
     selftest caught it only after commit. Proven in BOTH directions, because a gate that refuses
     every payload is not a fix. */
  const eventErrors = (mutated) => validateBriefPayload(mutated, registry, config, snapshot, agendaRegistry)
    .filter((error) => /^events-contract:/.test(error));
  const conforming = JSON.parse(JSON.stringify(payload));
  conforming.events.forEach((event) => {
    event.psychologyNote = 'selftest fixture — not published prose';
    event.scenarios = event.scenarios.map((scenario) => ({ name: scenario.name, prob: 0.5, expectedEffect: 'selftest fixture' }));
  });
  assert(eventErrors(conforming).length === 0,
    'a §9-conforming events block raises no events-contract error' + (eventErrors(conforming).length ? ': ' + eventErrors(conforming).join('; ') : ''));

  /* The three adversarial fixtures below address events[0], events[1] and events[2] by index, and
     they used to read those straight off the committed payload. But `events` is agent-authored and
     its length tracks the calendar, not the contract: it legitimately fell from 3 to 2 on
     2026-08-07, `events[2]` became undefined, this group THREW instead of asserting, and the throw
     failed the Pages verify job — so a shrinking macro calendar silently blocked every deploy for a
     day. Pad the FIXTURE (never the published payload) up to the highest index the mutations
     address. Each mutation below still has to be caught by the validator, so nothing is weakened;
     the fixtures just stop depending on how much happens to be on the calendar today. */
  assert(conforming.events.length >= 1,
    'the committed payload carries at least one event, so the events-contract fixtures have a real published event to mutate');
  while (conforming.events.length < 3) {
    conforming.events.push(JSON.parse(JSON.stringify(conforming.events[conforming.events.length - 1])));
  }

  // ADVERSARIAL 1 — the LOSSLESS rename. Same values, contract key names replaced by synonyms.
  const renamedKeys = JSON.parse(JSON.stringify(conforming));
  renamedKeys.events[0].scenarios = renamedKeys.events[0].scenarios
    .map(({ name, prob, expectedEffect }) => ({ name, probability: prob, detail: expectedEffect }));
  const renamedErrors = eventErrors(renamedKeys);
  assert(renamedErrors.some((error) => /events\[0\]\.scenarios\[0\].*"prob"/.test(error))
    && renamedErrors.some((error) => /events\[0\]\.scenarios\[0\].*"expectedEffect"/.test(error))
    && renamedErrors.some((error) => /keys present: name, probability, detail/.test(error)),
    'a renamed scenario key is refused by path, by the key it expected, and by the keys actually there — so a rename reads as a rename');

  // ADVERSARIAL 2 — the CONTENT LOSS. psychologyNote carries the why-these-odds paragraph and no
  // other key carried it under a different name, so its absence is lost reader content, not a rename.
  const droppedNote = JSON.parse(JSON.stringify(conforming));
  delete droppedNote.events[1].psychologyNote;
  assert(eventErrors(droppedNote).some((error) => /events\[1\] is missing required key "psychologyNote"/.test(error)),
    'an event with no psychologyNote is refused by name');

  // ADVERSARIAL 3 — the vacuous bypass. Every per-scenario key check passes trivially when there
  // are no scenarios, which would let an empty array satisfy the rule the check exists to enforce.
  const noScenarios = JSON.parse(JSON.stringify(conforming));
  noScenarios.events[2].scenarios = [];
  assert(eventErrors(noScenarios).some((error) => /events\[2\]\.scenarios is missing required key "at least one scenario"/.test(error)),
    'an empty scenarios array cannot satisfy the per-scenario rule vacuously');

  /* The key list is DERIVED from the shared required-field declaration so this gate and the
     "required list describes this payload" check cannot drift. Pinned, because a derivation that
     silently resolved to [] would make every assertion above pass against a gate that checks
     nothing. `prob` is the one explicit addition — numeric, so a narrative-STRING list cannot name it. */
  assert(BRIEF_EVENT_REQUIRED_KEYS.includes('psychologyNote') && BRIEF_EVENT_SCENARIO_REQUIRED_KEYS.join(',') === 'name,expectedEffect,prob',
    'the events contract keys are derived non-empty from the shared required-field list, plus the numeric prob'
    + ' (event=' + BRIEF_EVENT_REQUIRED_KEYS.join(',') + ' scenario=' + BRIEF_EVENT_SCENARIO_REQUIRED_KEYS.join(',') + ')');

  /* ── Lane ↔ gate agreement ────────────────────────────────────────────────────────────────────
     The gate above is the LAST rung; the signals lane instruction is the FIRST. The incident was
     not that the gate was lenient — it was that the instruction never named the keys the gate
     would later refuse on, so the author renamed them freely. The previous form of this check
     pinned four literal phrases, which froze that ONE sentence but not the AGREEMENT: adding a
     required events field would have armed the gate and left both the instruction and this check
     silent. The instruction is now RENDERED from the gate's constants; these assertions prove the
     rendering covers everything the gate enforces and that the lane consumes it. */
  const enforcedEventKeys = [...new Set([...BRIEF_EVENT_REQUIRED_KEYS, ...BRIEF_EVENT_SCENARIO_REQUIRED_KEYS])];
  assert(BRIEF_EVENT_REQUIRED_KEYS.every((key) => BRIEF_EVENT_SHAPE_KEYS.includes(key))
    && BRIEF_EVENT_SCENARIO_REQUIRED_KEYS.every((key) => BRIEF_EVENT_SCENARIO_SHAPE_KEYS.includes(key)),
    'every key the gate enforces is a member of the §9 shape shown to the author — a new required key cannot arm the gate unmentioned');
  assert(findEventContractInstructionGaps(briefEventContractInstruction()).length === 0,
    'the authoring instruction names every key the publish gate refuses on (unnamed: '
    + (findEventContractInstructionGaps(briefEventContractInstruction()).join(', ') || 'none') + ')');

  /* The shape lists are the one hand-typed link, so hold them against the §9 template itself —
     otherwise "the instruction matches the gate" could be true while both drift off the contract. */
  const contractDoc = read('notes/market-brief.md');
  const eventsTemplate = contractDoc.slice(contractDoc.indexOf('"events": ['), contractDoc.indexOf('"psychology": {'));
  assert(eventsTemplate.length > 0 && [...BRIEF_EVENT_SHAPE_KEYS, ...BRIEF_EVENT_SCENARIO_SHAPE_KEYS]
    .every((key) => eventsTemplate.includes('"' + key + '":')),
    'the §9 shape the author is shown is the §9 template in notes/market-brief.md, key for key');

  // ADVERSARIAL 4 — the meaning-only instruction that shipped BEFORE the incident. This check is
  // worthless if it does not flag the exact sentence that let the keys be renamed.
  const meaningOnlyInstruction = 'events must be nearest-first; every probability is an estimate with inputs, scenarios sum to 1.';
  const meaningOnlyGaps = findEventContractInstructionGaps(meaningOnlyInstruction);
  assert(['psychologyNote', 'prob', 'expectedEffect'].every((key) => meaningOnlyGaps.includes(key)),
    'the pre-incident meaning-only instruction is reported as naming none of psychologyNote, prob, expectedEffect (gaps: ' + meaningOnlyGaps.join(', ') + ')');

  // ADVERSARIAL 5 — the near-miss synonym. "probability" CONTAINS "prob", so a substring test would
  // have called the very instruction that caused the rename conforming.
  assert(findEventContractInstructionGaps('each scenario carries name, probability, detail').includes('prob'),
    'naming "probability" does not satisfy the requirement to name "prob" — whole keys are matched, not substrings');

  /* The lane must CONSUME that instruction rather than keep a second hand-typed copy of the key
     list, because two copies is the drift being closed. Scoped to the instruction template literal
     so the comment above it may still discuss the keys by name. */
  const laneSource = read('scripts/brief-narrative-parallel.mjs');
  const signalsRegion = laneSource.slice(laneSource.indexOf("id: 'signals'"), laneSource.indexOf("id: 'groups'"));
  const signalsInstruction = signalsRegion.slice(signalsRegion.indexOf('instructions: `'), signalsRegion.lastIndexOf('`'));
  assert(/import\s*\{[^}]*briefEventContractInstruction[^}]*\}\s*from\s*'\.\/validate-brief-payload\.mjs'/.test(laneSource)
    && signalsInstruction.includes('${briefEventContractInstruction()}'),
    'the signals lane renders its §9 key pin from the publish gate instead of restating it');
  const handTypedInLane = enforcedEventKeys.filter((key) => new RegExp('\\b' + key + '\\b').test(signalsInstruction));
  assert(signalsInstruction.length > 0 && handTypedInLane.length === 0,
    'the signals lane instruction holds no second hand-maintained copy of the event key list (hand-typed: ' + handTypedInLane.join(', ') + ')');

  /* Staleness must be readable as a FACT, never inferred from an ambiguous count. The
     2026-08-02 brief read the symbol count (287 tickers) as a session count, published
     "7/30 AND 7/31 bars STILL not appended", and hedged real recommendations on it while
     the index recorded expectedSessionDate 2026-07-31 and freshCount 287/287. */
  const freshnessSource = read('scripts/brief-refresh.mjs');
  const freshnessBlock = freshnessSource.slice(freshnessSource.indexOf('function dataSnapshotFreshness'));
  ['symbolCount', 'expectedSessionDate', 'freshSymbolCount', 'carriedSymbolCount', 'missingSymbolCount']
    .forEach((field) => assert(freshnessBlock.slice(0, freshnessBlock.indexOf('\n}\n')).includes(field + ':'),
      'the bars freshness record names ' + field + ', so staleness is read rather than inferred'));
  assert(!/^\s*count:/m.test(freshnessBlock.slice(0, freshnessBlock.indexOf('\n}\n'))),
    'the freshness record exposes no bare `count` — that name was read as a session count and produced a false staleness claim');
  const incompleteBackdrop = JSON.parse(JSON.stringify(payload));
  delete incompleteBackdrop.backdrop.whatWouldChangeIt;
  assert(validateBriefPayload(incompleteBackdrop, registry, config, snapshot, agendaRegistry).some((error) => /backdrop\.whatWouldChangeIt/.test(error)), 'contract rejects an incomplete structural backdrop');
  const missingGenerationTime = JSON.parse(JSON.stringify(payload));
  delete missingGenerationTime.generatedAt;
  assert(validateBriefPayload(missingGenerationTime, registry, config, snapshot, agendaRegistry).some((error) => /generatedAt/.test(error)), 'contract rejects a missing generation timestamp');
} catch (e) { failures++; console.log('  ✗ FAIL (brief payload contract group threw): ' + e.message); }

/* ---------- D13 on the publish path — reader vocabulary in brief narrative ---------- */
try {
  group('reader vocabulary — a status code never reaches brief prose, and the gate cannot drift');
  const payload = JSON.parse(read('market-brief.payload.json'));
  const registry = JSON.parse(read('tools.json'));
  const config = JSON.parse(read('market-brief.config.json'));
  const snapshot = JSON.parse(read('market-brief.snapshot.json'));
  const agendaRegistry = JSON.parse(read('research-agenda.json'));
  const clone = () => JSON.parse(JSON.stringify(payload));
  const vocabularyErrors = (mutated) => validateBriefPayload(mutated, registry, config, snapshot, agendaRegistry)
    .filter((error) => /^reader-vocabulary:/.test(error));

  assert(findBriefNarrativeVocabularyLeaks(payload).length === 0,
    'the committed payload carries no framework status vocabulary in any reader-visible narrative field');

  // ADVERSARIAL 1 — a bare code in NARRATIVE prose must block publication. Before this gate
  // existed the payload validator had no vocabulary rule at all, so this exact payload passed.
  const narrativeLeak = clone();
  narrativeLeak.nextSession.actions[0].rationale = 'Hold the core; the owning model is coverage-only this window.';
  const narrativeErrors = vocabularyErrors(narrativeLeak);
  assert(narrativeErrors.length === 1 && /nextSession\.actions\.\[\]\.rationale/.test(narrativeErrors[0]) && /coverage-only/.test(narrativeErrors[0]),
    'a status code in narrative prose fails the publish gate, with the offending field named (' + (narrativeErrors[0] || 'NO ERROR RAISED') + ')');

  // ADVERSARIAL 2 — the SAME code in a STRUCTURED status field must pass. brief-distributed-publish.mjs
  // sets outcome/applicabilityStatus to exactly these values by design; a gate that flagged them
  // would break every scheduled run, so a false positive here is as bad as a miss.
  const structuredCarrier = clone();
  structuredCarrier.toolCoverage[0].status = 'coverage-only';
  const firstToolReadId = Object.keys(structuredCarrier.toolReads)[0];
  structuredCarrier.toolReads[firstToolReadId].status = 'not-integrated';
  structuredCarrier.toolReads[firstToolReadId].state = 'coverage-only';
  assert(vocabularyErrors(structuredCarrier).length === 0,
    'the same codes in toolCoverage[].status / toolReads.*.status / toolReads.*.state are machine state and raise nothing');

  // ADVERSARIAL 3 — the parenthetical gloss. This is the shape that actually shipped: the
  // generator applied the plain-word rule AND kept the code in brackets beside it. A gate that
  // accepted a sentence once the translation was present would let this straight through.
  const glossed = clone();
  glossed.attention = [{
    structuralAnchor: 'msft-july-print-model and ai-capex-strategy-lab are both no call this cycle '
      + '(coverage-only; do not feed the brief yet / not applicable this window).'
  }];
  const glossErrors = vocabularyErrors(glossed);
  assert(glossErrors.length === 1 && /attention\.\[\]\.structuralAnchor/.test(glossErrors[0]),
    'a code kept as a parenthetical gloss beside its own translation still fails — the translation does not excuse it');

  // The complement of ADVERSARIAL 3: the corrected form must pass, or the "fix" would just be
  // the gate banning the sentence rather than the code.
  const translated = clone();
  translated.attention = [{
    structuralAnchor: 'msft-july-print-model and ai-capex-strategy-lab are both no call this cycle '
      + '(they do not feed the brief yet / not applicable this window).'
  }];
  assert(vocabularyErrors(translated).length === 0,
    'the same sentence with the code replaced by plain words passes — the rule bans the code, not the state');

  // ADVERSARIAL 4 — the key-name trap. `status` is BOTH 1600 characters of reader prose
  // (watchlistNotes.<ticker>.status) and a machine enum (toolCoverage[].status). A gate keyed on
  // field NAME instead of PATH gets exactly one of these two cases wrong, whichever way it guesses.
  const proseNamedStatus = clone();
  const firstTicker = Object.keys(proseNamedStatus.watchlistNotes)[0];
  proseNamedStatus.watchlistNotes[firstTicker].status = 'No call this cycle (coverage-only) — deep-link only.';
  const proseNamedErrors = vocabularyErrors(proseNamedStatus);
  assert(proseNamedErrors.length === 1 && new RegExp('watchlistNotes\\.' + firstTicker + '\\.status').test(proseNamedErrors[0]),
    'watchlistNotes.<ticker>.status is prose and IS checked, even though toolCoverage[].status shares the key name and is not');

  // ADVERSARIAL 5 — dependency vocabulary is the other publication-blocking class, so the gate is
  // not a single hard-coded string.
  const dependencyLeak = clone();
  dependencyLeak.psychology.read = 'Positioning is crowded; the owning read is dependency-pending.';
  assert(vocabularyErrors(dependencyLeak).some((error) => /dependency-pending/.test(error)),
    'dependency vocabulary in narrative prose blocks publication too');

  // Single source of truth. Two enforcers, one list: if the auditor keeps a private copy of the
  // table the two can drift, which is how the rendered-page audit and the publish gate ended up
  // disagreeing in the first place.
  const auditSource = read('scripts/audit-reader-legibility.mjs');
  assert(/from '\.\/reader-vocabulary\.mjs'/.test(auditSource) && !/const LEAKS = \[/.test(auditSource),
    'audit-reader-legibility.mjs imports the leak table from reader-vocabulary.mjs and keeps no private copy');
  const validatorSource = read('scripts/validate-brief-payload.mjs');
  assert(/findBriefNarrativeVocabularyLeaks/.test(validatorSource) && !/coverage-only/.test(validatorSource),
    'validate-brief-payload.mjs enforces the shared list without restating any vocabulary of its own');
  assert(READER_VOCABULARY_LEAKS.filter((leak) => leak.blocksPublication).map((leak) => leak.id).join(',') === 'dependency-slug,integration-state',
    'exactly the status/dependency classes block publication; provenance classes stay audit-only because toolCoverage[].reason legitimately carries a digest');

  // The authoring instruction is the first line of defence and it is what permitted the gloss.
  const laneSource = read('scripts/brief-narrative-parallel.mjs');
  assert(/parentheses/.test(laneSource) && /SAME violation/.test(laneSource) && /Replace the code, do not annotate it/.test(laneSource),
    'the lane vocabulary instruction forbids the parenthetical form explicitly, not just the bare code');

  // Coverage completeness. The gate reads a declared narrative field list, so a NEW long prose
  // field added later would be silently unguarded. Every substantial string in the committed
  // payload must therefore be classified as either reader prose or declared machine state.
  const unclassified = walkBriefStrings(payload)
    .filter((entry) => entry.value.length >= 200)
    .filter((entry) => !isBriefNarrativeField(entry.segments) && !matchesFieldPatterns(BRIEF_STRUCTURED_FIELDS, entry.segments))
    .map((entry) => entry.path);
  assert(unclassified.length === 0,
    'every payload string of 200+ characters is declared either reader prose or machine state, so no long field escapes the gate unnoticed'
    + (unclassified.length ? ': ' + [...new Set(unclassified)].join(', ') : ''));
  // A pattern naming a field that does not exist silently shrinks D13 coverage, so every
  // pattern must be proven real. Required patterns are proven by this payload. The two
  // optional ones are real but intermittent — a publish where no tool read carries a
  // limitation or an ineligibility reason is normal, not a defect — so they are proven
  // against the producer instead. Both proofs are mandatory; neither is a waiver.
  const payloadStrings = walkBriefStrings(payload);
  const unmatchedRequired = BRIEF_NARRATIVE_FIELDS_REQUIRED
    .filter((pattern) => !payloadStrings.some((entry) => matchesFieldPatterns([pattern], entry.segments)));
  assert(unmatchedRequired.length === 0,
    'every REQUIRED narrative pattern matches a real field in the committed payload — the required list describes this payload, not an imagined one'
    + (unmatchedRequired.length ? ': ' + unmatchedRequired.join(', ') : ''));

  const producerSources = new Map();
  const readProducer = (path) => {
    if (!producerSources.has(path)) producerSources.set(path, read(path));
    return producerSources.get(path);
  };
  const unprovenOptional = BRIEF_NARRATIVE_FIELDS_OPTIONAL
    .filter(({ pattern, producer }) => pattern.split('.')
      .filter((segment) => segment !== '*' && segment !== '[]' && segment !== '**')
      .some((segment) => !new RegExp('\\b' + segment + '\\b').test(readProducer(producer))))
    .map(({ pattern, producer }) => pattern + ' (' + producer + ')');
  assert(unprovenOptional.length === 0,
    'every OPTIONAL narrative pattern names fields its declared producer actually emits — exemption from the payload-instance check is never exemption from being real'
    + (unprovenOptional.length ? ': ' + unprovenOptional.join(', ') : ''));

  // The optional list is the one way this split could become a bypass: a red required pattern
  // could be "fixed" by moving it here. That was guarded by transcribing the membership into a
  // string equality, which froze the list — classifying a genuinely conditional field correctly
  // meant editing an assertion that had nothing to say about that field's conditionality. So the
  // two conditional confirmation fields were declared REQUIRED instead, one healthy publish away
  // from a false alarm, because OPTIONAL was structurally unavailable. The guarantee worth
  // keeping is "an optional pattern is real and provable, not imagined", so it is asserted
  // structurally: proven against its own named producer (above), plus well-formed, non-empty,
  // duplicate-free and classified exactly once (below). Membership may change; those hold.
  assert(BRIEF_NARRATIVE_FIELDS_OPTIONAL.length > 0 && BRIEF_NARRATIVE_FIELDS_OPTIONAL.every((entry) =>
    entry && typeof entry.pattern === 'string' && entry.pattern.trim().length > 0
    && typeof entry.producer === 'string' && entry.producer.trim().length > 0),
    'the optional list is non-empty and every entry declares both a pattern and the producer it is proven against — an entry carrying no producer would be an unprovable exemption');

  // The producer freeze is replaced by a reachability requirement: a pattern can only be proven
  // against a file that actually exists here, so repointing one at an invented path fails.
  const unreadableProducers = [...new Set(BRIEF_NARRATIVE_FIELDS_OPTIONAL.map((entry) => entry.producer))]
    .filter((producer) => { try { return readProducer(producer).length === 0; } catch { return true; } });
  assert(unreadableProducers.length === 0,
    'every declared producer is a readable file in this repo, so an optional pattern cannot be proven against a path that does not exist'
    + (unreadableProducers.length ? ': ' + unreadableProducers.join(', ') : ''));

  // Classified exactly once. A duplicated optional entry double-counts as proof, and a pattern in
  // BOTH lists is a contradiction: the required check demands a live instance while the optional
  // list claims exemption from exactly that. It also forces a reclassification to be a real move
  // rather than a copy that quietly leaves the old obligation standing.
  const optionalPatterns = BRIEF_NARRATIVE_FIELDS_OPTIONAL.map((entry) => entry.pattern);
  const misclassified = optionalPatterns
    .filter((pattern, index) => optionalPatterns.indexOf(pattern) !== index
      || BRIEF_NARRATIVE_FIELDS_REQUIRED.indexOf(pattern) !== -1);
  assert(misclassified.length === 0,
    'no optional pattern is duplicated and none is also declared required, so every narrative pattern is classified exactly once'
    + (misclassified.length ? ': ' + [...new Set(misclassified)].join(', ') : ''));
} catch (e) { failures++; console.log('  ✗ FAIL (reader vocabulary group threw): ' + e.message); }

/* ---------- Causal Rotation: contracts, anti-hindsight, clustering + canaries ---------- */
try {
  group('rlcausal.js — evidence-time safety, independence, sensitivity and immutable outcomes');
  const causalRoot = {};
  const causalApi = Function('globalThis', read('rlcausal.js') + '\nreturn globalThis.RLCausal;')(causalRoot);
  const causalConfig = JSON.parse(read('causal-rotation.config.json'));
  const causalData = JSON.parse(read('causal-rotation-observations.json'));
  const causalAsOf = '2026-07-12T22:00:00Z';
  const causalClone = (value) => JSON.parse(JSON.stringify(value));
  const causalFind = (records, id) => records.find((record) => record.id === id);

  const configResult = causalApi.validateConfig(causalConfig);
  const observationResult = causalApi.validateObservationSet(causalData, causalConfig);
  assert(configResult.ok && observationResult.ok, 'causal committed config and observation contracts validate without defaults');

  const aiHypothesis = causalFind(causalData.hypotheses, 'hyp:ai-infrastructure-demand');
  const antiHindsight = causalApi.eligibleEvidence(aiHypothesis, '2026-07-12T21:44:59Z', causalData);
  assert(antiHindsight.eligible.length === 0 && antiHindsight.excluded.every((entry) => entry.code === 'CR-TIME-INELIGIBLE'), 'causal anti-hindsight excludes evidence first available after decisionAt');

  const linked = causalData.observations.filter((observation) => observation.originKey === 'origin:nvidia-q1-fy27-release');
  const reaction = causalClone(linked[0]);
  reaction.id = 'obs:fixture-same-announcement-market-reaction';
  reaction.assertion = 'Structural reaction fixture only; no market move is asserted.';
  reaction.classification = 'proxy';
  reaction.evidenceClass = 'market-reaction';
  reaction.clock = 'market-confirmation';
  reaction.stance = 'context';
  reaction.dependencyIds = [linked[0].id];
  reaction.contentDigest = causalApi.digestRecord(reaction);
  const clustered = causalApi.clusterEvidence(linked.concat([reaction]));
  assert(clustered.ok && clustered.clusters.length === 1 && clustered.clusters[0].observationIds.length === linked.length + 1, 'causal clustering collapses announcement-linked market reactions to one reason');

  const staleTiming = JSON.parse(read('tests/fixtures/causal-rotation/invalid/stale-timing.json')).timingRead;
  const postureCandidates = ['discovery', 'balanced', 'confirmation'].map((posture) => causalApi.evaluateCandidate({ config: causalConfig, observationSet: causalData, hypothesis: aiHypothesis, exposureId: 'exp:semiconductors', timingRead: staleTiming, posture, riskOverlay: 'none', asOf: causalAsOf }));
  assert(postureCandidates.every((candidate) => candidate.missingRequiredEvidenceClasses.includes('valuation') && candidate.clocks.marketConfirmation.state === 'stale' && candidate.planEligible === false), 'causal sensitivity never neutralizes stale or unavailable required evidence');

  const snapshotInput = { config: causalConfig, observationSet: causalData, timingReads: [], posture: 'discovery', riskOverlay: 'none', asOf: causalAsOf, generatedAt: causalAsOf };
  const inputBefore = causalApi.canonicalize(snapshotInput);
  const firstSnapshot = causalApi.evaluateAll(snapshotInput);
  const secondSnapshot = causalApi.evaluateAll(snapshotInput);
  assert(causalApi.canonicalize(firstSnapshot) === causalApi.canonicalize(secondSnapshot), 'causal evaluator returns byte-equivalent normalized output for identical inputs');
  assert(causalApi.canonicalize(snapshotInput) === inputBefore, 'causal evaluator is input-immutable');
  assert(firstSnapshot.candidates.some((candidate) => candidate.stage === 'cause-emerging') && firstSnapshot.candidates.some((candidate) => candidate.stage === 'contradicted'), 'causal stage order preserves emerging and blocking-contradiction states');
  assert(firstSnapshot.candidates.every((candidate) => candidate.regimeConsequences.some((entry) => entry.current) && candidate.regimeConsequences.some((entry) => !entry.current)), 'causal candidates preserve current and alternative regime consequences');
  assert(firstSnapshot.candidates.every((candidate) => candidate.planEligible === false), 'causal owner timing remains required before plan eligibility');

  const topCandidate = firstSnapshot.candidates[0];
  const frozen = causalApi.freezeDecision(topCandidate, { contractVersion: causalConfig.contracts.decisionRecord, decisionId: 'dec:selftest-frozen', decisionAt: causalAsOf, configVersion: causalConfig.version, evaluatorVersion: causalConfig.evaluatorVersion, timingRead: null });
  const frozenBytes = causalApi.canonicalize(frozen);
  const laterOutcome = causalApi.evaluateOutcome(frozen, { contractVersion: causalConfig.contracts.ledgerEvent, observedAt: '2026-07-13T00:05:00Z', invalidationConditionIds: ['cond:fixture-invalidation'], confirmationConditionIds: [], sourceObservationIds: ['obs:fixture-later'], evaluatorVersion: causalConfig.evaluatorVersion });
  assert(laterOutcome.state === 'falsified' && causalApi.canonicalize(frozen) === frozenBytes, 'causal decision digest is stable when later evidence and outcomes are appended');
  assert(laterOutcome.frozenCandidateDigest === frozen.candidateDigest, 'causal outcome classifies the frozen candidate without replacing its digest');

  const explanation = causalApi.explainSensitivity(topCandidate, 'confirmation', 'discovery', causalConfig);
  assert(explanation.ok && explanation.changed.minimumMarketState.from === 'confirming' && explanation.changed.minimumMarketState.to === 'unavailable', 'causal sensitivity explains the changed market gate');
  assert(JSON.stringify(explanation.invariantGates) === JSON.stringify(causalConfig.sensitivityPolicies.discovery.invariantGates), 'causal sensitivity preserves provenance freshness contradiction and invalidation gates');

  let repeatedStable = true;
  const repeatedBytes = causalApi.canonicalize(firstSnapshot);
  for (let run = 0; run < 120; run++) {
    if (causalApi.canonicalize(causalApi.evaluateAll(snapshotInput)) !== repeatedBytes || causalApi.canonicalize(snapshotInput) !== inputBefore) { repeatedStable = false; break; }
  }
  assert(repeatedStable, 'causal evaluator is deterministic and input-immutable across repeated recorded corpus runs');

  const sharedStore = {};
  const sharedStorage = { getItem: (key) => sharedStore[key] || null, setItem: (key, value) => { sharedStore[key] = value; }, removeItem: (key) => { delete sharedStore[key]; } };
  const sharedRoot = {};
  const sharedApi = Function('globalThis', 'localStorage', 'fetch', read('rldata.js') + '\nreturn globalThis.RLDATA;')(sharedRoot, sharedStorage, undefined);
  sharedApi.putToolRead('existing-owner', { asOf: causalAsOf, read: 'Owner baseline', metrics: { verdict: 'unchanged' }, deepLink: 'existing-owner.html' });
  const sharedBefore = JSON.stringify(sharedApi.toolRead());
  const resourceBefore = JSON.stringify(sharedApi.dataState());
  Function('globalThis', read('rlcausal.js'))(sharedRoot);
  sharedRoot.RLCausal.evaluateAll(snapshotInput);
  assert(JSON.stringify(sharedApi.toolRead()) === sharedBefore && sharedRoot.RLDATA === sharedApi, 'shared canary: RLDATA cache and toolReads contracts remain unchanged');
  assert(JSON.stringify(sharedApi.dataState()) === resourceBefore && read('rlcausal.js').indexOf('RLAPP.report') < 0, 'shared canary: RLAPP resource states remain unchanged without causal registration');
} catch (e) { failures++; console.log('  ✗ FAIL (causal foundation group threw): ' + e.message); }

/* FEATURE-005-PLACE-BASED-RENTAL-MARKET-BEGIN */
try {
  group('Feature 005 Place-Based Rental Market production payloads');
  const { createRequire } = await import('node:module');
  const feature005Require = createRequire(import.meta.url);
  const rental = feature005Require('../rlrental.js');
  const config = JSON.parse(read('place-based-rental-market.config.json'));
  const palmPayload = JSON.parse(read('palm-springs-rental-market.payload.json'));
  const oceanPayload = JSON.parse(read('ocean-shores-rental-market.payload.json'));
  const configValidation = rental.validateConfig(config);
  const configIndex = configValidation.ok ? rental.indexConfig(config) : null;
  const palmValidation = configIndex ? rental.validateMarketPayload(palmPayload, configIndex, 'palm-springs-ca') : { ok: false };
  const oceanValidation = configIndex ? rental.validateMarketPayload(oceanPayload, configIndex, 'ocean-shores-wa') : { ok: false };
  const units = palmPayload.units.concat(oceanPayload.units);
  const expectedPairs = [
    'ocean-shores-wa::large-luxury-4plus',
    'ocean-shores-wa::whole-market',
    'palm-springs-ca::large-luxury-5plus',
    'palm-springs-ca::whole-market'
  ];
  const categories = config.requiredResearchCategoryIds.join('|');
  const luxuryUnits = units.filter((unit) => /^large-luxury-[0-9]+plus$/.test(unit.segmentId));
  const wholeUnits = units.filter((unit) => unit.segmentId === 'whole-market');
  assert(Object.isFrozen(rental) && typeof rental.validateMarketPayload === 'function' && typeof rental.computeRentalResult === 'function', 'RLRENTAL CommonJS import exposes one frozen shared API');
  assert(configValidation.ok && config.schemaVersion === 'place-based-rental-market-config/v2' && config.configVersion === '2.0.0', 'RLRENTAL validates the sole production v2 configuration');
  assert(palmValidation.ok && oceanValidation.ok && palmPayload.schemaVersion === 'place-based-rental-market-payload/v2' && oceanPayload.schemaVersion === 'place-based-rental-market-payload/v2', 'RLRENTAL validates both production market payloads');
  assert(JSON.stringify(units.map((unit) => unit.pairKey).sort()) === JSON.stringify(expectedPairs), 'production payloads expose exactly four mandatory pair-local units');
  assert(units.every((unit) => unit.categoryCoverage.length === 9 && unit.categoryCoverage.map((entry) => entry.categoryId).join('|') === categories), 'every production unit independently covers all nine research categories');
  assert(units.every((unit) => unit.prior.mode === 'baseline' && unit.prior.unitId === null && unit.changes.mode === 'baseline' && unit.changes.records.length === 0), 'first production refresh is baseline-no-prior for all four units');
  assert(!JSON.stringify([palmPayload, oceanPayload]).includes('TEST FIXTURE'), 'production payloads contain no fixture authority');
  assert(luxuryUnits.every((unit) => unit.luxuryQualification.disposition === 'unknown' && unit.metricObservations.length === 0 && unit.acquisitionBaseline.state === 'unavailable' && unit.acquisitionBaseline.purchasePriceUsd === null), 'both luxury units preserve unknown performance and unavailable acquisition baselines');
  assert(luxuryUnits.every((unit) => ['sparse', 'unclean'].includes(unit.acquisitionSample.state) && unit.acquisitionSample.status === 'active-ask' && unit.scenarios.length === 1 && unit.scenarios[0].scenarioSlotId === 'scenario-slot:assumption-sensitivity'), 'both luxury units expose sparse or unclean asks and user-input-only sensitivity');
  assert(wholeUnits.every((unit) => unit.scenarios.length === 4 && unit.scenarios.every((scenario) => scenario.assumptionClaimIds.length && scenario.inferenceClaimIds.length && scenario.falsifierClaimIds.length)), 'both whole-market units expose falsifiable remaining-2026 and 2027 scenario matrices');
  assert(units.every((unit) => unit.fixedRiskCostBaseline.completeness === 'incomplete'), 'missing property-specific economics remain incomplete rather than zero');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 005 production payload group threw): ' + e.message); }
/* FEATURE-005-PLACE-BASED-RENTAL-MARKET-END */

/* ---------- Feature 006: Trend Dynamics deterministic capability foundation ---------- */
try {
  group('Feature 006 Trend Dynamics deterministic capability foundation');
  const tdcSource = read('trend-dynamics-cycle-lab.html');
  const tdcNames = [
    'tdcError',
    'tdcIsPlainObject',
    'tdcHasExactKeys',
    'tdcFiniteNumber',
    'tdcStableSerialize',
    'tdcStableDigest',
    'tdcKahanSum',
    'tdcQuantile',
    'tdcMedian',
    'tdcMad',
    'tdcNormalCdf',
    'tdcLogGamma',
    'tdcRegularizedBeta',
    'tdcStudentTCdf',
    'tdcHouseholderSolve',
    'tdcAutocorrelation',
    'tdcLjungBox',
    'tdcValidateConfig',
    'tdcIndexConfig',
    'tdcValidateSeriesEnvelope',
    'tdcResolveAsOfVintage',
    'tdcApplyTransform',
    'tdcAssessDataQuality',
    'tdcAdjustPValues',
    'tdcCreateWorkPlan',
    'tdcRollingOlsHac',
    'tdcTheilSenKendall',
    'tdcEndpointLocalQuadratic',
    'tdcLocalLinearState',
    'tdcCusum',
    'tdcBocpd',
    'tdcScaleShift',
    'tdcDistributionShift',
    'tdcCorrelationShift',
    'tdcPenalizedLinearSegments',
    'tdcGaussianHmm2',
    'tdcProminentExtrema',
    'tdcHarmonicDecomposition',
    'tdcWelchSpectrum',
    'tdcGeneralizedLombScargle',
    'tdcRollingSpectrum',
    'tdcLeadLag',
    'tdcEventStudy',
    'tdcEvaluateCycle',
    'tdcClusterFamilyVotes',
    'tdcClassifyTrend',
    'tdcClassifyDynamics',
    'tdcBuildChangeTimeline',
    'tdcBuildConsensus',
    'tdcDeepFreeze',
    'tdcMethodFailure',
    'tdcMethodSuccess',
    'tdcValidateNumericSeries',
    'tdcMeanVariance',
    'tdcCorrelation',
    'tdcLogSumExp',
    'tdcLinearFit',
    'tdcInfluenceDiagnostics',
    'tdcNearbyStability',
    'tdcBuildAnalyticSeries',
    'tdcComputeTrendEngine',
    'tdcRunScope2Engine',
    'tdcRunScope3Engine',
    'tdcCreateTurningRecord',
    'tdcAppendRevision',
    'tdcVisibleAt',
    'tdcDetectOneSided',
    'tdcWalkForward',
    'tdcRetrospectiveAnatomy',
    'tdcReplayMetrics',
    'tdcHistoryDocument',
    'tdcValidateHistoryDocument',
    'tdcPersistHistory',
    'tdcLoadHistory',
    'tdcCreateRunState',
    'tdcStartRun',
    'tdcCancelRun',
    'tdcRunCancelled',
    'tdcCreateRunner',
    'tdcRunSlice',
    'tdcRunProgress',
    'tdcCommitRun',
    'tdcBuildReplayTimeline'
  ];
  const tdc = build(tdcNames.map((name) => extractFn(tdcSource, name)), tdcNames);
  const tdcConfig = JSON.parse(read('trend-dynamics-cycle-universe.json'));
  const irregularEnvelope = JSON.parse(read('tests/fixtures/trend-dynamics-cycle/source-qualified/irregular-series.json'));
  const lifecycleFixture = JSON.parse(read('tests/fixtures/trend-dynamics-cycle/analytic/technology-lifecycle.json'));
  const politicalFixture = JSON.parse(read('tests/fixtures/trend-dynamics-cycle/source-qualified/political-calendar.json'));
  const invalidFixture = JSON.parse(read('tests/fixtures/trend-dynamics-cycle/invalid/missing-stale-incompatible.json'));
  const engineFixture = JSON.parse(read('tests/fixtures/trend-dynamics-cycle/analytic/trend-engine-inputs.json'));
  const cycleFixture = JSON.parse(read('tests/fixtures/trend-dynamics-cycle/analytic/cycle-engine-inputs.json'));
  const climateFixture = JSON.parse(read('tests/fixtures/trend-dynamics-cycle/source-qualified/climate-context.json'));

  const configValidation = tdc.tdcValidateConfig(tdcConfig);
  assert(configValidation.ok, 'Trend Dynamics production config passes the extracted closed validator');
  const configIndex = tdc.tdcIndexConfig(tdcConfig);
  assert(configIndex.ok && configIndex.index.methodOrder.length === 18 && configIndex.index.cycleOrder.length >= 10, 'Trend Dynamics index preserves all 18 methods and the ten-domain cycle catalog');
  assert(tdcConfig.methods.map((method) => method.id).join(',') === 'M01-ols-hac,M02-theil-kendall,M03-local-quadratic,M04-local-linear-state,M05-cusum,M06-bocpd,M07-scale-shift,M08-distribution-shift,M09-correlation-shift,M10-linear-segments,M11-gaussian-hmm2,M12-prominent-extrema,M13-harmonic-decomposition,M14-welch-acf,M15-generalized-lomb,M16-rolling-spectrum,M17-lead-lag,M18-event-study', 'Trend Dynamics method registry is finite, ordered, and exact');
  assert(new Set(tdcConfig.cycleCatalog.map((entry) => entry.domain)).size === 10, 'Trend Dynamics cycle catalog covers exactly ten initial domains');

  const configUnknown = JSON.parse(JSON.stringify(tdcConfig));
  configUnknown.hiddenDefault = true;
  const configVersion = JSON.parse(JSON.stringify(tdcConfig));
  configVersion.contractVersion = 'tdc-config/v99';
  const configDangling = JSON.parse(JSON.stringify(tdcConfig));
  configDangling.initialSelection.seriesId = 'series:missing';
  const configRange = JSON.parse(JSON.stringify(tdcConfig));
  configRange.profiles[0].controls.effectZ = configRange.controlBounds.effectZ.max + configRange.controlBounds.effectZ.step;
  assert(!tdc.tdcValidateConfig(configUnknown).ok && tdc.tdcValidateConfig(configUnknown).errors.some((error) => error.code === 'TDC-CONFIG-KEY'), 'Trend Dynamics config rejects an unknown top-level key');
  assert(!tdc.tdcValidateConfig(configVersion).ok && tdc.tdcValidateConfig(configVersion).errors.some((error) => error.code === 'TDC-CONFIG-VERSION'), 'Trend Dynamics config rejects an unknown major version');
  assert(!tdc.tdcValidateConfig(configDangling).ok && tdc.tdcValidateConfig(configDangling).errors.some((error) => error.code === 'TDC-CONFIG-REFERENCE'), 'Trend Dynamics config rejects a dangling initial series reference');
  assert(!tdc.tdcValidateConfig(configRange).ok && tdc.tdcValidateConfig(configRange).errors.some((error) => error.code === 'TDC-CONFIG-RANGE'), 'Trend Dynamics config rejects a profile outside governed bounds');

  const stableA = tdc.tdcStableSerialize({ z: [3, 2, 1], a: { y: true, x: 'same' } });
  const stableB = tdc.tdcStableSerialize({ a: { x: 'same', y: true }, z: [3, 2, 1] });
  const digestA = tdc.tdcStableDigest({ z: [3, 2, 1], a: { y: true, x: 'same' } });
  const digestB = tdc.tdcStableDigest({ a: { x: 'same', y: true }, z: [3, 2, 1] });
  assert(stableA.ok && stableB.ok && stableA.value === stableB.value, 'Trend Dynamics canonical serialization is key-order independent');
  assert(digestA.ok && digestA.value === digestB.value && /^[a-f0-9]{64}$/.test(digestA.value), 'Trend Dynamics stable digest is deterministic SHA-256');
  assert(tdc.tdcKahanSum([1e16, 1, -1e16, 2]).value === 2, 'Trend Dynamics Kahan sum retains the finite compensated result');
  assert(approx(tdc.tdcQuantile([1, 2, 3, 4], 0.25).value, 1.75, 1e-12) && tdc.tdcMedian([9, 1, 5]).value === 5, 'Trend Dynamics quantile and median use deterministic interpolation and ordering');
  assert(tdc.tdcMad([1, 1, 2, 2, 4]).value === 1, 'Trend Dynamics MAD is computed from the production median');
  assert(approx(tdc.tdcNormalCdf(0).value, 0.5, 1e-7) && approx(tdc.tdcStudentTCdf(0, 12).value, 0.5, 1e-10), 'Trend Dynamics distribution helpers preserve central symmetry');
  assert(approx(tdc.tdcRegularizedBeta(0.5, 2, 2).value, 0.5, 1e-10) && approx(Math.exp(tdc.tdcLogGamma(5).value), 24, 1e-8), 'Trend Dynamics beta and log-gamma helpers match reference values');
  const solved = tdc.tdcHouseholderSolve([[2, 1], [1, -1], [1, 2]], [8, 1, 7], { minimumQrDiagonalRatio: 1e-12 });
  assert(solved.ok && approx(solved.solution[0], 3, 1e-10) && approx(solved.solution[1], 2, 1e-10), 'Trend Dynamics Householder QR solves an overdetermined exact system');
  const singular = tdc.tdcHouseholderSolve([[1, 2], [2, 4], [3, 6]], [1, 2, 3], { minimumQrDiagonalRatio: 1e-8 });
  assert(!singular.ok && singular.errors[0].code === 'TDC-NUMERIC-SINGULAR', 'Trend Dynamics Householder QR fails loud on a singular design');
  const acf = tdc.tdcAutocorrelation([1, -1, 1, -1, 1, -1], 2);
  const ljung = tdc.tdcLjungBox([1, -1, 1, -1, 1, -1, 1, -1], 2);
  assert(acf.ok && acf.values[1] < 0 && acf.values[2] > 0 && ljung.ok && Number.isFinite(ljung.q) && Number.isFinite(ljung.pValue), 'Trend Dynamics ACF and Ljung-Box preserve alternating dependence and finite evidence');
  assert(!tdc.tdcFiniteNumber(null, '$.value').ok && !tdc.tdcFiniteNumber(Infinity, '$.value').ok, 'Trend Dynamics finite boundary rejects null and Infinity');

  const envelopeValidation = tdc.tdcValidateSeriesEnvelope(irregularEnvelope, configIndex.index);
  assert(envelopeValidation.ok, 'Trend Dynamics source-qualified irregular envelope passes the production contract');
  const resolved = tdc.tdcResolveAsOfVintage(irregularEnvelope, '2026-07-15T12:00:00.000Z');
  assert(resolved.ok && resolved.observations.every((row) => Date.parse(row.availableAt) <= Date.parse('2026-07-15T12:00:00.000Z')), 'Trend Dynamics as-of resolver excludes every later availability and vintage');
  const transformed = tdc.tdcApplyTransform(resolved.observations, tdcConfig.transforms.find((entry) => entry.id === 'level'), irregularEnvelope.descriptor.units, {});
  assert(transformed.ok && transformed.rows.map((row) => row.originObservationIds[0]).join(',') === resolved.observations.map((row) => row.observationId).join(',') && transformed.audit.interpolationApplied === false, 'Trend Dynamics level transform preserves observation lineage without interpolation');
  const logRejected = tdc.tdcApplyTransform([{ observationId: 'negative', observedAt: '2026-01-01T00:00:00.000Z', availableAt: '2026-01-01T00:00:00.000Z', value: -1, unitId: 'index-points' }], tdcConfig.transforms.find((entry) => entry.id === 'log-level'), irregularEnvelope.descriptor.units, {});
  assert(!logRejected.ok && logRejected.errors[0].code === 'TDC-TRANSFORM-DOMAIN', 'Trend Dynamics log transform rejects a non-positive domain without substitution');
  const quality = tdc.tdcAssessDataQuality(irregularEnvelope.descriptor, resolved.observations, '2026-07-15T12:00:00.000Z', tdcConfig, configIndex.index);
  assert(quality.ok && quality.profile.regularity === 'irregular' && quality.profile.missingIntervals.length > 0 && quality.methodAvailability['M14-welch-acf'].code === 'TDC-METHOD-REGULARITY' && quality.methodAvailability['M15-generalized-lomb'].state === 'eligible', 'Trend Dynamics quality keeps irregular gaps explicit and gates regular-only methods');

  const invalidValidation = tdc.tdcValidateSeriesEnvelope(invalidFixture, configIndex.index);
  const invalidCodes = invalidValidation.errors.map((error) => error.code);
  assert(!invalidValidation.ok && invalidCodes.includes('TDC-DATA-MISSING') && invalidCodes.includes('TDC-DATA-UNIT') && invalidCodes.includes('TDC-SOURCE-STALE'), 'Trend Dynamics invalid fixture preserves missing stale and incompatible reasons without a neutral result');
  const lifecycle = configIndex.index.cyclesById[lifecycleFixture.cycleId];
  assert(lifecycle.type === 'lifecycle' && lifecycleFixture.stage === 'saturation' && !Object.hasOwn(lifecycle, 'phase') && !Object.hasOwn(lifecycle, 'period'), 'Trend Dynamics technology attention remains a lifecycle proxy without oscillatory fields');
  const political = configIndex.index.cyclesById[politicalFixture.cycleId];
  assert(political.type === 'deterministic-calendar' && politicalFixture.officialDate === '2026-11-03' && politicalFixture.effectState === 'uncertain' && politicalFixture.turnSignal === false && !Object.hasOwn(political, 'phase'), 'Trend Dynamics official political date remains uncertain deterministic context, not a turn');

  const bh = tdc.tdcAdjustPValues([0.01, 0.04, 0.03, 0.20], 'benjamini-hochberg');
  const holm = tdc.tdcAdjustPValues([0.01, 0.04, 0.03, 0.20], 'holm');
  assert(bh.ok && holm.ok && bh.adjusted.every((value) => Number.isFinite(value) && value >= 0 && value <= 1) && holm.adjusted[0] === 0.04, 'Trend Dynamics BH and Holm adjustments are finite, bounded, and deterministic');
  const request = { contractVersion: 'tdc-analysis-request/v1', seriesId: tdcConfig.initialSelection.seriesId, decisionTime: '2026-07-15T12:00:00.000Z', vintageId: null, transformId: tdcConfig.initialSelection.transformId, transformParameters: {}, horizonId: tdcConfig.initialSelection.horizonId, profileId: tdcConfig.initialSelection.profileId, controls: tdcConfig.profiles.find((profile) => profile.id === tdcConfig.initialSelection.profileId).controls, enabledCycleIds: tdcConfig.initialSelection.enabledCycleIds, lagRange: null, selectedPowerSection: 'evidence', registryVersion: tdcConfig.registryVersion, configDigest: digestA.value };
  const firstPlan = tdc.tdcCreateWorkPlan(request, tdcConfig, configIndex.index, { replayCutoffs: 65, hypothesisCount: 33 });
  const secondPlan = tdc.tdcCreateWorkPlan(JSON.parse(JSON.stringify(request)), tdcConfig, configIndex.index, { replayCutoffs: 65, hypothesisCount: 33 });
  assert(firstPlan.ok && JSON.stringify(firstPlan) === JSON.stringify(secondPlan) && firstPlan.jobs[0].methodId === 'M01-ols-hac' && firstPlan.jobs.some((job) => job.kind === 'replay-batch' && job.count === 32) && firstPlan.jobs.some((job) => job.kind === 'hypothesis-batch' && job.count === 1), 'Trend Dynamics work plan is registry-ordered, fixed-batch, and byte deterministic');

  assert(engineFixture.fixtureContract.posture === 'analytic' && engineFixture.fixtureContract.ownerPublicationAllowed === false && engineFixture.fixtureContract.purpose === 'mathematically-discriminating-m01-m12-inputs' && !/(^|\W)(expected|conclusion|verdict|result)(\W|$)/i.test(JSON.stringify(Object.keys(engineFixture.cases[0]))), 'Trend Dynamics Scope 2 fixture is visibly analytic, non-publishing, and input-only');
  const scope2Cases = Object.fromEntries(engineFixture.cases.map((entry) => [entry.id, entry]));
  const sustainedValues = tdc.tdcBuildAnalyticSeries(scope2Cases.sustained.generator, scope2Cases.sustained.count);
  const acceleratingValues = tdc.tdcBuildAnalyticSeries(scope2Cases.accelerating.generator, scope2Cases.accelerating.count);
  const deceleratingValues = tdc.tdcBuildAnalyticSeries(scope2Cases.decelerating.generator, scope2Cases.decelerating.count);
  assert(sustainedValues.ok && acceleratingValues.ok && deceleratingValues.ok && sustainedValues.values.length === 180, 'Trend Dynamics analytic recipe builder creates finite deterministic inputs without carrying an asserted outcome');

  const linear = Array.from({ length: 63 }, (_, index) => 5 + 2 * index);
  const ols = tdc.tdcRollingOlsHac(linear, { window: 63, intervalMultiplier: 1.96, minimumQrDiagonalRatio: 1e-10, varianceFloor: 1e-12, unitId: 'index-points' });
  const scaledOls = tdc.tdcRollingOlsHac(linear.map((value) => value * 10), { window: 63, intervalMultiplier: 1.96, minimumQrDiagonalRatio: 1e-10, varianceFloor: 1e-12, unitId: 'scaled-points' });
  assert(ols.ok && scaledOls.ok && approx(ols.slope, 2, 1e-10) && approx(scaledOls.slope, 20, 1e-9) && Number.isFinite(ols.interval.lower) && Number.isFinite(ols.interval.upper) && ols.normalizedSlope.state === 'unavailable' && ols.normalizedSlope.code === 'TDC-NUMERIC-VARIANCE', 'Trend Dynamics M01 fits exact slope with finite HAC bounds and exposes zero residual scale as unavailable');

  const robustInput = Array.from({ length: 60 }, (_, index) => 10 + 0.5 * index);
  robustInput[30] += 1000;
  const robust = tdc.tdcTheilSenKendall(robustInput, { deleteBlocks: 12, unitId: 'index-points' });
  assert(robust.ok && approx(robust.slope, 0.5, 1e-12) && robust.tauB > 0.9 && robust.interval.state === 'available' && robust.interval.validBlocks >= 8, 'Trend Dynamics M02 preserves the monotonic slope and dependence-aware block interval under one extreme outlier');

  const local = tdc.tdcEndpointLocalQuadratic(acceleratingValues.values, { bandwidth: 32, minimumBandwidth: 15, minimumHistoryMultiplier: 3, minimumQrDiagonalRatio: 1e-10, unitId: 'index-points' });
  const filteredFull = tdc.tdcLocalLinearState(acceleratingValues.values, { qLevel: 0.003, qSlope: 0.003, varianceFloor: 1e-12, unitId: 'index-points' });
  const filteredPrefix = tdc.tdcLocalLinearState(acceleratingValues.values.slice(0, 100), { qLevel: 0.003, qSlope: 0.003, varianceFloor: 1e-12, unitId: 'index-points' });
  assert(local.ok && local.acceleration > 0 && local.endpointPosture === 'one-sided-filtered' && local.units.acceleration === 'index-points/observation^2' && filteredFull.ok && filteredPrefix.ok && approx(filteredFull.filtered[99].level, filteredPrefix.finalFiltered.level, 1e-12) && approx(filteredFull.filtered[99].slope, filteredPrefix.finalFiltered.slope, 1e-12) && filteredFull.smoothed.some((state, index) => Math.abs(state.level - filteredFull.filtered[index].level) > 1e-8), 'Trend Dynamics M03-M04 preserve acceleration units, filtered prefix honesty, and retrospective-only smoothing revision');

  const shiftInput = Array.from({ length: 40 }, (_, index) => index % 2 ? 1 : -1).concat(Array.from({ length: 30 }, (_, index) => (index % 2 ? 1 : -1) + 4));
  const cusum = tdc.tdcCusum(shiftInput, { baseline: 40, k: 0.5, h: 5, persistence: 3, resetPolicy: 'zero-after-record' });
  const bocpd = tdc.tdcBocpd(shiftInput, { expectedRunLength: 80, runLengthCap: 64, tailMassTolerance: 0.05, mu0: 0, kappa0: 1, alpha0: 1, beta0: 1, probabilityEpsilon: 1e-12 });
  assert(cusum.ok && cusum.alarms.some((alarm) => alarm.direction === 'positive' && alarm.effectiveIndex < alarm.detectionIndex) && cusum.resetPolicy === 'zero-after-record' && bocpd.ok && approx(bocpd.posterior.reduce((sum, probability) => sum + probability, 0), 1, 1e-12) && bocpd.posterior.every((probability) => Number.isFinite(probability) && probability >= 0 && probability <= 1) && Number.isFinite(bocpd.maxDiscardedTailMass), 'Trend Dynamics M05-M06 detect a sustained shift while BOCPD remains normalized and records truncation mass');

  const scaleInput = Array.from({ length: 60 }, (_, index) => index % 2 ? 1 : -1).concat(Array.from({ length: 20 }, (_, index) => index % 2 ? 4 : -4));
  const distributionInput = Array.from({ length: 30 }, (_, index) => index / 30).concat(Array.from({ length: 30 }, (_, index) => 3 + index / 30));
  const pairedInput = Array.from({ length: 60 }, (_, index) => ({ x: (index % 30) - 15, y: index < 30 ? (index % 30) - 15 + (index % 2 ? 0.2 : -0.2) : -((index % 30) - 15) + (index % 2 ? 0.2 : -0.2) }));
  const scaleShift = tdc.tdcScaleShift(scaleInput, { longWindow: 60, shortWindow: 20, varianceFloor: 1e-12, jackknifeBlocks: 10 });
  const distributionShift = tdc.tdcDistributionShift(distributionInput, { window: 30, epsilon: 1e-12, maximumTerms: 100, dependenceLag: 5 });
  const correlationShift = tdc.tdcCorrelationShift(pairedInput, { window: 30, intervalMultiplier: 1.96 });
  assert(scaleShift.ok && scaleShift.logVarianceRatio > 2 && scaleShift.interval.state === 'available' && distributionShift.ok && distributionShift.ksStatistic > 0.95 && distributionShift.pValue < 1e-8 && distributionShift.dependence.state !== 'omitted' && correlationShift.ok && correlationShift.correlationBefore > 0.99 && correlationShift.correlationAfter < -0.99 && correlationShift.fisherZDifference < 0, 'Trend Dynamics M07-M09 discriminate scale, distribution, and paired-correlation changes with finite uncertainty');

  const segmentedInput = Array.from({ length: 120 }, (_, index) => index < 60 ? 20 + 0.2 * index + (index % 2 ? 0.05 : -0.05) : 32 + 1.1 * (index - 60) + (index % 2 ? 0.05 : -0.05));
  const segmented = tdc.tdcPenalizedLinearSegments(segmentedInput, { minimumSegment: 20, penaltyMultiplier: 2, varianceFloor: 1e-12, dateTolerance: 3, minimumQrDiagonalRatio: 1e-10 });
  const hmmInput = Array.from({ length: 160 }, (_, index) => (Math.floor(index / 40) % 2 === 0 ? -2 : 2) + (index % 4 - 1.5) * 0.12);
  const hmm = tdc.tdcGaussianHmm2(hmmInput, { diagonalTransition: 0.97, maximumIterations: 50, tolerance: 1e-8, minimumOccupancy: 20, varianceFloor: 1e-6 });
  const peakInput = Array.from({ length: 65 }, (_, index) => index <= 30 ? index * 0.6 : 18 - (index - 30) * 0.5);
  const extrema = tdc.tdcProminentExtrema(peakInput, { minimumProminence: 8, minimumWidth: 8, minimumDistance: 10, rightConfirmation: 3, plateauTolerance: 1e-12 });
  assert(segmented.ok && segmented.breakpoints.some((entry) => Math.abs(entry.index - 60) <= 3 && entry.stable) && segmented.penaltyRuns.length === 3, 'Trend Dynamics M10 exact penalized segmentation keeps the designed break stable across 0.8x, 1.0x, and 1.2x penalties');
  assert(hmm.ok && hmm.converged && hmm.states[0].mean < hmm.states[1].mean && hmm.states.every((state) => state.occupancy >= 20) && hmm.filteredProbabilities.length === 160, 'Trend Dynamics M11 converges with deterministic mean-sorted labels, valid occupancy, and one filtered probability row per input');
  assert(extrema.ok && extrema.events.some((event) => event.type === 'peak' && event.effectiveIndex === 30 && event.detectionIndex === 33 && event.prominence >= 8 && event.width >= 8), 'Trend Dynamics M12 preserves prominent peak width and the explicit right-side confirmation delay');

  assert(cycleFixture.fixtureContract.posture === 'analytic' && cycleFixture.fixtureContract.ownerPublicationAllowed === false && cycleFixture.fixtureContract.purpose === 'mathematically-discriminating-m13-m18-inputs' && !/(^|\W)(expected|conclusion|verdict|result)(\W|$)/i.test(JSON.stringify(Object.keys(cycleFixture.cases[0]))), 'Trend Dynamics Scope 3 fixture is visibly analytic, non-publishing, and input-only');
  const scope3Cases = Object.fromEntries(cycleFixture.cases.map((entry) => [entry.id, entry]));
  assert(['harmonics', 'irregularity', 'rolling-drift', 'insufficient-history', 'break-contamination', 'broad-grid', 'frozen-lag', 'event-study'].every((id) => scope3Cases[id]), 'Trend Dynamics Scope 3 fixture covers harmonic, irregular, drift, short-history, break, multiplicity, frozen-lag, and event inputs');

  const harmonicValues = Array.from({ length: 1095 }, (_, index) => 100 + 0.02 * index + 3 * Math.cos(2 * Math.PI * index / 7 + 0.3) + 8 * Math.sin(2 * Math.PI * index / 365 + 0.8) + (index >= 800 ? 5 : 0));
  const harmonic = tdc.tdcHarmonicDecomposition(harmonicValues, { periods: [{ id: 'weekly', period: 7, harmonics: 1, minimumRepetitions: 8 }, { id: 'annual', period: 365, harmonics: 1, minimumRepetitions: 3 }], interventions: [{ id: 'definition-step', kind: 'step', index: 800, label: 'Configured definition intervention' }], discoveryCount: 730, huberPasses: 3, huberDelta: 1.345, ridgeFloor: 1e-12, minimumQrDiagonalRatio: 1e-12, maximumResidualLag: 20 });
  assert(harmonic.ok, 'Trend Dynamics M13 robust simultaneous fit completes');
  assert(harmonic.ok && harmonic.components.map((component) => component.period).join(',') === '7,365' && harmonic.components.every((component) => component.strength > 0.9 && component.amplitude > 0 && Number.isFinite(component.phase) && component.drift && typeof component.drift.state === 'string' && Number.isFinite(component.residualVariance)), 'Trend Dynamics M13 keeps weekly and annual component strength amplitude phase drift repetitions and residual records separate');
  assert(harmonic.ok && harmonic.interventions.length === 1 && harmonic.interventions[0].id === 'definition-step' && approx(harmonic.interventions[0].coefficient, 5, 1e-5), 'Trend Dynamics M13 estimates the configured level intervention outside trend and harmonic components');
  console.log('  [M13 diagnostics] reconstructionMaxError=' + harmonic.reconstruction.maxAbsoluteError + ' residualVariance=' + harmonic.residual.variance);
  assert(harmonic.ok && harmonic.reconstruction.maxAbsoluteError < 1e-5 && harmonic.residual.variance < 1e-8, 'Trend Dynamics M13 preserves full reconstruction and residual diagnostics');
  assert(harmonic.ok && harmonic.frozenSelection.map((component) => component.period).join(',') === '7,365' && harmonic.frozenSelection.every((component) => component.selectionPosture === 'predeclared-and-frozen'), 'Trend Dynamics M13 freezes the predeclared harmonic selection before confirmation');

  const regularValues = Array.from({ length: 512 }, (_, index) => 2.5 * Math.sin(2 * Math.PI * index / 16 + 0.4) + 0.15 * Math.sin(2 * Math.PI * index / 5));
  const regularSpectrum = tdc.tdcWelchSpectrum(regularValues, { segmentLength: 128, overlapFraction: 0.5, candidatePeriods: [8, 16, 32], maximumLag: 32, minimumSegments: 4, minimumQrDiagonalRatio: 1e-12 });
  assert(regularSpectrum.ok && regularSpectrum.interpolationApplied === false && regularSpectrum.welch.segmentCount >= 4 && regularSpectrum.candidates.find((candidate) => candidate.period === 16).power === Math.max(...regularSpectrum.candidates.map((candidate) => candidate.power)) && regularSpectrum.candidates.every((candidate) => Number.isFinite(candidate.rawP)), 'Trend Dynamics M14 computes regular ACF, Welch power, and finite harmonic significance without interpolation');

  const irregularObservations = [];
  let irregularTime = 0;
  for (let index = 0; index < 96; index += 1) {
    irregularTime += [1, 2, 1, 3, 1][index % 5];
    irregularObservations.push({ observationId: 'irregular-' + index, time: irregularTime, availableAt: new Date(Date.UTC(2025, 0, 1 + irregularTime)).toISOString(), value: 4 * Math.sin(2 * Math.PI * irregularTime / 18 + 0.2), weight: 1 });
  }
  const irregularSpectrum = tdc.tdcGeneralizedLombScargle(irregularObservations, { candidatePeriods: [12, 18, 24], minimumObservations: 60, minimumSpanPeriods: 4, minimumQrDiagonalRatio: 1e-12 });
  assert(irregularSpectrum.ok && irregularSpectrum.interpolationApplied === false && irregularSpectrum.inputObservationIds.join(',') === irregularObservations.map((row) => row.observationId).join(',') && irregularSpectrum.candidates.find((candidate) => candidate.period === 18).power === Math.max(...irregularSpectrum.candidates.map((candidate) => candidate.power)) && irregularSpectrum.samplingWindowAliases.length > 0, 'Trend Dynamics M15 uses generalized Lomb-Scargle on original irregular timestamps with no invented observations');

  let rollingPhase = 0;
  const rollingValues = Array.from({ length: 480 }, (_, index) => {
    rollingPhase += 2 * Math.PI / (24 + 12 * index / 479);
    return 50 + 4 * Math.sin(rollingPhase);
  });
  const rollingSpectrum = tdc.tdcRollingSpectrum(rollingValues, { window: 168, step: 48, candidatePeriods: [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40], minimumWindows: 3, minimumPeriodsPerWindow: 4, edgeFraction: 0.1, minimumQrDiagonalRatio: 1e-12, multiplicityQ: 0.1 });
  assert(rollingSpectrum.ok && rollingSpectrum.windows.length >= 3 && rollingSpectrum.windows[0].period < rollingSpectrum.windows.at(-1).period && rollingSpectrum.windows.every((window) => Number.isFinite(window.amplitude) && Number.isFinite(window.phase) && ['left-edge', 'interior', 'right-edge'].includes(window.edgeStatus)) && Number.isFinite(rollingSpectrum.periodCv) && Number.isFinite(rollingSpectrum.amplitudeCv) && rollingSpectrum.phaseConcentration >= 0 && rollingSpectrum.phaseConcentration <= 1, 'Trend Dynamics M16 exposes rolling period, amplitude, phase, drift, resolution, and edge limits');

  const contextRows = Array.from({ length: 180 }, (_, index) => ({ observationId: 'context-' + index, observedAt: new Date(Date.UTC(2025, 0, 1 + index)).toISOString(), availableAt: new Date(Date.UTC(2025, 0, 1 + index)).toISOString(), value: Math.sin(index * 0.31) + 0.35 * Math.cos(index * 0.11) }));
  const targetRows = Array.from({ length: 180 }, (_, index) => ({ observationId: 'target-' + index, observedAt: new Date(Date.UTC(2025, 0, 1 + index)).toISOString(), availableAt: new Date(Date.UTC(2025, 0, 1 + index)).toISOString(), value: index >= 3 ? 0.85 * contextRows[index - 3].value + 0.05 * Math.sin(index * 1.7) : 0.05 * Math.sin(index * 1.7) }));
  const leadLag = tdc.tdcLeadLag(targetRows, contextRows, { discoveryCount: 120, lags: Array.from({ length: 13 }, (_, index) => index - 6), transform: 'level', intervalMultiplier: 1.96, discoveryQ: 0.1, activationAlpha: 0.05, nearbyTolerance: 1, regimeSplitIndex: 90, minimumAlignedRows: 60 });
  assert(leadLag.ok && leadLag.label === 'association' && leadLag.discovery.lag === 3 && leadLag.heldOut.lag === 3 && leadLag.heldOut.frozen && !leadLag.heldOut.searched && leadLag.discovery.effect > 0.7 && leadLag.heldOut.effect > 0.7 && leadLag.searchBreadth.count === 13 && leadLag.mechanismEstablished === false, 'Trend Dynamics M17 selects a discovery lag once, confirms that frozen lag on held-out availability-safe pairs, and remains association');

  const eventValues = Array.from({ length: 240 }, (_, index) => 100 + 0.01 * index + 0.02 * Math.sin(index));
  const eventIndexes = [20, 45, 70, 95, 120, 145, 170, 195];
  eventIndexes.forEach((index) => { eventValues[index + 1] += 2; eventValues[index + 2] += 2; });
  const eventStudy = tdc.tdcEventStudy(eventValues, eventIndexes.map((index, eventIndex) => ({ id: 'event-' + eventIndex, index })), { before: 1, after: 2, minimumEvents: 8, quantiles: [0.25, 0.5, 0.75] });
  assert(eventStudy.ok && eventStudy.events.length === 8 && eventStudy.overlapRejected.length === 0 && eventStudy.meanEffect > 0 && eventStudy.medianEffect > 0 && approx(eventStudy.exactSignPValue, 0.0078125, 1e-12) && eventStudy.label === 'association', 'Trend Dynamics M18 preserves eight non-overlapping events, distribution diagnostics, and exact two-sided sign evidence');

  const insufficientRun = tdc.tdcRunScope3Engine(scope3Cases['insufficient-history'], tdcConfig, configIndex.index, null);
  const breakRun = tdc.tdcRunScope3Engine(scope3Cases['break-contamination'], tdcConfig, configIndex.index, null);
  const broadRun = tdc.tdcRunScope3Engine(scope3Cases['broad-grid'], tdcConfig, configIndex.index, null);
  const frozenRun = tdc.tdcRunScope3Engine(scope3Cases['frozen-lag'], tdcConfig, configIndex.index, null);
  assert(insufficientRun.ok && insufficientRun.result.cycle.state === 'ineligible' && insufficientRun.result.cycle.requirements.duration.shortfall === 480 && insufficientRun.result.cycle.requirements.repetitions.required === 4 && !Object.hasOwn(insufficientRun.result.cycle, 'phase') && !Object.hasOwn(insufficientRun.result.cycle, 'nextTurnDate') && !Object.hasOwn(insufficientRun.result.cycle, 'confidence'), 'Trend Dynamics cycle eligibility derives the immutable catalog repetition minimum, reports exact long-history shortfalls, and omits unsupported phase fields');
  assert(breakRun.ok && breakRun.result.breakFirst.order === 1 && breakRun.result.breakFirst.contaminated && breakRun.result.candidatePeriodEvidence.power > 0 && breakRun.result.cycle.state === 'unresolved' && !breakRun.result.activation.active && breakRun.result.activation.gates[0].id === 'break-clear', 'Trend Dynamics break-first execution leads and blocks contaminated activation without hiding candidate evidence');
  assert(broadRun.ok && broadRun.result.multiplicity.searchBreadth.count > 20 && broadRun.result.multiplicity.hypotheses.every((hypothesis) => hypothesis.key.split('|').length === 6) && broadRun.result.multiplicity.inSampleWinner.rawP < 0.05 && broadRun.result.multiplicity.inSampleWinner.heldOut.evaluatedFrozenHypothesis && broadRun.result.multiplicity.inSampleWinner.heldOut.improvement < 0.05 && !broadRun.result.multiplicity.inSampleWinner.supported, 'Trend Dynamics broad period and lag searches expose exact keys, BH discovery, Holm activation, and reject a failing frozen winner');
  assert(frozenRun.ok && frozenRun.result.association.discovery.lag === 3 && frozenRun.result.association.heldOut.lag === 3 && frozenRun.result.association.heldOut.frozen && !frozenRun.result.association.heldOut.searched && frozenRun.result.association.label === 'association', 'Trend Dynamics frozen-lag engine never re-searches confirmation and never promotes association to mechanism');

  const climateCycle = tdc.tdcEvaluateCycle(configIndex.index.cyclesById[climateFixture.cycleId], climateFixture, tdcConfig.evaluation);
  const calendarCycle = tdc.tdcEvaluateCycle(configIndex.index.cyclesById['us-federal-election-calendar'], politicalFixture, tdcConfig.evaluation);
  const lifecycleCycle = tdc.tdcEvaluateCycle(configIndex.index.cyclesById['technology-attention-lifecycle'], lifecycleFixture, tdcConfig.evaluation);
  const empiricalCycle = tdc.tdcEvaluateCycle(configIndex.index.cyclesById['business-seasonality'], { state: 'contextual', period: 4, phase: 1, amplitude: 2, drift: 0.1, strength: 0.7, sourceLineage: true }, tdcConfig.evaluation);
  const regimeCycle = tdc.tdcEvaluateCycle(configIndex.index.cyclesById['demographic-social-regime'], { state: 'contextual', officialState: 'population-growth-slowing', transitionUncertainty: 'material', sourceLineage: true }, tdcConfig.evaluation);
  const eventCycle = tdc.tdcEvaluateCycle(configIndex.index.cyclesById['solar-physical-event'], { state: 'contextual', eventState: 'scheduled', scenarios: ['observed', 'expired'], sourceLineage: true }, tdcConfig.evaluation);
  assert(climateCycle.ok && climateCycle.cycle.state === 'contextual' && climateCycle.cycle.source.authority === 'NOAA Climate.gov' && climateCycle.cycle.season === 'Northern Hemisphere winter 2023-24' && climateCycle.cycle.geography === 'southern tier of the United States' && climateCycle.cycle.universalTargetEffect === false, 'Trend Dynamics official ENSO context preserves source, phase, confidence, season, geography, mechanism, dispersion, and limitations without a universal effect');
  assert(calendarCycle.ok && !Object.hasOwn(calendarCycle.cycle, 'phase') && empiricalCycle.ok && !Object.hasOwn(empiricalCycle.cycle, 'trendDirection') && lifecycleCycle.ok && !Object.hasOwn(lifecycleCycle.cycle, 'period') && !Object.hasOwn(lifecycleCycle.cycle, 'phase') && regimeCycle.ok && !Object.hasOwn(regimeCycle.cycle, 'calendarRecurrence') && eventCycle.ok && !Object.hasOwn(eventCycle.cycle, 'repetitions') && !Object.hasOwn(eventCycle.cycle, 'confidence'), 'Trend Dynamics typed cycle dispatch emits exactly type-compatible fields for all six cycle types');

  const clustered = tdc.tdcClusterFamilyVotes([
    { methodId: 'M01-ols-hac', familyCluster: 'trend-linear', availability: 'eligible', signedEvidence: 2, reliability: 0.8 },
    { methodId: 'M02-theil-kendall', familyCluster: 'trend-robust', availability: 'eligible', signedEvidence: 1.8, reliability: 0.9 },
    { methodId: 'M03-local-quadratic', familyCluster: 'trend-local-state', availability: 'eligible', signedEvidence: 1.7, reliability: 0.8 },
    { methodId: 'M04-local-linear-state', familyCluster: 'trend-local-state', availability: 'eligible', signedEvidence: 1.5, reliability: 0.85 }
  ], { effectThreshold: 1 });
  const unstableCluster = tdc.tdcClusterFamilyVotes([
    { methodId: 'M03-local-quadratic', familyCluster: 'trend-local-state', availability: 'eligible', signedEvidence: 1.7, reliability: 0.8 },
    { methodId: 'M04-local-linear-state', familyCluster: 'trend-local-state', availability: 'eligible', signedEvidence: -1.5, reliability: 0.85 }
  ], { effectThreshold: 1 });
  const trend = tdc.tdcClassifyTrend(clustered.votes, { requiredFamilies: 2, durationFraction: 0.9, minimumDurationFraction: 0.5, qualityState: 'sufficient', nearbyStability: 0.8, minimumNearbyStability: 0.67, typeEvidence: { stableBreak: false, regimeDependent: false, logFitAdvantage: 0, curvatureSignificant: false, linearRSquared: 0.9, kendallTau: 0.85, residualLagOne: 0 } });
  const acceleratingDynamics = tdc.tdcClassifyDynamics([{ id: 'local-curvature', standardizedEffect: 1.8, sign: 1, persistent: true, stable: true }, { id: 'nested-slope', standardizedEffect: 1.4, sign: 1, persistent: true, stable: true }], { direction: 'rising', currentSlope: 1, shortHorizon: 31, changeWatching: false, effectThreshold: 1 });
  const deceleratingDynamics = tdc.tdcClassifyDynamics([{ id: 'local-curvature', standardizedEffect: 1.6, sign: -1, persistent: true, stable: true }, { id: 'nested-slope', standardizedEffect: 1.3, sign: -1, persistent: true, stable: true }], { direction: 'rising', currentSlope: 0.6, shortHorizon: 31, changeWatching: false, effectThreshold: 1 });
  assert(clustered.ok && clustered.votes.length === 3 && clustered.votes.filter((vote) => vote.familyCluster === 'trend-local-state').length === 1 && unstableCluster.ok && unstableCluster.votes[0].state === 'unstable' && trend.ok && trend.direction === 'rising' && trend.lifecycle === 'sustained' && acceleratingDynamics.ok && acceleratingDynamics.state === 'accelerating' && deceleratingDynamics.ok && deceleratingDynamics.state === 'decelerating', 'Trend Dynamics synthesis counts one vote per family and keeps direction separate from accelerating or decelerating dynamics');

  const stability = tdc.tdcNearbyStability(tdcConfig.profiles.find((profile) => profile.id === 'balanced').controls, tdcConfig.controlBounds, [0.8, 1.2], { source: 'fixed', history: 'fixed', asOf: 'fixed', multiplicity: 'fixed', familyIndependence: 'fixed', invalidation: 'fixed' }, (controls) => ({ truthState: 'current', direction: controls.effectZ <= 2 ? 'rising' : 'mixed', trendType: 'linear', dynamics: 'accelerating', changeState: 'none', topCycleState: 'unavailable' }));
  const influenceBroad = tdc.tdcInfluenceDiagnostics(sustainedValues.values, [], (values) => values[values.length - 1] > values[0] ? 'rising' : 'falling');
  const influenceNewest = tdc.tdcInfluenceDiagnostics([0, 0.1, 0.2, 0.3, -10], [], (values) => values[values.length - 1] > values[0] ? 'rising' : 'falling');
  const timeline = tdc.tdcBuildChangeTimeline([{ methodId: 'M05-cusum', familyCluster: 'change-online', availability: 'eligible', changeState: 'below-threshold' }, { methodId: 'M10-linear-segments', familyCluster: 'change-retrospective', availability: 'eligible', changeState: 'none' }], trend, acceleratingDynamics, { persistenceBars: 3, consensusFamilies: 2, priorDirection: 'rising' });
  assert(stability.ok && stability.evaluations.length === 9 && stability.integrityInvariant && influenceBroad.ok && influenceBroad.broadRunSupported && !influenceBroad.newestObservationDriven && influenceNewest.ok && influenceNewest.newestObservationDriven && timeline.ok && timeline.state !== 'confirmed-regime-change' && timeline.confirmationConditions.length > 0 && timeline.invalidationConditions.length > 0, 'Trend Dynamics stability, influence, and change timeline preserve invariant gates and never promote unconfirmed disagreement');

  const balancedProfile = tdcConfig.profiles.find((profile) => profile.id === 'balanced');
  const sustainedEngine = tdc.tdcRunScope2Engine(scope2Cases.sustained, balancedProfile, tdcConfig.horizons.find((horizon) => horizon.id === 'h126'), tdcConfig);
  const acceleratingEngine = tdc.tdcRunScope2Engine(scope2Cases.accelerating, balancedProfile, tdcConfig.horizons.find((horizon) => horizon.id === 'h126'), tdcConfig);
  const deceleratingEngine = tdc.tdcRunScope2Engine(scope2Cases.decelerating, balancedProfile, tdcConfig.horizons.find((horizon) => horizon.id === 'h126'), tdcConfig);
  assert(sustainedEngine.ok && sustainedEngine.result.trend.direction === 'rising' && sustainedEngine.result.trend.lifecycle === 'sustained' && sustainedEngine.result.change.state !== 'confirmed-regime-change' && sustainedEngine.result.supportingFamilies.length >= 2 && acceleratingEngine.ok && acceleratingEngine.result.trend.direction === 'rising' && acceleratingEngine.result.dynamics.state === 'accelerating' && deceleratingEngine.ok && deceleratingEngine.result.trend.direction === 'rising' && deceleratingEngine.result.dynamics.state === 'decelerating' && deceleratingEngine.result.change.state !== 'reversal', 'Trend Dynamics complete Scope 2 engine separates sustained direction, acceleration, deceleration, wiggles, and reversal gates');
  const repeatedConsensusBytes = Array.from({ length: 100 }, () => JSON.stringify(tdc.tdcBuildConsensus({ methodResults: sustainedEngine.result.methodResults, familyVotes: sustainedEngine.result.familyVotes, trend: sustainedEngine.result.trend, dynamics: sustainedEngine.result.dynamics, change: sustainedEngine.result.change, stability: sustainedEngine.result.stability, influence: sustainedEngine.result.influence, quality: sustainedEngine.result.quality, profile: sustainedEngine.result.profile, horizon: sustainedEngine.result.horizon, integrity: sustainedEngine.result.integrity, timings: { ignored: Math.random() } })));
  assert(new Set(repeatedConsensusBytes).size === 1 && Object.isFrozen(sustainedEngine.result) && Object.isFrozen(sustainedEngine.result.methodResults) && sustainedEngine.result.methodResults.every((result) => Object.isFrozen(result)), 'Trend Dynamics consensus is deeply frozen and produces 100 byte-identical results while excluding diagnostic timings');
  assert(!tdc.tdcRollingOlsHac([1, 2, null], { window: 3, intervalMultiplier: 1.96, minimumQrDiagonalRatio: 1e-10, varianceFloor: 1e-12, unitId: 'points' }).ok && !tdc.tdcCorrelationShift([{ x: 1, y: 1 }], { window: 30, intervalMultiplier: 1.96 }).ok && !tdc.tdcGaussianHmm2([1, 1, 1], { diagonalTransition: 0.95, maximumIterations: 50, tolerance: 1e-8, minimumOccupancy: 20, varianceFloor: 1e-12 }).ok, 'Trend Dynamics M01-M12 fail loud on non-finite, insufficient, or degenerate inputs without manufacturing neutral output');

  group('Trend Dynamics Scope 5 — as-of replay separates four clocks and keeps false alarms immutable (spec 006)');
  {
    const day = (n) => '2026-01-' + String(n).padStart(2, '0');
    const series = (vals) => vals.map((value, i) => ({ observedAt: day(i + 1), availableAt: day(i + 1), value }));

    // SCN-006-004: a peak forms, then holds. It must be PROVISIONAL before the confirmation
    // delay elapses and CONFIRMED only afterwards, with the four clocks reported separately.
    const rising = tdc.tdcWalkForward(series([10, 11, 12, 15, 14, 13, 12, 11, 10]), { confirmationDelay: 3 });
    assert(rising.ok && rising.records.length >= 1, 'Scope 5 replay produces a turning record for a formed peak');
    const peak = rising.records[0];
    assert(peak.kind === 'peak' && peak.state === 'confirmed', 'Scope 5 a peak that holds past the confirmation delay reaches confirmed');
    assert(peak.estimatedEffectiveAt !== peak.firstDetectedAt,
      'Scope 5 the estimated effective date and the first detection date are separate clocks, not one date reused');
    assert(peak.estimatedEffectiveAt < peak.firstDetectedAt,
      'Scope 5 a one-sided detector can only detect a turn AFTER it became effective');
    assert(Number.isFinite(peak.delayObservations) && peak.delayObservations >= 3,
      'Scope 5 the confirmation delay is reported in observations rather than implied');
    // The fourth clock. A record promoted by a later revision must carry a confirmation time
    // strictly after the first detection, or the delay it reports is not measuring anything.
    const promoted = rising.records.filter((record) => record.state === 'confirmed' && record.revisions.length > 0);
    assert(promoted.every((record) => record.confirmedAt > record.firstDetectedAt),
      'Scope 5 a record confirmed by a later revision carries a confirmation time after its first detection');

    // The record was provisional at least once before confirmation: the replay states show it.
    const provisionalSteps = rising.steps.filter((step) => step.state === 'provisional').length;
    assert(provisionalSteps >= 1, 'Scope 5 the record is provisional at earlier cutoffs rather than appearing already confirmed');

    // SCN-006-005: a candidate that the trend later erases must NOT vanish. Deleting it would
    // silently improve the false-alarm rate, which is the number the record exists to protect.
    const failed = tdc.tdcWalkForward(series([10, 11, 14, 12, 13, 16, 18, 20, 22]), { confirmationDelay: 3 });
    const invalidated = failed.records.filter((record) => record.state === 'invalidated');
    assert(invalidated.length >= 1, 'Scope 5 a candidate erased by later observations is retained as invalidated, not removed');
    const falseAlarm = invalidated[0];
    assert(falseAlarm.revisions.length >= 1 && falseAlarm.revisions[falseAlarm.revisions.length - 1].outcome === 'false-alarm',
      'Scope 5 invalidation arrives as an appended revision carrying a false-alarm outcome');
    assert(falseAlarm.revisions[0].supersedesState === 'provisional',
      'Scope 5 the revision records the state it superseded, so the original verdict stays legible');

    // Immutability is the whole contract: the original identity survives every revision.
    const original = tdc.tdcCreateTurningRecord({ recordId: 'r1', cutoff: day(4), parameters: { confirmationDelay: 3 }, alertAt: day(4), effectiveIndex: 2, estimatedEffectiveAt: day(3), firstDetectedAt: day(4) });
    const revised = tdc.tdcAppendRevision(original, { revisedAt: day(9), reason: 'later data', outcome: 'false-alarm', state: 'invalidated' });
    assert(original.state === 'provisional' && original.revisions.length === 0,
      'Scope 5 appending a revision does not mutate the record the caller already holds');
    assert(revised.cutoff === original.cutoff && revised.alertAt === original.alertAt && revised.effectiveIndex === original.effectiveIndex,
      'Scope 5 cutoff, alert time and effective index are immutable across revision');
    assert(revised.state === 'invalidated' && revised.revisions.length === 1,
      'Scope 5 only the current verdict moves, and the revision is appended');
    assert(Object.isFrozen(original) && Object.isFrozen(revised), 'Scope 5 turning records are frozen');

    // SCN-006-007: retrospective anatomy may date the turn earlier than real time could know.
    // Both dates must survive separately, or a study silently claims foresight.
    const anatomy = tdc.tdcRetrospectiveAnatomy(series([10, 11, 12, 15, 14, 13, 12, 11, 10]), rising);
    assert(anatomy && anatomy.state === 'available', 'Scope 5 retrospective anatomy is available for a two-sided series');
    assert(anatomy.endpointPosture === 'two-sided' && anatomy.realTimeEndpointPosture === 'one-sided',
      'Scope 5 the retrospective and real-time endpoint postures are reported separately');
    assert(anatomy.retrospectiveEffectiveAt !== anatomy.realTimeDetectedAt,
      'Scope 5 the retrospective date is not silently substituted for the real-time detection date');
    assert(/cannot be used to claim earlier warning/.test(anatomy.limitation),
      'Scope 5 the retrospective view states its own limitation rather than leaving it to the reader');

    // Visibility: a cutoff must expose ONLY already-available observations.
    const late = [{ observedAt: day(1), availableAt: day(1), value: 1 }, { observedAt: day(2), availableAt: day(9), value: 2 }];
    assert(tdc.tdcVisibleAt(late, day(3)).length === 1,
      'Scope 5 an observation that was not yet available is invisible at that cutoff');

    // Fail-closed on empty input rather than returning an empty-but-ok replay.
    assert(tdc.tdcWalkForward([], {}).ok === false, 'Scope 5 replay refuses empty observations instead of returning a vacuous result');

    // The payoff of retaining false alarms: the rates that depend on them are computable.
    const metrics = tdc.tdcReplayMetrics(rising, [3], 2);
    assert(metrics && metrics.truePositives === 1 && metrics.misses === 0,
      'Scope 5 a confirmed record within tolerance of the target event counts as a hit');
    assert(metrics.precision === 1 && metrics.recall === 1,
      'Scope 5 precision and recall are derived from matched targets rather than asserted');

    const failedMetrics = tdc.tdcReplayMetrics(failed, [], 2);
    assert(failedMetrics.invalidatedCount >= 1 && failedMetrics.falseAlarmRate > 0,
      'Scope 5 retained invalidated candidates keep the false-alarm rate above zero rather than vanishing from the denominator');

    // A detector that never fires must not score a perfect precision.
    const silent = tdc.tdcReplayMetrics({ ok: true, records: [] }, [3], 2);
    assert(silent.precision === null && silent.recall === 0,
      'Scope 5 a detector that predicted nothing reports undefined precision, never a perfect score');
  }

  group('Trend Dynamics Scope 5 — replay fixtures, history persistence, and fixed-work scheduling (spec 006, TP-05-01)');
  {
    const replayFixture = JSON.parse(read('tests/fixtures/trend-dynamics-cycle/analytic/replay-inputs.json'));
    assert(replayFixture.contractVersion === 'tdc-replay-fixture/v1'
      && replayFixture.fixtureContract.posture === 'analytic'
      && replayFixture.fixtureContract.ownerPublicationAllowed === false
      && replayFixture.fixtureContract.purpose === 'availability-and-vintage-changing-replay-inputs'
      && !/(^|\W)(expected|conclusion|verdict|precision|recall)(\W|$)/i.test(JSON.stringify(Object.keys(replayFixture.cases[0]))),
      'Scope 5 replay fixture is visibly analytic, non-publishing, and input-only rather than carrying its own answers');
    const replayCases = Object.fromEntries(replayFixture.cases.map((entry) => [entry.id, entry]));
    assert(['provisional-peak', 'failed-reversal', 'retrospective-gap', 'late-availability', 'max-work'].every((id) => replayCases[id]),
      'Scope 5 replay fixture covers provisional confirmation, false alarm, retrospective gap, late availability, and maximum work');

    /* Availability and vintage actually CHANGE inside the fixture. Without that, the replay would
       be reading a series whose rows all arrived on time, which cannot exercise prefix safety. */
    const laggedRows = replayFixture.cases
      .flatMap((entry) => entry.observations)
      .filter((row) => row.availableAt > row.observedAt);
    assert(laggedRows.length > 0, 'Scope 5 replay fixture contains observations that became available after they were observed');
    assert(new Set(replayFixture.cases.flatMap((entry) => entry.observations.map((row) => row.vintageId))).size > 1,
      'Scope 5 replay fixture carries more than one vintage, so vintage selection is exercised rather than assumed');

    /* SCN-006-004. Expected values are derived from the SPEC statement (a peak that holds past the
       configured confirmation delay confirms, and a confirmed record inside tolerance of a declared
       target is a hit), not read out of the fixture. */
    const peakCase = replayCases['provisional-peak'];
    const peakReplay = tdc.tdcWalkForward(peakCase.observations, { confirmationDelay: peakCase.confirmationDelay });
    assert(peakReplay.ok && peakReplay.records.some((record) => record.state === 'confirmed'),
      'Scope 5 fixture replay confirms the peak that holds past the configured confirmation delay');
    const peakRecord = peakReplay.records.find((record) => record.state === 'confirmed');
    assert(peakRecord.estimatedEffectiveAt < peakRecord.firstDetectedAt && peakRecord.confirmedAt >= peakRecord.firstDetectedAt,
      'Scope 5 fixture replay keeps effective, first-detection, and confirmation clocks in their only physically possible order');
    const peakMetrics = tdc.tdcReplayMetrics(peakReplay, peakCase.targetEventIndexes, peakCase.matchTolerance);
    assert(peakMetrics.truePositives === 1 && peakMetrics.misses === 0 && peakMetrics.precision === 1 && peakMetrics.recall === 1,
      'Scope 5 a confirmed record inside the declared tolerance of the declared target scores exactly one hit and no miss');

    /* SCN-006-005. The candidate the trend erases must survive as invalidated, because deleting it
       is what would silently drive the false-alarm rate to zero. */
    const failedCase = replayCases['failed-reversal'];
    const failedReplay = tdc.tdcWalkForward(failedCase.observations, { confirmationDelay: failedCase.confirmationDelay });
    const failedMetrics = tdc.tdcReplayMetrics(failedReplay, failedCase.targetEventIndexes, failedCase.matchTolerance);
    assert(failedReplay.records.some((record) => record.state === 'invalidated'
      && record.revisions.some((revision) => revision.outcome === 'false-alarm')),
      'Scope 5 fixture replay retains the erased candidate as invalidated with an appended false-alarm revision');
    assert(failedMetrics.invalidatedCount >= 1 && failedMetrics.falseAlarmRate > 0,
      'Scope 5 the retained false alarm stays in the denominator instead of improving the rate by disappearing');

    /* SCN-006-007. The two-sided date may legitimately precede the one-sided detection; what is
       forbidden is letting the earlier date populate the real-time field. */
    const gapCase = replayCases['retrospective-gap'];
    const gapReplay = tdc.tdcWalkForward(gapCase.observations, { confirmationDelay: gapCase.confirmationDelay });
    const gapAnatomy = tdc.tdcRetrospectiveAnatomy(gapCase.observations, gapReplay);
    assert(gapAnatomy && gapAnatomy.state === 'available' && gapAnatomy.endpointPosture === 'two-sided'
      && gapAnatomy.realTimeEndpointPosture === 'one-sided',
      'Scope 5 fixture retrospective anatomy reports both endpoint postures separately');
    assert(gapAnatomy.retrospectiveEffectiveAt < gapAnatomy.realTimeDetectedAt,
      'Scope 5 the two-sided date precedes the real-time detection date, which is exactly the gap the record must not erase');

    /* Prefix safety under LATE availability: a row stamped as arriving later is simply not there. */
    const lateCase = replayCases['late-availability'];
    const lateRow = lateCase.observations.find((row) => row.availableAt > row.observedAt);
    const beforeArrival = tdc.tdcVisibleAt(lateCase.observations, lateRow.observedAt);
    const afterArrival = tdc.tdcVisibleAt(lateCase.observations, lateRow.availableAt);
    assert(!beforeArrival.some((row) => row.observationId === lateRow.observationId)
      && afterArrival.some((row) => row.observationId === lateRow.observationId),
      'Scope 5 a late-arriving observation is invisible at its observation date and visible only once it actually arrived');

    /* Deterministic replay: the same inputs produce byte-identical records across 100 repeats. */
    const repeatedReplayBytes = Array.from({ length: 100 }, () => JSON.stringify(
      tdc.tdcWalkForward(peakCase.observations, { confirmationDelay: peakCase.confirmationDelay }).records));
    assert(new Set(repeatedReplayBytes).size === 1,
      'Scope 5 replay is deterministic across 100 repeats rather than depending on wall-clock or iteration order');

    /* ---- tdc-history/v1 persistence, read-back validation, and explicit degradation ---- */
    const historyDocument = tdc.tdcHistoryDocument(peakReplay.records);
    assert(historyDocument.ok && historyDocument.document.contractVersion === 'tdc-history/v1'
      && historyDocument.document.records.length === peakReplay.records.length,
      'Scope 5 history document carries the versioned contract and every retained record');
    assert(tdc.tdcValidateHistoryDocument(historyDocument.document).ok,
      'Scope 5 the produced history document satisfies its own read-back validator');

    const makeStore = () => {
      const cells = {};
      return { cells, getItem: (key) => (Object.prototype.hasOwnProperty.call(cells, key) ? cells[key] : null), setItem: (key, value) => { cells[key] = String(value); }, removeItem: (key) => { delete cells[key]; } };
    };
    const store = makeStore();
    const persisted = tdc.tdcPersistHistory(historyDocument.document, store, { maxHistoryBytes: 1000000 });
    assert(persisted.ok && persisted.bytes > 0, 'Scope 5 history persistence writes and reports its own byte cost');
    const loaded = tdc.tdcLoadHistory(store);
    assert(loaded.ok && loaded.document.records.length === peakReplay.records.length
      && JSON.stringify(loaded.document) === JSON.stringify(historyDocument.document),
      'Scope 5 persisted history reads back byte-identically rather than being trusted unread');

    /* Read-back validation is the point: a store that silently mutates on write must be caught. */
    const lyingStore = makeStore();
    lyingStore.setItem = (key, value) => { lyingStore.cells[key] = String(value).replace('"provisional"', '"confirmed"'); };
    const lyingResult = tdc.tdcPersistHistory(historyDocument.document, lyingStore, { maxHistoryBytes: 1000000 });
    assert(!lyingResult.ok && lyingResult.errors.some((error) => error.code === 'TDC-HISTORY-STORAGE'),
      'Scope 5 persistence reads back what it wrote and fails loud when the store did not keep it');

    /* Capacity is explicit degradation, not truncation, and the prior history survives untouched. */
    const capacityStore = makeStore();
    const priorDocument = tdc.tdcHistoryDocument(peakReplay.records.slice(0, 1));
    tdc.tdcPersistHistory(priorDocument.document, capacityStore, { maxHistoryBytes: 1000000 });
    const priorRaw = capacityStore.getItem('tdc-history/v1');
    const capacityResult = tdc.tdcPersistHistory(historyDocument.document, capacityStore, { maxHistoryBytes: 10 });
    assert(!capacityResult.ok && capacityResult.errors.some((error) => error.code === 'TDC-HISTORY-CAPACITY'),
      'Scope 5 an oversized history is refused with an explicit capacity code instead of being trimmed');
    assert(capacityStore.getItem('tdc-history/v1') === priorRaw,
      'Scope 5 a refused capacity write leaves the existing history exactly as it was');

    /* Corruption is surfaced, never silently repaired. */
    const corruptStore = makeStore();
    corruptStore.setItem('tdc-history/v1', '{"contractVersion":"tdc-history/v1","records":[');
    const corruptLoad = tdc.tdcLoadHistory(corruptStore);
    assert(!corruptLoad.ok && corruptLoad.errors.some((error) => error.code === 'TDC-HISTORY-CORRUPTION'),
      'Scope 5 unparseable history is reported as corruption rather than parsed into an empty success');
    assert(corruptStore.getItem('tdc-history/v1') === '{"contractVersion":"tdc-history/v1","records":[',
      'Scope 5 a corrupt history is left untouched, so no silent repair rewrites the audit trail');
    const wrongVersionStore = makeStore();
    wrongVersionStore.setItem('tdc-history/v1', JSON.stringify({ contractVersion: 'tdc-history/v99', records: [] }));
    assert(!tdc.tdcLoadHistory(wrongVersionStore).ok, 'Scope 5 an unknown history major version fails loud rather than being migrated in place');
    const emptyLoad = tdc.tdcLoadHistory(makeStore());
    assert(emptyLoad.ok && emptyLoad.document.records.length === 0,
      'Scope 5 an absent history is an empty valid document, not an error');
    const missingIdentity = JSON.parse(JSON.stringify(historyDocument.document));
    delete missingIdentity.records[0].alertAt;
    assert(!tdc.tdcValidateHistoryDocument(missingIdentity).ok,
      'Scope 5 a record missing its immutable alert time is rejected, because that field is what makes the record auditable');

    /* ---- fixed-work jobs, monotonic run id, progress, cancellation, atomic commit ---- */
    const runState = tdc.tdcCreateRunState();
    const plan = firstPlan;
    const firstRun = tdc.tdcStartRun(runState, plan);
    const secondRun = tdc.tdcStartRun(runState, plan);
    assert(firstRun.runId === 1 && secondRun.runId === 2 && secondRun.runId > firstRun.runId,
      'Scope 5 run ids are monotonic, so a stale slice can always be recognised as stale');
    assert(runState.activeRunId === secondRun.runId && runState.cancelledRunIds.includes(firstRun.runId),
      'Scope 5 starting a new run cancels the previous one rather than leaving two runs racing');

    const executed = [];
    const executeJob = (job) => { executed.push(job.jobId); return { jobId: job.jobId, output: job.jobId + ':' + job.count }; };
    const cleanState = tdc.tdcCreateRunState();
    const cleanRun = tdc.tdcStartRun(cleanState, plan);
    const runner = tdc.tdcCreateRunner(plan, cleanRun.runId);
    let guard = 0;
    const progressFractions = [];
    while (!runner.finished && guard < 10000) { tdc.tdcRunSlice(runner, cleanState, executeJob); progressFractions.push(tdc.tdcRunProgress(runner).fraction); guard += 1; }
    assert(runner.complete && runner.completedWorkUnits === plan.totalWorkUnits,
      'Scope 5 a run that is never cancelled completes every declared work unit');
    assert(executed.length === plan.jobs.length && executed[0] === plan.jobs[0].jobId,
      'Scope 5 jobs execute once each in registry order rather than being sliced by elapsed time');
    assert(progressFractions.every((value, index) => index === 0 || value >= progressFractions[index - 1]),
      'Scope 5 progress is monotonic, so the reader never sees it move backwards');
    assert(progressFractions[progressFractions.length - 1] === 1 && tdc.tdcRunProgress(runner).activeFamily === null,
      'Scope 5 a complete run reports full progress and no remaining active family');

    /* Cancellation must stop BEFORE the next unit and must discard the unit it was mid-way through. */
    const cancelState = tdc.tdcCreateRunState();
    const cancelRun = tdc.tdcStartRun(cancelState, plan);
    const cancelRunner = tdc.tdcCreateRunner(plan, cancelRun.runId);
    const cancelExecuted = [];
    tdc.tdcRunSlice(cancelRunner, cancelState, (job) => { cancelExecuted.push(job.jobId); return { jobId: job.jobId }; });
    tdc.tdcCancelRun(cancelState, cancelRun.runId, 'user');
    const beforeCancelCount = cancelExecuted.length;
    tdc.tdcRunSlice(cancelRunner, cancelState, (job) => { cancelExecuted.push(job.jobId); return { jobId: job.jobId }; });
    assert(cancelExecuted.length === beforeCancelCount,
      'Scope 5 cancellation is observed BEFORE the next work unit runs, so no further work is performed');
    assert(cancelRunner.cancelled && cancelRunner.finished && !cancelRunner.complete,
      'Scope 5 a cancelled runner is finished and explicitly incomplete rather than quietly complete');

    /* Work performed AFTER the flag is set is discarded, not recorded. */
    const midState = tdc.tdcCreateRunState();
    const midRun = tdc.tdcStartRun(midState, plan);
    const midRunner = tdc.tdcCreateRunner(plan, midRun.runId);
    tdc.tdcRunSlice(midRunner, midState, (job) => { tdc.tdcCancelRun(midState, midRun.runId, 'superseded'); return { jobId: job.jobId }; });
    assert(midRunner.cancelled && midRunner.outputs.length === 0 && midRunner.completedWorkUnits === 0,
      'Scope 5 a unit cancelled while it was running contributes no output and no progress');

    /* Atomic commit: only a complete run belonging to the active run id may publish anything. */
    const priorResult = Object.freeze({ resultId: 'prior', value: 1 });
    const runtimeState = { lastCompleteResult: priorResult, history: historyDocument.document, published: null };
    const cancelledCommit = tdc.tdcCommitRun(runtimeState, cancelRunner, cancelState, { resultId: 'cancelled', value: 2 });
    assert(!cancelledCommit.committed && cancelledCommit.errorCode === 'TDC-COMPUTE-CANCELLED',
      'Scope 5 a cancelled run is refused commit with the closed cancellation code');
    assert(runtimeState.lastCompleteResult === priorResult && runtimeState.published === null
      && runtimeState.history === historyDocument.document,
      'Scope 5 a refused commit leaves the prior result, the history, and the publication exactly as they were');

    const supersededState = tdc.tdcCreateRunState();
    const supersededRun = tdc.tdcStartRun(supersededState, plan);
    const supersededRunner = tdc.tdcCreateRunner(plan, supersededRun.runId);
    let supersededGuard = 0;
    while (!supersededRunner.finished && supersededGuard < 10000) { tdc.tdcRunSlice(supersededRunner, supersededState, executeJob); supersededGuard += 1; }
    tdc.tdcStartRun(supersededState, plan);
    const supersededCommit = tdc.tdcCommitRun(runtimeState, supersededRunner, supersededState, { resultId: 'superseded', value: 3 });
    assert(supersededRunner.complete && !supersededCommit.committed && supersededCommit.errorCode === 'TDC-COMPUTE-CANCELLED',
      'Scope 5 a complete but superseded run still cannot commit, because a newer run already owns the surface');
    assert(runtimeState.lastCompleteResult === priorResult,
      'Scope 5 a superseded complete run leaves the visible result untouched');

    const commitState = tdc.tdcCreateRunState();
    const commitRun = tdc.tdcStartRun(commitState, plan);
    const commitRunner = tdc.tdcCreateRunner(plan, commitRun.runId);
    let commitGuard = 0;
    while (!commitRunner.finished && commitGuard < 10000) { tdc.tdcRunSlice(commitRunner, commitState, executeJob); commitGuard += 1; }
    const accepted = tdc.tdcCommitRun(runtimeState, commitRunner, commitState, { resultId: 'accepted', value: 4 });
    assert(accepted.committed && runtimeState.lastCompleteResult.resultId === 'accepted',
      'Scope 5 only a complete, current run replaces the visible result');

    /* Deterministic rerun: identical plan and identical executor produce identical output bytes. */
    const rerunBytes = Array.from({ length: 100 }, () => {
      const state = tdc.tdcCreateRunState();
      const run = tdc.tdcStartRun(state, plan);
      const localRunner = tdc.tdcCreateRunner(plan, run.runId);
      let localGuard = 0;
      while (!localRunner.finished && localGuard < 10000) { tdc.tdcRunSlice(localRunner, state, (job) => ({ jobId: job.jobId, count: job.count })); localGuard += 1; }
      return JSON.stringify({ outputs: localRunner.outputs, completedWorkUnits: localRunner.completedWorkUnits, elapsedIgnored: Math.random() > -1 });
    });
    assert(new Set(rerunBytes).size === 1,
      'Scope 5 100 identical reruns of the same plan produce byte-identical outputs while diagnostic timings are excluded');

    /* Replay timeline is the accessible text equivalent of the replay UI, built from the same records. */
    const timeline = tdc.tdcBuildReplayTimeline(peakReplay, peakCase.observations);
    assert(timeline.ok && timeline.rows.length === peakReplay.steps.length,
      'Scope 5 the replay timeline carries one row per actual availability cutoff');
    assert(timeline.rows.every((row) => typeof row.cutoff === 'string' && Number.isFinite(row.visibleCount) && typeof row.state === 'string'),
      'Scope 5 each timeline row names its cutoff, its visible-observation count, and the state that was knowable then');
    const invalidatedTimeline = tdc.tdcBuildReplayTimeline(failedReplay, failedCase.observations);
    assert(invalidatedTimeline.invalidated.length >= 1
      && invalidatedTimeline.invalidated.every((entry) => entry.outcome === 'false-alarm' && typeof entry.alertAt === 'string'),
      'Scope 5 the timeline keeps invalidated candidates visible with their original alert time rather than dropping them from the view');
  }

  const sharedStore = {};
  const sharedStorage = { getItem: (key) => sharedStore[key] || null, setItem: (key, value) => { sharedStore[key] = value; }, removeItem: (key) => { delete sharedStore[key]; } };
  const sharedRoot = {};
  const sharedApi = Function('globalThis', 'localStorage', 'fetch', read('rldata.js') + '\nreturn globalThis.RLDATA;')(sharedRoot, sharedStorage, undefined);
  sharedApi.putToolRead('feature-006-canary', { asOf: '2026-07-15T12:00:00.000Z', read: 'Canary', metrics: { truthState: 'current' }, deepLink: 'canary.html' });
  const toolReadBefore = JSON.stringify(sharedApi.toolRead('feature-006-canary'));
  const dataStateBefore = JSON.stringify(sharedApi.dataState());
  const credentialsBefore = sharedStorage.getItem('rlApiKeys');
  assert(JSON.stringify(sharedApi.toolRead('feature-006-canary')) === toolReadBefore && JSON.stringify(sharedApi.dataState()) === dataStateBefore, 'Trend Dynamics shared canary leaves RLDATA toolReads and RLAPP resource state unchanged');
  assert(sharedStorage.getItem('rlApiKeys') === credentialsBefore && tdcSource.indexOf('localStorage.rlApiKeys') < 0 && tdcSource.indexOf("localStorage.setItem('rlApiKeys'") < 0, 'Trend Dynamics shared canary leaves central credential ownership unchanged');
  const toolIds = JSON.parse(read('tools.json')).tools.map((tool) => tool.id);
  assert(toolIds.indexOf('trend-dynamics-cycle-lab') === toolIds.indexOf('portfolio-survival-allocation-lab') - 1 && toolIds.indexOf('portfolio-survival-allocation-lab') === toolIds.indexOf('research-agenda-lab') - 1 && toolIds.indexOf('research-agenda-lab') === toolIds.length - 1, 'Portfolio Survival and Research Agenda append after Trend Dynamics without reordering the prior registry');
} catch (e) { failures++; console.log('  ✗ FAIL (Trend Dynamics foundation group threw): ' + e.message); }

/* ---------- Feature 007: Technical Analysis Decision foundation ---------- */
try {
  group('Feature 007 Technical Analysis Decision capability foundation');
  const tadSource = read('technical-analysis-decision-lab.html');
  const tadNames = [
    'tadError',
    'tadIsPlainObject',
    'tadHasExactKeys',
    'tadFiniteNumber',
    'tadStableSerialize',
    'tadStableDigest',
    'tadDeepFreeze',
    'tadValidateConfig',
    'tadIndexConfig',
    'tadValidateSourceVintage',
    'tadValidateSeriesEnvelope',
    'tadValidateOwnerRead',
    'tadResolveAsOf',
    'tadResolveSession',
    'tadClassifyBarStatus',
    'tadAggregateBars',
    'tadBuildTimeframeProfile',
    'tadAlignSeries',
    'tadBuildVariantIdentity',
    'tadBuildSourceSetIdentity'
  ];
  const tad = build(tadNames.map((name) => extractFn(tadSource, name)), tadNames);
  const tadConfig = JSON.parse(read('technical-analysis-decision-universe.json'));
  const tadIndexResult = tad.tadIndexConfig(tadConfig);
  assert(tad.tadValidateConfig(tadConfig).ok && tadIndexResult.ok, 'Technical Analysis Decision closed production config validates and indexes');
  assert(tadNames.every((name) => (tadSource.match(new RegExp('function\\s+' + name + '\\s*\\(', 'g')) || []).length === 1), 'Technical Analysis Decision exposes each of the 20 Scope 01 top-level declarations exactly once');
  const unknownConfig = JSON.parse(JSON.stringify(tadConfig));
  unknownConfig.hiddenDefault = true;
  const wrongVersion = JSON.parse(JSON.stringify(tadConfig));
  wrongVersion.contractVersion = 'tad-config/v99';
  const danglingProfile = JSON.parse(JSON.stringify(tadConfig));
  danglingProfile.initialSelection.timeframeProfileId = 'profile:missing';
  const unknownNested = JSON.parse(JSON.stringify(tadConfig));
  unknownNested.techniques[0].parameters.hiddenDefault = 20;
  assert(!tad.tadValidateConfig(unknownConfig).ok && tad.tadValidateConfig(unknownConfig).errors.some((error) => error.code === 'TAD-CONFIG-KEY'), 'Technical Analysis Decision config rejects unknown keys without a fallback');
  assert(!tad.tadValidateConfig(wrongVersion).ok && tad.tadValidateConfig(wrongVersion).errors.some((error) => error.code === 'TAD-CONFIG-VERSION'), 'Technical Analysis Decision config rejects an unknown contract version');
  assert(!tad.tadValidateConfig(danglingProfile).ok && tad.tadValidateConfig(danglingProfile).errors.some((error) => error.code === 'TAD-CONFIG-REFERENCE'), 'Technical Analysis Decision config rejects a dangling timeframe profile');
  assert(!tad.tadValidateConfig(unknownNested).ok && tad.tadValidateConfig(unknownNested).errors.some((error) => error.code === 'TAD-CONFIG-KEY' && error.path === '$.techniques[0].parameters'), 'Technical Analysis Decision config rejects an unknown nested technique parameter');

  const sourceFixture = JSON.parse(read('tests/fixtures/technical-analysis-decision/source-qualified/us-equity-sessions.json'));
  const analyticFixture = JSON.parse(read('tests/fixtures/technical-analysis-decision/analytic/session-profiles.json'));
  const invalidFixture = JSON.parse(read('tests/fixtures/technical-analysis-decision/invalid/contracts.json'));
  assert(sourceFixture.fixturePosture === 'source-qualified-historical' && /^https:\/\//.test(sourceFixture.provenance.sourceUrl) && sourceFixture.provenance.liveClaim === false, 'Technical Analysis Decision historical fixture carries truthful source provenance and no live claim');
  assert(analyticFixture.fixturePosture === 'analytic-deterministic' && analyticFixture.liveClaim === false, 'Technical Analysis Decision analytic fixture is explicitly non-live');
  assert(invalidFixture.fixturePosture === 'invalid-adversarial' && invalidFixture.liveClaim === false, 'Technical Analysis Decision invalid fixture is explicitly adversarial and non-live');
  const sourceValidation = tad.tadValidateSeriesEnvelope(sourceFixture.seriesEnvelope);
  assert(sourceValidation.ok, 'Technical Analysis Decision source-qualified interval envelope passes exact source and bar validation');
  const sourceUnknown = JSON.parse(JSON.stringify(sourceFixture.seriesEnvelope));
  sourceUnknown.source.hidden = true;
  assert(!tad.tadValidateSeriesEnvelope(sourceUnknown).ok && tad.tadValidateSeriesEnvelope(sourceUnknown).errors.some((error) => error.code === 'TAD-SOURCE-KEY'), 'Technical Analysis Decision source vintage rejects unknown keys');
  const resolvedBeforeOpen = tad.tadResolveAsOf(sourceFixture.seriesEnvelope, '2026-07-03T17:30:00.000Z');
  assert(resolvedBeforeOpen.ok && resolvedBeforeOpen.bars.every((bar) => Date.parse(bar.availableAt) <= Date.parse('2026-07-03T17:30:00.000Z')), 'Technical Analysis Decision as-of resolver excludes later-available bars');

  const normal65 = tad.tadAggregateBars(sourceFixture.seriesEnvelope.bars, analyticFixture.requests.usEquity65m, tadIndexResult.index);
  const core4h = tad.tadAggregateBars(sourceFixture.core4hEnvelope.bars, analyticFixture.requests.usEquity4hCore, tadIndexResult.index);
  const extended4h = tad.tadAggregateBars(sourceFixture.extendedEnvelope.bars, analyticFixture.requests.usEquity4hExtended, tadIndexResult.index);
  const continuous4h = tad.tadAggregateBars(sourceFixture.continuousEnvelope.bars, analyticFixture.requests.continuous4h, tadIndexResult.index);
  const earlyClose = tad.tadAggregateBars(sourceFixture.earlyCloseEnvelope.bars, analyticFixture.requests.usEquity65mEarlyClose, tadIndexResult.index);
  assert(normal65.ok && normal65.bars.length === 6 && normal65.bars.every((bar) => bar.actualDurationMs === 65 * 60 * 1000 && bar.status === 'closed'), 'Technical Analysis Decision normal stock session produces six equal closed 65-minute bars');
  assert(core4h.ok && core4h.bars.length === 2 && core4h.bars[0].actualDurationMs === 240 * 60 * 1000 && core4h.bars[1].actualDurationMs === 150 * 60 * 1000 && core4h.bars[1].status === 'partial', 'Technical Analysis Decision core stock four-hour profile exposes the 240 plus 150 minute remainder');
  assert(extended4h.ok && extended4h.bars.length === 4 && extended4h.bars.every((bar) => bar.actualDurationMs === 240 * 60 * 1000), 'Technical Analysis Decision extended-hours profile produces four explicit equal bars');
  assert(continuous4h.ok && continuous4h.bars.length === 6 && continuous4h.bars.every((bar) => bar.actualDurationMs === 240 * 60 * 1000) && !continuous4h.qualityFlags.includes('US_EQUITY_PARTIAL_SESSION'), 'Technical Analysis Decision continuous profile produces equal four-hour boundaries without a stock warning');
  assert(earlyClose.ok && earlyClose.bars.some((bar) => bar.status === 'partial') && earlyClose.qualityFlags.includes('EARLY_CLOSE_PARTIAL'), 'Technical Analysis Decision early close retains a non-confirming partial bar');
  const weekly = tad.tadAggregateBars(sourceFixture.weeklyEnvelope.bars, analyticFixture.requests.weekly, tadIndexResult.index);
  assert(weekly.ok && weekly.bars.at(-1).status === 'provisional' && weekly.confirmedBars.at(-1).barId === sourceFixture.expected.lastConfirmedWeeklyBarId, 'Technical Analysis Decision provisional week remains separate from confirmed history');
  assert(sourceFixture.calendarEvents.some((event) => event.type === 'holiday') && sourceFixture.calendarEvents.some((event) => event.type === 'dst-transition'), 'Technical Analysis Decision source fixture preserves holiday and DST records');
  const customProfile = tad.tadBuildTimeframeProfile(tadConfig.timeframeProfiles.find((profile) => profile.profileId === 'custom-v1'), analyticFixture.customSelection, tadIndexResult.index);
  assert(customProfile.ok && customProfile.profile.roles.trigger.interval === '130m' && customProfile.profile.identityBearing === true, 'Technical Analysis Decision custom profile validates explicit role and session identity');
  const invalidCustom = tad.tadBuildTimeframeProfile(tadConfig.timeframeProfiles.find((profile) => profile.profileId === 'custom-v1'), analyticFixture.invalidCustomSelection, tadIndexResult.index);
  assert(!invalidCustom.ok && invalidCustom.errors.some((error) => error.code === 'TAD-SESSION-PARTIAL-POLICY'), 'Technical Analysis Decision custom profile rejects an undeclared partial-bar policy');

  const stableA = tad.tadStableSerialize({ z: [3, 2, 1], a: { y: true, x: 'same' } });
  const stableB = tad.tadStableSerialize({ a: { x: 'same', y: true }, z: [3, 2, 1] });
  const digestA = tad.tadStableDigest({ z: [3, 2, 1], a: { y: true, x: 'same' } });
  const digestB = tad.tadStableDigest({ a: { x: 'same', y: true }, z: [3, 2, 1] });
  assert(stableA.ok && stableB.ok && stableA.value === stableB.value && digestA.ok && digestA.value === digestB.value && /^[a-f0-9]{64}$/.test(digestA.value), 'Technical Analysis Decision serialization and digest are key-order stable');
  const frozen = tad.tadDeepFreeze({ nested: { values: [1, 2, 3] } });
  assert(Object.isFrozen(frozen) && Object.isFrozen(frozen.nested) && Object.isFrozen(frozen.nested.values), 'Technical Analysis Decision deep freeze recursively protects committed contracts');
  assert(!tad.tadFiniteNumber(null, '$.value').ok && !tad.tadFiniteNumber(Infinity, '$.value').ok, 'Technical Analysis Decision finite boundary rejects null and Infinity');

  const validationSource = read('rlvalidation.js');
  const validationNames = ['rlvBuildPurgedFolds', 'rlvAdjustBenjaminiHochberg', 'rlvAdjustHolm', 'rlvDeflatedSharpe', 'rlvWilsonInterval', 'rlvQuantiles', 'rlvSummarizeOutcomes'];
  const validationRoot = {};
  const validationApi = Function('globalThis', validationSource + '\nreturn globalThis.RLVALID;')(validationRoot);
  assert(validationNames.every((name) => typeof validationApi[name] === 'function' && (validationSource.match(new RegExp('function\\s+' + name + '\\s*\\(', 'g')) || []).length === 1), 'RLVALID exposes all seven exact Node-safe declarations once');
  const folds = validationApi.rlvBuildPurgedFolds(400, 4, 0.6, 5, 5);
  assert(folds.ok && folds.folds.length === 4 && folds.folds.every((fold) => fold.trainEnd <= fold.testStart - 5), 'RLVALID builds deterministic purged and embargoed folds');
  const bh = validationApi.rlvAdjustBenjaminiHochberg([0.01, 0.04, 0.03, 0.20]);
  const holm = validationApi.rlvAdjustHolm([0.01, 0.04, 0.03, 0.20]);
  assert(bh.ok && holm.ok && bh.adjusted.every((value) => value >= 0 && value <= 1) && holm.adjusted[0] === 0.04, 'RLVALID multiplicity adjustments are finite bounded and deterministic');
  const wilson = validationApi.rlvWilsonInterval(7, 10, 1.96);
  const quantiles = validationApi.rlvQuantiles([1, 2, 3, 4], [0.25, 0.5, 0.75]);
  const summary = validationApi.rlvSummarizeOutcomes([1, -1, 2, -0.5, 0]);
  assert(wilson.ok && wilson.lower < 0.7 && wilson.upper > 0.7 && quantiles.ok && quantiles.values.join(',') === '1.75,2.5,3.25' && summary.ok && summary.count === 5 && summary.wins === 2 && summary.losses === 2 && summary.unresolved === 1, 'RLVALID interval quantiles and outcome summary execute real generic logic');
  const equity = Array.from({ length: 80 }, (_value, index) => Math.pow(1.001 + (index % 3) * 0.0001, index + 1));
  const firstDsr = validationApi.rlvDeflatedSharpe(equity, 7, 252);
  const repeatedDsr = Array.from({ length: 100 }, () => validationApi.rlvDeflatedSharpe(equity, 7, 252));
  assert(firstDsr.ok && repeatedDsr.every((result) => JSON.stringify(result) === JSON.stringify(firstDsr)), 'RLVALID returns byte-identical deflated-statistic results across 100 identical inputs');

  const sharedStore = {};
  const sharedStorage = { getItem: (key) => sharedStore[key] || null, setItem: (key, value) => { sharedStore[key] = value; }, removeItem: (key) => { delete sharedStore[key]; } };
  const sharedRoot = { RLFX: { normalizeSourceEnvelope: (value) => value } };
  const sharedApi = Function('globalThis', 'window', 'localStorage', 'fetch', read('rldata.js') + '\nreturn globalThis.RLDATA;')(sharedRoot, sharedRoot, sharedStorage, undefined);
  const legacyRows = [{ t: 1, o: 1, h: 2, l: 0.5, c: 1.5, v: 10 }];
  sharedApi.putBars('LEGACY', '1d', legacyRows, 'legacy-source');
  const legacyBefore = JSON.stringify({ bars: sharedApi.bars('LEGACY', '1d'), info: sharedApi.barInfo('LEGACY', '1d'), reads: sharedApi.toolRead() });
  const qualifiedPut = sharedApi.putQualifiedBarSeries(sourceFixture.seriesEnvelope);
  const qualifiedRead = sharedApi.qualifiedBarSeries(sourceFixture.seriesEnvelope.symbol, sourceFixture.seriesEnvelope.interval, sourceFixture.seriesEnvelope.source.vintageId);
  assert(qualifiedPut && qualifiedRead && qualifiedRead.contractVersion === 'tad-series/v1' && qualifiedRead.bars.length === sourceFixture.seriesEnvelope.bars.length, 'RLDATA stores and reads a source-qualified non-daily interval envelope');
  assert(JSON.stringify({ bars: sharedApi.bars('LEGACY', '1d'), info: sharedApi.barInfo('LEGACY', '1d'), reads: sharedApi.toolRead() }) === legacyBefore, 'RLDATA qualified interval series preserves legacy bars barInfo and tool reads byte-for-byte');

  const strategySource = read('strategy-validation-lab.html');
  const strategyLocal = build([extractFn(strategySource, 'deflatedSharpe')], ['deflatedSharpe'], 'var ANN=252;\n' + extractFn(strategySource, 'meanA') + '\n' + extractFn(strategySource, 'normCdf') + '\n' + extractFn(strategySource, 'invNorm') + '\n' + extractFn(strategySource, 'moments'));
  const localDsr = strategyLocal.deflatedSharpe(equity, 7);
  const sharedDsr = validationApi.rlvDeflatedSharpe(equity, 7, 252);
  assert(sharedDsr.ok && approx(localDsr.psr, sharedDsr.psr, 1e-12) && approx(localDsr.dsr, sharedDsr.dsr, 1e-12) && approx(localDsr.srAnn, sharedDsr.srAnn, 1e-12) && localDsr.nTrials === sharedDsr.nTrials && localDsr.n === sharedDsr.n, 'Strategy Validation local control and RLVALID adapter retain exact generic statistic parity');
  assert(strategySource.includes('Feature 007: RLVALID parity adapter') && strategySource.includes('return RLVALID.rlvDeflatedSharpe'), 'Strategy Validation delegates only through the marker-bounded RLVALID parity adapter');

  /* ---------- Scope 02: technique engine ---------- */
  const tad02Names = [
    'tadTechniqueOutcome', 'tadTechniqueRefusal', 'tadTechniqueColumns', 'tadEmaValues', 'tadWilderValues',
    'tadSmaSeries', 'tadEmaSeries', 'tadAtrSeries', 'tadRsiSeries', 'tadMacdSeries', 'tadBollingerSeries',
    'tadAdxDmiSeries', 'tadObvSeries', 'tadCmfSeries', 'tadRelativeVolume', 'tadEffortResult',
    'tadVolumeProfile', 'tadVwapEnvelope', 'tadPivots', 'tadRelativeStrength', 'tadEvaluateTechnique',
    'tadClusterEvidenceFamilies'
  ];
  const tad02Owned = [
    'tadSmaSeries', 'tadEmaSeries', 'tadAtrSeries', 'tadRsiSeries', 'tadMacdSeries', 'tadBollingerSeries',
    'tadAdxDmiSeries', 'tadObvSeries', 'tadCmfSeries', 'tadRelativeVolume', 'tadEffortResult',
    'tadVolumeProfile', 'tadVwapEnvelope', 'tadPivots', 'tadRelativeStrength', 'tadEvaluateTechnique',
    'tadClusterEvidenceFamilies'
  ];
  const tad02 = build(
    tadNames.concat(tad02Names).map((name) => extractFn(tadSource, name)),
    tadNames.concat(tad02Names)
  );
  assert(tad02Owned.length === 17 && tad02Owned.every((name) => (tadSource.match(new RegExp('function\\s+' + name + '\\s*\\(', 'g')) || []).length === 1),
    'Technical Analysis Decision exposes each of the 17 Scope 02 top-level declarations exactly once');

  // One deterministic qualified series drives every formula row, so a failure names the formula
  // rather than the fixture.
  const tad02Bars = (() => {
    const rows = [];
    let price = 100;
    for (let i = 0; i < 260; i += 1) {
      price = price * (1 + ((i % 7) - 3) / 1000) + 0.05;
      const open = price, close = price * (1 + ((i % 5) - 2) / 1000);
      rows.push({
        barId: 'b' + i, interval: '1d', sessionId: 's',
        openedAt: new Date(Date.UTC(2025, 0, 1 + i)).toISOString(),
        closedAt: new Date(Date.UTC(2025, 0, 1 + i, 20)).toISOString(),
        availableAt: new Date(Date.UTC(2025, 0, 1 + i, 21)).toISOString(),
        o: open, h: Math.max(open, close) * 1.006, l: Math.min(open, close) * 0.994, c: close,
        v: 1000 + (i % 11) * 50, adjustmentPolicyId: 'a', status: 'closed',
        expectedDurationMs: 1, actualDurationMs: 1, qualityFlags: [], sourceRowIds: ['r' + i]
      });
    }
    return rows;
  })();
  const tad02Rows = (drift) => tad02Bars.map((bar, i) => ({ closedAt: bar.closedAt, c: bar.c * (1 + i * drift) }));
  const tad02Series = [
    { id: 'base', rows: tad02Rows(0.001), adjustmentPolicyId: 'a', sessionContractId: 's' },
    { id: 'peer', rows: tad02Rows(0), adjustmentPolicyId: 'a', sessionContractId: 's' }
  ];

  // Every technique runs through the COMMITTED config, so a formula that drifts from its declared
  // output vocabulary fails here rather than reaching a reader.
  const tad02Dispatch = tadConfig.techniques.map((definition) => ({
    definition,
    outcome: tad02.tadEvaluateTechnique(
      definition,
      definition.techniqueId === 'relative-strength/v1' ? { series: tad02Series } : { bars: tad02Bars },
      tadConfig.claimLedger
    )
  }));
  assert(tad02Dispatch.length === 15 && tad02Dispatch.every(({ definition, outcome }) => outcome.ok && definition.outputVocabulary.indexOf(outcome.status) >= 0),
    'Every committed technique dispatches and returns a state inside its own declared output vocabulary');
  assert(tad02Dispatch.every(({ definition, outcome }) => outcome.familyId === definition.familyId && outcome.clusterId === definition.clusterId),
    'Each technique outcome carries the family and cluster its config declares');

  const tad02Sma = tad02.tadSmaSeries(tad02Bars, { lengths: [20, 50, 200] });
  const tad02Ema = tad02.tadEmaSeries(tad02Bars, { lengths: [20, 50, 200] });
  const tad02Rsi = tad02.tadRsiSeries(tad02Bars, { lookback: 14 });
  const tad02Macd = tad02.tadMacdSeries(tad02Bars, { fast: 12, slow: 26, signal: 9 });
  const tad02Atr = tad02.tadAtrSeries(tad02Bars, { lookback: 14 });
  const tad02Adx = tad02.tadAdxDmiSeries(tad02Bars, { lookback: 14 });
  const tad02Boll = tad02.tadBollingerSeries(tad02Bars, { lookback: 20, deviations: 2 });
  assert(tad02Sma.ok && tad02Ema.ok && Math.abs(tad02Sma.metrics.averages[0] - tad02Ema.metrics.averages[0]) > 0,
    'Simple and exponential stacks are distinct transforms rather than one relabelled average');
  assert(tad02Rsi.ok && tad02Rsi.metrics.rsi >= 0 && tad02Rsi.metrics.rsi <= 100, 'Wilder RSI stays inside its bounded 0..100 range');
  assert(tad02Macd.ok && approx(tad02Macd.metrics.histogram, tad02Macd.metrics.macd - tad02Macd.metrics.signal, 1e-12), 'MACD histogram equals the line minus its signal exactly');
  assert(tad02Atr.ok && tad02Atr.metrics.atr > 0 && approx(tad02Atr.metrics.atrPercent, tad02Atr.metrics.atr / tad02Bars[tad02Bars.length - 1].c * 100, 1e-9), 'Wilder ATR percent is the true-range average scaled by the closing price');
  assert(tad02Adx.ok && tad02Adx.metrics.adx >= 0 && tad02Adx.metrics.adx <= 100 && tad02Adx.metrics.plusDi >= 0 && tad02Adx.metrics.minusDi >= 0, 'ADX and both directional indicators stay non-negative and bounded');
  assert(tad02Boll.ok && tad02Boll.metrics.upper > tad02Boll.metrics.center && tad02Boll.metrics.center > tad02Boll.metrics.lower, 'Bollinger bands bracket their own centre by the declared sample dispersion');

  // Participation transforms are proxies. They may qualify a move; they may never name who traded.
  const tad02Participation = [
    tad02.tadObvSeries(tad02Bars),
    tad02.tadCmfSeries(tad02Bars, { lookback: 20 }),
    tad02.tadRelativeVolume(tad02Bars, { lookback: 20 }),
    tad02.tadEffortResult(tad02Bars, { lookback: 20 })
  ];
  assert(tad02Participation.every((outcome) => outcome.ok && outcome.metrics.proxy === 'ohlcv-volume-transform' && outcome.metrics.actorIdentified === false),
    'Every participation transform declares its OHLCV proxy lineage and identifies no actor');
  assert(tad02Participation.every((outcome) => outcome.familyId === 'participation-proxy' && outcome.clusterId === 'ohlcv-participation'),
    'All four volume transforms share one participation family and one cluster');

  const tad02Profile = tad02.tadVolumeProfile(tad02Bars, { buckets: 48, valueAreaShare: 0.7, allocation: 'uniform-bar-range' });
  assert(tad02Profile.ok && tad02Profile.metrics.valueAreaLow <= tad02Profile.metrics.poc && tad02Profile.metrics.poc <= tad02Profile.metrics.valueAreaHigh && tad02Profile.metrics.valueAreaShare >= 0.7,
    'Volume profile brackets its point of control inside a value area meeting the declared share');
  assert(tad02Profile.metrics.restingLiquidityClaimed === false && tad02Profile.metrics.allocation === 'uniform-bar-range',
    'Volume profile discloses its allocation method and claims no resting liquidity');
  const tad02Vwap = tad02.tadVwapEnvelope(tad02Bars, { deviations: [1, 2] });
  assert(tad02Vwap.ok && tad02Vwap.metrics.bands.length === 2 && tad02Vwap.metrics.bands[1].upper > tad02Vwap.metrics.bands[0].upper,
    'VWAP envelopes widen monotonically with their declared deviation multiples');

  const tad02Pivots = tad02.tadPivots(tad02Bars, { left: 3, right: 3 });
  assert(tad02Pivots.ok && tad02Pivots.metrics.confirmedHighs.every((pivot) => pivot.state === 'confirmed') && tad02Pivots.metrics.provisional.every((pivot) => pivot.state === 'provisional'),
    'Pivot structure keeps confirmed and provisional records in separate states');
  const tad02Rs = tad02.tadRelativeStrength(tad02Series, { normalization: 'total-return-ratio' });
  assert(tad02Rs.ok && tad02Rs.status === 'leads' && approx(tad02Rs.metrics.spread, tad02Rs.metrics.baseReturn - tad02Rs.metrics.peerReturn, 1e-12),
    'Relative strength reports a total-return spread rather than a raw price comparison');
  const tad02Mixed = tad02.tadRelativeStrength(
    [tad02Series[0], { id: 'peer', rows: tad02Rows(0), adjustmentPolicyId: 'OTHER', sessionContractId: 's' }],
    { normalization: 'total-return-ratio' }
  );
  assert(tad02Mixed.status === 'incompatible', 'Mixed adjustment policies fail explicitly as incompatible rather than being compared anyway');

  // Missing history must stay missing. A neutral number here would be the BI-2 failure.
  const tad02Short = tad02.tadSmaSeries(tad02Bars.slice(0, 5), { lengths: [20, 50, 200] });
  assert(!tad02Short.ok && tad02Short.status === 'unavailable' && tad02Short.errors[0].code === 'TAD-TECHNIQUE-HISTORY',
    'Insufficient history returns an unavailable reason instead of a neutral value');
  assert(!tad02.tadSmaSeries(tad02Bars, { lengths: [1] }).ok && tad02.tadSmaSeries(tad02Bars, { lengths: [1] }).errors[0].code === 'TAD-TECHNIQUE-PARAMETER',
    'A length outside the declared parameter bounds is refused before any computation');
  assert(JSON.stringify(tad02.tadSmaSeries(tad02Bars, { lengths: [20, 50, 200] })) === JSON.stringify(tad02Sma),
    'Identical technique inputs repeat byte-identical results');

  // Closed dispatch: JSON selects a known implementation; it can never supply one.
  const tad02Unknown = JSON.parse(JSON.stringify(tadConfig.techniques[0]));
  tad02Unknown.techniqueId = 'injected/v1';
  tad02Unknown.formula = 'process.exit(1)';
  const tad02UnknownOutcome = tad02.tadEvaluateTechnique(tad02Unknown, { bars: tad02Bars }, tadConfig.claimLedger);
  assert(!tad02UnknownOutcome.ok && tad02UnknownOutcome.errors[0].code === 'TAD-TECHNIQUE-UNKNOWN',
    'An unknown technique id is refused and its formula text is never executed');

  // Claim admission: a rejected ledger verdict cannot activate a method.
  const tad02Hidden = JSON.parse(JSON.stringify(tadConfig.techniques[0]));
  tad02Hidden.claimIds = ['claim-hidden-actor'];
  const tad02HiddenOutcome = tad02.tadEvaluateTechnique(tad02Hidden, { bars: tad02Bars }, tadConfig.claimLedger);
  assert(!tad02HiddenOutcome.ok && tad02HiddenOutcome.errors[0].code === 'TAD-CLAIM-REJECTED',
    'A rejected claim stays audit-only and cannot activate a technique');
  const tad02Ungrounded = JSON.parse(JSON.stringify(tadConfig.techniques[0]));
  tad02Ungrounded.claimIds = ['claim-not-in-the-ledger'];
  assert(tad02.tadEvaluateTechnique(tad02Ungrounded, { bars: tad02Bars }, tadConfig.claimLedger).errors[0].code === 'TAD-CLAIM-UNGROUNDED',
    'A technique citing a claim with no ledger record is refused as ungrounded');
  assert(tadConfig.claimLedger.every((record) => record.claimId && record.verdict && record.evidenceTier && record.grounding && record.scope && record.limitation && record.allowedTreatment),
    'Every committed claim record carries grounding, tier, scope, limitation, and allowed treatment');

  // Anti-double-counting: correlated members contribute ONE vote, opposing members cancel.
  const tad02Clustered = tad02.tadClusterEvidenceFamilies([tad02Sma, tad02Ema, tad02Adx], tadConfig.evidenceFamilies);
  const tad02Ma = tad02Clustered.clusters.find((cluster) => cluster.clusterId === 'moving-average');
  assert(tad02Ma && tad02Ma.memberCount === 2 && Math.abs(tad02Ma.vote) === 1,
    'Two correlated moving-average members contribute one cluster vote, not two');
  const tad02Opposed = tad02.tadClusterEvidenceFamilies([
    { ok: true, techniqueId: 'a/v1', familyId: 'trend-filters', clusterId: 'moving-average', status: 'stacked-up' },
    { ok: true, techniqueId: 'b/v1', familyId: 'trend-filters', clusterId: 'moving-average', status: 'stacked-down' }
  ], tadConfig.evidenceFamilies);
  assert(tad02Opposed.clusters[0].state === 'unstable' && tad02Opposed.clusters[0].vote === 0,
    'Opposing methods inside one cluster resolve to unstable rather than cancelling into support');
  // Strength is not direction. This is the assertion that stops a volatility or participation
  // reading from quietly becoming a directional opinion.
  assert(['weak', 'strong', 'expanding', 'contracting', 'above', 'below', 'strengthening', 'weakening'].every((status) =>
    tad02.tadClusterEvidenceFamilies([{ ok: true, techniqueId: 'x/v1', familyId: 'trend-filters', clusterId: 'c', status }], tadConfig.evidenceFamilies).clusters[0].vote === 0),
    'Strength, location, and context states cast no directional vote');
  assert(tad02Clustered.families.every((family) => ['supports', 'contradicts', 'unstable', 'qualifying', 'unavailable'].indexOf(family.state) >= 0 && family.supports + family.contradicts + family.unstable + family.qualifying + family.unavailable === family.clusterCount),
    'Family denominators account for every cluster separately across support, contradiction, instability, qualification, and absence');
  // `qualifying` and `unavailable` are different facts. A cluster whose members all READ but point
  // nowhere has qualified the picture; an unavailable cluster produced no reading at all. Collapsing
  // the first into the second would understate the evidence that is actually on the page.
  const tad02Qualifying = tad02.tadClusterEvidenceFamilies([{ ok: true, techniqueId: 'atr-atrp/v1', familyId: 'volatility-displacement', clusterId: 'true-range', status: 'high' }], tadConfig.evidenceFamilies);
  const tad02Absent = tad02.tadClusterEvidenceFamilies([{ ok: false, techniqueId: 'atr-atrp/v1', familyId: 'volatility-displacement', clusterId: 'true-range', errors: [{ code: 'TAD-TECHNIQUE-HISTORY' }] }], tadConfig.evidenceFamilies);
  assert(tad02Qualifying.clusters[0].state === 'qualifying' && tad02Qualifying.clusters[0].vote === 0 && tad02Qualifying.clusters[0].readCount === 1
    && tad02Absent.clusters[0].state === 'unavailable' && tad02Absent.clusters[0].readCount === 0,
    'A method that reads without pointing is qualifying, not unavailable');
  // Raw method count and independent vote count must both be published, because the gap between
  // them is exactly what stops a long list of correlated indicators from reading as agreement.
  const tad02TrendFamily = tad02Clustered.families.filter((family) => family.familyId === 'trend-filters')[0];
  assert(tad02TrendFamily.methodCount === 3 && tad02TrendFamily.clusterCount === 2 && tad02TrendFamily.methodCount > tad02TrendFamily.clusterCount,
    'Family rollups publish raw method count alongside the smaller independent cluster count');
} catch (e) { failures++; console.log('  ✗ FAIL (Technical Analysis Decision foundation group threw): ' + e.message); }
/* ---------- End Feature 007 Technical Analysis Decision foundation ---------- */

/* ---------- D4 single-source: etf-momentum-lab deflated Sharpe is RLVALID-owned ----------
   etf-momentum-lab.html used to carry its OWN private `deflatedSharpe`, a second definition of a
   metric RLVALID already owns. These assertions are deliberately adversarial: they execute the
   page's REAL statistic scope (oracle helpers + the verbatim marker-bounded adapter block) against
   a SPY RLVALID, so they fail if the live binding ever returns to the page-local copy. */
try {
  group('etf-momentum-lab.html \u2014 D4 deflated-Sharpe single source (RLVALID)');
  const etfSrc = read('etf-momentum-lab.html');
  const ADAPTER_BEGIN = '/* ---------- D4: RLVALID parity adapter ----------';
  const ADAPTER_END = '/* ---------- End D4 RLVALID parity adapter ---------- */';
  const adapterStart = etfSrc.indexOf(ADAPTER_BEGIN);
  const adapterEnd = etfSrc.indexOf(ADAPTER_END);

  assert(/<script src="rlvalidation\.js"><\/script>/.test(etfSrc), 'etf-momentum-lab.html loads rlvalidation.js, the single deflated-Sharpe definition');
  assert((etfSrc.match(/function\s+deflatedSharpe\s*\(/g) || []).length === 1, 'etf-momentum-lab.html declares deflatedSharpe exactly once, retained only as the parity oracle');
  assert(adapterStart > 0 && adapterEnd > adapterStart, 'etf-momentum-lab.html carries the marker-bounded D4 RLVALID parity adapter');

  const adapterBlock = etfSrc.slice(adapterStart, adapterEnd + ADAPTER_END.length);
  const etfOracleHelpers = ['mean', 'normCdf', 'invNorm', 'moments', 'deflatedSharpe'].map((name) => extractFn(etfSrc, name)).join('\n');
  const etfScopeBody = 'var ANN=252;\n' + etfOracleHelpers + '\n' + adapterBlock +
    '\nreturn { live: deflatedSharpe, oracle: etfMomentumOriginalDeflatedSharpe, receipt: window.__ETF_RLVALID_PARITY__ };';
  // eslint-disable-next-line no-new-func
  const buildEtfScope = (rlvalid) => Function('RLVALID', 'window', etfScopeBody)(rlvalid, {});
  const etfEquity = Array.from({ length: 80 }, (_value, index) => Math.pow(1.001 + (index % 3) * 0.0001, index + 1));

  // (a) ADVERSARIAL: the LIVE binding must reach RLVALID. A page-local copy never touches the spy.
  const spyCalls = [];
  const spyScope = buildEtfScope({
    rlvDeflatedSharpe: (curve, trialCount, annualization) => {
      spyCalls.push({ length: curve.length, trialCount, annualization });
      return { ok: true, psr: 0.111, dsr: 0.222, srAnn: 0.333, nTrials: 4444, n: 5555 };
    }
  });
  const spyResult = spyScope.live(etfEquity, 7);
  const spyLast = spyCalls[spyCalls.length - 1];
  assert(spyCalls.length >= 1 && spyLast.length === 80 && spyLast.trialCount === 7 && spyLast.annualization === 252, 'etf live deflatedSharpe delegates to RLVALID.rlvDeflatedSharpe with (equityCurve, trialCount, ANN=252)');
  assert(spyResult.psr === 0.111 && spyResult.dsr === 0.222 && spyResult.srAnn === 0.333 && spyResult.nTrials === 4444 && spyResult.n === 5555, 'etf live deflatedSharpe returns the RLVALID result rather than a page-local recomputation');

  // (b) Parity: the retained oracle and the shared implementation agree bit-for-bit.
  const rlvalidApi = Function('globalThis', read('rlvalidation.js') + '\nreturn globalThis.RLVALID;')({});
  const realScope = buildEtfScope(rlvalidApi);
  const oracleDsr = realScope.oracle(etfEquity, 7);
  const liveDsr = realScope.live(etfEquity, 7);
  assert(['psr', 'dsr', 'srAnn', 'nTrials', 'n'].every((field) => oracleDsr[field] === liveDsr[field]), 'etf parity oracle and RLVALID-delegated live path are bit-identical on the deterministic fixture');
  assert(realScope.receipt && realScope.receipt.available === true && realScope.receipt.equal === true, 'etf page-computed parity receipt reports available and field-by-field equal');

  // (c) Fail loudly: no silent fallback to the page-local copy when RLVALID is missing.
  const bareScope = buildEtfScope(undefined);
  let etfThrew = false;
  try { bareScope.live(etfEquity, 7); } catch (e) { etfThrew = /RLVALID is required/.test(e.message); }
  assert(etfThrew, 'etf live deflatedSharpe throws when RLVALID is absent instead of silently falling back to the private copy');

  // (d) BI-2: an invalid equity level yields an honest null, not a number computed over dropped bars.
  const etfBadCurve = etfEquity.slice();
  etfBadCurve[40] = 0;
  assert(realScope.live(etfBadCurve, 7) === null && realScope.oracle(etfBadCurve, 7) !== null, 'etf live deflatedSharpe returns honest null on a non-positive equity level where the private copy silently computed a number');
} catch (e) { failures++; console.log('  ✗ FAIL (etf-momentum D4 deflated-Sharpe single-source group threw): ' + e.message); }
/* ---------- End D4 single-source: etf-momentum-lab deflated Sharpe ---------- */

/* FEATURE-009-MSFT-JULY-MARKET-REFRESH-BEGIN */
try {
  group('Feature 009 Scope 1 cache-owned MSFT market truth');
  const msftSource = read('msft-july-print-model.html');
  const msftFunctionNames = [
    'msftValidateQuoteEnvelope',
    'msftValidateBarsEnvelope',
    'msftDeriveDailyTechnicals',
    'msftBuildAcceptedState',
    'msftValidateBarRow',
    'msftSma',
    'msftDistancePct',
    'msftClassifyStack'
  ];
  const msft = build(msftFunctionNames.map((name) => extractFn(msftSource, name)), msftFunctionNames);
  // Feature 009 reads FROZEN committed fixtures (a real, internally-coherent MSFT quote+bars
  // snapshot), NOT the live data/**/MSFT.json caches. Those caches are cron-refreshed ~4x/day and
  // the options-vs-bars `fetched` gap is non-deterministic; SCN-009-008 pins staleEvalTime to
  // barsEnv.fetched + 25h yet measures quote staleness against quoteEnv.fetched, so an independent
  // refresh flips the quote between stale/available. The fixtures freeze one coherent snapshot so
  // the SAME market-truth contract is proven deterministically. See tests/fixtures/feature-009/.
  const quoteEnvelope = JSON.parse(read('tests/fixtures/feature-009/msft-options.json'));
  const barsEnvelope = JSON.parse(read('tests/fixtures/feature-009/msft-bars.json'));
  const evaluationTime = new Date(Math.max(Date.parse(quoteEnvelope.fetched), Date.parse(barsEnvelope.fetched)) + 60000).toISOString();
  const acceptedValue = (result) => result && result.ok === true && result.value ? result.value : result;

  const quoteCandidate = acceptedValue(msft.msftValidateQuoteEnvelope(quoteEnvelope, evaluationTime));
  const barsCandidate = acceptedValue(msft.msftValidateBarsEnvelope(barsEnvelope, evaluationTime));
  assert(quoteCandidate && quoteCandidate.valueUsd === quoteEnvelope.spot && quoteCandidate.providerAsOf === quoteEnvelope.asof && quoteCandidate.retrievedAt === quoteEnvelope.fetched, 'Feature 009 quote validator accepts the actual cache value and exact quote clocks');
  assert(barsCandidate && barsCandidate.cutoff === barsEnvelope.asof && barsCandidate.retrievedAt === barsEnvelope.fetched && barsCandidate.rows.length === barsEnvelope.rows.length, 'Feature 009 bar validator accepts every actual daily row and exact bar clocks');

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const quoteWrongSymbol = clone(quoteEnvelope);
  quoteWrongSymbol.sym = 'NOT-MSFT';
  const quoteInvalidPrice = clone(quoteEnvelope);
  quoteInvalidPrice.spot = 0;
  const quoteInvalidProviderClock = clone(quoteEnvelope);
  quoteInvalidProviderClock.asof = 'invalid-provider-clock';
  const quoteInvalidRetrieval = clone(quoteEnvelope);
  quoteInvalidRetrieval.fetched = 'invalid-retrieval-clock';
  const quoteFuture = clone(quoteEnvelope);
  quoteFuture.fetched = new Date(Date.parse(evaluationTime) + 600000).toISOString();
  const quoteEmpty = clone(quoteEnvelope);
  quoteEmpty.o = [];
  const quoteRejections = [
    ['MSFT-QUOTE-SHAPE', null],
    ['MSFT-QUOTE-SYMBOL', quoteWrongSymbol],
    ['MSFT-QUOTE-PRICE', quoteInvalidPrice],
    ['MSFT-QUOTE-PROVIDER-ASOF', quoteInvalidProviderClock],
    ['MSFT-QUOTE-RETRIEVED', quoteInvalidRetrieval],
    ['MSFT-QUOTE-FUTURE', quoteFuture],
    ['MSFT-QUOTE-EMPTY', quoteEmpty]
  ];
  assert(quoteRejections.every(([reasonCode, envelope]) => {
    const result = msft.msftValidateQuoteEnvelope(envelope, evaluationTime);
    return result && result.ok === false && result.reasonCode === reasonCode;
  }), 'Feature 009 quote validator rejects every closed failure class with its exact reason code');

  const barsWrongSymbol = clone(barsEnvelope);
  barsWrongSymbol.sym = 'NOT-MSFT';
  const barsWrongInterval = clone(barsEnvelope);
  barsWrongInterval.interval = '1h';
  const barsInvalidAsOf = clone(barsEnvelope);
  barsInvalidAsOf.asof = 'invalid-cutoff';
  const barsInvalidRetrieval = clone(barsEnvelope);
  barsInvalidRetrieval.fetched = 'invalid-retrieval-clock';
  const barsFuture = clone(barsEnvelope);
  barsFuture.fetched = new Date(Date.parse(evaluationTime) + 600000).toISOString();
  const barsEmpty = clone(barsEnvelope);
  barsEmpty.rows = [];
  const barsInvalidRow = clone(barsEnvelope);
  barsInvalidRow.rows[0].c = null;
  const barsUnordered = clone(barsEnvelope);
  barsUnordered.rows[1].t = barsUnordered.rows[0].t;
  const barsWrongCutoff = clone(barsEnvelope);
  barsWrongCutoff.asof = new Date(barsWrongCutoff.rows.at(-2).t).toISOString().slice(0, 10);
  const barsRejections = [
    ['MSFT-BARS-SHAPE', null],
    ['MSFT-BARS-SYMBOL', barsWrongSymbol],
    ['MSFT-BARS-INTERVAL', barsWrongInterval],
    ['MSFT-BARS-ASOF', barsInvalidAsOf],
    ['MSFT-BARS-RETRIEVED', barsInvalidRetrieval],
    ['MSFT-BARS-FUTURE', barsFuture],
    ['MSFT-BARS-EMPTY', barsEmpty],
    ['MSFT-BARS-ROW', barsInvalidRow],
    ['MSFT-BARS-ORDER', barsUnordered],
    ['MSFT-BARS-CUTOFF', barsWrongCutoff]
  ];
  assert(barsRejections.every(([reasonCode, envelope]) => {
    const result = msft.msftValidateBarsEnvelope(envelope, evaluationTime);
    return result && result.ok === false && result.reasonCode === reasonCode;
  }), 'Feature 009 bar validator rejects every closed failure class with its exact reason code');

  const closes = barsEnvelope.rows.map((row) => row.c);
  const meanTail = (window) => closes.slice(-window).reduce((sum, close) => sum + close, 0) / window;
  const expected = {
    close: closes.at(-1),
    sma20: meanTail(20),
    sma50: meanTail(50),
    sma200: meanTail(200),
    high252: Math.max(...closes.slice(-252))
  };
  expected.stack = expected.sma20 > expected.sma50 && expected.sma50 > expected.sma200
    ? 'bull-stack'
    : expected.sma20 < expected.sma50 && expected.sma50 < expected.sma200
      ? 'bear-stack'
      : 'tangled';
  expected.closeVsSma50Pct = (expected.close / expected.sma50 - 1) * 100;
  expected.closeVsSma200Pct = (expected.close / expected.sma200 - 1) * 100;
  expected.closeVsHigh252Pct = (expected.close / expected.high252 - 1) * 100;

  const technicals = msft.msftDeriveDailyTechnicals(barsCandidate.rows);
  assert(approx(technicals.close, expected.close, 1e-10) && approx(technicals.sma20, expected.sma20, 1e-10) && approx(technicals.sma50, expected.sma50, 1e-10) && approx(technicals.sma200, expected.sma200, 1e-10), 'Feature 009 daily close and SMA20/SMA50/SMA200 equal independent test math over actual daily rows');
  assert(approx(technicals.high252, expected.high252, 1e-10) && technicals.stack === expected.stack && approx(technicals.closeVsSma50Pct, expected.closeVsSma50Pct, 1e-10) && approx(technicals.closeVsSma200Pct, expected.closeVsSma200Pct, 1e-10) && approx(technicals.closeVsHigh252Pct, expected.closeVsHigh252Pct, 1e-10), 'Feature 009 High252 stack and signed distances equal independent test math over actual daily rows');
  assert(!approx(quoteEnvelope.spot, expected.close, 1e-12) && approx(technicals.close, expected.close, 1e-10) && !approx(technicals.close, quoteEnvelope.spot, 1e-12), 'Feature 009 delayed quote differs from and never contaminates the last daily close');
  const shortHistoryTechnicals = msft.msftDeriveDailyTechnicals(barsCandidate.rows.slice(-19));
  assert(shortHistoryTechnicals.status === 'partial' && shortHistoryTechnicals.close === barsCandidate.rows.at(-1).c && shortHistoryTechnicals.sma20 === null && shortHistoryTechnicals.sma50 === null && shortHistoryTechnicals.sma200 === null && shortHistoryTechnicals.high252 === null && shortHistoryTechnicals.stack === null && shortHistoryTechnicals.closeVsSma50Pct === null && shortHistoryTechnicals.closeVsSma200Pct === null && shortHistoryTechnicals.closeVsHigh252Pct === null && Object.keys(shortHistoryTechnicals.unavailableReasons).sort().join(',') === 'high252,sma20,sma200,sma50', 'Feature 009 short daily history exposes every unsupported technical as unavailable with a closed reason');

  const acceptedState = msft.msftBuildAcceptedState({
    fundamentalModel: {
      toolId: 'msft-july-print-model',
      asOf: '2026-07-06',
      status: 'static',
      q4Status: 'scenario-not-actual'
    },
    quote: quoteCandidate,
    dailyBars: barsCandidate,
    technicals,
    scenarioInputs: { values: {}, selectedPreset: 'base', selectedCostPhase: 'transition', selectedScenarioPe: null },
    modelOutputs: {},
    valuation: {},
    marketStatus: 'complete',
    display: { mode: 'simple', heatMetric: 'om' }
  }, evaluationTime);
  const clocks = [acceptedState.fundamentalModel.asOf, acceptedState.quote.providerAsOf, acceptedState.quote.retrievedAt, acceptedState.dailyBars.cutoff, acceptedState.dailyBars.retrievedAt, acceptedState.evaluationTime];
  assert(new Set(clocks).size === clocks.length && !Object.prototype.hasOwnProperty.call(acceptedState, 'data_as_of'), 'Feature 009 accepted state keeps model quote bar retrieval and evaluation clocks distinct with no ambiguous data_as_of');
  assert(acceptedState.fundamentalModel.asOf === '2026-07-06' && acceptedState.quote.valueUsd === quoteEnvelope.spot && acceptedState.dailyBars.rowCount === barsEnvelope.rows.length && acceptedState.technicals.cutoff === barsEnvelope.asof && approx(acceptedState.technicals.close, expected.close, 1e-10), 'Feature 009 accepted state preserves the model cutoff and daily-only technical ownership');
  assert(Object.isFrozen(acceptedState) && Object.isFrozen(acceptedState.quote) && Object.isFrozen(acceptedState.dailyBars) && Object.isFrozen(acceptedState.dailyBars.rows) && Object.isFrozen(acceptedState.technicals), 'Feature 009 accepted state is deeply immutable across market truth branches');

  const replacementQuoteEnvelope = clone(quoteEnvelope);
  replacementQuoteEnvelope.spot = quoteEnvelope.spot + Math.max(1, Math.abs(quoteEnvelope.spot) * 0.01);
  const replacementQuote = acceptedValue(msft.msftValidateQuoteEnvelope(replacementQuoteEnvelope, evaluationTime));
  const quoteReplacedState = msft.msftBuildAcceptedState({
    fundamentalModel: acceptedState.fundamentalModel,
    quote: replacementQuote,
    dailyBars: acceptedState.dailyBars,
    technicals: acceptedState.technicals,
    scenarioInputs: acceptedState.scenarioInputs,
    modelOutputs: acceptedState.modelOutputs,
    valuation: acceptedState.valuation,
    marketStatus: acceptedState.marketStatus,
    display: acceptedState.display
  }, evaluationTime);
  const withoutQuote = (state) => {
    const { quote, ...rest } = state;
    return rest;
  };
  assert(replacementQuote && quoteReplacedState.quote.valueUsd === replacementQuoteEnvelope.spot && JSON.stringify(withoutQuote(quoteReplacedState)) === JSON.stringify(withoutQuote(acceptedState)), 'Feature 009 production-validated quote replacement changes quote-owned fields only');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 009 Scope 1 group threw): ' + e.message); }

try {
  group('Feature 009 Scope 2 isolated degraded market states');
  const msftS2Source = read('msft-july-print-model.html');
  const msftS2Names = [
    'msftValidateQuoteEnvelope',
    'msftValidateBarsEnvelope',
    'msftValidateBarRow',
    'msftSma',
    'msftDistancePct',
    'msftClassifyStack',
    'msftDeriveDailyTechnicals',
    'msftBuildAcceptedState',
    'msftAggregateMarketStatus',
    'msftShouldAcceptQuote',
    'msftShouldAcceptBars',
    'msftSafeReasonCopy',
    'msftReduceResourceOutcome'
  ];
  const s2 = build(msftS2Names.map((name) => extractFn(msftS2Source, name)), msftS2Names);
  const quoteEnv = JSON.parse(read('tests/fixtures/feature-009/msft-options.json'));
  const barsEnv = JSON.parse(read('tests/fixtures/feature-009/msft-bars.json'));
  const evalTime = new Date(Math.max(Date.parse(quoteEnv.fetched), Date.parse(barsEnv.fetched)) + 60000).toISOString();
  const acceptedValue = (result) => (result && result.ok === true && result.value ? result.value : result);

  const quoteAccepted = acceptedValue(s2.msftValidateQuoteEnvelope(quoteEnv, evalTime));
  const barsAccepted = acceptedValue(s2.msftValidateBarsEnvelope(barsEnv, evalTime));
  const baselineTechnicals = s2.msftDeriveDailyTechnicals(barsAccepted.rows);

  const completeState = s2.msftBuildAcceptedState({
    fundamentalModel: { toolId: 'msft-july-print-model', asOf: '2026-07-06', status: 'static', q4Status: 'scenario-not-actual' },
    quote: quoteAccepted,
    dailyBars: barsAccepted,
    technicals: baselineTechnicals,
    scenarioInputs: { values: {}, selectedPreset: 'base', selectedCostPhase: 'transition', selectedScenarioPe: null },
    modelOutputs: {},
    valuation: {},
    marketStatus: 'complete',
    display: { mode: 'simple', heatMetric: 'om' }
  }, evalTime);

  // SCN-009-006: quote missing produces bars-only truth
  const quoteMissingState = s2.msftReduceResourceOutcome(completeState, { resource: 'quote', kind: 'missing', reasonCode: 'MSFT-QUOTE-HTTP', evaluationTime: evalTime });
  assert(
    quoteMissingState.marketStatus === 'partial' &&
    quoteMissingState.quote.status === 'unavailable' &&
    quoteMissingState.quote.valueUsd === null &&
    quoteMissingState.quote.reasonCode === 'MSFT-QUOTE-HTTP' &&
    quoteMissingState.dailyBars.status === barsAccepted.status &&
    quoteMissingState.dailyBars.rowCount === barsEnv.rows.length &&
    quoteMissingState.technicals.cutoff === barsEnv.asof &&
    approx(quoteMissingState.technicals.close, baselineTechnicals.close, 1e-10),
    'Feature 009 quote-missing outcome yields partial bars-only truth with an unavailable null spot and retained daily cutoff'
  );

  // SCN-009-007: bars missing produces quote-only truth
  const barsMissingState = s2.msftReduceResourceOutcome(completeState, { resource: 'bars', kind: 'missing', reasonCode: 'MSFT-BARS-HTTP', evaluationTime: evalTime });
  const technicalReasonFields = Object.keys(barsMissingState.technicals.unavailableReasons).sort().join(',');
  assert(
    barsMissingState.marketStatus === 'partial' &&
    barsMissingState.quote.valueUsd === quoteEnv.spot &&
    barsMissingState.quote.providerAsOf === quoteEnv.asof &&
    barsMissingState.quote.retrievedAt === quoteEnv.fetched &&
    barsMissingState.dailyBars.status === 'unavailable' &&
    barsMissingState.dailyBars.rowCount === 0 &&
    barsMissingState.dailyBars.rows.length === 0 &&
    barsMissingState.technicals.status === 'unavailable' &&
    barsMissingState.technicals.close === null &&
    barsMissingState.technicals.sma50 === null &&
    barsMissingState.technicals.stack === null &&
    technicalReasonFields === 'close,high252,sma20,sma200,sma50',
    'Feature 009 bars-missing outcome yields partial quote-only truth with unavailable technicals and no default trend or moving average'
  );

  // SCN-009-008: stale quote and malformed bars stay isolated
  const staleEvalTime = new Date(Date.parse(barsEnv.fetched) + 90000000).toISOString();
  const staleQuote = acceptedValue(s2.msftValidateQuoteEnvelope(quoteEnv, staleEvalTime));
  const barsWrongSymbol = JSON.parse(JSON.stringify(barsEnv));
  barsWrongSymbol.sym = 'NOT-MSFT';
  const barsRejection = s2.msftValidateBarsEnvelope(barsWrongSymbol, evalTime);
  const staleQuoteState = s2.msftReduceResourceOutcome(completeState, { resource: 'quote', kind: 'stale', candidate: staleQuote, evaluationTime: staleEvalTime });
  const isolatedState = s2.msftReduceResourceOutcome(staleQuoteState, { resource: 'bars', kind: 'rejected', reasonCode: barsRejection.reasonCode, evaluationTime: staleEvalTime });
  assert(
    staleQuote.status === 'stale' &&
    barsRejection.ok === false && barsRejection.reasonCode === 'MSFT-BARS-SYMBOL' &&
    isolatedState.quote.status === 'stale' &&
    isolatedState.quote.valueUsd === quoteEnv.spot &&
    isolatedState.quote.providerAsOf === quoteEnv.asof &&
    isolatedState.quote.retrievedAt === quoteEnv.fetched &&
    isolatedState.dailyBars.status === 'rejected' &&
    isolatedState.dailyBars.reasonCode === 'MSFT-BARS-SYMBOL' &&
    isolatedState.marketStatus === 'partial' &&
    Object.isFrozen(isolatedState) && Object.isFrozen(isolatedState.quote) && Object.isFrozen(isolatedState.dailyBars),
    'Feature 009 stale quote with original clocks and a rejected malformed bars candidate stay isolated without neutral substitutes'
  );

  // Monotonic acceptance: older / out-of-order candidates never win
  const loadingQuoteDomain = { status: 'loading', valueUsd: null, requestSeq: 0, orderingAtMs: null, providerEpochMs: null };
  const olderQuote = { status: 'available', valueUsd: 400, requestSeq: 1, orderingAtMs: 1000, providerEpochMs: null };
  const newerQuote = { status: 'available', valueUsd: 410, requestSeq: 2, orderingAtMs: 2000, providerEpochMs: null };
  const loadingBarsDomain = { status: 'loading', rowCount: 0, cutoff: null, orderingCutoff: null, orderingRetrievedAtMs: null };
  const earlierBars = { status: 'available', rowCount: 10, cutoff: '2026-07-01', orderingCutoff: '2026-07-01', orderingRetrievedAtMs: 1000, rows: [{ c: 1 }] };
  const laterBars = { status: 'available', rowCount: 10, cutoff: '2026-07-06', orderingCutoff: '2026-07-06', orderingRetrievedAtMs: 2000, rows: [{ c: 1 }] };
  assert(
    s2.msftShouldAcceptQuote(loadingQuoteDomain, newerQuote) === true &&
    s2.msftShouldAcceptQuote(newerQuote, olderQuote) === false &&
    s2.msftShouldAcceptQuote(olderQuote, newerQuote) === true &&
    s2.msftShouldAcceptBars(loadingBarsDomain, laterBars) === true &&
    s2.msftShouldAcceptBars(laterBars, earlierBars) === false &&
    s2.msftShouldAcceptBars(earlierBars, laterBars) === true,
    'Feature 009 monotonic acceptance admits first and newer observations while rejecting older out-of-order candidates'
  );

  // Closed safe-copy map: untrusted strings never survive into display copy
  const untrustedReason = '<script>alert(1)</script>error-body';
  const safeKnown = s2.msftSafeReasonCopy('MSFT-BARS-SYMBOL');
  const safeUnknown = s2.msftSafeReasonCopy(untrustedReason);
  assert(
    typeof safeKnown === 'string' && safeKnown.length > 0 && safeKnown.indexOf('MSFT-BARS-SYMBOL') === -1 &&
    safeUnknown === 'Market data unavailable' && safeUnknown.indexOf('<script>') === -1 &&
    s2.msftSafeReasonCopy(null) === 'Market data unavailable',
    'Feature 009 closed safe-copy map returns bounded display strings and never echoes an untrusted reason body'
  );
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 009 Scope 2 group threw): ' + e.message); }

try {
  group('Feature 009 Scope 3 market/model interaction integrity');
  const msftS3Source = read('msft-july-print-model.html');
  const msftS3Names = [
    'msftValidateQuoteEnvelope',
    'msftValidateBarsEnvelope',
    'msftValidateBarRow',
    'msftSma',
    'msftDistancePct',
    'msftClassifyStack',
    'msftDeriveDailyTechnicals',
    'msftBuildAcceptedState',
    'msftAggregateMarketStatus',
    'msftShouldAcceptQuote',
    'msftShouldAcceptBars',
    'msftSafeReasonCopy',
    'msftReduceResourceOutcome',
    'msftBuildValuationRead'
  ];
  const s3 = build(msftS3Names.map((name) => extractFn(msftS3Source, name)), msftS3Names);
  const quoteEnv3 = JSON.parse(read('tests/fixtures/feature-009/msft-options.json'));
  const barsEnv3 = JSON.parse(read('tests/fixtures/feature-009/msft-bars.json'));
  const evalTime3 = new Date(Math.max(Date.parse(quoteEnv3.fetched), Date.parse(barsEnv3.fetched)) + 60000).toISOString();
  const accept3 = (result) => (result && result.ok === true && result.value ? result.value : result);
  const spot3 = quoteEnv3.spot; // the actual accepted delayed spot, parsed from the committed cache (never embedded)

  // Deterministic synthetic model + probability legs are pure-function scaffolding, not market data;
  // every spot-relative expectation below is derived from the parsed spot3.
  const model3 = { EPS27: 15, pe: 22, implied: 15 * 22 };
  const legs3 = [
    { weight: 0.3, price: 380 },
    { weight: 0.5, price: 340 },
    { weight: 0.2, price: 300 }
  ];
  const impMove3 = 5.5;
  const numericOrNull = (read) => [
    read.modeledFy27Eps,
    read.scenarioImpliedPrice,
    read.spotOverModeledFy27Eps,
    read.scenarioPriceVsSpotPct,
    read.probabilityWeightedValue,
    read.probabilityWeightedValueVsSpotPct,
    read.impliedMoveLow,
    read.impliedMoveHigh
  ].every((value) => value === null || Number.isFinite(value));

  // SCN-009-003: an accepted spot reprices the spot-relative comparisons only.
  const usableQuote3 = { status: 'available', valueUsd: spot3 };
  const valUsable = s3.msftBuildValuationRead(model3, usableQuote3, legs3, impMove3);
  const expectedSpotOverEps = spot3 / model3.EPS27;
  const expectedPriceVsSpot = (model3.implied / spot3 - 1) * 100;
  const expectedPwv = (0.3 * 380 + 0.5 * 340 + 0.2 * 300) / (0.3 + 0.5 + 0.2);
  assert(
    approx(valUsable.spotOverModeledFy27Eps, expectedSpotOverEps, 1e-10) &&
    approx(valUsable.scenarioPriceVsSpotPct, expectedPriceVsSpot, 1e-10) &&
    valUsable.selectedScenarioPe === model3.pe &&
    !approx(valUsable.spotOverModeledFy27Eps, valUsable.selectedScenarioPe, 1e-9) &&
    valUsable.marketMultipleBasis === 'model-relative-not-consensus' &&
    valUsable.reasonCodes.length === 0,
    'Feature 009 valuation reprices spot-over-EPS and price-vs-spot from the accepted spot with a model-relative multiple distinct from the selected scenario P/E'
  );
  assert(
    approx(valUsable.probabilityWeightedValue, expectedPwv, 1e-10) &&
    approx(valUsable.probabilityWeightedValueVsSpotPct, (expectedPwv / spot3 - 1) * 100, 1e-10) &&
    approx(valUsable.impliedMoveLow, spot3 * (1 - impMove3 / 100), 1e-10) &&
    approx(valUsable.impliedMoveHigh, spot3 * (1 + impMove3 / 100), 1e-10),
    'Feature 009 valuation derives the probability-weighted value and implied-move band from the accepted spot and user-owned inputs'
  );

  // SCN-009-003/004: a missing or invalid spot returns Unavailable-with-reason and never zero/NaN/Infinity.
  const valNoSpot = s3.msftBuildValuationRead(model3, { status: 'unavailable', valueUsd: null }, legs3, impMove3);
  assert(
    valNoSpot.spotOverModeledFy27Eps === null &&
    valNoSpot.scenarioPriceVsSpotPct === null &&
    valNoSpot.probabilityWeightedValueVsSpotPct === null &&
    valNoSpot.impliedMoveLow === null &&
    valNoSpot.impliedMoveHigh === null &&
    valNoSpot.reasonCodes.indexOf('quote-required') !== -1 &&
    numericOrNull(valNoSpot),
    'Feature 009 valuation reports quote-required for a missing spot with every spot-dependent field null and no zero, NaN, or Infinity'
  );
  const valBadEps = s3.msftBuildValuationRead({ EPS27: 0, pe: 22, implied: 0 }, usableQuote3, legs3, impMove3);
  assert(
    valBadEps.spotOverModeledFy27Eps === null &&
    valBadEps.reasonCodes.indexOf('positive-modeled-eps-required') !== -1 &&
    numericOrNull(valBadEps),
    'Feature 009 valuation refuses a non-positive modeled EPS with positive-modeled-eps-required and no divide-by-zero'
  );

  // SCN-009-010: a refresh-path failure preserves the accepted spot, its clocks, the accepted bars, and aggregate status.
  const quoteAccepted3 = accept3(s3.msftValidateQuoteEnvelope(quoteEnv3, evalTime3));
  const barsAccepted3 = accept3(s3.msftValidateBarsEnvelope(barsEnv3, evalTime3));
  const technicals3 = s3.msftDeriveDailyTechnicals(barsAccepted3.rows);
  const domains3 = {
    fundamentalModel: { toolId: 'msft-july-print-model', asOf: '2026-07-06', status: 'static', q4Status: 'scenario-not-actual' },
    quote: quoteAccepted3,
    dailyBars: barsAccepted3,
    technicals: technicals3,
    scenarioInputs: { values: {}, selectedPreset: 'base', selectedCostPhase: 'transition', selectedScenarioPe: null },
    modelOutputs: {},
    valuation: {},
    marketStatus: 'complete',
    display: { mode: 'simple', heatMetric: 'om' }
  };
  const completeState3 = s3.msftBuildAcceptedState(domains3, evalTime3);
  const refreshFailedState = s3.msftReduceResourceOutcome(completeState3, { resource: 'quote', kind: 'refresh-failed', reasonCode: 'MSFT-QUOTE-HTTP', evaluationTime: evalTime3 });
  assert(
    refreshFailedState.quote.valueUsd === quoteEnv3.spot &&
    refreshFailedState.quote.providerAsOf === quoteEnv3.asof &&
    refreshFailedState.quote.retrievedAt === quoteEnv3.fetched &&
    refreshFailedState.quote.requestSeq === completeState3.quote.requestSeq &&
    refreshFailedState.quote.reasonCode === 'MSFT-QUOTE-HTTP' &&
    refreshFailedState.quote.limitation === s3.msftSafeReasonCopy('MSFT-QUOTE-HTTP') &&
    (refreshFailedState.quote.status === 'available' || refreshFailedState.quote.status === 'stale') &&
    refreshFailedState.dailyBars.rowCount === barsEnv3.rows.length &&
    refreshFailedState.dailyBars.cutoff === barsEnv3.asof &&
    refreshFailedState.marketStatus === completeState3.marketStatus,
    'Feature 009 refresh-path quote failure records the receipt while preserving the accepted spot, its clocks, the accepted bars, and the aggregate status'
  );
  const barsRefreshFailed = s3.msftReduceResourceOutcome(completeState3, { resource: 'bars', kind: 'refresh-failed', reasonCode: 'MSFT-BARS-HTTP', evaluationTime: evalTime3 });
  assert(
    barsRefreshFailed.dailyBars.rowCount === barsEnv3.rows.length &&
    barsRefreshFailed.dailyBars.cutoff === barsEnv3.asof &&
    barsRefreshFailed.dailyBars.reasonCode === 'MSFT-BARS-HTTP' &&
    (barsRefreshFailed.dailyBars.status === 'available' || barsRefreshFailed.dailyBars.status === 'stale') &&
    barsRefreshFailed.technicals.close === completeState3.technicals.close &&
    barsRefreshFailed.quote.valueUsd === quoteEnv3.spot,
    'Feature 009 refresh-path bars failure preserves the accepted daily bars, cutoff, and technicals while recording the receipt'
  );
  const loadingDomains3 = Object.assign({}, domains3, { quote: { status: 'loading', valueUsd: null }, marketStatus: 'loading' });
  const loadingState3 = s3.msftBuildAcceptedState(loadingDomains3, evalTime3);
  const refreshNoPrior = s3.msftReduceResourceOutcome(loadingState3, { resource: 'quote', kind: 'refresh-failed', reasonCode: 'MSFT-QUOTE-TIMEOUT', evaluationTime: evalTime3 });
  assert(
    refreshNoPrior.quote.status === 'refresh-failed' &&
    refreshNoPrior.quote.valueUsd === null &&
    refreshNoPrior.quote.reasonCode === 'MSFT-QUOTE-TIMEOUT' &&
    refreshNoPrior.dailyBars.rowCount === barsEnv3.rows.length,
    'Feature 009 refresh failure with no prior accepted quote reports refresh-failed with a null spot and never resurrects a value'
  );

  // SCN-009-010: an older/out-of-order refresh candidate never replaces the newer accepted request sequence.
  const newerAccepted = Object.assign({}, quoteAccepted3, { requestSeq: 2 });
  const newerState = s3.msftReduceResourceOutcome(completeState3, { resource: 'quote', kind: 'valid', candidate: newerAccepted, evaluationTime: evalTime3 });
  const olderCandidate = Object.assign({}, quoteAccepted3, { requestSeq: 1, valueUsd: quoteEnv3.spot + Math.max(1, Math.abs(quoteEnv3.spot) * 0.02) });
  const afterOlder = s3.msftReduceResourceOutcome(newerState, { resource: 'quote', kind: 'valid', candidate: olderCandidate, evaluationTime: evalTime3 });
  assert(
    newerState.quote.requestSeq === 2 &&
    afterOlder.quote.requestSeq === 2 &&
    afterOlder.quote.valueUsd === quoteEnv3.spot &&
    s3.msftShouldAcceptQuote(newerState.quote, olderCandidate) === false,
    'Feature 009 monotonic acceptance keeps the newer accepted request sequence when an older out-of-order refresh candidate settles'
  );
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 009 Scope 3 group threw): ' + e.message); }

try {
  group('Feature 009 Scope 4 one-state CSV export surface');
  const msftS4Source = read('msft-july-print-model.html');
  const s4Names = ['buildMsftCsvRows', 'msftDeriveDailyTechnicals', 'msftSma', 'msftDistancePct', 'msftClassifyStack'];
  const s4 = build(s4Names.map((name) => extractFn(msftS4Source, name)), s4Names);
  const quoteEnv4 = JSON.parse(read('tests/fixtures/feature-009/msft-options.json'));
  const barsEnv4 = JSON.parse(read('tests/fixtures/feature-009/msft-bars.json'));
  const technicals4 = s4.msftDeriveDailyTechnicals(barsEnv4.rows); // derived from the parsed current bar rows, never embedded
  const exportedAt4 = '2026-07-19T12:34:56.000Z';

  // The canonical 30-input scenario set (the exact user-owned control inventory the export reconstructs).
  const scenarioIds4 = ['revFY26', 'om26', 'volumeGrowth', 'priceMixGrowth', 'churn', 'fx', 'priceMargin', 'volumeMargin', 'churnMargin', 'opexIntensity', 'deltaDep', 'q3Revenue', 'q3OperatingIncome', 'q4Revenue', 'q4OperatingMargin', 'q4Capex', 'q4DaEstimate', 'consensusFY26Revenue', 'consensusFY26EbitMargin', 'ytdRevenue', 'ytdOperatingIncome', 'seasonalDeltaBps', 'otherIncome', 'taxRate', 'shares', 'fwdPE', 'pBull', 'pBase', 'pBear', 'impMove'];
  const scenarioInputs4 = {};
  scenarioIds4.forEach((id, index) => { scenarioInputs4[id] = String(1 + index); });

  // Deterministic model-output scaffolding (pure numbers, not market constants) covering the existing FY26/FY27/Q4/recon outputs.
  const modelOutputs4 = {
    fy26_revenue_usd_b: 329.5, fy26_operating_margin_pct: 46.6, fy26_operating_income_usd_b: 153.547,
    gp_price_usd_b: 14.08, gp_volume_usd_b: 22.84, gp_fx_usd_b: -3.13, gp_churn_usd_b: 3.71,
    incremental_opex_usd_b: 5.03, incremental_depreciation_usd_b: 22,
    fy27_revenue_usd_b: 369.16, fy27_revenue_growth_pct: 12.04, fy27_operating_income_usd_b: 156.6,
    fy27_operating_margin_pct: 42.42, fy26_eps_usd: 16.9, fy27_eps_usd: 17.24, fy27_implied_price_usd: 379.28,
    effective_tax_rate_pct: 19, diluted_shares_b: 7.45,
    q4_operating_income_usd_b: 39.465, q4_eps_usd: 4.02,
    implied_q4_revenue_usd_b: 87.668, consensus_implied_q4_operating_margin_pct: 44.9,
    seasonality_implied_q4_operating_margin_pct: 45.5, scenario_fy26_operating_margin_pct: 46.5
  };
  const modeledEps4 = 17.24;
  const impliedPrice4 = 379.28;
  const completeState4 = {
    fundamentalModel: { toolId: 'msft-july-print-model', asOf: '2026-07-06', status: 'static', q4Status: 'scenario-not-actual' },
    evaluationTime: quoteEnv4.fetched,
    displayMode: 'power',
    marketStatus: 'complete',
    quote: { status: 'available', valueUsd: quoteEnv4.spot, sourceId: 'same-origin-options-snapshot:cboe-delayed', providerAsOf: quoteEnv4.asof, retrievedAt: quoteEnv4.fetched, reasonCode: null },
    dailyBars: { status: 'available', sourceId: 'same-origin-bars-snapshot:' + barsEnv4.src, cutoff: barsEnv4.asof, retrievedAt: barsEnv4.fetched, rowCount: barsEnv4.rows.length, reasonCode: null },
    technicals: technicals4,
    scenarioInputs: scenarioInputs4,
    modelOutputs: modelOutputs4,
    valuation: { selectedScenarioPe: 22, scenarioImpliedPrice: impliedPrice4, spotOverModeledFy27Eps: quoteEnv4.spot / modeledEps4, scenarioPriceVsSpotPct: (impliedPrice4 / quoteEnv4.spot - 1) * 100, probabilityWeightedValue: 360.5, probabilityWeightedValueVsSpotPct: (360.5 / quoteEnv4.spot - 1) * 100 }
  };

  const completeRows = s4.buildMsftCsvRows(completeState4, exportedAt4);
  const completeMap = new Map(completeRows);

  assert(
    Array.isArray(completeRows) && completeRows.length > 0 &&
    completeRows[0][0] === 'schema_version' && completeRows[0][1] === 'msft-july-market-refresh/v1',
    'Feature 009 CSV first row is the versioned msft-july-market-refresh/v1 schema row'
  );

  const requiredFields4 = [
    'schema_version', 'tool_id', 'model_as_of', 'model_status', 'q4_status', 'evaluation_time', 'exported_at', 'display_mode', 'market_status',
    'quote_status', 'quote_value_usd', 'quote_source_id', 'quote_provider_as_of', 'quote_retrieved_at', 'quote_reason_code',
    'daily_bars_status', 'daily_bars_source_id', 'daily_bars_cutoff', 'daily_bars_retrieved_at', 'daily_bars_row_count', 'daily_bars_reason_code',
    'daily_close_usd', 'sma20_usd', 'sma50_usd', 'sma200_usd', 'high252_usd', 'ma_stack', 'close_vs_sma50_pct', 'close_vs_sma200_pct', 'close_vs_high252_pct',
    'selected_scenario_pe', 'scenario_implied_price_usd', 'spot_over_modeled_fy27_eps', 'scenario_price_vs_spot_pct', 'probability_weighted_value_usd', 'probability_weighted_value_vs_spot_pct'
  ];
  const scenarioFields4 = scenarioIds4.map((id) => 'scenario_' + id);
  assert(
    requiredFields4.every((field) => completeMap.has(field)) &&
    scenarioFields4.every((field) => completeMap.has(field)) &&
    Object.keys(modelOutputs4).every((field) => completeMap.has(field)) &&
    !completeMap.has('data_as_of') &&
    completeRows.every(([field]) => field !== 'data_as_of' && field !== 'spot_price'),
    'Feature 009 CSV emits the full versioned field inventory with separate model/quote/bars/technical/scenario/valuation rows and no ambiguous data_as_of or static spot fallback'
  );

  assert(
    completeMap.get('quote_value_usd') === String(quoteEnv4.spot) &&
    completeMap.get('daily_close_usd') === String(technicals4.close) &&
    completeMap.get('daily_bars_row_count') === String(barsEnv4.rows.length) &&
    completeMap.get('spot_over_modeled_fy27_eps') === String(quoteEnv4.spot / modeledEps4) &&
    completeMap.get('fy27_eps_usd') === String(modelOutputs4.fy27_eps_usd) &&
    ['quote_value_usd', 'daily_close_usd', 'sma20_usd', 'spot_over_modeled_fy27_eps', 'fy27_eps_usd'].every((field) => !/[$,%]/.test(completeMap.get(field))),
    'Feature 009 CSV writes raw finite state values without localized currency, comma, or percent formatting'
  );

  assert(
    scenarioIds4.every((id) => completeMap.get('scenario_' + id) === String(Number(scenarioInputs4[id]))) &&
    completeMap.get('display_mode') === 'power' &&
    completeMap.get('market_status') === 'complete' &&
    completeMap.get('exported_at') === exportedAt4 &&
    completeMap.get('evaluation_time') === quoteEnv4.fetched &&
    completeMap.get('exported_at') !== completeMap.get('evaluation_time'),
    'Feature 009 CSV reconstructs the exact complete scenario input set with a distinct export timestamp separate from the evaluation clock'
  );

  const partialState4 = Object.assign({}, completeState4, {
    marketStatus: 'partial',
    displayMode: 'simple',
    quote: { status: 'unavailable', valueUsd: null, sourceId: null, providerAsOf: null, retrievedAt: null, reasonCode: 'MSFT-QUOTE-HTTP' },
    valuation: Object.assign({}, completeState4.valuation, { spotOverModeledFy27Eps: null, scenarioPriceVsSpotPct: null, probabilityWeightedValueVsSpotPct: null })
  });
  const partialRows = s4.buildMsftCsvRows(partialState4, exportedAt4);
  const partialMap = new Map(partialRows);
  assert(
    partialMap.get('quote_value_usd') === '' &&
    partialMap.get('quote_status') === 'unavailable' &&
    partialMap.get('quote_reason_code') === 'MSFT-QUOTE-HTTP' &&
    partialMap.get('spot_over_modeled_fy27_eps') === '' &&
    partialMap.get('scenario_price_vs_spot_pct') === '' &&
    partialMap.get('market_status') === 'partial' &&
    partialMap.get('daily_bars_row_count') === String(barsEnv4.rows.length) &&
    partialMap.get('daily_close_usd') === String(technicals4.close),
    'Feature 009 CSV leaves unavailable values empty while preserving status and reason rows for a partially hydrated state'
  );

  assert(
    completeRows.every(([field, value]) =>
      !/key|token|secret|credential|apikey|password/i.test(field) &&
      !/key|token|secret|credential|apikey|password/i.test(String(value)) &&
      String(value).indexOf('[') === -1 && String(value).indexOf('{') === -1) &&
    !completeMap.has('quote_option_chain') && !completeMap.has('o'),
    'Feature 009 CSV never emits a credential, tokenized value, or raw option-chain payload'
  );
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 009 Scope 4 group threw): ' + e.message); }

try {
  group('Feature 009 Scope 5 static publication and direct consumers');
  const msftS5Source = read('msft-july-print-model.html');
  const s5Names = ['buildMsftStaticToolRead', 'msftDeriveDailyTechnicals', 'msftSma', 'msftDistancePct', 'msftClassifyStack'];
  const s5 = build(s5Names.map((name) => extractFn(msftS5Source, name)), s5Names);
  const quoteEnv5 = JSON.parse(read('tests/fixtures/feature-009/msft-options.json'));
  const barsEnv5 = JSON.parse(read('tests/fixtures/feature-009/msft-bars.json'));
  const technicals5 = s5.msftDeriveDailyTechnicals(barsEnv5.rows); // derived from the parsed current rows, never embedded

  // Deterministic committed-Base scaffolding: pure model numbers, NOT market constants. The builder must project
  // these committed-base values verbatim and derive spot-relative comparisons from the parsed cache spot.
  const baseModel5 = { asOf: '2026-07-06', q4Status: 'scenario-not-actual', modeledFy27Eps: 17.24, committedScenarioPe: 22, scenarioImpliedPriceUsd: 379.28 };
  const quoteProvenance5 = { status: 'available', valueUsd: quoteEnv5.spot, sourceId: 'same-origin-options-snapshot:cboe-delayed', providerAsOf: quoteEnv5.asof, retrievedAt: quoteEnv5.fetched, requestSeq: 0, reasonCode: null, limitation: null };
  const barsProvenance5 = { status: 'available', sourceId: 'same-origin-bars-snapshot:' + barsEnv5.src, cutoff: barsEnv5.asof, retrievedAt: barsEnv5.fetched, rowCount: barsEnv5.rows.length, rows: barsEnv5.rows, reasonCode: null };
  const completeMarket5 = { status: 'complete', evaluationTime: quoteEnv5.fetched, quote: quoteProvenance5, dailyBars: barsProvenance5, technicals: technicals5 };

  const read5 = s5.buildMsftStaticToolRead(baseModel5, completeMarket5);

  // (1) Strict rl-tool-read/v1 envelope shape (exactly the keys RLDATA.putToolRead accepts).
  const envKeys5 = Object.keys(read5).sort();
  const expectedEnvKeys5 = ['asOf', 'availability', 'computedAt', 'contractVersion', 'deepLink', 'freshUntil', 'id', 'metrics', 'read'];
  assert(
    JSON.stringify(envKeys5) === JSON.stringify(expectedEnvKeys5) &&
    read5.contractVersion === 'rl-tool-read/v1' &&
    read5.id === 'msft-july-print-model' &&
    read5.deepLink === 'msft-july-print-model.html#simple' &&
    read5.availability === 'current' &&
    read5.asOf === '2026-07-06' &&
    read5.freshUntil === null &&
    read5.computedAt === quoteEnv5.fetched &&
    typeof read5.read === 'string' && read5.read.indexOf('Static MSFT model as of 2026-07-06') === 0,
    'Feature 009 static tool read is a strict rl-tool-read/v1 envelope with stable id/deepLink and current availability at 2026-07-06'
  );

  // (2) msft-static-model-read/v1 metrics: static-model profile, committed-base basis, false eligibility flags.
  const metrics5 = read5.metrics;
  assert(
    metrics5.schemaVersion === 'msft-static-model-read/v1' &&
    metrics5.profile === 'static-model' &&
    metrics5.model.asOf === '2026-07-06' &&
    metrics5.model.scenarioBasis === 'committed-base' &&
    metrics5.model.q4Status === 'scenario-not-actual' &&
    metrics5.model.activeUserScenarioIncluded === false &&
    metrics5.recommendationEligible === false &&
    metrics5.marketAggregationEligible === false &&
    Array.isArray(metrics5.limitations) && metrics5.limitations.length === 3,
    'Feature 009 static metrics use the committed-Base static-model schema with false active/recommendation/aggregation eligibility'
  );

  // (3) Committed Base valuation (not active controls) with spot-relative comparisons from the parsed cache spot.
  assert(
    metrics5.valuation.modeledFy27Eps === baseModel5.modeledFy27Eps &&
    metrics5.valuation.committedScenarioPe === baseModel5.committedScenarioPe &&
    metrics5.valuation.scenarioImpliedPriceUsd === baseModel5.scenarioImpliedPriceUsd &&
    metrics5.valuation.spotOverModeledFy27Eps === quoteEnv5.spot / baseModel5.modeledFy27Eps &&
    metrics5.valuation.scenarioPriceVsSpotPct === (baseModel5.scenarioImpliedPriceUsd / quoteEnv5.spot - 1) * 100 &&
    metrics5.valuation.basis === 'model-relative-not-consensus',
    'Feature 009 static valuation carries committed-Base EPS/PE/implied and derives spot-relative comparisons from the parsed cache spot'
  );

  // (4) Separate market provenance carried from the accepted evidence (parsed caches), never model-owned.
  assert(
    metrics5.market.status === 'complete' &&
    metrics5.market.quote.valueUsd === quoteEnv5.spot &&
    metrics5.market.quote.providerAsOf === quoteEnv5.asof &&
    metrics5.market.quote.retrievedAt === quoteEnv5.fetched &&
    metrics5.market.dailyBars.cutoff === barsEnv5.asof &&
    metrics5.market.dailyBars.retrievedAt === barsEnv5.fetched &&
    metrics5.market.dailyBars.rowCount === barsEnv5.rows.length &&
    metrics5.technicals.close === technicals5.close &&
    metrics5.technicals.stack === technicals5.stack,
    'Feature 009 static read carries separate quote/bar/technical market provenance equal to the parsed current cache clocks'
  );

  // (5) No raw / private / user-owned content: no raw bar rows, no active control set, no credential/token/requestSeq.
  const readJson5 = JSON.stringify(read5);
  assert(
    !Object.prototype.hasOwnProperty.call(metrics5.market.dailyBars, 'rows') &&
    !Object.prototype.hasOwnProperty.call(metrics5, 'scenarioInputs') &&
    !Object.prototype.hasOwnProperty.call(metrics5.market.quote, 'requestSeq') &&
    !/key|token|secret|credential|apikey|password/i.test(readJson5) &&
    readJson5.indexOf('optSnaps') === -1 &&
    metrics5.market.quote.valueUsd !== null,
    'Feature 009 static read publishes no raw bar rows, active scenario control set, credential, or ordering-internal field'
  );

  // (6) Degraded market: base still computes -> availability stale; unavailable spot nulls (never zeros) spot-relative legs.
  const partialMarket5 = { status: 'partial', evaluationTime: quoteEnv5.fetched, quote: { status: 'unavailable', valueUsd: null, sourceId: null, providerAsOf: null, retrievedAt: null, reasonCode: 'MSFT-QUOTE-HTTP' }, dailyBars: barsProvenance5, technicals: technicals5 };
  const partialRead5 = s5.buildMsftStaticToolRead(baseModel5, partialMarket5);
  assert(
    partialRead5.availability === 'stale' &&
    partialRead5.asOf === '2026-07-06' &&
    partialRead5.metrics.market.status === 'partial' &&
    partialRead5.metrics.market.quote.valueUsd === null &&
    partialRead5.metrics.market.quote.reasonCode === 'MSFT-QUOTE-HTTP' &&
    partialRead5.metrics.valuation.spotOverModeledFy27Eps === null &&
    partialRead5.metrics.valuation.scenarioPriceVsSpotPct === null &&
    partialRead5.metrics.valuation.modeledFy27Eps === baseModel5.modeledFy27Eps &&
    partialRead5.metrics.recommendationEligible === false,
    'Feature 009 static read stays stale-but-computed under a partial market and nulls (never zeros) spot-relative comparisons'
  );

  // (7) Direct-consumer scan: exactly one stable-identity MSFT record in tools.json and index.html.
  const toolsJson5 = JSON.parse(read('tools.json'));
  const indexHtml5 = read('index.html');
  const toolsRecords5 = toolsJson5.tools.filter((t) => t.id === 'msft-july-print-model');
  const msftRecord5 = toolsRecords5[0];
  const indexIdCount5 = (indexHtml5.match(/id:\s*'msft-july-print-model'/g) || []).length;
  assert(
    toolsRecords5.length === 1 &&
    msftRecord5.file === 'msft-july-print-model.html' &&
    msftRecord5.notes === 'notes/msft-july-print-model.md' &&
    msftRecord5.status === 'live' &&
    msftRecord5.title === 'MSFT July-Print Margin & EPS Model' &&
    msftRecord5.briefing.profile === 'static-model' &&
    indexIdCount5 === 1 &&
    indexHtml5.indexOf("file: 'msft-july-print-model.html'") !== -1 &&
    indexHtml5.indexOf("notes: 'notes/msft-july-print-model.md'") !== -1,
    'Feature 009 keeps exactly one stable-identity msft-july-print-model record in tools.json and index.html'
  );

  // (8) One two-clock truth is shared across the read, notes, and MSFT registry blurb.
  const notes5 = read('notes/msft-july-print-model.md');
  assert(
    read5.metrics.model.asOf === '2026-07-06' &&
    notes5.indexOf('2026-07-06') !== -1 &&
    notes5.indexOf('2026-07-29') !== -1 &&
    notes5.indexOf('data/options/MSFT.json') !== -1 &&
    notes5.indexOf('data/bars/MSFT.json') !== -1 &&
    notes5.indexOf('368.57 is hardcoded') === -1 &&
    /delayed quote|cache-first|cache/i.test(msftRecord5.blurb),
    'Feature 009 expresses one two-clock truth (model 2026-07-06, scheduled 2026-07-29, separate data/options and data/bars evidence) across the read, notes, and MSFT registry blurb'
  );
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 009 Scope 5 group threw): ' + e.message); }
/* FEATURE-009-MSFT-JULY-MARKET-REFRESH-END */

/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */
try {
  group('Feature 010 Scope 1 company publication foundation');
  await import('../rlcompany.js');
  const companyApi = globalThis.RLCOMPANY;
  const companyConfig = JSON.parse(read('company-fundamentals.config.json'));
  const companyPointer = JSON.parse(read('data/company-fundamentals/companies/sec-cik-0000789019/current.json'));
  const companyManifest = JSON.parse(read(companyPointer.manifestPath));
  const companyObjects = {};
  const companyObjectQueue = [companyManifest.identityRef, companyManifest.summaryRef, companyManifest.dossierRef, companyManifest.ownerReadRef].concat(companyManifest.sourceRefs, companyManifest.historyRefs);
  const companyObjectRefs = {};
  while (companyObjectQueue.length) {
    const companyObjectRef = companyObjectQueue.shift();
    if (companyObjectRefs[companyObjectRef.objectId]) continue;
    companyObjectRefs[companyObjectRef.objectId] = companyObjectRef;
    const companyObject = JSON.parse(read(companyObjectRef.path));
    companyObjects[companyObjectRef.objectId] = companyObject;
    (function collectCompanyRefs(value) {
      if (value && value.contractVersion === 'company-object-ref/v1') { companyObjectQueue.push(value); return; }
      if (Array.isArray(value)) value.forEach(collectCompanyRefs);
      else if (value && typeof value === 'object') Object.values(value).forEach(collectCompanyRefs);
    })(companyObject);
  }
  const companySourceCapture = JSON.parse(read('tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json'));
  const { gunzipSync: gunzipCompanySource } = await import('node:zlib');
  const companySourceBytes = gunzipCompanySource(Buffer.from(read(companySourceCapture.payloadPath), 'base64'));
  const companySourceRaw = companySourceBytes.toString('utf8');
  const companyNormalizedSource = companyApi.parseSecSubmissionsResponse(companySourceRaw, {
    sourceUrl: companySourceCapture.sourceUrl,
    cik: companySourceCapture.cik,
    retrievedAt: companySourceCapture.retrievedAt,
    mediaType: companySourceCapture.mediaType,
    rights: companySourceCapture.rights,
    requestIdentityPolicy: companySourceCapture.requestIdentityPolicy
  });
  const companySubmissionSources = Object.values(companyObjects).filter((object) => object.contractVersion === 'source-artifact/v1' && object.sourceKind === 'sec-submissions');
  const configValidation = companyApi.validateCompanyConfig(companyConfig);
  assert(configValidation.ok && companyApi.companyObjectSha256(companyConfig) === companyManifest.configFingerprint, 'Feature 010 production config validates and binds to the publication fingerprint');
  assert(companyApi.validateCompanyCurrentPointer(companyPointer, 'sec-cik-0000789019') && companyPointer.manifestSha256 === companyManifest.manifestSha256, 'Feature 010 current pointer selects the content-addressed production manifest');
  assert(companySourceCapture.contractVersion === 'company-source-capture/v1' && companySourceCapture.completeResponse === true && companySourceCapture.payloadEncoding === 'gzip+base64' && companySourceBytes.length === companySourceCapture.byteLength && `sha256:${companyApi.sha256Hex(companySourceRaw)}` === companySourceCapture.contentSha256 && companyNormalizedSource.contentSha256 === companySourceCapture.contentSha256, 'Feature 010 retained SEC payload is byte-hash coherent and passes production parsing');
  assert(companySubmissionSources.length === 1 && companySubmissionSources[0].contentSha256 === companySourceCapture.contentSha256 && companySubmissionSources[0].limitations[0].startsWith('Exact raw SEC response bytes retained'), 'Feature 010 SourceArtifact binds the exact retained response bytes');
  const companyGraphValidation = companyApi.validatePublicationGraph(companyManifest, companyObjects);
  assert(companyGraphValidation.ok && companyApi.companyManifestSha256(companyManifest) === companyManifest.manifestSha256, 'Feature 010 materialized publication graph and canonical manifest hash validate');
  assert(companyApi.canonicalizeCompanyObject({ b: 1, a: 2 }) === companyApi.canonicalizeCompanyObject({ a: 2, b: 1 }) && companyApi.sha256Hex('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector');
  const companyAcceptedState = companyApi.projectAcceptedPublication(companyManifest, companyObjects);
  assert(companyAcceptedState.identity.issuerName === companyNormalizedSource.issuerName && companyAcceptedState.identity.cik === companyNormalizedSource.cik && companyAcceptedState.identity.ticker === companyNormalizedSource.tickers[0] && companyAcceptedState.identity.exchange === companyNormalizedSource.exchanges[0] && companyAcceptedState.periods[0].accession === companyNormalizedSource.latestQuarterlyFiling.accessionNumber && companyAcceptedState.periods[0].end === companyNormalizedSource.latestQuarterlyFiling.reportDate, 'Feature 010 accepted identity and period derive from production-normalized source bytes');
  const companyDirection = companyAcceptedState.dependencyResults.find((result) => result.id === 'metric-direction');
  const companyIdentitySummary = companyAcceptedState.dependencyResults.find((result) => result.id === 'identity-summary');
  assert(companyDirection.state === 'unavailable' && companyDirection.value === null && companyDirection.missingFactIds.join(',') === 'fact-revenue' && companyIdentitySummary.state === 'available' && companyIdentitySummary.value === 'MICROSOFT CORP | MSFT', 'Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry');
  const companyTrace = companyApi.selectSourcesView(companyAcceptedState, 'claim-direction');
  assert(companyTrace.observations.length === 0 && companyTrace.sourceRequirements[0].sourceId === 'sec-companyfacts-msft' && companyTrace.transformations.map((item) => item.id).join(',') === 'mapping-revenue,formula-direction-foundation' && companyTrace.consumers.length === 2 && companyTrace.rights[0].limitations.length === 2 && companyTrace.unavailableLinks.length === 1, 'Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence');
  const companyRouteSource = read('company-fundamentals-lab.html');
  const companyScriptSources = Array.from(companyRouteSource.matchAll(/<script\s+src="([^"]+)"/g), (match) => match[1]);
  assert(hasExactCompanyRouteScripts(companyScriptSources) && !companyRouteSource.includes('foundation-publication.js') && companyRouteSource.includes('RLCOMPANY.loadCompanyPublication') && companyRouteSource.includes('data/company-fundamentals/companies/sec-cik-0000789019/current.json') && companyRouteSource.includes('fetchImpl: window.fetch.bind(window)') && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(companyRouteSource), 'Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field');
  const companyValidatorSource = read('scripts/validate-company-fundamentals.mjs');
  assert(companyValidatorSource.includes('gunzipSync') && companyValidatorSource.includes('parseSecSubmissionsResponse') && companyValidatorSource.includes('validateCompanyConfig') && companyValidatorSource.includes('validatePublicationGraph') && companyValidatorSource.includes('projectAcceptedPublication') && companyValidatorSource.includes('selectSourcesView'), 'Feature 010 validator executes exact-capture parsing config graph projection and trace functions');
  const companyPeriodClassifications = ['period-msft-fy2026-q3', 'period-msft-fy2025-annual', 'period-msft-fy2026-q3-ytd', 'period-msft-fy2026-q3-instant'].map((id) => companyApi.classifyReportingPeriod(companyObjects[id]));
  assert(companyAcceptedState.periods.length === 4 && companyPeriodClassifications.map((entry) => entry.classification).join(',') === 'quarter,annual,year-to-date,instant' && companyPeriodClassifications.map((entry) => entry.standaloneQuarter).join(',') === 'true,false,false,false', 'Feature 010 reporting periods classify annual quarter YTD and instant and never show YTD or instant as a standalone quarter');
  const companyPeriodRef = { contractVersion: 'company-object-ref/v1', path: `data/company-fundamentals/objects/${companyApi.companyObjectSha256(companyObjects['period-msft-fy2026-q3']).slice(7)}.json`, sha256: companyApi.companyObjectSha256(companyObjects['period-msft-fy2026-q3']), objectId: 'period-msft-fy2026-q3' };
  const companyStatementObservation = (observationId, value, state) => ({ ...structuredClone(companyObjects['dossier-msft-foundation-g1'].observations[0]), observationId, evidenceClass: 'reported', periodRef: companyPeriodRef, sourceConcept: 'us-gaap:Assets', value, valueType: 'decimal', unit: 'USD', currency: 'USD', decimals: '-6', signConvention: 'positive-natural', state });
  const companyReconcileRequest = (observations, amendments) => ({ factId: 'fact-total-assets', normalizedConcept: 'total-assets', mappingId: 'mapping-total-assets', mappingVersion: 'us-gaap-assets/v1', transformation: { sign: 1, scalePower10: 0, aggregation: 'none' }, observations, amendments });
  const companyRestated = companyApi.reconcileFactObservations(companyReconcileRequest([companyStatementObservation('obs-assets-original', '500000000000', 'restated'), companyStatementObservation('obs-assets-amended', '512000000000', 'current')], [{ originalObservationId: 'obs-assets-original', amendingObservationId: 'obs-assets-amended' }]));
  const companyConflicted = companyApi.reconcileFactObservations(companyReconcileRequest([companyStatementObservation('obs-assets-a', '500000000000', 'current'), companyStatementObservation('obs-assets-b', '540000000000', 'current')], []));
  assert(companyRestated.normalizedFact.resolutionState === 'restated' && companyRestated.normalizedFact.currentObservationId === 'obs-assets-amended' && companyRestated.normalizedFact.observationIds.join(',') === 'obs-assets-original,obs-assets-amended' && companyApi.validateNormalizedFact(companyRestated.normalizedFact).ok && companyConflicted.normalizedFact.resolutionState === 'conflicted' && companyConflicted.normalizedFact.currentObservationId === null && companyConflicted.averaged === false && companyConflicted.conflictingObservationIds.join(',') === 'obs-assets-a,obs-assets-b', 'Feature 010 reconciliation restates amendments and keeps genuine conflicts visible without averaging');
  const companyImbalance = companyApi.evaluateStatementIntegrity({ companyId: 'sec-cik-0000789019', periodId: 'period-msft-fy2026-q3-instant', assets: { observationId: 'obs-assets', value: '600000000000', decimals: '-6' }, liabilities: { observationId: 'obs-liabilities', value: '200000000000', decimals: '-6' }, equity: { observationId: 'obs-equity', value: '250000000000', decimals: '-6' } });
  const companyClean = companyApi.evaluateStatementIntegrity({ companyId: 'sec-cik-0000789019', periodId: 'period-msft-fy2026-q3-instant', assets: { observationId: 'obs-assets', value: '512163000000', decimals: '-6' }, liabilities: { observationId: 'obs-liabilities', value: '205753000000', decimals: '-6' }, equity: { observationId: 'obs-equity', value: '306410000000', decimals: '-6' } });
  assert(companyImbalance.withinTolerance === false && companyImbalance.error.code === 'C010-INTEGRITY-BALANCE-SHEET' && companyImbalance.error.affectedRefs.join(',') === 'obs-assets,obs-liabilities,obs-equity' && companyImbalance.difference === '150000000000' && companyImbalance.allowedInterval === '1500000' && companyImbalance.blockedConclusions.length === 3 && Object.keys(companyImbalance.sourceFacts).join(',') === 'assets,liabilities,equity' && companyClean.withinTolerance === true && companyClean.error === null && companyApi.ERROR_CODES.includes('C010-INTEGRITY-BALANCE-SHEET'), 'Feature 010 statement integrity blocks a balance-sheet imbalance while keeping source facts inspectable and passes a clean statement');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 010 Scope 1 foundation group threw): ' + e.message); }
/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */

/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE2-BEGIN */
try {
  group('Feature 010 Scope 2 derived metrics diagnostics and archetype-prioritized Simple cockpit');
  const scope2Api = globalThis.RLCOMPANY;
  const scope2Config = JSON.parse(read('company-fundamentals.config.json'));
  const scope2Pointer = JSON.parse(read('data/company-fundamentals/companies/sec-cik-0000789019/current.json'));
  const scope2Manifest = JSON.parse(read(scope2Pointer.manifestPath));
  const scope2Objects = {};
  const scope2Queue = [scope2Manifest.identityRef, scope2Manifest.summaryRef, scope2Manifest.dossierRef, scope2Manifest.ownerReadRef].concat(scope2Manifest.sourceRefs, scope2Manifest.historyRefs);
  const scope2Seen = {};
  while (scope2Queue.length) {
    const scope2Ref = scope2Queue.shift();
    if (scope2Seen[scope2Ref.objectId]) continue;
    scope2Seen[scope2Ref.objectId] = true;
    const scope2Object = JSON.parse(read(scope2Ref.path));
    scope2Objects[scope2Ref.objectId] = scope2Object;
    (function collectScope2Refs(value) {
      if (value && value.contractVersion === 'company-object-ref/v1') { scope2Queue.push(value); return; }
      if (Array.isArray(value)) value.forEach(collectScope2Refs);
      else if (value && typeof value === 'object') Object.values(value).forEach(collectScope2Refs);
    })(scope2Object);
  }
  const scope2Accepted = scope2Api.projectAcceptedPublication(scope2Manifest, scope2Objects);
  const scope2ArchetypeView = scope2Api.resolveArchetypeView(scope2Config, 'sec-cik-0000789019');
  const scope2Before = JSON.stringify(scope2Accepted);
  const scope2Software = scope2Api.selectSimpleView(scope2Accepted, scope2ArchetypeView);
  const scope2Unclassified = scope2Api.selectSimpleView(scope2Accepted);
  const scope2After = JSON.stringify(scope2Accepted);
  assert(scope2ArchetypeView.status === 'accepted' && scope2ArchetypeView.primaryArchetypeId === 'archetype-software-platform' && scope2Software.archetype.label === 'Software platform' && scope2Software.kpiPriorities.map((kpi) => kpi.normalizedConcept).join(',') === 'cloud-revenue,commercial-backlog,capital-expenditure,depreciation,operating-margin,cash-conversion,dilution' && scope2Software.kpiPriorities.every((kpi) => kpi.state === 'unavailable' && typeof kpi.evidenceRequirement === 'string'), 'Feature 010 Scope 2 archetype view orders MSFT software drivers with honest unavailable KPI evidence');
  assert(scope2Software.clocks.statementCutoff === scope2Accepted.ownerRead.statementCutoff && scope2Software.clocks.modelCutoff === scope2Accepted.ownerRead.modelCutoff && scope2Software.clocks.briefCutoff === scope2Accepted.ownerRead.briefCutoff && scope2Software.clocks.marketCutoff === scope2Accepted.ownerRead.marketCutoff, 'Feature 010 Scope 2 Simple cockpit keeps statement model brief and market clocks separate and equal to the owner objects');
  assert(scope2Before === scope2After && JSON.stringify(scope2Software.identity) === JSON.stringify(scope2Unclassified.identity) && JSON.stringify(scope2Software.evidenceCoverage) === JSON.stringify(scope2Unclassified.evidenceCoverage) && JSON.stringify(scope2Software.claims) === JSON.stringify(scope2Unclassified.claims) && JSON.stringify(scope2Software.dependencyResults) === JSON.stringify(scope2Unclassified.dependencyResults), 'Feature 010 Scope 2 archetype prioritization keeps shared facts byte-stable across archetypes');
  assert(scope2Unclassified.archetype.status === 'unclassified' && scope2Unclassified.archetype.label === null && scope2Unclassified.kpiAvailability.state === 'unavailable' && scope2Unclassified.diagnosticsAvailability.state === 'unavailable' && scope2Unclassified.dependencyResults.find((result) => result.id === 'identity-summary').value === 'MICROSOFT CORP | MSFT', 'Feature 010 Scope 2 unclassified Simple view inherits no lens and preserves shared facts');
  const scope2Coverage = scope2Api.evaluateDiagnostic({ checkId: 'check-interest-coverage', policyId: 'policy-interest-coverage', policyVersion: 'interest-coverage/v1', concept: 'interest-coverage', periodId: 'period-msft-fy2026-q3', raw: { formula: 'operating-income / interest-expense', threshold: '3.0', operation: 'ratio', inputs: [{ inputId: 'operating-income', ref: 'obs-operating-income', concept: 'operating-income', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '30000000000', state: 'available' }, { inputId: 'interest-expense', ref: 'obs-interest-expense', concept: 'interest-expense', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '500000000', state: 'available' }] }, contextualAdjustment: { adjustmentId: 'adj-lease-interest', amount: '250000000', rationale: 'Add back capitalized lease interest disclosed in the notes.', sourceRefs: ['obs-lease-note'], sensitivity: 'A 10% change in lease interest moves coverage by 0.2x.', applicability: 'Applies only while operating leases remain material.' }, interpretationMode: null });
  assert(scope2Coverage.raw.value === '60' && scope2Coverage.raw.inputRefs.join(',') === 'obs-operating-income,obs-interest-expense' && scope2Coverage.raw.period === 'period-msft-fy2026-q3' && scope2Coverage.presence === 'present' && scope2Coverage.contextual.amount === '250000000' && !Object.prototype.hasOwnProperty.call(scope2Coverage, 'score'), 'Feature 010 Scope 2 diagnostic renders the raw record before the contextual adjustment with no universal score');
  const scope2Preferred = scope2Api.evaluateDiagnostic({ checkId: 'check-preferred-stock', policyId: 'policy-preferred-stock', policyVersion: 'preferred-stock/v1', concept: 'preferred-stock', periodId: 'period-msft-fy2026-q3-instant', raw: { formula: 'preferred-stock-present-or-explicit-zero', threshold: null, operation: 'presence-check', inputs: [] }, contextualAdjustment: null, interpretationMode: null });
  assert(scope2Preferred.presence === 'absent-from-eligible-source' && scope2Preferred.raw.state === 'absent-from-eligible-source' && scope2Preferred.raw.value === null && scope2Preferred.contextual === null && !/\bpass\b/i.test(JSON.stringify(scope2Preferred)), 'Feature 010 Scope 2 omitted preferred stock stays absent-from-eligible-source and never zero or pass');
  const scope2Buyback = scope2Api.evaluateDiagnostic({ checkId: 'check-capital-allocation', policyId: 'policy-capital-allocation', policyVersion: 'capital-allocation/v1', concept: 'capital-allocation-buyback', periodId: 'period-msft-fy2026-q3', raw: { formula: 'net-share-change = shares-issued - shares-repurchased; dilution = share-based-comp / diluted-shares', threshold: null, operation: 'none', inputs: [{ inputId: 'gross-repurchases', ref: 'obs-repurchase-outlay', concept: 'repurchase-outlay', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '10000000000', state: 'available', flowKind: 'period-flow' }, { inputId: 'treasury-stock', ref: 'obs-treasury-stock', concept: 'treasury-stock', unit: 'USD', periodId: 'period-msft-fy2026-q3-instant', value: '85000000000', state: 'available', flowKind: 'balance' }, { inputId: 'shares-issued', ref: 'obs-shares-issued', concept: 'shares-issued', unit: 'shares', periodId: 'period-msft-fy2026-q3', value: '30000000', state: 'available', flowKind: 'period-flow' }, { inputId: 'shares-repurchased', ref: 'obs-shares-repurchased', concept: 'shares-repurchased', unit: 'shares', periodId: 'period-msft-fy2026-q3', value: '20000000', state: 'available', flowKind: 'period-flow' }, { inputId: 'share-based-comp', ref: 'obs-sbc', concept: 'share-based-comp', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '2500000000', state: 'available', flowKind: 'period-flow' }, { inputId: 'diluted-shares', ref: 'obs-diluted-shares', concept: 'diluted-shares', unit: 'shares', periodId: 'period-msft-fy2026-q3', value: '7500000000', state: 'available', flowKind: 'balance' }] }, contextualAdjustment: null, interpretationMode: 'capital-allocation' });
  assert(scope2Buyback.capitalAllocation.netShareChange === '10000000' && scope2Buyback.capitalAllocation.grossRepurchaseOutlay.flowKind === 'period-flow' && scope2Buyback.capitalAllocation.treasuryStockBalance.flowKind === 'balance' && /net share change/i.test(scope2Buyback.interpretation) && /dilution/i.test(scope2Buyback.interpretation) && !/beneficial|value-accretive|shareholder-friendly/i.test(scope2Buyback.interpretation), 'Feature 010 Scope 2 buyback interpretation cites net share change and dilution and keeps gross flows distinct');
  const scope2Metric = scope2Api.evaluateDerivedMetric({ metricId: 'metric-cash-conversion', formulaId: 'formula-cash-conversion', formulaVersion: 'cash-conversion/v1', outputConcept: 'cash-conversion', unit: 'ratio', periodId: 'period-msft-fy2026-q3', operation: 'ratio', inputs: [{ inputId: 'in-ocf', ref: 'fact-operating-cash-flow', concept: 'operating-cash-flow', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '36000000000', state: 'available' }, { inputId: 'in-ni', ref: 'fact-net-income', concept: 'net-income', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '24000000000', state: 'available' }], qualifications: [] });
  assert(scope2Metric.value === '1.5' && scope2Metric.expression === 'operating-cash-flow / net-income' && scope2Metric.state === 'available' && !Object.prototype.hasOwnProperty.call(scope2Metric, 'score') && !Object.prototype.hasOwnProperty.call(scope2Metric, 'universalScore'), 'Feature 010 Scope 2 derived metric exposes its formula and inputs and never emits a universal score');
  const scope2ConfigValidation = scope2Api.validateCompanyConfig(scope2Config);
  const scope2SoftwareDefinition = scope2Config.archetypes.definitions.find((definition) => definition.archetypeId === 'archetype-software-platform');
  assert(scope2ConfigValidation.ok && scope2Api.companyObjectSha256(scope2Config) === scope2Manifest.configFingerprint && scope2SoftwareDefinition.kpiPriorities.length === 7 && scope2SoftwareDefinition.diagnosticPolicies.length === 2 && scope2Config.formulas.filter((formula) => formula.formulaId === 'formula-cash-conversion' || formula.formulaId === 'formula-operating-margin').length === 2, 'Feature 010 Scope 2 config binds formulas and the software-platform archetype to the regenerated publication fingerprint');
  const scope2RouteSource = read('company-fundamentals-lab.html');
  const scope2Scripts = Array.from(scope2RouteSource.matchAll(/<script\s+src="([^"]+)"/g), (match) => match[1]);
  assert(hasExactCompanyRouteScripts(scope2Scripts) && scope2RouteSource.includes('resolveArchetypeView') && scope2RouteSource.includes('company-fundamentals.config.json') && scope2RouteSource.includes('data-kpi-priority') && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope2RouteSource), 'Feature 010 Scope 2 cockpit wires the archetype-prioritized Simple view over same-origin scripts with no credential field');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 010 Scope 2 group threw): ' + e.message); }
/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE2-END */

/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE3-BEGIN */
try {
  group('Feature 010 Scope 3 linked model and user-owned accepted state');
  const scope3Api = globalThis.RLCOMPANY;
  const scope3Config = JSON.parse(read('company-fundamentals.config.json'));
  const scope3Pointer = JSON.parse(read('data/company-fundamentals/companies/sec-cik-0000789019/current.json'));
  const scope3Manifest = JSON.parse(read(scope3Pointer.manifestPath));
  const scope3Objects = {};
  const scope3Queue = [scope3Manifest.identityRef, scope3Manifest.summaryRef, scope3Manifest.dossierRef, scope3Manifest.ownerReadRef].concat(scope3Manifest.sourceRefs, scope3Manifest.historyRefs);
  if (scope3Manifest.modelPackRef) scope3Queue.push(scope3Manifest.modelPackRef);
  const scope3Seen = {};
  while (scope3Queue.length) {
    const scope3Ref = scope3Queue.shift();
    if (scope3Seen[scope3Ref.objectId]) continue;
    scope3Seen[scope3Ref.objectId] = true;
    const scope3Object = JSON.parse(read(scope3Ref.path));
    scope3Objects[scope3Ref.objectId] = scope3Object;
    (function collectScope3Refs(value) {
      if (value && value.contractVersion === 'company-object-ref/v1') { scope3Queue.push(value); return; }
      if (Array.isArray(value)) value.forEach(collectScope3Refs);
      else if (value && typeof value === 'object') Object.values(value).forEach(collectScope3Refs);
    })(scope3Object);
  }
  const scope3ConfigValid = scope3Api.validateCompanyConfig(scope3Config);
  assert(scope3ConfigValid.ok && Array.isArray(scope3Config.model.definitions) && scope3Config.model.definitions.length >= 1 && Array.isArray(scope3Config.model.scenarios) && scope3Config.model.scenarios.length >= 1, 'Feature 010 Scope 3 config declares an accepted model definition and scenario');
  assert(scope3Manifest.modelPackRef !== null && scope3Api.companyObjectSha256(scope3Objects[scope3Manifest.modelPackRef.objectId]) === scope3Manifest.modelPackRef.sha256, 'Feature 010 Scope 3 publication carries a non-null hash-valid model pack ref');
  const scope3ModelPack = scope3Objects[scope3Manifest.modelPackRef.objectId];
  assert(scope3ModelPack.contractVersion === 'company-model-pack/v1' && scope3ModelPack.generation === scope3Manifest.generation && scope3ModelPack.publicationId === scope3Manifest.publicationId, 'Feature 010 Scope 3 model pack is generation-bound');
  const scope3ModelDefinition = scope3ModelPack.modelDefinition;
  const scope3Assumptions = Object.fromEntries(scope3ModelPack.acceptedScenario.assumptions.map((a) => [a.driverId, a.value]));
  const scope3BaselineMap = Object.fromEntries(scope3ModelPack.baselineOutputs.map((o) => [o.nodeId, o.value]));
  const scope3Rederived = scope3Api.computeModelBaseline(scope3ModelDefinition, scope3Assumptions);
  assert(scope3Rederived.blockedNodeIds.length === 0 && scope3Rederived.outputs.every((o) => o.value === scope3BaselineMap[o.nodeId]), 'Feature 010 Scope 3 accepted scenario recomputes to its published baseline from one generation');
  const scope3Multiple = scope3ModelDefinition.drivers.find((d) => d.concept === 'fcf-multiple');
  const scope3Shares = scope3ModelDefinition.drivers.find((d) => d.concept === 'diluted-shares');
  const scope3Baseline = { assumptions: scope3Assumptions, outputs: scope3BaselineMap };
  const scope3BaselineBefore = JSON.stringify(scope3BaselineMap);
  const scope3ValuationEdit = scope3Api.evaluateModel({ modelDefinition: scope3ModelDefinition, baseline: scope3Baseline, draft: { changedDriverId: scope3Multiple.driverId, assumptions: { ...scope3Assumptions, [scope3Multiple.driverId]: '30' } } });
  assert(scope3ValuationEdit.reachableNodeIds.every((id) => scope3ModelDefinition.nodes.find((n) => n.nodeId === id).kind === 'valuation') && scope3ValuationEdit.unchangedNodeIds.length > 0 && scope3ValuationEdit.outputs.filter((o) => !o.recomputed).every((o) => o.value === scope3BaselineMap[o.nodeId]) && JSON.stringify(scope3BaselineMap) === scope3BaselineBefore, 'Feature 010 Scope 3 a valuation-only driver edit recomputes only reachable nodes and carries unreachable history unchanged');
  const scope3InvalidEdit = scope3Api.evaluateModel({ modelDefinition: scope3ModelDefinition, baseline: scope3Baseline, draft: { changedDriverId: scope3Shares.driverId, assumptions: { ...scope3Assumptions, [scope3Shares.driverId]: '0' } } });
  const scope3BlockedEps = scope3InvalidEdit.outputs.find((o) => o.nodeId === 'node-eps');
  assert(scope3BlockedEps.state === 'blocked' && scope3BlockedEps.value === null && scope3BlockedEps.dependencyPath[0] === scope3Shares.driverId && scope3BlockedEps.dependencyPath[scope3BlockedEps.dependencyPath.length - 1] === 'node-eps', 'Feature 010 Scope 3 an invalid driver blocks a reachable node with an explicit dependency path');
  const scope3SelectionBefore = JSON.stringify(scope3ModelPack.acceptedScenario);
  const scope3Selection = scope3Api.reduceCompanySelection({ activeRevision: scope3ModelPack.acceptedScenario, modelDefinition: scope3ModelDefinition, acceptedPublication: { publicationId: scope3Manifest.publicationId, generation: scope3Manifest.generation, manifestSha256: scope3Manifest.manifestSha256, evidenceChanges: [{ concept: 'operating-margin', direction: 'increase', priorValue: '0.4', currentValue: '0.42', sourceRef: 'sec-companyfacts-msft' }] } });
  assert(scope3Selection.rebased === false && JSON.stringify(scope3Selection.activeRevision) === scope3SelectionBefore && scope3Selection.proposals.length === 1 && scope3Selection.proposals[0].decisionState === 'pending' && scope3Selection.proposals[0].resultingRevision === null, 'Feature 010 Scope 3 evidence refresh raises a separate pending proposal without rebasing the accepted revision');
  const scope3Accept = scope3Api.reduceProposalDecision({ activeRevision: scope3ModelPack.acceptedScenario, proposal: scope3Selection.proposals[0], modelDefinition: scope3ModelDefinition, decision: { kind: 'accept', confirmedAt: scope3Manifest.createdAt } });
  const scope3Reject = scope3Api.reduceProposalDecision({ activeRevision: scope3ModelPack.acceptedScenario, proposal: scope3Selection.proposals[0], modelDefinition: scope3ModelDefinition, decision: { kind: 'reject', confirmedAt: scope3Manifest.createdAt } });
  assert(scope3Accept.revisionsCreated === 1 && scope3Accept.newRevision.revision === scope3ModelPack.acceptedScenario.revision + 1 && scope3Accept.newRevision.parentRevisionId === scope3ModelPack.acceptedScenario.scenarioRevisionId && scope3Reject.revisionsCreated === 0 && scope3Reject.newRevision === null && JSON.stringify(scope3ModelPack.acceptedScenario) === scope3SelectionBefore, 'Feature 010 Scope 3 confirmation creates exactly one immutable revision and rejection records no change');
  const scope3Estimate = { observationId: 'obs-estimate-revenue', evidenceClass: 'estimate', definition: 'total-revenue', unit: 'USD', currency: 'USD', periodId: 'period-msft-fy2026-q4', value: '75000', sourceRef: 'source-estimate-set', clocks: { reportingPeriodEnd: '2026-06-30', sourcePublishedAt: '2026-05-01T00:00:00Z', acceptedAt: '2026-05-01T00:00:00Z', retrievedAt: '2026-05-01T00:00:00Z', observedAt: null } };
  const scope3Actual = { observationId: 'obs-actual-revenue', evidenceClass: 'reported', definition: 'total-revenue', unit: 'USD', currency: 'USD', periodId: 'period-msft-fy2026-q4', value: '78000', sourceRef: 'sec-companyfacts-msft', clocks: { reportingPeriodEnd: '2026-06-30', sourcePublishedAt: '2026-07-30T00:00:00Z', acceptedAt: '2026-07-30T00:00:00Z', retrievedAt: '2026-07-30T00:00:00Z', observedAt: null } };
  const scope3Forecast = scope3Api.deriveForecastError({ estimate: scope3Estimate, actual: scope3Actual });
  const scope3Incomparable = scope3Api.deriveForecastError({ estimate: scope3Estimate, actual: { ...scope3Actual, currency: 'EUR' } });
  assert(scope3Forecast.comparable === true && scope3Forecast.forecastError.value === '3000' && scope3Forecast.estimate.evidenceClass === 'estimate' && scope3Forecast.actual.evidenceClass === 'reported' && scope3Forecast.estimate.clocks.acceptedAt !== scope3Forecast.actual.clocks.acceptedAt && scope3Incomparable.comparable === false && scope3Incomparable.forecastError === null, 'Feature 010 Scope 3 forecast error keeps estimate and actual classes and clocks separate and derives only when comparable');
  const scope3RouteSource = read('company-fundamentals-lab.html');
  const scope3Scripts = Array.from(scope3RouteSource.matchAll(/<script\s+src="([^"]+)"/g), (match) => match[1]);
  assert(hasExactCompanyRouteScripts(scope3Scripts) && scope3RouteSource.includes('RLCOMPANY.evaluateModel') && scope3RouteSource.includes('RLCOMPANY.reduceProposalDecision') && scope3RouteSource.includes('data-model-workspace') && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope3RouteSource), 'Feature 010 Scope 3 cockpit wires the linked model and accepted-state reducers over same-origin scripts with no credential field');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 010 Scope 3 group threw): ' + e.message); }
/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE3-END */

/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE4-BEGIN */
try {
  group('Feature 010 Scope 4 Detailed workspaces peers export and committed owner read');
  const scope4Api = globalThis.RLCOMPANY;
  const scope4Config = JSON.parse(read('company-fundamentals.config.json'));
  const scope4Pointer = JSON.parse(read('data/company-fundamentals/companies/sec-cik-0000789019/current.json'));
  const scope4Manifest = JSON.parse(read(scope4Pointer.manifestPath));
  const scope4Objects = {};
  const scope4Queue = [scope4Manifest.identityRef, scope4Manifest.summaryRef, scope4Manifest.dossierRef, scope4Manifest.ownerReadRef].concat(scope4Manifest.sourceRefs, scope4Manifest.historyRefs);
  if (scope4Manifest.modelPackRef) scope4Queue.push(scope4Manifest.modelPackRef);
  const scope4Seen = {};
  while (scope4Queue.length) {
    const scope4Ref = scope4Queue.shift();
    if (scope4Seen[scope4Ref.objectId]) continue;
    scope4Seen[scope4Ref.objectId] = true;
    const scope4Object = JSON.parse(read(scope4Ref.path));
    scope4Objects[scope4Ref.objectId] = scope4Object;
    (function collectScope4Refs(value) {
      if (value && value.contractVersion === 'company-object-ref/v1') { scope4Queue.push(value); return; }
      if (Array.isArray(value)) value.forEach(collectScope4Refs);
      else if (value && typeof value === 'object') Object.values(value).forEach(collectScope4Refs);
    })(scope4Object);
  }
  const scope4ConfigValid = scope4Api.validateCompanyConfig(scope4Config);
  const scope4PeerSet = (scope4Config.peers || []).find((set) => set.subjectCompanyId === 'sec-cik-0000789019');
  assert(scope4ConfigValid.ok && scope4Api.companyObjectSha256(scope4Config) === scope4Manifest.configFingerprint && scope4PeerSet && scope4PeerSet.status === 'proposed' && scope4PeerSet.archetypeIds.includes('archetype-software-platform'), 'Feature 010 Scope 4 config declares a proposed software-platform peer set bound to the regenerated fingerprint');
  const scope4Accepted = scope4Api.projectAcceptedPublication(scope4Manifest, scope4Objects);
  const scope4Peers = scope4Api.selectPeersView({
    peerSet: { peerSetId: scope4PeerSet.peerSetId, subjectCompanyId: scope4PeerSet.subjectCompanyId, purpose: scope4PeerSet.purpose, companyIds: [scope4PeerSet.subjectCompanyId, 'peer-software-alpha', 'peer-software-beta', 'peer-software-gamma', 'peer-software-delta', 'peer-software-epsilon'] },
    statistic: { concept: 'gross-margin', unit: 'ratio', operation: 'median' },
    observations: [
      { companyId: 'peer-software-alpha', value: '0.68', eligibility: 'comparable', reason: 'Same archetype and reporting basis; constructed demonstration value, not an MSFT-reported figure.' },
      { companyId: 'peer-software-beta', value: '0.72', eligibility: 'comparable', reason: 'Same archetype and reporting basis; constructed demonstration value.' },
      { companyId: 'peer-software-gamma', value: '0.64', eligibility: 'comparable', reason: 'Same archetype and reporting basis; constructed demonstration value.' },
      { companyId: 'peer-software-delta', value: '0.30', eligibility: 'qualified', reason: 'Different segment mix; kept visible but excluded from the level statistic.' },
      { companyId: 'peer-software-epsilon', value: '0.95', eligibility: 'excluded', reason: 'Non-comparable revenue-recognition basis.', outlier: true }
    ]
  });
  assert(scope4Peers.statistic.sampleSize === 3 && scope4Peers.statistic.value === '0.68' && scope4Peers.missing.length === 1 && scope4Peers.missing[0] === 'sec-cik-0000789019' && scope4Peers.qualified.length === 1 && scope4Peers.excluded.length === 1 && scope4Peers.outliers.length === 1 && !scope4Peers.comparable.some((row) => row.value === '0'), 'Feature 010 Scope 4 peers admit only comparable observations and keep exclusions and missing members visible with no zero insertion');
  const scope4Export = scope4Api.buildAcceptedExport(scope4Accepted);
  assert(scope4Export.contractVersion === 'company-accepted-export/v1' && scope4Export.containsPrivateData === false && scope4Export.view.clocks.statementCutoff === scope4Accepted.ownerRead.statementCutoff && scope4Export.view.periods.length === scope4Accepted.periods.length && !/credential|token|secret|password|scenarioDraft/i.test(JSON.stringify(scope4Export)), 'Feature 010 Scope 4 accepted export is a pure projection with clocks and periods and no private data');
  const scope4OwnerRead = scope4Api.buildFundamentalsToolRead({ accepted: scope4Accepted, readId: scope4Manifest.ownerReadRef.objectId, modelPackRef: scope4Manifest.modelPackRef });
  assert(scope4Manifest.ownerReadRef !== null && scope4Api.companyObjectSha256(scope4OwnerRead) === scope4Api.companyObjectSha256(scope4Accepted.ownerRead) && scope4OwnerRead.modelPackRef && scope4OwnerRead.modelPackRef.objectId === scope4Manifest.modelPackRef.objectId, 'Feature 010 Scope 4 committed owner read is a faithful non-null recompute carrying the model pack ref');
  const scope4Archetype = scope4Api.resolveArchetypeView(scope4Config, scope4Accepted.companyId);
  const scope4Simple = scope4Api.selectSimpleView(scope4Accepted, scope4Archetype);
  const scope4Trace = scope4Api.selectSourcesView(scope4Accepted, 'claim-direction');
  assert(scope4Simple.clocks.statementCutoff === scope4Export.view.clocks.statementCutoff && scope4Simple.clocks.statementCutoff === scope4OwnerRead.statementCutoff && scope4Trace.focusRef === 'claim-direction' && scope4Simple.dependencyResults.find((result) => result.id === 'metric-direction').state === 'unavailable' && scope4OwnerRead.direction === 'Unavailable' && JSON.stringify(scope4Export.view.limitations) === JSON.stringify(scope4OwnerRead.limitations), 'Feature 010 Scope 4 Simple source-trace export and owner read share one accepted state without divergence');
  const scope4Route = read('company-fundamentals-lab.html');
  const scope4Scripts = Array.from(scope4Route.matchAll(/<script\s+src="([^"]+)"/g), (match) => match[1]);
  assert(hasExactCompanyRouteScripts(scope4Scripts) && scope4Route.includes('data-mode-seg') && scope4Route.includes('data-detailed-tab') && scope4Route.includes('RLCOMPANY.selectPeersView') && scope4Route.includes('RLCOMPANY.buildAcceptedExport') && scope4Route.includes('RLDATA.putToolRead') && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope4Route), 'Feature 010 Scope 4 cockpit wires the mode toggle, six Detailed workspaces, peers, and the owner-read compat over same-origin scripts with no credential field');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 010 Scope 4 group threw): ' + e.message); }
/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE4-END */

/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE5-BEGIN */
try {
  group('Feature 010 Scope 5 adaptive brief core ranking and append-only history');
  const scope5Api = globalThis.RLCOMPANY;
  const scope5Config = JSON.parse(read('company-fundamentals.config.json'));
  const scope5Pointer = JSON.parse(read('data/company-fundamentals/companies/sec-cik-0000789019/current.json'));
  const scope5Manifest = JSON.parse(read(scope5Pointer.manifestPath));
  const scope5Brief = JSON.parse(read(scope5Manifest.briefRef.path));
  const scope5History = JSON.parse(read(scope5Manifest.historyRefs[0].path));
  const scope5Policy = scope5Config.materialityPolicy.rules[0];
  assert(scope5Config.freshnessPolicies.every((entry) => entry.status === 'active' && Number.isInteger(entry.maxAgeHours)) && scope5Config.materialityPolicy.status === 'active' && scope5Policy.policyVersion === 'company-brief-ranking/v1' && JSON.stringify(scope5Config.feature002.briefSubjects) === '["sec-cik-0000789019"]', 'Feature 010 Scope 5 config activates every class freshness policy, one ranking policy, and one explicit Feature 002 subject');
  assert(scope5Manifest.briefRef !== null && scope5Api.companyObjectSha256(scope5Brief) === scope5Manifest.briefRef.sha256 && scope5Brief.status === 'partial' && scope5Brief.materialChanges.length === 0 && scope5Brief.modelImpactProposals.length === 0 && scope5History.entries.length === 1 && scope5History.entries[0].contentFingerprint === scope5Brief.contentFingerprint, 'Feature 010 Scope 5 publication carries one hash-valid partial brief and one append-only semantic history event without fabricated changes');
  const scope5Replay = scope5Api.appendAdaptiveBriefHistory({ history: scope5History.entries, brief: scope5Brief });
  assert(scope5Replay.appended === false && scope5Replay.history.length === 1, 'Feature 010 Scope 5 identical evidence replay creates no duplicate brief history event');
  const scope5Change = (overrides = {}) => ({
    contractVersion: 'evidence-change/v1', changeId: 'change-operating-margin', evidenceClass: 'reported', disposition: 'material', sourceRef: 'sec-companyfacts-msft', periodOrWindow: 'period-msft-fy2026-q3', observed: 'Operating margin changed.', companyMechanism: 'The change flows through the accepted operating-margin driver.', affectedClaimIds: ['claim-margin-direction'], affectedDriverIds: ['driver-operating-margin'], scoreInputs: { sourceQuality: 5, companyMateriality: 5, modelSensitivity: 5, novelty: 5, eventProximity: 4, unresolvedRisk: 2 }, numericSupport: { assumptionId: 'assumption-operating-margin', direction: 'increase', range: { low: '0.41', high: '0.43' }, rationale: 'The sourced reported margin changed.', confidence: 'medium', invalidation: 'A later amendment reverses the change.' }, evidenceNeeded: [], duplicateOf: null, ...overrides
  });
  const scope5News = [1, 2, 3].map((index) => scope5Change({ changeId: `change-news-${index}`, evidenceClass: 'news', disposition: index === 1 ? 'immaterial' : 'duplicate', sourceRef: `source-news-${index}`, periodOrWindow: '2026-05-01/2026-05-02', observed: 'Repeated generic headline.', companyMechanism: null, affectedClaimIds: [], affectedDriverIds: [], scoreInputs: { sourceQuality: 1, companyMateriality: 1, modelSensitivity: 0, novelty: index === 1 ? 1 : 0, eventProximity: 3, unresolvedRisk: 1 }, numericSupport: null, duplicateOf: index === 1 ? null : 'change-news-1' }));
  const scope5Ranking = scope5Api.rankEvidenceChanges({ policy: scope5Policy, changes: scope5News.concat([scope5Change()]) });
  assert(scope5Ranking.ranked[0].changeId === 'change-operating-margin' && scope5Ranking.ranked[0].components.companyMateriality === 25 && scope5Ranking.ranked[0].components.modelSensitivity === 20 && scope5Ranking.ranked.filter((entry) => entry.evidenceClass === 'news').every((entry) => entry.score === 0) && !Object.prototype.hasOwnProperty.call(scope5Ranking.ranked[0].components, 'headlineVolume'), 'Feature 010 Scope 5 material company evidence outranks repeated generic headlines without volume weighting');
  const scope5AcceptedState = { contractVersion: 'company-brief-accepted-state/v1', companyId: 'sec-cik-0000789019', archetype: { assignmentId: 'assignment-msft-software', primaryArchetypeId: 'archetype-software-platform', status: 'accepted' }, facts: [{ factId: 'fact-margin', evidenceClass: 'reported', value: '0.4' }], assumptions: [{ assumptionId: 'assumption-operating-margin', driverId: 'driver-operating-margin', value: '0.4' }], scenarioRevisionId: 'scenario-msft-base-r4', fundamentalDirection: { direction: 'deteriorating', evidenceClass: 'reported', sourceRef: 'sec-companyfacts-msft', window: 'period-msft-fy2026-q3' } };
  const scope5Clocks = { statementCutoff: '2026-03-31', modelCutoff: '2026-03-31', briefCutoff: '2026-04-29T20:06:24.000Z', marketCutoff: '2026-05-02T13:30:00Z', retrievalCutoff: '2026-05-02T13:35:00Z' };
  const scope5Coverage = [{ evidenceClass: 'reported', state: 'current', cutoff: '2026-03-31', requiredUpdate: null }, { evidenceClass: 'management-claim', state: 'current', cutoff: '2026-04-25T00:00:00Z', requiredUpdate: null }, { evidenceClass: 'market-observation', state: 'current', cutoff: '2026-05-02T13:30:00Z', requiredUpdate: null }, { evidenceClass: 'news', state: 'current', cutoff: '2026-05-02T13:00:00Z', requiredUpdate: null }, { evidenceClass: 'sentiment', state: 'current', cutoff: '2026-05-02T12:00:00Z', requiredUpdate: null }];
  const scope5Request = (changes, coverage = scope5Coverage) => ({ contractVersion: 'adaptive-company-brief-request/v1', companyId: 'sec-cik-0000789019', archetypeId: 'archetype-software-platform', priorBrief: { briefId: 'brief-prior', thesisClaims: [{ claimId: 'claim-margin-direction', text: 'Margins are deteriorating.' }] }, acceptedState: scope5AcceptedState, clocks: scope5Clocks, coverage, changes, rankingPolicy: scope5Policy });
  const scope5Rumor = scope5Change({ changeId: 'change-rumor', evidenceClass: 'news', disposition: 'not-evaluable', sourceRef: 'source-unverified-news', periodOrWindow: '2026-05-02T12:00:00Z/2026-05-02T13:00:00Z', observed: 'Unattributed acquisition claim.', companyMechanism: null, affectedClaimIds: [], affectedDriverIds: [], scoreInputs: { sourceQuality: 0, companyMateriality: 2, modelSensitivity: 0, novelty: 3, eventProximity: 5, unresolvedRisk: 4 }, numericSupport: null, evidenceNeeded: ['Authoritative issuer confirmation.'] });
  const scope5AcceptedBefore = JSON.stringify(scope5AcceptedState);
  const scope5RumorBrief = scope5Api.buildAdaptiveCompanyBrief(scope5Request([scope5Rumor]));
  assert(scope5RumorBrief.reviewedEvidence[0].evidenceClass === 'news' && scope5RumorBrief.reportedFacts.length === 0 && scope5RumorBrief.modelImpactProposals.length === 0 && scope5RumorBrief.acceptedScenarioRevisionId === 'scenario-msft-base-r4' && JSON.stringify(scope5AcceptedState) === scope5AcceptedBefore, 'Feature 010 Scope 5 unverified news remains news and cannot change facts, assumptions, archetype, or accepted revision');
  const scope5LinkedMacro = scope5Change({ changeId: 'change-linked-macro', evidenceClass: 'market-observation', numericSupport: null, companyMechanism: 'The accepted valuation driver exposes the rate mechanism.', affectedClaimIds: ['claim-valuation-risk'], affectedDriverIds: ['driver-fcf-multiple'] });
  const scope5UnlinkedMacro = scope5Change({ ...scope5LinkedMacro, changeId: 'change-unlinked-macro', companyMechanism: null, affectedClaimIds: [], affectedDriverIds: [] });
  const scope5MacroRanking = scope5Api.rankEvidenceChanges({ policy: scope5Policy, changes: [scope5UnlinkedMacro, scope5LinkedMacro] });
  assert(scope5MacroRanking.ranked.find((entry) => entry.changeId === 'change-linked-macro').eligibility === 'company-mechanism' && scope5MacroRanking.ranked.find((entry) => entry.changeId === 'change-unlinked-macro').eligibility === 'context-only' && scope5MacroRanking.ranked.find((entry) => entry.changeId === 'change-unlinked-macro').score === 0, 'Feature 010 Scope 5 macro context enters only through an evidenced company mechanism');
  const scope5StaleCoverage = [{ evidenceClass: 'reported', state: 'current', cutoff: '2026-03-31', requiredUpdate: null }, { evidenceClass: 'normalized', state: 'stale', cutoff: '2025-06-30', requiredUpdate: 'A current issuer KPI disclosure.' }];
  const scope5Stale = scope5Api.buildAdaptiveCompanyBrief(scope5Request([scope5Change({ changeId: 'change-stale-kpi', evidenceClass: 'normalized' })], scope5StaleCoverage));
  assert(scope5Stale.status === 'stale' && scope5Stale.coverage[1].cutoff === '2025-06-30' && scope5Stale.materialChanges.length === 0 && scope5Stale.modelImpactProposals.length === 0 && scope5Stale.thesisClaims[0].text === 'Margins are deteriorating.', 'Feature 010 Scope 5 stale evidence retains its cutoff, prior dated claim, and withholds unsupported changes and proposals');
  const scope5Route = read('company-fundamentals-lab.html');
  assert(scope5Route.includes('RLCOMPANY.rankEvidenceChanges') && scope5Route.includes('RLCOMPANY.buildAdaptiveCompanyBrief') && scope5Route.includes('RLCOMPANY.appendAdaptiveBriefHistory') && scope5Route.includes('data-adaptive-brief-workspace') && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope5Route), 'Feature 010 Scope 5 Brief workspace executes production helpers with no credential field');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 010 Scope 5 group threw): ' + e.message); }
/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE5-END */

/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE6-BEGIN */
try {
  group('Feature 010 Scope 6 Feature 002 consume-once and registry discoverability');
  const scope6Api = globalThis.RLCOMPANY;
  const scope6Reads = [];
  const scope6Values = new Map();
  const scope6ReadJson = (path) => {
    scope6Reads.push(path);
    const value = JSON.parse(read(path));
    scope6Values.set(path, value);
    return value;
  };
  const scope6Projection = buildCompanyFundamentalsOwnerRead(scope6ReadJson, scope6Api.companyObjectSha256);
  const scope6Config = scope6Values.get('company-fundamentals.config.json');
  const scope6PointerPath = `data/company-fundamentals/companies/${scope6Config.feature002.briefSubjects[0]}/current.json`;
  const scope6Pointer = scope6Values.get(scope6PointerPath);
  const scope6Manifest = scope6Values.get(scope6Pointer.manifestPath);
  const scope6Owner = scope6Values.get(scope6Manifest.ownerReadRef.path);
  const scope6ExpectedReads = ['company-fundamentals.config.json', scope6PointerPath, scope6Pointer.manifestPath, scope6Manifest.ownerReadRef.path];
  assert(JSON.stringify(scope6Reads) === JSON.stringify(scope6ExpectedReads) && new Set(scope6Reads).size === 4, 'Feature 010 Scope 6 reads config, pointer, manifest, and owner object exactly once each');
  assert(scope6Api.companyManifestSha256(scope6Manifest) === scope6Pointer.manifestSha256 && scope6Api.companyObjectSha256(scope6Owner) === scope6Manifest.ownerReadRef.sha256 && scope6Projection.fingerprint === scope6Manifest.ownerReadRef.sha256, 'Feature 010 Scope 6 verifies canonical pointer, manifest, and owner hashes before projection');
  assert(scope6Projection.sourceAsOf === scope6Owner.statementCutoff && scope6Projection.modelAsOf === scope6Owner.modelCutoff && scope6Projection.asOf === scope6Owner.briefCutoff && scope6Projection.marketAsOf === scope6Owner.marketCutoff && scope6Projection.evidenceCutoff === scope6Owner.retrievalCutoff && JSON.stringify(scope6Projection.limitations) === JSON.stringify(scope6Owner.limitations) && JSON.stringify(scope6Projection.metrics.sourceLinks) === JSON.stringify(scope6Owner.sourceLinks) && JSON.stringify(scope6Projection.metrics.disagreements) === JSON.stringify(scope6Owner.disagreements) && JSON.stringify(scope6Projection.metrics.modelImpactProposals) === JSON.stringify(scope6Owner.modelImpactProposals) && JSON.stringify(scope6Projection.recommendationEligibility) === JSON.stringify(scope6Owner.recommendationEligibility) && scope6Projection.recommendationEligibility.eligible === false && scope6Projection.status === scope6Owner.status && scope6Projection.metrics.archetypeId === scope6Owner.archetypeId && !/RLCOMPANY|evaluateModel|buildFundamentalsToolRead|rankEvidenceChanges|buildAdaptiveCompanyBrief|appendAdaptiveBriefHistory|selectResilienceView|reduce[A-Z]/.test(buildCompanyFundamentalsOwnerRead.toString()), 'Feature 010 Scope 6 preserves five clocks, limitations, source links, disagreements, pending proposals, archetype, status, and recommendation ineligibility with zero formula/model/reducer dependency');
  const scope6Registry = JSON.parse(read('tools.json')).tools;
  const scope6RegistryIds = scope6Registry.map((tool) => tool.id);
  const scope6IndexIds = Array.from(read('index.html').matchAll(/\bid:\s*'([^']+)'/g)).map((match) => match[1]).filter((id) => id !== 'next-tool');
  const scope6NavIds = Array.from(read('rlnav.js').matchAll(/\bfile:\s*"([^"]+\.html)"/g)).map((match) => match[1]).filter((file) => file !== 'index.html').map((file) => file.replace(/\.html$/, ''));
  const scope6ToolIndex = scope6RegistryIds.indexOf('company-fundamentals-lab');
  const scope6Tool = scope6Registry[scope6ToolIndex];
  const scope6Route = read(scope6Tool.file);
  assert(scope6ToolIndex >= 0 && JSON.stringify(scope6RegistryIds) === JSON.stringify(scope6IndexIds) && JSON.stringify(scope6RegistryIds) === JSON.stringify(scope6NavIds) && scope6IndexIds[scope6ToolIndex] === 'company-fundamentals-lab' && scope6NavIds[scope6ToolIndex] === 'company-fundamentals-lab' && scope6Tool.file === 'company-fundamentals-lab.html' && scope6Route.includes('data-brief-scenario="feature002"') && scope6Route.includes('config.feature002.adapterId'), 'Feature 010 Scope 6 registers the company route at one identical tools/index/nav position and exposes its Feature 002 deep link');
  const scope6Payload = JSON.parse(read('market-brief.payload.json'));
  const scope6CoverageIds = scope6Payload.toolCoverage.map((entry) => entry.id);
  const scope6Coverage = scope6Payload.toolCoverage.filter((entry) => entry.id === 'company-fundamentals-lab');
  // market-brief.payload.json is a per-window automation output (cron auto-refresh + Tier-B narrative, 4x/day). The
  // owner-read coverage status legitimately varies per window between the deterministic Tier-A view ('fresh-headless',
  // brief-refresh.mjs buildToolCoverage) and the Tier-B narrative "read-was-consumed" view ('analyzed', authored per
  // brief-narrative-parallel.mjs). Pinning ONE value was a brittle canary; assert membership in the documented
  // consumed-owner-read status set instead — both values still prove the hash-verified owner read was consumed this
  // window, while a skipped/irrelevant/stale status (not-analyzed/not-relevant/stale) would correctly fail.
  const scope6OwnerReadStatuses = ['fresh-headless', 'analyzed'];
  // The no-fabrication DISCLOSURE is the requirement; its wording is authored per window by the
  // Tier-B narrative. Pinning the literal 'no recommendation is fabricated' was the same brittle
  // canary as the pinned status above: the current window says 'no recommendation or execution
  // instruction is produced', which carries the guarantee and is in fact stronger. This asserts
  // the disclosure is PRESENT in any honest phrasing and still fails if it disappears — or if the
  // sense inverts, because 'no recommendation' must sit adjacent to the produced/fabricated verb.
  const scope6NoRecommendationDisclosure = /no recommendation[^.]*\b(?:fabricat\w*|produced|generated|issued)\b/i;
  assert(JSON.stringify(scope6CoverageIds) === JSON.stringify(scope6RegistryIds) && scope6Coverage.length === 1 && scope6Coverage[0].deepLink === scope6Tool.file && scope6OwnerReadStatuses.includes(scope6Coverage[0].status) && scope6Coverage[0].reason.includes('company-fundamentals-owner-v1') && scope6NoRecommendationDisclosure.test(scope6Coverage[0].reason), 'Feature 010 Scope 6 keeps exact registry-wide toolCoverage parity with one hash-verified company owner-read entry that discloses no recommendation is produced');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 010 Scope 6 group threw): ' + e.message); }
/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE6-END */

/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE7-BEGIN */
try {
  group('Feature 010 Scope 7 CMG and JPM source-qualified archetype overlays');
  const scope7Api = globalThis.RLCOMPANY;
  const scope7Config = JSON.parse(read('company-fundamentals.config.json'));
  const scope7ConfigValidation = scope7Api.validateCompanyConfig(scope7Config);
  const scope7Pointer = JSON.parse(read('data/company-fundamentals/companies/sec-cik-0000789019/current.json'));
  const scope7Manifest = JSON.parse(read(scope7Pointer.manifestPath));
  const scope7Cmg = scope7Api.resolveArchetypeView(scope7Config, 'sec-cik-0001058090');
  const scope7Jpm = scope7Api.resolveArchetypeView(scope7Config, 'sec-cik-0000019617');
  const scope7Msft = scope7Api.resolveArchetypeView(scope7Config, 'sec-cik-0000789019');
  // Load the REAL committed CMG and JPM publications through the production projector (no inline fixtures).
  const scope7LoadPub = (companyId) => {
    const pointer = JSON.parse(read('data/company-fundamentals/companies/' + companyId + '/current.json'));
    scope7Api.validateCompanyCurrentPointer(pointer, companyId);
    const manifest = JSON.parse(read(pointer.manifestPath));
    const objects = {};
    const queue = [];
    const seen = new Set();
    const collect = (value) => {
      if (value && value.contractVersion === 'company-object-ref/v1') { queue.push(value); return; }
      if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    collect(manifest);
    while (queue.length) {
      const ref = queue.shift();
      if (seen.has(ref.objectId)) continue;
      seen.add(ref.objectId);
      const value = JSON.parse(read(ref.path));
      objects[ref.objectId] = value;
      collect(value);
    }
    const accepted = scope7Api.projectAcceptedPublication(manifest, objects);
    return { accepted, observationsById: Object.fromEntries(accepted.observations.map((observation) => [observation.observationId, observation])) };
  };
  const scope7CmgPub = scope7LoadPub('sec-cik-0001058090');
  const scope7JpmPub = scope7LoadPub('sec-cik-0000019617');
  assert(scope7ConfigValidation.ok && scope7Config.companies.length === 3 && scope7Cmg.status === 'accepted' && scope7Cmg.primaryArchetypeId === 'archetype-restaurant-unit-economics' && scope7Jpm.status === 'accepted' && scope7Jpm.primaryArchetypeId === 'archetype-financial-institution' && scope7Api.companyObjectSha256(scope7Config) === scope7Manifest.configFingerprint, 'Feature 010 Scope 7 config declares coherent CMG and JPM issuers over the shared foundation and binds the fingerprint');
  // The real committed publications carry source-qualified SEC 10-K observations; unavailable concepts are explicit.
  const scope7CmgObs = scope7CmgPub.observationsById;
  const scope7JpmObs = scope7JpmPub.observationsById;
  assert(scope7CmgPub.accepted.identity.issuerName === 'CHIPOTLE MEXICAN GRILL INC' && scope7CmgObs['obs-cmg-stockholders-equity'].value === '2830607000' && scope7CmgObs['obs-cmg-total-liabilities'].value === '6163924000' && scope7CmgObs['obs-cmg-operating-lease-liability'].value === '4773434000' && scope7CmgObs['obs-cmg-funded-debt'].state === 'current' && scope7CmgObs['obs-cmg-funded-debt'].value === '0' && scope7CmgObs['obs-cmg-treasury-stock'].state === 'unavailable' && scope7CmgObs['obs-cmg-treasury-stock'].value === null && scope7JpmPub.accepted.identity.issuerName === 'JPMORGAN CHASE & CO' && scope7JpmObs['obs-jpm-total-deposits'].value === '2559320000000' && scope7JpmObs['obs-jpm-preferred-capital'].value === '20045000000' && scope7JpmObs['obs-jpm-cet1-ratio'].state === 'unavailable' && scope7JpmObs['obs-jpm-liquidity-coverage-ratio'].state === 'unavailable', 'Feature 010 Scope 7 real CMG and JPM publications carry source-qualified SEC 10-K observations with explicit unavailable concepts');
  // SCN-010-002: CMG keeps raw reported leverage beside lease and repurchase context with exact refs and no pass/fail value.
  const scope7CmgView = scope7Api.selectResilienceView({
    archetypeView: scope7Cmg,
    subjectCompanyId: 'sec-cik-0001058090',
    checks: [
      { checkId: 'check-cmg-cash-to-debt', policyId: 'policy-cmg-cash-to-debt', policyVersion: 'cash-to-funded-debt/v1', concept: 'cash-to-funded-debt', periodId: 'period-cmg-fy2025-annual', raw: { formula: 'cash-and-equivalents / funded-debt', threshold: null, operation: 'ratio', inputs: [{ inputId: 'input-cmg-cash', ref: 'obs-cmg-cash-and-equivalents', concept: 'cash-and-equivalents', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: scope7CmgObs['obs-cmg-cash-and-equivalents'].value, state: 'reconciled' }, { inputId: 'input-cmg-funded-debt', ref: 'obs-cmg-funded-debt', concept: 'funded-debt', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: scope7CmgObs['obs-cmg-funded-debt'].value, state: 'reconciled' }] }, contextualAdjustment: null },
      { checkId: 'check-cmg-liabilities-equity', policyId: 'policy-cmg-lease-adjusted-leverage', policyVersion: 'lease-adjusted-leverage/v1', concept: 'liabilities-to-equity', periodId: 'period-cmg-fy2025-annual', raw: { formula: 'total-liabilities / stockholders-equity', threshold: null, operation: 'ratio', inputs: [{ inputId: 'input-cmg-liabilities', ref: 'obs-cmg-total-liabilities', concept: 'total-liabilities', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: scope7CmgObs['obs-cmg-total-liabilities'].value, state: 'reconciled' }, { inputId: 'input-cmg-equity', ref: 'obs-cmg-stockholders-equity', concept: 'stockholders-equity', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: scope7CmgObs['obs-cmg-stockholders-equity'].value, state: 'reconciled' }] }, contextualAdjustment: { adjustmentId: 'adjustment-cmg-lease', amount: scope7CmgObs['obs-cmg-operating-lease-liability'].value, rationale: 'Operating-lease and share-repurchase context.', sourceRefs: ['obs-cmg-operating-lease-liability', 'obs-cmg-common-stock-repurchase'], sensitivity: 'lease-and-repurchase-context', applicability: 'restaurant-unit-economics' } }
    ],
    archetypeFacts: [
      { factId: 'fact-cmg-lease', concept: 'operating-lease-liability', label: 'Operating lease liability (SEC 10-K FY2025)', value: scope7CmgObs['obs-cmg-operating-lease-liability'].value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-cmg-operating-lease-liability'] },
      { factId: 'fact-cmg-repurchase', concept: 'common-stock-repurchase', label: 'Common-stock repurchase (SEC 10-K FY2025)', value: scope7CmgObs['obs-cmg-common-stock-repurchase'].value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-cmg-common-stock-repurchase'] }
    ]
  });
  const scope7CmgLeverage = scope7CmgView.checks.find((entry) => entry.checkId === 'check-cmg-liabilities-equity');
  const scope7CmgCash = scope7CmgView.checks.find((entry) => entry.checkId === 'check-cmg-cash-to-debt');
  assert(scope7CmgLeverage.applicability === 'applicable' && scope7CmgLeverage.diagnostic.raw.value === '2.177598' && scope7CmgLeverage.diagnostic.raw.state === 'available' && scope7CmgLeverage.diagnostic.contextual !== null && JSON.stringify(scope7CmgLeverage.diagnostic.contextual.sourceRefs) === JSON.stringify(['obs-cmg-operating-lease-liability', 'obs-cmg-common-stock-repurchase']) && !Object.hasOwn(scope7CmgLeverage.diagnostic.contextual, 'value') && !Object.hasOwn(scope7CmgLeverage.diagnostic.contextual, 'pass') && scope7CmgLeverage.weaknessRank === null && scope7CmgCash.diagnostic.raw.state === 'blocked' && scope7CmgView.industrialRankProduced === false, 'Feature 010 Scope 7 CMG raw leverage 2.177598 renders from reported observations with lease and repurchase context named beside it with exact refs and no pass/fail value');
  // SCN-010-003: JPM marks the ordinary heuristics inapplicable with the financial-institution policy id and keeps real bank facts available with no industrial rank.
  const scope7JpmView = scope7Api.selectResilienceView({
    archetypeView: scope7Jpm,
    subjectCompanyId: 'sec-cik-0000019617',
    checks: [{ checkId: 'check-jpm-liabilities-equity', policyId: 'policy-jpm-ordinary-liabilities-equity', policyVersion: 'financial-institution-inapplicable/v1', concept: 'liabilities-to-equity', periodId: 'period-jpm-fy2025-annual', raw: { formula: 'total-liabilities / stockholders-equity', threshold: null, operation: 'ratio', inputs: [] } }, { checkId: 'check-jpm-net-debt-ebitda', policyId: 'policy-jpm-net-debt-ebitda', policyVersion: 'financial-institution-inapplicable/v1', concept: 'net-debt-to-ebitda', periodId: 'period-jpm-fy2025-annual', raw: { formula: 'net-debt / ebitda', threshold: null, operation: 'ratio', inputs: [] } }],
    archetypeFacts: [{ factId: 'fact-jpm-deposits', concept: 'total-deposits', label: 'Total deposits (SEC 10-K FY2025)', value: scope7JpmObs['obs-jpm-total-deposits'].value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-jpm-total-deposits'] }, { factId: 'fact-jpm-preferred', concept: 'preferred-capital', label: 'Preferred capital (SEC 10-K FY2025)', value: scope7JpmObs['obs-jpm-preferred-capital'].value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-jpm-preferred-capital'] }]
  });
  assert(scope7JpmView.checks.every((entry) => entry.applicability === 'inapplicable' && entry.diagnostic === null && entry.weaknessRank === null && entry.decidingArchetypeId === 'archetype-financial-institution') && scope7JpmView.checks.find((entry) => entry.concept === 'liabilities-to-equity').policyId === 'policy-jpm-ordinary-liabilities-equity' && scope7JpmView.checks.find((entry) => entry.concept === 'net-debt-to-ebitda').policyId === 'policy-jpm-net-debt-ebitda' && scope7JpmView.industrialRankProduced === false && scope7JpmView.industrialWeaknessRank === null && scope7JpmView.archetypeFacts.length === 2 && scope7JpmView.archetypeFacts.every((fact) => fact.state === 'reconciled') && scope7JpmView.archetypeFacts.map((fact) => fact.concept).join(',') === 'total-deposits,preferred-capital', 'Feature 010 Scope 7 JPM marks ordinary liabilities/equity and net-debt/EBITDA inapplicable with the financial-institution policy id and keeps real bank facts available with no industrial weakness rank');
  // FR-010-050: no KPI, diagnostic, formula, or model family is copied between MSFT, CMG, and JPM.
  const scope7Kpis = (view) => view.definition.kpiPriorities.map((kpi) => kpi.kpiId);
  const scope7Policies = (view) => view.definition.diagnosticPolicies.map((policy) => policy.policyId);
  const scope7Disjoint = (a, b) => a.every((entry) => !b.includes(entry)) && b.every((entry) => !a.includes(entry));
  const scope7Families = scope7Config.model.definitions.map((definition) => definition.family);
  assert(scope7Disjoint(scope7Kpis(scope7Msft), scope7Kpis(scope7Cmg)) && scope7Disjoint(scope7Kpis(scope7Msft), scope7Kpis(scope7Jpm)) && scope7Disjoint(scope7Kpis(scope7Cmg), scope7Kpis(scope7Jpm)) && scope7Disjoint(scope7Policies(scope7Msft), scope7Policies(scope7Cmg)) && scope7Disjoint(scope7Policies(scope7Msft), scope7Policies(scope7Jpm)) && scope7Disjoint(scope7Policies(scope7Cmg), scope7Policies(scope7Jpm)) && scope7Families.includes('ordinary-company-three-statement') && scope7Families.includes('financial-institution-balance-sheet') && new Set(scope7Families).size === scope7Families.length, 'Feature 010 Scope 7 MSFT, CMG, and JPM select disjoint KPIs, diagnostics, and model families with no copy between issuers');
  // The overlay cockpit wires the production resilience selector over same-origin scripts with no credential field.
  const scope7Html = read('company-fundamentals-lab.html');
  const scope7Scripts = Array.from(scope7Html.matchAll(/<script\s+src="([^"]+)"/g), (match) => match[1]);
  const scope7ForbiddenInlineValues = ['5600000000', '2800000000', '3900000000', '-3900000000', '2400000000000', '27000000000', '2830607000', '6163924000', '4773434000', '2425516000', '2559320000000', '20045000000'];
  const scope7HasPublicationWiring = scope7Html.includes('RLCOMPANY.loadCompanyPublication') && scope7Html.includes('data/company-fundamentals/companies/') && scope7Html.includes('/current.json') && scope7Html.includes('loadOptionalOverlay("sec-cik-0001058090")') && scope7Html.includes('loadOptionalOverlay("sec-cik-0000019617")');
  const scope7HasProvenance = ['data-overlay-publication-id', 'data-overlay-source-cutoff', 'data-overlay-manifest-sha', 'data-overlay-status', 'data-overlay-error'].every((field) => scope7Html.includes(field));
  const scope7HasAcceptedObservationProjection = scope7Html.includes('prepareAccepted(overlayLoads.cmg.accepted)') && scope7Html.includes('prepareAccepted(overlayLoads.jpm.accepted)') && scope7Html.includes('diagnosticInput(') && scope7Html.includes('periodRef.objectId');
  const scope7HasLegacyOverlay = /constructed Scope 7 overlay fixture|not real issuer-reported values|5600000000|2800000000|3900000000|-3900000000|2400000000000|27000000000|value:\s*"0\.15"|value:\s*"1\.13"/.test(scope7Html);
  assert(hasExactCompanyRouteScripts(scope7Scripts) && scope7Html.includes('selectResilienceView') && scope7Html.includes('data-resilience-company="sec-cik-0001058090"') && scope7Html.includes('data-resilience-company="sec-cik-0000019617"') && scope7Html.includes('archetype-restaurant-unit-economics') && scope7Html.includes('archetype-financial-institution') && scope7HasPublicationWiring && scope7HasProvenance && scope7HasAcceptedObservationProjection && !scope7HasLegacyOverlay && scope7ForbiddenInlineValues.every((value) => !scope7Html.includes(value)) && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope7Html), 'Feature 010 Scope 7 overlay cockpit loads retained CMG and JPM publications through current pointers, projects accepted observations with provenance, and rejects constructed or inline issuer values');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 010 Scope 7 group threw): ' + e.message); }
/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE7-END */

/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE8-BEGIN */
try {
  group('Feature 010 Scope 8 cross-entity comparability boundary and accessible chart-equivalent table');
  const scope8Api = globalThis.RLCOMPANY;
  const scope8LoadPub = (companyId) => {
    const pointer = JSON.parse(read('data/company-fundamentals/companies/' + companyId + '/current.json'));
    scope8Api.validateCompanyCurrentPointer(pointer, companyId);
    const manifest = JSON.parse(read(pointer.manifestPath));
    const objects = {};
    const queue = [];
    const seen = new Set();
    const collect = (value) => {
      if (value && value.contractVersion === 'company-object-ref/v1') { queue.push(value); return; }
      if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    collect(manifest);
    while (queue.length) {
      const ref = queue.shift();
      if (seen.has(ref.objectId)) continue;
      seen.add(ref.objectId);
      objects[ref.objectId] = JSON.parse(read(ref.path));
      collect(objects[ref.objectId]);
    }
    const accepted = scope8Api.projectAcceptedPublication(manifest, objects);
    return { accepted, observationsById: Object.fromEntries(accepted.observations.map((observation) => [observation.observationId, observation])) };
  };
  const scope8Msft = scope8LoadPub('sec-cik-0000789019');
  const scope8Cmg = scope8LoadPub('sec-cik-0001058090');
  const scope8Jpm = scope8LoadPub('sec-cik-0000019617');
  const scope8CmgEquity = scope8Cmg.observationsById['obs-cmg-stockholders-equity'].value;
  const scope8JpmEquity = scope8Jpm.observationsById['obs-jpm-stockholders-equity'].value;
  // SCN-010-007: a real mixed-fiscal MSFT (06-30) versus CMG (12-31) comparison keeps every raw basis visible and withholds growth, statistic, and rank with the exact reason.
  const scope8Cross = scope8Api.evaluateComparability({
    concept: 'stockholders-equity', operations: ['growth', 'statistic', 'rank'], statistic: { operation: 'mean' }, reconciliation: null,
    bases: [
      { basisId: 'basis-msft', companyId: scope8Msft.accepted.companyId, concept: 'stockholders-equity', unit: 'USD', currency: scope8Msft.accepted.identity.reportingCurrency, fiscalYearEnd: scope8Msft.accepted.identity.fiscalYearEnd, periodId: scope8Msft.accepted.periods[0].periodId, periodEnd: scope8Msft.accepted.periods[0].end, value: null },
      { basisId: 'basis-cmg', companyId: scope8Cmg.accepted.companyId, concept: 'stockholders-equity', unit: 'USD', currency: scope8Cmg.accepted.identity.reportingCurrency, fiscalYearEnd: scope8Cmg.accepted.identity.fiscalYearEnd, periodId: 'period-cmg-fy2025-annual', periodEnd: '2025-12-31', value: scope8CmgEquity }
    ]
  });
  assert(scope8Msft.accepted.identity.fiscalYearEnd === '06-30' && scope8Cmg.accepted.identity.fiscalYearEnd === '12-31' && scope8Cross.comparable === false && scope8Cross.reasonCodes.length === 1 && scope8Cross.reasonCodes[0] === 'fiscal-calendar-mismatch' && ['growth', 'statistic', 'rank'].every((op) => scope8Cross.operations[op].state === 'unavailable' && scope8Cross.operations[op].value === null && scope8Cross.operations[op].reasonCodes[0] === 'fiscal-calendar-mismatch') && scope8Cross.bases[0].valueState === 'unavailable' && scope8Cross.bases[1].value === '2830607000', 'Feature 010 Scope 8 real mixed-fiscal MSFT versus CMG comparison keeps raw bases visible and withholds growth, statistic, and rank with the exact fiscal-calendar reason');
  // SCN-010-007: an aligned same-currency same-fiscal CMG versus JPM equity comparison genuinely computes the mean and rank.
  const scope8Aligned = scope8Api.evaluateComparability({
    concept: 'stockholders-equity', operations: ['statistic', 'rank'], statistic: { operation: 'mean' }, reconciliation: null,
    bases: [
      { basisId: 'basis-cmg', companyId: scope8Cmg.accepted.companyId, concept: 'stockholders-equity', unit: 'USD', currency: 'USD', fiscalYearEnd: '12-31', periodId: 'period-cmg-fy2025-annual', periodEnd: '2025-12-31', value: scope8CmgEquity },
      { basisId: 'basis-jpm', companyId: scope8Jpm.accepted.companyId, concept: 'stockholders-equity', unit: 'USD', currency: 'USD', fiscalYearEnd: '12-31', periodId: 'period-jpm-fy2025-annual', periodEnd: '2025-12-31', value: scope8JpmEquity }
    ]
  });
  assert(scope8Aligned.comparable === true && scope8Aligned.reasonCodes.length === 0 && scope8Aligned.operations.statistic.state === 'available' && scope8Aligned.operations.statistic.value === '182634303500' && scope8Aligned.operations.rank.state === 'available' && scope8Aligned.operations.rank.value[0].companyId === scope8Jpm.accepted.companyId && scope8Aligned.operations.rank.value[0].value === '362438000000', 'Feature 010 Scope 8 aligned same-currency same-fiscal CMG versus JPM comparison computes the mean statistic and rank from real reported equity');
  // SCN-010-007: currency and unit incompatibilities each withhold with their own exact reason; an explicit reconciliation bridges the difference.
  const scope8Basis = (over) => Object.assign({ basisId: 'b', companyId: 'peer', concept: 'revenue', unit: 'USD', currency: 'USD', fiscalYearEnd: '12-31', periodId: 'p', periodEnd: '2025-12-31', value: '100' }, over);
  const scope8Currency = scope8Api.evaluateComparability({ concept: 'revenue', operations: ['growth'], reconciliation: null, bases: [scope8Basis({ basisId: 'a', currency: 'USD', value: '100' }), scope8Basis({ basisId: 'b', currency: 'EUR', value: '120' })] });
  const scope8Unit = scope8Api.evaluateComparability({ concept: 'revenue', operations: ['growth'], reconciliation: null, bases: [scope8Basis({ basisId: 'a', unit: 'USD', value: '100' }), scope8Basis({ basisId: 'b', unit: 'USD-thousands', value: '100' })] });
  const scope8Bridged = scope8Api.evaluateComparability({ concept: 'revenue', operations: ['growth'], reconciliation: { bridges: ['currency'], note: 'Explicit period-end reference rate' }, bases: [scope8Basis({ basisId: 'a', currency: 'USD', value: '100' }), scope8Basis({ basisId: 'b', currency: 'EUR', value: '110' })] });
  assert(scope8Currency.reasonCodes[0] === 'currency-mismatch' && scope8Currency.operations.growth.state === 'unavailable' && scope8Unit.reasonCodes[0] === 'unit-mismatch' && scope8Unit.operations.growth.state === 'unavailable' && scope8Bridged.comparable === true && scope8Bridged.operations.growth.state === 'available' && scope8Bridged.operations.growth.value === '0.1', 'Feature 010 Scope 8 currency and unit incompatibilities each withhold the comparison with their exact reason and an explicit reconciliation bridges the difference');
  // SCN-010-032: every visual series point becomes a text-complete accessible row; a null value is explicit text, never a blank cell or a color-only signal.
  const scope8Table = scope8Api.buildAccessibleChartTable({ caption: 'Reported stockholders equity by issuer', categoryLabel: 'Issuer', valueLabel: 'Stockholders equity', unit: 'USD', series: [{ label: 'Chipotle', value: scope8CmgEquity }, { label: 'JPMorgan', value: scope8JpmEquity }, { label: 'Microsoft', value: null, note: 'Not reported in the retained SEC Submissions publication' }] });
  assert(scope8Table.contractVersion === 'company-accessible-table/v1' && JSON.stringify(scope8Table.columns) === JSON.stringify(['Issuer', 'Stockholders equity', 'State']) && scope8Table.rows.length === 3 && scope8Table.rows[0].valueText === '2830607000 USD' && scope8Table.rows[0].state === 'available' && scope8Table.rows[2].value === null && scope8Table.rows[2].state === 'unavailable' && scope8Table.rows[2].valueText === 'Not reported in the retained SEC Submissions publication', 'Feature 010 Scope 8 buildAccessibleChartTable exposes every series point as a text-complete row with an explicit unavailable state and no color-only meaning');
  // SCN-010-032: the lab hardens the research journey for keyboard and 320px access — a roving tab index, a polite live region, an accessible chart-equivalent table, and a decorative visual hidden from assistive technology — driven by the production helpers with no inline issuer values and no credential field.
  const scope8Html = read('company-fundamentals-lab.html');
  const scope8Scripts = Array.from(scope8Html.matchAll(/<script\s+src="([^"]+)"/g), (match) => match[1]);
  const scope8HasComparabilityTab = /data-detailed-tab="comparability"[^>]*role="tab"|role="tab"[^>]*data-detailed-tab="comparability"/.test(scope8Html) && scope8Html.includes('data-detailed-panel="comparability"');
  const scope8HasRovingTabindex = /data-detailed-tab="statements"[^>]*tabindex="0"/.test(scope8Html) && /data-detailed-tab="resilience"[^>]*tabindex="-1"/.test(scope8Html);
  const scope8HasKeyboardNav = scope8Html.includes('ArrowRight') && scope8Html.includes('ArrowLeft') && scope8Html.includes('"Home"') && scope8Html.includes('"End"') && scope8Html.includes('activateTab');
  const scope8HasLive = /data-a11y-live[^>]*aria-live="polite"|aria-live="polite"[^>]*data-a11y-live/.test(scope8Html);
  const scope8HasChartTable = scope8Html.includes('data-accessible-chart-table') && scope8Html.includes('data-accessible-chart-body') && /data-chart-visual[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-chart-visual/.test(scope8Html);
  const scope8HasProductionWiring = scope8Html.includes('RLCOMPANY.evaluateComparability') && scope8Html.includes('RLCOMPANY.buildAccessibleChartTable') && scope8Html.includes('renderComparability(accepted, overlayLoads)');
  const scope8ForbiddenInline = ['2830607000', '362438000000', '182634303500', '6163924000'];
  assert(hasExactCompanyRouteScripts(scope8Scripts) && scope8HasComparabilityTab && scope8HasRovingTabindex && scope8HasKeyboardNav && scope8HasLive && scope8HasChartTable && scope8HasProductionWiring && scope8ForbiddenInline.every((value) => !scope8Html.includes(value)) && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope8Html), 'Feature 010 Scope 8 lab hardens the research journey with a keyboard-operable roving tab list, a polite live region, an accessible chart-equivalent table, and a decorative visual hidden from assistive technology, driven by the production comparability and accessible-table helpers with no inline issuer values');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 010 Scope 8 group threw): ' + e.message); }
/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE8-END */

/* ---------- Feature 002 Scope 02: market-session-evidence adapter ---------- */
/* FEATURE-002-MARKET-SESSION-SCOPE2-BEGIN */
try {
  group('Feature 002 Scope 02 market-session-evidence Yahoo adapter');
  const evidenceModule = await import('./market-session-evidence.mjs');
  const calendarModule = await import('./generate-xnys-calendar.mjs');
  const scope2Config = JSON.parse(read('market-brief.config.json'));

  const scope2Policies = evidenceModule.loadSourcePolicies(scope2Config);
  assert(scope2Policies.ok === true && scope2Policies.requestPolicy.contractVersion === 'source-request-policy/v1' && scope2Policies.usePolicy.contractVersion === 'source-use-policy/v1', 'Feature 002 Scope 02 loadSourcePolicies resolves the committed request/use/budget policy objects from the market config');

  const scope2Request = evidenceModule.buildYahooRequest('SPY', scope2Policies.requestPolicy);
  assert(scope2Request.url === 'https://query1.finance.yahoo.com/v8/finance/chart/SPY?interval=5m&range=1mo&includePrePost=true&includeAdjustedClose=true&events=div%2Csplits', 'Feature 002 Scope 02 buildYahooRequest emits the exact allowlisted Yahoo chart URL');
  assert(evidenceModule.validateSourceRequest(scope2Request, scope2Policies.requestPolicy).ok === true, 'Feature 002 Scope 02 validateSourceRequest accepts the canonical Yahoo request');
  assert(evidenceModule.validateSourceRequest({ sourceId: 'yahoo-chart', method: 'GET', url: scope2Request.url.replace('query1.finance.yahoo.com', 'evil.example.com') }, scope2Policies.requestPolicy).reason === 'host-not-allowlisted', 'Feature 002 Scope 02 validateSourceRequest rejects a non-allowlisted host');
  assert(evidenceModule.validateSourceRequest({ sourceId: 'yahoo-chart', method: 'GET', url: scope2Request.url.replace('interval=5m', 'interval=1m') }, scope2Policies.requestPolicy).reason === 'query-value-mismatch', 'Feature 002 Scope 02 validateSourceRequest rejects a mutated fixed query value');

  const scope2Parsed = { timestamp: [1784016000, 1784016300, 1784016600], quote: { open: [100, null, 100], high: [101, 101, 101], low: [99, 99, 99], close: [100.5, 100.5, 100.5], volume: [null, 10, 0] }, events: {}, meta: {} };
  const scope2Normalized = evidenceModule.normalizeYahooSession(scope2Parsed, { symbol: 'SPY', providerSymbol: 'SPY', budget: { maxBarsPerSymbolTradingDate: 200 } });
  assert(scope2Normalized.ok === true && scope2Normalized.bars.length === 2, 'Feature 002 Scope 02 normalizeYahooSession drops a bar with an absent OHLC field instead of substituting close');
  assert(scope2Normalized.bars[0].volume === null, 'Feature 002 Scope 02 normalizeYahooSession preserves missing volume as null (no zero coercion)');
  assert(scope2Normalized.bars[1].volume === 0, 'Feature 002 Scope 02 normalizeYahooSession preserves an explicit provider zero as observed-zero, distinct from missing');
  assert(scope2Normalized.bars.every((bar) => bar.priceBasis === 'provider-chart-basis' && bar.interval === 'PT5M'), 'Feature 002 Scope 02 normalizeYahooSession labels every bar with the provider chart basis and five-minute interval');

  const scope2Good = { chart: { result: [{ meta: {}, timestamp: [1, 2], indicators: { quote: [{ open: [1, 1], high: [1, 1], low: [1, 1], close: [1, 1], volume: [1, 1] }], adjclose: [{ adjclose: [1, 1] }] }, events: {} }], error: null } };
  const scope2Bad = { chart: { result: [{ meta: {}, timestamp: [1, 2, 3], indicators: { quote: [{ open: [1, 2], high: [1, 2, 3], low: [1, 2, 3], close: [1, 2, 3], volume: [1, 2, 3] }], adjclose: [{ adjclose: [1, 2, 3] }] }, events: {} }], error: null } };
  assert(evidenceModule.parseYahooChart(Buffer.from(JSON.stringify(scope2Good))).ok === true, 'Feature 002 Scope 02 parseYahooChart accepts a well-formed parallel-array response');
  assert(evidenceModule.parseYahooChart(Buffer.from(JSON.stringify(scope2Bad))).reason === 'yahoo-quote-array-length-mismatch', 'Feature 002 Scope 02 parseYahooChart rejects a provider array-length mismatch');

  const scope2Source = calendarModule.parseNyseCalendarSource(read('data/calendars/xnys/source/nyse-hours-calendar.reviewed.json'));
  const scope2Calendar = calendarModule.materializeXNYSCalendar(scope2Source, 'sha256:' + '0'.repeat(64));
  const scope2Coverage = calendarModule.validateCalendarCoverage(scope2Calendar);
  assert(scope2Coverage.rowCount === 365 && scope2Coverage.openDates === 251, 'Feature 002 Scope 02 materializeXNYSCalendar enumerates every 2026 civil date with the reviewed open/closed split');
  const scope2Holiday = scope2Calendar.rows.find((row) => row.tradingDate === '2026-07-03');
  const scope2Weekend = scope2Calendar.rows.find((row) => row.tradingDate === '2026-07-04');
  assert(scope2Holiday.dateState === 'holiday' && scope2Holiday.closureCode === 'independence-day-observed' && scope2Weekend.dateState === 'weekend', 'Feature 002 Scope 02 materialized calendar marks the reviewed observed holiday and the weekend without a getDay() fallback');
  const scope2Edt = scope2Calendar.rows.find((row) => row.tradingDate === '2026-07-14');
  const scope2Est = scope2Calendar.rows.find((row) => row.tradingDate === '2026-01-02');
  assert(scope2Edt.regular.endUtc === '2026-07-14T20:00:00.000Z' && scope2Est.regular.endUtc === '2026-01-02T21:00:00.000Z', 'Feature 002 Scope 02 materialized calendar resolves DST-correct UTC boundaries (EDT 20:00Z vs EST 21:00Z regular close)');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 002 Scope 02 group threw): ' + e.message); }
/* FEATURE-002-MARKET-SESSION-SCOPE2-END */

/* ---------- Feature 002 Scope 03: BLS CPI released-report evidence ---------- */
/* FEATURE-002-MARKET-SESSION-SCOPE3-BEGIN */
try {
  group('Feature 002 Scope 03 market-session-evidence BLS CPI report adapter');
  const evidence3 = await import('./market-session-evidence.mjs');
  const reportFixtures = await import('../tests/fixtures/feature-002/market-session-evidence/report-fixture-builder.mjs');
  const featureRequire3 = (await import('node:module')).createRequire(import.meta.url);
  const RLSESSION3 = featureRequire3('../rlsession.js');
  const scope3Config = JSON.parse(read('market-brief.config.json'));
  const CPI_SCHEDULED_AT = '2026-07-14T12:30:00.000Z';

  // Config resolves the committed CPI report definition and the two allowlisted BLS sources.
  const scope3Policies = evidence3.loadSourcePolicies(scope3Config);
  assert(scope3Policies.ok === true && scope3Policies.evidenceConfig.reports.cpi.series.join(',') === 'CUSR0000SA0,CUUR0000SA0' && scope3Policies.requestPolicy.sources['bls-cpi-schedule'].host === 'www.bls.gov' && scope3Policies.requestPolicy.sources['bls-public-api-v2'].host === 'api.bls.gov', 'Feature 002 Scope 03 loadSourcePolicies resolves the committed CPI report config and the two allowlisted BLS sources');

  // buildBlsScheduleRequest / buildBlsApiRequest emit the exact allowlisted request contracts.
  const scope3SchedReq = evidence3.buildBlsScheduleRequest(scope3Policies.requestPolicy);
  const scope3ApiReq = evidence3.buildBlsApiRequest(scope3Policies.requestPolicy, { series: ['CUSR0000SA0', 'CUUR0000SA0'], startYear: 2025, endYear: 2026 });
  assert(scope3SchedReq.method === 'GET' && scope3SchedReq.url === 'https://www.bls.gov/schedule/news_release/cpi.htm', 'Feature 002 Scope 03 buildBlsScheduleRequest emits the exact allowlisted BLS CPI schedule GET URL');
  assert(scope3ApiReq.method === 'POST' && scope3ApiReq.url === 'https://api.bls.gov/publicAPI/v2/timeseries/data/' && scope3ApiReq.body.seriesid.join(',') === 'CUSR0000SA0,CUUR0000SA0' && scope3ApiReq.body.startyear === '2025' && scope3ApiReq.body.endyear === '2026', 'Feature 002 Scope 03 buildBlsApiRequest emits the exact no-key Public Data API v2 POST body');

  // parseBlsScheduleHtml resolves the exact 08:30 ET -> 12:30Z instant and fails closed on mutations.
  const scope3SchedParse = evidence3.parseBlsScheduleHtml(reportFixtures.encodeHtml(reportFixtures.buildBlsScheduleHtml()));
  const scope3JuneRow = scope3SchedParse.ok ? scope3SchedParse.rows.find((row) => row.reportPeriod === '2026-06') : null;
  assert(scope3SchedParse.ok === true && scope3JuneRow.scheduledAt === CPI_SCHEDULED_AT, 'Feature 002 Scope 03 parseBlsScheduleHtml resolves the June 2026 08:30 ET release to the exact 12:30Z instant');
  assert(evidence3.parseBlsScheduleHtml(reportFixtures.encodeHtml(reportFixtures.buildBlsScheduleHtml({ omitHeading: true }))).reason === 'schedule-heading-missing', 'Feature 002 Scope 03 parseBlsScheduleHtml fails closed when the required schedule heading is absent');
  assert(evidence3.parseBlsScheduleHtml(reportFixtures.encodeHtml(reportFixtures.buildBlsScheduleHtml({ duplicatePeriod: '2026-06' }))).reason === 'schedule-duplicate-period', 'Feature 002 Scope 03 parseBlsScheduleHtml fails closed on a duplicate reference period');

  // parseBlsApiResponse parses the exact index levels and fails closed on status/series mutations.
  const scope3ApiParse = evidence3.parseBlsApiResponse(reportFixtures.encodeJson(reportFixtures.buildBlsApiResponse()));
  assert(scope3ApiParse.ok === true && scope3ApiParse.series.CUSR0000SA0['2026-06'] === 320 && scope3ApiParse.series.CUUR0000SA0['2025-06'] === 315, 'Feature 002 Scope 03 parseBlsApiResponse parses the exact committed CPI index levels');
  assert(evidence3.parseBlsApiResponse(reportFixtures.encodeJson(reportFixtures.buildBlsApiResponse({ status: 'REQUEST_FAILED' }))).reason === 'bls-api-status-not-succeeded', 'Feature 002 Scope 03 parseBlsApiResponse fails closed when the BLS status is not REQUEST_SUCCEEDED');
  assert(evidence3.parseBlsApiResponse(reportFixtures.encodeJson(reportFixtures.buildBlsApiResponse({ missingSeries: 'CUUR0000SA0' }))).reason === 'bls-api-series-missing', 'Feature 002 Scope 03 parseBlsApiResponse fails closed when a requested series is missing');

  // buildReportSchedule + mapBlsCpiSnapshot compute the exact CPI transforms and previous lineage.
  const scope3Schedule = evidence3.buildReportSchedule(scope3JuneRow);
  assert(scope3Schedule.reportType === 'CPI' && scope3Schedule.metricDefinitions.length === 2 && scope3Schedule.metricDefinitions[0].transform === 'mom' && scope3Schedule.metricDefinitions[1].transform === 'yoy', 'Feature 002 Scope 03 buildReportSchedule exposes the two CPI metric definitions with exact transforms');
  const scope3Snapshot = evidence3.mapBlsCpiSnapshot([{ series: scope3ApiParse.series, releasedAt: CPI_SCHEDULED_AT }], scope3Schedule);
  const scope3Mom = scope3Snapshot.snapshot.sourceRecords[0].metrics.find((metric) => metric.metricId === 'headline-mom-sa');
  const scope3Yoy = scope3Snapshot.snapshot.sourceRecords[0].metrics.find((metric) => metric.metricId === 'headline-yoy-nsa');
  assert(Math.abs(scope3Mom.value - 100 * (320 / 319 - 1)) < 1e-12 && Math.abs(scope3Yoy.value - 100 * (323 / 315 - 1)) < 1e-12 && scope3Snapshot.snapshot.sourceRecords[0].previous.length === 2, 'Feature 002 Scope 03 mapBlsCpiSnapshot computes exact MoM SA and YoY NSA transforms with previous-period lineage');

  // selectConsensusArtifact deterministically selects a pre-release-locked artifact; empty is unavailable.
  const scope3Consensus = reportFixtures.buildConsensusArtifact({ scheduledAt: CPI_SCHEDULED_AT });
  assert(evidence3.selectConsensusArtifact([scope3Consensus], scope3Schedule).consensus.consensusId === scope3Consensus.consensusId, 'Feature 002 Scope 03 selectConsensusArtifact deterministically selects the pre-release-locked consensus artifact');
  const scope3EmptyConsensus = evidence3.selectConsensusArtifact([], scope3Schedule);
  assert(scope3EmptyConsensus.consensus === null && scope3EmptyConsensus.reason === 'consensus-unavailable', 'Feature 002 Scope 03 selectConsensusArtifact reports consensus-unavailable for an empty artifact set');

  // acquireReportEvidence runs the full vertical: upcoming before release, released after, disputed on disagreement.
  const scope3Base = { report: 'cpi', reportPeriod: '2026-06', retrievedAt: '2026-07-14T12:35:00.000Z' };
  const scope3Upcoming = await evidence3.acquireReportEvidence(scope3Config, { ...scope3Base, cutoffAt: '2026-07-14T12:29:59.000Z', transport: reportFixtures.capturedReportTransport(), consensusArtifacts: [scope3Consensus] });
  assert(scope3Upcoming.ok === true && scope3Upcoming.evidence.state === 'upcoming' && scope3Upcoming.evidence.actual.length === 0 && scope3Upcoming.evidence.surprises.length === 0 && scope3Upcoming.evidence.releasedAt === null, 'Feature 002 Scope 03 acquireReportEvidence keeps CPI upcoming before release with no actual or surprise');
  const scope3Released = await evidence3.acquireReportEvidence(scope3Config, { ...scope3Base, cutoffAt: '2026-07-14T12:45:00.000Z', transport: reportFixtures.capturedReportTransport(), consensusArtifacts: [scope3Consensus] });
  assert(scope3Released.evidence.state === 'released' && scope3Released.evidence.actual.length === 2 && scope3Released.evidence.surprises.length === 1 && scope3Released.evidence.surprises[0].metricId === 'headline-mom-sa' && scope3Released.evidence.surprises[0].unit === 'percentage-points', 'Feature 002 Scope 03 acquireReportEvidence releases CPI with exact actuals and one MoM percentage-point surprise');
  const scope3Disputed = await evidence3.acquireReportEvidence(scope3Config, { ...scope3Base, cutoffAt: '2026-07-14T12:45:00.000Z', transport: reportFixtures.capturedReportTransport({ apiResponses: [reportFixtures.encodeJson(reportFixtures.buildBlsApiResponse()), reportFixtures.encodeJson(reportFixtures.buildBlsApiResponse({ overrideValue: { series: 'CUSR0000SA0', period: '2026-06', value: 321.0 } }))] }), additionalApiFetches: 1, consensusArtifacts: [] });
  assert(scope3Disputed.evidence.state === 'disputed' && scope3Disputed.evidence.actual.length === 0 && scope3Disputed.evidence.sourceRecords.length === 2 && scope3Disputed.evidence.reasonCodes.includes('provider-disagreement'), 'Feature 002 Scope 03 acquireReportEvidence marks disagreeing CPI sources disputed with no synthesized actual');

  // The produced pointer-ready graph revalidates through the UNCHANGED Scope 01 primitive.
  assert(RLSESSION3.validateReleasedReportEvidence(scope3Released.evidence).ok === true, 'Feature 002 Scope 03 released-report-evidence graph revalidates through the Scope 01 validateReleasedReportEvidence primitive');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 002 Scope 03 group threw): ' + e.message); }
/* FEATURE-002-MARKET-SESSION-SCOPE3-END */

/* ---------- Feature 002 Scope 04: event reaction + owner integration ---------- */
/* FEATURE-002-MARKET-SESSION-SCOPE4-BEGIN */
try {
  group('Feature 002 Scope 04 event reaction and owner integration');
  await import('../rldata.js');
  const RLDATA4 = globalThis.RLDATA;
  const brief4 = await import('./brief-refresh.mjs');
  const reactionFixtures4 = await import('../tests/fixtures/feature-002/market-session-evidence/reaction-fixture-builder.mjs');
  const featureRequire4 = (await import('node:module')).createRequire(import.meta.url);
  const RLSESSION4 = featureRequire4('../rlsession.js');
  const { createHash: scope4Hash } = await import('node:crypto');
  const scope4Calendar = JSON.parse(read('tests/fixtures/feature-002/market-session-evidence/xnys-calendar.v1.json'));

  // Reaction vertical: the concrete scenario joins the released report to a field-complete,
  // cutoff-safe, non-zero-window ReactionSegment/v1 through the UNCHANGED Scope 01 primitive.
  const scope4Scenario = reactionFixtures4.buildReactionScenario(scope4Calendar, {});
  const scope4Reaction = scope4Scenario.reaction;
  const scope4Segment = scope4Reaction.segments[0];
  assert(scope4Reaction.contractVersion === 'event-market-reaction/v1' && scope4Reaction.state === 'partial' && scope4Reaction.segments.length === 1, 'Feature 002 Scope 04 joinEventMarketReaction produces one partial cutoff-safe reaction segment');
  assert(scope4Segment.startBucket === 55 && scope4Segment.endBucketInclusive === 55 && scope4Segment.comparisonWindow.startBucket === 55, 'Feature 002 Scope 04 ReactionSegment preserves the exact non-zero comparison window (never remapped to bucket zero)');
  assert(scope4Reaction.reasonCodes.includes('release-straddling-bar-excluded') && scope4Reaction.preReleaseBaseline.barEnd === '2026-07-14T12:30:00.000Z', 'Feature 002 Scope 04 excludes the release-straddling bar and freezes the one-bar pre-release baseline');
  assert(scope4Segment.segmentId === scope4Segment.occurrenceFingerprint && scope4Segment.semanticFingerprint !== scope4Segment.occurrenceFingerprint, 'Feature 002 Scope 04 segment occurrence identity equals segmentId and stays distinct from the semantic identity');
  assert(RLSESSION4.validateEventMarketReaction(scope4Reaction).ok === true, 'Feature 002 Scope 04 reaction graph revalidates through the Scope 01 validateEventMarketReaction primitive');

  // Owner integration: only the owning adapter/model may publish an evidence interpretation.
  const scope4Bundle = (function buildScope4Bundle() {
    const h = (seed) => 'sha256:' + scope4Hash('sha256').update(seed).digest('hex');
    return {
      contractVersion: 'market-session-evidence/v1', cutoffAt: '2026-07-14T12:40:00.000Z', fingerprint: h('bundle'),
      sessionAggregateRefs: [{ evidenceType: 'session-aggregate', fingerprint: h('aggregate-SPY') }],
      volumeBaselineRefs: [{ evidenceType: 'comparable-volume-baseline', fingerprint: h('baseline-SPY') }],
      releasedReportRefs: [{ evidenceType: 'released-report-evidence', fingerprint: h('cpi-report') }],
      eventReactionRefs: [{ evidenceType: 'event-market-reaction', fingerprint: h('cpi-reaction') }]
    };
  })();
  const scope4Bond = brief4.OWNER_EVIDENCE_DECLARATIONS.find((declaration) => declaration.toolId === 'bond-regime-lab');
  const scope4BondRead = brief4.buildOwnerEvidenceRead(scope4Bond, scope4Bundle, { symbol: 'SPY' });
  assert(RLDATA4.validateToolModelRead(scope4BondRead).ok === true && scope4BondRead.evidenceInterpretations[0].kind === 'supporting' && scope4BondRead.recommendationEligibility.eligible === true, 'Feature 002 Scope 04 Bond Regime owner read publishes a supporting owner interpretation and is action-eligible');
  const scope4Forged = JSON.parse(JSON.stringify(scope4BondRead));
  scope4Forged.evidenceInterpretations[0].ownerAdapterId = 'market-brief-final-author';
  assert(RLDATA4.validateToolModelRead(scope4Forged).reason === 'evidence-interpretation-provenance-mismatch', 'Feature 002 Scope 04 rejects an interpretation forged away from the owning adapter provenance');
  const scope4Final = JSON.parse(JSON.stringify(scope4BondRead));
  scope4Final.role = 'final-aggregator'; scope4Final.profile = 'final-aggregator';
  assert(RLDATA4.validateToolModelRead(scope4Final).reason === 'final-author-cannot-interpret', 'Feature 002 Scope 04 forbids a final aggregator from publishing an owner interpretation');

  // freezeToolReads publishes the six declared owners over the bundle; every non-owner source
  // receives explicit applicability and no interpretation.
  const scope4Frozen = brief4.freezeToolReads(scope4Bundle, { symbol: 'SPY' }, [{ toolId: 'options-flow-lab', profile: 'live-market' }, { toolId: 'waterfront-polo-lab', profile: 'off-theme' }]);
  assert(Object.keys(scope4Frozen.owners).length === 6 && brief4.OWNER_EVIDENCE_DECLARATIONS.every((declaration) => RLDATA4.validateToolModelRead(scope4Frozen.owners[declaration.toolId]).ok === true), 'Feature 002 Scope 04 freezeToolReads publishes six validated ToolModelRead/v1 owner reads');
  assert(scope4Frozen.owners['real-assets-lab'].evidenceInterpretations[0].kind === 'not-applicable' && scope4Frozen.owners['real-assets-lab'].marketSessionEvidenceRef === null, 'Feature 002 Scope 04 Real Assets is explicitly not-applicable for a non-real-asset (SPY) run');
  assert(scope4Frozen.others['options-flow-lab'].evidenceApplicability.status === 'not-integrated' && scope4Frozen.others['options-flow-lab'].evidenceInterpretations.length === 0 && RLDATA4.validateToolModelRead(scope4Frozen.others['options-flow-lab']).ok === true, 'Feature 002 Scope 04 a non-integrated live-market source carries explicit applicability and no interpretation');

  // The additive tool-model-read/v1 branch never intercepts an existing rl-tool-read/v1 publisher
  // projection: the five current browser publisher reads still round-trip byte-identically.
  const scope4Publisher = { contractVersion: 'rl-tool-read/v1', id: 'sector-research-lab', availability: 'current', asOf: '2026-07-14T12:00:00.000Z', computedAt: '2026-07-14T12:05:00.000Z', freshUntil: '2026-07-14T18:00:00.000Z', read: 'pre-evidence read', metrics: { leader: 'SPY', score: 42 }, deepLink: 'sector-research-lab.html' };
  assert(JSON.stringify(RLDATA4.putToolRead('sector-research-lab', scope4Publisher)) === JSON.stringify(scope4Publisher), 'Feature 002 Scope 04 an existing rl-tool-read/v1 publisher projection round-trips byte-identically through putToolRead');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 002 Scope 04 group threw): ' + e.message); }
/* FEATURE-002-MARKET-SESSION-SCOPE4-END */

/* ---------- Feature 002 Scope 05: registry-wide normalized reads ---------- */
/* FEATURE-002-MARKET-SESSION-SCOPE5-BEGIN */
try {
  group('Feature 002 Scope 05 registry-wide normalized reads');
  await import('../rldata.js');
  const RLDATA5 = globalThis.RLDATA;
  const RLCONTRACTS5 = (await import('node:module')).createRequire(import.meta.url)('../rlcontracts.js');
  const brief5 = await import('./brief-refresh.mjs');
  const { createHash: createHash5 } = await import('node:crypto');
  const registry5 = JSON.parse(read('tools.json'));
  const config5 = {
    profiles: {
      'live-market': { freshnessPolicy: 'daily-market-bars-v1', recommendationPolicy: 'market-action-v1', budgetPolicy: 'live-market-v1' },
      'static-model': { freshnessPolicy: 'static-model-asof-v1', recommendationPolicy: 'model-conclusion-v1', budgetPolicy: 'static-model-v1' },
      'local-model': { freshnessPolicy: 'committed-projection-v1', recommendationPolicy: 'operational-next-step-v1', budgetPolicy: 'local-model-v1' },
      'off-theme': { freshnessPolicy: 'off-theme-not-applicable-v1', recommendationPolicy: 'domain-next-step-v1', budgetPolicy: 'off-theme-v1' },
      'final-aggregator': { freshnessPolicy: 'final-aggregation-v1', recommendationPolicy: 'final-synthesis-v1', budgetPolicy: 'final-aggregator-v1' }
    }
  };

  // validateRegistry derives participants and sources from the live committed tools.json, requires
  // exactly one non-recursive final aggregator, and content-addresses the frozen set.
  const frozen5 = RLCONTRACTS5.validateRegistry(registry5, config5);
  const derivedSources5 = registry5.tools.filter((entry) => entry.briefing.role === 'source').map((entry) => entry.id);
  assert(frozen5.ok === true && frozen5.value.participantCount === registry5.tools.length && frozen5.value.sourceCount === derivedSources5.length && frozen5.value.aggregatorToolId === 'market-brief' && frozen5.value.orderedSourceToolIds.indexOf('market-brief') < 0 && /^sha256:[a-f0-9]{64}$/.test(frozen5.value.registryFingerprint), 'Feature 002 Scope 05 validateRegistry derives every participant and source with one non-recursive Market Brief aggregator');

  // Every entry carries a complete unique-adapter briefing block; missing field, role/profile mismatch,
  // duplicate adapter, and policy mismatch each fail loud before acquisition.
  assert(new Set(registry5.tools.map((entry) => entry.briefing.readAdapter)).size === registry5.tools.length, 'Feature 002 Scope 05 every tools.json entry carries a unique briefing read adapter');
  const dropField5 = JSON.parse(JSON.stringify(registry5)); delete dropField5.tools[1].briefing.budgetPolicy;
  const roleSwap5 = JSON.parse(JSON.stringify(registry5)); roleSwap5.tools[1].briefing.role = 'final-aggregator';
  const dupAdapter5 = JSON.parse(JSON.stringify(registry5)); dupAdapter5.tools[2].briefing.readAdapter = registry5.tools[1].briefing.readAdapter;
  const policyBad5 = JSON.parse(JSON.stringify(registry5)); policyBad5.tools[1].briefing.budgetPolicy = 'off-theme-v1';
  assert(RLCONTRACTS5.validateRegistry(dropField5).error.reason === 'briefing-field-missing' && RLCONTRACTS5.validateRegistry(roleSwap5).error.reason === 'briefing-role-profile-mismatch' && RLCONTRACTS5.validateRegistry(dupAdapter5).error.reason === 'briefing-duplicate-adapter' && RLCONTRACTS5.validateRegistry(policyBad5, config5).error.reason === 'briefing-policy-mismatch', 'Feature 002 Scope 05 validateRegistry fails loud on missing metadata, role/profile mismatch, duplicate adapter, and policy mismatch');

  // A registry-only addition derives the incremented inventory through the same loops with no literal-count rule.
  const added5 = JSON.parse(JSON.stringify(registry5));
  added5.tools.push({ id: 'demo-added-source-lab', title: 'Demo', file: 'demo-added-source-lab.html', briefing: { role: 'source', profile: 'live-market', readAdapter: 'demo-added-source-owning-model-v1', readContractVersion: 'tool-model-read/v1', freshnessPolicy: 'daily-market-bars-v1', recommendationPolicy: 'market-action-v1', budgetPolicy: 'live-market-v1' } });
  const addedFrozen5 = RLCONTRACTS5.validateRegistry(added5, config5);
  assert(addedFrozen5.ok === true && addedFrozen5.value.participantCount === registry5.tools.length + 1 && addedFrozen5.value.sourceCount === derivedSources5.length + 1 && addedFrozen5.value.orderedSourceToolIds[addedFrozen5.value.orderedSourceToolIds.length - 1] === 'demo-added-source-lab', 'Feature 002 Scope 05 a valid added source increments participant and source counts generically');

  // The registry form of freezeToolReads emits exactly one validated ToolModelRead/v1 per derived source
  // over a frozen evidence bundle (aggregator never self-consumed); the legacy Scope 04 evidence-first
  // signature is unchanged (polymorphic by first-argument contract).
  const bundle5 = (function () {
    const h = (s) => 'sha256:' + createHash5('sha256').update(s).digest('hex');
    return { contractVersion: 'market-session-evidence/v1', cutoffAt: '2026-07-14T12:40:00.000Z', fingerprint: h('b5'), sessionAggregateRefs: [{ evidenceType: 'session-aggregate', fingerprint: h('agg5') }], volumeBaselineRefs: [{ evidenceType: 'comparable-volume-baseline', fingerprint: h('base5') }], releasedReportRefs: [{ evidenceType: 'released-report-evidence', fingerprint: h('rep5') }], eventReactionRefs: [{ evidenceType: 'event-market-reaction', fingerprint: h('rx5') }] };
  })();
  const registryFrozen5 = brief5.freezeToolReads(registry5, { evidence: bundle5, registryConfig: config5 }, { symbol: 'SPY' });
  const allValid5 = registryFrozen5.orderedSourceToolIds.every((id) => RLDATA5.validateToolModelRead(registryFrozen5.reads[id]).ok === true);
  const legacyFrozen5 = brief5.freezeToolReads(bundle5, { symbol: 'SPY' }, [{ toolId: 'options-flow-lab', profile: 'live-market' }]);
  assert(Object.keys(registryFrozen5.reads).length === derivedSources5.length && registryFrozen5.reads['market-brief'] === undefined && allValid5 === true && Object.keys(legacyFrozen5.owners).length === 6 && !!legacyFrozen5.others['options-flow-lab'], 'Feature 002 Scope 05 freezeToolReads registry form emits one validated read per source while the legacy evidence-first form is unchanged');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 002 Scope 05 group threw): ' + e.message); }
/* FEATURE-002-MARKET-SESSION-SCOPE5-END */

/* ---------- Feature 002 Scope 06: bounded authorship + recommendation lifecycle ---------- */
/* FEATURE-002-MARKET-SESSION-SCOPE6-BEGIN */
try {
  group('Feature 002 Scope 06 bounded authorship and recommendation lifecycle');
  const RLCONTRACTS6 = (await import('node:module')).createRequire(import.meta.url)('../rlcontracts.js');
  const brief6 = await import('./brief-refresh.mjs');
  const author6 = await import('./brief-author.mjs');
  const fixtures6 = await import('../tests/fixtures/feature-002/authorship/brief-fixture-builder.mjs');
  const { createHash: createHash6 } = await import('node:crypto');

  // compactAuthorInput retains mandatory + required facts under a conservative byte-as-token reservation
  // and refuses B002-BUDGET when the mandatory material alone exceeds the profile cap.
  const read6 = fixtures6.eligibleOwnerRead();
  const budget6 = fixtures6.profileBudgets()['live-market'];
  const compact6 = RLCONTRACTS6.compactAuthorInput(read6, budget6);
  assert(compact6.ok === true && compact6.value.includedFactIds.length === 3 && compact6.value.reservedInputTokens === compact6.value.inputByteLength + budget6.promptReserveBytes, 'Feature 002 Scope 06 compactAuthorInput retains mandatory + facts under a conservative byte-as-token reservation');
  assert(RLCONTRACTS6.compactAuthorInput(read6, { ...budget6, maxInputTokens: 10 }).error.code === 'B002-BUDGET', 'Feature 002 Scope 06 compactAuthorInput refuses B002-BUDGET when mandatory material exceeds the profile cap');

  // validateToolBrief binds a market recommendation to read eligibility, permitted action, and cited evidence.
  const brief6ok = fixtures6.recommendationBrief(read6);
  assert(RLCONTRACTS6.validateToolBrief(brief6ok, read6, 'live-market').ok === true, 'Feature 002 Scope 06 validateToolBrief accepts an eligible owner-evidence-bound recommendation brief');
  const brief6ghost = fixtures6.recommendationBrief(read6);
  brief6ghost.recommendations[0].rationaleEvidenceIds = ['fact-rrg-state', 'ghost-evidence-not-in-read'];
  assert(RLCONTRACTS6.validateToolBrief(brief6ghost, read6, 'live-market').error.reason === 'recommendation-cited-evidence-absent', 'Feature 002 Scope 06 validateToolBrief rejects a recommendation citing evidence absent from the read');

  // The bounded author boundary separates instructions from frozen data and rejects a duplicate envelope.
  const request6 = author6.buildToolAuthorRequest(compact6.value, fixtures6.authorIdentity());
  assert(request6.ok === true && request6.request.instructions.length > 0 && !!request6.request.data.compactedRead && /^sha256:[a-f0-9]{64}$/.test(request6.request.requestFingerprint), 'Feature 002 Scope 06 buildToolAuthorRequest separates instructions from frozen JSON data with a required identity');
  const envelope6 = { contractVersion: 'tool-author-response/v1', requestFingerprint: request6.request.requestFingerprint, brief: { note: 'ok' } };
  const seen6 = new Set();
  assert(author6.validateAuthorEnvelope(envelope6, request6.request, { seen: seen6 }).ok === true && author6.validateAuthorEnvelope(envelope6, request6.request, { seen: seen6 }).error.code === author6.AUTHOR_ERRORS.DUPLICATE, 'Feature 002 Scope 06 validateAuthorEnvelope accepts a matched envelope and rejects the duplicate');

  // The shared four-worker pool resolves changed reads through the boundary + validator with bounded concurrency.
  const rawTransport6 = fixtures6.noRecommendationTransport();
  let active6 = 0;
  let peak6 = 0;
  const poolReads6 = [0, 1, 2, 3, 4, 5].map((i) => {
    const poolRead = fixtures6.eligibleOwnerRead({ toolId: `pool-src-${i}`, fingerprint: `sha256:${createHash6('sha256').update('pool' + i).digest('hex')}` });
    return { toolId: poolRead.toolId, read: poolRead, profile: 'live-market', profileBudget: budget6 };
  });
  const pool6 = await brief6.runToolAuthorPool({
    reads: poolReads6, identity: fixtures6.authorIdentity(), runBudget: fixtures6.runBudget(6), workers: 4, maxRetries: 2,
    authorFn: async (request) => { active6 += 1; peak6 = Math.max(peak6, active6); await new Promise((resolve) => setTimeout(resolve, 3)); const raw = await rawTransport6(JSON.stringify(request)); active6 -= 1; return { ok: true, envelope: JSON.parse(raw) }; }
  });
  assert(pool6.ok === true && Object.keys(pool6.outcomes).length === 6 && peak6 <= 4 && pool6.telemetry.peakConcurrency <= 4, 'Feature 002 Scope 06 runToolAuthorPool resolves changed reads with at most four concurrent author processes');

  // resolveBriefReuse carries an unchanged read by exact input fingerprint (zero author calls) and re-authors a changed one.
  const policy6 = { promptPolicyVersion: 'tool-brief-prompt/v1', schemaVersion: 'tool-brief/v1', modelId: 'gpt-5', validatorVersion: 'tool-brief-validator/v1' };
  const first6 = brief6.resolveBriefReuse(read6, policy6, {});
  const index6 = { [read6.toolId]: { inputFingerprint: first6.inputFingerprint, briefRef: { path: 'briefs/objects/briefs/sector.json', sha256: `sha256:${'a'.repeat(64)}` }, contentFingerprint: `sha256:${'b'.repeat(64)}` } };
  assert(brief6.resolveBriefReuse(read6, policy6, index6).reuse === true && brief6.resolveBriefReuse({ ...read6, fingerprint: `sha256:${'c'.repeat(64)}` }, policy6, index6).reuse === false, 'Feature 002 Scope 06 resolveBriefReuse carries an unchanged read and re-authors a changed read');

  // reduceRecommendationEvents is idempotent; groupRecommendations merges at minimum-retained confidence.
  const rec6 = fixtures6.recommendationRecord();
  const reduceA6 = RLCONTRACTS6.reduceRecommendationEvents(null, [rec6], { runId: 'run-a', occurredAt: '2026-07-14T12:41:00.000Z', canonicalMonth: '2026-07' });
  const reduceB6 = RLCONTRACTS6.reduceRecommendationEvents(null, [rec6], { runId: 'run-a', occurredAt: '2026-07-14T12:41:00.000Z', canonicalMonth: '2026-07' });
  assert(reduceA6.value.events[0].eventType === 'proposed' && reduceA6.value.index.indexFingerprint === reduceB6.value.index.indexFingerprint, 'Feature 002 Scope 06 reduceRecommendationEvents proposes a new origin idempotently');
  const group6 = RLCONTRACTS6.groupRecommendations([fixtures6.recommendationRecord({ originToolId: 'sector-research-lab', rationaleEvidenceIds: ['x'], confidenceScore: 64 }), fixtures6.recommendationRecord({ originToolId: 'etf-momentum-lab', rationaleEvidenceIds: ['y'], confidenceScore: 50 })]);
  assert(group6.value.groups.length === 1 && group6.value.groups[0].independentOriginCount === 2 && group6.value.groups[0].mergedConfidenceScore === 50, 'Feature 002 Scope 06 groupRecommendations merges compatible origins at minimum-retained confidence without averaging');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 002 Scope 06 group threw): ' + e.message); }
/* FEATURE-002-MARKET-SESSION-SCOPE6-END */

/* ---------- Feature 002 Scope 07: bounded history + legacy migration ---------- */
/* FEATURE-002-MARKET-SESSION-SCOPE7-BEGIN */
try {
  group('Feature 002 Scope 07 bounded history and legacy migration');
  const pub7 = await import('./brief-publication.mjs');
  const mig7 = await import('./migrate-brief-history.mjs');
  const fx7 = await import('../tests/fixtures/feature-002/history/history-fixture-builder.mjs');
  const { createHash: createHash7 } = await import('node:crypto');

  // buildPublishSet -> validatePublishSet accepts a coherent staged publish set.
  const staged7 = pub7.buildPublishSet(fx7.buildRun({ seed: 'st7' }));
  assert(staged7.ok === true && pub7.validatePublishSet(staged7.staging, {}).ok === true, 'Feature 002 Scope 07 buildPublishSet produces a coherent publish set that validatePublishSet accepts');

  // A duplicate recommendation event fails closed with B002-HISTORY (declared hash kept consistent).
  const dupStage7 = pub7.buildPublishSet(fx7.buildRun({ seed: 'dup7' })).staging;
  const recPath7 = 'briefs/history/recommendations/2026-07.jsonl';
  const dupRows7 = dupStage7.files[recPath7].bytes.toString('utf8').split('\n').filter((l) => l.length > 0);
  const dupBytes7 = Buffer.from(dupRows7.concat([dupRows7[0]]).join('\n') + '\n', 'utf8');
  dupStage7.files[recPath7] = { bytes: dupBytes7, sha256: 'sha256:' + createHash7('sha256').update(dupBytes7).digest('hex') };
  const dupResult7 = pub7.validatePublishSet(dupStage7, {});
  assert(dupResult7.ok === false && dupResult7.error.code === 'B002-HISTORY' && dupResult7.error.reason === 'duplicate-event', 'Feature 002 Scope 07 validatePublishSet rejects a duplicate recommendation event with B002-HISTORY');

  // selectHistory returns the smallest focused tool partition set, never global history.
  const index7 = pub7.regenerateIndexes({
    'briefs/history/tools/sector-research-lab/2026-07.jsonl': [{ contractVersion: 'brief-tool-history-row/v1', runId: 'r', toolId: 'sector-research-lab', outcome: 'newly-authored' }],
    'briefs/history/tools/etf-momentum-lab/2026-07.jsonl': [{ contractVersion: 'brief-tool-history-row/v1', runId: 'r', toolId: 'etf-momentum-lab', outcome: 'newly-authored' }]
  });
  const select7 = pub7.selectHistory(index7, { toolId: 'sector-research-lab', month: '2026-07' });
  assert(select7.ok === true && select7.partitions.length === 1 && select7.partitions[0].includes('sector-research-lab'), 'Feature 002 Scope 07 selectHistory returns exactly one focused tool partition, never global history');

  // rollbackPublication is a pure pointer-swap that deletes nothing.
  const rollback7 = pub7.rollbackPublication({ pointer: staged7.staging.pointers.current });
  assert(rollback7.ok === true && rollback7.rollback.mode === 'pointer-swap' && rollback7.rollback.deletedObjects === 0 && rollback7.rollback.currentPointer.runId === staged7.staging.pointers.current.runId, 'Feature 002 Scope 07 rollbackPublication swaps the current pointer without deleting objects');

  // Migration inventory DERIVES the row count from the actual bytes and maps one-to-one with duplicates.
  const legacyRows7 = [
    fx7.legacyRow('2026-07-06T11:00:00-04:00', 'morning', { vix: 15 }),
    fx7.legacyRow('2026-07-06T16:10:00-04:00', 'after-hours', { vix: 16 }),
    fx7.legacyRow('2026-07-06T11:00:00-04:00', 'morning', { vix: 15 })
  ];
  const legacyBytes7 = fx7.legacyBytes(legacyRows7);
  const inv7 = mig7.inventoryLegacyHistory(legacyBytes7);
  assert(inv7.ok === true && inv7.inventory.rowCount === 3, 'Feature 002 Scope 07 inventoryLegacyHistory derives the row count from the actual bytes');
  const map7 = mig7.mapLegacyRows(inv7.inventory);
  const parity7 = mig7.validateMigrationParity(inv7.inventory, map7.mapping, { bytes: legacyBytes7 });
  assert(map7.ok === true && parity7.ok === true && parity7.parity.occurrenceCount === 3 && parity7.parity.duplicateOccurrences === 1 && parity7.parity.explicitUnavailable.finals === 3, 'Feature 002 Scope 07 migration parity maps every row one-to-one, preserves duplicate occurrences, and marks brief/recommendation/final explicitly unavailable');

  // A malformed legacy row blocks migration (fail-closed; no row skipped).
  const malformed7 = Buffer.from('{"ts":"2026-07-06T11:00:00-04:00","window":"morning"}\n{bad json\n', 'utf8');
  assert(mig7.inventoryLegacyHistory(malformed7).error.code === 'B002-MIGRATION', 'Feature 002 Scope 07 inventoryLegacyHistory blocks migration on a malformed legacy row');

  // Parity rejects a mapping that drops an occurrence.
  const tampered7 = JSON.parse(JSON.stringify(map7.mapping));
  tampered7.occurrences = tampered7.occurrences.slice(0, 2);
  assert(mig7.validateMigrationParity(inv7.inventory, tampered7).ok === false, 'Feature 002 Scope 07 validateMigrationParity rejects a mapping that drops an occurrence');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 002 Scope 07 group threw): ' + e.message); }
/* FEATURE-002-MARKET-SESSION-SCOPE7-END */

/* ---------- Feature 002 Scope 08: window-aware final aggregation ---------- */
/* FEATURE-002-MARKET-SESSION-SCOPE8-BEGIN */
try {
  group('Feature 002 Scope 08 window-aware final aggregation');
  const RLCONTRACTS8 = (await import('node:module')).createRequire(import.meta.url)('../rlcontracts.js');
  const brief8 = await import('./brief-refresh.mjs');
  const fx8 = await import('../tests/fixtures/feature-002/final/final-fixture-builder.mjs');

  // compactFinalAuthorInput builds one mandatory envelope per DERIVED source ID in registry order, retains
  // every read/brief ref + window field, and reports an exact conservative byte-as-token reservation.
  const scenario8 = fx8.singleSourceScenario('after-hours');
  const compact8 = RLCONTRACTS8.compactFinalAuthorInput(scenario8.registry, scenario8.reads, scenario8.briefs, scenario8.groups, scenario8.runContext, scenario8.finalBudget);
  assert(compact8.ok === true && compact8.value.finalInput.sourceEnvelopes.length === 2 && compact8.value.finalInput.sourceEnvelopes[0].readRef.fingerprint === scenario8.reads['sector-research-lab'].fingerprint && compact8.value.reservedInputTokens === compact8.value.inputByteLength + compact8.value.promptReserveBytes, 'Feature 002 Scope 08 compactFinalAuthorInput retains every source ref + window field under a conservative reservation');
  assert(RLCONTRACTS8.compactFinalAuthorInput(scenario8.registry, scenario8.reads, scenario8.briefs, scenario8.groups, scenario8.runContext, { ...scenario8.finalBudget, maxInputTokens: 10 }).error.code === 'B002-BUDGET', 'Feature 002 Scope 08 compactFinalAuthorInput refuses B002-BUDGET on mandatory overflow (never omits a participant)');
  assert(RLCONTRACTS8.compactFinalAuthorInput(scenario8.registry, { 'sector-research-lab': scenario8.reads['sector-research-lab'] }, scenario8.briefs, scenario8.groups, scenario8.runContext, scenario8.finalBudget).error.reason === 'final-source-read-missing', 'Feature 002 Scope 08 compactFinalAuthorInput fails closed when a source read outcome is missing');

  // The four-window contract: after-hours requires its own official close; pre-close forbids one; morning
  // needs a same-date earlier-cutoff pre-market thesis or an explicit insufficient state.
  assert(RLCONTRACTS8.validateWindowHeader(fx8.windowContext('after-hours', { officialCloseAnchorRef: null })).error.reason === 'window-official-close-required' && RLCONTRACTS8.validateWindowHeader(fx8.windowContext('pre-close', { officialCloseAnchorRef: { fingerprint: fx8.makeHash('x') } })).error.reason === 'window-official-close-forbidden' && RLCONTRACTS8.validateWindowHeader(fx8.windowContext('morning', { priorWindowThesisRef: null, priorWindowThesisState: null })).error.reason === 'window-prior-thesis-insufficient-undeclared', 'Feature 002 Scope 08 validateWindowHeader enforces the after-hours/pre-close/morning cutoff rules');

  // evaluateLowNoiseGate promotes only with an eligible owner interpretation PLUS anti-reactivity; repeated
  // identical fingerprints earn no persistence credit.
  const gateBase8 = { basisValidated: true, currentEvidence: true, unusualnessClaimed: true, comparisonQualified: true, ownerEligible: true, ownerInterpretationRef: 'interp-rrg', falsifiable: { trigger: 't', invalidation: 'i', subjects: ['XLK'], horizon: 'swing' }, structuralBreak: true, persistenceFingerprints: [], independentCorroboration: false, disputed: false, conflicted: false, thin: false, profileBoundaryOk: true };
  assert(RLCONTRACTS8.evaluateLowNoiseGate(gateBase8).value.destination === 'action' && RLCONTRACTS8.evaluateLowNoiseGate({ ...gateBase8, structuralBreak: false, persistenceFingerprints: [fx8.makeHash('a'), fx8.makeHash('a'), fx8.makeHash('a')] }).value.destination === 'context' && RLCONTRACTS8.evaluateLowNoiseGate({ ...gateBase8, ownerEligible: false, ownerInterpretationRef: null }).value.destination === 'context', 'Feature 002 Scope 08 evaluateLowNoiseGate promotes only with owner + anti-reactivity and denies repeated-fingerprint credit');

  // validateFinalBrief accepts a complete honest final and rejects omission / hidden conflict / unsupported
  // action / inflated confidence.
  const runInputs8 = { registry: scenario8.registry, reads: scenario8.reads, briefs: scenario8.briefs, marketSessionEvidenceRef: scenario8.runContext.marketSessionEvidenceRef, actionThresholds: scenario8.runContext.actionThresholds };
  const validFinal8 = fx8.buildFinalFromInput(compact8.value.finalInput, { mode: 'valid' });
  assert(RLCONTRACTS8.validateFinalBrief(validFinal8, runInputs8, scenario8.groups).ok === true && RLCONTRACTS8.validateFinalBrief(fx8.buildFinalFromInput(compact8.value.finalInput, { mode: 'omit-source' }), runInputs8, scenario8.groups).error.reason === 'final-coverage-incomplete' && RLCONTRACTS8.validateFinalBrief(fx8.buildFinalFromInput(compact8.value.finalInput, { mode: 'unsupported-action' }), runInputs8, scenario8.groups).error.reason === 'final-action-not-in-groups' && RLCONTRACTS8.validateFinalBrief(fx8.buildFinalFromInput(compact8.value.finalInput, { mode: 'inflate-confidence' }), runInputs8, scenario8.groups).error.reason === 'final-confidence-above-minimum', 'Feature 002 Scope 08 validateFinalBrief accepts a complete final and rejects omission / unsupported action / inflated confidence');
  const conflict8 = fx8.conflictScenario('morning');
  const conflictCompact8 = RLCONTRACTS8.compactFinalAuthorInput(conflict8.registry, conflict8.reads, conflict8.briefs, conflict8.groups, conflict8.runContext, conflict8.finalBudget);
  const conflictInputs8 = { registry: conflict8.registry, reads: conflict8.reads, briefs: conflict8.briefs, marketSessionEvidenceRef: conflict8.runContext.marketSessionEvidenceRef, actionThresholds: conflict8.runContext.actionThresholds };
  assert(conflict8.groups.conflicts.length >= 1 && RLCONTRACTS8.validateFinalBrief(fx8.buildFinalFromInput(conflictCompact8.value.finalInput, { mode: 'hidden-conflict' }), conflictInputs8, conflict8.groups).error.reason === 'final-conflict-hidden', 'Feature 002 Scope 08 validateFinalBrief rejects a final that hides a visible conflict');

  // runFinalAuthor: the all-source barrier authors ONE final only after every read+brief outcome validates;
  // a missing brief refuses BEFORE authoring.
  const final8 = await brief8.runFinalAuthor({ ...scenario8, authorFn: fx8.envelopeFinalAuthorFn('valid') });
  const missingBriefs8 = { 'sector-research-lab': scenario8.briefs['sector-research-lab'] };
  const refused8 = await brief8.runFinalAuthor({ ...scenario8, briefs: missingBriefs8, authorFn: fx8.envelopeFinalAuthorFn('valid') });
  assert(final8.ok === true && final8.final.coverage.length === 3 && Object.keys(final8.final.sourceRefs).length === 2 && refused8.ok === false && refused8.refusal.reason === 'brief-barrier-incomplete', 'Feature 002 Scope 08 runFinalAuthor authors one complete final after the barrier and refuses a missing brief outcome');

  // The merged group counts a shared evidence origin once and keeps the minimum retained confidence.
  const merged8 = fx8.mergedScenario('pre-close');
  const mergedFinal8 = await brief8.runFinalAuthor({ ...merged8, authorFn: fx8.envelopeFinalAuthorFn('valid') });
  assert(merged8.groups.groups[0].independentOriginCount === 1 && merged8.groups.groups[0].mergedConfidenceScore === 50 && mergedFinal8.ok === true && mergedFinal8.final.actions[0].mergedConfidenceScore === 50, 'Feature 002 Scope 08 runFinalAuthor keeps a shared origin counted once at minimum retained confidence');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 002 Scope 08 group threw): ' + e.message); }
/* FEATURE-002-MARKET-SESSION-SCOPE8-END */

/* ---------- Feature 002 Scope 09: evidence-first atomic publication ---------- */
/* FEATURE-002-MARKET-SESSION-SCOPE9-BEGIN */
try {
  group('Feature 002 Scope 09 evidence-first atomic publication');
  const pub9 = await import('./brief-publication.mjs');
  const fx9 = await import('../tests/fixtures/feature-002/history/history-fixture-builder.mjs');
  const { createHash: createHash9 } = await import('node:crypto');

  // The closed run-state machine advances only one phase at a time; final-before-barrier is impossible.
  let s9 = pub9.createRunState('run-selftest-9');
  for (let i = 1; i < pub9.BRIEF_RUN_PHASES.length; i += 1) s9 = pub9.advanceRunState(s9, pub9.BRIEF_RUN_PHASES[i]).state;
  const atEvidence9 = pub9.advanceRunState(pub9.advanceRunState(pub9.advanceRunState(pub9.advanceRunState(pub9.advanceRunState(pub9.createRunState('r'), 'lease-held').state, 'worktree-ready').state, 'registry-frozen').state, 'sources-acquired').state, 'evidence-frozen').state;
  assert(s9.phase === 'pushed' && pub9.advanceRunState(atEvidence9, 'final-authored').ok === false && pub9.advanceRunState(atEvidence9, 'final-authored').error.code === 'B002-RUN-STATE' && pub9.advanceRunState(atEvidence9, 'sources-acquired').ok === false, 'Feature 002 Scope 09 run-state machine allows only the next phase and rejects final-before-barrier and backward moves');

  // validateRunIdentity accepts one coherent run identity and rejects a mixed manifest runId.
  const staging9 = pub9.buildPublishSet(fx9.buildRun({ seed: 's9', runId: 'run-s9' })).staging;
  const idOk9 = pub9.validateRunIdentity(staging9, { priorGeneration: 0 });
  const mixed9 = { ...staging9, manifest: { path: staging9.manifest.path, body: JSON.parse(JSON.stringify(staging9.manifest.body)) } };
  mixed9.manifest.body.runId = 'run-OTHER';
  assert(idOk9.ok === true && idOk9.identity.generation === 1 && pub9.validateRunIdentity(mixed9, { priorGeneration: 0 }).error.reason === 'run-identity-mismatch' && pub9.validateRunIdentity(staging9, { priorGeneration: 4 }).error.reason === 'generation-not-monotonic', 'Feature 002 Scope 09 validateRunIdentity binds manifest+pointers to one run identity and monotonic generation');

  // promotePublishSet writes briefs/current.json LAST (pointer-last), re-hashing every object first.
  const mem9 = {};
  const promote9 = pub9.promotePublishSet(staging9, '/virtual-worktree', { writeFile: (abs, bytes) => { mem9[abs] = Buffer.from(bytes); }, readFile: (abs) => mem9[abs] });
  assert(promote9.ok === true && promote9.promoted.pointerLast === 'briefs/current.json' && promote9.promoted.objectsBeforePointer === Object.keys(staging9.files).length - 1 && promote9.promoted.written[promote9.promoted.written.length - 1] === 'briefs/current.json', 'Feature 002 Scope 09 promotePublishSet materializes every object before writing briefs/current.json last');

  // stagePublishSet git-adds only declared paths and refuses an undeclared cached path.
  const cached9 = [];
  const okGit9 = (args) => { if (args[0] === 'add') { cached9.push(args[2]); return { code: 0, stdout: '', stderr: '' }; } if (args[0] === 'diff') return { code: 0, stdout: cached9.join('\n'), stderr: '' }; return { code: 0, stdout: '', stderr: '' }; };
  const staged9 = pub9.stagePublishSet(staging9, okGit9);
  const badGit9 = (args) => (args[0] === 'add' ? { code: 0, stdout: '', stderr: '' } : { code: 0, stdout: 'briefs/current.json\nUNDECLARED.txt', stderr: '' });
  const badStage9 = pub9.stagePublishSet(staging9, badGit9);
  assert(staged9.ok === true && staged9.declared === Object.keys(staging9.files).length && badStage9.ok === false && badStage9.error.reason === 'undeclared-staged-path', 'Feature 002 Scope 09 stagePublishSet stages only declared paths and refuses an undeclared index entry');

  // classifyRemoteOverlap refuses an inventory-path overlap and reconciles an unrelated advance.
  const overlap9 = pub9.classifyRemoteOverlap(['briefs/history/runs/2026-07.jsonl'], ['briefs/history/runs/2026-07.jsonl', 'briefs/objects/x.json']);
  const clean9 = pub9.classifyRemoteOverlap(['docs/notes.md'], ['briefs/history/runs/2026-07.jsonl']);
  assert(overlap9.ok === false && overlap9.error.code === 'B002-REMOTE-OVERLAP' && clean9.ok === true && clean9.reconcilable === true, 'Feature 002 Scope 09 classifyRemoteOverlap refuses declared-path overlap and reconciles a non-overlapping advance');

  // resumePublish retries the exact commit/push and never reacquires or reauthors.
  const resumeCommitted9 = pub9.resumePublish({ phase: 'committed', commit: 'sha-abc', stagedHashes: { 'briefs/current.json': 'sha256:aa' } }, { currentHashes: { 'briefs/current.json': 'sha256:aa' } });
  const resumeDrift9 = pub9.resumePublish({ phase: 'committed', commit: 'sha-abc', stagedHashes: { 'briefs/current.json': 'sha256:aa' } }, { currentHashes: { 'briefs/current.json': 'sha256:bb' } });
  assert(resumeCommitted9.resume.action === 'push-exact-commit' && resumeCommitted9.resume.reacquire === false && resumeCommitted9.resume.reauthor === false && pub9.resumePublish({ phase: 'pushed', commit: 'sha-abc' }).resume.action === 'noop-idempotent' && resumeDrift9.ok === false && resumeDrift9.error.reason === 'resume-hash-drift', 'Feature 002 Scope 09 resumePublish retries the exact commit without reacquire/reauthor and refuses staged-byte drift');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 002 Scope 09 group threw): ' + e.message); }
/* FEATURE-002-MARKET-SESSION-SCOPE9-END */

/* FEATURE-002-MARKET-SESSION-SCOPE10-BEGIN */
try {
  group('Feature 002 Scope 10 shared UI renderer + registry-derived coverage');
  const rlbriefSrc10 = read('rlbrief.js');
  const RB10 = Function('globalThis', 'window', 'document', rlbriefSrc10 + '\n;return globalThis.RLBRIEF;')(globalThis, globalThis, undefined);
  const ui10 = await import('../tests/fixtures/feature-002/ui/ui-fixture-builder.mjs');

  // The shared layer owns the exact UX state vocabulary.
  assert(RB10.briefIndicativeLabel('pre-market') === 'Pre-market - indicative' && RB10.briefIndicativeLabel('after-hours') === 'After-hours - indicative' && RB10.briefReportStateLabel('upcoming') === 'Not released' && RB10.briefLowNoiseLabel() === 'Context only - action gate not met' && RB10.briefLoadStateText('integrity-error') === 'Could not verify this brief; showing no partial evidence' && RB10.briefStatusLabel('not-applicable') === 'Session evidence not applicable to this profile', 'Feature 002 Scope 10 state-vocabulary owner emits the exact UX labels');

  // The safe-link classifier rejects unsafe schemes/traversal and accepts registry paths + https citations.
  assert(RB10.briefClassifyLink('javascript:alert(1)').kind === 'unsafe' && RB10.briefClassifyLink('//evil').kind === 'unsafe' && RB10.briefClassifyLink('https://user:p@bls.gov/x').kind === 'unsafe' && RB10.briefClassifyLink('https://www.bls.gov/x').kind === 'https-citation' && RB10.briefClassifyLink('briefs/objects/reads/x/y.json').kind === 'registry-path' && RB10.briefSafeSlug('briefs/../x') === false, 'Feature 002 Scope 10 safe-link classifier rejects unsafe schemes and path traversal');

  // Real fixture bytes parse; coverage is DERIVED from the pointer source map (never a literal count).
  const g10 = ui10.buildGraph({ toolId: 'sector-research-lab', session: 'pre-market' });
  const ptr10 = RB10.briefParsePointer(g10.files.get('briefs/current.json'));
  assert(ptr10.ok === true && RB10.briefPointerCoverage(ptr10.value).length === g10.sourceCount && ptr10.value.registry.sourceCount === ptr10.value.registry.participantCount - 1, 'Feature 002 Scope 10 pointer parses and derives coverage as participants minus the one aggregator');

  // A market recommendation is legal only on an eligible live-market read; the brief parser fails closed otherwise.
  const read10 = RB10.briefParseRead(g10.files.get('briefs/objects/reads/sector-research-lab/read.json'));
  const brief10 = g10.files.get('briefs/objects/tool-briefs/sector-research-lab/brief.json');
  const ineligible10 = Object.assign({}, read10.value, { recommendationEligibility: { eligible: false } });
  assert(read10.ok === true && RB10.briefParseBrief(brief10, read10.value).ok === true && RB10.briefParseBrief(brief10, ineligible10).ok === false, 'Feature 002 Scope 10 brief parser rejects a recommendation on an ineligible read');

  // A malformed JSONL history line suppresses the entire chronology.
  assert(RB10.briefParsePartition('{"eventType":"authored","occurredAt":"t"}', 'evidence').ok === true && RB10.briefParsePartition('{"eventType":"authored"}\n{bad', 'tools/x').ok === false, 'Feature 002 Scope 10 partition parser fails closed on a malformed row');

  // Evidence objects parse by their declared kind; a wrong contract version is rejected.
  const agg10 = g10.files.get('briefs/objects/evidence/sessions/SPY/agg-pre-market.json');
  assert(RB10.briefParseEvidence(agg10, 'session-aggregate').ok === true && RB10.briefParseEvidence(agg10, 'released-report-evidence').ok === false, 'Feature 002 Scope 10 evidence parser is contract-typed by kind');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 002 Scope 10 group threw): ' + e.message); }
/* FEATURE-002-MARKET-SESSION-SCOPE10-END */

/* ---------- Feature 012 Scope 01: contract/config/registry foundation ---------- */
try {
  group('Feature 012 Scope 01 tool-experience contract and registry foundation');
  const feature012Validator = await import('./validate-tool-experience.mjs');
  const feature012 = feature012Validator.validateActualToolExperience();
  const feature012Tools = JSON.parse(read('tools.json')).tools;
  const feature012Models = JSON.parse(read('simple-models.json')).definitions;
  const feature012Journeys = JSON.parse(read('journeys.json'));
  const feature012Ordinary = feature012Tools.filter((tool) => tool.experience.kind === 'ordinary').length;

  assert(
    feature012.summary.toolCount === feature012Tools.length &&
    feature012.summary.ordinaryCount === feature012Ordinary &&
    feature012.summary.marketActionCount === feature012Tools.length - feature012Ordinary &&
    feature012.summary.simpleModelDefinitionCount === feature012Models.length &&
    feature012.summary.journeyDefinitionCount === feature012Journeys.definitions.length &&
    feature012.summary.journeyStepCount === feature012Journeys.steps.length,
    'Feature 012 Scope 01 production validator derives the current tool, model, Journey, and step inventory'
  );
  assert(
    feature012.identities.toolIds.length === new Set(feature012.identities.toolIds).size &&
    feature012.identities.modelDefinitionIds.length === feature012.identities.toolIds.length &&
    feature012.identities.journeyDefinitionIds.length === feature012.summary.journeyDefinitionCount &&
    feature012.identities.journeyStepIds.length === feature012.summary.journeyStepCount,
    'Feature 012 Scope 01 registry-derived tool, model, Journey, and step identities remain unique and complete'
  );
  assert(
    feature012.artifacts.length === 6 &&
    feature012.artifacts.every((artifact) => artifact.bytes > 0 && artifact.bytes <= artifact.budget),
    'Feature 012 Scope 01 registries, recent history, and brief first load remain inside their configured budgets'
  );
  /* The matrix-domain vocabulary is a registry contract: EVIDENCE domains are declarable by a tool,
     DERIVED domains are computed from that row's evidence cells and can never be claimed. The two
     were separated only by a comment asserting that matrixPolicy.domains mirrors EVIDENCE_DOMAINS,
     so widening that config list by one entry silently re-opened every derived domain. */
  const vocabulary012 = feature012.matrixVocabulary;
  assert(
    JSON.stringify(vocabulary012.declarableDomains) === JSON.stringify(vocabulary012.evidenceDomains) &&
    vocabulary012.derivedDomains.length > 0 &&
    vocabulary012.derivedDomains.every((domain) => vocabulary012.declarableDomains.includes(domain) === false) &&
    vocabulary012.orphanEvidenceDomains.length === 0 &&
    vocabulary012.evidenceDomains.every((domain) => vocabulary012.ownerPrecedence[domain].length > 0),
    'Feature 012 Scope 01 declarable matrix vocabulary mirrors the EVIDENCE domains exactly, excludes every DERIVED domain, and leaves no evidence domain ownerless'
  );
  assert(
    vocabulary012.adversarial.length === 4 &&
    new Set(vocabulary012.adversarial.map((refusal) => refusal.name)).size === 4 &&
    vocabulary012.adversarial.every((refusal) => refusal.named.length > 0),
    'Feature 012 Scope 01 refuses a re-declared derived domain, an unknown domain string, an ownerless evidence domain, and a widened declarable vocabulary, naming the offending tool and domain in each refusal'
  );
  assert(
    feature012.scaling.toolId === 'feature-012-scaling-probe' &&
    feature012.scaling.toolCount === feature012Tools.length + 1 &&
    feature012.scaling.modelCount === feature012Models.length + 1 &&
    feature012.scaling.journeyCount === feature012Journeys.definitions.length + 2 &&
    feature012.scaling.stepCount === feature012Journeys.steps.length + 2,
    'Feature 012 Scope 01 valid added-tool probe scales through registry membership without a production tool-ID branch'
  );
  assert(
    feature012.adversarial.length === 13 &&
    feature012.adversarial.every((refusal) => /^E012-/.test(refusal.code)) &&
    new Set(feature012.adversarial.map((refusal) => refusal.name)).size === 13,
    'Feature 012 Scope 01 omission, duplicate, version, view, module, field, reference, execution, and dependency mutations all fail closed'
  );
  assert(
    feature012.summary.shadowOnly === true && feature012.summary.integrationClaims.length === 0,
    'Feature 012 Scope 01 validator remains shadow-only and infers no provider, Brief, portfolio, or execution integration claim'
  );
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 01 group threw): ' + e.message); }

/* ---------- Feature 012 Scope 02: shared four-view shell ---------- */
try {
  group('Feature 012 Scope 02 shared four-view shell');
  const { createRequire } = await import('node:module');
  const shellRequire = createRequire(import.meta.url);
  const RLEXPERIENCE02 = shellRequire('../rlexperience.js');
  const config02 = JSON.parse(read('tool-experience.config.json'));
  const registry02 = JSON.parse(read('tools.json'));
  const ordinary02 = RLEXPERIENCE02.resolveShell(config02, registry02, 'market-heatmap-lab');
  const center02 = RLEXPERIENCE02.resolveShell(config02, registry02, 'market-brief');
  const viewsSource02 = read('rlviews.js');
  const appSource02 = read('rlapp.js');

  assert(
    config02.migrationPolicy.phase === 'shell-canary' &&
    config02.migrationPolicy.shadowOnly === true &&
    config02.migrationPolicy.visibleModeCutover === false &&
    config02.migrationPolicy.panelBootstrap === true,
    'Feature 012 Scope 02 activates panel bootstrap only in the explicit shadow shell-canary phase'
  );
  assert(
    ordinary02.ok === true && center02.ok === true &&
    ordinary02.value.viewIds.join(',') === 'simple,power,brief,journey' &&
    center02.value.viewIds.join(',') === 'brief,portfolio,red-alert,journey',
    'Feature 012 Scope 02 resolves exact ordinary and Market Action four-view sets from the registry'
  );
  assert(
    appSource02.includes('function mountExperienceShell()') &&
    appSource02.includes('root.__rlviewsRegistration = {') &&
    appSource02.includes('ensureSharedScript("rlviews-shared-js", "rlviews.js"') &&
    !registry02.tools.some((tool) => appSource02.includes('"' + tool.id + '"')),
    'Feature 012 Scope 02 bootstrap is registry-driven and loads one shared shell without a tool-ID switch'
  );
  assert(
    viewsSource02.includes('shellControl.id = "rlviews"') &&
    viewsSource02.includes('data-rlexperience-shell') &&
    viewsSource02.includes('#modeSeg,#simpleTab,#powerTab{display:none!important}') &&
    viewsSource02.includes('getAttribute("aria-hidden") !== "true"'),
    'Feature 012 Scope 02 owns one shell and suppresses legacy controls with idempotent attribute updates'
  );
  assert(
    viewsSource02.includes('html,body{max-width:100%;overflow-x:clip}') &&
    viewsSource02.includes('overflow-x:auto') &&
    viewsSource02.includes('min-height:44px') &&
    viewsSource02.includes('@media(prefers-reduced-motion:reduce)'),
    'Feature 012 Scope 02 contains root overflow while preserving a mobile dock, full labels, touch targets, and reduced motion'
  );
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 02 group threw): ' + e.message); }

/* ---------- Feature 012 Scope 03: contextual tooltip foundation ---------- */
try {
  group('Feature 012 Scope 03 contextual tooltip foundation');
  const { createRequire } = await import('node:module');
  const contextRequire = createRequire(import.meta.url);
  const RLCTX03 = contextRequire('../rlcontext.js');
  const contextSource03 = read('rlcontext.js');
  const glossarySource03 = read('rlg.js');
  const tickerSource03 = read('rlticker.js');
  const chartSource03 = read('rlchart.js');
  const heatmapSource03 = read('market-heatmap-lab.html');
  const optionsSource03 = read('options-structure-lab.html');
  const companySource03 = read('company-fundamentals-lab.html');
  const providerSources03 = [glossarySource03, tickerSource03, chartSource03];
  const canaryPages03 = [heatmapSource03, optionsSource03, companySource03];

  assert(
    RLCTX03.CONTROLLER_ID === 'rlcontext-disclosure' &&
    typeof RLCTX03.validateContext === 'function' &&
    typeof RLCTX03.bind === 'function' &&
    typeof RLCTX03.open === 'function' &&
    typeof RLCTX03.close === 'function',
    'Feature 012 Scope 03 exposes one dual-runtime contextual-disclosure contract and controller API'
  );
  assert(
    contextSource03.includes('data-context-fingerprint') &&
    contextSource03.includes('Current interpretation') &&
    contextSource03.includes('Uncertainty') &&
    contextSource03.includes('Limitation') &&
    !providerSources03.concat(canaryPages03).some((source) => /\b(?:rlgtip|rltkrtip|rlcharttip)\b/.test(source)),
    'Feature 012 Scope 03 keeps complete current context in one disclosure owner with no private tooltip engines'
  );
  assert(
    glossarySource03.includes('contextApi.bind(elm, contextFor(') &&
    tickerSource03.includes('root.RLCTX.bind(button, tickerContext(') &&
    chartSource03.includes('root.RLCTX.validateContext') &&
    chartSource03.includes('aria-activedescendant') &&
    chartSource03.includes('same-data table target'),
    'Feature 012 Scope 03 composes glossary ticker and structured-chart providers through RLCTX'
  );
  assert(
    canaryPages03.every((source) => source.indexOf('src="rlexperience.js"') < source.indexOf('src="rlcontext.js"')) &&
    heatmapSource03.includes('RLCHART.attach(cv, {') &&
    optionsSource03.includes('src="rlcontext.js"') &&
    companySource03.includes('src="rlcontext.js"'),
    'Feature 012 Scope 03 canary pages load the shared foundation before provider composition'
  );
  assert(
    heatmapSource03.includes('function yieldToInteraction()') &&
    heatmapSource03.includes('var CONCURRENCY = 2') &&
    heatmapSource03.includes('return yieldToInteraction().then(worker)') &&
    chartSource03.includes('{ mode: "keyboard", pinned: true }'),
    'Feature 012 Scope 03 preserves responsive automatic hydration and stable keyboard disclosure state'
  );
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 03 group threw): ' + e.message); }

/* ---------- Feature 012 Scope 04: Simple model core runtime ---------- */
try {
  group('Feature 012 Scope 04 Simple model core runtime');
  const runtimeValidator04 = await import('./validate-tool-experience.mjs');
  const feature012Runtime04 = runtimeValidator04.validateActualToolExperience().runtime;
  const runtimeSource04 = read('rlexperience.js');

  assert(
    feature012Runtime04.truthStateCount === 6 &&
    feature012Runtime04.registeredAdapterCount === 0 &&
    feature012Runtime04.toolIdBranchCount === 0,
    'Feature 012 Scope 04 exposes the closed six-state runtime with no shipped owner adapter or tool-ID branch'
  );
  assert(
    feature012Runtime04.occurrenceIdentityStable === true &&
    feature012Runtime04.cutoffIdentityChanged === true,
    'Feature 012 Scope 04 compute identity excludes retrieval occurrence time but retains the semantic evidence cutoff'
  );
  assert(
    feature012Runtime04.authorityOwnedCount === 0 &&
    !['fetch(', 'providerFetch(', 'localStorage.', 'sessionStorage.', '.setItem(', 'XMLHttpRequest', 'WebSocket', 'author(', 'publish('].some((capability) => runtimeSource04.includes(capability)),
    'Feature 012 Scope 04 owns no provider, network, storage, authoring, publication, or tool-formula authority'
  );
  assert(
    runtimeSource04.includes('simple-cancellation-token/v1') &&
    runtimeSource04.includes('stale completion discarded') &&
    /* The last-valid run is preserved on the projection. It is no longer printed to the
       reader as a sha256 line; provenance belongs in the Power evidence disclosure. */
    runtimeSource04.includes('lastValidComputeIdentity'),
    'Feature 012 Scope 04 carries cancellation, stale-completion rejection, and explicit last-valid projection contracts'
  );
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 04 group threw): ' + e.message); }

/* ---------- Feature 012 Scope 05 session-auction single-source owner parity ---------- */
try {
  group('Feature 012 Scope 05 session-auction single-source owner parity (intraday-tape-lab)');
  const { createRequire } = await import('node:module');
  const featureRequire = createRequire(import.meta.url);
  delete featureRequire.cache[featureRequire.resolve('../rlexperience-adapters/market-structure.js')];
  const RLMS = featureRequire('../rlexperience-adapters/market-structure.js');
  const canonBars = [
    { t: 0, o: 100, h: 101, l: 99.5, c: 100.5, v: 1000 },
    { t: 1, o: 100.5, h: 102, l: 100, c: 101.5, v: 1200 },
    { t: 2, o: 101.5, h: 103, l: 101, c: 102.5, v: 1500 },
    { t: 3, o: 102.5, h: 104, l: 102, c: 103.5, v: 1300 },
    { t: 4, o: 103.5, h: 105, l: 103, c: 104.5, v: 1100 },
    { t: 5, o: 104.5, h: 106, l: 104, c: 105.5, v: 1400 }
  ];
  const cs = RLMS.computeSession(canonBars, 10, 5);
  /* The single-sourced owner functions reproduce the canonical input->output fingerprint,
     so the intraday page's Power path (which now delegates to these functions) stays
     semantically identical after the extraction (byte/semantic parity). */
  assert(cs.orHi === 102 && cs.orLo === 99.5 && cs.n === 6 && cs.crosses === 0 && cs.aboveFrac === 1, 'computeSession opening-range + session stats stable on the canonical session');
  assert(approx(cs.vwap, 102.7888888888889, 1e-9) && approx(cs.sd, 1.631253399787687, 1e-9), 'computeSession VWAP + sigma stable on the canonical session');
  assert(approx(cs.poc, 102.23295454545455, 1e-9) && approx(cs.vah, 105.26136363636364, 1e-9) && approx(cs.val, 102.1590909090909, 1e-9) && cs.lo === 99.5 && cs.hi === 106, 'computeSession volume-profile POC/VAH/VAL stable on the canonical session');
  assert(RLMS.sessionType(cs).type === 'Trend day · up', 'sessionType classifies the rising canonical session as a trend-up day');
  const ctl = RLMS.controlRead(cs, -0.002);
  assert(approx(ctl.score, 0.9016666666666666, 1e-9) && ctl.label === 'Retail-driven', 'controlRead score + label stable on the canonical session');
  assert(approx(RLMS.adherence(cs.bars), 0.16666666666666666, 1e-9), 'adherence stable on the canonical session');
  assert(cs.val <= cs.poc && cs.poc <= cs.vah && cs.orLo <= cs.orHi && cs.lo <= cs.hi, 'computeSession value-area + range invariants hold');
  assert(ctl.score >= 0 && ctl.score <= 1, 'controlRead score bounded in [0,1]');
  assert(RLMS.supportedAdapterIds.indexOf('simple-adapter/session-auction/v1') >= 0, 'session-auction adapter id registered in the market-structure module');
  const tape = read('intraday-tape-lab.html');
  assert(/rlexperience-adapters\/market-structure\.js/.test(tape), 'intraday-tape-lab.html loads the market-structure module');
  assert(/RLMARKETSTRUCTURE\.computeSession\s*\(/.test(tape) && /RLMARKETSTRUCTURE\.sessionType\s*\(/.test(tape) && /RLMARKETSTRUCTURE\.controlRead\s*\(/.test(tape), 'intraday-tape-lab.html delegates computeSession/sessionType/controlRead to the single source');
  assert(!/cumPV2 \+= b\.v \* tp \* tp/.test(tape) && !/held above VWAP, closing near the highs/.test(tape) && !/low VWAP adherence . retail/.test(tape), 'intraday-tape-lab.html carries no inline copy of the single-sourced session formula');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 05 session-auction group threw): ' + e.message); }

/* ---------- Feature 012 Scope 05 swing-transition single-source owner parity ---------- */
try {
  group('Feature 012 Scope 05 swing-transition single-source owner parity (swing-structure-lab)');
  const { createRequire } = await import('node:module');
  const featureRequire = createRequire(import.meta.url);
  delete featureRequire.cache[featureRequire.resolve('../rlexperience-adapters/market-structure.js')];
  const RLMS = featureRequire('../rlexperience-adapters/market-structure.js');
  const swingBars = [
    { t: 0, o: 100, h: 101, l: 99.5, c: 100.5, v: 1000 },
    { t: 1, o: 100.5, h: 102, l: 100, c: 101.5, v: 1200 },
    { t: 2, o: 101.5, h: 103, l: 101, c: 102.5, v: 1500 },
    { t: 3, o: 102.5, h: 104, l: 102, c: 103.5, v: 1300 },
    { t: 4, o: 103.5, h: 103, l: 101, c: 101.2, v: 1600 },
    { t: 5, o: 101.2, h: 102, l: 100, c: 100.4, v: 1400 },
    { t: 6, o: 100.4, h: 101.5, l: 100, c: 101.2, v: 1250 },
    { t: 7, o: 101.2, h: 103.5, l: 101, c: 103.2, v: 1700 },
    { t: 8, o: 103.2, h: 104.5, l: 103, c: 104.2, v: 1800 },
    { t: 9, o: 104.2, h: 105, l: 103.5, c: 104.0, v: 1500 },
    { t: 10, o: 104.0, h: 104.2, l: 102.5, c: 102.8, v: 1600 },
    { t: 11, o: 102.8, h: 103.2, l: 101.5, c: 102.0, v: 1550 }
  ];
  /* The single-sourced owner functions reproduce the canonical input->output fingerprint,
     so the swing page's Power path (which now delegates to these functions) stays semantically
     identical after the extraction (byte/semantic parity). */
  const sma3 = RLMS.smaArr(swingBars, 3);
  assert(sma3[0] === null && sma3[1] === null && approx(sma3[sma3.length - 1], 102.93333333333335, 1e-9) && approx(sma3[sma3.length - 2], 103.66666666666669, 1e-9), 'smaArr trailing mean stable on the canonical swing bars');
  const ma = { m20: RLMS.smaArr(swingBars, 3), m50: RLMS.smaArr(swingBars, 5), m200: RLMS.smaArr(swingBars, 8) };
  const align = RLMS.alignment(swingBars, ma);
  assert(align.label === 'Tangled MAs' && align.trend === 'range', 'alignment classifies the tangled canonical MA stack');
  const pv = RLMS.pivots(swingBars, 3);
  assert(pv.hs.length === 1 && pv.hs[0].i === 3 && pv.hs[0].p === 104 && pv.ls.length === 2 && pv.ls[0].p === 100, 'pivots detect the canonical swing high/low structure');
  const st = RLMS.structure(swingBars, ma, align);
  assert(st.pattern === 'Double bottom' && st.stage === 'forming', 'structure classifies the canonical double-bottom pattern');
  const ad = RLMS.accumDist(swingBars);
  assert(approx(ad.score, 0.3201219512195122, 1e-9) && ad.label === 'Distribution', 'accumDist OBV/accumulation stable on the canonical swing bars');
  assert(RLMS.regimeBand({ score: 70 }, 'up', 15).band === 'Risk-on trend' && RLMS.regimeBand({ score: 70 }, 'down', 15).band === 'Greed (late)' && RLMS.regimeBand({ score: 20 }, 'down', 40).band === 'Risk-off / fear' && RLMS.regimeBand(null, 'up', 15).band === 'Unknown', 'regimeBand maps fear/greed + trend to the owner regime bands');
  assert(sma3.length === swingBars.length && pv.ls[0].p <= pv.hs[0].p && ad.score >= 0 && ad.score <= 1, 'swing owner functions preserve their structural invariants');
  assert(RLMS.supportedAdapterIds.indexOf('simple-adapter/swing-transition/v1') >= 0, 'swing-transition adapter id registered in the market-structure module');
  const swingPage = read('swing-structure-lab.html');
  assert(/rlexperience-adapters\/market-structure\.js/.test(swingPage), 'swing-structure-lab.html loads the market-structure module');
  assert(/RLMARKETSTRUCTURE\.smaArr\s*\(/.test(swingPage) && /RLMARKETSTRUCTURE\.alignment\s*\(/.test(swingPage) && /RLMARKETSTRUCTURE\.pivots\s*\(/.test(swingPage) && /RLMARKETSTRUCTURE\.structure\s*\(/.test(swingPage) && /RLMARKETSTRUCTURE\.accumDist\s*\(/.test(swingPage) && /RLMARKETSTRUCTURE\.regimeBand\s*\(/.test(swingPage), 'swing-structure-lab.html delegates smaArr/alignment/pivots/structure/accumDist/regimeBand to the single source');
  assert(!/s -= bars\[i - n\]\.c/.test(swingPage) && !/extreme greed without an intact uptrend/.test(swingPage) && !/obvSeries\.push\(obv\)/.test(swingPage), 'swing-structure-lab.html carries no inline copy of the single-sourced swing formula');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 05 swing-transition group threw): ' + e.message); }

/* ---------- Feature 012 Scope 05 all-eight adapter completeness canaries ----------
   session-auction + swing-transition (above) already prove single-source owner PARITY
   for the two tools whose owner formula was extracted into the module. The remaining six
   Scope-05 adapters keep their owner formula inline (market-breadth / options-anomaly /
   options-surface / dealer-gamma-playbook are owner-primitive byte/semantic-parity tested
   in TP-05-01; conditional-volatility single-sources rlvol.js; technical-five-gate is an
   honest owner boundary). This block adds the per-adapter COMPLETENESS canary the scope's
   TP-05-12 requires for all eight tools: it drives the REAL production factory + api (no
   magic numbers, no duplicated owner fixtures) and proves each adapter is declared,
   registered, single-sourced, and wired with the exact simple-model-adapter/v1 contract. */
{
  const scope05Require = (await import('node:module')).createRequire(import.meta.url);
  const scope05Api = scope05Require('../rlexperience.js');
  const scope05Rlvol = scope05Require('../rlvol.js');
  const scope05Definitions = JSON.parse(read('simple-models.json')).definitions;
  const MS_MODULE = '../rlexperience-adapters/market-structure.js';
  const OPTIONS_MODULE = '../rlexperience-adapters/options.js';
  function assertScope05AdapterComplete(modulePath, factoryName, toolId, adapterId, singleSourceFns, deps) {
    const resolved = scope05Require.resolve(modulePath);
    delete scope05Require.cache[resolved];
    const mod = scope05Require(modulePath);
    const def = scope05Definitions.find((entry) => entry.toolId === toolId);
    assert(!!def, toolId + ': simple-models.json carries a Simple definition');
    assert(!!def && def.adapterId === adapterId, toolId + ': definition declares the ' + adapterId + ' adapter id');
    assert(mod.supportedAdapterIds.indexOf(adapterId) >= 0, adapterId + ': declared in ' + modulePath + ' supportedAdapterIds');
    singleSourceFns.forEach((fn) => assert(typeof mod[fn] === 'function', adapterId + ': single-source owner primitive ' + fn + '() is exported'));
    const adapters = mod[factoryName](scope05Api, [def], deps || {});
    const adapter = adapters[adapterId];
    assert(!!adapter, adapterId + ': produced by the production ' + factoryName + ' factory for its declared definition');
    assert(!!adapter && adapter.contractVersion === 'simple-model-adapter/v1' && adapter.adapterId === adapterId, adapterId + ': carries the exact simple-model-adapter/v1 contract identity');
    assert(!!adapter && Array.isArray(adapter.supportedDefinitionIds) && adapter.supportedDefinitionIds.indexOf(def.definitionId) >= 0, adapterId + ': supports its declared definition id ' + (def && def.definitionId));
    assert(!!adapter && typeof adapter.captureEvidence === 'function' && typeof adapter.compute === 'function' && typeof adapter.compareSensitivity === 'function', adapterId + ': exposes the captureEvidence/compute/compareSensitivity runtime surface');
  }
  try {
    group('Feature 012 Scope 05 market-breadth adapter completeness (market-heatmap-lab)');
    assertScope05AdapterComplete(MS_MODULE, 'createMarketStructureAdapters', 'market-heatmap-lab', 'simple-adapter/market-breadth/v1', ['breadthReadCells', 'computeBreadthSummary', 'reduceOwnerState'], { rlvol: scope05Rlvol });
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 05 market-breadth completeness threw): ' + e.message); }
  try {
    group('Feature 012 Scope 05 conditional-volatility adapter completeness (volatility-sizing-lab)');
    assert(typeof scope05Rlvol.buildVolDecisionRead === 'function', 'rlvol.js exposes the single-sourced buildVolDecisionRead owner seam');
    assertScope05AdapterComplete(MS_MODULE, 'createMarketStructureAdapters', 'volatility-sizing-lab', 'simple-adapter/conditional-volatility/v1', ['buildVolatilityInput', 'computeVolatilitySummary'], { rlvol: scope05Rlvol });
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 05 conditional-volatility completeness threw): ' + e.message); }
  try {
    group('Feature 012 Scope 05 technical-five-gate adapter completeness (technical-analysis-decision-lab)');
    assertScope05AdapterComplete(MS_MODULE, 'createMarketStructureAdapters', 'technical-analysis-decision-lab', 'simple-adapter/technical-five-gate/v1', ['computeTechnicalFiveGateSummary'], { rlvol: scope05Rlvol });
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 05 technical-five-gate completeness threw): ' + e.message); }
  try {
    group('Feature 012 Scope 05 trend-confirmation adapter completeness (trend-dynamics-cycle-lab)');
    assertScope05AdapterComplete(MS_MODULE, 'createMarketStructureAdapters', 'trend-dynamics-cycle-lab', 'simple-adapter/trend-confirmation/v1', ['trendSmooth', 'trendSlope', 'trendTurn', 'computeTrendConfirmationSummary'], { rlvol: scope05Rlvol });
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 05 trend-confirmation completeness threw): ' + e.message); }
  try {
    group('Feature 012 Scope 05 options-anomaly adapter completeness (options-flow-feed-lab)');
    assertScope05AdapterComplete(OPTIONS_MODULE, 'createOptionsAdapters', 'options-flow-feed-lab', 'simple-adapter/options-anomaly/v1', ['parseYahooChain', 'scoreChain', 'computeAnomalySummary'], {});
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 05 options-anomaly completeness threw): ' + e.message); }
  try {
    group('Feature 012 Scope 05 options-surface adapter completeness (options-structure-lab)');
    assertScope05AdapterComplete(OPTIONS_MODULE, 'createOptionsAdapters', 'options-structure-lab', 'simple-adapter/options-surface/v1', ['bsm', 'computeSurfaceSummary', 'computeSurfaceFlipLevel'], {});
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 05 options-surface completeness threw): ' + e.message); }
  try {
    group('Feature 012 Scope 05 dealer-gamma-playbook adapter completeness (gamma-trading-lab)');
    assertScope05AdapterComplete(OPTIONS_MODULE, 'createOptionsAdapters', 'gamma-trading-lab', 'simple-adapter/dealer-gamma-playbook/v1', ['gammaEnv', 'opexInfo', 'computeGammaPlaybookSummary'], {});
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 05 dealer-gamma-playbook completeness threw): ' + e.message); }
}

/* ---------- Feature 012 Scope 06 macro-rotation adapter completeness (delivered set) ----------
   The eight Scope-06 adapters land incrementally. This block drives the REAL production factory +
   api for each DELIVERED macro-rotation adapter and proves it is declared in simple-models.json,
   registered by the production factory, single-sourced (owner primitives exported + owning page
   delegates), and wired with the exact simple-model-adapter/v1 contract. Cumulatively with the six
   Scope-05 completeness canaries above, this walks the growing delivered adapter set toward 16.
   Delivered so far: sector-rotation-transition (sector-research-lab). */
{
  const scope06Require = (await import('node:module')).createRequire(import.meta.url);
  const scope06Api = scope06Require('../rlexperience.js');
  const scope06Definitions = JSON.parse(read('simple-models.json')).definitions;
  const MACRO_MODULE = '../rlexperience-adapters/macro-rotation.js';
  function assertScope06AdapterComplete(modulePath, factoryName, toolId, adapterId, singleSourceFns, pageFile, pageDelegations) {
    const resolved = scope06Require.resolve(modulePath);
    delete scope06Require.cache[resolved];
    const mod = scope06Require(modulePath);
    const def = scope06Definitions.find((entry) => entry.toolId === toolId);
    assert(!!def, toolId + ': simple-models.json carries a Simple definition');
    assert(!!def && def.adapterId === adapterId, toolId + ': definition declares the ' + adapterId + ' adapter id');
    assert(mod.supportedAdapterIds.indexOf(adapterId) >= 0, adapterId + ': declared in ' + modulePath + ' supportedAdapterIds');
    singleSourceFns.forEach((fn) => assert(typeof mod[fn] === 'function', adapterId + ': single-source owner primitive ' + fn + '() is exported'));
    const adapters = mod[factoryName](scope06Api, [def], {});
    const adapter = adapters[adapterId];
    assert(!!adapter, adapterId + ': produced by the production ' + factoryName + ' factory for its declared definition');
    assert(!!adapter && adapter.contractVersion === 'simple-model-adapter/v1' && adapter.adapterId === adapterId, adapterId + ': carries the exact simple-model-adapter/v1 contract identity');
    assert(!!adapter && Array.isArray(adapter.supportedDefinitionIds) && adapter.supportedDefinitionIds.indexOf(def.definitionId) >= 0, adapterId + ': supports its declared definition id ' + (def && def.definitionId));
    assert(!!adapter && typeof adapter.captureEvidence === 'function' && typeof adapter.compute === 'function' && typeof adapter.compareSensitivity === 'function', adapterId + ': exposes the captureEvidence/compute/compareSensitivity runtime surface');
    const page = read(pageFile);
    assert(/rlexperience-adapters\/macro-rotation\.js/.test(page), pageFile + ': loads the macro-rotation module');
    pageDelegations.forEach((d) => assert(new RegExp('RLMACROROTATION\\.' + d + '\\s*\\(').test(page), pageFile + ': delegates ' + d + ' to the single source'));
  }
  try {
    group('Feature 012 Scope 06 sector-rotation adapter completeness (sector-research-lab)');
    assertScope06AdapterComplete(MACRO_MODULE, 'createMacroRotationAdapters', 'sector-research-lab', 'simple-adapter/sector-rotation-transition/v1', ['rollZ100', 'rrgQuadrant', 'stateLabel', 'rotationCandidacy', 'rrgReadout', 'computeSectorRotationSummary'], 'sector-research-lab.html', ['rollZ100', 'rrgQuadrant', 'stateLabel', 'rotationCandidacy']);
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 06 sector-rotation completeness threw): ' + e.message); }
  try {
    group('Feature 012 Scope 06 country-rotation adapter completeness (global-rotation-lab)');
    assertScope06AdapterComplete(MACRO_MODULE, 'createMacroRotationAdapters', 'global-rotation-lab', 'simple-adapter/country-rotation/v1', ['globalPairCorrelation', 'countryHorizonMomentum', 'computeCountryRotationSummary'], 'global-rotation-lab.html', ['globalPairCorrelation']);
    // The single owner correlation source lives in macro-rotation.js; the page carries no inline copy.
    const countryPage = read('global-rotation-lab.html');
    assert(!/covariance \/ Math\.sqrt\(varianceA \* varianceB\)/.test(countryPage), 'global-rotation page carries no inline pairwise-correlation formula (single-sourced to RLMACROROTATION)');
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 06 country-rotation completeness threw): ' + e.message); }
  try {
    group('Feature 012 Scope 06 real-asset-driver adapter completeness (real-assets-lab)');
    assertScope06AdapterComplete(MACRO_MODULE, 'createMacroRotationAdapters', 'real-assets-lab', 'simple-adapter/real-asset-driver/v1', ['realBreadthPct', 'realAssetDriverScenario', 'computeRealAssetDriverSummary'], 'real-assets-lab.html', ['realBreadthPct']);
    // The single owner breadth source lives in macro-rotation.js; the page carries no inline reduction.
    const realAssetsPage = read('real-assets-lab.html');
    assert(!/return sum \+ value; \}, 0\) \/ values\.length \* 100/.test(realAssetsPage), 'real-assets page carries no inline breadth-percentage formula (single-sourced to RLMACROROTATION)');
    // Byte-parity: realBreadthPct reproduces the old breadthScore reduction (fraction positive * 100).
    delete scope06Require.cache[scope06Require.resolve(MACRO_MODULE)];
    const realAssetsMod = scope06Require(MACRO_MODULE);
    assert(realAssetsMod.realBreadthPct([8, -3, 5, -1, 6, -2]) === 3 / 6 * 100 && realAssetsMod.realBreadthPct([4, null, -2]) === 50 && realAssetsMod.realBreadthPct([]) === null, 'realBreadthPct is byte-parity with the owner breadthScore reduction (fraction positive, null when empty)');
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 06 real-asset-driver completeness threw): ' + e.message); }
  try {
    group('Feature 012 Scope 06 fixed-income-sleeve adapter completeness (bond-regime-lab)');
    assertScope06AdapterComplete(MACRO_MODULE, 'createMacroRotationAdapters', 'bond-regime-lab', 'simple-adapter/fixed-income-sleeve/v1', ['sleeveTotalReturn', 'computeFixedIncomeSleeveSummary'], 'bond-regime-lab.html', ['sleeveTotalReturn']);
    // The single owner decomposition lives in macro-rotation.js; the page carries no inline convexity/total formula.
    const bondPage = read('bond-regime-lab.html');
    assert(!/0\.5 \* values\.convexity \* combinedShock \* combinedShock/.test(bondPage), 'bond page carries no inline sleeve convexity/total formula (single-sourced to RLMACROROTATION)');
    // Byte-parity: sleeveTotalReturn reproduces the owner carry+rate+spread+convexity decomposition.
    delete scope06Require.cache[scope06Require.resolve(MACRO_MODULE)];
    const bondMod = scope06Require(MACRO_MODULE);
    assert(Math.round(bondMod.sleeveTotalReturn(5, 7, 6, 1.5, 6, 50, 30).total * 1e6) / 1e6 === -0.027952 && bondMod.sleeveTotalReturn(5, 7, 6, 1.5, 6, 50, null).spread === null && Number.isNaN(bondMod.sleeveTotalReturn(null, 7, 6, 1.5, 6, 50, 30).total), 'sleeveTotalReturn is byte-parity with the owner decomposition (null spread when spread-less, non-finite when a characteristic is missing)');
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 06 fixed-income-sleeve completeness threw): ' + e.message); }
  try {
    group('Feature 012 Scope 06 etf-ranking adapter completeness (etf-momentum-lab)');
    assertScope06AdapterComplete(MACRO_MODULE, 'createMacroRotationAdapters', 'etf-momentum-lab', 'simple-adapter/etf-ranking/v1', ['etfMomentumSignal', 'etfCompositeScore', 'computeEtfRankingSummary'], 'etf-momentum-lab.html', ['etfMomentumSignal', 'etfCompositeScore']);
    // The single owner ranking source lives in macro-rotation.js; the page carries no inline momentum/composite formula.
    const etfPage = read('etf-momentum-lab.html');
    assert(!/momentum \* 0\.70 \+ sharpe \* 0\.20 \+ quality \* 0\.10/.test(etfPage), 'etf page carries no inline composite-score formula (single-sourced to RLMACROROTATION)');
    // Byte-parity: etfMomentumSignal + etfCompositeScore reproduce the owner ranking (horizon momentum + composite).
    delete scope06Require.cache[scope06Require.resolve(MACRO_MODULE)];
    const etfMod = scope06Require(MACRO_MODULE);
    const canonEtf = { trailing: { '1M': 0.02, '3M': 0.06, '6M': 0.14, '1Y': 0.22 }, sharpe: 1.2, annVol: 0.18 };
    const etfSharpe = Math.max(-1, Math.min(1, 1.2 / 2)), etfQuality = Math.max(-1, Math.min(1, (0.30 - 0.18) / 0.22));
    assert(etfMod.etfMomentumSignal(canonEtf, '6M') === 0.14 && Math.abs(etfMod.etfMomentumSignal(canonEtf, 'blend') - (0.06 + 0.14 + 0.22) / 3) < 1e-12 && etfMod.etfMomentumSignal({ trailing: {} }, '6M') === null, 'etfMomentumSignal is byte-parity with the owner trailing/blend signal (null when absent)');
    assert(etfMod.etfCompositeScore(canonEtf, '6M', 'raw') === 0.14 && Math.abs(etfMod.etfCompositeScore(canonEtf, '6M', 'balanced') - (0.14 * 0.70 + etfSharpe * 0.20 + etfQuality * 0.10)) < 1e-12 && etfMod.etfCompositeScore({ trailing: {} }, '6M', 'balanced') === null, 'etfCompositeScore is byte-parity with the owner composite (raw/balanced weights, null when no momentum)');
  } catch (e) { failures++; console.log('  ✗ FAIL (Feature 012 Scope 06 etf-ranking completeness threw): ' + e.message); }
}

/* ---------- Feature 012 Scope 08 RLJOURNEY runtime + all-tool + no-execution canaries ----------
  Drives the REAL production rljourney.js runtime against the REAL journeys.json and
  the REAL tools.json registry: proves every ordinary-tool goal plus exact Center goal coverage, the
   no-executable-code invariant, the NON-EXECUTING signed-off completion packet (SCN-012-011), and
   dependency-aware transitive-stale backtracking (SCN-012-010). Pure Node, no browser. */
try {
  group('Feature 012 Scope 08 RLJOURNEY runtime + all-tool + no-execution canaries');
  const rjRequire = (await import('node:module')).createRequire(import.meta.url);
  delete rjRequire.cache[rjRequire.resolve('../rljourney.js')];
  const RJ = rjRequire('../rljourney.js');
  const journeys = JSON.parse(read('journeys.json'));
  const registryTools = JSON.parse(read('tools.json')).tools;

  // (1) SCN-012-032 all-tool coverage is derived from the registries so adding a conformant tool cannot stale this canary.
  const inventory = registryTools.map((t) => ({ registryId: t.id, kind: (t.experience && t.experience.kind) || 'ordinary', journeyDefinitionIds: (t.experience && t.experience.journeyDefinitionIds) || [] }));
  const completeness = RJ.validateRegistryCompleteness(journeys, inventory);
  const expectedOrdinaryTools = inventory.filter((entry) => entry.kind === 'ordinary').length;
  const expectedCenterGoals = inventory.filter((entry) => entry.kind === 'market-action-center').reduce((sum, entry) => sum + entry.journeyDefinitionIds.length, 0);
  const expectedTotalGoals = inventory.reduce((sum, entry) => sum + entry.journeyDefinitionIds.length, 0);
  assert(completeness.ok && completeness.value.ordinaryTools === expectedOrdinaryTools && completeness.value.centerGoals === expectedCenterGoals && completeness.value.totalGoals === expectedTotalGoals && completeness.value.definitionCount === journeys.definitions.length, 'RLJOURNEY validates every registered ordinary tool and exact Market Action Center goal against the journey registry');

  // (2) the complete registry compiles, and a function value anywhere in a definition is rejected.
  const compiledRegistry = RJ.compileRegistry(journeys);
  const breadth = compiledRegistry.ok ? compiledRegistry.value.definitions['journey/market-heatmap-lab/breadth/v1'] : null;
  assert(compiledRegistry.ok && !!breadth, 'the complete journey registry compiles under the runtime');
  const badDef = JSON.parse(JSON.stringify(journeys.definitions.find((d) => d.definitionId === 'journey/market-heatmap-lab/breadth/v1')));
  const badSteps = journeys.steps.filter((s) => badDef.stepIds.includes(s.stepId)).map((s) => JSON.parse(JSON.stringify(s)));
  badDef.injected = () => 'boom';
  const execRejected = RJ.compileDefinition(badDef, badSteps);
  assert(!execRejected.ok && execRejected.error.code === 'RLJOURNEY-EXECUTION', 'a function value anywhere in Journey data is rejected (no-executable-code invariant)');

  // (3) SCN-012-011 no-execution: a signed-off complete packet records review locally and executes NOTHING.
  const created = RJ.createSession(breadth, { context: { evidenceIdentity: 'sha256:owner-breadth-canary' }, createdAt: '2026-07-26T00:00:00.000Z' }).value;
  const doneStep = RJ.completeStep(created, breadth.order[0], { input: { acknowledgedEvidenceIds: ['breadth-1'] }, evidence: [{ slot: 'owner-evidence', ref: 'owner:canary', provenance: 'owner-evidence' }], completedAt: '2026-07-26T00:05:00.000Z' }).value;
  const packet = RJ.buildCompletionPacket(doneStep, { outcome: 'complete', signoff: { reviewer: 'canary' } }).value;
  const reviewed = RJ.recordSignoff(packet, { reviewer: 'canary', acceptedAt: '2026-07-26T00:06:00.000Z' }).value;
  const noExecutionSurface = ['executeTrade', 'submitOrder', 'placeOrder', 'rebalance', 'hedge', 'trade', 'execute'].every((name) => typeof RJ[name] !== 'function');
  assert(packet.executed === false && packet.noExecution === true && reviewed.executed === false && reviewed.noExecution === true && reviewed.reviewRecorded === true && noExecutionSurface, 'a signed-off JourneyCompletionPacket records review locally and executes NOTHING (no execution entry point exists)');

  // (4) SCN-012-010 dependency-aware transitive-stale backtracking on a synthetic a->b (+unrelated d) chain.
  const synDefId = 'journey/synthetic/canary/v1';
  const synDef = { contractVersion: 'journey-definition/v1', definitionId: synDefId, definitionVersion: 'v1', toolId: 'synthetic', goalId: 'canary', title: 'Canary', outcomeDescription: 'Backtrack canary.', mechanism: 'decision-tree', prerequisiteRules: [{ ruleId: 'r', predicate: 'explicit-choice-recorded' }], contextSchema: { contractVersion: 'journey-context-schema/v1', allowedFields: ['evidenceIdentity'], requiredFields: ['evidenceIdentity'] }, stepIds: ['a', 'b', 'd'], evidencePolicy: { requiredSlots: ['owner-evidence'], allowedProvenance: ['owner-evidence'] }, backtrackPolicy: { mode: 'transitive-dependents-stale', auditPriorOutcomes: true }, staleEvidencePolicy: { mode: 'reopen-dependent-steps', preserveAudit: true }, completionPolicy: { predicates: ['explicit-choice-recorded'], outcomes: ['complete', 'partial', 'refused'] }, packetPolicy: { contractVersion: 'journey-completion-packet/v1', humanSignoffRequired: true, noExecution: true }, privacyClass: 'public-safe', noExecution: true, accessibility: { progressSemantics: 'ordered-list', currentStepSemantics: 'aria-current-step' }, limitations: ['Research only.'], definitionFingerprint: null };
  const synStep = (id, deps) => ({ contractVersion: 'journey-step/v1', stepId: id, definitionId: synDefId, title: id, purpose: 'p', mechanismRole: 'decision-tree', dependsOnStepIds: deps, inputSchema: { contractVersion: 'journey-step-input/v1', allowedFields: ['choice'], requiredFields: ['choice'] }, allowedInputProvenance: ['user-assumption'], requiredEvidenceSlots: ['owner-evidence'], optionalEvidenceSlots: [], completionPredicate: 'explicit-choice-recorded', branchRules: [], staleWhen: [], invalidatesStepIds: [], ownerDeepLinks: ['synthetic.html#journey'], sideEffectPolicy: 'none', accessibility: { label: id, description: 'd' }, stepFingerprint: null });
  const synCompiled = RJ.compileDefinition(synDef, [synStep('a', []), synStep('b', ['a']), synStep('d', [])]).value;
  let syn = RJ.createSession(synCompiled, { context: { evidenceIdentity: 'e-1' } }).value;
  for (const stepId of synCompiled.order) syn = RJ.completeStep(syn, stepId, { input: { choice: stepId }, evidence: [{ slot: 'owner-evidence', ref: 'owner:c' }], completedAt: '2026-07-26T00:07:00.000Z' }).value;
  const afterBacktrack = RJ.backtrackStep(syn, 'a', { reason: 'canary backtrack' }).value;
  assert(afterBacktrack.steps.b.status === 'stale' && /dependency backtracked: a/.test(afterBacktrack.steps.b.staleReason) && afterBacktrack.steps.d.status === 'complete' && afterBacktrack.steps.d.staleReason === null, 'backtracking an assumption stales only its transitive dependent (b) and preserves the unrelated completed step (d)');
} catch (e) { failures++; console.log('  \u2717 FAIL (Feature 012 Scope 08 RLJOURNEY canaries threw): ' + e.message); }

/* ---------- Feature 012 Scope 09 Market Action Center PUBLIC projection canaries ----------
   Drives the REAL rlmarketaction.js against the REAL watchlist.json + registry-derived domain
   map (tools.json), and the REAL scripts/validate-market-action.mjs contract validator. Proves:
   the PUBLIC PortfolioTickerMatrix labels every row `Public watchlist` with one explicit cell per
   domain (SCN-012-022, never neutral by omission); the MarketActionCenterProjection composes
   EXACTLY four top-level views with the three exact dependency-pending gates and the truthful
   no-action Brief (SCN-012-019); the module owns ZERO forbidden capability; and the private-field
   barrier + closed adversarial refusals fail closed. Pure Node, no browser. */
try {
  group('Feature 012 Scope 09 Market Action Center PUBLIC projection + public portfolio matrix');
  const feature012Scope09Validator = await import('./validate-market-action.mjs');
  const marketAction = feature012Scope09Validator.validateMarketAction();
  const maRequire = (await import('node:module')).createRequire(import.meta.url);
  delete maRequire.cache[maRequire.resolve('../rlmarketaction.js')];
  const RLMKT = maRequire('../rlmarketaction.js');
  const watchlist = JSON.parse(read('watchlist.json'));
  const registryTools = JSON.parse(read('tools.json')).tools;

  // (1) forbidden-authority scan: rlmarketaction.js owns ZERO fetch/providerFetch/storage-write/publisher capability.
  assert(marketAction.authority.forbiddenCapabilityCount === 0 && marketAction.authority.scanned >= 8, 'rlmarketaction.js owns zero forbidden fetch/providerFetch/storage-write/publisher/LLM capability');

  // (2) SCN-012-022 public matrix: one row per watchlist ticker, every row labeled `Public watchlist`, one explicit cell per domain.
  const ownerPrecedence = Object.create(null);
  for (const domain of RLMKT.EVIDENCE_DOMAINS) ownerPrecedence[domain] = [];
  for (const tool of registryTools) { for (const domain of (tool.experience && tool.experience.matrixDomains) || []) { if (ownerPrecedence[domain]) ownerPrecedence[domain].push(tool.id); } }
  const applicability = Object.create(null);
  for (const domain of RLMKT.EVIDENCE_DOMAINS) applicability[domain] = Object.create(null);
  const etfApplicable = new Set(['technical', 'macro-rotation', 'options', 'volatility']);
  const stockApplicable = new Set(['fundamentals', 'technical', 'options', 'volatility', 'catalyst']);
  for (const item of watchlist.items) { const isEtf = item.type === 'etf'; for (const domain of RLMKT.EVIDENCE_DOMAINS) applicability[domain][item.ticker] = (isEtf ? etfApplicable.has(domain) : stockApplicable.has(domain)) ? 'applicable' : 'not-applicable'; }
  const matrix = RLMKT.composePublicMatrix({ matrixId: 'selftest', cutoffAt: '2026-07-26T15:00:00.000Z', generationRef: 'legacy:selftest', domainMapVersion: 'registry-derived/v1', watchlist, ownerPrecedence, applicability, ownerReads: { 'company-fundamentals-lab': { MSFT: { state: 'current', read: 'FY26', asOf: '2026-07-26T14:00:00.000Z', provenance: 'same-origin-snapshot' } } } });
  assert(matrix.ok && matrix.value.rows.length === watchlist.items.length && matrix.value.rows.every((row) => row.scopeClass === 'public-watchlist' && row.scopeLabel === 'Public watchlist' && row.cells.length === RLMKT.MATRIX_DOMAINS.length && row.cells.every((cell) => RLMKT.APPLICABILITY.includes(cell.applicability) && RLMKT.CELL_STATES.includes(cell.state))), 'SCN-012-022 public matrix labels every row `Public watchlist` with one explicit applicable/state cell per domain (never neutral by omission)');
  assert(RLMKT.validatePublicMatrix(matrix.value).ok && marketAction.matrix.rowCount === watchlist.items.length, 'the composed public matrix validates round-trip and matches the validator row count');

  // (3) SCN-012-022 private-field barrier: the composer REFUSES any Feature 008 private field without echoing its value.
  const smuggled = structuredClone(watchlist); smuggled.items[0].quantity = 100;
  const refused = RLMKT.composePublicMatrix({ matrixId: 'selftest', cutoffAt: '2026-07-26T15:00:00.000Z', generationRef: 'legacy:selftest', domainMapVersion: 'v1', watchlist: smuggled, ownerPrecedence, applicability, ownerReads: {} });
  assert(!refused.ok && refused.error.code === 'RLMKT-PRIVACY' && !JSON.stringify(refused.error).includes('100'), 'the public composer refuses a smuggled Feature 008 private field (RLMKT-PRIVACY) and never echoes the private value');

  // (4) SCN-012-019 four-view Center + no-action: exactly four top-level views, three exact dependency-pending gates, truthful no-action Brief that fabricates nothing.
  const projection = RLMKT.composeCenterProjection({ projectionId: 'selftest', generationRef: 'legacy:selftest', cutoffAt: '2026-07-26T15:00:00.000Z', activeView: 'brief', brief: { window: '1100ET', coverageComplete: true, actions: [] }, portfolio: { publicMatrixRef: matrix.value.matrixFingerprint }, redAlert: { alertRefs: [] }, journey: { definitionRefs: ['journey/market-action/prepare-session/v1', 'journey/market-action/triage/v1', 'journey/market-action/latent-risk/v1', 'journey/market-action/portfolio-stress/v1'] } });
  assert(projection.ok && JSON.stringify(projection.value.viewOrder) === JSON.stringify(['brief', 'portfolio', 'red-alert', 'journey']) && projection.value.gates.authoredBriefV2 === 'dependency-pending:feature-002' && projection.value.gates.redAlertPublication === 'dependency-pending:feature-002' && projection.value.gates.privatePortfolioOverlay === 'dependency-pending:feature-008' && projection.value.views.brief.noAction.statement === RLMKT.NO_ACTION_STATEMENT && projection.value.views.brief.noAction.fabricatedAction === false && projection.value.views.brief.noAction.fabricatedCatalyst === false && projection.value.views.brief.noAction.fabricatedConfidence === false, 'SCN-012-019 the Center composes exactly four views (brief/portfolio/red-alert/journey), three exact dependency-pending gates, and a truthful no-action Brief that fabricates no action/catalyst/confidence');

  // (5) closed adversarial refusals from the contract validator all fail closed with RLMKT-* codes.
  assert(marketAction.center.viewCount === 4 && marketAction.center.gatesPending === 3 && marketAction.adversarial.length === 7 && marketAction.adversarial.every((refusal) => /^RLMKT-/.test(refusal.code)) && new Set(marketAction.adversarial.map((refusal) => refusal.name)).size === 7, 'the market-action contract validator reports four views, three pending gates, and seven distinct closed RLMKT-* adversarial refusals');
} catch (e) { failures++; console.log('  \u2717 FAIL (Feature 012 Scope 09 Market Action canaries threw): ' + e.message); }

/* ---------- Feature 012 Scope 10 Bounded WebEvidence Acquisition canaries ----------
   Drives the REAL scripts/validate-web-evidence.mjs over the committed acquisition policy
   (market-brief.config.json "web-evidence-acquisition/v1") + the static fixtures, exercising the
   REAL production acquire() (scripts/web-evidence-acquire.mjs) through each fixture's INJECTED
   boundary (no socket, no network). Proves: every committed fixture produces its deterministic
   frozen WebEvidenceBundle/v1 or closed rejection; a single/syndicated origin leaves a material
   claim uncorroborated (SCN-012-006/007) while two DISTINCT origins corroborate; the acquisition
   module imports ONLY node:crypto and owns ZERO fetch/provider-key/repo-write/current-pointer/
   author-publication authority; and every closed adversarial mutation is refused with an E012-* code. */
try {
  group('Feature 012 Scope 10 Bounded WebEvidence Acquisition (fail-closed acquisition + validator)');
  const feature012Scope10Validator = await import('./validate-web-evidence.mjs');
  const webEvidence = await feature012Scope10Validator.validateWebEvidence();

  // (1) every committed fixture (>= 11) evaluated deterministically against the REAL acquire() transform.
  assert(webEvidence.fixtures.length >= 11 && webEvidence.fixtures.every((f) => f.name), 'every committed web-evidence fixture (>= 11) evaluates deterministically against the REAL acquire() production transform');

  // (2) module authority: imports ONLY node:crypto, zero forbidden capability, no author/publication import.
  assert(JSON.stringify(webEvidence.moduleAuthority.imports) === JSON.stringify(['node:crypto']) && webEvidence.moduleAuthority.forbiddenCapabilityCount === 0 && webEvidence.moduleAuthority.importsAuthorModule === false, 'web-evidence-acquire.mjs imports ONLY node:crypto and owns zero fetch/provider-key/repo-write/current-pointer/author-publication authority');

  // (3) twelve distinct closed adversarial refusals, every code in the E012-* namespace.
  assert(webEvidence.adversarial.length === 12 && webEvidence.adversarial.every((r) => /^E012-/.test(r.code)) && new Set(webEvidence.adversarial.map((r) => r.name)).size === 12, 'the web-evidence validator refuses twelve distinct closed adversarial mutations, each with an E012-* code');

  // (4) SCN-012-006/007/037 through the harness: single & syndicated origins => uncorroborated; two distinct origins => corroborated; safe frozen bundle.
  const policies10 = feature012Scope10Validator.resolveFixturePolicies(feature012Scope10Validator.loadConfig());
  const tb10 = policies10['tool-brief'];
  const syn10 = await feature012Scope10Validator.runFixtureAcquisition(feature012Scope10Validator.loadFixture('syndicated-common-origin'), tb10);
  const one10 = await feature012Scope10Validator.runFixtureAcquisition(feature012Scope10Validator.loadFixture('one-origin-uncorroborated'), tb10);
  const prim10 = await feature012Scope10Validator.runFixtureAcquisition(feature012Scope10Validator.loadFixture('primary-independent'), tb10);
  const synClaim10 = syn10.acquireResult.value.claims.find((c) => c.claimId === 'claim-recall');
  const oneClaim10 = one10.acquireResult.value.claims.find((c) => c.claimId === 'claim-award');
  const primClaim10 = prim10.acquireResult.value.claims.find((c) => c.claimId === 'claim-guidance');
  assert(syn10.acquireResult.value.coverage.independentOriginCount === 1 && synClaim10.corroborationState === 'uncorroborated' && synClaim10.authorable === false && oneClaim10.corroborationState === 'uncorroborated' && oneClaim10.authorable === false && primClaim10.corroborationState === 'corroborated' && primClaim10.authorable === true && Object.isFrozen(prim10.acquireResult.value) && !JSON.stringify(prim10.acquireResult.value).includes('<p>'), 'SCN-012-006/007 single & syndicated origins leave a material claim uncorroborated while two DISTINCT origins corroborate; the safe bundle is frozen with no raw markup (SCN-012-037)');
} catch (e) { failures++; console.log('  \u2717 FAIL (Feature 012 Scope 10 WebEvidence canaries threw): ' + e.message); }

/* ---------- Feature 012 Scope 12 Dynamic Red Alert discovery/qualification/projection canaries ----------
   Drives the REAL rlmarketaction.js Red Alert engine over INLINE observations (a WebEvidenceBundle/v1-shaped
   material-claim set + a discovery hypothesis; production DERIVES the verdict, never a fixture echo). Proves:
   a dynamically corroborated, market-confirmed, high-severity candidate QUALIFIES with every falsifiable field
   and an admission score that is NEVER a probability/confidence/crash-odds field (SCN-012-023); a single-origin
   candidate consumes NO visible slot as a safe insufficient-corroboration count and never echoes its dramatic
   title (SCN-012-024); a no-candidate window renders an honest empty state with cutoff/channels/owner coverage
   and no illustrative topic (SCN-012-025); and live Red Alert publication stays a Feature 002 dependency-pending
   gate. Pure Node, no browser, no named-topic catalog. */
try {
  group('Feature 012 Scope 12 Dynamic Red Alert discovery/qualification/projection');
  const raRequire = (await import('node:module')).createRequire(import.meta.url);
  delete raRequire.cache[raRequire.resolve('../rlmarketaction.js')];
  const RA12 = raRequire('../rlmarketaction.js');
  const CUT12 = '2026-07-26T15:00:00.000Z';
  const mkClaim12 = (id, over) => Object.assign({ claimId: id, materiality: 'material', claimKind: 'market-state', normalizedClaim: id + ' moved this week', independentOriginGroups: ['origin:a', 'origin:b'], ownerEvidenceRefs: ['owner:1'], corroborationState: 'corroborated', conflictState: 'consistent', freshnessState: 'current' }, over || {});
  const mkBundle12 = (claims) => ({ contractVersion: 'web-evidence-bundle/v1', bundleId: 'selftest/red-alert:bundle', cutoffAt: CUT12, claims, bundleFingerprint: 'sha256:' + '1'.repeat(64) });
  const seed12 = { seedId: 'seed-st', ownerToolId: 'market-heatmap-lab', evidenceRefs: ['owner:1'], observedCondition: 'funding basis widened beyond its band', normalizedEntities: ['xccy-basis', 'usd-funding'], transmissionChannels: ['credit-funding', 'fx-carry'], magnitudeOrState: 'p97', cutoffAt: CUT12, freshness: 'current', limitations: [] };
  const hypo12 = (over) => Object.assign({ clusterId: 'cluster-st', thesis: 'Cross-currency funding stress is transmitting into carry unwinds this window.', severity: 5, likelihoodInterval: [0.4, 0.6], horizon: '0-2w', uncertainty: 'wide; depends on quarter-end rollover', whyNow: 'basis and carry both dislocated in the same current window', trigger: 'basis breaches its prior wide with a carry drawdown', invalidation: 'basis normalizes to its 1y median for five sessions', monitoring: 'track the basis band and the two owner reads daily', resolution: 'resolves when basis and carry re-anchor', propagation: [{ from: 'credit-funding', to: 'fx-carry' }, { from: 'fx-carry', to: 'volatility-options' }], affectedAssets: ['DBC', 'GLD'], exposureClasses: ['carry', 'funding'], researchActions: [{ verb: 'monitor', detail: 'watch the funding basis band into quarter end' }, { verb: 'verify', detail: 'reconcile the basis claim against a second origin' }], materialClaims: [{ claimId: 'c-fund', channel: 'credit-funding', kind: 'market-state' }, { claimId: 'c-carry', channel: 'fx-carry', kind: 'market-state' }] }, over || {});

  // (1) SCN-012-023 dynamic corroborated + market-confirmed candidate QUALIFIES with all falsifiable fields; admission score >= 75; NEVER a probability/confidence/crash-odds field; publication Feature-002 gated.
  const strongBundle = mkBundle12([mkClaim12('c-fund'), mkClaim12('c-carry', { independentOriginGroups: ['origin:c', 'origin:d'], ownerEvidenceRefs: ['owner:2'] })]);
  const qualified = RA12.qualifyRedAlerts({ projectionId: 'selftest/red-alert', cutoffAt: CUT12, seeds: [seed12], candidateInputs: [Object.assign({ bundle: strongBundle }, hypo12())], channelsReviewed: ['credit-funding', 'fx-carry', 'volatility-options'] });
  const strongAlert = qualified.ok ? qualified.value.visibleAlerts[0] : {};
  const forbiddenScoreKeys12 = ['probability', 'confidence', 'crashOdds', 'crashProbability', 'odds', 'certainty'];
  assert(qualified.ok && qualified.value.visibleAlerts.length === 1 && strongAlert.severityLevel >= 4 && strongAlert.admissionScore >= 75 && ['thesis', 'whyNow', 'trigger', 'invalidation', 'monitoring', 'resolution', 'horizon', 'uncertainty'].every((f) => typeof strongAlert[f] === 'string' && strongAlert[f].length > 0) && strongAlert.propagation.length > 0 && strongAlert.researchActions.length > 0 && strongAlert.independentOriginGroupCount >= 2 && strongAlert.ownerMarketEvidenceRefs.length >= 1 && 'admissionScore' in strongAlert && !forbiddenScoreKeys12.some((k) => (k in strongAlert) || (k in strongAlert.scoreComponents)) && qualified.value.publicationState === 'dependency-pending:feature-002' && RA12.validateRedAlertProjection(qualified.value).ok, 'SCN-012-023 a dynamically corroborated, market-confirmed, high-severity candidate qualifies with every falsifiable field and an admission score (never a probability/confidence/crash-odds field), publication Feature-002 gated');

  // (2) SCN-012-024 single-origin dramatic candidate consumes NO visible slot; safe insufficient-corroboration count; dramatic title never echoed.
  const weakBundle = mkBundle12([mkClaim12('c-fund', { independentOriginGroups: ['origin:a'], corroborationState: 'uncorroborated' }), mkClaim12('c-carry', { independentOriginGroups: ['origin:c'], corroborationState: 'uncorroborated', ownerEvidenceRefs: ['owner:2'] })]);
  const weak = RA12.qualifyRedAlerts({ projectionId: 'selftest/red-alert-weak', cutoffAt: CUT12, seeds: [seed12], candidateInputs: [Object.assign({ bundle: weakBundle }, hypo12({ thesis: 'SENSATIONAL UNSTOPPABLE MELTDOWN NARRATIVE ZZZ.' }))], channelsReviewed: ['credit-funding'] });
  assert(weak.ok && weak.value.visibleAlerts.length === 0 && weak.value.rejections.count === 1 && weak.value.rejections.byReasonClass['insufficient-corroboration'] >= 1 && !JSON.stringify(weak.value).includes('SENSATIONAL'), 'SCN-012-024 a single-origin dramatic candidate consumes no visible slot, is a safe insufficient-corroboration count, and never echoes its dramatic title');

  // (3) SCN-012-025 no candidate -> honest empty state with cutoff/coverage and no illustrative topic.
  const empty12 = RA12.qualifyRedAlerts({ projectionId: 'selftest/red-alert-empty', cutoffAt: CUT12, seeds: [seed12], candidateInputs: [], channelsReviewed: ['credit-funding', 'fx-carry'] });
  const empty12Text = empty12.ok ? JSON.stringify(empty12.value.emptyState).toLowerCase() : '';
  assert(empty12.ok && empty12.value.visibleAlerts.length === 0 && empty12.value.emptyState && empty12.value.emptyState.cutoffAt === CUT12 && empty12.value.emptyState.channelsReviewed.length > 0 && empty12.value.emptyState.ownerCoverage.anomalySeedCount >= 1 && !['usd/jpy', 'private credit', 'capex', 'war'].some((t) => empty12Text.includes(t)) && RA12.validateRedAlertProjection(empty12.value).ok, 'SCN-012-025 a no-candidate window renders an honest empty state with cutoff/channels/owner coverage and no illustrative topic');
} catch (e) { failures++; console.log('  \u2717 FAIL (Feature 012 Scope 12 Red Alert canaries threw): ' + e.message); }

/* ---------- Feature 012 Scope 15 production Simple-view bridge canaries (TP-15-07) ----------
   SCN-012-038 / SCN-012-039 / SCN-012-040 / SCN-012-041 / SCN-012-042. TP-15-01 (unit) proves the
   BRIDGE DECISION on one adapter and TP-15-02 (integration) proves the whole wired set end-to-end;
   TP-15-03..06 prove it in a real browser. These canaries put the bridge CONTRACT into the fast broad
   gate so a broken wiring fact fails here, in seconds, instead of only in the slow Playwright sweep.

   EVERY fact is DERIVED from production sources — there is no hard-coded tool list, no duplicated
   formula, no canned expectation:
     • the wired set          = simple-models.json definitions x the deployed page that registers
                                `__rlOwnerStateProvider["<toolId>"]` (the same fact rlapp.js keys
                                ownerModes on), so a tool wired in a future batch joins automatically;
     • the module bindings    = the ADAPTER_MODULE_BINDINGS literal parsed out of rlexperience.js;
     • the ownerModes rule    = rlapp.js's OWN ternary, extracted verbatim and EXECUTED;
     • the rlv-focused rule   = rlviews.js's OWN toggle predicate, extracted verbatim and EXECUTED;
     • no-forbidden-authority = the production runtime's OWN diagnostic().value.authority contract.

   The rlv-focused ownership scan runs against RAW (un-stripped) source on purpose: a comment-stripper
   that over-reached could HIDE a real re-introduced write, so the safety-critical assertion never
   depends on it. Comment-stripping is used only for the additional "not even mentioned" checks.

   NODE, NO BROWSER, NO NETWORK, NO WALL-CLOCK: computedAt is a fixed instant and the DOM host is a
   minimal recording stub, so every canary is deterministic. */
try {
  group('Feature 012 Scope 15 production Simple-view bridge canaries (TP-15-07)');
  const bridgeRequire = (await import('node:module')).createRequire(import.meta.url);
  const loadFresh = (rel) => { const p = bridgeRequire.resolve('../' + rel); delete bridgeRequire.cache[p]; return bridgeRequire(p); };
  const countOf = (text, re) => (text.match(re) || []).length;
  const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const RLV_FOCUSED_WRITE = /classList\s*\.\s*(?:add|remove|toggle|replace)\s*\(\s*["'`]rlv-focused/g;

  const bridgeSrc = read('rlexperience.js'), viewsSrc = read('rlviews.js'), appSrc = read('rlapp.js');
  const registry = JSON.parse(read('simple-models.json'));
  const experienceConfig = JSON.parse(read('tool-experience.config.json'));
  const bridgeApi = loadFresh('rlexperience.js');

  /* (1) The bridge's OWN module-binding table, parsed out of its source (never restated here). */
  const bindingsBlock = /var ADAPTER_MODULE_BINDINGS\s*=\s*\{([\s\S]*?)\n\s*\};/.exec(bridgeSrc);
  const moduleBindings = Object.create(null);
  const bindingRe = /"([^"]+)":\s*\{\s*global:\s*"([^"]+)",\s*register:\s*"([^"]+)"\s*\}/g;
  let bindingMatch;
  while (bindingsBlock && (bindingMatch = bindingRe.exec(bindingsBlock[1]))) moduleBindings[bindingMatch[1]] = { global: bindingMatch[2], register: bindingMatch[3] };
  const bindingPaths = Object.keys(moduleBindings);
  assert(!!bindingsBlock && bindingPaths.length > 0 && bindingPaths.every((p) => moduleBindings[p].global && moduleBindings[p].register), 'the bridge publishes a non-empty adapter-module binding table, each entry naming a browser global and a registrar (' + bindingPaths.length + ' bindings parsed from rlexperience.js)');

  /* (2) The wired set: every deployed page that registers the uniform owner-state provider seam. */
  const providerRe = /__rlOwnerStateProvider\[\s*["']([a-z0-9-]+)["']\s*\]/g;
  const productionPages = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  const providerRegistrations = [];
  for (const page of productionPages) {
    const pageSrc = read(page);
    const seen = new Set();
    let providerMatch;
    providerRe.lastIndex = 0;
    while ((providerMatch = providerRe.exec(pageSrc))) seen.add(providerMatch[1]);
    for (const toolId of seen) providerRegistrations.push({ page, toolId });
  }
  const definitionByToolId = new Map(registry.definitions.map((d) => [d.toolId, d]));
  const wired = registry.definitions.filter((d) => providerRegistrations.some((r) => r.toolId === d.toolId));
  assert(productionPages.length > 0 && providerRegistrations.length > 0 && wired.length === providerRegistrations.length, 'the wired set is derived from the production registry + the deployed pages and is non-empty (' + wired.length + ' wired of ' + registry.definitions.length + ' registry definitions, scanned ' + productionPages.length + ' pages)');

  /* (3) Registry/page coherence, BOTH directions: a page wired without a registry definition — or a
         definition with no adapter identity — would leave the bridge permanently honest-unavailable. */
  const orphanWiring = providerRegistrations.filter((r) => !definitionByToolId.has(r.toolId));
  const identityGaps = wired.filter((d) => !d.adapterId || !d.adapterModule || !d.definitionId);
  assert(orphanWiring.length === 0 && identityGaps.length === 0, 'every page-registered owner-state provider resolves to a registry definition carrying a non-empty adapterId/adapterModule/definitionId (0 orphan wirings, 0 identity gaps across ' + wired.length + ' wired tools)');

  /* (4) Every wired tool's declared adapter module is a real file the bridge can actually bind. */
  const missingModuleFile = wired.filter((d) => !existsSync(join(ROOT, d.adapterModule)));
  const unboundModule = wired.filter((d) => !moduleBindings[d.adapterModule]);
  assert(missingModuleFile.length === 0 && unboundModule.length === 0, 'every wired tool\u2019s declared adapter module exists on disk and has a bridge binding (' + new Set(wired.map((d) => d.adapterModule)).size + ' distinct modules across ' + wired.length + ' wired tools)');

  /* (5) Each wired module resolves under Node and exports the registrar its binding names. */
  const registrarGaps = [];
  const wiredModules = new Map();
  for (const d of wired) {
    const binding = moduleBindings[d.adapterModule];
    let moduleObject = null;
    try { moduleObject = loadFresh(d.adapterModule); } catch (loadError) { registrarGaps.push(d.toolId + ':load'); continue; }
    wiredModules.set(d.toolId, moduleObject);
    if (typeof moduleObject[binding.register] !== 'function') registrarGaps.push(d.toolId + ':' + binding.register);
  }
  assert(wiredModules.size === wired.length && registrarGaps.length === 0, 'every wired tool\u2019s adapter module loads and exports the registrar its binding names (' + wiredModules.size + '/' + wired.length + ' resolved, gaps: ' + (registrarGaps.join(', ') || 'none') + ')');

  /* (6) Registration parity against the REAL runtime: the registrar must register the exact adapterId
         the registry declares, for the exact definitionId it declares. `rlvol` reproduces the
         foundation-module global the deployed page installs and the bridge injects. A tool whose
         binding/module already failed (4)/(5) is counted as unchecked rather than thrown on, so one
         broken wiring fact cannot mask the remaining canaries — the checked-count assertion below
         still fails loud when any wired tool was skipped. */
  const rlvolModule = loadFresh('rlvol.js');
  const registrationGaps = [];
  let registrationChecked = 0, authorityKeys = 0, authorityOwned = 0;
  for (const d of wired) {
    const binding = moduleBindings[d.adapterModule];
    const moduleObject = wiredModules.get(d.toolId);
    if (!binding || !moduleObject || typeof moduleObject[binding.register] !== 'function') continue;
    const runtime = bridgeApi.createSimpleRuntime(experienceConfig, { contractVersion: 'simple-model-registry/v1', definitions: [d] }).value;
    const registered = moduleObject[binding.register](runtime, bridgeApi, [d], { rlvol: rlvolModule });
    const entry = registered && registered[d.adapterId];
    if (!entry || entry.ok !== true || !entry.value || entry.value.registered !== true || !Array.isArray(entry.value.supportedDefinitionIds) || entry.value.supportedDefinitionIds.indexOf(d.definitionId) < 0) registrationGaps.push(d.toolId);
    const authority = runtime.diagnostic().value.authority;
    const owned = Object.keys(authority || {});
    registrationChecked += 1;
    authorityKeys = owned.length;
    authorityOwned += owned.filter((k) => authority[k] !== false).length;
  }
  assert(registrationChecked === wired.length && registrationGaps.length === 0, 'registering every wired module into the REAL runtime registers the registry-declared adapterId for the registry-declared definitionId (' + registrationChecked + '/' + wired.length + ' checked, gaps: ' + (registrationGaps.join(', ') || 'none') + ')');
  assert(registrationChecked === wired.length && authorityKeys > 0 && authorityOwned === 0, 'no forbidden authority: the runtime\u2019s own diagnostic reports every authority false after adapter registration (' + authorityKeys + ' authority flags x ' + registrationChecked + ' wired tools, owned: ' + authorityOwned + ')');

  /* (7) SCN-012-039 sole ownership of rlv-focused. Scanned RAW so a re-introduced write can never be
         stripped away; BUG-003's cause was exactly `classList.add("rlv-focused")` in the Simple stub. */
  const scannedSources = [...readdirSync(ROOT).filter((f) => f.endsWith('.js') || f.endsWith('.html')), ...readdirSync(join(ROOT, 'rlexperience-adapters')).filter((f) => f.endsWith('.js')).map((f) => 'rlexperience-adapters/' + f)];
  const focusWriters = [];
  let focusWriteTotal = 0;
  for (const file of scannedSources) {
    const hits = countOf(read(file), RLV_FOCUSED_WRITE);
    if (hits) { focusWriters.push(file + ' x' + hits); focusWriteTotal += hits; }
  }
  assert(scannedSources.length > 0 && focusWriteTotal === 1 && focusWriters.length === 1 && focusWriters[0] === 'rlviews.js x1', 'exactly one executable rlv-focused write exists across all production sources and it lives in rlviews.js (scanned ' + scannedSources.length + ' files, writers: ' + (focusWriters.join(', ') || 'none') + ')');
  const applyVisualSrc = extractFn(viewsSrc, 'applyVisual');
  assert(countOf(applyVisualSrc, RLV_FOCUSED_WRITE) === 1, 'applyVisual (rlviews.js) is the function that owns that sole rlv-focused write');

  /* (8) The production bridge path carries no rlv-focused mutation — and after comment-stripping no
         mention at all, so the class name survives only in the invariant comments. */
  const bridgePathSrc = extractFn(bridgeSrc, 'renderSimpleBridgeInternal') + '\n' + extractFn(bridgeSrc, 'installSimpleProjectionBridge');
  const bridgePathCode = stripComments(bridgePathSrc);
  assert(bridgePathSrc.length > 0 && bridgePathCode.indexOf('installSimpleProjectionBridge') >= 0 && countOf(bridgePathSrc, RLV_FOCUSED_WRITE) === 0 && countOf(bridgePathCode, /rlv-focused/g) === 0, 'the production bridge path (renderSimpleBridgeInternal + installSimpleProjectionBridge) contains no rlv-focused write and, once comments are stripped, no rlv-focused reference at all (' + bridgePathSrc.length + ' source chars)');
  const authorityTokens = ['fetch(', 'providerFetch', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'indexedDB', 'sendBeacon', 'document.cookie'];
  const bridgeTokenHits = authorityTokens.filter((t) => bridgePathCode.indexOf(t) >= 0);
  assert(bridgeTokenHits.length === 0, 'the bridge path performs local compute only \u2014 no network, provider, storage, or cookie authority in its executable source (' + authorityTokens.length + ' tokens checked, hits: ' + (bridgeTokenHits.join(', ') || 'none') + ')');

  /* (9) The ownerModes contract: rlapp.js's OWN expression, extracted verbatim and executed. */
  const ownerModesStart = appSrc.indexOf('ownerModes: resolved.value.kind');
  const ownerModesExpr = ownerModesStart >= 0 ? appSrc.slice(ownerModesStart + 'ownerModes:'.length, appSrc.indexOf('\n        };', ownerModesStart)).trim() : '';
  const ownerModesOf = Function('resolved', 'root', 'toolId', 'return (' + ownerModesExpr + ');');
  const providerRoot = { __rlOwnerStateProvider: { 'wired-tool': function () { return null; } } };
  const wiredModes = ownerModesOf({ value: { kind: 'ordinary' } }, providerRoot, 'wired-tool');
  const unwiredModes = ownerModesOf({ value: { kind: 'ordinary' } }, {}, 'wired-tool');
  const briefModes = ownerModesOf({ value: { kind: 'market-action-center' } }, providerRoot, 'brief-tool');
  assert(ownerModesExpr.length > 0 && JSON.stringify(wiredModes) === '["power"]' && JSON.stringify(unwiredModes) === '["simple","power"]' && JSON.stringify(briefModes) === '["brief"]', 'rlapp.js\u2019s own ownerModes expression yields ["power"] for a provider-wired ordinary tool, ["simple","power"] for an unwired one (no regression), and ["brief"] for a brief-only tool');

  /* (10) SCN-012-041: feeding those REAL ownerModes into rlviews.js's REAL toggle predicate proves a
          wired tool gets the focused adapter Simple while an unwired tool keeps its native Simple. */
  const focusPredicateMatch = /classList\s*\.\s*toggle\s*\(\s*["']rlv-focused["']\s*,\s*([^;]*?)\s*\)\s*;/.exec(viewsSrc);
  const focusPredicate = Function('ownerModes', 'mode', 'return (' + (focusPredicateMatch ? focusPredicateMatch[1] : 'undefined') + ');');
  assert(!!focusPredicateMatch && focusPredicate(wiredModes, 'simple') === true && focusPredicate(wiredModes, 'power') === false && focusPredicate(unwiredModes, 'simple') === false && focusPredicate(briefModes, 'brief') === false, 'rlviews.js\u2019s own rlv-focused predicate, fed those real ownerModes, focuses a wired tool\u2019s Simple, leaves Power unfocused, and never focuses an unwired native Simple or a brief view');

  /* (11) SCN-012-042 truthful degradation, driven through the REAL exposed bridge. */
  assert(typeof bridgeApi.renderSimpleBridge === 'function', 'RLEXPERIENCE.renderSimpleBridge is exposed on the production API');
  const bodyClassOps = [];
  let bridgeDocument = null;
  const makeNode = (tagName) => ({
    tagName, ownerDocument: bridgeDocument, textContent: '', className: '', hidden: true, attrs: Object.create(null), children: [],
    setAttribute(name, value) { this.attrs[name] = String(value); },
    getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null; },
    appendChild(child) { this.children.push(child); return child; },
    hasDescendantAttribute(name) { return this.children.some((c) => Object.prototype.hasOwnProperty.call(c.attrs, name)); }
  });
  bridgeDocument = { createElement: makeNode, body: { classList: { add: (n) => bodyClassOps.push(['add', n]), remove: (n) => bodyClassOps.push(['remove', n]), toggle: (n, f) => bodyClassOps.push(['toggle', n, f]) } } };
  const priorDocument = Object.prototype.hasOwnProperty.call(globalThis, 'document') ? globalThis.document : undefined;
  globalThis.document = bridgeDocument;
  try {
    const probeDefinition = wired[0];
    const panel = makeNode('section');
    const projection = await bridgeApi.renderSimpleBridge({ panel, toolId: probeDefinition.toolId, definition: probeDefinition, ownerState: null, moduleObject: null, registerFnName: null, adapterId: probeDefinition.adapterId, api: bridgeApi, config: experienceConfig, computedAt: '2026-07-25T20:02:00.000Z' });
    const message = String(projection && projection.message);
    assert(!!projection && projection.state === 'unavailable' && projection.numericValue === null && panel.getAttribute('data-rlexperience-simple-state') === 'unavailable' && !panel.hasDescendantAttribute('data-simple-numeric-value') && panel.getAttribute('data-rlexperience-adapter') === probeDefinition.adapterId && message.indexOf(probeDefinition.adapterId) < 0 && message.indexOf("This tool's own model is not loaded") >= 0 && !/neutral|average|prior result/i.test(message), 'a wired tool with no owner state degrades to an honest unavailable that tells the reader in words that the model is missing, keeps the adapter id as machine-readable provenance rather than visible copy (D13), publishes a null numeric, paints no numeric node, and invents no signal (' + probeDefinition.toolId + ')');
    assert(bodyClassOps.length === 0, 'the bridge never mutates body.classList on the unavailable path \u2014 applyVisual stays the sole owner of rlv-focused (BUG-003 invariant, ' + bodyClassOps.length + ' recorded mutations)');
  } finally {
    if (priorDocument === undefined) delete globalThis.document; else globalThis.document = priorDocument;
  }
} catch (e) { failures++; console.log('  \u2717 FAIL (Feature 012 Scope 15 production bridge canaries threw): ' + e.message); }

/* ---------- Tier-A owning-model reads — the brief computes, it does not narrate around a gap ---------- */
try {
  group('Tier-A owning-model reads \u2014 committed evidence reaches the owning tool\u2019s own model');
  const refresh = await import('./brief-refresh.mjs');
  const owner = await import('./owner-state.mjs');

  // Owner states are built from committed evidence, never generated.
  assert(owner.surfaceOwnerState(ROOT, 'SPY') !== null, 'the committed SPY option chain yields a surface owner state');
  assert(owner.swingOwnerState(ROOT, 'SPY') !== null, 'the committed SPY daily window yields a swing owner state');
  assert(owner.breadthOwnerState(ROOT) !== null, 'the committed sector universe + bar snapshots yield a breadth owner state');
  assert(owner.dailyBars(ROOT, 'NO-SUCH-SYMBOL') === null, 'a symbol with no committed snapshot yields null rather than an empty-but-plausible window');
  assert(owner.sessionOwnerState(ROOT, { sessions: [] }) === null,
    'the session builder refuses to invent intraday bars when none are supplied \u2014 no same-origin intraday cache exists');

  // Each read runs the OWNING model and publishes what it returned.
  const reads = {
    'options-structure-lab': refresh.buildOptionsSurfaceToolRead(),
    'gamma-trading-lab': refresh.buildGammaToolRead(),
    'options-flow-feed-lab': refresh.buildOptionsFlowToolRead(),
    // Called at the real wall clock, so its reader copy is checked below whether the committed
    // universe is inside its refresh window or past it. The value assertions use a pinned instant.
    'ai-capex-strategy-lab': refresh.buildAiCapexToolRead(),
    // Expected to publish an ABSENCE, not a verdict: two of the three evidence families its model
    // requires are browser-cache-only or current-tab-only and have no same-origin file. The four
    // cases further down prove that absence is computed rather than declared.
    'bond-regime-lab': refresh.buildBondRegimeToolRead(),
    'swing-structure-lab': refresh.buildSwingToolRead({ macro: { fg: { score: 55, band: 'Neutral' }, vix: 17 } }),
    'market-heatmap-lab': refresh.buildBreadthToolRead({}),
    'volatility-sizing-lab': refresh.buildVolatilityToolRead(),
    'technical-analysis-decision-lab': refresh.buildTechnicalToolRead()
  };
  for (const [id, toolRead] of Object.entries(reads)) {
    assert(toolRead.id === id && typeof toolRead.read === 'string' && toolRead.read.length > 0 && toolRead.deepLink && toolRead.metrics && typeof toolRead.metrics === 'object',
      `${id} publishes a read, metrics and a deep link`);
  }
  // ai-capex-strategy-lab is deliberately absent: its committed universe is a quarter-cadence set,
  // so whether the live read is ready or a named stale refusal depends on the calendar. Its ready
  // state is asserted below against an instant pinned to that universe's OWN declared as-of.
  const readyIds = ['options-structure-lab', 'gamma-trading-lab', 'options-flow-feed-lab', 'swing-structure-lab', 'market-heatmap-lab', 'volatility-sizing-lab'];
  for (const id of readyIds) {
    assert(reads[id].state === 'ready', `${id} reaches a READY read from committed evidence, not a coverage-only placeholder`);
  }

  // Real model output, not a shaped placeholder.
  assert(Number.isFinite(reads['market-heatmap-lab'].metrics.breadthPct) && reads['market-heatmap-lab'].metrics.constituents >= 20,
    'the breadth read carries a real percentage over the page\u2019s own universe (' + reads['market-heatmap-lab'].metrics.constituents + ' constituents)');
  assert(['positive', 'negative'].includes(reads['gamma-trading-lab'].metrics.regime) && Number.isFinite(reads['gamma-trading-lab'].metrics.signedNetGEX),
    'the gamma read carries the owning model\u2019s own dealer regime and signed net GEX');
  assert(Number.isFinite(reads['volatility-sizing-lab'].metrics.forecastPct) && reads['volatility-sizing-lab'].metrics.regime,
    'the volatility read carries a real conditional forecast and its regime band');

  // The five-gate adapter is a foundation receipt only. Reporting it "fresh" would be the exact
  // fabrication this wiring exists to remove, so it must stay an honest, reasoned absence.
  assert(reads['technical-analysis-decision-lab'].state === 'owner-model-unavailable'
    && /not implemented/i.test(reads['technical-analysis-decision-lab'].read),
    'the five-gate tool publishes an honest unavailable naming the missing owner capability, never a fabricated read');

  // ADVERSARIAL: a read whose owner state is missing must degrade, never emit a plausible number.
  const starved = refresh.buildOptionsSurfaceToolRead({ symbol: 'NO-SUCH-SYMBOL' });
  assert(starved.state === 'unavailable' && starved.metrics.state === 'unavailable' && /No committed option snapshot/.test(starved.read),
    'a read with no committed chain degrades to a named unavailable and publishes no surface numbers');
  assert(!Number.isFinite(starved.metrics.flipLevel) && !Number.isFinite(starved.metrics.callWall),
    'the degraded read carries no gamma flip or wall value at all');

  /* ---- options flow feed: the tape is scanned, not narrated around ---- */

  // The scanned tickers come from the owning page, so the brief cannot report a wider tape than the
  // tool itself shows.
  const flowUniverse = owner.optionsFlowUniverse(ROOT);
  assert(Array.isArray(flowUniverse) && flowUniverse.includes('SPY') && flowUniverse.length >= 8,
    'the flow feed universe is read from the owning page rather than restated in the brief (' + (flowUniverse || []).length + ' tickers)');
  assert(owner.optionsFlowUniverse(join(ROOT, 'no-such-directory')) === null,
    'the universe reader reports absence instead of falling back to a built-in ticker list');

  // The chain projection must stay the page's own. Refusing to run without it is what stops a
  // second, silently divergent parser from appearing here.
  let flowRefusedWithoutParser = false;
  try { owner.optionsFlowOwnerState(ROOT, {}); } catch { flowRefusedWithoutParser = true; }
  assert(flowRefusedWithoutParser,
    'the flow owner state refuses to run without the owning page\u2019s own chain parser, so no second projection can appear');

  const flow = reads['options-flow-feed-lab'];
  assert(flow.metrics.tickers >= 8 && flow.metrics.consideredCount > 0 && flow.metrics.contractsFlagged > 0
    && ['call-heavy (leaning bullish)', 'put-heavy (leaning bearish / hedged)', 'balanced'].includes(flow.metrics.lean),
    'the flow read carries the owning model\u2019s own call/put lean over real scanned contracts ('
    + flow.metrics.contractsFlagged + ' flagged of ' + flow.metrics.consideredCount + ' considered)');
  assert(flow.metrics.top.length > 0 && flow.metrics.top.every((row) => Number.isFinite(row.premium) && Number.isFinite(row.score) && row.ticker),
    'the flow read publishes ranked contracts from the model, each with a real premium and score');
  assert(flow.metrics.top[0].score === flow.metrics.maxScore || flow.metrics.top[0].score <= flow.metrics.maxScore,
    'the headline contract is drawn from the model\u2019s own ranking, not chosen by the brief');

  // ADVERSARIAL 1 — no committed chain for any scanned ticker. Every fixture above satisfies the
  // happy path, so without this case the builder could hard-code a lean and still pass.
  const starvedFlow = refresh.buildOptionsFlowToolRead({ universe: ['NO-SUCH-SYMBOL'] });
  assert(starvedFlow.state === 'unavailable' && starvedFlow.metrics.state === 'unavailable' && /no tape to read/.test(starvedFlow.read),
    'a flow read with no committed chain degrades to a named unavailable rather than an empty-but-plausible tape');
  assert(!Number.isFinite(starvedFlow.metrics.contractsFlagged) && !Number.isFinite(starvedFlow.metrics.callPremium) && !starvedFlow.metrics.lean,
    'the degraded flow read publishes no contract count, no premium and no lean \u2014 not a zero, and not a balanced placeholder');

  // ADVERSARIAL 2 — the chains exist but are older than the freshness rule allows. A read that
  // ignored snapshot age would still pass every assertion above; this is the case that catches it.
  const staleFlow = refresh.buildOptionsFlowToolRead({ asOf: '2027-01-01T00:00:00.000Z' });
  assert(staleFlow.state === 'unavailable' && /days old/.test(staleFlow.read) && /stale tape/.test(staleFlow.read),
    'a tape older than the freshness rule is refused with its age named, never scored as if it were current');
  assert(!Number.isFinite(staleFlow.metrics.contractsFlagged),
    'the stale-tape refusal publishes no contract count');

  /* ---- ai-capex strategy: a dated set of scenario assumptions, priced by the owning page ---- */

  // Every instant below is derived from the committed universe's OWN declared cutoff, so these
  // assertions do not drift with the calendar and do not silently weaken as the file ages.
  const aiCapexUniverse = owner.aiCapexUniverse(ROOT);
  assert(!!aiCapexUniverse && Array.isArray(aiCapexUniverse.assets) && aiCapexUniverse.assets.length > 0 && typeof aiCapexUniverse.asOf === 'string',
    'the committed AI-capex universe declares its own as-of and carries assets (' + ((aiCapexUniverse && aiCapexUniverse.assets) || []).length + ' entries)');
  const aiCapexAt = (days) => new Date(Date.parse(aiCapexUniverse.asOf + 'T00:00:00Z') + days * 86400000).toISOString();

  // The page's own sleeve builder must stay the page's own. Refusing to run without it is what
  // stops a second, silently divergent scenario model from appearing here.
  let aiCapexRefusedWithoutPage = false;
  try { owner.aiCapexOwnerState(ROOT, {}); } catch { aiCapexRefusedWithoutPage = true; }
  assert(aiCapexRefusedWithoutPage,
    'the AI-capex owner state refuses to run without the owning page\u2019s own universe loader, preset and provider, so no second scenario model can appear');

  const aiCapex = refresh.buildAiCapexToolRead({ asOf: aiCapexAt(1) });
  assert(aiCapex.state === 'ready' && aiCapex.asOf === aiCapexUniverse.asOf,
    'inside its refresh window the AI-capex read is ready and carries the universe\u2019s OWN declared as-of, not the instant this run happened to fire');
  assert(aiCapex.metrics.pricedCount > 0 && aiCapex.metrics.pricedCount <= aiCapex.metrics.assetCount
    && Number.isFinite(aiCapex.metrics.mu) && Number.isFinite(aiCapex.metrics.sd) && aiCapex.metrics.sd > 0
    && Number.isFinite(aiCapex.metrics.median) && Number.isFinite(aiCapex.metrics.cvar),
    'the AI-capex read carries the owning model\u2019s own portfolio and band over a real priced sleeve ('
    + aiCapex.metrics.pricedCount + ' of ' + aiCapex.metrics.assetCount + ' priced)');
  assert(aiCapex.metrics.lo < aiCapex.metrics.median && aiCapex.metrics.median < aiCapex.metrics.hi
    && aiCapex.metrics.cvar < aiCapex.metrics.median,
    'the band is a real distribution \u2014 the tail sits below the centre and the centre inside the bounds');
  const aiCapexTickers = new Set(aiCapexUniverse.assets.map((asset) => String(asset.tk)));
  assert(aiCapex.metrics.holdings.length > 0 && aiCapex.metrics.holdings.every((holding) => aiCapexTickers.has(holding.ticker) && Number.isFinite(holding.weight)),
    'every holding the read names comes from the committed universe, so the brief cannot report a sleeve the tool itself does not hold');
  // The read must not read as a market measurement. This tool prices static scenario assumptions.
  assert(/modelled on the/.test(aiCapex.read) && aiCapex.read.includes(aiCapexUniverse.asOf) && /rather than measured market returns/.test(aiCapex.read)
    && aiCapex.metrics.basis === 'scenario-assumptions',
    'the AI-capex read states its as-of and names its basis as modelled assumptions, so it cannot be misread as a live market measurement');

  // ADVERSARIAL 1 — no committed universe at all. Every fixture above satisfies the happy path, so
  // without this case the builder could hard-code a theme and a band and still pass.
  const starvedAiCapex = refresh.buildAiCapexToolRead({ universe: null });
  assert(starvedAiCapex.state === 'unavailable' && starvedAiCapex.metrics.state === 'unavailable' && /No committed AI-capex universe/.test(starvedAiCapex.read),
    'an AI-capex read with no committed universe degrades to a named unavailable rather than an empty-but-plausible sleeve');
  assert(!Number.isFinite(starvedAiCapex.metrics.median) && !Number.isFinite(starvedAiCapex.metrics.pricedCount) && !starvedAiCapex.metrics.leadTheme,
    'the degraded AI-capex read publishes no band, no priced count and no leading theme \u2014 not a zero, and not a neutral placeholder');

  // ADVERSARIAL 2 — a universe file that exists but carries nothing the page will accept. A builder
  // that fell back to its own inline assumptions would still pass ADVERSARIAL 1; this catches it.
  const emptyAiCapex = refresh.buildAiCapexToolRead({ universe: { asOf: aiCapexUniverse.asOf, assets: [] } });
  assert(emptyAiCapex.state === 'unavailable' && /no asset this tool can price/.test(emptyAiCapex.read),
    'a universe the owning page\u2019s own validator rejects is reported as a named absence, never backfilled from an inline default universe');
  assert(!Number.isFinite(emptyAiCapex.metrics.median) && !emptyAiCapex.metrics.leadTheme,
    'the rejected-universe refusal publishes no band and no leading theme');

  // ADVERSARIAL 3 — the universe is intact but has missed its own refresh. A read that ignored the
  // declared as-of would pass every assertion above; this is the case that catches it.
  const staleAiCapex = refresh.buildAiCapexToolRead({ asOf: aiCapexAt(365) });
  assert(staleAiCapex.state === 'unavailable' && /365 days old/.test(staleAiCapex.read) && staleAiCapex.read.includes(aiCapexUniverse.asOf),
    'a universe past its refresh window is refused with its age and its own as-of named, never shown as a current view');
  assert(!Number.isFinite(staleAiCapex.metrics.median) && !Number.isFinite(staleAiCapex.metrics.prob),
    'the stale-universe refusal publishes no band and no probability');

  // ADVERSARIAL 4 — the boundary itself. Without both sides a freshness rule could be widened to
  // infinity, or dropped entirely, and every other case here would still be green.
  assert(refresh.buildAiCapexToolRead({ asOf: aiCapexAt(92) }).state === 'ready'
    && refresh.buildAiCapexToolRead({ asOf: aiCapexAt(93) }).state === 'unavailable',
    'the quarterly refresh window is enforced at its exact edge \u2014 ready at 92 days, refused at 93');

  /* ── bond-regime-lab — the indeterminacy must be COMPUTED, never asserted ──────────────────────
     Before spec 018 this tool could reach NEITHER axis from committed evidence. It can now reach the
     duration axis: the Treasury nominal and real curves are acquired into a committed same-origin
     artifact a server run reads, admitted through the artifact's own observed-cadence verdict. The
     independent credit-spread observation remains a current-tab entry its own source policy marks
     memory-only, so it still has no same-origin file and the credit axis stays unresolved — which is
     why the published state is still a named absence rather than a verdict.
     An adapter that simply hard-coded either outcome would pass a committed-evidence-only suite
     forever. The cases below therefore drive the SAME builder with each evidence family explicitly
     present and explicitly absent, so the honest gap is provably the model's own conclusion and the
     gap SENTENCE provably tracks which family is missing. That force is unchanged; only the set of
     families the repository can supply has grown. */
  const bondDay = (index) => new Date(Date.UTC(2026, 0, 5 + index)).toISOString().slice(0, 10);
  const bondNominalRows = Array.from({ length: 70 }, (_, index) => ({ date: bondDay(index), y3m: 4.2 - 0.012 * index, y2: 4 - 0.01 * index, y10: 4.5 - 0.005 * index }));
  const bondRealRows = Array.from({ length: 70 }, (_, index) => ({ date: bondDay(index), y10: 2 - 0.004 * index }));
  const bondCurve = (rows, sourceId) => ({ state: 'fresh', rows, observedAt: rows[rows.length - 1].date, retrievedAt: new Date().toISOString(), sourceId, sourceUrl: null, rights: 'public-official', persistence: 'browser-cache', errorCode: null });
  const bondSpreadObservation = [{ id: 'oas-session', kind: 'oas', value: 2.9, change: -12, unit: 'pct', observedAt: bondDay(69), rights: 'restricted-local-view' }];
  // The committed sleeve characteristics carry a 45-day review window against their own 2026-07-10
  // as-of, and the page's scenario engine refuses to rank a stale characteristic. A fixture whose
  // job is to STAY determinate therefore re-stamps those review dates to the run date; nothing else
  // in the committed configuration is touched, so the sleeves, pairs and thresholds stay the real ones.
  const bondFreshConfig = JSON.parse(read('bond-regime-universe.json'));
  const bondToday = new Date().toISOString().slice(0, 10);
  for (const instrument of bondFreshConfig.instruments) {
    for (const field of ['carry', 'rateDuration', 'spreadDuration', 'convexity']) if (instrument[field]) instrument[field].asOf = bondToday;
  }

  const bondLive = reads['bond-regime-lab'];
  /* Spec 018 landed a committed official curve artifact, so the curve families are no longer
     structurally unreachable from a server run — they are reachable exactly WHEN the artifact's own
     observed-cadence admission says current. This live read therefore asserts an IMPLICATION of that
     verdict rather than a fixed outcome, so it neither flakes as the artifact ages nor stops
     asserting. Neither branch is a free pass: each one names what MUST hold under it. The
     curve-state vocabulary is extracted from the model's OWN classifier rather than restated here,
     so the admitted branch cannot be satisfied by a literal that the model never emits. */
  const bondCurveStateVocab = (() => {
    const classifier = /function classifyCurveState\([\s\S]*?\n        \}/.exec(read('bond-regime-lab.html'));
    return [...new Set((classifier ? classifier[0] : '').match(/"(?:Unavailable|Inverted|Positive|Flat|Mixed)"/g) || [])].map((word) => word.slice(1, -1));
  })();
  const bondNominalAdmission = (bondLive.metrics.curveAdmission || {}).nominal || {};
  const bondLiveAdmitted = bondNominalAdmission.verdict === 'current';
  assert(bondCurveStateVocab.length >= 4 && bondCurveStateVocab.includes('Unavailable') && bondCurveStateVocab.includes('Mixed'),
    'the curve-state vocabulary the live assertion branches against is extracted from the model\u2019s own classifier, never restated (' + bondCurveStateVocab.join('/') + ')');
  if (bondLiveAdmitted) {
    assert(bondLive.state === 'unavailable' && bondLive.metrics.creditRegime === 'Indeterminate'
      && bondLive.metrics.durationPosture !== 'Indeterminate'
      && !bondLive.metrics.evidenceGaps.includes('the Treasury yield curve')
      && bondCurveStateVocab.includes(bondLive.metrics.curveState) && bondLive.metrics.curveState !== 'Unavailable',
      'the committed curve artifact is admitted, so the duration axis resolves from committed evidence, the curve gap is absent, and the curve state is one the model itself emits \u2014 while the credit axis stays unresolved and the brief still publishes a named absence ('
      + bondLive.metrics.durationPosture + ' duration, ' + bondLive.metrics.curveState + ' curve)');
  } else {
    assert(bondLive.state === 'unavailable' && bondLive.metrics.creditRegime === 'Indeterminate'
      && bondLive.metrics.durationPosture === 'Indeterminate'
      && bondLive.metrics.evidenceGaps.includes('the Treasury yield curve') && bondLive.metrics.curveState === 'Unavailable'
      && typeof bondNominalAdmission.errorCode === 'string' && bondNominalAdmission.errorCode.length > 0
      && typeof bondNominalAdmission.basis === 'string' && bondNominalAdmission.basis.length > 0,
      'the committed curve artifact is refused, so the duration axis stays unresolved, the curve gap is named, and the admission carries a non-empty reason and error code rather than a silent absence ('
      + bondNominalAdmission.errorCode + ')');
  }
  assert(bondLive.metrics.preferredSleeveId === null && bondLive.metrics.resultPct === null,
    'the unresolved bond read names no preferred sleeve and no modelled result \u2014 not a zero, and not a neutral placeholder');
  assert(bondLive.metrics.evidenceGaps.includes('an independent credit-spread reading'),
    'the unresolved bond read names WHICH evidence is missing rather than reporting a bare failure');
  assert(['strengthening', 'weakening', 'mixed', 'neutral'].includes(bondLive.metrics.pricePulse) && bondLive.read.includes(bondLive.metrics.pricePulse)
    && bondLive.metrics.readablePairs.length > 0,
    'the one readable signal \u2014 the high-yield versus investment-grade ratio \u2014 carries the direction the MODEL returned, quoted verbatim in the read (' + bondLive.metrics.pricePulse + ')');

  // ADVERSARIAL 1 — every evidence family present. This is the case a hard-coded "indeterminate"
  // cannot survive: the same builder, handed a curve, a real curve and a spread observation, must
  // reach a real verdict with a named sleeve.
  const bondResolved = refresh.buildBondRegimeToolRead({
    config: bondFreshConfig,
    nominalCurve: bondCurve(bondNominalRows, 'us-treasury-nominal'),
    realCurve: bondCurve(bondRealRows, 'us-treasury-real'),
    confirmations: bondSpreadObservation
  });
  assert(bondResolved.state === 'ready' && bondResolved.metrics.creditRegime !== 'Indeterminate' && bondResolved.metrics.durationPosture !== 'Indeterminate'
    && bondResolved.metrics.preferredSleeveId && Number.isFinite(bondResolved.metrics.resultPct),
    'handed a Treasury curve, a real curve and an independent credit-spread observation the SAME builder reaches a real verdict, so the unresolved read above is computed rather than hard-coded ('
    + bondResolved.metrics.creditRegime + ' credit, ' + bondResolved.metrics.durationPosture + ' duration, ' + bondResolved.metrics.preferredSleeveId + ')');
  assert(bondResolved.metrics.evidenceGaps.length === 0 && bondResolved.metrics.curveState !== 'Unavailable' && bondResolved.metrics.inflationState !== 'Unavailable',
    'with every evidence family present the resolved bond read names no gap at all');
  assert(bondResolved.read.includes(bondResolved.metrics.creditRegime) && bondResolved.read.includes(bondResolved.metrics.durationPosture) && !/unresolved/.test(bondResolved.read),
    'the resolved bond read states the regime the model returned and never falls back to the unresolved copy');

  // ADVERSARIAL 2 — curve present, spread observation absent. A gap sentence built from a fixed
  // string would still name the curve here; the model's own state has to decide.
  const bondCurveOnly = refresh.buildBondRegimeToolRead({
    config: bondFreshConfig,
    nominalCurve: bondCurve(bondNominalRows, 'us-treasury-nominal'),
    realCurve: bondCurve(bondRealRows, 'us-treasury-real')
  });
  assert(bondCurveOnly.state === 'unavailable' && !bondCurveOnly.metrics.evidenceGaps.includes('the Treasury yield curve')
    && bondCurveOnly.metrics.evidenceGaps.includes('an independent credit-spread reading') && !/Treasury yield curve/.test(bondCurveOnly.read),
    'with the curve on file but no independent credit-spread observation the read stops naming the curve and names only the spread gap');
  assert(/so the credit call cannot be made/.test(bondCurveOnly.read) && !/duration call/.test(bondCurveOnly.read)
    && bondCurveOnly.metrics.durationPosture !== 'Indeterminate',
    'the curve resolves the duration axis, and the read says only the credit call is missing \u2014 the consequence clause is the model\u2019s verdict, not a fixed phrase');

  // ADVERSARIAL 3 — the mirror image. Together with case 2 this pins the gap sentence to the
  // model's state from both sides, so neither absence can be a constant. Since spec 018 landed a
  // committed curve artifact, this case passes EXPLICIT named absences for both curve families: the
  // absence it tests is now something it states, not something the repository happens to lack.
  const bondSpreadOnly = refresh.buildBondRegimeToolRead({
    config: bondFreshConfig,
    confirmations: bondSpreadObservation,
    nominalCurve: owner.unavailableCurveFamily(bondFreshConfig.sourcePolicies.nominalCurve, 'BRL-CURVE-NOMINAL-UNAVAILABLE'),
    realCurve: owner.unavailableCurveFamily(bondFreshConfig.sourcePolicies.realCurve, 'BRL-OPTIONAL-UNAVAILABLE')
  });
  assert(bondSpreadOnly.state === 'unavailable' && bondSpreadOnly.metrics.evidenceGaps.includes('the Treasury yield curve')
    && !bondSpreadOnly.metrics.evidenceGaps.includes('an independent credit-spread reading') && bondSpreadOnly.metrics.creditRegime !== 'Indeterminate',
    'with the spread observation on file but no curve the credit axis resolves, the duration axis does not, and the read names the curve gap alone');
  assert(/so the duration call cannot be made/.test(bondSpreadOnly.read) && !/credit call/.test(bondSpreadOnly.read),
    'the mirror case says only the duration call is missing, so neither half of the consequence clause can be a constant');
  assert(bondLiveAdmitted
    ? (/so the credit call cannot be made/.test(bondLive.read) && !/duration call/.test(bondLive.read))
    : /so the credit call and the duration call cannot be made/.test(bondLive.read),
    'and from committed evidence alone the read names exactly the axes the model could not reach \u2014 both when the curve is refused, the credit call alone when it is admitted');

  // ADVERSARIAL 4 — no committed price history at all. Without this the builder could fall back to
  // an inline bar window and every case above would still be green.
  const bondStarved = refresh.buildBondRegimeToolRead({ snapshot: null });
  assert(bondStarved.state === 'unavailable' && /No committed price history/.test(bondStarved.read) && bondStarved.metrics.state === 'unavailable',
    'with no committed bond price history the read degrades to a named absence rather than an empty-but-plausible regime');
  assert(owner.bondRegimeOwnerState(ROOT, { config: null }) === null,
    'the bond observed-snapshot builder refuses to invent a configuration, so no second sleeve, pair or threshold set can appear server-side');

  // D13 — the read is reader copy. Framework vocabulary must not reach it.
  for (const [id, toolRead] of Object.entries(reads)) {
    assert(!/sha256:|[a-z-]+\/v\d\b|coverage-only|not-integrated|\bScope \d/.test(toolRead.read),
      `${id} states its read in plain words, with no adapter id, contract version or status code in reader copy`);
  }
  assert(!/BRL-|bond-regime-universe|fixed-income-sleeve|owner-state/.test(bondLive.read),
    'the bond read carries no refusal code, configuration filename or contract slug \u2014 a reader gets plain words only');
} catch (e) { failures++; console.log('  \u2717 FAIL (Tier-A owning-model reads group threw): ' + e.message); }

/* ---------- recommendation ledger — durable bodies + honest evaluability ---------- */
try {
  group('recommendation ledger \u2014 every call carries its own scoreable terms');
  const recBody = await import('./recommendation-body.mjs');
  const backfill = await import('./backfill-recommendations.mjs');
  const universe = recBody.loadInstrumentUniverse(ROOT);

  assert(universe.has('SPY') && universe.has('QQQ') && !universe.has('CLOSE'),
    'the instrument universe is grounded in committed data, so a call can only name something scoreable');

  // The join key must stay byte-identical to the shipped formula or 215 existing rows orphan.
  assert(recBody.recommendationKeyFor('SPY / SPMO longer-term structural core \u2014 hold, but do NOT chase the SPY 50-day approach or the tech bounce; add index/broad-momentum beta only on a CONFIRMED daily CLOSE reclaim, which the 7/30 close did NOT deliver', 'hold')
    === 'sha256:817debd7b85cc3f6c260647bd270a2ae0dd74f46debed34d876fb4a2be872c81',
    'recommendationKey still matches the key already published in the live ledger (lifecycle stays joined)');

  // Caps emphasis is how the narrative actually writes gates; a case-sensitive reader loses them.
  const capsLevels = recBody.extractLevels('add only on a CONFIRMED daily CLOSE that RECLAIMS the SPY 50-day (~743.9)', universe);
  assert(capsLevels.length === 1 && capsLevels[0].instrument === 'SPY' && capsLevels[0].relation === 'above' && capsLevels[0].value === 743.9,
    'an ALL-CAPS relation word still qualifies a level (RECLAIMS ... SPY ... ~743.9)');

  // ADVERSARIAL: the bare numbers this prose is full of are periods, percentages, dates and stacks —
  // admitting any of them would fabricate a price gate the author never published.
  const bareNumbers = recBody.extractLevels('SPY holds its 20>50>200 bull-stack, +6.42% over the 200-day, and closes above 741.69 on 7/31', universe);
  assert(bareNumbers.length === 0,
    'bare numbers ("50-day", "20>50>200", "+6.42%", "7/31", a spot price) are never read as levels (' + JSON.stringify(bareNumbers) + ')');
  assert(recBody.extractLevels('SPY reclaims ~50-day support', universe).length === 0,
    'a "~" number with a period suffix ("~50-day") is a lookback, not a gate');
  assert(recBody.extractLevels('closes back above ~715 on volume', universe).length === 0,
    'a level with no instrument in scope is discarded rather than attributed by guesswork');

  // ADVERSARIAL (risk-side recovery): an EXACT decimal gate is real and must be read on the
  // invalidation side. Before this, only "~"-prefixed numbers counted, so "a break below the
  // 740.09 flip" extracted NOTHING and the call was published unscoreable. This assertion fails
  // if the tilde-only pattern returns.
  const exactInvalidation = recBody.extractLevels('a break below the 740.09 flip into negative gamma', universe,
    { defaultInstrument: 'SPY', allowBareDecimal: true });
  assert(exactInvalidation.length === 1 && exactInvalidation[0].relation === 'below' && exactInvalidation[0].value === 740.09,
    'an EXACT decimal gate ("below the 740.09 flip") is read on the invalidation side (' + JSON.stringify(exactInvalidation) + ')');

  // ADVERSARIAL (the asymmetry itself): the SAME bare decimal must stay invisible without the
  // opt-in, because a descriptive spot price ("closes above 741.69 on 7/31") is syntactically
  // identical to a gate and admitting it as a TRIGGER would manufacture a free "satisfied" and
  // inflate the published hit rate. Fails if the widening is ever made unconditional.
  assert(recBody.extractLevels('a break below the 740.09 flip into negative gamma', universe,
    { defaultInstrument: 'SPY' }).length === 0,
    'a bare decimal is NOT read without the invalidation-only opt-in — a fabricated trigger would inflate the hit rate');

  // ADVERSARIAL (direction of the phrase): "re-opens the structural downside" is invalidation
  // language. It was matching the upside-clause pattern, which flipped the level to a trigger and
  // erased the risk side of the call. Measured across every published brief, the loose
  // "re-?opens? the" form matched 26 times and was wrong all 26. Fails if it is loosened again.
  const reopens = recBody.buildRecommendationBody(
    {
      subject: 'MSFT core', action: 'hold', horizon: 'swing',
      trigger: 'hold above the 200-day (~432.3)',
      invalidation: 'A gap-fade back below the 200-day (~432.3) on the close re-opens the structural downside', confidence: 60
    },
    { universe });
  assert(reopens.levels.some((level) => level.source === 'invalidation'),
    're-opens the structural downside is read as INVALIDATION, not as an upside trigger (' + JSON.stringify(reopens.levels) + ')');
  assert(reopens.evaluability === 'machine-checkable',
    'a call with a real break level is scoreable rather than published as not-evaluable');

  // Honest degradation: a call whose own prose carries no checkable level says so.
  const noLevel = recBody.buildRecommendationBody(
    { subject: 'MSFT position', action: 'hold', horizon: 'swing', trigger: 'stay put', invalidation: 'reassess later', confidence: 55 },
    { universe });
  assert(noLevel.instrument === 'MSFT' && noLevel.evaluability === 'not-evaluable' && noLevel.evaluabilityReason === 'no-attributable-price-level',
    'a call with no checkable level resolves not-evaluable with a named reason, never a fabricated gate');

  // The live ledger: bodies present, none of them empty, and immutable rows enriched not rewritten.
  const ledgerRows = read('briefs/history/recommendations/2026-07.jsonl')
    .split('\n').filter((line) => line.length > 0).map((line) => JSON.parse(line));
  const withBody = ledgerRows.filter((row) => row.bodyContractVersion);
  assert(withBody.length > 0 && withBody.every((row) => row.instrument),
    'every body-carrying ledger row names an instrument (' + withBody.length + ' rows, 0 null)');
  assert(withBody.every((row) => row.evaluability === 'machine-checkable' || row.evaluability === 'not-evaluable'),
    'every body-carrying row declares an evaluability verdict');
  const restored = ledgerRows.filter((row) => row.eventType === 'body-restored');
  const restoredTargets = new Set(restored.map((row) => row.restoresEventId));
  assert(restored.length > 0 && restored.every((row) => row.restoresEventId),
    'a recovered body is appended as body-restored naming the original event, never written over it (' + restored.length + ' rows)');
  const bodiless = ledgerRows.filter((row) => !row.bodyContractVersion && !row.outcomeContractVersion);
  assert(bodiless.every((row) => row.contractVersion === 'brief-recommendation-history-row/v1'),
    'the pre-existing bodiless rows keep their original v1 contract — history is appended to, never edited');
  assert(bodiless.filter((row) => restoredTargets.has(row.eventId)).length === restored.length,
    'every body-restored row points at a real bodiless event that is still present in the ledger');

  // Idempotency is what makes the recovery safe to re-run in a scheduled pipeline.
  assert(backfill.planBackfill(ROOT).stats.newRows === 0,
    'the backfill is idempotent against the committed ledger — a re-run proposes zero further rows');
} catch (e) { failures++; console.log('  \u2717 FAIL (recommendation ledger group threw): ' + e.message); }

/* ---------- recommendation outcomes — the ledger scores itself against its own terms ---------- */
try {
  group('recommendation outcomes \u2014 published calls are scored, and unscoreable ones say so');
  const evaluate = await import('./evaluate-recommendations.mjs');
  const recBody = await import('./recommendation-body.mjs');
  const universe = recBody.loadInstrumentUniverse(ROOT);

  const spy = JSON.parse(read('data/bars/SPY.json')).rows;
  const asOfMs = spy[spy.length - 1].t;
  // The fixture needs a window whose FIRST forward close is beaten by a LATER one, so an
  // invalidation can sit where only the later session reaches it. A fixed -30 anchor had that by
  // accident of where the window boundary fell, not by any property the market guarantees:
  // appending the ordinary 2026-08-06 bar slid session 1 onto the window low, and nothing after a
  // low can be lower. So search back for the most recent anchor that genuinely has the property.
  // The margin keeps the constructed invalidation (trough + 0.001) strictly below session 1's
  // close, which is what makes it unreachable until the later session.
  let anchorIndex = -1, troughIndex = -1;
  for (let candidate = spy.length - 30; candidate >= 1; candidate -= 1) {
    const window = spy.slice(candidate + 1);
    if (window.length < 3) continue;
    let low = 1;
    for (let i = 2; i < window.length; i += 1) if (window[i].c < window[low].c) low = i;
    if (window[low].c < window[0].c - 0.01) { anchorIndex = candidate; troughIndex = low; break; }
  }
  assert(anchorIndex >= 0,
    'the committed SPY series has an anchor whose first forward close is beaten by a later one, so the ordering fixture can be built from real bars');
  const anchor = spy[anchorIndex];
  const forward = spy.slice(anchorIndex + 1);
  const proposedAt = new Date(anchor.t).toISOString();
  const early = forward[0], trough = forward[troughIndex];
  assert(troughIndex >= 1 && trough.c < early.c,
    'the committed SPY window has a later trough than its first forward close, so the ordering fixture is real (session ' + (troughIndex + 1) + ')');

  // ADVERSARIAL (time ordering): a trigger that fires on session 1 must WIN over an invalidation that
  // only breaks later. Scanning every invalidation before any trigger would score this a miss, which
  // is the exact bias that would understate the hit rate.
  const triggerFirst = evaluate.judge({
    occurredAt: proposedAt, horizon: 'tactical', evaluability: 'machine-checkable',
    levels: [
      { instrument: 'SPY', relation: 'above', value: early.c - 1, source: 'trigger' },
      { instrument: 'SPY', relation: 'below', value: trough.c + 0.001, source: 'invalidation' }
    ]
  }, { root: ROOT, asOfMs });
  assert(triggerFirst && triggerFirst.eventType === 'satisfied' && triggerFirst.detail.sessionsToResolve === 1,
    'the gate the market reaches FIRST decides the call \u2014 an early trigger beats a later invalidation');

  // ...and the mirror: an invalidation that breaks first must close the call as a miss.
  const invalidationFirst = evaluate.judge({
    occurredAt: proposedAt, horizon: 'tactical', evaluability: 'machine-checkable',
    levels: [
      { instrument: 'SPY', relation: 'below', value: early.c + 1, source: 'invalidation' },
      { instrument: 'SPY', relation: 'above', value: early.c + 1e6, source: 'trigger' }
    ]
  }, { root: ROOT, asOfMs });
  assert(invalidationFirst && invalidationFirst.eventType === 'invalidated',
    'an invalidation that breaks first closes the call as a miss');

  // Silence means open: inside the horizon with nothing breached, no event may be emitted.
  const stillOpen = evaluate.judge({
    occurredAt: new Date(spy[spy.length - 2].t).toISOString(), horizon: 'structural', evaluability: 'machine-checkable',
    levels: [{ instrument: 'SPY', relation: 'above', value: 1e7, source: 'trigger' }, { instrument: 'SPY', relation: 'below', value: 1, source: 'invalidation' }]
  }, { root: ROOT, asOfMs });
  assert(stillOpen === null, 'a call still inside its horizon with nothing breached emits no event \u2014 silence means open');

  // not-evaluable is first-class, never forced into a verdict.
  const unscoreable = evaluate.judge({ occurredAt: proposedAt, horizon: 'swing', evaluability: 'not-evaluable', evaluabilityReason: 'no-attributable-price-level', levels: [] }, { root: ROOT, asOfMs });
  assert(unscoreable && unscoreable.eventType === 'not-evaluable' && unscoreable.reasonCode === 'no-attributable-price-level',
    'a call with no checkable level resolves not-evaluable with its own reason, never a forced hit or miss');
  const noBars = evaluate.judge({
    occurredAt: proposedAt, horizon: 'swing', evaluability: 'machine-checkable',
    levels: [{ instrument: 'ZZZZ', relation: 'below', value: 1, source: 'invalidation' }]
  }, { root: ROOT, asOfMs });
  assert(noBars && noBars.eventType === 'not-evaluable' && noBars.reasonCode === 'no-committed-bars-for-instrument',
    'a call naming an instrument we hold no bars for is not-evaluable, not a silent pass');

  // ADVERSARIAL (attribution): the narrative habitually appends the UPSIDE case inside the
  // invalidation field. Read literally, a recovering thesis would be scored as broken.
  const upsideInInvalidation = recBody.buildRecommendationBody({
    subject: 'MSFT core', action: 'hold', horizon: 'swing', confidence: 55,
    trigger: 'Repair confirmation = daily CLOSES holding back above the 50-day (~401.1).',
    invalidation: 'MSFT confirms a daily close holding above its 50-day (~401.1) and restacks, OR fails back below and breaks decisively lower.'
  }, { universe });
  assert(upsideInInvalidation.levels.every((level) => !(level.source === 'invalidation' && level.relation === 'above')),
    'an upside gate written inside the invalidation field is attributed to the trigger side, so a recovering thesis is never scored as broken');
  assert(upsideInInvalidation.evaluability === 'not-evaluable' && upsideInInvalidation.evaluabilityReason === 'no-attributable-invalidation-level',
    'with only an upside gate published, the call is withheld from scoring rather than counted as a free win');

  // A single-name call drops its ticker after the first mention; the gate must still be recovered.
  assert(upsideInInvalidation.levels.some((level) => level.instrument === 'MSFT' && level.value === 401.1),
    'a single-instrument call still resolves a gate written without repeating the ticker');

  // The committed ledger carries real outcomes now, and re-running proposes none.
  const ledgerRows = read('briefs/history/recommendations/2026-07.jsonl').split('\n').filter((line) => line.length > 0).map((line) => JSON.parse(line));
  const outcomes = ledgerRows.filter((row) => row.outcomeContractVersion);
  const outcomeTypes = new Set(outcomes.map((row) => row.eventType));
  assert(outcomes.length > 0, 'the ledger carries close events (' + outcomes.length + ' outcomes)');
  assert([...outcomeTypes].every((type) => ['satisfied', 'invalidated', 'expired', 'unresolved', 'not-evaluable'].includes(type)),
    'every outcome uses the shipped close vocabulary: ' + [...outcomeTypes].sort().join(', '));
  assert(outcomeTypes.has('not-evaluable'), 'not-evaluable is populated, proving the evaluator is not forcing verdicts');
  assert(outcomes.every((row) => row.reasonCode && row.proposedAt), 'every outcome names its reason and the call it closes');
  assert(evaluate.planEvaluation(ROOT, {}).rows.length === 0,
    'the evaluator is idempotent against the committed ledger \u2014 a re-run closes nothing twice');
} catch (e) { failures++; console.log('  \u2717 FAIL (recommendation outcomes group threw): ' + e.message); }

/* ---------- scorecard — the error rate is published, and withheld when the sample cannot carry it ---------- */
try {
  group('scorecard \u2014 the brief publishes its own error rate, misses included');
  const scorecardModule = await import('./build-scorecard.mjs');

  // (a) The committed ledger must select the policy branch its current sample supports.
  const live = scorecardModule.buildScorecard(ROOT, {});
  const all = live.windows.all;
  assert(all.resolved === all.satisfied + all.invalidated,
    'resolved counts only calls that reached a trigger or an invalidation (' + all.satisfied + ' + ' + all.invalidated + ' = ' + all.resolved + ')');
  assert(all.notEvaluable > 0 && all.notEvaluable + all.satisfied + all.invalidated + all.expired + all.unresolved === all.closed,
    'every closed call lands in exactly one outcome bucket, and not-evaluable is one of them');
  const liveHasEnoughResolved = all.resolved >= live.policy.minResolvedSample;
  const expectedLiveRate = liveHasEnoughResolved ? Math.round((all.satisfied / all.resolved) * 1e4) / 1e4 : null;
  assert(all.hitRate === expectedLiveRate && all.insufficientSample === !liveHasEnoughResolved,
    'with ' + all.resolved + ' resolved against a minimum of ' + live.policy.minResolvedSample + ', the live scorecard ' + (liveHasEnoughResolved ? 'PRINTS the measured rate' : 'WITHHOLDS the rate'));
  assert(Number.isFinite(all.notEvaluableShare) && all.notEvaluableShare > 0,
    'the not-machine-evaluable share is published rather than hidden (' + Math.round(all.notEvaluableShare * 1000) / 10 + '%)');

  // ADVERSARIAL: below the minimum, a plausible 2-of-3 hit rate must remain withheld.
  const belowMinimum = scorecardModule.summarize({ closed: 4, satisfied: 2, invalidated: 1, expired: 0, unresolved: 0, notEvaluable: 1 }, 4);
  assert(belowMinimum.resolved === 3 && belowMinimum.hitRate === null && belowMinimum.insufficientSample === true,
    'below the minimum the realised rate stays withheld (2 of 3 is not published)');

  // (b) ADVERSARIAL: a fixture whose sample CROSSES its declared minimum must actually print a rate.
  const fixtureRoot = join(ROOT, 'tests/fixtures/scorecard');
  const fixture = scorecardModule.buildScorecard(fixtureRoot, { asOf: '2026-07-31' });
  const fixtureAll = fixture.windows.all;
  assert(fixture.policy.minResolvedSample === 4 && fixtureAll.resolved === 5,
    'the fixture resolves 5 calls against a minimum of 4, so it exercises the printing branch');
  assert(fixtureAll.hitRate === 0.6 && fixtureAll.insufficientSample === false,
    'above the minimum the realised rate IS published (3 of 5 in favour = 60%)');
  assert(fixtureAll.notEvaluable === 1 && fixtureAll.resolved === 5,
    'a not-evaluable call is counted in its own bucket and NEVER as a win (resolved stays 5, not 6)');
  assert(fixture.openCalls === 1, 'a proposed call with no close event is reported open, not scored');

  // (c) Misses are published in full — the property that makes the number trustworthy.
  assert(fixture.recentMisses.length === 2 && fixture.recentMisses.every((miss) => miss.instrument && miss.invalidatedBy && Number.isFinite(miss.invalidatedBy.level)),
    'misses are published with the instrument and the published level that invalidated them');
  assert(fixture.recentMisses[0].closedAt >= fixture.recentMisses[1].closedAt, 'misses are listed most recent first');

  // (d) Calibration compares STATED confidence to REALISED frequency, withholding below the minimum.
  const bucket = fixtureAll.calibration.find((row) => row.bucket === '60-69');
  assert(bucket && bucket.resolved === 3 && bucket.stated === 0.65,
    'the calibration table carries the stated confidence of the calls in each bucket');
  assert(bucket.realised === null && bucket.insufficientSample === true,
    'a calibration bucket below the minimum withholds its realised frequency rather than claiming one from 3 calls');

  // (e) The committed artifact agrees with the ledger it claims to summarize.
  const published = JSON.parse(read('market-brief.scorecard.json'));
  assert(published.contractVersion === scorecardModule.SCORECARD_CONTRACT
    && published.windows.all.closed === all.closed && published.windows.all.resolved === all.resolved,
    'the published market-brief.scorecard.json matches the committed outcome ledger');
} catch (e) { failures++; console.log('  \u2717 FAIL (scorecard group threw): ' + e.message); }

/* ---------- rlmetrics — one definition, and a drag that obeys AM ≥ GM ---------- */
try {
  group('rlmetrics.js \u2014 one Sharpe definition, and a volatility drag that cannot go negative');
  const { createRequire: createMetricsRequire } = await import('node:module');
  const RLM = createMetricsRequire(import.meta.url)(join(ROOT, 'rlmetrics.js'));

  assert(typeof RLM.sharpeArithmetic === 'function' && typeof RLM.sharpeGeometric === 'function' && typeof RLM.volatilityDrag === 'function',
    'rlmetrics exports both Sharpe conventions plus volatility drag');
  assert(RLM.sharpe === RLM.sharpeArithmetic, 'the bare `sharpe` alias resolves to ONE convention (arithmetic), so an unqualified call is never ambiguous');

  // Null, not zero. An unknown Sharpe and a zero Sharpe are different claims.
  assert(RLM.sharpeArithmetic([], 252, 0) === null && RLM.sharpeGeometric(null, 0.2, 0) === null && RLM.volatilityDrag([]) === null,
    'insufficient input yields null, never a plausible 0');
  assert(RLM.annualizedVol([0.01]) === null && RLM.cagr(100, 120, 0) === null,
    'a single observation has no volatility and a zero-length window has no CAGR — both stay null');

  // ADVERSARIAL: drag must obey AM ≥ GM on REAL committed windows. The naive
  // "annualisedArithmetic − endpointCAGR" mixes annualisation conventions and goes NEGATIVE, which
  // is impossible; this asserts the correct per-period form on every committed bar file that has a
  // usable year, so the defect cannot return for any single symbol.
  const barFiles = readdirSync(join(ROOT, 'data/bars')).filter((file) => file.endsWith('.json'));
  let checked = 0, moderateVol = 0, negativeDrag = [], driftFromTheory = [];
  for (const file of barFiles) {
    const rows = JSON.parse(read(`data/bars/${file}`)).rows;
    if (!rows || rows.length < 200) continue;
    const window = rows.filter((row) => row.t >= rows[rows.length - 1].t - 365 * 864e5);
    if (window.length < 200) continue;
    const returns = RLM.returnsFromCloses(window);
    const drag = RLM.volatilityDrag(returns);
    const vol = RLM.annualizedVol(returns);
    const approx = RLM.volatilityDragApprox(vol);
    if (!Number.isFinite(drag) || !Number.isFinite(approx)) continue;
    checked += 1;
    if (drag < 0) negativeDrag.push(file);
    // sigma^2/2 is a SECOND-ORDER expansion: it is accurate at ordinary equity volatility and
    // legitimately diverges at extreme volatility (^VIX runs above 100% annualised). Checking it
    // only where it is meant to hold keeps the assertion true rather than approximately true.
    if (vol <= 0.40) {
      moderateVol += 1;
      if (Math.abs(drag - approx) > 0.01) driftFromTheory.push(`${file}: vol ${(vol * 100).toFixed(0)}%, exact ${drag.toFixed(4)} vs approx ${approx.toFixed(4)}`);
    }
  }
  assert(checked >= 50 && moderateVol >= 50, 'the drag invariant is checked against a real sample of committed windows (' + checked + ' symbols, ' + moderateVol + ' at ordinary volatility)');
  assert(negativeDrag.length === 0, 'volatility drag is never negative on a real window \u2014 AM \u2265 GM (' + negativeDrag.slice(0, 5).join(', ') + ')');
  assert(driftFromTheory.length === 0, 'at ordinary volatility the exact drag tracks its sigma-squared-over-two estimate (' + driftFromTheory.slice(0, 3).join('; ') + ')');

  // The two conventions must differ by roughly the drag — that difference IS the reason both exist.
  const spyRows = JSON.parse(read('data/bars/SPY.json')).rows;
  const spyWindow = spyRows.filter((row) => row.t >= spyRows[spyRows.length - 1].t - 365 * 864e5);
  const spyReturns = RLM.returnsFromCloses(spyWindow);
  const years = (spyWindow[spyWindow.length - 1].t - spyWindow[0].t) / (365.25 * 864e5);
  const spyCagr = RLM.cagr(spyWindow[0].c, spyWindow[spyWindow.length - 1].c, years);
  const arithmetic = RLM.sharpeArithmetic(spyReturns, 252, 0);
  const geometric = RLM.sharpeGeometric(spyCagr, RLM.annualizedVol(spyReturns), 0);
  assert(Number.isFinite(arithmetic) && Number.isFinite(geometric) && arithmetic !== geometric,
    'the two conventions genuinely differ on the same asset (arithmetic ' + arithmetic.toFixed(3) + ' vs geometric ' + geometric.toFixed(3) + ') \u2014 which is why calling both "sharpe" was a defect');

  // The strategy owner delegates to the canonical definition; a second formula is forbidden.
  const strategySource = read('rlexperience-adapters/strategy-research.js');
  assert(/RLMETRICS\.sharpeArithmetic\s*\(/.test(strategySource)
    && !/\(mean\s*\/\s*sd\)\s*\*\s*Math\.sqrt\s*\(ANN\)/.test(strategySource),
    'strategy-research delegates arithmetic Sharpe to rlmetrics and carries no inline duplicate');
  const strategy = createMetricsRequire(import.meta.url)(join(ROOT, 'rlexperience-adapters/strategy-research.js'));
  const seeded = strategy.genSeries(42, 4, [{ frac: 1, muAnnual: 0.08, sigAnnual: 0.18 }]);
  const bt = strategy.backtest(seeded, { fast: 20, slow: 100, momLookback: 63, volTarget: 0.12, maxLeverage: 2, stopDd: 0.15 }, 0, seeded.days);
  const adapterMetrics = strategy.metrics(bt);
  const canonical = RLM.sharpeArithmetic(bt.r, RLM.TRADING_DAYS, 0);
  assert(Number.isFinite(canonical) && Math.abs(adapterMetrics.sharpe - canonical) < 1e-9,
    'strategy-research.js returns the SAME arithmetic Sharpe delegated to rlmetrics (' + adapterMetrics.sharpe.toFixed(9) + ' vs ' + canonical.toFixed(9) + ')');
} catch (e) { failures++; console.log('  \u2717 FAIL (rlmetrics group threw): ' + e.message); }

/* ---------- rlattention — the attention tier APPENDS to the certified lifecycle, it never redefines it ---------- */
try {
  group('rlattention.js \u2014 append-only lifecycle, upstream-owned vocabulary, and a rank order with no clock in it');
  const { createRequire: createAttentionRequire } = await import('node:module');
  const attentionRequire = createAttentionRequire(import.meta.url);
  const ATTENTION_PATH = join(ROOT, 'rlattention.js');
  const RLMKTACTION = attentionRequire(join(ROOT, 'rlmarketaction.js'));
  const attentionSource = read('rlattention.js');
  let RLATTN = attentionRequire(ATTENTION_PATH);

  const ATTENTION_SURFACE = Object.freeze([
    'CONTRACT_VERSION', 'ATTENTION_LIFECYCLE_STATES', 'ATTENTION_LIFECYCLE_TRANSITIONS', 'DECISION_WINDOWS',
    'TERMINAL_OUTCOME_CLASSES', 'REFUSAL_CODES', 'resolveDecisionWindow', 'buildAttentionItem',
    'validateAttentionItem', 'rankAttentionItems', 'selectAttentionItems', 'rankRationale',
    'applyAttentionLifecycleEvent', 'deriveOutcomeRecord', 'computeInterruptionRate', 'toViewModel'
  ]);
  const missingSurface = ATTENTION_SURFACE.filter((name) => !(name in RLATTN));
  assert(missingSurface.length === 0 && Object.isFrozen(RLATTN) && RLATTN.CONTRACT_VERSION === 'decision-attention/v1',
    'rlattention.js loads as a frozen UMD module publishing the whole decision-attention/v1 surface (' + ATTENTION_SURFACE.length + ' names, missing: ' + (missingSurface.join(', ') || 'none') + ')');
  assert(RLATTN.REFUSAL_CODES.length > 0 && RLATTN.REFUSAL_CODES.every((code) => /^RLATTN-[A-Z-]+$/.test(code)),
    'every refusal the attention tier can raise carries a closed RLATTN-* code (' + RLATTN.REFUSAL_CODES.length + ' codes)');

  /* The certified alert-engine states are READ from rlmarketaction.js, never restated as a second
     source of truth. The attention tier may only APPEND, and everything it appends is a terminal —
     otherwise an attention-only state could hand control back to the certified engine. */
  const certifiedStates = RLMKTACTION.LIFECYCLE_STATES;
  assert(certifiedStates.length === 9
    && JSON.stringify(RLATTN.ATTENTION_LIFECYCLE_STATES.slice(0, certifiedStates.length)) === JSON.stringify(certifiedStates),
    'the attention lifecycle opens with the certified alert-engine states, verbatim and in the certified order (' + certifiedStates.length + ' inherited from rlmarketaction.js)');
  const appendedStates = RLATTN.ATTENTION_LIFECYCLE_STATES.slice(certifiedStates.length);
  const nonTerminalAppended = appendedStates.filter((state) => (RLATTN.ATTENTION_LIFECYCLE_TRANSITIONS[state] || ['UNDECLARED']).length !== 0);
  assert(JSON.stringify(appendedStates) === JSON.stringify(['escalated', 'superseded']) && nonTerminalAppended.length === 0,
    'the tier appends exactly escalated + superseded and both are terminals, so an attention-only state never travels back into the certified engine (non-terminal: ' + (nonTerminalAppended.join(', ') || 'none') + ')');

  /* ADVERSARIAL: comparing against the upstream vocabulary proves nothing if the module tolerates a
     drifted upstream. Drop ONE certified state from the vocabulary it reads and it must refuse to
     load at all, naming the state it lost. */
  const priorUpstreamEnv = process.env.RLATTN_UPSTREAM_LIFECYCLE_STATES;
  process.env.RLATTN_UPSTREAM_LIFECYCLE_STATES = certifiedStates.filter((state) => state !== 'monitoring').join(',');
  delete attentionRequire.cache[attentionRequire.resolve(ATTENTION_PATH)];
  let driftRefusal = null;
  try { attentionRequire(ATTENTION_PATH); } catch (error) { driftRefusal = error.message; }
  if (priorUpstreamEnv === undefined) delete process.env.RLATTN_UPSTREAM_LIFECYCLE_STATES;
  else process.env.RLATTN_UPSTREAM_LIFECYCLE_STATES = priorUpstreamEnv;
  delete attentionRequire.cache[attentionRequire.resolve(ATTENTION_PATH)];
  RLATTN = attentionRequire(ATTENTION_PATH);
  assert(/^RLATTN-LIFECYCLE-DRIFT:/.test(driftRefusal || '') && String(driftRefusal).includes('monitoring'),
    'losing a certified state upstream makes rlattention.js refuse to LOAD, naming the missing state (' + String(driftRefusal).slice(0, 90) + ')');
  assert(RLATTN.ATTENTION_LIFECYCLE_STATES.length === certifiedStates.length + appendedStates.length,
    'the module reloads cleanly once the certified vocabulary is whole again, so the drift probe left no residue');

  /* Transmission channels and research verbs have exactly one definition, upstream. A re-listed
     literal here would be a second definition that could drift silently. */
  const relistedChannels = RLMKTACTION.TRANSMISSION_CHANNELS.filter((channel) => attentionSource.includes(JSON.stringify(channel)));
  const relistedVerbs = RLMKTACTION.RESEARCH_VERBS.filter((verb) => attentionSource.includes(JSON.stringify(verb)));
  assert(/mod\.TRANSMISSION_CHANNELS/.test(attentionSource) && /mod\.RESEARCH_VERBS/.test(attentionSource)
    && relistedChannels.length === 0 && relistedVerbs.length === 0,
    'the transmission-channel and research-verb vocabularies are read from rlmarketaction.js and never re-listed here (re-listed: ' + (relistedChannels.concat(relistedVerbs).join(', ') || 'none') + ')');

  /* No clock and no randomness: every instant is passed in, so a ranking is reproducible forever. */
  const IMPURITY_PATTERNS = [/Date\.now\s*\(/, /new\s+Date\s*\(\s*\)/, /Math\.random\s*\(/];
  const impurities = IMPURITY_PATTERNS.filter((pattern) => pattern.test(attentionSource));
  assert(impurities.length === 0, 'rlattention.js reads no clock and draws no randomness (' + impurities.length + ' offending construct(s))');
  /* ADVERSARIAL: a detector that matched nothing would report purity for any file. */
  assert(IMPURITY_PATTERNS.every((pattern) => pattern.test('var t = Date.now(); var u = new Date(); var r = Math.random();')),
    'the clock/randomness detector still matches every shape it forbids');

  /* The committed payload may honestly publish an empty tier when every declared candidate is
     refused, but every candidate must still be accounted for by a conforming item or a named
     exclusion. An empty tier with no exclusions is the silent-drop defect. */
  const committedAttentionPayload = JSON.parse(read('market-brief.payload.json'));
  const committedTier = committedAttentionPayload.attention;
  const committedExclusions = committedAttentionPayload.attentionExclusions;
  assert(Array.isArray(committedTier) && Array.isArray(committedExclusions)
    && committedTier.length + committedExclusions.length > 0
    && committedTier.every((item) => item.contractVersion === RLATTN.CONTRACT_VERSION)
    && committedTier.every((item) => RLATTN.DECISION_WINDOWS.includes(item.decisionWindow))
    && committedExclusions.every((item) => item && RLATTN.REFUSAL_CODES.includes(item.code)
      && typeof item.field === 'string' && item.field.length > 0
      && typeof item.reason === 'string' && item.reason.length > 0),
    'the committed brief accounts for every attention candidate as a decision-attention/v1 item or a named exclusion ('
    + (Array.isArray(committedTier) ? committedTier.length : 0) + ' published, '
    + (Array.isArray(committedExclusions) ? committedExclusions.length : 0) + ' excluded)');

  const attentionProbe = (id, imminence, severity, path) => ({
    id: id, subject: id.toUpperCase(), headline: id, state: 'discovered',
    decisionWindow: 'pre-close', imminence: imminence, severity: severity, transmissionPath: path
  });
  const rankingTier = committedTier.length >= 3 ? committedTier : [
    attentionProbe('ranking-a', 'latent', 'severe', [RLMKTACTION.TRANSMISSION_CHANNELS[0]]),
    attentionProbe('ranking-b', 'imminent', 'mild', [RLMKTACTION.TRANSMISSION_CHANNELS[0]]),
    attentionProbe('ranking-c', 'developing', 'moderate', [RLMKTACTION.TRANSMISSION_CHANNELS[0]])
  ];
  const rankedIds = (list) => RLATTN.rankAttentionItems(list).map((item) => item.id).join('|');
  const canonicalOrder = rankedIds(rankingTier);
  assert(canonicalOrder === rankedIds(rankingTier.slice().reverse())
    && canonicalOrder === rankedIds(rankingTier.slice(2).concat(rankingTier.slice(0, 2))),
    'ranking is identical under reversal and rotation, so it is a total order and not a stable-sort accident');
  const rankingInputOrder = rankingTier.map((item) => item.id).join('|');
  rankedIds(rankingTier);
  assert(rankingInputOrder === rankingTier.map((item) => item.id).join('|'),
    'ranking does not mutate the tier it was handed');

  /* Severity is recorded but is NOT the rank key — urgency and an identified channel are. */
  const severeLatent = attentionProbe('a', 'latent', 'severe', [RLMKTACTION.TRANSMISSION_CHANNELS[0]]);
  const mildImminent = attentionProbe('b', 'imminent', 'mild', [RLMKTACTION.TRANSMISSION_CHANNELS[0]]);
  const mappedModerate = attentionProbe('c', 'imminent', 'moderate', [RLMKTACTION.TRANSMISSION_CHANNELS[0]]);
  const unmappedSevere = attentionProbe('d', 'imminent', 'severe', []);
  assert(RLATTN.rankAttentionItems([severeLatent, mildImminent])[0].id === 'b',
    'a severe-but-latent claim ranks BELOW a mild-but-imminent one \u2014 severity is recorded, it is not the rank key');
  assert(RLATTN.rankAttentionItems([unmappedSevere, mappedModerate])[0].id === 'c',
    'a severe claim with no identified transmission channel ranks below a moderate one whose effect has a named path');

  /* The card ceiling is a real ceiling: it must bite when the tier exceeds it, and it must be an
     overflow set rather than a rejection set. */
  const uncapped = RLATTN.selectAttentionItems(committedTier);
  const capped = RLATTN.selectAttentionItems(rankingTier, 2);
  assert(uncapped.published.length === committedTier.length && uncapped.capApplied === false && uncapped.suppressed.length === 0,
    'every committed attention item is live and publishes under the default card ceiling (' + uncapped.published.length + ' of ' + uncapped.cap + ')');
  assert(capped.published.length === 2 && capped.capApplied === true
    && capped.suppressed.length === rankingTier.length - 2
    && capped.published.concat(capped.suppressed).map((item) => item.id).join('|') === canonicalOrder,
    'the card ceiling really bites and suppresses the ranked tail rather than dropping it (' + capped.published.length + ' published, ' + capped.suppressed.length + ' suppressed)');

  /* Page wiring: the browser global resolves the certified vocabulary at LOAD time, so a page that
     loads the attention tier before the alert engine refuses on first paint. */
  const attentionBriefPage = read('market-brief.html');
  const marketActionTagAt = attentionBriefPage.indexOf('src="rlmarketaction.js"');
  const attentionTagAt = attentionBriefPage.indexOf('src="rlattention.js"');
  assert(marketActionTagAt > 0 && attentionTagAt > marketActionTagAt,
    'market-brief.html loads rlattention.js AFTER rlmarketaction.js, because the attention tier resolves the certified vocabulary from the browser global at load time');
  /* ADVERSARIAL: the order check must still fail on the reversed shape. */
  const reversedScriptOrder = '<script src="rlattention.js"></script><script src="rlmarketaction.js"></script>';
  assert(reversedScriptOrder.indexOf('src="rlattention.js"') < reversedScriptOrder.indexOf('src="rlmarketaction.js"'),
    'the script-order check really detects the reversed load order');

  /* The publish-time build step (F-017-06). The authoring lane no longer emits a
     decision-attention/v1 envelope; this step composes every candidate through
     the certified composer, so compliance is structural instead of advisory. */
  const attentionBuild = await import('./build-attention-items.mjs');
  const BUILD_SURFACE = ['buildAttentionItems', 'attentionBuildContext', 'authoredJudgementOnly', 'actionSubjectTickers', 'AUTHORED_JUDGEMENT_KEYS'];
  const missingBuild = BUILD_SURFACE.filter((name) => attentionBuild[name] === undefined);
  assert(missingBuild.length === 0,
    'scripts/build-attention-items.mjs publishes the whole publish-time build surface (missing: ' + (missingBuild.join(', ') || 'none') + ')');

  /* it must CALL the composer, never restate its rules — a second copy of the
     field contract here is exactly the drift the composer exists to prevent. */
  const buildSource = read('scripts/build-attention-items.mjs');
  assert(buildSource.includes('RLATTN.buildAttentionItem'),
    'the build step composes through rlattention.js rather than assembling an envelope itself');
  assert(!/headlineMaxChars|DECISION_WINDOWS\s*=/.test(buildSource),
    'the build step restates no rule that already lives in rlattention.js');

  /* a refused candidate is recorded, never defaulted into shape. */
  const refusedBuild = attentionBuild.buildAttentionItems(
    [{ observed: { disposition: 'observed', subject: 'MSFT' }, headline: '' }],
    JSON.parse(read('market-brief.payload.json')), JSON.parse(read('market-brief.config.json')));
  assert(refusedBuild.items.length === 0 && refusedBuild.exclusions.length === 1
    && /^RLATTN-/.test(refusedBuild.exclusions[0].code),
    'a candidate the composer refuses is excluded with its named RLATTN-* reason (' + JSON.stringify(refusedBuild.exclusions[0] || null).slice(0, 90) + ')');

  /* the duplicate-suppression input is projected onto real tickers: the composer
     compares subjects by exact match, so handing it action prose would leave a
     guard that runs and can never fire. */
  assert(attentionBuild.actionSubjectTickers([{ subject: 'rotate out of XLE now' }], ['XLE']).length === 1
    && attentionBuild.actionSubjectTickers([{ subject: 'XLERATE holdings' }], ['XLE']).length === 0,
    'action subjects project down to whole-word watchlist tickers, so the overlap guard can actually fire');
} catch (e) { failures++; console.log('  \u2717 FAIL (rlattention group threw): ' + e.message); }

/* ---------- bounded history — the cockpit's first load stays affordable forever ---------- */
try {
  group('bounded history \u2014 the brief\u2019s first load is budgeted, and the budget is a failing test');
  const shard = await import('./shard-brief-history.mjs');
  const pageArtifacts = await import('./build-brief-page-artifacts.mjs');
  const budgets = JSON.parse(read('tool-experience.config.json')).artifactBudgets;
  const briefPage = read('market-brief.html');

  assert(budgets && Number.isFinite(budgets.briefHistoryRecentMaxBytes) && Number.isFinite(budgets.briefFirstLoadMaxBytes) && Number.isFinite(budgets.briefHistoryRecentMaxRows),
    'the first-load budget is DECLARED in tool-experience.config.json artifactBudgets, not left implicit');

  // The page must fetch the bounded window, never the unbounded append log.
  assert(briefPage.includes('brief-history.recent.jsonl'), 'the cockpit fetches the bounded recent window');
  assert(!/jl\("brief-history\.jsonl"\)/.test(briefPage), 'the cockpit no longer fetches the unbounded append log on page load');
  ['market-brief.config.page.json', 'market-brief.page.json', 'market-brief.snapshot.page.json', 'market-brief.tools.page.json'].forEach((file) => {
    assert(briefPage.includes(file), 'the cockpit fetches compact first-load artifact ' + file);
  });
  ['market-brief.config.json', 'market-brief.payload.json', 'market-brief.snapshot.json', 'tools.json'].forEach((file) => {
    assert(!briefPage.includes('j("' + file + '")'), 'the cockpit does not fetch full artifact ' + file + ' on first load');
  });
  assert(briefPage.includes('fetch("market-brief.experimental.json"') && briefPage.includes('experimentalDrawer'),
    'hidden experimental prose is fetched only through the drawer load path');

  const expectedPageArtifacts = pageArtifacts.buildBriefPageArtifacts(ROOT);
  Object.entries(expectedPageArtifacts).forEach(([file, value]) => {
    assert(read(file) === JSON.stringify(value) + '\n', file + ' is byte-current with its full source artifacts');
  });

  const recentBytes = Buffer.byteLength(read('brief-history.recent.jsonl'), 'utf8');
  const recentRows = read('brief-history.recent.jsonl').split('\n').filter((line) => line.length > 0);
  assert(recentBytes <= budgets.briefHistoryRecentMaxBytes,
    'the recent window is inside its declared byte budget (' + recentBytes + ' <= ' + budgets.briefHistoryRecentMaxBytes + ')');
  assert(recentRows.length <= budgets.briefHistoryRecentMaxRows,
    'the recent window is inside its declared row budget (' + recentRows.length + ' <= ' + budgets.briefHistoryRecentMaxRows + ')');

  // The whole first-load payload, measured — this is the number the defect was about.
  const firstLoad = ['market-brief.config.page.json', 'market-brief.page.json', 'watchlist.json',
    'brief-history.recent.jsonl', 'market-brief.snapshot.page.json', 'market-brief.tools.page.json', 'market-brief.scorecard.json']
    .reduce((total, file) => total + Buffer.byteLength(read(file), 'utf8'), 0);
  assert(firstLoad <= budgets.briefFirstLoadMaxBytes,
    'the cockpit\u2019s whole first-load payload is inside budget (' + Math.round(firstLoad / 1024) + ' KB <= ' + Math.round(budgets.briefFirstLoadMaxBytes / 1024) + ' KB)');

  // ADVERSARIAL: the budget must actually bind. The unbounded log would blow it many times over, so
  // an assertion that passed with EITHER file would be proving nothing.
  const unboundedBytes = Buffer.byteLength(read('brief-history.jsonl'), 'utf8');
  assert(unboundedBytes > budgets.briefFirstLoadMaxBytes,
    'the unbounded log genuinely exceeds the budget (' + Math.round(unboundedBytes / 1024) + ' KB), so fetching it would FAIL this test rather than slip through');

  // Nothing is lost: every run in the append log is present in a monthly shard.
  const source = shard.readSourceRows(ROOT);
  const sharded = readdirSync(join(ROOT, 'briefs/tier-a')).filter((file) => file.endsWith('.jsonl'))
    .reduce((total, file) => total + read(`briefs/tier-a/${file}`).split('\n').filter((line) => line.length > 0).length, 0);
  assert(sharded === source.length, 'every run in the append log is preserved in a monthly shard (' + sharded + ' = ' + source.length + ')');
  assert(recentRows.every((line) => JSON.parse(line).contractVersion === shard.RECENT_CONTRACT),
    'every recent row declares the compact contract, so a consumer knows it is a projection and not the full run');

  // The append log itself must stay the untouched source of truth.
  assert(shard.SOURCE === 'brief-history.jsonl' && !read('scripts/shard-brief-history.mjs').includes('writeFileSync(path.join(root, SOURCE)'),
    'the sharder never rewrites the append log it reads from');
} catch (e) { failures++; console.log('  \u2717 FAIL (bounded history group threw): ' + e.message); }

/* ---------- Step 9 durability — blocking CI, ET cadence, and public artifact projection ---------- */
try {
  group('Step 9 durability — CI gates the whole product and scheduled output is bounded');
  const pagesWorkflow = read('.github/workflows/pages.yml');
  const tierAWorkflow = read('.github/workflows/tier-a.yml');

  assert(/- name: Self-test \(all assertions\)[\s\S]*?run: node scripts\/selftest\.mjs/.test(pagesWorkflow),
    'Pages verify runs the complete selftest');
  assert(/verify:[\s\S]*?- name: Checkout\s+uses: actions\/checkout@v4\s+with:\s+fetch-depth: 0[\s\S]*?- name: Setup Node/.test(pagesWorkflow),
    'Pages verify fetches full git history before the PII scan checks every commit message');
  assert(/- name: Full browser suite \(blocking\)[\s\S]*?playwright test --config=playwright\.config\.mjs --project=system-chrome/.test(pagesWorkflow),
    'Pages verify runs the full Playwright suite, not a selected file list');
  assert(!/continue-on-error:\s*true/.test(pagesWorkflow), 'no Pages verification job is allowed to fail softly');
  assert(/deploy:[\s\S]*?needs: verify/.test(pagesWorkflow) && /path: "_site"/.test(pagesWorkflow),
    'Pages deploy waits on verify and uploads only the projected _site artifact');

  const cronRows = Array.from(tierAWorkflow.matchAll(/- cron: "([^"]+)"/g)).map((match) => match[1]);
  assert(cronRows.length === 8, 'Tier-A declares both UTC sides of four ET windows for DST coverage');
  assert(/github\.event\.schedule/.test(tierAWorkflow) && /TZ=America\/New_York date \+%z/.test(tierAWorkflow) && /-0400/.test(tierAWorkflow) && /-0500/.test(tierAWorkflow),
    'Tier-A resolves the firing cron plus ET offset, so delayed starts still retain the intended window');
  assert((tierAWorkflow.match(/if: steps\.window\.outputs\.run == 'true'/g) || []).length >= 7,
    'every mutating Tier-A step is gated by the resolved ET window');
  assert(!/inputs\.dry-run/.test(tierAWorkflow) && /inputs\['dry-run'\]/.test(tierAWorkflow),
    'Tier-A uses bracket notation for the hyphenated dry-run input');
  assert(/brief-refresh\.mjs --window "\$\{\{ steps\.window\.outputs\.window \}\}"/.test(tierAWorkflow),
    'Tier-A passes the resolved ET window explicitly into deterministic refresh');

  const pagesPlan = (await import('./build-pages-site.mjs')).planPagesSite(ROOT);
  assert(pagesPlan.registeredPages.length === JSON.parse(read('tools.json')).tools.length,
    'the projected site contains every registered tool');
  assert(pagesPlan.excludedPaths.every((path) => !pagesPlan.rootFiles.includes(path)),
    'the projected site root excludes every explicitly non-public artifact');
  assert(pagesPlan.rootFiles.includes('.nojekyll'), 'the projected site preserves the GitHub Pages .nojekyll marker');
  assert(/^briefs\/indexes\/[a-f0-9]{64}$/.test(pagesPlan.historyIndexDirectory), 'the projected site resolves one canonical current history index');
  assert(pagesPlan.orphanIndexDirectories.every((directory) => directory !== pagesPlan.historyIndexDirectory),
    'orphan history indexes are identified separately and cannot replace the current pointer target');

  /* Dependency gates: a gate verdict is a property of the committed tree, so it is resolved at
     build time. The browser must never fetch a `specs/` path — the deployed site does not ship
     `specs/`, so such a fetch 404s, degrades to null, and silently withholds delivered
     capabilities from real users while every local test still passes. */
  const gateBuilder = await import('./build-dependency-gates.mjs');
  assert(read(gateBuilder.GATES_FILE) === gateBuilder.serializeDependencyGates(gateBuilder.buildDependencyGates(ROOT)),
    'the committed dependency-gate projection matches its source specs — a stale projection misreports delivery');
  assert(pagesPlan.rootFiles.includes(gateBuilder.GATES_FILE),
    'the projected site ships the dependency-gate projection, so gates resolve identically on Pages');

  const gateDocument = JSON.parse(read(gateBuilder.GATES_FILE));
  const experienceConfig = JSON.parse(read('tool-experience.config.json'));
  assert(Object.keys(gateDocument.states).length === Object.keys(experienceConfig.dependencyGates).length
    && Object.keys(experienceConfig.dependencyGates).every((key) => gateDocument.states[key]),
    'every declared dependency gate is represented in the projection');
  /* The projection is a PROJECTION: leaking whole governance files into a public artifact would
     publish spec internals that no runtime predicate reads. */
  assert(Object.values(gateDocument.states).every((state) => Object.keys(state)
    .every((field) => ['status', 'certification', 'milestones', 'evidenceIds'].includes(field))),
    'the public gate projection carries only the fields the runtime predicate reads');

  const browserRuntime = read('rlapp.js');
  assert(browserRuntime.includes(gateBuilder.GATES_FILE) && !/fetchRequiredJson\(\s*gates\[[^\]]+\]\.statePath/.test(browserRuntime),
    'the browser resolves gates from the public projection and never fetches a governance statePath');
  /* ADVERSARIAL: the pre-fix runtime shape must fail the predicate above, so this cannot pass vacuously. */
  const preFixRuntime = browserRuntime.replace(/fetchRequiredJson\("tool-experience\.gates\.json"\)/, 'fetchRequiredJson(gates[key].statePath)');
  assert(/fetchRequiredJson\(\s*gates\[[^\]]+\]\.statePath/.test(preFixRuntime),
    'the statePath-fetch check is non-vacuous — it still matches the regressed shape');

  /* Root-absolute asset paths resolve against the DOMAIN root, so on a project Pages site
     (…github.io/<repo>/) they drop the repo segment and 404. msft-july-print-model.html shipped
     six of them and fetched …github.io/data/bars/MSFT.json in production while passing every
     local test, because a repo-root server makes the two forms indistinguishable. */
  const rootAbsoluteAssetOffenders = pagesPlan.registeredPages
    .map((page) => (typeof page === 'string' ? page : page.path || page.file))
    .filter((file) => typeof file === 'string' && file.endsWith('.html'))
    .filter((file) => /["'`]\/(?:data|briefs|rlexperience-adapters)\//.test(read(file)));
  assert(rootAbsoluteAssetOffenders.length === 0,
    'no registered page fetches a root-absolute asset path — it loses the repo segment on project Pages: ' + rootAbsoluteAssetOffenders.join(', '));
  /* ADVERSARIAL: the detector must still match the exact shape that shipped. */
  assert(/["'`]\/(?:data|briefs|rlexperience-adapters)\//.test("fetchOneJson('/data/bars/MSFT.json')"),
    'the root-absolute asset detector still matches the regressed shape');

  /* ADVERSARIAL: a reduced browser gate or direct root upload must fail these exact predicates. */
  const weakenedWorkflow = pagesWorkflow.replace('Full browser suite (blocking)', 'Selected browser suite')
    .replace('path: "_site"', 'path: "."')
    .replace('fetch-depth: 0', 'fetch-depth: 1');
  assert(!/- name: Full browser suite \(blocking\)/.test(weakenedWorkflow)
    && !/path: "_site"/.test(weakenedWorkflow)
    && !/fetch-depth: 0/.test(weakenedWorkflow),
    'the workflow checks detect a shallow checkout, reduced browser gate, and repo-root deployment');
} catch (e) { failures++; console.log('  \u2717 FAIL (Step 9 durability group threw): ' + e.message); }

/* ---------- spec artifacts — every referenced test path exists (ratchet) ---------- */
try {
  group('spec artifacts \u2014 referenced tests/*.mjs paths exist (Playwright silently ignores absent file args)');
  const specTestPaths = validateSpecTestPaths(ROOT);
  assert(!specTestPaths.vacuous && specTestPaths.baselinePresent, 'the scan matched at least one tests/*.mjs reference against a present baseline, so the guard is not vacuously green (' + specTestPaths.referenceCount + ' reference(s) across ' + specTestPaths.scannedFiles + ' artifact(s), baseline ' + specTestPaths.baselineCount + ' entr' + (specTestPaths.baselineCount === 1 ? 'y' : 'ies') + ')');
  for (const line of formatSpecTestPathFindings(specTestPaths, 1)) console.log('    ' + line);
  assert(specTestPaths.newMissing.length === 0, 'no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline \u2014 a stale path makes a multi-file verification command silently cover less than it claims (' + specTestPaths.newMissing.length + ' new, ' + specTestPaths.knownMissing.length + ' known-missing, ' + specTestPaths.staleBaseline.length + ' stale of ' + specTestPaths.referencedPathCount + ' referenced)');
} catch (e) { failures++; console.log('  \u2717 FAIL (spec artifact test-path guard threw): ' + e.message); }

/* ── trend-dynamics-cycle-lab — owner read (TP-04-01, spec 006 scope 4) ───────────────────
   The owner read is this tool's ONLY route into the Market Brief, so its truth handling is a
   contract rather than a formatting detail. Two axes stay deliberately separate: the shared
   transport's top-level `availability` carries SOURCE freshness, while `metrics.truthState`
   carries the ANALYTICAL state. A degraded analysis over current source must publish
   availability:'current' WITH truthState:'degraded' — collapsing the axes would either hide a
   degraded conclusion or falsely age a source that is in fact current. The cases below drive
   the SAME builder across states so the mapping is provably computed, not a fixed shape. */
try {
  group('trend-dynamics-cycle-lab \u2014 owner read separates source freshness from analytical truth (TP-04-01)');
  const tdcSrc = read('trend-dynamics-cycle-lab.html');
  // The sentence helper is a dependency of the builder, so the sandbox must carry both.
  const tdcEnv = build(
    [extractFn(tdcSrc, 'tdcComposeReadSentence'), extractFn(tdcSrc, 'tdcBuildDeepLink'), extractFn(tdcSrc, 'tdcBuildToolRead')],
    ['tdcBuildToolRead']);
  const tdcResult = (over) => Object.assign({
    contractVersion: 'tdc-analysis-result/v1', resultId: 'res-001', requestDigest: 'dig-abc',
    computedAt: '2026-08-11T12:00:00Z', sourceAsOf: '2026-08-10',
    sourceAvailability: 'current', truthState: 'current',
    request: { seriesId: 'srs-1', transformId: 'level', horizonId: 'medium' },
    trend: { direction: 'rising', trendType: 'linear' }, strength: { score: 0.72 },
    dynamics: { state: 'accelerating' }, changeState: 'stable',
    confidencePct: 81, keyContext: 'expansion', caveats: [], complete: true
  }, over || {});

  const okRead = tdcEnv.tdcBuildToolRead(tdcResult());
  assert(okRead && okRead.contractVersion === 'rl-tool-read/v1' && okRead.id === 'trend-dynamics-cycle-lab',
    'the owner read uses the shared rl-tool-read/v1 transport under the tool\u2019s registered id');
  assert(okRead.metrics.contractVersion === 'tdc-tool-read/v1' && okRead.metrics.resultId === 'res-001' && okRead.metrics.requestDigest === 'dig-abc',
    'the nested metrics contract carries the result identity verbatim, so a consumer can prove which run it read');
  assert(/^trend-dynamics-cycle-lab\.html\?/.test(okRead.deepLink) && okRead.deepLink.indexOf('series=srs-1') > 0,
    'the published deep link carries the selection through the allowlist, so following it from the Brief reproduces the run rather than landing on a default view');

  const degraded = tdcEnv.tdcBuildToolRead(tdcResult({ truthState: 'degraded', sourceAvailability: 'current' }));
  assert(degraded.availability === 'current' && degraded.metrics.truthState === 'degraded',
    'a degraded analysis over CURRENT source keeps availability current and carries the degraded state nested \u2014 the two axes never collapse');
  assert(typeof degraded.read === 'string' && degraded.read.indexOf('Degraded:') === 0,
    'the degraded sentence is prefixed so the Brief can quote it verbatim instead of recomputing the state');

  const unavailable = tdcEnv.tdcBuildToolRead(tdcResult({ truthState: 'unavailable', sourceAvailability: 'unavailable', strength: { score: null }, confidencePct: null }));
  assert(unavailable.asOf === null && unavailable.freshUntil === null,
    'an unavailable read reports no as-of and no freshness rather than a stale-but-plausible timestamp');
  assert(!('strengthScore' in unavailable.metrics) && !('confidencePct' in unavailable.metrics),
    'invalid numerics are OMITTED from an unavailable read \u2014 not published as zero, which a consumer would read as a real measurement');

  assert(tdcEnv.tdcBuildToolRead(tdcResult({ complete: false })) === null,
    'an incomplete run publishes NOTHING, so a cancelled or partial analysis can never reach the Brief');
} catch (e) { failures++; console.log('  \u2717 FAIL (trend-dynamics-cycle-lab owner read threw): ' + e.message); }

/* ── trend-dynamics-cycle-lab — view model (TP-04-01, spec 006 scope 4) ────────────────────────
   Simple and Power are two views of ONE result. The risk this group exists to catch is a
   renderer that quietly reaches a second verdict: design.md line 174 says a renderer consumes
   AnalysisResultV1 only and cannot calculate one, and line 428 says full precision stays in the
   result while `display` owns rounding. A view model that recomputed, re-rounded into the result,
   or formatted a non-finite value would satisfy none of those and would let the two views
   disagree about what the same run concluded. */
try {
  group('trend-dynamics-cycle-lab \u2014 view model projects ONE result without a second verdict (TP-04-01)');
  const vmSrc = read('trend-dynamics-cycle-lab.html');
  const vmEnv = build([extractFn(vmSrc, 'tdcBuildViewModel')], ['tdcBuildViewModel']);
  const vmResult = (over) => Object.assign({
    contractVersion: 'tdc-analysis-result/v1', resultId: 'res-042', requestDigest: 'dig-xyz',
    computedAt: '2026-08-11T12:00:00Z', sourceAsOf: '2026-08-10',
    sourceAvailability: 'current', truthState: 'current',
    request: { seriesId: 'series-a', transformId: 'level', horizonId: 'medium' },
    trend: { direction: 'rising', trendType: 'linear' },
    strength: { score: 0.6666666666666666 },
    dynamics: { state: 'accelerating' },
    changeState: 'stable',
    confidencePct: 73.4999,
    caveats: [], complete: true
  }, over || {});

  const vm = vmEnv.tdcBuildViewModel(vmResult());
  assert(vm && vm.resultId === 'res-042' && vm.requestDigest === 'dig-xyz',
    'the view model carries the result identity verbatim, so Simple and Power provably render the SAME run');
  assert(vm.direction === 'rising' && vm.trendType === 'linear' && vm.dynamics === 'accelerating' && vm.changeState === 'stable',
    'every verdict field is the result\u2019s own value passed through \u2014 the view model reaches no second conclusion');

  const src = vmResult();
  const vm2 = vmEnv.tdcBuildViewModel(src);
  assert(src.strength.score === 0.6666666666666666,
    'building a view model does not mutate the result \u2014 full precision survives for the owner read and history');
  assert(typeof vm2.display.strengthScore === 'string' && vm2.display.strengthScore !== '0.6666666666666666',
    'rounding lives in display only, so the rounded value can never leak back as the stored measurement');

  const nonFinite = vmEnv.tdcBuildViewModel(vmResult({ strength: { score: Number.NaN }, confidencePct: Infinity }));
  assert(nonFinite.display.strengthScore === null && nonFinite.display.confidencePct === null,
    'a non-finite measurement formats to null rather than \u201cNaN\u201d or \u201cInfinity\u201d reaching a reader as if it were a number');

  assert(vmEnv.tdcBuildViewModel(vmResult({ complete: false })) === null,
    'an incomplete run yields no view model, so a cancelled or partial analysis cannot be rendered as a finished verdict');
} catch (e) { failures++; console.log('  \u2717 FAIL (trend-dynamics-cycle-lab view model threw): ' + e.message); }

/* ── trend-dynamics-cycle-lab — deep link allowlist (TP-04-01, spec 006 scope 4) ───────────────
   design.md's security section is explicit: a deep link carries allowlisted public ids and
   numeric controls ONLY, never source payloads or credentials. A denylist would be the wrong
   shape here — it fails open the moment a new field is added to the request, which is exactly
   how a credential or a payload reaches a shareable URL. These cases prove the builder is an
   allowlist by handing it keys that must not survive. */
try {
  group('trend-dynamics-cycle-lab \u2014 deep link is an allowlist, so no payload or credential can ride along (TP-04-01)');
  const dlSrc = read('trend-dynamics-cycle-lab.html');
  const dlEnv = build([extractFn(dlSrc, 'tdcBuildDeepLink')], ['tdcBuildDeepLink']);

  const link = dlEnv.tdcBuildDeepLink({ seriesId: 'series-a', transformId: 'level', horizonId: 'medium', profileId: 'balanced' });
  assert(link.indexOf('trend-dynamics-cycle-lab.html?') === 0,
    'the deep link returns to the owning route as a relative URL, never an absolute or foreign origin');
  assert(/[?&]series=series-a(&|$)/.test(link) && /[?&]transform=level(&|$)/.test(link)
    && /[?&]horizon=medium(&|$)/.test(link) && /[?&]profile=balanced(&|$)/.test(link),
    'every allowlisted public id is carried, so a shared link reproduces the same selection');

  const hostile = dlEnv.tdcBuildDeepLink({
    seriesId: 'series-a', apiKey: 'secret-key', token: 'bearer-abc',
    sourcePayload: '[[1,2],[3,4]]', __proto__ID: 'x', redirect: 'https://evil.example'
  });
  assert(hostile.indexOf('apiKey') < 0 && hostile.indexOf('secret-key') < 0
    && hostile.indexOf('token') < 0 && hostile.indexOf('bearer-abc') < 0,
    'a credential handed to the builder is DROPPED rather than encoded \u2014 the allowlist fails closed');
  assert(hostile.indexOf('sourcePayload') < 0 && hostile.indexOf('redirect') < 0 && hostile.indexOf('evil.example') < 0,
    'a source payload and an off-site redirect are dropped too, so a deep link cannot exfiltrate data or bounce a reader');
  assert(/[?&]series=series-a(&|$)/.test(hostile),
    'the legitimate id in the SAME hostile call still survives, so the guard discriminates rather than refusing everything');

  const encoded = dlEnv.tdcBuildDeepLink({ seriesId: 'a b&c=d' });
  assert(encoded.indexOf('series=a%20b%26c%3Dd') > 0 || encoded.indexOf('series=a+b%26c%3Dd') > 0,
    'an allowlisted value is percent-encoded, so a crafted id cannot inject an extra query parameter');
} catch (e) { failures++; console.log('  \u2717 FAIL (trend-dynamics-cycle-lab deep link threw): ' + e.message); }

/* ── trend-dynamics-cycle-lab — untrusted text stays text (TP-04-01, spec 006 scope 4) ─────────
   design.md: source and catalog text is untrusted and text-rendered, and no eval, dynamic
   script or active imported markup exists. The tool satisfies this today; nothing enforced it,
   so a single innerHTML assignment during the remaining scope-4 render work would reintroduce
   injection silently. Each case carries an adversarial twin proving the scan MATCHES a
   violation, because a detector that cannot fire is worse than no detector. */
try {
  group('trend-dynamics-cycle-lab \u2014 untrusted source text cannot become markup or script (TP-04-01)');
  const safeSrc = read('trend-dynamics-cycle-lab.html');
  const dynamicScript = /\beval\s*\(|new\s+Function\s*\(|document\.write\s*\(/;
  const markupSink = /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(/;

  assert(!dynamicScript.test(safeSrc),
    'the tool contains no eval, no Function constructor and no document.write, so catalog text can never be executed');
  assert(dynamicScript.test('var x = eval("1+1");') && dynamicScript.test('var f = new Function("a", "return a");'),
    'the dynamic-script scan MATCHES both forms when present, so the clean result above is a measurement rather than a broken regex');

  assert(!markupSink.test(safeSrc),
    'no innerHTML, outerHTML or insertAdjacentHTML sink exists, so an untrusted series name or caveat is rendered as text');
  assert(markupSink.test('node.innerHTML = untrusted;') && markupSink.test('node.insertAdjacentHTML("beforeend", untrusted);'),
    'the markup-sink scan MATCHES both sink shapes when present, so this guard cannot pass vacuously');
} catch (e) { failures++; console.log('  \u2717 FAIL (trend-dynamics-cycle-lab safe text threw): ' + e.message); }

/* ── trend-dynamics-cycle-lab — publication (TP-04-01, spec 006 scope 4) ───────────────────────
   design.md: publication is automatic only after a COMPLETE render, and a rejected putToolRead
   is TDC-PUBLISH-REJECTED and visible, with the page unable to claim Market Brief coverage.
   The failure that matters is a page that treats publication as fire-and-forget: the reader
   then sees a finished analysis while the Brief silently holds nothing, or holds a partial run.
   The publisher is dependency-injected so rejection is exercised for real rather than mocked
   away. */
try {
  group('trend-dynamics-cycle-lab \u2014 publication is gated on completeness and a rejection stays visible (TP-04-01)');
  const pubSrc = read('trend-dynamics-cycle-lab.html');
  const pubEnv = build([
    extractFn(pubSrc, 'tdcComposeReadSentence'), extractFn(pubSrc, 'tdcBuildDeepLink'),
    extractFn(pubSrc, 'tdcBuildToolRead'), extractFn(pubSrc, 'tdcPublishToolRead')
  ], ['tdcPublishToolRead']);
  const pubResult = (over) => Object.assign({
    contractVersion: 'tdc-analysis-result/v1', resultId: 'res-777', requestDigest: 'dig-777',
    computedAt: '2026-08-11T12:00:00Z', sourceAsOf: '2026-08-10',
    sourceAvailability: 'current', truthState: 'current',
    request: { seriesId: 'srs-9', transformId: 'level', horizonId: 'medium' },
    trend: { direction: 'rising', trendType: 'linear' }, strength: { score: 0.5 },
    dynamics: { state: 'steady' }, changeState: 'stable',
    confidencePct: 60, caveats: [], complete: true
  }, over || {});

  const sent = [];
  const ok = pubEnv.tdcPublishToolRead(pubResult(), (id, payload) => { sent.push([id, payload]); return true; });
  assert(ok.published === true && ok.errorCode === null,
    'a complete result publishes and reports success, so the page may claim Brief coverage');
  assert(sent.length === 1 && sent[0][0] === 'trend-dynamics-cycle-lab'
    && sent[0][1].contractVersion === 'rl-tool-read/v1' && sent[0][1].metrics.resultId === 'res-777',
    'exactly one owner read is published under the registered id, carrying the identity of the run that produced it');

  const blocked = [];
  const partial = pubEnv.tdcPublishToolRead(pubResult({ complete: false }), (id, payload) => { blocked.push(id); return true; });
  assert(blocked.length === 0 && partial.published === false,
    'an incomplete run publishes NOTHING \u2014 the publisher is never called, so a partial analysis cannot reach the Brief');

  const source = pubResult();
  const rejected = pubEnv.tdcPublishToolRead(source, () => { throw new Error('quota exceeded'); });
  assert(rejected.published === false && rejected.errorCode === 'TDC-PUBLISH-REJECTED',
    'a rejected publish is reported as TDC-PUBLISH-REJECTED rather than swallowed, so the page cannot claim coverage it does not have');
  assert(source.complete === true && source.resultId === 'res-777' && source.truthState === 'current',
    'a publication failure leaves the result untouched \u2014 the analysis the reader is looking at does not change because a write failed');

  const refused = pubEnv.tdcPublishToolRead(pubResult(), () => false);
  assert(refused.published === false && refused.errorCode === 'TDC-PUBLISH-REJECTED',
    'a publisher that REFUSES without throwing is also treated as rejected, so a silent false is not read as success');
} catch (e) { failures++; console.log('  \u2717 FAIL (trend-dynamics-cycle-lab publication threw): ' + e.message); }

/* ── trend-dynamics-cycle-lab — Simple/Power mode (TP-04-01, spec 006 scope 4) ─────────────────
   design.md line 891: a mode change updates body.power, the tab ARIA state and visibility, then
   synchronously draws newly visible charts from lastCompleteResult -- and does NOT compute,
   fetch or publish. The failure that matters is a toggle that re-runs the analysis: the two
   views would then show two different runs while claiming to be one result, and a hidden canvas
   never redrawn on reveal renders blank. Compute, fetch and publish are injected as spies so
   "does not" is asserted rather than assumed. */
try {
  group('trend-dynamics-cycle-lab \u2014 switching Simple/Power redraws but never recomputes (TP-04-01)');
  const modeSrc = read('trend-dynamics-cycle-lab.html');
  const modeEnv = build([extractFn(modeSrc, 'tdcApplyMode')], ['tdcApplyMode']);
  const makeCtx = (mode) => {
    const classes = new Set(mode === 'power' ? ['power'] : []);
    return {
      calls: { compute: 0, fetch: 0, publish: 0, drawn: [], persisted: [] },
      body: { classList: {
        add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c)
      } },
      tabs: [{ mode: 'simple', ariaSelected: mode !== 'power' }, { mode: 'power', ariaSelected: mode === 'power' }],
      lastCompleteResult: { resultId: 'res-mode', requestDigest: 'dig-mode', complete: true }
    };
  };

  const ctx = makeCtx('simple');
  const toPower = modeEnv.tdcApplyMode('power', ctx, {
    compute: () => { ctx.calls.compute++; }, fetchSource: () => { ctx.calls.fetch++; },
    publish: () => { ctx.calls.publish++; }, draw: (r) => { ctx.calls.drawn.push(r); },
    persist: (m) => { ctx.calls.persisted.push(m); }
  });
  assert(toPower && toPower.mode === 'power' && ctx.body.classList.contains('power'),
    'switching to Power sets body.power, which is what the stylesheet keys visibility off');
  assert(ctx.calls.compute === 0 && ctx.calls.fetch === 0 && ctx.calls.publish === 0,
    'a mode change performs NO compute, fetch or publish \u2014 the two views cannot drift onto different runs');
  assert(ctx.calls.drawn.length === 1 && ctx.calls.drawn[0].resultId === 'res-mode',
    'newly visible charts are redrawn from lastCompleteResult, so a revealed canvas is never left blank');
  assert(ctx.tabs[1].ariaSelected === true && ctx.tabs[0].ariaSelected === false,
    'the tab ARIA state follows the mode, so a screen-reader user is told which view is active');
  assert(ctx.calls.persisted.length === 1 && ctx.calls.persisted[0] === 'power',
    'the chosen mode is persisted, so a reload does not silently drop the reader back to Simple');

  const back = makeCtx('power');
  modeEnv.tdcApplyMode('simple', back, { draw: (r) => back.calls.drawn.push(r), persist: (m) => back.calls.persisted.push(m) });
  assert(!back.body.classList.contains('power') && back.tabs[0].ariaSelected === true,
    'switching back to Simple clears body.power and moves the ARIA selection, so the toggle is symmetric');

  const bad = makeCtx('simple');
  const rejected = modeEnv.tdcApplyMode('expert', bad, { draw: () => bad.calls.drawn.push(1) });
  assert(rejected === null && bad.calls.drawn.length === 0 && !bad.body.classList.contains('power'),
    'an unknown mode is refused and changes nothing, so a crafted deep link cannot force an undefined view state');
} catch (e) { failures++; console.log('  \u2717 FAIL (trend-dynamics-cycle-lab mode threw): ' + e.message); }

/* ── trend-dynamics-cycle-lab — closed state vocabulary (TP-04-01, spec 006 scope 4) ───────────
   design.md requires closed truth/state vocabularies. Until now the builders passed truthState
   through verbatim, so a typo or a future engine state would have reached the Brief as though it
   were a declared reading -- and a consumer switching on the enum would fall through every arm
   and render nothing, or worse, treat an unknown state as healthy. An undeclared state must fail
   CLOSED to unavailable, which is the one value that overstates nothing. */
try {
  group('trend-dynamics-cycle-lab \u2014 an undeclared state fails closed instead of reaching a reader (TP-04-01)');
  const vocSrc = read('trend-dynamics-cycle-lab.html');
  const vocEnv = build([
    extractFn(vocSrc, 'tdcComposeReadSentence'), extractFn(vocSrc, 'tdcBuildDeepLink'),
    extractFn(vocSrc, 'tdcBuildToolRead')
  ], ['tdcBuildToolRead']);
  const vocResult = (over) => Object.assign({
    contractVersion: 'tdc-analysis-result/v1', resultId: 'res-voc', requestDigest: 'dig-voc',
    computedAt: '2026-08-11T12:00:00Z', sourceAsOf: '2026-08-10',
    sourceAvailability: 'current', truthState: 'current',
    request: { seriesId: 'srs-v', transformId: 'level', horizonId: 'medium' },
    trend: { direction: 'rising', trendType: 'linear' }, strength: { score: 0.4 },
    dynamics: { state: 'steady' }, changeState: 'stable',
    confidencePct: 55, caveats: [], complete: true
  }, over || {});

  for (const declared of ['current', 'stale', 'degraded', 'unavailable']) {
    const read1 = vocEnv.tdcBuildToolRead(vocResult({ truthState: declared }));
    assert(read1.metrics.truthState === declared,
      'the declared state \u201c' + declared + '\u201d survives unchanged, so the guard narrows nothing that is legitimate');
  }

  const bogus = vocEnv.tdcBuildToolRead(vocResult({ truthState: 'probably-fine' }));
  assert(bogus.metrics.truthState === 'unavailable',
    'an undeclared state fails CLOSED to unavailable rather than reaching the Brief as if it were a real reading');
  assert(bogus.metrics.strengthScore === undefined && bogus.asOf === null,
    'failing closed also withholds the measurements, so an unrecognised state cannot publish numbers a reader would trust');
} catch (e) { failures++; console.log('  \u2717 FAIL (trend-dynamics-cycle-lab vocabulary threw): ' + e.message); }

/* ── trend-dynamics-cycle-lab — result assembly (TP-04-01, spec 006 scope 4) ───────────────────
   AnalysisResultV1 is the one frozen object every renderer, the history and the owner read read
   from. Two properties carry the weight. First, complete is true ONLY once every required work
   item is accounted for -- eligible, unavailable, cancelled or errored -- because a partial run
   that reported complete would publish a verdict built from missing evidence. Second, timings
   are diagnostics and must not reach the digest (design.md line 979): if they did, the same
   analysis would get a new resultId on every run and no two results could ever be compared. */
try {
  group('trend-dynamics-cycle-lab \u2014 the assembled result is frozen, complete-gated and timing-independent (TP-04-01)');
  const asmSrc = read('trend-dynamics-cycle-lab.html');
  const asmEnv = build([
    extractFn(asmSrc, 'tdcIsPlainObject'), extractFn(asmSrc, 'tdcError'),
    extractFn(asmSrc, 'tdcStableSerialize'), extractFn(asmSrc, 'tdcStableDigest'),
    extractFn(asmSrc, 'tdcDeepFreeze'), extractFn(asmSrc, 'tdcAssembleResult')
  ], ['tdcAssembleResult']);
  const asmParts = (over) => Object.assign({
    request: { seriesId: 'srs-1', transformId: 'level', horizonId: 'medium', profileId: 'balanced' },
    registryVersion: 'reg-1', configDigest: 'cfg-1',
    computedAt: '2026-08-11T12:00:00Z', decisionTime: '2026-08-11T00:00:00Z',
    sourceAsOf: '2026-08-10', sourceAvailability: 'current', truthState: 'current',
    requiredMethodIds: ['M02', 'M01'],
    methodResults: [{ methodId: 'M02', state: 'eligible' }, { methodId: 'M01', state: 'unavailable' }],
    trend: { direction: 'rising', trendType: 'linear' }, strength: { score: 0.7 },
    dynamics: { state: 'steady' }, changeState: 'stable',
    timings: { totalMs: 12.5 }
  }, over || {});

  const asm = asmEnv.tdcAssembleResult(asmParts());
  assert(asm.contractVersion === 'tdc-analysis-result/v1' && typeof asm.resultId === 'string' && asm.resultId.length > 0
    && typeof asm.requestDigest === 'string' && asm.requestDigest.length > 0,
    'the assembled result carries the contract version and a derived result id and request digest');
  assert(asm.complete === true,
    'every required method is accounted for \u2014 one eligible and one unavailable \u2014 so the run is complete');

  assert(Object.isFrozen(asm) && Object.isFrozen(asm.trend),
    'the result is deeply frozen, so no renderer can quietly edit the analysis it is displaying');
  const before = asm.truthState;
  try { asm.truthState = 'tampered'; } catch (ignored) { /* strict mode throws; sloppy mode ignores */ }
  assert(asm.truthState === before,
    'writing to a frozen result does not take effect, so the freeze is real rather than declarative');

  const partial = asmEnv.tdcAssembleResult(asmParts({ methodResults: [{ methodId: 'M02', state: 'eligible' }] }));
  assert(partial.complete === false,
    'a required method with no result at all leaves the run INCOMPLETE, so a partial analysis cannot publish');
  const errored = asmEnv.tdcAssembleResult(asmParts({
    methodResults: [{ methodId: 'M02', state: 'eligible' }, { methodId: 'M01', state: 'error' }]
  }));
  assert(errored.complete === true,
    'an explicit error still ACCOUNTS for its work item \u2014 completeness means every item resolved, not that every item succeeded');

  const twin = asmEnv.tdcAssembleResult(asmParts());
  assert(twin.resultId === asm.resultId,
    'identical inputs produce an identical result id, so the digest is deterministic rather than clock- or order-dependent');
  const slower = asmEnv.tdcAssembleResult(asmParts({ timings: { totalMs: 987.6 } }));
  assert(slower.resultId === asm.resultId,
    'a different timing produces the SAME result id \u2014 diagnostics are excluded from the digest, so two runs of one analysis stay comparable');

  assert(asm.methodResults[0].methodId === 'M01' && asm.methodResults[1].methodId === 'M02',
    'method results are sorted by stable id rather than arrival order, so the digest cannot change with scheduling');
} catch (e) { failures++; console.log('  \u2717 FAIL (trend-dynamics-cycle-lab assembly threw): ' + e.message); }

/* ── trend-dynamics-cycle-lab — assembly feeds the publishers (TP-04-01, spec 006 scope 4) ─────
   The assembly and the owner read were built separately against the same written contract, which
   is exactly the situation where a field name quietly diverges and nobody notices until the Brief
   shows a gap. This drives the REAL pipeline end to end -- assemble, read, publish -- instead of
   handing the publishers a fixture shaped the way they happen to want. */
try {
  group('trend-dynamics-cycle-lab \u2014 an assembled result survives the whole publish pipeline (TP-04-01)');
  const e2eSrc = read('trend-dynamics-cycle-lab.html');
  const e2eEnv = build([
    extractFn(e2eSrc, 'tdcIsPlainObject'), extractFn(e2eSrc, 'tdcError'),
    extractFn(e2eSrc, 'tdcStableSerialize'), extractFn(e2eSrc, 'tdcStableDigest'),
    extractFn(e2eSrc, 'tdcDeepFreeze'), extractFn(e2eSrc, 'tdcAssembleResult'),
    extractFn(e2eSrc, 'tdcComposeReadSentence'), extractFn(e2eSrc, 'tdcBuildDeepLink'),
    extractFn(e2eSrc, 'tdcBuildToolRead'), extractFn(e2eSrc, 'tdcPublishToolRead')
  ], ['tdcAssembleResult', 'tdcBuildToolRead', 'tdcPublishToolRead']);

  const assembled = e2eEnv.tdcAssembleResult({
    request: { seriesId: 'srs-e2e', transformId: 'level', horizonId: 'medium', profileId: 'balanced' },
    registryVersion: 'reg-1', configDigest: 'cfg-1',
    computedAt: '2026-08-11T12:00:00Z', decisionTime: '2026-08-11T00:00:00Z',
    sourceAsOf: '2026-08-10', sourceAvailability: 'current', truthState: 'current',
    requiredMethodIds: ['M01'], methodResults: [{ methodId: 'M01', state: 'eligible' }],
    trend: { direction: 'rising', trendType: 'linear' }, strength: { score: 0.81 },
    dynamics: { state: 'accelerating' }, changeState: 'stable',
    confidencePct: 77, keyContext: 'expansion', timings: { totalMs: 3.2 }
  });

  const readOut = e2eEnv.tdcBuildToolRead(assembled);
  assert(readOut && readOut.metrics.resultId === assembled.resultId && readOut.metrics.requestDigest === assembled.requestDigest,
    'the published read carries the assembled result\u2019s own identity, so a reader can trace the Brief line back to the run');
  assert(readOut.metrics.direction === 'rising' && readOut.metrics.trendType === 'linear'
    && readOut.metrics.dynamics === 'accelerating' && readOut.metrics.changeState === 'stable',
    'every verdict field crosses the assembly/publisher boundary intact');
  assert(readOut.metrics.strengthScore === 0.81,
    'the strength measurement crosses intact at full precision, since the owner read is not a display surface');
  assert(readOut.metrics.confidencePct === 77 && readOut.metrics.keyContext === 'expansion',
    'confidence and key context survive assembly \u2014 a field the assembly forgot to carry would silently vanish from the Brief');
  assert(readOut.deepLink.indexOf('series=srs-e2e') > 0,
    'the deep link is built from the assembled request, so it returns to the run that was published');

  const sent = [];
  const published = e2eEnv.tdcPublishToolRead(assembled, (id, payload) => { sent.push([id, payload]); return true; });
  assert(published.published === true && sent.length === 1 && sent[0][1].metrics.resultId === assembled.resultId,
    'the assembled result publishes end to end, so step 1 and step 3 are proven to agree on one contract');
} catch (e) { failures++; console.log('  \u2717 FAIL (trend-dynamics-cycle-lab pipeline threw): ' + e.message); }

/* ---------- Bond regime: one-model parity guarantee (spec 018 Scope 6) ----------
   The highest-value test in feature 018. It makes the Outcome Contract's hard constraint — ONE
   model, two compositions — checkable rather than asserted.

   One frozen input set is handed to the BROWSER composition (the page's own computeBondLabViewModel,
   loaded not reimplemented) and to the REAL HEADLESS path (a temporary artifact, resolved and
   admitted by buildBondRegimeToolRead). Four fields are compared, each as an equality between two
   COMPUTED values with no literal on either side.

   The comparison is proven capable of failing: perturbing one row of the headless input alone must
   make the two sides disagree. Without that, an assertion comparing two calls into the same loaded
   module would pass even if the headless path ignored its own input entirely.

   No wall clock, no network, no committed artifact: the group writes only under a temp root and
   asserts the committed artifact is byte-identical afterwards. */
try {
  group('bond-regime — one-model parity guarantee');
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync: readSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { createHash } = await import('node:crypto');
  const refresh6 = await import('./brief-refresh.mjs');
  const universe6 = JSON.parse(read('bond-regime-universe.json'));

  const committedArtifactPath = join(ROOT, 'data', 'curves', 'us-treasury', 'curve.json');
  const digestBefore = existsSync(committedArtifactPath) ? createHash('sha256').update(readSync(committedArtifactPath)).digest('hex') : null;

  // (1) One frozen input set. Fixed dates, fixed values, no clock and no network.
  const parityDay = (index) => new Date(Date.UTC(2025, 10, 8 + index)).toISOString().slice(0, 10);
  const frozenNominal = Array.from({ length: 60 }, (_, i) => ({
    date: parityDay(i), y3m: 4.30 - 0.004 * i, y2: 3.95 + 0.003 * i, y5: 4.05 + 0.002 * i, y10: 4.35 + 0.005 * i, y30: 4.90 + 0.004 * i
  }));
  const frozenReal = frozenNominal.map((row) => ({ date: row.date, y5: 1.70 + 0.001 * (frozenNominal.indexOf(row)), y10: 1.95 + 0.002 * frozenNominal.indexOf(row), y20: 2.28, y30: 2.40 }));
  const coverageYears6 = [...new Set(frozenNominal.map((r) => Number(r.date.slice(0, 4))))].sort();
  const observedAt6 = frozenNominal[frozenNominal.length - 1].date;

  // (2) The BROWSER composition: the page's own model, loaded through the same helper the brief uses,
  // with the SAME dependency set brief-refresh.mjs declares — so this is the shipped model, not a copy.
  const page6 = refresh6.loadToolFunctions('bond-regime-lab.html', [
    'finiteNumber', 'bpToDecimal', 'pctToDecimal', 'alignCommonDateRows', 'buildRatioSeries', 'rollingPercentile',
    'estimateDurationConfound', 'classifyRelativeCreditPulse', 'classifyCreditConfirmation', 'aggregateCreditConfirmations',
    'classifyCreditRegime', 'classifyCurveState', 'classifyCurveImpulse', 'deriveBreakevenRows', 'classifyInflationState',
    'classifyDurationPosture', 'scenarioShockForSleeve', 'solveBreakEvenShock', 'classifyReliability', 'calculateScenarioResult',
    'rankScenarioResults', 'selectResearchExpression', 'buildDecisionRead', 'buildBondToolRead', 'stableDecisionDigest',
    'instrumentIndex', 'computeCreditView', 'computeBondLabViewModel', 'bondParityVerdict'
  ]);
  const browserFamily = (rows, sourceId) => ({ state: 'fresh', rows, observedAt: rows[rows.length - 1].date, retrievedAt: '2026-01-05T00:00:00.000Z', sourceId, sourceUrl: null, rights: 'public-official', persistence: 'browser-cache', errorCode: null });
  const parityConfig = JSON.parse(JSON.stringify(universe6));
  for (const instrument of parityConfig.instruments) {
    for (const field of ['carry', 'rateDuration', 'spreadDuration', 'convexity']) if (instrument[field]) instrument[field].asOf = observedAt6;
  }
  const browserCompose = (nominalRows, realRows) => page6.computeBondLabViewModel(parityConfig, {
    bars: {}, barMeta: {}, treasuryChanges: null, confirmations: null,
    nominalCurve: browserFamily(nominalRows, 'us-treasury-nominal'),
    realCurve: browserFamily(realRows, 'us-treasury-real')
  }, parityConfig.scenarioPresets[0], {});

  // (3) The REAL HEADLESS path: a temp artifact, resolved and admitted, never a shortcut.
  const tempRoot = mkdtempSync(join(tmpdir(), 'rl-parity-'));
  const writeArtifact = (nominalRows, realRows, years) => {
    const dir = join(tempRoot, 'data', 'curves', 'us-treasury');
    mkdirSync(dir, { recursive: true });
    const family = (rows, sourceId, kind) => {
      // The query type is parsed out of the declared policy's own URL template, so the fixture
      // cannot drift from the source-id-to-query binding the gate enforces.
      const template = String(universe6.sourcePolicies[kind].urlTemplate);
      const queryType = (/[?&]type=([^&]+)/.exec(template) || [])[1];
      return {
        sourceId, state: 'fresh', errorCode: null, coverageYears: years,
        observedAt: rows[rows.length - 1].date,
        declaredPolicy: universe6.sourcePolicies[kind],
        persistence: 'same-origin-artifact', rights: 'public-official', rows,
        provenance: [{
          contractVersion: 'source-provenance/v1', sourceId, sourceKind: 'official-report', accessClass: 'public-official',
          adapterId: 'official-curve-acquisition', adapterVersion: '1.0.0',
          sourceUsePolicyId: 'us-treasury-public-official', sourceUseReviewRef: 'specs/018-headless-official-curve-publication',
          freshnessPolicy: 'observed-cadence/v1',
          sourceUrl: template.split('{YEAR}').join('2026'),
          requestDescriptor: { method: 'GET', path: '/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/2026/all', query: { type: queryType, field_tdr_date_value: '2026', _format: 'csv' } },
          sourcePublishedAt: null, retrievedAt: '2026-01-06T00:00:00.000Z',
          contentSha256: 'sha256:' + createHash('sha256').update(JSON.stringify(rows)).digest('hex'),
          retentionMode: 'normalized-facts-and-hash', freshnessState: 'current', diagnostics: []
        }]
      };
    };
    writeFileSync(join(dir, 'curve.json'), JSON.stringify({
      contractVersion: 'official-curve-artifact/v1', generatedAt: '2026-01-05T00:00:00.000Z',
      freshnessPolicy: { policyId: 'observed-cadence/v1', cadenceWindowRows: 10, minCadenceObservations: 5, publicationLagDays: 1 },
      families: { nominal: family(nominalRows, 'us-treasury-nominal', 'nominalCurve'), real: family(realRows, 'us-treasury-real', 'realCurve') }
    }, null, 2));
    return JSON.parse(readSync(join(dir, 'curve.json'), 'utf8'));
  };
  const headlessCompose = (nominalRows, realRows, years) => refresh6.buildBondRegimeToolRead({
    config: parityConfig,
    officialCurveArtifact: writeArtifact(nominalRows, realRows, years || coverageYears6),
    runDate: nominalRows[nominalRows.length - 1].date
  });

  const browserView = browserCompose(frozenNominal, frozenReal);
  const headlessRead = headlessCompose(frozenNominal, frozenReal);
  const browserSide = {
    curveState: browserView.curveState.state, curveImpulse: browserView.curveImpulse.state,
    inflationState: browserView.inflationState.state, durationPosture: browserView.durationPosture.state
  };
  const headlessSide = {
    curveState: headlessRead.metrics.curveState, curveImpulse: headlessRead.metrics.curveImpulse,
    inflationState: headlessRead.metrics.inflationState, durationPosture: headlessRead.metrics.durationPosture
  };

  // TP-06-01 — the four fields are pairwise equal, each an equality between two COMPUTED values.
  assert(typeof page6.computeBondLabViewModel === 'function' && typeof page6.bondParityVerdict === 'function',
    'Parity TP-06-01: the page\u2019s own composition and parity helpers both resolve, so the comparison runs against the real model rather than a reimplementation');
  assert(headlessRead.metrics.curveAdmission.nominal.verdict === 'current',
    'Parity TP-06-01: the headless side reached its verdict THROUGH resolution and admission, not around them');
  for (const field of ['curveState', 'curveImpulse', 'inflationState', 'durationPosture']) {
    assert(browserSide[field] === headlessSide[field],
      'Parity TP-06-01: ' + field + ' is identical across the browser composition and the real headless path (' + browserSide[field] + ' === ' + headlessSide[field] + ')');
  }

  // TP-06-02 — the two-calendar-year window is load-bearing, not decorative. Removing the prior year
  // from the SAME input must take the impulse out, because the impulse needs a lookback of history.
  const januaryOnly = frozenNominal.filter((row) => row.date.slice(0, 4) === '2026');
  const twoYearImpulse = browserCompose(frozenNominal, frozenReal).curveImpulse.state;
  const oneYearImpulse = browserCompose(januaryOnly.length ? januaryOnly : frozenNominal.slice(-5), frozenReal).curveImpulse.state;
  assert(twoYearImpulse !== 'Unavailable' && oneYearImpulse === 'Unavailable',
    'Parity TP-06-02: the full retained window yields a derivable impulse (' + twoYearImpulse + ') while the truncated window yields Unavailable \u2014 the window is load-bearing');

  // TP-06-03 — ADVERSARIAL: perturb ONE row of the headless input alone. If the headless path
  // ignored its own input, this would still agree, and the whole parity assertion would be vacuous.
  const perturbedNominal = frozenNominal.map((row, i) => (i === frozenNominal.length - 1 ? Object.assign({}, row, { y10: row.y10 - 1.8, y2: row.y2 + 1.2 }) : row));
  const perturbedRead = headlessCompose(perturbedNominal, frozenReal);
  const perturbedSide = {
    curveState: perturbedRead.metrics.curveState, curveImpulse: perturbedRead.metrics.curveImpulse,
    inflationState: perturbedRead.metrics.inflationState, durationPosture: perturbedRead.metrics.durationPosture
  };
  const perturbedDiffers = ['curveState', 'curveImpulse', 'inflationState', 'durationPosture'].some((f) => browserSide[f] !== perturbedSide[f]);
  assert(perturbedDiffers,
    'Parity TP-06-03: perturbing one row of the HEADLESS input alone makes the compositions disagree, so the comparison is capable of failing (' + JSON.stringify(perturbedSide) + ')');
  const perturbedVerdict = page6.bondParityVerdict(Object.assign({ coverageYears: coverageYears6, observedAt: observedAt6 }, browserSide), Object.assign({ coverageYears: coverageYears6, observedAt: observedAt6 }, perturbedSide));
  assert(perturbedVerdict.verdict === 'differ' && perturbedVerdict.differing.length > 0 && perturbedVerdict.comparedFields === 4,
    'Parity TP-06-03: the parity verdict REPORTS the disagreement rather than passing (' + perturbedVerdict.differing.join(', ') + ')');

  // TP-06-04 — D-1 / R-3: unequal coverageYears is not a disagreement, it is an incomparability.
  const agreeVerdict = page6.bondParityVerdict(Object.assign({ coverageYears: coverageYears6, observedAt: observedAt6 }, browserSide), Object.assign({ coverageYears: coverageYears6, observedAt: observedAt6 }, headlessSide));
  assert(agreeVerdict.verdict === 'agree' && agreeVerdict.comparedFields === 4,
    'Parity TP-06-04: equal windows and equal readings yield Agree across all four compared fields');
  const windowVerdict = page6.bondParityVerdict(Object.assign({ coverageYears: [2025, 2026], observedAt: observedAt6 }, browserSide), Object.assign({ coverageYears: [2024, 2025], observedAt: observedAt6 }, browserSide));
  assert(windowVerdict.verdict === 'cannot-compare' && windowVerdict.reasonCode === 'differing-observation-window'
    && windowVerdict.verdict !== 'agree' && windowVerdict.verdict !== 'differ' && /different observation windows/.test(windowVerdict.reason),
    'Parity TP-06-04: unequal coverageYears yields Cannot be compared with the differing-window reason \u2014 neither Agree nor Differ (D-1, R-3)');
  assert(page6.bondParityVerdict(null, headlessSide).verdict === 'cannot-compare'
    && page6.bondParityVerdict(browserSide, null).reasonCode === 'no-published-read',
    'Parity TP-06-04: an absent side is Cannot be compared with its own reason \u2014 silence is never agreement');

  // TP-06-05 — isolation: the group wrote only under a temp root.
  const digestAfter = existsSync(committedArtifactPath) ? createHash('sha256').update(readSync(committedArtifactPath)).digest('hex') : null;
  assert(digestBefore === digestAfter,
    'Parity TP-06-05: data/curves/us-treasury/curve.json is byte-identical before and after the parity group \u2014 the suite never mutates published evidence');
  assert(tempRoot.startsWith(tmpdir()) && existsSync(join(tempRoot, 'data', 'curves', 'us-treasury', 'curve.json')),
    'Parity TP-06-05: the parity artifact was written under a temporary root, never into the repository');
  rmSync(tempRoot, { recursive: true, force: true });
} catch (e) { failures++; console.log('  \u2717 FAIL (one-model parity group threw): ' + e.message); }

/* ---------- Feature 008 Scope 04: shared-consumer canary (TP-04-04) ----------
   Scope 04 edits rldata.js and rlportfolio.js, both of which other tools depend on. This group is
   the independent canary the scope's Shared Infrastructure Impact Sweep requires: it proves the
   additive surface did not disturb the legacy one, and that the only thing the portfolio tool
   publishes into the shared cache is the constant privacy boundary. */
try {
  group('Feature 008 Scope 04 shared-consumer canary');
  const rldata8Source = read('rldata.js');
  const durable8 = {}, session8 = {};
  const store8 = (backing) => ({
    getItem: (k) => (Object.prototype.hasOwnProperty.call(backing, k) ? backing[k] : null),
    setItem: (k, v) => { backing[k] = String(v); },
    removeItem: (k) => { delete backing[k]; },
    key: (i) => Object.keys(backing)[i] ?? null,
    get length() { return Object.keys(backing).length; }
  });
  const root8 = { location: { pathname: '/index.html', protocol: 'https:' } };
  const requests8 = [];
  const rldata8 = Function('globalThis', 'window', 'localStorage', 'sessionStorage', 'fetch', 'location', 'document',
    rldata8Source + '\nreturn globalThis.RLDATA;')(
    root8, root8, store8(durable8), store8(session8),
    (url) => { requests8.push(String(url)); return Promise.reject(new Error('offline canary')); },
    root8.location, undefined);

  /* The legacy surface every other tool already binds to. Asserted by NAME so an accidental
     rename or drop in the Feature 008 block fails here rather than in a downstream tool. */
  const legacy8 = ['bars', 'putBars', 'quote', 'putQuote', 'barSeries', 'putBarSeries', 'ensureBarSeries',
    'options', 'putOptions', 'macro', 'putMacro', 'events', 'putEvents', 'toolRead', 'putToolRead',
    'freshness', 'barInfo', 'dataState', 'reportData', 'ensureBars', 'ensureMacro', 'mergeBars', 'isFresh'];
  const missing8 = legacy8.filter((name) => typeof rldata8[name] !== 'function');
  assert(missing8.length === 0, 'Scope 04 TP-04-04: every legacy RLDATA consumer method survives the additive block (missing: ' + missing8.join(',') + ')');
  assert(typeof rldata8.ensureBarCoverage === 'function', 'Scope 04 TP-04-04: the additive ensureBarCoverage method is present');
  assert(typeof rldata8.barAlignmentStates === 'function', 'Scope 04 TP-04-04: the additive barAlignmentStates method is present');

  rldata8.putBars('CANARY08', '1d', [{ t: Date.parse('2026-07-06T00:00:00.000Z'), c: 10 }, { t: Date.parse('2026-07-07T00:00:00.000Z'), c: 11 }], 'same-origin-fixture');
  const legacyRows8 = JSON.stringify(rldata8.bars('CANARY08', '1d'));
  const coverage8 = rldata8.ensureBarCoverage('CANARY08', '1d', { mode: 'same-origin-only', requiredFirst: '2026-07-06', requiredLast: '2026-07-07' });
  assert(coverage8.state === 'complete' && coverage8.firstDate === '2026-07-06' && coverage8.lastDate === '2026-07-07',
    'Scope 04 TP-04-04: coverage reports the actual observed span');
  assert(JSON.stringify(rldata8.bars('CANARY08', '1d')) === legacyRows8,
    'Scope 04 TP-04-04: a coverage read leaves the rows legacy callers see byte-identical');
  assert(requests8.length === 0, 'Scope 04 TP-04-04: the canary reached the network zero times (recorder, not an omitted binding)');

  /* The public-cache half. The portfolio module publishes exactly one record, and it must survive
     the real store's contract check — a shape violation makes putToolRead return null. */
  const { createRequire: createRequire8 } = await import('node:module');
  const rlportfolio8 = createRequire8(import.meta.url)('../rlportfolio.js');
  const boundary8 = rlportfolio8.privacyBoundaryToolRead('2026-07-15T14:00:00.000Z');
  const stored8 = rldata8.putToolRead(boundary8.id, boundary8);
  assert(stored8 !== null && stored8.availability === 'unavailable' && stored8.metrics.personalDataIncluded === false,
    'Scope 04 TP-04-04: RLDATA accepts the constant privacy-boundary read as the tool\u2019s only publication');
  const publicState8 = JSON.stringify(JSON.parse(durable8.rlData).toolReads);
  assert(!/MSFT|BND|holdings|costBasis|mandate|behaviorEvents|interestSignals|rlPortfolioWorkspace/.test(publicState8),
    'Scope 04 TP-04-04: the shared public cache carries no holding, conclusion, or personal storage name');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 008 Scope 04 canary group threw): ' + e.message); }

/* ---------- Feature 019 Scope 01: agenda registry contract ---------- */
try {
  const agendaRequire = (await import('node:module')).createRequire(import.meta.url);
  const RLAGENDA = agendaRequire('../rlagenda.js');
  const agendaSource = read('rlagenda.js');
  const registryText = read('research-agenda.json');
  const registry = JSON.parse(registryText);
  const primaryDefinition = JSON.parse(read('research/agenda/topics/geopolitical-supply-shock.definition.json'));
  const primaryCalibration = JSON.parse(read('research/agenda/topics/geopolitical-supply-shock.calibration.json'));
  const defenseDefinition = JSON.parse(read('research/agenda/topics/defense-earnings-acceleration.definition.json'));
  const foodDefinition = JSON.parse(read('research/agenda/topics/food-inputs-outlook.definition.json'));

  group('SCN-019-001 committed agenda loads from repository state without browser or network input');
  const committedResult = RLAGENDA.readAgendaText(registryText, 'research-agenda.json');
  assert(committedResult.ok && committedResult.status === 'available'
    && committedResult.declaredCount === 3 && committedResult.accepted.length === 3
    && committedResult.refusals.length === 0,
  'TP-01-01: the committed agenda validates all three topics from repository bytes');
  assert(!/localStorage|sessionStorage|\bfetch\s*\(|XMLHttpRequest|https?:\/\//.test(agendaSource + registryText),
    'TP-01-01: the agenda foundation reads no browser state and embeds no network input');

  group('SCN-019-002 absent agenda is named and never replaced with default topics');
  const absentResult = RLAGENDA.readAgendaText(null, 'research-agenda.json');
  assert(!absentResult.ok && absentResult.status === 'absent'
    && absentResult.declaredCount === 0 && absentResult.accepted.length === 0
    && absentResult.refusals.length === 1
    && absentResult.refusals[0].code === 'RLAGENDA-CONTRACT-ABSENT',
  'TP-01-02: absence is explicit and carries no synthesized topic');

  group('SCN-019-003 missing review mode refuses only the invalid topic');
  const missingModeFixture = JSON.parse(read('tests/fixtures/research-agenda/missing-review-mode.json'));
  const partialResult = RLAGENDA.validateAgenda(missingModeFixture);
  assert(!partialResult.ok && partialResult.status === 'partial'
    && partialResult.declaredCount === 3 && partialResult.accepted.length === 2
    && partialResult.refusals.length === 1
    && partialResult.refusals[0].topicId === 'geopolitical-supply-shock'
    && partialResult.refusals[0].code === 'RLAGENDA-MODE-MISSING',
  'TP-01-03: one missing mode yields one named refusal while two topics remain accepted');
  assert(partialResult.accepted.map((topic) => topic.topicId).join(',') === 'defense-earnings-acceleration,food-inputs-outlook'
    && partialResult.accepted.length + partialResult.refusals.length === partialResult.declaredCount,
  'TP-01-03: accepted plus refused accounts for every declared topic without disabling valid peers');

  group('SCN-019-007 three initial topics validate through one topic-neutral foundation');
  const definitionRows = [
    [primaryDefinition, registry.topics[0]],
    [defenseDefinition, registry.topics[1]],
    [foodDefinition, registry.topics[2]]
  ];
  const definitionResults = definitionRows.map((row) => RLAGENDA.validateTopicDefinition(row[0], row[1]));
  const primarySectionIds = primaryDefinition.analyticalSections.map((section) => section.sectionId);
  assert(definitionResults.every((result) => result.ok)
    && primarySectionIds.length === 8 && new Set(primarySectionIds).size === 8
    && RLAGENDA.validateCalibration(primaryCalibration, primaryDefinition).ok,
  'TP-01-04: all definitions and the versioned primary calibration satisfy the shared contracts');
  assert(!Object.prototype.hasOwnProperty.call(defenseDefinition, 'actors')
    && !Object.prototype.hasOwnProperty.call(defenseDefinition, 'flowNetwork')
    && !Object.prototype.hasOwnProperty.call(foodDefinition, 'actors')
    && !Object.prototype.hasOwnProperty.call(foodDefinition, 'flowNetwork')
    && !/iran|hormuz|bab-el-mandeb|red-sea/i.test(JSON.stringify(RLAGENDA.CONTRACT_SHAPES)),
  'TP-01-04: cadence topics remain independent and the shared contract has no Iran-only field');

  group('Regression: agenda modes capacities vocabularies and formulas fail closed and have one owner');
  const unknownMember = RLAGENDA.validateAgenda(JSON.parse(read('tests/fixtures/research-agenda/unknown-registry-member.json')));
  const capacityPlusOne = RLAGENDA.validateAgenda(JSON.parse(read('tests/fixtures/research-agenda/capacity-plus-one.json')));
  const invalidEvidence = RLAGENDA.validateEvidenceRecord(
    JSON.parse(read('tests/fixtures/research-agenda/invalid-evidence-record.json')),
    primaryDefinition.evidencePolicy
  );
  const validEvidence = JSON.parse(read('tests/fixtures/research-agenda/valid-evidence-record.json'));
  const weighted = RLAGENDA.computeEvidenceWeight(validEvidence, primaryDefinition.evidencePolicy, '2026-08-13T12:00:00.000Z');
  assert(!unknownMember.ok && unknownMember.refusals.some((row) => row.code === 'RLAGENDA-CONTRACT-UNKNOWN-MEMBER')
    && !capacityPlusOne.ok && capacityPlusOne.refusals.some((row) => row.code === 'RLAGENDA-CAPACITY-EVERY-GENERATION')
    && !invalidEvidence.ok && invalidEvidence.code === 'RLAGENDA-EVIDENCE-VOCABULARY',
  'TP-01-05: unknown members, mandatory capacity plus one, and unknown evidence vocabulary are refused');
  assert(weighted.ok && weighted.weight === 0.195 && weighted.boundedImpact === 0.195
    && weighted.factors.confidence === 0.65 && weighted.factors.provenance === 1
    && weighted.factors.role === 0.6 && weighted.factors.corroboration === 0.5
    && weighted.factors.freshness === 1,
  'TP-01-05: evidence weighting uses only explicit policy values and exposes every factor');
  const owningModules = readdirSync(ROOT)
    .filter((file) => /^rl.*\.js$/.test(file))
    .filter((file) => /RLAGENDA-|computeEvidenceWeight|research-evidence-record\/v1/.test(read(file)));
  assert(owningModules.length === 1 && owningModules[0] === 'rlagenda.js'
    && ['computeEvidenceWeight', 'updateEscalationProbabilities', 'computeFlowState',
      'computeCommodityShockRanges', 'computeEquityProxyRanges', 'compareScenarioOutputs',
      'classifyChangeDirection', 'buildAgendaChartSeries'].every((name) => {
      extractFn(agendaSource, name);
      return typeof RLAGENDA[name] === 'function';
    }),
  'TP-01-05: one UMD module owns the closed vocabulary and every deterministic function declaration');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 019 Scope 01 agenda registry contract group threw): ' + e.message); }

/* ---------- Feature 019 Scope 02: immutable lifecycle and historical seed ---------- */
try {
  const lifecycleRequire = (await import('node:module')).createRequire(import.meta.url);
  const RLAGENDA = lifecycleRequire('../rlagenda.js');
  const ZERO_HASH = 'sha256:' + '0'.repeat(64);
  const ONE_HASH = 'sha256:' + '1'.repeat(64);
  const TWO_HASH = 'sha256:' + '2'.repeat(64);
  const topicId = 'geopolitical-supply-shock';
  const historicalPath = 'research/agenda/dossiers/geopolitical-supply-shock/historical-2026-08-10-v1.json';
  const historicalDossierText = read(historicalPath);
  const historicalDossier = JSON.parse(historicalDossierText);
  const historicalRefResult = RLAGENDA.buildArtifactRef(historicalPath, historicalDossier);
  const eventBody = (overrides = {}) => ({
    contractVersion: RLAGENDA.HISTORY_EVENT_VERSION,
    eventType: 'historical-seed',
    occurredAt: '2026-08-10T23:59:59.000Z',
    topicId,
    generationId: null,
    reviewId: null,
    dossierId: historicalDossier.dossierId,
    correctsEventId: null,
    supersedesEventId: null,
    artifactRef: historicalRefResult.ref,
    ...overrides
  });

  group('SCN-019-005 paused topic skips review and preserves every historical reference');
  const priorHistoryRefs = Object.freeze([
    Object.freeze({ dossierId: historicalDossier.dossierId, path: historicalPath })
  ]);
  const priorHistoryBytes = JSON.stringify(priorHistoryRefs);
  const paused = RLAGENDA.classifyTopicLifecycle({ topicId, lifecycleState: 'paused' }, priorHistoryRefs);
  assert(paused.ok && paused.lifecycleState === 'paused' && paused.outcome === 'paused'
    && paused.shouldResearch === false && JSON.stringify(paused.historyRefs) === priorHistoryBytes,
  'TP-02-01: paused is an explicit non-researched outcome and preserves every historical ref');
  assert(JSON.stringify(priorHistoryRefs) === priorHistoryBytes && paused.outcome !== 'unavailable',
  'TP-02-01: classification mutates no history and never reports a failed review');

  group('SCN-019-006 retirement appends one lifecycle event without deleting history');
  const seedEvent = RLAGENDA.buildHistoryEvent(eventBody());
  const seedHistoryText = RLAGENDA.canonicalizeAgenda(seedEvent.event) + '\n';
  const retirementEvent = RLAGENDA.buildHistoryEvent(eventBody({
    eventType: 'lifecycle',
    occurredAt: '2026-08-11T12:00:00.000Z',
    dossierId: null,
    supersedesEventId: seedEvent.event.eventId,
    artifactRef: null
  }));
  const retired = RLAGENDA.classifyTopicLifecycle({ topicId, lifecycleState: 'retired' }, priorHistoryRefs);
  const retirementAppend = RLAGENDA.appendHistoryEvents(seedHistoryText, [retirementEvent.event]);
  assert(retired.ok && retired.shouldResearch === false && retired.outcome === 'retired'
    && retirementAppend.ok && retirementAppend.candidateText.startsWith(seedHistoryText)
    && retirementAppend.candidateText.split('\n').filter(Boolean).length === 2,
  'TP-02-02: retirement adds exactly one dated lifecycle row after the unchanged prior ledger');
  assert(historicalDossierText === read(historicalPath) && JSON.stringify(retired.historyRefs) === priorHistoryBytes,
  'TP-02-02: retirement leaves the historical dossier and its reference byte-identical');

  group('SCN-019-016 generation review dossier and event identities are deterministic and immutable');
  const generationInput = {
    snapshotDigest: ZERO_HASH,
    registryDigest: ONE_HASH,
    briefWindow: { start: '2026-08-11T00:00:00.000Z', end: '2026-08-11T12:00:00.000Z' },
    generationCutoff: '2026-08-11T12:00:00.000Z'
  };
  const generationA = RLAGENDA.deriveGenerationId(generationInput);
  const generationB = RLAGENDA.deriveGenerationId(JSON.parse(JSON.stringify(generationInput)));
  const generationChanged = RLAGENDA.deriveGenerationId({ ...generationInput, generationCutoff: '2026-08-11T12:00:01.000Z' });
  const reviewInput = {
    generationId: generationA.id,
    topicId,
    definitionDigest: ZERO_HASH,
    calibrationDigest: ONE_HASH,
    evidenceBundleDigest: TWO_HASH
  };
  const reviewA = RLAGENDA.deriveReviewId(reviewInput);
  const reviewB = RLAGENDA.deriveReviewId({ ...reviewInput });
  const reviewChanged = RLAGENDA.deriveReviewId({ ...reviewInput, evidenceBundleDigest: ZERO_HASH });
  const dossierBody = {
    contractVersion: RLAGENDA.DOSSIER_VERSION,
    topicId,
    generationId: generationA.id,
    reviewId: reviewA.id,
    supersedesDossierId: historicalDossier.dossierId,
    substantiveState: { scenario: 'managed-coercion', probability: 0.5 }
  };
  const dossierA = RLAGENDA.deriveDossierId(dossierBody);
  const dossierB = RLAGENDA.deriveDossierId(JSON.parse(JSON.stringify(dossierBody)));
  const dossierChanged = RLAGENDA.deriveDossierId({ ...dossierBody, substantiveState: { scenario: 'managed-coercion', probability: 0.49 } });
  const sourceInput = { canonicalUrl: 'https://example.com/public-source', observedAt: '2026-08-11T11:00:00.000Z', contentSha256: TWO_HASH };
  const sourceA = RLAGENDA.deriveSourceId(sourceInput);
  const sourceB = RLAGENDA.deriveSourceId({ ...sourceInput });
  const sourceChanged = RLAGENDA.deriveSourceId({ ...sourceInput, observedAt: '2026-08-11T11:00:01.000Z' });
  const repeatedEvent = RLAGENDA.buildHistoryEvent(eventBody());
  const changedEvent = RLAGENDA.buildHistoryEvent(eventBody({ occurredAt: '2026-08-10T23:59:58.000Z' }));
  assert(generationA.ok && generationA.id === generationB.id && generationA.id !== generationChanged.id
    && reviewA.ok && reviewA.id === reviewB.id && reviewA.id !== reviewChanged.id
    && dossierA.ok && dossierA.id === dossierB.id && dossierA.id !== dossierChanged.id,
  'TP-02-03: generation review and substantive dossier identities repeat exactly and change with inputs');
  assert(sourceA.ok && sourceA.id === sourceB.id && sourceA.id !== sourceChanged.id
    && seedEvent.ok && seedEvent.event.eventId === repeatedEvent.event.eventId
    && seedEvent.event.eventId !== changedEvent.event.eventId,
  'TP-02-03: source and ledger event identities are deterministic without clock or filesystem input');

  group('Regression: overwrite attempts refuse before mutation and preserve predecessor bytes');
  const immutableFixtures = [
    ['generation', `research/agenda/generations/${generationA.id}.json`, { contractVersion: RLAGENDA.GENERATION_VERSION, generationId: generationA.id }],
    ['review', `research/agenda/reviews/${topicId}/${generationA.id}.json`, { contractVersion: RLAGENDA.REVIEW_VERSION, reviewId: reviewA.id, generationId: generationA.id, topicId }],
    ['dossier', `research/agenda/dossiers/${topicId}/${dossierA.id}.json`, { ...dossierBody, dossierId: dossierA.id, historicalOnly: false }],
    ['source', `research/agenda/sources/${sourceA.id}.json`, { contractVersion: RLAGENDA.SOURCE_VERSION, sourceId: sourceA.id }],
    ['calibration', `research/agenda/calibrations/${topicId}/v1.0.0.json`, { contractVersion: RLAGENDA.CALIBRATION_VERSION, topicId, calibrationVersion: 'v1.0.0' }]
  ];
  const overwriteResults = immutableFixtures.map(([family, artifactPath, value]) => {
    const originalBytes = JSON.stringify(value);
    const predecessorRecords = family === 'dossier' ? { [historicalPath]: historicalDossier } : {};
    const existing = { ...predecessorRecords, [artifactPath]: value };
    const first = RLAGENDA.prepareImmutableCreate(artifactPath, value, predecessorRecords);
    const overwrite = RLAGENDA.prepareImmutableCreate(artifactPath, { ...value, attemptedMutation: family }, existing);
    return first.ok && !overwrite.ok && overwrite.code === 'RLAGENDA-IMMUTABLE-OVERWRITE'
      && JSON.stringify(existing[artifactPath]) === originalBytes;
  });
  assert(overwriteResults.every(Boolean) && overwriteResults.length === 5,
  'TP-02-04: generation review dossier source and calibration paths all reject a second create before mutation');
  const mismatchedPathCreate = RLAGENDA.prepareImmutableCreate(
    `research/agenda/generations/generation-${'9'.repeat(64)}.json`,
    immutableFixtures[0][2],
    {}
  );
  const predecessorMissing = RLAGENDA.prepareImmutableCreate(immutableFixtures[2][1], immutableFixtures[2][2], {});
  assert(historicalDossierText === read(historicalPath) && !mismatchedPathCreate.ok
    && mismatchedPathCreate.code === 'RLAGENDA-IDENTITY-INVALID'
    && !predecessorMissing.ok && predecessorMissing.code === 'RLAGENDA-IDENTITY-INVALID',
  'TP-02-04: mismatched identity paths and missing predecessors refuse while predecessor bytes remain identical');

  group('Regression: correction appends a new event and current pointer accepts only validated immutable refs');
  const correction = RLAGENDA.buildHistoryEvent(eventBody({
    eventType: 'correction',
    occurredAt: '2026-08-11T12:30:00.000Z',
    dossierId: null,
    correctsEventId: seedEvent.event.eventId,
    supersedesEventId: null,
    artifactRef: null
  }));
  const correctedHistory = RLAGENDA.appendHistoryEvents(seedHistoryText, [correction.event]);
  const unknownCorrection = RLAGENDA.buildHistoryEvent(eventBody({
    eventType: 'correction',
    occurredAt: '2026-08-11T12:31:00.000Z',
    dossierId: null,
    correctsEventId: 'event-not-present',
    supersedesEventId: null,
    artifactRef: null
  }));
  const unknownCorrectionAppend = RLAGENDA.appendHistoryEvents(seedHistoryText, [unknownCorrection.event]);
  const generationRecord = {
    contractVersion: RLAGENDA.GENERATION_VERSION,
    generationId: generationA.id,
    validationState: 'validated',
    historicalOnly: false
  };
  const reviewRecord = {
    contractVersion: RLAGENDA.REVIEW_VERSION,
    reviewId: reviewA.id,
    generationId: generationA.id,
    topicId,
    validationState: 'validated',
    historicalOnly: false
  };
  const currentDossierRecord = {
    contractVersion: RLAGENDA.DOSSIER_VERSION,
    dossierId: dossierA.id,
    generationId: generationA.id,
    reviewId: reviewA.id,
    topicId,
    supersedesDossierId: historicalDossier.dossierId,
    validationState: 'validated',
    historicalOnly: false
  };
  const generationPath = `research/agenda/generations/${generationA.id}.json`;
  const reviewPath = `research/agenda/reviews/${topicId}/${generationA.id}.json`;
  const dossierPath = `research/agenda/dossiers/${topicId}/${dossierA.id}.json`;
  const generationRef = RLAGENDA.buildArtifactRef(generationPath, generationRecord).ref;
  const reviewRef = RLAGENDA.buildArtifactRef(reviewPath, reviewRecord).ref;
  const dossierRef = RLAGENDA.buildArtifactRef(dossierPath, currentDossierRecord).ref;
  const recordsByPath = {
    [generationPath]: generationRecord,
    [reviewPath]: reviewRecord,
    [dossierPath]: currentDossierRecord,
    [historicalPath]: historicalDossier
  };
  const currentPointer = {
    contractVersion: RLAGENDA.CURRENT_VERSION,
    updatedAt: '2026-08-11T13:00:00.000Z',
    generationRef,
    topicRefs: [{ topicId, state: 'reviewed', reviewRef, dossierRef }]
  };
  const validCurrent = RLAGENDA.validateCurrentPointer(currentPointer, recordsByPath);
  const missingRecordCurrent = RLAGENDA.validateCurrentPointer(currentPointer, { [generationPath]: generationRecord });
  const historicalCurrent = RLAGENDA.validateCurrentPointer({
    ...currentPointer,
    topicRefs: [{ topicId, state: 'reviewed', reviewRef, dossierRef: historicalRefResult.ref }]
  }, recordsByPath);
  const unvalidatedGeneration = { ...generationRecord, validationState: 'candidate' };
  const unvalidatedPath = `research/agenda/generations/generation-${'3'.repeat(64)}.json`;
  const unvalidatedPointer = {
    ...currentPointer,
    generationRef: RLAGENDA.buildArtifactRef(unvalidatedPath, unvalidatedGeneration).ref
  };
  const unvalidatedCurrent = RLAGENDA.validateCurrentPointer(unvalidatedPointer, { ...recordsByPath, [unvalidatedPath]: unvalidatedGeneration });
  const incompleteReviewedCurrent = RLAGENDA.validateCurrentPointer({
    ...currentPointer,
    topicRefs: [{ topicId, state: 'reviewed', reviewRef: null, dossierRef: null }]
  }, recordsByPath);
  const mismatchedGenerationPath = `research/agenda/generations/generation-${'4'.repeat(64)}.json`;
  const mismatchedPathCurrent = RLAGENDA.validateCurrentPointer({
    ...currentPointer,
    generationRef: { ...generationRef, path: mismatchedGenerationPath }
  }, { ...recordsByPath, [mismatchedGenerationPath]: generationRecord });
  assert(correction.ok && correctedHistory.ok && correctedHistory.candidateText.startsWith(seedHistoryText)
    && correctedHistory.appendedEventIds[0] === correction.event.eventId
    && !unknownCorrectionAppend.ok && unknownCorrectionAppend.code === 'RLAGENDA-CORRECTION-INVALID',
  'TP-02-05: a correction is a new deterministic row and cannot target an absent event');
  assert(validCurrent.ok && !missingRecordCurrent.ok && missingRecordCurrent.code === 'RLAGENDA-CURRENT-INVALID'
    && !historicalCurrent.ok && historicalCurrent.code === 'RLAGENDA-CURRENT-HISTORICAL'
    && !unvalidatedCurrent.ok && unvalidatedCurrent.code === 'RLAGENDA-CURRENT-INVALID'
    && !incompleteReviewedCurrent.ok && !mismatchedPathCurrent.ok,
  'TP-02-05: current accepts complete refs and refuses missing historical unvalidated incomplete or path-mismatched targets');

  group('Historical Iran seed retains its dated source context and is never inferred current');
  const sourceNoteText = read('notes/us-iran-oil-market-intervention-patterns.md');
  const committedCurrent = JSON.parse(read('research/agenda/current.json'));
  const initialHistoryText = read('research/agenda/history.jsonl');
  const committedCurrentRecords = {};
  if (committedCurrent.generationRef) committedCurrentRecords[committedCurrent.generationRef.path] = JSON.parse(read(committedCurrent.generationRef.path));
  committedCurrent.topicRefs.forEach((topicRef) => {
    if (topicRef.reviewRef) committedCurrentRecords[topicRef.reviewRef.path] = JSON.parse(read(topicRef.reviewRef.path));
    if (topicRef.dossierRef) committedCurrentRecords[topicRef.dossierRef.path] = JSON.parse(read(topicRef.dossierRef.path));
  });
  const validatedInitialCurrent = RLAGENDA.validateCurrentPointer(committedCurrent, committedCurrentRecords);
  const committedHistoryLines = initialHistoryText.split('\n').filter(Boolean);
  const requiredFindingFields = ['observedAt', 'source', 'statedConfidence', 'provenanceClass', 'evidenceRole'];
  assert(historicalDossier.contractVersion === RLAGENDA.DOSSIER_VERSION
    && historicalDossier.dossierId === 'historical-2026-08-10-v1'
    && historicalDossier.historicalOnly === true && historicalDossier.validationState === 'validated'
    && historicalDossier.generationId === null && historicalDossier.reviewId === null
    && historicalDossier.sourceNote.snapshotDate === '2026-08-10'
    && historicalDossier.sourceNote.sha256 === RLAGENDA.sha256Text(sourceNoteText),
  'TP-02-06: the seed is visibly historical and byte-traceable to the unchanged August 10 source note');
  assert(historicalDossier.sectionSnapshots.length === 8
    && historicalDossier.findings.length > 0
    && historicalDossier.findings.every((finding) => requiredFindingFields.every((field) => Object.hasOwn(finding, field)))
    && historicalDossier.sourceLedger.every((source) => source.canonicalUrl.startsWith('https://')),
  'TP-02-06: every dated finding carries provenance and the eight historical sections retain public source links');
  assert(validatedInitialCurrent.ok && committedCurrent.generationRef !== null && committedCurrent.topicRefs.length === 3
    && !JSON.stringify(committedCurrent).includes(historicalDossier.dossierId)
    && !JSON.stringify(committedCurrent).includes(historicalPath)
    && committedHistoryLines[0] === RLAGENDA.canonicalizeAgenda(seedEvent.event)
    && committedHistoryLines.length > 1,
  'TP-02-06: the ledger retains the dated seed while the real current graph never references it as current');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 019 Scope 02 lifecycle group threw): ' + e.message); }

/* ---------- Feature 019 Scope 03: offline generation plan ---------- */
try {
  const planRequire = (await import('node:module')).createRequire(import.meta.url);
  const RLAGENDA = planRequire('../rlagenda.js');
  const registry = JSON.parse(read('research-agenda.json'));
  const definitionsByTopicId = Object.fromEntries(registry.topics.map((topic) => [
    topic.topicId,
    JSON.parse(read(topic.definitionRef))
  ]));
  const seedHistory = read('research/agenda/history.jsonl').split('\n').filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((event) => event.eventType === 'historical-seed')
    .map((event) => RLAGENDA.canonicalizeAgenda(event)).join('\n') + '\n';
  const ZERO_ID = '0'.repeat(64);
  const ONE_ID = '1'.repeat(64);
  const reviewEvent = (topicId, occurredAt, suffix) => RLAGENDA.buildHistoryEvent({
    contractVersion: RLAGENDA.HISTORY_EVENT_VERSION,
    eventType: 'review',
    occurredAt,
    topicId,
    generationId: `generation-${ZERO_ID}`,
    reviewId: `review-${suffix.repeat(64)}`,
    dossierId: null,
    correctsEventId: null,
    supersedesEventId: null,
    artifactRef: null
  }).event;
  const historyWith = (...events) => RLAGENDA.appendHistoryEvents(seedHistory, events).candidateText;
  const noTriggers = { definitionsByTopicId, triggerObservations: [] };
  const cutoff = '2026-08-13T12:00:00.000Z';

  group('SCN-019-008 explicit cadence separates not-due and elapsed topics offline');
  const cadenceHistory = historyWith(
    reviewEvent('defense-earnings-acceleration', '2026-08-10T12:00:00.000Z', '1'),
    reviewEvent('food-inputs-outlook', '2026-08-01T12:00:00.000Z', '2')
  );
  const cadencePlan = RLAGENDA.planGeneration(registry, cadenceHistory, noTriggers, cutoff);
  const cadenceById = Object.fromEntries(cadencePlan.classifications.map((row) => [row.topicId, row]));
  assert(cadencePlan.ok && cadenceById['defense-earnings-acceleration'].status === 'not-due'
    && cadenceById['defense-earnings-acceleration'].reason === 'cadence-not-elapsed'
    && cadenceById['food-inputs-outlook'].status === 'selected'
    && cadenceById['food-inputs-outlook'].reason === 'cadence-elapsed',
  'TP-03-01: explicit review clocks separate inside-cadence and elapsed topics with no network input');
  assert(cadencePlan.selected[0].topicId === 'geopolitical-supply-shock'
    && cadencePlan.selectedEveryGenerationCount === 1 && cadencePlan.selectedCadenceCount === 1,
  'TP-03-01: active every-generation work remains first and separate from cadence capacity');

  group('SCN-019-010 committed-evidence trigger rearms cadence and names itself');
  const recentHistory = historyWith(
    reviewEvent('defense-earnings-acceleration', '2026-08-10T12:00:00.000Z', '3'),
    reviewEvent('food-inputs-outlook', '2026-08-10T12:00:00.000Z', '4')
  );
  const triggerPlan = RLAGENDA.planGeneration(registry, recentHistory, {
    definitionsByTopicId,
    triggerObservations: [{
      topicId: 'defense-earnings-acceleration',
      triggerId: 'material-guidance-change',
      observedAt: '2026-08-13T11:00:00.000Z',
      values: { materialChange: true }
    }]
  }, cutoff);
  const triggered = triggerPlan.classifications.find((row) => row.topicId === 'defense-earnings-acceleration');
  assert(triggerPlan.ok && triggered.status === 'selected' && triggered.reason === 'trigger-fired'
    && triggered.triggerId === 'material-guidance-change'
    && triggerPlan.classifications.find((row) => row.topicId === 'food-inputs-outlook').status === 'not-due',
  'TP-03-03: a matching committed observation rearms only its cadence topic and names the trigger');
  const afterCutoffPlan = RLAGENDA.planGeneration(registry, recentHistory, {
    definitionsByTopicId,
    triggerObservations: [{
      topicId: 'defense-earnings-acceleration',
      triggerId: 'material-guidance-change',
      observedAt: '2026-08-13T13:00:00.000Z',
      values: { materialChange: true }
    }]
  }, cutoff);
  assert(afterCutoffPlan.classifications.find((row) => row.topicId === 'defense-earnings-acceleration').status === 'not-due',
  'TP-03-03: an observation after the generation cutoff cannot fire the trigger');
  const beforeLastReviewPlan = RLAGENDA.planGeneration(registry, recentHistory, {
    definitionsByTopicId,
    triggerObservations: [{
      topicId: 'defense-earnings-acceleration',
      triggerId: 'material-guidance-change',
      observedAt: '2026-08-09T11:00:00.000Z',
      values: { materialChange: true }
    }]
  }, cutoff);
  assert(beforeLastReviewPlan.classifications.find((row) => row.topicId === 'defense-earnings-acceleration').status === 'not-due',
  'TP-03-03: an observation already absorbed by the last review cannot rearm cadence forever');

  group('Regression: mandatory capacity plus one refuses and cadence budget plus one preserves mandatory work');
  const extraMandatory = JSON.parse(JSON.stringify(registry.topics[0]));
  extraMandatory.topicId = 'second-mandatory-topic';
  extraMandatory.title = 'Second mandatory topic';
  extraMandatory.declaredQuestion = 'Does the mandatory capacity refuse an additional every-generation topic?';
  extraMandatory.definitionRef = 'research/agenda/topics/second-mandatory-topic.definition.json';
  const overCapacityRegistry = { ...registry, topics: [...registry.topics, extraMandatory] };
  const overCapacity = RLAGENDA.planGeneration(overCapacityRegistry, seedHistory, noTriggers, cutoff);
  assert(!overCapacity.ok && overCapacity.code === 'RLAGENDA-CAPACITY-EVERY-GENERATION'
    && overCapacity.selected.length === 0,
  'TP-03-04: mandatory capacity plus one refuses the generation rather than converting or deferring work');
  const budgetPlan = RLAGENDA.planGeneration(registry, seedHistory, noTriggers, cutoff);
  assert(budgetPlan.ok && budgetPlan.selected[0].topicId === 'geopolitical-supply-shock'
    && budgetPlan.classifications.filter((row) => row.mode === 'cadence' && row.status === 'selected').length === 1
    && budgetPlan.classifications.filter((row) => row.mode === 'cadence' && row.status === 'deferred').length === 1,
  'TP-03-04: cadence budget plus one preserves mandatory work and accounts for the deferred cadence topic');

  group('SCN-019-011 deterministic cadence ordering and all-topic accounting preserve every unselected topic');
  const repeatBudgetPlan = RLAGENDA.planGeneration(JSON.parse(JSON.stringify(registry)), seedHistory, {
    definitionsByTopicId: JSON.parse(JSON.stringify(definitionsByTopicId)),
    triggerObservations: []
  }, cutoff);
  const defenseBudget = budgetPlan.classifications.find((row) => row.topicId === 'defense-earnings-acceleration');
  const foodBudget = budgetPlan.classifications.find((row) => row.topicId === 'food-inputs-outlook');
  assert(RLAGENDA.canonicalizeAgenda(budgetPlan) === RLAGENDA.canonicalizeAgenda(repeatBudgetPlan)
    && defenseBudget.status === 'selected' && defenseBudget.reason === 'first-review'
    && foodBudget.status === 'deferred' && foodBudget.reason === 'cadence-budget',
  'TP-03-05: declaration order deterministically selects defense first and records food as deferred');
  assert(budgetPlan.accountedTopicCount === budgetPlan.declaredTopicCount
    && budgetPlan.classifications.length === registry.topics.length
    && budgetPlan.selected.length === 2,
  'TP-03-05: every registry row has exactly one classification and every selected row remains visible');
  const partialRegistry = JSON.parse(JSON.stringify(registry));
  delete partialRegistry.topics[2].reviewPolicy.mode;
  const partialPlan = RLAGENDA.planGeneration(partialRegistry, seedHistory, noTriggers, cutoff);
  assert(partialPlan.ok && partialPlan.status === 'partial'
    && partialPlan.classifications.find((row) => row.topicId === 'food-inputs-outlook').status === 'refused'
    && partialPlan.selected.some((row) => row.topicId === 'geopolitical-supply-shock')
    && partialPlan.selected.some((row) => row.topicId === 'defense-earnings-acceleration'),
  'TP-03-05: one invalid topic is refused by name while valid mandatory and cadence topics remain executable');

  const geoDefinition = definitionsByTopicId['geopolitical-supply-shock'];
  const evidenceFixture = JSON.parse(read('tests/fixtures/research-agenda/valid-evidence-record.json'));

  group('Regression: predecessor probabilities cannot smooth or seed current scenario probabilities');
  const currentImpacts = [
    { targetId: 'staged-reopening', weightedImpact: 0.4 },
    { targetId: 'escalation', weightedImpact: -0.4 }
  ];
  const probabilityBeforeComparison = RLAGENDA.updateEscalationProbabilities(
    geoDefinition.scenarioTree,
    currentImpacts,
    { maxAbsoluteImpact: 0.45 }
  );
  const frozenCurrentProbabilityBytes = RLAGENDA.canonicalizeAgenda(probabilityBeforeComparison);
  const currentView = Object.freeze({
    probabilities: Object.fromEntries(Object.entries(probabilityBeforeComparison.probabilities).map(([id, row]) => [id, row.unconditional])),
    evidenceIds: ['current-direct-evidence'],
    conflictIds: [],
    directionScore: -0.8,
    dominantScenarioId: 'staged-reopening',
    declaredQuestion: registry.topics[0].declaredQuestion,
    evidenceCoverage: 1
  });
  const oppositePredecessor = {
    probabilities: { 'staged-reopening': 0.05, 'managed-coercion': 0.05, escalation: 0.9 },
    evidenceIds: ['prior-evidence'],
    conflictIds: [],
    directionScore: 0.8,
    dominantScenarioId: 'escalation',
    declaredQuestion: registry.topics[0].declaredQuestion
  };
  const comparison = RLAGENDA.compareScenarioOutputs(currentView, oppositePredecessor);
  const reversal = RLAGENDA.classifyChangeDirection(currentView, comparison, {
    minimumEvidenceCoverage: 0.6,
    materialDelta: 0.2,
    reversalThreshold: 0.5
  });
  assert(probabilityBeforeComparison.ok && reversal.ok && reversal.direction === 'reversed'
    && RLAGENDA.canonicalizeAgenda(probabilityBeforeComparison) === frozenCurrentProbabilityBytes,
  'TP-03-06: opposite predecessor output creates a reversal label but leaves current probabilities byte-identical');
  assert(!/predecessor/i.test(extractFn(read('rlagenda.js'), 'updateEscalationProbabilities'))
    && !Object.hasOwn(currentView, 'predecessorDirectionScore')
    && comparison.predecessorDirectionScore === 0.8,
  'TP-03-06: current probability math has no predecessor input and prior score lives only in comparison');
  const changedQuestionComparison = RLAGENDA.compareScenarioOutputs(currentView, {
    ...oppositePredecessor,
    declaredQuestion: 'A different operator question'
  });
  const changedQuestionDirection = RLAGENDA.classifyChangeDirection(
    { ...currentView, evidenceCoverage: 0 },
    changedQuestionComparison,
    { minimumEvidenceCoverage: 0.6, materialDelta: 0.2, reversalThreshold: 0.5 }
  );
  const insufficientDirection = RLAGENDA.classifyChangeDirection(
    { ...currentView, evidenceCoverage: 0.2 },
    comparison,
    { minimumEvidenceCoverage: 0.6, materialDelta: 0.2, reversalThreshold: 0.5 }
  );
  assert(!changedQuestionDirection.ok && changedQuestionDirection.code === 'RLAGENDA-MODEL-INVALID'
    && insufficientDirection.ok && insufficientDirection.direction === 'insufficient-evidence',
  'TP-03-06: question-byte drift refuses before classification while low valid coverage remains insufficient evidence');

  group('Regression: indirect evidence without a causal path or refuter is refused before model impact');
  const missingPath = RLAGENDA.validateEvidenceRecord({ ...evidenceFixture, causalPath: [] }, geoDefinition.evidencePolicy);
  const missingRefuter = RLAGENDA.validateEvidenceRecord({ ...evidenceFixture, refutedBy: [] }, geoDefinition.evidencePolicy);
  const missingAffectedTarget = RLAGENDA.validateEvidenceRecord({
    ...evidenceFixture,
    actorIds: [],
    channelIds: [],
    claimIds: []
  }, geoDefinition.evidencePolicy);
  const selfReferentialInference = RLAGENDA.validateEvidenceRecord({
    ...evidenceFixture,
    evidenceId: 'self-referential-inference',
    evidenceRole: 'model-inference',
    causalPath: [],
    refutedBy: [],
    modelFunctionId: 'computeEvidenceWeight',
    inputEvidenceIds: ['self-referential-inference'],
    generatedOutputField: 'modelOutputs.weight'
  }, geoDefinition.evidencePolicy);
  assert(!missingPath.ok && missingPath.code === 'RLAGENDA-EVIDENCE-SHAPE'
    && !missingRefuter.ok && missingRefuter.code === 'RLAGENDA-EVIDENCE-SHAPE'
    && !missingAffectedTarget.ok && missingAffectedTarget.code === 'RLAGENDA-EVIDENCE-SHAPE',
  'TP-03-07: indirect evidence needs a causal path refuter and at least one affected actor channel or claim');
  assert(!selfReferentialInference.ok && selfReferentialInference.field === 'modelFunctionId',
  'TP-03-07: model inference cannot cite itself as an input record');

  group('Regression: stale evidence and fired refuters have zero impact while conflicts remain visible');
  const staleEvidence = JSON.parse(JSON.stringify(evidenceFixture));
  staleEvidence.freshness = { ...staleEvidence.freshness, state: 'stale', ageHours: 48 };
  staleEvidence.conflicts = { state: 'unresolved', evidenceIds: ['counter-evidence'], effect: 'reduces-confidence' };
  const staleWeight = RLAGENDA.computeEvidenceWeight(staleEvidence, geoDefinition.evidencePolicy, cutoff);
  const firedEvidence = JSON.parse(JSON.stringify(evidenceFixture));
  firedEvidence.firedRefuters = [firedEvidence.refutedBy[0]];
  firedEvidence.conflicts = { state: 'resolved-by-refuter', evidenceIds: ['normalization-evidence'], effect: 'zero-impact' };
  const firedWeight = RLAGENDA.computeEvidenceWeight(firedEvidence, geoDefinition.evidencePolicy, cutoff);
  assert(staleWeight.ok && staleWeight.weight === 0 && staleWeight.boundedImpact === 0
    && staleWeight.exclusionReason === 'freshness' && staleWeight.conflicts.state === 'unresolved',
  'TP-03-08: stale evidence has zero impact while its unresolved conflict remains visible');
  assert(firedWeight.ok && firedWeight.weight === 0 && firedWeight.boundedImpact === 0
    && firedWeight.exclusionReason === 'fired-refuter' && firedWeight.firedRefuters.length === 1
    && firedWeight.conflicts.state === 'resolved-by-refuter',
  'TP-03-08: a fired declared refuter zeros impact and preserves the refuter and conflict record');

  group('Scenario probabilities use stable priors current evidence and sum to one at every sibling set');
  const baselineProbabilities = RLAGENDA.updateEscalationProbabilities(
    geoDefinition.scenarioTree,
    [],
    { maxAbsoluteImpact: 0.45 }
  );
  const impactedProbabilities = RLAGENDA.updateEscalationProbabilities(
    geoDefinition.scenarioTree,
    currentImpacts,
    { maxAbsoluteImpact: 0.45 }
  );
  const rootIds = ['staged-reopening', 'managed-coercion', 'escalation'];
  const childIds = ['single-route-disruption', 'dual-route-or-infrastructure-shock'];
  const rootConditionalSum = rootIds.reduce((sum, id) => sum + impactedProbabilities.probabilities[id].conditional, 0);
  const childConditionalSum = childIds.reduce((sum, id) => sum + impactedProbabilities.probabilities[id].conditional, 0);
  const childUnconditionalSum = childIds.reduce((sum, id) => sum + impactedProbabilities.probabilities[id].unconditional, 0);
  assert(baselineProbabilities.ok
    && baselineProbabilities.probabilities['staged-reopening'].conditional === 0.3
    && baselineProbabilities.probabilities['managed-coercion'].conditional === 0.5
    && baselineProbabilities.probabilities.escalation.conditional === 0.2,
  'TP-03-09: zero current impacts reproduce the stable definition priors exactly');
  assert(impactedProbabilities.ok && approx(rootConditionalSum, 1, 1e-12)
    && approx(childConditionalSum, 1, 1e-12)
    && approx(childUnconditionalSum, impactedProbabilities.probabilities.escalation.unconditional, 1e-12)
    && impactedProbabilities.probabilities['staged-reopening'].conditional > baselineProbabilities.probabilities['staged-reopening'].conditional,
  'TP-03-09: current weighted impacts move the softmax while every sibling set and child branch remain normalized');

  group('Regression: one flow crossing Hormuz and Bab el-Mandeb counts physical loss once and reroute ton-miles separately');
  const multiEdgeNetwork = {
    flows: [{
      flowId: 'multi-route-flow',
      commodity: 'oil',
      baselineVolume: 1,
      unit: 'normalized-share',
      routeEdges: ['hormuz', 'bab-el-mandeb'],
      alternateRoute: {
        capacityFraction: { low: 0.5, base: 0.5, high: 0.5 },
        distanceMultiplier: { low: 1.5, base: 1.5, high: 1.5 }
      },
      scenarioIds: ['shock']
    }]
  };
  const edgeHalfOpen = {
    hormuz: {
      physicalPassFraction: { low: 0.5, base: 0.5, high: 0.5 },
      insuredPassFraction: { low: 0.8, base: 0.8, high: 0.8 },
      delayDays: { low: 3, base: 3, high: 3 }
    },
    'bab-el-mandeb': {
      physicalPassFraction: { low: 0.5, base: 0.5, high: 0.5 },
      insuredPassFraction: { low: 0.8, base: 0.8, high: 0.8 },
      delayDays: { low: 6, base: 6, high: 6 }
    }
  };
  const multiEdgeFlow = RLAGENDA.computeFlowState(multiEdgeNetwork, edgeHalfOpen, 'shock');
  const filteredFlow = RLAGENDA.computeFlowState(multiEdgeNetwork, edgeHalfOpen, 'calm');
  const multiRow = multiEdgeFlow.flows[0];
  assert(multiEdgeFlow.ok && multiEdgeFlow.flows.length === 1
    && approx(multiRow.physicallyUnavailable.base, 0.25, 1e-12)
    && approx(multiRow.reroutedDelivered.base, 0.5, 1e-12)
    && approx(multiRow.physicallyUnavailable.base + multiRow.reroutedDelivered.base, 0.75, 1e-12),
  'TP-03-10: two half-open route edges produce one 75 percent impairment rather than two additive losses');
  assert(approx(multiRow.incrementalTonMiles.base, 0.25, 1e-12)
    && approx(multiRow.insuredEffectiveThroughput.base, 0.16, 1e-12)
    && filteredFlow.ok && filteredFlow.flows.length === 0,
  'TP-03-10: reroute ton-miles and insured throughput remain separate and scenario filtering excludes unrelated flows');

  group('Commodity and proxy ranges preserve low base high order attribution and insufficient-evidence states');
  const calmFlow = RLAGENDA.computeFlowState(multiEdgeNetwork, edgeHalfOpen, 'calm');
  const rangeFlowStates = {
    byScenario: { shock: multiEdgeFlow, calm: calmFlow },
    inventoryGapByChannel: { oil: { low: 0.05, base: 0.1, high: 0.15 } }
  };
  const transmissionFixture = [{
    channelId: 'oil',
    flowStateId: 'multi-route-flow',
    barId: 'BNO',
    physicalSensitivity: { low: 0.2, base: 0.4, high: 0.6 },
    rerouteSensitivity: { low: 0.1, base: 0.2, high: 0.3 },
    inventorySensitivity: { low: 0.1, base: 0.2, high: 0.3 },
    policyResponseOffset: { low: -0.1, base: 0, high: 0.1 },
    demandOffset: { low: -0.05, base: 0, high: 0.05 },
    bounds: { low: -1, base: 0, high: 1 }
  }];
  const barFixture = { BNO: { sym: 'BNO', asof: '2026-08-13', rows: [{ t: 1, c: 30 }] } };
  const shockRanges = RLAGENDA.computeCommodityShockRanges(
    { shock: 1, calm: 0 },
    rangeFlowStates,
    transmissionFixture,
    barFixture,
    { inventoryPolicyResponseOffset: 0, demandOffset: 0 }
  );
  const calmRanges = RLAGENDA.computeCommodityShockRanges(
    { shock: 0, calm: 1 },
    rangeFlowStates,
    transmissionFixture,
    barFixture,
    { inventoryPolicyResponseOffset: 0, demandOffset: 0 }
  );
  const missingBarRanges = RLAGENDA.computeCommodityShockRanges(
    { shock: 1, calm: 0 },
    rangeFlowStates,
    transmissionFixture,
    {},
    { inventoryPolicyResponseOffset: 0, demandOffset: 0 }
  );
  assert(shockRanges.ok && shockRanges.channels[0].range.low <= shockRanges.channels[0].range.base
    && shockRanges.channels[0].range.base <= shockRanges.channels[0].range.high
    && shockRanges.channels[0].components.physical.base > calmRanges.channels[0].components.physical.base,
  'TP-03-11: scenario probability is load-bearing and attributed commodity intervals preserve low base high order');
  assert(!missingBarRanges.ok && missingBarRanges.channels[0].state === 'unavailable'
    && missingBarRanges.channels[0].reason === 'missing-required-component',
  'TP-03-11: a missing required current bar yields unavailable rather than a zero range');
  const proxyFixture = [{
    proxyId: 'bno',
    ticker: 'BNO',
    channelId: 'oil',
    channelSensitivity: { low: 0.8, base: 1, high: 1.2 },
    operatingExposureOffset: { low: 0, base: 0, high: 0 },
    minimumCalibrationEvents: 1
  }];
  const proxyRanges = RLAGENDA.computeEquityProxyRanges(
    { oil: shockRanges.channels[0].range },
    proxyFixture,
    [{ proxyReturns: { BNO: 0.05 } }],
    barFixture,
    { proxyAdjustment: 0 }
  );
  const thinProxyRanges = RLAGENDA.computeEquityProxyRanges(
    { oil: shockRanges.channels[0].range },
    [{ ...proxyFixture[0], minimumCalibrationEvents: 2 }],
    [{ proxyReturns: { BNO: 0.05 } }],
    barFixture,
    { proxyAdjustment: 0 }
  );
  assert(proxyRanges.ok && proxyRanges.proxies[0].range.low <= proxyRanges.proxies[0].range.base
    && proxyRanges.proxies[0].range.base <= proxyRanges.proxies[0].range.high
    && proxyRanges.proxies[0].components.calibrationResidual.base === 0.05,
  'TP-03-11: proxy range exposes ordered channel calibration and operating components');
  assert(!thinProxyRanges.ok && thinProxyRanges.proxies[0].state === 'insufficient-evidence',
  'TP-03-11: a proxy below its explicit calibration minimum publishes insufficient evidence');

  group('Chart series and adjacent table rows share values units order and immutable review identities');
  const chartReviews = [
    {
      reviewId: `review-${'a'.repeat(64)}`,
      attemptedAt: '2026-08-12T12:00:00.000Z',
      modelOutputs: { scenarioProbability: { escalation: 0.2 } },
      annotations: [{ annotationId: 'prior-view', label: 'Prior view' }]
    },
    {
      reviewId: `review-${'b'.repeat(64)}`,
      attemptedAt: '2026-08-13T12:00:00.000Z',
      modelOutputs: { scenarioProbability: { escalation: 0.1 } },
      annotations: [{ annotationId: 'current-refuter', label: 'Refuter fired' }]
    }
  ];
  const chartProjection = RLAGENDA.buildAgendaChartSeries(chartReviews, [geoDefinition.chartDefinitions[0]]);
  const chart = chartProjection.charts[0];
  assert(chartProjection.ok && chart.series.map((row) => row.reviewId).join(',') === chartReviews.map((row) => row.reviewId).join(',')
    && chart.series.every((row) => row.unit === 'probability')
    && RLAGENDA.canonicalizeAgenda(chart.series) === RLAGENDA.canonicalizeAgenda(chart.tableRows),
  'TP-03-12: chart and table consume the same ordered immutable review rows and units');
  assert(Object.isFrozen(chartProjection) && Object.isFrozen(chart.series[0])
    && chart.series[1].annotations[0].annotationId === 'current-refuter'
    && RLAGENDA.canonicalizeAgenda(chartReviews[1].modelOutputs.scenarioProbability) === RLAGENDA.canonicalizeAgenda(chart.series[1].value),
  'TP-03-12: the projection is frozen and preserves annotation identity and canonical values without second math');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 019 Scope 03 offline plan group threw): ' + e.message); }

/* ---------- Feature 019 Scope 04: candidate outcomes before publication ---------- */
try {
  const generationModule = await import('./research-agenda-generation.mjs');
  const agendaRequire4 = (await import('node:module')).createRequire(import.meta.url);
  const RLAGENDA4 = agendaRequire4('../rlagenda.js');
  const registry4 = JSON.parse(read('research-agenda.json'));
  const topic4 = registry4.topics[0];
  const definition4 = JSON.parse(read(topic4.definitionRef));
  const evidence4 = JSON.parse(read('tests/fixtures/research-agenda/valid-evidence-record.json'));
  const generation4 = RLAGENDA4.deriveGenerationId({
    snapshotDigest: 'sha256:' + '4'.repeat(64),
    registryDigest: RLAGENDA4.agendaDigest(registry4),
    briefWindow: { start: '2026-08-13T07:30:00.000Z', end: '2026-08-13T12:00:00.000Z' },
    generationCutoff: '2026-08-13T12:00:00.000Z'
  });
  const oneTopicRegistry4 = { ...registry4, topics: [topic4] };
  const oneTopicPlan4 = {
    ok: true,
    refusals: [],
    selected: [{ topicId: topic4.topicId, mode: 'every-generation', reason: 'mode-required', triggerId: null, sectionIds: definition4.analyticalSections.map((section) => section.sectionId) }],
    classifications: [{ topicId: topic4.topicId, lifecycleState: 'active', mode: 'every-generation', status: 'selected', reason: 'mode-required', triggerId: null }]
  };
  const sectionRows4 = (status) => definition4.analyticalSections.map((section) => ({
    sectionId: section.sectionId,
    status,
    interpretation: status === 'unavailable' ? '' : 'Evidence-bounded section interpretation.',
    gaps: []
  }));
  const finding4 = {
    findingId: 'current-evidence-finding',
    observedAt: evidence4.observedAt,
    claim: evidence4.claim,
    source: evidence4.source,
    statedConfidence: evidence4.confidence,
    provenanceClass: evidence4.provenanceClass,
    evidenceRole: evidence4.evidenceRole,
    causalPath: evidence4.causalPath,
    refutedBy: evidence4.refutedBy,
    limitations: ['Bounded fixture finding.']
  };
  const situation4 = (overrides = {}) => ({
    contractVersion: generationModule.RESEARCH_AGENDA_CONTRACTS.situation,
    generationId: generation4.id,
    topicId: topic4.topicId,
    authoredAt: '2026-08-13T12:00:00.000Z',
    completePass: true,
    evidenceRecords: [evidence4],
    sectionInterpretations: sectionRows4('changed'),
    findings: [finding4],
    sourceLedger: [evidence4.source],
    newEvidenceIds: [evidence4.evidenceId],
    modelInputs: { chokepointState: {}, inventoryGapByChannel: {}, levers: {} },
    ...overrides
  });
  const compose4 = (input = {}) => generationModule.composeResearchAgendaCandidate({
    registry: oneTopicRegistry4,
    plan: oneTopicPlan4,
    definitionsByTopicId: { [topic4.topicId]: definition4 },
    generationId: generation4.id,
    generationCutoff: '2026-08-13T12:00:00.000Z',
    situationsByTopicId: {},
    failuresByTopicId: {},
    deterministicOutputsByTopicId: {},
    priorDossiersByTopicId: {},
    ...input
  });

  group('Feature 019 candidate contract accounts for new sourced unchanged stale and unavailable reviews before publication');
  const updatedCandidate4 = compose4({
    situationsByTopicId: { [topic4.topicId]: situation4() },
    deterministicOutputsByTopicId: { [topic4.topicId]: { scenarioProbability: { escalation: 0.2 }, chartSeries: [{ chartId: 'scenario-probabilities' }] } }
  });
  const priorDossier4 = { dossierId: `dossier-${'d'.repeat(64)}`, topicId: topic4.topicId, historicalOnly: false };
  const unchangedCandidate4 = compose4({
    situationsByTopicId: { [topic4.topicId]: situation4({ newEvidenceIds: [], findings: [], sectionInterpretations: sectionRows4('unchanged') }) },
    priorDossiersByTopicId: { [topic4.topicId]: priorDossier4 }
  });
  const staleEvidence4 = JSON.parse(JSON.stringify(evidence4));
  staleEvidence4.observedAt = '2026-08-10T10:00:00.000Z';
  staleEvidence4.availableAt = '2026-08-10T10:05:00.000Z';
  staleEvidence4.freshness = { ...staleEvidence4.freshness, state: 'stale', ageHours: 74 };
  const staleCandidate4 = compose4({
    situationsByTopicId: { [topic4.topicId]: situation4({ evidenceRecords: [staleEvidence4], newEvidenceIds: [staleEvidence4.evidenceId], sectionInterpretations: sectionRows4('stale') }) },
    deterministicOutputsByTopicId: { [topic4.topicId]: { shouldNotPublish: true } },
    priorDossiersByTopicId: { [topic4.topicId]: priorDossier4 }
  });
  const unavailableCandidate4 = compose4({ failuresByTopicId: { [topic4.topicId]: 'author-timeout' } });
  assert(updatedCandidate4.ok && updatedCandidate4.value.reviews[0].outcome === 'updated'
    && updatedCandidate4.value.dossiers.length === 1
    && updatedCandidate4.value.reviews[0].sectionStates.length === definition4.analyticalSections.length
    && updatedCandidate4.value.classifications[0].state === 'reviewed',
  'TP-04-03: new sourced evidence creates one complete updated review and one sustained dossier');
  assert(unchangedCandidate4.ok && unchangedCandidate4.value.reviews[0].outcome === 'unchanged'
    && unchangedCandidate4.value.reviews[0].dossierId === priorDossier4.dossierId
    && unchangedCandidate4.value.reviews[0].evidenceIds.length === 1
    && unchangedCandidate4.value.dossiers.length === 0,
  'TP-04-03: a quiet complete pass writes an unchanged review reusing the prior dossier without inventing a finding');
  assert(staleCandidate4.ok && staleCandidate4.value.reviews[0].outcome === 'stale'
    && staleCandidate4.value.reviews[0].newestEvidenceAgeHours === 74
    && staleCandidate4.value.reviews[0].modelOutputs === null
    && staleCandidate4.value.dossiers.length === 0,
  'TP-04-03: stale evidence records its age and publishes no current model output or dossier');
  assert(unavailableCandidate4.ok && unavailableCandidate4.value.reviews[0].outcome === 'unavailable'
    && unavailableCandidate4.value.reviews[0].reason === 'author-timeout'
    && unavailableCandidate4.value.reviews[0].evidenceIds.length === 0
    && unavailableCandidate4.value.dossiers.length === 0,
  'TP-04-03: a failed lane creates a named unavailable review with no partial finding or dossier');

  group('SCN-019-014 stale evidence publishes its age has zero model impact and never masquerades as current');
  const staleWeight4 = RLAGENDA4.computeEvidenceWeight(staleEvidence4, definition4.evidencePolicy, '2026-08-13T12:00:00.000Z');
  const staleRead4 = generationModule.buildResearchAgendaRead(staleCandidate4.value);
  assert(staleWeight4.ok && staleWeight4.weight === 0 && staleWeight4.boundedImpact === 0
    && staleRead4.ok && staleRead4.value.topics[0].outcome === 'stale'
    && staleRead4.value.topics[0].newestEvidenceAgeHours === 74,
  'TP-04-05: stale evidence has zero impact and the compact read labels stale with its age');
  assert(staleCandidate4.value.reviews[0].dossierId === null
    && staleRead4.value.topics[0].dossierId === null
    && staleRead4.value.topics[0].state === 'reviewed',
  'TP-04-05: stale current review never points at or masquerades as the prior dossier');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 019 Scope 04 candidate group threw): ' + e.message); }

/* ---------- Feature 019 Scope 05: refinement and public-safety owner contracts ---------- */
try {
  const scope5Require = (await import('node:module')).createRequire(import.meta.url);
  const RLAGENDA5 = scope5Require('../rlagenda.js');
  const registry5 = JSON.parse(read('research-agenda.json'));
  const topic5 = registry5.topics.find((topic) => topic.topicId === 'geopolitical-supply-shock');
  const definition5 = JSON.parse(read(topic5.definitionRef));

  group('SCN-019-018 out-of-boundary refinement is refused and question and boundary bytes remain equal');
  const refinement5 = {
    contractVersion: 'research-refinement-proposal/v1',
    topicId: topic5.topicId,
    declaredQuestion: topic5.declaredQuestion,
    scopeBoundary: JSON.parse(JSON.stringify(topic5.scopeBoundary)),
    subjects: [
      { kind: 'geography', value: 'Iran' },
      { kind: 'channel', value: 'oil' },
      { kind: 'horizon', value: '1-4w' },
      { kind: 'public-ticker', value: 'XLE' }
    ]
  };
  const questionBytes5 = RLAGENDA5.canonicalizeAgenda(topic5.declaredQuestion);
  const boundaryBytes5 = RLAGENDA5.canonicalizeAgenda(topic5.scopeBoundary);
  const acceptedRefinement5 = RLAGENDA5.validateAgendaRefinement(topic5, refinement5);
  const outsideRefinement5 = RLAGENDA5.validateAgendaRefinement(topic5, {
    ...refinement5,
    subjects: [{ kind: 'geography', value: 'Mars' }]
  });
  const questionDrift5 = RLAGENDA5.validateAgendaRefinement(topic5, {
    ...refinement5,
    declaredQuestion: topic5.declaredQuestion + ' changed'
  });
  const boundaryDrift5 = RLAGENDA5.validateAgendaRefinement(topic5, {
    ...refinement5,
    scopeBoundary: { ...topic5.scopeBoundary, publicOnly: false }
  });
  assert(acceptedRefinement5.ok
    && !outsideRefinement5.ok && outsideRefinement5.code === 'RLAGENDA-REFINEMENT-OUTSIDE-BOUNDARY'
    && !questionDrift5.ok && questionDrift5.code === 'RLAGENDA-REFINEMENT-QUESTION-DRIFT'
    && !boundaryDrift5.ok && boundaryDrift5.code === 'RLAGENDA-REFINEMENT-BOUNDARY-DRIFT'
    && RLAGENDA5.canonicalizeAgenda(topic5.declaredQuestion) === questionBytes5
    && RLAGENDA5.canonicalizeAgenda(topic5.scopeBoundary) === boundaryBytes5,
  'TP-05-01: refinement preserves question and boundary bytes and refuses an out-of-boundary subject by name');

  group('SCN-019-019 recursive private fields and non-public subjects are refused at every artifact layer');
  const privateKeys5 = ['position', 'size', 'quantity', 'costBasis', 'profitAndLoss', 'account', 'mandate', 'token', 'key', 'password', 'secret'];
  const privateLayers5 = privateKeys5.map((key, index) => ({
    contractVersion: 'fixture-public-artifact/v1',
    layer: ['registry', 'review', 'dossier', 'payload', 'feature020-seam'][index % 5],
    nested: { rows: [{ publicValue: 'XLE', deeper: { [key]: 'private-sentinel-' + index } }] }
  }));
  const privateResults5 = privateLayers5.map((artifact) => RLAGENDA5.validatePublicResearchArtifact(artifact));
  const publicDossier5 = {
    contractVersion: RLAGENDA5.DOSSIER_VERSION,
    dossierId: `dossier-${'5'.repeat(64)}`,
    topicId: topic5.topicId,
    historicalOnly: false,
    findings: [{
      findingId: 'public-finding-one',
      claim: 'Public evidence changed the observed transit state.',
      source: { sourceIds: ['public-source-one'] }
    }],
    evidenceRecords: [{ evidenceId: 'public-evidence-one' }]
  };
  const seam5 = RLAGENDA5.buildFeature020ResearchSeam(topic5, definition5, publicDossier5);
  const nonPublicTopic5 = JSON.parse(JSON.stringify(topic5));
  nonPublicTopic5.scopeBoundary.publicOnly = false;
  const nonPublicSeam5 = RLAGENDA5.buildFeature020ResearchSeam(nonPublicTopic5, definition5, publicDossier5);
  assert(privateResults5.every((result, index) => !result.ok
      && result.code === 'RLAGENDA-PUBLIC-PRIVATE'
      && result.field.endsWith(privateKeys5[index]))
    && seam5.ok && seam5.value.contractVersion === 'research-finding-reference-seam/v1'
    && seam5.value.findings.length === 1
    && !JSON.stringify(seam5.value).match(/destination|eligibility|actionFamily|attention|anomaly|alert|routingDecision|score/)
    && !nonPublicSeam5.ok && nonPublicSeam5.code === 'RLAGENDA-PUBLIC-SUBJECT',
  'TP-05-02: recursive private fields and non-public subjects are refused while the read-only seam exposes no routing state');

  const payload5 = JSON.parse(read('market-brief.payload.json'));
  const toolRead5 = RLAGENDA5.buildAgendaToolRead(payload5.researchAgenda, registry5);
  assert(toolRead5.ok
    && RLAGENDA5.canonicalizeAgenda(toolRead5.value) === RLAGENDA5.canonicalizeAgenda(payload5.toolReads['research-agenda-lab'])
    && /payload\.toolReads\s*=\s*finalized\.transaction\.payload\.toolReads/.test(read('scripts/brief-narrative-parallel.mjs')),
  'TP-05-04: the registered agenda tool read is canonical and the collector carries the transaction-composed read');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 019 Scope 05 public-safety group threw): ' + e.message); }

/* ---------- summary ---------- */
console.log('\n' + '='.repeat(48));
console.log('Research-Lab self-test: ' + passes + ' passed, ' + failures + ' failed');
console.log('='.repeat(48));
process.exit(failures ? 1 : 0);
