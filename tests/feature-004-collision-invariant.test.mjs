// Feature 004 collision safety, asserted as an INVARIANT rather than a snapshot.
//
// Why this file exists
// --------------------
// The predecessor (tests/feature-004-dirty-tree-collision.test.mjs) pinned a
// frozen snapshot of one historical dirty tree: specific commit SHAs, specific
// worktree hashes, and a brotli-compressed evidence block that hashed the test's
// own source. That design had two defects that were measured, not assumed:
//
//   1. It could not survive a history rewrite. The v15 planning baseline lived at
//      four SHAs (1db4f8ed, ac91e50a, 38af035c, bd71e69d) as PII scrubs, rebases
//      and install refreshes re-parented the same logical commit. Each rewrite
//      broke a raw-SHA ancestry assertion that was describing a planning state
//      which had not changed at all. Eleven versioned epochs accumulated, and a
//      twelfth was written and deleted as a workaround on the same chain.
//
//   2. A frozen snapshot cannot detect a FUTURE clobber. It re-validates a past
//      tree. If an agent ran `git checkout --` over a concurrent session's file
//      tomorrow, a snapshot of yesterday would still pass.
//
// This file asserts the behaviour instead: given foreign uncommitted work, a
// Feature-004-shaped operation must leave every foreign hunk byte-identical. It
// runs against hermetic sandbox repositories, so it pins nothing about this
// repository's history and cannot be invalidated by a rewrite.
//
// Non-vacuity is enforced, not claimed: `assertDetectorRejects` requires each
// known-destructive command to be CAUGHT by the same comparator that guards the
// safe path. A comparator that returned "unchanged" for everything would fail
// those cases.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, chmodSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const GIT_IDENTITY = [
  '-c', 'user.name=feature004-sandbox',
  '-c', 'user.email=feature004-sandbox@example.invalid',
  '-c', 'commit.gpgsign=false',
  '-c', 'core.autocrlf=false'
];

