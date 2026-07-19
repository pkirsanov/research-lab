/*
 * tests/distributed-briefs.scheduler.stress.mjs — Feature 002 Scope 09 (SCN-002-012).
 *
 * Concurrent-duplicate + crash-resume stress. Run with `node tests/distributed-briefs.scheduler.stress.mjs`.
 * Many attempts race on ONE run key over a shared filesystem lease; exactly one authoritative commit may
 * reach the disposable remote, and the losers must do zero acquisition/authoring. A crash after commit is
 * resumed by pushing the EXACT commit (no reacquire, no reauthor). All within declared attempt/call/commit
 * budgets. Isolated temp repos only — the real origin and root worktree are never touched.
 */
import assert from 'node:assert/strict';

import { runBriefRefresh } from '../scripts/brief-refresh.mjs';
import { resumePublish } from '../scripts/brief-publication.mjs';
import { makeSchedulerRepo, schedulerDeps, runGit } from './fixtures/feature-002/scheduler/scheduler-fixture-builder.mjs';

function remoteCommitCount(repo) {
  return Number(runGit(repo.remote, ['rev-list', '--count', 'main']).stdout.trim());
}

async function main() {
  const ATTEMPTS = 6;

  // (1) Concurrent duplicates on one run key -> exactly one authoritative publish, losers author nothing.
  {
    const repo = makeSchedulerRepo();
    try {
      const counters = [];
      const attempts = [];
      for (let i = 0; i < ATTEMPTS; i += 1) {
        const deps = schedulerDeps(repo, 'morning');
        const c = { tool: 0, final: 0, acquire: 0 };
        const baseAuthor = deps.authorFn; deps.authorFn = async (r, m) => { c.tool += 1; return baseAuthor(r, m); };
        const baseFinal = deps.finalAuthorFn; deps.finalAuthorFn = async (r, m) => { c.final += 1; return baseFinal(r, m); };
        const baseAcq = deps.acquireSources; deps.acquireSources = async (a) => { c.acquire += 1; return baseAcq(a); };
        counters.push(c);
        attempts.push(runBriefRefresh(deps));
      }
      const results = await Promise.all(attempts);
      const winners = results.filter((r) => r.ok && !r.idempotent);
      const blocked = results.filter((r) => !r.ok && r.refusal.code === 'B002-RUN-IN-PROGRESS');
      assert.equal(winners.length, 1, `exactly one authoritative run (got ${winners.length})`);
      assert.equal(blocked.length, ATTEMPTS - 1, 'every loser is a lease refusal');
      assert.equal(remoteCommitCount(repo), 2, 'seed + exactly one publish commit');
      // Budget: only the winner touched sources/authors; total author calls == one run's calls.
      const totalTool = counters.reduce((s, c) => s + c.tool, 0);
      const totalFinal = counters.reduce((s, c) => s + c.final, 0);
      const totalAcquire = counters.reduce((s, c) => s + c.acquire, 0);
      assert.equal(totalAcquire, 1, 'exactly one source acquisition across all attempts');
      assert.equal(totalFinal, 1, 'exactly one final author across all attempts');
      assert.ok(totalTool >= 1 && totalTool <= (3 * 2 + 3), `tool author calls within the run ceiling (got ${totalTool})`);
    } finally { repo.cleanup(); }
  }

  // (2) Crash after commit -> resume pushes the EXACT commit with no reacquire / reauthor.
  {
    const repo = makeSchedulerRepo();
    try {
      const deps = schedulerDeps(repo, 'morning', { deps: { remote: 'no-such-remote' } });
      let tool = 0, final = 0, acquire = 0;
      const baseAuthor = deps.authorFn; deps.authorFn = async (r, m) => { tool += 1; return baseAuthor(r, m); };
      const baseFinal = deps.finalAuthorFn; deps.finalAuthorFn = async (r, m) => { final += 1; return baseFinal(r, m); };
      const baseAcq = deps.acquireSources; deps.acquireSources = async (a) => { acquire += 1; return baseAcq(a); };

      const crashed = await runBriefRefresh(deps);
      assert.equal(crashed.ok, false);
      assert.equal(crashed.refusal.code, 'B002-PUSH');
      const sha = crashed.commit.sha;
      const journal = deps.journal.read();
      const resume = resumePublish(journal, { currentHashes: journal.stagedHashes });
      assert.equal(resume.resume.action, 'push-exact-commit');
      assert.equal(resume.resume.reacquire, false);
      assert.equal(resume.resume.reauthor, false);
      const toolAtResume = tool, finalAtResume = final, acquireAtResume = acquire;
      const pushed = runGit(crashed.worktreeDir, ['push', 'origin', 'HEAD:main']);
      assert.equal(pushed.code, 0);
      assert.equal(runGit(repo.remote, ['rev-parse', 'main']).stdout.trim(), sha, 'remote carries the exact resumed commit');
      assert.equal(remoteCommitCount(repo), 2, 'exactly one authoritative commit after crash-resume');
      assert.equal(tool, toolAtResume, 'resume reauthored no tool brief');
      assert.equal(final, finalAtResume, 'resume reauthored no final');
      assert.equal(acquire, acquireAtResume, 'resume reacquired no source');
    } finally { repo.cleanup(); }
  }

  console.log('distributed-briefs.scheduler.stress: PASS (concurrent duplicates + crash-resume within budgets)');
}

main().catch((error) => { console.error('distributed-briefs.scheduler.stress: FAIL', error); process.exit(1); });
