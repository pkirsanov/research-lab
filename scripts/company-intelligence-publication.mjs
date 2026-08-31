#!/usr/bin/env node
/*
 * Feature 028 Scopes 01-03 — Company Intelligence publication and restoration foundation.
 *
 * This module owns frozen policy/input contracts, headless Feature 025 composition, bounded
 * research-plan validation, one real company owner read, content-addressed coupled assembly,
 * predecessor-checked immutable promotion, ordered pointer staging, disk coherence validation,
 * two-checkout restoration, exact-commit push retry, and remote-ancestry acknowledgment. It has no
 * trigger-adapter or registry-activation authority. Scope 05 adds one inert public projection of
 * an acknowledged pair; shared browser math remains in the UMD rlcompanyintel.js module.
 */
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AUTHOR_ERRORS,
  buildCompanyPlanAuthorRequest,
  validateAuthorEnvelope
} from './brief-author.mjs';
import {
  promoteDeclaredPublication,
  stageDeclaredPublication,
  validateDeclaredPublication
} from './brief-publication.mjs';

const require = createRequire(import.meta.url);
const INTEL = require('../rlcompanyintel.js');
const RLCONTRACTS = require('../rlcontracts.js');

const POLICY_CONTRACT = 'company-publication-policy/v1';
const GENERATION_CONTRACT = 'company-publication-generation/v1';
const FROZEN_INPUT_CONTRACT = 'company-publication-inputs/v1';
const SOURCE_CATALOGUE_CONTRACT = 'company-source-catalogue/v1';
const BASE_CANDIDATE_CONTRACT = 'company-candidate-base/v1';
const COUPLED_MANIFEST_CONTRACT = 'company-brief-publication-manifest/v1';
const COUPLED_POINTER_CONTRACT = 'company-brief-current-pointer/v1';
const COMPANY_POINTER_CONTRACT = 'company-version-pointer/v2';
const PROMOTION_PLAN_CONTRACT = 'company-publication-promotion-plan/v1';
const DECLARED_PUBLICATION_CONTRACT = 'declared-publication-set/v1';
const TRANSACTION_BASELINE_CONTRACT = 'company-publication-transaction-baseline/v1';
const ATTEMPT_CONTRACT = 'company-publication-attempt/v1';
const PUBLIC_PROJECTION_CONTRACT = 'company-publication-projection/v1';
const ATTEMPT_STATES = Object.freeze([
  'preparing',
  'failed',
  'dry-run-complete',
  'committed-pending-remote',
  'remote-outcome-unknown',
  'acknowledged'
]);
const TRANSACTION_BASELINE_FILE = 'transaction-baseline.json';
const TRANSACTION_JOURNAL_CONTRACT = 'company-publication-transaction-journal/v1';
const TRANSACTION_JOURNAL_FILE = 'transaction-journal.json';
const TRIGGER_REQUEST_CONTRACT = 'company-publication-trigger-request/v1';
const EXECUTION_CHECKPOINT_CONTRACT = 'company-publication-execution-checkpoint/v1';
const EXECUTION_CHECKPOINT_FILE = 'execution-checkpoint.json';
const COUPLED_SELECTOR_PATH = 'data/company-intelligence/publication-current.json';
const PUBLIC_PROJECTION_PATH = 'data/company-intelligence/publication-current.js';
const PUBLIC_ATTEMPT_POINTER_PATH = 'data/company-intelligence/attempt-current.json';
const PUBLIC_ATTEMPT_ROOT = 'data/company-intelligence/attempts';
const COUPLED_MANIFEST_ROOT = 'data/company-intelligence/manifests';
const PUBLICATION_FILES_ROOT = 'publication-files';
const PUBLIC_BRIEF_PROJECTION_PATHS = Object.freeze([
  'brief-history.jsonl',
  'brief-history.recent.jsonl',
  'causal-rotation.snapshot.json',
  'market-brief.attention-scorecard.json',
  'market-brief.config.page.json',
  'market-brief.experimental.json',
  'market-brief.owner-reads.json',
  'market-brief.page.json',
  'market-brief.payload.json',
  'market-brief.scorecard.json',
  'market-brief.snapshot.json',
  'market-brief.snapshot.page.json',
  'market-brief.tools.page.json'
]);
const COUPLED_PUBLIC_BRIEF_PATHS = Object.freeze([
  'market-brief.owner-reads.json',
  'market-brief.page.json',
  'market-brief.payload.json',
  'market-brief.snapshot.json',
  'market-brief.snapshot.page.json',
  'market-brief.tools.page.json'
]);
const PUBLICATION_DELTA_PREFIXES = Object.freeze([
  'briefs/',
  'data/company-intelligence/',
  'research/agenda/'
]);
const WINDOWS = Object.freeze(['pre-market', 'morning', 'pre-close', 'after-hours']);
const SOURCE_KINDS = Object.freeze([
  'tool-model-read',
  'per-ticker-owner-read',
  'committed-file',
  'tier-a-market',
  'committed-bars',
  'explicit-absence'
]);
const SOURCE_STATES = Object.freeze(['current', 'partial', 'stale', 'conflicted', 'unavailable']);
const PROVENANCE_CLASSES = Object.freeze(['observed', 'derived', 'proxy', 'modelled', 'unavailable']);
const CLOSED_CODES = Object.freeze([
  'C028-RUN-IN-PROGRESS',
  'C028-TRIGGER',
  'C028-BASELINE',
  'C028-SUBJECT-POLICY',
  'C028-REGISTRY-DRIFT',
  'C028-FROZEN-INPUT-DRIFT',
  'C028-EVIDENCE-CUTOFF',
  'C028-SOURCE-CYCLE',
  'C028-PLAN-AUTHOR',
  'C028-PLAN-SCHEMA',
  'C028-PLAN-BUDGET',
  'C028-COMPANY-CANDIDATE',
  'C028-OWNER-READ',
  'C028-GENERATION-COLLISION',
  'C028-PREDECESSOR-DRIFT',
  'C028-BRIEF-CANDIDATE',
  'C028-IMMUTABLE-MUTATION',
  'C028-STAGE',
  'C028-COHERENCE',
  'C028-COMMIT',
  'C028-PUSH',
  'C028-ACK-UNKNOWN',
  'C028-PACKAGING',
  'C028-PRIVACY'
]);
const SAFE_ID = /^[a-z0-9][a-z0-9._:/-]*$/;
const HASH = /^sha256:[a-f0-9]{64}$/;
const REVISION = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const SUBJECT = /^company:[a-z][a-z0-9.-]{0,9}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const GIT_OUTPUT_MAX_BYTES = 64 * 1024 * 1024;

export const COUPLED_PUBLICATION_PHASES = Object.freeze([
  'initialized',
  'lease-held',
  'checkouts-ready',
  'inputs-frozen',
  'company-candidates-composed',
  'company-plans-authored',
  'company-candidates-validated',
  'company-owner-read-frozen',
  'source-bundle-frozen',
  'final-brief-authored',
  'final-brief-validated',
  'candidates-written',
  'staged',
  'stage-verified',
  'pointers-advanced',
  'coherence-verified',
  'committed',
  'remote-acknowledged'
]);

export const COMPANY_PUBLICATION_CODES = CLOSED_CODES;

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value)) return value;
  Object.freeze(value);
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    const output = {};
    for (const key of Object.keys(value).sort()) output[key] = sortValue(value[key]);
    return output;
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(sortValue(value));
}

function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function stableFingerprint(value) {
  return sha256(stableStringify(value));
}

function exactFields(value, fields) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify(fields.slice().sort());
}

function isIsoInstant(value) {
  if (typeof value !== 'string') return false;
  const epoch = Date.parse(value);
  return Number.isFinite(epoch) && new Date(epoch).toISOString() === value;
}

function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const epoch = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(epoch) && new Date(epoch).toISOString().slice(0, 10) === value;
}

function fail(code, phase, reason, field, causeCode = null) {
  if (!CLOSED_CODES.includes(code)) throw new Error(`UNKNOWN_COMPANY_PUBLICATION_CODE:${code}`);
  return deepFreeze({
    ok: false,
    error: {
      contractVersion: 'company-publication-error/v1',
      code,
      phase,
      reason,
      field: typeof field === 'string' && field ? field : null,
      causeCode: typeof causeCode === 'string' && causeCode ? causeCode : null
    }
  });
}

function ok(value) {
  return deepFreeze({ ok: true, value });
}

export function createCoupledState(attemptId) {
  if (!UUID.test(attemptId || '')) {
    return fail('C028-TRIGGER', 'initialized', 'A coupled publication state requires a canonical attempt UUID.', 'attemptId');
  }
  return ok({
    contractVersion: 'coupled-publication-state/v1',
    attemptId,
    phase: COUPLED_PUBLICATION_PHASES[0],
    history: [COUPLED_PUBLICATION_PHASES[0]]
  });
}

export function advanceCoupledState(state, nextPhase) {
  if (!state || state.contractVersion !== 'coupled-publication-state/v1' ||
      !UUID.test(state.attemptId || '') || !Array.isArray(state.history)) {
    return fail('C028-COHERENCE', 'state-transition', 'A valid coupled publication state is required.', 'state');
  }
  const currentIndex = COUPLED_PUBLICATION_PHASES.indexOf(state.phase);
  const nextIndex = COUPLED_PUBLICATION_PHASES.indexOf(nextPhase);
  if (currentIndex < 0 || nextIndex < 0 || nextIndex !== currentIndex + 1 ||
      state.history.length !== currentIndex + 1 ||
      state.history.some((phase, index) => phase !== COUPLED_PUBLICATION_PHASES[index])) {
    return fail('C028-COHERENCE', 'state-transition',
      `Illegal coupled publication phase transition ${String(state.phase)} -> ${String(nextPhase)}.`,
      'phase');
  }
  return ok({
    contractVersion: state.contractVersion,
    attemptId: state.attemptId,
    phase: nextPhase,
    history: state.history.concat([nextPhase])
  });
}

function fromThrown(error, code, phase, field) {
  if (error && error.record && error.record.contractVersion === 'company-publication-error/v1') {
    return deepFreeze({ ok: false, error: clone(error.record) });
  }
  return fail(code, phase, 'The company publication contract rejected the supplied value.', field,
    error && typeof error.code === 'string' ? error.code : null);
}

function policyValueValid(policy) {
  return exactFields(policy, [
    'benchmarkSymbol', 'branchBudget', 'contractVersion', 'coveredSubjects', 'ownerReadAdapterId'
  ]) && policy.contractVersion === POLICY_CONTRACT && policy.branchBudget === 5 &&
    policy.ownerReadAdapterId === 'company-intelligence-owner-v1' &&
    Array.isArray(policy.coveredSubjects) && policy.coveredSubjects.length > 0;
}

function subjectRecord(policy, subjectId) {
  return policy.coveredSubjects.find((subject) => subject.subjectId === subjectId) || null;
}

function descriptorFromSource(source, fingerprint) {
  return {
    sourceId: source.sourceId,
    sourceKind: source.sourceKind,
    ownerToolId: source.ownerToolId,
    subjectId: source.subjectId,
    asOf: source.asOf,
    fingerprint,
    provenanceClass: source.provenanceClass,
    maxHorizon: source.maxHorizon,
    deepLink: source.deepLink,
    state: source.state
  };
}

function sourceInstant(value) {
  if (isIsoInstant(value)) return value;
  if (isIsoDate(value)) return `${value}T00:00:00.000Z`;
  return null;
}

function registryFingerprintMatches(registry) {
  if (!registry || typeof registry !== 'object' || !HASH.test(registry.registryFingerprint || '')) return false;
  const body = clone(registry);
  delete body.registryFingerprint;
  return RLCONTRACTS.fingerprint('frozen-briefing-registry', body) === registry.registryFingerprint;
}

function sourceFingerprintMatches(source) {
  if (!source || !source.descriptor || !Object.prototype.hasOwnProperty.call(source, 'payload')) return false;
  const descriptor = source.descriptor;
  const identity = {
    sourceId: descriptor.sourceId,
    sourceKind: descriptor.sourceKind,
    ownerToolId: descriptor.ownerToolId,
    subjectId: descriptor.subjectId,
    asOf: descriptor.asOf,
    provenanceClass: descriptor.provenanceClass,
    maxHorizon: descriptor.maxHorizon,
    deepLink: descriptor.deepLink,
    state: descriptor.state,
    payload: source.payload
  };
  return stableFingerprint(identity) === descriptor.fingerprint;
}

function validateFrozenIdentity(frozen) {
  if (!frozen || frozen.contractVersion !== FROZEN_INPUT_CONTRACT || !policyValueValid(frozen.policy) ||
      !registryFingerprintMatches(frozen.registry) || !Array.isArray(frozen.sources) ||
      frozen.sources.some((source) => !sourceFingerprintMatches(source))) {
    return fail('C028-FROZEN-INPUT-DRIFT', 'frozen-validation',
      'The persisted frozen registry or source fingerprint no longer matches its content.', 'frozen');
  }
  const subjectFingerprint = stableFingerprint(frozen.policy.coveredSubjects);
  if (subjectFingerprint !== frozen.coveredSubjectSetFingerprint) {
    return fail('C028-FROZEN-INPUT-DRIFT', 'frozen-validation',
      'The covered-subject set no longer matches its frozen fingerprint.', 'frozen.coveredSubjectSetFingerprint');
  }
  const identity = {
    contractVersion: frozen.contractVersion,
    policy: frozen.policy,
    coverageRegistry: frozen.coverageRegistry,
    registry: frozen.registry,
    trigger: frozen.trigger,
    etSessionDate: frozen.etSessionDate,
    frozenAt: frozen.frozenAt,
    evidenceCutoff: frozen.evidenceCutoff,
    sourceRevision: frozen.sourceRevision,
    baselinePointers: frozen.baselinePointers,
    baselineVersions: frozen.baselineVersions,
    sources: frozen.sources,
    subjectInputs: frozen.subjectInputs
  };
  if (stableFingerprint(identity) !== frozen.frozenInputFingerprint) {
    return fail('C028-FROZEN-INPUT-DRIFT', 'frozen-validation',
      'The persisted frozen input set no longer matches its fingerprint.', 'frozen.frozenInputFingerprint');
  }
  const generation = createGeneration(frozen.trigger, {
    etSessionDate: frozen.etSessionDate,
    frozenAt: frozen.frozenAt,
    evidenceCutoff: frozen.evidenceCutoff,
    sourceRevision: frozen.sourceRevision,
    registryFingerprint: frozen.registry.registryFingerprint,
    coveredSubjectSetFingerprint: frozen.coveredSubjectSetFingerprint,
    frozenInputFingerprint: frozen.frozenInputFingerprint
  });
  if (!generation.ok || stableStringify(generation.value) !== stableStringify(frozen.generation)) {
    return fail('C028-FROZEN-INPUT-DRIFT', 'frozen-validation',
      'The persisted generation no longer matches the frozen inputs.', 'frozen.generation');
  }
  return ok(frozen);
}

/**
 * Revalidate the three identities that may drift between the initial freeze and
 * final bundle assembly. The caller must supply freshly observed registry,
 * source, and cutoff values. A persisted checkpoint is never treated as a fresh
 * observation of those mutable boundaries.
 */
export function validateFrozenPublicationBoundary(frozen, current) {
  const frozenValidation = validateFrozenIdentity(frozen);
  if (!frozenValidation.ok) return frozenValidation;
  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    return fail('C028-FROZEN-INPUT-DRIFT', 'final-boundary-validation',
      'Fresh registry, source, and cutoff observations are required.', 'current');
  }
  if (!registryFingerprintMatches(current.registry) ||
      stableStringify(current.registry) !== stableStringify(frozen.registry)) {
    return fail('C028-REGISTRY-DRIFT', 'final-boundary-validation',
      'The registry participant, order, count, metadata, or fingerprint changed after freeze.',
      'current.registry');
  }
  if (current.evidenceCutoff !== frozen.evidenceCutoff) {
    return fail('C028-EVIDENCE-CUTOFF', 'final-boundary-validation',
      'The evidence cutoff changed after the generation freeze.', 'current.evidenceCutoff');
  }
  if (!Array.isArray(current.sources) ||
      current.sources.some((source) => !sourceFingerprintMatches(source)) ||
      stableStringify(current.sources) !== stableStringify(frozen.sources)) {
    return fail('C028-FROZEN-INPUT-DRIFT', 'final-boundary-validation',
      'A source participant, fingerprint, or payload changed after freeze.', 'current.sources');
  }
  return ok({
    registryFingerprint: frozen.registry.registryFingerprint,
    participantCount: frozen.registry.participantCount,
    sourceCount: frozen.sources.length,
    evidenceCutoff: frozen.evidenceCutoff,
    frozenInputFingerprint: frozen.frozenInputFingerprint
  });
}

export function validatePublicationPolicy(document) {
  try {
    const policy = INTEL.readPublicationPolicy(document);
    return ok(policy);
  } catch (error) {
    return fromThrown(error, 'C028-SUBJECT-POLICY', 'policy-validation', 'publication');
  }
}

export function createGeneration(trigger, context) {
  if (!exactFields(trigger, ['contractVersion', 'generationKey', 'requestedAt', 'trigger', 'window']) ||
      trigger.contractVersion !== 'company-publication-trigger/v1' ||
      !['scheduled', 'on-demand'].includes(trigger.trigger) || !WINDOWS.includes(trigger.window) ||
      !isIsoInstant(trigger.requestedAt)) {
    return fail('C028-TRIGGER', 'generation', 'The publication trigger has an invalid closed shape.', 'trigger');
  }
  if (!context || typeof context !== 'object' || !isIsoDate(context.etSessionDate) ||
      !isIsoInstant(context.frozenAt) || !isIsoInstant(context.evidenceCutoff) ||
      Date.parse(trigger.requestedAt) > Date.parse(context.frozenAt) ||
      Date.parse(context.evidenceCutoff) > Date.parse(context.frozenAt) ||
      !REVISION.test(context.sourceRevision || '') || !HASH.test(context.registryFingerprint || '') ||
      !HASH.test(context.coveredSubjectSetFingerprint || '') || !HASH.test(context.frozenInputFingerprint || '')) {
    return fail('C028-TRIGGER', 'generation', 'The generation context is incomplete or time-incoherent.', 'context');
  }
  if (trigger.trigger === 'scheduled' &&
      trigger.generationKey !== `scheduled/${context.etSessionDate}/${trigger.window}`) {
    return fail('C028-TRIGGER', 'generation', 'The scheduled generation key does not match its date and window.', 'trigger.generationKey');
  }
  if (trigger.trigger === 'on-demand') {
    const requestId = trigger.generationKey.startsWith('on-demand/')
      ? trigger.generationKey.slice('on-demand/'.length)
      : '';
    if (!UUID.test(requestId)) {
      return fail('C028-TRIGGER', 'generation', 'The on-demand generation key has no canonical request UUID.', 'trigger.generationKey');
    }
  }
  const suffix = sha256(trigger.generationKey).slice(7, 23);
  return ok({
    contractVersion: GENERATION_CONTRACT,
    generationId: `company-brief:${context.etSessionDate}:${trigger.window}:${suffix}`,
    generationKey: trigger.generationKey,
    trigger: trigger.trigger,
    window: trigger.window,
    etSessionDate: context.etSessionDate,
    requestedAt: trigger.requestedAt,
    frozenAt: context.frozenAt,
    evidenceCutoff: context.evidenceCutoff,
    sourceRevision: context.sourceRevision,
    registryFingerprint: context.registryFingerprint,
    coveredSubjectSetFingerprint: context.coveredSubjectSetFingerprint,
    frozenInputFingerprint: context.frozenInputFingerprint
  });
}

function generationIdFromRequest(request) {
  const suffix = sha256(request.generationKey).slice(7, 23);
  return `company-brief:${request.etSessionDate}:${request.window}:${suffix}`;
}

function validateTriggerRequest(request) {
  if (!exactFields(request, [
    'attemptId', 'contractVersion', 'etSessionDate', 'generationKey',
    'requestedAt', 'trigger', 'window'
  ]) || request.contractVersion !== TRIGGER_REQUEST_CONTRACT ||
      !UUID.test(request.attemptId || '') || !isIsoDate(request.etSessionDate) ||
      !isIsoInstant(request.requestedAt) || !WINDOWS.includes(request.window) ||
      !['scheduled', 'on-demand'].includes(request.trigger)) {
    return fail('C028-TRIGGER', 'initialized',
      'The persisted trigger request has an invalid closed shape.', 'triggerRequest');
  }
  if (request.trigger === 'scheduled' &&
      request.generationKey !== `scheduled/${request.etSessionDate}/${request.window}`) {
    return fail('C028-TRIGGER', 'initialized',
      'The scheduled trigger request has an invalid generation key.', 'triggerRequest.generationKey');
  }
  if (request.trigger === 'on-demand' &&
      !UUID.test(request.generationKey.startsWith('on-demand/')
        ? request.generationKey.slice('on-demand/'.length)
        : '')) {
    return fail('C028-TRIGGER', 'initialized',
      'The on-demand trigger request has no persisted request UUID.', 'triggerRequest.generationKey');
  }
  return ok(request);
}

/** Persist or reuse one logical trigger identity before any source work starts. */
export function persistTriggerRequest({ file, trigger, window, etSessionDate, requestedAt }) {
  if (typeof file !== 'string' || !file || !['scheduled', 'on-demand'].includes(trigger) ||
      !WINDOWS.includes(window) || !isIsoDate(etSessionDate) || !isIsoInstant(requestedAt)) {
    return fail('C028-TRIGGER', 'initialized',
      'Trigger persistence requires an output path and exact trigger identity fields.', 'triggerRequest');
  }
  if (existsSync(file)) {
    const existing = readJson(file, 'C028-TRIGGER', 'initialized');
    if (!existing.ok) return existing;
    const validated = validateTriggerRequest(existing.value);
    if (!validated.ok) return validated;
    if (validated.value.trigger !== trigger || validated.value.window !== window ||
        validated.value.etSessionDate !== etSessionDate) {
      return fail('C028-GENERATION-COLLISION', 'initialized',
        'A pending trigger request belongs to another trigger, window, or session date.',
        'triggerRequest');
    }
    return ok({ ...validated.value, resumed: true, generationId: generationIdFromRequest(validated.value) });
  }
  const requestId = randomUUID();
  const request = {
    contractVersion: TRIGGER_REQUEST_CONTRACT,
    attemptId: randomUUID(),
    trigger,
    window,
    etSessionDate,
    generationKey: trigger === 'scheduled'
      ? `scheduled/${etSessionDate}/${window}`
      : `on-demand/${requestId}`,
    requestedAt
  };
  const written = writeJsonExact(file, request);
  if (!written.ok) return written;
  return ok({ ...request, resumed: false, generationId: generationIdFromRequest(request) });
}

