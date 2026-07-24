import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addValidOrdinaryTool,
  clone,
  expectError,
  loadProductionApi,
  makeConfig,
  makeFoundationPacket,
  readProductionSource
} from './tool-experience.support.mjs';

test('SCN-012-033 dual-runtime canonical fingerprint is stable and browser-safe', () => {
  const api = loadProductionApi();
  const value = { b: 2, a: 1 };
  assert.equal(api.canonicalize(value), '{"a":1,"b":2}');
  assert.equal(api.fingerprint(value), 'sha256:43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777');

  const root = {};
  const browserApi = Function('globalThis', 'module', `${readProductionSource()}\nreturn globalThis.RLEXPERIENCE;`)(root, undefined);
  assert.equal(Object.isFrozen(browserApi), true);
  assert.equal(browserApi.fingerprint(value), api.fingerprint(value));
  assert.equal(root.RLEXPERIENCE, browserApi);
});

test('SCN-012-033 config contract rejects unknown versions fields view order and unsafe modules', () => {
  const api = loadProductionApi();
  assert.equal(api.validateConfig(makeConfig()).ok, true);

  const unknownVersion = makeConfig();
  unknownVersion.contractVersion = 'tool-experience-config/v2';
  expectError(api.validateConfig(unknownVersion), 'E012-VERSION', '$.contractVersion');

  const unknownField = makeConfig();
  unknownField.unplanned = true;
  expectError(api.validateConfig(unknownField), 'E012-REGISTRY', '$.unplanned');

  const wrongViewOrder = makeConfig();
  wrongViewOrder.viewSets['ordinary-four-view/v1'].viewIds = ['power', 'simple', 'brief', 'journey'];
  expectError(api.validateConfig(wrongViewOrder), 'E012-VIEWSET', '$.viewSets.ordinary-four-view/v1.viewIds');

  const unsafeModule = makeConfig();
  unsafeModule.adapterPolicy.moduleAllowlist.push('../escape.js');
  expectError(api.validateConfig(unsafeModule), 'E012-REGISTRY', '$.adapterPolicy.moduleAllowlist[7]');
});

test('SCN-012-033 model definitions reject invalid parameters seed policy duplicates and unknown fields', () => {
  const api = loadProductionApi();
  const packet = makeFoundationPacket();
  assert.equal(api.validateSimpleModelRegistry(packet.models, packet.config).ok, true);

  const invalidDefault = clone(packet.models);
  invalidDefault.definitions[0].parameterDefinitions[0].defaultValue = 11;
  expectError(api.validateSimpleModelRegistry(invalidDefault, packet.config), 'E012-SIMPLE-DEFINITION', '$.definitions[0].parameterDefinitions[0].defaultValue');

  const invalidSeed = clone(packet.models);
  invalidSeed.definitions[0].seedPolicy.required = true;
  expectError(api.validateSimpleModelRegistry(invalidSeed, packet.config), 'E012-SIMPLE-DEFINITION', '$.definitions[0].seedPolicy');

  const duplicate = clone(packet.models);
  duplicate.definitions.push(clone(duplicate.definitions[0]));
  expectError(api.validateSimpleModelRegistry(duplicate, packet.config), 'E012-SIMPLE-DEFINITION', '$.definitions[2].definitionId');

  const unknownField = clone(packet.models);
  unknownField.definitions[0].parameterDefinitions[0].decorative = true;
  expectError(api.validateSimpleModelRegistry(unknownField, packet.config), 'E012-SIMPLE-DEFINITION', '$.definitions[0].parameterDefinitions[0].decorative');
});

test('SCN-012-033 Journey definitions reject unresolved steps mechanisms execution and unknown fields', () => {
  const api = loadProductionApi();
  const packet = makeFoundationPacket();
  assert.equal(api.validateJourneyRegistry(packet.journeys, packet.config).ok, true);

  const unresolved = clone(packet.journeys);
  unresolved.definitions[0].stepIds = ['journey/missing/step'];
  expectError(api.validateJourneyRegistry(unresolved, packet.config), 'E012-JOURNEY-DEFINITION', '$.definitions[0].stepIds[0]');

  const mechanism = clone(packet.journeys);
  mechanism.definitions[0].mechanism = 'free-form-script';
  expectError(api.validateJourneyRegistry(mechanism, packet.config), 'E012-JOURNEY-DEFINITION', '$.definitions[0].mechanism');

  const execution = clone(packet.journeys);
  execution.definitions[0].noExecution = false;
  expectError(api.validateJourneyRegistry(execution, packet.config), 'E012-JOURNEY-DEFINITION', '$.definitions[0].noExecution');

  const unknownField = clone(packet.journeys);
  unknownField.steps[0].javascript = 'return true';
  expectError(api.validateJourneyRegistry(unknownField, packet.config), 'E012-JOURNEY-DEFINITION', '$.steps[0].javascript');
});

