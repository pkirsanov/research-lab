#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const require = createRequire(import.meta.url);
const RLEXPERIENCE = require('../rlexperience.js');
const SCALING_TOOL_ID = 'feature-012-scaling-probe';
const FORBIDDEN_VALIDATOR_CAPABILITIES = [
  'fetch(',
  'providerFetch(',
  'localStorage.',
  'sessionStorage.',
  '.setItem(',
  'XMLHttpRequest',
  'WebSocket',
  'author(',
  'publish('
];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function readRequired(relativePath) {
  try {
    return readFileSync(resolve(ROOT, relativePath));
  } catch (error) {
    throw new Error(`required artifact unavailable: ${relativePath}`);
  }
}

function parseJson(bytes, relativePath) {
  try {
    return JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    throw new Error(`required artifact is not valid JSON: ${relativePath}`);
  }
}

function clone(value) {
  return structuredClone(value);
}

function sorted(values) {
  return [...values].sort();
}

function sameValues(left, right) {
  return JSON.stringify(sorted(left)) === JSON.stringify(sorted(right));
}

function requireUnique(values, label) {
  invariant(new Set(values).size === values.length, `${label} contains a duplicate identity`);
}

function loadActualPacket() {
  const configBytes = readRequired('tool-experience.config.json');
  const config = parseJson(configBytes, 'tool-experience.config.json');
  const configValidation = RLEXPERIENCE.validateConfig(config);
  if (!configValidation.ok) {
    throw new Error(`config rejected: ${configValidation.error.code} ${configValidation.error.fieldPath}`);
  }

  const modelPath = config.registries.simpleModelRegistryPath;
  const journeyPath = config.registries.journeyRegistryPath;
  const registryBytes = readRequired('tools.json');
  const modelBytes = readRequired(modelPath);
  const journeyBytes = readRequired(journeyPath);

  return {
    packet: {
      config,
      registry: parseJson(registryBytes, 'tools.json'),
      models: parseJson(modelBytes, modelPath),
      journeys: parseJson(journeyBytes, journeyPath)
    },
    bytes: {
      config: configBytes.length,
      models: modelBytes.length,
      journeys: journeyBytes.length
    },
    paths: {
      config: 'tool-experience.config.json',
      models: modelPath,
      journeys: journeyPath
    }
  };
}

function validateArtifactBudgets(packet, byteInventory) {
  const budgets = packet.config.artifactBudgets;
  const checks = [
    { artifact: 'config', bytes: byteInventory.config, budget: budgets.configMaxBytes },
    { artifact: 'models', bytes: byteInventory.models, budget: budgets.simpleModelsMaxBytes },
    { artifact: 'journeys', bytes: byteInventory.journeys, budget: budgets.journeysMaxBytes }
  ];
  for (const check of checks) {
    invariant(Number.isInteger(check.bytes) && check.bytes > 0, `${check.artifact} byte inventory is invalid`);
    invariant(Number.isFinite(check.budget) && check.budget > 0, `${check.artifact} byte budget is invalid`);
    invariant(check.bytes <= check.budget, `${check.artifact} exceeds configured artifact byte budget`);
  }
  return checks;
}

