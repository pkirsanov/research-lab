/*
 * tests/fixtures/feature-012/tool-brief-v2/builder.mjs
 * ---------------------------------------------------------------------------
 * Feature 012 Scope 11 — deterministic INPUT builders for the ToolBrief/v2
 * author + publication suites.
 *
 * These builders emit INPUTS ONLY. Every verdict — the frozen author
 * projection, the request fingerprint, the brief validation outcome, the
 * publication inventory — is DERIVED by the real production modules under
 * test. Nothing here echoes an expected answer, and nothing here computes a
 * fingerprint the production code is then asked to agree with.
 *
 * The bundle shape mirrors exactly what scripts/web-evidence-acquire.mjs
 * acquire() emits (claimId / materiality / claimKind / normalizedClaim /
 * sourceExcerptRefs / independentOriginGroups / ownerEvidenceRefs /
 * corroborationState / conflictState / freshnessState / authorable), so a
 * builder drift from production is a test failure rather than a silent pass.
 */
import { createHash } from 'node:crypto';

export const CUTOFF_AT = '2026-07-26T15:00:00.000Z';
export const FROZEN_AT = '2026-07-26T15:04:00.000Z';
export const RUN_ID = 'run-2026-07-26-1100et';
export const TOOL_ID = 'company-fundamentals-lab';
export const PUBLIC_TICKER = 'MSFT';

/* Canonical JSON + sha256, identical in shape to the production canonicalizers.
   Used ONLY to mint the input-side owner-read/bundle identities a real
   acquisition would already carry. */
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}

export function digest(value) {
  return `sha256:${createHash('sha256').update(canonical(value), 'utf8').digest('hex')}`;
}

/* ── owner read (the tool's own published read; the only non-web input) ── */

export function ownerRead(overrides) {
  const body = {
    contractVersion: 'tool-owner-read/v1',
    toolId: TOOL_ID,
    asOf: '2026-07-26T14:30:00.000Z',
    state: 'current',
    eligibility: 'recommendation-eligible',
    marketState: 'FY26 guidance raised; operating margin steady',
    facts: [
      { factId: 'owner:fy26-guide', text: 'FY26 revenue guidance was raised at the July print.' },
      { factId: 'owner:margin', text: 'Operating margin held at its trailing four-quarter median.' }
    ],
    ...(overrides || {})
  };
  return Object.freeze({ ref: `read:${body.toolId}:${body.asOf}`, sha256: digest(body), body: Object.freeze(body) });
}

/* ── a frozen WebEvidenceBundle/v1 exactly as acquire() emits it ── */

function source(id, group, over) {
  return {
    sourceId: id,
    canonicalUrl: `https://example-wire.test/${id}`,
    title: `Report ${id}`,
    publisher: `Publisher ${group}`,
    sourceClass: 'wire',
    mediaType: 'text/html',
    contentSha256: `sha256:${'a'.repeat(64)}`,
    independentOriginGroup: group,
    publishedAt: '2026-07-26T12:00:00.000Z',
    fetchedAt: '2026-07-26T15:02:00.000Z',
    freshnessState: 'current',
    directionTag: 'up',
    supportsClaims: [],
    excerpts: [{ excerptId: `${id}:e1`, text: 'Guidance was raised for the fiscal year.', byteLength: 44 }],
    ...(over || {})
  };
}

export function claim(id, over) {
  return {
    claimId: id,
    materiality: 'material',
    claimKind: 'market-state',
    normalizedClaim: `${id}: fiscal-year guidance was raised at the July print`,
    sourceExcerptRefs: ['src-a:e1', 'src-b:e1'],
    independentOriginGroups: ['origin:a', 'origin:b'],
    ownerEvidenceRefs: ['owner:fy26-guide'],
    corroborationState: 'corroborated',
    conflictState: 'consistent',
    freshnessState: 'current',
    authorable: true,
    ...(over || {})
  };
}

/* Build a bundle whose declared bundleFingerprint is derived from its own body,
   so validateBundle()/freezeBundleForAuthor() verify a REAL hash rather than a
   hand-written literal. */
