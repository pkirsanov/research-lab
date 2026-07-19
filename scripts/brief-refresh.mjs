#!/usr/bin/env node
/*
 * Actionable Market Brief — Tier A (deterministic data refresh).
 *
 * Runs HEADLESS (evo-x2 knb-managed timer, or macOS launchd) at the four daily
 * windows. Fetches VIX + CNN Fear&Greed + daily bars for the tracked universe and
 * watchlist, computes the deterministic signals (regime, per-name momentum, per-sector
 * 1m/3m momentum + tool-aligned RRG state) PLUS the structural frame (§6c) — long-horizon
 * 126/252-day momentum, 20/50/200-day MA structure, and 52-week-range position — and
 * APPENDS one snapshot to brief-history.jsonl —
 * the change-detection memory the agent (Tier B) and the tool read. It does NOT author
 * the narrative/recommendations/probabilities — that is the Copilot agent's job.
 *
 * From Node there is no CORS, so it fetches providers directly. Network failures are a
 * SOFT fail (log + exit 0) so a cron run never wedges. Educational only — not advice.
 *
 * Usage:  node scripts/brief-refresh.mjs [--window pre-market|morning|pre-close|after-hours]
 */
import { readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { buildToolAuthorRequest, invokeAuthor, validateAuthorEnvelope, AUTHOR_ERRORS } from './brief-author.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const featureRequire = createRequire(import.meta.url);
const RLCONTRACTS = featureRequire(join(ROOT, 'rlcontracts.js'));
const cfg = JSON.parse(read('market-brief.config.json'));
const wl = JSON.parse(read('watchlist.json'));
const SNAPSHOT_MAX_AGE_MS = 6 * 3600e3;

function canonicalCompanyValue(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('company owner read contains a non-finite number');
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalCompanyValue);
  if (!value || Object.getPrototypeOf(value) !== Object.prototype) throw new Error('company owner read contains a non-plain object');
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalCompanyValue(value[key])]));
}

