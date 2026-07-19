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
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateBriefPayload } from './validate-brief-payload.mjs';
import { buildCompanyFundamentalsOwnerRead } from './brief-refresh.mjs';

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
  const volCoverage = (briefPayload.toolCoverage || []).find((entry) => entry.id === 'volatility-sizing-lab');
  const briefErrors = validateBriefPayload(briefPayload, briefRegistry, briefConfig, briefSnapshot);
  assert(
    volCoverage && volCoverage.deepLink === 'volatility-sizing-lab.html' && typeof volCoverage.reason === 'string' && volCoverage.reason.trim().length > 0 &&
    briefErrors.length === 0,
    'Registry-wide Market Brief coverage selftest includes the registered volatility owner read');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 011 RLVOL foundation group threw): ' + e.message + '\n' + (e.stack || '')); }

/* ---------- ETF: Sharpe deflation + shock models ---------- */
try {
  group('etf-momentum-lab.html \u2014 Deflated/Probabilistic Sharpe + MC shocks');
  const src = read('etf-momentum-lab.html');
  const names = ['mean', 'gauss', 'studentT', 'normCdf', 'invNorm', 'moments', 'deflatedSharpe', 'etfSimpleSignal', 'etfSimpleScore'];
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
  assert(approx(env.etfSimpleSignal(simpleStrong, 'blend'), 0.22, 1e-12), 'Simple ETF blend averages 3M/6M/1Y inputs');
  assert(env.etfSimpleScore(simpleStrong, '6M', 'balanced') > env.etfSimpleScore(simpleWeak, '6M', 'balanced'), 'Simple ETF balanced ranking rewards stronger momentum/quality');
  assert(env.etfSimpleScore(simpleStrong, '6M', 'raw') === 0.24, 'Simple ETF raw mode preserves the selected momentum signal');
} catch (e) { failures++; console.log('  \u2717 FAIL (etf group threw): ' + e.message); }

/* ---------- AI-Capex: CVaR tail-risk ---------- */
try {
  group('ai-capex-strategy-lab.html \u2014 CVaR expected shortfall');
  const src = read('ai-capex-strategy-lab.html');
  const names = ['invNorm', 'cvarOf'];
  const env = build(names.map((n) => extractFn(src, n)), names);
  const a = env.cvarOf(0.15, 0.30, 0.05), b = env.cvarOf(0.10, 0.50, 0.05), c = env.cvarOf(0.03, 0.20, 0.05);
  assert(a < 0 && b < 0 && c < 0, 'CVaR(5%) returns are negative (losses)');
  assert(a > -1 && b > -1 && c > -1, 'CVaR bounded at -100%');
  assert(b < a, 'higher vol => deeper CVaR tail (sigma .5 worse than .3)');
} catch (e) { failures++; console.log('  \u2717 FAIL (ai-capex group threw): ' + e.message); }

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

