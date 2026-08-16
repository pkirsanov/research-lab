import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  acquireResearchAgendaEvidence,
  buildResearchAgendaQueryInput,
  buildResearchAgendaTransaction,
  composeResearchAgendaCandidate,
  computeResearchAgendaOutputs,
  feature019ArtifactFamilyForCandidate,
  planResearchAgendaAcquisition,
  promoteResearchAgendaTransaction,
  researchAgendaFreshnessPolicyRef,
  RESEARCH_AGENDA_CONTRACTS,
  resolveFeature019ArtifactBudgetPolicy,
  resolveResearchAgendaPolicy,
  runResearchTopicAcquisitionPool,
  validateFeature019ArtifactBytes,
  validateFeature019ModelInputBudget,
  validateResearchSituation
} from './research-agenda-generation.mjs';
import { renderQueryPlan } from './web-evidence-acquire.mjs';

const require = createRequire(import.meta.url);
const RLAGENDA = require('../rlagenda.js');

export const RESEARCH_ACQUISITION_SEARCH_VERSION = 'research-acquisition-search/v1';
export const RESEARCH_AGENDA_PUBLICATION_CANDIDATE_VERSION = 'research-agenda-publication-candidate/v1';
const SEARCH_FRAGMENT_FIELDS = Object.freeze(['contractVersion', 'generationId', 'queries']);
const SEARCH_QUERY_FIELDS = Object.freeze(['queryId', 'candidates']);
const SEARCH_CANDIDATE_FIELDS = Object.freeze([
  'candidateId', 'url', 'title', 'publisher', 'publishedAt', 'sourceClass',
  'canonicalOriginRef', 'supportsClaims', 'directionTag', 'excerpts'
]);

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(resolve(root, relativePath), 'utf8'));
}

function readText(root, relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8');
}

function artifactBudgetError(result) {
  const details = result.error;
  const error = new Error([
    details.code,
    details.reason,
    details.family ? `family=${details.family}` : null,
    details.path ? `path=${details.path}` : null,
    Number.isInteger(details.observedBytes) ? `observed=${details.observedBytes}` : null,
    Number.isInteger(details.limitBytes) ? `limit=${details.limitBytes}` : null,
    Number.isInteger(details.observedSymbols) ? `observedSymbols=${details.observedSymbols}` : null,
    Number.isInteger(details.limitSymbols) ? `limitSymbols=${details.limitSymbols}` : null,
    Number.isInteger(details.observedRows) ? `observedRows=${details.observedRows}` : null,
    Number.isInteger(details.limitRows) ? `limitRows=${details.limitRows}` : null
  ].filter(Boolean).join(' '));
  Object.assign(error, details);
  return error;
}

function enforceArtifactBytes(policy, checks, family, relativePath, bytes) {
  const result = validateFeature019ArtifactBytes({ policy, family, path: relativePath, bytes });
  if (!result.ok) throw artifactBudgetError(result);
  checks.push({
    family,
    path: relativePath,
    observedBytes: result.value.observedBytes,
    limitBytes: result.value.limitBytes,
    serialization: 'on-disk'
  });
  return bytes;
}

function readBudgetedText(root, relativePath, family, policy, checks) {
  return enforceArtifactBytes(policy, checks, family, relativePath, readText(root, relativePath));
}

function readBudgetedJson(root, relativePath, family, policy, checks) {
  return JSON.parse(readBudgetedText(root, relativePath, family, policy, checks));
}

function exactKeys(value, fields) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).sort().join('|') === [...fields].sort().join('|');
}

function normalizedPageText(value) {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readBoundedResponse(response, maxBytes) {
  const declared = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > maxBytes) return null;
  return new TextDecoder().decode(bytes);
}