function companyObjectSha256(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(canonicalCompanyValue(value))).digest('hex')}`;
}

function companyManifestSha256(manifest, hashObject) {
  const unsigned = JSON.parse(JSON.stringify(manifest));
  delete unsigned.manifestSha256;
  return hashObject(unsigned);
}

/* Feature 002 adapter company-fundamentals-owner-v1. It reads the frozen committed projection once and maps it
   without access to company formulas, browser state, or proposal decision functions. */
export function buildCompanyFundamentalsOwnerRead(readJson, hashObject) {
  if (typeof readJson !== 'function' || typeof hashObject !== 'function') throw new Error('company owner adapter requires injected JSON read and hash functions');
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const config = readJson('company-fundamentals.config.json');
  const boundary = config && config.feature002;
  if (!boundary || boundary.adapterId !== 'company-fundamentals-owner-v1' || boundary.readContractVersion !== 'tool-model-read/v1' || boundary.recommendationEligibility !== 'educational-research-only' || !Array.isArray(boundary.briefSubjects) || boundary.briefSubjects.length !== 1) throw new Error('company owner adapter configuration is invalid');
  const companyId = boundary.briefSubjects[0];
  const pointerPath = `data/company-fundamentals/companies/${companyId}/current.json`;
  const pointer = readJson(pointerPath);
  if (!pointer || pointer.contractVersion !== 'company-current-pointer/v1' || pointer.companyId !== companyId || !/^data\/company-fundamentals\/objects\/[a-f0-9]{64}\.json$/.test(pointer.manifestPath || '') || pointer.manifestSha256 !== `sha256:${pointer.manifestPath.slice(-69, -5)}`) throw new Error('company owner pointer is invalid');
  const manifest = readJson(pointer.manifestPath);
  if (!manifest || manifest.contractVersion !== 'company-publication-manifest/v1' || manifest.companyId !== companyId || manifest.publicationId !== pointer.publicationId || manifest.manifestSha256 !== pointer.manifestSha256 || companyManifestSha256(manifest, hashObject) !== pointer.manifestSha256 || !manifest.ownerReadRef || !manifest.briefRef) throw new Error('company owner manifest is invalid or hash-incoherent');
  const ownerRef = manifest.ownerReadRef;
  if (!/^data\/company-fundamentals\/objects\/[a-f0-9]{64}\.json$/.test(ownerRef.path || '') || ownerRef.sha256 !== `sha256:${ownerRef.path.slice(-69, -5)}`) throw new Error('company owner read reference is invalid');
  const owner = readJson(ownerRef.path);
  if (!owner || owner.contractVersion !== 'fundamentals-tool-read/v1' || owner.companyId !== companyId || owner.publicationId !== manifest.publicationId || owner.generation !== manifest.generation || hashObject(owner) !== ownerRef.sha256 || !owner.briefRef || owner.briefRef.objectId !== manifest.briefRef.objectId || !owner.modelPackRef || owner.modelPackRef.objectId !== manifest.modelPackRef.objectId) throw new Error('company owner read is invalid or hash-incoherent');
  const read = `${owner.companyId} fundamentals are ${owner.status}; direction ${owner.direction}; statement ${owner.statementCutoff || 'unavailable'}, model ${owner.modelCutoff || 'unavailable'}, brief ${owner.briefCutoff || 'unavailable'}, market ${owner.marketCutoff || 'unavailable'}.`;
  return {
    contractVersion: 'tool-model-read/v1',
    id: 'company-fundamentals-lab',
    toolId: 'company-fundamentals-lab',
    role: 'source',
    profile: 'static-model',
    adapter: { adapterId: boundary.adapterId, readContractVersion: boundary.readContractVersion, owningModelVersion: owner.publicationId },
    status: owner.status,
    asOf: owner.briefCutoff,
    sourceAsOf: owner.statementCutoff,
    modelAsOf: owner.modelCutoff,
    marketAsOf: owner.marketCutoff,
    evidenceCutoff: owner.retrievalCutoff,
    read,
    metrics: {
      companyId: owner.companyId,
      publicationId: owner.publicationId,
      generation: owner.generation,
      archetypeId: owner.archetypeId,
      statementCutoff: owner.statementCutoff,
      modelCutoff: owner.modelCutoff,
      briefCutoff: owner.briefCutoff,
      marketCutoff: owner.marketCutoff,
      retrievalCutoff: owner.retrievalCutoff,
      direction: owner.direction,
      briefStatus: owner.briefStatus,
      confidenceBand: owner.confidenceBand,
      coverage: clone(owner.coverage),
      materialChanges: clone(owner.materialChanges),
      modelImpactProposals: clone(owner.modelImpactProposals),
      disagreements: clone(owner.disagreements),
      sourceLinks: clone(owner.sourceLinks),
      watchConditions: clone(owner.watchConditions),
      invalidations: clone(owner.invalidations)
    },
    limitations: clone(owner.limitations),
    recommendationEligibility: clone(owner.recommendationEligibility),
    deepLink: owner.deepLinks.company,
    deepLinks: clone(owner.deepLinks),
    ownerReadRef: clone(ownerRef),
    fingerprint: ownerRef.sha256,
    source: boundary.adapterId
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Feature 002 Scope 04 — Event Reaction owner integration.

   The six initial owning-read consumers (design "Initial Owning-Read Consumers"):
   the five current normalized-read publishers plus the planned Intraday Tape
   publisher. Each declaration names the owner's adapter/model version, its declared
   XNYS-compatible symbols/session semantics, and the evidence types it consumes.
   The adapter maps the FROZEN MarketSessionEvidence/v1 refs into an additive typed
   evidenceInterpretation in the owner's terms; it NEVER recomputes the owner formula
   (RRG, FX, asset, bond, momentum, VWAP/profile/tape) and NEVER promotes shared
   Yahoo/BLS provenance into an independent confirmation. Only Bond Regime consumes the
   CPI report + reaction as a primary owner input that permits an owner action; the other
   five treat session evidence as tactical context only. Continuously traded instruments
   and non-declared symbols receive an explicit not-applicable interpretation.
   ───────────────────────────────────────────────────────────────────────────── */
export const OWNER_EVIDENCE_DECLARATIONS = Object.freeze([
  Object.freeze({
    toolId: 'intraday-tape-lab', adapterId: 'intraday-tape-owning-model-v1', owningModelVersion: 'intraday-tape/v1',
    profile: 'live-market', deepLink: 'intraday-tape-lab.html',
    symbols: Object.freeze(['SPY', 'QQQ']), nonApplicableSymbols: Object.freeze([]),
    consumes: Object.freeze(['session-aggregate', 'comparable-volume-baseline']), consumesReport: false,
    summary: 'Session evidence replaces the fixed-offset segmentation for the published tape read; VWAP, profile, tape-control, and session-type interpretation stay owner-owned.'
  }),
  Object.freeze({
    toolId: 'sector-research-lab', adapterId: 'sector-owning-model-v1', owningModelVersion: 'sector-rrg/v1',
    profile: 'live-market', deepLink: 'sector-research-lab.html',
    symbols: Object.freeze(['SPY', 'XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE', 'XLC']), nonApplicableSymbols: Object.freeze([]),
    consumes: Object.freeze(['session-aggregate', 'comparable-volume-baseline']), consumesReport: false,
    summary: 'Session evidence is tactical confirmation and context only; RRG, acceleration, breadth, rotation direction, trigger, and invalidation stay owner-owned.'
  }),
  Object.freeze({
    toolId: 'etf-momentum-lab', adapterId: 'etf-momentum-owning-model-v1', owningModelVersion: 'etf-momentum/v1',
    profile: 'live-market', deepLink: 'etf-momentum-lab.html',
    symbols: Object.freeze(['SPY', 'QQQ', 'IWM', 'DIA', 'XLK', 'SMH', 'XLF', 'XLE']), nonApplicableSymbols: Object.freeze([]),
    consumes: Object.freeze(['session-aggregate', 'comparable-volume-baseline']), consumesReport: false,
    summary: 'Session evidence is published context only; it cannot change the momentum and risk ranking score or its horizon.'
  }),
  Object.freeze({
    toolId: 'global-rotation-lab', adapterId: 'global-rotation-owning-model-v1', owningModelVersion: 'global-rotation/v1',
    profile: 'live-market', deepLink: 'global-rotation-lab.html',
    symbols: Object.freeze(['SPY', 'ACWI', 'EWJ', 'EWG', 'EWU', 'EWC', 'EWA', 'EWY', 'EWZ', 'INDA', 'FXI']), nonApplicableSymbols: Object.freeze([]),
    consumes: Object.freeze(['session-aggregate']), consumesReport: false,
    summary: 'Only US-listed country-ETF XNYS session evidence is consumed as context; non-US local sessions are never forced into XNYS evidence, and the country, FX, local-close, trend, and risk model stays owner-owned.'
  }),
  Object.freeze({
    toolId: 'real-assets-lab', adapterId: 'real-assets-owning-model-v1', owningModelVersion: 'real-assets/v1',
    profile: 'live-market', deepLink: 'real-assets-lab.html',
    symbols: Object.freeze(['GLD', 'SLV', 'IBIT', 'DBC', 'UUP', 'TLT']), nonApplicableSymbols: Object.freeze(['BTC-USD', 'ETH-USD']),
    consumes: Object.freeze(['session-aggregate', 'comparable-volume-baseline']), consumesReport: false,
    summary: 'GLD, SLV, IBIT, DBC, UUP, and TLT session evidence is context; continuously traded BTC-USD and ETH-USD remain non-comparable under XNYS and expose not-applicable, and the asset-specific models stay owner-owned.'
  }),
  Object.freeze({
    toolId: 'bond-regime-lab', adapterId: 'bond-regime-owning-model-v1', owningModelVersion: 'bond-regime/v1',
    profile: 'live-market', deepLink: 'bond-regime-lab.html',
    symbols: Object.freeze(['SPY', 'TLT', 'LQD', 'HYG', 'IEF']), nonApplicableSymbols: Object.freeze([]),
    consumes: Object.freeze(['released-report-evidence', 'event-market-reaction']), consumesReport: true,
    summary: 'CPI actual, previous, and nullable consensus plus SPY, TLT, and credit-ETF reaction segments align the credit, curve, inflation, duration, and sleeve view; restricted local observations stay outside committed evidence.'
  })
]);

function ownerEvidenceFingerprint(seed) {
  return `sha256:${createHash('sha256').update(String(seed)).digest('hex')}`;
}

function collectOwnerEvidenceRefs(declaration, evidence) {
  const byType = {
    'session-aggregate': evidence.sessionAggregateRefs || [],
    'comparable-volume-baseline': evidence.volumeBaselineRefs || [],
    'released-report-evidence': evidence.releasedReportRefs || [],
    'event-market-reaction': evidence.eventReactionRefs || []
  };
  const refs = [];
  for (const evidenceType of declaration.consumes) {
    for (const ref of byType[evidenceType]) refs.push({ evidenceType: ref.evidenceType, fingerprint: ref.fingerprint });
  }
  return refs;
}

/* Produce ONE additive ToolModelRead/v1 owner read for a declared owner over the frozen
   MarketSessionEvidence/v1 bundle. Deterministic; no live fetch and no owner-formula recompute. */
export function buildOwnerEvidenceRead(declaration, evidence, runContext) {
  const symbol = (runContext && runContext.symbol) || null;
  const evidenceRefs = collectOwnerEvidenceRefs(declaration, evidence);
  const fingerprints = evidenceRefs.map((ref) => ref.fingerprint);
  const continuousSession = !!(symbol && declaration.nonApplicableSymbols.indexOf(symbol) >= 0);
  const symbolDeclared = declaration.consumesReport || !!(symbol && declaration.symbols.indexOf(symbol) >= 0);
  const applicable = symbolDeclared && !continuousSession && fingerprints.length > 0;

  let status;
  let applicabilityStatus;
  let kind;
  let effect;
  let eligible;
  let summary;
  if (!applicable) {
    status = 'not-applicable';
    applicabilityStatus = 'not-applicable';
    kind = 'not-applicable';
    effect = 'not-applicable';
    eligible = false;
    summary = continuousSession
      ? `${symbol} is continuously traded and remains non-comparable under XNYS session evidence for ${declaration.toolId}.`
      : `${symbol || 'this run'} is outside ${declaration.toolId}'s declared XNYS session evidence, so the shared evidence is not applicable.`;
  } else if (declaration.consumesReport) {
    status = 'fresh';
    applicabilityStatus = 'applicable';
    kind = 'supporting';
    effect = 'permits-owner-action';
    eligible = true;
    summary = declaration.summary;
  } else {
    status = 'fresh';
    applicabilityStatus = 'applicable';
    kind = 'context';
    effect = 'context-only';
    eligible = false;
    summary = declaration.summary;
  }

  const interpretation = {
    kind,
    ownerAdapterId: declaration.adapterId,
    ownerModelVersion: declaration.owningModelVersion,
    evidenceRefs: applicable ? fingerprints.slice() : [evidence.fingerprint],
    actionEligibilityEffect: effect,
    summary
  };

  return {
    contractVersion: 'tool-model-read/v1',
    toolId: declaration.toolId,
    role: 'source',
    profile: declaration.profile,
    adapter: { adapterId: declaration.adapterId, readContractVersion: 'tool-model-read/v1', owningModelVersion: declaration.owningModelVersion },
    status,
    evidenceCutoff: evidence.cutoffAt,
    marketSessionEvidenceRef: applicable ? { evidenceType: 'market-session-evidence', fingerprint: evidence.fingerprint } : null,
    evidenceRefs,
    evidenceApplicability: { status: applicabilityStatus, reason: summary },
    evidenceInterpretations: [interpretation],
    recommendationEligibility: {
      eligible,
      reasonCode: eligible ? 'owner-supported-by-shared-evidence' : (applicable ? 'context-only' : 'not-applicable'),
      permittedActionFamilies: eligible ? ['duration-positioning'] : [],
      permittedSubjectBoundary: declaration.toolId
    },
    deepLink: declaration.deepLink,
    fingerprint: ownerEvidenceFingerprint(`${declaration.toolId}|${declaration.owningModelVersion}|${evidence.fingerprint}|${status}`)
  };
}

/* A frozen source OUTSIDE the initial owner-consumer set: an explicit typed applicability
   result (never silent omission). A live-market source with no declared read adapter is
   not-integrated; a static/local/off-theme profile is not-applicable. No interpretation and
   no action eligibility are ever produced for a non-owner source. */
