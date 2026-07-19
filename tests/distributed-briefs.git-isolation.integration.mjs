/*
 * tests/distributed-briefs.git-isolation.integration.mjs — Feature 002 Scope 09 (SCN-002-012).
 *
 * Real dirty-root isolation. The disposable "root" checkout is deliberately left with a STAGED unrelated
 * change, an UNSTAGED unrelated edit, and an UNTRACKED file. runBriefRefresh publishes through a separate
 * `git worktree add --detach` checkout, so after a successful publish every unrelated root byte and every
 * root index entry is exactly as before. A remote that advanced on a path OVERLAPPING the run inventory is
 * a structural refusal (automation never picks a winner); a non-overlapping advance is reconcilable.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { runBriefRefresh } from '../scripts/brief-refresh.mjs';
import { classifyRemoteOverlap } from '../scripts/brief-publication.mjs';
import {
  makeSchedulerRepo, schedulerDeps, snapshotTree, stagedPaths, runGit, remoteTreePaths
} from './fixtures/feature-002/scheduler/scheduler-fixture-builder.mjs';

/* Push a divergent commit to the disposable remote's main so the in-flight run's push is non-fast-forward. */
function advanceRemoteDivergent(repo, relPath) {
  const parent = mkdtempSync(path.join(tmpdir(), 'rl-advance-'));
  const dir = path.join(parent, 'clone');
  runGit(parent, ['clone', '--quiet', repo.remote, dir]);
  runGit(dir, ['config', 'user.email', 'advance@example.invalid']);
  runGit(dir, ['config', 'user.name', 'Advance']);
  const abs = path.join(dir, relPath);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, 'divergent remote advance\n');
  runGit(dir, ['add', '--', relPath]);
  runGit(dir, ['commit', '-m', 'remote advance']);
  const pushed = runGit(dir, ['push', 'origin', 'HEAD:main']);
  if (pushed.code !== 0) throw new Error('fixture remote advance push failed: ' + pushed.stderr);
}

test('dirty root non-overlap and overlap cases preserve every unrelated byte and index entry', async () => {
  // Part A — a genuinely dirty root (staged + unstaged + untracked) is untouched by a successful publish.
  {
    const repo = makeSchedulerRepo();
    try {
      // Unrelated staged change (a real index entry the run must never disturb).
      writeFileSync(path.join(repo.root, 'work-in-progress.txt'), 'unrelated staged work\n');
      runGit(repo.root, ['add', '--', 'work-in-progress.txt']);
      // Unrelated unstaged edit + untracked scratch file.
      writeFileSync(path.join(repo.root, 'README.md'), '# disposable scheduler fixture root\nlocal unstaged edit\n');
      writeFileSync(path.join(repo.root, 'scratch.local'), 'untracked scratch\n');

      const rootBefore = snapshotTree(repo.root);
      const stagedBefore = stagedPaths(repo.root);
      assert.deepEqual(stagedBefore, ['work-in-progress.txt']);

      const result = await runBriefRefresh(schedulerDeps(repo, 'morning'));
      assert.equal(result.ok, true, 'publish succeeds beside a dirty root');
      assert.ok(remoteTreePaths(repo.remote).includes('briefs/current.json'), 'run published to the remote');

      // Every unrelated root byte and the exact root index entry survive unchanged; nothing new is staged.
      assert.deepEqual(snapshotTree(repo.root), rootBefore, 'unrelated root bytes preserved exactly');
      assert.deepEqual(stagedPaths(repo.root), stagedBefore, 'root index entry preserved; no run path staged in root');
    } finally { repo.cleanup(); }
  }

  // Part B — a remote advance on a path OVERLAPPING the run inventory is a structural refusal.
  {
    const repo = makeSchedulerRepo();
    try {
      const rootBefore = snapshotTree(repo.root);
      const deps = schedulerDeps(repo, 'morning');
      const overlapPath = 'briefs/history/runs/2026-07.jsonl';
      const innerCreate = repo.worktree.create.bind(repo.worktree);
      deps.worktree = { create(rev) { const wt = innerCreate(rev); advanceRemoteDivergent(repo, overlapPath); return wt; } };
      deps.remoteChangedPaths = [overlapPath];

      const result = await runBriefRefresh(deps);
      assert.equal(result.ok, false);
      assert.equal(result.refusal.code, 'B002-REMOTE-OVERLAP', 'overlapping remote advance refuses');
      assert.deepEqual(snapshotTree(repo.root), rootBefore, 'root untouched under a remote-overlap refusal');
    } finally { repo.cleanup(); }
  }

  // Part C — the pure overlap classifier: an inventory-path overlap refuses; an unrelated advance reconciles.
  {
    const inventory = ['briefs/history/runs/2026-07.jsonl', 'briefs/objects/final-briefs/abc.json'];
    const overlap = classifyRemoteOverlap(['briefs/history/runs/2026-07.jsonl', 'docs/notes.md'], inventory);
    assert.equal(overlap.ok, false);
    assert.equal(overlap.error.code, 'B002-REMOTE-OVERLAP');
    assert.deepEqual(overlap.error.detail, ['briefs/history/runs/2026-07.jsonl']);

    const clean = classifyRemoteOverlap(['docs/notes.md', 'README.md'], inventory);
    assert.equal(clean.ok, true);
    assert.equal(clean.reconcilable, true);
  }
});