/* ---------- Smart Money: disclosure-lag edge decay + consensus ---------- */
try {
  group('smart-money-flow-lab.html \u2014 disclosure-lag edge decay + consensus');
  const src = read('smart-money-flow-lab.html');
  const names = ['alphaDecay', 'dayGap', 'consensusScore', 'realisticEdgeFraction'];
  const env = build(names.map((n) => extractFn(src, n)), names);

  assert(env.alphaDecay(0, 15) === 1, 'alphaDecay(0,H) = 1 (no age, full edge)');
  assert(approx(env.alphaDecay(15, 15), 0.5, 1e-9), 'alphaDecay(H,H) = 0.5 (one half-life)');
  assert(approx(env.alphaDecay(45, 15), 0.125, 1e-9), 'alphaDecay(3H,H) = 12.5% (45d @ 15d half-life)');
  assert(env.alphaDecay(30, 15) < env.alphaDecay(10, 15), 'alphaDecay strictly decreasing in age');
  assert(env.alphaDecay(200, 15) > 0 && env.alphaDecay(0, 15) <= 1, 'alphaDecay stays in (0,1]');

  assert(env.dayGap('2026-05-20', '2026-06-28') === 39, 'dayGap counts whole days (STOCK-Act lag)');
  assert(env.dayGap('2026-06-28', '2026-05-20') === 0, 'dayGap clamps a reversed range to 0');
  assert(env.dayGap('not-a-date', '2026-06-28') === 0, 'dayGap is NaN-safe -> 0');

  assert(env.consensusScore(3, 1e6, 2, 15) > env.consensusScore(1, 1e6, 2, 15), 'consensus rises with distinct filers');
  assert(env.consensusScore(2, 5e6, 2, 15) > env.consensusScore(2, 1e5, 2, 15), 'consensus rises with net $');
  assert(env.consensusScore(2, 1e6, 40, 15) < env.consensusScore(2, 1e6, 2, 15), 'consensus falls as the cluster ages');

  assert(approx(env.realisticEdgeFraction(2, 15), env.alphaDecay(2, 15), 1e-12), 'realistic edge == decay at the disclosure lag');
  assert(env.realisticEdgeFraction(45, 15) < env.realisticEdgeFraction(2, 15), 'a 45-day 13F echo retains far less than a 2-day Form 4');
} catch (e) { failures++; console.log('  \u2717 FAIL (smart-money group threw): ' + e.message); }

/* ---------- Waterfront × Masters Water-Polo screener: geo + filter ---------- */
try {
  group('waterfront-polo-lab.html \u2014 geo distance, drive-time & market filter');
  const src = read('waterfront-polo-lab.html');
  const names = ['haversineMi', 'driveMinutesApprox', 'nearestClub', 'marketPasses'];
  const env = build(names.map((n) => extractFn(src, n)), names);

  // haversine: identity, symmetry, known city pair (Orlando <-> Tampa ~ 77-85 mi)
  assert(env.haversineMi(28.54, -81.38, 28.54, -81.38) === 0, 'haversineMi(p,p) = 0');
  assert(approx(env.haversineMi(28.54, -81.38, 27.95, -82.46), env.haversineMi(27.95, -82.46, 28.54, -81.38), 1e-9), 'haversineMi symmetric');
  const orlTpa = env.haversineMi(28.54, -81.38, 27.95, -82.46);
  assert(orlTpa > 60 && orlTpa < 95, 'Orlando<->Tampa great-circle ~77-85 mi, got ' + orlTpa.toFixed(1));

  // drive-time: 0 at 0, monotone, 38 mi @ 38 mph @ rf 1.0 = 60 min
  assert(env.driveMinutesApprox(0, 38, 1.25) === 0, 'driveMinutesApprox(0,...) = 0');
  assert(approx(env.driveMinutesApprox(38, 38, 1.0), 60, 1e-6), '38 mi @ 38 mph, rf 1.0 => 60 min');
  assert(env.driveMinutesApprox(50, 38, 1.25) > env.driveMinutesApprox(10, 38, 1.25), 'drive-time monotone in distance');
  assert(env.driveMinutesApprox(-5, 38, 1.25) === null && env.driveMinutesApprox(10, 0, 1.25) === null, 'guards bad input => null');

  // nearestClub: picks the closest of the set
  const clubs = [{ lat: 28.5, lon: -81.4 }, { lat: 27.9, lon: -82.5 }, { lat: 30.3, lon: -81.7 }];
  assert(env.nearestClub(28.55, -81.38, clubs).idx === 0, 'nearestClub picks the co-located Orlando club');
  assert(env.nearestClub(30.2, -81.65, clubs).idx === 2, 'nearestClub picks Jacksonville for a NE point');

  // marketPasses: budget-fit rank, drive-time gate, water/flood/surge/land/ins filters
  const base = { driveMin: 25, budgetFit: 'strong', water: 'lake', flood: 1, surge: 0, land: 3, insBand: 1 };
  const fAll = { withinOnly: true, minutes: 40, minFit: 'good', water: { lake: true, river: true, intracoastal: true, canalBay: true, ocean: true }, maxFlood: 4, maxSurge: 4, minLand: 1, maxIns: 3 };
  assert(env.marketPasses(base, fAll) === true, 'a strong, in-ring, low-risk lake market passes');
  assert(env.marketPasses(Object.assign({}, base, { driveMin: 55 }), fAll) === false, 'out-of-ring drive-time fails when withinOnly');
  assert(env.marketPasses(Object.assign({}, base, { budgetFit: 'over' }), fAll) === false, 'over-budget fails minFit >= good');
  assert(env.marketPasses(Object.assign({}, base, { budgetFit: 'partial' }), fAll) === false, 'partial (rank 1) fails minFit good (rank 2)');
  assert(env.marketPasses(base, Object.assign({}, fAll, { water: { lake: false, river: true, intracoastal: true, canalBay: true, ocean: true } })) === false, 'excluded water type fails');
  assert(env.marketPasses(Object.assign({}, base, { surge: 4 }), Object.assign({}, fAll, { maxSurge: 2 })) === false, 'high-surge market fails a low max-surge cap');
  assert(env.marketPasses(Object.assign({}, base, { land: 1 }), Object.assign({}, fAll, { minLand: 3 })) === false, 'low-land market fails a high land floor');
} catch (e) { failures++; console.log('  \u2717 FAIL (waterfront-polo group threw): ' + e.message); }