export function freezePublicationInputs(inputs) {
  if (!inputs || typeof inputs !== 'object' || !policyValueValid(inputs.policy)) {
    return fail('C028-SUBJECT-POLICY', 'input-freeze', 'A validated publication policy is required.', 'inputs.policy');
  }
  if (!inputs.coverageRegistry || inputs.coverageRegistry.contractVersion !== 'company-coverage-registry/v1') {
    return fail('C028-SUBJECT-POLICY', 'input-freeze', 'A validated company coverage registry is required.', 'inputs.coverageRegistry');
  }
  const registry = inputs.registry;
  if (!registry || registry.contractVersion !== 'frozen-briefing-registry/v1' ||
      !Array.isArray(registry.orderedSourceToolIds) || !registryFingerprintMatches(registry)) {
    return fail('C028-REGISTRY-DRIFT', 'input-freeze', 'A validated frozen briefing registry is required.', 'inputs.registry');
  }
  if (registry.orderedSourceToolIds.filter((id) => id === INTEL.TOOL_ID).length !== 1) {
    return fail('C028-REGISTRY-DRIFT', 'input-freeze',
      'The frozen registry must contain Company Intelligence exactly once as a source.',
      'inputs.registry.orderedSourceToolIds');
  }
  if (!Array.isArray(inputs.sources) || !inputs.subjectInputs || typeof inputs.subjectInputs !== 'object' ||
      !inputs.baselinePointers || typeof inputs.baselinePointers !== 'object' ||
      !inputs.baselineVersions || typeof inputs.baselineVersions !== 'object') {
    return fail('C028-FROZEN-INPUT-DRIFT', 'input-freeze', 'Frozen source and baseline inputs are incomplete.', 'inputs');
  }
  const trigger = inputs.trigger;
  const cutoff = inputs.evidenceCutoff;
  if (!isIsoInstant(cutoff)) {
    return fail('C028-EVIDENCE-CUTOFF', 'input-freeze', 'A canonical evidence cutoff is required.', 'inputs.evidenceCutoff');
  }
  const covered = new Set(inputs.policy.coveredSubjects.map((subject) => subject.subjectId));
  const seen = new Set();
  const sources = [];
  for (let index = 0; index < inputs.sources.length; index += 1) {
    const source = inputs.sources[index];
    if (!source || typeof source !== 'object' || typeof source.sourceId !== 'string' || !SAFE_ID.test(source.sourceId) ||
        !SOURCE_KINDS.includes(source.sourceKind) ||
        !(source.ownerToolId === null || (typeof source.ownerToolId === 'string' && SAFE_ID.test(source.ownerToolId))) ||
        !(source.subjectId === null || (typeof source.subjectId === 'string' && SUBJECT.test(source.subjectId))) ||
        !PROVENANCE_CLASSES.includes(source.provenanceClass) || !INTEL.HORIZON_RANKS.includes(source.maxHorizon) ||
        !(source.deepLink === null || typeof source.deepLink === 'string') || !SOURCE_STATES.includes(source.state) ||
        !Object.prototype.hasOwnProperty.call(source, 'payload')) {
      return fail('C028-FROZEN-INPUT-DRIFT', 'input-freeze', 'A frozen source has an invalid descriptor.', `inputs.sources.${index}`);
    }
    if (seen.has(source.sourceId)) {
      return fail('C028-FROZEN-INPUT-DRIFT', 'input-freeze', 'A frozen source identity appears more than once.', source.sourceId);
    }
    seen.add(source.sourceId);
    if (source.ownerToolId === INTEL.TOOL_ID || source.ownerToolId === registry.aggregatorToolId) {
      return fail('C028-SOURCE-CYCLE', 'input-freeze',
        `Source ${source.sourceId} would make company composition consume itself or the final brief.`,
        `sources.${source.sourceId}.ownerToolId`);
    }
    if (source.subjectId !== null && !covered.has(source.subjectId)) {
      return fail('C028-SUBJECT-POLICY', 'input-freeze',
        `Source ${source.sourceId} names a subject outside publication.coveredSubjects.`,
        `sources.${source.sourceId}.subjectId`);
    }
    const instant = sourceInstant(source.asOf);
    if (source.state !== 'unavailable' && instant === null) {
      return fail('C028-FROZEN-INPUT-DRIFT', 'input-freeze',
        `Source ${source.sourceId} has no usable as-of clock.`, `sources.${source.sourceId}.asOf`);
    }
    if (instant !== null && Date.parse(instant) > Date.parse(cutoff)) {
      return fail('C028-EVIDENCE-CUTOFF', 'input-freeze',
        `Source ${source.sourceId} is newer than cutoff ${cutoff}.`, `sources.${source.sourceId}.asOf`);
    }
    const identity = {
      sourceId: source.sourceId,
      sourceKind: source.sourceKind,
      ownerToolId: source.ownerToolId,
      subjectId: source.subjectId,
      asOf: source.asOf,
      provenanceClass: source.provenanceClass,
      maxHorizon: source.maxHorizon,
      deepLink: source.deepLink,
      state: source.state,
      payload: source.payload
    };
    const fingerprint = stableFingerprint(identity);
    sources.push({ descriptor: descriptorFromSource(source, fingerprint), payload: clone(source.payload) });
  }
  sources.sort((left, right) => left.descriptor.sourceId.localeCompare(right.descriptor.sourceId));

  const baselinePointers = {};
  const baselineVersions = {};
  const subjectInputs = {};
  for (const subject of inputs.policy.coveredSubjects) {
    if (!Object.prototype.hasOwnProperty.call(inputs.baselinePointers, subject.subjectId) ||
        !Object.prototype.hasOwnProperty.call(inputs.baselineVersions, subject.subjectId) ||
        !Object.prototype.hasOwnProperty.call(inputs.subjectInputs, subject.subjectId)) {
      return fail('C028-FROZEN-INPUT-DRIFT', 'input-freeze',
        `Frozen inputs omit baseline or composition state for ${subject.subjectId}.`, subject.subjectId);
    }
    baselinePointers[subject.subjectId] = clone(inputs.baselinePointers[subject.subjectId]);
    baselineVersions[subject.subjectId] = clone(inputs.baselineVersions[subject.subjectId]);
    subjectInputs[subject.subjectId] = clone(inputs.subjectInputs[subject.subjectId]);
  }

  const coveredSubjectSetFingerprint = stableFingerprint(inputs.policy.coveredSubjects);
  const frozenIdentity = {
    contractVersion: FROZEN_INPUT_CONTRACT,
    policy: inputs.policy,
    coverageRegistry: inputs.coverageRegistry,
    registry,
    trigger,
    etSessionDate: inputs.etSessionDate,
    frozenAt: inputs.frozenAt,
    evidenceCutoff: cutoff,
    sourceRevision: inputs.sourceRevision,
    baselinePointers,
    baselineVersions,
    sources,
    subjectInputs
  };
  const frozenInputFingerprint = stableFingerprint(frozenIdentity);
  const generation = createGeneration(trigger, {
    etSessionDate: inputs.etSessionDate,
    frozenAt: inputs.frozenAt,
    evidenceCutoff: cutoff,
    sourceRevision: inputs.sourceRevision,
    registryFingerprint: registry.registryFingerprint,
    coveredSubjectSetFingerprint,
    frozenInputFingerprint
  });
  if (!generation.ok) return generation;
  return ok({
    ...frozenIdentity,
    generation: generation.value,
    coveredSubjectSetFingerprint,
    frozenInputFingerprint
  });
}

export function buildSourceCatalogue(frozen, subjectId) {
  const identity = validateFrozenIdentity(frozen);
  if (!identity.ok) return identity;
  if (!subjectRecord(frozen.policy, subjectId)) {
    return fail('C028-SUBJECT-POLICY', 'source-catalogue', 'The source catalogue requires one covered subject.', 'subjectId');
  }
  const descriptors = [];
  const seen = new Set();
  for (const source of frozen.sources) {
    const descriptor = source && source.descriptor;
    if (!descriptor || typeof descriptor !== 'object') {
      return fail('C028-FROZEN-INPUT-DRIFT', 'source-catalogue', 'A frozen source descriptor is unreadable.', 'frozen.sources');
    }
    if (descriptor.ownerToolId === INTEL.TOOL_ID || descriptor.ownerToolId === frozen.registry.aggregatorToolId) {
      return fail('C028-SOURCE-CYCLE', 'source-catalogue',
        `Source ${descriptor.sourceId} would create a company or final-brief cycle.`, descriptor.sourceId);
    }
    if (descriptor.subjectId !== null && descriptor.subjectId !== subjectId) continue;
    if (seen.has(descriptor.sourceId)) {
      return fail('C028-FROZEN-INPUT-DRIFT', 'source-catalogue', 'A source descriptor appears twice.', descriptor.sourceId);
    }
    seen.add(descriptor.sourceId);
    descriptors.push(clone(descriptor));
  }
  descriptors.sort((left, right) => left.sourceId.localeCompare(right.sourceId));
  return ok(Object.assign(descriptors, { contractVersion: SOURCE_CATALOGUE_CONTRACT }));
}

function companySubject(policySubject, generation) {
  return deepFreeze({
    contractVersion: 'company-subject/v1',
    subjectId: policySubject.subjectId,
    ticker: policySubject.ticker,
    cik: policySubject.cik,
    displayName: policySubject.displayName,
    identityBasis: 'publication-policy',
    resolvedAt: generation.frozenAt
  });
}

function sourceRecordFor(frozen, sourceId) {
  return frozen.sources.find((entry) => entry.descriptor.sourceId === sourceId) || null;
}

function ownerSourceFor(frozen, subjectId, toolId) {
  const matched = frozen.sources.filter((entry) =>
    entry.descriptor.ownerToolId === toolId &&
    (entry.descriptor.subjectId === null || entry.descriptor.subjectId === subjectId));
  if (matched.length > 1) return fail('C028-COMPANY-CANDIDATE', 'company-composition',
    `Owner ${toolId} supplied more than one frozen read for ${subjectId}.`, toolId);
  return ok(matched.length === 1 ? matched[0] : null);
}

function dataFacade(frozen, subjectId) {
  const inputs = frozen.subjectInputs[subjectId];
  return {
    bars(symbol) {
      return inputs.barsBySymbol && Array.isArray(inputs.barsBySymbol[symbol])
        ? clone(inputs.barsBySymbol[symbol])
        : null;
    },
    options(symbol) {
      return inputs.optionsBySymbol && inputs.optionsBySymbol[symbol]
        ? clone(inputs.optionsBySymbol[symbol])
        : null;
    },
    macro() {
      return inputs.marketSentiment ? clone(inputs.marketSentiment) : null;
    },
    toolRead(toolId) {
      const source = ownerSourceFor(frozen, subjectId, toolId);
      return source.ok && source.value ? clone(source.value.payload) : null;
    }
  };
}

export function composeSubjectBase(frozen, subjectId) {
  try {
    if (!frozen || frozen.contractVersion !== FROZEN_INPUT_CONTRACT || !policyValueValid(frozen.policy)) {
      return fail('C028-COMPANY-CANDIDATE', 'company-composition', 'Frozen publication inputs are required.', 'frozen');
    }
    const policySubject = subjectRecord(frozen.policy, subjectId);
    if (!policySubject) return fail('C028-SUBJECT-POLICY', 'company-composition', 'The subject is not covered.', subjectId);
    const subject = companySubject(policySubject, frozen.generation);
    const inputs = frozen.subjectInputs[subjectId];
    const facade = dataFacade(frozen, subjectId);
    const legacyBundle = INTEL.runAdapters(subject, {
      registry: frozen.coverageRegistry,
      benchmarkSymbol: frozen.policy.benchmarkSymbol,
      committedEvents: inputs.committedEvents || null,
      publishedRegimeContext: inputs.publishedRegimeContext || { available: false },
      maxBranches: frozen.policy.branchBudget,
      decisionTime: frozen.generation.frozenAt
    }, frozen.generation.frozenAt, facade);
    const byDimension = Object.fromEntries(legacyBundle.reads.map((read) => [read.dimensionId, read]));
    for (const row of frozen.coverageRegistry.rows) {
      if (row.ownerToolId === null) continue;
      const sourceResult = ownerSourceFor(frozen, subjectId, row.ownerToolId);
      if (!sourceResult.ok) return sourceResult;
      const source = sourceResult.value;
      byDimension[row.dimensionId] = INTEL.normalizeOwnerDimensionRead({
        ...row,
        ...(source ? source.descriptor : {
          sourceId: `missing:${row.ownerToolId}:${subjectId}`,
          asOf: null,
          provenanceClass: 'unavailable',
          state: 'unavailable'
        })
      }, source ? source.payload : null, subject, frozen.generation.evidenceCutoff);
    }
    const dimensionReads = Object.values(byDimension).sort((left, right) => left.dimensionId.localeCompare(right.dimensionId));
    const coverageAccount = INTEL.buildCoverageAccount(dimensionReads, frozen.coverageRegistry);
    const evidenceFamilies = INTEL.groupEvidenceFamilies(dimensionReads);
    const partition = INTEL.partitionByHorizon(dimensionReads);
    const horizons = [
      INTEL.composeImmediate(partition.tactical, frozen.coverageRegistry, frozen.generation.frozenAt),
      INTEL.composeEvent(partition.event, frozen.coverageRegistry, frozen.generation.frozenAt),
      INTEL.composeSwing(partition.swing, frozen.coverageRegistry, frozen.generation.frozenAt),
      INTEL.composeStructural(partition.structural, frozen.coverageRegistry, frozen.generation.frozenAt)
    ].sort((left, right) => left.horizonId.localeCompare(right.horizonId));
    const eventRows = inputs.committedEvents
      ? INTEL.publicScheduleSource(subject, { committedEvents: inputs.committedEvents }, frozen.generation.frozenAt)
      : [];
    const events = INTEL.selectRenderableEvents(eventRows);
    const catalogue = buildSourceCatalogue(frozen, subjectId);
    if (!catalogue.ok) return catalogue;
    const body = {
      contractVersion: BASE_CANDIDATE_CONTRACT,
      subject,
      dimensionReads,
      horizons,
      coverageAccount,
      evidenceFamilies,
      contradictions: INTEL.extractContradictions(horizons),
      events,
      sourceManifest: catalogue.value,
      refusals: legacyBundle.refusals
    };
    body.baseCandidateFingerprint = stableFingerprint(body);
    return ok(body);
  } catch (error) {
    return fromThrown(error, 'C028-COMPANY-CANDIDATE', 'company-composition', subjectId);
  }
}

export function buildPlanAuthorRequest(generation, subject, base, sources, identity) {
  if (!generation || generation.contractVersion !== GENERATION_CONTRACT ||
      !subject || subject.subjectId !== base?.subject?.subjectId ||
      !base || base.contractVersion !== BASE_CANDIDATE_CONTRACT || !HASH.test(base.baseCandidateFingerprint || '') ||
      !Array.isArray(sources)) {
    return fail('C028-PLAN-AUTHOR', 'plan-request', 'Plan authorship requires matching frozen generation, subject, base, and sources.', 'request');
  }
  const horizons = base.horizons.map((horizon) => ({
    horizonId: horizon.horizonId,
    direction: horizon.direction,
    evidenceQuality: horizon.evidenceQuality,
    inputFingerprint: horizon.inputFingerprint,
    targetIds: [...new Set([
      ...horizon.contributingDimensionIds,
      ...horizon.unavailableDimensionIds
    ])].sort()
  }));
  const built = buildCompanyPlanAuthorRequest({
    generationId: generation.generationId,
    subjectId: subject.subjectId,
    evidenceCutoff: generation.evidenceCutoff,
    maxBranches: 5,
    baseCandidateFingerprint: base.baseCandidateFingerprint,
    sourceCatalogue: clone(sources),
    horizons
  }, identity);
  if (!built.ok) return fail('C028-PLAN-AUTHOR', 'plan-request',
    'The powerless company-plan author request was refused.', built.error.field, built.error.code);
  return ok(built.request);
}

function authorCode(error) {
  if (!error) return 'C028-PLAN-SCHEMA';
  if (error.code === AUTHOR_ERRORS.MISMATCH || error.code === AUTHOR_ERRORS.REQUEST_INVALID) return 'C028-PLAN-AUTHOR';
  if (error.reason && error.reason.includes('budget')) return 'C028-PLAN-BUDGET';
  return 'C028-PLAN-SCHEMA';
}

export function validatePlanAuthorResponse(request, response) {
  if (!request || request.contractVersion !== 'company-plan-author-request/v1') {
    return fail('C028-PLAN-AUTHOR', 'plan-validation', 'The plan request contract is absent or invalid.', 'request');
  }
  if (request.maxBranches !== 5) {
    return fail('C028-PLAN-BUDGET', 'plan-validation', 'The plan request omits or changes the five-attempt budget.', 'request.maxBranches');
  }
  const requestBody = {};
  for (const key of Object.keys(request).sort()) {
    if (key !== 'requestFingerprint') requestBody[key] = request[key];
  }
  if (request.requestFingerprint !== stableFingerprint(requestBody)) {
    return fail('C028-PLAN-AUTHOR', 'plan-validation', 'The plan request fingerprint does not match its frozen content.', 'request.requestFingerprint');
  }
  if (response && response.plan && Array.isArray(response.plan.branches) && response.plan.branches.length > request.maxBranches) {
    return fail('C028-PLAN-BUDGET', 'plan-validation', 'The plan attempts more than five research branches.', 'response.plan.branches');
  }
  if (!response || typeof response.requestFingerprint !== 'string' ||
      response.requestFingerprint !== request.requestFingerprint) {
    return fail('C028-PLAN-AUTHOR', 'plan-validation',
      'The plan author response is not bound to the dispatched request.', 'response.requestFingerprint');
  }
  const gate = validateAuthorEnvelope(response, request, {});
  if (!gate.ok) {
    return fail(authorCode(gate.error), 'plan-validation', 'The plan author response failed the powerless boundary.', gate.error.field, gate.error.code);
  }
  const plan = gate.plan;
  if (plan.subjectId !== request.subjectId || plan.generationId !== request.generationId) {
    return fail('C028-PLAN-SCHEMA', 'plan-validation', 'The authored plan names another subject or generation.', 'response.plan');
  }
  if (plan.branches.length === 0 && !['floor-was-sufficient', 'every-branch-refused'].includes(plan.emptyReason)) {
    return fail('C028-PLAN-SCHEMA', 'plan-validation', 'An empty plan has no declared reason.', 'response.plan.emptyReason');
  }
  if (plan.branches.length > 0 && plan.emptyReason !== null) {
    return fail('C028-PLAN-SCHEMA', 'plan-validation', 'A populated plan cannot carry an empty reason.', 'response.plan.emptyReason');
  }
  const catalogue = new Map(request.sourceCatalogue.map((source) => [source.sourceId, source]));
  const horizonTargets = new Map(request.horizons.map((horizon) => [horizon.horizonId, new Set(horizon.targetIds)]));
  const branches = [];
  const refusals = [];
  for (let index = 0; index < plan.branches.length; index += 1) {
    const branch = plan.branches[index];
    if (typeof branch.question !== 'string' || !branch.question ||
        typeof branch.result !== 'string' || !branch.result ||
        typeof branch.stopCondition !== 'string' || !branch.stopCondition ||
        !INTEL.DISPOSITIONS.includes(branch.disposition) || !INTEL.STOPPED_BY.includes(branch.stoppedBy) ||
        !branch.relevance || !horizonTargets.has(branch.relevance.horizonId) ||
        !Array.isArray(branch.relevance.targetIds) || branch.relevance.targetIds.length === 0 ||
        branch.relevance.targetIds.some((target) => !horizonTargets.get(branch.relevance.horizonId).has(target)) ||
        !Array.isArray(branch.changedTargets) || branch.changedTargets.some((target) => !branch.relevance.targetIds.includes(target)) ||
        !Array.isArray(branch.consultedSourceIds) || branch.consultedSourceIds.length === 0) {
      return fail('C028-PLAN-SCHEMA', 'plan-validation', `Research branch ${index} has an invalid bounded shape.`, `response.plan.branches.${index}`);
    }
    const consulted = [];
    for (let sourceIndex = 0; sourceIndex < branch.consultedSourceIds.length; sourceIndex += 1) {
      const sourceId = branch.consultedSourceIds[sourceIndex];
      const source = catalogue.get(sourceId);
      if (!source) return fail('C028-PLAN-SCHEMA', 'plan-validation',
        `Research branch ${index} cites a source outside the frozen catalogue.`,
        `response.plan.branches.${index}.consultedSourceIds.${sourceIndex}`);
      const instant = sourceInstant(source.asOf);
      if (instant !== null && Date.parse(instant) > Date.parse(request.evidenceCutoff)) {
        return fail('C028-PLAN-SCHEMA', 'plan-validation',
          `Research branch ${index} cites source ${sourceId} after the frozen cutoff.`,
          `response.plan.branches.${index}.consultedSourceIds.${sourceIndex}`);
      }
      if (source.subjectId !== null && source.subjectId !== request.subjectId) {
        return fail('C028-PLAN-SCHEMA', 'plan-validation',
          `Research branch ${index} cites source ${sourceId} for another subject.`,
          `response.plan.branches.${index}.consultedSourceIds.${sourceIndex}`);
      }
      consulted.push(clone(source));
    }
    if (branch.disposition === 'refused') {
      if (typeof branch.refusalReason !== 'string' || !branch.refusalReason || branch.changedTargets.length > 0) {
        return fail('C028-PLAN-SCHEMA', 'plan-validation',
          `Refused branch ${index} must state a reason and change no target.`,
          `response.plan.branches.${index}.refusalReason`);
      }
      refusals.push({ branchId: `branch-${index + 1}`, reason: branch.refusalReason });
    } else if (branch.refusalReason !== null) {
      return fail('C028-PLAN-SCHEMA', 'plan-validation',
        `Non-refused branch ${index} cannot carry a refusal reason.`,
        `response.plan.branches.${index}.refusalReason`);
    }
    branches.push({
      contractVersion: 'company-research-branch/v2',
      branchId: `branch-${index + 1}`,
      question: branch.question,
      relevance: {
        horizonId: branch.relevance.horizonId,
        targetIds: branch.relevance.targetIds.slice().sort()
      },
      consulted,
      result: branch.result,
      disposition: branch.disposition,
      changedTargets: branch.changedTargets.slice().sort(),
      refusalReason: branch.refusalReason,
      stopCondition: branch.stopCondition,
      stoppedBy: branch.stoppedBy
    });
  }
  const enriched = {
    contractVersion: 'company-research-plan/v2',
    subjectId: request.subjectId,
    generationId: request.generationId,
    authoredBy: clone(request.authorIdentity),
    authoredAt: request.evidenceCutoff,
    requestFingerprint: request.requestFingerprint,
    responseFingerprint: gate.responseFingerprint,
    maxBranches: request.maxBranches,
    branches,
    refusals,
    budgetRemaining: request.maxBranches - branches.length,
    emptyReason: plan.emptyReason
  };
  return ok(enriched);
}

function predecessorDirections(version) {
  const rows = Array.isArray(version?.horizons)
    ? version.horizons
    : (Array.isArray(version?.horizonSummaries) ? version.horizonSummaries : null);
  if (!rows) return null;
  return Object.fromEntries(rows.map((row) => [row.horizonId, row.direction]));
}

function conclusionChange(base, predecessor) {
  if (predecessor === null) return 'first';
  const prior = predecessorDirections(predecessor);
  if (!prior) return null;
  return base.horizons.every((horizon) => prior[horizon.horizonId] === horizon.direction)
    ? 'unchanged'
    : 'changed';
}

export function composeCoveredSubjects(frozen, plans) {
  if (!frozen || frozen.contractVersion !== FROZEN_INPUT_CONTRACT || !plans || typeof plans !== 'object') {
    return fail('C028-COMPANY-CANDIDATE', 'company-composition', 'Frozen inputs and one plan map are required.', 'inputs');
  }
  const versions = [];
  for (const subject of frozen.policy.coveredSubjects) {
    const plan = plans[subject.subjectId];
    const catalogue = buildSourceCatalogue(frozen, subject.subjectId);
    if (!catalogue.ok) return catalogue;
    const planValidation = INTEL.validateResearchPlanV2(plan, frozen.generation, catalogue.value);
    if (!planValidation.ok) return fail(planValidation.error.code, 'company-composition',
      `Covered subject ${subject.subjectId} failed research plan validation: ${planValidation.error.reason}`,
      `plans.${subject.subjectId}`, planValidation.error.causeCode);
    const base = composeSubjectBase(frozen, subject.subjectId);
    if (!base.ok) return base;
    const pointer = frozen.baselinePointers[subject.subjectId];
    const priorVersionId = pointer && typeof pointer.versionId === 'string' ? pointer.versionId : null;
    const predecessor = frozen.baselineVersions[subject.subjectId];
    if ((priorVersionId === null) !== (predecessor === null)) {
      return fail('C028-COMPANY-CANDIDATE', 'company-composition',
        `The baseline pointer and predecessor bytes disagree for ${subject.subjectId}.`, subject.subjectId);
    }
    if (predecessor !== null && predecessor.versionId !== priorVersionId) {
      return fail('C028-COMPANY-CANDIDATE', 'company-composition',
        `The baseline predecessor identity disagrees for ${subject.subjectId}.`, subject.subjectId);
    }
    const change = conclusionChange(base.value, predecessor);
    if (change === null) return fail('C028-COMPANY-CANDIDATE', 'company-composition',
      `The predecessor has no four-horizon summary for ${subject.subjectId}.`, subject.subjectId);
    let version;
    try {
      version = INTEL.buildReadVersionV2({
        subject: base.value.subject,
        dimensionReads: base.value.dimensionReads,
        horizons: base.value.horizons,
        coverageAccount: base.value.coverageAccount,
        evidenceFamilies: base.value.evidenceFamilies,
        contradictions: base.value.contradictions,
        researchPlan: planValidation.value,
        events: base.value.events,
        sourceManifest: base.value.sourceManifest,
        refusals: base.value.refusals,
        conclusionChange: change
      }, frozen.generation, priorVersionId);
    } catch (error) {
      return fromThrown(error, 'C028-COMPANY-CANDIDATE', 'company-composition', subject.subjectId);
    }
    const validated = INTEL.validateReadVersionV2(version, frozen.generation, frozen.policy);
    if (!validated.ok) return fail(validated.error.code, 'company-composition', validated.error.reason,
      subject.subjectId, validated.error.causeCode);
    versions.push(validated.value);
  }
  versions.sort((left, right) => left.subjectId.localeCompare(right.subjectId));
  return ok(versions);
}

export function buildCompanyOwnerRead(generation, versions) {
  try {
    const read = INTEL.buildCompanyToolModelRead(generation, versions);
    const validated = INTEL.validateCompanyToolModelRead(read, generation, versions);
    if (!validated.ok) return fail(validated.error.code, 'owner-read', validated.error.reason,
      validated.error.field, validated.error.causeCode);
    return ok(validated.value);
  } catch (error) {
    return fromThrown(error, 'C028-OWNER-READ', 'owner-read', 'ownerRead');
  }
}

export function injectCompanyOwnerRead(snapshot, ownerRead, registry) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot) ||
      !ownerRead || ownerRead.contractVersion !== 'tool-model-read/v1' || ownerRead.toolId !== INTEL.TOOL_ID ||
      !registry || registry.contractVersion !== 'frozen-briefing-registry/v1' ||
      registry.orderedSourceToolIds.filter((id) => id === INTEL.TOOL_ID).length !== 1) {
    return fail('C028-OWNER-READ', 'owner-read-injection', 'Snapshot, owner read, or frozen registry is invalid.', 'input');
  }
  const copy = clone(snapshot);
  if (!copy.toolReads || typeof copy.toolReads !== 'object' || Array.isArray(copy.toolReads)) copy.toolReads = {};
  if (Object.prototype.hasOwnProperty.call(copy.toolReads, INTEL.TOOL_ID)) {
    const existing = copy.toolReads[INTEL.TOOL_ID];
    if (stableStringify(existing) !== stableStringify(ownerRead)) {
      return fail('C028-OWNER-READ', 'owner-read-injection', 'The candidate snapshot already carries a different company owner read.', `toolReads.${INTEL.TOOL_ID}`);
    }
  }
  copy.toolReads[INTEL.TOOL_ID] = clone(ownerRead);
  if (Array.isArray(copy.toolCoverage)) {
    const rows = copy.toolCoverage.filter((row) => row && row.id === INTEL.TOOL_ID);
    if (rows.length > 1) return fail('C028-OWNER-READ', 'owner-read-injection',
      'The candidate snapshot carries duplicate Company Intelligence coverage rows.', 'toolCoverage');
    if (rows.length === 1) {
      rows[0].status = 'fresh-headless';
      rows[0].reason = ownerRead.read;
    } else {
      copy.toolCoverage.push({
        id: INTEL.TOOL_ID,
        deepLink: 'company-intelligence-lab.html',
        status: 'fresh-headless',
        reason: ownerRead.read
      });
    }
  }
  return ok(copy);
}

