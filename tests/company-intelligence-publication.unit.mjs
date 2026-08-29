/*
 * Feature 028 Scope 01 — pure company publication foundation.
 *
 * Every test calls the production UMD composer and Node publication module. Inputs are
 * deterministic contract documents; assertions target normalized, composed, enriched, or
 * refused outputs rather than values copied unchanged from setup.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const INTEL = require('../rlcompanyintel.js');
const RLCONTRACTS = require('../rlcontracts.js');
const CONFIG = JSON.parse(readFileSync(new URL('../company-intelligence.config.json', import.meta.url), 'utf8'));
const PUBLICATION_MODULE = new URL('../scripts/company-intelligence-publication.mjs', import.meta.url);

const REQUESTED_AT = '2026-08-28T13:59:00.000Z';
const FROZEN_AT = '2026-08-28T14:00:00.000Z';
const CUTOFF = '2026-08-28T14:00:00.000Z';
const SOURCE_AS_OF = '2026-08-28T13:30:00.000Z';
const SOURCE_REVISION = 'a'.repeat(40);
const SUBJECT_ID = 'company:msft';

async function publication() {
  return import(PUBLICATION_MODULE.href);
}

function briefing(profile, role, adapter) {
  return {
    role,
    profile,
    readAdapter: adapter,
    readContractVersion: 'tool-model-read/v1',
    freshnessPolicy: `${profile}-freshness/v1`,
    recommendationPolicy: `${profile}-recommendation/v1`,
    budgetPolicy: `${profile}-budget/v1`
  };
}

function frozenRegistry(config) {
  const ownerIds = [...new Set(config.coverageRegistry
    .map((row) => row.ownerToolId)
    .filter((value) => typeof value === 'string'))].sort();
  const tools = [
    { id: 'market-brief', briefing: briefing('final-aggregator', 'final-aggregator', 'market-brief-final-v1') },
    ...ownerIds.map((id) => ({ id, briefing: briefing('live-market', 'source', `${id}-owner-v1`) })),
    { id: 'company-intelligence-lab', briefing: briefing('live-market', 'source', 'company-intelligence-owner-v1') }
  ];
  const result = RLCONTRACTS.validateRegistry({ tools }, null);
  assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.error));
  return result.value;
}

function ownerSources(config, mutate) {
  const byOwner = new Map();
  config.coverageRegistry.forEach((row) => {
    if (typeof row.ownerToolId !== 'string') return;
    const list = byOwner.get(row.ownerToolId) || [];
    list.push(row);
    byOwner.set(row.ownerToolId, list);
  });
  let sources = [...byOwner.entries()].sort(([left], [right]) => left.localeCompare(right))
    .map(([toolId, rows], index) => ({
      sourceId: `owner:${toolId}:${SUBJECT_ID}`,
      sourceKind: 'per-ticker-owner-read',
      ownerToolId: toolId,
      subjectId: SUBJECT_ID,
      asOf: SOURCE_AS_OF,
      provenanceClass: 'derived',
      maxHorizon: 'structural',
      deepLink: rows[0].ownerDeepLink,
      state: 'current',
      payload: {
        toolId,
        subjectId: SUBJECT_ID,
        ticker: 'MSFT',
        state: 'current',
        asOf: SOURCE_AS_OF,
        provenanceClass: 'derived',
        read: `${toolId} produced a source-qualified company read.`,
        metrics: Object.fromEntries(rows.map((row, rowIndex) => [
          `${row.dimensionId}ObservedValue`,
          index * 10 + rowIndex + 1
        ])),
        deepLink: rows[0].ownerDeepLink,
        limitations: []
      }
    }));
  if (typeof mutate === 'function') sources = mutate(sources);
  return sources;
}

function committedEvents() {
  return {
    contractVersion: 'company-event-file/v1',
    subjectId: SUBJECT_ID,
    sourceId: 'sec-edgar-submissions',
    sourceName: 'SEC EDGAR company submissions',
    events: [{
      eventId: 'msft-results-2026-07-29',
      eventType: 'quarterly-results',
      eventClass: 'financial',
      date: '2026-07-29',
      dateClass: 'scheduled',
      effectHorizonId: 'event',
      observedOutcome: 'Results of operations were reported in a public filing.',
      sourceName: 'SEC EDGAR 8-K Item 2.02',
      sourceUrl: 'https://www.sec.gov/Archives/edgar/data/789019/report-index.htm',
      asOf: '2026-08-28'
    }]
  };
}

function freezeInputs(PUB, sourceMutator) {
  const policy = PUB.validatePublicationPolicy(CONFIG);
  assert.equal(policy.ok, true, policy.ok ? '' : JSON.stringify(policy.error));
  return PUB.freezePublicationInputs({
    policy: policy.value,
    coverageRegistry: INTEL.readCoverageRegistry(CONFIG),
    registry: frozenRegistry(CONFIG),
    trigger: {
      contractVersion: 'company-publication-trigger/v1',
      trigger: 'scheduled',
      window: 'morning',
      generationKey: 'scheduled/2026-08-28/morning',
      requestedAt: REQUESTED_AT
    },
    etSessionDate: '2026-08-28',
    frozenAt: FROZEN_AT,
    evidenceCutoff: CUTOFF,
    sourceRevision: SOURCE_REVISION,
    baselinePointers: { [SUBJECT_ID]: null },
    baselineVersions: { [SUBJECT_ID]: null },
    sources: ownerSources(CONFIG, sourceMutator),
    subjectInputs: {
      [SUBJECT_ID]: {
        committedEvents: committedEvents(),
        publishedRegimeContext: { available: false },
        marketSentiment: null
      }
    }
  });
}

function authorIdentity() {
  return {
    providerId: 'copilot-cli',
    modelId: 'configured-research-model',
    promptPolicyVersion: 'company-plan-author/v1',
    schemaVersion: 'company-authored-plan/v2',
    validatorVersion: 'company-plan-validator/v1'
  };
}

function requestFor(PUB, frozen) {
  const subject = frozen.policy.coveredSubjects[0];
  const base = PUB.composeSubjectBase(frozen, subject.subjectId);
  assert.equal(base.ok, true, base.ok ? '' : JSON.stringify(base.error));
  const catalogue = PUB.buildSourceCatalogue(frozen, subject.subjectId);
  assert.equal(catalogue.ok, true, catalogue.ok ? '' : JSON.stringify(catalogue.error));
  const request = PUB.buildPlanAuthorRequest(
    frozen.generation,
    subject,
    base.value,
    catalogue.value,
    authorIdentity()
  );
  assert.equal(request.ok, true, request.ok ? '' : JSON.stringify(request.error));
  return request.value;
}

function branchFor(request, index = 0) {
  const horizon = request.horizons[index % request.horizons.length];
  const source = request.sourceCatalogue[index % request.sourceCatalogue.length];
  return {
    question: `Which source-qualified fact changes ${horizon.horizonId} evidence?`,
    relevance: {
      horizonId: horizon.horizonId,
      targetIds: [horizon.targetIds[0]]
    },
    consultedSourceIds: [source.sourceId],
    result: 'The consulted source confirms the existing bounded horizon reading.',
    disposition: 'confirmed',
    changedTargets: [],
    refusalReason: null,
    stopCondition: 'Stop after the named source answers the declared question.',
    stoppedBy: 'question-answered'
  };
}

function responseFor(request, branches = []) {
  return {
    contractVersion: 'company-plan-author-response/v1',
    requestFingerprint: request.requestFingerprint,
    plan: {
      contractVersion: 'company-authored-plan/v2',
      subjectId: request.subjectId,
      generationId: request.generationId,
      emptyReason: branches.length === 0 ? 'floor-was-sufficient' : null,
      branches
    }
  };
}

function validatedPlan(PUB, frozen, branches = []) {
  const request = requestFor(PUB, frozen);
  const result = PUB.validatePlanAuthorResponse(request, responseFor(request, branches));
  assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.error));
  return result.value;
}

function assertFourIsolatedHorizons(version) {
  assert.equal(version.horizons.length, 4);
  assert.deepEqual(version.horizons.map((horizon) => horizon.horizonId).sort(),
    ['event', 'immediate', 'structural', 'swing']);
  assert.equal(Object.prototype.hasOwnProperty.call(version, 'combinedDirection'), false);
  version.horizons.forEach((horizon) => {
    assert.match(horizon.inputFingerprint, /^sha256:[a-f0-9]{64}$/);
    assert.ok(!Object.prototype.hasOwnProperty.call(horizon, 'combinedDirection'));
  });
}

test('SCN-028-006 headless composition preserves fifteen states and four isolated horizons', async () => {
  const PUB = await publication();
  const frozenResult = freezeInputs(PUB);
  assert.equal(frozenResult.ok, true, frozenResult.ok ? '' : JSON.stringify(frozenResult.error));
  const frozen = frozenResult.value;
  const plan = validatedPlan(PUB, frozen);
  const composed = PUB.composeCoveredSubjects(frozen, { [SUBJECT_ID]: plan });

  assert.equal(composed.ok, true, composed.ok ? '' : JSON.stringify(composed.error));
  assert.equal(composed.value.length, 1);
  const version = composed.value[0];
  assert.equal(version.contractVersion, 'company-read-version/v2');
  assert.equal(version.dimensionReads.length, 15);
  assert.equal(new Set(version.dimensionReads.map((read) => read.dimensionId)).size, 15);
  version.dimensionReads.forEach((read) => {
    assert.ok(['current', 'partial', 'stale', 'conflicted', 'unavailable'].includes(read.state));
    if (read.state !== 'current') assert.equal(typeof read.reasonCode, 'string');
  });
  assertFourIsolatedHorizons(version);
  assert.equal(INTEL.validateReadVersionV2(version, frozen.generation, frozen.policy).ok, true);
});

test('Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims', async () => {
  const PUB = await publication();
  const frozenResult = freezeInputs(PUB, (sources) => {
    const removed = sources.slice(1);
    removed[0] = {
      ...removed[0],
      state: 'stale',
      payload: { ...removed[0].payload, state: 'stale', gapReason: 'The owner read exceeded its declared freshness window.' }
    };
    return removed;
  });
  assert.equal(frozenResult.ok, true, frozenResult.ok ? '' : JSON.stringify(frozenResult.error));
  const frozen = frozenResult.value;
  const composed = PUB.composeCoveredSubjects(frozen, { [SUBJECT_ID]: validatedPlan(PUB, frozen) });

  assert.equal(composed.ok, true, composed.ok ? '' : JSON.stringify(composed.error));
  const version = composed.value[0];
  const missingOrStale = version.dimensionReads.filter((read) => read.state === 'unavailable' || read.state === 'stale');
  assert.ok(missingOrStale.length > 0);
  assert.ok(missingOrStale.some((read) => read.reasonCode === 'no-shared-read'));
  assert.ok(missingOrStale.some((read) => read.state === 'stale' && read.reasonCode === 'read-aged-past-window'));
  missingOrStale.forEach((read) => {
    assert.equal(typeof read.reasonCode, 'string');
    assert.ok(read.limitations.length > 0);
    assert.equal(read.directionalSignal, null);
    if (read.state === 'unavailable') assert.deepEqual(read.values, []);
  });
  const affected = new Set(missingOrStale.map((read) => read.dimensionId));
  assert.ok(version.horizons.some((horizon) =>
    horizon.unavailableDimensionIds.some((dimensionId) => affected.has(dimensionId)) &&
    horizon.gapEffect.includes('did not reach this read')));
});

test('Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon', async () => {
  const PUB = await publication();
  const lateSourceId = ownerSources(CONFIG)[0].sourceId;
  const frozen = freezeInputs(PUB, (sources) => sources.map((source, index) => index === 0 ? {
    ...source,
    asOf: '2026-08-28T14:00:00.001Z',
    payload: { ...source.payload, asOf: '2026-08-28T14:00:00.001Z' }
  } : source));

  assert.equal(frozen.ok, false);
  assert.equal(frozen.error.code, 'C028-EVIDENCE-CUTOFF');
  assert.equal(frozen.error.field, `sources.${lateSourceId}.asOf`);
  assert.ok(frozen.error.reason.includes(lateSourceId));
  assert.ok(frozen.error.reason.includes(CUTOFF));
  assert.equal(Object.prototype.hasOwnProperty.call(frozen, 'value'), false,
    'a refused late input produces no candidate or horizon collection');

  const intact = freezeInputs(PUB);
  assert.equal(intact.ok, true, intact.ok ? '' : JSON.stringify(intact.error));
  const drifted = structuredClone(intact.value);
  drifted.sources[0].payload.metrics.postFreezeValue = 99;
  const driftResult = PUB.buildSourceCatalogue(drifted, SUBJECT_ID);
  assert.equal(driftResult.ok, false);
  assert.equal(driftResult.error.code, 'C028-FROZEN-INPUT-DRIFT');
  assert.equal(Object.prototype.hasOwnProperty.call(driftResult, 'value'), false);
});

test('SCN-028-009 signed bounded plan is enriched from the frozen source catalogue', async () => {
  const PUB = await publication();
  const frozenResult = freezeInputs(PUB);
  assert.equal(frozenResult.ok, true, frozenResult.ok ? '' : JSON.stringify(frozenResult.error));
  const frozen = frozenResult.value;
  const request = requestFor(PUB, frozen);
  const branch = branchFor(request);
  const validated = PUB.validatePlanAuthorResponse(request, responseFor(request, [branch]));

  assert.equal(validated.ok, true, validated.ok ? '' : JSON.stringify(validated.error));
  const plan = validated.value;
  assert.equal(plan.contractVersion, 'company-research-plan/v2');
  assert.equal(plan.subjectId, SUBJECT_ID);
  assert.equal(plan.generationId, frozen.generation.generationId);
  assert.deepEqual(plan.authoredBy, authorIdentity());
  assert.equal(plan.authoredAt, frozen.generation.frozenAt);
  assert.equal(plan.maxBranches, 5);
  assert.equal(plan.budgetRemaining, 4);
  assert.match(plan.requestFingerprint, /^sha256:[a-f0-9]{64}$/);
  assert.match(plan.responseFingerprint, /^sha256:[a-f0-9]{64}$/);
  assert.equal(plan.branches.length, 1);
  const enriched = plan.branches[0];
  ['question', 'relevance', 'consulted', 'result', 'disposition', 'stopCondition'].forEach((field) => {
    assert.ok(Object.prototype.hasOwnProperty.call(enriched, field), field);
  });
  assert.equal(enriched.consulted.length, 1);
  assert.equal(enriched.consulted[0].sourceId, branch.consultedSourceIds[0]);
  assert.match(enriched.consulted[0].fingerprint, /^sha256:[a-f0-9]{64}$/);
  assert.ok(Date.parse(enriched.consulted[0].asOf) <= Date.parse(CUTOFF));

  const composed = PUB.composeCoveredSubjects(frozen, { [SUBJECT_ID]: plan });
  assert.equal(composed.ok, true, composed.ok ? '' : JSON.stringify(composed.error));
  assert.deepEqual(composed.value[0].researchPlan, plan);
});

test('Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed', async () => {
  const PUB = await publication();
  const frozenResult = freezeInputs(PUB);
  assert.equal(frozenResult.ok, true, frozenResult.ok ? '' : JSON.stringify(frozenResult.error));
  const frozen = frozenResult.value;
  const request = requestFor(PUB, frozen);
  const good = responseFor(request, [branchFor(request)]);

  const malformed = structuredClone(good);
  delete malformed.plan.branches[0].stopCondition;
  const malformedResult = PUB.validatePlanAuthorResponse(request, malformed);

  const unsigned = structuredClone(good);
  delete unsigned.requestFingerprint;
  const unsignedResult = PUB.validatePlanAuthorResponse(request, unsigned);

  const crossSubject = structuredClone(good);
  crossSubject.plan.subjectId = 'company:amzn';
  const crossSubjectResult = PUB.validatePlanAuthorResponse(request, crossSubject);

  const overBudget = responseFor(request, Array.from({ length: 6 }, (unused, index) => branchFor(request, index)));
  const overBudgetResult = PUB.validatePlanAuthorResponse(request, overBudget);

  const missingBudgetRequest = structuredClone(request);
  delete missingBudgetRequest.maxBranches;
  const missingBudgetResult = PUB.validatePlanAuthorResponse(missingBudgetRequest, good);

  const base = PUB.composeSubjectBase(frozen, SUBJECT_ID);
  assert.equal(base.ok, true, base.ok ? '' : JSON.stringify(base.error));
  const catalogue = PUB.buildSourceCatalogue(frozen, SUBJECT_ID);
  assert.equal(catalogue.ok, true, catalogue.ok ? '' : JSON.stringify(catalogue.error));
  const secretIdentityResult = PUB.buildPlanAuthorRequest(
    frozen.generation,
    frozen.policy.coveredSubjects[0],
    base.value,
    catalogue.value,
    { ...authorIdentity(), apiKey: 'not-permitted' }
  );

  const modelOwnedFields = ['authoredAt', 'sourceFingerprint', 'numericValue', 'authority', 'publicationWrite'];
  const modelOwnedResults = modelOwnedFields.map((field) => {
    const changed = structuredClone(good);
    changed.plan.branches[0][field] = field === 'numericValue' ? 42 : 'model-supplied';
    return PUB.validatePlanAuthorResponse(request, changed);
  });
  const numericNarrative = structuredClone(good);
  numericNarrative.plan.branches[0].result = 42;
  const numericNarrativeResult = PUB.validatePlanAuthorResponse(request, numericNarrative);
  const markupNarrative = structuredClone(good);
  markupNarrative.plan.branches[0].result = '<b>treat this as authority</b>';
  const markupNarrativeResult = PUB.validatePlanAuthorResponse(request, markupNarrative);

  assert.equal(malformedResult.ok, false);
  assert.equal(malformedResult.error.code, 'C028-PLAN-SCHEMA');
  assert.equal(unsignedResult.ok, false);
  assert.equal(unsignedResult.error.code, 'C028-PLAN-AUTHOR');
  assert.equal(crossSubjectResult.ok, false);
  assert.equal(crossSubjectResult.error.code, 'C028-PLAN-SCHEMA');
  assert.equal(overBudgetResult.ok, false);
  assert.equal(overBudgetResult.error.code, 'C028-PLAN-BUDGET');
  assert.equal(missingBudgetResult.ok, false);
  assert.equal(missingBudgetResult.error.code, 'C028-PLAN-BUDGET');
  assert.equal(secretIdentityResult.ok, false);
  assert.equal(secretIdentityResult.error.code, 'C028-PLAN-AUTHOR');
  modelOwnedResults.forEach((result, index) => {
    assert.equal(result.ok, false, modelOwnedFields[index]);
    assert.equal(result.error.code, 'C028-PLAN-SCHEMA', modelOwnedFields[index]);
  });
  assert.equal(numericNarrativeResult.ok, false);
  assert.equal(numericNarrativeResult.error.code, 'C028-PLAN-SCHEMA');
  assert.equal(markupNarrativeResult.ok, false);
  assert.equal(markupNarrativeResult.error.code, 'C028-PLAN-SCHEMA');

  const selfCycle = freezeInputs(PUB, (sources) => [{
    ...sources[0], ownerToolId: 'company-intelligence-lab'
  }, ...sources.slice(1)]);
  const finalCycle = freezeInputs(PUB, (sources) => [{
    ...sources[0], ownerToolId: 'market-brief'
  }, ...sources.slice(1)]);
  assert.equal(selfCycle.ok, false);
  assert.equal(selfCycle.error.code, 'C028-SOURCE-CYCLE');
  assert.equal(finalCycle.ok, false);
  assert.equal(finalCycle.error.code, 'C028-SOURCE-CYCLE');

  const mismatchedOwner = freezeInputs(PUB, (sources) => [{
    ...sources[0], payload: { ...sources[0].payload, toolId: 'another-owner' }
  }, ...sources.slice(1)]);
  assert.equal(mismatchedOwner.ok, true, mismatchedOwner.ok ? '' : JSON.stringify(mismatchedOwner.error));
  const mismatchedBase = PUB.composeSubjectBase(mismatchedOwner.value, SUBJECT_ID);
  assert.equal(mismatchedBase.ok, false);
  assert.equal(mismatchedBase.error.code, 'C028-COMPANY-CANDIDATE');

  const signed = PUB.validatePlanAuthorResponse(request, good);
  assert.equal(signed.ok, true, signed.ok ? '' : JSON.stringify(signed.error));
  const latePlan = structuredClone(signed.value);
  latePlan.branches[0].consulted[0].asOf = '2026-08-28T14:00:00.001Z';
  const lateResult = INTEL.validateResearchPlanV2(latePlan, frozen.generation, request.sourceCatalogue);
  assert.equal(lateResult.ok, false);
  assert.equal(lateResult.error.code, 'C028-PLAN-SCHEMA');
  assert.ok(lateResult.error.reason.includes('cutoff'));

  [malformedResult, unsignedResult, crossSubjectResult, overBudgetResult, missingBudgetResult,
    secretIdentityResult, numericNarrativeResult, markupNarrativeResult, lateResult, mismatchedBase,
    selfCycle, finalCycle, ...modelOwnedResults]
    .forEach((result) => assert.equal(Object.prototype.hasOwnProperty.call(result, 'value'), false));
  assert.equal(frozen.baselinePointers[SUBJECT_ID], null,
    'plan refusals do not relabel or advance any prior company authority');
});

test('Privacy mutation: company owner reads reject private fields and action authority', async () => {
  const PUB = await publication();
  const frozenResult = freezeInputs(PUB);
  assert.equal(frozenResult.ok, true, frozenResult.ok ? '' : JSON.stringify(frozenResult.error));
  const frozen = frozenResult.value;
  const versions = PUB.composeCoveredSubjects(frozen, {
    [SUBJECT_ID]: validatedPlan(PUB, frozen)
  });
  assert.equal(versions.ok, true, versions.ok ? '' : JSON.stringify(versions.error));
  const ownerRead = PUB.buildCompanyOwnerRead(frozen.generation, versions.value);
  assert.equal(ownerRead.ok, true, ownerRead.ok ? '' : JSON.stringify(ownerRead.error));

  const privateOwnerRead = structuredClone(ownerRead.value);
  privateOwnerRead.subjects[0].positionSize = 1;
  const privateOwnerResult = INTEL.validateCompanyToolModelRead(
    privateOwnerRead,
    frozen.generation,
    versions.value
  );
  assert.equal(privateOwnerResult.ok, false);
  assert.equal(privateOwnerResult.error.code, 'C028-PRIVACY');
  assert.equal(privateOwnerResult.error.field, 'subjects.0.positionSize');

  const authoritativeOwnerRead = structuredClone(ownerRead.value);
  authoritativeOwnerRead.recommendationEligibility.eligible = true;
  const authorityResult = INTEL.validateCompanyToolModelRead(
    authoritativeOwnerRead,
    frozen.generation,
    versions.value
  );
  assert.equal(authorityResult.ok, false);
  assert.equal(authorityResult.error.code, 'C028-OWNER-READ');
});