export function createResearchAgendaLiveBoundary({ searchFragment, queryPlan, fetchImpl = globalThis.fetch, now = Date.now, deadlineAtMs = Number.POSITIVE_INFINITY }) {
  if (!exactKeys(searchFragment, SEARCH_FRAGMENT_FIELDS) ||
      searchFragment.contractVersion !== RESEARCH_ACQUISITION_SEARCH_VERSION ||
      searchFragment.generationId !== queryPlan?.runId || !Array.isArray(searchFragment.queries) ||
      typeof fetchImpl !== 'function' || typeof now !== 'function' || !(Number.isFinite(deadlineAtMs) || deadlineAtMs === Number.POSITIVE_INFINITY)) {
    return { ok: false, error: { code: 'E019-AGENDA-ACQUISITION', reason: 'search-fragment-invalid' } };
  }
  const plannedQueries = new Map((queryPlan.queries || []).map((query) => [query.queryId, query]));
  if (searchFragment.queries.length !== plannedQueries.size) {
    return { ok: false, error: { code: 'E019-AGENDA-ACQUISITION', reason: 'search-query-accounting-invalid' } };
  }
  const candidatesByQuery = new Map();
  const candidatesByUrl = new Map();
  const candidateIds = new Set();
  for (const row of searchFragment.queries) {
    const query = plannedQueries.get(row?.queryId);
    if (!query || !exactKeys(row, SEARCH_QUERY_FIELDS) || !Array.isArray(row.candidates) || row.candidates.length > query.maxResults || candidatesByQuery.has(row.queryId)) {
      return { ok: false, error: { code: 'E019-AGENDA-ACQUISITION', reason: 'search-query-invalid' } };
    }
    const candidates = [];
    for (const candidate of row.candidates) {
      const stringList = (value) => Array.isArray(value) && value.every((entry) => typeof entry === 'string' && entry.length > 0);
      if (!exactKeys(candidate, SEARCH_CANDIDATE_FIELDS) || typeof candidate.candidateId !== 'string' ||
          !candidate.candidateId.startsWith(row.queryId + ':c') || candidateIds.has(candidate.candidateId) ||
          typeof candidate.url !== 'string' || typeof candidate.title !== 'string' || !candidate.title ||
          typeof candidate.publisher !== 'string' || !candidate.publisher || !Number.isFinite(Date.parse(candidate.publishedAt)) ||
          !query.requiredSourceClasses.includes(candidate.sourceClass) ||
          !(candidate.canonicalOriginRef === null || typeof candidate.canonicalOriginRef === 'string') ||
          !(candidate.directionTag === null || typeof candidate.directionTag === 'string') ||
          !stringList(candidate.supportsClaims) || !stringList(candidate.excerpts) || candidatesByUrl.has(candidate.url)) {
        return { ok: false, error: { code: 'E019-AGENDA-ACQUISITION', reason: 'search-candidate-invalid' } };
      }
      candidateIds.add(candidate.candidateId);
      candidatesByUrl.set(candidate.url, candidate);
      candidates.push({ candidateId: candidate.candidateId, url: candidate.url });
    }
    candidatesByQuery.set(row.queryId, candidates);
  }
  const boundary = {
    async search(query) {
      return (candidatesByQuery.get(query?.queryId) || []).map((candidate) => ({ ...candidate }));
    },
    async retrieve(url, options = {}) {
      const startedAt = now();
      const remainingMs = Math.min(options.timeoutMs, deadlineAtMs - startedAt);
      if (!(remainingMs > 0)) return { error: 'request-timeout', durationMs: 0 };
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), remainingMs);
      try {
        const response = await fetchImpl(url, {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'user-agent': options.userAgent,
            accept: 'text/html,text/plain'
          }
        });
        const body = await readBoundedResponse(response, options.maxBytes);
        const location = response.headers?.get?.('location');
        const finalUrl = response.status >= 300 && response.status < 400
          ? (location ? new URL(location, url).href : new URL('/__redirect_refused__', url).href)
          : (response.url || url);
        if (body === null) return { error: 'response-bytes-over-cap', durationMs: Math.max(0, now() - startedAt) };
        const candidate = candidatesByUrl.get(url);
        const plainBody = normalizedPageText(body);
        const excerpts = candidate ? candidate.excerpts.filter((excerpt) => plainBody.includes(normalizedPageText(excerpt))) : [];
        return {
          status: response.status,
          finalUrl,
          contentType: response.headers?.get?.('content-type') || 'text/plain',
          body,
          durationMs: Math.max(0, now() - startedAt),
          meta: candidate ? {
            title: candidate.title,
            publisher: candidate.publisher,
            publishedAt: candidate.publishedAt,
            sourceClass: candidate.sourceClass,
            canonicalOriginRef: candidate.canonicalOriginRef,
            supportsClaims: candidate.supportsClaims.slice(),
            directionTag: candidate.directionTag,
            excerpts
          } : {}
        };
      } catch {
        return { error: 'request-timeout', durationMs: Math.max(0, now() - startedAt) };
      } finally {
        clearTimeout(timer);
      }
    }
  };
  return { ok: true, value: boundary };
}

function walkJson(root, relativeDir) {
  const absoluteDir = resolve(root, relativeDir);
  if (!existsSync(absoluteDir)) return [];
  const rows = [];
  for (const name of readdirSync(absoluteDir)) {
    const relativePath = relativeDir + '/' + name;
    const absolutePath = resolve(root, relativePath);
    if (statSync(absolutePath).isDirectory()) rows.push(...walkJson(root, relativePath));
    else if (name.endsWith('.json')) rows.push([relativePath, readJson(root, relativePath)]);
  }
  return rows;
}

