import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import '../rldata.js';
import { OWNER_EVIDENCE_DECLARATIONS, buildOwnerEvidenceRead } from '../scripts/brief-refresh.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const RLDATA = globalThis.RLDATA;

function provenance() {
  return {
    contractVersion: 'source-provenance/v1',
    sourceId: 'yahoo-chart',
    adapterId: 'yahoo-chart-session',
    adapterVersion: 'yahoo-chart-session-adapter/v1',
    sourceKind: 'best-effort-public-chart',
    sourceUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/SPY',
    requestDescriptor: {
      method: 'GET',
      path: '/v8/finance/chart/SPY',
      query: { interval: '5m', includePrePost: 'true', range: '1mo' }
    },
    sourcePublishedAt: null,
    retrievedAt: '2026-07-14T13:58:00.000Z',
    contentSha256: 'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    accessClass: 'public-best-effort',
    sourceUsePolicyId: 'source-use-policy/yahoo-normalized/v1',
    sourceUseReviewRef: 'reviews/source-use/yahoo-normalized/v1',
    retentionMode: 'normalized-facts-and-hash',
    freshnessPolicy: 'active-session-20m/v1',
    freshnessState: 'current',
    diagnostics: []
  };
}

function evidenceReference() {
  return {
    contractVersion: 'evidence-reference/v1',
    evidenceType: 'session-aggregate',
    fingerprint: 'sha256:1111111111111111111111111111111111111111111111111111111111111111',
    path: 'briefs/objects/evidence/sessions/SPY/1111111111111111111111111111111111111111111111111111111111111111.json',
    sha256: 'sha256:2222222222222222222222222222222222222222222222222222222222222222',
    state: 'partial',
    cutoffAt: '2026-07-14T14:00:00.000Z',
    provenanceRefs: ['sha256:3333333333333333333333333333333333333333333333333333333333333333']
  };
}

test('RLCONTRACTS canonicalization and semantic/occurrence fingerprints are deterministic', () => {
  const left = {
    contractVersion: 'canonical-vector/v1',
    reasonCodes: ['stale', 'missing', 'stale'],
    observedAt: '2026-07-14T09:30:00-04:00',
    signedZero: -0,
    rankedFacts: [{ rank: 2, id: 'b' }, { rank: 1, id: 'a' }],
    nested: { z: 1, a: 2 }
  };
  const right = {
    nested: { a: 2, z: 1 },
    rankedFacts: [{ rank: 2, id: 'b' }, { rank: 1, id: 'a' }],
    signedZero: 0,
    observedAt: '2026-07-14T13:30:00.000Z',
    reasonCodes: ['missing', 'stale'],
    contractVersion: 'canonical-vector/v1'
  };

  assert.equal(RLCONTRACTS.canonicalize(left, 'canonical-json/v1'), RLCONTRACTS.canonicalize(right, 'canonical-json/v1'));
  assert.equal(RLCONTRACTS.contentSha256(left, 'canonical-json/v1'), RLCONTRACTS.contentSha256(right, 'canonical-json/v1'));
  assert.equal(
    RLCONTRACTS.contentSha256(left, 'canonical-json/v1'),
    `sha256:${createHash('sha256').update(RLCONTRACTS.canonicalize(left, 'canonical-json/v1'), 'utf8').digest('hex')}`
  );
  assert.match(RLCONTRACTS.fingerprint('canonical-vector', left), /^sha256:[a-f0-9]{64}$/);
  assert.equal(RLCONTRACTS.semanticFingerprint('session-evidence', { ...left, runId: 'run-a', cutoffAt: '2026-07-14T14:00:00.000Z', retrievedAt: '2026-07-14T13:58:00.000Z' }), RLCONTRACTS.semanticFingerprint('session-evidence', { ...right, runId: 'run-b', cutoffAt: '2026-07-14T14:05:00.000Z', retrievedAt: '2026-07-14T14:03:00.000Z' }));
  assert.notEqual(RLCONTRACTS.occurrenceFingerprint('session-evidence', { ...left, runId: 'run-a' }), RLCONTRACTS.occurrenceFingerprint('session-evidence', { ...right, runId: 'run-b' }));
  assert.notEqual(
    RLCONTRACTS.canonicalize({ contractVersion: 'chronology/v1', observationRefs: ['sha256:b', 'sha256:a'] }, 'chronology/v1'),
    RLCONTRACTS.canonicalize({ contractVersion: 'chronology/v1', observationRefs: ['sha256:a', 'sha256:b'] }, 'chronology/v1')
  );
  assert.throws(() => RLCONTRACTS.canonicalize({ invalid: Number.POSITIVE_INFINITY }, 'canonical-json/v1'), (error) => error.code === 'B002-INPUT-REJECTED' && error.reason === 'non-finite-number');
  assert.throws(() => RLCONTRACTS.canonicalize({ invalid: undefined }, 'canonical-json/v1'), (error) => error.code === 'B002-INPUT-REJECTED' && error.reason === 'undefined-value');
});