function deriveIdentityInventory(packet, summary) {
  const toolIds = packet.registry.tools.map((tool) => tool.id);
  const ordinaryToolIds = packet.registry.tools
    .filter((tool) => tool.experience.kind === 'ordinary')
    .map((tool) => tool.id);
  const marketActionToolIds = packet.registry.tools
    .filter((tool) => tool.experience.kind === 'market-action-center')
    .map((tool) => tool.id);
  const modelDefinitionIds = packet.models.definitions.map((definition) => definition.definitionId);
  const modelToolIds = packet.models.definitions.map((definition) => definition.toolId);
  const journeyDefinitionIds = packet.journeys.definitions.map((definition) => definition.definitionId);
  const referencedJourneyIds = packet.registry.tools.flatMap((tool) => tool.experience.journeyDefinitionIds);
  const journeyStepIds = packet.journeys.steps.map((step) => step.stepId);
  const referencedStepIds = packet.journeys.definitions.flatMap((definition) => definition.stepIds);

  requireUnique(toolIds, 'tool registry');
  requireUnique(modelDefinitionIds, 'simple-model registry');
  requireUnique(modelToolIds, 'simple-model tool ownership');
  requireUnique(journeyDefinitionIds, 'Journey registry');
  requireUnique(referencedJourneyIds, 'Journey references');
  requireUnique(journeyStepIds, 'Journey steps');
  requireUnique(referencedStepIds, 'Journey step references');

  invariant(JSON.stringify(summary.toolIds) === JSON.stringify(toolIds), 'production summary tool IDs differ from registry order');
  invariant(summary.toolCount === toolIds.length, 'production summary tool count differs from registry membership');
  invariant(summary.ordinaryCount === ordinaryToolIds.length, 'production ordinary count differs from registry declarations');
  invariant(summary.marketActionCount === marketActionToolIds.length, 'production Market Action count differs from registry declarations');
  invariant(summary.simpleModelDefinitionCount === modelDefinitionIds.length, 'production model count differs from model registry');
  invariant(summary.journeyDefinitionCount === journeyDefinitionIds.length, 'production Journey count differs from Journey registry');
  invariant(summary.journeyStepCount === journeyStepIds.length, 'production Journey-step count differs from Journey registry');
  invariant(sameValues(toolIds, modelToolIds), 'each registry tool must own exactly one simple-model definition');
  invariant(sameValues(journeyDefinitionIds, referencedJourneyIds), 'Journey definitions and tool references must match exactly');
  invariant(sameValues(journeyStepIds, referencedStepIds), 'Journey steps and definition references must match exactly');
  invariant(marketActionToolIds.length === 1, 'exactly one Market Action specialization is required');

  const marketActionTool = packet.registry.tools.find((tool) => tool.id === marketActionToolIds[0]);
  const marketActionModel = packet.models.definitions.find((definition) => definition.toolId === marketActionToolIds[0]);
  invariant(marketActionTool.experience.simpleModelDefinitionId === null, 'Market Action top-level Simple reference must remain null');
  invariant(marketActionModel.definitionId === 'simple-model/market-action-triage/v1', 'Market Action triage definition identity is invalid');

  return {
    toolIds,
    ordinaryToolIds,
    marketActionToolIds,
    modelDefinitionIds,
    journeyDefinitionIds,
    journeyStepIds
  };
}

function validateProductionSource(packet) {
  const source = readRequired('rlexperience.js').toString('utf8');
  for (const tool of packet.registry.tools) {
    invariant(source.includes(tool.id) === false, `production validator contains a tool-specific branch for ${tool.id}`);
  }
  for (const capability of FORBIDDEN_VALIDATOR_CAPABILITIES) {
    invariant(source.includes(capability) === false, `production declaration validator owns forbidden capability ${capability}`);
  }
}

function runtimeEvidence(definition, retrievedOrPublishedAt, evidenceCutoff = '2026-07-23T20:00:00.000Z') {
  const evidence = {
    contractVersion: 'simple-evidence-snapshot/v1',
    toolId: definition.toolId,
    state: 'ready',
    evidenceCutoff,
    evidenceRefs: [{
      requirementId: 'owner-evidence',
      evidenceRef: `owner:${definition.toolId}:validator`,
      semanticFingerprint: RLEXPERIENCE.fingerprint({ owner: definition.toolId, observations: [2, 3, 5] }),
      sourceClass: 'observed-fact',
      observedAsOf: evidenceCutoff,
      retrievedOrPublishedAt,
      freshness: 'fresh',
      dataTier: 'validator-contract',
      valueState: 'ready'
    }],
    parameterValues: {},
    assumptions: ['Validator evidence is complete at the declared cutoff.'],
    limitations: ['Validator evidence carries no domain conclusion.'],
    invalidationConditions: ['Semantic owner evidence changes.']
  };
  evidence.evidenceIdentity = RLEXPERIENCE.fingerprint({
    contractVersion: 'simple-evidence-identity/v1',
    toolId: evidence.toolId,
    state: evidence.state,
    evidenceCutoff: evidence.evidenceCutoff,
    evidenceRefs: evidence.evidenceRefs.map(({ requirementId, evidenceRef, semanticFingerprint, sourceClass, valueState }) => ({
      requirementId,
      evidenceRef,
      semanticFingerprint,
      sourceClass,
      valueState
    })),
    parameterValues: evidence.parameterValues,
    assumptions: evidence.assumptions,
    limitations: evidence.limitations,
    invalidationConditions: evidence.invalidationConditions
  });
  return evidence;
}