export function buildNonOwnerApplicabilityRead(source, evidence) {
  const profile = source.profile || 'off-theme';
  const applicabilityStatus = profile === 'live-market' ? 'not-integrated' : 'not-applicable';
  const reason = applicabilityStatus === 'not-integrated'
    ? `${source.toolId} has no declared MarketSessionEvidence read adapter yet; its normal briefing outcome remains mandatory.`
    : `${source.toolId} is a ${profile} source and cannot consume XNYS market-session evidence; its normal briefing outcome remains mandatory.`;
  return {
    contractVersion: 'tool-model-read/v1',
    toolId: source.toolId,
    role: 'source',
    profile,
    adapter: { adapterId: `${source.toolId}-read-v1`, readContractVersion: 'tool-model-read/v1', owningModelVersion: `${source.toolId}/v1` },
    status: 'not-applicable',
    evidenceCutoff: evidence.cutoffAt,
    marketSessionEvidenceRef: null,
    evidenceRefs: [],
    evidenceApplicability: { status: applicabilityStatus, reason },
    evidenceInterpretations: [],
    recommendationEligibility: { eligible: false, reasonCode: applicabilityStatus, permittedActionFamilies: [], permittedSubjectBoundary: source.toolId },
    deepLink: `${source.toolId}.html`,
    fingerprint: ownerEvidenceFingerprint(`${source.toolId}|${applicabilityStatus}|${evidence.fingerprint}`)
  };
}

/* Freeze one ToolModelRead/v1 outcome for every declared owner over the frozen evidence bundle,
   plus an explicit applicability outcome for every supplied non-owner source. Scope 04 wires the
   six initial owners; Scope 05 extends this to the full frozen registry.

   POLYMORPHIC BY FIRST-ARGUMENT CONTRACT (additive; the shipped Scope 04 signature/behaviour is
   unchanged): when the first argument is a MarketSessionEvidence/v1 bundle this is the legacy
   Scope 04 form `freezeToolReads(evidence, runContext, otherSources) -> { owners, others }`; when
   the first argument is a FrozenBriefingRegistry/v1 or a raw registry (tools[] / orderedSourceToolIds[])
   this is the Scope 05 registry form `freezeToolReads(registry, adapters, runContext)` delegating to
   freezeRegistryToolReads. */
export function freezeToolReads(evidence, runContext, otherSources) {
  if (evidence && typeof evidence === 'object' &&
    (evidence.contractVersion === 'frozen-briefing-registry/v1' ||
      Array.isArray(evidence.tools) || Array.isArray(evidence.orderedSourceToolIds))) {
    return freezeRegistryToolReads(evidence, runContext, otherSources);
  }
  const owners = {};
  for (const declaration of OWNER_EVIDENCE_DECLARATIONS) {
    owners[declaration.toolId] = buildOwnerEvidenceRead(declaration, evidence, runContext);
  }
  const others = {};
  for (const source of (otherSources || [])) {
    const normalized = typeof source === 'string' ? { toolId: source } : source;
    others[normalized.toolId] = buildNonOwnerApplicabilityRead(normalized, evidence);
  }
  return { owners, others };
}

/* Registry form (Scope 05): freeze the complete runtime-discovered registry and emit exactly one
   ToolModelRead/v1 outcome for every DERIVED source ID in registry order. `registry` is a raw
   tools.json object (validated here through RLCONTRACTS.validateRegistry) or an already-frozen
   FrozenBriefingRegistry/v1. `adapters` carries the run's frozen evidence bundle plus optional
   per-tool owner reads and validateRegistry config:
     { evidence, ownerReads?, ownerDeclarations?, registryConfig? }
   Each source resolves through, in order: a caller-supplied owner read (e.g. the committed
   company-fundamentals owner read), the Scope 04 owning-model builders, otherwise an explicit typed
   applicability outcome (never a silent omission and never an inferred metric). The final aggregator
   (market-brief) is excluded from orderedSourceToolIds and is therefore never self-consumed. No owner
   formula is recomputed here; owner reads are delegated to their owning functions. Incomplete registry
   metadata fails loud before any read is built. */
