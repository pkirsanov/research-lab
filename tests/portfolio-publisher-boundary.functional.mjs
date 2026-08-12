import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { ROOT, commitTrackedLeak, trackedPathsContaining } from './portfolio-survival.support.mjs';

/*
 * Feature 008 Scope 04 — publisher boundary (TP-04-02).
 *
 * The generic brief publisher is a READ-ONLY boundary subject for this feature: it may never
 * import the personal module, name a personal storage key, or receive a personal value through
 * env or argv. These assertions exercise the real publisher surface rather than a fixture of it,
 * because a test that only searches its own sentinel proves nothing about the boundary.
 */

// The publisher surface this scope treats as the boundary subject. Every entry is verified to
// exist, so a renamed script fails the row instead of silently shrinking what is scanned.
const PUBLISHER_SCRIPTS = Object.freeze([
  'scripts/brief-publication.mjs',
  'scripts/brief-distributed-publish.mjs',
  'scripts/brief-refresh.mjs',
  'scripts/brief-refresh-and-push.sh'
]);

// Personal surfaces the publisher must never reach. These are the exact keys the Scope 01/03
// store declares, so this list cannot drift into naming something the product does not use.
const PERSONAL_STORAGE_KEYS = Object.freeze([
  'rlPortfolioWorkspaceV1.pointer',
  'rlPortfolioWorkspaceV1.slotA',
  'rlPortfolioWorkspaceV1.slotB',
  'rlPortfolioWorkspaceV1.quarantine',
  'rlPortfolioWorkspaceSessionV1',
  'rlReturnContextV1'
]);

const PERSONAL_MODULE = 'rlportfolio.js';
const SENTINEL = 'SCOPE04-PERSONAL-SENTINEL-b3f9';

function publisherSources() {
  return PUBLISHER_SCRIPTS.map((relative) => {
    const absolute = resolve(ROOT, relative);
    assert.equal(existsSync(absolute), true, `publisher boundary subject must exist: ${relative}`);
    return { relative, source: readFileSync(absolute, 'utf8') };
  });
}

test('SCN-008-005 TP-04-02: no publisher script imports the personal module or names a personal storage key', () => {
  const sources = publisherSources();
  assert.equal(sources.length, PUBLISHER_SCRIPTS.length, 'every declared publisher script was read');

  for (const { relative, source } of sources) {
    assert.equal(
      source.includes(PERSONAL_MODULE), false,
      `${relative} must not reference ${PERSONAL_MODULE} — the publisher is generic-only`
    );
    for (const key of PERSONAL_STORAGE_KEYS) {
      assert.equal(
        source.includes(key), false,
        `${relative} must not name the personal storage key ${key}`
      );
    }
  }
});

test('SCN-008-005 TP-04-02: the personal-key scan is non-vacuous — it detects a real committed leak', () => {
  // Without this, "no publisher names a personal key" could be true because the scan is inert.
  // A disposable repo that genuinely commits the key proves the detector fires.
  const leak = commitTrackedLeak(PERSONAL_STORAGE_KEYS[0], 'scripts/brief-publication.mjs');
  try {
    const hits = trackedPathsContaining(PERSONAL_STORAGE_KEYS[0], leak.root);
    assert.deepEqual(
      hits, ['scripts/brief-publication.mjs'],
      'the scanner must find a personal key that was genuinely committed to a publisher path'
    );
  } finally {
    leak.cleanup();
  }

  // And the same scanner finds nothing in the real repository.
  for (const key of PERSONAL_STORAGE_KEYS) {
    const hits = trackedPathsContaining(key).filter((path) => PUBLISHER_SCRIPTS.includes(path));
    assert.deepEqual(hits, [], `no tracked publisher script may contain ${key}`);
  }
});

test('SCN-008-005 TP-04-02: a publisher subprocess given sentinel env and argv emits no personal value', () => {
  const workspace = mkdtempSync(join(tmpdir(), 'rl-publisher-boundary-'));
  try {
    /* The sentinel is injected the two ways a personal value could actually arrive at a generic
     * subprocess — the environment and the argument vector. The publisher is run from a disposable
     * cwd so anything it writes lands there instead of over a tracked public artifact. */
    const run = spawnSync(process.execPath, [resolve(ROOT, 'scripts/brief-publication.mjs'), '--portfolio', SENTINEL], {
      cwd: workspace,
      encoding: 'utf8',
      timeout: 60000,
      env: {
        ...process.env,
        RL_PORTFOLIO_HOLDINGS: SENTINEL,
        RL_PERSONAL_WORKSPACE: SENTINEL
      }
    });

    const emitted = `${run.stdout || ''}${run.stderr || ''}`;
    assert.equal(
      emitted.includes(SENTINEL), false,
      'the publisher must not echo a personal value supplied through env or argv'
    );

    // Anything the run produced in its disposable cwd must also be sentinel-free.
    for (const entry of readdirSync(workspace, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const body = readFileSync(join(entry.parentPath || entry.path, entry.name), 'utf8');
      assert.equal(
        body.includes(SENTINEL), false,
        `a file the publisher wrote must not carry the personal sentinel: ${entry.name}`
      );
    }

    // The control: the sentinel really was reachable by the subprocess, so its absence above is a
    // boundary result rather than an injection that never arrived.
    const echo = spawnSync(process.execPath, ['-e', 'process.stdout.write(String(process.env.RL_PORTFOLIO_HOLDINGS || "") + process.argv.slice(1).join(","))', SENTINEL], {
      cwd: workspace,
      encoding: 'utf8',
      timeout: 30000,
      env: { ...process.env, RL_PORTFOLIO_HOLDINGS: SENTINEL }
    });
    assert.equal(
      (echo.stdout || '').includes(SENTINEL), true,
      'control: a subprocess that DOES read env and argv sees the sentinel, so the publisher result is meaningful'
    );
  } finally {
    rmSync(workspace, { force: true, recursive: true });
  }
});

test('SCN-008-005 TP-04-02: the publisher boundary run mutates no tracked public artifact', () => {
  const status = spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(status.status, 0, 'git status must succeed');

  /* Only this feature's own surface is asserted clean. Other features share this working tree, so
   * asserting a globally empty status would fail for reasons that have nothing to do with the
   * publisher boundary and would make this row unrunnable rather than strict. */
  const publisherDirt = (status.stdout || '')
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter((path) => PUBLISHER_SCRIPTS.includes(path));

  assert.deepEqual(
    publisherDirt, [],
    'no publisher script may be modified by exercising the boundary — the publisher is read-only here'
  );
});