function validateSimpleRuntimeCanaries(packet) {
  const budgets = packet.config.performanceBudgets;
  invariant(budgets.contractVersion === 'experience-performance-policy/v2', 'Simple runtime performance policy must be v2');
  invariant(budgets.standardSimpleMaxMs === 100, 'standard Simple recompute budget must be 100 ms');
  invariant(budgets.heavySimpleMaxMs === 1000, 'heavy Simple recompute budget must be 1000 ms');
  invariant(budgets.cooperativeChunkMaxMs === 16, 'cooperative Simple chunk budget must be 16 ms');
  invariant(JSON.stringify(RLEXPERIENCE.SIMPLE_TRUTH_STATES) === JSON.stringify(['ready', 'partial', 'stale', 'unavailable', 'disputed', 'rejected']), 'Simple truth-state enum drifted');

  const runtimeResult = RLEXPERIENCE.createSimpleRuntime(packet.config, packet.models);
  invariant(runtimeResult.ok, `Simple runtime rejected current declarations: ${runtimeResult.error?.code || 'unknown'}`);
  const diagnostic = runtimeResult.value.diagnostic();
  invariant(diagnostic.ok && diagnostic.value.registeredAdapterCount === 0, 'production Simple runtime must ship with zero registered owner adapters');
  invariant(Object.values(diagnostic.value.authority).every((owned) => owned === false), 'Simple runtime owns a forbidden authority');

  const definition = packet.models.definitions.find((candidate) => candidate.toolId === 'market-heatmap-lab');
  invariant(definition, 'market breadth definition required for runtime identity canary');
  const values = Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
  const first = RLEXPERIENCE.normalizeSimpleInput(definition, runtimeEvidence(definition, '2026-07-23T20:01:00.000Z'), values, null, ['baseline']);
  const occurrenceOnly = RLEXPERIENCE.normalizeSimpleInput(definition, runtimeEvidence(definition, '2026-07-23T20:09:00.000Z'), values, null, ['baseline']);
  const changedCutoff = RLEXPERIENCE.normalizeSimpleInput(definition, runtimeEvidence(definition, '2026-07-23T20:09:00.000Z', '2026-07-23T21:00:00.000Z'), values, null, ['baseline']);
  invariant(first.ok && occurrenceOnly.ok && changedCutoff.ok, 'Simple runtime identity canary normalization failed');
  const firstIdentity = RLEXPERIENCE.computeSimpleIdentity(first.value);
  const occurrenceIdentity = RLEXPERIENCE.computeSimpleIdentity(occurrenceOnly.value);
  const cutoffIdentity = RLEXPERIENCE.computeSimpleIdentity(changedCutoff.value);
  invariant(firstIdentity.ok && occurrenceIdentity.ok && cutoffIdentity.ok, 'Simple runtime identity canary computation failed');
  invariant(firstIdentity.value === occurrenceIdentity.value, 'retrieval occurrence time contaminated semantic compute identity');
  invariant(firstIdentity.value !== cutoffIdentity.value, 'semantic evidence cutoff did not change compute identity');
  return {
    truthStateCount: RLEXPERIENCE.SIMPLE_TRUTH_STATES.length,
    registeredAdapterCount: diagnostic.value.registeredAdapterCount,
    toolIdBranchCount: diagnostic.value.toolIdBranchCount,
    authorityOwnedCount: Object.values(diagnostic.value.authority).filter(Boolean).length,
    occurrenceIdentityStable: firstIdentity.value === occurrenceIdentity.value,
    cutoffIdentityChanged: firstIdentity.value !== cutoffIdentity.value
  };
}