test('MarketSessionEvidence v1 contracts preserve provenance identities states and ownership boundaries', () => {
  const RLSESSION = require('../rlsession.js');
  const source = provenance();
  const ref = evidenceReference();

  assert.equal(RLCONTRACTS.validateSourceProvenance(source).ok, true);
  assert.equal(RLCONTRACTS.validateEvidenceReference(ref, { evidenceRoot: 'briefs/objects/evidence' }).ok, true);
  assert.equal(RLCONTRACTS.validateSourceProvenance({ ...source, hiddenWinner: 'provider-a' }).error.reason, 'unknown-field');
  assert.equal(RLCONTRACTS.validateSourceProvenance({ ...source, sourceUrl: 'https://example.com/v8/finance/chart/SPY' }).error.reason, 'source-url-not-allowlisted');
  assert.equal(RLCONTRACTS.validateSourceProvenance({ ...source, sourceKind: 'official-report' }).error.reason, 'source-kind-mismatch');
  assert.equal(RLCONTRACTS.validateSourceProvenance({ ...source, sourcePublishedAt: '2026-07-14T13:59:00.000Z' }).error.reason, 'source-time-order-invalid');

  const secretBearingPost = {
    ...source,
    sourceId: 'bls-public-api-v2',
    adapterId: 'bls-public-api-v2-normalized',
    adapterVersion: 'bls-public-api-v2-adapter/v1',
    sourceKind: 'official-report',
    sourceUrl: 'https://api.bls.gov/publicAPI/v2/timeseries/data/',
    requestDescriptor: {
      method: 'POST',
      path: '/publicAPI/v2/timeseries/data/',
      query: {},
      body: { registrationkey: 'must-not-enter-provenance' }
    },
    sourcePublishedAt: '2026-07-14T12:30:00.000Z',
    accessClass: 'public-official',
    sourceUsePolicyId: 'source-use-policy/bls-normalized/v1',
    sourceUseReviewRef: 'reviews/source-use/bls-normalized/v1',
    freshnessPolicy: 'report-target-period/v1'
  };
  assert.equal(RLCONTRACTS.validateSourceProvenance(secretBearingPost).error.reason, 'secret-shaped-request-field');
  assert.equal(RLCONTRACTS.validateEvidenceReference({ ...ref, path: '../private.json' }, { evidenceRoot: 'briefs/objects/evidence' }).error.reason, 'evidence-path-outside-root');
  assert.equal(RLCONTRACTS.validateEvidenceReference({ ...ref, state: 'healthy' }, { evidenceRoot: 'briefs/objects/evidence' }).error.reason, 'unknown-evidence-state');
  assert.equal(RLCONTRACTS.validateEvidenceReference(ref).error.reason, 'evidence-root-required');

  const exactSessionExports = [
    'loadCalendarSession',
    'classifySessionObservation',
    'aggregateSession',
    'buildComparableVolumeBaseline',
    'normalizeReleasedReport',
    'joinEventMarketReaction',
    'buildMarketSessionEvidence',
    'validateCalendarSession',
    'validateSessionObservation',
    'validateSessionAggregate',
    'validateComparableVolumeBaseline',
    'validateReleasedReportEvidence',
    'validateEventMarketReaction',
    'validateMarketSessionEvidence'
  ];
  assert.deepEqual(Object.keys(RLSESSION).sort(), exactSessionExports.sort());
  assert.equal(Object.isFrozen(RLCONTRACTS), true);
  assert.equal(Object.isFrozen(RLSESSION), true);

  const contractsSource = readFileSync(new URL('../rlcontracts.js', import.meta.url), 'utf8');
  const sessionSource = readFileSync(new URL('../rlsession.js', import.meta.url), 'utf8');
  const browserRoot = {};
  Function('globalThis', 'window', 'module', 'exports', 'require', `${contractsSource}\nreturn globalThis.RLCONTRACTS;`)(browserRoot, undefined, undefined, undefined, undefined);
  Function('globalThis', 'window', 'module', 'exports', 'require', `${sessionSource}\nreturn globalThis.RLSESSION;`)(browserRoot, undefined, undefined, undefined, undefined);
  assert.equal(browserRoot.RLCONTRACTS.canonicalize({ b: 2, a: 1 }, 'canonical-json/v1'), '{"a":1,"b":2}');
  assert.deepEqual(Object.keys(browserRoot.RLSESSION).sort(), exactSessionExports.sort());

  assert.doesNotMatch(contractsSource, /\b(?:fetch|XMLHttpRequest|localStorage|document)\b/);
  assert.doesNotMatch(sessionSource, /\b(?:fetch|XMLHttpRequest|localStorage|document|ownerModel|recommendation)\b/);
});