/* ---------- Strategy Validation: real-data walk-forward engine + robustness ---------- */
try {
  group('strategy-validation-lab.html \u2014 real-data walk-forward OOS + Deflated Sharpe');
  const src = read('strategy-validation-lab.html');
  const names = ['mulberry32', 'gaussR', 'genDemoSeries', 'seriesFromCloses', 'sma', 'realizedVol', 'backtest', 'buyHoldCurve', 'metrics', 'walkForward', 'scorePass', 'allPass', 'meanA', 'moments', 'normCdf', 'invNorm', 'deflatedSharpe'];
  const env = build(names.map((n) => extractFn(src, n)), names, 'var ANN=252, VOL_WIN=20;');

  // seriesFromCloses: REAL bars -> the same engine struct the synthetic lab uses
  const ramp = []; for (let i = 0; i < 200; i++) ramp.push(100 * Math.pow(1.001, i));
  const Sr = env.seriesFromCloses(ramp);
  assert(Sr && Sr.days === 199, 'seriesFromCloses: days = closes.length - 1');
  assert(approx(Sr.fwd[0], 0.001, 1e-9), 'seriesFromCloses: forward return matches the bar ratio');
  assert(Sr.pPx[1] === ramp[0] && approx(Sr.pPx[2], ramp[0] + ramp[1], 1e-6), 'seriesFromCloses: price prefix-sum is correct');
  assert(env.seriesFromCloses([1, 2, 3]) === null, 'seriesFromCloses rejects < 120 bars (no stub series)');

  // metrics on a known positive-drift path
  const rr = [0.01, 0.02, 0.01, 0.02, 0.01, 0.02, 0.01, 0.02], curve = []; let eq = 1;
  for (let i = 0; i < rr.length; i++) { eq *= (1 + rr[i]); curve.push(eq); }
  const mm = env.metrics({ curve, r: rr, expo: rr.map(() => 1) });
  assert(mm.cagr > 0 && mm.sharpe > 0, 'metrics: positive-drift path => positive CAGR & Sharpe');
  assert(approx(mm.tim, 1, 1e-9), 'metrics: fully-invested path => time-in-market = 1');

  // walk-forward on a DETERMINISTIC strong-bull synthetic (seed-reproducible)
  const L = { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 };
  const bull = env.genDemoSeries(12345, 8, [{ frac: 1, muAnnual: 0.18, sigAnnual: 0.11 }]);
  const Sb = env.seriesFromCloses(bull);
  const wf = env.walkForward(Sb, L, 4, 0.6, 5);
  assert(wf.oos !== null && isFinite(wf.oos.sharpe), 'walkForward: produces a finite out-of-sample Sharpe');
  assert(wf.usable > 0 && wf.oosCurve.length > 20, 'walkForward: stitches usable OOS folds');
  assert(wf.oos.tim > 0 && wf.folds.length === 4, 'walkForward: long-biased rule takes OOS exposure; one record per fold');

  // embargo PURGES leakage — a massive embargo can never leave MORE usable OOS
  const wfBig = env.walkForward(Sb, L, 4, 0.6, 100000);
  assert(wfBig.usable <= wf.usable, 'walkForward: larger embargo never increases usable OOS (purge, not peek)');

  // goal scorecard (judged OOS)
  const goal = { targetCagr: 0.08, sharpeFloor: 0.7, maxDdCeiling: 0.30, minTimeInMarket: 0.25 };
  assert(env.allPass(env.scorePass({ cagr: 0.2, sharpe: 1.5, maxDd: 0.1, tim: 0.5 }, goal)) === true, 'scorePass/allPass: a clearly-good OOS result passes all four targets');
  assert(env.allPass(env.scorePass({ cagr: 0.02, sharpe: 0.3, maxDd: 0.5, tim: 0.1 }, goal)) === false, 'scorePass/allPass: a weak OOS result fails');

  // Deflated Sharpe on the REAL stitched OOS equity curve
  const d = env.deflatedSharpe(wf.oosCurve, 8);
  assert(d && d.dsr >= 0 && d.dsr <= 1 && d.psr >= 0 && d.psr <= 1, 'deflatedSharpe: DSR/PSR are probabilities in [0,1]');
  assert(d.dsr <= d.psr + 1e-9, 'deflatedSharpe: an 8-trial discount only lowers Sharpe confidence');
  assert(approx(env.normCdf(env.invNorm(0.9)), 0.9, 2e-3), 'lifted stats: invNorm/normCdf round-trip holds');
} catch (e) { failures++; console.log('  \u2717 FAIL (strategy-validation group threw): ' + e.message); }

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

