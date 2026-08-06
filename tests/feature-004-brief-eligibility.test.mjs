import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TOOL_ID = 'fx-regime-relative-value-lab';
const DECISION_TIME = '2026-08-03T12:00:00.000Z';
const EVIDENCE_CUTOFF = '2026-08-03T10:00:00.000Z';
const FRESH_UNTIL = '2026-08-03T16:00:00.000Z';
const OWNER_DECISION_ID = 'fxo-v1-controlled-owner';
const EVIDENCE_IDENTITY = 'fxe-v1-controlled-evidence';
const RUN_ID = 'brief-run-feature-004';
const MODEL_ADAPTER_ID = 'fx-regime-vehicle-owning-model-v1';
const MODEL_VERSION = 'rlfx-owner-decision/v1';
const OWNER_INTERPRETATION_REF = 'fx-owner-interpretation-v1';
const RIGHTS_POLICY_ID = 'fx-public-brief-rights-v1';
const CLAIM_KINDS = ['regime', 'catalyst', 'vehicle', 'trigger', 'invalidation', 'wrapper-caveat'];

function hash(seed) {
  return `sha256:${createHash('sha256').update(seed).digest('hex')}`;
}

const RUN_FINGERPRINT = hash('feature-004-run');
const MODEL_FINGERPRINT = hash('feature-004-model-read');
const BUNDLE_FINGERPRINT = hash('feature-004-evidence-bundle');
const BRIEF_FINGERPRINT = hash('feature-004-tool-brief');

function loadRlbrief() {
  const runtime = {};
  runtime.globalThis = runtime;
  runtime.window = runtime;
  for (const file of ['rldata.js', 'rlbrief.js']) {
    const source = readFileSync(join(ROOT, file), 'utf8');
    Function('globalThis', 'window', 'document', source)(runtime, runtime, undefined);
  }
  return { RLBRIEF: runtime.RLBRIEF, RLDATA: runtime.RLDATA };
}

function source(origin) {
  return {
    sourceId: `source-${origin}`,
    canonicalUrl: `https://${origin}.example.test/fx`,
    title: `FX source ${origin}`,
    publisher: `Publisher ${origin}`,
    publishedAt: '2026-08-03T09:00:00.000Z',
    fetchedAt: '2026-08-03T10:00:00.000Z',
    sourceClass: 'public-primary',
    mediaType: 'text/plain',
    contentSha256: hash(`source-${origin}`),
    independentOriginGroup: `origin-${origin}`,
    freshnessState: 'current',
    rightsEligible: true,
    directionTag: 'supports',
    supportsClaims: CLAIM_KINDS.map((kind) => `claim-${kind}`),
    excerpts: CLAIM_KINDS.map((kind) => ({
      excerptId: `excerpt-${origin}-${kind}`,
      text: `${kind} evidence from ${origin}`,
      byteLength: 32
    }))
  };
}

function claim(kind) {
  return {
    claimId: `claim-${kind}`,
    claimKind: kind,
    materiality: 'material',
    normalizedClaim: `${kind} claim`,
    sourceExcerptRefs: [`excerpt-a-${kind}`, `excerpt-b-${kind}`],
    independentOriginGroups: ['origin-a', 'origin-b'],
    ownerEvidenceRefs: [OWNER_INTERPRETATION_REF],
    corroborationState: 'corroborated',
    conflictState: 'consistent',
    freshnessState: 'current',
    rightsEligible: true,
    authorable: true
  };
}