export function bundle(overrides) {
  const over = overrides || {};
  const claims = over.claims || [claim('claim-guidance'), claim('claim-margin', {
    normalizedClaim: 'claim-margin: operating margin held at its trailing median',
    independentOriginGroups: ['origin:c', 'origin:d'],
    ownerEvidenceRefs: ['owner:margin']
  })];
  const sources = over.sources || [
    source('src-a', 'origin:a', { supportsClaims: ['claim-guidance'] }),
    source('src-b', 'origin:b', { supportsClaims: ['claim-guidance'] }),
    source('src-c', 'origin:c', { supportsClaims: ['claim-margin'] }),
    source('src-d', 'origin:d', { supportsClaims: ['claim-margin'] })
  ];
  const body = {
    contractVersion: 'web-evidence-bundle/v1',
    bundleId: over.bundleId || `bundle:${TOOL_ID}:${RUN_ID}`,
    toolId: over.toolId || TOOL_ID,
    runId: over.runId || RUN_ID,
    policyId: 'web-evidence-acquisition/v1',
    queryPlanRef: 'plan:tool-brief:1',
    cutoffAt: over.cutoffAt || CUTOFF_AT,
    acquisitionStartedAt: '2026-07-26T15:01:00.000Z',
    frozenAt: over.frozenAt || FROZEN_AT,
    sources,
    claims,
    rejected: [],
    byteInventory: { bundleBytes: 4096 },
    coverage: { independentOriginCount: 4 }
  };
  return Object.freeze({ ...body, bundleFingerprint: digest(body) });
}

/* the lane policy the committed market-brief.config.json publishes for `tool-brief`. */
export function lanePolicy(overrides) {
  return {
    maxRetainedOrigins: 10,
    maxExcerptBytes: 1200,
    maxBundleBytes: 262144,
    ...(overrides || {})
  };
}

/* ── author identity (non-secret provenance only) ── */

export function identity(overrides) {
  return {
    providerId: 'bounded-author',
    modelId: 'tool-brief-author/v2',
    promptPolicyVersion: 'tool-brief-policy/v2',
    schemaVersion: 'tool-brief/v2',
    validatorVersion: 'tool-brief-validator/v2',
    ...(overrides || {})
  };
}

/* ── an authored ToolBrief/v2 body (what the powerless author returns) ── */

export function authoredBrief(request, overrides) {
  const data = request.data;
  const over = overrides || {};
  const body = {
    contractVersion: 'tool-brief/v2',
    briefId: over.briefId || `brief:${data.toolId}:${data.runId}`,
    toolId: data.toolId,
    runId: data.runId,
    cutoffAt: data.cutoffAt,
    scope: over.scope || 'tool',
    ticker: 'ticker' in over ? over.ticker : null,
    ownerReadRef: data.ownerRead.ref,
    ownerReadSha256: data.ownerRead.sha256,
    evidenceBundleRef: data.evidence.bundleRef,
    evidenceBundleSha256: data.evidence.bundleSha256,
    state: over.state || 'action',
    concise: 'concise' in over ? over.concise : {
      action: {
        verb: 'verify',
        subject: 'MSFT fiscal-year guidance',
        trigger: 'the next print confirms the raised guide',
        invalidation: 'guidance is cut or the margin median breaks lower',
        horizon: '0-4w',
        confidenceBasis: 'two independent origins plus the owner read',
        citations: ['claim-guidance'],
        ownerLink: 'company-fundamentals-lab.html#MSFT'
      },
      catalysts: [{
        subject: 'MSFT quarterly print',
        whenAt: '2026-07-29T20:00:00.000Z',
        trigger: 'the print lands inside this window',
        invalidation: 'the print is deferred past the horizon',
        horizon: '0-1w',
        citations: ['claim-margin'],
        ownerLink: 'company-fundamentals-lab.html#MSFT'
      }]
    },
    claimMappings: 'claimMappings' in over ? over.claimMappings : [
      { sentence: 'Fiscal-year guidance was raised at the July print.', claimId: 'claim-guidance', materiality: 'material' },
      { sentence: 'Operating margin held at its trailing median.', claimId: 'claim-margin', materiality: 'material' }
    ],
    detail: 'detail' in over ? over.detail : [
      { id: 'methodology', kind: 'methodology' },
      { id: 'full-evidence', kind: 'evidence' },
      { id: 'long-context', kind: 'context' },
      { id: 'history', kind: 'history' }
    ],
    noAction: 'noAction' in over ? over.noAction : null,
    ...(over.extra || {})
  };
  return body;
}

/* an author transport that returns exactly one well-formed v2 envelope. */
export function transportFor(briefBody) {
  return async (requestJson) => {
    const request = JSON.parse(requestJson);
    return JSON.stringify({
      contractVersion: 'tool-author-response/v2',
      requestFingerprint: request.requestFingerprint,
      brief: briefBody
    });
  };
}