function safeRelativePath(relativePath) {
  return typeof relativePath === 'string' && relativePath.length > 0 &&
    !path.isAbsolute(relativePath) && !relativePath.includes('\\') &&
    relativePath.split('/').every((part) => part.length > 0 && part !== '.' && part !== '..');
}

function validateGenerationDocument(generation) {
  if (!generation || generation.contractVersion !== GENERATION_CONTRACT) {
    return fail('C028-COHERENCE', 'coupled-manifest', 'A complete frozen generation is required.', 'generation');
  }
  const rebuilt = createGeneration({
    contractVersion: 'company-publication-trigger/v1',
    trigger: generation.trigger,
    window: generation.window,
    generationKey: generation.generationKey,
    requestedAt: generation.requestedAt
  }, {
    etSessionDate: generation.etSessionDate,
    frozenAt: generation.frozenAt,
    evidenceCutoff: generation.evidenceCutoff,
    sourceRevision: generation.sourceRevision,
    registryFingerprint: generation.registryFingerprint,
    coveredSubjectSetFingerprint: generation.coveredSubjectSetFingerprint,
    frozenInputFingerprint: generation.frozenInputFingerprint
  });
  if (!rebuilt.ok || stableStringify(rebuilt.value) !== stableStringify(generation)) {
    return fail('C028-COHERENCE', 'coupled-manifest',
      'The coupled manifest generation does not reproduce from its frozen identity.', 'generation');
  }
  return ok(generation);
}

function normalizeInventory(inventory) {
  if (!Array.isArray(inventory) || inventory.length === 0) return null;
  const rows = inventory.map((entry) => ({
    path: entry && entry.path,
    sha256: entry && entry.sha256,
    byteLength: entry && entry.byteLength
  })).sort((left, right) => String(left.path).localeCompare(String(right.path)));
  const seen = new Set();
  for (const row of rows) {
    if (!safeRelativePath(row.path) || !HASH.test(row.sha256 || '') ||
        !Number.isInteger(row.byteLength) || row.byteLength < 0 || seen.has(row.path)) return null;
    seen.add(row.path);
  }
  return rows;
}

export function buildCoupledManifest(input) {
  const generationValidation = validateGenerationDocument(input && input.generation);
  if (!generationValidation.ok) return generationValidation;
  if (!input || !Array.isArray(input.subjects) || input.subjects.length === 0 ||
      !input.companyOwnerRead || !input.brief) {
    return fail('C028-COHERENCE', 'coupled-manifest',
      'Subjects, one company owner read, and one brief run are required.', 'input');
  }
  const subjects = input.subjects.map((subject) => clone(subject))
    .sort((left, right) => left.subjectId.localeCompare(right.subjectId));
  const seenSubjects = new Set();
  for (let index = 0; index < subjects.length; index += 1) {
    const subject = subjects[index];
    if (!exactFields(subject, [
      'contentFingerprint', 'priorVersionId', 'subjectId', 'versionId', 'versionPath', 'versionSha256'
    ]) || !SUBJECT.test(subject.subjectId || '') || !SAFE_ID.test(subject.versionId || '') ||
        !safeRelativePath(subject.versionPath) || !HASH.test(subject.versionSha256 || '') ||
        !HASH.test(subject.contentFingerprint || '') ||
        !(subject.priorVersionId === null || SAFE_ID.test(subject.priorVersionId || '')) ||
        seenSubjects.has(subject.subjectId)) {
      return fail('C028-COHERENCE', 'coupled-manifest',
        'A coupled manifest subject has an invalid or duplicate identity.', `subjects.${index}`);
    }
    if (subject.versionPath !== INTEL.versionPathsFor(subject.subjectId, subject.versionId).version) {
      return fail('C028-COHERENCE', 'coupled-manifest',
        'A coupled manifest subject does not use its derived immutable version path.', `subjects.${index}.versionPath`);
    }
    seenSubjects.add(subject.subjectId);
  }
  const owner = input.companyOwnerRead;
  if (!exactFields(owner, ['fingerprint', 'readRef', 'toolId']) ||
      owner.toolId !== INTEL.TOOL_ID || !HASH.test(owner.fingerprint || '') || !HASH.test(owner.readRef || '')) {
    return fail('C028-OWNER-READ', 'coupled-manifest',
      'The coupled manifest requires the exact company owner-read fingerprint and object ref.', 'companyOwnerRead');
  }
  const brief = input.brief;
  if (!exactFields(brief, [
    'finalRef', 'manifestPath', 'manifestSha256', 'runFingerprint', 'runId'
  ]) || !SAFE_ID.test(brief.runId || '') || !HASH.test(brief.runFingerprint || '') ||
      !safeRelativePath(brief.manifestPath) || !HASH.test(brief.manifestSha256 || '') ||
      !HASH.test(brief.finalRef || '')) {
    return fail('C028-BRIEF-CANDIDATE', 'coupled-manifest',
      'The coupled manifest requires one exact content-addressed brief run.', 'brief');
  }
  const inventory = normalizeInventory(input.inventory);
  if (!inventory) {
    return fail('C028-COHERENCE', 'coupled-manifest',
      'The coupled manifest inventory is empty, duplicated, or hash-incomplete.', 'inventory');
  }
  const body = {
    contractVersion: COUPLED_MANIFEST_CONTRACT,
    generation: clone(generationValidation.value),
    priorGenerationId: input.priorGenerationId === null ? null : input.priorGenerationId,
    subjects,
    companyOwnerRead: clone(owner),
    brief: clone(brief),
    inventory
  };
  if (!(body.priorGenerationId === null || SAFE_ID.test(body.priorGenerationId || ''))) {
    return fail('C028-COHERENCE', 'coupled-manifest',
      'The predecessor coupled generation identity is invalid.', 'priorGenerationId');
  }
  return ok({ ...body, manifestFingerprint: stableFingerprint(body) });
}

function coupledManifestPath(manifest) {
  return `${COUPLED_MANIFEST_ROOT}/${manifest.manifestFingerprint.slice(7)}.json`;
}

function buildCompanyPointer(version, versionPath, versionSha256, manifestPath, manifestSha256) {
  if (!version || version.contractVersion !== 'company-read-version/v2' ||
      !safeRelativePath(versionPath) || !HASH.test(versionSha256 || '') ||
      !safeRelativePath(manifestPath) || !HASH.test(manifestSha256 || '')) {
    return fail('C028-COHERENCE', 'pointer-build', 'A company pointer requires exact version and manifest refs.', 'pointer');
  }
  return ok({
    contractVersion: COMPANY_POINTER_CONTRACT,
    subjectId: version.subjectId,
    generationId: version.generationId,
    versionId: version.versionId,
    priorVersionId: version.priorVersionId,
    versionRef: { path: versionPath, sha256: versionSha256 },
    contentFingerprint: version.contentFingerprint,
    publicationManifestRef: { path: manifestPath, sha256: manifestSha256 }
  });
}

function buildCoupledSelector(manifest, manifestPath, manifestSha256) {
  if (!manifest || manifest.contractVersion !== COUPLED_MANIFEST_CONTRACT ||
      !safeRelativePath(manifestPath) || !HASH.test(manifestSha256 || '')) {
    return fail('C028-COHERENCE', 'selector-build', 'A coupled selector requires one validated manifest ref.', 'selector');
  }
  return ok({
    contractVersion: COUPLED_POINTER_CONTRACT,
    generationId: manifest.generation.generationId,
    briefRunId: manifest.brief.runId,
    coveredSubjectIds: manifest.subjects.map((subject) => subject.subjectId),
    publicationManifestRef: { path: manifestPath, sha256: manifestSha256 }
  });
}

export function buildPublicCompanyProjection({
  manifest,
  manifestPath,
  manifestSha256,
  versions,
  priorVersions = [],
  ownerRead,
  attempt = null
}) {
  if (!manifest || manifest.contractVersion !== COUPLED_MANIFEST_CONTRACT ||
      !safeRelativePath(manifestPath) || !HASH.test(manifestSha256 || '') ||
      !Array.isArray(versions) || versions.length !== 1 ||
      versions[0]?.contractVersion !== 'company-read-version/v2' ||
      versions[0]?.subjectId !== 'company:msft' || versions[0]?.subject?.ticker !== 'MSFT' ||
      versions[0]?.generationId !== manifest.generation?.generationId ||
      !Array.isArray(versions[0]?.horizons) || versions[0].horizons.length !== 4 ||
      !ownerRead || ownerRead.contractVersion !== 'tool-model-read/v1' ||
      ownerRead.toolId !== INTEL.TOOL_ID || ownerRead.generationId !== manifest.generation.generationId ||
      ownerRead.fingerprint !== manifest.companyOwnerRead?.fingerprint ||
      !Array.isArray(priorVersions) ||
      (attempt !== null && (attempt.contractVersion !== ATTEMPT_CONTRACT ||
        attempt.authoritativeGenerationId !== manifest.generation.generationId))) {
    return fail('C028-COHERENCE', 'public-projection',
      'The public projection requires one validated acknowledged company-and-brief pair.', PUBLIC_PROJECTION_PATH);
  }
  const current = versions[0];
  const history = [current].concat(priorVersions).map(clone);
  if (new Set(history.map((version) => version.versionId)).size !== history.length ||
      history.some((version) => {
        const horizons = Array.isArray(version.horizons)
          ? version.horizons
          : version.horizonSummaries;
        return version.subjectId !== current.subjectId ||
          !Array.isArray(horizons) || horizons.length !== 4;
      })) {
    return fail('C028-COHERENCE', 'public-projection',
      'The public projection history is duplicated or does not preserve four peer horizons.', 'versions');
  }
  const pair = {
    authority: 'acknowledged',
    state: 'current',
    generationId: manifest.generation.generationId,
    subjectId: current.subjectId,
    ticker: current.subject.ticker,
    versionId: current.versionId,
    priorVersionId: current.priorVersionId,
    conclusionChange: current.conclusionChange,
    evidenceCutoff: current.evidenceCutoff,
    composedAt: current.composedAt,
    trigger: manifest.generation.trigger,
    contentFingerprint: current.contentFingerprint,
    manifest: { path: manifestPath, sha256: manifestSha256 },
    brief: {
      runId: manifest.brief.runId,
      finalRef: manifest.brief.finalRef,
      href: `market-brief.html?generation=${encodeURIComponent(manifest.generation.generationId)}#brief`
    },
    version: clone(current),
    ownerRead: clone(ownerRead)
  };
  return ok(deepFreeze({
    contractVersion: PUBLIC_PROJECTION_CONTRACT,
    pair,
    attempt: attempt === null ? null : clone(attempt),
    versions: history
  }));
}

export function serializePublicCompanyProjection(projection) {
  if (!projection || projection.contractVersion !== PUBLIC_PROJECTION_CONTRACT ||
      projection.pair?.authority !== 'acknowledged' ||
      projection.pair?.generationId !== projection.pair?.version?.generationId ||
      !Array.isArray(projection.versions) || projection.versions.length === 0) {
    return fail('C028-COHERENCE', 'public-projection',
      'The public projection cannot be serialized from an invalid pair.', PUBLIC_PROJECTION_PATH);
  }
  const encodedJson = JSON.stringify(stableStringify(projection));
  const source = [
    '(function (root) {',
    '  "use strict";',
    `  var value = JSON.parse(${encodedJson});`,
    '  function deepFreeze(node) {',
    '    if (node === null || typeof node !== "object" || Object.isFrozen(node)) return node;',
    '    Object.keys(node).forEach(function (key) { deepFreeze(node[key]); });',
    '    return Object.freeze(node);',
    '  }',
    '  root.RLCOMPANYINTEL_PUBLICATION = deepFreeze(value);',
    '})(typeof globalThis === "undefined" ? this : globalThis);',
    ''
  ].join('\n');
  return ok(Buffer.from(source, 'utf8'));
}

function readJson(file, code, phase) {
  try {
    return ok(JSON.parse(readFileSync(file, 'utf8')));
  } catch (error) {
    return fail(code, phase, 'A required JSON input could not be read and parsed.', file,
      error && typeof error.code === 'string' ? error.code : null);
  }
}

function writeJsonExact(file, value) {
  const encoded = `${stableStringify(value)}\n`;
  if (existsSync(file)) {
    const current = readFileSync(file, 'utf8');
    if (current !== encoded) return fail('C028-FROZEN-INPUT-DRIFT', 'private-write',
      'A private checkpoint path already contains different bytes.', file);
    return ok(file);
  }
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, encoded, { flag: 'wx', mode: 0o600 });
  return ok(file);
}

function checkoutEntries(root, relativeDirectory = '') {
  const absoluteDirectory = path.join(root, relativeDirectory);
  const entries = [];
  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
    if (relativePath === '.git') continue;
    const absolutePath = path.join(root, relativePath);
    const stat = lstatSync(absolutePath);
    if (entry.isDirectory()) {
      entries.push(...checkoutEntries(root, relativePath));
      continue;
    }
    if (entry.isSymbolicLink()) {
      const target = readlinkSync(absolutePath);
      entries.push({
        path: relativePath,
        type: 'symlink',
        mode: stat.mode & 0o777,
        byteLength: Buffer.byteLength(target),
        sha256: sha256(target)
      });
      continue;
    }
    if (!entry.isFile()) {
      throw new Error(`UNSUPPORTED_CHECKOUT_ENTRY:${relativePath}`);
    }
    const bytes = readFileSync(absolutePath);
    entries.push({
      path: relativePath,
      type: 'file',
      mode: stat.mode & 0o777,
      byteLength: bytes.length,
      sha256: sha256(bytes)
    });
  }
  return entries;
}

function commandValue(runner, args, code, phase, field) {
  const result = runner(args);
  if (!result || result.code !== 0) {
    return fail(code, phase, 'A required Git observation failed.', field,
      typeof result?.stderr === 'string' && result.stderr.trim() ? 'git-command-failed' : null);
  }
  return ok(String(result.stdout || '').trim());
}

function readRemoteHead(runner, remote, branch, code, phase) {
  const observed = commandValue(
    runner,
    ['ls-remote', '--heads', remote, `refs/heads/${branch}`],
    code,
    phase,
    'remoteRef'
  );
  if (!observed.ok) return observed;
  const fields = observed.value.split(/\s+/).filter(Boolean);
  if (fields.length !== 2 || !REVISION.test(fields[0]) || fields[1] !== `refs/heads/${branch}`) {
    return fail(code, phase, 'The configured remote branch did not resolve to one exact commit.', 'remoteRef');
  }
  return ok(fields[0]);
}

function checkoutBaseline(root, remote, branch, label) {
  const runner = gitRunnerFor(root);
  const head = commandValue(runner, ['rev-parse', 'HEAD'], 'C028-BASELINE', 'baseline-capture', `${label}.head`);
  if (!head.ok || !REVISION.test(head.value)) return head.ok
    ? fail('C028-BASELINE', 'baseline-capture', 'The checkout HEAD is not an exact commit.', `${label}.head`)
    : head;
  const indexTree = commandValue(runner, ['write-tree'], 'C028-BASELINE', 'baseline-capture', `${label}.indexTree`);
  if (!indexTree.ok || !REVISION.test(indexTree.value)) return indexTree.ok
    ? fail('C028-BASELINE', 'baseline-capture', 'The checkout index did not resolve to one exact tree.', `${label}.indexTree`)
    : indexTree;
  const status = commandValue(
    runner,
    ['status', '--porcelain=v1', '--untracked-files=all'],
    'C028-BASELINE',
    'baseline-capture',
    `${label}.status`
  );
  if (!status.ok) return status;
  if (status.value !== '') {
    return fail('C028-BASELINE', 'baseline-capture',
      `The ${label} checkout must be clean before coupled mutation.`, `${label}.status`);
  }
  const remoteHead = readRemoteHead(runner, remote, branch, 'C028-BASELINE', 'baseline-capture');
  if (!remoteHead.ok) return remoteHead;
  let entries;
  try {
    entries = checkoutEntries(root);
  } catch (error) {
    return fail('C028-BASELINE', 'baseline-capture',
      'The checkout byte inventory could not be captured.', label,
      error && typeof error.code === 'string' ? error.code : null);
  }
  const immutablePrefixes = [
    'data/company-intelligence/manifests/',
    'briefs/objects/',
    'briefs/indexes/',
    'briefs/runs/',
    '/versions/'
  ];
  const authorityPaths = entries.filter((entry) =>
    entry.path === COUPLED_SELECTOR_PATH ||
    entry.path === 'briefs/current.json' ||
    entry.path === 'briefs/history-current.json' ||
    /^data\/company-intelligence\/[^/]+\/current\.json$/.test(entry.path));
  const immutableEntries = entries.filter((entry) =>
    immutablePrefixes.some((prefix) => prefix === '/versions/'
      ? entry.path.includes(prefix)
      : entry.path.startsWith(prefix)));
  return ok({
    head: head.value,
    indexTree: indexTree.value,
    remoteHead: remoteHead.value,
    worktreeFingerprint: stableFingerprint(entries),
    entries,
    authority: authorityPaths,
    immutablePrefixes: immutableEntries
  });
}

function validateBaselineDocument(baseline) {
  if (!baseline || baseline.contractVersion !== TRANSACTION_BASELINE_CONTRACT ||
      !REVISION.test(baseline.baseCommit || '') || !SAFE_ID.test(baseline.remote || '') ||
      !SAFE_ID.test(baseline.branch || '') || !baseline.candidate || !baseline.publication ||
      baseline.candidate.head !== baseline.baseCommit || baseline.publication.head !== baseline.baseCommit ||
      baseline.candidate.remoteHead !== baseline.remoteHead ||
      baseline.publication.remoteHead !== baseline.remoteHead ||
      !Array.isArray(baseline.candidate.entries) || !Array.isArray(baseline.publication.entries)) {
    return fail('C028-BASELINE', 'baseline-validation',
      'The private transaction baseline has an invalid or split identity.', TRANSACTION_BASELINE_FILE);
  }
  return ok(baseline);
}

export function captureCoupledTransactionBaseline({
  transactionDir,
  candidateRoot,
  publicationRoot,
  remote,
  branch
}) {
  if (![transactionDir, candidateRoot, publicationRoot, remote, branch]
    .every((value) => typeof value === 'string' && value)) {
    return fail('C028-BASELINE', 'baseline-capture',
      'Transaction, checkout, remote, and branch identities are required.', 'input');
  }
  const privateCandidate = ensurePrivateTransaction(transactionDir, candidateRoot);
  if (!privateCandidate.ok) return privateCandidate;
  const privatePublication = ensurePrivateTransaction(transactionDir, publicationRoot);
  if (!privatePublication.ok) return privatePublication;
  const candidate = checkoutBaseline(candidateRoot, remote, branch, 'candidate');
  if (!candidate.ok) return candidate;
  const publication = checkoutBaseline(publicationRoot, remote, branch, 'publication');
  if (!publication.ok) return publication;
  if (candidate.value.head !== publication.value.head ||
      candidate.value.remoteHead !== publication.value.remoteHead ||
      candidate.value.head !== candidate.value.remoteHead) {
    return fail('C028-BASELINE', 'baseline-capture',
      'Candidate and publication checkouts must share the verified remote base commit.', 'baseCommit');
  }
  const baseline = {
    contractVersion: TRANSACTION_BASELINE_CONTRACT,
    baseCommit: candidate.value.head,
    remote,
    branch,
    remoteHead: candidate.value.remoteHead,
    candidate: candidate.value,
    publication: publication.value
  };
  const validated = validateBaselineDocument(baseline);
  if (!validated.ok) return validated;
  const written = writeJsonExact(path.join(transactionDir, TRANSACTION_BASELINE_FILE), baseline);
  if (!written.ok) return written;
  return ok({
    baseCommit: baseline.baseCommit,
    remoteHead: baseline.remoteHead,
    candidateWorktreeFingerprint: baseline.candidate.worktreeFingerprint,
    publicationWorktreeFingerprint: baseline.publication.worktreeFingerprint,
    candidateIndexTree: baseline.candidate.indexTree,
    publicationIndexTree: baseline.publication.indexTree,
    authorityPathCount: baseline.publication.authority.length,
    immutablePrefixEntryCount: baseline.publication.immutablePrefixes.length
  });
}

function removeCheckoutExtras(root, expectedEntries) {
  const expected = new Set(expectedEntries.map((entry) => entry.path));
  const current = checkoutEntries(root);
  for (const entry of current.slice().reverse()) {
    if (!expected.has(entry.path)) rmSync(path.join(root, entry.path), { force: true });
  }
}

function restoreCheckout(root, baseline, remote, branch, label) {
  const runner = gitRunnerFor(root);
  const currentHead = commandValue(runner, ['rev-parse', 'HEAD'], 'C028-COMMIT', 'pre-commit-restoration', `${label}.head`);
  if (!currentHead.ok) return currentHead;
  if (currentHead.value !== baseline.head) {
    return fail('C028-COMMIT', 'pre-commit-restoration',
      'A committed checkout cannot be reset by the pre-commit restoration path.', `${label}.head`);
  }
  try {
    removeCheckoutExtras(root, baseline.entries);
  } catch (error) {
    return fail('C028-STAGE', 'pre-commit-restoration',
      `The ${label} checkout candidates could not be removed.`, `${label}.worktree`,
      error && typeof error.code === 'string' ? error.code : null);
  }
  const reset = commandValue(runner, ['reset', '--hard', baseline.head],
    'C028-STAGE', 'pre-commit-restoration', `${label}.worktree`);
  if (!reset.ok) return reset;
  const indexTree = commandValue(runner, ['write-tree'],
    'C028-STAGE', 'pre-commit-restoration', `${label}.indexTree`);
  if (!indexTree.ok || indexTree.value !== baseline.indexTree) {
    return fail('C028-STAGE', 'pre-commit-restoration',
      `The ${label} Git index did not restore to its captured tree.`, `${label}.indexTree`);
  }
  const status = commandValue(runner, ['status', '--porcelain=v1', '--untracked-files=all'],
    'C028-STAGE', 'pre-commit-restoration', `${label}.status`);
  if (!status.ok || status.value !== '') {
    return fail('C028-STAGE', 'pre-commit-restoration',
      `The ${label} checkout retained publication residue after restoration.`, `${label}.status`);
  }
  const entries = checkoutEntries(root);
  if (stableFingerprint(entries) !== baseline.worktreeFingerprint) {
    return fail('C028-STAGE', 'pre-commit-restoration',
      `The ${label} checkout bytes differ from the captured baseline.`, `${label}.worktreeFingerprint`);
  }
  const remoteHead = readRemoteHead(runner, remote, branch, 'C028-ACK-UNKNOWN', 'pre-commit-restoration');
  if (!remoteHead.ok) return remoteHead;
  return ok({ label, remoteHead: remoteHead.value });
}

function sanitizedFailure(error) {
  const code = CLOSED_CODES.includes(error?.code) ? error.code : 'C028-COHERENCE';
  const phase = typeof error?.phase === 'string' &&
      (COUPLED_PUBLICATION_PHASES.includes(error.phase) || SAFE_ID.test(error.phase))
    ? error.phase
    : 'coherence-verified';
  const field = typeof error?.field === 'string' && safeRelativePath(error.field)
    ? error.field
    : (typeof error?.field === 'string' && SAFE_ID.test(error.field) ? error.field : null);
  const causeCode = typeof error?.causeCode === 'string' && SAFE_ID.test(error.causeCode)
    ? error.causeCode
    : null;
  return {
    contractVersion: 'company-publication-error/v1',
    code,
    phase,
    reason: `The ${code} publication boundary refused the attempted generation.`,
    field,
    causeCode
  };
}

function restoreCoupledCheckouts({ transactionDir, candidateRoot, publicationRoot }) {
  const baselineDoc = readJson(
    path.join(transactionDir, TRANSACTION_BASELINE_FILE),
    'C028-BASELINE',
    'pre-commit-restoration'
  );
  if (!baselineDoc.ok) return baselineDoc;
  const baseline = validateBaselineDocument(baselineDoc.value);
  if (!baseline.ok) return baseline;
  const candidate = restoreCheckout(
    candidateRoot,
    baseline.value.candidate,
    baseline.value.remote,
    baseline.value.branch,
    'candidate'
  );
  if (!candidate.ok) return candidate;
  const publication = restoreCheckout(
    publicationRoot,
    baseline.value.publication,
    baseline.value.remote,
    baseline.value.branch,
    'publication'
  );
  if (!publication.ok) return publication;
  if (candidate.value.remoteHead !== publication.value.remoteHead ||
      candidate.value.remoteHead !== baseline.value.remoteHead) {
    return fail('C028-ACK-UNKNOWN', 'pre-commit-restoration',
      'Remote authority changed while the local transaction was restoring.', 'remoteRef');
  }
  return ok({
    baseCommit: baseline.value.baseCommit,
    remoteHead: baseline.value.remoteHead,
    candidateRestored: true,
    publicationRestored: true,
    privateCheckpointsRetained: true
  });
}