function currentOwnerRead() {
  return {
    contractVersion: 'rl-tool-read/v1',
    id: TOOL_ID,
    availability: 'current',
    asOf: EVIDENCE_CUTOFF,
    read: 'JPY strength maps to a current FXY research vehicle.',
    metrics: {
      contractVersion: 'rlfx-tool-read/v2',
      ownerDecisionId: OWNER_DECISION_ID,
      evidenceIdentity: EVIDENCE_IDENTITY,
      state: 'ready',
      objective: 'foreign-currency-strength',
      subjectId: 'JPY',
      horizon: 'swing',
      cohort: 'G10',
      broadDollarState: 'Dollar mixed',
      broadDollarBasis: 'official-evidence',
      strongest: null,
      weakest: null,
      currencyStates: {},
      selectedPair: { base: 'JPY', quote: 'USD', state: 'ready', momentumState: 'supporting', strengthState: 'supporting', riskState: 'contained' },
      hedgeResearchState: 'not-applicable',
      carryUnwindState: 'not-triggered',
      vehicle: {
        state: 'Eligible',
        selectedVehicleId: 'vehicle:FXY',
        selectedTicker: 'FXY',
        selectedStructure: 'single-currency-trust',
        selectedDirection: 'long-JPY/short-USD',
        materialWrapperCaveat: 'legal-structure=single-currency-trust; market NAV and spot can diverge',
        trackingState: 'Tracking',
        alternatives: [],
        rejected: [],
        factCutoff: EVIDENCE_CUTOFF,
        freshUntil: FRESH_UNTIL
      },
      coverage: {},
      conflicts: [],
      confirmation: 'JPY strength remains confirmed on the owner evidence.',
      invalidation: 'JPY strength fails the owner model invalidation boundary.',
      evidenceCutoff: EVIDENCE_CUTOFF,
      freshUntil: FRESH_UNTIL,
      educationalOnly: true,
      executionAvailable: false
    },
    deepLink: 'fx-regime-relative-value-lab.html#simple',
    computedAt: DECISION_TIME,
    freshUntil: FRESH_UNTIL
  };
}

function currentModelRead() {
  return {
    contractVersion: 'tool-model-read/v1',
    toolId: TOOL_ID,
    role: 'source',
    profile: 'live-market',
    status: 'fresh',
    runId: RUN_ID,
    runFingerprint: RUN_FINGERPRINT,
    ownerDecisionId: OWNER_DECISION_ID,
    evidenceIdentity: EVIDENCE_IDENTITY,
    evidenceCutoff: EVIDENCE_CUTOFF,
    adapter: {
      adapterId: MODEL_ADAPTER_ID,
      readContractVersion: 'tool-model-read/v1',
      owningModelVersion: MODEL_VERSION
    },
    summary: 'The owning FX model supplies the current vehicle result.',
    sources: [],
    evidenceRefs: [{ evidenceType: 'web-evidence-bundle', fingerprint: BUNDLE_FINGERPRINT }],
    evidenceInterpretations: [{
      interpretationId: OWNER_INTERPRETATION_REF,
      kind: 'supporting',
      ownerAdapterId: MODEL_ADAPTER_ID,
      ownerModelVersion: MODEL_VERSION,
      evidenceRefs: [BUNDLE_FINGERPRINT],
      actionEligibilityEffect: 'permits-owner-action',
      summary: 'Owner evidence supports the current FX research result.'
    }],
    recommendationEligibility: {
      eligible: true,
      reasonCode: 'owner-supported-by-current-evidence',
      permittedActionFamilies: ['hold'],
      permittedSubjectBoundary: TOOL_ID
    },
    evidenceBoundary: ['No execution and no owner recomputation.'],
    limitations: ['Educational research only.'],
    deepLink: 'fx-regime-relative-value-lab.html#simple',
    fingerprint: MODEL_FINGERPRINT
  };
}

function currentBundle() {
  return {
    contractVersion: 'web-evidence-bundle/v1',
    bundleId: 'fx-brief-bundle-current',
    bundleFingerprint: BUNDLE_FINGERPRINT,
    toolId: TOOL_ID,
    runId: RUN_ID,
    runFingerprint: RUN_FINGERPRINT,
    policyId: 'fx-public-evidence-v1',
    queryPlanRef: hash('feature-004-query-plan'),
    cutoffAt: EVIDENCE_CUTOFF,
    evidenceCutoff: EVIDENCE_CUTOFF,
    acquisitionStartedAt: '2026-08-03T09:30:00.000Z',
    frozenAt: '2026-08-03T10:05:00.000Z',
    ownerDecisionId: OWNER_DECISION_ID,
    evidenceIdentity: EVIDENCE_IDENTITY,
    ownerAdapterId: MODEL_ADAPTER_ID,
    ownerModelVersion: MODEL_VERSION,
    rightsPolicyId: RIGHTS_POLICY_ID,
    rightsEligible: true,
    sources: [source('a'), source('b')],
    claims: CLAIM_KINDS.map(claim),
    rejected: []
  };
}

