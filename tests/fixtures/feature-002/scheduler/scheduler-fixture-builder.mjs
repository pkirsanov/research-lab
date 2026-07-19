/*
 * tests/fixtures/feature-002/scheduler/scheduler-fixture-builder.mjs — Feature 002 Scope 09.
 *
 * Deterministic fixtures + REAL isolated-Git helpers for the Evidence-First Atomic Publication scheduler
 * (runBriefRefresh). Everything lives under an OS temp directory:
 *   - a bare "origin" remote and a cloned "root" working checkout (the stand-in for the user's real
 *     worktree). The real repository origin is NEVER contacted and the real root worktree is NEVER
 *     mutated — every Git test operates only on these disposable temp repos.
 *   - a worktree factory that creates an ISOLATED `git worktree add --detach` at the fetched revision, so
 *     runBriefRefresh commits/pushes without touching the root index or working tree.
 *   - injected lease (mkdir lock), private journal (temp file), and a deterministic clock.
 *   - a fake bounded source acquirer (evidence + one read per frozen source) and a scenario-driven tool
 *     author transport that reproduces the shipped Scope 08 single-source scenario's validated briefs, so
 *     downstream ToolBrief/FinalBrief validation remains a genuine check rather than self-validation.
 *
 * The scenario registry (market-brief aggregator + sector-research-lab + ai-capex-strategy-lab) is a
 * SMALL validated fixture registry; it proves the barrier RULE ("final waits for ALL source outcomes"),
 * exactly as the Scope 08 fixtures do, without depending on the live 22-source count.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  singleSourceScenario, authorIdentity, makeHash, envelopeFinalAuthorFn
} from '../final/final-fixture-builder.mjs';
import { profileBudgets, runBudget } from '../authorship/brief-fixture-builder.mjs';

export { authorIdentity, makeHash, envelopeFinalAuthorFn };

/* ---------- Git isolation ---------- */

/** Run git in `cwd`, capturing stdout/stderr and exit code without throwing. */
export function runGit(cwd, args) {
  try {
    const stdout = execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, stdout: stdout || '', stderr: '' };
  } catch (error) {
    return {
      code: typeof error.status === 'number' ? error.status : 1,
      stdout: error.stdout ? error.stdout.toString() : '',
      stderr: error.stderr ? error.stderr.toString() : String(error.message || 'git-failed')
    };
  }
}

function configIdentity(cwd) {
  runGit(cwd, ['config', 'user.email', 'brief-scheduler@example.invalid']);
  runGit(cwd, ['config', 'user.name', 'Brief Scheduler Fixture']);
  runGit(cwd, ['config', 'commit.gpgsign', 'false']);
}

/**
 * Create a disposable {remote (bare), root (clone)} pair with one initial commit on `main`. The root is
 * the stand-in for the user's real worktree; the bare remote is the stand-in for origin.
 */
export function makeSchedulerRepo(options = {}) {
  const base = mkdtempSync(path.join(tmpdir(), 'rl-sched-'));
  const remote = path.join(base, 'remote.git');
  const root = path.join(base, 'root');
  runGit(base, ['init', '--bare', '--initial-branch=main', remote]);
  runGit(base, ['clone', '--quiet', remote, root]);
  configIdentity(root);
  writeFileSync(path.join(root, 'README.md'), '# disposable scheduler fixture root\n');
  mkdirSync(path.join(root, 'briefs'), { recursive: true });
  writeFileSync(path.join(root, 'briefs', '.keep'), '');
  runGit(root, ['add', '--', 'README.md', 'briefs/.keep']);
  runGit(root, ['commit', '-m', 'seed disposable fixture root']);
  runGit(root, ['push', '--quiet', 'origin', 'HEAD:main']);
  let worktreeSeq = 0;
  const worktreeDirs = [];
  const worktree = {
    create(sourceRevision) {
      runGit(root, ['fetch', '--quiet', 'origin']);
      const dir = path.join(base, `wt-${worktreeSeq += 1}`);
      const added = runGit(root, ['worktree', 'add', '--detach', dir, sourceRevision || 'origin/main']);
      if (added.code !== 0) throw new Error('fixture worktree add failed: ' + added.stderr);
      configIdentity(dir);
      worktreeDirs.push(dir);
      return {
        dir,
        gitRunner: (args) => runGit(dir, args),
        remove() { runGit(root, ['worktree', 'remove', '--force', dir]); }
      };
    }
  };
  return {
    base, remote, root, worktree,
    gitRunner: (cwd) => (args) => runGit(cwd, args),
    worktreeDirs,
    cleanup() { try { rmSync(base, { recursive: true, force: true }); } catch (error) { /* best effort */ } }
  };
}

/* Snapshot every tracked+untracked file under a directory as path -> sha256 for exact before/after proof. */
export function snapshotTree(dir) {
  const out = {};
  const walk = (abs, rel) => {
    for (const entry of readdirSync(abs).sort()) {
      if (entry === '.git') continue;
      const childAbs = path.join(abs, entry);
      const childRel = rel ? `${rel}/${entry}` : entry;
      if (statSync(childAbs).isDirectory()) walk(childAbs, childRel);
      else out[childRel] = `sha256:${createHash('sha256').update(readFileSync(childAbs)).digest('hex')}`;
    }
  };
  walk(dir, '');
  return out;
}