export function abortCoupledTransaction({
  transactionDir,
  candidateRoot,
  publicationRoot,
  failure
}) {
  const restored = restoreCoupledCheckouts({ transactionDir, candidateRoot, publicationRoot });
  if (!restored.ok) return restored;
  return ok({
    state: 'aborted-pre-commit',
    ...restored.value,
    failure: sanitizedFailure(failure)
  });
}

export function buildAttemptRecord(input) {
  if (!input || !exactFields(input, [
    'attemptId', 'authoritativeGenerationId', 'failure', 'finishedAt', 'generationId',
    'phase', 'startedAt', 'state', 'trigger', 'window'
  ]) || !UUID.test(input.attemptId || '') || !SAFE_ID.test(input.generationId || '') ||
      !['scheduled', 'on-demand'].includes(input.trigger) || !WINDOWS.includes(input.window) ||
      !ATTEMPT_STATES.includes(input.state) || !COUPLED_PUBLICATION_PHASES.includes(input.phase) ||
      !isIsoInstant(input.startedAt) || !isIsoInstant(input.finishedAt) ||
      Date.parse(input.finishedAt) < Date.parse(input.startedAt) ||
      !(input.authoritativeGenerationId === null || SAFE_ID.test(input.authoritativeGenerationId || ''))) {
    return fail('C028-TRIGGER', 'attempt-record',
      'The publication attempt input has an invalid closed shape.', 'attempt');
  }
  const failureRequired = ['failed', 'remote-outcome-unknown'].includes(input.state);
  if ((input.failure === null) === failureRequired) {
    return fail('C028-COHERENCE', 'attempt-record',
      'The attempt state and sanitized failure presence disagree.', 'attempt.failure');
  }
  return ok({
    contractVersion: ATTEMPT_CONTRACT,
    attemptId: input.attemptId,
    generationId: input.generationId,
    trigger: input.trigger,
    window: input.window,
    state: input.state,
    phase: input.phase,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    failure: input.failure === null ? null : sanitizedFailure(input.failure),
    authoritativeGenerationId: input.authoritativeGenerationId,
    authoritativeUnchanged: input.state !== 'acknowledged'
  });
}

function publicAttemptPath(attemptId) {
  return `${PUBLIC_ATTEMPT_ROOT}/${attemptId}.json`;
}

function readCurrentPublicAttempt(root, authoritativeGenerationId) {
  if (!existsSync(path.join(root, PUBLIC_ATTEMPT_POINTER_PATH))) return ok(null);
  const pointerRecord = readJsonRecord(
    root,
    PUBLIC_ATTEMPT_POINTER_PATH,
    'C028-COHERENCE',
    'public-attempt-validation'
  );
  if (!pointerRecord.ok) return pointerRecord;
  const pointer = pointerRecord.value.value;
  if (!exactFields(pointer, [
    'attemptId', 'attemptRef', 'authoritativeGenerationId', 'contractVersion'
  ]) || pointer.contractVersion !== 'company-publication-attempt-pointer/v1' ||
      !UUID.test(pointer.attemptId || '') ||
      pointer.authoritativeGenerationId !== authoritativeGenerationId ||
      pointer.attemptRef?.path !== publicAttemptPath(pointer.attemptId) ||
      !HASH.test(pointer.attemptRef?.sha256 || '')) {
    return fail('C028-COHERENCE', 'public-attempt-validation',
      'The public attempt pointer is malformed or names another authoritative pair.',
      PUBLIC_ATTEMPT_POINTER_PATH);
  }
  const attemptRecord = readJsonRecord(
    root,
    pointer.attemptRef.path,
    'C028-COHERENCE',
    'public-attempt-validation'
  );
  if (!attemptRecord.ok) return attemptRecord;
  if (attemptRecord.value.sha256 !== pointer.attemptRef.sha256) {
    return fail('C028-COHERENCE', 'public-attempt-validation',
      'The public attempt pointer hash does not match its immutable record.',
      pointer.attemptRef.path);
  }
  const attempt = attemptRecord.value.value;
  if (!attempt || attempt.contractVersion !== ATTEMPT_CONTRACT) {
    return fail('C028-COHERENCE', 'public-attempt-validation',
      'The public attempt record has an invalid contract.', pointer.attemptRef.path);
  }
  const rebuilt = buildAttemptRecord({
    attemptId: attempt.attemptId,
    generationId: attempt.generationId,
    trigger: attempt.trigger,
    window: attempt.window,
    state: attempt.state,
    phase: attempt.phase,
    startedAt: attempt.startedAt,
    finishedAt: attempt.finishedAt,
    failure: attempt.failure,
    authoritativeGenerationId: attempt.authoritativeGenerationId
  });
  if (!rebuilt.ok || stableStringify(rebuilt.value) !== stableStringify(attempt) ||
      attempt.authoritativeGenerationId !== authoritativeGenerationId) {
    return fail('C028-COHERENCE', 'public-attempt-validation',
      'The public attempt record does not reproduce from its closed fields.',
      pointer.attemptRef.path);
  }
  return ok({ pointer, attempt, pointerRecord: pointerRecord.value, attemptRecord: attemptRecord.value });
}

function writePublicMutable(file, bytes) {
  const temporary = `${file}.tmp-${process.pid}`;
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(temporary, bytes);
    renameSync(temporary, file);
    return ok(file);
  } catch (error) {
    try { rmSync(temporary, { force: true }); } catch { /* Preserve the original failure. */ }
    return fail('C028-STAGE', 'public-attempt-write',
      'A public attempt projection file could not be replaced atomically.', file, error?.code);
  }
}

function writePrivateMutableJson(file, value) {
  const temporary = `${file}.tmp-${process.pid}`;
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(temporary, `${stableStringify(value)}\n`, { mode: 0o600 });
    renameSync(temporary, file);
    return ok(file);
  } catch (error) {
    try {
      rmSync(temporary, { force: true });
    } catch {
      // The original write error is the actionable result.
    }
    return fail('C028-ACK-UNKNOWN', 'private-persistence',
      'Private transaction state could not be persisted.', 'privateState',
      error && typeof error.code === 'string' ? error.code : null);
  }
}

function restorationFailure(error, restoration) {
  return deepFreeze({
    ok: false,
    error: sanitizedFailure(error),
    restoration: restoration && restoration.ok
      ? { state: 'aborted-pre-commit', ...clone(restoration.value) }
      : null,
    restorationError: restoration && !restoration.ok ? clone(restoration.error) : null
  });
}

export function completeCoupledDryRun({ transactionDir, candidateRoot, publicationRoot }) {
  const promoted = promoteCoupledPublication({ transactionDir, publicationRoot });
  if (!promoted.ok) {
    const restoration = restoreCoupledCheckouts({ transactionDir, candidateRoot, publicationRoot });
    return restorationFailure(promoted.error, restoration);
  }
  const coherent = validateCoupledPublication(publicationRoot, promoted.value.generationId);
  if (!coherent.ok) {
    const restoration = restoreCoupledCheckouts({ transactionDir, candidateRoot, publicationRoot });
    return restorationFailure(coherent.error, restoration);
  }
  const restoration = restoreCoupledCheckouts({ transactionDir, candidateRoot, publicationRoot });
  if (!restoration.ok) return restoration;
  const result = {
    state: 'dry-run-complete',
    authoritative: false,
    authoritativeUnchanged: true,
    coherenceVerified: true,
    generationId: promoted.value.generationId,
    briefRunId: promoted.value.briefRunId,
    baseCommit: restoration.value.baseCommit,
    remoteHead: restoration.value.remoteHead,
    candidateRestored: restoration.value.candidateRestored,
    publicationRestored: restoration.value.publicationRestored
  };
  try {
    rmSync(transactionDir, { recursive: true, force: true });
  } catch (error) {
    return fail('C028-STAGE', 'dry-run-complete',
      'The restored dry-run transaction checkpoints could not be removed.', 'transactionDir',
      error && typeof error.code === 'string' ? error.code : null);
  }
  return ok(result);
}

function loadTransactionBaseline(transactionDir, phase) {
  const baselineDoc = readJson(
    path.join(transactionDir, TRANSACTION_BASELINE_FILE),
    'C028-BASELINE',
    phase
  );
  if (!baselineDoc.ok) return baselineDoc;
  return validateBaselineDocument(baselineDoc.value);
}

function validateTransactionJournal(journal) {
  if (!journal || journal.contractVersion !== TRANSACTION_JOURNAL_CONTRACT ||
      !REVISION.test(journal.baseCommit || '') || !REVISION.test(journal.commit || '') ||
      !SAFE_ID.test(journal.generationId || '') || !SAFE_ID.test(journal.briefRunId || '') ||
      !HASH.test(journal.manifestSha256 || '') || !SAFE_ID.test(journal.remote || '') ||
      !SAFE_ID.test(journal.branch || '') ||
      !['committed-pending-remote', 'remote-outcome-unknown', 'acknowledged'].includes(journal.state) ||
      !journal.fileHashes || typeof journal.fileHashes !== 'object' || Array.isArray(journal.fileHashes)) {
    return fail('C028-ACK-UNKNOWN', 'journal-validation',
      'The private exact-commit journal is missing or incoherent.', TRANSACTION_JOURNAL_FILE);
  }
  return ok(journal);
}

function loadTransactionJournal(transactionDir) {
  const journalDoc = readJson(
    path.join(transactionDir, TRANSACTION_JOURNAL_FILE),
    'C028-ACK-UNKNOWN',
    'journal-validation'
  );
  if (!journalDoc.ok) return journalDoc;
  return validateTransactionJournal(journalDoc.value);
}

function validateDeclaredIndex(runner, declaredFiles) {
  for (const relativePath of Object.keys(declaredFiles).sort()) {
    const indexed = runner(['show', `:${relativePath}`]);
    if (!indexed || indexed.code !== 0) {
      return fail('C028-COMMIT', 'committed',
        'A declared publication file is absent from the Git index.', relativePath,
        'index-path-missing');
    }
    const indexedBytes = Buffer.isBuffer(indexed.stdout)
      ? indexed.stdout
      : Buffer.from(indexed.stdout || '', 'utf8');
    const expected = declaredFiles[relativePath];
    if (sha256(indexedBytes) !== expected.sha256 || indexedBytes.length !== expected.byteLength) {
      return fail('C028-COMMIT', 'committed',
        'A declared publication file in the Git index differs from the validated candidate.',
        relativePath,
        'index-byte-mismatch');
    }
  }
  return ok(true);
}

export function commitCoupledTransaction({
  transactionDir,
  candidateRoot,
  publicationRoot,
  subject
}) {
  if (typeof subject !== 'string' || !subject || /[\r\n]/.test(subject)) {
    return fail('C028-COMMIT', 'committed', 'The coupled commit subject is invalid.', 'subject');
  }
  const baseline = loadTransactionBaseline(transactionDir, 'committed');
  if (!baseline.ok) return baseline;
  const loaded = loadPromotionPlan(transactionDir);
  if (!loaded.ok) return loaded;
  const coherent = validateCoupledPublication(publicationRoot, loaded.value.plan.generationId);
  if (!coherent.ok) {
    const restoration = restoreCoupledCheckouts({ transactionDir, candidateRoot, publicationRoot });
    return restorationFailure(coherent.error, restoration);
  }
  const runner = gitRunnerFor(publicationRoot);
  const head = commandValue(runner, ['rev-parse', 'HEAD'], 'C028-COMMIT', 'committed', 'HEAD');
  if (!head.ok || head.value !== baseline.value.baseCommit) {
    return head.ok
      ? fail('C028-COMMIT', 'committed', 'The publication checkout no longer names the captured base commit.', 'HEAD')
      : head;
  }
  const staged = commandValue(
    runner,
    ['diff', '--cached', '--name-only'],
    'C028-COMMIT',
    'committed',
    'git-index'
  );
  if (!staged.ok) return staged;
  const stagedPaths = staged.value.split('\n').filter(Boolean).sort();
  const declared = new Set(loaded.value.plan.files.map((entry) => entry.path));
  if (stagedPaths.length === 0 || stagedPaths.some((relativePath) => !declared.has(relativePath))) {
    const restoration = restoreCoupledCheckouts({ transactionDir, candidateRoot, publicationRoot });
    return restorationFailure({
      code: 'C028-COMMIT',
      phase: 'committed',
      field: 'git-index',
      causeCode: 'staged-inventory-mismatch'
    }, restoration);
  }
  const indexValidation = validateDeclaredIndex(runner, loaded.value.declared.files);
  if (!indexValidation.ok) {
    const restoration = restoreCoupledCheckouts({ transactionDir, candidateRoot, publicationRoot });
    return restorationFailure(indexValidation.error, restoration);
  }
  const manifest = readJsonRecord(
    publicationRoot,
    loaded.value.plan.manifestRef.path,
    'C028-COMMIT',
    'committed'
  );
  if (!manifest.ok) return manifest;
  const message = [
    subject,
    '',
    `Brief-Run-Id: ${coherent.value.briefRunId}`,
    `Brief-Run-Fingerprint: ${manifest.value.value.brief.runFingerprint}`,
    `Brief-Manifest-SHA256: ${manifest.value.value.brief.manifestSha256}`,
    `Company-Brief-Generation-Id: ${loaded.value.plan.generationId}`,
    `Company-Brief-Manifest-SHA256: ${loaded.value.plan.manifestRef.sha256}`
  ].join('\n');
  const committed = runner(['commit', '-m', message]);
  if (!committed || committed.code !== 0) {
    const restoration = restoreCoupledCheckouts({ transactionDir, candidateRoot, publicationRoot });
    return restorationFailure({
      code: 'C028-COMMIT',
      phase: 'committed',
      field: 'git-commit',
      causeCode: 'git-commit-failed'
    }, restoration);
  }
  const commit = commandValue(runner, ['rev-parse', 'HEAD'], 'C028-COMMIT', 'committed', 'commit');
  if (!commit.ok || !REVISION.test(commit.value) || commit.value === baseline.value.baseCommit) {
    return commit.ok
      ? fail('C028-COMMIT', 'committed', 'The exact coupled commit identity could not be resolved.', 'commit')
      : commit;
  }
  const parent = commandValue(runner, ['rev-parse', `${commit.value}^`], 'C028-COMMIT', 'committed', 'parent');
  if (!parent.ok || parent.value !== baseline.value.baseCommit) {
    return parent.ok
      ? fail('C028-COMMIT', 'committed', 'The coupled commit is not based on the captured transaction base.', 'parent')
      : parent;
  }
  const journal = {
    contractVersion: TRANSACTION_JOURNAL_CONTRACT,
    state: 'committed-pending-remote',
    baseCommit: baseline.value.baseCommit,
    commit: commit.value,
    generationId: loaded.value.plan.generationId,
    briefRunId: coherent.value.briefRunId,
    manifestPath: loaded.value.plan.manifestRef.path,
    manifestSha256: loaded.value.plan.manifestRef.sha256,
    remote: baseline.value.remote,
    branch: baseline.value.branch,
    fileHashes: Object.fromEntries(loaded.value.plan.files.map((entry) => [entry.path, entry.sha256]))
  };
  const persisted = writePrivateMutableJson(path.join(transactionDir, TRANSACTION_JOURNAL_FILE), journal);
  if (!persisted.ok) return persisted;
  return ok({
    state: journal.state,
    commit: journal.commit,
    generationId: journal.generationId,
    briefRunId: journal.briefRunId,
    manifestSha256: journal.manifestSha256,
    stagedPaths
  });
}

function classifyRemoteCommit(runner, remote, branch, commit) {
  const fetched = runner(['fetch', '--quiet', remote, branch]);
  if (!fetched || fetched.code !== 0) {
    return ok({ known: false, reachable: null, remoteHead: null });
  }
  const remoteRef = `refs/remotes/${remote}/${branch}`;
  const remoteHead = commandValue(runner, ['rev-parse', remoteRef],
    'C028-ACK-UNKNOWN', 'remote-reconciliation', 'remoteRef');
  if (!remoteHead.ok || !REVISION.test(remoteHead.value)) {
    return ok({ known: false, reachable: null, remoteHead: null });
  }
  const ancestry = runner(['merge-base', '--is-ancestor', commit, remoteRef]);
  if (!ancestry || ![0, 1].includes(ancestry.code)) {
    return ok({ known: false, reachable: null, remoteHead: remoteHead.value });
  }
  return ok({ known: true, reachable: ancestry.code === 0, remoteHead: remoteHead.value });
}

function persistPrivateAcknowledgment(file, journal, remoteHead) {
  return writePrivateMutableJson(file, {
    contractVersion: 'company-publication-acknowledgment/v1',
    generationId: journal.generationId,
    briefRunId: journal.briefRunId,
    commit: journal.commit,
    remote: journal.remote,
    branch: journal.branch,
    remoteHead,
    manifestSha256: journal.manifestSha256
  });
}

function restoreAcknowledgedCandidate(transactionDir, candidateRoot) {
  const baseline = loadTransactionBaseline(transactionDir, 'remote-acknowledged');
  if (!baseline.ok) return baseline;
  return restoreCheckout(
    candidateRoot,
    baseline.value.candidate,
    baseline.value.remote,
    baseline.value.branch,
    'candidate'
  );
}

export function pushCoupledTransaction({
  transactionDir,
  candidateRoot,
  publicationRoot,
  remote,
  branch,
  acknowledgmentFile
}) {
  if (![candidateRoot, publicationRoot, remote, branch, acknowledgmentFile]
    .every((value) => typeof value === 'string' && value)) {
    return fail('C028-PUSH', 'remote-reconciliation',
      'Exact checkout, remote, branch, and private acknowledgment identities are required.', 'input');
  }
  const journalResult = loadTransactionJournal(transactionDir);
  if (!journalResult.ok) return journalResult;
  let journal = clone(journalResult.value);
  if (journal.remote !== remote || journal.branch !== branch) {
    return fail('C028-PUSH', 'remote-reconciliation',
      'A retry cannot change the journaled remote or branch.', 'remote');
  }
  const runner = gitRunnerFor(publicationRoot);
  const head = commandValue(runner, ['rev-parse', 'HEAD'], 'C028-PUSH', 'remote-reconciliation', 'HEAD');
  if (!head.ok || head.value !== journal.commit) {
    return head.ok
      ? fail('C028-PUSH', 'remote-reconciliation',
        'A retry may push only the exact journaled local commit.', 'commit')
      : head;
  }

  let classification = classifyRemoteCommit(runner, remote, branch, journal.commit);
  if (!classification.ok) return classification;
  let pushAttempted = false;
  let pushAccepted = false;
  if (!(classification.value.known && classification.value.reachable)) {
    pushAttempted = true;
    const pushed = runner(['push', remote, `${journal.commit}:refs/heads/${branch}`]);
    pushAccepted = Boolean(pushed && pushed.code === 0);
    classification = classifyRemoteCommit(runner, remote, branch, journal.commit);
    if (!classification.ok) return classification;
  }

  if (!classification.value.known) {
    journal = { ...journal, state: 'remote-outcome-unknown' };
    const persisted = writePrivateMutableJson(path.join(transactionDir, TRANSACTION_JOURNAL_FILE), journal);
    if (!persisted.ok) return persisted;
    return ok({
      state: journal.state,
      commit: journal.commit,
      generationId: journal.generationId,
      remoteReachable: null,
      remoteHead: classification.value.remoteHead,
      pushAttempted,
      pushAccepted,
      acknowledgmentPersisted: false
    });
  }

  if (!classification.value.reachable) {
    journal = { ...journal, state: 'committed-pending-remote' };
    const persisted = writePrivateMutableJson(path.join(transactionDir, TRANSACTION_JOURNAL_FILE), journal);
    if (!persisted.ok) return persisted;
    return ok({
      state: journal.state,
      commit: journal.commit,
      generationId: journal.generationId,
      remoteReachable: false,
      remoteHead: classification.value.remoteHead,
      pushAttempted,
      pushAccepted,
      acknowledgmentPersisted: false
    });
  }

  journal = {
    ...journal,
    state: 'acknowledged',
    remoteHead: classification.value.remoteHead
  };
  const journalPersisted = writePrivateMutableJson(path.join(transactionDir, TRANSACTION_JOURNAL_FILE), journal);
  if (!journalPersisted.ok) return journalPersisted;
  const candidateRestored = restoreAcknowledgedCandidate(transactionDir, candidateRoot);
  if (!candidateRestored.ok) return candidateRestored;
  const acknowledgment = persistPrivateAcknowledgment(
    acknowledgmentFile,
    journal,
    classification.value.remoteHead
  );
  return ok({
    state: journal.state,
    commit: journal.commit,
    generationId: journal.generationId,
    remoteReachable: true,
    remoteHead: classification.value.remoteHead,
    pushAttempted,
    pushAccepted,
    candidateRestored: true,
    acknowledgmentPersisted: acknowledgment.ok,
    acknowledgmentCauseCode: acknowledgment.ok ? null : acknowledgment.error.causeCode
  });
}

export function assertCoupledGenerationAdmission({ transactionDir }) {
  const journalPath = path.join(transactionDir, TRANSACTION_JOURNAL_FILE);
  if (!existsSync(journalPath)) return ok({ admitted: true, reason: 'no-pending-commit' });
  const journal = loadTransactionJournal(transactionDir);
  if (!journal.ok) return journal;
  if (journal.value.state === 'acknowledged') {
    return ok({ admitted: true, reason: 'prior-commit-acknowledged', commit: journal.value.commit });
  }
  if (journal.value.state === 'remote-outcome-unknown') {
    return fail('C028-ACK-UNKNOWN', 'initialized',
      'Remote ancestry must be reconciled before another generation starts.', 'transactionJournal');
  }
  return fail('C028-PUSH', 'initialized',
    'The exact local commit must be pushed or reconciled before another generation starts.', 'transactionJournal');
}

function safeSubjectPath(subjectId) {
  return subjectId.replace(/:/g, '-');
}

function ensurePrivateTransaction(transactionDir, candidateRoot) {
  const relative = path.relative(candidateRoot, transactionDir);
  if (relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..')) {
    return fail('C028-PRIVACY', 'prepare',
      'The private transaction directory must be outside the candidate Git checkout.', 'transaction-dir');
  }
  return ok(true);
}

function readFileRecord(root, relativePath, code, phase) {
  if (!safeRelativePath(relativePath)) {
    return fail(code, phase, 'A publication path is not a safe repository-relative path.', relativePath);
  }
  try {
    const bytes = readFileSync(path.join(root, relativePath));
    return ok({
      path: relativePath,
      bytes,
      sha256: sha256(bytes),
      byteLength: bytes.length
    });
  } catch (error) {
    return fail(code, phase, 'A required publication file could not be read.', relativePath,
      error && typeof error.code === 'string' ? error.code : null);
  }
}

function readJsonRecord(root, relativePath, code, phase) {
  const record = readFileRecord(root, relativePath, code, phase);
  if (!record.ok) return record;
  try {
    return ok({ ...record.value, value: JSON.parse(record.value.bytes.toString('utf8')) });
  } catch (error) {
    return fail(code, phase, 'A required publication JSON file could not be parsed.', relativePath,
      error && typeof error.code === 'string' ? error.code : null);
  }
}

function jsonBytes(value) {
  return Buffer.from(`${stableStringify(value)}\n`, 'utf8');
}

function writeBytesExact(file, bytes, code, phase) {
  if (existsSync(file)) {
    const current = readFileSync(file);
    if (!current.equals(bytes)) {
      return fail(code, phase, 'A private publication stage path already contains different bytes.', file);
    }
    return ok(file);
  }
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, bytes, { flag: 'wx', mode: 0o600 });
  return ok(file);
}

function addRecord(records, record, code, phase) {
  const prior = records.get(record.path);
  if (prior && !prior.bytes.equals(record.bytes)) {
    return fail(code, phase, 'Two publication inputs assign different bytes to one path.', record.path);
  }
  records.set(record.path, record);
  return ok(record);
}

function inventoryEntry(record) {
  return { path: record.path, sha256: record.sha256, byteLength: record.byteLength };
}