function barIdsForDefinition(definition) {
  return [...new Set([
    ...(definition.transmissionModels || []).map((model) => model.barId),
    ...(definition.proxyDefinitions || []).map((proxy) => proxy.ticker)
  ])];
}

function committedBarRecords(definition, cutoffAt, barInputsBySymbol) {
  const records = [];
  const barIds = barIdsForDefinition(definition);
  for (const requirement of definition.sourceRequirements || []) {
    if (!requirement.sourceClasses.includes('committed-bar') || barIds.length === 0) continue;
    const bars = barIds.filter((barId) => Object.hasOwn(barInputsBySymbol, barId));
    if (bars.length !== barIds.length) continue;
    const observedAt = bars.map((barId) => {
      const bar = barInputsBySymbol[barId].value;
      return `${bar.asof}T23:59:59.000Z`;
    }).sort().at(-1);
    if (Date.parse(observedAt) > Date.parse(cutoffAt)) continue;
    const digest = RLAGENDA.agendaDigest(Object.fromEntries(bars.map((barId) => [barId, RLAGENDA.sha256Text(barInputsBySymbol[barId].bytes)])));
    records.push({
      requirementId: requirement.requirementId,
      sourceId: `${definition.topicId}-${requirement.requirementId}-committed-bars`,
      observedAt,
      availableAt: observedAt,
      contentSha256: digest,
      claimCoverage: requirement.requiredClaimCoverage.slice(),
      freshnessPolicyRef: researchAgendaFreshnessPolicyRef(definition, requirement)
    });
  }
  return records;
}

function compactSnapshot(snapshot) {
  return {
    asOf: snapshot.asOf,
    generatedAt: snapshot.generatedAt,
    window: snapshot.window,
    nextSessionDate: snapshot.nextSessionDate,
    regime: snapshot.regime,
    toolReads: snapshot.toolReads
  };
}

function loadExistingRecords(root, artifactBudgetPolicy, artifactBudgetChecks) {
  return Object.fromEntries(walkJson(root, 'research/agenda').filter(([, record]) => [
    RLAGENDA.GENERATION_VERSION,
    RLAGENDA.REVIEW_VERSION,
    RLAGENDA.DOSSIER_VERSION,
    RLAGENDA.SOURCE_VERSION
  ].includes(record.contractVersion)).map(([relativePath, record]) => {
    const family = feature019ArtifactFamilyForCandidate(relativePath, record);
    if (!family) {
      throw artifactBudgetError({
        ok: false,
        error: { code: 'E019-ARTIFACT-BUDGET', reason: 'artifact-family-unknown', family: null, path: relativePath }
      });
    }
    readBudgetedText(root, relativePath, family, artifactBudgetPolicy, artifactBudgetChecks);
    return [relativePath, record];
  }));
}

function currentPriorDossiers(current, existingRecordsByPath) {
  const priors = {};
  for (const topicRef of current.topicRefs || []) {
    const review = topicRef.reviewRef?.path ? existingRecordsByPath[topicRef.reviewRef.path] : null;
    const path = topicRef.dossierRef?.path || review?.predecessorDossierRef?.path;
    const dossier = path ? existingRecordsByPath[path] : null;
    if (dossier && dossier.historicalOnly !== true) priors[topicRef.topicId] = dossier;
  }
  return priors;
}

