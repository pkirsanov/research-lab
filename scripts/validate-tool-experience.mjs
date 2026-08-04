#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const require = createRequire(import.meta.url);
const RLEXPERIENCE = require('../rlexperience.js');
/* rlmarketaction.js OWNS the two-kinded matrix-domain vocabulary; it is read here rather than
   re-typed so the registry contract is checked against the vocabulary the composer actually uses. */
const RLMARKETACTION = require('../rlmarketaction.js');
const SCALING_TOOL_ID = 'feature-012-scaling-probe';
const DEPENDENCY_GATES_PATH = 'tool-experience.gates.json';
const CLI_USAGE = 'usage: node scripts/validate-tool-experience.mjs [--require-simple-adapters] [--dependency <name> [--require-accepted]]';
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
  const recentHistoryBytes = readRequired('brief-history.recent.jsonl');
  const firstLoadPaths = [
    'market-brief.config.page.json',
    'market-brief.page.json',
    'watchlist.json',
    'brief-history.recent.jsonl',
    'market-brief.snapshot.page.json',
    'market-brief.tools.page.json',
    'market-brief.scorecard.json'
  ];
  const firstLoadBytes = firstLoadPaths.reduce((total, path) => total + readRequired(path).length, 0);

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
      journeys: journeyBytes.length,
      briefHistoryRecent: recentHistoryBytes.length,
      briefHistoryRecentRows: recentHistoryBytes.toString('utf8').split(/\r?\n/).filter(Boolean).length,
      briefFirstLoad: firstLoadBytes
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
    { artifact: 'journeys', bytes: byteInventory.journeys, budget: budgets.journeysMaxBytes },
    { artifact: 'brief-history-recent', bytes: byteInventory.briefHistoryRecent, budget: budgets.briefHistoryRecentMaxBytes },
    { artifact: 'brief-history-recent-rows', bytes: byteInventory.briefHistoryRecentRows, budget: budgets.briefHistoryRecentMaxRows },
    { artifact: 'brief-first-load', bytes: byteInventory.briefFirstLoad, budget: budgets.briefFirstLoadMaxBytes }
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

/*
 * Registry contract: the matrix-domain vocabulary is CLOSED and two-kinded.
 *
 * EVIDENCE domains are answered by a tool that publishes a per-ticker read, so a tool DECLARES them
 * in tools.json `experience.matrixDomains`. DERIVED domains are computed by rlmarketaction.js from
 * the evidence cells of the same row, so no tool can own one — a tool cannot own an absence.
 *
 * rlexperience.js enforces only `declared domain is a member of config.matrixPolicy.domains`, so the
 * whole separation rested on that config list mirroring EVIDENCE_DOMAINS — and that mirror was prose
 * in a comment, never an assertion. Widening the config by one entry silently re-opened every derived
 * domain to tool ownership, which is how eight unrelated tools came to declare `gaps`. The checks
 * below make the mirror executable and name the offending tool and domain, because a rejection that
 * reports only `$.tools[13].experience.matrixDomains[2]` cannot be acted on.
 */
