/*
 * Feature 028 Scope 04 — frozen-registry and source-cycle functional mutation proof.
 *
 * The test executes the production publication boundary with isolated in-memory
 * contract documents. It mutates one frozen dimension at a time and requires a
 * closed refusal before any publication authority is available.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  chmodSync,
  cpSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import * as PUB from '../scripts/company-intelligence-publication.mjs';
import { createBriefRefreshFixture } from './brief-refresh-atomicity.support.mjs';

const require = createRequire(import.meta.url);
const INTEL = require('../rlcompanyintel.js');
const RLCONTRACTS = require('../rlcontracts.js');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PACKAGE_ROOT = process.env.COMPANY_PUBLICATION_PACKAGE_ROOT
  ? path.resolve(process.env.COMPANY_PUBLICATION_PACKAGE_ROOT)
  : ROOT;
const CONFIG = JSON.parse(readFileSync(new URL('../company-intelligence.config.json', import.meta.url), 'utf8'));
const SUBJECT_ID = 'company:msft';
const CUTOFF = '2026-08-28T14:00:00.000Z';

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

function registryDocument(sourceOrder = ['company-intelligence-lab', 'etf-momentum-lab']) {
  const sourceById = {
    'company-intelligence-lab': {
      id: 'company-intelligence-lab',
      briefing: briefing('live-market', 'source', 'company-intelligence-owner-v1')
    },
    'etf-momentum-lab': {
      id: 'etf-momentum-lab',
      briefing: briefing('live-market', 'source', 'etf-momentum-owner-v1')
    },
    'swing-structure-lab': {
      id: 'swing-structure-lab',
      briefing: briefing('live-market', 'source', 'swing-structure-owner-v1')
    }
  };
  return {
    tools: [
      { id: 'market-brief', briefing: briefing('final-aggregator', 'final-aggregator', 'market-brief-final-v1') },
      ...sourceOrder.map((id) => sourceById[id])
    ]
  };
}

function freezeRegistry(document) {
  const result = RLCONTRACTS.validateRegistry(document, null);
  assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.error));
  return result.value;
}

function source(ownerToolId = 'etf-momentum-lab') {
  return {
    sourceId: `owner:${ownerToolId}:${SUBJECT_ID}`,
    sourceKind: 'per-ticker-owner-read',
    ownerToolId,
    subjectId: SUBJECT_ID,
    asOf: '2026-08-28T13:30:00.000Z',
    provenanceClass: 'derived',
    maxHorizon: 'structural',
    deepLink: `${ownerToolId}.html`,
    state: 'current',
    payload: {
      toolId: ownerToolId,
      subjectId: SUBJECT_ID,
      ticker: 'MSFT',
      state: 'current',
      asOf: '2026-08-28T13:30:00.000Z',
      read: 'The owning model produced a source-qualified result.',
      metrics: { observedValue: 7 }
    }
  };
}

function frozenInputs() {
  const policy = PUB.validatePublicationPolicy(CONFIG);
  assert.equal(policy.ok, true, policy.ok ? '' : JSON.stringify(policy.error));
  const result = PUB.freezePublicationInputs({
    policy: policy.value,
    coverageRegistry: INTEL.readCoverageRegistry(CONFIG),
    registry: freezeRegistry(registryDocument()),
    trigger: {
      contractVersion: 'company-publication-trigger/v1',
      trigger: 'scheduled',
      window: 'morning',
      generationKey: 'scheduled/2026-08-28/morning',
      requestedAt: '2026-08-28T13:59:00.000Z'
    },
    etSessionDate: '2026-08-28',
    frozenAt: CUTOFF,
    evidenceCutoff: CUTOFF,
    sourceRevision: 'd'.repeat(40),
    baselinePointers: { [SUBJECT_ID]: null },
    baselineVersions: { [SUBJECT_ID]: null },
    sources: [source()],
    subjectInputs: {
      [SUBJECT_ID]: {
        committedEvents: null,
        publishedRegimeContext: { available: false },
        marketSentiment: null
      }
    }
  });
  assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.error));
  return result.value;
}

function assertRefusal(result, code, fieldPattern) {
  assert.equal(result.ok, false, 'the mutation must refuse publication');
  assert.equal(result.error.code, code);
  assert.match(result.error.field || '', fieldPattern);
}

function run(command, args, cwd, extraEnv = {}) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: 120_000,
    killSignal: 'SIGKILL',
    env: {
      ...process.env,
      PATH: '/opt/local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
      ...extraEnv
    }
  });
}

function requireSuccess(result, label) {
  assert.equal(result.error, undefined,
    `${label}\nprocess error: ${result.error?.message}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.equal(result.status, 0, `${label}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  return result.stdout.trim();
}

function copyRelative(root, relativePath) {
  const destination = path.join(root, relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(path.join(ROOT, relativePath), destination);
}

function addCompanySource(file) {
  const document = JSON.parse(readFileSync(file, 'utf8'));
  const registered = document.tools.filter((entry) => entry.id === 'company-intelligence-lab');
  assert.ok(registered.length <= 1,
    'the isolated checkout must not contain duplicate Company Intelligence sources');
  if (registered.length === 1) {
    assert.equal(registered[0].briefing?.role, 'source');
    assert.equal(registered[0].briefing?.readAdapter, 'company-intelligence-owner-v1');
    assert.equal(registered[0].briefing?.readContractVersion, 'tool-model-read/v1');
    return;
  }
  const after = document.tools.findIndex((entry) => entry.id === 'company-fundamentals-lab');
  assert.ok(after >= 0);
  document.tools.splice(after + 1, 0, {
    id: 'company-intelligence-lab',
    briefing: briefing('live-market', 'source', 'company-intelligence-owner-v1')
  });
  writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}

function createLauncherFixture() {
  const atomic = createBriefRefreshFixture({
    narrativeMode: 'success',
    companyAssets: false,
    prePublicationCompanyIntelligence: true,
    baselineDate: '2026-08-28',
    candidateDate: '2026-08-29'
  });
  const sandbox = atomic.fixtureRoot;
  const sourceRoot = atomic.repoRoot;
  const remote = atomic.remoteRoot;
  const transactionRoot = path.join(sandbox, 'transactions');
  const statusFile = path.join(sandbox, 'scheduler.status');
  for (const relativePath of ['market-brief.snapshot.json', 'market-brief.payload.json']) {
    const baseline = JSON.parse(readFileSync(path.join(sourceRoot, relativePath), 'utf8'));
    assert.equal(
      Object.prototype.hasOwnProperty.call(baseline.toolReads || {}, 'company-intelligence-lab'),
      false,
      `${relativePath} must begin before the launcher creates its Company Intelligence owner read`
    );
    assert.equal(
      (baseline.toolCoverage || []).filter((row) => row?.id === 'company-intelligence-lab').length,
      0,
      `${relativePath} must begin before the launcher creates its Company Intelligence coverage row`
    );
  }
  for (const relativePath of [
    'rlcompanyintel.js',
    'company-intelligence.config.json',
    'market-brief.owner-reads.json',
    'scripts/brief-refresh-and-push.sh',
    'scripts/brief-refresh-scheduled.sh',
    'scripts/company-intelligence-publication.mjs'
  ]) copyRelative(sourceRoot, relativePath);
  addCompanySource(path.join(sourceRoot, 'tools.json'));
  if (process.env.SCOPE04_SCN019_NEGATIVE_CONTROL === 'bypass-final-boundary') {
    const modulePath = path.join(sourceRoot, 'scripts/company-intelligence-publication.mjs');
    const moduleSource = readFileSync(modulePath, 'utf8');
    const boundaryCalls = [
      ['return validateFrozenPublicationBoundary(frozen, {', 'return ok({'],
      ['const registryBoundary = validateFrozenPublicationBoundary(frozenDoc.value, {',
        'const registryBoundary = ok({']
    ];
    let mutatedSource = moduleSource;
    for (const [boundaryCall, replacement] of boundaryCalls) {
      assert.equal(mutatedSource.includes(boundaryCall), true,
        `the SCN-028-019 mutant must bind to ${boundaryCall}`);
      mutatedSource = mutatedSource.replace(boundaryCall, replacement);
    }
    writeFileSync(modulePath, mutatedSource);
  }
  requireSuccess(run('git', ['add', '--', '.'], sourceRoot), 'drift source add');
  requireSuccess(run('git', ['commit', '-m', 'scope 04 drift baseline'], sourceRoot), 'drift source commit');
  requireSuccess(run('git', ['push', 'origin', 'main'], sourceRoot), 'drift source push');
  const snapshot = JSON.parse(readFileSync(path.join(sourceRoot, 'market-brief.snapshot.json'), 'utf8'));
  const window = snapshot.window;
  const environment = {
    BRIEF_SCHEDULE_SOURCE_ROOT: sourceRoot,
    BRIEF_SCHEDULE_STATUS_FILE: statusFile,
    BRIEF_SCHEDULE_TRANSACTION_ROOT: transactionRoot,
    BRIEF_SCHEDULE_LOCK_DIR: path.join(sandbox, 'branch.lock'),
    BRIEF_SCHEDULE_REQUESTED_AT: new Date(Date.parse(snapshot.asOf) - 60_000).toISOString(),
    BRIEF_SCHEDULE_ET_SESSION_DATE: '2026-08-28',
    BRIEF_COPILOT_BIN: atomic.copilotPath,
    BRIEF_NARRATIVE_ATTEMPTS: '1',
    BRIEF_LANE_ATTEMPTS: '1',
    BRIEF_LANE_CONCURRENCY: '4',
    BRIEF_SKIP_NARRATIVE: '0',
    BUG002_BOUNDARY_LOG: atomic.boundaryLog,
    BUG002_CANDIDATE_DATE: atomic.candidateDate,
    BUG002_COPILOT_ATTEMPT_FILE: atomic.copilotAttemptFile,
    BUG002_COPILOT_AUDIT_FILE: atomic.copilotAuditFile,
    BUG002_NARRATIVE_MODE: atomic.narrativeMode,
    BUG002_VALIDATOR_COUNT_FILE: atomic.validatorCountFile,
    GIT_AUTHOR_NAME: 'Scope 04 Publisher',
    GIT_AUTHOR_EMAIL: 'scope04@example.invalid',
    GIT_COMMITTER_NAME: 'Scope 04 Publisher',
    GIT_COMMITTER_EMAIL: 'scope04@example.invalid'
  };
  return {
    sandbox,
    sourceRoot,
    remote,
    transactionRoot,
    window,
    environment,
    cleanup() { atomic.cleanup(); }
  };
}

function runLauncher(fixture, extraEnv) {
  return run('/bin/bash', [
    path.join(fixture.sourceRoot, 'scripts/brief-refresh-scheduled.sh'),
    '--trigger', 'scheduled', '--window', fixture.window, '--due-only'
  ], fixture.sourceRoot, { ...fixture.environment, ...extraEnv });
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

test('Mutation: SCN-028-019 registry order fingerprint participant and dependency cycle drift each abort publication', () => {
  const frozen = frozenInputs();
  const current = {
    registry: frozen.registry,
    sources: frozen.sources,
    evidenceCutoff: frozen.evidenceCutoff
  };
  const accepted = PUB.validateFrozenPublicationBoundary(frozen, current);
  assert.equal(accepted.ok, true, accepted.ok ? '' : JSON.stringify(accepted.error));
  assert.equal(accepted.value.sourceCount, 1);
  assert.equal(accepted.value.participantCount, 3);

  const reordered = freezeRegistry(registryDocument(['etf-momentum-lab', 'company-intelligence-lab']));
  assertRefusal(
    PUB.validateFrozenPublicationBoundary(frozen, { ...current, registry: reordered }),
    'C028-REGISTRY-DRIFT',
    /registry/
  );

  const added = freezeRegistry(registryDocument([
    'company-intelligence-lab',
    'etf-momentum-lab',
    'swing-structure-lab'
  ]));
  assertRefusal(
    PUB.validateFrozenPublicationBoundary(frozen, { ...current, registry: added }),
    'C028-REGISTRY-DRIFT',
    /registry/
  );

  const removed = freezeRegistry(registryDocument(['etf-momentum-lab']));
  assertRefusal(
    PUB.validateFrozenPublicationBoundary(frozen, { ...current, registry: removed }),
    'C028-REGISTRY-DRIFT',
    /registry/
  );

  const fingerprintChanged = structuredClone(frozen.registry);
  fingerprintChanged.registryFingerprint = `sha256:${'0'.repeat(64)}`;
  assertRefusal(
    PUB.validateFrozenPublicationBoundary(frozen, { ...current, registry: fingerprintChanged }),
    'C028-REGISTRY-DRIFT',
    /registry/
  );

  const sourceChanged = structuredClone(frozen.sources);
  sourceChanged[0].payload.metrics.observedValue = 8;
  assertRefusal(
    PUB.validateFrozenPublicationBoundary(frozen, { ...current, sources: sourceChanged }),
    'C028-FROZEN-INPUT-DRIFT',
    /sources/
  );

  assertRefusal(
    PUB.validateFrozenPublicationBoundary(frozen, {
      ...current,
      evidenceCutoff: '2026-08-28T14:00:00.001Z'
    }),
    'C028-EVIDENCE-CUTOFF',
    /evidenceCutoff/
  );

  const policy = PUB.validatePublicationPolicy(CONFIG).value;
  for (const ownerToolId of ['company-intelligence-lab', frozen.registry.aggregatorToolId]) {
    const cycle = PUB.freezePublicationInputs({
      policy,
      coverageRegistry: INTEL.readCoverageRegistry(CONFIG),
      registry: frozen.registry,
      trigger: frozen.trigger,
      etSessionDate: frozen.etSessionDate,
      frozenAt: frozen.frozenAt,
      evidenceCutoff: frozen.evidenceCutoff,
      sourceRevision: frozen.sourceRevision,
      baselinePointers: frozen.baselinePointers,
      baselineVersions: frozen.baselineVersions,
      sources: [source(ownerToolId)],
      subjectInputs: frozen.subjectInputs
    });
    assertRefusal(cycle, 'C028-SOURCE-CYCLE', /ownerToolId/);
  }

  const fixture = createLauncherFixture();
  try {
    const hookRoot = path.join(fixture.sandbox, 'hooks');
    mkdirSync(hookRoot, { recursive: true });
    const preCommit = path.join(hookRoot, 'pre-commit');
    writeFileSync(preCommit, '#!/usr/bin/env bash\nexit 43\n');
    chmodSync(preCommit, 0o755);
    const hookEnvironment = {
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'core.hooksPath',
      GIT_CONFIG_VALUE_0: hookRoot
    };
    const remoteBaseline = requireSuccess(
      run('git', ['--git-dir', fixture.remote, 'rev-parse', 'main'], fixture.sandbox),
      'drift remote baseline'
    );
    const blockedCommit = runLauncher(fixture, hookEnvironment);
    assert.notEqual(blockedCommit.status, 0,
      'the pre-commit fault must retain one frozen real-process generation for drift retries');
    const blockedCommitOutput = `${blockedCommit.stdout}\n${blockedCommit.stderr}`;
    if (!/C028-COMMIT/.test(blockedCommitOutput)) {
      const observedCodes = [...new Set(blockedCommitOutput.match(/C028-[A-Z-]+/g) || [])];
      const contractSignals = blockedCommitOutput.split('\n')
        .filter((line) => /\[brief-(?:contract|timer|distributed|parallel|page)\]|^\s+- |collected nextSession/.test(line));
      const structuredFailures = blockedCommitOutput.split('\n')
        .filter((line) => line.includes('"code":"C028-'));
      console.log(`SCN028019_BLOCKED_COMMIT_CODES=${observedCodes.join(',') || 'none'}`);
      console.log(`SCN028019_STRUCTURED_FAILURES=${JSON.stringify(structuredFailures.slice(-4))}`);
      console.log(`SCN028019_FINAL_CONTRACT_SIGNALS=${JSON.stringify(contractSignals.slice(-32))}`);
      console.log('SCN028019_BLOCKED_COMMIT_OUTPUT_BEGIN');
      console.log(blockedCommit.stdout);
      console.log(blockedCommit.stderr);
      console.log('SCN028019_BLOCKED_COMMIT_OUTPUT_END');
    }
    assert.match(blockedCommitOutput, /C028-COMMIT/);
    const parent = path.join(fixture.transactionRoot, `scheduled-${fixture.window}`);
    const candidate = path.join(parent, 'candidate');
    assert.equal(requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], candidate),
      'drift candidate clean after commit fault'), '');

    const controls = [
      {
        label: 'registry-order',
        code: 'C028-REGISTRY-DRIFT',
        mutate() {
          const file = path.join(candidate, 'tools.json');
          const document = JSON.parse(readFileSync(file, 'utf8'));
          const sources = document.tools
            .map((entry, index) => ({ entry, index }))
            .filter(({ entry }) => entry.briefing?.role === 'source');
          assert.ok(sources.length >= 2);
          [document.tools[sources[0].index], document.tools[sources[1].index]] =
            [document.tools[sources[1].index], document.tools[sources[0].index]];
          writeJson(file, document);
        }
      },
      {
        label: 'registry-participant-count',
        code: 'C028-REGISTRY-DRIFT',
        mutate() {
          const file = path.join(candidate, 'tools.json');
          const document = JSON.parse(readFileSync(file, 'utf8'));
          document.tools.push({
            id: 'scope04-drift-source',
            briefing: briefing('live-market', 'source', 'scope04-drift-owner-v1')
          });
          writeJson(file, document);
        }
      },
      {
        label: 'registry-participant-removal',
        code: 'C028-REGISTRY-DRIFT',
        mutate() {
          const file = path.join(candidate, 'tools.json');
          const document = JSON.parse(readFileSync(file, 'utf8'));
          const index = document.tools.findIndex((entry) =>
            entry.briefing?.role === 'source' && entry.id !== 'company-intelligence-lab');
          assert.ok(index >= 0);
          document.tools.splice(index, 1);
          writeJson(file, document);
        }
      },
      {
        label: 'registry-metadata-fingerprint',
        code: 'C028-REGISTRY-DRIFT',
        mutate() {
          const file = path.join(candidate, 'tools.json');
          const document = JSON.parse(readFileSync(file, 'utf8'));
          const company = document.tools.find((entry) => entry.id === 'company-intelligence-lab');
          company.briefing.budgetPolicy = 'live-market-drift-v1';
          writeJson(file, document);
        }
      },
      {
        label: 'source-payload-fingerprint',
        code: 'C028-FROZEN-INPUT-DRIFT',
        mutate() {
          const file = path.join(candidate, 'market-brief.owner-reads.json');
          const document = JSON.parse(readFileSync(file, 'utf8'));
          const owner = Object.keys(document.ownerReads).find((toolId) => document.ownerReads[toolId]?.MSFT);
          assert.ok(owner);
          document.ownerReads[owner].MSFT.scope04Drift = true;
          writeJson(file, document);
        }
      },
      ...['company-intelligence-lab', 'market-brief'].map((ownerToolId) => ({
        label: ownerToolId === 'market-brief' ? 'final-brief-cycle' : 'self-cycle',
        code: 'C028-SOURCE-CYCLE',
        mutate() {
          const file = path.join(candidate, 'market-brief.owner-reads.json');
          const document = JSON.parse(readFileSync(file, 'utf8'));
          const templateOwner = Object.keys(document.ownerReads).find((toolId) => document.ownerReads[toolId]?.MSFT);
          assert.ok(templateOwner);
          document.ownerReads[ownerToolId] = {
            MSFT: structuredClone(document.ownerReads[templateOwner].MSFT)
          };
          writeJson(file, document);
        }
      }))
    ];

    for (const control of controls) {
      control.mutate();
      const refused = runLauncher(fixture, hookEnvironment);
      assert.notEqual(refused.status, 0, `${control.label} must refuse the real shared launcher`);
      assert.match(`${refused.stdout}\n${refused.stderr}`, new RegExp(control.code),
        `${control.label} must report ${control.code}`);
      assert.equal(
        requireSuccess(run('git', ['--git-dir', fixture.remote, 'rev-parse', 'main'], fixture.sandbox),
          `${control.label} remote head`),
        remoteBaseline,
        `${control.label} must advance no company pointer or brief artifact`
      );
      assert.equal(
        requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], candidate),
          `${control.label} candidate restoration`),
        '',
        `${control.label} must restore the candidate checkout after refusal`
      );
    }
  } finally {
    fixture.cleanup();
  }
});

test('Mutation: SCN-028-002 a registered company artifact with one stale exclusion is refused', async () => {
  const builder = await import('../scripts/build-pages-site.mjs');
  assert.equal(typeof builder.validateCompanyPublicationPackage, 'function',
    'the production Pages evaluator must expose the Company publication package validator');
  assert.equal(typeof builder.parsePublicCompanyProjectionSource, 'function',
    'the production Pages evaluator must parse the deterministic projection without evaluating JavaScript');

  const registry = JSON.parse(readFileSync(path.join(PACKAGE_ROOT, 'tools.json'), 'utf8'));
  const exclusions = JSON.parse(readFileSync(path.join(PACKAGE_ROOT, 'site-exclusions.json'), 'utf8'));
  const accepted = builder.validateCompanyPublicationPackage(PACKAGE_ROOT, { registry, exclusionsDocument: exclusions });
  assert.equal(accepted.active, true);
  assert.ok(accepted.requiredPaths.length > 8);
  assert.equal(accepted.requiredPaths.includes('data/company-intelligence/publication-current.json'), true);
  assert.equal(accepted.requiredPaths.includes('data/company-intelligence/publication-current.js'), true);

  const packageDestination = `.scope05-package-contract-${process.pid}`;
  try {
    const packagePlan = builder.buildPagesSite({
      root: PACKAGE_ROOT,
      destination: packageDestination
    });
    const requiredIndexDirectories = new Set(accepted.requiredPaths
      .map((relativePath) => /^(briefs\/indexes\/[a-f0-9]{64})\//.exec(relativePath)?.[1])
      .filter(Boolean));
    assert.deepEqual(
      [...requiredIndexDirectories].every((directory) => packagePlan.retainedHistoryIndexDirectories.includes(directory)),
      true,
      'the production package plan retains every history index selected by pair authority'
    );
    for (const relativePath of accepted.requiredPaths) {
      assert.equal(existsSync(path.join(PACKAGE_ROOT, packageDestination, relativePath)), true,
        `the built package retains the authoritative dependency ${relativePath}`);
    }
  } finally {
    rmSync(path.join(PACKAGE_ROOT, packageDestination), { recursive: true, force: true });
  }

  for (const stalePath of [
    'company-intelligence-lab.html',
    'rlcompanyintel.js',
    'company-intelligence.config.json'
  ]) {
    const mutated = structuredClone(exclusions);
    mutated.files.push({
      path: stalePath,
      reason: 'Mutation fixture restores one retired Company Intelligence exclusion so the production packaging refusal must name it.'
    });
    assert.throws(
      () => builder.validateCompanyPublicationPackage(ROOT, { registry, exclusionsDocument: mutated }),
      (error) => error instanceof Error && error.message.includes('C028-PACKAGING') && error.message.includes(stalePath),
      `${stalePath} must produce a named C028-PACKAGING refusal`
    );
  }

  const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'company-publication-package-'));
  try {
    for (const relativePath of accepted.requiredPaths) {
      const sourcePath = path.join(PACKAGE_ROOT, relativePath);
      const destinationPath = path.join(fixtureRoot, relativePath);
      assert.equal(existsSync(sourcePath), true, `accepted package path exists: ${relativePath}`);
      mkdirSync(path.dirname(destinationPath), { recursive: true });
      cpSync(sourcePath, destinationPath, { recursive: true });
    }
    const projectionPath = path.join(fixtureRoot, 'data/company-intelligence/publication-current.js');
    const projectionSource = readFileSync(projectionPath, 'utf8');
    const projection = builder.parsePublicCompanyProjectionSource(projectionSource);
    const writeProjectionMutation = (mutate) => {
      const mutated = structuredClone(projection);
      mutate(mutated);
      const lines = projectionSource.split('\n');
      lines[2] = `  var value = JSON.parse(${JSON.stringify(JSON.stringify(mutated))});`;
      writeFileSync(projectionPath, lines.join('\n'));
    };
    const projectionMutations = [
      {
        label: 'attempt identity',
        message: 'public projection attempt does not match the selected attempt record',
        mutate(value) {
          assert.notEqual(value.attempt, null, 'the production projection must carry the selected failed attempt');
          value.attempt.attemptId = '51515151-5151-4151-8151-515151515151';
        }
      },
      {
        label: 'authoritative pair generation',
        message: 'public projection does not preserve the acknowledged pair identity',
        mutate(value) {
          const divergent = 'company-brief:2026-08-31:morning:ffffffffffffffff';
          value.pair.generationId = divergent;
          value.pair.version.generationId = divergent;
        }
      },
      {
        label: 'projection contract version',
        message: 'public projection contract is invalid',
        mutate(value) {
          value.contractVersion = 'company-publication-projection/v0';
        }
      }
    ];
    for (const control of projectionMutations) {
      writeProjectionMutation(control.mutate);
      assert.throws(
        () => builder.validateCompanyPublicationPackage(fixtureRoot, { registry, exclusionsDocument: exclusions }),
        (error) => error instanceof Error && error.message.includes('C028-PACKAGING') &&
          error.message.includes(control.message),
        `${control.label} divergence must produce a named C028-PACKAGING refusal`
      );
      writeFileSync(projectionPath, projectionSource);
    }

    const missingPath = 'rlexperience-adapters/company-intelligence.js';
    rmSync(path.join(fixtureRoot, missingPath), { force: true });
    assert.throws(
      () => builder.validateCompanyPublicationPackage(fixtureRoot, { registry, exclusionsDocument: exclusions }),
      (error) => error instanceof Error && error.message.includes('C028-PACKAGING') && error.message.includes(missingPath),
      'a missing registered adapter must produce a named C028-PACKAGING refusal'
    );
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