export function prepareResearchAgendaRuntime({ root = process.cwd(), snapshot, config, payload }) {
  const artifactBudgetResult = resolveFeature019ArtifactBudgetPolicy(config);
  if (!artifactBudgetResult.ok) throw artifactBudgetError(artifactBudgetResult);
  const artifactBudgetPolicy = artifactBudgetResult.value;
  const artifactBudgetChecks = [];
  const registry = readBudgetedJson(root, 'research-agenda.json', 'registry', artifactBudgetPolicy, artifactBudgetChecks);
  const tools = readJson(root, 'tools.json');
  for (const [relativePath, family] of [
    ['rlagenda.js', 'umd-module'],
    ['rlexperience-adapters/research-agenda.js', 'experience-adapter'],
    ['research-agenda-lab.html', 'tool-page']
  ]) {
    readBudgetedText(root, relativePath, family, artifactBudgetPolicy, artifactBudgetChecks);
  }
  const researchAgendaTool = tools.tools.find((tool) => tool.id === 'research-agenda-lab');
  if (!researchAgendaTool || typeof researchAgendaTool.notes !== 'string' || researchAgendaTool.notes.length === 0) {
    throw new Error('research agenda tool note path missing');
  }
  readBudgetedText(root, researchAgendaTool.notes, 'tool-note', artifactBudgetPolicy, artifactBudgetChecks);
  const agendaPolicyResult = RLAGENDA.resolveAgendaPolicy(registry.reviewPolicy);
  if (!agendaPolicyResult.ok) throw new Error(`research agenda registry policy failed: ${agendaPolicyResult.code}`);
  const agendaPolicy = agendaPolicyResult.value;
  const policyDigest = agendaPolicyResult.digest;
  const historyText = readBudgetedText(root, 'research/agenda/history.jsonl', 'history-ledger', artifactBudgetPolicy, artifactBudgetChecks);
  const current = readBudgetedJson(root, 'research/agenda/current.json', 'current', artifactBudgetPolicy, artifactBudgetChecks);
  const cutoffAt = snapshot.generatedAt || snapshot.asOf;
  const generation = RLAGENDA.deriveGenerationId({
    snapshotDigest: RLAGENDA.agendaDigest(snapshot),
    registryDigest: RLAGENDA.agendaDigest(registry),
    briefWindow: { start: cutoffAt, end: cutoffAt },
    generationCutoff: cutoffAt
  });
  if (!generation.ok) throw new Error(`research agenda generation identity failed: ${generation.field}`);
  const definitionsByTopicId = Object.fromEntries(registry.topics.map((topic) => [
    topic.topicId,
    readBudgetedJson(root, topic.definitionRef, 'definition', artifactBudgetPolicy, artifactBudgetChecks)
  ]));
  const calibrationsByTopicId = Object.fromEntries(registry.topics.map((topic) => {
    const ref = definitionsByTopicId[topic.topicId].calibrationRef;
    return [topic.topicId, ref
      ? readBudgetedJson(root, ref, 'calibration', artifactBudgetPolicy, artifactBudgetChecks)
      : { contractVersion: RLAGENDA.CALIBRATION_VERSION, topicId: topic.topicId, calibrationVersion: 'v1.0.0', events: [] }];
  }));
  const requestedBarIds = [...new Set(Object.values(definitionsByTopicId).flatMap(barIdsForDefinition))];
  const barInputsBySymbol = Object.fromEntries(requestedBarIds.filter((barId) => existsSync(resolve(root, `data/bars/${barId}.json`))).map((barId) => {
    const bytes = readText(root, `data/bars/${barId}.json`);
    return [barId, { bytes, value: JSON.parse(bytes) }];
  }));
  const modelInputBudget = validateFeature019ModelInputBudget({
    policy: artifactBudgetPolicy,
    symbols: requestedBarIds,
    barsBySymbol: Object.fromEntries(Object.entries(barInputsBySymbol).map(([barId, input]) => [barId, input.value]))
  });
  if (!modelInputBudget.ok) throw artifactBudgetError(modelInputBudget);
  const existingRecordsByPath = loadExistingRecords(root, artifactBudgetPolicy, artifactBudgetChecks);
  const priorDossiersByTopicId = currentPriorDossiers(current, existingRecordsByPath);
  const evidenceByTopicId = Object.fromEntries(registry.topics.map((topic) => [
    topic.topicId,
    [
      ...committedBarRecords(definitionsByTopicId[topic.topicId], cutoffAt, barInputsBySymbol),
      ...(Array.isArray(priorDossiersByTopicId[topic.topicId]?.sourceLedger)
        ? priorDossiersByTopicId[topic.topicId].sourceLedger
        : [])
    ]
  ]));
  const plan = RLAGENDA.planGeneration(registry, historyText, { definitionsByTopicId, triggerObservations: [] }, cutoffAt);
  if (!plan.ok) throw new Error(`research agenda plan failed: ${plan.code || plan.status}`);
  const acquisitionPlan = planResearchAgendaAcquisition({ plan, definitionsByTopicId, evidenceByTopicId, cutoffAt });
  if (!acquisitionPlan.ok) throw new Error(`research agenda acquisition plan failed: ${acquisitionPlan.error.reason}`);
  const policy = resolveResearchAgendaPolicy(config);
  if (!policy.ok) throw new Error(`research agenda policy failed: ${policy.error.reason}`);
  const queryInput = buildResearchAgendaQueryInput({ acquisitionPlan: acquisitionPlan.value, definitionsByTopicId, runId: generation.id, cutoffAt, policy: policy.value });
  if (!queryInput.ok) throw new Error(`research agenda query plan failed: ${queryInput.error.reason}`);
  const queryPlan = queryInput.value === null ? null : renderQueryPlan(queryInput.value, policy.value);
  if (queryPlan && !queryPlan.ok) throw new Error(`research agenda rendered query plan failed: ${queryPlan.error.detail}`);
  const claimSpecs = acquisitionPlan.value.missingRequirements.map((missing) => {
    const requirement = definitionsByTopicId[missing.topicId].sourceRequirements.find((row) => row.requirementId === missing.requirementId);
    return {
      claimId: `${missing.topicId}:${missing.requirementId}`,
      materiality: 'material',
      claimKind: 'general-material',
      normalizedClaim: requirement.requiredClaimCoverage.join(', ')
    };
  });
  const currentBarsByTopicId = Object.fromEntries(registry.topics.map((topic) => {
    const definition = definitionsByTopicId[topic.topicId];
    return [topic.topicId, Object.fromEntries(barIdsForDefinition(definition).filter((barId) => Object.hasOwn(barInputsBySymbol, barId)).map((barId) => [barId, barInputsBySymbol[barId].value]))];
  }));
  const selectedEntries = plan.selected.map((selected) => {
    const topic = registry.topics.find((row) => row.topicId === selected.topicId);
    return {
      topic,
      definition: definitionsByTopicId[selected.topicId],
      acquisition: acquisitionPlan.value.topics.find((row) => row.topicId === selected.topicId),
      committedEvidence: evidenceByTopicId[selected.topicId],
      priorDossier: priorDossiersByTopicId[selected.topicId] || null,
      snapshot: compactSnapshot(snapshot)
    };
  });
  const inputFingerprint = RLAGENDA.agendaDigest({
    generationId: generation.id,
    cutoffAt,
    snapshot,
    registry,
    definitionsByTopicId,
    calibrationsByTopicId,
    evidenceByTopicId,
    currentBarsByTopicId,
    current,
    historyText
  });
  const retryCacheIdentity = RLAGENDA.agendaDigest({
    generationId: generation.id,
    inputFingerprint,
    policyDigest
  });
  return {
    root,
    registry,
    agendaPolicy,
    policyDigest,
    historyText,
    current,
    payload,
    snapshot,
    tools,
    cutoffAt,
    generationId: generation.id,
    inputFingerprint,
    retryCacheIdentity,
    plan,
    config,
    artifactBudgetPolicy,
    artifactBudgetChecks,
    modelInputBudget: modelInputBudget.value,
    policy: policy.value,
    queryInput: queryInput.value,
    queryPlan: queryPlan?.value || null,
    claimSpecs,
    acquisitionPlan: acquisitionPlan.value,
    definitionsByTopicId,
    calibrationsByTopicId,
    evidenceByTopicId,
    currentBarsByTopicId,
    priorDossiersByTopicId,
    existingRecordsByPath,
    authorInput: {
      contractVersion: 'research-author-input/v1',
      generationId: generation.id,
      cutoffAt,
      policy: agendaPolicy.researchAuthoring,
      policyDigest,
      selectedTopics: selectedEntries
    },
    acquisitionInput: queryPlan?.value ? {
      contractVersion: 'research-acquisition-author-input/v1',
      generationId: generation.id,
      policy: agendaPolicy,
      policyDigest,
      queryPlan: queryPlan.value,
      claimSpecs
    } : null
  };
}

