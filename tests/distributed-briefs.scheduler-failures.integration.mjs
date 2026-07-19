/*
 * tests/distributed-briefs.scheduler-failures.integration.mjs — Feature 002 Scope 09 (SCN-002-011, SCN-002-012).
 *
 * Real fault-injection + idempotency against disposable temp repos. Every required-phase fault
 * (calendar, source, cutoff/session, read, tool author, budget, final author, publish-set/history) must
 * leave the prior public pointer (the disposable remote HEAD) and the disposable root worktree exactly
 * unchanged. Every duplicate / concurrent / commit-not-pushed / crash-resume / rollback path must resolve
 * to at most ONE authoritative commit and must NEVER reacquire a source or reauthor a brief.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { runBriefRefresh } from '../scripts/brief-refresh.mjs';
import { resumePublish, rollbackPublication } from '../scripts/brief-publication.mjs';
import {
  makeSchedulerRepo, schedulerDeps, snapshotTree, runGit, envelopeFinalAuthorFn, remoteTreePaths
} from './fixtures/feature-002/scheduler/scheduler-fixture-builder.mjs';
import { singleSourceScenario } from './fixtures/feature-002/final/final-fixture-builder.mjs';

function remoteHead(repo) { return runGit(repo.remote, ['rev-parse', 'main']).stdout.trim(); }

function countingDeps(repo, window, overrides = {}) {
  const deps = schedulerDeps(repo, window, overrides);
  const counters = { tool: 0, final: 0, acquire: 0 };
  const baseAuthor = deps.authorFn;
  deps.authorFn = async (r, m) => { counters.tool += 1; return baseAuthor(r, m); };
  const baseFinal = deps.finalAuthorFn;
  deps.finalAuthorFn = async (r, m) => { counters.final += 1; return baseFinal(r, m); };
  const baseAcquire = deps.acquireSources;
  deps.acquireSources = async (a) => { counters.acquire += 1; return baseAcquire(a); };
  return { deps, counters };
}

test('calendar source cutoff read author budget final history and publish faults preserve prior pointers', async () => {
  const faults = [
    { name: 'calendar', code: 'B002-CALENDAR', overrides: { deps: { calendar: { covers: () => false } } } },
    { name: 'source', code: 'B002-SESSION-REQUIRED', overrides: { acquireOptions: { fail: true } } },
    { name: 'cutoff-session', code: 'B002-SESSION-REQUIRED', overrides: { acquireOptions: { evidenceState: 'required-unavailable' } } },
    { name: 'read-missing', code: 'B002-READ-BARRIER', overrides: { acquireOptions: { omitRead: 'ai-capex-strategy-lab' } } },
    { name: 'tool-author', code: 'B002-TOOL-AUTHOR', overrides: { authorFn: async () => ({ ok: false, error: { code: 'B002-TOOL-AUTHOR', reason: 'author-failed' } }) } },
    { name: 'budget', code: 'B002-BUDGET', overrides: { deps: { runBudget: { maxInputTokens: 1, maxOutputTokens: 1, maxAttempts: 0 } } } },
    { name: 'final-author', code: 'B002-FINAL-AUTHOR', overrides: { finalAuthorFn: envelopeFinalAuthorFn('omit-source') } },
    { name: 'publish-set', code: 'B002-PUBLISH-SET', overrides: { prior: { streams: {}, generation: 0, pointer: null, sealedMonths: ['2026-07'] } } }
  ];

  for (const fault of faults) {
    const repo = makeSchedulerRepo();
    try {
      const rootBefore = snapshotTree(repo.root);
      const headBefore = remoteHead(repo);
      const deps = schedulerDeps(repo, 'morning', fault.overrides);
      const result = await runBriefRefresh(deps);
      assert.equal(result.ok, false, `${fault.name} fault refuses`);
      assert.equal(result.refusal.code, fault.code, `${fault.name} -> ${fault.code}`);
      // Prior public pointer and disposable root are byte-for-byte unchanged; no partial run was published.
      assert.equal(remoteHead(repo), headBefore, `${fault.name}: remote HEAD unchanged`);
      assert.deepEqual(snapshotTree(repo.root), rootBefore, `${fault.name}: root bytes unchanged`);
      assert.deepEqual(remoteTreePaths(repo.remote).filter((p) => p.startsWith('briefs/objects/')), [], `${fault.name}: no brief objects published`);
    } finally {
      repo.cleanup();
    }
  }
});

test('duplicate concurrent commit push crash and rollback paths remain idempotent', async () => {
  // (a) Concurrent same run key: the lease is already held -> refuse without any authoring.
  {
    const repo = makeSchedulerRepo();
    try {
      const { deps, counters } = countingDeps(repo, 'morning');
      deps.lease.forceHold();
      const result = await runBriefRefresh(deps);
      assert.equal(result.ok, false);
      assert.equal(result.refusal.code, 'B002-RUN-IN-PROGRESS');
      assert.equal(counters.acquire + counters.tool + counters.final, 0, 'no acquisition or authoring under a held lease');
    } finally { repo.cleanup(); }
  }

  // (b) One authoritative run, then a duplicate of the SAME completed run key: idempotent, no re-author,
  //     no second commit.
  {
    const repo = makeSchedulerRepo();
    try {
      const first = await runBriefRefresh(schedulerDeps(repo, 'morning'));
      assert.equal(first.ok, true);
      const headAfterFirst = remoteHead(repo);

      const { deps: dupDeps, counters } = countingDeps(repo, 'morning', { prior: { pointer: first.staging.pointers.current, manifest: first.manifest, generation: 1, streams: {}, sealedMonths: [] } });
      const dup = await runBriefRefresh(dupDeps);
      assert.equal(dup.ok, true);
      assert.equal(dup.idempotent, true, 'duplicate completed run is idempotent');
      assert.equal(counters.acquire + counters.tool + counters.final, 0, 'duplicate performs no acquisition or authoring');
      assert.equal(remoteHead(repo), headAfterFirst, 'no second authoritative commit');
    } finally { repo.cleanup(); }
  }

  // (c) Push failure -> the commit exists locally; a resume pushes the EXACT commit with no reacquire /
  //     reauthor, producing exactly one authoritative commit on the remote.
  {
    const repo = makeSchedulerRepo();
    try {
      const { deps, counters } = countingDeps(repo, 'morning', { deps: { remote: 'no-such-remote' } });
      const failed = await runBriefRefresh(deps);
      assert.equal(failed.ok, false);
      assert.equal(failed.refusal.code, 'B002-PUSH');
      const committedSha = failed.commit.sha;
      const worktreeDir = failed.worktreeDir;
      assert.equal(runGit(worktreeDir, ['rev-parse', 'HEAD']).stdout.trim(), committedSha, 'exact commit preserved locally');
      const toolCallsAtCommit = counters.tool;
      const finalCallsAtCommit = counters.final;

      // The private journal drives an exact-commit resume: push only, no reacquire, no reauthor.
      const journal = deps.journal.read();
      assert.equal(journal.phase, 'committed');
      assert.equal(journal.commit, committedSha);
      const resume = resumePublish(journal, { currentHashes: journal.stagedHashes });
      assert.equal(resume.ok, true);
      assert.equal(resume.resume.action, 'push-exact-commit');
      assert.equal(resume.resume.reacquire, false);
      assert.equal(resume.resume.reauthor, false);
      assert.equal(resume.resume.commit, committedSha);

      // Actually push the SAME commit to the real disposable origin: the remote now carries exactly that
      // commit, and no new author call happened during the resume.
      const pushed = runGit(worktreeDir, ['push', 'origin', 'HEAD:main']);
      assert.equal(pushed.code, 0);
      assert.equal(remoteHead(repo), committedSha, 'remote carries the exact resumed commit');
      assert.equal(counters.tool, toolCallsAtCommit, 'resume reauthored nothing (tool)');
      assert.equal(counters.final, finalCallsAtCommit, 'resume reauthored nothing (final)');

      // A resume whose staged bytes drifted refuses rather than pushing stale content.
      const drift = resumePublish(journal, { currentHashes: { ...journal.stagedHashes, [Object.keys(journal.stagedHashes)[0]]: 'sha256:deadbeef' } });
      assert.equal(drift.ok, false);
      assert.equal(drift.error.reason, 'resume-hash-drift');
    } finally { repo.cleanup(); }
  }

  // (d) Pure pointer-swap rollback selects a prior validated manifest and deletes nothing.
  {
    const repo = makeSchedulerRepo();
    try {
      const first = await runBriefRefresh(schedulerDeps(repo, 'morning'));
      assert.equal(first.ok, true);
      const rollback = rollbackPublication({ pointer: first.staging.pointers.current });
      assert.equal(rollback.ok, true);
      assert.equal(rollback.rollback.mode, 'pointer-swap');
      assert.equal(rollback.rollback.deletedObjects, 0);
      assert.equal(rollback.rollback.currentPointer.runId, first.runId);
    } finally { repo.cleanup(); }
  }
});