/* ---------- Sector lab: Simple rotation action thresholds ---------- */
try {
  group('sector-research-lab.html — Simple rotation action thresholds');
  const src = read('sector-research-lab.html');
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
} catch (e) { failures++; console.log('  ✗ FAIL (sector Simple group threw): ' + e.message); }
/* ---------- Market Heatmap: squarified treemap + heat color + breadth ---------- */
try {
  group('market-heatmap-lab.html — squarified treemap layout, heat color, breadth + data helpers');
  const src = read('market-heatmap-lab.html');
  const names = ['trWorst', 'squarify', 'heatMix', 'heatColor', 'breadthRead', 'pctOver', 'dollarVol', 'meanSd'];
  const env = build(names.map((n) => extractFn(src, n)), names);

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

  // breadthRead
  const cells = [{ ticker: 'A', pct: 2 }, { ticker: 'B', pct: 1 }, { ticker: 'C', pct: -1 }, { ticker: 'D', pct: NaN }];
  const br = env.breadthRead(cells);
  assert(br.total === 3 && br.green === 2, 'breadthRead: counts finite cells; greens = up names');
  assert(br.leader.ticker === 'A' && br.laggard.ticker === 'C', 'breadthRead: identifies leader & laggard');
  assert(env.breadthRead([{ pct: 1 }, { pct: 1 }, { pct: 1 }]).bias === 'risk-on', 'breadthRead: all-green => risk-on');
  assert(env.breadthRead([{ pct: -1 }, { pct: -1 }, { pct: -1 }]).bias === 'risk-off', 'breadthRead: all-red => risk-off');

  // data helpers
  const rows = [{ c: 100, v: 10 }, { c: 110, v: 20 }, { c: 121, v: 30 }];
  assert(approx(env.pctOver(rows, 1), 10, 1e-9), 'pctOver: last vs 1-back = +10%');
  assert(approx(env.pctOver(rows, 2), 21, 1e-9), 'pctOver: last vs 2-back = +21%');
  assert(approx(env.dollarVol(rows), 121 * 30, 1e-9), 'dollarVol: last close × last volume');
  const ms = env.meanSd([2, 4, 6]);
  assert(approx(ms.mean, 4, 1e-9) && approx(ms.sd, 2, 1e-9), 'meanSd: mean 4, sample sd 2');
} catch (e) { failures++; console.log('  ✗ FAIL (market-heatmap group threw): ' + e.message); }
/* ---------- Unusual Options Activity: chain parse + unusual-score + tape read ---------- */
try {
  group('options-flow-feed-lab.html — chain parse, vol/OI + premium + unusual score, tape read');
  const src = read('options-flow-feed-lab.html');
  const names = ['volOI', 'premiumNotional', 'dteFrom', 'unusualScore', 'parseYahooChain', 'scoreChain', 'tapeRead'];
  const env = build(names.map((n) => extractFn(src, n)), names);

  assert(env.volOI(20, 10) === 2, 'volOI: 20 vol / 10 OI = 2');
  assert(env.volOI(5, 0) === Infinity, 'volOI: OI 0 with volume => Infinity (brand-new positioning)');
  assert(env.volOI(0, 0) === 0, 'volOI: no volume, no OI => 0');
  assert(env.premiumNotional(10, 2.5) === 2500, 'premiumNotional: 10 × $2.5 × 100 = $2,500');
  assert(env.premiumNotional(0, 2) === 0 && env.premiumNotional(10, 0) === 0, 'premiumNotional: guards zero vol / mid');
  assert(env.dteFrom(7 * 86400, 0) === 7, 'dteFrom: 7 days out from epoch 0 = 7 DTE');
  assert(env.dteFrom(NaN, 0) === null, 'dteFrom: bad expiry => null');

  const chainJson = { optionChain: { result: [{ quote: { regularMarketPrice: 100 }, options: [{ expirationDate: 1000000, calls: [{ strike: 100, volume: 500, openInterest: 100, impliedVolatility: 0.4, bid: 2, ask: 2.2, lastPrice: 2.1 }], puts: [{ strike: 95, volume: 50, openInterest: 200, impliedVolatility: 0.5, bid: 1, ask: 1.2, lastPrice: 1.1 }] }] }] } };
  const parsed = env.parseYahooChain(chainJson);
  assert(parsed && parsed.spot === 100 && parsed.rows.length === 2, 'parseYahooChain: spot + 2 rows (call + put)');
  const pcall = parsed.rows.find((r) => r.type === 'C'), pput = parsed.rows.find((r) => r.type === 'P');
  assert(pcall && approx(pcall.mid, 2.1, 1e-9), 'parseYahooChain: call mid = (bid+ask)/2');
  assert(pput && pput.strike === 95 && pput.oi === 200, 'parseYahooChain: put fields carried through');
  assert(env.parseYahooChain({}) === null, 'parseYahooChain: malformed json => null');

  const scored = env.scoreChain(parsed, 'TEST', 0);
  const sc = scored.find((r) => r.type === 'C'), sp = scored.find((r) => r.type === 'P');
  assert(approx(sc.premium, 500 * 2.1 * 100, 1e-6), 'scoreChain: call premium = vol × mid × 100');
  assert(sc.score >= 0 && sc.score <= 100 && sp.score >= 0 && sp.score <= 100, 'scoreChain: unusual scores in [0,100]');
  assert(sc.score > sp.score, 'scoreChain: high vol/OI + high-premium call scores more unusual than the quiet put');
  assert(sc.ticker === 'TEST' && sc.volOI === 5, 'scoreChain: tags ticker + vol/OI');

  const tr = env.tapeRead(scored);
  assert(tr.frac > 0.6 && /call-heavy/.test(tr.lean), 'tapeRead: call premium dominant => call-heavy lean');
  assert(env.tapeRead([]).lean === 'n/a', 'tapeRead: no rows => n/a');
} catch (e) { failures++; console.log('  ✗ FAIL (options-flow group threw): ' + e.message); }

