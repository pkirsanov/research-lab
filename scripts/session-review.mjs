#!/usr/bin/env node
/*
 * Session Review — read-only git-activity audit across sibling project repos.
 *
 * A durable, dependency-free replacement for a chat-session index: it walks
 * every sibling repo under a root directory and classifies each non-default
 * branch as ACTIVE, STALE, MERGED-CLUTTER (deletable), or ORPHAN-RISK
 * (local-only commits with no matching origin/<branch> — the dangerous bucket
 * you never want to silently lose). Side worktrees living OUTSIDE the root
 * (e.g. throwaway fix/verify checkouts like ../wa-fix, ../qf-091) are
 * discovered and shown so no in-flight work hides.
 *
 * It is strictly READ-ONLY and OFFLINE. Every git call is routed through an
 * allowlist guard (assertReadOnlyGit) that refuses any subcommand outside
 *   { rev-parse, for-each-ref, rev-list, status --porcelain, log,
 *     worktree list, symbolic-ref, branch --show-current }
 * and any write-shaped invocation. No fetch / ls-remote / push / commit /
 * checkout / reset / branch -d — ahead/behind is computed against the
 * locally-cached origin/main only. No network is ever touched. Commands run
 * with GIT_OPTIONAL_LOCKS=0 and GIT_TERMINAL_PROMPT=0 so they neither take an
 * index lock nor block on credentials. The classifier is a set of pure
 * functions (classifyBranch / ageDays / parseWorktrees / isInside) so the
 * decision logic is unit-testable with `--selftest`.
 *
 * Usage:
 *   node scripts/session-review.mjs [root] [--json] [--strict]
 *                                   [--active-days=N] [--selftest] [-h|--help]
 *
 *   root             Directory whose immediate children are scanned as repos.
 *                    Default: the grandparent of this script (…/Projects).
 *                    Precedence: CLI positional > $SESSION_REVIEW_ROOT > default.
 *   --json           Emit the structured result as JSON instead of a report.
 *   --strict         Exit 1 if any ORPHAN-RISK branch exists (cron / nudge use).
 *   --active-days=N  "Recently touched" window for ACTIVE (default 2).
 *   --selftest       Run the pure-function classifier unit tests and exit.
 *   -h, --help       Print this help and exit.
 *
 * Exit codes:
 *   0  report produced (and, with --strict, zero ORPHAN-RISK found);
 *      or --selftest and every check passed.
 *   1  --strict and at least one ORPHAN-RISK branch exists;
 *      or --selftest and at least one check failed.
 *   2  usage error (bad flag, git not on PATH, or missing/unreadable root).
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, sep } from 'node:path';

/* ------------------------------------------------------------------ *
 * Read-only git plumbing
 * ------------------------------------------------------------------ */

/* The complete set of git subcommands this tool may ever run. Each entry
   optionally declares `requires` (flags that MUST be present) and/or
   `maxOperands` (positional operands allowed) so that a write-shaped form of
   an otherwise-readable subcommand — e.g. `symbolic-ref HEAD refs/heads/x`
   (a ref write) or `branch -D foo` (a delete) — is refused, not just absent. */
const READONLY_GIT = {
  'rev-parse': {},
  'for-each-ref': {},
  'rev-list': {},
  'log': {},
  'symbolic-ref': { maxOperands: 1 }, // read form `symbolic-ref <name>`; the 2-operand write form is refused
  'status': { requires: ['--porcelain'] },
  'worktree': { requires: ['list'] }, // `worktree add/remove/prune/...` lack `list` → refused
  'branch': { requires: ['--show-current'] }, // `branch -d/-D/-m/...` lack `--show-current` → refused
};

/* Child-process environment: never take optional locks (pure read guarantee),
   never prompt for credentials, never launch a pager. */
const GIT_ENV = {
  ...process.env,
  GIT_OPTIONAL_LOCKS: '0',
  GIT_TERMINAL_PROMPT: '0',
  GIT_PAGER: 'cat',
};

/* Hard gate proving the read-only guarantee at runtime. Because every call
   site passes a static args array, this can only throw on a programming
   error (caught by --selftest / manual review), never on repo state. */
function assertReadOnlyGit(args) {
  const sub = args[0];
  const spec = READONLY_GIT[sub];
  if (spec === undefined) {
    throw new Error(`session-review: refusing non-allowlisted git subcommand "${sub}"`);
  }
  if (spec.requires) {
    for (const need of spec.requires) {
      if (!args.includes(need)) {
        throw new Error(`session-review: git ${sub} must include ${need} (read-only guarantee)`);
      }
    }
  }
  if (spec.maxOperands != null) {
    const operands = args.slice(1).filter((a) => !a.startsWith('-'));
    if (operands.length > spec.maxOperands) {
      throw new Error(`session-review: git ${sub} invoked with a write-shaped operand list`);
    }
  }
}