function selectedWorkerDeltaRecords(candidateRoot) {
  const runner = gitRunnerFor(candidateRoot);
  const worktree = runner(['rev-parse', '--is-inside-work-tree']);
  if (!worktree || worktree.code !== 0 || String(worktree.stdout).trim() !== 'true') return ok([]);
  const status = runner(['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  if (!status || status.code !== 0) {
    return fail('C028-STAGE', 'coupled-assembly',
      'The shared worker publication delta could not be read.', 'candidate.status', 'git-status-failed');
  }
  const exact = new Set(PUBLIC_BRIEF_PROJECTION_PATHS);
  const paths = [];
  for (const record of String(status.stdout || '').split('\0').filter(Boolean)) {
    const code = record.slice(0, 2);
    const relativePath = record.slice(3);
    if (code.includes('R') || code.includes('C') || code.includes('D')) {
      if (exact.has(relativePath) || PUBLICATION_DELTA_PREFIXES.some((prefix) => relativePath.startsWith(prefix))) {
        return fail('C028-STAGE', 'coupled-assembly',
          'The shared worker selected a renamed, copied, or deleted publication path.', relativePath);
      }
      continue;
    }
    if (exact.has(relativePath) || PUBLICATION_DELTA_PREFIXES.some((prefix) => relativePath.startsWith(prefix))) {
      paths.push(relativePath);
    }
  }
  const records = [];
  for (const relativePath of [...new Set(paths)].sort()) {
    const record = readFileRecord(candidateRoot, relativePath, 'C028-STAGE', 'coupled-assembly');
    if (!record.ok) return record;
    records.push(record.value);
  }
  return ok(records);
}

function briefCandidate(candidateRoot, generation, versions, privateOwnerRead) {
  const currentRecord = readJsonRecord(candidateRoot, 'briefs/current.json', 'C028-BRIEF-CANDIDATE', 'coupled-assembly');
  if (!currentRecord.ok) return currentRecord;
  const current = currentRecord.value.value;
  const historyRecord = readJsonRecord(candidateRoot, 'briefs/history-current.json', 'C028-BRIEF-CANDIDATE', 'coupled-assembly');
  if (!historyRecord.ok) return historyRecord;
  const history = historyRecord.value.value;
  if (!current || current.contractVersion !== 'brief-current-pointer/v1' ||
      !history || history.contractVersion !== 'brief-history-current-pointer/v1' ||
      current.runId !== history.runId || current.generation !== history.generation ||
      !current.manifestRef || !safeRelativePath(current.manifestRef.path) ||
      !HASH.test(current.manifestRef.sha256 || '') || !HASH.test(current.runFingerprint || '') ||
      !current.registry || current.registry.fingerprint !== generation.registryFingerprint) {
    return fail('C028-BRIEF-CANDIDATE', 'coupled-assembly',
      'The brief pointers do not select one registry-coherent run.', 'briefs/current.json');
  }
  const manifestRecord = readJsonRecord(
    candidateRoot,
    current.manifestRef.path,
    'C028-BRIEF-CANDIDATE',
    'coupled-assembly'
  );
  if (!manifestRecord.ok) return manifestRecord;
  const manifest = manifestRecord.value.value;
  if (manifestRecord.value.sha256 !== current.manifestRef.sha256 ||
      !manifest || manifest.contractVersion !== 'brief-run-manifest/v1' ||
      manifest.runId !== current.runId || manifest.runFingerprint !== current.runFingerprint ||
      !manifest.registry || manifest.registry.fingerprint !== generation.registryFingerprint ||
      !Array.isArray(manifest.inventory)) {
    return fail('C028-BRIEF-CANDIDATE', 'coupled-assembly',
      'The selected brief manifest does not match its pointer, run, or frozen registry.', current.manifestRef.path);
  }
  const records = new Map();
  for (const entry of manifest.inventory) {
    if (!entry || !safeRelativePath(entry.path) || !HASH.test(entry.sha256 || '') ||
        !Number.isInteger(entry.byteLength) || entry.byteLength < 0) {
      return fail('C028-BRIEF-CANDIDATE', 'coupled-assembly',
        'The brief manifest contains an invalid inventory entry.', 'brief.inventory');
    }
    const record = readFileRecord(candidateRoot, entry.path, 'C028-BRIEF-CANDIDATE', 'coupled-assembly');
    if (!record.ok) return record;
    if (record.value.sha256 !== entry.sha256 || record.value.byteLength !== entry.byteLength) {
      return fail('C028-BRIEF-CANDIDATE', 'coupled-assembly',
        'A brief inventory file does not match its declared bytes.', entry.path);
    }
    const added = addRecord(records, record.value, 'C028-BRIEF-CANDIDATE', 'coupled-assembly');
    if (!added.ok) return added;
  }
  for (const record of [manifestRecord.value, historyRecord.value, currentRecord.value]) {
    const added = addRecord(records, record, 'C028-BRIEF-CANDIDATE', 'coupled-assembly');
    if (!added.ok) return added;
  }
  const workerDelta = selectedWorkerDeltaRecords(candidateRoot);
  if (!workerDelta.ok) return workerDelta;
  for (const record of workerDelta.value) {
    const added = addRecord(records, record, 'C028-BRIEF-CANDIDATE', 'coupled-assembly');
    if (!added.ok) return added;
  }

  const companyRef = current.tools && current.tools[INTEL.TOOL_ID];
  const manifestCompanyRef = manifest.tools && manifest.tools[INTEL.TOOL_ID];
  if (!companyRef || !manifestCompanyRef || companyRef.outcome !== 'newly-authored' ||
      companyRef.readPath !== manifestCompanyRef.readPath ||
      companyRef.readSha256 !== manifestCompanyRef.readSha256 ||
      !safeRelativePath(companyRef.readPath) || !HASH.test(companyRef.readSha256 || '')) {
    return fail('C028-OWNER-READ', 'coupled-assembly',
      'The brief graph does not contain exactly one real company owner-read ref.', 'brief.tools.company-intelligence-lab');
  }
  const ownerRecord = readJsonRecord(candidateRoot, companyRef.readPath, 'C028-OWNER-READ', 'coupled-assembly');
  if (!ownerRecord.ok) return ownerRecord;
  if (ownerRecord.value.sha256 !== companyRef.readSha256 ||
      stableStringify(ownerRecord.value.value) !== stableStringify(privateOwnerRead)) {
    return fail('C028-OWNER-READ', 'coupled-assembly',
      'The brief graph company owner read differs from the validated private candidate.', companyRef.readPath);
  }
  const ownerValidation = INTEL.validateCompanyToolModelRead(
    ownerRecord.value.value,
    generation,
    versions
  );
  if (!ownerValidation.ok) {
    return fail(ownerValidation.error.code, 'coupled-assembly', ownerValidation.error.reason,
      ownerValidation.error.field, ownerValidation.error.causeCode);
  }
  const finalRecord = readJsonRecord(candidateRoot, current.finalRef && current.finalRef.path,
    'C028-BRIEF-CANDIDATE', 'coupled-assembly');
  if (!finalRecord.ok) return finalRecord;
  const finalBrief = finalRecord.value.value;
  if (finalRecord.value.sha256 !== current.finalRef.sha256 ||
      !manifest.finalRef || manifest.finalRef.path !== current.finalRef.path ||
      manifest.finalRef.sha256 !== current.finalRef.sha256 ||
      !finalBrief || finalBrief.runId !== current.runId ||
      !finalBrief.toolBriefBundleRef || !HASH.test(finalBrief.toolBriefBundleRef.fingerprint || '') ||
      !finalBrief.companyPublication ||
      finalBrief.companyPublication.generationId !== generation.generationId ||
      finalBrief.companyPublication.ownerReadFingerprint !== privateOwnerRead.fingerprint ||
      finalBrief.companyPublication.ownerReadRef !== companyRef.readSha256) {
    return fail('C028-BRIEF-CANDIDATE', 'coupled-assembly',
      'The final brief does not consume the exact frozen company owner read and generation.', current.finalRef.path);
  }
  if (!records.has(current.finalRef.path)) {
    return fail('C028-BRIEF-CANDIDATE', 'coupled-assembly',
      'The final brief is absent from its own immutable inventory.', current.finalRef.path);
  }
  return ok({
    currentRecord: currentRecord.value,
    historyRecord: historyRecord.value,
    manifestRecord: manifestRecord.value,
    current,
    history,
    manifest,
    ownerRead: ownerRecord.value.value,
    ownerReadRef: companyRef.readSha256,
    finalBrief,
    records
  });
}

export function assembleCoupledPublication({ transactionDir, candidateRoot }) {
  const privateCheck = ensurePrivateTransaction(transactionDir, candidateRoot);
  if (!privateCheck.ok) return privateCheck;
  const frozenDoc = readJson(path.join(transactionDir, 'frozen-inputs.json'), 'C028-FROZEN-INPUT-DRIFT', 'coupled-assembly');
  if (!frozenDoc.ok) return frozenDoc;
  const frozenValidation = validateFrozenIdentity(frozenDoc.value);
  if (!frozenValidation.ok) return frozenValidation;
  const frozen = frozenValidation.value;

  const toolsDoc = readJson(path.join(candidateRoot, 'tools.json'), 'C028-REGISTRY-DRIFT', 'coupled-assembly');
  if (!toolsDoc.ok) return toolsDoc;
  const currentRegistry = RLCONTRACTS.validateRegistry(toolsDoc.value, null);
  if (!currentRegistry.ok || currentRegistry.value.registryFingerprint !== frozen.generation.registryFingerprint) {
    return fail('C028-REGISTRY-DRIFT', 'coupled-assembly',
      'The candidate registry no longer matches the generation freeze.', 'tools.json');
  }

  const versions = [];
  const subjects = [];
  const versionRecords = [];
  const priorRecords = [];
  const baselinePointers = [];
  for (const subject of frozen.policy.coveredSubjects) {
    const safe = safeSubjectPath(subject.subjectId);
    const privateVersion = readJsonRecord(transactionDir, `versions/${safe}.json`,
      'C028-COMPANY-CANDIDATE', 'coupled-assembly');
    if (!privateVersion.ok) return privateVersion;
    const version = privateVersion.value.value;
    const versionValidation = INTEL.validateReadVersionV2(version, frozen.generation, frozen.policy);
    if (!versionValidation.ok) {
      return fail(versionValidation.error.code, 'coupled-assembly', versionValidation.error.reason,
        versionValidation.error.field, versionValidation.error.causeCode);
    }
    const versionPath = INTEL.versionPathsFor(subject.subjectId, version.versionId).version;
    const stagedVersion = {
      path: versionPath,
      bytes: privateVersion.value.bytes,
      sha256: privateVersion.value.sha256,
      byteLength: privateVersion.value.byteLength
    };
    versions.push(versionValidation.value);
    versionRecords.push(stagedVersion);
    subjects.push({
      subjectId: subject.subjectId,
      versionId: version.versionId,
      versionPath,
      versionSha256: stagedVersion.sha256,
      contentFingerprint: version.contentFingerprint,
      priorVersionId: version.priorVersionId
    });

    const pointerPath = INTEL.versionPathsFor(subject.subjectId, null).currentPointer;
    const frozenPointer = frozen.baselinePointers[subject.subjectId];
    if (frozenPointer === null) {
      if (existsSync(path.join(candidateRoot, pointerPath))) {
        return fail('C028-BASELINE', 'coupled-assembly',
          'The candidate checkout gained a subject pointer absent from the frozen baseline.', pointerPath);
      }
      baselinePointers.push({ subjectId: subject.subjectId, path: pointerPath, sha256: null, versionId: null });
    } else {
      const pointerRecord = readJsonRecord(candidateRoot, pointerPath, 'C028-BASELINE', 'coupled-assembly');
      if (!pointerRecord.ok) return pointerRecord;
      if (stableStringify(pointerRecord.value.value) !== stableStringify(frozenPointer) ||
          frozenPointer.versionId !== version.priorVersionId) {
        return fail('C028-BASELINE', 'coupled-assembly',
          'The candidate checkout subject pointer differs from the frozen predecessor.', pointerPath);
      }
      baselinePointers.push({
        subjectId: subject.subjectId,
        path: pointerPath,
        sha256: pointerRecord.value.sha256,
        versionId: frozenPointer.versionId
      });
    }

    const frozenPredecessor = frozen.baselineVersions[subject.subjectId];
    if (version.priorVersionId === null) {
      if (frozenPredecessor !== null) {
        return fail('C028-BASELINE', 'coupled-assembly',
          'A first company version cannot retain predecessor bytes.', subject.subjectId);
      }
    } else {
      const priorPath = INTEL.versionPathsFor(subject.subjectId, version.priorVersionId).version;
      const priorRecord = readJsonRecord(candidateRoot, priorPath, 'C028-IMMUTABLE-MUTATION', 'coupled-assembly');
      if (!priorRecord.ok) return priorRecord;
      if (stableStringify(priorRecord.value.value) !== stableStringify(frozenPredecessor)) {
        return fail('C028-IMMUTABLE-MUTATION', 'coupled-assembly',
          'The predecessor version bytes no longer match the frozen immutable record.', priorPath);
      }
      priorRecords.push(priorRecord.value);
    }
  }
  versions.sort((left, right) => left.subjectId.localeCompare(right.subjectId));
  subjects.sort((left, right) => left.subjectId.localeCompare(right.subjectId));

  const privateOwner = readJson(path.join(transactionDir, 'company-owner-read.json'), 'C028-OWNER-READ', 'coupled-assembly');
  if (!privateOwner.ok) return privateOwner;
  const brief = briefCandidate(candidateRoot, frozen.generation, versions, privateOwner.value);
  if (!brief.ok) return brief;

  const inventoryRecords = new Map();
  for (const record of brief.value.records.values()) {
    const added = addRecord(inventoryRecords, record, 'C028-COHERENCE', 'coupled-assembly');
    if (!added.ok) return added;
  }
  for (const record of versionRecords.concat(priorRecords)) {
    const added = addRecord(inventoryRecords, record, 'C028-COHERENCE', 'coupled-assembly');
    if (!added.ok) return added;
  }

  let priorGenerationId = null;
  let coupledSelectorBaseline = {
    path: COUPLED_SELECTOR_PATH,
    sha256: null,
    generationId: null
  };
  if (existsSync(path.join(candidateRoot, COUPLED_SELECTOR_PATH))) {
    const priorSelector = readJsonRecord(candidateRoot, COUPLED_SELECTOR_PATH, 'C028-BASELINE', 'coupled-assembly');
    if (!priorSelector.ok) return priorSelector;
    const priorSelectorValue = priorSelector.value.value;
    if (!exactFields(priorSelectorValue, [
      'briefRunId', 'contractVersion', 'coveredSubjectIds', 'generationId', 'publicationManifestRef'
    ]) || priorSelectorValue.contractVersion !== COUPLED_POINTER_CONTRACT ||
        !SAFE_ID.test(priorSelectorValue.generationId || '') ||
        !SAFE_ID.test(priorSelectorValue.briefRunId || '') ||
        !Array.isArray(priorSelectorValue.coveredSubjectIds) ||
        !priorSelectorValue.publicationManifestRef ||
        !safeRelativePath(priorSelectorValue.publicationManifestRef.path) ||
        !HASH.test(priorSelectorValue.publicationManifestRef.sha256 || '')) {
      return fail('C028-BASELINE', 'coupled-assembly',
        'The prior coupled selector has an invalid generation identity.', COUPLED_SELECTOR_PATH);
    }
    priorGenerationId = priorSelectorValue.generationId;
    coupledSelectorBaseline = {
      path: COUPLED_SELECTOR_PATH,
      sha256: priorSelector.value.sha256,
      generationId: priorGenerationId
    };
  }

  const manifest = buildCoupledManifest({
    generation: frozen.generation,
    priorGenerationId,
    subjects,
    companyOwnerRead: {
      toolId: INTEL.TOOL_ID,
      fingerprint: brief.value.ownerRead.fingerprint,
      readRef: brief.value.ownerReadRef
    },
    brief: {
      runId: brief.value.current.runId,
      runFingerprint: brief.value.current.runFingerprint,
      manifestPath: brief.value.manifestRecord.path,
      manifestSha256: brief.value.manifestRecord.sha256,
      finalRef: brief.value.current.finalRef.sha256
    },
    inventory: Array.from(inventoryRecords.values()).map(inventoryEntry)
  });
  if (!manifest.ok) return manifest;
  const manifestPath = coupledManifestPath(manifest.value);
  const manifestBytes = jsonBytes(manifest.value);
  const manifestRecord = {
    path: manifestPath,
    bytes: manifestBytes,
    sha256: sha256(manifestBytes),
    byteLength: manifestBytes.length
  };

  const stagedRecords = new Map();
  const priorPathSet = new Set(priorRecords.map((record) => record.path));
  for (const record of inventoryRecords.values()) {
    if (priorPathSet.has(record.path)) continue;
    const added = addRecord(stagedRecords, record, 'C028-STAGE', 'coupled-assembly');
    if (!added.ok) return added;
  }
  const manifestAdded = addRecord(stagedRecords, manifestRecord, 'C028-STAGE', 'coupled-assembly');
  if (!manifestAdded.ok) return manifestAdded;

  const publicProjection = buildPublicCompanyProjection({
    manifest: manifest.value,
    manifestPath,
    manifestSha256: manifestRecord.sha256,
    versions,
    priorVersions: priorRecords.map((record) => record.value),
    ownerRead: brief.value.ownerRead
  });
  if (!publicProjection.ok) return publicProjection;
  const publicProjectionBytes = serializePublicCompanyProjection(publicProjection.value);
  if (!publicProjectionBytes.ok) return publicProjectionBytes;
  const publicProjectionAdded = addRecord(stagedRecords, {
    path: PUBLIC_PROJECTION_PATH,
    bytes: publicProjectionBytes.value,
    sha256: sha256(publicProjectionBytes.value),
    byteLength: publicProjectionBytes.value.length
  }, 'C028-STAGE', 'coupled-assembly');
  if (!publicProjectionAdded.ok) return publicProjectionAdded;

  const subjectPointerPaths = [];
  for (let index = 0; index < versions.length; index += 1) {
    const pointer = buildCompanyPointer(
      versions[index],
      subjects[index].versionPath,
      subjects[index].versionSha256,
      manifestPath,
      manifestRecord.sha256
    );
    if (!pointer.ok) return pointer;
    const pointerPath = INTEL.versionPathsFor(versions[index].subjectId, null).currentPointer;
    const bytes = jsonBytes(pointer.value);
    const added = addRecord(stagedRecords, {
      path: pointerPath,
      bytes,
      sha256: sha256(bytes),
      byteLength: bytes.length
    }, 'C028-STAGE', 'coupled-assembly');
    if (!added.ok) return added;
    subjectPointerPaths.push(pointerPath);
  }
  subjectPointerPaths.sort();

  const briefPointerPaths = ['briefs/history-current.json', 'briefs/current.json'];
  const selector = buildCoupledSelector(manifest.value, manifestPath, manifestRecord.sha256);
  if (!selector.ok) return selector;
  const selectorBytes = jsonBytes(selector.value);
  const selectorAdded = addRecord(stagedRecords, {
    path: COUPLED_SELECTOR_PATH,
    bytes: selectorBytes,
    sha256: sha256(selectorBytes),
    byteLength: selectorBytes.length
  }, 'C028-STAGE', 'coupled-assembly');
  if (!selectorAdded.ok) return selectorAdded;

  const pointerSet = new Set(subjectPointerPaths.concat(briefPointerPaths, [COUPLED_SELECTOR_PATH]));
  const candidatePaths = Array.from(stagedRecords.keys()).filter((relativePath) => !pointerSet.has(relativePath)).sort();
  const immutablePaths = candidatePaths.filter((relativePath) =>
    versionRecords.some((record) => record.path === relativePath) ||
    relativePath === manifestPath ||
    relativePath.startsWith('briefs/objects/') ||
    relativePath.startsWith('briefs/indexes/') ||
    relativePath.startsWith('briefs/runs/'));
  const files = Array.from(stagedRecords.values()).map(inventoryEntry)
    .sort((left, right) => left.path.localeCompare(right.path));
  const plan = {
    contractVersion: PROMOTION_PLAN_CONTRACT,
    generationId: frozen.generation.generationId,
    manifestRef: { path: manifestPath, sha256: manifestRecord.sha256 },
    order: {
      candidatePaths,
      subjectPointerPaths,
      briefPointerPaths,
      selectorPath: COUPLED_SELECTOR_PATH
    },
    immutablePaths: immutablePaths.slice().sort(),
    companyVersionPaths: versionRecords.map((record) => record.path).sort(),
    baseline: {
      coupledSelector: coupledSelectorBaseline,
      subjectPointers: baselinePointers.sort((left, right) => left.subjectId.localeCompare(right.subjectId)),
      priorImmutable: priorRecords.map(inventoryEntry).sort((left, right) => left.path.localeCompare(right.path))
    },
    files
  };

  for (const record of stagedRecords.values()) {
    const stagedPath = path.join(transactionDir, PUBLICATION_FILES_ROOT, record.path);
    const written = writeBytesExact(stagedPath, record.bytes, 'C028-GENERATION-COLLISION', 'coupled-assembly');
    if (!written.ok) return written;
  }
  const planWrite = writeJsonExact(path.join(transactionDir, 'publication-plan.json'), plan);
  if (!planWrite.ok) return planWrite;
  return ok({
    command: 'assemble',
    generationId: frozen.generation.generationId,
    briefRunId: brief.value.current.runId,
    manifestPath,
    manifestSha256: manifestRecord.sha256,
    candidateCount: candidatePaths.length,
    subjectPointerCount: subjectPointerPaths.length,
    briefPointerCount: briefPointerPaths.length,
    selectorPath: COUPLED_SELECTOR_PATH,
    inventoryCount: manifest.value.inventory.length
  });
}

function loadPromotionPlan(transactionDir) {
  const planDoc = readJson(path.join(transactionDir, 'publication-plan.json'), 'C028-STAGE', 'promotion');
  if (!planDoc.ok) return planDoc;
  const plan = planDoc.value;
  if (!exactFields(plan, [
    'baseline', 'companyVersionPaths', 'contractVersion', 'files', 'generationId',
    'immutablePaths', 'manifestRef', 'order'
  ]) || plan.contractVersion !== PROMOTION_PLAN_CONTRACT || !SAFE_ID.test(plan.generationId || '') ||
      !plan.manifestRef || !safeRelativePath(plan.manifestRef.path) || !HASH.test(plan.manifestRef.sha256 || '') ||
      !plan.order || !Array.isArray(plan.order.candidatePaths) ||
      !Array.isArray(plan.order.subjectPointerPaths) || !Array.isArray(plan.order.briefPointerPaths) ||
      plan.order.selectorPath !== COUPLED_SELECTOR_PATH || !Array.isArray(plan.immutablePaths) ||
      !Array.isArray(plan.companyVersionPaths) || !Array.isArray(plan.files) || !plan.baseline ||
      !plan.baseline.coupledSelector || !Array.isArray(plan.baseline.subjectPointers) ||
      !Array.isArray(plan.baseline.priorImmutable)) {
    return fail('C028-STAGE', 'promotion', 'The private publication plan has an invalid closed shape.', 'publication-plan.json');
  }
  const fileRows = normalizeInventory(plan.files);
  if (!fileRows || stableStringify(fileRows) !== stableStringify(plan.files)) {
    return fail('C028-STAGE', 'promotion', 'The private publication file inventory is not sorted and canonical.', 'plan.files');
  }
  const files = {};
  for (const entry of fileRows) {
    const record = readFileRecord(
      path.join(transactionDir, PUBLICATION_FILES_ROOT),
      entry.path,
      'C028-STAGE',
      'promotion'
    );
    if (!record.ok) return record;
    if (record.value.sha256 !== entry.sha256 || record.value.byteLength !== entry.byteLength) {
      return fail('C028-STAGE', 'promotion', 'A staged publication file differs from its private plan.', entry.path);
    }
    files[entry.path] = {
      bytes: record.value.bytes,
      sha256: record.value.sha256,
      byteLength: record.value.byteLength
    };
  }
  const declared = {
    contractVersion: DECLARED_PUBLICATION_CONTRACT,
    files,
    order: clone(plan.order),
    immutablePaths: plan.immutablePaths.slice()
  };
  const declaredValidation = validateDeclaredPublication(declared);
  if (!declaredValidation.ok) {
    return fail('C028-STAGE', 'promotion', 'The declared publication order or inventory is invalid.',
      'plan.order', declaredValidation.error && declaredValidation.error.reason);
  }
  if (!files[plan.manifestRef.path] || files[plan.manifestRef.path].sha256 !== plan.manifestRef.sha256 ||
      plan.companyVersionPaths.some((relativePath) => !plan.immutablePaths.includes(relativePath))) {
    return fail('C028-STAGE', 'promotion',
      'The coupled manifest or company versions are absent from the immutable candidate group.', 'plan.immutablePaths');
  }
  const coupledBaseline = plan.baseline.coupledSelector;
  if (!exactFields(coupledBaseline, ['generationId', 'path', 'sha256']) ||
      coupledBaseline.path !== COUPLED_SELECTOR_PATH ||
      !((coupledBaseline.generationId === null && coupledBaseline.sha256 === null) ||
        (SAFE_ID.test(coupledBaseline.generationId || '') && HASH.test(coupledBaseline.sha256 || '')))) {
    return fail('C028-STAGE', 'promotion',
      'The frozen coupled-selector baseline is invalid.', 'plan.baseline.coupledSelector');
  }
  for (const baseline of plan.baseline.subjectPointers) {
    if (!exactFields(baseline, ['path', 'sha256', 'subjectId', 'versionId']) ||
        !SUBJECT.test(baseline.subjectId || '') || !safeRelativePath(baseline.path) ||
        !(baseline.sha256 === null || HASH.test(baseline.sha256 || '')) ||
        !(baseline.versionId === null || SAFE_ID.test(baseline.versionId || ''))) {
      return fail('C028-STAGE', 'promotion', 'A frozen subject-pointer baseline is invalid.', 'plan.baseline.subjectPointers');
    }
  }
  const priorRows = normalizeInventory(plan.baseline.priorImmutable.length > 0
    ? plan.baseline.priorImmutable
    : [{ path: 'invalid', sha256: 'invalid', byteLength: -1 }]);
  if (plan.baseline.priorImmutable.length > 0 && !priorRows) {
    return fail('C028-STAGE', 'promotion', 'A frozen immutable predecessor baseline is invalid.', 'plan.baseline.priorImmutable');
  }
  return ok({ plan, declared });
}

function validatePromotionBaseline(plan, publicationRoot) {
  const coupledBaseline = plan.baseline.coupledSelector;
  const coupledPath = path.join(publicationRoot, coupledBaseline.path);
  if (coupledBaseline.sha256 === null) {
    if (existsSync(coupledPath)) {
      return fail('C028-PREDECESSOR-DRIFT', 'promotion-preflight',
        'A coupled selector appeared after the predecessor freeze.', coupledBaseline.path);
    }
  } else {
    if (!existsSync(coupledPath)) {
      return fail('C028-PREDECESSOR-DRIFT', 'promotion-preflight',
        'The frozen coupled selector disappeared before promotion.', coupledBaseline.path);
    }
    const currentCoupled = readJsonRecord(
      publicationRoot,
      coupledBaseline.path,
      'C028-PREDECESSOR-DRIFT',
      'promotion-preflight'
    );
    if (!currentCoupled.ok) return currentCoupled;
    if (currentCoupled.value.sha256 !== coupledBaseline.sha256 ||
        currentCoupled.value.value.generationId !== coupledBaseline.generationId) {
      return fail('C028-PREDECESSOR-DRIFT', 'promotion-preflight',
        'The coupled selector changed after the predecessor freeze.', coupledBaseline.path);
    }
  }
  for (const baseline of plan.baseline.subjectPointers) {
    const absolutePath = path.join(publicationRoot, baseline.path);
    if (baseline.sha256 === null) {
      if (existsSync(absolutePath)) {
        return fail('C028-PREDECESSOR-DRIFT', 'promotion-preflight',
          'A subject pointer appeared after the predecessor freeze.', baseline.path);
      }
      continue;
    }
    if (!existsSync(absolutePath)) {
      return fail('C028-PREDECESSOR-DRIFT', 'promotion-preflight',
        'A frozen subject pointer disappeared before promotion.', baseline.path);
    }
    const record = readJsonRecord(publicationRoot, baseline.path, 'C028-PREDECESSOR-DRIFT', 'promotion-preflight');
    if (!record.ok) return record;
    if (record.value.sha256 !== baseline.sha256 || record.value.value.versionId !== baseline.versionId) {
      return fail('C028-PREDECESSOR-DRIFT', 'promotion-preflight',
        'The subject pointer changed after the predecessor freeze.', baseline.path);
    }
  }
  for (const prior of plan.baseline.priorImmutable) {
    const record = readFileRecord(publicationRoot, prior.path, 'C028-IMMUTABLE-MUTATION', 'promotion-preflight');
    if (!record.ok) return record;
    if (record.value.sha256 !== prior.sha256 || record.value.byteLength !== prior.byteLength) {
      return fail('C028-IMMUTABLE-MUTATION', 'promotion-preflight',
        'A predecessor immutable version changed after the freeze.', prior.path);
    }
  }
  if (coupledBaseline.generationId !== null) {
    const coherent = validateCoupledPublication(publicationRoot, coupledBaseline.generationId);
    if (!coherent.ok) {
      return fail('C028-PREDECESSOR-DRIFT', 'promotion-preflight',
        'The prior coupled publication stopped matching its frozen selector before promotion.',
        coupledBaseline.path,
        coherent.error && coherent.error.code);
    }
  }
  return ok(true);
}

function gitRunnerFor(root) {
  return (args) => {
    const result = spawnSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: GIT_OUTPUT_MAX_BYTES,
      timeout: 30_000,
      killSignal: 'SIGKILL',
      env: {
        ...process.env,
        PATH: '/opt/local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
      }
    });
    return {
      code: result.error ? 1 : result.status,
      stdout: result.stdout || '',
      stderr: result.error ? result.error.message : (result.stderr || '')
    };
  };
}