/* ---------- Global rotation: country momentum, FX orientation, risk-aware score ---------- */
try {
  group('global-rotation-lab.html — country momentum + FX-confirmed score');
  const src = read('global-rotation-lab.html');
  const names = ['globalTrailingPct', 'globalAnnualVol', 'globalMaxDrawdown', 'globalTrendState', 'globalFxConfirm', 'globalCountryScore'];
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
  const inverseFx = env.globalFxConfirm(rising, 21, true, -2);
  assert(inverseFx.strengthPct < 0, 'USD/local quote is sign-flipped into local-currency strength');
  assert(inverseFx.confirmation === 1, 'weak local FX confirms weak country relative momentum');
  const strong = env.globalCountryScore({ momentum: 0.8, trend: 0.7, risk: 0.5, fx: 0.4 }, { fxWeight: 0.14, posture: 'balanced' });
  const weak = env.globalCountryScore({ momentum: -0.8, trend: -0.7, risk: -0.5, fx: -0.4 }, { fxWeight: 0.14, posture: 'balanced' });
  assert(strong.score > 70 && weak.score < 30, 'supportive inputs outrank adverse inputs on the common 0-100 scale');
  assert(env.globalCountryScore({}, {}) === null, 'missing model inputs remain missing, never fabricated as neutral');
  assert(env.globalCountryScore({ trend: 0.9, risk: 0.9 }, {}) === null, 'country score requires benchmark-relative momentum before ranking');
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

/* ---------- Market Brief: §6c larger-picture / anti-reactivity helpers ---------- */
try {
  group('rlbrief.js — §6c structural frame + anti-reactivity (MA stack, horizon cap, persistence gate)');
  const src = read('rlbrief.js');
  const names = ['maStackLabel', 'pctFromLevel', 'capConfidence', 'consecutiveRun', 'isPersistentSignal', 'memberArray', 'groupBreadth', 'notableMembers', 'normalizeRecommendation', 'nextSessionActions', 'actionableAttention', 'nearTermEvents'];
  const env = build(names.map((n) => extractFn(src, n)), names);

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
  const renderAllSource = extractFn(read('market-brief.html'), 'renderAll');
  assert(renderAllSource.indexOf('renderAsOf();') < renderAllSource.indexOf('RLBRIEF.renderBackdrop'), 'generation timestamp renders before complex brief sections');
} catch (e) { failures++; console.log('  ✗ FAIL (market-brief group threw): ' + e.message); }

/* ---------- Shared RLDATA: Simple-view tool-read contract ---------- */
try {
  group('rldata.js — shared toolReads round-trip + freshness');
  const source = read('rldata.js'), store = {}, session = {}, root = { location: { pathname: '/index.html', protocol: 'https:' } };
  const storage = { getItem: (key) => store[key] || null, setItem: (key, value) => { store[key] = value; }, removeItem: (key) => { delete store[key]; } };
  const sessionStorage = { getItem: (key) => session[key] || null, setItem: (key, value) => { session[key] = value; }, removeItem: (key) => { delete session[key]; } };
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
  assert(Object.isFrozen(policies) && policies.length > 0 && policies.every((policy) => Object.isFrozen(policy) && policy.state === 'disabled'), 'provider registry is frozen and every production provider is disabled');
  assert(typeof api.detectLegacyCredentials === 'undefined' && typeof api.migrateLegacyCredentials === 'undefined', 'legacy credential value detection and migration APIs are absent');
  assert(Object.keys(session).length === 0 && !!store.rlData && !store.rlApiKeys, 'provider credentials have no client store while non-secret rlData remains durable');
  assert(typeof api.key === 'undefined' && typeof api.keys === 'undefined' && typeof api.hasKey === 'undefined' && typeof api.setKey === 'undefined' && typeof api.migrateKeys === 'undefined', 'central owner exposes no raw bulk or migration credential API');
  api.reportData('bars:SPY:1d', 'refreshing', { label: 'SPY daily bars' });
  assert(api.dataState().counts.refreshing === 1, 'data lifecycle reports an in-flight resource');
  api.reportData('bars:SPY:1d', 'ready', { label: 'SPY daily bars', rows: 500 });
  assert(api.dataState().counts.ready === 1 && api.dataState().resources[0].rows === 500, 'data lifecycle reports a completed resource with context');

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
  assert(index.indexOf('id="data-settings"') >= 0 && /Provider access/.test(appSource) && /Current-document memory only/.test(appSource) && /providerPolicies/.test(appSource) && /credentialStatus/.test(appSource) && /clearAllCredentials/.test(appSource) && !/Market data credentials/.test(appSource) && !/settings-save|settings-migrate|rlApiKeys/.test(appSource), 'the landing page exposes status-only current-document provider policy without a credential editor');
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
  const validErrors = validateBriefPayload(payload, registry, config, snapshot);
  assert(validErrors.length === 0, 'current payload satisfies the executable brief contract' + (validErrors.length ? ': ' + validErrors.join('; ') : ''));
  const missingCoverage = JSON.parse(JSON.stringify(payload));
  missingCoverage.toolCoverage = missingCoverage.toolCoverage.slice(1);
  assert(validateBriefPayload(missingCoverage, registry, config, snapshot).some((error) => /missing registered tools/.test(error)), 'contract rejects omission of a registered tool');
  const genericRealAssets = JSON.parse(JSON.stringify(payload));
  genericRealAssets.toolReads['real-assets-lab'].metrics = { score: 50 };
  assert(validateBriefPayload(genericRealAssets, registry, config, snapshot).some((error) => /model-specific GLD/.test(error)), 'contract rejects a generic real-assets read without GLD/BTC/SLV detail');
  const vagueAction = JSON.parse(JSON.stringify(payload));
  vagueAction.nextSession.actions = [{ action: 'watch', subject: 'SPY', confidence: 80 }];
  assert(validateBriefPayload(vagueAction, registry, config, snapshot).some((error) => /action must be/.test(error)), 'contract rejects watch-only or incomplete next-session output');
  const missingSection = JSON.parse(JSON.stringify(payload));
  delete missingSection.events;
  assert(validateBriefPayload(missingSection, registry, config, snapshot).some((error) => /events must be/.test(error)), 'contract rejects a missing visible brief section');
  const incompleteBackdrop = JSON.parse(JSON.stringify(payload));
  delete incompleteBackdrop.backdrop.whatWouldChangeIt;
  assert(validateBriefPayload(incompleteBackdrop, registry, config, snapshot).some((error) => /backdrop\.whatWouldChangeIt/.test(error)), 'contract rejects an incomplete structural backdrop');
  const missingGenerationTime = JSON.parse(JSON.stringify(payload));
  delete missingGenerationTime.generatedAt;
  assert(validateBriefPayload(missingGenerationTime, registry, config, snapshot).some((error) => /generatedAt/.test(error)), 'contract rejects a missing generation timestamp');
} catch (e) { failures++; console.log('  ✗ FAIL (brief payload contract group threw): ' + e.message); }

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
    'ocean-shores-wa::large-luxury-5plus',
    'ocean-shores-wa::whole-market',
    'palm-springs-ca::large-luxury-5plus',
    'palm-springs-ca::whole-market'
  ];
  const categories = config.requiredResearchCategoryIds.join('|');
  const luxuryUnits = units.filter((unit) => unit.segmentId === 'large-luxury-5plus');
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
    'tdcRunScope2Engine',
    'tdcRunScope3Engine'
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
  assert(toolIds.indexOf('trend-dynamics-cycle-lab') < 0, 'Trend Dynamics Scope 1 preserves registry ordering by deferring registration to Scope 4');
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
} catch (e) { failures++; console.log('  ✗ FAIL (Technical Analysis Decision foundation group threw): ' + e.message); }
/* ---------- End Feature 007 Technical Analysis Decision foundation ---------- */

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
  const quoteEnvelope = JSON.parse(read('data/options/MSFT.json'));
  const barsEnvelope = JSON.parse(read('data/bars/MSFT.json'));
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
  assert(companyScriptSources.length === 7 && companyScriptSources.every((source) => !source.includes('://')) && !companyRouteSource.includes('foundation-publication.js') && companyRouteSource.includes('RLCOMPANY.loadCompanyPublication') && companyRouteSource.includes('data/company-fundamentals/companies/sec-cik-0000789019/current.json') && companyRouteSource.includes('fetchImpl: window.fetch.bind(window)') && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(companyRouteSource), 'Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field');
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
  assert(scope2Scripts.length === 7 && scope2Scripts.every((source) => !source.includes('://')) && scope2RouteSource.includes('resolveArchetypeView') && scope2RouteSource.includes('company-fundamentals.config.json') && scope2RouteSource.includes('data-kpi-priority') && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope2RouteSource), 'Feature 010 Scope 2 cockpit wires the archetype-prioritized Simple view over same-origin scripts with no credential field');
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
  assert(scope3Scripts.length === 7 && scope3Scripts.every((source) => !source.includes('://')) && scope3RouteSource.includes('RLCOMPANY.evaluateModel') && scope3RouteSource.includes('RLCOMPANY.reduceProposalDecision') && scope3RouteSource.includes('data-model-workspace') && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope3RouteSource), 'Feature 010 Scope 3 cockpit wires the linked model and accepted-state reducers over same-origin scripts with no credential field');
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
  assert(scope4Scripts.length === 7 && scope4Scripts.every((source) => !source.includes('://')) && scope4Route.includes('data-mode-seg') && scope4Route.includes('data-detailed-tab') && scope4Route.includes('RLCOMPANY.selectPeersView') && scope4Route.includes('RLCOMPANY.buildAcceptedExport') && scope4Route.includes('RLDATA.putToolRead') && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope4Route), 'Feature 010 Scope 4 cockpit wires the mode toggle, six Detailed workspaces, peers, and the owner-read compat over same-origin scripts with no credential field');
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
  assert(JSON.stringify(scope6CoverageIds) === JSON.stringify(scope6RegistryIds) && scope6Coverage.length === 1 && scope6Coverage[0].deepLink === scope6Tool.file && scope6Coverage[0].status === 'fresh-headless' && scope6Coverage[0].reason.includes('company-fundamentals-owner-v1') && scope6Coverage[0].reason.includes('no recommendation is fabricated'), 'Feature 010 Scope 6 keeps exact registry-wide toolCoverage parity with one hash-verified company owner-read entry');
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
  assert(scope7Scripts.length === 7 && scope7Scripts.every((source) => !source.includes('://')) && scope7Html.includes('selectResilienceView') && scope7Html.includes('data-resilience-company="sec-cik-0001058090"') && scope7Html.includes('data-resilience-company="sec-cik-0000019617"') && scope7Html.includes('archetype-restaurant-unit-economics') && scope7Html.includes('archetype-financial-institution') && scope7HasPublicationWiring && scope7HasProvenance && scope7HasAcceptedObservationProjection && !scope7HasLegacyOverlay && scope7ForbiddenInlineValues.every((value) => !scope7Html.includes(value)) && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope7Html), 'Feature 010 Scope 7 overlay cockpit loads retained CMG and JPM publications through current pointers, projects accepted observations with provenance, and rejects constructed or inline issuer values');
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
  assert(scope8Scripts.length === 7 && scope8HasComparabilityTab && scope8HasRovingTabindex && scope8HasKeyboardNav && scope8HasLive && scope8HasChartTable && scope8HasProductionWiring && scope8ForbiddenInline.every((value) => !scope8Html.includes(value)) && !/type="password"|name="[^"]*(?:credential|token|secret)/i.test(scope8Html), 'Feature 010 Scope 8 lab hardens the research journey with a keyboard-operable roving tab list, a polite live region, an accessible chart-equivalent table, and a decorative visual hidden from assistive technology, driven by the production comparability and accessible-table helpers with no inline issuer values');
} catch (e) { failures++; console.log('  ✗ FAIL (Feature 010 Scope 8 group threw): ' + e.message); }
/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE8-END */

/* ---------- summary ---------- */
console.log('\n' + '='.repeat(48));
console.log('Research-Lab self-test: ' + passes + ' passed, ' + failures + ' failed');
console.log('='.repeat(48));
process.exit(failures ? 1 : 0);