export function freezeRegistryToolReads(registry, adapters, runContext) {
  const config = (adapters && typeof adapters === 'object') ? adapters : {};
  const evidence = config.evidence || null;
  const ownerReads = config.ownerReads || {};
  const declarations = config.ownerDeclarations || OWNER_EVIDENCE_DECLARATIONS;

  let frozen;
  if (registry && registry.contractVersion === 'frozen-briefing-registry/v1') {
    frozen = registry;
  } else {
    const validated = RLCONTRACTS.validateRegistry(registry, config.registryConfig || null);
    if (!validated.ok) {
      const error = new Error('registry-invalid:' + validated.error.reason);
      error.reason = validated.error.reason;
      error.field = validated.error.field;
      throw error;
    }
    frozen = validated.value;
  }

  const declarationById = {};
  for (const declaration of declarations) declarationById[declaration.toolId] = declaration;

  const reads = {};
  for (const toolId of frozen.orderedSourceToolIds) {
    if (Object.prototype.hasOwnProperty.call(ownerReads, toolId)) {
      reads[toolId] = ownerReads[toolId];
      continue;
    }
    const declaration = declarationById[toolId];
    if (declaration) {
      reads[toolId] = buildOwnerEvidenceRead(declaration, evidence, runContext);
      continue;
    }
    const profile = frozen.entries[toolId] ? frozen.entries[toolId].profile : 'off-theme';
    reads[toolId] = buildNonOwnerApplicabilityRead({ toolId, profile }, evidence);
  }

  return {
    registry: frozen,
    reads,
    orderedSourceToolIds: frozen.orderedSourceToolIds.slice(),
    aggregatorToolId: frozen.aggregatorToolId,
    participantCount: frozen.participantCount,
    sourceCount: frozen.sourceCount
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Feature 002 Scope 06 — Bounded Authorship reuse + shared author pool.

   These are the brief-refresh orchestration HOOKS declared by the design module map
   (`resolveBriefReuse`, the four-worker author pool). Owner-model formulas are never
   copied here and no source is reacquired: the pool consumes ONLY the frozen reads and
   delegates every pure decision to rlcontracts.js (compaction, brief validation) and every
   external call to the powerless brief-author.mjs boundary.
   ───────────────────────────────────────────────────────────────────────────── */

/* resolveBriefReuse(read, policy, currentIndex): decide whether a source read reuses one prior validated
   brief by EXACT input-fingerprint match. The input fingerprint binds the read identity — which for a
   live-market owner read already encodes its evidence semantic fingerprints and freshness/status — to the
   prompt/schema/model/validator policy identity. A live-market brief therefore can never carry forward
   across a changed evidence semantic fingerprint or freshness result, because the read fingerprint (and
   thus the input fingerprint) changes. On a match it points to the ONE prior validated content object and
   records the current occurrence; it never rewrites the prior authored time or narrative, and no author
   call occurs. */
export function resolveBriefReuse(read, policy, currentIndex) {
  if (!read || typeof read !== 'object' || typeof read.toolId !== 'string' || typeof read.fingerprint !== 'string') {
    throw new Error('resolveBriefReuse requires a read with toolId and fingerprint');
  }
  if (!policy || typeof policy !== 'object') throw new Error('resolveBriefReuse requires an author/validation policy');
  for (const key of ['promptPolicyVersion', 'schemaVersion', 'modelId', 'validatorVersion']) {
    if (typeof policy[key] !== 'string' || !policy[key]) throw new Error(`resolveBriefReuse policy.${key} is required`);
  }
  const inputFingerprint = RLCONTRACTS.fingerprint('tool-brief-input', {
    contractVersion: 'tool-brief-input/v1',
    readFingerprint: read.fingerprint,
    profile: read.profile || null,
    status: read.status || null,
    promptPolicyVersion: policy.promptPolicyVersion,
    schemaVersion: policy.schemaVersion,
    modelId: policy.modelId,
    validatorVersion: policy.validatorVersion
  });
  const prior = currentIndex && typeof currentIndex === 'object' ? currentIndex[read.toolId] : null;
  if (prior && prior.inputFingerprint === inputFingerprint && prior.briefRef) {
    return {
      reuse: true,
      toolId: read.toolId,
      inputFingerprint,
      briefRef: prior.briefRef,
      contentFingerprint: prior.contentFingerprint || null,
      occurrence: { runId: policy.runId || null, occurredAt: policy.occurredAt || null }
    };
  }
  return { reuse: false, toolId: read.toolId, inputFingerprint };
}

/* runToolAuthorPool(config): author the CHANGED source briefs through one shared four-worker pool. Each
   changed read is compacted ONCE (rlcontracts.compactAuthorInput) into a frozen request; the initial
   attempt may receive at most `maxRetries` retries against that IDENTICAL frozen input. At most `workers`
   author calls run concurrently. Before EVERY attempt the run-level reservation accounting is advanced and
   the run ceiling (attempts, input tokens, output tokens) is proven to still have capacity; a breach
   refuses the whole run (B002-BUDGET) rather than omitting a tool, and no accepted partial set is exposed.
   Every returned envelope passes the powerless brief-author boundary gate and then the pure ToolBrief
   validator. Telemetry is sanitized (call/retry/concurrency counts, reservation totals, per-tool codes) —
   no prompt text, rejected narrative, secret, or private field. No source is reacquired after freeze. */
export async function runToolAuthorPool(config) {
  if (!config || typeof config !== 'object') throw new Error('runToolAuthorPool requires a config');
  const reads = Array.isArray(config.reads) ? config.reads : null;
  if (!reads) throw new Error('runToolAuthorPool requires config.reads[]');
  const identity = config.identity;
  if (!identity || typeof identity !== 'object') throw new Error('runToolAuthorPool requires config.identity');
  const runBudget = config.runBudget;
  if (!runBudget || !Number.isInteger(runBudget.maxInputTokens) || !Number.isInteger(runBudget.maxOutputTokens) || !Number.isInteger(runBudget.maxAttempts)) {
    throw new Error('runToolAuthorPool requires config.runBudget {maxInputTokens,maxOutputTokens,maxAttempts}');
  }
  const workers = Number.isInteger(config.workers) ? config.workers : 4;
  const maxRetries = Number.isInteger(config.maxRetries) ? config.maxRetries : 2;
  const seenResponses = config.seenResponses instanceof Set ? config.seenResponses : new Set();
  const invokeOptions = config.invokeOptions || {};
  const authorFn = typeof config.authorFn === 'function'
    ? config.authorFn
    : (request) => invokeAuthor(request, invokeOptions);

  const run = { reservedInputTokens: 0, reservedOutputTokens: 0, attempts: 0 };
  const telemetry = { calls: 0, retries: 0, reuseCount: 0, peakConcurrency: 0, activeConcurrency: 0, byTool: {}, reservedInputTokens: 0, reservedOutputTokens: 0 };
  const outcomes = {};
  let refusal = null;

  const tasks = [];
  for (const entry of reads) {
    if (!entry || typeof entry.toolId !== 'string' || !entry.read || !entry.profileBudget) {
      return { ok: false, outcomes: {}, telemetry, refusal: { code: 'B002-TOOL-AUTHOR', reason: 'invalid-changed-read', toolId: entry && entry.toolId } };
    }
    const compacted = RLCONTRACTS.compactAuthorInput(entry.read, entry.profileBudget);
    if (!compacted.ok) {
      return { ok: false, outcomes: {}, telemetry, refusal: { code: compacted.error.code, reason: compacted.error.reason, toolId: entry.toolId } };
    }
    const built = buildToolAuthorRequest(compacted.value, identity);
    if (!built.ok) {
      return { ok: false, outcomes: {}, telemetry, refusal: { code: built.error.code, reason: built.error.reason, toolId: entry.toolId } };
    }
    tasks.push({ toolId: entry.toolId, profile: entry.profile, read: entry.read, compacted: compacted.value, request: built.request });
    telemetry.byTool[entry.toolId] = { attempts: 0, reservedInputTokens: compacted.value.reservedInputTokens, reservedOutputTokens: compacted.value.maxOutputTokens, code: null };
  }

  let queueIndex = 0;
  async function worker() {
    for (;;) {
      if (refusal) return;
      if (queueIndex >= tasks.length) return;
      const task = tasks[queueIndex];
      queueIndex += 1;
      let attempt = 0;
      let lastError = null;
      while (attempt <= maxRetries) {
        if (refusal) return;
        run.attempts += 1;
        run.reservedInputTokens += task.compacted.reservedInputTokens;
        run.reservedOutputTokens += task.compacted.maxOutputTokens;
        telemetry.reservedInputTokens = run.reservedInputTokens;
        telemetry.reservedOutputTokens = run.reservedOutputTokens;
        telemetry.byTool[task.toolId].attempts += 1;
        if (run.attempts > runBudget.maxAttempts || run.reservedInputTokens > runBudget.maxInputTokens || run.reservedOutputTokens > runBudget.maxOutputTokens) {
          refusal = { code: 'B002-BUDGET', reason: 'run-ceiling-exceeded', toolId: task.toolId };
          return;
        }
        if (attempt > 0) telemetry.retries += 1;
        telemetry.calls += 1;
        telemetry.activeConcurrency += 1;
        if (telemetry.activeConcurrency > telemetry.peakConcurrency) telemetry.peakConcurrency = telemetry.activeConcurrency;
        let invokeResult;
        try {
          invokeResult = await authorFn(task.request, { toolId: task.toolId, attempt });
        } catch (error) {
          invokeResult = { ok: false, error: { code: AUTHOR_ERRORS.PROCESS, reason: 'author-threw' } };
        }
        telemetry.activeConcurrency -= 1;
        if (invokeResult && invokeResult.ok) {
          const envelopeCheck = validateAuthorEnvelope(invokeResult.envelope, task.request, { seen: seenResponses, maxStdoutBytes: invokeOptions.maxStdoutBytes });
          if (envelopeCheck.ok) {
            const briefCheck = RLCONTRACTS.validateToolBrief(envelopeCheck.brief, task.read, task.profile);
            if (briefCheck.ok) {
              outcomes[task.toolId] = { toolId: task.toolId, outcome: 'newly-authored', brief: briefCheck.value, attempts: attempt + 1, reservedInputTokens: task.compacted.reservedInputTokens };
              telemetry.byTool[task.toolId].code = 'validated';
              break;
            }
            lastError = { code: 'B002-TOOL-AUTHOR', reason: briefCheck.error.reason };
          } else {
            lastError = { code: envelopeCheck.error.code, reason: envelopeCheck.error.reason };
          }
        } else {
          lastError = invokeResult && invokeResult.error ? { code: invokeResult.error.code, reason: invokeResult.error.reason } : { code: AUTHOR_ERRORS.PROCESS, reason: 'author-failed' };
        }
        telemetry.byTool[task.toolId].code = lastError.code;
        attempt += 1;
      }
      if (!outcomes[task.toolId] && !refusal) {
        refusal = { code: 'B002-TOOL-AUTHOR', reason: (lastError && lastError.reason) || 'author-exhausted', toolId: task.toolId };
        return;
      }
    }
  }

  const runners = [];
  for (let w = 0; w < workers; w += 1) runners.push(worker());
  await Promise.all(runners);

  if (refusal) return { ok: false, outcomes: {}, telemetry, refusal };
  return { ok: true, outcomes, telemetry };
}

function dailySnapshotRows(sym, requestedRange) {
  if (!/^[A-Za-z0-9.^=_-]+$/.test(sym || '')) return null;
  try {
    const snapshot = JSON.parse(read(`data/bars/${sym}.json`));
    const fetchedAt = Date.parse(snapshot.fetched || '');
    if (!Number.isFinite(fetchedAt) || Date.now() - fetchedAt > SNAPSHOT_MAX_AGE_MS) return null;
    const rows = Array.isArray(snapshot.rows) ? snapshot.rows : [];
    if (!rows.length) return null;
    if (requestedRange === '2y' && snapshot.range !== '2y' && rows.length < 300) return null;
    return rows;
  } catch { return null; }
}

/* Fallback VIX spot from the same-origin CBOE options cache (data/options/VIX.json).
   The live Yahoo ^VIX chart call is frequently rate-limited/blocked from headless/CI IPs
   and yahooRows() swallows the error to null; ^VIX is NOT in the data/bars cache, so without
   this fallback the whole regime silently collapses to score 0 / Unknown. The options
   pipeline already writes a reliable VIX spot via CBOE, so reuse it (cache-first, no refetch).
   Returns { level, asof } or null. */
function cachedVixSpot() {
  try {
    const snap = JSON.parse(read('data/options/VIX.json'));
    const level = Number(snap.spot);
    if (!Number.isFinite(level) || level <= 0) return null;
    const fetchedAt = Date.parse(snap.fetched || snap.asof || '');
    if (!Number.isFinite(fetchedAt) || Date.now() - fetchedAt > SNAPSHOT_MAX_AGE_MS) return null;
    return { level: round(level, 2), asof: snap.asof || snap.fetched || null };
  } catch { return null; }
}

function dataSnapshotFreshness() {
  function indexOf(kind) {
    try {
      const index = JSON.parse(read(`data/${kind}/index.json`));
      return { updated: index.updated || null, count: Number.isFinite(index.count) ? index.count : null };
    } catch { return { updated: null, count: null }; }
  }
  return { bars: indexOf('bars'), options: indexOf('options') };
}

/* Load pure helpers directly from an owning tool. This is the same balanced-brace
   extraction contract used by scripts/selftest.mjs, so Tier A reuses the tool's
   math instead of maintaining a second copy in the brief. */
function extractToolFunction(source, name) {
  const match = new RegExp('function\\s+' + name + '\\s*\\(').exec(source);
  if (!match) throw new Error(`tool helper not found: ${name}`);
  let index = source.indexOf('{', match.index), depth = 0;
  if (index < 0) throw new Error(`tool helper has no body: ${name}`);
  const start = match.index;
  for (; index < source.length; index++) {
    if (source[index] === '{') depth++;
    else if (source[index] === '}') { depth--; if (depth === 0) return source.slice(start, index + 1); }
  }
  throw new Error(`tool helper has unbalanced body: ${name}`);
}
function loadToolFunctions(file, names, preamble = '') {
  const source = read(file);
  const body = `${preamble}\n${names.map((name) => extractToolFunction(source, name)).join('\n')}\nreturn {${names.join(',')}};`;
  return Function(body)();
}

/* ── window: --window flag, else derive from ET clock ── */
function argWindow() {
  const i = process.argv.indexOf('--window');
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  let m;
  try { const s = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false }); const p = s.split(':'); m = (+p[0]) * 60 + (+p[1]); } catch { m = 12 * 60; }
  if (m >= 17 * 60) return 'after-hours';
  if (m >= 15 * 60) return 'pre-close';
  if (m >= 11 * 60) return 'morning';
  return 'pre-market';
}
function nextSessionDate(window) {
  let local;
  try { local = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })); } catch { local = new Date(); }
  const day = local.getDay();
  if (day === 6) local.setDate(local.getDate() + 2);
  else if (day === 0) local.setDate(local.getDate() + 1);
  else if (window === 'after-hours') local.setDate(local.getDate() + (day === 5 ? 3 : 1));
  const year = local.getFullYear(), month = String(local.getMonth() + 1).padStart(2, '0'), date = String(local.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

/* ── pure signal helpers (mirror rlbrief.js / rldata.js) ── */
const momentumPct = (rows, lb) => (rows && rows.length > lb && rows[rows.length - 1].c && rows[rows.length - 1 - lb].c) ? (rows[rows.length - 1].c / rows[rows.length - 1 - lb].c - 1) * 100 : null;
const round = (x, d = 2) => (Number.isFinite(x) ? +x.toFixed(d) : null);
/* ── structural helpers (§6c larger-picture frame) ── */
function sma(rows, n) { if (!rows || rows.length < n || n <= 0) return null; let s = 0; for (let i = rows.length - n; i < rows.length; i++) s += rows[i].c; return s / n; }
function maDistPct(rows, n) { const m = sma(rows, n), c = rows && rows.length ? rows[rows.length - 1].c : null; return (Number.isFinite(m) && Number.isFinite(c) && m) ? round((c / m - 1) * 100, 2) : null; }
function maStack(rows) { const a = sma(rows, 20), b = sma(rows, 50), c = sma(rows, 200); if (![a, b, c].every(Number.isFinite)) return 'n/a'; if (a > b && b > c) return 'bull-stack'; if (a < b && b < c) return 'bear-stack'; return 'tangled'; }
function pctFrom52wHigh(rows) { if (!rows || !rows.length) return null; const w = rows.slice(-252); let hi = -Infinity; for (const r of w) if (r.c > hi) hi = r.c; const c = rows[rows.length - 1].c; return (Number.isFinite(hi) && hi) ? round((c / hi - 1) * 100, 2) : null; }
/* the structural block for a series: long-horizon momentum + MA structure + 52w-range position */
function structural(rows) { return { mom126: round(momentumPct(rows, 126)), mom252: round(momentumPct(rows, 252)), ma50Dist: maDistPct(rows, 50), ma200Dist: maDistPct(rows, 200), maStack: maStack(rows), pctFrom52wHigh: pctFrom52wHigh(rows) }; }
function macroRegime(fg, vix) {
  const s = fg && Number.isFinite(fg.score) ? fg.score : null;
  if (s == null && vix == null) return { risk: 0, band: 'Unknown' };
  if (s == null) return { risk: vix >= 26 ? -1 : vix <= 15 ? 1 : 0, band: `VIX ${vix.toFixed(1)}` };
  let band, risk;
  if (s >= 76) { band = 'Extreme greed'; risk = 1; }
  else if (s >= 56) { band = 'Greed / risk-on'; risk = 1; }
  else if (s > 44) { band = 'Neutral'; risk = 0; }
  else if (s > 24) { band = 'Fear / risk-off'; risk = -1; }
  else { band = 'Extreme fear'; risk = -1; }
  if (vix != null && vix >= 30 && risk >= 0) risk = 0;
  return { risk, band };
}
/* ── tool-aligned RRG (mirrors sector-research-lab.html computeEntry EXACTLY) ──
   The brief's sector-rotation recs MUST match the rotation tool's verdict. The tool does
   NOT rank by raw 1-month RS *level*; it computes an RS-Ratio / RS-Momentum RRG from
   rolling z-scores and a 2-week momentum *acceleration*, then labels each entry
   Leading / Weakening ↓ / Lagging / Improving ↑ plus the early-turn sub-states
   Basing ↑ (lagging but accelerating) and Peaking ⚠ (leading but rolling over), and
   splits a mechanical Rotate-INTO / Rotate-OUT read. We replicate that here so every
   snapshot hands the author the SAME numbers the tool renders — closing the metric-lens
   gap by construction. Keep these defaults in lockstep with the tool
   (state.rsLook=63, state.momSpan=10, accel span=10). See notes/market-brief.md §6b. */
const RS_LOOK = 63, MOM_SPAN = 10, ACCEL_SPAN = 10;
const _mean = (a) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; };
const _stdev = (a) => { if (a.length < 2) return 0; const m = _mean(a); let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - m; s += d * d; } return Math.sqrt(s / (a.length - 1)); };
const _dstr = (ms) => new Date(ms).toISOString().slice(0, 10);
/* rolling z-score re-centered at 100 over a trailing L-window (tool's rollZ100) */
function rollZ100(a, L) {
  const out = new Array(a.length), minN = Math.max(8, Math.floor(L * 0.5));
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i])) { out[i] = NaN; continue; }
    const vals = []; for (let j = i; j >= 0 && vals.length < L; j--) { if (Number.isFinite(a[j])) vals.push(a[j]); }
    if (vals.length < minN) { out[i] = NaN; continue; }
    const m = _mean(vals), sd = _stdev(vals); out[i] = sd ? 100 + (a[i] - m) / sd : 100;
  }
  return out;
}
/* intersect a name series with the benchmark by day-string → aligned adj-close arrays */
function alignRs(rows, benchRows) {
  const mb = {}; for (const r of benchRows) mb[_dstr(r.t)] = r.c;
  const a = [], b = [];
  for (const r of rows) { const bc = mb[_dstr(r.t)]; if (bc != null) { a.push(r.c); b.push(bc); } }
  return { a, b };
}
/* tool stateLabel(quad, accel): the 6-state label incl. early-turn Basing/Peaking */
function rrgLabel(quad, accel) {
  if (quad === 'L') return accel < -0.15 ? 'Peaking ⚠' : 'Leading';
  if (quad === 'W') return 'Weakening ↓';
  if (quad === 'A') return accel > 0.15 ? 'Basing ↑' : 'Lagging';
  if (quad === 'I') return 'Improving ↑';
  return 'n/a';
}
/* tool rotationSuggestions() rule: INTO (accumulate) / OUT (distribute) / neutral */
function rotationTag(quad, accel, label) {
  if (quad === 'I' || label === 'Basing ↑' || (quad === 'L' && accel > 0.2)) return 'into';
  if (label === 'Peaking ⚠' || quad === 'W') return 'out';
  return 'neutral';
}
const RRG_NULL = { rsRatio: null, rsMom: null, quad: null, accel: null, rrgState: 'n/a', rotation: 'neutral' };
function rrgFull(rows, benchRows) {
  if (!rows || !benchRows) return RRG_NULL;
  const al = alignRs(rows, benchRows);
  if (al.a.length < 30) return RRG_NULL;
  const rs = al.a.map((v, i) => (al.b[i] ? v / al.b[i] : NaN));
  const rsRatioArr = rollZ100(rs, RS_LOOK);
  const rom = rsRatioArr.map((v, i) => (i >= MOM_SPAN && Number.isFinite(v) && Number.isFinite(rsRatioArr[i - MOM_SPAN])) ? v - rsRatioArr[i - MOM_SPAN] : NaN);
  const rsMomArr = rollZ100(rom, RS_LOOK);
  let last = -1; for (let i = rsRatioArr.length - 1; i >= 0; i--) { if (Number.isFinite(rsRatioArr[i]) && Number.isFinite(rsMomArr[i])) { last = i; break; } }
  if (last < 0) return RRG_NULL;
  const rsRatio = rsRatioArr[last], rsMom = rsMomArr[last];
  const quad = rsRatio >= 100 ? (rsMom >= 100 ? 'L' : 'W') : (rsMom >= 100 ? 'I' : 'A');
  const j = last - ACCEL_SPAN;
  const accel = (j >= 0 && Number.isFinite(rsMomArr[j]) && Number.isFinite(rsMomArr[last])) ? rsMomArr[last] - rsMomArr[j] : 0;
  const label = rrgLabel(quad, accel);
  return { rsRatio: round(rsRatio, 2), rsMom: round(rsMom, 2), quad, accel: round(accel, 2), rrgState: label, rotation: rotationTag(quad, accel, label) };
}