function resumeSelectedGeneration(loaded, publicationRoot) {
  const selectorPath = path.join(publicationRoot, COUPLED_SELECTOR_PATH);
  if (!existsSync(selectorPath)) return ok(null);
  const selector = readJsonRecord(publicationRoot, COUPLED_SELECTOR_PATH,
    'C028-COHERENCE', 'promotion-resume');
  if (!selector.ok) return selector;
  if (selector.value.value?.generationId !== loaded.plan.generationId) return ok(null);
  if (selector.value.value.publicationManifestRef?.path !== loaded.plan.manifestRef.path ||
      selector.value.value.publicationManifestRef?.sha256 !== loaded.plan.manifestRef.sha256) {
    return fail('C028-GENERATION-COLLISION', 'promotion-resume',
      'The selected generation resolves to a different coupled manifest.', COUPLED_SELECTOR_PATH);
  }
  for (const relativePath of Object.keys(loaded.declared.files).sort()) {
    const expected = loaded.declared.files[relativePath];
    const actual = readFileRecord(publicationRoot, relativePath,
      loaded.plan.companyVersionPaths.includes(relativePath)
        ? 'C028-GENERATION-COLLISION'
        : (loaded.plan.immutablePaths.includes(relativePath) ? 'C028-IMMUTABLE-MUTATION' : 'C028-COHERENCE'),
      'promotion-resume');
    if (!actual.ok) return actual;
    if (!actual.value.bytes.equals(expected.bytes)) {
      const code = loaded.plan.companyVersionPaths.includes(relativePath)
        ? 'C028-GENERATION-COLLISION'
        : (loaded.plan.immutablePaths.includes(relativePath) ? 'C028-IMMUTABLE-MUTATION' : 'C028-COHERENCE');
      return fail(code, 'promotion-resume',
        'The selected generation contains bytes that differ from its private candidate.', relativePath);
    }
  }
  const coherent = validateCoupledPublication(publicationRoot, loaded.plan.generationId);
  if (!coherent.ok) return coherent;
  return ok(coherent.value);
}

export function promoteCoupledPublication({
  transactionDir,
  publicationRoot,
  gitRunner,
  onWrite
}) {
  const loaded = loadPromotionPlan(transactionDir);
  if (!loaded.ok) return loaded;
  const selected = resumeSelectedGeneration(loaded.value, publicationRoot);
  if (!selected.ok) return selected;
  if (selected.value !== null) {
    const runner = gitRunner === undefined ? gitRunnerFor(publicationRoot) : gitRunner;
    let staged = [];
    let stagedHashes = {};
    if (runner !== null) {
      const staging = stageDeclaredPublication(loaded.value.declared, runner);
      if (!staging.ok) {
        return fail('C028-STAGE', 'promotion-resume',
          'The resumed Git index contains bytes outside the exact publication candidate.',
          'git-index', staging.error && staging.error.reason);
      }
      staged = staging.staged;
      stagedHashes = staging.stagedHashes;
    }
    return ok({
      command: 'promote',
      resumed: true,
      generationId: loaded.value.plan.generationId,
      briefRunId: selected.value.briefRunId,
      manifestPath: loaded.value.plan.manifestRef.path,
      manifestSha256: loaded.value.plan.manifestRef.sha256,
      writeOrder: [
        ...loaded.value.plan.order.candidatePaths,
        ...loaded.value.plan.order.subjectPointerPaths,
        ...loaded.value.plan.order.briefPointerPaths,
        loaded.value.plan.order.selectorPath
      ],
      written: [],
      reused: loaded.value.plan.immutablePaths.slice(),
      staged,
      stagedHashes
    });
  }
  const baseline = validatePromotionBaseline(loaded.value.plan, publicationRoot);
  if (!baseline.ok) return baseline;
  const promoted = promoteDeclaredPublication(loaded.value.declared, publicationRoot, { onWrite });
  if (!promoted.ok) {
    const relativePath = promoted.error && promoted.error.detail;
    if (promoted.error && promoted.error.reason === 'immutable-collision') {
      const code = loaded.value.plan.companyVersionPaths.includes(relativePath)
        ? 'C028-GENERATION-COLLISION'
        : 'C028-IMMUTABLE-MUTATION';
      return fail(code, 'promotion', 'An immutable publication identity already contains different bytes.',
        typeof relativePath === 'string' ? relativePath : 'immutable', promoted.error.reason);
    }
    return fail('C028-STAGE', 'promotion', 'Declared publication materialization failed.',
      typeof relativePath === 'string' ? relativePath : 'publication', promoted.error && promoted.error.reason);
  }
  const runner = gitRunner === undefined ? gitRunnerFor(publicationRoot) : gitRunner;
  let staged = [];
  let stagedHashes = {};
  if (runner !== null) {
    const staging = stageDeclaredPublication(loaded.value.declared, runner);
    if (!staging.ok) {
      return fail('C028-STAGE', 'promotion', 'The Git index contains an undeclared or unstaged publication path.',
        'git-index', staging.error && staging.error.reason);
    }
    staged = staging.staged;
    stagedHashes = staging.stagedHashes;
  }
  const coherent = validateCoupledPublication(publicationRoot, loaded.value.plan.generationId);
  if (!coherent.ok) return coherent;
  return ok({
    command: 'promote',
    resumed: false,
    generationId: loaded.value.plan.generationId,
    briefRunId: coherent.value.briefRunId,
    manifestPath: loaded.value.plan.manifestRef.path,
    manifestSha256: loaded.value.plan.manifestRef.sha256,
    writeOrder: promoted.promoted.writeOrder,
    written: promoted.promoted.written,
    reused: promoted.promoted.reused,
    staged,
    stagedHashes
  });
}

function requireInventoryRecord(root, inventoryByPath, relativePath, code = 'C028-COHERENCE') {
  const expected = inventoryByPath.get(relativePath);
  if (!expected) {
    return fail(code, 'coherence-validation', 'A required referenced file is absent from the coupled inventory.', relativePath);
  }
  const record = readJsonRecord(root, relativePath, code, 'coherence-validation');
  if (!record.ok) return record;
  if (record.value.sha256 !== expected.sha256 || record.value.byteLength !== expected.byteLength) {
    return fail(code, 'coherence-validation', 'A referenced file differs from the coupled inventory.', relativePath);
  }
  return record;
}

export function validateCoupledPublication(root, generationId) {
  const selectorRecord = readJsonRecord(root, COUPLED_SELECTOR_PATH, 'C028-COHERENCE', 'coherence-validation');
  if (!selectorRecord.ok) return selectorRecord;
  const selector = selectorRecord.value.value;
  if (!exactFields(selector, [
    'briefRunId', 'contractVersion', 'coveredSubjectIds', 'generationId', 'publicationManifestRef'
  ]) || selector.contractVersion !== COUPLED_POINTER_CONTRACT || selector.generationId !== generationId ||
      !Array.isArray(selector.coveredSubjectIds) || selector.coveredSubjectIds.length === 0 ||
      !selector.publicationManifestRef || !safeRelativePath(selector.publicationManifestRef.path) ||
      !HASH.test(selector.publicationManifestRef.sha256 || '')) {
    return fail('C028-COHERENCE', 'coherence-validation',
      'The coupled selector has an invalid identity or manifest ref.', COUPLED_SELECTOR_PATH);
  }
  const manifestRecord = readJsonRecord(root, selector.publicationManifestRef.path,
    'C028-COHERENCE', 'coherence-validation');
  if (!manifestRecord.ok) return manifestRecord;
  if (manifestRecord.value.sha256 !== selector.publicationManifestRef.sha256) {
    return fail('C028-COHERENCE', 'coherence-validation',
      'The coupled selector manifest hash does not match disk.', selector.publicationManifestRef.path);
  }
  const manifest = manifestRecord.value.value;
  if (!manifest || manifest.contractVersion !== COUPLED_MANIFEST_CONTRACT ||
      manifest.generation?.generationId !== generationId || manifest.brief?.runId !== selector.briefRunId) {
    return fail('C028-COHERENCE', 'coherence-validation',
      'The coupled manifest and selector name different company or brief identities.', selector.publicationManifestRef.path);
  }
  const rebuiltManifest = buildCoupledManifest({
    generation: manifest.generation,
    priorGenerationId: manifest.priorGenerationId,
    subjects: manifest.subjects,
    companyOwnerRead: manifest.companyOwnerRead,
    brief: manifest.brief,
    inventory: manifest.inventory
  });
  if (!rebuiltManifest.ok || stableStringify(rebuiltManifest.value) !== stableStringify(manifest)) {
    return fail('C028-COHERENCE', 'coherence-validation',
      'The coupled manifest fingerprint does not reproduce from its content.', 'manifest.manifestFingerprint');
  }
  const inventory = normalizeInventory(manifest.inventory);
  if (!inventory || stableStringify(inventory) !== stableStringify(manifest.inventory)) {
    return fail('C028-COHERENCE', 'coherence-validation', 'The coupled inventory is not canonical.', 'manifest.inventory');
  }
  const inventoryByPath = new Map(inventory.map((entry) => [entry.path, entry]));
  for (const entry of inventory) {
    const record = readFileRecord(root, entry.path, 'C028-COHERENCE', 'coherence-validation');
    if (!record.ok) return record;
    if (record.value.sha256 !== entry.sha256 || record.value.byteLength !== entry.byteLength) {
      return fail('C028-COHERENCE', 'coherence-validation',
        'A coupled inventory entry differs from disk.', entry.path);
    }
  }

  const configDoc = readJson(path.join(root, 'company-intelligence.config.json'), 'C028-SUBJECT-POLICY', 'coherence-validation');
  if (!configDoc.ok) return configDoc;
  const policy = validatePublicationPolicy(configDoc.value);
  if (!policy.ok) return policy;
  if (stableFingerprint(policy.value.coveredSubjects) !== manifest.generation.coveredSubjectSetFingerprint) {
    return fail('C028-SUBJECT-POLICY', 'coherence-validation',
      'The covered-subject policy differs from the manifest generation.', 'company-intelligence.config.json');
  }
  const expectedSubjects = policy.value.coveredSubjects.map((subject) => subject.subjectId).sort();
  if (stableStringify(expectedSubjects) !== stableStringify(selector.coveredSubjectIds) ||
      stableStringify(expectedSubjects) !== stableStringify(manifest.subjects.map((subject) => subject.subjectId))) {
    return fail('C028-COHERENCE', 'coherence-validation',
      'The policy, selector, and manifest covered-subject sets disagree.', 'coveredSubjectIds');
  }
  const toolsDoc = readJson(path.join(root, 'tools.json'), 'C028-REGISTRY-DRIFT', 'coherence-validation');
  if (!toolsDoc.ok) return toolsDoc;
  const registry = RLCONTRACTS.validateRegistry(toolsDoc.value, null);
  if (!registry.ok || registry.value.registryFingerprint !== manifest.generation.registryFingerprint) {
    return fail('C028-REGISTRY-DRIFT', 'coherence-validation',
      'The on-disk registry differs from the coupled generation.', 'tools.json');
  }

  const versions = [];
  const priorVersions = [];
  for (const subject of manifest.subjects) {
    const versionRecord = requireInventoryRecord(root, inventoryByPath, subject.versionPath, 'C028-COMPANY-CANDIDATE');
    if (!versionRecord.ok) return versionRecord;
    const version = versionRecord.value.value;
    if (versionRecord.value.sha256 !== subject.versionSha256 ||
        version.contentFingerprint !== subject.contentFingerprint ||
        version.priorVersionId !== subject.priorVersionId || version.versionId !== subject.versionId) {
      return fail('C028-COMPANY-CANDIDATE', 'coherence-validation',
        'A manifest subject differs from its immutable version bytes.', subject.versionPath);
    }
    const versionValidation = INTEL.validateReadVersionV2(version, manifest.generation, policy.value);
    if (!versionValidation.ok) {
      return fail(versionValidation.error.code, 'coherence-validation', versionValidation.error.reason,
        versionValidation.error.field, versionValidation.error.causeCode);
    }
    versions.push(versionValidation.value);

    const pointerPath = INTEL.versionPathsFor(subject.subjectId, null).currentPointer;
    const pointerRecord = readJsonRecord(root, pointerPath, 'C028-COHERENCE', 'coherence-validation');
    if (!pointerRecord.ok) return pointerRecord;
    const pointer = pointerRecord.value.value;
    if (!exactFields(pointer, [
      'contentFingerprint', 'contractVersion', 'generationId', 'priorVersionId',
      'publicationManifestRef', 'subjectId', 'versionId', 'versionRef'
    ]) || pointer.contractVersion !== COMPANY_POINTER_CONTRACT ||
        pointer.subjectId !== subject.subjectId || pointer.generationId !== generationId ||
        pointer.versionId !== subject.versionId || pointer.priorVersionId !== subject.priorVersionId ||
        pointer.contentFingerprint !== subject.contentFingerprint ||
        pointer.versionRef?.path !== subject.versionPath || pointer.versionRef?.sha256 !== subject.versionSha256 ||
        pointer.publicationManifestRef?.path !== selector.publicationManifestRef.path ||
        pointer.publicationManifestRef?.sha256 !== selector.publicationManifestRef.sha256) {
      return fail('C028-COHERENCE', 'coherence-validation',
        'A subject pointer does not identify the manifest version and predecessor.', pointerPath);
    }
    if (subject.priorVersionId !== null) {
      const priorPath = INTEL.versionPathsFor(subject.subjectId, subject.priorVersionId).version;
      const priorRecord = requireInventoryRecord(root, inventoryByPath, priorPath, 'C028-IMMUTABLE-MUTATION');
      if (!priorRecord.ok) return priorRecord;
      priorVersions.push(priorRecord.value.value);
    }
  }

  const briefCurrent = requireInventoryRecord(root, inventoryByPath, 'briefs/current.json', 'C028-BRIEF-CANDIDATE');
  if (!briefCurrent.ok) return briefCurrent;
  const briefHistory = requireInventoryRecord(root, inventoryByPath, 'briefs/history-current.json', 'C028-BRIEF-CANDIDATE');
  if (!briefHistory.ok) return briefHistory;
  const current = briefCurrent.value.value;
  const history = briefHistory.value.value;
  if (current.contractVersion !== 'brief-current-pointer/v1' ||
      history.contractVersion !== 'brief-history-current-pointer/v1' ||
      current.runId !== manifest.brief.runId || current.runFingerprint !== manifest.brief.runFingerprint ||
      history.runId !== manifest.brief.runId || current.manifestRef?.path !== manifest.brief.manifestPath ||
      current.manifestRef?.sha256 !== manifest.brief.manifestSha256 ||
      current.finalRef?.sha256 !== manifest.brief.finalRef ||
      current.registry?.fingerprint !== manifest.generation.registryFingerprint) {
    return fail('C028-BRIEF-CANDIDATE', 'coherence-validation',
      'The brief pointers disagree with the coupled manifest.', 'briefs/current.json');
  }
  const briefManifest = requireInventoryRecord(root, inventoryByPath, manifest.brief.manifestPath,
    'C028-BRIEF-CANDIDATE');
  if (!briefManifest.ok) return briefManifest;
  if (briefManifest.value.sha256 !== manifest.brief.manifestSha256 ||
      briefManifest.value.value.runId !== manifest.brief.runId ||
      briefManifest.value.value.runFingerprint !== manifest.brief.runFingerprint) {
    return fail('C028-BRIEF-CANDIDATE', 'coherence-validation',
      'The immutable brief manifest disagrees with the coupled manifest.', manifest.brief.manifestPath);
  }
  const companyRef = current.tools && current.tools[INTEL.TOOL_ID];
  if (!companyRef || companyRef.outcome !== 'newly-authored' ||
      companyRef.readSha256 !== manifest.companyOwnerRead.readRef) {
    return fail('C028-OWNER-READ', 'coherence-validation',
      'The current brief has no exact real company owner-read ref.', 'briefs/current.json');
  }
  const ownerRead = requireInventoryRecord(root, inventoryByPath, companyRef.readPath, 'C028-OWNER-READ');
  if (!ownerRead.ok) return ownerRead;
  if (ownerRead.value.sha256 !== manifest.companyOwnerRead.readRef ||
      ownerRead.value.value.fingerprint !== manifest.companyOwnerRead.fingerprint) {
    return fail('C028-OWNER-READ', 'coherence-validation',
      'The company owner read fingerprint or content ref differs from the coupled manifest.', companyRef.readPath);
  }
  const ownerValidation = INTEL.validateCompanyToolModelRead(ownerRead.value.value, manifest.generation, versions);
  if (!ownerValidation.ok) {
    return fail(ownerValidation.error.code, 'coherence-validation', ownerValidation.error.reason,
      ownerValidation.error.field, ownerValidation.error.causeCode);
  }
  const finalBrief = requireInventoryRecord(root, inventoryByPath, current.finalRef.path, 'C028-BRIEF-CANDIDATE');
  if (!finalBrief.ok) return finalBrief;
  const finalBody = finalBrief.value.value;
  if (finalBrief.value.sha256 !== manifest.brief.finalRef || finalBody.runId !== manifest.brief.runId ||
      finalBody.companyPublication?.generationId !== generationId ||
      finalBody.companyPublication?.ownerReadFingerprint !== manifest.companyOwnerRead.fingerprint ||
      finalBody.companyPublication?.ownerReadRef !== manifest.companyOwnerRead.readRef ||
      !finalBody.toolBriefBundleRef || !HASH.test(finalBody.toolBriefBundleRef.fingerprint || '')) {
    return fail('C028-BRIEF-CANDIDATE', 'coherence-validation',
      'The final brief does not consume the manifest company owner read.', current.finalRef.path);
  }
  const publicProjectionEntries = COUPLED_PUBLIC_BRIEF_PATHS.filter((relativePath) => inventoryByPath.has(relativePath));
  if (publicProjectionEntries.length > 0 && publicProjectionEntries.length !== COUPLED_PUBLIC_BRIEF_PATHS.length) {
    return fail('C028-BRIEF-CANDIDATE', 'coherence-validation',
      'The public Market Action projection is only partially present in the coupled inventory.',
      COUPLED_PUBLIC_BRIEF_PATHS.find((relativePath) => !inventoryByPath.has(relativePath)));
  }
  if (publicProjectionEntries.length === COUPLED_PUBLIC_BRIEF_PATHS.length) {
    const publicPayload = requireInventoryRecord(root, inventoryByPath, 'market-brief.payload.json', 'C028-BRIEF-CANDIDATE');
    if (!publicPayload.ok) return publicPayload;
    const publicSnapshot = requireInventoryRecord(root, inventoryByPath, 'market-brief.snapshot.json', 'C028-BRIEF-CANDIDATE');
    if (!publicSnapshot.ok) return publicSnapshot;
    const payloadCompanyRead = publicPayload.value.value?.toolReads?.[INTEL.TOOL_ID];
    const snapshotCompanyRead = publicSnapshot.value.value?.toolReads?.[INTEL.TOOL_ID];
    if (stableStringify(payloadCompanyRead) !== stableStringify(ownerRead.value.value) ||
        stableStringify(snapshotCompanyRead) !== stableStringify(ownerRead.value.value)) {
      return fail('C028-OWNER-READ', 'coherence-validation',
        'The public Market Action payload and snapshot do not carry the exact company owner read.',
        'market-brief.payload.json');
    }
  }
  const publicAttempt = readCurrentPublicAttempt(root, generationId);
  if (!publicAttempt.ok) return publicAttempt;
  const expectedProjection = buildPublicCompanyProjection({
    manifest,
    manifestPath: selector.publicationManifestRef.path,
    manifestSha256: selector.publicationManifestRef.sha256,
    versions,
    priorVersions,
    ownerRead: ownerRead.value.value,
    attempt: publicAttempt.value === null ? null : publicAttempt.value.attempt
  });
  if (!expectedProjection.ok) return expectedProjection;
  const expectedProjectionBytes = serializePublicCompanyProjection(expectedProjection.value);
  if (!expectedProjectionBytes.ok) return expectedProjectionBytes;
  const actualProjection = readFileRecord(root, PUBLIC_PROJECTION_PATH, 'C028-COHERENCE', 'coherence-validation');
  if (!actualProjection.ok) return actualProjection;
  if (!actualProjection.value.bytes.equals(expectedProjectionBytes.value)) {
    return fail('C028-COHERENCE', 'coherence-validation',
      'The committed-first-paint projection differs from the acknowledged pair.', PUBLIC_PROJECTION_PATH);
  }
  return ok({
    command: 'validate',
    generationId,
    briefRunId: manifest.brief.runId,
    manifestPath: selector.publicationManifestRef.path,
    manifestSha256: selector.publicationManifestRef.sha256,
    subjectCount: versions.length,
    inventoryCount: inventory.length,
    ownerReadFingerprint: manifest.companyOwnerRead.fingerprint,
    registryFingerprint: manifest.generation.registryFingerprint
  });
}

