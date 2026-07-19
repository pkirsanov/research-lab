/*
 * tests/fixtures/feature-002/authorship/brief-fixture-builder.mjs
 *
 * Deterministic Scope 06 fixtures: eligible/ineligible owner reads, valid tool briefs, valid
 * recommendation records, the committed per-profile budget config, and a production-shaped author
 * transport. The transport builds its response brief ONLY from the frozen request it receives (exactly
 * as a real external author would), so the pool/integration/e2e tests exercise real compaction, request
 * building, envelope gating, and ToolBrief validation rather than self-validating a supplied answer.
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../../../../rlcontracts.js');

export function makeHash(seed) {
  return `sha256:${createHash('sha256').update(String(seed)).digest('hex')}`;
}

/* A live-market owner read that is recommendation-eligible: it carries an owner-produced supporting
   interpretation (with an explicit interpretationId), evidence refs, required + optional facts, and a
   permitted market action family. */
export function eligibleOwnerRead(overrides = {}) {
  const read = {
    contractVersion: 'tool-model-read/v1',
    toolId: 'sector-research-lab',
    role: 'source',
    profile: 'live-market',
    status: 'fresh',
    adapter: { adapterId: 'sector-owning-model-v1', readContractVersion: 'tool-model-read/v1', owningModelVersion: 'sector-rrg/v1' },
    evaluatedAt: '2026-07-14T12:40:00.000Z',
    modelAsOf: '2026-07-14T12:00:00.000Z',
    sourceAsOf: '2026-07-14T12:35:00.000Z',
    freshUntil: '2026-07-14T18:00:00.000Z',
    evidenceCutoff: '2026-07-14T12:40:00.000Z',
    summary: 'Sector rotation favors XLK over XLF on improving breadth.',
    sources: [{ sourceId: 'yahoo-chart', asOf: '2026-07-14T12:35:00.000Z', fingerprint: makeHash('src-agg') }],
    marketSessionEvidenceRef: { evidenceType: 'market-session-evidence', fingerprint: makeHash('mse-bundle') },
    evidenceRefs: [
      { evidenceType: 'session-aggregate', fingerprint: makeHash('agg-XLK') },
      { evidenceType: 'comparable-volume-baseline', fingerprint: makeHash('base-XLK') }
    ],
    evidenceInterpretations: [
      { interpretationId: 'interp-rrg', kind: 'supporting', ownerAdapterId: 'sector-owning-model-v1', ownerModelVersion: 'sector-rrg/v1', evidenceRefs: [makeHash('agg-XLK')], actionEligibilityEffect: 'permits-owner-action', summary: 'RRG supports rotation' }
    ],
    recommendationEligibility: { eligible: true, reasonCode: 'owner-supported-by-shared-evidence', permittedActionFamilies: ['rotate', 'hedge'], permittedSubjectBoundary: 'sector-research-lab' },
    facts: [
      { id: 'fact-rrg-state', requiredForBrief: true, briefPriority: 100, value: 'XLK leading', unit: 'label' },
      { id: 'fact-accel', requiredForBrief: false, briefPriority: 80, value: 0.3, unit: 'z' },
      { id: 'fact-breadth', requiredForBrief: false, briefPriority: 60, value: 8, unit: 'count' }
    ],
    evidenceBoundary: ['session evidence is tactical confirmation only'],
    limitations: ['single benchmark SPY'],
    deepLink: 'sector-research-lab.html',
    fingerprint: makeHash('read-sector-fresh')
  };
  return { ...read, ...overrides };
}

/* An ineligible source read (any profile): no market recommendation is legal against it. */
export function ineligibleRead(toolId = 'ai-capex-strategy-lab', profile = 'static-model', overrides = {}) {
  const read = {
    contractVersion: 'tool-model-read/v1',
    toolId,
    role: 'source',
    profile,
    status: 'not-applicable',
    adapter: { adapterId: `${toolId}-read-v1`, readContractVersion: 'tool-model-read/v1', owningModelVersion: `${toolId}/v1` },
    evidenceCutoff: '2026-07-14T12:40:00.000Z',
    summary: `${toolId} carries no market recommendation this run.`,
    sources: [],
    marketSessionEvidenceRef: null,
    evidenceRefs: [],
    evidenceApplicability: { status: 'not-applicable', reason: `${toolId} cannot consume XNYS market-session evidence` },
    evidenceInterpretations: [],
    recommendationEligibility: { eligible: false, reasonCode: 'not-applicable', permittedActionFamilies: [], permittedSubjectBoundary: toolId },
    evidenceBoundary: [],
    limitations: [],
    deepLink: `${toolId}.html`,
    fingerprint: makeHash(`read-${toolId}-na`)
  };
  return { ...read, ...overrides };
}