function makeAddedJourney(toolId, goalId, mechanism) {
  const definitionId = `journey/${toolId}/${goalId}/v1`;
  const stepId = `${definitionId}/step/evaluate`;
  const completionPredicate = mechanism === 'scenario-lab'
    ? 'scenario-comparison-complete'
    : 'explicit-choice-recorded';
  const inputFields = mechanism === 'scenario-lab'
    ? ['baselineScenarioId', 'comparisonScenarioId']
    : ['choice'];
  return {
    definition: {
      contractVersion: 'journey-definition/v1',
      definitionId,
      definitionVersion: 'v1',
      toolId,
      goalId,
      title: `Evaluate ${goalId}`,
      outcomeDescription: 'Produce a bounded evidence-linked research outcome.',
      mechanism,
      prerequisiteRules: [{ ruleId: 'owner-evidence-current', predicate: 'all-required-evidence-current' }],
      contextSchema: {
        contractVersion: 'journey-context-schema/v1',
        allowedFields: ['evidenceIdentity', 'publicTargetId'],
        requiredFields: ['evidenceIdentity']
      },
      stepIds: [stepId],
      evidencePolicy: {
        requiredSlots: ['owner-evidence'],
        allowedProvenance: ['owner-evidence', 'public-source']
      },
      backtrackPolicy: { mode: 'transitive-dependents-stale', auditPriorOutcomes: true },
      staleEvidencePolicy: { mode: 'reopen-dependent-steps', preserveAudit: true },
      completionPolicy: { predicates: [completionPredicate], outcomes: ['complete', 'partial', 'refused'] },
      packetPolicy: {
        contractVersion: 'journey-completion-packet/v1',
        humanSignoffRequired: true,
        noExecution: true
      },
      privacyClass: 'public-safe',
      noExecution: true,
      accessibility: { progressSemantics: 'ordered-list', currentStepSemantics: 'aria-current-step' },
      limitations: ['Scaling probe is research-only and has no execution or portfolio side effect.'],
      definitionFingerprint: null
    },
    step: {
      contractVersion: 'journey-step/v1',
      stepId,
      definitionId,
      title: `Evaluate ${goalId}`,
      purpose: 'Resolve the scaling-probe goal against current owner evidence.',
      mechanismRole: mechanism,
      dependsOnStepIds: [],
      inputSchema: {
        contractVersion: 'journey-step-input/v1',
        allowedFields: inputFields,
        requiredFields: inputFields
      },
      allowedInputProvenance: ['user-assumption'],
      requiredEvidenceSlots: ['owner-evidence'],
      optionalEvidenceSlots: ['public-source'],
      completionPredicate,
      branchRules: [],
      staleWhen: ['owner-evidence-changed'],
      invalidatesStepIds: [],
      ownerDeepLinks: [`${toolId}.html#power`],
      sideEffectPolicy: 'none',
      accessibility: {
        label: `Evaluate ${goalId}`,
        description: 'Review current evidence and record a bounded research outcome.'
      },
      stepFingerprint: null
    }
  };
}