export function recordPublicAttempt({ root, input }) {
  const selectorRecord = readJsonRecord(root, COUPLED_SELECTOR_PATH, 'C028-COHERENCE', 'public-attempt-write');
  if (!selectorRecord.ok) return selectorRecord;
  const selector = selectorRecord.value.value;
  const baseline = validateCoupledPublication(root, selector.generationId);
  if (!baseline.ok) return baseline;
  const attempt = buildAttemptRecord(input);
  if (!attempt.ok) return attempt;
  if (attempt.value.authoritativeGenerationId !== selector.generationId ||
      attempt.value.state === 'acknowledged' || !attempt.value.authoritativeUnchanged) {
    return fail('C028-COHERENCE', 'public-attempt-write',
      'A diagnostics-only public attempt must preserve the selected acknowledged generation.',
      'attempt.authoritativeGenerationId');
  }
  const manifestRecord = readJsonRecord(
    root,
    selector.publicationManifestRef.path,
    'C028-COHERENCE',
    'public-attempt-write'
  );
  if (!manifestRecord.ok) return manifestRecord;
  const manifest = manifestRecord.value.value;
  const versions = [];
  const priorVersions = [];
  for (const subject of manifest.subjects) {
    const version = readJsonRecord(root, subject.versionPath, 'C028-COMPANY-CANDIDATE', 'public-attempt-write');
    if (!version.ok) return version;
    versions.push(version.value.value);
    if (subject.priorVersionId !== null) {
      const priorPath = INTEL.versionPathsFor(subject.subjectId, subject.priorVersionId).version;
      const prior = readJsonRecord(root, priorPath, 'C028-IMMUTABLE-MUTATION', 'public-attempt-write');
      if (!prior.ok) return prior;
      priorVersions.push(prior.value.value);
    }
  }
  const briefCurrent = readJsonRecord(root, 'briefs/current.json', 'C028-BRIEF-CANDIDATE', 'public-attempt-write');
  if (!briefCurrent.ok) return briefCurrent;
  const companyRef = briefCurrent.value.value?.tools?.[INTEL.TOOL_ID];
  const ownerRead = readJsonRecord(root, companyRef?.readPath, 'C028-OWNER-READ', 'public-attempt-write');
  if (!ownerRead.ok) return ownerRead;
  const projection = buildPublicCompanyProjection({
    manifest,
    manifestPath: selector.publicationManifestRef.path,
    manifestSha256: selector.publicationManifestRef.sha256,
    versions,
    priorVersions,
    ownerRead: ownerRead.value.value,
    attempt: attempt.value
  });
  if (!projection.ok) return projection;
  const projectionBytes = serializePublicCompanyProjection(projection.value);
  if (!projectionBytes.ok) return projectionBytes;
  const attemptPath = publicAttemptPath(attempt.value.attemptId);
  const attemptBytes = jsonBytes(attempt.value);
  const pointer = {
    contractVersion: 'company-publication-attempt-pointer/v1',
    attemptId: attempt.value.attemptId,
    authoritativeGenerationId: selector.generationId,
    attemptRef: { path: attemptPath, sha256: sha256(attemptBytes) }
  };
  const attemptWrite = writeBytesExact(
    path.join(root, attemptPath),
    attemptBytes,
    'C028-GENERATION-COLLISION',
    'public-attempt-write'
  );
  if (!attemptWrite.ok) return attemptWrite;
  const projectionWrite = writePublicMutable(path.join(root, PUBLIC_PROJECTION_PATH), projectionBytes.value);
  if (!projectionWrite.ok) return projectionWrite;
  const pointerWrite = writePublicMutable(path.join(root, PUBLIC_ATTEMPT_POINTER_PATH), jsonBytes(pointer));
  if (!pointerWrite.ok) return pointerWrite;
  const validated = validateCoupledPublication(root, selector.generationId);
  if (!validated.ok) return validated;
  return ok({
    command: 'record-attempt',
    attemptId: attempt.value.attemptId,
    attemptPath,
    attemptPointerPath: PUBLIC_ATTEMPT_POINTER_PATH,
    projectionPath: PUBLIC_PROJECTION_PATH,
    authoritativeGenerationId: selector.generationId
  });
}

function envAuthorIdentity() {
  const values = {
    providerId: process.env.COMPANY_PLAN_AUTHOR_PROVIDER_ID,
    modelId: process.env.COMPANY_PLAN_AUTHOR_MODEL_ID,
    promptPolicyVersion: process.env.COMPANY_PLAN_AUTHOR_PROMPT_POLICY_VERSION,
    schemaVersion: process.env.COMPANY_PLAN_AUTHOR_SCHEMA_VERSION,
    validatorVersion: process.env.COMPANY_PLAN_AUTHOR_VALIDATOR_VERSION
  };
  if (Object.values(values).some((value) => typeof value !== 'string' || !value)) {
    return fail('C028-PLAN-AUTHOR', 'prepare', 'The non-secret company-plan author identity is incomplete.', 'authorIdentity');
  }
  return ok(values);
}

function loadBaseline(candidateRoot, policy) {
  const pointers = {};
  const versions = {};
  for (const subject of policy.coveredSubjects) {
    const paths = INTEL.versionPathsFor(subject.subjectId, null);
    const pointerPath = path.join(candidateRoot, paths.currentPointer);
    if (!existsSync(pointerPath)) {
      pointers[subject.subjectId] = null;
      versions[subject.subjectId] = null;
      continue;
    }
    const pointer = readJson(pointerPath, 'C028-FROZEN-INPUT-DRIFT', 'prepare');
    if (!pointer.ok) return pointer;
    const versionPath = INTEL.versionPathsFor(subject.subjectId, pointer.value.versionId).version;
    const version = readJson(path.join(candidateRoot, versionPath), 'C028-FROZEN-INPUT-DRIFT', 'prepare');
    if (!version.ok) return version;
    pointers[subject.subjectId] = pointer.value;
    versions[subject.subjectId] = version.value;
  }
  return ok({ pointers, versions });
}

function sourceInputs(candidateRoot, policy, ownerReads, snapshot) {
  const sources = [];
  const subjectInputs = {};
  for (const subject of policy.coveredSubjects) {
    const ownerMap = ownerReads && ownerReads.ownerReads && typeof ownerReads.ownerReads === 'object'
      ? ownerReads.ownerReads
      : {};
    for (const toolId of Object.keys(ownerMap).sort()) {
      const payload = ownerMap[toolId] && ownerMap[toolId][subject.ticker];
      if (!payload || typeof payload !== 'object') continue;
      sources.push({
        sourceId: `owner:${toolId}:${subject.subjectId}`,
        sourceKind: 'per-ticker-owner-read',
        ownerToolId: toolId,
        subjectId: subject.subjectId,
        asOf: payload.asOf || null,
        provenanceClass: payload.state === 'unavailable' ? 'unavailable' : 'derived',
        maxHorizon: 'structural',
        deepLink: typeof payload.ownerDeepLink === 'string' ? payload.ownerDeepLink : null,
        state: SOURCE_STATES.includes(payload.state) ? payload.state : 'unavailable',
        payload: { ...clone(payload), toolId, subjectId: subject.subjectId, ticker: subject.ticker }
      });
    }
    const eventsPath = path.join(candidateRoot, `data/company-intelligence/${safeSubjectPath(subject.subjectId)}/events.json`);
    let committedEvents = null;
    if (existsSync(eventsPath)) {
      const parsed = readJson(eventsPath, 'C028-FROZEN-INPUT-DRIFT', 'prepare');
      if (!parsed.ok) return parsed;
      committedEvents = parsed.value;
      sources.push({
        sourceId: `committed-events:${subject.subjectId}`,
        sourceKind: 'committed-file',
        ownerToolId: null,
        subjectId: subject.subjectId,
        asOf: committedEvents.asOf || null,
        provenanceClass: 'observed',
        maxHorizon: 'event',
        deepLink: null,
        state: 'current',
        payload: committedEvents
      });
    }
    subjectInputs[subject.subjectId] = {
      committedEvents,
      publishedRegimeContext: snapshot && snapshot.regime ? {
        available: true,
        archetypeName: typeof snapshot.regime.band === 'string' ? snapshot.regime.band : 'Published market regime',
        asOf: String(snapshot.asOf || snapshot.generatedAt).slice(0, 10)
      } : { available: false },
      marketSentiment: null
    };
  }
  if (snapshot && snapshot.regime) {
    sources.push({
      sourceId: 'tier-a-market-regime',
      sourceKind: 'tier-a-market',
      ownerToolId: null,
      subjectId: null,
      asOf: snapshot.asOf || snapshot.generatedAt,
      provenanceClass: 'proxy',
      maxHorizon: 'swing',
      deepLink: 'market-brief.html',
      state: 'current',
      payload: snapshot.regime
    });
  }
  return ok({ sources, subjectInputs });
}

export function prepareTransaction({ transactionDir, candidateRoot, triggerFile, authorIdentity }) {
  const privateCheck = ensurePrivateTransaction(transactionDir, candidateRoot);
  if (!privateCheck.ok) return privateCheck;
  const triggerDoc = readJson(triggerFile, 'C028-TRIGGER', 'prepare');
  if (!triggerDoc.ok) return triggerDoc;
  const configDoc = readJson(path.join(candidateRoot, 'company-intelligence.config.json'), 'C028-SUBJECT-POLICY', 'prepare');
  if (!configDoc.ok) return configDoc;
  const policy = validatePublicationPolicy(configDoc.value);
  if (!policy.ok) return policy;
  let coverageRegistry;
  try {
    coverageRegistry = INTEL.readCoverageRegistry(configDoc.value);
  } catch (error) {
    return fromThrown(error, 'C028-SUBJECT-POLICY', 'prepare', 'company-intelligence.config.json');
  }
  const toolsDoc = readJson(path.join(candidateRoot, 'tools.json'), 'C028-REGISTRY-DRIFT', 'prepare');
  if (!toolsDoc.ok) return toolsDoc;
  const registry = RLCONTRACTS.validateRegistry(toolsDoc.value, null);
  if (!registry.ok) return fail('C028-REGISTRY-DRIFT', 'prepare', 'The briefing registry is invalid.',
    registry.error && registry.error.field, registry.error && registry.error.reason);
  const ownerReadsPath = path.join(candidateRoot, 'market-brief.owner-reads.json');
  const snapshotPath = path.join(candidateRoot, 'market-brief.snapshot.json');
  const ownerReads = readJson(ownerReadsPath, 'C028-FROZEN-INPUT-DRIFT', 'prepare');
  if (!ownerReads.ok) return ownerReads;
  const snapshot = readJson(snapshotPath, 'C028-FROZEN-INPUT-DRIFT', 'prepare');
  if (!snapshot.ok) return snapshot;
  const baseline = loadBaseline(candidateRoot, policy.value);
  if (!baseline.ok) return baseline;
  const sourced = sourceInputs(candidateRoot, policy.value, ownerReads.value, snapshot.value);
  if (!sourced.ok) return sourced;
  const trigger = {
    contractVersion: triggerDoc.value.contractVersion,
    trigger: triggerDoc.value.trigger,
    window: triggerDoc.value.window,
    generationKey: triggerDoc.value.generationKey,
    requestedAt: triggerDoc.value.requestedAt
  };
  const frozen = freezePublicationInputs({
    policy: policy.value,
    coverageRegistry,
    registry: registry.value,
    trigger,
    etSessionDate: triggerDoc.value.etSessionDate,
    frozenAt: triggerDoc.value.frozenAt,
    evidenceCutoff: triggerDoc.value.evidenceCutoff,
    sourceRevision: triggerDoc.value.sourceRevision,
    baselinePointers: baseline.value.pointers,
    baselineVersions: baseline.value.versions,
    sources: sourced.value.sources,
    subjectInputs: sourced.value.subjectInputs
  });
  if (!frozen.ok) return frozen;
  const identity = authorIdentity === undefined ? envAuthorIdentity() : ok(authorIdentity);
  if (!identity.ok) return identity;
  const frozenWrite = writeJsonExact(path.join(transactionDir, 'frozen-inputs.json'), frozen.value);
  if (!frozenWrite.ok) return frozenWrite;
  for (const subject of frozen.value.policy.coveredSubjects) {
    const base = composeSubjectBase(frozen.value, subject.subjectId);
    if (!base.ok) return base;
    const catalogue = buildSourceCatalogue(frozen.value, subject.subjectId);
    if (!catalogue.ok) return catalogue;
    const request = buildPlanAuthorRequest(frozen.value.generation, subject, base.value, catalogue.value, identity.value);
    if (!request.ok) return request;
    const safe = safeSubjectPath(subject.subjectId);
    const baseWrite = writeJsonExact(path.join(transactionDir, 'base-candidates', `${safe}.json`), base.value);
    if (!baseWrite.ok) return baseWrite;
    const requestWrite = writeJsonExact(path.join(transactionDir, 'plan-requests', `${safe}.json`), request.value);
    if (!requestWrite.ok) return requestWrite;
  }
  return ok({
    command: 'prepare',
    generationId: frozen.value.generation.generationId,
    coveredSubjectCount: frozen.value.policy.coveredSubjects.length,
    frozenInputFingerprint: frozen.value.frozenInputFingerprint
  });
}

export function bindPlanTransaction({ transactionDir, responseFile }) {
  const frozenDoc = readJson(path.join(transactionDir, 'frozen-inputs.json'), 'C028-FROZEN-INPUT-DRIFT', 'bind-plan');
  if (!frozenDoc.ok) return frozenDoc;
  const frozen = frozenDoc.value;
  if (frozen.policy.coveredSubjects.length !== 1) {
    return fail('C028-PLAN-SCHEMA', 'bind-plan', 'Scope 01 bind-plan accepts one response for the one committed covered subject.', 'coveredSubjects');
  }
  const subject = frozen.policy.coveredSubjects[0];
  const safe = safeSubjectPath(subject.subjectId);
  const requestDoc = readJson(path.join(transactionDir, 'plan-requests', `${safe}.json`), 'C028-PLAN-AUTHOR', 'bind-plan');
  if (!requestDoc.ok) return requestDoc;
  const responseDoc = readJson(responseFile, 'C028-PLAN-AUTHOR', 'bind-plan');
  if (!responseDoc.ok) return responseDoc;
  const plan = validatePlanAuthorResponse(requestDoc.value, responseDoc.value);
  if (!plan.ok) return plan;
  const versions = composeCoveredSubjects(frozen, { [subject.subjectId]: plan.value });
  if (!versions.ok) return versions;
  const ownerRead = buildCompanyOwnerRead(frozen.generation, versions.value);
  if (!ownerRead.ok) return ownerRead;
  const planWrite = writeJsonExact(path.join(transactionDir, 'plans', `${safe}.json`), plan.value);
  if (!planWrite.ok) return planWrite;
  const versionWrite = writeJsonExact(path.join(transactionDir, 'versions', `${safe}.json`), versions.value[0]);
  if (!versionWrite.ok) return versionWrite;
  const ownerWrite = writeJsonExact(path.join(transactionDir, 'company-owner-read.json'), ownerRead.value);
  if (!ownerWrite.ok) return ownerWrite;
  return ok({
    command: 'bind-plan',
    generationId: frozen.generation.generationId,
    candidateVersionCount: versions.value.length,
    ownerReadFingerprint: ownerRead.value.fingerprint
  });
}

export function injectOwnerReadTransaction({ transactionDir, snapshotFile }) {
  const frozenDoc = readJson(path.join(transactionDir, 'frozen-inputs.json'), 'C028-FROZEN-INPUT-DRIFT', 'inject-owner-read');
  if (!frozenDoc.ok) return frozenDoc;
  const ownerDoc = readJson(path.join(transactionDir, 'company-owner-read.json'), 'C028-OWNER-READ', 'inject-owner-read');
  if (!ownerDoc.ok) return ownerDoc;
  const snapshotDoc = readJson(snapshotFile, 'C028-OWNER-READ', 'inject-owner-read');
  if (!snapshotDoc.ok) return snapshotDoc;
  const injected = injectCompanyOwnerRead(snapshotDoc.value, ownerDoc.value, frozenDoc.value.registry);
  if (!injected.ok) return injected;
  const written = writeJsonExact(path.join(transactionDir, 'candidate-snapshot.json'), injected.value);
  if (!written.ok) return written;
  return ok({
    command: 'inject-owner-read',
    generationId: ownerDoc.value.generationId,
    ownerReadFingerprint: ownerDoc.value.fingerprint,
    snapshotFingerprint: stableFingerprint(injected.value)
  });
}

function deterministicFloorAuthorIdentity() {
  return {
    providerId: 'deterministic-floor',
    modelId: 'none',
    promptPolicyVersion: 'company-plan-author/v1',
    schemaVersion: 'company-authored-plan/v2',
    validatorVersion: 'company-plan-validator/v1'
  };
}

function deterministicFloorResponse(request) {
  return {
    contractVersion: 'company-plan-author-response/v1',
    requestFingerprint: request.requestFingerprint,
    plan: {
      contractVersion: 'company-authored-plan/v2',
      subjectId: request.subjectId,
      generationId: request.generationId,
      emptyReason: 'floor-was-sufficient',
      branches: []
    }
  };
}

function executionCheckpointPath(transactionDir) {
  return path.join(transactionDir, EXECUTION_CHECKPOINT_FILE);
}

function readExecutionCheckpoint(transactionDir, request) {
  const file = executionCheckpointPath(transactionDir);
  if (!existsSync(file)) {
    return ok({
      contractVersion: EXECUTION_CHECKPOINT_CONTRACT,
      attemptId: request.attemptId,
      generationId: generationIdFromRequest(request),
      phase: 'initialized',
      history: ['initialized'],
      sourceObservationCount: 0,
      authorInvocationCount: 0
    });
  }
  const parsed = readJson(file, 'C028-FROZEN-INPUT-DRIFT', 'checkpoint-resume');
  if (!parsed.ok) return parsed;
  const checkpoint = parsed.value;
  const phaseIndex = COUPLED_PUBLICATION_PHASES.indexOf(checkpoint.phase);
  if (!exactFields(checkpoint, [
    'attemptId', 'authorInvocationCount', 'contractVersion', 'generationId',
    'history', 'phase', 'sourceObservationCount'
  ]) || checkpoint.contractVersion !== EXECUTION_CHECKPOINT_CONTRACT ||
      checkpoint.attemptId !== request.attemptId ||
      checkpoint.generationId !== generationIdFromRequest(request) ||
      phaseIndex < 0 || !Array.isArray(checkpoint.history) ||
      checkpoint.history.length !== phaseIndex + 1 ||
      checkpoint.history.some((phase, index) => phase !== COUPLED_PUBLICATION_PHASES[index]) ||
      !Number.isInteger(checkpoint.sourceObservationCount) || checkpoint.sourceObservationCount < 0 ||
      !Number.isInteger(checkpoint.authorInvocationCount) || checkpoint.authorInvocationCount < 0) {
    return fail('C028-FROZEN-INPUT-DRIFT', 'checkpoint-resume',
      'The persisted execution checkpoint is missing or incoherent.', EXECUTION_CHECKPOINT_FILE);
  }
  return ok(checkpoint);
}

function persistExecutionCheckpoint(transactionDir, checkpoint) {
  return writePrivateMutableJson(executionCheckpointPath(transactionDir), checkpoint);
}

function advanceExecutionCheckpoint(transactionDir, checkpoint, phase) {
  const advanced = advanceCoupledState({
    contractVersion: 'coupled-publication-state/v1',
    attemptId: checkpoint.attemptId,
    phase: checkpoint.phase,
    history: checkpoint.history
  }, phase);
  if (!advanced.ok) return advanced;
  const next = {
    ...checkpoint,
    phase: advanced.value.phase,
    history: advanced.value.history
  };
  const persisted = persistExecutionCheckpoint(transactionDir, next);
  return persisted.ok ? ok(next) : persisted;
}

function checkpointAtLeast(checkpoint, phase) {
  return COUPLED_PUBLICATION_PHASES.indexOf(checkpoint.phase) >=
    COUPLED_PUBLICATION_PHASES.indexOf(phase);
}

function advanceCheckpointThrough(transactionDir, checkpoint, targetPhase, emit, outcome) {
  let current = checkpoint;
  const target = COUPLED_PUBLICATION_PHASES.indexOf(targetPhase);
  if (target < 0) {
    return fail('C028-COHERENCE', 'state-transition',
      'The requested checkpoint phase is unknown.', 'phase');
  }
  while (COUPLED_PUBLICATION_PHASES.indexOf(current.phase) < target) {
    const nextPhase = COUPLED_PUBLICATION_PHASES[
      COUPLED_PUBLICATION_PHASES.indexOf(current.phase) + 1
    ];
    const advanced = advanceExecutionCheckpoint(transactionDir, current, nextPhase);
    if (!advanced.ok) return advanced;
    current = advanced.value;
    emit(nextPhase, outcome);
  }
  return ok(current);
}

function buildPreparedTrigger(request, candidateRoot) {
  const runner = gitRunnerFor(candidateRoot);
  const revision = commandValue(
    runner,
    ['rev-parse', 'HEAD'],
    'C028-TRIGGER',
    'checkouts-ready',
    'sourceRevision'
  );
  if (!revision.ok || !REVISION.test(revision.value)) {
    return revision.ok
      ? fail('C028-TRIGGER', 'checkouts-ready',
        'The candidate checkout has no exact source revision.', 'sourceRevision')
      : revision;
  }
  const snapshot = readJson(
    path.join(candidateRoot, 'market-brief.snapshot.json'),
    'C028-FROZEN-INPUT-DRIFT',
    'inputs-frozen'
  );
  if (!snapshot.ok) return snapshot;
  const evidenceCutoff = snapshot.value.asOf;
  if (!isIsoInstant(evidenceCutoff)) {
    return fail('C028-EVIDENCE-CUTOFF', 'inputs-frozen',
      'The candidate snapshot has no canonical evidence cutoff.',
      'market-brief.snapshot.json');
  }
  const frozenAt = new Date(Math.max(
    Date.parse(request.requestedAt),
    Date.parse(evidenceCutoff)
  )).toISOString();
  return ok({
    contractVersion: 'company-publication-trigger/v1',
    trigger: request.trigger,
    window: request.window,
    generationKey: request.generationKey,
    requestedAt: request.requestedAt,
    frozenAt,
    evidenceCutoff,
    etSessionDate: request.etSessionDate,
    sourceRevision: revision.value
  });
}

function revalidateTransactionBoundary(transactionDir, candidateRoot) {
  const frozenDoc = readJson(
    path.join(transactionDir, 'frozen-inputs.json'),
    'C028-FROZEN-INPUT-DRIFT',
    'final-boundary-validation'
  );
  if (!frozenDoc.ok) return frozenDoc;
  const frozen = frozenDoc.value;
  const toolsDoc = readJson(
    path.join(candidateRoot, 'tools.json'),
    'C028-REGISTRY-DRIFT',
    'final-boundary-validation'
  );
  if (!toolsDoc.ok) return toolsDoc;
  const registry = RLCONTRACTS.validateRegistry(toolsDoc.value, null);
  if (!registry.ok) {
    return fail('C028-REGISTRY-DRIFT', 'final-boundary-validation',
      'The current registry no longer validates.', 'current.registry',
      registry.error?.reason);
  }
  const ownerReads = readJson(
    path.join(candidateRoot, 'market-brief.owner-reads.json'),
    'C028-FROZEN-INPUT-DRIFT',
    'final-boundary-validation'
  );
  if (!ownerReads.ok) return ownerReads;
  const snapshot = readJson(
    path.join(candidateRoot, 'market-brief.snapshot.json'),
    'C028-FROZEN-INPUT-DRIFT',
    'final-boundary-validation'
  );
  if (!snapshot.ok) return snapshot;
  const sourced = sourceInputs(candidateRoot, frozen.policy, ownerReads.value, snapshot.value);
  if (!sourced.ok) return sourced;
  const refrozen = freezePublicationInputs({
    policy: frozen.policy,
    coverageRegistry: frozen.coverageRegistry,
    registry: registry.value,
    trigger: frozen.trigger,
    etSessionDate: frozen.etSessionDate,
    frozenAt: frozen.frozenAt,
    evidenceCutoff: frozen.evidenceCutoff,
    sourceRevision: frozen.sourceRevision,
    baselinePointers: frozen.baselinePointers,
    baselineVersions: frozen.baselineVersions,
    sources: sourced.value.sources,
    subjectInputs: sourced.value.subjectInputs
  });
  if (!refrozen.ok) return refrozen;
  return validateFrozenPublicationBoundary(frozen, {
    registry: registry.value,
    sources: refrozen.value.sources,
    evidenceCutoff: snapshot.value.asOf
  });
}

function validateCheckpointReuseBoundary(transactionDir, candidateRoot) {
  const frozenDoc = readJson(
    path.join(transactionDir, 'frozen-inputs.json'),
    'C028-FROZEN-INPUT-DRIFT',
    'checkpoint-resume'
  );
  if (!frozenDoc.ok) return frozenDoc;
  const baseline = loadTransactionBaseline(transactionDir, 'checkpoint-resume');
  if (!baseline.ok) return baseline;
  const toolsDoc = readJson(
    path.join(candidateRoot, 'tools.json'),
    'C028-REGISTRY-DRIFT',
    'checkpoint-resume'
  );
  if (!toolsDoc.ok) return toolsDoc;
  const registry = RLCONTRACTS.validateRegistry(toolsDoc.value, null);
  if (!registry.ok) return fail('C028-REGISTRY-DRIFT', 'checkpoint-resume',
    'The registry no longer validates before reuse of a publication plan.',
    'tools.json', registry.error?.reason);
  const registryBoundary = validateFrozenPublicationBoundary(frozenDoc.value, {
    registry: registry.value,
    sources: frozenDoc.value.sources,
    evidenceCutoff: frozenDoc.value.evidenceCutoff
  });
  if (!registryBoundary.ok) return registryBoundary;
  const ownerReadsPath = 'market-brief.owner-reads.json';
  const ownerReads = readJson(
    path.join(candidateRoot, ownerReadsPath),
    'C028-FROZEN-INPUT-DRIFT',
    'checkpoint-resume'
  );
  if (!ownerReads.ok) return ownerReads;
  const ownerMap = ownerReads.value?.ownerReads;
  for (const ownerToolId of [INTEL.TOOL_ID, frozenDoc.value.registry.aggregatorToolId]) {
    if (!ownerMap || !ownerMap[ownerToolId]) continue;
    if (frozenDoc.value.policy.coveredSubjects.some((subject) => ownerMap[ownerToolId][subject.ticker])) {
      return fail('C028-SOURCE-CYCLE', 'checkpoint-resume',
        `Owner ${ownerToolId} would make a resumed company generation consume itself or the final brief.`,
        `ownerReads.${ownerToolId}`);
    }
  }
  const baselineOwnerReads = baseline.value.candidate.entries.find(
    (entry) => entry.path === ownerReadsPath
  );
  const currentOwnerReads = readFileRecord(
    candidateRoot,
    ownerReadsPath,
    'C028-FROZEN-INPUT-DRIFT',
    'checkpoint-resume'
  );
  if (!currentOwnerReads.ok) return currentOwnerReads;
  if (!baselineOwnerReads || baselineOwnerReads.sha256 !== currentOwnerReads.value.sha256 ||
      baselineOwnerReads.byteLength !== currentOwnerReads.value.byteLength) {
    return fail('C028-FROZEN-INPUT-DRIFT', 'checkpoint-resume',
      'A source payload changed before reuse of a validated publication plan.',
      ownerReadsPath);
  }
  const runner = gitRunnerFor(candidateRoot);
  const status = commandValue(
    runner,
    ['status', '--porcelain=v1', '--untracked-files=all'],
    'C028-FROZEN-INPUT-DRIFT',
    'checkpoint-resume',
    'candidate.status'
  );
  if (!status.ok) return status;
  if (status.value !== '') {
    return fail('C028-FROZEN-INPUT-DRIFT', 'checkpoint-resume',
      'The restored candidate checkout changed before reuse of a validated publication plan.',
      'candidate.status');
  }
  return ok(true);
}

