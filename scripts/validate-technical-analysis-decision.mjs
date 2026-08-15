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
  const scope02Names = [
    'tadSmaSeries', 'tadEmaSeries', 'tadAtrSeries', 'tadRsiSeries', 'tadMacdSeries',
    'tadBollingerSeries', 'tadAdxDmiSeries', 'tadObvSeries', 'tadCmfSeries', 'tadRelativeVolume',
    'tadEffortResult', 'tadVolumeProfile', 'tadVwapEnvelope', 'tadPivots', 'tadRelativeStrength',
    'tadEvaluateTechnique', 'tadClusterEvidenceFamilies'
  ];
  // Scope 02 helpers are shared infrastructure, not owned declarations: one EMA and one Wilder
  // smoother serve every technique that needs them rather than each carrying a private copy.
  const scope02Helpers = ['tadTechniqueOutcome', 'tadTechniqueRefusal', 'tadTechniqueColumns', 'tadEmaValues', 'tadWilderValues'];
  const scope03Names = [
    'tadNormalizeLevels', 'tadClusterConfluence', 'tadUpdateLevelLifecycle', 'tadEvaluateSetupDefinition',
    'tadTransitionCandidate', 'tadDeriveNaturalTargets', 'tadBuildRiskPlan', 'tadAuditTargets'
  ];
  const scope03Helpers = ['tadIsFinite', 'tadIdentity', 'tadLevelRefusal', 'tadSetupRefusal'];
  const scope04Names = [
    'tadRankCandidates', 'tadEvaluatePrimaryGate', 'tadEvaluateRegimeGate', 'tadEvaluateLocationGate', 'tadEvaluateTriggerGate',
    'tadEvaluateValidationRiskProcessGate', 'tadSynthesizeFiveGates', 'tadBuildUnifiedRead'
  ];
  const scope04Helpers = ['tadGateResult', 'tadTimeframeConflict'];
  // Scope 05 owns no analytic primitive. These four are strict ADAPTERS: they admit or refuse an
  // owner's already-published read and compute no owner quantity of their own.
  const scope05Names = ['tadAdmitOwnerRead', 'tadAdmitOptionPositioning', 'tadEvaluateMicrostructure', 'tadAdaptFeatureSixRead'];
  const tad = buildFunctions(pageSource, scope01Names.concat(scope02Helpers, scope02Names));
  const physicalTadNames = [...pageSource.matchAll(/function\s+(tad[A-Za-z0-9]+)\s*\(/g)].map((match) => match[1]);
  const declaredNames = scope01Names.concat(scope02Helpers, scope02Names, scope03Helpers, scope03Names, scope04Helpers, scope04Names, scope05Names);
  check(physicalTadNames.length === declaredNames.length && new Set(physicalTadNames).size === declaredNames.length && scope01Names.every((name) => physicalTadNames.includes(name)), 'scope01-production-declarations-20-exact');
  check(scope02Names.length === 17 && scope02Names.every((name) => physicalTadNames.includes(name)), 'scope02-production-declarations-17-exact');
  check(scope03Names.length === 8 && scope03Names.every((name) => physicalTadNames.includes(name)), 'scope03-production-declarations-8-exact');
  check(scope04Names.length === 8 && scope04Names.every((name) => physicalTadNames.includes(name)), 'scope04-production-declarations-8-exact');
  check(scope05Names.length === 4 && scope05Names.every((name) => physicalTadNames.includes(name)), 'scope05-adapter-declarations-4-exact');

  // The five mandatory gates are ordered and closed. A sixth gate, a reordering, or a renamed gate
  // would change what "every mandatory gate passed" means without any test noticing.
  check(/var TAD_GATE_ORDER = \["primary", "regime", "location", "trigger", "validation-risk-process"\];/.test(pageSource), 'scope04-gate-order-exact');
  const scope04Block = pageSource.slice(pageSource.indexOf('Feature 007 Scope 04: five-gate synthesis'), pageSource.indexOf('End Feature 007 Scope 04'));
  check(scope04Block.length > 0, 'scope04-marker-block-present');
  // Direction must never enter ranking. This is the check that stops "most bullish" from winning.
  check(!/\bdirection\b/.test(scope04Block.slice(scope04Block.indexOf('function tadRankCandidates'), scope04Block.indexOf('function tadBuildUnifiedRead'))), 'scope04-ranking-never-reads-direction');
  check(config.setupDefinitions.every((setup) => (setup.mandatoryGateIds || []).every((gateId) => ['primary', 'regime', 'location', 'trigger', 'validation-risk-process'].includes(gateId))), 'scope04-setup-mandatory-gate-ids-closed');
  // A setup that can trigger must declare all five mandatory gates. A watch-only setup declares
  // no trigger events, so it legitimately declares the subset that applies and can never trigger.
  check(config.setupDefinitions.every((setup) => setup.triggerEvents.length === 0 || (setup.mandatoryGateIds || []).length === 5), 'scope04-triggerable-setups-declare-all-five-mandatory-gates');
  check(config.setupDefinitions.every((setup) => setup.triggerEvents.length > 0 || ((setup.mandatoryGateIds || []).indexOf('trigger') < 0 && (setup.mandatoryGateIds || []).indexOf('validation-risk-process') < 0)), 'scope04-watch-only-setups-declare-no-trigger-gate');

  // Scope 03 config contract: every setup definition must be fully specified and closed against
  // the registries it references, so a definition can never point at something that is not there.
  const setups = config.setupDefinitions;
  check(Array.isArray(setups) && setups.length === 8 && setups.length <= config.limits.maximumSetupDefinitions, 'scope03-setup-definition-count');
  check(setups.every((setup) => typeof setup.setupDefinitionId === 'string' && /\/v\d+$/.test(setup.setupDefinitionId) && typeof setup.version === 'string'), 'scope03-setup-definition-versioned-ids');
  check(new Set(setups.map((setup) => setup.setupDefinitionId)).size === setups.length, 'scope03-setup-definition-ids-unique');
  check(setups.every((setup) => Array.isArray(setup.prerequisites) && Array.isArray(setup.armedCondition) && Array.isArray(setup.triggerEvents)
    && typeof setup.invalidation === 'string' && Array.isArray(setup.naturalTargetSelectors)
    && typeof setup.expiry === 'string' && typeof setup.evaluationHorizon === 'string'
    && Array.isArray(setup.mandatoryGateIds) && typeof setup.costRequirement === 'string'), 'scope03-setup-definition-required-predicates');
  check(setups.every((setup) => (setup.requiredFamilyIds || []).concat(setup.optionalFamilyIds || []).every((familyId) => config.evidenceFamilies.some((family) => family.familyId === familyId))), 'scope03-setup-family-reference-parity');
  check(setups.every((setup) => (setup.supportedProfileIds || []).every((profileId) => config.timeframeProfiles.some((profile) => profile.profileId === profileId))), 'scope03-setup-profile-reference-parity');
  check(setups.every((setup) => (setup.claimIds || []).every((claimId) => config.claimLedger.some((record) => record.claimId === claimId))), 'scope03-setup-claim-reference-parity');
  const rejectedClaimIds = config.claimLedger.filter((record) => record.verdict === 'rejected').map((record) => record.claimId);
  check(setups.every((setup) => (setup.claimIds || []).every((claimId) => !rejectedClaimIds.includes(claimId))), 'scope03-no-setup-cites-a-rejected-claim');
  check(setups.every((setup) => Object.values(setup.parameterBounds || {}).every((bound) => typeof bound.min === 'number' && typeof bound.max === 'number' && bound.min <= bound.max && typeof bound.step === 'number' && bound.step > 0)), 'scope03-setup-parameter-bounds-well-formed');
  // A trigger-bearing setup must also declare where it can go: targets and an invalidation.
  check(setups.every((setup) => setup.triggerEvents.length === 0 || (setup.naturalTargetSelectors.length > 0 && setup.invalidation.length > 0)), 'scope03-triggerable-setups-declare-targets-and-invalidation');
  check(setups.every((setup) => setup.triggerEvents.every((event) => /^(closed|time-distance)-/.test(event))), 'scope03-trigger-events-are-closed-or-acceptance-events');

  // The confluence label is a hard-coded literal so it can never drift into book/order language.
  check(/var TAD_CONFLUENCE_LABEL = "historical\/model level confluence";/.test(pageSource), 'scope03-confluence-label-is-a-fixed-literal');
  const scope03Block = pageSource.slice(pageSource.indexOf('Feature 007 Scope 03: levels'), pageSource.indexOf('End Feature 007 Scope 03'));
  check(scope03Block.length > 0 && !/order.?book|resting liquidity|liquidity (pool|heatmap|map)|stop.?hunt|smart money/i.test(scope03Block), 'scope03-no-order-book-or-liquidity-language');
  // The transition graph must stay exactly as designed; a stray edge would let ARMED be skipped.
  check(/SCANNING: \["NO_EDGE", "WATCH"\]/.test(pageSource) && /WATCH: \["ARMED", "NO_EDGE", "EXPIRED"\]/.test(pageSource)
    && /ARMED: \["TRIGGERED", "WATCH", "INVALIDATED", "EXPIRED"\]/.test(pageSource)
    && /TRIGGERED: \["INVALIDATED", "EXPIRED", "COMPLETED_EVALUATION"\]/.test(pageSource)
    && /INVALIDATED: \[\], EXPIRED: \[\], COMPLETED_EVALUATION: \[\]/.test(pageSource), 'scope03-candidate-transition-graph-exact');
  check(/var TAD_TERMINAL_STATES = \["INVALIDATED", "EXPIRED", "COMPLETED_EVALUATION"\];/.test(pageSource), 'scope03-terminal-states-exact');

  // Every committed technique must dispatch through the closed map and answer inside its own
  // declared vocabulary. A formula that drifts from its contract fails here, not in front of a reader.
  const scope02Bars = (() => {
    const rows = [];
    let price = 100;
    for (let i = 0; i < 260; i += 1) {
      price = price * (1 + ((i % 7) - 3) / 1000) + 0.05;
      const open = price, close = price * (1 + ((i % 5) - 2) / 1000);
      rows.push({ barId: 'b' + i, interval: '1d', sessionId: 's', openedAt: new Date(Date.UTC(2025, 0, 1 + i)).toISOString(), closedAt: new Date(Date.UTC(2025, 0, 1 + i, 20)).toISOString(), availableAt: new Date(Date.UTC(2025, 0, 1 + i, 21)).toISOString(), o: open, h: Math.max(open, close) * 1.006, l: Math.min(open, close) * 0.994, c: close, v: 1000 + (i % 11) * 50, adjustmentPolicyId: 'a', status: 'closed', expectedDurationMs: 1, actualDurationMs: 1, qualityFlags: [], sourceRowIds: ['r' + i] });
    }
    return rows;
  })();
  const scope02Series = [
    { id: 'base', rows: scope02Bars.map((bar, i) => ({ closedAt: bar.closedAt, c: bar.c * (1 + i * 0.001) })), adjustmentPolicyId: 'a', sessionContractId: 's' },
    { id: 'peer', rows: scope02Bars.map((bar) => ({ closedAt: bar.closedAt, c: bar.c })), adjustmentPolicyId: 'a', sessionContractId: 's' }
  ];
  const scope02Outcomes = config.techniques.map((definition) => tad.tadEvaluateTechnique(definition, definition.techniqueId === 'relative-strength/v1' ? { series: scope02Series } : { bars: scope02Bars }, config.claimLedger));
  check(scope02Outcomes.length === config.techniques.length && scope02Outcomes.every((outcome, index) => outcome.ok && config.techniques[index].outputVocabulary.includes(outcome.status)), 'scope02-technique-output-vocabulary-parity');
  check(scope02Outcomes.every((outcome, index) => outcome.familyId === config.techniques[index].familyId && outcome.clusterId === config.techniques[index].clusterId), 'scope02-technique-family-cluster-parity');
  check(config.techniques.every((definition) => definition.claimIds.every((claimId) => config.claimLedger.some((record) => record.claimId === claimId))), 'scope02-technique-claim-reference-parity');
  check(config.techniques.every((definition) => config.evidenceFamilies.some((family) => family.familyId === definition.familyId)), 'scope02-technique-family-reference-parity');
  check(config.claimLedger.every((record) => ['supported', 'bounded', 'rejected'].includes(record.verdict) && record.grounding && record.evidenceTier && record.scope && record.limitation && record.allowedTreatment), 'scope02-claim-ledger-record-completeness');
  const rejectedClaim = config.claimLedger.find((record) => record.verdict === 'rejected');
  const rejectedDefinition = JSON.parse(JSON.stringify(config.techniques[0]));
  rejectedDefinition.claimIds = [rejectedClaim.claimId];
  check(!tad.tadEvaluateTechnique(rejectedDefinition, { bars: scope02Bars }, config.claimLedger).ok, 'scope02-rejected-claim-cannot-activate-a-technique');
  const injectedDefinition = JSON.parse(JSON.stringify(config.techniques[0]));
  injectedDefinition.techniqueId = 'injected/v1';
  check(!tad.tadEvaluateTechnique(injectedDefinition, { bars: scope02Bars }, config.claimLedger).ok, 'scope02-unknown-technique-id-refused');
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

  // ---------- Scope 05: owner publication and strict adapters ----------
  // Six capabilities, six owner pages, one marker-bounded publisher each. The inventory is
  // derived from this map so adding a seventh publisher without registering it fails here.
  const scope05Owners = {
    'swing-structure/v1': 'swing-structure-lab.html',
    'intraday-auction/v1': 'intraday-tape-lab.html',
    'options-positioning/v1': 'options-structure-lab.html',
    'gamma-playbook/v1': 'gamma-trading-lab.html',
    'market-breadth/v1': 'market-heatmap-lab.html',
    'relative-context/v1': 'sector-research-lab.html'
  };
  const scope05Capabilities = Object.keys(scope05Owners);
  check(scope05Capabilities.length === 6 && new Set(Object.values(scope05Owners)).size === 6, 'scope05-owner-matrix-6-distinct-pages');
  const scope05Nested = ['contractVersion', 'capabilityVersion', 'ownerId', 'resultId', 'sourceSetId', 'symbol',
    'sessionContractId', 'decisionCutoff', 'truthState', 'closedCoverage', 'provisionalCoverage', 'payload', 'limitations'];
  scope05Capabilities.forEach((capability) => {
    const ownerSource = read(scope05Owners[capability]);
    const escaped = capability.replace('/', '\\/');
    check(matchCount(ownerSource, new RegExp(`Feature 007 owner read: ${escaped}`, 'g')) === 2, `scope05-marker-pair-${capability.replace(/[^a-z0-9]/gi, '-')}`);
    const start = ownerSource.indexOf(`Feature 007 owner read: ${capability}`);
    const block = ownerSource.slice(start, ownerSource.indexOf(`End Feature 007 owner read: ${capability}`));
    check(block.length > 0 && /rl-ta-owner-read\/v1/.test(block), `scope05-nested-contract-${capability.replace(/[^a-z0-9]/gi, '-')}`);
    check(scope05Nested.every((key) => new RegExp(`\\b${key}\\s*:`).test(block)), `scope05-nested-keys-complete-${capability.replace(/[^a-z0-9]/gi, '-')}`);
    check(new RegExp(`capabilityVersion:\\s*["']${escaped}["']`).test(block), `scope05-capability-discriminator-${capability.replace(/[^a-z0-9]/gi, '-')}`);
    // A publisher may only READ owner state. It must not fetch, mutate storage, or call a formula
    // that belongs to another page; a publisher that fetched would make the owner's own render
    // depend on the network for a downstream consumer's benefit.
    check(!/\bfetch\s*\(|XMLHttpRequest|localStorage\.setItem|sessionStorage\.setItem|import\s*\(/.test(block), `scope05-publisher-read-only-${capability.replace(/[^a-z0-9]/gi, '-')}`);
    check(/limitations:\s*(?:\[|[A-Za-z0-9_$.]+\s*\?)/.test(block), `scope05-limitations-declared-${capability.replace(/[^a-z0-9]/gi, '-')}`);
  });

  // The two option owners apply the dealer convention at different points. Each must declare
  // signApplied so a consumer never has to guess, and never re-signs an already-signed snapshot.
  const optionsBlock = (() => { const s = read('options-structure-lab.html'); return s.slice(s.indexOf('Feature 007 owner read: options-positioning/v1'), s.indexOf('End Feature 007 owner read: options-positioning/v1')); })();
  const gammaBlock = (() => { const s = read('gamma-trading-lab.html'); return s.slice(s.indexOf('Feature 007 owner read: gamma-playbook/v1'), s.indexOf('End Feature 007 owner read: gamma-playbook/v1')); })();
  check(/signApplied:\s*true/.test(optionsBlock), 'scope05-options-sign-applied-true');
  check(/signApplied:\s*false/.test(gammaBlock), 'scope05-gamma-sign-applied-false');
  check(/signConventionId:/.test(optionsBlock) && /signConventionId:/.test(gammaBlock), 'scope05-sign-convention-id-declared-both');
  // Neither publisher may multiply by a sign factor: that would re-sign what the owner already signed.
  check(!/signMul|\*\s*-1\b|\?\s*-1\s*:\s*1/.test(optionsBlock) && !/signMul|\*\s*-1\b|\?\s*-1\s*:\s*1/.test(gammaBlock), 'scope05-no-publisher-re-signing');
  // Option eligibility travels with its snapshot clocks, coverage, liquidity filter and assumptions.
  check(['snapshotClocks', 'expirationCoverage', 'liquidityFilters', 'assumptions'].every((key) => new RegExp(`\\b${key}:`).test(optionsBlock)), 'scope05-option-eligibility-contract-complete');
  // Absence is published as absence. A publisher that emitted 0 here would look like flat gamma.
  check(/snapshotAvailable/.test(optionsBlock) && /levels:\s*f7Have\s*\?/.test(optionsBlock) && /aggregates:\s*f7Have\s*\?/.test(optionsBlock), 'scope05-option-absence-is-null-not-zero');

  // The Feature 007 page admits published reads. It never reaches into an owner page.
  // Comments are stripped: prose that NAMES the forbidden act is documentation, not the act.
  const scope05Code = pageSource.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
  check(!/iframe|contentWindow|importScripts|postMessage/.test(scope05Code), 'scope05-no-cross-page-reach');
  const scope05Block = pageSource.slice(pageSource.indexOf('Feature 007 Scope 05: owner publication'), pageSource.lastIndexOf('End Feature 007 Scope 05: owner publication'));
  check(scope05Block.length > 0, 'scope05-marker-block-present');
  check(scope05Names.every((name) => scope05Block.includes(`function ${name}(`)), 'scope05-adapters-inside-marker-block');
  check(/tadValidateOwnerRead\(/.test(scope05Block), 'scope05-reuses-scope01-owner-validator');
  // Feature 006 stays read-only: accepted by contract match, never reconstructed.
  check(/tdc-tool-read\/v1/.test(scope05Block) && /TAD-F006-ABSENT/.test(scope05Block), 'scope05-feature006-adapter-strict');
  check(!/tdcBuild|tdcCompute|RLTRENDDYNAMICS/.test(pageSource), 'scope05-feature006-read-only');
  // Strategy Validation keeps its Scope 01 parity and gains no nested passport in this scope.
  const scope05ValidationSource = read('strategy-validation-lab.html');
  check(!/rl-ta-owner-read\/v1/.test(scope05ValidationSource) && !/Feature 007 owner read/.test(scope05ValidationSource), 'scope05-strategy-validation-read-only');
  // Microstructure contracts must stay unsatisfiable by OHLCV or an option snapshot.
  check(/hasTickVolumeAtPrice/.test(scope05Block) && /hasBidAskOrAggressor/.test(scope05Block)
    && /hasTimestampedFullBookEvents/.test(scope05Block) && /hasSizePriceTimeClassification/.test(scope05Block), 'scope05-microstructure-contracts-explicit');
  const ownerFixture = json('tests/fixtures/technical-analysis-decision/analytic/owner-publication.json');
  check(ownerFixture.microstructureRequests.length === 3 && ownerFixture.microstructureRequests.every((request) => ['ohlcv-bars', 'option-chain-snapshot'].includes(request.offered.kind)), 'scope05-microstructure-fixture-offers-proxies-only');
  check(Object.keys(ownerFixture.situations).length === 5, 'scope05-owner-fixture-situations-5');
  check(ownerFixture.situations.complete.ownerReads.length === 6
    && scope05Capabilities.every((capability) => ownerFixture.situations.complete.ownerReads.some((entry) => entry.metrics.ownerRead.capabilityVersion === capability)), 'scope05-owner-fixture-covers-every-capability');

  const expectedTitles = [
    'Regression: SCN-007-005 stock four-hour profile exposes session remainder and variant identity',
    'Regression: SCN-007-006 continuous-market four-hour profile has equal session boundaries',
    'Regression: SCN-007-007 provisional weekly break never rewrites confirmed history',
    'Regression: SCN-007-030 failed delta refresh preserves cached source-qualified truth',
    'Regression: Feature 007 qualified series and RLVALID preserve legacy shared behavior',
    'Regression: SCN-007-015 missing option snapshot stays unavailable and never becomes neutral gamma',
    'Regression: SCN-007-016 option flip walls and GEX preserve one inherited convention',
    'Regression: SCN-007-017 OHLCV leaves footprint depth and large-trade modules unavailable',
    'Regression: SCN-007-024 daily-only read stays useful while tactical evidence remains unavailable',
    'Regression: Feature 007 owner integrations preserve source cutoffs limitations and existing reads'
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