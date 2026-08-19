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
import { readFileSync, appendFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { buildToolAuthorRequest, buildFinalAuthorRequest, invokeAuthor, validateAuthorEnvelope, AUTHOR_ERRORS } from './brief-author.mjs';
import {
  buildPublishSet, validatePublishSet, validateRunIdentity, promotePublishSet,
  stagePublishSet, commitPublication, pushPublication, classifyRemoteOverlap,
  createRunState, advanceRunState
} from './brief-publication.mjs';
import * as OWNER from './owner-state.mjs';
// The artifact gate's OWN validator. Imported, never restated, so a "gate-failing" artifact and a
// "refused at read time" artifact are decided by one predicate that cannot drift into two.
import { validateOfficialCurves } from './validate-official-curves.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const featureRequire = createRequire(import.meta.url);
const RLCONTRACTS = featureRequire(join(ROOT, 'rlcontracts.js'));
const RLMETRICS = featureRequire(join(ROOT, 'rlmetrics.js'));
/* rlcockpit.js owns the ONE cross-asset leg resolver. Tier A requires it so the memory row and
   the published block agree about which leg is dark by construction, not by two implementations
   that happen to match today. */
const RLCOCKPIT = featureRequire(join(ROOT, 'rlcockpit.js'));
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

/* BUG-010 §3.2 — the producing adapter id and the no-recommendation statement are safety-bearing
   facts about this read, not narrative colour, so they are PROJECTED from the already-validated
   feature002 boundary rather than authored per window. Derived, never pinned: a literal adapter id
   here could name an adapter the configuration no longer declares, which is the same defect one
   layer down. The wording satisfies the disclosure predicate the publish gate and the Feature 010
   Scope 6 assertion share — "no recommendation" adjacent to the produced verb, no sentence break
   between them. */
export function companyOwnerReadDisclosure(boundary) {
  if (!boundary || typeof boundary.adapterId !== 'string' || !boundary.adapterId
    || typeof boundary.recommendationEligibility !== 'string' || !boundary.recommendationEligibility) {
    throw new Error('company owner disclosure requires a declared adapterId and recommendationEligibility');
  }
  return `Consumed from ${boundary.adapterId} as ${boundary.recommendationEligibility.replace(/-/g, ' ')}; no recommendation is produced.`;
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
  const read = `${owner.companyId} fundamentals are ${owner.status}; direction ${owner.direction}; statement ${owner.statementCutoff || 'unavailable'}, model ${owner.modelCutoff || 'unavailable'}, brief ${owner.briefCutoff || 'unavailable'}, market ${owner.marketCutoff || 'unavailable'}. ${companyOwnerReadDisclosure(boundary)}`;
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

/* BUG-010 §3.3 — preservation across the Tier-B narrative merge, in the RE-ASSERTION shape.
   The narrative lane owns toolCoverage, so projecting the disclosure into the Tier-A read is not
   enough on its own: a rewrite lands on top of it. This restores the deterministic sentence onto
   the company entry after the merge, so the published fact depends on this step running rather
   than on a model remembering to re-type it. It evaluates no disclosure predicate of its own — it
   installs the one canonical sentence — so it cannot disagree with the publish gate about what
   counts as a disclosure. The coverage id is read from the registry entry that OWNS the config
   file, matching how the gate locates its subject. Absence or duplication throws: a window that
   cannot carry the disclosure must fail rather than publish without it. */
export function reassertCompanyOwnerReadDisclosure(payload, readJson) {
  if (typeof readJson !== 'function') throw new Error('company owner disclosure re-assertion requires an injected JSON read function');
  const registry = readJson('tools.json');
  const ownerTool = ((registry && registry.tools) || []).find((tool) => tool && tool.data === 'company-fundamentals.config.json');
  if (!ownerTool || typeof ownerTool.id !== 'string' || !ownerTool.id) throw new Error('tools.json registers no tool owning company-fundamentals.config.json');
  const config = readJson('company-fundamentals.config.json');
  const disclosure = companyOwnerReadDisclosure(config && config.feature002);
  const coverage = Array.isArray(payload && payload.toolCoverage) ? payload.toolCoverage : [];
  const entries = coverage.filter((entry) => entry && entry.id === ownerTool.id);
  if (entries.length !== 1) throw new Error(`toolCoverage must carry exactly one "${ownerTool.id}" entry to disclose the owner read, found ${entries.length}`);
  const entry = entries[0];
  const narrated = typeof entry.reason === 'string' ? entry.reason.trim() : '';
  if (narrated.includes(disclosure)) return { id: ownerTool.id, disclosure, reasserted: false, reason: entry.reason };
  entry.reason = narrated ? `${narrated} ${disclosure}` : disclosure;
  return { id: ownerTool.id, disclosure, reasserted: true, reason: entry.reason };
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
    for (; ;) {
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

/* ─────────────────────────────────────────────────────────────────────────────
   Feature 002 Scope 08 — Window-Aware Final Aggregation barrier.

   runFinalAuthor is the ONE-after-barrier final orchestration hook declared by the design module map.
   It authors exactly ONE registry-complete FinalBrief, and ONLY after the frozen-registry barrier proves
   that every DERIVED source ID has both a validated owner read outcome AND a validated source-brief
   outcome. The final aggregator (market-brief) is never among the sources and is therefore never fed its
   own source brief. Every pure decision is delegated to rlcontracts.js (compactFinalAuthorInput,
   validateFinalBrief) and every external call to the powerless brief-author.mjs boundary
   (buildFinalAuthorRequest → invokeAuthor → validateAuthorEnvelope). No source is reacquired here and no
   owner formula is copied.
   ───────────────────────────────────────────────────────────────────────────── */

/* runFinalAuthor(config): enforce the all-source barrier, compact one bounded final input, and author +
   validate ONE FinalBrief. `config`:
     { registry, reads, briefs, groups, runContext, finalBudget, identity,
       maxRetries?, invokeOptions?, seenResponses?, authorFn? }
   The barrier requires readOutcomeIds and briefOutcomeIds to EACH exactly equal orderedSourceToolIds and
   the stored counts to equal the derived ID-set lengths; the current 23-participant/22-source values are
   a current-repository canary and never control success. On any barrier/compaction/author/validation
   failure it returns a sanitized refusal ({ ok:false, refusal }); on success it returns the validated
   FinalBrief ({ ok:true, final, compacted, telemetry }). An initial final attempt may receive at most
   `maxRetries` retries against the SAME frozen source set. */
export async function runFinalAuthor(config) {
  if (!config || typeof config !== 'object') throw new Error('runFinalAuthor requires a config');
  const reads = config.reads;
  const briefs = config.briefs;
  if (!reads || typeof reads !== 'object') throw new Error('runFinalAuthor requires config.reads');
  if (!briefs || typeof briefs !== 'object') throw new Error('runFinalAuthor requires config.briefs');
  const groups = config.groups;
  const runContext = config.runContext;
  if (!runContext || typeof runContext !== 'object') throw new Error('runFinalAuthor requires config.runContext');
  const finalBudget = config.finalBudget;
  const identity = config.identity;
  if (!identity || typeof identity !== 'object') throw new Error('runFinalAuthor requires config.identity');
  const maxRetries = Number.isInteger(config.maxRetries) ? config.maxRetries : 2;
  const invokeOptions = config.invokeOptions || {};
  const seenResponses = config.seenResponses instanceof Set ? config.seenResponses : new Set();
  const authorFn = typeof config.authorFn === 'function' ? config.authorFn : (request) => invokeAuthor(request, invokeOptions);

  let frozen;
  if (config.registry && config.registry.contractVersion === 'frozen-briefing-registry/v1') {
    frozen = config.registry;
  } else {
    const validated = RLCONTRACTS.validateRegistry(config.registry, runContext.registryConfig || null);
    if (!validated.ok) return { ok: false, refusal: { code: 'B002-READ-BARRIER', reason: 'registry-invalid:' + validated.error.reason, field: validated.error.field } };
    frozen = validated.value;
  }

  const telemetry = { participantCount: frozen.participantCount, sourceCount: frozen.sourceCount, aggregatorToolId: frozen.aggregatorToolId, attempts: 0 };
  const orderedSources = frozen.orderedSourceToolIds.slice().sort();
  const readIds = Object.keys(reads).sort();
  const briefIds = Object.keys(briefs).sort();
  const eq = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

  if (Object.prototype.hasOwnProperty.call(reads, frozen.aggregatorToolId) || Object.prototype.hasOwnProperty.call(briefs, frozen.aggregatorToolId)) {
    return { ok: false, telemetry, refusal: { code: 'B002-READ-BARRIER', reason: 'aggregator-self-consumed', toolId: frozen.aggregatorToolId } };
  }
  if (!eq(readIds, orderedSources)) return { ok: false, telemetry, refusal: { code: 'B002-READ-BARRIER', reason: 'read-barrier-incomplete' } };
  if (!eq(briefIds, orderedSources)) return { ok: false, telemetry, refusal: { code: 'B002-READ-BARRIER', reason: 'brief-barrier-incomplete' } };
  if (frozen.sourceCount !== frozen.orderedSourceToolIds.length || frozen.participantCount !== frozen.orderedParticipantIds.length) {
    return { ok: false, telemetry, refusal: { code: 'B002-READ-BARRIER', reason: 'registry-count-mismatch' } };
  }

  const compacted = RLCONTRACTS.compactFinalAuthorInput(frozen, reads, briefs, groups, runContext, finalBudget);
  if (!compacted.ok) return { ok: false, telemetry, refusal: { code: compacted.error.code, reason: compacted.error.reason, field: compacted.error.field } };
  const built = buildFinalAuthorRequest(compacted.value, identity);
  if (!built.ok) return { ok: false, telemetry, refusal: { code: built.error.code, reason: built.error.reason, field: built.error.field } };

  const runInputs = {
    registry: frozen,
    reads,
    briefs,
    marketSessionEvidenceRef: runContext.marketSessionEvidenceRef,
    actionThresholds: runContext.actionThresholds || { maxActions: 5, maxAttention: 8 }
  };

  let attempt = 0;
  let lastError = null;
  while (attempt <= maxRetries) {
    telemetry.attempts += 1;
    let invokeResult;
    try {
      invokeResult = await authorFn(built.request, { attempt });
    } catch (error) {
      invokeResult = { ok: false, error: { code: AUTHOR_ERRORS.PROCESS, reason: 'final-author-threw' } };
    }
    if (invokeResult && invokeResult.ok) {
      const envelopeCheck = validateAuthorEnvelope(invokeResult.envelope, built.request, { seen: seenResponses, maxStdoutBytes: invokeOptions.maxStdoutBytes });
      if (envelopeCheck.ok) {
        const finalCheck = RLCONTRACTS.validateFinalBrief(envelopeCheck.final, runInputs, groups);
        if (finalCheck.ok) {
          return { ok: true, final: finalCheck.value, compacted: compacted.value, telemetry };
        }
        lastError = { code: 'B002-FINAL-AUTHOR', reason: finalCheck.error.reason, field: finalCheck.error.field };
      } else {
        lastError = { code: envelopeCheck.error.code, reason: envelopeCheck.error.reason, field: envelopeCheck.error.field };
      }
    } else {
      lastError = invokeResult && invokeResult.error ? { code: invokeResult.error.code, reason: invokeResult.error.reason } : { code: AUTHOR_ERRORS.PROCESS, reason: 'final-author-failed' };
    }
    attempt += 1;
  }
  return { ok: false, telemetry, refusal: { code: 'B002-FINAL-AUTHOR', reason: (lastError && lastError.reason) || 'final-author-exhausted', field: lastError && lastError.field } };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Feature 002 Scope 09 — Evidence-First Atomic Publication (runBriefRefresh).

   The scheduler barrier orchestration hook declared by the design module map. It composes the shipped
   Scope 05/06/08 hooks (freezeRegistryToolReads via validateRegistry, runToolAuthorPool, runFinalAuthor)
   and the Scope 07/09 publication primitives (buildPublishSet, validatePublishSet, validateRunIdentity,
   promotePublishSet, stagePublishSet, commitPublication, pushPublication, classifyRemoteOverlap) behind a
   CLOSED run-state machine so the exact evidence-first barrier order is structurally enforced:

     lease -> isolated worktree at the fetched revision -> registry/calendar freeze -> bounded source
     acquisition -> IMMUTABLE cutoff + evidence freeze -> one read per frozen source + input freeze ->
     reuse/budget reservation -> source-brief authorship (four-worker pool) -> ALL-SOURCE barrier ->
     lifecycle/grouping -> ONE final author AFTER the barrier -> build+validate publish set ->
     POINTER-LAST promotion -> stage ONLY declared paths -> commit with run trailers -> push exact commit.

   EVERY external effect is dependency-injected (git worktree/runner, source acquisition, author
   transports, clock, lease, journal). runBriefRefresh writes ONLY inside the injected isolated worktree;
   it never touches the user's root worktree, brief-history.jsonl, or the real origin. Any required
   failure returns a sanitized refusal ({ ok:false, refusal:{ code, reason, phase } }) and leaves prior
   public state untouched; a commit/push failure preserves the worktree + exact staged bytes for an exact
   resume (never a source reacquire or a brief reauthor). This machinery is NOT wired into the live
   launchd path — the browser UI still consumes the legacy market-brief.payload.json until the Scope 10
   cutover. ───────────────────────────────────────────────────────────────────────────── */

function stagedHashesOf(staging) {
  const out = {};
  for (const rel of Object.keys(staging.files)) out[rel] = staging.files[rel].sha256;
  return out;
}

function assembleToolReadsForPool(orderedSourceToolIds, reads, frozen, profileBudgets) {
  return orderedSourceToolIds.map((toolId) => {
    const read = reads[toolId];
    const entry = frozen.entries && frozen.entries[toolId];
    const profile = (entry && entry.profile) || (read && read.profile) || 'off-theme';
    return { toolId, profile, read, profileBudget: profileBudgets[profile] };
  });
}

export async function runBriefRefresh(deps) {
  if (!deps || typeof deps !== 'object') throw new Error('runBriefRefresh requires a deps object');
  if (!deps.worktree || typeof deps.worktree.create !== 'function') throw new Error('runBriefRefresh requires deps.worktree.create');
  if (typeof deps.acquireSources !== 'function') throw new Error('runBriefRefresh requires deps.acquireSources');
  if (!deps.runContext || typeof deps.runContext !== 'object') throw new Error('runBriefRefresh requires deps.runContext');

  const events = Array.isArray(deps.events) ? deps.events : [];
  const clock = deps.clock && typeof deps.clock.now === 'function' ? deps.clock : { now: () => new Date().toISOString() };
  const profileBudgets = deps.profileBudgets || {};
  const emit = (phase, detail) => { events.push({ phase, at: clock.now(), ...(detail || {}) }); };
  let state = createRunState(deps.runContext.runId || 'pending-run');
  const advance = (toPhase) => {
    const next = advanceRunState(state, toPhase);
    if (!next.ok) throw new Error(`internal run-state error at ${state.phase} -> ${toPhase}: ${next.error.reason}`);
    state = next.state;
  };
  const refuse = (code, reason, phase, extra) => {
    emit('refusal', { code, reason, refusedPhase: phase });
    return { ok: false, refusal: { code, reason, phase }, events, state, ...(extra || {}) };
  };

  const lease = deps.lease && typeof deps.lease.acquire === 'function' ? deps.lease.acquire(deps.runKey) : { ok: true, release() { } };
  if (!lease.ok) return refuse('B002-RUN-IN-PROGRESS', 'lease-held', 'lease-held', { duplicate: true });
  advance('lease-held'); emit('lease-held', {});

  let worktree = null;
  let preserveWorktree = false;
  try {
    // Completed-run idempotency (design barrier step 1): a duplicate invocation whose run identity already
    // owns the current pointer returns the existing manifest with ONE de-duplicated attempt event and
    // performs no acquisition, authoring, commit, or push.
    if (deps.prior && deps.prior.pointer && deps.prior.pointer.runId === deps.runContext.runId) {
      emit('duplicate-attempt', { runId: deps.runContext.runId });
      return { ok: true, idempotent: true, runId: deps.runContext.runId, runFingerprint: deps.runContext.runFingerprint, reusedPointer: deps.prior.pointer, manifest: deps.prior.manifest || null, events, state };
    }
    worktree = deps.worktree.create(deps.sourceRevision);
    advance('worktree-ready'); emit('worktree-ready', { dir: worktree.dir });

    let frozen;
    if (deps.registry && deps.registry.contractVersion === 'frozen-briefing-registry/v1') {
      frozen = deps.registry;
    } else {
      const validated = RLCONTRACTS.validateRegistry(deps.registry, deps.registryConfig || null);
      if (!validated.ok) return refuse('B002-READ-BARRIER', 'registry-invalid:' + validated.error.reason, 'registry-frozen');
      frozen = validated.value;
    }
    if (deps.calendar && typeof deps.calendar.covers === 'function') {
      const etDate = deps.runKey && deps.runKey.etSessionDate;
      if (!deps.calendar.covers(etDate)) return refuse('B002-CALENDAR', 'calendar-coverage-missing', 'registry-frozen');
    }
    advance('registry-frozen'); emit('registry-frozen', { sourceCount: frozen.sourceCount, participantCount: frozen.participantCount });

    const acquired = await deps.acquireSources({ orderedSourceToolIds: frozen.orderedSourceToolIds.slice() });
    if (!acquired || !acquired.ok) return refuse((acquired && acquired.code) || 'B002-SESSION-REQUIRED', (acquired && acquired.reason) || 'source-acquisition-failed', 'sources-acquired');
    advance('sources-acquired'); emit('sources-acquired', { sourceIds: Object.keys(acquired.reads || {}).sort() });

    const evidence = acquired.evidence;
    const cutoffAt = evidence && evidence.cutoffAt ? evidence.cutoffAt : clock.now();
    if (!evidence || evidence.state === 'required-unavailable') return refuse('B002-SESSION-REQUIRED', 'required-evidence-unavailable', 'evidence-frozen');
    advance('evidence-frozen'); emit('evidence-frozen', { cutoffAt, state: evidence.state });

    const reads = acquired.reads || {};
    const missing = frozen.orderedSourceToolIds.find((id) => !reads[id]);
    if (missing) return refuse('B002-READ-BARRIER', 'read-missing:' + missing, 'reads-frozen');
    advance('reads-frozen'); emit('reads-frozen', { readIds: Object.keys(reads).sort() });

    advance('reuse-reserved'); emit('reuse-reserved', {});

    const poolReads = assembleToolReadsForPool(frozen.orderedSourceToolIds, reads, frozen, profileBudgets);
    const pool = await runToolAuthorPool({ reads: poolReads, identity: deps.identity, runBudget: deps.runBudget, authorFn: deps.authorFn, workers: deps.workers || 4 });
    if (!pool.ok) return refuse(pool.refusal.code, pool.refusal.reason, 'source-briefs-authored');
    const authoredBriefs = {};
    for (const id of frozen.orderedSourceToolIds) {
      if (!pool.outcomes[id] || !pool.outcomes[id].brief) return refuse('B002-TOOL-AUTHOR', 'brief-outcome-missing:' + id, 'source-briefs-authored');
      authoredBriefs[id] = pool.outcomes[id].brief;
    }
    advance('source-briefs-authored'); emit('source-briefs-authored', { authored: Object.keys(authoredBriefs).sort() });

    const authoredIds = Object.keys(authoredBriefs).sort();
    const expectedIds = frozen.orderedSourceToolIds.slice().sort();
    if (authoredIds.length !== expectedIds.length || !authoredIds.every((v, i) => v === expectedIds[i])) {
      return refuse('B002-READ-BARRIER', 'source-barrier-incomplete', 'source-barrier-passed');
    }
    advance('source-barrier-passed'); emit('source-barrier-passed', { sourceCount: expectedIds.length });

    const groups = deps.groups;
    advance('lifecycle-grouped'); emit('lifecycle-grouped', {});

    const finalRes = await runFinalAuthor({
      registry: frozen, reads, briefs: authoredBriefs, groups,
      runContext: deps.runContext, finalBudget: deps.finalBudget, identity: deps.identity, authorFn: deps.finalAuthorFn
    });
    if (!finalRes.ok) return refuse(finalRes.refusal.code, finalRes.refusal.reason, 'final-authored');
    advance('final-authored'); emit('final-authored', {});

    const coverageEntries = Array.isArray(finalRes.final.coverage) ? finalRes.final.coverage.length : 0;
    const run = {
      runId: deps.runContext.runId,
      runFingerprint: deps.runContext.runFingerprint,
      etRunDate: deps.etRunDate,
      window: deps.window,
      registry: {
        fingerprint: frozen.registryFingerprint,
        orderedSourceToolIds: frozen.orderedSourceToolIds.slice(),
        orderedParticipantIds: frozen.orderedParticipantIds.slice()
      },
      evidence: { state: evidence.state, cutoffAt, body: evidence.body },
      tools: frozen.orderedSourceToolIds.map((id) => ({ toolId: id, outcome: 'newly-authored', read: reads[id], brief: authoredBriefs[id] })),
      final: { body: finalRes.final, coverage: { included: coverageEntries } },
      recommendationEvents: deps.recommendationEvents || [],
      prior: deps.prior || null
    };

    const built = buildPublishSet(run);
    if (!built.ok) return refuse('B002-PUBLISH-SET', built.error.reason, 'publish-set-built');
    advance('publish-set-built'); emit('publish-set-built', {});

    const priorStreams = deps.prior && deps.prior.streams ? deps.prior.streams : {};
    const priorGeneration = deps.prior && Number.isInteger(deps.prior.generation) ? deps.prior.generation : 0;
    const setValidation = validatePublishSet(built.staging, { priorStreams, sealedMonths: deps.prior && deps.prior.sealedMonths });
    if (!setValidation.ok) return refuse('B002-PUBLISH-SET', setValidation.error.reason, 'publish-set-validated');
    const identityValidation = validateRunIdentity(built.staging, { priorGeneration });
    if (!identityValidation.ok) return refuse('B002-PUBLISH-SET', identityValidation.error.reason, 'publish-set-validated');
    advance('publish-set-validated'); emit('publish-set-validated', {});

    const promotion = promotePublishSet(built.staging, worktree.dir);
    if (!promotion.ok) return refuse('B002-PUBLISH-SET', promotion.error.reason, 'promoted');
    advance('promoted'); emit('promoted', { objectsBeforePointer: promotion.promoted.objectsBeforePointer, pointerLast: promotion.promoted.pointerLast });

    const staging = stagePublishSet(built.staging, worktree.gitRunner);
    if (!staging.ok) return refuse('B002-PUBLISH-SET', staging.error.reason, 'staged');
    if (deps.journal && typeof deps.journal.write === 'function') deps.journal.write({ phase: 'staged', runId: run.runId, stagedHashes: stagedHashesOf(built.staging) });
    advance('staged'); emit('staged', { staged: staging.staged.length });

    const commit = commitPublication(built.staging, worktree.gitRunner, { subject: `brief: publish run ${run.runId}` });
    if (!commit.ok) { preserveWorktree = true; return refuse(commit.error.code, commit.error.reason, 'committed', { worktreeDir: worktree.dir, staging: built.staging }); }
    if (deps.journal && typeof deps.journal.write === 'function') deps.journal.write({ phase: 'committed', runId: run.runId, commit: commit.commit.sha, stagedHashes: stagedHashesOf(built.staging) });
    advance('committed'); emit('committed', { sha: commit.commit.sha, trailers: commit.commit.trailers.slice() });

    const push = pushPublication(worktree.gitRunner, { remote: deps.remote || 'origin', branch: deps.branch || 'main' });
    if (!push.ok) {
      preserveWorktree = true;
      if (Array.isArray(deps.remoteChangedPaths)) {
        const overlap = classifyRemoteOverlap(deps.remoteChangedPaths, (built.staging.manifest.body.inventory || []).map((entry) => entry.path));
        if (!overlap.ok) return refuse('B002-REMOTE-OVERLAP', overlap.error.reason, 'pushed', { commit: commit.commit, worktreeDir: worktree.dir });
      }
      return refuse('B002-PUSH', push.error.reason, 'pushed', { commit: commit.commit, worktreeDir: worktree.dir });
    }
    if (deps.journal && typeof deps.journal.write === 'function') deps.journal.write({ phase: 'pushed', runId: run.runId, commit: commit.commit.sha });
    advance('pushed'); emit('pushed', {});

    return { ok: true, runId: run.runId, runFingerprint: run.runFingerprint, manifest: built.staging.manifest.body, commit: commit.commit, push: push.push, staging: built.staging, events, state, worktreeDir: worktree.dir };
  } finally {
    if (lease && typeof lease.release === 'function') lease.release();
    if (worktree && typeof worktree.remove === 'function' && !preserveWorktree) {
      try { worktree.remove(); } catch (error) { /* best effort cleanup; failure never corrupts prior public state */ }
    }
  }
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
    /* Every field is named for exactly what it counts. The previous shape exposed
       `count` alone, which a brief author read as a SESSION count: the 2026-08-02
       brief reported "bars n=287 = 7/29 close; 7/30 AND 7/31 bars STILL not appended"
       and hedged multiple recommendations on that premise. 287 was the SYMBOL count,
       and this same index already recorded expectedSessionDate 2026-07-31 with
       freshCount 287 of 287 and carriedCount 0 — the data was fully current. The
       facts that settle staleness are surfaced here so the question cannot be
       answered by inference again. */
    try {
      const index = JSON.parse(read(`data/${kind}/index.json`));
      return {
        updated: index.updated || null,
        symbolCount: Number.isFinite(index.count) ? index.count : null,
        expectedSessionDate: index.expectedSessionDate || null,
        refreshDate: index.refreshDate || null,
        refreshWindow: index.refreshWindow || null,
        freshSymbolCount: Number.isFinite(index.freshCount) ? index.freshCount : null,
        carriedSymbolCount: Number.isFinite(index.carriedCount) ? index.carriedCount : null,
        missingSymbolCount: Array.isArray(index.missing) ? index.missing.length : null
      };
    } catch {
      return {
        updated: null, symbolCount: null, expectedSessionDate: null, refreshDate: null,
        refreshWindow: null, freshSymbolCount: null, carriedSymbolCount: null, missingSymbolCount: null
      };
    }
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
export function loadToolFunctions(file, names, preamble = '') {
  const source = read(file);
  const body = `${preamble}\n${names.map((name) => extractToolFunction(source, name)).join('\n')}\nreturn {${names.join(',')}};`;
  return Function(body)();
}

/* The top-level `var NAME = …;` tables those helpers close over — a tool's universe, scenario,
   regime and runway tables. Same balanced-delimiter contract as extractToolFunction (extended to
   `[`, `(`, strings and comments), so the brief runs the tool's OWN tables instead of keeping a
   second copy here that could silently drift from what the page shows. */
function extractToolDeclaration(source, name) {
  const match = new RegExp('(?:^|[\\n;])\\s*var\\s+' + name + '\\s*=').exec(source);
  if (!match) throw new Error(`tool declaration not found: ${name}`);
  const start = source.indexOf('var', match.index);
  let depth = 0, quote = null;
  for (let index = source.indexOf('=', start) + 1; index < source.length; index++) {
    const character = source[index];
    if (quote) {
      if (character === '\\') index++;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') { quote = character; continue; }
    if (character === '/' && source[index + 1] === '/') { index = source.indexOf('\n', index); if (index < 0) break; continue; }
    if (character === '/' && source[index + 1] === '*') { const close = source.indexOf('*/', index + 2); if (close < 0) break; index = close + 1; continue; }
    if (character === '{' || character === '[' || character === '(') depth++;
    else if (character === '}' || character === ']' || character === ')') depth--;
    else if (character === ';' && depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`tool declaration has unterminated body: ${name}`);
}
function loadToolDeclarations(file, names) {
  const source = read(file);
  return names.map((name) => extractToolDeclaration(source, name)).join('\n');
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
function pctFrom52wHigh(rows) { const hi = range52w(rows).high; const c = rows && rows.length ? rows[rows.length - 1].c : null; return (Number.isFinite(hi) && hi && Number.isFinite(c)) ? round((c / hi - 1) * 100, 2) : null; }
/* The 52-week range in ONE place. pctFrom52wHigh reads its high from here rather than scanning the
   window a second time, so the LEVEL the change detector compares a close against and the
   PERCENTAGE the brief prints can never disagree about where the 52-week high was. */
function range52w(rows) {
  if (!rows || !rows.length) return { high: null, low: null };
  let hi = -Infinity, lo = Infinity;
  for (const r of rows.slice(-252)) { if (r.c > hi) hi = r.c; if (r.c < lo) lo = r.c; }
  return { high: Number.isFinite(hi) ? hi : null, low: Number.isFinite(lo) ? lo : null };
}
/* the structural block for a series: long-horizon momentum + MA structure + 52w-range position */
function structural(rows) { return { mom126: round(momentumPct(rows, 126)), mom252: round(momentumPct(rows, 252)), ma50Dist: maDistPct(rows, 50), ma200Dist: maDistPct(rows, 200), maStack: maStack(rows), pctFrom52wHigh: pctFrom52wHigh(rows) }; }

/* The prior memory, read from the COMPACT recent projection rather than the 194-row source. That
   is the surface notes/market-brief.md §5 already names as the change-detection read, and it is
   the one shard-brief-history.mjs regenerates in full on every run — so a row that predates v2
   arrives with its four new keys projected as `null`, which the detector answers `baseline` for.
   An unreadable line is skipped rather than thrown on: a corrupt row is missing prior state, and
   missing prior state is `baseline`, which is already a defined answer. */
export function readRecentMemoryRows() {
  const abs = join(ROOT, 'brief-history.recent.jsonl');
  if (!existsSync(abs)) return [];
  const rows = [];
  for (const line of readFileSync(abs, 'utf8').split('\n')) {
    if (!line.length) continue;
    try { rows.push(JSON.parse(line)); } catch { continue; }
  }
  return rows;
}

/* The committed event slate. It lives on the published payload, which Tier A reads as a COMMITTED
   artifact and never writes — the R-5 boundary holds. A missing or unreadable payload is an empty
   slate, never a fabricated one. */
export function committedBriefEvents() {
  const abs = join(ROOT, 'market-brief.payload.json');
  if (!existsSync(abs)) return [];
  try {
    const payload = JSON.parse(readFileSync(abs, 'utf8'));
    return Array.isArray(payload.events) ? payload.events : [];
  } catch { return []; }
}

/* ────────── Feature 026 Scope 3 — run-specific memory (brief-history-recent-row/v2) ──────────
   What the run SAW, persisted so the next run can answer "what changed since I last told you"
   without refetching a single instrument. Nothing below composes a sentence: this is state. */

/* The §5 distinct-market-bar rule, in ONE place and one implementation. Repeated weekend and
   holiday runs read the SAME completed close, and a close observed four times is one piece of
   evidence, not four. Rows collapse to the last row per distinct `asOf`, so four Friday runs
   become one comparison. `asOfOf` is supplied by the caller, which is what lets the cross-asset
   legs and the tracked instruments share this rule instead of each growing their own. */
export function distinctRowsBy(rows, asOfOf) {
  const byAsOf = new Map();
  for (const row of (Array.isArray(rows) ? rows : [])) {
    const asOf = asOfOf(row);
    if (typeof asOf !== 'string' || asOf.length === 0) continue;
    byAsOf.set(asOf, row);
  }
  return [...byAsOf.values()];
}
export function legAsOfReader(legId) {
  return (row) => (row && row.crossAsset && row.crossAsset[legId] ? row.crossAsset[legId].asOf : null);
}
export function trackedAsOfReader(symbol) {
  return (row) => (row && row.tracked && row.tracked[symbol] ? row.tracked[symbol].asOf : null);
}

/* The four declared flags reuse EXISTING producers, each loaded from the file that defines it.
   `flipProximityPct` is rlbrief.js's own; `nearTermEvents`, `consecutiveRun` and
   `isPersistentSignal` are loaded from rlexperience-adapters/market-action.js, which is the single
   source rlbrief.js itself delegates to for all three. Nothing here reimplements any of them. */
export function loadChangeFlagProducers() {
  return {
    ...loadToolFunctions('rlbrief.js', ['flipProximityPct']),
    ...loadToolFunctions('rlexperience-adapters/market-action.js', ['nearTermEvents', 'consecutiveRun', 'isPersistentSignal'])
  };
}

/* FR-026-039 — a multi-session build, reached by feeding the shipped persistence gate new inputs
   rather than by writing a second gate. N distinct snapshots yield N-1 deltas, so the minimum run
   is `snapshots - 1`. A leg that reverses breaks the run and earns no build language; it is still
   published with its measured value. */
export function legPersistence(recentRows, legId, options = {}) {
  const gate = options.producers || loadChangeFlagProducers();
  const snapshots = Number.isFinite(options.snapshots) && options.snapshots > 1 ? options.snapshots : 3;
  const distinct = distinctRowsBy(recentRows, legAsOfReader(legId)).slice(-snapshots);
  const values = distinct.map((row) => row.crossAsset[legId].changePct).filter((value) => Number.isFinite(value));
  if (values.length < snapshots) return { persisted: false, observations: values.length, run: 0, direction: 0 };
  const run = gate.consecutiveRun(values, 0);
  return { persisted: gate.isPersistentSignal(values, snapshots - 1, 0), observations: values.length, run: run.len, direction: run.dir };
}

/* An event names an instrument only through a DECLARED field. The committed event rows carry
   `when` and `type` and no instrument at all, so this answers false for every tracked symbol until
   the event contract gains one — recorded as finding R-10 rather than papered over. Reading the
   instrument out of the event prose would attribute an earnings date no calendar ever stated. */
export function eventNamesInstrument(event, symbol) {
  if (!event || typeof event !== 'object') return false;
  const declared = Array.isArray(event.instruments) ? event.instruments
    : Array.isArray(event.tickers) ? event.tickers
      : [event.instrument, event.ticker];
  return declared.some((value) => typeof value === 'string' && value === symbol);
}

/* The tracked instrument set the change detector reads next run. Its SIZE is the roll-up's balance
   denominator, so the symbol list is the caller's — mirrored from watchlist.json — rather than a
   second list declared here that could drift out of step with what the run actually pulled. */
export function buildTrackedStates(deps) {
  const producers = deps.producers || loadChangeFlagProducers();
  const thresholds = deps.thresholds || {};
  const maWindows = Array.isArray(thresholds.maWindows) ? thresholds.maWindows : [];
  const proximityCap = thresholds.gammaFlipProximityPct;
  const snapshots = Number.isFinite(thresholds.persistenceSnapshots) ? thresholds.persistenceSnapshots : 3;
  const gamma = deps.gamma && typeof deps.gamma === 'object' ? deps.gamma : {};
  const priorRows = Array.isArray(deps.priorRows) ? deps.priorRows : [];
  const openInstruments = deps.openInstruments instanceof Set ? deps.openInstruments : new Set();
  const nearTerm = producers.nearTermEvents(Array.isArray(deps.events) ? deps.events : [], deps.asOf || null, deps.eventWindowDays);
  const tracked = {};
  for (const symbol of [...(Array.isArray(deps.symbols) ? deps.symbols : [])].sort()) {
    const rows = deps.barsBySymbol ? deps.barsBySymbol[symbol] : null;
    if (!rows || !rows.length) continue;
    const px = round(rows[rows.length - 1].c, 2);
    const range = range52w(rows);
    const levels = { high52w: round(range.high, 2), low52w: round(range.low, 2) };
    for (const window of maWindows) levels[`ma${window}`] = round(sma(rows, window), 2);
    const ma200Dist = maDistPct(rows, 200);
    const rrg = deps.benchRows && deps.benchRows.length ? rrgFull(rows, deps.benchRows) : null;
    /* §6c on this instrument's own structural distance: the last `snapshots` DISTINCT observations
       including this one. Fewer than that is not a cleared gate, it is an unanswered question. */
    const history = distinctRowsBy(priorRows, trackedAsOfReader(symbol))
      .slice(-(snapshots - 1))
      .map((row) => row.tracked[symbol].ma200Dist)
      .filter((value) => Number.isFinite(value));
    const series = Number.isFinite(ma200Dist) ? history.concat([ma200Dist]) : history;
    /* The gamma flip belongs to exactly ONE symbol per run — the gamma read's own metrics.symbol.
       Measuring another instrument's close against it would state a dealer position that
       instrument does not have, so every other symbol is false because the run holds no flip for
       it, never because proximity was measured and missed. */
    const flipPct = gamma.symbol === symbol ? producers.flipProximityPct(px, gamma.flip) : null;
    tracked[symbol] = {
      asOf: new Date(rows[rows.length - 1].t).toISOString().slice(0, 10),
      px,
      maStack: maStack(rows),
      ma200Dist,
      rrgState: rrg ? rrg.rrgState : null,
      levels,
      flags: {
        callOpen: openInstruments.has(symbol),
        gammaFlipProximity: Number.isFinite(flipPct) && Number.isFinite(proximityCap) ? flipPct <= proximityCap : false,
        persistenceGateMet: series.length >= snapshots && producers.isPersistentSignal(series, snapshots - 1, 0),
        earningsWithinWindow: nearTerm.some((event) => eventNamesInstrument(event, symbol))
      }
    };
  }
  return tracked;
}

/* The claim ledger, folded through the SHIPPED reducer. `foldLedger` is imported rather than
   re-walked, so "which calls are open" keeps one definition and the callOpen flag cannot disagree
   with the scorecard. `openedThisRun` and `resolvedThisRun` stay NULL — absent, never `[]` — because
   per-run claim resolution is Scope 5's obligation and an empty array here would assert that
   nothing resolved this run, which this scope has no evidence for. */
export async function buildRunClaims(root) {
  const { readHistoryPartitions } = await import('./backfill-recommendations.mjs');
  const { foldLedger } = await import('./evaluate-recommendations.mjs');
  const ledger = foldLedger(readHistoryPartitions(root));
  const openInstruments = new Set();
  let openCount = 0;
  for (const entry of ledger.values()) {
    if (entry.closed || !entry.body) continue;
    openCount++;
    const body = entry.body;
    const levels = Array.isArray(body.levels) ? body.levels : [];
    for (const symbol of [body.instrument, ...levels.map((level) => level.instrument)]) {
      if (typeof symbol === 'string' && symbol.length) openInstruments.add(symbol);
    }
  }
  return { claims: { openCount, openedThisRun: null, resolvedThisRun: null }, openInstruments };
}

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

/* Full intraday OHLCV — the session-auction model needs highs, lows and volume, which the close-only
   yahooRows projection discards. No same-origin intraday snapshot exists, so this is the only real
   source; on failure the caller degrades honestly rather than generating bars. */
async function yahooIntradayBars(sym, range = '5d', interval = '5m') {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${range}&interval=${interval}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) throw new Error('http ' + r.status);
    const j = await r.json();
    const res = j.chart.result[0], t = res.timestamp || [], q = res.indicators.quote[0];
    const bars = [];
    for (let i = 0; i < t.length; i++) {
      const o = q.open[i], h = q.high[i], l = q.low[i], c = q.close[i], v = q.volume[i];
      if (![o, h, l, c].every(Number.isFinite)) continue;
      bars.push({ t: t[i] * 1000, o, h, l, c, v: Number.isFinite(v) ? v : 0 });
    }
    return bars;
  } catch (e) { return null; }
}

/* Group intraday bars into ET civil sessions — the boundary the auction model reasons about. */
function groupIntradaySessions(bars) {
  const byDay = new Map();
  for (const bar of bars) {
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(bar.t));
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(bar);
  }
  return [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([key, sessionBars]) => ({ key, bars: sessionBars }));
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
  const empty = { annVol: null, cagr: null, annArith: null, sharpe: null, sharpeGeometric: null, drag: null };
  if (!rows || rows.length < 3) return empty;
  const cutoff = rows[rows.length - 1].t - 365 * 864e5, windowRows = rows.filter((row) => row.t >= cutoff);
  if (windowRows.length < 3) return empty;
  const returns = RLMETRICS.returnsFromCloses(windowRows);
  const annVol = RLMETRICS.annualizedVol(returns);
  const annArith = RLMETRICS.annualizedArithmetic(returns);
  const years = (windowRows[windowRows.length - 1].t - windowRows[0].t) / (365.25 * 864e5);
  const compounded = RLMETRICS.cagr(windowRows[0].c, windowRows[windowRows.length - 1].c, years);
  // `sharpe` is the arithmetic default. The geometric form is kept and LABELLED because this window
  // read is what the ETF ranking has always used; publishing both ends the ambiguity without
  // silently re-ranking the funds.
  return {
    annVol, cagr: compounded, annArith,
    sharpe: RLMETRICS.sharpeArithmetic(returns, RLMETRICS.TRADING_DAYS, riskFree),
    sharpeGeometric: RLMETRICS.sharpeGeometric(compounded, annVol, riskFree),
    drag: RLMETRICS.volatilityDrag(returns)
  };
}

export async function buildEtfToolRead(deps = {}) {
  try {
    const universe = deps.universe || JSON.parse(read('etf-universe.json'));
    const model = deps.model || featureRequire('../rlexperience-adapters/macro-rotation.js');
    const rowsFor = typeof deps.rowsFor === 'function' ? deps.rowsFor : yahooRowsMemo;
    const rows = [];
    for (const fund of (universe.etfs || []).filter((entry) => entry.on)) {
      const bars = await rowsFor(fund.ticker); if (!bars || bars.length < 127) continue;
      const trailing = { '3M': calendarReturnDecimal(bars, 91), '6M': calendarReturnDecimal(bars, 182), '1Y': calendarReturnDecimal(bars, 365) };
      const windowMetrics = oneYearWindowMetrics(bars, universe.riskFree || 0), annVol = windowMetrics.annVol;
      // The composite score has always ranked on the GEOMETRIC Sharpe, so it is named explicitly
      // here. Switching it to the arithmetic default would silently re-rank the funds.
      const metrics = { trailing, annVol, sharpe: windowMetrics.sharpeGeometric };
      const signal = model.etfMomentumSignal(metrics, '6M'), score = model.etfCompositeScore(metrics, '6M', 'balanced');
      if (Number.isFinite(score)) rows.push({ ticker: fund.ticker, signal: round(signal * 100), score: round(score, 4), annVol: round(annVol * 100), sharpeGeometric: round(windowMetrics.sharpeGeometric, 3), sharpeArithmetic: round(windowMetrics.sharpe, 3), volatilityDrag: round(windowMetrics.drag * 100), asOf: latestIso(bars) });
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
    const names = ['globalTrailingPct', 'globalAnnualVol', 'globalMaxDrawdown', 'globalTrendState', 'globalMomentumScore', 'globalRiskQuality', 'postureWeights'];
    const model = loadToolFunctions('global-rotation-lab.html', names);
    const RLFX = createRequire(import.meta.url)('../rlfx.js');
    const benchmark = universe.defaultBenchmark || 'ACWI', benchmarkRows = await yahooRowsMemo(benchmark);
    const decisionTime = new Date().toISOString();
    const countries = [];
    const meta = new Map();
    for (const entry of (universe.entries || []).filter((item) => item.kind === 'country')) {
      const bars = await yahooRowsMemo(entry.ticker);
      const fxBars = entry.fxSource ? await yahooRowsMemo(entry.fxSource.symbol) : [];
      if (!bars || !benchmarkRows) continue;
      const relative = (lookback) => { const own = model.globalTrailingPct(bars, lookback), control = model.globalTrailingPct(benchmarkRows, lookback); return Number.isFinite(own) && Number.isFinite(control) ? own - control : null; };
      const rel21 = relative(21), rel63 = relative(63), rel126 = relative(126), trend = model.globalTrendState(bars, 'balanced');
      const vol = model.globalAnnualVol(bars, 63), drawdown = model.globalMaxDrawdown(bars, 252);
      const momentum = model.globalMomentumScore(rel21, rel63, rel126, 63), risk = model.globalRiskQuality(vol, drawdown);
      if (!Number.isFinite(momentum)) continue;
      meta.set(entry.ticker, { entry, rel21, rel63, rel126, trend, vol, drawdown, bars });
      countries.push({
        ticker: entry.ticker,
        country: entry.country,
        currency: entry.currency || entry.ticker,
        etfRows: bars,
        benchmarkRows,
        fxRows: entry.fxSource ? (fxBars || []) : [],
        fxSourceOrientation: entry.fxSource ? { base: entry.fxSource.base, quote: entry.fxSource.quote } : null,
        momentum,
        trend: trend?.score,
        risk,
        usdFreshUntil: null,
        fxFreshUntil: null
      });
    }
    if (!countries.length) throw new Error('no scorable country');
    /* RLFX owns scoring and both nested products. The projection preserves the two-leg and
       three-leg objects with their own clocks; it never flattens or re-stamps them. */
    const rotation = RLFX.computeGlobalRotation({
      decisionTime,
      horizonSessions: 63,
      posture: 'balanced',
      benchmark,
      postureWeights: model.postureWeights('balanced'),
      agreementDeadbandPct: 0.25,
      countries
    });
    const projected = RLFX.projectGlobalToolRead(rotation);
    const rows = rotation.ranked.map((entry) => {
      const m = meta.get(entry.ticker);
      return { ticker: entry.ticker, country: entry.country, score: round(entry.score, 1), rel21: round(m?.rel21), rel63: round(m?.rel63), rel126: round(m?.rel126), trend: m?.trend?.label || null, vol: round(Number.isFinite(m?.vol) ? m.vol * 100 : null), maxDrawdown: round(Number.isFinite(m?.drawdown) ? m.drawdown * 100 : null), asOf: latestIso(m?.bars) };
    });
    const leader = rows[0], runner = rows[1];
    return { id: 'global-rotation-lab', asOf: leader?.asOf || decisionTime, read: leader ? `${leader.ticker} (${leader.country}) leads global rotation at ${leader.score}/100 versus ${benchmark}${runner ? `; ${runner.ticker} is next` : ''}.` : 'Global rotation read unavailable.', metrics: { benchmark, leader: leader || null, ranked: rows.slice(0, 6), scored: rows.length, usdLeadership: rotation.leader ? rotation.leader.usdLeadership : null, decomposition: rotation.leader ? rotation.leader.decomposition : null, projection: projected }, deepLink: 'global-rotation-lab.html', source: 'owning-tool-functions' };
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
    return { id: 'real-assets-lab', asOf: leader?.asOf || new Date().toISOString(), read: leader ? `${leader.ticker} leads real assets at ${leader.score}/100; GLD ${specific.GLD?.score ?? '—'}, BTC ${specific['BTC-USD']?.score ?? '—'}, SLV ${specific.SLV?.score ?? '—'}.` : 'Real-assets model unavailable.', metrics: { leader: leader || null, ranked: rows.slice(0, 6), specific, scored: rows.length, horizon: 'swing', drivers }, deepLink: 'real-assets-lab.html', source: 'owning-tool-functions' };
  } catch (error) { return { id: 'real-assets-lab', asOf: new Date().toISOString(), read: 'Real-assets model unavailable this run.', metrics: { error: error.message }, deepLink: 'real-assets-lab.html', source: 'owning-tool-functions' }; }
}

/* ─────────────────────────────────────────────────────────────────────────────────────────────────
   Feature 026 Scope 2 — Tier-A cross-asset measurement.

   This is the MEASUREMENT half only. It produces numbers and carries forward what the FX and bond
   models already published; it composes no reader sentence and it writes no payload. The payload is
   written by scripts/brief-narrative-parallel.mjs, which calls rlcockpit.js `resolveLeg` over what
   lands here. That split is finding R-5 and it is why `changePct` can be null on the way out: an
   absence travels as an absence, and the resolver turns it into a dark state rather than a zero.

   Reachability, not existence, is the admission test for a measured driver. `bars` is built by the
   same real-assets-universe.json iteration buildRealAssetsToolRead uses, so a symbol the universe
   does not declare is out of reach here no matter what sits in data/bars — and this feature may not
   widen that universe, which is an owner artifact.
   ───────────────────────────────────────────────────────────────────────────────────────────────── */
export async function buildCrossAssetReadings(rawDeps) {
  const deps = rawDeps || {};
  const policy = deps.policy !== undefined
    ? deps.policy
    : (JSON.parse(read('market-brief.config.json'))['cross-asset/v1'] || null);
  if (!policy || !Array.isArray(policy.legs) || !Number.isFinite(policy.sessions)) return null;

  const universe = deps.universe !== undefined ? deps.universe : JSON.parse(read('real-assets-universe.json'));
  const declared = new Set((universe.entries || []).map((entry) => entry.symbol));
  const model = deps.model !== undefined ? deps.model : loadToolFunctions('real-assets-lab.html', ['realTrailingPct']);
  const bars = {};
  if (deps.bars !== undefined) Object.assign(bars, deps.bars);
  else for (const entry of (universe.entries || [])) bars[entry.symbol] = await yahooRowsMemo(entry.symbol);

  const horizon = Math.floor(policy.sessions);
  const longHorizon = Number.isFinite(policy.longSessions) ? Math.floor(policy.longSessions) : null;
  /* The 63-session value the SCORING path already consumes, published rather than discarded. The
     bundle carries a TLT figure and carries none for USO, so the rates leg reuses a computed value
     and the energy leg makes a fresh call to the SAME owner function: one definition, two callers. */
  const scoringDrivers = deps.realAssetsRead?.metrics?.drivers || null;
  const finite = (value) => (Number.isFinite(value) ? round(value, 2) : null);

  const measureLeg = (leg) => {
    const rows = Object.prototype.hasOwnProperty.call(bars, leg.driver) ? bars[leg.driver] : null;
    const closes = Array.isArray(rows) ? rows.length : 0;
    /* `sessions` is the trailing span the published change was actually computed over, never the
       requested 5. Below the requested span the leg publishes partial with the real number. */
    const span = Math.min(horizon, closes - 1);
    const usable = span >= 1 ? span : null;
    const long = leg.id === 'rates' && scoringDrivers
      ? scoringDrivers.tlt63
      : (longHorizon !== null && closes > longHorizon ? model.realTrailingPct(rows, longHorizon) : null);
    return {
      driver: leg.driver,
      declaredByUniverse: declared.has(leg.driver),
      closes,
      sessions: usable,
      changePct: usable === null ? null : finite(model.realTrailingPct(rows, usable)),
      long63Pct: finite(long),
      long63Source: leg.id === 'rates' && scoringDrivers ? 'real-assets-lab.metrics.drivers.tlt63' : 'realTrailingPct(bars,63)',
      asOf: latestIso(rows)
    };
  };

  /* The dollar leg's dark reason is the FX read's OWN published sentence, and the basis beside it is
     read out of the committed universe records. Nothing here composes a claim about the dollar. */
  const fxRead = deps.fxRead || null;
  const fxUniverse = deps.fxUniverse !== undefined ? deps.fxUniverse : JSON.parse(read('fx-regime-universe.json'));
  const broadDollarSources = (fxUniverse.evidenceSources || []).filter((source) => source.family === 'broad-dollar');
  const darkMeasurement = () => ({
    reason: typeof fxRead?.read === 'string' ? fxRead.read : '',
    approvedBroadDollarSources: broadDollarSources.filter((source) => source.activation === 'approved').length,
    basis: broadDollarSources.map((source) => ({
      sourceId: source.sourceId, activation: source.activation, persistence: source.persistence
    }))
  });

  /* The credit leg carries the bond model's own classification for its declared pair, plus that
     model's own evidenceGaps entry as the confirmation detail. No ratio is recomputed here. */
  const bondRead = deps.bondRead || null;
  const CREDIT_SPREAD_GAP = 'an independent credit-spread reading';
  const carriedMeasurement = (leg) => {
    const metrics = bondRead?.metrics || null;
    const pair = (metrics?.readablePairs || []).find((entry) => entry && entry.pairId === leg.carriedPairId) || null;
    if (!pair) return null;
    const gaps = Array.isArray(metrics.evidenceGaps) ? metrics.evidenceGaps : [];
    const gap = gaps.find((entry) => entry === CREDIT_SPREAD_GAP) || null;
    return {
      pairId: pair.pairId, direction: pair.direction, purity: pair.purity, asOf: pair.asOf,
      confirmation: gap === null ? { state: 'present', detail: null } : { state: 'absent', detail: gap }
    };
  };

  const legs = {};
  for (const leg of policy.legs) {
    if (!leg || typeof leg.id !== 'string') continue;
    if (leg.shape === 'measured') legs[leg.id] = measureLeg(leg);
    else if (leg.shape === 'dark') legs[leg.id] = darkMeasurement();
    else if (leg.shape === 'carried') legs[leg.id] = carriedMeasurement(leg);
  }

  /* FR-026-019 — the standing instruction gains exactly one mechanical consequence. Its crude half
     resolves through the leg it is bound to; the halves no committed source covers are published by
     name every run instead of being quietly dropped. */
  const macroEvents = deps.macroEvents !== undefined
    ? deps.macroEvents
    : (JSON.parse(read('market-brief.config.json')).macroEvents || []);
  const standing = macroEvents
    .filter((event) => event && typeof event.boundTo === 'string' && event.boundTo.length)
    .map((event) => ({
      date: event.date, type: event.type, boundTo: event.boundTo,
      unresolvedAspects: Array.isArray(event.unresolvedAspects) ? event.unresolvedAspects.slice() : []
    }));

  return { contractVersion: 'cross-asset-measurement/v1', sessions: horizon, longSessions: longHorizon, legs, standing };
}

/* ─────────────────────────────────────────────────────────────────────────────────────────────────
   Owning-model Tier-A reads.

   Each of these runs the OWNING TOOL'S OWN exported model over committed same-origin evidence and
   publishes what that model returned. No formula is reimplemented here, and a model that cannot
   reach a read says so with a named reason — the brief then reports an honest absence instead of
   narrating around a gap, which is what "stale this window" used to mean in practice.
   ───────────────────────────────────────────────────────────────────────────────────────────────── */

/** An honest empty read: the tool is covered, and the reason it produced nothing is stated. */
function unavailableToolRead(id, deepLink, reason) {
  return { id, asOf: new Date().toISOString(), read: reason, metrics: { state: 'unavailable', reason }, deepLink, source: 'owning-tool-functions', state: 'unavailable' };
}

export function buildOptionsSurfaceToolRead(deps = {}) {
  const id = 'options-structure-lab', deepLink = 'options-structure-lab.html';
  try {
    const root = deps.root || ROOT;
    const symbol = deps.symbol || 'SPY';
    const ownerState = OWNER.surfaceOwnerState(root, symbol);
    if (!ownerState) return unavailableToolRead(id, deepLink, `No committed option snapshot for ${symbol}; the surface model has no chain to price.`);
    const model = OWNER.loadAdapter(root, 'rlexperience-adapters/options.js');
    const summary = model.computeSurfaceSummary(JSON.parse(JSON.stringify(ownerState)), OWNER.registryDefaults(root, 'simple-adapter/options-surface/v1'));
    if (!summary || summary.surface.state !== 'ready') return unavailableToolRead(id, deepLink, `The ${symbol} option surface did not reach a ready state this run.`);
    const { walls, gammaFlip, expectedMove } = summary;
    const read = `${symbol} sits in ${gammaFlip.regime} dealer gamma with the flip near ${round(gammaFlip.flipLevel, 2)}; call wall ${walls.callWall ?? '—'}, put wall ${walls.putWall ?? '—'}, front expected move ±${round(expectedMove.em, 2)}.`;
    return {
      id, asOf: ownerState.asOf, read, deepLink, source: 'owning-tool-functions', state: 'ready',
      metrics: {
        symbol, spot: round(ownerState.spot, 2), regime: gammaFlip.regime,
        flipLevel: round(gammaFlip.flipLevel, 2), signedNetGEX: gammaFlip.signedNetGEX,
        callWall: walls.callWall, putWall: walls.putWall,
        expectedMove: round(expectedMove.em, 2), atmIV: round(expectedMove.atmIV, 4),
        expiriesPriced: ownerState.chains.length
      }
    };
  } catch (error) { return unavailableToolRead(id, deepLink, `Options surface model unavailable this run: ${error.message}`); }
}

export function buildGammaToolRead(deps = {}) {
  const id = 'gamma-trading-lab', deepLink = 'gamma-trading-lab.html';
  try {
    const root = deps.root || ROOT;
    const symbol = deps.symbol || 'SPY';
    const ownerState = OWNER.gammaOwnerState(root, symbol);
    if (!ownerState) return unavailableToolRead(id, deepLink, `No committed option snapshot for ${symbol}; the dealer-gamma playbook has no snapshot to read.`);
    const model = OWNER.loadAdapter(root, 'rlexperience-adapters/options.js');
    const summary = model.computeGammaPlaybookSummary(JSON.parse(JSON.stringify(ownerState)), OWNER.registryDefaults(root, 'simple-adapter/dealer-gamma-playbook/v1'));
    if (!summary || summary.gammaState.state !== 'ready') return unavailableToolRead(id, deepLink, `The ${symbol} dealer-gamma regime is unreadable from the committed snapshot.`);
    const { playbook, gammaState, oviState, opex } = summary;
    const read = `${symbol} dealers are ${playbook.gammaRegime} gamma — playbook ${playbook.scenario}, conviction ${playbook.conviction}; flip ${round(ownerState.snap.flip, 2)}, walls ${ownerState.snap.putWall ?? '—'}/${ownerState.snap.callWall ?? '—'}.`;
    return {
      id, asOf: ownerState.asOf, read, deepLink, source: 'owning-tool-functions', state: 'ready',
      metrics: {
        symbol, regime: playbook.gammaRegime, scenario: playbook.scenario,
        conviction: playbook.conviction, hold: playbook.hold,
        signedNetGEX: gammaState.signedNetGEX, flipPresent: gammaState.flipPresent,
        flip: round(ownerState.snap.flip, 2), callWall: ownerState.snap.callWall, putWall: ownerState.snap.putWall,
        // The OVI percentile needs a rolling snapshot history the server does not keep; the model
        // reports that absence itself rather than showing an invented percentile.
        oviState: oviState ? oviState.state : 'unavailable',
        opexWindow: opex ? opex.label || null : null
      }
    };
  } catch (error) { return unavailableToolRead(id, deepLink, `Dealer-gamma model unavailable this run: ${error.message}`); }
}

/* The freshness rule the owner-read producers already apply (scripts/build-owner-reads.mjs
   FRESH_MAX_DAYS): a snapshot older than this reads as a reasoned gap, never as something current.
   The anomaly model's registry entry declares its owner evidence stalePolicy `reject`, so a stale
   tape has to surface as a named absence rather than as an analysis of yesterday's flow. */
const OWNER_SNAPSHOT_FRESH_MAX_DAYS = 7;

export function buildOptionsFlowToolRead(deps = {}) {
  const id = 'options-flow-feed-lab', deepLink = 'options-flow-feed-lab.html';
  try {
    const root = deps.root || ROOT;
    // The page's own chain projection — loaded, not reimplemented, so Simple, Power and the brief
    // all read one parser.
    const page = loadToolFunctions('options-flow-feed-lab.html', ['parsePagesChain']);
    const ownerState = OWNER.optionsFlowOwnerState(root, { parseChain: page.parsePagesChain, universe: deps.universe });
    if (!ownerState) return unavailableToolRead(id, deepLink, 'No committed option chain for the tickers this feed scans; there is no tape to read for unusual activity.');

    const ageDays = (Date.parse(deps.asOf || new Date().toISOString()) - ownerState.nowMs) / 86400000;
    if (!Number.isFinite(ageDays) || ageDays > OWNER_SNAPSHOT_FRESH_MAX_DAYS) {
      return unavailableToolRead(id, deepLink, `The newest option chain on file is ${Number.isFinite(ageDays) ? `${Math.round(ageDays)} days` : 'undated'} old; unusual activity is not read off a stale tape.`);
    }

    const model = OWNER.loadAdapter(root, 'rlexperience-adapters/options.js');
    const summary = model.computeAnomalySummary(JSON.parse(JSON.stringify(ownerState)), OWNER.registryDefaults(root, 'simple-adapter/options-anomaly/v1'));
    if (!summary || summary.unusualness.state !== 'ready') return unavailableToolRead(id, deepLink, 'No contract in the committed chains expires inside the scanned window, so there is nothing to rank for unusual activity.');

    const { contracts, unusualness, callPutLean } = summary;
    const money = (value) => (Number.isFinite(value) ? (Math.abs(value) >= 1e6 ? `$${(value / 1e6).toFixed(1)}M` : `$${Math.round(value / 1000)}k`) : '—');
    const top = contracts.top[0] || null;
    // The model ranks by unusualness, not by size, so the headline names WHY this contract is first
    // — calling it the largest would misread the ranking it came from.
    const headline = top
      ? `${top.ticker} ${top.strike} ${top.type === 'C' ? 'calls' : 'puts'} at ${money(top.premium)} on ${Number.isFinite(top.volOI) ? `${top.volOI.toFixed(1)}× its open interest` : 'volume with no open interest behind it'}`
      : null;
    const read = `Option flow is ${callPutLean.lean} across ${ownerState.chains.length} tickers: ${contracts.count} ${contracts.count === 1 ? 'contract clears' : 'contracts clear'} the ${money(contracts.premiumThreshold)} premium bar inside ${contracts.windowDays} days${headline ? `; the most unusual is ${headline}` : ''}.`;
    return {
      id, asOf: ownerState.asOf, read, deepLink, source: 'owning-tool-functions', state: 'ready',
      metrics: {
        tickers: ownerState.chains.length,
        contractsFlagged: contracts.count,
        windowDays: contracts.windowDays,
        premiumThreshold: contracts.premiumThreshold,
        lean: callPutLean.lean,
        callPremium: callPutLean.callPremium,
        putPremium: callPutLean.putPremium,
        // Present only while the registry keeps calls and puts separate; a netted run reports
        // netPremium instead, and neither shape is padded with a stand-in for the other.
        callFraction: callPutLean.callFraction ?? null,
        netPremium: callPutLean.netPremium ?? null,
        consideredCount: unusualness.consideredCount,
        clearedCount: unusualness.clearedCount,
        clearedFraction: unusualness.clearedFraction,
        maxScore: unusualness.maxScore,
        top: contracts.top.slice(0, 3)
      }
    };
  } catch (error) { return unavailableToolRead(id, deepLink, `Options flow model unavailable this run: ${error.message}`); }
}

/* ai-capex-strategy-lab is registered `profile: static-model` with `freshnessPolicy:
   static-model-asof-v1` (tools.json), NOT the `daily-market-bars-v1` clock the 7-day snapshot rule
   above governs. Its evidence is a quarter-cadence set of supplier assumptions whose declared as-of
   is a quarter end — the same date the tool's own registry entry carries as `updated`. The registry
   names that policy but declares no number anywhere in the repo, so the age this adapter will still
   publish is stated here: one calendar quarter. Past that the universe has missed its own refresh
   and is refused by name rather than published as a current view. Applying the 7-day bar rule
   instead would make a quarterly universe permanently unreadable — a category error, not caution.
   The edge is inclusive: 92 days old still reads, 93 days old is refused. */
const STATIC_MODEL_ASOF_FRESH_MAX_DAYS = 92;

export function buildAiCapexToolRead(deps = {}) {
  const id = 'ai-capex-strategy-lab', deepLink = 'ai-capex-strategy-lab.html';
  try {
    const root = deps.root || ROOT;
    // The page's own universe loader, preset, scenario/regime/runway horizon model and owner-state
    // provider — loaded, not reimplemented, so Simple, Power and the brief read one scenario model.
    const file = 'ai-capex-strategy-lab.html';
    const tables = ['HORIZONS', 'TRIG_FRAC', 'SCEN', 'ASSETS', 'PRESETS', 'CROWDING', 'UNIVERSE_AS_OF', 'UNIVERSE_SOURCE', 'state', 'byTk', 'REGIME_PERSIST', 'RESOURCE_RUNWAY'];
    const helpers = ['clamp', 'applyPreset', 'normalizeWeights', 'runwayFor', 'assetHorizon', 'included', 'acValidUniverseAsset', 'acApplyUniverse', 'aiCapexOwnerState'];
    const page = loadToolFunctions(file, helpers, loadToolDeclarations(file, tables));

    const universe = deps.universe !== undefined ? deps.universe : OWNER.aiCapexUniverse(root);
    if (!universe) return unavailableToolRead(id, deepLink, 'No committed AI-capex universe on file; the strategy model has no supplier assumptions to price.');
    const ownerState = OWNER.aiCapexOwnerState(root, { page, universe });
    if (!ownerState) return unavailableToolRead(id, deepLink, 'The committed AI-capex universe carries no asset this tool can price, so it publishes no sleeve.');

    // The universe declares its OWN cutoff; the age is measured against that declaration, never
    // against the moment this refresh happened to run.
    const declaredAsOf = String(ownerState.asOf);
    const stamped = /^\d{4}-\d{2}-\d{2}$/.test(declaredAsOf) ? `${declaredAsOf}T00:00:00Z` : declaredAsOf;
    const ageDays = (Date.parse(deps.asOf || new Date().toISOString()) - Date.parse(stamped)) / 86400000;
    if (!Number.isFinite(ageDays) || ageDays > STATIC_MODEL_ASOF_FRESH_MAX_DAYS) {
      return unavailableToolRead(id, deepLink, `The AI-capex universe is dated ${declaredAsOf}, ${Number.isFinite(ageDays) ? `${Math.round(ageDays)} days` : 'an unreadable age'} old and past its quarterly refresh; a superseded set of supplier assumptions is not shown as a current view.`);
    }

    const model = OWNER.loadAdapter(root, 'rlexperience-adapters/fundamental-models.js');
    const summary = model.computeAiCapexSummary(JSON.parse(JSON.stringify(ownerState)), OWNER.registryDefaults(root, 'simple-adapter/ai-capex-portfolio/v1'));
    if (!summary || !summary.pricedCount || !Number.isFinite(summary.distribution.median)) return unavailableToolRead(id, deepLink, 'The AI-capex strategy model priced no name in the committed universe, so it reached no portfolio view.');

    const { beneficiaries, portfolio, distribution } = summary;
    const lead = beneficiaries[0] || null;
    const pct = (value) => (Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : '—');
    // Reader copy names the basis first: these are scenario assumptions carried by a dated universe,
    // not a measurement taken off market bars. A reader who skips the rest still gets that much.
    const read = `AI-capex beneficiaries, modelled on the ${declaredAsOf} universe of supplier assumptions rather than measured market returns: ${lead ? `${lead.theme} leads the mix at ${pct(lead.weight)}` : 'no theme leads the mix'} across ${summary.pricedCount} priced ${summary.pricedCount === 1 ? 'name' : 'names'} of ${summary.assetCount}; over the ${summary.horizon} horizon the modelled band centres on ${pct(distribution.median)} (${pct(distribution.lo)} to ${pct(distribution.hi)}), a ${pct(distribution.prob)} chance of clearing the horizon target, with a worst-case tail at ${pct(distribution.cvar)}.`;
    return {
      id, asOf: declaredAsOf, read, deepLink, source: 'owning-tool-functions', state: 'ready',
      metrics: {
        basis: 'scenario-assumptions', universeSource: ownerState.source, universeAgeDays: Math.round(ageDays),
        horizon: summary.horizon, objective: portfolio.objective,
        assetCount: summary.assetCount, pricedCount: summary.pricedCount,
        // 'All' on the page singles out no theme, so the owner contract publishes null and the
        // model applies no theme tilt — that null is the page's own state, not a missing value.
        selectedTheme: summary.selectedTheme,
        leadTheme: lead ? lead.theme : null, leadWeight: lead ? lead.weight : null,
        beneficiaries: beneficiaries.slice(0, 3),
        mu: portfolio.mu, sd: portfolio.sd, effN: portfolio.effN,
        holdings: portfolio.holdings.slice(0, 5),
        median: distribution.median, lo: distribution.lo, hi: distribution.hi,
        prob: distribution.prob, cvar: distribution.cvar
      }
    };
  } catch (error) { return unavailableToolRead(id, deepLink, `AI-capex strategy model unavailable this run: ${error.message}`); }
}

/* Observed-cadence freshness admission (spec 018 Scope 3).

   Derives each family's freshness window from the family's OWN observed as-of
   progression rather than from a calendar. A weekend and a bond-market holiday
   are absorbed structurally, because each already appears in the data as a gap.

   The equity calendar at data/calendars/xnys/calendar.json is deliberately NOT
   consulted: it marks dates `regular` on which the bond market is closed and
   Treasury publishes nothing, so reading it would manufacture false staleness.
   This function opens no file at all — it is a pure function of
   (artifact, familyId, runDate), which is also what makes the verdict
   recomputable at every read as a committed artifact ages. */
export function admitCurveFamily(artifact, familyId, runDate) {
  const DAY_MS = 86400000;
  const absent = (basis) => ({
    verdict: 'undetermined',
    errorCode: 'BRL-CURVE-FRESHNESS-UNDERIVABLE',
    lastGoodObservedAt: null,
    elapsedDays: null,
    windowDays: null,
    basis
  });

  const family = artifact && artifact.families ? artifact.families[familyId] : null;
  if (!family) return absent('family-absent-from-artifact');

  const policy = (artifact && artifact.freshnessPolicy) || null;
  if (!policy) return absent('freshness-policy-absent-from-artifact');
  const cadenceWindowRows = Number(policy.cadenceWindowRows);
  const minCadenceObservations = Number(policy.minCadenceObservations);
  const publicationLagDays = Number(policy.publicationLagDays);
  if (![cadenceWindowRows, minCadenceObservations, publicationLagDays].every(Number.isFinite)) {
    return absent('freshness-policy-incomplete');
  }

  const rows = Array.isArray(family.rows) ? family.rows : [];
  if (!rows.length) return absent('no-observed-rows');

  const dates = rows.map((row) => row.date).filter((date) => typeof date === 'string');
  const lastObserved = dates[dates.length - 1];
  const utcDays = (date) => Math.floor(Date.parse(date + 'T00:00:00.000Z') / DAY_MS);
  const runDayText = runDate instanceof Date ? runDate.toISOString().slice(0, 10) : String(runDate).slice(0, 10);
  const elapsedDays = utcDays(runDayText) - utcDays(lastObserved);

  const trailing = dates.slice(-Math.max(2, cadenceWindowRows));
  const observedGaps = [];
  for (let index = 1; index < trailing.length; index += 1) {
    observedGaps.push(utcDays(trailing[index]) - utcDays(trailing[index - 1]));
  }
  if (observedGaps.length < minCadenceObservations) {
    return absent(`insufficient-observed-history-gaps-${observedGaps.length}-of-${minCadenceObservations}`);
  }

  const maxObservedGapDays = Math.max(...observedGaps);
  const windowDays = maxObservedGapDays + publicationLagDays;
  const basis = `observed-gap-max-${maxObservedGapDays}d-over-${observedGaps.length}-gaps-plus-lag-${publicationLagDays}d`;

  if (elapsedDays <= windowDays) {
    return { verdict: 'current', errorCode: null, lastGoodObservedAt: lastObserved, elapsedDays, windowDays, basis };
  }
  return { verdict: 'stale', errorCode: 'BRL-CURVE-FAMILY-STALE', lastGoodObservedAt: lastObserved, elapsedDays, windowDays, basis };
}

/* bond-regime-lab publishes a DECISION, and its own model refuses to reach one until three
   independent evidence families are current at once: an aligned credit price ratio, an independent
   credit-spread (or financial-conditions) observation, and a Treasury curve. This repo commits only
   the first. The two Treasury families are fetched live from home.treasury.gov straight into browser
   cache, and the spread observation is a current-tab entry the model's own source policy marks
   `memory-only` — neither has a same-origin file a server run could read. So this read is EXPECTED
   to land as a named absence rather than a verdict.

   That absence is computed, not asserted: the page's own curve, inflation, credit-regime and
   expression-selection code runs over whatever evidence it is handed, and the indeterminacy below is
   what it returns. Hand the same builder a curve and a spread observation and it publishes a real
   regime instead — which is exactly how the brief can be trusted when it says "unresolved". */
/* The bond regime read is EXPECTED to publish a named absence rather than a verdict. */
export function buildBondRegimeToolRead(deps = {}) {
  const id = 'bond-regime-lab', deepLink = 'bond-regime-lab.html#simple';
  const priorMacroRotation = globalThis.RLMACROROTATION;
  try {
    const root = deps.root || ROOT;
    // The page's own ratio alignment, curve/inflation/credit classifiers, scenario arithmetic,
    // expression selection, decision read and tool-read normaliser — loaded, not reimplemented, so
    // Simple, Power and the brief all reach one verdict.
    const file = 'bond-regime-lab.html';
    const helpers = [
      'finiteNumber', 'bpToDecimal', 'pctToDecimal', 'alignCommonDateRows', 'buildRatioSeries', 'rollingPercentile',
      'estimateDurationConfound', 'classifyRelativeCreditPulse', 'classifyCreditConfirmation', 'aggregateCreditConfirmations',
      'classifyCreditRegime', 'classifyCurveState', 'classifyCurveImpulse', 'deriveBreakevenRows', 'classifyInflationState',
      'classifyDurationPosture', 'scenarioShockForSleeve', 'solveBreakEvenShock', 'classifyReliability', 'calculateScenarioResult',
      'rankScenarioResults', 'selectResearchExpression', 'buildDecisionRead', 'publishRegimeFacets', 'buildBondToolRead', 'stableDecisionDigest',
      'instrumentIndex', 'computeCreditView', 'computeBondLabViewModel'
    ];
    // calculateScenarioResult single-sources its carry/rate/spread/convexity decomposition to
    // RLMACROROTATION and reads it as a global, exactly as the browser does. Binding the same
    // module here is what keeps a second sleeve-return formula from appearing in this file.
    globalThis.RLMACROROTATION = OWNER.loadAdapter(root, 'rlexperience-adapters/macro-rotation.js');
    const page = loadToolFunctions(file, helpers);

    const config = deps.config !== undefined ? deps.config : OWNER.bondRegimeConfig(root);
    if (!config || !Array.isArray(config.scenarioPresets) || !config.scenarioPresets.length) {
      return unavailableToolRead(id, deepLink, 'No committed bond model configuration on file; there are no sleeves, ratio pairs or policy thresholds to read a regime against.');
    }
    /* Official curve resolution (spec 018 Scope 4). Only on the `undefined` branch,
       mirroring the precedence bondRegimeOwnerState already uses — resolving on the
       explicit branch would silently override every injected adversarial fixture. */
    const curveRunDate = deps.runDate || new Date().toISOString().slice(0, 10);
    const curvePolicies = (config && config.sourcePolicies) || {};
    const curveArtifact = deps.officialCurveArtifact !== undefined
      ? deps.officialCurveArtifact
      : OWNER.officialCurveArtifact(root);
    const curveAdmission = {};

    /* A read-time contract check, independent of whether the gate ran in this process. It is the
       GATE'S OWN validator, so an artifact the gate would reject and an artifact refused here are
       decided by one predicate that cannot drift into two. Only the failure CLASS is carried into
       the reason — never the gate's detail text, which can quote a source URL or an observed value. */
    const curveArtifactErrors = curveArtifact ? validateOfficialCurves(curveArtifact, { universe: config }) : [];
    const curveArtifactFailureClass = curveArtifactErrors.length ? String(curveArtifactErrors[0]).split(' at ')[0] : null;
    const artifactShapeValid = !!curveArtifact && curveArtifactErrors.length === 0;

    const resolveCurveFamily = (familyKey, policyKey, absentCode) => {
      const policy = curvePolicies[policyKey] || null;
      if (!curveArtifact) {
        curveAdmission[familyKey] = { verdict: 'unavailable', errorCode: 'BRL-CURVE-ARTIFACT-ABSENT', lastGoodObservedAt: null, elapsedDays: null, windowDays: null, basis: 'no-committed-artifact' };
        return OWNER.unavailableCurveFamily(policy, absentCode);
      }
      if (!artifactShapeValid) {
        curveAdmission[familyKey] = { verdict: 'unavailable', errorCode: 'BRL-CURVE-ARTIFACT-INVALID', lastGoodObservedAt: null, elapsedDays: null, windowDays: null, basis: 'artifact-rejected-by-contract-gate:' + curveArtifactFailureClass };
        return OWNER.unavailableCurveFamily(policy, 'BRL-CURVE-ARTIFACT-INVALID');
      }
      const family = curveArtifact.families[familyKey];
      const admission = admitCurveFamily(curveArtifact, familyKey, curveRunDate);
      curveAdmission[familyKey] = admission;
      if (!family || family.state !== 'fresh' || admission.verdict !== 'current') {
        return OWNER.unavailableCurveFamily(policy, admission.errorCode || absentCode);
      }
      return {
        state: 'ready',
        rows: family.rows,
        observedAt: family.observedAt,
        retrievedAt: (family.provenance && family.provenance.length) ? family.provenance[family.provenance.length - 1].retrievedAt : null,
        sourceId: family.sourceId,
        sourceUrl: null,
        rights: family.rights,
        persistence: family.persistence,
        errorCode: null
      };
    };

    const resolvedNominal = deps.nominalCurve !== undefined ? deps.nominalCurve : resolveCurveFamily('nominal', 'nominalCurve', 'BRL-CURVE-NOMINAL-UNAVAILABLE');
    const resolvedReal = deps.realCurve !== undefined ? deps.realCurve : resolveCurveFamily('real', 'realCurve', 'BRL-OPTIONAL-UNAVAILABLE');

    const snapshot = deps.snapshot !== undefined ? deps.snapshot : OWNER.bondRegimeOwnerState(root, {
      config, confirmations: deps.confirmations, nominalCurve: resolvedNominal, realCurve: resolvedReal
    });
    if (!snapshot) return unavailableToolRead(id, deepLink, 'No committed price history for the bond sleeves this tool tracks; there is nothing to read a credit or duration regime from.');

    // The page's OWN default scenario: the first committed preset, which is what its init applies
    // before a reader touches a lever. Every scenario number below is the model's under that preset.
    const assumptions = Object.assign({}, deps.assumptions || config.scenarioPresets[0]);
    const viewModel = page.computeBondLabViewModel(config, snapshot, assumptions, {});
    const normalized = page.buildBondToolRead(viewModel.decisionRead);
    const { creditRegime, durationPosture, curveState, curveImpulse, inflationState } = viewModel;

    // The credit ratios the model actually aligned and reached a direction on, and ITS aggregate
    // direction across them. The word in the read is the model's own, never chosen here.
    const readablePairs = (viewModel.pulses || []).filter((pulse) => pulse && pulse.state === 'ready' && pulse.direction !== 'unavailable');

    // Each gap is named from the model's OWN state, so the sentence cannot claim an absence the
    // model did not report — nor stay silent about one it did.
    const gaps = [];
    if (curveState.state === 'Unavailable' || curveImpulse.state === 'Unavailable') gaps.push('the Treasury yield curve');
    if (inflationState.state === 'Unavailable') gaps.push('real yields and inflation break-evens');
    if ((creditRegime.missing || []).includes('independent-credit-confirmation')) gaps.push('an independent credit-spread reading');
    if ((creditRegime.missing || []).includes('relative-price-pulse')) gaps.push('an aligned credit price ratio');
    const list = (items) => (items.length < 2 ? items[0] || '' : items.length === 2 ? `${items[0]} or ${items[1]}` : `${items.slice(0, -1).join(', ')}, or ${items[items.length - 1]}`);

    // "The one thing that does read" is only true while every OTHER family is missing. Handed a
    // curve or a spread observation the same sentence has to stop claiming exclusivity.
    const soleReadableSignal = gaps.includes('the Treasury yield curve') && gaps.includes('an independent credit-spread reading');
    const ratioClause = readablePairs.length && creditRegime.pricePulseState !== 'unavailable'
      ? `${soleReadableSignal ? 'The one thing that does read is' : 'What does read is'} the high-yield versus investment-grade price ratio, which the model reads as ${creditRegime.pricePulseState} across ${readablePairs.length === 1 ? 'its one aligned pair' : readablePairs.length === 2 ? 'both aligned pairs' : `all ${readablePairs.length} aligned pairs`} through ${creditRegime.asOf}.`
      : 'Not even the high-yield versus investment-grade price ratio aligns, so no side of the regime has current evidence behind it.';

    const scenarioLabel = assumptions.label || assumptions.id || 'default';
    const metrics = {
      creditRegime: normalized.metrics.creditRegime,
      durationPosture: normalized.metrics.durationPosture,
      confidence: normalized.metrics.confidence,
      pricePulse: creditRegime.pricePulseState,
      confirmationState: normalized.metrics.confirmationState,
      curveState: curveState.state, curveImpulse: curveImpulse.state, inflationState: inflationState.state,
      // Additive (spec 018 Scope 4): why each curve family was admitted or withheld. Nothing
      // above is renamed, retyped or removed by its presence.
      curveAdmission,
      readablePairs: readablePairs.map((pulse) => ({ pairId: pulse.pairId, direction: pulse.direction, purity: pulse.purity, asOf: pulse.latestCommonDate })),
      // Named absences, from the model's own missing list plus the two curve families it could not
      // classify. Empty when nothing is missing — never a zero and never a neutral stand-in.
      evidenceGaps: gaps, modelMissing: creditRegime.missing || [],
      scenarioId: normalized.metrics.scenarioId, scenarioLabel, horizonMonths: normalized.metrics.horizonMonths,
      preferredSleeveId: normalized.metrics.preferredSleeveId, resultPct: normalized.metrics.resultPct,
      conflictCount: normalized.metrics.conflictCount,
      ratioAsOf: normalized.metrics.ratioAsOf, curveAsOf: normalized.metrics.curveAsOf, barsAsOf: snapshot.asOf,
      indeterminateReason: normalized.metrics.indeterminateReason
    };
    const asOf = normalized.asOf || snapshot.asOf;

    // The model's OWN determinacy verdict: its expression selector returns nothing while either
    // axis is Indeterminate, and the page's normaliser nulls the sleeve when it does.
    if (!normalized.metrics.preferredSleeveId) {
      // Which axis is unresolved is the model's verdict, not a fixed phrase: handed a curve the
      // duration call resolves, handed a spread observation the credit call does.
      const unresolvedAxes = [];
      if (creditRegime.state === 'Indeterminate') unresolvedAxes.push('the credit call');
      if (durationPosture.state === 'Indeterminate') unresolvedAxes.push('the duration call');
      const consequence = unresolvedAxes.length
        ? `so ${unresolvedAxes.join(' and ')} cannot be made`
        : 'so no sleeve clears the model\u2019s own eligibility test';
      const reason = gaps.length
        ? `nothing on file covers ${list(gaps)}, ${consequence}`
        : `the model found no policy-eligible sleeve under its own ${scenarioLabel} scenario`;
      return { id, asOf, read: `The bond regime is unresolved: ${reason}. ${ratioClause}`, deepLink, source: 'owning-tool-functions', state: 'unavailable', metrics: { state: 'unavailable', ...metrics } };
    }

    const expression = viewModel.decisionRead.expression;
    const signed = (value) => (Number.isFinite(value) ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%` : '—');
    const read = `Bond regime: ${creditRegime.state} credit, ${durationPosture.state} duration, ${String(normalized.metrics.confidence).toLowerCase()} confidence; the leading policy-eligible sleeve is ${expression.label} at ${signed(expression.totalPct)} over ${assumptions.horizonMonths} months under the ${scenarioLabel} scenario.`;
    return { id, asOf, read, deepLink, source: 'owning-tool-functions', state: 'ready', metrics };
  } catch (error) {
    return unavailableToolRead(id, deepLink, `Bond regime model unavailable this run: ${error.message}`);
  } finally {
    if (priorMacroRotation === undefined) delete globalThis.RLMACROROTATION;
    else globalThis.RLMACROROTATION = priorMacroRotation;
  }
}

/* The route's OWN `defaultControls` — the research question the browser Simple view answers when no
   operator has steered it. Restating it here keeps the scheduled read and the browser read pointed
   at one question; a divergence would make the two disagree about what was even asked. */
function fxDefaultControls(vehicleUniverse) {
  return {
    objective: 'foreign-currency-strength', subjectId: 'JPY', cohort: 'G10', horizon: 'swing',
    pairMode: 'explicit', base: 'JPY', quote: 'USD',
    vehicleClass: 'unlevered-single-currency', dailyResetPermission: 'exclude',
    liquidityPolicyId: vehicleUniverse.policies.liquidityPolicies[0].policyId,
    costPolicyId: vehicleUniverse.policies.costPolicies[0].policyId,
    evidenceLens: 'balanced', dollarComparison: 'Broad'
  };
}

/* fx-regime-relative-value-lab publishes an owner DECISION, and its own source contract decides
   whether any currency evidence may be consumed at all. Every committed evidence source is declared
   `unreviewed` or `denied` with a null source-use policy, so RLFX's own admission predicate admits
   none, and the currency decision is computed from an empty approved-envelope set — which is exactly
   what the browser route does at boot. So this read is EXPECTED to land as a named absence.

   That absence is computed, not asserted: the owner's cohort, pair, broad-dollar, vehicle-fit and
   tracking code runs over whatever evidence it is handed, and the unavailable state below is what it
   returns. Approve a source in the committed universe and the same builder publishes a real regime
   and a selected vehicle instead — which is what makes "unavailable" trustworthy when it appears.

   No formula is restated here. Scoring, fit, tracking and projection are RLFX's, so the scheduled
   read, Simple and Power cannot drift into three answers. A price proxy is never substituted for a
   currency observation: UUP is a listed vehicle, not the broad dollar it tracks. */
export function buildFxToolRead(deps = {}) {
  const id = 'fx-regime-relative-value-lab', deepLink = 'fx-regime-relative-value-lab.html#power';
  try {
    const root = deps.root || ROOT;
    const RLFX = createRequire(import.meta.url)('../rlfx.js');
    const currencyRaw = deps.currencyUniverse !== undefined ? deps.currencyUniverse : OWNER.fxCurrencyUniverse(root);
    const vehicleRaw = deps.vehicleUniverse !== undefined ? deps.vehicleUniverse : OWNER.fxVehicleUniverse(root);

    // The route's own boot order: BOTH universes are validated before any source is read.
    const currencyValidation = RLFX.validateUniverse(currencyRaw);
    if (!currencyValidation.ok) return unavailableToolRead(id, deepLink, `The committed FX currency universe fails the owner's own validator (${currencyValidation.errors[0].message}); no currency evidence can be admitted.`);
    const vehicleValidation = RLFX.validateVehicleUniverse(vehicleRaw);
    if (!vehicleValidation.ok) return unavailableToolRead(id, deepLink, `The committed FX vehicle universe fails the owner's own validator (${vehicleValidation.errors[0].message}); no listed vehicle can be evaluated.`);

    const currencyUniverse = currencyValidation.value, vehicleUniverse = vehicleValidation.value;
    /* Source admissibility is READ from the committed contract rather than hardcoded, so this gate
       cannot keep reporting an absence after the contract stops declaring one. */
    const sources = currencyUniverse.evidenceSources || [];
    const approved = sources.filter((source) => source.activation === 'approved');
    if (approved.length) {
      return unavailableToolRead(id, deepLink, `${approved.length} FX evidence source(s) are now approved (${approved.map((source) => source.sourceId).join(', ')}), but no scheduled acquisition is wired for them; the scheduled run will not infer a currency read from an unacquired source.`);
    }

    const decisionTime = deps.decisionTime || new Date().toISOString();
    const controls = deps.controls || fxDefaultControls(vehicleUniverse);
    const vehicleObservations = (vehicleRaw.observations || []).map((observation) => RLFX.normalizeVehicleObservation(observation, {
      universe: vehicleRaw, decisionTime, payloadKind: 'normalized-structural-fact'
    }));

    const currencyDecision = RLFX.computeCurrencyDecision({
      decisionTime, configVersion: currencyUniverse.version,
      controls: {
        cohort: controls.cohort, horizon: controls.horizon, pairMode: controls.pairMode,
        base: controls.base, quote: controls.quote,
        evidenceLens: controls.evidenceLens, dollarComparison: controls.dollarComparison
      },
      sourceEnvelopes: [], observations: []
    });
    const owner = RLFX.computeFxOwnerDecision({
      decisionTime, currencyDecision, vehicleUniverse, vehicleObservations, trackingReads: [],
      controls: JSON.parse(JSON.stringify(controls)),
      fitPolicyId: vehicleUniverse.policies.fitPolicyId,
      trackingPolicyId: vehicleUniverse.policies.trackingPolicyId
    });
    const projected = RLFX.projectFxToolReadV2(owner);
    const reader = RLFX.projectFxReaderDecision(owner);
    const state = projected.availability === 'available' ? 'ready' : 'unavailable';

    /* Source-qualified: the reader sentence says WHAT is missing, this clause says WHICH declared
       source family withholds it, so the absence is attributable rather than anonymous. */
    const families = [...new Set(sources.map((source) => source.family))].sort();
    const read = state === 'ready'
      ? projected.read
      : `${reader.summary} No FX evidence source is approved for use, so the ${families.join(', ')} families are all withheld and no currency regime or listed vehicle is published.`;

    return {
      id, asOf: projected.asOf || decisionTime, read, deepLink, source: 'owning-tool-functions', state,
      metrics: {
        state, ownerDecisionId: projected.metrics.ownerDecisionId, evidenceIdentity: projected.metrics.evidenceIdentity,
        objective: projected.metrics.objective, subjectId: projected.metrics.subjectId, horizon: projected.metrics.horizon,
        broadDollarState: projected.metrics.broadDollarState, selectedPair: projected.metrics.selectedPair,
        vehicle: projected.metrics.vehicle, evidenceState: reader.evidenceState, reasons: reader.reasons,
        approvedSourceCount: approved.length, declaredSourceCount: sources.length, withheldFamilies: families,
        projection: projected
      }
    };
  } catch (error) {
    return unavailableToolRead(id, deepLink, `FX regime model unavailable this run: ${error.message}`);
  }
}

export function buildSwingToolRead(deps = {}) {
  const id = 'swing-structure-lab', deepLink = 'swing-structure-lab.html';
  try {
    const root = deps.root || ROOT;
    const symbol = deps.symbol || 'SPY';
    const ownerState = OWNER.swingOwnerState(root, symbol, deps.macro || null);
    if (!ownerState) return unavailableToolRead(id, deepLink, `No committed daily window for ${symbol}; swing structure has no bars to read.`);
    const model = OWNER.loadAdapter(root, 'rlexperience-adapters/market-structure.js');
    const summary = model.computeSwingTransitionSummary(JSON.parse(JSON.stringify(ownerState)), OWNER.registryDefaults(root, 'simple-adapter/swing-transition/v1'));
    if (!summary || summary.state !== 'ready') return unavailableToolRead(id, deepLink, `Swing structure did not reach a ready state for ${symbol} this run.`);
    const read = `${symbol} swing structure reads ${summary.swingState.label} with an active ${summary.pattern.ownerPattern} pattern in a ${summary.regime.band} regime.`;
    return {
      id, asOf: ownerState.asOf, read, deepLink, source: 'owning-tool-functions', state: 'ready',
      metrics: {
        symbol, swingState: summary.swingState.label,
        fast: round(summary.swingState.fast, 2), slow: round(summary.swingState.slow, 2),
        pattern: summary.pattern.ownerPattern, patternState: summary.pattern.state,
        regime: summary.regime.band, accumulation: summary.accumulation ? summary.accumulation.label : null,
        bars: ownerState.full.length
      }
    };
  } catch (error) { return unavailableToolRead(id, deepLink, `Swing structure model unavailable this run: ${error.message}`); }
}

export function buildBreadthToolRead(deps = {}) {
  const id = 'market-heatmap-lab', deepLink = 'market-heatmap-lab.html';
  try {
    const root = deps.root || ROOT;
    const ownerState = OWNER.breadthOwnerState(root, { asOf: deps.asOf });
    if (!ownerState) return unavailableToolRead(id, deepLink, 'Too few committed constituent snapshots to read market breadth honestly.');
    const model = OWNER.loadAdapter(root, 'rlexperience-adapters/market-structure.js');
    const summary = model.computeBreadthSummary(JSON.parse(JSON.stringify(ownerState)), OWNER.registryDefaults(root, 'simple-adapter/market-breadth/v1'));
    if (!summary || !Number.isFinite(summary.breadth.pct)) return unavailableToolRead(id, deepLink, 'The breadth model produced no percentage from the committed constituents.');
    const leaders = (summary.groups || []).slice().sort((a, b) => (b.pct ?? -Infinity) - (a.pct ?? -Infinity));
    const read = `Leadership is ${summary.leadership.state} — ${summary.breadth.pct}% of ${summary.breadth.count} constituents are positive against a ${summary.leadership.threshold}% broad-market threshold.`;
    return {
      id, asOf: ownerState.asOf, read, deepLink, source: 'owning-tool-functions', state: 'ready',
      metrics: {
        breadthPct: summary.breadth.pct, leadership: summary.leadership.state,
        threshold: summary.leadership.threshold, margin: summary.leadership.margin,
        constituents: summary.breadth.count, priced: summary.pricedCount, covered: summary.coverageCount,
        window: summary.window, grouping: summary.grouping,
        strongest: leaders.slice(0, 3).map((group) => ({ group: group.key ?? group.label ?? null, pct: group.pct ?? null })),
        weakest: leaders.slice(-3).reverse().map((group) => ({ group: group.key ?? group.label ?? null, pct: group.pct ?? null }))
      }
    };
  } catch (error) { return unavailableToolRead(id, deepLink, `Market breadth model unavailable this run: ${error.message}`); }
}

export function buildVolatilityToolRead(deps = {}) {
  const id = 'volatility-sizing-lab', deepLink = 'volatility-sizing-lab.html';
  try {
    const root = deps.root || ROOT;
    const ownerState = OWNER.volatilityOwnerState(root, { decisionTime: deps.decisionTime });
    if (!ownerState) return unavailableToolRead(id, deepLink, 'The committed volatility universe or its bar window is unavailable this run.');
    const model = OWNER.loadAdapter(root, 'rlexperience-adapters/market-structure.js');
    const rlvol = OWNER.loadAdapter(root, 'rlvol.js');
    const summary = model.computeVolatilitySummary(rlvol, JSON.parse(JSON.stringify(ownerState)), OWNER.registryDefaults(root, 'simple-adapter/conditional-volatility/v1'));
    if (!summary || summary.forecast.state !== 'ready') return unavailableToolRead(id, deepLink, 'The conditional-volatility forecast did not reach a ready state this run.');
    const multiplier = summary.throttle.multiplier;
    const read = `${ownerState.asset.symbol} conditional volatility forecasts ${summary.forecast.annualizedPct}% in a ${summary.regime.band} regime; the capped vol-target throttle sizes to ${multiplier === null ? 'withheld' : '×' + round(multiplier, 2)}.`;
    return {
      id, asOf: ownerState.asOf, read, deepLink, source: 'owning-tool-functions', state: 'ready',
      metrics: {
        symbol: ownerState.asset.symbol,
        forecastPct: summary.forecast.annualizedPct, regime: summary.regime.band,
        percentile: summary.regime.percentile ?? null,
        throttle: multiplier === null ? null : round(multiplier, 3),
        capped: summary.throttle.capped ?? null,
        estimator: summary.forecast.estimator ?? null,
        halfLife: summary.persistence ? summary.persistence.halfLife ?? null : null
      }
    };
  } catch (error) { return unavailableToolRead(id, deepLink, `Conditional-volatility model unavailable this run: ${error.message}`); }
}

/**
 * intraday-tape-lab. There is no same-origin INTRADAY snapshot in this repo (data/bars is daily), so
 * the session bars are fetched live — which Node can do without CORS. If that fetch is unavailable
 * the read degrades honestly; it never generates bars, because a generated session would be a
 * fabricated auction read.
 */
export async function buildIntradayToolRead(deps = {}) {
  const id = 'intraday-tape-lab', deepLink = 'intraday-tape-lab.html';
  try {
    const root = deps.root || ROOT;
    const symbol = deps.symbol || 'SPY';
    const bars = typeof deps.intradayBars === 'function' ? await deps.intradayBars(symbol) : await yahooIntradayBars(symbol);
    if (!bars || bars.length < 40) return unavailableToolRead(id, deepLink, `No intraday session bars are available for ${symbol}; the auction read needs real intraday OHLCV and none is committed.`);
    const sessions = groupIntradaySessions(bars);
    const ownerState = OWNER.sessionOwnerState(root, {
      symbol, sessions, source: 'live intraday bars (no same-origin intraday cache exists)',
      gamma: deps.gamma || { callWall: null, putWall: null, flip: null }
    });
    if (!ownerState) return unavailableToolRead(id, deepLink, `Fewer than two complete intraday sessions are available for ${symbol}.`);
    const model = OWNER.loadAdapter(root, 'rlexperience-adapters/market-structure.js');
    const summary = model.computeSessionAuctionSummary(JSON.parse(JSON.stringify(ownerState)), OWNER.registryDefaults(root, 'simple-adapter/session-auction/v1'));
    if (!summary || summary.state !== 'ready') return unavailableToolRead(id, deepLink, `The session-auction model did not reach a ready state for ${symbol} this run.`);
    const read = `${symbol}'s session is a ${summary.sessionType.ownerType} auction under ${summary.control.label} control, with VWAP at ${round(summary.levels.vwap, 2)}.`;
    return {
      id, asOf: ownerState.asOf, read, deepLink, source: 'owning-tool-functions', state: 'ready',
      metrics: {
        symbol, sessionType: summary.sessionType.ownerType, control: summary.control.label,
        vwap: round(summary.levels.vwap, 2), poc: round(summary.levels.poc, 2),
        valueAreaHigh: round(summary.levels.vah, 2), valueAreaLow: round(summary.levels.val, 2),
        gapPct: ownerState.gap === null ? null : round(ownerState.gap * 100, 2),
        sessions: sessions.length, barsToday: sessions[sessions.length - 1].bars.length
      }
    };
  } catch (error) { return unavailableToolRead(id, deepLink, `Session-auction model unavailable this run: ${error.message}`); }
}

/**
 * technical-analysis-decision-lab. The owner five-gate model IS implemented and does publish a decision
 * read in the browser — but it projects committed deterministic fixtures that declare `liveClaim:false`,
 * so there is no live-market read to carry. The only truthful Tier-A read is therefore that absence,
 * stated with the reason that actually blocks it. Carrying the fixture read instead would put canned
 * analysis into a brief a reader acts on during market hours, which is the failure this guards against.
 */
export function buildTechnicalToolRead(deps = {}) {
  const id = 'technical-analysis-decision-lab', deepLink = 'technical-analysis-decision-lab.html';
  try {
    const root = deps.root || ROOT;
    const symbol = deps.symbol || 'SPY';
    const model = OWNER.loadAdapter(root, 'rlexperience-adapters/market-structure.js');
    const bars = OWNER.dailyBars(root, symbol);
    const ownerState = {
      contractVersion: 'technical-foundation-owner-state/v1', toolId: id, symbol,
      asOf: bars ? new Date(bars[bars.length - 1].t).toISOString() : new Date().toISOString(),
      source: 'same-origin daily snapshot (data/bars)',
      foundationReceipt: { present: !!bars, name: 'Daily close integrity', session: 'XNYS venue-local daily boundary', primary: 'Primary 1d closed', ownerReadPublished: false }
    };
    const summary = model.computeTechnicalFiveGateSummary(ownerState, OWNER.registryDefaults(root, 'simple-adapter/technical-five-gate/v1'));
    const read = `The five-gate decision model contributes no current-market read: ${summary.missingOwnerCapability || 'the owner model publishes no live read'} Its data foundation is ${summary.foundationReceipt.present ? 'present' : 'absent'}.`;
    return {
      id, asOf: ownerState.asOf, read, deepLink, source: 'owning-tool-functions', state: 'owner-model-unavailable',
      metrics: {
        symbol, state: summary.state,
        missingOwnerCapability: summary.missingOwnerCapability || null,
        foundationPresent: summary.foundationReceipt.present,
        ownerReadPublished: summary.foundationReceipt.ownerReadPublished,
        setupState: summary.setupState.state, evidenceState: summary.evidenceState.state
      }
    };
  } catch (error) { return unavailableToolRead(id, deepLink, `Five-gate model unavailable this run: ${error.message}`); }
}

/* Feature 001 Scope 04 — Tier-A causal adapter.
   Runs the PRODUCTION rlcausal evaluator over committed records; there is deliberately no
   Brief-only causal model. Timing reads are derived from this same run's owner tool reads, so the
   headless snapshot and the browser pages agree about market confirmation.
   Anchored to the committed recordedAt rather than wall clock, so two refreshes over the same
   inputs produce byte-identical output with no timestamp exclusion needed. */
export function buildCausalToolRead(toolReads, deps) {
  const load = (deps && deps.read) || read;
  const requireModule = (deps && deps.require) || createRequire(import.meta.url);
  const unavailable = (reason, detail) => ({
    id: 'causal-rotation-lab',
    asOf: null,
    read: 'Causal rotation research unavailable: ' + reason,
    metrics: {
      contractVersion: 'causal-tool-read/v1', topCandidateId: null, exposureId: null,
      stage: null, causeStatus: 'unavailable', planEligible: false, candidateCount: 0,
      health: 'unavailable', healthDetail: detail || reason
    },
    deepLink: 'causal-rotation-lab.html',
    source: 'tier-a-causal-unavailable'
  });

  let causal;
  let consumer;
  let config;
  let observationSet;
  try {
    /* rlcausal.js is a browser-first UMD: requiring it installs globalThis.RLCausal rather than
       returning exports. rlcausalconsumer.js does export, so it is taken from the return value. */
    requireModule('../rlcausal.js');
    causal = globalThis.RLCausal;
    consumer = requireModule('../rlcausalconsumer.js');
    config = JSON.parse(load('causal-rotation.config.json'));
    observationSet = JSON.parse(load('causal-rotation-observations.json'));
    if (!causal || typeof causal.evaluateAll !== 'function') throw new Error('rlcausal did not install its evaluator');
  } catch (error) {
    return { toolRead: unavailable('committed causal inputs did not load', String(error && error.message || error)), snapshot: null };
  }

  const configCheck = causal.validateConfig(config);
  if (!configCheck.ok) {
    return { toolRead: unavailable('causal config failed validation', configCheck.errors.map((item) => item.code + ' ' + item.path).join('; ')), snapshot: null };
  }
  const observationCheck = causal.validateObservationSet(observationSet, config);
  if (!observationCheck.ok) {
    return { toolRead: unavailable('committed causal records failed validation', observationCheck.errors.map((item) => item.code + ' ' + item.path).join('; ')), snapshot: null };
  }

  const timingReads = buildCausalTimingReads(toolReads, observationSet.recordedAt, consumer);
  const asOf = observationSet.recordedAt;
  const snapshot = causal.evaluateAll({
    config, observationSet, timingReads, posture: 'discovery', riskOverlay: 'none', asOf, generatedAt: asOf
  });
  return { toolRead: { ...snapshot.toolRead, source: 'tier-a-causal' }, snapshot, timingReads };
}

/* Owner timing reads derived from THIS run's Tier-A owner reads. Where a Tier-A model does not
   cover an exposure, the read says so instead of inventing a confirmation state. */
export function buildCausalTimingReads(toolReads, asOf, consumer) {
  const reads = [];
  const sector = toolReads && toolReads['sector-research-lab'];
  const sectorMetrics = (sector && sector.metrics) || {};
  const tickerOf = (value) => (value && (value.ticker || value.id)) || null;
  const sectorState = (ticker) => {
    if (!ticker) return null;
    if (tickerOf(sectorMetrics.leader) === ticker) return 'established';
    if (tickerOf(sectorMetrics.into) === ticker) return 'confirming';
    if (tickerOf(sectorMetrics.out) === ticker) return 'weakening';
    return null;
  };
  const sectorExposures = [
    { exposureId: 'exp:financials', ticker: 'XLF' },
    { exposureId: 'exp:banks', ticker: null },
    { exposureId: 'exp:semiconductors', ticker: null }
  ];
  for (const entry of sectorExposures) {
    const state = sectorState(entry.ticker);
    reads.push({
      exposureId: entry.exposureId, ownerToolId: 'sector-research-lab',
      marketState: state || 'unavailable',
      limitations: state
        ? ['Relative-strength rotation state only; it is not a causal claim.']
        : ['The Tier-A rotation read covers GICS sector ETFs, so it publishes no confirmation state for this exposure.']
    });
  }
  reads.push({
    exposureId: 'exp:united-states', ownerToolId: 'global-rotation-lab', marketState: 'unavailable',
    limitations: ['Countries are scored relative to a US benchmark, so the model publishes no United States confirmation state.']
  });
  const realAssets = toolReads && toolReads['real-assets-lab'];
  const realMetrics = (realAssets && realAssets.metrics) || {};
  const bandState = (score) => {
    if (!Number.isFinite(score)) return null;
    if (score >= 70) return 'established';
    if (score >= 55) return 'confirming';
    if (score >= 40) return 'emerging';
    return 'weakening';
  };
  const oilState = bandState(realMetrics.leaderScore);
  reads.push({
    exposureId: 'exp:oil-underlying', ownerToolId: 'real-assets-lab', marketState: oilState || 'unavailable',
    limitations: oilState
      ? ['Oil-linked model score only; it is a price-trend state, not a supply or curve explanation.']
      : ['No real-assets score is complete, so no oil-linked confirmation state exists.']
  });
  reads.push({
    exposureId: 'exp:energy-equities', ownerToolId: 'real-assets-lab', marketState: 'unavailable',
    limitations: ['The Tier-A real-assets read does not carry the energy-equity confirmation input, so no equity confirmation state exists.']
  });

  return reads.map((entry) => {
    const built = consumer.buildTimingRead({
      exposureId: entry.exposureId,
      ownerToolId: entry.ownerToolId,
      asOf,
      freshUntil: '2099-01-01T00:00:00Z',
      marketState: entry.marketState,
      deepLink: entry.ownerToolId + '.html',
      limitations: entry.limitations
    });
    return built.ok ? built.value : null;
  }).filter(Boolean);
}

function buildToolCoverage(toolReads) {
  const registry = JSON.parse(read('tools.json'));
  return (registry.tools || []).map((tool) => {
    const toolRead = toolReads[tool.id];
    if (!toolRead) {
      return { id: tool.id, deepLink: tool.file, status: 'browser-or-agent-read', reason: 'No deterministic Tier-A adapter; consume its latest browser toolRead when present and otherwise inspect the owning tool before authoring.' };
    }
    // A Tier-A adapter that RAN but could not reach a read is reported `unavailable`, not
    // `fresh-headless` — collapsing the two would let an absence be narrated as an analysis. The
    // reason distinguishes "no evidence this run" from "the owner model publishes no read at all".
    if (toolRead.state && toolRead.state !== 'ready') {
      return { id: tool.id, deepLink: tool.file, status: 'unavailable', reason: toolRead.read };
    }
    return { id: tool.id, deepLink: tool.file, status: 'fresh-headless', reason: toolRead.read };
  });
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
  const trackedBars = {};
  for (const it of (wl.items || [])) {
    const rows = await yahooRowsMemo(it.ticker); if (!rows) continue;
    names[it.ticker] = { px: round(rows[rows.length - 1].c, 2), mom5: round(momentumPct(rows, 5)), mom21: round(momentumPct(rows, 21)), mom63: round(momentumPct(rows, 63)), ...structural(rows) };
    trackedBars[it.ticker] = rows;
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

  /* Tier-A official curve acquisition (spec 018), before tool-read assembly so the
     bond read sees this run's artifact. Wrapped like every other per-tool builder:
     an acquisition failure degrades the bond read alone and never fails the brief.
     Imported dynamically because that module imports loadToolFunctions from here. */
  try {
    const acquisition = await import('./acquire-official-curves.mjs');
    const { artifact } = await acquisition.acquireOfficialCurves({ root: ROOT });
    if (!process.argv.includes('--dry-run')) acquisition.writeOfficialCurveArtifact(artifact, { root: ROOT });
  } catch (error) {
    console.warn('[official-curves] acquisition unavailable this run: ' + error.message);
  }

  const toolReads = {};
  const sectorRead = buildSectorToolRead(sectors); toolReads[sectorRead.id] = sectorRead;
  const parallelToolReads = await Promise.all([buildEtfToolRead(), buildGlobalToolRead(), buildRealAssetsToolRead()]);
  for (const toolRead of parallelToolReads) toolReads[toolRead.id] = toolRead;
  const companyFundamentalsRead = buildCompanyFundamentalsOwnerRead((path) => JSON.parse(read(path)), companyObjectSha256);
  toolReads[companyFundamentalsRead.id] = companyFundamentalsRead;

  // Owning-model reads over committed same-origin evidence. Each runs the owning tool's OWN exported
  // model; a model that cannot reach a read publishes that absence with a reason.
  const surfaceRead = buildOptionsSurfaceToolRead();
  const gammaRead = buildGammaToolRead();
  const macro = { fg: fg ? { score: fg.score, band: fg.band } : null, vix };
  const ownerModelReads = [
    surfaceRead,
    gammaRead,
    buildOptionsFlowToolRead(),
    buildAiCapexToolRead(),
    buildBondRegimeToolRead(),
    buildFxToolRead(),
    buildSwingToolRead({ macro }),
    buildBreadthToolRead({ asOf: new Date().toISOString() }),
    buildVolatilityToolRead(),
    buildTechnicalToolRead(),
    // The auction read reuses the gamma walls this same run already priced, so the two agree.
    await buildIntradayToolRead({ gamma: { callWall: gammaRead.metrics.callWall ?? null, putWall: gammaRead.metrics.putWall ?? null, flip: gammaRead.metrics.flip ?? null } })
  ];
  for (const toolRead of ownerModelReads) toolReads[toolRead.id] = toolRead;

  /* Causal runs LAST so it can derive timing from this same run's owner reads. A causal failure
     degrades that one read and never removes another tool's read from the snapshot. */
  const causal = buildCausalToolRead(toolReads);
  toolReads[causal.toolRead.id] = causal.toolRead;

  /* Feature 026 Scope 2 — cross-asset measurement, taken AFTER the owner reads so the dollar leg's
     dark reason and the credit leg's carried classification come from what those models actually
     published this run rather than from a second derivation here. */
  const crossAsset = await buildCrossAssetReadings({
    realAssetsRead: toolReads['real-assets-lab'],
    fxRead: toolReads['fx-regime-relative-value-lab'],
    bondRead: toolReads['bond-regime-lab']
  });

  const toolCoverage = buildToolCoverage(toolReads), nextSession = nextSessionDate(window), dataFreshness = dataSnapshotFreshness();

  /* Feature 026 Scope 3 — the v2 memory row. This run persists what it SAW so the next run can
     answer "what changed since I last told you" without refetching one instrument. The legs are
     resolved through rlcockpit.js's ONE resolver, so the row and the published block agree about
     which leg is dark by construction rather than by two implementations happening to match.

     The compact per-leg projection keeps the state fields and drops every prose field: a memory
     row is what the run observed, and re-persisting the sentences is what makes an artifact grow
     without bound. */
  const priorRecentRows = readRecentMemoryRows();
  const changeFlagProducers = loadChangeFlagProducers();
  const memoryLegs = {}, memoryDark = [];
  for (const legPolicy of (cfg['cross-asset/v1']?.legs || [])) {
    const resolved = RLCOCKPIT.resolveLeg(legPolicy, crossAsset.legs?.[legPolicy.id] ?? null, cfg['cross-asset/v1'].sessions);
    if (resolved === null) continue;
    if (resolved.shape === 'dark') { memoryDark.push({ leg: resolved.leg, reason: resolved.reason }); continue; }
    memoryLegs[resolved.leg] = {
      driver: resolved.driver ?? null, pairId: resolved.pairId ?? null, direction: resolved.direction ?? null,
      changePct: resolved.changePct ?? null, sessions: resolved.sessions ?? null, long63Pct: resolved.long63Pct ?? null,
      provenance: resolved.provenance ?? null, state: resolved.state ?? null, asOf: resolved.asOf ?? null,
      persisted: legPersistence(priorRecentRows, resolved.leg, { producers: changeFlagProducers, snapshots: cfg.thresholds?.persistenceSnapshots }).persisted
    };
  }
  const { claims: memoryClaims, openInstruments } = await buildRunClaims(ROOT);
  const tracked = buildTrackedStates({
    symbols: (wl.items || []).map((item) => item.ticker),
    barsBySymbol: trackedBars, benchRows: bench, thresholds: cfg.thresholds,
    gamma: gammaRead.metrics, events: committedBriefEvents(), asOf: nextSession,
    priorRows: priorRecentRows, openInstruments, producers: changeFlagProducers
  });

  const snap = {
    ts: new Date().toISOString(), window, marketClosed, nextSessionDate: nextSession,
    regimeScore: reg.risk, regimeBand: reg.band, vix, fearGreed: fg ? fg.score : null,
    dataFreshness, bench: { px: bench && bench.length ? round(bench[bench.length - 1].c, 2) : null, ...benchStruct },
    sectors, names, groups, toolReads, toolCoverage, source: 'brief-refresh.mjs',
    crossAsset: memoryLegs, tracked, claims: memoryClaims, dark: memoryDark
  };
  const dryRun = process.argv.includes('--dry-run');
  if (!dryRun) appendFileSync(join(ROOT, 'brief-history.jsonl'), JSON.stringify(snap) + '\n');

  // deterministic slice the browser cockpit reads (market-brief.html overlays it as the "Computed (Tier-A)" line)
  // asOf = the window this refresh anchors to; generatedAt = the actual wall-clock this refresh ran (both are the run time for Tier-A).
  const snapshot = { asOf: snap.ts, generatedAt: snap.ts, window, marketClosed, nextSessionDate: nextSession, dataFreshness, regime: { band: reg.band, score: reg.risk, vix, fearGreed: fg ? fg.score : null }, bench: snap.bench, names, sectors, groups, toolReads, toolCoverage, tracked, crossAsset };
  if (!dryRun) writeFileSync(join(ROOT, 'market-brief.snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');
  /* Deterministic public causal snapshot. Written only when the evaluation succeeded, so a failed
     run leaves the previous snapshot in place rather than replacing it with a stub that a reader
     could mistake for a current stage. */
  if (!dryRun && causal.snapshot) {
    writeFileSync(join(ROOT, 'causal-rotation.snapshot.json'), JSON.stringify(causal.snapshot, null, 2) + '\n');
  }

  console.log(`[brief-refresh] window=${window} regime=${reg.band}(${reg.risk}) VIX=${vix ?? '—'}${vixSource ? ' [' + vixSource + ']' : ''} F&G=${fg ? fg.score + '/' + fg.band : '—'}`);
  console.log(`  structural: SPY ${benchStruct.maStack} · 200d ${benchStruct.ma200Dist ?? '—'}% · 52w-high ${benchStruct.pctFrom52wHigh ?? '—'}% · mom126 ${benchStruct.mom126 ?? '—'}% mom252 ${benchStruct.mom252 ?? '—'}%`);
  console.log(`  sectors: ${Object.entries(sectors).map(([k, v]) => `${k} ${v.rrgState}${Number.isFinite(v.accel) ? ' a' + (v.accel >= 0 ? '+' : '') + v.accel : ''}${v.rotation && v.rotation !== 'neutral' ? '→' + v.rotation.toUpperCase() : ''}`).join(' · ') || '—'}`);
  console.log(`  names:   ${Object.entries(names).map(([k, v]) => `${k} ${v.px} mom21=${v.mom21}% 200d=${v.ma200Dist ?? '—'}% ${v.maStack}`).join(' · ') || '—'}`);
  console.log(`  groups:  ${groups.map(g => `${g.label} ${g.read ? g.read.rrgState + ' (' + g.read.rsMom1m + '%)' : '—'} ${g.breadth.label}`).join(' · ') || '—'}`);
  console.log(`  tools:   ${Object.values(toolReads).map((tool) => `${tool.id}: ${tool.read}`).join(' · ')}`);
  const coverageCounts = toolCoverage.reduce((counts, entry) => ({ ...counts, [entry.status]: (counts[entry.status] || 0) + 1 }), {});
  console.log(`  coverage: ${Object.entries(coverageCounts).map(([status, count]) => `${count} ${status}`).join(' · ')}`);
  console.log(`  next:    ${nextSession}${marketClosed ? ' (market closed — latest completed bars)' : ''}`);
  console.log(dryRun
    ? '  --dry-run: nothing written. Re-run without the flag to publish the snapshot and append history.'
    : '  wrote market-brief.snapshot.json + appended 1 brief-history.jsonl row. Commit these + run Tier B (agent) for the narrative.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--distributed-run')) {
    // Scope 09 dispatch seam. The evidence-first distributed transaction (runBriefRefresh above) is fully
    // implemented and test-proven, but is deliberately NOT wired into the live launchd path here: the
    // browser UI still consumes the legacy market-brief.payload.json until the Scope 10 cutover flips
    // production loading. This seam exists so Scope 10 can wire real git/source/author dependencies
    // without changing this entrypoint's shape. Invoked live today (env unset in launchd), it is inert.
    console.error('[brief-refresh] --distributed-run: evidence-first publication is implemented and test-proven but not live-wired yet (Scope 10 cutover). No action taken.');
    process.exit(0);
  }
  main().catch((e) => {
    console.error(`[brief-refresh] ${process.argv.includes('--strict') ? 'fatal' : 'soft-fail'}:`, e.message);
    process.exit(process.argv.includes('--strict') ? 1 : 0);
  });
}