function topicAcquisitionTasks(preparation, searchFragment) {
  if (preparation.queryInput === null || preparation.queryPlan === null) return [];
  const globalQueryByTemplateId = new Map(preparation.queryPlan.queries.map((query) => [query.templateId, query]));
  const searchRowsByQueryId = new Map((searchFragment?.queries || []).map((row) => [row.queryId, row]));
  return preparation.plan.selected.map((selected) => {
    const templatePrefix = selected.topicId + '-';
    const templates = preparation.queryInput.templates.filter((template) => template.templateId.startsWith(templatePrefix));
    if (templates.length === 0) return null;
    const queryInput = {
      ...preparation.queryInput,
      runId: preparation.generationId + ':' + selected.topicId,
      templates
    };
    const rendered = renderQueryPlan(queryInput, preparation.policy);
    if (!rendered.ok) throw new Error(`research agenda topic query plan failed: ${rendered.error.detail}`);
    const queryPlan = rendered.value;
    const topicSearchFragment = searchFragment ? {
      contractVersion: searchFragment.contractVersion,
      generationId: queryPlan.runId,
      queries: queryPlan.queries.map((query) => {
        const globalQuery = globalQueryByTemplateId.get(query.templateId);
        const globalRow = globalQuery ? searchRowsByQueryId.get(globalQuery.queryId) : null;
        return {
          queryId: query.queryId,
          candidates: (globalRow?.candidates || []).map((candidate, index) => ({
            ...candidate,
            candidateId: query.queryId + ':c' + index
          }))
        };
      })
    } : null;
    return {
      topicId: selected.topicId,
      queryInput,
      queryPlan,
      searchFragment: topicSearchFragment,
      claimSpecs: preparation.claimSpecs.filter((claim) => claim.claimId.startsWith(selected.topicId + ':'))
    };
  }).filter(Boolean);
}

