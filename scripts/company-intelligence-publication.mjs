#!/usr/bin/env node
/*
 * Feature 028 Scope 01 — Company Intelligence publication foundation.
 *
 * This module owns frozen policy/input contracts, headless Feature 025 composition, bounded
 * research-plan validation, one real company owner read, and three private-candidate commands.
 * It has no promotion, pointer, commit, push, acknowledgment, registry activation, or public-write
 * authority. Shared browser math remains in the UMD rlcompanyintel.js module.
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AUTHOR_ERRORS,
  buildCompanyPlanAuthorRequest,
  validateAuthorEnvelope
} from './brief-author.mjs';

const require = createRequire(import.meta.url);
const INTEL = require('../rlcompanyintel.js');
const RLCONTRACTS = require('../rlcontracts.js');

const POLICY_CONTRACT = 'company-publication-policy/v1';
const GENERATION_CONTRACT = 'company-publication-generation/v1';
const FROZEN_INPUT_CONTRACT = 'company-publication-inputs/v1';
const SOURCE_CATALOGUE_CONTRACT = 'company-source-catalogue/v1';
const BASE_CANDIDATE_CONTRACT = 'company-candidate-base/v1';
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
  'C028-TRIGGER',
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
  'C028-PRIVACY'
]);
const SAFE_ID = /^[a-z0-9][a-z0-9._:/-]*$/;
const HASH = /^sha256:[a-f0-9]{64}$/;
const REVISION = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const SUBJECT = /^company:[a-z][a-z0-9.-]{0,9}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;

export const COMPANY_PUBLICATION_CODES = CLOSED_CODES;

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
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
      planValidation.error.reason, `plans.${subject.subjectId}`, planValidation.error.causeCode);
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
      rows[0].reason = null;
    }
  }
  return ok(copy);
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

export function prepareTransaction({ transactionDir, candidateRoot, triggerFile }) {
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
  const identity = envAuthorIdentity();
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

function main(argv) {
  const command = argv[0];
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
  return cliResult(fail('C028-TRIGGER', 'cli',
    'Scope 01 exposes only prepare, bind-plan, and inject-owner-read.', 'command'));
}

if (process.argv[1] &&
    realpathSync(path.resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
