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
import { validateBundle } from '../scripts/web-evidence-acquire.mjs';
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
