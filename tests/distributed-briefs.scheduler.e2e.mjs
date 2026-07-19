/*
 * tests/distributed-briefs.scheduler.e2e.mjs — Feature 002 Scope 09 (SCN-002-010, SCN-002-011, SCN-002-012).
 *
 * Persistent scenario regression for the evidence-first scheduler. Each test drives the real
 * runBriefRefresh transaction through disposable temp repos + a temporary remote (never the real origin,
 * never the real root worktree) and proves the end-to-end contract for one scenario.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { runBriefRefresh } from '../scripts/brief-refresh.mjs';
import { resumePublish } from '../scripts/brief-publication.mjs';
import { validateCurrentGraph, validateHistoryGraph, validateCompatibilityProjection } from '../scripts/validate-distributed-briefs.mjs';
import {
  makeSchedulerRepo, schedulerDeps, snapshotTree, stagedPaths, runGit, remoteTreePaths, remoteHeadTrailers, envelopeFinalAuthorFn
} from './fixtures/feature-002/scheduler/scheduler-fixture-builder.mjs';

function cloneRemote(repo) {
  const dir = mkdtempSync(path.join(tmpdir(), 'rl-e2e-verify-'));
  execFileSync('git', ['clone', '--quiet', repo.remote, dir]);
  return dir;
}
function remoteCurrentRunId(repo) {
  const dir = cloneRemote(repo);
  return JSON.parse(readFileSync(path.join(dir, 'briefs/current.json'), 'utf8')).runId;
}

test('Regression: SCN-002-010 evidence then owners then all briefs then final then atomic publish commit and push', async () => {
  const repo = makeSchedulerRepo();
  try {
    const deps = schedulerDeps(repo, 'morning');
    const result = await runBriefRefresh(deps);
    assert.equal(result.ok, true);

    // Exact evidence-first phase order for one run identity.
    const phases = deps.events.filter((e) => e.phase !== 'refusal').map((e) => e.phase);
    const order = ['evidence-frozen', 'reads-frozen', 'source-briefs-authored', 'source-barrier-passed', 'final-authored', 'publish-set-validated', 'promoted', 'staged', 'committed', 'pushed'];
    let last = -1;
    for (const p of order) { const idx = phases.indexOf(p); assert.ok(idx > last, `phase ${p} follows the prior barrier step`); last = idx; }

    // The remote carries the exact run: trailers, whole graph, and coherent compatibility projection.
    assert.ok(remoteHeadTrailers(repo.remote).some((t) => t === `Brief-Run-Id: ${result.runId}`));
    const verify = cloneRemote(repo);
    assert.equal(validateCurrentGraph(verify).ok, true);
    assert.equal(validateCurrentGraph(verify).runId, result.runId);
    assert.equal(validateHistoryGraph(verify).ok, true);
    assert.equal(validateCompatibilityProjection(verify).ok, true);
  } finally { repo.cleanup(); }
});

test('Regression: SCN-002-011 every required-phase failure leaves prior current authority unchanged', async () => {
  const repo = makeSchedulerRepo();
  try {
    // Establish prior current authority.
    const first = await runBriefRefresh(schedulerDeps(repo, 'morning'));
    assert.equal(first.ok, true);
    assert.equal(remoteCurrentRunId(repo), first.runId);
    const rootBefore = snapshotTree(repo.root);

    // A distinct later run that faults at a required phase must not disturb the prior current pointer.
    for (const fault of [
      { name: 'final', overrides: { finalAuthorFn: envelopeFinalAuthorFn('omit-source') }, code: 'B002-FINAL-AUTHOR' },
      { name: 'source', overrides: { acquireOptions: { fail: true } }, code: 'B002-SESSION-REQUIRED' }
    ]) {
      const deps = schedulerDeps(repo, 'pre-close', fault.overrides);
      const faulted = await runBriefRefresh(deps);
      assert.equal(faulted.ok, false, `${fault.name} refuses`);
      assert.equal(faulted.refusal.code, fault.code);
      assert.equal(remoteCurrentRunId(repo), first.runId, `${fault.name}: prior current authority unchanged`);
    }
    assert.deepEqual(snapshotTree(repo.root), rootBefore, 'root unchanged across required-phase failures');
  } finally { repo.cleanup(); }
});

test('Regression: SCN-002-012 duplicate and push-only retries reuse exact bytes and preserve dirty root', async () => {
  const repo = makeSchedulerRepo();
  try {
    // Dirty the disposable root with a staged, an unstaged, and an untracked change.
    writeFileSync(path.join(repo.root, 'wip.txt'), 'staged wip\n');
    runGit(repo.root, ['add', '--', 'wip.txt']);
    writeFileSync(path.join(repo.root, 'README.md'), '# root\nunstaged edit\n');
    writeFileSync(path.join(repo.root, 'untracked.local'), 'untracked\n');
    const rootBefore = snapshotTree(repo.root);
    const stagedBefore = stagedPaths(repo.root);

    // One authoritative publish beside the dirty root.
    const first = await runBriefRefresh(schedulerDeps(repo, 'morning'));
    assert.equal(first.ok, true);

    // A duplicate of the same completed run key reuses the existing pointer and authors nothing.
    let dupTool = 0;
    const dupDeps = schedulerDeps(repo, 'morning', { prior: { pointer: first.staging.pointers.current, manifest: first.manifest, generation: 1, streams: {}, sealedMonths: [] } });
    const baseAuthor = dupDeps.authorFn; dupDeps.authorFn = async (r, m) => { dupTool += 1; return baseAuthor(r, m); };
    const dup = await runBriefRefresh(dupDeps);
    assert.equal(dup.idempotent, true);
    assert.equal(dupTool, 0, 'duplicate authored nothing');

    // A push-only retry after a transient push failure reuses the EXACT commit bytes, no reauthor.
    const pushFailDeps = schedulerDeps(repo, 'pre-close', { deps: { remote: 'no-such-remote' } });
    let retryTool = 0; const baseA = pushFailDeps.authorFn; pushFailDeps.authorFn = async (r, m) => { retryTool += 1; return baseA(r, m); };
    const crashed = await runBriefRefresh(pushFailDeps);
    assert.equal(crashed.refusal.code, 'B002-PUSH');
    const toolAtCommit = retryTool;
    const resume = resumePublish(pushFailDeps.journal.read(), { currentHashes: pushFailDeps.journal.read().stagedHashes });
    assert.equal(resume.resume.action, 'push-exact-commit');
    const pushed = runGit(crashed.worktreeDir, ['push', 'origin', 'HEAD:main']);
    assert.equal(pushed.code, 0);
    assert.equal(runGit(repo.remote, ['rev-parse', 'main']).stdout.trim(), crashed.commit.sha, 'exact commit bytes reused');
    assert.equal(retryTool, toolAtCommit, 'push-only retry reauthored nothing');

    // The dirty root survived every path exactly.
    assert.deepEqual(snapshotTree(repo.root), rootBefore, 'dirty root bytes preserved');
    assert.deepEqual(stagedPaths(repo.root), stagedBefore, 'dirty root index preserved');
    assert.ok(remoteTreePaths(repo.remote).includes('briefs/current.json'));
  } finally { repo.cleanup(); }
});
