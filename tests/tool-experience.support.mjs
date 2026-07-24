import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

export { startStaticServer } from './provider-credentials.support.mjs';

const productionUrl = new URL('../rlexperience.js', import.meta.url);
const require = createRequire(import.meta.url);

export const ORDINARY_VIEWS = Object.freeze(['simple', 'power', 'brief', 'journey']);
export const MARKET_ACTION_VIEWS = Object.freeze(['brief', 'portfolio', 'red-alert', 'journey']);
export const ADAPTER_MODULES = Object.freeze([
  'rlexperience-adapters/market-structure.js',
  'rlexperience-adapters/options.js',
  'rlexperience-adapters/macro-rotation.js',
  'rlexperience-adapters/fundamental-models.js',
  'rlexperience-adapters/strategy-research.js',
  'rlexperience-adapters/property-research.js',
  'rlexperience-adapters/market-action.js'
]);

export const REFUSAL_CODES = Object.freeze([
  'E012-REGISTRY',
  'E012-VIEWSET',
  'E012-VIEW-TARGET',
  'E012-SIMPLE-DEFINITION',
  'E012-SIMPLE-INPUT',
  'E012-SIMPLE-NONDETERMINISTIC',
  'E012-SIMPLE-NO-EFFECT',
  'E012-CONTEXT-MISSING',
  'E012-WEB-POLICY',
  'E012-WEB-ROBOTS',
  'E012-WEB-BUDGET',
  'E012-WEB-UNSAFE',
  'E012-WEB-CORROBORATION',
  'E012-AUTHOR-BOUNDARY',
  'E012-JOURNEY-DEFINITION',
  'E012-JOURNEY-STORE',
  'E012-JOURNEY-STALE',
  'E012-REDALERT-QUALIFICATION',
  'E012-PRIVACY',
  'E012-DEPENDENCY',
  'E012-PUBLICATION',
  'E012-VERSION'
]);

export function loadProductionApi() {
  assert.equal(
    existsSync(productionUrl),
    true,
    'production contract missing: rlexperience.js'
  );
  const path = productionUrl.pathname;
  delete require.cache[require.resolve(path)];
  return require(path);
}

export function readProductionSource() {
  assert.equal(existsSync(productionUrl), true, 'production contract missing: rlexperience.js');
  return readFileSync(productionUrl, 'utf8');
}

export function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8'));
}

export function clone(value) {
  return structuredClone(value);
}

