/*
 * Feature 028 Scope 01 — process regression through the production CLI in a real temporary Git checkout.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
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
const PROCESS_TIMEOUT_MS = 30_000;

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