/* A valid recommendation-bearing brief for an eligible live-market read. */
export function recommendationBrief(read, overrides = {}) {
  const evidenceFingerprint = read.evidenceRefs[0].fingerprint;
  const brief = {
    contractVersion: 'tool-brief/v1',
    toolId: read.toolId,
    profile: read.profile,
    runId: read.runId || 'run-scope06-fixture',
    readRef: { path: `briefs/objects/reads/${read.toolId}.json`, sha256: makeHash(`${read.toolId}-read-obj`), fingerprint: read.fingerprint },
    inputFingerprint: makeHash(`${read.toolId}-input`),
    contentFingerprint: makeHash(`${read.toolId}-content`),
    outcome: 'newly-authored',
    status: 'validated',
    summary: 'Rotate toward XLK as improving breadth confirms leadership.',
    decisionRationale: 'RRG leading quadrant with positive acceleration and qualified volume confirmation.',
    recommendations: [{
      originToolId: read.toolId,
      thesisFamily: 'relative-rotation',
      subjects: ['XLK', 'XLF'],
      actionFamily: 'rotate',
      horizon: 'swing',
      trigger: 'XLK holds relative strength above 100',
      invalidation: 'XLK relative momentum rolls below 100',
      confidenceBand: 'moderate',
      confidenceScore: 64,
      applicability: 'educational-market-research',
      rationaleEvidenceIds: ['fact-rrg-state', evidenceFingerprint]
    }],
    nextSteps: [],
    marketSessionEvidenceRef: read.marketSessionEvidenceRef,
    evidenceRefs: [read.evidenceRefs[0]],
    ownerInterpretationRefs: ['interp-rrg'],
    windowUse: 'confirmation',
    evidenceBoundary: read.evidenceBoundary.slice(),
    limitations: read.limitations.slice(),
    authorship: { provider: 'copilot-cli', model: 'gpt-5', promptPolicy: 'tool-brief-prompt/v1', authoredAt: '2026-07-14T12:41:00.000Z', attempts: 1 },
    validation: { schema: 'tool-brief/v1', passed: ['shape', 'evidence', 'privacy'] }
  };
  return { ...brief, ...overrides };
}

/* A minimal no-recommendation brief valid against ANY read (empty evidence/interpretation subsets, null
   session ref, empty recommendations). This is the honest outcome for a not-applicable/ineligible read. */
export function noRecommendationBrief(read, overrides = {}) {
  const brief = {
    contractVersion: 'tool-brief/v1',
    toolId: read.toolId,
    profile: read.profile,
    runId: read.runId || 'run-scope06-fixture',
    readRef: { path: `briefs/objects/reads/${read.toolId}.json`, sha256: makeHash(`${read.toolId}-read-obj`), fingerprint: read.fingerprint },
    inputFingerprint: makeHash(`${read.toolId}-input`),
    contentFingerprint: makeHash(`${read.toolId}-content`),
    outcome: 'no-recommendation',
    status: 'validated',
    summary: `${read.toolId} has no eligible market recommendation this run.`,
    decisionRationale: 'Read status and profile do not support a market action.',
    recommendations: [],
    nextSteps: [],
    marketSessionEvidenceRef: null,
    evidenceRefs: [],
    ownerInterpretationRefs: [],
    windowUse: 'not-applicable',
    evidenceBoundary: [],
    limitations: [],
    authorship: { provider: 'copilot-cli', model: 'gpt-5', promptPolicy: 'tool-brief-prompt/v1', authoredAt: '2026-07-14T12:41:00.000Z', attempts: 1 },
    validation: { schema: 'tool-brief/v1', passed: ['shape', 'privacy'] }
  };
  return { ...brief, ...overrides };
}

/* A plain Recommendation/v1 record for the lifecycle/grouping reducers. */
export function recommendationRecord(overrides = {}) {
  const base = {
    originToolId: 'sector-research-lab',
    thesisFamily: 'relative-rotation',
    subjects: ['XLK', 'XLF'],
    actionFamily: 'rotate',
    horizon: 'swing',
    trigger: 'XLK holds relative strength above 100',
    invalidation: 'XLK relative momentum rolls below 100',
    confidenceBand: 'moderate',
    confidenceScore: 64,
    applicability: 'educational-market-research',
    rationaleEvidenceIds: ['rrg-state', 'breadth']
  };
  return { ...base, ...overrides };
}

export function profileBudgets() {
  return {
    'live-market': { maxInputTokens: 7500, maxOutputTokens: 1200, promptReserveBytes: 512 },
    'static-model': { maxInputTokens: 5000, maxOutputTokens: 1000, promptReserveBytes: 512 },
    'local-model': { maxInputTokens: 4000, maxOutputTokens: 900, promptReserveBytes: 512 },
    'off-theme': { maxInputTokens: 3000, maxOutputTokens: 700, promptReserveBytes: 512 }
  };
}

export function runBudget(sourceCount) {
  return { maxInputTokens: 200000, maxOutputTokens: 36000, maxAttempts: 3 * sourceCount + 3 };
}

export function authorIdentity() {
  return { providerId: 'copilot-cli', modelId: 'gpt-5', promptPolicyVersion: 'tool-brief-prompt/v1', schemaVersion: 'tool-brief/v1', validatorVersion: 'tool-brief-validator/v1' };
}

/* A production-shaped transport that authors ONE valid no-recommendation brief from the frozen request's
   compacted read. It is an async function of the request JSON string (as invokeAuthor's transport hook
   expects) and returns the raw stdout string. It reads only what the request carries — it cannot see the
   caller's read object — so downstream ToolBrief validation is a genuine check, not self-validation. */
export function noRecommendationTransport() {
  return async (requestJson) => {
    const request = JSON.parse(requestJson);
    const read = request.data.compactedRead;
    const brief = noRecommendationBrief(read);
    return JSON.stringify({ contractVersion: 'tool-author-response/v1', requestFingerprint: request.requestFingerprint, brief });
  };
}

/* Wrap a raw-stdout transport as an invokeAuthor-compatible result producer for direct pool use. */
export function envelopeAuthorFn(rawTransport) {
  return async (request) => {
    const raw = await rawTransport(JSON.stringify(request));
    try {
      return { ok: true, envelope: JSON.parse(raw) };
    } catch (error) {
      return { ok: false, error: { code: 'B002-TOOL-AUTHOR-MALFORMED', reason: 'transport-non-json' } };
    }
  };
}
