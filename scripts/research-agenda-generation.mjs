import { createRequire } from 'node:module';
import {
  buildBriefPageArtifactsFromInputs,
  OUTPUTS as BRIEF_PAGE_OUTPUTS,
  serializeBriefPageArtifacts
} from './build-brief-page-artifacts.mjs';
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

export const FEATURE_019_ARTIFACT_FAMILIES = Object.freeze([
  'registry',
  'definition',
  'calibration',
  'umd-module',
  'experience-adapter',
  'tool-page',
  'tool-note',
  'generation',
  'review',
  'dossier',
  'source',
  'lifecycle',
  'correction',
  'current',
  'feature-020-seam',
  'history-ledger',
  'research-agenda-read',
  'tool-read',
  'payload',
  'page-candidate'
]);

const HASH_PATTERN = /^sha256:[0-9a-f]{64}$/;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ARTIFACT_BUDGET_POLICY_ID = 'artifact-budget/v1';
const ARTIFACT_BUDGET_POLICY_FIELDS = Object.freeze([
  'contractVersion',
  'policyId',
  'maxBarsPerSymbolTradingDate',
  'maxSymbolsPerRun',
  'maxNormalizedObservationBytes',
  'rawBodyRetention'
]);
const FEATURE_019_FAMILY_SET = new Set(FEATURE_019_ARTIFACT_FAMILIES);
const REUSABLE_LEDGER_FIELDS = Object.freeze([
  'requirementId', 'sourceId', 'contentSha256', 'observedAt',
  'availableAt', 'claimCoverage', 'freshnessPolicyRef'
]);
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
const SECTION_STATES = Object.freeze(['changed', 'unchanged', 'stale', 'unavailable']);
const FORBIDDEN_SITUATION_KEYS = Object.freeze([
  'scenarioProbabilities', 'commodityRanges', 'proxyRanges', 'chartPoints',
  'chartSeries', 'changeAssessment', 'directionScore', 'modelOutputs'
]);
const SIDE_POOL_POLICY_FIELDS = Object.freeze([
  'timeoutSeconds', 'attempts', 'concurrency', 'maxInputBytes', 'maxOutputBytes'
]);
const AUTHOR_USAGE_FIELDS = Object.freeze(['attemptsForTopic', 'activeConcurrency']);
const TOPIC_ACQUISITION_USAGE_FIELDS = Object.freeze(['activeConcurrency']);
const BRIEF_PAGE_PATHS = Object.freeze(Object.values(BRIEF_PAGE_OUTPUTS));
const TRANSACTION_MUTABLE_ORDER = Object.freeze([
  'research/agenda/history.jsonl',
  'market-brief.payload.json',
  ...BRIEF_PAGE_PATHS,
  'research/agenda/current.json'
]);

function isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isIso(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function canonicalize(value) {
  try {
    return RLAGENDA.canonicalizeAgenda(value);
  } catch (error) {
    if (error?.message === 'non-finite agenda number') throw new Error('non-finite number');
    if (error?.message === 'unsupported agenda value') throw new Error('unsupported value');
    throw error;
  }
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
  return RLAGENDA.sha256Text(canonicalize(value));
}

function failure(code, reason, field = null, topicId = null) {
  return deepFreeze({ ok: false, error: { code, reason, field, topicId } });
}

function success(value) {
  return deepFreeze({ ok: true, value: deepFreeze(value) });
}

function modelBarIds(definition) {
  return [...new Set([
    ...definition.transmissionModels.map((model) => model.barId),
    ...definition.proxyDefinitions.map((proxy) => proxy.ticker)
  ])];
}

function compactCurrentBarsAtCutoff(definition, currentBars, generationCutoff) {
  const cutoffMs = Date.parse(generationCutoff);
  return Object.fromEntries(modelBarIds(definition).flatMap((barId) => {
    const source = currentBars[barId];
    if (!isObject(source) || !Array.isArray(source.rows)) return [];
    const latest = source.rows.reduce((selected, row) => {
      if (!isObject(row) || !Number.isFinite(row.t) || row.t > cutoffMs) return selected;
      return selected === null || row.t > selected.t ? row : selected;
    }, null);
    if (latest === null) return [];
    return [[barId, {
      sym: barId,
      asof: new Date(latest.t).toISOString(),
      latest: { t: latest.t, o: latest.o, h: latest.h, l: latest.l, c: latest.c, v: latest.v }
    }]];
  }));
}

function causalChangeExplanation(definition, situation, evidenceLedger, impacts) {
  const scenarioIds = [...new Set(impacts.map((impact) => impact.targetId))];
  const scenarioNodes = definition.scenarioTree.nodes.filter((node) => scenarioIds.includes(node.scenarioId));
  return {
    evidence: situation.evidenceRecords.map((evidence) => {
      const ledger = evidenceLedger.find((row) => row.evidenceId === evidence.evidenceId);
      return {
        evidenceId: evidence.evidenceId,
        causalPath: clone(evidence.causalPath),
        modelImpacts: clone(evidence.modelImpacts),
        firedRefuters: clone(ledger.firedRefuters),
        conflictEvidenceIds: clone(ledger.conflicts.evidenceIds)
      };
    }),
    triggerIds: [...new Set(scenarioNodes.flatMap((node) => node.entryTriggerIds))].sort(),
    invalidationIds: [...new Set(scenarioNodes.flatMap((node) => node.invalidationIds))].sort()
  };
}

function exactKeys(value, keys) {
  return isObject(value) && Object.keys(value).sort().join('|') === [...keys].sort().join('|');
}

function artifactBudgetFailure(reason, details = {}) {
  return deepFreeze({ ok: false, error: { code: 'E019-ARTIFACT-BUDGET', reason, ...details } });
}

function artifactBudgetPolicyField(policy) {
  if (!exactKeys(policy, ARTIFACT_BUDGET_POLICY_FIELDS)) return 'shape';
  if (policy.contractVersion !== ARTIFACT_BUDGET_POLICY_ID) return 'contractVersion';
  if (policy.policyId !== ARTIFACT_BUDGET_POLICY_ID) return 'policyId';
  if (!Number.isInteger(policy.maxBarsPerSymbolTradingDate) || policy.maxBarsPerSymbolTradingDate <= 0) return 'maxBarsPerSymbolTradingDate';
  if (!Number.isInteger(policy.maxSymbolsPerRun) || policy.maxSymbolsPerRun <= 0) return 'maxSymbolsPerRun';
  if (!Number.isInteger(policy.maxNormalizedObservationBytes) || policy.maxNormalizedObservationBytes <= 0) return 'maxNormalizedObservationBytes';
  if (policy.rawBodyRetention !== 'hash-only') return 'rawBodyRetention';
  return null;
}

export function resolveFeature019ArtifactBudgetPolicy(config) {
  if (!isObject(config) || !Object.hasOwn(config, ARTIFACT_BUDGET_POLICY_ID)) {
    return artifactBudgetFailure('artifact-budget-policy-missing', { policyId: ARTIFACT_BUDGET_POLICY_ID });
  }
  const policy = config[ARTIFACT_BUDGET_POLICY_ID];
  const field = artifactBudgetPolicyField(policy);
  if (field) return artifactBudgetFailure('artifact-budget-policy-invalid', { policyId: ARTIFACT_BUDGET_POLICY_ID, field });
  return success(clone(policy));
}

export function validateFeature019ArtifactBytes({ policy, family, path, bytes }) {
  const policyField = artifactBudgetPolicyField(policy);
  if (policyField) return artifactBudgetFailure('artifact-budget-policy-invalid', { policyId: ARTIFACT_BUDGET_POLICY_ID, field: policyField });
  if (!FEATURE_019_FAMILY_SET.has(family)) {
    return artifactBudgetFailure('artifact-family-unknown', { family: family ?? null, path: typeof path === 'string' ? path : null });
  }
  if (typeof path !== 'string' || path.length === 0 || typeof bytes !== 'string') {
    return artifactBudgetFailure('artifact-budget-input-invalid', { family, path: typeof path === 'string' ? path : null });
  }
  const observedBytes = Buffer.byteLength(bytes, 'utf8');
  const limitBytes = policy.maxNormalizedObservationBytes;
  if (observedBytes > limitBytes) {
    return artifactBudgetFailure('artifact-bytes-over-cap', { family, path, observedBytes, limitBytes });
  }
  return success({ family, path, bytes, observedBytes, limitBytes });
}

export function validateFeature019CanonicalArtifact({ policy, family, path, value }) {
  let bytes;
  try {
    bytes = canonicalize(value);
  } catch {
    return artifactBudgetFailure('artifact-canonical-serialization-invalid', { family: family ?? null, path: typeof path === 'string' ? path : null });
  }
  return validateFeature019ArtifactBytes({ policy, family, path, bytes });
}

export function validateFeature019ModelInputBudget({ policy, symbols, barsBySymbol }) {
  const policyField = artifactBudgetPolicyField(policy);
  if (policyField) return artifactBudgetFailure('artifact-budget-policy-invalid', { policyId: ARTIFACT_BUDGET_POLICY_ID, field: policyField });
  if (!Array.isArray(symbols) || symbols.some((symbol) => typeof symbol !== 'string' || symbol.length === 0) || !isObject(barsBySymbol)) {
    return artifactBudgetFailure('model-input-budget-invalid', { family: 'model-input', path: 'symbols' });
  }
  const uniqueSymbols = [...new Set(symbols)];
  if (uniqueSymbols.length > policy.maxSymbolsPerRun) {
    return artifactBudgetFailure('model-input-symbols-over-cap', {
      family: 'model-input',
      path: 'symbols',
      observedSymbols: uniqueSymbols.length,
      limitSymbols: policy.maxSymbolsPerRun
    });
  }
  let maxRowsPerSymbolTradingDate = 0;
  for (const [symbol, artifact] of Object.entries(barsBySymbol)) {
    if (!uniqueSymbols.includes(symbol) || !isObject(artifact) || artifact.sym !== symbol || !Array.isArray(artifact.rows)) {
      return artifactBudgetFailure('bar-input-invalid', { family: 'bar-input', path: `data/bars/${symbol}.json`, symbol });
    }
    const countsByTradingDate = new Map();
    for (const row of artifact.rows) {
      if (!isObject(row) || !Number.isFinite(row.t)) {
        return artifactBudgetFailure('bar-input-invalid', { family: 'bar-input', path: `data/bars/${symbol}.json`, symbol });
      }
      const tradingDate = new Date(row.t).toISOString().slice(0, 10);
      const count = (countsByTradingDate.get(tradingDate) || 0) + 1;
      countsByTradingDate.set(tradingDate, count);
      maxRowsPerSymbolTradingDate = Math.max(maxRowsPerSymbolTradingDate, count);
      if (count > policy.maxBarsPerSymbolTradingDate) {
        return artifactBudgetFailure('bar-rows-per-symbol-trading-date-over-cap', {
          family: 'bar-input',
          path: `data/bars/${symbol}.json`,
          symbol,
          tradingDate,
          observedRows: count,
          limitRows: policy.maxBarsPerSymbolTradingDate
        });
      }
    }
  }
  return success({
    observedSymbols: uniqueSymbols.length,
    limitSymbols: policy.maxSymbolsPerRun,
    maxRowsPerSymbolTradingDate,
    limitRowsPerSymbolTradingDate: policy.maxBarsPerSymbolTradingDate
  });
}

export function feature019ArtifactFamilyForCandidate(path, value = null) {
  if (path === 'research-agenda.json') return 'registry';
  if (path === 'rlagenda.js') return 'umd-module';
  if (path === 'rlexperience-adapters/research-agenda.js') return 'experience-adapter';
  if (path === 'research-agenda-lab.html') return 'tool-page';
  if (path === 'notes/research-agenda-lab.md') return 'tool-note';
  if (path === 'research/agenda/history.jsonl') return 'history-ledger';
  if (path === 'research/agenda/current.json') return 'current';
  if (path === 'market-brief.payload.json') return 'payload';
  if (BRIEF_PAGE_PATHS.includes(path)) return 'page-candidate';
  if (/^research\/agenda\/topics\/[^/]+\.definition\.json$/.test(path)) return 'definition';
  if (/^research\/agenda\/topics\/[^/]+\.calibration\.json$/.test(path)) return 'calibration';
  if (/^research\/agenda\/generations\/[^/]+\.json$/.test(path)) return 'generation';
  if (/^research\/agenda\/reviews\/[^/]+\/[^/]+\.json$/.test(path)) return 'review';
  if (/^research\/agenda\/dossiers\/[^/]+\/[^/]+\.json$/.test(path)) return 'dossier';
  if (/^research\/agenda\/sources\/[^/]+\.json$/.test(path)) return 'source';
  if (value?.contractVersion === RLAGENDA.SOURCE_VERSION) return 'source';
  if (value?.contractVersion === RLAGENDA.FINDING_SEAM_VERSION) return 'feature-020-seam';
  if (value?.contractVersion === RLAGENDA.HISTORY_EVENT_VERSION && value.eventType === 'lifecycle') return 'lifecycle';
  if (value?.contractVersion === RLAGENDA.HISTORY_EVENT_VERSION && value.eventType === 'correction') return 'correction';
  if (value?.contractVersion === RESEARCH_AGENDA_CONTRACTS.read) return 'research-agenda-read';
  if (value?.contractVersion === RLAGENDA.TOOL_READ_VERSION || value?.metrics?.contractVersion === RLAGENDA.TOOL_READ_VERSION) return 'tool-read';
  return null;
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

export function researchAgendaFreshnessPolicyRef(definition, requirement) {
  if (!isObject(definition) || !isObject(requirement) ||
      typeof definition.topicId !== 'string' || typeof definition.definitionVersion !== 'string' ||
      typeof requirement.requirementId !== 'string' || !Number.isInteger(requirement.freshnessHours) || requirement.freshnessHours <= 0) {
    return null;
  }
  return [
    'research-topic-source-freshness/v1',
    definition.topicId,
    definition.definitionVersion,
    requirement.requirementId,
    String(requirement.freshnessHours)
  ].join(':');
}

function recordIsReusable(record, definition, requirement, cutoffAt) {
  if (!exactKeys(record, REUSABLE_LEDGER_FIELDS) || !isObject(requirement) || !isIso(cutoffAt)) return false;
  const freshnessPolicyRef = researchAgendaFreshnessPolicyRef(definition, requirement);
  if (record.requirementId !== requirement.requirementId || !ID_PATTERN.test(record.sourceId || '') ||
      !HASH_PATTERN.test(record.contentSha256 || '') || record.freshnessPolicyRef !== freshnessPolicyRef) return false;
  const cutoffMs = Date.parse(cutoffAt);
  if (!isIso(record.observedAt) || !isIso(record.availableAt) ||
      Date.parse(record.observedAt) > cutoffMs || Date.parse(record.availableAt) > cutoffMs) return false;
  if (!Array.isArray(record.claimCoverage) || new Set(record.claimCoverage).size !== record.claimCoverage.length ||
      !record.claimCoverage.every((claim) => typeof claim === 'string' && claim.length > 0) ||
      !Array.isArray(requirement.requiredClaimCoverage) ||
      !requirement.requiredClaimCoverage.every((claim) => record.claimCoverage.includes(claim))) return false;
  const ageHours = (Date.parse(cutoffAt) - Date.parse(record.observedAt)) / 3600000;
  return ageHours >= 0 && ageHours <= requirement.freshnessHours;
}

function compareReusableRecords(left, right) {
  const observedDelta = Date.parse(right.observedAt) - Date.parse(left.observedAt);
  if (observedDelta !== 0) return observedDelta;
  const availableDelta = Date.parse(right.availableAt) - Date.parse(left.availableAt);
  if (availableDelta !== 0) return availableDelta;
  if (left.sourceId < right.sourceId) return -1;
  if (left.sourceId > right.sourceId) return 1;
  return 0;
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
      const record = records
        .filter((candidate) => candidate.requirementId === requirement.requirementId && recordIsReusable(candidate, definition, requirement, cutoffAt))
        .sort(compareReusableRecords)[0];
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
    const validated = RLAGENDA.validatePublishedFinding(
      finding,
      topic,
      definition,
      situation.evidenceRecords,
      situation.sourceLedger
    );
    if (!validated.ok) return failure(validated.code, 'finding-shape-invalid', validated.field || 'findings', topic.topicId);
  }
  const evidenceIds = new Set(situation.evidenceRecords.map((record) => record.evidenceId));
  if (situation.newEvidenceIds.some((evidenceId) => !evidenceIds.has(evidenceId))) {
    return failure('E019-AGENDA-SITUATION', 'new-evidence-ref-invalid', 'newEvidenceIds', topic.topicId);
  }
  return success(clone(situation));
}

function resolveSidePoolPolicy(agendaPolicy, policyDigest) {
  const resolved = RLAGENDA.resolveAgendaPolicy(agendaPolicy);
  if (!resolved.ok || resolved.digest !== policyDigest) return null;
  const policy = resolved.value.researchAuthoring;
  if (!exactKeys(policy, SIDE_POOL_POLICY_FIELDS) ||
      !SIDE_POOL_POLICY_FIELDS.every((field) => Number.isInteger(policy[field]) && policy[field] > 0)) return null;
  return { agendaPolicy: resolved.value, policy, policyDigest: resolved.digest };
}

export function validateResearchAuthorUsage(usage, agendaPolicy, policyDigest) {
  const resolved = resolveSidePoolPolicy(agendaPolicy, policyDigest);
  if (!resolved || !exactKeys(usage, AUTHOR_USAGE_FIELDS) ||
      !AUTHOR_USAGE_FIELDS.every((field) => Number.isInteger(usage[field]) && usage[field] > 0)) {
    return failure('E019-AGENDA-AUTHOR', 'author-usage-invalid');
  }
  if (usage.attemptsForTopic > resolved.policy.attempts) {
    return failure('E019-AGENDA-AUTHOR', 'author-attempts-over-cap', 'attemptsForTopic');
  }
  if (usage.activeConcurrency > resolved.policy.concurrency) {
    return failure('E019-AGENDA-AUTHOR', 'author-concurrency-over-cap', 'activeConcurrency');
  }
  return success({
    policyDigest: resolved.policyDigest,
    limits: { attemptsForTopic: resolved.policy.attempts, activeConcurrency: resolved.policy.concurrency },
    usage: clone(usage)
  });
}

function resolveTopicAcquisitionPolicy(agendaPolicy, policyDigest) {
  const resolved = RLAGENDA.resolveAgendaPolicy(agendaPolicy);
  if (!resolved.ok || resolved.digest !== policyDigest) return null;
  return { agendaPolicy: resolved.value, policyDigest: resolved.digest };
}

export function validateResearchTopicAcquisitionUsage(usage, agendaPolicy, policyDigest) {
  const resolved = resolveTopicAcquisitionPolicy(agendaPolicy, policyDigest);
  if (!resolved || !exactKeys(usage, TOPIC_ACQUISITION_USAGE_FIELDS) ||
      !Number.isInteger(usage.activeConcurrency) || usage.activeConcurrency <= 0) {
    return failure('E019-AGENDA-ACQUISITION', 'topic-acquisition-usage-invalid');
  }
  if (usage.activeConcurrency > resolved.agendaPolicy.maxConcurrentTopicAcquisitions) {
    return failure('E019-AGENDA-ACQUISITION', 'topic-acquisition-concurrency-over-cap', 'activeConcurrency');
  }
  return success({
    policyDigest: resolved.policyDigest,
    limits: { activeConcurrency: resolved.agendaPolicy.maxConcurrentTopicAcquisitions },
    usage: clone(usage)
  });
}

export async function runResearchTopicAcquisitionPool({ topics, policy, policyDigest, acquireFn }) {
  const resolved = resolveTopicAcquisitionPolicy(policy, policyDigest);
  const topicIds = Array.isArray(topics) ? topics.map((entry) => entry?.topicId) : [];
  if (!resolved || !Array.isArray(topics) || topicIds.some((topicId) => typeof topicId !== 'string' || !topicId) ||
      new Set(topicIds).size !== topicIds.length || typeof acquireFn !== 'function') {
    return failure('E019-AGENDA-ACQUISITION', 'topic-acquisition-pool-config-invalid');
  }
  const rows = topics.map(() => ({ result: null, failure: null }));
  const concurrency = resolved.agendaPolicy.maxConcurrentTopicAcquisitions;
  let active = 0;
  let calls = 0;
  let cursor = 0;
  let peakConcurrency = 0;
  const startedAt = Date.now();

  async function runTopic(entry, index) {
    const admission = validateResearchTopicAcquisitionUsage(
      { activeConcurrency: active + 1 },
      resolved.agendaPolicy,
      resolved.policyDigest
    );
    if (!admission.ok) {
      rows[index].failure = admission.error.reason;
      return;
    }
    active += 1;
    calls += 1;
    peakConcurrency = Math.max(peakConcurrency, active);
    try {
      const result = await acquireFn(entry);
      if (result?.ok === false) rows[index].failure = result.error?.reason || result.error?.detail || 'topic-acquisition-failed';
      else rows[index].result = result;
    } catch (error) {
      rows[index].failure = error?.message || 'topic-acquisition-failed';
    } finally {
      active -= 1;
    }
  }

  async function worker() {
    while (cursor < topics.length) {
      const index = cursor;
      cursor += 1;
      await runTopic(topics[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, topics.length) }, () => worker()));
  const resultsByTopicId = {};
  const failuresByTopicId = {};
  rows.forEach((row, index) => {
    const topicId = topics[index].topicId;
    if (row.result !== null) resultsByTopicId[topicId] = row.result;
    if (row.failure !== null) failuresByTopicId[topicId] = row.failure;
  });
  return success({
    resultsByTopicId,
    failuresByTopicId,
    telemetry: {
      calls,
      peakConcurrency,
      elapsedMs: Math.max(0, Date.now() - startedAt),
      concurrency,
      policyDigest: resolved.policyDigest
    }
  });
}

export async function runResearchSidePool({ topics, generationId, policy, policyDigest, authorFn, timer = null }) {
  const resolved = resolveSidePoolPolicy(policy, policyDigest);
  const topicIds = Array.isArray(topics) ? topics.map((entry) => entry?.topic?.topicId) : [];
  if (!resolved || !Array.isArray(topics) || topicIds.some((topicId) => typeof topicId !== 'string') ||
      new Set(topicIds).size !== topicIds.length || typeof authorFn !== 'function') {
    return failure('E019-AGENDA-AUTHOR', 'side-pool-config-invalid');
  }
  const authorPolicy = resolved.policy;
  const rows = topics.map(() => ({ situation: null, failure: null, attempts: 0 }));
  let peakConcurrency = 0;
  let active = 0;
  let calls = 0;
  let maxObservedInputBytes = 0;
  let maxObservedOutputBytes = 0;
  let cursor = 0;
  const startedAt = Date.now();

  async function runTopic(entry, index) {
    const request = deepFreeze({
      contractVersion: 'research-author-request/v1',
      generationId,
      topicId: entry.topic.topicId,
      policyDigest: resolved.policyDigest,
      capabilities: { web: false, shell: false },
      topic: clone(entry.topic),
      definition: clone(entry.definition),
      acquisition: clone(entry.acquisition || null),
      committedEvidence: clone(entry.committedEvidence || []),
      priorDossier: clone(entry.priorDossier || null),
      snapshot: clone(entry.snapshot || null)
    });
    const inputBytes = Buffer.byteLength(canonicalize(request));
    maxObservedInputBytes = Math.max(maxObservedInputBytes, inputBytes);
    if (inputBytes > authorPolicy.maxInputBytes) {
      rows[index].failure = 'author-input-over-budget';
      return;
    }
    for (let attempt = 1; attempt <= authorPolicy.attempts; attempt += 1) {
      const admission = validateResearchAuthorUsage({ attemptsForTopic: attempt, activeConcurrency: active + 1 }, resolved.agendaPolicy, resolved.policyDigest);
      if (!admission.ok) {
        rows[index].failure = admission.error.reason;
        return;
      }
      rows[index].attempts += 1;
      calls += 1;
      active += 1;
      peakConcurrency = Math.max(peakConcurrency, active);
      try {
        const invocation = Promise.resolve().then(() => authorFn(request, { attempt, policyDigest: resolved.policyDigest }));
        const response = timer && typeof timer.withTimeout === 'function'
          ? await timer.withTimeout(invocation, authorPolicy.timeoutSeconds * 1000)
          : await invocation;
        const outputBytes = Buffer.byteLength(canonicalize(response));
        maxObservedOutputBytes = Math.max(maxObservedOutputBytes, outputBytes);
        if (outputBytes > authorPolicy.maxOutputBytes) {
          rows[index].failure = 'author-output-over-budget';
        } else {
          const validated = validateResearchSituation(response, { generationId, topic: entry.topic, definition: entry.definition });
          if (validated.ok) {
            rows[index].situation = validated.value;
            rows[index].failure = null;
            return;
          }
          rows[index].failure = validated.error.reason;
        }
      } catch (error) {
        rows[index].failure = error?.code === 'ETIMEDOUT' ? 'author-timeout' : 'author-failed';
      } finally {
        active -= 1;
      }
    }
  }

  async function worker() {
    while (cursor < topics.length) {
      const index = cursor;
      cursor += 1;
      await runTopic(topics[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(authorPolicy.concurrency, topics.length) }, () => worker()));
  const situationsByTopicId = {};
  const failuresByTopicId = {};
  const attemptsByTopicId = {};
  rows.forEach((row, index) => {
    const topicId = topics[index].topic.topicId;
    attemptsByTopicId[topicId] = row.attempts;
    if (row.situation) situationsByTopicId[topicId] = row.situation;
    else if (row.failure) failuresByTopicId[topicId] = row.failure;
  });
  return success({
    contractVersion: RESEARCH_AGENDA_CONTRACTS.situationSet,
    generationId,
    situationsByTopicId,
    failuresByTopicId,
    telemetry: {
      calls,
      attempts: calls,
      attemptsByTopicId,
      peakConcurrency,
      elapsedMs: Math.max(0, Date.now() - startedAt),
      maxObservedInputBytes,
      maxObservedOutputBytes,
      timeoutSeconds: authorPolicy.timeoutSeconds,
      maxAttemptsPerTopic: authorPolicy.attempts,
      concurrency: authorPolicy.concurrency,
      maxInputBytes: authorPolicy.maxInputBytes,
      maxOutputBytes: authorPolicy.maxOutputBytes,
      policyDigest: resolved.policyDigest
    }
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

export function computeResearchAgendaOutputs({
  definition, calibration, situation, currentBars, generationCutoff,
  declaredQuestion, predecessorOutput = null
}) {
  if (!isObject(definition) || !isObject(calibration) || !isObject(situation) || !isObject(currentBars) || !isIso(generationCutoff) ||
      typeof declaredQuestion !== 'string' || RLAGENDA.sha256Text(declaredQuestion) !== definition.declaredQuestionSha256 ||
      !Array.isArray(situation.evidenceRecords) || !isObject(situation.modelInputs)) {
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
  const publishedInputs = {
    contractVersion: RLAGENDA.MODEL_INPUT_VERSION,
    evidenceImpacts: impacts.map((impact) => ({ ...impact })),
    chokepointState: clone(situation.modelInputs.chokepointState),
    inventoryGapByChannel: clone(situation.modelInputs.inventoryGapByChannel),
    levers: clone(situation.modelInputs.levers),
    currentBars: compactCurrentBarsAtCutoff(definition, currentBars, generationCutoff),
    calibrationEvents: clone(calibration.events)
  };
  const validatedInput = RLAGENDA.validateResearchModelInput(publishedInputs, definition, generationCutoff);
  if (!validatedInput.ok) return failure('E019-AGENDA-MODEL-INPUT', validatedInput.code, validatedInput.field, definition.topicId);
  const modelInput = validatedInput.value;
  const probabilities = RLAGENDA.updateEscalationProbabilities(definition.scenarioTree, modelInput.evidenceImpacts, { maxAbsoluteImpact: definition.evidencePolicy.impactCaps.direct });
  if (!probabilities.ok) return failure(probabilities.code, 'probability-model-invalid', null, definition.topicId);
  const byScenario = {};
  for (const scenarioId of Object.keys(probabilities.probabilities)) {
    const flow = RLAGENDA.computeFlowState(definition.flowNetwork, modelInput.chokepointState, scenarioId);
    if (!flow.ok) return failure(flow.code, 'flow-model-invalid', null, definition.topicId);
    byScenario[scenarioId] = flow;
  }
  const commodity = RLAGENDA.computeCommodityShockRanges(
    probabilities.probabilities,
    { byScenario, inventoryGapByChannel: modelInput.inventoryGapByChannel },
    definition.transmissionModels,
    modelInput.currentBars,
    {
      inventoryPolicyResponseOffset: modelInput.levers.inventoryPolicyResponseOffset,
      demandOffset: modelInput.levers.demandOffset
    }
  );
  if (!commodity.ok) return failure('E019-AGENDA-MODEL', 'commodity-model-unavailable', null, definition.topicId);
  const channelRanges = Object.fromEntries(commodity.channels.map((row) => [row.channelId, row.range]));
  const proxy = RLAGENDA.computeEquityProxyRanges(channelRanges, definition.proxyDefinitions, modelInput.calibrationEvents, modelInput.currentBars);
  if (!proxy.ok) return failure('E019-AGENDA-MODEL', 'proxy-model-insufficient', null, definition.topicId);
  const rootNodes = definition.scenarioTree.nodes.filter((node) => node.parentId === null);
  const directionScore = rootNodes.reduce((sum, node) => sum + probabilities.probabilities[node.scenarioId].unconditional * node.directionValue, 0);
  const dominantScenarioId = rootNodes.slice().sort((left, right) => probabilities.probabilities[right.scenarioId].unconditional - probabilities.probabilities[left.scenarioId].unconditional)[0]?.scenarioId || null;
  const evidenceCoverage = situation.evidenceRecords.length ? evidenceLedger.filter((row) => row.weight > 0).length / situation.evidenceRecords.length : 0;
  const conflictIds = [...new Set(evidenceLedger.flatMap((row) => row.conflicts.evidenceIds))].sort();
  const currentComparisonOutput = deepFreeze({
    probabilities: Object.fromEntries(rootNodes.map((node) => [node.scenarioId, probabilities.probabilities[node.scenarioId].unconditional])),
    evidenceIds: evidenceLedger.map((row) => row.evidenceId),
    conflictIds,
    directionScore,
    dominantScenarioId,
    declaredQuestionSha256: RLAGENDA.sha256Text(declaredQuestion),
    evidenceCoverage
  });
  const assessment = RLAGENDA.buildAgendaChangeAssessment(
    currentComparisonOutput,
    predecessorOutput,
    causalChangeExplanation(definition, situation, evidenceLedger, modelInput.evidenceImpacts)
  );
  if (!assessment.ok) return failure('E019-AGENDA-CHANGE-ASSESSMENT', assessment.code, assessment.field || null, definition.topicId);
  const currentOutput = {
    evidenceLedger,
    scenarioProbabilities: probabilities.probabilities,
    scenarioProbability: probabilities.probabilities,
    flowStates: byScenario,
    physicalFlow: byScenario,
    channelRanges,
    proxyRanges: Object.fromEntries(proxy.proxies.map((row) => [row.proxyId, row.range])),
    directionScore,
    dominantScenarioId,
    evidenceCoverage,
    publishedInputs: modelInput
  };
  return success({
    ...currentOutput,
    changeAssessment: assessment.value
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

function activeDossierPath(dossier) {
  return `research/agenda/dossiers/${dossier.topicId}/${dossier.dossierId}.json`;
}

function activeDossierRef(dossier) {
  const validated = RLAGENDA.validateActiveDossier(dossier);
  if (!validated.ok) return failure(validated.code, 'dossier-shape-invalid', validated.field || null, dossier?.topicId || null);
  const built = RLAGENDA.buildArtifactRef(activeDossierPath(dossier), dossier);
  if (!built.ok) return failure(built.code, 'dossier-ref-invalid', null, dossier.topicId);
  return success(built.ref);
}

function dossierIdFromRef(ref) {
  if (!ref) return null;
  return ref.path.slice(ref.path.lastIndexOf('/') + 1, -'.json'.length);
}

function modelSnapshotRef(dossierRef, dossier) {
  return {
    dossierRef: clone(dossierRef),
    modelInputsSha256: fingerprint(dossier.modelInputs),
    modelOutputsSha256: fingerprint(dossier.modelOutputs),
    chartSeriesSha256: fingerprint(dossier.chartStates)
  };
}

function observationStates(definitions, idField, firedIds, observedAt, evidenceRefs) {
  const fired = new Set(firedIds || []);
  return definitions.map((definition) => {
    const isFired = fired.has(definition[idField]);
    return {
      [idField]: definition[idField],
      state: isFired ? 'fired' : 'not-fired',
      observedAt: isFired ? observedAt : null,
      evidenceRefs: isFired ? evidenceRefs.slice() : []
    };
  });
}

function buildActiveDossier({ topic, definition, planned, situation, deterministicOutput, generationId, generationCutoff, reviewId, predecessorDossierRef }) {
  if (!isObject(deterministicOutput) || !isObject(deterministicOutput.publishedInputs) || !isObject(deterministicOutput.changeAssessment)) {
    return failure('E019-AGENDA-CANDIDATE', 'deterministic-output-invalid', null, topic.topicId);
  }
  const output = clone(deterministicOutput);
  const modelInputs = output.publishedInputs;
  const assessment = output.changeAssessment;
  delete output.publishedInputs;
  delete output.changeAssessment;
  const chartResult = RLAGENDA.buildAgendaChartSeries([{
    reviewId,
    attemptedAt: generationCutoff,
    modelOutputs: output,
    annotations: []
  }], definition.chartDefinitions);
  if (!chartResult.ok) return failure(chartResult.code, 'chart-series-invalid', null, topic.topicId);
  const chartStates = chartResult.charts.map((chart) => ({
    chartId: chart.chartId,
    state: chart.series.every((row) => row.value !== null) ? 'available' : 'unavailable',
    series: clone(chart.series),
    annotations: chart.series.flatMap((row) => clone(row.annotations))
  }));
  const evidenceRefs = situation.evidenceRecords.map((record) => record.evidenceId);
  const triggerStates = observationStates(
    definition.triggers,
    'triggerId',
    assessment.causalExplanation?.triggerIds,
    generationCutoff,
    evidenceRefs
  );
  const invalidationStates = observationStates(
    definition.invalidations,
    'invalidationId',
    assessment.causalExplanation?.invalidationIds,
    generationCutoff,
    evidenceRefs
  );
  const body = {
    contractVersion: RLAGENDA.DOSSIER_VERSION,
    topicId: topic.topicId,
    generationId,
    reviewId,
    mode: planned.mode,
    selectionReason: planned.reason,
    historicalOnly: false,
    validationState: 'validated',
    observedThrough: generationCutoff,
    outcome: 'updated',
    changeAssessment: assessment.direction,
    declaredQuestionSha256: RLAGENDA.sha256Text(topic.declaredQuestion),
    sectionStates: reviewSectionRows(definition, situation, 'unavailable'),
    findings: clone(situation.findings),
    evidenceRecords: clone(situation.evidenceRecords),
    sourceLedger: clone(situation.sourceLedger),
    modelInputs,
    modelOutputs: output,
    chartStates,
    triggerStates,
    invalidationStates,
    predecessorDossierRef: clone(predecessorDossierRef),
    supersedesDossierRef: clone(predecessorDossierRef)
  };
  const dossierIdentity = RLAGENDA.deriveDossierId(body);
  if (!dossierIdentity.ok) return failure(dossierIdentity.code, 'dossier-identity-invalid', dossierIdentity.field, topic.topicId);
  const dossier = { ...body, dossierId: dossierIdentity.id };
  const validated = RLAGENDA.validateActiveDossier(dossier, definition);
  if (!validated.ok) return failure(validated.code, 'dossier-shape-invalid', validated.field || null, topic.topicId);
  return success(dossier);
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
      classifications.push({
        topicId: planned.topicId,
        mode: planned.mode,
        selectionReason: planned.reason,
        state: 'refused',
        reason: 'definition-missing',
        reviewId: null,
        dossierId: null
      });
      continue;
    }
    const prior = priorDossiersByTopicId[planned.topicId] || null;
    const reusablePrior = prior && prior.historicalOnly !== true ? prior : null;
    let reusablePriorRef = null;
    if (reusablePrior) {
      const priorValidation = RLAGENDA.validateActiveDossier(reusablePrior);
      if (!priorValidation.ok) return failure(priorValidation.code, 'prior-dossier-invalid', priorValidation.field || null, planned.topicId);
      const priorRefResult = activeDossierRef(reusablePrior);
      if (!priorRefResult.ok) return priorRefResult;
      reusablePriorRef = priorRefResult.value;
    }
    if (!selectedIds.has(planned.topicId)) {
      classifications.push({
        topicId: planned.topicId,
        mode: planned.mode,
        selectionReason: planned.reason,
        state: planned.status,
        reason: planned.reason,
        reviewId: null,
        dossierId: reusablePrior?.dossierId || null
      });
      continue;
    }
    const failureReason = failuresByTopicId[planned.topicId];
    const situation = situationsByTopicId[planned.topicId];
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
    const reviewIdentity = RLAGENDA.deriveReviewId({
      generationId,
      topicId: planned.topicId,
      definitionDigest: fingerprint(definition),
      calibrationDigest: definition.calibrationRef ? fingerprint(definition.calibrationRef) : fingerprint(null),
      evidenceBundleDigest: fingerprint(situation?.evidenceRecords || [])
    });
    if (!reviewIdentity.ok) return failure(reviewIdentity.code, 'review-identity-invalid', reviewIdentity.field, planned.topicId);
    let dossier = null;
    let dossierRef = null;
    let snapshotRef = null;
    let changeAssessment = 'insufficient-evidence';
    if (outcome === 'updated') {
      const dossierResult = buildActiveDossier({
        topic,
        definition,
        planned,
        situation,
        deterministicOutput: deterministicOutputsByTopicId[planned.topicId],
        generationId,
        generationCutoff,
        reviewId: reviewIdentity.id,
        predecessorDossierRef: reusablePriorRef
      });
      if (!dossierResult.ok) return dossierResult;
      dossier = dossierResult.value;
      const dossierRefResult = activeDossierRef(dossier);
      if (!dossierRefResult.ok) return dossierRefResult;
      dossierRef = dossierRefResult.value;
      snapshotRef = modelSnapshotRef(dossierRef, dossier);
      changeAssessment = dossier.changeAssessment;
      dossiers.push(dossier);
    } else if (outcome === 'unchanged') {
      dossierRef = reusablePriorRef;
      snapshotRef = modelSnapshotRef(dossierRef, reusablePrior);
      changeAssessment = 'unchanged';
    } else if (outcome === 'stale' && reusablePriorRef) {
      dossierRef = reusablePriorRef;
      snapshotRef = modelSnapshotRef(dossierRef, reusablePrior);
    }
    const stateAvailable = snapshotRef ? 'available' : 'unavailable';
    const review = {
      contractVersion: RLAGENDA.REVIEW_VERSION,
      reviewId: reviewIdentity.id,
      generationId,
      topicId: planned.topicId,
      attemptedAt: generationCutoff,
      validationState: 'validated',
      historicalOnly: false,
      mode: planned.mode,
      selectionReason: planned.reason,
      completePass: !!situation?.completePass,
      outcome,
      reason,
      newestEvidenceAgeHours: newestEvidenceAge,
      changeAssessment,
      sectionStates: reviewSectionRows(definition, situation, outcome === 'stale' ? 'stale' : 'unavailable'),
      evidenceIds: outcome === 'unavailable' ? [] : (situation?.evidenceRecords || []).map((record) => record.evidenceId),
      modelSnapshotRef: snapshotRef,
      chartState: stateAvailable,
      triggerStates: stateAvailable,
      invalidationStates: stateAvailable,
      dossierRef,
      predecessorDossierRef: reusablePriorRef
    };
    const validationRecords = reusablePrior || dossier ? {} : undefined;
    if (reusablePrior) validationRecords[activeDossierPath(reusablePrior)] = reusablePrior;
    if (dossier) validationRecords[activeDossierPath(dossier)] = dossier;
    const reviewValidation = RLAGENDA.validateActiveReview(review, validationRecords);
    if (!reviewValidation.ok) return failure(reviewValidation.code, 'review-shape-invalid', reviewValidation.field || null, planned.topicId);
    reviews.push(review);
    classifications.push({
      topicId: planned.topicId,
      mode: planned.mode,
      selectionReason: planned.reason,
      state: outcome === 'unavailable' ? 'unavailable' : 'reviewed',
      reason,
      reviewId: review.reviewId,
      dossierId: dossierIdFromRef(review.dossierRef)
    });
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
      const dossier = candidate.dossiers.find((row) => row.dossierId === classification.dossierId);
      return {
        topicId: classification.topicId,
        mode: classification.mode,
        state: classification.state,
        reason: classification.reason,
        selectionReason: classification.selectionReason,
        reviewId: classification.reviewId,
        dossierId: classification.dossierId,
        outcome: review?.outcome || classification.state,
        changeAssessment: review?.changeAssessment || 'insufficient-evidence',
        newestEvidenceAgeHours: review?.newestEvidenceAgeHours ?? null,
        modelState: review?.modelSnapshotRef || classification.dossierId ? 'available' : 'unavailable',
        chartState: review?.chartState || (classification.dossierId ? 'available' : 'unavailable'),
        predecessorDossierId: dossierIdFromRef(review?.predecessorDossierRef || null),
        supersedesDossierId: dossierIdFromRef(dossier?.supersedesDossierRef || null)
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

function exactPathInventory(actual, expected) {
  return isObject(actual) && Object.keys(actual).length === expected.length && expected.every((path) => Object.hasOwn(actual, path));
}

function transactionFingerprintFor(transaction) {
  return fingerprint({
    contractVersion: transaction.contractVersion,
    generationId: transaction.generationId,
    immutableFiles: transaction.immutableFiles,
    mutableFiles: transaction.mutableFiles,
    immutableOrder: transaction.immutableOrder,
    mutableOrder: transaction.mutableOrder,
    writeOrder: transaction.writeOrder,
    candidatePaths: transaction.candidatePaths,
    pointerLast: transaction.pointerLast
  });
}

function privateCandidatePath(targetPath, candidateToken) {
  const separator = targetPath.lastIndexOf('/');
  const directory = separator < 0 ? '' : targetPath.slice(0, separator + 1);
  const filename = separator < 0 ? targetPath : targetPath.slice(separator + 1);
  return `${directory}.${filename}.candidate-${candidateToken}`;
}

function validateTransactionInventory(transaction) {
  if (!isObject(transaction) || transaction.contractVersion !== RESEARCH_AGENDA_CONTRACTS.transaction ||
      !isObject(transaction.immutableFiles) || !isObject(transaction.mutableFiles) || !isObject(transaction.candidatePaths) ||
      !Array.isArray(transaction.immutableOrder) || !Array.isArray(transaction.mutableOrder) || !Array.isArray(transaction.writeOrder)) {
    return 'transaction-inventory-invalid';
  }
  const immutablePaths = Object.keys(transaction.immutableFiles).sort();
  if (!exactPathInventory(transaction.immutableFiles, immutablePaths) || !exactPathInventory(transaction.mutableFiles, TRANSACTION_MUTABLE_ORDER) ||
      !exactPathInventory(transaction.candidatePaths, TRANSACTION_MUTABLE_ORDER) ||
      JSON.stringify(transaction.immutableOrder) !== JSON.stringify(immutablePaths) ||
      JSON.stringify(transaction.mutableOrder) !== JSON.stringify(TRANSACTION_MUTABLE_ORDER) ||
      JSON.stringify(transaction.writeOrder) !== JSON.stringify([...immutablePaths, ...TRANSACTION_MUTABLE_ORDER]) ||
      transaction.pointerLast !== TRANSACTION_MUTABLE_ORDER.at(-1) || transaction.writeOrder.at(-1) !== transaction.pointerLast ||
      immutablePaths.some((path) => typeof transaction.immutableFiles[path] !== 'string') ||
      TRANSACTION_MUTABLE_ORDER.some((path) => typeof transaction.mutableFiles[path] !== 'string')) {
    return 'transaction-inventory-invalid';
  }
  const privatePaths = TRANSACTION_MUTABLE_ORDER.map((path) => transaction.candidatePaths[path]);
  if (privatePaths.some((path, index) => typeof path !== 'string' || path === TRANSACTION_MUTABLE_ORDER[index] ||
      path.slice(0, path.lastIndexOf('/') + 1) !== TRANSACTION_MUTABLE_ORDER[index].slice(0, TRANSACTION_MUTABLE_ORDER[index].lastIndexOf('/') + 1)) ||
      new Set(privatePaths).size !== privatePaths.length || privatePaths.some((path) => immutablePaths.includes(path) || TRANSACTION_MUTABLE_ORDER.includes(path))) {
    return 'transaction-inventory-invalid';
  }
  if (transaction.transactionFingerprint !== transactionFingerprintFor(transaction)) return 'transaction-fingerprint-invalid';
  return null;
}

function exactBytes(left, right) {
  return Buffer.from(left).equals(Buffer.from(right));
}

export function buildResearchAgendaTransaction({ candidate, payload, historyText, registry, existingRecordsByPath = {}, pageInputs }) {
  if (!isObject(registry)) return failure('E019-AGENDA-TRANSACTION', 'transaction-input-invalid', 'registry');
  if (!isObject(candidate) || candidate.contractVersion !== RESEARCH_AGENDA_CONTRACTS.candidate || !isObject(payload) ||
      typeof historyText !== 'string' || !isObject(existingRecordsByPath) || !isObject(pageInputs) ||
      Object.keys(pageInputs).sort().join('|') !== 'config|snapshot|tools' || !isObject(pageInputs.config) ||
      !isObject(pageInputs.snapshot) || !isObject(pageInputs.tools)) return failure('E019-AGENDA-TRANSACTION', 'transaction-input-invalid');
  const artifactBudgetResult = resolveFeature019ArtifactBudgetPolicy(pageInputs.config);
  if (!artifactBudgetResult.ok) return artifactBudgetResult;
  const artifactBudgetPolicy = artifactBudgetResult.value;
  const artifactBudgetChecks = [];
  const enforceBytes = (path, value, bytes) => {
    const family = feature019ArtifactFamilyForCandidate(path, value);
    if (!family) return artifactBudgetFailure('artifact-family-unknown', { family: null, path });
    const result = validateFeature019ArtifactBytes({ policy: artifactBudgetPolicy, family, path, bytes });
    if (result.ok) artifactBudgetChecks.push({ family, path, observedBytes: result.value.observedBytes, limitBytes: result.value.limitBytes, serialization: 'written' });
    return result;
  };
  const enforceCanonical = (path, value) => {
    const family = feature019ArtifactFamilyForCandidate(path, value);
    if (!family) return artifactBudgetFailure('artifact-family-unknown', { family: null, path });
    const result = validateFeature019CanonicalArtifact({ policy: artifactBudgetPolicy, family, path, value });
    if (result.ok) artifactBudgetChecks.push({ family, path, observedBytes: result.value.observedBytes, limitBytes: result.value.limitBytes, serialization: 'canonical' });
    return result;
  };
  const existingHistoryBudget = enforceBytes('research/agenda/history.jsonl', null, historyText);
  if (!existingHistoryBudget.ok) return existingHistoryBudget;
  const { candidateFingerprint, ...candidateBody } = candidate;
  if (candidateFingerprint !== fingerprint(candidateBody)) return failure('E019-AGENDA-TRANSACTION', 'candidate-fingerprint-invalid');
  for (const [path, record] of Object.entries(existingRecordsByPath)) {
    const existingBudget = enforceCanonical(path, record);
    if (!existingBudget.ok) return existingBudget;
  }
  const candidateRecordsByPath = { ...existingRecordsByPath };
  for (const dossier of candidate.dossiers) {
    const validated = RLAGENDA.validateActiveDossier(dossier);
    if (!validated.ok) return failure('E019-AGENDA-TRANSACTION', 'dossier-shape-invalid', validated.field || null, dossier?.topicId || null);
    candidateRecordsByPath[activeDossierPath(dossier)] = dossier;
  }
  for (const review of candidate.reviews) {
    const validated = RLAGENDA.validateActiveReview(review, candidateRecordsByPath);
    if (!validated.ok) return failure('E019-AGENDA-TRANSACTION', 'review-shape-invalid', validated.field || null, review?.topicId || null);
  }
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
  const generationBytes = jsonBytes(generation);
  const generationBudget = enforceBytes(generationPath, generation, generationBytes);
  if (!generationBudget.ok) return generationBudget;
  immutableFiles[generationPath] = generationBytes;
  recordsByPath[generationPath] = generation;
  const reviewRefs = {};
  const dossierRefs = {};
  for (const review of candidate.reviews) {
    const reviewPath = `research/agenda/reviews/${review.topicId}/${review.generationId}.json`;
    const prepared = RLAGENDA.prepareImmutableCreate(reviewPath, review, recordsByPath);
    if (!prepared.ok) return failure(prepared.code, 'review-create-refused', reviewPath, review.topicId);
    const reviewBytes = jsonBytes(review);
    const reviewBudget = enforceBytes(reviewPath, review, reviewBytes);
    if (!reviewBudget.ok) return reviewBudget;
    immutableFiles[reviewPath] = reviewBytes;
    recordsByPath[reviewPath] = review;
    reviewRefs[review.reviewId] = RLAGENDA.buildArtifactRef(reviewPath, review).ref;
  }
  for (const dossier of candidate.dossiers) {
    const dossierPath = `research/agenda/dossiers/${dossier.topicId}/${dossier.dossierId}.json`;
    const prepared = RLAGENDA.prepareImmutableCreate(dossierPath, dossier, recordsByPath);
    if (!prepared.ok) return failure(prepared.code, 'dossier-create-refused', dossierPath, dossier.topicId);
    const dossierBytes = jsonBytes(dossier);
    const dossierBudget = enforceBytes(dossierPath, dossier, dossierBytes);
    if (!dossierBudget.ok) return dossierBudget;
    immutableFiles[dossierPath] = dossierBytes;
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
  const lifecycleEvents = RLAGENDA.planLifecycleEvents(registry, historyText, candidate.generationId, candidate.generationCutoff);
  if (!lifecycleEvents.ok) return failure(lifecycleEvents.code, 'lifecycle-event-invalid');
  events.push(...lifecycleEvents.events);
  for (const review of candidate.reviews) {
    const event = RLAGENDA.buildHistoryEvent({
      contractVersion: RLAGENDA.HISTORY_EVENT_VERSION,
      eventType: 'review',
      occurredAt: candidate.generationCutoff,
      topicId: review.topicId,
      generationId: candidate.generationId,
      reviewId: review.reviewId,
      dossierId: dossierIdFromRef(review.dossierRef),
      correctsEventId: null,
      supersedesEventId: null,
      artifactRef: reviewRefs[review.reviewId]
    });
    if (!event.ok) return failure(event.code, 'review-event-invalid', null, review.topicId);
    events.push(event.event);
  }
  for (const event of events) {
    if (!['lifecycle', 'correction'].includes(event.eventType)) continue;
    const eventBudget = enforceCanonical(`research/agenda/history.jsonl#${event.eventId}`, event);
    if (!eventBudget.ok) return eventBudget;
  }
  const history = RLAGENDA.appendHistoryEvents(historyText, events);
  if (!history.ok) return failure(history.code, 'history-append-invalid');
  const historyBudget = enforceBytes('research/agenda/history.jsonl', null, history.candidateText);
  if (!historyBudget.ok) return historyBudget;
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
  const currentBytes = jsonBytes(current);
  const currentBudget = enforceBytes('research/agenda/current.json', current, currentBytes);
  if (!currentBudget.ok) return currentBudget;
  const readResult = buildResearchAgendaRead(candidate);
  if (!readResult.ok) return readResult;
  const readValidation = validateResearchAgendaRead(readResult.value, registry);
  if (!readValidation.ok) return readValidation;
  const readBudget = enforceCanonical('market-brief.payload.json#researchAgenda', readResult.value);
  if (!readBudget.ok) return readBudget;
  const toolReadResult = RLAGENDA.buildAgendaToolRead(readResult.value, registry);
  if (!toolReadResult.ok) return failure('E019-AGENDA-READ', toolReadResult.code, toolReadResult.field || null);
  const toolReadBudget = enforceCanonical('market-brief.payload.json#toolReads.research-agenda-lab', toolReadResult.value);
  if (!toolReadBudget.ok) return toolReadBudget;
  const payloadCandidate = {
    ...clone(payload),
    researchAgenda: readResult.value,
    toolReads: { ...(clone(payload.toolReads || {})), 'research-agenda-lab': toolReadResult.value }
  };
  if (!isObject(payloadCandidate.toolReads['research-agenda-lab']?.metrics) ||
      fingerprint(payloadCandidate.toolReads['research-agenda-lab'].metrics.agendaRead) !== fingerprint(readResult.value) ||
      payloadCandidate.toolReads['research-agenda-lab'].metrics.readFingerprint !== readResult.value.readFingerprint ||
      payloadCandidate.toolReads['research-agenda-lab'].metrics.generationId !== readResult.value.generationId) {
    return failure('E019-AGENDA-TRANSACTION', 'tool-read-candidate-invalid');
  }
  let pageArtifacts;
  let pageBytes;
  try {
    pageArtifacts = buildBriefPageArtifactsFromInputs({ payload: payloadCandidate, ...pageInputs });
    pageBytes = serializeBriefPageArtifacts(pageArtifacts);
  } catch {
    return failure('E019-AGENDA-TRANSACTION', 'page-candidate-invalid');
  }
  if (!exactPathInventory(pageBytes, BRIEF_PAGE_PATHS) ||
      fingerprint(pageArtifacts[BRIEF_PAGE_OUTPUTS.payload].researchAgenda) !== fingerprint(readResult.value)) {
    return failure('E019-AGENDA-TRANSACTION', 'page-candidate-invalid');
  }
  const payloadBytes = jsonBytes(payloadCandidate);
  const payloadBudget = enforceBytes('market-brief.payload.json', payloadCandidate, payloadBytes);
  if (!payloadBudget.ok) return payloadBudget;
  for (const path of BRIEF_PAGE_PATHS) {
    const pageBudget = enforceBytes(path, pageArtifacts[path], pageBytes[path]);
    if (!pageBudget.ok) return pageBudget;
  }
  const mutableFiles = {
    'research/agenda/history.jsonl': history.candidateText,
    'market-brief.payload.json': payloadBytes,
    ...pageBytes,
    'research/agenda/current.json': currentBytes
  };
  const immutableOrder = Object.keys(immutableFiles).sort();
  const mutableOrder = [...TRANSACTION_MUTABLE_ORDER];
  const writeOrder = [...immutableOrder, ...mutableOrder];
  const candidateToken = fingerprint({ generationId: candidate.generationId, immutableFiles, mutableFiles, immutableOrder, mutableOrder }).slice('sha256:'.length);
  const candidatePaths = Object.fromEntries(mutableOrder.map((path) => [path, privateCandidatePath(path, candidateToken)]));
  const transaction = {
    contractVersion: RESEARCH_AGENDA_CONTRACTS.transaction,
    generationId: candidate.generationId,
    immutableFiles,
    mutableFiles,
    immutableOrder,
    mutableOrder,
    writeOrder,
    candidatePaths,
    pointerLast: 'research/agenda/current.json',
    payload: payloadCandidate,
    current,
    recordsByPath,
    artifactBudget: {
      policyId: artifactBudgetPolicy.policyId,
      limitBytes: artifactBudgetPolicy.maxNormalizedObservationBytes,
      checks: artifactBudgetChecks
    }
  };
  transaction.transactionFingerprint = transactionFingerprintFor(transaction);
  return success(transaction);
}

export function promoteResearchAgendaTransaction(transaction, io) {
  if (!isObject(io) || !['exists', 'read', 'create', 'rename', 'remove'].every((name) => typeof io[name] === 'function')) {
    return failure('E019-AGENDA-TRANSACTION', 'promotion-input-invalid');
  }
  const inventoryError = validateTransactionInventory(transaction);
  if (inventoryError) return failure('E019-AGENDA-TRANSACTION', inventoryError);
  let baselines;
  try {
    baselines = Object.fromEntries(transaction.mutableOrder.map((path) => {
      const exists = io.exists(path);
      return [path, { exists, bytes: exists ? io.read(path) : null }];
    }));
  } catch {
    return failure('E019-AGENDA-TRANSACTION', 'baseline-capture-failed');
  }
  const candidatePaths = [];
  const created = [];
  const written = [];
  try {
    for (const path of transaction.mutableOrder) {
      const candidatePath = transaction.candidatePaths[path];
      if (io.exists(candidatePath)) throw Object.assign(new Error('private candidate exists'), { code: 'private-candidate-exists' });
      io.create(candidatePath, transaction.mutableFiles[path]);
      candidatePaths.push(candidatePath);
      if (!io.exists(candidatePath) || !exactBytes(io.read(candidatePath), transaction.mutableFiles[path])) {
        throw Object.assign(new Error('private candidate bytes differ'), { code: 'private-candidate-invalid' });
      }
    }
    for (const path of transaction.immutableOrder) {
      if (io.exists(path)) throw Object.assign(new Error('immutable target exists'), { code: 'immutable-overwrite' });
      io.create(path, transaction.immutableFiles[path]);
      created.push(path);
      if (!io.exists(path) || !exactBytes(io.read(path), transaction.immutableFiles[path])) {
        throw Object.assign(new Error('immutable bytes differ'), { code: 'immutable-create-invalid' });
      }
      written.push(path);
      if (typeof io.afterStep === 'function') io.afterStep({ kind: 'immutable-create', path });
    }
    for (const path of transaction.mutableOrder) {
      io.rename(transaction.candidatePaths[path], path);
      written.push(path);
      if (typeof io.afterStep === 'function') io.afterStep({ kind: 'mutable-rename', path });
    }
    return success({ written, pointerLast: written.at(-1), immutableCount: created.length });
  } catch (error) {
    try {
      for (const path of [...transaction.mutableOrder].reverse()) {
        const baseline = baselines[path];
        if (!baseline.exists) {
          io.remove(path);
          continue;
        }
        const rollbackPath = `${transaction.candidatePaths[path]}.rollback`;
        if (io.exists(rollbackPath)) throw new Error(`rollback candidate exists: ${rollbackPath}`);
        io.create(rollbackPath, baseline.bytes);
        try {
          io.rename(rollbackPath, path);
        } finally {
          if (io.exists(rollbackPath)) io.remove(rollbackPath);
        }
      }
      for (const path of candidatePaths) if (io.exists(path)) io.remove(path);
      for (const path of [...created].reverse()) if (io.exists(path)) io.remove(path);
      for (const path of transaction.mutableOrder) {
        const baseline = baselines[path];
        if (io.exists(path) !== baseline.exists || (baseline.exists && !exactBytes(io.read(path), baseline.bytes))) {
          throw new Error(`rollback byte verification failed: ${path}`);
        }
      }
      const currentBaseline = baselines[transaction.pointerLast];
      if (currentBaseline.exists) {
        const current = JSON.parse(Buffer.from(currentBaseline.bytes).toString('utf8'));
        const refs = [current.generationRef, ...(current.topicRefs || []).flatMap((row) => [row.reviewRef, row.dossierRef])].filter(Boolean);
        if (refs.some((ref) => typeof ref.path !== 'string' || !io.exists(ref.path))) throw new Error('rollback current pointer is not reachable');
      }
    } catch {
      return failure('E019-AGENDA-TRANSACTION', 'rollback-verification-failed');
    }
    return failure('E019-AGENDA-TRANSACTION', error?.code || 'promotion-failed');
  }
}