function currentToolBrief() {
  const owner = currentOwnerRead();
  return {
    contractVersion: 'tool-brief/v2',
    toolId: TOOL_ID,
    profile: 'live-market',
    status: 'validated',
    runId: RUN_ID,
    runFingerprint: RUN_FINGERPRINT,
    contentFingerprint: BRIEF_FINGERPRINT,
    modelReadRef: MODEL_FINGERPRINT,
    evidenceBundleRef: BUNDLE_FINGERPRINT,
    ownerDecisionId: OWNER_DECISION_ID,
    evidenceIdentity: EVIDENCE_IDENTITY,
    evidenceCutoff: EVIDENCE_CUTOFF,
    ownerAdapterId: MODEL_ADAPTER_ID,
    ownerModelVersion: MODEL_VERSION,
    ownerInterpretationRefs: [OWNER_INTERPRETATION_REF],
    rightsPolicyId: RIGHTS_POLICY_ID,
    regime: owner.metrics.broadDollarState,
    trigger: owner.metrics.confirmation,
    invalidation: owner.metrics.invalidation,
    vehicle: structuredClone(owner.metrics.vehicle),
    materialClaims: CLAIM_KINDS.map((kind) => ({
      claimId: `claim-${kind}`,
      claimKind: kind,
      citationRefs: [`excerpt-a-${kind}`, `excerpt-b-${kind}`, OWNER_INTERPRETATION_REF]
    })),
    priorPublicationVerified: false,
    priorPublicationRef: null
  };
}

function currentInputs() {
  return {
    owner: currentOwnerRead(),
    model: currentModelRead(),
    bundle: currentBundle(),
    brief: currentToolBrief()
  };
}

function evaluate(api, inputs, decisionTime) {
  return api.evaluateFxBriefEligibility(inputs.owner, inputs.model, inputs.bundle, inputs.brief, decisionTime);
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true);
  Object.values(value).forEach(assertDeepFrozen);
}

