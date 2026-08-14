import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
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
  planResearchAgendaAcquisition,
  promoteResearchAgendaTransaction,
  RESEARCH_AGENDA_CONTRACTS,
  resolveResearchAgendaPolicy,
  validateResearchSituation
} from './research-agenda-generation.mjs';
import { renderQueryPlan } from './web-evidence-acquire.mjs';

const require = createRequire(import.meta.url);
const RLAGENDA = require('../rlagenda.js');

export const RESEARCH_ACQUISITION_SEARCH_VERSION = 'research-acquisition-search/v1';
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

function committedBarRecords(root, topic, definition, cutoffAt) {
  const records = [];
  const barIds = barIdsForDefinition(definition);
  for (const requirement of definition.sourceRequirements || []) {
    if (!requirement.sourceClasses.includes('committed-bar') || barIds.length === 0) continue;
    const bars = barIds.filter((barId) => existsSync(resolve(root, `data/bars/${barId}.json`)));
    if (bars.length !== barIds.length) continue;
    const observedAt = bars.map((barId) => {
      const bar = readJson(root, `data/bars/${barId}.json`);
      return `${bar.asof}T23:59:59.000Z`;
    }).sort().at(-1);
    if (Date.parse(observedAt) > Date.parse(cutoffAt)) continue;
    const digest = RLAGENDA.agendaDigest(Object.fromEntries(bars.map((barId) => [barId, RLAGENDA.sha256Text(readText(root, `data/bars/${barId}.json`))])));
    records.push({
      requirementId: requirement.requirementId,
      observedAt,
      availableAt: observedAt,
      contentSha256: digest,
      claimCoverage: requirement.requiredClaimCoverage.slice(),
      barIds
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

function loadExistingRecords(root) {
  return Object.fromEntries(walkJson(root, 'research/agenda').filter(([, record]) => [
    RLAGENDA.GENERATION_VERSION,
    RLAGENDA.REVIEW_VERSION,
    RLAGENDA.DOSSIER_VERSION
  ].includes(record.contractVersion)));
}

function currentPriorDossiers(root, current, existingRecordsByPath) {
  const priors = {};
  for (const topicRef of current.topicRefs || []) {
    const path = topicRef.dossierRef?.path;
    const dossier = path ? existingRecordsByPath[path] : null;
    if (dossier && dossier.historicalOnly !== true) priors[topicRef.topicId] = dossier;
  }
  return priors;
}

export function prepareResearchAgendaRuntime({ root = process.cwd(), snapshot, config, payload }) {
  const registry = readJson(root, 'research-agenda.json');
  const historyText = readText(root, 'research/agenda/history.jsonl');
  const current = readJson(root, 'research/agenda/current.json');
  const cutoffAt = snapshot.generatedAt || snapshot.asOf;
  const generation = RLAGENDA.deriveGenerationId({
    snapshotDigest: RLAGENDA.agendaDigest(snapshot),
    registryDigest: RLAGENDA.agendaDigest(registry),
    briefWindow: { start: cutoffAt, end: cutoffAt },
    generationCutoff: cutoffAt
  });
  if (!generation.ok) throw new Error(`research agenda generation identity failed: ${generation.field}`);
  const definitionsByTopicId = Object.fromEntries(registry.topics.map((topic) => [topic.topicId, readJson(root, topic.definitionRef)]));
  const calibrationsByTopicId = Object.fromEntries(registry.topics.map((topic) => {
    const ref = definitionsByTopicId[topic.topicId].calibrationRef;
    return [topic.topicId, ref ? readJson(root, ref) : { contractVersion: RLAGENDA.CALIBRATION_VERSION, topicId: topic.topicId, calibrationVersion: 'v1.0.0', events: [] }];
  }));
  const evidenceByTopicId = Object.fromEntries(registry.topics.map((topic) => [
    topic.topicId,
    committedBarRecords(root, topic, definitionsByTopicId[topic.topicId], cutoffAt)
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
  const existingRecordsByPath = loadExistingRecords(root);
  const priorDossiersByTopicId = currentPriorDossiers(root, current, existingRecordsByPath);
  const currentBarsByTopicId = Object.fromEntries(registry.topics.map((topic) => {
    const definition = definitionsByTopicId[topic.topicId];
    return [topic.topicId, Object.fromEntries(barIdsForDefinition(definition).filter((barId) => existsSync(resolve(root, `data/bars/${barId}.json`))).map((barId) => [barId, readJson(root, `data/bars/${barId}.json`)]))];
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
  return {
    root,
    registry,
    historyText,
    current,
    payload,
    cutoffAt,
    generationId: generation.id,
    inputFingerprint,
    plan,
    config,
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
      policy: { timeoutSeconds: 900, attempts: 1, concurrency: 1, maxInputBytes: 524288, maxOutputBytes: 524288 },
      selectedTopics: selectedEntries
    },
    acquisitionInput: queryPlan?.value ? {
      contractVersion: 'research-acquisition-author-input/v1',
      generationId: generation.id,
      queryPlan: queryPlan.value,
      claimSpecs
    } : null
  };
}

export async function bindResearchAgendaAcquisition({ preparation, searchFragment, fetchImpl = globalThis.fetch, now = Date.now, deadlineAtMs = Number.POSITIVE_INFINITY }) {
  let acquisitionResult;
  if (preparation.queryPlan === null) {
    acquisitionResult = { ok: true, value: { state: 'fully-reused', policy: preparation.policy, bundle: null } };
  } else {
    const boundary = createResearchAgendaLiveBoundary({ searchFragment, queryPlan: preparation.queryPlan, fetchImpl, now, deadlineAtMs });
    if (!boundary.ok) acquisitionResult = boundary;
    else {
      acquisitionResult = await acquireResearchAgendaEvidence({
        config: preparation.config,
        queryInput: preparation.queryInput,
        boundary: boundary.value,
        acquisitionStartedAt: preparation.cutoffAt,
        frozenAt: preparation.cutoffAt,
        claimSpecs: preparation.claimSpecs,
        ownerEvidence: {}
      });
    }
  }
  const acquisitionFailuresByTopicId = {};
  const failureReason = acquisitionResult.ok ? null : (acquisitionResult.error?.reason || acquisitionResult.error?.detail || 'acquisition-failed');
  const selectedTopics = preparation.authorInput.selectedTopics.map((entry) => {
    const requirementPlan = preparation.acquisitionPlan.topics.find((row) => row.topicId === entry.topic.topicId);
    if (failureReason && requirementPlan.requirements.some((row) => row.state === 'missing-or-stale')) {
      acquisitionFailuresByTopicId[entry.topic.topicId] = failureReason;
    }
    return {
      ...entry,
      acquisition: {
        state: acquisitionResult.ok ? acquisitionResult.value.state : 'failed',
        requirementPlan,
        bundle: acquisitionResult.ok ? acquisitionResult.value.bundle : null
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
    read: (relativePath) => readFileSync(full(relativePath), 'utf8'),
    create: (relativePath, bytes) => {
      mkdirSync(dirname(full(relativePath)), { recursive: true });
      writeFileSync(full(relativePath), bytes, { flag: 'wx' });
    },
    replace: (relativePath, bytes) => {
      mkdirSync(dirname(full(relativePath)), { recursive: true });
      writeFileSync(full(relativePath), bytes);
    },
    remove: (relativePath) => rmSync(full(relativePath), { recursive: true, force: true })
  };
}

export function finalizeResearchAgendaRuntime({ preparation, researchFragment, payload, acquisitionFailuresByTopicId = {} }) {
  const mapped = situationMap(preparation, researchFragment);
  const situations = mapped.situations;
  const failures = { ...mapped.failures, ...acquisitionFailuresByTopicId };
  const deterministicOutputsByTopicId = {};
  for (const [topicId, situation] of Object.entries(situations)) {
    if (failures[topicId]) continue;
    const output = computeResearchAgendaOutputs({
      definition: preparation.definitionsByTopicId[topicId],
      calibration: preparation.calibrationsByTopicId[topicId],
      situation,
      currentBars: preparation.currentBarsByTopicId[topicId],
      generationCutoff: preparation.cutoffAt
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
    existingRecordsByPath: preparation.existingRecordsByPath
  });
  if (!transaction.ok) return transaction;
  const promoted = promoteResearchAgendaTransaction(transaction.value, fsIo(preparation.root));
  if (!promoted.ok) return promoted;
  return {
    ok: true,
    candidate: candidate.value,
    transaction: transaction.value,
    promotion: promoted.value,
    failuresByTopicId: failures
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || args[0] !== '--publish-unavailable') {
    console.error('Usage: node scripts/research-agenda-refresh.mjs --publish-unavailable');
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