function buildScalingPacket(packet) {
  const next = clone(packet);
  const templateTool = next.registry.tools.find((tool) => tool.experience.kind === 'ordinary');
  invariant(templateTool !== undefined, 'ordinary scaling template is unavailable');
  const templateModel = next.models.definitions.find((definition) => definition.toolId === templateTool.id);
  invariant(templateModel !== undefined, 'ordinary model scaling template is unavailable');

  const definitionId = `simple-model/${SCALING_TOOL_ID}/v1`;
  const adapterId = `simple-adapter/${SCALING_TOOL_ID}/v1`;
  const journeyIds = [
    `journey/${SCALING_TOOL_ID}/goal-one/v1`,
    `journey/${SCALING_TOOL_ID}/goal-two/v1`
  ];
  const tool = clone(templateTool);
  tool.id = SCALING_TOOL_ID;
  tool.title = 'Feature 012 scaling probe';
  tool.nav = { label: 'Scaling probe', icon: 'X' };
  tool.file = `${SCALING_TOOL_ID}.html`;
  tool.notes = `notes/${SCALING_TOOL_ID}.md`;
  tool.briefing = { ...tool.briefing, readAdapter: `${SCALING_TOOL_ID}-owner-v1` };
  tool.experience = {
    ...tool.experience,
    simpleModelDefinitionId: definitionId,
    simpleAdapterId: adapterId,
    journeyDefinitionIds: journeyIds
  };
  next.registry.tools.push(tool);

  const model = clone(templateModel);
  model.definitionId = definitionId;
  model.toolId = SCALING_TOOL_ID;
  model.modelId = `${SCALING_TOOL_ID}-model`;
  model.researchQuestion = 'How does the scaling probe change under explicit parameters?';
  model.adapterId = adapterId;
  model.deepLinkTargets = {
    power: `${SCALING_TOOL_ID}.html#power`,
    journey: `${SCALING_TOOL_ID}.html#journey`
  };
  model.definitionFingerprint = null;
  next.models.definitions.push(model);

  for (const [goalId, mechanism] of [['goal-one', 'wizard'], ['goal-two', 'scenario-lab']]) {
    const journey = makeAddedJourney(SCALING_TOOL_ID, goalId, mechanism);
    next.journeys.definitions.push(journey.definition);
    next.journeys.steps.push(journey.step);
  }
  return next;
}

function requireRejected(packet, name, expectedCode, mutate) {
  const candidate = clone(packet);
  mutate(candidate);
  const result = RLEXPERIENCE.validateFoundation(candidate);
  invariant(result.ok === false, `adversarial ${name} was unexpectedly accepted`);
  invariant(result.error.code === expectedCode, `adversarial ${name} returned ${result.error.code}, expected ${expectedCode}`);
  invariant(result.error.valueEchoed === false, `adversarial ${name} echoed an invalid value`);
  return { name, code: expectedCode, fieldPath: result.error.fieldPath };
}

function runAdversarialChecks(packet) {
  const cases = [
    ['missing-experience', 'E012-REGISTRY', (candidate) => { delete candidate.registry.tools[0].experience; }],
    ['duplicate-tool', 'E012-REGISTRY', (candidate) => { candidate.registry.tools.push(clone(candidate.registry.tools[0])); }],
    ['unknown-version', 'E012-VERSION', (candidate) => { candidate.registry.tools[1].experience.contractVersion = 'tool-experience/v2'; }],
    ['wrong-view-order', 'E012-VIEWSET', (candidate) => { candidate.registry.tools[1].experience.viewIds = ['power', 'simple', 'brief', 'journey']; }],
    ['unsafe-module', 'E012-REGISTRY', (candidate) => { candidate.registry.tools[1].experience.simpleAdapterModule = '../owner.js'; }],
    ['unknown-field', 'E012-REGISTRY', (candidate) => { candidate.registry.tools[1].experience.unplannedCapability = true; }],
    ['omitted-model', 'E012-REGISTRY', (candidate) => {
      const definitionId = candidate.registry.tools[1].experience.simpleModelDefinitionId;
      candidate.models.definitions = candidate.models.definitions.filter((definition) => definition.definitionId !== definitionId);
    }],
    ['duplicate-model', 'E012-SIMPLE-DEFINITION', (candidate) => { candidate.models.definitions.push(clone(candidate.models.definitions[0])); }],
    ['unresolved-journey', 'E012-REGISTRY', (candidate) => { candidate.registry.tools[1].experience.journeyDefinitionIds[0] = 'journey/missing/v1'; }],
    ['omitted-journey-step', 'E012-JOURNEY-DEFINITION', (candidate) => { candidate.journeys.steps.shift(); }],
    ['invalid-journey-mechanism', 'E012-JOURNEY-DEFINITION', (candidate) => { candidate.journeys.definitions[0].mechanism = 'arbitrary-script'; }],
    ['journey-execution-enabled', 'E012-JOURNEY-DEFINITION', (candidate) => { candidate.journeys.definitions[0].noExecution = false; }],
    ['narrative-dependency-status', 'E012-REGISTRY', (candidate) => { candidate.config.dependencyGates.BUG004.acceptedPredicate.narrativeStatus = 'implemented'; }]
  ];
  return cases.map(([name, code, mutate]) => requireRejected(packet, name, code, mutate));
}