function git(directory, args, options = {}) {
  return execFileSync('git', [...GIT_IDENTITY, ...args], {
    cwd: directory, encoding: 'utf8', ...options
  });
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function withSandbox(run) {
  const directory = mkdtempSync(resolve(tmpdir(), 'feature004-collision-'));
  try {
    git(directory, ['init', '--quiet', '--initial-branch=main']);
    // A committed base so foreign paths can carry real tracked modifications.
    writeFileSync(resolve(directory, 'foreign-tracked.txt'), 'foreign-base-line-1\nforeign-base-line-2\n', 'utf8');
    writeFileSync(resolve(directory, 'foreign-staged.txt'), 'staged-base\n', 'utf8');
    writeFileSync(resolve(directory, 'owned-by-feature-004.txt'), 'owned-base\n', 'utf8');
    git(directory, ['add', '.']);
    git(directory, ['commit', '--quiet', '-m', 'base']);
    return run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

// The foreign work a concurrent session would have in flight: a tracked
// modification, a staged modification, and an untracked file.
function seedForeignWork(directory) {
  writeFileSync(resolve(directory, 'foreign-tracked.txt'),
    'foreign-base-line-1\nFOREIGN UNCOMMITTED EDIT\nforeign-base-line-2\n', 'utf8');
  writeFileSync(resolve(directory, 'foreign-staged.txt'), 'staged-base\nFOREIGN STAGED EDIT\n', 'utf8');
  git(directory, ['add', 'foreign-staged.txt']);
  writeFileSync(resolve(directory, 'foreign-untracked.txt'), 'FOREIGN UNTRACKED\n', 'utf8');
}

const FOREIGN_PATHS = ['foreign-tracked.txt', 'foreign-staged.txt', 'foreign-untracked.txt'];

// Everything that must survive: worktree bytes, staged content, porcelain status
// and file mode. Bytes alone would miss a staged/unstaged transition, and status
// alone would miss a content rewrite that preserved the status letters.
function captureForeignState(directory) {
  const status = Object.fromEntries(
    git(directory, ['status', '--porcelain=v1', '--untracked-files=all'])
      .split('\n').filter(Boolean)
      .map((line) => [line.slice(3).trim(), line.slice(0, 2)]));

  return FOREIGN_PATHS.map((path) => {
    const absolute = resolve(directory, path);
    let worktreeSha = null;
    let mode = null;
    try {
      worktreeSha = sha256(readFileSync(absolute));
      mode = (statSync(absolute).mode & 0o777).toString(8);
    } catch {
      worktreeSha = 'ABSENT';
    }
    let stagedSha = 'NOT-STAGED';
    try {
      stagedSha = sha256(execFileSync('git', ['show', `:0:${path}`], { cwd: directory, stdio: ['ignore', 'pipe', 'ignore'] }));
    } catch {
      // path not in the index; NOT-STAGED is the honest reading
    }
    return { path, worktreeSha, stagedSha, mode, status: status[path] ?? 'CLEAN' };
  });
}

function diffForeignState(before, after) {
  const changes = [];
  before.forEach((prior, index) => {
    const next = after[index];
    ['worktreeSha', 'stagedSha', 'mode', 'status'].forEach((field) => {
      if (prior[field] !== next[field]) {
        changes.push(`${prior.path}.${field}: ${prior[field]} -> ${next[field]}`);
      }
    });
  });
  return changes;
}

// A Feature-004-shaped operation: touch only owned paths, and commit with an
// explicit pathspec. The pathspec is load-bearing. A bare `git commit` commits
// the whole index, so if a concurrent session had already staged its own work,
// that work would be swept into the Feature 004 commit. Writing this function
// the obvious way first is what surfaced that hazard, and it is now guarded
// below as `bare git commit sweeps foreign staged work`.
function runFeature004ShapedOperation(directory) {
  writeFileSync(resolve(directory, 'owned-by-feature-004.txt'), 'owned-base\nFEATURE 004 EDIT\n', 'utf8');
  git(directory, ['add', 'owned-by-feature-004.txt']);
  git(directory, ['commit', '--quiet', '-m', 'feat(004): touch only owned paths', '--', 'owned-by-feature-004.txt']);
}

test('Feature 004 shaped work leaves every foreign uncommitted hunk byte-identical', () => {
  withSandbox((directory) => {
    seedForeignWork(directory);
    const before = captureForeignState(directory);

    // The seed must actually produce dirty foreign state, otherwise the whole
    // assertion is vacuous — there would be nothing to preserve.
    assert.equal(before.filter((record) => record.status !== 'CLEAN').length, FOREIGN_PATHS.length,
      'every foreign path is genuinely dirty before the operation');

    runFeature004ShapedOperation(directory);

    const after = captureForeignState(directory);
    assert.deepEqual(diffForeignState(before, after), [],
      'no foreign worktree byte, staged blob, mode or status changed');

    // And the owned work really did land, so the operation was not a no-op that
    // trivially preserves everything.
    assert.match(git(directory, ['log', '-1', '--format=%s']), /feat\(004\)/,
      'the Feature 004 commit landed');
    assert.equal(git(directory, ['status', '--porcelain=v1', '--', 'owned-by-feature-004.txt']).trim(), '',
      'the owned path is committed clean');
  });
});

// Non-vacuity: the comparator must CATCH each destructive command. If any of
// these passed, the guard above would be worthless.
const DESTRUCTIVE_OPERATIONS = [
  ['git checkout -- <foreign>', (directory) => git(directory, ['checkout', '--', 'foreign-tracked.txt'])],
  ['git restore <foreign>', (directory) => git(directory, ['restore', 'foreign-tracked.txt'])],
  ['git reset --hard', (directory) => git(directory, ['reset', '--hard', 'HEAD'])],
  ['git stash', (directory) => git(directory, ['stash', '--include-untracked'])],
  ['git clean -fd', (directory) => git(directory, ['clean', '-fd'])],
  ['git add -A (stages foreign work)', (directory) => git(directory, ['add', '-A'])],
  ['git restore --staged <foreign>', (directory) => git(directory, ['restore', '--staged', 'foreign-staged.txt'])],
  ['overwrite foreign bytes', (directory) => {
    writeFileSync(resolve(directory, 'foreign-tracked.txt'), 'CLOBBERED\n', 'utf8');
  }],
  ['chmod foreign path', (directory) => {
    chmodSync(resolve(directory, 'foreign-tracked.txt'), 0o755);
  }],
  // The hazard this suite found on its own. `git add <own path>` followed by a
  // bare `git commit` commits the ENTIRE index, so a concurrent session's
  // already-staged work is swept into the commit and silently leaves that
  // session's tree. The owned path is committed either way, so the mistake is
  // invisible without this comparison.
  ['bare git commit sweeps foreign staged work', (directory) => {
    writeFileSync(resolve(directory, 'owned-by-feature-004.txt'), 'owned-base\nFEATURE 004 EDIT\n', 'utf8');
    git(directory, ['add', 'owned-by-feature-004.txt']);
    git(directory, ['commit', '--quiet', '-m', 'feat(004): bare commit']);
  }]
];

test('the collision detector rejects every destructive operation (non-vacuity)', () => {
  const outcomes = DESTRUCTIVE_OPERATIONS.map(([label, operate]) => withSandbox((directory) => {
    seedForeignWork(directory);
    const before = captureForeignState(directory);
    operate(directory);
    const changes = diffForeignState(before, captureForeignState(directory));
    assert.ok(changes.length > 0,
      `${label} MUST be detected as a foreign-state change, but the comparator saw none`);
    return { label, detectedChanges: changes.length };
  }));

  assert.equal(outcomes.length, DESTRUCTIVE_OPERATIONS.length,
    'every destructive operation was exercised');
  console.log(JSON.stringify({
    contract: 'feature004-collision-invariant/v1',
    safeOperationPreservesForeignWork: true,
    destructiveOperationsDetected: outcomes
  }, null, 2));
});

test('a foreign path that was never dirty is not silently treated as preserved', () => {
  withSandbox((directory) => {
    // No seedForeignWork: nothing is dirty. A comparator that only ever reports
    // "unchanged" would pass the safe-path test above for the wrong reason, so
    // this pins that a clean tree is observably clean rather than assumed so.
    const before = captureForeignState(directory);
    assert.equal(before.every((record) => record.status === 'CLEAN'), true,
      'a clean tree reports CLEAN for every foreign path');
    assert.equal(before.find((record) => record.path === 'foreign-untracked.txt').worktreeSha, 'ABSENT',
      'an absent path is reported ABSENT rather than silently skipped');

    seedForeignWork(directory);
    assert.ok(diffForeignState(before, captureForeignState(directory)).length > 0,
      'introducing foreign work is itself observable, so CLEAN is a real reading');
  });
});
