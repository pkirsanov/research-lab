/*
 * Feature 028 Scope 01 — real-filesystem owner-read and bundle integration.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const INTEL = require('../rlcompanyintel.js');
const CONFIG = JSON.parse(readFileSync(new URL('../company-intelligence.config.json', import.meta.url), 'utf8'));
const PUBLICATION_MODULE = new URL('../scripts/company-intelligence-publication.mjs', import.meta.url);
const SUBJECT_ID = 'company:msft';
const AS_OF = '2026-08-28T14:00:00.000Z';

function sha(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
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

function registryFor(config) {
  const ownerIds = [...new Set(config.coverageRegistry.map((row) => row.ownerToolId)
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

function sourceRows(config) {
  const ownerIds = [...new Set(config.coverageRegistry.map((row) => row.ownerToolId)
    .filter((value) => typeof value === 'string'))].sort();
  return ownerIds.map((toolId, index) => ({
    sourceId: `owner:${toolId}:${SUBJECT_ID}`,
    sourceKind: 'per-ticker-owner-read',
    ownerToolId: toolId,
    subjectId: SUBJECT_ID,
    asOf: '2026-08-28T13:30:00.000Z',
    provenanceClass: 'derived',
    maxHorizon: 'structural',
    deepLink: config.coverageRegistry.find((row) => row.ownerToolId === toolId).ownerDeepLink,
    state: 'current',
    payload: {
      toolId,
      subjectId: SUBJECT_ID,
      ticker: 'MSFT',
      state: 'current',
      asOf: '2026-08-28T13:30:00.000Z',
      provenanceClass: 'derived',
      read: `${toolId} produced a source-qualified company read.`,
      metrics: { observedValue: index + 1 },
      limitations: []
    }
  }));
}

function responseFor(request) {
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

async function buildOwnerRead() {
  const PUB = await import(PUBLICATION_MODULE.href);
  const policy = PUB.validatePublicationPolicy(CONFIG);
  assert.equal(policy.ok, true, policy.ok ? '' : JSON.stringify(policy.error));
  const registry = registryFor(CONFIG);
  const sources = sourceRows(CONFIG);
  const frozen = PUB.freezePublicationInputs({
    policy: policy.value,
    coverageRegistry: INTEL.readCoverageRegistry(CONFIG),
    registry,
    trigger: {
      contractVersion: 'company-publication-trigger/v1',
      trigger: 'scheduled',
      window: 'morning',
      generationKey: 'scheduled/2026-08-28/morning',
      requestedAt: '2026-08-28T13:59:00.000Z'
    },
    etSessionDate: '2026-08-28',
    frozenAt: AS_OF,
    evidenceCutoff: AS_OF,
    sourceRevision: 'b'.repeat(40),
    baselinePointers: { [SUBJECT_ID]: null },
    baselineVersions: { [SUBJECT_ID]: null },
    sources,
    subjectInputs: { [SUBJECT_ID]: { publishedRegimeContext: { available: false }, marketSentiment: null } }
  });
  assert.equal(frozen.ok, true, frozen.ok ? '' : JSON.stringify(frozen.error));
  const base = PUB.composeSubjectBase(frozen.value, SUBJECT_ID);
  assert.equal(base.ok, true, base.ok ? '' : JSON.stringify(base.error));
  const catalogue = PUB.buildSourceCatalogue(frozen.value, SUBJECT_ID);
  assert.equal(catalogue.ok, true, catalogue.ok ? '' : JSON.stringify(catalogue.error));
  const request = PUB.buildPlanAuthorRequest(
    frozen.value.generation,
    frozen.value.policy.coveredSubjects[0],
    base.value,
    catalogue.value,
    {
      providerId: 'copilot-cli',
      modelId: 'configured-research-model',
      promptPolicyVersion: 'company-plan-author/v1',
      schemaVersion: 'company-authored-plan/v2',
      validatorVersion: 'company-plan-validator/v1'
    }
  );
  assert.equal(request.ok, true, request.ok ? '' : JSON.stringify(request.error));
  const plan = PUB.validatePlanAuthorResponse(request.value, responseFor(request.value));
  assert.equal(plan.ok, true, plan.ok ? '' : JSON.stringify(plan.error));
  const versions = PUB.composeCoveredSubjects(frozen.value, { [SUBJECT_ID]: plan.value });
  assert.equal(versions.ok, true, versions.ok ? '' : JSON.stringify(versions.error));
  const ownerRead = PUB.buildCompanyOwnerRead(frozen.value.generation, versions.value);
  assert.equal(ownerRead.ok, true, ownerRead.ok ? '' : JSON.stringify(ownerRead.error));
  return { PUB, registry, sources, frozen: frozen.value, versions: versions.value, ownerRead: ownerRead.value };
}

test('SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome', async () => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: undefined,
    configurable: true,
    writable: true
  });
  const { buildToolBriefBundle, validateToolBriefBundle } =
    await import('../scripts/brief-distributed-publish.mjs');
  const built = await buildOwnerRead();
  const directory = mkdtempSync(path.join(tmpdir(), 'company-publication-integration-'));
  try {
    const snapshot = {
      asOf: AS_OF,
      generatedAt: AS_OF,
      window: 'morning',
      marketClosed: false,
      nextSessionDate: '2026-08-31',
      toolReads: Object.fromEntries(built.sources.map((source) => [source.ownerToolId, source.payload])),
      toolCoverage: built.registry.orderedParticipantIds.map((id) => ({
        id,
        deepLink: `${id}.html`,
        status: id === 'market-brief' ? 'browser-or-agent-read' : 'fresh-headless',
        reason: id === 'market-brief' ? 'Final aggregator.' : null
      }))
    };
    const injected = built.PUB.injectCompanyOwnerRead(snapshot, built.ownerRead, built.registry);
    assert.equal(injected.ok, true, injected.ok ? '' : JSON.stringify(injected.error));
    assert.equal(Object.prototype.hasOwnProperty.call(snapshot.toolReads, 'company-intelligence-lab'), false,
      'the pure injector does not mutate its input snapshot');

    const snapshotPath = path.join(directory, 'snapshot.json');
    const encoded = `${JSON.stringify(injected.value, null, 2)}\n`;
    writeFileSync(snapshotPath, encoded);
    const persistedBytes = readFileSync(snapshotPath);
    const persisted = JSON.parse(persistedBytes.toString('utf8'));
    const exactOwnerRead = persisted.toolReads['company-intelligence-lab'];

    assert.equal(globalThis.RLDATA.validateToolModelRead(exactOwnerRead).ok, true,
      'the exact company extension passes the production tool-model-read/v1 validator');
    assert.equal(INTEL.validateCompanyToolModelRead(
      exactOwnerRead,
      built.frozen.generation,
      built.versions
    ).ok, true);
    assert.equal(exactOwnerRead.subjects.length, 1);
    assert.equal(exactOwnerRead.subjects[0].versionId, built.versions[0].versionId);
    assert.equal(exactOwnerRead.subjects[0].contentFingerprint, built.versions[0].contentFingerprint);
    assert.match(sha(persistedBytes), /^sha256:[a-f0-9]{64}$/);

    const bundle = buildToolBriefBundle({
      snapshot: persisted,
      frozen: built.registry,
      snapshotSha: sha(persistedBytes)
    });
    assert.equal(bundle.ok, true, bundle.ok ? '' : JSON.stringify(bundle.error));
    assert.equal(validateToolBriefBundle(bundle.bundle, {
      frozen: built.registry,
      snapshotSha: sha(persistedBytes)
    }).ok, true);
    assert.equal(bundle.bundle.tools.length, built.registry.orderedSourceToolIds.length);
    assert.equal(bundle.bundle.tools.filter((entry) => entry.toolId === 'company-intelligence-lab').length, 1);
    const company = bundle.bundle.tools.find((entry) => entry.toolId === 'company-intelligence-lab');
    assert.equal(company.outcome, 'newly-authored');
    assert.notEqual(company.outcome, 'coverage-only');
    assert.equal(company.read.metrics.contentFingerprint, built.versions[0].contentFingerprint);
    assert.equal(bundle.bundle.tools.some((entry) =>
      entry.toolId === 'company-intelligence-lab' && entry.outcome === 'coverage-only'), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