function evidenceBundleFixture() {
  const hash = (seed) => `sha256:${createHash('sha256').update(seed).digest('hex')}`;
  return {
    contractVersion: 'market-session-evidence/v1',
    cutoffAt: '2026-07-14T12:40:00.000Z',
    fingerprint: hash('bundle'),
    sessionAggregateRefs: [{ evidenceType: 'session-aggregate', fingerprint: hash('aggregate-SPY') }],
    volumeBaselineRefs: [{ evidenceType: 'comparable-volume-baseline', fingerprint: hash('baseline-SPY') }],
    releasedReportRefs: [{ evidenceType: 'released-report-evidence', fingerprint: hash('cpi-report') }],
    eventReactionRefs: [{ evidenceType: 'event-market-reaction', fingerprint: hash('cpi-reaction') }]
  };
}

test('SCN-002-026: only owner adapters may publish evidence interpretations or action eligibility', () => {
  const evidence = evidenceBundleFixture();
  const bondDeclaration = OWNER_EVIDENCE_DECLARATIONS.find((declaration) => declaration.toolId === 'bond-regime-lab');

  // A production owner adapter read validates: it carries an owner-produced supporting
  // interpretation with matching adapter/model provenance and a permitted action effect.
  const ownerRead = buildOwnerEvidenceRead(bondDeclaration, evidence, { symbol: 'SPY' });
  assert.equal(RLDATA.validateToolModelRead(ownerRead).ok, true);
  assert.equal(ownerRead.evidenceInterpretations[0].kind, 'supporting');
  assert.equal(ownerRead.recommendationEligibility.eligible, true);
  assert.equal(ownerRead.evidenceInterpretations[0].ownerAdapterId, ownerRead.adapter.adapterId);

  // A brief or final author cannot forge an owner interpretation: changing the interpretation
  // provenance away from the read's own owner adapter is blocked by the provenance validator.
  const forgedProvenance = JSON.parse(JSON.stringify(ownerRead));
  forgedProvenance.evidenceInterpretations[0].ownerAdapterId = 'market-brief-final-author';
  assert.equal(RLDATA.validateToolModelRead(forgedProvenance).reason, 'evidence-interpretation-provenance-mismatch');

  // The final aggregator may hold context but can never publish an owner interpretation.
  const finalAuthor = JSON.parse(JSON.stringify(ownerRead));
  finalAuthor.role = 'final-aggregator';
  finalAuthor.profile = 'final-aggregator';
  assert.equal(RLDATA.validateToolModelRead(finalAuthor).reason, 'final-author-cannot-interpret');

  // Raw shared evidence cannot create an action: an eligible read with no owner-produced
  // supporting/contradicting interpretation is refused (shared Yahoo/BLS provenance alone
  // never inflates into a permitted owner action).
  const rawEligible = JSON.parse(JSON.stringify(ownerRead));
  rawEligible.evidenceInterpretations = [{
    kind: 'context',
    ownerAdapterId: rawEligible.adapter.adapterId,
    ownerModelVersion: rawEligible.adapter.owningModelVersion,
    evidenceRefs: [evidence.releasedReportRefs[0].fingerprint],
    actionEligibilityEffect: 'context-only',
    summary: 'context only'
  }];
  assert.equal(rawEligible.recommendationEligibility.eligible, true);
  assert.equal(RLDATA.validateToolModelRead(rawEligible).reason, 'action-eligibility-without-owner-interpretation');

  // A not-integrated source (no owner adapter) can never carry an interpretation.
  const notIntegrated = JSON.parse(JSON.stringify(ownerRead));
  notIntegrated.evidenceApplicability = { status: 'not-integrated', reason: 'no adapter yet' };
  notIntegrated.recommendationEligibility = { eligible: false, reasonCode: 'not-integrated', permittedActionFamilies: [], permittedSubjectBoundary: notIntegrated.toolId };
  assert.equal(RLDATA.validateToolModelRead(notIntegrated).reason, 'non-integrated-source-cannot-interpret');

  // A non-applicable owner interpretation is the ONLY interpretation a non-applicable read may
  // carry; an affirmative kind on a non-applicable boundary is blocked.
  const nonApplicableAffirm = JSON.parse(JSON.stringify(ownerRead));
  nonApplicableAffirm.evidenceApplicability = { status: 'not-applicable', reason: 'continuous session' };
  nonApplicableAffirm.recommendationEligibility = { eligible: false, reasonCode: 'not-applicable', permittedActionFamilies: [], permittedSubjectBoundary: nonApplicableAffirm.toolId };
  assert.equal(RLDATA.validateToolModelRead(nonApplicableAffirm).reason, 'not-applicable-source-cannot-affirm');
});