function copyPrivateCandidateSnapshot(transactionDir, candidateRoot) {
  const source = path.join(transactionDir, 'candidate-snapshot.json');
  const target = path.join(candidateRoot, 'market-brief.snapshot.json');
  try {
    const bytes = readFileSync(source);
    writeFileSync(target, bytes);
    return ok({ sha256: sha256(bytes), byteLength: bytes.length });
  } catch (error) {
    return fail('C028-STAGE', 'company-owner-read-frozen',
      'The validated company owner read could not enter the candidate snapshot.',
      'market-brief.snapshot.json', error?.code);
  }
}

function copyPrivateCompanyReadToPayload(transactionDir, candidateRoot) {
  const owner = readJson(
    path.join(transactionDir, 'company-owner-read.json'),
    'C028-OWNER-READ',
    'company-owner-read-frozen'
  );
  if (!owner.ok) return owner;
  const payloadPath = path.join(candidateRoot, 'market-brief.payload.json');
  const payload = readJson(
    payloadPath,
    'C028-BRIEF-CANDIDATE',
    'company-owner-read-frozen'
  );
  if (!payload.ok) return payload;
  const next = clone(payload.value);
  if (!next.toolReads || typeof next.toolReads !== 'object' || Array.isArray(next.toolReads)) {
    next.toolReads = {};
  }
  next.toolReads[INTEL.TOOL_ID] = clone(owner.value);
  if (!Array.isArray(next.toolCoverage)) next.toolCoverage = [];
  const rows = next.toolCoverage.filter((row) => row && row.id === INTEL.TOOL_ID);
  if (rows.length > 1) {
    return fail('C028-OWNER-READ', 'company-owner-read-frozen',
      'The candidate payload carries duplicate Company Intelligence coverage rows.',
      'market-brief.payload.json.toolCoverage');
  }
  if (rows.length === 1) {
    rows[0].status = 'fresh-headless';
    rows[0].reason = owner.value.read;
  } else {
    next.toolCoverage.push({
      id: INTEL.TOOL_ID,
      deepLink: 'company-intelligence-lab.html',
      status: 'fresh-headless',
      reason: owner.value.read
    });
  }
  try {
    writeFileSync(payloadPath, `${JSON.stringify(next, null, 2)}\n`);
    return ok({ ownerReadFingerprint: owner.value.fingerprint });
  } catch (error) {
    return fail('C028-STAGE', 'company-owner-read-frozen',
      'The validated company owner read could not enter the candidate final-brief input.',
      'market-brief.payload.json', error?.code);
  }
}

function sharedFailure(result, context) {
  if (existsSync(path.join(context.transactionDir, TRANSACTION_BASELINE_FILE)) &&
      !existsSync(path.join(context.transactionDir, TRANSACTION_JOURNAL_FILE))) {
    const restoration = abortCoupledTransaction({
      transactionDir: context.transactionDir,
      candidateRoot: context.candidateRoot,
      publicationRoot: context.publicationRoot,
      failure: result.error
    });
    if (!restoration.ok) {
      return deepFreeze({
        ok: false,
        error: clone(result.error),
        restorationError: clone(restoration.error)
      });
    }
  }
  return result;
}

function runCoupledWorkerStage(context, stage, extraEnvironment = {}) {
  const worker = path.join(context.candidateRoot, 'scripts/brief-refresh-and-push.sh');
  const result = spawnSync('/bin/bash', [worker], {
    cwd: context.candidateRoot,
    encoding: 'utf8',
    timeout: 14_400_000,
    killSignal: 'SIGTERM',
    env: {
      ...process.env,
      BRIEF_REPO_ROOT: context.candidateRoot,
      BRIEF_REQUIRE_COMPLETE_RUN: '1',
      BRIEF_COUPLED_STAGE: stage,
      BRIEF_COUPLED_WINDOW: context.request.window,
      ...extraEnvironment
    }
  });
  for (const line of String(result.stdout || '').split('\n')) {
    if (line) context.log(line);
  }
  for (const line of String(result.stderr || '').split('\n')) {
    if (line) context.log(line);
  }
  if (result.error || result.status !== 0) {
    return fail(stage === 'source' ? 'C028-FROZEN-INPUT-DRIFT' : 'C028-BRIEF-CANDIDATE',
      stage === 'source' ? 'inputs-frozen' : 'final-brief-authored',
      `The shared worker ${stage} stage did not complete.`,
      `worker.${stage}`,
      result.error?.code || `worker-exit-${String(result.status)}`);
  }
  return ok({ stage, exitCode: result.status });
}

/** Execute or resume the shared eighteen-phase transaction for either trigger. */
export async function runSharedCoupledPublication(options) {
  const context = options || {};
  const required = [
    'transactionDir', 'candidateRoot', 'publicationRoot', 'requestFile',
    'remote', 'branch', 'acknowledgmentFile'
  ];
  if (required.some((key) => typeof context[key] !== 'string' || !context[key])) {
    return fail('C028-TRIGGER', 'initialized',
      'The shared transaction requires exact private, checkout, remote, branch, and acknowledgment paths.',
      'options');
  }
  const requestDoc = readJson(context.requestFile, 'C028-TRIGGER', 'initialized');
  if (!requestDoc.ok) return requestDoc;
  const requestValidation = validateTriggerRequest(requestDoc.value);
  if (!requestValidation.ok) return requestValidation;
  const request = requestValidation.value;
  context.request = request;
  const log = typeof context.log === 'function' ? context.log : () => {};
  const emit = (phase, outcome, detail = {}) => log(stableStringify({
    contractVersion: 'company-publication-phase/v1',
    attemptId: request.attemptId,
    generationId: generationIdFromRequest(request),
    phase,
    outcome,
    ...detail
  }));
  emit('initialized', 'request-persisted', {
    trigger: request.trigger,
    window: request.window
  });

  let checkpointResult = readExecutionCheckpoint(context.transactionDir, request);
  if (!checkpointResult.ok) return checkpointResult;
  let checkpoint = checkpointResult.value;
  if (!existsSync(executionCheckpointPath(context.transactionDir))) {
    const persisted = persistExecutionCheckpoint(context.transactionDir, checkpoint);
    if (!persisted.ok) return persisted;
  }
  let advanced = advanceCheckpointThrough(
    context.transactionDir,
    checkpoint,
    'checkouts-ready',
    emit,
    checkpointAtLeast(checkpoint, 'checkouts-ready') ? 'checkpoint-reused' : 'validated'
  );
  if (!advanced.ok) return advanced;
  checkpoint = advanced.value;

  const journalPath = path.join(context.transactionDir, TRANSACTION_JOURNAL_FILE);
  if (existsSync(journalPath)) {
    const journal = loadTransactionJournal(context.transactionDir);
    if (!journal.ok) return journal;
    if (!checkpointAtLeast(checkpoint, 'committed')) {
      advanced = advanceCheckpointThrough(
        context.transactionDir,
        checkpoint,
        'committed',
        emit,
        'checkpoint-reused'
      );
      if (!advanced.ok) return advanced;
      checkpoint = advanced.value;
    }
    emit('committed', 'resume-exact-commit', {
      sourceObservationCount: checkpoint.sourceObservationCount,
      authorInvocationCount: checkpoint.authorInvocationCount
    });
    const pushed = pushCoupledTransaction({
      transactionDir: context.transactionDir,
      candidateRoot: context.candidateRoot,
      publicationRoot: context.publicationRoot,
      remote: context.remote,
      branch: context.branch,
      acknowledgmentFile: context.acknowledgmentFile
    });
    if (!pushed.ok) return pushed;
    if (pushed.value.state !== 'acknowledged') {
      const code = pushed.value.state === 'remote-outcome-unknown'
        ? 'C028-ACK-UNKNOWN'
        : 'C028-PUSH';
      return fail(code, 'remote-acknowledged',
        'The exact commit is preserved but is not remotely acknowledged.',
        'transactionJournal');
    }
    advanced = advanceCheckpointThrough(
      context.transactionDir,
      checkpoint,
      'remote-acknowledged',
      emit,
      'validated'
    );
    if (!advanced.ok) return advanced;
    return ok({
      trigger: request.trigger,
      window: request.window,
      attemptId: request.attemptId,
      generationId: journal.value.generationId,
      commit: journal.value.commit,
      resumed: true,
      sourceObservationCount: checkpoint.sourceObservationCount,
      authorInvocationCount: checkpoint.authorInvocationCount,
      phaseHistory: advanced.value.history
    });
  }

  if (!existsSync(path.join(context.transactionDir, TRANSACTION_BASELINE_FILE))) {
    const baseline = captureCoupledTransactionBaseline({
      transactionDir: context.transactionDir,
      candidateRoot: context.candidateRoot,
      publicationRoot: context.publicationRoot,
      remote: context.remote,
      branch: context.branch
    });
    if (!baseline.ok) return baseline;
  }

  if (!checkpointAtLeast(checkpoint, 'inputs-frozen') &&
      !existsSync(path.join(context.transactionDir, 'frozen-inputs.json'))) {
    const sourceStage = runCoupledWorkerStage(context, 'source');
    if (!sourceStage.ok) return sharedFailure(sourceStage, context);
  }

  const triggerFile = path.join(context.transactionDir, 'trigger.json');
  if (!existsSync(triggerFile)) {
    const trigger = buildPreparedTrigger(request, context.candidateRoot);
    if (!trigger.ok) return sharedFailure(trigger, context);
    const written = writeJsonExact(triggerFile, trigger.value);
    if (!written.ok) return sharedFailure(written, context);
  }

  if (!existsSync(path.join(context.transactionDir, 'frozen-inputs.json'))) {
    const prepared = prepareTransaction({
      transactionDir: context.transactionDir,
      candidateRoot: context.candidateRoot,
      triggerFile,
      authorIdentity: deterministicFloorAuthorIdentity()
    });
    if (!prepared.ok) return sharedFailure(prepared, context);
    checkpoint = {
      ...checkpoint,
      sourceObservationCount: checkpoint.sourceObservationCount + 1
    };
    const persisted = persistExecutionCheckpoint(context.transactionDir, checkpoint);
    if (!persisted.ok) return persisted;
  }
  advanced = advanceCheckpointThrough(
    context.transactionDir,
    checkpoint,
    'company-candidates-composed',
    emit,
    checkpoint.sourceObservationCount > 0 ? 'validated' : 'checkpoint-reused'
  );
  if (!advanced.ok) return advanced;
  checkpoint = advanced.value;

  const ownerReadPath = path.join(context.transactionDir, 'company-owner-read.json');
  if (!existsSync(ownerReadPath)) {
    const requestPath = path.join(
      context.transactionDir,
      'plan-requests',
      'company-msft.json'
    );
    const planRequest = readJson(
      requestPath,
      'C028-PLAN-AUTHOR',
      'company-plans-authored'
    );
    if (!planRequest.ok) return sharedFailure(planRequest, context);
    const responsePath = path.join(
      context.transactionDir,
      'plan-responses',
      'company-msft.json'
    );
    const responseWrite = writeJsonExact(
      responsePath,
      deterministicFloorResponse(planRequest.value)
    );
    if (!responseWrite.ok) return sharedFailure(responseWrite, context);
    const bound = bindPlanTransaction({
      transactionDir: context.transactionDir,
      responseFile: responsePath
    });
    if (!bound.ok) return sharedFailure(bound, context);
    checkpoint = {
      ...checkpoint,
      authorInvocationCount: checkpoint.authorInvocationCount + 1
    };
    const persisted = persistExecutionCheckpoint(context.transactionDir, checkpoint);
    if (!persisted.ok) return persisted;
  }
  advanced = advanceCheckpointThrough(
    context.transactionDir,
    checkpoint,
    'company-owner-read-frozen',
    emit,
    checkpoint.authorInvocationCount > 0 ? 'validated' : 'checkpoint-reused'
  );
  if (!advanced.ok) return advanced;
  checkpoint = advanced.value;

  const promotionPlanPath = path.join(context.transactionDir, 'publication-plan.json');
  const reuseValidatedPlan = checkpointAtLeast(checkpoint, 'coherence-verified');
  if (reuseValidatedPlan && !existsSync(promotionPlanPath)) {
    return fail('C028-STAGE', 'checkpoint-resume',
      'A coherence-verified checkpoint has no reusable private publication plan.',
      'publication-plan.json');
  }
  if (!reuseValidatedPlan) {
    const candidateSnapshotPath = path.join(context.transactionDir, 'candidate-snapshot.json');
    if (!existsSync(candidateSnapshotPath)) {
      const injected = injectOwnerReadTransaction({
        transactionDir: context.transactionDir,
        snapshotFile: path.join(context.candidateRoot, 'market-brief.snapshot.json')
      });
      if (!injected.ok) return sharedFailure(injected, context);
    }
    const copied = copyPrivateCandidateSnapshot(context.transactionDir, context.candidateRoot);
    if (!copied.ok) return sharedFailure(copied, context);
    const payloadCopy = copyPrivateCompanyReadToPayload(
      context.transactionDir,
      context.candidateRoot
    );
    if (!payloadCopy.ok) return sharedFailure(payloadCopy, context);

    const boundary = revalidateTransactionBoundary(
      context.transactionDir,
      context.candidateRoot
    );
    if (!boundary.ok) return sharedFailure(boundary, context);
    const toolBundlePath = path.join(context.transactionDir, 'tool-brief-bundle.json');
    if (!checkpointAtLeast(checkpoint, 'final-brief-validated')) {
      const finalStage = runCoupledWorkerStage(context, 'final', {
        BRIEF_COUPLED_TOOL_BUNDLE_PATH: toolBundlePath
      });
      if (!finalStage.ok) return sharedFailure(finalStage, context);
    }
    const bundleDoc = readJson(
      toolBundlePath,
      'C028-OWNER-READ',
      'source-bundle-frozen'
    );
    if (!bundleDoc.ok) return sharedFailure(bundleDoc, context);
    const companyOutcomes = bundleDoc.value.tools.filter(
      (entry) => entry.toolId === INTEL.TOOL_ID
    );
    if (companyOutcomes.length !== 1 || companyOutcomes[0].outcome !== 'newly-authored') {
      return sharedFailure(fail('C028-OWNER-READ', 'source-bundle-frozen',
        'A complete recreation requires exactly one real company owner read.',
        'toolBriefBundle'), context);
    }
    advanced = advanceCheckpointThrough(
      context.transactionDir,
      checkpoint,
      'source-bundle-frozen',
      emit,
      'validated'
    );
    if (!advanced.ok) return advanced;
    checkpoint = advanced.value;

    advanced = advanceCheckpointThrough(
      context.transactionDir,
      checkpoint,
      'final-brief-validated',
      emit,
      'validated'
    );
    if (!advanced.ok) return advanced;
    checkpoint = advanced.value;

    const assembled = assembleCoupledPublication({
      transactionDir: context.transactionDir,
      candidateRoot: context.candidateRoot
    });
    if (!assembled.ok) return sharedFailure(assembled, context);
  } else {
    const reuseBoundary = validateCheckpointReuseBoundary(
      context.transactionDir,
      context.candidateRoot
    );
    if (!reuseBoundary.ok) return sharedFailure(reuseBoundary, context);
    emit('coherence-verified', 'checkpoint-reused', {
      sourceObservationCount: checkpoint.sourceObservationCount,
      authorInvocationCount: checkpoint.authorInvocationCount
    });
  }

  if (context.dryRun === true) {
    const dry = completeCoupledDryRun({
      transactionDir: context.transactionDir,
      candidateRoot: context.candidateRoot,
      publicationRoot: context.publicationRoot
    });
    return dry.ok ? ok({
      ...dry.value,
      trigger: request.trigger,
      window: request.window,
      attemptId: request.attemptId,
      resumed: checkpoint.sourceObservationCount === 0,
      sourceObservationCount: checkpoint.sourceObservationCount,
      authorInvocationCount: checkpoint.authorInvocationCount,
      phaseHistory: COUPLED_PUBLICATION_PHASES.slice(0, 16)
    }) : dry;
  }

  const promoted = promoteCoupledPublication({
    transactionDir: context.transactionDir,
    publicationRoot: context.publicationRoot
  });
  if (!promoted.ok) return sharedFailure(promoted, context);
  advanced = advanceCheckpointThrough(
    context.transactionDir,
    checkpoint,
    'pointers-advanced',
    emit,
    promoted.value.resumed ? 'checkpoint-reused' : 'validated'
  );
  if (!advanced.ok) return advanced;
  checkpoint = advanced.value;
  const coherent = validateCoupledPublication(
    context.publicationRoot,
    promoted.value.generationId
  );
  if (!coherent.ok) return sharedFailure(coherent, context);
  advanced = advanceCheckpointThrough(
    context.transactionDir,
    checkpoint,
    'coherence-verified',
    emit,
    'validated'
  );
  if (!advanced.ok) return advanced;
  checkpoint = advanced.value;

  const committed = commitCoupledTransaction({
    transactionDir: context.transactionDir,
    candidateRoot: context.candidateRoot,
    publicationRoot: context.publicationRoot,
    subject: `company-brief: publish ${promoted.value.generationId}`
  });
  if (!committed.ok) return committed;
  advanced = advanceCheckpointThrough(
    context.transactionDir,
    checkpoint,
    'committed',
    emit,
    'validated'
  );
  if (!advanced.ok) return advanced;
  checkpoint = advanced.value;
  const pushed = pushCoupledTransaction({
    transactionDir: context.transactionDir,
    candidateRoot: context.candidateRoot,
    publicationRoot: context.publicationRoot,
    remote: context.remote,
    branch: context.branch,
    acknowledgmentFile: context.acknowledgmentFile
  });
  if (!pushed.ok) return pushed;
  if (pushed.value.state !== 'acknowledged') {
    const code = pushed.value.state === 'remote-outcome-unknown'
      ? 'C028-ACK-UNKNOWN'
      : 'C028-PUSH';
    return fail(code, 'remote-acknowledged',
      'The exact commit is preserved but is not remotely acknowledged.',
      'transactionJournal');
  }
  advanced = advanceCheckpointThrough(
    context.transactionDir,
    checkpoint,
    'remote-acknowledged',
    emit,
    'validated'
  );
  if (!advanced.ok) return advanced;
  return ok({
    trigger: request.trigger,
    window: request.window,
    attemptId: request.attemptId,
    generationId: promoted.value.generationId,
    briefRunId: promoted.value.briefRunId,
    commit: committed.value.commit,
    manifestSha256: promoted.value.manifestSha256,
    resumed: promoted.value.resumed,
    sourceObservationCount: checkpoint.sourceObservationCount,
    authorInvocationCount: checkpoint.authorInvocationCount,
    phaseHistory: advanced.value.history
  });
}

function parseOptions(argv, expected) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!expected.includes(token) || Object.prototype.hasOwnProperty.call(values, token) || index + 1 >= argv.length) {
      return fail('C028-TRIGGER', 'cli', 'The command received an unknown, duplicate, or valueless option.', token);
    }
    const value = argv[index + 1];
    if (value.startsWith('--')) return fail('C028-TRIGGER', 'cli', 'The command option has no value.', token);
    values[token] = value;
    index += 1;
  }
  for (const name of expected) {
    if (typeof values[name] !== 'string' || !values[name]) {
      return fail('C028-TRIGGER', 'cli', 'The command omits a required option.', name);
    }
  }
  return ok(values);
}

function cliResult(result) {
  if (!result.ok) {
    process.stderr.write(`${JSON.stringify(result.error)}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`${JSON.stringify({ ok: true, ...result.value })}\n`);
}

async function main(argv) {
  const command = argv[0];
  if (command === 'request') {
    const options = parseOptions(argv.slice(1), [
      '--output', '--trigger', '--window', '--et-session-date', '--requested-at'
    ]);
    if (!options.ok) return cliResult(options);
    return cliResult(persistTriggerRequest({
      file: path.resolve(options.value['--output']),
      trigger: options.value['--trigger'],
      window: options.value['--window'],
      etSessionDate: options.value['--et-session-date'],
      requestedAt: options.value['--requested-at']
    }));
  }
  if (command === 'run-shared') {
    const args = argv.slice(1);
    const dryRun = args.includes('--dry-run');
    const valued = args.filter((token) => token !== '--dry-run');
    const options = parseOptions(valued, [
      '--transaction-dir', '--candidate-root', '--publication-root', '--request-file',
      '--remote', '--branch', '--acknowledgment-file'
    ]);
    if (!options.ok) return cliResult(options);
    const result = await runSharedCoupledPublication({
      transactionDir: path.resolve(options.value['--transaction-dir']),
      candidateRoot: path.resolve(options.value['--candidate-root']),
      publicationRoot: path.resolve(options.value['--publication-root']),
      requestFile: path.resolve(options.value['--request-file']),
      remote: options.value['--remote'],
      branch: options.value['--branch'],
      acknowledgmentFile: path.resolve(options.value['--acknowledgment-file']),
      dryRun,
      log: (line) => process.stdout.write(`${line}\n`)
    });
    return cliResult(result);
  }
  if (command === 'prepare') {
    const options = parseOptions(argv.slice(1), ['--transaction-dir', '--candidate-root', '--trigger-file']);
    if (!options.ok) return cliResult(options);
    return cliResult(prepareTransaction({
      transactionDir: path.resolve(options.value['--transaction-dir']),
      candidateRoot: path.resolve(options.value['--candidate-root']),
      triggerFile: path.resolve(options.value['--trigger-file'])
    }));
  }
  if (command === 'bind-plan') {
    const options = parseOptions(argv.slice(1), ['--transaction-dir', '--response-file']);
    if (!options.ok) return cliResult(options);
    return cliResult(bindPlanTransaction({
      transactionDir: path.resolve(options.value['--transaction-dir']),
      responseFile: path.resolve(options.value['--response-file'])
    }));
  }
  if (command === 'inject-owner-read') {
    const options = parseOptions(argv.slice(1), ['--transaction-dir', '--snapshot-file']);
    if (!options.ok) return cliResult(options);
    return cliResult(injectOwnerReadTransaction({
      transactionDir: path.resolve(options.value['--transaction-dir']),
      snapshotFile: path.resolve(options.value['--snapshot-file'])
    }));
  }
  if (command === 'assemble') {
    const options = parseOptions(argv.slice(1), ['--transaction-dir', '--candidate-root']);
    if (!options.ok) return cliResult(options);
    return cliResult(assembleCoupledPublication({
      transactionDir: path.resolve(options.value['--transaction-dir']),
      candidateRoot: path.resolve(options.value['--candidate-root'])
    }));
  }
  if (command === 'promote') {
    const options = parseOptions(argv.slice(1), ['--transaction-dir', '--publication-root']);
    if (!options.ok) return cliResult(options);
    return cliResult(promoteCoupledPublication({
      transactionDir: path.resolve(options.value['--transaction-dir']),
      publicationRoot: path.resolve(options.value['--publication-root'])
    }));
  }
  if (command === 'validate') {
    const options = parseOptions(argv.slice(1), ['--publication-root', '--generation-id']);
    if (!options.ok) return cliResult(options);
    return cliResult(validateCoupledPublication(
      path.resolve(options.value['--publication-root']),
      options.value['--generation-id']
    ));
  }
  if (command === 'record-attempt') {
    const options = parseOptions(argv.slice(1), ['--publication-root', '--input-file']);
    if (!options.ok) return cliResult(options);
    const input = readJson(path.resolve(options.value['--input-file']), 'C028-TRIGGER', 'public-attempt-write');
    if (!input.ok) return cliResult(input);
    return cliResult(recordPublicAttempt({
      root: path.resolve(options.value['--publication-root']),
      input: input.value
    }));
  }
  return cliResult(fail('C028-TRIGGER', 'cli',
    'The command is outside the closed company publication CLI surface.', 'command'));
}

if (process.argv[1] &&
    realpathSync(path.resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2)).catch((error) => {
    cliResult(fail('C028-COHERENCE', 'cli',
      'The shared publication command failed at its process boundary.',
      'command', error?.code));
  });
}
