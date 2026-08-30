/*
 * Feature 028 Scope 01 — process regression through the production CLI in a real temporary Git checkout.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLICATION_MODULE = new URL('../scripts/company-intelligence-publication.mjs', import.meta.url);
const PROCESS_TIMEOUT_MS = 30_000;

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

function sha(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function run(command, args, cwd) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: PROCESS_TIMEOUT_MS,
    killSignal: 'SIGKILL',
    env: {
      ...process.env,
      PATH: '/opt/local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
      COMPANY_PLAN_AUTHOR_PROVIDER_ID: 'copilot-cli',
      COMPANY_PLAN_AUTHOR_MODEL_ID: 'configured-research-model',
      COMPANY_PLAN_AUTHOR_PROMPT_POLICY_VERSION: 'company-plan-author/v1',
      COMPANY_PLAN_AUTHOR_SCHEMA_VERSION: 'company-authored-plan/v2',
      COMPANY_PLAN_AUTHOR_VALIDATOR_VERSION: 'company-plan-validator/v1'
    }
  });
}

function requireSuccess(result, label) {
  assert.equal(result.error, undefined,
    `${label}\nprocess error: ${result.error?.message}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.equal(result.status, 0, `${label}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  return result.stdout.trim();
}

function requireRefusal(result, label, code) {
  assert.equal(result.error, undefined,
    `${label}\nprocess error: ${result.error?.message}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.notEqual(result.status, 0, `${label} unexpectedly succeeded\nstdout:\n${result.stdout}`);
  const record = JSON.parse(result.stderr.trim());
  assert.equal(record.code, code, `${label}\nstderr:\n${result.stderr}`);
  return record;
}

function copyRelative(candidate, relativePath) {
  const destination = path.join(candidate, relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(path.join(ROOT, relativePath), destination);
}

function addCompanySource(toolsPath) {
  const document = JSON.parse(readFileSync(toolsPath, 'utf8'));
  assert.equal(document.tools.some((entry) => entry.id === 'company-intelligence-lab'), false,
    'the isolated Scope 01 checkout starts without public registration');
  const companySource = {
    id: 'company-intelligence-lab',
    briefing: {
      role: 'source',
      profile: 'live-market',
      readAdapter: 'company-intelligence-owner-v1',
      readContractVersion: 'tool-model-read/v1',
      freshnessPolicy: 'daily-market-bars-v1',
      recommendationPolicy: 'market-action-v1',
      budgetPolicy: 'live-market-v1'
    }
  };
  const after = document.tools.findIndex((entry) => entry.id === 'company-fundamentals-lab');
  assert.ok(after >= 0);
  document.tools.splice(after + 1, 0, companySource);
  writeFileSync(toolsPath, `${JSON.stringify(document, null, 2)}\n`);
}

function allFiles(root, relative = '') {
  const current = path.join(root, relative);
  const rows = [];
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (child === '.git' || child.startsWith('.git/')) continue;
    if (entry.isDirectory()) rows.push(...allFiles(root, child));
    else rows.push(child);
  }
  return rows.sort();
}

function checkoutByteInventory(root) {
  return allFiles(root).map((relativePath) => {
    const bytes = readFileSync(path.join(root, relativePath));
    return { path: relativePath, byteLength: bytes.length, sha256: sha(bytes) };
  });
}

function baselineByteInventory(entries) {
  return entries.map(({ path: relativePath, byteLength, sha256 }) => ({
    path: relativePath,
    byteLength,
    sha256
  }));
}

async function materializeBriefCandidate(candidateRoot, frozen, ownerRead) {
  const { buildPublishSet, validatePublishSet, validateRunIdentity, promotePublishSet } =
    await import('../scripts/brief-publication.mjs');
  const ownerBytes = Buffer.from(stableJson(ownerRead), 'utf8');
  const ownerReadRef = sha(ownerBytes);
  const bundleFingerprint = sha(Buffer.from(stableJson({
    generationId: frozen.generation.generationId,
    ownerReadFingerprint: ownerRead.fingerprint,
    orderedSourceToolIds: frozen.registry.orderedSourceToolIds
  }), 'utf8'));
  const runFingerprint = sha(Buffer.from(stableJson({
    generationId: frozen.generation.generationId,
    bundleFingerprint
  }), 'utf8'));
  const runId = `scope02-${frozen.generation.window}-${runFingerprint.slice(7, 19)}`;
  const tools = frozen.registry.orderedSourceToolIds.map((toolId) => ({
    toolId,
    outcome: 'newly-authored',
    read: toolId === 'company-intelligence-lab'
      ? ownerRead
      : {
          contractVersion: 'scope02-source-read/v1',
          toolId,
          generationId: frozen.generation.generationId,
          read: `${toolId} frozen source read`
        },
    brief: null
  }));
  const run = {
    runId,
    runFingerprint,
    etRunDate: frozen.generation.etSessionDate,
    window: frozen.generation.window,
    registry: {
      fingerprint: frozen.registry.registryFingerprint,
      orderedSourceToolIds: frozen.registry.orderedSourceToolIds.slice(),
      orderedParticipantIds: frozen.registry.orderedParticipantIds.slice()
    },
    evidence: {
      state: 'available',
      cutoffAt: frozen.generation.evidenceCutoff,
      body: {
        contractVersion: 'scope02-evidence/v1',
        generationId: frozen.generation.generationId
      }
    },
    tools,
    final: {
      body: {
        contractVersion: 'final-brief/v1',
        runId,
        toolBriefBundleRef: { fingerprint: bundleFingerprint, sourceCount: tools.length },
        companyPublication: {
          generationId: frozen.generation.generationId,
          ownerReadFingerprint: ownerRead.fingerprint,
          ownerReadRef
        }
      },
      coverage: { included: tools.length }
    },
    recommendationEvents: [],
    prior: null
  };
  const built = buildPublishSet(run);
  assert.equal(built.ok, true, built.ok ? '' : JSON.stringify(built.error));
  assert.equal(validatePublishSet(built.staging, { priorStreams: {}, sealedMonths: [] }).ok, true);
  assert.equal(validateRunIdentity(built.staging, { priorGeneration: 0 }).ok, true);
  const promoted = promotePublishSet(built.staging, candidateRoot);
  assert.equal(promoted.ok, true, promoted.ok ? '' : JSON.stringify(promoted.error));
  return { runId, runFingerprint, ownerReadRef };
}

async function createScope03TransactionFixture(sandbox, label) {
  const seed = path.join(sandbox, `${label}-seed`);
  const remote = path.join(sandbox, `${label}-remote.git`);
  const candidate = path.join(sandbox, `${label}-candidate`);
  const publication = path.join(sandbox, `${label}-publication`);
  const transaction = path.join(sandbox, `${label}-private-transaction`);
  mkdirSync(seed, { recursive: true });
  const fixtureFiles = [
    'rlcompanyintel.js',
    'rlcontracts.js',
    'rldata.js',
    'company-intelligence.config.json',
    'tools.json',
    'market-brief.snapshot.json',
    'market-brief.owner-reads.json',
    'scripts/company-intelligence-publication.mjs',
    'scripts/brief-author.mjs',
    'scripts/brief-publication.mjs',
    'scripts/recommendation-body.mjs',
    'data/company-intelligence/company-msft/events.json',
    'data/company-intelligence/company-msft/current.json',
    'data/company-intelligence/company-msft/versions/company-msft-2026-08-11.json'
  ];
  fixtureFiles.forEach((relativePath) => copyRelative(seed, relativePath));
  addCompanySource(path.join(seed, 'tools.json'));
  requireSuccess(run('git', ['init', '--initial-branch=main'], seed), `${label} seed init`);
  requireSuccess(run('git', ['config', 'user.email', 'scope03@example.invalid'], seed), `${label} seed email`);
  requireSuccess(run('git', ['config', 'user.name', 'Scope 03 Seed'], seed), `${label} seed name`);
  requireSuccess(run('git', ['add', '--', '.'], seed), `${label} seed add`);
  requireSuccess(run('git', ['commit', '-m', 'scope 03 prior acknowledged pair'], seed), `${label} seed commit`);
  requireSuccess(run('git', ['init', '--bare', '--initial-branch=main', remote], sandbox), `${label} remote init`);
  requireSuccess(run('git', ['remote', 'add', 'origin', remote], seed), `${label} seed remote`);
  requireSuccess(run('git', ['push', '-u', 'origin', 'main'], seed), `${label} seed push`);
  requireSuccess(run('git', ['clone', '--quiet', '--branch', 'main', remote, candidate], sandbox), `${label} candidate clone`);
  requireSuccess(run('git', ['clone', '--quiet', '--branch', 'main', remote, publication], sandbox), `${label} publication clone`);
  for (const root of [candidate, publication]) {
    requireSuccess(run('git', ['config', 'user.email', 'scope03@example.invalid'], root), `${label} checkout email`);
    requireSuccess(run('git', ['config', 'user.name', 'Scope 03 Transaction'], root), `${label} checkout name`);
  }
  const baseCommit = requireSuccess(run('git', ['rev-parse', 'HEAD'], candidate), `${label} base commit`);
  const PUB = await import(PUBLICATION_MODULE.href);
  const captured = PUB.captureCoupledTransactionBaseline({
    transactionDir: transaction,
    candidateRoot: candidate,
    publicationRoot: publication,
    remote: 'origin',
    branch: 'main'
  });
  assert.equal(captured.ok, true, captured.ok ? '' : JSON.stringify(captured.error));

  const triggerFile = path.join(sandbox, `${label}-trigger.json`);
  writeFileSync(triggerFile, `${JSON.stringify({
    contractVersion: 'company-publication-trigger/v1',
    trigger: 'scheduled',
    window: 'morning',
    generationKey: 'scheduled/2026-08-28/morning',
    requestedAt: '2026-08-28T13:59:00.000Z',
    frozenAt: '2026-08-28T14:00:00.000Z',
    evidenceCutoff: '2026-08-28T14:00:00.000Z',
    etSessionDate: '2026-08-28',
    sourceRevision: baseCommit
  }, null, 2)}\n`);
  const cli = path.join(candidate, 'scripts/company-intelligence-publication.mjs');
  const prepared = run(process.execPath, [
    cli,
    'prepare',
    '--transaction-dir', transaction,
    '--candidate-root', candidate,
    '--trigger-file', triggerFile
  ], candidate);
  assert.equal(JSON.parse(requireSuccess(prepared, `${label} prepare`)).ok, true);
  const request = JSON.parse(readFileSync(
    path.join(transaction, 'plan-requests/company-msft.json'),
    'utf8'
  ));
  const responseFile = path.join(sandbox, `${label}-plan-response.json`);
  writeFileSync(responseFile, `${JSON.stringify({
    contractVersion: 'company-plan-author-response/v1',
    requestFingerprint: request.requestFingerprint,
    plan: {
      contractVersion: 'company-authored-plan/v2',
      subjectId: request.subjectId,
      generationId: request.generationId,
      emptyReason: 'floor-was-sufficient',
      branches: []
    }
  }, null, 2)}\n`);
  const bound = run(process.execPath, [
    cli,
    'bind-plan',
    '--transaction-dir', transaction,
    '--response-file', responseFile
  ], candidate);
  assert.equal(JSON.parse(requireSuccess(bound, `${label} bind plan`)).ok, true);
  const frozen = JSON.parse(readFileSync(path.join(transaction, 'frozen-inputs.json'), 'utf8'));
  const ownerRead = JSON.parse(readFileSync(path.join(transaction, 'company-owner-read.json'), 'utf8'));
  await materializeBriefCandidate(candidate, frozen, ownerRead);
  const assembled = run(process.execPath, [
    cli,
    'assemble',
    '--transaction-dir', transaction,
    '--candidate-root', candidate
  ], candidate);
  assert.equal(JSON.parse(requireSuccess(assembled, `${label} assemble`)).ok, true);
  const plan = JSON.parse(readFileSync(path.join(transaction, 'publication-plan.json'), 'utf8'));
  return {
    PUB,
    baseCommit,
    candidate,
    cli,
    frozen,
    plan,
    publication,
    remote,
    transaction
  };
}

test('Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority', () => {
  const sourceStatusBefore = requireSuccess(
    run('git', ['status', '--porcelain=v1', '--untracked-files=all'], ROOT),
    'source checkout status before process E2E'
  );
  const sourcePointerPath = path.join(ROOT, 'data/company-intelligence/company-msft/current.json');
  const sourceBriefPath = path.join(ROOT, 'market-brief.snapshot.json');
  const sourcePointerBefore = readFileSync(sourcePointerPath);
  const sourceBriefBefore = readFileSync(sourceBriefPath);
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-e2e-'));
  const candidate = path.join(sandbox, 'candidate');
  const transaction = path.join(sandbox, 'private-transaction');
  mkdirSync(candidate, { recursive: true });
  try {
    [
      'rlcompanyintel.js',
      'rlcontracts.js',
      'rldata.js',
      'company-intelligence.config.json',
      'tools.json',
      'market-brief.snapshot.json',
      'market-brief.owner-reads.json',
      'scripts/company-intelligence-publication.mjs',
      'scripts/brief-author.mjs',
      'scripts/brief-publication.mjs',
      'scripts/recommendation-body.mjs',
      'data/company-intelligence/company-msft/events.json',
      'data/company-intelligence/company-msft/current.json',
      'data/company-intelligence/company-msft/versions/company-msft-2026-08-11.json'
    ].forEach((relativePath) => copyRelative(candidate, relativePath));
    addCompanySource(path.join(candidate, 'tools.json'));

    requireSuccess(run('git', ['init', '-b', 'main'], candidate), 'git init');
    requireSuccess(run('git', ['config', 'user.email', 'scope01@example.invalid'], candidate), 'git config email');
    requireSuccess(run('git', ['config', 'user.name', 'Scope 01 Test'], candidate), 'git config name');
    requireSuccess(run('git', ['add', '.'], candidate), 'git add');
    requireSuccess(run('git', ['commit', '-m', 'scope 01 candidate baseline'], candidate), 'git commit');

    const baselineHead = requireSuccess(run('git', ['rev-parse', 'HEAD'], candidate), 'git baseline head');
    const pointerBefore = readFileSync(path.join(candidate, 'data/company-intelligence/company-msft/current.json'));
    const snapshotBefore = readFileSync(path.join(candidate, 'market-brief.snapshot.json'));
    const baselineFiles = allFiles(candidate);
    assert.equal(requireSuccess(run('git', ['status', '--porcelain'], candidate), 'git clean baseline'), '');

    const triggerFile = path.join(sandbox, 'trigger.json');
    writeFileSync(triggerFile, `${JSON.stringify({
      contractVersion: 'company-publication-trigger/v1',
      trigger: 'scheduled',
      window: 'morning',
      generationKey: 'scheduled/2026-08-28/morning',
      requestedAt: '2026-08-28T13:59:00.000Z',
      frozenAt: '2026-08-28T14:00:00.000Z',
      evidenceCutoff: '2026-08-28T14:00:00.000Z',
      etSessionDate: '2026-08-28',
      sourceRevision: baselineHead
    }, null, 2)}\n`);

    const cli = path.join(candidate, 'scripts/company-intelligence-publication.mjs');
    const ownerReadsPath = path.join(candidate, 'market-brief.owner-reads.json');
    const ownerReadsBefore = readFileSync(ownerReadsPath);
    const ownerReads = JSON.parse(ownerReadsBefore.toString('utf8'));
    const msftOwners = Object.keys(ownerReads.ownerReads)
      .filter((toolId) => ownerReads.ownerReads[toolId]?.MSFT)
      .sort();
    assert.ok(msftOwners.length >= 2, 'the process fixture exposes independent missing and stale owner controls');

    const degradedOwnerReads = structuredClone(ownerReads);
    delete degradedOwnerReads.ownerReads[msftOwners[0]].MSFT;
    degradedOwnerReads.ownerReads[msftOwners[1]].MSFT = {
      ...degradedOwnerReads.ownerReads[msftOwners[1]].MSFT,
      state: 'stale',
      gapReason: 'The owner read exceeded its declared freshness window.'
    };
    writeFileSync(ownerReadsPath, `${JSON.stringify(degradedOwnerReads, null, 2)}\n`);
    const degradedTransaction = path.join(sandbox, 'degraded-transaction');
    const degraded = run(process.execPath, [
      cli,
      'prepare',
      '--transaction-dir', degradedTransaction,
      '--candidate-root', candidate,
      '--trigger-file', triggerFile
    ], candidate);
    const degradedOutput = JSON.parse(requireSuccess(degraded, 'prepare with missing and stale owner reads'));
    assert.equal(degradedOutput.ok, true);
    const degradedBase = JSON.parse(readFileSync(
      path.join(degradedTransaction, 'base-candidates', 'company-msft.json'),
      'utf8'
    ));
    assert.ok(degradedBase.dimensionReads.some((read) =>
      read.state === 'unavailable' && read.reasonCode === 'no-shared-read'));
    assert.ok(degradedBase.dimensionReads.some((read) =>
      read.state === 'stale' && read.reasonCode === 'read-aged-past-window'));
    assert.ok(degradedBase.horizons.some((horizon) =>
      horizon.gapEffect.includes('did not reach this read')));
    rmSync(degradedTransaction, { recursive: true, force: true });

    const lateOwnerReads = structuredClone(ownerReads);
    lateOwnerReads.ownerReads[msftOwners[0]].MSFT = {
      ...lateOwnerReads.ownerReads[msftOwners[0]].MSFT,
      state: 'current',
      asOf: '2026-08-28T14:00:00.001Z'
    };
    writeFileSync(ownerReadsPath, `${JSON.stringify(lateOwnerReads, null, 2)}\n`);
    const lateTransaction = path.join(sandbox, 'late-transaction');
    const late = run(process.execPath, [
      cli,
      'prepare',
      '--transaction-dir', lateTransaction,
      '--candidate-root', candidate,
      '--trigger-file', triggerFile
    ], candidate);
    const lateRefusal = requireRefusal(late, 'prepare with post-cutoff owner read', 'C028-EVIDENCE-CUTOFF');
    assert.match(lateRefusal.field, /^sources\.owner:/);
    rmSync(lateTransaction, { recursive: true, force: true });

    writeFileSync(ownerReadsPath, ownerReadsBefore);
    assert.deepEqual(readFileSync(ownerReadsPath), ownerReadsBefore,
      'the process controls restore the committed owner-read fixture byte-for-byte');

    const prepared = run(process.execPath, [
      cli,
      'prepare',
      '--transaction-dir', transaction,
      '--candidate-root', candidate,
      '--trigger-file', triggerFile
    ], candidate);
    const preparedOutput = JSON.parse(requireSuccess(prepared, 'prepare'));
    assert.equal(preparedOutput.ok, true);
    assert.equal(preparedOutput.command, 'prepare');
    assert.equal(preparedOutput.coveredSubjectCount, 1);

    const requestPath = path.join(transaction, 'plan-requests', 'company-msft.json');
    const request = JSON.parse(readFileSync(requestPath, 'utf8'));
    assert.equal(request.contractVersion, 'company-plan-author-request/v1');
    assert.ok(request.sourceCatalogue.length > 0);
    assert.equal(request.horizons.length, 4);
    const responseFile = path.join(sandbox, 'plan-response.json');
    const response = {
      contractVersion: 'company-plan-author-response/v1',
      requestFingerprint: request.requestFingerprint,
      plan: {
        contractVersion: 'company-authored-plan/v2',
        subjectId: request.subjectId,
        generationId: request.generationId,
        emptyReason: null,
        branches: [{
          question: 'Does the frozen source change the immediate evidence state?',
          relevance: {
            horizonId: request.horizons[0].horizonId,
            targetIds: [request.horizons[0].targetIds[0]]
          },
          consultedSourceIds: [request.sourceCatalogue[0].sourceId],
          result: 'The named source confirms the bounded horizon evidence already present.',
          disposition: 'confirmed',
          changedTargets: [],
          refusalReason: null,
          stopCondition: 'Stop after the named frozen source answers the question.',
          stoppedBy: 'question-answered'
        }]
      }
    };
    writeFileSync(responseFile, `${JSON.stringify(response, null, 2)}\n`);

    const unsignedResponseFile = path.join(sandbox, 'unsigned-plan-response.json');
    const unsignedResponse = structuredClone(response);
    delete unsignedResponse.requestFingerprint;
    writeFileSync(unsignedResponseFile, `${JSON.stringify(unsignedResponse, null, 2)}\n`);
    const refusedPlan = run(process.execPath, [
      cli,
      'bind-plan',
      '--transaction-dir', transaction,
      '--response-file', unsignedResponseFile
    ], candidate);
    requireRefusal(refusedPlan, 'bind-plan with unsigned response', 'C028-PLAN-AUTHOR');
    const afterRefusedPlan = allFiles(transaction);
    assert.equal(afterRefusedPlan.some((relativePath) =>
      relativePath.startsWith('plans/') || relativePath.startsWith('versions/') ||
      relativePath === 'company-owner-read.json'), false,
    'an unsigned plan creates no plan, version, or owner-read candidate');

    const bound = run(process.execPath, [
      cli,
      'bind-plan',
      '--transaction-dir', transaction,
      '--response-file', responseFile
    ], candidate);
    const boundOutput = JSON.parse(requireSuccess(bound, 'bind-plan'));
    assert.equal(boundOutput.ok, true);
    assert.equal(boundOutput.command, 'bind-plan');
    assert.equal(boundOutput.candidateVersionCount, 1);

    const injected = run(process.execPath, [
      cli,
      'inject-owner-read',
      '--transaction-dir', transaction,
      '--snapshot-file', path.join(candidate, 'market-brief.snapshot.json')
    ], candidate);
    const injectedOutput = JSON.parse(requireSuccess(injected, 'inject-owner-read'));
    assert.equal(injectedOutput.ok, true);
    assert.equal(injectedOutput.command, 'inject-owner-read');
    const candidateSnapshot = JSON.parse(readFileSync(path.join(transaction, 'candidate-snapshot.json'), 'utf8'));
    const ownerRead = candidateSnapshot.toolReads['company-intelligence-lab'];
    assert.equal(ownerRead.contractVersion, 'tool-model-read/v1');
    assert.equal(ownerRead.toolId, 'company-intelligence-lab');
    assert.equal(ownerRead.subjects.length, 1);
    assert.equal(ownerRead.recommendationEligibility.eligible, false);
    assert.deepEqual(ownerRead.recommendationEligibility.permittedActionFamilies, []);

    assert.equal(requireSuccess(run('git', ['status', '--porcelain'], candidate), 'git clean after CLI'), '');
    assert.equal(requireSuccess(run('git', ['rev-parse', 'HEAD'], candidate), 'git head after CLI'), baselineHead);
    assert.deepEqual(readFileSync(path.join(candidate, 'data/company-intelligence/company-msft/current.json')), pointerBefore);
    assert.deepEqual(readFileSync(path.join(candidate, 'market-brief.snapshot.json')), snapshotBefore);
    assert.deepEqual(allFiles(candidate), baselineFiles);

    const forbidden = run(process.execPath, [
      cli,
      'promote',
      '--transaction-dir', transaction,
      '--candidate-root', candidate
    ], candidate);
    assert.notEqual(forbidden.status, 0, 'Scope 01 exposes no promotion command');
    assert.match(forbidden.stderr, /C028-TRIGGER/);
    assert.equal(requireSuccess(run('git', ['status', '--porcelain'], candidate), 'git clean after refused promotion'), '');

    const transactionFiles = allFiles(transaction);
    assert.ok(transactionFiles.includes('frozen-inputs.json'));
    assert.ok(transactionFiles.includes('versions/company-msft.json'));
    assert.ok(transactionFiles.includes('company-owner-read.json'));
    assert.ok(transactionFiles.includes('candidate-snapshot.json'));
    assert.equal(transactionFiles.some((relativePath) =>
      relativePath.endsWith('/current.json') || relativePath === 'publication-current.json'), false,
    'the private Scope 01 transaction contains no authoritative current selector');

    assert.equal(
      requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], ROOT),
        'source checkout status after process E2E'),
      sourceStatusBefore,
      'the production CLI process E2E leaves the source checkout byte inventory unchanged'
    );
    assert.deepEqual(readFileSync(sourcePointerPath), sourcePointerBefore,
      'the production CLI process E2E leaves the source company pointer unchanged');
    assert.deepEqual(readFileSync(sourceBriefPath), sourceBriefBefore,
      'the production CLI process E2E leaves the source brief unchanged');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions', async () => {
  const sourceStatusBefore = requireSuccess(
    run('git', ['status', '--porcelain=v1', '--untracked-files=all'], ROOT),
    'source checkout status before Scope 02 process E2E'
  );
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scope02-e2e-'));
  const candidate = path.join(sandbox, 'candidate');
  const publication = path.join(sandbox, 'publication');
  const transaction = path.join(sandbox, 'private-transaction');
  mkdirSync(candidate, { recursive: true });
  mkdirSync(publication, { recursive: true });
  const fixtureFiles = [
    'rlcompanyintel.js',
    'rlcontracts.js',
    'rldata.js',
    'company-intelligence.config.json',
    'tools.json',
    'market-brief.snapshot.json',
    'market-brief.owner-reads.json',
    'scripts/company-intelligence-publication.mjs',
    'scripts/brief-author.mjs',
    'scripts/brief-publication.mjs',
    'scripts/recommendation-body.mjs',
    'data/company-intelligence/company-msft/events.json',
    'data/company-intelligence/company-msft/current.json',
    'data/company-intelligence/company-msft/versions/company-msft-2026-08-11.json'
  ];
  try {
    fixtureFiles.forEach((relativePath) => copyRelative(candidate, relativePath));
    [
      'rlcompanyintel.js',
      'rlcontracts.js',
      'company-intelligence.config.json',
      'tools.json',
      'data/company-intelligence/company-msft/current.json',
      'data/company-intelligence/company-msft/versions/company-msft-2026-08-11.json'
    ].forEach((relativePath) => copyRelative(publication, relativePath));
    addCompanySource(path.join(candidate, 'tools.json'));
    addCompanySource(path.join(publication, 'tools.json'));

    requireSuccess(run('git', ['init', '-b', 'main'], publication), 'publication git init');
    requireSuccess(run('git', ['config', 'user.email', 'scope02@example.invalid'], publication), 'publication git config email');
    requireSuccess(run('git', ['config', 'user.name', 'Scope 02 Test'], publication), 'publication git config name');
    requireSuccess(run('git', ['add', '.'], publication), 'publication git add baseline');
    requireSuccess(run('git', ['commit', '-m', 'scope 02 publication baseline'], publication), 'publication git commit baseline');
    const baselineHead = requireSuccess(run('git', ['rev-parse', 'HEAD'], publication), 'publication baseline head');
    assert.equal(requireSuccess(run('git', ['status', '--porcelain'], publication), 'publication clean baseline'), '');

    const triggerFile = path.join(sandbox, 'trigger.json');
    writeFileSync(triggerFile, `${JSON.stringify({
      contractVersion: 'company-publication-trigger/v1',
      trigger: 'scheduled',
      window: 'morning',
      generationKey: 'scheduled/2026-08-28/morning',
      requestedAt: '2026-08-28T13:59:00.000Z',
      frozenAt: '2026-08-28T14:00:00.000Z',
      evidenceCutoff: '2026-08-28T14:00:00.000Z',
      etSessionDate: '2026-08-28',
      sourceRevision: baselineHead
    }, null, 2)}\n`);
    const cli = path.join(candidate, 'scripts/company-intelligence-publication.mjs');
    const prepared = run(process.execPath, [
      cli,
      'prepare',
      '--transaction-dir', transaction,
      '--candidate-root', candidate,
      '--trigger-file', triggerFile
    ], candidate);
    const preparedOutput = JSON.parse(requireSuccess(prepared, 'Scope 02 prepare'));
    assert.equal(preparedOutput.ok, true);

    const request = JSON.parse(readFileSync(
      path.join(transaction, 'plan-requests/company-msft.json'),
      'utf8'
    ));
    const responseFile = path.join(sandbox, 'plan-response.json');
    writeFileSync(responseFile, `${JSON.stringify({
      contractVersion: 'company-plan-author-response/v1',
      requestFingerprint: request.requestFingerprint,
      plan: {
        contractVersion: 'company-authored-plan/v2',
        subjectId: request.subjectId,
        generationId: request.generationId,
        emptyReason: 'floor-was-sufficient',
        branches: []
      }
    }, null, 2)}\n`);
    const bound = run(process.execPath, [
      cli,
      'bind-plan',
      '--transaction-dir', transaction,
      '--response-file', responseFile
    ], candidate);
    assert.equal(JSON.parse(requireSuccess(bound, 'Scope 02 bind-plan')).ok, true);
    const frozen = JSON.parse(readFileSync(path.join(transaction, 'frozen-inputs.json'), 'utf8'));
    const ownerRead = JSON.parse(readFileSync(path.join(transaction, 'company-owner-read.json'), 'utf8'));
    const brief = await materializeBriefCandidate(candidate, frozen, ownerRead);

    const beforeAssembly = run(process.execPath, [
      cli,
      'promote',
      '--transaction-dir', transaction,
      '--publication-root', publication
    ], candidate);
    requireRefusal(beforeAssembly, 'promote before coupled assembly', 'C028-STAGE');
    assert.equal(requireSuccess(run('git', ['status', '--porcelain'], publication), 'publication unchanged after premature promote'), '');

    const assembled = run(process.execPath, [
      cli,
      'assemble',
      '--transaction-dir', transaction,
      '--candidate-root', candidate
    ], candidate);
    const assembledOutput = JSON.parse(requireSuccess(assembled, 'Scope 02 assemble'));
    assert.equal(assembledOutput.ok, true);
    assert.equal(assembledOutput.generationId, frozen.generation.generationId);
    assert.equal(assembledOutput.briefRunId, brief.runId);

    const PUB = await import(PUBLICATION_MODULE.href);
    const initialState = PUB.createCoupledState('11111111-1111-4111-8111-111111111111');
    assert.equal(initialState.ok, true);
    let state = initialState.value;
    assert.equal(PUB.advanceCoupledState(state, 'inputs-frozen').ok, false,
      'a skipped phase is structurally refused');
    assert.equal(PUB.advanceCoupledState(state, 'initialized').ok, false,
      'a repeated phase is structurally refused');
    assert.equal(PUB.advanceCoupledState(state, 'not-a-phase').ok, false,
      'an unknown phase is structurally refused');
    const firstAdvance = PUB.advanceCoupledState(state, PUB.COUPLED_PUBLICATION_PHASES[1]);
    assert.equal(firstAdvance.ok, true);
    const tamperedHistory = {
      ...firstAdvance.value,
      history: ['not-initialized', PUB.COUPLED_PUBLICATION_PHASES[1]]
    };
    assert.equal(PUB.advanceCoupledState(tamperedHistory, PUB.COUPLED_PUBLICATION_PHASES[2]).ok, false,
      'a state carrying a forged phase-history prefix is structurally refused');
    state = firstAdvance.value;
    for (const phase of PUB.COUPLED_PUBLICATION_PHASES.slice(2)) {
      const advanced = PUB.advanceCoupledState(state, phase);
      assert.equal(advanced.ok, true, `legal coupled transition to ${phase}`);
      state = advanced.value;
    }
    assert.equal(PUB.advanceCoupledState(state, 'committed').ok, false,
      'a backward transition is structurally refused');

    const promoted = run(process.execPath, [
      cli,
      'promote',
      '--transaction-dir', transaction,
      '--publication-root', publication
    ], candidate);
    const promotedOutput = JSON.parse(requireSuccess(promoted, 'Scope 02 promote'));
    assert.equal(promotedOutput.ok, true);
    assert.equal(promotedOutput.writeOrder.at(-1), 'data/company-intelligence/publication-current.json');
    assert.equal(promotedOutput.staged.includes('data/company-intelligence/publication-current.json'), true);

    const validated = run(process.execPath, [
      cli,
      'validate',
      '--publication-root', publication,
      '--generation-id', frozen.generation.generationId
    ], candidate);
    const validatedOutput = JSON.parse(requireSuccess(validated, 'Scope 02 validate'));
    assert.equal(validatedOutput.ok, true);
    assert.equal(validatedOutput.generationId, frozen.generation.generationId);
    assert.equal(validatedOutput.briefRunId, brief.runId);
    const staged = requireSuccess(run('git', ['diff', '--cached', '--name-only'], publication), 'publication staged inventory')
      .split('\n').filter(Boolean);
    assert.deepEqual(staged, promotedOutput.staged);
    assert.equal(staged.includes('data/company-intelligence/publication-current.json'), true);
    for (const [relativePath, expectedHash] of Object.entries(promotedOutput.stagedHashes)) {
      const indexed = run('git', ['show', `:${relativePath}`], publication);
      requireSuccess(indexed, `read staged bytes for ${relativePath}`);
      assert.equal(sha(Buffer.from(indexed.stdout, 'utf8')), expectedHash,
        `the reported staged hash comes from the actual Git index bytes for ${relativePath}`);
    }
    assert.equal(requireSuccess(run('git', ['rev-parse', 'HEAD'], publication), 'publication head remains baseline'), baselineHead,
      'Scope 02 stages but does not start Scope 03 commit or restoration behavior');
    assert.equal(
      requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], ROOT),
        'source checkout status after Scope 02 process E2E'),
      sourceStatusBefore,
      'the Scope 02 process E2E leaves the source checkout byte inventory unchanged'
    );
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical', async () => {
  const sourceStatusBefore = requireSuccess(
    run('git', ['status', '--porcelain=v1', '--untracked-files=all'], ROOT),
    'source checkout status before Scope 03 dry run'
  );
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scope03-dry-run-'));
  try {
    const fixture = await createScope03TransactionFixture(sandbox, 'dry-run');
    const transactionBaseline = JSON.parse(readFileSync(
      path.join(fixture.transaction, 'transaction-baseline.json'),
      'utf8'
    ));
    const remoteBefore = requireSuccess(
      run('git', ['ls-remote', '--heads', 'origin', 'refs/heads/main'], fixture.publication),
      'dry-run remote before'
    );
    const result = fixture.PUB.completeCoupledDryRun({
      transactionDir: fixture.transaction,
      candidateRoot: fixture.candidate,
      publicationRoot: fixture.publication
    });
    assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.error));
    assert.equal(result.value.state, 'dry-run-complete');
    assert.equal(result.value.coherenceVerified, true);
    assert.equal(result.value.authoritative, false);
    assert.equal(result.value.generationId, fixture.frozen.generation.generationId);
    assert.equal(requireSuccess(run('git', ['rev-parse', 'HEAD'], fixture.candidate), 'dry-run candidate HEAD'), fixture.baseCommit);
    assert.equal(requireSuccess(run('git', ['rev-parse', 'HEAD'], fixture.publication), 'dry-run publication HEAD'), fixture.baseCommit);
    assert.equal(requireSuccess(run('git', ['write-tree'], fixture.candidate), 'dry-run candidate index'),
      transactionBaseline.candidate.indexTree);
    assert.equal(requireSuccess(run('git', ['write-tree'], fixture.publication), 'dry-run publication index'),
      transactionBaseline.publication.indexTree);
    assert.equal(requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], fixture.candidate), 'dry-run candidate clean'), '');
    assert.equal(requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], fixture.publication), 'dry-run publication clean'), '');
    assert.deepEqual(
      checkoutByteInventory(fixture.candidate),
      baselineByteInventory(transactionBaseline.candidate.entries),
      'the candidate checkout restores every captured path, byte length, and SHA-256'
    );
    assert.deepEqual(
      checkoutByteInventory(fixture.publication),
      baselineByteInventory(transactionBaseline.publication.entries),
      'the publication checkout restores every captured path, byte length, and SHA-256'
    );
    assert.equal(
      existsSync(path.join(fixture.publication, fixture.plan.companyVersionPaths[0])),
      false,
      'the coherent private dry-run version never becomes a published checkout version'
    );
    if (process.env.SCOPE03_DRY_RUN_NEGATIVE_CONTROL === 'retain-private-checkpoint') {
      mkdirSync(fixture.transaction, { recursive: true });
      writeFileSync(path.join(fixture.transaction, 'leaked-checkpoint.json'), '{}\n');
    }
    assert.equal(existsSync(fixture.transaction), false,
      'a completed dry run removes every private transaction checkpoint and journal');
    assert.equal(
      requireSuccess(run('git', ['ls-remote', '--heads', 'origin', 'refs/heads/main'], fixture.publication), 'dry-run remote after'),
      remoteBefore,
      'the bare remote ref remains byte-identical'
    );
    assert.equal(
      requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], ROOT),
        'source checkout status after Scope 03 dry run'),
      sourceStatusBefore,
      'the dry run leaves the current Scope 02-certified checkout unchanged'
    );
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('Regression E2E: SCN-028-017 one failed subject advances no covered pointer or brief', async () => {
  const sourceStatusBefore = requireSuccess(
    run('git', ['status', '--porcelain=v1', '--untracked-files=all'], ROOT),
    'source checkout status before Scope 03 covered-set process E2E'
  );
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scope03-covered-set-'));
  try {
    const fixture = await createScope03TransactionFixture(sandbox, 'covered-set');
    const restored = fixture.PUB.abortCoupledTransaction({
      transactionDir: fixture.transaction,
      candidateRoot: fixture.candidate,
      publicationRoot: fixture.publication,
      failure: {
        contractVersion: 'company-publication-error/v1',
        code: 'C028-COMPANY-CANDIDATE',
        phase: 'company-candidates-validated',
        reason: 'Reset the successful fixture before the covered-set process probe.',
        field: 'company:msft',
        causeCode: 'fixture-reset'
      }
    });
    assert.equal(restored.ok, true, restored.ok ? '' : JSON.stringify(restored.error));
    rmSync(fixture.transaction, { recursive: true, force: true });

    const configPath = path.join(fixture.candidate, 'company-intelligence.config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    config.publication.coveredSubjects.push({
      subjectId: 'company:test',
      ticker: 'TEST',
      cik: '0000000002',
      displayName: 'Synthetic process-only subject'
    });
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
    const failedEventsPath = path.join(
      fixture.candidate,
      'data/company-intelligence/company-test/events.json'
    );
    mkdirSync(path.dirname(failedEventsPath), { recursive: true });
    writeFileSync(failedEventsPath, `${JSON.stringify({
      contractVersion: 'company-events/v1',
      subjectId: 'company:test',
      asOf: '2026-08-28T14:00:00.001Z',
      events: []
    }, null, 2)}\n`);

    const transactionDir = path.join(sandbox, 'covered-set-failed-transaction');
    const triggerFile = path.join(sandbox, 'covered-set-trigger.json');
    const candidateBefore = checkoutByteInventory(fixture.candidate);
    const publicationBefore = checkoutByteInventory(fixture.publication);
    const candidateIndexBefore = requireSuccess(
      run('git', ['write-tree'], fixture.candidate),
      'covered-set candidate index before failed prepare'
    );
    const publicationIndexBefore = requireSuccess(
      run('git', ['write-tree'], fixture.publication),
      'covered-set publication index before failed prepare'
    );
    const remoteBefore = requireSuccess(
      run('git', ['ls-remote', '--heads', 'origin', 'refs/heads/main'], fixture.publication),
      'covered-set remote before failed prepare'
    );
    const failedPrepare = run(process.execPath, [
      fixture.cli,
      'prepare',
      '--transaction-dir', transactionDir,
      '--candidate-root', fixture.candidate,
      '--trigger-file', triggerFile
    ], fixture.candidate);
    const refusal = requireRefusal(
      failedPrepare,
      'covered-set prepare with failed synthetic subject',
      'C028-EVIDENCE-CUTOFF'
    );
    assert.equal(refusal.phase, 'input-freeze');
    assert.match(refusal.field, /company:test/,
      'the process refusal field identifies the failed covered subject by name');
    assert.match(refusal.reason, /company:test/,
      'the process refusal reason identifies the failed covered subject by name');

    if (process.env.SCOPE03_COVERED_SET_PROCESS_NEGATIVE_CONTROL === 'advance-failed-subject') {
      const forbiddenPointer = path.join(
        fixture.candidate,
        'data/company-intelligence/company-test/current.json'
      );
      writeFileSync(forbiddenPointer, '{"generationId":"forbidden","versionId":"forbidden"}\n');
    }

    assert.equal(existsSync(path.join(fixture.candidate,
      'data/company-intelligence/company-test/current.json')), false,
    'the failed synthetic subject advances no current pointer');
    assert.deepEqual(checkoutByteInventory(fixture.candidate), candidateBefore,
      'the failed covered set changes no candidate pointer or brief byte');
    assert.deepEqual(checkoutByteInventory(fixture.publication), publicationBefore,
      'the failed covered set changes no publication pointer or brief byte');
    assert.equal(existsSync(path.join(transactionDir, 'frozen-inputs.json')), false,
      'the failed subject creates no frozen generation candidate');
    assert.equal(
      requireSuccess(run('git', ['rev-parse', 'HEAD'], fixture.candidate), 'covered-set candidate HEAD'),
      fixture.baseCommit
    );
    assert.equal(
      requireSuccess(run('git', ['rev-parse', 'HEAD'], fixture.publication), 'covered-set publication HEAD'),
      fixture.baseCommit
    );
    assert.equal(
      requireSuccess(run('git', ['write-tree'], fixture.candidate), 'covered-set candidate index after refusal'),
      candidateIndexBefore
    );
    assert.equal(
      requireSuccess(run('git', ['write-tree'], fixture.publication), 'covered-set publication index after refusal'),
      publicationIndexBefore
    );
    assert.equal(
      requireSuccess(run('git', ['ls-remote', '--heads', 'origin', 'refs/heads/main'], fixture.publication),
        'covered-set remote after failed prepare'),
      remoteBefore
    );
    const sourcePolicy = JSON.parse(readFileSync(
      path.join(ROOT, 'company-intelligence.config.json'),
      'utf8'
    ));
    assert.deepEqual(
      sourcePolicy.publication.coveredSubjects.map((subject) => subject.subjectId),
      ['company:msft'],
      'the synthetic second subject exists only inside the isolated test fixture'
    );
    assert.equal(
      requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], ROOT),
        'source checkout status after Scope 03 covered-set process E2E'),
      sourceStatusBefore,
      'the covered-set process E2E leaves the current checkout unchanged'
    );
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit', async () => {
  const sourceStatusBefore = requireSuccess(
    run('git', ['status', '--porcelain=v1', '--untracked-files=all'], ROOT),
    'source checkout status before Scope 03 fault matrix'
  );
  const sandbox = mkdtempSync(path.join(tmpdir(), 'company-publication-scope03-faults-'));
  try {
    const fixture = await createScope03TransactionFixture(sandbox, 'faults');
    const promoted = run(process.execPath, [
      fixture.cli,
      'promote',
      '--transaction-dir', fixture.transaction,
      '--publication-root', fixture.publication
    ], fixture.candidate);
    assert.equal(JSON.parse(requireSuccess(promoted, 'Scope 03 fault promotion')).ok, true);
    const validated = run(process.execPath, [
      fixture.cli,
      'validate',
      '--publication-root', fixture.publication,
      '--generation-id', fixture.frozen.generation.generationId
    ], fixture.candidate);
    assert.equal(JSON.parse(requireSuccess(validated, 'Scope 03 fault validation')).ok, true);

    const preCommitHook = path.join(fixture.publication, '.git/hooks/pre-commit');
    writeFileSync(preCommitHook, '#!/usr/bin/env bash\nexit 41\n');
    chmodSync(preCommitHook, 0o755);
    const refusedCommit = fixture.PUB.commitCoupledTransaction({
      transactionDir: fixture.transaction,
      candidateRoot: fixture.candidate,
      publicationRoot: fixture.publication,
      subject: 'company-brief: scope 03 exact transaction'
    });
    assert.equal(refusedCommit.ok, false, 'the real pre-commit hook refuses the transaction commit');
    assert.equal(refusedCommit.error.code, 'C028-COMMIT');
    assert.equal(refusedCommit.restoration.state, 'aborted-pre-commit');
    assert.equal(requireSuccess(run('git', ['rev-parse', 'HEAD'], fixture.publication), 'commit-failure HEAD'), fixture.baseCommit);
    assert.equal(requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], fixture.publication), 'commit-failure publication clean'), '');
    assert.equal(requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], fixture.candidate), 'commit-failure candidate clean'), '');
    rmSync(preCommitHook, { force: true });

    const retriedPromotion = run(process.execPath, [
      fixture.cli,
      'promote',
      '--transaction-dir', fixture.transaction,
      '--publication-root', fixture.publication
    ], fixture.candidate);
    assert.equal(JSON.parse(requireSuccess(retriedPromotion, 'Scope 03 exact retry promotion')).ok, true);
    const committed = fixture.PUB.commitCoupledTransaction({
      transactionDir: fixture.transaction,
      candidateRoot: fixture.candidate,
      publicationRoot: fixture.publication,
      subject: 'company-brief: scope 03 exact transaction'
    });
    assert.equal(committed.ok, true, committed.ok ? '' : JSON.stringify(committed.error));
    const exactCommit = committed.value.commit;
    const commitCount = requireSuccess(run('git', ['rev-list', '--count', 'HEAD'], fixture.publication), 'commit count after exact commit');
    const commitBody = requireSuccess(run('git', ['show', '-s', '--format=%B', exactCommit], fixture.publication), 'exact commit body');
    assert.match(commitBody, new RegExp(`Company-Brief-Generation-Id: ${fixture.frozen.generation.generationId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    assert.match(commitBody, /Company-Brief-Manifest-SHA256: sha256:[a-f0-9]{64}/);

    const preReceiveHook = path.join(fixture.remote, 'hooks/pre-receive');
    writeFileSync(preReceiveHook, '#!/usr/bin/env bash\nexit 42\n');
    chmodSync(preReceiveHook, 0o755);
    const rejectedPush = fixture.PUB.pushCoupledTransaction({
      transactionDir: fixture.transaction,
      candidateRoot: fixture.candidate,
      publicationRoot: fixture.publication,
      remote: 'origin',
      branch: 'main',
      acknowledgmentFile: path.join(sandbox, 'private-ack.json')
    });
    assert.equal(rejectedPush.ok, true, rejectedPush.ok ? '' : JSON.stringify(rejectedPush.error));
    assert.equal(rejectedPush.value.state, 'committed-pending-remote');
    assert.equal(rejectedPush.value.commit, exactCommit);
    const pendingAttempt = fixture.PUB.buildAttemptRecord({
      attemptId: '35353535-3535-4535-8535-353535353535',
      generationId: fixture.frozen.generation.generationId,
      trigger: 'scheduled',
      window: 'morning',
      state: 'committed-pending-remote',
      phase: 'committed',
      startedAt: '2026-08-28T13:59:00.000Z',
      finishedAt: '2026-08-28T14:00:00.000Z',
      failure: null,
      authoritativeGenerationId: 'prior-generation'
    });
    assert.equal(pendingAttempt.ok, true, pendingAttempt.ok ? '' : JSON.stringify(pendingAttempt.error));
    assert.equal(pendingAttempt.value.authoritativeUnchanged, true);
    assert.equal(Object.hasOwn(pendingAttempt.value, 'pairAuthority'), false);
    assert.equal(requireSuccess(run('git', ['rev-parse', 'HEAD'], fixture.publication), 'push failure preserves HEAD'), exactCommit);
    assert.equal(requireSuccess(run('git', ['rev-list', '--count', 'HEAD'], fixture.publication), 'push failure commit count'), commitCount);

    rmSync(preReceiveHook, { force: true });
    const blockedAckParent = path.join(sandbox, 'ack-parent-is-file');
    writeFileSync(blockedAckParent, 'not a directory\n');
    const acknowledgedWithoutReceipt = fixture.PUB.pushCoupledTransaction({
      transactionDir: fixture.transaction,
      candidateRoot: fixture.candidate,
      publicationRoot: fixture.publication,
      remote: 'origin',
      branch: 'main',
      acknowledgmentFile: path.join(blockedAckParent, 'private-ack.json')
    });
    assert.equal(acknowledgedWithoutReceipt.ok, true,
      acknowledgedWithoutReceipt.ok ? '' : JSON.stringify(acknowledgedWithoutReceipt.error));
    assert.equal(acknowledgedWithoutReceipt.value.state, 'acknowledged');
    assert.equal(acknowledgedWithoutReceipt.value.commit, exactCommit);
    assert.equal(acknowledgedWithoutReceipt.value.remoteReachable, true);
    assert.equal(acknowledgedWithoutReceipt.value.acknowledgmentPersisted, false,
      'private receipt failure cannot revoke verified remote authority');
    assert.equal(requireSuccess(run('git', ['rev-list', '--count', 'HEAD'], fixture.publication), 'ack failure commit count'), commitCount,
      'an acknowledgment retry creates no replacement commit');

    rmSync(blockedAckParent, { force: true });
    const recoveredAckFile = path.join(blockedAckParent, 'private-ack.json');
    const recoveredAcknowledgment = fixture.PUB.pushCoupledTransaction({
      transactionDir: fixture.transaction,
      candidateRoot: fixture.candidate,
      publicationRoot: fixture.publication,
      remote: 'origin',
      branch: 'main',
      acknowledgmentFile: recoveredAckFile
    });
    assert.equal(recoveredAcknowledgment.ok, true,
      recoveredAcknowledgment.ok ? '' : JSON.stringify(recoveredAcknowledgment.error));
    assert.equal(recoveredAcknowledgment.value.state, 'acknowledged');
    assert.equal(recoveredAcknowledgment.value.commit, exactCommit);
    assert.equal(recoveredAcknowledgment.value.pushAttempted, false,
      'acknowledgment reconstruction verifies ancestry without pushing or recreating the generation');
    assert.equal(recoveredAcknowledgment.value.acknowledgmentPersisted, true);
    const recoveredAck = JSON.parse(readFileSync(recoveredAckFile, 'utf8'));
    assert.equal(recoveredAck.commit, exactCommit);
    assert.equal(recoveredAck.generationId, fixture.frozen.generation.generationId);
    assert.equal(requireSuccess(run('git', ['rev-list', '--count', 'HEAD'], fixture.publication),
      'ack reconstruction commit count'), commitCount);

    const understagedSandbox = path.join(sandbox, 'understaged');
    mkdirSync(understagedSandbox);
    const understaged = await createScope03TransactionFixture(understagedSandbox, 'understaged');
    const understagedPromotion = run(process.execPath, [
      understaged.cli,
      'promote',
      '--transaction-dir', understaged.transaction,
      '--publication-root', understaged.publication
    ], understaged.candidate);
    assert.equal(JSON.parse(requireSuccess(understagedPromotion, 'understaged promotion')).ok, true);
    if (process.env.SCOPE03_INDEX_NEGATIVE_CONTROL !== 'retain-complete-index') {
      requireSuccess(run('git', [
        'reset', 'HEAD', '--', 'data/company-intelligence/publication-current.json'
      ], understaged.publication), 'remove the coupled selector from the exact staged inventory');
    }
    const incompleteCommit = understaged.PUB.commitCoupledTransaction({
      transactionDir: understaged.transaction,
      candidateRoot: understaged.candidate,
      publicationRoot: understaged.publication,
      subject: 'company-brief: incomplete staged inventory must refuse'
    });
    assert.equal(incompleteCommit.ok, false,
      'the commit boundary refuses when one declared authoritative pointer is absent from the index');
    assert.equal(incompleteCommit.error.code, 'C028-COMMIT');
    assert.equal(incompleteCommit.restoration.state, 'aborted-pre-commit');
    assert.equal(requireSuccess(run('git', ['rev-parse', 'HEAD'], understaged.publication),
      'understaged refusal HEAD'), understaged.baseCommit);
    assert.equal(requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'],
      understaged.publication), 'understaged refusal publication clean'), '');
    assert.equal(requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'],
      understaged.candidate), 'understaged refusal candidate clean'), '');
    assert.equal(existsSync(path.join(understaged.transaction, 'transaction-journal.json')), false,
      'a refused incomplete index creates no exact-commit journal');

    const unknownSandbox = path.join(sandbox, 'unknown');
    mkdirSync(unknownSandbox);
    const unknown = await createScope03TransactionFixture(unknownSandbox, 'unknown');
    const unknownPromotion = run(process.execPath, [
      unknown.cli,
      'promote',
      '--transaction-dir', unknown.transaction,
      '--publication-root', unknown.publication
    ], unknown.candidate);
    assert.equal(JSON.parse(requireSuccess(unknownPromotion, 'unknown promotion')).ok, true);
    const unknownCommit = unknown.PUB.commitCoupledTransaction({
      transactionDir: unknown.transaction,
      candidateRoot: unknown.candidate,
      publicationRoot: unknown.publication,
      subject: 'company-brief: scope 03 unknown remote outcome'
    });
    assert.equal(unknownCommit.ok, true, unknownCommit.ok ? '' : JSON.stringify(unknownCommit.error));
    const unknownExactCommit = unknownCommit.value.commit;
    requireSuccess(run('git', ['remote', 'set-url', 'origin', path.join(unknownSandbox, 'missing.git')], unknown.publication),
      'make remote outcome unknowable');
    const ambiguous = unknown.PUB.pushCoupledTransaction({
      transactionDir: unknown.transaction,
      candidateRoot: unknown.candidate,
      publicationRoot: unknown.publication,
      remote: 'origin',
      branch: 'main',
      acknowledgmentFile: path.join(unknownSandbox, 'private-ack.json')
    });
    assert.equal(ambiguous.ok, true, ambiguous.ok ? '' : JSON.stringify(ambiguous.error));
    assert.equal(ambiguous.value.state, 'remote-outcome-unknown');
    assert.equal(ambiguous.value.commit, unknownExactCommit);
    const unknownAttempt = unknown.PUB.buildAttemptRecord({
      attemptId: '45454545-4545-4545-8545-454545454545',
      generationId: unknown.frozen.generation.generationId,
      trigger: 'scheduled',
      window: 'morning',
      state: 'remote-outcome-unknown',
      phase: 'committed',
      startedAt: '2026-08-28T13:59:00.000Z',
      finishedAt: '2026-08-28T14:00:00.000Z',
      failure: {
        contractVersion: 'company-publication-error/v1',
        code: 'C028-ACK-UNKNOWN',
        phase: 'committed',
        reason: `could not inspect ${path.join(unknownSandbox, 'missing.git')} with password=private`,
        field: 'remoteRef',
        causeCode: 'git-fetch-failed'
      },
      authoritativeGenerationId: 'prior-generation'
    });
    assert.equal(unknownAttempt.ok, true, unknownAttempt.ok ? '' : JSON.stringify(unknownAttempt.error));
    assert.equal(unknownAttempt.value.authoritativeUnchanged, true);
    assert.equal(Object.hasOwn(unknownAttempt.value, 'pairAuthority'), false);
    assert.doesNotMatch(JSON.stringify(unknownAttempt.value), /missing\.git|password|private/);
    const blocked = unknown.PUB.assertCoupledGenerationAdmission({ transactionDir: unknown.transaction });
    assert.equal(blocked.ok, false, 'an unknown remote outcome blocks a new generation');
    assert.equal(blocked.error.code, 'C028-ACK-UNKNOWN');

    requireSuccess(run('git', ['remote', 'set-url', 'origin', unknown.remote], unknown.publication),
      'restore real bare remote');
    const reconciled = unknown.PUB.pushCoupledTransaction({
      transactionDir: unknown.transaction,
      candidateRoot: unknown.candidate,
      publicationRoot: unknown.publication,
      remote: 'origin',
      branch: 'main',
      acknowledgmentFile: path.join(unknownSandbox, 'private-ack.json')
    });
    assert.equal(reconciled.ok, true, reconciled.ok ? '' : JSON.stringify(reconciled.error));
    assert.equal(reconciled.value.state, 'acknowledged');
    assert.equal(reconciled.value.commit, unknownExactCommit);
    assert.equal(reconciled.value.acknowledgmentPersisted, true);
    const acknowledgedAttempt = unknown.PUB.buildAttemptRecord({
      attemptId: '56565656-5656-4565-8565-565656565656',
      generationId: unknown.frozen.generation.generationId,
      trigger: 'scheduled',
      window: 'morning',
      state: 'acknowledged',
      phase: 'remote-acknowledged',
      startedAt: '2026-08-28T13:59:00.000Z',
      finishedAt: '2026-08-28T14:00:00.000Z',
      failure: null,
      authoritativeGenerationId: unknown.frozen.generation.generationId
    });
    assert.equal(acknowledgedAttempt.ok, true,
      acknowledgedAttempt.ok ? '' : JSON.stringify(acknowledgedAttempt.error));
    assert.equal(acknowledgedAttempt.value.authoritativeUnchanged, false);
    assert.equal(Object.hasOwn(acknowledgedAttempt.value, 'pairAuthority'), false,
      'even an acknowledged attempt is a record, not the coupled selector');
    assert.equal(unknown.PUB.assertCoupledGenerationAdmission({ transactionDir: unknown.transaction }).ok, true);
    assert.equal(
      requireSuccess(run('git', ['rev-parse', 'refs/heads/main'], unknown.remote), 'remote exact commit'),
      unknownExactCommit,
      'ancestry reconciliation acknowledges only the exact preserved commit'
    );
    assert.equal(
      requireSuccess(run('git', ['status', '--porcelain=v1', '--untracked-files=all'], ROOT),
        'source checkout status after Scope 03 fault matrix'),
      sourceStatusBefore,
      'the fault matrix leaves the Scope 02-certified checkout unchanged'
    );
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});
