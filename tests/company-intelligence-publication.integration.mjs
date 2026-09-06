/*
 * Feature 028 Scope 01 — real-filesystem owner-read and bundle integration.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
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

Object.defineProperty(globalThis, 'localStorage', {
  value: undefined,
  configurable: true,
  writable: true
});

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

function registryDocumentFor(config) {
  const ownerIds = [...new Set(config.coverageRegistry.map((row) => row.ownerToolId)
    .filter((value) => typeof value === 'string'))].sort();
  return {
    tools: [
      { id: 'market-brief', briefing: briefing('final-aggregator', 'final-aggregator', 'market-brief-final-v1') },
      ...ownerIds.map((id) => ({ id, briefing: briefing('live-market', 'source', `${id}-owner-v1`) })),
      { id: 'company-intelligence-lab', briefing: briefing('live-market', 'source', 'company-intelligence-owner-v1') }
    ]
  };
}

function registryFor(config) {
  const result = RLCONTRACTS.validateRegistry(registryDocumentFor(config), null);
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

async function buildOwnerRead(options = {}) {
  const PUB = await import(PUBLICATION_MODULE.href);
  const policy = PUB.validatePublicationPolicy(CONFIG);
  assert.equal(policy.ok, true, policy.ok ? '' : JSON.stringify(policy.error));
  const registry = registryFor(CONFIG);
  const sources = sourceRows(CONFIG);
  const window = options.window || 'morning';
  const frozenAt = options.frozenAt || AS_OF;
  const etSessionDate = options.etSessionDate || '2026-08-28';
  const generationKey = options.generationKey || `scheduled/${etSessionDate}/${window}`;
  const requestedAt = options.requestedAt || new Date(Date.parse(frozenAt) - 60_000).toISOString();
  const baselinePointer = Object.prototype.hasOwnProperty.call(options, 'baselinePointer')
    ? options.baselinePointer
    : null;
  const baselineVersion = Object.prototype.hasOwnProperty.call(options, 'baselineVersion')
    ? options.baselineVersion
    : null;
  const frozen = PUB.freezePublicationInputs({
    policy: policy.value,
    coverageRegistry: INTEL.readCoverageRegistry(CONFIG),
    registry,
    trigger: {
      contractVersion: 'company-publication-trigger/v1',
      trigger: 'scheduled',
      window,
      generationKey,
      requestedAt
    },
    etSessionDate,
    frozenAt,
    evidenceCutoff: frozenAt,
    sourceRevision: 'b'.repeat(40),
    baselinePointers: { [SUBJECT_ID]: baselinePointer },
    baselineVersions: { [SUBJECT_ID]: baselineVersion },
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
  return {
    PUB,
    registry,
    registryDocument: registryDocumentFor(CONFIG),
    sources,
    frozen: frozen.value,
    versions: versions.value,
    ownerRead: ownerRead.value
  };
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(stableValue(value));
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${stableJson(value)}\n`);
}

function runGit(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
    killSignal: 'SIGKILL',
    env: {
      ...process.env,
      PATH: '/opt/local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
    }
  });
  assert.equal(result.error, undefined,
    `git ${args.join(' ')} failed to execute: ${result.error?.message}`);
  assert.equal(result.status, 0,
    `git ${args.join(' ')} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  return result.stdout.trim();
}

function initializeRestorationPair(sandbox) {
  const seed = path.join(sandbox, 'seed');
  const remote = path.join(sandbox, 'remote.git');
  const candidateRoot = path.join(sandbox, 'candidate');
  const publicationRoot = path.join(sandbox, 'publication');
  const authority = {
    'data/company-intelligence/company-msft/current.json': '{"generationId":"prior-generation","versionId":"prior-version"}\n',
    'data/company-intelligence/publication-current.json': '{"generationId":"prior-generation","briefRunId":"prior-brief"}\n',
    'data/company-intelligence/company-msft/versions/prior-version.json': '{"versionId":"prior-version","state":"acknowledged"}\n',
    'briefs/current.json': '{"runId":"prior-brief","generation":7}\n',
    'briefs/history-current.json': '{"runId":"prior-brief","generation":7}\n',
    'briefs/objects/final/prior.json': '{"runId":"prior-brief","state":"acknowledged"}\n'
  };
  mkdirSync(seed, { recursive: true });
  for (const [relativePath, bytes] of Object.entries(authority)) {
    const absolutePath = path.join(seed, relativePath);
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, bytes);
  }
  runGit(seed, ['init', '--initial-branch=main']);
  runGit(seed, ['config', 'user.email', 'scope03@example.invalid']);
  runGit(seed, ['config', 'user.name', 'Scope 03 Integration']);
  runGit(seed, ['add', '--', '.']);
  runGit(seed, ['commit', '-m', 'prior acknowledged company and brief pair']);
  runGit(sandbox, ['init', '--bare', '--initial-branch=main', remote]);
  runGit(seed, ['remote', 'add', 'origin', remote]);
  runGit(seed, ['push', '-u', 'origin', 'main']);
  runGit(sandbox, ['clone', '--quiet', '--branch', 'main', remote, candidateRoot]);
  runGit(sandbox, ['clone', '--quiet', '--branch', 'main', remote, publicationRoot]);
  runGit(candidateRoot, ['config', 'user.email', 'scope03@example.invalid']);
  runGit(candidateRoot, ['config', 'user.name', 'Scope 03 Candidate']);
  runGit(publicationRoot, ['config', 'user.email', 'scope03@example.invalid']);
  runGit(publicationRoot, ['config', 'user.name', 'Scope 03 Publication']);
  const baseline = {
    baseCommit: runGit(candidateRoot, ['rev-parse', 'HEAD']),
    candidateIndex: runGit(candidateRoot, ['write-tree']),
    publicationIndex: runGit(publicationRoot, ['write-tree']),
    remoteHead: runGit(seed, ['ls-remote', '--heads', 'origin', 'refs/heads/main']).split(/\s+/)[0],
    authority: Object.fromEntries(Object.keys(authority).map((relativePath) => [
      relativePath,
      readFileSync(path.join(candidateRoot, relativePath))
    ]))
  };
  return { authority, baseline, candidateRoot, publicationRoot, remote };
}

function assertRestoredPair(fixture) {
  for (const root of [fixture.candidateRoot, fixture.publicationRoot]) {
    assert.equal(runGit(root, ['rev-parse', 'HEAD']), fixture.baseline.baseCommit);
    assert.equal(runGit(root, ['status', '--porcelain=v1', '--untracked-files=all']), '');
    for (const [relativePath, bytes] of Object.entries(fixture.baseline.authority)) {
      assert.deepEqual(readFileSync(path.join(root, relativePath)), bytes,
        `${path.basename(root)} restores ${relativePath} byte-for-byte`);
    }
  }
  assert.equal(runGit(fixture.candidateRoot, ['write-tree']), fixture.baseline.candidateIndex);
  assert.equal(runGit(fixture.publicationRoot, ['write-tree']), fixture.baseline.publicationIndex);
  assert.equal(
    runGit(fixture.candidateRoot, ['ls-remote', '--heads', 'origin', 'refs/heads/main']).split(/\s+/)[0],
    fixture.baseline.remoteHead
  );
}

function copyTreeWithoutGit(source, destination) {
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, {
    recursive: true,
    filter(candidate) {
      return path.basename(candidate) !== '.git';
    }
  });
}

function baselineFor(root) {
  const pointerPath = path.join(root, 'data/company-intelligence/company-msft/current.json');
  if (!existsSync(pointerPath)) return { pointer: null, version: null };
  const pointer = JSON.parse(readFileSync(pointerPath, 'utf8'));
  const versionPath = INTEL.versionPathsFor(SUBJECT_ID, pointer.versionId).version;
  return {
    pointer,
    version: JSON.parse(readFileSync(path.join(root, versionPath), 'utf8'))
  };
}

function makeBriefRun(built, prior) {
  const companyReadBytes = Buffer.from(stableJson(built.ownerRead), 'utf8');
  const companyReadRef = sha(companyReadBytes);
  const bundleFingerprint = sha(Buffer.from(stableJson({
    generationId: built.frozen.generation.generationId,
    ownerReadFingerprint: built.ownerRead.fingerprint,
    orderedSourceToolIds: built.registry.orderedSourceToolIds
  }), 'utf8'));
  const runFingerprint = sha(Buffer.from(stableJson({
    generationId: built.frozen.generation.generationId,
    bundleFingerprint
  }), 'utf8'));
  const runId = `scope02-${built.frozen.generation.window}-${runFingerprint.slice(7, 19)}`;
  const tools = built.registry.orderedSourceToolIds.map((toolId) => ({
    toolId,
    outcome: 'newly-authored',
    read: toolId === 'company-intelligence-lab'
      ? built.ownerRead
      : {
          contractVersion: 'scope02-source-read/v1',
          toolId,
          generationId: built.frozen.generation.generationId,
          read: `${toolId} frozen source read`
        },
    brief: null
  }));
  return {
    runId,
    runFingerprint,
    etRunDate: built.frozen.generation.etSessionDate,
    window: built.frozen.generation.window,
    registry: {
      fingerprint: built.registry.registryFingerprint,
      orderedSourceToolIds: built.registry.orderedSourceToolIds.slice(),
      orderedParticipantIds: built.registry.orderedParticipantIds.slice()
    },
    evidence: {
      state: 'available',
      cutoffAt: built.frozen.generation.evidenceCutoff,
      body: {
        contractVersion: 'scope02-evidence/v1',
        generationId: built.frozen.generation.generationId
      }
    },
    tools,
    final: {
      body: {
        contractVersion: 'final-brief/v1',
        runId,
        toolBriefBundleRef: { fingerprint: bundleFingerprint, sourceCount: tools.length },
        companyPublication: {
          generationId: built.frozen.generation.generationId,
          ownerReadFingerprint: built.ownerRead.fingerprint,
          ownerReadRef: companyReadRef
        }
      },
      coverage: { included: tools.length }
    },
    recommendationEvents: [],
    prior
  };
}

async function prepareCoupledCandidate(publicationRoot, built, sandbox, label) {
  const candidateRoot = path.join(sandbox, `${label}-candidate`);
  const transactionDir = path.join(sandbox, `${label}-transaction`);
  copyTreeWithoutGit(publicationRoot, candidateRoot);
  writeJson(path.join(candidateRoot, 'company-intelligence.config.json'), CONFIG);
  writeJson(path.join(candidateRoot, 'tools.json'), built.registryDocument);
  writeJson(path.join(transactionDir, 'frozen-inputs.json'), built.frozen);
  writeJson(path.join(transactionDir, 'versions/company-msft.json'), built.versions[0]);
  writeJson(path.join(transactionDir, 'company-owner-read.json'), built.ownerRead);

  const BRIEF = await import('../scripts/brief-publication.mjs');
  const { readPriorFromRoot } = await import('../scripts/brief-distributed-publish.mjs');
  const prior = readPriorFromRoot(candidateRoot, '2026-08');
  const brief = BRIEF.buildPublishSet(makeBriefRun(built, prior));
  assert.equal(brief.ok, true, brief.ok ? '' : JSON.stringify(brief.error));
  assert.equal(BRIEF.validatePublishSet(brief.staging, {
    priorStreams: prior?.streams || {},
    sealedMonths: prior?.sealedMonths || []
  }).ok, true);
  assert.equal(BRIEF.validateRunIdentity(brief.staging, {
    priorGeneration: prior?.generation || 0
  }).ok, true);
  const briefPromotion = BRIEF.promotePublishSet(brief.staging, candidateRoot);
  assert.equal(briefPromotion.ok, true, briefPromotion.ok ? '' : JSON.stringify(briefPromotion.error));

  const assembled = built.PUB.assembleCoupledPublication({ transactionDir, candidateRoot });
  assert.equal(assembled.ok, true, assembled.ok ? '' : JSON.stringify(assembled.error));
  return { candidateRoot, transactionDir, assembled: assembled.value };
}

function initializePublicationRoot(root, built) {
  writeJson(path.join(root, 'company-intelligence.config.json'), CONFIG);
  writeJson(path.join(root, 'tools.json'), built.registryDocument);
}

async function publishGeneration(publicationRoot, sandbox, options = {}) {
  const baseline = baselineFor(publicationRoot);
  const built = await buildOwnerRead({
    window: options.window,
    frozenAt: options.frozenAt,
    requestedAt: options.requestedAt,
    baselinePointer: baseline.pointer,
    baselineVersion: baseline.version
  });
  if (!existsSync(path.join(publicationRoot, 'tools.json'))) initializePublicationRoot(publicationRoot, built);
  const prepared = await prepareCoupledCandidate(publicationRoot, built, sandbox, options.label || options.window);
  const writes = [];
  const promoted = built.PUB.promoteCoupledPublication({
    transactionDir: prepared.transactionDir,
    publicationRoot,
    gitRunner: null,
    onWrite: (entry) => writes.push(entry)
  });
  assert.equal(promoted.ok, true, promoted.ok ? '' : JSON.stringify(promoted.error));
  const coherent = built.PUB.validateCoupledPublication(
    publicationRoot,
    built.frozen.generation.generationId
  );
  assert.equal(coherent.ok, true, coherent.ok ? '' : JSON.stringify(coherent.error));
  return { ...built, ...prepared, promoted: promoted.value, coherent: coherent.value, writes };
}

test('SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome', async () => {
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

test('Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain', async () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scn-028-011-'));
  const publicationRoot = path.join(sandbox, 'publication');
  mkdirSync(publicationRoot, { recursive: true });
  const windows = [
    ['pre-market', '2026-08-28T14:00:00.000Z'],
    ['morning', '2026-08-28T15:00:00.000Z'],
    ['pre-close', '2026-08-28T19:00:00.000Z'],
    ['after-hours', '2026-08-28T22:00:00.000Z']
  ];
  const published = [];
  let latestResult = null;
  try {
    const retryA = await buildOwnerRead({
      window: 'pre-market',
      frozenAt: '2026-08-28T14:00:00.000Z',
      baselinePointer: null,
      baselineVersion: null
    });
    const retryB = await buildOwnerRead({
      window: 'pre-market',
      frozenAt: '2026-08-28T14:00:00.000Z',
      baselinePointer: null,
      baselineVersion: null
    });
    assert.equal(retryA.frozen.generation.generationId, retryB.frozen.generation.generationId);
    assert.equal(retryA.versions[0].versionId, retryB.versions[0].versionId);
    assert.equal(retryA.versions[0].contentFingerprint, retryB.versions[0].contentFingerprint,
      'the same frozen logical generation resolves to identical candidate identity and bytes');

    for (const [window, frozenAt] of windows) {
      const priorHashes = published.map((entry) => sha(readFileSync(path.join(publicationRoot, entry.versionPath))));
      const result = await publishGeneration(publicationRoot, sandbox, {
        window,
        frozenAt,
        label: `same-day-${window}`
      });
      latestResult = result;
      const version = result.versions[0];
      const versionPath = INTEL.versionPathsFor(SUBJECT_ID, version.versionId).version;
      assert.equal(existsSync(path.join(publicationRoot, versionPath)), true);
      assert.equal(version.evidenceCutoff, frozenAt);
      assert.equal(version.priorVersionId, published.at(-1)?.versionId || null);
      published.forEach((entry, index) => {
        assert.equal(sha(readFileSync(path.join(publicationRoot, entry.versionPath))), priorHashes[index],
          `window ${window} preserves prior version bytes for ${entry.versionId}`);
      });
      published.push({ versionId: version.versionId, versionPath, generationId: version.generationId });
    }
    assert.equal(new Set(published.map((entry) => entry.versionId)).size, 4);
    assert.equal(new Set(published.map((entry) => entry.generationId)).size, 4);
    assert.equal(new Set(published.map((entry) => entry.versionPath)).size, 4,
      'the negative control would detect a date-only path collision');
    assert.equal(baselineFor(publicationRoot).pointer.versionId, published.at(-1).versionId);

    const currentVersionPath = published.at(-1).versionPath;
    const protectedPaths = [
      currentVersionPath,
      'data/company-intelligence/company-msft/current.json',
      'data/company-intelligence/publication-current.json',
      'briefs/current.json',
      'briefs/history-current.json'
    ];
    const beforeResume = new Map(protectedPaths.map((relativePath) => [
      relativePath,
      readFileSync(path.join(publicationRoot, relativePath))
    ]));
    const resumedWrites = [];
    const resumed = latestResult.PUB.promoteCoupledPublication({
      transactionDir: latestResult.transactionDir,
      publicationRoot,
      gitRunner: null,
      onWrite: (entry) => resumedWrites.push(entry)
    });
    assert.equal(resumed.ok, true, resumed.ok ? '' : JSON.stringify(resumed.error));
    assert.equal(resumed.value.resumed, true,
      'retrying the already-selected generation is an explicit idempotent resume');
    assert.deepEqual(resumedWrites, [], 'an idempotent resume rewrites no candidate or pointer');
    for (const [relativePath, expectedBytes] of beforeResume) {
      assert.deepEqual(readFileSync(path.join(publicationRoot, relativePath)), expectedBytes,
        `idempotent resume preserves ${relativePath} byte-for-byte`);
    }

    const currentVersionBytes = beforeResume.get(currentVersionPath);
    writeFileSync(
      path.join(publicationRoot, currentVersionPath),
      Buffer.concat([currentVersionBytes, Buffer.from('\n')])
    );
    const collision = latestResult.PUB.promoteCoupledPublication({
      transactionDir: latestResult.transactionDir,
      publicationRoot,
      gitRunner: null
    });
    assert.equal(collision.ok, false);
    assert.equal(collision.error.code, 'C028-GENERATION-COLLISION');
    for (const relativePath of protectedPaths.slice(1)) {
      assert.deepEqual(readFileSync(path.join(publicationRoot, relativePath)), beforeResume.get(relativePath),
        `a same-generation content collision preserves ${relativePath}`);
    }
    writeFileSync(path.join(publicationRoot, currentVersionPath), currentVersionBytes);
    assert.equal(latestResult.PUB.validateCoupledPublication(
      publicationRoot,
      latestResult.frozen.generation.generationId
    ).ok, true, 'restoring exact candidate bytes restores the resumable generation');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief', async () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scn-028-013-'));
  const publicationRoot = path.join(sandbox, 'publication');
  mkdirSync(publicationRoot, { recursive: true });
  try {
    await publishGeneration(publicationRoot, sandbox, {
      window: 'morning',
      frozenAt: '2026-08-28T15:00:00.000Z',
      label: 'predecessor-baseline'
    });
    const baseline = baselineFor(publicationRoot);
    const next = await buildOwnerRead({
      window: 'pre-close',
      frozenAt: '2026-08-28T19:00:00.000Z',
      baselinePointer: baseline.pointer,
      baselineVersion: baseline.version
    });
    const prepared = await prepareCoupledCandidate(publicationRoot, next, sandbox, 'predecessor-drift');
    const pointerPath = path.join(publicationRoot, 'data/company-intelligence/company-msft/current.json');
    const selectorPath = path.join(publicationRoot, 'data/company-intelligence/publication-current.json');
    const selectorBefore = readFileSync(selectorPath);
    const driftedSelector = {
      ...JSON.parse(selectorBefore.toString('utf8')),
      generationId: 'company-brief:2026-08-28:concurrent:0000000000000000'
    };
    writeJson(selectorPath, driftedSelector);
    const selectorWinnerBytes = readFileSync(selectorPath);
    const briefBefore = readFileSync(path.join(publicationRoot, 'briefs/current.json'));
    const candidatePath = INTEL.versionPathsFor(SUBJECT_ID, next.versions[0].versionId).version;

    const selectorRefused = next.PUB.promoteCoupledPublication({
      transactionDir: prepared.transactionDir,
      publicationRoot,
      gitRunner: null
    });
    assert.equal(selectorRefused.ok, false);
    assert.equal(selectorRefused.error.code, 'C028-PREDECESSOR-DRIFT');
    assert.deepEqual(readFileSync(selectorPath), selectorWinnerBytes,
      'the concurrently advanced coupled selector remains byte-identical after refusal');
    assert.deepEqual(readFileSync(path.join(publicationRoot, 'briefs/current.json')), briefBefore,
      'the brief candidate does not publish after coupled-selector drift');
    assert.equal(existsSync(path.join(publicationRoot, candidatePath)), false,
      'coupled-selector drift is detected before candidate durability');
    writeFileSync(selectorPath, selectorBefore);

    const driftedPointer = {
      ...baseline.pointer,
      versionId: 'company:msft:2026-08-28:concurrent:0000000000000000'
    };
    writeJson(pointerPath, driftedPointer);
    const driftWinnerBytes = readFileSync(pointerPath);

    const refused = next.PUB.promoteCoupledPublication({
      transactionDir: prepared.transactionDir,
      publicationRoot,
      gitRunner: null
    });
    assert.equal(refused.ok, false);
    assert.equal(refused.error.code, 'C028-PREDECESSOR-DRIFT');
    assert.deepEqual(readFileSync(pointerPath), driftWinnerBytes,
      'the concurrently advanced pointer remains byte-identical after refusal');
    assert.deepEqual(readFileSync(path.join(publicationRoot, 'briefs/current.json')), briefBefore,
      'the brief candidate does not publish after predecessor drift');
    assert.equal(existsSync(path.join(publicationRoot, candidatePath)), false,
      'the detector fires before candidate durability can create one-sided history');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('Mutation: SCN-028-014 recorder proves the coupled selector is the final write', async () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scn-028-014-'));
  const publicationRoot = path.join(sandbox, 'publication');
  mkdirSync(publicationRoot, { recursive: true });
  try {
    const built = await buildOwnerRead({
      window: 'morning',
      frozenAt: '2026-08-28T15:00:00.000Z'
    });
    initializePublicationRoot(publicationRoot, built);
    const prepared = await prepareCoupledCandidate(publicationRoot, built, sandbox, 'pointer-order');
    const planPath = path.join(prepared.transactionDir, 'publication-plan.json');
    const plan = JSON.parse(readFileSync(planPath, 'utf8'));
    const manifest = JSON.parse(readFileSync(
      path.join(prepared.transactionDir, 'publication-files', plan.manifestRef.path),
      'utf8'
    ));
    const nonCanonicalManifest = built.PUB.buildCoupledManifest({
      generation: manifest.generation,
      priorGenerationId: manifest.priorGenerationId,
      subjects: manifest.subjects.map((subject, index) => index === 0
        ? { ...subject, versionPath: 'data/company-intelligence/company-msft/versions/alias.json' }
        : subject),
      companyOwnerRead: manifest.companyOwnerRead,
      brief: manifest.brief,
      inventory: manifest.inventory
    });
    assert.equal(nonCanonicalManifest.ok, false,
      'a manifest cannot redirect a validated company version to a non-canonical path');
    assert.equal(nonCanonicalManifest.error.code, 'C028-COHERENCE');
    const invalidPlan = structuredClone(plan);
    invalidPlan.order.candidatePaths.push(invalidPlan.order.selectorPath);
    writeJson(planPath, invalidPlan);
    const invalid = built.PUB.promoteCoupledPublication({
      transactionDir: prepared.transactionDir,
      publicationRoot,
      gitRunner: null
    });
    assert.equal(invalid.ok, false, 'moving the selector into an earlier group is rejected');
    assert.equal(invalid.error.code, 'C028-STAGE');
    assert.equal(existsSync(path.join(publicationRoot, plan.order.selectorPath)), false);

    writeJson(planPath, plan);
    const BRIEF = await import('../scripts/brief-publication.mjs');
    const declaredFiles = Object.fromEntries(plan.files.map((entry) => {
      const bytes = readFileSync(path.join(prepared.transactionDir, 'publication-files', entry.path));
      return [entry.path, { bytes, sha256: entry.sha256, byteLength: entry.byteLength }];
    }));
    const stagedDriftPath = plan.order.candidatePaths[0];
    const indexDrift = BRIEF.stageDeclaredPublication({
      contractVersion: 'declared-publication-set/v1',
      files: declaredFiles,
      order: structuredClone(plan.order),
      immutablePaths: plan.immutablePaths.slice()
    }, (args) => {
      if (args[0] === 'add') return { code: 0, stdout: '', stderr: '' };
      if (args[0] === 'diff') {
        return { code: 0, stdout: `${plan.files.map((entry) => entry.path).join('\n')}\n`, stderr: '' };
      }
      if (args[0] === 'show') {
        const relativePath = args[1].slice(1);
        const bytes = relativePath === stagedDriftPath
          ? Buffer.concat([declaredFiles[relativePath].bytes, Buffer.from('\n')])
          : declaredFiles[relativePath].bytes;
        return { code: 0, stdout: bytes, stderr: '' };
      }
      return { code: 1, stdout: '', stderr: `unexpected Git command: ${args.join(' ')}` };
    });
    assert.equal(indexDrift.ok, false,
      'a staged blob whose bytes differ from the declared candidate is rejected');
    assert.equal(indexDrift.error.reason, 'stage-index-hash-mismatch');

    const writes = [];
    const promoted = built.PUB.promoteCoupledPublication({
      transactionDir: prepared.transactionDir,
      publicationRoot,
      gitRunner: null,
      onWrite: (entry) => writes.push(entry)
    });
    assert.equal(promoted.ok, true, promoted.ok ? '' : JSON.stringify(promoted.error));
    assert.equal(writes.at(-1).path, plan.order.selectorPath);
    assert.equal(writes.at(-1).phase, 'coupled-selector');
    const firstSubjectPointer = writes.findIndex((entry) => entry.phase === 'subject-pointer');
    const firstBriefPointer = writes.findIndex((entry) => entry.phase === 'brief-pointer');
    const selector = writes.findIndex((entry) => entry.phase === 'coupled-selector');
    const manifestWrite = writes.findIndex((entry) => entry.path === plan.manifestRef.path);
    const versionWrite = writes.findIndex((entry) => plan.companyVersionPaths.includes(entry.path));
    assert.ok(manifestWrite >= 0 && manifestWrite < firstSubjectPointer,
      'the content-addressed coupled manifest is durable before any mutable pointer');
    assert.ok(versionWrite >= 0 && versionWrite < firstSubjectPointer,
      'the immutable company candidate is durable before any mutable pointer');
    assert.ok(firstSubjectPointer > 0);
    assert.ok(firstBriefPointer > firstSubjectPointer);
    assert.ok(selector > firstBriefPointer);
    assert.equal(built.PUB.validateCoupledPublication(
      publicationRoot,
      built.frozen.generation.generationId
    ).ok, true, 'the final disk reread accepts one coherent company-and-brief pair');

    const current = JSON.parse(readFileSync(path.join(publicationRoot, 'briefs/current.json'), 'utf8'));
    const ownerPath = current.tools['company-intelligence-lab'].readPath;
    const ownerBytes = readFileSync(path.join(publicationRoot, ownerPath));
    writeFileSync(path.join(publicationRoot, ownerPath), Buffer.concat([ownerBytes, Buffer.from('\n')]));
    const incoherent = built.PUB.validateCoupledPublication(
      publicationRoot,
      built.frozen.generation.generationId
    );
    assert.equal(incoherent.ok, false, 'an owner-read byte mutation is detected from disk');
    assert.equal(incoherent.error.code, 'C028-COHERENCE');
    writeFileSync(path.join(publicationRoot, ownerPath), ownerBytes);
    assert.equal(built.PUB.validateCoupledPublication(
      publicationRoot,
      built.frozen.generation.generationId
    ).ok, true, 'restoring the exact owner-read bytes restores disk coherence');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version', async () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scn-028-021-'));
  const publicationRoot = path.join(sandbox, 'publication');
  mkdirSync(publicationRoot, { recursive: true });
  try {
    const first = await publishGeneration(publicationRoot, sandbox, {
      window: 'morning',
      frozenAt: '2026-08-28T15:00:00.000Z',
      label: 'unchanged-first'
    });
    const firstVersion = first.versions[0];
    const firstPath = INTEL.versionPathsFor(SUBJECT_ID, firstVersion.versionId).version;
    const firstBytes = readFileSync(path.join(publicationRoot, firstPath));
    const baseline = baselineFor(publicationRoot);
    const second = await buildOwnerRead({
      window: 'pre-close',
      frozenAt: '2026-08-28T19:00:00.000Z',
      baselinePointer: baseline.pointer,
      baselineVersion: baseline.version
    });
    const prepared = await prepareCoupledCandidate(publicationRoot, second, sandbox, 'unchanged-second');
    const secondVersion = second.versions[0];
    const secondPath = INTEL.versionPathsFor(SUBJECT_ID, secondVersion.versionId).version;

    writeFileSync(path.join(publicationRoot, firstPath), Buffer.concat([firstBytes, Buffer.from('\n')]));
    const immutableRefusal = second.PUB.promoteCoupledPublication({
      transactionDir: prepared.transactionDir,
      publicationRoot,
      gitRunner: null
    });
    assert.equal(immutableRefusal.ok, false);
    assert.equal(immutableRefusal.error.code, 'C028-IMMUTABLE-MUTATION');
    assert.equal(existsSync(path.join(publicationRoot, secondPath)), false,
      'predecessor mutation refuses before writing the unchanged successor');
    writeFileSync(path.join(publicationRoot, firstPath), firstBytes);
    const promoted = second.PUB.promoteCoupledPublication({
      transactionDir: prepared.transactionDir,
      publicationRoot,
      gitRunner: null
    });
    assert.equal(promoted.ok, true, promoted.ok ? '' : JSON.stringify(promoted.error));
    assert.equal(second.PUB.validateCoupledPublication(
      publicationRoot,
      second.frozen.generation.generationId
    ).ok, true);

    assert.equal(secondVersion.conclusionChange, 'unchanged');
    assert.equal(secondVersion.priorVersionId, firstVersion.versionId);
    assert.notEqual(secondVersion.versionId, firstVersion.versionId);
    assert.notEqual(secondVersion.generationId, firstVersion.generationId);
    assert.notEqual(secondVersion.contentFingerprint, firstVersion.contentFingerprint);
    assert.equal(existsSync(path.join(publicationRoot, secondPath)), true,
      'the unchanged conclusion still creates a new immutable version file');
    assert.deepEqual(readFileSync(path.join(publicationRoot, firstPath)), firstBytes,
      'the predecessor remains byte-identical after the unchanged recreation');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('Regression: SCN-028-015 brief validation failure removes company candidates and restores both baselines', async () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scn-028-015-'));
  const fixture = initializeRestorationPair(sandbox);
  const transactionDir = path.join(sandbox, 'private-transaction');
  const PUB = await import(PUBLICATION_MODULE.href);
  try {
    const captured = PUB.captureCoupledTransactionBaseline({
      transactionDir,
      candidateRoot: fixture.candidateRoot,
      publicationRoot: fixture.publicationRoot,
      remote: 'origin',
      branch: 'main'
    });
    assert.equal(captured.ok, true, captured.ok ? '' : JSON.stringify(captured.error));
    assert.equal(captured.value.baseCommit, fixture.baseline.baseCommit);

    writeJson(path.join(transactionDir, 'validated-checkpoints/company-msft.json'), {
      contractVersion: 'private-company-checkpoint/v1',
      generationId: 'failed-brief-generation'
    });
    writeJson(path.join(fixture.candidateRoot,
      'data/company-intelligence/company-msft/versions/unpublished.json'), {
      versionId: 'unpublished',
      generationId: 'failed-brief-generation'
    });
    writeJson(path.join(fixture.candidateRoot, 'briefs/current.json'), {
      runId: 'invalid-new-brief',
      generation: 8
    });
    writeJson(path.join(fixture.publicationRoot,
      'data/company-intelligence/company-msft/versions/unpublished.json'), {
      versionId: 'unpublished',
      generationId: 'failed-brief-generation'
    });

    const aborted = PUB.abortCoupledTransaction({
      transactionDir,
      candidateRoot: fixture.candidateRoot,
      publicationRoot: fixture.publicationRoot,
      failure: {
        contractVersion: 'company-publication-error/v1',
        code: 'C028-BRIEF-CANDIDATE',
        phase: 'final-brief-validated',
        reason: `authored rejection at ${fixture.candidateRoot} with token=private-value`,
        field: 'briefs/current.json',
        causeCode: 'fixture-brief-invalid'
      }
    });
    assert.equal(aborted.ok, true, aborted.ok ? '' : JSON.stringify(aborted.error));
    assert.equal(aborted.value.state, 'aborted-pre-commit');
    assert.equal(aborted.value.failure.code, 'C028-BRIEF-CANDIDATE');
    assert.equal(existsSync(path.join(fixture.candidateRoot,
      'data/company-intelligence/company-msft/versions/unpublished.json')), false);
    assert.equal(existsSync(path.join(fixture.publicationRoot,
      'data/company-intelligence/company-msft/versions/unpublished.json')), false);
    assert.equal(existsSync(path.join(transactionDir,
      'validated-checkpoints/company-msft.json')), true,
    'a valid private checkpoint survives checkout restoration');
    assert.doesNotMatch(JSON.stringify(aborted.value), /private-value|company-publication-scn-028-015/,
      'the restoration result sanitizes private paths and authored rejection text');
    assertRestoredPair(fixture);

    const attempt = PUB.buildAttemptRecord({
      attemptId: '15151515-1515-4515-8515-151515151515',
      generationId: 'company-brief:2026-08-28:morning:1515151515151515',
      trigger: 'scheduled',
      window: 'morning',
      state: 'failed',
      phase: 'final-brief-validated',
      startedAt: '2026-08-28T13:59:00.000Z',
      finishedAt: '2026-08-28T14:00:00.000Z',
      failure: {
        contractVersion: 'company-publication-error/v1',
        code: 'C028-BRIEF-CANDIDATE',
        phase: 'final-brief-validated',
        reason: `authored rejection at ${fixture.candidateRoot} with password=hunter2`,
        field: 'briefs/current.json',
        causeCode: 'fixture-brief-invalid'
      },
      authoritativeGenerationId: 'prior-generation'
    });
    assert.equal(attempt.ok, true, attempt.ok ? '' : JSON.stringify(attempt.error));
    assert.equal(attempt.value.authoritativeUnchanged, true);
    assert.equal(Object.hasOwn(attempt.value, 'pairAuthority'), false,
      'an attempt record cannot grant pair authority');
    assert.doesNotMatch(JSON.stringify(attempt.value), /hunter2|private|authored rejection/);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('Regression: SCN-028-016 company validation failure with a valid brief restores both baselines', async () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scn-028-016-'));
  const fixture = initializeRestorationPair(sandbox);
  const transactionDir = path.join(sandbox, 'private-transaction');
  const PUB = await import(PUBLICATION_MODULE.href);
  try {
    const captured = PUB.captureCoupledTransactionBaseline({
      transactionDir,
      candidateRoot: fixture.candidateRoot,
      publicationRoot: fixture.publicationRoot,
      remote: 'origin',
      branch: 'main'
    });
    assert.equal(captured.ok, true, captured.ok ? '' : JSON.stringify(captured.error));
    writeJson(path.join(fixture.candidateRoot, 'briefs/current.json'), {
      runId: 'validated-new-brief',
      generation: 8
    });
    writeJson(path.join(fixture.publicationRoot, 'briefs/current.json'), {
      runId: 'validated-new-brief',
      generation: 8
    });
    writeJson(path.join(fixture.publicationRoot,
      'data/company-intelligence/company-msft/current.json'), {
      generationId: 'company-validation-failed',
      versionId: 'invalid-company-version'
    });
    runGit(fixture.publicationRoot, ['add', '--', 'briefs/current.json',
      'data/company-intelligence/company-msft/current.json']);

    const aborted = PUB.abortCoupledTransaction({
      transactionDir,
      candidateRoot: fixture.candidateRoot,
      publicationRoot: fixture.publicationRoot,
      failure: {
        contractVersion: 'company-publication-error/v1',
        code: 'C028-COMPANY-CANDIDATE',
        phase: 'company-candidates-validated',
        reason: 'The company candidate failed its exact contract.',
        field: 'company:msft',
        causeCode: 'fixture-company-invalid'
      }
    });
    assert.equal(aborted.ok, true, aborted.ok ? '' : JSON.stringify(aborted.error));
    assert.equal(aborted.value.failure.field, 'company:msft');
    if (process.env.SCOPE03_COMPANY_FAILURE_NEGATIVE_CONTROL === 'retain-brief-candidate') {
      writeJson(path.join(fixture.publicationRoot, 'briefs/current.json'), {
        runId: 'retained-invalid-brief',
        generation: 8
      });
    }
    assertRestoredPair(fixture);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('Mutation: SCN-028-017 one failing subject aborts a synthetic two-subject covered set', async () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scn-028-017-'));
  const fixture = initializeRestorationPair(sandbox);
  const transactionDir = path.join(sandbox, 'private-transaction');
  const built = await buildOwnerRead();
  const PUB = built.PUB;
  try {
    const captured = PUB.captureCoupledTransactionBaseline({
      transactionDir,
      candidateRoot: fixture.candidateRoot,
      publicationRoot: fixture.publicationRoot,
      remote: 'origin',
      branch: 'main'
    });
    assert.equal(captured.ok, true, captured.ok ? '' : JSON.stringify(captured.error));
    const testSubject = {
      ...built.frozen.policy.coveredSubjects[0],
      subjectId: 'company:test',
      ticker: 'TEST',
      cik: '0000000002',
      displayName: 'Synthetic test-only subject'
    };
    const syntheticPolicy = {
      ...built.frozen.policy,
      coveredSubjects: [built.frozen.policy.coveredSubjects[0], testSubject]
    };
    const syntheticFrozen = PUB.freezePublicationInputs({
      policy: syntheticPolicy,
      coverageRegistry: built.frozen.coverageRegistry,
      registry: built.registry,
      trigger: built.frozen.trigger,
      etSessionDate: built.frozen.etSessionDate,
      frozenAt: built.frozen.frozenAt,
      evidenceCutoff: built.frozen.evidenceCutoff,
      sourceRevision: built.frozen.sourceRevision,
      baselinePointers: { [SUBJECT_ID]: null, 'company:test': null },
      baselineVersions: { [SUBJECT_ID]: null, 'company:test': null },
      sources: built.sources,
      subjectInputs: {
        [SUBJECT_ID]: built.frozen.subjectInputs[SUBJECT_ID],
        'company:test': { publishedRegimeContext: { available: false }, marketSentiment: null }
      }
    });
    assert.equal(syntheticFrozen.ok, true,
      syntheticFrozen.ok ? '' : JSON.stringify(syntheticFrozen.error));
    const base = PUB.composeSubjectBase(syntheticFrozen.value, SUBJECT_ID);
    const catalogue = PUB.buildSourceCatalogue(syntheticFrozen.value, SUBJECT_ID);
    assert.equal(base.ok, true, base.ok ? '' : JSON.stringify(base.error));
    assert.equal(catalogue.ok, true, catalogue.ok ? '' : JSON.stringify(catalogue.error));
    const request = PUB.buildPlanAuthorRequest(
      syntheticFrozen.value.generation,
      syntheticFrozen.value.policy.coveredSubjects[0],
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

    const refused = PUB.composeCoveredSubjects(syntheticFrozen.value, {
      [SUBJECT_ID]: plan.value
    });
    assert.equal(refused.ok, false, 'the missing second-subject plan aborts the complete set');
    assert.equal(refused.error.field, 'plans.company:test');
    assert.match(refused.error.reason, /company:test|research plan/i,
      'the covered-set refusal identifies the failed subject by name');

    writeJson(path.join(fixture.candidateRoot,
      'data/company-intelligence/company-test/current.json'), {
      generationId: syntheticFrozen.value.generation.generationId,
      versionId: 'must-not-survive'
    });
    writeJson(path.join(fixture.publicationRoot,
      'data/company-intelligence/company-msft/current.json'), {
      generationId: syntheticFrozen.value.generation.generationId,
      versionId: 'must-not-advance'
    });
    const aborted = PUB.abortCoupledTransaction({
      transactionDir,
      candidateRoot: fixture.candidateRoot,
      publicationRoot: fixture.publicationRoot,
      failure: refused.error
    });
    assert.equal(aborted.ok, true, aborted.ok ? '' : JSON.stringify(aborted.error));
    assert.equal(aborted.value.failure.field, 'plans.company:test');
    if (process.env.SCOPE03_COVERED_SET_NEGATIVE_CONTROL === 'retain-failed-subject-pointer') {
      writeJson(path.join(fixture.candidateRoot,
        'data/company-intelligence/company-test/current.json'), {
        generationId: syntheticFrozen.value.generation.generationId,
        versionId: 'retained-failed-subject'
      });
    }
    assert.equal(existsSync(path.join(fixture.candidateRoot,
      'data/company-intelligence/company-test/current.json')), false);
    assertRestoredPair(fixture);
    assert.equal(CONFIG.publication.coveredSubjects.length, 1,
      'the committed policy remains company:msft only');
    assert.equal(CONFIG.publication.coveredSubjects[0].subjectId, SUBJECT_ID);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});