test('SCN-012-033 dependency predicates require mechanical state and project exact withheld capabilities', () => {
  const api = loadProductionApi();
  const config = makeConfig();
  const narrativeOnly = {
    BUG004: { status: 'in_progress', summary: 'all browser evidence passed' },
    FEATURE002: { status: 'done', certification: { status: 'not_started' }, summary: 'publication complete' },
    FEATURE008: { status: 'done', certification: { status: 'done' }, milestones: ['rlportfolio-store-privacy'] }
  };
  const rejected = api.evaluateDependencyGates(config, narrativeOnly);
  assert.equal(rejected.ok, true);
  assert.equal(rejected.value.every((item) => item.satisfied === false), true);
  assert.deepEqual(rejected.value.find((item) => item.gateId === 'feature-002').withheldCapabilities, ['dynamic-tool-brief-v2', 'live-web-evidence', 'public-alert-publication']);
  assert.deepEqual(rejected.value.find((item) => item.gateId === 'feature-008').preservedCapabilities, ['public-watchlist-matrix', 'public-scope-journeys']);

  const certified = {
    BUG004: { status: 'done', certification: { status: 'done' }, evidenceIds: ['TP-09', 'TP-12'] },
    FEATURE002: { status: 'done', certification: { status: 'done' }, milestones: ['current-graph', 'owner-coverage', 'powerless-author', 'atomic-publication'] },
    FEATURE008: { status: 'done', certification: { status: 'done' }, milestones: ['rlportfolio-store-privacy', 'public-evidence-barrier', 'local-brief-ticker-scope'] }
  };
  const accepted = api.evaluateDependencyGates(config, certified);
  assert.equal(accepted.ok, true);
  assert.equal(accepted.value.every((item) => item.satisfied === true), true);
});

test('SCN-012-033 foundation validates references without mutation or a runtime tool-ID list', () => {
  const api = loadProductionApi();
  const packet = makeFoundationPacket();
  const before = api.canonicalize(packet);
  const valid = api.validateFoundation(packet);
  assert.equal(valid.ok, true);
  assert.equal(valid.value.toolCount, 2);
  assert.deepEqual(valid.value.toolIds, ['ordinary-tool', 'market-brief']);
  assert.equal(valid.value.shadowOnly, true);
  assert.deepEqual(valid.value.integrationClaims, []);
  assert.equal(api.canonicalize(packet), before);
  assert.equal(Object.isFrozen(valid.value), true);

  const added = addValidOrdinaryTool(packet);
  const scaled = api.validateFoundation(added);
  assert.equal(scaled.ok, true);
  assert.equal(scaled.value.toolCount, 3);
  assert.equal(scaled.value.toolIds.includes('valid-added-tool'), true);

  const unresolved = clone(packet);
  unresolved.registry.tools[0].experience.simpleModelDefinitionId = 'simple-model/missing/v1';
  expectError(api.validateFoundation(unresolved), 'E012-REGISTRY', '$.tools[0].experience.simpleModelDefinitionId');

  const unknownExperienceField = clone(packet);
  unknownExperienceField.registry.tools[0].experience.visibleCutover = true;
  expectError(api.validateFoundation(unknownExperienceField), 'E012-REGISTRY', '$.tools[0].experience.visibleCutover');
});

test('SCN-012-033 safe error projection exposes only ExperienceError/v1 fields', () => {
  const api = loadProductionApi();
  const error = api.projectError({
    code: 'E012-REGISTRY',
    phase: 'registry',
    toolId: 'ordinary-tool',
    contractId: 'tool-experience/v1',
    reason: 'invalid declaration',
    fieldPath: '$.tools[0].experience',
    recoverable: false,
    dependencyGateId: null,
    secret: 'must-not-appear',
    value: { privateTicker: 'SENTINEL' }
  });
  expectError({ ok: false, error }, 'E012-REGISTRY', '$.tools[0].experience');
  assert.equal(JSON.stringify(error).includes('must-not-appear'), false);
  assert.equal(JSON.stringify(error).includes('SENTINEL'), false);
});