/* ── fetchers (direct — Node has no CORS) ── */
async function yahooRows(sym, range = '2y', interval = '1d') {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${range}&interval=${interval}&includeAdjustedClose=true`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) throw new Error('http ' + r.status);
    const j = await r.json();
    const res = j.chart.result[0], t = res.timestamp || [], q = res.indicators.quote[0];
    const adj = res.indicators.adjclose?.[0]?.adjclose;
    const rows = [];
    for (let i = 0; i < t.length; i++) { const c = adj ? adj[i] : q.close[i]; if (c == null) continue; rows.push({ t: t[i] * 1000, c }); }
    return rows;
  } catch (e) { return null; }
}
/* memoized fetch — group members overlap the watchlist + sector ETFs (e.g. MSFT, NVDA),
   so dedupe by symbol+range+interval to stay within Yahoo's rate limit. */
const _rowsMemo = new Map();
async function yahooRowsMemo(sym, range = '2y', interval = '1d') {
  const key = sym + '|' + range + '|' + interval;
  if (_rowsMemo.has(key)) return _rowsMemo.get(key);
  const rowsPromise = (async () => interval === '1d'
    ? (dailySnapshotRows(sym, range) || await yahooRows(sym, range, interval))
    : await yahooRows(sym, range, interval))();
  _rowsMemo.set(key, rowsPromise);
  return rowsPromise;
}
async function fearGreed() {
  try {
    const r = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) throw new Error('http ' + r.status);
    const j = await r.json();
    return { score: Math.round(j.fear_and_greed.score), band: j.fear_and_greed.rating };
  } catch (e) { return null; }
}

function latestIso(rows) { return rows && rows.length && Number.isFinite(rows[rows.length - 1].t) ? new Date(rows[rows.length - 1].t).toISOString() : null; }
function realizedVolDecimal(rows, lookback = 63) {
  if (!rows || rows.length < 3) return null;
  const returns = [];
  for (let i = Math.max(1, rows.length - lookback); i < rows.length; i++) if (rows[i - 1].c > 0 && rows[i].c > 0) returns.push(rows[i].c / rows[i - 1].c - 1);
  return returns.length > 1 ? _stdev(returns) * Math.sqrt(252) : null;
}
function calendarReturnDecimal(rows, days) {
  if (!rows || !rows.length) return null;
  const target = rows[rows.length - 1].t - days * 864e5;
  let base = null;
  for (const row of rows) { if (row.t <= target) base = row.c; else break; }
  const last = rows[rows.length - 1].c;
  return Number.isFinite(base) && base > 0 && Number.isFinite(last) ? last / base - 1 : null;
}
function oneYearWindowMetrics(rows, riskFree) {
  if (!rows || rows.length < 3) return { annVol: null, cagr: null, sharpe: null };
  const cutoff = rows[rows.length - 1].t - 365 * 864e5, windowRows = rows.filter((row) => row.t >= cutoff);
  if (windowRows.length < 3) return { annVol: null, cagr: null, sharpe: null };
  const annVol = realizedVolDecimal(windowRows, windowRows.length - 1);
  const years = (windowRows[windowRows.length - 1].t - windowRows[0].t) / (365.25 * 864e5);
  const first = windowRows[0].c, last = windowRows[windowRows.length - 1].c;
  const cagr = years > 0 && first > 0 ? Math.pow(last / first, 1 / years) - 1 : null;
  return { annVol, cagr, sharpe: Number.isFinite(cagr) && Number.isFinite(annVol) && annVol > 0 ? (cagr - riskFree) / annVol : null };
}

export async function buildEtfToolRead() {
  try {
    const universe = JSON.parse(read('etf-universe.json'));
    const model = loadToolFunctions('etf-momentum-lab.html', ['etfSimpleSignal', 'etfSimpleScore']);
    const rows = [];
    for (const fund of (universe.etfs || []).filter((entry) => entry.on)) {
      const bars = await yahooRowsMemo(fund.ticker); if (!bars || bars.length < 127) continue;
      const trailing = { '3M': calendarReturnDecimal(bars, 91), '6M': calendarReturnDecimal(bars, 182), '1Y': calendarReturnDecimal(bars, 365) };
      const windowMetrics = oneYearWindowMetrics(bars, universe.riskFree || 0), annVol = windowMetrics.annVol;
      const metrics = { trailing, annVol, sharpe: windowMetrics.sharpe };
      const signal = model.etfSimpleSignal(metrics, '6M'), score = model.etfSimpleScore(metrics, '6M', 'balanced');
      if (Number.isFinite(score)) rows.push({ ticker: fund.ticker, signal: round(signal * 100), score: round(score, 4), annVol: round(annVol * 100), asOf: latestIso(bars) });
    }
    rows.sort((a, b) => b.score - a.score);
    const leader = rows[0];
    return { id: 'etf-momentum-lab', asOf: leader?.asOf || new Date().toISOString(), read: leader ? `${leader.ticker} leads the default 6M balanced ETF ranking at ${leader.signal}% momentum; ${rows.length} funds scored.` : 'ETF momentum read unavailable.', metrics: { leader: leader?.ticker || null, signal: leader?.signal ?? null, ranked: rows.slice(0, 5), scored: rows.length, horizon: '6M', risk: 'balanced' }, deepLink: 'etf-momentum-lab.html', source: 'owning-tool-functions' };
  } catch (error) { return { id: 'etf-momentum-lab', asOf: new Date().toISOString(), read: 'ETF momentum model unavailable this run.', metrics: { error: error.message }, deepLink: 'etf-momentum-lab.html', source: 'owning-tool-functions' }; }
}

export function buildSectorToolRead(sectors) {
  const values = Object.entries(sectors || {}).map(([ticker, value]) => ({ ticker, ...value }));
  const into = values.filter((value) => value.rotation === 'into').sort((a, b) => (b.accel ?? -99) - (a.accel ?? -99));
  const out = values.filter((value) => value.rotation === 'out').sort((a, b) => (a.accel ?? 99) - (b.accel ?? 99));
  const leader = values.slice().sort((a, b) => (b.rsMom3m ?? -99) - (a.rsMom3m ?? -99))[0];
  const read = into[0] && out[0] ? `Rotate toward ${into[0].ticker} as ${out[0].ticker} weakens.` : into[0] ? `${into[0].ticker} is the clearest improving sector rotation.` : out[0] ? `${out[0].ticker} is weakening; no replacement is confirmed.` : leader ? `${leader.ticker} leads but no new rotation is confirmed.` : 'Sector rotation read unavailable.';
  return { id: 'sector-research-lab', asOf: new Date().toISOString(), read, metrics: { into: into[0] || null, out: out[0] || null, leader: leader || null, count: values.length, benchmark: 'SPY' }, deepLink: 'sector-research-lab.html', source: 'tier-a-tool-aligned-rrg' };
}

export async function buildGlobalToolRead() {
  try {
    const universe = JSON.parse(read('global-rotation-universe.json'));
    const names = ['globalTrailingPct', 'globalAnnualVol', 'globalMaxDrawdown', 'globalTrendState', 'globalFxConfirm', 'globalCountryScore', 'globalMomentumScore', 'globalRiskQuality'];
    const model = loadToolFunctions('global-rotation-lab.html', names);
    const benchmark = universe.defaultBenchmark || 'ACWI', benchmarkRows = await yahooRowsMemo(benchmark);
    const rows = [];
    for (const entry of (universe.entries || []).filter((item) => item.kind === 'country')) {
      const bars = await yahooRowsMemo(entry.ticker), fxBars = await yahooRowsMemo(entry.currencyProxy);
      if (!bars || !benchmarkRows) continue;
      const relative = (lookback) => { const own = model.globalTrailingPct(bars, lookback), control = model.globalTrailingPct(benchmarkRows, lookback); return Number.isFinite(own) && Number.isFinite(control) ? own - control : null; };
      const rel21 = relative(21), rel63 = relative(63), rel126 = relative(126), trend = model.globalTrendState(bars, 'balanced');
      const vol = model.globalAnnualVol(bars, 63), drawdown = model.globalMaxDrawdown(bars, 252), fx = model.globalFxConfirm(fxBars, 63, !!entry.fxInverse, rel63);
      const momentum = model.globalMomentumScore(rel21, rel63, rel126, 63), risk = model.globalRiskQuality(vol, drawdown);
      const scored = model.globalCountryScore({ momentum, trend: trend?.score, risk, fx: fx?.score }, { fxWeight: 0.14, posture: 'balanced' });
      if (scored && Number.isFinite(scored.score)) rows.push({ ticker: entry.ticker, country: entry.country, score: round(scored.score, 1), rel21: round(rel21), rel63: round(rel63), rel126: round(rel126), trend: trend?.label || null, fx: fx?.label || null, fxStrength: round(fx?.strengthPct), vol: round(Number.isFinite(vol) ? vol * 100 : null), maxDrawdown: round(Number.isFinite(drawdown) ? drawdown * 100 : null), asOf: latestIso(bars) });
    }
    rows.sort((a, b) => b.score - a.score); const leader = rows[0], runner = rows[1];
    return { id: 'global-rotation-lab', asOf: leader?.asOf || new Date().toISOString(), read: leader ? `${leader.ticker} (${leader.country}) leads global rotation at ${leader.score}/100 versus ${benchmark}${runner ? `; ${runner.ticker} is next` : ''}.` : 'Global rotation read unavailable.', metrics: { benchmark, leader: leader || null, ranked: rows.slice(0, 6), scored: rows.length }, deepLink: 'global-rotation-lab.html', source: 'owning-tool-functions' };
  } catch (error) { return { id: 'global-rotation-lab', asOf: new Date().toISOString(), read: 'Global rotation model unavailable this run.', metrics: { error: error.message }, deepLink: 'global-rotation-lab.html', source: 'owning-tool-functions' }; }
}

export async function buildRealAssetsToolRead() {
  try {
    const universe = JSON.parse(read('real-assets-universe.json'));
    const names = ['realClamp', 'realTrailingPct', 'realAnnualVol', 'realMaxDrawdown', 'realSma', 'realTrendState', 'realSignalFromPct', 'realConfirmScore', 'realRiskPenalty', 'goldModelScore', 'bitcoinModelScore', 'silverModelScore', 'cryptoModelScore', 'commodityModelScore', 'realRatioTrailingPct'];
    const model = loadToolFunctions('real-assets-lab.html', names), bars = {};
    for (const entry of (universe.entries || [])) bars[entry.symbol] = await yahooRowsMemo(entry.symbol);
    const ret63 = (symbol) => model.realTrailingPct(bars[symbol], 63);
    const commodityFamilies = new Set(['silver', 'energy', 'broad', 'industrial', 'agriculture', 'platinum']);
    const breadthValues = (universe.entries || []).filter((entry) => !entry.hidden && commodityFamilies.has(entry.model)).map((entry) => ret63(entry.symbol)).filter(Number.isFinite);
    const drivers = { uup63: ret63('UUP'), tlt63: ret63('TLT'), tip63: ret63('TIP'), qqq63: ret63('QQQ'), xle63: ret63('XLE'), xli63: ret63('XLI'), gld63: ret63('GLD'), btc63: ret63('BTC-USD'), dbc63: ret63('DBC'), goldSilverRatio63: model.realRatioTrailingPct(bars.GLD, bars.SLV, 63), breadth: breadthValues.length ? breadthValues.filter((value) => value > 0).length / breadthValues.length * 100 : null };
    const params = { confirmationWeight: 1.12, volatilityPenalty: 1.15, riskMultiplier: 1 }, rows = [];
    for (const entry of (universe.entries || []).filter((item) => !item.hidden)) {
      const history = bars[entry.symbol], trend = model.realTrendState(history, 'swing');
      const metrics = { trend, volatility: model.realAnnualVol(history, 126, entry.symbol.includes('-USD') ? 365 : 252), drawdown: model.realMaxDrawdown(history, 126) };
      if (!trend || !Number.isFinite(trend.score)) continue;
      let result;
      if (entry.model === 'gold') result = model.goldModelScore(metrics, drivers, params);
      else if (entry.model === 'silver') result = model.silverModelScore(metrics, drivers, params);
      else if (entry.model === 'bitcoin') result = model.bitcoinModelScore(metrics, drivers, params);
      else if (entry.model === 'crypto') result = model.cryptoModelScore(metrics, drivers, params);
      else result = model.commodityModelScore(metrics, drivers, params, entry.model);
      rows.push({ ticker: entry.symbol, model: entry.model, score: round(result.score, 1), trend: trend.label, mom21: round(trend.r21), mom63: round(trend.r63), mom126: round(trend.r126), vol: round(metrics.volatility), maxDrawdown: round(metrics.drawdown), riskPenalty: round(result.riskPenalty), confirmations: result.confirmations, asOf: latestIso(history) });
    }
    rows.sort((a, b) => b.score - a.score); const leader = rows[0];
    const specific = {};['GLD', 'SLV', 'BTC-USD', 'IBIT', 'DBC', 'USO'].forEach((ticker) => { const row = rows.find((item) => item.ticker === ticker); if (row) specific[ticker] = row; });
    return { id: 'real-assets-lab', asOf: leader?.asOf || new Date().toISOString(), read: leader ? `${leader.ticker} leads real assets at ${leader.score}/100; GLD ${specific.GLD?.score ?? '—'}, BTC ${specific['BTC-USD']?.score ?? '—'}, SLV ${specific.SLV?.score ?? '—'}.` : 'Real-assets model unavailable.', metrics: { leader: leader || null, ranked: rows.slice(0, 6), specific, scored: rows.length, horizon: 'swing' }, deepLink: 'real-assets-lab.html', source: 'owning-tool-functions' };
  } catch (error) { return { id: 'real-assets-lab', asOf: new Date().toISOString(), read: 'Real-assets model unavailable this run.', metrics: { error: error.message }, deepLink: 'real-assets-lab.html', source: 'owning-tool-functions' }; }
}

function buildToolCoverage(toolReads) {
  const registry = JSON.parse(read('tools.json'));
  return (registry.tools || []).map((tool) => ({ id: tool.id, deepLink: tool.file, status: toolReads[tool.id] ? 'fresh-headless' : 'browser-or-agent-read', reason: toolReads[tool.id] ? null : 'No deterministic Tier-A adapter; consume its latest browser toolRead when present and otherwise inspect the owning tool before authoring.' }));
}

async function main() {
  const window = argWindow();
  let marketClosed = false;
  try { const dow = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short' }); marketClosed = dow === 'Sat' || dow === 'Sun'; } catch { }
  const [vixRows, fg] = await Promise.all([yahooRows('^VIX', '1mo'), fearGreed()]);
  let vix = vixRows && vixRows.length ? round(vixRows[vixRows.length - 1].c, 2) : null;
  let vixSource = vix != null ? 'yahoo-live' : null;
  if (vix == null) {
    const cachedVix = cachedVixSpot();
    if (cachedVix) { vix = cachedVix.level; vixSource = `cboe-cache(${cachedVix.asof || 'options'})`; }
  }
  const reg = macroRegime(fg, vix);

  const bench = await yahooRowsMemo('SPY');
  const benchMom1m = momentumPct(bench, 21), benchMom3m = momentumPct(bench, 63), benchMom6m = momentumPct(bench, 126);
  const benchStruct = structural(bench);

  const sectors = {};
  for (const s of (cfg.track?.sectors || [])) {
    const rows = await yahooRowsMemo(s); if (!rows) continue;
    const m1 = momentumPct(rows, 21), m3 = momentumPct(rows, 63);
    const st = structural(rows);
    const rrg = rrgFull(rows, bench);
    sectors[s] = { rsMom1m: round(m1 - benchMom1m, 2), rsMom3m: round(m3 - benchMom3m, 2), rsMom6m: round(momentumPct(rows, 126) - benchMom6m, 2), rsRatio: rrg.rsRatio, rsMom: rrg.rsMom, quad: rrg.quad, accel: rrg.accel, rrgState: rrg.rrgState, rotation: rrg.rotation, maStack: st.maStack, ma200Dist: st.ma200Dist };
  }
  const names = {};
  for (const it of (wl.items || [])) {
    const rows = await yahooRowsMemo(it.ticker); if (!rows) continue;
    names[it.ticker] = { px: round(rows[rows.length - 1].c, 2), mom5: round(momentumPct(rows, 5)), mom21: round(momentumPct(rows, 21)), mom63: round(momentumPct(rows, 63)), ...structural(rows) };
  }

  // thematic groups (Mag 7 → MAGS, semis → SOXX): the group ETF proxy read (sector-style RS/RRG/MA-stack)
  // + each member (name-style momentum + structural) + breadth (how many members are individually bull-stacked).
  // The agent (Tier B) elevates the NOTABLE members from this deterministic slice per run (§7a).
  const groups = [];
  for (const g of (cfg.track?.groups || [])) {
    let read = null;
    if (g.etf) {
      const er = await yahooRowsMemo(g.etf);
      if (er && er.length) {
        const m1 = momentumPct(er, 21), m3 = momentumPct(er, 63);
        const st = structural(er);
        const rrg = rrgFull(er, bench);
        read = { etf: g.etf, px: round(er[er.length - 1].c, 2), rsMom1m: round(m1 - benchMom1m, 2), rsMom3m: round(m3 - benchMom3m, 2), rsMom6m: round(momentumPct(er, 126) - benchMom6m, 2), rsRatio: rrg.rsRatio, rsMom: rrg.rsMom, quad: rrg.quad, accel: rrg.accel, rrgState: rrg.rrgState, rotation: rrg.rotation, maStack: st.maStack, ma200Dist: st.ma200Dist };
      }
    }
    const members = {};
    let nTot = 0, bull = 0, a50 = 0, a200 = 0, up = 0;
    for (const t of (g.members || [])) {
      const rows = await yahooRowsMemo(t); if (!rows) continue;
      const st = structural(rows);
      const mem = { px: round(rows[rows.length - 1].c, 2), mom5: round(momentumPct(rows, 5)), mom21: round(momentumPct(rows, 21)), mom63: round(momentumPct(rows, 63)), ...st };
      members[t] = mem; nTot++;
      if (st.maStack === 'bull-stack') bull++;
      if (Number.isFinite(st.ma50Dist) && st.ma50Dist > 0) a50++;
      if (Number.isFinite(st.ma200Dist) && st.ma200Dist > 0) a200++;
      if (Number.isFinite(mem.mom21) && mem.mom21 > 0) up++;
    }
    groups.push({ id: g.id, label: g.label, etf: g.etf || null, deepLink: g.deepLink || null, read, breadth: { n: nTot, bullStacked: bull, above50: a50, above200: a200, upMom: up, label: nTot ? `${bull}/${nTot} bull-stacked` : 'n/a' }, members });
  }

  const toolReads = {};
  const sectorRead = buildSectorToolRead(sectors); toolReads[sectorRead.id] = sectorRead;
  const parallelToolReads = await Promise.all([buildEtfToolRead(), buildGlobalToolRead(), buildRealAssetsToolRead()]);
  for (const toolRead of parallelToolReads) toolReads[toolRead.id] = toolRead;
  const companyFundamentalsRead = buildCompanyFundamentalsOwnerRead((path) => JSON.parse(read(path)), companyObjectSha256);
  toolReads[companyFundamentalsRead.id] = companyFundamentalsRead;
  const toolCoverage = buildToolCoverage(toolReads), nextSession = nextSessionDate(window), dataFreshness = dataSnapshotFreshness();

  const snap = {
    ts: new Date().toISOString(), window, marketClosed, nextSessionDate: nextSession,
    regimeScore: reg.risk, regimeBand: reg.band, vix, fearGreed: fg ? fg.score : null,
    dataFreshness, bench: { px: bench && bench.length ? round(bench[bench.length - 1].c, 2) : null, ...benchStruct },
    sectors, names, groups, toolReads, toolCoverage, source: 'brief-refresh.mjs'
  };
  appendFileSync(join(ROOT, 'brief-history.jsonl'), JSON.stringify(snap) + '\n');

  // deterministic slice the browser cockpit reads (market-brief.html overlays it as the "Computed (Tier-A)" line)
  // asOf = the window this refresh anchors to; generatedAt = the actual wall-clock this refresh ran (both are the run time for Tier-A).
  const snapshot = { asOf: snap.ts, generatedAt: snap.ts, window, marketClosed, nextSessionDate: nextSession, dataFreshness, regime: { band: reg.band, score: reg.risk, vix, fearGreed: fg ? fg.score : null }, bench: snap.bench, names, sectors, groups, toolReads, toolCoverage };
  writeFileSync(join(ROOT, 'market-brief.snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');

  console.log(`[brief-refresh] window=${window} regime=${reg.band}(${reg.risk}) VIX=${vix ?? '—'}${vixSource ? ' [' + vixSource + ']' : ''} F&G=${fg ? fg.score + '/' + fg.band : '—'}`);
  console.log(`  structural: SPY ${benchStruct.maStack} · 200d ${benchStruct.ma200Dist ?? '—'}% · 52w-high ${benchStruct.pctFrom52wHigh ?? '—'}% · mom126 ${benchStruct.mom126 ?? '—'}% mom252 ${benchStruct.mom252 ?? '—'}%`);
  console.log(`  sectors: ${Object.entries(sectors).map(([k, v]) => `${k} ${v.rrgState}${Number.isFinite(v.accel) ? ' a' + (v.accel >= 0 ? '+' : '') + v.accel : ''}${v.rotation && v.rotation !== 'neutral' ? '→' + v.rotation.toUpperCase() : ''}`).join(' · ') || '—'}`);
  console.log(`  names:   ${Object.entries(names).map(([k, v]) => `${k} ${v.px} mom21=${v.mom21}% 200d=${v.ma200Dist ?? '—'}% ${v.maStack}`).join(' · ') || '—'}`);
  console.log(`  groups:  ${groups.map(g => `${g.label} ${g.read ? g.read.rrgState + ' (' + g.read.rsMom1m + '%)' : '—'} ${g.breadth.label}`).join(' · ') || '—'}`);
  console.log(`  tools:   ${Object.values(toolReads).map((tool) => `${tool.id}: ${tool.read}`).join(' · ')}`);
  console.log(`  next:    ${nextSession}${marketClosed ? ' (market closed — latest completed bars)' : ''}`);
  console.log(`  wrote market-brief.snapshot.json + appended 1 brief-history.jsonl row. Commit these + run Tier B (agent) for the narrative.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error('[brief-refresh] soft-fail:', e.message); process.exit(0); });
}