test('RLBRIEF FX eligibility refuses stale mismatched contradicted rights-ineligible or uncited current evidence', () => {
  const { RLBRIEF, RLDATA } = loadRlbrief();
  assert.equal(typeof RLBRIEF.evaluateFxBriefEligibility, 'function');
  assert.equal(RLDATA.validateToolModelRead(currentModelRead()).ok, true);

  const currentArtifacts = currentInputs();
  const currentArtifactsBefore = structuredClone(currentArtifacts);
  const current = evaluate(RLBRIEF, currentArtifacts, DECISION_TIME);
  assert.deepEqual(currentArtifacts, currentArtifactsBefore);
  assert.deepEqual(current, {
    contractVersion: 'rlfx-brief-eligibility/v1',
    state: 'current',
    toolId: TOOL_ID,
    ownerDecisionId: OWNER_DECISION_ID,
    evidenceIdentity: EVIDENCE_IDENTITY,
    evidenceCutoff: EVIDENCE_CUTOFF,
    modelReadRef: MODEL_FINGERPRINT,
    evidenceBundleRef: BUNDLE_FINGERPRINT,
    toolBriefRef: BRIEF_FINGERPRINT,
    blockingReasons: [],
    priorPublicationRef: null
  });
  assertDeepFrozen(current);
  assert.throws(() => current.blockingReasons.push('OWNER_NOT_CURRENT'), TypeError);

  const priorBoundary = currentInputs();
  priorBoundary.owner.availability = 'stale';
  priorBoundary.brief.priorPublicationVerified = true;
  priorBoundary.brief.priorPublicationRef = {
    path: 'briefs/objects/tool-briefs/fx-regime-relative-value-lab/prior.json',
    sha256: hash('prior-fx-publication')
  };
  const prior = evaluate(RLBRIEF, priorBoundary, DECISION_TIME);
  assert.equal(prior.state, 'refused');
  assert.deepEqual(prior.blockingReasons, ['OWNER_NOT_CURRENT']);
  assert.equal(prior.priorPublicationRef, priorBoundary.brief.priorPublicationRef.path);
  assert.notEqual(prior.state, 'current');

  const ownerMismatch = currentInputs();
  ownerMismatch.model.ownerDecisionId = 'fxo-v1-other-owner';
  assert.deepEqual(evaluate(RLBRIEF, ownerMismatch, DECISION_TIME).blockingReasons, ['OWNER_ID_MISMATCH']);

  const modelMismatch = currentInputs();
  modelMismatch.model.adapter.owningModelVersion = 'rlfx-owner-decision/v0';
  modelMismatch.model.evidenceInterpretations[0].ownerModelVersion = 'rlfx-owner-decision/v0';
  assert.deepEqual(evaluate(RLBRIEF, modelMismatch, DECISION_TIME).blockingReasons, ['MODEL_READ_MISMATCH']);

  const bundleMismatch = currentInputs();
  bundleMismatch.bundle.ownerDecisionId = 'fxo-v1-other-owner';
  bundleMismatch.bundle.evidenceIdentity = 'fxe-v1-other-evidence';
  bundleMismatch.bundle.evidenceCutoff = '2026-08-03T09:00:00.000Z';
  bundleMismatch.bundle.cutoffAt = '2026-08-03T09:00:00.000Z';
  bundleMismatch.bundle.runFingerprint = hash('other-run');
  assert.deepEqual(evaluate(RLBRIEF, bundleMismatch, DECISION_TIME).blockingReasons, [
    'OWNER_ID_MISMATCH', 'EVIDENCE_CUTOFF_MISMATCH', 'PUBLICATION_MISMATCH'
  ]);

  const modelBundleRefMismatch = currentInputs();
  modelBundleRefMismatch.model.evidenceRefs[0].fingerprint = hash('other-web-evidence-bundle');
  assert.deepEqual(evaluate(RLBRIEF, modelBundleRefMismatch, DECISION_TIME).blockingReasons, ['PUBLICATION_MISMATCH']);

  const publicationMismatch = currentInputs();
  publicationMismatch.brief.ownerDecisionId = 'fxo-v1-other-owner';
  publicationMismatch.brief.evidenceIdentity = 'fxe-v1-other-evidence';
  publicationMismatch.brief.evidenceCutoff = '2026-08-03T09:00:00.000Z';
  publicationMismatch.brief.modelReadRef = hash('other-model');
  publicationMismatch.brief.evidenceBundleRef = hash('other-bundle');
  publicationMismatch.brief.vehicle.state = 'Caution';
  assert.deepEqual(evaluate(RLBRIEF, publicationMismatch, DECISION_TIME).blockingReasons, [
    'OWNER_ID_MISMATCH', 'EVIDENCE_CUTOFF_MISMATCH', 'PUBLICATION_MISMATCH'
  ]);

  const pendingBundle = currentInputs();
  pendingBundle.bundle = null;
  const pending = evaluate(RLBRIEF, pendingBundle, DECISION_TIME);
  assert.equal(pending.state, 'pending');
  assert.deepEqual(pending.blockingReasons, ['BUNDLE_PENDING']);
  assert.equal(pending.evidenceBundleRef, null);

  const stale = currentInputs();
  stale.bundle.claims[0].freshnessState = 'stale';
  assert.deepEqual(evaluate(RLBRIEF, stale, DECISION_TIME).blockingReasons, ['BUNDLE_STALE']);

  const contradicted = currentInputs();
  contradicted.bundle.claims[1].corroborationState = 'conflicted';
  contradicted.bundle.claims[1].conflictState = 'conflicted';
  assert.deepEqual(evaluate(RLBRIEF, contradicted, DECISION_TIME).blockingReasons, ['BUNDLE_CONTRADICTED']);

  const rightsIneligible = currentInputs();
  rightsIneligible.bundle.claims[2].rightsEligible = false;
  assert.deepEqual(evaluate(RLBRIEF, rightsIneligible, DECISION_TIME).blockingReasons, ['BUNDLE_RIGHTS_INELIGIBLE']);

  const uncited = currentInputs();
  uncited.brief.materialClaims[3].citationRefs = [];
  assert.deepEqual(evaluate(RLBRIEF, uncited, DECISION_TIME).blockingReasons, ['CLAIM_UNCITED']);

  const mismatchedCitation = currentInputs();
  mismatchedCitation.brief.materialClaims[4].citationRefs = [hash('not-an-allowed-citation')];
  assert.deepEqual(evaluate(RLBRIEF, mismatchedCitation, DECISION_TIME).blockingReasons, ['CLAIM_UNCITED']);

  const expiredOwner = currentInputs();
  assert.deepEqual(evaluate(RLBRIEF, expiredOwner, '2026-08-03T17:00:00.000Z').blockingReasons, ['OWNER_NOT_CURRENT']);
  assert.deepEqual(evaluate(RLBRIEF, currentInputs(), 'not-an-iso-time').blockingReasons, ['OWNER_NOT_CURRENT']);

  const unavailable = RLBRIEF.evaluateFxBriefEligibility(null, null, null, null, DECISION_TIME);
  assert.equal(unavailable.state, 'unavailable');
  assert.deepEqual(unavailable.blockingReasons, ['OWNER_READ_MISSING']);
  assert.equal(unavailable.priorPublicationRef, null);

  const wrongVersions = currentInputs();
  wrongVersions.owner.contractVersion = 'rl-tool-read/v0';
  wrongVersions.owner.metrics.contractVersion = 'rlfx-tool-read/v1';
  wrongVersions.model.contractVersion = 'tool-model-read/v0';
  wrongVersions.bundle.contractVersion = 'web-evidence-bundle/v0';
  wrongVersions.brief.contractVersion = 'tool-brief/v1';
  const wrong = evaluate(RLBRIEF, wrongVersions, DECISION_TIME);
  assert.equal(wrong.state, 'refused');
  assert.deepEqual(wrong.blockingReasons, ['OWNER_NOT_CURRENT', 'MODEL_READ_MISMATCH', 'PUBLICATION_MISMATCH']);

  const combined = currentInputs();
  combined.owner.availability = 'stale';
  combined.model.ownerDecisionId = 'fxo-v1-other-owner';
  combined.model.evidenceCutoff = '2026-08-03T09:00:00.000Z';
  combined.model.adapter.owningModelVersion = 'rlfx-owner-decision/v0';
  combined.model.evidenceInterpretations[0].ownerModelVersion = 'rlfx-owner-decision/v0';
  combined.model.runFingerprint = hash('combined-model-run');
  combined.bundle.ownerDecisionId = 'fxo-v1-other-owner';
  combined.bundle.evidenceIdentity = 'fxe-v1-other-evidence';
  combined.bundle.evidenceCutoff = '2026-08-03T09:00:00.000Z';
  combined.bundle.cutoffAt = '2026-08-03T09:00:00.000Z';
  combined.bundle.claims[0].freshnessState = 'stale';
  combined.bundle.claims[1].corroborationState = 'conflicted';
  combined.bundle.claims[1].conflictState = 'conflicted';
  combined.bundle.claims[2].rightsEligible = false;
  combined.brief.ownerDecisionId = 'fxo-v1-other-owner';
  combined.brief.evidenceCutoff = '2026-08-03T09:00:00.000Z';
  combined.brief.modelReadRef = hash('combined-other-model');
  combined.brief.materialClaims[3].citationRefs = [];
  combined.bundle.claims.reverse();
  combined.brief.materialClaims.reverse();
  const combinedResult = evaluate(RLBRIEF, combined, DECISION_TIME);
  assert.deepEqual(combinedResult.blockingReasons, [
    'OWNER_NOT_CURRENT', 'OWNER_ID_MISMATCH', 'EVIDENCE_CUTOFF_MISMATCH',
    'MODEL_READ_MISMATCH', 'BUNDLE_STALE', 'BUNDLE_CONTRADICTED',
    'BUNDLE_RIGHTS_INELIGIBLE', 'CLAIM_UNCITED', 'PUBLICATION_MISMATCH'
  ]);
  assertDeepFrozen(combinedResult);

  const helperSource = String(RLBRIEF.evaluateFxBriefEligibility);
  assert.doesNotMatch(helperSource, /\bfetch\s*\(|XMLHttpRequest|Date\.now|localStorage|computeFx|computeVehicle|RLFX/);
});