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
  // Scope 06 completes the comparison contract over the foundation's alignment primitive and the
  // Scope 02 relative-strength technique. It derives no new ratio of its own.
  const scope06Names = ['tadComparisonRefusal', 'tadBuildComparisonSet', 'tadEvaluateComparisonRole', 'tadBuildComparisonEvidence'];
  // Scope 07 owns the validation, cost, expectancy, risk-scenario, and process surface. It
  // consumes the RLVALID generic primitives without editing them.
  const scope07Helpers = ['tadValidationRefusal'];
  const scope07Names = ['tadBuildPurgedEvaluation', 'tadSimulateSetupVariant', 'tadApplyCosts', 'tadSummarizeValidation',
    'tadBuildValidationPassport', 'tadAuditExpectancy', 'tadLossStreakScenario', 'tadEvaluateBehaviorGuard'];
  // Scope 08 completes the 65 design-declared symbols with the projection, publication and export builders.
  const scope08Helpers = ['tadExperienceRefusal'];
  const scope08Names = ['tadBuildViewModel', 'tadBuildToolDecisionRead', 'tadBuildExport'];
  const tad = buildFunctions(pageSource, scope01Names.concat(scope02Helpers, scope02Names));
  const physicalTadNames = [...pageSource.matchAll(/function\s+(tad[A-Za-z0-9]+)\s*\(/g)].map((match) => match[1]);
  const declaredNames = scope01Names.concat(scope02Helpers, scope02Names, scope03Helpers, scope03Names, scope04Helpers, scope04Names, scope05Names, scope06Names, scope07Helpers, scope07Names, scope08Helpers, scope08Names);
  check(physicalTadNames.length === declaredNames.length && new Set(physicalTadNames).size === declaredNames.length && scope01Names.every((name) => physicalTadNames.includes(name)), 'scope01-production-declarations-20-exact');
  check(scope02Names.length === 17 && scope02Names.every((name) => physicalTadNames.includes(name)), 'scope02-production-declarations-17-exact');
  check(scope03Names.length === 8 && scope03Names.every((name) => physicalTadNames.includes(name)), 'scope03-production-declarations-8-exact');
  check(scope04Names.length === 8 && scope04Names.every((name) => physicalTadNames.includes(name)), 'scope04-production-declarations-8-exact');
  check(scope05Names.length === 4 && scope05Names.every((name) => physicalTadNames.includes(name)), 'scope05-adapter-declarations-4-exact');
  check(scope06Names.length === 4 && scope06Names.every((name) => physicalTadNames.includes(name)), 'scope06-comparison-declarations-4-exact');
  check(scope07Names.length === 8 && scope07Names.every((name) => physicalTadNames.includes(name)), 'scope07-validation-declarations-8-exact');
  check(scope08Names.length === 3 && scope08Names.every((name) => physicalTadNames.includes(name)), 'scope08-experience-declarations-3-exact');
  // The 65 design-declared symbols are now complete. This is derived from design.md, never a literal.
  const designSymbols = [...read('specs/007-technical-analysis-decision-lab/design.md').matchAll(/\btad[A-Z][A-Za-z0-9]*/g)]
    .map((match) => match[0]).filter((name, index, all) => all.indexOf(name) === index);
  check(designSymbols.length === 65, 'scope08-design-declares-65-symbols');
  check(designSymbols.every((name) => matchCount(pageSource, new RegExp(`function\\s+${name}\\s*\\(`, 'g')) === 1), 'scope08-all-65-symbols-implemented-once');

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

  // ---------- Scope 06: comparison and optional evidence ----------
  const comparisonPolicy = config.comparisonPolicies[0];
  check(config.comparisonPolicies.length === 1 && comparisonPolicy.contractVersion === 'tad-comparison-policy/v1', 'scope06-comparison-policy-contract');
  check(JSON.stringify(comparisonPolicy.roles) === JSON.stringify(['broad-market', 'sector-industry', 'direct-peer', 'optional-context']), 'scope06-comparison-roles-closed-and-ordered');
  check(comparisonPolicy.normalizationId === 'total-return-ratio', 'scope06-normalization-is-total-return-not-raw-price');
  check(Number.isInteger(comparisonPolicy.minimumPeerDenominator) && comparisonPolicy.minimumPeerDenominator >= 3, 'scope06-minimum-peer-denominator-declared');
  check(comparisonPolicy.replacementPolicy === 'never-automatic', 'scope06-replacement-never-automatic');
  check(typeof comparisonPolicy.membershipPolicy === 'string' && /freeze/.test(comparisonPolicy.membershipPolicy), 'scope06-membership-frozen');
  check(config.initialSelection.comparisonPolicyId === comparisonPolicy.comparisonPolicyId, 'scope06-initial-selection-references-committed-policy');
  const scope06Block = pageSource.slice(pageSource.indexOf('Feature 007 Scope 06: comparison and optional evidence'), pageSource.lastIndexOf('End Feature 007 Scope 06: comparison and optional evidence'));
  check(scope06Block.length > 0, 'scope06-marker-block-present');
  check(scope06Names.every((name) => scope06Block.includes(`function ${name}(`)), 'scope06-declarations-inside-marker-block');
  check(/var TAD_COMPARISON_ROLES = \["broad-market", "sector-industry", "direct-peer", "optional-context"\];/.test(pageSource), 'scope06-role-order-exact');
  // Comparison must build on the owned primitives rather than re-deriving a ratio inline.
  check(/tadRelativeStrength\(/.test(scope06Block), 'scope06-reuses-owned-relative-strength');
  check(/tadIdentity\("tad-comparison:/.test(scope06Block) && /tadIdentity\("tad-comparison-membership:/.test(scope06Block), 'scope06-content-addressed-identity');
  // Every behaviour-bearing field must be inside the digest payload, or a change would not
  // change the identity and a stale passport would silently survive it.
  const digestPayload = scope06Block.slice(scope06Block.indexOf('var digestPayload'), scope06Block.indexOf('var membershipDigest'));
  check(['membership', 'normalizationId', 'currencyPolicy', 'sessionPolicy', 'adjustmentPolicy', 'minimumPeerDenominator', 'decisionVintage']
    .every((key) => new RegExp(`\\b${key}:`).test(digestPayload)), 'scope06-identity-covers-every-behaviour-bearing-field');
  // A percentile may only exist at or above the declared minimum.
  check(/denominator >= comparisonSet\.minimumPeerDenominator/.test(scope06Block), 'scope06-percentile-gated-by-denominator');
  check(/excluded\.push\(\{ symbol: member\.symbol, reason: "incompatible-adjustment" \}\)/.test(scope06Block)
    && /reason: "incompatible-session"/.test(scope06Block) && /reason: "incompatible-currency"/.test(scope06Block), 'scope06-incompatibility-reasons-named');
  const comparisonFixture = json('tests/fixtures/technical-analysis-decision/analytic/comparison-roles.json');
  check(Object.keys(comparisonFixture.situations).length === 4, 'scope06-comparison-fixture-situations-4');
  check(comparisonFixture.comparators.length === 8 && comparisonFixture.comparators.some((entry) => entry.adjustmentPolicyId === 'price-only')
    && comparisonFixture.comparators.some((entry) => entry.currencyId === 'EUR'), 'scope06-comparison-fixture-carries-incompatible-comparators');
  check(comparisonFixture.subject.closes.length === 12 && comparisonFixture.comparators.every((entry) => entry.closes.length === 12), 'scope06-comparison-fixture-aligned-lengths');
  // The Dow limitation must remain a committed claim rather than only page prose.
  check(config.claimLedger.some((entry) => /Dow/.test(entry.limitation || '') && /separate market sector and peer/.test(entry.allowedTreatment || '')), 'scope06-dow-limitation-recorded');

  // ---------- Scope 07: validation risk and process ----------
  const validationPolicy = config.validationPolicies[0], costSchema = config.costPolicySchema;
  check(validationPolicy.contractVersion === 'tad-validation-policy/v1', 'scope07-validation-policy-contract');
  check(validationPolicy.selectionEvaluation === 'separate', 'scope07-selection-separated-from-evaluation');
  check(validationPolicy.asOfPolicy === 'available-at-or-before-decision', 'scope07-asof-policy-declared');
  check(validationPolicy.trialPolicy === 'every-behavior-bearing-attempt-counts', 'scope07-every-attempt-counts');
  check(Number.isInteger(validationPolicy.purgeBars) && validationPolicy.purgeBars > 0
    && Number.isInteger(validationPolicy.embargoBars) && validationPolicy.embargoBars > 0, 'scope07-purge-and-embargo-positive');
  check(JSON.stringify(validationPolicy.multiplicityMethods) === JSON.stringify(['benjamini-hochberg', 'holm', 'deflated-sharpe']), 'scope07-three-multiplicity-controls');
  check(JSON.stringify(validationPolicy.statusVocabulary) === JSON.stringify(['supported', 'fragile', 'descriptive-only', 'insufficient', 'rejected', 'unavailable']), 'scope07-status-vocabulary-closed');
  check(costSchema.contractVersion === 'tad-cost-policy-schema/v1' && costSchema.missingComponentPolicy === 'net-unavailable', 'scope07-missing-cost-makes-net-unavailable');
  check(costSchema.components.length === 9 && costSchema.policies[0].zeroTreatment === 'zero-is-an-explicit-observation'
    && costSchema.policies[0].identityBearing === true, 'scope07-cost-components-complete-and-identity-bearing');
  const scope07Block = pageSource.slice(pageSource.indexOf('Feature 007 Scope 07: validation risk and process'), pageSource.lastIndexOf('End Feature 007 Scope 07: validation risk and process'));
  check(scope07Block.length > 0, 'scope07-marker-block-present');
  check(scope07Names.every((name) => scope07Block.includes(`function ${name}(`)), 'scope07-declarations-inside-marker-block');
  check(new RegExp(`var TAD_COST_COMPONENTS = \\[${costSchema.components.map((c) => `"${c}"`).join(', ')}\\];`).test(pageSource), 'scope07-cost-components-match-committed-schema');
  // The page must consume the generic primitives rather than reimplementing the statistics.
  ['rlvBuildPurgedFolds', 'rlvSummarizeOutcomes', 'rlvWilsonInterval'].forEach((primitive) => {
    check(new RegExp(`RLVALID\\.${primitive}\\(`).test(scope07Block), `scope07-uses-generic-${primitive}`);
  });
  check(!/function\s+rlv[A-Z]/.test(pageSource), 'scope07-no-local-copy-of-a-generic-primitive');
  // Net can never borrow gross, and a missing component can never be read as a stated zero.
  check(/netAvailable: false/.test(scope07Block) && /netR: null/.test(scope07Block), 'scope07-missing-cost-yields-null-net');
  check(/netExpectancy: netExpectancy/.test(scope07Block) && /costed\.netAvailable\s*\n?\s*\?/.test(scope07Block), 'scope07-net-expectancy-gated-by-cost-completeness');
  // The published expectancy equation must stay reproducible from the page itself.
  check(/E = p\*W - \(1-p\)\*L; total = E\*N/.test(scope07Block), 'scope07-expectancy-equation-published');
  check(/l \/ \(w \+ l\)/.test(scope07Block), 'scope07-breakeven-from-configured-payoff');
  check(/Math\.pow\(1 - riskFraction, length\)/.test(scope07Block), 'scope07-loss-streak-compounds');
  // The process guard must not diagnose emotion, intent, or suitability.
  check(/inferredEmotion: null/.test(scope07Block) && /inferredIntent: null/.test(scope07Block)
    && /suitabilityAssessed: false/.test(scope07Block) && /basis: "observable-plan-deviation-only"/.test(scope07Block), 'scope07-process-guard-observable-only');
  check(!/\b(fear|greed|panic|revenge|emotional state)\b/i.test(scope07Block.replace(/\/\/.*$/gm, '')), 'scope07-no-emotional-vocabulary-in-process-code');
  const validationFixture = json('tests/fixtures/technical-analysis-decision/analytic/validation-risk-process.json');
  check(validationFixture.transcriptClaim.winRate === 0.71 && validationFixture.transcriptClaim.averageWinR === 6
    && validationFixture.transcriptClaim.averageLossR === 1.8 && validationFixture.transcriptClaim.tradeCount === 50, 'scope07-transcript-fixture-matches-scenario');
  check(validationFixture.observations.length >= 100, 'scope07-validation-fixture-has-enough-history');
  check(validationFixture.costPolicies.complete && validationFixture.costPolicies.incomplete, 'scope07-validation-fixture-carries-both-cost-policies');
  // Long validation runs as yielding work units with latest-run identity and a cancellation that
  // commits nothing. The runner is impure, so it is deliberately NOT one of the eight pure symbols.
  const runnerBlock = pageSource.slice(pageSource.indexOf('Feature 007 Scope 07 runtime: deterministic work units'), pageSource.lastIndexOf('End Feature 007 Scope 07 runtime: deterministic work units'));
  check(runnerBlock.length > 0 && /var tadValidationRunner = \{/.test(runnerBlock), 'scope07-work-unit-runner-present');
  check(/setTimeout\(function \(\) \{ step\(index \+ 1\); \}, 0\)/.test(runnerBlock), 'scope07-work-units-yield-between-units');
  check(/self\.activeRunId !== runId/.test(runnerBlock), 'scope07-latest-run-identity-enforced');
  check(/cancelled: true, committed: self\.committed/.test(runnerBlock), 'scope07-cancelled-run-preserves-prior-commit');
  check(!/function\s+tadValidationRunner/.test(pageSource) && !physicalTadNames.includes('tadValidationRunner'), 'scope07-runner-is-not-a-pure-symbol');

  // ---------- Scope 08: experience publication and registration ----------
  const scope08Block = pageSource.slice(pageSource.indexOf('Feature 007 Scope 08: experience publication'), pageSource.lastIndexOf('End Feature 007 Scope 08: experience publication'));
  check(scope08Block.length > 0, 'scope08-marker-block-present');
  check(scope08Names.every((name) => scope08Block.includes(`function ${name}(`)), 'scope08-declarations-inside-marker-block');
  // Display state must be outside the projection identity, or the two modes could diverge.
  const identityCall = scope08Block.slice(scope08Block.indexOf('model.projectionIdentity = tadIdentity'), scope08Block.indexOf('return tadDeepFreeze({ ok: true, errors: [], viewModel'));
  check(identityCall.length > 0 && !/\bdisplay\b/.test(identityCall), 'scope08-display-state-excluded-from-identity');
  check(/resultIdentity: model\.resultIdentity/.test(identityCall) && /truth: model\.truth/.test(identityCall), 'scope08-identity-covers-result-and-truth');
  check(/TAD-TOOLREAD-INCOMPLETE/.test(scope08Block), 'scope08-incomplete-run-never-published');
  check(/if \(tadIsFinite\(pair\[1\]\)\) numeric\[pair\[0\]\] = pair\[1\];/.test(scope08Block), 'scope08-non-finite-metric-omitted');
  check(/var TAD_SENSITIVE_KEYS = \[/.test(pageSource) && ['credential', 'token', 'holdings', 'account', 'costBasis', 'pnl', 'privateNote']
    .every((key) => new RegExp(`"${key}`, 'i').test(pageSource.slice(pageSource.indexOf('var TAD_SENSITIVE_KEYS'), pageSource.indexOf('var TAD_SENSITIVE_KEYS') + 600))), 'scope08-sensitive-key-list-complete');
  check(/omitted\.push\(path \+ "\." \+ key\)/.test(scope08Block), 'scope08-export-reports-what-it-withheld');
  check(/educationalOnly: true/.test(scope08Block), 'scope08-educational-marker-published');
  // Simple/Power shell, accessibility and responsive contracts.
  check(/id="modeSeg"/.test(pageSource) && /data-mode="simple"/.test(pageSource) && /data-mode="power"/.test(pageSource), 'scope08-mode-segment-present');
  check(/\.band\.pw \{\s*display: none;/.test(pageSource) && /body\.power \.band\.pw \{\s*display: block;/.test(pageSource), 'scope08-simple-is-default-power-hidden');
  check(/RLCHART\.attach\(/.test(pageSource), 'scope08-canvas-attaches-hover-contract');
  check(/id="simpleGateTable"/.test(pageSource) && /class="a11y-table"/.test(pageSource), 'scope08-canvas-has-equivalent-accessible-table');
  check(/prefers-reduced-motion/.test(pageSource), 'scope08-reduced-motion-honoured');
  check(/@media \(max-width: 600px\)/.test(pageSource), 'scope08-single-column-below-600px');
  check(/min-height: 44px/.test(pageSource), 'scope08-44px-touch-targets');
  // Registration parity, derived rather than asserted from a literal list.
  const toolsRegistry = json('tools.json');
  const toolEntries = Array.isArray(toolsRegistry) ? toolsRegistry : toolsRegistry.tools;
  const toolIds = toolEntries.map((entry) => entry.id);
  const registered = toolEntries.filter((entry) => entry.id === 'technical-analysis-decision-lab')[0];
  check(!!registered && registered.file === 'technical-analysis-decision-lab.html'
    && registered.notes === 'notes/technical-analysis-decision-lab.md'
    && registered.data === 'technical-analysis-decision-universe.json' && registered.status === 'live', 'scope08-tools-json-entry-exact');
  const indexSource = read('index.html'), navSource = read('rlnav.js');
  const indexIds = [...indexSource.matchAll(/^\s*id: '([a-z0-9-]+)',$/gm)].map((match) => match[1]);
  const navIds = [...navSource.matchAll(/file: "([a-z0-9.-]+)\.html"/g)].map((match) => match[1]);
  check(toolIds.every((id) => indexIds.includes(id)) && toolIds.every((id) => navIds.includes(id)), 'scope08-no-stale-registry-reference');
  const byIndex = toolIds.slice().sort((left, right) => indexIds.indexOf(left) - indexIds.indexOf(right));
  const byNav = toolIds.slice().sort((left, right) => navIds.indexOf(left) - navIds.indexOf(right));
  check(JSON.stringify(toolIds) === JSON.stringify(byIndex) && JSON.stringify(toolIds) === JSON.stringify(byNav), 'scope08-registry-order-equal');
  // Shared script order.
  const scriptOrder = ['rldata.js', 'rlapp.js', 'rlg.js', 'rlvalidation.js', 'rlchart.js', 'rlticker.js'].map((file) => pageSource.indexOf(`src="${file}"`));
  check(scriptOrder.every((position) => position > 0) && scriptOrder.every((position, index) => index === 0 || position > scriptOrder[index - 1]), 'scope08-shared-script-order-exact');
  check(pageSource.indexOf('src="rlnav.js"') > pageSource.indexOf('src="rlapp.js"'), 'scope08-rlnav-loads-last');
  // Note handoff resolves every referenced path and command.
  const noteSource = read('notes/technical-analysis-decision-lab.md');
  ['technical-analysis-decision-lab.html', 'technical-analysis-decision-universe.json', 'tools.json', 'rlnav.js']
    .forEach((reference) => check(noteSource.includes(reference), `scope08-note-references-${reference.replace(/[^a-z0-9]/gi, '-')}`));
  ['node scripts/selftest.mjs', 'node scripts/validate-technical-analysis-decision.mjs', 'node scripts/audit-reader-legibility.mjs']
    .forEach((command) => check(noteSource.includes(command), `scope08-note-declares-${command.split('/').pop().replace(/[^a-z0-9]/gi, '-')}`));

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
    'Regression: Feature 007 owner integrations preserve source cutoffs limitations and existing reads',
    'Regression: SCN-007-014 market sector and peer roles expose relative weakness separately',
    'Regression: SCN-007-028 comparison membership change creates a new variant and preserves prior validation',
    'Regression: SCN-007-018 explicit costs separate gross and net expectancy and breakeven',
    'Regression: SCN-007-019 expectancy audit computes 186',
    'Regression: SCN-007-020 changed setup parameters create descriptive-only identity without inherited passport',
    'Regression: SCN-007-021 chase distance blocks the frozen plan without diagnosing emotion',
    'Regression: SCN-007-023 Simple and Power preserve one result with zero display-mode requests',
    'Regression: SCN-007-029 invalid configuration preserves last valid identity and corrects without refetch',
    'Regression: SCN-007-023 mobile keyboard tables and background-tab canvases remain equivalent',
    'Regression: SCN-007-029 truth recovery preserves last valid identity across source and method failures',
    'Regression: SCN-007-023 registration navigation and state-faithful owner publication stay in parity',
    'Regression: SCN-007-023 imported labels stay text and sanitized export omits sensitive state'
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