/* Run an allowlisted git command. Returns raw stdout on success, or null on
   any failure (non-zero exit, timeout, missing ref, unborn HEAD, ...). The
   guard runs first; genuine repo-state failures are swallowed to null so the
   caller can degrade gracefully and the tool never crashes. */
function runGit(cwd, args) {
  assertReadOnlyGit(args);
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      env: GIT_ENV,
      timeout: 15000,
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
    });
  } catch {
    return null;
  }
}

/* Trimmed single value: '' means "ran, empty output" (e.g. detached
   `branch --show-current`); null means "command failed". The distinction
   matters for HEAD-state detection, so do not collapse the two. */
function gitStr(cwd, args) {
  const out = runGit(cwd, args);
  return out == null ? null : out.trim();
}

/* Non-empty output lines (CR-safe). [] on failure or empty output. */
function gitLines(cwd, args) {
  const out = runGit(cwd, args);
  if (out == null) return [];
  return out.split('\n').map((s) => s.replace(/\r$/, '')).filter((s) => s.length > 0);
}

/* The single git call NOT routed through the allowlist: a constant,
   output-discarded version probe used only to tell "git missing" apart from
   "no repos found". It cannot mutate anything. */
function gitAvailable() {
  try {
    execFileSync('git', ['--version'], { stdio: 'ignore', timeout: 10000, windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Pure, unit-testable logic (no I/O — exercised by --selftest)
 * ------------------------------------------------------------------ */

const CLASS = {
  MERGED: 'MERGED_CLUTTER',
  ORPHAN: 'ORPHAN_RISK',
  ACTIVE: 'ACTIVE',
  STALE: 'STALE',
};

/* Age of an epoch (seconds) relative to now (seconds), in days. A missing or
   non-finite timestamp is treated as infinitely old so it can never look
   "recent". Future timestamps (clock skew) yield a negative age → recent. */
function ageDays(epochSec, nowSec) {
  if (typeof epochSec !== 'number' || !Number.isFinite(epochSec)) return Infinity;
  if (typeof nowSec !== 'number' || !Number.isFinite(nowSec)) return Infinity;
  return (nowSec - epochSec) / 86400;
}

/* Classify a single non-default branch. Strict precedence — the FIRST rule
   that matches wins:
     1. MERGED_CLUTTER — aheadOfMain === 0 (fully contained in origin/main).
     2. ORPHAN_RISK    — no origin/<branch> ref AND aheadOfMain > 0.
     3. ACTIVE         — touched within activeDays AND live (checked out in a
                         worktree, OR has a remote ref, OR its worktree is dirty).
     4. STALE          — everything else.
   `aheadOfMain === null` means origin/main was not locally cached, i.e. the
   ahead count is UNKNOWN: such a branch can be neither confidently "merged"
   (rule 1 needs a real 0) nor confidently "orphan by ahead-count" (rule 2
   needs a real > 0); it falls through to ACTIVE/STALE, never into the
   deletable bucket. */
function classifyBranch(b, opts) {
  const activeDays = opts && Number.isFinite(opts.activeDays) ? opts.activeDays : 2;
  const nowSec = opts && Number.isFinite(opts.nowSec) ? opts.nowSec : Math.floor(Date.now() / 1000);
  const ahead = b.aheadOfMain;
  const aheadKnown = typeof ahead === 'number' && Number.isFinite(ahead);

  if (aheadKnown && ahead === 0) return CLASS.MERGED;
  if (!b.hasRemoteRef && aheadKnown && ahead > 0) return CLASS.ORPHAN;

  const recent = ageDays(b.lastEpoch, nowSec) <= activeDays;
  if (recent && (b.isCheckedOut || b.hasRemoteRef || b.worktreeDirty)) return CLASS.ACTIVE;

  return CLASS.STALE;
}

/* Parse `git worktree list --porcelain` into records. Pure string → array so
   it is directly unit-testable. Records are separated by blank lines; keys of
   interest: worktree <path>, HEAD <sha>, branch refs/heads/<name>, bare,
   detached (locked/prunable are ignored). */
function parseWorktrees(porcelain) {
  const records = [];
  if (!porcelain) return records;
  let cur = null;
  for (const rawLine of porcelain.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (line === '') {
      if (cur) { records.push(cur); cur = null; }
      continue;
    }
    const spIdx = line.indexOf(' ');
    const key = spIdx === -1 ? line : line.slice(0, spIdx);
    const val = spIdx === -1 ? '' : line.slice(spIdx + 1);
    if (key === 'worktree') {
      if (cur) records.push(cur);
      cur = { path: val, head: null, branch: null, bare: false, detached: false };
    } else if (!cur) {
      continue;
    } else if (key === 'HEAD') {
      cur.head = val;
    } else if (key === 'branch') {
      cur.branch = val.replace(/^refs\/heads\//, '');
    } else if (key === 'bare') {
      cur.bare = true;
    } else if (key === 'detached') {
      cur.detached = true;
    }
  }
  if (cur) records.push(cur);
  return records;
}

/* True iff absolute path `p` is the root itself or lives beneath it. Uses a
   trailing separator so that "/x/Projects" is NOT considered to contain
   "/x/ProjectsX/y". */
function isInside(root, p) {
  if (!root || !p) return false;
  const r = resolve(root);
  const q = resolve(p);
  return q === r || q.startsWith(r + sep);
}

/* ------------------------------------------------------------------ *
 * Repo discovery + data gathering
 * ------------------------------------------------------------------ */

/* Immediate child directories of `root` (sorted, hidden dirs skipped,
   symlinks-to-dirs followed). Non-directories are ignored. */
function discoverCandidates(rootAbs) {
  let entries;
  try {
    entries = readdirSync(rootAbs, { withFileTypes: true });
  } catch (e) {
    return { error: e.message, candidates: [] };
  }
  const candidates = [];
  for (const d of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (d.name.startsWith('.')) continue;
    let isDir = d.isDirectory();
    if (!isDir && d.isSymbolicLink()) {
      try { isDir = statSync(join(rootAbs, d.name)).isDirectory(); } catch { isDir = false; }
    }
    if (!isDir) continue;
    candidates.push({ name: d.name, path: join(rootAbs, d.name) });
  }
  return { error: null, candidates };
}

const aheadStr = (n) => (typeof n === 'number' && Number.isFinite(n) ? String(n) : '?');

/* Gather everything about one candidate directory. Returns either a repo
   record or a { skipped:true, reason } marker. The whole body is guarded so a
   surprising git/FS condition degrades to a skip rather than a crash. */
function gatherRepo(candidate, opts) {
  const cwd = candidate.path;
  try {
    if (gitStr(cwd, ['rev-parse', '--git-dir']) === null) {
      return { skipped: true, name: candidate.name, path: cwd, reason: 'not a git repository' };
    }

    // HEAD state — safe for normal, detached, and unborn (no-commit) repos.
    const showCur = gitStr(cwd, ['branch', '--show-current']); // '' when detached; name when normal/unborn
    const headSha = gitStr(cwd, ['rev-parse', '--verify', '--quiet', 'HEAD']); // null when unborn/empty
    const symref = gitStr(cwd, ['symbolic-ref', '--quiet', 'HEAD']); // 'refs/heads/<name>' or null (detached)
    const unborn = headSha === null && symref !== null;
    const detached = symref === null && headSha !== null;
    const branchName = detached
      ? null
      : (showCur || (symref ? symref.replace(/^refs\/heads\//, '') : null));

    const dirtyCount = gitLines(cwd, ['status', '--porcelain']).length;

    // Ahead/behind of the current HEAD vs its upstream, only if one exists.
    let upstream = { name: null, ahead: null, behind: null };
    const upName = gitStr(cwd, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
    if (upName) {
      upstream.name = upName;
      const lr = gitStr(cwd, ['rev-list', '--left-right', '--count', '@{u}...HEAD']);
      if (lr) {
        const parts = lr.split(/\s+/);
        const behind = Number(parts[0]);
        const ahead = Number(parts[1]);
        upstream.behind = Number.isFinite(behind) ? behind : null;
        upstream.ahead = Number.isFinite(ahead) ? ahead : null;
      }
    }

    // Last commit on HEAD (null on an unborn repo). NUL-separated fields.
    let lastCommit = null;
    const li = gitStr(cwd, ['log', '-1', '--format=%ct%x00%cr%x00%h%x00%an%x00%s', 'HEAD']);
    if (li) {
      const [ct, cr, h, an, s] = li.split('\0');
      const epoch = Number(ct);
      lastCommit = {
        epoch: Number.isFinite(epoch) ? epoch : null,
        relDate: cr || null,
        shortSha: h || null,
        author: an || null,
        subject: s || null,
      };
    }

    // Worktrees (including side worktrees outside the root). Compute each
    // worktree's own dirty count so branch classification can see it.
    const worktrees = parseWorktrees(runGit(cwd, ['worktree', 'list', '--porcelain']));
    for (const w of worktrees) {
      w.insideRoot = isInside(opts.rootAbs, w.path);
      w.dirtyCount = 0;
      if (!w.bare && existsSync(w.path)) {
        w.dirtyCount = gitLines(w.path, ['status', '--porcelain']).length;
      }
    }
    const wtByBranch = new Map();
    for (const w of worktrees) if (w.branch) wtByBranch.set(w.branch, w);

    // Non-default local branches → per-branch signals → classification.
    const hasMain = gitStr(cwd, ['rev-parse', '--verify', '--quiet', 'refs/remotes/origin/main']) !== null;
    const localBranches = gitLines(cwd, ['for-each-ref', '--format=%(refname:short)', 'refs/heads/']);
    const branches = [];
    for (const name of localBranches) {
      if (name === 'main' || name === 'master') continue;

      let lastEpoch = null;
      let lastRelDate = null;
      const info = gitStr(cwd, ['log', '-1', '--format=%ct%x00%cr', 'refs/heads/' + name]);
      if (info) {
        const [ct, cr] = info.split('\0');
        const e = Number(ct);
        lastEpoch = Number.isFinite(e) ? e : null;
        lastRelDate = cr || null;
      }

      let aheadOfMain = null; // null = unknown (origin/main not cached)
      if (hasMain) {
        const c = gitStr(cwd, ['rev-list', '--count', 'origin/main..refs/heads/' + name]);
        const n = c === null ? null : Number(c);
        aheadOfMain = Number.isFinite(n) ? n : null;
      }

      const hasRemoteRef = gitStr(cwd, ['rev-parse', '--verify', '--quiet', 'refs/remotes/origin/' + name]) !== null;
      const wt = wtByBranch.get(name) || null;
      const isCheckedOut = wt !== null;
      const worktreeDirty = wt ? wt.dirtyCount > 0 : false;

      const classification = classifyBranch(
        { aheadOfMain, hasRemoteRef, lastEpoch, isCheckedOut, worktreeDirty },
        opts,
      );

      branches.push({
        name,
        classification,
        aheadOfMain,
        hasRemoteRef,
        lastEpoch,
        lastRelDate,
        isCheckedOut,
        worktreeDirty,
        worktreePath: wt ? wt.path : null,
        worktreeOutsideRoot: wt ? !wt.insideRoot : false,
      });
    }

    return {
      skipped: false,
      name: candidate.name,
      path: cwd,
      branch: branchName,
      detached,
      unborn,
      headSha,
      dirtyCount,
      upstream,
      lastCommit,
      worktrees,
      branches,
    };
  } catch (e) {
    return { skipped: true, name: candidate.name, path: cwd, reason: 'gather error: ' + e.message };
  }
}

/* Roll the gathered repos up into the final result object (also the --json
   payload). */
function buildResult(rootAbs, opts, repos, skipped) {
  const sections = {
    [CLASS.ORPHAN]: [],
    [CLASS.ACTIVE]: [],
    [CLASS.STALE]: [],
    [CLASS.MERGED]: [],
  };
  let branchesClassified = 0;
  let sideWorktrees = 0;

  for (const r of repos) {
    for (const w of r.worktrees) if (!w.insideRoot) sideWorktrees++;
    for (const b of r.branches) {
      branchesClassified++;
      sections[b.classification].push({
        repo: r.name,
        repoPath: r.path,
        branch: b.name,
        classification: b.classification,
        aheadOfMain: b.aheadOfMain,
        hasRemoteRef: b.hasRemoteRef,
        lastEpoch: b.lastEpoch,
        lastRelDate: b.lastRelDate,
        isCheckedOut: b.isCheckedOut,
        worktreeDirty: b.worktreeDirty,
        worktreePath: b.worktreePath,
        worktreeOutsideRoot: b.worktreeOutsideRoot,
      });
    }
  }

  return {
    tool: 'session-review',
    root: rootAbs,
    generatedAt: new Date(opts.nowSec * 1000).toISOString(),
    nowEpoch: opts.nowSec,
    activeDays: opts.activeDays,
    repos,
    skipped,
    sections,
    summary: {
      reposScanned: repos.length,
      reposSkipped: skipped.length,
      branchesClassified,
      orphanRisk: sections[CLASS.ORPHAN].length,
      active: sections[CLASS.ACTIVE].length,
      stale: sections[CLASS.STALE].length,
      mergedClutter: sections[CLASS.MERGED].length,
      sideWorktrees,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Human report rendering
 * ------------------------------------------------------------------ */

function renderHuman(result) {
  const out = [];
  const line = (s = '') => out.push(s);
  const rule = () => line('='.repeat(72));
  const flags = (b) => {
    const f = [];
    if (b.isCheckedOut) f.push('checked-out');
    if (b.hasRemoteRef) f.push('remote');
    if (b.worktreeDirty) f.push('dirty');
    return f.length ? '[' + f.join(', ') + ']' : '';
  };

  line('Session Review \u2014 read-only git activity across sibling repos');
  line(`  root:      ${result.root}`);
  line(`  generated: ${result.generatedAt}  (activeDays=${result.activeDays})`);
  line(
    `  scanned:   ${result.summary.reposScanned} repos, ${result.summary.reposSkipped} skipped, ` +
    `${result.summary.branchesClassified} non-default branches`,
  );
  line('');

  // ---- REPOS ----
  rule();
  line('REPOS');
  rule();
  const nameW = Math.max(
    4,
    ...result.repos.map((r) => r.name.length),
    ...result.skipped.map((s) => s.name.length),
  );
  for (const r of result.repos) {
    const branchLabel = r.detached
      ? `(detached@${(r.headSha || '').slice(0, 7)})`
      : r.unborn
        ? `(unborn:${r.branch || '?'})`
        : (r.branch || '?');
    const dirty = r.dirtyCount > 0 ? `dirty:${r.dirtyCount}` : 'clean';
    const up = r.upstream.name
      ? `+${r.upstream.ahead}/-${r.upstream.behind} vs ${r.upstream.name}`
      : '(no upstream)';
    const last = r.lastCommit ? r.lastCommit.relDate : '(no commits)';
    line(
      `  ${r.name.padEnd(nameW)}  ${branchLabel.padEnd(24)}  ${dirty.padEnd(9)}  ` +
      `wt=${r.worktrees.length}  ${up.padEnd(30)}  last: ${last}`,
    );
  }
  for (const s of result.skipped) {
    line(`  ${s.name.padEnd(nameW)}  (skipped: ${s.reason})`);
  }

  // ---- SIDE WORKTREES (outside root) ----
  const side = [];
  for (const r of result.repos) {
    for (const w of r.worktrees) if (!w.insideRoot) side.push({ repo: r.name, w });
  }
  line('');
  rule();
  line(`SIDE WORKTREES (outside root) \u2014 ${side.length}`);
  rule();
  if (!side.length) {
    line('  (none)');
  } else {
    for (const { repo, w } of side) {
      const b = w.detached ? '(detached)' : (w.branch || '?');
      const dirty = w.dirtyCount > 0 ? `dirty:${w.dirtyCount}` : 'clean';
      line(`  ${repo}/${b}  ${dirty}  ${w.path}`);
    }
  }

  // ---- ORPHAN-RISK ----
  line('');
  rule();
  line('ORPHAN-RISK \u2014 local commits with no origin/<branch> (protect before any cleanup)');
  rule();
  const orphans = result.sections[CLASS.ORPHAN];
  if (!orphans.length) {
    line('  (none)');
  } else {
    for (const it of orphans) {
      const where = it.worktreeOutsideRoot && it.worktreePath ? `  -> ${it.worktreePath}` : '';
      line(
        `  ${it.repo}/${it.branch}  ahead=${aheadStr(it.aheadOfMain)}  ` +
        `age=${it.lastRelDate || 'unknown'}  LOCAL-ONLY ${flags(it)}${where}`.trimEnd(),
      );
    }
  }

  // ---- ACTIVE ----
  line('');
  rule();
  line(`ACTIVE \u2014 touched within ${result.activeDays}d and live (checked out / on remote / dirty)`);
  rule();
  const active = result.sections[CLASS.ACTIVE];
  if (!active.length) {
    line('  (none)');
  } else {
    for (const it of active) {
      line(`  ${it.repo}/${it.branch}  ahead=${aheadStr(it.aheadOfMain)}  last=${it.lastRelDate || 'unknown'}  ${flags(it)}`.trimEnd());
    }
  }

  // ---- STALE ----
  line('');
  rule();
  line(`STALE \u2014 idle / unmerged, older than ${result.activeDays}d (revisit or let expire)`);
  rule();
  const stale = result.sections[CLASS.STALE];
  if (!stale.length) {
    line('  (none)');
  } else {
    for (const it of stale) {
      line(`  ${it.repo}/${it.branch}  ahead=${aheadStr(it.aheadOfMain)}  last=${it.lastRelDate || 'unknown'}  ${flags(it)}`.trimEnd());
    }
  }

  // ---- MERGED-CLUTTER ----
  line('');
  rule();
  line('MERGED-CLUTTER (deletable) \u2014 fully contained in origin/main (ahead=0)');
  rule();
  const merged = result.sections[CLASS.MERGED];
  if (!merged.length) {
    line('  (none)');
  } else {
    for (const it of merged) {
      line(`  ${it.repo}/${it.branch}  last=${it.lastRelDate || 'unknown'}  ${flags(it)}`.trimEnd());
    }
  }

  // ---- footer ----
  line('');
  line(
    'Legend: ORPHAN-RISK = local commits with no origin/<branch> (protect); ' +
    'MERGED-CLUTTER = ahead=0 of origin/main (deletable).',
  );
  line('Read-only & offline: no fetch/push/commit/checkout \u2014 origin/main is the local cache.');

  return out.join('\n');
}

/* ------------------------------------------------------------------ *
 * Self-test (pure-function unit tests; mirrors scripts/selftest.mjs)
 * ------------------------------------------------------------------ */

function runSelftest() {
  let failures = 0, passes = 0;
  const assert = (cond, msg) => {
    if (cond) { passes++; console.log('  \u2713 ' + msg); }
    else { failures++; console.log('  \u2717 FAIL: ' + msg); }
  };
  const approx = (a, b, tol) => Math.abs(a - b) <= tol;
  const group = (name) => console.log('\n' + name);

  const NOW = 1700000000; // fixed "now" so age math is deterministic
  const DAY = 86400;
  const opts = (over) => Object.assign({ activeDays: 2, nowSec: NOW }, over || {});
  const branch = (over) => Object.assign(
    { aheadOfMain: null, hasRemoteRef: false, lastEpoch: NOW, isCheckedOut: false, worktreeDirty: false },
    over || {},
  );

  /* ---------- classifyBranch: precedence & buckets ---------- */
  try {
    group('classifyBranch \u2014 strict precedence & buckets');

    // 1) MERGED wins unconditionally when ahead === 0.
    assert(classifyBranch(branch({ aheadOfMain: 0 }), opts()) === CLASS.MERGED,
      'ahead=0 => MERGED_CLUTTER');
    assert(
      classifyBranch(branch({ aheadOfMain: 0, hasRemoteRef: true, isCheckedOut: true, worktreeDirty: true }), opts()) === CLASS.MERGED,
      'ahead=0 beats every live signal (still MERGED_CLUTTER)');
    assert(classifyBranch(branch({ aheadOfMain: 0, lastEpoch: NOW - 99 * DAY }), opts()) === CLASS.MERGED,
      'ahead=0 old branch => MERGED_CLUTTER (deletable regardless of age)');

    // 2) ORPHAN: no remote ref AND ahead>0 — and it outranks ACTIVE.
    assert(classifyBranch(branch({ aheadOfMain: 3, hasRemoteRef: false, lastEpoch: NOW - 30 * DAY }), opts()) === CLASS.ORPHAN,
      'no remote + ahead>0 => ORPHAN_RISK');
    assert(
      classifyBranch(branch({ aheadOfMain: 2, hasRemoteRef: false, lastEpoch: NOW, isCheckedOut: true, worktreeDirty: true }), opts()) === CLASS.ORPHAN,
      'ORPHAN_RISK outranks ACTIVE (rule 2 before rule 3) even when recent+checked-out+dirty');

    // 3) ACTIVE: recent AND (checked out | remote | dirty).
    assert(classifyBranch(branch({ aheadOfMain: 5, hasRemoteRef: true, lastEpoch: NOW - 1 * DAY, isCheckedOut: true }), opts()) === CLASS.ACTIVE,
      'recent + remote + checked-out => ACTIVE (remote ref means not orphan)');
    assert(classifyBranch(branch({ aheadOfMain: 5, hasRemoteRef: true, lastEpoch: NOW - 1 * DAY }), opts()) === CLASS.ACTIVE,
      'recent + remote-only => ACTIVE');
    assert(classifyBranch(branch({ aheadOfMain: null, hasRemoteRef: false, lastEpoch: NOW - 1 * DAY, worktreeDirty: true }), opts()) === CLASS.ACTIVE,
      'recent + dirty worktree (unknown ahead) => ACTIVE, not ORPHAN');
    assert(classifyBranch(branch({ aheadOfMain: 4, hasRemoteRef: true, lastEpoch: NOW - 1 * DAY, isCheckedOut: true }), opts()) === CLASS.ACTIVE,
      'recent + checked-out => ACTIVE');

    // 4) STALE: everything else.
    assert(classifyBranch(branch({ aheadOfMain: 4, hasRemoteRef: true, lastEpoch: NOW - 10 * DAY }), opts()) === CLASS.STALE,
      'old + remote + ahead>0 + not-live => STALE');
    assert(classifyBranch(branch({ aheadOfMain: null, hasRemoteRef: false, lastEpoch: NOW - 1 * DAY }), opts()) === CLASS.STALE,
      'recent but nothing live (no checkout/remote/dirty) => STALE');
    assert(classifyBranch(branch({ aheadOfMain: null, hasRemoteRef: false, lastEpoch: NOW - 40 * DAY }), opts()) === CLASS.STALE,
      'unknown ahead + no remote + old => STALE (never mis-flagged deletable)');

    // Active-window boundary (inclusive) and defaults.
    assert(classifyBranch(branch({ aheadOfMain: 1, hasRemoteRef: true, lastEpoch: NOW - 2 * DAY }), opts()) === CLASS.ACTIVE,
      'exactly activeDays old (age<=window is inclusive) => ACTIVE');
    assert(classifyBranch(branch({ aheadOfMain: 1, hasRemoteRef: true, lastEpoch: NOW - (2 * DAY + 60) }), opts()) === CLASS.STALE,
      'just past the window => STALE');
    assert(classifyBranch(branch({ aheadOfMain: 3, hasRemoteRef: true, lastEpoch: NOW - 1 * DAY }), { nowSec: NOW }) === CLASS.ACTIVE,
      'activeDays defaults to 2 (1-day-old + remote => ACTIVE)');
    assert(classifyBranch(branch({ aheadOfMain: 3, hasRemoteRef: true, lastEpoch: NOW - 3 * DAY }), { nowSec: NOW }) === CLASS.STALE,
      'activeDays defaults to 2 (3-day-old => STALE)');
    assert(classifyBranch(branch({ aheadOfMain: 3, hasRemoteRef: true, lastEpoch: NOW - 4 * DAY }), opts({ activeDays: 5 })) === CLASS.ACTIVE,
      'custom activeDays=5 widens the window (4-day-old => ACTIVE)');
  } catch (e) { failures++; console.log('  \u2717 FAIL (classifyBranch group threw): ' + e.message); }

  /* ---------- ageDays: math & guards ---------- */
  try {
    group('ageDays \u2014 day math & missing-timestamp guards');
    assert(approx(ageDays(NOW - 3 * DAY, NOW), 3, 1e-9), 'three days ago => 3.0');
    assert(ageDays(NOW, NOW) === 0, 'same instant => 0');
    assert(ageDays(NOW + DAY, NOW) === -1, 'future timestamp => negative age (still "recent")');
    assert(ageDays(null, NOW) === Infinity, 'null epoch => Infinity (never recent)');
    assert(ageDays(NaN, NOW) === Infinity, 'NaN epoch => Infinity');
    assert(ageDays(NOW, NaN) === Infinity, 'NaN now => Infinity (defensive)');
  } catch (e) { failures++; console.log('  \u2717 FAIL (ageDays group threw): ' + e.message); }

  /* ---------- parseWorktrees: porcelain parsing ---------- */
  try {
    group('parseWorktrees \u2014 `worktree list --porcelain` parsing');
    const sample = [
      'worktree /a/main', 'HEAD aaaa', 'branch refs/heads/main', '',
      'worktree /b/side', 'HEAD bbbb', 'branch refs/heads/feature/x', '',
      'worktree /c/loose', 'HEAD cccc', 'detached', '',
    ].join('\n');
    const recs = parseWorktrees(sample);
    assert(recs.length === 3, 'parses three worktree records');
    assert(recs[0].path === '/a/main' && recs[0].branch === 'main', 'record 0: path + short branch name');
    assert(recs[1].branch === 'feature/x', 'record 1: slashed branch name preserved');
    assert(recs[2].detached === true && recs[2].branch === null, 'record 2: detached => branch null');
    const bare = parseWorktrees('worktree /d/bare\nbare\n');
    assert(bare.length === 1 && bare[0].bare === true, 'bare worktree flagged');
    assert(parseWorktrees('').length === 0 && parseWorktrees(null).length === 0, 'empty/null input => []');
    const noTrail = parseWorktrees('worktree /e/x\nHEAD eeee\nbranch refs/heads/z');
    assert(noTrail.length === 1 && noTrail[0].branch === 'z', 'final record without trailing blank line still captured');
  } catch (e) { failures++; console.log('  \u2717 FAIL (parseWorktrees group threw): ' + e.message); }

  /* ---------- isInside: containment boundary ---------- */
  try {
    group('isInside \u2014 root-containment (side-worktree detection)');
    const root = '/Users/x/Projects';
    assert(isInside(root, '/Users/x/Projects/repo') === true, 'child dir is inside root');
    assert(isInside(root, '/Users/x/Projects') === true, 'root itself counts as inside');
    assert(isInside(root, '/Users/x/qf-091') === false, 'sibling of root is OUTSIDE (side worktree)');
    assert(isInside(root, '/Users/x/ProjectsX/y') === false, 'prefix-but-not-boundary is OUTSIDE (no /x/Projects != /x/ProjectsX)');
    assert(isInside('', '/a') === false && isInside(root, '') === false, 'empty inputs => false');
  } catch (e) { failures++; console.log('  \u2717 FAIL (isInside group threw): ' + e.message); }

  /* ---------- read-only guard: refuses mutating/network shapes ---------- */
  try {
    group('assertReadOnlyGit \u2014 refuses every non-read-only shape');
    const refuses = (args) => { try { assertReadOnlyGit(args); return false; } catch { return true; } };
    const allows = (args) => { try { assertReadOnlyGit(args); return true; } catch { return false; } };
    // Allowed read-only forms actually used by the tool:
    assert(allows(['rev-parse', '--git-dir']), 'allows rev-parse --git-dir');
    assert(allows(['status', '--porcelain']), 'allows status --porcelain');
    assert(allows(['worktree', 'list', '--porcelain']), 'allows worktree list --porcelain');
    assert(allows(['branch', '--show-current']), 'allows branch --show-current');
    assert(allows(['symbolic-ref', '--quiet', 'HEAD']), 'allows symbolic-ref (read form)');
    // Mutations / network / write-shapes are refused:
    assert(refuses(['fetch']), 'refuses fetch (network)');
    assert(refuses(['ls-remote']), 'refuses ls-remote (network)');
    assert(refuses(['push']), 'refuses push');
    assert(refuses(['commit', '-m', 'x']), 'refuses commit');
    assert(refuses(['checkout', 'main']), 'refuses checkout');
    assert(refuses(['reset', '--hard']), 'refuses reset');
    assert(refuses(['branch', '-D', 'feature/x']), 'refuses branch -D (delete lacks --show-current)');
    assert(refuses(['status']), 'refuses status without --porcelain');
    assert(refuses(['worktree', 'add', '/tmp/x']), 'refuses worktree add (lacks list)');
    assert(refuses(['symbolic-ref', 'HEAD', 'refs/heads/x']), 'refuses symbolic-ref write form (2 operands)');
  } catch (e) { failures++; console.log('  \u2717 FAIL (read-only guard group threw): ' + e.message); }

  console.log('\n' + '='.repeat(48));
  console.log('session-review self-test: ' + passes + ' passed, ' + failures + ' failed');
  console.log('='.repeat(48));
  process.exit(failures ? 1 : 0);
}

/* ------------------------------------------------------------------ *
 * CLI entry point
 * ------------------------------------------------------------------ */

const HELP = `session-review \u2014 read-only git activity across sibling repos

Usage:
  node scripts/session-review.mjs [root] [--json] [--strict]
                                  [--active-days=N] [--selftest] [-h|--help]

  root             Directory whose immediate children are scanned as repos.
                   Default: grandparent of this script (…/Projects).
                   Precedence: CLI positional > $SESSION_REVIEW_ROOT > default.
  --json           Emit the structured result as JSON instead of a report.
  --strict         Exit 1 if any ORPHAN-RISK branch exists (cron / nudge use).
  --active-days=N  "Recently touched" window for ACTIVE (default 2).
  --selftest       Run the pure-function classifier unit tests and exit.
  -h, --help       Print this help and exit.

Read-only & offline: only rev-parse, for-each-ref, rev-list, status
--porcelain, log, worktree list, symbolic-ref, and branch --show-current are
ever run. origin/main is read from the local cache; no network is touched.`;

function fail(msg) {
  console.error('session-review: ' + msg);
  process.exit(2);
}

function main() {
  const argv = process.argv.slice(2);
  let rootArg = null;
  let json = false, strict = false, selftest = false, help = false;
  let activeDays = 2;

  for (const a of argv) {
    if (a === '--json') json = true;
    else if (a === '--strict') strict = true;
    else if (a === '--selftest') selftest = true;
    else if (a === '-h' || a === '--help') help = true;
    else if (a.startsWith('--active-days=')) {
      const v = Number(a.slice('--active-days='.length));
      if (!Number.isFinite(v) || v < 0) fail(`invalid --active-days value: ${a.slice('--active-days='.length)}`);
      activeDays = v;
    } else if (a.startsWith('-')) {
      fail(`unknown option: ${a} (use --help)`);
    } else if (rootArg === null) {
      rootArg = a;
    } else {
      fail(`unexpected extra argument: ${a}`);
    }
  }

  if (help) { console.log(HELP); process.exit(0); }
  if (selftest) { runSelftest(); return; } // runSelftest() calls process.exit

  if (!gitAvailable()) fail('git was not found on PATH');

  const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
  const DEFAULT_ROOT = resolve(SCRIPT_DIR, '..', '..'); // …/research-lab/scripts -> …/Projects
  const rootRaw = rootArg !== null ? rootArg : (process.env.SESSION_REVIEW_ROOT || DEFAULT_ROOT);
  const rootAbs = resolve(rootRaw);

  let dirOk = false;
  try { dirOk = statSync(rootAbs).isDirectory(); } catch { dirOk = false; }
  if (!dirOk) fail(`root is not a directory (or is unreadable): ${rootAbs}`);

  const opts = { rootAbs, activeDays, nowSec: Math.floor(Date.now() / 1000) };

  const { error, candidates } = discoverCandidates(rootAbs);
  if (error) fail(`could not read root: ${error}`);

  const repos = [];
  const skipped = [];
  for (const c of candidates) {
    const rec = gatherRepo(c, opts);
    if (rec.skipped) skipped.push({ name: rec.name, path: rec.path, reason: rec.reason });
    else repos.push(rec);
  }

  const result = buildResult(rootAbs, opts, repos, skipped);

  if (json) console.log(JSON.stringify(result, null, 2));
  else console.log(renderHuman(result));

  const exitCode = strict && result.summary.orphanRisk > 0 ? 1 : 0;
  process.exit(exitCode);
}

main();