/* The set of paths git currently reports as staged in a checkout (index vs HEAD). */
export function stagedPaths(cwd) {
  const res = runGit(cwd, ['diff', '--cached', '--name-only']);
  return res.stdout.split('\n').map((l) => l.trim()).filter((l) => l.length > 0).sort();
}

/* List the committed tree of a bare remote's branch (paths only). */
export function remoteTreePaths(remote, branch = 'main') {
  const res = runGit(remote, ['ls-tree', '-r', '--name-only', branch]);
  return res.stdout.split('\n').map((l) => l.trim()).filter((l) => l.length > 0).sort();
}

/* The commit trailers on the remote branch HEAD. */
export function remoteHeadTrailers(remote, branch = 'main') {
  const res = runGit(remote, ['log', '-1', '--format=%(trailers:only,unfold)', branch]);
  return res.stdout.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
}

/* ---------- Lease / journal / clock ---------- */

/** A mkdir-based single-holder lease over a temp lock directory. */
export function makeLease(base) {
  const lockPath = path.join(base, 'run.lock');
  let held = false;
  return {
    lockPath,
    acquire() {
      try { mkdirSync(lockPath); held = true; return { ok: true, release() { if (held) { try { rmSync(lockPath, { recursive: true, force: true }); } catch (e) { /* noop */ } held = false; } } }; }
      catch (error) { return { ok: false, held: true, release() {} }; }
    },
    // Force the lock to already be held (for the concurrent-duplicate refusal case).
    forceHold() { try { mkdirSync(lockPath); held = true; } catch (e) { /* already held */ } }
  };
}

/** A private on-disk run journal (never a repo path). */
export function makeJournal(base) {
  const journalPath = path.join(base, 'run-journal.json');
  return {
    journalPath,
    write(state) { writeFileSync(journalPath, JSON.stringify(state)); },
    read() { return existsSync(journalPath) ? JSON.parse(readFileSync(journalPath, 'utf8')) : null; }
  };
}

/** A deterministic clock that returns a fixed cutoff by default and can be stepped. */
export function makeClock(iso = '2026-07-14T15:05:00.000Z') {
  let value = iso;
  return { now() { return value; }, set(next) { value = next; } };
}

/* ---------- Source acquisition + authorship ---------- */

/* One frozen MarketSessionEvidence bundle + one read per frozen source (the scenario reads). */
export function makeSourceAcquirer(scenario, options = {}) {
  const cutoffAt = options.cutoffAt || '2026-07-14T15:05:00.000Z';
  const evidenceState = options.evidenceState || 'available';
  return async () => {
    if (options.fail) return { ok: false, code: options.failCode || 'B002-SESSION-REQUIRED', reason: options.failReason || 'required-evidence-unavailable' };
    const reads = { ...scenario.reads };
    if (options.omitRead) delete reads[options.omitRead];
    return {
      ok: true,
      evidence: { state: evidenceState, cutoffAt, body: { contractVersion: 'market-session-evidence/v1', cutoffAt, window: scenario.runContext.windowContext.window } },
      reads
    };
  };
}

/* A tool author transport that reproduces the scenario's already-validated brief for the requested source
   (a real bounded author would author it fresh; this echoes the known-good brief so the pool's envelope +
   ToolBrief validation remains a genuine gate). */
export function scenarioToolAuthorFn(scenario) {
  return async (request) => {
    const toolId = request && request.data && request.data.compactedRead && request.data.compactedRead.toolId;
    const brief = scenario.briefs[toolId];
    if (!brief) return { ok: false, error: { code: 'B002-TOOL-AUTHOR', reason: 'no-fixture-brief:' + toolId } };
    return { ok: true, envelope: { contractVersion: 'tool-author-response/v1', requestFingerprint: request.requestFingerprint, brief } };
  };
}

/**
 * Build a complete runBriefRefresh deps object around a disposable repo + the shipped single-source
 * scenario. `overrides` lets a failure test swap in a failing acquirer, a smaller budget, an alternate
 * clock, etc.
 */
export function schedulerDeps(repo, window = 'morning', overrides = {}) {
  const scenario = overrides.scenario || singleSourceScenario(window);
  const sourceCount = scenario.registry.orderedSourceToolIds.length;
  const base = {
    runKey: { kind: 'scheduled', etSessionDate: '2026-07-14', window },
    sourceRevision: 'origin/main',
    window,
    etRunDate: '2026-07-14',
    registry: scenario.registry,
    registryConfig: scenario.runContext.registryConfig,
    calendar: { covers: () => true },
    clock: makeClock(overrides.cutoffAt),
    lease: makeLease(repo.base),
    worktree: repo.worktree,
    acquireSources: makeSourceAcquirer(scenario, overrides.acquireOptions || {}),
    groups: scenario.groups,
    runContext: scenario.runContext,
    profileBudgets: profileBudgets(),
    runBudget: runBudget(sourceCount),
    finalBudget: scenario.finalBudget,
    identity: scenario.identity,
    authorFn: overrides.authorFn || scenarioToolAuthorFn(scenario),
    finalAuthorFn: overrides.finalAuthorFn || envelopeFinalAuthorFn('valid'),
    journal: makeJournal(repo.base),
    remote: 'origin',
    branch: 'main',
    events: [],
    prior: overrides.prior || null,
    recommendationEvents: overrides.recommendationEvents || []
  };
  return { ...base, ...(overrides.deps || {}), scenario };
}