export async function bindResearchAgendaAcquisition({ preparation, searchFragment, fetchImpl = globalThis.fetch, now = Date.now, deadlineAtMs = Number.POSITIVE_INFINITY }) {
  const globalBoundary = preparation.queryPlan === null ? null : createResearchAgendaLiveBoundary({
    searchFragment,
    queryPlan: preparation.queryPlan,
    fetchImpl,
    now,
    deadlineAtMs
  });
  const tasks = topicAcquisitionTasks(preparation, globalBoundary && !globalBoundary.ok ? null : searchFragment);
  const pool = await runResearchTopicAcquisitionPool({
    topics: tasks,
    policy: preparation.agendaPolicy,
    policyDigest: preparation.policyDigest,
    acquireFn: async (task) => {
      if (globalBoundary && !globalBoundary.ok) return globalBoundary;
      const boundary = createResearchAgendaLiveBoundary({
        searchFragment: task.searchFragment,
        queryPlan: task.queryPlan,
        fetchImpl,
        now,
        deadlineAtMs
      });
      if (!boundary.ok) return boundary;
      return acquireResearchAgendaEvidence({
        config: preparation.config,
        queryInput: task.queryInput,
        boundary: boundary.value,
        acquisitionStartedAt: preparation.cutoffAt,
        frozenAt: preparation.cutoffAt,
        claimSpecs: task.claimSpecs,
        ownerEvidence: {}
      });
    }
  });
  if (!pool.ok) return pool;
  const successfulBundles = Object.values(pool.value.resultsByTopicId)
    .map((result) => result?.value?.bundle)
    .filter(Boolean);
  const aggregateBundleBytes = successfulBundles.reduce((sum, bundle) => sum + (bundle.byteInventory?.bundleBytes || 0), 0);
  const aggregateOrigins = new Set(successfulBundles.flatMap((bundle) => bundle.sources.map((source) => source.independentOriginGroup)));
  let aggregateFailure = null;
  if (aggregateBundleBytes > preparation.policy.maxBundleBytes) aggregateFailure = 'response-bytes-over-cap';
  else if (aggregateOrigins.size > preparation.policy.maxRetainedOrigins) aggregateFailure = 'candidate-cardinality-over-cap';
  else if (pool.value.telemetry.elapsedMs > preparation.policy.totalAcquisitionMs) aggregateFailure = 'request-timeout';

  const acquisitionFailuresByTopicId = { ...pool.value.failuresByTopicId };
  if (aggregateFailure) tasks.forEach((task) => { acquisitionFailuresByTopicId[task.topicId] = aggregateFailure; });
  const acquisitionResult = {
    ok: Object.keys(acquisitionFailuresByTopicId).length === 0,
    value: {
      state: tasks.length === 0 ? 'fully-reused' : (Object.keys(acquisitionFailuresByTopicId).length === 0 ? 'acquired' : 'partial'),
      policy: preparation.policy,
      policyDigest: preparation.policyDigest,
      resultsByTopicId: pool.value.resultsByTopicId,
      telemetry: {
        ...pool.value.telemetry,
        aggregateBundleBytes,
        retainedOriginCount: aggregateOrigins.size,
        maxConcurrentFetchesPerTopic: preparation.policy.maxConcurrentFetches
      }
    }
  };
  if (tasks.length === 0) {
    acquisitionResult.value.resultsByTopicId = {};
  }
  const selectedTopics = preparation.authorInput.selectedTopics.map((entry) => {
    const requirementPlan = preparation.acquisitionPlan.topics.find((row) => row.topicId === entry.topic.topicId);
    const topicResult = pool.value.resultsByTopicId[entry.topic.topicId];
    const failureReason = acquisitionFailuresByTopicId[entry.topic.topicId] || null;
    return {
      ...entry,
      acquisition: {
        state: failureReason ? 'failed' : (topicResult?.value?.state || 'fully-reused'),
        requirementPlan,
        bundle: failureReason ? null : (topicResult?.value?.bundle || null),
        policyDigest: preparation.policyDigest
      }
    };
  });
  return {
    ok: true,
    value: {
      acquisitionResult,
      acquisitionFailuresByTopicId,
      authorInput: { ...preparation.authorInput, selectedTopics }
    }
  };
}