/* ---------- Scope 05: Registry-Wide Normalized Reads (validateRegistry contract) ---------- */

function loadRegistry() {
  return JSON.parse(readFileSync(new URL('../tools.json', import.meta.url), 'utf8'));
}

// The committed per-profile briefing-policy bindings (design.md Registry Entry Contract). These are
// supplied by the caller so rlcontracts.js holds no default policy VALUES; validateRegistry only
// derives structure and cross-checks each entry's policy IDs against this config.
function registryConfig() {
  return {
    profiles: {
      'live-market': { freshnessPolicy: 'daily-market-bars-v1', recommendationPolicy: 'market-action-v1', budgetPolicy: 'live-market-v1' },
      'static-model': { freshnessPolicy: 'static-model-asof-v1', recommendationPolicy: 'model-conclusion-v1', budgetPolicy: 'static-model-v1' },
      'local-model': { freshnessPolicy: 'committed-projection-v1', recommendationPolicy: 'operational-next-step-v1', budgetPolicy: 'local-model-v1' },
      'off-theme': { freshnessPolicy: 'off-theme-not-applicable-v1', recommendationPolicy: 'domain-next-step-v1', budgetPolicy: 'off-theme-v1' },
      'final-aggregator': { freshnessPolicy: 'final-aggregation-v1', recommendationPolicy: 'final-synthesis-v1', budgetPolicy: 'final-aggregator-v1' }
    }
  };
}

function addedSourceEntry() {
  return {
    id: 'demo-added-source-lab',
    title: 'Demo Added Source',
    file: 'demo-added-source-lab.html',
    briefing: {
      role: 'source',
      profile: 'live-market',
      readAdapter: 'demo-added-source-owning-model-v1',
      readContractVersion: 'tool-model-read/v1',
      freshnessPolicy: 'daily-market-bars-v1',
      recommendationPolicy: 'market-action-v1',
      budgetPolicy: 'live-market-v1'
    }
  };
}

test('SCN-002-001: registry derives 23 participants 22 sources and one non-recursive aggregator', () => {
  const registry = loadRegistry();
  const result = RLCONTRACTS.validateRegistry(registry, registryConfig());
  assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.error));
  const frozen = result.value;

  // Counts are DERIVED from the live entries, never a literal or count-minus-one: they must equal an
  // independent recomputation over the raw tools.json briefing roles (this fails loud if a literal
  // survives in validateRegistry).
  const independentSources = registry.tools.filter((entry) => entry.briefing.role === 'source').map((entry) => entry.id);
  const independentAggregators = registry.tools.filter((entry) => entry.briefing.role === 'final-aggregator').map((entry) => entry.id);
  assert.equal(frozen.contractVersion, 'frozen-briefing-registry/v1');
  assert.equal(frozen.participantCount, registry.tools.length);
  assert.equal(frozen.participantCount, 23);
  assert.equal(frozen.sourceCount, independentSources.length);
  assert.equal(frozen.sourceCount, 22);
  assert.deepEqual(frozen.orderedParticipantIds, registry.tools.map((entry) => entry.id));
  assert.deepEqual(frozen.orderedSourceToolIds, independentSources);

  // Exactly one non-recursive final aggregator, excluded from the source set.
  assert.deepEqual(independentAggregators, ['market-brief']);
  assert.equal(frozen.aggregatorToolId, 'market-brief');
  assert.equal(frozen.orderedSourceToolIds.indexOf('market-brief'), -1);

  // No parallel inventory: every read adapter is unique and the frozen contract is content-addressed.
  assert.equal(new Set(registry.tools.map((entry) => entry.briefing.readAdapter)).size, registry.tools.length);
  assert.match(frozen.registryFingerprint, /^sha256:[a-f0-9]{64}$/);
});