function validateMatrixDomainVocabulary(packet) {
  const evidenceDomains = [...RLMARKETACTION.EVIDENCE_DOMAINS];
  const derivedDomains = [...RLMARKETACTION.DERIVED_DOMAINS];
  invariant(evidenceDomains.length > 0, 'the matrix vocabulary declares no EVIDENCE domain');
  invariant(derivedDomains.length > 0, 'the matrix vocabulary declares no DERIVED domain');
  const bothKinds = evidenceDomains.filter((domain) => derivedDomains.includes(domain));
  invariant(bothKinds.length === 0, `matrix domain(s) claim both kinds at once: ${bothKinds.join(', ')}`);

  const declarable = packet.config.matrixPolicy.domains;
  const claimableDerived = declarable.filter((domain) => derivedDomains.includes(domain));
  invariant(
    claimableDerived.length === 0,
    `tool-experience.config.json matrixPolicy.domains makes DERIVED matrix domain(s) declarable: ${claimableDerived.join(', ')} — a derived domain is computed from that row's evidence cells and can never be claimed by a tool`
  );
  invariant(
    JSON.stringify(declarable) === JSON.stringify(evidenceDomains),
    `tool-experience.config.json matrixPolicy.domains must mirror the EVIDENCE vocabulary exactly (expected ${evidenceDomains.join(', ')}; declared ${declarable.join(', ')})`
  );

  const declaredBy = new Map(evidenceDomains.map((domain) => [domain, []]));
  let declaredDomainCount = 0;
  let declaringToolCount = 0;
  for (const tool of packet.registry.tools) {
    const domains = tool.experience.matrixDomains;
    if (domains.length > 0) declaringToolCount += 1;
    for (const domain of domains) {
      declaredDomainCount += 1;
      invariant(
        derivedDomains.includes(domain) === false,
        `tool "${tool.id}" declares DERIVED matrix domain "${domain}" — a derived domain is computed from that row's evidence cells and can never be owned by a tool (declarable EVIDENCE domains: ${evidenceDomains.join(', ')})`
      );
      invariant(
        declaredBy.has(domain),
        `tool "${tool.id}" declares unknown matrix domain "${domain}" — it is neither an EVIDENCE domain (${evidenceDomains.join(', ')}) nor a DERIVED domain (${derivedDomains.join(', ')})`
      );
      const owners = declaredBy.get(domain);
      invariant(owners.includes(tool.id) === false, `tool "${tool.id}" declares matrix domain "${domain}" more than once`);
      owners.push(tool.id);
    }
  }

  /* The inverse defect, same class: an EVIDENCE domain nobody declares is a permanently ownerless
     column that reports every ticker as a gap while reading like a routing result. */
  const orphanEvidenceDomains = evidenceDomains.filter((domain) => declaredBy.get(domain).length === 0);
  invariant(
    orphanEvidenceDomains.length === 0,
    `EVIDENCE matrix domain(s) declared by no tool: ${orphanEvidenceDomains.join(', ')} — an evidence domain with no owner can only ever produce a gap column`
  );

  return {
    evidenceDomains,
    derivedDomains,
    declarableDomains: [...declarable],
    ownerPrecedence: Object.fromEntries(evidenceDomains.map((domain) => [domain, [...declaredBy.get(domain)]])),
    declaredDomainCount,
    declaringToolCount,
    orphanEvidenceDomains
  };
}

/* A check nothing can fail is not a check, so every refusal class is exercised on every run. The
   mutation must be REJECTED and the message must NAME the offender — an anonymous rejection is the
   defect this guard replaces, not an acceptable outcome. */