function situationMap(preparation, fragment) {
  const situations = {};
  const failures = {};
  if (!fragment || fragment.contractVersion !== RESEARCH_AGENDA_CONTRACTS.situationSet || fragment.generationId !== preparation.generationId || !Array.isArray(fragment.situations)) {
    for (const selected of preparation.plan.selected) failures[selected.topicId] = 'research-lane-unavailable';
    return { situations, failures };
  }
  for (const selected of preparation.plan.selected) {
    const topic = preparation.registry.topics.find((row) => row.topicId === selected.topicId);
    const definition = preparation.definitionsByTopicId[selected.topicId];
    const situation = fragment.situations.find((row) => row?.topicId === selected.topicId);
    const validated = validateResearchSituation(situation, { generationId: preparation.generationId, topic, definition });
    if (validated.ok) situations[selected.topicId] = validated.value;
    else failures[selected.topicId] = validated.error.reason;
  }
  return { situations, failures };
}

function fsIo(root) {
  const full = (relativePath) => resolve(root, relativePath);
  return {
    exists: (relativePath) => existsSync(full(relativePath)),
    read: (relativePath) => readFileSync(full(relativePath)),
    create: (relativePath, bytes) => {
      mkdirSync(dirname(full(relativePath)), { recursive: true });
      writeFileSync(full(relativePath), bytes, { flag: 'wx' });
    },
    rename: (sourcePath, targetPath) => renameSync(full(sourcePath), full(targetPath)),
    remove: (relativePath) => rmSync(full(relativePath), { recursive: true, force: true })
  };
}

function predecessorComparisonOutput(dossier, definition) {
  if (!dossier || dossier.historicalOnly === true) return null;
  const model = dossier.modelOutputs;
  if (!model || typeof model !== 'object' || !Array.isArray(model.evidenceLedger)) return {};
  const rootNodes = definition.scenarioTree.nodes.filter((node) => node.parentId === null);
  return {
    probabilities: Object.fromEntries(rootNodes.map((node) => [node.scenarioId, model.scenarioProbabilities[node.scenarioId].unconditional])),
    evidenceIds: model.evidenceLedger.map((row) => row.evidenceId),
    conflictIds: [...new Set(model.evidenceLedger.flatMap((row) => row.conflicts.evidenceIds))].sort(),
    directionScore: model.directionScore,
    dominantScenarioId: model.dominantScenarioId,
    declaredQuestionSha256: dossier.declaredQuestionSha256
  };
}

export function finalizeResearchAgendaRuntime({ preparation, researchFragment, payload, acquisitionFailuresByTopicId = {}, promote = true }) {
  const mapped = situationMap(preparation, researchFragment);
  const situations = mapped.situations;
  const failures = { ...mapped.failures, ...acquisitionFailuresByTopicId };
  const deterministicOutputsByTopicId = {};
  for (const [topicId, situation] of Object.entries(situations)) {
    if (failures[topicId]) continue;
    const topic = preparation.registry.topics.find((row) => row.topicId === topicId);
    const definition = preparation.definitionsByTopicId[topicId];
    const output = computeResearchAgendaOutputs({
      definition,
      calibration: preparation.calibrationsByTopicId[topicId],
      situation,
      currentBars: preparation.currentBarsByTopicId[topicId],
      generationCutoff: preparation.cutoffAt,
      declaredQuestion: topic.declaredQuestion,
      predecessorOutput: predecessorComparisonOutput(preparation.priorDossiersByTopicId[topicId] || null, definition)
    });
    if (output.ok) deterministicOutputsByTopicId[topicId] = output.value;
    else failures[topicId] = output.error.reason;
  }
  const candidate = composeResearchAgendaCandidate({
    registry: preparation.registry,
    plan: preparation.plan,
    definitionsByTopicId: preparation.definitionsByTopicId,
    generationId: preparation.generationId,
    generationCutoff: preparation.cutoffAt,
    situationsByTopicId: situations,
    failuresByTopicId: failures,
    deterministicOutputsByTopicId,
    priorDossiersByTopicId: preparation.priorDossiersByTopicId
  });
  if (!candidate.ok) return candidate;
  const transaction = buildResearchAgendaTransaction({
    candidate: candidate.value,
    payload,
    historyText: preparation.historyText,
    registry: preparation.registry,
    existingRecordsByPath: preparation.existingRecordsByPath,
    pageInputs: { config: preparation.config, snapshot: preparation.snapshot, tools: preparation.tools }
  });
  if (!transaction.ok) return transaction;
  const promoted = promote ? promoteResearchAgendaTransaction(transaction.value, fsIo(preparation.root)) : null;
  if (promoted && !promoted.ok) return promoted;
  return {
    ok: true,
    candidate: candidate.value,
    transaction: transaction.value,
    promotion: promoted?.value || null,
    failuresByTopicId: failures
  };
}

