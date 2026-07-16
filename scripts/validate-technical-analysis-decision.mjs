#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const json = (path) => JSON.parse(read(path));
let checks = 0;

function check(condition, label) {
  if (!condition) throw new Error(label);
  checks++;
  console.log(`[tad-validator] ${label}=PASS`);
}

function extractFunction(source, name) {
  const signature = new RegExp(`function\\s+${name}\\s*\\(`);
  const match = signature.exec(source);
  if (!match) throw new Error(`missing production declaration ${name}`);
  let cursor = source.indexOf('{', match.index);
  if (cursor < 0) throw new Error(`missing production body ${name}`);
  let depth = 0;
  const start = match.index;
  for (; cursor < source.length; cursor++) {
    if (source[cursor] === '{') depth++;
    else if (source[cursor] === '}') {
      depth--;
      if (depth === 0) return source.slice(start, cursor + 1);
    }
  }
  throw new Error(`unterminated production declaration ${name}`);
}

function buildFunctions(source, names, preamble = '') {
  const body = `${preamble}\n${names.map((name) => extractFunction(source, name)).join('\n')}\nreturn {${names.join(',')}};`;
  return Function(body)();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function matchCount(source, expression) {
  const matches = source.match(expression);
  return matches === null ? 0 : matches.length;
}

try {
  console.log('[tad-validator] BEGIN Scope 01 capability foundation');
  const pageSource = read('technical-analysis-decision-lab.html');
  const validationSource = read('rlvalidation.js');
  const dataSource = read('rldata.js');
  const strategySource = read('strategy-validation-lab.html');
  const testSource = read('tests/technical-analysis-decision-lab.spec.mjs');
  const config = json('technical-analysis-decision-universe.json');
  const sourceFixture = json('tests/fixtures/technical-analysis-decision/source-qualified/us-equity-sessions.json');
  const analyticFixture = json('tests/fixtures/technical-analysis-decision/analytic/session-profiles.json');
  const invalidFixture = json('tests/fixtures/technical-analysis-decision/invalid/contracts.json');

  const scope01Names = [
    'tadError', 'tadIsPlainObject', 'tadHasExactKeys', 'tadFiniteNumber', 'tadStableSerialize',
    'tadStableDigest', 'tadDeepFreeze', 'tadValidateConfig', 'tadIndexConfig',
    'tadValidateSourceVintage', 'tadValidateSeriesEnvelope', 'tadValidateOwnerRead',
    'tadResolveAsOf', 'tadResolveSession', 'tadClassifyBarStatus', 'tadAggregateBars',
    'tadBuildTimeframeProfile', 'tadAlignSeries', 'tadBuildVariantIdentity', 'tadBuildSourceSetIdentity'
  ];
  const tad = buildFunctions(pageSource, scope01Names);
  const physicalTadNames = [...pageSource.matchAll(/function\s+(tad[A-Za-z0-9]+)\s*\(/g)].map((match) => match[1]);
  check(physicalTadNames.length === 20 && new Set(physicalTadNames).size === 20 && scope01Names.every((name) => physicalTadNames.includes(name)), 'scope01-production-declarations-20-exact');
  check(config.display.declarationInventory.length === 65 && new Set(config.display.declarationInventory).size === 65 && config.display.scope01Declarations.join('|') === scope01Names.join('|'), 'planned-declaration-inventory-65-unique-and-owned');

  const configResult = tad.tadValidateConfig(config);
  const indexResult = tad.tadIndexConfig(config);
  check(configResult.ok && indexResult.ok, 'closed-production-config-valid');
  check(Object.keys(config).sort().join('|') === ['contractVersion','toolId','registryVersion','initialSelection','sourcePolicies','sessionCalendars','timeframeProfiles','sensitivityProfiles','evidenceFamilies','techniques','setupDefinitions','comparisonPolicies','validationPolicies','costPolicySchema','claimLedger','controlBounds','limits','display'].sort().join('|'), 'config-top-level-keys-exact');
  check(config.sessionCalendars.length === 3 && config.timeframeProfiles.map((profile) => profile.profileId).join('|') === 'us-equity-session-v1|us-equity-4h-core-v1|us-equity-4h-extended-v1|continuous-4h-v1|daily-close-v1|custom-v1', 'session-and-timeframe-contracts-exact');
  check(config.evidenceFamilies.length === 9 && config.techniques.length === 15 && config.setupDefinitions.length === 8, 'evidence-technique-setup-registries-complete');
  check(config.comparisonPolicies.length === 1 && config.validationPolicies.length === 1 && config.costPolicySchema.policies.length === 1 && config.claimLedger.some((claim) => claim.verdict === 'rejected'), 'comparison-validation-cost-claim-contracts-complete');
  check(Object.keys(config.controlBounds).length === 7 && Object.keys(config.limits).length === 7 && config.display.truthStates.length === 10, 'bounds-limits-display-contracts-complete');

  const invalidUnknown = clone(config); invalidUnknown.hiddenDefault = true;
  const invalidVersion = clone(config); invalidVersion.contractVersion = 'tad-config/v99';
  const invalidReference = clone(config); invalidReference.initialSelection.timeframeProfileId = 'profile:missing';
  const invalidNestedPolicy = clone(config); invalidNestedPolicy.sourcePolicies[0].hiddenDefault = true;
  const invalidNestedTechnique = clone(config); invalidNestedTechnique.techniques[0].parameters.hiddenDefault = 20;
  const invalidNestedSetup = clone(config); invalidNestedSetup.setupDefinitions[0].hiddenGate = 'pass';
  check(!tad.tadValidateConfig(invalidUnknown).ok && tad.tadValidateConfig(invalidUnknown).errors.some((error) => error.code === 'TAD-CONFIG-KEY'), 'adversarial-config-unknown-key-rejected');
  check(!tad.tadValidateConfig(invalidVersion).ok && tad.tadValidateConfig(invalidVersion).errors.some((error) => error.code === 'TAD-CONFIG-VERSION'), 'adversarial-config-version-rejected');
  check(!tad.tadValidateConfig(invalidReference).ok && tad.tadValidateConfig(invalidReference).errors.some((error) => error.code === 'TAD-CONFIG-REFERENCE'), 'adversarial-config-reference-rejected');
  check(!tad.tadValidateConfig(invalidNestedPolicy).ok && tad.tadValidateConfig(invalidNestedPolicy).errors.some((error) => error.code === 'TAD-CONFIG-KEY' && error.path === '$.sourcePolicies[0]'), 'adversarial-nested-policy-key-rejected');
  check(!tad.tadValidateConfig(invalidNestedTechnique).ok && tad.tadValidateConfig(invalidNestedTechnique).errors.some((error) => error.code === 'TAD-CONFIG-KEY' && error.path === '$.techniques[0].parameters'), 'adversarial-nested-technique-key-rejected');
  check(!tad.tadValidateConfig(invalidNestedSetup).ok && tad.tadValidateConfig(invalidNestedSetup).errors.some((error) => error.code === 'TAD-CONFIG-KEY' && error.path === '$.setupDefinitions[0]'), 'adversarial-nested-setup-key-rejected');

  const envelopeNames = ['seriesEnvelope', 'core4hEnvelope', 'extendedEnvelope', 'continuousEnvelope', 'earlyCloseEnvelope', 'weeklyEnvelope'];
  const envelopeResults = envelopeNames.map((name) => ({ name, result: tad.tadValidateSeriesEnvelope(sourceFixture[name]) }));
  check(envelopeResults.every((entry) => entry.result.ok), 'all-source-qualified-envelope-contracts-valid');
  check(sourceFixture.fixturePosture === 'source-qualified-historical' && sourceFixture.provenance.liveClaim === false && /^https:\/\//.test(sourceFixture.provenance.sourceUrl) && sourceFixture.provenance.limitations.length >= 2, 'historical-fixture-provenance-truthful');
  check(analyticFixture.fixturePosture === 'analytic-deterministic' && analyticFixture.liveClaim === false && /not historical performance/.test(analyticFixture.purpose), 'analytic-fixture-posture-truthful');
  check(invalidFixture.fixturePosture === 'invalid-adversarial' && invalidFixture.liveClaim === false && invalidFixture.cases.length === 9, 'invalid-fixture-posture-and-inventory-truthful');
  check(!existsSync(join(ROOT, sourceFixture.cachedTruth.failedResource)), 'failed-delta-resource-really-absent');

  const sourceUnknown = clone(sourceFixture.seriesEnvelope); sourceUnknown.source.hidden = true;
  const sourceClock = clone(sourceFixture.seriesEnvelope); sourceClock.source.availableAt = '2026-07-02T19:00:00.000Z';
  const invalidOhlc = clone(sourceFixture.seriesEnvelope); invalidOhlc.bars[0].l = invalidOhlc.bars[0].h + 1;
  const duplicateBar = clone(sourceFixture.seriesEnvelope); duplicateBar.bars.push(clone(duplicateBar.bars[0]));
  check(!tad.tadValidateSeriesEnvelope(sourceUnknown).ok && tad.tadValidateSeriesEnvelope(sourceUnknown).errors.some((error) => error.code === 'TAD-SOURCE-KEY'), 'adversarial-source-key-rejected');
  check(!tad.tadValidateSeriesEnvelope(sourceClock).ok && tad.tadValidateSeriesEnvelope(sourceClock).errors.some((error) => error.code === 'TAD-SOURCE-CLOCK'), 'adversarial-source-clock-rejected');
  check(!tad.tadValidateSeriesEnvelope(invalidOhlc).ok && tad.tadValidateSeriesEnvelope(invalidOhlc).errors.some((error) => error.code === 'TAD-DATA-OHLC'), 'adversarial-ohlc-rejected');
  check(!tad.tadValidateSeriesEnvelope(duplicateBar).ok && tad.tadValidateSeriesEnvelope(duplicateBar).errors.some((error) => error.code === 'TAD-DATA-DUPLICATE'), 'adversarial-duplicate-bar-rejected');

  const ownerRead = {
    contractVersion: 'rl-tool-read/v1', id: 'swing-structure-lab', availability: 'current',
    asOf: '2026-07-02T20:00:00.000Z', computedAt: '2026-07-02T20:01:00.000Z', freshUntil: '2026-07-02T21:00:00.000Z',
    read: 'Historical contract canary', deepLink: 'swing-structure-lab.html', metrics: { ownerRead: {
      contractVersion: 'rl-ta-owner-read/v1', capabilityVersion: 'swing-structure/v1', ownerId: 'swing-structure-lab', resultId: 'result:fixture',
      sourceSetId: 'source-set:fixture', symbol: 'TEST-XNYS', sessionContractId: 'xnys-core-v1', decisionCutoff: '2026-07-02T20:00:00.000Z',
      truthState: 'current', closedCoverage: ['1w','1d'], provisionalCoverage: [], payload: { state: 'range' }, limitations: ['Historical contract canary only.']
    } }
  };
  check(tad.tadValidateOwnerRead(ownerRead, { symbol: 'TEST-XNYS', sessionContractId: 'xnys-core-v1', decisionCutoff: '2026-07-02T20:00:00.000Z' }).ok, 'owner-read-exact-contract-valid');
  const invalidOwner = clone(ownerRead); invalidOwner.metrics.ownerRead.contractVersion = 'rl-ta-owner-read/v99';
  check(!tad.tadValidateOwnerRead(invalidOwner, null).ok && tad.tadValidateOwnerRead(invalidOwner, null).errors.some((error) => error.code === 'TAD-OWNER-VERSION'), 'adversarial-owner-version-rejected');

  const normal65 = tad.tadAggregateBars(sourceFixture.seriesEnvelope.bars, analyticFixture.requests.usEquity65m, indexResult.index);
  const core4h = tad.tadAggregateBars(sourceFixture.core4hEnvelope.bars, analyticFixture.requests.usEquity4hCore, indexResult.index);
  const extended4h = tad.tadAggregateBars(sourceFixture.extendedEnvelope.bars, analyticFixture.requests.usEquity4hExtended, indexResult.index);
  const continuous4h = tad.tadAggregateBars(sourceFixture.continuousEnvelope.bars, analyticFixture.requests.continuous4h, indexResult.index);
  const earlyClose = tad.tadAggregateBars(sourceFixture.earlyCloseEnvelope.bars, analyticFixture.requests.usEquity65mEarlyClose, indexResult.index);
  const weekly = tad.tadAggregateBars(sourceFixture.weeklyEnvelope.bars, analyticFixture.requests.weekly, indexResult.index);
  check(normal65.ok && normal65.bars.length === 6 && normal65.bars.every((bar) => bar.actualDurationMs === 3900000 && bar.status === 'closed'), 'stock-65m-six-equal-bars');
  check(core4h.ok && core4h.bars.map((bar) => bar.actualDurationMs / 60000).join('|') === '240|150' && core4h.bars[1].status === 'partial', 'stock-core-4h-remainder-explicit');
  check(extended4h.ok && extended4h.bars.length === 4 && extended4h.bars.every((bar) => bar.actualDurationMs === 14400000), 'stock-extended-4h-four-equal-bars');
  check(continuous4h.ok && continuous4h.bars.length === 6 && !continuous4h.qualityFlags.includes('US_EQUITY_PARTIAL_SESSION'), 'continuous-4h-six-equal-bars');
  check(earlyClose.ok && earlyClose.bars.some((bar) => bar.status === 'partial') && earlyClose.qualityFlags.includes('EARLY_CLOSE_PARTIAL'), 'early-close-partial-non-confirming');
  check(weekly.ok && weekly.confirmedBars.at(-1).barId === 'week-2026-07-10' && weekly.provisionalBars.at(-1).barId === 'week-2026-07-17', 'weekly-closed-provisional-separated');
  check(sourceFixture.calendarEvents.map((event) => event.type).sort().join('|') === 'dst-transition|early-close|holiday', 'holiday-dst-early-close-records-explicit');
  check(tad.tadBuildTimeframeProfile(config.timeframeProfiles.find((profile) => profile.profileId === 'custom-v1'), analyticFixture.customSelection, indexResult.index).ok, 'custom-profile-explicit-valid');
  check(tad.tadBuildTimeframeProfile(config.timeframeProfiles.find((profile) => profile.profileId === 'custom-v1'), analyticFixture.invalidCustomSelection, indexResult.index).errors.some((error) => error.code === 'TAD-SESSION-PARTIAL-POLICY'), 'custom-profile-undeclared-partial-rejected');

  const validationNames = ['rlvBuildPurgedFolds','rlvAdjustBenjaminiHochberg','rlvAdjustHolm','rlvDeflatedSharpe','rlvWilsonInterval','rlvQuantiles','rlvSummarizeOutcomes'];
  const validationRoot = {};
  const validationApi = Function('globalThis', `${validationSource}\nreturn globalThis.RLVALID;`)(validationRoot);
  check(validationNames.every((name) => typeof validationApi[name] === 'function' && matchCount(validationSource, new RegExp(`function\\s+${name}\\s*\\(`, 'g')) === 1) && Object.keys(validationApi).length === 7, 'rlvalid-seven-exact-declarations');
  check(!/\b(?:window|document|localStorage|sessionStorage|fetch)\b/.test(validationSource), 'rlvalid-node-safe-no-dom-storage-network');
  const folds = validationApi.rlvBuildPurgedFolds(400, 4, 0.6, 5, 5);
  const bh = validationApi.rlvAdjustBenjaminiHochberg([0.01,0.04,0.03,0.20]);
  const holm = validationApi.rlvAdjustHolm([0.01,0.04,0.03,0.20]);
  const wilson = validationApi.rlvWilsonInterval(7, 10, 1.96);
  const quantiles = validationApi.rlvQuantiles([1,2,3,4], [0.25,0.5,0.75]);
  const outcomes = validationApi.rlvSummarizeOutcomes([1,-1,2,-0.5,0]);
  check(folds.ok && bh.ok && holm.ok && wilson.ok && quantiles.ok && outcomes.ok, 'rlvalid-generic-primitives-execute');
  const equity = Array.from({ length: 80 }, (_value, index) => Math.pow(1.001 + (index % 3) * 0.0001, index + 1));
  const firstDsr = validationApi.rlvDeflatedSharpe(equity, 7, 252);
  check(firstDsr.ok && Array.from({ length: 100 }, () => validationApi.rlvDeflatedSharpe(equity, 7, 252)).every((result) => JSON.stringify(result) === JSON.stringify(firstDsr)), 'rlvalid-100-repeat-byte-determinism');

  const durable = {};
  const storage = { getItem: (key) => durable[key] || null, setItem: (key, value) => { durable[key] = value; }, removeItem: (key) => { delete durable[key]; } };
  const dataRoot = { location: { pathname: '/technical-analysis-decision-lab.html', protocol: 'https:' } };
  const dataApi = Function('globalThis','window','localStorage','fetch',`${dataSource}\nreturn globalThis.RLDATA;`)(dataRoot,dataRoot,storage,undefined);
  dataApi.putBars('LEGACY', '1d', [{ t:1,o:1,h:2,l:0.5,c:1.5,v:10 }], 'legacy');
  dataApi.putToolRead('legacy', { asOf:'2026-07-15T17:00:00.000Z', read:'Legacy', metrics:{state:'unchanged'}, deepLink:'legacy.html' });
  const legacyBefore = JSON.stringify({ bars:dataApi.bars('LEGACY','1d'), info:dataApi.barInfo('LEGACY','1d'), read:dataApi.toolRead('legacy') });
  const storedEnvelope = dataApi.putQualifiedBarSeries(sourceFixture.seriesEnvelope);
  const restoredEnvelope = dataApi.qualifiedBarSeries(sourceFixture.seriesEnvelope.symbol, sourceFixture.seriesEnvelope.interval, sourceFixture.seriesEnvelope.source.vintageId);
  check(storedEnvelope && restoredEnvelope && JSON.stringify(storedEnvelope) === JSON.stringify(restoredEnvelope), 'rldata-qualified-series-round-trip');
  check(JSON.stringify({ bars:dataApi.bars('LEGACY','1d'), info:dataApi.barInfo('LEGACY','1d'), read:dataApi.toolRead('legacy') }) === legacyBefore, 'rldata-legacy-bytes-preserved');
  check(matchCount(dataSource,/Feature 007: qualified interval series/g) === 1 && matchCount(dataSource,/End Feature 007 qualified interval series/g) === 1, 'rldata-marker-boundary-exact');

  const strategyPreamble = `var ANN=252;\n${extractFunction(strategySource,'meanA')}\n${extractFunction(strategySource,'normCdf')}\n${extractFunction(strategySource,'invNorm')}\n${extractFunction(strategySource,'moments')}`;
  const strategyLocal = buildFunctions(strategySource, ['deflatedSharpe'], strategyPreamble).deflatedSharpe(equity, 7);
  check(firstDsr.ok && ['psr','dsr','srAnn','nTrials','n'].every((field) => strategyLocal[field] === firstDsr[field]), 'strategy-validation-generic-statistic-parity');
  check(matchCount(strategySource,/Feature 007: RLVALID parity adapter/g) === 1 && matchCount(strategySource,/End Feature 007 RLVALID parity adapter/g) === 1 && strategySource.includes('<script src="rlvalidation.js"></script>') && strategySource.includes('deflatedSharpe = strategyValidationParityDeflatedSharpe'), 'strategy-validation-marker-load-and-runtime-delegation');

  const expectedTitles = [
    'Regression: SCN-007-005 stock four-hour profile exposes session remainder and variant identity',
    'Regression: SCN-007-006 continuous-market four-hour profile has equal session boundaries',
    'Regression: SCN-007-007 provisional weekly break never rewrites confirmed history',
    'Regression: SCN-007-030 failed delta refresh preserves cached source-qualified truth',
    'Regression: Feature 007 qualified series and RLVALID preserve legacy shared behavior'
  ];
  check(expectedTitles.every((title) => testSource.includes(`test('${title}'`)), 'scope01-regression-titles-exact');
  check(!/page\.route|context\.route|\.fulfill\s*\(|serviceWorker|test\.(?:skip|only)/.test(testSource), 'browser-suite-no-internal-substitution-or-skip');
  check(!/(?:fixture|analytic)[^\n]*(?:live market|live source|current market)/i.test(testSource), 'browser-suite-no-fake-live-claims');
  check(matchCount(read('scripts/selftest.mjs'),/Feature 007: Technical Analysis Decision foundation/g) === 1 && matchCount(read('scripts/selftest.mjs'),/End Feature 007 Technical Analysis Decision foundation/g) === 1, 'selftest-marker-boundary-exact');

  console.log(`[tad-validator] checks=${checks}`);
  console.log('[tad-validator] result=PASS');
  console.log('[tad-validator] END Scope 01 capability foundation');
} catch (error) {
  console.error(`[tad-validator] result=FAIL message=${error.message}`);
  console.error('[tad-validator] END Scope 01 capability foundation');
  process.exitCode = 1;
}