function requireVocabularyRejected(packet, name, mutate) {
  const candidate = clone(packet);
  const mustName = mutate(candidate);
  let message = null;
  try {
    validateMatrixDomainVocabulary(candidate);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  invariant(message !== null, `adversarial ${name} was unexpectedly accepted`);
  for (const expected of mustName) {
    invariant(message.includes(expected), `adversarial ${name} was refused without naming "${expected}": ${message}`);
  }
  return { name, named: mustName };
}

function runMatrixVocabularyAdversarialChecks(packet) {
  const derivedDomain = RLMARKETACTION.DERIVED_DOMAINS[0];
  const evidenceDomain = RLMARKETACTION.EVIDENCE_DOMAINS[0];
  const typoDomain = derivedDomain.slice(0, -1);
  invariant(
    RLMARKETACTION.MATRIX_DOMAINS.includes(typoDomain) === false,
    `the unknown-domain probe "${typoDomain}" collides with a real matrix domain`
  );
  const firstDeclaringTool = (candidate) => {
    const tool = candidate.registry.tools.find((entry) => entry.experience.matrixDomains.length > 0);
    invariant(tool !== undefined, 'no registry tool declares a matrix domain to mutate');
    return tool;
  };
  const cases = [
    ['derived-domain-declared', (candidate) => {
      const tool = firstDeclaringTool(candidate);
      tool.experience.matrixDomains.push(derivedDomain);
      return [tool.id, derivedDomain];
    }],
    ['unknown-domain-declared', (candidate) => {
      const tool = firstDeclaringTool(candidate);
      tool.experience.matrixDomains.push(typoDomain);
      return [tool.id, typoDomain];
    }],
    ['orphan-evidence-domain', (candidate) => {
      for (const tool of candidate.registry.tools) {
        tool.experience.matrixDomains = tool.experience.matrixDomains.filter((domain) => domain !== evidenceDomain);
      }
      return [evidenceDomain];
    }],
    ['declarable-vocabulary-widened', (candidate) => {
      candidate.config.matrixPolicy.domains = [...candidate.config.matrixPolicy.domains, derivedDomain];
      return [derivedDomain];
    }]
  ];
  return cases.map(([name, mutate]) => requireVocabularyRejected(packet, name, mutate));
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

/*
 * SCN-012-036 release-gate enforcement (behind --require-simple-adapters).
 *
 * Loads the six ordinary owner modules plus the internal Market Action Center model, registers
 * every one of their adapters into ONE production runtime over the ACTUAL model registry, then
 * runs the production registry loop: every ordinary registry tool MUST resolve exactly one
 * registered owner adapter, and the single in-Brief Center triage model MUST resolve too. Because
 * the runtime structurally rejects any adapter whose adapterId is not declared and any duplicate
 * registration, a "generic fallback" cannot register; the count invariant plus a per-tool
 * adapterStatus() resolution proves every one of the 22 ordinary tools and the 1 Center model owns
 * a distinct actual adapter with zero generic fallback, zero tool-id branch, and zero authority.
 * Each factory self-filters by its own tool IDs (byToolId guards), so passing the full definition
 * set is safe — a module registers only the adapters it owns.
 */
const ORDINARY_OWNER_MODULES = [
  { path: '../rlexperience-adapters/market-structure.js', factory: 'registerMarketStructureAdapters', deps: () => ({ rlvol: require('../rlvol.js') }) },
  { path: '../rlexperience-adapters/options.js', factory: 'registerOptionsAdapters', deps: () => undefined },
  { path: '../rlexperience-adapters/macro-rotation.js', factory: 'registerMacroRotationAdapters', deps: () => undefined },
  { path: '../rlexperience-adapters/fundamental-models.js', factory: 'registerFundamentalModelsAdapters', deps: () => undefined },
  { path: '../rlexperience-adapters/strategy-research.js', factory: 'registerStrategyResearchAdapters', deps: () => undefined },
  { path: '../rlexperience-adapters/property-research.js', factory: 'registerPropertyResearchAdapters', deps: () => ({ rental: require('../rlrental.js') }) }
];
const CENTER_OWNER_MODULE = { path: '../rlexperience-adapters/market-action.js', factory: 'registerMarketActionAdapters', deps: () => undefined };

function validateSimpleAdapterRegistry(packet) {
  const runtimeResult = RLEXPERIENCE.createSimpleRuntime(packet.config, packet.models);
  invariant(runtimeResult.ok, `Simple adapter registry runtime rejected declarations: ${runtimeResult.error?.code || 'unknown'}`);
  const runtime = runtimeResult.value;

  const registration = Object.create(null);
  for (const descriptor of [...ORDINARY_OWNER_MODULES, CENTER_OWNER_MODULE]) {
    const module = require(descriptor.path);
    invariant(typeof module[descriptor.factory] === 'function', `${descriptor.path} is missing production factory ${descriptor.factory}`);
    const results = module[descriptor.factory](runtime, RLEXPERIENCE, packet.models.definitions, descriptor.deps());
    for (const [adapterId, result] of Object.entries(results)) {
      invariant(result && result.ok, `owner adapter ${adapterId} failed to register: ${JSON.stringify((result && result.error) || {})}`);
      invariant(registration[adapterId] === undefined, `owner adapter ${adapterId} was registered by more than one module`);
      registration[adapterId] = descriptor.path;
    }
  }

  const ordinaryToolIds = packet.registry.tools.filter((tool) => tool.experience.kind === 'ordinary').map((tool) => tool.id);
  const centerToolIds = packet.registry.tools.filter((tool) => tool.experience.kind === 'market-action-center').map((tool) => tool.id);
  invariant(centerToolIds.length === 1, 'exactly one Market Action Center model is required');

  const unresolvedOrdinary = [];
  for (const toolId of ordinaryToolIds) {
    const definition = packet.models.definitions.find((candidate) => candidate.toolId === toolId);
    invariant(definition, `ordinary tool ${toolId} has no declared model definition`);
    const status = runtime.adapterStatus(definition.definitionId);
    if (!status.ok || status.value.registered !== true) unresolvedOrdinary.push(toolId);
  }
  invariant(unresolvedOrdinary.length === 0, `ordinary tools without a registered owner adapter: ${unresolvedOrdinary.join(', ')}`);

  const centerDefinition = packet.models.definitions.find((candidate) => candidate.toolId === centerToolIds[0]);
  invariant(centerDefinition, `Center tool ${centerToolIds[0]} has no declared model definition`);
  const centerStatus = runtime.adapterStatus(centerDefinition.definitionId);
  invariant(centerStatus.ok && centerStatus.value.registered === true, 'Market Action Center triage model has no registered owner adapter');

  const diagnostic = runtime.diagnostic();
  invariant(diagnostic.ok, 'Simple adapter registry runtime diagnostic failed');
  const expected = ordinaryToolIds.length + centerToolIds.length;
  invariant(diagnostic.value.registeredAdapterCount === expected, `registered owner adapters ${diagnostic.value.registeredAdapterCount} differ from declared ${expected} (generic fallback or missing owner)`);
  invariant(diagnostic.value.toolIdBranchCount === 0, 'runtime owns a tool-id branch (generic fallback risk)');
  invariant(Object.values(diagnostic.value.authority).every((owned) => owned === false), 'Simple runtime owns a forbidden authority under adapter registration');

  return {
    ordinaryAdapterCount: ordinaryToolIds.length,
    centerAdapterCount: centerToolIds.length,
    registeredAdapterCount: diagnostic.value.registeredAdapterCount,
    toolIdBranchCount: diagnostic.value.toolIdBranchCount,
    authorityOwnedCount: Object.values(diagnostic.value.authority).filter(Boolean).length,
    resolvedOrdinaryToolIds: ordinaryToolIds
  };
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

/* SCN-012-032 — journey-definition / registry coverage. Drives the REAL production rljourney runtime
   against the REAL journeys.json + tools.json registry and proves every ordinary tool exposes at least
   two concrete goals, the Market Action Center exposes exactly four, and all 48 definitions resolve. */
function validateJourneyRegistryCoverage(packet) {
  const RLJOURNEY = require('../rljourney.js');
  const inventory = packet.registry.tools.map((tool) => ({
    registryId: tool.id,
    kind: (tool.experience && tool.experience.kind) || 'ordinary',
    journeyDefinitionIds: (tool.experience && tool.experience.journeyDefinitionIds) || []
  }));
  const completeness = RLJOURNEY.validateRegistryCompleteness(packet.journeys, inventory);
  invariant(completeness.ok, `SCN-012-032 journey coverage rejected: ${completeness.error && completeness.error.code} ${completeness.error && completeness.error.fieldPath} ${completeness.error && completeness.error.reason}`);
  invariant(completeness.value.ordinaryTools === 22, `SCN-012-032 expected 22 ordinary tools with concrete goals, got ${completeness.value.ordinaryTools}`);
  invariant(completeness.value.centerGoals === 4, `SCN-012-032 Market Action Center must expose exactly four goals, got ${completeness.value.centerGoals}`);
  invariant(completeness.value.totalGoals === 48, `SCN-012-032 expected 48 total goals, got ${completeness.value.totalGoals}`);
  invariant(completeness.value.definitionCount === 48, `SCN-012-032 expected 48 journey definitions, got ${completeness.value.definitionCount}`);
  for (const row of inventory) {
    if (row.kind === 'market-action-center') {
      invariant(row.journeyDefinitionIds.length === 4, `${row.registryId} (Center) must reference exactly four journey goals`);
    } else {
      invariant(row.journeyDefinitionIds.length >= 2, `${row.registryId} must reference at least two concrete journey goals`);
    }
  }
  return {
    ordinaryTools: completeness.value.ordinaryTools,
    centerGoals: completeness.value.centerGoals,
    totalGoals: completeness.value.totalGoals,
    definitionCount: completeness.value.definitionCount
  };
}

/*
 * SCN-012-028 / SCN-012-029 dependency-gate enforcement (--dependency <name> [--require-accepted]).
 *
 * `tool-experience.config.json` declares each gate's source of truth as a governance `statePath`,
 * and `scripts/build-dependency-gates.mjs` republishes exactly the predicate-relevant fields into
 * `tool-experience.gates.json` because the deployed site never ships `specs/`. Both are evaluated
 * here through the SAME production predicate and any disagreement is refused, so neither a stale
 * published projection nor an unpublished governance edit can be what satisfies a dependency
 * claim. The predicate is never re-implemented: an unknown gate is refused by production's
 * `E012-DEPENDENCY` path. This runs only when --dependency is supplied, so default packet
 * validation stays independent of `specs/` and of the published projection.
 */
function resolveDependencyGateKey(config, name) {
  const gateKeys = Object.keys(config.dependencyGates);
  const declared = gateKeys.map((key) => `${config.dependencyGates[key].gateId} (${key})`).join(', ');
  const matches = gateKeys.filter((key) => key === name || config.dependencyGates[key].gateId === name);
  invariant(matches.length !== 0, `unknown dependency "${name}"; declared dependencies: ${declared}`);
  invariant(matches.length === 1, `ambiguous dependency "${name}"; declared dependencies: ${declared}`);
  return matches[0];
}

function dependencyGateProjection(config, gateKey, states, sourceLabel) {
  const projection = RLEXPERIENCE.projectDependencyGate(config, gateKey, states);
  invariant(projection.ok, `dependency gate ${gateKey} rejected from ${sourceLabel}: ${(projection.error && projection.error.code) || 'unknown'} ${(projection.error && projection.error.fieldPath) || ''}`);
  return projection.value;
}

function validateDependencyGate(config, name, requireAccepted) {
  const gateKey = resolveDependencyGateKey(config, name);
  const statePath = config.dependencyGates[gateKey].statePath;

  const declaredStates = {};
  for (const key of Object.keys(config.dependencyGates)) {
    const path = config.dependencyGates[key].statePath;
    declaredStates[key] = parseJson(readRequired(path), path);
  }
  const published = parseJson(readRequired(DEPENDENCY_GATES_PATH), DEPENDENCY_GATES_PATH);
  invariant(published !== null && typeof published === 'object' && published.states !== null && typeof published.states === 'object', `${DEPENDENCY_GATES_PATH} declares no dependency-gate states`);

  const governance = dependencyGateProjection(config, gateKey, declaredStates, statePath);
  const deployed = dependencyGateProjection(config, gateKey, published.states, DEPENDENCY_GATES_PATH);
  invariant(governance.state === deployed.state && JSON.stringify(governance.observed) === JSON.stringify(deployed.observed), `${DEPENDENCY_GATES_PATH} disagrees with ${statePath} for ${governance.gateId} (re-run: node scripts/build-dependency-gates.mjs)`);

  const accepted = governance.state === 'available';
  invariant(accepted || requireAccepted === false, `${governance.gateCode} is not accepted: observed status=${governance.observed.status} certification=${governance.observed.certificationStatus} ${governance.requirementName}=${governance.observed.matchedRequirementCount}/${governance.observed.requiredRequirementCount}; required ${governance.acceptanceGate}; evidence ${governance.evidencePath}; withheld ${governance.withheldCapabilities.join(',')}`);

  return {
    requested: name,
    gateKey,
    gateId: governance.gateId,
    state: governance.state,
    accepted,
    enforced: requireAccepted === true,
    requirementName: governance.requirementName,
    observed: governance.observed,
    statePath,
    publishedPath: DEPENDENCY_GATES_PATH
  };
}

export function validateActualToolExperience(options = {}) {
  const loaded = loadActualPacket();
  const dependency = options.dependency === undefined || options.dependency === null
    ? null
    : validateDependencyGate(loaded.packet.config, options.dependency, options.requireAccepted === true);
  const artifactChecks = validateArtifactBudgets(loaded.packet, loaded.bytes);
  /* Runs BEFORE validateFoundation: rlexperience.js can only report an anonymous field path, so the
     named refusal has to be reached first for a bad declaration to be actionable. */
  const matrixVocabulary = {
    ...validateMatrixDomainVocabulary(loaded.packet),
    adversarial: runMatrixVocabularyAdversarialChecks(loaded.packet)
  };
  const validation = RLEXPERIENCE.validateFoundation(loaded.packet);
  if (!validation.ok) {
    throw new Error(`foundation rejected: ${validation.error.code} ${validation.error.fieldPath}`);
  }
  const identities = deriveIdentityInventory(loaded.packet, validation.value);
  validateProductionSource(loaded.packet);
  const runtime = validateSimpleRuntimeCanaries(loaded.packet);
  const journeyCoverage = validateJourneyRegistryCoverage(loaded.packet);
  const simpleAdapters = options.requireSimpleAdapters ? validateSimpleAdapterRegistry(loaded.packet) : null;

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
    journeyCoverage,
    simpleAdapters,
    dependency,
    identities,
    artifacts: artifactChecks,
    matrixVocabulary,
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

/* Every accepted token is consumed explicitly and anything else is refused. A silently ignored
   argument is what made `--dependency … --require-accepted` a gate that always passed. */
function parseCliArguments(argv) {
  const options = { requireSimpleAdapters: false, dependency: null, requireAccepted: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--require-simple-adapters') {
      options.requireSimpleAdapters = true;
      continue;
    }
    if (token === '--require-accepted') {
      options.requireAccepted = true;
      continue;
    }
    if (token === '--dependency' || token.startsWith('--dependency=')) {
      const inline = token.startsWith('--dependency=');
      const value = inline ? token.slice('--dependency='.length) : argv[index + 1];
      invariant(typeof value === 'string' && value.length > 0 && value.startsWith('-') === false, `--dependency requires a dependency name; ${CLI_USAGE}`);
      invariant(options.dependency === null, `--dependency may be supplied only once; ${CLI_USAGE}`);
      options.dependency = value;
      if (!inline) index += 1;
      continue;
    }
    throw new Error(`unrecognised argument "${token}"; ${CLI_USAGE}`);
  }
  invariant(options.requireAccepted === false || options.dependency !== null, `--require-accepted requires --dependency <name>; ${CLI_USAGE}`);
  return options;
}

function main() {
  try {
    const report = validateActualToolExperience(parseCliArguments(process.argv.slice(2)));
    if (report.dependency) {
      const dependency = report.dependency;
      console.log(`[tool-experience] dependency=${dependency.accepted ? 'ACCEPTED' : 'PENDING'} gate=${dependency.gateId} requested=${dependency.requested} state=${dependency.state} requireAccepted=${dependency.enforced} status=${dependency.observed.status} certification=${dependency.observed.certificationStatus} ${dependency.requirementName}=${dependency.observed.matchedRequirementCount}/${dependency.observed.requiredRequirementCount} source=${dependency.statePath} published=${dependency.publishedPath}`);
    }
    for (const artifact of report.artifacts) {
      console.log(`[tool-experience] artifact=${artifact.artifact} bytes=${artifact.bytes} budget=${artifact.budget} result=PASS`);
    }
    console.log(`[tool-experience] registry=PASS tools=${report.summary.toolCount} ordinary=${report.summary.ordinaryCount} marketAction=${report.summary.marketActionCount}`);
    console.log(`[tool-experience] matrixVocabulary=PASS evidenceDomains=${report.matrixVocabulary.evidenceDomains.join(',')} derivedDomains=${report.matrixVocabulary.derivedDomains.join(',')} declaredDomains=${report.matrixVocabulary.declaredDomainCount} declaringTools=${report.matrixVocabulary.declaringToolCount} orphanEvidenceDomains=${report.matrixVocabulary.orphanEvidenceDomains.length}`);
    for (const refusal of report.matrixVocabulary.adversarial) {
      console.log(`[tool-experience] adversarial=${refusal.name} result=REJECTED named=${refusal.named.join('|')}`);
    }
    console.log(`[tool-experience] definitions=PASS simpleModels=${report.summary.simpleModelDefinitionCount} journeys=${report.summary.journeyDefinitionCount} steps=${report.summary.journeyStepCount}`);
    console.log(`[tool-experience] simpleRuntime=PASS truthStates=${report.runtime.truthStateCount} registeredAdapters=${report.runtime.registeredAdapterCount} toolIdBranches=${report.runtime.toolIdBranchCount} authorityOwned=${report.runtime.authorityOwnedCount} occurrenceIdentityStable=${report.runtime.occurrenceIdentityStable} cutoffIdentityChanged=${report.runtime.cutoffIdentityChanged}`);
    console.log(`[tool-experience] journeyCoverage=PASS ordinaryTools=${report.journeyCoverage.ordinaryTools} centerGoals=${report.journeyCoverage.centerGoals} totalGoals=${report.journeyCoverage.totalGoals} definitions=${report.journeyCoverage.definitionCount}`);
    if (report.simpleAdapters) {
      console.log(`[tool-experience] simpleAdapterRegistry=PASS ordinaryAdapters=${report.simpleAdapters.ordinaryAdapterCount} centerAdapters=${report.simpleAdapters.centerAdapterCount} registeredAdapters=${report.simpleAdapters.registeredAdapterCount} toolIdBranches=${report.simpleAdapters.toolIdBranchCount} authorityOwned=${report.simpleAdapters.authorityOwnedCount}`);
    }
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