export function validateActualToolExperience() {
  const loaded = loadActualPacket();
  const artifactChecks = validateArtifactBudgets(loaded.packet, loaded.bytes);
  const validation = RLEXPERIENCE.validateFoundation(loaded.packet);
  if (!validation.ok) {
    throw new Error(`foundation rejected: ${validation.error.code} ${validation.error.fieldPath}`);
  }
  const identities = deriveIdentityInventory(loaded.packet, validation.value);
  validateProductionSource(loaded.packet);
  const runtime = validateSimpleRuntimeCanaries(loaded.packet);

  const scalingPacket = buildScalingPacket(loaded.packet);
  const scaling = RLEXPERIENCE.validateFoundation(scalingPacket);
  if (!scaling.ok) {
    throw new Error(`valid scaling probe rejected: ${scaling.error.code} ${scaling.error.fieldPath}`);
  }
  invariant(scaling.value.toolCount === validation.value.toolCount + 1, 'valid scaling probe did not add exactly one registry tool');
  invariant(scaling.value.toolIds.at(-1) === SCALING_TOOL_ID, 'valid scaling probe did not preserve registry order');

  const adversarial = runAdversarialChecks(loaded.packet);
  return {
    summary: validation.value,
    runtime,
    identities,
    artifacts: artifactChecks,
    scaling: {
      toolId: SCALING_TOOL_ID,
      toolCount: scaling.value.toolCount,
      modelCount: scaling.value.simpleModelDefinitionCount,
      journeyCount: scaling.value.journeyDefinitionCount,
      stepCount: scaling.value.journeyStepCount
    },
    adversarial
  };
}

function main() {
  try {
    const report = validateActualToolExperience();
    for (const artifact of report.artifacts) {
      console.log(`[tool-experience] artifact=${artifact.artifact} bytes=${artifact.bytes} budget=${artifact.budget} result=PASS`);
    }
    console.log(`[tool-experience] registry=PASS tools=${report.summary.toolCount} ordinary=${report.summary.ordinaryCount} marketAction=${report.summary.marketActionCount}`);
    console.log(`[tool-experience] definitions=PASS simpleModels=${report.summary.simpleModelDefinitionCount} journeys=${report.summary.journeyDefinitionCount} steps=${report.summary.journeyStepCount}`);
    console.log(`[tool-experience] simpleRuntime=PASS truthStates=${report.runtime.truthStateCount} registeredAdapters=${report.runtime.registeredAdapterCount} toolIdBranches=${report.runtime.toolIdBranchCount} authorityOwned=${report.runtime.authorityOwnedCount} occurrenceIdentityStable=${report.runtime.occurrenceIdentityStable} cutoffIdentityChanged=${report.runtime.cutoffIdentityChanged}`);
    console.log(`[tool-experience] ids=PASS toolIds=${report.identities.toolIds.join(',')}`);
    console.log(`[tool-experience] scaling=PASS addedTool=${report.scaling.toolId} tools=${report.scaling.toolCount} models=${report.scaling.modelCount} journeys=${report.scaling.journeyCount} steps=${report.scaling.stepCount}`);
    for (const refusal of report.adversarial) {
      console.log(`[tool-experience] adversarial=${refusal.name} result=REJECTED code=${refusal.code}`);
    }
    console.log(`[tool-experience] shadow=PASS shadowOnly=${report.summary.shadowOnly} integrationClaims=${report.summary.integrationClaims.length}`);
    console.log(`[tool-experience] OK adversarial=${report.adversarial.length} unexpectedAcceptances=0`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'validator failed without an Error object';
    console.error(`[tool-experience] FAIL ${message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();