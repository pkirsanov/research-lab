import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { acquire, renderQueryPlan, resolveLanePolicy, validateBundle } from './web-evidence-acquire.mjs';
import { RESEARCH_AGENDA_ALLOWED_HOSTS } from './web-evidence-policy.mjs';

const require = createRequire(import.meta.url);
const RLAGENDA = require('../rlagenda.js');

export const RESEARCH_AGENDA_CONTRACTS = Object.freeze({
  acquisitionPlan: 'research-agenda-acquisition-plan/v1',
  situation: 'research-situation/v1',
  situationSet: 'research-situation-set/v1',
  candidate: 'research-agenda-candidate/v1',
  read: 'research-agenda-read/v1',
  transaction: 'research-agenda-transaction/v1'
});

const HASH_PATTERN = /^sha256:[0-9a-f]{64}$/;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ACQUISITION_USAGE_FIELDS = Object.freeze([
  'queryCount', 'candidateUrlCount', 'retainedOriginCount', 'retainedExcerptCount',
  'maxExcerptBytes', 'maxResponseBytesPerUrl', 'bundleBytes', 'maxRequestMs',
  'totalAcquisitionMs', 'peakConcurrentFetches'
]);
const SITUATION_FIELDS = Object.freeze([
  'contractVersion', 'generationId', 'topicId', 'authoredAt', 'completePass',
  'evidenceRecords', 'sectionInterpretations', 'findings', 'sourceLedger', 'newEvidenceIds', 'modelInputs'
]);
const MODEL_INPUT_FIELDS = Object.freeze(['chokepointState', 'inventoryGapByChannel', 'levers']);
const SECTION_INTERPRETATION_FIELDS = Object.freeze(['sectionId', 'status', 'interpretation', 'gaps']);
const FINDING_FIELDS = Object.freeze([
  'findingId', 'observedAt', 'claim', 'source', 'statedConfidence',
  'provenanceClass', 'evidenceRole', 'causalPath', 'refutedBy', 'limitations'
]);
const SECTION_STATES = Object.freeze(['changed', 'unchanged', 'stale', 'unavailable']);
const FORBIDDEN_SITUATION_KEYS = Object.freeze([
  'scenarioProbabilities', 'commodityRanges', 'proxyRanges', 'chartPoints',
  'chartSeries', 'changeAssessment', 'directionScore', 'modelOutputs'
]);
const SIDE_POOL_POLICY_FIELDS = Object.freeze([
  'timeoutSeconds', 'attempts', 'concurrency', 'maxInputBytes', 'maxOutputBytes'
]);

function isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isIso(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function canonicalize(value) {
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('non-finite number');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  if (isObject(value)) return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + canonicalize(value[key])).join(',') + '}';
  throw new Error('unsupported value');
}