export function promoteResearchAgendaPublicationCandidate({ root = process.cwd(), candidate, payload }) {
  const snapshot = readJson(root, 'market-brief.snapshot.json');
  const config = readJson(root, 'market-brief.config.json');
  const preparation = prepareResearchAgendaRuntime({ root, snapshot, config, payload });
  if (!candidate || candidate.generationId !== preparation.generationId) {
    return { ok: false, error: { code: 'E019-AGENDA-TRANSACTION', reason: 'publication-candidate-generation-mismatch' } };
  }
  const transaction = buildResearchAgendaTransaction({
    candidate,
    payload,
    historyText: preparation.historyText,
    registry: preparation.registry,
    existingRecordsByPath: preparation.existingRecordsByPath,
    pageInputs: { config: preparation.config, snapshot: preparation.snapshot, tools: preparation.tools }
  });
  if (!transaction.ok) return transaction;
  const promotion = promoteResearchAgendaTransaction(transaction.value, fsIo(root));
  if (!promotion.ok) return promotion;
  return { ok: true, transaction: transaction.value, promotion: promotion.value };
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--promote-candidate') {
    const payloadFlag = args.indexOf('--payload-candidate');
    if (args.length !== 4 || payloadFlag !== 2 || !args[1] || !args[3]) {
      console.error('Usage: node scripts/research-agenda-refresh.mjs --promote-candidate <path> --payload-candidate <path>');
      process.exit(2);
    }
    const publicationPath = resolve(args[1]);
    const payloadPath = resolve(args[3]);
    try {
      const publication = JSON.parse(readFileSync(publicationPath, 'utf8'));
      const publicationKeys = publication && typeof publication === 'object' && !Array.isArray(publication)
        ? Object.keys(publication).sort().join('|')
        : '';
      if (publicationKeys !== 'candidate|contractVersion|failuresByTopicId' ||
          publication.contractVersion !== RESEARCH_AGENDA_PUBLICATION_CANDIDATE_VERSION) {
        throw new Error('publication candidate shape is invalid');
      }
      const result = promoteResearchAgendaPublicationCandidate({
        root: process.cwd(),
        candidate: publication.candidate,
        payload: JSON.parse(readFileSync(payloadPath, 'utf8'))
      });
      if (!result.ok) throw new Error(`${result.error?.code || 'E019'} ${result.error?.reason || 'publication failed'}`);
      console.log(`[research-agenda] generation=${publication.candidate.generationId} pointerLast=${result.promotion.pointerLast}`);
      console.log(JSON.stringify({
        contractVersion: 'research-agenda-promotion-result/v1',
        generationId: publication.candidate.generationId,
        unavailableTopicCount: Object.keys(publication.failuresByTopicId).length,
        immutableCount: result.promotion.immutableCount,
        pointerLast: result.promotion.pointerLast
      }));
      return;
    } catch (error) {
      console.error(`[research-agenda] FAIL ${error.message}`);
      process.exitCode = 1;
      return;
    } finally {
      rmSync(publicationPath, { force: true });
      rmSync(payloadPath, { force: true });
    }
  }
  if (args.length !== 1 || args[0] !== '--publish-unavailable') {
    console.error('Usage: node scripts/research-agenda-refresh.mjs --publish-unavailable | --promote-candidate <path> --payload-candidate <path>');
    process.exit(2);
  }
  const root = process.cwd();
  const snapshot = readJson(root, 'market-brief.snapshot.json');
  const config = readJson(root, 'market-brief.config.json');
  const payload = readJson(root, 'market-brief.payload.json');
  const preparation = prepareResearchAgendaRuntime({ root, snapshot, config, payload });
  const finalized = finalizeResearchAgendaRuntime({ preparation, researchFragment: null, payload });
  if (!finalized.ok) {
    console.error(`[research-agenda] FAIL ${finalized.error?.code || 'E019'} ${finalized.error?.reason || 'unknown'}`);
    process.exit(1);
  }
  console.log(JSON.stringify({
    contractVersion: 'research-agenda-refresh-result/v1',
    generationId: preparation.generationId,
    selectedTopicCount: preparation.plan.selected.length,
    unavailableTopicCount: Object.keys(finalized.failuresByTopicId).length,
    immutableCount: finalized.promotion.immutableCount,
    pointerLast: finalized.promotion.pointerLast
  }));
}

const SCRIPT_PATH = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();
