import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { clone, readJson, loadProductionApi } from './tool-experience.support.mjs';

/*
 * TP-08-02 — Registry definitions functional test (tests/journey-definitions.functional.mjs).
 *
 * Proves SCN-012-032: the registry-derived inventory (tools.json) resolves, through
 * the rljourney runtime, to concrete Journey goals for every registered tool —
 * every ordinary tool has at least two concrete goals plus a mechanism, the Market
 * Action Center (market-brief) maps to exactly four explicit global goals, and no
 * generic / example-only / missing goal row survives. The static definition/step
 * schema remains single-sourced in rlexperience.js and is cross-checked here.
 */

const require = createRequire(import.meta.url);
const RLJOURNEY_URL = new URL('../rljourney.js', import.meta.url);

function loadJourneyApi() {
  assert.equal(existsSync(RLJOURNEY_URL), true, 'production runtime missing: rljourney.js');
  const path = RLJOURNEY_URL.pathname;
  delete require.cache[require.resolve(path)];
  return require(path);
}

const RJ = loadJourneyApi();

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code} ${result.error.fieldPath} ${result.error.reason}`);
  return result.value;
}

function requireError(result, code) {
  assert.equal(result.ok, false, 'expected a refusal');
  assert.equal(RJ.REFUSAL_CODES.includes(result.error.code), true, `refusal code ${result.error.code} must be closed`);
  if (code) assert.equal(result.error.code, code, `${result.error.fieldPath} ${result.error.reason}`);
  return result.error;
}

/* Inventory derived from the production tool registry (tools.json). */
function registryInventory() {
  const registry = readJson('tools.json');
  const tools = registry.tools;
  return tools.map((tool) => ({
    registryId: tool.id,
    kind: tool.experience.kind,
    journeyDefinitionIds: tool.experience.journeyDefinitionIds.slice()
  }));
}

function journeyRegistry() {
  return readJson('journeys.json');
}

test('TP-08-02 SCN-012-032 every registered tool resolves concrete Journey goals through the runtime', () => {
  const inventory = registryInventory();
  const registry = journeyRegistry();
  const summary = requireValue(RJ.validateRegistryCompleteness(registry, inventory));
  assert.equal(summary.centerGoals, 4, 'Market Action Center must expose exactly four global goals');
  assert.equal(summary.ordinaryTools, 26, 'twenty-six ordinary tools must resolve');
  assert.equal(summary.totalGoals, 56, 'twenty-six ordinary tools x2 goals plus four Center goals');
  assert.equal(summary.definitionCount, 56, 'the journey registry defines exactly 56 goals');
});

test('TP-08-02 SCN-012-032 each ordinary tool has at least two concrete same-tool goals with a mechanism', () => {
  const inventory = registryInventory();
  const registry = journeyRegistry();
  const compiled = requireValue(RJ.compileRegistry(registry));

  const ordinary = inventory.filter((row) => row.kind === 'ordinary');
  assert.equal(ordinary.length, 26);
  const center = inventory.filter((row) => row.kind === 'market-action-center');
  assert.equal(center.length, 1);
  assert.equal(center[0].registryId, 'market-brief');

  for (const row of ordinary) {
    assert.ok(row.journeyDefinitionIds.length >= 2, `${row.registryId} needs at least two goals`);
    const goals = new Set();
    for (const definitionId of row.journeyDefinitionIds) {
      const definition = compiled.definitions[definitionId];
      assert.notEqual(definition, undefined, `${definitionId} must resolve`);
      assert.equal(definition.toolId, row.registryId, `${definitionId} must belong to ${row.registryId}`);
      assert.ok(RJ.MECHANISMS.includes(definition.mechanism), `${definitionId} needs a valid mechanism`);
      assert.ok(definition.evidenceRequiredSlots.length >= 1, `${definitionId} needs an evidence slot`);
      assert.ok(definition.completionPredicates.length >= 1, `${definitionId} needs a completion predicate`);
      assert.ok(definition.order.length >= 1, `${definitionId} needs at least one step`);
      assert.equal(definition.noExecution, true, `${definitionId} must declare noExecution`);
      goals.add(definition.goalId);
    }
    assert.equal(goals.size, row.journeyDefinitionIds.length, `${row.registryId} goals must be distinct`);
  }
});

test('TP-08-02 SCN-012-032 market-brief maps to the four exact Market Action Center goals', () => {
  const inventory = registryInventory();
  const compiled = requireValue(RJ.compileRegistry(journeyRegistry()));
  const center = inventory.find((row) => row.registryId === 'market-brief');
  assert.equal(center.journeyDefinitionIds.length, 4);
  const goalIds = center.journeyDefinitionIds.map((definitionId) => {
    const definition = compiled.definitions[definitionId];
    assert.notEqual(definition, undefined, `${definitionId} must resolve`);
    assert.equal(definition.toolId, 'market-action', 'Center goals live under the market-action journey tool id');
    return definition.goalId;
  }).sort();
  assert.deepEqual(goalIds, ['latent-risk', 'portfolio-stress', 'prepare-session', 'triage']);
});

test('TP-08-02 SCN-012-032 no goal is generic, example-only, or a placeholder', () => {
  const registry = journeyRegistry();
  const generic = ['example', 'generic', 'placeholder', 'goal-one', 'goal-two', 'sample', 'tbd', 'todo', 'demo'];
  for (const definition of registry.definitions) {
    const goal = definition.goalId.toLowerCase();
    for (const token of generic) {
      assert.equal(goal.includes(token), false, `${definition.definitionId} must not use the generic goal token "${token}"`);
    }
  }
});

test('TP-08-02 every one of the 56 definitions compiles under the runtime schema with a fingerprint', () => {
  const registry = journeyRegistry();
  const compiled = requireValue(RJ.compileRegistry(registry));
  assert.equal(compiled.definitionIds.length, 56);
  for (const definitionId of compiled.definitionIds) {
    const definition = compiled.definitions[definitionId];
    assert.match(definition.definitionFingerprint, /^sha256:[0-9a-f]{64}$/, `${definitionId} must carry a canonical fingerprint`);
    assert.equal(definition.noExecution, true);
    assert.ok(definition.stepFingerprints.length >= 1);
  }
});

test('TP-08-02 cross-checks that rlexperience.js still validates the same journey registry (single source)', () => {
  const RLEXPERIENCE = loadProductionApi();
  const config = readJson('tool-experience.config.json');
  const registry = journeyRegistry();
  const result = RLEXPERIENCE.validateJourneyRegistry(registry, config);
  assert.equal(result.ok, true, result.error && `${result.error.code} ${result.error.fieldPath}`);
  assert.equal(result.value.definitions.length, 56);
  // Steps are not 1:1 with definitions (measured 1..6 per definition), so the total is pinned
  // separately and every definition is required to compile to at least one step.
  assert.equal(result.value.steps.length, 75);
  const stepped = new Set(result.value.steps.map((step) => step.definitionId || step.goalId));
  assert.equal(stepped.size, result.value.definitions.length, 'every definition compiles to at least one step');
});

test('TP-08-02 the runtime rejects an inventory that regresses goal completeness (non-tautological)', () => {
  const registry = journeyRegistry();
  const inventory = registryInventory();

  // (a) an ordinary tool dropped to a single goal is rejected.
  const oneGoal = clone(inventory);
  const target = oneGoal.find((row) => row.registryId === 'market-heatmap-lab');
  target.journeyDefinitionIds = target.journeyDefinitionIds.slice(0, 1);
  requireError(RJ.validateRegistryCompleteness(registry, oneGoal), 'RLJOURNEY-DEFINITION');

  // (b) the Center reduced below four global goals is rejected.
  const threeCenter = clone(inventory);
  const center = threeCenter.find((row) => row.registryId === 'market-brief');
  center.journeyDefinitionIds = center.journeyDefinitionIds.slice(0, 3);
  requireError(RJ.validateRegistryCompleteness(registry, threeCenter), 'RLJOURNEY-DEFINITION');

  // (c) a definition whose goalId is generic is rejected when injected into a cloned registry.
  const genericRegistry = clone(registry);
  const genericInventory = clone(inventory);
  const heatmap = genericInventory.find((row) => row.registryId === 'market-heatmap-lab');
  const firstGoalId = heatmap.journeyDefinitionIds[0];
  const mutated = genericRegistry.definitions.find((definition) => definition.definitionId === firstGoalId);
  const mutatedStep = genericRegistry.steps.find((step) => step.definitionId === firstGoalId);
  const newDefinitionId = 'journey/market-heatmap-lab/example/v1';
  const newStepId = `${newDefinitionId}/step/evaluate`;
  mutated.definitionId = newDefinitionId;
  mutated.goalId = 'example';
  mutated.stepIds = [newStepId];
  mutatedStep.stepId = newStepId;
  mutatedStep.definitionId = newDefinitionId;
  heatmap.journeyDefinitionIds[0] = newDefinitionId;
  requireError(RJ.validateRegistryCompleteness(genericRegistry, genericInventory), 'RLJOURNEY-DEFINITION');
});