function clone(value) {
  return JSON.parse(canonicalize(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object') return value;
  Object.keys(value).forEach((key) => deepFreeze(value[key]));
  return Object.freeze(value);
}

function fingerprint(value) {
  return 'sha256:' + createHash('sha256').update(canonicalize(value)).digest('hex');
}

function failure(code, reason, field = null, topicId = null) {
  return deepFreeze({ ok: false, error: { code, reason, field, topicId } });
}

function success(value) {
  return deepFreeze({ ok: true, value: deepFreeze(value) });
}

function exactKeys(value, keys) {
  return isObject(value) && Object.keys(value).sort().join('|') === [...keys].sort().join('|');
}

function containsForbiddenSituationKey(value) {
  if (Array.isArray(value)) return value.some(containsForbiddenSituationKey);
  if (!isObject(value)) return false;
  return Object.entries(value).some(([key, child]) => FORBIDDEN_SITUATION_KEYS.includes(key) || containsForbiddenSituationKey(child));
}

export function resolveResearchAgendaPolicy(config) {
  return resolveLanePolicy(config, 'research-agenda');
}

function requirementById(definition) {
  return Object.fromEntries((definition?.sourceRequirements || []).map((requirement) => [requirement.requirementId, requirement]));
}

function recordIsReusable(record, requirement, cutoffAt) {
  if (!isObject(record) || !isObject(requirement) || !isIso(cutoffAt)) return false;
  if (record.requirementId !== requirement.requirementId || !HASH_PATTERN.test(record.contentSha256 || '')) return false;
  if (!isIso(record.observedAt) || !isIso(record.availableAt) || Date.parse(record.availableAt) > Date.parse(cutoffAt)) return false;
  if (!Array.isArray(record.claimCoverage) || !requirement.requiredClaimCoverage.every((claim) => record.claimCoverage.includes(claim))) return false;
  const ageHours = (Date.parse(cutoffAt) - Date.parse(record.observedAt)) / 3600000;
  return ageHours >= 0 && ageHours <= requirement.freshnessHours;
}

export function planResearchAgendaAcquisition({ plan, definitionsByTopicId, evidenceByTopicId, cutoffAt }) {
  if (!isObject(plan) || plan.ok !== true || !Array.isArray(plan.selected) || !isObject(definitionsByTopicId) || !isObject(evidenceByTopicId) || !isIso(cutoffAt)) {
    return failure('E019-AGENDA-ACQUISITION', 'input-invalid');
  }
  const topics = [];
  const missingRequirements = [];
  for (const selected of plan.selected) {
    const definition = definitionsByTopicId[selected.topicId];
    if (!isObject(definition) || !Array.isArray(definition.sourceRequirements)) {
      return failure('E019-AGENDA-ACQUISITION', 'definition-missing', 'definitionsByTopicId', selected.topicId);
    }
    const requirements = requirementById(definition);
    const records = Array.isArray(evidenceByTopicId[selected.topicId]) ? evidenceByTopicId[selected.topicId] : [];
    const rows = Object.values(requirements).map((requirement) => {
      const record = records.find((candidate) => candidate.requirementId === requirement.requirementId && recordIsReusable(candidate, requirement, cutoffAt));
      const row = {
        topicId: selected.topicId,
        requirementId: requirement.requirementId,
        state: record ? 'reused' : 'missing-or-stale',
        record: record ? clone(record) : null,
        requirement: clone(requirement)
      };
      if (!record) missingRequirements.push(row);
      return row;
    });
    topics.push({ topicId: selected.topicId, requirements: rows });
  }
  const body = {
    contractVersion: RESEARCH_AGENDA_CONTRACTS.acquisitionPlan,
    cutoffAt,
    selectedTopicIds: plan.selected.map((row) => row.topicId),
    topics,
    reusedCount: topics.flatMap((topic) => topic.requirements).filter((row) => row.state === 'reused').length,
    missingOrStaleCount: missingRequirements.length,
    missingRequirements: missingRequirements.map((row) => ({ topicId: row.topicId, requirementId: row.requirementId }))
  };
  return success({ ...body, planFingerprint: fingerprint(body) });
}

export function buildResearchAgendaQueryInput({ acquisitionPlan, definitionsByTopicId, runId, cutoffAt, policy }) {
  if (!isObject(acquisitionPlan) || acquisitionPlan.contractVersion !== RESEARCH_AGENDA_CONTRACTS.acquisitionPlan || !isObject(definitionsByTopicId) || !isObject(policy) || !isIso(cutoffAt)) {
    return failure('E019-AGENDA-ACQUISITION', 'query-input-invalid');
  }
  if (acquisitionPlan.missingOrStaleCount === 0) return success(null);
  if (acquisitionPlan.missingOrStaleCount > policy.maxQueries) return failure('E012-WEB-BUDGET', 'candidate-cardinality-over-cap');
  const maxResults = Math.max(1, Math.floor(policy.maxCandidateUrls / acquisitionPlan.missingOrStaleCount));
  const templates = acquisitionPlan.missingRequirements.map((missing) => {
    const requirement = requirementById(definitionsByTopicId[missing.topicId])[missing.requirementId];
    return {
      templateId: missing.topicId + '-' + missing.requirementId,
      termsTemplate: requirement.queryTemplate,
      purpose: missing.requirementId,
      allowedHosts: RESEARCH_AGENDA_ALLOWED_HOSTS.map((entry) => ({ ...entry })),
      requiredSourceClasses: requirement.sourceClasses.slice(),
      freshnessWindowDays: Math.max(1, Math.ceil(requirement.freshnessHours / 24)),
      maxResults
    };
  });
  return success({ toolId: 'research-agenda', runId, cutoffAt, templates, facts: {} });
}

export function validateResearchAgendaAcquisitionUsage(usage, policy) {
  if (!isObject(usage) || !isObject(policy) || !ACQUISITION_USAGE_FIELDS.every((field) => Number.isInteger(usage[field]) && usage[field] >= 0)) {
    return failure('E019-AGENDA-ACQUISITION', 'usage-invalid');
  }
  const limits = {
    queryCount: policy.maxQueries,
    candidateUrlCount: policy.maxCandidateUrls,
    retainedOriginCount: policy.maxRetainedOrigins,
    retainedExcerptCount: policy.maxRetainedExcerpts,
    maxExcerptBytes: policy.maxExcerptBytes,
    maxResponseBytesPerUrl: policy.maxResponseBytesPerUrl,
    bundleBytes: policy.maxBundleBytes,
    maxRequestMs: policy.perRequestTimeoutMs,
    totalAcquisitionMs: policy.totalAcquisitionMs,
    peakConcurrentFetches: policy.maxConcurrentFetches
  };
  for (const field of ACQUISITION_USAGE_FIELDS) {
    if (usage[field] > limits[field]) return failure('E012-WEB-BUDGET', 'agenda-' + field + '-over-cap', field);
  }
  return success({ usage: clone(usage), limits });
}

export async function acquireResearchAgendaEvidence({ config, queryInput, boundary, acquisitionStartedAt, frozenAt, claimSpecs = [], ownerEvidence = {} }) {
  const policyResult = resolveResearchAgendaPolicy(config);
  if (!policyResult.ok) return policyResult;
  if (queryInput === null) return success({ state: 'fully-reused', policy: policyResult.value, bundle: null });
  const queryPlan = renderQueryPlan(queryInput, policyResult.value);
  if (!queryPlan.ok) return queryPlan;
  const acquired = await acquire({
    queryPlan: queryPlan.value,
    policy: policyResult.value,
    claimSpecs,
    ownerEvidence,
    boundary,
    acquisitionStartedAt,
    frozenAt
  });
  if (!acquired.ok) return acquired;
  const bundleValidation = validateBundle(acquired.value, policyResult.value);
  if (!bundleValidation.ok) return bundleValidation;
  return success({ state: 'acquired', policy: policyResult.value, queryPlan: queryPlan.value, bundle: acquired.value });
}

export function validateResearchSituation(situation, { generationId, topic, definition }) {
  if (!exactKeys(situation, SITUATION_FIELDS) || situation.contractVersion !== RESEARCH_AGENDA_CONTRACTS.situation ||
      situation.generationId !== generationId || situation.topicId !== topic?.topicId || !isIso(situation.authoredAt) ||
      typeof situation.completePass !== 'boolean' || !Array.isArray(situation.evidenceRecords) ||
      !Array.isArray(situation.sectionInterpretations) || !Array.isArray(situation.findings) ||
      !Array.isArray(situation.sourceLedger) || !Array.isArray(situation.newEvidenceIds) || !isObject(situation.modelInputs) ||
      !exactKeys(situation.modelInputs, MODEL_INPUT_FIELDS) || !isObject(situation.modelInputs.chokepointState) ||
      !isObject(situation.modelInputs.inventoryGapByChannel) || !isObject(situation.modelInputs.levers) || containsForbiddenSituationKey(situation)) {
    return failure('E019-AGENDA-SITUATION', 'situation-shape-invalid', null, topic?.topicId || null);
  }
  const requiredSectionIds = definition.analyticalSections.map((section) => section.sectionId);
  const observedSectionIds = situation.sectionInterpretations.map((section) => section.sectionId);
  if (new Set(observedSectionIds).size !== observedSectionIds.length ||
      requiredSectionIds.length !== observedSectionIds.length ||
      !requiredSectionIds.every((sectionId) => observedSectionIds.includes(sectionId))) {
    return failure('E019-AGENDA-SITUATION', 'section-accounting-invalid', 'sectionInterpretations', topic.topicId);
  }
  for (const section of situation.sectionInterpretations) {
    if (!exactKeys(section, SECTION_INTERPRETATION_FIELDS) || !SECTION_STATES.includes(section.status) ||
        typeof section.interpretation !== 'string' || !Array.isArray(section.gaps)) {
      return failure('E019-AGENDA-SITUATION', 'section-shape-invalid', section.sectionId || null, topic.topicId);
    }
  }
  for (const evidence of situation.evidenceRecords) {
    const validated = RLAGENDA.validateEvidenceRecord(evidence, definition.evidencePolicy);
    if (!validated.ok) return failure(validated.code, 'evidence-invalid', validated.field || null, topic.topicId);
  }
  for (const finding of situation.findings) {
    if (!exactKeys(finding, FINDING_FIELDS) || !ID_PATTERN.test(finding.findingId || '') || !isIso(finding.observedAt) ||
        typeof finding.claim !== 'string' || !isObject(finding.source) || !isObject(finding.statedConfidence) ||
        !RLAGENDA.PROVENANCE_CLASSES.includes(finding.provenanceClass) || !RLAGENDA.EVIDENCE_ROLES.includes(finding.evidenceRole) ||
        !Array.isArray(finding.causalPath) || !Array.isArray(finding.refutedBy) || !Array.isArray(finding.limitations)) {
      return failure('E019-AGENDA-SITUATION', 'finding-shape-invalid', 'findings', topic.topicId);
    }
  }
  const evidenceIds = new Set(situation.evidenceRecords.map((record) => record.evidenceId));
  if (situation.newEvidenceIds.some((evidenceId) => !evidenceIds.has(evidenceId))) {
    return failure('E019-AGENDA-SITUATION', 'new-evidence-ref-invalid', 'newEvidenceIds', topic.topicId);
  }
  return success(clone(situation));
}

function validateSidePoolPolicy(policy) {
  return exactKeys(policy, SIDE_POOL_POLICY_FIELDS) && policy.timeoutSeconds === 900 && policy.attempts === 1 &&
    policy.concurrency === 1 && Number.isInteger(policy.maxInputBytes) && policy.maxInputBytes > 0 &&
    Number.isInteger(policy.maxOutputBytes) && policy.maxOutputBytes > 0;
}

export async function runResearchSidePool({ topics, generationId, policy, authorFn, timer = null }) {
  if (!Array.isArray(topics) || !validateSidePoolPolicy(policy) || typeof authorFn !== 'function') {
    return failure('E019-AGENDA-AUTHOR', 'side-pool-config-invalid');
  }
  const situationsByTopicId = {};
  const failuresByTopicId = {};
  let peakConcurrency = 0;
  let active = 0;
  let calls = 0;
  for (const entry of topics) {
    const request = deepFreeze({
      contractVersion: 'research-author-request/v1',
      generationId,
      topicId: entry.topic.topicId,
      capabilities: { web: false, shell: false },
      topic: clone(entry.topic),
      definition: clone(entry.definition),
      acquisition: clone(entry.acquisition || null),
      committedEvidence: clone(entry.committedEvidence || [])
    });
    if (Buffer.byteLength(canonicalize(request)) > policy.maxInputBytes) {
      failuresByTopicId[entry.topic.topicId] = 'author-input-over-budget';
      continue;
    }
    calls += 1;
    active += 1;
    peakConcurrency = Math.max(peakConcurrency, active);
    try {
      const invocation = Promise.resolve().then(() => authorFn(request));
      const response = timer && typeof timer.withTimeout === 'function'
        ? await timer.withTimeout(invocation, policy.timeoutSeconds * 1000)
        : await invocation;
      if (Buffer.byteLength(canonicalize(response)) > policy.maxOutputBytes) {
        failuresByTopicId[entry.topic.topicId] = 'author-output-over-budget';
      } else {
        const validated = validateResearchSituation(response, { generationId, topic: entry.topic, definition: entry.definition });
        if (validated.ok) situationsByTopicId[entry.topic.topicId] = validated.value;
        else failuresByTopicId[entry.topic.topicId] = validated.error.reason;
      }
    } catch (error) {
      failuresByTopicId[entry.topic.topicId] = error?.code === 'ETIMEDOUT' ? 'author-timeout' : 'author-failed';
    } finally {
      active -= 1;
    }
  }
  return success({
    contractVersion: RESEARCH_AGENDA_CONTRACTS.situationSet,
    generationId,
    situationsByTopicId,
    failuresByTopicId,
    telemetry: { calls, attempts: calls, peakConcurrency, timeoutSeconds: policy.timeoutSeconds }
  });
}

export async function runResearchSidePoolAlongsideCritical({ criticalRun, researchRequest }) {
  if (typeof criticalRun !== 'function' || !isObject(researchRequest)) {
    return failure('E019-AGENDA-AUTHOR', 'side-pool-coordinator-invalid');
  }
  const [criticalResults, researchResult] = await Promise.all([
    Promise.resolve().then(() => criticalRun()),
    runResearchSidePool(researchRequest)
  ]);
  return success({ criticalResults, researchResult });
}

export function computeResearchAgendaOutputs({ definition, calibration, situation, currentBars, generationCutoff }) {
  if (!isObject(definition) || !isObject(calibration) || !isObject(situation) || !isObject(currentBars) || !isIso(generationCutoff)) {
    return failure('E019-AGENDA-MODEL', 'model-input-invalid');
  }
  const evidenceLedger = [];
  const impacts = [];
  for (const evidence of situation.evidenceRecords) {
    const weighted = RLAGENDA.computeEvidenceWeight(evidence, definition.evidencePolicy, generationCutoff);
    if (!weighted.ok) return failure(weighted.code, 'evidence-weight-invalid', weighted.field || null, definition.topicId);
    evidenceLedger.push({ evidenceId: evidence.evidenceId, weight: weighted.weight, boundedImpact: weighted.boundedImpact, exclusionReason: weighted.exclusionReason, conflicts: weighted.conflicts, firedRefuters: weighted.firedRefuters });
    if (weighted.boundedImpact !== 0) {
      for (const impact of evidence.modelImpacts) impacts.push({ targetId: impact.targetId, weightedImpact: weighted.boundedImpact });
    }
  }
  if (!isObject(definition.scenarioTree) || !isObject(definition.flowNetwork) || !Array.isArray(definition.transmissionModels) || !Array.isArray(definition.proxyDefinitions)) {
    return failure('E019-AGENDA-MODEL', 'topic-model-not-applicable', null, definition.topicId);
  }
  const probabilities = RLAGENDA.updateEscalationProbabilities(definition.scenarioTree, impacts, { maxAbsoluteImpact: definition.evidencePolicy.impactCaps.direct });
  if (!probabilities.ok) return failure(probabilities.code, 'probability-model-invalid', null, definition.topicId);
  const byScenario = {};
  for (const scenarioId of Object.keys(probabilities.probabilities)) {
    const flow = RLAGENDA.computeFlowState(definition.flowNetwork, situation.modelInputs.chokepointState, scenarioId);
    if (!flow.ok) return failure(flow.code, 'flow-model-invalid', null, definition.topicId);
    byScenario[scenarioId] = flow;
  }
  const commodity = RLAGENDA.computeCommodityShockRanges(
    probabilities.probabilities,
    { byScenario, inventoryGapByChannel: situation.modelInputs.inventoryGapByChannel },
    definition.transmissionModels,
    currentBars,
    situation.modelInputs.levers
  );
  if (!commodity.ok) return failure('E019-AGENDA-MODEL', 'commodity-model-unavailable', null, definition.topicId);
  const channelRanges = Object.fromEntries(commodity.channels.map((row) => [row.channelId, row.range]));
  const proxy = RLAGENDA.computeEquityProxyRanges(channelRanges, definition.proxyDefinitions, calibration.events, currentBars, situation.modelInputs.levers);
  if (!proxy.ok) return failure('E019-AGENDA-MODEL', 'proxy-model-insufficient', null, definition.topicId);
  const rootNodes = definition.scenarioTree.nodes.filter((node) => node.parentId === null);
  const directionScore = rootNodes.reduce((sum, node) => sum + probabilities.probabilities[node.scenarioId].unconditional * node.directionValue, 0);
  const dominantScenarioId = rootNodes.slice().sort((left, right) => probabilities.probabilities[right.scenarioId].unconditional - probabilities.probabilities[left.scenarioId].unconditional)[0]?.scenarioId || null;
  const compactBars = Object.fromEntries(Object.entries(currentBars).map(([ticker, bar]) => [ticker, {
    sym: bar?.sym || ticker,
    asof: bar?.asof || null,
    latest: Array.isArray(bar?.rows) && bar.rows.length ? clone(bar.rows[bar.rows.length - 1]) : null
  }]));
  const publishedInputs = {
    evidenceImpacts: impacts.map((impact) => ({ ...impact })),
    chokepointState: clone(situation.modelInputs.chokepointState),
    inventoryGapByChannel: clone(situation.modelInputs.inventoryGapByChannel),
    levers: clone(situation.modelInputs.levers),
    currentBars: compactBars,
    calibrationEvents: clone(calibration.events)
  };
  return success({
    evidenceLedger,
    scenarioProbabilities: probabilities.probabilities,
    scenarioProbability: probabilities.probabilities,
    flowStates: byScenario,
    physicalFlow: byScenario,
    channelRanges,
    proxyRanges: Object.fromEntries(proxy.proxies.map((row) => [row.proxyId, row.range])),
    directionScore,
    dominantScenarioId,
    evidenceCoverage: situation.evidenceRecords.length ? evidenceLedger.filter((row) => row.weight > 0).length / situation.evidenceRecords.length : 0,
    publishedInputs
  });
}

function newestEvidenceAgeHours(records, cutoffAt) {
  if (!records.length) return null;
  const newest = Math.max(...records.map((record) => Date.parse(record.observedAt)));
  return (Date.parse(cutoffAt) - newest) / 3600000;
}

function freshnessWindowHours(topic) {
  return topic.reviewPolicy.mode === 'every-generation'
    ? topic.reviewPolicy.freshnessWindowHours
    : topic.reviewPolicy.freshnessWindowDays * 24;
}

function reviewSectionRows(definition, situation, fallbackState) {
  const byId = new Map((situation?.sectionInterpretations || []).map((section) => [section.sectionId, section]));
  return definition.analyticalSections.map((section) => {
    const authored = byId.get(section.sectionId);
    return {
      sectionId: section.sectionId,
      status: authored?.status || fallbackState,
      interpretation: authored?.interpretation || '',
      gaps: authored?.gaps ? authored.gaps.slice() : []
    };
  });
}

export function composeResearchAgendaCandidate({
  registry, plan, definitionsByTopicId, generationId, generationCutoff,
  situationsByTopicId = {}, failuresByTopicId = {}, deterministicOutputsByTopicId = {}, priorDossiersByTopicId = {}
}) {
  if (!isObject(registry) || !isObject(plan) || plan.ok !== true || !Array.isArray(plan.classifications) ||
      !isObject(definitionsByTopicId) || typeof generationId !== 'string' || !isIso(generationCutoff)) {
    return failure('E019-AGENDA-CANDIDATE', 'candidate-input-invalid');
  }
  const topicById = Object.fromEntries(registry.topics.map((topic) => [topic.topicId, topic]));
  const selectedIds = new Set(plan.selected.map((selected) => selected.topicId));
  const reviews = [];
  const dossiers = [];
  const classifications = [];
  for (const planned of plan.classifications) {
    const topic = topicById[planned.topicId];
    const definition = definitionsByTopicId[planned.topicId];
    if (!topic || !definition) {
      classifications.push({ topicId: planned.topicId, state: 'refused', reason: 'definition-missing', reviewId: null, dossierId: null });
      continue;
    }
    if (!selectedIds.has(planned.topicId)) {
      classifications.push({ topicId: planned.topicId, state: planned.status, reason: planned.reason, reviewId: null, dossierId: priorDossiersByTopicId[planned.topicId]?.dossierId || null });
      continue;
    }
    const failureReason = failuresByTopicId[planned.topicId];
    const situation = situationsByTopicId[planned.topicId];
    const prior = priorDossiersByTopicId[planned.topicId] || null;
    const reusablePrior = prior && prior.historicalOnly !== true ? prior : null;
    let outcome;
    let reason = null;
    let newestEvidenceAge = null;
    if (failureReason || !situation) {
      outcome = 'unavailable';
      reason = failureReason || 'research-situation-missing';
    } else {
      const validated = validateResearchSituation(situation, { generationId, topic, definition });
      if (!validated.ok || situation.completePass !== true) {
        outcome = 'unavailable';
        reason = validated.ok ? 'research-pass-incomplete' : validated.error.reason;
      } else if (situation.evidenceRecords.length === 0) {
        outcome = reusablePrior ? 'unchanged' : 'unavailable';
        reason = reusablePrior ? 'complete-pass-no-new-evidence' : 'no-usable-evidence';
      } else {
        newestEvidenceAge = newestEvidenceAgeHours(situation.evidenceRecords, generationCutoff);
        if (newestEvidenceAge > freshnessWindowHours(topic)) {
          outcome = 'stale';
          reason = 'newest-evidence-outside-window';
        } else if (situation.newEvidenceIds.length === 0 && reusablePrior) {
          outcome = 'unchanged';
          reason = 'complete-pass-no-new-evidence';
        } else if (!isObject(deterministicOutputsByTopicId[planned.topicId])) {
          outcome = 'unavailable';
          reason = 'deterministic-output-missing';
        } else {
          outcome = 'updated';
        }
      }
    }
    const reviewBody = {
      contractVersion: RLAGENDA.REVIEW_VERSION,
      generationId,
      topicId: planned.topicId,
      mode: planned.mode,
      selectionReason: planned.reason,
      attemptedAt: generationCutoff,
      completePass: !!situation?.completePass,
      outcome,
      reason,
      newestEvidenceAgeHours: newestEvidenceAge,
      sectionStates: reviewSectionRows(definition, situation, outcome === 'stale' ? 'stale' : 'unavailable'),
      evidenceIds: outcome === 'unavailable' ? [] : (situation?.evidenceRecords || []).map((record) => record.evidenceId),
      modelOutputs: outcome === 'updated' ? clone(deterministicOutputsByTopicId[planned.topicId]) : null,
      predecessorDossierId: reusablePrior?.dossierId || null,
      dossierId: null
    };
    const reviewIdentity = RLAGENDA.deriveReviewId({
      generationId,
      topicId: planned.topicId,
      definitionDigest: fingerprint(definition),
      calibrationDigest: definition.calibrationRef ? fingerprint(definition.calibrationRef) : fingerprint(null),
      evidenceBundleDigest: fingerprint(situation?.evidenceRecords || [])
    });
    if (!reviewIdentity.ok) return failure(reviewIdentity.code, 'review-identity-invalid', reviewIdentity.field, planned.topicId);
    const review = { ...reviewBody, reviewId: reviewIdentity.id, validationState: 'validated', historicalOnly: false };
    if (outcome === 'updated') {
      const dossierBody = {
        contractVersion: RLAGENDA.DOSSIER_VERSION,
        topicId: planned.topicId,
        generationId,
        reviewId: review.reviewId,
        historicalOnly: false,
        validationState: 'validated',
        observedThrough: generationCutoff,
        outcome,
        predecessorDossierId: reusablePrior?.dossierId || null,
        supersedesDossierId: reusablePrior?.dossierId || null,
        declaredQuestionSha256: RLAGENDA.sha256Text(topic.declaredQuestion),
        sectionStates: clone(review.sectionStates),
        findings: clone(situation.findings),
        evidenceRecords: clone(situation.evidenceRecords),
        sourceLedger: clone(situation.sourceLedger),
        modelOutputs: clone(deterministicOutputsByTopicId[planned.topicId])
      };
      const dossierIdentity = RLAGENDA.deriveDossierId(dossierBody);
      if (!dossierIdentity.ok) return failure(dossierIdentity.code, 'dossier-identity-invalid', dossierIdentity.field, planned.topicId);
      const dossier = { ...dossierBody, dossierId: dossierIdentity.id };
      review.dossierId = dossier.dossierId;
      dossiers.push(dossier);
    } else if (outcome === 'unchanged') {
      review.dossierId = reusablePrior.dossierId;
    }
    reviews.push(review);
    classifications.push({ topicId: planned.topicId, state: outcome === 'unavailable' ? 'unavailable' : 'reviewed', reason, reviewId: review.reviewId, dossierId: review.dossierId });
  }
  if (classifications.length !== registry.topics.length || classifications.filter((row) => row.state === 'refused').length !== plan.refusals.length) {
    return failure('E019-AGENDA-CANDIDATE', 'topic-accounting-invalid');
  }
  for (const topic of registry.topics.filter((row) => row.lifecycleState === 'active' && row.reviewPolicy.mode === 'every-generation')) {
    const classification = classifications.find((row) => row.topicId === topic.topicId);
    if (!classification || !['reviewed', 'unavailable'].includes(classification.state) || !classification.reviewId) {
      return failure('E019-AGENDA-CANDIDATE', 'mandatory-current-review-missing', null, topic.topicId);
    }
  }
  const body = {
    contractVersion: RESEARCH_AGENDA_CONTRACTS.candidate,
    generationId,
    generationCutoff,
    declaredTopicCount: registry.topics.length,
    classifications,
    reviews,
    dossiers
  };
  return success({ ...body, candidateFingerprint: fingerprint(body) });
}

export function buildResearchAgendaRead(candidate) {
  if (!isObject(candidate) || candidate.contractVersion !== RESEARCH_AGENDA_CONTRACTS.candidate) {
    return failure('E019-AGENDA-READ', 'candidate-invalid');
  }
  const body = {
    contractVersion: RESEARCH_AGENDA_CONTRACTS.read,
    generationId: candidate.generationId,
    asOf: candidate.generationCutoff,
    topics: candidate.classifications.map((classification) => {
      const review = candidate.reviews.find((row) => row.reviewId === classification.reviewId);
      return {
        topicId: classification.topicId,
        state: classification.state,
        reason: classification.reason,
        reviewId: classification.reviewId,
        dossierId: classification.dossierId,
        outcome: review?.outcome || classification.state,
        newestEvidenceAgeHours: review?.newestEvidenceAgeHours ?? null
      };
    })
  };
  return success({ ...body, readFingerprint: fingerprint(body) });
}

export function validateResearchAgendaRead(read, registry) {
  const result = RLAGENDA.validateAgendaRead(read, registry);
  if (!result.ok) return failure('E019-AGENDA-READ', result.code, result.field || null);
  return success(clone(read));
}

function jsonBytes(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

export function buildResearchAgendaTransaction({ candidate, payload, historyText, registry, existingRecordsByPath = {} }) {
  if (!isObject(registry)) return failure('E019-AGENDA-TRANSACTION', 'transaction-input-invalid', 'registry');
  if (!isObject(candidate) || candidate.contractVersion !== RESEARCH_AGENDA_CONTRACTS.candidate || !isObject(payload) ||
      typeof historyText !== 'string' || !isObject(existingRecordsByPath)) return failure('E019-AGENDA-TRANSACTION', 'transaction-input-invalid');
  const { candidateFingerprint, ...candidateBody } = candidate;
  if (candidateFingerprint !== fingerprint(candidateBody)) return failure('E019-AGENDA-TRANSACTION', 'candidate-fingerprint-invalid');
  const immutableFiles = {};
  const recordsByPath = { ...existingRecordsByPath };
  const generation = {
    contractVersion: RLAGENDA.GENERATION_VERSION,
    generationId: candidate.generationId,
    generationCutoff: candidate.generationCutoff,
    validationState: 'validated',
    historicalOnly: false,
    declaredTopicCount: candidate.declaredTopicCount,
    classifications: clone(candidate.classifications),
    candidateFingerprint
  };
  const generationPath = `research/agenda/generations/${candidate.generationId}.json`;
  const generationCreate = RLAGENDA.prepareImmutableCreate(generationPath, generation, recordsByPath);
  if (!generationCreate.ok) return failure(generationCreate.code, 'generation-create-refused', generationPath);
  immutableFiles[generationPath] = jsonBytes(generation);
  recordsByPath[generationPath] = generation;
  const reviewRefs = {};
  const dossierRefs = {};
  for (const review of candidate.reviews) {
    const reviewPath = `research/agenda/reviews/${review.topicId}/${review.generationId}.json`;
    const prepared = RLAGENDA.prepareImmutableCreate(reviewPath, review, recordsByPath);
    if (!prepared.ok) return failure(prepared.code, 'review-create-refused', reviewPath, review.topicId);
    immutableFiles[reviewPath] = jsonBytes(review);
    recordsByPath[reviewPath] = review;
    reviewRefs[review.reviewId] = RLAGENDA.buildArtifactRef(reviewPath, review).ref;
  }
  for (const dossier of candidate.dossiers) {
    const dossierPath = `research/agenda/dossiers/${dossier.topicId}/${dossier.dossierId}.json`;
    const prepared = RLAGENDA.prepareImmutableCreate(dossierPath, dossier, recordsByPath);
    if (!prepared.ok) return failure(prepared.code, 'dossier-create-refused', dossierPath, dossier.topicId);
    immutableFiles[dossierPath] = jsonBytes(dossier);
    recordsByPath[dossierPath] = dossier;
    dossierRefs[dossier.dossierId] = RLAGENDA.buildArtifactRef(dossierPath, dossier).ref;
  }
  for (const [path, record] of Object.entries(existingRecordsByPath)) {
    if (record?.contractVersion === RLAGENDA.DOSSIER_VERSION && record.historicalOnly !== true) {
      dossierRefs[record.dossierId] = RLAGENDA.buildArtifactRef(path, record).ref;
    }
  }
  const generationRef = RLAGENDA.buildArtifactRef(generationPath, generation).ref;
  const events = [];
  const generationEvent = RLAGENDA.buildHistoryEvent({
    contractVersion: RLAGENDA.HISTORY_EVENT_VERSION,
    eventType: 'generation',
    occurredAt: candidate.generationCutoff,
    topicId: null,
    generationId: candidate.generationId,
    reviewId: null,
    dossierId: null,
    correctsEventId: null,
    supersedesEventId: null,
    artifactRef: generationRef
  });
  if (!generationEvent.ok) return failure(generationEvent.code, 'generation-event-invalid');
  events.push(generationEvent.event);
  for (const review of candidate.reviews) {
    const event = RLAGENDA.buildHistoryEvent({
      contractVersion: RLAGENDA.HISTORY_EVENT_VERSION,
      eventType: 'review',
      occurredAt: candidate.generationCutoff,
      topicId: review.topicId,
      generationId: candidate.generationId,
      reviewId: review.reviewId,
      dossierId: review.dossierId,
      correctsEventId: null,
      supersedesEventId: null,
      artifactRef: reviewRefs[review.reviewId]
    });
    if (!event.ok) return failure(event.code, 'review-event-invalid', null, review.topicId);
    events.push(event.event);
  }
  const history = RLAGENDA.appendHistoryEvents(historyText, events);
  if (!history.ok) return failure(history.code, 'history-append-invalid');
  const current = {
    contractVersion: RLAGENDA.CURRENT_VERSION,
    updatedAt: candidate.generationCutoff,
    generationRef,
    topicRefs: candidate.classifications.map((classification) => ({
      topicId: classification.topicId,
      state: classification.state,
      reviewRef: classification.reviewId ? reviewRefs[classification.reviewId] : null,
      dossierRef: classification.dossierId ? (dossierRefs[classification.dossierId] || null) : null
    }))
  };
  const currentValidation = RLAGENDA.validateCurrentPointer(current, recordsByPath);
  if (!currentValidation.ok) return failure(currentValidation.code, 'current-pointer-invalid');
  const readResult = buildResearchAgendaRead(candidate);
  if (!readResult.ok) return readResult;
  const toolReadResult = RLAGENDA.buildAgendaToolRead(readResult.value, registry);
  if (!toolReadResult.ok) return failure('E019-AGENDA-READ', toolReadResult.code, toolReadResult.field || null);
  const payloadCandidate = {
    ...clone(payload),
    researchAgenda: readResult.value,
    toolReads: { ...(clone(payload.toolReads || {})), 'research-agenda-lab': toolReadResult.value }
  };
  const mutableFiles = {
    'research/agenda/history.jsonl': history.candidateText,
    'market-brief.payload.json': jsonBytes(payloadCandidate),
    'research/agenda/current.json': jsonBytes(current)
  };
  const immutablePaths = Object.keys(immutableFiles).sort();
  const writeOrder = [...immutablePaths, 'research/agenda/history.jsonl', 'market-brief.payload.json', 'research/agenda/current.json'];
  return success({
    contractVersion: RESEARCH_AGENDA_CONTRACTS.transaction,
    generationId: candidate.generationId,
    immutableFiles,
    mutableFiles,
    writeOrder,
    pointerLast: 'research/agenda/current.json',
    payload: payloadCandidate,
    current,
    recordsByPath,
    transactionFingerprint: fingerprint({ immutableFiles, mutableFiles, writeOrder })
  });
}

export function promoteResearchAgendaTransaction(transaction, io) {
  if (!isObject(transaction) || transaction.contractVersion !== RESEARCH_AGENDA_CONTRACTS.transaction || !isObject(io) ||
      !['exists', 'read', 'create', 'replace', 'remove'].every((name) => typeof io[name] === 'function')) {
    return failure('E019-AGENDA-TRANSACTION', 'promotion-input-invalid');
  }
  if (transaction.writeOrder.at(-1) !== transaction.pointerLast || transaction.pointerLast !== 'research/agenda/current.json') {
    return failure('E019-AGENDA-TRANSACTION', 'pointer-not-last');
  }
  const mutablePaths = Object.keys(transaction.mutableFiles);
  const baselines = Object.fromEntries(mutablePaths.map((path) => [path, io.exists(path) ? io.read(path) : null]));
  const created = [];
  const written = [];
  try {
    for (const path of transaction.writeOrder) {
      if (path in transaction.immutableFiles) {
        if (io.exists(path)) throw Object.assign(new Error('immutable target exists'), { code: 'immutable-overwrite' });
        io.create(path, transaction.immutableFiles[path]);
        created.push(path);
      } else {
        io.replace(path, transaction.mutableFiles[path]);
      }
      written.push(path);
    }
    return success({ written, pointerLast: written.at(-1), immutableCount: created.length });
  } catch (error) {
    for (const path of mutablePaths.reverse()) {
      if (baselines[path] === null) io.remove(path);
      else io.replace(path, baselines[path]);
    }
    for (const path of created.reverse()) io.remove(path);
    return failure('E019-AGENDA-TRANSACTION', error?.code || 'promotion-failed');
  }
}