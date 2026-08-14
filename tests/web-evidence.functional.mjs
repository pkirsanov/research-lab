#!/usr/bin/env node
/*
 * tests/web-evidence.functional.mjs
 * ------------------------------------------------------------------------
 * Feature 012 Scope 10 — TP-10-02 acquisition functional tests.
 *
 * CATEGORY: functional over an INJECTED search/fetch boundary. This is NOT a
 * live-system test: each fixture supplies deterministic static search results
 * and retrieval responses through the same dependency-injected boundary the
 * scheduled operation uses; NO socket is opened and NO external network is
 * required. It drives the REAL production acquire() (scripts/web-evidence-
 * acquire.mjs) end-to-end and asserts the frozen WebEvidenceBundle/v1 plus the
 * bounded acquisition, robots, extraction, freeze, and corroboration behavior.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderQueryPlan, validateBundle } from '../scripts/web-evidence-acquire.mjs';
import {
  acquireResearchAgendaEvidence,
  buildResearchAgendaQueryInput,
  planResearchAgendaAcquisition,
  resolveResearchAgendaPolicy
} from '../scripts/research-agenda-generation.mjs';
import {
  createResearchAgendaLiveBoundary,
  RESEARCH_ACQUISITION_SEARCH_VERSION
} from '../scripts/research-agenda-refresh.mjs';
import { NARRATIVE_WEB_ALLOWLIST } from '../scripts/web-evidence-policy.mjs';
import {
  loadConfig,
  resolveFixturePolicies,
  loadFixture,
  runFixtureAcquisition,
  evaluateFixture
} from '../scripts/validate-web-evidence.mjs';

const config = loadConfig();
const policies = resolveFixturePolicies(config);
const toolBrief = policies['tool-brief'];

test('SCN-012-037 acquisition freezes a safe bounded WebEvidenceBundle/v1 with no raw or hostile content', async () => {
  const { acquireResult, requestedUrls } = await runFixtureAcquisition(loadFixture('primary-independent'), toolBrief);
  assert.equal(acquireResult.ok, true);
  const bundle = acquireResult.value;

  // frozen + re-validatable + correctly versioned.
  assert.equal(Object.isFrozen(bundle), true, 'bundle must be frozen');
  assert.equal(bundle.contractVersion, 'web-evidence-bundle/v1');
  assert.equal(validateBundle(bundle, toolBrief).ok, true, 'frozen bundle re-validates');
  assert.match(bundle.bundleFingerprint, /^sha256:[0-9a-f]{64}$/);

  // exact source hashes + bounded excerpts + metadata present.
  assert.equal(bundle.sources.length, 2);
  for (const source of bundle.sources) {
    assert.match(source.contentSha256, /^sha256:[0-9a-f]{64}$/, 'exact source content hash present');
    assert.ok(source.excerpts.length >= 1, 'at least one bounded excerpt');
    for (const excerpt of source.excerpts) {
      assert.ok(excerpt.byteLength <= toolBrief.maxExcerptBytes, 'excerpt is within the byte cap');
      assert.equal(typeof excerpt.text, 'string');
    }
    // safe source metadata retained.
    for (const field of ['title', 'publisher', 'publishedAt', 'sourceClass', 'canonicalUrl', 'independentOriginGroup']) {
      assert.ok(source[field], `source retains ${field}`);
    }
  }

  // claims / origins / coverage / byte-inventory present and bounded.
  assert.equal(bundle.coverage.independentOriginCount, 2);
  assert.equal(bundle.coverage.corroboratedMaterialClaimCount, 1);
  assert.ok(bundle.byteInventory.bundleBytes > 0);
  assert.ok(bundle.byteInventory.bundleBytes <= toolBrief.maxBundleBytes);

  // NO raw HTML / scripts / instructions / credentials / redirects / private context / author authority.
  const serialized = JSON.stringify(bundle);
  assert.equal(serialized.includes('<p>'), false, 'raw HTML markup must be stripped from excerpts');
  assert.equal(serialized.includes('<script'), false, 'no script markup');
  assert.equal(/password\s*[=:]/i.test(serialized), false, 'no credential syntax');
  assert.equal(serialized.includes('ignore all previous instructions'), false, 'no instruction-shaped content');
  assert.equal('authored' in bundle, false, 'the acquisition bundle carries no author output');
  assert.equal('currentPointer' in bundle, false, 'no public current pointer is produced');
  // robots.txt was fetched before content for each host.
  assert.ok(requestedUrls.some((u) => u.endsWith('/robots.txt')), 'robots policy fetched under the same boundary');
});

test('SCN-012-006 a single-origin material claim is rejected as uncorroborated', async () => {
  await evaluateFixture(loadFixture('one-origin-uncorroborated'), toolBrief);
});

test('SCN-012-007 syndicated pages count as one origin; a second independent origin is still required', async () => {
  await evaluateFixture(loadFixture('syndicated-common-origin'), toolBrief);
});

test('conflicting independent sources reject a material claim (not averaged)', async () => {
  const { acquireResult } = await runFixtureAcquisition(loadFixture('conflict'), toolBrief);
  const bundle = acquireResult.value;
  const claim = bundle.claims.find((c) => c.claimId === 'claim-outlook');
  assert.equal(claim.corroborationState, 'conflicted');
  assert.equal(claim.authorable, false);
});

test('a stale source does not count toward the two-current-origin requirement', async () => {
  await evaluateFixture(loadFixture('stale'), toolBrief);
  const { acquireResult } = await runFixtureAcquisition(loadFixture('stale'), toolBrief);
  const bundle = acquireResult.value;
  assert.equal(bundle.sources.find((s) => s.sourceId === 'cand-stale').freshnessState, 'stale');
  assert.equal(bundle.claims.find((c) => c.claimId === 'claim-guidance').corroborationState, 'uncorroborated');
});

test('policy enforcement: robots-disallow rejects the candidate and never retrieves its content url', async () => {
  const fixture = loadFixture('robots-disallow');
  await evaluateFixture(fixture, toolBrief);
  const { requestedUrls } = await runFixtureAcquisition(fixture, toolBrief);
  assert.equal(requestedUrls.includes('https://reuters.example/robots.txt'), true, 'robots was fetched');
  assert.equal(requestedUrls.includes('https://reuters.example/markets/acme-secret'), false, 'disallowed content url must never be fetched');
});

test('policy enforcement: redirects are rejected (finalUrl != requested url)', async () => {
  await evaluateFixture(loadFixture('redirects'), toolBrief);
});

test('policy enforcement: over-budget candidate cardinality fails closed before any retrieval', async () => {
  const fixture = loadFixture('over-budget');
  await evaluateFixture(fixture, toolBrief);
  const { acquireResult, requestedUrls } = await runFixtureAcquisition(fixture, toolBrief);
  assert.equal(acquireResult.ok, false);
  assert.equal(acquireResult.error.code, 'E012-WEB-BUDGET');
  assert.equal(requestedUrls.length, 0, 'no url is retrieved on a pre-request budget failure');
});

test('policy enforcement: missing source metadata is rejected (missing-metadata)', async () => {
  await evaluateFixture(loadFixture('metadata-gaps'), toolBrief);
});

test('policy enforcement: a source published after the cutoff is rejected (later-than-cutoff)', async () => {
  await evaluateFixture(loadFixture('later-than-cutoff'), toolBrief);
});

test('policy enforcement: an instruction-shaped excerpt is discarded and never echoed', async () => {
  const fixture = loadFixture('injection-hostile');
  await evaluateFixture(fixture, toolBrief);
  const { acquireResult } = await runFixtureAcquisition(fixture, toolBrief);
  const bundle = acquireResult.value;
  assert.equal(bundle.coverage.retainedSourceCount, 0);
  assert.equal(JSON.stringify(bundle).includes('Ignore all previous instructions'), false, 'hostile excerpt is never stored');
  const rejection = bundle.rejected.find((r) => r.candidateId === 'cand-injection');
  assert.equal(rejection.reasonCode, 'E012-WEB-UNSAFE');
  assert.equal(rejection.safeReasonDetail, 'instruction-shaped-content');
});

test('SCN-019-012 generation reuses current evidence and acquires only missing or stale requirements', () => {
  const registry = JSON.parse(readFileSync(new URL('../research-agenda.json', import.meta.url), 'utf8'));
  const topic = registry.topics[0];
  const definition = JSON.parse(readFileSync(new URL('../' + topic.definitionRef, import.meta.url), 'utf8'));
  const selectedPlan = { ok: true, selected: [{ topicId: topic.topicId }] };
  const requirements = definition.sourceRequirements;
  const current = {
    requirementId: requirements[0].requirementId,
    observedAt: '2026-08-13T10:00:00.000Z',
    availableAt: '2026-08-13T10:05:00.000Z',
    contentSha256: 'sha256:' + 'a'.repeat(64),
    claimCoverage: requirements[0].requiredClaimCoverage.slice()
  };
  const stale = {
    requirementId: requirements[1].requirementId,
    observedAt: '2026-08-10T10:00:00.000Z',
    availableAt: '2026-08-10T10:05:00.000Z',
    contentSha256: 'sha256:' + 'b'.repeat(64),
    claimCoverage: requirements[1].requiredClaimCoverage.slice()
  };
  const planned = planResearchAgendaAcquisition({
    plan: selectedPlan,
    definitionsByTopicId: { [topic.topicId]: definition },
    evidenceByTopicId: { [topic.topicId]: [current, stale] },
    cutoffAt: '2026-08-13T12:00:00.000Z'
  });
  assert.equal(planned.ok, true);
  assert.equal(planned.value.reusedCount, 1);
  assert.equal(planned.value.missingOrStaleCount, requirements.length - 1);
  assert.equal(planned.value.topics[0].requirements.find((row) => row.requirementId === current.requirementId).state, 'reused');
  assert.equal(planned.value.topics[0].requirements.find((row) => row.requirementId === stale.requirementId).state, 'missing-or-stale');

  const agendaPolicy = resolveResearchAgendaPolicy(config);
  assert.equal(agendaPolicy.ok, true);
  const queryInput = buildResearchAgendaQueryInput({
    acquisitionPlan: planned.value,
    definitionsByTopicId: { [topic.topicId]: definition },
    runId: 'agenda-run-001',
    cutoffAt: '2026-08-13T12:00:00.000Z',
    policy: agendaPolicy.value
  });
  assert.equal(queryInput.ok, true);
  assert.equal(queryInput.value.templates.length, requirements.length - 1);
  assert.equal(queryInput.value.templates.some((template) => template.templateId.endsWith(current.requirementId)), false, 'reused requirement produces no query');
});

test('Regression: shared web policy preserves all existing lane allowlist arguments byte for byte', () => {
  const legacy = [
    'finance.yahoo.com', 'query1.finance.yahoo.com', 'query2.finance.yahoo.com',
    'production.dataviz.cnn.io', 'www.federalreserve.gov', 'www.bls.gov',
    'www.bea.gov', 'fred.stlouisfed.org', 'api.stlouisfed.org', 'www.cnbc.com',
    'www.reuters.com', 'www.marketwatch.com', 'www.investing.com',
    'www.cmegroup.com', 'www.treasurydirect.gov'
  ];
  assert.deepEqual(NARRATIVE_WEB_ALLOWLIST, legacy);
  const launcherSource = readFileSync(new URL('../scripts/brief-narrative-parallel.mjs', import.meta.url), 'utf8');
  assert.match(launcherSource, /NARRATIVE_WEB_ALLOWLIST/);
  assert.doesNotMatch(launcherSource, /const webAllow\s*=\s*\[/);
});

test('Regression: production agenda acquisition binds searched URLs to bounded no-redirect retrieval', async () => {
  const agendaPolicy = resolveResearchAgendaPolicy(config);
  assert.equal(agendaPolicy.ok, true);
  const queryInput = {
    toolId: 'research-agenda',
    runId: 'generation-' + '9'.repeat(64),
    cutoffAt: '2026-08-13T12:00:00.000Z',
    templates: [{
      templateId: 'geopolitical-supply-shock-official-policy-and-statements',
      termsTemplate: 'verified public policy statement',
      purpose: 'official-policy-and-statements',
      allowedHosts: [{ host: 'www.reuters.com', pathPrefix: '/' }],
      requiredSourceClasses: ['wire'],
      freshnessWindowDays: 1,
      maxResults: 1
    }],
    facts: {}
  };
  const queryPlan = renderQueryPlan(queryInput, agendaPolicy.value);
  assert.equal(queryPlan.ok, true);
  const query = queryPlan.value.queries[0];
  const candidateUrl = 'https://www.reuters.com/world/example-policy-update';
  const excerpt = 'Officials described a verified public policy update.';
  const searchFragment = {
    contractVersion: RESEARCH_ACQUISITION_SEARCH_VERSION,
    generationId: queryInput.runId,
    queries: [{
      queryId: query.queryId,
      candidates: [{
        candidateId: query.queryId + ':c0',
        url: candidateUrl,
        title: 'Example policy update',
        publisher: 'Reuters',
        publishedAt: '2026-08-13T10:00:00.000Z',
        sourceClass: 'wire',
        canonicalOriginRef: null,
        supportsClaims: ['claim-policy-update'],
        directionTag: 'supports',
        excerpts: [excerpt]
      }]
    }]
  };
  const requested = [];
  const response = (url, body, contentType = 'text/plain') => ({
    status: 200,
    url,
    headers: { get: (name) => name.toLowerCase() === 'content-type' ? contentType : null },
    arrayBuffer: async () => Buffer.from(body)
  });
  const boundaryResult = createResearchAgendaLiveBoundary({
    searchFragment,
    queryPlan: queryPlan.value,
    fetchImpl: async (url, options) => {
      requested.push({ url, options });
      if (url.endsWith('/robots.txt')) return response(url, 'User-agent: *\nAllow: /\n');
      return response(url, `<html><body><p>${excerpt}</p></body></html>`, 'text/html; charset=utf-8');
    },
    now: (() => { let value = 1000; return () => value += 7; })()
  });
  assert.equal(boundaryResult.ok, true, boundaryResult.ok ? '' : JSON.stringify(boundaryResult.error));
  const acquired = await acquireResearchAgendaEvidence({
    config,
    queryInput,
    boundary: boundaryResult.value,
    acquisitionStartedAt: '2026-08-13T11:00:00.000Z',
    frozenAt: '2026-08-13T11:00:00.000Z',
    claimSpecs: [{ claimId: 'claim-policy-update', materiality: 'contextual', claimKind: 'contextual', normalizedClaim: 'verified public policy update' }]
  });
  assert.equal(acquired.ok, true, acquired.ok ? '' : JSON.stringify(acquired.error));
  assert.equal(acquired.value.bundle.sources.length, 1);
  assert.equal(acquired.value.bundle.sources[0].canonicalUrl, candidateUrl);
  assert.equal(acquired.value.bundle.sources[0].excerpts[0].text, excerpt);
  assert.equal(JSON.stringify(acquired.value.bundle).includes('<html>'), false, 'raw response body is discarded');
  assert.deepEqual(requested.map((entry) => entry.options.redirect), ['manual', 'manual']);
  assert.equal(requested.every((entry) => entry.options.headers['user-agent'] === 'ResearchLabEvidenceBot/1.0'), true);
});