test('SCN-002-002: profile status applicability privacy and eligibility boundaries fail loud', () => {
  const registry = loadRegistry();
  const config = registryConfig();
  // A well-formed registry passes with the committed config bindings.
  assert.equal(RLCONTRACTS.validateRegistry(registry, config).ok, true);

  // Each targeted corruption fails loud with a closed reason before any source acquisition.
  const dropField = JSON.parse(JSON.stringify(registry));
  delete dropField.tools[1].briefing.freshnessPolicy;
  assert.equal(RLCONTRACTS.validateRegistry(dropField).error.reason, 'briefing-field-missing');

  const roleMismatch = JSON.parse(JSON.stringify(registry));
  roleMismatch.tools[1].briefing.role = 'final-aggregator';
  assert.equal(RLCONTRACTS.validateRegistry(roleMismatch).error.reason, 'briefing-role-profile-mismatch');

  const badProfile = JSON.parse(JSON.stringify(registry));
  badProfile.tools[1].briefing.profile = 'speculative';
  assert.equal(RLCONTRACTS.validateRegistry(badProfile).error.reason, 'briefing-profile-invalid');

  const duplicateAdapter = JSON.parse(JSON.stringify(registry));
  duplicateAdapter.tools[2].briefing.readAdapter = registry.tools[1].briefing.readAdapter;
  assert.equal(RLCONTRACTS.validateRegistry(duplicateAdapter).error.reason, 'briefing-duplicate-adapter');

  const secondAggregator = JSON.parse(JSON.stringify(registry));
  secondAggregator.tools[1].briefing.role = 'final-aggregator';
  secondAggregator.tools[1].briefing.profile = 'final-aggregator';
  assert.equal(RLCONTRACTS.validateRegistry(secondAggregator).error.reason, 'registry-multiple-aggregators');

  // A profile that resolves to the wrong committed policy binding fails loud against config.
  const policyMismatch = JSON.parse(JSON.stringify(registry));
  policyMismatch.tools[1].briefing.freshnessPolicy = 'off-theme-not-applicable-v1';
  assert.equal(RLCONTRACTS.validateRegistry(policyMismatch, config).error.reason, 'briefing-policy-mismatch');

  // Read-level boundaries also fail loud: shared evidence alone never inflates into an owner action.
  const evidence = evidenceBundleFixture();
  const bond = OWNER_EVIDENCE_DECLARATIONS.find((declaration) => declaration.toolId === 'bond-regime-lab');
  const rawEligible = JSON.parse(JSON.stringify(buildOwnerEvidenceRead(bond, evidence, { symbol: 'SPY' })));
  rawEligible.evidenceInterpretations = [{
    kind: 'context',
    ownerAdapterId: rawEligible.adapter.adapterId,
    ownerModelVersion: rawEligible.adapter.owningModelVersion,
    evidenceRefs: [evidence.releasedReportRefs[0].fingerprint],
    actionEligibilityEffect: 'context-only',
    summary: 'context only'
  }];
  assert.equal(rawEligible.recommendationEligibility.eligible, true);
  assert.equal(RLDATA.validateToolModelRead(rawEligible).reason, 'action-eligibility-without-owner-interpretation');
});

test('SCN-002-003: added-source mutation derives 24 participants and 23 sources generically', () => {
  const registry = loadRegistry();
  const baseline = RLCONTRACTS.validateRegistry(registry, registryConfig());
  assert.equal(baseline.value.participantCount, 23);
  assert.equal(baseline.value.sourceCount, 22);

  // A registry mutation adds ONE valid new source with a complete briefing block. The next frozen
  // registry derives 24/23 through the SAME loops — no literal-count rule and no parallel inventory
  // (a literal source count survives here as a red-stage failure).
  const mutated = JSON.parse(JSON.stringify(registry));
  mutated.tools.push(addedSourceEntry());
  const result = RLCONTRACTS.validateRegistry(mutated, registryConfig());
  assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.error));
  assert.equal(result.value.participantCount, 24);
  assert.equal(result.value.sourceCount, 23);
  assert.equal(result.value.orderedParticipantIds.length, 24);
  assert.equal(result.value.orderedSourceToolIds.length, 23);
  assert.equal(result.value.orderedSourceToolIds[result.value.orderedSourceToolIds.length - 1], 'demo-added-source-lab');
  assert.equal(result.value.aggregatorToolId, 'market-brief');

  // Incomplete metadata on the added source fails BEFORE acquisition or authorship.
  const incomplete = JSON.parse(JSON.stringify(registry));
  const brokenEntry = addedSourceEntry();
  delete brokenEntry.briefing.readAdapter;
  incomplete.tools.push(brokenEntry);
  assert.equal(RLCONTRACTS.validateRegistry(incomplete, registryConfig()).error.reason, 'briefing-field-missing');
});