export function makeConfig() {
  return {
    contractVersion: 'tool-experience-config/v1',
    viewSets: {
      'ordinary-four-view/v1': {
        viewSetId: 'ordinary-four-view/v1',
        kind: 'ordinary',
        registryToolId: null,
        viewIds: [...ORDINARY_VIEWS],
        labels: ['Simple', 'Power', 'Brief', 'Journey'],
        defaultViewId: 'simple'
      },
      'market-action-center-four-view/v1': {
        viewSetId: 'market-action-center-four-view/v1',
        kind: 'market-action-center',
        registryToolId: 'market-brief',
        viewIds: [...MARKET_ACTION_VIEWS],
        labels: ['Brief', 'Portfolio', 'Red Alert', 'Journey'],
        defaultViewId: 'brief'
      }
    },
    routingPolicy: {
      contractVersion: 'experience-routing-policy/v1',
      publicHashPrefix: '#',
      nestedTargetSeparator: '/',
      history: { userSelection: 'push', bootNormalization: 'replace', invalidTarget: 'replace' },
      focus: { nestedPublicTarget: 'after-render', returnTarget: 'exact-trigger' },
      localModeKey: 'rlExperienceModeV1',
      invalidTargetPolicy: 'remove-target-preserve-mode'
    },
    adapterPolicy: {
      contractVersion: 'experience-adapter-policy/v1',
      modulePattern: '^rlexperience-adapters/[a-z0-9-]+\\.js$',
      moduleAllowlist: [...ADAPTER_MODULES],
      registrationPolicy: 'exact-declared-adapter-ids'
    },
    registries: {
      simpleModelRegistryPath: 'simple-models.json',
      journeyRegistryPath: 'journeys.json'
    },
    contextPolicy: {
      contractVersion: 'contextual-tooltip-policy/v1',
      policyId: 'contextual-tooltip/v1',
      rendererBudgets: { maxValueTextChars: 160, maxInterpretationChars: 360, maxLimitationChars: 240 }
    },
    journeyStoragePolicy: {
      contractVersion: 'journey-storage-policy/v1',
      namespace: 'rlJourneySessionsV1',
      pointerKey: 'rlJourneySessionsV1.pointer',
      slotKeys: ['rlJourneySessionsV1.slotA', 'rlJourneySessionsV1.slotB'],
      maxSessionBytes: 131072,
      maxRetainedSessions: 20,
      completedOrAbandonedExpiryDays: 90,
      forbiddenFieldNames: ['auth', 'token', 'accountId', 'quantity', 'cost', 'pnl', 'holding', 'privateTicker', 'secret', 'payment']
    },
    redAlertPolicy: {
      contractVersion: 'red-alert-policy/v1',
      hardGate: 'current-corroborated-observable-falsifiable',
      minimumIndependentOrigins: 2,
      minimumObservableMarketEvidence: 1,
      minimumVisibleCount: 0,
      noTopicSeedList: true
    },
    matrixPolicy: {
      contractVersion: 'public-matrix-policy/v1',
      domains: ['fundamentals', 'options', 'technical', 'macro-rotation', 'volatility', 'catalyst', 'gaps'],
      publicScopeLabel: 'Public watchlist',
      privateScopeLabel: 'Private workspace - local only'
    },
    dependencyGates: {
      BUG004: {
        gateId: 'BUG-004',
        statePath: 'specs/_bugs/BUG-004-proxy-route-local-key-fallback/state.json',
        acceptedPredicate: {
          statuses: ['done'],
          certificationStatuses: ['done'],
          requiredEvidenceIds: ['TP-09', 'TP-12']
        },
        withheldCapabilities: ['keyed-provider-fallback-certification'],
        preservedCapabilities: ['contracts', 'definitions', 'shadow-validation']
      },
      FEATURE002: {
        gateId: 'feature-002',
        statePath: 'specs/002-distributed-tool-briefs-and-history/state.json',
        acceptedPredicate: {
          statuses: ['done'],
          certificationStatuses: ['done'],
          requiredMilestones: ['current-graph', 'owner-coverage', 'powerless-author', 'atomic-publication']
        },
        withheldCapabilities: ['dynamic-tool-brief-v2', 'live-web-evidence', 'public-alert-publication'],
        preservedCapabilities: ['simple', 'power', 'journey', 'deterministic-local-evidence']
      },
      FEATURE008: {
        gateId: 'feature-008',
        statePath: 'specs/008-portfolio-survival-and-brief-lab/state.json',
        acceptedPredicate: {
          statuses: ['done'],
          certificationStatuses: ['done'],
          requiredMilestones: ['rlportfolio-store-privacy', 'public-evidence-barrier', 'local-brief-ticker-scope']
        },
        withheldCapabilities: ['private-portfolio-overlay', 'portfolio-stress-journey'],
        preservedCapabilities: ['public-watchlist-matrix', 'public-scope-journeys']
      }
    },
    performanceBudgets: {
      contractVersion: 'experience-performance-policy/v1',
      validationMaxMs: 100,
      interactionMaxMs: 100,
      localRecomputeMaxMs: 250,
      layoutShiftMax: 0.1
    },
    artifactBudgets: {
      contractVersion: 'experience-artifact-budget/v1',
      configMaxBytes: 65536,
      simpleModelsMaxBytes: 524288,
      journeysMaxBytes: 1048576
    },
    migrationPolicy: {
      contractVersion: 'experience-migration-policy/v1',
      phase: 'contract-shadow',
      shadowOnly: true,
      visibleModeCutover: false,
      panelBootstrap: false
    },
    refusalCodes: [...REFUSAL_CODES]
  };
}

export function makeParameter(parameterId = 'threshold') {
  return {
    parameterId,
    label: 'Threshold',
    kind: 'number',
    unit: 'score',
    domain: { min: 0, max: 10, step: 1 },
    defaultValue: 5,
    defaultSource: 'registry',
    interpretation: 'Changes the modeled decision threshold.',
    affectsOutputPaths: ['summary.score'],
    disabledWhen: [],
    identityBearing: true
  };
}

