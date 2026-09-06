/*
 * tests/distributed-briefs.scheduler.integration.mjs — Feature 002 Scope 09 (SCN-002-010).
 *
 * Real isolated-worktree publication against a temporary bare remote. runBriefRefresh runs the complete
 * evidence-first barrier inside a `git worktree add --detach` checkout, commits with the run trailers,
 * and pushes the exact commit to a disposable "origin". The repository's real origin is never contacted
 * and the disposable root worktree is never mutated. The committed remote tree, the run trailers, the
 * whole distributed-briefs graph, and the independent event trace all prove ONE coherent run.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { runBriefRefresh } from '../scripts/brief-refresh.mjs';
import { validateCurrentGraph, validateHistoryGraph, validateCompatibilityProjection } from '../scripts/validate-distributed-briefs.mjs';
import {
  envelopeFinalAuthorFn, makeSchedulerRepo, remoteHeadTrailers, remoteTreePaths,
  runGit, schedulerDeps, snapshotTree, stagedPaths
} from './fixtures/feature-002/scheduler/scheduler-fixture-builder.mjs';

test('scheduler publishes one exact run through isolated worktree commit and temporary remote', async (context) => {
  const repo = makeSchedulerRepo();
  try {
    const rootBefore = snapshotTree(repo.root);
    const deps = schedulerDeps(repo, 'morning');

    const result = await runBriefRefresh(deps);
    assert.equal(result.ok, true, 'evidence-first run publishes');
    assert.equal(result.push.branch, 'main');

    // One run identity threads the manifest, both pointers, and the commit trailers.
    const phaseOrder = deps.events.filter((e) => e.phase !== 'refusal').map((e) => e.phase);
    assert.deepEqual(phaseOrder.slice(0, 6), ['lease-held', 'worktree-ready', 'registry-frozen', 'sources-acquired', 'evidence-frozen', 'reads-frozen']);
    assert.equal(phaseOrder[phaseOrder.length - 1], 'pushed');
    // Evidence freezes strictly before any owner read; final authorship strictly after the source barrier.
    assert.ok(phaseOrder.indexOf('evidence-frozen') < phaseOrder.indexOf('reads-frozen'));
    assert.ok(phaseOrder.indexOf('source-barrier-passed') < phaseOrder.indexOf('final-authored'));
    assert.ok(phaseOrder.indexOf('final-authored') < phaseOrder.indexOf('promoted'));
    assert.ok(phaseOrder.indexOf('promoted') < phaseOrder.indexOf('committed'));

    // The disposable remote carries the exact run commit with all three trailers and briefs/current.json last.
    const trailers = remoteHeadTrailers(repo.remote);
    assert.ok(trailers.some((t) => t === `Brief-Run-Id: ${result.runId}`), 'Brief-Run-Id trailer present');
    assert.ok(trailers.some((t) => t.startsWith('Brief-Run-Fingerprint: ')), 'Brief-Run-Fingerprint trailer present');
    assert.ok(trailers.some((t) => t.startsWith('Brief-Manifest-SHA256: sha256:')), 'Brief-Manifest-SHA256 trailer present');

    const remotePaths = remoteTreePaths(repo.remote);
    assert.ok(remotePaths.includes('briefs/current.json'), 'current pointer committed');
    assert.ok(remotePaths.includes('briefs/history-current.json'), 'history pointer committed');
    assert.ok(remotePaths.some((p) => p.startsWith('briefs/objects/final-briefs/')), 'final object committed');
    assert.ok(remotePaths.some((p) => p.startsWith('briefs/runs/')), 'run manifest committed');

    // Clone the disposable remote and validate the whole distributed-briefs graph on disk.
    const verifyDir = mkdtempSync(path.join(tmpdir(), 'rl-sched-verify-'));
    context.after(() => rmSync(verifyDir, { recursive: true, force: true }));
    execFileSync('git', ['clone', '--quiet', repo.remote, verifyDir]);
    assert.equal(validateCurrentGraph(verifyDir).ok, true, 'current graph reconciles');
    assert.equal(validateCurrentGraph(verifyDir).runId, result.runId);
    assert.equal(validateHistoryGraph(verifyDir).ok, true, 'history graph reconciles');
    assert.equal(validateCompatibilityProjection(verifyDir).ok, true, 'compatibility projection reconciles');

    // The disposable root worktree is byte-for-byte unchanged and carries nothing staged.
    assert.deepEqual(snapshotTree(repo.root), rootBefore, 'root worktree bytes unchanged');
    assert.deepEqual(stagedPaths(repo.root), [], 'root index carries no staged run path');
  } finally {
    repo.cleanup();
  }
});

test('Regression canary: existing due windows locks failures and scheduler process behavior remain intact', async () => {
  const success = makeSchedulerRepo();
  const held = makeSchedulerRepo();
  const failed = makeSchedulerRepo();
  try {
    const successRootBefore = snapshotTree(success.root);
    const published = await runBriefRefresh(schedulerDeps(success, 'morning'));
    assert.equal(published.ok, true);
    assert.equal(published.push.branch, 'main');
    assert.ok(remoteTreePaths(success.remote).includes('briefs/current.json'));
    assert.deepEqual(snapshotTree(success.root), successRootBefore,
      'the successful scheduler process leaves its source worktree unchanged');

    const heldDeps = schedulerDeps(held, 'morning');
    const heldRemoteBefore = remoteTreePaths(held.remote);
    heldDeps.lease.forceHold();
    const heldResult = await runBriefRefresh(heldDeps);
    assert.equal(heldResult.ok, false);
    assert.equal(heldResult.refusal.code, 'B002-RUN-IN-PROGRESS');
    assert.deepEqual(remoteTreePaths(held.remote), heldRemoteBefore,
      'the held lease permits no publication process output beyond its exact baseline');

    const failedHead = runGit(failed.remote, ['rev-parse', 'main']).stdout.trim();
    const failedRootBefore = snapshotTree(failed.root);
    const failedResult = await runBriefRefresh(schedulerDeps(failed, 'pre-close', {
      finalAuthorFn: envelopeFinalAuthorFn('omit-source')
    }));
    assert.equal(failedResult.ok, false);
    assert.equal(failedResult.refusal.code, 'B002-FINAL-AUTHOR');
    assert.equal(runGit(failed.remote, ['rev-parse', 'main']).stdout.trim(), failedHead);
    assert.deepEqual(snapshotTree(failed.root), failedRootBefore,
      'the failed scheduler process restores its isolated source worktree');
  } finally {
    success.cleanup();
    held.cleanup();
    failed.cleanup();
  }
});