export function makeModelDefinition({
  toolId = 'ordinary-tool',
  definitionId = `simple-model/${toolId}/v1`,
  adapterId = `simple-adapter/${toolId}/v1`,
  adapterModule = 'rlexperience-adapters/market-structure.js'
} = {}) {
  return {
    contractVersion: 'simple-model-definition/v1',
    definitionId,
    toolId,
    modelId: `${toolId}-model`,
    modelVersion: 'v1',
    researchQuestion: `How does ${toolId} change under explicit assumptions?`,
    resultSchemaId: 'simple-model-output/generic-scenario/v1',
    adapterId,
    adapterModule,
    inputRequirements: [{ requirementId: 'owner-evidence', sourceClass: 'owner-evidence', required: true, stalePolicy: 'reject' }],
    parameterDefinitions: [makeParameter('threshold'), { ...makeParameter('horizon'), label: 'Horizon', unit: 'sessions', domain: { min: 1, max: 20, step: 1 }, defaultValue: 5 }],
    scenarioDefinitions: [{ scenarioId: 'baseline', label: 'Baseline', parameterOverrides: {} }],
    seedPolicy: { required: false, defaultSeed: null, defaultSource: null, randomnessClass: 'none', commonRandomNumbersForSensitivity: false },
    sensitivityPolicy: { method: 'one-at-a-time', requireOutputEffect: true, flatRegionPolicy: 'explicit-proof' },
    calibrationPolicy: { class: 'owner-evidence-relative', requiredFields: ['state', 'reason'] },
    provenancePolicy: { allowedClasses: ['observed-fact', 'user-assumption', 'model-estimate', 'unavailable'], requireEvidenceCutoff: true },
    performancePolicy: { maxComputeMs: 250, deterministic: true },
    limitations: ['Declaration-only fixture; owner compute is outside the registry validator.'],
    deepLinkTargets: { power: `${toolId}.html#power`, journey: `${toolId}.html#journey` },
    definitionFingerprint: null
  };
}

export function makeJourneyDefinition({
  toolId = 'ordinary-tool',
  goalId = 'goal-one',
  mechanism = 'wizard'
} = {}) {
  const definitionId = `journey/${toolId}/${goalId}/v1`;
  const stepId = `${definitionId}/step/evaluate`;
  return {
    definition: {
      contractVersion: 'journey-definition/v1',
      definitionId,
      definitionVersion: 'v1',
      toolId,
      goalId,
      title: `Complete ${goalId}`,
      outcomeDescription: 'Produce a bounded, evidence-linked research outcome.',
      mechanism,
      prerequisiteRules: [{ ruleId: 'owner-evidence-current', predicate: 'all-required-evidence-current' }],
      contextSchema: { contractVersion: 'journey-context-schema/v1', allowedFields: ['evidenceIdentity', 'publicTargetId'], requiredFields: ['evidenceIdentity'] },
      stepIds: [stepId],
      evidencePolicy: { requiredSlots: ['owner-evidence'], allowedProvenance: ['owner-evidence', 'public-source'] },
      backtrackPolicy: { mode: 'transitive-dependents-stale', auditPriorOutcomes: true },
      staleEvidencePolicy: { mode: 'reopen-dependent-steps', preserveAudit: true },
      completionPolicy: { predicates: ['all-required-evidence-current'], outcomes: ['complete', 'partial', 'refused'] },
      packetPolicy: { contractVersion: 'journey-completion-packet/v1', humanSignoffRequired: true, noExecution: true },
      privacyClass: 'public-safe',
      noExecution: true,
      accessibility: { progressSemantics: 'ordered-list', currentStepSemantics: 'aria-current-step' },
      limitations: ['Research workflow only; no execution or portfolio mutation.'],
      definitionFingerprint: null
    },
    step: {
      contractVersion: 'journey-step/v1',
      stepId,
      definitionId,
      title: 'Evaluate evidence',
      purpose: 'Resolve the goal against current owner evidence.',
      mechanismRole: mechanism,
      dependsOnStepIds: [],
      inputSchema: { contractVersion: 'journey-step-input/v1', allowedFields: ['choice'], requiredFields: [] },
      allowedInputProvenance: ['user-assumption'],
      requiredEvidenceSlots: ['owner-evidence'],
      optionalEvidenceSlots: [],
      completionPredicate: 'all-required-evidence-current',
      branchRules: [],
      staleWhen: ['owner-evidence-changed'],
      invalidatesStepIds: [],
      ownerDeepLinks: [`${toolId}.html#power`],
      sideEffectPolicy: 'none',
      accessibility: { label: 'Evaluate evidence', description: 'Review current evidence and record a bounded outcome.' },
      stepFingerprint: null
    }
  };
}

export function makeTool({
  id = 'ordinary-tool',
  modelDefinitionId = `simple-model/${id}/v1`,
  adapterId = `simple-adapter/${id}/v1`,
  adapterModule = 'rlexperience-adapters/market-structure.js',
  journeyDefinitionIds = [`journey/${id}/goal-one/v1`, `journey/${id}/goal-two/v1`]
} = {}) {
  return {
    id,
    title: 'Ordinary Tool',
    nav: { label: 'Ordinary Tool', icon: 'T' },
    file: `${id}.html`,
    notes: `notes/${id}.md`,
    status: 'live',
    updated: '2026-07-22',
    blurb: 'A fixture used to validate production contract transformations.',
    tags: ['fixture'],
    briefing: {
      role: 'source',
      profile: 'live-market',
      readAdapter: `${id}-owner-v1`,
      readContractVersion: 'tool-model-read/v1',
      freshnessPolicy: 'daily-market-bars-v1',
      recommendationPolicy: 'market-action-v1',
      budgetPolicy: 'live-market-v1'
    },
    experience: {
      contractVersion: 'tool-experience/v1',
      kind: 'ordinary',
      viewSetId: 'ordinary-four-view/v1',
      viewIds: [...ORDINARY_VIEWS],
      simpleModelDefinitionId: modelDefinitionId,
      simpleAdapterId: adapterId,
      simpleAdapterModule: adapterModule,
      powerAdapterId: 'power-adapter/existing-owner-page/v1',
      briefPolicyId: 'web-evidence-policy/live-market/v1',
      journeyDefinitionIds,
      contextPolicyId: 'contextual-tooltip/v1',
      matrixDomains: ['technical'],
      publicAliases: []
    }
  };
}

export function makeMarketActionTool() {
  const tool = makeTool({
    id: 'market-brief',
    modelDefinitionId: null,
    adapterId: 'simple-adapter/market-action-triage/v1',
    adapterModule: 'rlexperience-adapters/market-action.js',
    journeyDefinitionIds: [
      'journey/market-action/prepare-session/v1',
      'journey/market-action/triage/v1',
      'journey/market-action/latent-risk/v1',
      'journey/market-action/portfolio-stress/v1'
    ]
  });
  tool.experience = {
    ...tool.experience,
    kind: 'market-action-center',
    viewSetId: 'market-action-center-four-view/v1',
    viewIds: [...MARKET_ACTION_VIEWS],
    powerAdapterId: 'power-adapter/in-view-evidence-disclosures/v1',
    briefPolicyId: 'web-evidence-policy/final-aggregator/v1',
    matrixDomains: [],
    publicAliases: ['Actionable Market Brief', 'Market Brief']
  };
  return tool;
}

export function makeFoundationPacket() {
  const ordinaryTool = makeTool();
  const marketTool = makeMarketActionTool();
  const ordinaryJourneys = [
    makeJourneyDefinition({ goalId: 'goal-one', mechanism: 'wizard' }),
    makeJourneyDefinition({ goalId: 'goal-two', mechanism: 'decision-tree' })
  ];
  const marketGoals = [
    ['prepare-session', 'wizard'],
    ['triage', 'decision-tree'],
    ['latent-risk', 'checklist'],
    ['portfolio-stress', 'scenario-lab']
  ].map(([goalId, mechanism]) => makeJourneyDefinition({ toolId: 'market-action', goalId, mechanism }));
  return {
    config: makeConfig(),
    registry: { site: 'Fixture', description: 'Fixture registry', updated: '2026-07-22', tools: [ordinaryTool, marketTool] },
    models: {
      contractVersion: 'simple-model-registry/v1',
      definitions: [
        makeModelDefinition(),
        makeModelDefinition({
          toolId: 'market-brief',
          definitionId: 'simple-model/market-action-triage/v1',
          adapterId: 'simple-adapter/market-action-triage/v1',
          adapterModule: 'rlexperience-adapters/market-action.js'
        })
      ]
    },
    journeys: {
      contractVersion: 'journey-registry/v1',
      definitions: [...ordinaryJourneys, ...marketGoals].map((item) => item.definition),
      steps: [...ordinaryJourneys, ...marketGoals].map((item) => item.step)
    }
  };
}

export function addValidOrdinaryTool(packet, id = 'valid-added-tool') {
  const next = clone(packet);
  const tool = makeTool({ id });
  next.registry.tools.push(tool);
  next.models.definitions.push(makeModelDefinition({ toolId: id }));
  for (const [goalId, mechanism] of [['goal-one', 'wizard'], ['goal-two', 'checklist']]) {
    const journey = makeJourneyDefinition({ toolId: id, goalId, mechanism });
    next.journeys.definitions.push(journey.definition);
    next.journeys.steps.push(journey.step);
  }
  return next;
}

export function expectError(result, code, fieldPath) {
  assert.equal(result.ok, false, 'mutation must fail closed');
  assert.equal(result.error.contractVersion, 'experience-error/v1');
  assert.equal(result.error.code, code);
  assert.equal(result.error.valueEchoed, false);
  if (fieldPath !== undefined) assert.equal(result.error.fieldPath, fieldPath);
  assert.deepEqual(Object.keys(result.error).sort(), [
    'code',
    'contractId',
    'contractVersion',
    'dependencyGateId',
    'fieldPath',
    'phase',
    'reason',
    'recoverable',
    'toolId',
    'valueEchoed'
  ]);
}